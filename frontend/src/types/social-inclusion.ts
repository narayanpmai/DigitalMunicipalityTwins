export type SocialInclusionCategory = 'women_children' | 'senior' | 'disability' | 'economic' | 'marginalized';

export interface SocialInclusionRecord {
  id: string;
  category: SocialInclusionCategory;
  wardNumber: number;
  fiscalYear: string;
  title: string;
  serviceType?: string;
  subCategory?: string;
  beneficiariesCount: number;
  femaleBeneficiaries?: number;
  maleBeneficiaries?: number;
  disabilityCardType?: 'ka' | 'kha' | 'ga' | 'gha' | 'none' | string;
  targetGroup?: string;
  budgetAllocated?: number;
  budgetSpent?: number;
  coordinatorName?: string;
  coordinatorPhone?: string;
  location?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  status: 'ongoing' | 'completed' | 'regular' | string;
  remarks?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SocialInclusionStats {
  totalTargetedBeneficiaries: number;
  seniorCitizensCount: number;
  disabilityCardHolders: number;
  disabilityBreakdown: {
    ka_red: number;
    kha_blue: number;
    ga_yellow: number;
    gha_white: number;
  };
  womenEmpowermentGroups: number;
  childProtectionCommittees: number;
  allocatedBudgetNpr: number;
  disbursedBudgetNpr: number;
}
