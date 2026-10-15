from sqlalchemy import Column, String, Integer, Float, Boolean, Date, DateTime, Numeric, JSON, ForeignKey, Text
from sqlalchemy.orm import relationship
from core.database import Base
from datetime import datetime
import uuid

class EBPSApplication(Base):
    """Core record for an Electronic Building Permit Application."""
    __tablename__ = 'ebps_applications'
    
    tenant_id = Column(String, index=True, nullable=True)
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    application_no = Column(String, unique=True, index=True, nullable=False)
    
    landowner_citizen_id = Column(String, nullable=False) # Link to MDM Citizen
    consultant_id = Column(String, nullable=False) # Link to Business/Consultant
    
    kitta_no = Column(String, nullable=False)
    ward_id = Column(String, nullable=False)
    land_area_sqm = Column(Float, nullable=False)
    
    building_type = Column(String, nullable=False) # Residential, Commercial, Institutional
    structure_type = Column(String, nullable=False) # RCC, Load Bearing
    total_floors = Column(Float, nullable=False)
    
    status = Column(String, default='Draft') # Draft, Desk Review, Public Notice, Plinth Approved, Super Structure, Completed, Rejected
    gis_polygon = Column(JSON, nullable=True) # Plot boundary
    
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    
    scrutinies = relationship("EBPSDesignScrutiny", back_populates="application")
    workflow_steps = relationship("EBPSWorkflowStep", back_populates="application")
    inspections = relationship("EBPSFieldInspection", back_populates="application")


class EBPSDesignScrutiny(Base):
    """Technical verification of building codes against the submitted design."""
    __tablename__ = 'ebps_design_scrutiny'
    
    tenant_id = Column(String, index=True, nullable=True)
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    application_id = Column(String, ForeignKey('ebps_applications.id'), nullable=False)
    
    proposed_far = Column(Float, nullable=False)
    allowed_far = Column(Float, nullable=False)
    proposed_ground_coverage = Column(Float, nullable=False)
    allowed_ground_coverage = Column(Float, nullable=False)
    
    road_width_ft = Column(Float, nullable=False)
    setback_front_ft = Column(Float, nullable=False)
    setback_rear_ft = Column(Float, nullable=False)
    setback_side_ft = Column(Float, nullable=False)
    
    is_code_compliant = Column(Boolean, default=False)
    engineer_id = Column(String, nullable=False)
    remarks = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    
    application = relationship("EBPSApplication", back_populates="scrutinies")


class EBPSWorkflowStep(Base):
    """Tracks the progress and approvals through the EBPS pipeline."""
    __tablename__ = 'ebps_workflow_steps'
    
    tenant_id = Column(String, index=True, nullable=True)
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    application_id = Column(String, ForeignKey('ebps_applications.id'), nullable=False)
    
    step_name = Column(String, nullable=False) # Desk Review, 15-day Notice, Plinth Inspection
    action_by = Column(String, nullable=False)
    action_date = Column(DateTime(timezone=True), default=datetime.utcnow)
    outcome = Column(String, nullable=False) # Approved, Objection Filed, Revise, Cleared
    comments = Column(Text, nullable=True)
    attachment_urls = Column(JSON, nullable=True)
    
    application = relationship("EBPSApplication", back_populates="workflow_steps")


class EBPSFieldInspection(Base):
    """Logs physical site visits by engineers using the mobile app."""
    __tablename__ = 'ebps_field_inspections'
    
    tenant_id = Column(String, index=True, nullable=True)
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    application_id = Column(String, ForeignKey('ebps_applications.id'), nullable=False)
    
    inspection_type = Column(String, nullable=False) # Foundation, Plinth, Super Structure
    inspector_id = Column(String, nullable=False)
    inspection_date = Column(DateTime(timezone=True), default=datetime.utcnow)
    
    gps_coordinates = Column(JSON, nullable=True) # GeoJSON Point of where the engineer took the photo
    photos = Column(JSON, nullable=True) # List of URLs
    
    is_approved = Column(Boolean, default=False)
    remarks = Column(Text, nullable=True)
    
    application = relationship("EBPSApplication", back_populates="inspections")
