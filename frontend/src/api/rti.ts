import { api } from './client';

export type RtiStatus = 'pending' | 'in_progress' | 'info_provided' | 'rejected';

export interface RtiRequest {
  id: string;
  requestNo: string;
  applicantName: string;
  applicantPhone?: string;
  applicantEmail?: string;
  applicantAddress?: string;
  subject: string;
  requestedInformation: string;
  purpose?: string;
  format: 'electronic' | 'certified_copy' | 'inspection';
  status: RtiStatus;
  assignedOfficer: string;
  assignedDepartment: string;
  filingDateBs?: string;
  legalDeadlineBs?: string;
  actionTakenNotes?: string;
  attachmentUrl?: string;
  trackingToken?: string;
  createdAt: string;
  updatedAt: string;
}

export const rtiApi = {
  getAll: (status?: string) =>
    api.get<RtiRequest[]>('/rti', { params: status && status !== 'all' ? { status } : undefined }),
  getOne: (id: string) => api.get<RtiRequest>(`/rti/${id}`),
  track: (query: string) => api.get<RtiRequest>(`/rti/track/${encodeURIComponent(query)}`),
  create: (data: Partial<RtiRequest>) => api.post<RtiRequest>('/rti', data),
  update: (id: string, data: Partial<RtiRequest>) => api.put<RtiRequest>(`/rti/${id}`, data),
};
