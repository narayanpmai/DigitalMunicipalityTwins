import { api } from './client';
import type {
  Project,
  BoqItem,
  ProjectPhoto,
  ProjectDocument,
  LinkableSourcesResponse,
  BudgetSourceItem,
  BudgetSubHeadItem,
  TimeExtensionRecord,
  ProjectSmsLog,
} from '../types/sectoral';

export type {
  Project,
  BoqItem,
  ProjectPhoto,
  ProjectDocument,
  LinkableSourcesResponse,
  BudgetSourceItem,
  BudgetSubHeadItem,
  TimeExtensionRecord,
  ProjectSmsLog,
};

export const projectsApi = {
  getAll: (params?: any) =>
    api.get<{ data: Project[]; total: number }>('/projects', { params }),

  getLinkableSources: (fiscalYear?: string) =>
    api.get<LinkableSourcesResponse>('/projects/linkable-sources', {
      params: fiscalYear ? { fiscalYear } : undefined,
    }),

  getById: (id: string) =>
    api.get<Project>(`/projects/${id}`),

  create: (data: Partial<Project>) =>
    api.post<Project>('/projects', data),

  update: (id: string, data: Partial<Project>) =>
    api.put<Project>(`/projects/${id}`, data),

  delete: (id: string) =>
    api.delete(`/projects/${id}`),

  addMonitoring: (id: string, data: any) =>
    api.post<Project>(`/projects/${id}/monitoring`, data),

  saveBoq: (id: string, boqItems: BoqItem[], syncEstimate = true) =>
    api.post<Project>(`/projects/${id}/boq`, { boqItems, syncEstimate }),

  addMeasurementBook: (id: string, data: any) =>
    api.post<Project>(`/projects/${id}/measurement-book`, data),

  recordInstallment: (id: string, data: { amount: number; installmentPhase: string; deductions: any }) =>
    api.post<Project>(`/projects/${id}/installments`, data),

  saveSocialAudit: (id: string, data: any) =>
    api.post<Project>(`/projects/${id}/social-audit`, data),

  processFarfarak: (id: string, data: any) =>
    api.post<Project>(`/projects/${id}/farfarak`, data),

  transferBudget: (
    id: string,
    data: { targetProjectId?: string; amount: number; remarks?: string; type?: 'transfer' | 'add' },
  ) => api.post<Project>(`/projects/${id}/transfer-budget`, data),

  uploadMedia: async (file: File): Promise<{ url: string; filename: string; size: number; mimetype: string }> => {
    const fd = new FormData();
    fd.append('file', file);
    return api.post('/media/upload', fd);
  },

  addPhoto: (id: string, data: Partial<ProjectPhoto>) =>
    api.post<Project>(`/projects/${id}/photos`, data),

  deletePhoto: (id: string, photoId: string) =>
    api.delete<Project>(`/projects/${id}/photos/${photoId}`),

  addDocument: (id: string, data: Partial<ProjectDocument>) =>
    api.post<Project>(`/projects/${id}/documents`, data),

  deleteDocument: (id: string, docId: string) =>
    api.delete<Project>(`/projects/${id}/documents/${docId}`),

  submitApproval: (
    id: string,
    data: { decision: 'approve' | 'return'; targetStage?: string; remarks?: string },
  ) => api.post<Project>(`/projects/${id}/approval`, data),

  addTimeExtension: (id: string, data: Partial<TimeExtensionRecord>) =>
    api.post<Project>(`/projects/${id}/time-extensions`, data),

  sendProjectSms: (
    id: string,
    data: {
      phone: string;
      message: string;
      recipientRole?: string;
      recipientName?: string;
      templateKey?: string;
      sentDateBs?: string;
    },
  ) => api.post<Project>(`/projects/${id}/sms`, data),

  // बजेट स्रोत सूची (Budget Sources Master)
  getBudgetSources: (status?: string) =>
    api.get<BudgetSourceItem[]>('/budgets/sources', { params: status ? { status } : undefined }),

  createBudgetSource: (data: Partial<BudgetSourceItem>) =>
    api.post<BudgetSourceItem>('/budgets/sources', data),

  toggleBudgetSourceStatus: (id: string, status?: string) =>
    api.patch<BudgetSourceItem>(`/budgets/sources/${id}/status`, status ? { status } : {}),

  updateBudgetSource: (id: string, data: Partial<BudgetSourceItem>) =>
    api.put<BudgetSourceItem>(`/budgets/sources/${id}`, data),

  deleteBudgetSource: (id: string) =>
    api.delete<{ message: string; id: string }>(`/budgets/sources/${id}`),

  // बजेट उप-शीर्षक रकम सूची (Budget Sub-Heads Allocations)
  getBudgetSubHeads: (params?: {
    fiscalYear?: string;
    level?: string;
    ward?: string;
    source?: string;
    expenseType?: string;
    search?: string;
  }) => api.get<BudgetSubHeadItem[]>('/budgets/sub-heads', { params }),

  createBudgetSubHead: (data: Partial<BudgetSubHeadItem>) =>
    api.post<BudgetSubHeadItem>('/budgets/sub-heads', data),

  updateBudgetSubHead: (id: string, data: Partial<BudgetSubHeadItem>) =>
    api.put<BudgetSubHeadItem>(`/budgets/${id}`, data),

  deleteBudgetSubHead: (id: string) =>
    api.delete<{ message: string; id: string }>(`/budgets/${id}`),
};
