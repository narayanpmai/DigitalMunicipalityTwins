import urllib.request
import json
import time

base = 'https://censusapi.cbs.gov.np/api/v1'
params = 'province=2&district=18&municipality=2'

endpoints = [
    '/population/highlight',
    '/population/distribution/ward',
    '/population/age-group',
    '/population/marital-status',
    '/population/caste',
    '/population/religion',
    '/population/mother-tongue',
    '/population/disability-summary',
    '/population/birth-registration',
    '/population/household-head',
    '/population/first-marriage',
    '/population/living-arrangement',
    '/population/literacy',
    '/household/highlight',
    '/household/drinking-water',
    '/household/cooking-fuel',
    '/household/lighting',
    '/household/toilet',
    '/household/ownership',
    '/household/solid-waste',
    '/household/outer-wall',
    '/household/roof',
    '/household/floor',
    '/household/foundation',
    '/household/female-ownership',
    '/household/facilities'
]

results = {}
for ep in endpoints:
    url = f"{base}{ep}?{params}"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'Accept': 'application/json'})
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            results[ep] = data
            print(f"SUCCESS: {ep}")
    except Exception as e:
        print(f"FAILED {ep}: {e}")
    time.sleep(0.3)

out_file = r'c:\inetpub\wwwroot\Municipal_Digital_Twins-main\scripts\gaushala_census_raw.json'
with open(out_file, 'w', encoding='utf-8') as f:
    json.dump(results, f, ensure_ascii=False, indent=2)

print("Done fetching! Total keys retrieved:", len(results))
