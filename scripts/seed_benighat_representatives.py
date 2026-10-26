import sys
import uuid

backend_path = r"c:\inetpub\wwwroot\Municipal_Digital_Twins-main\fastapi-backend"
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from core.database import SessionLocal
from models.representative import Representative

def seed():
    db = SessionLocal()
    # Check if already seeded
    existing = db.query(Representative).filter(Representative.tenant_id == "benighatrorang").count()
    if existing > 0:
        print(f"Already seeded {existing} reps for benighatrorang.")
        return

    reps_data = [
        {"name": "कृष्णबहादुर थपलिया (विवेक)", "designation": "गाउँपालिका अध्यक्ष", "ward_no": None, "phone": "०१०-५२९००१", "party": "नेपाल कम्युनिष्ट पार्टी (माओवादी केन्द्र)"},
        {"name": "टापकुमारी श्रेष्ठ (झाँक्री)", "designation": "गाउँपालिका उपाध्यक्ष", "ward_no": None, "phone": "०१०-५२९००२", "party": "नेपाली काँग्रेस"},
        {"name": "नर्मदा घिमिरे", "designation": "प्रमुख प्रशासकीय अधिकृत", "ward_no": None, "phone": "०१०-५२९००३", "party": "प्रशासनिक सेवा"},
        {"name": "रमेश सिलवाल", "designation": "वडा अध्यक्ष", "ward_no": 1, "phone": "९८५१०१११०१", "party": ""},
        {"name": "हेमराज त्रिपाठी", "designation": "प्रवक्ता तथा वडा अध्यक्ष", "ward_no": 2, "phone": "९८५१०१११०२", "party": ""},
        {"name": "भुवन त्रिपाठी", "designation": "वडा अध्यक्ष", "ward_no": 3, "phone": "९८५१०१११०३", "party": ""},
        {"name": "सन्तबहादुर चेपाङ", "designation": "वडा अध्यक्ष", "ward_no": 4, "phone": "९८५१०१११०४", "party": ""},
        {"name": "कृष्णप्रसाद दाहाल", "designation": "वडा अध्यक्ष", "ward_no": 5, "phone": "९८५१०१११०५", "party": ""},
        {"name": "पूर्णबहादुर मगर", "designation": "वडा अध्यक्ष", "ward_no": 6, "phone": "९८५१०१११०६", "party": ""},
        {"name": "नवराज सिलवाल", "designation": "वडा अध्यक्ष", "ward_no": 7, "phone": "९८५१०१११०७", "party": ""},
        {"name": "रामकृष्ण कँडेल", "designation": "वडा अध्यक्ष", "ward_no": 8, "phone": "९८५१०१११०८", "party": ""},
        {"name": "दिलिप चेपाङ", "designation": "वडा अध्यक्ष", "ward_no": 9, "phone": "९८५१०१११०९", "party": ""},
        {"name": "नरबहादुर तामाङ", "designation": "वडा अध्यक्ष", "ward_no": 10, "phone": "९८५१०११११०", "party": ""},
    ]

    for r in reps_data:
        rep = Representative(
            id=str(uuid.uuid4()),
            tenant_id="benighatrorang",
            name=r["name"],
            designation=r["designation"],
            ward_no=r["ward_no"],
            phone=r["phone"],
            email=f"ward{r['ward_no']}@benighatrorangmun.gov.np" if r["ward_no"] else "info@benighatrorangmun.gov.np",
            political_party=r["party"],
            is_current=True
        )
        db.add(rep)

    db.commit()
    print(f"Successfully seeded {len(reps_data)} representatives for benighatrorang.")

if __name__ == "__main__":
    seed()
