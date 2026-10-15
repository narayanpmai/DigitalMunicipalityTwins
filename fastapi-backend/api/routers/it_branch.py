"""
IT Branch Management System (सूचना प्रविधि शाखा व्यवस्थापन प्रणाली)
Local Government - Paanchpokhari Thangpal Rural Municipality

Covers: IT Asset Management, Software/License Tracking, Support Tickets,
Network & Infrastructure, Cybersecurity Logs, Digital Service Delivery
"""

import uuid
import datetime
from io import BytesIO
from typing import List, Optional, Any, Dict
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, or_
from pydantic import BaseModel

from core.database import get_db

router = APIRouter(
    prefix="/api/v1/it-branch",
    tags=["IT Branch Management (सूचना प्रविधि शाखा)"]
)

# ─────────────────────────────────────────────────────────────────────────────
# PYDANTIC SCHEMAS (inline — no separate models file needed for stub system)
# ─────────────────────────────────────────────────────────────────────────────

class ITAssetCreate(BaseModel):
    asset_code: str
    name: str
    category: str          # Computer/Laptop/Printer/Network/UPS/Server/CCTV/Other
    brand_model: Optional[str] = None
    serial_number: Optional[str] = None
    purchase_date_bs: Optional[str] = None
    purchase_price: Optional[float] = None
    warranty_expiry_bs: Optional[str] = None
    assigned_to: Optional[str] = None
    location: Optional[str] = None  # Office/Ward/Branch
    status: str = "सक्रिय (Active)"
    condition: str = "राम्रो (Good)"
    remarks: Optional[str] = None

class SoftwareLicenseCreate(BaseModel):
    software_name: str
    vendor: Optional[str] = None
    license_key: Optional[str] = None
    license_type: str = "Paid"
    seats: int = 1
    purchase_date_bs: Optional[str] = None
    expiry_date_bs: Optional[str] = None
    annual_cost: Optional[float] = None
    assigned_to: Optional[str] = None
    status: str = "सक्रिय (Active)"
    remarks: Optional[str] = None

class SupportTicketCreate(BaseModel):
    ticket_no: Optional[str] = None
    title: str
    description: str
    category: str   # Hardware/Software/Network/Email/Data/Printer/CCTV/Other
    priority: str = "मध्यम (Medium)"  # Low/Medium/High/Critical
    raised_by: str
    raised_department: Optional[str] = None
    assigned_to: Optional[str] = None
    status: str = "खुला (Open)"
    resolution_notes: Optional[str] = None
    created_at_bs: Optional[str] = None
    resolved_at_bs: Optional[str] = None

class NetworkDeviceCreate(BaseModel):
    device_name: str
    device_type: str  # Router/Switch/AP/Firewall/Server/NAS/Camera
    ip_address: Optional[str] = None
    mac_address: Optional[str] = None
    location: Optional[str] = None
    vlan: Optional[str] = None
    isp_provider: Optional[str] = None
    bandwidth_mbps: Optional[int] = None
    status: str = "अनलाइन (Online)"
    last_checked_bs: Optional[str] = None
    remarks: Optional[str] = None

class DigitalServiceCreate(BaseModel):
    service_name: str
    service_type: str  # Portal/API/Mobile App/SMS/Email/System
    url: Optional[str] = None
    responsible_officer: Optional[str] = None
    launch_date_bs: Optional[str] = None
    status: str = "सक्रिय (Active)"
    uptime_percent: Optional[float] = 99.5
    monthly_users: Optional[int] = None
    remarks: Optional[str] = None

class CyberLogCreate(BaseModel):
    log_type: str     # Firewall Block/Virus Found/Unauthorized Access/Phishing/Policy Violation
    severity: str = "मध्यम (Medium)"
    source_ip: Optional[str] = None
    target_system: Optional[str] = None
    action_taken: Optional[str] = None
    detected_at_bs: Optional[str] = None
    resolved: bool = False
    remarks: Optional[str] = None

class ITBudgetCreate(BaseModel):
    fiscal_year: str = "२०८१/०८२"
    head: str
    budget_allocated: float
    budget_spent: float = 0.0
    remarks: Optional[str] = None

class ITStaffCreate(BaseModel):
    name: str
    designation: str
    level: str
    qualifications: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    join_date_bs: Optional[str] = None
    responsibilities: Optional[List[str]] = []


