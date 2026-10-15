import { createApiClient } from './client';

export interface CitizenRecord {
  id: string;
  citizenCode?: string;
  fullName: string;
  fullNameEn?: string;
  citizenshipNo?: string;
  nationalId?: string;
  phone?: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  dateOfBirth?: string;
  dobBs?: string;
  bloodGroup?: string;
  maritalStatus?: string;
  wardNumber: number;
  address: string;
  tole?: string;
  occupation?: string;
  fatherName?: string;
  motherName?: string;
  spouseName?: string;
  targetedGroup?: string;
  insuranceNumber?: string;
  servicePurpose?: string;
  issuedDistrict?: string;
  issuedDate?: string;
  emergencyContactName?: string;
  emergencyContactRelation?: string;
  emergencyContactPhone?: string;
  verificationStatus?: 'PENDING' | 'VERIFIED' | 'REJECTED';
  source?: 'PUBLIC_PORTAL' | 'ADMIN_ENTRY' | 'SYSTEM_SEED';
  isPublic?: boolean;
  verifiedAt?: string;
  verifiedBy?: string;
  verificationRemarks?: string;
  servicesHistory?: Array<{ date: string; service: string; remarks?: string }>;
  createdAt?: string;
  updatedAt?: string;
}

export interface CitizenStats {
  total: number;
  byWard: Array<{ ward: number; count: string | number }>;
  byGender: Array<{ gender: string; count: string | number }>;
}

export const citizensApi = {
  async getAll(search?: string, ward?: number, status?: string): Promise<CitizenRecord[]> {
    const client = createApiClient();
    const params: Record<string, any> = {};
    if (search && search.trim()) params.search = search.trim();
    if (ward && ward > 0) params.ward = ward;
    if (status && status !== 'all') params.status = status;
    const res = await client.get<CitizenRecord[]>('/citizens', { params });
    return res.data;
  },

  async getPublic(search?: string, ward?: number): Promise<CitizenRecord[]> {
    const client = createApiClient();
    const params: Record<string, any> = {};
    if (search && search.trim()) params.search = search.trim();
    if (ward && ward > 0) params.ward = ward;
    const res = await client.get<CitizenRecord[]>('/citizens/public', { params });
    return res.data;
  },

  async publicRegister(data: Partial<CitizenRecord>): Promise<CitizenRecord> {
    const client = createApiClient();
    const res = await client.post<CitizenRecord>('/citizens/public-register', data);
    return res.data;
  },

  async verify(
    id: string,
    status: 'VERIFIED' | 'REJECTED',
    isPublic?: boolean,
    remarks?: string
  ): Promise<CitizenRecord> {
    const client = createApiClient();
    const res = await client.put<CitizenRecord>(`/citizens/${id}/verify`, {
      status,
      isPublic: isPublic !== undefined ? isPublic : status === 'VERIFIED',
      remarks,
    });
    return res.data;
  },

  async getStats(): Promise<CitizenStats> {
    const client = createApiClient();
    const res = await client.get<CitizenStats>('/citizens/stats');
    return res.data;
  },

  async getById(id: string): Promise<CitizenRecord> {
    const client = createApiClient();
    const res = await client.get<CitizenRecord>(`/citizens/${id}`);
    return res.data;
  },

  async create(data: Partial<CitizenRecord>): Promise<CitizenRecord> {
    const client = createApiClient();
    const res = await client.post<CitizenRecord>('/citizens', data);
    return res.data;
  },

  async update(id: string, data: Partial<CitizenRecord>): Promise<CitizenRecord> {
    const client = createApiClient();
    const res = await client.put<CitizenRecord>(`/citizens/${id}`, data);
    return res.data;
  },

  async delete(id: string): Promise<{ message: string }> {
    const client = createApiClient();
    const res = await client.delete<{ message: string }>(`/citizens/${id}`);
    return res.data;
  },

  async uploadCsv(file: File): Promise<{ message: string; count?: number }> {
    const client = createApiClient();
    const formData = new FormData();
    formData.append('file', file);
    const res = await client.post<{ message: string; count?: number }>('/citizens/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
};
