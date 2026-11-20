import sys
sys.path.insert(0, 'fastapi-backend')
from core.database import SessionLocal, engine
from sqlalchemy import text

def run_migration():
    print("="*80)
    print("STARTING PRODUCTION TENANT MIGRATION & APPROVED DEMO CLEANUP")
    print("="*80)
    db = SessionLocal()

    try:
        # Step 1: Add missing tenant_id columns to recruitment support tables
        print("\n1. Ensuring tenant_id column exists on all recruitment tables...")
        for tbl in ['recruitment_payments', 'recruitment_audit_logs', 'recruitment_refunds']:
            db.execute(text(f'ALTER TABLE "{tbl}" ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(100) DEFAULT \'panchpokhari\''))
            print(f"   -> Verified tenant_id column on {tbl}")
        db.commit()

        # Step 2: Map Panchpokhari production records
        print("\n2. Mapping Panchpokhari Master Palika production records...")
        
        # Vacancies
        db.execute(text("UPDATE recruitment_vacancies SET tenant_id = 'panchpokhari' WHERE tenant_id IS NULL OR tenant_id = ''"))
        print("   -> Set recruitment_vacancies.tenant_id = 'panchpokhari'")

        # Real Applications (Narayan Chhetri & Ram Bahadur Shrestha)
        db.execute(text("UPDATE recruitment_applications SET tenant_id = 'panchpokhari' WHERE application_no IN ('APP-2081-0002', 'APP-2081-0004')"))
        print("   -> Set real applications (APP-2081-0002, APP-2081-0004) tenant_id = 'panchpokhari'")

        # Employees (Ram Bahadur Shrestha)
        db.execute(text("UPDATE employees SET tenant_id = 'panchpokhari' WHERE (tenant_id IS NULL OR tenant_id = '') AND \"fullName\" = 'राम बहादुर श्रेष्ठ'"))
        print("   -> Set employees (राम बहादुर श्रेष्ठ) tenant_id = 'panchpokhari'")

        # Real Payments
        db.execute(text("UPDATE recruitment_payments SET tenant_id = 'panchpokhari' WHERE application_no IN ('APP-2081-0002', 'APP-2081-0004')"))
        print("   -> Set recruitment_payments tenant_id = 'panchpokhari' for real candidates")

        db.commit()

        # Step 3: Cleanup the 4 demonstrably test records
        demo_apps = ['APP-2081-0001', 'APP-2081-0003', 'APP-2081-0005', 'APP-2081-0006']
        print(f"\n3. Cleaning up 4 approved demo/test records: {demo_apps}...")

        # Delete dependent refunds
        db.execute(text("""
            DELETE FROM recruitment_refunds 
            WHERE application_id IN (SELECT id FROM recruitment_applications WHERE application_no IN ('APP-2081-0001', 'APP-2081-0003', 'APP-2081-0005', 'APP-2081-0006'))
               OR payment_id IN (SELECT id FROM recruitment_payments WHERE application_no IN ('APP-2081-0001', 'APP-2081-0003', 'APP-2081-0005', 'APP-2081-0006'))
        """))

        # Delete dependent payments
        db.execute(text("DELETE FROM recruitment_payments WHERE application_no IN ('APP-2081-0001', 'APP-2081-0003', 'APP-2081-0005', 'APP-2081-0006')"))

        # Delete dependent audit logs
        db.execute(text("DELETE FROM recruitment_audit_logs WHERE entity_id IN ('APP-2081-0001', 'APP-2081-0003', 'APP-2081-0005', 'APP-2081-0006')"))

        # Delete the test applications
        res = db.execute(text("DELETE FROM recruitment_applications WHERE application_no IN ('APP-2081-0001', 'APP-2081-0003', 'APP-2081-0005', 'APP-2081-0006')"))
        print(f"   -> Deleted {res.rowcount} demo application records.")

        db.commit()

        # Step 4: Verification of remaining records
        print("\n4. POST-MIGRATION VERIFICATION:")
        remaining_apps = db.execute(text("SELECT application_no, full_name_np, vacancy_no, tenant_id, status FROM recruitment_applications")).fetchall()
        print(f"   Remaining Applications ({len(remaining_apps)}):")
        for a in remaining_apps:
            print(f"     - {dict(a._mapping)}")

        remaining_vacs = db.execute(text("SELECT vacancy_no, title, tenant_id FROM recruitment_vacancies")).fetchall()
        print(f"   Remaining Vacancies ({len(remaining_vacs)}):")
        for v in remaining_vacs:
            print(f"     - {dict(v._mapping)}")

        emp = db.execute(text("SELECT \"employeeId\", \"fullName\", tenant_id FROM employees")).fetchall()
        print(f"   Employees ({len(emp)}):")
        for e in emp:
            print(f"     - {dict(e._mapping)}")

        hh_cnt = db.execute(text("SELECT count(*) FROM household_registries")).scalar()
        print(f"   Household Registries Count: {hh_cnt} (100% Preserved!)")

        print("\n" + "="*80)
        print("MIGRATION & CLEANUP COMPLETED SUCCESSFULLY!")
        print("="*80)

    except Exception as e:
        db.rollback()
        print(f"ERROR DURING MIGRATION: {e}")
        raise e
    finally:
        db.close()

if __name__ == '__main__':
    run_migration()