# ─────────────────────────────────────────────────────────────────────────────
# IN-MEMORY DATA STORE (Stub — replace with SQLAlchemy models for production)
# ─────────────────────────────────────────────────────────────────────────────

_assets: List[Dict] = [
    {"id": "a001", "asset_code": "IT-COM-001", "name": "Desktop Computer", "category": "Computer", "brand_model": "HP ProDesk 400 G7", "serial_number": "SN-2081-001", "purchase_date_bs": "२०८०-०३-१५", "purchase_price": 75000, "warranty_expiry_bs": "२०८३-०३-१५", "assigned_to": "लेखा शाखा - रमेश थापा", "location": "मुख्य कार्यालय", "status": "सक्रिय (Active)", "condition": "राम्रो (Good)", "remarks": None},
    {"id": "a002", "asset_code": "IT-LAP-001", "name": "Laptop", "category": "Laptop", "brand_model": "Lenovo ThinkPad E14", "serial_number": "SN-2081-002", "purchase_date_bs": "२०८०-०५-२०", "purchase_price": 95000, "warranty_expiry_bs": "२०८३-०५-२०", "assigned_to": "IT शाखा - कृष्ण बहादुर", "location": "मुख्य कार्यालय", "status": "सक्रिय (Active)", "condition": "राम्रो (Good)", "remarks": None},
    {"id": "a003", "asset_code": "IT-PRT-001", "name": "Laser Printer", "category": "Printer", "brand_model": "HP LaserJet Pro M428", "serial_number": "SN-2081-003", "purchase_date_bs": "२०८०-०४-०५", "purchase_price": 45000, "warranty_expiry_bs": "२०८२-०४-०५", "assigned_to": "प्रशासन शाखा", "location": "मुख्य कार्यालय", "status": "मर्मत सुधार (Under Repair)", "condition": "मर्मत आवश्यक (Needs Repair)", "remarks": "Toner replacement needed"},
    {"id": "a004", "asset_code": "IT-UPS-001", "name": "UPS 1KVA", "category": "UPS", "brand_model": "APC Smart-UPS 1000VA", "serial_number": "SN-2081-004", "purchase_date_bs": "२०७९-०८-१०", "purchase_price": 25000, "warranty_expiry_bs": "२०८२-०८-१०", "assigned_to": "सर्भर रूम", "location": "मुख्य कार्यालय", "status": "सक्रिय (Active)", "condition": "राम्रो (Good)", "remarks": None},
    {"id": "a005", "asset_code": "IT-SRV-001", "name": "File Server", "category": "Server", "brand_model": "Dell PowerEdge T140", "serial_number": "SN-2081-005", "purchase_date_bs": "२०७९-११-०१", "purchase_price": 280000, "warranty_expiry_bs": "२०८४-११-०१", "assigned_to": "IT शाखा", "location": "सर्भर रूम", "status": "सक्रिय (Active)", "condition": "राम्रो (Good)", "remarks": "Primary domain controller"},
    {"id": "a006", "asset_code": "IT-CAM-001", "name": "IP Camera System", "category": "CCTV", "brand_model": "Hikvision DS-2CD2143G2 x8", "serial_number": "SN-2081-006", "purchase_date_bs": "२०८०-०१-२५", "purchase_price": 120000, "warranty_expiry_bs": "२०८३-०१-२५", "assigned_to": "IT शाखा", "location": "कार्यालय परिसर", "status": "सक्रिय (Active)", "condition": "राम्रो (Good)", "remarks": "8-channel NVR system"},
]

