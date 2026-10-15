import sys
import psycopg2

sys.stdout.reconfigure(encoding="utf-8")

conn = psycopg2.connect("postgresql://p5admin:P5Digital%402024%21@localhost:5433/p5digital")
cur = conn.cursor()

tables = [
    "waste_vehicles",
    "waste_rates",
    "waste_schedules",
    "waste_disposal_sites",
    "waste_sanitation_workers",
    "waste_alerts",
    "waste_wallets",
    "waste_transactions"
]

print("Checking waste tables:")
for t in tables:
    cur.execute(f"SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = '{t}');")
    exists = cur.fetchone()[0]
    if exists:
        cur.execute(f"SELECT count(*) FROM {t};")
        count = cur.fetchone()[0]
        cur.execute(f"SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '{t}' ORDER BY ordinal_position;")
        cols = cur.fetchall()
        col_strs = [f"{c[0]} ({c[1]})" for c in cols]
        print(f"Table '{t}': EXISTS, {count} rows")
        print(f"   Columns: {', '.join(col_strs)}")
    else:
        print(f"Table '{t}': DOES NOT EXIST")

cur.close()
conn.close()
