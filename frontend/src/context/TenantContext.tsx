import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { PublicSettings, TenantContextType } from '../types/tenant';
import { tenantApi } from '../api/tenant';
import { getTenantId } from '../api/client';

// ─── Per-tenant default settings (module-level constants) ────────────────────
const TENANT_DEFAULTS: Record<string, Partial<PublicSettings>> = {
  panchpokhari: {
    palika_name: 'पाँचपोखरी थाङपाल गाउँपालिका',
    palika_name_en: 'Panchpokhari Thangpal Rural Municipality',
    slogan: 'आधुनिक, सुशासनयुक्त र समृद्ध पालिका',
    province: 'बागमती प्रदेश',
    district: 'सिन्धुपाल्चोक',
    headquarters: 'थाङपालधाप, मानेखर्क',
    email: 'info@panchpokharimun.gov.np',
    phone: '०११-६९०१२३',
    website: 'https://panchpokharimun.gov.np',
    address: 'गाउँ कार्यपालिकाको कार्यालय, थाङपालधाप, सिन्धुपाल्चोक',
    total_wards: 8,
    logo_url: '/panchpokhari-logo.png',
  },
  helambu: {
    palika_name: 'हेलम्बु गाउँपालिका',
    palika_name_en: 'Helambu Rural Municipality',
    slogan: 'प्रकृति, संस्कृति र समृद्धिको पालिका',
    province: 'बागमती प्रदेश',
    district: 'सिन्धुपाल्चोक',
    headquarters: 'मेलम्ची',
    email: 'info@helambu.gov.np',
    phone: '',
    website: 'https://helambu.gov.np',
    address: 'गाउँ कार्यपालिकाको कार्यालय, हेलम्बु, सिन्धुपाल्चोक',
    total_wards: 7,
    logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Emblem_of_Nepal.svg/240px-Emblem_of_Nepal.svg.png',
  },
  melamchi: {
    palika_name: 'मेलम्ची नगरपालिका',
    palika_name_en: 'Melamchi Municipality',
    slogan: 'विकास, सेवा र सुशासन',
    province: 'बागमती प्रदेश',
    district: 'सिन्धुपाल्चोक',
    headquarters: 'मेलम्ची',
    email: 'info@melamchimun.gov.np',
    phone: '',
    website: 'https://melamchimun.gov.np',
    address: 'नगर कार्यपालिकाको कार्यालय, मेलम्ची, सिन्धुपाल्चोक',
    total_wards: 12,
    logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Emblem_of_Nepal.svg/240px-Emblem_of_Nepal.svg.png',
  },
  melamchimunicipality: {
    palika_name: 'मेलम्ची नगरपालिका',
    palika_name_en: 'Melamchi Municipality',
    slogan: 'विकास, सेवा र सुशासन',
    province: 'बागमती प्रदेश',
    district: 'सिन्धुपाल्चोक',
    headquarters: 'मेलम्ची',
    email: 'info@melamchimun.gov.np',
    phone: '',
    website: 'https://melamchimun.gov.np',
    address: 'नगर कार्यपालिकाको कार्यालय, मेलम्ची, सिन्धुपाल्चोक',
    total_wards: 12,
    logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Emblem_of_Nepal.svg/240px-Emblem_of_Nepal.svg.png',
  },
  indrawati: {
    palika_name: 'इन्द्रावती गाउँपालिका',
    palika_name_en: 'Indrawati Rural Municipality',
    slogan: 'सेवा र विकासको पालिका',
    province: 'बागमती प्रदेश',
    district: 'सिन्धुपाल्चोक',
    headquarters: 'चौतारा',
    email: 'info@indrawati.gov.np',
    phone: '',
    website: '',
    address: 'गाउँ कार्यपालिकाको कार्यालय, इन्द्रावती, सिन्धुपाल्चोक',
    total_wards: 6,
    logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Emblem_of_Nepal.svg/240px-Emblem_of_Nepal.svg.png',
  },
};

const COMMON_DEFAULTS: Partial<PublicSettings> = {
  active_fiscal_year: '२०८१/०८२',
  chief_officer_title: 'प्रमुख प्रशासकीय अधिकृत',
  emergency_ambulance: '१०२',
  emergency_police: '१००',
  emergency_fire: '१०१',
  emergency_disaster: '११४४',
  emblem_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Emblem_of_Nepal.svg/240px-Emblem_of_Nepal.svg.png',
};
// ─────────────────────────────────────────────────────────────────────────────

