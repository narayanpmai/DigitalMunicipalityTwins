import { api } from './client';

// ── Business Categories (Local Government Act 2074, Sch. 8) ─────────────────
export const BUSINESS_CATEGORIES = [
  'व्यापार तथा किराना पसल (Retail & Wholesale)',
  'पर्यटन, होटल, रिसोर्ट तथा होमस्टे (Tourism & Hospitality)',
  'कृषि फर्म, नर्सरी तथा पशुपालन (Agriculture & Livestock)',
  'उत्पादन तथा साना उद्योग (Manufacturing & Small Industry)',
  'निर्माण सामग्री तथा हार्डवेयर (Construction & Hardware)',
  'स्वास्थ्य, फार्मेसी तथा क्लिनिक (Health & Pharmacy)',
  'शिक्षा, कोचिङ तथा प्रशिक्षण (Education & Training)',
  'यातायात तथा ढुवानी सेवा (Transport & Logistics)',
  'बैंकिङ, बीमा तथा वित्तीय सेवा (Banking & Finance)',
  'सूचना प्रविधि तथा दूरसञ्चार (ICT & Telecom)',
  'सेवामूलक व्यवसाय तथा परामर्श (Service & Consulting)',
  'अन्य व्यावसायिक गतिविधि (Other Business Activity)',
];

// ── Capital-based annual fee schedule (स्थानीय सरकार सञ्चालन ऐन, २०७४) ─────
export const ANNUAL_FEE_SCHEDULE = [
  { label: 'रु. ५ लाख सम्म', maxCapital: 500_000, fee: 1_500 },
  { label: 'रु. ५–२५ लाख', maxCapital: 2_500_000, fee: 3_500 },
  { label: 'रु. २५–५० लाख', maxCapital: 5_000_000, fee: 6_500 },
  { label: 'रु. ५०–१ करोड', maxCapital: 10_000_000, fee: 12_000 },
  { label: 'रु. १ करोड माथि', maxCapital: Infinity, fee: 20_000 },
];

export const calculateAnnualFee = (capital: number): number => {
  const row = ANNUAL_FEE_SCHEDULE.find((r) => capital <= r.maxCapital);
  return row?.fee ?? 20_000;
};

// ── TypeScript Interfaces ────────────────────────────────────────────────────
export interface Business {
  id: string;
  registrationNo: string;
  businessName: string;
  businessNameEn?: string;
  proprietorName: string;
  proprietorPhone?: string;
  proprietorCitizenshipNo?: string;
  panNumber?: string;
  vatNumber?: string;
  category: string;
  subCategory?: string;
  wardNumber: number;
  tole?: string;
  landOwner?: string;
  buildingKittaNo?: string;
  capitaInvestmentNPR: number;
  employeeCount?: number;
  femaleEmployeeCount?: number;
  registrationDateBs: string;
  renewalDueDateBs: string;
  lastRenewalDateBs?: string;
  expiryDateBs?: string;
  annualFeeNPR: number;
  fineNPR?: number;
  status: 'दर्ता सम्पन्न' | 'नवीकरण बाँकी' | 'नवीकृत' | 'निलम्बित' | 'रद्द';
  paymentStatus?: 'भुक्तानी बाँकी' | 'भुक्तानी सम्पन्न';
  lastReceiptNo?: string;
  lastPaymentGateway?: string;
  inspectionDateBs?: string;
  inspectionOfficer?: string;
  inspectionRemarks?: string;
  environmentalStatus?: 'प्रभाव नगर्ने (Green)' | 'अनुमति आवश्यक (Amber)' | 'EIA अनिवार्य (Red)';
  certQrUrl?: string;
}

export interface BusinessRenewalRecord {
  id: string;
  businessId: string;
  registrationNo: string;
  businessName: string;
  proprietorName: string;
  wardNumber: number;
  fiscalYear: string;
  renewalDateBs: string;
  annualFeeNPR: number;
  fineNPR: number;
  totalPaidNPR: number;
  paymentGateway: string;
  receiptNo: string;
  renewedByOfficer: string;
}

export interface BusinessInspectionRecord {
  id: string;
  businessId: string;
  registrationNo: string;
  businessName: string;
  wardNumber: number;
  inspectionDateBs: string;
  inspectionType: 'नियमित वार्षिक' | 'विशेष तथा उजुरीमा' | 'पुन: जाँच' | 'पर्यावरण निरीक्षण';
  inspectorName: string;
  inspectorDesignation: string;
  complianceStatus: 'अनुपालन सम्पन्न ✅' | 'सुधारको सुचना दिइएको ⚠️' | 'कारवाहीको लागि पठाइएको 🔴';
  remarks: string;
  followUpDateBs?: string;
}

export interface BusinessStats {
  totalRegistered: number;
  activeCount: number;
  renewedCount: number;
  pendingRenewalCount: number;
  suspendedCount: number;
  cancelledCount: number;
  totalCapitalInvestedNPR: number;
  totalEmployeeCount: number;
  totalRevenueThisFyNPR: number;
  categoryBreakdown: Record<string, number>;
  wardBreakdown: Record<string, number>;
}

// ── Seed Data (Panchpokhari Thangpal Municipality) ───────────────────────────
const SEED_BUSINESSES: Business[] = [
  {
    id: 'biz-001',
    registrationNo: 'पाँ.था./व्य.दर्ता/२०७९-०१',
    businessName: 'थाङपालधाप किराना तथा जनरल स्टोर',
    businessNameEn: 'THANGPALDHAP KIRANA & GENERAL STORE',
    proprietorName: 'सुर्य बहादुर तामाङ',
    proprietorPhone: '9841223344',
    proprietorCitizenshipNo: '२३-०१-७५-०५५१२',
    panNumber: '५०२४१७८',
    category: 'व्यापार तथा किराना पसल (Retail & Wholesale)',
    wardNumber: 1,
    tole: 'भोटेनाम्लाङ बजार',
    capitaInvestmentNPR: 850_000,
    employeeCount: 4,
    femaleEmployeeCount: 2,
    registrationDateBs: '२०७९-०४-१२',
    renewalDueDateBs: '२०८२-०३-३१',
    lastRenewalDateBs: '२०८१-०५-०८',
    expiryDateBs: '२०८२-०३-३१',
    annualFeeNPR: 3_500,
    status: 'नवीकृत',
    paymentStatus: 'भुक्तानी सम्पन्न',
    lastReceiptNo: 'P5-BIZ-2081-001',
    lastPaymentGateway: 'FONEPAY',
    inspectionDateBs: '२०८१-०२-१५',
    inspectionOfficer: 'कमल थापा (राजस्व निरीक्षक)',
    inspectionRemarks: 'व्यापार सञ्चालन सन्तोषजनक। स्वच्छता मापदण्ड पालना भएको।',
    environmentalStatus: 'प्रभाव नगर्ने (Green)',
  },
  {
    id: 'biz-002',
    registrationNo: 'पाँ.था./व्य.दर्ता/२०७९-०२',
    businessName: 'याङ्ग्री लज एण्ड होमस्टे',
    businessNameEn: 'YANGRI LODGE & HOMESTAY',
    proprietorName: 'डोल्मा शेर्पा',
    proprietorPhone: '9861998822',
    proprietorCitizenshipNo: '२३-०१-३०-००५८१',
    panNumber: '५०३४५६७',
    vatNumber: 'VAT-NP-2024-88412',
    category: 'पर्यटन, होटल, रिसोर्ट तथा होमस्टे (Tourism & Hospitality)',
    wardNumber: 2,
    tole: 'याङ्ग्री गाउँ',
    capitaInvestmentNPR: 3_200_000,
    employeeCount: 12,
    femaleEmployeeCount: 7,
    registrationDateBs: '२०७९-०७-२३',
    renewalDueDateBs: '२०८२-०३-३१',
    lastRenewalDateBs: '२०८१-०४-२०',
    annualFeeNPR: 6_500,
    status: 'नवीकृत',
    paymentStatus: 'भुक्तानी सम्पन्न',
    lastReceiptNo: 'P5-BIZ-2081-002',
    lastPaymentGateway: 'ESEWA',
    inspectionDateBs: '२०८१-०१-२०',
    inspectionOfficer: 'विदुर लामिछाने (राजस्व निरीक्षक)',
    inspectionRemarks: 'पर्यटन सेवा मापदण्ड पालना गरेको। DoT नवीकरण प्रमाण पेश भएको।',
    environmentalStatus: 'प्रभाव नगर्ने (Green)',
  },
  {
    id: 'biz-003',
    registrationNo: 'पाँ.था./व्य.दर्ता/२०८०-०३',
    businessName: 'थाङपाल कृषि उत्पादन सहकारी फर्म',
    businessNameEn: 'THANGPAL AGRO COOPERATIVE FARM',
    proprietorName: 'छिरिङ तामाङ',
    proprietorPhone: '9813445566',
    proprietorCitizenshipNo: '२३-०१-३५-०१२३४',
    panNumber: '५०१२३४५',
    category: 'कृषि फर्म, नर्सरी तथा पशुपालन (Agriculture & Livestock)',
    wardNumber: 3,
    tole: 'थाङपालकोट',
    capitaInvestmentNPR: 1_500_000,
    employeeCount: 8,
    femaleEmployeeCount: 5,
    registrationDateBs: '२०८०-०२-०५',
    renewalDueDateBs: '२०८२-०३-३१',
    lastRenewalDateBs: '२०८१-०४-१५',
    annualFeeNPR: 3_500,
    fineNPR: 500,
    status: 'नवीकृत',
    paymentStatus: 'भुक्तानी सम्पन्न',
    lastReceiptNo: 'P5-BIZ-2081-003',
    lastPaymentGateway: 'KHALTI',
    environmentalStatus: 'अनुमति आवश्यक (Amber)',
  },
  {
    id: 'biz-004',
    registrationNo: 'पाँ.था./व्य.दर्ता/२०८०-०४',
    businessName: 'हिमाल निर्माण सेवा तथा हार्डवेयर',
    businessNameEn: 'HIMAL CONSTRUCTION & HARDWARE',
    proprietorName: 'गोविन्द प्रसाद श्रेष्ठ',
    proprietorPhone: '9841556677',
    proprietorCitizenshipNo: '२३-०१-४५-०२३४५',
    panNumber: '५०५६७८९',
    category: 'निर्माण सामग्री तथा हार्डवेयर (Construction & Hardware)',
    wardNumber: 4,
    tole: 'थाङपालधाप बेसी',
    capitaInvestmentNPR: 4_500_000,
    employeeCount: 15,
    femaleEmployeeCount: 2,
    registrationDateBs: '२०८०-०५-१८',
    renewalDueDateBs: '२०८२-०३-३१',
    annualFeeNPR: 6_500,
    status: 'नवीकरण बाँकी',
    paymentStatus: 'भुक्तानी बाँकी',
    environmentalStatus: 'अनुमति आवश्यक (Amber)',
  },
  {
    id: 'biz-005',
    registrationNo: 'पाँ.था./व्य.दर्ता/२०८०-०५',
    businessName: 'पाँचपोखरी स्वास्थ्य क्लिनिक तथा फार्मेसी',
    businessNameEn: 'PANCHPOKHARI HEALTH CLINIC & PHARMACY',
    proprietorName: 'डा. मेनुका राई',
    proprietorPhone: '9861009988',
    proprietorCitizenshipNo: '२३-०१-५०-०३४५६',
    panNumber: '५०६७८९०',
    category: 'स्वास्थ्य, फार्मेसी तथा क्लिनिक (Health & Pharmacy)',
    wardNumber: 5,
    tole: 'बरुवा डाँडा',
    capitaInvestmentNPR: 2_800_000,
    employeeCount: 10,
    femaleEmployeeCount: 6,
    registrationDateBs: '२०८०-०८-२५',
    renewalDueDateBs: '२०८२-०३-३१',
    lastRenewalDateBs: '२०८१-०५-१५',
    annualFeeNPR: 6_500,
    status: 'नवीकृत',
    paymentStatus: 'भुक्तानी सम्पन्न',
    lastReceiptNo: 'P5-BIZ-2081-005',
    lastPaymentGateway: 'CONNECTIPS',
    inspectionDateBs: '२०८१-०१-०५',
    inspectionOfficer: 'रमेश बुढाथोकी (स्वास्थ्य निरीक्षक)',
    inspectionRemarks: 'DDA अनुमति नवीकरण भएको। Pharmacy DCDA दर्ता वैध। सरसफाइ मापदण्ड अनुरुप।',
    environmentalStatus: 'प्रभाव नगर्ने (Green)',
  },
  {
    id: 'biz-006',
    registrationNo: 'पाँ.था./व्य.दर्ता/२०८१-०६',
    businessName: 'थाङपाल सूचना प्रविधि तथा डिजिटल सेवा केन्द्र',
    businessNameEn: 'THANGPAL IT & DIGITAL SERVICE CENTER',
    proprietorName: 'विराज श्रेष्ठ',
    proprietorPhone: '9801223399',
    proprietorCitizenshipNo: '२३-०१-५५-०४५६७',
    panNumber: '५०७८९०१',
    category: 'सूचना प्रविधि तथा दूरसञ्चार (ICT & Telecom)',
    wardNumber: 1,
    tole: 'भोटेनाम्लाङ बजार',
    capitaInvestmentNPR: 600_000,
    employeeCount: 3,
    femaleEmployeeCount: 1,
    registrationDateBs: '२०८१-०१-१५',
    renewalDueDateBs: '२०८२-०३-३१',
    lastRenewalDateBs: '२०८१-०१-१५',
    annualFeeNPR: 3_500,
    status: 'दर्ता सम्पन्न',
    paymentStatus: 'भुक्तानी सम्पन्न',
    lastReceiptNo: 'P5-BIZ-2081-006',
    lastPaymentGateway: 'KHALTI',
    environmentalStatus: 'प्रभाव नगर्ने (Green)',
  },
  {
    id: 'biz-007',
    registrationNo: 'पाँ.था./व्य.दर्ता/२०७८-०७',
    businessName: 'थाङपाल ट्रान्सपोर्ट तथा ढुवानी सेवा',
    businessNameEn: 'THANGPAL TRANSPORT & LOGISTICS',
    proprietorName: 'सन्तोष तामाङ',
    proprietorPhone: '9841887766',
    proprietorCitizenshipNo: '२३-०१-२८-०१४५६',
    panNumber: '५०८९०१२',
    category: 'यातायात तथा ढुवानी सेवा (Transport & Logistics)',
    wardNumber: 6,
    tole: 'मानेडाँडा',
    capitaInvestmentNPR: 8_500_000,
    employeeCount: 22,
    femaleEmployeeCount: 3,
    registrationDateBs: '२०७८-०३-१०',
    renewalDueDateBs: '२०८२-०३-३१',
    annualFeeNPR: 12_000,
    status: 'नवीकरण बाँकी',
    paymentStatus: 'भुक्तानी बाँकी',
    environmentalStatus: 'अनुमति आवश्यक (Amber)',
  },
  {
    id: 'biz-008',
    registrationNo: 'पाँ.था./व्य.दर्ता/२०७७-०८',
    businessName: 'याङ्ग्री बासमती चिया तथा जडिबुटी उद्योग',
    businessNameEn: 'YANGRI BASMATI TEA & HERBS INDUSTRY',
    proprietorName: 'पेम्बा तामाङ',
    proprietorPhone: '9841112233',
    proprietorCitizenshipNo: '२३-०१-२५-००५६७',
    panNumber: '५०९०१२३',
    category: 'उत्पादन तथा साना उद्योग (Manufacturing & Small Industry)',
    wardNumber: 7,
    tole: 'याङ्ग्री गाउँ',
    capitaInvestmentNPR: 15_000_000,
    employeeCount: 35,
    femaleEmployeeCount: 20,
    registrationDateBs: '२०७७-०९-०५',
    renewalDueDateBs: '२०८२-०३-३१',
    lastRenewalDateBs: '२०८१-०४-०५',
    annualFeeNPR: 12_000,
    status: 'नवीकृत',
    paymentStatus: 'भुक्तानी सम्पन्न',
    lastReceiptNo: 'P5-BIZ-2081-008',
    lastPaymentGateway: 'FONEPAY',
    inspectionDateBs: '२०८१-०१-३०',
    inspectionOfficer: 'धीरज खड्का (उद्योग निरीक्षक)',
    inspectionRemarks: 'DoI नवीकरण भएको। EIA प्रतिवेदन पेश भएको। महिला कर्मचारी ५७%।',
    environmentalStatus: 'EIA अनिवार्य (Red)',
  },
];

