import urllib.request
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

base = 'http://localhost:8080/api/v1/health'
endpoints = [
    '/facilities',
    '/ambulances',
    '/patients',
    '/ipd/admissions',
    '/lab/tests',
    '/prescriptions',
    '/medicines',
    '/suppliers',
    '/pos/sales',
    '/dhis2/reports',
    '/dhis2/summary',
    '/insurance/claims',
    '/insurance/summary'
]

print("=== Complete Health Module API Verification (Port 8080) ===")
for ep in endpoints:
    url = base + ep
    resp = urllib.request.urlopen(url)
    data = json.loads(resp.read().decode('utf-8'))
    if isinstance(data, list):
        summary_str = f"{len(data)} items"
    else:
        summary_str = json.dumps(data, ensure_ascii=False)
    print(f"✓ {ep.ljust(22)}: HTTP {resp.status} -> {summary_str}")
