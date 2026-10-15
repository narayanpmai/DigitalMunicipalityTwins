import { api } from './client';
import type { Complaint, CreateComplaintDto } from '../types/complaint';

export const complaintsApi = {
  getAll: async (params?: { category?: string; status?: string; ward?: number; wardNumber?: number; search?: string }): Promise<Complaint[]> => {
    const query = new URLSearchParams();
    if (params?.category && params.category !== 'all') query.append('category', params.category);
    if (params?.status && params.status !== 'all') query.append('status', params.status);
    const wardVal = params?.wardNumber ?? params?.ward;
    if (wardVal !== undefined && wardVal !== 0) query.append('wardNumber', wardVal.toString());
    if (params?.search && params.search.trim()) query.append('search', params.search.trim());

    const qs = query.toString();
    const res: any = await api.get(`/complaints${qs ? `?${qs}` : ''}`);
    return Array.isArray(res) ? res : res?.data || [];
  },

  getStats: async (): Promise<any> => {
    const res: any = await api.get('/complaints/stats');
    return res?.data || res;
  },

  create: async (data: CreateComplaintDto): Promise<Complaint> => {
    return api.post<Complaint>('/complaints', data);
  },

  track: async (complaintNo: string): Promise<Complaint> => {
    return api.get<Complaint>(`/complaints/${encodeURIComponent(complaintNo)}`);
  },

  update: async (id: string, data: Partial<Complaint>): Promise<Complaint> => {
    return api.put<Complaint>(`/complaints/${id}`, data);
  },

  simulateWhatsApp: async (data: {
    phone?: string;
    message: string;
    senderName?: string;
    latitude?: number;
    longitude?: number;
  }): Promise<any> => {
    return api.post('/complaints/whatsapp/simulate', data);
  },

  getWhatsAppStatus: async (): Promise<any> => {
    return api.get('/complaints/whatsapp/status');
  },

  notifyCitizenWhatsApp: async (complaintId: string, customMessage?: string): Promise<any> => {
    return api.post(`/complaints/whatsapp/notify/${complaintId}`, { customMessage });
  },
};
