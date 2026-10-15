from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class VitalEventSchema(BaseModel):
    registration_no: str
    event_type: str = 'जन्म दर्ता'
    status: str = 'आवेदन प्राप्त'
    person_name: str
    gender: Optional[str] = None
    event_date_bs: Optional[str] = None
    applicant_name: str
    applicant_phone: Optional[str] = None
    ward_number: int = 1
    
    class Config:
        from_attributes = True

class VitalEventCreate(BaseModel):
    event_type: str = 'जन्म दर्ता'
    person_name: str
    gender: Optional[str] = None
    event_date_bs: Optional[str] = None
    event_place: Optional[str] = None
    father_name: Optional[str] = None
    mother_name: Optional[str] = None
    applicant_name: str
    applicant_phone: Optional[str] = None
    ward_number: int = 1
