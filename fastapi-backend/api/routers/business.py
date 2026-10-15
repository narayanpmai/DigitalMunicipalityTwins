from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid

from core.database import get_db
from models.business import Business, BusinessRenewal, BusinessInspection, calculate_annual_fee
from models.master_data import BusinessMaster

router = APIRouter(
    prefix="/api/v1/businesses",
    tags=["Businesses (व्यवसाय दर्ता तथा नवीकरण)"]
)

# Secondary router for singular alias /api/v1/business
singular_router = APIRouter(
    prefix="/api/v1/business",
    tags=["Businesses Singular Alias"]
)


@router.get("")
@router.get("/")
@singular_router.get("")
@singular_router.get("/")
def get_businesses(
    status: Optional[str] = None,
    category: Optional[str] = None,
    ward: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Business).filter(Business.deleted_at.is_(None))
    
    if status and status != "all":
        query = query.filter(Business.status == status)
    if category and category != "all":
        query = query.filter(Business.category == category)
    if ward and ward != "all":
        try:
            w_int = int(ward)
            query = query.filter(Business.ward_number == w_int)
        except ValueError:
            pass
    if search and search.strip():
        s = f"%{search.strip()}%"
        query = query.filter(
            (Business.business_name.ilike(s)) |
            (Business.business_name_en.ilike(s)) |
            (Business.registration_no.ilike(s)) |
            (Business.proprietor_name.ilike(s)) |
            (Business.pan_number.ilike(s))
        )
        
    records = query.order_by(desc(Business.created_at)).all()
    return [b.to_dict() for b in records]


@router.get("/stats")
@singular_router.get("/stats")
def get_business_stats(db: Session = Depends(get_db)):
    businesses = db.query(Business).filter(Business.deleted_at.is_(None)).all()
    renewals = db.query(BusinessRenewal).all()

    total_registered = len(businesses)
    active_count = len([b for b in businesses if b.status not in ["रद्द", "निलम्बित"]])
    renewed_count = len([b for b in businesses if b.status == "नवीकृत"])
    pending_renewal_count = len([b for b in businesses if b.status in ["नवीकरण बाँकी", "आवेदन पेश भएको"]])
    suspended_count = len([b for b in businesses if b.status == "निलम्बित"])
    cancelled_count = len([b for b in businesses if b.status == "रद्द"])

    total_capital = sum(float(b.initial_capital or 0) for b in businesses)
    total_employees = sum(int((b.details or {}).get("employeeCount", 3)) for b in businesses)
    total_revenue = sum(float(r.total_paid_npr or 0) for r in renewals)
    if total_revenue == 0:
        total_revenue = sum(float(b.license_fee or 0) for b in businesses if (b.details or {}).get("paymentStatus") == "भुक्तानी सम्पन्न")

    category_breakdown: Dict[str, int] = {}
    ward_breakdown: Dict[str, int] = {f"वडा {w}": 0 for w in range(1, 9)}

    for b in businesses:
        cat = b.category or "अन्य"
        category_breakdown[cat] = category_breakdown.get(cat, 0) + 1
        wk = f"वडा {b.ward_number or 1}"
        ward_breakdown[wk] = ward_breakdown.get(wk, 0) + 1

    return {
        "totalRegistered": total_registered,
        "activeCount": active_count,
        "renewedCount": renewed_count,
        "pendingRenewalCount": pending_renewal_count,
        "suspendedCount": suspended_count,
        "cancelledCount": cancelled_count,
        "totalCapitalInvestedNPR": total_capital,
        "totalEmployeeCount": total_employees,
        "totalRevenueThisFyNPR": total_revenue,
        "categoryBreakdown": category_breakdown,
        "wardBreakdown": ward_breakdown
    }


@router.get("/renewals")
@singular_router.get("/renewals")
def get_renewals(db: Session = Depends(get_db)):
    records = db.query(BusinessRenewal).order_by(desc(BusinessRenewal.created_at)).all()
    return [r.to_dict() for r in records]


@router.get("/inspections")
@singular_router.get("/inspections")
def get_inspections(db: Session = Depends(get_db)):
    records = db.query(BusinessInspection).order_by(desc(BusinessInspection.created_at)).all()
    return [i.to_dict() for i in records]


@router.get("/mdm")
@singular_router.get("/mdm")
def get_mdm_businesses(db: Session = Depends(get_db)):
    records = db.query(BusinessMaster).all()
    return [b.to_dict() for b in records]


