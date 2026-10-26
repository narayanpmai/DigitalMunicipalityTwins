from sqlalchemy import Column, String, DateTime, Integer, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import relationship
from core.database import Base
from datetime import datetime
import uuid

class DocumentArchive(Base):
    __tablename__ = 'document_archive'
    __table_args__ = {'extend_existing': True}
    
    tenant_id = Column(String, nullable=True, name='tenant_id')
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    fiscal_year = Column(String, nullable=True, name='fiscalYear')
    file_name = Column(String, nullable=False, name='fileName')
    file_url = Column(String, nullable=False, name='fileUrl')
    status = Column(String, default='Verified')
    uploaded_at = Column(DateTime, default=datetime.utcnow, name='uploadedAt')

    extractions = relationship("DocumentExtraction", back_populates="document", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": str(self.id),
            "tenantId": self.tenant_id,
            "title": self.title,
            "fiscalYear": self.fiscal_year or "२०८१/०८२",
            "fileName": self.file_name,
            "fileUrl": self.file_url,
            "status": self.status or "Verified",
            "uploadedAt": self.uploaded_at.isoformat() if self.uploaded_at else None,
            "extractionsCount": len(self.extractions) if self.extractions else 0
        }


class DocumentExtraction(Base):
    __tablename__ = 'document_extraction'
    __table_args__ = {'extend_existing': True}

    tenant_id = Column(String, nullable=True, name='tenant_id')
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id = Column(PG_UUID(as_uuid=True), ForeignKey('document_archive.id', ondelete='CASCADE'), nullable=True, name='documentId')
    category = Column(String, nullable=True) # Gazette, BudgetBook, Act, CitizenCharter, MeetingDecision, LandRecord
    extracted_data = Column(Text, nullable=True, name='extractedData')
    page_number = Column(Integer, default=1, name='pageNumber')
    status = Column(String, default='Pending Verification') # 'Pending Verification', 'Verified', 'Published'
    extracted_at = Column(DateTime, default=datetime.utcnow, name='extractedAt')

    document = relationship("DocumentArchive", back_populates="extractions")

    def to_dict(self):
        return {
            "id": str(self.id),
            "tenantId": self.tenant_id,
            "documentId": str(self.document_id) if self.document_id else None,
            "category": self.category or "General",
            "extractedData": self.extracted_data or "",
            "pageNumber": self.page_number or 1,
            "status": self.status or "Pending Verification",
            "extractedAt": self.extracted_at.isoformat() if self.extracted_at else None,
            "document": {
                "id": str(self.document.id),
                "title": self.document.title,
                "fiscalYear": self.document.fiscal_year,
                "fileUrl": self.document.file_url,
                "fileName": self.document.file_name
            } if self.document else None
        }
