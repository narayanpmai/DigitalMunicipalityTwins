from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class SensorBase(BaseModel):
    sensor_id: str
    name: str
    type: str = Field(..., description="'river_level' | 'rain_gauge' | 'landslide_motion' | 'weather_station'")
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    last_value: float = 0.0
    unit: Optional[str] = None
    danger_threshold: Optional[float] = None
    status: str = 'Normal'
    last_ping: Optional[datetime] = None

class SensorCreate(SensorBase):
    pass

class SensorUpdate(BaseModel):
    sensor_id: Optional[str] = None
    name: Optional[str] = None
    type: Optional[str] = None
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    last_value: Optional[float] = None
    unit: Optional[str] = None
    danger_threshold: Optional[float] = None
    status: Optional[str] = None
    last_ping: Optional[datetime] = None

from typing import Optional, Any
from datetime import datetime

class SensorSchema(SensorBase):
    id: Any
    tenant_id: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class TelemetryPayload(BaseModel):
    sensorId: str
    value: float
