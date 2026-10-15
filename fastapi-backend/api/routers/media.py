from fastapi import APIRouter, UploadFile, File, HTTPException, Body
from typing import Optional, Dict, Any
import os
import re
import time
import base64
from schemas.media import (
    FileUploadResponse,
    Base64UploadPayload,
    Base64UploadResponse,
    MediaStatusResponse
)

router = APIRouter(
    prefix="/api/v1/media",
    tags=["Media & File Uploads"]
)

ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.pdf'}
ALLOWED_MIME_TYPES = {
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml',
    'application/pdf'
}

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'uploads')
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("", response_model=MediaStatusResponse)
def get_media_status():
    return MediaStatusResponse(
        module="media",
        status="operational",
        data=[],
        allowedExtensions=list(ALLOWED_EXTENSIONS)
    )

@router.post("/upload", response_model=FileUploadResponse)
async def upload_file(file: UploadFile = File(...)):
    raw_name = file.filename or "media.jpg"
    _, ext = os.path.splitext(raw_name)
    ext_lower = ext.lower()
    
    if ext_lower not in ALLOWED_EXTENSIONS or (file.content_type and file.content_type not in ALLOWED_MIME_TYPES):
        raise HTTPException(
            status_code=400,
            detail="अमान्य फाइल प्रकार! केवल तस्बिर (.jpg, .png, .webp, .svg) र PDF फाइलहरू मात्र स्वीकार गरिन्छ।"
        )
        
    contents = await file.read()
    if len(contents) > 15 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="फाइल आकार १५ MB भन्दा बढी हुन सक्दैन।")
        
    unique_suffix = f"{int(time.time() * 1000)}-{os.urandom(4).hex()}"
    filename = f"media-{unique_suffix}{ext_lower}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    with open(file_path, "wb") as f:
        f.write(contents)
        
    return FileUploadResponse(
        url=f"/uploads/{filename}",
        filename=filename,
        size=len(contents),
        mimetype=file.content_type or "application/octet-stream"
    )

@router.post("/upload-base64", response_model=Base64UploadResponse)
def upload_base64(payload: Base64UploadPayload):
    if not payload.image:
        raise HTTPException(status_code=400, detail="तस्बिर डेटा प्राप्त भएन")
        
    match = re.match(r"^data:([A-Za-z-+\/]+);base64,(.+)$", payload.image)
    if not match:
        raise HTTPException(status_code=400, detail="अमान्य base64 डेटा ढाँचा")
        
    mime_type = match.group(1).lower()
    if mime_type not in ["image/jpeg", "image/png", "image/webp"]:
        raise HTTPException(status_code=400, detail="अमान्य तस्बिर प्रकार! केवल JPG/PNG/WEBP base64 स्वीकार गरिन्छ।")
        
    try:
        data_bytes = base64.b64decode(match.group(2))
    except Exception:
        raise HTTPException(status_code=400, detail="base64 डिकोड गर्न सकिएन")
        
    if len(data_bytes) > 15 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="तस्बिर आकार १५ MB भन्दा बढी हुन सक्दैन।")
        
    ext = ".png" if "png" in mime_type else (".webp" if "webp" in mime_type else ".jpg")
    unique_name = f"scan-{int(time.time() * 1000)}-{os.urandom(3).hex()}{ext}"
    filename = payload.filename or unique_name
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    with open(file_path, "wb") as f:
        f.write(data_bytes)
        
    return Base64UploadResponse(
        url=f"/uploads/{filename}",
        filename=filename,
        size=len(data_bytes)
    )
