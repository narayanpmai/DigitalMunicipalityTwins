import urllib.request
import json

base = 'http://127.0.0.1:3002/api/v1'
req = urllib.request.Request(f'{base}/wards?tenant_id=khadadevi', headers={'X-Tenant-Id': 'khadadevi'})
with urllib.request.urlopen(req) as resp:
    wards = json.loads(resp.read().decode('utf-8'))

print("=== KHADADEVI 9 WARDS ===")
for w in wards:
    print(f"Ward {w.get('wardNo')}: {w.get('name')} | Chair: {w.get('wardChairName')} | Pop: {w.get('population')} (Male: {w.get('malePopulation')}, Female: {w.get('femalePopulation')}) | HH: {w.get('households')}")

req2 = urllib.request.Request(f'{base}/representatives?tenant_id=khadadevi', headers={'X-Tenant-Id': 'khadadevi'})
with urllib.request.urlopen(req2) as resp:
    reps = json.loads(resp.read().decode('utf-8'))

print("\n=== KHADADEVI REPRESENTATIVES ===")
for r in reps:
    print(f"Rep: {r.get('name')} | Designation: {r.get('designation')} | Ward: {r.get('wardNo')} | Phone: {r.get('phone')}")
