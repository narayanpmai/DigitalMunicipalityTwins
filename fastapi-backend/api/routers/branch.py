from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from core.database import get_db
from models.branch import Branch
from schemas.branch import BranchSchema, BranchCreate, BranchUpdate
from core.tenant import TenantContext, get_tenant_context
import uuid

router = APIRouter(
    prefix="/api/v1/branches",
    tags=["Branches"]
)

@router.get("", response_model=List[BranchSchema])
def get_branches(
    type: Optional[str] = Query(None, description="Filter by type: 'palika' | 'ward' | 'all'"), 
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context)
):
    query = ctx.filter_query(db.query(Branch), Branch)
    if type and type != "all":
        query = query.filter(Branch.type == type)
    return query.order_by(Branch.type.asc(), Branch.ward_number.asc(), Branch.name.asc()).all()

@router.get("/{id}", response_model=BranchSchema)
def get_branch(
    id: str, 
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context)
):
    query = ctx.filter_query(db.query(Branch), Branch)
    branch = query.filter(Branch.id == id).first()
    if not branch:
        raise HTTPException(status_code=404, detail="Branch not found")
    return branch

@router.post("", response_model=BranchSchema)
def create_branch(
    data: BranchCreate, 
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context)
):
    branch_dict = data.dict()
    eff_tenant = branch_dict.pop("tenant_id", None) or ctx.effective_tenant_id
    db_branch = Branch(
        id=str(uuid.uuid4()),
        tenant_id=eff_tenant,
        **branch_dict
    )
    db.add(db_branch)
    db.commit()
    db.refresh(db_branch)
    return db_branch

@router.put("/{id}", response_model=BranchSchema)
def update_branch(
    id: str, 
    data: BranchUpdate, 
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context)
):
    query = ctx.filter_query(db.query(Branch), Branch)
    db_branch = query.filter(Branch.id == id).first()
    if not db_branch:
        raise HTTPException(status_code=404, detail="Branch not found")
    
    update_data = data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_branch, key, value)
        
    db.commit()
    db.refresh(db_branch)
    return db_branch

@router.delete("/{id}")
def delete_branch(
    id: str, 
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context)
):
    query = ctx.filter_query(db.query(Branch), Branch)
    db_branch = query.filter(Branch.id == id).first()
    if not db_branch:
        raise HTTPException(status_code=404, detail="Branch not found")
    
    db.delete(db_branch)
    db.commit()
    return {"success": True, "message": "Branch deleted successfully"}

