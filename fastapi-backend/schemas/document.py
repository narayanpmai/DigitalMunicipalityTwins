from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class DocumentSchema(BaseModel):
    id: str
    title: str
    fiscal_year: Optional[str] = None
    file_name: str
    file_url: str
    status: str = 'Pending Verification'
    uploaded_at: datetime
    
    class Config:
        from_attributes = True

class DocumentCreate(BaseModel):
    title: str
    fiscal_year: Optional[str] = None
    file_name: str
    file_url: str
    status: str = 'Pending Verification'
