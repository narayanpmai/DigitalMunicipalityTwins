import uuid
from datetime import date, datetime
from core.database import SessionLocal
from models.master_data import OrganizationMaster, InfrastructureMaster, AssetMaster

TENANT_ID = "f07c2bcc-81ad-4e27-aeff-1a65f04e9f06"

# 12 Detailed authentic Organizations across Panchpokhari Thangpal Rural Municipality
MDM_ORGANIZATIONS = [
    {
        "id": "org-mdm-001",
        "org_type": "school",
        "name": "श्री थाङपाल भ्याली माध्यमिक विद्यालय",
        "registration_no": "PTRM-EDU-01/2070",
        "address_id": "addr-05",
        "contact_person": "सुकदेव सापकोटा (प्रधानाध्यापक)",
        "phone": "९८५११३४५६१",
        "established_date_bs": "२०२२/०१/१४",
    },
    {
        "id": "org-mdm-002",
        "org_type": "school",
        "name": "श्री भोताङ देवी माध्यमिक विद्यालय",
        "registration_no": "PTRM-EDU-02/2071",
        "address_id": "addr-06",
        "contact_person": "निमा दावा शेर्पा (प्रधानाध्यापक)",
        "phone": "९८४१२२३३४१",
        "established_date_bs": "२०२८/०५/२०",
    },
    {
        "id": "org-mdm-003",
        "org_type": "school",
        "name": "श्री रैथाने आधारभूत विद्यालय",
        "registration_no": "PTRM-EDU-03/2074",
        "address_id": "addr-01",
        "contact_person": "धन बहादुर तामाङ (प्रअ)",
        "phone": "९८६०११४४५५",
        "established_date_bs": "२०४५/०८/१०",
    },
    {
        "id": "org-mdm-004",
        "org_type": "school",
        "name": "श्री तिपेनी माध्यमिक विद्यालय",
        "registration_no": "PTRM-EDU-04/2072",
        "address_id": "addr-03",
        "contact_person": "रामचन्द्र श्रेष्ठ (प्रअ)",
        "phone": "९८४३५५६६७७",
        "established_date_bs": "२०३५/११/०५",
    },
    {
        "id": "org-mdm-005",
        "org_type": "health",
        "name": "पाँचपोखरी प्राथमिक अस्पताल तथा ट्रमा सेन्टर",
        "registration_no": "PTRM-HLT-01/2078",
        "address_id": "addr-05",
        "contact_person": "डा. रोशन श्रेष्ठ (मेडिकल सुपरिटेन्डेन्ट)",
        "phone": "०११-४९०११०",
        "established_date_bs": "२०७८/०३/१५",
    },
    {
        "id": "org-mdm-006",
        "org_type": "health",
        "name": "गुन्सा आधारभूत स्वास्थ्य सेवा केन्द्र",
        "registration_no": "PTRM-HLT-02/2079",
        "address_id": "addr-09",
        "contact_person": "सरिता लामा (सिनियर अहेब)",
        "phone": "९८०३३४४५११",
        "established_date_bs": "२०७६/०९/२२",
    },
    {
        "id": "org-mdm-007",
        "org_type": "health",
        "name": "हौथले स्वास्थ्य चौकी",
        "registration_no": "PTRM-HLT-03/2075",
        "address_id": "addr-15",
        "contact_person": "प्रकाश सापकोटा (एच.ए.)",
        "phone": "९८४९२२८८३३",
        "established_date_bs": "२०५२/०२/०८",
    },
    {
        "id": "org-mdm-008",
        "org_type": "cooperative",
        "name": "पाँचपोखरी कृषि तथा जडीबुटी सहकारी संस्था लि.",
        "registration_no": "PTRM-COP-12/2075",
        "address_id": "addr-06",
        "contact_person": "पासाङ दोर्जे तामाङ (अध्यक्ष)",
        "phone": "९८५११२३४५६",
        "established_date_bs": "२०७२/०४/१२",
    },
    {
        "id": "org-mdm-009",
        "org_type": "cooperative",
        "name": "थाङपाल महिला बहुउद्देश्यीय बचत तथा ऋण सहकारी संस्था",
        "registration_no": "PTRM-COP-08/2076",
        "address_id": "addr-07",
        "contact_person": "कुमारी तामाङ (अध्यक्ष)",
        "phone": "९८१२६७८९०१",
        "established_date_bs": "२०७४/०६/१८",
    },
    {
        "id": "org-mdm-010",
        "org_type": "cooperative",
        "name": "सिन्धु दुग्ध उत्पादक सहकारी संस्था",
        "registration_no": "PTRM-COP-15/2077",
        "address_id": "addr-11",
        "contact_person": "केशव प्रसाद ढकाल (व्यवस्थापक)",
        "phone": "९८४१८८२२३३",
        "established_date_bs": "२०७५/०३/२५",
    },
    {
        "id": "org-mdm-011",
        "org_type": "committee",
        "name": "पाँचपोखरी बृहत लिफ्टिङ खानेपानी उपभोक्ता समिति",
        "registration_no": "PTRM-WUA-05/2079",
        "address_id": "addr-05",
        "contact_person": "मिङमार तामाङ (संयोजक)",
        "phone": "९८०३३४४५५६",
        "established_date_bs": "२०७९/०१/१०",
    },
    {
        "id": "org-mdm-012",
        "org_type": "committee",
        "name": "याङ्ग्री-लागर्चे सिँचाइ तथा तटबन्ध निर्माण उपभोक्ता समिति",
        "registration_no": "PTRM-IRR-02/2080",
        "address_id": "addr-13",
        "contact_person": "दावा ग्याल्जेन शेर्पा (अध्यक्ष)",
        "phone": "९८२३४५६७८९",
        "established_date_bs": "२०८०/०२/०१",
    }
]