@router.post("")
@router.post("/")
@singular_router.post("")
@singular_router.post("/")
def create_business(payload: Dict[str, Any], db: Session = Depends(get_db)):
    bid = uuid.uuid4()
    count = db.query(Business).count() + 1
    reg_no = payload.get("registrationNo") or f"पाँ.था./व्य.दर्ता/२०८१-{String_pad(count)}"
    
    cap = float(payload.get("capitaInvestmentNPR") or payload.get("initialCapital") or payload.get("capital_investment_npr") or 500000)
    fee = float(payload.get("annualFeeNPR") or payload.get("annual_fee_npr") or payload.get("licenseFee") or calculate_annual_fee(cap))
    
    details = {
        "vatNumber": payload.get("vatNumber", ""),
        "subCategory": payload.get("subCategory", ""),
        "tole": payload.get("tole", payload.get("toleAddress", "")),
        "landOwner": payload.get("landOwner", ""),
        "buildingKittaNo": payload.get("buildingKittaNo", ""),
        "employeeCount": int(payload.get("employeeCount", 2)),
        "femaleEmployeeCount": int(payload.get("femaleEmployeeCount", 1)),
        "annualFeeNPR": fee,
        "fineNPR": float(payload.get("fineNPR", 0)),
        "renewalDueDateBs": payload.get("renewalDueDateBs", "२०८२-०३-३१"),
        "lastRenewalDateBs": payload.get("lastRenewalDateBs", ""),
        "paymentStatus": payload.get("paymentStatus", "भुक्तानी सम्पन्न"),
        "lastReceiptNo": payload.get("lastReceiptNo", f"P5-BIZ-NEW-{uuid.uuid4().hex[:4].upper()}"),
        "lastPaymentGateway": payload.get("lastPaymentGateway", "FONEPAY"),
        "environmentalStatus": payload.get("environmentalStatus", "प्रभाव नगर्ने (Green)"),
        "certQrUrl": f"/api/v1/businesses/{bid}/qr"
    }

    new_biz = Business(
        id=bid,
        registration_no=reg_no,
        business_name=payload.get("businessName") or payload.get("business_name", ""),
        business_name_en=payload.get("businessNameEn", ""),
        category=payload.get("category", "व्यापार तथा किराना पसल (Retail & Wholesale)"),
        firm_type=payload.get("firmType", "एकलौटी फर्म"),
        status=payload.get("status", "दर्ता सम्पन्न"),
        proprietor_name=payload.get("proprietorName") or payload.get("proprietor_name", ""),
        proprietor_phone=payload.get("proprietorPhone", ""),
        proprietor_email=payload.get("proprietorEmail", ""),
        citizenship_no=payload.get("proprietorCitizenshipNo") or payload.get("citizenshipNo", ""),
        pan_number=payload.get("panNumber", ""),
        ward_number=int(payload.get("wardNumber") or payload.get("ward_number") or 1),
        tole_address=payload.get("tole") or payload.get("toleAddress", ""),
        initial_capital=cap,
        license_fee=fee,
        receipt_no=details["lastReceiptNo"],
        registration_date_bs=payload.get("registrationDateBs", "२०८१-०५-०१"),
        expiry_date_bs=payload.get("expiryDateBs", "२०८२-०३-३१"),
        business_objectives=payload.get("businessObjectives", ""),
        verified_by=payload.get("verifiedBy", "वडा सचिव / राजस्व अधिकृत"),
        details=details,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(new_biz)
    db.commit()
    db.refresh(new_biz)
    return new_biz.to_dict()


def String_pad(n: int) -> str:
    return str(n).zfill(2)


@router.get("/{id}")
@singular_router.get("/{id}")
def get_business(id: str, db: Session = Depends(get_db)):
    biz = find_business(id, db)
    if not biz:
        raise HTTPException(status_code=404, detail="Business not found")
    return biz.to_dict()


@router.put("/{id}")
@singular_router.put("/{id}")
def update_business(id: str, payload: Dict[str, Any], db: Session = Depends(get_db)):
    biz = find_business(id, db)
    if not biz:
        raise HTTPException(status_code=404, detail="Business not found")

    if "businessName" in payload: biz.business_name = payload["businessName"]
    if "businessNameEn" in payload: biz.business_name_en = payload["businessNameEn"]
    if "proprietorName" in payload: biz.proprietor_name = payload["proprietorName"]
    if "proprietorPhone" in payload: biz.proprietor_phone = payload["proprietorPhone"]
    if "panNumber" in payload: biz.pan_number = payload["panNumber"]
    if "category" in payload: biz.category = payload["category"]
    if "wardNumber" in payload: biz.ward_number = int(payload["wardNumber"])
    if "tole" in payload: biz.tole_address = payload["tole"]
    if "status" in payload: biz.status = payload["status"]
    if "capitaInvestmentNPR" in payload:
        biz.initial_capital = float(payload["capitaInvestmentNPR"])
    if "annualFeeNPR" in payload:
        biz.license_fee = float(payload["annualFeeNPR"])

    det = dict(biz.details or {})
    for k in ["employeeCount", "femaleEmployeeCount", "environmentalStatus", "vatNumber", "subCategory", "paymentStatus", "lastRenewalDateBs", "renewalDueDateBs"]:
        if k in payload:
            det[k] = payload[k]
    biz.details = det

    biz.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(biz)
    return biz.to_dict()


@router.post("/{id}/renew")
@singular_router.post("/{id}/renew")
def renew_business(id: str, payload: Dict[str, Any], db: Session = Depends(get_db)):
    biz = find_business(id, db)
    if not biz:
        raise HTTPException(status_code=404, detail="Business not found")

    officer = payload.get("officerName", "सुरेन्द्र श्रेष्ठ (वडा सचिव)")
    gateway = payload.get("paymentGateway", "FONEPAY")
    fiscal_year = payload.get("fiscalYear", "२०८१/०८२")
    receipt_no = f"P5-BIZ-REN-{uuid.uuid4().hex[:4].upper()}"

    det = dict(biz.details or {})
    fee = float(biz.license_fee or det.get("annualFeeNPR") or calculate_annual_fee(float(biz.initial_capital or 0)))
    fine = float(payload.get("fineNPR") or det.get("fineNPR") or 0)
    total_paid = fee + fine

    # Update business
    biz.status = "नवीकृत"
    det["lastRenewalDateBs"] = "२०८१-०५-०१"
    det["renewalDueDateBs"] = "२०८२-०३-३१"
    det["paymentStatus"] = "भुक्तानी सम्पन्न"
    det["lastReceiptNo"] = receipt_no
    det["lastPaymentGateway"] = gateway
    biz.details = det
    biz.updated_at = datetime.utcnow()

    # Create renewal record
    renewal = BusinessRenewal(
        id=uuid.uuid4(),
        business_id=str(biz.id),
        registration_no=biz.registration_no,
        business_name=biz.business_name,
        proprietor_name=biz.proprietor_name,
        ward_number=biz.ward_number or 1,
        fiscal_year=fiscal_year,
        renewal_date_bs="२०८१-०५-०१",
        annual_fee_npr=fee,
        fine_npr=fine,
        total_paid_npr=total_paid,
        payment_gateway=gateway,
        receipt_no=receipt_no,
        renewed_by_officer=officer,
        created_at=datetime.utcnow()
    )
    db.add(renewal)
    db.commit()
    db.refresh(biz)

    return {
        "success": True,
        "business": biz.to_dict(),
        "renewal": renewal.to_dict()
    }


@router.post("/inspections")
@singular_router.post("/inspections")
def add_inspection(payload: Dict[str, Any], db: Session = Depends(get_db)):
    reg_no = payload.get("registrationNo", "")
    biz = None
    if payload.get("businessId"):
        biz = find_business(payload["businessId"], db)
    elif reg_no:
        biz = db.query(Business).filter(Business.registration_no == reg_no).first()

    ins_rec = BusinessInspection(
        id=uuid.uuid4(),
        business_id=str(biz.id) if biz else (payload.get("businessId") or ""),
        registration_no=biz.registration_no if biz else reg_no,
        business_name=biz.business_name if biz else payload.get("businessName", ""),
        ward_number=biz.ward_number if biz else int(payload.get("wardNumber", 1)),
        inspection_date_bs=payload.get("inspectionDateBs", "२०८१-०५-०१"),
        inspection_type=payload.get("inspectionType", "नियमित वार्षिक"),
        inspector_name=payload.get("inspectorName", ""),
        inspector_designation=payload.get("inspectorDesignation", "राजस्व निरीक्षक"),
        compliance_status=payload.get("complianceStatus", "अनुपालन सम्पन्न ✅"),
        remarks=payload.get("remarks", ""),
        follow_up_date_bs=payload.get("followUpDateBs", ""),
        created_at=datetime.utcnow()
    )
    db.add(ins_rec)

    if biz:
        det = dict(biz.details or {})
        det["inspectionDateBs"] = ins_rec.inspection_date_bs
        det["inspectionOfficer"] = f"{ins_rec.inspector_name} ({ins_rec.inspector_designation})"
        det["inspectionRemarks"] = ins_rec.remarks
        biz.details = det
        biz.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(ins_rec)
    return ins_rec.to_dict()


@router.post("/{id}/status")
@singular_router.post("/{id}/status")
def update_business_status(id: str, payload: Dict[str, Any], db: Session = Depends(get_db)):
    biz = find_business(id, db)
    if not biz:
        raise HTTPException(status_code=404, detail="Business not found")

    new_status = payload.get("status")
    if new_status:
        biz.status = new_status
        biz.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(biz)
    return biz.to_dict()


@router.delete("/{id}")
@singular_router.delete("/{id}")
def delete_business(id: str, db: Session = Depends(get_db)):
    biz = find_business(id, db)
    if not biz:
        raise HTTPException(status_code=404, detail="Business not found")

    biz.deleted_at = datetime.utcnow()
    db.commit()
    return {"deleted": True, "id": str(biz.id)}


def find_business(id_or_reg: str, db: Session) -> Optional[Business]:
    try:
        tid = uuid.UUID(id_or_reg)
        b = db.query(Business).filter(Business.id == tid, Business.deleted_at.is_(None)).first()
        if b: return b
    except ValueError:
        pass
    return db.query(Business).filter(
        Business.registration_no == id_or_reg,
        Business.deleted_at.is_(None)
    ).first()
