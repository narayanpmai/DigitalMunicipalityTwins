from pydantic import BaseModel, Field
from typing import Optional, Any, Dict, List
from datetime import datetime

class OpenDataBase(BaseModel):
    category: str = Field(default='datasets', description="'datasets' | 'reports' | 'strategic' | 'practices'")
    title: str
    sub_category: Optional[str] = None
    fiscal_year: str = '२०८१/०८२'
    ward_number: int = 0
    description: Optional[str] = None
    format: Optional[str] = 'CSV, JSON'
    file_size: Optional[str] = None
    records_count: int = 0
    file_url: Optional[str] = None
    publish_date: Optional[str] = None
    author_or_department: Optional[str] = None
    target_goal: Optional[str] = None
    budget_allocated: float = 0.0
    tag_badge: Optional[str] = None
    status: str = 'प्रकाशित'
    key_indicators: Optional[Any] = None
    sample_data: Optional[Any] = None
    columns_schema: Optional[Any] = None
    license: Optional[str] = 'CC-BY-SA 4.0'
    api_endpoint: Optional[str] = None
    is_featured: Optional[bool] = False
    download_count: int = 0

class OpenDataCreate(OpenDataBase):
    pass

class OpenDataUpdate(BaseModel):
    category: Optional[str] = None
    title: Optional[str] = None
    sub_category: Optional[str] = None
    fiscal_year: Optional[str] = None
    ward_number: Optional[int] = None
    description: Optional[str] = None
    format: Optional[str] = None
    file_size: Optional[str] = None
    records_count: Optional[int] = None
    file_url: Optional[str] = None
    publish_date: Optional[str] = None
    author_or_department: Optional[str] = None
    target_goal: Optional[str] = None
    budget_allocated: Optional[float] = None
    tag_badge: Optional[str] = None
    status: Optional[str] = None
    key_indicators: Optional[Any] = None
    sample_data: Optional[Any] = None
    columns_schema: Optional[Any] = None
    license: Optional[str] = None
    api_endpoint: Optional[str] = None
    is_featured: Optional[bool] = None
    download_count: Optional[int] = None

class OpenDataSchema(OpenDataBase):
    id: Any
    tenant_id: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class OpenDataStats(BaseModel):
    totalDatasets: int
    totalReports: int
    strategicPillars: int
    goodPractices: int
    totalRecordsIndexed: int
    totalDownloads: int
    transparencyScore: float = 88.5
    activeIndicatorsCount: int = 0
    pendingRequestsCount: int = 0


# --- Municipal Indicators Schemas ---
class MunicipalIndicatorBase(BaseModel):
    indicator_code: str
    title_np: str
    title_en: Optional[str] = None
    category: str
    baseline_value: Optional[str] = None
    current_value: str
    target_value: Optional[str] = None
    unit: Optional[str] = None
    progress_percent: int = 0
    fiscal_year: str = '२०८१/०८२'
    sdg_goal: Optional[str] = None
    status: str = 'on_track'
    ward_breakdown: Optional[Any] = None
    trend_history: Optional[Any] = None
    source_department: Optional[str] = None

class MunicipalIndicatorCreate(MunicipalIndicatorBase):
    pass

class MunicipalIndicatorUpdate(BaseModel):
    title_np: Optional[str] = None
    title_en: Optional[str] = None
    category: Optional[str] = None
    baseline_value: Optional[str] = None
    current_value: Optional[str] = None
    target_value: Optional[str] = None
    unit: Optional[str] = None
    progress_percent: Optional[int] = None
    fiscal_year: Optional[str] = None
    sdg_goal: Optional[str] = None
    status: Optional[str] = None
    ward_breakdown: Optional[Any] = None
    trend_history: Optional[Any] = None
    source_department: Optional[str] = None

class MunicipalIndicatorSchema(MunicipalIndicatorBase):
    id: str
    tenant_id: Optional[str] = None
    last_updated: Optional[datetime] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# --- Citizen Data Request Schemas ---
class CitizenDataRequestBase(BaseModel):
    full_name: str
    phone: str
    email: Optional[str] = None
    organization: Optional[str] = None
    dataset_title: str
    purpose: str
    ward_number: int = 0

class CitizenDataRequestCreate(CitizenDataRequestBase):
    pass

class CitizenDataRequestUpdate(BaseModel):
    status: Optional[str] = None
    response_note: Optional[str] = None
    response_file_url: Optional[str] = None

class CitizenDataRequestSchema(CitizenDataRequestBase):
    id: str
    tenant_id: Optional[str] = None
    status: str
    response_note: Optional[str] = None
    response_file_url: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
