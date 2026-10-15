export const TENANT_STORAGE_KEY = 'digipalika_tenant_id';

export const getTenantId = (): string | null => {
  return localStorage.getItem(TENANT_STORAGE_KEY);
};

export const setTenantId = (tenantId: string) => {
  localStorage.setItem(TENANT_STORAGE_KEY, tenantId);
};

export const removeTenantId = () => {
  localStorage.removeItem(TENANT_STORAGE_KEY);
};

// We can define a list of mock palikas for testing the Tenant UI
export const PALIKA_LIST = [
  { id: 'panchpokhari', name: 'पाँचपोखरी थाङपाल गाउँपालिका' },
  { id: 'kathmandu', name: 'काठमाडौं महानगरपालिका' },
  { id: 'lalitpur', name: 'ललितपुर महानगरपालिका' },
];
