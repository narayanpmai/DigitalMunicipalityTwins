from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime

class SeniorCitizenSchema(BaseModel):
    id: Any
    ward_number: Optional[int] = None
    fiscal_year: str
    total_senior_citizens: Optional[int] = None
    total_allowance_amount: Optional[float] = None
    
    class Config:
        from_attributes = True


class SeniorCitizenCreate(BaseModel):
    ward_number: Optional[int] = None
    fiscal_year: str
    total_beneficiaries: Optional[int] = None
    total_households: Optional[int] = None
    total_senior_citizens: Optional[int] = None
    senior_citizens_above_75: Optional[int] = None
    allowance_recipients: Optional[int] = None
    total_allowance_amount: Optional[float] = None
    senior_citizens_with_disability: Optional[int] = None
    senior_citizens_alone: Optional[int] = None
    programs: Optional[str] = None
    challenges: Optional[str] = None
    achievements: Optional[str] = None
    data_collected_by: Optional[str] = None
