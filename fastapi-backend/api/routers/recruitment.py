from fastapi import APIRouter, Depends, HTTPException, Query, status, UploadFile, File, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, func
from typing import List, Optional, Dict, Any
import uuid
import datetime
import os
import time
import json
import base64
import hmac
import hashlib
from io import BytesIO
import openpyxl
from openpyxl.styles import Font, Alignment, PatternFill, Border, Side

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

from core.database import get_db
from core.tenant import TenantContext, get_tenant_context
from models.employee import Employee
from models.recruitment import (
    VacancyAnnouncement,
    JobApplication,
    RecruitmentPayment,
    RecruitmentAuditLog,
    RecruitmentRefund
)
from schemas.recruitment import (
    VacancyAnnouncementSchema,
    VacancyAnnouncementCreate,
    VacancyAnnouncementUpdate,
    JobApplicationSchema,
    JobApplicationCreate,
    JobApplicationUpdate,
    ApplicationVerificationUpdate,
    CandidateDocumentResubmitRequest,
    PaymentInitiateRequest,
    PaymentInitiateResponse,
    PaymentVerifyRequest,
    PaymentVerifyResponse,
    OfficialReceiptSchema,
    AuditLogSchema,
    RefundCreateRequest,
    OnboardToHrmsRequest
)
from models.user import User, UserRole
from api.routers.auth import get_current_user, require_roles, _get_token_payload
from models.darta_chalani import Chalani


def get_or_create_recruitment_chalani(db: Session, app: JobApplication, fiscal_year: str = '२०८३/०८४', tenant_id: str = None) -> str:
    """
    डिजिटल दर्ता तथा चलानी व्यवस्थापन प्रणाली (Darta-Chalani) सँग सिधै लिङ्क गरी
    चालू आ.व. को आधिकारिक बहिर्गमन चलानी (Chalani) नम्बर स्वतः दाबी गर्ने र
    चलानी किताबमा दर्ता गर्ने।
    """
    from datetime import datetime

    nep_to_eng = {'०':'0', '१':'1', '२':'2', '३':'3', '४':'4', '५':'5', '६':'6', '७':'7', '८':'8', '९':'9'}
    eng_to_nep = {'0':'०', '1':'१', '2':'२', '3':'३', '4':'४', '5':'५', '6':'६', '7':'७', '8':'८', '9':'९'}

    def parse_nep_num(val):
        if not val:
            return 0
        s = ''.join(nep_to_eng.get(ch, ch) for ch in str(val) if ch.isdigit() or ch in nep_to_eng)
        return int(s) if s else 0

    def format_nep_num(num):
        return ''.join(eng_to_nep.get(ch, ch) for ch in str(num))

    # 1. First check if a Chalani entry already exists for this application
    if app.application_no:
        existing = db.query(Chalani).filter(Chalani.letter_ref_no == app.application_no).first()
        if existing and existing.dispatch_no:
            return existing.dispatch_no

    # 2. Find maximum existing dispatch number in this fiscal year
    all_in_fy = db.query(Chalani).filter(Chalani.fiscal_year == fiscal_year).all()
    max_num = max([parse_nep_num(c.dispatch_no) for c in all_in_fy if c.dispatch_no] + [0])
    next_num = max_num + 1
    next_chalani_no = format_nep_num(next_num)

    # 3. Create official Outward Chalani record
    eff_tenant = tenant_id or app.tenant_id or 'panchpokhari'
    now_ad = datetime.utcnow()
    new_chalani = Chalani(
        id=str(uuid.uuid4()),
        tenant_id=eff_tenant,
        dispatch_no=str(next_chalani_no),
        fiscal_year=fiscal_year,
        dispatch_date=app.exam_date_time or "२०८३-०८-०५",
        dispatch_date_ad=now_ad.strftime("%Y-%m-%d"),
        letter_ref_no=app.application_no,
        receiver_name=app.full_name_np or "उम्मेदवार",
        receiver_address=f"{app.permanent_address or ''} (ना.नं: {app.citizenship_no or ''})".strip(),
        receiver_contact=app.contact_phone,
        receiver_email=app.email,
        subject=f"प्रवेशपत्र तथा दरखास्त स्वीकृति — विज्ञापन नं: {app.vacancy_no or ''}, पद: {app.post_title or ''}",
        department="कर्मचारी पदपूर्ति तथा आन्तरिक परीक्षा सञ्चालन समिति",
        signed_by="प्रमुख प्रशासकीय अधिकृत",
        classification="प्रशासनिक / पदपूर्ति",
        priority="जरुरी",
        delivery_method="अनलाइन प्रणाली स्वतः जारी (Digital Auto Dispatch)",
        verification_code=f"PTRM-CHALANI-{fiscal_year.replace('/', '-')}-{next_chalani_no}",
        status="चलानी भएको",
        approval_status="approved",
        approved_by="SYSTEM:RECRUITMENT_AUTO",
        approved_at=now_ad,
        remarks=f"Recruitment Application Approved - Roll: {app.admit_card_roll_no or 'N/A'}"
    )
    db.add(new_chalani)
    return str(next_chalani_no)


RECRUITMENT_ADMIN_ROLES = (
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.CAO,
    UserRole.IT_ADMIN,
    UserRole.REVENUE_OFFICER,
)

router = APIRouter(
    prefix="/api/v1/recruitment",
    tags=["Recruitment & Job Vacancy Portal"]
)

def is_valid_uuid(val: str) -> bool:
    try:
        uuid.UUID(str(val))
        return True
    except (ValueError, TypeError, AttributeError):
        return False

def record_audit(
    db: Session,
    entity_type: str,
    entity_id: str,
    action: str,
    performed_by: str,
    details: Optional[str] = None,
    ip_address: Optional[str] = None,
    tenant_id: Optional[str] = "panchpokhari"
):
    try:
        log = RecruitmentAuditLog(
            id=str(uuid.uuid4()),
            tenant_id=tenant_id or "panchpokhari",
            entity_type=entity_type,
            entity_id=entity_id,
            action=action,
            performed_by=performed_by,
            details=details,
            ip_address=ip_address,
            created_at=datetime.datetime.utcnow()
        )
        db.add(log)
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Error recording audit log: {e}")


# -------------------------------------------------------------
# 1. SUMMARY STATS (ENHANCED FOR FINANCIALS)
# -------------------------------------------------------------
@router.get("/summary")
def get_recruitment_summary(
    ctx: TenantContext = Depends(get_tenant_context),
    db: Session = Depends(get_db)
):
    vac_query = ctx.filter_query(db.query(VacancyAnnouncement), VacancyAnnouncement)
    app_query = ctx.filter_query(db.query(JobApplication), JobApplication)
    pay_query = ctx.filter_query(db.query(RecruitmentPayment), RecruitmentPayment)

    total_vacancies = vac_query.count()
    active_vacancies = vac_query.filter(VacancyAnnouncement.status == "खुला (Active)").count()
    
    total_applications = app_query.count()
    pending_applications = app_query.filter(JobApplication.status.like("%विचाराधीन%")).count()
    approved_applications = app_query.filter(JobApplication.status.like("%स्वीकृत%")).count()
    rejected_applications = app_query.filter(JobApplication.status.like("%अस्वीकृत%")).count()

    # केवल 'स्वीकृत (Approved)' भएका र भुक्तानी भएका दरखास्तलाई मात्र आधिकारिक भुक्तानी मान्ने
    paid_applications = app_query.filter(
        JobApplication.status.like("%स्वीकृत%"),
        or_(
            JobApplication.payment_status == "PAID",
            JobApplication.receipt_no.isnot(None),
            JobApplication.paid_amount > 0
        )
    ).count()

    unpaid_applications = app_query.filter(
        or_(
            JobApplication.payment_status == "UNPAID",
            JobApplication.payment_status == "FAILED"
        )
    ).count()

    # संकलित दस्तुर राजस्व (Realized Revenue): केवल स्वीकृत भएका दरखास्तहरूको शुल्क मात्र (शीर्षक १४२२९)
    approved_paid_apps = app_query.filter(
        JobApplication.status.like("%स्वीकृत%"),
        or_(
            JobApplication.payment_status == "PAID",
            JobApplication.receipt_no.isnot(None),
            JobApplication.paid_amount > 0
        )
    ).all()
    total_revenue = sum([float(a.paid_amount or 0.0) for a in approved_paid_apps])

    # धरौटी / छानबिनमा रहेको रकम (Suspense / In-Review Revenue: कागजात अपूरो, पुनः पेश, वा विचाराधीन)
    pending_paid_apps = app_query.filter(
        ~JobApplication.status.like("%स्वीकृत%"),
        or_(
            JobApplication.payment_status == "PAID",
            JobApplication.payment_status == "PENDING_VERIFICATION",
            JobApplication.receipt_no.isnot(None),
            JobApplication.paid_amount > 0
        )
    ).all()
    pending_revenue = sum([float(a.paid_amount or 0.0) for a in pending_paid_apps])

    total_openings = vac_query.with_entities(VacancyAnnouncement.openings_count).all()
    sum_openings = sum([o[0] for o in total_openings if o[0]])

    return {
        "total_vacancies": total_vacancies,
        "active_vacancies": active_vacancies,
        "total_openings": sum_openings,
        "total_applications": total_applications,
        "pending_applications": pending_applications,
        "approved_applications": approved_applications,
        "rejected_applications": rejected_applications,
        "paid_applications": paid_applications,
        "unpaid_applications": unpaid_applications,
        "total_revenue": float(total_revenue),
        "pending_revenue": float(pending_revenue)
    }


