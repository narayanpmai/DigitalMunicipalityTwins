import ssl, urllib.request, re, json, uuid, os
from sqlalchemy.orm import Session
from core.database import SessionLocal, engine
from models.employee import Employee

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
ctx.set_ciphers('DEFAULT@SECLEVEL=1')

UPLOAD_DIR = "/app/uploads/employees"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def fetch_url(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, context=ctx, timeout=30) as resp:
        return resp.read().decode('utf-8', errors='ignore')

def download_photo(url, emp_id):
    if not url:
        return None
    try:
        if url.startswith('/'):
            url = "https://old.panchpokharithangpalmun.gov.np" + url
        elif not url.startswith('http'):
            url = "https://old.panchpokharithangpalmun.gov.np/" + url

        clean_url = url.replace(' ', '%20')
        req = urllib.request.Request(clean_url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, context=ctx, timeout=15) as resp:
            data = resp.read()
            if len(data) > 500:
                ext = "jpg"
                if ".png" in url.lower(): ext = "png"
                elif ".webp" in url.lower(): ext = "webp"
                filename = f"{emp_id}.{ext}"
                filepath = os.path.join(UPLOAD_DIR, filename)
                with open(filepath, "wb") as f:
                    f.write(data)
                return f"/uploads/employees/{filename}"
    except Exception as e:
        print(f"  [Notice] Could not download photo from {url}: {e}")
    return url

def strip_tags(html):
    s = re.sub(r'<[^>]+>', ' ', html)
    return re.sub(r'\s+', ' ', s).strip()

def scrape_all_staff():
    all_staff = []
    page = 0
    while True:
        url = f"https://old.panchpokharithangpalmun.gov.np/staff?page={page}" if page > 0 else "https://old.panchpokharithangpalmun.gov.np/staff"
        print(f"Scraping page {page}: {url}")
        html = fetch_url(url)
        
        m = re.search(r'<div class="view view-elected-officials[^"]*">(.*?)(?:<!--\s*/\.view\s*-->|<div class="view view-|<div class="item-list">)', html, re.DOTALL)
        content = m.group(1) if m else html
        rows = re.findall(r'<tr class="(?:odd|even)[^"]*">(.*?)</tr>', content, re.DOTALL)
        
        page_staff = []
        for r in rows:
            if 'views-field-title' not in r:
                continue
            nm = re.search(r'<td class="views-field views-field-title"[^>]*>(.*?)</td>', r, re.DOTALL)
            name = strip_tags(nm.group(1)) if nm else ""
            if not name:
                continue
                
            img_full_m = re.search(r'<a href="([^"]+\.(?:jpg|jpeg|png|webp))"', r, re.IGNORECASE)
            img_thumb_m = re.search(r'<img[^>]+src="([^">]+)"', r)
            photo_url = img_full_m.group(1) if img_full_m else (img_thumb_m.group(1) if img_thumb_m else None)
            
            dm = re.search(r'<td class="views-field views-field-field-designation"[^>]*>(.*?)</td>', r, re.DOTALL)
            designation = strip_tags(dm.group(1)) if dm else ""
            
            sm = re.search(r'<td class="views-field views-field-field-section"[^>]*>(.*?)</td>', r, re.DOTALL)
            section = strip_tags(sm.group(1)) if sm else ""
            
            em = re.search(r'<td class="views-field views-field-field-email"[^>]*>(.*?)</td>', r, re.DOTALL)
            email = strip_tags(em.group(1)) if em else ""
            
            pm = re.search(r'<td class="views-field views-field-field-phone"[^>]*>(.*?)</td>', r, re.DOTALL)
            phone = strip_tags(pm.group(1)) if pm else ""
            
            page_staff.append({
                "name": name,
                "designation": designation,
                "department": section or "प्रशासन तथा योजना",
                "email": email if "@" in email else None,
                "phone": phone,
                "photo_url": photo_url
            })
            
        print(f"Page {page} gave {len(page_staff)} records.")
        all_staff.extend(page_staff)
        
        has_next = False
        pager_m = re.search(r'<ul class="pager">(.*?)</ul>', content, re.DOTALL)
        if pager_m and 'pager-next' in pager_m.group(1):
            has_next = True
            
        if not has_next or len(page_staff) == 0:
            break
        page += 1
        
    return all_staff

