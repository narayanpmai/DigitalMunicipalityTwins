import json
import re
import os

filepath = r"C:\Users\Administrator\.gemini\antigravity-ide\brain\75c692ca-d786-4d1b-90d7-a8f0c7fcf518\.system_generated\steps\991\content.md"

with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

m = re.search(r'<script id="__NEXT_DATA__" type="application/json">(.*?)</script>', text, re.DOTALL)
if m:
    data = json.loads(m.group(1))
    print("Found __NEXT_DATA__!")
    print("Keys in data:", list(data.keys()))
    props = data.get("props", {})
    page_props = props.get("pageProps", {})
    print("Keys in pageProps:", list(page_props.keys()))
    
    outpath = r"c:\inetpub\wwwroot\Municipal_Digital_Twins-main\scripts\census_extracted.json"
    with open(outpath, "w", encoding="utf-8") as out:
        json.dump(data, out, ensure_ascii=False, indent=2)
    print(f"Saved to {outpath}")
else:
    print("No __NEXT_DATA__ found. Checking if there are other script tags or JSON...")
    # Find all script tags
    matches = re.findall(r'<script.*?>(.*?)</script>', text, re.DOTALL)
    print(f"Total script tags: {len(matches)}")
