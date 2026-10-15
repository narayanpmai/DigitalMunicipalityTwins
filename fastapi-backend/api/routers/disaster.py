"""
Disaster Management API Router (विपद् व्यवस्थापन)
Municipal Digital Twins v2.0 — Panchpokhari Thangpal
Provides complete endpoints for Incidents, Shelters, Emergency Contacts, Relief Inventory, Relief Funds, and Vulnerable Settlements
"""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from typing import List, Optional, Any, Dict
from core.database import get_db
from models.disaster import (
    DisasterEvent, Shelter, EmergencyContact,
    ReliefInventory, DisasterReliefFund, VulnerableSettlement
)
from models.disaster_risk import (
    DisasterIncident, IncidentDamageReport, RecoveryProject
)
import uuid
from datetime import datetime

router = APIRouter(
    prefix="/api/v1/disaster",
    tags=["Disaster Management (विपद् व्यवस्थापन)"]
)


# ── 1. STATS ────────────────────────────────────────────────────────────────
@router.get("/stats")
def get_disaster_stats(db: Session = Depends(get_db)):
    events = db.query(DisasterEvent).all()
    total_events = len(events)
    active_events = sum(1 for e in events if e.status == 'active')

    shelters = db.query(Shelter).all()
    total_shelters = len(shelters)
    total_capacity = sum(s.capacity or 0 for s in shelters)

    total_contacts = db.query(EmergencyContact).count()

    total_inv_qty = db.query(func.sum(ReliefInventory.quantity)).scalar() or 0
    total_relief_disbursed = db.query(func.sum(DisasterReliefFund.amount_npr)).scalar() or 0
    high_risk_count = db.query(VulnerableSettlement).filter(
        VulnerableSettlement.risk_level.ilike('%उच्च%')
    ).count()

    total_recovery = db.query(RecoveryProject).count()
    completed_recovery = db.query(RecoveryProject).filter(RecoveryProject.recovery_status == 'Completed').count()
    in_progress_recovery = db.query(RecoveryProject).filter(RecoveryProject.recovery_status == 'In Progress').count()
    total_loss_npr = float(db.query(func.sum(IncidentDamageReport.estimated_loss_amount)).scalar() or 0)

    return {
        "totalEvents": total_events,
        "activeEvents": active_events,
        "totalShelters": total_shelters,
        "totalShelterCapacity": total_capacity,
        "totalContacts": total_contacts,
        "totalReliefItems": int(total_inv_qty),
        "totalReliefDistributedNPR": float(total_relief_disbursed),
        "highRiskSettlements": high_risk_count,
        "totalRecoveryProjects": total_recovery,
        "completedRecoveryProjects": completed_recovery,
        "inProgressRecoveryProjects": in_progress_recovery,
        "totalDamageLossNPR": total_loss_npr,
    }


# ── 2. DISASTER EVENTS ──────────────────────────────────────────────────────
@router.get("/events")
@router.get("/events/")
def get_disaster_events(
    ward: Optional[int] = Query(None),
    type: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(DisasterEvent)

    if ward and ward > 0:
        query = query.filter(DisasterEvent.ward_number == ward)
    if type and type != 'all':
        query = query.filter(DisasterEvent.type == type)
    if severity and severity != 'all':
        query = query.filter(DisasterEvent.severity == severity)
    if status and status != 'all':
        query = query.filter(DisasterEvent.status == status)
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            or_(
                DisasterEvent.title.ilike(search_filter),
                DisasterEvent.description.ilike(search_filter),
                DisasterEvent.reporter_name.ilike(search_filter),
                DisasterEvent.tols_settlement.ilike(search_filter),
            )
        )

    events = query.order_by(DisasterEvent.created_at.desc()).all()
    return [e.to_dict() for e in events]


@router.get("/active")
def get_active_disaster_events(db: Session = Depends(get_db)):
    events = db.query(DisasterEvent).filter(DisasterEvent.status == 'active').order_by(DisasterEvent.created_at.desc()).all()
    return [e.to_dict() for e in events]


