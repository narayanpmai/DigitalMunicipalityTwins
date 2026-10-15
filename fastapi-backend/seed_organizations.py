import json
import uuid
from datetime import datetime
from core.database import SessionLocal
from models.organization import Organization

def seed():
    # Read frontend fallback organizations data
    json_path = "/app/organizations-data.json"
    try:
        with open(json_path, "r", encoding="utf-8") as f:
            orgs_data = json.load(f)
    except Exception as e:
        print("Could not open json from relative path, trying /frontend path or direct fallback", e)
        return

    db = SessionLocal()
    try:
        seeded = 0
        for item in orgs_data:
            oid = uuid.uuid5(uuid.NAMESPACE_DNS, f"org-{item.get('id') or item.get('registrationNo')}")
            existing = db.query(Organization).filter(
                (Organization.id == oid) |
                (Organization.name == item.get("name"))
            ).first()

            if not existing:
                org = Organization(
                    id=oid,
                    name=item.get("name"),
                    name_en=item.get("nameEn"),
                    type=item.get("type", "ngo"),
                    registration_no=item.get("registrationNo"),
                    registration_date=item.get("registrationDate"),
                    suchikrit_miti=item.get("suchikritMiti"),
                    registration_nikaya=item.get("registrationNikaya"),
                    pan=item.get("pan"),
                    chairperson=item.get("chairperson"),
                    contact_person=item.get("contactPerson"),
                    phone=item.get("phone"),
                    tele_phone=item.get("telePhone"),
                    email=item.get("email"),
                    district=item.get("district", "सिन्धुपाल्चोक"),
                    municipality=item.get("municipality", "पाँचपोखरी थाङपाल गाउँपालिका"),
                    address=item.get("address"),
                    ward_number=int(item.get("wardNumber") or 1),
                    sector=item.get("sector"),
                    objectives=item.get("objectives"),
                    status=item.get("status", "active"),
                    is_active=item.get("isActive", True),
                    registration_certificate_url=item.get("registrationCertificateUrl"),
                    pan_certificate_url=item.get("panCertificateUrl"),
                    logo_url=item.get("logoUrl"),
                    members=item.get("members", []),
                    renewals=item.get("renewals", []),
                    agreements=item.get("agreements", []),
                    programs=item.get("programs", []),
                    audits=item.get("audits", []),
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow()
                )
                db.add(org)
                seeded += 1

        db.commit()
        print(f"Successfully seeded {seeded} organizations into database!")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
