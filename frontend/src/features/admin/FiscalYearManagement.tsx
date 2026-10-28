import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  CalendarRange,
  CalendarCheck,
  Plus,
  Check,
  Calendar,
  Sparkles,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Info,
  ShieldAlert,
} from 'lucide-react';
import { BsCalendarModal } from '../../components/common/BsCalendarModal';
import {
  calculateFiscalYearDates,
  toNepaliDigits,
} from '../../utils/nepaliCalendar';
import { useFiscalYear } from '../../context/FiscalYearContext';
import { useTenant } from '../../context/TenantContext';

export interface FiscalYearItem {
  id?: string;
  name: string; // e.g. "२०८१/०८२"
  startBs?: string;
  startAd?: string;
  endBs?: string;
  endAd?: string;
  isActive: boolean;
}

const DEFAULT_FISCAL_YEARS: FiscalYearItem[] = [
  {
    name: '२०८१/०८२',
    startBs: '२०८१-०४-०१',
    startAd: '2024-07-16',
    endBs: '२०८२-०३-३१',
    endAd: '2025-07-15',
    isActive: true,
  },
  {
    name: '२०८०/०८१',
    startBs: '२०८०-०४-०१',
    startAd: '2023-07-17',
    endBs: '२०८१-०३-३१',
    endAd: '2024-07-15',
    isActive: false,
  },
  {
    name: '२०७९/०८०',
    startBs: '२०७९-०४-०१',
    startAd: '2022-07-17',
    endBs: '२०८०-०३-३१',
    endAd: '2023-07-16',
    isActive: false,
  },
  {
    name: '२०८२/०८३',
    startBs: '२०८२-०४-०१',
    startAd: '2025-07-16',
    endBs: '२०८३-०३-३१',
    endAd: '2026-07-15',
    isActive: false,
  },
];

