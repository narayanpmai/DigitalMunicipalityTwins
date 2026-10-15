from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from core.database import get_db
import models.digital_twin_assets as asset_models
import schemas.digital_twin_assets as asset_schemas

router = APIRouter(
    prefix="/api/v1/digital-twin",
    tags=["Digital Twin Assets and GIS"]
)

# --- DIGITAL TWIN ASSETS ---
@router.post("/assets/", response_model=asset_schemas.UnifiedAssetResponse, status_code=status.HTTP_201_CREATED)
def create_asset(asset: asset_schemas.UnifiedAssetCreate, db: Session = Depends(get_db)):
    db_obj = asset_models.UnifiedAsset(**asset.model_dump())
    db.add(db_obj)
    try:
        db.commit()
        db.refresh(db_obj)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    return db_obj

@router.get("/assets/", response_model=List[asset_schemas.UnifiedAssetResponse])
def read_assets(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(asset_models.UnifiedAsset).offset(skip).limit(limit).all()

# --- Digital Twin Maintenance ---
@router.get("/maintenance/")
def read_maintenance(skip: int = 0, limit: int = 100):
    return []

@router.post("/maintenance/")
def create_maintenance(data: dict):
    return {"status": "success", "data": data}

# --- Digital Twin GIS Features ---
@router.get("/gis-features/")
def read_gis_features(skip: int = 0, limit: int = 100):
    return []

@router.post("/gis-features/")
def create_gis_feature(data: dict):
    return {"status": "success", "data": data}
