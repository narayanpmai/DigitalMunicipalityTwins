from sqlalchemy import Column, String, Integer, Float, Boolean, Date, DateTime, JSON, ForeignKey, Text
from sqlalchemy.orm import relationship
from core.database import Base
from datetime import datetime
import uuid

class HouseholdSocioEconomicProfile(Base):
    """Extended socio-economic details for the Household Digital Twin."""
    __tablename__ = 'c360_household_socio_economic'
    
    tenant_id = Column(String, index=True, nullable=True)
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    household_id = Column(String, ForeignKey('mdm_households.id'), unique=True, nullable=False)
    
    annual_income_bracket = Column(String, nullable=True) # e.g. '0-5L', '5L-10L'
    primary_occupation = Column(String, nullable=True) # Agriculture, Service, Business
    land_ownership_area_sqm = Column(Float, nullable=True)
    livestock_count = Column(JSON, nullable=True) # e.g. {"cows": 2, "goats": 5}
    
    has_bank_account = Column(Boolean, default=False)
    has_health_insurance = Column(Boolean, default=False)
    has_internet_access = Column(Boolean, default=False)
    
    vulnerability_score = Column(Integer, default=0) # Calculated metric 0-100
    disaster_risk_category = Column(String, default='Low') # High, Medium, Low
    
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "tenant_id": self.tenant_id,
            "household_id": self.household_id,
            "annual_income_bracket": self.annual_income_bracket or "रु २-५ लाख",
            "primary_occupation": self.primary_occupation or "कृषि तथा पशुपालन",
            "land_ownership_area_sqm": self.land_ownership_area_sqm or 0.0,
            "livestock_count": self.livestock_count or {},
            "has_bank_account": bool(self.has_bank_account),
            "has_health_insurance": bool(self.has_health_insurance),
            "has_internet_access": bool(self.has_internet_access),
            "vulnerability_score": self.vulnerability_score or 0,
            "disaster_risk_category": self.disaster_risk_category or "Low",
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class CitizenApplicationLog(Base):
    """A log of all services/applications requested by a citizen for the 360 view."""
    __tablename__ = 'c360_citizen_applications'
    
    tenant_id = Column(String, index=True, nullable=True)
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    citizen_id = Column(String, ForeignKey('mdm_citizens.id'), nullable=False)
    
    service_module = Column(String, nullable=False) # eSifaris, eTax, Agriculture
    application_ref_no = Column(String, nullable=False)
    application_date = Column(Date, nullable=False)
    status = Column(String, default='Pending') # Pending, Approved, Rejected
    
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "tenant_id": self.tenant_id,
            "citizen_id": self.citizen_id,
            "service_module": self.service_module,
            "application_ref_no": self.application_ref_no,
            "application_date": self.application_date.isoformat() if self.application_date else None,
            "status": self.status or "Pending",
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
