import React, { useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Briefcase,
  Search,
  Plus,
  Printer,
  X,
  CheckCircle,
  AlertCircle,
  Building,
  Coins,
  QrCode,
  Store,
  RefreshCw,
  Award,
  Eye,
  Filter,
  FileSpreadsheet,
  ShieldCheck,
  TrendingUp,
  Users,
  Layers,
  MapPin,
  Phone,
  CreditCard,
  FileText,
  AlertTriangle,
  ClipboardCheck,
  BadgeCheck,
  Activity,
  BarChart3,
  UserCheck,
  Send,
  Ban,
  Download,
} from 'lucide-react';
import { exportBusinessesData } from '../../utils/exportUtils';
import {
  businessApi,
  Business,
  BusinessRenewalRecord,
  BusinessInspectionRecord,
  BusinessStats,
  BUSINESS_CATEGORIES,
  ANNUAL_FEE_SCHEDULE,
  calculateAnnualFee,
} from '../../api/business';
import './business.css';

type TabKey = 'registry' | 'renewals' | 'inspections' | 'analytics';

export interface BusinessRegistrationPageProps {
  isReadOnly?: boolean;
}

export const BusinessRegistrationPage: React.FC<BusinessRegistrationPageProps> = ({ isReadOnly = false }) => {
  const location = useLocation();
  const isAdmin = !isReadOnly && location.pathname.startsWith('/app');
  const queryClient = useQueryClient();

  // State
  const [activeTab, setActiveTab] = useState<TabKey>('registry');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedWard, setSelectedWard] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Modals
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [certModalData, setCertModalData] = useState<Business | null>(null);
  const [detailModalData, setDetailModalData] = useState<Business | null>(null);
  const [showRenewalModal, setShowRenewalModal] = useState<Business | null>(null);
  const [showInspectionModal, setShowInspectionModal] = useState<Business | null>(null);

  // Register Form
  const [formData, setFormData] = useState({
    businessName: '',
    businessNameEn: '',
    proprietorName: '',
    proprietorPhone: '',
    proprietorCitizenshipNo: '',
    panNumber: '',
    vatNumber: '',
    category: BUSINESS_CATEGORIES[0],
    subCategory: '',
    wardNumber: 1,
    tole: '',
    capitaInvestmentNPR: 500_000,
    employeeCount: 2,
    femaleEmployeeCount: 1,
    environmentalStatus: 'प्रभाव नगर्ने (Green)' as Business['environmentalStatus'],
  });

  // Renewal Form
  const [renewalForm, setRenewalForm] = useState({
    officerName: 'सुरेन्द्र श्रेष्ठ (वडा सचिव)',
    paymentGateway: 'FONEPAY',
  });

  // Inspection Form
  const [inspectionForm, setInspectionForm] = useState({
    inspectorName: '',
    inspectorDesignation: 'राजस्व निरीक्षक',
    inspectionType: 'नियमित वार्षिक' as BusinessInspectionRecord['inspectionType'],
    complianceStatus: 'अनुपालन सम्पन्न ✅' as BusinessInspectionRecord['complianceStatus'],
    remarks: '',
    followUpDateBs: '',
  });

  // Computed fee
  const liveFee = calculateAnnualFee(formData.capitaInvestmentNPR);

  // Queries
  const { data: businesses = [], isLoading } = useQuery({
    queryKey: ['biz-list'],
    queryFn: () => businessApi.getAll(),
  });

  const { data: renewals = [] } = useQuery({
    queryKey: ['biz-renewals'],
    queryFn: () => businessApi.getRenewals(),
  });

  const { data: inspections = [] } = useQuery({
    queryKey: ['biz-inspections'],
    queryFn: () => businessApi.getInspections(),
  });

  const { data: stats } = useQuery<BusinessStats>({
    queryKey: ['biz-stats'],
    queryFn: () => businessApi.getStats(),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => businessApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['biz-list'] });
      queryClient.invalidateQueries({ queryKey: ['biz-stats'] });
      setShowRegisterModal(false);
      setFormData({
        businessName: '', businessNameEn: '', proprietorName: '', proprietorPhone: '',
        proprietorCitizenshipNo: '', panNumber: '', vatNumber: '',
        category: BUSINESS_CATEGORIES[0], subCategory: '', wardNumber: 1, tole: '',
        capitaInvestmentNPR: 500_000, employeeCount: 2, femaleEmployeeCount: 1,
        environmentalStatus: 'प्रभाव नगर्ने (Green)',
      });
      alert('व्यवसाय दर्ता सफलतापूर्वक सम्पन्न भयो!');
    },
  });

  const renewMutation = useMutation({
    mutationFn: ({ id, officer }: { id: string; officer: string }) =>
      businessApi.renew(id, officer),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['biz-list'] });
      queryClient.invalidateQueries({ queryKey: ['biz-renewals'] });
      queryClient.invalidateQueries({ queryKey: ['biz-stats'] });
      setShowRenewalModal(null);
      alert('व्यवसाय नवीकरण सफलतापूर्वक सम्पन्न भयो!');
    },
  });

  const suspendMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      businessApi.suspend(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['biz-list'] });
      queryClient.invalidateQueries({ queryKey: ['biz-stats'] });
      alert('व्यवसाय निलम्बन गरियो!');
    },
  });

  const inspectionMutation = useMutation({
    mutationFn: (data: Partial<BusinessInspectionRecord>) =>
      businessApi.addInspection(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['biz-inspections'] });
      setShowInspectionModal(null);
      setInspectionForm({
        inspectorName: '', inspectorDesignation: 'राजस्व निरीक्षक',
        inspectionType: 'नियमित वार्षिक', complianceStatus: 'अनुपालन सम्पन्न ✅',
        remarks: '', followUpDateBs: '',
      });
      alert('स्थलगत निरीक्षण अभिलेख सुरक्षित गरियो!');
    },
  });

  // Filtered list
  const filteredList = useMemo(
    () =>
      businesses.filter((b) => {
        const q = searchTerm.toLowerCase();
        const matchSearch =
          !q ||
          b.businessName.toLowerCase().includes(q) ||
          b.proprietorName.toLowerCase().includes(q) ||
          b.registrationNo.toLowerCase().includes(q) ||
          (b.panNumber || '').includes(q) ||
          (b.proprietorPhone || '').includes(q);
        const matchCategory =
          selectedCategory === 'all' || b.category === selectedCategory;
        const matchWard =
          selectedWard === 'all' || b.wardNumber === Number(selectedWard);
        const matchStatus = selectedStatus === 'all' || b.status === selectedStatus;
        return matchSearch && matchCategory && matchWard && matchStatus;
      }),
    [businesses, searchTerm, selectedCategory, selectedWard, selectedStatus]
  );

  const getStatusBadge = (status: Business['status']) => {
    const map: Record<string, { bg: string; color: string }> = {
      'नवीकृत': { bg: '#dcfce7', color: '#15803d' },
      'दर्ता सम्पन्न': { bg: '#e0e7ff', color: '#3730a3' },
      'नवीकरण बाँकी': { bg: '#fef3c7', color: '#b45309' },
      'निलम्बित': { bg: '#fee2e2', color: '#b91c1c' },
      'रद्द': { bg: '#f1f5f9', color: '#64748b' },
    };
    const style = map[status] || { bg: '#f1f5f9', color: '#64748b' };
    return (
      <span style={{
        background: style.bg, color: style.color,
        padding: '0.25rem 0.65rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700,
      }}>
        {status}
      </span>
    );
  };

  const getEnvBadge = (env?: Business['environmentalStatus']) => {
    if (!env) return null;
    const map: Record<string, string> = {
      'प्रभाव नगर्ने (Green)': '#16a34a',
      'अनुमति आवश्यक (Amber)': '#d97706',
      'EIA अनिवार्य (Red)': '#dc2626',
    };
    const color = map[env] || '#64748b';
    return (
      <span style={{
        fontSize: '0.7rem', fontWeight: 700, color,
        display: 'inline-flex', alignItems: 'center', gap: '0.2rem',
      }}>
        ⬤ {env}
      </span>
    );
  };

  const INPUT_STYLE: React.CSSProperties = {
    width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px',
    border: '1.5px solid #cbd5e1', outline: 'none', fontSize: '0.875rem', color: '#0f172a',
    boxSizing: 'border-box',
  };
  const LABEL_STYLE: React.CSSProperties = {
    display: 'block', fontSize: '0.8rem', fontWeight: 700,
    marginBottom: '0.35rem', color: '#334155',
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1600px', margin: '0 auto', color: '#1e293b' }}>

      {/* ── Header Banner ── */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 45%, #0284c7 100%)',
        color: '#fff', borderRadius: '16px', padding: '1.75rem 2rem',
        marginBottom: '1.5rem', boxShadow: '0 10px 25px -5px rgba(30, 58, 138, 0.25)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
            padding: '1rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.25)',
          }}>
            <Briefcase size={36} color="#93c5fd" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
              <span style={{
                background: '#f59e0b', color: '#78350f', fontSize: '0.7rem',
                fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: '20px',
              }}>
                स्थानीय सरकार सञ्चालन ऐन, २०७४ — अनुसूची ८
              </span>
              <span style={{ fontSize: '0.85rem', color: '#bfdbfe' }}>
                पाँचपोखरी थाङपाल गाउँपालिका, सिन्धुपाल्चोक
              </span>
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
              व्यवसाय दर्ता, नवीकरण तथा ई-व्यवसाय कर प्रणाली (e-Business Suite)
            </h1>
            <p style={{ margin: '0.35rem 0 0', opacity: 0.9, fontSize: '0.9rem', maxWidth: '860px' }}>
              व्यवसाय दर्ता, वार्षिक नवीकरण, स्थलगत व्यावसायिक निरीक्षण, पर्यावरणीय अनुपालन, डिजिटल ई-व्यापार प्रमाणपत्र तथा व्यवसाय कर असुली व्यवस्थापन
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => exportBusinessesData(filteredList, 'xlsx')}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.65rem 1.15rem', background: '#10b981',
              border: '1px solid #059669', borderRadius: '10px',
              color: '#fff', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)',
            }}
            title="हालको खोज/फिल्टर अनुसार व्यवसाय लगत एक्सेलमा डाउनलोड गर्नुहोस्"
          >
            <FileSpreadsheet size={16} /> एक्सेल (.xlsx) निर्यात
          </button>
          <button
            onClick={() => exportBusinessesData(filteredList, 'csv')}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.65rem 1rem', background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.25)', borderRadius: '10px',
              color: '#fff', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
            }}
            title="CSV ढाँचामा डाउनलोड गर्नुहोस्"
          >
            <Download size={15} /> CSV
          </button>
          {isAdmin && (
            <button
              onClick={() => setShowRegisterModal(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.65rem 1.35rem', background: '#10b981', border: 'none',
                borderRadius: '10px', color: '#fff', fontWeight: 700, fontSize: '0.9rem',
                cursor: 'pointer', boxShadow: '0 4px 12px rgba(16,185,129,0.35)',
              }}
            >
              <Plus size={18} /> नयाँ व्यवसाय दर्ता
            </button>
          )}
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem', marginBottom: '1.5rem',
      }}>
        {[
          {
            label: 'कुल दर्ता व्यवसाय', value: `${stats?.totalRegistered ?? businesses.length} वटा`,
            sub: `सक्रिय: ${stats?.activeCount ?? 0}`, icon: <Store size={26} />, bg: '#eff6ff', color: '#2563eb',
          },
          {
            label: 'चालु आव नवीकृत', value: `${stats?.renewedCount ?? 0} वटा`,
            sub: `नवीकरण बाँकी: ${stats?.pendingRenewalCount ?? 0}`, icon: <RefreshCw size={26} />, bg: '#ecfdf5', color: '#059669',
          },
          {
            label: 'कुल पूँजी लगानी', value: `रु. ${Number(stats?.totalCapitalInvestedNPR ?? 0).toLocaleString('ne-NP')}`,
            sub: `${stats?.totalEmployeeCount ?? 0} जना रोजगार`, icon: <Coins size={26} />, bg: '#fefce8', color: '#b45309',
          },
          {
            label: 'चालु आव व्यवसाय कर असुली', value: `रु. ${Number(stats?.totalRevenueThisFyNPR ?? 0).toLocaleString('ne-NP')}`,
            sub: `नवीकरण दस्तुर संकलन`, icon: <TrendingUp size={26} />, bg: '#f0fdf4', color: '#15803d',
          },
        ].map((kpi) => (
          <div key={kpi.label} style={{
            background: '#fff', padding: '1.25rem', borderRadius: '14px',
            border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div>
              <div style={{ fontSize: '0.825rem', color: '#64748b', fontWeight: 600 }}>{kpi.label}</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1e293b', marginTop: '0.2rem' }}>
                {kpi.value}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem' }}>{kpi.sub}</div>
            </div>
            <div style={{ background: kpi.bg, color: kpi.color, padding: '0.9rem', borderRadius: '12px' }}>
              {kpi.icon}
            </div>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div className="biz-tab-ribbon">
        {([
          { key: 'registry', label: 'व्यवसाय अभिलेख', icon: <Store size={17} />, count: businesses.length },
          { key: 'renewals', label: 'नवीकरण इतिहास', icon: <RefreshCw size={17} />, count: renewals.length },
          { key: 'inspections', label: 'स्थलगत निरीक्षण', icon: <ClipboardCheck size={17} />, count: inspections.length },
          { key: 'analytics', label: 'वडागत विश्लेषण', icon: <BarChart3 size={17} />, count: null },
        ] as { key: TabKey; label: string; icon: React.ReactNode; count: number | null }[]).map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`biz-tab-pill ${isActive ? 'active primary' : ''}`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span className="biz-tab-badge">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── TAB 1: REGISTRY ── */}
      {activeTab === 'registry' && (
        <div>
          {/* Filter Bar */}
          <div style={{
            background: '#fff', padding: '1.15rem 1.25rem', borderRadius: '12px',
            border: '1px solid #e2e8f0', marginBottom: '1.25rem',
            display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center',
          }}>
            <div style={{ flex: 1, minWidth: '280px', position: 'relative' }}>
              <Search size={17} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type="text"
                placeholder="व्यवसायको नाम, दर्ता नं., स्वामी वा PAN नम्बर खोज्नुहोस्..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ ...INPUT_STYLE, paddingLeft: '2.5rem' }}
              />
            </div>
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} style={INPUT_STYLE}>
              <option value="all">सबै व्यवसायका वर्ग</option>
              {BUSINESS_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={selectedWard} onChange={(e) => setSelectedWard(e.target.value)} style={{ ...INPUT_STYLE, minWidth: '140px' }}>
              <option value="all">सबै वडा (१–८)</option>
              {[1,2,3,4,5,6,7,8].map((w) => <option key={w} value={w}>वडा नं. {w}</option>)}
            </select>
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} style={{ ...INPUT_STYLE, minWidth: '160px' }}>
              <option value="all">सबै अवस्था</option>
              <option value="नवीकृत">नवीकृत</option>
              <option value="दर्ता सम्पन्न">दर्ता सम्पन्न</option>
              <option value="नवीकरण बाँकी">नवीकरण बाँकी</option>
              <option value="निलम्बित">निलम्बित</option>
              <option value="रद्द">रद्द</option>
            </select>
          </div>

          {/* Table */}
          <div style={{
            background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0',
            overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.04)',
          }}>
            <div className="dt-responsive-table-wrapper">
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', textAlign: 'left' }}>
                <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <tr>
                    {['दर्ता नं.', 'व्यवसायको नाम', 'स्वामी', 'वडा / टोल', 'वर्ग', 'पूँजी', 'वार्षिक दस्तुर', 'पर्यावरण', 'अवस्था', 'कार्य'].map((h) => (
                      <th key={h} style={{ padding: '0.9rem 1rem', color: '#475569', fontWeight: 700, whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr><td colSpan={10} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>व्यवसाय सूची लोड हुँदैछ...</td></tr>
                  ) : filteredList.length === 0 ? (
                    <tr><td colSpan={10} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>कुनै व्यवसाय फेला परेन।</td></tr>
                  ) : filteredList.map((b) => (
                    <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = '#fff')}>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#1e40af', whiteSpace: 'nowrap' }}>
                        {b.registrationNo}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{b.businessName}</div>
                        {b.businessNameEn && <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>{b.businessNameEn}</div>}
                        {b.panNumber && <div style={{ fontSize: '0.7rem', color: '#2563eb', fontWeight: 600 }}>PAN: {b.panNumber}</div>}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ fontWeight: 600 }}>{b.proprietorName}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{b.proprietorPhone}</div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ fontWeight: 600 }}>वडा नं. {b.wardNumber}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{b.tole || 'गाउँ क्षेत्र'}</div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span style={{
                          background: '#e0f2fe', color: '#0369a1',
                          padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700,
                          display: 'inline-block', maxWidth: '180px', whiteSpace: 'normal',
                        }}>
                          {b.category}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: 600 }}>रु. {Number(b.capitaInvestmentNPR).toLocaleString('ne-NP')}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{b.employeeCount} कर्मचारी</div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#047857', whiteSpace: 'nowrap' }}>
                        रु. {Number(b.annualFeeNPR).toLocaleString('ne-NP')}
                        {b.fineNPR ? <div style={{ fontSize: '0.7rem', color: '#b91c1c' }}>+ जरिवाना रु. {b.fineNPR}</div> : null}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        {getEnvBadge(b.environmentalStatus)}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        {getStatusBadge(b.status)}
                        {b.lastReceiptNo && (
                          <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '0.2rem' }}>
                            {b.lastPaymentGateway} | {b.lastReceiptNo}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'nowrap' }}>
                          <button onClick={() => setDetailModalData(b)} title="विस्तृत हेर्नुहोस्"
                            style={{ padding: '0.4rem 0.6rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '7px', cursor: 'pointer', color: '#334155' }}>
                            <Eye size={14} />
                          </button>
                          <button onClick={() => setCertModalData(b)} title="प्रमाणपत्र"
                            style={{ padding: '0.4rem 0.6rem', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '7px', cursor: 'pointer', color: '#1d4ed8' }}>
                            <QrCode size={14} />
                          </button>
                          {isAdmin && b.status !== 'रद्द' && b.status !== 'नवीकृत' && (
                            <button onClick={() => setShowRenewalModal(b)} title="नवीकरण"
                              style={{ padding: '0.4rem 0.6rem', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '7px', cursor: 'pointer', color: '#047857' }}>
                              <RefreshCw size={14} />
                            </button>
                          )}
                          {isAdmin && (
                            <button onClick={() => setShowInspectionModal(b)} title="निरीक्षण थप्नुहोस्"
                              style={{ padding: '0.4rem 0.6rem', background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '7px', cursor: 'pointer', color: '#b45309' }}>
                              <ClipboardCheck size={14} />
                            </button>
                          )}
                          {isAdmin && b.status !== 'निलम्बित' && b.status !== 'रद्द' && (
                            <button
                              onClick={() => {
                                const r = prompt('निलम्बनको कारण प्रविष्ट गर्नुहोस्:');
                                if (r) suspendMutation.mutate({ id: b.id, reason: r });
                              }}
                              title="निलम्बन"
                              style={{ padding: '0.4rem 0.6rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '7px', cursor: 'pointer', color: '#b91c1c' }}>
                              <Ban size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: RENEWAL HISTORY ── */}
      {activeTab === 'renewals' && (
        <div>
          <div style={{ marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
              आर्थिक वर्ष २०८१/०८२ व्यवसाय नवीकरण अभिलेख
            </h2>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>
              वार्षिक व्यवसाय नवीकरण दस्तुर तथा जरिवाना असुलीको विस्तृत विवरण
            </p>
          </div>
          <div style={{
            background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0',
            overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.04)',
          }}>
            <div className="dt-responsive-table-wrapper">
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <tr>
                    {['रसिद नं.', 'नवीकरण मिति', 'दर्ता नं.', 'व्यवसायको नाम', 'वडा', 'आव', 'नवीकरण दस्तुर', 'जरिवाना', 'कुल', 'भुक्तानी माध्यम', 'नवीकरण गर्ने अधिकृत'].map((h) => (
                      <th key={h} style={{ padding: '0.85rem 1rem', color: '#475569', fontWeight: 700, whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {renewals.length === 0 ? (
                    <tr><td colSpan={11} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>नवीकरण अभिलेख उपलब्ध छैन।</td></tr>
                  ) : renewals.map((r) => (
                    <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.8rem 1rem', fontWeight: 700, color: '#1e40af' }}>{r.receiptNo}</td>
                      <td style={{ padding: '0.8rem 1rem', fontWeight: 600 }}>{r.renewalDateBs}</td>
                      <td style={{ padding: '0.8rem 1rem', color: '#334155' }}>{r.registrationNo}</td>
                      <td style={{ padding: '0.8rem 1rem', fontWeight: 700 }}>{r.businessName}</td>
                      <td style={{ padding: '0.8rem 1rem' }}>वडा नं. {r.wardNumber}</td>
                      <td style={{ padding: '0.8rem 1rem' }}>{r.fiscalYear}</td>
                      <td style={{ padding: '0.8rem 1rem', fontWeight: 600, color: '#047857' }}>रु. {r.annualFeeNPR.toLocaleString('ne-NP')}</td>
                      <td style={{ padding: '0.8rem 1rem', color: r.fineNPR > 0 ? '#b91c1c' : '#64748b' }}>
                        {r.fineNPR > 0 ? `रु. ${r.fineNPR.toLocaleString('ne-NP')}` : '—'}
                      </td>
                      <td style={{ padding: '0.8rem 1rem', fontWeight: 800, color: '#1e3a8a' }}>रु. {r.totalPaidNPR.toLocaleString('ne-NP')}</td>
                      <td style={{ padding: '0.8rem 1rem' }}>
                        <span style={{
                          fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.55rem',
                          borderRadius: '6px', background: '#eff6ff', color: '#1d4ed8',
                        }}>{r.paymentGateway}</span>
                      </td>
                      <td style={{ padding: '0.8rem 1rem', color: '#475569' }}>{r.renewedByOfficer}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: INSPECTIONS ── */}
      {activeTab === 'inspections' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>स्थलगत व्यावसायिक निरीक्षण तथा अनुपालन अभिलेख</h2>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                स्थानीय सरकार सञ्चालन ऐन, २०७४ र स्थानीय व्यवसाय कर नियम अनुरुप वार्षिक निरीक्षण
              </p>
            </div>
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.25rem',
          }}>
            {inspections.map((ins) => {
              const isGood = ins.complianceStatus.includes('✅');
              const isWarn = ins.complianceStatus.includes('⚠️');
              return (
                <div key={ins.id} style={{
                  background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0',
                  padding: '1.25rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.04)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <span style={{
                      background: isGood ? '#ecfdf5' : isWarn ? '#fef3c7' : '#fee2e2',
                      color: isGood ? '#047857' : isWarn ? '#b45309' : '#b91c1c',
                      padding: '0.25rem 0.65rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700,
                    }}>{ins.complianceStatus}</span>
                    <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>{ins.inspectionDateBs}</span>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a', marginBottom: '0.25rem' }}>
                    {ins.businessName}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.75rem' }}>
                    {ins.registrationNo} | वडा नं. {ins.wardNumber}
                  </div>
                  <div style={{ fontSize: '0.85rem', lineHeight: '1.6', color: '#334155', marginBottom: '0.75rem' }}>
                    <div><strong>निरीक्षण प्रकार:</strong> {ins.inspectionType}</div>
                    <div><strong>निरीक्षक:</strong> {ins.inspectorName} ({ins.inspectorDesignation})</div>
                    {ins.followUpDateBs && (
                      <div style={{ color: '#b91c1c' }}><strong>फलोअप मिति:</strong> {ins.followUpDateBs}</div>
                    )}
                  </div>
                  <div style={{
                    background: '#f8fafc', borderRadius: '8px', padding: '0.65rem 0.85rem',
                    fontSize: '0.82rem', color: '#475569', borderLeft: `3px solid ${isGood ? '#10b981' : isWarn ? '#f59e0b' : '#ef4444'}`,
                  }}>
                    {ins.remarks}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TAB 4: ANALYTICS ── */}
      {activeTab === 'analytics' && (
        <div>
          <div style={{ marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
              वडागत तथा वर्गगत व्यवसाय वितरण विश्लेषण
            </h2>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>
              वडा १–८ को व्यवसाय दर्ता, पूँजी लगानी, रोजगार तथा राजस्व विश्लेषण
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
            {/* Ward Breakdown */}
            <div style={{
              background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0',
              padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.04)',
            }}>
              <h3 style={{ margin: '0 0 1rem', fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={18} color="#2563eb" /> वडागत व्यवसाय वितरण
              </h3>
              {[1,2,3,4,5,6,7,8].map((w) => {
                const count = businesses.filter((b) => b.wardNumber === w).length;
                const pct = businesses.length > 0 ? Math.round((count / businesses.length) * 100) : 0;
                return (
                  <div key={w} style={{ marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                      <span style={{ fontWeight: 600 }}>वडा नं. {w}</span>
                      <span style={{ color: '#64748b' }}>{count} वटा ({pct}%)</span>
                    </div>
                    <div style={{ background: '#f1f5f9', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ background: '#2563eb', height: '100%', width: `${pct || 3}%`, borderRadius: '4px' }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Fee Schedule Table */}
            <div style={{
              background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0',
              padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.04)',
            }}>
              <h3 style={{ margin: '0 0 1rem', fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Coins size={18} color="#059669" /> पूँजीका आधारमा वार्षिक दस्तुर तालिका
              </h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>पूँजी सीमा</th>
                    <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right', borderBottom: '1px solid #e2e8f0' }}>वार्षिक दस्तुर (रु.)</th>
                    <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right', borderBottom: '1px solid #e2e8f0' }}>दर्ता संख्या</th>
                  </tr>
                </thead>
                <tbody>
                  {ANNUAL_FEE_SCHEDULE.map((row) => {
                    const cnt = businesses.filter((b) => {
                      const fee = calculateAnnualFee(b.capitaInvestmentNPR);
                      return fee === row.fee;
                    }).length;
                    return (
                      <tr key={row.fee} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.55rem 0.75rem', fontWeight: 600 }}>{row.label}</td>
                        <td style={{ padding: '0.55rem 0.75rem', textAlign: 'right', color: '#047857', fontWeight: 700 }}>
                          रु. {row.fee.toLocaleString('ne-NP')}
                        </td>
                        <td style={{ padding: '0.55rem 0.75rem', textAlign: 'right' }}>
                          <span style={{
                            background: '#eff6ff', color: '#1d4ed8',
                            padding: '0.15rem 0.5rem', borderRadius: '12px', fontWeight: 700, fontSize: '0.8rem',
                          }}>{cnt} वटा</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Category Cards */}
            <div style={{
              background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0',
              padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.04)',
              gridColumn: '1 / -1',
            }}>
              <h3 style={{ margin: '0 0 1rem', fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Layers size={18} color="#7c3aed" /> व्यवसायका वर्ग अनुसार वितरण
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.85rem' }}>
                {BUSINESS_CATEGORIES.map((cat) => {
                  const count = businesses.filter((b) => b.category === cat).length;
                  const totalCapital = businesses.filter((b) => b.category === cat).reduce((s, b) => s + b.capitaInvestmentNPR, 0);
                  return (
                    <div key={cat} style={{
                      padding: '0.85rem 1rem', background: '#f8fafc',
                      borderRadius: '10px', border: '1px solid #e2e8f0',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1e293b' }}>{cat}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.1rem' }}>
                          पूँजी: रु. {totalCapital.toLocaleString('ne-NP')}
                        </div>
                      </div>
                      <span style={{
                        background: '#eff6ff', color: '#1d4ed8', padding: '0.2rem 0.6rem',
                        borderRadius: '12px', fontWeight: 800, fontSize: '0.85rem',
                      }}>{count} वटा</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════ MODALS ══════════════════ */}

      {/* MODAL 1: REGISTER NEW BUSINESS */}
      {showRegisterModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem',
        }}>
          <div style={{
            background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '740px',
            maxHeight: '92vh', overflowY: 'auto', padding: '1.75rem',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1.5px solid #f1f5f9', paddingBottom: '0.85rem' }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: '#1e3a8a' }}>
                  नयाँ व्यवसाय दर्ता फारम
                </h2>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                  स्थानीय सरकार सञ्चालन ऐन, २०७४ अनुसूची ८ अनुरुप
                </p>
              </div>
              <button onClick={() => setShowRegisterModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={22} />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(formData); }}>
              {/* Row 1: Business Names */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={LABEL_STYLE}>व्यवसायको नाम (नेपालीमा)*</label>
                  <input type="text" required value={formData.businessName} onChange={(e) => setFormData({ ...formData, businessName: e.target.value })} placeholder="उदा: थाङपालधाप किराना स्टोर" style={INPUT_STYLE} />
                </div>
                <div>
                  <label style={LABEL_STYLE}>Business Name (English)</label>
                  <input type="text" value={formData.businessNameEn} onChange={(e) => setFormData({ ...formData, businessNameEn: e.target.value.toUpperCase() })} placeholder="THANGPALDHAP KIRANA STORE" style={INPUT_STYLE} />
                </div>
              </div>

              {/* Row 2: Category */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={LABEL_STYLE}>व्यवसायको वर्ग (Business Category)*</label>
                <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} style={{ ...INPUT_STYLE, fontWeight: 600, color: '#1e3a8a' }}>
                  {BUSINESS_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Row 3: Owner Details */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={LABEL_STYLE}>व्यवसाय स्वामीको नाम*</label>
                  <input type="text" required value={formData.proprietorName} onChange={(e) => setFormData({ ...formData, proprietorName: e.target.value })} placeholder="उदा: राम बहादुर तामाङ" style={INPUT_STYLE} />
                </div>
                <div>
                  <label style={LABEL_STYLE}>सम्पर्क फोन</label>
                  <input type="text" value={formData.proprietorPhone} onChange={(e) => setFormData({ ...formData, proprietorPhone: e.target.value })} placeholder="९८४१०००००" style={INPUT_STYLE} />
                </div>
                <div>
                  <label style={LABEL_STYLE}>नागरिकता नम्बर*</label>
                  <input type="text" required value={formData.proprietorCitizenshipNo} onChange={(e) => setFormData({ ...formData, proprietorCitizenshipNo: e.target.value })} placeholder="२३-०१-७५-०५५१२" style={INPUT_STYLE} />
                </div>
              </div>

              {/* Row 4: PAN, VAT */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={LABEL_STYLE}>PAN नम्बर (अनिवार्य यदि करयोग्य)</label>
                  <input type="text" value={formData.panNumber} onChange={(e) => setFormData({ ...formData, panNumber: e.target.value })} placeholder="५०२४१७८" style={INPUT_STYLE} />
                </div>
                <div>
                  <label style={LABEL_STYLE}>VAT दर्ता नम्बर (लागू भएमा)</label>
                  <input type="text" value={formData.vatNumber} onChange={(e) => setFormData({ ...formData, vatNumber: e.target.value })} placeholder="VAT-NP-2024-..." style={INPUT_STYLE} />
                </div>
              </div>

              {/* Row 5: Ward, Tole */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={LABEL_STYLE}>वडा नम्बर*</label>
                  <select value={formData.wardNumber} onChange={(e) => setFormData({ ...formData, wardNumber: Number(e.target.value) })} style={INPUT_STYLE}>
                    {[1,2,3,4,5,6,7,8].map((w) => <option key={w} value={w}>वडा नं. {w}</option>)}
                  </select>
                </div>
                <div>
                  <label style={LABEL_STYLE}>गाउँ / टोलको नाम</label>
                  <input type="text" value={formData.tole} onChange={(e) => setFormData({ ...formData, tole: e.target.value })} placeholder="उदा: भोटेनाम्लाङ बजार" style={INPUT_STYLE} />
                </div>
                <div>
                  <label style={LABEL_STYLE}>पर्यावरणीय वर्ग</label>
                  <select value={formData.environmentalStatus} onChange={(e) => setFormData({ ...formData, environmentalStatus: e.target.value as Business['environmentalStatus'] })} style={INPUT_STYLE}>
                    <option value="प्रभाव नगर्ने (Green)">प्रभाव नगर्ने (Green)</option>
                    <option value="अनुमति आवश्यक (Amber)">अनुमति आवश्यक (Amber)</option>
                    <option value="EIA अनिवार्य (Red)">EIA अनिवार्य (Red)</option>
                  </select>
                </div>
              </div>

              {/* Row 6: Capital, Employees */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={LABEL_STYLE}>पूँजी लगानी (रु.)*</label>
                  <input type="number" required min={0} value={formData.capitaInvestmentNPR}
                    onChange={(e) => setFormData({ ...formData, capitaInvestmentNPR: Number(e.target.value) })}
                    style={INPUT_STYLE} />
                </div>
                <div>
                  <label style={LABEL_STYLE}>कुल कर्मचारी संख्या</label>
                  <input type="number" min={0} value={formData.employeeCount} onChange={(e) => setFormData({ ...formData, employeeCount: Number(e.target.value) })} style={INPUT_STYLE} />
                </div>
                <div>
                  <label style={LABEL_STYLE}>महिला कर्मचारी संख्या</label>
                  <input type="number" min={0} value={formData.femaleEmployeeCount} onChange={(e) => setFormData({ ...formData, femaleEmployeeCount: Number(e.target.value) })} style={INPUT_STYLE} />
                </div>
              </div>

              {/* Fee Preview Banner */}
              <div style={{
                background: 'linear-gradient(135deg, #ecfdf5, #f0fdf4)',
                border: '1.5px solid #a7f3d0', borderRadius: '10px',
                padding: '1rem 1.25rem', marginBottom: '1.25rem',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#047857', fontWeight: 600 }}>
                    स्वतः गणना गरिएको वार्षिक व्यवसाय दर्ता दस्तुर
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    पूँजी रु. {Number(formData.capitaInvestmentNPR).toLocaleString('ne-NP')} का आधारमा
                  </div>
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#047857' }}>
                  रु. {liveFee.toLocaleString('ne-NP')}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1.5px solid #f1f5f9', paddingTop: '1rem' }}>
                <button type="button" onClick={() => setShowRegisterModal(false)}
                  style={{ padding: '0.65rem 1.25rem', background: '#f1f5f9', border: '1.5px solid #cbd5e1', borderRadius: '8px', color: '#475569', fontWeight: 600, cursor: 'pointer' }}>
                  रद्द गर्नुहोस्
                </button>
                <button type="submit" disabled={createMutation.isPending}
                  style={{ padding: '0.65rem 1.75rem', background: '#10b981', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                  {createMutation.isPending ? 'दर्ता हुँदैछ...' : 'व्यवसाय दर्ता सुरक्षित गर्नुहोस्'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: RENEWAL CONFIRM */}
      {showRenewalModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem',
        }}>
          <div style={{
            background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '520px',
            padding: '1.75rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#1e3a8a' }}>
                व्यवसाय वार्षिक नवीकरण (Renewal)
              </h3>
              <button onClick={() => setShowRenewalModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '1rem', marginBottom: '1.25rem', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.875rem', lineHeight: '1.7' }}>
                <div><strong>दर्ता नं.:</strong> <span style={{ color: '#1e40af', fontWeight: 700 }}>{showRenewalModal.registrationNo}</span></div>
                <div><strong>व्यवसायको नाम:</strong> {showRenewalModal.businessName}</div>
                <div><strong>स्वामी:</strong> {showRenewalModal.proprietorName}</div>
                <div><strong>वडा नं.:</strong> {showRenewalModal.wardNumber}</div>
                <div><strong>नवीकरण दस्तुर:</strong> <span style={{ color: '#047857', fontWeight: 700 }}>रु. {showRenewalModal.annualFeeNPR.toLocaleString('ne-NP')}</span></div>
                {showRenewalModal.fineNPR && <div style={{ color: '#b91c1c' }}><strong>जरिवाना:</strong> रु. {showRenewalModal.fineNPR}</div>}
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={LABEL_STYLE}>नवीकरण गर्ने अधिकृतको नाम</label>
              <input type="text" value={renewalForm.officerName} onChange={(e) => setRenewalForm({ ...renewalForm, officerName: e.target.value })} style={INPUT_STYLE} />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={LABEL_STYLE}>भुक्तानी माध्यम</label>
              <select value={renewalForm.paymentGateway} onChange={(e) => setRenewalForm({ ...renewalForm, paymentGateway: e.target.value })} style={INPUT_STYLE}>
                <option value="FONEPAY">Fonepay (Nepal QR)</option>
                <option value="ESEWA">eSewa</option>
                <option value="KHALTI">Khalti</option>
                <option value="CONNECTIPS">ConnectIPS</option>
                <option value="CASH">नगद (Cash)</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button onClick={() => setShowRenewalModal(null)}
                style={{ padding: '0.6rem 1.25rem', background: '#f1f5f9', border: '1.5px solid #cbd5e1', borderRadius: '8px', color: '#475569', fontWeight: 600, cursor: 'pointer' }}>
                रद्द गर्नुहोस्
              </button>
              <button
                onClick={() => renewMutation.mutate({ id: showRenewalModal.id, officer: renewalForm.officerName })}
                disabled={renewMutation.isPending}
                style={{ padding: '0.6rem 1.5rem', background: '#10b981', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                {renewMutation.isPending ? 'नवीकरण हुँदैछ...' : 'नवीकरण स्वीकृत गर्नुहोस्'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: DIGITAL BUSINESS CERTIFICATE */}
      {certModalData && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem',
        }}>
          <div style={{
            background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '600px',
            padding: '1.75rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#1e3a8a' }}>
                ई-व्यापार दर्ता प्रमाणपत्र (Digital Business Certificate)
              </h3>
              <button onClick={() => setCertModalData(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            {/* Printable Certificate */}
            <div style={{
              border: '2px solid #1e3a8a', borderRadius: '12px', padding: '1.5rem',
              background: 'linear-gradient(180deg, #fffbeb 0%, #f0f7ff 100%)',
            }}>
              <div style={{ textAlign: 'center', marginBottom: '1rem', borderBottom: '1.5px solid #1e3a8a', paddingBottom: '0.75rem' }}>
                <div style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: 800 }}>नेपाल सरकार | स्थानीय सरकार</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#1e3a8a', margin: '0.15rem 0' }}>
                  पाँचपोखरी थाङपाल गाउँ कार्यपालिकाको कार्यालय
                </div>
                <div style={{ fontSize: '0.8rem', color: '#475569' }}>राजस्व तथा व्यवसाय दर्ता शाखा, थाङपालधाप, सिन्धुपाल्चोक</div>
                <div style={{
                  display: 'inline-block', background: '#1e3a8a', color: '#fff',
                  fontSize: '0.78rem', fontWeight: 800, padding: '0.2rem 1rem', borderRadius: '20px', marginTop: '0.4rem',
                }}>
                  ई-व्यापार दर्ता प्रमाणपत्र (e-Business Registration Certificate)
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px', gap: '1rem' }}>
                <div style={{ fontSize: '0.875rem', lineHeight: '1.75', color: '#1e293b' }}>
                  <div><strong>दर्ता नम्बर:</strong> <span style={{ color: '#1e40af', fontWeight: 800 }}>{certModalData.registrationNo}</span></div>
                  <div><strong>व्यवसायको नाम:</strong> {certModalData.businessName}</div>
                  {certModalData.businessNameEn && <div style={{ fontSize: '0.78rem', color: '#475569' }}>{certModalData.businessNameEn}</div>}
                  <div><strong>व्यवसाय स्वामी:</strong> {certModalData.proprietorName}</div>
                  <div><strong>नागरिकता नं.:</strong> {certModalData.proprietorCitizenshipNo || '-'}</div>
                  {certModalData.panNumber && <div><strong>PAN:</strong> {certModalData.panNumber}</div>}
                  <div><strong>व्यवसायको वर्ग:</strong> <span style={{ color: '#0369a1', fontWeight: 700 }}>{certModalData.category}</span></div>
                  <div><strong>स्थान:</strong> वडा नं. {certModalData.wardNumber}, {certModalData.tole || 'पाँचपोखरी थाङपाल'}</div>
                  <div><strong>पूँजी लगानी:</strong> रु. {Number(certModalData.capitaInvestmentNPR).toLocaleString('ne-NP')}</div>
                  <div><strong>दर्ता मिति:</strong> {certModalData.registrationDateBs}</div>
                  <div><strong>म्याद सम्म:</strong> {certModalData.renewalDueDateBs}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fff', border: '1.5px solid #cbd5e1', borderRadius: '10px', padding: '0.5rem' }}>
                  <QrCode size={72} color="#1e3a8a" />
                  <span style={{ fontSize: '0.6rem', color: '#64748b', marginTop: '0.25rem', textAlign: 'center', fontWeight: 700 }}>
                    Digital QR Verified
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px dashed #cbd5e1', fontSize: '0.78rem' }}>
                <div>
                  अवस्था: <strong style={{ color: certModalData.status === 'नवीकृत' ? '#047857' : '#b45309' }}>{certModalData.status}</strong><br />
                  {certModalData.lastReceiptNo && `रसिद नं.: ${certModalData.lastReceiptNo}`}
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ borderBottom: '1px solid #475569', width: '130px', marginBottom: '0.2rem' }} />
                  प्रमुख प्रशासकीय अधिकृत
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
              <button onClick={() => setCertModalData(null)}
                style={{ padding: '0.55rem 1.25rem', background: '#f1f5f9', border: '1.5px solid #cbd5e1', borderRadius: '8px', color: '#475569', fontWeight: 600, cursor: 'pointer' }}>
                बन्द गर्नुहोस्
              </button>
              <button onClick={() => window.print()}
                style={{ padding: '0.55rem 1.5rem', background: '#1e3a8a', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Printer size={15} /> प्रमाणपत्र प्रिन्ट
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: INSPECTION RECORD */}
      {showInspectionModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem',
        }}>
          <div style={{
            background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '560px',
            padding: '1.75rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#1e3a8a' }}>
                स्थलगत व्यावसायिक निरीक्षण दर्ता
              </h3>
              <button onClick={() => setShowInspectionModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '0.85rem', marginBottom: '1.25rem', border: '1px solid #e2e8f0', fontSize: '0.875rem' }}>
              <strong>{showInspectionModal.businessName}</strong> | {showInspectionModal.registrationNo} | वडा नं. {showInspectionModal.wardNumber}
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              inspectionMutation.mutate({
                businessId: showInspectionModal.id,
                registrationNo: showInspectionModal.registrationNo,
                businessName: showInspectionModal.businessName,
                wardNumber: showInspectionModal.wardNumber,
                ...inspectionForm,
              });
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={LABEL_STYLE}>निरीक्षकको नाम*</label>
                  <input type="text" required value={inspectionForm.inspectorName} onChange={(e) => setInspectionForm({ ...inspectionForm, inspectorName: e.target.value })} placeholder="उदा: कमल थापा" style={INPUT_STYLE} />
                </div>
                <div>
                  <label style={LABEL_STYLE}>पदनाम</label>
                  <select value={inspectionForm.inspectorDesignation} onChange={(e) => setInspectionForm({ ...inspectionForm, inspectorDesignation: e.target.value })} style={INPUT_STYLE}>
                    <option>राजस्व निरीक्षक</option>
                    <option>स्वास्थ्य निरीक्षक</option>
                    <option>उद्योग निरीक्षक</option>
                    <option>वडा सचिव</option>
                    <option>प्र.प्र.अ.</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={LABEL_STYLE}>निरीक्षण प्रकार</label>
                  <select value={inspectionForm.inspectionType} onChange={(e) => setInspectionForm({ ...inspectionForm, inspectionType: e.target.value as BusinessInspectionRecord['inspectionType'] })} style={INPUT_STYLE}>
                    <option value="नियमित वार्षिक">नियमित वार्षिक</option>
                    <option value="विशेष तथा उजुरीमा">विशेष तथा उजुरीमा</option>
                    <option value="पुन: जाँच">पुन: जाँच</option>
                    <option value="पर्यावरण निरीक्षण">पर्यावरण निरीक्षण</option>
                  </select>
                </div>
                <div>
                  <label style={LABEL_STYLE}>अनुपालन अवस्था</label>
                  <select value={inspectionForm.complianceStatus} onChange={(e) => setInspectionForm({ ...inspectionForm, complianceStatus: e.target.value as BusinessInspectionRecord['complianceStatus'] })} style={INPUT_STYLE}>
                    <option value="अनुपालन सम्पन्न ✅">अनुपालन सम्पन्न ✅</option>
                    <option value="सुधारको सुचना दिइएको ⚠️">सुधारको सुचना दिइएको ⚠️</option>
                    <option value="कारवाहीको लागि पठाइएको 🔴">कारवाहीको लागि पठाइएको 🔴</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={LABEL_STYLE}>निरीक्षण कैफियत तथा सुझाव*</label>
                <textarea required rows={3} value={inspectionForm.remarks} onChange={(e) => setInspectionForm({ ...inspectionForm, remarks: e.target.value })} style={{ ...INPUT_STYLE, resize: 'vertical' }} placeholder="निरीक्षण प्रतिवेदन संक्षेपमा लेख्नुहोस्..." />
              </div>

              {inspectionForm.complianceStatus !== 'अनुपालन सम्पन्न ✅' && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={LABEL_STYLE}>फलोअप मिति (वि.सं.)</label>
                  <input type="text" value={inspectionForm.followUpDateBs} onChange={(e) => setInspectionForm({ ...inspectionForm, followUpDateBs: e.target.value })} placeholder="२०८२-०२-३०" style={INPUT_STYLE} />
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" onClick={() => setShowInspectionModal(null)}
                  style={{ padding: '0.6rem 1.25rem', background: '#f1f5f9', border: '1.5px solid #cbd5e1', borderRadius: '8px', color: '#475569', fontWeight: 600, cursor: 'pointer' }}>
                  रद्द
                </button>
                <button type="submit" disabled={inspectionMutation.isPending}
                  style={{ padding: '0.6rem 1.5rem', background: '#d97706', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                  {inspectionMutation.isPending ? 'सुरक्षित हुँदैछ...' : 'निरीक्षण अभिलेख सुरक्षित गर्नुहोस्'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: DETAIL VIEW */}
      {detailModalData && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem',
        }}>
          <div style={{
            background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '640px',
            padding: '1.75rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#1e3a8a' }}>{detailModalData.businessName}</h3>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>दर्ता नं.: {detailModalData.registrationNo}</span>
              </div>
              <button onClick={() => setDetailModalData(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', fontSize: '0.875rem', lineHeight: '1.8' }}>
              <div><strong>व्यवसाय स्वामी:</strong> {detailModalData.proprietorName}</div>
              <div><strong>सम्पर्क:</strong> {detailModalData.proprietorPhone || '-'}</div>
              <div><strong>नागरिकता:</strong> {detailModalData.proprietorCitizenshipNo || '-'}</div>
              <div><strong>PAN नं.:</strong> {detailModalData.panNumber || '-'}</div>
              <div><strong>VAT:</strong> {detailModalData.vatNumber || '-'}</div>
              <div><strong>वडा / टोल:</strong> वडा नं. {detailModalData.wardNumber} | {detailModalData.tole || '-'}</div>
              <div><strong>वर्ग:</strong> {detailModalData.category}</div>
              <div><strong>पूँजी:</strong> रु. {Number(detailModalData.capitaInvestmentNPR).toLocaleString('ne-NP')}</div>
              <div><strong>कुल कर्मचारी:</strong> {detailModalData.employeeCount || '-'} जना</div>
              <div><strong>महिला कर्मचारी:</strong> {detailModalData.femaleEmployeeCount || '-'} जना</div>
              <div><strong>दर्ता मिति:</strong> {detailModalData.registrationDateBs}</div>
              <div><strong>अन्तिम नवीकरण:</strong> {detailModalData.lastRenewalDateBs || '-'}</div>
              <div><strong>म्याद मिति:</strong> {detailModalData.renewalDueDateBs}</div>
              <div><strong>वार्षिक दस्तुर:</strong> रु. {detailModalData.annualFeeNPR.toLocaleString('ne-NP')}</div>
              <div><strong>अवस्था:</strong> {detailModalData.status}</div>
              <div><strong>पर्यावरण वर्ग:</strong> {detailModalData.environmentalStatus || '-'}</div>
              {detailModalData.inspectionOfficer && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <strong>अन्तिम निरीक्षण ({detailModalData.inspectionDateBs}):</strong>{' '}
                  {detailModalData.inspectionOfficer}
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>{detailModalData.inspectionRemarks}</div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
              <button onClick={() => setDetailModalData(null)}
                style={{ padding: '0.6rem 1.25rem', background: '#f1f5f9', border: '1.5px solid #cbd5e1', borderRadius: '8px', color: '#475569', fontWeight: 600, cursor: 'pointer' }}>
                बन्द गर्नुहोस्
              </button>
              <button onClick={() => { const b = detailModalData; setDetailModalData(null); setCertModalData(b); }}
                style={{ padding: '0.6rem 1.25rem', background: '#1e3a8a', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <QrCode size={15} /> ई-प्रमाणपत्र
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessRegistrationPage;
