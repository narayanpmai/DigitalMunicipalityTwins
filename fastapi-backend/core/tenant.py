from fastapi import Request, Depends, HTTPException
from core.database import get_db
from sqlalchemy.orm import Session
from models.tenant import Tenant

def get_tenant_subdomain(request: Request) -> str:
    """
    Extracts the tenant subdomain from the Request object.
    Requires the TenantMiddleware to be added in main.py.
    """
    if not hasattr(request.state, "tenant"):
        return "default"
    return request.state.tenant

def get_current_tenant(
    subdomain: str = Depends(get_tenant_subdomain),
    db: Session = Depends(get_db)
) -> Tenant:
    """
    Dependency that returns the current Tenant object based on the subdomain.
    """
    # For local development without proper DNS
    if subdomain in ["localhost", "127", "default"]:
        # Fallback to a default tenant like 'panchpokhari' or return a mock tenant
        tenant = db.query(Tenant).filter(Tenant.subdomain == "panchpokhari").first()
        if not tenant:
            # If not found in DB, we could either raise an error or return None
            # Here we just raise an error for strict multi-tenancy
            raise HTTPException(status_code=404, detail="Tenant not found")
        return tenant

    tenant = db.query(Tenant).filter(Tenant.subdomain == subdomain).first()
    if not tenant:
        raise HTTPException(status_code=404, detail=f"Tenant '{subdomain}' not found or inactive")
    
    return tenant
