from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

class ProjectSchema(BaseModel):
    project_code: str
    name: str
    ward_number: int
    sector: str
    status: str = 'planned'
    budget: float
    fiscal_year: Optional[str] = None
    progress_percentage: float = 0
    is_public: bool = True
    marfat: str = 'उपभोक्ता समिति'
    
    class Config:
        from_attributes = True

class ProjectCreate(BaseModel):
    name: str
    ward_number: int
    sector: str
    status: str = 'planned'
    budget: float
    fiscal_year: Optional[str] = None
    marfat: str = 'उपभोक्ता समिति'
