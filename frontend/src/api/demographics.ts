import { createApiClient } from './client';

export interface DemographicCategory {
  id: string;
  code: string;
  name: string;
  nameEn?: string;
  description?: string;
  displayOrder: number;
  isActive: boolean;
  indicators?: DemographicIndicator[];
}

export interface DemographicIndicator {
  id: string;
  code: string;
  name: string;
  nameEn?: string;
  description?: string;
  unitType: 'count' | 'percent' | 'ratio' | 'text';
  sourceYear?: number;
  displayOrder: number;
  values?: DemographicValue[];
  category?: DemographicCategory;
}

export interface DemographicValue {
  id: string;
  indicatorId: string;
  localLevelName: string;
  segmentKey: string;
  segmentLabel: string;
  wardNumber?: number;
  valueNumber?: number;
  valueText?: string;
  sourceNote?: string;
  capturedOn?: string;
}

export interface HouseholdMember {
  name: string;
  relation: string;
  gender: 'male' | 'female' | 'other' | string;
  age?: number;
  education?: string;
  occupation?: string;
  nidOrCitizenship?: string;
}

export interface HouseholdRecord {
  id: string;
  matrixHouseNo: string;
  legacyHouseNo?: string;
  formerVdc?: string;
  wardNumber: number;
  sequence: number;
  householdName: string;
  headNameNepali?: string;
  headName?: string;
  contactNumber?: string;
  agricultureProfile?: {
    subsidiesReceived?: any[];
    crops?: any[];
    livestock?: any[];
    [key: string]: any;
  };
  headGender?: string;
  ethnicity?: string;
  maleCount?: number;
  femaleCount?: number;
  tole?: string;
  contactPhone?: string;
  citizenshipNo?: string;
  familySize: number;
  familyMembers?: HouseholdMember[];
  buildingType?: string;
  houseType?: string;
  storeys?: number;
  gpsLat?: number;
  gpsLon?: number;
  riskDetails?: string;
  riskLevel?: 'low' | 'medium' | 'high';
  riskScore?: number;
  isAtRisk?: boolean;
  latitude?: number;
  longitude?: number;
  elevationMeters?: number;
  drinkingWaterSource?: string;
  waterPurification?: string;
  toiletType?: string;
  electricitySource?: string;
  cookingFuel?: string;
  cadastralParcelNo?: string;
  landOwnership?: string;
  buildingPermitStatus?: string;
  reconstructionStatus?: string;
  safeShelterDistanceMins?: number;
  disabilityCount?: number;
  disabilityCardType?: string;
  socialSecurityCount?: number;
  foreignMigrantsCount?: number;
  qrToken?: string;
  isVerified?: boolean;
  verificationStatus?: 'approved' | 'pending' | 'rejected';
  verificationRemarks?: string;
  verifiedAt?: string;
  submittedByPublic?: boolean;
  remarks?: string;
  province?: string;
  district?: string;
  municipality?: string;
  meta?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface DemographicSummary {
  population: {
    total: number;
    male: number;
    female: number;
    households: number;
    avgHouseholdSize: number;
    sexRatio: number;
    density: number;
    areaSqKm: number;
    wards: number;
  };
  ageStructure: {
    under15: number;
    workingAge: number;
    elderly65Plus: number;
    dependencyRatio: number;
  };
  literacy: {
    totalRate: number;
    maleRate: number;
    femaleRate: number;
    higherEdu: number;
    slcPassed: number;
    noEdu: number;
  };
  housing: {
    privateHouses: number;
    permanent: number;
    semiPermanent: number;
    temporary: number;
    pipedWater: number;
    electricity: number;
    toilet: number;
    internet: number;
  };
  disability: {
    total: number;
    rate: number;
  };
  economic: {
    active: number;
    agriculture: number;
    participationRate: number;
    abroad: number;
  };
  householdRegistry: {
    registeredCount: number;
    highRiskCount: number;
  };
}

export const demographicsApi = {
  async getSummary(): Promise<DemographicSummary> {
    const client = createApiClient();
    const res = await client.get<DemographicSummary>('/demographics/summary');
    return res.data;
  },

  async getSummaryMetrics(): Promise<DemographicSummary> {
    return this.getSummary();
  },

  async getCategories(): Promise<DemographicCategory[]> {
    const client = createApiClient();
    const res = await client.get<DemographicCategory[]>('/demographics/categories');
    return res.data;
  },

  async getCategoryIndicators(code: string): Promise<DemographicCategory> {
    const client = createApiClient();
    const res = await client.get<DemographicCategory>(`/demographics/categories/${code}`);
    return res.data;
  },

  async getAllIndicators(): Promise<DemographicCategory[]> {
    const client = createApiClient();
    const res = await client.get<DemographicCategory[]>('/demographics/indicators');
    return res.data;
  },

  async getHouseholds(ward?: number, search?: string, status?: string): Promise<HouseholdRecord[]> {
    const client = createApiClient();
    const params: Record<string, any> = {};
    if (ward && ward > 0) params.ward = ward;
    if (search && search.trim()) params.search = search.trim();
    if (status && status !== 'all') params.status = status;
    const res = await client.get<HouseholdRecord[]>('/demographics/households', { params });
    return res.data;
  },

  async getAllHouseholds(): Promise<{ data: HouseholdRecord[] }> {
    const households = await this.getHouseholds();
    return { data: households };
  },

  async verifyHousehold(id: string, status: 'approved' | 'rejected', remarks?: string): Promise<HouseholdRecord> {
    const client = createApiClient();
    const res = await client.put<HouseholdRecord>(`/demographics/households/${id}/verify`, { status, remarks });
    return res.data;
  },

  async getHouseholdById(id: string): Promise<HouseholdRecord> {
    const client = createApiClient();
    const res = await client.get<HouseholdRecord>(`/demographics/households/${id}`);
    return res.data;
  },

  async getHouseholdMapPoints(ward?: number, risk?: string, status?: string): Promise<any[]> {
    const client = createApiClient();
    const params: Record<string, any> = {};
    if (ward && ward > 0) params.ward = ward;
    if (risk && risk !== 'all') params.risk = risk;
    if (status && status !== 'all') params.status = status;
    const res = await client.get<any[]>('/demographics/households/map-points', { params });
    return res.data;
  },

  async syncGpsHouseholds(): Promise<{ message: string; count: number }> {
    const client = createApiClient();
    const res = await client.post<{ message: string; count: number }>('/demographics/households/sync-gps');
    return res.data;
  },

  async createHousehold(data: Partial<HouseholdRecord>): Promise<HouseholdRecord> {
    const client = createApiClient();
    const res = await client.post<HouseholdRecord>('/demographics/households', data);
    return res.data;
  },

  async updateHousehold(id: string, data: Partial<HouseholdRecord>): Promise<HouseholdRecord> {
    const client = createApiClient();
    const res = await client.put<HouseholdRecord>(`/demographics/households/${id}`, data);
    return res.data;
  },

  async deleteHousehold(id: string): Promise<{ message: string }> {
    const client = createApiClient();
    const res = await client.delete<{ message: string }>(`/demographics/households/${id}`);
    return res.data;
  },

  async uploadSurvey(file: File): Promise<{ message: string; count?: number }> {
    const client = createApiClient();
    const formData = new FormData();
    formData.append('file', file);
    const res = await client.post<{ message: string; count?: number }>('/demographics/upload-survey', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  async importGoogleSheet(sheetUrl: string): Promise<{ message: string; count?: number }> {
    const client = createApiClient();
    const res = await client.post<{ message: string; count?: number }>('/demographics/import-google-sheet', { sheetUrl });
    return res.data;
  },

  async clearAllHouseholds(): Promise<{ message: string; count: number }> {
    const client = createApiClient();
    const res = await client.post<{ message: string; count: number }>('/demographics/households-clear-all');
    return res.data;
  },

  async bulkImportHouseholds(households: any[], replaceAll: boolean = false): Promise<{ message: string; count: number }> {
    const client = createApiClient();
    const res = await client.post<{ message: string; count: number }>('/demographics/households/bulk-import', { households, replaceAll });
    return res.data;
  },
};