@router.get("/events/{event_id}")
def get_disaster_event(event_id: str, db: Session = Depends(get_db)):
    try:
        u_id = uuid.UUID(event_id)
        event = db.query(DisasterEvent).filter(DisasterEvent.id == u_id).first()
    except ValueError:
        event = None

    if not event:
        raise HTTPException(status_code=404, detail="विपद् घटना फेला परेन।")

    return event.to_dict()


@router.post("/events", status_code=status.HTTP_201_CREATED)
@router.post("/events/", status_code=status.HTTP_201_CREATED)
def create_disaster_event(data: Dict[str, Any], db: Session = Depends(get_db)):
    title = data.get("title")
    if not title:
        raise HTTPException(status_code=400, detail="विपद् घटनाको शीर्षक अनिवार्य छ।")

    try:
        event = DisasterEvent(
            id=uuid.uuid4(),
            title=title,
            type=data.get("type", "other"),
            severity=data.get("severity", "medium"),
            status=data.get("status", "active"),
            description=data.get("description", ""),
            lat=float(data["lat"]) if data.get("lat") is not None and data.get("lat") != "" else None,
            lng=float(data["lng"]) if data.get("lng") is not None and data.get("lng") != "" else None,
            ward_number=int(data.get("wardNumber") or data.get("ward_number") or 1),
            reporter_name=data.get("reporterName") or data.get("reporter_name"),
            reporter_phone=data.get("reporterPhone") or data.get("reporter_phone"),
            incident_date_bs=data.get("incidentDateBs") or data.get("incident_date_bs") or datetime.utcnow().strftime("%Y-%m-%d"),
            affected_households=int(data.get("affectedHouseholds") or data.get("affected_households") or 0),
            affected_people=int(data.get("affectedPeople") or data.get("affected_people") or 0),
            human_casualties=int(data.get("humanCasualties") or data.get("human_casualties") or 0),
            missing_persons=int(data.get("missingPersons") or data.get("missing_persons") or 0),
            injured_count=int(data.get("injuredCount") or data.get("injured_count") or 0),
            livestock_loss_count=int(data.get("livestockLossCount") or data.get("livestock_loss_count") or 0),
            fully_damaged_houses=int(data.get("fullyDamagedHouses") or data.get("fully_damaged_houses") or 0),
            partially_damaged_houses=int(data.get("partiallyDamagedHouses") or data.get("partially_damaged_houses") or 0),
            estimated_loss_npr=float(data.get("estimatedLossNPR") or data.get("estimated_loss_npr") or 0),
            relief_status=data.get("reliefStatus") or data.get("relief_status") or "आवश्यक",
            relief_materials=data.get("reliefMaterials") or data.get("relief_materials"),
            relief_disbursed_npr=float(data.get("reliefDisbursedNPR") or data.get("relief_disbursed_npr") or 0),
            rescue_team=data.get("rescueTeam") or data.get("rescue_team"),
            tols_settlement=data.get("tolsSettlement") or data.get("tols_settlement"),
        )
        db.add(event)
        db.commit()
        db.refresh(event)
        return event.to_dict()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"विपद् घटना सुरक्षित गर्न सकिएन: {str(e)}")


