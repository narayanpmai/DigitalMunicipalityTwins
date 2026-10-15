import { api } from './client';
import type { MunicipalityProfile, WardProfile, TouristDestination, GisFacility } from '../types/profile';

export const municipalityApi = {
  getProfile: async (): Promise<MunicipalityProfile> => {
    const res: any = await api.get('/municipality/profile');
    return res?.data || res;
  },

  updateProfile: async (data: Partial<MunicipalityProfile> | any): Promise<MunicipalityProfile> => {
    const res: any = await api.put('/municipality/profile', data);
    return res?.data || res;
  },

  getWards: async (): Promise<WardProfile[]> => {
    const res: any = await api.get('/wards');
    return Array.isArray(res) ? res : res?.data || [];
  },

  createWard: async (data: Partial<WardProfile>): Promise<WardProfile> => {
    const res: any = await api.post('/wards', data);
    return res?.data || res;
  },

  updateWard: async (id: string, data: Partial<WardProfile>): Promise<WardProfile> => {
    const res: any = await api.put(`/wards/${id}`, data);
    return res?.data || res;
  },

  deleteWard: async (id: string): Promise<void> => {
    await api.delete(`/wards/${id}`);
  },

  getDemographicsSummary: async (): Promise<any> => {
    const res: any = await api.get('/demographics/summary');
    return res?.data || res;
  },

  getTourismSpots: async (): Promise<TouristDestination[]> => {
    const res: any = await api.get('/tourism/destinations');
    return Array.isArray(res) ? res : res?.data || [];
  },

  getGisFacilities: async (): Promise<GisFacility[]> => {
    const res: any = await api.get('/gis/facilities');
    return Array.isArray(res) ? res : res?.data || [];
  },

  calculateBuffer: async (params: { lat: number; lng: number; buffer_meters?: number }) => {
    const res: any = await api.post('/gis/buffer-analysis', params);
    return res?.data || res;
  },

  analyzeRisk: async (params: { ward_no: number; hazard_type?: string }) => {
    const res: any = await api.post('/gis/risk-zoning', params);
    return res?.data || res;
  },

  getSensors: async (): Promise<SensorItem[]> => {
    const res: any = await api.get('/sensors');
    return Array.isArray(res) ? res : res?.data || [];
  },

  getSensorAlerts: async (): Promise<SensorItem[]> => {
    const res: any = await api.get('/sensors/alerts');
    return Array.isArray(res) ? res : res?.data || [];
  },

  pushSensorTelemetry: async (sensorId: string, value: number): Promise<SensorItem> => {
    return await api.post<SensorItem>('/sensors/telemetry', { sensorId, value });
  },

  getCameras: async (): Promise<CameraItem[]> => {
    const res: any = await api.get('/cameras');
    return Array.isArray(res) ? res : res?.data || [];
  },

  getCameraStats: async (): Promise<{ todayTotal: number; allTimeTotal: number }> => {
    const res: any = await api.get('/cameras/stats');
    return res?.data || res || { todayTotal: 0, allTimeTotal: 0 };
  },

  mockCameraPing: async (cameraId: string, count: number): Promise<CameraItem> => {
    const res: any = await api.post('/cameras/ping', { cameraId, count });
    return res?.data || res;
  },
};

export interface SensorItem {
  id: string;
  sensorId: string;
  name: string;
  type: string;
  location?: string;
  ward?: number;
  latitude: number;
  longitude: number;
  lastValue: number;
  currentValue?: number;
  unit: string;
  dangerThreshold?: number;
  thresholdCritical?: number;
  status: 'Normal' | 'Warning' | 'Critical';
  lastPing?: string;
}

export interface CameraItem {
  id: string;
  cameraId: string;
  name: string;
  type: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  status: 'Active' | 'Offline' | 'Maintenance';
  todayVisitorCount: number;
  totalVisitorCount: number;
  streamUrl?: string;
  lastPing?: string;
}


