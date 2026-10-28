"""
Judicial Committee API Router (न्यायिक समिति)
Municipal Digital Twins v2.0
Provides complete case registry, cause lists, hearings, settlements, and mediator directory with strict Multi-Tenant Scoping.
"""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from typing import List, Optional, Any, Dict
from core.database import get_db
from core.tenant import get_tenant_context, TenantContext
from models.judicial import JudicialCase, JudicialMediator, JudicialCauseList
import uuid
from datetime import datetime

router = APIRouter(
    prefix="/api/v1/judicial",
    tags=["Judicial (न्यायिक समिति)"]
)


@router.get('/cases/stats')
def get_judicial_cases_stats():
    return {'total': 0}


# ── 1. JUDICIAL STATS ───────────────────────────────────────────────────────
@router.get("/stats")
def get_judicial_stats(
    ctx: TenantContext = Depends(get_tenant_context),
    db: Session = Depends(get_db)
):
    cases = ctx.filter_query(db.query(JudicialCase).filter(JudicialCase.deleted_at.is_(None)), JudicialCase).all()
    total_cases = len(cases)

    decided = sum(1 for c in cases if (c.status and 'फैसला' in c.status) or c.final_settlement)
    in_hearing = sum(1 for c in cases if c.status and ('इजलास' in c.status or 'सुनुवाइ' in c.status))
    in_reconciliation = sum(1 for c in cases if c.status and 'मेलमिलाप' in c.status)
    new_reg = total_cases - decided

    total_mediators = ctx.filter_query(db.query(JudicialMediator).filter(JudicialMediator.status == 'active'), JudicialMediator).count()

    resolution_rate = round((decided / max(total_cases, 1)) * 100) if total_cases > 0 else 0

    return {
        "totalCases": total_cases,
        "decidedCases": decided,
        "inHearing": in_hearing,
        "inReconciliation": in_reconciliation,
        "newRegistered": new_reg,
        "resolutionRate": resolution_rate,
        "totalMediators": total_mediators,
    }


# ── 2. CASE REGISTRY (उजुरी दर्ता) ──────────────────────────────────────────
@router.get("/cases")
@router.get("/cases/")
def get_judicial_cases(
    ward: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    disputeType: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    ctx: TenantContext = Depends(get_tenant_context),
    db: Session = Depends(get_db)
):
    query = ctx.filter_query(db.query(JudicialCase).filter(JudicialCase.deleted_at.is_(None)), JudicialCase)

    if ward and ward > 0:
        query = query.filter(JudicialCase.ward_number == ward)
    if status and status != 'all':
        query = query.filter(JudicialCase.status.ilike(f"%{status}%"))
    if disputeType and disputeType != 'all':
        query = query.filter(JudicialCase.dispute_type.ilike(f"%{disputeType}%"))
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            or_(
                JudicialCase.title.ilike(search_filter),
                JudicialCase.case_no.ilike(search_filter),
                JudicialCase.complainant_name.ilike(search_filter),
                JudicialCase.respondent_name.ilike(search_filter),
                JudicialCase.claim_details.ilike(search_filter),
            )
        )

    cases = query.order_by(JudicialCase.created_at.desc()).all()
    return [c.to_dict() for c in cases]


@router.get("/cases/{case_id}")
def get_judicial_case(
    case_id: str,
    ctx: TenantContext = Depends(get_tenant_context),
    db: Session = Depends(get_db)
):
    case = None
    try:
        u_id = uuid.UUID(case_id)
        case = ctx.filter_query(db.query(JudicialCase).filter(JudicialCase.id == u_id, JudicialCase.deleted_at.is_(None)), JudicialCase).first()
    except ValueError:
        pass

    if not case:
        case = ctx.filter_query(db.query(JudicialCase).filter(
            JudicialCase.case_no == case_id,
            JudicialCase.deleted_at.is_(None)
        ), JudicialCase).first()

    if not case:
        raise HTTPException(status_code=404, detail="न्यायिक उजुरी फेला परेन।")

    return case.to_dict()


