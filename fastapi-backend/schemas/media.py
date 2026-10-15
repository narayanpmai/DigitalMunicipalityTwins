from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class FileUploadResponse(BaseModel):
    url: str
    filename: str
    size: int
    mimetype: str

class Base64UploadPayload(BaseModel):
    image: str
    filename: Optional[str] = None

class Base64UploadResponse(BaseModel):
    url: str
    filename: str
    size: int

class MediaStatusResponse(BaseModel):
    module: str = 'media'
    status: str = 'operational'
    data: List[Any] = []
    allowedExtensions: List[str] = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.pdf']
