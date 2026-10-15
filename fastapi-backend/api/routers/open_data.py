from fastapi import APIRouter, Depends, HTTPException, Query, Body, Response
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from typing import List, Optional, Any, Dict
from core.database import get_db
from models.open_data import OpenDataRecord, MunicipalIndicator, CitizenDataRequest
from models.dashboard_analytics import OpenDataPublication, DashboardAnalyticsCache
from schemas.open_data import (
    OpenDataSchema, OpenDataCreate, OpenDataUpdate, OpenDataStats,
    MunicipalIndicatorSchema, MunicipalIndicatorCreate, MunicipalIndicatorUpdate,
    CitizenDataRequestSchema, CitizenDataRequestCreate, CitizenDataRequestUpdate
)
from datetime import datetime
import uuid
import json
import csv
import io

router = APIRouter(
    prefix="/api/v1/open-data",
    tags=["Open Data, Municipal Indicators & Public Transparency"]
)

def query_records(
    db: Session,
    category: Optional[str] = None,
    search: Optional[str] = None,
    fiscal_year: Optional[str] = None,
    ward: Optional[int] = None
) -> List[OpenDataRecord]:
    query = db.query(OpenDataRecord).filter(OpenDataRecord.deleted_at == None)
    
    if category and category != "all":
        query = query.filter(OpenDataRecord.category == category)
        
    if fiscal_year and fiscal_year != "all":
        query = query.filter(OpenDataRecord.fiscal_year == fiscal_year)
        
    if ward is not None and ward != 0:
        query = query.filter(or_(OpenDataRecord.ward_number == ward, OpenDataRecord.ward_number == 0))
        
    if search and search.strip():
        term = f"%{search.strip().lower()}%"
        query = query.filter(
            or_(
                func.lower(OpenDataRecord.title).like(term),
                func.lower(OpenDataRecord.sub_category).like(term),
                func.lower(OpenDataRecord.description).like(term),
                func.lower(OpenDataRecord.tag_badge).like(term),
                func.lower(OpenDataRecord.author_or_department).like(term)
            )
        )
        
    return query.order_by(OpenDataRecord.created_at.desc()).all()


# ── 1. Statistics & Overview ──────────────────────────────────────────
@router.get("/stats", response_model=OpenDataStats)
def get_stats(db: Session = Depends(get_db)):
    records = db.query(OpenDataRecord).filter(OpenDataRecord.deleted_at == None).all()
    
    datasets = [r for r in records if r.category == "datasets"]
    reports = [r for r in records if r.category == "reports"]
    strategic = [r for r in records if r.category == "strategic"]
    practices = [r for r in records if r.category == "practices"]
    
    total_records_indexed = sum(r.records_count or 0 for r in datasets)
    total_downloads = sum(r.download_count or 0 for r in records)
    active_indicators = db.query(MunicipalIndicator).count()
    pending_requests = db.query(CitizenDataRequest).filter(CitizenDataRequest.status == "दर्ता भएको").count()
    
    return OpenDataStats(
        totalDatasets=len(datasets),
        totalReports=len(reports),
        strategicPillars=len(strategic),
        goodPractices=len(practices),
        totalRecordsIndexed=total_records_indexed,
        totalDownloads=total_downloads,
        transparencyScore=88.5,
        activeIndicatorsCount=active_indicators,
        pendingRequestsCount=pending_requests
    )


