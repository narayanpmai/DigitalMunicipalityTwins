import { api } from './client';

export interface Beneficiary {
  id: string;
  beneficiaryId: string;
  fullName: string;
  fullNameEn?: string;
  citizenshipNo: string;
  nationalIdNo?: string;
  gender: string;
  dateOfBirthBs: string;
  wardNumber: number;
  tole?: string;
  phone?: string;
  category: string;
  monthlyAllowanceNPR: number;
  quarterlyAllowanceNPR: number;
  bankName: string;
  bankAccountNumber: string;
  bankBranch?: string;
  guardianName?: string;
  guardianPhone?: string;
  fiscalYear: string;
  status: 'सक्रिय' | 'नवीकृत' | 'लगत कट्टा' | 'प्रमाणीकरण बाँकी';
  renewalDateBs?: string;
  lastLifeVerificationDateBs?: string;
  verificationMethod?: 'बायोमेट्रिक (Biometric)' | 'भौतिक उपस्थिति (Physical)' | 'घरदैलो घुम्ती सेवा (Mobile)';
  dropoutReason?: string;
  dropoutDateBs?: string;
}

export interface QuarterlyPayroll {
  id: string;
  fiscalYear: string;
  quarter: 'प्रथम किस्ता (साउन-असोज)' | 'दोस्रो किस्ता (कात्तिक-पुस)' | 'तेस्रो किस्ता (माघ-चैत)' | 'चौथो किस्ता (वैशाख-असार)';
  quarterCode: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  bankName: string;
  bankBranch: string;
  totalBeneficiaries: number;
  totalAmountNPR: number;
  adviceLetterNo: string;
  disbursementDateBs: string;
  status: 'तयार (Draft)' | 'निकासा आदेश जारी (Approved)' | 'बैंकमा पठाइएको (Transferred)';
  wardWiseSummary: {
    wardNumber: number;
    beneficiaryCount: number;
    amountNPR: number;
  }[];
}

export interface LifeVerificationRecord {
  id: string;
  beneficiaryId: string;
  fullName: string;
  wardNumber: number;
  category: string;
  fiscalYear: string;
  verificationDateBs: string;
  verificationMethod: 'बायोमेट्रिक (Biometric)' | 'भौतिक उपस्थिति (Physical)' | 'घरदैलो घुम्ती सेवा (Mobile)';
  verifiedByOfficer: string;
  verificationStatus: 'सम्पन्न (Verified)' | 'विचाराधीन (Pending)' | 'अनुपस्थित (Absent)';
  remarks?: string;
  biometricMatched: boolean;
}

export interface VitalEventLinkage {
  id: string;
  eventType: 'जन्म दर्ता (Birth)' | 'मृत्यु दर्ता (Death)' | 'विवाह दर्ता (Marriage)' | 'बसाइँसराइ (Migration)';
  registrationNo: string;
  personName: string;
  wardNumber: number;
  eventDateBs: string;
  ssisAction: 'पोषण भत्ता सिफारिस' | 'लगत कट्टा अलर्ट' | 'एकल महिला वर्ग अद्यावधिक' | 'ठेगाना स्थानान्तरण';
  appliedStatus: 'स्वतः सिफारिस गरिएको' | 'कारबाही सम्पन्न' | 'प्रतीक्षारत';
}

export interface SsisSummary {
  totalBeneficiaries: number;
  activeCount: number;
  renewedCount: number;
  pendingRenewalCount: number;
  cancelledCount: number;
  totalQuarterlyBudgetNPR: number;
  totalAnnualBudgetNPR: number;
  categoryBreakdown: Record<string, number>;
  wardBreakdown: Record<string, number>;
}

export const CATEGORY_RATES: Record<string, number> = {
  'जेष्ठ नागरिक (६८ वर्ष माथि)': 4000,
  'जेष्ठ नागरिक दलित (६० वर्ष माथि)': 2660,
  'एकल महिला / विधवा (६० वर्ष माथि)': 2660,
  'पूर्ण अपाङ्गता (क वर्ग - रातो कार्ड)': 3990,
  'अति अशक्त अपाङ्गता (ख वर्ग - नीलो कार्ड)': 2128,
  'बालबालिका पोषण भत्ता (५ वर्ष मुनि)': 532,
  'लोपोन्मुख आदिवासी / जनजाति': 3990,
};