# 12 Detailed authentic Infrastructure Assets across Panchpokhari Thangpal Rural Municipality
MDM_INFRASTRUCTURE = [
    {
        "id": "inf-mdm-001",
        "infra_type": "road",
        "name": "मेलम्ची-तिपेनी-भोताङ मुख्य सडक (कालोपत्रे तथा ग्राभेल)",
        "ward_id": "ward-03",
        "length_or_capacity": "२१.४ कि.मी.",
        "built_year": "२०७७",
        "status": "operational",
        "geometry_geojson": {
            "type": "LineString",
            "coordinates": [[85.582, 27.912], [85.595, 27.928], [85.598, 27.935], [85.612, 27.954]]
        }
    },
    {
        "id": "inf-mdm-002",
        "infra_type": "road",
        "name": "थाङपालधाप-गुन्सा कृषि सडक खण्ड",
        "ward_id": "ward-05",
        "length_or_capacity": "८.२ कि.मी.",
        "built_year": "२०७९",
        "status": "operational",
        "geometry_geojson": {
            "type": "LineString",
            "coordinates": [[85.598, 27.935], [85.610, 27.945], [85.621, 27.962]]
        }
    },
    {
        "id": "inf-mdm-003",
        "infra_type": "road",
        "name": "बाँसखर्क-याङ्ग्री लिंक रोड स्तरोन्नति",
        "ward_id": "ward-01",
        "length_or_capacity": "६.५ कि.मी.",
        "built_year": "२०८०",
        "status": "under_construction",
        "geometry_geojson": {
            "type": "LineString",
            "coordinates": [[85.570, 27.895], [85.578, 27.905], [85.582, 27.912]]
        }
    },
    {
        "id": "inf-mdm-004",
        "infra_type": "road",
        "name": "लागर्चे-मानेखर्क पदमार्ग तथा कृषि चक्रपथ",
        "ward_id": "ward-08",
        "length_or_capacity": "९.० कि.मी.",
        "built_year": "२०७८",
        "status": "operational",
        "geometry_geojson": {
            "type": "LineString",
            "coordinates": [[85.630, 27.970], [85.645, 27.985], [85.655, 27.995]]
        }
    },
    {
        "id": "inf-mdm-005",
        "infra_type": "bridge",
        "name": "याङ्ग्री खोला आरसीसी डबल-लेन मोटरेबल पुल",
        "ward_id": "ward-02",
        "length_or_capacity": "४५.० मिटर",
        "built_year": "२०७९",
        "status": "operational",
        "geometry_geojson": {
            "type": "Point",
            "coordinates": [85.5820, 27.9120]
        }
    },
    {
        "id": "inf-mdm-006",
        "infra_type": "bridge",
        "name": "भोताङ-छ्योपार झोलुङ्गे पुल (Suspension Bridge)",
        "ward_id": "ward-03",
        "length_or_capacity": "१२६.० मिटर",
        "built_year": "२०७६",
        "status": "operational",
        "geometry_geojson": {
            "type": "Point",
            "coordinates": [85.6180, 27.9580]
        }
    },
    {
        "id": "inf-mdm-007",
        "infra_type": "bridge",
        "name": "इन्द्रावती सहायक खोला कजवे तथा पुल",
        "ward_id": "ward-06",
        "length_or_capacity": "३५.० मिटर",
        "built_year": "२०८०",
        "status": "operational",
        "geometry_geojson": {
            "type": "Point",
            "coordinates": [85.6290, 27.9680]
        }
    },
    {
        "id": "inf-mdm-008",
        "infra_type": "water_supply",
        "name": "पाँचपोखरी एक घर एक धारा बृहत् खानेपानी आयोजना",
        "ward_id": "ward-03",
        "length_or_capacity": "५५० घरधुरी क्षमता",
        "built_year": "२०८१",
        "status": "operational",
        "geometry_geojson": {
            "type": "Point",
            "coordinates": [85.6050, 27.9420]
        }
    },
    {
        "id": "inf-mdm-009",
        "infra_type": "water_supply",
        "name": "बरुवा लिफ्टिङ शुद्धीकरण खानेपानी स्किम",
        "ward_id": "ward-05",
        "length_or_capacity": "३२० घरधुरी क्षमता",
        "built_year": "२०८०",
        "status": "operational",
        "geometry_geojson": {
            "type": "Point",
            "coordinates": [85.5740, 27.9510]
        }
    },
    {
        "id": "inf-mdm-010",
        "infra_type": "building",
        "name": "पाँचपोखरी गाउँ कार्यपालिका प्रशासनिक मुख्य भवन",
        "ward_id": "ward-03",
        "length_or_capacity": "३ तल्ला (२४ कोठा)",
        "built_year": "२०७८",
        "status": "operational",
        "geometry_geojson": {
            "type": "Point",
            "coordinates": [85.5982, 27.9354]
        }
    },
    {
        "id": "inf-mdm-011",
        "infra_type": "building",
        "name": "वडा नं. ४ कार्यालय तथा सामुदायिक सेवा भवन",
        "ward_id": "ward-04",
        "length_or_capacity": "२ तल्ला (८ कोठा)",
        "built_year": "२०७९",
        "status": "operational",
        "geometry_geojson": {
            "type": "Point",
            "coordinates": [85.6025, 27.9395]
        }
    },
    {
        "id": "inf-mdm-012",
        "infra_type": "irrigation",
        "name": "मानेखर्क-गुन्सा पकेट क्षेत्र सिँचाइ नहर",
        "ward_id": "ward-06",
        "length_or_capacity": "३.८ कि.मी. (१२० हेक्टर)",
        "built_year": "२०७८",
        "status": "operational",
        "geometry_geojson": {
            "type": "LineString",
            "coordinates": [[85.615, 27.955], [85.625, 27.965], [85.635, 27.975]]
        }
    }
]

