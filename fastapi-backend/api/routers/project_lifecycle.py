from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Union
from core.database import get_db
import models.project_lifecycle as models
import uuid
from datetime import datetime, date

router = APIRouter(
    prefix="/api/v1/projects",
    tags=["Project Lifecycle Management"]
)

# --- PLAN PROPOSAL (योजना माग) ---
@router.post("/proposals/", status_code=status.HTTP_201_CREATED)
def create_proposal(payload: Dict[str, Any], db: Session = Depends(get_db)):
    title = payload.get("project_name_np") or payload.get("title") or "नयाँ योजना माग"
    cost = payload.get("estimated_budget") or payload.get("estimated_cost") or 0
    fy = payload.get("fiscal_year") or "२०८१/०८२"
    ward = payload.get("ward_id") or "१"
    prio = payload.get("priority") or "P1 (High)"
    desc = payload.get("description") or payload.get("sector") or ""

    db_obj = models.PlanProposal(
        id=str(uuid.uuid4()),
        title=title,
        fiscal_year=fy,
        ward_id=str(ward),
        estimated_cost=float(cost),
        priority=prio,
        description=desc,
        status="Proposed",
        created_at=datetime.utcnow()
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return {
        "id": db_obj.id,
        "title": db_obj.title,
        "project_name_np": db_obj.title,
        "fiscal_year": db_obj.fiscal_year,
        "ward_id": db_obj.ward_id,
        "estimated_cost": float(db_obj.estimated_cost or 0),
        "estimated_budget": float(db_obj.estimated_cost or 0),
        "priority": db_obj.priority,
        "status": db_obj.status,
        "description": db_obj.description,
        "created_at": db_obj.created_at.isoformat() if db_obj.created_at else None
    }

@router.get("/proposals/")
def read_proposals(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    items = db.query(models.PlanProposal).offset(skip).limit(limit).all()
    return [
        {
            "id": str(p.id),
            "title": p.title,
            "project_name_np": p.title,
            "fiscal_year": p.fiscal_year,
            "ward_id": p.ward_id,
            "estimated_cost": float(p.estimated_cost or 0),
            "estimated_budget": float(p.estimated_cost or 0),
            "priority": p.priority,
            "status": p.status,
            "description": p.description or "",
            "created_at": p.created_at.isoformat() if p.created_at else None
        }
        for p in items
    ]


# --- BUDGET ALLOCATION (बजेट विनियोजन) ---
@router.post("/budgets/", status_code=status.HTTP_201_CREATED)
def create_budget(payload: Dict[str, Any], db: Session = Depends(get_db)):
    p_id = payload.get("proposal_id") or payload.get("plan_id") or ""
    amount = float(payload.get("allocated_amount") or 0)
    source = payload.get("funding_source") or payload.get("source_of_fund") or "गाउँपालिका आन्तरिक स्रोत"
    head_code = payload.get("budget_head_code") or "३१११२-सडक-पूर्वाधार"

    db_obj = models.BudgetAllocation(
        id=str(uuid.uuid4()),
        plan_id=p_id,
        budget_head_code=head_code,
        source_of_fund=source,
        allocated_amount=amount,
        approved_date=date.today()
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return {
        "id": db_obj.id,
        "plan_id": db_obj.plan_id,
        "proposal_id": db_obj.plan_id,
        "budget_head_code": db_obj.budget_head_code,
        "source_of_fund": db_obj.source_of_fund,
        "funding_source": db_obj.source_of_fund,
        "allocated_amount": float(db_obj.allocated_amount or 0),
        "fiscal_year": payload.get("fiscal_year", "२०८१/०८२")
    }

@router.get("/budgets/")
def read_budgets(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    items = db.query(models.BudgetAllocation).offset(skip).limit(limit).all()
    out = []
    for b in items:
        fy = "२०८१/०८२"
        if b.plan and b.plan.fiscal_year:
            fy = b.plan.fiscal_year
        out.append({
            "id": str(b.id),
            "plan_id": str(b.plan_id),
            "proposal_id": str(b.plan_id),
            "budget_head_code": b.budget_head_code,
            "source_of_fund": b.source_of_fund,
            "funding_source": b.source_of_fund,
            "allocated_amount": float(b.allocated_amount or 0),
            "fiscal_year": fy,
            "approved_date": str(b.approved_date) if b.approved_date else None
        })
    return out


# --- PROJECT CONTRACT (सम्झौता) ---
@router.post("/contracts/", status_code=status.HTTP_201_CREATED)
def create_contract(payload: Dict[str, Any], db: Session = Depends(get_db)):
    proc_id = payload.get("procurement_id") or payload.get("project_id") or str(uuid.uuid4())
    c_type = payload.get("contractor_type") or "उपभोक्ता समिति"
    c_id = payload.get("contractor_id") or str(uuid.uuid4())
    amount = float(payload.get("contract_amount") or 0)
    
    db_obj = models.ProjectContract(
        id=str(uuid.uuid4()),
        procurement_id=proc_id,
        contractor_type=c_type,
        contractor_id=c_id,
        contract_amount=amount,
        agreement_date=date.today(),
        completion_deadline=date.today(),
        status="Active"
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return {
        "id": db_obj.id,
        "procurement_id": db_obj.procurement_id,
        "project_id": db_obj.procurement_id,
        "contractor_type": db_obj.contractor_type,
        "contractor_id": db_obj.contractor_id,
        "contract_amount": float(db_obj.contract_amount or 0),
        "start_date_bs": payload.get("start_date_bs", "२०८१-०४-०१"),
        "completion_date_bs": payload.get("completion_date_bs", "२०८१-०९-३०"),
        "status": db_obj.status
    }

@router.get("/contracts/")
def read_contracts(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    items = db.query(models.ProjectContract).offset(skip).limit(limit).all()
    return [
        {
            "id": str(c.id),
            "procurement_id": str(c.procurement_id),
            "project_id": str(c.procurement_id),
            "contractor_type": c.contractor_type,
            "contractor_id": str(c.contractor_id),
            "contract_amount": float(c.contract_amount or 0),
            "start_date_bs": str(c.agreement_date) if c.agreement_date else "२०८१-०४-०१",
            "completion_date_bs": str(c.completion_deadline) if c.completion_deadline else "२०८१-०९-३०",
            "status": c.status
        }
        for c in items
    ]


# --- PROJECT EXECUTION & PAYMENT (कार्यन्वयन) ---
@router.post("/executions/", status_code=status.HTTP_201_CREATED)
def create_execution(payload: Dict[str, Any], db: Session = Depends(get_db)):
    c_id = payload.get("contract_id") or payload.get("project_id") or str(uuid.uuid4())
    p_code = payload.get("project_code") or f"PRJ-2081-{uuid.uuid4().hex[:4].upper()}"
    phys = float(payload.get("physical_progress_percent") or payload.get("physical_progress_pct") or 0)
    fin = float(payload.get("financial_progress_percent") or payload.get("financial_progress_pct") or 0)

    db_obj = models.ProjectExecution(
        id=str(uuid.uuid4()),
        contract_id=c_id,
        project_code=p_code,
        physical_progress_percent=phys,
        financial_progress_percent=fin
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    status_label = payload.get("status") or ("Completed" if phys >= 100 else "In Progress")
    return {
        "id": db_obj.id,
        "contract_id": db_obj.contract_id,
        "project_id": db_obj.contract_id,
        "project_code": db_obj.project_code,
        "physical_progress_percent": float(db_obj.physical_progress_percent or 0),
        "physical_progress_pct": float(db_obj.physical_progress_percent or 0),
        "financial_progress_percent": float(db_obj.financial_progress_percent or 0),
        "financial_progress_pct": float(db_obj.financial_progress_percent or 0),
        "status": status_label
    }

@router.get("/executions/")
def read_executions(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    items = db.query(models.ProjectExecution).offset(skip).limit(limit).all()
    return [
        {
            "id": str(e.id),
            "contract_id": str(e.contract_id),
            "project_id": str(e.contract_id),
            "project_code": e.project_code,
            "physical_progress_percent": float(e.physical_progress_percent or 0),
            "physical_progress_pct": float(e.physical_progress_percent or 0),
            "financial_progress_percent": float(e.financial_progress_percent or 0),
            "financial_progress_pct": float(e.financial_progress_percent or 0),
            "status": "Completed" if (e.physical_progress_percent and e.physical_progress_percent >= 100) else "In Progress"
        }
        for e in items
    ]
