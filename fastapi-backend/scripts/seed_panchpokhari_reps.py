import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from core.database import engine
from sqlalchemy import text
import uuid

panchpokhari_reps = [
    {"ward": 1, "designation": "वडा अध्यक्ष (वडा नं. १)", "name": "दावा छिरिङ लामा", "phone": "९८४३०१२३४१"},
    {"ward": 2, "designation": "वडा अध्यक्ष (वडा नं. २)", "name": "छिरिङ ग्याल्बो लामा", "phone": "९८४३०१२३४२"},
    {"ward": 3, "designation": "प्रवक्ता तथा वडा अध्यक्ष (वडा नं. ३)", "name": "ङिमा छिरिङ तामाङ", "phone": "९८४३०१२३४३"},
    {"ward": 4, "designation": "वडा अध्यक्ष (वडा नं. ४)", "name": "पासाङ लामा", "phone": "९८४३०१२३४४"},
    {"ward": 5, "designation": "वडा अध्यक्ष (वडा नं. ५)", "name": "सन्त बहादुर तामाङ", "phone": "९८४३०१२३४५"},
    {"ward": 6, "designation": "वडा अध्यक्ष (वडा नं. ६)", "name": "रामप्रसाद भट्टराई", "phone": "९८४३०१२३४६"},
    {"ward": 7, "designation": "वडा अध्यक्ष (वडा नं. ७)", "name": "सुके तामाङ", "phone": "९८४३०१२३४७"},
    {"ward": 8, "designation": "वडा अध्यक्ष (वडा नं. ८)", "name": "कर्ण बहादुर लामा", "phone": "९८४३०१२३४८"},
    {"ward": None, "designation": "गाउँपालिका उपाध्यक्ष", "name": "सुनिता अधिकारी", "phone": "९७४९३२६६२७"},
    {"ward": None, "designation": "प्रमुख प्रशासकीय अधिकृत", "name": "लक्ष्मण कुईकेल", "phone": "९७४९३२६६१९"}
]

with engine.connect() as conn:
    trans = conn.begin()
    for r in panchpokhari_reps:
        # Check if exists
        w_clause = f'= {r["ward"]}' if r["ward"] is not None else 'IS NULL'
        existing = conn.execute(text(f"""
            SELECT id FROM representatives 
            WHERE (tenant_id = 'panchpokhari' OR tenant_id = 'f07c2bcc-81ad-4e27-aeff-1a65f04e9f06')
              AND "wardNo" {w_clause}
              AND designation = :desig
        """), {"desig": r["designation"]}).first()
        if not existing:
            conn.execute(text("""
                INSERT INTO representatives (id, tenant_id, "wardNo", designation, name, phone, "isCurrent")
                VALUES (:id, 'panchpokhari', :ward, :desig, :name, :phone, true)
            """), {
                "id": str(uuid.uuid4()),
                "ward": r["ward"],
                "desig": r["designation"],
                "name": r["name"],
                "phone": r["phone"]
            })
            print(f"Added Panchpokhari representative: {r['name']} ({r['designation']})")
    trans.commit()
    print("Panchpokhari representatives synchronized.")
