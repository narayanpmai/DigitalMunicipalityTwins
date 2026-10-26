import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import uuid
from sqlalchemy import create_engine, text
from core.security import hash_password

engine = create_engine('postgresql://muni_user:Muni_Prod_Db_2026!#p5@127.0.0.1:5432/municipal_twin_db')

with engine.begin() as conn:
    # 1. Insert Melamchi Tenant
    conn.execute(text("""
        INSERT INTO tenants (id, subdomain, "nameNp", "nameEn", status)
        VALUES (
            gen_random_uuid(), 
            'melamchi', 
            'मेलम्ची नगरपालिका', 
            'Melamchi Municipality', 
            'active'
        ) ON CONFLICT (subdomain) DO NOTHING;
    """))

    # Fetch tenant ID
    res = conn.execute(text("SELECT id, subdomain, \"nameNp\" FROM tenants WHERE subdomain = 'melamchi'")).first()
    melamchi_id = str(res[0])
    print(f"Melamchi Tenant ID: {melamchi_id}, Subdomain: {res[1]}, Name: {res[2]}")

    # 2. Insert or Update Municipality Profile
    conn.execute(text("""
        INSERT INTO municipality_profile (
            id, 
            tenant_id, 
            "nameNp", 
            "nameEn", 
            district, 
            province, 
            type, 
            "areaSqKm", 
            "wardCount", 
            "totalPopulation", 
            introduction, 
            geography, 
            "majorTouristSites",
            "updatedAt"
        )
        VALUES (
            gen_random_uuid(),
            :melamchi_id,
            'मेलम्ची नगरपालिका',
            'Melamchi Municipality',
            'सिन्धुपाल्चोक',
            'बागमती प्रदेश',
            'नगरपालिका',
            158.17,
            13,
            41063,
            'मेलम्ची नगरपालिका सिन्धुपाल्चोक जिल्लाको दक्षिण–पश्चिम क्षेत्रमा, बागमती प्रदेशमा अवस्थित स्थानीय तह हो।',
            'मेलम्ची नगरपालिका सिन्धुपाल्चोकको दक्षिण–पश्चिम क्षेत्रमा फैलिएको छ।',
            'मेलम्ची बजार, भोटेचौर चियाबगान, इन्द्रावती नदी, हैबुङ चिसापानी',
            CURRENT_TIMESTAMP
        )
        ON CONFLICT DO NOTHING;
    """), {"melamchi_id": melamchi_id})

    # 3. Create Melamchi Admin User
    existing_user = conn.execute(text("SELECT id FROM users WHERE email = 'melamchimun@gmail.com'")).first()
    if not existing_user:
        user_id = str(uuid.uuid4())
        hashed_pw = hash_password("Admin@123")
        conn.execute(text("""
            INSERT INTO users (id, email, password, "fullName", role, tenant_id, "isActive", "emailVerified", "createdAt", "updatedAt")
            VALUES (
                :id,
                'melamchimun@gmail.com',
                :password,
                'मेलम्ची नगरपालिका प्रशासक',
                'admin',
                'melamchi',
                true,
                true,
                CURRENT_TIMESTAMP,
                CURRENT_TIMESTAMP
            )
        """), {"id": user_id, "password": hashed_pw})
        print(f"Created Melamchi Admin user: melamchimun@gmail.com (ID: {user_id})")
    else:
        print("Melamchi Admin user already exists.")

print("Setup completed successfully!")
