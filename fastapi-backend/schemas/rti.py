from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class RtiRequestSchema(BaseModel):
    id: str
    request_no: str
    applicant_name: str
    subject: str
    status: str
    assigned_officer: str
    
    class Config:
        from_attributes = True

class RtiRequestCreate(BaseModel):
    request_no: str
    applicant_name: str
    applicant_phone: Optional[str] = None
    applicant_email: Optional[str] = None
    applicant_address: Optional[str] = None
    subject: str
    requested_information: str
    purpose: Optional[str] = None
    format: str = 'electronic'
    status: str = 'pending'
    assigned_officer: str = 'सूचना अधिकारी (Information Officer)'
    assigned_department: str = 'प्रशासन तथा आन्तरिक व्यवस्थापन शाखा'
    filing_date_bs: Optional[str] = None
    legal_deadline_bs: Optional[str] = None
    action_taken_notes: Optional[str] = None
    attachment_url: Optional[str] = None
    tracking_token: Optional[str] = None
