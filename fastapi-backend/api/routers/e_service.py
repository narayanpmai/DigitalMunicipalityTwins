import uuid
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from core.database import get_db
import models.e_service as models
import schemas.e_service as schemas

router = APIRouter(
    prefix="/api/v1/e-services",
    tags=["Digital Sifaris (E-Service)"]
)

# --- SERVICE TEMPLATES ---
@router.post("/templates/", response_model=schemas.ServiceTemplateResponse, status_code=status.HTTP_201_CREATED)
def create_template(template: schemas.ServiceTemplateCreate, db: Session = Depends(get_db)):
    db_obj = models.ServiceTemplate(**template.model_dump())
    db.add(db_obj)
    try:
        db.commit()
        db.refresh(db_obj)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    return db_obj

@router.get("/templates/", response_model=List[schemas.ServiceTemplateResponse])
def read_templates(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.ServiceTemplate).offset(skip).limit(limit).all()


# --- SERVICE APPLICATIONS ---
@router.post("/applications/", response_model=schemas.ServiceApplicationResponse, status_code=status.HTTP_201_CREATED)
def create_application(application: schemas.ServiceApplicationCreate, db: Session = Depends(get_db)):
    db_obj = models.ServiceApplication(**application.model_dump())
    db.add(db_obj)
    try:
        db.commit()
        db.refresh(db_obj)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    return db_obj

@router.get("/applications/", response_model=List[schemas.ServiceApplicationResponse])
def read_applications(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.ServiceApplication).offset(skip).limit(limit).all()


