import { api } from './client';

export type CitizenServiceStatus = 'applied' | 'processing' | 'approved' | 'rejected' | 'delivered';

export type CitizenServiceType =
  | 'birth_certificate'
  | 'death_certificate'
  | 'relationship_certificate'
  | 'citizenship_recommendation'
  | 'character_certificate'
  | 'migration'
  | 'property'
  | 'business'
  | 'other';

export interface CitizenServiceApplication {
  id: string;
  tenantId?: string;
  applicationNo: string;
  serviceType: CitizenServiceType;
  status: CitizenServiceStatus;
  applicantName: string;
  applicantPhone?: string;
  wardNumber?: number;
  purpose?: string;
  processedBy?: string;
  processedAt?: string;
  deliveredAt?: string;
  fee?: number;
  remarks?: string;
  certificateNo?: string;
  dispatchNo?: string;
  formData?: Record<string, any>;
  documents?: any[];
  createdAt: string;
  updatedAt: string;
}

export interface CitizenServiceStats {
  byStatus: { status: string; count: string | number }[];
  byType: { type: string; count: string | number }[];
  total: number;
}

export const citizenServicesApi = {
  getAll: async (params?: { status?: string; type?: string }): Promise<CitizenServiceApplication[]> => {
    const query = new URLSearchParams();
    if (params?.status && params.status !== 'all') query.append('status', params.status);
    if (params?.type && params.type !== 'all') query.append('type', params.type);

    const qs = query.toString();
    const res: any = await api.get(`/citizen-services${qs ? `?${qs}` : ''}`);
    return Array.isArray(res) ? res : res?.data || [];
  },

  getStats: async (): Promise<CitizenServiceStats> => {
    const res: any = await api.get('/citizen-services/stats');
    return res?.data || res;
  },

  getTemplates: async (): Promise<any[]> => {
    const res: any = await api.get('/citizen-services/templates');
    return Array.isArray(res) ? res : res?.data || [];
  },

  track: async (applicationNo: string): Promise<CitizenServiceApplication> => {
    const res: any = await api.get(`/citizen-services/track/${encodeURIComponent(applicationNo.trim())}`);
    return res?.data || res;
  },

  getById: async (id: string): Promise<CitizenServiceApplication> => {
    const res: any = await api.get(`/citizen-services/${id}`);
    return res?.data || res;
  },

  create: async (data: Partial<CitizenServiceApplication>): Promise<CitizenServiceApplication> => {
    const res: any = await api.post('/citizen-services', data);
    return res?.data || res;
  },

  update: async (id: string, data: Partial<CitizenServiceApplication>): Promise<CitizenServiceApplication> => {
    const res: any = await api.put(`/citizen-services/${id}`, data);
    return res?.data || res;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const res: any = await api.delete(`/citizen-services/${id}`);
    return res?.data || res;
  },
};
