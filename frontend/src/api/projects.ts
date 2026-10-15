import { api } from './client';
import type { Project } from '../types/sectoral';

export type { Project };

export const projectsApi = {
  getAll: (params?: any) => 
    api.get<{ data: Project[], total: number }>('/projects', { params }),

  getById: (id: string) => 
    api.get<Project>(`/projects/${id}`),

  create: (data: Partial<Project>) => 
    api.post<Project>('/projects', data),

  update: (id: string, data: Partial<Project>) => 
    api.put<Project>(`/projects/${id}`, data),

  delete: (id: string) => 
    api.delete(`/projects/${id}`),
};