@router.put("/events/{event_id}")
def update_disaster_event(event_id: str, data: Dict[str, Any], db: Session = Depends(get_db)):
    try:
        u_id = uuid.UUID(event_id)
        event = db.query(DisasterEvent).filter(DisasterEvent.id == u_id).first()
    except ValueError:
        event = None

    if not event:
        raise HTTPException(status_code=404, detail="विपद् घटना फेला परेन।")

    try:
        for k, v in data.items():
            if k == "title": event.title = v
            elif k == "type": event.type = v
            elif k == "severity": event.severity = v
            elif k == "status":
                event.status = v
                if v == "resolved" and not event.resolved_at:
                    event.resolved_at = datetime.utcnow()
            elif k == "description": event.description = v
            elif k == "lat": event.lat = float(v) if v is not None and v != "" else None
            elif k == "lng": event.lng = float(v) if v is not None and v != "" else None
            elif k in ["wardNumber", "ward_number"]: event.ward_number = int(v)
            elif k in ["reporterName", "reporter_name"]: event.reporter_name = v
            elif k in ["reporterPhone", "reporter_phone"]: event.reporter_phone = v
            elif k in ["incidentDateBs", "incident_date_bs"]: event.incident_date_bs = v
            elif k in ["affectedHouseholds", "affected_households"]: event.affected_households = int(v)
            elif k in ["affectedPeople", "affected_people"]: event.affected_people = int(v)
            elif k in ["humanCasualties", "human_casualties"]: event.human_casualties = int(v)
            elif k in ["missingPersons", "missing_persons"]: event.missing_persons = int(v)
            elif k in ["injuredCount", "injured_count"]: event.injured_count = int(v)
            elif k in ["livestockLossCount", "livestock_loss_count"]: event.livestock_loss_count = int(v)
            elif k in ["fullyDamagedHouses", "fully_damaged_houses"]: event.fully_damaged_houses = int(v)
            elif k in ["partiallyDamagedHouses", "partially_damaged_houses"]: event.partially_damaged_houses = int(v)
            elif k in ["estimatedLossNPR", "estimated_loss_npr"]: event.estimated_loss_npr = float(v)
            elif k in ["reliefStatus", "relief_status"]: event.relief_status = v
            elif k in ["reliefMaterials", "relief_materials"]: event.relief_materials = v
            elif k in ["reliefDisbursedNPR", "relief_disbursed_npr"]: event.relief_disbursed_npr = float(v)
            elif k in ["rescueTeam", "rescue_team"]: event.rescue_team = v
            elif k in ["tolsSettlement", "tols_settlement"]: event.tols_settlement = v

        event.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(event)
        return event.to_dict()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"विपद् घटना अद्यावधिक गर्न सकिएन: {str(e)}")


@router.delete("/events/{event_id}")
def delete_disaster_event(event_id: str, db: Session = Depends(get_db)):
    try:
        u_id = uuid.UUID(event_id)
        event = db.query(DisasterEvent).filter(DisasterEvent.id == u_id).first()
    except ValueError:
        event = None

    if not event:
        raise HTTPException(status_code=404, detail="विपद् घटना फेला परेन।")

    db.delete(event)
    db.commit()
    return {"success": True, "message": "विपद् घटना सफलतापूर्वक हटाइयो।"}


# ── 3. SHELTERS (सुरक्षित आश्रयस्थल) ──────────────────────────────────────────
@router.get("/shelters")
def get_shelters(ward: Optional[int] = Query(None), db: Session = Depends(get_db)):
    query = db.query(Shelter)
    if ward and ward > 0:
        query = query.filter(Shelter.ward_number == ward)
    shelters = query.order_by(Shelter.ward_number).all()
    return [s.to_dict() for s in shelters]


@router.post("/shelters", status_code=status.HTTP_201_CREATED)
def create_shelter(data: Dict[str, Any], db: Session = Depends(get_db)):
    name = data.get("name")
    if not name:
        raise HTTPException(status_code=400, detail="आश्रयस्थलको नाम अनिवार्य छ।")

    try:
        shelter = Shelter(
            id=uuid.uuid4(),
            name=name,
            ward_number=int(data.get("wardNumber") or data.get("ward_number") or 1),
            location=data.get("location", ""),
            capacity=int(data.get("capacity") or 0),
            has_water=bool(data.get("hasWater", True)),
            has_power_backup=bool(data.get("hasPowerBackup", False)),
            contact_person=data.get("contactPerson") or data.get("contact_person"),
            contact_phone=data.get("contactPhone") or data.get("contact_phone"),
            lat=float(data["lat"]) if data.get("lat") is not None and data.get("lat") != "" else None,
            lng=float(data["lng"]) if data.get("lng") is not None and data.get("lng") != "" else None,
            status=data.get("status", "active"),
            facilities_description=data.get("facilitiesDescription") or data.get("facilities_description"),
        )
        db.add(shelter)
        db.commit()
        db.refresh(shelter)
        return shelter.to_dict()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"आश्रयस्थल सुरक्षित गर्न सकिएन: {str(e)}")


@router.put("/shelters/{shelter_id}")
def update_shelter(shelter_id: str, data: Dict[str, Any], db: Session = Depends(get_db)):
    try:
        u_id = uuid.UUID(shelter_id)
        shelter = db.query(Shelter).filter(Shelter.id == u_id).first()
    except ValueError:
        shelter = None

    if not shelter:
        raise HTTPException(status_code=404, detail="आश्रयस्थल फेला परेन।")

    try:
        if "name" in data: shelter.name = data["name"]
        if "wardNumber" in data or "ward_number" in data: shelter.ward_number = int(data.get("wardNumber") or data.get("ward_number"))
        if "location" in data: shelter.location = data["location"]
        if "capacity" in data: shelter.capacity = int(data["capacity"])
        if "hasWater" in data: shelter.has_water = bool(data["hasWater"])
        if "hasPowerBackup" in data: shelter.has_power_backup = bool(data["hasPowerBackup"])
        if "contactPerson" in data: shelter.contact_person = data["contactPerson"]
        if "contactPhone" in data: shelter.contact_phone = data["contactPhone"]
        if "lat" in data: shelter.lat = float(data["lat"]) if data["lat"] is not None and data["lat"] != "" else None
        if "lng" in data: shelter.lng = float(data["lng"]) if data["lng"] is not None and data["lng"] != "" else None
        if "status" in data: shelter.status = data["status"]
        if "facilitiesDescription" in data: shelter.facilities_description = data["facilitiesDescription"]

        shelter.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(shelter)
        return shelter.to_dict()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"आश्रयस्थल अद्यावधिक गर्न सकिएन: {str(e)}")


@router.delete("/shelters/{shelter_id}")
def delete_shelter(shelter_id: str, db: Session = Depends(get_db)):
    try:
        u_id = uuid.UUID(shelter_id)
        shelter = db.query(Shelter).filter(Shelter.id == u_id).first()
    except ValueError:
        shelter = None

    if not shelter:
        raise HTTPException(status_code=404, detail="आश्रयस्थल फेला परेन।")

    db.delete(shelter)
    db.commit()
    return {"success": True, "message": "आश्रयस्थल सफलतापूर्वक हटाइयो।"}


# ── 4. EMERGENCY CONTACTS (आकस्मिक सम्पर्कहरू) ──────────────────────────────
@router.get("/contacts")
def get_contacts(
    ward: Optional[int] = Query(None),
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(EmergencyContact)
    if ward and ward > 0:
        query = query.filter(EmergencyContact.ward_number == ward)
    if category and category != 'all':
        query = query.filter(EmergencyContact.category == category)
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            or_(
                EmergencyContact.name.ilike(search_filter),
                EmergencyContact.role.ilike(search_filter),
                EmergencyContact.phone.ilike(search_filter),
                EmergencyContact.department.ilike(search_filter),
            )
        )

    contacts = query.order_by(EmergencyContact.ward_number.asc(), EmergencyContact.name.asc()).all()
    return [c.to_dict() for c in contacts]


