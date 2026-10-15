from sqlalchemy import Column, String, Integer, Boolean, DateTime, Date, BigInteger
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from core.database import Base
from datetime import datetime
import uuid

class FiscalYear(Base):
    __tablename__ = 'fiscal_years'
    __table_args__ = {'extend_existing': True}
    
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    year_np = Column(String, unique=True, name='yearNp')
    year_en = Column(String, unique=True, name='yearEn')
    is_current = Column(Boolean, default=False, name='isCurrent')
    start_date_ad = Column(Date, nullable=True, name='startDateAd')
    end_date_ad = Column(Date, nullable=True, name='endDateAd')
    approved_budget_npr = Column(BigInteger, default=0, name='approvedBudgetNpr')
    expenditure_so_far_npr = Column(BigInteger, default=0, name='expenditureSoFarNpr')
    remarks = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, name='updatedAt')

    def to_dict(self):
        return {
            "id": str(self.id),
            "yearNp": self.year_np,
            "yearEn": self.year_en,
            "isCurrent": bool(self.is_current),
            "startDateAd": self.start_date_ad.isoformat() if self.start_date_ad else None,
            "endDateAd": self.end_date_ad.isoformat() if self.end_date_ad else None,
            "approvedBudgetNpr": int(self.approved_budget_npr or 0),
            "expenditureSoFarNpr": int(self.expenditure_so_far_npr or 0),
            "remarks": self.remarks or "",
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }
