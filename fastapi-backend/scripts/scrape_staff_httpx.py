import httpx
import re
import json

client = httpx.Client(verify=False, headers={'User-Agent': 'Mozilla/5.0'})

def strip_tags(html):
    s = re.sub(r'<[^>]+>', ' ', html)
    return re.sub(r'\s+', ' ', s).strip()

def extract_staff_page(page=0):
    url = f"https://old.panchpokharithangpalmun.gov.np/staff?page={page}" if page > 0 else "https://old.panchpokharithangpalmun.gov.np/staff"
    r = client.get(url)
    text = r.text
    
    # In Drupal, look for views-row
    # Let's inspect all <div class="views-row ...">
    rows = re.findall(r'<div class="views-row\s+views-row-[^"]*">(.*?)</div>\s*<!--\s*/\.views-row\s*-->', text, re.DOTALL)
    if not rows:
        # try without comment
        rows = re.findall(r'<div class="views-row[^"]*">(.*?)(?=<div class="views-row|<\/div>\s*<\/div>\s*<\/div>\s*<\/div>)', text, re.DOTALL)
    
    print(f"Page {page}: found {len(rows)} rows with regex")
    
    staff_items = []
    # Let's also inspect using split
    parts = text.split('<div class="views-row views-row-')
    for part in parts[1:]:
        # Cut at closing div of view row or start of next
        chunk = part[:part.find('</div>\n  </div>') if '</div>\n  </div>' in part else 2500]
        
        # Name
        name_m = re.search(r'<span class="field-content"><a href="([^"]*)">([^<]+)</a></span>', part)
        if not name_m:
            name_m = re.search(r'<a href="(/content/[^"]*)">([^<]+)</a>', part)
        if not name_m:
            continue
            
        profile_link = name_m.group(1)
        name = name_m.group(2).strip()
        
        # Photo
        photo_m = re.search(r'<img[^>]+src="([^">]+)"', part)
        photo_url = photo_m.group(1) if photo_m else None
        if photo_url:
            if photo_url.startswith('/'):
                photo_url = "https://old.panchpokharithangpalmun.gov.np" + photo_url
            elif not photo_url.startswith('http'):
                photo_url = "https://old.panchpokharithangpalmun.gov.np/" + photo_url
                
        # Designation
        desig_m = re.search(r'views-field-field-designation[^>]*>.*?<div class="field-content">([^<]+)</div>', part, re.DOTALL)
        if not desig_m:
            desig_m = re.search(r'views-field-field-designation[^>]*>.*?<span class="field-content">([^<]+)</span>', part, re.DOTALL)
        designation = desig_m.group(1).strip() if desig_m else ""
        
        # Department / Section
        dept_m = re.search(r'views-field-field-department[^>]*>.*?<div class="field-content">([^<]+)</div>', part, re.DOTALL)
        if not dept_m:
            dept_m = re.search(r'views-field-field-department[^>]*>.*?<span class="field-content">([^<]+)</span>', part, re.DOTALL)
        department = dept_m.group(1).strip() if dept_m else ""
        
        # Phone
        phone_m = re.search(r'views-field-field-phone[^>]*>.*?<span class="field-content">([^<]+)</span>', part, re.DOTALL)
        if not phone_m:
            phone_m = re.search(r'views-field-field-phone[^>]*>.*?<div class="field-content">([^<]+)</div>', part, re.DOTALL)
        phone = phone_m.group(1).strip() if phone_m else ""
        
        # Email
        email_m = re.search(r'mailto:([^"]+)', part)
        email = email_m.group(1).strip() if email_m else ""
        
        # Check all views-field tags
        all_fields = re.findall(r'<div class="views-field views-field-([^"]+)">(.*?)</div>', part, re.DOTALL)
        fields = {k: strip_tags(v) for k, v in all_fields}
        
        staff_items.append({
            "name": name,
            "designation": designation or fields.get("field-designation", ""),
            "department": department or fields.get("field-department", ""),
            "phone": phone or fields.get("field-phone", ""),
            "email": email or fields.get("field-email", ""),
            "photo_url": photo_url,
            "profile_link": profile_link,
            "fields": fields
        })
        
    return staff_items

if __name__ == "__main__":
    all_staff = []
    for p in range(5):
        items = extract_staff_page(p)
        print(f"Page {p} extracted {len(items)} staff items")
        if not items:
            break
        all_staff.extend(items)
        if len(items) < 10:
            break
            
    print(f"\nTOTAL STAFF EXTRACTED: {len(all_staff)}")
    for i, s in enumerate(all_staff):
        print(f"{i+1:2d}. {s['name']} | {s['designation']} | {s['department']} | {s['phone']} | {s['email']}")
        
    with open("fastapi-backend/scripts/staff_scraped.json", "w", encoding="utf-8") as f:
        json.dump(all_staff, f, ensure_ascii=False, indent=2)
    print("Saved to staff_scraped.json")
