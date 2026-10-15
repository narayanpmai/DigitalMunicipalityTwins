export type OpenDataCategory = 'datasets' | 'reports' | 'strategic' | 'practices';

export interface OpenDataRecord {
  id: string;
  tenantId?: string;
  category: OpenDataCategory;
  title: string;
  subCategory?: string;
  fiscalYear: string;
  wardNumber: number;
  description?: string;
  format?: string;
  fileSize?: string;
  recordsCount?: number;
  fileUrl?: string;
  publishDate?: string;
  authorOrDepartment?: string;
  targetGoal?: string;
  budgetAllocated?: number;
  tagBadge?: string;
  status: string;
  keyIndicators?: string[] | Record<string, any>;
  sampleData?: any[];
  columnsSchema?: { field: string; type: string; description: string }[];
  license?: string;
  apiEndpoint?: string;
  isFeatured?: boolean;
  downloadCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface OpenDataStats {
  totalDatasets: number;
  totalReports: number;
  strategicPillars: number;
  goodPractices: number;
  totalRecordsIndexed: number;
  totalDownloads: number;
  transparencyScore?: number;
  activeIndicatorsCount?: number;
  pendingRequestsCount?: number;
}

export interface MunicipalIndicator {
  id: string;
  indicator_code: string;
  title_np: string;
  title_en?: string;
  category: 'demography' | 'finance' | 'education' | 'health' | 'infrastructure' | 'governance' | 'agriculture' | 'sdg';
  baseline_value?: string;
  current_value: string;
  target_value?: string;
  unit?: string;
  progress_percent: number;
  fiscal_year: string;
  sdg_goal?: string;
  status: 'achieved' | 'on_track' | 'needs_attention';
  ward_breakdown?: Record<string, any>;
  trend_history?: Record<string, any>;
  source_department?: string;
  last_updated?: string;
}

export interface CitizenDataRequest {
  id: string;
  full_name: string;
  phone: string;
  email?: string;
  organization?: string;
  dataset_title: string;
  purpose: string;
  ward_number: number;
  status: 'दर्ता भएको' | 'प्रक्रियामा' | 'स्वीकृत/उपलब्ध' | 'अस्वीकृत';
  response_note?: string;
  response_file_url?: string;
  created_at?: string;
}

export interface OpenDataPublicationItem {
  id: string;
  dataset_name: string;
  category: string;
  description?: string;
  source_table_or_query: string;
  format: string;
  record_count: number;
  download_count: number;
  is_published: boolean;
  published_by?: string;
  api_endpoint?: string;
  created_at: string;
  last_updated: string;
}

export interface TransparencyOverview {
  palika_name: string;
  district: string;
  transparency_score: number;
  fiscal_year: string;
  pillars: {
    proactive_rti_disclosure: {
      status: string;
      sections_covered: string;
      last_published: string;
      officer: string;
    };
    public_hearing_audit: {
      total_hearings: number;
      latest_hearing_date: string;
      social_audit_completed: string;
      citizen_participants: number;
    };
    citizen_charter: {
      total_services: number;
      average_delivery_time: string;
      on_time_fulfillment_pct: number;
    };
    financial_transparency: {
      budget_publication_status: string;
      beruju_clearance_pct: number;
      procurement_e_bidding_pct: number;
    };
  };
  digital_standards: {
    open_data_license: string;
    api_access: string;
    api_catalog_url: string;
  };
}
