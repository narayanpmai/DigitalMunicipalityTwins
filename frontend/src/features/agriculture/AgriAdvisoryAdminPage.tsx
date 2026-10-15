import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { agricultureApi, AgriAdvisory } from '../../api/agriculture';
import {
  Plus,
  Trash2,
  CloudLightning,
  Bug,
  Sprout,
  Info,
  ShieldAlert,
  Search,
  CheckCircle2,
  AlertTriangle,
  X,
  Smartphone,
  Calendar,
  Layers,
  Radio,
  Bell,
  Clock,
  Send,
  Eye,
  Filter,
  Wifi,
  Battery,
  Volume2,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import './agriculture-pro.css';

const ADVISORY_TYPES = [
  { id: 'all', label: 'सबै प्रकार' },
  { id: 'weather', label: 'मौसम अलर्ट (Weather)', icon: <CloudLightning size={15} /> },
  { id: 'pest_control', label: 'रोगकिरा (Pest Control)', icon: <Bug size={15} /> },
  { id: 'crop_management', label: 'बाली व्यवस्थापन (Crop)', icon: <Sprout size={15} /> },
  { id: 'livestock_health', label: 'पशु स्वास्थ्य (Livestock)', icon: <ShieldAlert size={15} /> },
  { id: 'general', label: 'सामान्य सूचना (General)', icon: <Info size={15} /> },
];

export const AgriAdvisoryAdminPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [activeOnlyFilter, setActiveOnlyFilter] = useState<boolean>(false);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteCandidateId, setDeleteCandidateId] = useState<string | null>(null);
  const [previewAdvisory, setPreviewAdvisory] = useState<AgriAdvisory | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const [newAdvisory, setNewAdvisory] = useState<Partial<AgriAdvisory>>({
    advisoryType: 'weather',
    validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    targetCategory: 'समग्र बाली तथा पशुपन्छी',
    targetZone: 'सबै वडा (गाउँपालिका स्तर)',
    assignedOfficer: 'रामेश्वर थापा (कृषि प्राविधिक)',
    officerPhone: '९८४१२३४५६७',
    smsStatus: 'बल्क एसएमएस तयारी (Ready for Broadcast)'
  });

  React.useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const { data: advisories = [], isLoading } = useQuery({
    queryKey: ['advisories'],
    queryFn: () => agricultureApi.getAdvisories(false),
  });

  const createMutation = useMutation({
    mutationFn: agricultureApi.createAdvisory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advisories'] });
      setShowAddModal(false);
      setNewAdvisory({
        advisoryType: 'weather',
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      });
      setToastMessage({ type: 'success', text: 'नयाँ कृषि तथा मौसम सल्लाह सफलतापूर्वक प्रकाशित गरियो!' });
    },
    onError: (err: any) => {
      setToastMessage({ type: 'error', text: 'त्रुटि: ' + (err.message || 'सल्लाह प्रकाशित गर्न सकिएन') });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: agricultureApi.deleteAdvisory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advisories'] });
      setDeleteCandidateId(null);
      setToastMessage({ type: 'success', text: 'सूचना सफलतापूर्वक हटाइयो!' });
    },
    onError: (err: any) => {
      setToastMessage({ type: 'error', text: 'त्रुटि: ' + (err.message || 'हटाउन सकिएन') });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(newAdvisory as AgriAdvisory);
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'weather': return <CloudLightning className="text-amber-500" size={22} />;
      case 'pest_control': return <Bug className="text-red-500" size={22} />;
      case 'crop_management': return <Sprout className="text-emerald-500" size={22} />;
      case 'livestock_health': return <ShieldAlert className="text-purple-500" size={22} />;
      default: return <Info className="text-blue-500" size={22} />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'weather': return 'मौसम सतर्कता (Weather)';
      case 'pest_control': return 'रोगकिरा नियन्त्रण (Pest Control)';
      case 'crop_management': return 'बाली व्यवस्थापन (Crop Care)';
      case 'livestock_health': return 'पशु स्वास्थ्य (Livestock Health)';
      default: return 'सामान्य सूचना (General)';
    }
  };

  const getSeverityStyle = (type: string) => {
    if (type === 'pest_control') {
      return { borderLeft: '5px solid #ef4444', badgeBg: '#fef2f2', badgeColor: '#991b1b', label: 'उच्च जोखिम (High Alert)' };
    }
    if (type === 'weather') {
      return { borderLeft: '5px solid #f59e0b', badgeBg: '#fffbeb', badgeColor: '#92400e', label: 'मौसम चेतावनी (Warning)' };
    }
    return { borderLeft: '5px solid #0f4c81', badgeBg: '#eff6ff', badgeColor: '#1d4ed8', label: 'प्राविधिक सल्लाह (Advisory)' };
  };

  // KPIs
  const totalCount = advisories.length;
  const activeCount = useMemo(() => {
    return advisories.filter(a => !a.validUntil || new Date(a.validUntil) >= new Date()).length;
  }, [advisories]);

  const weatherAlertsCount = useMemo(() => {
    return advisories.filter(a => a.advisoryType === 'weather').length;
  }, [advisories]);

  const pestAlertsCount = useMemo(() => {
    return advisories.filter(a => a.advisoryType === 'pest_control').length;
  }, [advisories]);

  // Filtered Advisories
  const filteredAdvisories = useMemo(() => {
    return advisories.filter(a => {
      const typeMatch = selectedType === 'all' || a.advisoryType === selectedType;
      const activeMatch = !activeOnlyFilter || (!a.validUntil || new Date(a.validUntil) >= new Date());
      const searchMatch = !searchTerm ||
        a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.content.toLowerCase().includes(searchTerm.toLowerCase());
      return typeMatch && activeMatch && searchMatch;
    });
  }, [advisories, selectedType, activeOnlyFilter, searchTerm]);

  return (
    <div className="gov-content-wrapper" style={{ padding: '1.5rem', }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '24px',
            zIndex: 9999,
            backgroundColor: toastMessage.type === 'success' ? '#064e3b' : '#991b1b',
            color: '#ffffff',
            padding: '0.9rem 1.35rem',
            borderRadius: '12px',
            boxShadow: '0 15px 35px rgba(0,0,0,0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.8rem',
            fontWeight: 700,
            fontSize: '0.9rem',
            border: '1px solid rgba(255,255,255,0.2)',
          }}
        >
          {toastMessage.type === 'success' ? <CheckCircle2 size={20} className="text-emerald-400" /> : <AlertTriangle size={20} className="text-red-300" />}
          <span>{toastMessage.text}</span>
          <button
            onClick={() => setToastMessage(null)}
            style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', marginLeft: '0.5rem' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* COMMAND CENTER HERO BANNER */}
      <div className="agri-hero-banner" style={{ background: 'linear-gradient(135deg, #7c2d12 0%, #c2410c 45%, #ea580c 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', position: 'relative', zIndex: 2 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.55rem', flexWrap: 'wrap' }}>
              <span className="agri-telemetry-badge" style={{ background: 'rgba(255, 255, 255, 0.18)', color: '#fed7aa' }}>
                <span className="agri-pulse-dot" style={{ backgroundColor: '#f97316', boxShadow: '0 0 8px #f97316' }}></span>
                प्रत्यक्ष कृषि-मौसम पूर्वचेतावनी नेटवर्क
              </span>
              <span style={{ fontSize: '0.78rem', color: '#ffedd5', fontWeight: 600 }}>
                नेपाल सरकार • पाँचपोखरी थाङपाल गाउँ कार्यपालिका • कृषि तथा मौसम सल्लाह शाखा
              </span>
            </div>

            <h1 style={{ fontSize: '1.9rem', fontWeight: 900, margin: 0, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#ffffff' }}>
              <CloudLightning size={36} className="text-amber-300" />
              कृषि-मौसम तथा प्राविधिक सल्लाह प्रसारण केन्द्र
            </h1>
            <p style={{ fontSize: '0.92rem', color: '#fff7ed', margin: '0.5rem 0 0', maxWidth: '820px', lineHeight: 1.5 }}>
              मौसम पूर्वानुमान, असिना/तुसारो चेतावनी, फौजी किरा नियन्त्रण र बाली व्यवस्थापन सम्बन्धी किसान अलर्टहरू (SMS र नागरिक सेवा मोबाइल PWA प्रत्यक्ष प्रसारण)
            </p>
          </div>

          {/* Action Button */}
          <div>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.4rem',
                borderRadius: '12px',
                background: '#ffffff',
                color: '#9a3412',
                fontWeight: 900,
                fontSize: '0.92rem',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
                transition: 'all 0.15s ease'
              }}
            >
              <Plus size={19} /> नयाँ सूचना / अलर्ट जारी गर्नुहोस्
            </button>
          </div>
        </div>
      </div>

      {/* GLOWING COMMAND CENTER KPI METRICS */}
      <div className="agri-kpi-grid" style={{ marginBottom: '1.5rem' }}>
        {/* KPI 1 */}
        <div className="agri-kpi-glow-card" style={{ borderTop: '4px solid #10b981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b' }}>सक्रिय सूचनाहरू (Active Alerts)</div>
              <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#059669', margin: '4px 0 2px' }}>
                {activeCount} <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#64748b' }}>वटा जारी</span>
              </div>
            </div>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)', color: '#065f46', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)' }}>
              <Radio size={26} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.75rem', alignItems: 'center' }}>
            <span className="agri-badge agri-badge-success">
              <span className="agri-pulse-dot" style={{ width: '6px', height: '6px' }}></span>
              प्रसारणमा प्रत्यक्ष
            </span>
            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>किसान मोबाइल एपमा सिंक</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="agri-kpi-glow-card" style={{ borderTop: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b' }}>मौसम तथा वर्षा अलर्ट</div>
              <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#d97706', margin: '4px 0 2px' }}>
                {weatherAlertsCount} <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#64748b' }}>सूचना</span>
              </div>
            </div>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.2)' }}>
              <CloudLightning size={26} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.75rem', alignItems: 'center' }}>
            <span className="agri-badge agri-badge-warning">वर्षा, असिना, तुसारो</span>
            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>जल तथा मौसम विभाग सिंक</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="agri-kpi-glow-card" style={{ borderTop: '4px solid #ef4444' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b' }}>रोगकिरा प्रकोप सतर्कता</div>
              <div style={{ fontSize: '1.85rem', fontWeight: 900, color: pestAlertsCount > 0 ? '#dc2626' : '#64748b', margin: '4px 0 2px' }}>
                {pestAlertsCount} <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#64748b' }}>प्रकोप अलर्ट</span>
              </div>
            </div>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #fee2e2 0%, #fca5a5 100%)', color: '#991b1b', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)' }}>
              <Bug size={26} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.75rem', alignItems: 'center' }}>
            <span className={pestAlertsCount > 0 ? "agri-badge agri-badge-danger" : "agri-badge"}>
              {pestAlertsCount > 0 ? '⚠ तत्काल रोकथाम आवश्यक' : '✓ नियन्त्रणमा'}
            </span>
            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>फौजी किरा, ढुसी, भाइरस</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="agri-kpi-glow-card" style={{ borderTop: '4px solid #3b82f6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b' }}>लक्षित वडा कभरेज</div>
              <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#1e40af', margin: '4px 0 2px' }}>
                ८ वटै वडा <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#2563eb' }}>(१००%)</span>
              </div>
            </div>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)' }}>
              <Bell size={26} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.75rem', alignItems: 'center' }}>
            <span className="agri-badge agri-badge-info">पालिका क्षेत्रव्यापी</span>
            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>एसएमएस / PWA सूचना</span>
          </div>
        </div>
      </div>

      {/* Filter Ribbon */}
      <div className="agri-glass-card" style={{ padding: '1rem 1.4rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.85rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {ADVISORY_TYPES.map(t => {
            const isSelected = selectedType === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedType(t.id)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '999px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: isSelected ? '#c2410c' : '#cbd5e1',
                  backgroundColor: isSelected ? '#ffedd5' : '#ffffff',
                  color: isSelected ? '#9a3412' : '#475569',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: isSelected ? '0 2px 8px rgba(194, 65, 12, 0.2)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                {t.icon}
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 700, color: '#334155', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={activeOnlyFilter}
              onChange={(e) => setActiveOnlyFilter(e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: '#ea580c' }}
            />
            सक्रिय मात्र (Active Only)
          </label>

          <div style={{ position: 'relative', width: '230px' }}>
            <Search size={16} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="सल्लाह वा किट खोज्नुहोस्..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.45rem 0.85rem 0.45rem 2.2rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.84rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>
      </div>

      {/* Advisory Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
        {isLoading ? (
          <div className="agri-glass-card" style={{ padding: '3.5rem 1rem', textAlign: 'center', color: '#64748b' }}>
            सूचनाहरू लोड हुँदैछ...
          </div>
        ) : filteredAdvisories.length === 0 ? (
          <div className="agri-glass-card" style={{ padding: '4rem 1rem', textAlign: 'center', color: '#64748b' }}>
            <CloudLightning size={42} style={{ margin: '0 auto 0.75rem', opacity: 0.35 }} />
            <p style={{ margin: 0, fontWeight: 800, fontSize: '1.05rem', color: '#334155' }}>कुनै सल्लाह वा अलर्ट फेला परेन।</p>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '4px 0 1rem' }}>नयाँ मौसम वा रोगकिरा सम्बन्धी पूर्वचेतावनी जारी गर्नुहोस्।</p>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="gov-btn gov-btn-primary"
              style={{ background: '#ea580c', borderColor: '#ea580c', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800 }}
            >
              <Plus size={16} /> नयाँ सल्लाह जारी गर्नुहोस्
            </button>
          </div>
        ) : (
          filteredAdvisories.map((advisory) => {
            const isActive = !advisory.validUntil || new Date(advisory.validUntil) >= new Date();
            const sev = getSeverityStyle(advisory.advisoryType);
            const isHighAlert = advisory.advisoryType === 'pest_control' || advisory.advisoryType === 'weather';
            return (
              <div
                key={advisory.id}
                className="agri-glass-card"
                style={{
                  padding: '1.4rem 1.65rem',
                  borderLeft: sev.borderLeft,
                  opacity: isActive ? 1 : 0.72,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                  boxShadow: isHighAlert ? '0 10px 25px -5px rgba(239, 68, 68, 0.12)' : undefined,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                      {getIconForType(advisory.advisoryType)}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', flexWrap: 'wrap' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 900, margin: 0, color: '#0f172a' }}>
                          {advisory.title}
                        </h3>
                        <span style={{ fontSize: '0.74rem', fontWeight: 800, padding: '3px 10px', borderRadius: '999px', backgroundColor: sev.badgeBg, color: sev.badgeColor, border: '1px solid rgba(0,0,0,0.05)' }}>
                          {isHighAlert && <span className="agri-pulse-dot danger" style={{ width: '6px', height: '6px', display: 'inline-block', marginRight: '5px' }}></span>}
                          {sev.label}
                        </span>
                        <span style={{ fontSize: '0.74rem', fontWeight: 600, padding: '3px 10px', borderRadius: '999px', backgroundColor: '#f1f5f9', color: '#475569' }}>
                          {getTypeLabel(advisory.advisoryType)}
                        </span>
                        {!isActive && (
                          <span style={{ fontSize: '0.74rem', fontWeight: 800, padding: '3px 10px', borderRadius: '999px', backgroundColor: '#fee2e2', color: '#b91c1c' }}>
                            म्याद सकिएको (Expired)
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '0.45rem', marginTop: '0.45rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        {advisory.targetCategory && (
                          <span style={{ fontSize: '0.74rem', fontWeight: 800, padding: '2px 8px', borderRadius: '6px', backgroundColor: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' }}>
                            🌾 {advisory.targetCategory}
                          </span>
                        )}
                        {advisory.targetZone && (
                          <span style={{ fontSize: '0.74rem', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}>
                            📍 {advisory.targetZone}
                          </span>
                        )}
                        {advisory.smsStatus && (
                          <span style={{ fontSize: '0.74rem', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', backgroundColor: '#fef3c7', color: '#b45309', border: '1px solid #fde68a' }}>
                            📲 {advisory.smsStatus}
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '1.2rem', marginTop: '0.45rem', fontSize: '0.8rem', color: '#64748b', flexWrap: 'wrap' }}>
                        <span>जारी मिति: <strong>{advisory.issuedDate ? new Date(advisory.issuedDate).toLocaleDateString('ne-NP') : 'हालसालै'}</strong></span>
                        {advisory.validUntil && <span>वैध मिति: <strong style={{ color: '#c2410c' }}>{new Date(advisory.validUntil).toLocaleDateString('ne-NP')}</strong> सम्म</span>}
                        <span>जिम्मेवार अधिकृत: <strong>{advisory.assignedOfficer || 'कृषि प्राविधिक शाखा'}</strong> {advisory.officerPhone ? `(${advisory.officerPhone})` : ''}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button
                      type="button"
                      onClick={() => setPreviewAdvisory(advisory)}
                      className="gov-btn gov-btn-outline"
                      style={{ padding: '6px 12px', fontSize: '0.82rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '8px' }}
                    >
                      <Smartphone size={16} className="text-orange-600" /> किसान एप प्रिभ्यु
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteCandidateId(advisory.id!)}
                      className="gov-btn gov-btn-outline"
                      style={{ padding: '6px 10px', color: '#dc2626', borderColor: '#fecaca', backgroundColor: '#fef2f2', borderRadius: '8px' }}
                      title="सूचना हटाउनुहोस्"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Content Box */}
                <div style={{ backgroundColor: '#f8fafc', padding: '1.15rem 1.4rem', borderRadius: '12px', fontSize: '0.92rem', color: '#1e293b', lineHeight: 1.75, whiteSpace: 'pre-wrap', border: '1px solid #e2e8f0', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.02)' }}>
                  {advisory.content}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL 1: Add New Advisory */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div className="agri-glass-card" style={{ maxWidth: '620px', width: '100%', padding: '2rem', boxShadow: '0 25px 60px rgba(0,0,0,0.3)', backgroundColor: '#ffffff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#ffedd5', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CloudLightning size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 900, margin: 0, color: '#0f172a' }}>
                    नयाँ कृषि-मौसम सल्लाह जारी गर्नुहोस्
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '2px 0 0' }}>
                    प्रकाशित गर्नासाथ किसान मोबाइल एप (PWA) तथा एसएमएसमा तत्काल प्रत्यक्ष प्रसारण हुनेछ
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '0.4rem', color: '#334155' }}>सल्लाह / सूचनाको मुख्य शीर्षक</label>
                <input
                  type="text"
                  required
                  placeholder="जस्तै: लेकाली भेगमा असिना र भारी तुसारोको चेतावनी (वडा नं १ देखि ४)"
                  value={newAdvisory.title || ''}
                  onChange={e => setNewAdvisory({ ...newAdvisory, title: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <div className="agri-grid-2">
                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '0.4rem', color: '#334155' }}>सल्लाहको प्रकार (Category)</label>
                  <select
                    value={newAdvisory.advisoryType || 'weather'}
                    onChange={e => setNewAdvisory({ ...newAdvisory, advisoryType: e.target.value as any })}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  >
                    <option value="weather">मौसम चेतावनी (Weather Alert)</option>
                    <option value="pest_control">रोगकिरा नियन्त्रण (Pest Control)</option>
                    <option value="crop_management">बाली व्यवस्थापन (Crop Care)</option>
                    <option value="livestock_health">पशु स्वास्थ्य (Livestock Health)</option>
                    <option value="general">सामान्य सूचना (General Notice)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '0.4rem', color: '#334155' }}>वैध म्याद मिति (Valid Until)</label>
                  <input
                    type="date"
                    value={newAdvisory.validUntil || ''}
                    onChange={e => setNewAdvisory({ ...newAdvisory, validUntil: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div className="agri-grid-2">
                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '0.4rem', color: '#334155' }}>लक्षित बाली / पशुपन्छी (Target Category)</label>
                  <input
                    type="text"
                    placeholder="जस्तै: आलु तथा किवी, रेन्बो ट्राउट, गाई/भैंसी"
                    value={newAdvisory.targetCategory || ''}
                    onChange={e => setNewAdvisory({ ...newAdvisory, targetCategory: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '0.4rem', color: '#334155' }}>लक्षित उचाइ / क्षेत्र (Target Zone)</label>
                  <select
                    value={newAdvisory.targetZone || 'सबै वडा (गाउँपालिका स्तर)'}
                    onChange={e => setNewAdvisory({ ...newAdvisory, targetZone: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  >
                    <option value="सबै वडा (गाउँपालिका स्तर)">सबै वडा (गाउँपालिका स्तर)</option>
                    <option value="उच्च हिमाली भेग (२००० मिटर माथि - वडा १, २)">उच्च हिमाली भेग (२००० मिटर माथि - वडा १, २)</option>
                    <option value="मध्य पहाडी भेग (१०००-२००० मिटर - वडा ३, ४, ५)">मध्य पहाडी भेग (१०००-२००० मिटर - वडा ३, ४, ५)</option>
                    <option value="बेसी तथा तटीय भेग (वडा ६, ७, ८)">बेसी तथा तटीय भेग (वडा ६, ७, ८)</option>
                  </select>
                </div>
              </div>

              <div className="agri-grid-3">
                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '0.4rem', color: '#334155' }}>जिम्मेवार प्राविधिक अधिकृत</label>
                  <input
                    type="text"
                    placeholder="जस्तै: रामेश्वर थापा (जेटीए)"
                    value={newAdvisory.assignedOfficer || ''}
                    onChange={e => setNewAdvisory({ ...newAdvisory, assignedOfficer: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '0.4rem', color: '#334155' }}>सम्पर्क मोबाइल नं.</label>
                  <input
                    type="text"
                    placeholder="९८xxxxxxxx"
                    value={newAdvisory.officerPhone || ''}
                    onChange={e => setNewAdvisory({ ...newAdvisory, officerPhone: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '0.4rem', color: '#334155' }}>बल्क एसएमएस (Bulk SMS)</label>
                  <select
                    value={newAdvisory.smsStatus || 'बल्क एसएमएस तयारी (Ready)'}
                    onChange={e => setNewAdvisory({ ...newAdvisory, smsStatus: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  >
                    <option value="बल्क एसएमएस तयारी (Ready)">तयारी अवस्थामा (Ready)</option>
                    <option value="सबै दर्ता कृषकलाई पठाइयो">सबै दर्ता कृषकलाई पठाइयो (Sent)</option>
                    <option value="एप तथा पोर्टल सूचना मात्र">एप तथा पोर्टल सूचना मात्र</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '0.4rem', color: '#334155' }}>विस्तृत प्राविधिक निर्देशन तथा रोकथाम उपायहरू (Recommendations)</label>
                <textarea
                  required
                  rows={6}
                  placeholder="किसानहरूले तत्काल चाल्नुपर्ने सावधानी, औषधि छर्कने विधि तथा प्राविधिक उपायहरू बुँदागत रूपमा प्रविष्टि गर्नुहोस्..."
                  value={newAdvisory.content || ''}
                  onChange={e => setNewAdvisory({ ...newAdvisory, content: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', lineHeight: 1.65 }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="gov-btn gov-btn-outline"
                >
                  रद्द
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="gov-btn gov-btn-primary"
                  style={{ background: '#ea580c', borderColor: '#ea580c', fontWeight: 800 }}
                >
                  {createMutation.isPending ? 'प्रकाशन हुँदैछ...' : 'सल्लाह प्रकाशित गर्नुहोस्'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Delete Confirmation Modal */}
      {deleteCandidateId && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div className="agri-glass-card" style={{ maxWidth: '440px', width: '100%', padding: '2rem', boxShadow: '0 25px 60px rgba(0,0,0,0.3)', backgroundColor: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.85rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertTriangle size={22} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, margin: 0, color: '#991b1b' }}>
                सूचना हटाउने पुष्टि
              </h3>
            </div>
            <p style={{ fontSize: '0.9rem', color: '#475569', margin: 0, lineHeight: 1.6 }}>
              के तपाईं यो सल्लाह/अलर्ट मेटाउन निश्चित हुनुहुन्छ? यो किसान मोबाइल एप (PWA) बाट पनि तुरुन्त हट्नेछ।
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem', marginTop: '1.75rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
              <button
                type="button"
                onClick={() => setDeleteCandidateId(null)}
                className="gov-btn gov-btn-outline"
              >
                रद्द
              </button>
              <button
                type="button"
                onClick={() => deleteMutation.mutate(deleteCandidateId)}
                disabled={deleteMutation.isPending}
                className="gov-btn gov-btn-primary"
                style={{ backgroundColor: '#dc2626', borderColor: '#dc2626', fontWeight: 800 }}
              >
                {deleteMutation.isPending ? 'हटाउँदै...' : 'हो, मेटाउनुहोस्'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Realistic 3D Smartphone Mobile PWA Preview Modal */}
      {previewAdvisory && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div className="agri-smartphone-frame">
            {/* Dynamic Island / Notch */}
            <div className="agri-smartphone-notch">
              <div className="agri-smartphone-camera"></div>
              <div style={{ width: '40px', height: '4px', background: '#1e293b', borderRadius: '999px' }}></div>
            </div>

            {/* Mobile Screen */}
            <div className="agri-smartphone-screen">
              {/* Status Bar */}
              <div className="agri-smartphone-statusbar">
                <span style={{ fontWeight: 800 }}>१०:४५ AM</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 800 }}>5G</span>
                  <Wifi size={13} />
                  <Battery size={13} />
                </div>
              </div>

              {/* PWA App Body */}
              <div style={{ padding: '1rem 1.15rem', display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '22px', height: '22px', borderRadius: '6px', background: '#ea580c', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 900 }}>
                      P5
                    </div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 900, color: '#0f4c81' }}>नागरिक सेवा एप (PWA)</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPreviewAdvisory(null)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Simulated Push Notification Banner */}
                <div style={{ padding: '0.7rem 0.85rem', borderRadius: '12px', backgroundColor: '#fff7ed', border: '1px solid #fed7aa', marginBottom: '0.85rem', display: 'flex', alignItems: 'flex-start', gap: '0.55rem', boxShadow: '0 4px 12px rgba(234, 88, 12, 0.1)' }}>
                  <Bell size={17} className="text-orange-600" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#9a3412' }}>कृषि पूर्वचेतावनी अलर्ट</span>
                      <span style={{ fontSize: '0.62rem', color: '#9a3412', opacity: 0.8 }}>भर्खरै</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#431407', marginTop: '2px' }}>
                      {previewAdvisory.title}
                    </div>
                  </div>
                </div>

                {/* In-app Advisory Card */}
                <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '1.1rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                    {getIconForType(previewAdvisory.advisoryType)}
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: '6px', backgroundColor: '#ecfdf5', color: '#065f46' }}>
                      {getTypeLabel(previewAdvisory.advisoryType)}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '1rem', fontWeight: 900, margin: '0 0 0.5rem', color: '#0f172a', lineHeight: 1.4 }}>
                    {previewAdvisory.title}
                  </h4>

                  {/* Audio Listen Pill */}
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '999px', background: '#f1f5f9', fontSize: '0.72rem', fontWeight: 700, color: '#334155', marginBottom: '0.75rem', cursor: 'pointer' }}>
                    <Volume2 size={13} className="text-orange-600" />
                    <span>🔊 अडियो सन्देश सुन्नुहोस्</span>
                  </div>

                  <p style={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.7, whiteSpace: 'pre-wrap', margin: 0, backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                    {previewAdvisory.content}
                  </p>

                  <div style={{ marginTop: '0.85rem', paddingTop: '0.6rem', borderTop: '1px dashed #e2e8f0', fontSize: '0.68rem', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
                    <span>पाँचपोखरी कृषि शाखा</span>
                    <span>वैध: <strong>{previewAdvisory.validUntil || 'अनिश्चित'}</strong> सम्म</span>
                  </div>
                </div>
              </div>

              {/* Smartphone Home Indicator Bar */}
              <div style={{ padding: '0.65rem', textAlign: 'center', background: '#ffffff', borderTop: '1px solid #f1f5f9' }}>
                <div style={{ width: '120px', height: '4px', background: '#cbd5e1', borderRadius: '999px', margin: '0 auto' }}></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
