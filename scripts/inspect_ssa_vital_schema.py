import psycopg2

conn = psycopg2.connect(host='localhost', port=5432, dbname='municipal_db', user='postgres', password='postgres')
cur = conn.cursor()

cur.execute("SELECT column_name, data_type FROM information_schema.columns WHERE table_name='social_security_beneficiaries' ORDER BY ordinal_position")
print('=== social_security_beneficiaries ===')
for r in cur.fetchall():
    print(r)

cur.execute("SELECT column_name, data_type FROM information_schema.columns WHERE table_name='vital_events' ORDER BY ordinal_position")
print('\n=== vital_events ===')
for r in cur.fetchall():
    print(r)

# Count existing records
cur.execute("SELECT COUNT(*) FROM social_security_beneficiaries")
print('\nSSA count:', cur.fetchone()[0])

cur.execute("SELECT COUNT(*) FROM vital_events")
print('Vital events count:', cur.fetchone()[0])

cur.close()
conn.close()