@router.post("/contacts", status_code=status.HTTP_201_CREATED)
def create_contact(data: Dict[str, Any], db: Session = Depends(get_db)):
    name = data.get("name")
    phone = data.get("phone")
    if not name or not phone:
        raise HTTPException(status_code=400, detail="सम्पर्क व्यक्तिको नाम र फोन नम्बर अनिवार्य छ।")

    try:
        contact = EmergencyContact(
            id=uuid.uuid4(),
            name=name,
            role=data.get("role", ""),
            phone=phone,
            ward_number=int(data.get("wardNumber") or data.get("ward_number") or 0),
            department=data.get("department", ""),
            category=data.get("category", "other"),
            is_available_24_7=bool(data.get("isAvailable24_7", True)),
        )
        db.add(contact)
        db.commit()
        db.refresh(contact)
        return contact.to_dict()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"सम्पर्क दर्ता गर्न सकिएन: {str(e)}")


@router.put("/contacts/{contact_id}")
def update_contact(contact_id: str, data: Dict[str, Any], db: Session = Depends(get_db)):
    try:
        u_id = uuid.UUID(contact_id)
        contact = db.query(EmergencyContact).filter(EmergencyContact.id == u_id).first()
    except ValueError:
        contact = None

    if not contact:
        raise HTTPException(status_code=404, detail="सम्पर्क फेला परेन।")

    try:
        if "name" in data: contact.name = data["name"]
        if "role" in data: contact.role = data["role"]
        if "phone" in data: contact.phone = data["phone"]
        if "wardNumber" in data: contact.ward_number = int(data["wardNumber"])
        if "department" in data: contact.department = data["department"]
        if "category" in data: contact.category = data["category"]
        if "isAvailable24_7" in data: contact.is_available_24_7 = bool(data["isAvailable24_7"])

        contact.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(contact)
        return contact.to_dict()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"सम्पर्क अद्यावधिक गर्न सकिएन: {str(e)}")


@router.delete("/contacts/{contact_id}")
def delete_contact(contact_id: str, db: Session = Depends(get_db)):
    try:
        u_id = uuid.UUID(contact_id)
        contact = db.query(EmergencyContact).filter(EmergencyContact.id == u_id).first()
    except ValueError:
        contact = None

    if not contact:
        raise HTTPException(status_code=404, detail="सम्पर्क फेला परेन।")

    db.delete(contact)
    db.commit()
    return {"success": True, "message": "सम्पर्क हटाइयो।"}


# ── 5. RELIEF INVENTORY (राहत सामग्री भण्डार) ───────────────────────────────
@router.get("/inventory")
def get_relief_inventory(category: Optional[str] = Query(None), db: Session = Depends(get_db)):
    query = db.query(ReliefInventory)
    if category and category != 'all':
        query = query.filter(ReliefInventory.category == category)
    items = query.order_by(ReliefInventory.ward_number).all()
    return [i.to_dict() for i in items]


@router.post("/inventory", status_code=status.HTTP_201_CREATED)
def create_relief_inventory_item(data: Dict[str, Any], db: Session = Depends(get_db)):
    try:
        item = ReliefInventory(
            id=uuid.uuid4(),
            item_name=data.get("itemName") or data.get("item_name") or "राहत सामग्री",
            category=data.get("category", "shelter"),
            quantity=int(data.get("quantity") or 0),
            unit=data.get("unit", "थान"),
            warehouse_location=data.get("warehouseLocation") or data.get("warehouse_location"),
            ward_number=int(data.get("wardNumber") or data.get("ward_number") or 1),
            condition=data.get("condition", "good"),
            last_updated_bs=data.get("lastUpdatedBs") or data.get("last_updated_bs") or "२०८१-०५-१०",
            contact_person=data.get("contactPerson") or data.get("contact_person"),
        )
        db.add(item)
        db.commit()
        db.refresh(item)
        return item.to_dict()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"राहत सामग्री सुरक्षित गर्न सकिएन: {str(e)}")


# ── 6. DISASTER RELIEF FUNDS (विपद् कोष राहत वितरण) ─────────────────────────
@router.get("/funds")
def get_relief_funds(db: Session = Depends(get_db)):
    funds = db.query(DisasterReliefFund).order_by(DisasterReliefFund.created_at.desc()).all()
    return [f.to_dict() for f in funds]


