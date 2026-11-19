import requests
import json
import sys
import os
from dotenv import load_dotenv

load_dotenv("fastapi-backend/.env")

# Add fastapi-backend to sys.path to generate valid token
sys.path.insert(0, os.path.abspath("fastapi-backend"))
from core.security import create_access_token

BASE_URL = "http://127.0.0.1:3002/api/v1/recruitment"

def main():
    print("==================================================")
    print("ANTIGRAVITY SECURITY & REGRESSION VERIFICATION RUN")
    print("==================================================")
    
    # 1. Test Public Endpoints
    print("\n--- TEST 1: Public Endpoints (Must remain open to citizens) ---")
    res = requests.get(f"{BASE_URL}/vacancies")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    print(f"[PASS] GET /vacancies returned 200 OK ({len(res.json())} vacancies)")

    res = requests.get(f"{BASE_URL}/summary")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    print(f"[PASS] GET /summary returned 200 OK")

    res = requests.get(f"{BASE_URL}/admit-card?application_no=APP-2081-0004")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    print(f"[PASS] GET /admit-card returned 200 OK")

    # 2. Test Admin Endpoints WITHOUT Token (Must return 401 Unauthorized)
    print("\n--- TEST 2: Unauthenticated Admin Endpoints (Must return 401) ---")
    endpoints_to_test = [
        ("GET", f"{BASE_URL}/applications"),
        ("GET", f"{BASE_URL}/admin/payments"),
        ("GET", f"{BASE_URL}/admin/reconciliation"),
        ("GET", f"{BASE_URL}/admin/audit-logs"),
        ("GET", f"{BASE_URL}/export-excel"),
        ("POST", f"{BASE_URL}/admin/refund", {"application_no": "APP-2081-0001", "refund_amount": 500, "reason": "Test"}),
        ("POST", f"{BASE_URL}/applications/APP-2081-0004/onboard-to-hrms", {"employee_id": "EMP-TEST"}),
    ]
    for method, url, *body in endpoints_to_test:
        if method == "GET":
            r = requests.get(url)
        else:
            r = requests.post(url, json=body[0] if body else {})
        assert r.status_code in (401, 403), f"Security breach! {method} {url} returned {r.status_code} instead of 401/403"
        print(f"[PASS] Blocked unauthorized request: {method} {url.split('/recruitment')[-1]} -> HTTP {r.status_code}")

    # 3. Test Admin Endpoints WITH Valid Admin Token
    print("\n--- TEST 3: Authenticated Admin Endpoints (Must return 200 OK) ---")
    admin_token = create_access_token({
        "sub": "5c0f6b80-157c-4ba2-b4c8-4ee2551773de",
        "email": "super_admin@p5digital.local",
        "role": "super_admin"
    })
    headers = {"Authorization": f"Bearer {admin_token}"}

    res = requests.get(f"{BASE_URL}/applications", headers=headers)
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    print(f"[PASS] GET /applications returned 200 OK with admin token ({len(res.json())} apps)")

    res = requests.get(f"{BASE_URL}/admin/payments", headers=headers)
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    print(f"[PASS] GET /admin/payments returned 200 OK with admin token")

    res = requests.get(f"{BASE_URL}/admin/reconciliation", headers=headers)
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    print(f"[PASS] GET /admin/reconciliation returned 200 OK with admin token (Net: Rs. {res.json().get('net_revenue')})")

    res = requests.get(f"{BASE_URL}/admin/audit-logs", headers=headers)
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    print(f"[PASS] GET /admin/audit-logs returned 200 OK with admin token ({len(res.json())} logs)")

    # 4. Test File Upload Security (SVG Rejection vs JPG Acceptance)
    print("\n--- TEST 4: File Upload Security (.svg Stored XSS defense) ---")
    svg_payload = b"<svg xmlns='http://www.w3.org/2000/svg'><script>alert('XSS')</script></svg>"
    files = {"file": ("malicious.svg", svg_payload, "image/svg+xml")}
    res = requests.post(f"{BASE_URL}/upload-document", files=files)
    assert res.status_code == 400, f"Security breach! .svg upload returned {res.status_code} instead of 400"
    print(f"[PASS] Blocked .svg upload -> HTTP 400: {res.json().get('detail')}")

    jpg_payload = b"\xFF\xD8\xFF\xE0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00"
    files = {"file": ("valid_photo.jpg", jpg_payload, "image/jpeg")}
    res = requests.post(f"{BASE_URL}/upload-document", files=files)
    assert res.status_code == 200, f"Valid JPG upload failed: {res.status_code}"
    print(f"[PASS] Allowed valid .jpg upload -> HTTP 200: {res.json().get('url')}")

    # 5. Test Swagger Docs Exposure in Production
    print("\n--- TEST 5: Swagger / Docs Exposure in Production ---")
    res = requests.get("http://127.0.0.1:3002/docs")
    assert res.status_code == 404, f"Docs exposed in production! Status: {res.status_code}"
    print(f"[PASS] /docs is disabled in production -> HTTP 404 Not Found")

    # 6. Test Unauthenticated Payment Auto-Verify Gate & Admin Confirmation
    print("\n--- TEST 6: Payment Clearance Security (Bypass Prevention & Admin Confirm) ---")
    vac_res = requests.get(f"{BASE_URL}/vacancies")
    assert vac_res.status_code == 200 and len(vac_res.json()) > 0
    vac = vac_res.json()[0]

    # Submit a fresh application
    app_payload = {
        "vacancyId": vac["id"],
        "vacancyNo": vac.get("vacancyNo") or vac.get("vacancy_no"),
        "postTitle": vac["title"],
        "fullNameNp": "सुरक्षा अडिट नमुना उम्मेदवार",
        "contactPhone": "9800000099",
        "citizenshipNo": "99-99-99-9999",
        "permanentAddress": "पाँचपोखरी थाङपाल गाउँपालिका वडा नं १"
    }
    app_res = requests.post(f"{BASE_URL}/apply", json=app_payload)
    assert app_res.status_code == 200, f"Apply failed: {app_res.text}"
    test_app = app_res.json()
    test_app_no = test_app.get("applicationNo") or test_app.get("application_no")
    print(f"[PASS] Created fresh test candidate: {test_app_no}")

    # Initiate payment
    init_res = requests.post(f"{BASE_URL}/payment/initiate", json={
        "applicationNo": test_app_no,
        "gateway": "FONEPAY"
    })
    assert init_res.status_code == 200, f"Initiate failed: {init_res.text}"
    txn_uuid = init_res.json()["transactionUuid"]

    # Attemp unauthenticated mockAutoApprove
    verify_res = requests.post(f"{BASE_URL}/payment/verify", json={
        "transactionUuid": txn_uuid,
        "gateway": "FONEPAY",
        "mockAutoApprove": True
    })
    assert verify_res.status_code == 200
    verify_data = verify_res.json()
    status_val = verify_data.get("paymentStatus") or verify_data.get("payment_status")
    rcpt_val = verify_data.get("receiptNo") or verify_data.get("receipt_no")
    assert status_val == "PENDING_VERIFICATION", f"Security failure! Got {status_val}"
    assert rcpt_val is None, f"Security failure! Free receipt was issued to unauthenticated user: {rcpt_val}"
    print(f"[PASS] Unauthenticated mock approval blocked from granting free receipt (Status: {status_val})")

    # Now verify using dedicated Admin Payment Confirm endpoint
    admin_confirm_res = requests.post(f"{BASE_URL}/admin/payments/{txn_uuid}/confirm", headers=headers)
    assert admin_confirm_res.status_code == 200, f"Admin confirm failed: {admin_confirm_res.text}"
    confirm_data = admin_confirm_res.json()
    admin_status = confirm_data.get("paymentStatus") or confirm_data.get("payment_status")
    admin_rcpt = confirm_data.get("receiptNo") or confirm_data.get("receipt_no")
    assert admin_status == "PAID", f"Expected PAID, got {admin_status}"
    assert admin_rcpt is not None, "Receipt was not issued by admin confirmation!"
    print(f"[PASS] Admin verified & confirmed payment -> Status: {admin_status}, Receipt: {admin_rcpt}")

    # Clean up test application
    del_res = requests.delete(f"{BASE_URL}/applications/{test_app_no}", headers=headers)
    assert del_res.status_code == 200
    print(f"[PASS] Test candidate {test_app_no} cleaned up successfully")

    print("\n==================================================")
    print("ALL 6 SECURITY AUDIT VERIFICATION CHECKS PASSED!")
    print("==================================================")

if __name__ == "__main__":
    main()
