import { api } from './client';

export interface DisasterEvent {
  id?: string;
  title: string;
  type: 'landslide' | 'flood' | 'fire' | 'earthquake' | 'accident' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'resolved' | 'cancelled';
  description: string;
  lat?: number;
  lng?: number;
  wardNumber?: number;
  reporterName?: string;
  reporterPhone?: string;
  incidentDateBs?: string;
  affectedHouseholds?: number;
  affectedPeople?: number;
  humanCasualties?: number;
  missingPersons?: number;
  injuredCount?: number;
  livestockLossCount?: number;
  fullyDamagedHouses?: number;
  partiallyDamagedHouses?: number;
  estimatedLossNPR?: number;
  reliefStatus?: string;
  reliefMaterials?: string;
  reliefDisbursedNPR?: number;
  dateReportedBs?: string;
  reliefDistributed?: string;
  rescueTeam?: string;
  resolvedAt?: string;
  tolsSettlement?: string;
}

export interface EmergencyContact {
  id?: string;
  name: string;
  role: string;
  phone: string;
  wardNumber?: number;
  category: 'ambulance' | 'police' | 'fire' | 'hospital' | 'local_rep' | 'other';
  department?: string;
  isAvailable24_7?: boolean;
}

export interface Shelter {
  id?: string;
  name: string;
  wardNumber: number;
  location: string;
  capacity: number;
  hasWater: boolean;
  hasPowerBackup: boolean;
  contactPerson?: string;
  contactPhone?: string;
  lat?: number;
  lng?: number;
  status: 'active' | 'standby' | 'full';
  facilitiesDescription?: string;
}

// ─── स्थानीय तह आपतकालीन राहत सामग्री भण्डार (Relief Inventory) ─────────────────
export interface ReliefInventoryItem {
  id: string;
  itemName: string;
  category: 'shelter' | 'search_rescue' | 'food' | 'medical' | 'clothing';
  quantity: number;
  unit: string;
  warehouseLocation: string;
  wardNumber: number;
  condition: 'good' | 'needs_restock' | 'damaged';
  lastUpdatedBs: string;
  contactPerson?: string;
}

// ─── पालिका विपद् कोष राहत वितरण (Disaster Relief Fund Disbursement) ───────────
export interface DisasterFundDistribution {
  id: string;
  disasterTitle: string;
  wardNumber: number;
  beneficiaryName: string;
  citizenshipNo?: string;
  familyCount: number;
  reliefType: 'नगद राहत (DBT)' | 'खाद्यान्न सामग्री' | 'त्रिपाल/टेन्ट' | 'पुनर्स्थापना सहयोग' | 'घाइते उपचार सहयोग';
  amountNPR: number;
  distributionDateBs: string;
  disbursedByOfficer: string;
  voucherNo?: string;
  status: 'वितरण सम्पन्न' | 'प्रक्रियामा';
}

// ─── उच्च जोखिमयुक्त बस्ती पहिचान तथा स्थानान्तरण योजना (Vulnerable Settlements) ─
export interface VulnerableSettlement {
  id: string;
  settlementName: string;
  wardNumber: number;
  hazardType: 'पहिरो (Landslide)' | 'बाढी/कटान (Flood)' | 'हिमपात/हिमपहिरो (Snow)' | 'डढेलो (Wildfire)';
  riskLevel: 'अति उच्च' | 'उच्च' | 'मध्यम';
  atRiskHouseholds: number;
  atRiskPopulation: number;
  resettlementPriority: 'तत्काल सुरक्षित स्थानान्तरण' | 'पूर्वतयारी तथा सतर्कता' | 'तटबन्धन/रोकथाम निर्माण';
  safeShelterName?: string;
  focalPerson?: string;
  focalPersonPhone?: string;
}

// ─── विपद् पुनःलाभ तथा पुनर्निर्माण आयोजनाहरू (Recovery & Reconstruction) ──
export interface RecoveryProject {
  id: string;
  tenant_id?: string;
  incident_id: string;
  incident_type?: string;
  incident_description?: string;
  ward_id?: string;
  project_id?: string | null;
  reconstruction_type: string;
  beneficiary_household_id?: string | null;
  recovery_status: 'Planned' | 'In Progress' | 'Completed' | 'Under Inspection';
  created_at?: string;
  updated_at?: string;
}

export interface RecoveryProjectStats {
  totalProjects: number;
  completedProjects: number;
  inProgressProjects: number;
  plannedProjects: number;
  beneficiariesLinked: number;
  typeBreakdown: Record<string, number>;
  statusBreakdown: Record<string, number>;
}

export interface DamageReport {
  id: string;
  tenant_id?: string;
  incident_id: string;
  incident_description?: string;
  affected_household_id?: string | null;
  affected_infrastructure_id?: string | null;
  human_casualties: number;
  injured_count: number;
  estimated_loss_amount: number;
  relief_provided: Record<string, any>;
  created_at?: string;
}

export const disasterApi = {
  // Events
  getEvents: () => api.get<DisasterEvent[]>('/disaster/events'),
  getActiveEvents: () => api.get<DisasterEvent[]>('/disaster/active'),
  createEvent: (data: Partial<DisasterEvent>) => api.post<DisasterEvent>('/disaster/events', data),
  updateEvent: (id: string, data: Partial<DisasterEvent>) => api.put<DisasterEvent>(`/disaster/events/${id}`, data),
  deleteEvent: (id: string) => api.delete(`/disaster/events/${id}`),
  
  // Contacts
  getContacts: () => api.get<EmergencyContact[]>('/disaster/contacts'),
  createContact: (data: Partial<EmergencyContact>) => api.post<EmergencyContact>('/disaster/contacts', data),
  updateContact: (id: string, data: Partial<EmergencyContact>) => api.put<EmergencyContact>(`/disaster/contacts/${id}`, data),
  deleteContact: (id: string) => api.delete(`/disaster/contacts/${id}`),
  
  // Shelters (सुरक्षित आश्रयस्थल)
  getShelters: () => api.get<Shelter[]>('/disaster/shelters'),
  createShelter: (data: Partial<Shelter>) => api.post<Shelter>('/disaster/shelters', data),
  updateShelter: (id: string, data: Partial<Shelter>) => api.put<Shelter>(`/disaster/shelters/${id}`, data),
  deleteShelter: (id: string) => api.delete(`/disaster/shelters/${id}`),

  // Stats
  getStats: () => api.get('/disaster/stats'),

  // Relief Inventory
  getInventory: () => api.get<ReliefInventoryItem[]>('/disaster/inventory'),
  createInventoryItem: (data: Partial<ReliefInventoryItem>) => api.post<ReliefInventoryItem>('/disaster/inventory', data),

  // Relief Funds
  getFunds: () => api.get<DisasterFundDistribution[]>('/disaster/funds'),
  createFund: (data: Partial<DisasterFundDistribution>) => api.post<DisasterFundDistribution>('/disaster/funds', data),

  // Vulnerable Settlements
  getSettlements: () => api.get<VulnerableSettlement[]>('/disaster/settlements'),
  createSettlement: (data: Partial<VulnerableSettlement>) => api.post<VulnerableSettlement>('/disaster/settlements', data),

  // Recovery & Reconstruction Projects
  getRecoveryProjects: (params?: { status?: string; reconstruction_type?: string; incident_id?: string; search?: string }) =>
    api.get<RecoveryProject[]>('/disaster/recovery-projects', { params }),
  getRecoveryProjectsStats: () =>
    api.get<RecoveryProjectStats>('/disaster/recovery-projects/stats'),
  createRecoveryProject: (data: Partial<RecoveryProject>) =>
    api.post<RecoveryProject>('/disaster/recovery-projects', data),
  updateRecoveryProjectStatus: (id: string, status: string) =>
    api.put<RecoveryProject>(`/disaster/recovery-projects/${id}/status`, { status }),
  deleteRecoveryProject: (id: string) =>
    api.delete(`/disaster/recovery-projects/${id}`),

  // Damage Reports
  getDamageReports: (params?: { incident_id?: string }) =>
    api.get<DamageReport[]>('/disaster/damage-reports', { params }),
  createDamageReport: (data: Partial<DamageReport>) =>
    api.post<DamageReport>('/disaster/damage-reports', data),

  // GIS
  getGisLayers: () => api.get('/disaster/gis'),
};
