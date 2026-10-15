from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime

class WomenChildrenSchema(BaseModel):
    id: Any
    ward_number: Optional[int] = None
    fiscal_year: str
    pregnant_women: Optional[int] = None
    children_under_5: Optional[int] = None
    
    class Config:
        from_attributes = True


class WomenChildrenCreate(BaseModel):
    ward_number: Optional[int] = None
    fiscal_year: str
    total_beneficiaries: Optional[int] = None
    total_households: Optional[int] = None
    pregnant_women: Optional[int] = None
    lactating_mothers: Optional[int] = None
    children_under_5: Optional[int] = None
    children_in_school: Optional[int] = None
    malnourished_children: Optional[int] = None
    women_entrepreneurs: Optional[int] = None
    child_marriage_cases: Optional[int] = None
    domestic_violence_cases: Optional[int] = None
    programs: Optional[str] = None
    challenges: Optional[str] = None
    achievements: Optional[str] = None
    data_collected_by: Optional[str] = None
