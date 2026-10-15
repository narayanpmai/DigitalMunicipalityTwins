from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class WeatherStationBase(BaseModel):
    station_id: str
    name: str
    temp: float
    rainfall24h: float
    rainfall1h: float
    humidity: float
    status: str
    forecast: Optional[str] = None

class WeatherStationCreate(WeatherStationBase):
    pass

class WeatherStationResponse(WeatherStationBase):
    id: str
    tenant_id: Optional[str] = None
    last_updated: datetime
    
    class Config:
        from_attributes = True
