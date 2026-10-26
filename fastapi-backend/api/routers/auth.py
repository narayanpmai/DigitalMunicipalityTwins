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
    """Email र password प्रयोग गरी लगइन गर्नुहोस् (Multi-tenant safe & isolated)"""
    email = body.email.strip().lower()
    raw_subdomain = (body.tenant_subdomain or "").strip().lower()

    # Normalize "all", "central", empty to None
    tenant_subdomain = raw_subdomain if raw_subdomain not in ("all", "default", "central", "") else None

    # Normalize gov.np emails → @p5digital.local
    lookup_email = email
    import re
    if re.match(r".*@[a-z0-9]+\.gov\.np$", email):
        lookup_email = re.sub(r"@[^@]+$", "@p5digital.local", email)

    # 1. Resolve targeted tenant if specified
    tenant_obj: Optional[Tenant] = None
    if tenant_subdomain:
        tenant_obj = db.query(Tenant).filter(
            (Tenant.subdomain == tenant_subdomain) | (Tenant.id == tenant_subdomain)
        ).first()
        if not tenant_obj:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="तोकिएको पालिका प्रणालीमा फेला परेन। कृपया मान्य पालिका छान्नुहोस्।"
            )

    # 2. Look up user by email
    user: Optional[User] = db.query(User).filter(
        User.email == lookup_email,
        User.deleted_at == None
    ).first()
    if not user and lookup_email != email:
        user = db.query(User).filter(
            User.email == email,
            User.deleted_at == None
        ).first()

    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="गलत इमेल वा पासवर्ड।")

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="तपाईंको खाता प्रमाणीकरणको क्रममा छ। कृपया पालिकाबाट अनुमोदनको प्रतीक्षा गर्नुहोस्।"
        )

    if not verify_password(body.password, user.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="गलत इमेल वा पासवर्ड।")

    # 3. Multi-tenant isolation check
    user_tenant = (user.tenant_id or "").strip()
    is_super_admin = user.role in ("super_admin", "it_admin") or user_tenant in ("all", "*")

    # Find home tenant record for user (if municipal user)
    user_home_tenant: Optional[Tenant] = None
    if user_tenant and not is_super_admin:
        user_home_tenant = db.query(Tenant).filter(
            (Tenant.id == user_tenant) | (Tenant.subdomain == user_tenant)
        ).first()

    user_tenant_subdomain = "all" if is_super_admin else (
        user_home_tenant.subdomain if user_home_tenant else (user_tenant or None)
    )

    # If user selected a specific tenant, ensure their account belongs to this tenant!
    if tenant_obj and not is_super_admin:
        target_uuid = str(tenant_obj.id)
        target_subdomain = str(tenant_obj.subdomain).lower()

        matches = (
            not user_tenant or
            user_tenant.lower() == target_subdomain or
            user_tenant == target_uuid or
            (user_home_tenant and (user_home_tenant.id == tenant_obj.id or user_home_tenant.subdomain.lower() == target_subdomain))
        )
        if not matches:
            palika_name = tenant_obj.name_np or target_subdomain
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"तपाईंको खाता यस पालिका ({palika_name}) मा दर्ता गरिएको छैन। कृपया आफ्नो सम्बन्धित पालिका छान्नुहोस्।"
            )

    # Update last login
    from datetime import datetime
    user.last_login_at = datetime.utcnow()
    client_ip = request.client.host if request.client else ""
    user.last_login_ip = client_ip
    db.add(user)

    # Effective tenant subdomain for response
    resp_tenant_subdomain = tenant_obj.subdomain if tenant_obj else (user_tenant_subdomain or "all")
    effective_tenant_id = user_home_tenant.id if user_home_tenant else (user.tenant_id or "all")

    # Generate tokens
    payload = {
        "sub": str(user.id), "email": user.email,
        "role": user.role, "wardNumber": user.ward_number,
        "tenantId": effective_tenant_id,
        "tenantSubdomain": resp_tenant_subdomain
    }
    access_token = create_access_token(payload)
    refresh_token = create_refresh_token(payload)
    import hashlib
    hashed_refresh = hashlib.sha256(refresh_token.encode()).hexdigest()
    user.refresh_token = hashed_refresh
    db.commit()

    return {
        "accessToken": access_token,
        "access_token": access_token,
        "refreshToken": refresh_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "tenantSubdomain": resp_tenant_subdomain,
        "user": {
            "id": user.id,
            "email": user.email,
            "fullName": user.full_name,
            "role": user.role,
            "wardNumber": user.ward_number,
            "tenantId": effective_tenant_id,
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
