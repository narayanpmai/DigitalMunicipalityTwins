import re

with open('/tmp/staff.html', encoding='utf-8') as f:
    html = f.read()

# Look for views
views = re.findall(r'<div class="view view-([^" ]+)[^"]*">', html)
print('Views found on staff page:', views)

# Let's find view-id-staff or view-staff or similar
for v in views:
    if 'staff' in v.lower() or 'karmachari' in v.lower() or 'officials' in v.lower():
        print("Candidate view:", v)

# Let's find where 'लक्ष्मण कुईकेल' is located in html
idx = html.find('लक्ष्मण कुईकेल')
if idx != -1:
    print("\nSnippet around 'लक्ष्मण कुईकेल':")
    start = max(0, idx - 500)
    end = min(len(html), idx + 1200)
    print(html[start:end])
else:
    print("Could not find 'लक्ष्मण कुईकेल'")
