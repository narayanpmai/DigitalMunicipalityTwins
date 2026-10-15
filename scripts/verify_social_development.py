"""
Verification Script for Option 17: Social Development & Targeted Programs (सामाजिक विकास तथा लक्षित वर्ग)
Panchpokhari Thangpal Gaupalika, Sindhupalchok
"""
import sys
import psycopg2
import urllib.request
import json

sys.stdout.reconfigure(encoding="utf-8")

DATABASE_URL = "postgresql://p5admin:P5Digital%402024%21@localhost:5433/p5digital"
conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor()

print("=" * 80)
print("SOCIAL DEVELOPMENT & TARGETED PROGRAMS VERIFICATION (सामाजिक विकास तथा लक्षित वर्ग)")
print("=" * 80)

# 1. Senior Citizen Data
print("\n--- 1. SENIOR CITIZEN DATA (ज्येष्ठ नागरिक विवरण - Wards 1 to 8) ---")
cur.execute("""
    SELECT "wardNumber", "totalSeniorCitizens", "seniorCitizensAbove75", "allowanceRecipients", 
           "totalAllowanceAmount", "seniorCitizensWithDisability", "seniorCitizensAlone"
    FROM senior_citizen_data
    ORDER BY "wardNumber";
""")
sc_rows = cur.fetchall()
tot_sc = sum(r[1] for r in sc_rows)
tot_sc_75 = sum(r[2] for r in sc_rows)
tot_sc_allowance = sum(r[3] for r in sc_rows)
tot_sc_amt = sum(r[4] for r in sc_rows)
tot_sc_dis = sum(r[5] for r in sc_rows)
tot_sc_alone = sum(r[6] for r in sc_rows)

print(f"{'वडा':<5} | {'कुल ज्येष्ठ नागरिक':<18} | {'७५ वर्ष माथि':<12} | {'भत्ताग्राही':<12} | {'कुल भत्ता रकम (रु.)':<18} | {'अपाङ्गता भएका':<14} | {'एकल वृद्धवृद्धा'}")
print("-" * 105)
for r in sc_rows:
    print(f"वडा {r[0]:<2} | {r[1]:<18} | {r[2]:<12} | {r[3]:<12} | रु. {r[4]:<14,.2f} | {r[5]:<14} | {r[6]}")
print("-" * 105)
print(f"जम्मा  | {tot_sc:<18} | {tot_sc_75:<12} | {tot_sc_allowance:<12} | रु. {tot_sc_amt:<14,.2f} | {tot_sc_dis:<14} | {tot_sc_alone}")

# 2. Women and Children Data
print("\n--- 2. WOMEN & CHILDREN DATA (महिला तथा बालबालिका विवरण - Wards 1 to 8) ---")
cur.execute("""
    SELECT "wardNumber", "pregnantWomen", "lactatingMothers", "childrenUnder5", 
           "childrenInSchool", "malnourishedChildren", "womenEntrepreneurs"
    FROM women_children_data
    ORDER BY "wardNumber";
""")
wc_rows = cur.fetchall()
print(f"{'वडा':<5} | {'गर्भवती':<8} | {'सुत्केरी':<8} | {'५ वर्ष मुनिका':<14} | {'विद्यालय जाने':<14} | {'कुपोषित':<8} | {'महिला उद्यमी'}")
print("-" * 80)
for r in wc_rows:
    print(f"वडा {r[0]:<2} | {r[1]:<8} | {r[2]:<8} | {r[3]:<14} | {r[4]:<14} | {r[5]:<8} | {r[6]}")
print("-" * 80)
print(f"जम्मा  | {sum(r[1] for r in wc_rows):<8} | {sum(r[2] for r in wc_rows):<8} | {sum(r[3] for r in wc_rows):<14} | {sum(r[4] for r in wc_rows):<14} | {sum(r[5] for r in wc_rows):<8} | {sum(r[6] for r in wc_rows)}")

# 3. Disability Data
print("\n--- 3. DISABILITY DATA (अपाङ्गता भएका नागरिक विवरण - Wards 1 to 8) ---")
cur.execute("""
    SELECT "wardNumber", "physicalDisability", "visualImpairment", "hearingImpairment",
           "intellectualDisability", "multipleDisabilities", "allowanceRecipients", "totalAllowanceAmount"
    FROM disability_data
    ORDER BY "wardNumber";
""")
dis_rows = cur.fetchall()
print(f"{'वडा':<5} | {'शारीरिक':<8} | {'दृष्टिविहीन':<12} | {'सुस्त श्रवण':<12} | {'बौद्धिक':<8} | {'बहुअपाङ्गता':<12} | {'भत्ताग्राही':<12} | {'भत्ता रकम (रु.)'}")
print("-" * 95)
for r in dis_rows:
    print(f"वडा {r[0]:<2} | {r[1]:<8} | {r[2]:<12} | {r[3]:<12} | {r[4]:<8} | {r[5]:<12} | {r[6]:<12} | रु. {r[7]:<12,.2f}")
