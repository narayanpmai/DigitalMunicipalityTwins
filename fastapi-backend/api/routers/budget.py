from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid

from core.database import get_db
from core.tenant import get_tenant_context, TenantContext
from models.budget import Budget, BudgetSource

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
def get_budget_stats(
    fiscalYear: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context)
):
    query = ctx.filter_query(db.query(Budget).filter(Budget.deleted_at.is_(None)), Budget)
    if fiscalYear and fiscalYear != "all":
        query = query.filter(Budget.fiscal_year == fiscalYear)
    budgets = query.all()
    
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


@router.post("/bulk-import")
def bulk_import_budgets(
    items: List[Dict[str, Any]],
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context)
):
    """
    SuTRA / Excel Bulk Importer for Municipal Budgets
    Supports importing lists of budget heads and program allocations.
    """
    imported = 0
    eff_tenant = ctx.effective_tenant_id
    for item in items:
        alloc = float(item.get("allocatedAmount") or item.get("allocated_amount") or item.get("budget") or 0)
        rel = float(item.get("releasedAmount") or item.get("released_amount") or alloc)
        spent = float(item.get("spentAmount") or item.get("spent_amount") or 0)
        
        b = Budget(
            id=uuid.uuid4(),
            tenant_id=eff_tenant,
            title=item.get("title") or item.get("programName") or item.get("budgetHead") or "बजेट कार्यक्रम",
            fiscal_year=item.get("fiscalYear") or item.get("fiscal_year") or "२०८१/०८२",
            type=normalize_budget_type(item.get("type")),
            status=normalize_budget_status(item.get("status") or "approved"),
            sector=item.get("sector") or "पूर्वाधार विकास",
            ward_number=item.get("wardNumber") or item.get("ward_number"),
            allocated_amount=alloc,
            released_amount=rel,
            spent_amount=spent,
            source_of_fund=item.get("sourceOfFund") or item.get("source") or "गाउँपालिका आन्तरिक स्रोत",
            description=item.get("description", ""),
            approved_by=item.get("approvedBy", "गाउँसभा"),
            approved_at=datetime.utcnow(),
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        db.add(b)
        imported += 1

    db.commit()
    return {"success": True, "message": f"Successfully imported {imported} budget lines", "count": imported}


# ═══════════════════════════════════════════════════════════════════════════
# BUDGET SOURCES (बजेट स्रोत सुची) API ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════════

@router.get("/sources")
def get_budget_sources(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context)
):
    """Retrieve all municipal budget sources (e.g., संघीय सरकार वित्तीय समानीकरण, आन्तरीक स्रोत, etc.)."""
    q = db.query(BudgetSource).filter(BudgetSource.deleted_at.is_(None))
    q = ctx.filter_query(q, BudgetSource)
    if status and status != "all":
        q = q.filter(BudgetSource.status == status)
    records = q.order_by(BudgetSource.sn.asc().nulls_last(), BudgetSource.name.asc()).all()
    return [s.to_dict() for s in records]


@router.post("/sources")
def create_budget_source(
    payload: Dict[str, Any],
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context)
):
    """Create a new municipal budget source."""
    name = (payload.get("name") or "").strip()
    if not name:
        raise HTTPException(status_code=400, detail="बजेट स्रोत नाम अनिवार्य छ।")

    eff_tenant = ctx.effective_tenant_id
    existing = db.query(BudgetSource).filter(
        BudgetSource.name == name,
        BudgetSource.deleted_at.is_(None)
    )
    existing = ctx.filter_query(existing, BudgetSource).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"'{name}' नामको बजेट स्रोत पहिले नै दर्ता छ।")

    max_sn = db.query(BudgetSource.sn).order_by(BudgetSource.sn.desc().nulls_last()).first()
    next_sn = (max_sn[0] + 1) if max_sn and max_sn[0] else 1

    src = BudgetSource(
        id=uuid.uuid4(),
        tenant_id=eff_tenant,
        sn=payload.get("sn") or next_sn,
        name=name,
        status=payload.get("status") or "सक्रिय",
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(src)
    db.commit()
    db.refresh(src)
    return src.to_dict()


@router.patch("/sources/{id}/status")
def toggle_budget_source_status(
    id: str,
    payload: Optional[Dict[str, Any]] = None,
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context)
):
    """Toggle budget source status between 'सक्रिय' and 'निष्क्रिय'."""
    try:
        sid = uuid.UUID(id)
    except ValueError:
        raise HTTPException(status_code=400, detail="अमान्य बजेट स्रोत ID")

    src = db.query(BudgetSource).filter(BudgetSource.id == sid, BudgetSource.deleted_at.is_(None)).first()
    if not src:
        raise HTTPException(status_code=404, detail="बजेट स्रोत फेला परेन।")

    if payload and "status" in payload:
        src.status = payload["status"]
    else:
        src.status = "निष्क्रिय" if src.status == "सक्रिय" else "सक्रिय"

    src.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(src)
    return src.to_dict()


