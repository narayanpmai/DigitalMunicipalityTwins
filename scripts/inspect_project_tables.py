import sys
import psycopg2

sys.stdout.reconfigure(encoding="utf-8")

conn = psycopg2.connect("postgresql://p5admin:P5Digital%402024%21@localhost:5433/p5digital")
cur = conn.cursor()

tables = [
    "plans",
    "projects",
    "contracts",
    "budgets",
    "budget_allocations",
    "proj_plan_proposals",
    "proj_budget_allocations",
    "proj_procurement_plans",
    "proj_contracts",
    "proj_executions",
    "proj_measurement_books",
    "proj_payments",
    "proj_handovers"
]

print("Checking Project, Planning, Contract, and Lifecycle tables:")
for t in tables:
    cur.execute(f"SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = '{t}');")
    exists = cur.fetchone()[0]
    if exists:
        cur.execute(f"SELECT count(*) FROM {t};")
        cnt = cur.fetchone()[0]
        cur.execute(f"SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '{t}' ORDER BY ordinal_position;")
        cols = cur.fetchall()
        print(f"Table '{t}': EXISTS ({cnt} rows)")
        print(f"   Columns ({len(cols)}): {', '.join([c[0] for c in cols])}")
    else:
        print(f"Table '{t}': DOES NOT EXIST")

cur.close()
conn.close()
