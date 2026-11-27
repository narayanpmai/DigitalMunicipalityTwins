export interface AgricultureRecord {
  id: string;
  wardNo: number;
  cropName: string; // e.g. आलु, मकै, कोदो, किबी, स्याउ
  category: 'cereal' | 'cash_crop' | 'fruit' | 'vegetable' | 'spices';
  cultivatedAreaHectares: number;
  annualProductionMetricTons: number;
  yieldPerHectare: number;
  farmerHouseholds: number;
  subsidiesProvidedNpr?: number;
  remarks?: string;
}

export interface LivestockRecord {
  id: string;
  wardNo: number;
  animalType: 'cattle' | 'yak_chauri' | 'goat' | 'poultry' | 'trout_fish';
  animalNameNepali: string;
  count: number;
  milkProductionLitersPerDay?: number;
  meatProductionKg?: number;
  farmsCount: number;
}

export interface Project {
  id: string;
  projectCode: string; // e.g. PPK-W04-HE-082-001
  name: string;
  nameEn?: string;
  description?: string;
  wardNumber: number;
  sector: string; // सडक/पूर्वाधार, खानेपानी, शिक्षा, भवन, पर्यटन, स्वास्थ्य, कृषि
  fiscalYear: string;
  allocatedBudget?: number;
  budget?: number;
  fundingSource?: string;
  progressPercentage?: number;
  expenditureAmount?: number;
  physicalProgressPercent?: number;
  physicalProgress?: number;
  status: 'planning' | 'tender' | 'ongoing' | 'completed' | 'halted' | string;
  contractorName?: string;
  contractor?: string;
  startDate?: string;
  targetEndDate?: string;
  completionDate?: string;
  actualCompletionDate?: string;
  qrCodeUrl?: string;
  qrCode?: string;
  beneficiaryCount?: number;
  householdsCount?: number;
  photos?: Array<ProjectPhoto | string>;
  documents?: Array<ProjectDocument | string>;
  isPublic?: boolean;
  gisData?: Record<string, any>;
  remarks?: string;

  // प्राविधिक इस्टिमेट तथा सम्झौता थप विवरण
  technicalEstimateAmount?: number;
  technicalApprovalDateBs?: string;
  responsibleEngineer?: string;
  engineerPhone?: string;
  contingencyRatePercent?: number;
  maintenanceFundPercent?: number;
  monitoringCommitteeScore?: number;
  monitoringRecommendation?: string;
  executionMethod?: string;

  // योजना सम्झौता प्रणाली (Project Agreement System Fields)
  level?: 'नगर स्तरिय' | 'वडा स्तरिय' | string;
  marfat?: 'उपभोक्ता समिति' | 'ठेक्का / बोलपत्र' | 'अमानत' | 'संस्था / समूह' | string;
  budgetSource?: string;
  budgetSubHead?: string;
  officeCost?: number; // कार्यालय लागत (रु.)
  committeeCost?: number; // उपभोक्ता समिति लागत (रु.)
  startDateBs?: string; // सुरु हुने मिति (वि.सं.)
  completionDateBs?: string; // सम्पन्न हुने मिति (वि.सं.)
  agreementDateBs?: string; // सम्झौता मिति (वि.सं.)
  palikaGrant?: number;
  communityContribution?: number;
  totalAgreementAmount?: number;
  paidAmount?: number;
  financialProgress?: number;
  agreementStatus?: string;
  committeeName?: string;
  committeeChair?: string;
  committeeSecretary?: string;
  committeeTreasurer?: string;
  committeePhone?: string;
  contingencyAmount?: number;
  virementDetails?: Record<string, any>;

  // आधिकारिक योजना सम्झौता फारमका थप क्षेत्रहरू
  subProjectName?: string;
  chalaniNo?: string;
  wardRecommendationDateBs?: string;
  objective?: string;
  laborContribution?: number;
  beneficiaryHouseholds?: number;
  beneficiaryCommunity?: string;
  beneficiaryOrganization?: number;
  beneficiaryFemale?: number;
  beneficiaryMale?: number;
  committeeFormationDateBs?: string;
  committeeFormationAttendees?: number;
  committeeViceChair?: string;
  monitoringCommitteeMembers?: Array<Record<string, any>>;
  agreementTerms?: Array<Record<string, any>>;
  signatories?: Record<string, any>;

