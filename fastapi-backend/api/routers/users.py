from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List, Optional
from core.database import get_db
from core.security import hash_password
from models.user import User, Role, UserRole
from schemas.user import (
    UserCreate, UserUpdate, UserPublicSchema, RolePermissionsUpdate
)
from api.routers.auth import get_current_user, require_roles
import uuid

router = APIRouter(
    prefix="/api/v1/users",
    tags=["Users (प्रयोगकर्ता व्यवस्थापन)"]
)

ADMIN_ROLES = (UserRole.SUPER_ADMIN, UserRole.IT_ADMIN, UserRole.CAO, UserRole.ADMIN)

ROLE_PERMISSIONS = {
    UserRole.SUPER_ADMIN: ['f_dashboard', 'f_progress', 'f_ai', 'f_gis', 'f_master', 'f_portal', 'f_sifarish', 'f_charter', 'f_vital', 'f_business', 'f_grievance', 'f_planning', 'f_revenue', 'f_disaster', 'f_library', 'f_museum', 'f_darta', 'f_education', 'f_health', 'f_agriculture', 'f_tourism'],
    UserRole.ADMIN: ['f_dashboard', 'f_progress', 'f_ai', 'f_gis', 'f_master', 'f_portal', 'f_sifarish', 'f_charter', 'f_vital', 'f_business', 'f_grievance', 'f_planning', 'f_revenue', 'f_disaster', 'f_library', 'f_museum', 'f_darta', 'f_education', 'f_health', 'f_agriculture', 'f_tourism'],
    UserRole.CAO: ['f_dashboard', 'f_progress', 'f_ai', 'f_gis', 'f_master', 'f_portal', 'f_sifarish', 'f_charter', 'f_vital', 'f_business', 'f_grievance', 'f_planning', 'f_revenue', 'f_disaster', 'f_library', 'f_museum', 'f_darta', 'f_education', 'f_health', 'f_agriculture', 'f_tourism'],
    UserRole.IT_ADMIN: ['f_dashboard', 'f_progress', 'f_gis'],
    UserRole.PLANNING_OFFICER: ['f_dashboard', 'f_progress', 'f_gis', 'f_planning', 'f_charter'],
    UserRole.REVENUE_OFFICER: ['f_dashboard', 'f_revenue', 'f_business', 'f_charter'],
    UserRole.EDUCATION_OFFICER: ['f_dashboard', 'f_education'],
    UserRole.HEALTH_OFFICER: ['f_dashboard', 'f_health'],
    UserRole.AGRICULTURE_OFFICER: ['f_dashboard', 'f_agriculture'],
    UserRole.TOURISM_OFFICER: ['f_dashboard', 'f_tourism'],
    UserRole.DISASTER_OFFICER: ['f_dashboard', 'f_disaster'],
    UserRole.WARD_USER: ['f_dashboard', 'f_master', 'f_sifarish', 'f_vital', 'f_business', 'f_grievance', 'f_charter', 'f_darta', 'f_education', 'f_health', 'f_agriculture'],
    UserRole.DATA_ENTRY: ['f_dashboard', 'f_master'],
}


def seed_roles_if_empty(db: Session):
    count = db.query(Role).count()
    if count == 0:
        for role_val in UserRole:
            perms = ROLE_PERMISSIONS.get(role_val, ['f_dashboard'])
            role = Role(
                id=str(uuid.uuid4()),
                name=role_val.value,
                description=f"{role_val.value} role",
                permissions=perms,
            )
            db.add(role)
        db.commit()


# ─── User management endpoints ────────────────────────────────────────────────

@router.get("", response_model=List[UserPublicSchema])
def find_all(
    current_user: User = Depends(require_roles(*ADMIN_ROLES)),
    db: Session = Depends(get_db)
):
    """सबै प्रयोगकर्ताहरूको सूची (एडमिन मात्र)"""
    return db.query(User).filter(User.deleted_at == None).order_by(User.created_at.desc()).all()


@router.get("/stats")
def get_stats(
    current_user: User = Depends(require_roles(UserRole.SUPER_ADMIN, UserRole.IT_ADMIN)),
    db: Session = Depends(get_db)
):
    """प्रयोगकर्ता तथ्याङ्क: कुल, सक्रिय, भूमिका अनुसार"""
    total = db.query(User).filter(User.deleted_at == None).count()
    active = db.query(User).filter(User.deleted_at == None, User.is_active == True).count()
    by_role = (
        db.query(User.role, db.query(User).filter(User.deleted_at == None, User.role == User.role).count())
        .filter(User.deleted_at == None)
        .group_by(User.role)
        .all()
    )
    # Simple approach: count per role
    from sqlalchemy import func
    role_counts = (
        db.query(User.role, func.count(User.id).label("count"))
        .filter(User.deleted_at == None)
        .group_by(User.role)
        .all()
    )
    return {
        "total": total,
        "active": active,
        "byRole": [{"role": r, "count": c} for r, c in role_counts]
    }


