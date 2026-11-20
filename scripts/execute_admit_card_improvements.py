import sys
import os
import psycopg

P5ADMIN_URL = "postgresql://p5admin:P5_Prod_Secure_Passwd_2026!@localhost:5432/municipal_twin_db"

def run_migration():
    print("Connecting as p5admin (table owner)...")
    with psycopg.connect(P5ADMIN_URL) as conn:
        with conn.cursor() as cur:
            # 1. Add exam_center to recruitment_vacancies
            cur.execute("""
                ALTER TABLE recruitment_vacancies 
                ADD COLUMN IF NOT EXISTS exam_center VARCHAR(255);
            """)
            print("Added exam_center column to recruitment_vacancies.")

            # 2. Add chalani_no to recruitment_applications
            cur.execute("""
                ALTER TABLE recruitment_applications 
                ADD COLUMN IF NOT EXISTS chalani_no VARCHAR(100);
            """)
            print("Added chalani_no column to recruitment_applications.")

            # 3. Grant privileges to muni_user
            cur.execute("""
                GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO muni_user;
                GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO muni_user;
            """)
            print("Granted all privileges to muni_user.")

            # 4. Update existing vacancies with default exam_center and exam_date_bs
            cur.execute("""
                UPDATE recruitment_vacancies 
                SET 
                    exam_center = 'पाँचपोखरी थाङपाल मा.वि., वडा नं ६, सिन्धुपाल्चोक',
                    exam_date_bs = '२०८३-०९-१५ बिहान ११:०० बजे'
                WHERE vacancy_no = '०४/२०८३/०८४';
            """)
            cur.execute("""
                UPDATE recruitment_vacancies 
                SET 
                    exam_center = 'पाँचपोखरी थाङपाल मा.वि., वडा नं ६, सिन्धुपाल्चोक'
                WHERE exam_center IS NULL;
            """)
            print("Updated vacancies with default exam_center.")

            # 5. Migrate APP-2081-0002 to PTRM-2083-0002 (Narayan Chhetri)
            cur.execute("""
                UPDATE recruitment_applications
                SET 
                    application_no = 'PTRM-2083-0002',
                    admit_card_roll_no = '2083-ROLL-352',
                    chalani_no = '३५२',
                    exam_center = 'पाँचपोखरी थाङपाल मा.वि., वडा नं ६, सिन्धुपाल्चोक',
                    exam_date_time = '२०८३-०९-१५ बिहान ११:०० बजे'
                WHERE application_no = 'APP-2081-0002' OR citizenship_no = '126049';
            """)
            print(f"Migrated Narayan Chhetri application: {cur.rowcount} row(s) updated.")

            # Update dependent payment records
            cur.execute("""
                UPDATE recruitment_payments
                SET application_no = 'PTRM-2083-0002'
                WHERE application_no = 'APP-2081-0002';
            """)

            # Update audit logs
            cur.execute("""
                UPDATE recruitment_audit_logs
                SET entity_id = 'PTRM-2083-0002'
                WHERE entity_id = 'APP-2081-0002';
            """)

            # 6. Migrate APP-2081-0004 to PTRM-2083-0004 (Ram Bahadur Shrestha)
            cur.execute("""
                UPDATE recruitment_applications
                SET 
                    application_no = 'PTRM-2083-0004',
                    admit_card_roll_no = '2083-ROLL-921',
                    chalani_no = '९२१',
                    exam_center = 'पाँचपोखरी थाङपाल मा.वि., वडा नं ६, सिन्धुपाल्चोक',
                    exam_date_time = '२०८३-०९-१५ बिहान ११:०० बजे'
                WHERE application_no = 'APP-2081-0004';
            """)
            print(f"Migrated Ram Bahadur Shrestha application: {cur.rowcount} row(s) updated.")

            # Update dependent payment records
            cur.execute("""
                UPDATE recruitment_payments
                SET application_no = 'PTRM-2083-0004'
                WHERE application_no = 'APP-2081-0004';
            """)

            # Update audit logs
            cur.execute("""
                UPDATE recruitment_audit_logs
                SET entity_id = 'PTRM-2083-0004'
                WHERE entity_id = 'APP-2081-0004';
            """)

            conn.commit()

            # Verify
            cur.execute("""
                SELECT application_no, full_name_np, admit_card_roll_no, chalani_no, exam_center, exam_date_time 
                FROM recruitment_applications 
                ORDER BY created_at ASC;
            """)
            rows = cur.fetchall()
            print("\nUpdated Applications in DB:")
            for r in rows:
                print(f"  * App: {r[0]} | Name: {r[1]} | Roll: {r[2]} | Chalani: {r[3]} | Center: {r[4]}")

            cur.execute("""
                SELECT vacancy_no, title, exam_date_bs, exam_center 
                FROM recruitment_vacancies 
                ORDER BY created_at ASC;
            """)
            v_rows = cur.fetchall()
            print("\nUpdated Vacancies in DB:")
            for v in v_rows:
                print(f"  * Vacancy: {v[0]} | {v[1]} | Date: {v[2]} | Center: {v[3]}")

    print("\nMigration finished successfully!")

if __name__ == '__main__':
    run_migration()