  installmentDetails?: {
    payments?: Array<{
      id?: string;
      installmentPhase: string;
      amount: number;
      deductions?: Record<string, any>;
      recordedBy?: string;
      createdAt?: string;
    }>;
    lastPayment?: Record<string, any>;
    [key: string]: any;
  };
  boqItems?: Array<Record<string, any>>;
  approvalStage?: string;
  approvalHistory?: ApprovalHistoryEntry[];
  budgetId?: string;
  procurementId?: string;
  procurementNo?: string;
  contractDetails?: Record<string, any>;
  contractorPan?: string;
  workOrderNumber?: string;
  workOrderDateBs?: string;
  committeeBankDetails?: CommitteeBankDetails | Record<string, any>;
  committeeMembers?: CommitteeMember[] | Array<Record<string, any>>;
  monitoringRecords?: MonitoringRecord[] | Array<Record<string, any>>;
  measurementBook?: MeasurementBookEntry[] | Array<Record<string, any>>;
  socialAudit?: SocialAuditRecord | Record<string, any>;
  farfarakDetails?: FarfarakDetails | Record<string, any>;
  timeExtensions?: TimeExtensionRecord[];
  smsLogs?: ProjectSmsLog[];
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  latitude?: number;
  longitude?: number;
  location?: string;
  [key: string]: any;
}

export interface CommitteeMember {
  id?: string;
  name: string;
  role: 'अध्यक्ष' | 'उपाध्यक्ष' | 'सचिव' | 'कोषाध्यक्ष' | 'सदस्य' | string;
  gender: 'महिला' | 'पुरुष' | 'अन्य' | string;
  wardNumber?: number;
  phone?: string;
  citizenshipNo?: string;
  category?: 'महिला' | 'दलित' | 'आदिवासी/जनजाति' | 'अपाङ्गता' | 'खुला' | string;
}

export interface CommitteeBankDetails {
  bankName?: string;
  branch?: string;
  accountNumber?: string;
  accountType?: string;
  signatories?: string;
  recommendationLetterNo?: string;
  [key: string]: any;
}

export interface MonitoringRecord {
  id: string;
  date: string;
  monitorName: string;
  designation: string;
  status: string;
  rating?: string;
  progressObserved?: number;
  remarks?: string;
  recommendation?: string;
  photos?: string[];
  createdAt?: string;
}

export interface BoqItem {
  id: string;
  sn?: number;
  itemDescription: string;
  unit: string;
  quantity: number;
  rate: number;
  amount: number;
  completedQuantity?: number;
  remarks?: string;
}

export interface ProjectPhoto {
  id: string;
  phase: 'before' | 'during' | 'after' | string;
  url: string;
  caption?: string;
  latitude?: number;
  longitude?: number;
  capturedDateBs?: string;
  uploadedBy?: string;
  uploadedAt?: string;
}

export interface ProjectDocument {
  id: string;
  docType:
    | 'assembly_minute'
    | 'citizenship'
    | 'estimate'
    | 'agreement_order'
    | 'bill_voucher'
    | 'social_audit_minute'
    | 'handover'
    | 'other'
    | string;
  title: string;
  fileUrl: string;
  fileName?: string;
  uploadedDateBs?: string;
  uploadedBy?: string;
  uploadedAt?: string;
}

export interface MeasurementBookItemEntry {
  boqItemId?: string;
  itemDescription: string;
  unit: string;
  nos?: number;
  length?: number;
  breadth?: number;
  height?: number;
  quantity: number;
  rate: number;
  amount: number;
}

export interface MeasurementBookEntry {
  id: string;
  mbNumber: string;
  date: string;
  engineerName: string;
  workDescription?: string;
  mbItems?: MeasurementBookItemEntry[];
  measuredAmount: number;
  cumulativeAmount: number;
  verifiedBy?: string;
  remarks?: string;
  createdAt?: string;
}

export interface SocialAuditRecord {
  date: string;
  venue: string;
  participantsCount: number;
  femaleCount?: number;
  marginalizedCount?: number;
  decisionsSummary: string;
  publicSatisfaction?: string;
  auditorName?: string;
  documentUrl?: string;
  updatedAt?: string;
}

export interface FarfarakDetails {
  isFarfarakDone: boolean;
  farfarakDate?: string;
  finalAuditedCost?: number;
  maintenanceFundRetained?: number;
  contingencyRetained?: number;
  securityDepositRefunded?: number;
  completionCertificateNo?: string;
  handoverTo?: string;
  remarks?: string;
  approvedBy?: string;
  updatedAt?: string;
}

export interface ApprovalHistoryEntry {
  id: string;
  fromStage: string;
  toStage: string;
  decision: 'approve' | 'return' | string;
  actorEmail?: string;
  actorName?: string;
  actorRole?: string;
  remarks?: string;
  createdAt?: string;
}

