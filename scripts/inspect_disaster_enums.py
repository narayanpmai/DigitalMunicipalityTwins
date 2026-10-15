import psycopg2
import sys

sys.stdout.reconfigure(encoding='utf-8')

conn = psycopg2.connect('postgresql://p5admin:P5Digital%402024%21@localhost:5433/p5digital')
cur = conn.cursor()

cur.execute("""
    SELECT 
        c.column_name, 
        t.typname AS enum_name,
        array_agg(e.enumlabel ORDER BY e.enumsortorder) AS enum_values
    FROM information_schema.columns c
    JOIN pg_type t ON c.udt_name = t.typname
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE c.table_name = 'disaster_events'
    GROUP BY c.column_name, t.typname;
""")

for row in cur.fetchall():
    print(f"Column '{row[0]}' ({row[1]}): {row[2]}")

cur.close()
conn.close()
