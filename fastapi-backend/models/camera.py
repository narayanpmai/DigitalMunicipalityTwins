from sqlalchemy import Column, String, Integer, Float, DateTime
from core.database import Base
from datetime import datetime

class AiCamera(Base):
    __tablename__ = 'ai_cameras'
    
    tenant_id = Column(String, nullable=True, name='tenant_id')
    id = Column(String, primary_key=True)
    camera_id = Column(String, unique=True, name='cameraId')
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)  # 'Entrance & Security', 'Flood & River Monitoring', etc.
    location = Column(String, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    status = Column(String, default='Active')  # 'Active', 'Offline', 'Maintenance'
    today_visitor_count = Column(Integer, default=0, name='todayVisitorCount')
    total_visitor_count = Column(Integer, default=0, name='totalVisitorCount')
    stream_url = Column(String, nullable=True, name='streamUrl')
    last_ping = Column(DateTime, nullable=True, name='lastPing')
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, name='updatedAt')
