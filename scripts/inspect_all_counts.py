"""
List all tables in public schema with their row count
"""
import psycopg2

DATABASE_URL = "postgresql://p5admin:P5Digital%402024%21@localhost:5433/p5digital"
conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor()

cur.execute("""
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema='public'
    ORDER BY table_name;
""")
tables = [r[0] for r in cur.fetchall()]

zero_tables = []
low_tables = []
rich_tables = []

for t in tables:
    try:
        cur.execute(f"SELECT COUNT(*) FROM {t}")
        cnt = cur.fetchone()[0]
        if cnt == 0:
            zero_tables.append((t, cnt))
        elif cnt < 10:
            low_tables.append((t, cnt))
        else:
            rich_tables.append((t, cnt))
    except Exception as e:
        print(f"Error on {t}: {e}")

print(f"Total Tables: {len(tables)}")
print(f"\nTables with 0 rows ({len(zero_tables)}):")
for t, cnt in zero_tables:
    print(f"  {t:<35} : {cnt}")

print(f"\nTables with < 10 rows ({len(low_tables)}):")
for t, cnt in low_tables:
    print(f"  {t:<35} : {cnt}")

cur.close()
conn.close()
