from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Optional, List
import json
import os
from core.database import get_db
from models.land_classification import LandClassification, WardBoundary, CadastreParcel

router = APIRouter(
    prefix="/api/v1/gis/land-classification",
    tags=["Land Classification"]
)

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data")
SUMMARY_CACHE_PATH = os.path.join(DATA_DIR, "land_classification_summary.json")
WARD_GEOJSON_CACHE_PATH = os.path.join(DATA_DIR, "ward_boundaries_geojson.json")
LAND_GEOJSON_CACHE_PATH = os.path.join(DATA_DIR, "land_classification_geojson.json")
CADASTRE_SUMMARY_CACHE_PATH = os.path.join(DATA_DIR, "cadastre_summary.json")

# In-memory fast cache
_cached_summary = None
_cached_wards_geojson = None
_cached_land_features = None
_cached_cadastre_summary = None


def get_summary_data():
    global _cached_summary
    if _cached_summary is None and os.path.exists(SUMMARY_CACHE_PATH):
        try:
            with open(SUMMARY_CACHE_PATH, "r", encoding="utf-8") as f:
                _cached_summary = json.load(f)
        except Exception:
            _cached_summary = None
    return _cached_summary


def get_ward_geojson_data():
    global _cached_wards_geojson
    if _cached_wards_geojson is None and os.path.exists(WARD_GEOJSON_CACHE_PATH):
        try:
            with open(WARD_GEOJSON_CACHE_PATH, "r", encoding="utf-8") as f:
                _cached_wards_geojson = json.load(f)
        except Exception:
            _cached_wards_geojson = None
    return _cached_wards_geojson