# --- SERVICE PAYMENTS ---
@router.get("/payments/")
def read_payments(
    status: Optional[str] = Query(None),
    method: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    q = db.query(models.ServicePayment)
    if status and status != "all":
        q = q.filter(models.ServicePayment.payment_status.ilike(f"%{status}%"))
    if method and method != "all":
        q = q.filter(models.ServicePayment.payment_method.ilike(f"%{method}%"))
    if search:
        s = f"%{search}%"
        q = q.filter(
            (models.ServicePayment.transaction_id.ilike(s)) |
            (models.ServicePayment.payment_method.ilike(s)) |
            (models.ServicePayment.application_id.ilike(s))
        )
    payments = q.order_by(models.ServicePayment.created_at.desc()).offset(skip).limit(limit).all()
    return [p.to_dict() for p in payments]


@router.get("/payments/stats")
def read_payment_stats(db: Session = Depends(get_db)):
    total_count = db.query(models.ServicePayment).count()
    completed_count = db.query(models.ServicePayment).filter(
        models.ServicePayment.payment_status.in_(["Completed", "Verified", "completed", "paid"])
    ).count()
    pending_count = db.query(models.ServicePayment).filter(
        models.ServicePayment.payment_status.in_(["Pending", "pending"])
    ).count()
    total_amount = db.query(func.coalesce(func.sum(models.ServicePayment.amount), 0)).scalar() or 0

    method_breakdown = (
        db.query(
            models.ServicePayment.payment_method,
            func.count(models.ServicePayment.id),
            func.coalesce(func.sum(models.ServicePayment.amount), 0)
        )
        .group_by(models.ServicePayment.payment_method)
        .all()
    )

    return {
        "totalPayments": total_count,
        "completedPayments": completed_count,
        "pendingPayments": pending_count,
        "totalAmount": float(total_amount),
        "byMethod": [
            {"method": m[0], "count": m[1], "amount": float(m[2])}
            for m in method_breakdown if m[0]
        ]
    }


@router.get("/payments/{payment_id}")
def read_payment_by_id(payment_id: str, db: Session = Depends(get_db)):
    p = db.query(models.ServicePayment).filter(models.ServicePayment.id == payment_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Payment record not found")
    return p.to_dict()


@router.post("/payments/", status_code=status.HTTP_201_CREATED)
def create_payment(payment: schemas.ServicePaymentCreate, db: Session = Depends(get_db)):
    data = payment.model_dump() if hasattr(payment, 'model_dump') else dict(payment)
    pid = str(uuid.uuid4())
    app_id = data.get("application_id")

    app = db.query(models.ServiceApplication).filter(models.ServiceApplication.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Service Application not found")

    txn_id = data.get("transaction_id") or f"TXN-ESRV-{uuid.uuid4().hex[:8].upper()}"
    db_obj = models.ServicePayment(
        id=pid,
        tenant_id=data.get("tenant_id") or app.tenant_id or "panchpokhari",
        application_id=app_id,
        amount=data.get("amount", 0),
        payment_method=data.get("payment_method", "eSewa"),
        transaction_id=txn_id,
        payment_status=data.get("payment_status", "Completed"),
        receipt_url=data.get("receipt_url", f"/receipts/{pid}.pdf"),
        created_at=datetime.utcnow()
    )
    db.add(db_obj)

    if app.status in ["Submitted", "KYC Verified", "Payment Pending", "Draft"]:
        app.status = "Payment Verified"

    try:
        db.commit()
        db.refresh(db_obj)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    return db_obj.to_dict()


# --- ISSUED CERTIFICATES ---
@router.post("/certificates/", response_model=schemas.IssuedCertificateResponse, status_code=status.HTTP_201_CREATED)
def issue_certificate(certificate: schemas.IssuedCertificateCreate, db: Session = Depends(get_db)):
    db_obj = models.IssuedCertificate(**certificate.model_dump())
    db.add(db_obj)
    try:
        db.commit()
        db.refresh(db_obj)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    return db_obj

@router.get("/certificates/")
def list_certificates(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    certs = db.query(models.IssuedCertificate).offset(skip).limit(limit).all()
    result = []
    for c in certs:
        app = c.application
        tpl = app.template if app else None
        sub = app.submitted_data if app and isinstance(app.submitted_data, dict) else {}
        result.append({
            "id": c.id,
            "qrCode": c.qr_verification_token,
            "certNo": c.certificate_no,
            "type": tpl.service_code if tpl else "citizenship_recommendation",
            "serviceName": tpl.service_name_np if tpl else "नागरिक सिफारिस",
            "issuedTo": sub.get("applicant_name", sub.get("नाम", "अभिलेख प्राप्त")),
            "issuedDate": c.issue_date.strftime("%Y-%m-%d") if c.issue_date else "",
            "issuedBy": f"वडा कार्यालय, वडा नं. {app.ward_id}" if app else "गाउँपालिका कार्यालय",
            "ward": int(app.ward_id) if app and str(app.ward_id).isdigit() else 1,
            "isValid": True,
            "pdfUrl": c.pdf_url,
            "details": sub,
        })
    return result

@router.get("/certificates/verify/{token}")
def verify_certificate(token: str, db: Session = Depends(get_db)):
    clean_token = token.strip()
    cert = db.query(models.IssuedCertificate).filter(
        (models.IssuedCertificate.qr_verification_token == clean_token) |
        (models.IssuedCertificate.certificate_no == clean_token)
    ).first()
    
    if not cert:
        raise HTTPException(status_code=404, detail="प्रमाणपत्र फेला परेन। कृपया टोकन वा प्रमाणपत्र नं. रुजु गर्नुहोस्।")
    
    app = cert.application
    tpl = app.template if app else None
    sub = app.submitted_data if app and isinstance(app.submitted_data, dict) else {}
    
    return {
        "isValid": True,
        "qrCode": cert.qr_verification_token,
        "certNo": cert.certificate_no,
        "type": tpl.service_code if tpl else "citizenship_recommendation",
        "serviceName": tpl.service_name_np if tpl else "सिफारिस प्रमाणपत्र",
        "issuedTo": sub.get("applicant_name", sub.get("नाम", "अभिलेख प्राप्त")),
        "issuedDate": cert.issue_date.strftime("%Y-%m-%d") if cert.issue_date else "",
        "issuedBy": f"वडा नं. {app.ward_id} कार्यालय" if app else "पाँचपोखरी थाङपाल गाउँपालिका",
        "ward": int(app.ward_id) if app and str(app.ward_id).isdigit() else 1,
        "pdfUrl": cert.pdf_url,
        "digitalSignatureId": cert.digital_signature_id,
        "details": sub,
        "verifiedAt": datetime.utcnow().isoformat()
    }
