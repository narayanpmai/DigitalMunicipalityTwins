"""
ODK Survey Gateway & Service Router
- ODK: OpenRosa-compatible form list, form download, XLSForm upload, and survey submission
- Service Router: Dynamic request routing to appropriate citizen service domain
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Request, Response
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session
from typing import Optional, Any
from pydantic import BaseModel
from core.database import get_db
import os
import uuid

# ─── ODK Router ────────────────────────────────────────────────────────────────

odk_router = APIRouter(
    prefix="/api/v1/odk",
    tags=["ODK Survey Gateway (OpenRosa XForm सर्भे)"]
)

UPLOADS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "uploads")


@odk_router.get("/formList", response_class=PlainTextResponse)
def get_form_list(request: Request):
    """OpenRosa-compatible XForm manifest / formList"""
    host = f"{request.url.scheme}://{request.url.netloc}"
    xml = f"""<?xml version='1.0' encoding='UTF-8' ?>
<xforms xmlns="http://openrosa.org/xforms/xformsList">
  <xform>
    <formID>survey2</formID>
    <name>Digital Twins Survey (Dynamic)</name>
    <version>1.0</version>
    <hash>md5:dummyhash123</hash>
    <downloadUrl>{host}/odk/forms/survey2</downloadUrl>
  </xform>
</xforms>"""
    return PlainTextResponse(content=xml, media_type="text/xml", headers={"X-OpenRosa-Version": "1.0"})


@odk_router.get("/forms/survey2", response_class=PlainTextResponse)
@odk_router.get("/survey.xml", response_class=PlainTextResponse)
def get_form_survey():
    """XForm XML डाउनलोड गर्नुहोस् (uploads/survey.xml बाट)"""
    survey_path = os.path.join(UPLOADS_DIR, "survey.xml")
    if os.path.exists(survey_path):
        return PlainTextResponse(content=open(survey_path, encoding="utf-8").read(), media_type="text/xml", headers={"X-OpenRosa-Version": "1.0"})
    raise HTTPException(status_code=404, detail="survey.xml not found. Upload via /odk/survey/upload first.")


@odk_router.post("/survey/upload")
async def upload_survey(file: UploadFile = File(...)):
    """
    XLSForm फाइल अपलोड गर्नुहोस् र AI microservice मार्फत XForm XML मा रूपान्तरण गर्नुहोस्।
    AI service उपलब्ध नभएमा XLSForm सिधै सुरक्षित गर्दछ।
    """
    import httpx
    content = await file.read()
    ai_url = os.getenv("AI_SERVICE_URL", "http://ai_service:8000")

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                f"{ai_url}/api/v1/odk/convert",
                files={"file": (file.filename, content, file.content_type)},
            )
            if resp.status_code == 200:
                xml_text = resp.text
                os.makedirs(UPLOADS_DIR, exist_ok=True)
                open(os.path.join(UPLOADS_DIR, "survey.xml"), "w", encoding="utf-8").write(xml_text)
                return {"message": "Survey successfully converted and updated", "success": True}
    except Exception as e:
        pass

    # Fallback: save as-is
    os.makedirs(UPLOADS_DIR, exist_ok=True)
    save_name = "survey.xml" if file.filename and file.filename.endswith(".xml") else file.filename or "survey_upload.bin"
    open(os.path.join(UPLOADS_DIR, save_name), "wb").write(content)
    return {"message": f"File saved as '{save_name}' (AI conversion skipped)", "success": True}


@odk_router.post("/submission", response_class=PlainTextResponse)
async def handle_odk_submission(request: Request, db: Session = Depends(get_db)):
    """
    ODK/KoboToolbox survey submission endpoint.
    Parses XML, maps to household registry, and saves to database.
    """
    import xmltodict

    form = await request.form()
    xml_file = form.get("xml_submission_file")
    if not xml_file:
        return PlainTextResponse(content="<error>No XML file found</error>", status_code=400, media_type="text/xml")

    try:
        xml_bytes = await xml_file.read()
        parsed = xmltodict.parse(xml_bytes.decode("utf-8"))

        # Extract root form data
        root_key = next((k for k in parsed if not k.startswith("?") and isinstance(parsed[k], dict)), None)
        if root_key:
            form_data = parsed[root_key]

            # Import here to avoid circular imports
            from models.demographics import HouseholdRegistry
            household = HouseholdRegistry(
                id=str(uuid.uuid4()),
                household_name=form_data.get("hh_name") or form_data.get("name") or "Kobo Submit",
                ward_number=int(form_data.get("Ward_No", 1)),
                contact_phone=form_data.get("contact", ""),
                head_gender="male" if form_data.get("hh_Sex") == "male" else "female",
                is_riverbank_house=form_data.get("is_riverbank") == "yes",
                submitted_by_public=False,
                verification_status="pending",
            )
            if form_data.get("GPS"):
                coords = str(form_data["GPS"]).split()
                if len(coords) >= 2:
                    household.gps_lat = float(coords[0])
                    household.gps_lon = float(coords[1])

            db.add(household)
            db.commit()

        success_xml = """<?xml version='1.0' encoding='UTF-8' ?>
