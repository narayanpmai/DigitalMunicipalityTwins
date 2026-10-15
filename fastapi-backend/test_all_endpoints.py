import urllib.request
import json
import sys

BASE_URL = "http://localhost:3001"

test_endpoints = [
    # Demographics & GIS
    "/api/v1/demographics/households",
    "/api/v1/demographics/dashboard/stats",
    "/api/v1/gis/infrastructure",
    "/api/v1/gis/facilities",
    # Health & Agriculture & Livestock
    "/api/v1/health/institutions",
    "/api/v1/health/institutions/stats",
    "/api/v1/agriculture/farmers",
    "/api/v1/agriculture/farmers/stats",
    "/api/v1/livestock",
    # Education
    "/api/v1/education/schools",
    "/api/v1/education/schools/stats",
    # Business & Revenue
    "/api/v1/businesses",
    "/api/v1/businesses/stats",
    "/api/v1/business",
    "/api/v1/revenue/sources",
    "/api/v1/revenue/sources/stats",
    # Vital & Citizens
    "/api/v1/vital-registration/stats",
    "/api/v1/citizens",
    # Governance & Administration
    "/api/v1/complaints",
    "/api/v1/complaints/stats",
    "/api/v1/citizen-services",
    "/api/v1/citizen-services/stats",
    "/api/v1/infrastructure",
    "/api/v1/infrastructure/stats",
    "/api/v1/budgets",
    "/api/v1/budgets/stats",
    "/api/v1/planning",
    "/api/v1/planning/stats",
    "/api/v1/projects",
    "/api/v1/projects/stats",
    "/api/v1/employee-tasks",
    "/api/v1/procurement",
    "/api/v1/procurement/stats",
    "/api/v1/darta-chalani",
    "/api/v1/darta-chalani/stats",
    "/api/v1/employees",
    "/api/v1/wards",
    "/api/v1/tourism/spots",
    "/api/v1/tourism/stats",
    "/api/v1/organizations",
    "/api/v1/organizations/stats",
    "/api/v1/documents",
    "/api/v1/reports",
    "/api/v1/reports/stats",
    "/api/v1/fiscal-years",
    "/api/v1/fiscal-years/current",
    "/api/v1/waste-management/schedule",
    "/api/v1/waste-management/routes",
    "/api/v1/judicial/cases",
    "/api/v1/judicial/cases/stats",
    "/api/v1/assets",
    "/api/v1/disaster/stats",
    "/api/v1/contracts",
    "/api/v1/building-permits",
    "/api/v1/building-permits/stats",
    "/api/v1/audits",
    "/api/v1/audit-logs",
    "/api/v1/social-security/beneficiaries",
    "/api/v1/social-security/stats",
    "/api/v1/social-inclusion",
    "/api/v1/social-inclusion/stats",
    "/api/v1/senior-citizen/data/",
    "/api/v1/women-children/data/",
    "/api/v1/disability/data/",
    "/api/v1/dalit/data/",
    "/api/v1/employment/job-seekers",
    "/api/v1/employment/stats",
    "/api/v1/recruitment/vacancies",
    "/api/v1/heritage/sites",
    "/api/v1/heritage/stats",
    "/api/v1/rti",
    "/api/v1/branches",
    "/api/v1/representatives",
    "/api/v1/badapatra/citizens-charter",
    "/api/v1/notifications",
    "/api/v1/open-data/datasets",
    "/api/v1/visitors",
    "/api/v1/library/books",
    "/api/v1/cameras",
    "/api/v1/sensors",
    "/api/v1/media",
    "/api/v1/tenants",
    "/api/v1/settings",
    "/api/v1/municipality/profile",
    "/api/v1/dashboard/overview",
    "/api/v1/analytics/realtime",
    "/api/v1/it-branch/systems",
    "/api/v1/cooperatives",
    "/api/v1/cooperatives/stats"
]

passed = 0
failed = []

for ep in test_endpoints:
    url = BASE_URL + ep
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "HealthChecker/1.0"})
        with urllib.request.urlopen(req, timeout=5) as response:
            if response.status in [200, 201]:
                passed += 1
            else:
                failed.append((ep, response.status, "Unexpected status"))
    except Exception as e:
        failed.append((ep, 500, str(e)))

print(f"\n==========================================")
print(f"TOTAL ENDPOINTS TESTED: {len(test_endpoints)}")
print(f"PASSED (HTTP 200/201):  {passed}")
print(f"FAILED:                 {len(failed)}")
print(f"==========================================")

if failed:
    print("\nFAILURES:")
    for f in failed:
        print(f"  ❌ {f[0]} -> {f[1]}: {f[2]}")
else:
    print("\n✅ ALL TESTED ENDPOINTS RETURNED 200 OK!")
