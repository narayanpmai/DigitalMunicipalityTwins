import { api } from './client';
import type { DartaRecord, ChalaniRecord } from '../types/darta-chalani';

export const dartaChalaniApi = {
  getDartaList: async (): Promise<any[]> => {
    const res: any = await api.get('/darta-chalani/darta');
    return Array.isArray(res) ? res : res?.data || [];
  },

  getChalaniList: async (): Promise<any[]> => {
    const res: any = await api.get('/darta-chalani/chalani');
    return Array.isArray(res) ? res : res?.data || [];
  },

  setDartaApproval: async (id: string, approvalStatus: string, reason?: string) => {
    return api.post(`/darta-chalani/darta/${id}/approval`, { approvalStatus, reason, approvedBy: 'अधिकृत' });
  },

  setChalaniApproval: async (id: string, approvalStatus: string, reason?: string) => {
    return api.post(`/darta-chalani/chalani/${id}/approval`, { approvalStatus, reason, approvedBy: 'अधिकृत' });
  },

  createDarta: async (data: any) => {
    return api.post('/darta-chalani/darta', data);
  },

  updateDarta: async (id: string, data: any) => {
    return api.put(`/darta-chalani/darta/${id}`, data);
  },

  createChalani: async (data: any) => {
    return api.post('/darta-chalani/chalani', data);
  },

  updateChalani: async (id: string, data: any) => {
    return api.put(`/darta-chalani/chalani/${id}`, data);
  },

  assignTokAdesh: async (id: string, data: {
    assignedBranch?: string;
    assignedOfficer?: string;
    tokAdesh: string;
    tokDate?: string;
    deadlineDate?: string;
    priority?: string;
    tokGivenBy?: string;
  }) => {
    return api.post(`/darta-chalani/darta/${id}/tok-aadesh`, data);
  },

  completeDarta: async (id: string, data: {
    completionNotes?: string;
    completionDate?: string;
    completedBy?: string;
  }) => {
    return api.post(`/darta-chalani/darta/${id}/complete`, data);
  },

  verifyRecord: async (code: string) => {
    return api.get(`/darta-chalani/verify/${encodeURIComponent(code)}`);
  },

  getNextNumbers: async (fiscalYear?: string): Promise<{ nextDartaNo: string; nextChalaniNo: string; fiscalYear: string }> => {
    const res: any = await api.get('/darta-chalani/next-numbers', { params: { fiscalYear } });
    return res;
  },

  deleteDarta: async (id: string) => {
    return api.delete(`/darta-chalani/darta/${id}`);
  },

  deleteChalani: async (id: string) => {
    return api.delete(`/darta-chalani/chalani/${id}`);
  }
};
