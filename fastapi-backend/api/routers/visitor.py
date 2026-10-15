from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from core.database import get_db
from models.visitor import VisitorRecord
from schemas.visitor import VisitorSchema, VisitorCreate, VisitorUpdate, VisitorSummaryItem
import uuid

router = APIRouter(
    prefix="/api/v1/visitors",
    tags=["Visitors & Tourists"]
)

@router.get("", response_model=List[VisitorSchema])
def get_visitors(
    fiscalYear: Optional[str] = Query(None, description="Filter by fiscal year (e.g. २०८१/०८२)"),
    db: Session = Depends(get_db)
):
    query = db.query(VisitorRecord)
    if fiscalYear and fiscalYear != "all":
        query = query.filter(VisitorRecord.fiscal_year == fiscalYear)
    return query.order_by(VisitorRecord.created_at.desc()).all()

@router.get("/summary", response_model=List[VisitorSummaryItem])
def get_summary(
    fiscalYear: Optional[str] = Query(None, description="Filter by fiscal year"),
    db: Session = Depends(get_db)
):
    query = db.query(
        VisitorRecord.visitor_type.label("visitorType"),
        func.coalesce(func.sum(VisitorRecord.count), 0).label("totalCount"),
        func.coalesce(func.sum(VisitorRecord.revenue_npr), 0).label("totalRevenue")
    ).group_by(VisitorRecord.visitor_type)
    
    if fiscalYear and fiscalYear != "all":
        query = query.filter(VisitorRecord.fiscal_year == fiscalYear)
        
    results = query.all()
    return [
        VisitorSummaryItem(
            visitorType=row.visitorType or "domestic",
            totalCount=int(row.totalCount),
            totalRevenue=float(row.totalRevenue)
        )
        for row in results
    ]

def _find_visitor(id_str: str, db: Session) -> Optional[VisitorRecord]:
    try:
        val_uuid = uuid.UUID(id_str)
        return db.query(VisitorRecord).filter(VisitorRecord.id == val_uuid).first()
    except (ValueError, AttributeError):
        return None

@router.get("/{id}", response_model=VisitorSchema)
def get_visitor(id: str, db: Session = Depends(get_db)):
    record = _find_visitor(id, db)
    if not record:
        raise HTTPException(status_code=404, detail="Visitor record not found")
    return record

@router.post("", response_model=VisitorSchema)
def create_visitor(data: VisitorCreate, db: Session = Depends(get_db)):
    db_record = VisitorRecord(
        id=uuid.uuid4(),
        **data.dict()
    )
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return db_record

@router.put("/{id}", response_model=VisitorSchema)
def update_visitor(id: str, data: VisitorUpdate, db: Session = Depends(get_db)):
    record = _find_visitor(id, db)
    if not record:
        raise HTTPException(status_code=404, detail="Visitor record not found")
        
    update_data = data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(record, key, value)
        
    db.commit()
    db.refresh(record)
    return record

@router.delete("/{id}")
def delete_visitor(id: str, db: Session = Depends(get_db)):
    record = _find_visitor(id, db)
    if not record:
        raise HTTPException(status_code=404, detail="Visitor record not found")
        
    db.delete(record)
    db.commit()
    return {"success": True, "message": "Visitor record deleted successfully"}