const SEED_BENEFICIARIES: Beneficiary[] = [
  {
    id: 'ssis-001',
    beneficiaryId: 'SSIS-2081-W01-001',
    fullName: 'पेम्बा दोर्जे तामाङ',
    fullNameEn: 'PEMBA DORJE TAMANG',
    citizenshipNo: '२३-०१-२८-००१४२',
    nationalIdNo: 'NID-98214401',
    gender: 'पुरुष',
    dateOfBirthBs: '२०१२-०२-१४',
    wardNumber: 1,
    tole: 'भोटेनाम्लाङ बजार',
    phone: '9841223344',
    category: 'जेष्ठ नागरिक (६८ वर्ष माथि)',
    monthlyAllowanceNPR: 4000,
    quarterlyAllowanceNPR: 12000,
    bankName: 'राष्ट्रिय वाणिज्य बैंक लि.',
    bankAccountNumber: '1090100023412',
    bankBranch: 'थाङपालधाप शाखा',
    guardianName: 'ल्हाक्पा तामाङ (छोरा)',
    guardianPhone: '9841556677',
    fiscalYear: '२०८१/०८२',
    status: 'नवीकृत',
    renewalDateBs: '२०८१-०४-०५',
    lastLifeVerificationDateBs: '२०८१-०४-०५',
    verificationMethod: 'बायोमेट्रिक (Biometric)',
  },
  {
    id: 'ssis-002',
    beneficiaryId: 'SSIS-2081-W02-002',
    fullName: 'डोल्मा शेर्पा',
    fullNameEn: 'DOLMA SHERPA',
    citizenshipNo: '२३-०१-३०-००५८१',
    nationalIdNo: 'NID-98214402',
    gender: 'महिला',
    dateOfBirthBs: '२०१६-०८-१०',
    wardNumber: 2,
    tole: 'बरुवा डाँडा',
    phone: '9861998822',
    category: 'एकल महिला / विधवा (६० वर्ष माथि)',
    monthlyAllowanceNPR: 2660,
    quarterlyAllowanceNPR: 7980,
    bankName: 'कृषि विकास बैंक लि.',
    bankAccountNumber: '0412800991823',
    bankBranch: 'मेलम्ची शाखा',
    guardianName: 'दावा शेर्पा (छोरी)',
    fiscalYear: '२०८१/०८२',
    status: 'नवीकृत',
    renewalDateBs: '२०८१-०४-१२',
    lastLifeVerificationDateBs: '२०८१-०४-१२',
    verificationMethod: 'भौतिक उपस्थिति (Physical)',
  },
  {
    id: 'ssis-003',
    beneficiaryId: 'SSIS-2081-W03-003',
    fullName: 'कामी सिँह वि.क.',
    fullNameEn: 'KAMI SINGH B.K.',
    citizenshipNo: '२३-०१-३५-००९२१',
    gender: 'पुरुष',
    dateOfBirthBs: '२०१९-११-२३',
    wardNumber: 3,
    tole: 'थाङपालकोट टोल',
    phone: '9813445566',
    category: 'जेष्ठ नागरिक दलित (६० वर्ष माथि)',
    monthlyAllowanceNPR: 2660,
    quarterlyAllowanceNPR: 7980,
    bankName: 'राष्ट्रिय वाणिज्य बैंक लि.',
    bankAccountNumber: '1090100034567',
    bankBranch: 'थाङपालधाप शाखा',
    guardianName: 'सुर्य बहादुर वि.क.',
    fiscalYear: '२०८१/०८२',
    status: 'नवीकृत',
    renewalDateBs: '२०८१-०४-२०',
    lastLifeVerificationDateBs: '२०८१-०४-२०',
    verificationMethod: 'बायोमेट्रिक (Biometric)',
  },
  {
    id: 'ssis-004',
    beneficiaryId: 'SSIS-2081-W04-004',
    fullName: 'निमा याङ्जी तामाङ',
    fullNameEn: 'NIMA YANGJI TAMANG',
    citizenshipNo: '२३-०१-४०-०१४३२',
    gender: 'महिला',
    dateOfBirthBs: '२०५५-०३-१५',
    wardNumber: 4,
    tole: 'थाङपालधाप बेसी',
    phone: '9801223399',
    category: 'पूर्ण अपाङ्गता (क वर्ग - रातो कार्ड)',
    monthlyAllowanceNPR: 3990,
    quarterlyAllowanceNPR: 11970,
    bankName: 'राष्ट्रिय वाणिज्य बैंक लि.',
    bankAccountNumber: '1090100078912',
    bankBranch: 'थाङपालधाप शाखा',
    guardianName: 'छिरिङ तामाङ (दाजु)',
    guardianPhone: '9841887766',
    fiscalYear: '२०८१/०८२',
    status: 'नवीकृत',
    renewalDateBs: '२०८१-०४-२५',
    lastLifeVerificationDateBs: '२०८१-०४-२५',
    verificationMethod: 'घरदैलो घुम्ती सेवा (Mobile)',
  },
  {
    id: 'ssis-005',
    beneficiaryId: 'SSIS-2081-W05-005',
    fullName: 'आर्यन तामाङ (अभिभावक: सुनिता तामाङ)',
    fullNameEn: 'AARYAN TAMANG',
    citizenshipNo: 'जन्म दर्ता: २०८००१०२',
    gender: 'पुरुष',
    dateOfBirthBs: '२०७९-०६-१२',
    wardNumber: 5,
    tole: 'गुन्सा गाउँ',
    phone: '9841009988',
    category: 'बालबालिका पोषण भत्ता (५ वर्ष मुनि)',
    monthlyAllowanceNPR: 532,
    quarterlyAllowanceNPR: 1596,
    bankName: 'राष्ट्रिय वाणिज्य बैंक लि.',
    bankAccountNumber: '1090100099881',
    bankBranch: 'थाङपालधाप शाखा',
    guardianName: 'सुनिता तामाङ (आमा)',
    guardianPhone: '9841009988',
    fiscalYear: '२०८१/०८२',
    status: 'सक्रिय',
    renewalDateBs: '२०८१-०४-०१',
    lastLifeVerificationDateBs: '२०८१-०४-०१',
    verificationMethod: 'भौतिक उपस्थिति (Physical)',
  },
  {
    id: 'ssis-006',
    beneficiaryId: 'SSIS-2081-W06-006',
    fullName: 'सानुकान्छा तामाङ',
    fullNameEn: 'SANUKANCHHA TAMANG',
    citizenshipNo: '२३-०१-२६-०००८९',
    gender: 'पुरुष',
    dateOfBirthBs: '२००८-०१-०५',
    wardNumber: 6,
    tole: 'भोताङ मानेडाँडा',
    category: 'जेष्ठ नागरिक (६८ वर्ष माथि)',
    monthlyAllowanceNPR: 4000,
    quarterlyAllowanceNPR: 12000,
    bankName: 'राष्ट्रिय वाणिज्य बैंक लि.',
    bankAccountNumber: '1090100045612',
    bankBranch: 'थाङपालधाप शाखा',
    fiscalYear: '२०८१/०८२',
    status: 'प्रमाणीकरण बाँकी',
    renewalDateBs: '२०८०-०४-०१',
  },
  {
    id: 'ssis-007',
    beneficiaryId: 'SSIS-2081-W07-007',
    fullName: 'फुर्पा लामा',
    fullNameEn: 'PHURPA LAMA',
    citizenshipNo: '२३-०१-३२-००६६१',
    gender: 'पुरुष',
    dateOfBirthBs: '२०१४-०५-१८',
    wardNumber: 7,
    tole: 'याङ्ग्री गाउँ',
    category: 'जेष्ठ नागरिक (६८ वर्ष माथि)',
    monthlyAllowanceNPR: 4000,
    quarterlyAllowanceNPR: 12000,
    bankName: 'राष्ट्रिय वाणिज्य बैंक लि.',
    bankAccountNumber: '1090100011223',
    bankBranch: 'थाङपालधाप शाखा',
    fiscalYear: '२०८१/०८२',
    status: 'लगत कट्टा',
    dropoutReason: 'स्वर्गारोहण भएको (मृत्यु दर्ता नं. २०८१०२११)',
    dropoutDateBs: '२०८१-०३-१५',
  },
];

