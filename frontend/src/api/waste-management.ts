import { api } from './client';

export interface CollectionSchedule {
  id: string;
  wardNo: number;
  routeCode: string;
  routeName: string;
  collectionDaysBio: string;
  collectionDaysNonBio: string;
  vehicleNumber: string;
  vehicleType: 'tractor' | 'mini_truck' | 'tipper' | 'compactor';
  driverName: string;
  driverPhone: string;
  supervisorName: string;
  supervisorPhone: string;
  status: 'active' | 'maintenance' | 'paused';
  timing: string;
}

export interface DisposalSite {
  id: string;
  siteName: string;
  siteType: 'compost_plant' | 'landfill_site' | 'transfer_station' | 'recycling_hub';
  wardNo: number;
  locationName: string;
  totalAreaRopani: number;
  dailyCapacityTons: number;
  currentUtilizationPercent: number;
  leachateTreatment: 'active_biological' | 'aeration_tank' | 'soak_pit' | 'none';
  eiaRegistrationNo: string;
  inchargeName: string;
  inchargePhone: string;
  status: 'operational' | 'under_construction' | 'full';
}

export interface SanitationWorker {
  id: string;
  workerCode: string;
  fullName: string;
  wardNo: number;
  role: 'sweeper' | 'loader' | 'driver' | 'compost_operator' | 'supervisor';
  employmentType: 'permanent' | 'contract' | 'daily_wage';
  phone: string;
  emergencyContact: string;
  ppeKitStatus: 'distributed_complete' | 'partially_distributed' | 'replacement_needed';
  ppeDistributionDate: string;
  ppeItems: string[];
  lastHealthCheckupDate: string;
  vaccinationStatus: 'fully_vaccinated' | 'partially_vaccinated' | 'due';
  insuranceStatus: 'active' | 'renewal_pending';
}

export interface WasteWallet {
  id: string;
  name: string;
  ward: number;
  balance: number;
  date: string;
  totalRecycledKg?: number;
}

export interface WasteRate {
  id: string;
  wasteType: string;
  ratePerKg: number;
  colorCode: string;
}

export interface WasteAlert {
  id: string;
  issue: string;
  location: string;
  reporter: string;
  date: string;
  status: 'pending' | 'in-progress' | 'resolved';
}

export interface LiveVehicle {
  id: string;
  licensePlate: string;
  driverName: string;
  routeAssigned: string;
  currentLat: number;
  currentLon: number;
  status?: string;
}

export interface DashboardStats {
  totalCollectedKg: number;
  recycledKg: number;
  totalPayouts: number;
  activeVehicles: number;
  totalVehicles: number;
}

// ── Default Municipal Seeds ──
const INITIAL_SCHEDULES: CollectionSchedule[] = [
  {
    id: 'sch-01',
    wardNo: 3,
    routeCode: 'RT-03-A',
    routeName: 'तार्केघ्याङ - गुम्बाडाँडा - होमस्टे बस्ती',
    collectionDaysBio: 'आइतबार, बुधबार',
    collectionDaysNonBio: 'मंगलबार, शुक्रबार',
    vehicleNumber: 'बा २ क ४५६७ (ट्र्याक्टर)',
    vehicleType: 'tractor',
    driverName: 'राम बहादुर श्रेष्ठ',
    driverPhone: '९८४१२२३३४४',
    supervisorName: 'सुरेश तामाङ',
    supervisorPhone: '९८५१००२२३३',
    status: 'active',
    timing: 'बिहान ०६:३० - १०:००',
  },
  {
    id: 'sch-02',
    wardNo: 2,
    routeCode: 'RT-02-B',
    routeName: 'मेलम्चीघ्याङ - खोलाघारी - बजार क्षेत्र',
    collectionDaysBio: 'सोमबार, बिहीबार',
    collectionDaysNonBio: 'बुधबार, शनिबार',
    vehicleNumber: 'बा १ ख ८९२१ (मिनी टिप्पर)',
    vehicleType: 'mini_truck',
    driverName: 'पेम्बा दोर्जे शेर्पा',
    driverPhone: '९८०८११२२३३',
    supervisorName: 'दावा लामा',
    supervisorPhone: '९८५१२३४४५५',
    status: 'active',
    timing: 'बिहान ०७:०० - १०:३०',
  },
  {
    id: 'sch-03',
    wardNo: 4,
    routeCode: 'RT-04-A',
    routeName: 'थाङपालकोट - मानेखर्क - स्वास्थ्य चौकी रुट',
    collectionDaysBio: 'आइतबार, बिहीबार',
    collectionDaysNonBio: 'मंगलबार, शनिबार',
    vehicleNumber: 'बा ३ क ६१२० (ट्र्याक्टर)',
    vehicleType: 'tractor',
    driverName: 'सन्तोष विक',
    driverPhone: '९८१२३४५६७८',
    supervisorName: 'गोविन्द न्यौपाने',
    supervisorPhone: '९८४१०१२३४५',
    status: 'active',
    timing: 'बिहान ०६:०० - ०९:३०',
  },
  {
    id: 'sch-04',
    wardNo: 1,
    routeCode: 'RT-01-A',
    routeName: 'बाँसबारी - सिन्धुकोट - सिमाना चेकपोइन्ट',
    collectionDaysBio: 'आइतबार, मंगलबार, बिहीबार',
    collectionDaysNonBio: 'सोमबार, शुक्रबार',
    vehicleNumber: 'बा २ ख ३३०१ (टिप्पर)',
    vehicleType: 'tipper',
    driverName: 'हरि कृष्ण दनुवार',
    driverPhone: '९८४३९९००११',
    supervisorName: 'अर्जुन गिरी',
    supervisorPhone: '९८६००११२२४',
    status: 'active',
    timing: 'बिहान ०६:०० - १०:००',
  }
];

