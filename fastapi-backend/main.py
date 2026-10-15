from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from core.db_init import init_and_sync_db

# Ensure all database tables and columns are created and synchronized
init_and_sync_db()


from api.routers import demographics, gis, health, agriculture, education, business, vital_registration, revenue, complaint, citizen_services, infrastructure, budget, project, employee_task, procurement, darta_chalani, employee, ward, tourism, organization, document, report, fiscal_year, waste_management, judicial, livestock, asset, disaster, contract, building_permit, audit, planning, social_security, social_inclusion, senior_citizen, women_children, disability, dalit, employment, recruitment, heritage, rti, branch, citizen, representative, badapatra, notification, open_data, visitor, library, camera, sensor, media, tenant, setting, municipality, auth, users, dashboard, analytics, it_branch, cooperative, citizen_360, calendar, weather
from api.routers.engineer_payment import engineer_router, payment_router
from api.routers.odk_service_router import odk_router, service_router_api
from api.routers.extra_stubs import extra_router

app = FastAPI(
    title="Municipal Digital Twins API",
    description="FastAPI Backend for Integrated Survey Engine",
    version="1.0.0"
)

# Multi-Tenant Subdomain Extractor Middleware
@app.middleware("http")
async def tenant_middleware(request: Request, call_next):
    # 1. Try to get tenant from explicit header (best for frontend/backend separated domains)
    tenant_header = request.headers.get("x-tenant-id")
    if tenant_header:
        request.state.tenant = tenant_header
        return await call_next(request)

    # 2. Fallback to Host header
    host = request.headers.get("host", "")
    subdomain = "default"
    if host:
        # e.g. "panchpokhari.digitaltwin.gov.np:8000" -> "panchpokhari"
        parts = host.split(".")
        if len(parts) > 1 and parts[0] not in ["www", "api"]:
            subdomain = parts[0]
        elif parts[0].startswith("localhost") or parts[0].startswith("127"):
            subdomain = "localhost"
            
    request.state.tenant = subdomain
    return await call_next(request)

# Robust CORS whitelist for production
raw_origins = os.getenv("CORS_ORIGINS", "")
allowed_origins = [o.strip() for o in raw_origins.split(",") if o.strip()]
if not allowed_origins or "*" in allowed_origins:
    allowed_origins = [
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "http://103.140.0.154:8080",
        "http://10.5.83.153:8080",
        "http://localhost:5173",
        "http://localhost:3000",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    allow_origin_regex=r"http(s)?://(localhost|127\.0\.0\.1|103\.140\.0\.154|10\.5\.83\.153)(:[0-9]+)?",
)

app.include_router(demographics.router)
app.include_router(gis.router)
app.include_router(health.router)
app.include_router(agriculture.router)
app.include_router(education.router)
app.include_router(business.router)
app.include_router(business.singular_router)
app.include_router(vital_registration.router)
app.include_router(revenue.router)
app.include_router(complaint.router)
app.include_router(citizen_services.router)
app.include_router(infrastructure.router)
app.include_router(budget.router)
app.include_router(project.router)
app.include_router(employee_task.router)
app.include_router(procurement.router)
app.include_router(darta_chalani.router)
app.include_router(darta_chalani.legacy_darta_router)
app.include_router(darta_chalani.legacy_chalani_router)
app.include_router(employee.router)
app.include_router(ward.router)
app.include_router(tourism.router)
app.include_router(organization.router)
app.include_router(document.router)
app.include_router(report.router)
app.include_router(fiscal_year.router)
app.include_router(waste_management.router)
app.include_router(judicial.router)
app.include_router(livestock.router)
app.include_router(asset.router)
app.include_router(disaster.router)
app.include_router(contract.router)
app.include_router(building_permit.router)
app.include_router(audit.router)
app.include_router(audit.logs_router)
app.include_router(planning.router)
app.include_router(social_security.router)
app.include_router(social_inclusion.router)
app.include_router(senior_citizen.router)
app.include_router(women_children.router)
app.include_router(disability.router)
app.include_router(dalit.router)
app.include_router(employment.router)
app.include_router(recruitment.router)
app.include_router(heritage.router)
app.include_router(rti.router)
app.include_router(branch.router)
app.include_router(citizen.router)
app.include_router(representative.router)
app.include_router(badapatra.router)
app.include_router(notification.router)
app.include_router(open_data.router)
app.include_router(visitor.router)
app.include_router(library.router)
app.include_router(camera.router)
app.include_router(sensor.router)
app.include_router(media.router)
app.include_router(tenant.router)
app.include_router(setting.router)
app.include_router(municipality.router)
app.include_router(calendar.router)
app.include_router(weather.router)
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(dashboard.router)
app.include_router(analytics.router)
app.include_router(it_branch.router)
app.include_router(engineer_router)
app.include_router(payment_router)
app.include_router(odk_router)
app.include_router(service_router_api)
app.include_router(extra_router)
app.include_router(cooperative.router)
app.include_router(citizen_360.router)

from api.routers import master_data
app.include_router(master_data.router)

from api.routers import e_office
app.include_router(e_office.router)

from api.routers import project_lifecycle
app.include_router(project_lifecycle.router)

from api.routers import e_service
app.include_router(e_service.router)

from api.routers import ebps
app.include_router(ebps.router)

from api.routers import dashboard_v2
app.include_router(dashboard_v2.router)

from api.routers import digital_twin
app.include_router(digital_twin.router)

from api.routers import ai_assistant
app.include_router(ai_assistant.router)

from api.routers import land_classification
app.include_router(land_classification.router)


uploads_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
os.makedirs(uploads_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

@app.get("/")
def read_root():
    return {"message": "Welcome to Municipal Digital Twins API (FastAPI)"}