const SEED_PAYROLLS: QuarterlyPayroll[] = [
  {
    id: 'payroll-q1',
    fiscalYear: '२०८१/०८२',
    quarter: 'प्रथम किस्ता (साउन-असोज)',
    quarterCode: 'Q1',
    bankName: 'राष्ट्रिय वाणिज्य बैंक लि.',
    bankBranch: 'थाङपालधाप शाखा',
    totalBeneficiaries: 1240,
    totalAmountNPR: 11486400,
    adviceLetterNo: 'पाँ.था./सा.सु./०८१-८२/१२४',
    disbursementDateBs: '२०८१-०६-२५',
    status: 'बैंकमा पठाइएको (Transferred)',
    wardWiseSummary: [
      { wardNumber: 1, beneficiaryCount: 165, amountNPR: 1540000 },
      { wardNumber: 2, beneficiaryCount: 142, amountNPR: 1320000 },
      { wardNumber: 3, beneficiaryCount: 180, amountNPR: 1680000 },
      { wardNumber: 4, beneficiaryCount: 195, amountNPR: 1812000 },
      { wardNumber: 5, beneficiaryCount: 138, amountNPR: 1275000 },
      { wardNumber: 6, beneficiaryCount: 154, amountNPR: 1420000 },
      { wardNumber: 7, beneficiaryCount: 136, amountNPR: 1259400 },
      { wardNumber: 8, beneficiaryCount: 130, amountNPR: 1180000 },
    ],
  },
  {
    id: 'payroll-q2',
    fiscalYear: '२०८१/०८२',
    quarter: 'दोस्रो किस्ता (कात्तिक-पुस)',
    quarterCode: 'Q2',
    bankName: 'राष्ट्रिय वाणिज्य बैंक लि.',
    bankBranch: 'थाङपालधाप शाखा',
    totalBeneficiaries: 1255,
    totalAmountNPR: 11624800,
    adviceLetterNo: 'पाँ.था./सा.सु./०८१-८२/२८९',
    disbursementDateBs: '२०८१-०९-२०',
    status: 'बैंकमा पठाइएको (Transferred)',
    wardWiseSummary: [
      { wardNumber: 1, beneficiaryCount: 167, amountNPR: 1558000 },
      { wardNumber: 2, beneficiaryCount: 145, amountNPR: 1342000 },
      { wardNumber: 3, beneficiaryCount: 182, amountNPR: 1698000 },
      { wardNumber: 4, beneficiaryCount: 198, amountNPR: 1834000 },
      { wardNumber: 5, beneficiaryCount: 140, amountNPR: 1290000 },
      { wardNumber: 6, beneficiaryCount: 155, amountNPR: 1432000 },
      { wardNumber: 7, beneficiaryCount: 137, amountNPR: 1270800 },
      { wardNumber: 8, beneficiaryCount: 131, amountNPR: 1200000 },
    ],
  },
  {
    id: 'payroll-q3',
    fiscalYear: '२०८१/०८२',
    quarter: 'तेस्रो किस्ता (माघ-चैत)',
    quarterCode: 'Q3',
    bankName: 'राष्ट्रिय वाणिज्य बैंक लि.',
    bankBranch: 'थाङपालधाप शाखा',
    totalBeneficiaries: 1262,
    totalAmountNPR: 11710500,
    adviceLetterNo: 'पाँ.था./सा.सु./०८१-८२/४१२',
    disbursementDateBs: '२०८१-१२-२२',
    status: 'निकासा आदेश जारी (Approved)',
    wardWiseSummary: [
      { wardNumber: 1, beneficiaryCount: 168, amountNPR: 1570000 },
      { wardNumber: 2, beneficiaryCount: 146, amountNPR: 1350000 },
      { wardNumber: 3, beneficiaryCount: 184, amountNPR: 1715000 },
      { wardNumber: 4, beneficiaryCount: 199, amountNPR: 1845000 },
      { wardNumber: 5, beneficiaryCount: 141, amountNPR: 1300500 },
      { wardNumber: 6, beneficiaryCount: 156, amountNPR: 1445000 },
      { wardNumber: 7, beneficiaryCount: 137, amountNPR: 1275000 },
      { wardNumber: 8, beneficiaryCount: 131, amountNPR: 1210000 },
    ],
  },
  {
    id: 'payroll-q4',
    fiscalYear: '२०८१/०८२',
    quarter: 'चौथो किस्ता (वैशाख-असार)',
    quarterCode: 'Q4',
    bankName: 'राष्ट्रिय वाणिज्य बैंक लि.',
    bankBranch: 'थाङपालधाप शाखा',
    totalBeneficiaries: 1270,
    totalAmountNPR: 11800000,
    adviceLetterNo: 'पाँ.था./सा.सु./०८१-८२/मस्यौदा',
    disbursementDateBs: '२०८२-०३-१५',
    status: 'तयार (Draft)',
    wardWiseSummary: [
      { wardNumber: 1, beneficiaryCount: 170, amountNPR: 1585000 },
      { wardNumber: 2, beneficiaryCount: 147, amountNPR: 1360000 },
      { wardNumber: 3, beneficiaryCount: 185, amountNPR: 1728000 },
      { wardNumber: 4, beneficiaryCount: 200, amountNPR: 1860000 },
      { wardNumber: 5, beneficiaryCount: 142, amountNPR: 1310000 },
      { wardNumber: 6, beneficiaryCount: 157, amountNPR: 1455000 },
      { wardNumber: 7, beneficiaryCount: 138, amountNPR: 1282000 },
      { wardNumber: 8, beneficiaryCount: 131, amountNPR: 1220000 },
    ],
  },
];

