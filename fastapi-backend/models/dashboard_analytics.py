from sqlalchemy import Column, String, Boolean, DateTime, JSON, ForeignKey, Text, Integer
from core.database import Base
from datetime import datetime
import uuid

class DashboardAnalyticsCache(Base):
    """Stores pre-calculated metrics for fast loading of dashboards."""
    __tablename__ = 'dash_analytics_cache'
    
    tenant_id = Column(String, index=True, nullable=True)
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    metric_key = Column(String, index=True, nullable=False) # e.g., 'WARD_3_TOTAL_BUDGET'
    metric_value = Column(JSON, nullable=False) # Can be a single number or array for charts
    
    last_calculated_at = Column(DateTime(timezone=True), default=datetime.utcnow)


class OpenDataPublication(Base):
    """Manages which datasets are approved to be visible on the public citizen portal."""
    __tablename__ = 'dash_open_data_publications'
    
    tenant_id = Column(String, index=True, nullable=True)
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    dataset_name = Column(String, nullable=False) # e.g., 'Approved Projects 2081/82'
    category = Column(String, default='datasets')
    description = Column(Text, nullable=True)
    source_table_or_query = Column(String, nullable=False)
    format = Column(String, default='JSON, CSV')
    record_count = Column(Integer, default=0)
    download_count = Column(Integer, default=0)
    api_endpoint = Column(String, nullable=True)
    
    is_published = Column(Boolean, default=True)
    published_by = Column(String, nullable=True) # Employee ID (usually CAO)
    
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    last_updated = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
