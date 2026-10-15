from pydantic import BaseModel, Field
from typing import Optional, Any, List, Dict
from datetime import datetime

class BuildingPermitSchema(BaseModel):
    id: str
    application_no: str
    applicant_name: str
    applicant_phone: Optional[str] = None
    land_owner_name: str
    kitta_no: str
    status: str
    ward_number: int
    building_class: str
    usage_type: str
    total_floors: float
    
    # Guidance 2082 additions
    ownership_type: Optional[str] = 'आफ्नै (Self-Owned)'
    lease_period_years: Optional[float] = None
    cad_version: Optional[str] = 'AutoCAD 2018 (.dwg)'
    has_structural_drawing: Optional[str] = 'हो (NBC 105:2020)'
    structural_model_type: Optional[str] = None
    structural_model_file_url: Optional[str] = None
    partial_completion_details: Optional[Dict[str, Any]] = None
    etabs_checks: Optional[Dict[str, Any]] = None
    
    class Config:
        from_attributes = True

class BuildingPermitCreate(BaseModel):
    application_no: Optional[str] = None
    applicant_name: str
    applicant_phone: Optional[str] = None
    applicant_citizenship: Optional[str] = None
    land_owner_name: str
    kitta_no: str
    sheet_no: Optional[str] = None
    land_area: Optional[str] = None
    land_area_ropani: Optional[str] = None
    ward_number: int = 1
    tole_address: Optional[str] = None
    building_class: str = 'ख वर्ग (B - पेशागत / Engineered Design / RCC)'
    usage_type: str = 'आवासीय (Residential)'
    structure_type: str = 'आरसीसी फ्रेम स्ट्रक्चर (RCC Frame)'
    total_floors: float = 2.5
    plinth_area_sqft: float = 0.0
    total_built_area_sqft: float = 0.0
    designer_name: Optional[str] = None
    nec_license_no: Optional[str] = None
    
    # ── भवन निर्माण मार्गदर्शन, २०८२ Fields ──
    ownership_type: Optional[str] = 'आफ्नै (Self-Owned)'  # आफ्नै, भाडा/लिज, पारिवारिक/मन्जुरीनामा
    lease_period_years: Optional[float] = None
    cad_version: Optional[str] = 'AutoCAD 2018 (.dwg)'
    has_structural_drawing: Optional[str] = 'हो (NBC 105:2020)'
    structural_model_type: Optional[str] = None  # ETABS (.edb), SAP2000 (.sdb)
    structural_model_file_url: Optional[str] = None
    
    east_boundary: Optional[str] = None
    west_boundary: Optional[str] = None
    north_boundary: Optional[str] = None
    south_boundary: Optional[str] = None
    four_boundaries: Optional[Dict[str, Any]] = None
    
    road_width_ft: Optional[float] = 20.0
    setback_front_ft: Optional[float] = 5.0
    setback_rear_ft: Optional[float] = 3.0
    setback_side_ft: Optional[float] = 3.0
    far_ratio: Optional[float] = 1.5
    ground_coverage_pct: Optional[float] = 55.0
    gps_lat: Optional[float] = None
    gps_lon: Optional[float] = None
    
    status: str = 'दरखास्त पेश भएको'
    permit_fee: float = 0.0
    payment_status: str = 'भुक्तानी बाँकी'
    application_date_bs: Optional[str] = None
    documents: Optional[List[Dict[str, Any]]] = None

class EtabsScrutinyRequest(BaseModel):
    """ETABS / SAP2000 Structural Verification Schema per NBC 105:2020."""
    permit_id: str
    structural_software: str = Field('ETABS (.edb)', description="Software used: ETABS, SAP2000")
    base_shear_kn: float = Field(..., description="Base Shear (Vb) in kN")
    fundamental_time_period_sec: float = Field(..., description="Fundamental Time Period (Ta) in seconds")
    max_drift_ratio: float = Field(..., description="Inter-storey Drift Ratio (Limit <= 0.004 per NBC 105:2020)")
    mass_participation_ratio_pct: float = Field(..., description="Modal Mass Participation Ratio (Must be >= 90%)")
    torsional_irregularity_ratio: float = Field(..., description="Torsional Irregularity Ratio (Must be <= 1.4)")
    engineer_nec_no: str
    engineer_name: str
    remarks: Optional[str] = None

class PartialCompletionRequest(BaseModel):
    """आंशिक निर्माण सम्पन्न प्रमाणपत्र (Partial Completion Certificate) Request."""
    permit_id: str
    completed_floors: float = Field(..., description="Number of completed floors e.g. 1.0 or 2.0")
    total_allowed_floors: float = Field(..., description="Total floors originally approved")
    completed_plinth_sqft: float
    allowed_usage: str = Field(..., description="Usage permitted for the completed portion")
    validity_expiry_date_bs: str = Field(..., description="Validity deadline to complete remaining floors")
    site_engineer_name: str
    engineer_nec_no: Optional[str] = None
    ward_recommendation_no: Optional[str] = None
    remarks: Optional[str] = None