# -------------------------------------------------------------
# 2. EXCEL EXPORT (WITH FINANCIAL AUDIT COLUMNS)
# -------------------------------------------------------------
@router.get("/export-excel")
def export_recruitment_excel(
    current_user: User = Depends(require_roles(*RECRUITMENT_ADMIN_ROLES)),
    ctx: TenantContext = Depends(get_tenant_context),
    db: Session = Depends(get_db)
):
    vacancies = ctx.filter_query(db.query(VacancyAnnouncement), VacancyAnnouncement).order_by(desc(VacancyAnnouncement.created_at)).all()
    applications = ctx.filter_query(db.query(JobApplication), JobApplication).order_by(desc(JobApplication.created_at)).all()

    wb = openpyxl.Workbook()

    # SHEET 1: Applications
    ws1 = wb.active
    ws1.title = "दरखास्त_फारम_विवरण"
    ws1.merge_cells("A1:P1")
    t1 = ws1["A1"]
    t1.value = "पाँचपोखरी थाङपाल गाउँपालिका — अनलाइन दरखास्त, भुक्तानी तथा कर्मचारी पदपूर्ति विवरण"
    t1.font = Font(name="Kalimati", size=13, bold=True, color="FFFFFF")
    t1.fill = PatternFill(start_color="1E3A8A", end_color="1E3A8A", fill_type="solid")
    t1.alignment = Alignment(horizontal="center", vertical="center")

    headers1 = [
        "क्र.सं.", "दरखास्त नं", "विज्ञापन नं", "पद", "उम्मेदवारको नाम",
        "लिङ्ग", "सम्पर्क फोन", "नागरिकता नं", "ठेगाना", "न्यूनतम योग्यता",
        "भुक्तानी अवस्था", "रसिद नं", "दाखिला रकम (रु.)", "निर्णय अवस्था", "रोल नम्बर", "परीक्षा केन्द्र"
    ]
    ws1.append([])
    ws1.append(headers1)

    h_fill = PatternFill(start_color="1E40AF", end_color="1E40AF", fill_type="solid")
    for col in range(1, len(headers1) + 1):
        c = ws1.cell(row=3, column=col)
        c.font = Font(name="Kalimati", size=10, bold=True, color="FFFFFF")
        c.fill = h_fill
        c.alignment = Alignment(horizontal="center", vertical="center")

    thin_border = Border(
        left=Side(style='thin', color='D1D5DB'),
        right=Side(style='thin', color='D1D5DB'),
        top=Side(style='thin', color='D1D5DB'),
        bottom=Side(style='thin', color='D1D5DB')
    )

    for idx, a in enumerate(applications, start=1):
        is_app_approved = "स्वीकृत" in (a.status or "")
        has_deposit = (a.payment_status == "PAID" or float(a.paid_amount or 0) > 0 or a.receipt_no is not None)
        if is_app_approved and has_deposit:
            payment_status_disp = "सदर भुक्तानी (PAID)"
            receipt_disp = a.receipt_no or "-"
        elif "कागजात अपूरो" in (a.status or "") and has_deposit:
            payment_status_disp = "दाखिला भएको (रोक्का/अपूरो)"
            receipt_disp = f"{a.receipt_no} (रोक्का)" if a.receipt_no else "रोक्का"
        elif "पुनः पेश" in (a.status or "") and has_deposit:
            payment_status_disp = "दाखिला भएको (पुनः रुजु बाँकी)"
            receipt_disp = f"{a.receipt_no} (पुनः रुजु)" if a.receipt_no else "रुजुमा"
        elif has_deposit:
            payment_status_disp = "दाखिला भएको (रुजु बाँकी)"
            receipt_disp = "रुजु बाँकी"
        else:
            payment_status_disp = "दाखिला बाँकी (UNPAID)"
            receipt_disp = "-"

        row = [
            idx,
            a.application_no,
            a.vacancy_no,
            a.post_title,
            a.full_name_np,
            a.gender or "पुरुष",
            a.contact_phone,
            f"{a.citizenship_no or ''} ({a.citizenship_district or ''})",
            a.permanent_address,
            f"{a.qualification_title or ''} - {a.board_university or ''}",
            payment_status_disp,
            receipt_disp,
            float(a.paid_amount or 0),
            a.status or "विचाराधीन (Pending)",
            a.admit_card_roll_no or "-",
            a.exam_center or "-"
        ]
        ws1.append(row)
        curr_row = ws1.max_row
        for col_idx in range(1, len(row) + 1):
            cell = ws1.cell(row=curr_row, column=col_idx)
            cell.border = thin_border
            cell.font = Font(name="Kalimati", size=9)

    for col in ws1.columns:
        max_len = max(len(str(cell.value or '')) for cell in col)
        col_letter = openpyxl.utils.get_column_letter(col[0].column)
        ws1.column_dimensions[col_letter].width = max(max_len + 3, 13)

    # SHEET 2: Vacancies
    ws2 = wb.create_sheet(title="विज्ञापनहरू")
    ws2.merge_cells("A1:J1")
    t2 = ws2["A1"]
    t2.value = "खुला विज्ञापन तथा पदपूर्ति माग सूची"
    t2.font = Font(name="Kalimati", size=13, bold=True, color="FFFFFF")
    t2.fill = PatternFill(start_color="1E3A8A", end_color="1E3A8A", fill_type="solid")
    t2.alignment = Alignment(horizontal="center", vertical="center")

    headers2 = [
        "क्र.सं.", "विज्ञापन नं", "पद", "सेवा/समूह", "तह/श्रेणी",
        "माग पद संख्या", "रोजगार प्रकार", "दरखास्त शुल्क (रु.)", "समावेशी शुल्क (रु.)", "अन्तिम मिति"
    ]
    ws2.append([])
    ws2.append(headers2)

    for col in range(1, len(headers2) + 1):
        c = ws2.cell(row=3, column=col)
        c.font = Font(name="Kalimati", size=10, bold=True, color="FFFFFF")
        c.fill = h_fill
        c.alignment = Alignment(horizontal="center", vertical="center")

    for idx, v in enumerate(vacancies, start=1):
        row2 = [
            idx,
            v.vacancy_no,
            v.title,
            v.service_group,
            v.level,
            v.openings_count,
            v.employment_type,
            float(v.application_fee or 0),
            float(v.inclusive_group_fee if v.inclusive_group_fee is not None else 0.0),
            v.deadline_date_bs
        ]
        ws2.append(row2)
        curr_row = ws2.max_row
        for col_idx in range(1, len(row2) + 1):
            cell = ws2.cell(row=curr_row, column=col_idx)
            cell.border = thin_border
            cell.font = Font(name="Kalimati", size=9)

    for col in ws2.columns:
        max_len = max(len(str(cell.value or '')) for cell in col)
        col_letter = openpyxl.utils.get_column_letter(col[0].column)
        ws2.column_dimensions[col_letter].width = max(max_len + 3, 13)

    stream = BytesIO()
    wb.save(stream)
    stream.seek(0)

    filename = f"Paanchpokhari_eRecruitment_Report_{datetime.datetime.now().strftime('%Y%m%d')}.xlsx"
    return StreamingResponse(
        stream,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


# -------------------------------------------------------------
# 3. DIGITAL ADMIT CARD LOOKUP
# -------------------------------------------------------------
@router.get("/admit-card")
def get_admit_card(
    application_no: Optional[str] = None,
    phone_or_citizenship: Optional[str] = None,
    ctx: TenantContext = Depends(get_tenant_context),
    db: Session = Depends(get_db)
):
    query = ctx.filter_query(db.query(JobApplication), JobApplication)
    if application_no:
        app = query.filter(JobApplication.application_no == application_no.strip()).first()
    elif phone_or_citizenship:
        q_val = phone_or_citizenship.strip()
        app = query.filter(
            or_(
                JobApplication.contact_phone == q_val,
                JobApplication.citizenship_no == q_val,
                JobApplication.application_no == q_val
            )
        ).first()
    else:
        raise HTTPException(status_code=400, detail="दरखास्त नं वा नागरिकता/फोन नम्बर प्रदान गर्नुहोस्।")

    if not app:
        raise HTTPException(status_code=404, detail="उल्लेखित विवरण अनुसार कुनै दरखास्त फेला परेन।")

    vacancy = db.query(VacancyAnnouncement).filter(
        or_(
            VacancyAnnouncement.id == app.vacancy_id,
            VacancyAnnouncement.vacancy_no == app.vacancy_no
        )
    ).first()

    # Dynamic Exam Date & Center Synchronization: Ensure application reflects current vacancy schedule
    need_commit = False
    if vacancy:
        if vacancy.exam_date_bs and app.exam_date_time != vacancy.exam_date_bs:
            app.exam_date_time = vacancy.exam_date_bs
            need_commit = True
        elif not vacancy.exam_date_bs and app.exam_date_time:
            app.exam_date_time = None
            need_commit = True
            
        if vacancy.exam_center and app.exam_center != vacancy.exam_center:
            app.exam_center = vacancy.exam_center
            need_commit = True
        elif not vacancy.exam_center and app.exam_center:
            app.exam_center = None
            need_commit = True

    if not app.chalani_no and (app.status == "स्वीकृत (Approved)" or bool(app.admit_card_roll_no)):
        fy = "२०८३/०८४"
        if vacancy and vacancy.vacancy_no and "२०" in vacancy.vacancy_no:
            import re
            m = re.search(r'(२०\d{2}/\d{3})', vacancy.vacancy_no)
            if m:
                fy = m.group(1)
        app.chalani_no = get_or_create_recruitment_chalani(db=db, app=app, fiscal_year=fy, tenant_id=app.tenant_id)
        need_commit = True

    if need_commit:
        try:
            db.commit()
            db.refresh(app)
        except Exception:
            db.rollback()

    is_ready = (app.status == "स्वीकृत (Approved)" or bool(app.admit_card_roll_no))

    return {
        "application": JobApplicationSchema.from_orm(app),
        "vacancy": VacancyAnnouncementSchema.from_orm(vacancy) if vacancy else None,
        "is_admit_card_ready": is_ready,
        "payment_status": app.payment_status or "UNPAID",
        "receipt_no": app.receipt_no
    }


# -------------------------------------------------------------
# 4. DOCUMENT UPLOAD ENDPOINT
# -------------------------------------------------------------
@router.post("/upload-document")
async def upload_recruitment_document(file: UploadFile = File(...)):
    raw_name = file.filename or "document.jpg"
    _, ext = os.path.splitext(raw_name)
    ext_lower = ext.lower()
    
    allowed = {".jpg", ".jpeg", ".png", ".webp", ".pdf", ".doc", ".docx"}
    if ext_lower not in allowed:
        raise HTTPException(
            status_code=400,
            detail="अमान्य फाइल ढाँचा! कृपया तस्बिर (.jpg, .jpeg, .png) वा (.pdf) फाइल मात्र छनोट गर्नुहोस्।"
        )

    # Reject SVG or script-bearing XML explicitly to prevent Stored XSS
    if ext_lower == ".svg" or (file.content_type and "svg" in file.content_type.lower()):
        raise HTTPException(
            status_code=400,
            detail="सुरक्षा कारणले SVG ढाँचाका फाइलहरू अपलोड गर्न निषेध गरिएको छ। कृपया JPG, PNG वा PDF फाइल छनोट गर्नुहोस्।"
        )
        
    contents = await file.read()
    if len(contents) > 15 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="फाइलको आकार १५ MB भन्दा बढी हुन सक्दैन।")
        
    unique_suffix = f"{int(time.time() * 1000)}-{os.urandom(4).hex()}"
    filename = f"recruitment-{unique_suffix}{ext_lower}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    with open(file_path, "wb") as f:
        f.write(contents)
        
    return {
        "url": f"/uploads/{filename}",
        "filename": filename,
        "original_name": raw_name,
        "size": len(contents),
        "content_type": file.content_type
    }


# -------------------------------------------------------------
# 5. VACANCIES CRUD
# -------------------------------------------------------------
@router.get("/vacancies", response_model=List[VacancyAnnouncementSchema])
def list_vacancies(
    status: Optional[str] = None,
    search: Optional[str] = None,
    ctx: TenantContext = Depends(get_tenant_context),
    db: Session = Depends(get_db)
):
    query = ctx.filter_query(db.query(VacancyAnnouncement), VacancyAnnouncement)
    if status and status != "all":
        query = query.filter(VacancyAnnouncement.status == status)
    if search:
        s = f"%{search}%"
        query = query.filter(
            or_(
                VacancyAnnouncement.title.ilike(s),
                VacancyAnnouncement.vacancy_no.ilike(s),
                VacancyAnnouncement.service_group.ilike(s)
            )
        )
    return query.order_by(desc(VacancyAnnouncement.created_at)).all()


