export interface HealthFacility {
  id: string;
  orderNo?: number;
  address?: string;
  name?: string;
  nameNepali: string;
  nameEnglish?: string;
  nameEn?: string;
  type: 'hospital' | 'primary_health_center' | 'health_post' | 'birthing_center' | 'ayurveda' | string;
  categoryNepali?: string;
  wardNumber: number;
  location: string;
  designation?: string;
  chiefName?: string;
  phone?: string;
  inChargeName?: string;
  contactNumber?: string;
  bedCount?: number;
  totalBeds?: number;
  hasBirthingCenter?: boolean;
  hasLabService?: boolean;
  hasPharmacy?: boolean;
  hasAmbulance?: boolean;
  emergencyAvailable24x7?: boolean;
  latitude?: number;
  longitude?: number;
  coordinates?: { lat: number; lng: number };
}

export interface AmbulanceContact {
  id: string;
  driverName: string;
  vehicleNumber: string;
  contactNumber: string;
  stationLocation: string;
  wardNumber: number;
  isAvailable: boolean;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BloodStockItem {
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  unitsAvailable: number;
  status: 'sufficient' | 'moderate' | 'critical';
}

export interface ImmunizationSchedule {
  id: string;
  vaccineName: string;
  targetGroup: string;
  scheduledDay: string;
  location: string;
  wardNumber: number;
}

export interface HealthDhis2Report {
  id: string;
  fiscalYear: string;
  monthNepali: string;
  healthFacilityName: string;
  wardNumber: number;
  dhis2OrgUnitId?: string;
  totalOpdVisits: number;
  maleOpdVisits: number;
  femaleOpdVisits: number;
  emergencyVisits: number;
  firstAncVisits: number;
  fourAncProtocolVisits: number;
  institutionalDeliveries: number;
  pncVisits: number;
  fullyImmunizedChildren: number;
  bcgCount: number;
  measlesRubellaCount: number;
  growthMonitoredChildren: number;
  diarrheaCases: number;
  ariPneumoniaCases: number;
  hypertensionDiabetesCases: number;
  mentalHealthCases: number;
  under5OpdVisits?: number;
  elderlyOpdVisits?: number;
  anc4Visits?: number;
  dengueCases?: number;
  typhoidCases?: number;
  syncStatus: 'synced' | 'pending' | 'draft' | string;
  syncedAt?: string;
  reportedBy?: string;
  remarks?: string;
  createdAt?: string;
}

export interface Dhis2Summary {
  totalReports: number;
  syncedReports: number;
  pendingReports: number;
  totalOpd: number;
  totalDeliveries: number;
  totalImmunized: number;
  totalGrowthMonitored: number;
}

export interface MedicineStockItem {
  id: string;
  medicineName: string;
  genericName?: string;
  category: 'essential' | 'antibiotic' | 'emergency' | 'mch' | string;
  healthFacilityName: string;
  wardNumber: number;
  batchNo?: string;
  unit: string;
  stockQuantity: number;
  minimumRequiredStock: number;
  expiryDate?: string;
  status: 'sufficient' | 'low' | 'critical' | 'expired' | string;
  createdAt?: string;
}

export interface PatientRecord {
  id: string;
  patientNo: string; // MRN
  firstName: string;
  middleName?: string;
  lastName: string;
  fullName: string;
  fullNameEn?: string;
  age: number;
  dobBs?: string;
  dobAd?: string;
  gender: 'male' | 'female' | 'other' | string;
  bloodGroup?: string;
  maritalStatus?: string;
  occupation?: string;
  citizenshipOrNin?: string;
  citizenId?: string; // Unified Municipal Citizen Master ID
  crossSectoralAlerts?: string[];
  phone?: string;
  wardNumber: number;
  address?: string;
  toleVillage?: string;
  emergencyContactName?: string;
  emergencyContactRelation?: string;
  emergencyContactPhone?: string;
  hasHealthInsurance: boolean;
  insuranceNumber?: string;
  targetedGroup?: string;
  paymentMode?: string;
  healthFacilityName: string;
  visitType?: 'new' | 'followup' | 'emergency' | string;
  department: string;
  attendingDoctor?: string;
  roomNumber?: string;
  ticketFee: number;
  ticketStatus: 'active' | 'completed' | 'cancelled' | string;
  triagePriority?: 'routine' | 'urgent' | 'emergency' | string;
  bloodPressure?: string;
  pulseRate?: string;
  temperatureF?: string;
  spo2Percent?: string;
  respiratoryRate?: string;
  heightCm?: string;
  weightKg?: string;
  bmi?: string;
  bmiCategory?: string;
  bloodGlucose?: string;
  knownAllergies?: string;
  pastMedicalHistory?: string[];
  currentMedications?: string;
  chiefComplaint?: string;
  chiefComplaints?: string;
  provisionalDiagnosis?: string;
  createdAt?: string;
}

export interface IpdAdmission {
  id: string;
  admissionNo: string;
  patientId?: string;
  patientName: string;
  age: number;
  gender: string;
  phone?: string;
  wardNumber: number;
  bedNumber: string;
  departmentWard: string;
  admissionDate: string;
  dischargeDate?: string;
  admittingDoctor?: string;
  diagnosis?: string;
  status: 'admitted' | 'discharged' | 'referred' | string;
  treatmentSummary?: string;
  hasInsurance: boolean;
  insuranceNo?: string;
  createdAt?: string;
}

export interface LabTestRecord {
  id: string;
  testOrderNo: string;
  patientId?: string;
  patientName: string;
  age: number;
  gender: string;
  testCategory: string;
  testName: string;
  sampleType?: string;
  orderedBy?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | string;
  results?: Record<string, any>;
  remarks?: string;
  normalRange?: string;
  fee: number;
  isCoveredByInsurance: boolean;
  createdAt?: string;
}

export interface PrescribedMedicine {
  medicineName: string;
  dosage: string;
  frequency: string;
  durationDays: number;
  quantity: number;
  instructions?: string;
}

export interface HealthPrescription {
  id: string;
  rxNumber: string;
  patientId?: string;
  patientNo: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  wardNumber: number;
  doctorName: string;
  department: string;
  diagnosis?: string;
  medicines: PrescribedMedicine[];
  dispenseStatus: 'pending' | 'dispensed' | 'cancelled' | string;
  dispensedAt?: string;
  dispensedBy?: string;
  isInsured: boolean;
  insuranceNumber?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface HealthDischargeSummary {
  id: string;
  dischargeNo: string;
  admissionId?: string;
  admissionNo: string;
  patientNo: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  bedNumber: string;
  departmentWard: string;
  admissionDate: string;
  dischargeDate: string;
  attendingDoctor: string;
  provisionalDiagnosis?: string;
  finalDiagnosis: string;
  treatmentGiven: string;
  conditionAtDischarge: 'cured' | 'improved' | 'referred' | 'lama' | 'deceased' | string;
  dischargeMedications?: string;
  followUpDate?: string;
  doctorAdvice?: string;
  createdAt?: string;
}

export interface PatientFullEhrHistory {
  patient: PatientRecord;
  summary: {
    totalOpdVisits: number;
    totalPrescriptions: number;
    totalLabTests: number;
    totalIpdAdmissions: number;
  };
  visits: PatientRecord[];
  prescriptions: HealthPrescription[];
  labTests: LabTestRecord[];
  admissions: IpdAdmission[];
}

export interface AutoCalculatedDhis2Metrics {
  fiscalYear: string;
  monthNepali: string;
  wardNumber: number;
  healthFacilityName: string;
  dhis2OrgUnitId: string;
  totalOpdVisits: number;
  maleOpdVisits: number;
  femaleOpdVisits: number;
  emergencyVisits: number;
  firstAncVisits: number;
  fourAncProtocolVisits: number;
  institutionalDeliveries: number;
  pncVisits: number;
  growthMonitoredChildren: number;
  fullyImmunizedChildren: number;
  totalIpdAdmissions: number;
  totalLabTests: number;
  calculatedAt: string;
  dataSource: string;
}

export interface HealthSupplier {
  id: string;
  supplierName: string;
  panVatNumber?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address: string;
  bankName?: string;
  bankAccountNo?: string;
  status: 'active' | 'inactive' | string;
  createdAt?: string;
}

export interface HealthPurchaseItem {
  id?: string;
  purchaseId?: string;
  medicineName: string;
  genericName?: string;
  batchNo: string;
  expiryDate: string;
  quantity: number;
  freeQuantity?: number;
  unit: string;
  purchaseRate: number;
  salesRate: number;
  totalAmount: number;
}

export interface HealthPurchase {
  id: string;
  grnNo: string;
  invoiceNo: string;
  supplierId?: string;
  supplierName: string;
  purchaseDateBs: string;
  purchaseDateAd?: string;
  healthFacilityName: string;
  wardNumber: number;
  subTotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  paymentStatus: 'paid' | 'credit' | 'partial' | string;
  receivedBy: string;
  remarks?: string;
  items?: HealthPurchaseItem[];
  createdAt?: string;
}

export interface MedicineBatch {
  id: string;
  medicineName: string;
  genericName?: string;
  batchNo: string;
  expiryDate: string;
  stockQuantity: number;
  unit: string;
  purchaseRate: number;
  salesRate: number;
  healthFacilityName: string;
  wardNumber: number;
  status: 'active' | 'low' | 'critical' | 'expired' | string;
  createdAt?: string;
}

export interface HealthPosSaleItem {
  id?: string;
  saleId?: string;
  medicineName: string;
  batchNo?: string;
  expiryDate?: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  isInsuranceCovered?: boolean;
}

export interface HealthPosSale {
  id: string;
  billNo: string;
  fiscalYear: string;
  patientId?: string;
  patientNo?: string;
  patientName: string;
  prescriptionNo?: string;
  isInsured: boolean;
  insuranceNumber?: string;
  subTotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  copayPercent: number;
  copayAmount: number;
  insuranceClaimAmount: number;
  paymentMode: 'cash' | 'fonepay_qr' | 'insurance_claim' | 'mixed' | string;
  cashReceived: number;
  changeReturned: number;
  billerName: string;
  healthFacilityName: string;
  wardNumber: number;
  status: 'completed' | 'returned' | 'cancelled' | string;
  items?: HealthPosSaleItem[];
  createdAt?: string;
}

export interface HealthInsuranceClaim {
  id: string;
  claimNo: string;
  policyNumber: string;
  patientNo: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  claimDateBs: string;
  serviceType: 'opd' | 'ipd' | 'pharmacy' | 'lab' | 'package' | string;
  diagnosisCode?: string;
  diagnosisName?: string;
  totalBillAmount: number;
  copayAmount: number;
  claimedAmount: number;
  reimbursedAmount?: number;
  claimStatus: 'draft' | 'submitted' | 'approved' | 'rejected' | 'reimbursed' | string;
  rejectionReason?: string;
  healthFacilityName: string;
  wardNumber: number;
  referralSlipNo?: string;
  claimedBy: string;
  remarks?: string;
  createdAt?: string;
}

export interface HealthInsuranceSummary {
  totalClaims: number;
  submittedCount: number;
  approvedCount: number;
  totalClaimedAmount: number;
  totalCopayAmount: number;
  totalReimbursedAmount: number;
}

export interface HealthStockTransfer {
  id: string;
  transferNo: string;
  transferType: 'internal_issue' | 'disposal_expired' | 'return_supplier' | string;
  fromLocation: string;
  toLocation: string;
  medicineName: string;
  batchNo?: string;
  quantity: number;
  unit: string;
  transferDateBs: string;
  requestedBy: string;
  issuedBy: string;
  status: 'completed' | 'pending' | 'cancelled' | string;
  remarks?: string;
  createdAt?: string;
}

// ── HEALTH MASTER SETTINGS (One-time Settings) ──────────────────────
export interface DoctorMaster {
  id: string;
  name: string;
  nameNepali?: string; // Optional Nepali name alias
  designation: string; // MDGP, Medical Officer, SBA Staff Nurse
  nmcNumber: string; // NMC-18452
  department: string; // सामान्य चिकित्सा, प्रसूति, आकस्मिक
  phone?: string;
  isActive: boolean;
}

export interface LabTestCatalogItem {
  id: string;
  testName: string; // Complete Blood Count (CBC), RBS, Urine R/E
  category: string; // Hematology, Biochemistry, Serology, Microbiology
  sampleType: string; // रगत, पिसाब, खकार
  normalRange: string; // 4000-11000 /cumm
  unit: string; // /cumm, mg/dL
  price: number; // रु.
  rate?: number; // रु. alias for price
  isInsuranceCovered: boolean;
  isCoveredByInsurance?: boolean; // alias for isInsuranceCovered
  isActive?: boolean;
}

export interface MedicineCategoryItem {
  id: string;
  name: string; // Tablet, Capsule, Syrup, Injection, Ointment, IV Fluid, Drops
  nameNepali: string; // ट्याब्लेट, क्याप्सुल, सिरप, सुई, मलम, सलाइन
  description?: string;
}

export interface MedicineUnitItem {
  id: string;
  name: string; // Pcs, Strip, Bottle, Vial, Ampoule, Tube, Packet, Box
  nameNepali: string; // पिस, पत्ता (Strip), बोतल, भायल, एम्पुल, ट्युब
  description?: string;
}

export interface HospitalDepartmentItem {
  id: string;
  name: string; // सामान्य चिकित्सा, प्रसूति तथा स्त्रीरोग, बालरोग, आकस्मिक
  roomNo: string; // कोठा नं. १०१
  fee: number; // ० (निःशुल्क) वा तोकिएको शुल्क
  inChargeName?: string;
}

export interface IpdWardItem {
  id: string;
  wardName: string; // पुरुष वार्ड, महिला वार्ड, प्रसूति वार्ड, आकस्मिक
  bedPrefix: string; // Bed-
  totalBeds: number;
  ratePerDay: number;
}

