from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class DashboardAnalyticsCacheBase(BaseModel):
    metric_key: str
    metric_value: Dict[str, Any]

class DashboardAnalyticsCacheCreate(DashboardAnalyticsCacheBase):
    pass

class DashboardAnalyticsCacheResponse(DashboardAnalyticsCacheBase):
    id: str
    tenant_id: Optional[str] = None
    last_calculated_at: datetime
    class Config:
        from_attributes = True


class OpenDataPublicationBase(BaseModel):
    dataset_name: str
    category: Optional[str] = 'datasets'
    description: Optional[str] = None
    source_table_or_query: str
    format: Optional[str] = 'JSON, CSV'
    record_count: Optional[int] = 0
    download_count: Optional[int] = 0
    api_endpoint: Optional[str] = None
    is_published: Optional[bool] = True
    published_by: Optional[str] = None

class OpenDataPublicationCreate(OpenDataPublicationBase):
    pass

class OpenDataPublicationResponse(OpenDataPublicationBase):
    id: str
    tenant_id: Optional[str] = None
    created_at: datetime
    last_updated: datetime
    class Config:
        from_attributes = True
