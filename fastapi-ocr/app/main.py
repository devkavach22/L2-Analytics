import os
import subprocess
import sys
import traceback
import re
from typing import List, Optional 
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import requests

# ------------------------------------------------------------
# DYNAMIC PATH RESOLUTION
# ------------------------------------------------------------
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

# ------------------------------------------------------------
# MODULAR RAG PIPELINE IMPORTS
# ------------------------------------------------------------
try:
    import config 
    from src import transcript_fetcher
    from src import vector_store
    from src import rag_chain
    from src import utils
    # Important: importing 'collection' from ocr_utils to handle context retrieval
    from .ocr_utils import extract_text_from_file, collection as mongo_ocr_col
    from .agent_orchestrator import AgenticReportPipeline
except ImportError as e:
    print(f"❌ Startup Import Error: {e}")

# ============================================================
# UTILITIES
# ============================================================
def clean_ai_response(text: str) -> str:
    """Normalizes newlines and removes excessive spacing."""
    if not text: return ""
    # Replaces multiple newlines (3 or more) with a standard double newline
    text = re.sub(r'\n{3,}', '\n\n', text)
    # Replaces \n\n with \n if the user specifically wants a compact format
    # (Uncomment below if you want points to be tightly packed)
    # text = text.replace('\n\n', '\n') 
    return text.strip()

