import sys
import os

# Add backend directory to path
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "fastapi-backend"))
sys.path.insert(0, backend_path)

from core.database import SessionLocal
from models.user import User
from core.security import hash_password

def main():
    if len(sys.argv) < 3:
        print("Usage: python reset_admin_password.py <email> <new_password>")
        print("Example: python reset_admin_password.py super_admin@p5digital.local MySecure@Pass2026")
        sys.exit(1)

    email = sys.argv[1].strip().lower()
    new_password = sys.argv[2].strip()

    if len(new_password) < 6:
        print("Error: Password must be at least 6 characters long.")
        sys.exit(1)

    db = SessionLocal()
    user = db.query(User).filter(User.email == email, User.deleted_at == None).first()
    if not user:
        print(f"Error: User with email '{email}' not found in municipal_twin_db.")
        db.close()
        sys.exit(1)

    user.password = hash_password(new_password)
    user.is_active = True
    db.add(user)
    db.commit()
    print(f"SUCCESS: Password for '{user.email}' ({user.full_name}) has been updated successfully!")
    db.close()

if __name__ == "__main__":
    main()
