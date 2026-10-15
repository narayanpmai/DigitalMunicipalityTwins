import uuid
import datetime
from core.database import SessionLocal
from models.audit import AuditLog
from models.security_rbac import UserRole, UserAccount, SystemAuditLog
from models.ai_assistant import AIPromptLog, AIKnowledgeBaseDocument

TENANT_ID = "panchpokhari"

def seed_security_and_audits():
    db = SessionLocal()
    try:
        print("--- SEEDING OPTION 25: SECURITY, AUDIT LOGS & AI TELEMETRY ---")

        # ── 1. ROLES (sec_user_roles) ──────────────────────────────────────────
        existing_roles = db.query(UserRole).count()
        role_map = {}
        if existing_roles == 0:
            roles_data = [
                {
                    "id": "role-super-admin",
                    "role_name": "SUPER_ADMIN",
                    "description": "सर्वोच्च प्रणाली प्रशासक - पूर्ण प्रणाली नियन्त्रण, डाटाबेस तथा ब्याकअप अधिकार",
                    "permissions": ["all", "system_config", "user_manage", "audit_view", "backup_restore", "db_access"]
                },
                {
                    "id": "role-cao",
                    "role_name": "CAO",
                    "description": "प्रमुख प्रशासकीय अधिकृत - नीतिगत स्वीकृति, टिप्पणी सदर, वित्तीय अनुमोदन तथा अनुगमन",
                    "permissions": ["approve_all", "budget_approve", "eoffice_sign", "tippani_sader", "audit_view", "view_reports"]
                },
                {
                    "id": "role-it-admin",
                    "role_name": "IT_ADMIN",
                    "description": "सूचना प्रविधि शाखा प्रमुख - नेटवर्क, साइबर सुरक्षा, पहुँच नियन्त्रण तथा अडिट लग",
                    "permissions": ["user_manage", "security_audit", "role_assign", "system_logs", "gis_admin", "ai_config"]
                },
                {
                    "id": "role-planning",
                    "role_name": "PLANNING_OFFICER",
                    "description": "योजना शाखा प्रमुख - बजेट बाँडफाँड, खरिद सम्झौता, नापी किताब तथा प्रगति अनुगमन",
                    "permissions": ["project_manage", "budget_allocate", "contract_manage", "mb_verify", "report_generate"]
                },
                {
                    "id": "role-engineer",
                    "role_name": "ENGINEER",
                    "description": "प्रमुख इन्जिनियर - eBPS नक्सापास छानबिन, फिल्ड नापजाँच, कार्यसम्पन्न सिफारिस",
                    "permissions": ["ebps_scrutiny", "field_inspect", "measurement_book", "quality_certify"]
                },
                {
                    "id": "role-revenue",
                    "role_name": "REVENUE_OFFICER",
                    "description": "राजस्व शाखा प्रमुख - कर संकलन, दर निर्धारण, मालपोत तथा व्यवसाय इजाजत",
                    "permissions": ["tax_collect", "rate_configure", "revenue_audit", "receipt_issue"]
                },
                {
                    "id": "role-ward-sec",
                    "role_name": "WARD_SECRETARY",
                    "description": "वडा सचिव - नागरिकता/नाता सिफारिस, जन्म/मृत्यु दर्ता, सामाजिक सुरक्षा नवीकरण",
                    "permissions": ["vital_register", "sifaris_issue", "social_security_entry", "ward_charter"]
                },
                {
                    "id": "role-health",
                    "role_name": "HEALTH_OFFICER",
                    "description": "स्वास्थ्य संयोजक - औषधि मौज्दात, खोप कार्यक्रम, ल्याब तथा स्वास्थ्य चौकी सुपरीवेक्षण",
                    "permissions": ["health_inventory", "medicine_batch", "ipd_opd_report", "dhis2_sync"]
                },
                {
                    "id": "role-agri",
                    "role_name": "AGRICULTURE_OFFICER",
                    "description": "कृषि अधिकृत - मल/बीउ वितरण, बाली परामर्श, कृषक परिचयपत्र तथा अनुदान",
                    "permissions": ["farmer_register", "fertilizer_quota", "crop_advisory", "grant_verify"]
                },
                {
                    "id": "role-judicial",
                    "role_name": "JUDICIAL_OFFICER",
                    "description": "न्यायिक समिति सहजकर्ता - उजुरी दर्ता, मेलमिलापकर्ता नियुक्ति, इजलास कार्यसूची",
                    "permissions": ["case_register", "mediator_assign", "cause_list_manage", "hearing_record"]
                }
            ]

            for r in roles_data:
                role_obj = UserRole(
                    tenant_id=TENANT_ID,
                    id=r["id"],
                    role_name=r["role_name"],
                    description=r["description"],
                    permissions=r["permissions"],
                    created_at=datetime.datetime.utcnow() - datetime.timedelta(days=90)
                )
                db.add(role_obj)
                role_map[r["role_name"]] = r["id"]
            db.commit()
            print(f"✓ Seeded {len(roles_data)} roles into sec_user_roles")
        else:
            for r in db.query(UserRole).all():
                role_map[r.role_name] = r.id
            print(f"ℹ Existing roles loaded: {len(role_map)}")

        # ── 2. USERS (sec_users) ───────────────────────────────────────────────
        existing_users = db.query(UserAccount).count()
        if existing_users == 0:
            users_data = [
                {
                    "id": "sec-usr-01",
                    "username": "cao.krishna",
                    "password_hash": "$2b$12$KIXpZ2hP5G.o7f8Lw8VbAe0wBf4R6fA1mH2rF.Q7yM0p.t2K8oXlC",
                    "role_id": role_map.get("CAO", "role-cao"),
                    "employee_id": "emp-001",
                    "ward_restriction": None,
                    "is_active": True,
                    "last_login": datetime.datetime.utcnow() - datetime.timedelta(minutes=15)
                },
                {
                    "id": "sec-usr-02",
                    "username": "it.suman",
                    "password_hash": "$2b$12$KIXpZ2hP5G.o7f8Lw8VbAe0wBf4R6fA1mH2rF.Q7yM0p.t2K8oXlC",
                    "role_id": role_map.get("IT_ADMIN", "role-it-admin"),
                    "employee_id": "emp-it-01",
                    "ward_restriction": None,
                    "is_active": True,
                    "last_login": datetime.datetime.utcnow() - datetime.timedelta(minutes=3)
                },
                {
                    "id": "sec-usr-03",
                    "username": "planning.dinesh",
                    "password_hash": "$2b$12$KIXpZ2hP5G.o7f8Lw8VbAe0wBf4R6fA1mH2rF.Q7yM0p.t2K8oXlC",
                    "role_id": role_map.get("PLANNING_OFFICER", "role-planning"),
                    "employee_id": "emp-002",
                    "ward_restriction": None,
                    "is_active": True,
                    "last_login": datetime.datetime.utcnow() - datetime.timedelta(hours=2)
                },
                {
                    "id": "sec-usr-04",
                    "username": "eng.ramesh",
                    "password_hash": "$2b$12$KIXpZ2hP5G.o7f8Lw8VbAe0wBf4R6fA1mH2rF.Q7yM0p.t2K8oXlC",
                    "role_id": role_map.get("ENGINEER", "role-engineer"),
                    "employee_id": "emp-003",
                    "ward_restriction": None,
                    "is_active": True,
                    "last_login": datetime.datetime.utcnow() - datetime.timedelta(hours=4)
                },
                {
                    "id": "sec-usr-05",
                    "username": "ward1.secretary",
                    "password_hash": "$2b$12$KIXpZ2hP5G.o7f8Lw8VbAe0wBf4R6fA1mH2rF.Q7yM0p.t2K8oXlC",
                    "role_id": role_map.get("WARD_SECRETARY", "role-ward-sec"),
                    "employee_id": "emp-w1-01",
                    "ward_restriction": 1,
                    "is_active": True,
                    "last_login": datetime.datetime.utcnow() - datetime.timedelta(hours=1)
                },
                {
                    "id": "sec-usr-06",
                    "username": "ward3.secretary",
                    "password_hash": "$2b$12$KIXpZ2hP5G.o7f8Lw8VbAe0wBf4R6fA1mH2rF.Q7yM0p.t2K8oXlC",
                    "role_id": role_map.get("WARD_SECRETARY", "role-ward-sec"),
                    "employee_id": "emp-w3-01",
                    "ward_restriction": 3,
                    "is_active": True,
                    "last_login": datetime.datetime.utcnow() - datetime.timedelta(hours=5)
                },
                {
                    "id": "sec-usr-07",
                    "username": "health.santosh",
                    "password_hash": "$2b$12$KIXpZ2hP5G.o7f8Lw8VbAe0wBf4R6fA1mH2rF.Q7yM0p.t2K8oXlC",
                    "role_id": role_map.get("HEALTH_OFFICER", "role-health"),
                    "employee_id": "emp-hl-01",
                    "ward_restriction": None,
                    "is_active": True,
                    "last_login": datetime.datetime.utcnow() - datetime.timedelta(hours=3)
                },
                {
                    "id": "sec-usr-08",
                    "username": "agri.anita",
                    "password_hash": "$2b$12$KIXpZ2hP5G.o7f8Lw8VbAe0wBf4R6fA1mH2rF.Q7yM0p.t2K8oXlC",
                    "role_id": role_map.get("AGRICULTURE_OFFICER", "role-agri"),
                    "employee_id": "emp-ag-01",
                    "ward_restriction": None,
                    "is_active": True,
                    "last_login": datetime.datetime.utcnow() - datetime.timedelta(days=1)
                },
                {
                    "id": "sec-usr-09",
                    "username": "revenue.kamal",
                    "password_hash": "$2b$12$KIXpZ2hP5G.o7f8Lw8VbAe0wBf4R6fA1mH2rF.Q7yM0p.t2K8oXlC",
                    "role_id": role_map.get("REVENUE_OFFICER", "role-revenue"),
                    "employee_id": "emp-rev-01",
                    "ward_restriction": None,
                    "is_active": True,
                    "last_login": datetime.datetime.utcnow() - datetime.timedelta(minutes=45)
                },
                {
                    "id": "sec-usr-10",
                    "username": "judicial.officer",
                    "password_hash": "$2b$12$KIXpZ2hP5G.o7f8Lw8VbAe0wBf4R6fA1mH2rF.Q7yM0p.t2K8oXlC",
                    "role_id": role_map.get("JUDICIAL_OFFICER", "role-judicial"),
                    "employee_id": "emp-jud-01",
                    "ward_restriction": None,
                    "is_active": True,
                    "last_login": datetime.datetime.utcnow() - datetime.timedelta(days=2)
                }
            ]

            for u in users_data:
                usr_obj = UserAccount(
                    tenant_id=TENANT_ID,
                    id=u["id"],
                    username=u["username"],
                    password_hash=u["password_hash"],
                    role_id=u["role_id"],
                    employee_id=u["employee_id"],
                    ward_restriction=u["ward_restriction"],
                    is_active=u["is_active"],
                    created_at=datetime.datetime.utcnow() - datetime.timedelta(days=60),
                    last_login=u["last_login"]
                )
                db.add(usr_obj)
            db.commit()
            print(f"✓ Seeded {len(users_data)} users into sec_users")

        # ── 3. DETAILED AUDIT LOGS (audit_logs) ────────────────────────────────
        existing_audit = db.query(AuditLog).count()
        if existing_audit == 0:
            now = datetime.datetime.utcnow()
            audit_events = [
                # CAO Events
                {
                    "action": "approve",
                    "entity_type": "Budget",
                    "entity_id": "BUD-2081-001",
                    "user_id": "sec-usr-01",
                    "user_email": "cao@panchpokhari.gov.np",
                    "user_role": "CAO",
                    "ip_address": "192.168.1.10",
                    "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0",
                    "old_values": {"status": "Pending_Review", "allocated_amount": 12000000},
                    "new_values": {"status": "Approved", "allocated_amount": 15000000, "approver": "कृष्ण प्रसाद सापकोटा"},
                    "description": "आर्थिक वर्ष २०८१/८२ को भोताङ-थाङपालकोट सडक स्तरोन्नति पुँजीगत बजेट रु १ करोड ५० लाख टिप्पणी सदर गरी स्वीकृत गरिएको।",
                    "success": True,
                    "created_at": now - datetime.timedelta(hours=2)
                },
                {
                    "action": "approve",
                    "entity_type": "Procurement",
                    "entity_id": "PROC-TEND-2081-04",
                    "user_id": "sec-usr-01",
                    "user_email": "cao@panchpokhari.gov.np",
                    "user_role": "CAO",
                    "ip_address": "192.168.1.10",
                    "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0",
                    "old_values": {"evaluation_stage": "Technical_Evaluation"},
                    "new_values": {"evaluation_stage": "Contract_Awarded", "contractor": "सिन्धु कन्स्ट्रक्सन प्रा.लि."},
                    "description": "मेलम्ची-भोताङ खानेपानी ट्याङ्की निर्माण बोलपत्र मूल्यांकन समिति निर्णय सदर तथा सम्झौता आदेश जारी।",
                    "success": True,
                    "created_at": now - datetime.timedelta(hours=5)
                },
                # Engineering & eBPS
                {
                    "action": "create",
                    "entity_type": "BuildingPermit",
                    "entity_id": "BP-2081-W3-018",
                    "user_id": "sec-usr-04",
                    "user_email": "engineering@panchpokhari.gov.np",
                    "user_role": "Engineer",
                    "ip_address": "192.168.1.15",
                    "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) Safari/605.1",
                    "old_values": None,
                    "new_values": {"permit_no": "BP-018", "applicant": "पेम्बा तामाङ", "plinth_area_sqft": 1450, "structure": "RCC Framed 2.5 Storey"},
                    "description": "वडा नं ३ भोताङमा २.५ तल्ले आवासीय भवनको स्ट्रक्चरल तथा आर्किटेक्चरल नक्सा प्राविधिक जाँच गरी प्रारम्भिक स्वीकृति प्रदान।",
                    "success": True,
                    "created_at": now - datetime.timedelta(hours=8)
                },
                {
                    "action": "update",
                    "entity_type": "MeasurementBook",
                    "entity_id": "MB-ENG-2081-09",
                    "user_id": "sec-usr-04",
                    "user_email": "engineering@panchpokhari.gov.np",
                    "user_role": "Engineer",
                    "ip_address": "192.168.1.15",
                    "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) Safari/605.1",
                    "old_values": {"running_bill_no": 1, "certified_work_pct": 45.0},
                    "new_values": {"running_bill_no": 2, "certified_work_pct": 82.5, "net_payable": 845000},
                    "description": "गुन्सा स्वास्थ्य चौकी घेराबार तथा कम्पाउण्डिङ आयोजना दोस्रो रनिङ बिलको स्थलगत नापजाँच किताब प्रमाणीकरण।",
                    "success": True,
                    "created_at": now - datetime.timedelta(hours=14)
                },
                # Ward 1 Vital & Sifaris
                {
                    "action": "create",
                    "entity_type": "VitalRegistration",
                    "entity_id": "VR-BR-2081-0012",
                    "user_id": "sec-usr-05",
                    "user_email": "ward1@panchpokhari.gov.np",
                    "user_role": "Ward_Secretary",
                    "ip_address": "10.10.1.22",
                    "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Firefox/130.0",
                    "old_values": None,
                    "new_values": {"reg_type": "Birth", "child_name": "आर्यन तामाङ", "father": " दावा तामाङ", "reg_date_bs": "२०८१-०६-१४"},
                    "description": "वडा नं १ बाँसखर्क कार्यालयबाट अनलाइन जन्म दर्ता प्रमाणपत्र सफलतापूर्वक जारी तथा राष्ट्रिय परिचयपत्र प्रणालीमा प्रेषण।",
                    "success": True,
                    "created_at": now - datetime.timedelta(hours=3)
                },
                {
                    "action": "create",
                    "entity_type": "Sifaris",
                    "entity_id": "SIF-CIT-2081-089",
                    "user_id": "sec-usr-05",
                    "user_email": "ward1@panchpokhari.gov.np",
                    "user_role": "Ward_Secretary",
                    "ip_address": "10.10.1.22",
                    "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Firefox/130.0",
                    "old_values": None,
                    "new_values": {"sifaris_type": "नेपाली नागरिकता प्रमाण पत्र सिफारिस", "applicant": "निमा लामा", "ward": 1},
                    "description": "जिल्ला प्रशासन कार्यालय सिन्धुपाल्चोकको लागि वंशजको आधारमा नेपाली नागरिकता सिफारिस पत्र जारी।",
                    "success": True,
                    "created_at": now - datetime.timedelta(hours=11)
                },
                # Ward 3 Vital & Social Security
                {
                    "action": "update",
                    "entity_type": "SocialSecurity",
                    "entity_id": "SSA-W3-045",
                    "user_id": "sec-usr-06",
                    "user_email": "ward3@panchpokhari.gov.np",
                    "user_role": "Ward_Secretary",
                    "ip_address": "10.10.3.18",
                    "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0",
                    "old_values": {"life_verification_status": "Pending", "fiscal_year": "२०८०/८१"},
                    "new_values": {"life_verification_status": "Verified", "fiscal_year": "२०८१/८२", "verified_by": "बायोमेट्रिक रुजु"},
                    "description": "ज्येष्ठ नागरिक सामाजिक सुरक्षा भत्ता पाउने लाभग्राही छिरिङ तामाङको २०८१/८२ वार्षिक जीवन प्रमाणीकरण सम्पन्न।",
                    "success": True,
                    "created_at": now - datetime.timedelta(hours=6)
                },
                # Revenue Department
                {
                    "action": "create",
                    "entity_type": "Revenue",
                    "entity_id": "REV-TAX-2081-0156",
                    "user_id": "sec-usr-09",
                    "user_email": "revenue@panchpokhari.gov.np",
                    "user_role": "Revenue_Officer",
                    "ip_address": "192.168.1.18",
                    "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edge/128.0",
                    "old_values": None,
                    "new_values": {"taxpayer": "पाँचपोखरी एग्रो रिसोर्ट", "tax_type": "एकीकृत सम्पत्ति कर तथा व्यवसाय कर", "amount_npr": 48500},
                    "description": "आर्थिक वर्ष २०८१/८२ को व्यवसाय तथा सम्पत्ति कर दाखिला रसिद नं १८९२ मार्फत रु ४८,५०० संकलन सम्पन्न।",
                    "success": True,
                    "created_at": now - datetime.timedelta(hours=7)
                },
                # Health Coordination
                {
                    "action": "create",
                    "entity_type": "HealthInventory",
                    "entity_id": "HL-MED-BATCH-81-03",
                    "user_id": "sec-usr-07",
                    "user_email": "health@panchpokhari.gov.np",
                    "user_role": "Health_Officer",
                    "ip_address": "192.168.1.20",
                    "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0",
                    "old_values": None,
                    "new_values": {"batch_no": "B-PCM-500", "medicine": "पारासिटामोल ५०० मि.ग्रा.", "quantity_tabs": 15000, "expiry_bs": "२०८३-०५-३०"},
                    "description": "संघीय स्वास्थ्य सेवा विभागबाट प्राप्त निःशुल्क अत्यावश्यक औषधिको नयाँ ब्याच पालिका केन्द्रीय स्टोरमा दाखिला।",
                    "success": True,
                    "created_at": now - datetime.timedelta(hours=18)
                },
                # Agriculture Department
                {
                    "action": "create",
                    "entity_type": "AgricultureDistribution",
                    "entity_id": "AG-DIST-2081-W5-08",
                    "user_id": "sec-usr-08",
                    "user_email": "agriculture@panchpokhari.gov.np",
                    "user_role": "Agriculture_Officer",
                    "ip_address": "192.168.1.25",
                    "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Firefox/130.0",
                    "old_values": None,
                    "new_values": {"item": "उन्नत आलु बीउ (जनकदेव)", "total_kg": 2500, "beneficiary_farmers": 42, "subsidy_pct": 50},
                    "description": "वडा नं ५ गुन्साका ४२ अगुवा कृषकहरूलाई ५० प्रतिशत अनुदानमा २,५०० केजी प्रमाणित आलु बीउ वितरण कोटा वितरण।",
                    "success": True,
                    "created_at": now - datetime.timedelta(days=1, hours=2)
                },
                # Judicial Committee
                {
                    "action": "create",
                    "entity_type": "JudicialCase",
                    "entity_id": "JUD-CASE-2081-007",
                    "user_id": "sec-usr-10",
                    "user_email": "judicial@panchpokhari.gov.np",
                    "user_role": "Judicial_Officer",
                    "ip_address": "192.168.1.30",
                    "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0",
                    "old_values": None,
                    "new_values": {"subject": "सिमाना साँध-किचलो तथा कुलो पानी विवाद", "complainant": "गोविन्द सापकोटा", "ward": 6},
                    "description": "पाँचपोखरी थाङपाल-६ को जग्गा साँध विवाद सम्बन्धी उजुरी दर्ता तथा मेलमिलापकर्ता नियुक्ति प्रक्रिया सुरु।",
                    "success": True,
                    "created_at": now - datetime.timedelta(days=1, hours=5)
                },
                # IT Administration & Backups
                {
                    "action": "backup",
                    "entity_type": "SystemBackup",
                    "entity_id": "SYS-BCK-2081-06-15",
                    "user_id": "sec-usr-02",
                    "user_email": "it@panchpokhari.gov.np",
                    "user_role": "IT_Admin",
                    "ip_address": "192.168.1.2",
                    "user_agent": "P5-Backup-Daemon/2.0 (Debian Linux; x86_64)",
                    "old_values": None,
                    "new_values": {"backup_size_mb": 420.5, "hash_sha256": "8f4a3e2c1b9d0e7a...", "storage": "Offsite Cloud & Local NAS"},
                    "description": "दैनिक निर्धारित डाटाबेस पूर्ण ब्याकअप (Full Encrypted DB Backup) सफलतापूर्वक सम्पन्न।",
                    "success": True,
                    "created_at": now - datetime.timedelta(hours=16)
                },
                {
                    "action": "export",
                    "entity_type": "OpenDataRecord",
                    "entity_id": "OPEN-DATA-ALL-FY81",
                    "user_id": "sec-usr-02",
                    "user_email": "it@panchpokhari.gov.np",
                    "user_role": "IT_Admin",
                    "ip_address": "192.168.1.2",
                    "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0",
                    "old_values": None,
                    "new_values": {"export_format": "CSV/GeoJSON", "total_records": 269},
                    "description": "सार्वजनिक खुला तथ्याङ्क प्रतिवेदन तथा पालिका सूचकहरूको वार्षिक निर्यात (Open Data Audit Export)।",
                    "success": True,
                    "created_at": now - datetime.timedelta(hours=10)
                },
                # Cybersecurity Alerts & Threat Forensics
                {
                    "action": "failed_login",
                    "entity_type": "AuthSecurity",
                    "entity_id": "SEC-ATTEMPT-01",
                    "user_id": None,
                    "user_email": "admin@panchpokhari.gov.np",
                    "user_role": "Unauthenticated",
                    "ip_address": "198.51.100.44",
                    "user_agent": "Python-requests/2.31.0",
                    "old_values": None,
                    "new_values": {"attempt_count": 3, "trigger": "Invalid_Password_Rate_Limit"},
                    "description": "अपरिचित बाह्य आईपी ठेगाना (198.51.100.44) बाट ३ पटक लगातार गलत पासवर्ड प्रयास। आईपी १५ मिनेटका लागि अस्थायी रूपमा अवरुद्ध (Blocked)।",
                    "success": False,
                    "error_message": "Invalid password credentials. IP rate limit threshold reached (3/3).",
                    "created_at": now - datetime.timedelta(hours=12)
                },
                {
                    "action": "alert",
                    "entity_type": "SessionSecurity",
                    "entity_id": "SEC-TIMEOUT-02",
                    "user_id": "sec-usr-05",
                    "user_email": "ward1@panchpokhari.gov.np",
                    "user_role": "Ward_Secretary",
                    "ip_address": "10.10.1.22",
                    "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Firefox/130.0",
                    "old_values": {"session_active": True},
                    "new_values": {"session_active": False, "reason": "30_Minute_Inactivity"},
                    "description": "सुरक्षा नीति बमोजिम ३० मिनेट निष्क्रिय रहेपछि प्रयोगकर्ताको सेसन स्वतः सुरक्षित रूपमा बन्द (Auto Logout)।",
                    "success": True,
                    "created_at": now - datetime.timedelta(hours=9)
                },
                {
                    "action": "login",
                    "entity_type": "UserSession",
                    "entity_id": "AUTH-SESS-998",
                    "user_id": "sec-usr-01",
                    "user_email": "cao@panchpokhari.gov.np",
                    "user_role": "CAO",
                    "ip_address": "192.168.1.10",
                    "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0",
                    "old_values": None,
                    "new_values": {"login_method": "2FA_Password", "device": "Office Desktop"},
                    "description": "प्रमुख प्रशासकीय अधिकृतद्वारा कार्यपालिका सुरक्षित ड्यासवोर्डमा सफल द्वि-तह प्रमाणीकरण (2FA) लगइन।",
                    "success": True,
                    "created_at": now - datetime.timedelta(hours=1)
                },
                {
                    "action": "login",
                    "entity_type": "UserSession",
                    "entity_id": "AUTH-SESS-999",
                    "user_id": "sec-usr-02",
                    "user_email": "it@panchpokhari.gov.np",
                    "user_role": "IT_Admin",
                    "ip_address": "192.168.1.2",
                    "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0",
                    "old_values": None,
                    "new_values": {"login_method": "Admin_Token", "device": "IT Server Room"},
                    "description": "सूचना प्रविधि शाखा प्रमुखद्वारा सुरक्षा तथा अडिट नियन्त्रण कन्सोलमा लगइन।",
                    "success": True,
                    "created_at": now - datetime.timedelta(minutes=25)
                }
            ]

            # Generate 15 more historical audit logs distributed over past 7 days
            sample_modules = [
                ("VitalRegistration", "जन्म दर्ता अनलाइन सिफारिस जारी", "ward3@panchpokhari.gov.np", "Ward_Secretary", "10.10.3.18"),
                ("BuildingPermit", "नक्सापास फिल्ड सुपरिवेक्षण प्रतिवेदन दर्ता", "engineering@panchpokhari.gov.np", "Engineer", "192.168.1.15"),
                ("CitizenService", "चारकिल्ला प्रमाणित सिफारिस सिफारिसपत्र जारी", "ward1@panchpokhari.gov.np", "Ward_Secretary", "10.10.1.22"),
                ("Grievance", "नागरिक गुनासो दर्ता तथा सम्बन्धित शाखामा सम्प्रेषण", "cao@panchpokhari.gov.np", "CAO", "192.168.1.10"),
                ("Revenue", "मालपोत भूमिकर अनलाइन संकलन रसिद", "revenue@panchpokhari.gov.np", "Revenue_Officer", "192.168.1.18"),
            ]

            for i in range(15):
                m_info = sample_modules[i % len(sample_modules)]
                d_ago = datetime.timedelta(days=(i % 6) + 1, hours=(i * 3) % 24)
                audit_events.append({
                    "action": "update" if i % 2 == 0 else "create",
                    "entity_type": m_info[0],
                    "entity_id": f"HIST-EVT-{208100 + i}",
                    "user_id": "sec-usr-02",
                    "user_email": m_info[2],
                    "user_role": m_info[3],
                    "ip_address": m_info[4],
                    "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Digital Twins P5",
                    "old_values": {"status": "Draft"},
                    "new_values": {"status": "Completed", "verified": True},
                    "description": f"पाँचपोखरी थाङपाल प्रशासनिक कार्यप्रवाह: {m_info[1]} (अभिलेख #{1020 + i})",
                    "success": True,
                    "created_at": now - d_ago
                })

            for ev in audit_events:
                a_obj = AuditLog(
                    id=uuid.uuid4(),
                    tenant_id=TENANT_ID,
                    action=ev["action"],
                    entity_type=ev["entity_type"],
                    entity_id=ev.get("entity_id"),
                    user_id=ev.get("user_id"),
                    user_email=ev.get("user_email"),
                    user_role=ev.get("user_role"),
                    ip_address=ev.get("ip_address"),
                    user_agent=ev.get("user_agent"),
                    old_values=ev.get("old_values"),
                    new_values=ev.get("new_values"),
                    description=ev.get("description"),
                    success=ev.get("success", True),
                    error_message=ev.get("error_message"),
                    created_at=ev.get("created_at")
                )
                db.add(a_obj)
            db.commit()
            print(f"✓ Seeded {len(audit_events)} audit events into audit_logs")

        # ── 4. LOW-LEVEL SYSTEM SECURITY LOGS (sec_audit_logs) ────────────────
        existing_sec_logs = db.query(SystemAuditLog).count()
        if existing_sec_logs == 0:
            now = datetime.datetime.utcnow()
            sec_trails = [
                {
                    "user_id": "sec-usr-01",
                    "action": "LOGIN",
                    "resource_type": "AuthSession",
                    "resource_id": "sess-9011",
                    "old_data": None,
                    "new_data": {"auth_type": "password_jwt", "device": "Desktop_CAO"},
                    "ip_address": "192.168.1.10",
                    "user_agent": "Chrome/128.0 (Windows NT 10.0)",
                    "timestamp": now - datetime.timedelta(hours=1, minutes=10)
                },
                {
                    "user_id": "sec-usr-01",
                    "action": "UPDATE",
                    "resource_type": "BudgetPlan",
                    "resource_id": "BUD-2081-001",
                    "old_data": {"state": "SUBMITTED", "budget": 12000000},
                    "new_data": {"state": "APPROVED", "budget": 15000000},
                    "ip_address": "192.168.1.10",
                    "user_agent": "Chrome/128.0 (Windows NT 10.0)",
                    "timestamp": now - datetime.timedelta(hours=2)
                },
                {
                    "user_id": "sec-usr-02",
                    "action": "CREATE",
                    "resource_type": "SecurityPolicy",
                    "resource_id": "POL-PWD-01",
                    "old_data": None,
                    "new_data": {"min_len": 10, "require_special": True, "expiry_days": 90},
                    "ip_address": "192.168.1.2",
                    "user_agent": "Chrome/128.0 (Windows NT 10.0)",
                    "timestamp": now - datetime.timedelta(days=1, hours=3)
                },
                {
                    "user_id": "sec-usr-04",
                    "action": "UPDATE",
                    "resource_type": "BuildingPermit",
                    "resource_id": "BP-2081-W3-018",
                    "old_data": {"status": "UNDER_SCRUTINY"},
                    "new_data": {"status": "PLINTH_APPROVED"},
                    "ip_address": "192.168.1.15",
                    "user_agent": "Safari/605.1 (macOS)",
                    "timestamp": now - datetime.timedelta(hours=7, minutes=45)
                },
                {
                    "user_id": "sec-usr-05",
                    "action": "CREATE",
                    "resource_type": "CitizenRecord",
                    "resource_id": "CIT-W1-8841",
                    "old_data": None,
                    "new_data": {"ward": 1, "citizen_id": "27-01-81-0192"},
                    "ip_address": "10.10.1.22",
                    "user_agent": "Firefox/130.0",
                    "timestamp": now - datetime.timedelta(hours=3, minutes=15)
                },
                {
                    "user_id": "sec-usr-09",
                    "action": "CREATE",
                    "resource_type": "TaxReceipt",
                    "resource_id": "RCP-81-1892",
                    "old_data": None,
                    "new_data": {"collected_npr": 48500, "channel": "CASH_COUNTER"},
                    "ip_address": "192.168.1.18",
                    "user_agent": "Edge/128.0",
                    "timestamp": now - datetime.timedelta(hours=6, minutes=50)
                },
                {
                    "user_id": "sec-usr-02",
                    "action": "EXPORT",
                    "resource_type": "OpenDataCatalog",
                    "resource_id": "DATASET-CATALOG-2081",
                    "old_data": None,
                    "new_data": {"format": "CSV", "rows_count": 269},
                    "ip_address": "192.168.1.2",
                    "user_agent": "Chrome/128.0",
                    "timestamp": now - datetime.timedelta(hours=10)
                }
            ]

            # Add more traces for realism
            for j in range(12):
                sec_trails.append({
                    "user_id": f"sec-usr-0{(j % 5) + 1}",
                    "action": "LOGIN" if j % 3 == 0 else ("UPDATE" if j % 2 == 0 else "READ"),
                    "resource_type": ["CitizenMaster", "VitalEvent", "EofficeFile", "ProjectProgress"][j % 4],
                    "resource_id": f"RES-ITEM-{100 + j}",
                    "old_data": {"version": 1},
                    "new_data": {"version": 2, "verified": True},
                    "ip_address": f"192.168.1.{20 + j}",
                    "user_agent": "P5-Digital-Twins-Client",
                    "timestamp": now - datetime.timedelta(days=(j % 5) + 1, hours=(j * 2) % 24)
                })

            for st in sec_trails:
                sec_obj = SystemAuditLog(
                    id=str(uuid.uuid4()),
                    tenant_id=TENANT_ID,
                    user_id=st["user_id"],
                    action=st["action"],
                    resource_type=st["resource_type"],
                    resource_id=st.get("resource_id"),
                    old_data=st.get("old_data"),
                    new_data=st.get("new_data"),
                    ip_address=st.get("ip_address"),
                    user_agent=st.get("user_agent"),
                    timestamp=st.get("timestamp")
                )
                db.add(sec_obj)
            db.commit()
            print(f"✓ Seeded {len(sec_trails)} records into sec_audit_logs")

        # ── 5. AI PROMPT LOGS (ai_prompt_logs) ────────────────────────────────
        existing_ai_logs = db.query(AIPromptLog).count()
        if existing_ai_logs == 0:
            now = datetime.datetime.utcnow()
            ai_interactions = [
                {
                    "user_id": "citizen-web-01",
                    "session_id": "sess-ai-101",
                    "user_prompt": "पाँचपोखरी थाङपाल गाउँपालिकामा नयाँ व्यवसाय दर्ता गर्न के के कागजात चाहिन्छ र दस्तुर कति लाग्छ?",
                    "ai_response": "व्यवसाय दर्ताका लागि आवश्यक कागजातहरू:\n१. निवेदन फारम (अनुसूची अनुसार)\n२. नागरिकताको प्रतिलिपि\n३. जग्गाधनी प्रमाणपुर्जा वा घरबहाल सम्झौता\n४. सम्बन्धित वडा कार्यालयको स्थलगत सिफारिस\nदस्तुर: साना पसल रु ५००, मझौला रु १,००० र रिसोर्ट/पर्यटकीय होटल रु ५,००० सम्म स्थानीय आर्थिक ऐन अनुसार लाग्दछ।",
                    "intent_category": "Query",
                    "tokens_used": 285,
                    "user_feedback": "Positive",
                    "timestamp": now - datetime.timedelta(hours=2)
                },
                {
                    "user_id": "staff-planning-01",
                    "session_id": "sess-ai-102",
                    "user_prompt": "आर्थिक वर्ष २०८१/८२ मा वडा नं ३ भोताङमा सडक तथा पूर्वाधारका लागि कति बजेट विनियोजन भएको छ?",
                    "ai_response": "आर्थिक वर्ष २०८१/८२ को पालिका वार्षिक बजेट पुस्तिका अनुसार वडा नं ३ मा:\n- भोताङ-मानेखर्क कृषि सडक स्तरोन्नति: रु २५,००,०००\n- भोताङ खानेपानी ट्याङ्की तथा मुहान संरक्षण: रु १२,००,०००\n- वडा स्तरीय पूर्वाधार मर्मत कोष: रु ५,००,०००\nजम्मा पुँजीगत विनियोजन रु ४२,००,००० रहेको छ।",
                    "intent_category": "Query",
                    "tokens_used": 340,
                    "user_feedback": "Positive",
                    "timestamp": now - datetime.timedelta(hours=4)
                },
                {
                    "user_id": "citizen-web-02",
                    "session_id": "sess-ai-103",
                    "user_prompt": "ज्येष्ठ नागरिक सामाजिक सुरक्षा भत्ता पाउने उमेर र बैंक खाता खोल्ने प्रक्रिया के हो?",
                    "ai_response": "६८ वर्ष उमेर पूरा भएका ज्येष्ठ नागरिकले सामाजिक सुरक्षा भत्ता प्राप्त गर्न सक्नुहुन्छ (दलित नागरिकको हकमा ६० वर्ष)।\nप्रक्रिया:\n१. वडा कार्यालयमा नागरिकता र २ प्रति फोटोसहित अनलाइन दर्ता फारम भर्नुहोस्।\n२. पालिकाले तोकेको बैंक (कृषि विकास बैंक वा स्थानीय बैंकिङ शाखा) मा निःशुल्क सामाजिक सुरक्षा खाता खुल्नेछ।\n३. भत्ता रकम त्रैमासिक रूपमा सिधै बैंक खातामा जम्मा हुन्छ।",
                    "intent_category": "Support",
                    "tokens_used": 260,
                    "user_feedback": "Positive",
                    "timestamp": now - datetime.timedelta(hours=8)
                },
                {
                    "user_id": "tourist-visitor-01",
                    "session_id": "sess-ai-104",
                    "user_prompt": "पाँचपोखरी तीर्थयात्रा र पदमार्गको मौसम तथा तयारी बारे जानकारी दिनुहोस्।",
                    "ai_response": "पाँचपोखरी (उचाइ ४,१०० मिटर) लाङटाङ राष्ट्रिय निकुञ्ज क्षेत्रमा पर्दछ।\n- उत्तम मौसम: असोज-मंसिर र चैत-जेठ।\n- जनैपूर्णिमा मेला: भदौ महिनामा भव्य मेला लाग्दछ।\n- पदमार्ग: मेलम्ची -> भोताङ -> नोर्बुलिङ -> लौरीविनायक हुँदै पाँचपोखरी पुगिन्छ।\n- उच्च हिमाली लेक लाग्न सक्ने हुनाले पर्याप्त पानी र न्यानो कपडा बोक्न सल्लाह दिइन्छ।",
                    "intent_category": "General",
                    "tokens_used": 310,
                    "user_feedback": "Positive",
                    "timestamp": now - datetime.timedelta(hours=14)
                },
                {
                    "user_id": "citizen-web-03",
                    "session_id": "sess-ai-105",
                    "user_prompt": "नाता प्रमाणित र अविवाहित सिफारिस बनाउन वडा कार्यालय जानुपर्छ कि अनलाइनबाटै हुन्छ?",
                    "ai_response": "पाँचपोखरी डिजिटल नागरिक सेवा पोर्टल (Citizen 360) मार्फत तपाईंले अनलाइन नै निवेदन दिन र आवश्यक कागजात अपलोड गर्न सक्नुहुन्छ।\nसम्बन्धित वडा सचिवले रुजु गरी डिजिटल हस्ताक्षरसहितको QR-कोडित सिफारिस प्रमाणपत्र जारी गर्नुहुनेछ, जुन घरमै बसी डाउनलोड गर्न सकिन्छ।",
                    "intent_category": "Support",
                    "tokens_used": 230,
                    "user_feedback": "Positive",
                    "timestamp": now - datetime.timedelta(days=1, hours=3)
                },
                {
                    "user_id": "staff-admin-01",
                    "session_id": "sess-ai-106",
                    "user_prompt": "सार्वजनिक खरिद नियमावली अनुसार ५ लाख भन्दा कम लागत अनुमान भएको योजना उपभोक्ता समितिबाट गराउने ढाँचा तयार पारिदेऊ।",
                    "ai_response": "उपभोक्ता समिति गठन तथा सम्झौताको मानक ढाँचा:\n१. वडा भेलाबाट उपभोक्ता समिति गठन माइन्युट प्रतिलिपि\n२. लागत अनुमान (Cost Estimate) प्राविधिक शाखाबाट स्वीकृत\n३. उपभोक्ता समिति अध्यक्ष, सचिव र कोषाध्यक्षको बैंक संयुक्त खाता\n४. सम्झौता पत्रको मस्यौदा अनुसूची-३ बमोजिम तयार पारिएको छ।",
                    "intent_category": "Drafting",
                    "tokens_used": 420,
                    "user_feedback": "Positive",
                    "timestamp": now - datetime.timedelta(days=1, hours=7)
                },
                {
                    "user_id": "farmer-user-01",
                    "session_id": "sess-ai-107",
                    "user_prompt": "यस वर्ष कृषि शाखाबाट वितरण हुने अनुदानको बीउ तथा प्राङ्गारिक मल कसरी पाइन्छ?",
                    "ai_response": "कृषि शाखा प्रमुखका अनुसार:\n१. आफ्नो वडा कार्यालय वा पालिका कृषि शाखामा कृषक परिचयपत्र वा जग्गाधनी प्रमाणपुर्जा पेश गर्नुहोस्।\n२. ५०% अनुदानमा उन्नत बीउ र मल वितरण वडा नं १ देखि ८ का सेवा केन्द्रहरूबाट तोकिएको मितिमा उपलब्ध हुनेछ।",
                    "intent_category": "Support",
                    "tokens_used": 210,
                    "user_feedback": "Positive",
                    "timestamp": now - datetime.timedelta(days=2, hours=1)
                }
            ]

            for inter in ai_interactions:
                p_obj = AIPromptLog(
                    id=str(uuid.uuid4()),
                    tenant_id=TENANT_ID,
                    user_id=inter["user_id"],
                    session_id=inter["session_id"],
                    user_prompt=inter["user_prompt"],
                    ai_response=inter["ai_response"],
                    intent_category=inter["intent_category"],
                    tokens_used=inter["tokens_used"],
                    user_feedback=inter["user_feedback"],
                    timestamp=inter["timestamp"]
                )
                db.add(p_obj)
            db.commit()
            print(f"✓ Seeded {len(ai_interactions)} interactions into ai_prompt_logs")

        # ── 6. AI KNOWLEDGE BASE DOCUMENTS (ai_knowledge_base_documents) ───────
        existing_kb = db.query(AIKnowledgeBaseDocument).count()
        if existing_kb == 0:
            now = datetime.datetime.utcnow()
            kb_docs = [
                {
                    "title": "पाँचपोखरी थाङपाल गाउँपालिका स्थानीय आर्थिक ऐन २०८१",
                    "url": "/uploads/documents/economic_act_2081.pdf",
                    "type": "Act",
                    "status": "Indexed",
                    "vector_ref": "vec-act-81-01",
                    "uploaded_by": "it@panchpokhari.gov.np",
                    "timestamp": now - datetime.timedelta(days=20)
                },
                {
                    "title": "सार्वजनिक खरिद तथा उपभोक्ता समिति परिचालन निर्देशिका २०८०",
                    "url": "/uploads/documents/procurement_guideline_2080.pdf",
                    "type": "Guideline",
                    "status": "Indexed",
                    "vector_ref": "vec-proc-80-02",
                    "uploaded_by": "planning@panchpokhari.gov.np",
                    "timestamp": now - datetime.timedelta(days=18)
                },
                {
                    "title": "डिजिटल नागरिक बडापत्र तथा सेवा प्रवाह मापदण्ड २०८१",
                    "url": "/uploads/documents/citizen_charter_2081.pdf",
                    "type": "Notice",
                    "status": "Indexed",
                    "vector_ref": "vec-badapatra-81-03",
                    "uploaded_by": "it@panchpokhari.gov.np",
                    "timestamp": now - datetime.timedelta(days=15)
                },
                {
                    "title": "विपद् जोखिम न्यूनीकरण तथा प्रतिकार्य कार्ययोजना २०८१",
                    "url": "/uploads/documents/drrm_action_plan_2081.pdf",
                    "type": "Rule",
                    "status": "Indexed",
                    "vector_ref": "vec-drrm-81-04",
                    "uploaded_by": "disaster@panchpokhari.gov.np",
                    "timestamp": now - datetime.timedelta(days=12)
                },
                {
                    "title": "स्थानीय शिक्षा ऐन तथा विद्यालय व्यवस्थापन निर्देशिका २०७९",
                    "url": "/uploads/documents/education_act_2079.pdf",
                    "type": "Act",
                    "status": "Indexed",
                    "vector_ref": "vec-edu-79-05",
                    "uploaded_by": "education@panchpokhari.gov.np",
                    "timestamp": now - datetime.timedelta(days=10)
                },
                {
                    "title": "सहकारी नियमन, अनुगमन तथा सुपरीवेक्षण दिग्दर्शन २०८०",
                    "url": "/uploads/documents/cooperative_guideline_2080.pdf",
                    "type": "Guideline",
                    "status": "Indexed",
                    "vector_ref": "vec-coop-80-06",
                    "uploaded_by": "it@panchpokhari.gov.np",
                    "timestamp": now - datetime.timedelta(days=8)
                },
                {
                    "title": "भवन निर्माण संहिता तथा ई-बीपीएस (eBPS) मापदण्ड २०८०",
                    "url": "/uploads/documents/ebps_building_code_2080.pdf",
                    "type": "Rule",
                    "status": "Indexed",
                    "vector_ref": "vec-ebps-80-07",
                    "uploaded_by": "engineering@panchpokhari.gov.np",
                    "timestamp": now - datetime.timedelta(days=6)
                },
                {
                    "title": "कृषि तथा पशुपन्छी विकास अनुदान कार्यविधि २०८०",
                    "url": "/uploads/documents/agriculture_grant_procedure_2080.pdf",
                    "type": "Rule",
                    "status": "Indexed",
                    "vector_ref": "vec-agri-80-08",
                    "uploaded_by": "agriculture@panchpokhari.gov.np",
                    "timestamp": now - datetime.timedelta(days=4)
                }
            ]

            for kd in kb_docs:
                doc_obj = AIKnowledgeBaseDocument(
                    id=str(uuid.uuid4()),
                    tenant_id=TENANT_ID,
                    document_title=kd["title"],
                    file_url=kd["url"],
                    document_type=kd["type"],
                    indexing_status=kd["status"],
                    vector_reference_id=kd["vector_ref"],
                    uploaded_by=kd["uploaded_by"],
                    timestamp=kd["timestamp"]
                )
                db.add(doc_obj)
            db.commit()
            print(f"✓ Seeded {len(kb_docs)} documents into ai_knowledge_base_documents")

        print("=== OPTION 25 SEEDING COMPLETED SUCCESSFULLY! ===")

    except Exception as e:
        db.rollback()
        print(f"ERROR during Option 25 seeding: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_security_and_audits()
