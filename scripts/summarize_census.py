import json

with open(r"c:\inetpub\wwwroot\Municipal_Digital_Twins-main\scripts\panchpokhari_census_2021_raw.json", "r", encoding="utf-8") as f:
    data = json.load(f)

print("KEYS AVAILABLE:", list(data.keys()))

# 1. Ward distribution
print("\n--- 1. WARD DISTRIBUTION ---")
ward_dist = data.get("/population/distribution/ward", {})
print(json.dumps(ward_dist, ensure_ascii=False, indent=2)[:800])

# 2. Highlight / Ward Highlight
print("\n--- 2. WARD HIGHLIGHT ---")
ward_hl = data.get("/population/highlight/ward", {})
print(json.dumps(ward_hl, ensure_ascii=False, indent=2)[:800])

# 3. Caste
print("\n--- 3. CASTE ---")
caste = data.get("/population/caste", {})
print(json.dumps(caste, ensure_ascii=False, indent=2)[:800])

# 4. Religion
print("\n--- 4. RELIGION ---")
religion = data.get("/population/religion", {})
print(json.dumps(religion, ensure_ascii=False, indent=2)[:800])

# 5. Mother tongue
print("\n--- 5. MOTHER TONGUE ---")
mt = data.get("/population/mother-tongue", {})
print(json.dumps(mt, ensure_ascii=False, indent=2)[:800])

# 6. Age Group
print("\n--- 6. AGE GROUP ---")
age = data.get("/population/age-group", {})
print(json.dumps(age, ensure_ascii=False, indent=2)[:800])