def start_ollama_server():
    """Ensures Ollama is running in the background."""
    try:
        requests.get("http://localhost:11434/api/tags", timeout=2)
        print("✔ Ollama server already running.")
    except Exception:
        print("⧗ Ollama server not running. Starting...")
        subprocess.Popen(["ollama", "serve"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, shell=True)

# ------------------------------------------------------------
# FASTAPI INITIALIZATION
# ------------------------------------------------------------
app = FastAPI(title="AI Microservice")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    start_ollama_server()

# ============================================================
# MODELS
# ============================================================
class ChatRequest(BaseModel):
    user_id: str
    query: str
    link: Optional[str] = None

class ChatResponse(BaseModel):
    answer: str

# ============================================================
# ENDPOINTS
# ============================================================

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(payload: ChatRequest):
    """
    Modular RAG pipeline with Context Persistence and Formatting Fixes.
    """
    try:
        if not payload.query:
            raise HTTPException(status_code=400, detail="Query is required")

        # 1. Determine Context ID (Persistence Logic)
        active_context_id = None
        if payload.link:
            active_context_id = utils.extract_video_id(payload.link)
        else:
            # FIX: If no link, find the last YouTube/Document context for this user in MongoDB
            last_record = mongo_ocr_col.find_one(
                {"userId": payload.user_id}, 
                sort=[("createdAt", -1)]
            )
            if last_record:
                # Use extracted video ID or the user_id as context bucket
                active_context_id = utils.extract_video_id(last_record.get("originalFilename", "")) or payload.user_id
        
        # Fallback to user_id if nothing else is found
        context_id = active_context_id if active_context_id else payload.user_id
        print(f"💬 Chat | Context: {context_id} | Link Provided: {bool(payload.link)}")

        # 2. Ingestion (Only if link provided)
        manager = vector_store.VectorStoreManager(context_id)
        if payload.link and active_context_id:
            fetcher = transcript_fetcher.TranscriptFetcher() # Instantiate (no args)
            transcript = fetcher.fetch_transcript(payload.link) # Call correct method
            
            if transcript:
                print(f"📥 Indexing new transcript for {context_id}...")
                manager.create_vector_store(transcript)
            else:
                raise HTTPException(status_code=404, detail="Failed to retrieve video transcript.")
        
        # 3. Load Vector Store
        if not manager.load_vector_store():
            # Try falling back to generic user-level context if video-specific fails
            manager = vector_store.VectorStoreManager(payload.user_id)
            if not manager.load_vector_store():
                 raise HTTPException(status_code=404, detail="No active context found. Please provide a link first.")

        # 4. Retrieval & Generation
        retriever = manager.get_retriever()
        rag = rag_chain.RAGChain(retriever) # Instantiate class
        raw_answer = rag.query(payload.query) # Call query method

        # FIX: Clean the response to remove excessive \n\n characters
        answer = clean_ai_response(raw_answer)

        return {"answer": answer}

    except Exception as e:
        print(f"❌ Chat Error: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
# Add this model to your MODELS section in main.py
class IngestRequest(BaseModel):
    user_id: str
    url: str

# Add this endpoint to your ENDPOINTS section in main.py
@app.post("/ingest")
async def ingest_link(req: IngestRequest):
    """
    Handles link ingestion:
    1. Extracts Video ID.
    2. Fetches Transcript.
    3. Indexes content into ChromaDB.
    """
    try:
        # 1. Extract Video ID
        video_id = utils.extract_video_id(req.url)
        if not video_id:
            raise HTTPException(status_code=400, detail="Invalid YouTube URL")

        # 2. Fetch Transcript
        fetcher = transcript_fetcher.TranscriptFetcher()
        transcript_text = fetcher.fetch_transcript(video_id)
        
        if not transcript_text:
            raise HTTPException(status_code=404, detail="No transcript available for this video.")

        # 3. Create Vector Store in ChromaDB
        # We use video_id as the collection name to isolate the context
        manager = vector_store.VectorStoreManager(video_id)
        manager.create_vector_store(transcript_text)

        print(f"✅ Indexed video {video_id} for user {req.user_id} in ChromaDB")
        
        return {
            "success": True, 
            "video_id": video_id, 
            "message": "Successfully indexed in ChromaDB"
        }

    except Exception as e:
        print(f"❌ Ingestion Error: {str(e)}")
        return JSONResponse({"success": False, "error": str(e)}, status_code=500)
## ============================================================
# # AGENTIC NLP REPORT ENDPOINT (UPDATED MODEL)
# # ============================================================
class ReportRequest(BaseModel):
    user_id: str
    report_type: str
    keyword: Optional[str] = None
    new_file_text: Optional[str] = None

@app.post("/agentic-report")
async def agentic_report(req: ReportRequest):
    """
    Runs full Agentic AI pipeline.
    """
    try:
        pipeline = AgenticReportPipeline()
        result = pipeline.run(
            user_id=req.user_id,
            report_type=req.report_type,
            keyword=req.keyword,
            new_file_text=req.new_file_text
        )
        return JSONResponse(content=result)

    except Exception as e:
        traceback.print_exc()
        return JSONResponse(
            {"success": False, "error": str(e)},
            status_code=500
        )

# (OCR and agentic-report endpoints remain as they were)

# # app/main.py
# import os
# import subprocess
# from typing import List, Optional 
# from fastapi import FastAPI, File, UploadFile, HTTPException
# from fastapi.middleware.cors import CORSMiddleware
# from fastapi.responses import JSONResponse
# from pydantic import BaseModel

# from .ocr_utils import extract_text_from_file
# from .agent_orchestrator import AgenticReportPipeline
# from .rag_engine import chat_with_video


# # ============================================================
# # SAFE OLLAMA AUTO-STARTUP (WINDOWS + LINUX COMPATIBLE)
# # ============================================================
# def start_ollama_server():
#     """
#     Ensures Ollama is running.
#     On Windows & Linux this runs non-blocking and prevents
#     startup hang or multiple server instances.
#     """
#     try:
#         import requests
#         requests.get("http://localhost:11434/api/tags", timeout=2)
#         print("✔ Ollama server already running.")
#         return
#     except Exception:
#         print("⧗ Ollama server not running. Starting...")

#     # Start ollama serve in background
#     subprocess.Popen(
#         ["ollama", "serve"],
#         stdout=subprocess.DEVNULL,
#         stderr=subprocess.DEVNULL,
#         shell=True  # required for Windows
#     )

#     print("✔ Ollama server started in background.")


# # ------------------------------------------------------------
# # FASTAPI INITIALIZATION
# # ------------------------------------------------------------
# app = FastAPI(title="OCR + Agentic NLP Microservice")

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"], 
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )


# # ============================================================
# # START OLLAMA ON FASTAPI STARTUP
# # ============================================================
# @app.on_event("startup")
# async def startup_event():
#     start_ollama_server()


# # ============================================================
# # OCR ENDPOINT (DO NOT MODIFY — EXACTLY AS REQUIRED)
# # ============================================================
# @app.post("/ocr")
# async def ocr_endpoint(file: UploadFile = File(...)):
#     filename = file.filename
#     file_body = await file.read()

#     try:
#         text = extract_text_from_file(file_body, filename)
#         return {"success": True, "filename": filename, "text": text}
#     except Exception as e:
#         return {"success": False, "error": str(e)}


# # ============================================================
# # AGENTIC NLP REPORT ENDPOINT (UPDATED MODEL)
# # ============================================================
# class ReportRequest(BaseModel):
#     user_id: str
#     report_type: str
#     keyword: Optional[str] = None
#     new_file_text: Optional[str] = None

# @app.post("/agentic-report")
# async def agentic_report(req: ReportRequest):
#     """
#     Runs full Agentic AI pipeline.
#     Now accepts 'new_file_text' directly from Node.js so we don't rely solely on DB.
#     """
#     try:
#         pipeline = AgenticReportPipeline()
#         result = pipeline.run(
#             user_id=req.user_id,
#             report_type=req.report_type,
#             keyword=req.keyword,
#             new_file_text=req.new_file_text
#         )

#         return JSONResponse(content=result)

#     except Exception as e:
#         return JSONResponse(
#             {"success": False, "error": str(e)},
#             status_code=500
#         )

# class ChatRequest(BaseModel):
#     user_id: str
#     query: str
#     link: Optional[str] = None

# class ChatResponse(BaseModel):
#     answer: str

# @app.post("/chat", response_model=ChatResponse)
# def chat_endpoint(payload: ChatRequest):
#     try:
#         if not payload.query:
#             raise HTTPException(status_code=400, detail="Query is required")

#         answer = chat_with_video(
#             question=payload.query,
#             user_id=payload.user_id,
#             video_url=payload.link
#         )

#         return {"answer": answer}

#     except HTTPException:
#         raise
#     except Exception as e:
#         print("❌ Python Chat Error:", str(e))
#         raise HTTPException(
#             status_code=500,
#             detail="Failed to generate answer"
#         )

# # app/main.py
# import os
# import subprocess
# # CHANGE 1: Import Optional here
# from typing import List, Optional 
# from fastapi import FastAPI, File, UploadFile
# from fastapi.middleware.cors import CORSMiddleware
# from fastapi.responses import JSONResponse
# from pydantic import BaseModel

# from .ocr_utils import extract_text_from_file
# # from .agent_orchestrator import AgenticReportPipeline
# from .agent_orchestrator import AgenticReportPipeline
# from fastapi import HTTPException
# from .rag_engine import chat_with_video


# # ============================================================
# # SAFE OLLAMA AUTO-STARTUP (WINDOWS + LINUX COMPATIBLE)
# # ============================================================
# def start_ollama_server():
#     """
#     Ensures Ollama is running.
#     On Windows & Linux this runs non-blocking and prevents
#     startup hang or multiple server instances.
#     """
#     try:
#         import requests
#         requests.get("http://localhost:11434/api/tags", timeout=2)
#         print("✔ Ollama server already running.")
#         return
#     except Exception:
#         print("⧗ Ollama server not running. Starting...")

#     # Start ollama serve in background
#     subprocess.Popen(
#         ["ollama", "serve"],
#         stdout=subprocess.DEVNULL,
#         stderr=subprocess.DEVNULL,
#         shell=True  # required for Windows
#     )

#     print("✔ Ollama server started in background.")


# # ------------------------------------------------------------
# # FASTAPI INITIALIZATION
# # ------------------------------------------------------------
# app = FastAPI(title="OCR + Agentic NLP Microservice")

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"], 
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )


