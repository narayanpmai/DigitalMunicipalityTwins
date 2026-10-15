from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class WasteTransactionSchema(BaseModel):
    id: str
    household_id: str
    weight_kg: float
    total_amount: float
    transaction_type: str = 'deposit'
    created_at: datetime
    
    class Config:
        from_attributes = True

class WasteTransactionCreate(BaseModel):
    household_id: str
    waste_rate_id: Optional[str] = None
    weight_kg: float
    rate_applied: float
    total_amount: float
    transaction_type: str = 'deposit'