@router.get("/roles")
def get_roles(
    current_user: User = Depends(require_roles(*ADMIN_ROLES)),
    db: Session = Depends(get_db)
):
    """सबै भूमिका र अनुमतिहरू प्राप्त गर्नुहोस्"""
    seed_roles_if_empty(db)
    return db.query(Role).order_by(Role.name).all()


@router.put("/roles/{name}")
def update_role_permissions(
    name: str,
    body: RolePermissionsUpdate,
    current_user: User = Depends(require_roles(*ADMIN_ROLES)),
    db: Session = Depends(get_db)
):
    """भूमिकाको अनुमति सूची अद्यावधिक गर्नुहोस्"""
    seed_roles_if_empty(db)
    role = db.query(Role).filter(Role.name == name).first()
    if not role:
        role = Role(id=str(uuid.uuid4()), name=name, permissions=body.permissions)
        db.add(role)
    else:
        role.permissions = body.permissions
        db.add(role)
    db.commit()
    db.refresh(role)
    return role


@router.get("/{id}", response_model=UserPublicSchema)
def find_one(
    id: str,
    current_user: User = Depends(require_roles(UserRole.SUPER_ADMIN, UserRole.IT_ADMIN, UserRole.CAO)),
    db: Session = Depends(get_db)
):
    """ID अनुसार प्रयोगकर्ता प्राप्त गर्नुहोस्"""
    user = db.query(User).filter(User.id == id, User.deleted_at == None).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.post("", response_model=UserPublicSchema, status_code=201)
def create_user(
    body: UserCreate,
    current_user: User = Depends(require_roles(*ADMIN_ROLES)),
    db: Session = Depends(get_db)
):
    """नयाँ प्रयोगकर्ता सिर्जना गर्नुहोस् (एडमिन मात्र)"""
    existing = db.query(User).filter(User.email == body.email, User.deleted_at == None).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    is_active = body.is_active
    if body.role and (hasattr(body.role, 'value') and body.role.value.startswith("public_") or str(body.role).startswith("public_")):
        is_active = False

    user = User(
        id=str(uuid.uuid4()),
        email=body.email,
        password=hash_password(body.password),
        full_name=body.full_name,
        phone=body.phone,
        role=body.role.value if hasattr(body.role, 'value') else (body.role if body.role else UserRole.PUBLIC.value),
        ward_number=body.ward_number,
        tenant_id=body.tenant_id,
        is_active=is_active if is_active is not None else True,
        email_verified=body.email_verified or False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.put("/{id}", response_model=UserPublicSchema)
def update_user(
    id: str,
    body: UserUpdate,
    current_user: User = Depends(require_roles(*ADMIN_ROLES)),
    db: Session = Depends(get_db)
):
    """प्रयोगकर्ता अद्यावधिक गर्नुहोस्"""
    user = db.query(User).filter(User.id == id, User.deleted_at == None).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    update_data = body.model_dump(exclude_unset=True)
    if "password" in update_data and update_data["password"]:
        update_data["password"] = hash_password(update_data["password"])
    else:
        update_data.pop("password", None)

    if "role" in update_data and update_data["role"]:
        update_data["role"] = update_data["role"].value if hasattr(update_data["role"], "value") else update_data["role"]

    if "full_name" in update_data:
        user.full_name = update_data.pop("full_name")
    if "is_active" in update_data:
        user.is_active = update_data.pop("is_active")
    if "ward_number" in update_data:
        user.ward_number = update_data.pop("ward_number")
    if "tenant_id" in update_data:
        user.tenant_id = update_data.pop("tenant_id")

    for field, value in update_data.items():
        if hasattr(user, field):
            setattr(user, field, value)

    db.commit()
    db.refresh(user)
    return user


@router.patch("/{id}/toggle-active")
def toggle_active(
    id: str,
    current_user: User = Depends(require_roles(*ADMIN_ROLES)),
    db: Session = Depends(get_db)
):
    """प्रयोगकर्ता सक्रिय/निष्क्रिय टगल गर्नुहोस्"""
    user = db.query(User).filter(User.id == id, User.deleted_at == None).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = not user.is_active
    db.commit()
    db.refresh(user)
    return {
        "id": user.id,
        "email": user.email,
        "isActive": user.is_active,
        "is_active": user.is_active,
        "fullName": user.full_name,
        "full_name": user.full_name
    }


@router.delete("/{id}")
def delete_user(
    id: str,
    current_user: User = Depends(require_roles(*ADMIN_ROLES)),
    db: Session = Depends(get_db)
):
    """प्रयोगकर्ता सफ्ट-डिलिट गर्नुहोस्"""
    user = db.query(User).filter(User.id == id, User.deleted_at == None).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    from datetime import datetime
    user.deleted_at = datetime.utcnow()
    db.commit()
    return {"message": "User deleted successfully"}
