# app/rag_engine.py

import os
import asyncio
from pymongo import MongoClient
from dotenv import load_dotenv

# ---------------- EXISTING IMPORTS (UNCHANGED) ----------------
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_mongodb import MongoDBAtlasVectorSearch

# ---------------- NEW IMPORTS (RAG CHAIN ALIGNMENT) ----------------
from langchain_huggingface import ChatHuggingFace, HuggingFaceEndpoint
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser

load_dotenv()

# =========================================================
# 1. CONFIGURATION
# =========================================================
MONGO_URL = os.getenv("MONGO_URL")
DB_NAME = os.getenv("MONGO_DB_NAME")
COLLECTION_NAME = "vector_store"
INDEX_NAME = "vector_index"

HUGGINGFACE_API_TOKEN = os.getenv("HUGGINGFACE_API_TOKEN")
HUGGINGFACE_LLM_MODEL = os.getenv(
    "HUGGINGFACE_LLM_MODEL",
    "meta-llama/Llama-3.1-8B-Instruct"
)
HUGGINGFACE_EMBEDDING_MODEL = os.getenv(
    "HUGGINGFACE_EMBEDDING_MODEL",
    "intfloat/e5-small-v2"
)

LLM_TEMPERATURE = float(os.getenv("LLM_TEMPERATURE", 0.2))
LLM_MAX_NEW_TOKENS = int(os.getenv("LLM_MAX_NEW_TOKENS", 512))

client = MongoClient(MONGO_URL)
db = client[DB_NAME]
vector_collection = db[COLLECTION_NAME]

# =========================================================
# 2. EMBEDDINGS & VECTOR STORE (UNCHANGED)
# =========================================================
embedding_model = HuggingFaceEmbeddings(
    model_name=HUGGINGFACE_EMBEDDING_MODEL
)

def get_vector_store():
    return MongoDBAtlasVectorSearch(
        collection=vector_collection,
        embedding=embedding_model,
        index_name=INDEX_NAME,
        relevance_score_fn="cosine",
    )

# =========================================================
# 3. STORAGE (UNCHANGED)
# =========================================================
def store_embeddings(text_content, metadata):
    if not text_content or len(text_content.strip()) < 10:
        return None

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=100,
        separators=["\n\n", "\n", ".", " ", ""]
    )

    docs = splitter.create_documents(
        [text_content],
        metadatas=[metadata]
    )

    store = get_vector_store()
    store.add_documents(docs)
    return True

async def store_embeddings_async(text_content, metadata):
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(
        None, store_embeddings, text_content, metadata
    )

# =========================================================
# 4. RETRIEVAL (UNCHANGED)
# =========================================================
def retrieve_context(query, user_id, source=None, k=5):
    store = get_vector_store()

    filter_query = {"user_id": {"$eq": user_id}}

    if source:
        filter_query["source"] = {"$eq": source}

    docs = store.similarity_search(
        query,
        k=k,
        pre_filter=filter_query
    )

    if not docs:
        return ""

    return "\n\n".join(d.page_content for d in docs)

async def retrieve_context_async(query, user_id, source=None, k=5):
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(
        None, retrieve_context, query, user_id, source, k
    )

# =========================================================
# 5. LLM INITIALIZATION (UNCHANGED)
# =========================================================
def _initialize_llm():
    if not HUGGINGFACE_API_TOKEN:
        raise ValueError("HUGGINGFACE_API_TOKEN missing")

    endpoint = HuggingFaceEndpoint(
        repo_id=HUGGINGFACE_LLM_MODEL,
        huggingfacehub_api_token=HUGGINGFACE_API_TOKEN,
        temperature=LLM_TEMPERATURE,
        max_new_tokens=LLM_MAX_NEW_TOKENS,
    )
    return ChatHuggingFace(llm=endpoint)

# =========================================================
# 6. ✅ NEW: VIDEO-AWARE RAG CHAT (ADDED)
# =========================================================
def chat_with_video(
    question: str,
    user_id: str,
    video_url: str,
    answer_language: str = "en",
    answer_tone: str = "neutral",
    answer_style: str = "auto",
    k: int = 5,
):
    """
    Chat with a specific video (URL or ID-based context).
    Matches behavior of rag_chain.py + app.py
    """

    # Step 1: Retrieve video-specific context
    context = retrieve_context(
        query=question,
        user_id=user_id,
        source=video_url,
        k=k,
    )

    if not context:
        return "I don't have enough information from this video to answer that."

    # Step 2: Initialize LLM
    llm = _initialize_llm()

    # Step 3: Prompt (Aligned with rag_chain.py)
    prompt = PromptTemplate(
        template="""
You are a helpful assistant that answers questions based ONLY on YouTube video transcripts.

Rules:
- Use ONLY the provided context
- If information is missing, say so clearly
- Do NOT hallucinate

Language: {language}
Tone: {tone}
Style: {style}

Context:
{context}

Question:
{question}

Answer:
""",
        input_variables=[
            "context",
            "question",
            "language",
            "tone",
            "style",
        ],
    )

    chain = prompt | llm | StrOutputParser()

    return chain.invoke({
        "context": context,
        "question": question,
        "language": answer_language,
        "tone": answer_tone,
        "style": answer_style,
    })

# =========================================================
# 7. ASYNC VERSION (OPTIONAL ORCHESTRATION)
# =========================================================
async def chat_with_video_async(*args, **kwargs):
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(
        None, chat_with_video, *args, **kwargs
    )



# # app/rag_engine.py
# import os
# from pymongo import MongoClient
# from langchain_huggingface import HuggingFaceEmbeddings
# from langchain_text_splitters import RecursiveCharacterTextSplitter
# from langchain_mongodb import MongoDBAtlasVectorSearch
# from dotenv import load_dotenv

# load_dotenv()

# MONGO_URL = os.getenv("MONGO_URL")
# DB_NAME = os.getenv("MONGO_DB_NAME")
# COLLECTION_NAME = "vector_store"
# INDEX_NAME = "vector_index"

# client = MongoClient(MONGO_URL)
# db = client[DB_NAME]
# vector_collection = db[COLLECTION_NAME]

# # Initialize Embeddings
# embedding_model = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

# def get_vector_store():
#     return MongoDBAtlasVectorSearch(
#         collection=vector_collection,
#         embedding=embedding_model,
#         index_name=INDEX_NAME,
#         relevance_score_fn="cosine",
#     )

# def store_embeddings(text_content, metadata):
#     if not text_content or len(text_content.strip()) < 10:
#         return None

#     print("🧩 RAG: Splitting text for vector storage...")
#     text_splitter = RecursiveCharacterTextSplitter(
#         chunk_size=1000,
#         chunk_overlap=200,
#         separators=["\n\n", "\n", ".", " ", ""]
#     )
#     docs = text_splitter.create_documents([text_content], metadatas=[metadata])

#     vector_store = get_vector_store()
#     vector_store.add_documents(docs)
#     print(f"✔ RAG: Stored {len(docs)} vector chunks in MongoDB.")
#     return True

# def retrieve_context(query, user_id, k=5):
#     vector_store = get_vector_store()
    
#     # Filter by User ID for security
#     results = vector_store.similarity_search(
#         query, 
#         k=k,
#         pre_filter={"user_id": {"$eq": user_id}} 
#     )
    
#     if not results:
#         return ""

#     context = "\n\n".join([doc.page_content for doc in results])
#     return context