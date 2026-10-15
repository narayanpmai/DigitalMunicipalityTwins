import sys
import json
import urllib.request

sys.stdout.reconfigure(encoding="utf-8")

endpoints = [
    "http://localhost:3001/api/v1/waste-management/dashboard-stats",
    "http://localhost:3001/api/v1/waste-management/schedules",
    "http://localhost:3001/api/v1/waste-management/disposal-sites",
    "http://localhost:3001/api/v1/waste-management/workers",
    "http://localhost:3001/api/v1/waste-management/rates",
    "http://localhost:3001/api/v1/waste-management/alerts",
    "http://localhost:3001/api/v1/waste-management/wallets",
    "http://localhost:3001/api/v1/waste-management/vehicles",
]

for url in endpoints:
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0", "x-tenant-id": "panchpokhari"})
        with urllib.request.urlopen(req, timeout=3) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            cnt = len(data) if isinstance(data, list) else len(data.keys())
            print(f"✓ GET {url.split('/')[-1]}: {resp.status} OK (items: {cnt})")
    except Exception as e:
        print(f"✗ GET {url.split('/')[-1]}: {e}")
