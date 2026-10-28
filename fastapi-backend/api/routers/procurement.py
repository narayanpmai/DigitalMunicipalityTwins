from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid

from core.database import get_db
from core.tenant import TenantContext, get_tenant_context
from models.procurement import Procurement

STATUS_MAP_IN = {
    "contract awarded": "contracted",
    "contracted": "contracted",
    "सम्झौता": "contracted",
    "कार्यान्वयन": "contracted",
    "letter of intent": "awarded",
    "आशय": "awarded",
    "loi": "awarded",
    "awarded": "awarded",
    "मूल्याङ्कन": "evaluation",
    "evaluation": "evaluation",
    "कार्य सम्पन्न": "completed",
    "सम्पन्न": "completed",
    "completed": "completed",
    "बोलपत्र आह्वान": "advertised",
    "प्रकाशित": "advertised",
    "ifb": "advertised",
    "advertised": "advertised",
    "published": "advertised",
    "रद्द": "cancelled",
    "cancelled": "cancelled",
    "मस्यौदा": "planned",
    "draft": "planned",
    "planned": "planned"
}

def normalize_status(val: Optional[str]) -> str:
    if not val: return "planned"
    v = val.lower()
    for k, target in STATUS_MAP_IN.items():
        if k in v:
            return target
    return "planned"

METHOD_MAP_IN = {
    "ncb": "open_tendering",
    "खुला": "open_tendering",
    "open": "open_tendering",
    "sq": "request_for_quotation",
    "दरभाउ": "request_for_quotation",
    "quotation": "request_for_quotation",
    "प्रत्यक्ष": "direct_procurement",
    "direct": "direct_procurement",
    "परामर्श": "consulting",
    "consulting": "consulting",
    "सीमित": "limited_tendering",
    "limited": "limited_tendering"
}

def normalize_method(val: Optional[str]) -> str:
    if not val: return "open_tendering"
    v = val.lower()
    for k, target in METHOD_MAP_IN.items():
        if k in v:
            return target
    return "open_tendering"

router = APIRouter(
    prefix="/api/v1/procurement",
    tags=["Procurement (ई-बोलपत्र तथा खरिद)"]
)

@router.get("")
@router.get("/")
def get_procurements(
    status: Optional[str] = None,
    method: Optional[str] = None,
    sector: Optional[str] = None,
    wardNo: Optional[str] = None,
    search: Optional[str] = None,
    fiscalYear: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context)
):
    query = ctx.filter_query(db.query(Procurement).filter(Procurement.deleted_at.is_(None)), Procurement)
    if fiscalYear and fiscalYear != "all":
        query = query.filter(Procurement.fiscal_year == fiscalYear)
    if status and status != "all":
        query = query.filter(Procurement.status == normalize_status(status))
    if method and method != "all":
        query = query.filter(Procurement.method == normalize_method(method))
    if sector and sector != "all":
        query = query.filter(Procurement.sector.ilike(f"%{sector}%"))
    if wardNo and wardNo != "all":
        query = query.filter(Procurement.ward_no == wardNo)
    if search and search.strip():
        s = f"%{search.strip()}%"
        query = query.filter(
            (Procurement.title.ilike(s)) |
            (Procurement.procurement_no.ilike(s)) |
            (Procurement.awarded_to.ilike(s)) |
            (Procurement.description.ilike(s))
        )
    tenders = query.order_by(desc(Procurement.created_at)).all()
    return [t.to_dict() for t in tenders]


@router.get("/stats")
def get_procurement_stats(
    fiscalYear: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context)
):
    query = ctx.filter_query(db.query(Procurement).filter(Procurement.deleted_at.is_(None)), Procurement)
    if fiscalYear and fiscalYear != "all":
        query = query.filter(Procurement.fiscal_year == fiscalYear)
    tenders = query.all()
    
    total_est = sum(float(t.estimated_amount or 0) for t in tenders)
    total_awarded = sum(float(t.awarded_amount or 0) for t in tenders if t.awarded_amount)
    total_savings = sum(
        (float(t.estimated_amount or 0) - float(t.awarded_amount or 0))
        for t in tenders
        if t.awarded_amount and float(t.awarded_amount) > 0 and float(t.estimated_amount or 0) > float(t.awarded_amount)
    )

    adv_count = len([t for t in tenders if t.status in ["published", "advertised", "बोलपत्र आह्वान प्रकाशित (IFB Published)"]])
    eval_count = len([t for t in tenders if t.status in ["evaluation", "प्राविधिक तथा आर्थिक मूल्याङ्कन (Bid Evaluation)"]])
    awd_count = len([t for t in tenders if t.status in ["loi", "awarded", "७ दिने आशयको सूचना (Letter of Intent - LOI)"]])
    cont_count = len([t for t in tenders if t.status in ["contracted", "ठेक्का सम्झौता तथा कार्यान्वयन (Contract Awarded)"]])
    comp_count = len([t for t in tenders if t.status in ["completed", "कार्य सम्पन्न तथा फरफारक (Work Completed)"]])

    savings_pct = round((total_savings / total_est * 100), 1) if total_est > 0 else 0

    return {
        "totalTenders": len(tenders),
        "advertisedCount": adv_count,
        "evaluationCount": eval_count,
        "awardedCount": awd_count,
        "contractedCount": cont_count,
        "completedCount": comp_count,
        "activeImplementations": cont_count + awd_count,
        "totalEstimatedBudget": total_est,
        "totalAwardedBudget": total_awarded,
        "totalCostSavings": total_savings,
        "savingsPercentage": savings_pct
    }


