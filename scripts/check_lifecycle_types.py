import sys
import psycopg2

sys.stdout.reconfigure(encoding="utf-8")

conn = psycopg2.connect("postgresql://p5admin:P5Digital%402024%21@localhost:5433/p5digital")
cur = conn.cursor()

lifecycle_tables = [
    "proj_measurement_books",
    "proj_payments",
    "proj_handovers"
]

for t in lifecycle_tables:
    cur.execute(f"SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '{t}' ORDER BY ordinal_position;")
    cols = cur.fetchall()
    print(f"\nTable {t}:")
    for c in cols:
        print(f"  {c[0]}: {c[1]}")

cur.close()
conn.close()
