import { api } from './client';

export interface ProgressKpiData {
  totalPopulation: number;
  totalHouseholds: number;
  populationDensity: number;
  areaSqKm: number;
  wardCount: number;
  schoolCount: number;
  healthFacilityCount: number;
  roadLengthKm: number;
  waterAccessPercent: number;
  internetAccessPercent: number;
  electrificationPercent: number;
  budgetUtilizationPercent: number;
  revenueGrowthPercent: number;
  capitalExpenditurePercent: number;
  recurrentExpenditurePercent: number;
  completedProjectsCount: number;
  ongoingProjectsCount: number;
  totalBeneficiaries: number;
  totalBeneficiaryHHs: number;
  citizenSatisfactionIndex: number;
  representativePerformanceIndex: number;
  digitalGovernanceIndex: number;
  agricultureProductivityIndex: number;
  tourismDevelopmentIndex: number;
  disasterRiskIndex: number;
  socialInclusionIndex: number;
  suspensionBridgeCount: number;
  motorableBridgeCount: number;
  communityBuildingCount: number;
  wardBuildingCount: number;
  palikaBuildingCount: number;
  heritageSitesCount: number;
  waitingShelterCount: number;
  parkCount: number;
  irrigationCanalLengthKm: number;
  blackWireLengthKm: number;
  conservedLakesCount: number;
  waterfallsCount: number;
  teaGardenAreaHectares: number;
  souvenirHouseCount: number;
  fishFarmCount: number;
  publicAssetManagementIndex: number;
  gisCoveragePercent: number;
  assetConditionSummary?: {
    totalAssets: number;
    goodConditionCount: number;
    goodConditionPercent: number;
    fairConditionCount: number;
    fairConditionPercent: number;
    needsRepairCount: number;
    needsRepairPercent: number;
    bySector?: Array<{
      sector: string;
      total: number;
      good: number;
      fair: number;
      critical: number;
    }>;
  };
  wardRankings: Array<{
    wardNumber: number;
    wardName: string;
    score: number;
    rank: number;
    completedProjects: number;
    budgetUtil: number;
  }>;
}

export interface ThematicRecordItem {
  id: string;
  assetUniqueId: string;
  planCode?: string;
  fiscalYear: string;
  periodType: string;
  moduleKey: number;
  moduleTitleNepali: string;
  assetName: string;
  wardNumber: number;
  toleBasti?: string;
  lat?: number;
  lng?: number;
  gpsAccuracy?: number;
  elevationMeters?: number;
  geomType: string;
  startDate?: string;
  completionDate?: string;
  contractorOrCommittee?: string;
  constructionCost: number;
  expenditureAmount: number;
  physicalProgressPercent: number;
  beneficiaryHouseholds: number;
  beneficiaryPopulation: number;
  condition: 'excellent' | 'good' | 'fair' | 'needs_repair' | 'abandoned';
  lastMaintenanceDate?: string;
  responsibleAgency: string;
  beforePhotoUrl?: string;
  afterPhotoUrl?: string;
  extraPhotos?: string[];
  videoUrl?: string;
  dronePhotoUrl?: string;
  qrCodeToken?: string;
  digitalSignature?: string;
  thematicData: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface GeneratedReportData {
  metadata: {
    reportType: '1_year' | '5_year' | '10_year';
    fiscalYear: string;
    period: string;
    wardNumber: number;
    title: string;
    subtitle: string;
    municipalityName: string;
    officeName: string;
    district: string;
    province: string;
    generatedAt: string;
    publishedDateNepali: string;
    motto: string;
  };
  kpis: ProgressKpiData;
  sectorSummaries: Array<{
    moduleKey: number;
    title: string;
    targetCount: number;
    completedCount: number;
    expenditure: string;
    utilization: string;
    achievementNote: string;
  }>;
  beforeAfterData: Array<{
    indicator: string;
    unit: string;
    baseline2074: number;
    midline2079: number;
    current2084: number;
    growthPercent: number;
    status: string;
  }>;
  records: ThematicRecordItem[];
}

export const reportsApi = {
  getDashboardKpis: (ward?: number): Promise<ProgressKpiData> =>
    api.get('/reports/kpis', { params: { ward } }),

  getThematicRecords: (params?: {
    moduleKey?: number;
    ward?: number;
    fiscalYear?: string;
    condition?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ items: ThematicRecordItem[]; total: number; page: number; limit: number; totalPages: number }> =>
    api.get('/reports/thematic-records', { params }),

  createThematicRecord: (data: Partial<ThematicRecordItem>): Promise<ThematicRecordItem> =>
    api.post('/reports/thematic-records', data),

  updateThematicRecord: (id: string, data: Partial<ThematicRecordItem>): Promise<ThematicRecordItem> =>
    api.put(`/reports/thematic-records/${id}`, data),

  deleteThematicRecord: (id: string): Promise<{ success: boolean; message: string }> =>
    api.delete(`/reports/thematic-records/${id}`),

  generateReport: (params: {
    type: '1_year' | '5_year' | '10_year';
    fiscalYear?: string;
    period?: string;
    ward?: number;
  }): Promise<GeneratedReportData> =>
    api.get('/reports/generate', { params }),

  getBeforeAfter: (): Promise<Array<{
    indicator: string;
    unit: string;
    baseline2074: number;
    midline2079: number;
    current2084: number;
    growthPercent: number;
    status: string;
  }>> =>
    api.get('/reports/before-after'),
};