@router.post("/funds", status_code=status.HTTP_201_CREATED)
def create_relief_fund(data: Dict[str, Any], db: Session = Depends(get_db)):
    try:
        fund = DisasterReliefFund(
            id=uuid.uuid4(),
            disaster_title=data.get("disasterTitle") or data.get("disaster_title") or "विपद् राहत",
            ward_number=int(data.get("wardNumber") or data.get("ward_number") or 1),
            beneficiary_name=data.get("beneficiaryName") or data.get("beneficiary_name") or "",
            citizenship_no=data.get("citizenshipNo") or data.get("citizenship_no"),
            family_count=int(data.get("familyCount") or data.get("family_count") or 1),
            relief_type=data.get("reliefType") or data.get("relief_type") or "नगद राहत (DBT)",
            amount_npr=float(data.get("amountNPR") or data.get("amount_npr") or 0),
            distribution_date_bs=data.get("distributionDateBs") or data.get("distribution_date_bs") or "२०८१-०५-०४",
            disbursed_by_officer=data.get("disbursedByOfficer") or data.get("disbursed_by_officer"),
            voucher_no=data.get("voucherNo") or data.get("voucher_no"),
            status=data.get("status", "वितरण सम्पन्न"),
        )
        db.add(fund)
        db.commit()
        db.refresh(fund)
        return fund.to_dict()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"राहत निकासा सुरक्षित गर्न सकिएन: {str(e)}")


# ── 7. VULNERABLE SETTLEMENTS (जोखिमयुक्त बस्ती) ─────────────────────────────
@router.get("/settlements")
def get_vulnerable_settlements(db: Session = Depends(get_db)):
    settlements = db.query(VulnerableSettlement).order_by(VulnerableSettlement.ward_number).all()
    return [s.to_dict() for s in settlements]


@router.post("/settlements", status_code=status.HTTP_201_CREATED)
def create_vulnerable_settlement(data: Dict[str, Any], db: Session = Depends(get_db)):
    try:
        settlement = VulnerableSettlement(
            id=uuid.uuid4(),
            settlement_name=data.get("settlementName") or data.get("settlement_name") or "",
            ward_number=int(data.get("wardNumber") or data.get("ward_number") or 1),
            hazard_type=data.get("hazardType") or data.get("hazard_type") or "पहिरो (Landslide)",
            risk_level=data.get("riskLevel") or data.get("risk_level") or "उच्च",
            at_risk_households=int(data.get("atRiskHouseholds") or data.get("at_risk_households") or 0),
            at_risk_population=int(data.get("atRiskPopulation") or data.get("at_risk_population") or 0),
            resettlement_priority=data.get("resettlementPriority") or data.get("resettlement_priority") or "पूर्वतयारी तथा सतर्कता",
            safe_shelter_name=data.get("safeShelterName") or data.get("safe_shelter_name"),
            focal_person=data.get("focalPerson") or data.get("focal_person"),
            focal_person_phone=data.get("focalPersonPhone") or data.get("focal_person_phone"),
        )
        db.add(settlement)
        db.commit()
        db.refresh(settlement)
        return settlement.to_dict()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"जोखिमयुक्त बस्ती सुरक्षित गर्न सकिएन: {str(e)}")


