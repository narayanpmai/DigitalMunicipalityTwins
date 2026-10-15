import psycopg2
import sys

sys.stdout.reconfigure(encoding='utf-8')

conn = psycopg2.connect('postgresql://p5admin:P5Digital%402024%21@localhost:5433/p5digital')
cur = conn.cursor()
cur.execute('''
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema='public' AND table_type='BASE TABLE'
    ORDER BY table_name;
''')
tables = [row[0] for row in cur.fetchall()]
print(f"Total Database Tables: {len(tables)}")

empty_tables = []
populated_tables = []
for t in tables:
    try:
        cur.execute(f'SELECT COUNT(*) FROM "{t}";')
        cnt = cur.fetchone()[0]
        if cnt == 0:
            empty_tables.append(t)
        else:
            populated_tables.append((t, cnt))
    except Exception as e:
        empty_tables.append(f"{t} (error: {e})")

print(f"\nPopulated Tables ({len(populated_tables)}):")
for t, cnt in sorted(populated_tables, key=lambda x: -x[1]):
    print(f"  {t}: {cnt} rows")

print(f"\nEmpty Tables ({len(empty_tables)}):")
for t in sorted(empty_tables):
    print(f"  {t}")
