-- SQL Script to update/insert Gaushala Municipality details
-- Run this script in your PostgreSQL database (p5digital)

-- 1. Ensure the Tenant exists
INSERT INTO tenants (id, subdomain, "nameNp", "nameEn", status)
VALUES (
    gen_random_uuid(), 
    'gaushala', 
    'गौशाला नगरपालिका', 
    'Gaushala Municipality', 
    'active'
) ON CONFLICT (subdomain) DO NOTHING;

-- 2. Insert or Update Municipality Profile
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
    "majorReligiousSites",
    "updatedAt"
)
VALUES (
    gen_random_uuid(),
    (SELECT id FROM tenants WHERE subdomain = 'gaushala' LIMIT 1),
    'गौशाला नगरपालिका',
    'Gaushala Municipality',
    'महोत्तरी',
    'मधेश प्रदेश',
    'नगरपालिका',
    144.73,
    12,
    73008,
    'गौशाला नगरपालिका मधेश प्रदेशको महोत्तरी जिल्लामा अवस्थित स्थानीय तह हो। नगरपालिका क्षेत्रफल, जनसंख्या, कृषि, व्यापार, उद्योग, धार्मिक–सांस्कृतिक सम्पदा तथा सडक सञ्जालका दृष्टिले महोत्तरीको महत्वपूर्ण नगर क्षेत्रमध्ये एक हो। नगरपालिकाको प्रशासनिक केन्द्र गौशाला बजारमा रहेको छ।',
    'गौशाला नगरपालिका मधेश प्रदेशको महोत्तरी जिल्लामा पर्दछ। नगरपालिकाको भौगोलिक क्षेत्र उत्तरतर्फ बर्दिबास नगरपालिका, पूर्वतर्फ बर्दिबास तथा औरही नगरपालिका, पश्चिमतर्फ सर्लाही जिल्लाको ईश्वरपुर नगरपालिका र दक्षिणतर्फ सोनमा गाउँपालिका तथा औरही नगरपालिकासँग जोडिएको छ।',
    'बम्ह्स्थान, जलपा माई मन्दिर, रामजानकी मन्दिर, गणेश मन्दिर, दुर्गा मन्दिर, सल्हेस मन्दिर, महादेव मन्दिर, विश्वकर्मा मन्दिर, निगौल ठाकुर पोखरी, पचाईन माई, सोनिया माई, हनुमान मन्दिर, राधाकृष्ण मन्दिर, पूर्णेश्वर महादेव, शंकर महादेव मन्दिर, टुटेश्वर रोड',
    CURRENT_TIMESTAMP
)
ON CONFLICT DO NOTHING; -- or you could write an UPDATE statement if it's already there.

-- NOTE: If updating an existing profile:
UPDATE municipality_profile 
SET 
    "areaSqKm" = 144.73,
    "wardCount" = 12,
    "totalPopulation" = 73008,
    district = 'महोत्तरी',
    province = 'मधेश प्रदेश',
    type = 'नगरपालिका',
    introduction = 'गौशाला नगरपालिका मधेश प्रदेशको महोत्तरी जिल्लामा अवस्थित स्थानीय तह हो। नगरपालिका क्षेत्रफल, जनसंख्या, कृषि, व्यापार, उद्योग, धार्मिक–सांस्कृतिक सम्पदा तथा सडक सञ्जालका दृष्टिले महोत्तरीको महत्वपूर्ण नगर क्षेत्रमध्ये एक हो। नगरपालिकाको प्रशासनिक केन्द्र गौशाला बजारमा रहेको छ।',
    geography = 'गौशाला नगरपालिका मधेश प्रदेशको महोत्तरी जिल्लामा पर्दछ। नगरपालिकाको भौगोलिक क्षेत्र उत्तरतर्फ बर्दिबास नगरपालिका, पूर्वतर्फ बर्दिबास तथा औरही नगरपालिका, पश्चिमतर्फ सर्लाही जिल्लाको ईश्वरपुर नगरपालिका र दक्षिणतर्फ सोनमा गाउँपालिका तथा औरही नगरपालिकासँग जोडिएको छ।',
    "majorReligiousSites" = 'बम्ह्स्थान, जलपा माई मन्दिर, रामजानकी मन्दिर, गणेश मन्दिर, दुर्गा मन्दिर, सल्हेस मन्दिर, महादेव मन्दिर, विश्वकर्मा मन्दिर, निगौल ठाकुर पोखरी, पचाईन माई, सोनिया माई, हनुमान मन्दिर, राधाकृष्ण मन्दिर, पूर्णेश्वर महादेव, शंकर महादेव मन्दिर, टुटेश्वर रोड'
WHERE tenant_id = (SELECT id FROM tenants WHERE subdomain = 'gaushala' LIMIT 1);
