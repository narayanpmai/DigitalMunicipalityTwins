from sqlalchemy import Column, String, Integer, Numeric, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from core.database import Base
from datetime import datetime
import uuid

class Infrastructure(Base):
    __tablename__ = 'infrastructure'
    __table_args__ = {'extend_existing': True}
    
    tenant_id = Column(String, nullable=True, name='tenant_id', default='f07c2bcc-81ad-4e27-aeff-1a65f04e9f06')
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String)
    name_en = Column(String, nullable=True, name='nameEn')
    type = Column(String)
    status = Column(String, default='operational')
    ward_number = Column(Integer, nullable=True, name='wardNumber')
    location = Column(String, nullable=True)
    lat = Column(Numeric(10, 6), nullable=True)
    lng = Column(Numeric(10, 6), nullable=True)
    description = Column(Text, nullable=True)
    construction_cost = Column(Numeric(15, 2), nullable=True, name='constructionCost')
    length_km = Column(Numeric(10, 2), nullable=True, name='lengthKm')
    beneficiary_households = Column(Integer, nullable=True, name='beneficiaryHouseholds')
    beneficiary_population = Column(Integer, nullable=True, name='beneficiaryPopulation')
    constructed_year = Column(Integer, nullable=True, name='constructedYear')
    contractor = Column(String, nullable=True)
    condition = Column(String, nullable=True)
    last_maintenance_date = Column(DateTime, nullable=True, name='lastMaintenanceDate')
    project_id = Column(String, nullable=True, name='projectId')
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, name='updatedAt')
    deleted_at = Column(DateTime, nullable=True, name='deletedAt')

    def to_dict(self):
        return {
            "id": str(self.id),
            "tenantId": self.tenant_id,
            "name": self.name,
            "nameEn": self.name_en or "",
            "type": self.type,
            "status": self.status or "operational",
            "wardNumber": int(self.ward_number or 1),
            "location": self.location or "",
            "lat": float(self.lat) if self.lat is not None else None,
            "lng": float(self.lng) if self.lng is not None else None,
            "description": self.description or "",
            "constructionCost": float(self.construction_cost or 0),
            "lengthKm": float(self.length_km or 0),
            "beneficiaryHouseholds": int(self.beneficiary_households or 0),
            "beneficiaryPopulation": int(self.beneficiary_population or 0),
            "constructedYear": self.constructed_year,
            "contractor": self.contractor or "",
            "condition": self.condition or "सन्तोषजनक (Good)",
            "lastMaintenanceDate": self.last_maintenance_date.isoformat() if self.last_maintenance_date else None,
            "projectId": self.project_id or "",
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }
