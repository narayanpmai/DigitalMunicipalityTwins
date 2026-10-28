from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Header
from sqlalchemy.orm import Session
from typing import List, Optional
from core.database import get_db
from core.tenant import TenantContext, get_tenant_context
from models.representative import Representative
from schemas.representative import RepresentativeSchema, RepresentativeCreate, RepresentativeUpdate
import uuid, os, shutil

router = APIRouter(
    prefix="/api/v1/representatives",
    tags=["Representatives"]
)

UPLOAD_DIR = "/app/uploads/representatives"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("", response_model=List[RepresentativeSchema])
def get_representatives(
    ward_no: Optional[int] = Query(None, description="Filter by ward number"),
    is_current: Optional[bool] = Query(None, description="Filter by current term status"),
    tenant_id: Optional[str] = Query(None),
    x_tenant_id: Optional[str] = Header(None, alias="X-Tenant-Id"),
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context)
):
    query = ctx.filter_query(db.query(Representative), Representative)

    if ward_no is not None:
        query = query.filter(Representative.ward_no == ward_no)
    if is_current is not None:
        query = query.filter(Representative.is_current == is_current)
    from sqlalchemy import nulls_first
    return query.order_by(nulls_first(Representative.ward_no.asc()), Representative.designation.asc(), Representative.name.asc()).all()

@router.get("/{id}", response_model=RepresentativeSchema)
def get_representative(
    id: str,
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context)
):
    rep = ctx.filter_query(db.query(Representative), Representative).filter(Representative.id == id).first()
    if not rep:
        raise HTTPException(status_code=404, detail="Representative not found")
    return rep

@router.post("", response_model=RepresentativeSchema)
def create_representative(
    data: RepresentativeCreate,
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context)
):
    dump = data.model_dump(exclude_unset=True)
    if not dump.get("tenant_id"):
        dump["tenant_id"] = ctx.effective_tenant_id
    db_rep = Representative(
        id=str(uuid.uuid4()),
        **dump
    )
    db.add(db_rep)
    if db_rep.ward_no and "वडा अध्यक्ष" in (db_rep.designation or ""):
        try:
            from models.ward import Ward
            ward = ctx.filter_query(db.query(Ward), Ward).filter(Ward.ward_number == db_rep.ward_no).first()
            if ward:
                ward.ward_chair_name = db_rep.name
                ward.chairperson = db_rep.name
                if db_rep.phone:
                    ward.phone = db_rep.phone
                if db_rep.email:
                    ward.email = db_rep.email
        except Exception:
            pass
    db.commit()
    db.refresh(db_rep)
    return db_rep

@router.put("/{id}", response_model=RepresentativeSchema)
def update_representative(
    id: str,
    data: RepresentativeUpdate,
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context)
):
    rep = ctx.filter_query(db.query(Representative), Representative).filter(Representative.id == id).first()
    if not rep:
        raise HTTPException(status_code=404, detail="Representative not found")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(rep, key, value)

    # Sync to Ward table if representative is assigned to a ward (within same municipality)
    if rep.ward_no:
        try:
            from models.ward import Ward
            ward = ctx.filter_query(db.query(Ward), Ward).filter(Ward.ward_number == rep.ward_no).first()
            if ward:
                ward.ward_chair_name = rep.name
                ward.chairperson = rep.name
                if rep.phone:
                    ward.phone = rep.phone
                if rep.email:
                    ward.email = rep.email
        except Exception:
            pass

    db.commit()
    db.refresh(rep)
    return rep

@router.delete("/{id}")
def delete_representative(
    id: str,
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context)
):
    rep = ctx.filter_query(db.query(Representative), Representative).filter(Representative.id == id).first()
    if not rep:
        raise HTTPException(status_code=404, detail="Representative not found")

    db.delete(rep)
    db.commit()
    return {"success": True, "message": "Representative deleted successfully"}

@router.post("/{id}/upload-photo")
def upload_representative_photo(
    id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    rep = db.query(Representative).filter(Representative.id == id).first()
    if not rep:
        raise HTTPException(status_code=404, detail="Representative not found")

    allowed = {"image/jpeg", "image/png", "image/webp", "image/gif"}
    if file.content_type not in allowed:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, WebP or GIF images allowed")

    ext = file.filename.split(".")[-1]
    filename = f"{id}.{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)

    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    photo_url = f"/uploads/representatives/{filename}"
    rep.photo_url = photo_url
    db.commit()
    db.refresh(rep)
    return {"photoUrl": photo_url}
