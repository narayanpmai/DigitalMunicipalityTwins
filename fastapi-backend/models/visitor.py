from sqlalchemy import Column, String, Integer, DateTime, Numeric
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from core.database import Base
from datetime import datetime
import uuid

class VisitorRecord(Base):
    __tablename__ = 'visitor_records'
    __table_args__ = {'extend_existing': True}
    
    tenant_id = Column(String, nullable=True, name='tenant_id')
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    fiscal_year = Column(String, nullable=False, name='fiscalYear')
    month = Column(Integer, nullable=True)
    visitor_type = Column(String, default='domestic', name='visitorType')  # 'domestic' | 'international'
    count = Column(Integer, default=0)
    destination = Column(String, nullable=True)
    revenue_npr = Column(Numeric(12, 2), nullable=True, name='revenueNPR')
    average_stay_days = Column(Integer, nullable=True, name='averageStayDays')
    nationality = Column(String, nullable=True)
    notes = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, name='updatedAt')

    def to_dict(self):
        return {
            "id": str(self.id),
            "tenant_id": self.tenant_id,
            "fiscalYear": self.fiscal_year,
            "fiscal_year": self.fiscal_year,
            "month": self.month,
            "visitorType": self.visitor_type,
            "visitor_type": self.visitor_type,
            "count": self.count or 0,
            "destination": self.destination or "",
            "revenueNPR": float(self.revenue_npr) if self.revenue_npr is not None else 0.0,
            "revenue_npr": float(self.revenue_npr) if self.revenue_npr is not None else 0.0,
            "averageStayDays": self.average_stay_days,
            "average_stay_days": self.average_stay_days,
            "nationality": self.nationality or "नेपाली",
            "notes": self.notes or "",
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }

