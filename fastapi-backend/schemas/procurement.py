from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ProcurementSchema(BaseModel):
    id: str
    procurement_no: str
    title: str
    method: str = 'open_tendering'
    status: str = 'planned'
    estimated_amount: float = 0
    fiscal_year: Optional[str] = '२०८१/०८२'
    awarded_to: Optional[str] = None
    bidders_count: int = 0
    
    class Config:
        from_attributes = True

class ProcurementCreate(BaseModel):
    procurement_no: str
    title: str
    description: Optional[str] = None
    method: str = 'open_tendering'
    status: str = 'planned'
    estimated_amount: float = 0
    fiscal_year: Optional[str] = '२०८१/०८२'
    sector: Optional[str] = None
    ward_no: Optional[str] = None
