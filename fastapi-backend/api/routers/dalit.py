from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from core.database import get_db
from models.dalit import DalitRecord
from schemas.dalit import DalitRecordSchema, DalitRecordCreate
import uuid

router = APIRouter(
    prefix="/api/v1/dalit",
    tags=["Dalit (दलित वर्ग)"]
)

@router.get("/data/", response_model=List[DalitRecordSchema])
def get_dalit_data(db: Session = Depends(get_db)):
    return db.query(DalitRecord).all()

@router.post("/data/", response_model=DalitRecordSchema)
def create_dalit_data(data: DalitRecordCreate, db: Session = Depends(get_db)):
    db_data = DalitRecord(
        id=str(uuid.uuid4()),
        **data.dict()
    )
    db.add(db_data)
    db.commit()
    db.refresh(db_data)
    return db_data

@router.get("/data/{id}", response_model=DalitRecordSchema)
def get_dalit_by_id(id: str, db: Session = Depends(get_db)):
    data = db.query(DalitRecord).filter(DalitRecord.id == id).first()
    if not data:
        raise HTTPException(status_code=404, detail="Dalit Data not found")
    return data
