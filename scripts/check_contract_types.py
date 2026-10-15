import sys
import psycopg2

sys.stdout.reconfigure(encoding="utf-8")

conn = psycopg2.connect("postgresql://p5admin:P5Digital%402024%21@localhost:5433/p5digital")
cur = conn.cursor()

cur.execute("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'contracts' ORDER BY ordinal_position;")
for r in cur.fetchall():
    print(f"contracts.{r[0]}: {r[1]}")

cur.close()
conn.close()