_licenses: List[Dict] = [
    {"id": "l001", "software_name": "Microsoft Office 365", "vendor": "Microsoft", "license_key": "XXXXX-XXXXX-XXXXX-XXXXX", "license_type": "Paid", "seats": 10, "purchase_date_bs": "२०८०-०४-०१", "expiry_date_bs": "२०८१-०४-०१", "annual_cost": 45000, "assigned_to": "सम्पूर्ण कर्मचारी", "status": "सक्रिय (Active)", "remarks": "Annual renewal"},
    {"id": "l002", "software_name": "Windows 11 Pro", "vendor": "Microsoft", "license_key": "YYYYY-YYYYY-YYYYY-YYYYY", "license_type": "Paid", "seats": 15, "purchase_date_bs": "२०८०-०३-१५", "expiry_date_bs": None, "annual_cost": 80000, "assigned_to": "सम्पूर्ण Desktop", "status": "सक्रिय (Active)", "remarks": "Perpetual license"},
    {"id": "l003", "software_name": "NITF Accounting Software", "vendor": "NITF Nepal", "license_key": "NITF-2081-001", "license_type": "Paid", "seats": 3, "purchase_date_bs": "२०८०-०५-०१", "expiry_date_bs": "२०८१-०५-०१", "annual_cost": 35000, "assigned_to": "लेखा शाखा", "status": "सक्रिय (Active)", "remarks": "Budget & accounting"},
    {"id": "l004", "software_name": "LibreOffice", "vendor": "Document Foundation", "license_key": "Open Source", "license_type": "Free/Open Source", "seats": 999, "purchase_date_bs": "२०७८-०१-०१", "expiry_date_bs": None, "annual_cost": 0, "assigned_to": "सम्पूर्ण कर्मचारी", "status": "सक्रिय (Active)", "remarks": "No cost"},
    {"id": "l005", "software_name": "Antivirus (ESET Endpoint)", "vendor": "ESET", "license_key": "ESET-2081-MGT", "license_type": "Paid", "seats": 20, "purchase_date_bs": "२०८०-०४-०१", "expiry_date_bs": "२०८१-०४-०१", "annual_cost": 28000, "assigned_to": "सम्पूर्ण नेटवर्क", "status": "म्याद सकिँदै (Expiring Soon)", "remarks": "Renewal due in 2 months"},
]

_tickets: List[Dict] = [
    {"id": "t001", "ticket_no": "TKT-2081-001", "title": "Printer not working", "description": "Office printer is showing paper jam error", "category": "Hardware", "priority": "मध्यम (Medium)", "raised_by": "राम बहादुर श्रेष्ठ", "raised_department": "प्रशासन शाखा", "assigned_to": "कृष्ण बहादुर (IT Officer)", "status": "समाधान भयो (Resolved)", "resolution_notes": "Paper jam cleared, test print successful", "created_at_bs": "२०८१-०५-०३", "resolved_at_bs": "२०८१-०५-०३"},
    {"id": "t002", "ticket_no": "TKT-2081-002", "title": "Internet slow in Ward 4", "description": "Internet speed at Ward 4 office is very slow - less than 1Mbps", "category": "Network", "priority": "उच्च (High)", "raised_by": "सीता कुमारी", "raised_department": "वडा कार्यालय ४", "assigned_to": "कृष्ण बहादुर (IT Officer)", "status": "प्रगतिमा (In Progress)", "resolution_notes": "ISP contacted, checking line quality", "created_at_bs": "२०८१-०५-०५", "resolved_at_bs": None},
    {"id": "t003", "ticket_no": "TKT-2081-003", "title": "Cannot access e-Sifarish portal", "description": "Citizen portal login failing since yesterday", "category": "Software", "priority": "अत्यावश्यक (Critical)", "raised_by": "प्रशासन प्रमुख", "raised_department": "प्रशासन शाखा", "assigned_to": "कृष्ण बहादुर (IT Officer)", "status": "समाधान भयो (Resolved)", "resolution_notes": "SSL certificate renewed, portal working", "created_at_bs": "२०८१-०५-०८", "resolved_at_bs": "२०८१-०५-०८"},
    {"id": "t004", "ticket_no": "TKT-2081-004", "title": "Email not sending", "description": "Official email not sending attachments above 5MB", "category": "Email", "priority": "मध्यम (Medium)", "raised_by": "रामकुमार", "raised_department": "योजना शाखा", "assigned_to": "अवतार सिंह (IT Assist)", "status": "खुला (Open)", "resolution_notes": None, "created_at_bs": "२०८१-०५-१०", "resolved_at_bs": None},
    {"id": "t005", "ticket_no": "TKT-2081-005", "title": "CCTV camera angle needs adjustment", "description": "Main gate camera not covering full entrance", "category": "CCTV", "priority": "न्यून (Low)", "raised_by": "कार्यालय प्रशासक", "raised_department": "प्रशासन शाखा", "assigned_to": None, "status": "खुला (Open)", "resolution_notes": None, "created_at_bs": "२०८१-०५-१२", "resolved_at_bs": None},
]

