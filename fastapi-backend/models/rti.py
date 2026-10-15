from sqlalchemy import Column, String, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from core.database import Base
from datetime import datetime
import uuid

class RtiRequest(Base):
    __tablename__ = 'rti_requests'
    __table_args__ = {'extend_existing': True}
    
    tenant_id = Column(String, nullable=True, name='tenant_id', default='f07c2bcc-81ad-4e27-aeff-1a65f04e9f06')
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    request_no = Column(String, unique=True, name='requestNo')
    
    applicant_name = Column(String, name='applicantName')
    applicant_phone = Column(String, nullable=True, name='applicantPhone')
    applicant_email = Column(String, nullable=True, name='applicantEmail')
    applicant_address = Column(String, nullable=True, name='applicantAddress')
    
    subject = Column(String)
    requested_information = Column(Text, name='requestedInformation')
    purpose = Column(Text, nullable=True)
    format = Column(String, default='electronic')
    
    status = Column(String, default='pending')
    assigned_officer = Column(String, default='सूचना अधिकारी (Information Officer)', name='assignedOfficer')
    assigned_department = Column(String, default='प्रशासन तथा आन्तरिक व्यवस्थापन शाखा', name='assignedDepartment')
    
    filing_date_bs = Column(String, nullable=True, name='filingDateBs')
    legal_deadline_bs = Column(String, nullable=True, name='legalDeadlineBs')
    
    action_taken_notes = Column(Text, nullable=True, name='actionTakenNotes')
    attachment_url = Column(String, nullable=True, name='attachmentUrl')
    tracking_token = Column(String, nullable=True, name='trackingToken')
    
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, name='updatedAt')

    def to_dict(self):
        return {
            "id": str(self.id),
            "tenantId": self.tenant_id,
            "requestNo": self.request_no,
            "applicantName": self.applicant_name,
            "applicantPhone": self.applicant_phone or "",
            "applicantEmail": self.applicant_email or "",
            "applicantAddress": self.applicant_address or "",
            "subject": self.subject,
            "requestedInformation": self.requested_information,
            "purpose": self.purpose or "",
            "format": self.format or "electronic",
            "status": self.status or "pending",
            "assignedOfficer": self.assigned_officer or "सूचना अधिकारी",
            "assignedDepartment": self.assigned_department or "प्रशासन तथा आन्तरिक व्यवस्थापन शाखा",
            "filingDateBs": self.filing_date_bs or "२०८१-०५-०१",
            "legalDeadlineBs": self.legal_deadline_bs or "२०८१-०५-१६",
            "actionTakenNotes": self.action_taken_notes or "",
            "attachmentUrl": self.attachment_url or "",
            "trackingToken": self.tracking_token or self.request_no,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }
