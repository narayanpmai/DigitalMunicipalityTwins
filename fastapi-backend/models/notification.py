from sqlalchemy import Column, String, Integer, DateTime, JSON
from core.database import Base
from datetime import datetime

class EmergencyBroadcast(Base):
    __tablename__ = 'emergency_broadcasts'
    
    id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    hazard_type = Column(String, default='general', name='hazardType')
    severity = Column(String, default='medium')
    target_ward = Column(String, default='all', name='targetWard')
    channels = Column(JSON, nullable=True)
    recipients_count = Column(Integer, default=0, name='recipientsCount')
    status = Column(String, default='delivered')
    timestamp_bs = Column(String, nullable=True, name='timestampBs')
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')
