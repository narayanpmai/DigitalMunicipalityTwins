import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

export interface FiscalYear {
  id: string;
  name: string; // e.g. "२०८१/०८२"
  code?: string;
  startDateBs?: string;
  endDateBs?: string;
  startDateAd?: string;
  endDateAd?: string;
  isCurrent: boolean;
}

interface FiscalYearContextType {
  fiscalYears: FiscalYear[];
  activeFiscalYear: string;
  setActiveFiscalYear: (fy: string) => void;
  setFiscalYears: (fys: FiscalYear[]) => void;
  syncFiscalYears: (items: any[], activeName?: string) => void;
  isLoading: boolean;
  currentFiscalYear: FiscalYear | null;
}

const DEFAULT_FISCAL_YEARS: FiscalYear[] = [
  { id: 'fy-84-85', name: '२०८४/०८५', code: '2084/085', isCurrent: false },
  { id: 'fy-83-84', name: '२०८३/०८४', code: '2083/084', isCurrent: false },
  { id: 'fy-82-83', name: '२०८२/०८३', code: '2082/083', isCurrent: false },
  { id: 'fy-81-82', name: '२०८१/०८२', code: '2081/082', isCurrent: true },
  { id: 'fy-80-81', name: '२०८०/०८१', code: '2080/081', isCurrent: false },
  { id: 'fy-79-80', name: '२०७९/०८०', code: '2079/080', isCurrent: false },
  { id: 'fy-78-79', name: '२०७८/०७९', code: '2078/079', isCurrent: false },
];

function getInitialFiscalYears(): { list: FiscalYear[]; activeName: string } {
  const savedActive = localStorage.getItem('p5_active_fiscal_year') || '';
  const savedListRaw = localStorage.getItem('p5_fiscal_years');
  let list: FiscalYear[] = [...DEFAULT_FISCAL_YEARS];

  if (savedListRaw) {
    try {
      const parsed = JSON.parse(savedListRaw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        list = parsed.map((item: any) => ({
          id: item.id || `fy-${item.name || item.yearNp}`,
          name: item.name || item.yearNp || '२०८१/०८२',
          code: item.code || item.yearEn || item.name,
          startDateBs: item.startBs || item.startDateBs,
          endDateBs: item.endBs || item.endDateBs,
          startDateAd: item.startAd || item.startDateAd,
          endDateAd: item.endAd || item.endDateAd,
          isCurrent: Boolean(item.isActive || item.isCurrent),
        }));
      }
    } catch (e) {
      console.warn('Could not parse p5_fiscal_years from localStorage', e);
    }
  }

  // Determine active fiscal year
  let activeName = savedActive;
  if (!activeName) {
    const foundActive = list.find((x) => x.isCurrent);
    activeName = foundActive ? foundActive.name : '२०८१/०८२';
  }

  // Ensure isCurrent matches activeName precisely
  list = list.map((fy) => ({
    ...fy,
    isCurrent: fy.name === activeName,
  }));

  // If activeName is not in the list, prepend it
  if (activeName && !list.some((fy) => fy.name === activeName)) {
    list.unshift({
      id: `fy-${activeName}`,
      name: activeName,
      isCurrent: true,
    });
  }

  return { list, activeName };
}

const initial = getInitialFiscalYears();

const FiscalYearContext = createContext<FiscalYearContextType>({
  fiscalYears: initial.list,
  activeFiscalYear: initial.activeName,
  setActiveFiscalYear: () => {},
  setFiscalYears: () => {},
  syncFiscalYears: () => {},
  isLoading: false,
  currentFiscalYear: initial.list.find((x) => x.isCurrent) || initial.list[0],
});

