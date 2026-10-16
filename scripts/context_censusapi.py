import urllib.request
import re

url = "https://censusresults.nsonepal.gov.np/_next/static/chunks/4907-dfda8bc57e0080ab.js"
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
with urllib.request.urlopen(req) as resp:
    text = resp.read().decode('utf-8', errors='ignore')

idx = 0
while True:
    pos = text.find('censusapi.cbs.gov.np', idx)
    if pos == -1:
        break
    start = max(0, pos - 150)
    end = min(len(text), pos + 300)
    print("MATCH AT", pos)
    print(text[start:end])
    print("-" * 50)
    idx = pos + 25
