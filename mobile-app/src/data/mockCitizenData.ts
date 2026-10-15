import { CitizenUser, CitizenApplicationRecord } from '../types';

export const DEMO_CITIZEN_USER: CitizenUser = {
  id: 'CIT-753421',
  fullName: 'राम बहादुर तामाङ',
  fullNameEn: 'Ram Bahadur Tamang',
  phone: '९८४१२३४५६७',
  email: 'ram.tamang@gmail.com',
  citizenshipNo: '२७-०१-७५-०३४२१',
  citizenshipIssuedDistrict: 'सिन्धुपाल्चोक',
  nationalIdNo: '७१२-८९४-३२०-१',
  voterCardNo: 'VOT-९८२४-१२',
  taxpayerPan: '३०४५८९२१२',
  dateOfBirthBs: '२०४२/०४/१५',
  gender: 'पुरुष',
  permanentAddress: {
    province: 'बागमती प्रदेश',
    district: 'सिन्धुपाल्चोक',
    municipality: 'पाँचपोखरी थाङपाल गाउँपालिका',
    wardNo: 3,
    tole: 'मानेखर्क',
    houseNo: '३-२८',
  },
  bloodGroup: 'B +ve',
  emergencyContactName: 'डोल्मा तामाङ (श्रीमती)',
  emergencyContactPhone: '९८१२३४५६७८',
  isKycVerified: true,
  avatarUrl: '',
  householdNo: 'PP-03-0428',
  familyMembersCount: 4,
  taxStatus: 'चुक्ता भएको',
};

export const MOCK_CITIZEN_APPLICATIONS: CitizenApplicationRecord[] = [
  {
    id: 'app-01',
    sifarishName: 'नाता प्रमाणित प्रमाणपत्र (Relationship Verification)',
    applicationNo: 'PP-SIF-२०८१-०४२१',
    appliedDate: '२०८१/०६/०८',
    wardNo: 3,
    status: 'सिफारिस तयार',
    fee: 200,
    qrCodeToken: 'VERIFY-PP-SIF-0421-QR-VALID',
  },
  {
    id: 'app-02',
    sifarishName: 'घरबाटो तथा चारकिल्ला प्रमाणित',
    applicationNo: 'PP-SIF-२०८१-०४८९',
    appliedDate: '२०८१/०६/११',
    wardNo: 3,
    status: 'प्रक्रियामा',
    fee: 300,
    qrCodeToken: 'VERIFY-PP-SIF-0489-QR-PENDING',
  },
  {
    id: 'app-03',
    sifarishName: 'स्थानीय कृषि व्यवसाय दर्ता प्रमाणपत्र',
    applicationNo: 'PP-SIF-२०८१-०३१२',
    appliedDate: '२०८१/०५/२४',
    wardNo: 3,
    status: 'सिफारिस तयार',
    fee: 500,
    qrCodeToken: 'VERIFY-PP-SIF-0312-QR-VALID',
  },
];

export const MOCK_CITIZEN_TAX_HISTORY = [
  {
    fiscalYear: '२०८१/८२',
    taxType: 'सम्पत्ति कर तथा भूमि कर',
    receiptNo: 'मलेप १०२-०८१-०९३४',
    paidAmountRs: 1250,
    discountRs: 125,
    paidDate: '२०८१/०६/०२',
    paymentMethod: 'eSewa Online',
    status: 'चुक्ता' as const,
  },
  {
    fiscalYear: '२०८०/८१',
    taxType: 'सम्पत्ति कर तथा व्यवसाय कर (ह्योल्मो अर्गानिक फार्म)',
    receiptNo: 'मलेप १०२-०८०-१४२३',
    paidAmountRs: 2800,
    discountRs: 280,
    paidDate: '२०८०/०५/२८',
    paymentMethod: 'Fonepay QR',
    status: 'चुक्ता' as const,
  },
];

export const MOCK_DIGITAL_LOCKER_DOCS = [
  {
    id: 'doc-01',
    name: 'नेपाली नागरिकता प्रमाणपत्र (अगाडि / पछाडि)',
    type: 'नागरिकता',
    issuedDate: '२०६०/०५/१२',
    verified: true,
  },
  {
    id: 'doc-02',
    name: 'जग्गाधनी प्रमाण पुर्जा (कित्ता नं २३४, कित्ता नं ५६०)',
    type: 'लालपुर्जा',
    issuedDate: '२०६८/११/०४',
    verified: true,
  },
  {
    id: 'doc-03',
    name: 'राष्ट्रिय परिचयपत्र (NIN डिजिटल प्रति)',
    type: 'NID Card',
    issuedDate: '२०७९/०२/१८',
    verified: true,
  },
];
