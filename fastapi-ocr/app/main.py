# app/main.py
import os
import subprocess
# CHANGE 1: Import Optional here
from typing import List, Optional 
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from .ocr_utils import extract_text_from_file
from .agent_orchestrator import AgenticReportPipeline
from .rag_engine import chat_with_video


# ============================================================
# SAFE OLLAMA AUTO-STARTUP (WINDOWS + LINUX COMPATIBLE)
# ============================================================
def start_ollama_server():
    """
    Ensures Ollama is running.
    On Windows & Linux this runs non-blocking and prevents
    startup hang or multiple server instances.
    """
    try:
        import requests
        requests.get("http://localhost:11434/api/tags", timeout=2)
        print("✔ Ollama server already running.")
        return
    except Exception:
        print("⧗ Ollama server not running. Starting...")

    # Start ollama serve in background
    subprocess.Popen(
        ["ollama", "serve"],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        shell=True  # required for Windows
    )

    print("✔ Ollama server started in background.")


# ------------------------------------------------------------
# FASTAPI INITIALIZATION
# ------------------------------------------------------------
app = FastAPI(title="OCR + Agentic NLP Microservice")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# START OLLAMA ON FASTAPI STARTUP
# ============================================================
@app.on_event("startup")
async def startup_event():
    start_ollama_server()


# ============================================================
# OCR ENDPOINT (DO NOT MODIFY — EXACTLY AS REQUIRED)
# ============================================================
@app.post("/ocr")
async def ocr_endpoint(file: UploadFile = File(...)):
    filename = file.filename
    file_body = await file.read()

    try:
        text = extract_text_from_file(file_body, filename)
        return {"success": True, "filename": filename, "text": text}
    except Exception as e:
        return {"success": False, "error": str(e)}


# ============================================================
# AGENTIC NLP REPORT ENDPOINT (UPDATED MODEL)
# ============================================================
class ReportRequest(BaseModel):
    user_id: str
    report_type: str
    keyword: Optional[str] = None
    new_file_text: Optional[str] = None  # <--- THIS WAS MISSING!

@app.post("/agentic-report")
async def agentic_report(req: ReportRequest):
    """
    Runs full Agentic AI pipeline.
    Now accepts 'new_file_text' directly from Node.js so we don't rely solely on DB.
    """
    try:
        pipeline = AgenticReportPipeline()
        result = pipeline.run(
            user_id=req.user_id,
            report_type=req.report_type,
            keyword=req.keyword,
            new_file_text=req.new_file_text # Pass the text to the orchestrator
        )

        return JSONResponse(content=result)

    except Exception as e:
        return JSONResponse(
            {"success": False, "error": str(e)},
            status_code=500
        )
class ChatRequest(BaseModel):
    user_id: str
    query: str
    link: Optional[str] = None

class ChatResponse(BaseModel):
    answer: str

@app.post("/chat", response_model=ChatResponse)
def chat_endpoint(payload: ChatRequest):
    try:
        if not payload.query:
            raise HTTPException(status_code=400, detail="Query is required")

        answer = chat_with_video(
            question=payload.query,
            user_id=payload.user_id,
            video_url=payload.link
        )

        return {"answer": answer}

    except HTTPException:
        raise
    except Exception as e:
        print("❌ Python Chat Error:", str(e))
        raise HTTPException(
            status_code=500,
            detail="Failed to generate answer"
        )