export interface BadapatraService {
  id: number;
  type: 'ward' | 'palika';
  category: string;
  title: string;
  price: string;
  serviceTime: string;
  provider: string;
  official: string;
  room: string;
  document: string;
  remarks: string;
}

export interface SifarishTemplate {
  id: string;
  code: string;
  name: string;
  category: string;
  fee: number;
  timeDays: number;
  department: string;
  requiredDocs: string[];
}

export interface TaxAssessment {
  ownerName: string;
  citizenNo: string;
  wardNo: number;
  kittaNo: string;
  taxYear: string;
  propertyTax: number;
  businessTax: number;
  serviceCharge: number;
  fine: number;
  discount: number;
  totalPayable: number;
  status: 'pending' | 'paid';
}

export interface ComplaintData {
  id: string;
  trackingNo: string;
  ward: number;
  category: string;
  title: string;
  description: string;
  name: string;
  phone: string;
  isAnonymous: boolean;
  photoUrl?: string;
  lat?: number;
  lng?: number;
  status: 'दर्ता भएको' | 'कारबाहीमा' | 'समाधान भएको';
  createdAt: string;
}

export interface EmergencyContact {
  id: string;
  title: string;
  number: string;
  category: 'ambulance' | 'police' | 'fire' | 'disaster' | 'official';
  person?: string;
  desc: string;
}

export interface PalikaNotification {
  id: string;
  title: string;
  date: string;
  level: 'urgent' | 'info' | 'notice';
  summary: string;
}

// ─── SMART DOCUMENT SCANNER TYPES ───

export type DocumentFilterType = 'original' | 'magic' | 'bw' | 'grayscale' | 'contrast';

export type DocumentCategory =
  | 'all'
  | 'citizenship'
  | 'lalpurja'
  | 'sifarish'
  | 'darta_chalani'
  | 'tax_receipt'
  | 'building_permit'
  | 'other';

export interface ScannedPage {
  id: string;
  pageNumber: number;
  originalImageUrl: string;
  processedImageUrl: string;
  rotation: number;
  filter: DocumentFilterType;
  brightness: number;
  contrast: number;
  cropCoords?: {
    topLeft: { x: number; y: number };
    topRight: { x: number; y: number };
    bottomRight: { x: number; y: number };
    bottomLeft: { x: number; y: number };
  };
  ocrText?: string;
}

export interface ScannedDocument {
  id: string;
  title: string;
  category: DocumentCategory;
  categoryLabel: string;
  pages: ScannedPage[];
  createdAt: string;
  updatedAt: string;
  tags: string[];
  notes?: string;
  isPasswordProtected?: boolean;
  fileSizeKb?: number;
  ocrExtractedText?: string;
}

export interface OcrResult {
  rawText: string;
  confidence: number;
  language: 'ne' | 'en' | 'mixed';
  entities?: {
    citizenshipNo?: string;
    kittaNo?: string;
    personName?: string;
    wardNo?: string;
    dartaNo?: string;
    chalaniNo?: string;
    amount?: string;
    date?: string;
  };
}

// ─── DYNAMIC HOUSEHOLD SURVEY ENGINE TYPES ───

export interface FamilyMember {
  id: string;
  name: string;
  relation: string; // घरमुली, पति/पत्नी, छोरा, छोरी, बाबु, आमा, आदि
  gender: 'महिला' | 'पुरुष' | 'अन्य';
  age: number;
  education: string; // निरक्षर, सामान्य लेखपढ, एसईई, स्नातक, स्नातकोत्तर
  occupation: string; // कृषि, व्यापार, जागिर, वैदेशिक रोजगारी, विद्यार्थी
  isAbroad: boolean;
  abroadCountry?: string;
}

export interface HouseholdSurveySubmission {
  id: string;
  householdNo: string;
  wardNo: number;
  tole: string;
  headName: string;
  headPhone: string;
  socialGroup: string; // तामाङ, ह्योल्मो, श्रेष्ठ, क्षेत्री/बाहुन, दलित, अन्य
  religion: string;
  membersCount: number;
  familyMembers: FamilyMember[];
  
  // GPS & Building Structure
  gps: {
    lat: number;
    lng: number;
    altitude?: number;
    accuracyMeters?: number;
  };
  houseStructure: string; // पक्की (ढलान), ढुङ्गा-माटो, काठ-टिन, कच्ची
  storeys: number;
  disasterRisk: 'न्यून' | 'मध्यम' | 'उच्च (पहिरो/बाढी)';
  housePhotoUrl?: string;

  // Water, Sanitation & Energy
  waterSource: string; // निजी धारा, सार्वजनिक धारा, मूल/कुवा
  toiletType: string; // फ्लस शौचालय, पक्की खाल्डे, नभएको
  wasteManagement: string; // कम्पोस्ट, पालिका संकलन, जलाउने
  cookingFuel: string; // एलपी ग्यास, दाउरा, बायोग्यास, बिजुली

  // Agriculture & Economy
  landAreaRopani: number;
  livestockCount: number;
  hasRemittance: boolean;
  remittanceAnnualRs?: number;

  // Survey Meta
  enumeratorName: string;
  enumeratorId: string;
  collectedAt: string;
  status: 'draft' | 'pending_sync' | 'synced';
}

// ─── E-LIBRARY TYPES ───

