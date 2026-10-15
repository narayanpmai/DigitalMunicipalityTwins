-- SQL Script to update/insert Melamchi Municipality details
-- Run this script in your PostgreSQL database (p5digital)

-- 1. Ensure the Tenant exists
INSERT INTO tenants (id, subdomain, "nameNp", "nameEn", status)
VALUES (
    gen_random_uuid(), 
    'melamchi', 
    'मेलम्ची नगरपालिका', 
    'Melamchi Municipality', 
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
    "majorTouristSites",
    "updatedAt"
)
VALUES (
    gen_random_uuid(),
    (SELECT id FROM tenants WHERE subdomain = 'melamchi' LIMIT 1),
    'मेलम्ची नगरपालिका',
    'Melamchi Municipality',
    'सिन्धुपाल्चोक',
    'बागमती प्रदेश',
    'नगरपालिका',
    158.17,
    13,
    41063,
    'मेलम्ची नगरपालिका सिन्धुपाल्चोक जिल्लाको दक्षिण–पश्चिम क्षेत्रमा, बागमती प्रदेशमा अवस्थित स्थानीय तह हो। नगरपालिकाको आधिकारिक मूल नाराः "मेलम्ची नगर समृद्धिको आधार – कृषि, पर्यटन, उद्योग र जलाधार" रहेको छ।',
    'मेलम्ची नगरपालिका सिन्धुपाल्चोकको दक्षिण–पश्चिम क्षेत्रमा फैलिएको छ। सिमाना: उत्तरमा हेलम्बु र पाँचपोखरी थाङपाल गाउँपालिका, पूर्वमा इन्द्रावती र पाँचपोखरी थाङपाल गाउँपालिका, दक्षिणमा काठमाडौं र काभ्रेपलाञ्चोक जिल्ला, पश्चिममा काठमाडौं र नुवाकोट जिल्ला।',
    'मेलम्ची बजार, भोटेचौर चियाबगान, इन्द्रावती नदी, हैबुङ चिसापानी, तपचुली डाँडा, पाटी भञ्ज्याङ, सुलिकोट घ्याङ, चाङखु गुफा, धौले डाँडा, ककनी, गुफाडाँडा, गिरान्चौर एकीकृत बस्ती',
    CURRENT_TIMESTAMP
)
ON CONFLICT DO NOTHING;