export interface TimeExtensionRecord {
  id: string;
  extensionNo: number; // १, २, ३ (पटक)
  applicationDateBs: string; // निवेदन मिति
  applicantName: string; // निवेदक / समिति
  reason: string; // म्याद थपको कारण
  decisionLevel: 'ward' | 'palika_executive' | 'cao' | string;
  decisionDateBs: string; // निर्णय मिति
  decisionNumber: string; // निर्णय / बैठक नं.
  chalaniNo?: string; // चलानी नं.
  previousCompletionDateBs: string; // साविक सम्पन्न मिति
  extendedCompletionDateBs: string; // थपिएको नयाँ म्याद मिति
  extendedDays: number; // थप भएको दिन संख्या
  physicalProgressAtRequest: number; // भौतिक प्रगति (%)
  financialProgressAtRequest?: number; // वित्तीय प्रगति (रु.)
  technicalRecommendation: string; // प्राविधिक सिफारिस
  engineerName?: string; // प्राविधिक/इन्जिनियर
  status: 'approved' | 'pending' | 'rejected' | string;
  approvedBy?: string;
  remarks?: string;
  createdAt?: string;
}

export interface LinkableBudget {
  id: string;
  title: string;
  fiscalYear: string;
  type: string;
  status: string;
  sector?: string;
  wardNumber?: number;
  sourceOfFund?: string;
  allocatedAmount: number;
  releasedAmount: number;
  spentAmount: number;
  allocatedToProjects: number;
  paidInProjects: number;
  remainingForAllocation: number;
}

export interface LinkableProcurement {
  id: string;
  procurementNo: string;
  title: string;
  method?: string;
  status: string;
  fiscalYear: string;
  sector?: string;
  wardNo?: number;
  estimatedAmount: number;
  awardedAmount: number;
  bidSecurityAmount: number;
  performanceSecurityAmount: number;
  awardedTo?: string;
  awardedVendorPan?: string;
  contractDateBs?: string;
  completionDateBs?: string;
  linkedProjectId?: string;
}

export interface LinkableSourcesResponse {
  budgets: LinkableBudget[];
  procurements: LinkableProcurement[];
}

export interface DisasterEvent {
  id: string;
  title: string;
  type: string;
  wardNumber?: number;
  severity: 'low' | 'medium' | 'high' | 'critical' | string;
  dateReportedBs?: string;
  incidentDateBs?: string;
  affectedHouseholds?: number;
  affectedPeople?: number;
  casualtiesCount?: number;
  humanCasualties?: number;
  injuredCount?: number;
  estimatedLossNPR?: number;
  status: 'active' | 'under_control' | 'resolved' | string;
  reliefStatus?: string;
  reliefDistributed?: string;
  reliefMaterials?: string;
  rescueTeam?: string;
  description?: string;
  reporterName?: string;
  reporterPhone?: string;
  lat?: number;
  lng?: number;
}

export interface EmergencyContact {
  id: string;
  name: string;
  role: string; // विपद् सम्पर्क व्यक्ति, एम्बुलेन्स, प्रहरी चौकी, रेडक्रस
  phone: string;
  wardNo?: number;
  wardNumber?: number;
  department?: string;
  isHotline?: boolean;
}

export interface BudgetSourceItem {
  id: string;
  sn: number;
  name: string;
  status: 'सक्रिय' | 'निष्क्रिय' | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectSmsLog {
  id: string;
  sentAt: string;
  sentDateBs: string;
  recipientRole: string;
  recipientName: string;
  phone: string;
  message: string;
  templateKey: string;
  status: 'DELIVERED' | 'PENDING' | 'FAILED' | string;
  gateway: string;
}

export interface BudgetSubHeadItem {
  id: string;
  subHeadNo: string;
  title: string;
  allocatedAmount: number;
  releasedAmount?: number;
  spentAmount?: number;
  sourceOfFund: string;
  level: string; // वडा स्तरिय / नगर स्तरिय
  expenseType: string; // पुँजीगत खर्च / चालु खर्च
  status: string; // active, approved, etc.
  approvalState?: string; // स्विकृत भएको
  fiscalYear: string;
  wardNumber?: number | null;
  sector?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectSmsLog {
  id: string;
  sentAt: string;
  sentDateBs: string;
  recipientRole: string;
  recipientName: string;
  phone: string;
  message: string;
  templateKey: string;
  status: 'DELIVERED' | 'PENDING' | 'FAILED' | string;
  gateway: string;
}

