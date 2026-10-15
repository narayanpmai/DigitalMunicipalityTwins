export interface PublicSettings {
  palika_name?: string;
  palika_name_en?: string;
  slogan?: string;
  logo_url?: string;
  emblem_url?: string;
  province?: string;
  district?: string;
  headquarters?: string;
  email?: string;
  phone?: string;
  fax?: string;
  website?: string;
  address?: string;
  total_wards?: number;
  active_fiscal_year?: string;
  chief_officer_title?: string;
  emergency_ambulance?: string;
  emergency_police?: string;
  emergency_fire?: string;
  emergency_disaster?: string;
  panoramaUrl?: string;
  panorama_url?: string;
  [key: string]: any;
}

export interface TenantContextType {
  tenantId: string;
  setTenantId: (id: string) => void;
  settings: PublicSettings | null;
  isLoading: boolean;
  reloadSettings: () => Promise<void>;
  updateSettings: (updates: Record<string, string>) => Promise<boolean>;
}
