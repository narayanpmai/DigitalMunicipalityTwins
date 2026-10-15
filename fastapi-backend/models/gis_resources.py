from sqlalchemy import Column, String, Integer, Float, Boolean, Date, DateTime, JSON, ForeignKey, Text
from sqlalchemy.orm import relationship
from core.database import Base
from datetime import datetime
import uuid

class PublicLandMaster(Base):
    """Tracks government, public, and encroached lands."""
    __tablename__ = 'gis_public_lands'
    
    tenant_id = Column(String, index=True, nullable=True)
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    kitta_no = Column(String, index=True, nullable=True) # Parcel Number
    ward_id = Column(String, nullable=True)
    area_sqm = Column(Float, nullable=True)
    land_type = Column(String, nullable=False) # Ailani, Guthi, Government, Forest
    current_use = Column(String, nullable=True) # Empty, Encroached, Park, Facility
    encroachment_details = Column(Text, nullable=True)
    gis_polygon = Column(JSON, nullable=True) # GeoJSON Polygon
    
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)


class NaturalResourceMaster(Base):
    """Tracks rivers, forests, mines, and lakes."""
    __tablename__ = 'gis_natural_resources'
    
    tenant_id = Column(String, index=True, nullable=True)
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    resource_type = Column(String, nullable=False) # River, Spring, Community Forest, Wetland, Mine
    name = Column(String, nullable=False)
    ward_id = Column(String, nullable=True)
    area_or_length = Column(Float, nullable=True)
    conservation_status = Column(String, nullable=True) # Protected, Exploited, Endangered
    management_committee_id = Column(String, nullable=True) # FK -> OrganizationMaster
    gis_geometry = Column(JSON, nullable=True) # GeoJSON Point, LineString, or Polygon
    
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "tenant_id": self.tenant_id,
            "resource_type": self.resource_type,
            "resourceType": self.resource_type,
            "name": self.name,
            "ward_id": self.ward_id,
            "wardId": self.ward_id,
            "area_or_length": self.area_or_length,
            "areaOrLength": self.area_or_length,
            "conservation_status": self.conservation_status,
            "conservationStatus": self.conservation_status,
            "management_committee_id": self.management_committee_id,
            "managementCommitteeId": self.management_committee_id,
            "gis_geometry": self.gis_geometry,
            "gisGeometry": self.gis_geometry,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

    def to_geojson_feature(self):
        return {
            "type": "Feature",
            "geometry": self.gis_geometry if self.gis_geometry else {"type": "Point", "coordinates": [85.7142, 28.0415]},
            "properties": {
                "id": self.id,
                "name": self.name,
                "resourceType": self.resource_type,
                "wardId": self.ward_id,
                "areaOrLength": self.area_or_length,
                "conservationStatus": self.conservation_status,
                "managementCommitteeId": self.management_committee_id,
            }
        }


class TourismHeritageMaster(Base):
    """Tracks cultural and tourism destinations."""
    __tablename__ = 'gis_tourism_heritage'
    
    tenant_id = Column(String, index=True, nullable=True)
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    category = Column(String, nullable=False) # Temple, Viewpoint, Trail, Homestay
    historical_significance = Column(Text, nullable=True)
    visitor_count_annual = Column(Integer, default=0)
    gis_geometry = Column(JSON, nullable=True)
    photos = Column(JSON, nullable=True) # List of URLs
    
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "tenant_id": self.tenant_id,
            "name": self.name,
            "category": self.category,
            "historical_significance": self.historical_significance,
            "historicalSignificance": self.historical_significance,
            "visitor_count_annual": self.visitor_count_annual,
            "visitorCountAnnual": self.visitor_count_annual,
            "gis_geometry": self.gis_geometry,
            "gisGeometry": self.gis_geometry,
            "photos": self.photos or [],
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class EnvironmentalRiskZone(Base):
    """Polygons drawn by engineers denoting risk areas."""
    __tablename__ = 'gis_environmental_risks'
    
    tenant_id = Column(String, index=True, nullable=True)
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    risk_type = Column(String, nullable=False) # Flood Plain, Landslide Zone, Sinkhole
    severity_level = Column(String, nullable=False) # High, Medium, Low
    mitigation_status = Column(String, nullable=True)
    gis_polygon = Column(JSON, nullable=False) # Must be a Polygon
    
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "tenant_id": self.tenant_id,
            "risk_type": self.risk_type,
            "riskType": self.risk_type,
            "severity_level": self.severity_level,
            "severityLevel": self.severity_level,
            "mitigation_status": self.mitigation_status,
            "mitigationStatus": self.mitigation_status,
            "gis_polygon": self.gis_polygon,
            "gisPolygon": self.gis_polygon,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

    def to_geojson_feature(self):
        return {
            "type": "Feature",
            "geometry": self.gis_polygon if self.gis_polygon else {"type": "Polygon", "coordinates": []},
            "properties": {
                "id": self.id,
                "riskType": self.risk_type,
                "severityLevel": self.severity_level,
                "mitigationStatus": self.mitigation_status,
            }
        }
