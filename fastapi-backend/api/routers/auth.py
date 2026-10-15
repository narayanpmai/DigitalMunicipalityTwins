from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import Optional
from core.database import get_db
from core.security import (
    hash_password, verify_password,
    create_access_token, create_refresh_token,
    decode_refresh_token
)
from models.user import User, UserRole
from models.tenant import Tenant
from schemas.user import (
    LoginRequest, PublicRegisterRequest, RefreshTokenRequest,
    ChangePasswordRequest,
    UserCreate, UserUpdate, UserSchema, UserPublicSchema, RolePermissionsUpdate
)
import uuid

router = APIRouter(
    prefix="/api/v1/auth",
    tags=["Auth (प्रमाणीकरण)"]
)


# ─── Helper: get current user from bearer token ───────────────────────────────

def _get_token_payload(request: Request) -> Optional[dict]:
    from core.security import decode_access_token
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return None
    token = auth.removeprefix("Bearer ").strip()
    return decode_access_token(token)


def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    payload = _get_token_payload(request)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id, User.deleted_at == None).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="तपाईंको खाता प्रमाणीकरणको क्रममा छ। कृपया पालिकाबाट अनुमोदनको प्रतीक्षा गर्नुहोस्।"
        )
    return user


def require_roles(*roles: UserRole):
    def checker(current_user: User = Depends(get_current_user)):
        if current_user.role not in [r.value for r in roles]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"This action requires one of: {[r.value for r in roles]}"
            )
        return current_user
    return checker


# ─── Auth endpoints ───────────────────────────────────────────────────────────