@router.post("/cases", status_code=status.HTTP_201_CREATED)
@router.post("/cases/", status_code=status.HTTP_201_CREATED)
def create_judicial_case(
    data: Dict[str, Any],
    ctx: TenantContext = Depends(get_tenant_context),
    db: Session = Depends(get_db)
):
    title = data.get("title")
    complainant_name = data.get("complainantName") or data.get("complainant_name")
    respondent_name = data.get("respondentName") or data.get("respondent_name")

    if not title or not complainant_name or not respondent_name:
        raise HTTPException(status_code=400, detail="उजुरीको शीर्षक, वादी र प्रतिवादीको नाम अनिवार्य छ।")

    try:
        ward = int(data.get("wardNumber") or data.get("ward_number") or 1)
        count = ctx.filter_query(db.query(JudicialCase), JudicialCase).count() + 1
        
        # Palika prefix
        t_id = (ctx.tenant_id or "").lower()
        if "gaushala" in t_id:
            prefix = f"गौ.न्या.-०{ward}/२०८१-०{count:02d}"
        elif "melamchi" in t_id:
            prefix = f"मे.न्या.-०{ward}/२०८१-०{count:02d}"
        elif "khadadevi" in t_id:
            prefix = f"खाँ.न्या.-०{ward}/२०८१-०{count:02d}"
        elif "benighat" in t_id:
            prefix = f"बे.न्या.-०{ward}/२०८१-०{count:02d}"
        else:
            prefix = f"न्या.वि.-०{ward}/२०८१-०{count:02d}"

        case_no = data.get("caseNo") or data.get("case_no") or prefix

        case = JudicialCase(
            id=uuid.uuid4(),
            tenant_id=ctx.effective_tenant_id,
            case_no=case_no,
            title=title,
            dispute_type=data.get("disputeType") or data.get("dispute_type") or "साँध सिमाना / जग्गा विवाद (Boundary Dispute)",
            status=data.get("status") or "नयाँ दर्ता (Registered)",
            ward_number=ward,
            filing_date_bs=data.get("registrationDateBs") or data.get("filingDateBs") or "२०८१-०६-०१",
            next_hearing_date_bs=data.get("nextHearingDateBs"),
            complainant_name=complainant_name,
            complainant_phone=data.get("complainantPhone") or data.get("complainant_phone"),
            complainant_address=data.get("complainantAddress") or data.get("complainant_address"),
            complainant_citizenship=data.get("complainantCitizenship") or data.get("complainant_citizenship"),
            respondent_name=respondent_name,
            respondent_phone=data.get("respondentPhone") or data.get("respondent_phone"),
            respondent_address=data.get("respondentAddress") or data.get("respondent_address"),
            respondent_citizenship=data.get("respondentCitizenship") or data.get("respondent_citizenship"),
            disputed_kitta_no=data.get("disputedKittaNo") or data.get("disputed_kitta_no"),
            claim_details=data.get("claimDetails") or data.get("claim_details"),
            assigned_mediator_id=data.get("assignedMediatorId") or data.get("assigned_mediator_id"),
            mediator_name=data.get("assignedMediatorName") or data.get("mediatorName") or data.get("mediator_name"),
            hearings=data.get("hearings") or [],
            evidence_documents=data.get("evidenceDocuments") or data.get("evidence_documents") or [],
        )

        db.add(case)
        db.commit()
        db.refresh(case)
        return case.to_dict()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"उजुरी दर्ता गर्न सकिएन: {str(e)}")


