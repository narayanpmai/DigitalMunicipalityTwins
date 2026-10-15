import uuid
from datetime import datetime
from core.database import SessionLocal
from models.audit import AuditLog

LOGS = [
    {
        "action": "login",
        "entity_type": "auth",
        "entity_id": "usr-admin-01",
        "user_id": "admin",
        "user_email": "admin@panchpokhari.gov.np",
        "user_role": "Super Admin",
        "description": "सुपर प्रशासक प्रणालीमा सफलतापूर्वक प्रवेश",
        "success": True
    },
    {
        "action": "create",
        "entity_type": "procurement",
        "entity_id": "PROC-2081-NCB-01",
        "user_id": "admin",
        "user_email": "admin@panchpokhari.gov.np",
        "user_role": "Procurement Officer",
        "description": "नयाँ राष्ट्रिय खुला बोलपत्र दर्ता तथा प्रकाशित",
        "success": True
    },
    {
        "action": "approve",
        "entity_type": "citizen_services",
        "entity_id": "SVC-2081-00101",
        "user_id": "ward_sec",
        "user_email": "ward3@panchpokhari.gov.np",
        "user_role": "Ward Secretary",
        "description": "पारिवारिक नाता प्रमाणित सिफारिस पत्र डिजिटल हस्ताक्षर सहित स्वीकृत",
        "success": True
    },
    {
        "action": "update",
        "entity_type": "business",
        "entity_id": "PPK-BIZ-2081-001",
        "user_id": "revenue_officer",
        "user_email": "revenue@panchpokhari.gov.np",
        "user_role": "Revenue Officer",
        "description": "व्यवसाय नवीकरण दर्ता तथा राजस्व रसिद जारी",
        "success": True
    }
]

def seed():
    db = SessionLocal()
    try:
        for l in LOGS:
            log = AuditLog(
                id=uuid.uuid4(),
                action=l["action"],
                entity_type=l["entity_type"],
                entity_id=l["entity_id"],
                user_id=l["user_id"],
                user_email=l["user_email"],
                user_role=l["user_role"],
                ip_address="127.0.0.1",
                user_agent="Municipal Digital Twins Engine",
                description=l["description"],
                success=l["success"],
                created_at=datetime.utcnow()
            )
            db.add(log)
        db.commit()
        print("Successfully seeded audit logs!")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
