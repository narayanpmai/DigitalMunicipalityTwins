from sqlalchemy import Column, String, Integer, Numeric, DateTime, Text
from core.database import Base
from datetime import datetime
import uuid

class VacancyAnnouncement(Base):
    __tablename__ = 'recruitment_vacancies'

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String, index=True, default='panchpokhari', nullable=True)
    vacancy_no = Column(String, unique=True, index=True)
    title = Column(String)
    service_group = Column(String)
    level = Column(String)
    openings_count = Column(Integer, default=1)
    employment_type = Column(String, default='करार सेवा (Contract)')
    application_fee = Column(Numeric(10, 2), default=500.0)
    inclusive_group_fee = Column(Numeric(10, 2), default=200.0)
    min_qualification = Column(String)
    publish_date_bs = Column(String)
    deadline_date_bs = Column(String)
    exam_date_bs = Column(String, nullable=True)
    exam_center = Column(String, nullable=True)
    status = Column(String, default='खुला (Active)')
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class JobApplication(Base):
    __tablename__ = 'recruitment_applications'

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String, index=True, default='panchpokhari', nullable=True)
    application_no = Column(String, unique=True, index=True)
    vacancy_id = Column(String, index=True)
    vacancy_no = Column(String)
    post_title = Column(String)
    full_name_np = Column(String)
    full_name_en = Column(String, nullable=True)
    dob_bs = Column(String, nullable=True)
    gender = Column(String, default='पुरुष')
    citizenship_no = Column(String, nullable=True)
    citizenship_district = Column(String, nullable=True)
    contact_phone = Column(String)
    email = Column(String, nullable=True)
    permanent_address = Column(String)
    temporary_address = Column(String, nullable=True)
    qualification_title = Column(String, nullable=True)
    board_university = Column(String, nullable=True)
    passed_year_bs = Column(String, nullable=True)
    division_gpa = Column(String, nullable=True)
    council_reg_no = Column(String, nullable=True)
    teaching_license_no = Column(String, nullable=True)
    experience_years = Column(Integer, default=0)
    inclusive_categories = Column(String, nullable=True) # e.g. "महिला, आदिवासी/जनजाति"
    
    # Payment lifecycle
    payment_method = Column(String, default='Fonepay QR / ConnectIPS / eSewa')
    payment_voucher_no = Column(String, nullable=True)
    payment_status = Column(String, default='UNPAID') # UNPAID, PENDING_VERIFICATION, PAID, FAILED, REFUNDED
    receipt_no = Column(String, nullable=True, unique=True)
    paid_amount = Column(Numeric(10, 2), default=0.0)
    paid_at = Column(DateTime, nullable=True)
    
    # Application & Review lifecycle
    status = Column(String, default='विचाराधीन (Pending)')
    application_status = Column(String, default='SUBMITTED') # DRAFT, SUBMITTED, APPROVED, REJECTED
    rejection_reason = Column(String, nullable=True)
    admit_card_roll_no = Column(String, nullable=True)
    chalani_no = Column(String, nullable=True)
    exam_center = Column(String, nullable=True)
    exam_date_time = Column(String, nullable=True)
    approved_at = Column(DateTime, nullable=True)
    
    # Document URLs
    photo_url = Column(String, nullable=True)
    signature_url = Column(String, nullable=True)
    citizenship_doc_url = Column(String, nullable=True)
    qualification_doc_url = Column(String, nullable=True)
    application_letter_doc_url = Column(String, nullable=True)
    teaching_license_doc_url = Column(String, nullable=True)
    council_doc_url = Column(String, nullable=True)
    experience_doc_url = Column(String, nullable=True)
    payment_voucher_doc_url = Column(String, nullable=True)
    documents_json = Column(Text, nullable=True)
    
    # HRMS Onboarding Link
    onboarded_employee_id = Column(String, nullable=True, index=True)
    onboarded_at = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)


class RecruitmentPayment(Base):
    __tablename__ = 'recruitment_payments'

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String, index=True, default='panchpokhari', nullable=True)
    application_id = Column(String, index=True)
    application_no = Column(String, index=True)
    transaction_uuid = Column(String, unique=True, index=True)
    gateway = Column(String) # FONEPAY, CONNECTIPS, ESEWA, KHALTI, BANK_VOUCHER
    gateway_ref_id = Column(String, nullable=True)
    amount = Column(Numeric(10, 2), nullable=False)
    status = Column(String, default='INITIATED') # INITIATED, SUCCESS, FAILED, CANCELLED, REFUNDED
    idempotency_key = Column(String, unique=True, nullable=True)
    qr_data = Column(Text, nullable=True)
    gateway_response = Column(Text, nullable=True)
    ip_address = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    verified_at = Column(DateTime, nullable=True)


class RecruitmentAuditLog(Base):
    __tablename__ = 'recruitment_audit_logs'

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String, index=True, default='panchpokhari', nullable=True)
    entity_type = Column(String, nullable=False) # APPLICATION, PAYMENT, VACANCY, ADMIT_CARD, REFUND
    entity_id = Column(String, nullable=False)
    action = Column(String, nullable=False) # CREATE, UPDATE, PAY_INITIATE, PAY_SUCCESS, VERIFY, ROLL_ASSIGN, REFUND
    performed_by = Column(String, nullable=False) # CANDIDATE, SYSTEM, ADMIN
    ip_address = Column(String, nullable=True)
    details = Column(Text, nullable=True) # JSON or text notes
    created_at = Column(DateTime, default=datetime.utcnow)


class RecruitmentRefund(Base):
    __tablename__ = 'recruitment_refunds'

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String, index=True, default='panchpokhari', nullable=True)
    payment_id = Column(String, index=True)
    application_id = Column(String, index=True)
    refund_amount = Column(Numeric(10, 2), nullable=False)
    reason = Column(Text, nullable=False)
    bank_info = Column(Text, nullable=True)
    status = Column(String, default='REQUESTED') # REQUESTED, PROCESSED, REJECTED
    processed_by = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
