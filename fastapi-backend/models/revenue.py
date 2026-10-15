from sqlalchemy import Column, String, Integer, Float, Date, DateTime, Numeric
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from core.database import Base
from datetime import datetime
import uuid

class Revenue(Base):
    __tablename__ = 'revenues'
    __table_args__ = {'extend_existing': True}
    
    tenant_id = Column(String, nullable=True, name='tenant_id')
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    receipt_no = Column(String, name='receiptNo')
    type = Column(String, default='tax')
    payer_name = Column(String, name='payerName')
    payer_phone = Column(String, nullable=True, name='payerPhone')
    payer_pan = Column(String, nullable=True, name='payerPan')
    ward_number = Column(Integer, nullable=True, name='wardNumber')
    base_amount = Column(Numeric(15, 2), default=0, name='baseAmount')
    fine_amount = Column(Numeric(15, 2), default=0, name='fineAmount')
    discount_amount = Column(Numeric(15, 2), default=0, name='discountAmount')
    amount = Column(Numeric(15, 2))
    payment_method = Column(String, default='CASH', name='paymentMethod')
    payment_status = Column(String, default='PAID', name='paymentStatus')
    transaction_id = Column(String, nullable=True, name='transactionId')
    payment_gateway = Column(String, nullable=True, name='paymentGateway')
    qr_verification_url = Column(String, nullable=True, name='qrVerificationUrl')
    tax_assessment_details = Column(String, nullable=True, name='taxAssessmentDetails')
    fiscal_year = Column(String, default='२०८१/०८२', name='fiscalYear')
    revenue_head = Column(String, nullable=True, name='revenueHead')
    description = Column(String, nullable=True)
    collected_by = Column(String, nullable=True, name='collectedBy')
    collected_at = Column(DateTime, nullable=True, name='collectedAt')
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, name='updatedAt')