@router.put("/cases/{case_id}")
def update_judicial_case(
    case_id: str,
    data: Dict[str, Any],
    ctx: TenantContext = Depends(get_tenant_context),
    db: Session = Depends(get_db)
):
    case = None
    try:
        u_id = uuid.UUID(case_id)
        case = ctx.filter_query(db.query(JudicialCase).filter(JudicialCase.id == u_id, JudicialCase.deleted_at.is_(None)), JudicialCase).first()
    except ValueError:
        pass

    if not case:
        case = ctx.filter_query(db.query(JudicialCase).filter(JudicialCase.case_no == case_id, JudicialCase.deleted_at.is_(None)), JudicialCase).first()

    if not case:
        raise HTTPException(status_code=404, detail="न्यायिक उजुरी फेला परेन।")

    try:
        if "title" in data:
            case.title = data["title"]
        if "disputeType" in data or "dispute_type" in data:
            case.dispute_type = data.get("disputeType") or data.get("dispute_type")
        if "status" in data:
            case.status = data["status"]
        if "wardNumber" in data or "ward_number" in data:
            case.ward_number = int(data.get("wardNumber") or data.get("ward_number"))
        if "nextHearingDateBs" in data:
            case.next_hearing_date_bs = data["nextHearingDateBs"]
        if "claimDetails" in data or "claim_details" in data:
            case.claim_details = data.get("claimDetails") or data.get("claim_details")
        if "respondentStatement" in data or "respondent_statement" in data:
            case.respondent_statement = data.get("respondentStatement") or data.get("respondent_statement")
        if "assignedMediatorId" in data:
            case.assigned_mediator_id = data["assignedMediatorId"]
        if "assignedMediatorName" in data or "mediatorName" in data:
            case.mediator_name = data.get("assignedMediatorName") or data.get("mediatorName")
        if "reconciliationNotes" in data:
            case.reconciliation_notes = data["reconciliationNotes"]
        if "verdict" in data:
            case.verdict = data["verdict"]
        if "finalSettlement" in data:
            case.final_settlement = data["finalSettlement"]

        case.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(case)
        return case.to_dict()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"उजुरी अद्यावधिक गर्न सकिएन: {str(e)}")


@router.delete("/cases/{case_id}")
def delete_judicial_case(
    case_id: str,
    ctx: TenantContext = Depends(get_tenant_context),
    db: Session = Depends(get_db)
):
    case = None
    try:
        u_id = uuid.UUID(case_id)
        case = ctx.filter_query(db.query(JudicialCase).filter(JudicialCase.id == u_id), JudicialCase).first()
    except ValueError:
        case = ctx.filter_query(db.query(JudicialCase).filter(JudicialCase.case_no == case_id), JudicialCase).first()

    if not case:
        raise HTTPException(status_code=404, detail="उजुरी फेला परेन।")

    case.deleted_at = datetime.utcnow()
    db.commit()
    return {"status": "success", "message": "उजुरी सफलतापूर्वक हटाइयो।"}


# ── 3. BENCH HEARINGS (इजलास सुनुवाइ) ──────────────────────────────────────
@router.post("/cases/{case_id}/hearings")
def add_case_hearing(
    case_id: str,
    hearing: Dict[str, Any],
    ctx: TenantContext = Depends(get_tenant_context),
    db: Session = Depends(get_db)
):
    case = None
    try:
        u_id = uuid.UUID(case_id)
        case = ctx.filter_query(db.query(JudicialCase).filter(JudicialCase.id == u_id), JudicialCase).first()
    except ValueError:
        case = ctx.filter_query(db.query(JudicialCase).filter(JudicialCase.case_no == case_id), JudicialCase).first()

    if not case:
        raise HTTPException(status_code=404, detail="उजुरी फेला परेन।")

    try:
        hearings_list = list(case.hearings or [])
        new_record = {
            "id": f"h-{int(datetime.utcnow().timestamp()*1000)}",
            "hearingNo": len(hearings_list) + 1,
            "dateBs": hearing.get("dateBs") or "२०८१-०६-०५",
            "presidedBy": hearing.get("presidedBy") or "उपाध्यक्ष / संयोजक",
            "attendees": hearing.get("attendees") or "वादी तथा प्रतिवादी पक्ष",
            "summary": hearing.get("summary") or "",
            "orderVerdict": hearing.get("orderVerdict") or "",
            "nextHearingDateBs": hearing.get("nextHearingDateBs"),
            "status": hearing.get("status") or "order_issued"
        }
        hearings_list.append(new_record)
        case.hearings = hearings_list

        if hearing.get("nextHearingDateBs"):
            case.next_hearing_date_bs = hearing["nextHearingDateBs"]
        if hearing.get("orderVerdict"):
            case.status = "इजलास सुनुवाइमा (In Hearing)"

        case.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(case)
        return case.to_dict()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"सुनुवाइ रेकर्ड थप्न सकिएन: {str(e)}")