_network_devices: List[Dict] = [
    {"id": "n001", "device_name": "Main Router (ISP Gateway)", "device_type": "Router", "ip_address": "10.0.0.1", "mac_address": "AA:BB:CC:00:01:01", "location": "मुख्य कार्यालय - IT Room", "vlan": "VLAN1", "isp_provider": "Nepal Telecom Fiber", "bandwidth_mbps": 100, "status": "अनलाइन (Online)", "last_checked_bs": "२०८१-०५-१२", "remarks": "Primary Internet gateway"},
    {"id": "n002", "device_name": "Core Switch (24-Port)", "device_type": "Switch", "ip_address": "10.0.0.2", "mac_address": "AA:BB:CC:00:01:02", "location": "मुख्य कार्यालय - IT Room", "vlan": "All", "isp_provider": None, "bandwidth_mbps": 1000, "status": "अनलाइन (Online)", "last_checked_bs": "२०८१-०५-१२", "remarks": "Cisco Catalyst 2960"},
    {"id": "n003", "device_name": "WiFi AP - Hall", "device_type": "Access Point", "ip_address": "10.0.0.10", "mac_address": "AA:BB:CC:00:02:01", "location": "मुख्य हल", "vlan": "Guest", "isp_provider": None, "bandwidth_mbps": 300, "status": "अनलाइन (Online)", "last_checked_bs": "२०८१-०५-१२", "remarks": "Public WiFi"},
    {"id": "n004", "device_name": "Firewall (Hardware)", "device_type": "Firewall", "ip_address": "10.0.0.3", "mac_address": "AA:BB:CC:00:01:03", "location": "मुख्य कार्यालय - IT Room", "vlan": "All", "isp_provider": None, "bandwidth_mbps": None, "status": "अनलाइन (Online)", "last_checked_bs": "२०८१-०५-१२", "remarks": "FortiGate 60F"},
    {"id": "n005", "device_name": "Ward 4 Router (Wireless)", "device_type": "Router", "ip_address": "192.168.4.1", "mac_address": "AA:BB:CC:00:04:01", "location": "वडा कार्यालय ४", "vlan": None, "isp_provider": "WorldLink Fiber", "bandwidth_mbps": 25, "status": "अफलाइन (Offline)", "last_checked_bs": "२०८१-०५-११", "remarks": "Line issue reported - TKT-2081-002"},
]

_digital_services: List[Dict] = [
    {"id": "ds001", "service_name": "नागरिक ई-सेवा पोर्टल (e-Sifarish)", "service_type": "Portal", "url": "https://palika.gov.np/citizen-services", "responsible_officer": "IT शाखा प्रमुख", "launch_date_bs": "२०७९-०४-०१", "status": "सक्रिय (Active)", "uptime_percent": 99.2, "monthly_users": 1240, "remarks": "Online certificate services"},
    {"id": "ds002", "service_name": "डिजिटल ट्विन ड्यासबोर्ड", "service_type": "Portal", "url": "https://palika.gov.np/dashboard", "responsible_officer": "IT शाखा प्रमुख", "launch_date_bs": "२०८०-०१-०१", "status": "सक्रिय (Active)", "uptime_percent": 99.8, "monthly_users": 320, "remarks": "Internal admin dashboard"},
    {"id": "ds003", "service_name": "अनलाइन दरखास्त (e-Recruitment)", "service_type": "Portal", "url": "https://palika.gov.np/recruitment", "responsible_officer": "प्रशासन शाखा", "launch_date_bs": "२०८०-०५-०१", "status": "सक्रिय (Active)", "uptime_percent": 99.5, "monthly_users": 185, "remarks": "Job application portal"},
    {"id": "ds004", "service_name": "SMS सूचना प्रणाली", "service_type": "SMS", "url": None, "responsible_officer": "IT शाखा", "launch_date_bs": "२०७९-०७-०१", "status": "सक्रिय (Active)", "uptime_percent": 97.5, "monthly_users": 2500, "remarks": "Automated SMS alerts"},
    {"id": "ds005", "service_name": "GIS नक्सा सेवा", "service_type": "Portal", "url": "https://palika.gov.np/gis-map", "responsible_officer": "IT शाखा", "launch_date_bs": "२०८०-०२-०१", "status": "सक्रिय (Active)", "uptime_percent": 98.9, "monthly_users": 450, "remarks": "Public GIS mapping"},
]

