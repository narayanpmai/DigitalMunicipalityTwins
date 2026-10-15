from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class InfrastructureSchema(BaseModel):
    id: str
    name: str
    type: str
    status: str = 'planned'
    ward_number: Optional[int] = None
    construction_cost: Optional[float] = None
    
    class Config:
        from_attributes = True

class InfrastructureCreate(BaseModel):
    name: str
    type: str
    status: str = 'planned'
    ward_number: Optional[int] = None
    construction_cost: Optional[float] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
