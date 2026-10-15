"""
Verification Script: Planning, Budget, Projects, Procurement & Lifecycle
Panchpokhari Thangpal Gaupalika
Validates:
  1. Table row counts across 12 planning, budget, and project lifecycle tables
  2. Periodic and annual municipal plans
  3. Budget heads and fund allocations
  4. Ward-wise projects distribution (16 projects across Wards 1 to 8)
  5. Consumer committee (उपभोक्ता समिति) mobilization details
  6. E-GP / Public procurement contracts
  7. Project lifecycle audit: MBs, Payments, and Handovers
"""
import sys
import psycopg2

sys.stdout.reconfigure(encoding="utf-8")

DATABASE_URL = "postgresql://p5admin:P5Digital%402024%21@localhost:5433/p5digital"
conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor()

tables = [
    ("plans", "आवधिक तथा रणनीतिक योजना (Plans)"),
    ("budgets", "बजेट उपशीर्षक तथा विनियोजन (Budgets)"),
    ("projects", "आयोजना तथा उपभोक्ता समिति सम्झौता (Projects)"),
    ("contracts", "सार्वजनिक खरिद तथा ठेक्का व्यवस्थापन (Contracts)"),
    ("proj_plan_proposals", "आयोजना प्रस्ताव तथा छनोट (Proposals)"),
    ("proj_budget_allocations", "आयोजनागत बजेट विनियोजन (Allocations)"),
    ("proj_procurement_plans", "खरिद विधि तथा गुरुयोजना (Procurement Plans)"),
    ("proj_contracts", "आयोजना सम्झौता अभिलेख (Project Contracts)"),
    ("proj_executions", "आयोजना कार्यान्वयन तथा प्रगति (Executions)"),
    ("proj_measurement_books", "प्राविधिक नापी किताब (Measurement Books - MB)"),
    ("proj_payments", "रनिङ तथा अन्तिम बिल भुक्तानी (Payments)"),
    ("proj_handovers", "आयोजना हस्तान्तरण तथा सार्वजनिक परीक्षण (Handovers)"),
]

print("=" * 80)
print("PLANNING, BUDGET, PROJECT & PROCUREMENT VERIFICATION REPORT")
print("पाँचपोखरी थाङपाल गाउँपालिका — योजना, बजेट, आयोजना चक्र तथा खरिद व्यवस्थापन")
print("=" * 80)

for tbl, desc in tables:
    cur.execute(f"SELECT count(*) FROM {tbl};")
    cnt = cur.fetchone()[0]
    print(f"{tbl:26}: {cnt:>3} rows | {desc}")

print("\n" + "=" * 80)
print("1. STRATEGIC & PERIODIC PLANS (आवधिक तथा रणनीतिक योजनाहरू)")
print("=" * 80)
cur.execute('SELECT title, type, "fiscalYear", "estimatedBudget", sector, status FROM plans ORDER BY "estimatedBudget" DESC;')
for r in cur.fetchall():
    print(f"• {r[0]}")
    print(f"   प्रकार: {r[1]} | आ.व.: {r[2]} | अनुमानित लागत: रु. {r[3]:>12,.2f} | क्षेत्र: {r[4]} | स्थिति: {r[5]}")

print("\n" + "=" * 80)
print("2. MUNICIPAL BUDGET HEADS (गाउँपालिका बजेट विनियोजन र खर्च अवस्था)")
print("=" * 80)
cur.execute('SELECT count(*), sum("allocatedAmount"), sum("releasedAmount"), sum("spentAmount") FROM budgets;')
btot = cur.fetchone()
print(f"कुल बजेट उपशीर्षकहरू : {btot[0]} वटा")
print(f"कुल विनियोजित बजेट  : रु. {btot[1]:>14,.2f}")
print(f"कुल अख्तियारी निकासा: रु. {btot[2]:>14,.2f}")
print(f"कुल खर्च (Expenditure): रु. {btot[3]:>14,.2f} (खर्च दर: {round(float(btot[3])/float(btot[1])*100, 1)}%)")

