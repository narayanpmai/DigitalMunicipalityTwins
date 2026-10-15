import sys
import psycopg2

sys.stdout.reconfigure(encoding="utf-8")

conn = psycopg2.connect("postgresql://p5admin:P5Digital%402024%21@localhost:5433/p5digital")
cur = conn.cursor()

tables = [
    "building_permits",
    "ebps_applications",
    "ebps_design_scrutiny",
    "ebps_workflow_steps",
    "ebps_field_inspections"
]

print("Checking Building Permit & EBPS tables in PostgreSQL:")
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
