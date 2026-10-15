from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime

class DisabilityRecordSchema(BaseModel):
    id: Any
    ward_number: Optional[int] = None
    fiscal_year: str
    total_beneficiaries: Optional[int] = None
    allowance_recipients: Optional[int] = None
    total_allowance_amount: Optional[float] = None
    
    class Config:
        from_attributes = True


class DisabilityRecordCreate(BaseModel):
    ward_number: Optional[int] = None
    fiscal_year: str
    total_beneficiaries: Optional[int] = None
    total_households: Optional[int] = None
    physical_disability: Optional[int] = None
    visual_impairment: Optional[int] = None
    hearing_impairment: Optional[int] = None
    intellectual_disability: Optional[int] = None
    multiple_disabilities: Optional[int] = None
    allowance_recipients: Optional[int] = None
    total_allowance_amount: Optional[float] = None
    in_school: Optional[int] = None
    employed: Optional[int] = None
    programs: Optional[str] = None
    challenges: Optional[str] = None
    achievements: Optional[str] = None
    data_collected_by: Optional[str] = None
