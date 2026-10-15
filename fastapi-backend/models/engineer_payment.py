from sqlalchemy import Column, String, Numeric, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from core.database import Base
from datetime import datetime
import enum
import uuid


class PaymentStatus(str, enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"


class PaymentType(str, enum.Enum):
    SALARY = "salary"
    CONTRACT = "contract"
    VENDOR = "vendor"
    GRANT = "grant"
    TAX_REFUND = "tax_refund"
    OTHER = "other"


class EngineerProfile(Base):
    __tablename__ = "engineers"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String, nullable=True, name="tenant_id")
    full_name = Column(String, nullable=False, name="fullName")
    license_no = Column(String, unique=True, nullable=False, name="licenseNo")
    consultancy_name = Column(String, nullable=True, name="consultancyName")
    specialization = Column(String, nullable=False)
    contact_phone = Column(String, nullable=False, name="contactPhone")
    email = Column(String, nullable=True)
    photo_url = Column(String, nullable=True, name="photoUrl")
    status = Column(String, default="active")
    created_at = Column(DateTime, default=datetime.utcnow, name="createdAt")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, name="updatedAt")

    def to_dict(self):
        return {
            "id": self.id,
            "tenantId": self.tenant_id,
            "fullName": self.full_name,
            "licenseNo": self.license_no,
            "consultancyName": self.consultancy_name or "",
            "specialization": self.specialization,
            "contactPhone": self.contact_phone,
            "email": self.email or "",
            "photoUrl": self.photo_url or "",
            "status": self.status,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }


class Payment(Base):
    __tablename__ = "payments"

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(String, nullable=True, name="tenant_id")
    voucher_no = Column(String, nullable=False, name="voucherNo")
    type = Column(String, default=PaymentType.OTHER)
    status = Column(String, default=PaymentStatus.PENDING)
    payee_name = Column(String, nullable=False, name="payeeName")
    payee_account = Column(String, nullable=True, name="payeeAccount")
    payee_bank = Column(String, nullable=True, name="payeeBank")
    amount = Column(Numeric(15, 2), nullable=False)
    fiscal_year = Column(String, nullable=True, name="fiscalYear")
    budget_head = Column(String, nullable=True, name="budgetHead")
    contract_id = Column(String, nullable=True, name="contractId")
    description = Column(Text, nullable=True)
    approved_by = Column(String, nullable=True, name="approvedBy")
    approved_at = Column(DateTime, nullable=True, name="approvedAt")
    paid_at = Column(DateTime, nullable=True, name="paidAt")
    cheque_no = Column(String, nullable=True, name="chequeNo")
    created_at = Column(DateTime, default=datetime.utcnow, name="createdAt")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, name="updatedAt")

    def to_dict(self):
        return {
            "id": str(self.id),
            "tenantId": self.tenant_id,
            "voucherNo": self.voucher_no,
            "type": self.type,
            "status": self.status,
            "payeeName": self.payee_name,
            "payeeAccount": self.payee_account or "",
            "payeeBank": self.payee_bank or "",
            "amount": float(self.amount or 0),
            "fiscalYear": self.fiscal_year or "",
            "budgetHead": self.budget_head or "",
            "contractId": self.contract_id or "",
            "description": self.description or "",
            "approvedBy": self.approved_by or "",
            "approvedAt": self.approved_at.isoformat() if self.approved_at else None,
            "paidAt": self.paid_at.isoformat() if self.paid_at else None,
            "chequeNo": self.cheque_no or "",
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }
