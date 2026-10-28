import React, { useState, useEffect, useMemo } from 'react';
import {
  HeartHandshake,
  Trophy,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Award,
  Users,
  ShieldCheck,
  Activity,
  Layers,
  Sparkles,
  Baby,
  Calendar,
  Medal,
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useTenant } from '../../context/TenantContext';
import { useFiscalYear } from '../../context/FiscalYearContext';

interface CflgPillar {
  name: string;
  totalIndicators: number;
  achievedCount: number;
  description: string;
}

const CFLG_PILLARS: CflgPillar[] = [
  {
    name: '१. बाल बचाउ (Child Survival)',
    totalIndicators: 14,
    achievedCount: 13,
    description: 'पूर्ण खोप सुनिश्चितता, संस्थागत सुत्केरी दर, बाल कुपोषण रोकथाम र सुरक्षित पिउने पानी पहुँच।',
  },
  {
    name: '२. बाल संरक्षण (Child Protection)',
    totalIndicators: 10,
    achievedCount: 9,
    description: 'बालविवाह अन्त्य, बालश्रम निषेध, बाल हिंसा रोकथाम, र जन्मदर्ता शतप्रतिशत प्रमाणीकरण।',
  },
  {
    name: '३. बाल विकास (Child Development)',
    totalIndicators: 6,
    achievedCount: 5,
    description: 'प्रारम्भिक बाल विकास (ECED) कक्षा पहुँच, आधारभूत तहमा भर्ना र विद्यालय छाड्ने दर न्यूनीकरण।',
  },
  {
    name: '४. बाल सहभागिता (Child Participation)',
    totalIndicators: 6,
    achievedCount: 6,
    description: 'विद्यालय तथा वडास्तरीय बाल क्लब गठन, योजना तर्जुमा प्रक्रियामा बालबालिकाको सक्रिय सहभागिता।',
  },
  {
    name: '५. संस्थागत विकास (Institutional Setup)',
    totalIndicators: 15,
    achievedCount: 13,
    description: 'बाल कल्याण समिति, बालकोष स्थापना, बालमैत्री बजेट विनियोजन र आचारसंहिता कार्यान्वयन।',
  },
];

interface SportsFacility {
  id: string;
  name: string;
  facilityType: 'खेलमैदान' | 'कभर्ड हल' | 'भलिबल कोर्ट' | 'ब्याडमिन्टन कोर्ट' | 'फुटसल';
  ward: number;
  location: string;
  capacitySpectators: number;
  condition: 'राम्रो' | 'मर्मत आवश्यक' | 'निर्माणाधीन';
}

const INITIAL_FACILITIES: SportsFacility[] = [
  {
    id: 'sp-1',
    name: 'थाङपालधाप रंगशाला तथा खेलमैदान',
    facilityType: 'खेलमैदान',
    ward: 1,
    location: 'थाङपाल बजार नजिक',
    capacitySpectators: 1500,
    condition: 'राम्रो',
  },
  {
    id: 'sp-2',
    name: 'मानेखर्क बहुउद्देश्यीय कभर्ड हल',
    facilityType: 'कभर्ड हल',
    ward: 3,
    location: 'मानेखर्क',
    capacitySpectators: 500,
    condition: 'राम्रो',
  },
  {
    id: 'sp-3',
    name: 'भोताङ वडास्तरीय भलिबल खेलमैदान',
    facilityType: 'भलिबल कोर्ट',
    ward: 4,
    location: 'भोताङ मानेचौर',
    capacitySpectators: 300,
    condition: 'मर्मत आवश्यक',
  },
];

export interface CflgSportsPageProps {
  isPublic?: boolean;
}

export const CflgSportsPage: React.FC<CflgSportsPageProps> = ({ isPublic: propIsPublic }) => {
  const location = useLocation();
  const isPublic = propIsPublic !== undefined ? propIsPublic : !location.pathname.startsWith('/app');
  const { tenantId, settings } = useTenant();
  const { activeFiscalYear } = useFiscalYear();

  const [activeTab, setActiveTab] = useState<'cflg' | 'wards' | 'sports' | 'clubs'>('cflg');
  const [facilities, setFacilities] = useState<SportsFacility[]>(() => {
    const saved = localStorage.getItem(`sports_facilities_${tenantId}`);
    return saved ? JSON.parse(saved) : INITIAL_FACILITIES;
  });

  const [isAddFacilityModalOpen, setIsAddFacilityModalOpen] = useState(false);
  const [facForm, setFacForm] = useState({
    name: '',
    type: 'खेलमैदान' as SportsFacility['facilityType'],
    ward: '1',
    location: '',
    capacity: '500',
  });

  useEffect(() => {
    localStorage.setItem(`sports_facilities_${tenantId}`, JSON.stringify(facilities));
  }, [facilities, tenantId]);

  const handleAddFacility = (e: React.FormEvent) => {
    e.preventDefault();
    if (!facForm.name) return;

    const newFac: SportsFacility = {
      id: `sp-${Date.now()}`,
      name: facForm.name,
      facilityType: facForm.type,
      ward: Number(facForm.ward),
      location: facForm.location || 'वडा केन्द्र',
      capacitySpectators: Number(facForm.capacity) || 100,
      condition: 'राम्रो',
    };

    setFacilities([newFac, ...facilities]);
    setIsAddFacilityModalOpen(false);
  };

  // Overall CFLG calculations
  const totalIndicators = CFLG_PILLARS.reduce((acc, p) => acc + p.totalIndicators, 0);
  const totalAchieved = CFLG_PILLARS.reduce((acc, p) => acc + p.achievedCount, 0);
  const cflgProgressPct = ((totalAchieved / totalIndicators) * 100).toFixed(1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', padding: '1rem' }}>
      {/* ── HEADER BANNER ── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
          borderRadius: '18px',
          padding: '1.75rem',
          color: '#ffffff',
          boxShadow: '0 8px 24px rgba(124, 58, 237, 0.22)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(8px)',
            }}
          >
            <Baby size={28} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>
                बालमैत्री स्थानीय शासन (CFLG) तथा युवा-खेलकुद
              </h1>
              <span
                style={{
                  backgroundColor: 'rgba(255,255,255,0.25)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '999px',
                }}
              >
                राष्ट्रिय ५१ सूचक अभियान
              </span>
            </div>
            <p style={{ margin: '4px 0 0', opacity: 0.9, fontSize: '0.85rem' }}>
              {settings?.palika_name || 'गाउँ/नगर कार्यपालिका'} — बालमैत्री स्थानीय शासन (CFLG) घोषणा तयारी, बाल अधिकार र खेलकुद पूर्वाधार तथा खेलाडी अभिलेख
            </p>
          </div>
        </div>

        {!isPublic ? (
          <button
            onClick={() => setIsAddFacilityModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#ffffff',
              color: '#7c3aed',
              border: 'none',
              borderRadius: '12px',
              padding: '10px 18px',
              fontWeight: 800,
              fontSize: '0.88rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
            }}
          >
            <Plus size={18} />
            <span>नयाँ खेलकुद पूर्वाधार दर्ता</span>
          </button>
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.35)',
              padding: '8px 16px',
              borderRadius: '12px',
              fontSize: '0.82rem',
              fontWeight: 700,
              color: '#ffffff',
            }}
          >
            <Trophy size={16} />
            <span>बालमैत्री स्थानीय शासन (CFLG) तथा खेलकुद पोर्टल</span>
          </div>
        )}
      </div>

      {/* ── KPI METRICS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem' }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '1.2rem', border: '1px solid #e2e8f0', borderLeft: '4px solid #7c3aed' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>CFLG ५१ राष्ट्रिय सूचक प्रगति</div>
          <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#6d28d9', marginTop: '4px' }}>{cflgProgressPct}%</div>
          <div style={{ fontSize: '0.75rem', color: '#7c3aed', marginTop: '2px', fontWeight: 600 }}>
            {totalAchieved} / {totalIndicators} सूचक पूर्ण
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '1.2rem', border: '1px solid #e2e8f0', borderLeft: '4px solid #16a34a' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>बालमैत्री घोषित वडाहरू</div>
          <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#15803d', marginTop: '4px' }}>३ / ८ वडा</div>
          <div style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '2px', fontWeight: 600 }}>
            बाँकी ५ वटा वडा अन्तिम चरणमा
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '1.2rem', border: '1px solid #e2e8f0', borderLeft: '4px solid #0284c7' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>खेलकुद पूर्वाधार संख्या</div>
          <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#0369a1', marginTop: '4px' }}>{facilities.length} स्थान</div>
          <div style={{ fontSize: '0.75rem', color: '#0284c7', marginTop: '2px', fontWeight: 600 }}>
            खेलमैदान, कभर्ड हल र कोर्टहरू
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '1.2rem', border: '1px solid #e2e8f0', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>दर्ता भएका खेल क्लब/खेलाडी</div>
          <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#d97706', marginTop: '4px' }}>१४ क्लब / २८०+</div>
          <div style={{ fontSize: '0.75rem', color: '#f59e0b', marginTop: '2px', fontWeight: 600 }}>
            राष्ट्रपति रनिङ शिल्ड सहभागी
          </div>
        </div>
      </div>

      {/* ── TABS NAVIGATION ── */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #e2e8f0', paddingBottom: '2px' }}>
        {[
          { key: 'cflg', label: 'CFLG ५ स्तम्भ तथा ५१ सूचक', icon: <Baby size={16} /> },
          { key: 'wards', label: 'वडागत बालमैत्री प्रगति स्थिति', icon: <Layers size={16} /> },
          { key: 'sports', label: 'खेलकुद पूर्वाधार (खेलमैदान/हल)', icon: <Trophy size={16} /> },
          { key: 'clubs', label: 'खेलकुद क्लब तथा खेलाडी प्रतिभा', icon: <Medal size={16} /> },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key as any)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 18px',
              borderRadius: '10px 10px 0 0',
              border: 'none',
              backgroundColor: activeTab === t.key ? '#ffffff' : 'transparent',
              color: activeTab === t.key ? '#7c3aed' : '#64748b',
              fontWeight: 800,
              fontSize: '0.88rem',
              cursor: 'pointer',
              borderBottom: activeTab === t.key ? '3px solid #7c3aed' : '3px solid transparent',
              transition: 'all 0.15s ease',
            }}
          >
            {t.icon}
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* ── TAB 1: CFLG PILLARS ── */}
      {activeTab === 'cflg' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
          {CFLG_PILLARS.map((p, idx) => {
            const pct = Math.round((p.achievedCount / p.totalIndicators) * 100);
            return (
              <div key={idx} style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>{p.name}</h4>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#7c3aed' }}>{pct}%</span>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5, margin: '0 0 12px' }}>{p.description}</p>
                <div style={{ height: '8px', backgroundColor: '#e2e8f0', borderRadius: '999px', overflow: 'hidden', marginBottom: '6px' }}>
                  <div style={{ width: `${pct}%`, height: '100%', backgroundColor: '#7c3aed' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                  <span>हासिल भएका सूचकहरू</span>
                  <span>{p.achievedCount} / {p.totalIndicators} वटा</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── TAB 2: WARD-WISE CFLG ── */}
      {activeTab === 'wards' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
          <h4 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 800 }}>वडागत बालमैत्री स्थानीय शासन घोषणा स्थिति</h4>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                <th style={{ padding: '10px 12px' }}>वडा नं.</th>
                <th style={{ padding: '10px 12px' }}>वडा केन्द्र / टोल</th>
                <th style={{ padding: '10px 12px' }}>बाल क्लब संख्या</th>
                <th style={{ padding: '10px 12px' }}>सूचक उपलब्धि</th>
                <th style={{ padding: '10px 12px' }}>घोषणा स्थिति</th>
              </tr>
            </thead>
            <tbody>
              {[
                { ward: 1, loc: 'थाङपालधाप', clubs: 4, score: '४९/५१ (९६%)', status: 'बालमैत्री घोषित' },
                { ward: 2, loc: 'गुन्सा', clubs: 3, score: '४६/५१ (९०%)', status: 'तयारी अन्तिम चरण' },
                { ward: 3, loc: 'मानेखर्क', clubs: 5, score: '५०/५१ (९८%)', status: 'बालमैत्री घोषित' },
                { ward: 4, loc: 'भोताङ', clubs: 4, score: '४८/५१ (९४%)', status: 'बालमैत्री घोषित' },
                { ward: 5, loc: 'बरुवा', clubs: 3, score: '४४/५१ (८६%)', status: 'तयारी अन्तिम चरण' },
              ].map((w) => (
                <tr key={w.ward} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px', fontWeight: 800 }}>वडा नं. {w.ward}</td>
                  <td style={{ padding: '12px' }}>{w.loc}</td>
                  <td style={{ padding: '12px' }}>{w.clubs} वटा सक्रिय</td>
                  <td style={{ padding: '12px', fontWeight: 700, color: '#7c3aed' }}>{w.score}</td>
                  <td style={{ padding: '12px' }}>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '999px',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        backgroundColor: w.status === 'बालमैत्री घोषित' ? '#dcfce7' : '#eff6ff',
                        color: w.status === 'बालमैत्री घोषित' ? '#166534' : '#1d4ed8',
                      }}
                    >
                      ● {w.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── TAB 3: SPORTS FACILITIES ── */}
      {activeTab === 'sports' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          {facilities.map((fac) => (
            <div key={fac.id} style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>{fac.name}</h4>
                <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '6px', backgroundColor: '#f3e8ff', color: '#6d28d9', fontWeight: 700 }}>
                  वडा नं. {fac.ward}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '10px', backgroundColor: '#f8fafc', borderRadius: '10px', fontSize: '0.8rem' }}>
                <div>
                  <span style={{ color: '#64748b' }}>पूर्वाधार प्रकार:</span>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{fac.facilityType}</div>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>दर्शक क्षमता:</span>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{fac.capacitySpectators} जना</div>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>स्थान:</span>
                  <div style={{ fontWeight: 600 }}>{fac.location}</div>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>अवस्था:</span>
                  <div style={{ fontWeight: 800, color: '#15803d' }}>{fac.condition}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── TAB 4: SPORTS CLUBS ── */}
      {activeTab === 'clubs' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
          <h4 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 800 }}>दर्ता भएका युवा तथा खेलकुद क्लबहरू</h4>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                <th style={{ padding: '10px 12px' }}>क्लबको नाम</th>
                <th style={{ padding: '10px 12px' }}>वडा</th>
                <th style={{ padding: '10px 12px' }}>मुख्य खेल विधा</th>
                <th style={{ padding: '10px 12px' }}>अध्यक्ष / सम्पर्क</th>
                <th style={{ padding: '10px 12px' }}>दर्ता स्थिति</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '12px', fontWeight: 700 }}>थाङपालधाप युथ क्लब</td>
                <td style={{ padding: '12px' }}>वडा १</td>
                <td style={{ padding: '12px' }}>फुटबल तथा भलिबल</td>
                <td style={{ padding: '12px' }}>सुमन श्रेष्ठ (९८५११२२३३४)</td>
                <td style={{ padding: '12px', color: '#15803d', fontWeight: 700 }}>नवीकृत (चालू)</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '12px', fontWeight: 700 }}>याङ्ग्री हिमाल स्पोर्ट्स एकेडेमी</td>
                <td style={{ padding: '12px' }}>वडा ३</td>
                <td style={{ padding: '12px' }}>एथलेटिक्स तथा ब्याडमिन्टन</td>
                <td style={{ padding: '12px' }}>पेम्बा तामाङ (९८४१००२२३३)</td>
                <td style={{ padding: '12px', color: '#15803d', fontWeight: 700 }}>नवीकृत (चालू)</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* ── ADD FACILITY MODAL ── */}
      {isAddFacilityModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
        >
          <div style={{ backgroundColor: '#ffffff', borderRadius: '18px', width: '100%', maxWidth: '500px', padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '1.2rem', fontWeight: 800 }}>नयाँ खेलकुद पूर्वाधार दर्ता</h3>
            <form onSubmit={handleAddFacility} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>पूर्वाधारको नाम *</label>
                <input
                  type="text"
                  required
                  placeholder="उदा. मानेखर्क कभर्ड हल"
                  value={facForm.name}
                  onChange={(e) => setFacForm({ ...facForm, name: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>पूर्वाधार प्रकार</label>
                  <select
                    value={facForm.type}
                    onChange={(e) => setFacForm({ ...facForm, type: e.target.value as any })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="खेलमैदान">खेलमैदान</option>
                    <option value="कभर्ड हल">कभर्ड हल</option>
                    <option value="भलिबल कोर्ट">भलिबल कोर्ट</option>
                    <option value="ब्याडमिन्टन कोर्ट">ब्याडमिन्टन कोर्ट</option>
                    <option value="फुटसल">फुटसल</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>वडा नं.</label>
                  <select
                    value={facForm.ward}
                    onChange={(e) => setFacForm({ ...facForm, ward: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
                      <option key={w} value={w}>वडा नं. {w}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>स्थान</label>
                  <input
                    type="text"
                    placeholder="टोल/बजार"
                    value={facForm.location}
                    onChange={(e) => setFacForm({ ...facForm, location: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>दर्शक क्षमता</label>
                  <input
                    type="number"
                    value={facForm.capacity}
                    onChange={(e) => setFacForm({ ...facForm, capacity: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsAddFacilityModalOpen(false)}
                  style={{ padding: '9px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontWeight: 700, cursor: 'pointer' }}
                >
                  रद्द
                </button>
                <button
                  type="submit"
                  style={{ padding: '9px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#7c3aed', color: '#ffffff', fontWeight: 800, cursor: 'pointer' }}
                >
                  सुरक्षित गर्नुहोस्
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
