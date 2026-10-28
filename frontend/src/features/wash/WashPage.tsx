import React, { useState, useEffect, useMemo } from 'react';
import {
  Droplets,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  MapPin,
  Users,
  ShieldCheck,
  TrendingUp,
  Download,
  Activity,
  Layers,
  FileText,
  DollarSign,
  Droplet,
  Settings2,
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useTenant } from '../../context/TenantContext';
import { useFiscalYear } from '../../context/FiscalYearContext';

interface WashScheme {
  id: string;
  name: string; // योजनाको नाम
  ward: number; // वडा नं.
  sourceType: string; // मुहानको प्रकार (खोला, बोरिङ, स्प्रिङ, लिफ्टिङ)
  capacityLpd: number; // क्षमता (लिटर प्रति दिन)
  householdCount: number; // लाभान्वित घरधुरी
  tapCount: number; // जडान भएका कुल धारा
  completionYear: string; // सम्पन्न आ.व.
  waterQuality: 'उत्कृष्ट' | 'सामान्य' | 'परीक्षण बाँकी' | 'उपचार आवश्यक';
  wucName: string; // उपभोक्ता समिति नाम
  wucChair: string; // समिति अध्यक्ष
  wucContact: string; // सम्पर्क
  omFundNpr: number; // मर्मतसम्भार कोष (रू.)
  status: 'सञ्चालनमा' | 'मर्मत आवश्यक' | 'निर्माणाधीन' | 'बन्द';
}

const INITIAL_SCHEMES: WashScheme[] = [
  {
    id: 'wash-1',
    name: 'मानेखर्क एकीकृत लिफ्टिङ खानेपानी आयोजना',
    ward: 3,
    sourceType: 'स्प्रिङ (मुल)',
    capacityLpd: 120000,
    householdCount: 285,
    tapCount: 280,
    completionYear: '२०८०/०८१',
    waterQuality: 'उत्कृष्ट',
    wucName: 'मानेखर्क खानेपानी उपभोक्ता समिति',
    wucChair: 'राम बहादुर तामाङ',
    wucContact: '९८४१००१२३४',
    omFundNpr: 185000,
    status: 'सञ्चालनमा',
  },
  {
    id: 'wash-2',
    name: 'थाङपालधाप बृहत खानेपानी तथा सरसफाइ योजना',
    ward: 1,
    sourceType: 'खोला तथा स्प्रिङ',
    capacityLpd: 250000,
    householdCount: 520,
    tapCount: 512,
    completionYear: '२०७९/०८०',
    waterQuality: 'सामान्य',
    wucName: 'थाङपालधाप खानेपानी व्यवस्थापन समिति',
    wucChair: 'सीता कार्की',
    wucContact: '९८५१२३४५६७',
    omFundNpr: 320000,
    status: 'सञ्चालनमा',
  },
  {
    id: 'wash-3',
    name: 'भोताङ खोला डिप बोरिङ तथा वितरण सञ्जाल',
    ward: 4,
    sourceType: 'डिप बोरिङ',
    capacityLpd: 95000,
    householdCount: 160,
    tapCount: 155,
    completionYear: '२०८१/०८२',
    waterQuality: 'परीक्षण बाँकी',
    wucName: 'भोताङ टोल खानेपानी समिति',
    wucChair: 'कृष्ण प्रसाद सापकोटा',
    wucContact: '९८४९८७६५४३',
    omFundNpr: 75000,
    status: 'निर्माणाधीन',
  },
  {
    id: 'wash-4',
    name: 'गुन्सा सिम्ले स्वच्छ खानेपानी आयोजना',
    ward: 2,
    sourceType: 'स्प्रिङ (मुहान)',
    capacityLpd: 60000,
    householdCount: 110,
    tapCount: 95,
    completionYear: '२०७८/०७९',
    waterQuality: 'उपचार आवश्यक',
    wucName: 'गुन्सा सुधार उपभोक्ता समिति',
    wucChair: 'दौर्जे शेर्पा',
    wucContact: '९८६००११२२३',
    omFundNpr: 42000,
    status: 'मर्मत आवश्यक',
  },
];

interface QualityTestLog {
  id: string;
  schemeName: string;
  testDateBs: string;
  phLevel: number; // 6.5 - 8.5
  turbidityNtu: number; // < 5 NTU
  eColiPresent: boolean; // अनुपस्थित हुनुपर्ने
  residualChlorine: number; // 0.2 mg/l
  resultStatus: 'मानक अनुरुप' | 'सुधार आवश्यक';
}

const INITIAL_TESTS: QualityTestLog[] = [
  {
    id: 't-1',
    schemeName: 'मानेखर्क एकीकृत लिफ्टिङ खानेपानी आयोजना',
    testDateBs: '२०८१-०६-१२',
    phLevel: 7.2,
    turbidityNtu: 1.8,
    eColiPresent: false,
    residualChlorine: 0.25,
    resultStatus: 'मानक अनुरुप',
  },
  {
    id: 't-2',
    schemeName: 'थाङपालधाप बृहत खानेपानी तथा सरसफाइ योजना',
    testDateBs: '२०८१-०६-०५',
    phLevel: 6.9,
    turbidityNtu: 3.1,
    eColiPresent: false,
    residualChlorine: 0.2,
    resultStatus: 'मानक अनुरुप',
  },
  {
    id: 't-3',
    schemeName: 'गुन्सा सिम्ले स्वच्छ खानेपानी आयोजना',
    testDateBs: '२०८१-०५-२२',
    phLevel: 6.3,
    turbidityNtu: 6.8,
    eColiPresent: true,
    residualChlorine: 0.05,
    resultStatus: 'सुधार आवश्यक',
  },
];

export interface WashPageProps {
  isPublic?: boolean;
}