# ── 8. GIS FEATURECOLLECTION ────────────────────────────────────────────────
@router.get("/gis")
def get_disaster_gis_layers(db: Session = Depends(get_db)):
    """GeoJSON FeatureCollection combining active disaster events and emergency shelters"""
    features = []

    # Disaster Events
    events = db.query(DisasterEvent).filter(DisasterEvent.lat.isnot(None), DisasterEvent.lng.isnot(None)).all()
    for e in events:
        features.append({
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [e.lng, e.lat]
            },
            "properties": {
                "id": str(e.id),
                "category": "disaster_event",
                "title": e.title,
                "type": e.type,
                "severity": e.severity,
                "status": e.status,
                "wardNumber": e.ward_number,
                "affectedHouseholds": e.affected_households,
                "reporterName": e.reporter_name,
                "reporterPhone": e.reporter_phone,
            }
        })

    # Emergency Shelters
    shelters = db.query(Shelter).filter(Shelter.lat.isnot(None), Shelter.lng.isnot(None)).all()
    for s in shelters:
        features.append({
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [s.lng, s.lat]
            },
            "properties": {
                "id": str(s.id),
                "category": "emergency_shelter",
                "title": s.name,
                "wardNumber": s.ward_number,
                "capacity": s.capacity,
                "status": s.status,
                "contactPerson": s.contact_person,
                "contactPhone": s.contact_phone,
                "hasWater": s.has_water,
                "hasPowerBackup": s.has_power_backup,
            }
        })

    return {
        "type": "FeatureCollection",
        "features": features
    }


# ── 9. RECOVERY & RECONSTRUCTION PROJECTS (पुनर्निर्माण तथा पुनःलाभ आयोजना) ──
@router.get("/recovery-projects/stats")
def get_recovery_projects_stats(db: Session = Depends(get_db)):
    projects = db.query(RecoveryProject).all()
    total = len(projects)
    completed = sum(1 for p in projects if p.recovery_status == 'Completed')
    in_progress = sum(1 for p in projects if p.recovery_status == 'In Progress')
    planned = sum(1 for p in projects if p.recovery_status == 'Planned')
    beneficiaries_count = sum(1 for p in projects if p.beneficiary_household_id)

    type_counts = {}
    for p in projects:
        t = p.reconstruction_type or "अन्य"
        type_counts[t] = type_counts.get(t, 0) + 1

    status_counts = {}
    for p in projects:
        s = p.recovery_status or "Planned"
        status_counts[s] = status_counts.get(s, 0) + 1

    return {
        "totalProjects": total,
        "completedProjects": completed,
        "inProgressProjects": in_progress,
        "plannedProjects": planned,
        "beneficiariesLinked": beneficiaries_count,
        "typeBreakdown": type_counts,
        "statusBreakdown": status_counts,
    }


@router.get("/recovery-projects")
@router.get("/recovery-projects/")
def get_recovery_projects(
    status: Optional[str] = Query(None),
    reconstruction_type: Optional[str] = Query(None),
    incident_id: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(RecoveryProject)

    if status and status != 'all':
        query = query.filter(RecoveryProject.recovery_status == status)
    if reconstruction_type and reconstruction_type != 'all':
        query = query.filter(RecoveryProject.reconstruction_type.ilike(f"%{reconstruction_type}%"))
    if incident_id and incident_id != 'all':
        query = query.filter(RecoveryProject.incident_id == incident_id)
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            or_(
                RecoveryProject.reconstruction_type.ilike(search_filter),
                RecoveryProject.recovery_status.ilike(search_filter),
                RecoveryProject.incident_id.ilike(search_filter),
            )
        )

    projects = query.order_by(RecoveryProject.created_at.desc()).all()
    return [p.to_dict() for p in projects]


@router.post("/recovery-projects", status_code=status.HTTP_201_CREATED)
def create_recovery_project(data: Dict[str, Any], db: Session = Depends(get_db)):
    incident_id = data.get("incidentId") or data.get("incident_id")
    reconstruction_type = data.get("reconstructionType") or data.get("reconstruction_type")

    if not incident_id or not reconstruction_type:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="विपद् घटना (Incident ID) र पुनर्निर्माण प्रकार (Reconstruction Type) अनिवार्य छ।"
        )

    incident = db.query(DisasterIncident).filter(DisasterIncident.id == incident_id).first()
    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"उल्लेखित विपद् घटना ID '{incident_id}' फेला परेन।"
        )

    proj_id = str(uuid.uuid4())
    project = RecoveryProject(
        tenant_id=data.get("tenant_id", "panchpokhari"),
        id=proj_id,
        incident_id=incident_id,
        project_id=data.get("projectId") or data.get("project_id"),
        reconstruction_type=reconstruction_type,
        beneficiary_household_id=data.get("beneficiaryHouseholdId") or data.get("beneficiary_household_id"),
        recovery_status=data.get("recoveryStatus") or data.get("recovery_status", "Planned"),
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )

    try:
        db.add(project)
        db.commit()
        db.refresh(project)
        return project.to_dict()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"पुनर्निर्माण आयोजना सिर्जना गर्न सकिएन: {str(e)}")


