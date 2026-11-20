import sys
sys.path.insert(0, 'fastapi-backend')
from core.database import SessionLocal
from models.setting import SystemSetting
from models.recruitment import JobApplication, VacancyAnnouncement
import uuid

def sync_data():
    db = SessionLocal()
    print("=== SYNCING LETTERHEAD SETTINGS & RECRUITMENT EXAM DATES ===")
    
    # 1. Update/Ensure panchpokhari letterhead settings
    panchpokhari_settings = {
        "palika_name": "पाँचपोखरी थाङपाल गाउँपालिका",
        "palika_name_en": "Panchpokhari Thangpal Rural Municipality",
        "local_gov_type": "स्थानीय सरकार",
        "office_title": "गाउँकार्यपालिकाको कार्यालय",
        "location": "थाङ्पालधाप, सिन्धुपाल्चोक",
        "address": "गाउँ कार्यपालिकाको कार्यालय, थाङ्पालधाप, सिन्धुपाल्चोक",
        "province_country": "वाग्मती प्रदेश, नेपाल",
        "province": "बागमती प्रदेश",
        "district": "सिन्धुपाल्चोक",
        "headquarters": "थाङ्पालधाप, मानेखर्क",
        "established_year": "२०७३",
        "active_fiscal_year": "२०८३/०८४",
        "slogan": "“शिक्षा, स्वास्थ्य, कृषि र पर्यटन: समृद्ध पाँचपोखरीको मूलधन”",
        "email": "ito.panchpokharithangpalmun@gmail.com",
        "phone": "+9779851109808",
        "website": "http://panchpokharithangpalmun.gov.np/",
        "letterhead_primary_color": "#dc2626",
        "letterhead_alignment": "center",
        "letterhead_font_family": "Mukta",
        "letterhead_show_nepal_sambat": "true",
        "letterhead_show_qr": "true",
        "logo_url": "/panchpokhari-logo.png",
        "emblem_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Emblem_of_Nepal.svg/240px-Emblem_of_Nepal.svg.png",
    }
    
    for k, v in panchpokhari_settings.items():
        rec = db.query(SystemSetting).filter(
            SystemSetting.tenant_id == "panchpokhari",
            SystemSetting.key == k
        ).first()
        if not rec:
            rec = SystemSetting(
                id=str(uuid.uuid4()),
                tenant_id="panchpokhari",
                key=k,
                value=v
            )
            db.add(rec)
            print(f"Added setting: {k} = {v}")
        else:
            rec.value = v
            print(f"Updated setting: {k} = {v}")
            
    # 2. Sync Vacancy exam date to all linked JobApplications
    vacancies = db.query(VacancyAnnouncement).all()
    for vac in vacancies:
        if vac.exam_date_bs:
            updated_apps = db.query(JobApplication).filter(
                (JobApplication.vacancy_id == vac.id) | (JobApplication.vacancy_no == vac.vacancy_no)
            ).all()
            for app in updated_apps:
                old_date = app.exam_date_time
                app.exam_date_time = vac.exam_date_bs
                print(f"Synced Application {app.application_no} ({app.full_name_np}): {old_date} -> {app.exam_date_time}")
                
    db.commit()
    print("Database sync completed successfully!")
    
    # 3. Verify
    apps = db.query(JobApplication).all()
    print("\nVerified Job Applications:")
    for a in apps:
        print(f"  App: {a.application_no} | Name: {a.full_name_np} | Cit: {a.citizenship_no} | Vacancy: {a.vacancy_no} | ExamDate: {a.exam_date_time}")

if __name__ == "__main__":
    sync_data()
