from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class DisasterSchema(BaseModel):
    id: str
    title: str
    type: str
    severity: str
    status: str
    ward_number: Optional[int] = None
    affected_households: int
    affected_people: int
    human_casualties: int
    
    class Config:
        from_attributes = True

class DisasterCreate(BaseModel):
    title: str
    type: str
    severity: str = 'medium'
    status: str = 'active'
    description: str
    lat: Optional[float] = None
    lng: Optional[float] = None
    ward_number: Optional[int] = None
    reporter_name: Optional[str] = None
    reporter_phone: Optional[str] = None
    incident_date_bs: Optional[str] = None
    affected_households: int = 0
    affected_people: int = 0
    human_casualties: int = 0
    injured_count: int = 0
    estimated_loss_npr: float = 0.0
    relief_status: str = 'आवश्यक'
    relief_materials: Optional[str] = None
    rescue_team: Optional[str] = None
