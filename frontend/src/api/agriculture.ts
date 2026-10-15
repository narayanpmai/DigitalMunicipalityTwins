import { api, apiClient } from './client';

export interface VetMedicine {
  id: string;
  medicineName: string;
  batchNumber?: string;
  manufactureDate?: string;
  expiryDate?: string;
  stockQuantity: number;
  unit: string;
}

export interface VetDistribution {
  id?: string;
  medicineId: string;
  farmerId: string;
  animalType: string;
  quantityGiven: number;
  distributedDate?: string;
  remarks?: string;
  medicine?: VetMedicine;
}

export interface VetAiRecord {
  id: string;
  farmerName: string;
  contactPhone?: string;
  wardNumber: number;
  animalType: string;
  breed: string;
  strawNumber: string;
  aiDateBs: string;
  expectedCalvingDateBs?: string;
  technicianName: string;
  status: 'सफल (Confirmed)' | 'पुनः गर्भाधान आवश्यक (Repeat)' | 'निरीक्षण बाँकी (Pending)';
  remarks?: string;
}

export interface VetVaccinationRecord {
  id: string;
  vaccineName: string;
  earTagNumber: string;
  animalType: string;
  farmerName: string;
  wardNumber: number;
  vaccinatedDateBs: string;
  boosterDueDateBs?: string;
  batchNumber?: string;
  technicianName: string;
  status: 'सम्पन्न (Completed)' | 'बूस्टर बाँकी (Booster Due)';
}

export interface VetDiagnosisRecord {
  id: string;
  farmerName: string;
  wardNumber: number;
  animalType: string;
  symptoms: string;
  suspectedDisease: string;
  prescribedMedicine: string;
  dosageInstructions: string;
  doctorTechnician: string;
  dateBs: string;
  followUpDateBs?: string;
  status: 'उपचार जारी (Under Treatment)' | 'निको भएको (Recovered)' | 'गम्भीर (Critical)';
}

export interface AgriMarketItem {
  id: string;
  itemName: string;
  category: string;
  unit: string;
  icon?: string;
  isOrganic?: boolean;
}

export interface AgriMarketPrice {
  id?: string;
  itemId: string;
  date?: string;
  minPrice: number;
  maxPrice: number;
  averagePrice?: number;
  wholesalePrice?: number;
  retailPrice?: number;
  marketCenter?: string;
  dailyInflowQuintal?: number;
  item?: AgriMarketItem;
}

export interface AgriAdvisory {
  id?: string;
  title: string;
  content: string;
  advisoryType: 'weather' | 'pest_control' | 'crop_management' | 'livestock_health' | 'general';
  targetCategory?: string;
  targetZone?: string;
  assignedOfficer?: string;
  officerPhone?: string;
  smsStatus?: string;
  validUntil?: string;
  issuedBy?: string;
  issuedDate?: string;
}

export interface SubsidyRecord {
  date: string;
  amount: number;
  purpose: string;
  fiscalYear: string;
  subsidyType?: string;
  partnershipPercent?: string;
  bankTransferRef?: string;
  verificationOfficer?: string;
  status?: string;
}

