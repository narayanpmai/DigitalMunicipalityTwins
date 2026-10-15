from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class BudgetSchema(BaseModel):
    id: str
    title: str
    fiscal_year: str
    type: str = 'capital'
    status: str = 'draft'
    sector: Optional[str] = None
    ward_number: Optional[int] = None
    allocated_amount: float = 0
    released_amount: float = 0
    spent_amount: float = 0
    
    class Config:
        from_attributes = True

class BudgetCreate(BaseModel):
    title: str
    fiscal_year: str
    type: str = 'capital'
    sector: Optional[str] = None
    ward_number: Optional[int] = None
    allocated_amount: float = 0
    source_of_fund: Optional[str] = None
    description: Optional[str] = None
