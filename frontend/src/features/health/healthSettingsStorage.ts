import type {
  DoctorMaster,
  LabTestCatalogItem,
  MedicineCategoryItem,
  MedicineUnitItem,
  HospitalDepartmentItem,
  IpdWardItem,
} from '../../types/health';

// ── DEFAULT PRE-SEEDED GOVERNMENT HOSPITAL DATA ───────────────────────

export const DEFAULT_DOCTORS: DoctorMaster[] = [
  {
    id: 'doc-1',
    name: 'डा. सुजन खनाल',
    designation: 'MDGP (मेडिकल सुपरिटेन्डेन्ट)',
    nmcNumber: 'NMC-18452',
    department: 'सामान्य चिकित्सा तथा ओपिडी',
    phone: '९८५११००१११',
    isActive: true,
  },
  {
    id: 'doc-2',
    name: 'डा. प्रशान्त श्रेष्ठ',
    designation: 'MBBS, MDGP (कन्सल्टेन्ट फिजिसियन)',
    nmcNumber: 'NMC-21045',
    department: 'सामान्य चिकित्सा / आकस्मिक',
    phone: '९८५११००२२२',
    isActive: true,
  },
  {
    id: 'doc-3',
    name: 'डा. सन्ध्या न्यौपाने',
    designation: 'MD Obstetrician & Gynecologist',
    nmcNumber: 'NMC-24190',
    department: 'प्रसूति तथा स्त्रीरोग (MCH/ANC)',
    phone: '९८५११००३३३',
    isActive: true,
  },
  {
    id: 'doc-4',
    name: 'डा. रोशन गिरी',
    designation: 'MBBS (मेडिकल अधिकृत)',
    nmcNumber: 'NMC-28912',
    department: 'आकस्मिक कक्ष (Emergency)',
    phone: '९८५११००४४४',
    isActive: true,
  },
  {
    id: 'doc-5',
    name: 'संगीता तामाङ',
    designation: 'SBA Senior Staff Nurse',
    nmcNumber: 'NHPC-8412',
    department: 'सुरक्षित मातृत्व तथा प्रसूति कक्ष',
    phone: '९८५११००५५५',
    isActive: true,
  },
  {
    id: 'doc-6',
    name: 'ईश्वर दास',
    designation: 'वरिष्ठ ल्याब टेक्नोलोजिस्ट',
    nmcNumber: 'NHPC-5120',
    department: 'प्रयोगशाला (Laboratory)',
    phone: '९८५११००६६६',
    isActive: true,
  },
];

