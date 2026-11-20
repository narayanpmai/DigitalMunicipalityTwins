import os
import sys

sys.path.append('fastapi-backend')
from core.database import SessionLocal
from models.recruitment import (
    JobApplication,
    RecruitmentPayment,
    RecruitmentAuditLog,
    RecruitmentRefund
)
from sqlalchemy import text

def execute_cleanse():
    print("=== STARTING RECRUITMENT PRODUCTION CLEANSE ===")
    db = SessionLocal()
    try:
        apps = db.query(JobApplication).all()
        print(f"Found {len(apps)} test applications to purge:")
        for a in apps:
            print(f" - ID: {a.id}, ApplicationNo: {a.application_no}, Candidate: {a.full_name_np}")

        # Gather files to remove
        files_to_remove = []
        for a in apps:
            for field in [a.photo_url, a.signature_url, a.citizenship_doc_url, a.qualification_doc_url, a.council_doc_url, a.experience_doc_url, a.payment_voucher_doc_url]:
                if field and field.startswith('/uploads/'):
                    clean_path = os.path.join(os.getcwd(), 'fastapi-backend', field.lstrip('/'))
                    if os.path.exists(clean_path):
                        files_to_remove.append(clean_path)
                    clean_path2 = os.path.join(os.getcwd(), 'frontend', 'public', field.lstrip('/'))
                    if os.path.exists(clean_path2):
                        files_to_remove.append(clean_path2)

        # Delete from dependent tables
        print("1. Deleting dependent records...")
        deleted_payments = db.query(RecruitmentPayment).delete()
        print(f" - Deleted {deleted_payments} records from recruitment_payments")
        
        deleted_refunds = db.query(RecruitmentRefund).delete()
        print(f" - Deleted {deleted_refunds} records from recruitment_refunds")
        
        deleted_audits = db.query(RecruitmentAuditLog).delete()
        print(f" - Deleted {deleted_audits} records from recruitment_audit_logs")

        # Delete applications
        print("2. Deleting job applications...")
        deleted_apps = db.query(JobApplication).delete()
        print(f" - Deleted {deleted_apps} records from recruitment_applications")

        db.commit()
        print("3. Database transaction committed successfully!")

        # Clean physical test files
        print("4. Cleaning physical test files...")
        removed_count = 0
        for f in files_to_remove:
            try:
                if os.path.exists(f):
                    os.remove(f)
                    removed_count += 1
            except Exception as e:
                print(f"   Could not remove {f}: {e}")
        print(f" - Removed {removed_count} test upload files")

        # Verify
        remaining_apps = db.query(JobApplication).count()
        print(f"\n=== VERIFICATION: Total JobApplications in DB = {remaining_apps} ===")
        if remaining_apps == 0:
            print("SUCCESS: Zero dummy applications remaining. Recruitment database is now clean for live production!")
        else:
            print("WARNING: Some applications still remain!")

    except Exception as e:
        db.rollback()
        print(f"ERROR during cleanse: {e}")
        raise
    finally:
        db.close()

if __name__ == '__main__':
    execute_cleanse()
