from sqlalchemy import Column, String, Text, DateTime, Integer
from core.database import Base
from datetime import datetime
import uuid

class EventCalendar(Base):
    __tablename__ = 'event_calendar'
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String, nullable=True, name='tenant_id', default='default')
    title = Column(String(200), nullable=False)
    date = Column(Integer, nullable=False)
    month = Column(String(50), nullable=False)
    event_type = Column(String(50), nullable=False) # meeting, holiday, festival, training, other
    time = Column(String(50), nullable=True)
    location = Column(String(200), nullable=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