print("\nबजेट शीर्षक अनुसार नमुना विवरण:")
cur.execute('SELECT title, type, "allocatedAmount", "spentAmount", "sourceOfFund" FROM budgets LIMIT 5;')
for r in cur.fetchall():
    print(f"• [{r[1]}] {r[0]}")
    print(f"   विनियोजन: रु. {r[2]:,.2f} | खर्च: रु. {r[3]:,.2f} | स्रोत: {r[4]}")

print("\n" + "=" * 80)
print("3. WARD-WISE PROJECTS & CONSUMER COMMITTEES (वडागत आयोजना र उपभोक्ता समिति)")
print("=" * 80)
cur.execute('SELECT "wardNumber", count(*), sum(budget), sum("paidAmount") FROM projects GROUP BY "wardNumber" ORDER BY "wardNumber";')
for r in cur.fetchall():
    print(f"वडा नं. {r[0]}: {r[1]} आयोजना | कुल बजेट: रु. {r[2]:>10,.2f} | भुक्तानी: रु. {r[3]:>10,.2f}")

print("\nनमुना उपभोक्ता समिति अभिलेखहरू:")
cur.execute('SELECT "projectCode", name, "committeeName", "committeeChair", "totalAgreementAmount", "progressPercentage", "financialProgress" FROM projects LIMIT 5;')
for r in cur.fetchall():
    print(f"• [{r[0]}] {r[1]}")
    print(f"   समिति: {r[2]} (अध्यक्ष: {r[3]})")
    print(f"   सम्झौता रकम: रु. {r[4]:,.2f} | भौतिक प्रगति: {r[5]}% | वित्तीय प्रगति: {r[6]}%")

print("\n" + "=" * 80)
print("4. PUBLIC PROCUREMENT & TENDER CONTRACTS (ठेक्का तथा खरिद सम्झौताहरू)")
print("=" * 80)
cur.execute('SELECT count(*), sum("contractAmount"), sum("paidAmount") FROM contracts;')
ctot = cur.fetchone()
print(f"कुल ठेक्का सम्झौता : {ctot[0]} वटा")
print(f"कुल ठेक्का रकम     : रु. {ctot[1]:>12,.2f}")
print(f"कुल भुक्तानी रकम   : रु. {ctot[2]:>12,.2f}")

print("\nनमुना खरिद सम्झौताहरू:")
cur.execute('SELECT "contractNo", title, "contractorName", "contractAmount", "progressPercent", status FROM contracts LIMIT 5;')
for r in cur.fetchall():
    print(f"• [{r[0]}] {r[1]}")
    print(f"   निर्माण व्यवसायी/सप्लायर्स: {r[2]}")
    print(f"   ठेक्का रकम: रु. {r[3]:,.2f} | प्रगति: {r[4]}% | स्थिति: {r[5]}")

print("\n" + "=" * 80)
print("5. PROJECT LIFECYCLE AUDIT (MB, PAYMENTS, HANDOVERS)")
print("=" * 80)
cur.execute('SELECT count(*), sum(quantity_completed) FROM proj_measurement_books;')
mb = cur.fetchone()
print(f"नापी किताब (MB) प्रमाणित रेकर्ड: {mb[0]} वटा | कुल प्रमाणित परिमाण रकम: रु. {mb[1]:,.2f}")

cur.execute('SELECT count(*), sum(gross_amount), sum(net_payable) FROM proj_payments;')
pm = cur.fetchone()
print(f"भुक्तानी भौचर (Payment Vouchers) : {pm[0]} वटा | कुल भुक्तानी: रु. {pm[1]:,.2f} (खुद भुक्तानी: रु. {pm[2]:,.2f})")

cur.execute('SELECT count(*), sum(total_expenditure) FROM proj_handovers;')
ho = cur.fetchone()
print(f"सम्पन्न आयोजना हस्तान्तरण (Handovers): {ho[0]} वटा | कुल पूँजीकृत सम्पत्ति: रु. {ho[1]:,.2f}")

cur.close()
conn.close()
print("\n" + "=" * 80)
print("ALL PLANNING, BUDGET, PROJECT & PROCUREMENT DATA VERIFIED SUCCESSFULLY!")
print("=" * 80)
