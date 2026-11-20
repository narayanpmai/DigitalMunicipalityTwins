import sys
import os
import requests
import json
from dotenv import load_dotenv

load_dotenv('fastapi-backend/.env')

sys.path.insert(0, 'fastapi-backend')
from core.database import SessionLocal
from models.user import User
from models.tenant import Tenant
from core.security import create_access_token

BASE_URL = "http://127.0.0.1:3002/api/v1"

def get_tokens():
    db = SessionLocal()
    gaushala_user = db.query(User).filter(User.email == 'gaushalamun@gmail.com').first()
    p5_user = db.query(User).filter(User.email == 'admin@p5digital.local').first()
    if not p5_user:
        p5_user = db.query(User).filter(User.email == 'admin@smartptrm.gov.np').first()
    
    g_tenant = db.query(Tenant).filter((Tenant.id == gaushala_user.tenant_id) | (Tenant.subdomain == gaushala_user.tenant_id)).first()
    p5_tenant = db.query(Tenant).filter((Tenant.id == p5_user.tenant_id) | (Tenant.subdomain == p5_user.tenant_id)).first()
    
    g_token = create_access_token({
        "sub": str(gaushala_user.id),
        "email": gaushala_user.email,
        "role": gaushala_user.role,
        "wardNumber": gaushala_user.ward_number,
        "tenantId": g_tenant.id if g_tenant else gaushala_user.tenant_id,
        "tenantSubdomain": "gaushala"
    })
    
    p5_token = create_access_token({
        "sub": str(p5_user.id),
        "email": p5_user.email,
        "role": p5_user.role,
        "wardNumber": p5_user.ward_number,
        "tenantId": p5_tenant.id if p5_tenant else p5_user.tenant_id,
        "tenantSubdomain": "panchpokhari"
    })
    
    db.close()
    return {
        "gaushala": {
            "token": g_token,
            "user": gaushala_user.full_name,
            "email": gaushala_user.email,
            "tenant": "gaushala"
        },
        "panchpokhari": {
            "token": p5_token,
            "user": p5_user.full_name,
            "email": p5_user.email,
            "tenant": "panchpokhari"
        }
    }

