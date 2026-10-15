import { api } from './client';
import type { Organization, OrganizationFilters } from '../types/organization';


export const organizationsApi = {
  getAll: async (filters?: OrganizationFilters): Promise<Organization[]> => {
    const params = new URLSearchParams();
    if (filters?.type && filters.type !== 'all') params.append('type', filters.type);
    if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters?.wardNo && filters.wardNo !== 'all') params.append('wardNo', filters.wardNo.toString());
    if (filters?.search) params.append('search', filters.search);

    const queryString = params.toString();
    const endpoint = `/organizations${queryString ? `?${queryString}` : ''}`;
    const res: any = await api.get<Organization[]>(endpoint);
    return Array.isArray(res) ? res : res?.data && Array.isArray(res.data) ? res.data : [];
  },

  getById: async (id: string): Promise<Organization> => {
    const res: any = await api.get<Organization>(`/organizations/${id}`);
    return res?.data || res;
  },

  create: async (data: Partial<Organization>): Promise<Organization> => {
    return api.post<Organization>('/organizations', data);
  },

  update: async (id: string, data: Partial<Organization>): Promise<Organization> => {
    return api.put<Organization>(`/organizations/${id}`, data);
  },

  delete: async (id: string): Promise<{ success: boolean }> => {
    return api.delete<{ success: boolean }>(`/organizations/${id}`);
  },
};
