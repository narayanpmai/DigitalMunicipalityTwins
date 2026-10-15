from sqlalchemy import Column, String, Integer, Numeric, DateTime, JSON, Text
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from core.database import Base
from datetime import datetime
import uuid

class Plan(Base):
    __tablename__ = 'plans'
    __table_args__ = {'extend_existing': True}
    
    tenant_id = Column(String, nullable=True, name='tenant_id', default='f07c2bcc-81ad-4e27-aeff-1a65f04e9f06')
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String)
    title_en = Column(String, nullable=True, name='titleEn')
    type = Column(String, default='annual')
    status = Column(String, default='draft')
    fiscal_year = Column(String, nullable=True, name='fiscalYear')
    start_year = Column(Integer, nullable=True, name='startYear')
    end_year = Column(Integer, nullable=True, name='endYear')
    description = Column(Text, nullable=True)
    objectives = Column(Text, nullable=True)
    targets = Column(JSON, nullable=True)
    estimated_budget = Column(Numeric(15, 2), nullable=True, name='estimatedBudget')
    sector = Column(String, nullable=True)
    ward_number = Column(Integer, nullable=True, name='wardNumber')
    approved_by = Column(String, nullable=True, name='approvedBy')
    approved_at = Column(DateTime, nullable=True, name='approvedAt')
    document_url = Column(String, nullable=True, name='documentUrl')
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, name='updatedAt')
    deleted_at = Column(DateTime, nullable=True, name='deletedAt')

    def to_dict(self):
        return {
            "id": str(self.id),
            "tenantId": self.tenant_id,
            "title": self.title,
            "titleEn": self.title_en or "",
            "type": self.type or "annual",
            "status": self.status or "draft",
            "fiscalYear": self.fiscal_year or "२०८१/०८२",
            "startYear": self.start_year,
            "endYear": self.end_year,
            "description": self.description or "",
            "objectives": self.objectives or "",
            "targets": self.targets or [],
            "estimatedBudget": float(self.estimated_budget or 0),
            "sector": self.sector or "समग्र पालिका",
            "wardNumber": self.ward_number,
            "approvedBy": self.approved_by or "",
            "approvedAt": self.approved_at.isoformat() if self.approved_at else None,
            "documentUrl": self.document_url or "",
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }
