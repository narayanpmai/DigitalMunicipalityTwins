import uuid
from core.database import SessionLocal
from models.ward import Ward

def seed_wards():
    db = SessionLocal()
    existing = db.query(Ward).filter(
        (Ward.tenant_id == 'panchpokhari') | (Ward.tenant_id == None)
    ).count()
    if existing > 0:
        print("Panchpokhari wards already exist.")
        db.close()
        return

    PANCHPOKHARI_WARDS = [
        {'ward': 1, 'name': 'बाँसखर्क', 'chair': 'श्री दावा छिरिङ लामा', 'pop': 2092, 'hh': 588, 'sec': 'सुरेश तामाङ', 'phone': '९८४३०१२३४१'},
        {'ward': 2, 'name': 'बरुवा', 'chair': 'श्री छिरिङ ग्याल्बो लामा', 'pop': 1696, 'hh': 480, 'sec': 'पेम्बा दोर्जे', 'phone': '९८४३०१२३४२'},
        {'ward': 3, 'name': 'भोताङ', 'chair': 'श्री ङिमा छिरिङ तामाङ', 'pop': 3003, 'hh': 820, 'sec': 'कर्मा लामा', 'phone': '९८४३०१२३४३'},
        {'ward': 4, 'name': 'थाङपालकोट', 'chair': 'श्री पासाङ लामा', 'pop': 2687, 'hh': 740, 'sec': 'दावा साङ्गे', 'phone': '९८४३०१२३४४'},
        {'ward': 5, 'name': 'गुन्सा', 'chair': 'श्री सन्त बहादुर तामाङ', 'pop': 2288, 'hh': 640, 'sec': 'विकास थापा', 'phone': '९८४३०१२३४५'},
        {'ward': 6, 'name': 'थाङपालधाप', 'chair': 'श्री रामप्रसाद भट्टराई', 'pop': 3236, 'hh': 910, 'sec': 'दिनेश पौडेल', 'phone': '९८४३०१२३४६'},
        {'ward': 7, 'name': 'भोटेनाम्लाङ', 'chair': 'श्री सुके तामाङ', 'pop': 3640, 'hh': 1010, 'sec': 'राजेन्द्र श्रेष्ठ', 'phone': '९८४३०१२३४७'},
        {'ward': 8, 'name': 'लागर्चे', 'chair': 'श्री कर्ण बहादुर लामा', 'pop': 2355, 'hh': 626, 'sec': 'मोहन लामा', 'phone': '९८४३०१२३४८'},
    ]

    for w in PANCHPOKHARI_WARDS:
        db_w = Ward(
            id=uuid.uuid4(),
            tenant_id='panchpokhari',
            ward_number=w['ward'],
            name=f"वडा नं. {w['ward']} ({w['name']})",
            ward_chair_name=w['chair'],
            chairperson=w['chair'],
            secretary=w['sec'],
            phone=w['phone'],
            population=w['pop'],
            total_population=w['pop'],
            male_population=int(w['pop'] * 0.505),
            female_population=int(w['pop'] * 0.495),
            households=w['hh'],
            schools=5,
            health_posts=1,
            is_active=True
        )
        db.add(db_w)

    db.commit()
    print("Successfully seeded Panchpokhari wards!")
    db.close()

if __name__ == '__main__':
    seed_wards()