@router.post("/login")
def login(body: LoginRequest, request: Request, db: Session = Depends(get_db)):
    """Email र password प्रयोग गरी लगइन गर्नुहोस् (Multi-tenant safe)"""
    email = body.email.strip().lower()
    tenant_subdomain = body.tenant_subdomain

    # Normalize gov.np emails → @p5digital.local
    lookup_email = email
    import re
    if re.match(r".*@[a-z0-9]+\.gov\.np$", email):
        lookup_email = re.sub(r"@[^@]+$", "@p5digital.local", email)

    # Resolve tenant UUID from subdomain
    resolved_tenant_id: Optional[str] = None
    if tenant_subdomain and tenant_subdomain not in ("all", ""):
        tenant = db.query(Tenant).filter(Tenant.subdomain == tenant_subdomain).first()
        if tenant:
            resolved_tenant_id = tenant.id

    user: Optional[User] = None

    # Tier 1: exact match (email + tenant_id)
    if resolved_tenant_id:
        user = db.query(User).filter(
            User.email == lookup_email,
            User.tenant_id == resolved_tenant_id,
            User.deleted_at == None
        ).first()
        if not user and lookup_email != email:
            user = db.query(User).filter(
                User.email == email,
                User.tenant_id == resolved_tenant_id,
                User.deleted_at == None
            ).first()

    # Tier 2: global user (NULL tenant)
    if not user:
        user = db.query(User).filter(User.email == lookup_email, User.deleted_at == None).first()
        if not user and lookup_email != email:
            user = db.query(User).filter(User.email == email, User.deleted_at == None).first()
        if user:
            user_tenant = user.tenant_id
            is_global = not user_tenant or user_tenant == "all"
            is_same_tenant = resolved_tenant_id and user_tenant == resolved_tenant_id
            is_subdomain_match = tenant_subdomain and user_tenant == tenant_subdomain
            no_tenant_selected = not resolved_tenant_id
            if not (is_global or is_same_tenant or is_subdomain_match or no_tenant_selected):
                user = None

    # Tier 3: legacy subdomain-as-tenant_id
    if not user and tenant_subdomain and tenant_subdomain != "all":
        user = db.query(User).filter(
            User.email == lookup_email,
            User.tenant_id == tenant_subdomain,
            User.deleted_at == None
        ).first()

    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="तपाईंको खाता प्रमाणीकरणको क्रममा छ। कृपया पालिकाबाट अनुमोदनको प्रतीक्षा गर्नुहोस्।"
        )

    if not verify_password(body.password, user.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    # Update last login
    from datetime import datetime
    user.last_login_at = datetime.utcnow()
    client_ip = request.client.host if request.client else ""
    user.last_login_ip = client_ip
    db.add(user)

    # Generate tokens
    payload = {
        "sub": str(user.id), "email": user.email,
        "role": user.role, "wardNumber": user.ward_number,
        "tenantId": str(user.tenant_id) if user.tenant_id else None
    }
    access_token = create_access_token(payload)
    refresh_token = create_refresh_token(payload)
    import hashlib
    hashed_refresh = hashlib.sha256(refresh_token.encode()).hexdigest()
    user.refresh_token = hashed_refresh
    db.commit()

    # Resolve tenant subdomain for response
    resp_tenant_subdomain = tenant_subdomain
    if not resp_tenant_subdomain and user.tenant_id and user.tenant_id != "all":
        tenant_obj = db.query(Tenant).filter(Tenant.id == user.tenant_id).first()
        if tenant_obj:
            resp_tenant_subdomain = tenant_obj.subdomain

    return {
        "accessToken": access_token,
        "refreshToken": refresh_token,
        "tenantSubdomain": resp_tenant_subdomain,
        "user": {
            "id": user.id,
            "email": user.email,
            "fullName": user.full_name,
            "role": user.role,
            "wardNumber": user.ward_number,
            "tenantId": user.tenant_id,
            "tenantSubdomain": resp_tenant_subdomain,
        }
    }


@router.post("/public/register", status_code=status.HTTP_201_CREATED)
def public_register(body: PublicRegisterRequest, db: Session = Depends(get_db)):
    """नागरिक, ठेकेदार वा इन्जिनियरका रूपमा नयाँ सार्वजनिक खाता दर्ता गर्नुहोस्"""
    existing = db.query(User).filter(User.email == body.email, User.deleted_at == None).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    is_active = not body.registration_type.value.startswith("public_")
    user = User(
        id=str(uuid.uuid4()),
        email=body.email,
        password=hash_password(body.password),
        full_name=body.full_name,
        phone=body.phone,
        role=body.registration_type.value,
        is_active=is_active,
    )
    db.add(user)
    db.commit()

    return {
        "message": "Registration successful" + (" — pending palika approval" if not is_active else ""),
        "user": {"id": user.id, "email": user.email, "fullName": user.full_name, "role": user.role}
    }


@router.post("/logout")
def logout(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Refresh token रद्द गर्नुहोस् (लगआउट)"""
    current_user.refresh_token = None
    db.add(current_user)
    db.commit()
    return {"message": "Logged out successfully"}


@router.get("/profile")
def get_profile(current_user: User = Depends(get_current_user)):
    """हालको प्रमाणित प्रयोगकर्ताको प्रोफाइल प्राप्त गर्नुहोस्"""
    return {
        "id": current_user.id,
        "email": current_user.email,
        "fullName": current_user.full_name,
        "role": current_user.role,
        "wardNumber": current_user.ward_number,
        "tenantId": current_user.tenant_id,
        "profilePhoto": current_user.profile_photo,
    }


@router.post("/change-password")
def change_password(
    body: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """हालको लगइन भएको प्रयोगकर्ताको पासवर्ड परिवर्तन गर्नुहोस्"""
    if not verify_password(body.old_password, current_user.password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="पुरानो पासवर्ड मिलेन। कृपया पुनः प्रयास गर्नुहोस्।")
    if len(body.new_password.strip()) < 6:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="नयाँ पासवर्ड कम्तीमा ६ अक्षरको हुनुपर्छ।")

    current_user.password = hash_password(body.new_password.strip())
    db.add(current_user)
    db.commit()
    return {"message": "पासवर्ड सफलतापूर्वक परिवर्तन गरियो।"}


@router.post("/refresh")
def refresh_token(body: RefreshTokenRequest, db: Session = Depends(get_db)):
    """Refresh token प्रयोग गरी नयाँ access token लिनुहोस्"""
    user = db.query(User).filter(User.id == body.user_id, User.deleted_at == None).first()
    if not user or not user.refresh_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    import hashlib
    if not user.refresh_token == hashlib.sha256(body.refresh_token.encode()).hexdigest():
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    payload = {
        "sub": str(user.id), "email": user.email,
        "role": user.role, "wardNumber": user.ward_number,
        "tenantId": str(user.tenant_id) if user.tenant_id else None
    }
    new_access_token = create_access_token(payload)
    return {"accessToken": new_access_token}