export const FiscalYearManagement: React.FC = () => {
  const {
    activeFiscalYear,
    setActiveFiscalYear: setContextActiveFy,
    syncFiscalYears,
  } = useFiscalYear();
  const { tenantId, settings, updateSettings } = useTenant();

  const [fiscalYearsList, setFiscalYearsList] = useState<FiscalYearItem[]>(DEFAULT_FISCAL_YEARS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [fyName, setFyName] = useState<string>('');
  const [fyStartBs, setFyStartBs] = useState<string>('');
  const [fyStartAd, setFyStartAd] = useState<string>('');
  const [fyEndBs, setFyEndBs] = useState<string>('');
  const [fyEndAd, setFyEndAd] = useState<string>('');
  const [fyIsActive, setFyIsActive] = useState<boolean>(false);
  const [editFyIndex, setEditFyIndex] = useState<number>(-1);

  // BS Calendar Modal State
  const [calendarModalOpen, setCalendarModalOpen] = useState<boolean>(false);
  const [calendarTarget, setCalendarTarget] = useState<'start' | 'end'>('start');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load saved fiscal years from localStorage or backend
  useEffect(() => {
    const loadFyData = async () => {
      const savedActive = localStorage.getItem('p5_active_fiscal_year') || activeFiscalYear;

      // 1. Try local storage first
      const savedLocalFy = localStorage.getItem('p5_fiscal_years');
      if (savedLocalFy) {
        try {
          const parsed = JSON.parse(savedLocalFy);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const normalized = savedActive
              ? parsed.map((item: any) => ({ ...item, isActive: item.name === savedActive }))
              : parsed;
            setFiscalYearsList(normalized);
          }
        } catch (e) {}
      }

      // 2. Fetch from backend settings
      try {
        const token = localStorage.getItem('p5_token');
        const res = await axios.get('/api/v1/settings', {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            'X-Tenant-Id': tenantId || 'panchpokhari',
          },
        });
        if (res.data) {
          const s = res.data.data || res.data;
          if (s.fiscal_years_list) {
            const parsed =
              typeof s.fiscal_years_list === 'string'
                ? JSON.parse(s.fiscal_years_list)
                : s.fiscal_years_list;
            if (Array.isArray(parsed) && parsed.length > 0) {
              const active = s.active_fiscal_year || savedActive;
              const normalized = parsed.map((item: any) => ({
                ...item,
                isActive: active ? item.name === active : item.isActive,
              }));
              setFiscalYearsList(normalized);
              localStorage.setItem('p5_fiscal_years', JSON.stringify(normalized));
              if (active) {
                localStorage.setItem('p5_active_fiscal_year', active);
              }
            }
          }
        }
      } catch (err) {
        // Fallback to local
      }
    };

    loadFyData();
  }, [tenantId, activeFiscalYear]);

  // Listen to fiscalYearChanged event from Navbar or elsewhere
  useEffect(() => {
    const handleFyChanged = (e: Event) => {
      const custom = e as CustomEvent;
      const targetFy = custom.detail?.fiscalYear;
      if (targetFy) {
        setFiscalYearsList((prev) =>
          prev.map((item) => ({ ...item, isActive: item.name === targetFy }))
        );
      }
    };
    window.addEventListener('fiscalYearChanged', handleFyChanged);
    return () => window.removeEventListener('fiscalYearChanged', handleFyChanged);
  }, []);

  // Persist Fiscal Years to backend, context & localStorage
  const saveFiscalYears = async (updatedList: FiscalYearItem[]) => {
    setFiscalYearsList(updatedList);
    localStorage.setItem('p5_fiscal_years', JSON.stringify(updatedList));

    const activeFy = updatedList.find((x) => x.isActive) || updatedList[0];
    const activeName = activeFy ? activeFy.name : '२०८१/०८२';

    localStorage.setItem('p5_active_fiscal_year', activeName);

    // Synchronize to FiscalYearContext immediately
    if (syncFiscalYears) {
      syncFiscalYears(updatedList, activeName);
    }
    setContextActiveFy(activeName);

    // Update settings in TenantContext
    if (updateSettings) {
      updateSettings({
        active_fiscal_year: activeName,
        fiscal_years_list: JSON.stringify(updatedList),
      });
    }

    // Persist to backend settings bulk endpoint & fiscal-years router
    try {
      const token = localStorage.getItem('p5_token');
      await axios.post(
        '/api/v1/settings/bulk',
        {
          fiscal_years_list: JSON.stringify(updatedList),
          active_fiscal_year: activeName,
        },
        {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            'X-Tenant-Id': tenantId || 'panchpokhari',
          },
        }
      );

      // Also notify backend fiscal-years activate endpoint
      axios.post('/api/v1/fiscal-years/activate', { year: activeName }).catch(() => {});
      axios
        .post('/api/v1/fiscal-years/sync', {
          fiscalYears: updatedList,
          activeYear: activeName,
        })
        .catch(() => {});
    } catch (err) {
      console.warn('Could not persist fiscal year bulk settings:', err);
    }

    // Dispatch global events for Navbar and all other components
    window.dispatchEvent(new CustomEvent('fiscalYearChanged', { detail: { fiscalYear: activeName } }));
    window.dispatchEvent(
      new CustomEvent('fiscalYearsListUpdated', {
        detail: {
          fiscalYears: updatedList.map((x) => ({
            id: x.id || `fy-${x.name}`,
            name: x.name,
            startDateBs: x.startBs,
            endDateBs: x.endBs,
            startDateAd: x.startAd,
            endDateAd: x.endAd,
            isCurrent: x.isActive,
          })),
          activeFiscalYear: activeName,
        },
      })
    );
  };


  // Preset Selector with Auto-Date Calculations
  const handleSetPreset = (presetName: string) => {
    setFyName(presetName);
    const calculated = calculateFiscalYearDates(presetName);
    if (calculated) {
      setFyStartBs(calculated.startBs);
      setFyStartAd(calculated.startAd);
      setFyEndBs(calculated.endBs);
      setFyEndAd(calculated.endAd);
      showToast(`आ.व. ${presetName} को सुरु र अन्त्य मिति स्वतः भरियो`);
    }
  };

  // Dynamic input typing handler with date math
  const handleFyNameChange = (val: string) => {
    setFyName(val);
    const calculated = calculateFiscalYearDates(val);
    if (calculated) {
      setFyStartBs(calculated.startBs);
      setFyStartAd(calculated.startAd);
      setFyEndBs(calculated.endBs);
      setFyEndAd(calculated.endAd);
    }
  };

  // Open BS Calendar Modal
  const openBsCalendar = (target: 'start' | 'end') => {
    setCalendarTarget(target);
    setCalendarModalOpen(true);
  };

  // Calendar date selected callback
  const handleCalendarDateSelect = (bsDate: string, adDate: string) => {
    if (calendarTarget === 'start') {
      setFyStartBs(bsDate);
      setFyStartAd(adDate);
    } else {
      setFyEndBs(bsDate);
      setFyEndAd(adDate);
    }
  };

  // Add or Edit Fiscal Year
  const handleFiscalYearSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = fyName.trim();
    if (!name) return showToast('कृपया आर्थिक वर्षको नाम प्रविष्ट गर्नुहोस्!');
    if (!fyStartBs) return showToast('कृपया सुरु मिति (वि.सं.) छान्नुहोस्!');
    if (!fyEndBs) return showToast('कृपया अन्त्य मिति (वि.सं.) छान्नुहोस्!');

    let updated = [...fiscalYearsList];
    if (fyIsActive) {
      updated = updated.map((item) => ({ ...item, isActive: false }));
    }

    const newEntry: FiscalYearItem = {
      name,
      startBs: fyStartBs,
      startAd: fyStartAd,
      endBs: fyEndBs,
      endAd: fyEndAd,
      isActive: fyIsActive,
    };

    if (editFyIndex >= 0 && editFyIndex < updated.length) {
      updated[editFyIndex] = newEntry;
      showToast(`आर्थिक वर्ष ${name} सफलतापूर्वक अद्यावधिक गरियो!`);
    } else {
      const exists = updated.find((x) => x.name === name);
      if (exists) {
        return showToast(`आर्थिक वर्ष ${name} पहिले नै दर्ता भइसकेको छ!`);
      }
      updated.unshift(newEntry);
      showToast(`नयाँ आर्थिक वर्ष ${name} सफलतापूर्वक थपियो!`);
    }

    saveFiscalYears(updated);
    resetFiscalYearForm();
  };

  // Reset form
  const resetFiscalYearForm = () => {
    setFyName('');
    setFyStartBs('');
    setFyStartAd('');
    setFyEndBs('');
    setFyEndAd('');
    setFyIsActive(false);
    setEditFyIndex(-1);
  };

  // Edit action
  const handleEditFiscalYear = (idx: number) => {
    const fy = fiscalYearsList[idx];
    if (!fy) return;
    setEditFyIndex(idx);
    setFyName(fy.name);
    setFyStartBs(fy.startBs || '');
    setFyStartAd(fy.startAd || '');
    setFyEndBs(fy.endBs || '');
    setFyEndAd(fy.endAd || '');
    setFyIsActive(!!fy.isActive);
  };

  // Toggle Active Fiscal Year (One-click)
  const handleToggleFiscalYearActive = (idx: number) => {
    const updated = fiscalYearsList.map((item, i) => ({
      ...item,
      isActive: i === idx,
    }));
    saveFiscalYears(updated);
    showToast(`आर्थिक वर्ष ${fiscalYearsList[idx].name} लाई चालू (सक्रिय) बनाइयो!`);
  };

  // Delete action
  const handleDeleteFiscalYear = (idx: number) => {
    const fy = fiscalYearsList[idx];
    if (!fy) return;
    if (fy.isActive) {
      return showToast('चालू सक्रिय आर्थिक वर्ष मेटाउन सकिँदैन! पहिले अर्को वर्षलाई सक्रिय बनाउनुहोस्।');
    }
    if (!window.confirm(`के तपाईं आर्थिक वर्ष "${fy.name}" मेटाउन निश्चित हुनुहुन्छ?`)) return;

    const updated = fiscalYearsList.filter((_, i) => i !== idx);
    saveFiscalYears(updated);
    showToast(`आर्थिक वर्ष ${fy.name} हटाइयो`);
  };

  const activeFy = fiscalYearsList.find((x) => x.isActive) || fiscalYearsList[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.9rem',
            fontWeight: 600,
            animation: 'fadeIn 0.2s ease-in-out',
          }}
        >
          <Sparkles size={18} color="#38bdf8" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* BS Calendar Date Picker Modal */}
      <BsCalendarModal
        isOpen={calendarModalOpen}
        onClose={() => setCalendarModalOpen(false)}
        initialBsDate={calendarTarget === 'start' ? fyStartBs : fyEndBs}
        onSelectDate={handleCalendarDateSelect}
        title={calendarTarget === 'start' ? 'आर्थिक वर्ष सुरु मिति (वि.सं.)' : 'आर्थिक वर्ष अन्त्य मिति (वि.सं.)'}
      />

      {/* ── HEADER BANNER & STATS STRIP ── */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '18px',
          padding: '1.5rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span
              style={{
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                padding: '6px 10px',
                borderRadius: '10px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CalendarRange size={24} />
            </span>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                आर्थिक वर्ष व्यवस्थापन (Fiscal Year Setup)
              </h2>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                {settings?.palika_name || (tenantId === 'khadadevi' ? 'खाँडादेवी गाउँपालिका' : 'गाउँ/नगर कार्यपालिका')} — आयोजना, बजेट, राजस्व तथा प्रतिवेदन फिल्टर इन्जिन
              </span>
            </div>
          </div>
        </div>

        {/* Quick Presets */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>द्रुत वर्ष चयन:</span>
          {['२०८०/०८१', '२०८१/०८२', '२०८२/०८३', '२०८३/०८४', '२०८४/०८५'].map((preset) => {
            const isCurr = activeFy?.name === preset;
            return (
              <button
                key={preset}
                type="button"
                onClick={() => handleSetPreset(preset)}
                style={{
                  padding: '6px 13px',
                  borderRadius: '9999px',
                  border: isCurr ? '1.5px solid #2563eb' : '1px solid #cbd5e1',
                  backgroundColor: isCurr ? '#eff6ff' : '#ffffff',
                  color: isCurr ? '#1d4ed8' : '#334155',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {preset} {isCurr && '★'}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── KPI METRICS CARDS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div
          className="dt-card"
          style={{
            padding: '1.2rem',
            borderLeft: '4px solid #10b981',
            backgroundColor: '#ffffff',
            borderRadius: '14px',
          }}
        >
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            चालू सक्रिय आर्थिक वर्ष
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#059669', marginTop: '4px' }}>
            {activeFy?.name || '२०८१/०८२'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600, marginTop: '2px' }}>
            ● प्रणालीभर डाटा फिल्टरमा सक्रिय
          </div>
        </div>

        <div
          className="dt-card"
          style={{
            padding: '1.2rem',
            borderLeft: '4px solid #3b82f6',
            backgroundColor: '#ffffff',
            borderRadius: '14px',
          }}
        >
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            सुरु मिति (१ साउन)
          </div>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1e40af', marginTop: '4px' }}>
            {activeFy?.startBs || '२०८१-०४-०१'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
            ई.सं. {activeFy?.startAd || '2024-07-16'}
          </div>
        </div>

        <div
          className="dt-card"
          style={{
            padding: '1.2rem',
            borderLeft: '4px solid #f59e0b',
            backgroundColor: '#ffffff',
            borderRadius: '14px',
          }}
        >
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            अन्त्य मिति (मसान्त असार)
          </div>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#b45309', marginTop: '4px' }}>
            {activeFy?.endBs || '२०८२-०३-३१'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
            ई.सं. {activeFy?.endAd || '2025-07-15'}
          </div>
        </div>

        <div
          className="dt-card"
          style={{
            padding: '1.2rem',
            borderLeft: '4px solid #8b5cf6',
            backgroundColor: '#ffffff',
            borderRadius: '14px',
          }}
        >
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            कुल दर्ता आर्थिक वर्षहरू
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#6d28d9', marginTop: '4px' }}>
            {toNepaliDigits(fiscalYearsList.length)} वटा
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
            ऐतिहासिक तथा आगामी वर्ष सूची
          </div>
        </div>
      </div>

      {/* ── 2-COLUMN LAYOUT: FORM (LEFT) & TABLE (RIGHT) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 380px) 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* LEFT: Add / Edit Fiscal Year Card */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '18px',
            border: '1px solid #e2e8f0',
            padding: '1.5rem',
            boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
          }}
        >
          <h4
            style={{
              fontSize: '1.1rem',
              fontWeight: 800,
              color: '#0f172a',
              marginBottom: '1.1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <CalendarCheck size={20} color="#2563eb" />
            <span>{editFyIndex >= 0 ? `आर्थिक वर्ष सम्पादन (${fyName})` : 'नयाँ आर्थिक वर्ष दर्ता गर्नुहोस्'}</span>
          </h4>

          <form onSubmit={handleFiscalYearSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            {/* FY Name */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                आर्थिक वर्षको नाम (उदा. २०८२/०८३) *
              </label>
              <input
                type="text"
                required
                placeholder="उदा. २०८२/०८३"
                value={fyName}
                onChange={(e) => handleFyNameChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  outline: 'none',
                  color: '#0f172a',
                }}
              />
              <small style={{ display: 'block', color: '#64748b', fontSize: '0.72rem', marginTop: '3px' }}>
                आर्थिक वर्ष लेख्दा सुरु (१ साउन) र अन्त्य (असार मसान्त) मिति स्वतः गणना हुनेछ।
              </small>
            </div>

            {/* Start Date (BS) */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>
                  सुरु मिति (वि.सं.) *
                </label>
                <span style={{ fontSize: '0.7rem', color: '#2563eb', fontWeight: 700, backgroundColor: '#eff6ff', padding: '1px 6px', borderRadius: '4px' }}>
                  १ साउन
                </span>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="text"
                  required
                  readOnly
                  onClick={() => openBsCalendar('start')}
                  placeholder="२०८२-०४-०१"
                  value={fyStartBs}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    backgroundColor: '#f8fafc',
                    cursor: 'pointer',
                  }}
                />
                <button
                  type="button"
                  onClick={() => openBsCalendar('start')}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '10px',
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  title="नेपाली पात्रो खोल्नुहोस्"
                >
                  <Calendar size={16} />
                </button>
              </div>
              {fyStartAd && (
                <small style={{ display: 'block', color: '#64748b', fontSize: '0.75rem', marginTop: '2px' }}>
                  (ई.सं.: {fyStartAd})
                </small>
              )}
            </div>

            {/* End Date (BS) */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>
                  अन्त्य मिति (वि.सं.) *
                </label>
                <span style={{ fontSize: '0.7rem', color: '#dc2626', fontWeight: 700, backgroundColor: '#fef2f2', padding: '1px 6px', borderRadius: '4px' }}>
                  मसान्त असार
                </span>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="text"
                  required
                  readOnly
                  onClick={() => openBsCalendar('end')}
                  placeholder="२०८३-०३-३१"
                  value={fyEndBs}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    backgroundColor: '#f8fafc',
                    cursor: 'pointer',
                  }}
                />
                <button
                  type="button"
                  onClick={() => openBsCalendar('end')}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '10px',
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  title="नेपाली पात्रो खोल्नुहोस्"
                >
                  <Calendar size={16} />
                </button>
              </div>
              {fyEndAd && (
                <small style={{ display: 'block', color: '#64748b', fontSize: '0.75rem', marginTop: '2px' }}>
                  (ई.सं.: {fyEndAd})
                </small>
              )}
            </div>

            {/* Active Checkbox */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0' }}>
              <input
                type="checkbox"
                id="fyActiveCbAdmin"
                checked={fyIsActive}
                onChange={(e) => setFyIsActive(e.target.checked)}
                style={{ width: '17px', height: '17px', cursor: 'pointer' }}
              />
              <label
                htmlFor="fyActiveCbAdmin"
                style={{ fontSize: '0.85rem', color: '#1e293b', fontWeight: 700, cursor: 'pointer' }}
              >
                यसलाई तत्काल चालू सक्रिय (Active FY) बनाउनुहोस्
              </label>
            </div>

            {/* Submit & Reset Buttons */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <button
                type="submit"
                style={{
                  flex: 1,
                  padding: '11px',
                  borderRadius: '10px',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(37,99,235,0.25)',
                }}
              >
                <Check size={18} />
                <span>{editFyIndex >= 0 ? 'अद्यावधिक सुरक्षित गर्नुहोस्' : 'आर्थिक वर्ष सुरक्षित गर्नुहोस्'}</span>
              </button>

              {editFyIndex >= 0 && (
                <button
                  type="button"
                  onClick={resetFiscalYearForm}
                  style={{
                    padding: '11px 14px',
                    borderRadius: '10px',
                    backgroundColor: '#f1f5f9',
                    color: '#475569',
                    border: '1px solid #cbd5e1',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  रद्द
                </button>
              )}
            </div>
          </form>
        </div>

        {/* RIGHT: Fiscal Years Table */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '18px',
            border: '1px solid #e2e8f0',
            padding: '1.5rem',
            boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                दर्ता भएका आर्थिक वर्षहरूको सूची
              </h4>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                पालिकाका कर्मचारी र नागरिकहरूले हेर्ने सक्रिय वर्ष यहाँबाट तुरुन्तै परिवर्तन गर्न सक्नुहुन्छ
              </p>
            </div>
            <span
              style={{
                padding: '4px 12px',
                borderRadius: '9999px',
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#1d4ed8',
              }}
            >
              कुल: {toNepaliDigits(fiscalYearsList.length)}
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', color: '#475569', textAlign: 'left' }}>
                  <th style={{ padding: '10px 12px', borderBottom: '1px solid #e2e8f0', fontWeight: 700 }}>क्र.सं.</th>
                  <th style={{ padding: '10px 12px', borderBottom: '1px solid #e2e8f0', fontWeight: 700 }}>आर्थिक वर्ष</th>
                  <th style={{ padding: '10px 12px', borderBottom: '1px solid #e2e8f0', fontWeight: 700 }}>अवधि (वि.सं.)</th>
                  <th style={{ padding: '10px 12px', borderBottom: '1px solid #e2e8f0', fontWeight: 700 }}>अवधि (ई.सं.)</th>
                  <th style={{ padding: '10px 12px', borderBottom: '1px solid #e2e8f0', fontWeight: 700, textAlign: 'center' }}>स्थिति</th>
                  <th style={{ padding: '10px 12px', borderBottom: '1px solid #e2e8f0', fontWeight: 700, textAlign: 'right' }}>कार्यहरू</th>
                </tr>
              </thead>
              <tbody>
                {fiscalYearsList.map((fy, idx) => (
                  <tr
                    key={fy.name}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      backgroundColor: fy.isActive ? 'rgba(239, 246, 255, 0.45)' : 'transparent',
                    }}
                  >
                    <td style={{ padding: '12px', borderBottom: '1px solid #f1f5f9', color: '#64748b' }}>
                      {toNepaliDigits(idx + 1)}
                    </td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #f1f5f9' }}>
                      <strong style={{ color: fy.isActive ? '#1d4ed8' : '#0f172a', fontSize: '0.95rem' }}>
                        {fy.name}
                      </strong>
                    </td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #f1f5f9', color: '#334155' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontWeight: 600 }}>{fy.startBs || '-'}</span>
                        <span style={{ color: '#94a3b8' }}>देखि</span>
                        <span style={{ fontWeight: 600 }}>{fy.endBs || '-'}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #f1f5f9', color: '#64748b', fontSize: '0.8rem' }}>
                      {fy.startAd || '-'} → {fy.endAd || '-'}
                    </td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #f1f5f9', textAlign: 'center' }}>
                      {fy.isActive ? (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            backgroundColor: '#dcfce7',
                            color: '#15803d',
                            padding: '3px 10px',
                            borderRadius: '9999px',
                            fontSize: '0.78rem',
                            fontWeight: 800,
                          }}
                        >
                          <CheckCircle2 size={13} />
                          <span>चालू सक्रिय</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleToggleFiscalYearActive(idx)}
                          style={{
                            backgroundColor: '#f1f5f9',
                            color: '#475569',
                            padding: '3px 10px',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            border: '1px solid #cbd5e1',
                            cursor: 'pointer',
                          }}
                          title="यस वर्षलाई चालू सक्रिय बनाउनुहोस्"
                        >
                          सक्रिय बनाउनुहोस्
                        </button>
                      )}
                    </td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #f1f5f9', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => handleEditFiscalYear(idx)}
                          style={{
                            padding: '5px 8px',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            backgroundColor: '#ffffff',
                            color: '#334155',
                            cursor: 'pointer',
                          }}
                          title="सम्पादन गर्नुहोस्"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteFiscalYear(idx)}
                          disabled={fy.isActive}
                          style={{
                            padding: '5px 8px',
                            borderRadius: '6px',
                            border: '1px solid #fecaca',
                            backgroundColor: fy.isActive ? '#f1f5f9' : '#fef2f2',
                            color: fy.isActive ? '#94a3b8' : '#dc2626',
                            cursor: fy.isActive ? 'not-allowed' : 'pointer',
                          }}
                          title={fy.isActive ? 'सक्रिय वर्ष मेटाउन मिल्दैन' : 'हटाउनुहोस्'}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── EXPLANATORY NOTICE CARD ── */}
      <div
        style={{
          backgroundColor: '#eff6ff',
          borderRadius: '14px',
          border: '1px solid #bfdbfe',
          padding: '1.2rem',
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-start',
        }}
      >
        <Info size={22} color="#1d4ed8" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <h5 style={{ fontWeight: 800, margin: '0 0 4px', color: '#1e3a8a', fontSize: '0.95rem' }}>
            पालिकागत आर्थिक वर्ष फिल्टर कसरी काम गर्दछ?
          </h5>
          <p style={{ margin: 0, fontSize: '0.84rem', color: '#1e40af', lineHeight: 1.5 }}>
            यहाँबाट कुनै पनि वर्षलाई <strong>"चालू सक्रिय"</strong> बनाएपछि वा माथिल्लो नेभिगेसन बारबाट आ.व. छनोट गर्दा, पालिकाका योजना तथा आयोजनाहरू (Projects), बजेट तथा LMBIS, राजस्व अभिलेख (e-Tax), प्रगति विवरण (Progress Reports), र ड्यासबोर्डका प्रमुख सूचकहरू तत्काल छानिएको आर्थिक वर्ष अनुसार स्वतः फिल्टर हुनेछन्।
          </p>
        </div>
      </div>
    </div>
  );
};
