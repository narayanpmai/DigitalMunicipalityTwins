import { api } from './client';

export interface Branch {
  id: string;
  name: string;
  code?: string;
  type: 'palika' | 'ward';
  wardNumber?: number;
  description?: string;
  rolesAndResponsibilities?: string[];
  headEmployeeName?: string;
  headEmployeeId?: string;
  contactPhone?: string;
  email?: string;
  isInformationOfficerBranch?: boolean;
  isGrievanceOfficerBranch?: boolean;
  status: 'active' | 'inactive';
}

export const branchesApi = {
  getAll: (type?: string) =>
    api.get<Branch[]>('/branches', { params: type && type !== 'all' ? { type } : undefined }),
  getOne: (id: string) => api.get<Branch>(`/branches/${id}`),
  create: (data: Partial<Branch>) => api.post<Branch>('/branches', data),
  update: (id: string, data: Partial<Branch>) => api.put<Branch>(`/branches/${id}`, data),
  remove: (id: string) => api.delete<{ success: boolean }>(`/branches/${id}`),
};