<OpenRosaResponse xmlns="http://openrosa.org/http/response">
  <message nature="submit_success">Success</message>
</OpenRosaResponse>"""
        return PlainTextResponse(content=success_xml, status_code=201, media_type="text/xml", headers={"X-OpenRosa-Version": "1.0"})

    except Exception as e:
        error_xml = f"""<?xml version='1.0' encoding='UTF-8' ?>
<OpenRosaResponse xmlns="http://openrosa.org/http/response">
  <message nature="submit_error">Error: {str(e)[:100]}</message>
</OpenRosaResponse>"""
        return PlainTextResponse(content=error_xml, status_code=500, media_type="text/xml")


# ─── Service Router ───────────────────────────────────────────────────────────

service_router_api = APIRouter(
    prefix="/api/v1/service-router",
    tags=["Service Router (एकीकृत नागरिक सेवा रूटर)"]
)

SERVICE_TYPE_MAP = {
    "RELATIONSHIP": "relationship_cert",
    "CITIZENSHIP": "citizenship_rec",
    "CHAR": "char_cert",
    "CHARACTER": "char_cert",
    "PROPERTY": "property",
    "BUSINESS": "business",
    "BIRTH": "birth_cert",
    "DEATH": "death_cert",
    "AGRICULTURE_DATA": "agriculture_data",
    "AGRICULTURE_FARMER": "agriculture_farmer",
    "HEALTH_FACILITY": "health_facility",
    "HEALTH_PATIENT": "health_patient",
}


class ServiceRequestBody(BaseModel):
    serviceType: str
    data: Optional[Any] = None


@service_router_api.post("/submit")
def submit_service_request(body: ServiceRequestBody, db: Session = Depends(get_db)):
    """
    एकीकृत सेवा अनुरोध — serviceType अनुसार सही domain module मा route गर्दछ।
    सिफारिस, कृषि, स्वास्थ्य, व्यवसाय, जन्म/मृत्यु प्रमाणपत्र सबै यही endpoint मार्फत।
    """
    service_type = (body.serviceType or "").upper()
    data = body.data or {}

    # Determine mapped citizen service type
    mapped_type = "other"
    for key, val in SERVICE_TYPE_MAP.items():
        if key in service_type:
            mapped_type = val
            break

    # Route agriculture to agriculture table
    if service_type in ("AGRICULTURE_DATA", "AGRICULTURE_FARMER"):
        from models.agriculture import AgricultureData
        record = AgricultureData(
            id=str(uuid.uuid4()),
            ward_number=int(data.get("wardNumber", 1)),
            category=data.get("category", "Crop"),
            subcategory=data.get("subcategory", "General"),
            data_value=str(data.get("value", data.get("dataValue", ""))),
            unit=data.get("unit", ""),
            remarks=data.get("remarks", f"Service Router: {body.serviceType}"),
        )
        db.add(record)
        db.commit()
        return {"success": True, "message": f"Agriculture data recorded", "data": {"id": record.id}}

    # Default: route to citizen_services table
    from models.citizen_service import CitizenService
    service_record = CitizenService(
        id=str(uuid.uuid4()),
        service_type=mapped_type,
        status="applied",
        applicant_name=data.get("applicantName") or data.get("fullName") or "सेवाग्राही",
        applicant_phone=data.get("phone") or data.get("applicantPhone") or data.get("contactPhone") or "",
        ward_number=int(data.get("wardNumber", 1)),
        purpose=data.get("purpose") or data.get("subject") or f"एकीकृत सेवा अनुरोध: {body.serviceType}",
        form_data=data,
        documents=data.get("documents", []),
        remarks=data.get("remarks") or "एकीकृत सेवा प्रणाली मार्फत आवेदन दर्ता भएको",
    )
    db.add(service_record)
    db.commit()
    db.refresh(service_record)

    return {
        "success": True,
        "message": f"Service request for {body.serviceType} processed successfully",
        "data": {
            "id": service_record.id,
            "serviceType": service_record.service_type,
            "status": service_record.status,
        }
    }
