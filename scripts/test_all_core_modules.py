import urllib.request
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

endpoints = [
    # Core Overview & Dashboard
    ("/api/v1/dashboard/overview", "दैनिक कार्यसञ्चालन (Overview)"),
    ("/api/v1/dashboard-v2/kpis", "कार्यपालिका कमान्ड ड्यासवोर्ड (Executive BI)"),
    ("/api/v1/demographics/summary", "घरधुरी तथा जनसांख्यिकी"),
    ("/api/v1/demographics/households?limit=5", "घरधुरी सूची (Households)"),
    ("/api/v1/wards", "वडा प्रोफाइल (Wards)"),
    ("/api/v1/representatives", "जनप्रतिनिधि प्रोफाइल"),
    
    # E-Office, Darta Chalani, Sifaris
    ("/api/v1/darta-chalani/darta?limit=5", "दर्ता अभिलेख"),
    ("/api/v1/darta-chalani/chalani?limit=5", "चलानी अभिलेख"),
    ("/api/v1/e-office/tippani", "ई-अफिस टिप्पणी"),
    ("/api/v1/e-services/sifaris/templates", "डिजिटल सिफारिस"),
    
    # Digital Twin & GIS
    ("/api/v1/gis/infrastructure", "भौतिक पूर्वाधार नक्सा (GIS)"),
    ("/api/v1/gis/facilities", "सार्वजनिक सेवा केन्द्रहरू (Facilities)"),
    ("/api/v1/gis/land-classification/summary", "जग्गा बर्गीकरण (Land Classification)"),
    ("/api/v1/digital-twin/3d-layers", "थ्रीडी डिजिटल जुम्ल्याहा (3D Twin)"),
    
    # Thematic Sectors
    ("/api/v1/education/schools", "शिक्षा व्यवस्थापन (Education)"),
    ("/api/v1/health/facilities", "स्वास्थ्य सेवा (Health)"),
    ("/api/v1/agriculture/farmers?limit=5", "कृषि तथा किसान प्रोफाइल (Agriculture)"),
    ("/api/v1/business/registrations?limit=5", "व्यवसाय दर्ता (Business)"),
    ("/api/v1/cooperatives", "सहकारी व्यवस्थापन (Cooperatives)"),
    ("/api/v1/vital-registration/records?limit=5", "घटना दर्ता (Vital Registration)"),
    ("/api/v1/projects?limit=5", "आयोजना तथा पूर्वाधार (Projects)"),
    ("/api/v1/project-lifecycle/projects", "आयोजना जीवनचक्र (Lifecycle)"),
    ("/api/v1/ebps/applications", "डिजिटल नक्सापास (EBPS)"),
    ("/api/v1/building-permits", "भवन निर्माण अनुमति (Building Permit)"),
    ("/api/v1/revenue/summary", "राजस्व तथा कर (Revenue)"),
    ("/api/v1/procurement/tenders", "सार्वजनिक खरिद तथा बोलपत्र (Procurement)"),
    ("/api/v1/assets", "सम्पत्ति तथा जिन्सी (PAMS Asset)"),
    ("/api/v1/waste-management/routes", "फोहोरमैला व्यवस्थापन (Waste)"),
    ("/api/v1/disaster/incidents", "विपद् जोखिम व्यवस्थापन (Disaster)"),
    ("/api/v1/tourism/destinations", "पर्यटन तथा सम्पदा (Tourism)"),
    ("/api/v1/judicial/cases", "न्यायिक समिति (Judicial)"),
    ("/api/v1/social-security/beneficiaries?limit=5", "सामाजिक सुरक्षा (Social Security)"),
    ("/api/v1/social-inclusion/beneficiaries?limit=5", "समावेशी विकास (Social Inclusion)"),
    ("/api/v1/complaints?limit=5", "गुनासो सुनुवाइ (Complaints)"),
    ("/api/v1/badapatra", "डिजिटल नागरिक वडापत्र (Badapatra)"),
    ("/api/v1/citizen-services", "नागरिक सेवा सूची (Citizen Services)"),
    ("/api/v1/employees", "कर्मचारी व्यवस्थापन (HRMS)"),
    ("/api/v1/employee-tasks", "कार्यभार व्यवस्थापन (Tasks)"),
    ("/api/v1/budget/summary", "बजेट तथा योजना ट्र्याकर"),
    ("/api/v1/meetings", "बैठक तथा निर्णय"),
    ("/api/v1/open-data/datasets", "खुला तथ्याङ्क (Open Data)"),
    ("/api/v1/library/books", "ई-पुस्तकालय (Library)"),
    ("/api/v1/cameras", "स्मार्ट सिसिटिभी निगरानी"),
    ("/api/v1/sensors/data", "मौसम तथा बाढी सेन्सर"),
    ("/api/v1/it-branch/systems", "सूचना प्रविधि शाखा"),
    ("/api/v1/engineers", "इन्जिनियर तथा प्राविधिक रोस्टर"),
    ("/api/v1/master-data/types", "मास्टर डाटा (MDM)"),
    ("/api/v1/ai-assistant/status", "एआई सहायक पोर्टल"),
]

print(f"Testing {len(endpoints)} core system endpoints...")
results = []
for ep, name in endpoints:
    url = f"http://localhost:3001{ep}"
    try:
        req = urllib.request.urlopen(url, timeout=3)
        code = req.getcode()
        body = req.read().decode('utf-8')
        try:
            data = json.loads(body)
            size = len(data) if isinstance(data, list) else (len(data.get('items', data.get('data', []))) if isinstance(data, dict) else 1)
            results.append((name, ep, code, "OK", size))
        except:
            results.append((name, ep, code, "Non-JSON", 0))
    except urllib.error.HTTPError as e:
        results.append((name, ep, e.code, f"HTTP Error {e.code}", 0))
    except Exception as e:
        results.append((name, ep, 0, str(e)[:30], 0))

print("\n--- ENDPOINT HEALTH REPORT ---")
ok_count = 0
for name, ep, code, status, size in results:
    icon = "✅" if code == 200 else "❌"
    if code == 200: ok_count += 1
    print(f"{icon} [{code}] {name} ({ep}) -> {status} (items: {size})")

print(f"\nSummary: {ok_count}/{len(endpoints)} core endpoints are healthy!")