# 12 Detailed authentic Assets & Machinery across Panchpokhari Thangpal Rural Municipality
MDM_ASSETS = [
    {
        "id": "ast-mdm-001",
        "asset_category": "heavy_equipment",
        "asset_name": "JCB 3DX Super Backhoe Loader (बा २ क ४५०१)",
        "specification": "76 HP Turbocharged Diesel Engine, 0.26 cu.m Backhoe Bucket, 1.0 cu.m Shovel, 4WD",
        "purchase_date": date(2021, 5, 20),
        "cost": 4800000.0,
        "condition": "good",
        "assigned_to": "पूर्वाधार तथा विपद् व्यवस्थापन शाखा",
    },
    {
        "id": "ast-mdm-002",
        "asset_category": "heavy_equipment",
        "asset_name": "CAT 320D Hydraulic Excavator (बा १ क ९८०२)",
        "specification": "148 HP Cat C6.4 ACERT Engine, 1.0 cu.m Heavy Duty Rock Bucket, Operating Weight 20 Ton",
        "purchase_date": date(2022, 3, 15),
        "cost": 12500000.0,
        "condition": "good",
        "assigned_to": "योजना तथा सडक पूर्वाधार शाखा",
    },
    {
        "id": "ast-mdm-003",
        "asset_category": "heavy_equipment",
        "asset_name": "CASE 1107 EX-D Soil Compactor / Road Roller (बा १ क ३३२१)",
        "specification": "105 HP Water-cooled Diesel Engine, 11-Ton Operating Weight, Dual Vibration Frequency",
        "purchase_date": date(2021, 9, 10),
        "cost": 3600000.0,
        "condition": "good",
        "assigned_to": "सडक मर्मत तथा स्तरउन्नति एकाइ",
    },
    {
        "id": "ast-mdm-004",
        "asset_category": "vehicle",
        "asset_name": "Toyota Land Cruiser 4WD Ambulance - Type 'A' ALS (बा १ झ ९८३४)",
        "specification": "4.2L 6-Cylinder Diesel, Ventilator, Defibrillator, Multipara Monitor, High-altitude Oxygen",
        "purchase_date": date(2022, 1, 10),
        "cost": 6200000.0,
        "condition": "good",
        "assigned_to": "पाँचपोखरी प्राथमिक अस्पताल तथा ट्रमा सेन्टर",
    },
    {
        "id": "ast-mdm-005",
        "asset_category": "vehicle",
        "asset_name": "Mahindra Bolero 4WD Rapid Response Disaster Rescue Vehicle (बा २ झ ११२०)",
        "specification": "2.5L m2DiCR Turbo Engine, 4x4 with Differential Lock, Winch Cable, Searchlights, PA Siren",
        "purchase_date": date(2022, 8, 25),
        "cost": 3100000.0,
        "condition": "good",
        "assigned_to": "विपद् पूर्वतयारी तथा उद्धार टोली",
    },
    {
        "id": "ast-mdm-006",
        "asset_category": "vehicle",
        "asset_name": "Tata Tipper Truck 1618 (बा १ ग ५६४४)",
        "specification": "180 HP Turbotronn BS-IV Engine, 10.5 cu.m Box Tipper Body, Heavy Duty Leaf Spring Suspension",
        "purchase_date": date(2021, 11, 5),
        "cost": 3400000.0,
        "condition": "good",
        "assigned_to": "फोहोरमैला तथा निर्माण सामग्री ढुवानी शाखा",
    },
    {
        "id": "ast-mdm-007",
        "asset_category": "vehicle",
        "asset_name": "Mahindra Scorpio S11 4WD Executive Vehicle (बा १ झ ४४३२)",
        "specification": "2.2L mHawk 140 HP Engine, 4WD Shift-on-Fly, 7 Seater, High Ground Clearance (180mm)",
        "purchase_date": date(2020, 6, 18),
        "cost": 5800000.0,
        "condition": "good",
        "assigned_to": "गाउँ कार्यपालिका कार्यालय (अध्यक्ष / प्रमुख प्रशासकीय अधिकृत)",
    },
    {
        "id": "ast-mdm-008",
        "asset_category": "it_hardware",
        "asset_name": "Dell PowerEdge R750 Enterprise Datacenter Server (Twin Node)",
        "specification": "2x Intel Xeon Silver 4314 (32 Cores), 256GB ECC DDR4 RAM, 8x 3.84TB NVMe SSD RAID-10",
        "purchase_date": date(2023, 2, 10),
        "cost": 2400000.0,
        "condition": "good",
        "assigned_to": "सूचना प्रविधि शाखा (Municipal Digital Twin Hosting)",
    },
    {
        "id": "ast-mdm-009",
        "asset_category": "medical_equipment",
        "asset_name": "GE Voluson P8 4D Color Doppler Ultrasound Machine",
        "specification": "Convex, Transvaginal and Linear Probes, High-Resolution 17-inch Display, HDlive Rendering",
        "purchase_date": date(2022, 10, 12),
        "cost": 3200000.0,
        "condition": "good",
        "assigned_to": "पाँचपोखरी प्राथमिक अस्पताल (मातृ तथा नवजात शिशु कक्ष)",
    },
    {
        "id": "ast-mdm-010",
        "asset_category": "medical_equipment",
        "asset_name": "Mindray BC-5150 Auto 5-Part Hematology Blood Analyzer",
        "specification": "60 Tests/Hour, Laser Scatter + Chemical Dye Method, 25 Parameters + 3 Histograms",
        "purchase_date": date(2022, 11, 20),
        "cost": 1650000.0,
        "condition": "good",
        "assigned_to": "अस्पताल केन्द्रीय प्याथोलोजी ल्याब",
    },
    {
        "id": "ast-mdm-011",
        "asset_category": "it_hardware",
        "asset_name": "MikroTik Cloud Core Router CCR2004 & Optical Distribution Frame",
        "specification": "Annapurna Labs Alpine 4-Core CPU, 4GB RAM, 16x 10G SFP+ Ports, Redundant Power Supplies",
        "purchase_date": date(2023, 4, 5),
        "cost": 450000.0,
        "condition": "good",
        "assigned_to": "सूचना प्रविधि शाखा (पालिका तथा वडा फाइबर नेटवर्क)",
    },
    {
        "id": "ast-mdm-012",
        "asset_category": "disaster_relief_gear",
        "asset_name": "DJI Matrice 300 RTK Survey & Thermal Disaster Drone Kit",
        "specification": "Zenmuse H20T Hybrid Quad-Sensor (Thermal + 20MP Zoom + Laser Rangefinder), RTK D-RTK 2 Station",
        "purchase_date": date(2023, 7, 1),
        "cost": 1850000.0,
        "condition": "good",
        "assigned_to": "डिजिटल जुम्ल्याहा, नापी तथा विपद् व्यवस्थापन एकाइ",
    }
]

