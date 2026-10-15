from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime

class CitizenServiceSchema(BaseModel):
    application_no: str
    service_type: str
    status: str = 'applied'
    applicant_name: str
    ward_number: Optional[int] = None
    fee: float = 0
    certificate_no: Optional[str] = None
    
    class Config:
        from_attributes = True

class CitizenServiceCreate(BaseModel):
    service_type: str
    applicant_name: str
    applicant_phone: Optional[str] = None
    ward_number: Optional[int] = None
    purpose: Optional[str] = None
    form_data: Optional[Dict[str, Any]] = None
