from sqlalchemy import Column, String, Integer, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from core.database import Base
from datetime import datetime
import uuid

class EOfficeFile(Base):
    """Digital File Folder that holds multiple Tippani, Darta, and Chalani."""
    __tablename__ = 'eoffice_files'
    
    tenant_id = Column(String, index=True, nullable=True)
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    file_no = Column(String, unique=True, index=True, nullable=False)
    subject = Column(String, nullable=False)
    classification = Column(String, default='General') # Confidential, General, Urgent
    status = Column(String, default='Open') # Open, In Progress, Closed, Archived
    created_by_branch = Column(String, nullable=True) # Could be FK to branch
    current_owner_id = Column(String, nullable=True) # Employee ID currently holding the file
    
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    
    tippanis = relationship("Tippani", back_populates="file")
    movements = relationship("FileMovement", back_populates="file")

    def to_dict(self):
        return {
            "id": self.id,
            "tenant_id": self.tenant_id,
            "file_no": self.file_no,
            "subject": self.subject,
            "classification": self.classification,
            "status": self.status,
            "created_by_branch": self.created_by_branch,
            "current_owner_id": self.current_owner_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "tippanis_count": len(self.tippanis) if self.tippanis else 0,
            "movements_count": len(self.movements) if self.movements else 0,
        }


class Tippani(Base):
    """Note Sheet / Proposal document."""
    __tablename__ = 'eoffice_tippani'
    
    tenant_id = Column(String, index=True, nullable=True)
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    file_id = Column(String, ForeignKey('eoffice_files.id'), nullable=False)
    darta_id = Column(String, nullable=True) # Link to incoming letter
    subject = Column(String, nullable=False)
    content_html = Column(Text, nullable=False)
    status = Column(String, default='Draft') # Draft, Pending Review, Approved, Rejected
    initiated_by = Column(String, nullable=False) # Employee ID
    
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    
    file = relationship("EOfficeFile", back_populates="tippanis")

    def to_dict(self):
        return {
            "id": self.id,
            "tenant_id": self.tenant_id,
            "file_id": self.file_id,
            "darta_id": self.darta_id,
            "subject": self.subject,
            "content_html": self.content_html,
            "status": self.status,
            "initiated_by": self.initiated_by,
            "tippani_no": f"TIP-{self.id[:6].upper()}",
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class FileMovement(Base):
    """Tracks the routing of a file between desks/employees."""
    __tablename__ = 'eoffice_file_movements'
    
    tenant_id = Column(String, index=True, nullable=True)
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    file_id = Column(String, ForeignKey('eoffice_files.id'), nullable=False)
    from_employee_id = Column(String, nullable=False)
    to_employee_id = Column(String, nullable=False)
    action_requested = Column(String, nullable=True) # Review, Approve, FYI
    remarks = Column(Text, nullable=True)
    is_read = Column(Boolean, default=False)
    action_taken_date = Column(DateTime(timezone=True), nullable=True)
    dispatched_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    
    file = relationship("EOfficeFile", back_populates="movements")

    def to_dict(self):
        return {
            "id": self.id,
            "tenant_id": self.tenant_id,
            "file_id": self.file_id,
            "file_no": self.file.file_no if self.file else "",
            "file_subject": self.file.subject if self.file else "",
            "from_employee_id": self.from_employee_id,
            "to_employee_id": self.to_employee_id,
            "action_requested": self.action_requested,
            "remarks": self.remarks or "",
            "is_read": bool(self.is_read),
            "action_taken_date": self.action_taken_date.isoformat() if self.action_taken_date else None,
            "dispatched_at": self.dispatched_at.isoformat() if self.dispatched_at else None,
        }


class DigitalSignature(Base):
    """Cryptographic signature log for decisions."""
    __tablename__ = 'eoffice_digital_signatures'
    
    tenant_id = Column(String, index=True, nullable=True)
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id = Column(String, nullable=False, index=True) # polymorphic (Tippani ID, Chalani ID)
    document_type = Column(String, nullable=False)
    signed_by = Column(String, nullable=False) # Employee ID / Name
    cert_thumbprint = Column(String, nullable=False)
    signature_payload = Column(Text, nullable=False)
    signed_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "tenant_id": self.tenant_id,
            "document_id": self.document_id,
            "document_type": self.document_type,
            "signed_by": self.signed_by,
            "cert_thumbprint": self.cert_thumbprint,
            "signature_payload": self.signature_payload,
            "signed_at": self.signed_at.isoformat() if self.signed_at else None,
        }
