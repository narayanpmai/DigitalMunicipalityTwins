from sqlalchemy import Column, String, Integer, Float, DateTime
from core.database import Base
from datetime import datetime

class Sensor(Base):
    __tablename__ = 'sensors'
    
    tenant_id = Column(String, nullable=True, name='tenant_id')
    id = Column(String, primary_key=True)
    sensor_id = Column(String, unique=True, name='sensorId')
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)  # 'river_level', 'rain_gauge', 'landslide_motion', 'weather_station'
    location = Column(String, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    last_value = Column(Float, default=0.0, name='lastValue')
    unit = Column(String, nullable=True)  # 'm', 'mm', 'mm/hr', '°C'
    danger_threshold = Column(Float, nullable=True, name='dangerThreshold')
    status = Column(String, default='Normal')  # 'Normal', 'Warning', 'Critical'
    last_ping = Column(DateTime, nullable=True, name='lastPing')
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, name='updatedAt')
