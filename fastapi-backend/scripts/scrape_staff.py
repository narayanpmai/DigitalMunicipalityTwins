import urllib.request
import re
import json
from html.parser import HTMLParser

class HTMLTextExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.result = []
    def handle_data(self, d):
        self.result.append(d)
    def get_text(self):
        return ''.join(self.result).strip()

def strip_tags(html):
    s = re.sub(r'<[^>]+>', ' ', html)
    return re.sub(r'\s+', ' ', s).strip()

def fetch_staff_page(page_num=0):
    url = "https://old.panchpokharithangpalmun.gov.np/staff"
    if page_num > 0:
        url += f"?page={page_num}"
    
    print(f"Fetching: {url}")
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    try:
        with urllib.request.urlopen(req, timeout=25) as resp:
            return resp.read().decode('utf-8', errors='ignore')
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return ""

def parse_staff_from_html(html):
    # Drupal view rows
    # Look for views-row
    rows = re.findall(r'<div class="views-row views-row-\d+[^"]*">(.*?)</div>\s*(?=<div class="views-row|<\/div>\s*<\/div>\s*<\/div>)', html, re.DOTALL)
    if not rows:
        # Alternative split
        parts = re.split(r'<div class="views-row views-row-\d+[^"]*">', html)
        rows = parts[1:]
    
    staff_list = []
    for r in rows:
        # Extract title/name
        name_match = re.search(r'<span class="field-content[^"]*"><a[^>]*>([^<]+)</a></span>', r)
        if not name_match:
            name_match = re.search(r'<a href="[^"]*content/[^"]*">([^<]+)</a>', r)
        name = name_match.group(1).strip() if name_match else ""
        if not name:
            continue
        
        # Photo image url
        img_match = re.search(r'<img[^>]+src="([^">]+)"', r)
        photo_url = img_match.group(1) if img_match else ""
        if photo_url.startswith('//'):
            photo_url = 'https:' + photo_url
        elif photo_url.startswith('/'):
            photo_url = 'https://old.panchpokharithangpalmun.gov.np' + photo_url
            
        # Designation, Department, Phone, Email
        # In Drupal staff view, there are fields like views-field-field-designation, views-field-field-department, views-field-field-phone, etc.
        designation = ""
        desig_match = re.search(r'views-field-field-designation[^>]*>.*?<div class="field-content">([^<]+)</div>', r, re.DOTALL)
        if not desig_match:
            desig_match = re.search(r'views-field-field-designation[^>]*>.*?<span class="field-content">([^<]+)</span>', r, re.DOTALL)
        if desig_match:
            designation = desig_match.group(1).strip()
            
        department = ""
        dept_match = re.search(r'views-field-field-department[^>]*>.*?<div class="field-content">([^<]+)</div>', r, re.DOTALL)
        if not dept_match:
            dept_match = re.search(r'views-field-field-department[^>]*>.*?<span class="field-content">([^<]+)</span>', r, re.DOTALL)
        if dept_match:
            department = dept_match.group(1).strip()
            
        phone = ""
        phone_match = re.search(r'views-field-field-phone[^>]*>.*?<span class="field-content">([^<]+)</span>', r, re.DOTALL)
        if not phone_match:
            phone_match = re.search(r'views-field-field-phone[^>]*>.*?<div class="field-content">([^<]+)</div>', r, re.DOTALL)
        if phone_match:
            phone = phone_match.group(1).strip()
            
        email = ""
        email_match = re.search(r'views-field-field-email[^>]*>.*?<a href="mailto:([^"]+)"', r)
        if not email_match:
            email_match = re.search(r'views-field-field-email[^>]*>.*?<span class="field-content">([^<]+)</span>', r, re.DOTALL)
        if email_match:
            email = email_match.group(1).strip()
            
        # Also check all views-field blocks inside this row
        fields = re.findall(r'<div class="views-field views-field-([^"]+)">(.*?)</div>', r, re.DOTALL)
        field_dict = {}
        for fname, fcontent in fields:
            field_dict[fname] = strip_tags(fcontent)

        staff_list.append({
            "name": name,
            "designation": designation,
            "department": department,
            "phone": phone,
            "email": email,
            "photo_url": photo_url,
            "fields": field_dict,
            "raw_snippet": r[:400]
        })
    return staff_list

if __name__ == "__main__":
    all_staff = []
    # Fetch page 0, 1, 2... until no more rows
    for page in range(5):
        html = fetch_staff_page(page)
        if not html:
            break
        staff = parse_staff_from_html(html)
        print(f"Page {page}: found {len(staff)} staff")
        if not staff:
            break
        all_staff.extend(staff)
        # Check if there is next page
        if 'page=' + str(page + 1) not in html and 'next ›' not in html:
            break
            
    print(f"\nTotal staff extracted: {len(all_staff)}")
    for i, s in enumerate(all_staff[:10]):
        print(f"{i+1}. {s['name']} | {s['designation']} | {s['department']} | {s['phone']} | {s['email']}")
        print(f"   Fields: {s['fields']}")
        print(f"   Photo: {s['photo_url']}")
        
    with open("scraped_staff.json", "w", encoding="utf-8") as f:
        json.dump(all_staff, f, ensure_ascii=False, indent=2)
    print("Saved to scraped_staff.json")
