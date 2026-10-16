import urllib.request
import re

url = "https://censusresults.nsonepal.gov.np/_next/static/chunks/4907-dfda8bc57e0080ab.js"
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
with urllib.request.urlopen(req) as resp:
    text = resp.read().decode('utf-8', errors='ignore')

# Find string occurrences around censusapi
for m in re.finditer(r'censusapi\.cbs\.gov\.np/api/v1([^"\'\`\s)]+)', text):
    print("Found endpoint suffix:", m.group(1))

# Also search for template literals like `/api/v1/...`
endpoints = set(re.findall(r'(/api/v1/[a-zA-Z0-9\-_/${}]+)', text))
print("Endpoints:", endpoints)

# Look for query patterns with province district municipality
patterns = set(re.findall(r'[^"\'\`]*province=[^"\'\`]*', text))
for p in list(patterns)[:10]:
    print("Query pattern:", p)
