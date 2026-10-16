export interface WardProfile {
  panoramaUrl?: string;
  id?: string;
  wardNo: number;
  name: string;
  chairperson: string;
  secretary: string;
  phone?: string;
  officeLocation: string;
  households: number;
  totalPopulation: number;
  malePopulation: number;
  femalePopulation: number;
  areaSqKm: number;
}

export interface MunicipalityProfile {
  id?: string;
  name: string;
  nameNp?: string;
  nameEn?: string;
  province: string;
  district: string;
  type?: string;
  headquarters: string;
  totalWards: number;
  totalAreaSqKm: number;
  elevationMeters: string;
  introduction?: string;
  totalPopulation?: number;
  malePopulation?: number;
  femalePopulation?: number;
  totalHouseholds?: number;
  annualBudget?: string;
  internalRevenue?: string;
  coordinates: { lat: number; lng: number };
  boundaries: {
    east: string;
    west: string;
    north: string;
    south: string;
  };
  culturalIdentity?: Array<{
    title: string;
    desc: string;
    icon?: string;
    color?: string;
  }>;
  demographics: {
    totalPopulation: number;
    male: number;
    female: number;
    households: number;
    totalGpsHouses?: number;
    highRiskHouses?: number;
    literacyRate: number;
    maleLiteracyRate?: number;
    femaleLiteracyRate?: number;
    economicallyActive?: number;
    participationRate?: number;
    abroad?: number;
    averageFamilySize: number;
    sexRatio?: number;
    density?: number;
  };
  financials?: {
    annualBudget: string;
    internalRevenue: string;
    fiscalYear?: string;
  };
  leadership: {
    mayor: { name: string; designation: string; phone?: string; email?: string; photoUrl?: string };
    deputyMayor: { name: string; designation: string; phone?: string; email?: string; photoUrl?: string };
    chiefOfficer: { name: string; designation: string; phone?: string; email?: string; photoUrl?: string };
    spokesperson?: { name: string; designation: string; phone?: string; email?: string; photoUrl?: string };
  };
  leaders?: Array<{
    name: string;
    role: string;
    phone: string;
    email: string;
    badge: string;
    color: string;
    initials: string;
  }>;
}

export interface TouristDestination {
  id: string;
  name: string;
  nameEn: string;
  wardNo: number;
  altitudeMeters: number;
  category: 'lake' | 'peak' | 'temple' | 'trekking' | 'cave' | 'cultural';
  description: string;
  bestSeason: string;
  trekDuration: string;
  highlights: string[];
  imageUrl: string;
  coordinates?: { lat: number; lng: number };
}

export interface GisFacility {
  id: string;
  name: string;
  code?: string;
  type: 'school' | 'health_post' | 'ward_office' | 'bridge' | 'viewpoint' | string;
  wardNo: number;
  lat: number;
  lng: number;
  contact?: string;
  categoryNepali?: string;
}
