import { api } from './client';
import type { AuthResponse, User } from '../types/auth';

export const authApi = {
  login: async (email: string, password: string, tenantId?: string): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/auth/login', { email, password, tenantId });
    if (res.accessToken) {
      localStorage.setItem('p5_token', res.accessToken);
      localStorage.setItem('p5_user', JSON.stringify(res.user));
      
      // ✅ Automatically set tenant from user's actual account tenant
      // Priority: server-resolved tenantSubdomain > user-selected tenantId param
      const effectiveTenant = res.tenantSubdomain || (tenantId && tenantId !== 'all' ? tenantId : null);
      if (effectiveTenant) {
        localStorage.setItem('tenant_id', effectiveTenant);
      } else {
        // super_admin / central: clear tenant_id so they can see all
        localStorage.removeItem('tenant_id');
      }
    }
    return res;
  },

  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore
    } finally {
      localStorage.removeItem('p5_token');
      localStorage.removeItem('p5_user');
      localStorage.removeItem('tenant_id');
    }
  },

  getProfile: async (): Promise<User> => {
    return await api.get<User>('/auth/profile');
  },
};

