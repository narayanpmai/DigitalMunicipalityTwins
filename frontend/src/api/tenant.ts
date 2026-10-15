import { api } from './client';
import type { PublicSettings } from '../types/tenant';

export const tenantApi = {
  getPublicSettings: async (): Promise<PublicSettings> => {
    return await api.get<PublicSettings>('/settings/public');
  },
  getAllSettings: async (): Promise<Record<string, string>> => {
    return await api.get<Record<string, string>>('/settings');
  },
  updateBulkSettings: async (updates: Record<string, string>): Promise<{ success: boolean; updatedKeys: string[] }> => {
    return await api.post<{ success: boolean; updatedKeys: string[] }>('/settings/bulk', updates);
  },
  getAllTenants: async (): Promise<any[]> => {
    return await api.get<any[]>('/tenants');
  },
  registerTenant: async (data: any): Promise<{ success: boolean; message: string; data?: any }> => {
    return await api.post<{ success: boolean; message: string; data?: any }>('/tenants/register', data);
  },
};
