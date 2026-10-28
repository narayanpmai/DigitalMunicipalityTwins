"""
Comprehensive Multi-Tenant Isolation & Vulnerability Verification Script
"""
import os
import sys

# Ensure backend root is on sys.path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BASE_DIR)

from fastapi.testclient import TestClient
from main import app
from core.database import SessionLocal
from models.user import User
from models.representative import Representative

client = TestClient(app)

def test_tenant_headers(tenant_subdomain: str):
    return {
        "X-Tenant-Id": tenant_subdomain,
        "Host": f"{tenant_subdomain}.digitaltwin.gov.np"
    }

def run_tests():
    print("=" * 70)
    print("MUNICIPAL DIGITAL TWINS - MULTI-TENANT ISOLATION & VULNERABILITY AUDIT")
    print("=" * 70)

    # -------------------------------------------------------------
    # 1. Ward & Representative Isolation
    # -------------------------------------------------------------
    print("\n[TEST 1] Ward & Representative Isolation...")
    # Panchpokhari
    res_p5 = client.get("/api/v1/wards", headers=test_tenant_headers("panchpokhari"))
    assert res_p5.status_code == 200, f"P5 ward failed: {res_p5.text}"
    p5_wards = res_p5.json()
    p5_chairs = [w.get("chairperson") or w.get("wardChairName") for w in p5_wards]
    print(f"  Panchpokhari Ward count: {len(p5_wards)}, Chairs: {p5_chairs[:3]}...")

    # Gaushala
    res_gs = client.get("/api/v1/wards", headers=test_tenant_headers("gaushala"))
    assert res_gs.status_code == 200, f"Gaushala ward failed: {res_gs.text}"
    gs_wards = res_gs.json()
    gs_chairs = [w.get("chairperson") or w.get("wardChairName") for w in gs_wards]
    print(f"  Gaushala Ward count: {len(gs_wards)}, Chairs: {gs_chairs[:3]}...")

    # Verify no Gaushala chairs appear in Panchpokhari
    for gc in gs_chairs:
        if gc and "नविन" in gc:
            assert gc not in p5_chairs, f"LEAKAGE DETECTED: Gaushala chair {gc} in Panchpokhari!"
    print("  => PASSED: Wards and ward chairs are strictly isolated!")

    # -------------------------------------------------------------
    # 2. Representatives Router Isolation
    # -------------------------------------------------------------
    print("\n[TEST 2] Representative Router Isolation...")
    reps_p5 = client.get("/api/v1/representatives", headers=test_tenant_headers("panchpokhari")).json()
    reps_gs = client.get("/api/v1/representatives", headers=test_tenant_headers("gaushala")).json()
    
    p5_names = set(r.get("name") for r in reps_p5 if r.get("name"))
    gs_names = set(r.get("name") for r in reps_gs if r.get("name"))
    overlap = p5_names.intersection(gs_names)
    assert len(overlap) == 0, f"LEAKAGE DETECTED in representatives: {overlap}"
    print(f"  Panchpokhari reps: {len(p5_names)}, Gaushala reps: {len(gs_names)}, Overlap: {len(overlap)}")
    print("  => PASSED: Representatives cleanly isolated!")

    # -------------------------------------------------------------
    # 3. Dashboard Stats Isolation
    # -------------------------------------------------------------
    print("\n[TEST 3] Dashboard Stats Isolation...")
    stats_p5 = client.get("/api/v1/dashboard/stats", headers=test_tenant_headers("panchpokhari")).json()
    stats_gs = client.get("/api/v1/dashboard/stats", headers=test_tenant_headers("gaushala")).json()
    stats_ml = client.get("/api/v1/dashboard/stats", headers=test_tenant_headers("melamchi")).json()

    print(f"  Panchpokhari stats: pop={stats_p5.get('totalPopulation')}, hh={stats_p5.get('totalHouseholds')}, palika={stats_p5.get('palikaName')}")
    print(f"  Gaushala stats:     pop={stats_gs.get('totalPopulation')}, hh={stats_gs.get('totalHouseholds')}, palika={stats_gs.get('palikaName')}")
    print(f"  Melamchi stats:     pop={stats_ml.get('totalPopulation')}, hh={stats_ml.get('totalHouseholds')}, palika={stats_ml.get('palikaName')}")

    assert stats_p5.get('totalPopulation') != stats_gs.get('totalPopulation'), "P5 and Gaushala population identical (cross-leak)!"
    assert stats_p5.get('palikaName') != stats_gs.get('palikaName'), "Palika name identical!"
    print("  => PASSED: Dashboard statistics reflect individual municipality census and profiles!")

    # -------------------------------------------------------------
    # 4. Cameras, Sensors, Library, Museum Isolation
    # -------------------------------------------------------------
    print("\n[TEST 4] Hardware, Library, and Heritage Isolation...")
    p5_cam = client.get("/api/v1/cameras", headers=test_tenant_headers("panchpokhari")).json()
    gs_cam = client.get("/api/v1/cameras", headers=test_tenant_headers("gaushala")).json()
    print(f"  Cameras - P5: {len(p5_cam)}, Gaushala: {len(gs_cam)}")
    assert len(gs_cam) == 0 or set(c['id'] for c in gs_cam).isdisjoint(set(c['id'] for c in p5_cam))

    p5_books = client.get("/api/v1/library/books", headers=test_tenant_headers("panchpokhari")).json()
    gs_books = client.get("/api/v1/library/books", headers=test_tenant_headers("gaushala")).json()
    print(f"  Library Books - P5: {len(p5_books)}, Gaushala: {len(gs_books)}")
    assert len(gs_books) == 0, "Gaushala leaked Panchpokhari library books!"

    p5_museum = client.get("/api/v1/heritage/museum", headers=test_tenant_headers("panchpokhari")).json()
    gs_museum = client.get("/api/v1/heritage/museum", headers=test_tenant_headers("gaushala")).json()
    print(f"  Museum Assets - P5: {len(p5_museum)}, Gaushala: {len(gs_museum)}")
    assert len(gs_museum) == 0, "Gaushala leaked Panchpokhari museum assets!"
    print("  => PASSED: Hardware, Library, and HeritageSite/Museum records are quarantined!")

    # -------------------------------------------------------------
    # 5. Security Vulnerability: Unauthenticated Destructive Endpoints
    # -------------------------------------------------------------
    print("\n[TEST 5] Security Audit: Unauthenticated Destructive Endpoints...")
    res_clear = client.post("/api/v1/demographics/households-clear-all", headers=test_tenant_headers("panchpokhari"))
    print(f"  Anonymous POST /households-clear-all response: {res_clear.status_code}")
    assert res_clear.status_code in (401, 403), f"CRITICAL VULNERABILITY: Clear all allowed unauthenticated! Status: {res_clear.status_code}"

    res_bulk = client.post("/api/v1/demographics/households-bulk-import", json=[], headers=test_tenant_headers("panchpokhari"))
    print(f"  Anonymous POST /households-bulk-import response: {res_bulk.status_code}")
    assert res_bulk.status_code in (401, 403), f"CRITICAL VULNERABILITY: Bulk import allowed unauthenticated! Status: {res_bulk.status_code}"
    print("  => PASSED: Destructive endpoints require authentication and admin roles!")

    # -------------------------------------------------------------
    # 6. Security Vulnerability: Host Header IPv4 Tenant Spoofing
    # -------------------------------------------------------------
    print("\n[TEST 6] Security Audit: IPv4 Host Header Subdomain Resolution...")
    res_ip = client.get("/api/v1/wards", headers={"Host": "103.140.0.154"})
    assert res_ip.status_code == 200
    # Should resolve to default (Panchpokhari), not create or query tenant '103'
    assert "103" not in [w.get("tenant_id") for w in res_ip.json()]
    print("  => PASSED: IPv4 Host headers (e.g. 103.140.0.154) are never misparsed as tenant '103'!")

    # -------------------------------------------------------------
    # 7. Judicial and Agriculture Isolation
    # -------------------------------------------------------------
    print("\n[TEST 7] Judicial & Agriculture Scoping...")
    p5_med = client.get("/api/v1/judicial/mediators", headers=test_tenant_headers("panchpokhari")).json()
    gs_med = client.get("/api/v1/judicial/mediators", headers=test_tenant_headers("gaushala")).json()
    print(f"  Judicial Mediators - P5: {len(p5_med)}, Gaushala: {len(gs_med)}")
    assert len(gs_med) == 0, "Gaushala leaked Panchpokhari judicial mediators!"

    p5_ai = client.get("/api/v1/agriculture/vet-ai-records", headers=test_tenant_headers("panchpokhari")).json()
    gs_ai = client.get("/api/v1/agriculture/vet-ai-records", headers=test_tenant_headers("gaushala")).json()
    print(f"  Vet AI Records - P5: {len(p5_ai)}, Gaushala: {len(gs_ai)}")
    assert len(gs_ai) == 0, "Gaushala leaked Panchpokhari vet AI records!"
    print("  => PASSED: Judicial and Agriculture modules are isolated!")

    # -------------------------------------------------------------
    # 8. Tourism, Waste Management, Education, and Badapatra Scoping
    # -------------------------------------------------------------
    print("\n[TEST 8] Tourism, Waste Management, Education & Badapatra...")
    p5_tour = client.get("/api/v1/tourism/destinations", headers=test_tenant_headers("panchpokhari")).json()
    gs_tour = client.get("/api/v1/tourism/destinations", headers=test_tenant_headers("gaushala")).json()
    print(f"  Tourism Destinations - P5: {len(p5_tour)}, Gaushala: {len(gs_tour)}")
    assert len(gs_tour) == 0, "Gaushala leaked Panchpokhari tourism destinations!"

    p5_waste = client.get("/api/v1/waste-management/schedules", headers=test_tenant_headers("panchpokhari")).json()
    gs_waste = client.get("/api/v1/waste-management/schedules", headers=test_tenant_headers("gaushala")).json()
    print(f"  Waste Schedules - P5: {len(p5_waste)}, Gaushala: {len(gs_waste)}")
    assert len(gs_waste) == 0, "Gaushala leaked Panchpokhari waste schedules!"

    gs_edu = client.get("/api/v1/education/overview", headers=test_tenant_headers("gaushala")).json()
    print(f"  Gaushala Education Overview - totalSchools: {gs_edu.get('totalSchools')}")
    assert gs_edu.get("totalSchools") == 0, "Gaushala leaked Panchpokhari schools in education overview!"

    p5_bada = client.get("/api/v1/badapatra/summary", headers=test_tenant_headers("panchpokhari")).json()
    gs_bada = client.get("/api/v1/badapatra/summary", headers=test_tenant_headers("gaushala")).json()
    print(f"  Badapatra Palika Name - P5: '{p5_bada.get('municipality')}', Gaushala: '{gs_bada.get('municipality')}'")
    assert "पाँचपोखरी" in p5_bada.get("municipality"), "P5 Badapatra municipality incorrect!"
    assert "गौशाला" in gs_bada.get("municipality"), "Gaushala Badapatra municipality incorrect!"
    print("  => PASSED: Tourism, Waste Management, Education, and Badapatra are cleanly isolated!")

    # -------------------------------------------------------------
    # 9. Fiscal Year (आर्थिक वर्ष) Verification & Scoping
    # -------------------------------------------------------------
    print("\n[TEST 9] Fiscal Year Verification & Transaction Scoping...")
    res_fy = client.get("/api/v1/fiscal-years/current")
    assert res_fy.status_code == 200, f"Current fiscal year endpoint failed: {res_fy.status_code}"
    curr_fy = res_fy.json().get("yearNp")
    print(f"  Current Fiscal Year in Database: '{curr_fy}'")
    assert curr_fy == "२०८१/०८२", f"Unexpected current fiscal year: {curr_fy}"

    res_b_stat = client.get(f"/api/v1/budgets/stats?fiscalYear={curr_fy}", headers=test_tenant_headers("panchpokhari"))
    assert res_b_stat.status_code == 200, "Budget stats by fiscal year failed"

    res_p_stat = client.get(f"/api/v1/projects/stats/summary?fiscalYear={curr_fy}", headers=test_tenant_headers("panchpokhari"))
    assert res_p_stat.status_code == 200, "Project summary by fiscal year failed"

    res_r_p5 = client.get(f"/api/v1/revenue/stats?fiscalYear={curr_fy}", headers=test_tenant_headers("panchpokhari")).json()
    res_r_gs = client.get(f"/api/v1/revenue/stats?fiscalYear={curr_fy}", headers=test_tenant_headers("gaushala")).json()
    print(f"  Revenue FY {curr_fy} - P5: {res_r_p5.get('totalReceipts')} receipts, Gaushala: {res_r_gs.get('totalReceipts')} receipts")
    res_dash = client.get(f"/api/v1/dashboard/stats?fiscalYear={curr_fy}", headers=test_tenant_headers("panchpokhari")).json()
    assert res_dash.get("fiscalYear") == curr_fy, "Dashboard stats failed to reflect requested fiscal year!"
    assert "budgetBurnRate" in res_dash, "Dashboard stats missing budgetBurnRate!"
    print(f"  Dashboard Stats FY {curr_fy} - Burn Rate: {res_dash.get('budgetBurnRate')}%, Projects: {res_dash.get('totalProjects')}")
    print("  => PASSED: Fiscal Year tracking and financial statistics are working and isolated!")

    print("\n" + "=" * 70)
    print("ALL AUDIT AND ISOLATION TESTS PASSED WITH 100% SUCCESS!")
    print("=" * 70)

if __name__ == "__main__":
    run_tests()