const SEED_RENEWALS: BusinessRenewalRecord[] = [
  {
    id: 'ren-001', businessId: 'biz-001', registrationNo: 'पाँ.था./व्य.दर्ता/२०७९-०१',
    businessName: 'थाङपालधाप किराना तथा जनरल स्टोर', proprietorName: 'सुर्य बहादुर तामाङ',
    wardNumber: 1, fiscalYear: '२०८१/०८२', renewalDateBs: '२०८१-०५-०८',
    annualFeeNPR: 3_500, fineNPR: 0, totalPaidNPR: 3_500,
    paymentGateway: 'FONEPAY', receiptNo: 'P5-BIZ-2081-001', renewedByOfficer: 'कमल थापा',
  },
  {
    id: 'ren-002', businessId: 'biz-002', registrationNo: 'पाँ.था./व्य.दर्ता/२०७९-०२',
    businessName: 'याङ्ग्री लज एण्ड होमस्टे', proprietorName: 'डोल्मा शेर्पा',
    wardNumber: 2, fiscalYear: '२०८१/०८२', renewalDateBs: '२०८१-०४-२०',
    annualFeeNPR: 6_500, fineNPR: 0, totalPaidNPR: 6_500,
    paymentGateway: 'ESEWA', receiptNo: 'P5-BIZ-2081-002', renewedByOfficer: 'विदुर लामिछाने',
  },
  {
    id: 'ren-003', businessId: 'biz-003', registrationNo: 'पाँ.था./व्य.दर्ता/२०८०-०३',
    businessName: 'थाङपाल कृषि उत्पादन सहकारी फर्म', proprietorName: 'छिरिङ तामाङ',
    wardNumber: 3, fiscalYear: '२०८१/०८२', renewalDateBs: '२०८१-०४-१५',
    annualFeeNPR: 3_500, fineNPR: 500, totalPaidNPR: 4_000,
    paymentGateway: 'KHALTI', receiptNo: 'P5-BIZ-2081-003', renewedByOfficer: 'सुरेन्द्र श्रेष्ठ',
  },
];