# # ============================================================
# # START OLLAMA ON FASTAPI STARTUP
# # ============================================================
# @app.on_event("startup")
# async def startup_event():
#     start_ollama_server()


# # ============================================================
# # OCR ENDPOINT (DO NOT MODIFY — EXACTLY AS REQUIRED)
# # ============================================================
# @app.post("/ocr")
# async def ocr_endpoint(file: UploadFile = File(...)):
#     filename = file.filename
#     file_body = await file.read()

#     try:
#         text = extract_text_from_file(file_body, filename)
#         return {"success": True, "filename": filename, "text": text}
#     except Exception as e:
#         return {"success": False, "error": str(e)}


# # ============================================================
# # AGENTIC NLP REPORT ENDPOINT (UPDATED MODEL)
# # ============================================================
# class ReportRequest(BaseModel):
#     user_id: str
#     report_type: str
#     keyword: Optional[str] = None
#     new_file_text: Optional[str] = None  # <--- THIS WAS MISSING!

# @app.post("/agentic-report")
# async def agentic_report(req: ReportRequest):
#     """
#     Runs full Agentic AI pipeline.
#     Now accepts 'new_file_text' directly from Node.js so we don't rely solely on DB.
#     """
#     try:
#         pipeline = AgenticReportPipeline()
#         result = pipeline.run(
#             user_id=req.user_id,
#             report_type=req.report_type,
#             keyword=req.keyword,
#             new_file_text=req.new_file_text # Pass the text to the orchestrator
#         )

#         return JSONResponse(content=result)

#     except Exception as e:
#         return JSONResponse(
#             {"success": False, "error": str(e)},
#             status_code=500
#         )
# class ChatRequest(BaseModel):
#     user_id: str
#     query: str
#     link: Optional[str] = None

# class ChatResponse(BaseModel):
#     answer: str

# @app.post("/chat", response_model=ChatResponse)
# def chat_endpoint(payload: ChatRequest):
#     try:
#         if not payload.query:
#             raise HTTPException(status_code=400, detail="Query is required")

#         answer = chat_with_video(
#             question=payload.query,
#             user_id=payload.user_id,
#             video_url=payload.link
#         )

#         return {"answer": answer}

#     except HTTPException:
#         raise
#     except Exception as e:
#         print("❌ Python Chat Error:", str(e))
#         raise HTTPException(
#             status_code=500,
#             detail="Failed to generate answer"
#         )