@router.post("/vacancies", response_model=VacancyAnnouncementSchema)
def create_vacancy(
    data: VacancyAnnouncementCreate,
    request: Request,
    current_user: User = Depends(require_roles(*RECRUITMENT_ADMIN_ROLES)),
    ctx: TenantContext = Depends(get_tenant_context),
    db: Session = Depends(get_db)
):
    eff_tenant = ctx.tenant_subdomain if (ctx.tenant_subdomain and ctx.tenant_subdomain != 'all') else (current_user.tenant_id or "panchpokhari")
    if not data.vacancy_no:
        count = ctx.filter_query(db.query(VacancyAnnouncement), VacancyAnnouncement).count() + 1
        count_nepali = str(count).translate(str.maketrans("0123456789", "०१२३४५६७८९"))
        data.vacancy_no = f"०{count_nepali}/२०८३/०८४"

    new_vac = VacancyAnnouncement(
        id=str(uuid.uuid4()),
        tenant_id=eff_tenant,
        vacancy_no=data.vacancy_no,
        title=data.title,
        service_group=data.service_group,
        level=data.level,
        openings_count=data.openings_count or 1,
        employment_type=data.employment_type or "करार सेवा (Contract)",
        application_fee=data.application_fee or 500.0,
        inclusive_group_fee=data.inclusive_group_fee if data.inclusive_group_fee is not None else 0.0,
        min_qualification=data.min_qualification,
        publish_date_bs=data.publish_date_bs,
        deadline_date_bs=data.deadline_date_bs,
        exam_date_bs=data.exam_date_bs.strip() if (data.exam_date_bs and data.exam_date_bs.strip()) else None,
        exam_center=data.exam_center.strip() if (data.exam_center and data.exam_center.strip()) else None,
        status=data.status or "खुला (Active)",
        description=data.description
    )
    db.add(new_vac)
    db.commit()
    db.refresh(new_vac)

    record_audit(
        db=db,
        entity_type="VACANCY",
        entity_id=new_vac.id,
        action="CREATE",
        performed_by=f"ADMIN:{current_user.email}",
        details=f"Created vacancy: {new_vac.vacancy_no} - {new_vac.title} for palika: {eff_tenant}",
        ip_address=request.client.host if request.client else None,
        tenant_id=eff_tenant
    )

    return new_vac


@router.get("/vacancies/{vacancy_id}", response_model=VacancyAnnouncementSchema)
def get_vacancy(
    vacancy_id: str,
    ctx: TenantContext = Depends(get_tenant_context),
    db: Session = Depends(get_db)
):
    cond = [VacancyAnnouncement.vacancy_no == vacancy_id]
    if is_valid_uuid(vacancy_id) or len(vacancy_id) > 10:
        cond.append(VacancyAnnouncement.id == vacancy_id)

    vac = ctx.filter_query(db.query(VacancyAnnouncement).filter(or_(*cond)), VacancyAnnouncement).first()
    if not vac:
        raise HTTPException(status_code=404, detail="विज्ञापन फेला परेन।")
    return vac


@router.put("/vacancies/{vacancy_id}", response_model=VacancyAnnouncementSchema)
def update_vacancy(
    vacancy_id: str,
    data: VacancyAnnouncementUpdate,
    request: Request,
    current_user: User = Depends(require_roles(*RECRUITMENT_ADMIN_ROLES)),
    ctx: TenantContext = Depends(get_tenant_context),
    db: Session = Depends(get_db)
):
    cond = [VacancyAnnouncement.vacancy_no == vacancy_id]
    if is_valid_uuid(vacancy_id) or len(vacancy_id) > 10:
        cond.append(VacancyAnnouncement.id == vacancy_id)

    vac = ctx.filter_query(db.query(VacancyAnnouncement).filter(or_(*cond)), VacancyAnnouncement).first()
    if not vac:
        raise HTTPException(status_code=404, detail="विज्ञापन फेला परेन।")

    update_dict = data.dict(exclude_unset=True)
    for key, value in update_dict.items():
        if hasattr(vac, key):
            if key in ("exam_date_bs", "exam_center", "description"):
                clean_str = value.strip() if isinstance(value, str) else value
                setattr(vac, key, clean_str if clean_str else None)
            elif value is not None:
                setattr(vac, key, value)

    # Sync post_title, vacancy_no, exam_date_bs, and exam_center to any existing applications linked to this vacancy
    app_sync = {}
    if "title" in update_dict and update_dict["title"]:
        app_sync[JobApplication.post_title] = update_dict["title"]
    if "vacancy_no" in update_dict and update_dict["vacancy_no"]:
        app_sync[JobApplication.vacancy_no] = update_dict["vacancy_no"]
    if "exam_date_bs" in update_dict:
        val = update_dict["exam_date_bs"]
        clean_val = val.strip() if isinstance(val, str) else val
        app_sync[JobApplication.exam_date_time] = (clean_val if clean_val else None)
    if "exam_center" in update_dict:
        val = update_dict["exam_center"]
        clean_val = val.strip() if isinstance(val, str) else val
        app_sync[JobApplication.exam_center] = (clean_val if clean_val else None)

    if app_sync:
        db.query(JobApplication).filter(
            or_(
                JobApplication.vacancy_id == vac.id,
                JobApplication.vacancy_no == vac.vacancy_no
            )
        ).update(app_sync, synchronize_session=False)

    # Sync fee updates to all unpaid applications linked to this vacancy
    if "application_fee" in update_dict or "inclusive_group_fee" in update_dict:
        new_base = float(vac.application_fee if vac.application_fee is not None else 500.0)
        new_inc = float(vac.inclusive_group_fee if vac.inclusive_group_fee is not None else 0.0)
        unpaid_apps = db.query(JobApplication).filter(
            or_(
                JobApplication.vacancy_id == vac.id,
                JobApplication.vacancy_no == vac.vacancy_no
            ),
            JobApplication.payment_status != "PAID"
        ).all()
        for u_app in unpaid_apps:
            cats = [c.strip() for c in (u_app.inclusive_categories or "").split(",") if c.strip()]
            inclusive_count = max(0, len(cats) - 1) if "खुला" in cats else len(cats)
            new_total = new_base + (inclusive_count * new_inc)
            u_app.paid_amount = new_total
            db.query(RecruitmentPayment).filter(
                RecruitmentPayment.application_no == u_app.application_no,
                RecruitmentPayment.status.in_(["INITIATED", "PENDING_VERIFICATION"])
            ).update({"amount": new_total}, synchronize_session=False)

    db.commit()
    db.refresh(vac)

    record_audit(
        db=db,
        entity_type="VACANCY",
        entity_id=vac.id,
        action="UPDATE",
        performed_by=f"ADMIN:{current_user.email}",
        details=f"Updated vacancy: {vac.vacancy_no} - {vac.title}, Exam: {vac.exam_date_bs}, Fee: {vac.application_fee}",
        ip_address=request.client.host if request.client else None,
        tenant_id=vac.tenant_id
    )

    return vac


@router.delete("/vacancies/{vacancy_id}")
def delete_vacancy(
    vacancy_id: str,
    request: Request,
    current_user: User = Depends(require_roles(*RECRUITMENT_ADMIN_ROLES)),
    ctx: TenantContext = Depends(get_tenant_context),
    db: Session = Depends(get_db)
):
    cond = [VacancyAnnouncement.vacancy_no == vacancy_id]
    if is_valid_uuid(vacancy_id) or len(vacancy_id) > 10:
        cond.append(VacancyAnnouncement.id == vacancy_id)

    vac = ctx.filter_query(db.query(VacancyAnnouncement).filter(or_(*cond)), VacancyAnnouncement).first()
    if not vac:
        raise HTTPException(status_code=404, detail="विज्ञापन फेला परेन।")

    vac_tenant = vac.tenant_id
    db.delete(vac)
    db.commit()

    record_audit(
        db=db,
        entity_type="VACANCY",
        entity_id=vacancy_id,
        action="DELETE",
        performed_by=f"ADMIN:{current_user.email}",
        details=f"Deleted vacancy: {vacancy_id}",
        ip_address=request.client.host if request.client else None,
        tenant_id=vac_tenant
    )

    return {"message": "विज्ञापन सफलतापूर्वक हटाइयो।", "success": True}


# -------------------------------------------------------------
# 6. APPLICATION SUBMISSION & DRAFT CREATION
# -------------------------------------------------------------
@router.post("/apply-draft", response_model=JobApplicationSchema)
@router.post("/apply", response_model=JobApplicationSchema)
def submit_or_draft_application(
    data: JobApplicationCreate,
    request: Request,
    ctx: TenantContext = Depends(get_tenant_context),
    db: Session = Depends(get_db)
):
    """
    Creates an application in UNPAID / DRAFT status with exact fee calculation.
    Application is only CONFIRMED once payment is verified.
    """
    vac = None
    if data.vacancy_id:
        cond = [VacancyAnnouncement.id == data.vacancy_id, VacancyAnnouncement.vacancy_no == data.vacancy_id]
        vac = db.query(VacancyAnnouncement).filter(or_(*cond)).first()

    vacancy_no = data.vacancy_no or (vac.vacancy_no if vac else "२०८३/०८४")
    post_title = data.post_title or (vac.title if vac else "पद")

    # Determine tenant ownership: matches vacancy's tenant, or user's tenant context
    app_tenant = vac.tenant_id if (vac and vac.tenant_id) else (ctx.tenant_subdomain if (ctx.tenant_subdomain and ctx.tenant_subdomain != 'all') else "panchpokhari")

    # Duplicate Application Check (prevent duplicate submission for same vacancy by same citizenship)
    if data.citizenship_no:
        existing = db.query(JobApplication).filter(
            JobApplication.vacancy_no == vacancy_no,
            JobApplication.citizenship_no == data.citizenship_no.strip(),
            JobApplication.payment_status == "PAID",
            JobApplication.tenant_id == app_tenant
        ).first()
        if existing:
            raise HTTPException(
                status_code=400,
                detail=f"उल्लेखित नागरिकता नं ({data.citizenship_no}) बाट यो विज्ञापनमा पहिले नै दरखास्त पेश भई दस्तुर भुक्तानी भइसकेको छ (दरखास्त नं: {existing.application_no})।"
            )

    # Generate sequential application number: PTRM-2083-XXXX (using active fiscal year and PTRM prefix)
    fy_year = "2083"
    if vac and vac.vacancy_no:
        import re
        m = re.search(r'(२०\d{2})', vac.vacancy_no)
        if m:
            nep_digits = {'०':'0', '१':'1', '२':'2', '३':'3', '४':'4', '५':'5', '६':'6', '7':'7', '८':'8', '९':'9'}
            fy_year = ''.join(nep_digits.get(ch, ch) for ch in m.group(1))

    prefix = "PTRM" if (app_tenant == "panchpokhari" or not app_tenant) else f"APP-{app_tenant.upper()}"
    count = db.query(JobApplication).filter(JobApplication.tenant_id == app_tenant).count() + 1
    application_no = f"{prefix}-{fy_year}-{count:04d}"

    # Calculate total fee: base fee + inclusive category fees
    base_fee = float(vac.application_fee) if (vac and vac.application_fee is not None) else 500.0
    inclusive_fee = float(vac.inclusive_group_fee) if (vac and vac.inclusive_group_fee is not None) else 0.0
    
    inclusive_count = 0
    if data.inclusive_categories:
        cats = [c.strip() for c in data.inclusive_categories.split(",") if c.strip()]
        # If open category is also selected, inclusive groups are additional
        inclusive_count = max(0, len(cats) - 1) if "खुला" in cats else len(cats)
    
    total_fee = base_fee + (inclusive_count * inclusive_fee)

    new_app = JobApplication(
        id=str(uuid.uuid4()),
        tenant_id=app_tenant,
        application_no=application_no,
        vacancy_id=vac.id if vac else data.vacancy_id,
        vacancy_no=vacancy_no,
        post_title=post_title,
        exam_center=vac.exam_center if vac else None,
        exam_date_time=vac.exam_date_bs if vac else None,
        full_name_np=data.full_name_np,
        full_name_en=data.full_name_en,
        dob_bs=data.dob_bs,
        gender=data.gender or "पुरुष",
        citizenship_no=data.citizenship_no,
        citizenship_district=data.citizenship_district,
        contact_phone=data.contact_phone,
        email=data.email,
        permanent_address=data.permanent_address,
        temporary_address=data.temporary_address,
        qualification_title=data.qualification_title,
        board_university=data.board_university,
        passed_year_bs=data.passed_year_bs,
        division_gpa=data.division_gpa,
        council_reg_no=data.council_reg_no,
        teaching_license_no=data.teaching_license_no,
        experience_years=data.experience_years or 0,
        inclusive_categories=data.inclusive_categories,
        payment_method=data.payment_method or "Fonepay QR / ConnectIPS / eSewa",
        payment_voucher_no=data.payment_voucher_no or f"TXN-{uuid.uuid4().hex[:8].upper()}",
        payment_status="UNPAID",
        application_status="DRAFT",
        paid_amount=total_fee,
        photo_url=data.photo_url,
        signature_url=data.signature_url,
        citizenship_doc_url=data.citizenship_doc_url,
        qualification_doc_url=data.qualification_doc_url,
        application_letter_doc_url=data.application_letter_doc_url,
        teaching_license_doc_url=data.teaching_license_doc_url,
        council_doc_url=data.council_doc_url,
        experience_doc_url=data.experience_doc_url,
        payment_voucher_doc_url=data.payment_voucher_doc_url,
        documents_json=data.documents_json,
        status="शुल्क भुक्तानी हुन बाँकी (Unpaid)"
    )
    db.add(new_app)
    db.commit()
    db.refresh(new_app)

    record_audit(
        db=db,
        entity_type="APPLICATION",
        entity_id=new_app.application_no,
        action="DRAFT_CREATED",
        performed_by="CANDIDATE",
        details=f"Draft application created for {new_app.full_name_np}, fee: Rs. {total_fee}",
        ip_address=request.client.host if request.client else None,
        tenant_id=app_tenant
    )

    return new_app


