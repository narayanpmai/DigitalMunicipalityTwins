import urllib.request
import re

chunks = [
    "594-d69e434284215e0b.js",
    "1724-1ef715a2d7922911.js",
    "9933-e387010a6e57a3f5.js",
    "8539-c5a906b66a398639.js",
    "4907-dfda8bc57e0080ab.js",
    "5643-6e40f87ef0f40d3f.js",
    "pages/_app-cc9f0521e28cace6.js",
    "main-b580d8f6fb31cc8c.js"
]

base_url = "https://censusresults.nsonepal.gov.np/_next/static/chunks"

for chunk in chunks:
    url = f"{base_url}/{chunk}"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            text = resp.read().decode('utf-8', errors='ignore')
            # Look for api endpoints or base URLs
            matches = re.findall(r'https?://[a-zA-Z0-9\.\-_/]+', text)
            api_matches = [m for m in matches if 'api' in m or 'census' in m or 'nso' in m or 'backend' in m]
            if api_matches:
                print(f"Chunk {chunk} matches:", set(api_matches))
            # Also search for endpoint paths like "/v1/..."
            paths = set(re.findall(r'["\'](/[a-zA-Z0-9\-_/]+population[a-zA-Z0-9\-_/]*)["\']', text))
            if paths:
                print(f"Chunk {chunk} paths:", paths)
    except Exception as e:
        print(f"Failed {chunk}: {e}")