export type LibraryCategory =
  | 'all'
  | 'acts_gazette' // ऐन तथा राजपत्र
  | 'budget_plans' // बजेट तथा आवधिक योजना
  | 'curriculum_books' // स्थानीय पाठ्यक्रम तथा ई-पुस्तकहरू
  | 'agri_health_manuals' // कृषि, पशु तथा स्वास्थ्य निर्देशिका
  | 'bulletins_reports'; // बुलेटिन तथा वार्षिक प्रतिवेदन

export interface LibraryItem {
  id: string;
  title: string;
  category: LibraryCategory;
  categoryLabel: string;
  publishedYear: string; // २०८१/०८२
  department: string;
  fileSizeMb: number;
  pagesCount: number;
  summary: string;
  fullContentSnippet?: string;
  pdfDownloadUrl?: string;
  coverColor: string;
  icon: string;
  isBookmarked?: boolean;
  isCachedOffline?: boolean;
}

// ─── CITIZEN PROJECTS & OFFICIALS DIRECTORY TYPES ───

export interface MunicipalProject {
  id: string;
  title: string;
  wardNo: number;
  budgetAllocatedRs: number;
  budgetSpentRs: number;
  progressPercent: number;
  contractorOrSamiti: string;
  status: 'प्रक्रियामा' | 'सञ्चालनमा' | 'सम्पन्न भएको';
  targetCompletionDate: string;
  category: 'सडक तथा पूर्वाधार' | 'खानेपानी तथा सरसफाइ' | 'शिक्षा तथा खेलकुद' | 'स्वास्थ्य' | 'कृषि तथा सिंचाइ';
}

export interface MunicipalOfficial {
  id: string;
  name: string;
  role: string;
  department: string;
  wardNo?: number;
  phone: string;
  email?: string;
  photoUrl?: string;
  roomNo?: string;
  isElected: boolean;
}

// ─── 3. BLOOD NETWORK & HEALTH TYPES ───

export interface BloodDonor {
  id: string;
  name: string;
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'O+' | 'O-' | 'AB+' | 'AB-';
  wardNo: number;
  tole: string;
  phone: string;
  lastDonatedDate?: string;
  isAvailable: boolean;
}

export interface HealthPost {
  id: string;
  name: string;
  wardNo: number;
  location: string;
  incharge: string;
  phone: string;
  ambulancePhone?: string;
  opdHours: string;
  services: string[];
}

// ─── 4. AGRI-MARKET & FERTILIZER TYPES ───

export interface AgriMarketItem {
  id: string;
  name: string;
  category: 'फलफूल' | 'नगदेबाली' | 'तरकारी' | 'दुग्ध/पशु' | 'खाद्यान्न';
  unit: string; // केजी, लिटर, क्विन्टल
  todayPriceRs: number;
  yesterdayPriceRs: number;
  priceTrend: 'up' | 'down' | 'stable';
  marketCenter: string;
}

export interface FertilizerDistribution {
  id: string;
  centerName: string;
  wardNo: number;
  fertilizerType: 'युरिया' | 'डीएपी' | 'पोटास' | 'जैविक मल';
  stockBags: number;
  pricePerBagRs: number;
  status: 'मौज्दात उपलब्ध' | 'न्यून मौज्दात' | 'सकिएको';
}

// ─── 5. TOURISM, TRAILS & HOMESTAYS TYPES ───

export interface TourismSpot {
  id: string;
  title: string;
  wardNo: number;
  category: 'धार्मिक' | 'प्राकृतिक/कुण्ड' | 'गुम्बा' | 'दृश्यवलोकन';
  altitudeMeters: number;
  description: string;
  highlights: string[];
  bestSeason: string;
  photoUrl?: string;
}

export interface TrekkingTrail {
  id: string;
  trailName: string;
  totalDistanceKm: number;
  durationDays: number;
  maxAltitudeMeters: number;
  difficulty: 'सजिलो' | 'मध्यम' | 'कठिन';
  routePoints: string[];
  teaHousesAvailable: boolean;
}

export interface RegisteredHomestay {
  id: string;
  name: string;
  wardNo: number;
  village: string;
  ownerName: string;
  phone: string;
  totalRooms: number;
  totalBeds: number;
  specialFood: string;
  pricePerNightRs: number;
}

// ─── 6. CITIZEN AUTH & PROFILE TYPES ───

export interface CitizenUser {
  id: string;
  fullName: string;
  fullNameEn: string;
  phone: string;
  email?: string;
  citizenshipNo: string;
  citizenshipIssuedDistrict: string;
  nationalIdNo: string; // राष्ट्रिय परिचयपत्र नं (NIN)
  voterCardNo?: string;
  taxpayerPan?: string;
  dateOfBirthBs: string;
  gender: 'पुरुष' | 'महिला' | 'अन्य';
  permanentAddress: {
    province: string;
    district: string;
    municipality: string;
    wardNo: number;
    tole: string;
    houseNo?: string;
  };
  bloodGroup: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  isKycVerified: boolean;
  avatarUrl?: string;
  householdNo: string;
  familyMembersCount: number;
  taxStatus: 'चुक्ता भएको' | 'बक्यौता बाँकी';
}

export interface CitizenApplicationRecord {
  id: string;
  sifarishName: string;
  applicationNo: string;
  appliedDate: string;
  wardNo: number;
  status: 'प्रक्रियामा' | 'सिफारिस तयार' | 'अस्वीकृत';
  fee: number;
  qrCodeToken: string;
}