def get_land_geojson_features():
    global _cached_land_features
    if _cached_land_features is None and os.path.exists(LAND_GEOJSON_CACHE_PATH):
        try:
            with open(LAND_GEOJSON_CACHE_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
                _cached_land_features = data.get("features", [])
        except Exception:
            _cached_land_features = None
    return _cached_land_features


@router.get("/summary")
def get_classification_summary(db: Session = Depends(get_db)):
    """
    Returns high-level statistics and analytical totals for Land Classification (जग्गा वर्गीकरण)
    including total hectares, ropani equivalents, zone distribution, and per-ward breakdowns.
    """
    summary = get_summary_data()
    if summary:
        return summary

    # Fallback to DB query if file not cached
    zones_db = db.execute(text("""
        SELECT zone_code, zone_name_np, zone_name_en, color,
               COUNT(*) as polygon_count,
               SUM(area_sqm) as total_sqm,
               SUM(area_hectare) as total_ha,
               rules_np
        FROM gis_land_classifications
        GROUP BY zone_code, zone_name_np, zone_name_en, color, rules_np
        ORDER BY total_sqm DESC
    """)).fetchall()

    total_sqm = sum(r[5] for r in zones_db) if zones_db else 0.0

    zones_list = []
    for r in zones_db:
        sqm = float(r[5] or 0)
        pct = (sqm / total_sqm * 100) if total_sqm > 0 else 0
        zones_list.append({
            "zone_code": r[0],
            "zone_name_np": r[1],
            "zone_name_en": r[2],
            "color": r[3],
            "polygon_count": int(r[4]),
            "total_area_sqm": sqm,
            "total_area_ha": round(float(r[6] or 0), 2),
            "percentage": round(pct, 2),
            "rules_np": r[7]
        })

    return {
        "palika_name": "पाँचपोखरी थाङपाल गाउँपालिका",
        "total_polygons": sum(z["polygon_count"] for z in zones_list),
        "total_area_sqm": total_sqm,
        "total_area_ha": round(total_sqm / 10000.0, 2),
        "zones": zones_list,
        "wards": []
    }


@router.get("/wards-geojson")
def get_ward_boundaries_geojson(db: Session = Depends(get_db)):
    """
    Returns GeoJSON FeatureCollection of all Ward Boundaries (1 to 8).
    """
    cached = get_ward_geojson_data()
    if cached:
        return cached

    # Fallback from DB
    wards = db.query(WardBoundary).order_by(WardBoundary.ward_no).all()
    features = []
    for w in wards:
        features.append({
            "type": "Feature",
            "id": w.id,
            "properties": {
                "ward_no": w.ward_no,
                "ward_name": w.ward_name_np,
                "area_sqm": w.area_sqm,
                "area_hectare": w.area_hectare,
                "center": [w.center_lat, w.center_lng]
            },
            "geometry": w.geojson_geometry
        })

    return {
        "type": "FeatureCollection",
        "features": features
    }


@router.get("/geojson")
def get_land_classification_geojson(
    ward: Optional[int] = Query(None, description="Filter by Ward Number (1-8)"),
    zone: Optional[str] = Query(None, description="Filter by Zone Code (e.g. AGR, RES, FOR)"),
    limit: Optional[int] = Query(5000, description="Max features to return"),
    db: Session = Depends(get_db)
):
    """
    Returns GeoJSON FeatureCollection of Land Classification polygons,
    optionally filtered by ward and zone.
    """
    features = get_land_geojson_features()
    if features is not None:
        filtered = features
        if ward is not None and ward > 0:
            filtered = [f for f in filtered if f["properties"].get("ward_no") == ward]
        if zone and zone.strip() and zone.upper() != "ALL":
            zone_upper = zone.strip().upper()
            filtered = [f for f in filtered if f["properties"].get("zone_code") == zone_upper]
        
        return {
            "type": "FeatureCollection",
            "features": filtered[:limit]
        }

    # Fallback to Database query
    query = db.query(LandClassification)
    if ward is not None and ward > 0:
        query = query.filter(LandClassification.ward_no == ward)
    if zone and zone.strip() and zone.upper() != "ALL":
        query = query.filter(LandClassification.zone_code == zone.strip().upper())

    results = query.limit(limit).all()
    db_features = []
    for r in results:
        db_features.append({
            "type": "Feature",
            "id": r.id,
            "properties": {
                "id": r.id,
                "ward_no": r.ward_no,
                "zone_code": r.zone_code,
                "zone_name_np": r.zone_name_np,
                "zone_name_en": r.zone_name_en,
                "color": r.color,
                "area_sqm": r.area_sqm,
                "area_hectare": r.area_hectare,
                "area_ropani": r.area_ropani_str,
                "remarks": r.remarks,
                "hazards": r.hazard_info,
                "rules": r.rules_np
            },
            "geometry": r.geojson_geometry
        })

    return {
        "type": "FeatureCollection",
        "features": db_features
    }


@router.get("/zones")
def get_zone_catalog():
    """
    Returns the official 9 Land Use Zones catalog with metadata, color coding, and Land Use Act rules.
    """
    summary = get_summary_data()
    if summary and "zones" in summary:
        return summary["zones"]
    return []


def get_cadastre_summary_data():
    global _cached_cadastre_summary
    if _cached_cadastre_summary is None and os.path.exists(CADASTRE_SUMMARY_CACHE_PATH):
        try:
            with open(CADASTRE_SUMMARY_CACHE_PATH, "r", encoding="utf-8") as f:
                _cached_cadastre_summary = json.load(f)
        except Exception:
            _cached_cadastre_summary = None
    return _cached_cadastre_summary


@router.get("/gdb-info")
def get_gdb_info():
    """
    Returns Geodatabase (GDB) connection details, projection MUTM 87, and layer inventory.
    """
    gdb_path = r"C:\Users\UNepal\OneDrive\Panchpokhari offce\ToPachpakhoriLocalLevel\01Data\Geodatabase\SINDHUPALCHOK_PKG_09_MUTM_87.gdb"
    exists = os.path.exists(gdb_path)
    cadastre_sum = get_cadastre_summary_data() or {}
    land_sum = get_summary_data() or {}

    return {
        "status": "connected" if exists else "loaded_in_database",
        "gdb_path": gdb_path,
        "gdb_name": "SINDHUPALCHOK_PKG_09_MUTM_87.gdb",
        "projection": "Nepal Nagarkot TM 87 (MUTM 87)",
        "central_meridian": 87,
        "datum": "Nepal 1981 / Everest 1830 (1937 Adjustment)",
        "unit": "Meter",
        "palika": "पाँचपोखरी थाङपाल गाउँपालिका (Panchpokhari Thangpal Rural Municipality)",
        "layers": [
            {
                "id": "cadastre",
                "name": "Cadastre (नापी कित्ता नक्सा)",
                "layer_name": "Cadastre",
                "type": "MultiPolygon",
                "count": cadastre_sum.get("total_parcels", 53180),
                "area_ropani": cadastre_sum.get("total_area_ropani", "२,९२,९९८ रोपनी"),
                "status": "Active & Searchable"
            },
            {
                "id": "landuse_87",
                "name": "Land Use 87 (भू-उपयोग वर्गीकरण नक्सा - MUTM 87)",
                "layer_name": "Panchpokhari_no_road / new_Landusezone_updated",
                "type": "MultiPolygon",
                "count": land_sum.get("total_polygons", 3743),
                "area_ropani": land_sum.get("total_area_ropani", "८,५७,७३७ रोपनी"),
                "zones_count": 9,
                "status": "Active & Visualized"
            },
            {
                "id": "wards",
                "name": "Ward Boundaries (वडा सिमाना)",
                "layer_name": "Sindhupalchok_Wards",
                "type": "MultiPolygon",
                "count": 8,
                "status": "Active"
            },
            {
                "id": "hazards",
                "name": "Disaster & Hazard Layers (विपद् जोखिम तहहरू)",
                "layers": ["Flood", "Landslide_Suceptibility", "Fault", "Fire", "Soil_Erosion"],
                "status": "Integrated"
            }
        ],
        "summary": {
            "total_parcels": cadastre_sum.get("total_parcels", 53180),
            "total_land_zones": land_sum.get("total_polygons", 3743),
            "total_area_ha": land_sum.get("total_area_ha", 43634.82)
        }
    }


@router.get("/cadastre/summary")
def get_cadastre_summary():
    """
    Returns high-level statistics for all 53,180 cadastral parcels across 8 wards.
    """
    summary = get_cadastre_summary_data()
    if summary:
        return summary
    return {"total_parcels": 53180, "ward_distribution": []}


@router.get("/cadastre/search")
def search_cadastre_parcels(
    parcel_no: str = Query(..., description="Parcel number (e.g. '698', '1054')"),
    ward_no: Optional[int] = Query(None, description="Optional ward number filter"),
    db: Session = Depends(get_db)
):
    """
    Fast search for cadastral parcels by parcel number and optional ward number.
    Returns GeoJSON feature with complete attributes and matched Land Use 87 zone.
    """
    p_clean = parcel_no.strip()
    query = db.query(CadastreParcel).filter(CadastreParcel.parcel_no == p_clean)
    if ward_no and ward_no > 0:
        query = query.filter(CadastreParcel.ward_no == ward_no)
    
    parcels = query.limit(20).all()
    if not parcels:
        # Try substring match if exact not found
        parcels = db.query(CadastreParcel).filter(
            CadastreParcel.parcel_no.like(f"%{p_clean}%")
        )
        if ward_no and ward_no > 0:
            parcels = parcels.filter(CadastreParcel.ward_no == ward_no)
        parcels = parcels.limit(10).all()

    # Get zones catalog for enriched metadata
    summary = get_summary_data() or {}
    zone_lookup = {z["zone_code"]: z for z in summary.get("zones", [])}

    features = []
    for p in parcels:
        zone_code = p.zoning or p.landuse or "AGR"
        zone_meta = zone_lookup.get(zone_code, {})

        features.append({
            "type": "Feature",
            "id": p.id,
            "properties": {
                "id": p.id,
                "parcel_no": p.parcel_no,
                "ward_no": p.ward_no,
                "grid_sheet": p.grid_sheet,
                "parcel_key": p.parcel_key,
                "area_sqm": p.area_sqm,
                "area_ropani": p.area_ropani_str,
                "zone_code": zone_code,
                "zone_name_np": zone_meta.get("zone_name_np", "कृषि क्षेत्र"),
                "zone_color": zone_meta.get("color", "#16a34a"),
                "rules_np": zone_meta.get("rules_np", "भू-उपयोग ऐन, २०७६ अनुसार निर्धारित मापदण्ड पालना गर्नुपर्नेछ।"),
                "center": [p.center_lat, p.center_lng],
                "bounds": [[p.min_lat, p.min_lng], [p.max_lat, p.max_lng]]
            },
            "geometry": p.geojson_geometry
        })

    return {
        "type": "FeatureCollection",
        "features": features,
        "count": len(features)
    }


@router.get("/cadastre/bbox")
def get_cadastre_in_bbox(
    min_lat: float = Query(...),
    min_lng: float = Query(...),
    max_lat: float = Query(...),
    max_lng: float = Query(...),
    limit: Optional[int] = Query(250, description="Max parcels to render at once"),
    db: Session = Depends(get_db)
):
    """
    Returns cadastre parcels within visible map viewport.
    """
    parcels = db.query(CadastreParcel).filter(
        CadastreParcel.max_lat >= min_lat,
        CadastreParcel.min_lat <= max_lat,
        CadastreParcel.max_lng >= min_lng,
        CadastreParcel.min_lng <= max_lng
    ).limit(limit).all()

    features = []
    for p in parcels:
        features.append({
            "type": "Feature",
            "id": p.id,
            "properties": {
                "id": p.id,
                "parcel_no": p.parcel_no,
                "ward_no": p.ward_no,
                "grid_sheet": p.grid_sheet,
                "area_sqm": p.area_sqm,
                "area_ropani": p.area_ropani_str,
                "zoning": p.zoning or "AGR"
            },
            "geometry": p.geojson_geometry
        })

    return {
        "type": "FeatureCollection",
        "features": features
    }

