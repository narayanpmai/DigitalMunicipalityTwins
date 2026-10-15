from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid

from core.database import get_db
from models.planning import Plan

router = APIRouter(
    prefix="/api/v1/planning",
    tags=["Planning (योजना तथा कार्यक्रम)"]
)

TYPE_MAP = {
    "annual": "annual",
    "वार्षिक": "annual",
    "medium_term": "medium_term",
    "मध्यकालीन": "medium_term",
    "mted": "medium_term",
    "long_term": "long_term",
    "दीर्घकालीन": "long_term",
    "sectoral": "sectoral",
    "विषयगत": "sectoral"
}

def normalize_plan_type(val: Optional[str]) -> str:
    if not val: return "annual"
    v = val.lower().strip()
    for k, target in TYPE_MAP.items():
        if k in v:
            return target
    return "annual"

STATUS_MAP = {
    "draft": "draft",
    "मस्यौदा": "draft",
    "approved": "approved",
    "स्वीकृत": "approved",
    "ongoing": "ongoing",
    "सञ्चालन": "ongoing",
    "completed": "completed",
    "सम्पन्न": "completed",
    "cancelled": "cancelled",
    "रद्द": "cancelled"
}

def normalize_plan_status(val: Optional[str]) -> str:
    if not val: return "draft"
    v = val.lower().strip()
    for k, target in STATUS_MAP.items():
        if k in v:
            return target
    return "draft"


@router.get("")
@router.get("/")
@router.get("/plans")
@router.get("/plans/")
def get_plans(
    type: Optional[str] = None,
    status: Optional[str] = None,
    sector: Optional[str] = None,
    ward: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Plan).filter(Plan.deleted_at.is_(None))

    if type and type != "all":
        query = query.filter(Plan.type == normalize_plan_type(type))
    if status and status != "all":
        query = query.filter(Plan.status == normalize_plan_status(status))
    if sector and sector != "all":
        query = query.filter(Plan.sector.ilike(f"%{sector}%"))
    if ward and ward != "all":
        try:
            w_int = int(ward)
            query = query.filter(Plan.ward_number == w_int)
        except ValueError:
            pass
    if search and search.strip():
        s = f"%{search.strip()}%"
        query = query.filter(
            (Plan.title.ilike(s)) |
            (Plan.title_en.ilike(s)) |
            (Plan.description.ilike(s)) |
            (Plan.objectives.ilike(s))
        )

    records = query.order_by(desc(Plan.created_at)).all()
    return [p.to_dict() for p in records]


@router.get("/stats")
def get_planning_stats(db: Session = Depends(get_db)):
    plans = db.query(Plan).filter(Plan.deleted_at.is_(None)).all()
    total = len(plans)
    
    total_budget = sum(float(p.estimated_budget or 0) for p in plans)
    type_counts = {}
    status_counts = {}

    for p in plans:
        t = p.type or "annual"
        type_counts[t] = type_counts.get(t, 0) + 1
        s = p.status or "draft"
        status_counts[s] = status_counts.get(s, 0) + 1

    return {
        "totalPlans": total,
        "totalEstimatedBudget": total_budget,
        "byType": type_counts,
        "byStatus": status_counts,
        "annualCount": type_counts.get("annual", 0),
        "mediumTermCount": type_counts.get("medium_term", 0),
        "longTermCount": type_counts.get("long_term", 0),
        "sectoralCount": type_counts.get("sectoral", 0)
    }


@router.post("")
@router.post("/")
@router.post("/plans")
@router.post("/plans/")
def create_plan(payload: Dict[str, Any], db: Session = Depends(get_db)):
    pid = uuid.uuid4()
    est = float(payload.get("estimatedBudget") or payload.get("budget") or 0)

    new_plan = Plan(
        id=pid,
        title=payload.get("title", "नयाँ योजना"),
        title_en=payload.get("titleEn", ""),
        type=normalize_plan_type(payload.get("type")),
        status=normalize_plan_status(payload.get("status")),
        fiscal_year=payload.get("fiscalYear", "२०८१/०८२"),
        start_year=payload.get("startYear", 2081),
        end_year=payload.get("endYear", 2086),
        description=payload.get("description", ""),
        objectives=payload.get("objectives", ""),
        targets=payload.get("targets") or [],
        estimated_budget=est,
        sector=payload.get("sector", "पूर्वाधार विकास"),
        ward_number=payload.get("wardNumber"),
        approved_by=payload.get("approvedBy", "गाउँ कार्यपालिका"),
        document_url=payload.get("documentUrl"),
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(new_plan)
    db.commit()
    db.refresh(new_plan)
    return new_plan.to_dict()


@router.get("/plans/{id}")
@router.get("/{id}")
def get_plan(id: str, db: Session = Depends(get_db)):
    plan = find_plan(id, db)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    return plan.to_dict()


@router.put("/plans/{id}")
@router.put("/{id}")
def update_plan(id: str, payload: Dict[str, Any], db: Session = Depends(get_db)):
    plan = find_plan(id, db)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")

    if "title" in payload: plan.title = payload["title"]
    if "titleEn" in payload: plan.title_en = payload["titleEn"]
    if "type" in payload: plan.type = normalize_plan_type(payload["type"])
    if "status" in payload: plan.status = normalize_plan_status(payload["status"])
    if "fiscalYear" in payload: plan.fiscal_year = payload["fiscalYear"]
    if "description" in payload: plan.description = payload["description"]
    if "objectives" in payload: plan.objectives = payload["objectives"]
    if "targets" in payload: plan.targets = payload["targets"]
    if "estimatedBudget" in payload: plan.estimated_budget = float(payload["estimatedBudget"])
    if "sector" in payload: plan.sector = payload["sector"]
    if "wardNumber" in payload: plan.ward_number = payload["wardNumber"]
    if "approvedBy" in payload: plan.approved_by = payload["approvedBy"]

    plan.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(plan)
    return plan.to_dict()


@router.delete("/plans/{id}")
@router.delete("/{id}")
def delete_plan(id: str, db: Session = Depends(get_db)):
    plan = find_plan(id, db)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")

    plan.deleted_at = datetime.utcnow()
    db.commit()
    return {"message": "Plan deleted successfully", "id": str(plan.id)}


def find_plan(id_str: str, db: Session) -> Optional[Plan]:
    try:
        tid = uuid.UUID(id_str)
        p = db.query(Plan).filter(Plan.id == tid, Plan.deleted_at.is_(None)).first()
        if p: return p
    except ValueError:
        pass
    return db.query(Plan).filter(Plan.title.ilike(f"%{id_str}%"), Plan.deleted_at.is_(None)).first()
