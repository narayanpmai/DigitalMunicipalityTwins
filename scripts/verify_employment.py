"""
Verification script for Option 21: Employment, Labour Bank & Social Protection
Checks PostgreSQL database rows and tests FastAPI live endpoints on http://localhost:3001
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
print("1. DATABASE VERIFICATION (POSTGRESQL)")
print("=" * 80)

tables = [
    ("employment_projects", "PMEP सामुदायिक पूर्वाधार आयोजनाहरू"),
    ("employment_labour_bank", "स्थानीय श्रम बैंक (सूचीकृत श्रमिकहरू)"),
    ("employment_work_logs", "मस्टर रोल तथा दैनिक कार्य लग"),
    ("employment_labour_demands", "रोजगारदाता तथा ठेकेदार श्रम माग"),
    ("recruitment_vacancies", "करार सेवा विज्ञापन / रिक्त पद सूचना"),
    ("recruitment_applications", "अनलाइन दरखास्त फारामहरू")
]

for tbl, desc in tables:
    cur.execute(f"SELECT COUNT(*) FROM {tbl};")
    cnt = cur.fetchone()[0]
    print(f"  • {desc:<45} ({tbl}): {cnt:>3} rows")

# Detailed aggregation from DB
cur.execute("""
    SELECT 
        COUNT(*) as total_workers,
        SUM(CASE WHEN "totalDaysWorked" >= 100 THEN 1 ELSE 0 END) as completed_100,
        SUM("totalDaysWorked") as total_days,
        SUM("totalWagePaid") as total_wage
    FROM employment_labour_bank;
""")
r = cur.fetchone()
print("\n[श्रम बैंक सारांश तथ्याङ्क]:")
print(f"  • कुल सूचीकृत बेरोजगार श्रमिक: {r[0]} जना")
print(f"  • १०० दिन रोजगारी सम्पन्न गर्ने श्रमिक: {r[1]} जना")
print(f"  • सिर्जना गरिएको कुल मानव-दिन (Person-Days): {r[2]} दिन")
print(f"  • भुक्तानी भएको कुल ज्याला रकम: रु. {float(r[3] or 0):,.2f}")

cur.execute("""
    SELECT "wardNumber", COUNT(*), SUM("totalDaysWorked"), SUM("totalWagePaid")
    FROM employment_labour_bank
    GROUP BY "wardNumber"
    ORDER BY "wardNumber";
""")
print("\n[वडागत श्रम बैंक वितरण]:")
for row in cur.fetchall():
    print(f"  वडा नं {row[0]}: श्रमिक {row[1]} जना | काम गरेको {row[2]} दिन | कुल ज्याला: रु. {float(row[3] or 0):,.2f}")

cur.close()
conn.close()

print("\n" + "=" * 80)
print("2. API ENDPOINT VERIFICATION (FASTAPI BACKEND - PORT 3001)")
print("=" * 80)

endpoints = [
    ("Employment Summary", "http://localhost:3001/api/v1/employment/summary"),
    ("PMEP Projects List", "http://localhost:3001/api/v1/employment/projects"),
    ("Labour Bank Workers", "http://localhost:3001/api/v1/employment/labour-bank"),
    ("Muster Roll Work Logs", "http://localhost:3001/api/v1/employment/work-logs"),
    ("Labour Demands", "http://localhost:3001/api/v1/employment/demands"),
    ("Recruitment Summary", "http://localhost:3001/api/v1/recruitment/summary"),
    ("Recruitment Vacancies", "http://localhost:3001/api/v1/recruitment/vacancies"),
    ("Recruitment Applications", "http://localhost:3001/api/v1/recruitment/applications")
]

for name, url in endpoints:
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "P5-VerifyScript"})
        with urllib.request.urlopen(req, timeout=5) as response:
            status_code = response.status
            content = response.read().decode("utf-8")
            data = json.loads(content)
            count = len(data) if isinstance(data, list) else len(data.keys())
            print(f"  ✓ {name:<26} [{status_code} OK] -> {count} items/keys returned")
    except Exception as e:
        print(f"  ✗ {name:<26} -> ERROR: {e}")

# Sample API summary payload check
print("\n[API /api/v1/employment/summary Payload]:")
try:
    with urllib.request.urlopen("http://localhost:3001/api/v1/employment/summary") as res:
        summary_data = json.loads(res.read().decode("utf-8"))
        print(json.dumps(summary_data, ensure_ascii=False, indent=2))
except Exception as e:
    print(f"Error fetching summary: {e}")

print("\n[API /api/v1/recruitment/summary Payload]:")
try:
    with urllib.request.urlopen("http://localhost:3001/api/v1/recruitment/summary") as res:
        rec_data = json.loads(res.read().decode("utf-8"))
        print(json.dumps(rec_data, ensure_ascii=False, indent=2))
except Exception as e:
    print(f"Error fetching recruitment summary: {e}")

print("\nOption 21 verification completed successfully!")
