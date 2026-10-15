from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class AiCameraBase(BaseModel):
    camera_id: str
    name: str
    type: str
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    status: str = 'Active'
    today_visitor_count: int = 0
    total_visitor_count: int = 0
    stream_url: Optional[str] = None
    last_ping: Optional[datetime] = None

class AiCameraCreate(AiCameraBase):
    pass

class AiCameraUpdate(BaseModel):
    camera_id: Optional[str] = None
    name: Optional[str] = None
    type: Optional[str] = None
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    status: Optional[str] = None
    today_visitor_count: Optional[int] = None
    total_visitor_count: Optional[int] = None
    stream_url: Optional[str] = None
    last_ping: Optional[datetime] = None

class AiCameraSchema(AiCameraBase):
    id: str
    tenant_id: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    @classmethod
    def model_validate(cls, obj, *args, **kwargs):
        if hasattr(obj, 'id') and obj.id is not None:
            obj.id = str(obj.id)
        return super().model_validate(obj, *args, **kwargs)

    class Config:
        from_attributes = True

class CameraStats(BaseModel):
    todayTotal: int
    allTimeTotal: int

class CameraPingPayload(BaseModel):
    cameraId: str
    count: int
