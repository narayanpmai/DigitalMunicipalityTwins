from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from schemas.gis import BufferRequest, RiskAnalysisRequest, GeoJSONFeatureCollection, Coordinate
from shapely.geometry import Point
from core.database import get_db
from core.tenant import get_current_tenant
from models.tenant import Tenant
from models.municipality import MunicipalityProfile
from models.gis_resources import NaturalResourceMaster, EnvironmentalRiskZone, TourismHeritageMaster, PublicLandMaster
from typing import Optional, List, Dict, Any
from fastapi import Body
from sqlalchemy import func, or_
import math
import uuid
from datetime import datetime

router = APIRouter(
    prefix="/api/v1/gis",
    tags=["GIS"]
)

@router.get("/boundary")
def get_tenant_boundary(
    tenant: Tenant = Depends(get_current_tenant),
    db: Session = Depends(get_db)
):
    profile = db.query(MunicipalityProfile).filter(MunicipalityProfile.tenant_id == tenant.id).first()
    if not profile or not profile.boundaries:
        # Fallback empty GeoJSON
        return {
            "type": "FeatureCollection",
            "features": [],
            "center": [27.9850, 85.7580], # Default Panchpokhari center fallback
            "zoom": 11
        }
    
    return {
        "type": "FeatureCollection",
        "features": [profile.boundaries], # Assuming boundaries stores the Feature or Polygon
        "center": profile.boundaries.get("center", [27.9850, 85.7580]),
        "zoom": profile.boundaries.get("zoom", 11)
    }

@router.get("/infrastructure", response_model=GeoJSONFeatureCollection)
def get_infrastructure():
    # Mocking data, usually fetched from a DB (like PostGIS)
    return {
        "type": "FeatureCollection",
        "features": []
    }

@router.get("/facilities")
def get_facilities():
    # Mocking data
    return []

@router.post("/buffer-analysis")
def calculate_buffer(request: BufferRequest):
    # Geodesic buffer calculation using shapely
    # Note: A real implementation would project to a local CRS, buffer, and project back
    # Here we do a simplified buffer for demonstration
    point = Point(request.lng, request.lat)
    # Approx degrees for meters
    buffer_degrees = request.buffer_meters / 111320.0 
    buffered_polygon = point.buffer(buffer_degrees)
    
    return {
        "type": "Polygon",
        "coordinates": [list(buffered_polygon.exterior.coords)]
    }

@router.post("/risk-zoning")
def analyze_risk(request: RiskAnalysisRequest):
    return {
        "ward": request.ward_no,
        "hazard_type": request.hazard_type or "all",
        "risk_level": "medium",
        "affected_households": 150
    }

@router.put("/facilities/{id}/location")
def update_facility_location(id: str, request: Coordinate):
    # Mock updating DB
    return {"message": "Location updated successfully", "id": id, "lat": request.lat, "lng": request.lng}


# ==========================================
# ENVIRONMENTAL RISKS (वातावरणीय तथा विपद् जोखिम)
# ==========================================

