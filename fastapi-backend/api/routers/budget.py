from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid

from core.database import get_db
from core.tenant import get_tenant_context, TenantContext
from models.budget import Budget

router = APIRouter(
    prefix="/api/v1/budgets",
    tags=["Budgets (बजेट व्यवस्थापन तथा बाँडफाँड)"]
)

TYPE_MAP = {
    "capital": "capital",
    "पुँजीगत": "capital",
    "recurrent": "recurrent",
    "चालु": "recurrent",
    "conditional": "conditional",
    "सशर्त": "conditional",
    "special": "conditional",
    "विशेष": "conditional"
}

def normalize_budget_type(val: Optional[str]) -> str:
    if not val: return "capital"
    v = val.lower().strip()
    for k, target in TYPE_MAP.items():
        if k in v:
            return target
    return "capital"

STATUS_MAP = {
    "draft": "draft",
    "मस्यौदा": "draft",
    "approved": "approved",
    "स्वीकृत": "approved",
    "released": "released",
    "निकासा": "released",
    "exhausted": "exhausted",
    "सम्पन्न": "exhausted"
}

def normalize_budget_status(val: Optional[str]) -> str:
    if not val: return "draft"
    v = val.lower().strip()
    for k, target in STATUS_MAP.items():
        if k in v:
            return target
    return "draft"


@router.get("")
@router.get("/")
def get_budgets(
    type: Optional[str] = None,
    status: Optional[str] = None,
    sector: Optional[str] = None,
    fiscalYear: Optional[str] = None,
    ward: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context)
):
    query = db.query(Budget).filter(Budget.deleted_at.is_(None))
    query = ctx.filter_query(query, Budget)

    if type and type != "all":
        query = query.filter(Budget.type == normalize_budget_type(type))
    if status and status != "all":
        query = query.filter(Budget.status == normalize_budget_status(status))
    if sector and sector != "all":
        query = query.filter(Budget.sector.ilike(f"%{sector}%"))
    if fiscalYear and fiscalYear != "all":
        query = query.filter(Budget.fiscal_year == fiscalYear)
    if ward and ward != "all":
        try:
            w_int = int(ward)
            query = query.filter(Budget.ward_number == w_int)
        except ValueError:
            pass

    if search and search.strip():
        s = f"%{search.strip()}%"
        query = query.filter(
            (Budget.title.ilike(s)) |
            (Budget.description.ilike(s)) |
            (Budget.source_of_fund.ilike(s))
        )

    records = query.order_by(desc(Budget.created_at)).all()
    return [b.to_dict() for b in records]


@router.get("/stats")
def get_budget_stats(db: Session = Depends(get_db), ctx: TenantContext = Depends(get_tenant_context)):
    budgets = ctx.filter_query(db.query(Budget).filter(Budget.deleted_at.is_(None)), Budget).all()
    
    total_allocated = sum(float(b.allocated_amount or 0) for b in budgets)
    total_released = sum(float(b.released_amount or 0) for b in budgets)
    total_spent = sum(float(b.spent_amount or 0) for b in budgets)
    remaining = total_allocated - total_spent
    overall_burn_rate = round((total_spent / total_allocated * 100), 1) if total_allocated > 0 else 0.0

    by_type = {}
    by_sector = {}

    for b in budgets:
        t = b.type or "capital"
        by_type[t] = by_type.get(t, 0) + float(b.allocated_amount or 0)
        sec = b.sector or "अन्य"
        by_sector[sec] = by_sector.get(sec, 0) + float(b.allocated_amount or 0)

    return {
        "totalAllocated": total_allocated,
        "totalReleased": total_released,
        "totalSpent": total_spent,
        "totalRemaining": remaining,
        "burnRate": overall_burn_rate,
        "byType": by_type,
        "bySector": by_sector,
        "capitalBudget": by_type.get("capital", 0),
        "recurrentBudget": by_type.get("recurrent", 0),
        "conditionalBudget": by_type.get("conditional", 0)
    }



@router.post("")
@router.post("/")
def create_budget(
    payload: Dict[str, Any], 
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context)
):
    bid = uuid.uuid4()
    alloc = float(payload.get("allocatedAmount") or 0)
    rel = float(payload.get("releasedAmount") or 0)
    spent = float(payload.get("spentAmount") or 0)
    eff_tenant = payload.get("tenant_id") or payload.get("tenantId") or ctx.effective_tenant_id

    new_budget = Budget(
        id=bid,
        tenant_id=eff_tenant,
        title=payload.get("title", "नयाँ बजेट उपशीर्षक"),
        fiscal_year=payload.get("fiscalYear", "२०८१/०८२"),
        type=normalize_budget_type(payload.get("type")),
        status=normalize_budget_status(payload.get("status")),
        sector=payload.get("sector", "पूर्वाधार विकास"),
        ward_number=payload.get("wardNumber"),
        allocated_amount=alloc,
        released_amount=rel,
        spent_amount=spent,
        source_of_fund=payload.get("sourceOfFund", "गाउँपालिका आन्तरिक स्रोत"),
        description=payload.get("description", ""),
        approved_by=payload.get("approvedBy", "गाउँसभा"),
        approved_at=datetime.utcnow() if payload.get("status") == "approved" else None,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(new_budget)
    db.commit()
    db.refresh(new_budget)
    return new_budget.to_dict()


@router.get("/{id}")
def get_budget(
    id: str, 
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context)
):
    b = find_budget(id, db, ctx)
    if not b:
        raise HTTPException(status_code=404, detail="Budget not found")
    return b.to_dict()


@router.put("/{id}")
def update_budget(
    id: str, 
    payload: Dict[str, Any], 
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context)
):
    b = find_budget(id, db, ctx)
    if not b:
        raise HTTPException(status_code=404, detail="Budget not found")

    if "title" in payload: b.title = payload["title"]
    if "type" in payload: b.type = normalize_budget_type(payload["type"])
    if "status" in payload: b.status = normalize_budget_status(payload["status"])
    if "sector" in payload: b.sector = payload["sector"]
    if "allocatedAmount" in payload: b.allocated_amount = float(payload["allocatedAmount"])
    if "releasedAmount" in payload: b.released_amount = float(payload["releasedAmount"])
    if "spentAmount" in payload: b.spent_amount = float(payload["spentAmount"])
    if "sourceOfFund" in payload: b.source_of_fund = payload["sourceOfFund"]
    if "description" in payload: b.description = payload["description"]

    b.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(b)
    return b.to_dict()


@router.delete("/{id}")
def delete_budget(
    id: str, 
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context)
):
    b = find_budget(id, db, ctx)
    if not b:
        raise HTTPException(status_code=404, detail="Budget not found")

    b.deleted_at = datetime.utcnow()
    db.commit()
    return {"message": "Budget deleted successfully", "id": str(b.id)}


def find_budget(id_str: str, db: Session, ctx: Optional[TenantContext] = None) -> Optional[Budget]:
    q = db.query(Budget).filter(Budget.deleted_at.is_(None))
    if ctx:
        q = ctx.filter_query(q, Budget)
    try:
        tid = uuid.UUID(id_str)
        b = q.filter(Budget.id == tid).first()
        if b: return b
    except ValueError:
        pass
    return q.filter(Budget.title.ilike(f"%{id_str}%")).first()