@router.put("/sources/{id}")
def update_budget_source(
    id: str,
    payload: Dict[str, Any],
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context)
):
    """Update budget source name or status."""
    try:
        sid = uuid.UUID(id)
    except ValueError:
        raise HTTPException(status_code=400, detail="अमान्य बजेट स्रोत ID")

    src = db.query(BudgetSource).filter(BudgetSource.id == sid, BudgetSource.deleted_at.is_(None)).first()
    if not src:
        raise HTTPException(status_code=404, detail="बजेट स्रोत फेला परेन।")

    if "name" in payload and str(payload["name"]).strip():
        src.name = str(payload["name"]).strip()
    if "status" in payload and str(payload["status"]).strip():
        src.status = str(payload["status"]).strip()
    if "sn" in payload:
        src.sn = int(payload["sn"])

    src.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(src)
    return src.to_dict()


@router.delete("/sources/{id}")
def delete_budget_source(
    id: str,
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context)
):
    """Soft delete budget source."""
    try:
        sid = uuid.UUID(id)
    except ValueError:
        raise HTTPException(status_code=400, detail="अमान्य बजेट स्रोत ID")

    src = db.query(BudgetSource).filter(BudgetSource.id == sid, BudgetSource.deleted_at.is_(None)).first()
    if not src:
        raise HTTPException(status_code=404, detail="बजेट स्रोत फेला परेन।")

    src.deleted_at = datetime.utcnow()
    db.commit()
    return {"message": "बजेट स्रोत सफलतापूर्वक मेटाइयो", "id": str(src.id)}


# ═══════════════════════════════════════════════════════════════════════════
# BUDGET SUB-HEADS (बजेट उप-शिर्षक रकम सुची) API ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════════

@router.get("/sub-heads")
def get_budget_sub_heads(
    fiscalYear: Optional[str] = None,
    level: Optional[str] = None,
    ward: Optional[str] = None,
    source: Optional[str] = None,
    expenseType: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context)
):
    """Retrieve municipal budget sub-head program allocations."""
    q = db.query(Budget).filter(Budget.deleted_at.is_(None))
    q = ctx.filter_query(q, Budget)

    if fiscalYear and fiscalYear != "all":
        q = q.filter(Budget.fiscal_year == fiscalYear)
    if level and level != "all":
        q = q.filter(Budget.level.ilike(f"%{level}%"))
    if ward and ward != "all":
        try:
            w_int = int(ward)
            q = q.filter(Budget.ward_number == w_int)
        except ValueError:
            pass
    if source and source != "all":
        q = q.filter(Budget.source_of_fund.ilike(f"%{source}%"))
    if expenseType and expenseType != "all":
        q = q.filter(Budget.expense_type.ilike(f"%{expenseType}%"))
    if search and search.strip():
        s = f"%{search.strip()}%"
        q = q.filter(
            (Budget.title.ilike(s)) |
            (Budget.sub_head_no.ilike(s)) |
            (Budget.source_of_fund.ilike(s))
        )

    records = q.order_by(desc(Budget.allocated_amount)).all()
    return [b.to_dict() for b in records]


