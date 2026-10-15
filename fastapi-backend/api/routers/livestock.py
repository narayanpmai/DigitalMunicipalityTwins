from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from core.database import get_db
from models.livestock import LivestockRecord
from schemas.livestock import LivestockSchema, LivestockCreate
import uuid

router = APIRouter(
    prefix="/api/v1/livestock",
    tags=["Livestock (पशुपालन)"]
)

@router.get("")
@router.get("/")
def get_all_livestock(ward: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(LivestockRecord)
    if ward and ward > 0:
        query = query.filter(LivestockRecord.ward_number == ward)
    records = query.order_by(LivestockRecord.ward_number.asc()).all()
    return [r.to_dict() for r in records]

@router.post("")
@router.post("/")
def create_livestock(payload: Dict[str, Any], db: Session = Depends(get_db)):
    rec_id = payload.get("id") or str(uuid.uuid4())
    db_record = LivestockRecord(
        id=rec_id,
        ward_number=int(payload.get("wardNo") or payload.get("wardNumber") or 1),
        fiscal_year=payload.get("fiscalYear", "2080/081"),
        cattle=int(payload.get("cattle") or 0),
        buffaloes=int(payload.get("buffaloes") or 0),
        goats=int(payload.get("goats") or 0),
        sheep=int(payload.get("sheep") or 0),
        pigs=int(payload.get("pigs") or 0),
        poultry=int(payload.get("poultry") or 0),
        yaks=int(payload.get("yaks") or 0),
        milk_production_liters=float(payload.get("milkProductionLiters") or 0),
        meat_production_kg=float(payload.get("meatProductionKg") or 0),
        wool_production_kg=float(payload.get("woolProductionKg") or 0),
        total_households_rearing=int(payload.get("totalHouseholdsRearing") or payload.get("farmsCount") or 0),
        notes=payload.get("notes") or payload.get("animalNameNepali") or ""
    )
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return db_record.to_dict()

@router.get("/records/", response_model=List[LivestockSchema])
def get_livestock_records(db: Session = Depends(get_db)):
    return db.query(LivestockRecord).all()

@router.post("/records/", response_model=LivestockSchema)
def create_livestock_record(record: LivestockCreate, db: Session = Depends(get_db)):
    db_record = LivestockRecord(
        id=str(uuid.uuid4()),
        **record.dict()
    )
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return db_record

@router.get("/records/{id}", response_model=LivestockSchema)
def get_livestock_record(id: str, db: Session = Depends(get_db)):
    record = db.query(LivestockRecord).filter(LivestockRecord.id == id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Livestock Record not found")
    return record
