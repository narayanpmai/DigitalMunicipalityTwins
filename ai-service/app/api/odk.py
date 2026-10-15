import os
import tempfile
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import Response

router = APIRouter(prefix="/odk", tags=["ODK / XLSForm"])

@router.post("/convert")
async def convert_xlsform_to_xml(file: UploadFile = File(...)):
    if not file.filename.endswith(".xlsx") and not file.filename.endswith(".xls"):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload an Excel file (.xlsx or .xls)")

    # Read uploaded file
    contents = await file.read()
    
    # We must save it to a temporary file because pyxform expects a file path
    with tempfile.NamedTemporaryFile(delete=False, suffix=".xlsx") as tmp_xls:
        tmp_xls.write(contents)
        tmp_xls_path = tmp_xls.name

    try:
        from pyxform.builder import create_survey_from_path
        
        # Parse survey
        survey = create_survey_from_path(tmp_xls_path)
        
        # Generate XML string
        xml_string = survey.to_xml()
        
        return Response(content=xml_string, media_type="application/xml")
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to convert XLSForm: {str(e)}")
    finally:
        # Cleanup temporary file
        if os.path.exists(tmp_xls_path):
            os.remove(tmp_xls_path)