export const DEFAULT_LAB_TESTS: LabTestCatalogItem[] = [
  {
    id: 'lab-1',
    testName: 'Complete Blood Count (CBC & Hb)',
    category: 'Hematology',
    sampleType: 'रगत (EDTA Purple Tube)',
    normalRange: 'WBC: 4000-11000 /cumm, Hb: 12-16 g/dL',
    unit: '/cumm',
    price: 300,
    isInsuranceCovered: true,
  },
  {
    id: 'lab-2',
    testName: 'Random Blood Sugar (RBS)',
    category: 'Biochemistry',
    sampleType: 'रगत (Fluoride Grey Tube)',
    normalRange: '70 - 140 mg/dL',
    unit: 'mg/dL',
    price: 100,
    isInsuranceCovered: true,
  },
  {
    id: 'lab-3',
    testName: 'Fasting Blood Sugar (FBS)',
    category: 'Biochemistry',
    sampleType: 'रगत (Fluoride Grey Tube)',
    normalRange: '70 - 100 mg/dL',
    unit: 'mg/dL',
    price: 100,
    isInsuranceCovered: true,
  },
  {
    id: 'lab-4',
    testName: 'Urine Routine & Microscopic (Urine R/E)',
    category: 'Clinical Pathology',
    sampleType: 'पिसाब (Yellow Cup)',
    normalRange: 'Pus cells: 0-5 /hpf, RBC: Nil, Protein: Nil',
    unit: '/hpf',
    price: 150,
    isInsuranceCovered: true,
  },
  {
    id: 'lab-5',
    testName: 'Dengue NS1 Antigen & IgM/IgG Rapid',
    category: 'Serology',
    sampleType: 'रगत (Serum Red Tube)',
    normalRange: 'Negative (गैर-सक्रिय)',
    unit: 'Index',
    price: 600,
    isInsuranceCovered: true,
  },
  {
    id: 'lab-6',
    testName: 'Widal Test (Typhoid Slide/Tube)',
    category: 'Serology',
    sampleType: 'रगत (Serum Red Tube)',
    normalRange: 'TO & TH: < 1:80 Titer',
    unit: 'Titer',
    price: 250,
    isInsuranceCovered: true,
  },
  {
    id: 'lab-7',
    testName: 'Blood Grouping & Rh Factor',
    category: 'Hematology',
    sampleType: 'रगत (EDTA Purple Tube)',
    normalRange: 'ABO Rh Positive/Negative',
    unit: 'Type',
    price: 100,
    isInsuranceCovered: true,
  },
  {
    id: 'lab-8',
    testName: 'Lipid Profile (Total Cholesterol, Triglycerides)',
    category: 'Biochemistry',
    sampleType: 'रगत (Serum Red Tube)',
    normalRange: 'Cholesterol: < 200 mg/dL, TG: < 150 mg/dL',
    unit: 'mg/dL',
    price: 750,
    isInsuranceCovered: true,
  },
  {
    id: 'lab-9',
    testName: 'Renal Function Test (RFT - Urea & Creatinine)',
    category: 'Biochemistry',
    sampleType: 'रगत (Serum Red Tube)',
    normalRange: 'Urea: 15-45 mg/dL, Creatinine: 0.6-1.2 mg/dL',
    unit: 'mg/dL',
    price: 350,
    isInsuranceCovered: true,
  },
  {
    id: 'lab-10',
    testName: 'Liver Function Test (LFT - SGPT, SGOT, Bilirubin)',
    category: 'Biochemistry',
    sampleType: 'रगत (Serum Red Tube)',
    normalRange: 'SGPT: < 45 U/L, Total Bilirubin: < 1.2 mg/dL',
    unit: 'U/L',
    price: 500,
    isInsuranceCovered: true,
  },
  {
    id: 'lab-11',
    testName: 'Uric Acid Serum',
    category: 'Biochemistry',
    sampleType: 'रगत (Serum Red Tube)',
    normalRange: 'Male: 3.4-7.0, Female: 2.4-6.0 mg/dL',
    unit: 'mg/dL',
    price: 250,
    isInsuranceCovered: true,
  },
  {
    id: 'lab-12',
    testName: 'Stool Routine & Occult Blood Examination',
    category: 'Microbiology',
    sampleType: 'दिसा (Stool Container)',
    normalRange: 'Ova/Cyst: Not Seen, Occult Blood: Negative',
    unit: 'Micro',
    price: 150,
    isInsuranceCovered: true,
  },
];

export const DEFAULT_MEDICINE_CATEGORIES: MedicineCategoryItem[] = [
  { id: 'cat-1', name: 'Tablet', nameNepali: 'ट्याब्लेट (Tablet)', description: 'ठोस चक्की औषधि' },
  { id: 'cat-2', name: 'Capsule', nameNepali: 'क्याप्सुल (Capsule)', description: 'जिलेटिन क्याप्सुल' },
  { id: 'cat-3', name: 'Syrup', nameNepali: 'झोल/सिरप (Syrup)', description: 'बालबालिका तथा झोल औषधि' },
  { id: 'cat-4', name: 'Injection', nameNepali: 'इन्जेक्सन (Injection / Vial)', description: 'सुई तथा भायल' },
  { id: 'cat-5', name: 'Ointment', nameNepali: 'मलम (Ointment / Cream)', description: 'छाला तथा बाह्य मलम' },
  { id: 'cat-6', name: 'IV Fluid', nameNepali: 'सलाइन (IV Infusion Fluid)', description: 'रक्तनलीबाट दिइने सलाइन पानी' },
  { id: 'cat-7', name: 'Drops', nameNepali: 'आई/इयर ड्रप्स (Eye/Ear Drops)', description: 'आँखा, कान र नाकको थोपा' },
  { id: 'cat-8', name: 'Powder', nameNepali: 'पाउडर (Oral Powder / Sachet)', description: 'जीवनजल तथा धुलो औषधि' },
];

