from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from core.database import get_db
import models.dashboard_analytics as models
import schemas.dashboard_analytics as schemas
import json

router = APIRouter(
    prefix="/api/v1/dashboard-v2",
    tags=["Analytics and Executive Dashboard"]
)

@router.post("/cache/", response_model=schemas.DashboardAnalyticsCacheResponse, status_code=status.HTTP_201_CREATED)
def create_cache(cache_data: schemas.DashboardAnalyticsCacheCreate, db: Session = Depends(get_db)):
    db_cache = models.DashboardAnalyticsCache(**cache_data.model_dump())
    db.add(db_cache)
    try:
        db.commit()
        db.refresh(db_cache)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    return db_cache

@router.get("/cache/", response_model=List[schemas.DashboardAnalyticsCacheResponse])
def read_cache(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.DashboardAnalyticsCache).offset(skip).limit(limit).all()

# --- Open Data ---
@router.post("/open-data/", response_model=schemas.OpenDataPublicationResponse, status_code=status.HTTP_201_CREATED)
def create_open_data(data: schemas.OpenDataPublicationCreate, db: Session = Depends(get_db)):
    db_data = models.OpenDataPublication(**data.model_dump())
    db.add(db_data)
    try:
        db.commit()
        db.refresh(db_data)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    return db_data

@router.get("/open-data/", response_model=List[schemas.OpenDataPublicationResponse])
def read_open_data(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.OpenDataPublication).offset(skip).limit(limit).all()

# --- Executive KPIs ---
@router.get("/kpis/")
def get_kpis(db: Session = Depends(get_db)):
    default_kpis = [
        {"id": "1", "metric_key": "total_citizens", "metric_value": 45230, "trend_percentage": 2.5, "last_updated": "2081/08/15"},
        {"id": "2", "metric_key": "total_households", "metric_value": 9840, "trend_percentage": 1.8, "last_updated": "2081/08/15"},
        {"id": "3", "metric_key": "active_projects", "metric_value": 124, "trend_percentage": 15.2, "last_updated": "2081/08/15"},
        {"id": "4", "metric_key": "budget_utilization", "metric_value": 850000000, "trend_percentage": -1.2, "last_updated": "2081/08/15"},
        {"id": "5", "metric_key": "sifaris_issued", "metric_value": 3450, "trend_percentage": 8.4, "last_updated": "2081/08/15"},
        {"id": "6", "metric_key": "ebps_applications", "metric_value": 286, "trend_percentage": 12.0, "last_updated": "2081/08/15"},
    ]
    try:
        cached = db.query(models.DashboardAnalyticsCache).all()
        if cached:
            for c in cached:
                for item in default_kpis:
                    if item["metric_key"] == c.metric_key:
                        item["metric_value"] = c.metric_value
    except Exception:
        pass
    return default_kpis

@router.post("/kpis/")
def save_kpi(data: Dict[str, Any], db: Session = Depends(get_db)):
    key = data.get("metric_key")
    val = data.get("metric_value")
    if key and val is not None:
        try:
            cached = db.query(models.DashboardAnalyticsCache).filter(models.DashboardAnalyticsCache.metric_key == key).first()
            if cached:
                cached.metric_value = val
            else:
                db.add(models.DashboardAnalyticsCache(metric_key=key, metric_value=val))
            db.commit()
        except Exception:
            db.rollback()
    return {"status": "success", "data": data}