def run_tests():
    tokens = get_tokens()
    print("=" * 70)
    print("MULTI-TENANT API DATA ISOLATION TEST")
    print("=" * 70)
    
    # -------------------------------------------------------------
    # Test 1: Gaushala Tenant Scoping (Should see 0 Panchpokhari data)
    # -------------------------------------------------------------
    g_headers = {
        "Authorization": f"Bearer {tokens['gaushala']['token']}",
        "X-Tenant-Id": "gaushala"
    }
    
    print("\n[TEST 1] Gaushala Municipality (Ranjit Barma) Isolation Check:")
    
    # 1.1 Vacancies
    r = requests.get(f"{BASE_URL}/recruitment/vacancies", headers=g_headers)
    assert r.status_code == 200, f"Failed: {r.text}"
    g_vacancies = r.json()
    print(f"  - Gaushala Vacancies Count: {len(g_vacancies)}")
    assert len(g_vacancies) == 0, f"Leakage! Gaushala sees {len(g_vacancies)} vacancies"
    
    # 1.2 Applications
    r = requests.get(f"{BASE_URL}/recruitment/applications", headers=g_headers)
    assert r.status_code == 200, f"Failed: {r.text}"
    g_apps = r.json()
    print(f"  - Gaushala Applications Count: {len(g_apps)}")
    assert len(g_apps) == 0, f"Leakage! Gaushala sees {len(g_apps)} applications"
    
    # 1.3 Summary
    r = requests.get(f"{BASE_URL}/recruitment/summary", headers=g_headers)
    assert r.status_code == 200, f"Failed: {r.text}"
    g_summary = r.json()
    print(f"  - Gaushala Recruitment Summary: total_applications={g_summary.get('total_applications')}, total_vacancies={g_summary.get('total_vacancies')}")
    assert g_summary.get("total_applications") == 0, "Leakage in summary applications!"
    assert g_summary.get("total_vacancies") == 0, "Leakage in summary vacancies!"
    
    # 1.4 Admit Card Lookup for Panchpokhari candidate (126049 Narayan Chhetri)
    r = requests.get(f"{BASE_URL}/recruitment/admit-card?phone_or_citizenship=126049", headers=g_headers)
    print(f"  - Gaushala Lookup of Panchpokhari Citizenship (126049) Status Code: {r.status_code}")
    assert r.status_code == 404, f"Security Breach! Gaushala retrieved Panchpokhari admit card: {r.text}"
    
    # 1.5 HRMS Employees
    r = requests.get(f"{BASE_URL}/employees", headers=g_headers)
    assert r.status_code == 200, f"Failed: {r.text}"
    g_emps = r.json()
    print(f"  - Gaushala Employees Count: {len(g_emps)}")
    assert len(g_emps) == 0, f"Leakage! Gaushala sees {len(g_emps)} employees"
    
    # 1.6 IDOR Protection: Gaushala admin trying to DELETE or UPDATE Panchpokhari application APP-2081-0002
    r = requests.delete(f"{BASE_URL}/recruitment/applications/APP-2081-0002", headers=g_headers)
    print(f"  - Gaushala IDOR DELETE APP-2081-0002 Status: {r.status_code}")
    assert r.status_code == 404, f"Security Breach! Gaushala deleted Panchpokhari record: {r.text}"
    
    r = requests.put(f"{BASE_URL}/recruitment/applications/APP-2081-0002", json={"full_name_np": "Hacked Name"}, headers=g_headers)
    print(f"  - Gaushala IDOR PUT APP-2081-0002 Status: {r.status_code}")
    assert r.status_code == 404, f"Security Breach! Gaushala modified Panchpokhari record: {r.text}"

    print("  => ALL GAUSHALA ISOLATION & IDOR CHECKS PASSED (Zero Leakage)")

    # -------------------------------------------------------------
    # Test 2: Panchpokhari Master Palika Preservation Check
    # -------------------------------------------------------------
    p5_headers = {
        "Authorization": f"Bearer {tokens['panchpokhari']['token']}",
        "X-Tenant-Id": "panchpokhari"
    }
    
    print("\n[TEST 2] Panchpokhari Thangpal Rural Municipality Data Preservation Check:")
    
    # 2.1 Vacancies
    r = requests.get(f"{BASE_URL}/recruitment/vacancies", headers=p5_headers)
    assert r.status_code == 200, f"Failed: {r.text}"
    p5_vacancies = r.json()
    print(f"  - Panchpokhari Vacancies Count: {len(p5_vacancies)}")
    assert len(p5_vacancies) == 2, f"Expected 2 vacancies, found {len(p5_vacancies)}"
    for v in p5_vacancies:
        v_no = v.get('vacancyNo') or v.get('vacancy_no')
        fee = v.get('applicationFee') or v.get('application_fee')
        print(f"    * Vacancy: {v_no} | {v.get('title')} | Fee: Rs. {fee}")
    
    # 2.2 Applications
    r = requests.get(f"{BASE_URL}/recruitment/applications", headers=p5_headers)
    assert r.status_code == 200, f"Failed: {r.text}"
    p5_apps = r.json()
    print(f"  - Panchpokhari Applications Count: {len(p5_apps)}")
    assert len(p5_apps) == 2, f"Expected 2 real applications, found {len(p5_apps)}"
    for a in p5_apps:
        a_no = a.get('applicationNo') or a.get('application_no')
        name = a.get('fullNameNp') or a.get('full_name_np')
        roll = a.get('admitCardRollNo') or a.get('admit_card_roll_no')
        print(f"    * Application: {a_no} | {name} | Status: {a.get('status')} | Roll: {roll}")
    
    # 2.3 Admit Card Retrieval for Narayan Chhetri
    r = requests.get(f"{BASE_URL}/recruitment/admit-card?phone_or_citizenship=126049", headers=p5_headers)
    assert r.status_code == 200, f"Failed: {r.text}"
    admit_card_resp = r.json()
    app_data = admit_card_resp.get('application', {})
    vac_data = admit_card_resp.get('vacancy', {})
    ac_name = app_data.get('fullNameNp') or app_data.get('full_name_np')
    ac_exam = vac_data.get('examDateBs') or app_data.get('examDateTime') or app_data.get('exam_date_time')
    ac_no = app_data.get('applicationNo') or app_data.get('application_no')
    print(f"  - Panchpokhari Admit Card Retrieved: {ac_no} | {ac_name} | Exam Date: {ac_exam}")
    assert ac_name == "नारायण क्षेत्री", "Candidate name mismatch!"
    assert "२०८३" in str(ac_exam), f"Exam date unexpected: {ac_exam}"

    # 2.4 HRMS Employee
    r = requests.get(f"{BASE_URL}/employees", headers=p5_headers)
    assert r.status_code == 200, f"Failed: {r.text}"
    p5_emps = r.json()
    print(f"  - Panchpokhari Employees Count: {len(p5_emps)}")
    assert len(p5_emps) >= 1, "Panchpokhari employee missing!"
    print(f"    * Employee: {p5_emps[0].get('employeeId')} | {p5_emps[0].get('fullName')} | {p5_emps[0].get('designation')}")

    print("  => ALL PANCHPOKHARI REAL DATA PRESERVATION CHECKS PASSED (100% Intact)")
    print("\n" + "=" * 70)
    print("VERIFICATION COMPLETE: MULTI-TENANT ISOLATION FULLY ENFORCED")
    print("=" * 70)

if __name__ == '__main__':
    run_tests()
