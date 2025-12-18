# app/main.py
import os
import io
import tempfile
from typing import List
from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from .ocr_utils import extract_text_from_file

app = FastAPI(title="EasyOCR Microservice")

# Allow CORS from your Node backend (adjust origins as needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/ocr")
# @app.post("/ocr")
async def ocr_endpoint(file: UploadFile = File(...)):
    filename = file.filename
    body = await file.read()
    text = extract_text_from_file(body, filename)
    return {"success": True, "filename": filename, "text": text}
# async def ocr_endpoint(files: List[UploadFile] = File(...), perform_layout: bool = Form(False)):
#     """
#     Accepts one or more files. Returns JSON with text for each file.
#     - files: list of files (image/pdf/docx/txt)
#     - perform_layout: reserved – currently not used, but you can ask for structured output later
#     """
#     results = []

#     for uploaded in files:
#         filename = uploaded.filename or "uploaded"
#         ext = os.path.splitext(filename)[1].lower()
#         try:
#             body = await uploaded.read()
#             text = await extract_text_from_file(body, filename)
#             results.append({"filename": filename, "ext": ext, "text": text})
#         except Exception as e:
#             # capture error per-file but continue
#             results.append({"filename": filename, "ext": ext, "error": str(e), "text": ""})

#     return JSONResponse({"success": True, "results": results})
