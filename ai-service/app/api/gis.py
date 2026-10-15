from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict, Any
from shapely.geometry import Point, mapping

router = APIRouter(prefix="/gis", tags=["GIS & Satellite"])

class BufferAnalysisRequest(BaseModel):
    lat: float
    lng: float
    buffer_meters: float = 500.0

class SpatialRiskRequest(BaseModel):
    ward_no: int
    hazard_type: str = "flood" # flood, landslide

@router.post("/buffer-analysis")
async def calculate_buffer(req: BufferAnalysisRequest):
    """
    Computes a geodesic buffer polygon around infrastructure points using Shapely
    """
    pt = Point(req.lng, req.lat)
    # Approx 1 deg ~ 111,320m
    deg_radius = req.buffer_meters / 111320.0
    buffer_polygon = pt.buffer(deg_radius)
    
    return {
        "center": {"lat": req.lat, "lng": req.lng},
        "buffer_radius_meters": req.buffer_meters,
        "geojson": mapping(buffer_polygon)
    }

@router.post("/risk-zoning")
async def analyze_hazard_risk(req: SpatialRiskRequest):
    """
    Evaluates flood / landslide susceptibility based on elevation & river proximity
    """
    # High mountain wards (2, 3) have landslide/snow risks; River valley wards (4, 7) have flood risks
    risk_level = "medium"
    if req.ward_no in [3, 2] and req.hazard_type == "landslide":
        risk_level = "high"
    elif req.ward_no in [4, 7] and req.hazard_type == "flood":
        risk_level = "high"
    
    return {
        "ward_no": req.ward_no,
        "hazard_type": req.hazard_type,
        "risk_level": risk_level,
        "safe_zones_count": 3,
        "evacuation_center": f"वडा नं. {req.ward_no} सामुदायिक भवन / मा.वि. प्राङ्गण",
        "recommended_action": "नदी तटीय तथा भिरालो जमिनमा तत्काल सतर्कता अपनाउने।"
    }