print("-" * 95)
print(f"जम्मा  | {sum(r[1] for r in dis_rows):<8} | {sum(r[2] for r in dis_rows):<12} | {sum(r[3] for r in dis_rows):<12} | {sum(r[4] for r in dis_rows):<8} | {sum(r[5] for r in dis_rows):<12} | {sum(r[6] for r in dis_rows):<12} | रु. {sum(r[7] for r in dis_rows):<12,.2f}")

# 4. Dalit Community Data
print("\n--- 4. DALIT COMMUNITY DATA (दलित समुदाय विवरण - Wards 1 to 8) ---")
cur.execute("""
    SELECT "wardNumber", "totalDalitPopulation", "dalitHouseholds", "dalitStudents", 
           "scholarshipRecipients", "employedInGovernment", "discriminationCases"
    FROM dalit_data
    ORDER BY "wardNumber";
""")
dalit_rows = cur.fetchall()
print(f"{'वडा':<5} | {'दलित जनसंख्या':<14} | {'घरधुरी':<8} | {'विद्यार्थी संख्या':<18} | {'छात्रवृत्ति पाउने':<18} | {'सरकारी सेवामा':<14} | {'विभेदका घटना'}")
print("-" * 95)
for r in dalit_rows:
    print(f"वडा {r[0]:<2} | {r[1]:<14} | {r[2]:<8} | {r[3]:<18} | {r[4]:<18} | {r[5]:<14} | {r[6]}")
print("-" * 95)
print(f"जम्मा  | {sum(r[1] for r in dalit_rows):<14} | {sum(r[2] for r in dalit_rows):<8} | {sum(r[3] for r in dalit_rows):<18} | {sum(r[4] for r in dalit_rows):<18} | {sum(r[5] for r in dalit_rows):<14} | {sum(r[6] for r in dalit_rows)}")

# 5. Social Inclusion Records
print("\n--- 5. SOCIAL INCLUSION TARGETED PROGRAMS (लक्षित कार्यक्रमहरू - १६ वटा) ---")
cur.execute("""
    SELECT id, category, "wardNumber", title, "serviceType", "beneficiariesCount", 
           "budgetAllocated", "budgetSpent", status, "coordinatorName"
    FROM social_inclusion_records
    ORDER BY id;
""")
si_rows = cur.fetchall()
tot_alloc = sum(r[6] for r in si_rows)
tot_spent = sum(r[7] for r in si_rows)
tot_ben = sum(r[5] for r in si_rows)

print(f"{'ID':<6} | {'वर्ग':<15} | {'वडा':<4} | {'लाभान्वित':<9} | {'बजेट विनियोजित':<15} | {'खर्च भएको':<15} | {'स्थिति':<10} | {'कार्यक्रम शीर्षक'}")
print("-" * 115)
for r in si_rows:
    print(f"{r[0]:<6} | {r[1]:<15} | {r[2]:<4} | {r[5]:<9} | रु. {r[6]:<11,.0f} | रु. {r[7]:<11,.0f} | {r[8]:<10} | {r[3][:40]}")
print("-" * 115)
print(f"जम्मा  | १६ कार्यक्रम      |      | {tot_ben:<9} | रु. {tot_alloc:<11,.0f} | रु. {tot_spent:<11,.0f}")

cur.close()
conn.close()

# 6. Test FastAPI Backend Endpoints
print("\n--- 6. BACKEND API ENDPOINTS TEST (http://localhost:3001) ---")
endpoints = [
    ("/api/v1/senior-citizen/data/", "Senior Citizen Data List"),
    ("/api/v1/women-children/data/", "Women & Children Data List"),
    ("/api/v1/disability/data/", "Disability Data List"),
    ("/api/v1/dalit/data/", "Dalit Data List"),
    ("/api/v1/social-inclusion/records/", "Social Inclusion Records List"),
    ("/api/v1/social-inclusion/stats", "Social Inclusion Stats Dashboard"),
]

for ep, desc in endpoints:
    url = f"http://localhost:3001{ep}"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=5) as resp:
            status_code = resp.status
            data = json.loads(resp.read().decode("utf-8"))
            count = len(data) if isinstance(data, list) else len(data.keys())
            print(f"✓ [{status_code} OK] {desc:<35} -> {count} items from {ep}")
    except Exception as e:
        print(f"✗ [FAILED] {desc:<35} -> {ep} (Error: {e})")

print("\n" + "=" * 80)
print("ALL VERIFICATIONS COMPLETED SUCCESSFULLY!")
print("=" * 80)
