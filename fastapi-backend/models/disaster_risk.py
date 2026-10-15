from sqlalchemy import Column, String, Integer, Float, Boolean, Date, DateTime, Numeric, JSON, ForeignKey, Text
from sqlalchemy.orm import relationship
from core.database import Base
from datetime import datetime
import uuid

class DisasterPreparednessItem(Base):
    """Tracks emergency stock, rescue equipment, shelters, and volunteers."""
    __tablename__ = 'drrm_preparedness_items'
    
    tenant_id = Column(String, index=True, nullable=True)
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    item_type = Column(String, nullable=False) # Rescue Equipment, Relief Stock, Shelter, Ambulance, Volunteer
    name_or_title = Column(String, nullable=False)
    quantity_capacity = Column(Float, default=1.0)
    current_location = Column(String, nullable=True)
    contact_person_id = Column(String, nullable=True) # Employee or Citizen ID
    contact_phone = Column(String, nullable=True)
    status = Column(String, default='Ready') # Ready, Under Maintenance, Deployed
    
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)


class DisasterIncident(Base):
    """Logs when a disaster actually strikes."""
    __tablename__ = 'drrm_incidents'
    
    tenant_id = Column(String, index=True, nullable=True)
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    incident_type = Column(String, nullable=False) # Flood, Landslide, Fire, Earthquake, Epidemic
    incident_date = Column(DateTime(timezone=True), nullable=False)
    ward_id = Column(String, nullable=True)
    severity = Column(String, default='Medium') # Critical, High, Medium, Low
    description = Column(Text, nullable=False)
    gis_location = Column(JSON, nullable=True) # GeoJSON Point
    status = Column(String, default='Active') # Active, Contained, Closed
    
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    
    damage_reports = relationship("IncidentDamageReport", back_populates="incident")
    recovery_projects = relationship("RecoveryProject", back_populates="incident")

    def to_dict(self):
        return {
            "id": self.id,
            "tenant_id": self.tenant_id,
            "incident_type": self.incident_type,
            "incident_date": self.incident_date.isoformat() if self.incident_date else None,
            "ward_id": self.ward_id,
            "severity": self.severity,
            "description": self.description,
            "gis_location": self.gis_location,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class IncidentDamageReport(Base):
    """Post-incident rapid assessment for damages and casualties."""
    __tablename__ = 'drrm_damage_reports'
    
    tenant_id = Column(String, index=True, nullable=True)
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    incident_id = Column(String, ForeignKey('drrm_incidents.id'), nullable=False)
    
    affected_household_id = Column(String, nullable=True) # Link to HouseholdMaster
    affected_infrastructure_id = Column(String, nullable=True) # Link to InfrastructureMaster
    
    human_casualties = Column(Integer, default=0)
    injured_count = Column(Integer, default=0)
    estimated_loss_amount = Column(Numeric(15, 2), default=0.00)
    relief_provided = Column(JSON, nullable=True) # Details of immediate relief (cash, food tents)
    
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    
    incident = relationship("DisasterIncident", back_populates="damage_reports")

    def to_dict(self):
        return {
            "id": self.id,
            "tenant_id": self.tenant_id,
            "incident_id": self.incident_id,
            "incident_description": self.incident.description if self.incident else None,
            "affected_household_id": self.affected_household_id,
            "affected_infrastructure_id": self.affected_infrastructure_id,
            "human_casualties": self.human_casualties or 0,
            "injured_count": self.injured_count or 0,
            "estimated_loss_amount": float(self.estimated_loss_amount or 0),
            "relief_provided": self.relief_provided or {},
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class RecoveryProject(Base):
    """Long-term recovery efforts, linked back to Phase 4 Projects."""
    __tablename__ = 'drrm_recovery_projects'
    
    tenant_id = Column(String, index=True, nullable=True)
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    incident_id = Column(String, ForeignKey('drrm_incidents.id'), nullable=False)
    project_id = Column(String, nullable=True) # FK to Phase 4 ProjectExecution
    
    reconstruction_type = Column(String, nullable=False) # Housing, Road, Health Facility
    beneficiary_household_id = Column(String, nullable=True)
    recovery_status = Column(String, default='Planned') # Planned, In Progress, Completed
    
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    
    incident = relationship("DisasterIncident", back_populates="recovery_projects")

    def to_dict(self):
        return {
            "id": self.id,
            "tenant_id": self.tenant_id,
            "incident_id": self.incident_id,
            "incident_type": self.incident.incident_type if self.incident else None,
            "incident_description": self.incident.description if self.incident else None,
            "ward_id": self.incident.ward_id if self.incident else None,
            "project_id": self.project_id,
            "reconstruction_type": self.reconstruction_type,
            "beneficiary_household_id": self.beneficiary_household_id,
            "recovery_status": self.recovery_status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
