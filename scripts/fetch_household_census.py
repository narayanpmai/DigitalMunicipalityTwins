import urllib.request
import json

base = "https://censusapi.cbs.gov.np/api/v1"
params = "province=3&district=24&municipality=3"

hh_endpoints = [
    "/household/highlight",
    "/household/drinking-water",
    "/household/cooking-fuel",
    "/household/lighting",
    "/household/toilet",
    "/household/ownership",
    "/household/solid-waste",
    "/household/outer-wall",
    "/household/roof",
    "/household/floor",
    "/household/foundation",
    "/household/female-ownership",
    "/household/facilities"
]

hh_data = {}
for ep in hh_endpoints:
    url = f"{base}{ep}?{params}"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0", "Accept": "application/json"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            hh_data[ep] = data
            print(f"SUCCESS HH: {ep}")
    except Exception as e:
        print(f"FAILED HH {ep}: {e}")

out_path = r"c:\inetpub\wwwroot\Municipal_Digital_Twins-main\scripts\panchpokhari_household_2021_raw.json"
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(hh_data, f, ensure_ascii=False, indent=2)
print("Household data saved!")
