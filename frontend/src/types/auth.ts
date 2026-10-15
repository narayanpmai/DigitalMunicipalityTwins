export type UserRole =
  | 'super_admin'
  | 'it_admin'
  | 'cao'
  | 'it_officer'
  | 'planning_officer'
  | 'revenue_officer'
  | 'agriculture_officer'
  | 'health_officer'
  | 'education_officer'
  | 'disaster_officer'
  | 'ward_secretary'
  | 'data_entry'
  | 'citizen';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  wardNumber?: number;
  isActive: boolean;
  tenantId?: string;
  tenantSubdomain?: string; // e.g. 'panchpokhari', 'helambu'
  phone?: string;
  createdAt?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  tenantSubdomain?: string | null; // server-resolved subdomain for the logged-in user's tenant
  user: User;
}
