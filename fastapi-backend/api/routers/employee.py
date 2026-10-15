from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from core.database import get_db
from models.employee import Employee
from schemas.employee import EmployeeSchema, EmployeeCreate, EmployeeUpdate
import uuid, os, shutil
from pydantic import BaseModel

class EmployeeRoleUpdate(BaseModel):
    role: str

router = APIRouter(
    prefix="/api/v1/employees",
    tags=["Employees"]
)

UPLOAD_DIR = "/app/uploads/employees"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("", response_model=List[EmployeeSchema])
def get_employees(
    department: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Employee)
    if department:
        query = query.filter(Employee.department == department)
    if status:
        query = query.filter(Employee.status == status)
    return query.order_by(Employee.employee_id.asc()).all()

@router.get("/{id}", response_model=EmployeeSchema)
def get_employee(id: str, db: Session = Depends(get_db)):
    emp = db.query(Employee).filter(Employee.id == id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    return emp

@router.post("", response_model=EmployeeSchema)
def create_employee(employee: EmployeeCreate, db: Session = Depends(get_db)):
    emp_data = employee.model_dump(exclude_unset=True)
    if not emp_data.get("employee_id"):
        count = db.query(Employee).count()
        emp_data["employee_id"] = f"EMP-{count + 1:04d}"

    db_emp = Employee(
        id=str(uuid.uuid4()),
        **emp_data
    )
    db.add(db_emp)
    db.commit()
    db.refresh(db_emp)
    return db_emp

@router.put("/{id}", response_model=EmployeeSchema)
def update_employee(id: str, employee: EmployeeUpdate, db: Session = Depends(get_db)):
    emp = db.query(Employee).filter(Employee.id == id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    update_data = employee.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(emp, key, value)

    db.commit()
    db.refresh(emp)
    return emp

@router.delete("/{id}")
def delete_employee(id: str, db: Session = Depends(get_db)):
    emp = db.query(Employee).filter(Employee.id == id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    db.delete(emp)
    db.commit()
    return {"success": True, "message": "Employee deleted successfully"}

@router.post("/{id}/upload-photo")
def upload_employee_photo(
    id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    emp = db.query(Employee).filter(Employee.id == id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    allowed = {"image/jpeg", "image/png", "image/webp", "image/gif"}
    if file.content_type not in allowed:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, WebP or GIF images allowed")

    ext = file.filename.split(".")[-1]
    filename = f"{id}.{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)

    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    photo_url = f"/uploads/employees/{filename}"
    emp.photo_url = photo_url
    db.commit()
    db.refresh(emp)
    return {"photoUrl": photo_url}

@router.put("/{id}/role")
def assign_employee_role(
    id: str,
    role_update: EmployeeRoleUpdate,
    db: Session = Depends(get_db)
):
    emp = db.query(Employee).filter(Employee.id == id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    if not emp.user_id:
        raise HTTPException(status_code=400, detail="प्रयोगकर्ता खाता लिङ्क भएको छैन। कृपया पहिले प्रयोगकर्ता व्यवस्थापनबाट खाता बनाउनुहोस्।")

    from models.user import User
    user = db.query(User).filter(User.id == emp.user_id).first()
    if not user:
        raise HTTPException(status_code=400, detail="Linked user account not found")

    user.role = role_update.role
    db.commit()

    return {"success": True, "message": "भूमिका सफलतापूर्वक प्रदान गरियो"}

@router.post("/sync-from-old-portal")
def sync_from_old_portal(db: Session = Depends(get_db)):
    """Scrapes official staff from old.panchpokharithangpalmun.gov.np/staff and syncs to database."""
    import ssl, urllib.request, re
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    ctx.set_ciphers('DEFAULT@SECLEVEL=1')

    def fetch_url(url):
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, context=ctx, timeout=30) as resp:
            return resp.read().decode('utf-8', errors='ignore')

    def download_photo(url, emp_id):
        if not url: return None
        try:
            if url.startswith('/'): url = "https://old.panchpokharithangpalmun.gov.np" + url
            elif not url.startswith('http'): url = "https://old.panchpokharithangpalmun.gov.np/" + url
            clean_url = url.replace(' ', '%20')
            req = urllib.request.Request(clean_url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, context=ctx, timeout=15) as resp:
                data = resp.read()
                if len(data) > 500:
                    ext = "png" if ".png" in url.lower() else "jpg"
                    filename = f"{emp_id}.{ext}"
                    filepath = os.path.join(UPLOAD_DIR, filename)
                    with open(filepath, "wb") as f:
                        f.write(data)
                    return f"/uploads/employees/{filename}"
        except Exception:
            pass
        return url

    def strip_tags(html):
        return re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', html)).strip()

    all_staff = []
    page = 0
    while True:
        url = f"https://old.panchpokharithangpalmun.gov.np/staff?page={page}" if page > 0 else "https://old.panchpokharithangpalmun.gov.np/staff"
        html = fetch_url(url)
        m = re.search(r'<div class="view view-elected-officials[^"]*">(.*?)(?:<!--\s*/\.view\s*-->|<div class="view view-|<div class="item-list">)', html, re.DOTALL)
        content = m.group(1) if m else html
        rows = re.findall(r'<tr class="(?:odd|even)[^"]*">(.*?)</tr>', content, re.DOTALL)
        
        page_staff = []
        for r in rows:
            if 'views-field-title' not in r: continue
            nm = re.search(r'<td class="views-field views-field-title"[^>]*>(.*?)</td>', r, re.DOTALL)
            name = strip_tags(nm.group(1)) if nm else ""
            if not name: continue
                
            img_full_m = re.search(r'<a href="([^"]+\.(?:jpg|jpeg|png|webp))"', r, re.IGNORECASE)
            img_thumb_m = re.search(r'<img[^>]+src="([^">]+)"', r)
            photo_url = img_full_m.group(1) if img_full_m else (img_thumb_m.group(1) if img_thumb_m else None)
            
            dm = re.search(r'<td class="views-field views-field-field-designation"[^>]*>(.*?)</td>', r, re.DOTALL)
            sm = re.search(r'<td class="views-field views-field-field-section"[^>]*>(.*?)</td>', r, re.DOTALL)
            em = re.search(r'<td class="views-field views-field-field-email"[^>]*>(.*?)</td>', r, re.DOTALL)
            pm = re.search(r'<td class="views-field views-field-field-phone"[^>]*>(.*?)</td>', r, re.DOTALL)
            
            page_staff.append({
                "name": name,
                "designation": strip_tags(dm.group(1)) if dm else "",
                "department": strip_tags(sm.group(1)) if sm else "प्रशासन तथा योजना",
                "email": strip_tags(em.group(1)) if (em and "@" in em.group(1)) else None,
                "phone": strip_tags(pm.group(1)) if pm else "",
                "photo_url": photo_url
            })
            
        all_staff.extend(page_staff)
        pager_m = re.search(r'<ul class="pager">(.*?)</ul>', content, re.DOTALL)
        if not (pager_m and 'pager-next' in pager_m.group(1)) or len(page_staff) == 0:
            break
        page += 1

    # Remove dummy placeholders
    dummy_names = {"कृष्ण प्रसाद सापकोटा", "दिनेश तामाङ", "इ. रमेश खड्का", "प्रकाश पौडेल", "विष्णुहरि घिमिरे"}
    db.query(Employee).filter(Employee.full_name.in_(dummy_names)).delete(synchronize_session=False)

    existing = {e.full_name.strip(): e for e in db.query(Employee).all()}
    count_new = 0
    count_updated = 0

    for idx, s in enumerate(all_staff):
        emp_name = s['name'].strip()
        clean_phone = s['phone'].split('/')[0].split(',')[0].strip() if s['phone'] else ''
        is_cao = 'प्रमुख प्रशाासकिय' in s['designation'] or 'प्रमुख प्रशासकीय' in s['designation']
        is_head = is_cao or 'प्रमुख' in s['designation'] or 'संयोजक' in s['designation'] or 'अधिकृत आठौं' in s['designation']
        is_info_officer = 'सूचना अधिकारी' in s['designation'] or 'सुचना अधिकारी' in s['designation']

        dept = s['department'].strip()
        if not dept or dept == 'प्रशासन':
            dept = "कार्यपालिका तथा प्रमुख प्रशासकीय अधिकृत" if is_cao else "सामान्य प्रशासन तथा योजना शाखा"
        elif 'वडा' in dept:
            dept = dept.replace('वडासचिब', '(वडा सचिव)').replace('वडा सचिब', '(वडा सचिव)')

        if emp_name in existing:
            emp = existing[emp_name]
            emp.designation = s['designation'] or emp.designation
            emp.department = dept
            if s['email']: emp.email = s['email']
            if clean_phone: emp.contact_phone = clean_phone
            if is_head: emp.is_department_head = True
            if is_info_officer: emp.is_information_officer = True
            if s['photo_url'] and (not emp.photo_url or 'http' in emp.photo_url):
                p = download_photo(s['photo_url'], emp.id)
                if p: emp.photo_url = p
            count_updated += 1
        else:
            new_id = str(uuid.uuid4())
            p = download_photo(s['photo_url'], new_id) if s['photo_url'] else None
            emp = Employee(
                id=new_id,
                employee_id=f"EMP-{len(existing) + count_new + 1:04d}",
                full_name=emp_name,
                designation=s['designation'] or "सहायक स्तर",
                department=dept,
                employment_type="स्थायी (Permanent)" if ("अधिकृत" in s['designation'] or "सहायक" in s['designation']) else "करार (Contract)",
                contact_phone=clean_phone or "९७४९३२६६०६",
                email=s['email'] or "info@panchpokharithangpalmun.gov.np",
                photo_url=p,
                is_department_head=is_head,
                is_information_officer=is_info_officer,
                service_status="कार्यरत (Active)",
                status="Active",
                join_date_bs="२०७९-०४-०१"
            )
            db.add(emp)
            count_new += 1

    db.commit()
    total = db.query(Employee).count()
    return {
        "success": True,
        "message": f"सफलतापूर्वक {len(all_staff)} कर्मचारी सिङ्क गरियो ({count_new} नयाँ, {count_updated} अद्यावधिक)।",
        "totalEmployees": total
    }