@router.get("/environmental-risks")
def get_environmental_risks(
    risk_type: Optional[str] = Query(None),
    severity_level: Optional[str] = Query(None),
    mitigation_status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(EnvironmentalRiskZone)
    if risk_type and risk_type != 'all':
        query = query.filter(EnvironmentalRiskZone.risk_type == risk_type)
    if severity_level and severity_level != 'all':
        query = query.filter(EnvironmentalRiskZone.severity_level == severity_level)
    if mitigation_status and mitigation_status != 'all':
        query = query.filter(EnvironmentalRiskZone.mitigation_status == mitigation_status)
    if search and search.strip():
        term = f"%{search.strip().lower()}%"
        query = query.filter(
            or_(
                func.lower(EnvironmentalRiskZone.risk_type).like(term),
                func.lower(EnvironmentalRiskZone.severity_level).like(term),
                func.lower(EnvironmentalRiskZone.mitigation_status).like(term)
            )
        )
    records = query.order_by(EnvironmentalRiskZone.created_at.desc()).all()
    return [r.to_dict() for r in records]


@router.get("/environmental-risks/geojson")
def get_environmental_risks_geojson(db: Session = Depends(get_db)):
    records = db.query(EnvironmentalRiskZone).all()
    return {
        "type": "FeatureCollection",
        "features": [r.to_geojson_feature() for r in records]
    }


@router.get("/environmental-risks/stats")
def get_environmental_risks_stats(db: Session = Depends(get_db)):
    total = db.query(EnvironmentalRiskZone).count()
    high_extreme = db.query(EnvironmentalRiskZone).filter(EnvironmentalRiskZone.severity_level.in_(['High', 'Extreme', 'उच्च', 'अति उच्च'])).count()
    mitigated = db.query(EnvironmentalRiskZone).filter(EnvironmentalRiskZone.mitigation_status.in_(['Mitigated', 'निवारण गरिएको', 'Early Warning Installed'])).count()
    in_progress = db.query(EnvironmentalRiskZone).filter(EnvironmentalRiskZone.mitigation_status.in_(['In Progress', 'कार्य प्रगतिमा', 'Monitoring'])).count()
    
    return {
        "totalRisks": total,
        "highOrExtreme": high_extreme,
        "mitigated": mitigated,
        "inProgress": in_progress,
    }


@router.get("/environmental-risks/{id}")
def get_environmental_risk(id: str, db: Session = Depends(get_db)):
    record = db.query(EnvironmentalRiskZone).filter(EnvironmentalRiskZone.id == id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Environmental risk record not found")
    return record.to_dict()


@router.post("/environmental-risks")
def create_environmental_risk(data: Dict[str, Any] = Body(...), db: Session = Depends(get_db)):
    rec_id = data.get("id") or f"RISK-{uuid.uuid4().hex[:8].upper()}"
    new_rec = EnvironmentalRiskZone(
        id=rec_id,
        tenant_id=data.get("tenant_id") or "f07c2bcc-81ad-4e27-aeff-1a65f04e9f06",
        risk_type=data.get("risk_type") or data.get("riskType") or "Landslide",
        severity_level=data.get("severity_level") or data.get("severityLevel") or "High",
        mitigation_status=data.get("mitigation_status") or data.get("mitigationStatus") or "Monitoring",
        gis_polygon=data.get("gis_polygon") or data.get("gisPolygon") or {"type": "Polygon", "coordinates": []}
    )
    db.add(new_rec)
    db.commit()
    db.refresh(new_rec)
    return new_rec.to_dict()


@router.put("/environmental-risks/{id}")
def update_environmental_risk(id: str, data: Dict[str, Any] = Body(...), db: Session = Depends(get_db)):
    record = db.query(EnvironmentalRiskZone).filter(EnvironmentalRiskZone.id == id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Environmental risk record not found")
    
    if "risk_type" in data or "riskType" in data:
        record.risk_type = data.get("risk_type") or data.get("riskType")
    if "severity_level" in data or "severityLevel" in data:
        record.severity_level = data.get("severity_level") or data.get("severityLevel")
    if "mitigation_status" in data or "mitigationStatus" in data:
        record.mitigation_status = data.get("mitigation_status") or data.get("mitigationStatus")
    if "gis_polygon" in data or "gisPolygon" in data:
        record.gis_polygon = data.get("gis_polygon") or data.get("gisPolygon")
    
    record.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(record)
    return record.to_dict()


@router.delete("/environmental-risks/{id}")
def delete_environmental_risk(id: str, db: Session = Depends(get_db)):
    record = db.query(EnvironmentalRiskZone).filter(EnvironmentalRiskZone.id == id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Environmental risk record not found")
    db.delete(record)
    db.commit()
    return {"success": True, "message": "Environmental risk deleted successfully"}


# ==========================================
# NATURAL RESOURCES (प्राकृतिक स्रोत तथा जलाधार)
# ==========================================

@router.get("/natural-resources")
def get_natural_resources(
    resource_type: Optional[str] = Query(None),
    ward_id: Optional[str] = Query(None),
    conservation_status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(NaturalResourceMaster)
    if resource_type and resource_type != 'all':
        query = query.filter(NaturalResourceMaster.resource_type == resource_type)
    if ward_id and ward_id != 'all':
        query = query.filter(NaturalResourceMaster.ward_id == str(ward_id))
    if conservation_status and conservation_status != 'all':
        query = query.filter(NaturalResourceMaster.conservation_status == conservation_status)
    if search and search.strip():
        term = f"%{search.strip().lower()}%"
        query = query.filter(
            or_(
                func.lower(NaturalResourceMaster.name).like(term),
                func.lower(NaturalResourceMaster.resource_type).like(term),
                func.lower(NaturalResourceMaster.conservation_status).like(term)
            )
        )
    records = query.order_by(NaturalResourceMaster.created_at.desc()).all()
    return [r.to_dict() for r in records]


@router.get("/natural-resources/geojson")
def get_natural_resources_geojson(db: Session = Depends(get_db)):
    records = db.query(NaturalResourceMaster).all()
    return {
        "type": "FeatureCollection",
        "features": [r.to_geojson_feature() for r in records]
    }


@router.get("/natural-resources/stats")
def get_natural_resources_stats(db: Session = Depends(get_db)):
    total = db.query(NaturalResourceMaster).count()
    protected = db.query(NaturalResourceMaster).filter(NaturalResourceMaster.conservation_status.in_(['Protected', 'संरक्षित', 'National Park Area'])).count()
    community_managed = db.query(NaturalResourceMaster).filter(NaturalResourceMaster.conservation_status.in_(['Community Managed', 'सामुदायिक व्यवस्थापन'])).count()
    water_bodies = db.query(NaturalResourceMaster).filter(NaturalResourceMaster.resource_type.in_(['River', 'River/Stream', 'Glacial Lake', 'Wetland', 'Spring', 'खोला/जलाधार', 'ताल/कुण्ड'])).count()
    
    return {
        "totalResources": total,
        "protected": protected,
        "communityManaged": community_managed,
        "waterBodies": water_bodies,
    }


@router.get("/natural-resources/{id}")
def get_natural_resource(id: str, db: Session = Depends(get_db)):
    record = db.query(NaturalResourceMaster).filter(NaturalResourceMaster.id == id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Natural resource record not found")
    return record.to_dict()


@router.post("/natural-resources")
def create_natural_resource(data: Dict[str, Any] = Body(...), db: Session = Depends(get_db)):
    rec_id = data.get("id") or f"NAT-{uuid.uuid4().hex[:8].upper()}"
    new_rec = NaturalResourceMaster(
        id=rec_id,
        tenant_id=data.get("tenant_id") or "f07c2bcc-81ad-4e27-aeff-1a65f04e9f06",
        resource_type=data.get("resource_type") or data.get("resourceType") or "Community Forest",
        name=data.get("name") or "नयाँ प्राकृतिक स्रोत",
        ward_id=str(data.get("ward_id") or data.get("wardId") or "1"),
        area_or_length=float(data.get("area_or_length") or data.get("areaOrLength") or 0.0),
        conservation_status=data.get("conservation_status") or data.get("conservationStatus") or "Community Managed",
        management_committee_id=data.get("management_committee_id") or data.get("managementCommitteeId"),
        gis_geometry=data.get("gis_geometry") or data.get("gisGeometry") or {"type": "Point", "coordinates": [85.7142, 28.0415]}
    )
    db.add(new_rec)
    db.commit()
    db.refresh(new_rec)
    return new_rec.to_dict()


@router.put("/natural-resources/{id}")
def update_natural_resource(id: str, data: Dict[str, Any] = Body(...), db: Session = Depends(get_db)):
    record = db.query(NaturalResourceMaster).filter(NaturalResourceMaster.id == id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Natural resource record not found")
    
    if "name" in data:
        record.name = data["name"]
    if "resource_type" in data or "resourceType" in data:
        record.resource_type = data.get("resource_type") or data.get("resourceType")
    if "ward_id" in data or "wardId" in data:
        record.ward_id = str(data.get("ward_id") or data.get("wardId"))
    if "area_or_length" in data or "areaOrLength" in data:
        record.area_or_length = float(data.get("area_or_length") or data.get("areaOrLength"))
    if "conservation_status" in data or "conservationStatus" in data:
        record.conservation_status = data.get("conservation_status") or data.get("conservationStatus")
    if "management_committee_id" in data or "managementCommitteeId" in data:
        record.management_committee_id = data.get("management_committee_id") or data.get("managementCommitteeId")
    if "gis_geometry" in data or "gisGeometry" in data:
        record.gis_geometry = data.get("gis_geometry") or data.get("gisGeometry")
    
    record.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(record)
    return record.to_dict()


@router.delete("/natural-resources/{id}")
def delete_natural_resource(id: str, db: Session = Depends(get_db)):
    record = db.query(NaturalResourceMaster).filter(NaturalResourceMaster.id == id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Natural resource record not found")
    db.delete(record)
    db.commit()
    return {"success": True, "message": "Natural resource deleted successfully"}