export const WashPage: React.FC<WashPageProps> = ({ isPublic: propIsPublic }) => {
  const location = useLocation();
  const isPublic = propIsPublic !== undefined ? propIsPublic : !location.pathname.startsWith('/app');
  const { tenantId, settings } = useTenant();
  const { activeFiscalYear } = useFiscalYear();

  const [activeTab, setActiveTab] = useState<'schemes' | 'wuc' | 'quality' | 'sanitation'>('schemes');
  const [schemes, setSchemes] = useState<WashScheme[]>(() => {
    const saved = localStorage.getItem(`wash_schemes_${tenantId}`);
    return saved ? JSON.parse(saved) : INITIAL_SCHEMES;
  });
  const [tests, setTests] = useState<QualityTestLog[]>(() => {
    const saved = localStorage.getItem(`wash_tests_${tenantId}`);
    return saved ? JSON.parse(saved) : INITIAL_TESTS;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWard, setSelectedWard] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Scheme Form
  const [formName, setFormName] = useState('');
  const [formWard, setFormWard] = useState('1');
  const [formSource, setFormSource] = useState('स्प्रिङ (मुहान)');
  const [formCapacity, setFormCapacity] = useState('50000');
  const [formHh, setFormHh] = useState('100');
  const [formTaps, setFormTaps] = useState('100');
  const [formWucName, setFormWucName] = useState('');
  const [formWucChair, setFormWucChair] = useState('');
  const [formWucContact, setFormWucContact] = useState('');
  const [formOmFund, setFormOmFund] = useState('50000');
  const [formStatus, setFormStatus] = useState<WashScheme['status']>('सञ्चालनमा');

  useEffect(() => {
    localStorage.setItem(`wash_schemes_${tenantId}`, JSON.stringify(schemes));
  }, [schemes, tenantId]);

  useEffect(() => {
    localStorage.setItem(`wash_tests_${tenantId}`, JSON.stringify(tests));
  }, [tests, tenantId]);

  const handleAddScheme = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName) return;

    const newScheme: WashScheme = {
      id: `wash-${Date.now()}`,
      name: formName,
      ward: Number(formWard),
      sourceType: formSource,
      capacityLpd: Number(formCapacity) || 0,
      householdCount: Number(formHh) || 0,
      tapCount: Number(formTaps) || 0,
      completionYear: activeFiscalYear || '२०८१/०८२',
      waterQuality: 'सामान्य',
      wucName: formWucName || `${formName} उपभोक्ता समिति`,
      wucChair: formWucChair,
      wucContact: formWucContact,
      omFundNpr: Number(formOmFund) || 0,
      status: formStatus,
    };

    setSchemes([newScheme, ...schemes]);
    setIsAddModalOpen(false);
    // Reset
    setFormName('');
    setFormWucChair('');
    setFormWucContact('');
  };

  // KPIs
  const totalSchemes = schemes.length;
  const totalBeneficiaries = schemes.reduce((acc, s) => acc + s.householdCount, 0);
  const totalTaps = schemes.reduce((acc, s) => acc + s.tapCount, 0);
  const totalOmFund = schemes.reduce((acc, s) => acc + s.omFundNpr, 0);
  const operationalCount = schemes.filter((s) => s.status === 'सञ्चालनमा').length;

  const filteredSchemes = useMemo(() => {
    return schemes.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.wucChair.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.sourceType.toLowerCase().includes(searchQuery.toLowerCase());
      const matchWard = selectedWard === 'all' || s.ward === Number(selectedWard);
      const matchStatus = selectedStatus === 'all' || s.status === selectedStatus;
      return matchSearch && matchWard && matchStatus;
    });
  }, [schemes, searchQuery, selectedWard, selectedStatus]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', padding: '1rem' }}>
      {/* ── HEADER BANNER ── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
          borderRadius: '18px',
          padding: '1.75rem',
          color: '#ffffff',
          boxShadow: '0 8px 24px rgba(2, 132, 199, 0.22)',
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
            <Droplets size={28} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>
                खानेपानी, स्वच्छता तथा सरसफाइ डिजिटल ट्विन (WASH Twin)
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
                संविधान अनुसूची ८ (एकल अधिकार १९)
              </span>
            </div>
            <p style={{ margin: '4px 0 0', opacity: 0.9, fontSize: '0.85rem' }}>
              {settings?.palika_name || 'गाउँ/नगर कार्यपालिका'} — योजना, मुहान, उपभोक्ता समिति, पानीको गुणस्तर तथा मर्मतसम्भार कोष ३६०
            </p>
          </div>
        </div>

        {!isPublic ? (
          <button
            onClick={() => setIsAddModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#ffffff',
              color: '#0284c7',
              border: 'none',
              borderRadius: '12px',
              padding: '10px 18px',
              fontWeight: 800,
              fontSize: '0.88rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
              transition: 'transform 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            <Plus size={18} />
            <span>नयाँ खानेपानी आयोजना दर्ता</span>
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
            <ShieldCheck size={16} />
            <span>नागरिक खुला पोर्टल (Public WASH Portal)</span>
          </div>
        )}
      </div>

      {/* ── KPI METRIC CARDS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem' }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '1.2rem', border: '1px solid #e2e8f0', borderLeft: '4px solid #0284c7' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>कुल खानेपानी योजनाहरू</div>
          <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#0369a1', marginTop: '4px' }}>{totalSchemes} वटा</div>
          <div style={{ fontSize: '0.75rem', color: '#0284c7', marginTop: '2px', fontWeight: 600 }}>
            ● {operationalCount} वटा नियमित सञ्चालनमा
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '1.2rem', border: '1px solid #e2e8f0', borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>लाभान्वित घरधुरी तथा धारा</div>
          <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#059669', marginTop: '4px' }}>{totalBeneficiaries} घर</div>
          <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '2px', fontWeight: 600 }}>
            कुल जडान धारा: {totalTaps} वटा
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '1.2rem', border: '1px solid #e2e8f0', borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>मर्मतसम्भार कोष (O&M Fund)</div>
          <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#6d28d9', marginTop: '4px' }}>रू. {(totalOmFund / 1000).toFixed(1)}k</div>
          <div style={{ fontSize: '0.75rem', color: '#8b5cf6', marginTop: '2px', fontWeight: 600 }}>
            उपभोक्ता समिति कोषमा मौज्दात
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '1.2rem', border: '1px solid #e2e8f0', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>पानीको गुणस्तर परीक्षण दर</div>
          <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#d97706', marginTop: '4px' }}>९२.५%</div>
          <div style={{ fontSize: '0.75rem', color: '#f59e0b', marginTop: '2px', fontWeight: 600 }}>
            मानक अनुरुप पिउन योग्य
          </div>
        </div>
      </div>

      {/* ── TABS NAVIGATION ── */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #e2e8f0', paddingBottom: '2px' }}>
        {[
          { key: 'schemes', label: 'आयोजना तथा मुहान इन्भेन्टरी', icon: <Droplets size={16} /> },
          { key: 'wuc', label: 'उपभोक्ता समिति तथा O&M', icon: <Users size={16} /> },
          { key: 'quality', label: 'पानीको गुणस्तर (WQI) लग', icon: <Activity size={16} /> },
          { key: 'sanitation', label: 'सरसफाइ तथा स्वच्छता सूचक', icon: <ShieldCheck size={16} /> },
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
              color: activeTab === t.key ? '#0284c7' : '#64748b',
              fontWeight: 800,
              fontSize: '0.88rem',
              cursor: 'pointer',
              borderBottom: activeTab === t.key ? '3px solid #0284c7' : '3px solid transparent',
              transition: 'all 0.15s ease',
            }}
          >
            {t.icon}
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* ── TAB 1: SCHEMES INVENTORY ── */}
      {activeTab === 'schemes' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          {/* Controls bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', flex: 1 }}>
              <div style={{ position: 'relative', minWidth: '240px' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="text"
                  placeholder="योजनाको नाम, मुहान, समिति..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 36px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem',
                    outline: 'none',
                  }}
                />
              </div>

              <select
                value={selectedWard}
                onChange={(e) => setSelectedWard(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 600 }}
              >
                <option value="all">सबै वडाहरू</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
                  <option key={w} value={w}>वडा नं. {w}</option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 600 }}
              >
                <option value="all">सबै स्थिति</option>
                <option value="सञ्चालनमा">सञ्चालनमा</option>
                <option value="मर्मत आवश्यक">मर्मत आवश्यक</option>
                <option value="निर्माणाधीन">निर्माणाधीन</option>
              </select>
            </div>

            <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700 }}>
              देखाउँदै: {filteredSchemes.length} / {totalSchemes} योजनाहरू
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', textAlign: 'left' }}>
                  <th style={{ padding: '10px 12px', fontWeight: 700 }}>क्र.सं.</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700 }}>खानेपानी योजनाको नाम</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700 }}>वडा</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700 }}>मुहानको प्रकार</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700 }}>दैनिक क्षमता</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700 }}>घरधुरी / धारा</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700 }}>पानी गुणस्तर</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700 }}>समिति अध्यक्ष</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700 }}>स्थिति</th>
                </tr>
              </thead>
              <tbody>
                {filteredSchemes.map((s, idx) => (
                  <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px', color: '#64748b' }}>{idx + 1}</td>
                    <td style={{ padding: '12px', fontWeight: 700, color: '#0f172a' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Droplet size={14} color="#0284c7" />
                        <span>{s.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>वडा {s.ward}</td>
                    <td style={{ padding: '12px', color: '#475569' }}>{s.sourceType}</td>
                    <td style={{ padding: '12px', fontWeight: 600 }}>{(s.capacityLpd / 1000).toLocaleString()} KL/दिन</td>
                    <td style={{ padding: '12px', color: '#1e293b' }}>
                      <strong>{s.householdCount}</strong> घर / {s.tapCount} धारा
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span
                        style={{
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          backgroundColor:
                            s.waterQuality === 'उत्कृष्ट'
                              ? '#dcfce7'
                              : s.waterQuality === 'सामान्य'
                              ? '#eff6ff'
                              : s.waterQuality === 'उपचार आवश्यक'
                              ? '#fee2e2'
                              : '#fef3c7',
                          color:
                            s.waterQuality === 'उत्कृष्ट'
                              ? '#15803d'
                              : s.waterQuality === 'सामान्य'
                              ? '#1d4ed8'
                              : s.waterQuality === 'उपचार आवश्यक'
                              ? '#b91c1c'
                              : '#b45309',
                        }}
                      >
                        {s.waterQuality}
                      </span>
                    </td>
                    <td style={{ padding: '12px', color: '#334155' }}>
                      {s.wucChair} ({s.wucContact})
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: '999px',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          backgroundColor:
                            s.status === 'सञ्चालनमा'
                              ? '#dcfce7'
                              : s.status === 'निर्माणाधीन'
                              ? '#e0e7ff'
                              : '#fef2f2',
                          color:
                            s.status === 'सञ्चालनमा'
                              ? '#166534'
                              : s.status === 'निर्माणाधीन'
                              ? '#4338ca'
                              : '#991b1b',
                        }}
                      >
                        ● {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 2: WUC & O&M FUND ── */}
      {activeTab === 'wuc' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
          {schemes.map((s) => (
            <div key={s.id} style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>{s.wucName}</h4>
                <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '6px', backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: 700 }}>
                  वडा नं. {s.ward}
                </span>
              </div>
              <div style={{ fontSize: '0.82rem', color: '#475569', marginBottom: '12px' }}>
                सम्बद्ध आयोजना: <strong>{s.name}</strong>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '10px', backgroundColor: '#f8fafc', borderRadius: '10px', fontSize: '0.8rem' }}>
                <div>
                  <span style={{ color: '#64748b' }}>समिति अध्यक्ष:</span>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{s.wucChair}</div>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>सम्पर्क नम्बर:</span>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{s.wucContact}</div>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>मर्मत कोष (O&M):</span>
                  <div style={{ fontWeight: 800, color: '#059669' }}>रू. {s.omFundNpr.toLocaleString()}</div>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>नवीकरण अवस्था:</span>
                  <div style={{ fontWeight: 700, color: '#2563eb' }}>नियमित (चालू)</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── TAB 3: WATER QUALITY (WQI) LOG ── */}
      {activeTab === 'quality' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>प्रयोगशाला पानी गुणस्तर परीक्षण अभिलेख</h4>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>नेपाल खानेपानी गुणस्तर मापदण्ड (NDWQS) अनुरुप</span>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                <th style={{ padding: '10px 12px' }}>खानेपानी योजना</th>
                <th style={{ padding: '10px 12px' }}>परीक्षण मिति (वि.सं.)</th>
                <th style={{ padding: '10px 12px' }}>pH मान (६.५-८.५)</th>
                <th style={{ padding: '10px 12px' }}>धमिलोपना (Turbidity &lt; ५ NTU)</th>
                <th style={{ padding: '10px 12px' }}>इ-कोलाई (E.Coli)</th>
                <th style={{ padding: '10px 12px' }}>अवशेष क्लोरिन</th>
                <th style={{ padding: '10px 12px' }}>परीक्षण नतिजा</th>
              </tr>
            </thead>
            <tbody>
              {tests.map((t) => (
                <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px', fontWeight: 700 }}>{t.schemeName}</td>
                  <td style={{ padding: '12px', color: '#64748b' }}>{t.testDateBs}</td>
                  <td style={{ padding: '12px', fontWeight: 700, color: t.phLevel >= 6.5 && t.phLevel <= 8.5 ? '#15803d' : '#dc2626' }}>
                    {t.phLevel}
                  </td>
                  <td style={{ padding: '12px', fontWeight: 600 }}>{t.turbidityNtu} NTU</td>
                  <td style={{ padding: '12px', fontWeight: 700, color: t.eColiPresent ? '#dc2626' : '#15803d' }}>
                    {t.eColiPresent ? 'उपस्थित (जोखिम)' : 'शून्य (सुरक्षित)'}
                  </td>
                  <td style={{ padding: '12px' }}>{t.residualChlorine} mg/l</td>
                  <td style={{ padding: '12px' }}>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '999px',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        backgroundColor: t.resultStatus === 'मानक अनुरुप' ? '#dcfce7' : '#fee2e2',
                        color: t.resultStatus === 'मानक अनुरुप' ? '#166534' : '#991b1b',
                      }}
                    >
                      {t.resultStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── TAB 4: SANITATION INDICATORS ── */}
      {activeTab === 'sanitation' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
            <h4 style={{ margin: '0 0 10px', fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>खुला दिसामुक्त (ODF) तथा पूर्ण सरसफाइ</h4>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#16a34a' }}>१००% ODF</div>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '4px 0 12px' }}>
              पालिकाका सबै वडाहरूमा चर्पीको पहुँच कायम। हाल दोस्रो चरणको "पूर्ण सरसफाइ मार्गचित्र" कार्यान्वयनमा।
            </p>
            <div style={{ height: '8px', backgroundColor: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{ width: '84%', height: '100%', backgroundColor: '#16a34a' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
              <span>पूर्ण सरसफाइ प्रगति</span>
              <span>८४%</span>
            </div>
          </div>

          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
            <h4 style={{ margin: '0 0 10px', fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>सार्वजनिक तथा विद्यालय शौचालय पहुँच</h4>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#2563eb' }}>२४ स्थान</div>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '4px 0' }}>
              बालमैत्री, अपाङ्गतामैत्री तथा छात्रा महिनावारी स्वच्छता (MHM) युनिटसहितका सार्वजनिक तथा विद्यालय शौचालयहरू।
            </p>
          </div>

          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
            <h4 style={{ margin: '0 0 10px', fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>फोहोर पानी व्यवस्थापन तथा ढल निकास</h4>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#7c3aed' }}>३ वटा युनिट</div>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '4px 0' }}>
              बजार क्षेत्र तथा स्वास्थ्य संस्थाहरूमा जैविक फोहोर पानी प्रशोधन (DEWATS) र सेफ्टी ट्याङ्की व्यवस्थापन।
            </p>
          </div>
        </div>
      )}

      {/* ── ADD SCHEME MODAL ── */}
      {isAddModalOpen && (
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
          <div style={{ backgroundColor: '#ffffff', borderRadius: '18px', width: '100%', maxWidth: '600px', padding: '1.5rem', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
              नयाँ खानेपानी आयोजना तथा उपभोक्ता समिति दर्ता
            </h3>
            <form onSubmit={handleAddScheme} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  आयोजनाको नाम *
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा. मानेखर्क लिफ्टिङ खानेपानी आयोजना"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>वडा नं. *</label>
                <select value={formWard} onChange={(e) => setFormWard(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
                    <option key={w} value={w}>वडा नं. {w}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>मुहानको प्रकार</label>
                <select value={formSource} onChange={(e) => setFormSource(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                  <option value="स्प्रिङ (मुल)">स्प्रिङ (मुल)</option>
                  <option value="खोला / नदी">खोला / नदी</option>
                  <option value="डिप बोरिङ">डिप बोरिङ</option>
                  <option value="लिफ्टिङ प्रणाली">लिफ्टिङ प्रणाली</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>दैनिक क्षमता (लिटर)</label>
                <input type="number" value={formCapacity} onChange={(e) => setFormCapacity(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>लाभान्वित घरधुरी संख्या</label>
                <input type="number" value={formHh} onChange={(e) => setFormHh(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>उपभोक्ता समिति अध्यक्ष</label>
                <input type="text" placeholder="अध्यक्षको नाम" value={formWucChair} onChange={(e) => setFormWucChair(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>सम्पर्क मोबाइल नं.</label>
                <input type="text" placeholder="९८xxxxxxxx" value={formWucContact} onChange={(e) => setFormWucContact(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>

              <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  style={{ padding: '9px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontWeight: 700, cursor: 'pointer' }}
                >
                  रद्द गर्नुहोस्
                </button>
                <button
                  type="submit"
                  style={{ padding: '9px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#0284c7', color: '#ffffff', fontWeight: 800, cursor: 'pointer' }}
                >
                  आयोजना सुरक्षित गर्नुहोस्
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
