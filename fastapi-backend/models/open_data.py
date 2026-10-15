from sqlalchemy import Column, String, Integer, DateTime, JSON, Numeric, Boolean, Text
from core.database import Base
from datetime import datetime
import uuid

class OpenDataRecord(Base):
    __tablename__ = 'open_data_records'
    
    tenant_id = Column(String, nullable=True, name='tenant_id')
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    category = Column(String, default='datasets')  # 'datasets' | 'reports' | 'strategic' | 'practices'
    title = Column(String, nullable=False)
    sub_category = Column(String, nullable=True, name='subCategory')
    fiscal_year = Column(String, default='२०८१/०८२', name='fiscalYear')
    ward_number = Column(Integer, default=0, name='wardNumber')
    description = Column(Text, nullable=True)
    format = Column(String, nullable=True)  # 'CSV, JSON', 'PDF', 'XLSX'
    file_size = Column(String, nullable=True, name='fileSize')
    records_count = Column(Integer, default=0, name='recordsCount')
    file_url = Column(String, nullable=True, name='fileUrl')
    publish_date = Column(String, nullable=True, name='publishDate')
    author_or_department = Column(String, nullable=True, name='authorOrDepartment')
    target_goal = Column(String, nullable=True, name='targetGoal')
    budget_allocated = Column(Numeric(14, 2), default=0, name='budgetAllocated')
    tag_badge = Column(String, nullable=True, name='tagBadge')
    status = Column(String, default='प्रकाशित')
    key_indicators = Column(JSON, nullable=True, name='keyIndicators')
    sample_data = Column(JSON, nullable=True, name='sampleData')
    columns_schema = Column(JSON, nullable=True, name='columnsSchema')
    license = Column(String, default='CC-BY-SA 4.0', name='license')
    api_endpoint = Column(String, nullable=True, name='apiEndpoint')
    is_featured = Column(Boolean, default=False, name='isFeatured')
    download_count = Column(Integer, default=0, name='downloadCount')
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, name='updatedAt')
    deleted_at = Column(DateTime, nullable=True, name='deletedAt')


class MunicipalIndicator(Base):
    """Core Municipal Indicators and SDG localization metrics."""
    __tablename__ = 'municipal_indicators'

    tenant_id = Column(String, nullable=True, index=True)
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    indicator_code = Column(String(50), unique=True, index=True)
    title_np = Column(String(255), nullable=False)
    title_en = Column(String(255), nullable=True)
    category = Column(String(50), nullable=False)  # 'demography', 'finance', 'education', 'health', 'infrastructure', 'governance', 'agriculture', 'sdg'
    baseline_value = Column(String(50), nullable=True)
    current_value = Column(String(50), nullable=False)
    target_value = Column(String(50), nullable=True)
    unit = Column(String(50), nullable=True)
    progress_percent = Column(Integer, default=0)
    fiscal_year = Column(String(30), default='२०८१/०८२')
    sdg_goal = Column(String(80), nullable=True)
    status = Column(String(30), default='on_track')  # 'achieved', 'on_track', 'needs_attention'
    ward_breakdown = Column(JSON, nullable=True)
    trend_history = Column(JSON, nullable=True)
    source_department = Column(String(150), nullable=True)
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)


class CitizenDataRequest(Base):
    """Citizen open data requests and Right to Information inquiries."""
    __tablename__ = 'citizen_data_requests'

    tenant_id = Column(String, nullable=True, index=True)
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    full_name = Column(String(150), nullable=False)
    phone = Column(String(30), nullable=False)
    email = Column(String(100), nullable=True)
    organization = Column(String(150), nullable=True)
    dataset_title = Column(String(255), nullable=False)
    purpose = Column(Text, nullable=False)
    ward_number = Column(Integer, default=0)
    status = Column(String(50), default='दर्ता भएको')
    response_note = Column(Text, nullable=True)
    response_file_url = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