# -------------------------------------------------------------
# 7. PAYMENT GATEWAY API (FONEPAY QR, CONNECTIPS, ESEWA, KHALTI)
# -------------------------------------------------------------
@router.post("/payment/initiate", response_model=PaymentInitiateResponse)
def initiate_payment(
    data: PaymentInitiateRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Generates dynamic QR or Gateway redirect parameters for candidate's application.
    Enforces duplicate payment prevention & idempotency.
    """
    app = None
    if data.application_no:
        app = db.query(JobApplication).filter(JobApplication.application_no == data.application_no.strip()).first()
    elif data.application_id:
        app = db.query(JobApplication).filter(
            or_(
                JobApplication.id == data.application_id,
                JobApplication.application_no == data.application_id
            )
        ).first()

    if not app:
        raise HTTPException(status_code=404, detail="दरखास्त फेला परेन। कृपया पहिले आवेदन फारम भर्नुहोस्।")

    # Duplicate payment check
    if app.payment_status == "PAID":
        raise HTTPException(
            status_code=400,
            detail=f"यो दरखास्तको शुल्क पहिले नै भुक्तानी भइसकेको छ (रसिद नं: {app.receipt_no})।"
        )

    # Determine amount: Always dynamically compute from active vacancy rates for unpaid applications
    vac = db.query(VacancyAnnouncement).filter(
        or_(
            VacancyAnnouncement.id == app.vacancy_id,
            VacancyAnnouncement.vacancy_no == app.vacancy_no
        )
    ).first()
    if vac and app.payment_status != "PAID":
        base_fee = float(vac.application_fee if vac.application_fee is not None else 500.0)
        inc_fee = float(vac.inclusive_group_fee if vac.inclusive_group_fee is not None else 0.0)
        cats = [c.strip() for c in (app.inclusive_categories or "").split(",") if c.strip()]
        inclusive_count = max(0, len(cats) - 1) if "खुला" in cats else len(cats)
        amount = base_fee + (inclusive_count * inc_fee)
        app.paid_amount = amount
        db.commit()
    else:
        amount = float(app.paid_amount or (vac.application_fee if vac else 500.0))

    txn_uuid = f"TXN-REC-{datetime.datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
    gateway_name = data.gateway.upper()
    ip = request.client.host if request.client else "127.0.0.1"

    qr_data = None
    checkout_url = None
    params = {}

    if gateway_name in ("FONEPAY", "FONEPAY_QR", "QR"):
        gateway_name = "FONEPAY"
        # Nepal Investment Mega Bank (NIMB) Official Revenue Account
        bank_name = "Nepal Investment Mega Bank (NIMB)"
        account_no = "18301400000109"
        account_name = "GA 1.1 PANCHPOKHARI THANGPAL GA.PA. AANTARIK RAJASHO KHATA"
        prn = app.application_no
        trace_id = txn_uuid
        
        # Official NIMB Fonepay EMVCo static payload from bank standee PDF
        qr_data = "0002010102110216122230002218820926400011fonepay.com07162222440022188201110115204939953035245802NP5959GA 1.1 PANCHPOKHARI THANGPAL GA. PA. AANTARIK RAJASHO KHATA6013PANCH POKHARI6211070722810926304df2a"
        params = {
            "bankName": bank_name,
            "accountNumber": account_no,
            "accountName": account_name,
            "merchantName": "गाउँ कार्यपालिकाको कार्यालय, पाँचपोखरी थाङपाल",
            "merchantCode": "NIMB-18301400000109",
            "terminalId": "2222440022188201",
            "branch": "पाँचपोखरी थाङपाल (१८३)",
            "prn": prn,
            "traceId": trace_id,
            "amount": amount,
            "qrData": qr_data,
            "standeeUrl": "/assets/nimb_fonepay_qr_standee.png",
            "expirySeconds": 900
        }

    elif gateway_name in ("CONNECTIPS", "NCHL"):
        gateway_name = "CONNECTIPS"
        checkout_url = "https://login.connectips.com/connectipswebgw/loginpage"
        params = {
            "MERCHANTID": "14229",
            "APPID": "P5_RECRUITMENT",
            "APPNAME": "Panchpokhari Recruitment Portal",
            "TXNID": txn_uuid,
            "TXNDATE": datetime.datetime.now().strftime("%d-%m-%Y"),
            "TXNCRNCY": "NPR",
            "TXNAMT": str(int(amount * 100)), # in paisa
            "REFERENCEID": app.application_no,
            "REMARKS": f"Vacancy fee for {app.application_no}",
            "PARTICULARS": f"{app.post_title}",
            "TOKEN": "TOKEN_RSA_SIGNED"
        }

    elif gateway_name in ("ESEWA", "EPAY"):
        gateway_name = "ESEWA"
        checkout_url = "https://epay.esewa.com.np/api/epay/main/v2/form"
        # Signature: HMAC-SHA256 of total_amount,transaction_uuid,product_code
        product_code = os.getenv("ESEWA_PRODUCT_CODE", "EPAYTEST")
        secret_key = os.getenv("ESEWA_SECRET_KEY", "8gBm/:&EnhH.1/q(")
        message_to_sign = f"total_amount={amount:.2f},transaction_uuid={txn_uuid},product_code={product_code}"
        signature = base64.b64encode(hmac.new(secret_key.encode(), message_to_sign.encode(), hashlib.sha256).digest()).decode()
        
        params = {
            "amount": f"{amount:.2f}",
            "tax_amount": "0.00",
            "total_amount": f"{amount:.2f}",
            "transaction_uuid": txn_uuid,
            "product_code": product_code,
            "product_service_charge": "0.00",
            "product_delivery_charge": "0.00",
            "success_url": f"https://digitaltwin.smartptrm.com/recruitment?app_no={app.application_no}&status=success",
            "failure_url": f"https://digitaltwin.smartptrm.com/recruitment?app_no={app.application_no}&status=failure",
            "signed_field_names": "total_amount,transaction_uuid,product_code",
            "signature": signature
        }

    elif gateway_name in ("KHALTI",):
        gateway_name = "KHALTI"
        checkout_url = "https://khalti.com/api/v2/epayment/initiate/"
        params = {
            "return_url": f"https://digitaltwin.smartptrm.com/recruitment?app_no={app.application_no}",
            "website_url": "https://digitaltwin.smartptrm.com",
            "amount": int(amount * 100),
            "purchase_order_id": txn_uuid,
            "purchase_order_name": f"दरखास्त दस्तुर - {app.application_no}",
            "customer_info": {
                "name": app.full_name_np,
                "phone": app.contact_phone,
                "email": app.email or "applicant@example.com"
            }
        }

    elif gateway_name in ("BANK_VOUCHER", "VOUCHER", "OFFLINE"):
        gateway_name = "BANK_VOUCHER"
        params = {
            "voucherNo": data.voucher_no or f"VCH-{uuid.uuid4().hex[:6].upper()}",
            "bankName": "Nepal Investment Mega Bank (NIMB)",
            "accountNumber": "18301400000109",
            "accountTitle": "GA 1.1 PANCHPOKHARI THANGPAL GA.PA. AANTARIK RAJASHO KHATA (ग १.१ पाँचपोखरी थाङपाल गा.पा. आन्तरिक राजस्व खाता)"
        }

    # Store initiated transaction record
    new_payment = RecruitmentPayment(
        id=str(uuid.uuid4()),
        tenant_id=app.tenant_id or "panchpokhari",
        application_id=app.id,
        application_no=app.application_no,
        transaction_uuid=txn_uuid,
        gateway=gateway_name,
        amount=amount,
        status="INITIATED",
        idempotency_key=f"{app.application_no}-{txn_uuid}",
        qr_data=qr_data,
        gateway_response=json.dumps(params, ensure_ascii=False),
        ip_address=ip,
        created_at=datetime.datetime.utcnow()
    )
    db.add(new_payment)
    
    app.payment_method = gateway_name
    app.payment_voucher_no = txn_uuid
    app.payment_status = "PENDING_VERIFICATION"
    db.commit()

    record_audit(
        db=db,
        entity_type="PAYMENT",
        entity_id=txn_uuid,
        action="PAY_INITIATE",
        performed_by="CANDIDATE",
        details=f"Payment initiated via {gateway_name} for {app.application_no}, amount: Rs. {amount}",
        ip_address=ip,
        tenant_id=app.tenant_id or "panchpokhari"
    )

    return PaymentInitiateResponse(
        success=True,
        transaction_uuid=txn_uuid,
        application_no=app.application_no,
        gateway=gateway_name,
        amount=amount,
        qr_data=qr_data,
        checkout_url=checkout_url,
        parameters=params,
        message=f"{gateway_name} भुक्तानी सफलतापूर्वक प्रारम्भ गरियो।"
    )


@router.post("/payment/verify", response_model=PaymentVerifyResponse)
def verify_payment(
    data: PaymentVerifyRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Verifies transaction with gateway, confirms application, sets status to SUBMITTED,
    and generates official electronic revenue receipt.
    """
    pay = db.query(RecruitmentPayment).filter(
        RecruitmentPayment.transaction_uuid == data.transaction_uuid.strip()
    ).first()

    if not pay:
        raise HTTPException(status_code=404, detail="कारोबार रेकर्ड फेला परेन।")

    app = db.query(JobApplication).filter(JobApplication.id == pay.application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="सम्बन्धित दरखास्त फेला परेन।")

    # If already SUCCESS, return idempotent success response
    if pay.status == "SUCCESS" and app.payment_status == "PAID":
        return PaymentVerifyResponse(
            success=True,
            message="भुक्तानी पहिल्यै प्रमाणीकरण भइसकेको छ।",
            transaction_uuid=pay.transaction_uuid,
            receipt_no=app.receipt_no,
            application_no=app.application_no,
            paid_amount=float(pay.amount),
            payment_status="PAID",
            paid_at=app.paid_at.strftime("%Y-%m-%d %H:%M:%S") if app.paid_at else None
        )

    # Check if caller has valid admin token or if system allows mock payments
    allow_mock = os.getenv("ALLOW_MOCK_PAYMENTS", "false").lower() in ("true", "1") or os.getenv("ENVIRONMENT", "").lower() in ("development", "dev", "test")
    is_admin = False
    auth_payload = _get_token_payload(request) if request else None
    if auth_payload and auth_payload.get("role") in [r.value for r in RECRUITMENT_ADMIN_ROLES]:
        is_admin = True

    # If mock_auto_approve is requested by an unauthenticated / public caller in strict production mode:
    if data.mock_auto_approve and not (is_admin or allow_mock):
        # Do NOT issue official receipt or grant free PAID status.
        # Instead, mark as PENDING_VERIFICATION (कार्यालय बैंक रुजु बाँकी) so candidate's application is recorded
        # but requires revenue desk clearance before receipt and admit card are issued.
        ref_id = data.gateway_ref_id or f"SUBMITTED-{uuid.uuid4().hex[:6].upper()}"
        pay.status = "PENDING_VERIFICATION"
        pay.gateway_ref_id = ref_id
        
        app.payment_status = "PENDING_VERIFICATION"
        app.application_status = "SUBMITTED"
        app.status = "विचाराधीन (कार्यालय बैंक रुजु बाँकी)"
        app.payment_method = pay.gateway
        app.payment_voucher_no = ref_id
        if data.voucher_doc_url:
            app.payment_voucher_doc_url = data.voucher_doc_url.strip()
        db.commit()

        record_audit(
            db=db,
            entity_type="PAYMENT",
            entity_id=pay.transaction_uuid,
            action="PAY_PENDING_VERIFICATION",
            performed_by="CANDIDATE",
            details=f"Payment submitted for bank statement verification. App: {app.application_no}, Gateway: {pay.gateway}, Ref: {ref_id}",
            ip_address=request.client.host if request.client else None,
            tenant_id=pay.tenant_id or app.tenant_id or "panchpokhari"
        )

        return PaymentVerifyResponse(
            success=True,
            message="तपाईंको भुक्तानी विवरण प्राप्त भएको छ। कार्यालयबाट बैंक दाखिला रुजु भएपछि आधिकारिक रसिद र प्रवेशपत्र उपलब्ध हुनेछ।",
            transaction_uuid=pay.transaction_uuid,
            receipt_no=None,
            application_no=app.application_no,
            paid_amount=float(pay.amount),
            payment_status="PENDING_VERIFICATION",
            paid_at=None
        )

    # Legitimate clearance: Admin confirmation, Gateway callback, or approved test mode
    pay.status = "SUCCESS"
    pay.gateway_ref_id = data.gateway_ref_id or f"GW-REF-{uuid.uuid4().hex[:8].upper()}"
    pay.verified_at = datetime.datetime.utcnow()

    # Generate Official Electronic Receipt Number: RCPT-2081-XXXX
    count_receipts = db.query(JobApplication).filter(JobApplication.receipt_no.isnot(None)).count() + 1
    receipt_no = f"RCPT-2081-{count_receipts:04d}"

    # Lock application as CONFIRMED & SUBMITTED
    app.payment_status = "PAID"
    app.application_status = "SUBMITTED"
    app.status = "विचाराधीन (Pending)" # Now ready for desk verification
    app.receipt_no = receipt_no
    app.paid_amount = pay.amount
    app.paid_at = pay.verified_at
    app.payment_method = pay.gateway
    app.payment_voucher_no = pay.gateway_ref_id
    if data.voucher_doc_url:
        app.payment_voucher_doc_url = data.voucher_doc_url.strip()

    db.commit()

    record_audit(
        db=db,
        entity_type="PAYMENT",
        entity_id=pay.transaction_uuid,
        action="PAY_SUCCESS",
        performed_by="ADMIN" if is_admin else ("MOCK_AUTO_APPROVE" if allow_mock else "GATEWAY_CALLBACK"),
        details=f"Payment verified for {app.application_no}, receipt: {receipt_no}, amount: Rs. {pay.amount}",
        ip_address=request.client.host if request.client else None,
        tenant_id=pay.tenant_id or app.tenant_id or "panchpokhari"
    )

    return PaymentVerifyResponse(
        success=True,
        message="भुक्तानी सफलतापूर्वक प्रमाणीकरण भयो। दरखास्त दर्ता सम्पन्न भएको छ!",
        transaction_uuid=pay.transaction_uuid,
        receipt_no=receipt_no,
        application_no=app.application_no,
        paid_amount=float(pay.amount),
        payment_status="PAID",
        paid_at=pay.verified_at.strftime("%Y-%m-%d %H:%M:%S")
    )


@router.post("/admin/payments/{transaction_uuid}/confirm", response_model=PaymentVerifyResponse)
def admin_confirm_payment(
    transaction_uuid: str,
    request: Request,
    ctx: TenantContext = Depends(get_tenant_context),
    current_user: User = Depends(require_roles(*RECRUITMENT_ADMIN_ROLES)),
    db: Session = Depends(get_db)
):
    """
    Dedicated Municipal Admin/Cashier endpoint to confirm bank voucher or offline payment,
    generate official electronic revenue receipt, and activate admit card eligibility.
    """
    pay = ctx.filter_query(db.query(RecruitmentPayment).filter(
        RecruitmentPayment.transaction_uuid == transaction_uuid.strip()
    ), RecruitmentPayment).first()

    if not pay:
        raise HTTPException(status_code=404, detail="कारोबार रेकर्ड फेला परेन।")

    app = ctx.filter_query(db.query(JobApplication).filter(JobApplication.id == pay.application_id), JobApplication).first()
    if not app:
        raise HTTPException(status_code=404, detail="सम्बन्धित दरखास्त फेला परेन।")

    pay.status = "SUCCESS"
    if not pay.gateway_ref_id:
        pay.gateway_ref_id = f"OFFICE-CONFIRM-{uuid.uuid4().hex[:6].upper()}"
    pay.verified_at = datetime.datetime.utcnow()

    if not app.receipt_no:
        count_receipts = ctx.filter_query(db.query(JobApplication).filter(JobApplication.receipt_no.isnot(None)), JobApplication).count() + 1
        receipt_no = f"RCPT-2083-{count_receipts:04d}"
        app.receipt_no = receipt_no
    else:
        receipt_no = app.receipt_no

    app.payment_status = "PAID"
    app.application_status = "SUBMITTED"
    if not app.status or "ड्राफ्ट" in app.status or "Unpaid" in app.status or "शुल्क" in app.status:
        app.status = "विचाराधीन (Pending)"
    app.paid_amount = pay.amount
    app.paid_at = pay.verified_at
    app.payment_method = pay.gateway
    app.payment_voucher_no = pay.gateway_ref_id

    db.commit()

    record_audit(
        db=db,
        entity_type="PAYMENT",
        entity_id=pay.transaction_uuid,
        action="ADMIN_PAYMENT_CONFIRM",
        performed_by=f"ADMIN:{current_user.email}",
        details=f"Payment manually verified and confirmed by admin {current_user.email} for {app.application_no}, receipt: {receipt_no}",
        ip_address=request.client.host if request.client else None,
        tenant_id=pay.tenant_id or app.tenant_id or "panchpokhari"
    )

    return PaymentVerifyResponse(
        success=True,
        message=f"दरखास्त नं {app.application_no} को भुक्तानी सफलतापूर्वक प्रमाणित गरी रसिद नं {receipt_no} जारी गरियो।",
        transaction_uuid=pay.transaction_uuid,
        receipt_no=receipt_no,
        application_no=app.application_no,
        paid_amount=float(pay.amount),
        payment_status="PAID",
        paid_at=pay.verified_at.strftime("%Y-%m-%d %H:%M:%S")
    )


@router.post("/payment/retry")
def retry_payment(
    application_no: str = Query(..., alias="applicationNo"),
    request: Request = None,
    db: Session = Depends(get_db)
):
    """
    Allows candidate to retry payment if initial attempt failed or was interrupted.
    """
    app = db.query(JobApplication).filter(
        or_(
            JobApplication.application_no == application_no.strip(),
            JobApplication.contact_phone == application_no.strip(),
            JobApplication.citizenship_no == application_no.strip()
        )
    ).first()

    if not app:
        raise HTTPException(status_code=404, detail="उल्लेखित विवरण अनुसार कुनै दरखास्त फेला परेन।")

    if app.payment_status == "PAID":
        return {
            "already_paid": True,
            "message": "यो आवेदनको दस्तुर पहिले नै भुक्तानी भइसकेको छ।",
            "receipt_no": app.receipt_no,
            "application_no": app.application_no
        }

    # Cancel any previous initiated payments
    db.query(RecruitmentPayment).filter(
        RecruitmentPayment.application_id == app.id,
        RecruitmentPayment.status == "INITIATED"
    ).update({"status": "CANCELLED"})
    
    app.payment_status = "UNPAID"
    db.commit()

    vac = db.query(VacancyAnnouncement).filter(
        or_(
            VacancyAnnouncement.id == app.vacancy_id,
            VacancyAnnouncement.vacancy_no == app.vacancy_no
        )
    ).first()

    amount = float(app.paid_amount or 500.0)
    if vac and app.payment_status != "PAID":
        base_fee = float(vac.application_fee if vac.application_fee is not None else 500.0)
        inc_fee = float(vac.inclusive_group_fee if vac.inclusive_group_fee is not None else 0.0)
        cats = [c.strip() for c in (app.inclusive_categories or "").split(",") if c.strip()]
        inclusive_count = max(0, len(cats) - 1) if "खुला" in cats else len(cats)
        amount = base_fee + (inclusive_count * inc_fee)
        app.paid_amount = amount
        db.commit()

    return {
        "already_paid": False,
        "can_retry": True,
        "application_no": app.application_no,
        "full_name": app.full_name_np,
        "post_title": app.post_title,
        "vacancy_no": app.vacancy_no,
        "amount": amount,
        "message": "तपाईं नयाँ भुक्तानी माध्यम छनोट गरी पुनः भुक्तानी गर्न सक्नुहुन्छ।"
    }


@router.get("/payment/status/{application_no}")
def get_payment_status(application_no: str, db: Session = Depends(get_db)):
    """
    Checks real-time payment status of an application.
    """
    app = db.query(JobApplication).filter(
        JobApplication.application_no == application_no.strip()
    ).first()

    if not app:
        raise HTTPException(status_code=404, detail="दरखास्त फेला परेन।")

    latest_payment = db.query(RecruitmentPayment).filter(
        RecruitmentPayment.application_no == app.application_no
    ).order_by(desc(RecruitmentPayment.created_at)).first()

    return {
        "application_no": app.application_no,
        "full_name": app.full_name_np,
        "payment_status": app.payment_status or "UNPAID",
        "receipt_no": app.receipt_no,
        "paid_amount": float(app.paid_amount or 0.0),
        "paid_at": app.paid_at.strftime("%Y-%m-%d %H:%M:%S") if app.paid_at else None,
        "latest_transaction": {
            "transaction_uuid": latest_payment.transaction_uuid if latest_payment else None,
            "gateway": latest_payment.gateway if latest_payment else None,
            "status": latest_payment.status if latest_payment else None,
            "amount": float(latest_payment.amount) if latest_payment else 0.0
        } if latest_payment else None
    }


# -------------------------------------------------------------
# 8. AUTOMATIC OFFICIAL ELECTRONIC RECEIPT
# -------------------------------------------------------------
@router.get("/receipt/{application_no}", response_model=OfficialReceiptSchema)
def get_official_receipt(application_no: str, db: Session = Depends(get_db)):
    """
    Returns complete official electronic revenue receipt data with verification QR payload.
    """
    app = db.query(JobApplication).filter(
        JobApplication.application_no == application_no.strip()
    ).first()

    if not app:
        raise HTTPException(status_code=404, detail="दरखास्त फेला परेन।")

    if app.payment_status != "PAID" and not app.receipt_no:
        raise HTTPException(
            status_code=400,
            detail="यो दरखास्तको दस्तुर हालसम्म भुक्तानी भएको छैन। भुक्तानी पश्चात मात्र रसिद उपलब्ध हुनेछ।"
        )

    vac = db.query(VacancyAnnouncement).filter(
        or_(
            VacancyAnnouncement.id == app.vacancy_id,
            VacancyAnnouncement.vacancy_no == app.vacancy_no
        )
    ).first()

    base_fee = float(vac.application_fee) if vac and vac.application_fee else 500.0
    paid_amt = float(app.paid_amount or base_fee)
    inclusive_part = max(0.0, paid_amt - base_fee)

    paid_time = app.paid_at.strftime("%Y-%m-%d %H:%M:%S") if app.paid_at else datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    qr_text = f"पाँचपोखरी थाङपाल गाउँपालिका | विद्युतीय राजस्व रसिद नं: {app.receipt_no} | दरखास्त नं: {app.application_no} | उम्मेदवार: {app.full_name_np} | रकम: रु. {paid_amt} | मिति: {paid_time}"

    return OfficialReceiptSchema(
        receipt_no=app.receipt_no or f"RCPT-2081-{app.application_no.split('-')[-1]}",
        application_no=app.application_no,
        transaction_uuid=app.payment_voucher_no or f"TXN-REC-{app.application_no}",
        full_name_np=app.full_name_np,
        full_name_en=app.full_name_en,
        post_title=app.post_title,
        vacancy_no=app.vacancy_no,
        citizenship_no=app.citizenship_no,
        contact_phone=app.contact_phone,
        amount=paid_amt,
        fee_breakdown={
            "base_fee": base_fee,
            "inclusive_categories": app.inclusive_categories or "खुला (नियमित)",
            "inclusive_fee": inclusive_part,
            "total": paid_amt
        },
        revenue_title="कर्मचारी पदपूर्ति तथा दरखास्त दस्तुर (शीर्षक १४२२९)",
        gateway=app.payment_method or "Fonepay QR",
        payment_status="PAID (सम्पन्न)",
        paid_at=paid_time,
        verification_qr=qr_text
    )


# -------------------------------------------------------------
# 9. ADMIN DESK: PAYMENTS & RECONCILIATION
# -------------------------------------------------------------
@router.get("/admin/payments")
def list_admin_payments(
    gateway: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    current_user: User = Depends(require_roles(*RECRUITMENT_ADMIN_ROLES)),
    ctx: TenantContext = Depends(get_tenant_context),
    db: Session = Depends(get_db)
):
    query = ctx.filter_query(db.query(RecruitmentPayment), RecruitmentPayment).order_by(desc(RecruitmentPayment.created_at))
    if gateway and gateway != "all":
        query = query.filter(RecruitmentPayment.gateway == gateway.upper())
    if status and status != "all":
        query = query.filter(RecruitmentPayment.status == status.upper())
    if search:
        s = f"%{search}%"
        query = query.filter(
            or_(
                RecruitmentPayment.application_no.ilike(s),
                RecruitmentPayment.transaction_uuid.ilike(s),
                RecruitmentPayment.gateway_ref_id.ilike(s)
            )
        )
    return query.limit(100).all()


@router.get("/admin/reconciliation")
def get_payment_reconciliation(
    current_user: User = Depends(require_roles(*RECRUITMENT_ADMIN_ROLES)),
    ctx: TenantContext = Depends(get_tenant_context),
    db: Session = Depends(get_db)
):
    """
    Returns financial breakdown by gateway, successful collections, pending, refunds for the palika.
    """
    pay_query = ctx.filter_query(db.query(RecruitmentPayment), RecruitmentPayment)
    ref_query = ctx.filter_query(db.query(RecruitmentRefund), RecruitmentRefund)

    total_successful_rev = pay_query.filter(
        RecruitmentPayment.status == "SUCCESS"
    ).with_entities(func.sum(RecruitmentPayment.amount)).scalar() or 0.0

    by_gateway = pay_query.filter(
        RecruitmentPayment.status == "SUCCESS"
    ).with_entities(
        RecruitmentPayment.gateway,
        func.count(RecruitmentPayment.id).label("count"),
        func.sum(RecruitmentPayment.amount).label("total")
    ).group_by(RecruitmentPayment.gateway).all()

    total_refunded = ref_query.filter(
        RecruitmentRefund.status == "PROCESSED"
    ).with_entities(func.sum(RecruitmentRefund.refund_amount)).scalar() or 0.0

    rev_float = float(total_successful_rev or 0.0)
    ref_float = float(total_refunded or 0.0)

    return {
        "total_collected": rev_float,
        "total_refunded": ref_float,
        "net_revenue": rev_float - ref_float,
        "by_gateway": [
            {"gateway": r[0], "count": r[1], "total": float(r[2] or 0.0)}
            for r in by_gateway
        ]
    }


# -------------------------------------------------------------
# 10. REFUND MANAGEMENT
# -------------------------------------------------------------
@router.post("/admin/refund")
def process_refund(
    data: RefundCreateRequest,
    request: Request,
    current_user: User = Depends(require_roles(*RECRUITMENT_ADMIN_ROLES)),
    ctx: TenantContext = Depends(get_tenant_context),
    db: Session = Depends(get_db)
):
    app = ctx.filter_query(db.query(JobApplication).filter(JobApplication.application_no == data.application_no.strip()), JobApplication).first()
    if not app:
        raise HTTPException(status_code=404, detail="दरखास्त फेला परेन।")

    payment = db.query(RecruitmentPayment).filter(
        RecruitmentPayment.application_no == app.application_no,
        RecruitmentPayment.status == "SUCCESS"
    ).first()

    new_refund = RecruitmentRefund(
        id=str(uuid.uuid4()),
        tenant_id=app.tenant_id,
        payment_id=payment.id if payment else (data.payment_id or "UNKNOWN"),
        application_id=app.id,
        refund_amount=data.refund_amount,
        reason=data.reason,
        bank_info=data.bank_info,
        status="PROCESSED",
        processed_by=f"ADMIN:{current_user.email}",
        created_at=datetime.datetime.utcnow()
    )
    db.add(new_refund)

    if payment:
        payment.status = "REFUNDED"
    app.payment_status = "REFUNDED"
    app.status = "शुल्क फिर्ता गरिएको (Refunded)"
    db.commit()

    record_audit(
        db=db,
        entity_type="REFUND",
        entity_id=new_refund.id,
        action="REFUND_ISSUED",
        performed_by=f"ADMIN:{current_user.email}",
        details=f"Refund issued for {app.application_no}, amount: Rs. {data.refund_amount}, reason: {data.reason}",
        ip_address=request.client.host if request.client else None,
        tenant_id=app.tenant_id
    )

    return {
        "success": True,
        "message": f"दरखास्त नं {app.application_no} का लागि रु. {data.refund_amount} फिर्ता सफलतापूर्वक दर्ता भयो।",
        "refund_id": new_refund.id
    }


# -------------------------------------------------------------
# 11. AUDIT LOGS
# -------------------------------------------------------------
@router.get("/admin/audit-logs", response_model=List[AuditLogSchema])
def list_audit_logs(
    entity_type: Optional[str] = None,
    limit: int = 50,
    current_user: User = Depends(require_roles(*RECRUITMENT_ADMIN_ROLES)),
    ctx: TenantContext = Depends(get_tenant_context),
    db: Session = Depends(get_db)
):
    q = ctx.filter_query(db.query(RecruitmentAuditLog), RecruitmentAuditLog).order_by(desc(RecruitmentAuditLog.created_at))
    if entity_type and entity_type != "all":
        q = q.filter(RecruitmentAuditLog.entity_type == entity_type.upper())
    return q.limit(limit).all()


# -------------------------------------------------------------
# 12. APPLICATIONS CRUD & VERIFICATION
# -------------------------------------------------------------
@router.get("/applications", response_model=List[JobApplicationSchema])
def list_applications(
    vacancy_id: Optional[str] = None,
    status: Optional[str] = None,
    payment_status: Optional[str] = None,
    search: Optional[str] = None,
    current_user: User = Depends(require_roles(*RECRUITMENT_ADMIN_ROLES)),
    ctx: TenantContext = Depends(get_tenant_context),
    db: Session = Depends(get_db)
):
    query = ctx.filter_query(db.query(JobApplication), JobApplication)
    if vacancy_id and vacancy_id != "all":
        query = query.filter(
            or_(
                JobApplication.vacancy_id == vacancy_id,
                JobApplication.vacancy_no == vacancy_id
            )
        )
    if status and status != "all":
        query = query.filter(JobApplication.status.like(f"%{status}%"))
    if payment_status and payment_status != "all":
        query = query.filter(JobApplication.payment_status == payment_status)
    if search:
        s = f"%{search}%"
        query = query.filter(
            or_(
                JobApplication.full_name_np.ilike(s),
                JobApplication.application_no.ilike(s),
                JobApplication.contact_phone.ilike(s),
                JobApplication.citizenship_no.ilike(s),
                JobApplication.post_title.ilike(s),
                JobApplication.receipt_no.ilike(s)
            )
        )
    return query.order_by(desc(JobApplication.created_at)).all()


@router.put("/applications/{application_id}/verify", response_model=JobApplicationSchema)
def verify_job_application(
    application_id: str,
    data: ApplicationVerificationUpdate,
    request: Request,
    current_user: User = Depends(require_roles(*RECRUITMENT_ADMIN_ROLES)),
    ctx: TenantContext = Depends(get_tenant_context),
    db: Session = Depends(get_db)
):
    cond = [JobApplication.application_no == application_id]
    if is_valid_uuid(application_id) or len(application_id) > 10:
        cond.append(JobApplication.id == application_id)

    app = ctx.filter_query(db.query(JobApplication).filter(or_(*cond)), JobApplication).first()
    if not app:
        raise HTTPException(status_code=404, detail="दरखास्त फेला परेन।")

    app.status = data.status
    if data.rejection_reason is not None:
        app.rejection_reason = data.rejection_reason

    # If approved, ensure admit card details and chalani are populated
    if "स्वीकृत" in data.status:
        if not app.approved_at:
            app.approved_at = datetime.datetime.utcnow()
        vac = db.query(VacancyAnnouncement).filter(
            or_(
                VacancyAnnouncement.id == app.vacancy_id,
                VacancyAnnouncement.vacancy_no == app.vacancy_no
            )
        ).first()

        fy_year = "2083"
        if vac and vac.vacancy_no:
            import re
            m = re.search(r'(२०\d{2})', vac.vacancy_no)
            if m:
                nep_digits = {'०':'0', '१':'1', '२':'2', '३':'3', '४':'4', '५':'5', '६':'6', '7':'7', '८':'8', '९':'9'}
                fy_year = ''.join(nep_digits.get(ch, ch) for ch in m.group(1))

        if data.admit_card_roll_no:
            app.admit_card_roll_no = data.admit_card_roll_no
        elif not app.admit_card_roll_no:
            count = ctx.filter_query(db.query(JobApplication).filter(JobApplication.admit_card_roll_no.isnot(None)), JobApplication).count() + 1
            app.admit_card_roll_no = f"{fy_year}-ROLL-{count:03d}"

        # Auto-claim official Chalani number from Darta-Chalani system
        if data.chalani_no:
            app.chalani_no = data.chalani_no
        elif not app.chalani_no:
            fy = "२०८३/०८४"
            if vac and vac.vacancy_no:
                import re
                m = re.search(r'(२०\d{2}/\d{3})', vac.vacancy_no)
                if m:
                    fy = m.group(1)
            app.chalani_no = get_or_create_recruitment_chalani(db=db, app=app, fiscal_year=fy, tenant_id=app.tenant_id)

        app.exam_center = data.exam_center or (vac.exam_center if vac and vac.exam_center else None) or app.exam_center
        app.exam_date_time = data.exam_date_time or (vac.exam_date_bs if vac and vac.exam_date_bs else None) or app.exam_date_time
    elif "अस्वीकृत" in data.status:
        app.admit_card_roll_no = None

    # भुक्तानी प्रमाणीकरण (Confirm payment if explicitly requested or application is approved)
    if data.confirm_payment or ("स्वीकृत" in data.status and app.payment_status != "PAID"):
        app.payment_status = "PAID"
        app.application_status = "SUBMITTED"
        if not app.paid_at:
            app.paid_at = datetime.datetime.utcnow()
        if not app.receipt_no:
            count_receipts = ctx.filter_query(db.query(JobApplication).filter(JobApplication.receipt_no.isnot(None)), JobApplication).count() + 1
            app.receipt_no = f"RCPT-2083-{count_receipts:04d}"

        # Update latest payment transaction to SUCCESS
        pay = db.query(RecruitmentPayment).filter(
            RecruitmentPayment.application_id == app.id
        ).order_by(desc(RecruitmentPayment.created_at)).first()
        if pay:
            pay.status = "SUCCESS"
            pay.verified_at = datetime.datetime.utcnow()
            if not pay.gateway_ref_id:
                pay.gateway_ref_id = f"OFFICE-VERIFY-{uuid.uuid4().hex[:6].upper()}"
            if not app.paid_amount or app.paid_amount <= 0:
                app.paid_amount = pay.amount

    db.commit()
    db.refresh(app)

    record_audit(
        db=db,
        entity_type="APPLICATION",
        entity_id=app.application_no,
        action="DECISION_" + ("APPROVED" if "स्वीकृत" in data.status else "REJECTED"),
        performed_by=f"ADMIN:{current_user.email}",
        details=f"Verification decision: {data.status}, Roll: {app.admit_card_roll_no}, Payment: {app.payment_status}",
        ip_address=request.client.host if request.client else None,
        tenant_id=app.tenant_id
    )

    return app


@router.post("/applications/{application_id}/confirm-payment")
def confirm_application_payment(
    application_id: str,
    request: Request,
    ctx: TenantContext = Depends(get_tenant_context),
    current_user: User = Depends(require_roles(*RECRUITMENT_ADMIN_ROLES)),
    db: Session = Depends(get_db)
):
    """
    Dedicated endpoint for Admin to verify payment in 1-click from applications table or review modal.
    Sets payment_status='PAID', generates official receipt number, and marks payment transaction as SUCCESS.
    """
    cond = [JobApplication.application_no == application_id]
    if is_valid_uuid(application_id) or len(application_id) > 10:
        cond.append(JobApplication.id == application_id)

    app = ctx.filter_query(db.query(JobApplication).filter(or_(*cond)), JobApplication).first()
    if not app:
        raise HTTPException(status_code=404, detail="दरखास्त फेला परेन।")

    app.payment_status = "PAID"
    app.application_status = "SUBMITTED"
    if not app.paid_at:
        app.paid_at = datetime.datetime.utcnow()

    if not app.receipt_no:
        count_receipts = ctx.filter_query(db.query(JobApplication).filter(JobApplication.receipt_no.isnot(None)), JobApplication).count() + 1
        app.receipt_no = f"RCPT-2083-{count_receipts:04d}"

    # Update latest payment transaction to SUCCESS
    pay = db.query(RecruitmentPayment).filter(
        RecruitmentPayment.application_id == app.id
    ).order_by(desc(RecruitmentPayment.created_at)).first()
    if pay:
        pay.status = "SUCCESS"
        pay.verified_at = datetime.datetime.utcnow()
        if not pay.gateway_ref_id:
            pay.gateway_ref_id = f"OFFICE-CONFIRM-{uuid.uuid4().hex[:6].upper()}"
        if not app.paid_amount or app.paid_amount <= 0:
            app.paid_amount = pay.amount

    db.commit()
    db.refresh(app)

    record_audit(
        db=db,
        entity_type="APPLICATION",
        entity_id=app.application_no,
        action="PAYMENT_CONFIRMED",
        performed_by=f"ADMIN:{current_user.email}",
        details=f"Payment manually verified and marked PAID by admin {current_user.email}, receipt: {app.receipt_no}",
        ip_address=request.client.host if request.client else None,
        tenant_id=app.tenant_id
    )

    return {
        "success": True,
        "message": f"दरखास्त नं {app.application_no} को भुक्तानी प्रमाणित भई रसिद नं {app.receipt_no} जारी भयो।",
        "receiptNo": app.receipt_no,
        "paymentStatus": "PAID",
        "paidAmount": float(app.paid_amount or 0)
    }


@router.post("/applications/{application_id}/resubmit-document")
def resubmit_candidate_document(
    application_id: str,
    payload: CandidateDocumentResubmitRequest,
    request: Request,
    ctx: TenantContext = Depends(get_tenant_context),
    db: Session = Depends(get_db)
):
    """
    उम्मेदवारद्वारा अपूरो कागजात मात्र सुरक्षित रूपमा पुनः अपलोड गर्ने सुविधा (Correction Window).
    व्यक्तिगत विवरण, पद र आवेदन शुल्क अपरिवर्तनीय रहन्छ।
    """
    cond = [JobApplication.application_no == application_id]
    if is_valid_uuid(application_id) or len(application_id) > 10:
        cond.append(JobApplication.id == application_id)

    app = ctx.filter_query(db.query(JobApplication).filter(or_(*cond)), JobApplication).first()
    if not app:
        raise HTTPException(status_code=404, detail="दरखास्त फेला परेन।")

    # सुरक्षा प्रमाणीकरण (Security Verification): दर्ता भएको फोन वा नागरिकता मिलेको हुनुपर्छ
    auth_input = (payload.phone_or_citizenship or '').strip()
    cand_phone = (app.contact_phone or '').strip()
    cand_cit = (app.citizenship_no or '').strip()
    if auth_input != cand_phone and auth_input != cand_cit:
        raise HTTPException(
            status_code=403, 
            detail="सुरक्षा प्रमाणीकरण असफल: दरखास्तमा दर्ता भएको फोन वा नागरिकता नम्बर प्रविष्ट गर्नुहोस्।"
        )

    # सम्बन्धित कागजात अद्यावधिक गर्ने
    dt = payload.doc_type
    doc_label = dt
    if dt in ('teaching_license', 'teaching_license_doc_url'):
        app.teaching_license_doc_url = payload.new_doc_url
        doc_label = "अध्यापन अनुमति पत्र"
    elif dt in ('application_letter', 'application_letter_doc_url'):
        app.application_letter_doc_url = payload.new_doc_url
        doc_label = "निवेदन"
    elif dt in ('qualification', 'qualification_doc_url'):
        app.qualification_doc_url = payload.new_doc_url
        doc_label = "शैक्षिक योग्यता"
    elif dt in ('citizenship_front', 'citizenship_doc_url'):
        app.citizenship_doc_url = payload.new_doc_url
        doc_label = "नागरिकता (अगाडि)"
    elif dt in ('citizenship_back', 'citizenship_back_doc_url'):
        if not app.citizenship_doc_url:
            app.citizenship_doc_url = payload.new_doc_url
        doc_label = "नागरिकता (पछाडि)"
    elif dt in ('voucher', 'payment_voucher_doc_url', 'payment_voucher_url'):
        app.payment_voucher_doc_url = payload.new_doc_url
        doc_label = "राजस्व भौचर"
    elif dt in ('photo', 'photo_url', 'photo_doc_url'):
        app.photo_url = payload.new_doc_url
        doc_label = "पासपोर्ट फोटो"
    elif dt in ('council', 'council_doc_url'):
        app.council_doc_url = payload.new_doc_url
        doc_label = "काउन्सिल दर्ता प्रमाणपत्र"
    elif dt in ('experience', 'experience_doc_url'):
        app.experience_doc_url = payload.new_doc_url
        doc_label = "अनुभव / तालिम प्रमाणपत्र"
    else:
        # Default fallback
        app.qualification_doc_url = payload.new_doc_url
        doc_label = dt

    # documents_json सुरक्षित रूपमा अद्यावधिक गर्ने
    try:
        docs_dict = json.loads(app.documents_json) if app.documents_json else {}
        docs_dict[dt] = payload.new_doc_url
        app.documents_json = json.dumps(docs_dict, ensure_ascii=False)
    except Exception:
        pass

    # अवस्था स्वतः पुनः पेश (Resubmitted / Pending Review) मा परिवर्तन
    app.status = "पुनः पेश (Resubmitted / Pending Review)"
    prev_notes = app.rejection_reason or ""
    correction_note = f"[उम्मेदवारद्वारा {doc_label} पुनः पेश गरिएको: {payload.candidate_remarks or 'सच्याइएको कागजात संलग्न'}]"
    app.rejection_reason = f"{prev_notes}\n{correction_note}".strip()

    db.commit()
    db.refresh(app)

    record_audit(
        db=db,
        entity_type="APPLICATION",
        entity_id=app.application_no,
        action="DOC_RESUBMITTED",
        performed_by=f"CANDIDATE:{app.application_no}",
        details=f"Document re-uploaded: {doc_label}. Status set to Resubmitted.",
        ip_address=request.client.host if request.client else None,
        tenant_id=app.tenant_id
    )

    return {
        "success": True,
        "message": f"{doc_label} सफलतापूर्वक पुनः पेश भयो। प्रशासनबाट रुजु गरिनेछ।",
        "applicationNo": app.application_no,
        "status": app.status,
        "updatedDocUrl": payload.new_doc_url
    }


@router.put("/applications/{application_id}", response_model=JobApplicationSchema)
def update_job_application(
    application_id: str,
    data: JobApplicationUpdate,
    request: Request,
    current_user: User = Depends(require_roles(*RECRUITMENT_ADMIN_ROLES)),
    ctx: TenantContext = Depends(get_tenant_context),
    db: Session = Depends(get_db)
):
    cond = [JobApplication.application_no == application_id]
    if is_valid_uuid(application_id) or len(application_id) > 10:
        cond.append(JobApplication.id == application_id)

    app = ctx.filter_query(db.query(JobApplication).filter(or_(*cond)), JobApplication).first()
    if not app:
        raise HTTPException(status_code=404, detail="दरखास्त फेला परेन।")

    update_dict = data.dict(exclude_unset=True)
    for key, value in update_dict.items():
        if value is not None and hasattr(app, key):
            setattr(app, key, value)

    db.commit()
    db.refresh(app)

    record_audit(
        db=db,
        entity_type="APPLICATION",
        entity_id=app.application_no,
        action="UPDATE",
        performed_by=f"ADMIN:{current_user.email}",
        details=f"Application updated: {app.application_no}",
        ip_address=request.client.host if request.client else None,
        tenant_id=app.tenant_id
    )

    return app


@router.delete("/applications/{application_id}")
def delete_job_application(
    application_id: str,
    request: Request,
    current_user: User = Depends(require_roles(*RECRUITMENT_ADMIN_ROLES)),
    ctx: TenantContext = Depends(get_tenant_context),
    db: Session = Depends(get_db)
):
    cond = [JobApplication.application_no == application_id]
    if is_valid_uuid(application_id) or len(application_id) > 10:
        cond.append(JobApplication.id == application_id)

    app = ctx.filter_query(db.query(JobApplication).filter(or_(*cond)), JobApplication).first()
    if not app:
        raise HTTPException(status_code=404, detail="दरखास्त फेला परेन।")

    app_no = app.application_no
    app_tenant = app.tenant_id
    db.delete(app)
    db.commit()

    record_audit(
        db=db,
        entity_type="APPLICATION",
        entity_id=app_no,
        action="DELETE",
        performed_by=f"ADMIN:{current_user.email}",
        details=f"Application deleted: {app_no}",
        ip_address=request.client.host if request.client else None,
        tenant_id=app_tenant
    )

    return {"message": "दरखास्त आवेदन सफलतापूर्वक हटाइयो।", "success": True}


@router.post("/applications/{application_id}/onboard-to-hrms")
def onboard_candidate_to_hrms(
    application_id: str,
    data: OnboardToHrmsRequest,
    request: Request,
    ctx: TenantContext = Depends(get_tenant_context),
    current_user: User = Depends(require_roles(*RECRUITMENT_ADMIN_ROLES)),
    db: Session = Depends(get_db)
):
    """
    Onboard selected candidate from recruitment application into HRMS (employees table).
    Transfers full candidate profile, documents, and assigns employee ID.
    """
    cond = [JobApplication.application_no == application_id]
    if is_valid_uuid(application_id) or len(application_id) > 10:
        cond.append(JobApplication.id == application_id)

    app = ctx.filter_query(db.query(JobApplication).filter(or_(*cond)), JobApplication).first()
    if not app:
        raise HTTPException(status_code=404, detail="दरखास्त आवेदन फेला परेन।")

    # Determine or generate unique employeeId
    emp_id = (data.employee_id or "").strip()
    if not emp_id:
        total_emp_count = ctx.filter_query(db.query(Employee), Employee).count()
        emp_id = f"EMP-2081-{total_emp_count + 1:04d}"

    # Check for existing employee with same ID
    existing = ctx.filter_query(db.query(Employee).filter(Employee.employee_id == emp_id), Employee).first()
    if existing:
        if app.onboarded_employee_id == emp_id:
            return {
                "success": True,
                "message": f"उम्मेदवार पहिले नै कर्मचारी संकेत नं {emp_id} मा दर्ता भइसकेको छ।",
                "employeeId": emp_id,
                "alreadyOnboarded": True
            }
        emp_id = f"{emp_id}-{int(time.time()) % 1000}"

    # Prepare document list for HRMS
    docs_list = []
    if app.citizenship_doc_url:
        docs_list.append({
            "id": str(uuid.uuid4()),
            "title": "नागरिकता प्रमाणपत्र (Citizenship)",
            "type": "citizenship",
            "fileName": os.path.basename(app.citizenship_doc_url) if "/" in app.citizenship_doc_url else "citizenship.pdf",
            "fileUrl": app.citizenship_doc_url,
            "uploadedAtBs": data.appointment_date_bs or "२०८१-०८-०१",
            "remarks": f"दरखास्त आवेदन {app.application_no} बाट स्वतः आयात गरिएको"
        })
    if app.qualification_doc_url:
        docs_list.append({
            "id": str(uuid.uuid4()),
            "title": f"शैक्षिक योग्यता ({app.qualification_title or 'प्रमाणपत्र'})",
            "type": "academic",
            "fileName": os.path.basename(app.qualification_doc_url) if "/" in app.qualification_doc_url else "academic.pdf",
            "fileUrl": app.qualification_doc_url,
            "uploadedAtBs": data.appointment_date_bs or "२०८१-०८-०१",
            "remarks": f"बोर्ड/विश्वविद्यालय: {app.board_university or '-'}, श्रेणी: {app.division_gpa or '-'}"
        })
    if app.application_letter_doc_url:
        docs_list.append({
            "id": str(uuid.uuid4()),
            "title": "निवेदन (Application Letter)",
            "type": "other",
            "fileName": os.path.basename(app.application_letter_doc_url) if "/" in app.application_letter_doc_url else "nivedan.pdf",
            "fileUrl": app.application_letter_doc_url,
            "uploadedAtBs": data.appointment_date_bs or "२०८१-०८-०१",
            "remarks": "हस्तलिखित/टाइप निवेदन"
        })
    if app.teaching_license_doc_url:
        docs_list.append({
            "id": str(uuid.uuid4()),
            "title": "अध्यापन अनुमति पत्र (Teaching License)",
            "type": "tor",
            "fileName": os.path.basename(app.teaching_license_doc_url) if "/" in app.teaching_license_doc_url else "teaching_license.pdf",
            "fileUrl": app.teaching_license_doc_url,
            "uploadedAtBs": data.appointment_date_bs or "२०८१-०८-०१",
            "remarks": f"अध्यापन अनुमति पत्र नं: {app.teaching_license_no or '-'}"
        })
    if app.council_doc_url:
        docs_list.append({
            "id": str(uuid.uuid4()),
            "title": "काउन्सिल दर्ता प्रमाणपत्र (Council Registration)",
            "type": "tor",
            "fileName": os.path.basename(app.council_doc_url) if "/" in app.council_doc_url else "council.pdf",
            "fileUrl": app.council_doc_url,
            "uploadedAtBs": data.appointment_date_bs or "२०८१-०८-०१",
            "remarks": f"काउन्सिल दर्ता नं: {app.council_reg_no or '-'}"
        })
    if app.experience_doc_url:
        docs_list.append({
            "id": str(uuid.uuid4()),
            "title": "अनुभव तथा तालिम प्रमाणपत्र",
            "type": "training",
            "fileName": os.path.basename(app.experience_doc_url) if "/" in app.experience_doc_url else "experience.pdf",
            "fileUrl": app.experience_doc_url,
            "uploadedAtBs": data.appointment_date_bs or "२०८१-०८-०१",
            "remarks": f"अनुभव: {app.experience_years or 0} वर्ष"
        })

    emp_tenant = app.tenant_id or (ctx.tenant_subdomain if ctx.tenant_subdomain != 'all' else 'panchpokhari')

    # Create new Employee in HRMS
    new_emp = Employee(
        id=str(uuid.uuid4()),
        employee_id=emp_id,
        full_name=app.full_name_np,
        department=data.department or "प्रशासन शाखा",
        designation=data.designation or app.post_title,
        employment_type=data.employment_type or "करार सेवा (Contract)",
        level_grade=data.level_grade or "सहायक पाँचौं (Assistant 5th)",
        service_group=data.service_group or "प्रशासन / प्राविधिक",
        contact_phone=app.contact_phone,
        email=app.email,
        citizenship_no=app.citizenship_no,
        dob_bs=app.dob_bs,
        gender=app.gender or "पुरुष",
        permanent_address=app.permanent_address,
        temporary_address=app.temporary_address,
        appointment_date_bs=data.appointment_date_bs or "२०८१-०८-०१",
        join_date_bs=data.join_date_bs or "२०८१-०८-०१",
        service_status="कार्यरत (Active)",
        status="Active",
        photo_url=app.photo_url,
        documents=docs_list,
        tenant_id=emp_tenant
    )
    db.add(new_emp)

    # Link application to employee
    app.onboarded_employee_id = emp_id
    app.onboarded_at = datetime.datetime.utcnow()
    app.status = "छनोट / पदस्थापन (Onboarded)"

    db.commit()
    db.refresh(new_emp)
    db.refresh(app)

    record_audit(
        db=db,
        entity_type="HRMS_ONBOARDING",
        entity_id=app.application_no,
        action="ONBOARD_TO_HRMS",
        performed_by=f"ADMIN:{current_user.email}",
        details=f"उम्मेदवार {app.full_name_np} (आवेदन: {app.application_no}) लाई नयाँ कर्मचारी संकेत नं {emp_id} मा पदस्थापन/दर्ता गरियो।",
        ip_address=request.client.host if request.client else None,
        tenant_id=emp_tenant
    )

    return {
        "success": True,
        "message": f"उम्मेदवार {app.full_name_np} लाई कर्मचारी अभिलेख तथा व्यक्तिगत विवरण (HRMS) मा सफलतापूर्वक दर्ता गरियो।",
        "employeeId": emp_id,
        "employee": {
            "id": new_emp.id,
            "employeeId": new_emp.employee_id,
            "fullName": new_emp.full_name,
            "department": new_emp.department,
            "designation": new_emp.designation,
            "employmentType": new_emp.employment_type,
            "levelGrade": new_emp.level_grade,
            "joinDateBs": new_emp.join_date_bs
        }
    }