export interface AgricultureProfile {
  id?: string;
  householdId: string;
  farmerCategory?: 'small' | 'medium' | 'commercial';
  landAreaHectares: number;
  mainCrops: string[];
  livestockDetails: Record<string, number>;
  subsidiesReceived?: SubsidyRecord[];
  additionalDetails?: Record<string, any>;
  household?: any; // The linked demographic household
  // Local Municipal Fields (स्थानीय तह प्रमाणीकरण, कित्ता र बैंक)
  citizenshipNo?: string;
  nidNo?: string;
  kittaNo?: string;
  landMeasurementLocal?: string;
  irrigationType?: string;
  bankName?: string;
  bankBranch?: string;
  bankAccountNo?: string;
  wardVerificationStatus?: string;
  insurancePolicyNo?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FarmerSubsidy {
  programName: string;
  fiscalYear: string;
  subsidyAmount: number;
  dateBs?: string;
  item?: string;
}

export interface GlobalSubsidyRecord {
  source: 'household' | 'farmer';
  id: string;
  name: string;
  wardNumber: number;
  matrixHouseNo?: string;
  contactPhone?: string;
  programName: string;
  fiscalYear: string;
  subsidyAmount: number;
  dateBs?: string;
  item?: string;
}

export interface SoilHealthCardData {
  cardNo?: string;
  ph: number;
  nitrogen: string;
  phosphorus: string;
  potassium: string;
  organicMatter: string;
  advisory: string;
  testDateBs: string;
  status: string;
}

export interface AgricultureFarmer {
  id: string;
  farmerId: string;
  fullName: string;
  gender: string;
  citizenshipNo?: string;
  contactPhone?: string;
  wardNumber: number;
  toleVillage?: string;
  farmerCategory: string;
  landAreaRopani: number;
  majorCrops?: string;
  livestockDetails?: string;
  bankName?: string;
  bankAccountNo?: string;
  subsidiesHistory?: string | FarmerSubsidy[];
  soilHealthCard?: string | SoilHealthCardData;
  status: string;
  registeredDateBs?: string;
  remarks?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FarmerSummaryStats {
  totalRegisteredFarmers: number;
  totalLandRopani: number;
  totalSubsidiesDisbursedNPR: number;
  soilHealthCardsIssued: number;
  byCategory: { category: string; count: string | number }[];
  byWard: { ward: number; count: string | number }[];
}

export const agricultureApi = {
  // Digital Farmer Registry & Soil Health Cards
  getFarmerSummary: () => api.get<FarmerSummaryStats>('/agriculture/farmers/summary'),
  getFarmers: (params?: { ward?: number; category?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.ward) query.append('ward', params.ward.toString());
    if (params?.category) query.append('category', params.category);
    if (params?.search) query.append('search', params.search);
    const qs = query.toString();
    return api.get<AgricultureFarmer[]>(`/agriculture/farmers${qs ? `?${qs}` : ''}`);
  },
  getFarmerById: (id: string) => api.get<AgricultureFarmer>(`/agriculture/farmers/${id}`),
  createFarmer: (data: Partial<AgricultureFarmer>) => api.post<AgricultureFarmer>('/agriculture/farmers', data),
  updateFarmer: (id: string, data: Partial<AgricultureFarmer>) => api.put<AgricultureFarmer>(`/agriculture/farmers/${id}`, data),
  disburseFarmerSubsidy: (id: string, subsidy: FarmerSubsidy) => 
    api.put<AgricultureFarmer>(`/agriculture/farmers/${id}/subsidy`, subsidy),
  updateSoilHealthCard: (id: string, soilData: SoilHealthCardData) =>
    api.put<AgricultureFarmer>(`/agriculture/farmers/${id}/soil-card`, soilData),
  deleteFarmer: (id: string) => api.delete<{ deleted: boolean }>(`/agriculture/farmers/${id}`),

  // Veterinary Medicine
  getMedicines: () => api.get<VetMedicine[]>('/agriculture/vet-medicines'),
  createMedicine: (data: Partial<VetMedicine>) => api.post<VetMedicine>('/agriculture/vet-medicines', data),
  updateStock: (id: string, amount: number, type: 'add' | 'reduce') => api.put(`/agriculture/vet-medicines/${id}/stock`, { amount, type }),
  
  // Veterinary Distribution
  getDistributions: () => api.get<VetDistribution[]>('/agriculture/vet-distributions'),
  distributeMedicine: (data: VetDistribution) => api.post<VetDistribution>('/agriculture/vet-distributions', data),
  deleteMedicine: (id: string) => api.delete<{ deleted: boolean; id: string }>(`/agriculture/vet-medicines/${id}`),

  // Veterinary Artificial Insemination (AI)
  getAiRecords: (ward?: number) => api.get<VetAiRecord[]>(`/agriculture/vet-ai-records${ward ? `?ward=${ward}` : ''}`),
  createAiRecord: (data: Partial<VetAiRecord>) => api.post<VetAiRecord>('/agriculture/vet-ai-records', data),
  updateAiRecord: (id: string, data: Partial<VetAiRecord>) => api.put<VetAiRecord>(`/agriculture/vet-ai-records/${id}`, data),
  deleteAiRecord: (id: string) => api.delete<{ deleted: boolean; id: string }>(`/agriculture/vet-ai-records/${id}`),

  // Veterinary Vaccination
  getVaccineRecords: (ward?: number) => api.get<VetVaccinationRecord[]>(`/agriculture/vet-vaccinations${ward ? `?ward=${ward}` : ''}`),
  createVaccineRecord: (data: Partial<VetVaccinationRecord>) => api.post<VetVaccinationRecord>('/agriculture/vet-vaccinations', data),
  updateVaccineRecord: (id: string, data: Partial<VetVaccinationRecord>) => api.put<VetVaccinationRecord>(`/agriculture/vet-vaccinations/${id}`, data),
  deleteVaccineRecord: (id: string) => api.delete<{ deleted: boolean; id: string }>(`/agriculture/vet-vaccinations/${id}`),

  // Veterinary Clinical Diagnoses (OPD / Treatment)
  getDiagnosisRecords: (ward?: number) => api.get<VetDiagnosisRecord[]>(`/agriculture/vet-diagnoses${ward ? `?ward=${ward}` : ''}`),
  createDiagnosisRecord: (data: Partial<VetDiagnosisRecord>) => api.post<VetDiagnosisRecord>('/agriculture/vet-diagnoses', data),
  updateDiagnosisRecord: (id: string, data: Partial<VetDiagnosisRecord>) => api.put<VetDiagnosisRecord>(`/agriculture/vet-diagnoses/${id}`, data),
  deleteDiagnosisRecord: (id: string) => api.delete<{ deleted: boolean; id: string }>(`/agriculture/vet-diagnoses/${id}`),

  // Veterinary Summary & KPIs
  getVetSummary: () => api.get<any>('/agriculture/vet-summary'),

  // Market & Price
  getMarketItems: () => api.get<AgriMarketItem[]>('/agriculture/market-items'),
  createMarketItem: (data: Partial<AgriMarketItem>) => api.post<AgriMarketItem>('/agriculture/market-items', data),
  getMarketPrices: (date?: string) => api.get<AgriMarketPrice[]>('/agriculture/market-prices' + (date ? `?date=${date}` : '')),
  recordMarketPrice: (data: Partial<AgriMarketPrice>) => api.post<AgriMarketPrice>('/agriculture/market-prices', data),

  // Advisories (Active or All)
  getAdvisories: (activeOnly?: boolean) => 
    api.get<AgriAdvisory[]>('/agriculture/advisories' + (activeOnly ? '?activeOnly=true' : '')),
  createAdvisory: (data: Partial<AgriAdvisory>) => api.post<AgriAdvisory>('/agriculture/advisories', data),
  updateAdvisory: (id: string, data: Partial<AgriAdvisory>) => api.put<AgriAdvisory>(`/agriculture/advisories/${id}`, data),
  deleteAdvisory: (id: string) => api.delete<{ deleted: boolean }>(`/agriculture/advisories/${id}`),

  // AI Voice Integration
  generateSpeech: async (text: string): Promise<Blob> => {
    const res = await apiClient.post(
      '/tts/generate', 
      { text }, 
      { responseType: 'blob' }
    );
    return res.data;
  },

  // Farmer Profiling & Subsidy (Demographic Household Link)
  searchHouseholdsForProfile: (query: string) => api.get<any[]>(`/agriculture/households/search?q=${query}`),
  getFarmerProfile: (householdId: string) => api.get<AgricultureProfile>(`/agriculture/profiles/${householdId}`),
  saveFarmerProfile: (householdId: string, data: Partial<AgricultureProfile>) => api.post<AgricultureProfile>(`/agriculture/profiles/${householdId}`, data),
  addSubsidy: (householdId: string, data: SubsidyRecord) => api.post<AgricultureProfile>(`/agriculture/profiles/${householdId}/subsidies`, data),
  getAllSubsidies: () => api.get<GlobalSubsidyRecord[]>('/agriculture/subsidies/all'),

  // Subsidized Fertilizer Quota & Cooperative Depots
  getFertilizerSummary: () => api.get<FertilizerSummaryStats>('/agriculture/fertilizer/summary'),
  getFertilizerStocks: (ward?: number) => 
    api.get<FertilizerStockItem[]>(`/agriculture/fertilizer/stocks${ward ? `?ward=${ward}` : ''}`),
  getFertilizerDistributions: (params?: { ward?: number; farmerId?: string; fertilizerType?: string; depotName?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.ward) query.append('ward', params.ward.toString());
    if (params?.farmerId) query.append('farmerId', params.farmerId);
    if (params?.fertilizerType) query.append('fertilizerType', params.fertilizerType);
    if (params?.depotName) query.append('depotName', params.depotName);
    if (params?.search) query.append('search', params.search);
    const qs = query.toString();
    return api.get<FertilizerDistributionRecord[]>(`/agriculture/fertilizer/distributions${qs ? `?${qs}` : ''}`);
  },
  calculateFertilizerQuota: (params: { landAreaRopani: number; cropName: string; soilPh?: number }) => {
    const query = new URLSearchParams();
    query.append('landAreaRopani', params.landAreaRopani.toString());
    query.append('cropName', params.cropName);
    if (params.soilPh) query.append('soilPh', params.soilPh.toString());
    return api.get<FertilizerQuotaCalculation>(`/agriculture/fertilizer/calculate-quota?${query.toString()}`);
  },
  disburseFertilizerQuota: (data: {
    farmerId: string;
    depotName: string;
    fertilizerType: string;
    quantityKg: number;
    cropSeason?: string;
    remarks?: string;
    distributionDateBs?: string;
  }) => api.post<FertilizerDistributionRecord>('/agriculture/fertilizer/distributions', data),
};

export interface FertilizerStockItem {
  id: string;
  depotName: string;
  wardNumber: number;
  contactPerson?: string;
  contactPhone?: string;
  fertilizerType: 'UREA' | 'DAP' | 'POTASH' | 'AGRI_LIME' | 'ORGANIC_COMPOST';
  fertilizerNameNepali: string;
  totalStockKg: number;
  distributedKg: number;
  availableStockKg: number;
  subsidizedPricePerKg: number;
  marketPricePerKg: number;
  fiscalYear: string;
}

export interface FertilizerDistributionRecord {
  id: string;
  farmerId: string;
  farmerName: string;
  wardNumber: number;
  depotName: string;
  fertilizerType: 'UREA' | 'DAP' | 'POTASH' | 'AGRI_LIME' | 'ORGANIC_COMPOST';
  fertilizerNameNepali: string;
  quantityBags: number;
  quantityKg: number;
  subsidizedRatePerKg: number;
  marketRatePerKg: number;
  farmerPaidAmountNpr: number;
  governmentSubsidyAmountNpr: number;
  cropSeason: string;
  recommendedQuotaKg: number;
  receiptNo: string;
  distributionDateBs: string;
  status: string;
  remarks?: string;
  createdAt?: string;
}

export interface FertilizerSummaryStats {
  totalDistributedMetricTons: number;
  totalDistributedKg: number;
  totalFarmerPaidNpr: number;
  totalSubsidyDisbursedNpr: number;
  totalFarmerSavingsNpr: number;
  beneficiaryFarmersCount: number;
  activeDepotsCount: number;
  stockByType: {
    type: string;
    name: string;
    totalStockKg: number;
    distributedKg: number;
    availableStockKg: number;
  }[];
  depots: {
    depotName: string;
    wardNumber: number;
    contactPerson: string;
    contactPhone: string;
  }[];
  recentDistributionsCount: number;
}

export interface FertilizerQuotaCalculationItem {
  type: string;
  name: string;
  ratePerRopaniKg: number;
  recommendedKg: number;
  recommendedBags: number;
  subsidizedRate: number;
  marketRate: number;
  farmerCostNpr: number;
  marketCostNpr: number;
  govSubsidyNpr: number;
  savingsPercent: number;
}

export interface FertilizerQuotaCalculation {
  cropName: string;
  landAreaRopani: number;
  soilPh: number;
  totalRecommendedKg: number;
  totalFarmerCostNpr: number;
  totalMarketCostNpr: number;
  totalGovSubsidyNpr: number;
  overallSavingsPercent: number;
  soilAdvisory: string;
  items: FertilizerQuotaCalculationItem[];
}