def import_to_database():
    staff_data = scrape_all_staff()
    print(f"\nFetched total {len(staff_data)} authentic staff records.")
    
    db: Session = SessionLocal()
    try:
        # Check dummy employees (e.g. 'कृष्ण प्रसाद सापकोटा' or ones not in authentic list)
        dummy_names = {"कृष्ण प्रसाद सापकोटा", "दिनेश तामाङ", "इ. रमेश खड्का", "प्रकाश पौडेल", "विष्णुहरि घिमिरे"}
        deleted_dummies = db.query(Employee).filter(Employee.full_name.in_(dummy_names)).delete(synchronize_session=False)
        print(f"Purged {deleted_dummies} dummy placeholder records.")
        
        # Also clean up any lingering dummy EMP- IDs
        existing_employees = {e.full_name.strip(): e for e in db.query(Employee).all()}
        
        imported_count = 0
        updated_count = 0
        
        for idx, s in enumerate(staff_data):
            emp_name = s['name'].strip()
            
            # Extract clean phone
            clean_phone = s['phone'].split('/')[0].split(',')[0].strip() if s['phone'] else ''
            
            # Determine flags
            is_cao = 'प्रमुख प्रशाासकिय' in s['designation'] or 'प्रमुख प्रशासकीय' in s['designation']
            is_head = is_cao or 'प्रमुख' in s['designation'] or 'संयोजक' in s['designation'] or 'अधिकृत आठौं' in s['designation']
            is_info_officer = 'सूचना अधिकारी' in s['designation'] or 'सुचना अधिकारी' in s['designation']
            
            # Clean department
            dept = s['department'].strip()
            if not dept or dept == 'प्रशासन':
                if is_cao:
                    dept = "कार्यपालिका तथा प्रमुख प्रशासकीय अधिकृत"
                else:
                    dept = "सामान्य प्रशासन तथा योजना शाखा"
            elif 'वडा' in dept:
                dept = dept.replace('वडासचिब', '(वडा सचिव)').replace('वडा सचिब', '(वडा सचिव)')
                    
            if emp_name in existing_employees:
                # Update existing
                emp = existing_employees[emp_name]
                emp.designation = s['designation'] or emp.designation
                emp.department = dept
                if s['email']: emp.email = s['email']
                if clean_phone: emp.contact_phone = clean_phone
                if is_head: emp.is_department_head = True
                if is_info_officer: emp.is_information_officer = True
                
                # Download photo if available
                if s['photo_url'] and (not emp.photo_url or 'http' in emp.photo_url):
                    local_photo = download_photo(s['photo_url'], emp.id)
                    if local_photo: emp.photo_url = local_photo
                
                updated_count += 1
                print(f"Updated: {emp_name} ({emp.employee_id})")
            else:
                new_id = str(uuid.uuid4())
                emp_code = f"EMP-AUTH-{idx + 1:03d}"
                
                # Download photo
                local_photo = download_photo(s['photo_url'], new_id) if s['photo_url'] else None
                
                emp = Employee(
                    id=new_id,
                    employee_id=emp_code,
                    full_name=emp_name,
                    designation=s['designation'] or "सहायक स्तर",
                    department=dept,
                    employment_type="स्थायी (Permanent)" if ("अधिकृत" in s['designation'] or "सहायक" in s['designation']) else "करार (Contract)",
                    contact_phone=clean_phone or "९७४९३२६६०६",
                    email=s['email'] or "info@panchpokharithangpalmun.gov.np",
                    photo_url=local_photo,
                    is_department_head=is_head,
                    is_information_officer=is_info_officer,
                    service_status="कार्यरत (Active)",
                    status="Active",
                    join_date_bs="२०७९-०४-०१"
                )
                db.add(emp)
                imported_count += 1
                print(f"Inserted: {emp_name} as {emp_code} ({s['designation']})")
                
        db.commit()
        print(f"\n==========================================")
        print(f"IMPORT COMPLETE: {imported_count} inserted, {updated_count} updated.")
        total_now = db.query(Employee).count()
        print(f"Total employees now in database: {total_now}")
        print(f"==========================================")
    except Exception as e:
        db.rollback()
        print(f"Error during import: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    import_to_database()
