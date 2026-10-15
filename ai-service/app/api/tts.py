import os
import hashlib
from pathlib import Path
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from gtts import gTTS

router = APIRouter(prefix="/tts", tags=["Voice Cloning"])

CACHE_DIR = Path("/app/cache/tts") if os.path.exists("/app") else Path("cache/tts")
CACHE_DIR.mkdir(parents=True, exist_ok=True)

class TTSRequest(BaseModel):
    text: str

@router.post("/generate")
async def generate_tts(request: TTSRequest):
    """
    Generate speech from text using Google Translate TTS (Free fallback).
    """
    text = request.text
    if not text or not text.strip():
        raise HTTPException(status_code=400, detail="Text is required")
        
    # Create a unique filename based on the text hash to implement caching
    text_hash = hashlib.md5(text.encode("utf-8")).hexdigest()
    output_file = CACHE_DIR / f"google_ne_{text_hash}.mp3"
    
    # Check cache first
    if output_file.exists():
        return FileResponse(output_file, media_type="audio/mpeg")
        
    try:
        # Use gTTS to fetch audio for Nepali (ne)
        tts = gTTS(text=text, lang="ne", slow=False)
        tts.save(str(output_file))
        
        return FileResponse(output_file, media_type="audio/mpeg")
        
    except Exception as e:
        print(f"TTS Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
