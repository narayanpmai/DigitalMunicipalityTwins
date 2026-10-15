from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, JSON, Text
from core.database import Base
from datetime import datetime
import uuid

class LandClassification(Base):
    """
    Land Classification (जग्गा वर्गीकरण) under Nepal Land Use Act 2076 (भू-उपयोग ऐन, २०७६).
    Stores spatial polygons and attributes for all classified zones in the municipality.
    """
    __tablename__ = 'gis_land_classifications'

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String, default='panchpokhari', index=True, nullable=True)
    ward_no = Column(Integer, index=True, nullable=False)
    
    # 9 Official Zones as per Land Use Act: AGR, RES, COM, IND, MIN, CULARCH, FOR, PUB, HYD
    zone_code = Column(String(20), index=True, nullable=False)
    zone_name_np = Column(String(100), nullable=False)
    zone_name_en = Column(String(100), nullable=False)
    color = Column(String(20), default='#10b981')
    
    area_sqm = Column(Float, default=0.0)
    area_hectare = Column(Float, default=0.0)
    area_ropani_str = Column(String(100), nullable=True)
    
    remarks = Column(String(255), nullable=True)
    hazard_info = Column(JSON, default=dict, nullable=True)
    rules_np = Column(Text, nullable=True)
    
    # GeoJSON geometry in EPSG:4326 (MultiPolygon or Polygon)
    geojson_geometry = Column(JSON, nullable=False)
    bbox = Column(JSON, nullable=True) # [minX, minY, maxX, maxY]

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class WardBoundary(Base):
    """
    Ward Boundary polygons (वडा सिमाना) of the municipality.
    """
    __tablename__ = 'gis_ward_boundaries'

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String, default='panchpokhari', index=True, nullable=True)
    ward_no = Column(Integer, index=True, nullable=False)
    ward_name_np = Column(String(100), nullable=False)
    
    area_sqm = Column(Float, default=0.0)
    area_hectare = Column(Float, default=0.0)
    center_lat = Column(Float, nullable=True)
    center_lng = Column(Float, nullable=True)
    
    # GeoJSON geometry in EPSG:4326
    geojson_geometry = Column(JSON, nullable=False)
    bbox = Column(JSON, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class CadastreParcel(Base):
    """
    Cadastral parcel boundaries (५३,१८० कित्ता नापी नक्सा) from Geodatabase Cadastre layer.
    """
    __tablename__ = 'gis_cadastre_parcels'

    id = Column(String, primary_key=True)
    tenant_id = Column(String, default='panchpokhari', index=True, nullable=True)
    parcel_key = Column(String(100), index=True, nullable=True)
    parcel_no = Column(String(50), index=True, nullable=False)
    ward_no = Column(Integer, index=True, nullable=False)
    grid_sheet = Column(String(50), nullable=True)
    parcel_type = Column(String(50), nullable=True)
    
    area_sqm = Column(Float, default=0.0)
    area_ropani_str = Column(String(100), nullable=True)
    zoning = Column(String(50), nullable=True)
    landuse = Column(String(100), nullable=True)
    
    center_lat = Column(Float, nullable=True)
    center_lng = Column(Float, nullable=True)
    min_lat = Column(Float, nullable=True, index=True)
    max_lat = Column(Float, nullable=True, index=True)
    min_lng = Column(Float, nullable=True, index=True)
    max_lng = Column(Float, nullable=True, index=True)
    
    geojson_geometry = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

