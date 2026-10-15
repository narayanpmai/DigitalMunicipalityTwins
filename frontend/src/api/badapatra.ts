import { api, apiClient } from './client';
import type { CitizenCharterService, BadapatraSummary } from '../types/badapatra';

function parseDocuments(docStr: string | string[]): string[] {
  if (Array.isArray(docStr)) return docStr;
  if (!docStr) return ['आवश्यक कागजातको विवरण वडा/शाखाबाट उपलब्ध हुनेछ।'];
  // Split by numbered bullets like १), २), ३) or 1), 2)
  const split = docStr
    .split(/(?=[०-९\d]+[\)\.])/g)
    .map((s) => s.trim())
    .filter(Boolean);
  return split.length > 0 ? split : [docStr];
}

function mapService(item: any): CitizenCharterService {
  const isWard = item.isWardLevel ?? (
    item.type === 'ward' ||
    item.sourceType === 'ward' ||
    item.category === 'वडा कार्यालय' ||
    (typeof item.provider === 'string' && item.provider.includes('वडा')) ||
    (typeof item.department === 'string' && item.department.includes('वडा'))
  );

  return {
    id: String(item.id),
    name: item.title || item.serviceName || item.name || 'सेवा',
    category: item.category || (isWard ? 'वडा कार्यालय' : 'गाउँकार्यपालिका'),
    department: item.provider || item.departmentName || item.department || (isWard ? 'वडा कार्यालय' : 'गाउँपालिका केन्द्र'),
    isWardLevel: isWard,
    wardNo: item.wardNo !== undefined ? item.wardNo : (item.wardId !== undefined ? item.wardId : (isWard ? 'all' : undefined)),
    contactNo: item.contactNo,
    requiredDocuments: parseDocuments(item.document || item.requiredDocuments),
    fee: item.price || item.fee || 'निःशुल्क',
    timeRequired: item.serviceTime || item.processingTime || 'सोही दिन',
    responsibleOfficial: item.official || item.responsibleOfficial || (isWard ? 'वडा सचिव / वडा अध्यक्ष' : 'शाखा प्रमुख'),
    grievanceOfficial: isWard ? 'प्रमुख प्रशासकीय अधिकृत / गाउँपालिका उपाध्यक्ष' : 'प्रमुख प्रशासकीय अधिकृत',
    roomNo: item.room || item.roomNo || (isWard ? 'वडा प्रशासन कक्ष' : 'प्रशासन कक्ष'),
    procedure: item.remarks || item.procedure || 'फारम भरी आवश्यक कागजात संलग्न गरी कार्यालयमा पेश गर्ने।',
  };
}

export const badapatraApi = {
  getSummary: async (): Promise<BadapatraSummary> => {
    const res: any = await api.get('/badapatra/summary');
    const data = res?.data || res;
    return {
      totalServices: data?.stats?.totalServices || 0,
      wardServicesCount: data?.stats?.wardServicesCount || 0,
      palikaServicesCount: data?.stats?.palikaServicesCount || 0,
      freeServicesCount: 42,
      departmentCount: data?.stats?.departmentsCount || 0,
    };
  },

  getAllServices: async (q?: string): Promise<CitizenCharterService[]> => {
    const query = q ? `?q=${encodeURIComponent(q)}` : '';
    const res: any = await api.get(`/badapatra/services${query}`);
    const list = Array.isArray(res) ? res : res?.data && Array.isArray(res.data) ? res.data : [];
    return list.map((item: any) => mapService(item));
  },

  getWardLetters: async (wardId?: number, q?: string): Promise<CitizenCharterService[]> => {
    const params = new URLSearchParams();
    if (wardId) params.append('wardId', String(wardId));
    if (q) params.append('q', q);
    const query = params.toString() ? `?${params.toString()}` : '';
    const res: any = await api.get(`/badapatra/ward-letters${query}`);
    const list = Array.isArray(res) ? res : res?.data && Array.isArray(res.data) ? res.data : [];
    return list.map((item: any) => mapService({ ...item, isWardLevel: true }));
  },

  getServiceById: async (id: string): Promise<CitizenCharterService> => {
    const res: any = await api.get(`/badapatra/services/${id}`);
    const data = res?.data || res;
    return mapService(data);
  },

  createService: async (data: Partial<CitizenCharterService>): Promise<CitizenCharterService> => {
    const res: any = await api.post('/badapatra/services', data);
    const item = res?.data || res;
    return mapService(item);
  },

  updateService: async (id: string, data: Partial<CitizenCharterService>): Promise<CitizenCharterService> => {
    const res: any = await api.put(`/badapatra/services/${id}`, data);
    const item = res?.data || res;
    return mapService(item);
  },

  deleteService: async (id: string): Promise<{ success: boolean; message?: string }> => {
    const res: any = await api.delete(`/badapatra/services/${id}`);
    return res?.data || res;
  },

  generateSpeech: async (text: string): Promise<Blob> => {
    const res = await apiClient.post(
      '/tts/generate', 
      { text }, 
      { responseType: 'blob' }
    );
    return res.data;
  },
};