const SEED_LIFE_VERIFICATIONS: LifeVerificationRecord[] = [
  {
    id: 'lv-01',
    beneficiaryId: 'SSIS-2081-W01-001',
    fullName: 'पेम्बा दोर्जे तामाङ',
    wardNumber: 1,
    category: 'जेष्ठ नागरिक (६८ वर्ष माथि)',
    fiscalYear: '२०८१/०८२',
    verificationDateBs: '२०८१-०४-०५',
    verificationMethod: 'बायोमेट्रिक (Biometric)',
    verifiedByOfficer: 'सुरेन्द्र श्रेष्ठ (वडा सचिव)',
    verificationStatus: 'सम्पन्न (Verified)',
    biometricMatched: true,
    remarks: 'दायाँ बुढी औंठाछाप मिलान भई नवीकरण सम्पन्न।',
  },
  {
    id: 'lv-02',
    beneficiaryId: 'SSIS-2081-W02-002',
    fullName: 'डोल्मा शेर्पा',
    wardNumber: 2,
    category: 'एकल महिला / विधवा (६० वर्ष माथि)',
    fiscalYear: '२०८१/०८२',
    verificationDateBs: '२०८१-०४-१२',
    verificationMethod: 'भौतिक उपस्थिति (Physical)',
    verifiedByOfficer: 'कमल थापा (सहायक कम्प्युटर अपरेटर)',
    verificationStatus: 'सम्पन्न (Verified)',
    biometricMatched: true,
    remarks: 'सशर्त एकल महिला फारम रुजु गरी नवीकरण गरिएको।',
  },
  {
    id: 'lv-03',
    beneficiaryId: 'SSIS-2081-W04-004',
    fullName: 'निमा याङ्जी तामाङ',
    wardNumber: 4,
    category: 'पूर्ण अपाङ्गता (क वर्ग - रातो कार्ड)',
    fiscalYear: '२०८१/०८२',
    verificationDateBs: '२०८१-०४-२५',
    verificationMethod: 'घरदैलो घुम्ती सेवा (Mobile)',
    verifiedByOfficer: 'दिनेश घिमिरे (सामाजिक परिचालक)',
    verificationStatus: 'सम्पन्न (Verified)',
    biometricMatched: false,
    remarks: 'अशक्तताका कारण घरमै पुगेर प्रत्यक्ष प्रमाणीकरण गरिएको।',
  },
  {
    id: 'lv-04',
    beneficiaryId: 'SSIS-2081-W06-006',
    fullName: 'सानुकान्छा तामाङ',
    wardNumber: 6,
    category: 'जेष्ठ नागरिक (६८ वर्ष माथि)',
    fiscalYear: '२०८१/०८२',
    verificationDateBs: '२०८१-०५-०१',
    verificationMethod: 'भौतिक उपस्थिति (Physical)',
    verifiedByOfficer: 'विदुर लामिछाने (वडा सचिव)',
    verificationStatus: 'विचाराधीन (Pending)',
    biometricMatched: false,
    remarks: 'जीवित रहेको जानकारी प्राप्त तर हस्ताक्षर/औंठाछाप रुजु बाँकी।',
  },
];

