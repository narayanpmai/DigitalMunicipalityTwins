import urllib.request
import json

base = "https://censusapi.cbs.gov.np/api/v1"
params = "province=3&district=24&municipality=3"

endpoints = [
    "/population/highlight",
    "/population/distribution/ward",
    "/population/age-group",
    "/population/marital-status",
    "/population/caste",
    "/population/religion",
    "/population/mother-tongue",
    "/population/disability-summary",
    "/population/birth-registration",
    "/population/household-head",
    "/population/first-marriage",
    "/population/living-arrangement",
    "/population/highlight/ward"
]

all_data = {}

for ep in endpoints:
    url = f"{base}{ep}?{params}"
    try:
        req = urllib.request.Request(url, headers={
            "User-Agent": "Mozilla/5.0",
            "Accept": "application/json"
        })
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            all_data[ep] = data
            print(f"SUCCESS: {ep}")
    except Exception as e:
        print(f"FAILED {ep}: {e}")

out_path = r"c:\inetpub\wwwroot\Municipal_Digital_Twins-main\scripts\panchpokhari_census_2021_raw.json"
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(all_data, f, ensure_ascii=False, indent=2)

print(f"All census data saved to {out_path}")
