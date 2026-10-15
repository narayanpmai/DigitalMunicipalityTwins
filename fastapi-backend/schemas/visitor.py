from pydantic import BaseModel, Field
from typing import Optional, List, Any
from datetime import datetime

class VisitorBase(BaseModel):
    fiscal_year: str
    month: Optional[int] = None
    visitor_type: str = Field(default='domestic', description="'domestic' | 'international'")
    count: int = 0
    destination: Optional[str] = None
    revenue_npr: Optional[float] = None
    average_stay_days: Optional[int] = None
    nationality: Optional[str] = None
    notes: Optional[str] = None

class VisitorCreate(VisitorBase):
    pass

class VisitorUpdate(BaseModel):
    fiscal_year: Optional[str] = None
    month: Optional[int] = None
    visitor_type: Optional[str] = None
    count: Optional[int] = None
    destination: Optional[str] = None
    revenue_npr: Optional[float] = None
    average_stay_days: Optional[int] = None
    nationality: Optional[str] = None
    notes: Optional[str] = None

class VisitorSchema(VisitorBase):
    id: Any
    tenant_id: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class VisitorSummaryItem(BaseModel):
    visitorType: str
    totalCount: int
    totalRevenue: Optional[float] = 0.0
