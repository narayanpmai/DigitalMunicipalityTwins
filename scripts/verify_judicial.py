import sys
import psycopg2

sys.stdout.reconfigure(encoding="utf-8")

conn = psycopg2.connect("postgresql://p5admin:P5Digital%402024%21@localhost:5433/p5digital")
cur = conn.cursor()

tables = [
    "judicial_mediators",
    "judicial_cases",
    "judicial_cause_list",
]

print("=" * 65)
print("JUDICIAL COMMITTEE (न्यायिक समिति) DATABASE VERIFICATION REPORT")
print("=" * 65)

for t in tables:
    cur.execute(f"SELECT count(*) FROM {t}")
    cnt = cur.fetchone()[0]
    print(f"{t:30}: {cnt:>4} rows")

print("\n" + "=" * 65)
print("CASES BY WARD")
print("=" * 65)
cur.execute('SELECT "wardNumber", count(*) FROM judicial_cases GROUP BY "wardNumber" ORDER BY "wardNumber";')
for r in cur.fetchall():
    print(f"Ward {r[0]}: {r[1]} cases registered")

print("\n" + "=" * 65)
print("CASES BY STATUS")
print("=" * 65)
cur.execute('SELECT status, count(*) FROM judicial_cases GROUP BY status ORDER BY count(*) DESC;')
for r in cur.fetchall():
    print(f"{r[0]:40}: {r[1]} cases")

print("\n" + "=" * 65)
print("CASES BY DISPUTE TYPE")
print("=" * 65)
cur.execute('SELECT "disputeType", count(*) FROM judicial_cases GROUP BY "disputeType" ORDER BY count(*) DESC;')
for r in cur.fetchall():
    print(f"{r[0]:60}: {r[1]} cases")

print("\n" + "=" * 65)
print("REGISTERED MEDIATORS BY WARD")
print("=" * 65)
cur.execute('SELECT "mediatorCode", "fullName", "wardNo", phone, specialization, "resolvedCasesCount" FROM judicial_mediators ORDER BY "wardNo";')
for r in cur.fetchall():
    print(f"[{r[0]}] {r[1]} (वडा {r[2]}): {r[4]} | सफल मेलमिलाप: {r[5]} मुद्दा")

print("\n" + "=" * 65)
print("UPCOMING BENCH CAUSE LIST (इजलास पेशी सूची)")
print("=" * 65)
cur.execute('SELECT "benchDateBs", "benchTime", "caseNo", parties, stage, status FROM judicial_cause_list ORDER BY "benchDateBs", "benchTime";')
for r in cur.fetchall():
    print(f"मिति: {r[0]} {r[1]} | {r[2]} | {r[3]} | चरण: {r[4]} [{r[5]}]")

cur.close()
conn.close()