_cyber_logs: List[Dict] = [
    {"id": "cl001", "log_type": "Firewall Block", "severity": "मध्यम (Medium)", "source_ip": "192.168.1.150", "target_system": "Main Server", "action_taken": "IP blocked by firewall rule", "detected_at_bs": "२०८१-०५-०५ बिहान १०:३५", "resolved": True, "remarks": "Port scan detected"},
    {"id": "cl002", "log_type": "Virus Found", "severity": "उच्च (High)", "source_ip": None, "target_system": "लेखा Desktop (IT-COM-003)", "action_taken": "Quarantined and removed by ESET", "detected_at_bs": "२०८१-०५-०७ दिउँसो २:१५", "resolved": True, "remarks": "USB-spread malware (Autorun.inf)"},
    {"id": "cl003", "log_type": "Phishing Email", "severity": "उच्च (High)", "source_ip": None, "target_system": "Office Email System", "action_taken": "Email deleted, staff warned, sender blocked", "detected_at_bs": "२०८१-०५-०९ बिहान ११:०५", "resolved": True, "remarks": "Fake bank email"},
    {"id": "cl004", "log_type": "Unauthorized Access Attempt", "severity": "अत्यावश्यक (Critical)", "source_ip": "45.33.21.100", "target_system": "e-Sifarish Admin Panel", "action_taken": "Account locked, IP blocked, admin notified", "detected_at_bs": "२०८१-०५-१० राति ११:५५", "resolved": True, "remarks": "Brute force attempt - 47 failed logins"},
    {"id": "cl005", "log_type": "Policy Violation", "severity": "न्यून (Low)", "source_ip": "10.0.0.45", "target_system": "Internet Proxy", "action_taken": "Access logged, staff counselled", "detected_at_bs": "२०८१-०५-१२ दिउँसो ३:४०", "resolved": False, "remarks": "Social media access during work hours"},
]

_budget_items: List[Dict] = [
    {"id": "b001", "fiscal_year": "२०८१/०८२", "head": "IT उपकरण खरिद (Hardware Purchase)", "budget_allocated": 500000, "budget_spent": 170000, "remarks": "Computers, printers, UPS"},
    {"id": "b002", "fiscal_year": "२०८१/०८२", "head": "सफ्टवेयर इजाजत नवीकरण (Software License Renewal)", "budget_allocated": 200000, "budget_spent": 108000, "remarks": "Office 365, Antivirus, Accounting SW"},
    {"id": "b003", "fiscal_year": "२०८१/०८२", "head": "इन्टरनेट तथा नेटवर्क (Internet & Network)", "budget_allocated": 180000, "budget_spent": 75000, "remarks": "NT Fiber + WorldLink 6 months"},
    {"id": "b004", "fiscal_year": "२०८१/०८२", "head": "मर्मत सम्भार (IT Maintenance)", "budget_allocated": 120000, "budget_spent": 35000, "remarks": "Hardware repairs, AMC"},
    {"id": "b005", "fiscal_year": "२०८१/०८२", "head": "प्रशिक्षण तथा क्षमता विकास (IT Training)", "budget_allocated": 80000, "budget_spent": 45000, "remarks": "Staff IT training workshops"},
]

_staff: List[Dict] = [
    {"id": "s001", "name": "कृष्ण बहादुर मगर", "designation": "सूचना प्रविधि अधिकृत (IT Officer)", "level": "अधिकृत छैठौं (6th)", "qualifications": "BIT, CCNA", "phone": "९८४५-१२३४५६", "email": "it@palika.gov.np", "join_date_bs": "२०७८-०३-०१", "responsibilities": ["IT Infrastructure Management", "Cybersecurity", "System Administration", "Staff IT Training"]},
    {"id": "s002", "name": "अवतार सिंह तामाङ", "designation": "कम्प्युटर अपरेटर (Computer Operator)", "level": "सहायक पाँचौं (5th)", "qualifications": "CTEVT Diploma IT", "phone": "९८०१-९८७६५४", "email": "it2@palika.gov.np", "join_date_bs": "२०७९-०७-१५", "responsibilities": ["Data Entry", "Hardware Support", "Printing & Scanning", "Document Management"]},
]


