import sys
import json
import urllib.request

sys.stdout.reconfigure(encoding="utf-8")

endpoints = [
    "http://localhost:3001/api/v1/building-permits",
    "http://localhost:3001/api/v1/building-permits/stats",
    "http://localhost:3001/api/v1/ebps/applications/",
]

for url in endpoints:
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0", "x-tenant-id": "panchpokhari"})
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            cnt = len(data) if isinstance(data, list) else len(data.keys())
            print(f"✓ GET {url.split('api/v1/')[-1]}: {resp.status} OK ({cnt} items/keys)")
            if isinstance(data, dict):
                print(f"   Response: {data}")
    except Exception as e:
        print(f"✗ GET {url.split('api/v1/')[-1]}: {e}")
