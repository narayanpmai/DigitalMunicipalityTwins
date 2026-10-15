import sys
import psycopg2

sys.stdout.reconfigure(encoding="utf-8")
DATABASE_URL = "postgresql://p5admin:P5Digital%402024%21@localhost:5433/p5digital"
conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor()

for t in ['employment_labour_bank', 'employment_projects']:
    print(f"=== {t} ===")
    cur.execute(f"SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '{t}' ORDER BY ordinal_position")
    for r in cur.fetchall():
        print(f"  {r[0]}: {r[1]}")

cur.close()
conn.close()
