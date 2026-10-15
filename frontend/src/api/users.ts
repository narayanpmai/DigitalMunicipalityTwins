import { api } from './client';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  isActive: boolean;
  tenantId?: string;
  wardNumber?: number;
  full_name?: string;
  is_active?: boolean;
  ward_number?: number;
  tenant_id?: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

export const usersApi = {
  getAll: async (): Promise<User[]> => {
    const response = await api.get('/users');
    const list = Array.isArray(response) ? response : (response as any).data || [];
    return list.map((u: any) => ({
      ...u,
      fullName: u.fullName || u.full_name || '',
      full_name: u.full_name || u.fullName || '',
      isActive: u.isActive !== undefined ? Boolean(u.isActive) : (u.is_active !== undefined ? Boolean(u.is_active) : true),
      is_active: u.is_active !== undefined ? Boolean(u.is_active) : (u.isActive !== undefined ? Boolean(u.isActive) : true),
      wardNumber: u.wardNumber !== undefined ? u.wardNumber : u.ward_number,
      tenantId: u.tenantId || u.tenant_id,
    }));
  },
  
  toggleActive: async (id: string): Promise<User> => {
    const response = await api.patch(`/users/${id}/toggle-active`);
    const u = (response as any).data || response;
    return {
      ...u,
      fullName: u.fullName || u.full_name || '',
      full_name: u.full_name || u.fullName || '',
      isActive: u.isActive !== undefined ? Boolean(u.isActive) : (u.is_active !== undefined ? Boolean(u.is_active) : true),
      is_active: u.is_active !== undefined ? Boolean(u.is_active) : (u.isActive !== undefined ? Boolean(u.isActive) : true),
    };
  },
  
  create: async (data: Partial<User> & { password?: string }): Promise<User> => {
    const payload = {
      ...data,
      fullName: data.fullName || (data as any).full_name,
      full_name: data.fullName || (data as any).full_name,
      isActive: data.isActive !== undefined ? Boolean(data.isActive) : (data as any).is_active,
      is_active: data.isActive !== undefined ? Boolean(data.isActive) : (data as any).is_active,
      ward_number: data.wardNumber !== undefined ? data.wardNumber : (data as any).ward_number,
      tenant_id: data.tenantId || (data as any).tenant_id,
    };
    const response = await api.post('/users', payload);
    const u = (response as any).data || response;
    return {
      ...u,
      fullName: u.fullName || u.full_name || '',
      full_name: u.full_name || u.fullName || '',
      isActive: u.isActive !== undefined ? Boolean(u.isActive) : (u.is_active !== undefined ? Boolean(u.is_active) : true),
      is_active: u.is_active !== undefined ? Boolean(u.is_active) : (u.isActive !== undefined ? Boolean(u.isActive) : true),
    };
  },

  update: async (id: string, data: Partial<User> & { password?: string }): Promise<User> => {
    const payload = {
      ...data,
      fullName: data.fullName || (data as any).full_name,
      full_name: data.fullName || (data as any).full_name,
      isActive: data.isActive !== undefined ? Boolean(data.isActive) : (data as any).is_active,
      is_active: data.isActive !== undefined ? Boolean(data.isActive) : (data as any).is_active,
      ward_number: data.wardNumber !== undefined ? data.wardNumber : (data as any).ward_number,
      tenant_id: data.tenantId || (data as any).tenant_id,
    };
    const response = await api.put(`/users/${id}`, payload);
    const u = (response as any).data || response;
    return {
      ...u,
      fullName: u.fullName || u.full_name || '',
      full_name: u.full_name || u.fullName || '',
      isActive: u.isActive !== undefined ? Boolean(u.isActive) : (u.is_active !== undefined ? Boolean(u.is_active) : true),
      is_active: u.is_active !== undefined ? Boolean(u.is_active) : (u.isActive !== undefined ? Boolean(u.isActive) : true),
    };
  },

  getRoles: async (): Promise<Role[]> => {
    const response = await api.get('/users/roles');
    return Array.isArray(response) ? response : (response as any).data || [];
  },

  updateRolePermissions: async (name: string, permissions: string[]): Promise<Role> => {
    const response = await api.put(`/users/roles/${name}`, { permissions });
    return (response as any).data || response;
  }
};
