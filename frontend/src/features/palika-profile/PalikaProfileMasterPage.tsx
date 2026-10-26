import React, { useState, useEffect } from 'react';
import { useSearchParams, useLocation, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Building2,
  Users,
  Home,
  PieChart,
  BarChart3,
  MapPin,
  Map,
  Printer,
  FileText,
  Compass,
  Layers,
  Sparkles,
  RefreshCw,
  Award,
  TrendingUp,
  Landmark,
  ShieldCheck,
  Edit3
} from 'lucide-react';
import { useTenant } from '../../context/TenantContext';
import { municipalityApi } from '../../api/municipality';
import { toNepaliDigits } from '../../utils/nepaliCalendar';
import { PalikaOverviewTab } from './components/PalikaOverviewTab';
import { WardsManagementTab } from './components/WardsManagementTab';
import { DemographicsInfographicsTab } from './components/DemographicsInfographicsTab';
import { HouseholdMatrixTab } from './components/HouseholdMatrixTab';
import { SectoralInfographicsTab } from './components/SectoralInfographicsTab';
import { PalikaFactsheetModal } from './components/PalikaFactsheetModal';
import { PalikaProfileEditModal } from './components/PalikaProfileEditModal';
import './palika-profile.css';

export const PalikaProfileMasterPage: React.FC = () => {
  const { settings, tenantId } = useTenant();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/app');
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');

  const [activeTab, setActiveTab] = useState<
    'overview' | 'wards' | 'demographics' | 'sectoral'
  >('overview');

  const [showFactsheetModal, setShowFactsheetModal] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Central Profile Query - Single Source of Truth
  const { data: profile } = useQuery({
    queryKey: ['municipality-profile', tenantId],
    queryFn: () => municipalityApi.getProfile(),
  });

  const isGaushala = tenantId === 'gaushala' || tenantId === 'gaushalamun' || (settings?.palika_name || '').includes('गौशाला');
  const palikaName = profile?.nameNp || profile?.name || settings?.palika_name || (isGaushala ? 'गौशाला नगरपालिका' : 'पाँचपोखरी थाङपाल गाउँपालिका');
  const district = profile?.district || settings?.district || (isGaushala ? 'महोत्तरी' : 'सिन्धुपाल्चोक');
  const province = profile?.province || settings?.province || (isGaushala ? 'मधेश प्रदेश' : 'बागमती प्रदेश');
  const totalWards = profile?.totalWards || (isGaushala ? 12 : 8);
  const areaSqKm = profile?.totalAreaSqKm || (isGaushala ? 144.73 : 187.29);
  const headquarters = profile?.headquarters || (isGaushala ? 'गौशाला बजार' : 'थाङपालधाप');
  const totalPopVal = profile?.totalPopulation || profile?.demographics?.totalPopulation || (isGaushala ? 72481 : 20540);
  const malePopVal = profile?.demographics?.male || profile?.malePopulation || (isGaushala ? 36250 : 9950);
  const femalePopVal = profile?.demographics?.female || profile?.femalePopulation || (isGaushala ? 36231 : 10590);
  const totalHhVal = profile?.totalHouseholds || profile?.demographics?.households || (isGaushala ? 14446 : 5805);
  const totalPopulation = toNepaliDigits(totalPopVal);
  const malePopulation = toNepaliDigits(malePopVal);
  const femalePopulation = toNepaliDigits(femalePopVal);
  const totalHouseholds = toNepaliDigits(totalHhVal);
  const annualBudget = profile?.annualBudget || (isGaushala ? 'रु. ७४.५० करोड' : 'रु. ५८.४५ करोड');
  const internalRevenue = profile?.internalRevenue || (isGaushala ? 'रु. ४.२५ करोड' : 'रु. २.८ करोड');

  // Sync tab with URL query parameter or path
  useEffect(() => {
    if (tabParam) {
      if (tabParam === 'wards') setActiveTab('wards');
      else if (tabParam === 'demographics') setActiveTab('demographics');
      else if (tabParam === 'sectoral') setActiveTab('sectoral');
      else if (tabParam === 'overview') setActiveTab('overview');
    } else {
      if (location.pathname.includes('/wards')) setActiveTab('wards');
      else if (location.pathname.includes('/demographics')) setActiveTab('demographics');
    }
  }, [tabParam, location.pathname]);

  const handleTabChange = (tab: 'overview' | 'wards' | 'demographics' | 'sectoral') => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  return (
    <div className="gov-content-wrapper" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.35rem' }}>
      {/* ── COMMAND CENTER HERO BANNER ──────────────────────────────────────── */}
      <div className="palika-hero-banner">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', position: 'relative', zIndex: 2 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.55rem', flexWrap: 'wrap' }}>
              <span className="palika-telemetry-badge">
                <span className="palika-pulse-dot"></span>
                म्युनिसिपल डिजिटल ट्विन्स प्रोफाइल हब
              </span>
              <span style={{ fontSize: '0.78rem', color: '#a7f3d0', fontWeight: 600 }}>
                नेपाल सरकार • {palikaName}
              </span>
              <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.14)', color: '#ffffff' }}>
                {district}, {province}
              </span>
            </div>

            <h1 style={{ fontSize: '2.05rem', fontWeight: 900, margin: 0, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.85rem', color: '#ffffff' }}>
              <Building2 size={38} className="text-blue-300" />
              पालिका डिजिटल प्रोफाइल तथा एकीकृत तथ्याङ्क केन्द्र
            </h1>
            <p style={{ fontSize: '0.94rem', color: '#e0f2fe', margin: '0.5rem 0 0', maxWidth: '860px', lineHeight: 1.55 }}>
              पालिका चिनारी, वडा १-{totalWards} प्रोफाइल, जनसांख्यिक उमेर-पिरामिड, {totalHouseholds} घरधुरी म्याट्रिक्स र सबै विषयगत शाखाहरू (कृषि, स्वास्थ्य, शिक्षा, राजस्व, पूर्वाधार, पर्यटन) को एकीकृत इन्फोग्राफिक्स
            </p>
          </div>

          {/* Quick Action Buttons inside Hero */}
          <div style={{ display: 'flex', gap: '0.55rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {isAdmin && (
              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.6rem 1.15rem',
                  borderRadius: '9px',
                  backgroundColor: '#3b82f6',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)',
                  transition: 'all 0.2s ease',
                }}
              >
                <Edit3 size={16} />
                <span>पालिका विवरण सम्पादन</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowFactsheetModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.6rem 1.15rem',
                borderRadius: '9px',
                backgroundColor: '#10b981',
                color: '#ffffff',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.86rem',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
              }}
            >
              <Printer size={16} />
              <span>डिजिटल तथ्यपत्र (Factsheet)</span>
            </button>

            <Link
              to="/progress-reports"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.6rem 1.15rem',
                borderRadius: '9px',
                backgroundColor: '#8b5cf6',
                color: '#ffffff',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.86rem',
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(139, 92, 246, 0.4)',
              }}
            >
              <TrendingUp size={16} />
              <span>प्रगति प्रतिवेदन</span>
            </Link>

            <Link
              to="/public-report"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.6rem 1.15rem',
                borderRadius: '9px',
                backgroundColor: '#0284c7',
                color: '#ffffff',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.86rem',
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)',
              }}
            >
              <FileText size={16} />
              <span>एक-पृष्ठ प्रतिवेदन</span>
            </Link>

            <Link
              to="/gis-map"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.6rem 1.1rem',
                borderRadius: '9px',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                backdropFilter: 'blur(8px)',
                fontWeight: 700,
                fontSize: '0.86rem',
                textDecoration: 'none',
              }}
            >
              <Map size={16} />
              <span>GIS डिजिटल नक्सा</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── 4 EXECUTIVE GLOWING KPI CARDS ──────────────────────────────────── */}
      <div className="palika-kpi-grid">
        {/* KPI 1 */}
        <div className="palika-kpi-card" style={{ '--kpi-accent': '#0f4c81' } as any}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b' }}>कुल क्षेत्रफल तथा प्रशासनिक वडा</div>
              <div className="palika-kpi-val" style={{ marginTop: '4px', color: '#0f4c81' }}>
                {areaSqKm} <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>व.कि.मि.</span>
              </div>
            </div>
            <div className="palika-kpi-icon-wrap" style={{ '--icon-bg': '#eff6ff', '--icon-color': '#0f4c81', '--icon-shadow': 'rgba(15, 76, 129, 0.2)' } as any}>
              <MapPin size={24} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '0.85rem', fontSize: '0.78rem' }}>
            <span className="agri-badge agri-badge-info">{totalWards} वटा वडाहरू</span>
            <span style={{ color: '#64748b' }}>केन्द्र: {headquarters}</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="palika-kpi-card" style={{ '--kpi-accent': '#0284c7' } as any}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b' }}>कुल जनसंख्या (जनगणना २०७८)</div>
              <div className="palika-kpi-val" style={{ marginTop: '4px', color: '#0284c7' }}>
                {totalPopulation} <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>नागरिक</span>
              </div>
            </div>
            <div className="palika-kpi-icon-wrap" style={{ '--icon-bg': '#e0f2fe', '--icon-color': '#0284c7', '--icon-shadow': 'rgba(2, 132, 199, 0.2)' } as any}>
              <Users size={24} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '0.85rem', fontSize: '0.78rem' }}>
            <span style={{ color: '#64748b' }}>पुरुष: {malePopulation} | महिला: {femalePopulation}</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="palika-kpi-card" style={{ '--kpi-accent': '#10b981' } as any}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b' }}>डिजिटल घरधुरी म्याट्रिक्स</div>
              <div className="palika-kpi-val" style={{ marginTop: '4px', color: '#047857' }}>
                {totalHouseholds} <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>घरधुरी</span>
              </div>
            </div>
            <div className="palika-kpi-icon-wrap" style={{ '--icon-bg': '#ecfdf5', '--icon-color': '#047857', '--icon-shadow': 'rgba(16, 185, 129, 0.2)' } as any}>
              <Home size={24} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '0.85rem', fontSize: '0.78rem' }}>
            <span className="agri-badge agri-badge-success">८४.२% धारा पहुँच</span>
            <span style={{ color: '#64748b' }}>९६.४% विद्युत पहुँच</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="palika-kpi-card" style={{ '--kpi-accent': '#f59e0b' } as any}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b' }}>वार्षिक बजेट तथा राजस्व</div>
              <div className="palika-kpi-val" style={{ marginTop: '4px', color: '#b45309' }}>
                {annualBudget}
              </div>
            </div>
            <div className="palika-kpi-icon-wrap" style={{ '--icon-bg': '#fef3c7', '--icon-color': '#d97706', '--icon-shadow': 'rgba(245, 158, 11, 0.2)' } as any}>
              <TrendingUp size={24} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '0.85rem', fontSize: '0.78rem' }}>
            <span className="agri-badge agri-badge-warning">आ.व. २०८१/८२</span>
            <span style={{ color: '#64748b' }}>आन्तरिक: {internalRevenue}</span>
          </div>
        </div>
      </div>

      {/* ── UNIFIED 5-SUBSYSTEM TAB SWITCHER ───────────────────────────────── */}
      <div className="palika-tab-ribbon" style={{ marginBottom: '0.5rem' }}>
        {[
          { id: 'overview', label: 'संक्षिप्त चिनारी तथा प्रशासन', icon: <Building2 size={16} /> },
          { id: 'wards', label: 'वडा व्यवस्थापन तथा प्रोफाइल', badge: `वडा १-${totalWards}`, icon: <MapPin size={16} /> },
          { id: 'demographics', label: 'जनसांख्यिकी तथा उमेर-पिरामिड', badge: `${totalPopulation}`, icon: <PieChart size={16} /> },
          { id: 'sectoral', label: 'बहु-क्षेत्रीय इन्फोग्राफिक्स म्याट्रिक्स', badge: '८ शाखा', icon: <BarChart3 size={16} />, highlight: true },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id as any)}
              className={`palika-tab-pill ${isActive ? (tab.highlight ? 'active primary' : 'active primary') : ''}`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge && <span className="palika-tab-badge">{tab.badge}</span>}
            </button>
          );
        })}
      </div>

      {/* ── ACTIVE TAB CONTENT ──────────────────────────────────────────────── */}
      {activeTab === 'overview' && <PalikaOverviewTab />}
      {activeTab === 'wards' && <WardsManagementTab />}
      {activeTab === 'demographics' && <DemographicsInfographicsTab profile={profile} />}
      {activeTab === 'sectoral' && <SectoralInfographicsTab />}

      {/* ── FACTSHEET PRINT MODAL ──────────────────────────────────────────── */}
      <PalikaFactsheetModal
        isOpen={showFactsheetModal}
        onClose={() => setShowFactsheetModal(false)}
      />

      {/* ── PALIKA PROFILE EDIT MODAL ──────────────────────────────────────── */}
      <PalikaProfileEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialData={profile}
      />
    </div>
  );
};
