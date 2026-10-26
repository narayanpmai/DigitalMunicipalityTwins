import urllib.request
import json
import re

url = "https://censusresults.nsonepal.gov.np/population?province=3&district=32&municipality=6"
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
try:
    with urllib.request.urlopen(req, timeout=15) as resp:
        html = resp.read().decode('utf-8')
        print("Fetched HTML length:", len(html))
        m = re.search(r'<script id="__NEXT_DATA__" type="application/json">(.*?)</script>', html)
        if m:
            data = json.loads(m.group(1))
            print("NEXT_DATA keys:", list(data.keys()))
            with open(r"c:\inetpub\wwwroot\Municipal_Digital_Twins-main\scripts\khadadevi_next_data.json", "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            print("Saved __NEXT_DATA__ to scripts/khadadevi_next_data.json")
        else:
            print("__NEXT_DATA__ not found")
except Exception as e:
    print("Error:", e)
