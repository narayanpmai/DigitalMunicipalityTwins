from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ComplaintSchema(BaseModel):
    complaint_no: str
    title: str
    description: str
    category: str = 'other'
    status: str = 'pending'
    complainant_name: Optional[str] = None
    ward_number: Optional[int] = None
    priority: Optional[str] = None
    channel: str = 'web'
    
    class Config:
        from_attributes = True

class ComplaintCreate(BaseModel):
    title: str
    description: str
    category: str = 'other'
    complainant_name: Optional[str] = None
    complainant_phone: Optional[str] = None
    is_anonymous: bool = False
    ward_number: Optional[int] = None
    priority: Optional[str] = 'medium'
    channel: str = 'web'