const SEED_INSPECTIONS: BusinessInspectionRecord[] = [
  {
    id: 'ins-001', businessId: 'biz-001', registrationNo: 'पाँ.था./व्य.दर्ता/२०७९-०१',
    businessName: 'थाङपालधाप किराना तथा जनरल स्टोर', wardNumber: 1,
    inspectionDateBs: '२०८१-०२-१५', inspectionType: 'नियमित वार्षिक',
    inspectorName: 'कमल थापा', inspectorDesignation: 'राजस्व निरीक्षक',
    complianceStatus: 'अनुपालन सम्पन्न ✅',
    remarks: 'व्यापार सञ्चालन सन्तोषजनक। स्वच्छता मापदण्ड पालना भएको। अगलबगी सुरक्षा उपकरण राखिएको।',
  },
  {
    id: 'ins-002', businessId: 'biz-002', registrationNo: 'पाँ.था./व्य.दर्ता/२०७९-०२',
    businessName: 'याङ्ग्री लज एण्ड होमस्टे', wardNumber: 2,
    inspectionDateBs: '२०८१-०१-२०', inspectionType: 'नियमित वार्षिक',
    inspectorName: 'विदुर लामिछाने', inspectorDesignation: 'राजस्व निरीक्षक',
    complianceStatus: 'अनुपालन सम्पन्न ✅',
    remarks: 'पर्यटन सेवा मापदण्ड पालना। DoT नवीकरण प्रमाण पेश। अग्नि सुरक्षा उपकरण राखिएको।',
  },
  {
    id: 'ins-003', businessId: 'biz-005', registrationNo: 'पाँ.था./व्य.दर्ता/२०८०-०५',
    businessName: 'पाँचपोखरी स्वास्थ्य क्लिनिक तथा फार्मेसी', wardNumber: 5,
    inspectionDateBs: '२०८१-०१-०५', inspectionType: 'विशेष तथा उजुरीमा',
    inspectorName: 'रमेश बुढाथोकी', inspectorDesignation: 'स्वास्थ्य निरीक्षक',
    complianceStatus: 'अनुपालन सम्पन्न ✅',
    remarks: 'DDA अनुमति नवीकरण भएको। DCDA दर्ता वैध। Cold chain व्यवस्था ठीक।',
  },
  {
    id: 'ins-004', businessId: 'biz-007', registrationNo: 'पाँ.था./व्य.दर्ता/२०७८-०७',
    businessName: 'थाङपाल ट्रान्सपोर्ट तथा ढुवानी सेवा', wardNumber: 6,
    inspectionDateBs: '२०८०-१२-२५', inspectionType: 'नियमित वार्षिक',
    inspectorName: 'गणेश थापा', inspectorDesignation: 'राजस्व निरीक्षक',
    complianceStatus: 'सुधारको सुचना दिइएको ⚠️',
    remarks: 'नवीकरण बाँकी भएकाले सुधार सूचना दिइएको। चालु आवभित्र नवीकरण नगरे दण्ड लगाइने।',
    followUpDateBs: '२०८२-०१-३१',
  },
];

