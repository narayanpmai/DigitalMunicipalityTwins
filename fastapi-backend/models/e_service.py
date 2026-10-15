from sqlalchemy import Column, String, Integer, Float, Boolean, Date, DateTime, Numeric, JSON, ForeignKey, Text
from sqlalchemy.orm import relationship
from core.database import Base
from datetime import datetime
import uuid

class ServiceTemplate(Base):
    """Defines requirements and structure for 40+ Sifarish types."""
    __tablename__ = 'esrv_service_templates'
    
    tenant_id = Column(String, index=True, nullable=True)
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    service_code = Column(String, unique=True, index=True, nullable=False)
    service_name_np = Column(String, nullable=False)
    
    required_documents = Column(JSON, nullable=False) # List of doc names
    fee_amount = Column(Numeric(10, 2), default=0)
    
    html_pdf_template = Column(Text, nullable=False) # Jinja string
    json_schema = Column(JSON, nullable=False) # Form definition
    
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    
    applications = relationship("ServiceApplication", back_populates="template")


class ServiceApplication(Base):
    """Transactional record for a citizen's request."""
    __tablename__ = 'esrv_applications'
    
    tenant_id = Column(String, index=True, nullable=True)
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    application_no = Column(String, unique=True, index=True, nullable=False)
    
    service_template_id = Column(String, ForeignKey('esrv_service_templates.id'), nullable=False)
    applicant_citizen_id = Column(String, nullable=False) # Link to MDM Citizen
    ward_id = Column(String, nullable=False)
    
    submitted_data = Column(JSON, nullable=False)
    uploaded_documents = Column(JSON, nullable=True)
    
    status = Column(String, default='Submitted') # Draft, Submitted, KYC Verified, Payment Pending, Approved, Issued, Rejected
    remarks_history = Column(JSON, nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    
    template = relationship("ServiceTemplate", back_populates="applications")
    payment = relationship("ServicePayment", back_populates="application", uselist=False)
    certificate = relationship("IssuedCertificate", back_populates="application", uselist=False)


class ServicePayment(Base):
    """Revenue tracking for the service."""
    __tablename__ = 'esrv_payments'
    
    tenant_id = Column(String, index=True, nullable=True)
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    application_id = Column(String, ForeignKey('esrv_applications.id'), unique=True, nullable=False)
    
    amount = Column(Numeric(10, 2), nullable=False)
    payment_method = Column(String, nullable=False) # Cash, e-Sewa, ConnectIPS
    transaction_id = Column(String, nullable=True)
    payment_status = Column(String, default='Pending') # Pending, Verified
    receipt_url = Column(String, nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    
    application = relationship("ServiceApplication", back_populates="payment")

    def to_dict(self):
        app = self.application
        tpl = app.template if app else None
        sub = app.submitted_data if app and isinstance(app.submitted_data, dict) else {}
        applicant_name = (
            sub.get("applicant_name") or 
            sub.get("नाम") or 
            sub.get("applicantName") or 
            sub.get("full_name") or 
            "नागरिक"
        )
        return {
            "id": self.id,
            "tenant_id": self.tenant_id or "panchpokhari",
            "application_id": self.application_id,
            "applicationId": self.application_id,
            "application_no": app.application_no if app else "",
            "applicationNo": app.application_no if app else "",
            "service_name": tpl.service_name_np if tpl else "सिफारिस सेवा",
            "serviceName": tpl.service_name_np if tpl else "सिफारिस सेवा",
            "service_code": tpl.service_code if tpl else "sifarish",
            "applicant_name": applicant_name,
            "applicantName": applicant_name,
            "ward_id": app.ward_id if app else "1",
            "wardId": app.ward_id if app else "1",
            "amount": float(self.amount) if self.amount is not None else 0.0,
            "payment_method": self.payment_method,
            "paymentMethod": self.payment_method,
            "transaction_id": self.transaction_id or f"TXN-{self.id[:8].upper()}",
            "transactionId": self.transaction_id or f"TXN-{self.id[:8].upper()}",
            "payment_status": self.payment_status or "Completed",
            "paymentStatus": self.payment_status or "Completed",
            "receipt_url": self.receipt_url or f"/receipts/{self.id}.pdf",
            "receiptUrl": self.receipt_url or f"/receipts/{self.id}.pdf",
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }


class IssuedCertificate(Base):
    """The final generated and signed PDF."""
    __tablename__ = 'esrv_issued_certificates'
    
    tenant_id = Column(String, index=True, nullable=True)
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    application_id = Column(String, ForeignKey('esrv_applications.id'), unique=True, nullable=False)
    
    certificate_no = Column(String, unique=True, index=True, nullable=False)
    digital_signature_id = Column(String, nullable=True) # Links to DigitalSignature table
    
    pdf_url = Column(String, nullable=False)
    issue_date = Column(DateTime(timezone=True), default=datetime.utcnow)
    qr_verification_token = Column(String, unique=True, index=True, nullable=False)
    
    application = relationship("ServiceApplication", back_populates="certificate")
