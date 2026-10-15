import httpx
import re
import json

client = httpx.Client(verify=False, headers={'User-Agent': 'Mozilla/5.0'})

def strip_tags(html):
    s = re.sub(r'<[^>]+>', ' ', html)
    return re.sub(r'\s+', ' ', s).strip()

def parse_staff_table(page=0):
    url = f"https://old.panchpokharithangpalmun.gov.np/staff?page={page}" if page > 0 else "https://old.panchpokharithangpalmun.gov.np/staff"
    print(f"Fetching {url}...")
    r = client.get(url, timeout=30)
    html = r.text
    
    # Locate view-elected-officials
    view_match = re.search(r'<div class="view view-elected-officials[^"]*">(.*?)</div>\s*<!--\s*/\.view\s*-->', html, re.DOTALL)
    if not view_match:
        # Fallback to finding <table class="views-table ...">
        view_match = re.search(r'<table class="views-table[^"]*">(.*?)</table>', html, re.DOTALL)
        view_content = view_match.group(1) if view_match else html
    else:
        view_content = view_match.group(1)
        
    # Extract all <tr> rows inside tbody
    rows = re.findall(r'<tr class="(?:odd|even)[^"]*">(.*?)</tr>', view_content, re.DOTALL)
    print(f"Page {page}: found {len(rows)} staff table rows")
    
    staff_list = []
    for row in rows:
        # 1. Image
        img_match = re.search(r'<img[^>]+src="([^">]+)"', row)
        img_full_match = re.search(r'<a href="([^"]+\.(?:jpg|jpeg|png|webp))"', row, re.IGNORECASE)
        photo_url = img_full_match.group(1) if img_full_match else (img_match.group(1) if img_match else None)
        
        # 2. Name
        name_match = re.search(r'<td class="views-field views-field-title"[^>]*>(.*?)</td>', row, re.DOTALL)
        name = strip_tags(name_match.group(1)) if name_match else ""
        
        # 3. Designation
        desig_match = re.search(r'<td class="views-field views-field-field-designation"[^>]*>(.*?)</td>', row, re.DOTALL)
        designation = strip_tags(desig_match.group(1)) if desig_match else ""
        
        # 4. Section / Department
        sec_match = re.search(r'<td class="views-field views-field-field-section"[^>]*>(.*?)</td>', row, re.DOTALL)
        section = strip_tags(sec_match.group(1)) if sec_match else ""
        
        # 5. Email
        email_match = re.search(r'<td class="views-field views-field-field-email"[^>]*>(.*?)</td>', row, re.DOTALL)
        email = strip_tags(email_match.group(1)) if email_match else ""
        
        # 6. Phone
        phone_match = re.search(r'<td class="views-field views-field-field-phone"[^>]*>(.*?)</td>', row, re.DOTALL)
        phone = strip_tags(phone_match.group(1)) if phone_match else ""
        
        if name:
            staff_list.append({
                "name": name,
                "designation": designation,
                "department": section or "प्रशासन",
                "email": email if "@" in email else None,
                "phone": phone,
                "photo_url": photo_url
            })
            
    # Check if there is next page
    has_next = f'page={page + 1}' in view_content or 'next ›' in view_content
    return staff_list, has_next

if __name__ == "__main__":
    all_staff = []
    page = 0
    while True:
        staff_items, has_next = parse_staff_table(page)
        if not staff_items:
            break
        all_staff.extend(staff_items)
        if not has_next:
            break
        page += 1
        
    print(f"\n==========================================")
    print(f"SUCCESS: Total staff members parsed: {len(all_staff)}")
    print(f"==========================================")
    for i, s in enumerate(all_staff):
        print(f"{i+1:2d}. {s['name']:25s} | {s['designation']:28s} | {s['department']:15s} | {s['phone']:12s} | {s['email'] or '-'}")

    with open("/tmp/parsed_staff.json", "w", encoding="utf-8") as f:
        json.dump(all_staff, f, ensure_ascii=False, indent=2)
    print("Saved to /tmp/parsed_staff.json")
