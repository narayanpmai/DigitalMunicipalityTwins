from sqlalchemy import Column, String, Text, DateTime, UniqueConstraint
from core.database import Base
from datetime import datetime
import uuid

class SystemSetting(Base):
    __tablename__ = 'system_settings'
    __table_args__ = (
        UniqueConstraint('tenant_id', 'key', name='uq_system_settings_tenant_key'),
    )

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String, nullable=True, name='tenant_id')
    key = Column(String(100), nullable=False)
    value = Column(Text, nullable=True)
    description = Column(String, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, name='updatedAt')
