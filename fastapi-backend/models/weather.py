from sqlalchemy import Column, String, Float, DateTime
from core.database import Base
from datetime import datetime
import uuid

class WeatherStationData(Base):
    __tablename__ = 'weather_station_data'
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String, nullable=True, name='tenant_id', default='default')
    station_id = Column(String(100), nullable=False)
    name = Column(String(200), nullable=False)
    temp = Column(Float, nullable=False)
    rainfall24h = Column(Float, nullable=False)
    rainfall1h = Column(Float, nullable=False)
    humidity = Column(Float, nullable=False)
    status = Column(String(50), nullable=False) # Normal, Warning, Danger
    forecast = Column(String(200), nullable=True)
    last_updated = Column(DateTime, default=datetime.utcnow)