const INITIAL_DISPOSAL_SITES: DisposalSite[] = [
  {
    id: 'site-01',
    siteName: 'पाँचपोखरी जैविक कम्पोस्ट मल उत्पादन केन्द्र',
    siteType: 'compost_plant',
    wardNo: 3,
    locationName: 'तार्केघ्याङ फेदी, चिसोपानी',
    totalAreaRopani: 14,
    dailyCapacityTons: 6.5,
    currentUtilizationPercent: 62,
    leachateTreatment: 'active_biological',
    eiaRegistrationNo: 'EIA-MOFE-२०८०-०४२',
    inchargeName: 'ई. रोहन थापा (वातावरण अधिकृत)',
    inchargePhone: '९८४१९९८८७७',
    status: 'operational',
  },
  {
    id: 'site-02',
    siteName: 'थाङपाल उपत्यका ट्रान्सफर तथा स्यानेटरी ल्यान्डफिल',
    siteType: 'landfill_site',
    wardNo: 4,
    locationName: 'मानेखर्क खोंच, वडा नं ४',
    totalAreaRopani: 22,
    dailyCapacityTons: 12.0,
    currentUtilizationPercent: 48,
    leachateTreatment: 'aeration_tank',
    eiaRegistrationNo: 'IEE-WSTD-२०७९-११',
    inchargeName: 'टेक बहादुर तामाङ',
    inchargePhone: '९८५११४४०२०',
    status: 'operational',
  },
  {
    id: 'site-03',
    siteName: 'मेलम्चीघ्याङ फोहोर वर्गीकरण तथा रिसाइक्लिङ हब',
    siteType: 'recycling_hub',
    wardNo: 2,
    locationName: 'बजार छेउ, मेलम्चीघ्याङ',
    totalAreaRopani: 6,
    dailyCapacityTons: 3.0,
    currentUtilizationPercent: 75,
    leachateTreatment: 'soak_pit',
    eiaRegistrationNo: 'IEE-RECY-२०८१-०३',
    inchargeName: 'ल्हाक्पा शेर्पा',
    inchargePhone: '९८०८३३२२११',
    status: 'operational',
  }
];

