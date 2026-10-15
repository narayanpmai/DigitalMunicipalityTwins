from sqlalchemy import Column, String, DateTime
from core.database import Base
from datetime import datetime

class Tenant(Base):
    __tablename__ = 'tenants'

    id = Column(String, primary_key=True)
    subdomain = Column(String, unique=True, nullable=False)
    name_np = Column(String, nullable=False, name='nameNp')
    name_en = Column(String, nullable=False, name='nameEn')
    logo_url = Column(String, nullable=True, name='logoUrl')
    status = Column(String, default='active')
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, name='updatedAt')