def seed_mdm_core():
    db = SessionLocal()
    try:
        print("🚀 Starting MDM Core Entities Seeding (Option 37)...")

        # 1. Seed Organizations (mdm_organizations)
        orgs_seeded = 0
        for item in MDM_ORGANIZATIONS:
            existing = db.query(OrganizationMaster).filter(OrganizationMaster.id == item["id"]).first()
            if not existing:
                org = OrganizationMaster(
                    id=item["id"],
                    org_type=item["org_type"],
                    name=item["name"],
                    registration_no=item["registration_no"],
                    address_id=item["address_id"],
                    contact_person=item["contact_person"],
                    phone=item["phone"],
                    established_date_bs=item["established_date_bs"],
                    tenant_id=TENANT_ID,
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow()
                )
                db.add(org)
                orgs_seeded += 1
        db.commit()
        print(f"  ✓ Seeded {orgs_seeded} organizations into mdm_organizations.")

        # 2. Seed Infrastructure (mdm_infrastructure)
        infra_seeded = 0
        for item in MDM_INFRASTRUCTURE:
            existing = db.query(InfrastructureMaster).filter(InfrastructureMaster.id == item["id"]).first()
            if not existing:
                infra = InfrastructureMaster(
                    id=item["id"],
                    infra_type=item["infra_type"],
                    name=item["name"],
                    ward_id=item["ward_id"],
                    length_or_capacity=item["length_or_capacity"],
                    built_year=item["built_year"],
                    geometry_geojson=item["geometry_geojson"],
                    status=item["status"],
                    tenant_id=TENANT_ID,
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow()
                )
                db.add(infra)
                infra_seeded += 1
        db.commit()
        print(f"  ✓ Seeded {infra_seeded} assets into mdm_infrastructure.")

        # 3. Seed Assets (mdm_assets)
        assets_seeded = 0
        for item in MDM_ASSETS:
            existing = db.query(AssetMaster).filter(AssetMaster.id == item["id"]).first()
            if not existing:
                asset = AssetMaster(
                    id=item["id"],
                    asset_category=item["asset_category"],
                    asset_name=item["asset_name"],
                    specification=item["specification"],
                    purchase_date=item["purchase_date"],
                    cost=item["cost"],
                    condition=item["condition"],
                    assigned_to=item["assigned_to"],
                    tenant_id=TENANT_ID,
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow()
                )
                db.add(asset)
                assets_seeded += 1
        db.commit()
        print(f"  ✓ Seeded {assets_seeded} machinery & assets into mdm_assets.")

        print("🎉 MDM Core Entities Seeding Successfully Completed!")
    except Exception as e:
        db.rollback()
        print(f"❌ Error during MDM seeding: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_mdm_core()
