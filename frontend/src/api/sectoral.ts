import { api } from "./client";
import type {
  AgricultureRecord,
  LivestockRecord,
  Project,
  DisasterEvent,
  EmergencyContact,
} from "../types/sectoral";
import type {
  HealthFacility,
  AmbulanceContact,
  BloodStockItem,
  ImmunizationSchedule,
  HealthDhis2Report,
  Dhis2Summary,
  MedicineStockItem,
  PatientRecord,
  IpdAdmission,
  LabTestRecord,
  HealthPrescription,
  HealthDischargeSummary,
  PatientFullEhrHistory,
  AutoCalculatedDhis2Metrics,
  HealthSupplier,
  HealthPurchase,
  MedicineBatch,
  HealthPosSale,
  HealthInsuranceClaim,
  HealthInsuranceSummary,
  HealthStockTransfer,
} from "../types/health";
import type { School, EducationOverviewStats, Student, Teacher, NutritionRecord, StudentAssessment, AssessmentStats } from "../types/education";
import type { LibraryBook, BorrowRecord, LibraryStats } from "../types/library";

export const sectoralApi = {
  // Agriculture & Livestock
  getAgricultureRecords: async (
    wardNo?: number,
  ): Promise<AgricultureRecord[]> => {
    const query = wardNo && wardNo !== 0 ? `?ward=${wardNo}` : "";
    const res: any = await api.get(`/agriculture${query}`);
    const rawList = Array.isArray(res) ? res : res?.data || [];
    return rawList.map((a: any) => ({
      id: String(a.id),
      wardNo: a.wardNumber || a.wardNo || 0,
      cropName: a.cropName || '',
      category: a.cropType || a.category || '',
      cultivatedAreaHectares: Number(a.areaHectares || a.cultivatedAreaHectares || 0),
      annualProductionMetricTons: Number(a.productionMt || a.annualProductionMetricTons || 0),
      yieldPerHectare: a.yieldPerHectare || (a.areaHectares && a.productionMt ? +(Number(a.productionMt) / Number(a.areaHectares)).toFixed(1) : 0),
      farmerHouseholds: Number(a.farmerHouseholds || 0),
      subsidiesProvidedNpr: Number(a.subsidiesProvidedNpr || 0),
      remarks: a.remarks || a.fiscalYear || '',
    }));
  },

  createAgricultureRecord: async (data: any): Promise<any> => {
    return api.post('/agriculture', data);
  },

  getLivestockRecords: async (): Promise<LivestockRecord[]> => {
    const res: any = await api.get("/livestock");
    const rawList = Array.isArray(res) ? res : res?.data || [];
    const formatted: LivestockRecord[] = [];
    rawList.forEach((l: any) => {
      if (l.animalNameNepali) {
        formatted.push(l);
        return;
      }
      if (l.cattle) {
        formatted.push({
          id: `${l.id}-cattle`,
          wardNo: l.wardNumber || 0,
          animalType: 'cattle',
          animalNameNepali: 'गाई तथा गोरु',
          count: l.cattle,
          milkProductionLitersPerDay: Number(l.milkProductionLiters || 0),
          meatProductionKg: Number(l.meatProductionKg || 0),
          farmsCount: Number(l.totalHouseholdsRearing || 0),
        });
      }
      if (l.buffaloes) {
        formatted.push({
          id: `${l.id}-buffaloes`,
          wardNo: l.wardNumber || 0,
          animalType: 'cattle',
          animalNameNepali: 'भैँसी तथा राँगा',
          count: l.buffaloes,
          milkProductionLitersPerDay: Number(l.milkProductionLiters || 0),
          meatProductionKg: Number(l.meatProductionKg || 0),
          farmsCount: Number(l.totalHouseholdsRearing || 0),
        });
      }
      if (l.yaks && l.yaks > 0) {
        formatted.push({
          id: `${l.id}-yaks`,
          wardNo: l.wardNumber || 0,
          animalType: 'yak_chauri',
          animalNameNepali: 'याक तथा चौँरीगाई',
          count: l.yaks,
          milkProductionLitersPerDay: 0,
          meatProductionKg: 0,
          farmsCount: 0,
        });
      }
      if (l.goats) {
        formatted.push({
          id: `${l.id}-goats`,
          wardNo: l.wardNumber || 0,
          animalType: 'goat',
          animalNameNepali: 'उन्नत बाख्रा तथा च्याङ्ग्रा',
          count: l.goats,
          meatProductionKg: Number(l.meatProductionKg || 0),
          farmsCount: Number(l.totalHouseholdsRearing || 0),
        });
      }
      if (l.poultry) {
        formatted.push({
          id: `${l.id}-poultry`,
          wardNo: l.wardNumber || 0,
          animalType: 'poultry',
          animalNameNepali: 'लेयर्स तथा ब्रोइलर कुखुरा',
          count: l.poultry,
          meatProductionKg: 0,
          farmsCount: 0,
        });
      }
    });
    return formatted.length > 0 ? formatted : rawList;
  },

  createLivestockRecord: async (data: any): Promise<any> => {
    return api.post('/livestock', data);
  },




  // Projects & Infrastructure
  getProjects: async (params?: {
    ward?: number;
    status?: string;
    sector?: string;
    search?: string;
    fiscalYear?: string;
    budgetSource?: string;
    level?: string;
    marfat?: string;
    date?: string;
  }): Promise<Project[]> => {
    const qs = new URLSearchParams();
    if (params?.ward !== undefined && params.ward !== 0)
      qs.append("ward", params.ward.toString());
    if (params?.status && params.status !== "all")
      qs.append("status", params.status);
    if (params?.sector && params.sector !== "all")
      qs.append("sector", params.sector);
    if (params?.fiscalYear && params.fiscalYear !== "all")
      qs.append("fiscalYear", params.fiscalYear);
    if (params?.budgetSource && params.budgetSource !== "all")
      qs.append("budgetSource", params.budgetSource);
    if (params?.level && params.level !== "all")
      qs.append("level", params.level);
    if (params?.marfat && params.marfat !== "all")
      qs.append("marfat", params.marfat);
    if (params?.date) qs.append("date", params.date);
    if (params?.search) qs.append("search", params.search);

    const queryStr = qs.toString();
    const res: any = await api.get(
      `/projects${queryStr ? `?${queryStr}` : ""}`,
    );
    const rawList = Array.isArray(res)
      ? res
      : res?.data && Array.isArray(res.data)
        ? res.data
        : [];
    return rawList.map((p: any) => ({
      id: String(p.id),
      projectCode: p.projectCode || `PPK-W0${p.wardNumber || 1}-PRJ`,
      name: p.name || 'योजना',
      nameEn: p.nameEn,
      description: p.description || '',
      wardNumber: Number(p.wardNumber) || 0,
      sector: p.sector || 'सडक/पूर्वाधार',
      fiscalYear: p.fiscalYear || '०८२/०८३',
      allocatedBudget: Number(p.budget || p.allocatedBudget || p.officeCost || 0),
      expenditureAmount: Number(p.paidAmount || p.expenditureAmount || 0),
      physicalProgressPercent: Number(p.progressPercentage || p.physicalProgressPercent || 0),
      status: p.status || 'ongoing',
      contractorName: p.contractor || p.contractorName || p.committeeName || 'उपभोक्ता समिति',
      startDate: p.startDate,
      targetEndDate: p.completionDate || p.targetEndDate,
      qrCodeUrl: p.qrCode || p.qrCodeUrl,

      // Agreement Specifics
      level: p.level || 'नगर स्तरिय',
      marfat: p.marfat || 'उपभोक्ता समिति',
      budgetSource: p.budgetSource || p.fundingSource || 'संघीय सरकार वित्तीय समानीकरण अनुदान',
      budgetSubHead: p.budgetSubHead || '',
      officeCost: Number(p.officeCost !== undefined ? p.officeCost : (p.budget || 0)),
      committeeCost: Number(p.committeeCost !== undefined ? p.committeeCost : 0),
      startDateBs: p.startDateBs || p.agreementDateBs || '',
      completionDateBs: p.completionDateBs || '',
      agreementDateBs: p.agreementDateBs || '',
      palikaGrant: Number(p.palikaGrant || p.budget || 0),
      communityContribution: Number(p.communityContribution || p.committeeCost || 0),
      totalAgreementAmount: Number(p.totalAgreementAmount || p.budget || 0),
      paidAmount: Number(p.paidAmount || 0),
      financialProgress: Number(p.financialProgress || 0),
      agreementStatus: p.agreementStatus || 'agreed',
      committeeName: p.committeeName || '',
      committeeChair: p.committeeChair || '',
      committeeSecretary: p.committeeSecretary || '',
      committeeTreasurer: p.committeeTreasurer || '',
      committeePhone: p.committeePhone || '',
      contingencyAmount: Number(p.contingencyAmount || 0),
      virementDetails: p.virementDetails || null,
      installmentDetails: p.installmentDetails || null,
      workOrderNumber: p.workOrderNumber || '',
      workOrderDateBs: p.workOrderDateBs || '',
      committeeBankDetails: p.committeeBankDetails || null,
      committeeMembers: p.committeeMembers || [],
      monitoringRecords: p.monitoringRecords || [],
      measurementBook: p.measurementBook || [],
      socialAudit: p.socialAudit || null,
      farfarakDetails: p.farfarakDetails || null,
      latitude: p.latitude,
      longitude: p.longitude,
      location: p.location || '',
    }));
  },

  createProject: async (data: any): Promise<any> => {
    return api.post('/projects', data);
  },

  updateProject: async (id: string, data: any): Promise<any> => {
    return api.put(`/projects/${id}`, data);
  },

  deleteProject: async (id: string): Promise<any> => {
    return api.delete(`/projects/${id}`);
  },

  bulkImportProjects: async (records: any[]): Promise<any> => {
    return api.post('/projects/bulk', { records });
  },

  transferProjectBudget: async (id: string, data: { targetProjectId?: string; amount: number; remarks?: string; type?: 'transfer' | 'add' }): Promise<any> => {
    return api.post(`/projects/${id}/transfer-budget`, data);
  },

  addProjectMonitoring: async (id: string, data: any): Promise<any> => {
    return api.post(`/projects/${id}/monitoring`, data);
  },

  addProjectMeasurementBook: async (id: string, data: any): Promise<any> => {
    return api.post(`/projects/${id}/measurement-book`, data);
  },

  updateProjectSocialAudit: async (id: string, data: any): Promise<any> => {
    return api.post(`/projects/${id}/social-audit`, data);
  },

  processProjectFarfarak: async (id: string, data: any): Promise<any> => {
    return api.post(`/projects/${id}/farfarak`, data);
  },

  updateProjectCommitteeBank: async (id: string, data: any): Promise<any> => {
    return api.post(`/projects/${id}/committee-bank`, data);
  },

  updateProjectCommitteeMembers: async (id: string, members: any[]): Promise<any> => {
    return api.post(`/projects/${id}/committee-members`, members);
  },

  getProjectStats: async (): Promise<any> => {
    const res: any = await api.get('/projects/stats');
    return res?.data || res;
  },


  // Disaster Management & Early Warning
  getDisasterEvents: async (): Promise<DisasterEvent[]> => {
    const res: any = await api.get("/disaster/events");
    return Array.isArray(res) ? res : res?.data || [];
  },

  createDisasterEvent: async (data: Partial<DisasterEvent>): Promise<DisasterEvent> => {
    const res: any = await api.post("/disaster/events", data);
    return res?.data || res;
  },

  updateDisasterEvent: async (id: string, data: Partial<DisasterEvent>): Promise<DisasterEvent> => {
    const res: any = await api.put(`/disaster/events/${id}`, data);
    return res?.data || res;
  },

  deleteDisasterEvent: async (id: string): Promise<any> => {
    const res: any = await api.delete(`/disaster/events/${id}`);
    return res?.data || res;
  },

  getEmergencyContacts: async (): Promise<EmergencyContact[]> => {
    const res: any = await api.get("/disaster/contacts");
    return Array.isArray(res) ? res : res?.data || [];
  },

  createEmergencyContact: async (data: Partial<EmergencyContact>): Promise<EmergencyContact> => {
    const res: any = await api.post("/disaster/contacts", data);
    return res?.data || res;
  },

  deleteEmergencyContact: async (id: string): Promise<any> => {
    const res: any = await api.delete(`/disaster/contacts/${id}`);
    return res?.data || res;
  },

  // Health Services
  getHealthFacilities: async (wardNo?: number): Promise<HealthFacility[]> => {
    try {
      const res: any = await api.get(
        `/health/facilities${wardNo && wardNo !== 0 ? `?ward=${wardNo}` : ""}`,
      );
      const rawList = Array.isArray(res)
        ? res
        : res?.data && Array.isArray(res.data)
          ? res.data
          : [];
      if (rawList.length > 0) {
        return rawList.map((f: any) => ({
          ...f,
          id: String(f.id),
          orderNo: f.orderNo || 0,
          address: f.address || '',
          nameNepali: f.nameNepali || f.name || '',
          nameEnglish: f.nameEn || f.nameEnglish || f.name || '',
          categoryNepali: f.categoryNepali || '',
          wardNumber: f.wardNumber || 0,
          location: f.location || '',
          designation: f.designation || '',
          chiefName: f.chiefName || f.inChargeName || '',
          inChargeName: f.chiefName || f.inChargeName || '',
          phone: f.phone || f.contactNumber || '',
          contactNumber: f.phone || f.contactNumber || '',
          latitude: f.latitude !== undefined && f.latitude !== null ? Number(f.latitude) : (f.lat ? Number(f.lat) : undefined),
          longitude: f.longitude !== undefined && f.longitude !== null ? Number(f.longitude) : (f.lng ? Number(f.lng) : undefined),
        }));
      }
    } catch {}
    return [];
  },

  createHealthFacility: async (data: any): Promise<HealthFacility> => {
    const res: any = await api.post('/health', data);
    return res?.data || res;
  },

  updateHealthFacility: async (id: string, data: any): Promise<HealthFacility> => {
    const res: any = await api.put(`/health/${id}`, data);
    return res?.data || res;
  },

  deleteHealthFacility: async (id: string): Promise<any> => {
    return api.delete(`/health/${id}`);
  },

  getAmbulanceContacts: async (ward?: number): Promise<AmbulanceContact[]> => {
    try {
      const res: any = await api.get('/health/ambulances', { params: ward ? { ward } : {} });
      const data = res?.data || res;
      if (Array.isArray(data) && data.length > 0) {
        localStorage.setItem('p5_ambulances_data', JSON.stringify(data));
        return data;
      }
    } catch (e) {
      // ignore and use fallback
    }

    const cached = localStorage.getItem('p5_ambulances_data');
    if (cached) {
      try {
        const list = JSON.parse(cached);
        if (Array.isArray(list) && list.length > 0) {
          if (ward) return list.filter((a: any) => Number(a.wardNumber) === Number(ward));
          return list;
        }
      } catch {}
    }

    const defaultList: AmbulanceContact[] = [
      {
        id: "amb1",
        driverName: "दावा लामा",
        vehicleNumber: "बा २ झ ५४२१ (गाउँपालिका एम्बुलेन्स)",
        contactNumber: "9841556677",
        stationLocation: "थाङपालधाप अस्पताल",
        wardNumber: 3,
        isAvailable: true,
        notes: "२४/७ सेवा उपलब्ध",
      },
      {
        id: "amb2",
        driverName: "सोमबहादुर तामाङ",
        vehicleNumber: "बा ३ झ १२८९ (रेडक्रस एम्बुलेन्स)",
        contactNumber: "9841889900",
        stationLocation: "भोताङ स्वास्थ्य चौकी",
        wardNumber: 2,
        isAvailable: true,
        notes: "रेडक्रस सोसाइटी स्थानीय एकाइ",
      },
      {
        id: "amb3",
        driverName: "दिनेश गिरी",
        vehicleNumber: "बा १ झ ८७६२ (आकस्मिक एम्बुलेन्स)",
        contactNumber: "9860334455",
        stationLocation: "मानेखर्क",
        wardNumber: 4,
        isAvailable: false,
        notes: "नियमित मर्मत सम्भारमा रहेको",
      },
    ];
    localStorage.setItem('p5_ambulances_data', JSON.stringify(defaultList));
    return defaultList;
  },

  createAmbulanceContact: async (data: Partial<AmbulanceContact>): Promise<AmbulanceContact> => {
    try {
      const res: any = await api.post('/health/ambulances', data);
      const item = res?.data || res;
      if (item && item.id) {
        const current: AmbulanceContact[] = JSON.parse(localStorage.getItem('p5_ambulances_data') || '[]');
        current.push(item);
        localStorage.setItem('p5_ambulances_data', JSON.stringify(current));
        return item;
      }
    } catch (e) {
      // Local fallback
    }

    const current: AmbulanceContact[] = JSON.parse(localStorage.getItem('p5_ambulances_data') || '[]');
    const newAmb: AmbulanceContact = {
      id: 'amb-' + Date.now(),
      driverName: data.driverName || '',
      vehicleNumber: data.vehicleNumber || '',
      contactNumber: data.contactNumber || '',
      stationLocation: data.stationLocation || '',
      wardNumber: Number(data.wardNumber) || 1,
      isAvailable: data.isAvailable !== undefined ? Boolean(data.isAvailable) : true,
      notes: data.notes || '',
    };
    current.push(newAmb);
    localStorage.setItem('p5_ambulances_data', JSON.stringify(current));
    return newAmb;
  },

  updateAmbulanceContact: async (id: string, data: Partial<AmbulanceContact>): Promise<AmbulanceContact> => {
    try {
      const res: any = await api.put(`/health/ambulances/${id}`, data);
      const item = res?.data || res;
      if (item) {
        const current: AmbulanceContact[] = JSON.parse(localStorage.getItem('p5_ambulances_data') || '[]');
        const idx = current.findIndex((a) => a.id === id);
        if (idx !== -1) {
          current[idx] = item;
          localStorage.setItem('p5_ambulances_data', JSON.stringify(current));
        }
        return item;
      }
    } catch (e) {
      // Local fallback
    }

    const current: AmbulanceContact[] = JSON.parse(localStorage.getItem('p5_ambulances_data') || '[]');
    const idx = current.findIndex((a) => a.id === id);
    if (idx !== -1) {
      current[idx] = { ...current[idx], ...data };
      localStorage.setItem('p5_ambulances_data', JSON.stringify(current));
      return current[idx];
    }
    throw new Error('Ambulance not found');
  },

  toggleAmbulanceAvailability: async (id: string): Promise<AmbulanceContact> => {
    try {
      const res: any = await api.patch(`/health/ambulances/${id}/toggle-status`);
      const item = res?.data || res;
      if (item) {
        const current: AmbulanceContact[] = JSON.parse(localStorage.getItem('p5_ambulances_data') || '[]');
        const idx = current.findIndex((a) => a.id === id);
        if (idx !== -1) {
          current[idx] = item;
          localStorage.setItem('p5_ambulances_data', JSON.stringify(current));
        }
        return item;
      }
    } catch (e) {
      // Local fallback
    }

    const current: AmbulanceContact[] = JSON.parse(localStorage.getItem('p5_ambulances_data') || '[]');
    const idx = current.findIndex((a) => a.id === id);
    if (idx !== -1) {
      current[idx].isAvailable = !current[idx].isAvailable;
      localStorage.setItem('p5_ambulances_data', JSON.stringify(current));
      return current[idx];
    }
    throw new Error('Ambulance not found');
  },

  deleteAmbulanceContact: async (id: string): Promise<any> => {
    try {
      await api.delete(`/health/ambulances/${id}`);
    } catch (e) {
      // Local fallback
    }

    const current: AmbulanceContact[] = JSON.parse(localStorage.getItem('p5_ambulances_data') || '[]');
    const filtered = current.filter((a) => a.id !== id);
    localStorage.setItem('p5_ambulances_data', JSON.stringify(filtered));
    return { success: true };
  },

  getBloodStock: async (): Promise<BloodStockItem[]> => {
    return [
      { bloodGroup: "A+", unitsAvailable: 12, status: "sufficient" },
      { bloodGroup: "B+", unitsAvailable: 8, status: "sufficient" },
      { bloodGroup: "O+", unitsAvailable: 15, status: "sufficient" },
      { bloodGroup: "AB+", unitsAvailable: 4, status: "moderate" },
      { bloodGroup: "A-", unitsAvailable: 2, status: "critical" },
      { bloodGroup: "B-", unitsAvailable: 1, status: "critical" },
      { bloodGroup: "O-", unitsAvailable: 3, status: "moderate" },
      { bloodGroup: "AB-", unitsAvailable: 1, status: "critical" },
    ];
  },

  getImmunizationSchedule: async (): Promise<ImmunizationSchedule[]> => {
    return [
      {
        id: "imm1",
        vaccineName: "बीसीजी / पेन्टाभ्यालेन्ट / पोलियो",
        targetGroup: "० देखि १५ महिनाका बालबालिका",
        scheduledDay: "प्रत्येक महिनाको १५ गते",
        location: "सबै वडाका स्वास्थ्य चौकी तथा खोप क्लिनिक",
        wardNumber: 0,
      },
      {
        id: "imm2",
        vaccineName: "दादुरा-रुबेला (MR Second Dose)",
        targetGroup: "९ र १५ महिनाका शिशुहरू",
        scheduledDay: "प्रत्येक महिनाको २२ गते",
        location: "थाङपालधाप, भोताङ र गुन्सा",
        wardNumber: 3,
      },
      {
        id: "imm3",
        vaccineName: "एचपीभी खोप (HPV Vaccine)",
        targetGroup: "कक्षा ६ देखि १० का किशोरीहरू",
        scheduledDay: "वार्षिक अभियान (असोज १०-१५)",
        location: "पालिकाभित्रका सबै माध्यमिक विद्यालयहरू",
        wardNumber: 0,
      },
      {
        id: "imm4",
        vaccineName: "टि.डी. खोप (Tetanus Diphtheria)",
        targetGroup: "गर्भवती महिलाहरू",
        scheduledDay: "नियमित गर्भजाँचको समयमा (ANC)",
        location: "प्रसूति सेवा उपलब्ध स्वास्थ्य संस्थाहरू",
        wardNumber: 0,
      },
    ];
  },

  // DHIS2 / HMIS Reporting & e-LMIS
  getDhis2Reports: async (query?: { ward?: number; month?: string; fiscalYear?: string }): Promise<HealthDhis2Report[]> => {
    try {
      const res: any = await api.get('/health/dhis2/reports', { params: query });
      return Array.isArray(res) ? res : res?.data || [];
    } catch {
      return [];
    }
  },

  getDhis2Summary: async (): Promise<Dhis2Summary> => {
    try {
      const res: any = await api.get('/health/dhis2/summary');
      return res?.data || res;
    } catch {
      return { totalReports: 0, syncedReports: 0, pendingReports: 0, totalOpd: 0, totalDeliveries: 0, totalImmunized: 0, totalGrowthMonitored: 0 };
    }
  },

  createDhis2Report: async (data: Partial<HealthDhis2Report>): Promise<HealthDhis2Report> => {
    return api.post('/health/dhis2/reports', data);
  },

  updateDhis2Report: async (id: string, data: Partial<HealthDhis2Report>): Promise<HealthDhis2Report> => {
    return api.put(`/health/dhis2/reports/${id}`, data);
  },

  deleteDhis2Report: async (id: string): Promise<any> => {
    return api.delete(`/health/dhis2/reports/${id}`);
  },

  syncDhis2Report: async (id: string): Promise<HealthDhis2Report> => {
    return api.post(`/health/dhis2/reports/${id}/sync`);
  },

  getMedicineStock: async (query?: { ward?: number; status?: string; search?: string }): Promise<MedicineStockItem[]> => {
    try {
      const res: any = await api.get('/health/medicines', { params: query });
      return Array.isArray(res) ? res : res?.data || [];
    } catch {
      return [];
    }
  },

  createMedicine: async (data: Partial<MedicineStockItem>): Promise<MedicineStockItem> => {
    return api.post('/health/medicines', data);
  },

  updateMedicine: async (id: string, data: Partial<MedicineStockItem>): Promise<MedicineStockItem> => {
    return api.put(`/health/medicines/${id}`, data);
  },

  deleteMedicine: async (id: string): Promise<any> => {
    return api.delete(`/health/medicines/${id}`);
  },

  // Primary Hospital: Patient Registration & OPD Ticketing
  getPatients: async (query?: { ward?: number; department?: string; status?: string; search?: string }): Promise<PatientRecord[]> => {
    try {
      const res: any = await api.get('/health/patients', { params: query });
      return Array.isArray(res) ? res : res?.data || [];
    } catch {
      return [];
    }
  },

  createPatient: async (data: Partial<PatientRecord>): Promise<PatientRecord> => {
    return api.post('/health/patients', data);
  },

  updatePatient: async (id: string, data: Partial<PatientRecord>): Promise<PatientRecord> => {
    return api.put(`/health/patients/${id}`, data);
  },

  // Primary Hospital: In-Patient Department (IPD 15 Beds)
  getIpdAdmissions: async (status?: string): Promise<IpdAdmission[]> => {
    try {
      const res: any = await api.get('/health/ipd/admissions', { params: { status } });
      return Array.isArray(res) ? res : res?.data || [];
    } catch {
      return [];
    }
  },

  admitPatient: async (data: Partial<IpdAdmission>): Promise<IpdAdmission> => {
    return api.post('/health/ipd/admissions', data);
  },

  dischargePatient: async (id: string, data?: { dischargeDate?: string; treatmentSummary?: string }): Promise<IpdAdmission> => {
    return api.put(`/health/ipd/admissions/${id}/discharge`, data || {});
  },

  // Primary Hospital: Laboratory Tests
  getLabTests: async (query?: { status?: string; search?: string }): Promise<LabTestRecord[]> => {
    try {
      const res: any = await api.get('/health/lab/tests', { params: query });
      return Array.isArray(res) ? res : res?.data || [];
    } catch {
      return [];
    }
  },

  createLabTest: async (data: Partial<LabTestRecord>): Promise<LabTestRecord> => {
    return api.post('/health/lab/tests', data);
  },

  updateLabTest: async (id: string, data: Partial<LabTestRecord>): Promise<LabTestRecord> => {
    return api.put(`/health/lab/tests/${id}`, data);
  },

  // E-Prescriptions & Pharmacy Dispensing
  getPrescriptions: async (query?: { ward?: number; status?: string; patientNo?: string; search?: string }): Promise<HealthPrescription[]> => {
    try {
      const res: any = await api.get('/health/prescriptions', { params: query });
      return Array.isArray(res) ? res : res?.data || [];
    } catch {
      return [];
    }
  },

  createPrescription: async (data: Partial<HealthPrescription>): Promise<HealthPrescription> => {
    return api.post('/health/prescriptions', data);
  },

  dispensePrescription: async (id: string, pharmacistName?: string): Promise<HealthPrescription> => {
    return api.post(`/health/prescriptions/${id}/dispense`, { pharmacistName });
  },

  // Automated DHIS2 / HMIS Metric Calculation
  autoCalculateDhis2Metrics: async (params?: { fiscalYear?: string; month?: string; ward?: number }): Promise<AutoCalculatedDhis2Metrics> => {
    const res: any = await api.get('/health/dhis2/auto-calculate', { params });
    return res?.data || res;
  },

  // 15-Bed IPD Clinical Discharge Summary
  createDischargeSummary: async (data: Partial<HealthDischargeSummary>): Promise<HealthDischargeSummary> => {
    return api.post('/health/ipd/discharge-summary', data);
  },

  getDischargeSummary: async (admissionId: string): Promise<HealthDischargeSummary | null> => {
    try {
      const res: any = await api.get(`/health/ipd/discharge-summary/${admissionId}`);
      return res?.data || res || null;
    } catch {
      return null;
    }
  },

  // Patient Comprehensive EHR History
  getPatientFullHistory: async (patientNo: string): Promise<PatientFullEhrHistory> => {
    const res: any = await api.get(`/health/patients/${encodeURIComponent(patientNo)}/full-history`);
    return res?.data || res;
  },

  // ── Hospital ERP: Suppliers Management ──────────────────────────────
  getSuppliers: async (query?: { search?: string }): Promise<HealthSupplier[]> => {
    try {
      const res: any = await api.get('/health/suppliers', { params: query });
      return Array.isArray(res) ? res : res?.data || [];
    } catch {
      return [];
    }
  },

  createSupplier: async (data: Partial<HealthSupplier>): Promise<HealthSupplier> => {
    return api.post('/health/suppliers', data);
  },

  updateSupplier: async (id: string, data: Partial<HealthSupplier>): Promise<HealthSupplier> => {
    return api.put(`/health/suppliers/${id}`, data);
  },

  deleteSupplier: async (id: string): Promise<any> => {
    return api.delete(`/health/suppliers/${id}`);
  },

  // ── Hospital ERP: Purchase Management & GRN (दाखिला प्रतिवेदन) ───────
  getPurchases: async (query?: { ward?: number; search?: string }): Promise<HealthPurchase[]> => {
    try {
      const res: any = await api.get('/health/purchases', { params: query });
      return Array.isArray(res) ? res : res?.data || [];
    } catch {
      return [];
    }
  },

  getPurchaseById: async (id: string): Promise<HealthPurchase> => {
    const res: any = await api.get(`/health/purchases/${id}`);
    return res?.data || res;
  },

  createPurchase: async (data: any): Promise<HealthPurchase> => {
    return api.post('/health/purchases', data);
  },

  // ── Hospital ERP: Medicine Batches & FEFO (First Expired First Out) ─
  getMedicineBatches: async (query?: { medicineName?: string; status?: string; search?: string }): Promise<MedicineBatch[]> => {
    try {
      const res: any = await api.get('/health/batches', { params: query });
      return Array.isArray(res) ? res : res?.data || [];
    } catch {
      return [];
    }
  },

  // ── Hospital ERP: Pharmacy POS Billing (काउन्टर बिक्री तथा बिलिङ) ───
  getPosSales: async (query?: { ward?: number; search?: string; isInsured?: boolean }): Promise<HealthPosSale[]> => {
    try {
      const res: any = await api.get('/health/pos/sales', { params: query });
      return Array.isArray(res) ? res : res?.data || [];
    } catch {
      return [];
    }
  },

  getPosSaleById: async (id: string): Promise<HealthPosSale> => {
    const res: any = await api.get(`/health/pos/sales/${id}`);
    return res?.data || res;
  },

  createPosSale: async (data: any): Promise<HealthPosSale> => {
    return api.post('/health/pos/sales', data);
  },

  searchPosSaleByBill: async (billNo: string): Promise<HealthPosSale> => {
    const res: any = await api.get('/health/pos/sales/search-by-bill', { params: { bill_no: billNo } });
    return res?.data || res;
  },

  createPosReturn: async (data: any): Promise<any> => {
    return api.post('/health/pos/returns', data);
  },

  getPosReturns: async (ward?: number): Promise<any[]> => {
    try {
      const res: any = await api.get('/health/pos/returns', { params: { ward } });
      return Array.isArray(res) ? res : res?.data || [];
    } catch {
      return [];
    }
  },


  // ── Hospital ERP: Health Insurance Management (HIB Claims) ─────────
  getInsuranceClaims: async (query?: { status?: string; policyNumber?: string; search?: string }): Promise<HealthInsuranceClaim[]> => {
    try {
      const res: any = await api.get('/health/insurance/claims', { params: query });
      return Array.isArray(res) ? res : res?.data || [];
    } catch {
      return [];
    }
  },

  getInsuranceSummary: async (): Promise<HealthInsuranceSummary> => {
    try {
      const res: any = await api.get('/health/insurance/summary');
      return res?.data || res;
    } catch {
      return {
        totalClaims: 0,
        submittedCount: 0,
        approvedCount: 0,
        totalClaimedAmount: 0,
        totalCopayAmount: 0,
        totalReimbursedAmount: 0,
      };
    }
  },

  createInsuranceClaim: async (data: Partial<HealthInsuranceClaim>): Promise<HealthInsuranceClaim> => {
    return api.post('/health/insurance/claims', data);
  },

  updateInsuranceClaim: async (id: string, data: Partial<HealthInsuranceClaim>): Promise<HealthInsuranceClaim> => {
    return api.put(`/health/insurance/claims/${id}`, data);
  },

  // ── Hospital ERP: Stock Transfers & Disposals (निकासा तथा मिन्हा) ───
  getStockTransfers: async (query?: { type?: string; search?: string }): Promise<HealthStockTransfer[]> => {
    try {
      const res: any = await api.get('/health/stock/transfers', { params: query });
      return Array.isArray(res) ? res : res?.data || [];
    } catch {
      return [];
    }
  },

  createStockTransfer: async (data: Partial<HealthStockTransfer>): Promise<HealthStockTransfer> => {
    return api.post('/health/stock/transfers', data);
  },

  // Education (MunSMS)
  getSchools: async (wardNo?: number): Promise<School[]> => {
    const res: any = await api.get(
      `/education/schools${wardNo && wardNo !== 0 ? `?ward=${wardNo}` : ""}`,
    );
    const rawList = Array.isArray(res)
      ? res
      : res?.data && Array.isArray(res.data)
        ? res.data
        : [];
    if (rawList.length > 0) {
      return rawList.map((s: any) => ({
        id: String(s.id),
        code: s.code || s.emisCode || '',
        emisCode: s.emisCode || s.code || '',
        name: s.name || '',
        nameNepali: s.nameNepali || s.name || '',
        nameEnglish: s.nameEn || s.nameEnglish || s.name || '',
        type: s.type || '',
        level: s.level || '',
        levelDetails: s.levelDetails || '',
        wardNumber: s.wardNumber || 0,
        location: s.location || s.tole || '',
        tole: s.tole || '',
        principalName: s.principalName || '',
        contactNumber: s.contactNumber || s.contactPhone || '',
        contactPhone: s.contactPhone || s.contactNumber || '',
        portalUrl: s.portalUrl || '',
        totalStudents: s.totalStudents || 0,
        maleStudents: s.maleStudents || 0,
        femaleStudents: s.femaleStudents || 0,
        totalTeachers: s.totalTeachers || 0,
        latitude: s.latitude !== null && s.latitude !== undefined ? Number(s.latitude) : undefined,
        longitude: s.longitude !== null && s.longitude !== undefined ? Number(s.longitude) : undefined,
        hasIctLab: Boolean(s.hasIctLab),
        hasScienceLab: Boolean(s.hasScienceLab),
        hasLibrary: Boolean(s.hasLibrary),
        hasDrinkingWater: Boolean(s.hasDrinkingWater),
        hasElectricity: Boolean(s.hasElectricity),
      }));
    }
    return [];
  },

  createSchool: async (data: Partial<School>): Promise<School> => {
    return api.post('/education/schools', data);
  },

  updateSchool: async (id: string, data: Partial<School>): Promise<School> => {
    return api.put(`/education/schools/${id}`, data);
  },

  deleteSchool: async (id: string): Promise<any> => {
    return api.delete(`/education/schools/${id}`);
  },

  getStudents: async (schoolId?: string, classGrade?: string): Promise<Student[]> => {
    const params: any = {};
    if (schoolId) params.schoolId = schoolId;
    if (classGrade) params.classGrade = classGrade;
    const res: any = await api.get('/education/students', { params });
    return Array.isArray(res) ? res : res?.data || [];
  },

  createStudent: async (data: Partial<Student>): Promise<Student> => {
    return api.post('/education/students', data);
  },

  deleteStudent: async (id: string): Promise<any> => {
    return api.delete(`/education/students/${id}`);
  },

  getTeachers: async (schoolId?: string): Promise<Teacher[]> => {
    const params: any = {};
    if (schoolId) params.schoolId = schoolId;
    const res: any = await api.get('/education/teachers', { params });
    return Array.isArray(res) ? res : res?.data || [];
  },

  createTeacher: async (data: Partial<Teacher>): Promise<Teacher> => {
    return api.post('/education/teachers', data);
  },

  deleteTeacher: async (id: string): Promise<any> => {
    return api.delete(`/education/teachers/${id}`);
  },

  getNutrition: async (): Promise<NutritionRecord[]> => {
    const res: any = await api.get('/education/nutrition');
    return Array.isArray(res) ? res : res?.data || [];
  },

  createNutrition: async (data: Partial<NutritionRecord>): Promise<NutritionRecord> => {
    return api.post('/education/nutrition', data);
  },

  getEducationOverview: async (): Promise<EducationOverviewStats> => {
    const res: any = await api.get("/education/overview");
    const data = res?.data || res;
    return data;
  },

  // ── Student Exam Assessments (विद्यार्थी परीक्षा मूल्याङ्कन तथा नतिजा) ──
  getAssessments: async (params?: { school_name?: string; class_grade?: string; exam_type?: string; grade?: string; search?: string }): Promise<StudentAssessment[]> => {
    const res: any = await api.get('/education/assessments', { params });
    return Array.isArray(res) ? res : res?.data || [];
  },

  getAssessmentStats: async (): Promise<AssessmentStats> => {
    const res: any = await api.get('/education/assessments/stats');
    return res?.data || res;
  },

  createAssessment: async (data: Partial<StudentAssessment>): Promise<StudentAssessment> => {
    return api.post('/education/assessments', data);
  },

  deleteAssessment: async (id: string): Promise<any> => {
    return api.delete(`/education/assessments/${id}`);
  },


  // Library Management
  getLibraryBooks: async (query?: { mediaType?: string; category?: string; search?: string; language?: string }): Promise<LibraryBook[]> => {
    try {
      const res: any = await api.get("/heritage/library", { params: query });
      return Array.isArray(res) ? res : res?.data || [];
    } catch {
      return [];
    }
  },

  getLibraryStats: async (): Promise<LibraryStats> => {
    try {
      const res: any = await api.get("/heritage/library/stats");
      return res?.data || res;
    } catch {
      return { total: 0, physical: 0, ebook: 0, audiobook: 0, videobook: 0, borrowed: 0 };
    }
  },

  getLibraryBorrows: async (): Promise<BorrowRecord[]> => {
    try {
      const res: any = await api.get("/heritage/library/borrows");
      return Array.isArray(res) ? res : res?.data || [];
    } catch {
      return [];
    }
  },

  createLibraryBook: async (data: Partial<LibraryBook>): Promise<LibraryBook> => {
    return api.post("/heritage/library", data);
  },

  updateLibraryBook: async (id: string, data: Partial<LibraryBook>): Promise<LibraryBook> => {
    return api.put(`/heritage/library/${id}`, data);
  },

  deleteLibraryBook: async (id: string): Promise<any> => {
    return api.delete(`/heritage/library/${id}`);
  },

  issueBookBorrow: async (data: {
    bookId: string;
    borrowerName: string;
    borrowerContact?: string;
    borrowerCardNo?: string;
    borrowDate?: string;
    dueDate?: string;
    remarks?: string;
  }): Promise<BorrowRecord> => {
    return api.post("/heritage/library/borrows", data);
  },

  returnBookBorrow: async (borrowId: string, returnDate?: string): Promise<BorrowRecord> => {
    return api.put(`/heritage/library/borrows/${borrowId}/return`, { returnDate });
  },

  // Museum & Heritage
  getMuseumAssets: async (query?: { category?: string; condition?: string; status?: string; search?: string }): Promise<any[]> => {
    try {
      const res: any = await api.get("/heritage/museum", { params: query });
      return Array.isArray(res) ? res : res?.data || [];
    } catch {
      return [];
    }
  },

  getMuseumAssetById: async (id: string): Promise<any> => {
    const res: any = await api.get(`/heritage/museum/${id}`);
    return res?.data || res;
  },

  createMuseumAsset: async (data: any): Promise<any> => {
    const res: any = await api.post("/heritage/museum", data);
    return res?.data || res;
  },

  updateMuseumAsset: async (id: string, data: any): Promise<any> => {
    const res: any = await api.put(`/heritage/museum/${id}`, data);
    return res?.data || res;
  },

  deleteMuseumAsset: async (id: string): Promise<any> => {
    const res: any = await api.delete(`/heritage/museum/${id}`);
    return res?.data || res;
  },

  getMuseumStats: async (): Promise<any> => {
    try {
      const res: any = await api.get("/heritage/museum/stats");
      return res?.data || res;
    } catch {
      return { total: 0, published: 0, verified: 0, draft: 0, needsRestoration: 0 };
    }
  },

  forecastCropYield: async (params: {
    crop_name: string;
    area_hectares: number;
    rainfall_factor?: number;
    fertilizer_applied?: boolean;
  }) => {
    try {
      const res: any = await api.post("/analytics/crop-yield-forecast", params);
      return res?.data || res;
    } catch {
      // Local fallback calculation based on Panchpokhari agronomic standards
      const baseYields: Record<string, number> = {
        'आलु': 13.5,
        'किबी': 8.2,
        'स्याउ': 6.8,
        'मकै': 3.1,
        'धान': 3.4,
        'कोदो': 1.8,
        'अलैंची': 1.4,
        'लप्सी': 6.0,
      };
      const baseYield = baseYields[params.crop_name] || 4.2;
      const rf = params.rainfall_factor || 1.0;
      const fert = params.fertilizer_applied ? 1.18 : 0.92;
      const predictedYield = +(baseYield * rf * fert).toFixed(2);
      const totalEstimated = +(predictedYield * params.area_hectares).toFixed(2);
      const prices: Record<string, number> = {
        'आलु': 45000,
        'किबी': 180000,
        'स्याउ': 120000,
        'मकै': 35000,
        'धान': 40000,
        'कोदो': 42000,
        'अलैंची': 850000,
        'लप्सी': 55000,
      };
      const pricePerTon = prices[params.crop_name] || 50000;
      return {
        crop_name: params.crop_name,
        cultivated_area_hectares: params.area_hectares,
        predicted_yield_ton_per_ha: predictedYield,
        total_estimated_production_metric_tons: totalEstimated,
        projected_revenue_npr: Math.round(totalEstimated * pricePerTon),
      };
    }
  },


  // Social Inclusion & Targeted Groups
  getSocialInclusionStats: async () => {
    const res: any = await api.get("/social-inclusion/stats");
    return res?.data || res;
  },

  getSocialInclusionRecords: async (params?: { category?: string; ward?: number; fiscalYear?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.category && params.category !== 'all') query.append('category', params.category);
    if (params?.ward && params.ward !== 0) query.append('ward', String(params.ward));
    if (params?.fiscalYear) query.append('fiscalYear', params.fiscalYear);
    if (params?.search) query.append('search', params.search);

    const qStr = query.toString() ? `?${query.toString()}` : '';
    const res: any = await api.get(`/social-inclusion${qStr}`);
    return Array.isArray(res) ? res : res?.data || [];
  },

  createSocialInclusionRecord: async (data: any) => {
    const res: any = await api.post('/social-inclusion', data);
    return res?.data || res;
  },

  updateSocialInclusionRecord: async (id: string, data: any) => {
    const res: any = await api.put(`/social-inclusion/${id}`, data);
    return res?.data || res;
  },

  deleteSocialInclusionRecord: async (id: string) => {
    const res: any = await api.delete(`/social-inclusion/${id}`);
    return res?.data || res;
  },

  bulkImportSocialInclusionRecords: async (records: any[]) => {
    const res: any = await api.post('/social-inclusion/bulk', { records });
    return res?.data || res;
  },

  // Open Data & Publications
  getOpenDataStats: async () => {
    const res: any = await api.get('/open-data/stats');
    return res?.data || res;
  },

  getOpenDataRecords: async (params?: {
    category?: string;
    search?: string;
    fiscalYear?: string;
    ward?: number;
  }) => {
    const res: any = await api.get('/open-data', { params });
    return Array.isArray(res) ? res : res?.data || [];
  },

  getOpenDataCatalog: async () => {
    const res: any = await api.get('/open-data', { params: { category: 'datasets' } });
    return Array.isArray(res) ? res : res?.data || [];
  },

  getMunicipalReports: async () => {
    const res: any = await api.get('/open-data', { params: { category: 'reports' } });
    return Array.isArray(res) ? res : res?.data || [];
  },

  createOpenDataRecord: async (data: any) => {
    const res: any = await api.post('/open-data', data);
    return res?.data || res;
  },

  updateOpenDataRecord: async (id: string, data: any) => {
    const res: any = await api.put(`/open-data/${id}`, data);
    return res?.data || res;
  },

  deleteOpenDataRecord: async (id: string) => {
    const res: any = await api.delete(`/open-data/${id}`);
    return res?.data || res;
  },

  incrementOpenDataDownload: async (id: string) => {
    const res: any = await api.post(`/open-data/${id}/download`);
    return res?.data || res;
  },

  bulkImportOpenDataRecords: async (records: any[]) => {
    const res: any = await api.post('/open-data/bulk', { records });
    return res?.data || res;
  },

  getMunicipalIndicators: async (params?: { category?: string; sdg_goal?: string }) => {
    const res: any = await api.get('/open-data/indicators/all', { params });
    return Array.isArray(res) ? res : res?.data || [];
  },

  getTransparencyOverview: async () => {
    const res: any = await api.get('/open-data/transparency/overview');
    return res?.data || res;
  },

  getCitizenDataRequests: async (status?: string) => {
    const res: any = await api.get('/open-data/requests', { params: { status } });
    return Array.isArray(res) ? res : res?.data || [];
  },

  submitCitizenDataRequest: async (data: any) => {
    const res: any = await api.post('/open-data/requests', data);
    return res?.data || res;
  },

  updateCitizenDataRequestStatus: async (id: string, data: { status?: string; response_note?: string; response_file_url?: string }) => {
    const res: any = await api.put(`/open-data/requests/${id}/status`, data);
    return res?.data || res;
  },

  getOpenDataPublications: async () => {
    const res: any = await api.get('/open-data/publications/list');
    return Array.isArray(res) ? res : res?.data || [];
  },

  toggleOpenDataPublication: async (id: string) => {
    const res: any = await api.post(`/open-data/publications/toggle/${id}`);
    return res?.data || res;
  },

  // Emergency Alert SMS & WhatsApp Broadcast Gateway
  sendEmergencyBroadcast: async (payload: {
    title: string;
    message: string;
    hazardType: string;
    severity: string;
    targetWard: number | "all";
    channels: string[];
  }) => {
    const res: any = await api.post("/notifications/broadcast", payload);
    return res?.data || res;
  },

  getBroadcastHistory: async () => {
    const res: any = await api.get("/notifications/history");
    return Array.isArray(res) ? res : res?.data || [];
  },

  getBroadcastStats: async () => {
    const res: any = await api.get("/notifications/stats");
    return res?.data || res;
  },
};
