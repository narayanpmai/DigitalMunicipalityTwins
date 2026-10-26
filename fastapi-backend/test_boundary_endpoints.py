import urllib.request
import json

tenants = ['gaushala', 'panchpokhari', 'melamchi', 'helambu', 'benighatrorang', 'galchhi', 'khadadevi']

print("--- Testing /api/v1/demographics/ward-boundaries ---")
for t in tenants:
    url = f"http://127.0.0.1:3002/api/v1/demographics/ward-boundaries?tenant_id={t}"
    req = urllib.request.Request(url, headers={"X-Tenant-Id": t})
    try:
        with urllib.request.urlopen(req, timeout=5) as res:
            data = json.loads(res.read().decode("utf-8"))
            print(f"[{res.status}] {t} -> tenant_id: {data.get('tenant_id')}, features: {len(data.get('features', []))}")
    except Exception as e:
        print(f"Error {t}: {e}")

print("\n--- Testing /api/v1/demographics/municipality-boundary ---")
for t in tenants:
    url = f"http://127.0.0.1:3002/api/v1/demographics/municipality-boundary?tenant_id={t}"
    req = urllib.request.Request(url, headers={"X-Tenant-Id": t})
    try:
        with urllib.request.urlopen(req, timeout=5) as res:
            data = json.loads(res.read().decode("utf-8"))
            print(f"[{res.status}] {t} -> tenant_id: {data.get('tenant_id')}, features: {len(data.get('features', []))}")
    except Exception as e:
        print(f"Error {t}: {e}")