export const FiscalYearProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fiscalYears, setFiscalYearsState] = useState<FiscalYear[]>(() => getInitialFiscalYears().list);
  const [activeFiscalYear, setActiveFiscalYearState] = useState<string>(() => getInitialFiscalYears().activeName);
  const [isLoading, setIsLoading] = useState(false);

  // Set active fiscal year and synchronize everywhere
  const setActiveFiscalYear = (fyName: string) => {
    const trimmed = (fyName || '').trim();
    if (!trimmed) return;

    setActiveFiscalYearState(trimmed);
    localStorage.setItem('p5_active_fiscal_year', trimmed);

    // Update isCurrent in fiscalYears state
    setFiscalYearsState((prev) => {
      let exists = false;
      const updated = prev.map((item) => {
        const isMatch = item.name === trimmed;
        if (isMatch) exists = true;
        return { ...item, isCurrent: isMatch };
      });
      if (!exists) {
        updated.unshift({
          id: `fy-${trimmed}`,
          name: trimmed,
          isCurrent: true,
        });
      }
      return updated;
    });

    // Update p5_fiscal_years in localStorage
    try {
      const savedListRaw = localStorage.getItem('p5_fiscal_years');
      if (savedListRaw) {
        const parsed = JSON.parse(savedListRaw);
        if (Array.isArray(parsed)) {
          let found = false;
          const updatedLocal = parsed.map((item: any) => {
            const isMatch = item.name === trimmed;
            if (isMatch) found = true;
            return { ...item, isActive: isMatch };
          });
          if (!found) {
            updatedLocal.unshift({ name: trimmed, isActive: true });
          }
          localStorage.setItem('p5_fiscal_years', JSON.stringify(updatedLocal));
        }
      }
    } catch (e) {}

    // Dispatch global events
    window.dispatchEvent(new CustomEvent('fiscalYearChanged', { detail: { fiscalYear: trimmed } }));

    // Notify backend in background
    api.post('/fiscal-years/activate', { year: trimmed }).catch(() => {});
  };

  // Directly set fiscal years list
  const setFiscalYears = (newFys: FiscalYear[]) => {
    const active = activeFiscalYear;
    const normalized = newFys.map((fy) => ({
      ...fy,
      isCurrent: fy.name === active,
    }));
    // If active is not in the new list, add it
    if (active && !normalized.some((fy) => fy.name === active)) {
      normalized.unshift({
        id: `fy-${active}`,
        name: active,
        isCurrent: true,
      });
    }
    setFiscalYearsState(normalized);
  };

  // Synchronize from items array (e.g. from FiscalYearManagement or SuperAdmin)
  const syncFiscalYears = (items: any[], activeName?: string) => {
    const targetActive = (activeName || activeFiscalYear || '२०८१/०८२').trim();
    const mapped: FiscalYear[] = items.map((item: any) => ({
      id: item.id || `fy-${item.name || item.yearNp}`,
      name: item.name || item.yearNp,
      code: item.code || item.yearEn || item.name,
      startDateBs: item.startBs || item.startDateBs,
      endDateBs: item.endBs || item.endDateBs,
      startDateAd: item.startAd || item.startDateAd,
      endDateAd: item.endAd || item.endDateAd,
      isCurrent: (item.name || item.yearNp) === targetActive,
    }));

    if (targetActive && !mapped.some((f) => f.name === targetActive)) {
      mapped.unshift({
        id: `fy-${targetActive}`,
        name: targetActive,
        isCurrent: true,
      });
    }

    setFiscalYearsState(mapped);
    if (activeName && activeName !== activeFiscalYear) {
      setActiveFiscalYear(activeName);
    }
  };

  // Event listeners for reactive synchronization
  useEffect(() => {
    const handleFiscalYearChanged = (e: Event) => {
      const custom = e as CustomEvent;
      const fy = custom.detail?.fiscalYear;
      if (fy && fy !== activeFiscalYear) {
        setActiveFiscalYearState(fy);
        setFiscalYearsState((prev) => {
          let found = false;
          const updated = prev.map((item) => {
            const isMatch = item.name === fy;
            if (isMatch) found = true;
            return { ...item, isCurrent: isMatch };
          });
          if (!found) {
            updated.unshift({ id: `fy-${fy}`, name: fy, isCurrent: true });
          }
          return updated;
        });
      }
    };

    const handleFiscalYearsListUpdated = (e: Event) => {
      const custom = e as CustomEvent;
      const fys = custom.detail?.fiscalYears;
      const act = custom.detail?.activeFiscalYear;
      if (Array.isArray(fys) && fys.length > 0) {
        const targetActive = act || activeFiscalYear;
        const normalized = fys.map((f: any) => ({
          ...f,
          isCurrent: f.name === targetActive,
        }));
        setFiscalYearsState(normalized);
      }
      if (act && act !== activeFiscalYear) {
        setActiveFiscalYearState(act);
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'p5_active_fiscal_year' && e.newValue) {
        setActiveFiscalYearState(e.newValue);
        setFiscalYearsState((prev) =>
          prev.map((item) => ({ ...item, isCurrent: item.name === e.newValue }))
        );
      } else if (e.key === 'p5_fiscal_years' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            const active = localStorage.getItem('p5_active_fiscal_year') || activeFiscalYear;
            const mapped = parsed.map((item: any) => ({
              id: item.id || `fy-${item.name}`,
              name: item.name,
              isCurrent: item.name === active || Boolean(item.isActive),
              startDateBs: item.startBs,
              endDateBs: item.endBs,
            }));
            setFiscalYearsState(mapped);
          }
        } catch {}
      }
    };

    window.addEventListener('fiscalYearChanged', handleFiscalYearChanged);
    window.addEventListener('fiscalYearsListUpdated', handleFiscalYearsListUpdated);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('fiscalYearChanged', handleFiscalYearChanged);
      window.removeEventListener('fiscalYearsListUpdated', handleFiscalYearsListUpdated);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [activeFiscalYear]);

  // Initial fetch from backend /fiscal-years
  useEffect(() => {
    let isMounted = true;
    const fetchFiscalYears = async () => {
      try {
        const res = await api.get<any[]>('/fiscal-years');
        const list = Array.isArray(res) ? res : ((res as any)?.data || []);
        if (isMounted && list.length > 0) {
          const savedActive = localStorage.getItem('p5_active_fiscal_year');
          const currentActive = savedActive || activeFiscalYear;

          const mapped: FiscalYear[] = list.map((item: any) => ({
            id: String(item.id || item.code || item.yearNp),
            name: item.yearNp || item.name || item.code || '२०८१/०८२',
            code: item.code || item.yearEn || item.name,
            startDateBs: item.startDateBs,
            endDateBs: item.endDateBs,
            isCurrent: currentActive ? (item.yearNp === currentActive) : Boolean(item.isCurrent),
          }));

          // Merge with any custom ones in localStorage
          const localListRaw = localStorage.getItem('p5_fiscal_years');
          let combined = [...mapped];
          if (localListRaw) {
            try {
              const localList = JSON.parse(localListRaw);
              if (Array.isArray(localList)) {
                for (const loc of localList) {
                  if (!combined.some((c) => c.name === loc.name)) {
                    combined.push({
                      id: loc.id || `fy-${loc.name}`,
                      name: loc.name,
                      isCurrent: loc.name === currentActive || Boolean(loc.isActive),
                      startDateBs: loc.startBs,
                      endDateBs: loc.endBs,
                    });
                  }
                }
              }
            } catch {}
          }

          // Ensure active year is in the list
          if (currentActive && !combined.some((c) => c.name === currentActive)) {
            combined.unshift({
              id: `fy-${currentActive}`,
              name: currentActive,
              isCurrent: true,
            });
          }

          setFiscalYearsState(combined);

          if (!savedActive) {
            const current = combined.find((fy) => fy.isCurrent);
            if (current) {
              setActiveFiscalYearState(current.name);
            }
          }
        }
      } catch (err) {
        console.warn('Could not fetch fiscal years from backend, fallback to statutory defaults', err);
      }
    };

    fetchFiscalYears();
    return () => {
      isMounted = false;
    };
  }, []);

  const currentFiscalYear = fiscalYears.find((fy) => fy.isCurrent) || fiscalYears[0] || null;

  return (
    <FiscalYearContext.Provider
      value={{
        fiscalYears,
        activeFiscalYear,
        setActiveFiscalYear,
        setFiscalYears,
        syncFiscalYears,
        isLoading,
        currentFiscalYear,
      }}
    >
      {children}
    </FiscalYearContext.Provider>
  );
};

export const useFiscalYear = () => useContext(FiscalYearContext);