# ── 4. SETTLEMENT / VERDICT (मिलापत्र तथा फैसला) ───────────────────────────
@router.post("/cases/{case_id}/settlement")
def finalize_case_settlement(
    case_id: str,
    settlement: Dict[str, Any],
    ctx: TenantContext = Depends(get_tenant_context),
    db: Session = Depends(get_db)
):
    case = None
    try:
        u_id = uuid.UUID(case_id)
        case = ctx.filter_query(db.query(JudicialCase).filter(JudicialCase.id == u_id), JudicialCase).first()
    except ValueError:
        case = ctx.filter_query(db.query(JudicialCase).filter(JudicialCase.case_no == case_id), JudicialCase).first()

    if not case:
        raise HTTPException(status_code=404, detail="उजुरी फेला परेन।")

    try:
        case.final_settlement = settlement
        case.status = "फैसला भएको (Decided)"
        case.verdict = settlement.get("settlementTerms") or settlement.get("remarks") or "मिलापत्र सम्पन्न"
        case.verdict_date_bs = settlement.get("settledDateBs") or "२०८१-०६-०५"
        case.presided_by = settlement.get("presidedBy")

        case.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(case)
        return case.to_dict()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"फैसला प्रमाणित गर्न सकिएन: {str(e)}")


# ── 5. MEDIATORS DIRECTORY (सूचीकृत मेलमिलापकर्ता) ─────────────────────────
@router.get("/mediators")
def get_mediators(
    ctx: TenantContext = Depends(get_tenant_context),
    db: Session = Depends(get_db)
):
    mediators = ctx.filter_query(db.query(JudicialMediator).filter(JudicialMediator.status == 'active'), JudicialMediator).all()
    if not mediators and any(k in (ctx.tenant_id or "").lower() for k in ("panchpokhari", "f07c2bcc")):
        sample_mediators = [
            ("MED-P5-01", "अधिवक्ता कुल प्रसाद सापकोटा", 3, "९८५१२३४५६७", "kul.sapkota@gmail.com", "मेलमिलाप परिषद् नेपाल (४८ घण्टे तालिम)", "MC-NP-२०७९-१४२", "साँध सिमाना तथा जग्गा विवाद", 2, 14),
            ("MED-P5-02", "सुनिता लामा शेर्पा", 2, "९८४१२२३३८८", "sunita.lama@gmail.com", "न्याय परिषद् तथा स्थानीय शासन सबलीकरण", "MC-NP-२०८०-०८९", "पारिवारिक, घरेलु तथा महिला सम्बन्धी विवाद", 1, 19),
            ("MED-P5-03", "रामेश्वर थाङपाली", 4, "९८०८३३४४५५", "rameshwar@thangpal.org", "मेलमिलाप केन्द्र नेपाल", "MC-NP-२०८०-२१४", "कुलोपानी, बाटो निकास तथा ज्याला मजुरी", 1, 11),
        ]
        seed_list = []
        for code, name, ward, phone, email, inst, cert, spec, act, res in sample_mediators:
            m = JudicialMediator(
                id=uuid.uuid4(),
                tenant_id="panchpokhari",
                mediator_code=code,
                full_name=name,
                ward_no=ward,
                phone=phone,
                email=email,
                training_institute=inst,
                certificate_no=cert,
                specialization=spec,
                active_cases_count=act,
                resolved_cases_count=res,
                status="active"
            )
            db.add(m)
            seed_list.append(m)
        db.commit()
        return [m.to_dict() for m in seed_list]

    return [m.to_dict() for m in mediators]


