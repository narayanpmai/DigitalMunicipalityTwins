from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid

from core.database import get_db
from models.asset import PublicAsset

router = APIRouter(
    prefix="/api/v1/assets",
    tags=["Assets (सार्वजनिक सम्पत्ति)"]
)

@router.get("")
@router.get("/")
def get_assets(
    category: Optional[str] = None,
    ward: Optional[int] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(PublicAsset).filter(PublicAsset.deleted_at.is_(None))
    if ward and ward > 0:
        query = query.filter(PublicAsset.ward_number == ward)
    if category and category.strip() and category != "all":
        query = query.filter(PublicAsset.category == category.strip())
    if search and search.strip():
        s = f"%{search.strip()}%"
        query = query.filter(
            (PublicAsset.asset_name.ilike(s)) |
            (PublicAsset.asset_code.ilike(s)) |
            (PublicAsset.custodian_name.ilike(s)) |
            (PublicAsset.department.ilike(s)) |
            (PublicAsset.location.ilike(s))
        )
    assets = query.order_by(desc(PublicAsset.created_at)).all()
    return [a.to_dict() for a in assets]


@router.get("/stats/summary")
def get_assets_summary(db: Session = Depends(get_db)):
    assets = db.query(PublicAsset).filter(PublicAsset.deleted_at.is_(None)).all()
    total_cost = sum(float(a.purchase_cost or 0) for a in assets)
    total_book_value = sum(float(a.current_book_value or a.purchase_cost or 0) for a in assets)

    by_category = {}
    by_condition = {}
    for a in assets:
        c = a.category or "अन्य"
        by_category[c] = by_category.get(c, 0) + 1
        cond = a.condition or "चालु"
        by_condition[cond] = by_condition.get(cond, 0) + 1

    return {
        "totalAssets": len(assets),
        "totalPurchaseCostNpr": total_cost,
        "totalCurrentBookValueNpr": total_book_value,
        "byCategory": [{"category": k, "count": v} for k, v in by_category.items()],
        "byCondition": [{"condition": k, "count": v} for k, v in by_condition.items()]
    }


@router.post("")
@router.post("/")
def create_asset(payload: Dict[str, Any], db: Session = Depends(get_db)):
    aid = uuid.uuid4()
    code = payload.get("assetCode")
    if not code:
        cat_prefix = "AST"
        cat = payload.get("category", "")
        if "सवारी" in cat: cat_prefix = "VEH"
        elif "कम्प्युटर" in cat or "आईटी" in cat: cat_prefix = "IT"
        elif "भवन" in cat or "जग्गा" in cat: cat_prefix = "BLD"
        elif "फर्निचर" in cat: cat_prefix = "FUR"
        elif "मेशिनरी" in cat: cat_prefix = "MCH"
        code = f"PAMS-{cat_prefix}-{uuid.uuid4().hex[:4].upper()}"

    cost = float(payload.get("purchaseCost") or 0)
    dep_rate = float(payload.get("depreciationRatePercent") or 10.0)
    book_val = float(payload.get("currentBookValue") or (cost * (1 - dep_rate / 100.0)))

    new_asset = PublicAsset(
        id=aid,
        asset_code=code,
        asset_name=payload.get("assetName", "नयाँ सम्पत्ति"),
        category=payload.get("category", "अन्य पुँजीगत सम्पत्ति"),
        malepa_form=payload.get("malepaForm", "मलेप फारम नं ४०७ (खर्च नहुने जिन्सी खाता)"),
        condition=payload.get("condition", "चालु अवस्थामा (Operational)"),
        ward_number=int(payload.get("wardNumber") or 0),
        department=payload.get("department", "सामान्य प्रशासन शाखा"),
        custodian_name=payload.get("custodianName"),
        location=payload.get("location", "कार्यपालिका भवन"),
        purchase_date_bs=payload.get("purchaseDateBs", "२०८१-०४-१५"),
        purchase_cost=cost,
        depreciation_rate_percent=dep_rate,
        current_book_value=book_val,
        model_or_plate_no=payload.get("modelOrPlateNo"),
        vendor_name=payload.get("vendorName"),
        remarks=payload.get("remarks"),
        inspections=[],
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(new_asset)
    db.commit()
    db.refresh(new_asset)
    return new_asset.to_dict()


@router.get("/{id}")
def get_asset(id: str, db: Session = Depends(get_db)):
    asset = None
    try:
        aid = uuid.UUID(id)
        asset = db.query(PublicAsset).filter(PublicAsset.id == aid).first()
    except ValueError:
        pass
    if not asset:
        asset = db.query(PublicAsset).filter(PublicAsset.asset_code == id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    return asset.to_dict()


@router.put("/{id}")
def update_asset(id: str, payload: Dict[str, Any], db: Session = Depends(get_db)):
    asset = None
    try:
        aid = uuid.UUID(id)
        asset = db.query(PublicAsset).filter(PublicAsset.id == aid).first()
    except ValueError:
        pass
    if not asset:
        asset = db.query(PublicAsset).filter(PublicAsset.asset_code == id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    if "assetName" in payload: asset.asset_name = payload["assetName"]
    if "category" in payload: asset.category = payload["category"]
    if "condition" in payload: asset.condition = payload["condition"]
    if "wardNumber" in payload: asset.ward_number = int(payload["wardNumber"])
    if "department" in payload: asset.department = payload["department"]
    if "custodianName" in payload: asset.custodian_name = payload["custodianName"]
    if "location" in payload: asset.location = payload["location"]
    if "purchaseCost" in payload:
        asset.purchase_cost = float(payload["purchaseCost"])
    if "depreciationRatePercent" in payload:
        asset.depreciation_rate_percent = float(payload["depreciationRatePercent"])
    if "currentBookValue" in payload:
        asset.current_book_value = float(payload["currentBookValue"])
    if "modelOrPlateNo" in payload: asset.model_or_plate_no = payload["modelOrPlateNo"]
    if "vendorName" in payload: asset.vendor_name = payload["vendorName"]
    if "remarks" in payload: asset.remarks = payload["remarks"]

    asset.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(asset)
    return asset.to_dict()


@router.delete("/{id}")
def delete_asset(id: str, db: Session = Depends(get_db)):
    asset = None
    try:
        aid = uuid.UUID(id)
        asset = db.query(PublicAsset).filter(PublicAsset.id == aid).first()
    except ValueError:
        pass
    if not asset:
        asset = db.query(PublicAsset).filter(PublicAsset.asset_code == id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    asset.deleted_at = datetime.utcnow()
    db.commit()
    return {"deleted": True, "id": str(asset.id)}


@router.post("/{id}/inspect")
def inspect_asset(id: str, payload: Dict[str, Any], db: Session = Depends(get_db)):
    asset = None
    try:
        aid = uuid.UUID(id)
        asset = db.query(PublicAsset).filter(PublicAsset.id == aid).first()
    except ValueError:
        pass
    if not asset:
        asset = db.query(PublicAsset).filter(PublicAsset.asset_code == id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    inspection_record = {
        "dateBs": payload.get("dateBs", datetime.utcnow().strftime("%Y-%m-%d")),
        "inspector": payload.get("inspector", "जिन्सी निरीक्षण अधिकृत"),
        "condition": payload.get("condition", asset.condition),
        "remarks": payload.get("remarks", "नियमित जिन्सी निरीक्षण सम्पन्न।"),
        "timestamp": datetime.utcnow().isoformat()
    }

    inspections = list(asset.inspections or [])
    inspections.insert(0, inspection_record)
    asset.inspections = inspections

    if "condition" in payload and payload["condition"]:
        asset.condition = payload["condition"]
    if "remarks" in payload and payload["remarks"]:
        asset.remarks = payload["remarks"]

    asset.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(asset)
    return asset.to_dict()