# ─────────────────────────────────────────────────────────────────────────────
# ENDPOINTS
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/summary")
def get_it_summary():
    total_assets = len(_assets)
    active_assets = sum(1 for a in _assets if "सक्रिय" in a["status"])
    repair_assets = sum(1 for a in _assets if "मर्मत" in a["status"])

    total_licenses = len(_licenses)
    expiring_licenses = sum(1 for l in _licenses if "म्याद सकिँदै" in l.get("status", ""))

    open_tickets = sum(1 for t in _tickets if "खुला" in t["status"])
    in_progress_tickets = sum(1 for t in _tickets if "प्रगतिमा" in t["status"])
    resolved_tickets = sum(1 for t in _tickets if "समाधान" in t["status"])
    critical_tickets = sum(1 for t in _tickets if "अत्यावश्यक" in t["priority"] and "समाधान" not in t["status"])

    online_devices = sum(1 for n in _network_devices if "अनलाइन" in n["status"])
    offline_devices = sum(1 for n in _network_devices if "अफलाइन" in n["status"])

    active_services = sum(1 for s in _digital_services if "सक्रिय" in s["status"])
    avg_uptime = round(sum(s["uptime_percent"] for s in _digital_services) / len(_digital_services), 2) if _digital_services else 0.0

    total_cyber_incidents = len(_cyber_logs)
    unresolved_incidents = sum(1 for c in _cyber_logs if not c["resolved"])
    critical_incidents = sum(1 for c in _cyber_logs if "अत्यावश्यक" in c["severity"])

    total_budget = sum(b["budget_allocated"] for b in _budget_items)
    total_spent = sum(b["budget_spent"] for b in _budget_items)

    return {
        "assets": {
            "total": total_assets,
            "active": active_assets,
            "under_repair": repair_assets,
        },
        "licenses": {
            "total": total_licenses,
            "expiring_soon": expiring_licenses,
        },
        "tickets": {
            "open": open_tickets,
            "in_progress": in_progress_tickets,
            "resolved": resolved_tickets,
            "critical": critical_tickets,
        },
        "network": {
            "total_devices": len(_network_devices),
            "online": online_devices,
            "offline": offline_devices,
        },
        "digital_services": {
            "total": len(_digital_services),
            "active": active_services,
            "avg_uptime_percent": avg_uptime,
        },
        "cybersecurity": {
            "total_incidents": total_cyber_incidents,
            "unresolved": unresolved_incidents,
            "critical": critical_incidents,
        },
        "budget": {
            "fiscal_year": "२०८१/०८२",
            "total_allocated": total_budget,
            "total_spent": total_spent,
            "utilization_percent": round((total_spent / total_budget * 100) if total_budget else 0, 1),
        }
    }


# ─── IT Assets ───────────────────────────────────────────────────────────────

@router.get("/assets")
def get_assets(category: Optional[str] = Query(None), status: Optional[str] = Query(None)):
    result = _assets
    if category and category != "all":
        result = [a for a in result if category.lower() in a["category"].lower()]
    if status and status != "all":
        result = [a for a in result if status in a["status"]]
    return result

@router.get("/assets/{asset_id}")
def get_asset(asset_id: str):
    asset = next((a for a in _assets if a["id"] == asset_id), None)
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    return asset

@router.post("/assets")
def create_asset(data: ITAssetCreate):
    new_id = str(uuid.uuid4())[:8]
    record = {"id": new_id, **data.dict()}
    _assets.append(record)
    return record

@router.put("/assets/{asset_id}")
def update_asset(asset_id: str, data: ITAssetCreate):
    for i, a in enumerate(_assets):
        if a["id"] == asset_id:
            _assets[i] = {"id": asset_id, **data.dict()}
            return _assets[i]
    raise HTTPException(status_code=404, detail="Asset not found")

@router.delete("/assets/{asset_id}")
def delete_asset(asset_id: str):
    global _assets
    _assets = [a for a in _assets if a["id"] != asset_id]
    return {"success": True}


