import { createApiClient } from './client';

export interface Cooperative {
  id: string;
  registration_no: string;
  copomis_code?: string;
  name: string;
  name_en?: string;
  coop_type: string;
  status: string;
  ward_number: number;
  tole_address?: string;
  working_area?: string;
  registration_date_bs?: string;
  pan_number?: string;
  phone?: string;
  email?: string;
  latitude?: number;
  longitude?: number;
  chairperson_name?: string;
  chairperson_phone?: string;
  manager_name?: string;
  manager_phone?: string;
  total_members_male: number;
  total_members_female: number;
  total_members: number;
  share_capital: number;
  total_deposit: number;
  total_loan_outstanding: number;
  reserve_fund: number;
  risk_level: string;
  liquidity_ratio: number;
  npl_ratio: number;
  last_agm_date_bs?: string;
  last_audit_fiscal_year?: string;
  copomis_sync_status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CooperativeFinancialReport {
  id?: string;
  cooperative_id: string;
  fiscal_year: string;
  period_type: string;
  period_name: string;
  report_date_bs?: string;
  share_capital: number;
  reserve_funds: number;
  total_deposits: number;
  total_loans: number;
  performing_loans: number;
  non_performing_loans: number;
  liquid_assets: number;
  total_assets: number;
  net_profit_loss: number;
  liquidity_ratio?: number;
  npl_ratio?: number;
  submitted_by?: string;
  created_at?: string;
}

export interface CooperativeInspection {
  id?: string;
  cooperative_id: string;
  inspection_date_bs: string;
  inspector_name: string;
  inspector_designation?: string;
  inspection_type?: string;
  compliance_score: number;
  findings_summary?: string;
  directives_issued?: string;
  status?: string;
  created_at?: string;
}

export interface CooperativeAnalytics {
  total_cooperatives: number;
  active_cooperatives: number;
  problematic_cooperatives: number;
  total_members: number;
  total_male_members: number;
  total_female_members: number;
  total_share_capital: number;
  total_deposits: number;
  total_loans: number;
  average_liquidity_ratio: number;
  average_npl_ratio: number;
  by_type: Record<string, number>;
  by_ward: Record<string, number>;
  by_risk: Record<string, number>;
}

export interface CooperativeNotice {
  id?: string;
  cooperative_id: string;
  notice_no?: string;
  notice_type: string;
  issue_date_bs: string;
  deadline_date_bs?: string;
  title: string;
  content: string;
  directives?: string;
  status?: string;
  sms_sent: boolean;
  recipient_phone?: string;
  issued_by?: string;
  created_at?: string;
}

export interface DualBorrowerCrossCheckResponse {
  total_flagged_individuals: number;
  total_dual_loan_exposure: number;
  flagged_members: Array<{
    member_name: string;
    citizenship_no?: string;
    phone?: string;
    ward_number: number;
    total_loans_taken: number;
    cooperatives_involved: string[];
    cooperative_count: number;
    risk_level: string;
  }>;
  financial_inclusion_by_ward: Record<string, { total_households: number; coop_members: number; coverage_pct: string }>;
}

const api = createApiClient();

export const cooperativesApi = {
  list: async (params?: { ward?: number; coop_type?: string; risk_level?: string; status?: string }): Promise<Cooperative[]> => {
    const res = await api.get('/cooperatives', { params });
    return res.data;
  },

  getById: async (id: string): Promise<Cooperative> => {
    const res = await api.get(`/cooperatives/${id}`);
    return res.data;
  },

  create: async (data: Partial<Cooperative>): Promise<Cooperative> => {
    const res = await api.post('/cooperatives', data);
    return res.data;
  },

  update: async (id: string, data: Partial<Cooperative>): Promise<Cooperative> => {
    const res = await api.put(`/cooperatives/${id}`, data);
    return res.data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const res = await api.delete(`/cooperatives/${id}`);
    return res.data;
  },

  getAnalytics: async (): Promise<CooperativeAnalytics> => {
    const res = await api.get('/cooperatives/analytics/summary');
    return res.data;
  },

  getGeoJson: async () => {
    const res = await api.get('/cooperatives/gis/geojson');
    return res.data;
  },

  submitFinancialReport: async (id: string, data: Partial<CooperativeFinancialReport>) => {
    const res = await api.post(`/cooperatives/${id}/financial-reports`, data);
    return res.data;
  },

  getFinancialReports: async (id: string): Promise<CooperativeFinancialReport[]> => {
    const res = await api.get(`/cooperatives/${id}/financial-reports`);
    return res.data;
  },

  submitInspection: async (id: string, data: Partial<CooperativeInspection>) => {
    const res = await api.post(`/cooperatives/${id}/inspections`, data);
    return res.data;
  },

  getInspections: async (id: string): Promise<CooperativeInspection[]> => {
    const res = await api.get(`/cooperatives/${id}/inspections`);
    return res.data;
  },

  exportCopomisData: async () => {
    const res = await api.get('/cooperatives/export/copomis-format');
    return res.data;
  },

  getCrossCheck: async (): Promise<DualBorrowerCrossCheckResponse> => {
    const res = await api.get('/cooperatives/cross-check/dual-borrowers');
    return res.data;
  },

  issueNotice: async (id: string, data: Partial<CooperativeNotice>): Promise<CooperativeNotice> => {
    const res = await api.post(`/cooperatives/${id}/notices`, data);
    return res.data;
  },

  getNotices: async (id: string): Promise<CooperativeNotice[]> => {
    const res = await api.get(`/cooperatives/${id}/notices`);
    return res.data;
  },

  getAllNotices: async (): Promise<CooperativeNotice[]> => {
    const res = await api.get('/cooperatives/notices/all');
    return res.data;
  }
};
