import sys
import psycopg2

sys.stdout.reconfigure(encoding="utf-8")

conn = psycopg2.connect("postgresql://p5admin:P5Digital%402024%21@localhost:5433/p5digital")
cur = conn.cursor()

cur.execute("""
    SELECT e.enumlabel 
    FROM pg_type t 
    JOIN pg_enum e ON t.oid = e.enumtypid  
    JOIN information_schema.columns c ON c.udt_name = t.typname 
    WHERE c.table_name = 'contracts' AND c.column_name = 'status';
""")
rows = cur.fetchall()
print("Enum values for contracts.status:", [r[0] for r in rows])

cur.close()
conn.close()
