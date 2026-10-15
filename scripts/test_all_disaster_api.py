import urllib.request
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

base = 'http://localhost:8080/api/v1/disaster'
endpoints = [
    '/stats',
    '/events',
    '/active',
    '/shelters',
    '/contacts',
    '/inventory',
    '/funds',
    '/settlements',
    '/gis'
]

print("=== Complete Disaster Management Module API Verification (Port 8080) ===")
for ep in endpoints:
    url = base + ep
    resp = urllib.request.urlopen(url)
    data = json.loads(resp.read().decode('utf-8'))
    if isinstance(data, list):
        summary_str = f"{len(data)} items"
    elif isinstance(data, dict) and "features" in data:
        summary_str = f"GeoJSON FeatureCollection ({len(data['features'])} features)"
    else:
        summary_str = json.dumps(data, ensure_ascii=False)
    print(f"✓ {ep.ljust(18)}: HTTP {resp.status} -> {summary_str}")
