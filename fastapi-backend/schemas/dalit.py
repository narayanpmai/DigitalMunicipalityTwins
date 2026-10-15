from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime

class DalitRecordSchema(BaseModel):
    id: Any
    ward_number: Optional[int] = None
    fiscal_year: str
    total_dalit_population: Optional[int] = None
    dalit_households: Optional[int] = None
    
    class Config:
        from_attributes = True

class DalitRecordCreate(BaseModel):
    ward_number: Optional[int] = None
    fiscal_year: str
    total_beneficiaries: Optional[int] = None
    total_households: Optional[int] = None
    total_dalit_population: Optional[int] = None
    dalit_households: Optional[int] = None
    dalit_students: Optional[int] = None
    scholarship_recipients: Optional[int] = None
    employed_in_government: Optional[int] = None
    discrimination_cases: Optional[int] = None
    programs: Optional[str] = None
    challenges: Optional[str] = None
    achievements: Optional[str] = None
    data_collected_by: Optional[str] = None
