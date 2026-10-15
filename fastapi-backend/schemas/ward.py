from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class WardSchema(BaseModel):
    id: str
    ward_number: int
    name: Optional[str] = None
    ward_chair_name: Optional[str] = None
    chairperson: Optional[str] = None
    phone: Optional[str] = None
    population: Optional[int] = None
    households: Optional[int] = None
    is_active: bool = True
    
    class Config:
        from_attributes = True

class WardCreate(BaseModel):
    ward_number: int
    name: Optional[str] = None
    ward_chair_name: Optional[str] = None
    chairperson: Optional[str] = None
    phone: Optional[str] = None
    population: Optional[int] = None
    households: Optional[int] = None
    is_active: bool = True
