from fastapi import Request, Depends, HTTPException, Header, Query, status
from sqlalchemy.orm import Session
from typing import Optional, List, Any
from core.database import get_db
from models.tenant import Tenant
from models.user import User


class TenantContext:
    def __init__(
        self,
        tenant: Optional[Tenant] = None,
        tenant_id: Optional[str] = None,
        tenant_subdomain: Optional[str] = None,
        is_all: bool = False,
        current_user: Optional[User] = None
    ):
        self.tenant = tenant
        self.tenant_id = tenant_id or (str(tenant.id) if tenant else "all")
        self.tenant_subdomain = tenant_subdomain or (tenant.subdomain if tenant else "all")
        self.is_all = is_all
        self.current_user = current_user
        self.effective_tenant_id = str(tenant.id) if tenant else (self.tenant_id if self.tenant_id not in ("all", "*") else "f07c2bcc-81ad-4e27-aeff-1a65f04e9f06")
        
        # Allowed identifiers for SQL queries
        raw_ids: List[str] = []
        if not self.is_all:
            if tenant:
                raw_ids.extend([str(tenant.id), str(tenant.subdomain).lower()])
            if tenant_id and tenant_id not in ("all", "*"):
                raw_ids.append(str(tenant_id))
            if tenant_subdomain and tenant_subdomain not in ("all", "*"):
                raw_ids.append(str(tenant_subdomain).lower())

            # Aliases for known palikas
            if any(k in raw_ids for k in ("gaushala", "gaushalamun", "7c9f1805-7907-4955-a138-813b9aa61499")):
                raw_ids.extend(["gaushala", "gaushalamun", "gaushala_municipality", "7c9f1805-7907-4955-a138-813b9aa61499"])
            if any(k in raw_ids for k in ("benighatrorang", "benighat", "050b8da4-61d2-49d0-b788-0729be064b26")):
                raw_ids.extend(["benighatrorang", "benighat", "benighat_rorang", "050b8da4-61d2-49d0-b788-0729be064b26"])
            if any(k in raw_ids for k in ("khadadevi", "khandadevi", "94bf02d3-9c23-4d84-a346-6461f414bcda")):
                raw_ids.extend(["khadadevi", "khandadevi", "94bf02d3-9c23-4d84-a346-6461f414bcda"])
            if any(k in raw_ids for k in ("galchhi", "0cea29fe-1247-4ce3-840d-3a3d3d0323d6")):
                raw_ids.extend(["galchhi", "0cea29fe-1247-4ce3-840d-3a3d3d0323d6"])
            if any(k in raw_ids for k in ("helambu", "a18b3cde-92be-5f38-bf00-2b76f15fa017")):
                raw_ids.extend(["helambu", "a18b3cde-92be-5f38-bf00-2b76f15fa017"])
            if any(k in raw_ids for k in ("melamchi", "e4a22081-43e7-40ae-b081-dec13630100d", "c7a7e816-96bd-4f13-82c9-1ac60a9de34d")):
                raw_ids.extend(["melamchi", "melamchimunicipality", "e4a22081-43e7-40ae-b081-dec13630100d", "c7a7e816-96bd-4f13-82c9-1ac60a9de34d"])
            if any(k in raw_ids for k in ("panchpokhari", "f07c2bcc-81ad-4e27-aeff-1a65f04e9f06")):
                raw_ids.extend(["panchpokhari", "f07c2bcc-81ad-4e27-aeff-1a65f04e9f06"])

        # Deduplicate
        seen = set()
        self.allowed_tenant_ids = [x for x in raw_ids if not (x in seen or seen.add(x))]

    def filter_query(self, query: Any, model_or_column: Any) -> Any:
        """Applies tenant filter to a SQLAlchemy query"""
        if self.is_all:
            return query
        col = getattr(model_or_column, 'tenant_id', model_or_column)
        return query.filter(col.in_(self.allowed_tenant_ids))


def get_tenant_context(
    request: Request,
    tenant_id: Optional[str] = Query(None),
    x_tenant_id: Optional[str] = Header(None, alias="X-Tenant-Id"),
    db: Session = Depends(get_db)
) -> TenantContext:
    # 1. Check if user is authenticated via Bearer token
    from api.routers.auth import _get_token_payload
    payload = _get_token_payload(request)
    current_user: Optional[User] = None
    if payload and payload.get("sub"):
        current_user = db.query(User).filter(User.id == payload.get("sub"), User.deleted_at == None).first()

    requested_tenant = (tenant_id or x_tenant_id or "").strip().lower()

    # 2. If user is authenticated
    if current_user:
        user_tenant = (current_user.tenant_id or "").strip()
        is_super_admin = current_user.role in ("super_admin", "it_admin") or user_tenant in ("all", "*")

        if is_super_admin:
            if not requested_tenant or requested_tenant in ("all", "*", "central", ""):
                return TenantContext(is_all=True, current_user=current_user)
            # Super admin requested a specific palika
            t = db.query(Tenant).filter(
                (Tenant.subdomain == requested_tenant) | (Tenant.id == requested_tenant)
            ).first()
            if t:
                return TenantContext(tenant=t, tenant_id=str(t.id), tenant_subdomain=t.subdomain, current_user=current_user)
            return TenantContext(tenant_id=requested_tenant, tenant_subdomain=requested_tenant, current_user=current_user)

        # Municipal user: strictly locked to their assigned palika!
        t = db.query(Tenant).filter(
            (Tenant.id == user_tenant) | (Tenant.subdomain == user_tenant)
        ).first()
        if t:
            return TenantContext(tenant=t, tenant_id=str(t.id), tenant_subdomain=t.subdomain, current_user=current_user)
        return TenantContext(tenant_id=user_tenant, tenant_subdomain=user_tenant, current_user=current_user)

    # 3. Unauthenticated request (e.g. public portal, GIS, badapatra)
    if not requested_tenant or requested_tenant in ("all", "*", "central", ""):
        # Default public tenant is panchpokhari or global
        t = db.query(Tenant).filter(Tenant.subdomain == "panchpokhari").first()
        if t:
            return TenantContext(tenant=t, tenant_id=str(t.id), tenant_subdomain=t.subdomain)
        return TenantContext(is_all=True)

    t = db.query(Tenant).filter(
        (Tenant.subdomain == requested_tenant) | (Tenant.id == requested_tenant)
    ).first()
    if t:
        return TenantContext(tenant=t, tenant_id=str(t.id), tenant_subdomain=t.subdomain)
    return TenantContext(tenant_id=requested_tenant, tenant_subdomain=requested_tenant)


def get_current_tenant(
    ctx: TenantContext = Depends(get_tenant_context),
    db: Session = Depends(get_db)
) -> Tenant:
    """Dependency that returns the current Tenant model instance"""
    if ctx.tenant:
        return ctx.tenant
    eff = ctx.effective_tenant_id or "panchpokhari"
    t = db.query(Tenant).filter((Tenant.id == eff) | (Tenant.subdomain == eff)).first()
    if not t:
        t = db.query(Tenant).filter(Tenant.subdomain == "panchpokhari").first()
    if not t:
        t = Tenant(
            id="f07c2bcc-81ad-4e27-aeff-1a65f04e9f06",
            subdomain="panchpokhari",
            name_np="पाँचपोखरी थाङपाल गाउँपालिका",
            name_en="Panchpokhari Thangpal Rural Municipality",
            status="active"
        )
    return t

