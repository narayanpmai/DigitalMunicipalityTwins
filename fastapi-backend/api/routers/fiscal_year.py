from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid

from core.database import get_db
from models.fiscal_year import FiscalYear

router = APIRouter(
    prefix="/api/v1/fiscal-years",
    tags=["Fiscal Years (आर्थिक वर्षहरू)"]
)


@router.get("")
@router.get("/")
def get_fiscal_years(db: Session = Depends(get_db)):
    fys = db.query(FiscalYear).order_by(desc(FiscalYear.year_np)).all()
    return [fy.to_dict() for fy in fys]


@router.get("/current")
def get_current_fiscal_year(db: Session = Depends(get_db)):
    fy = db.query(FiscalYear).filter(FiscalYear.is_current == True).first()
    if not fy:
        fy = db.query(FiscalYear).order_by(desc(FiscalYear.year_np)).first()
    if not fy:
        raise HTTPException(status_code=404, detail="Current fiscal year not found")
    return fy.to_dict()


@router.get("/{id_or_year}")
def get_fiscal_year(id_or_year: str, db: Session = Depends(get_db)):
    fy = find_fiscal_year(id_or_year, db)
    if not fy:
        raise HTTPException(status_code=404, detail="Fiscal year not found")
    return fy.to_dict()


@router.post("")
@router.post("/")
def create_fiscal_year(payload: Dict[str, Any], db: Session = Depends(get_db)):
    fid = uuid.uuid4()
    is_curr = bool(payload.get("isCurrent", False))
    if is_curr:
        db.query(FiscalYear).update({FiscalYear.is_current: False})
        db.commit()

    new_fy = FiscalYear(
        id=fid,
        year_np=payload.get("yearNp"),
        year_en=payload.get("yearEn"),
        is_current=is_curr,
        approved_budget_npr=int(payload.get("approvedBudgetNpr", 0)),
        expenditure_so_far_npr=int(payload.get("expenditureSoFarNpr", 0)),
        remarks=payload.get("remarks"),
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(new_fy)
    db.commit()
    db.refresh(new_fy)
    return new_fy.to_dict()


def find_fiscal_year(id_or_year: str, db: Session) -> Optional[FiscalYear]:
    try:
        tid = uuid.UUID(id_or_year)
        fy = db.query(FiscalYear).filter(FiscalYear.id == tid).first()
        if fy: return fy
    except ValueError:
        pass

    return db.query(FiscalYear).filter(
        (FiscalYear.year_np == id_or_year) |
        (FiscalYear.year_en == id_or_year)
    ).first()
