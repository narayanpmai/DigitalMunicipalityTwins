import sys
import psycopg2

sys.stdout.reconfigure(encoding="utf-8")
DATABASE_URL = "postgresql://p5admin:P5Digital%402024%21@localhost:5433/p5digital"
conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor()

tables = ['library_books', 'library_borrow_records']

for t in tables:
    cur.execute(f"SELECT COUNT(*) FROM {t}")
    cnt = cur.fetchone()[0]
    print(f"=== Table: {t} (Row count: {cnt}) ===")
    cur.execute(f"""
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = '{t}'
        ORDER BY ordinal_position;
    """)
    for r in cur.fetchall():
        print(f"  {r[0]:<25} | {r[1]:<20} | Nullable: {r[2]} | Default: {r[3]}")
    
    cur.execute(f"""
        SELECT indexname, indexdef 
        FROM pg_indexes 
        WHERE tablename = '{t}';
    """)
    indexes = cur.fetchall()
    if indexes:
        print("  Indexes:")
        for idx in indexes:
            print(f"    {idx[0]}: {idx[1]}")

cur.close()
conn.close()
