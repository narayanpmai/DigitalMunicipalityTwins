"""
Initialize and Seed Solid Waste Management Schema and Data
Panchpokhari Thangpal Gaupalika - Municipal Digital Twins
"""
import uuid
from datetime import datetime
from decimal import Decimal
from core.database import engine, SessionLocal, Base
from models.waste_management import (
    WasteVehicle,
    WasteRate,
    WasteSchedule,
    DisposalSite,
    SanitationWorker,
    WasteAlert,
    WasteWallet,
    WasteTransaction
)

def init_waste_db():
    print("Creating waste management tables...")
    Base.metadata.create_all(bind=engine)
    print("Tables verified/created.")

    db = SessionLocal()
    try:
        # 1. Seed Vehicles
        if db.query(WasteVehicle).count() == 0:
            print("Seeding waste vehicles...")
            vehicles = [
                WasteVehicle(
                    id=uuid.uuid4(),
                    license_plate="बा २ क ४५६७",
                    driver_name="राम बहादुर श्रेष्ठ",
                    route_assigned="तार्केघ्याङ रुट (वडा ३)",
                    current_lat=Decimal("27.9789000"),
                    current_lon=Decimal("85.6123000"),
                    status="active"
                ),
                WasteVehicle(
                    id=uuid.uuid4(),
                    license_plate="बा १ ख ८९२१",
                    driver_name="पेम्बा दोर्जे शेर्पा",
                    route_assigned="बरुवा-मेलम्चीघ्याङ रुट (वडा २)",
                    current_lat=Decimal("27.9880000"),
                    current_lon=Decimal("85.6310000"),
                    status="active"
                ),
                WasteVehicle(
                    id=uuid.uuid4(),
                    license_plate="बा ३ क ६१२०",
                    driver_name="सन्तोष विक",
                    route_assigned="थाङपालकोट-मानेखर्क रुट (वडा ४)",
                    current_lat=Decimal("27.9610000"),
                    current_lon=Decimal("85.5980000"),
                    status="active"
                ),
                WasteVehicle(
                    id=uuid.uuid4(),
                    license_plate="बा १ क ३३२२",
                    driver_name="टेक बहादुर तामाङ",
                    route_assigned="तिपेनी-भोटेनाम्लाङ रुट (वडा ७)",
                    current_lat=Decimal("27.9117000"),
                    current_lon=Decimal("85.5692000"),
                    status="active"
                ),
            ]
            db.add_all(vehicles)
            db.commit()
            print(f"Added {len(vehicles)} waste vehicles.")

        # 2. Seed Rates
        if db.query(WasteRate).count() == 0:
            print("Seeding waste buyback rates...")
            rates = [
                WasteRate(id=uuid.uuid4(), waste_type="प्लास्टिक (PET/HDPE)", rate_per_kg=Decimal("18.00"), color_code="#3b82f6", is_active=True),
                WasteRate(id=uuid.uuid4(), waste_type="कागज तथा कार्टुन", rate_per_kg=Decimal("12.00"), color_code="#f59e0b", is_active=True),
                WasteRate(id=uuid.uuid4(), waste_type="धातु / टिन / फलाम", rate_per_kg=Decimal("35.00"), color_code="#64748b", is_active=True),
                WasteRate(id=uuid.uuid4(), waste_type="जैविक कुहिने फोहोर (कम्पोस्ट)", rate_per_kg=Decimal("5.00"), color_code="#10b981", is_active=True),
                WasteRate(id=uuid.uuid4(), waste_type="काँच / सिसाका बोतल", rate_per_kg=Decimal("4.00"), color_code="#8b5cf6", is_active=True),
            ]
            db.add_all(rates)
            db.commit()
            print(f"Added {len(rates)} waste rates.")

        # 3. Seed Schedules
        if db.query(WasteSchedule).count() == 0:
            print("Seeding waste schedules...")
            schedules = [
                WasteSchedule(
                    id="sch-01",
                    ward_no=3,
                    route_code="RT-03-A",
                    route_name="तार्केघ्याङ मुख्य रुट (ह्योल्मो सांस्कृतिक बजार)",
                    collection_days_bio="आइतबार, बुधबार",
                    collection_days_non_bio="मंगलबार, शुक्रबार",
                    vehicle_number="बा २ क ४५६७",
                    vehicle_type="tractor",
                    driver_name="राम बहादुर श्रेष्ठ",
                    driver_phone="९८४१२३४५६७",
                    supervisor_name="सोनाम तामाङ",
                    supervisor_phone="९८५१०१२३४५",
                    status="active",
                    timing="बिहान ०६:३० - ०९:३०"
                ),
                WasteSchedule(
                    id="sch-02",
                    ward_no=2,
                    route_code="RT-02-B",
                    route_name="बरुवा तथा मेलम्चीघ्याङ पदमार्ग रुट",
                    collection_days_bio="सोमबार, बिहीबार",
                    collection_days_non_bio="शनिबार",
                    vehicle_number="बा १ ख ८९२१",
                    vehicle_type="mini_truck",
                    driver_name="पेम्बा दोर्जे शेर्पा",
                    driver_phone="९८१२३४५६७८",
                    supervisor_name="किरण दनुवार",
                    supervisor_phone="९८६००१२३४५",
                    status="active",
                    timing="बिहान ०७:०० - १०:००"
                ),
                WasteSchedule(
                    id="sch-03",
                    ward_no=4,
                    route_code="RT-04-A",
                    route_name="थाङपालकोट - मानेखर्क बजार रुट",
                    collection_days_bio="आइतबार, बुधबार",
                    collection_days_non_bio="बिहीबार",
                    vehicle_number="बा ३ क ६१२०",
                    vehicle_type="tipper",
                    driver_name="सन्तोष विक",
                    driver_phone="९८०३४५६७८९",
                    supervisor_name="मिङ्मार लामा",
                    supervisor_phone="९८४९०१२३४५",
                    status="active",
                    timing="बिहान ०६:०० - ०९:००"
                ),
                WasteSchedule(
                    id="sch-04",
                    ward_no=7,
                    route_code="RT-07-A",
                    route_name="भोटेनाम्लाङ - तिपेनी मुख्य बजार रुट",
                    collection_days_bio="आइतबार, मंगलबार, बिहीबार",
                    collection_days_non_bio="शनिबार",
                    vehicle_number="बा १ क ३३२२",
                    vehicle_type="compactor",
                    driver_name="टेक बहादुर तामाङ",
                    driver_phone="९८४१५५६६७७",
                    supervisor_name="गोपाल श्रेष्ठ",
                    supervisor_phone="९८५१०२२३३४",
                    status="active",
                    timing="बिहान ०६:०० - ०८:३०"
                ),
                WasteSchedule(
                    id="sch-05",
                    ward_no=1,
                    route_code="RT-01-A",
                    route_name="बासखर्क किबी पकेट तथा कृषि बस्ती रुट",
                    collection_days_bio="मंगलबार, शुक्रबार",
                    collection_days_non_bio="आइतबार",
                    vehicle_number="बा २ क ४५६७",
                    vehicle_type="tractor",
                    driver_name="राम बहादुर श्रेष्ठ",
                    driver_phone="९८४१२३४५६७",
                    supervisor_name="अर्जुन गिरी",
                    supervisor_phone="९८४१००११२२",
                    status="active",
                    timing="बिहान ०७:३० - १०:००"
                ),
            ]
            db.add_all(schedules)
            db.commit()
            print(f"Added {len(schedules)} waste schedules.")

        # 4. Seed Disposal Sites
        if db.query(DisposalSite).count() == 0:
            print("Seeding disposal sites...")
            sites = [
                DisposalSite(
                    id="site-01",
                    site_name="पाँचपोखरी जैविक कम्पोस्ट मल उत्पादन केन्द्र",
                    site_type="compost_plant",
                    ward_no=3,
                    location_name="तार्केघ्याङ फेदी, चिसोपानी",
                    total_area_ropani=14.0,
                    daily_capacity_tons=6.5,
                    current_utilization_percent=62.0,
                    leachate_treatment="active_biological",
                    eia_registration_no="EIA-MOFE-२०८०-०४२",
                    incharge_name="ई. रोहन थापा (वातावरण अधिकृत)",
                    incharge_phone="९८४१९९८८७७",
                    status="operational"
                ),
                DisposalSite(
                    id="site-02",
                    site_name="थाङपाल उपत्यका ट्रान्सफर तथा स्यानेटरी ल्यान्डफिल",
                    site_type="landfill_site",
                    ward_no=4,
                    location_name="मानेखर्क खोंच, वडा नं ४",
                    total_area_ropani=22.0,
                    daily_capacity_tons=12.0,
                    current_utilization_percent=48.0,
                    leachate_treatment="aeration_tank",
                    eia_registration_no="IEE-WSTD-२०७९-११",
                    incharge_name="टेक बहादुर तामाङ",
                    incharge_phone="९८५११४४०२०",
                    status="operational"
                ),
                DisposalSite(
                    id="site-03",
                    site_name="मेलम्चीघ्याङ फोहोर वर्गीकरण तथा रिसाइक्लिङ हब",
                    site_type="recycling_hub",
                    ward_no=2,
                    location_name="बजार छेउ, मेलम्चीघ्याङ",
                    total_area_ropani=6.0,
                    daily_capacity_tons=3.0,
                    current_utilization_percent=75.0,
                    leachate_treatment="soak_pit",
                    eia_registration_no="IEE-RECY-२०८१-०३",
                    incharge_name="ल्हाक्पा शेर्पा",
                    incharge_phone="९८०८३३२२११",
                    status="operational"
                ),
                DisposalSite(
                    id="site-04",
                    site_name="भोटेनाम्लाङ मिनी कम्पोस्टिङ युनिट",
                    site_type="compost_plant",
                    ward_no=7,
                    location_name="तिपेनी बजार नजिक",
                    total_area_ropani=4.5,
                    daily_capacity_tons=2.5,
                    current_utilization_percent=55.0,
                    leachate_treatment="active_biological",
                    eia_registration_no="IEE-COM-२०८१-०८",
                    incharge_name="सरिता तामाङ",
                    incharge_phone="९८४१७७८८९९",
                    status="operational"
                ),
            ]
            db.add_all(sites)
            db.commit()
            print(f"Added {len(sites)} disposal sites.")

        # 5. Seed Sanitation Workers
        if db.query(SanitationWorker).count() == 0:
            print("Seeding sanitation workers...")
            workers = [
                SanitationWorker(
                    id="wrk-01",
                    worker_code="P5-SAN-01",
                    full_name="माइला तामाङ",
                    ward_no=3,
                    role="sweeper",
                    employment_type="contract",
                    phone="९८१२००३३४४",
                    emergency_contact="सुन्तली तामाङ (श्रीमती) - ९८१२०००१११",
                    ppe_kit_status="distributed_complete",
                    ppe_distribution_date="२०८१-०५-१०",
                    ppe_items=["गमबुट", "हेभी ड्युटी पन्जा", "N95 मास्क", "फ्लोरोसेन्ट ज्याकेट", "हेल्मेट"],
                    last_health_checkup_date="२०८१-०४-१५",
                    vaccination_status="fully_vaccinated",
                    insurance_status="active"
                ),
                SanitationWorker(
                    id="wrk-02",
                    worker_code="P5-SAN-02",
                    full_name="कान्छी शेर्पा",
                    ward_no=2,
                    role="sweeper",
                    employment_type="contract",
                    phone="९८४१८८७७६६",
                    emergency_contact="पासाङ शेर्पा (दाजु) - ९८४१२२२३३३",
                    ppe_kit_status="distributed_complete",
                    ppe_distribution_date="२०८१-०५-१०",
                    ppe_items=["गमबुट", "पन्जा", "मास्क", "फ्लोरोसेन्ट ज्याकेट"],
                    last_health_checkup_date="२०८१-०४-१८",
                    vaccination_status="fully_vaccinated",
                    insurance_status="active"
                ),
                SanitationWorker(
                    id="wrk-03",
                    worker_code="P5-SAN-03",
                    full_name="राम बहादुर श्रेष्ठ",
                    ward_no=3,
                    role="driver",
                    employment_type="permanent",
                    phone="९८४१२२३३४४",
                    emergency_contact="सीता श्रेष्ठ - ९८४१२२३३९९",
                    ppe_kit_status="distributed_complete",
                    ppe_distribution_date="२०८१-०५-०१",
                    ppe_items=["पन्जा", "मास्क", "ज्याकेट", "फर्स्ट एड किट"],
                    last_health_checkup_date="२०८१-०३-२५",
                    vaccination_status="fully_vaccinated",
                    insurance_status="active"
                ),
                SanitationWorker(
                    id="wrk-04",
                    worker_code="P5-SAN-04",
                    full_name="वीर ध्वज तामाङ",
                    ward_no=4,
                    role="compost_operator",
                    employment_type="contract",
                    phone="९८०३४४५५६६",
                    emergency_contact="माया तामाङ - ९८०३४४५५००",
                    ppe_kit_status="distributed_complete",
                    ppe_distribution_date="२०८१-०४-२०",
                    ppe_items=["गमबुट", "रासायनिक सुरक्षा पन्जा", "ग्यास मास्क", "एप्रोन"],
                    last_health_checkup_date="२०८१-०३-१०",
                    vaccination_status="fully_vaccinated",
                    insurance_status="active"
                ),
                SanitationWorker(
                    id="wrk-05",
                    worker_code="P5-SAN-05",
                    full_name="कमला श्रेष्ठ",
                    ward_no=6,
                    role="sweeper",
                    employment_type="contract",
                    phone="९८४९८८७७६६",
                    emergency_contact="रमेश श्रेष्ठ - ९८४९८८७७००",
                    ppe_kit_status="distributed_complete",
                    ppe_distribution_date="२०८१-०५-१०",
                    ppe_items=["गमबुट", "पन्जा", "मास्क", "फ्लोरोसेन्ट ज्याकेट"],
                    last_health_checkup_date="२०८१-०४-२०",
                    vaccination_status="fully_vaccinated",
                    insurance_status="active"
                ),
            ]
            db.add_all(workers)
            db.commit()
            print(f"Added {len(workers)} sanitation workers.")

        # 6. Seed Alerts
        if db.query(WasteAlert).count() == 0:
            print("Seeding waste alerts...")
            alerts = [
                WasteAlert(
                    id=uuid.uuid4(),
                    issue_type="फोहोर थुप्रिएको",
                    description="तार्केघ्याङ मुख्य चोकमा फोहोर थुप्रिएको गुनासो",
                    location="वडा नं. ३, तार्केघ्याङ चोक",
                    lat=Decimal("27.9789000"),
                    lon=Decimal("85.6123000"),
                    status="pending"
                ),
                WasteAlert(
                    id=uuid.uuid4(),
                    issue_type="अवैध डम्पिङ",
                    description="खोला किनारमा अवैध प्लास्टिक डम्पिङ भएको",
                    location="वडा नं. २, मेलम्चीघ्याङ पुल छेउ",
                    lat=Decimal("27.9880000"),
                    lon=Decimal("85.6310000"),
                    status="in-progress"
                ),
                WasteAlert(
                    id=uuid.uuid4(),
                    issue_type="ढिलाइ गुनासो",
                    description="ट्र्याक्टर संकलन समयमा नआएको गुनासो समाधान",
                    location="वडा नं. ४, मानेखर्क",
                    lat=Decimal("27.9610000"),
                    lon=Decimal("85.5980000"),
                    status="resolved"
                ),
            ]
            db.add_all(alerts)
            db.commit()
            print(f"Added {len(alerts)} waste alerts.")

        # 7. Seed Wallets
        if db.query(WasteWallet).count() == 0:
            print("Seeding waste wallets...")
            from sqlalchemy import text
            hh_rows = db.execute(text('SELECT id FROM household_registries LIMIT 5')).fetchall()
            hh_ids = [r[0] for r in hh_rows]
            if hh_ids:
                wallets = [
                    WasteWallet(id=uuid.uuid4(), household_id=hh_ids[0], balance=Decimal("1450.00"), total_earned=Decimal("2200.00"), total_withdrawn=Decimal("750.00")),
                    WasteWallet(id=uuid.uuid4(), household_id=hh_ids[1 % len(hh_ids)], balance=Decimal("2100.00"), total_earned=Decimal("3100.00"), total_withdrawn=Decimal("1000.00")),
                    WasteWallet(id=uuid.uuid4(), household_id=hh_ids[2 % len(hh_ids)], balance=Decimal("980.00"), total_earned=Decimal("1500.00"), total_withdrawn=Decimal("520.00")),
                    WasteWallet(id=uuid.uuid4(), household_id=hh_ids[3 % len(hh_ids)], balance=Decimal("1850.00"), total_earned=Decimal("2600.00"), total_withdrawn=Decimal("750.00")),
                    WasteWallet(id=uuid.uuid4(), household_id=hh_ids[4 % len(hh_ids)], balance=Decimal("1320.00"), total_earned=Decimal("1900.00"), total_withdrawn=Decimal("580.00")),
                ]
                db.add_all(wallets)
                db.commit()
                print(f"Added {len(wallets)} waste wallets.")

        print("=== Waste Management database seeding completed successfully! ===")
    except Exception as e:
        db.rollback()
        print("Error during waste seeding:", e)
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    init_waste_db()