const INITIAL_SANITATION_WORKERS: SanitationWorker[] = [
  {
    id: 'wrk-01',
    workerCode: 'P5-SAN-01',
    fullName: 'माइला तामाङ',
    wardNo: 3,
    role: 'sweeper',
    employmentType: 'contract',
    phone: '९८१२००३३४४',
    emergencyContact: 'सुन्तली तामाङ (श्रीमती) - ९८१२०००१११',
    ppeKitStatus: 'distributed_complete',
    ppeDistributionDate: '२०८१-०५-१०',
    ppeItems: ['गमबुट', 'हेभी ड्युटी पन्जा', 'N95 मास्क', 'फ्लोरोसेन्ट ज्याकेट', 'हेल्मेट'],
    lastHealthCheckupDate: '२०८१-०४-१५',
    vaccinationStatus: 'fully_vaccinated',
    insuranceStatus: 'active',
  },
  {
    id: 'wrk-02',
    workerCode: 'P5-SAN-02',
    fullName: 'कान्छी शेर्पा',
    wardNo: 2,
    role: 'sweeper',
    employmentType: 'contract',
    phone: '९८४१८८७७६६',
    emergencyContact: 'पासाङ शेर्पा (दाजु) - ९८४१२२२३३३',
    ppeKitStatus: 'distributed_complete',
    ppeDistributionDate: '२०८१-०५-१०',
    ppeItems: ['गमबुट', 'पन्जा', 'मास्क', 'फ्लोरोसेन्ट ज्याकेट'],
    lastHealthCheckupDate: '२०८१-०४-१८',
    vaccinationStatus: 'fully_vaccinated',
    insuranceStatus: 'active',
  },
  {
    id: 'wrk-03',
    workerCode: 'P5-SAN-03',
    fullName: 'राम बहादुर श्रेष्ठ',
    wardNo: 3,
    role: 'driver',
    employmentType: 'permanent',
    phone: '९८४१२२३३४४',
    emergencyContact: 'सीता श्रेष्ठ - ९८४१२२३३९९',
    ppeKitStatus: 'distributed_complete',
    ppeDistributionDate: '२०८१-०५-०१',
    ppeItems: ['पन्जा', 'मास्क', 'ज्याकेट', 'फर्स्ट एड किट'],
    lastHealthCheckupDate: '२०८१-०३-२५',
    vaccinationStatus: 'fully_vaccinated',
    insuranceStatus: 'active',
  },
  {
    id: 'wrk-04',
    workerCode: 'P5-SAN-04',
    fullName: 'वीर ध्वज तामाङ',
    wardNo: 4,
    role: 'compost_operator',
    employmentType: 'contract',
    phone: '९८०३४४५५६६',
    emergencyContact: 'माया तामाङ - ९८०३४४५५००',
    ppeKitStatus: 'partially_distributed',
    ppeDistributionDate: '२०८१-०४-२०',
    ppeItems: ['गमबुट', 'रासायनिक सुरक्षा पन्जा', 'ग्यास मास्क'],
    lastHealthCheckupDate: '२०८१-०३-१०',
    vaccinationStatus: 'partially_vaccinated',
    insuranceStatus: 'active',
  }
];

const INITIAL_RATES: WasteRate[] = [
  { id: '1', wasteType: 'प्लास्टिक (PET/HDPE)', ratePerKg: 18, colorCode: '#3b82f6' },
  { id: '2', wasteType: 'कागज तथा कार्टुन', ratePerKg: 12, colorCode: '#f59e0b' },
  { id: '3', wasteType: 'धातु / टिन / फलाम', ratePerKg: 35, colorCode: '#64748b' },
  { id: '4', wasteType: 'जैविक कुहिने फोहोर (कम्पोस्ट)', ratePerKg: 5, colorCode: '#10b981' },
  { id: '5', wasteType: 'काँच / सिसाका बोतल', ratePerKg: 4, colorCode: '#8b5cf6' },
];

const INITIAL_WALLETS: WasteWallet[] = [
  { id: 'P5-HH-0412', name: 'दावा लामा', ward: 3, balance: 1450, date: '2026-09-24', totalRecycledKg: 85 },
  { id: 'P5-HH-0891', name: 'सुमित्रा श्रेष्ठ', ward: 2, balance: 2100, date: '2026-09-23', totalRecycledKg: 124 },
  { id: 'P5-HH-1120', name: 'रामेश्वर खतिवडा', ward: 4, balance: 980, date: '2026-09-22', totalRecycledKg: 62 },
  { id: 'P5-HH-0145', name: 'पेम्बा शेर्पा', ward: 3, balance: 1850, date: '2026-09-21', totalRecycledKg: 110 },
  { id: 'P5-HH-0932', name: 'हरि माया दनुवार', ward: 1, balance: 1320, date: '2026-09-20', totalRecycledKg: 78 },
];

const INITIAL_ALERTS: WasteAlert[] = [
  { id: 'TKT-104', issue: 'तार्केघ्याङ मुख्य चोकमा फोहोर थुप्रिएको', location: 'वडा नं. ३, तार्केघ्याङ चोक', reporter: 'पेम्बा दोर्जे', date: '2026-09-24', status: 'pending' },
  { id: 'TKT-103', issue: 'खोला किनारमा अवैध प्लास्टिक डम्पिङ', location: 'वडा नं. २, मेलम्चीघ्याङ पुल छेउ', reporter: 'स्थानीय आमा समूह', date: '2026-09-23', status: 'in-progress' },
  { id: 'TKT-102', issue: 'ट्र्याक्टर संकलन समयमा नआएको गुनासो', location: 'वडा नं. ४, मानेखर्क', reporter: 'सुरेश श्रेष्ठ', date: '2026-09-21', status: 'resolved' },
];

