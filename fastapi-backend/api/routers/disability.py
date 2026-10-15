from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from core.database import get_db
from models.disability import DisabilityRecord
from schemas.disability import DisabilityRecordSchema, DisabilityRecordCreate
import uuid

router = APIRouter(
    prefix="/api/v1/disability",
    tags=["Disability (अपाङ्गता)"]
)

@router.get("/data/", response_model=List[DisabilityRecordSchema])
def get_disability_data(db: Session = Depends(get_db)):
    return db.query(DisabilityRecord).all()

@router.post("/data/", response_model=DisabilityRecordSchema)
def create_disability_data(data: DisabilityRecordCreate, db: Session = Depends(get_db)):
    db_data = DisabilityRecord(
        id=str(uuid.uuid4()),
        **data.dict()
    )
    db.add(db_data)
    db.commit()
    db.refresh(db_data)
    return db_data

@router.get("/data/{id}", response_model=DisabilityRecordSchema)
def get_disability_by_id(id: str, db: Session = Depends(get_db)):
    data = db.query(DisabilityRecord).filter(DisabilityRecord.id == id).first()
    if not data:
        raise HTTPException(status_code=404, detail="Disability Data not found")
    return data