const SEED_VITAL_EVENTS: VitalEventLinkage[] = [
  {
    id: 've-01',
    eventType: 'जन्म दर्ता (Birth)',
    registrationNo: '०२३-०८१-०१-०००८९',
    personName: 'आरभ तामाङ',
    wardNumber: 1,
    eventDateBs: '२०८१-०३-१५',
    ssisAction: 'पोषण भत्ता सिफारिस',
    appliedStatus: 'कारबाही सम्पन्न',
  },
  {
    id: 've-02',
    eventType: 'मृत्यु दर्ता (Death)',
    registrationNo: '०२३-०८१-०७-०००३४',
    personName: 'फुर्पा लामा',
    wardNumber: 7,
    eventDateBs: '२०८१-०३-१५',
    ssisAction: 'लगत कट्टा अलर्ट',
    appliedStatus: 'कारबाही सम्पन्न',
  },
  {
    id: 've-03',
    eventType: 'विवाह दर्ता (Marriage)',
    registrationNo: '०२३-०८१-०३-०००५६',
    personName: 'अनिता तामाङ',
    wardNumber: 3,
    eventDateBs: '२०८१-०४-०२',
    ssisAction: 'एकल महिला वर्ग अद्यावधिक',
    appliedStatus: 'प्रतीक्षारत',
  },
];

