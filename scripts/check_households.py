import sys
import psycopg2

sys.stdout.reconfigure(encoding="utf-8")

conn = psycopg2.connect("postgresql://p5admin:P5Digital%402024%21@localhost:5433/p5digital")
cur = conn.cursor()

cur.execute("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'household_registries' ORDER BY ordinal_position;")
cols = cur.fetchall()
for c in cols:
    print(f"{c[0]} ({c[1]})")

cur.execute("SELECT id FROM household_registries LIMIT 5;")
print("Sample IDs:", cur.fetchall())

cur.close()
conn.close()
