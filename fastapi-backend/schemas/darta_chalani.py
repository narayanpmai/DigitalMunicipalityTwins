from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class DartaSchema(BaseModel):
    id: str
    registration_no: str
    fiscal_year: str
    registered_date: str
    sender_name: str
    subject: str
    classification: str = 'साधारण'
    assigned_branch: Optional[str] = 'प्रशासन शाखा'
    status: str = 'दर्ता भएको'
    
    class Config:
        from_attributes = True

class DartaCreate(BaseModel):
    registration_no: str
    registered_date: str
    sender_name: str
    sender_address: Optional[str] = None
    sender_contact: Optional[str] = None
    subject: str
    classification: str = 'साधारण'
    assigned_branch: Optional[str] = 'प्रशासन शाखा'
    remarks: Optional[str] = None
