from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid

from core.database import get_db
from models.infrastructure import Infrastructure

router = APIRouter(
    prefix="/api/v1/infrastructure",
    tags=["Infrastructure (भौतिक पूर्वाधार)"]
)

TYPE_MAP = {
    "road": "road", "सडक": "road",
    "water": "water", "खानेपानी": "water",
    "electricity": "electricity", "विद्युत": "electricity",
    "communication": "communication", "सञ्चार": "communication",
    "building": "building", "भवन": "building",
    "bridge": "bridge", "पुल": "bridge",
    "irrigation": "irrigation", "सिँचाइ": "irrigation",
    "other": "other"
}

def normalize_infra_type(t: Optional[str]) -> str:
    if not t: return "road"
    for k, v in TYPE_MAP.items():
        if k in t.lower():
            return v
    return "other"

STATUS_MAP = {
    "planned": "planned",
    "under_construction": "under_construction",
    "completed": "completed",
    "operational": "operational",
    "maintenance": "maintenance",
    "damaged": "damaged"
}

def normalize_infra_status(s: Optional[str]) -> str:
    if not s: return "operational"
    return STATUS_MAP.get(s.lower().strip(), "operational")


@router.get("")
@router.get("/")
def get_infrastructures(
    type: Optional[str] = None,
    status: Optional[str] = None,
    ward: Optional[str] = None,
    wardNumber: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Infrastructure).filter(Infrastructure.deleted_at.is_(None))

    if type and type != "all":
        query = query.filter(Infrastructure.type == normalize_infra_type(type))
    if status and status != "all":
        query = query.filter(Infrastructure.status == normalize_infra_status(status))

    w_val = wardNumber or ward
    if w_val and w_val != "all":
        try:
            w_int = int(w_val)
            query = query.filter(Infrastructure.ward_number == w_int)
        except ValueError:
            pass

    if search and search.strip():
        s = f"%{search.strip()}%"
        query = query.filter(
            (Infrastructure.name.ilike(s)) |
            (Infrastructure.name_en.ilike(s)) |
            (Infrastructure.location.ilike(s)) |
            (Infrastructure.description.ilike(s))
        )

    records = query.order_by(desc(Infrastructure.created_at)).all()
    return [i.to_dict() for i in records]


@router.get("/stats")
def get_infrastructure_stats(db: Session = Depends(get_db)):
    records = db.query(Infrastructure).filter(Infrastructure.deleted_at.is_(None)).all()
    total = len(records)
    
    total_cost = sum(float(i.construction_cost or 0) for i in records)
    total_km = sum(float(i.length_km or 0) for i in records)
    total_ben_pop = sum(int(i.beneficiary_population or 0) for i in records)

    by_type = {}
    by_status = {}
    by_ward = {f"वडा {w}": 0 for w in range(1, 9)}

    for i in records:
        t = i.type or "other"
        by_type[t] = by_type.get(t, 0) + 1
        st = i.status or "operational"
        by_status[st] = by_status.get(st, 0) + 1
        wk = f"वडा {i.ward_number or 1}"
        by_ward[wk] = by_ward.get(wk, 0) + 1

    return {
        "totalAssets": total,
        "totalConstructionCost": total_cost,
        "totalRoadLengthKm": round(total_km, 2),
        "totalBeneficiaryPopulation": total_ben_pop,
        "byType": by_type,
        "byStatus": by_status,
        "byWard": by_ward
    }


@router.post("")
@router.post("/")
def create_infrastructure(payload: Dict[str, Any], db: Session = Depends(get_db)):
    iid = uuid.uuid4()
    t = normalize_infra_type(payload.get("type"))
    st = normalize_infra_status(payload.get("status"))

    new_infra = Infrastructure(
        id=iid,
        name=payload.get("name", "नयाँ पूर्वाधार"),
        name_en=payload.get("nameEn", ""),
        type=t,
        status=st,
        ward_number=int(payload.get("wardNumber") or 1),
        location=payload.get("location", ""),
        lat=payload.get("lat"),
        lng=payload.get("lng"),
        description=payload.get("description", ""),
        construction_cost=float(payload.get("constructionCost") or 0),
        length_km=float(payload.get("lengthKm") or 0),
        beneficiary_households=int(payload.get("beneficiaryHouseholds") or 0),
        beneficiary_population=int(payload.get("beneficiaryPopulation") or 0),
        constructed_year=int(payload.get("constructedYear") or 2080),
        contractor=payload.get("contractor", ""),
        condition=payload.get("condition", "सन्तोषजनक (Good)"),
        project_id=payload.get("projectId", ""),
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(new_infra)
    db.commit()
    db.refresh(new_infra)
    return new_infra.to_dict()


@router.get("/{id}")
def get_infrastructure(id: str, db: Session = Depends(get_db)):
    infra = find_infra(id, db)
    if not infra:
        raise HTTPException(status_code=404, detail="Infrastructure asset not found")
    return infra.to_dict()


@router.put("/{id}")
def update_infrastructure(id: str, payload: Dict[str, Any], db: Session = Depends(get_db)):
    infra = find_infra(id, db)
    if not infra:
        raise HTTPException(status_code=404, detail="Infrastructure asset not found")

    if "name" in payload: infra.name = payload["name"]
    if "type" in payload: infra.type = normalize_infra_type(payload["type"])
    if "status" in payload: infra.status = normalize_infra_status(payload["status"])
    if "wardNumber" in payload: infra.ward_number = int(payload["wardNumber"])
    if "location" in payload: infra.location = payload["location"]
    if "condition" in payload: infra.condition = payload["condition"]
    if "constructionCost" in payload: infra.construction_cost = float(payload["constructionCost"])
    if "lengthKm" in payload: infra.length_km = float(payload["lengthKm"])

    infra.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(infra)
    return infra.to_dict()


@router.delete("/{id}")
def delete_infrastructure(id: str, db: Session = Depends(get_db)):
    infra = find_infra(id, db)
    if not infra:
        raise HTTPException(status_code=404, detail="Infrastructure asset not found")

    infra.deleted_at = datetime.utcnow()
    db.commit()
    return {"message": "Infrastructure asset deleted successfully", "id": str(infra.id)}


def find_infra(id_str: str, db: Session) -> Optional[Infrastructure]:
    try:
        tid = uuid.UUID(id_str)
        i = db.query(Infrastructure).filter(Infrastructure.id == tid, Infrastructure.deleted_at.is_(None)).first()
        if i: return i
    except ValueError:
        pass
    return db.query(Infrastructure).filter(Infrastructure.name.ilike(f"%{id_str}%"), Infrastructure.deleted_at.is_(None)).first()