# ─── Software Licenses ───────────────────────────────────────────────────────

@router.get("/licenses")
def get_licenses(status: Optional[str] = Query(None)):
    result = _licenses
    if status and status != "all":
        result = [l for l in result if status in l.get("status", "")]
    return result

@router.post("/licenses")
def create_license(data: SoftwareLicenseCreate):
    new_id = str(uuid.uuid4())[:8]
    record = {"id": new_id, **data.dict()}
    _licenses.append(record)
    return record

@router.put("/licenses/{license_id}")
def update_license(license_id: str, data: SoftwareLicenseCreate):
    for i, l in enumerate(_licenses):
        if l["id"] == license_id:
            _licenses[i] = {"id": license_id, **data.dict()}
            return _licenses[i]
    raise HTTPException(status_code=404, detail="License not found")

@router.delete("/licenses/{license_id}")
def delete_license(license_id: str):
    global _licenses
    _licenses = [l for l in _licenses if l["id"] != license_id]
    return {"success": True}


# ─── Support Tickets ─────────────────────────────────────────────────────────

@router.get("/tickets")
def get_tickets(status: Optional[str] = Query(None), priority: Optional[str] = Query(None), category: Optional[str] = Query(None)):
    result = _tickets
    if status and status != "all":
        result = [t for t in result if status in t["status"]]
    if priority and priority != "all":
        result = [t for t in result if priority in t["priority"]]
    if category and category != "all":
        result = [t for t in result if category.lower() in t["category"].lower()]
    return result

@router.post("/tickets")
def create_ticket(data: SupportTicketCreate):
    new_id = str(uuid.uuid4())[:8]
    ticket_no = data.ticket_no or f"TKT-2081-{len(_tickets)+1:03d}"
    record = {"id": new_id, "ticket_no": ticket_no, **{k: v for k, v in data.dict().items() if k != "ticket_no"}}
    _tickets.append(record)
    return record

@router.put("/tickets/{ticket_id}")
def update_ticket(ticket_id: str, data: SupportTicketCreate):
    for i, t in enumerate(_tickets):
        if t["id"] == ticket_id:
            ticket_no = t.get("ticket_no") or data.ticket_no or f"TKT-2081-{i+1:03d}"
            _tickets[i] = {"id": ticket_id, "ticket_no": ticket_no, **{k: v for k, v in data.dict().items() if k != "ticket_no"}}
            return _tickets[i]
    raise HTTPException(status_code=404, detail="Ticket not found")

@router.put("/tickets/{ticket_id}/resolve")
def resolve_ticket(ticket_id: str, resolution: dict):
    for t in _tickets:
        if t["id"] == ticket_id:
            t["status"] = "समाधान भयो (Resolved)"
            t["resolution_notes"] = resolution.get("notes", "")
            t["resolved_at_bs"] = resolution.get("resolved_at_bs", "२०८१-०५-१२")
            return t
    raise HTTPException(status_code=404, detail="Ticket not found")

@router.delete("/tickets/{ticket_id}")
def delete_ticket(ticket_id: str):
    global _tickets
    _tickets = [t for t in _tickets if t["id"] != ticket_id]
    return {"success": True}


# ─── Network Devices ─────────────────────────────────────────────────────────

@router.get("/network")
def get_network_devices(status: Optional[str] = Query(None)):
    result = _network_devices
    if status and status != "all":
        result = [n for n in result if status in n["status"]]
    return result

@router.post("/network")
def create_network_device(data: NetworkDeviceCreate):
    new_id = str(uuid.uuid4())[:8]
    record = {"id": new_id, **data.dict()}
    _network_devices.append(record)
    return record

@router.put("/network/{device_id}")
def update_network_device(device_id: str, data: NetworkDeviceCreate):
    for i, n in enumerate(_network_devices):
        if n["id"] == device_id:
            _network_devices[i] = {"id": device_id, **data.dict()}
            return _network_devices[i]
    raise HTTPException(status_code=404, detail="Device not found")

@router.delete("/network/{device_id}")
def delete_network_device(device_id: str):
    global _network_devices
    _network_devices = [n for n in _network_devices if n["id"] != device_id]
    return {"success": True}


# ─── Digital Services ────────────────────────────────────────────────────────

