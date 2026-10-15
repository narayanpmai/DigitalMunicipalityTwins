from sqlalchemy import Column, String, Integer, Numeric, DateTime, JSON
from core.database import Base
from datetime import datetime

class BuildingPermit(Base):
    __tablename__ = 'building_permits'
    
    tenant_id = Column(String, nullable=True, name='tenant_id')
    id = Column(String, primary_key=True)
    application_no = Column(String, unique=True, name='applicationNo')
    applicant_name = Column(String, name='applicantName')
    applicant_phone = Column(String, nullable=True, name='applicantPhone')
    applicant_citizenship = Column(String, nullable=True, name='applicantCitizenship')
    
    land_owner_name = Column(String, name='landOwnerName')
    kitta_no = Column(String, name='kittaNo')
    sheet_no = Column(String, nullable=True, name='sheetNo')
    land_area = Column(String, nullable=True, name='landArea')
    land_area_ropani = Column(String, nullable=True, name='landAreaRopani')
    four_boundaries = Column(JSON, nullable=True, name='fourBoundaries')
    
    ward_number = Column(Integer, default=1, name='wardNumber')
    tole_address = Column(String, nullable=True, name='toleAddress')
    
    building_class = Column(String, default='ख वर्ग (B - पेशागत / Engineered Design / RCC)', name='buildingClass')
    usage_type = Column(String, default='आवासीय (Residential)', name='usageType')
    structure_type = Column(String, default='आरसीसी फ्रेम स्ट्रक्चर (RCC Frame)', name='structureType')
    
    total_floors = Column(Numeric(4, 1), default=2.5, name='totalFloors')
    plinth_area_sqft = Column(Numeric(10, 2), default=0, name='plinthAreaSqFt')
    total_built_area_sqft = Column(Numeric(10, 2), default=0, name='totalBuiltAreaSqFt')
    
    far_ratio = Column(Numeric(5, 2), default=1.75, nullable=True, name='farRatio')
    ground_coverage_pct = Column(Numeric(5, 2), default=60.0, nullable=True, name='groundCoveragePct')
    road_width_ft = Column(Numeric(5, 2), default=20.0, nullable=True, name='roadWidthFt')
    setback_front_ft = Column(Numeric(5, 2), default=5.0, nullable=True, name='setbackFrontFt')
    setback_rear_ft = Column(Numeric(5, 2), default=3.0, nullable=True, name='setbackRearFt')
    setback_side_ft = Column(Numeric(5, 2), default=3.0, nullable=True, name='setbackSideFt')
    
    gps_lat = Column(Numeric(10, 6), nullable=True, name='gpsLat')
    gps_lon = Column(Numeric(10, 6), nullable=True, name='gpsLon')
    
    designer_name = Column(String, nullable=True, name='designerName')
    nec_license_no = Column(String, nullable=True, name='necLicenseNo')
    
    # ── भवन निर्माण मार्गदर्शन, २०८२ (DUDBC Guidance 2082) Upgrades ──
    ownership_type = Column(String, default='आफ्नै (Self-Owned)', name='ownershipType')  # आफ्नै, भाडा/लिज, पारिवारिक/मन्जुरीनामा
    lease_period_years = Column(Numeric(4, 1), nullable=True, name='leasePeriodYears')
    cad_version = Column(String, default='AutoCAD 2018 (.dwg)', nullable=True, name='cadVersion')
    has_structural_drawing = Column(String, default='हो (NBC 105:2020)', nullable=True, name='hasStructuralDrawing')
    structural_model_type = Column(String, nullable=True, name='structuralModelType')  # ETABS (.edb), SAP2000 (.sdb)
    structural_model_file_url = Column(String, nullable=True, name='structuralModelFileUrl')
    partial_completion_details = Column(JSON, nullable=True, name='partialCompletionDetails')
    etabs_checks = Column(JSON, nullable=True, name='etabsChecks')
    
    status = Column(String, default='दरखास्त पेश भएको')
    
    permit_fee = Column(Numeric(12, 2), default=0, name='permitFee')
    receipt_no = Column(String, nullable=True, name='receiptNo')
    payment_status = Column(String, default='भुक्तानी भएको', name='paymentStatus')
    
    application_date_bs = Column(String, nullable=True, name='applicationDateBs')
    
    documents = Column(JSON, nullable=True)
    objections = Column(JSON, nullable=True)
    approvals = Column(JSON, nullable=True)
    scrutiny_results = Column(JSON, nullable=True, name='scrutinyResults')
    
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, name='updatedAt')
    deleted_at = Column(DateTime, nullable=True, name='deletedAt')

