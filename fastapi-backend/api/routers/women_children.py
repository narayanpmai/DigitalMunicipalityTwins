from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from core.database import get_db
from models.women_children import WomenChildren
from schemas.women_children import WomenChildrenSchema, WomenChildrenCreate
import uuid

router = APIRouter(
    prefix="/api/v1/women-children",
    tags=["Women and Children (महिला तथा बालबालिका)"]
)

@router.get("/data/", response_model=List[WomenChildrenSchema])
def get_women_children_data(db: Session = Depends(get_db)):
    return db.query(WomenChildren).all()

@router.post("/data/", response_model=WomenChildrenSchema)
def create_women_children_data(data: WomenChildrenCreate, db: Session = Depends(get_db)):
    db_data = WomenChildren(
        id=str(uuid.uuid4()),
        **data.dict()
    )
    db.add(db_data)
    db.commit()
    db.refresh(db_data)
    return db_data

@router.get("/data/{id}", response_model=WomenChildrenSchema)
def get_women_children_by_id(id: str, db: Session = Depends(get_db)):
    data = db.query(WomenChildren).filter(WomenChildren.id == id).first()
    if not data:
        raise HTTPException(status_code=404, detail="Women and Children Data not found")
    return data