# ── 2. Open Data Catalog Queries ───────────────────────────────────────
@router.get("", response_model=List[OpenDataSchema])
def get_all(
    category: Optional[str] = Query(None, description="'datasets' | 'reports' | 'strategic' | 'practices'"),
    search: Optional[str] = Query(None),
    fiscalYear: Optional[str] = Query(None),
    ward: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    return query_records(db, category=category, search=search, fiscal_year=fiscalYear, ward=ward)

@router.get("/datasets", response_model=List[OpenDataSchema])
def get_datasets(
    search: Optional[str] = Query(None),
    fiscalYear: Optional[str] = Query(None),
    ward: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    return query_records(db, category="datasets", search=search, fiscal_year=fiscalYear, ward=ward)

@router.get("/reports", response_model=List[OpenDataSchema])
def get_reports(
    search: Optional[str] = Query(None),
    fiscalYear: Optional[str] = Query(None),
    ward: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    return query_records(db, category="reports", search=search, fiscal_year=fiscalYear, ward=ward)

@router.get("/strategic", response_model=List[OpenDataSchema])
def get_strategic(
    search: Optional[str] = Query(None),
    fiscalYear: Optional[str] = Query(None),
    ward: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    return query_records(db, category="strategic", search=search, fiscal_year=fiscalYear, ward=ward)

@router.get("/practices", response_model=List[OpenDataSchema])
def get_practices(
    search: Optional[str] = Query(None),
    fiscalYear: Optional[str] = Query(None),
    ward: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    return query_records(db, category="practices", search=search, fiscal_year=fiscalYear, ward=ward)


# ── 3. Single Dataset & CRUD ──────────────────────────────────────────
@router.get("/records/{id}", response_model=OpenDataSchema)
def get_record(id: str, db: Session = Depends(get_db)):
    record = db.query(OpenDataRecord).filter(OpenDataRecord.id == id, OpenDataRecord.deleted_at == None).first()
    if not record:
        raise HTTPException(status_code=404, detail="Open data record not found")
    return record

@router.post("", response_model=OpenDataSchema)
def create_record(data: OpenDataCreate, db: Session = Depends(get_db)):
    db_record = OpenDataRecord(
        id=str(uuid.uuid4()),
        **data.dict()
    )
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return db_record

@router.put("/{id}", response_model=OpenDataSchema)
def update_record(id: str, data: OpenDataUpdate, db: Session = Depends(get_db)):
    record = db.query(OpenDataRecord).filter(OpenDataRecord.id == id, OpenDataRecord.deleted_at == None).first()
    if not record:
        raise HTTPException(status_code=404, detail="Open data record not found")
        
    update_data = data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(record, key, value)
        
    db.commit()
    db.refresh(record)
    return record

@router.delete("/{id}")
def delete_record(id: str, db: Session = Depends(get_db)):
    record = db.query(OpenDataRecord).filter(OpenDataRecord.id == id, OpenDataRecord.deleted_at == None).first()
    if not record:
        raise HTTPException(status_code=404, detail="Open data record not found")
        
    record.deleted_at = datetime.utcnow()
    db.commit()
    return {"success": True, "message": "Record deleted successfully"}

@router.post("/{id}/download")
def increment_download(id: str, db: Session = Depends(get_db)):
    record = db.query(OpenDataRecord).filter(OpenDataRecord.id == id, OpenDataRecord.deleted_at == None).first()
    if not record:
        raise HTTPException(status_code=404, detail="Open data record not found")
        
    record.download_count = (record.download_count or 0) + 1
    db.commit()
    return {"success": True, "downloadCount": record.download_count}


# ── 4. Direct Dataset Export (CSV / JSON) ──────────────────────────────
@router.get("/{id}/export")
def export_dataset(id: str, format: str = Query("json", description="'json' | 'csv'"), db: Session = Depends(get_db)):
    record = db.query(OpenDataRecord).filter(OpenDataRecord.id == id, OpenDataRecord.deleted_at == None).first()
    if not record:
        raise HTTPException(status_code=404, detail="Dataset not found")
        
    # Increment download
    record.download_count = (record.download_count or 0) + 1
    db.commit()

    sample = record.sample_data or []
    
    if format.lower() == "csv":
        output = io.StringIO()
        if sample and isinstance(sample, list) and len(sample) > 0 and isinstance(sample[0], dict):
            fieldnames = sample[0].keys()
            writer = csv.DictWriter(output, fieldnames=fieldnames)
            writer.writeheader()
            for row in sample:
                writer.writerow(row)
        else:
            # Fallback single row
            writer = csv.writer(output)
            writer.writerow(["id", "title", "category", "fiscal_year", "records_count", "author_department"])
            writer.writerow([record.id, record.title, record.category, record.fiscal_year, record.records_count, record.author_or_department])
            
        csv_content = output.getvalue()
        filename = f"{record.title.replace(' ', '_')[:30]}_{record.fiscal_year.replace('/', '-')}.csv"
        return Response(
            content=csv_content,
            media_type="text/csv",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'}
        )
    else:
        export_payload = {
            "metadata": {
                "id": record.id,
                "title": record.title,
                "category": record.category,
                "sub_category": record.sub_category,
                "fiscal_year": record.fiscal_year,
                "ward_number": record.ward_number,
                "author_or_department": record.author_or_department,
                "records_count": record.records_count,
                "license": record.license or "CC-BY-SA 4.0",
                "exported_at": datetime.utcnow().isoformat(),
                "palika": "पाँचपोखरी थाङपाल गाउँपालिका (Panchpokhari Thangpal Rural Municipality)"
            },
            "columns": record.columns_schema or [],
            "records": sample
        }
        return export_payload


@router.post("/bulk", response_model=List[OpenDataSchema])
def bulk_create(records: List[OpenDataCreate], db: Session = Depends(get_db)):
    created = []
    for r in records:
        db_record = OpenDataRecord(
            id=str(uuid.uuid4()),
            **r.dict()
        )
        db.add(db_record)
        created.append(db_record)
        
    db.commit()
    for rec in created:
        db.refresh(rec)
    return created


# ── 5. Municipal Indicators (पालिका सूचकहरू & SDGs) ─────────────────────
@router.get("/indicators/all", response_model=List[MunicipalIndicatorSchema])
def get_indicators(category: Optional[str] = None, sdg_goal: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(MunicipalIndicator)
    if category and category != "all":
        query = query.filter(MunicipalIndicator.category == category)
    if sdg_goal and sdg_goal != "all":
        query = query.filter(MunicipalIndicator.sdg_goal.contains(sdg_goal))
    return query.order_by(MunicipalIndicator.indicator_code.asc()).all()

@router.post("/indicators", response_model=MunicipalIndicatorSchema)
def create_indicator(data: MunicipalIndicatorCreate, db: Session = Depends(get_db)):
    existing = db.query(MunicipalIndicator).filter(MunicipalIndicator.indicator_code == data.indicator_code).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Indicator code '{data.indicator_code}' already exists")
    db_indicator = MunicipalIndicator(
        id=str(uuid.uuid4()),
        **data.dict()
    )
    db.add(db_indicator)
    db.commit()
    db.refresh(db_indicator)
    return db_indicator

@router.put("/indicators/{id}", response_model=MunicipalIndicatorSchema)
def update_indicator(id: str, data: MunicipalIndicatorUpdate, db: Session = Depends(get_db)):
    indicator = db.query(MunicipalIndicator).filter(MunicipalIndicator.id == id).first()
    if not indicator:
        raise HTTPException(status_code=404, detail="Municipal indicator not found")
    update_data = data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(indicator, key, value)
    db.commit()
    db.refresh(indicator)
    return indicator

@router.delete("/indicators/{id}")
def delete_indicator(id: str, db: Session = Depends(get_db)):
    indicator = db.query(MunicipalIndicator).filter(MunicipalIndicator.id == id).first()
    if not indicator:
        raise HTTPException(status_code=404, detail="Municipal indicator not found")
    db.delete(indicator)
    db.commit()
    return {"success": True, "message": "Indicator deleted successfully"}


# ── 6. Public Transparency & Citizen Dashboard Overview ────────────────
@router.get("/transparency/overview")
def get_transparency_overview(db: Session = Depends(get_db)):
    return {
        "palika_name": "पाँचपोखरी थाङपाल गाउँपालिका (Panchpokhari Thangpal Rural Municipality)",
        "district": "सिन्धुपाल्चोक, बागमती प्रदेश",
        "transparency_score": 88.5,
        "fiscal_year": "२०८१/०८२",
        "pillars": {
            "proactive_rti_disclosure": {
                "status": "सम्पन्न (Quarterly Disclosed)",
                "sections_covered": "२० प्रकारका अनिवार्य सार्वजनिक सूचनाहरू",
                "last_published": "२०८१-०४-१५",
                "officer": "सन्तोष लम्साल (सूचना अधिकारी, मो: ९८५१२४००००)"
            },
            "public_hearing_audit": {
                "total_hearings": 3,
                "latest_hearing_date": "२०८१-०२-१२ (वडा नं. ३ भोताङ)",
                "social_audit_completed": "सम्पन्न (८ वटै वडा)",
                "citizen_participants": 1420
            },
            "citizen_charter": {
                "total_services": 45,
                "average_delivery_time": "२.५ घण्टा (डिजिटल सिफारिस)",
                "on_time_fulfillment_pct": 94.2
            },
            "financial_transparency": {
                "budget_publication_status": "सार्वजनिक गरिएको",
                "beruju_clearance_pct": 88.5,
                "procurement_e_bidding_pct": 100.0
            }
        },
        "digital_standards": {
            "open_data_license": "Creative Commons Attribution-ShareAlike 4.0 International (CC-BY-SA 4.0)",
            "api_access": "सार्वजनिक खुला REST API",
            "api_catalog_url": "/api/v1/open-data"
        }
    }


# ── 7. Citizen Data Requests (RTI / Civic Research Inquiries) ─────────
@router.get("/requests", response_model=List[CitizenDataRequestSchema])
def get_data_requests(status: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(CitizenDataRequest)
    if status and status != "all":
        query = query.filter(CitizenDataRequest.status == status)
    return query.order_by(CitizenDataRequest.created_at.desc()).all()

@router.post("/requests", response_model=CitizenDataRequestSchema)
def submit_data_request(data: CitizenDataRequestCreate, db: Session = Depends(get_db)):
    db_req = CitizenDataRequest(
        id=str(uuid.uuid4()),
        **data.dict()
    )
    db.add(db_req)
    db.commit()
    db.refresh(db_req)
    return db_req

@router.put("/requests/{id}/status", response_model=CitizenDataRequestSchema)
def update_data_request_status(id: str, data: CitizenDataRequestUpdate, db: Session = Depends(get_db)):
    req = db.query(CitizenDataRequest).filter(CitizenDataRequest.id == id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    update_data = data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(req, key, value)
    db.commit()
    db.refresh(req)
    return req


# ── 8. Open Data Publications (dash_open_data_publications) ───────────
@router.get("/publications/list")
def list_publications(db: Session = Depends(get_db)):
    publications = db.query(OpenDataPublication).order_by(OpenDataPublication.created_at.desc()).all()
    return publications

@router.post("/publications/toggle/{id}")
def toggle_publication(id: str, db: Session = Depends(get_db)):
    pub = db.query(OpenDataPublication).filter(OpenDataPublication.id == id).first()
    if not pub:
        raise HTTPException(status_code=404, detail="Publication record not found")
    pub.is_published = not pub.is_published
    db.commit()
    db.refresh(pub)
    return {"success": True, "id": pub.id, "is_published": pub.is_published}