export const DEFAULT_MEDICINE_UNITS: MedicineUnitItem[] = [
  { id: 'unit-1', name: 'Strip', nameNepali: 'पत्ता (Strip)', description: '१० वा १५ चक्कीको पत्ता' },
  { id: 'unit-2', name: 'Pcs', nameNepali: 'पिस (Pcs / Tablet)', description: 'खुद्रा १ चक्की वा पिस' },
  { id: 'unit-3', name: 'Bottle', nameNepali: 'बोतल (Bottle)', description: 'सिरप वा झोलको बोतल' },
  { id: 'unit-4', name: 'Vial', nameNepali: 'भायल (Vial)', description: 'पाउडर इन्जेक्सन भायल' },
  { id: 'unit-5', name: 'Ampoule', nameNepali: 'एम्पुल (Ampoule)', description: 'काँचको झोल इन्जेक्सन' },
  { id: 'unit-6', name: 'Tube', nameNepali: 'ट्युब (Tube)', description: 'मलम तथा जेलको ट्युब' },
  { id: 'unit-7', name: 'Packet', nameNepali: 'प्याकेट (Packet / Sachet)', description: 'जीवनजल वा धुलो प्याकेट' },
  { id: 'unit-8', name: 'Box', nameNepali: 'बक्स (Box / कार्टुन)', description: 'थोक प्याकिङ बाकस' },
];

export const DEFAULT_DEPARTMENTS: HospitalDepartmentItem[] = [
  { id: 'dept-1', name: 'सामान्य चिकित्सा (General Medicine OPD)', roomNo: 'कोठा नं. १०१', fee: 0, inChargeName: 'डा. सुजन खनाल' },
  { id: 'dept-2', name: 'प्रसूति तथा स्त्रीरोग (MCH / ANC Clinic)', roomNo: 'कोठा नं. १०२', fee: 0, inChargeName: 'डा. सन्ध्या न्यौपाने' },
  { id: 'dept-3', name: 'बालरोग तथा खोप (Pediatrics & Immunization)', roomNo: 'कोठा नं. १०३', fee: 0, inChargeName: 'संगीता तामाङ' },
  { id: 'dept-4', name: 'हाडजोर्नी तथा नशा (Orthopedics)', roomNo: 'कोठा नं. १०४', fee: 0, inChargeName: 'डा. प्रशान्त श्रेष्ठ' },
  { id: 'dept-5', name: 'दन्तरोग सेवा (Dental Care)', roomNo: 'कोठा नं. १०५', fee: 50, inChargeName: 'दन्त प्राविधिक' },
  { id: 'dept-6', name: 'आकस्मिक कक्ष (Emergency / Triage)', roomNo: 'कोठा नं. ००१ (ग्राउन्ड)', fee: 0, inChargeName: 'डा. रोशन गिरी' },
];

export const DEFAULT_IPD_WARDS: IpdWardItem[] = [
  { id: 'ward-1', wardName: 'पुरुष वार्ड (Male Ward)', bedPrefix: 'Bed-', totalBeds: 5, ratePerDay: 0 },
  { id: 'ward-2', wardName: 'महिला वार्ड (Female Ward)', bedPrefix: 'Bed-', totalBeds: 5, ratePerDay: 0 },
  { id: 'ward-3', wardName: 'प्रसूति तथा मातृत्व वार्ड (Maternity Ward)', bedPrefix: 'Bed-', totalBeds: 3, ratePerDay: 0 },
  { id: 'ward-4', wardName: 'आकस्मिक तथा अब्जर्भेसन (Emergency Obs)', bedPrefix: 'Bed-', totalBeds: 2, ratePerDay: 0 },
];

// ── LOCAL STORAGE KEYS ────────────────────────────────────────────────
const STORAGE_KEYS = {
  DOCTORS: 'p5_health_settings_doctors',
  LAB_TESTS: 'p5_health_settings_lab_tests',
  MED_CATEGORIES: 'p5_health_settings_med_categories',
  MED_UNITS: 'p5_health_settings_med_units',
  DEPARTMENTS: 'p5_health_settings_departments',
  IPD_WARDS: 'p5_health_settings_ipd_wards',
};

// ── GETTERS & SETTERS ─────────────────────────────────────────────────

