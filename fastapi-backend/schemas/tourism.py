from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class DestinationSchema(BaseModel):
    id: str
    name: str
    category: str
    description: str
    best_season: Optional[str] = None
    image_url: Optional[str] = None
    
    class Config:
        from_attributes = True

class DestinationCreate(BaseModel):
    name: str
    name_en: Optional[str] = None
    ward_no: Optional[int] = None
    category: str
    description: str
    best_season: Optional[str] = None
    highlights: Optional[List[str]] = None
