from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from core.database import get_db
from models.senior_citizen import SeniorCitizen
from schemas.senior_citizen import SeniorCitizenSchema, SeniorCitizenCreate
import uuid

router = APIRouter(
    prefix="/api/v1/senior-citizen",
    tags=["Senior Citizens (जेष्ठ नागरिक)"]
)

@router.get("/data/", response_model=List[SeniorCitizenSchema])
def get_senior_citizen_data(db: Session = Depends(get_db)):
    return db.query(SeniorCitizen).all()

@router.post("/data/", response_model=SeniorCitizenSchema)
def create_senior_citizen_data(data: SeniorCitizenCreate, db: Session = Depends(get_db)):
    db_data = SeniorCitizen(
        id=str(uuid.uuid4()),
        **data.dict()
    )
    db.add(db_data)
    db.commit()
    db.refresh(db_data)
    return db_data

@router.get("/data/{id}", response_model=SeniorCitizenSchema)
def get_senior_citizen_by_id(id: str, db: Session = Depends(get_db)):
    data = db.query(SeniorCitizen).filter(SeniorCitizen.id == id).first()
    if not data:
        raise HTTPException(status_code=404, detail="Senior Citizen Data not found")
    return data
