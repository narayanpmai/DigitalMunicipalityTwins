from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime

class PlanSchema(BaseModel):
    id: str
    title: str
    type: str
    status: str
    fiscal_year: Optional[str] = None
    estimated_budget: Optional[float] = None
    sector: Optional[str] = None
    
    class Config:
        from_attributes = True

class PlanCreate(BaseModel):
    title: str
    title_en: Optional[str] = None
    type: str = 'annual'
    status: str = 'draft'
    fiscal_year: Optional[str] = None
    start_year: Optional[int] = None
    end_year: Optional[int] = None
    description: Optional[str] = None
    objectives: Optional[str] = None
    estimated_budget: Optional[float] = None
    sector: Optional[str] = None
    ward_number: Optional[int] = None
