from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from core.database import get_db
import models.ebps as models
import schemas.ebps as schemas

router = APIRouter(
    prefix="/api/v1/ebps",
    tags=["Electronic Building Permit System (EBPS)"]
)

@router.post("/applications/", response_model=schemas.EBPSApplicationResponse, status_code=status.HTTP_201_CREATED)
def create_application(application: schemas.EBPSApplicationCreate, db: Session = Depends(get_db)):
    db_app = models.EBPSApplication(**application.model_dump())
    db.add(db_app)
    try:
        db.commit()
        db.refresh(db_app)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    return db_app

@router.get("/applications/", response_model=List[schemas.EBPSApplicationResponse])
def read_applications(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.EBPSApplication).offset(skip).limit(limit).all()

# --- EBPS Inspections ---
@router.get("/inspections/")
def read_inspections(skip: int = 0, limit: int = 100):
    return []

@router.post("/inspections/")
def create_inspection(data: dict):
    return {"status": "success", "data": data}

# --- EBPS Certificates ---
@router.get("/certificates/")
def read_certificates(skip: int = 0, limit: int = 100):
    return []

@router.post("/certificates/")
def create_certificate(data: dict):
    return {"status": "success", "data": data}