const TenantContext = createContext<TenantContextType | undefined>(undefined);

// Helper: extract tenant subdomain from stored user, or fall back to explicit tenant_id
const getEffectiveTenantId = (): string => {
  try {
    const storedUser = localStorage.getItem('p5_user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user?.tenantSubdomain) return user.tenantSubdomain;
    }
  } catch {}
  const stored = localStorage.getItem('tenant_id');
  if (stored && stored !== 'all' && stored !== '') return stored;
  return getTenantId(); // falls back to subdomain extraction or 'panchpokhari'
};

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tenantId, setTenantIdState] = useState<string>(getEffectiveTenantId());
  const [settings, setSettings] = useState<PublicSettings | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const setTenantId = (newId: string) => {
    localStorage.setItem('tenant_id', newId);
    setTenantIdState(newId);
  };

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      // Tenant-specific defaults (fallback when backend has no settings for this tenant)
      const tenantDefaults = TENANT_DEFAULTS[tenantId] || TENANT_DEFAULTS['panchpokhari'];

      // Check localStorage override for this specific tenant
      const savedOverride = localStorage.getItem(`palika_settings_${tenantId}`);
      let localData: Partial<PublicSettings> = {};
      if (savedOverride) {
        try { localData = JSON.parse(savedOverride); } catch {}
      }

      // Fetch from backend — x-tenant-id header is set by getTenantId() in client.ts
      const remoteData = await tenantApi.getPublicSettings().catch(() => ({} as PublicSettings));

      // Merge priority: common < tenant defaults < backend < local override
      const merged: PublicSettings = {
        ...COMMON_DEFAULTS,
        ...tenantDefaults,
        ...remoteData,
        ...localData,
      } as PublicSettings;

      setSettings(merged);
      const palika = merged.palika_name || tenantDefaults?.palika_name || 'Municipal Digital Twins';
      document.title = `${palika} — Municipal Digital Twins`;
    } catch (err) {
      console.error('Failed to load municipal settings:', err);
    } finally {
      setIsLoading(false);
    }
  }, [tenantId]);

  const reloadSettings = async () => {
    await fetchSettings();
  };

  const updateSettings = async (updates: Record<string, string>): Promise<boolean> => {
    try {
      // 1. Persist to backend
      let backendSuccess = false;
      await tenantApi.updateBulkSettings(updates)
        .then(() => {
          backendSuccess = true;
        })
        .catch((err) => {
          console.warn('Backend update bulk warning (will persist locally):', err);
        });

      // 2. Persist locally for immediate instant reactivity
      try {
        const currentOverride = JSON.parse(localStorage.getItem(`palika_settings_${tenantId}`) || '{}');
        const newOverride = { ...currentOverride, ...updates };
        localStorage.setItem(`palika_settings_${tenantId}`, JSON.stringify(newOverride));
      } catch (storageErr) {
        console.warn('Local storage save failed (likely quota exceeded for large images). Continuing...', storageErr);
        // If backend also failed, then we truly failed.
        if (!backendSuccess) {
          throw new Error('Both backend and local storage failed to save settings.');
        }
      }

      // 3. Update React state immediately
      setSettings((prev) => {
        const next = { ...(prev || {}), ...updates } as PublicSettings;
        if (next.palika_name) {
          document.title = `${next.palika_name} — Municipal Digital Twins`;
        }
        return next;
      });

      // 4. Notify all components and windows
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('palika-settings-updated'));
      }

      return true;
    } catch (e) {
      console.error('updateSettings error:', e);
      return false;
    }
  };

  useEffect(() => {
    fetchSettings();

    const handleSync = () => {
      fetchSettings();
    };

    // ✅ Re-sync tenant when user logs in/out (p5_user changes in localStorage)
    const handleAuthChange = () => {
      const newTenant = getEffectiveTenantId();
      if (newTenant !== tenantId) {
        setTenantIdState(newTenant);
        localStorage.setItem('tenant_id', newTenant);
      }
    };

    window.addEventListener('storage', handleSync);
    window.addEventListener('storage', handleAuthChange);
    window.addEventListener('palika-settings-updated', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('storage', handleAuthChange);
      window.removeEventListener('palika-settings-updated', handleSync);
    };
  }, [fetchSettings, tenantId]);


  return (
    <TenantContext.Provider value={{ tenantId, setTenantId, settings, isLoading, reloadSettings, updateSettings }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = (): TenantContextType => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};
