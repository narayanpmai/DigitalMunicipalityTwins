"""
Seed DRRM Recovery Projects and Damage Assessments (विपद् पुनःलाभ, पुनर्निर्माण आयोजना तथा क्षति मूल्याङ्कन)
Municipal Digital Twins — Panchpokhari Thangpal Rural Municipality
Populates:
  - drrm_damage_reports (comprehensive damage records for all incidents)
  - drrm_recovery_projects (12 authentic post-disaster reconstruction projects)
"""
import uuid
import datetime
from core.database import SessionLocal
from models.disaster_risk import DisasterIncident, IncidentDamageReport, RecoveryProject

TENANT_ID = "panchpokhari"

def seed_drrm_recovery():
    db = SessionLocal()
    try:
        print("=== SEEDING OPTION 27: DRRM RECOVERY PROJECTS & DAMAGE ASSESSMENTS ===")
        
        # 1. Check existing incidents
        incidents = {inc.id: inc for inc in db.query(DisasterIncident).all()}
        print(f"Found {len(incidents)} existing incidents: {list(incidents.keys())}")
        if not incidents:
            print("ERROR: No drrm_incidents found. Cannot seed recovery projects.")
            return

        now = datetime.datetime.now(datetime.timezone.utc)

        # 2. Seed additional damage reports if missing
        existing_dmg_ids = {d.id for d in db.query(IncidentDamageReport).all()}
        new_damage_reports = [
            {
                "id": "dmg-03",
                "incident_id": "drrm-inc-03", # Bhotang Landslide
                "affected_household_id": "80175ee9-4a39-4d36-a196-165eb7be8f96",
                "affected_infrastructure_id": "infra-bhotang-trail-01",
                "human_casualties": 0,
                "injured_count": 0,
                "estimated_loss_amount": 1850000.00,
                "relief_provided": {
                    "food_ration_kits": 25,
                    "tarpaulins": 40,
                    "cash_assistance_npr": 45000
                },
                "created_at": now - datetime.timedelta(days=120)
            },
            {
                "id": "dmg-04",
                "incident_id": "drrm-inc-04", # Banskharka Fire
                "affected_household_id": "bd2d31fb-bf9f-4597-acb8-bc57564dcb7f",
                "affected_infrastructure_id": "infra-banskharka-kiwi-01",
                "human_casualties": 0,
                "injured_count": 1,
                "estimated_loss_amount": 4200000.00,
                "relief_provided": {
                    "cgi_zinc_sheets": 120,
                    "cash_assistance_npr": 150000,
                    "kitchen_utensil_kits": 12
                },
                "created_at": now - datetime.timedelta(days=95)
            }
        ]

        for dmg_data in new_damage_reports:
            if dmg_data["id"] not in existing_dmg_ids and dmg_data["incident_id"] in incidents:
                report = IncidentDamageReport(
                    tenant_id=TENANT_ID,
                    id=dmg_data["id"],
                    incident_id=dmg_data["incident_id"],
                    affected_household_id=dmg_data["affected_household_id"],
                    affected_infrastructure_id=dmg_data["affected_infrastructure_id"],
                    human_casualties=dmg_data["human_casualties"],
                    injured_count=dmg_data["injured_count"],
                    estimated_loss_amount=dmg_data["estimated_loss_amount"],
                    relief_provided=dmg_data["relief_provided"],
                    created_at=dmg_data["created_at"]
                )
                db.add(report)
                print(f"Added IncidentDamageReport: {dmg_data['id']} for {dmg_data['incident_id']}")

        db.commit()

        # 3. Seed Recovery Projects
        existing_recovery = db.query(RecoveryProject).count()
        if existing_recovery > 0:
            print(f"drrm_recovery_projects already has {existing_recovery} rows. Skipping...")
            return

        recovery_projects_data = [
            {
                "id": "rec-proj-01",
                "incident_id": "drrm-inc-01", # Mandra Landslide
                "project_id": "95db7655-4c1e-590c-98fc-cab2827bc7de",
                "reconstruction_type": "तटबन्ध तथा गेबियन पर्खाल (River/Slope Embankment & Gabion)",
                "beneficiary_household_id": None,
                "recovery_status": "In Progress",
                "created_at": now - datetime.timedelta(days=150),
                "updated_at": now - datetime.timedelta(days=10)
            },
            {
                "id": "rec-proj-02",
                "incident_id": "drrm-inc-01", # Mandra Landslide
                "project_id": None,
                "reconstruction_type": "निजी आवास पुनर्निर्माण (Private Housing)",
                "beneficiary_household_id": "e96f3a4d-5e69-4b80-874a-06b7d44ac76e",
                "recovery_status": "In Progress",
                "created_at": now - datetime.timedelta(days=140),
                "updated_at": now - datetime.timedelta(days=12)
            },
            {
                "id": "rec-proj-03",
                "incident_id": "drrm-inc-02", # Tipeni Flood
                "project_id": None,
                "reconstruction_type": "तटबन्ध तथा गेबियन पर्खाल (River/Slope Embankment & Gabion)",
                "beneficiary_household_id": None,
                "recovery_status": "In Progress",
                "created_at": now - datetime.timedelta(days=200),
                "updated_at": now - datetime.timedelta(days=5)
            },
            {
                "id": "rec-proj-04",
                "incident_id": "drrm-inc-02", # Tipeni Flood
                "project_id": None,
                "reconstruction_type": "सडक तथा कल्भर्ट पुनर्स्थापना (Road & Culvert Restoration)",
                "beneficiary_household_id": None,
                "recovery_status": "Completed",
                "created_at": now - datetime.timedelta(days=190),
                "updated_at": now - datetime.timedelta(days=30)
            },
            {
                "id": "rec-proj-05",
                "incident_id": "drrm-inc-02", # Tipeni Flood
                "project_id": None,
                "reconstruction_type": "निजी आवास पुनर्निर्माण (Private Housing)",
                "beneficiary_household_id": "80678645-07ff-4644-b9e1-e4758b195f26",
                "recovery_status": "Completed",
                "created_at": now - datetime.timedelta(days=180),
                "updated_at": now - datetime.timedelta(days=45)
            },
            {
                "id": "rec-proj-06",
                "incident_id": "drrm-inc-03", # Bhotang Landslide
                "project_id": "94087ede-54d6-5027-a189-262f03919650",
                "reconstruction_type": "झोलुङ्गे पुल तथा पदमार्ग मर्मत (Suspension Bridge & Trail Repair)",
                "beneficiary_household_id": None,
                "recovery_status": "Completed",
                "created_at": now - datetime.timedelta(days=110),
                "updated_at": now - datetime.timedelta(days=20)
            },
            {
                "id": "rec-proj-07",
                "incident_id": "drrm-inc-03", # Bhotang Landslide
                "project_id": None,
                "reconstruction_type": "बायो-इन्जिनियरिङ तथा वृक्षारोपण (Bio-Engineering & Slope Stabilization)",
                "beneficiary_household_id": None,
                "recovery_status": "In Progress",
                "created_at": now - datetime.timedelta(days=100),
                "updated_at": now - datetime.timedelta(days=8)
            },
            {
                "id": "rec-proj-08",
                "incident_id": "drrm-inc-03", # Bhotang Landslide
                "project_id": "473f4a5f-3620-57af-b25e-de5b6d824efb",
                "reconstruction_type": "सिँचाइ कुलो पुनर्निर्माण (Irrigation Canal Reconstruction)",
                "beneficiary_household_id": None,
                "recovery_status": "Planned",
                "created_at": now - datetime.timedelta(days=60),
                "updated_at": now - datetime.timedelta(days=60)
            },
            {
                "id": "rec-proj-09",
                "incident_id": "drrm-inc-04", # Banskharka Fire
                "project_id": None,
                "reconstruction_type": "सामुदायिक वन पुनरुत्थान तथा अग्निरेखा (Community Forest Fire Recovery)",
                "beneficiary_household_id": None,
                "recovery_status": "In Progress",
                "created_at": now - datetime.timedelta(days=90),
                "updated_at": now - datetime.timedelta(days=15)
            },
            {
                "id": "rec-proj-10",
                "incident_id": "drrm-inc-04", # Banskharka Fire
                "project_id": "bfa4605f-4c16-5c0f-b741-2b29bcc06cd2",
                "reconstruction_type": "कृषि फार्म तथा टहरा पुनर्निर्माण (Agro-Shed & Infrastructure)",
                "beneficiary_household_id": "bd2d31fb-bf9f-4597-acb8-bc57564dcb7f",
                "recovery_status": "Completed",
                "created_at": now - datetime.timedelta(days=85),
                "updated_at": now - datetime.timedelta(days=10)
            },
            {
                "id": "rec-proj-11",
                "incident_id": "drrm-inc-04", # Banskharka Fire
                "project_id": None,
                "reconstruction_type": "निजी आवास पुनर्निर्माण (Private Housing)",
                "beneficiary_household_id": "80175ee9-4a39-4d36-a196-165eb7be8f96",
                "recovery_status": "Planned",
                "created_at": now - datetime.timedelta(days=50),
                "updated_at": now - datetime.timedelta(days=50)
            },
            {
                "id": "rec-proj-12",
                "incident_id": "drrm-inc-01", # Mandra Landslide
                "project_id": "95db7655-4c1e-590c-98fc-cab2827bc7dd",
                "reconstruction_type": "स्वास्थ्य चौकी तथा सार्वजनिक भवन सुदृढीकरण (Public Health Facility Retrofitting)",
                "beneficiary_household_id": None,
                "recovery_status": "Completed",
                "created_at": now - datetime.timedelta(days=160),
                "updated_at": now - datetime.timedelta(days=40)
            },
        ]

        for p_data in recovery_projects_data:
            rec_proj = RecoveryProject(
                tenant_id=TENANT_ID,
                id=p_data["id"],
                incident_id=p_data["incident_id"],
                project_id=p_data["project_id"],
                reconstruction_type=p_data["reconstruction_type"],
                beneficiary_household_id=p_data["beneficiary_household_id"],
                recovery_status=p_data["recovery_status"],
                created_at=p_data["created_at"],
                updated_at=p_data["updated_at"]
            )
            db.add(rec_proj)
            print(f"Added RecoveryProject: {p_data['id']} ({p_data['reconstruction_type']}) - {p_data['recovery_status']}")

        db.commit()
        print(f"SUCCESS: Seeded {len(recovery_projects_data)} DRRM Recovery Projects!")

    except Exception as e:
        db.rollback()
        print(f"ERROR seeding DRRM recovery: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_drrm_recovery()
