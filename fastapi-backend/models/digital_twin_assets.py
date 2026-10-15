from sqlalchemy import Column, String, Integer, Float, Boolean, Date, DateTime, Numeric, JSON, ForeignKey, Text
from sqlalchemy.orm import relationship
from core.database import Base
from datetime import datetime
import uuid

class UnifiedAsset(Base):
    """Central Asset Record bridging movable items and infrastructure."""
    __tablename__ = 'dt_unified_assets'
    
    tenant_id = Column(String, index=True, nullable=True)
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    asset_code = Column(String, unique=True, index=True, nullable=False)
    asset_type = Column(String, nullable=False) # Movable, Infrastructure
    category = Column(String, nullable=False) # Vehicle, Road, Building, IT, Furniture, Water
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    
    acquisition_date = Column(Date, nullable=True)
    acquisition_cost = Column(Numeric(15, 2), default=0)
    current_condition = Column(String, default='Operational') # Operational, Needs Repair, Out of Service, Disposed
    
    project_source_id = Column(String, nullable=True) # Links to ProjectHandover ID from Phase 4
    gis_geometry = Column(JSON, nullable=True) # GeoJSON Point, LineString, Polygon
    
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    
    maintenance_logs = relationship("AssetMaintenanceLog", back_populates="asset")
    inspections = relationship("AssetInspection", back_populates="asset")
    assignments = relationship("AssetAssignment", back_populates="asset")


class AssetMaintenanceLog(Base):
    """Tracks repairs, servicing, and upgrades."""
    __tablename__ = 'dt_asset_maintenance_logs'
    
    tenant_id = Column(String, index=True, nullable=True)
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    asset_id = Column(String, ForeignKey('dt_unified_assets.id'), nullable=False)
    maintenance_date = Column(Date, nullable=False)
    maintenance_type = Column(String, nullable=False) # Routine, Breakdown, Upgrade
    performed_by = Column(String, nullable=True)
    cost = Column(Numeric(15, 2), default=0)
    description = Column(Text, nullable=False)
    next_due_date = Column(Date, nullable=True)
    
    asset = relationship("UnifiedAsset", back_populates="maintenance_logs")


class AssetInspection(Base):
    """Routine checks on infrastructure or high-value assets."""
    __tablename__ = 'dt_asset_inspections'
    
    tenant_id = Column(String, index=True, nullable=True)
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    asset_id = Column(String, ForeignKey('dt_unified_assets.id'), nullable=False)
    inspection_date = Column(Date, nullable=False)
    inspector_id = Column(String, nullable=False) # Employee ID
    findings = Column(Text, nullable=False)
    condition_rating = Column(Integer, nullable=True) # 1-5 scale
    photos = Column(JSON, nullable=True) # List of image URLs
    
    asset = relationship("UnifiedAsset", back_populates="inspections")


class AssetAssignment(Base):
    """Tracks custody of movable assets (laptops, vehicles)."""
    __tablename__ = 'dt_asset_assignments'
    
    tenant_id = Column(String, index=True, nullable=True)
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    asset_id = Column(String, ForeignKey('dt_unified_assets.id'), nullable=False)
    assigned_to = Column(String, nullable=False) # Employee ID or Branch Name
    assigned_date = Column(Date, nullable=False)
    returned_date = Column(Date, nullable=True)
    condition_at_assignment = Column(String, nullable=True)
    
    asset = relationship("UnifiedAsset", back_populates="assignments")