@router.post("")
@router.post("/")
def create_procurement(payload: Dict[str, Any], db: Session = Depends(get_db)):
    tid = uuid.uuid4()
    p_no = payload.get("procurementNo") or payload.get("tenderNumber")
    if not p_no:
        p_no = f"PROC-2081-NCB-{uuid.uuid4().hex[:4].upper()}"

    est = float(payload.get("estimatedAmountNPR") or payload.get("estimatedAmount") or 0)
    sec_amount = float(payload.get("bidSecurityAmountNPR") or payload.get("bidSecurityAmount") or (est * 0.025))
    doc_fee = float(payload.get("bidDocFeeNPR") or payload.get("bidDocFee") or 3000)

    docs = payload.get("documents") or []
    if not docs and payload.get("noticeFileName"):
        docs.append({"name": payload.get("noticeFileName"), "type": "notice", "size": payload.get("noticeFileSize", "1.2 MB")})
    if payload.get("boqFileName"):
        docs.append({"name": payload.get("boqFileName"), "type": "boq", "size": payload.get("boqFileSize", "480 KB")})

    reqs = payload.get("requirements") or payload.get("selectedRequirements") or []

    new_tender = Procurement(
        id=tid,
        procurement_no=p_no,
        title=payload.get("title", "नयाँ बोलपत्र"),
        description=payload.get("description") or payload.get("proposalDetails") or "",
        method=normalize_method(payload.get("procurementMethod") or payload.get("method")),
        status=normalize_status(payload.get("status")),
        fiscal_year=payload.get("fiscalYear", "२०८१/०८२"),
        sector=payload.get("sector", "सडक तथा यातायात पूर्वाधार"),
        ward_no=str(payload.get("wardNo", "समग्र पालिका")),
        estimated_amount=est,
        awarded_amount=float(payload.get("awardedAmount") or payload.get("contractAmountNPR") or 0) if payload.get("awardedAmount") else None,
        bid_doc_fee=doc_fee,
        bid_security_amount=sec_amount,
        performance_security_amount=float(payload.get("performanceSecurityAmountNPR") or payload.get("performanceSecurityAmount") or (est * 0.05)),
        awarded_to=payload.get("awardedTo") or payload.get("awardedVendorName"),
        awarded_vendor_pan=payload.get("awardedVendorPan"),
        advertised_date_bs=payload.get("advertisedDateBs") or payload.get("publishDateBs", "२०८१-०५-०१"),
        deadline_date_bs=payload.get("deadlineDateBs") or payload.get("submissionDeadlineBs", "२०८१-०५-३१"),
        bidders_count=int(payload.get("biddersCount") or 0),
        bidders_list=payload.get("biddersList") or [],
        running_bills=payload.get("runningBills") or [],
        bank_details=payload.get("bankDetails") or {
            "bankName": payload.get("bankName", "नेपाल बैंक लिमिटेड, मेलम्ची शाखा"),
            "depositAccountNo": payload.get("depositAccountNo", "१२३०१००००५८ (धरौटी खाता)"),
            "revenueAccountNo": payload.get("revenueAccountNo", "१२३०१००००८९ (आन्तरिक राजस्व खाता)")
        },
        documents=docs,
        requirements=reqs,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(new_tender)
    db.commit()
    db.refresh(new_tender)
    return new_tender.to_dict()


@router.get("/{id}")
def get_procurement(id: str, db: Session = Depends(get_db)):
    tender = None
    try:
        tid = uuid.UUID(id)
        tender = db.query(Procurement).filter(Procurement.id == tid).first()
    except ValueError:
        pass
    if not tender:
        tender = db.query(Procurement).filter(Procurement.procurement_no == id).first()
    if not tender:
        raise HTTPException(status_code=404, detail="Procurement tender not found")
    return tender.to_dict()


@router.put("/{id}")
def update_procurement(id: str, payload: Dict[str, Any], db: Session = Depends(get_db)):
    tender = None
    try:
        tid = uuid.UUID(id)
        tender = db.query(Procurement).filter(Procurement.id == tid).first()
    except ValueError:
        pass
    if not tender:
        tender = db.query(Procurement).filter(Procurement.procurement_no == id).first()
    if not tender:
        raise HTTPException(status_code=404, detail="Procurement tender not found")

    if "title" in payload: tender.title = payload["title"]
    if "description" in payload: tender.description = payload["description"]
    if "status" in payload: tender.status = normalize_status(payload["status"])
    if "method" in payload or "procurementMethod" in payload:
        tender.method = normalize_method(payload.get("method") or payload.get("procurementMethod"))
    if "sector" in payload: tender.sector = payload["sector"]
    if "wardNo" in payload: tender.ward_no = str(payload["wardNo"])
    if "estimatedAmount" in payload or "estimatedAmountNPR" in payload:
        tender.estimated_amount = float(payload.get("estimatedAmount") or payload.get("estimatedAmountNPR") or 0)
    if "awardedAmount" in payload or "contractAmountNPR" in payload:
        tender.awarded_amount = float(payload.get("awardedAmount") or payload.get("contractAmountNPR") or 0)
    if "awardedTo" in payload or "awardedVendorName" in payload:
        tender.awarded_to = payload.get("awardedTo") or payload.get("awardedVendorName")
    if "awardedVendorPan" in payload: tender.awarded_vendor_pan = payload["awardedVendorPan"]
    if "documents" in payload: tender.documents = payload["documents"]
    if "requirements" in payload: tender.requirements = payload["requirements"]
    if "biddersList" in payload:
        tender.bidders_list = payload["biddersList"]
        tender.bidders_count = len(payload["biddersList"])
    if "runningBills" in payload: tender.running_bills = payload["runningBills"]

    tender.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(tender)
    return tender.to_dict()


@router.post("/{id}/advance-stage")
def advance_procurement_stage(id: str, payload: Dict[str, Any], db: Session = Depends(get_db)):
    tender = None
    try:
        tid = uuid.UUID(id)
        tender = db.query(Procurement).filter(Procurement.id == tid).first()
    except ValueError:
        pass
    if not tender:
        tender = db.query(Procurement).filter(Procurement.procurement_no == id).first()
    if not tender:
        raise HTTPException(status_code=404, detail="Procurement tender not found")

    new_status = payload.get("status")
    if new_status:
        tender.status = normalize_status(new_status)
    if payload.get("awardedTo"):
        tender.awarded_to = payload["awardedTo"]
    if payload.get("awardedAmount"):
        tender.awarded_amount = float(payload["awardedAmount"])
    if payload.get("awardedVendorPan"):
        tender.awarded_vendor_pan = payload["awardedVendorPan"]

    tender.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(tender)
    return tender.to_dict()


@router.post("/{id}/submit-bid")
def submit_bid(id: str, payload: Dict[str, Any], db: Session = Depends(get_db)):
    tender = None
    try:
        tid = uuid.UUID(id)
        tender = db.query(Procurement).filter(Procurement.id == tid).first()
    except ValueError:
        pass
    if not tender:
        tender = db.query(Procurement).filter(Procurement.procurement_no == id).first()
    if not tender:
        raise HTTPException(status_code=404, detail="Procurement tender not found")

    submission_no = f"EBID-2081-{uuid.uuid4().hex[:6].upper()}"
    bidder_entry = {
        "submissionNo": submission_no,
        "name": payload.get("applicantName") or payload.get("name") or "अज्ञात बोलपत्रदाता",
        "contactPerson": payload.get("contactPerson", ""),
        "phone": payload.get("phone", ""),
        "email": payload.get("email", ""),
        "panVat": payload.get("panVat", ""),
        "applicantType": payload.get("applicantType", "निर्माण व्यवसायी / फर्म"),
        "address": payload.get("address", ""),
        "bidAmount": float(payload.get("bidAmount") or 0),
        "bidAmountNPR": float(payload.get("bidAmount") or 0),
        "bidSecurityBank": payload.get("bidSecurityBank", ""),
        "bidSecurityVoucherNo": payload.get("bidSecurityVoucherNo", ""),
        "bidSecurityAmount": float(payload.get("bidSecurityAmount") or 0),
        "bidSecurityExpiryDate": payload.get("bidSecurityExpiryDate", "२०८१-०९-३०"),
        "status": "दर्ता सम्पन्न (रुजु प्रक्रियामा)",
        "submissionDateBs": "२०८१-०६-०१",
        "submittedAt": datetime.utcnow().isoformat()
    }
    
    current_list = list(tender.bidders_list or [])
    current_list.append(bidder_entry)
    tender.bidders_list = current_list
    tender.bidders_count = len(current_list)
    tender.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(tender)

    return {
        "success": True,
        "submissionNo": submission_no,
        "tenderNumber": tender.procurement_no,
        "applicantName": bidder_entry["name"],
        "bidAmount": bidder_entry["bidAmount"],
        "message": f"ई-बोलपत्र सफलतापूर्वक दर्ता भयो। दर्ता नं: {submission_no}"
    }


@router.delete("/{id}")
def delete_procurement(id: str, db: Session = Depends(get_db)):
    tender = None
    try:
        tid = uuid.UUID(id)
        tender = db.query(Procurement).filter(Procurement.id == tid).first()
    except ValueError:
        pass
    if not tender:
        tender = db.query(Procurement).filter(Procurement.procurement_no == id).first()
    if not tender:
        raise HTTPException(status_code=404, detail="Procurement tender not found")

    tender.deleted_at = datetime.utcnow()
    db.commit()
    return {"deleted": True, "id": str(tender.id)}