@router.put("/recovery-projects/{project_id}/status")
def update_recovery_project_status(
    project_id: str,
    data: Dict[str, Any],
    db: Session = Depends(get_db)
):
    project = db.query(RecoveryProject).filter(RecoveryProject.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="पुनर्निर्माण आयोजना फेला परेन।")

    new_status = data.get("status") or data.get("recovery_status") or data.get("recoveryStatus")
    if not new_status:
        raise HTTPException(status_code=400, detail="नयाँ स्थिति (status) आवश्यक छ।")

    project.recovery_status = new_status
    project.updated_at = datetime.utcnow()

    try:
        db.commit()
        db.refresh(project)
        return project.to_dict()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"आयोजना स्थिति अद्यावधिक गर्न सकिएन: {str(e)}")


@router.delete("/recovery-projects/{project_id}")
def delete_recovery_project(project_id: str, db: Session = Depends(get_db)):
    project = db.query(RecoveryProject).filter(RecoveryProject.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="पुनर्निर्माण आयोजना फेला परेन।")

    try:
        db.delete(project)
        db.commit()
        return {"status": "success", "message": "पुनर्निर्माण आयोजना सफलतापूर्वक हटाइयो।"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"आयोजना हटाउन सकिएन: {str(e)}")


# ── 10. DAMAGE ASSESSMENTS (क्षति मूल्याङ्कन तथा तत्काल राहत प्रतिवेदन) ───────
@router.get("/damage-reports")
@router.get("/damage-reports/")
def get_damage_reports(
    incident_id: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(IncidentDamageReport)
    if incident_id and incident_id != 'all':
        query = query.filter(IncidentDamageReport.incident_id == incident_id)

    reports = query.order_by(IncidentDamageReport.created_at.desc()).all()
    return [r.to_dict() for r in reports]


@router.post("/damage-reports", status_code=status.HTTP_201_CREATED)
def create_damage_report(data: Dict[str, Any], db: Session = Depends(get_db)):
    incident_id = data.get("incidentId") or data.get("incident_id")
    if not incident_id:
        raise HTTPException(status_code=400, detail="विपद् घटना (Incident ID) अनिवार्य छ।")

    incident = db.query(DisasterIncident).filter(DisasterIncident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail=f"विपद् घटना ID '{incident_id}' फेला परेन।")

    report_id = data.get("id") or f"dmg-{str(uuid.uuid4())[:8]}"
    report = IncidentDamageReport(
        tenant_id=data.get("tenant_id", "panchpokhari"),
        id=report_id,
        incident_id=incident_id,
        affected_household_id=data.get("affectedHouseholdId") or data.get("affected_household_id"),
        affected_infrastructure_id=data.get("affectedInfrastructureId") or data.get("affected_infrastructure_id"),
        human_casualties=int(data.get("humanCasualties") or data.get("human_casualties") or 0),
        injured_count=int(data.get("injuredCount") or data.get("injured_count") or 0),
        estimated_loss_amount=float(data.get("estimatedLossAmount") or data.get("estimated_loss_amount") or 0.0),
        relief_provided=data.get("reliefProvided") or data.get("relief_provided") or {},
        created_at=datetime.utcnow()
    )

    try:
        db.add(report)
        db.commit()
        db.refresh(report)
        return report.to_dict()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"क्षति प्रतिवेदन सिर्जना गर्न सकिएन: {str(e)}")



@router.get('')
def get_disasters_list():
    return []
