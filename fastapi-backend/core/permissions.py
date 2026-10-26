from fastapi import Depends, HTTPException, status
from models.user import User, UserRole
from models.tenant import Tenant
from core.tenant import get_current_tenant
from api.routers.auth import get_current_user

def require_tenant_access(
    current_user: User = Depends(get_current_user),
    current_tenant: Tenant = Depends(get_current_tenant)
) -> User:
    """
    Dependency that ensures the authenticated user has access to the requested Tenant.
    - SUPER_ADMIN has access to all tenants.
    - Local admins and ward users only have access to their assigned tenant.
    """
    
    # 1. Super Admin can access any tenant's data
    if current_user.role == UserRole.SUPER_ADMIN:
        return current_user
        
    # 2. For local users, check if their tenant_id matches the requested tenant
    if current_user.tenant_id not in (str(current_tenant.id), current_tenant.subdomain):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access data for this municipality."
        )
        
    return current_user

def require_ward_access(ward_number: int):
    """
    Dependency generator to check if the user is authorized for a specific ward.
    """
    def checker(current_user: User = Depends(require_tenant_access)):
        if current_user.role in [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.CAO]:
            return current_user
            
        if current_user.ward_number != ward_number:
             raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"You only have permission to access Ward {current_user.ward_number}."
            )
        return current_user
    return checker
