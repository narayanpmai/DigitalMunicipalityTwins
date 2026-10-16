import urllib.request
import re
import json

base_url = "https://censusresults.nsonepal.gov.np"

# Let's inspect pages/population-685a48c3a54c10a6.js
js_url = f"{base_url}/_next/static/chunks/pages/population-685a48c3a54c10a6.js"
req = urllib.request.Request(js_url, headers={"User-Agent": "Mozilla/5.0"})
try:
    with urllib.request.urlopen(req) as resp:
        content = resp.read().decode('utf-8')
        # Find api urls
        apis = set(re.findall(r'["\'](/api/[^"\']+)["\']', content))
        print("APIs found in population JS:", apis)
        # Also find any fetch or axios URLs
        urls = set(re.findall(r'https?://[^"\'\s]+', content))
        print("External URLs found:", urls)
except Exception as e:
    print("Error fetching JS:", e)

# Also let's check common NSO API paths
candidates = [
    f"{base_url}/api/population?province=3&district=24&municipality=3",
    f"{base_url}/api/v1/population?province=3&district=24&municipality=3",
    f"{base_url}/api/demographic?province=3&district=24&municipality=3",
    f"https://censusresults.nsonepal.gov.np/api/population/3/24/3",
    f"https://censusresults.nsonepal.gov.np/api/v1/indicators?province=3&district=24&municipality=3"
]

for url in candidates:
    try:
        r = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0", "Accept": "application/json"})
        with urllib.request.urlopen(r, timeout=5) as res:
            print(f"Success for {url}: status {res.status}")
            data = res.read().decode('utf-8')
            print(data[:300])
    except Exception as e:
        print(f"Failed {url}: {e}")
