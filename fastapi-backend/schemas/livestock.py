from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime

class LivestockSchema(BaseModel):
    id: Any
    ward_number: Optional[int] = None
    fiscal_year: str
    cattle: Optional[int] = 0
    buffaloes: Optional[int] = 0
    goats: Optional[int] = 0
    poultry: Optional[int] = 0
    
    class Config:
        from_attributes = True


class LivestockCreate(BaseModel):
    ward_number: Optional[int] = None
    fiscal_year: str
    cattle: Optional[int] = 0
    buffaloes: Optional[int] = 0
    goats: Optional[int] = 0
    sheep: Optional[int] = 0
    pigs: Optional[int] = 0
    poultry: Optional[int] = 0
    yaks: Optional[int] = 0
    milk_production_liters: Optional[float] = 0.0
    meat_production_kg: Optional[float] = 0.0
    wool_production_kg: Optional[float] = 0.0
    total_households_rearing: Optional[int] = 0
    notes: Optional[str] = None
