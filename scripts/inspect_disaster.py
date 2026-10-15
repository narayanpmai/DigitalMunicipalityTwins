import psycopg2
import sys

sys.stdout.reconfigure(encoding='utf-8')

conn = psycopg2.connect('postgresql://p5admin:P5Digital%402024%21@localhost:5433/p5digital')
cur = conn.cursor()

cur.execute("""
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND (
        table_name LIKE '%disaster%' OR 
        table_name LIKE '%incident%' OR 
        table_name LIKE '%alert%' OR 
        table_name LIKE '%emergency%' OR 
        table_name LIKE '%hazard%' OR
        table_name LIKE '%drr%'
      )
    ORDER BY table_name;
""")
tables = [r[0] for r in cur.fetchall()]
print(f"Found {len(tables)} disaster-related tables in public schema:")
for t in tables:
    cur.execute(f'SELECT count(*) FROM "{t}"')
    print(f"  - {t}: {cur.fetchone()[0]} rows")

cur.close()
conn.close()
