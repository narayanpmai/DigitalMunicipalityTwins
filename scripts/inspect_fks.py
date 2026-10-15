import psycopg2

conn = psycopg2.connect('postgresql://p5admin:P5Digital%402024%21@localhost:5433/p5digital')
cur = conn.cursor()
cur.execute("""
    SELECT conname, pg_get_constraintdef(c.oid) 
    FROM pg_constraint c 
    WHERE conrelid = 'c360_citizen_applications'::regclass;
""")
for r in cur.fetchall():
    print(r)
cur.close()
conn.close()
