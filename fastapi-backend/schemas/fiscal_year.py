from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

class FiscalYearSchema(BaseModel):
    id: str
    year_np: str
    year_en: str
    is_current: bool = False
    approved_budget_npr: int = 0
    expenditure_so_far_npr: int = 0
    
    class Config:
        from_attributes = True

class FiscalYearCreate(BaseModel):
    year_np: str
    year_en: str
    is_current: bool = False
    start_date_ad: Optional[date] = None
    end_date_ad: Optional[date] = None
    approved_budget_npr: int = 0
    expenditure_so_far_npr: int = 0
    remarks: Optional[str] = None