const LS_BENEFICIARIES = 'ssis_beneficiaries_v1';
const LS_PAYROLLS = 'ssis_payrolls_v1';
const LS_LIFE_VERIFICATIONS = 'ssis_life_verifications_v1';
const LS_VITAL_EVENTS = 'ssis_vital_events_v1';

export const socialSecurityApi = {
  async getBeneficiaries(): Promise<Beneficiary[]> {
    try {
      const res: any = await api.get('/social-security');
      const data = res?.data || res;
      if (Array.isArray(data) && data.length > 0) {
        return data.map((b: any) => ({
          id: String(b.id || b.beneficiary_id),
          beneficiaryId: b.beneficiary_id || b.beneficiaryId,
          fullName: b.full_name || b.fullName,
          fullNameEn: b.full_name_en || b.fullNameEn,
          citizenshipNo: b.citizenship_or_nid_no || b.citizenshipNo,
          nationalIdNo: b.nationalIdNo,
          gender: b.gender || 'अन्य',
          dateOfBirthBs: b.date_of_birth_bs || b.dateOfBirthBs,
          wardNumber: Number(b.ward_number || b.wardNumber || 1),
          tole: b.tole_village || b.tole,
          phone: b.contact_phone || b.phone,
          category: b.category,
          monthlyAllowanceNPR: Number(b.monthly_allowance_npr || b.monthlyAllowanceNPR || CATEGORY_RATES[b.category] || 4000),
          quarterlyAllowanceNPR: Number(b.quarterly_allowance_npr || b.quarterlyAllowanceNPR || 12000),
          bankName: b.bank_name || b.bankName || 'राष्ट्रिय वाणिज्य बैंक लि.',
          bankAccountNumber: b.bank_account_no || b.bankAccountNumber || '-',
          bankBranch: b.bankBranch || 'थाङपालधाप शाखा',
          guardianName: b.guardian_name || b.guardianName,
          guardianPhone: b.guardianPhone,
          fiscalYear: b.fiscal_year || b.fiscalYear || '२०८१/०८२',
          status: (b.status === 'कट्टा' ? 'लगत कट्टा' : b.status) || 'सक्रिय',
          renewalDateBs: b.renewal_date_bs || b.renewalDateBs,
          lastLifeVerificationDateBs: b.renewal_date_bs,
          verificationMethod: 'बायोमेट्रिक (Biometric)',
        }));
      }
    } catch (e) {
      console.warn('API /social-security call failed, using localStorage cache', e);
    }

    const stored = localStorage.getItem(LS_BENEFICIARIES);
    if (!stored) {
      localStorage.setItem(LS_BENEFICIARIES, JSON.stringify(SEED_BENEFICIARIES));
      return SEED_BENEFICIARIES;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return SEED_BENEFICIARIES;
    }
  },

  async createBeneficiary(data: Partial<Beneficiary>): Promise<Beneficiary> {
    const monthly = CATEGORY_RATES[data.category || ''] || data.monthlyAllowanceNPR || 4000;
    const quarterly = monthly * 3;
    const newBeneficiary: Beneficiary = {
      id: `ssis-${Date.now()}`,
      beneficiaryId: data.beneficiaryId || `SSIS-2081-W0${data.wardNumber || 1}-${Math.floor(1000 + Math.random() * 9000)}`,
      fullName: data.fullName || '',
      fullNameEn: data.fullNameEn,
      citizenshipNo: data.citizenshipNo || '',
      nationalIdNo: data.nationalIdNo,
      gender: data.gender || 'अन्य',
      dateOfBirthBs: data.dateOfBirthBs || '',
      wardNumber: Number(data.wardNumber || 1),
      tole: data.tole,
      phone: data.phone,
      category: data.category || 'जेष्ठ नागरिक (६८ वर्ष माथि)',
      monthlyAllowanceNPR: monthly,
      quarterlyAllowanceNPR: quarterly,
      bankName: data.bankName || 'राष्ट्रिय वाणिज्य बैंक लि.',
      bankAccountNumber: data.bankAccountNumber || '',
      bankBranch: data.bankBranch || 'थाङपालधाप शाखा',
      guardianName: data.guardianName,
      guardianPhone: data.guardianPhone,
      fiscalYear: '२०८१/०८२',
      status: 'सक्रिय',
      renewalDateBs: '२०८१-०४-०१',
      lastLifeVerificationDateBs: '२०८१-०४-०१',
      verificationMethod: 'भौतिक उपस्थिति (Physical)',
    };

    // Try remote
    try {
      await api.post('/social-security', {
        beneficiary_id: newBeneficiary.beneficiaryId,
        full_name: newBeneficiary.fullName,
        full_name_en: newBeneficiary.fullNameEn,
        citizenship_or_nid_no: newBeneficiary.citizenshipNo,
        category: newBeneficiary.category,
        ward_number: newBeneficiary.wardNumber,
        tole_village: newBeneficiary.tole,
        gender: newBeneficiary.gender,
        date_of_birth_bs: newBeneficiary.dateOfBirthBs,
        contact_phone: newBeneficiary.phone,
        guardian_name: newBeneficiary.guardianName,
        bank_name: newBeneficiary.bankName,
        bank_account_no: newBeneficiary.bankAccountNumber,
        monthly_allowance_npr: monthly,
        quarterly_allowance_npr: quarterly,
        status: 'सक्रिय',
        fiscal_year: '२०८१/०८२',
      });
    } catch (e) {
      console.warn('API post failed, saving locally', e);
    }

    const current = await this.getBeneficiaries();
    const updated = [newBeneficiary, ...current];
    localStorage.setItem(LS_BENEFICIARIES, JSON.stringify(updated));
    return newBeneficiary;
  },

  async renewBeneficiary(id: string): Promise<void> {
    try {
      await api.put(`/social-security/${id}/renew`);
    } catch (e) {
      console.warn('API renew failed, falling back to local', e);
    }

    const current = await this.getBeneficiaries();
    const updated = current.map((b) =>
      b.id === id || b.beneficiaryId === id
        ? {
            ...b,
            status: 'नवीकृत' as const,
            renewalDateBs: '२०८१-०४-०१',
            lastLifeVerificationDateBs: '२०८१-०४-०१',
          }
        : b
    );
    localStorage.setItem(LS_BENEFICIARIES, JSON.stringify(updated));
  },

  async cancelBeneficiary(id: string, reason: string): Promise<void> {
    try {
      await api.put(`/social-security/${id}/cancel`, { reason });
    } catch (e) {
      console.warn('API cancel failed, falling back to local', e);
    }

    const current = await this.getBeneficiaries();
    const updated = current.map((b) =>
      b.id === id || b.beneficiaryId === id
        ? {
            ...b,
            status: 'लगत कट्टा' as const,
            dropoutReason: reason,
            dropoutDateBs: '२०८१-०४-०१',
          }
        : b
    );
    localStorage.setItem(LS_BENEFICIARIES, JSON.stringify(updated));
  },

  async getQuarterlyPayrolls(): Promise<QuarterlyPayroll[]> {
    const stored = localStorage.getItem(LS_PAYROLLS);
    if (!stored) {
      localStorage.setItem(LS_PAYROLLS, JSON.stringify(SEED_PAYROLLS));
      return SEED_PAYROLLS;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return SEED_PAYROLLS;
    }
  },

  async updatePayrollStatus(id: string, status: QuarterlyPayroll['status']): Promise<void> {
    const list = await this.getQuarterlyPayrolls();
    const updated = list.map((p) => (p.id === id ? { ...p, status } : p));
    localStorage.setItem(LS_PAYROLLS, JSON.stringify(updated));
  },

  async getLifeVerifications(): Promise<LifeVerificationRecord[]> {
    const stored = localStorage.getItem(LS_LIFE_VERIFICATIONS);
    if (!stored) {
      localStorage.setItem(LS_LIFE_VERIFICATIONS, JSON.stringify(SEED_LIFE_VERIFICATIONS));
      return SEED_LIFE_VERIFICATIONS;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return SEED_LIFE_VERIFICATIONS;
    }
  },

  async recordLifeVerification(data: Partial<LifeVerificationRecord>): Promise<LifeVerificationRecord> {
    const list = await this.getLifeVerifications();
    const newRecord: LifeVerificationRecord = {
      id: `lv-${Date.now()}`,
      beneficiaryId: data.beneficiaryId || '',
      fullName: data.fullName || '',
      wardNumber: data.wardNumber || 1,
      category: data.category || 'जेष्ठ नागरिक',
      fiscalYear: '२०८१/०८२',
      verificationDateBs: data.verificationDateBs || '२०८१-०४-०१',
      verificationMethod: data.verificationMethod || 'भौतिक उपस्थिति (Physical)',
      verifiedByOfficer: data.verifiedByOfficer || 'वडा सचिव / पञ्जीकाधिकारी',
      verificationStatus: 'सम्पन्न (Verified)',
      remarks: data.remarks || 'वार्षिक जीवन प्रमाणीकरण स्वीकृत',
      biometricMatched: data.biometricMatched ?? true,
    };
    const updated = [newRecord, ...list];
    localStorage.setItem(LS_LIFE_VERIFICATIONS, JSON.stringify(updated));

    // Also update beneficiary renewal status
    if (data.beneficiaryId) {
      await this.renewBeneficiary(data.beneficiaryId);
    }
    return newRecord;
  },

  async getVitalEvents(): Promise<VitalEventLinkage[]> {
    const stored = localStorage.getItem(LS_VITAL_EVENTS);
    if (!stored) {
      localStorage.setItem(LS_VITAL_EVENTS, JSON.stringify(SEED_VITAL_EVENTS));
      return SEED_VITAL_EVENTS;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return SEED_VITAL_EVENTS;
    }
  },

  async applyVitalEventAction(id: string): Promise<void> {
    const list = await this.getVitalEvents();
    const updated = list.map((v) => (v.id === id ? { ...v, appliedStatus: 'कारबाही सम्पन्न' as const } : v));
    localStorage.setItem(LS_VITAL_EVENTS, JSON.stringify(updated));
  },

  async getSummary(): Promise<SsisSummary> {
    const beneficiaries = await this.getBeneficiaries();
    const totalBeneficiaries = beneficiaries.length;
    const activeCount = beneficiaries.filter((b) => b.status === 'सक्रिय' || b.status === 'नवीकृत').length;
    const renewedCount = beneficiaries.filter((b) => b.status === 'नवीकृत').length;
    const pendingRenewalCount = beneficiaries.filter((b) => b.status === 'प्रमाणीकरण बाँकी' || b.status === 'सक्रिय').length;
    const cancelledCount = beneficiaries.filter((b) => b.status === 'लगत कट्टा').length;

    const totalQuarterlyBudgetNPR = beneficiaries
      .filter((b) => b.status !== 'लगत कट्टा')
      .reduce((sum, b) => sum + (b.quarterlyAllowanceNPR || b.monthlyAllowanceNPR * 3), 0);

    const totalAnnualBudgetNPR = totalQuarterlyBudgetNPR * 4;

    const categoryBreakdown: Record<string, number> = {};
    const wardBreakdown: Record<string, number> = {};

    for (let w = 1; w <= 8; w++) {
      wardBreakdown[`वडा नं. ${w}`] = 0;
    }

    beneficiaries.forEach((b) => {
      categoryBreakdown[b.category] = (categoryBreakdown[b.category] || 0) + 1;
      const wardKey = `वडा नं. ${b.wardNumber}`;
      wardBreakdown[wardKey] = (wardBreakdown[wardKey] || 0) + 1;
    });

    return {
      totalBeneficiaries,
      activeCount,
      renewedCount,
      pendingRenewalCount,
      cancelledCount,
      totalQuarterlyBudgetNPR,
      totalAnnualBudgetNPR,
      categoryBreakdown,
      wardBreakdown,
    };
  },
};