// ── Local Storage Keys ────────────────────────────────────────────────────────
const LS_BUSINESSES = 'biz_businesses_v1';
const LS_RENEWALS = 'biz_renewals_v1';
const LS_INSPECTIONS = 'biz_inspections_v1';

const getFromLS = <T>(key: string, seed: T[]): T[] => {
  const stored = localStorage.getItem(key);
  if (!stored) {
    localStorage.setItem(key, JSON.stringify(seed));
    return seed;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return seed;
  }
};

const saveToLS = <T>(key: string, data: T[]) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// ── Business API Layer ────────────────────────────────────────────────────────
export const businessApi = {
  async getAll(): Promise<Business[]> {
    try {
      const res: any = await api.get('/businesses');
      const data = res?.data ?? res;
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    } catch (e) {
      console.warn('API /businesses failed, using localStorage', e);
    }
    return getFromLS(LS_BUSINESSES, SEED_BUSINESSES);
  },

  async create(data: Partial<Business>): Promise<Business> {
    const existing = await this.getAll();
    const fee = calculateAnnualFee(data.capitaInvestmentNPR || 0);
    const newBiz: Business = {
      id: `biz-${Date.now()}`,
      registrationNo: `पाँ.था./व्य.दर्ता/२०८१-${String(existing.length + 1).padStart(2, '0')}`,
      businessName: data.businessName || '',
      businessNameEn: data.businessNameEn,
      proprietorName: data.proprietorName || '',
      proprietorPhone: data.proprietorPhone,
      proprietorCitizenshipNo: data.proprietorCitizenshipNo,
      panNumber: data.panNumber,
      vatNumber: data.vatNumber,
      category: data.category || BUSINESS_CATEGORIES[0],
      subCategory: data.subCategory,
      wardNumber: Number(data.wardNumber || 1),
      tole: data.tole,
      capitaInvestmentNPR: Number(data.capitaInvestmentNPR || 0),
      employeeCount: Number(data.employeeCount || 0),
      femaleEmployeeCount: Number(data.femaleEmployeeCount || 0),
      registrationDateBs: '२०८१-०५-०१',
      renewalDueDateBs: '२०८२-०३-३१',
      annualFeeNPR: fee,
      status: 'दर्ता सम्पन्न',
      paymentStatus: 'भुक्तानी सम्पन्न',
      lastReceiptNo: `P5-BIZ-NEW-${Date.now().toString().slice(-4)}`,
      environmentalStatus: 'प्रभाव नगर्ने (Green)',
    };
    try {
      await api.post('/businesses', {
        business_name: newBiz.businessName,
        proprietor_name: newBiz.proprietorName,
        category: newBiz.category,
        ward_number: newBiz.wardNumber,
        capital_investment_npr: newBiz.capitaInvestmentNPR,
        annual_fee_npr: fee,
      });
    } catch (e) {
      console.warn('API POST /businesses failed, saving locally', e);
    }
    const updated = [newBiz, ...existing];
    saveToLS(LS_BUSINESSES, updated);
    return newBiz;
  },

  async renew(id: string, officerName: string): Promise<void> {
    const all = await this.getAll();
    const biz = all.find((b) => b.id === id);
    if (!biz) return;

    const updated = all.map((b) =>
      b.id === id
        ? {
            ...b,
            status: 'নवীকৃত' as Business['status'],
            lastRenewalDateBs: '२०८१-०५-०१',
            renewalDueDateBs: '२०८२-०३-३१',
            paymentStatus: 'भुक्तानी सम्पन्न' as Business['paymentStatus'],
            lastReceiptNo: `P5-BIZ-REN-${Date.now().toString().slice(-4)}`,
            lastPaymentGateway: 'CASH',
          }
        : b
    );
    saveToLS(LS_BUSINESSES, updated);

    const renewals = getFromLS(LS_RENEWALS, SEED_RENEWALS);
    const newRenewal: BusinessRenewalRecord = {
      id: `ren-${Date.now()}`,
      businessId: id,
      registrationNo: biz.registrationNo,
      businessName: biz.businessName,
      proprietorName: biz.proprietorName,
      wardNumber: biz.wardNumber,
      fiscalYear: '२०८१/०८२',
      renewalDateBs: '२०८१-०५-०१',
      annualFeeNPR: biz.annualFeeNPR,
      fineNPR: biz.fineNPR || 0,
      totalPaidNPR: biz.annualFeeNPR + (biz.fineNPR || 0),
      paymentGateway: 'CASH',
      receiptNo: `P5-BIZ-REN-${Date.now().toString().slice(-4)}`,
      renewedByOfficer: officerName || 'वडा सचिव / राजस्व अधिकृत',
    };
    saveToLS(LS_RENEWALS, [newRenewal, ...renewals]);
  },

  async suspend(id: string, reason: string): Promise<void> {
    const all = await this.getAll();
    const updated = all.map((b) =>
      b.id === id ? { ...b, status: 'निलम्बित' as Business['status'] } : b
    );
    saveToLS(LS_BUSINESSES, updated);
  },

  async cancel(id: string, reason: string): Promise<void> {
    const all = await this.getAll();
    const updated = all.map((b) =>
      b.id === id ? { ...b, status: 'रद्द' as Business['status'] } : b
    );
    saveToLS(LS_BUSINESSES, updated);
  },

  async getRenewals(): Promise<BusinessRenewalRecord[]> {
    return getFromLS(LS_RENEWALS, SEED_RENEWALS);
  },

  async getInspections(): Promise<BusinessInspectionRecord[]> {
    return getFromLS(LS_INSPECTIONS, SEED_INSPECTIONS);
  },

  async addInspection(data: Partial<BusinessInspectionRecord>): Promise<BusinessInspectionRecord> {
    const all = getFromLS(LS_INSPECTIONS, SEED_INSPECTIONS);
    const newRecord: BusinessInspectionRecord = {
      id: `ins-${Date.now()}`,
      businessId: data.businessId || '',
      registrationNo: data.registrationNo || '',
      businessName: data.businessName || '',
      wardNumber: data.wardNumber || 1,
      inspectionDateBs: data.inspectionDateBs || '२०८१-०५-०१',
      inspectionType: data.inspectionType || 'नियमित वार्षिक',
      inspectorName: data.inspectorName || '',
      inspectorDesignation: data.inspectorDesignation || 'राजस्व निरीक्षक',
      complianceStatus: data.complianceStatus || 'अनुपालन सम्पन्न ✅',
      remarks: data.remarks || '',
      followUpDateBs: data.followUpDateBs,
    };
    saveToLS(LS_INSPECTIONS, [newRecord, ...all]);
    return newRecord;
  },

  async getStats(): Promise<BusinessStats> {
    const businesses = await this.getAll();
    const renewals = await this.getRenewals();

    const totalRegistered = businesses.length;
    const activeCount = businesses.filter((b) => b.status !== 'रद्द' && b.status !== 'निलम्बित').length;
    const renewedCount = businesses.filter((b) => b.status === 'नवीकृत').length;
    const pendingRenewalCount = businesses.filter((b) => b.status === 'नवीकरण बाँकी').length;
    const suspendedCount = businesses.filter((b) => b.status === 'निलम्बित').length;
    const cancelledCount = businesses.filter((b) => b.status === 'रद्द').length;

    const totalCapitalInvestedNPR = businesses.reduce((s, b) => s + (b.capitaInvestmentNPR || 0), 0);
    const totalEmployeeCount = businesses.reduce((s, b) => s + (b.employeeCount || 0), 0);
    const totalRevenueThisFyNPR = renewals.reduce((s, r) => s + (r.totalPaidNPR || 0), 0);

    const categoryBreakdown: Record<string, number> = {};
    const wardBreakdown: Record<string, number> = {};
    for (let w = 1; w <= 8; w++) wardBreakdown[`वडा ${w}`] = 0;

    businesses.forEach((b) => {
      categoryBreakdown[b.category] = (categoryBreakdown[b.category] || 0) + 1;
      const wk = `वडा ${b.wardNumber}`;
      wardBreakdown[wk] = (wardBreakdown[wk] || 0) + 1;
    });

    return {
      totalRegistered,
      activeCount,
      renewedCount,
      pendingRenewalCount,
      suspendedCount,
      cancelledCount,
      totalCapitalInvestedNPR,
      totalEmployeeCount,
      totalRevenueThisFyNPR,
      categoryBreakdown,
      wardBreakdown,
    };
  },
};
