from sqlalchemy import Column, String, Integer, Boolean, Float, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from core.database import Base
from datetime import datetime
import uuid

class Complaint(Base):
    __tablename__ = 'complaints'
    __table_args__ = {'extend_existing': True}
    
    tenant_id = Column(String, nullable=True, name='tenant_id', default='f07c2bcc-81ad-4e27-aeff-1a65f04e9f06')
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    complaint_no = Column(String, unique=True, name='complaintNo')
    title = Column(String)
    description = Column(Text)
    category = Column(String, default='other')
    status = Column(String, default='pending')
    complainant_name = Column(String, nullable=True, name='complainantName')
    complainant_phone = Column(String, nullable=True, name='complainantPhone')
    complainant_address = Column(String, nullable=True, name='complainantAddress')
    is_anonymous = Column(Boolean, default=False, name='isAnonymous')
    ward_number = Column(Integer, nullable=True, name='wardNumber')
    assigned_to = Column(String, nullable=True, name='assignedTo')
    assigned_department = Column(String, nullable=True, name='assignedDepartment')
    priority = Column(String, default='medium')
    action_taken_notes = Column(Text, nullable=True, name='actionTakenNotes')
    resolution = Column(Text, nullable=True)
    resolved_at = Column(DateTime, nullable=True, name='resolvedAt')
    date_reported_bs = Column(String, nullable=True, name='dateReportedBs')
    attachment_url = Column(String, nullable=True, name='attachmentUrl')
    tracking_token = Column(String, nullable=True, name='trackingToken')
    channel = Column(String, default='web')
    whatsapp_sender_phone = Column(String, nullable=True, name='whatsappSenderPhone')
    whatsapp_message_id = Column(String, nullable=True, name='whatsappMessageId')
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    source_details = Column(Text, nullable=True, name='sourceDetails')
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, name='updatedAt')

    def to_dict(self):
        return {
            "id": str(self.id),
            "tenantId": self.tenant_id,
            "complaintNo": self.complaint_no,
            "title": self.title,
            "description": self.description,
            "category": self.category or "other",
            "status": self.status or "pending",
            "complainantName": "गोप्य (Anonymous)" if self.is_anonymous else (self.complainant_name or ""),
            "complainantPhone": "" if self.is_anonymous else (self.complainant_phone or ""),
            "complainantAddress": self.complainant_address or "",
            "isAnonymous": bool(self.is_anonymous),
            "wardNumber": int(self.ward_number or 1),
            "assignedTo": self.assigned_to or "",
            "assignedDepartment": self.assigned_department or "",
            "priority": self.priority or "medium",
            "actionTakenNotes": self.action_taken_notes or "",
            "resolution": self.resolution or "",
            "resolvedAt": self.resolved_at.isoformat() if self.resolved_at else None,
            "dateReportedBs": self.date_reported_bs or "२०८१-०५-०१",
            "attachmentUrl": self.attachment_url or "",
            "trackingToken": self.tracking_token or self.complaint_no,
            "channel": self.channel or "web",
            "whatsappSenderPhone": self.whatsapp_sender_phone or "",
            "whatsappMessageId": self.whatsapp_message_id or "",
            "latitude": float(self.latitude) if self.latitude is not None else None,
            "longitude": float(self.longitude) if self.longitude is not None else None,
            "sourceDetails": self.source_details or "",
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }
