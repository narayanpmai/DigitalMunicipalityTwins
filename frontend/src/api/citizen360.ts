import { api } from './client';
import {
  Household360Item,
  HouseholdSocioEconomic,
  Citizen360Item,
  CitizenApplicationItem,
  Citizen360Stats,
} from '../types/citizen360';

export const citizen360Api = {
  getStats: () => api.get<Citizen360Stats>('/citizen-360/stats'),

  getHouseholds: (params?: { ward_id?: string; disaster_risk?: string; search?: string }) =>
    api.get<Household360Item[]>('/citizen-360/households', { params }),

  getHouseholdDetail: (householdId: string) =>
    api.get<any>(`/citizen-360/households/${householdId}`),

  updateHouseholdSocioEconomic: (householdId: string, data: Partial<HouseholdSocioEconomic>) =>
    api.put<HouseholdSocioEconomic>(`/citizen-360/households/${householdId}/socio-economic`, data),

  getCitizens: (params?: { search?: string }) =>
    api.get<Citizen360Item[]>('/citizen-360/citizens', { params }),

  getCitizen360: (citizenId: string) =>
    api.get<any>(`/citizen-360/citizens/${citizenId}/360`),

  getApplications: (params?: { citizen_id?: string; status?: string; search?: string }) =>
    api.get<CitizenApplicationItem[]>('/citizen-360/applications', { params }),

  createApplication: (data: { citizenId: string; serviceModule: string; applicationRefNo?: string; status?: string }) =>
    api.post<CitizenApplicationItem>('/citizen-360/applications', data),
};
