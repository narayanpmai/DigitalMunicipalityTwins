from pydantic import BaseModel
from typing import Optional, Union
from uuid import UUID
from datetime import date

class ContractSchema(BaseModel):
    id: Union[str, UUID]
    contract_no: str
    title: str
    contractor_name: Optional[str] = None
    status: str
    contract_amount: float
    paid_amount: float
    progress_percent: int
    
    class Config:
        from_attributes = True

class ContractCreate(BaseModel):
    contract_no: str
    title: str
    contractor_name: Optional[str] = None
    contractor_phone: Optional[str] = None
    contractor_pan: Optional[str] = None
    status: str = 'draft'
    contract_amount: float = 0.0
    paid_amount: float = 0.0
    fiscal_year: Optional[str] = None
    project_id: Optional[str] = None
    sector: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    completion_date: Optional[date] = None
    progress_percent: int = 0
    description: Optional[str] = None
    document_url: Optional[str] = None