@router.post("/mediators", status_code=status.HTTP_201_CREATED)
def create_mediator(
    data: Dict[str, Any],
    ctx: TenantContext = Depends(get_tenant_context),
    db: Session = Depends(get_db)
):
    full_name = data.get("fullName") or data.get("full_name")
    if not full_name:
        raise HTTPException(status_code=400, detail="मेलमिलापकर्ताको नाम अनिवार्य छ।")

    try:
        count = ctx.filter_query(db.query(JudicialMediator), JudicialMediator).count() + 1
        code_prefix = "MED-GS-" if "gaushala" in (ctx.tenant_id or "").lower() else ("MED-ML-" if "melamchi" in (ctx.tenant_id or "").lower() else f"MED-P5-")
        mediator = JudicialMediator(
            id=uuid.uuid4(),
            tenant_id=ctx.effective_tenant_id,
            mediator_code=data.get("mediatorCode") or f"{code_prefix}{count:02d}",
            full_name=full_name,
            ward_no=int(data.get("wardNo") or data.get("ward_no") or 1),
            phone=data.get("phone"),
            email=data.get("email"),
            training_institute=data.get("trainingInstitute") or data.get("training_institute") or "मेलमिलाप परिषद् नेपाल",
            certificate_no=data.get("certificateNo") or data.get("certificate_no") or f"MC-NP-२०८१-{int(datetime.utcnow().timestamp())%1000:03d}",
            specialization=data.get("specialization") or "सामान्य विवाद तथा साँधसिमाना",
            active_cases_count=0,
            resolved_cases_count=0,
            status="active"
        )
        db.add(mediator)
        db.commit()
        db.refresh(mediator)
        return mediator.to_dict()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"मेलमिलापकर्ता दर्ता गर्न सकिएन: {str(e)}")


# ── 6. CAUSE LIST (दैनिक इजलास पेशी सूची) ──────────────────────────────────
@router.get("/cause-list")
def get_cause_list(
    date: Optional[str] = Query(None),
    ctx: TenantContext = Depends(get_tenant_context),
    db: Session = Depends(get_db)
):
    query = ctx.filter_query(db.query(JudicialCauseList), JudicialCauseList)
    if date:
        query = query.filter(JudicialCauseList.bench_date_bs == date)

    items = query.order_by(JudicialCauseList.bench_date_bs.desc(), JudicialCauseList.bench_time).all()
    return [i.to_dict() for i in items]


@router.post("/cause-list", status_code=status.HTTP_201_CREATED)
def create_cause_list_item(
    data: Dict[str, Any],
    ctx: TenantContext = Depends(get_tenant_context),
    db: Session = Depends(get_db)
):
    try:
        item = JudicialCauseList(
            id=uuid.uuid4(),
            tenant_id=ctx.effective_tenant_id,
            bench_date_bs=data.get("benchDateBs") or data.get("bench_date_bs") or "२०८१-०६-०५",
            bench_time=data.get("benchTime") or data.get("bench_time") or "दिउँसो ०१:०० बजे",
            case_id=str(data.get("caseId") or ""),
            case_no=data.get("caseNo") or "",
            parties=data.get("parties") or "",
            dispute_type=data.get("disputeType") or "",
            stage=data.get("stage") or "मेलमिलाप छलफल",
            bench_presided_by=data.get("benchPresidedBy") or "उपाध्यक्ष (संयोजक)",
            bench_members=data.get("benchMembers") or ["सदस्य-१", "सदस्य-२"],
            status=data.get("status", "scheduled"),
            result_notes=data.get("resultNotes"),
        )
        db.add(item)
        db.commit()
        db.refresh(item)
        return item.to_dict()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"पेशी सूची थप्न सकिएन: {str(e)}")