const INITIAL_VEHICLES: LiveVehicle[] = [
  { id: 'v1', licensePlate: 'बा २ क ४५६७', driverName: 'राम बहादुर श्रेष्ठ', routeAssigned: 'तार्केघ्याङ रुट (वडा ३)', currentLat: 27.8520, currentLon: 85.5530 },
  { id: 'v2', licensePlate: 'बा १ ख ८९२१', driverName: 'पेम्बा दोर्जे शेर्पा', routeAssigned: 'मेलम्चीघ्याङ रुट (वडा २)', currentLat: 27.8410, currentLon: 85.5680 },
  { id: 'v3', licensePlate: 'बा ३ क ६१२०', driverName: 'सन्तोष विक', routeAssigned: 'थाङपालकोट रुट (वडा ४)', currentLat: 27.8280, currentLon: 85.5450 },
];

function getStored<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export const wasteApi = {
  // Stats
  getDashboardStats: async (): Promise<DashboardStats> => {
    try {
      const res = await api.get<DashboardStats>('/waste-management/dashboard-stats');
      if (res && res.totalCollectedKg) return res;
    } catch {}
    return {
      totalCollectedKg: 28450,
      recycledKg: 19020,
      totalPayouts: 342500,
      activeVehicles: 3,
      totalVehicles: 4,
    };
  },

  // Schedules
  getSchedules: async (): Promise<CollectionSchedule[]> => {
    try {
      const res = await api.get<CollectionSchedule[]>('/waste-management/schedules');
      const list = (res as any)?.data || res;
      if (Array.isArray(list) && list.length > 0) return list;
    } catch {}
    return getStored<CollectionSchedule[]>('p5_waste_schedules', INITIAL_SCHEDULES);
  },
  createSchedule: async (data: Partial<CollectionSchedule>): Promise<CollectionSchedule> => {
    const list = getStored<CollectionSchedule[]>('p5_waste_schedules', INITIAL_SCHEDULES);
    const newSch: CollectionSchedule = {
      id: `sch-${Date.now()}`,
      wardNo: data.wardNo || 1,
      routeCode: data.routeCode || `RT-0${data.wardNo || 1}-X`,
      routeName: data.routeName || 'नयाँ फोहोर संकलन रुट',
      collectionDaysBio: data.collectionDaysBio || 'आइतबार, बुधबार',
      collectionDaysNonBio: data.collectionDaysNonBio || 'मंगलबार, शुक्रबार',
      vehicleNumber: data.vehicleNumber || 'बा २ क ००००',
      vehicleType: data.vehicleType || 'tractor',
      driverName: data.driverName || '',
      driverPhone: data.driverPhone || '',
      supervisorName: data.supervisorName || '',
      supervisorPhone: data.supervisorPhone || '',
      status: data.status || 'active',
      timing: data.timing || 'बिहान ०६:३० - ०९:३०',
    };
    try {
      await api.post('/waste-management/schedules', newSch);
    } catch {}
    const updated = [newSch, ...list];
    setStored('p5_waste_schedules', updated);
    return newSch;
  },

  // Disposal Sites
  getDisposalSites: async (): Promise<DisposalSite[]> => {
    try {
      const res = await api.get<DisposalSite[]>('/waste-management/disposal-sites');
      const list = (res as any)?.data || res;
      if (Array.isArray(list) && list.length > 0) return list;
    } catch {}
    return getStored<DisposalSite[]>('p5_waste_disposal_sites', INITIAL_DISPOSAL_SITES);
  },
  createDisposalSite: async (data: Partial<DisposalSite>): Promise<DisposalSite> => {
    const list = getStored<DisposalSite[]>('p5_waste_disposal_sites', INITIAL_DISPOSAL_SITES);
    const newSite: DisposalSite = {
      id: `site-${Date.now()}`,
      siteName: data.siteName || '',
      siteType: data.siteType || 'compost_plant',
      wardNo: data.wardNo || 1,
      locationName: data.locationName || '',
      totalAreaRopani: Number(data.totalAreaRopani) || 5,
      dailyCapacityTons: Number(data.dailyCapacityTons) || 2,
      currentUtilizationPercent: Number(data.currentUtilizationPercent) || 50,
      leachateTreatment: data.leachateTreatment || 'active_biological',
      eiaRegistrationNo: data.eiaRegistrationNo || `EIA-MOFE-२०८१-${Math.floor(Math.random()*900+100)}`,
      inchargeName: data.inchargeName || '',
      inchargePhone: data.inchargePhone || '',
      status: data.status || 'operational',
    };
    try {
      await api.post('/waste-management/disposal-sites', newSite);
    } catch {}
    const updated = [newSite, ...list];
    setStored('p5_waste_disposal_sites', updated);
    return newSite;
  },

  // Sanitation Workers
  getSanitationWorkers: async (): Promise<SanitationWorker[]> => {
    try {
      const res = await api.get<SanitationWorker[]>('/waste-management/workers');
      const list = (res as any)?.data || res;
      if (Array.isArray(list) && list.length > 0) return list;
    } catch {}
    return getStored<SanitationWorker[]>('p5_waste_workers', INITIAL_SANITATION_WORKERS);
  },
  createSanitationWorker: async (data: Partial<SanitationWorker>): Promise<SanitationWorker> => {
    const list = getStored<SanitationWorker[]>('p5_waste_workers', INITIAL_SANITATION_WORKERS);
    const newWorker: SanitationWorker = {
      id: `wrk-${Date.now()}`,
      workerCode: data.workerCode || `P5-SAN-0${list.length + 1}`,
      fullName: data.fullName || '',
      wardNo: data.wardNo || 1,
      role: data.role || 'sweeper',
      employmentType: data.employmentType || 'contract',
      phone: data.phone || '',
      emergencyContact: data.emergencyContact || '',
      ppeKitStatus: data.ppeKitStatus || 'distributed_complete',
      ppeDistributionDate: data.ppeDistributionDate || new Date().toISOString().split('T')[0],
      ppeItems: data.ppeItems || ['गमबुट', 'पन्जा', 'मास्क', 'फ्लोरोसेन्ट ज्याकेट'],
      lastHealthCheckupDate: data.lastHealthCheckupDate || new Date().toISOString().split('T')[0],
      vaccinationStatus: data.vaccinationStatus || 'fully_vaccinated',
      insuranceStatus: data.insuranceStatus || 'active',
    };
    try {
      await api.post('/waste-management/workers', newWorker);
    } catch {}
    const updated = [newWorker, ...list];
    setStored('p5_waste_workers', updated);
    return newWorker;
  },

  // Wallets, Rates, Alerts, LiveVehicles
  getWallets: async (): Promise<WasteWallet[]> => {
    try {
      const res = await api.get<WasteWallet[]>('/waste-management/wallets');
      const list = (res as any)?.data || res;
      if (Array.isArray(list) && list.length > 0) return list;
    } catch {}
    return getStored<WasteWallet[]>('p5_waste_wallets', INITIAL_WALLETS);
  },
  getRates: async (): Promise<WasteRate[]> => {
    try {
      const res = await api.get<WasteRate[]>('/waste-management/rates');
      const list = (res as any)?.data || res;
      if (Array.isArray(list) && list.length > 0) return list;
    } catch {}
    return INITIAL_RATES;
  },
  getAlerts: async (): Promise<WasteAlert[]> => {
    try {
      const res = await api.get<WasteAlert[]>('/waste-management/alerts');
      const list = (res as any)?.data || res;
      if (Array.isArray(list) && list.length > 0) return list;
    } catch {}
    return getStored<WasteAlert[]>('p5_waste_alerts', INITIAL_ALERTS);
  },
  createAlert: async (data: Partial<WasteAlert>): Promise<WasteAlert> => {
    const list = getStored<WasteAlert[]>('p5_waste_alerts', INITIAL_ALERTS);
    const newAlert: WasteAlert = {
      id: `TKT-${Math.floor(Math.random() * 900 + 100)}`,
      issue: data.issue || 'नयाँ फोहोर गुनासो',
      location: data.location || 'पाँचपोखरी',
      reporter: data.reporter || 'स्थानीय नागरिक',
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
    };
    try {
      await api.post('/waste-management/alerts', newAlert);
    } catch {}
    const updated = [newAlert, ...list];
    setStored('p5_waste_alerts', updated);
    return newAlert;
  },
  updateAlertStatus: async (id: string, status: 'pending' | 'in-progress' | 'resolved'): Promise<void> => {
    try {
      await api.patch(`/waste-management/alerts/${id}/status`, { status });
    } catch {}
    const list = getStored<WasteAlert[]>('p5_waste_alerts', INITIAL_ALERTS);
    const updated = list.map(a => a.id === id ? { ...a, status } : a);
    setStored('p5_waste_alerts', updated);
  },
  getLiveVehicles: async (): Promise<LiveVehicle[]> => {
    try {
      const res = await api.get<LiveVehicle[]>('/waste-management/vehicles/live');
      const list = (res as any)?.data || res;
      if (Array.isArray(list) && list.length > 0) return list;
    } catch {}
    return INITIAL_VEHICLES;
  },
};
