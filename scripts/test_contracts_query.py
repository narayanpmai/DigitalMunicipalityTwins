import sys
import os
sys.path.append(os.path.abspath('fastapi-backend'))
sys.stdout.reconfigure(encoding="utf-8")

from core.database import SessionLocal
from models.contract import Contract

db = SessionLocal()
try:
    contracts = db.query(Contract).all()
    print("Successfully retrieved contracts:", len(contracts))
    for c in contracts:
        print(f"  {c.id} - {c.title}")
except Exception as e:
    import traceback
    traceback.print_exc()
finally:
    db.close()
