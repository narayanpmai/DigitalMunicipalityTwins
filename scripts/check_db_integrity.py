import sys
sys.path.append('fastapi-backend')
from core.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    print('=== Database Table Counts ===')
    for tbl in ['recruitment_applications', 'recruitment_payments', 'recruitment_audit_logs', 'employees']:
        try:
            cnt = conn.execute(text(f'SELECT count(*) FROM {tbl}')).scalar()
            print(f'  {tbl}: {cnt} rows')
        except Exception as e:
            print(f'  {tbl}: Error {e}')

    print('\n=== Unpaid vs Paid Applications ===')
    rows = conn.execute(text('''
        SELECT payment_status, status, count(*) 
        FROM recruitment_applications 
        GROUP BY payment_status, status
    ''')).fetchall()
    for r in rows:
        print(f'  Payment Status: {r[0]}, App Status: {r[1]}, Count: {r[2]}')

    dups = conn.execute(text('''
        SELECT application_no, count(*) 
        FROM recruitment_applications 
        GROUP BY application_no 
        HAVING count(*) > 1
    ''')).fetchall()
    print(f'  Duplicate application_no: {len(dups)}')

    dups_emp = conn.execute(text('''
        SELECT "employeeId", count(*) 
        FROM employees 
        WHERE "employeeId" IS NOT NULL 
        GROUP BY "employeeId" 
        HAVING count(*) > 1
    ''')).fetchall()
    print(f'  Duplicate employeeId: {len(dups_emp)}')
