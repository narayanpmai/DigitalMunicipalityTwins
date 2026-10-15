from sqlalchemy import Column, String, Integer, Numeric, DateTime, Text
from core.database import Base
from datetime import datetime
import uuid

class VacancyAnnouncement(Base):
    __tablename__ = 'recruitment_vacancies'

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    vacancy_no = Column(String, unique=True, index=True)
    title = Column(String)
    service_group = Column(String)
    level = Column(String)
    openings_count = Column(Integer, default=1)
    employment_type = Column(String, default='करार सेवा (Contract)')
    application_fee = Column(Numeric(10, 2), default=500.0)
    min_qualification = Column(String)
    publish_date_bs = Column(String)
    deadline_date_bs = Column(String)
    exam_date_bs = Column(String, nullable=True)
    status = Column(String, default='खुला (Active)')
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class JobApplication(Base):
    __tablename__ = 'recruitment_applications'

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
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
    experience_years = Column(Integer, default=0)
    payment_method = Column(String, default='eSewa / Khalti / ConnectIPS')
    payment_voucher_no = Column(String, nullable=True)
    status = Column(String, default='विचाराधीन (Pending)')
    rejection_reason = Column(String, nullable=True)
    admit_card_roll_no = Column(String, nullable=True)
    exam_center = Column(String, nullable=True)
    exam_date_time = Column(String, nullable=True)
    photo_url = Column(String, nullable=True)
    signature_url = Column(String, nullable=True)
    citizenship_doc_url = Column(String, nullable=True)
    qualification_doc_url = Column(String, nullable=True)
    council_doc_url = Column(String, nullable=True)
    experience_doc_url = Column(String, nullable=True)
    payment_voucher_doc_url = Column(String, nullable=True)
    documents_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

