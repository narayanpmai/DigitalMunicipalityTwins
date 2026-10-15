import psycopg2

conn = psycopg2.connect('postgresql://p5admin:P5Digital%402024%21@localhost:5433/p5digital')
cur = conn.cursor()
cur.execute("""
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'mdm_citizens'
    ORDER BY ordinal_position;
""")
for r in cur.fetchall():
    print(r)

cur.execute("""
    SELECT conname, pg_get_constraintdef(c.oid) 
    FROM pg_constraint c 
    WHERE conrelid = 'mdm_citizens'::regclass;
""")
print("Constraints:")
for r in cur.fetchall():
    print(r)
cur.close()
conn.close()
