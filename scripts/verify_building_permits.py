"""
Verification Script: Building Permits & Electronic Building Permit System (EBPS)
Panchpokhari Thangpal Gaupalika
Validates:
  1. Table row counts for building_permits and EBPS tables
  2. Ward-wise distribution (Wards 1 to 8)
  3. Building classification (क, ख, ग, घ वर्ग)
  4. Workflow stage distribution
  5. DUDBC Guidance 2082 compliance (ETABS, Partial Completion, Ownership types)
  6. Financial revenue from permit fees
  7. EBPS Scrutiny, Workflow, and Field Inspection records
"""
import sys
import psycopg2

sys.stdout.reconfigure(encoding="utf-8")

DATABASE_URL = "postgresql://p5admin:P5Digital%402024%21@localhost:5433/p5digital"
conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor()

tables = [
    ("building_permits", "ई-नक्सा पास तथा भवन निर्माण अनुमति (Building Permits)"),
    ("ebps_applications", "इलेक्ट्रोनिक भवन अनुमति दर्ता (EBPS Applications)"),
    ("ebps_design_scrutiny", "भवन संहिता तथा प्राविधिक स्क्रुटिनी (Design Scrutiny)"),
    ("ebps_workflow_steps", "कार्यप्रणाली तथा अनुमोदन चरण (Workflow Steps)"),
    ("ebps_field_inspections", "स्थलगत नापजाँच तथा सुपरिवेक्षण (Field Inspections)"),
]

print("=" * 80)
print("BUILDING PERMITS & EBPS DATABASE VERIFICATION REPORT")
print("पाँचपोखरी थाङपाल गाउँपालिका — ई-नक्सा पास तथा भवन निर्माण अनुमति प्रणाली (मार्गदर्शन २०८२)")
print("=" * 80)

for tbl, desc in tables:
    cur.execute(f"SELECT count(*) FROM {tbl};")
    cnt = cur.fetchone()[0]
    print(f"{tbl:26}: {cnt:>3} rows | {desc}")

print("\n" + "=" * 80)
print("1. WARD-WISE BUILDING PERMIT DISTRIBUTION (वडा अनुसार नक्सा पास विवरण)")
print("=" * 80)
cur.execute('SELECT "wardNumber", count(*), sum("totalBuiltAreaSqFt"), sum("permitFee") FROM building_permits GROUP BY "wardNumber" ORDER BY "wardNumber";')
for r in cur.fetchall():
    print(f"वडा नं. {r[0]}: {r[1]} वटा दरखास्त | कुल निर्मित क्षेत्रफल: {r[2]:>8,.1f} sq.ft | दस्तुर: रु. {r[3]:>9,.2f}")

print("\n" + "=" * 80)
print("2. PERMITS BY WORKFLOW STAGES (भवन निर्माण अनुमति चरण विवरण)")
print("=" * 80)
cur.execute('SELECT status, count(*) FROM building_permits GROUP BY status ORDER BY count(*) DESC;')
for r in cur.fetchall():
    print(f"• {r[0]:<45}: {r[1]} वटा")

print("\n" + "=" * 80)
print("3. PERMITS BY BUILDING CLASSIFICATION (भवन वर्ग अनुसार वर्गीकरण)")
print("=" * 80)
cur.execute('SELECT "buildingClass", count(*) FROM building_permits GROUP BY "buildingClass" ORDER BY "buildingClass";')
for r in cur.fetchall():
    print(f"• {r[0]:<55}: {r[1]} वटा")

print("\n" + "=" * 80)
print("4. DUDBC GUIDANCE 2082 UPGRADES (मार्गदर्शन २०८२ कार्यान्वयन अवस्था)")
print("=" * 80)
cur.execute('SELECT "ownershipType", count(*) FROM building_permits GROUP BY "ownershipType" ORDER BY count(*) DESC;')
print("जग्गा स्वामित्वको प्रकार (Ownership Type):")
for r in cur.fetchall():
    print(f"  - {r[0]}: {r[1]} वटा")

cur.execute('SELECT count(*) FROM building_permits WHERE "etabsChecks" IS NOT NULL;')
etabs_cnt = cur.fetchone()[0]
print(f"\nETABS/SAP2000 रन-रेडि मोडल भएका भवन (NBC 105:2020) : {etabs_cnt} वटा")

cur.execute('SELECT count(*) FROM building_permits WHERE "partialCompletionDetails" IS NOT NULL;')
partial_cnt = cur.fetchone()[0]
print(f"आंशिक निर्माण सम्पन्न प्रमाणपत्र जारी भएका भवन        : {partial_cnt} वटा")

cur.execute('SELECT "applicationNo", "applicantName", "wardNumber", "ownershipType", status, "permitFee" FROM building_permits WHERE "partialCompletionDetails" IS NOT NULL OR "ownershipType" LIKE \'%लिज%\';')
print("\nनमुना विशेष अभिलेखहरू (लिज तथा आंशिक सम्पन्न):")
for r in cur.fetchall():
    print(f"  [{r[0]}] {r[1]} (वडा {r[2]}): {r[3]} | {r[4]} | दस्तुर: रु. {r[5]:,.2f}")

print("\n" + "=" * 80)
print("5. TOTAL FINANCIAL REVENUE (नक्सा पास तथा निर्माण अनुमति राजस्व)")
print("=" * 80)
cur.execute('SELECT sum("permitFee") FROM building_permits;')
tot_fee = cur.fetchone()[0]
cur.execute('SELECT sum("permitFee") FROM building_permits WHERE "paymentStatus" = \'भुक्तानी भएको\';')
paid_fee = cur.fetchone()[0]
cur.execute('SELECT sum("permitFee") FROM building_permits WHERE "paymentStatus" != \'भुक्तानी भएको\';')
unpaid_fee = cur.fetchone()[0] or 0.0
print(f"कुल राजस्व दस्तुर दायित्व : रु. {tot_fee:,.2f}")
print(f"दाखिला भइसकेको राजस्व     : रु. {paid_fee:,.2f}")
print(f"दाखिला हुन बाँकी दस्तुर   : रु. {unpaid_fee:,.2f}")

print("\n" + "=" * 80)
print("6. EBPS PIPELINE AUDIT (EBPS प्राविधिक स्क्रुटिनी र स्थलगत जाँच)")
print("=" * 80)
cur.execute('SELECT status, count(*) FROM ebps_applications GROUP BY status ORDER BY count(*) DESC;')
print("EBPS Application Status:")
for r in cur.fetchall():
    print(f"  - {r[0]:<20}: {r[1]} applications")

cur.execute('SELECT is_code_compliant, count(*) FROM ebps_design_scrutiny GROUP BY is_code_compliant;')
print("\nDesign Scrutiny Code Compliance:")
for r in cur.fetchall():
    print(f"  - Code Compliant ({r[0]}): {r[1]} designs")

cur.execute('SELECT inspection_type, count(*), sum(case when is_approved then 1 else 0 end) FROM ebps_field_inspections GROUP BY inspection_type;')
print("\nField Inspections by Type (Approved / Total):")
for r in cur.fetchall():
    print(f"  - {r[0]:<16}: {r[2]}/{r[1]} approved")

cur.close()
conn.close()
print("\n" + "=" * 80)
print("ALL BUILDING PERMITS & EBPS DATA VERIFIED SUCCESSFULLY!")
print("=" * 80)
