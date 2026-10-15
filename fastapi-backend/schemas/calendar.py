from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class EventCalendarBase(BaseModel):
    title: str
    date: int
    month: str
    event_type: str
    time: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None

class EventCalendarCreate(EventCalendarBase):
    pass

class EventCalendarResponse(EventCalendarBase):
    id: str
    tenant_id: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True
