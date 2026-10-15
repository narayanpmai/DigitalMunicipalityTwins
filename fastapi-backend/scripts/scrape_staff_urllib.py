import ssl, urllib.request, re, json

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
ctx.set_ciphers('DEFAULT@SECLEVEL=1')

def fetch_url(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, context=ctx, timeout=30) as resp:
        return resp.read().decode('utf-8', errors='ignore')

def strip_tags(html):
    s = re.sub(r'<[^>]+>', ' ', html)
    return re.sub(r'\s+', ' ', s).strip()

def get_staff_from_html(html):
    # Locate the table for elected-officials view
    # The view container is <div class="view view-elected-officials ...">
    m = re.search(r'<div class="view view-elected-officials[^"]*">(.*?)(?:<!--\s*/\.view\s*-->|<div class="view view-|<div class="item-list">)', html, re.DOTALL)
    content = m.group(1) if m else html
    
    # Extract table rows
    rows = re.findall(r'<tr class="(?:odd|even)[^"]*">(.*?)</tr>', content, re.DOTALL)
    
    staff = []
    for r in rows:
        # Check if it has title
        if 'views-field-title' not in r:
            continue
            
        # Name
        nm = re.search(r'<td class="views-field views-field-title"[^>]*>(.*?)</td>', r, re.DOTALL)
        name = strip_tags(nm.group(1)) if nm else ""
        if not name:
            continue
            
        # Image
        img_full_m = re.search(r'<a href="([^"]+\.(?:jpg|jpeg|png|webp))"', r, re.IGNORECASE)
        img_thumb_m = re.search(r'<img[^>]+src="([^">]+)"', r)
        photo_url = img_full_m.group(1) if img_full_m else (img_thumb_m.group(1) if img_thumb_m else None)
        
        # Designation
        dm = re.search(r'<td class="views-field views-field-field-designation"[^>]*>(.*?)</td>', r, re.DOTALL)
        designation = strip_tags(dm.group(1)) if dm else ""
        
        # Section
        sm = re.search(r'<td class="views-field views-field-field-section"[^>]*>(.*?)</td>', r, re.DOTALL)
        section = strip_tags(sm.group(1)) if sm else ""
        
        # Email
        em = re.search(r'<td class="views-field views-field-field-email"[^>]*>(.*?)</td>', r, re.DOTALL)
        email = strip_tags(em.group(1)) if em else ""
        
        # Phone
        pm = re.search(r'<td class="views-field views-field-field-phone"[^>]*>(.*?)</td>', r, re.DOTALL)
        phone = strip_tags(pm.group(1)) if pm else ""
        
        staff.append({
            "name": name,
            "designation": designation,
            "department": section or "सामान्य प्रशासन",
            "email": email if "@" in email else None,
            "phone": phone,
            "photo_url": photo_url
        })
        
    # Check pager in content
    # Find next page link specifically inside view-elected-officials
    has_next = False
    pager_m = re.search(r'<ul class="pager">(.*?)</ul>', content, re.DOTALL)
    if pager_m:
        pager_html = pager_m.group(1)
        if 'pager-next' in pager_html:
            has_next = True
            
    return staff, has_next

if __name__ == "__main__":
    all_staff = []
    page = 0
    while True:
        url = f"https://old.panchpokharithangpalmun.gov.np/staff?page={page}" if page > 0 else "https://old.panchpokharithangpalmun.gov.np/staff"
        print(f"Fetching page {page}: {url}")
        html = fetch_url(url)
        staff, has_next = get_staff_from_html(html)
        print(f"-> Found {len(staff)} staff members on page {page}. (has_next: {has_next})")
        all_staff.extend(staff)
        if not has_next or len(staff) == 0:
            break
        page += 1

    print("\n" + "="*70)
    print(f"TOTAL UNIQUE STAFF FETCHED: {len(all_staff)}")
    print("="*70)
    for i, s in enumerate(all_staff):
        print(f"{i+1:2d}. {s['name']:25s} | {s['designation']:30s} | {s['department']:20s} | {s['phone']:12s} | {s['email'] or '-'}")

    with open("/tmp/official_staff.json", "w", encoding="utf-8") as f:
        json.dump(all_staff, f, ensure_ascii=False, indent=2)
    print("\nSaved to /tmp/official_staff.json")
