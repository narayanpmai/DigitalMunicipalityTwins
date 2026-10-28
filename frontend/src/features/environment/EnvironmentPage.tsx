import React, { useState, useEffect, useMemo } from 'react';
import {
  Trees,
  Mountain,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  FileText,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  Activity,
  Layers,
  MapPin,
  Truck,
  Droplet,
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useTenant } from '../../context/TenantContext';
import { useFiscalYear } from '../../context/FiscalYearContext';

interface RiverMiningSite {
  id: string;
  siteName: string; // खानी/घाटगद्दी स्थल
  riverName: string; // नदी/खोला
  ward: number; // वडा नं.
  contractorName: string; // ठेकेदार/कम्पनी नाम
  approvedVolumeCuM: number; // स्वीकृत परिमाण (घनमिटर)
  extractedVolumeCuM: number; // उत्खनन भइसकेको परिमाण
  contractAmountNpr: number; // सम्झौता रकम (रू.)
  paidAmountNpr: number; // दाखिला भएको रकम
  ieeStatus: 'स्वीकृत' | 'नवीकरण प्रक्रियामा' | 'सम्पन्न';
  status: 'सञ्चालन अनुमति' | 'निलम्बित' | 'अवधि समाप्त';
}

const INITIAL_SITES: RiverMiningSite[] = [
  {
    id: 'mine-1',
    siteName: 'याङ्ग्री दोभान बालुवा तथा गिट्टी संकलन केन्द्र',
    riverName: 'याङ्ग्री खोला',
    ward: 2,
    contractorName: 'पाँचपोखरी कन्स्ट्रक्सन एण्ड सप्लायर्स प्रा.लि.',
    approvedVolumeCuM: 45000,
    extractedVolumeCuM: 28000,
    contractAmountNpr: 6800000,
    paidAmountNpr: 4500000,
    ieeStatus: 'स्वीकृत',
    status: 'सञ्चालन अनुमति',
  },
  {
    id: 'mine-2',
    siteName: 'इन्द्रावती बगर ढुङ्गा तथा रोडा उत्खनन घाट',
    riverName: 'इन्द्रावती नदी',
    ward: 1,
    contractorName: 'सिन्धु क्रसर एण्ड माइनिङ उद्योग',
    approvedVolumeCuM: 60000,
    extractedVolumeCuM: 42000,
    contractAmountNpr: 9200000,
    paidAmountNpr: 6000000,
    ieeStatus: 'स्वीकृत',
    status: 'सञ्चालन अनुमति',
  },
  {
    id: 'mine-3',
    siteName: 'छहरे खोला बालुवा डिपो तथा घाटगद्दी',
    riverName: 'छहरे खोला',
    ward: 4,
    contractorName: 'थाङपाल एग्रिगेट सप्लायर्स',
    approvedVolumeCuM: 20000,
    extractedVolumeCuM: 8000,
    contractAmountNpr: 2800000,
    paidAmountNpr: 2800000,
    ieeStatus: 'नवीकरण प्रक्रियामा',
    status: 'सञ्चालन अनुमति',
  },
];

interface CommunityForest {
  id: string;
  name: string;
  ward: number;
  areaHectares: number;
  userHouseholds: number;
  chairperson: string;
  contact: string;
  handoverYearBs: string;
  mainSpecies: string;
}

const INITIAL_FORESTS: CommunityForest[] = [
  {
    id: 'cf-1',
    name: 'मानेखर्क देउराली सामुदायिक वन उपभोक्ता समूह',
    ward: 3,
    areaHectares: 185.5,
    userHouseholds: 240,
    chairperson: 'सोम बहादुर तामाङ',
    contact: '९८४१२२३३४४',
    handoverYearBs: '२०५८',
    mainSpecies: 'उत्तिस, खस्रु, सल्ला',
  },
  {
    id: 'cf-2',
    name: 'थाङपालकोट रानीवन सामुदायिक वन समूह',
    ward: 6,
    areaHectares: 312.0,
    userHouseholds: 380,
    chairperson: 'मान बहादुर खड्का',
    contact: '९८५११२२३३४',
    handoverYearBs: '२०५४',
    mainSpecies: 'लालीगुराँस, बाँझ, चिलाउने',
  },
];

export interface EnvironmentPageProps {
  isPublic?: boolean;
}

export const EnvironmentPage: React.FC<EnvironmentPageProps> = ({ isPublic: propIsPublic }) => {
  const location = useLocation();
  const isPublic = propIsPublic !== undefined ? propIsPublic : !location.pathname.startsWith('/app');
  const { tenantId, settings } = useTenant();
  const { activeFiscalYear } = useFiscalYear();

  const [activeTab, setActiveTab] = useState<'mining' | 'iee' | 'forests' | 'watershed'>('mining');
  const [sites, setSites] = useState<RiverMiningSite[]>(() => {
    const saved = localStorage.getItem(`env_sites_${tenantId}`);
    return saved ? JSON.parse(saved) : INITIAL_SITES;
  });
  const [forests, setForests] = useState<CommunityForest[]>(() => {
    const saved = localStorage.getItem(`env_forests_${tenantId}`);
    return saved ? JSON.parse(saved) : INITIAL_FORESTS;
  });

  const [isAddSiteModalOpen, setIsAddSiteModalOpen] = useState(false);
  const [siteForm, setSiteForm] = useState({
    siteName: '',
    riverName: '',
    ward: '1',
    contractorName: '',
    approvedVolumeCuM: '30000',
    contractAmountNpr: '4000000',
  });

  useEffect(() => {
    localStorage.setItem(`env_sites_${tenantId}`, JSON.stringify(sites));
  }, [sites, tenantId]);

  useEffect(() => {
    localStorage.setItem(`env_forests_${tenantId}`, JSON.stringify(forests));
  }, [forests, tenantId]);

  const handleAddSite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteForm.siteName) return;

    const newSite: RiverMiningSite = {
      id: `mine-${Date.now()}`,
      siteName: siteForm.siteName,
      riverName: siteForm.riverName || 'स्थानीय खोला',
      ward: Number(siteForm.ward),
      contractorName: siteForm.contractorName || 'इजाजतप्राप्त फर्म',
      approvedVolumeCuM: Number(siteForm.approvedVolumeCuM) || 10000,
      extractedVolumeCuM: 0,
      contractAmountNpr: Number(siteForm.contractAmountNpr) || 1000000,
      paidAmountNpr: 0,
      ieeStatus: 'स्वीकृत',
      status: 'सञ्चालन अनुमति',
    };

    setSites([newSite, ...sites]);
    setIsAddSiteModalOpen(false);
  };

  // KPIs
  const totalApprovedVol = sites.reduce((acc, s) => acc + s.approvedVolumeCuM, 0);
  const totalExtractedVol = sites.reduce((acc, s) => acc + s.extractedVolumeCuM, 0);
  const totalRevenue = sites.reduce((acc, s) => acc + s.contractAmountNpr, 0);
  const collectedRevenue = sites.reduce((acc, s) => acc + s.paidAmountNpr, 0);
  const totalForestArea = forests.reduce((acc, f) => acc + f.areaHectares, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', padding: '1rem' }}>
      {/* ── HEADER BANNER ── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #15803d 0%, #166534 100%)',
          borderRadius: '18px',
          padding: '1.75rem',
          color: '#ffffff',
          boxShadow: '0 8px 24px rgba(21, 128, 61, 0.22)',
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
            <Trees size={28} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>
                वातावरण, वन तथा नदीजन्य पदार्थ/खानी नियमन
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
                संविधान अनुसूची ८ (एकल अधिकार १० र २१)
              </span>
            </div>
            <p style={{ margin: '4px 0 0', opacity: 0.9, fontSize: '0.85rem' }}>
              {settings?.palika_name || 'गाउँ/नगर कार्यपालिका'} — ढुङ्गा-गिट्टी-बालुवा उत्खनन, IEE अनुगमन, सामुदायिक वन तथा जलाधार संरक्षण डिजिटल ट्विन
            </p>
          </div>
        </div>

        {!isPublic ? (
          <button
            onClick={() => setIsAddSiteModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#ffffff',
              color: '#15803d',
              border: 'none',
              borderRadius: '12px',
              padding: '10px 18px',
              fontWeight: 800,
              fontSize: '0.88rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
              transition: 'transform 0.15s ease',
            }}
          >
            <Plus size={18} />
            <span>नयाँ नदीजन्य खानी/घाटगद्दी दर्ता</span>
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
            <Trees size={16} />
            <span>खुला वातावरण तथा खानी पारदर्शिता (Citizen Portal)</span>
          </div>
        )}
      </div>

      {/* ── KPI METRICS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem' }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '1.2rem', border: '1px solid #e2e8f0', borderLeft: '4px solid #16a34a' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>स्वीकृत नदीजन्य खानी स्थल</div>
          <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#15803d', marginTop: '4px' }}>{sites.length} स्थान</div>
          <div style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '2px', fontWeight: 600 }}>
            स्वीकृत परिमाण: {totalApprovedVol.toLocaleString()} घनमि.
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '1.2rem', border: '1px solid #e2e8f0', borderLeft: '4px solid #0284c7' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>वार्षिक ठेक्का तथा रोयल्टी</div>
          <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#0369a1', marginTop: '4px' }}>रू. {(totalRevenue / 100000).toFixed(1)} लाख</div>
          <div style={{ fontSize: '0.75rem', color: '#0284c7', marginTop: '2px', fontWeight: 600 }}>
            दाखिला भएको: रू. {(collectedRevenue / 100000).toFixed(1)} लाख
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '1.2rem', border: '1px solid #e2e8f0', borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>सामुदायिक तथा कबुलियती वन</div>
          <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#6d28d9', marginTop: '4px' }}>{forests.length} समूह</div>
          <div style={{ fontSize: '0.75rem', color: '#8b5cf6', marginTop: '2px', fontWeight: 600 }}>
            कुल क्षेत्रफल: {totalForestArea.toFixed(1)} हेक्टर
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '1.2rem', border: '1px solid #e2e8f0', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>IEE / वातावरणीय अनुगमन</div>
          <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#d97706', marginTop: '4px' }}>१००% स्वीकृत</div>
          <div style={{ fontSize: '0.75rem', color: '#f59e0b', marginTop: '2px', fontWeight: 600 }}>
            मापदण्ड अनुरुप वातावरणीय परीक्षण
          </div>
        </div>
      </div>

      {/* ── TABS NAVIGATION ── */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #e2e8f0', paddingBottom: '2px' }}>
        {[
          { key: 'mining', label: 'नदीजन्य पदार्थ (ढुङ्गा/बालुवा) ठेक्का अनुगमन', icon: <Mountain size={16} /> },
          { key: 'iee', label: 'प्रारम्भिक वातावरणीय परीक्षण (IEE/EIA)', icon: <FileText size={16} /> },
          { key: 'forests', label: 'सामुदायिक तथा कबुलियती वन', icon: <Trees size={16} /> },
          { key: 'watershed', label: 'जलाधार संरक्षण तथा वृक्षारोपण', icon: <Droplet size={16} /> },
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
              color: activeTab === t.key ? '#15803d' : '#64748b',
              fontWeight: 800,
              fontSize: '0.88rem',
              cursor: 'pointer',
              borderBottom: activeTab === t.key ? '3px solid #15803d' : '3px solid transparent',
              transition: 'all 0.15s ease',
            }}
          >
            {t.icon}
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* ── TAB 1: RIVERBED MINING TABLE ── */}
      {activeTab === 'mining' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                <th style={{ padding: '10px 12px' }}>खानी / घाटगद्दी स्थल</th>
                <th style={{ padding: '10px 12px' }}>नदी/खोला</th>
                <th style={{ padding: '10px 12px' }}>वडा</th>
                <th style={{ padding: '10px 12px' }}>ठेकेदार / कम्पनी</th>
                <th style={{ padding: '10px 12px' }}>स्वीकृत परिमाण (घनमि.)</th>
                <th style={{ padding: '10px 12px' }}>उत्खनन भएको</th>
                <th style={{ padding: '10px 12px' }}>सम्झौता रकम (रू.)</th>
                <th style={{ padding: '10px 12px' }}>IEE स्थिति</th>
                <th style={{ padding: '10px 12px' }}>स्थिति</th>
              </tr>
            </thead>
            <tbody>
              {sites.map((s) => (
                <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px', fontWeight: 700, color: '#0f172a' }}>{s.siteName}</td>
                  <td style={{ padding: '12px', color: '#475569' }}>{s.riverName}</td>
                  <td style={{ padding: '12px' }}>वडा {s.ward}</td>
                  <td style={{ padding: '12px', color: '#334155' }}>{s.contractorName}</td>
                  <td style={{ padding: '12px', fontWeight: 700 }}>{s.approvedVolumeCuM.toLocaleString()} m³</td>
                  <td style={{ padding: '12px', color: '#2563eb', fontWeight: 600 }}>{s.extractedVolumeCuM.toLocaleString()} m³</td>
                  <td style={{ padding: '12px', fontWeight: 800, color: '#059669' }}>रू. {s.contractAmountNpr.toLocaleString()}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#dcfce7', color: '#15803d' }}>
                      {s.ieeStatus}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ padding: '4px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 800, backgroundColor: '#dcfce7', color: '#166534' }}>
                      ● {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── TAB 2: IEE/EIA ── */}
      {activeTab === 'iee' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
          <h4 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 800 }}>वातावरणीय प्रभाव परीक्षण (IEE) तथा नियमन प्रतिवेदन</h4>
          <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.6 }}>
            स्थानीय सरकार सञ्चालन ऐन, २०७४ तथा वातावरण संरक्षण ऐन अनुसार नदीजन्य पदार्थ उत्खनन गर्नुपूर्व विस्तृत प्रारम्भिक वातावरणीय परीक्षण (IEE) प्रतिवेदन गाउँ/नगर कार्यपालिकाबाट पारित भएको हुनुपर्दछ।
          </p>
        </div>
      )}

      {/* ── TAB 3: COMMUNITY FORESTS ── */}
      {activeTab === 'forests' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
          {forests.map((f) => (
            <div key={f.id} style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>{f.name}</h4>
                <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '6px', backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: 700 }}>
                  वडा नं. {f.ward}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '10px', backgroundColor: '#f8fafc', borderRadius: '10px', fontSize: '0.8rem' }}>
                <div>
                  <span style={{ color: '#64748b' }}>कुल क्षेत्रफल:</span>
                  <div style={{ fontWeight: 800, color: '#15803d' }}>{f.areaHectares} हेक्टर</div>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>उपभोक्ता घरधुरी:</span>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{f.userHouseholds} घर</div>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>समिति अध्यक्ष:</span>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{f.chairperson}</div>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>सम्पर्क:</span>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{f.contact}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── TAB 4: WATERSHED & PLANTATION ── */}
      {activeTab === 'watershed' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
            <h4 style={{ margin: '0 0 10px', fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>यस आर्थिक वर्षमा वृक्षारोपण</h4>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#15803d' }}>२५,००० बिरुवा</div>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '4px 0' }}>
              पहिरो रोकथाम, मुहान संरक्षण र सडक छेउ सौन्दर्यीकरणका लागि तेजपात, लप्सी, चाँप तथा फलफूलका बिरुवा रोपण।
            </p>
          </div>
        </div>
      )}

      {/* ── ADD SITE MODAL ── */}
      {isAddSiteModalOpen && (
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
          <div style={{ backgroundColor: '#ffffff', borderRadius: '18px', width: '100%', maxWidth: '550px', padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '1.2rem', fontWeight: 800 }}>नयाँ नदीजन्य खानी / घाटगद्दी स्थल दर्ता</h3>
            <form onSubmit={handleAddSite} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>खानी/घाटगद्दी स्थलको नाम *</label>
                <input
                  type="text"
                  required
                  placeholder="उदा. याङ्ग्री दोभान बालुवा संकलन केन्द्र"
                  value={siteForm.siteName}
                  onChange={(e) => setSiteForm({ ...siteForm, siteName: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>नदी / खोलाको नाम</label>
                  <input
                    type="text"
                    placeholder="उदा. इन्द्रावती"
                    value={siteForm.riverName}
                    onChange={(e) => setSiteForm({ ...siteForm, riverName: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>वडा नं.</label>
                  <select
                    value={siteForm.ward}
                    onChange={(e) => setSiteForm({ ...siteForm, ward: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
                      <option key={w} value={w}>वडा नं. {w}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>ठेकेदार / कम्पनीको नाम</label>
                <input
                  type="text"
                  placeholder="कम्पनीको नाम"
                  value={siteForm.contractorName}
                  onChange={(e) => setSiteForm({ ...siteForm, contractorName: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>स्वीकृत परिमाण (घनमि.)</label>
                  <input
                    type="number"
                    value={siteForm.approvedVolumeCuM}
                    onChange={(e) => setSiteForm({ ...siteForm, approvedVolumeCuM: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>सम्झौता रकम (रू.)</label>
                  <input
                    type="number"
                    value={siteForm.contractAmountNpr}
                    onChange={(e) => setSiteForm({ ...siteForm, contractAmountNpr: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsAddSiteModalOpen(false)}
                  style={{ padding: '9px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontWeight: 700, cursor: 'pointer' }}
                >
                  रद्द
                </button>
                <button
                  type="submit"
                  style={{ padding: '9px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#15803d', color: '#ffffff', fontWeight: 800, cursor: 'pointer' }}
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