export const getHealthDoctors = (): DoctorMaster[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DOCTORS);
    if (raw) return JSON.parse(raw);
  } catch {}
  localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(DEFAULT_DOCTORS));
  return DEFAULT_DOCTORS;
};

export const saveHealthDoctors = (list: DoctorMaster[]) => {
  localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(list));
  window.dispatchEvent(new Event('p5-health-settings-changed'));
};

export const getHealthLabTests = (): LabTestCatalogItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LAB_TESTS);
    if (raw) return JSON.parse(raw);
  } catch {}
  localStorage.setItem(STORAGE_KEYS.LAB_TESTS, JSON.stringify(DEFAULT_LAB_TESTS));
  return DEFAULT_LAB_TESTS;
};

export const saveHealthLabTests = (list: LabTestCatalogItem[]) => {
  localStorage.setItem(STORAGE_KEYS.LAB_TESTS, JSON.stringify(list));
  window.dispatchEvent(new Event('p5-health-settings-changed'));
};

export const getHealthMedCategories = (): MedicineCategoryItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MED_CATEGORIES);
    if (raw) return JSON.parse(raw);
  } catch {}
  localStorage.setItem(STORAGE_KEYS.MED_CATEGORIES, JSON.stringify(DEFAULT_MEDICINE_CATEGORIES));
  return DEFAULT_MEDICINE_CATEGORIES;
};

export const saveHealthMedCategories = (list: MedicineCategoryItem[]) => {
  localStorage.setItem(STORAGE_KEYS.MED_CATEGORIES, JSON.stringify(list));
  window.dispatchEvent(new Event('p5-health-settings-changed'));
};

export const getHealthMedUnits = (): MedicineUnitItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MED_UNITS);
    if (raw) return JSON.parse(raw);
  } catch {}
  localStorage.setItem(STORAGE_KEYS.MED_UNITS, JSON.stringify(DEFAULT_MEDICINE_UNITS));
  return DEFAULT_MEDICINE_UNITS;
};

export const saveHealthMedUnits = (list: MedicineUnitItem[]) => {
  localStorage.setItem(STORAGE_KEYS.MED_UNITS, JSON.stringify(list));
  window.dispatchEvent(new Event('p5-health-settings-changed'));
};

export const getHealthUnits = getHealthMedUnits;
export const saveHealthUnits = saveHealthMedUnits;

export const getHealthDepartments = (): HospitalDepartmentItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DEPARTMENTS);
    if (raw) return JSON.parse(raw);
  } catch {}
  localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(DEFAULT_DEPARTMENTS));
  return DEFAULT_DEPARTMENTS;
};

export const saveHealthDepartments = (list: HospitalDepartmentItem[]) => {
  localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(list));
  window.dispatchEvent(new Event('p5-health-settings-changed'));
};

export const getHealthIpdWards = (): IpdWardItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.IPD_WARDS);
    if (raw) return JSON.parse(raw);
  } catch {}
  localStorage.setItem(STORAGE_KEYS.IPD_WARDS, JSON.stringify(DEFAULT_IPD_WARDS));
  return DEFAULT_IPD_WARDS;
};

export const saveHealthIpdWards = (list: IpdWardItem[]) => {
  localStorage.setItem(STORAGE_KEYS.IPD_WARDS, JSON.stringify(list));
  window.dispatchEvent(new Event('p5-health-settings-changed'));
};

export const resetHealthSettingsToDefault = () => {
  localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(DEFAULT_DOCTORS));
  localStorage.setItem(STORAGE_KEYS.LAB_TESTS, JSON.stringify(DEFAULT_LAB_TESTS));
  localStorage.setItem(STORAGE_KEYS.MED_CATEGORIES, JSON.stringify(DEFAULT_MEDICINE_CATEGORIES));
  localStorage.setItem(STORAGE_KEYS.MED_UNITS, JSON.stringify(DEFAULT_MEDICINE_UNITS));
  localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(DEFAULT_DEPARTMENTS));
  localStorage.setItem(STORAGE_KEYS.IPD_WARDS, JSON.stringify(DEFAULT_IPD_WARDS));
  window.dispatchEvent(new Event('p5-health-settings-changed'));
};
