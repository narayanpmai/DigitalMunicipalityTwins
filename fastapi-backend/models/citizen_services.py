from sqlalchemy import Column, String, Integer, Numeric, DateTime, JSON, Text
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from core.database import Base
from datetime import datetime
import uuid

class CitizenService(Base):
    __tablename__ = 'citizen_services'
    __table_args__ = {'extend_existing': True}
    
    tenant_id = Column(String, nullable=True, name='tenant_id', default='f07c2bcc-81ad-4e27-aeff-1a65f04e9f06')
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    application_no = Column(String, name='applicationNo')
    service_type = Column(String, name='serviceType')
    status = Column(String, default='applied')
    applicant_name = Column(String, name='applicantName')
    applicant_phone = Column(String, nullable=True, name='applicantPhone')
    ward_number = Column(Integer, nullable=True, name='wardNumber', default=1)
    purpose = Column(Text, nullable=True)
    processed_by = Column(String, nullable=True, name='processedBy')
    processed_at = Column(DateTime, nullable=True, name='processedAt')
    delivered_at = Column(DateTime, nullable=True, name='deliveredAt')
    fee = Column(Numeric(10, 2), default=0)
    remarks = Column(Text, nullable=True)
    certificate_no = Column(String, nullable=True, name='certificateNo')
    dispatch_no = Column(String, nullable=True, name='dispatchNo')
    form_data = Column(JSON, nullable=True, name='formData')
    documents = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, name='updatedAt')

    def to_dict(self):
        return {
            "id": str(self.id),
            "tenantId": self.tenant_id,
            "applicationNo": self.application_no,
            "serviceType": self.service_type,
            "status": self.status,
            "applicantName": self.applicant_name,
            "applicantPhone": self.applicant_phone or "",
            "wardNumber": int(self.ward_number or 1),
            "purpose": self.purpose or "",
            "processedBy": self.processed_by or "",
            "processedAt": self.processed_at.isoformat() if self.processed_at else None,
            "deliveredAt": self.delivered_at.isoformat() if self.delivered_at else None,
            "fee": float(self.fee or 0),
            "remarks": self.remarks or "",
            "certificateNo": self.certificate_no or "",
            "dispatchNo": self.dispatch_no or "",
            "formData": self.form_data or {},
            "documents": self.documents or [],
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }
