from sqlalchemy import Column, String, Integer, Numeric, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from core.database import Base
from datetime import datetime
import uuid

class Budget(Base):
    __tablename__ = 'budgets'
    __table_args__ = {'extend_existing': True}
    
    tenant_id = Column(String, nullable=True, name='tenant_id', default='f07c2bcc-81ad-4e27-aeff-1a65f04e9f06')
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String)
    fiscal_year = Column(String, name='fiscalYear', default='२०८१/०८२')
    type = Column(String, default='capital')
    status = Column(String, default='draft')
    sector = Column(String, nullable=True)
    ward_number = Column(Integer, nullable=True, name='wardNumber')
    allocated_amount = Column(Numeric(15, 2), default=0, name='allocatedAmount')
    released_amount = Column(Numeric(15, 2), default=0, name='releasedAmount')
    spent_amount = Column(Numeric(15, 2), default=0, name='spentAmount')
    source_of_fund = Column(String, nullable=True, name='sourceOfFund')
    description = Column(Text, nullable=True)
    approved_by = Column(String, nullable=True, name='approvedBy')
    approved_at = Column(DateTime, nullable=True, name='approvedAt')
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, name='updatedAt')
    deleted_at = Column(DateTime, nullable=True, name='deletedAt')

    def to_dict(self):
        alloc = float(self.allocated_amount or 0)
        spent = float(self.spent_amount or 0)
        rel = float(self.released_amount or 0)
        burn_rate = round((spent / alloc * 100), 1) if alloc > 0 else 0.0

        return {
            "id": str(self.id),
            "tenantId": self.tenant_id,
            "title": self.title,
            "fiscalYear": self.fiscal_year,
            "type": self.type or "capital",
            "status": self.status or "draft",
            "sector": self.sector or "पूर्वाधार विकास",
            "wardNumber": self.ward_number,
            "allocatedAmount": alloc,
            "releasedAmount": rel,
            "spentAmount": spent,
            "remainingAmount": alloc - spent,
            "burnRate": burn_rate,
            "sourceOfFund": self.source_of_fund or "गाउँपालिका आन्तरिक स्रोत",
            "description": self.description or "",
            "approvedBy": self.approved_by or "",
            "approvedAt": self.approved_at.isoformat() if self.approved_at else None,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }
