"""
Seed Environmental Risks & Natural Resources
Panchpokhari Thangpal Rural Municipality Digital Twins
Option 34 Database Seeding
"""
from datetime import datetime
from core.database import SessionLocal
from models.gis_resources import EnvironmentalRiskZone, NaturalResourceMaster

TENANT_ID = "f07c2bcc-81ad-4e27-aeff-1a65f04e9f06"

ENVIRONMENTAL_RISKS_DATA = [
    {
        "id": "RISK-001",
        "risk_type": "Flood",
        "severity_level": "Extreme",
        "mitigation_status": "Monitoring",
        "gis_polygon": {
            "type": "Polygon",
            "coordinates": [[
                [85.5890, 27.9150],
                [85.5940, 27.9180],
                [85.6020, 27.9120],
                [85.5980, 27.9050],
                [85.5890, 27.9150]
            ]]
        }
    },
    {
        "id": "RISK-002",
        "risk_type": "Landslide",
        "severity_level": "High",
        "mitigation_status": "In Progress",
        "gis_polygon": {
            "type": "Polygon",
            "coordinates": [[
                [85.6320, 27.9850],
                [85.6380, 27.9900],
                [85.6420, 27.9830],
                [85.6360, 27.9780],
                [85.6320, 27.9850]
            ]]
        }
    },
    {
        "id": "RISK-003",
        "risk_type": "GLOF",
        "severity_level": "Extreme",
        "mitigation_status": "Early Warning Installed",
        "gis_polygon": {
            "type": "Polygon",
            "coordinates": [[
                [85.7050, 28.0350],
                [85.7200, 28.0450],
                [85.7250, 28.0380],
                [85.7120, 28.0290],
                [85.7050, 28.0350]
            ]]
        }
    },
    {
        "id": "RISK-004",
        "risk_type": "Landslide",
        "severity_level": "High",
        "mitigation_status": "Mitigated",
        "gis_polygon": {
            "type": "Polygon",
            "coordinates": [[
                [85.5850, 27.8720],
                [85.5920, 27.8760],
                [85.5950, 27.8700],
                [85.5880, 27.8650],
                [85.5850, 27.8720]
            ]]
        }
    },
    {
        "id": "RISK-005",
        "risk_type": "Avalanche",
        "severity_level": "High",
        "mitigation_status": "Monitoring",
        "gis_polygon": {
            "type": "Polygon",
            "coordinates": [[
                [85.5780, 28.0180],
                [85.5860, 28.0250],
                [85.5900, 28.0190],
                [85.5820, 28.0120],
                [85.5780, 28.0180]
            ]]
        }
    },
    {
        "id": "RISK-006",
        "risk_type": "Forest Fire",
        "severity_level": "Moderate",
        "mitigation_status": "Monitoring",
        "gis_polygon": {
            "type": "Polygon",
            "coordinates": [[
                [85.5600, 27.9550],
                [85.5680, 27.9620],
                [85.5720, 27.9560],
                [85.5650, 27.9490],
                [85.5600, 27.9550]
            ]]
        }
    },
    {
        "id": "RISK-007",
        "risk_type": "Flood",
        "severity_level": "High",
        "mitigation_status": "In Progress",
        "gis_polygon": {
            "type": "Polygon",
            "coordinates": [[
                [85.6050, 27.9220],
                [85.6120, 27.9280],
                [85.6180, 27.9210],
                [85.6090, 27.9150],
                [85.6050, 27.9220]
            ]]
        }
    },
    {
        "id": "RISK-008",
        "risk_type": "Soil Erosion",
        "severity_level": "Moderate",
        "mitigation_status": "Mitigated",
        "gis_polygon": {
            "type": "Polygon",
            "coordinates": [[
                [85.5820, 27.9020],
                [85.5890, 27.9080],
                [85.5930, 27.9010],
                [85.5860, 27.8960],
                [85.5820, 27.9020]
            ]]
        }
    }
]

NATURAL_RESOURCES_DATA = [
    {
        "id": "NAT-001",
        "resource_type": "River/Stream",
        "name": "याङ्ग्री खोला जलाधार तथा जलस्रोत क्षेत्र (Yangri River Basin)",
        "ward_id": "2",
        "area_or_length": 28.5,
        "conservation_status": "Protected",
        "management_committee_id": "WUA-YANGRI-01",
        "gis_geometry": {
            "type": "LineString",
            "coordinates": [
                [85.5750, 28.0350],
                [85.5820, 27.9950],
                [85.5890, 27.9500],
                [85.5960, 27.9150]
            ]
        }
    },
    {
        "id": "NAT-002",
        "resource_type": "Glacial Lake",
        "name": "पाँचपोखरी ५ वटा पवित्र हिमताल समूह (Panchpokhari Sacred Lakes)",
        "ward_id": "3",
        "area_or_length": 42.8,
        "conservation_status": "Protected",
        "management_committee_id": "RAMSAR-PP-03",
        "gis_geometry": {
            "type": "Polygon",
            "coordinates": [[
                [85.7100, 28.0380],
                [85.7180, 28.0430],
                [85.7220, 28.0390],
                [85.7150, 28.0330],
                [85.7100, 28.0380]
            ]]
        }
    },
    {
        "id": "NAT-003",
        "resource_type": "Community Forest",
        "name": "तार्केघ्याङ धुपी, सल्ला तथा गुराँस सामुदायिक वन (Tarkeghyang Alpine Forest)",
        "ward_id": "2",
        "area_or_length": 385.0,
        "conservation_status": "Community Managed",
        "management_committee_id": "CFUG-TARKE-02",
        "gis_geometry": {
            "type": "Polygon",
            "coordinates": [[
                [85.5520, 27.9980],
                [85.5650, 28.0080],
                [85.5710, 28.0010],
                [85.5580, 27.9920],
                [85.5520, 27.9980]
            ]]
        }
    },
    {
        "id": "NAT-004",
        "resource_type": "Medicinal Herb Zone",
        "name": "भोताङ यार्चागुम्बा तथा हिमाली बहुमूल्य जडीबुटी क्षेत्र (Alpine Herbs Zone)",
        "ward_id": "3",
        "area_or_length": 520.0,
        "conservation_status": "Sustainably Harvested",
        "management_committee_id": "HERB-BHOTANG-03",
        "gis_geometry": {
            "type": "Polygon",
            "coordinates": [[
                [85.6500, 28.0100],
                [85.6700, 28.0250],
                [85.6800, 28.0150],
                [85.6600, 28.0020],
                [85.6500, 28.0100]
            ]]
        }
    },
    {
        "id": "NAT-005",
        "resource_type": "Mineral Deposit",
        "name": "गुन्सा परम्परागत स्लेट तथा ढुङ्गा खानी (Gunsa Traditional Slate Quarry)",
        "ward_id": "5",
        "area_or_length": 18.5,
        "conservation_status": "Community Managed",
        "management_committee_id": "QUARRY-GUNSA-05",
        "gis_geometry": {
            "type": "Polygon",
            "coordinates": [[
                [85.6080, 27.9220],
                [85.6150, 27.9270],
                [85.6180, 27.9210],
                [85.6110, 27.9170],
                [85.6080, 27.9220]
            ]]
        }
    },
    {
        "id": "NAT-006",
        "resource_type": "Community Forest",
        "name": "बाँसखर्क साल तथा चिलाउने जैविक विविधता वन (Banskharka Sal Forest)",
        "ward_id": "1",
        "area_or_length": 215.0,
        "conservation_status": "Community Managed",
        "management_committee_id": "CFUG-BANS-01",
        "gis_geometry": {
            "type": "Polygon",
            "coordinates": [[
                [85.5580, 27.9510],
                [85.5690, 27.9590],
                [85.5740, 27.9520],
                [85.5630, 27.9450],
                [85.5580, 27.9510]
            ]]
        }
    },
    {
        "id": "NAT-007",
        "resource_type": "Wetland",
        "name": "थाङपालधाप सिमसार तथा मूल जलस्रोत क्षेत्र (Thangpaldhap Wetland)",
        "ward_id": "6",
        "area_or_length": 14.2,
        "conservation_status": "Protected",
        "management_committee_id": "WUA-DHAP-06",
        "gis_geometry": {
            "type": "Polygon",
            "coordinates": [[
                [85.5720, 27.8880],
                [85.5800, 27.8940],
                [85.5840, 27.8890],
                [85.5770, 27.8820],
                [85.5720, 27.8880]
            ]]
        }
    },
    {
        "id": "NAT-008",
        "resource_type": "River/Stream",
        "name": "ड्रयागन फल्स प्राकृतिक झरना तथा जलाधार क्षेत्र (Dragon Falls Canyon)",
        "ward_id": "3",
        "area_or_length": 3.5,
        "conservation_status": "Protected",
        "management_committee_id": "ECO-DRAGON-03",
        "gis_geometry": {
            "type": "Point",
            "coordinates": [85.6420, 27.9940]
        }
    },
    {
        "id": "NAT-009",
        "resource_type": "Community Forest",
        "name": "आमा याङ्ग्री जैविक संरक्षण क्षेत्र (Ama Yangri Buffer Zone)",
        "ward_id": "2",
        "area_or_length": 640.0,
        "conservation_status": "Protected",
        "management_committee_id": "BZUC-AMAYANGRI-02",
        "gis_geometry": {
            "type": "Polygon",
            "coordinates": [[
                [85.5790, 28.0150],
                [85.5920, 28.0260],
                [85.5980, 28.0180],
                [85.5860, 28.0090],
                [85.5790, 28.0150]
            ]]
        }
    },
    {
        "id": "NAT-010",
        "resource_type": "Mineral Deposit",
        "name": "लार्के खोला म्याग्नेसाइट तथा चुनढुङ्गा सम्भाव्य क्षेत्र (Larke Khola Minerals)",
        "ward_id": "4",
        "area_or_length": 25.0,
        "conservation_status": "Community Managed",
        "management_committee_id": "GEO-THANGPAL-04",
        "gis_geometry": {
            "type": "Polygon",
            "coordinates": [[
                [85.5840, 27.9010],
                [85.5930, 27.9070],
                [85.5970, 27.9000],
                [85.5890, 27.8950],
                [85.5840, 27.9010]
            ]]
        }
    }
]

def seed():
    db = SessionLocal()
    try:
        print("🌱 Seeding gis_environmental_risks...")
        existing_risks = db.query(EnvironmentalRiskZone).count()
        if existing_risks == 0:
            for item in ENVIRONMENTAL_RISKS_DATA:
                rec = EnvironmentalRiskZone(
                    id=item["id"],
                    tenant_id=TENANT_ID,
                    risk_type=item["risk_type"],
                    severity_level=item["severity_level"],
                    mitigation_status=item["mitigation_status"],
                    gis_polygon=item["gis_polygon"],
                )
                db.add(rec)
            db.commit()
            print(f"✅ Inserted {len(ENVIRONMENTAL_RISKS_DATA)} environmental risk records.")
        else:
            print(f"ℹ️ gis_environmental_risks already has {existing_risks} rows.")

        print("🌱 Seeding gis_natural_resources...")
        existing_res = db.query(NaturalResourceMaster).count()
        if existing_res == 0:
            for item in NATURAL_RESOURCES_DATA:
                rec = NaturalResourceMaster(
                    id=item["id"],
                    tenant_id=TENANT_ID,
                    resource_type=item["resource_type"],
                    name=item["name"],
                    ward_id=item["ward_id"],
                    area_or_length=item["area_or_length"],
                    conservation_status=item["conservation_status"],
                    management_committee_id=item["management_committee_id"],
                    gis_geometry=item["gis_geometry"],
                )
                db.add(rec)
            db.commit()
            print(f"✅ Inserted {len(NATURAL_RESOURCES_DATA)} natural resource records.")
        else:
            print(f"ℹ️ gis_natural_resources already has {existing_res} rows.")

    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding GIS environmental & natural resources: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed()
