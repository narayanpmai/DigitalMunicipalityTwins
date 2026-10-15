from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List

class Coordinate(BaseModel):
    lat: float
    lng: float

class BufferRequest(Coordinate):
    buffer_meters: Optional[float] = 100.0

class RiskAnalysisRequest(BaseModel):
    ward_no: int
    hazard_type: Optional[str] = None

class FeatureGeometry(BaseModel):
    type: str
    coordinates: List[Any]

class GeoJSONFeature(BaseModel):
    type: str = "Feature"
    geometry: FeatureGeometry
    properties: Dict[str, Any]

class GeoJSONFeatureCollection(BaseModel):
    type: str = "FeatureCollection"
    features: List[GeoJSONFeature]
