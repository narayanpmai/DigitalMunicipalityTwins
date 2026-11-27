import re

with open('/app/scripts/data/योजना सम्झौता - सम्झौता थप्नुहोस्.html', 'r', encoding='utf-8', errors='ignore') as f:
    html = f.read()

print("=== HEADERS / SECTIONS ===")
for h in re.findall(r'<h[3-5][^>]*>(.*?)</h[3-5]>', html):
    t = re.sub(r'<[^>]+>', '', h).strip()
    if t:
        print("Section:", t)

print("\n=== LABELS ===")
labels = re.findall(r'<label[^>]*>(.*?)</label>', html, re.DOTALL)
seen = set()
for l in labels:
    clean = re.sub(r'<[^>]+>', '', l).strip()
    if clean and clean not in seen:
        seen.add(clean)
        print("Label:", clean)

print("\n=== TABLES IN AGREEMENT ===")
tables = re.findall(r'<table[^>]*>(.*?)</table>', html, re.DOTALL)
for idx, tbl in enumerate(tables):
    headers = [re.sub(r'<[^>]+>', '', th).strip() for th in re.findall(r'<th[^>]*>(.*?)</th>', tbl, re.DOTALL)]
    print(f"Table {idx+1} Headers:", headers)

print("\n=== BUTTONS / ACTIONS ===")
for btn in re.findall(r'<button[^>]*>(.*?)</button>', html, re.DOTALL):
    clean = re.sub(r'<[^>]+>', '', btn).strip()
    if clean:
        print("Button:", clean)

