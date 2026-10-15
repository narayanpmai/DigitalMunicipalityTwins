import psycopg2
import sys

sys.stdout.reconfigure(encoding='utf-8')

conn = psycopg2.connect('postgresql://p5admin:P5Digital%402024%21@localhost:5433/p5digital')
cur = conn.cursor()

for tbl in ['payments', 'esrv_payments']:
    cur.execute("""
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = %s
        ORDER BY ordinal_position;
    """, (tbl,))
    cols = cur.fetchall()
    print(f"\n--- {tbl} ({len(cols)} columns) ---")
    for c in cols:
        print(f"  {c[0]} ({c[1]}, nullable={c[2]})")

cur.close()
conn.close()
