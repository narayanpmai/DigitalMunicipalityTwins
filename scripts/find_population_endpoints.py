import urllib.request
import re

for chunk in ["pages/population-685a48c3a54c10a6.js", "4907-dfda8bc57e0080ab.js"]:
    url = f"https://censusresults.nsonepal.gov.np/_next/static/chunks/{chunk}"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req) as resp:
        text = resp.read().decode('utf-8', errors='ignore')
    
    print(f"=== {chunk} ===")
    matches = re.findall(r'\.get\(["\']([^"\']+)["\']', text)
    print("get calls string literals:", set(matches))
    matches_temp = re.findall(r'\.get\(`([^`]+)`', text)
    print("get calls template literals:", set(matches_temp))