@router.post("/sub-heads")
def create_budget_sub_head(
    payload: Dict[str, Any],
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context)
):
    """Create a new budget sub-head program entry."""
    eff_tenant = ctx.effective_tenant_id
    title = (payload.get("title") or payload.get("name") or "").strip()
    if not title:
        raise HTTPException(status_code=400, detail="योजना / कार्यक्रमको नाम अनिवार्य छ।")

    sub_head_no = str(payload.get("subHeadNo") or payload.get("sub_head_no") or "").strip()
    amount = float(payload.get("allocatedAmount") or payload.get("amount") or 0)
    source = str(payload.get("sourceOfFund") or payload.get("source") or "आन्तरीक स्रोत").strip()
    level = str(payload.get("level") or "नगर स्तरिय").strip()
    expense_type = str(payload.get("expenseType") or "पुँजीगत खर्च").strip()
    approval_state = str(payload.get("approvalState") or "स्विकृत भएको").strip()
    fiscal_year = str(payload.get("fiscalYear") or "२०८१/०८२").strip()
    ward_no = None
    if payload.get("wardNumber") is not None and str(payload.get("wardNumber")) != "":
        try:
            ward_no = int(payload.get("wardNumber"))
        except (ValueError, TypeError):
            ward_no = None

    b = Budget(
        id=uuid.uuid4(),
        tenant_id=eff_tenant,
        title=title,
        sub_head_no=sub_head_no,
        level=level,
        expense_type=expense_type,
        approval_state=approval_state,
        fiscal_year=fiscal_year,
        type="capital" if "पुँजीगत" in expense_type else "recurrent",
        status="approved" if "स्विकृत" in approval_state else "active",
        sector=payload.get("sector") or "पूर्वाधार विकास",
        ward_number=ward_no,
        allocated_amount=amount,
        released_amount=amount,
        spent_amount=0,
        source_of_fund=source,
        description=payload.get("description") or f"बजेट उप-शीर्षक नं. {sub_head_no} अन्तर्गत विनियोजित कार्यक्रम",
        approved_by="गाउँसभा / कार्यपालिका",
        approved_at=datetime.utcnow(),
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(b)
    db.commit()
    db.refresh(b)
    return b.to_dict()


# ═══════════════════════════════════════════════════════════════════════════
# SINGLE BUDGET RECORD ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════════

@router.get("/{id}")
def get_budget(
    id: str, 
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context)
):
    b = find_budget(id, db, ctx)
    if not b:
        raise HTTPException(status_code=404, detail="बजेट फेला परेन।")
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
        raise HTTPException(status_code=404, detail="बजेट फेला परेन।")

    if "title" in payload: b.title = payload["title"]
    if "type" in payload: b.type = normalize_budget_type(payload["type"])
    if "status" in payload: b.status = payload["status"]
    if "sector" in payload: b.sector = payload["sector"]
    if "subHeadNo" in payload or "sub_head_no" in payload:
        b.sub_head_no = payload.get("subHeadNo") or payload.get("sub_head_no")
    if "level" in payload:
        b.level = payload["level"]
    if "expenseType" in payload or "expense_type" in payload:
        b.expense_type = payload.get("expenseType") or payload.get("expense_type")
    if "approvalState" in payload or "approval_state" in payload:
        b.approval_state = payload.get("approvalState") or payload.get("approval_state")
    if "allocatedAmount" in payload: b.allocated_amount = float(payload["allocatedAmount"])
    if "releasedAmount" in payload: b.released_amount = float(payload["releasedAmount"])
    if "spentAmount" in payload: b.spent_amount = float(payload["spentAmount"])
    if "sourceOfFund" in payload: b.source_of_fund = payload["sourceOfFund"]
    if "description" in payload: b.description = payload["description"]
    if "wardNumber" in payload:
        try:
            b.ward_number = int(payload["wardNumber"]) if payload["wardNumber"] is not None else None
        except (ValueError, TypeError):
            pass

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
        raise HTTPException(status_code=404, detail="बजेट फेला परेन।")

    b.deleted_at = datetime.utcnow()
    db.commit()
    return {"message": "बजेट सफलतापूर्वक मेटाइयो", "id": str(b.id)}

