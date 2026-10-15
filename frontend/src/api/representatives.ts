import { api } from './client';

export interface Representative {
  id: string;
  name: string;
  designation: string;
  wardNo?: number;
  phone?: string;
  email?: string;
  politicalParty?: string;
  photoUrl?: string;
  isCurrent: boolean;
  termStartDate?: string;
  termEndDate?: string;
}

export const representativesApi = {
  getAll: (params?: { wardNo?: number; isCurrent?: boolean }): Promise<Representative[]> => 
    api.get<Representative[]>('/representatives', { params }).then((res: any) => 
      Array.isArray(res) ? res : res?.data || []
    ),
    
  getById: (id: string): Promise<Representative> => 
    api.get<Representative>(`/representatives/${id}`).then((res: any) => res?.data || res),
    
  create: (data: Partial<Representative>): Promise<Representative> => 
    api.post<Representative>('/representatives', data).then((res: any) => res?.data || res),
    
  update: (id: string, data: Partial<Representative>): Promise<Representative> => 
    api.put<Representative>(`/representatives/${id}`, data).then((res: any) => res?.data || res),
    
  delete: (id: string): Promise<any> => 
    api.delete(`/representatives/${id}`),
};
