export interface HouseholdSocioEconomic {
  id: string;
  tenant_id?: string;
  household_id: string;
  annual_income_bracket: string;
  primary_occupation: string;
  land_ownership_area_sqm: number;
  livestock_count: Record<string, number>;
  has_bank_account: boolean;
  has_health_insurance: boolean;
  has_internet_access: boolean;
  vulnerability_score: number;
  disaster_risk_category: 'Low' | 'Medium' | 'High' | string;
  created_at?: string;
  updated_at?: string;
}

export interface Household360Item {
  id: string;
  householdNumber: string;
  headCitizenId?: string;
  headName: string;
  toleName: string;
  wardId: string;
  wardNumber: number;
  waterSource?: string;
  electricityType?: string;
  fuelType?: string;
  toiletType?: string;
  familyMembersCount: number;
  socioEconomic?: HouseholdSocioEconomic | null;
  latitude?: number;
  longitude?: number;
}

export interface Citizen360Item {
  id: string;
  fullName: string;
  gender: string;
  dobBs: string;
  citizenshipNo: string;
  nationalId?: string;
  mobileNo: string;
  relationshipToHead: string;
  householdId?: string;
}

export interface CitizenApplicationItem {
  id: string;
  tenant_id?: string;
  citizen_id: string;
  citizenName?: string;
  service_module: string;
  application_ref_no: string;
  application_date: string;
  status: string;
  created_at?: string;
}

export interface Citizen360Stats {
  totalHouseholds: number;
  totalCitizens: number;
  totalSurveyedProfiles: number;
  vulnerableHouseholds: number;
  bankAccountCoverageRate: number;
  healthInsuranceCoverageRate: number;
  internetAccessRate: number;
  disasterRiskBreakdown: Record<string, number>;
  incomeBreakdown: Record<string, number>;
  occupationBreakdown: Record<string, number>;
  totalApplications: number;
  approvedApplications: number;
  pendingApplications: number;
}
