import { api } from './client';

export interface Branch {
  id: string;
  name: string;
  code?: string;
  type: 'palika' | 'ward';
  wardNumber?: number;
  ward_number?: number;
  description?: string;
  rolesAndResponsibilities?: string[];
  roles_and_responsibilities?: string[];
  headEmployeeName?: string;
  head_employee_name?: string;
  headEmployeeId?: string;
  head_employee_id?: string;
  contactPhone?: string;
  contact_phone?: string;
  email?: string;
  isInformationOfficerBranch?: boolean;
  is_information_officer_branch?: boolean;
  isGrievanceOfficerBranch?: boolean;
  is_grievance_officer_branch?: boolean;
  status: 'active' | 'inactive';
}

export const branchesApi = {
  getAll: async (type?: string): Promise<Branch[]> => {
    const raw = await api.get<any[]>('/branches', { params: type && type !== 'all' ? { type } : undefined });
    return (raw || []).map((b) => ({
      ...b,
      wardNumber: b.wardNumber ?? b.ward_number,
      rolesAndResponsibilities: b.rolesAndResponsibilities ?? b.roles_and_responsibilities ?? [],
      headEmployeeName: b.headEmployeeName ?? b.head_employee_name,
      headEmployeeId: b.headEmployeeId ?? b.head_employee_id,
      contactPhone: b.contactPhone ?? b.contact_phone,
      isInformationOfficerBranch: b.isInformationOfficerBranch ?? b.is_information_officer_branch ?? false,
      isGrievanceOfficerBranch: b.isGrievanceOfficerBranch ?? b.is_grievance_officer_branch ?? false,
    }));
  },
  getOne: (id: string) => api.get<Branch>(`/branches/${id}`),
  create: (data: Partial<Branch>) => api.post<Branch>('/branches', data),
  update: (id: string, data: Partial<Branch>) => api.put<Branch>(`/branches/${id}`, data),
  remove: (id: string) => api.delete<{ success: boolean }>(`/branches/${id}`),
  seedDefault: () => api.post<Branch[]>('/branches/seed-default', {}),
};