@router.get("/services")
def get_digital_services():
    return _digital_services

@router.post("/services")
def create_digital_service(data: DigitalServiceCreate):
    new_id = str(uuid.uuid4())[:8]
    record = {"id": new_id, **data.dict()}
    _digital_services.append(record)
    return record

@router.put("/services/{service_id}")
def update_digital_service(service_id: str, data: DigitalServiceCreate):
    for i, s in enumerate(_digital_services):
        if s["id"] == service_id:
            _digital_services[i] = {"id": service_id, **data.dict()}
            return _digital_services[i]
    raise HTTPException(status_code=404, detail="Service not found")

@router.delete("/services/{service_id}")
def delete_digital_service(service_id: str):
    global _digital_services
    _digital_services = [s for s in _digital_services if s["id"] != service_id]
    return {"success": True}


# ─── Cybersecurity Logs ──────────────────────────────────────────────────────

@router.get("/cyber-logs")
def get_cyber_logs(resolved: Optional[bool] = Query(None)):
    result = _cyber_logs
    if resolved is not None:
        result = [c for c in result if c["resolved"] == resolved]
    return result

@router.post("/cyber-logs")
def create_cyber_log(data: CyberLogCreate):
    new_id = str(uuid.uuid4())[:8]
    record = {"id": new_id, **data.dict()}
    _cyber_logs.append(record)
    return record

@router.put("/cyber-logs/{log_id}")
def update_cyber_log(log_id: str, data: CyberLogCreate):
    for i, c in enumerate(_cyber_logs):
        if c["id"] == log_id:
            _cyber_logs[i] = {"id": log_id, **data.dict()}
            return _cyber_logs[i]
    raise HTTPException(status_code=404, detail="Log not found")

@router.put("/cyber-logs/{log_id}/resolve")
def resolve_cyber_incident(log_id: str):
    for c in _cyber_logs:
        if c["id"] == log_id:
            c["resolved"] = True
            return c
    raise HTTPException(status_code=404, detail="Log not found")

@router.delete("/cyber-logs/{log_id}")
def delete_cyber_log(log_id: str):
    global _cyber_logs
    _cyber_logs = [c for c in _cyber_logs if c["id"] != log_id]
    return {"success": True}


# ─── IT Budget ───────────────────────────────────────────────────────────────

@router.get("/budget")
def get_it_budget(fiscal_year: Optional[str] = Query(None)):
    result = _budget_items
    if fiscal_year:
        result = [b for b in result if b["fiscal_year"] == fiscal_year]
    return result

@router.post("/budget")
def create_budget_item(data: ITBudgetCreate):
    new_id = str(uuid.uuid4())[:8]
    record = {"id": new_id, **data.dict()}
    _budget_items.append(record)
    return record

@router.put("/budget/{budget_id}")
def update_budget_item(budget_id: str, data: ITBudgetCreate):
    for i, b in enumerate(_budget_items):
        if b["id"] == budget_id:
            _budget_items[i] = {"id": budget_id, **data.dict()}
            return _budget_items[i]
    raise HTTPException(status_code=404, detail="Budget item not found")

@router.delete("/budget/{budget_id}")
def delete_budget_item(budget_id: str):
    global _budget_items
    _budget_items = [b for b in _budget_items if b["id"] != budget_id]
    return {"success": True}


# ─── IT Officers / Staff ─────────────────────────────────────────────────────

@router.get("/staff")
def get_it_staff():
    return _staff

@router.post("/staff")
def create_it_staff(data: ITStaffCreate):
    new_id = str(uuid.uuid4())[:8]
    record = {"id": new_id, **data.dict()}
    _staff.append(record)
    return record

@router.put("/staff/{staff_id}")
def update_it_staff(staff_id: str, data: ITStaffCreate):
    for i, s in enumerate(_staff):
        if s["id"] == staff_id:
            _staff[i] = {"id": staff_id, **data.dict()}
            return _staff[i]
    raise HTTPException(status_code=404, detail="Staff not found")

@router.delete("/staff/{staff_id}")
def delete_it_staff(staff_id: str):
    global _staff
    _staff = [s for s in _staff if s["id"] != staff_id]
    return {"success": True}



@router.get('/systems')
def get_it_branch_systems():
    return []
