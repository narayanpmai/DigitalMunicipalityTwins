from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional, Any
from pydantic import BaseModel
from core.database import get_db
from models.engineer_payment import EngineerProfile, Payment, PaymentStatus, PaymentType
from datetime import datetime
import uuid

# ─── Engineers Router ─────────────────────────────────────────────────────────
engineer_router = APIRouter(
    prefix="/api/v1/engineers",
    tags=["Engineers (इन्जिनियर दर्ता तथा व्यवस्थापन)"]
)


class EngineerCreate(BaseModel):
    full_name: str
    license_no: str
    consultancy_name: Optional[str] = None
    specialization: str
    contact_phone: str
    email: Optional[str] = None
    photo_url: Optional[str] = None
    status: str = "active"
    tenant_id: Optional[str] = None


class EngineerUpdate(BaseModel):
    full_name: Optional[str] = None
    license_no: Optional[str] = None
    consultancy_name: Optional[str] = None
    specialization: Optional[str] = None
    contact_phone: Optional[str] = None
    email: Optional[str] = None
    photo_url: Optional[str] = None
    status: Optional[str] = None


@engineer_router.get("")
def get_all_engineers(
    status: Optional[str] = Query(None),
    specialization: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """सबै इन्जिनियर प्रोफाइलहरू प्राप्त गर्नुहोस्"""
    q = db.query(EngineerProfile)
    if status:
        q = q.filter(EngineerProfile.status == status)
    if specialization:
        q = q.filter(EngineerProfile.specialization.ilike(f"%{specialization}%"))
    return q.order_by(EngineerProfile.full_name).all()


@engineer_router.get("/{id}")
def get_engineer(id: str, db: Session = Depends(get_db)):
    """ID अनुसार इन्जिनियर प्रोफाइल प्राप्त गर्नुहोस्"""
    eng = db.query(EngineerProfile).filter(EngineerProfile.id == id).first()
    if not eng:
        raise HTTPException(status_code=404, detail="Engineer not found")
    return eng


@engineer_router.post("/", status_code=201)
def create_engineer(body: EngineerCreate, db: Session = Depends(get_db)):
    """नयाँ इन्जिनियर प्रोफाइल दर्ता गर्नुहोस्"""
    existing = db.query(EngineerProfile).filter(EngineerProfile.license_no == body.license_no).first()
    if existing:
        raise HTTPException(status_code=409, detail=f"License No '{body.license_no}' already registered")
    eng = EngineerProfile(id=str(uuid.uuid4()), **body.dict())
    db.add(eng)
    db.commit()
    db.refresh(eng)
    return eng


@engineer_router.put("/{id}")
def update_engineer(id: str, body: EngineerUpdate, db: Session = Depends(get_db)):
    """इन्जिनियर प्रोफाइल अद्यावधिक गर्नुहोस्"""
    eng = db.query(EngineerProfile).filter(EngineerProfile.id == id).first()
    if not eng:
        raise HTTPException(status_code=404, detail="Engineer not found")
    for field, value in body.dict(exclude_unset=True).items():
        setattr(eng, field, value)
    db.commit()
    db.refresh(eng)
    return eng


@engineer_router.delete("/{id}")
def delete_engineer(id: str, db: Session = Depends(get_db)):
    """इन्जिनियर प्रोफाइल हटाउनुहोस्"""
    eng = db.query(EngineerProfile).filter(EngineerProfile.id == id).first()
    if not eng:
        raise HTTPException(status_code=404, detail="Engineer not found")
    db.delete(eng)
    db.commit()
    return {"success": True, "message": f"Engineer '{eng.full_name}' deleted"}


# ─── Payments Router ──────────────────────────────────────────────────────────
payment_router = APIRouter(
    prefix="/api/v1/payments",
    tags=["Payments (भुक्तानी व्यवस्थापन)"]
)


class PaymentCreate(BaseModel):
    voucher_no: str
    type: PaymentType = PaymentType.OTHER
    status: PaymentStatus = PaymentStatus.PENDING
    payee_name: str
    payee_account: Optional[str] = None
    payee_bank: Optional[str] = None
    amount: float
    fiscal_year: Optional[str] = None
    budget_head: Optional[str] = None
    contract_id: Optional[str] = None
    description: Optional[str] = None
    approved_by: Optional[str] = None
    cheque_no: Optional[str] = None
    tenant_id: Optional[str] = None


class PaymentUpdate(BaseModel):
    status: Optional[PaymentStatus] = None
    type: Optional[PaymentType] = None
    amount: Optional[float] = None
    payee_name: Optional[str] = None
    payee_account: Optional[str] = None
    payee_bank: Optional[str] = None
    fiscal_year: Optional[str] = None
    budget_head: Optional[str] = None
    approved_by: Optional[str] = None
    cheque_no: Optional[str] = None
    description: Optional[str] = None


@payment_router.get("")
def get_payments(
    status: Optional[str] = Query(None),
    type: Optional[str] = Query(None),
    fiscal_year: Optional[str] = Query(None, alias="fiscalYear"),
    db: Session = Depends(get_db)
):
    """भुक्तानी अभिलेखहरूको सूची (स्थिति, प्रकार, आर्थिक वर्ष अनुसार फिल्टर)"""
    q = db.query(Payment)
    if status:
        q = q.filter(Payment.status == status)
    if type:
        q = q.filter(Payment.type == type)
    if fiscal_year:
        q = q.filter(Payment.fiscal_year == fiscal_year)
    return q.order_by(Payment.created_at.desc()).all()


@payment_router.get("/summary")
def get_payment_summary(
    fiscal_year: Optional[str] = Query(None, alias="fiscalYear"),
    db: Session = Depends(get_db)
):
    """आर्थिक वर्ष अनुसार भुक्तानी सारांश"""
    q = db.query(Payment)
    if fiscal_year:
        q = q.filter(Payment.fiscal_year == fiscal_year)

    total = q.count()
    total_amount = db.query(func.sum(Payment.amount)).scalar() or 0
    by_status = (
        db.query(Payment.status, func.count(Payment.id).label("count"), func.sum(Payment.amount).label("total"))
        .group_by(Payment.status).all()
    )
    by_type = (
        db.query(Payment.type, func.count(Payment.id).label("count"), func.sum(Payment.amount).label("total"))
        .group_by(Payment.type).all()
    )

    return {
        "total": total,
        "totalAmount": float(total_amount),
        "byStatus": [{"status": r[0], "count": r[1], "total": float(r[2] or 0)} for r in by_status],
        "byType": [{"type": r[0], "count": r[1], "total": float(r[2] or 0)} for r in by_type],
    }


@payment_router.get("/{id}")
def get_payment(id: str, db: Session = Depends(get_db)):
    p = db.query(Payment).filter(Payment.id == id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Payment not found")
    return p


@payment_router.post("/verify-gateway")
def verify_gateway_payment(body: dict):
    """eSewa / Khalti भुक्तानी Gateway प्रमाणीकरण (Mock)"""
    return {
        "success": True,
        "verified": True,
        "transaction_id": body.get("transaction_id", "mock-txn-001"),
        "amount": body.get("amount"),
        "gateway": body.get("gateway", "esewa"),
        "message": "Payment verified successfully (mock)",
    }


@payment_router.post("/", status_code=201)
def create_payment(body: PaymentCreate, db: Session = Depends(get_db)):
    """नयाँ भुक्तानी दर्ता गर्नुहोस्"""
    p = Payment(
        id=str(uuid.uuid4()),
        voucher_no=body.voucher_no,
        type=body.type.value,
        status=body.status.value,
        payee_name=body.payee_name,
        payee_account=body.payee_account,
        payee_bank=body.payee_bank,
        amount=body.amount,
        fiscal_year=body.fiscal_year,
        budget_head=body.budget_head,
        contract_id=body.contract_id,
        description=body.description,
        approved_by=body.approved_by,
        cheque_no=body.cheque_no,
        tenant_id=body.tenant_id,
    )
    db.add(p)
    db.commit()
    db.refresh(p)
    return p


@payment_router.put("/{id}")
def update_payment(id: str, body: PaymentUpdate, db: Session = Depends(get_db)):
    """भुक्तानी अद्यावधिक गर्नुहोस्"""
    p = db.query(Payment).filter(Payment.id == id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Payment not found")
    for field, value in body.dict(exclude_unset=True).items():
        if hasattr(value, 'value'):
            value = value.value
        setattr(p, field, value)
    db.commit()
    db.refresh(p)
    return p


@payment_router.delete("/{id}")
def delete_payment(id: str, db: Session = Depends(get_db)):
    """भुक्तानी अभिलेख हटाउनुहोस्"""
    p = db.query(Payment).filter(Payment.id == id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Payment not found")
    db.delete(p)
    db.commit()
    return {"success": True, "message": "Payment deleted"}
