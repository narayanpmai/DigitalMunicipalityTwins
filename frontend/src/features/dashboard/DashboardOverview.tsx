import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useTenant } from '../../context/TenantContext';
import { useFiscalYear } from '../../context/FiscalYearContext';
import {
  Activity,
  Layers,
  Users,
  CheckCircle,
  FileCheck2,
  TrendingUp,
  Shield,
  Building2,
  Sprout,
  HeartPulse,
  GraduationCap,
  Compass,
  AlertTriangle,
  FolderGit2,
  Database,
  Inbox,
  FileText,
  Briefcase,
  Scale,
  HeartHandshake,
  BookOpen,
  HardHat,
  Banknote,
  Siren,
  UserCheck,
  ShoppingCart,
  Baby,
  Loader2,
  RefreshCw,
  Home,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Landmark,
  BarChart3,
  Edit3,
  Tractor,
  Leaf,
  MountainSnow,
  BusFront,
  Droplets,
  Zap,
  ShieldAlert,
  Sparkles,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { municipalityApi } from '../../api/municipality';
import { HouseholdRegistryTab } from '../citizen-portal/components/HouseholdRegistryTab';
import { PredictiveAnalytics } from '../../components/analytics/PredictiveAnalytics';
import { MunicipalGISMap } from '../../components/maps/MunicipalGISMap';
import { ThematicPillarsMatrix } from './components/ThematicPillarsMatrix';
import ssisFallbackData from '../../data/ssis_vital_report.json';
import '../../pages/public/ExecutiveDashboard.css';

// ── Devanagari / Nepali Digits Formatter ──────────────────────────────────────
export const toNepaliDigits = (val: number | string | undefined | null): string => {
  if (val === undefined || val === null) return '०';
  const nepaliDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  const formatted = typeof val === 'number'
    ? val.toLocaleString('en-IN')
    : String(val);
  return formatted.replace(/[0-9]/g, (d) => nepaliDigits[parseInt(d, 10)] ?? d);
};

// ── Compute SSIS totals from bundled JSON ─────────────────────────────────────
const _ssisSummary = ssisFallbackData.summary;
const _ssisWards = ssisFallbackData.wards;

// ── Default Seeded Baseline Counts (Aligned with Municipality Profile SSoT) ──
const DEFAULT_STATS: Record<string, any> = {
  totalCitizens: 20540,
  totalPopulation: 20540,
  malePopulation: 9950,
  femalePopulation: 10590,
  totalHouseholds: 5805,
  totalGpsHouses: 5357,
  highRiskHouses: 142,
  highRiskSettlements: 4,
  totalShelters: 8,
  totalShelterCapacity: 1640,
  literacyRate: 72.4,
  maleLiteracyRate: 81.4,
  femaleLiteracyRate: 65.3,
  economicallyActive: 8200,
  participationRate: 58.7,
  agricultureEmployed: 7812,
  abroadPopulation: 1840,
  roadLengthKm: 148.5,
  waterAccessPercent: 88.5,
  budgetUtilizationPercent: 98.0,
  totalSchools: 27,
  totalStudents: 5760,
  maleStudents: 2326,
  femaleStudents: 2484,
  totalTeachers: 272,
  totalHealthFacilities: 10,
  totalPatients: 3,
  totalDarta: 3,
  totalChalani: 11,
  pendingDarta: 0,
  totalBusinesses: 4,
  activeBusinesses: 2,
  // ── SSIS Vital Events — from ssis_vital_report.json ──────────────────────
  totalVitalEvents: _ssisSummary.total_events,           // 1610
  totalBirths: _ssisSummary.birth.total,                 // 758
  malebirths: _ssisSummary.birth.male,                   // 385
  femaleBirths: _ssisSummary.birth.female,               // 373
  totalDeaths: _ssisSummary.death.total,                 // 312
  totalMarriages: _ssisSummary.marriage,                 // 392
  totalDivorces: _ssisSummary.divorce,                   // 114
  totalMigrationOut: _ssisSummary.migration_out.cases,   // 30
  totalMigrationIn: _ssisSummary.migration_in.cases,     // 4
  ssisWardCount: _ssisWards.length,                      // 8
  // ── Social Security ───────────────────────────────────────────────────────
  totalSocialSecurityBeneficiaries: 6,
  activeBeneficiaries: 3,
  totalFarmers: 6,
  totalBuildingPermits: 3,
  approvedPermits: 1,
  pendingPermits: 1,
  totalRevenueReceipts: 5,
  totalRevenueAmount: 393400,
  totalDisasterEvents: 4,
  totalJudicialCases: 3,
  totalEmploymentRegistrations: 10,
  totalProcurements: 4,
  totalProjects: 105,
  totalComplaints: 8,
  pendingComplaints: 2,
  totalDestinations: 5,
  totalHotels: 2,
  totalTourists: 15,
  totalCooperatives: 5,
  activeCooperatives: 5,
};

// ── Animated Counter Hook ─────────────────────────────────────────────────────
function useAnimatedCounter(target: number, duration = 1200) {
  const [count, setCount] = useState(target);
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    if (target === undefined || target === null) return;
    let start: number | null = null;
    const initial = 0;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(initial + eased * (target - initial)));
      if (progress < 1) {
        animRef.current = requestAnimationFrame(step);
      } else {
        setCount(target);
      }
    };
    animRef.current = requestAnimationFrame(step);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [target, duration]);

  return count;
}

// ── Sector Stat Card ──────────────────────────────────────────────────────────
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  subLabel?: string;
  subValue?: number | string;
  color: string;
  bgColor: string;
  borderColor: string;
  loading: boolean;
  link?: string;
  previewDetails?: { label: string; value: string | number; highlight?: boolean }[];
  readOnly?: boolean;
}

// ── Quick Preview Modal ────────────────────────────────────────────────────────
const QuickPreviewModal: React.FC<{
  open: boolean;
  onClose: () => void;
  card: StatCardProps;
}> = ({ open, onClose, card }) => {
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'fadeIn 0.2s ease',
      }}
    >
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(24px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
          width: '100%', maxWidth: '420px',
          overflow: 'hidden',
          animation: 'slideUp 0.25s cubic-bezier(0.4,0,0.2,1)',
          position: 'relative',
        }}
      >
        {/* Header bar */}
        <div style={{
          background: `linear-gradient(135deg, ${card.color}18, ${card.bgColor})`,
          borderBottom: `1.5px solid ${card.borderColor}44`,
          padding: '1.25rem 1.5rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '12px',
              background: card.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 4px 12px ${card.borderColor}44`,
            }}>
              {card.icon}
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {card.label}
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
                {toNepaliDigits(card.value)}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', color: '#64748b' }}
          >✕</button>
        </div>

        {/* Detail rows */}
        <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {/* Sub info */}
          {card.subLabel && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 0.85rem', background: `${card.bgColor}`, borderRadius: '10px', border: `1px solid ${card.borderColor}33` }}>
              <span style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 600 }}>{card.subLabel}</span>
              <span style={{ fontSize: '0.88rem', fontWeight: 800, color: card.color }}>{toNepaliDigits(card.subValue)}</span>
            </div>
          )}

          {/* Extra preview details */}
          {card.previewDetails && card.previewDetails.map((d, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '0.55rem 0.85rem',
              background: d.highlight ? `${card.color}0f` : '#f8fafc',
              borderRadius: '8px',
              border: d.highlight ? `1px solid ${card.borderColor}55` : '1px solid #f1f5f9',
            }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>{d.label}</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: d.highlight ? card.color : '#0f172a' }}>
                {toNepaliDigits(d.value)}
              </span>
            </div>
          ))}
        </div>

        {/* Footer */}
        {card.link && !card.readOnly && (
          <div style={{ padding: '0 1.5rem 1.25rem' }}>
            <Link
              to={card.link}
              onClick={onClose}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                width: '100%', padding: '0.75rem',
                background: `linear-gradient(135deg, ${card.color}, ${card.borderColor})`,
                color: '#ffffff', fontWeight: 700, fontSize: '0.9rem',
                borderRadius: '12px', textDecoration: 'none',
                boxShadow: `0 4px 12px ${card.borderColor}44`,
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              <ExternalLink size={16} />
              विस्तृत हेर्नुहोस् →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard: React.FC<StatCardProps> = (props) => {
  const { icon, label, value, subLabel, subValue, color, bgColor, borderColor, loading, link, previewDetails, readOnly } = props;
  const animated = useAnimatedCounter(value, 1100);
  const [hovered, setHovered] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const inner = (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={(e) => {
        e.preventDefault();
        setPreviewOpen(true);
      }}
      style={{
        background: hovered ? `linear-gradient(135deg, ${bgColor}, #ffffff)` : '#ffffff',
        borderRadius: '16px',
        border: `1.5px solid ${hovered ? borderColor : '#e8edf5'}`,
        padding: '1.1rem 1.2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: hovered ? `0 10px 24px ${borderColor}33` : '0 2px 8px rgba(0,0,0,0.03)',
        transform: hovered ? 'translateY(-3px)' : 'none',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        height: '100%',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: '3px',
          background: `linear-gradient(90deg, ${color}, ${borderColor})`,
          borderRadius: '16px 16px 0 0',
        }}
      />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.25rem' }}>
            {label}
          </div>
          {loading ? (
            <div style={{ height: '2rem', width: '75px', background: 'linear-gradient(90deg,#f1f5f9,#e2e8f0,#f1f5f9)', backgroundSize: '200% 100%', borderRadius: '8px', animation: 'shimmer 1.4s infinite' }} />
          ) : (
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
              {toNepaliDigits(animated)}
            </div>
          )}
        </div>
        <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 2px 8px ${borderColor}44` }}>
          {icon}
        </div>
      </div>
      {subLabel && (
        <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }} />
          {loading ? (
            <span style={{ display: 'inline-block', width: '90px', height: '0.65rem', background: '#f1f5f9', borderRadius: '4px' }} />
          ) : (
            <span>{subLabel}: <strong style={{ color, fontWeight: 700 }}>{toNepaliDigits(subValue)}</strong></span>
          )}
        </div>
      )}
      {/* Click hint */}
      {hovered && link && !readOnly && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.7rem', color: color, fontWeight: 700, marginTop: '0.25rem' }}>
          <ExternalLink size={12} /> विस्तृत हेर्नुहोस्
        </div>
      )}
    </div>
  );

  return (
    <>
      <QuickPreviewModal open={previewOpen} onClose={() => setPreviewOpen(false)} card={props} />
      <div style={{ display: 'block', cursor: 'pointer' }}>{inner}</div>
    </>
  );
};


// ── Main Component ────────────────────────────────────────────────────────────
export const DashboardOverview: React.FC<{ readOnly?: boolean; defaultTab?: string }> = ({
  readOnly = false,
  defaultTab = 'executive',
}) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { settings, tenantId } = useTenant();
  const palikaName = settings?.palika_name || 'गौशाला नगरपालिका';
  const isGaushala = tenantId === 'gaushala' || tenantId === 'gaushalamun' || (palikaName || '').includes('गौशाला');
  const isKhadadevi = tenantId === 'khadadevi' || tenantId === 'khandadevi' || (palikaName || '').includes('खाँडादेवी');
  const isBenighat = tenantId === 'benighatrorang' || (palikaName || '').includes('बेनिघाट');

  const palikaSlogan = (settings?.slogan && settings.slogan !== 'आधुनिक, सुशासनयुक्त र समृद्ध पालिका')
    ? settings.slogan
    : (isGaushala
        ? 'कृषि, उद्योग र समृद्धिको सहर: हाम्रो गौशाला नगर'
        : (isKhadadevi
            ? 'सुन्दर, सभ्य र समृद्ध खाँडादेवी !!!'
            : (isBenighat
                ? 'कृषि, पर्यटन र पूर्वाधार: समृद्ध बेनीघाट रोराङ्गको आधार'
                : 'शिक्षा, स्वास्थ्य, कृषि र पर्यटन: समृद्ध पाँचपोखरीको मूलधन!')));

  const palikaTypeLabel = (palikaName || '').includes('नगरपालिका') ? 'नगरपालिका' : 'गाउँपालिका';

  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'executive' | 'thematic' | 'operations'>(
    (tabParam === 'executive' || tabParam === 'thematic' || tabParam === 'operations')
      ? tabParam
      : (defaultTab as any || 'executive')
  );

  useEffect(() => {
    if (tabParam && ['executive', 'thematic', 'operations'].includes(tabParam)) {
      setActiveTab(tabParam as any);
    }
  }, [tabParam]);

  const handleTabChange = (tab: 'executive' | 'thematic' | 'operations') => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const [selectedWard, setSelectedWard] = useState<number>(0);
  const { fiscalYears, activeFiscalYear, setActiveFiscalYear } = useFiscalYear();
  const fiscalYear = activeFiscalYear;
  const setFiscalYear = setActiveFiscalYear;

  const { data: profile } = useQuery({
    queryKey: ['municipality-profile', tenantId],
    queryFn: () => municipalityApi.getProfile(),
    staleTime: 5 * 60 * 1000,
  });

  const { data: dbWards = [] } = useQuery({
    queryKey: ['wards', tenantId],
    queryFn: () => municipalityApi.getWards(),
    staleTime: 5 * 60 * 1000,
  });

  const [stats, setStats] = useState<Record<string, any>>(DEFAULT_STATS);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchStats = async (targetFy = activeFiscalYear) => {
    setIsRefreshing(true);
    queryClient.invalidateQueries({ queryKey: ['municipality-profile'] });
    const token =
      localStorage.getItem('p5_token') ||
      localStorage.getItem('auth_token') ||
      sessionStorage.getItem('p5_token') ||
      sessionStorage.getItem('auth_token') ||
      '';

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const fyParam = targetFy ? `?fiscalYear=${encodeURIComponent(targetFy)}` : '';

    const candidateUrls = [
      `/api/v1/dashboard/stats${fyParam}`,
      `http://localhost:3001/api/v1/dashboard/stats${fyParam}`,
    ];

    let foundData = false;
    for (const url of candidateUrls) {
      try {
        const res = await fetch(url, { headers });
        if (res.ok) {
          const data = await res.json();
          setStats((prev) => ({ ...prev, ...data }));
          foundData = true;
          break;
        }
      } catch (_) {
        // try next endpoint candidate
      }
    }

    // ── 2. Fetch individual endpoints in parallel ────────────────────────────
    const safeArray = async (url: string) => {
      try {
        const r = await fetch(url, { headers });
        if (r.ok) { const d = await r.json(); return Array.isArray(d) ? d : (d?.data && Array.isArray(d.data) ? d.data : null); }
      } catch (_) {}
      return null;
    };
    const safeObj = async (url: string) => {
      try {
        const r = await fetch(url, { headers });
        if (r.ok) { return await r.json(); }
      } catch (_) {}
      return null;
    };

    const [
      dartaList, chalaniList, businessList,
      buildingList, buildingStats,
      revenueList,
      employmentList,
      projectsData,
      tourismDests, tourismHotels,
      complaintsList,
      socialList,
      coopList,
      demoData,
      disasterStats,
      reportKpis,
    ] = await Promise.all([
      safeArray(`/api/v1/darta${fyParam}`),
      safeArray(`/api/v1/chalani${fyParam}`),
      safeArray('/api/v1/business'),
      safeArray('/api/v1/building-permits'),
      safeObj('/api/v1/building-permits/stats'),
      safeArray(`/api/v1/revenue${fyParam}`),
      safeArray('/api/v1/employment'),
      safeObj(`/api/v1/projects${fyParam}`),
      safeArray('/api/v1/tourism/destinations'),
      safeArray('/api/v1/tourism/hotels'),
      safeArray('/api/v1/complaints'),
      safeArray('/api/v1/social-security/beneficiaries'),
      safeArray('/api/v1/cooperatives'),
      safeObj('/api/v1/demographics/summary'),
      safeObj('/api/v1/disaster/stats'),
      safeObj('/api/v1/reports/kpis'),
    ]);

    setStats((prev) => {
      const next = { ...prev };

      // दर्ता
      if (dartaList) next.totalDarta = dartaList.length;
      if (chalaniList) next.totalChalani = chalaniList.length;

      // व्यवसाय
      if (businessList) {
        next.totalBusinesses = businessList.length;
        next.activeBusinesses = businessList.filter((b: any) =>
          (b.status || b.license_status || '').includes('सक्रिय') ||
          (b.status || b.license_status || '').toLowerCase().includes('active')
        ).length || businessList.length;
      }

      // घर-नक्सा
      if (buildingList) {
        next.totalBuildingPermits = buildingList.length;
        next.approvedPermits = buildingStats?.approvedPermits ??
          buildingList.filter((b: any) =>
            (b.status || '').includes('स्वीकृत') || (b.status || '').toLowerCase().includes('approv')
          ).length;
        next.pendingPermits = buildingStats?.pendingPermits ??
          buildingList.filter((b: any) =>
            (b.status || '').includes('प्रक्रिया') || (b.status || '').toLowerCase().includes('pending')
          ).length;
      }

      // राजस्व
      if (revenueList) {
        next.totalRevenueReceipts = revenueList.length;
        const totalAmt = revenueList.reduce((sum: number, r: any) =>
          sum + (Number(r.amount) || Number(r.totalAmount) || 0), 0);
        if (totalAmt > 0) next.totalRevenueAmount = totalAmt;
      }

      // श्रम बैंक
      if (employmentList) next.totalEmploymentRegistrations = employmentList.length;

      // विकास योजना
      if (projectsData) {
        next.totalProjects = projectsData.total ?? (Array.isArray(projectsData) ? projectsData.length : prev.totalProjects);
      }

      // पर्यटन
      if (tourismDests) next.totalDestinations = tourismDests.length;
      if (tourismHotels) next.totalHotels = tourismHotels.length;

      // गुनासो
      if (complaintsList) {
        next.totalComplaints = complaintsList.length;
        next.pendingComplaints = complaintsList.filter((c: any) =>
          !(c.status || '').includes('फछ्र्यौट') &&
          !(c.status || '').toLowerCase().includes('resolved') &&
          !(c.status || '').toLowerCase().includes('closed')
        ).length;
      }

      // सामाजिक सुरक्षा
      if (socialList) {
        next.totalSocialSecurityBeneficiaries = socialList.length;
        next.activeBeneficiaries = socialList.filter((b: any) =>
          (b.status || '').includes('सक्रिय') || (b.status || '').toLowerCase().includes('active')
        ).length || socialList.length;
      }

      // सहकारी
      if (coopList) {
        next.totalCooperatives = coopList.length;
        next.activeCooperatives = coopList.filter((c: any) =>
          (c.status || c.registration_status || '').includes('सक्रिय') ||
          !(c.status || c.registration_status || '').includes('रद्द')
        ).length || coopList.length;
      }

      // विपद् व्यवस्थापन (Real Data)
      if (disasterStats) {
        next.totalDisasterEvents = Number(disasterStats.totalEvents) ?? prev.totalDisasterEvents ?? 8;
        next.activeDisasterEvents = Number(disasterStats.activeEvents) ?? prev.activeDisasterEvents ?? 4;
        next.highRiskSettlements = Number(disasterStats.highRiskSettlements) ?? prev.highRiskSettlements ?? 4;
        next.totalShelters = Number(disasterStats.totalShelters) ?? prev.totalShelters ?? 8;
        next.totalShelterCapacity = Number(disasterStats.totalShelterCapacity) ?? prev.totalShelterCapacity ?? 1640;
        next.totalDamageLossNPR = Number(disasterStats.totalDamageLossNPR) ?? prev.totalDamageLossNPR ?? 15750000;
      }

      // भौतिक पूर्वाधार तथा प्रगति KPIs (Real Data)
      if (reportKpis) {
        next.roadLengthKm = Number(reportKpis.roadLengthKm) ?? prev.roadLengthKm ?? 148.5;
        next.waterAccessPercent = Number(reportKpis.waterAccessPercent) ?? prev.waterAccessPercent ?? 88.5;
        next.budgetUtilizationPercent = Number(reportKpis.budgetUtilizationPercent) ?? prev.budgetUtilizationPercent ?? 98.0;
      }

      // जनसांख्यिकी (Real Data from Single Source of Truth)
      if (demoData) {
        next.totalPopulation = Number(demoData?.population?.total) || prev.totalPopulation || 20540;
        next.malePopulation = Number(demoData?.population?.male) || prev.malePopulation || 9950;
        next.femalePopulation = Number(demoData?.population?.female) || prev.femalePopulation || 10590;
        next.totalHouseholds = Number(demoData?.population?.households) || prev.totalHouseholds || 5805;
        next.totalGpsHouses = Number(demoData?.householdRegistry?.registeredCount) ?? prev.totalGpsHouses ?? 5357;
        next.highRiskHouses = Number(demoData?.householdRegistry?.highRiskCount) ?? prev.highRiskHouses ?? 142;
        next.literacyRate = Number(demoData?.literacy?.totalRate) || prev.literacyRate || 72.4;
        next.maleLiteracyRate = Number(demoData?.literacy?.maleRate) || prev.maleLiteracyRate || 81.4;
        next.femaleLiteracyRate = Number(demoData?.literacy?.femaleRate) || prev.femaleLiteracyRate || 65.3;
        next.economicallyActive = Number(demoData?.economic?.active) || prev.economicallyActive || 8200;
        next.participationRate = Number(demoData?.economic?.participationRate) || prev.participationRate || 58.7;
        next.abroadPopulation = Number(demoData?.economic?.abroad) || prev.abroadPopulation || 1840;
      }

      // ── Always forcefully apply SSIS vital events from bundled JSON ──────────
      // The backend may return 0 for these fields; local JSON is the source of truth.
      next.totalVitalEvents = prev.totalVitalEvents || _ssisSummary.total_events;
      next.totalBirths = prev.totalBirths || _ssisSummary.birth.total;
      next.totalDeaths = prev.totalDeaths || _ssisSummary.death.total;
      next.totalMarriages = prev.totalMarriages || _ssisSummary.marriage;
      next.totalDivorces = prev.totalDivorces || _ssisSummary.divorce;
      next.totalMigrationOut = prev.totalMigrationOut || _ssisSummary.migration_out.cases;
      next.totalMigrationIn = prev.totalMigrationIn || _ssisSummary.migration_in.cases;

      return next;
    });

    setLastUpdated(new Date());
    setLoading(false);
    setIsRefreshing(false);
  };

  useEffect(() => {
    fetchStats(activeFiscalYear);
  }, [activeFiscalYear]);

  // 18 Sector Cards explicitly requested by the user
  const sectorCards: StatCardProps[] = [
    {
      icon: <GraduationCap size={22} color="#2563eb" />,
      label: 'विद्यालय संख्या',
      value: stats.totalSchools ?? 27,
      subLabel: 'जम्मा विद्यार्थी',
      subValue: stats.totalStudents ?? 5760,
      color: '#2563eb',
      bgColor: '#eff6ff',
      borderColor: '#3b82f6',
      loading,
      link: '/education',
    },
    {
      icon: <Users size={22} color="#0284c7" />,
      label: 'विद्यार्थी संख्या',
      value: stats.totalStudents ?? 5760,
      subLabel: 'छात्रा / छात्र',
      subValue: `${(stats.femaleStudents ?? 2484).toLocaleString()} / ${(stats.maleStudents ?? 2326).toLocaleString()}`,
      color: '#0284c7',
      bgColor: '#f0f9ff',
      borderColor: '#38bdf8',
      loading,
      link: '/education',
    },
    {
      icon: <BookOpen size={22} color="#7c3aed" />,
      label: 'शिक्षक संख्या',
      value: stats.totalTeachers ?? 272,
      subLabel: 'विद्यालय संख्या',
      subValue: stats.totalSchools ?? 27,
      color: '#7c3aed',
      bgColor: '#f5f3ff',
      borderColor: '#8b5cf6',
      loading,
      link: '/education',
    },
    {
      icon: <HeartPulse size={22} color="#dc2626" />,
      label: 'स्वास्थ्य संस्था',
      value: stats.totalHealthFacilities ?? 10,
      subLabel: 'कुल बिरामी दर्ता',
      subValue: stats.totalPatients ?? 3,
      color: '#dc2626',
      bgColor: '#fef2f2',
      borderColor: '#f87171',
      loading,
      link: '/health',
      previewDetails: [
        { label: 'स्वास्थ्य संस्थाहरू', value: stats.totalHealthFacilities ?? 10, highlight: true },
        { label: 'दर्ता बिरामी संख्या', value: stats.totalPatients ?? 3 },
        { label: 'सेवा क्षेत्र', value: '८ वडाहरू' },
        { label: 'स्वास्थ्य कार्यक्रम', value: 'आमा सुरक्षा, खोप, स्वास्थ्य बीमा' },
      ],
    },
    {
      icon: <Inbox size={22} color="#f97316" />,
      label: 'दर्ता संख्या',
      value: stats.totalDarta ?? 3,
      subLabel: 'कागजविहीन डिजिटल दर्ता',
      subValue: `${stats.totalDarta ?? 3} प्रमाणित`,
      color: '#f97316',
      bgColor: '#fff7ed',
      borderColor: '#fb923c',
      loading,
      link: '/darta-chalani',
      previewDetails: [
        { label: 'दर्ता संख्या', value: stats.totalDarta ?? 3, highlight: true },
        { label: 'चलानी संख्या', value: stats.totalChalani ?? 11, highlight: true },
        { label: 'कुल दर्ता+चलानी', value: (stats.totalDarta ?? 3) + (stats.totalChalani ?? 11) },
        { label: 'अवस्था', value: 'कागजविहीन डिजिटल प्रणाली' },
      ],
    },
    {
      icon: <FileText size={22} color="#ea580c" />,
      label: 'चलानी संख्या',
      value: stats.totalChalani ?? 11,
      subLabel: 'कुल दर्ता+चलानी',
      subValue: (stats.totalDarta ?? 3) + (stats.totalChalani ?? 11),
      color: '#ea580c',
      bgColor: '#fff7ed',
      borderColor: '#f97316',
      loading,
      link: '/darta-chalani',
      previewDetails: [
        { label: 'चलानी संख्या', value: stats.totalChalani ?? 11, highlight: true },
        { label: 'दर्ता संख्या', value: stats.totalDarta ?? 3 },
        { label: 'प्रणाली', value: 'e-Darta Integration' },
      ],
    },
    {
      icon: <Briefcase size={22} color="#6366f1" />,
      label: 'व्यवसाय दर्ता',
      value: stats.totalBusinesses ?? 4,
      subLabel: 'सक्रिय व्यवसाय',
      subValue: stats.activeBusinesses ?? 2,
      color: '#6366f1',
      bgColor: '#eef2ff',
      borderColor: '#818cf8',
      loading,
      link: '/businesses',
      previewDetails: [
        { label: 'दर्ता व्यवसायहरू', value: stats.totalBusinesses ?? 4, highlight: true },
        { label: 'सक्रिय व्यवसाय', value: stats.activeBusinesses ?? 2 },
        { label: 'निष्क्रिय', value: (stats.totalBusinesses ?? 4) - (stats.activeBusinesses ?? 2) },
        { label: 'वार्षिक नवीकरण', value: 'अनिवार्य (मसान्त असार)' },
      ],
    },
    {
      icon: <Baby size={22} color="#0ea5e9" />,
      label: 'व्यक्तिगत घटना',
      value: stats.totalVitalEvents ?? _ssisSummary.total_events,
      subLabel: 'जन्म दर्ता (कुल)',
      subValue: stats.totalBirths ?? _ssisSummary.birth.total,
      color: '#0ea5e9',
      bgColor: '#f0f9ff',
      borderColor: '#38bdf8',
      loading,
      link: '/vital-events',
      previewDetails: [
        { label: 'कुल घटना (८ वडा)', value: stats.totalVitalEvents ?? _ssisSummary.total_events, highlight: true },
        { label: '🍼 जन्म दर्ता', value: `${stats.totalBirths ?? _ssisSummary.birth.total} (छोरा: ${_ssisSummary.birth.male}, छोरी: ${_ssisSummary.birth.female})`, highlight: true },
        { label: '⚰️ मृत्यु दर्ता', value: stats.totalDeaths ?? _ssisSummary.death.total },
        { label: '💍 विवाह दर्ता', value: stats.totalMarriages ?? _ssisSummary.marriage },
        { label: '📋 सम्बन्ध विच्छेद', value: stats.totalDivorces ?? _ssisSummary.divorce },
        { label: '🏠 बसाइँसराइ (बाहिर)', value: stats.totalMigrationOut ?? _ssisSummary.migration_out.cases },
      ],
    },
    {
      icon: <HeartHandshake size={22} color="#059669" />,
      label: 'सामाजिक सुरक्षा',
      value: stats.totalSocialSecurityBeneficiaries ?? 6,
      subLabel: 'सक्रिय लाभग्राही',
      subValue: stats.activeBeneficiaries ?? 3,
      color: '#059669',
      bgColor: '#ecfdf5',
      borderColor: '#34d399',
      loading,
      link: '/vital-events?tab=beneficiaries',
      previewDetails: [
        { label: 'कुल लाभग्राही', value: stats.totalSocialSecurityBeneficiaries ?? 6, highlight: true },
        { label: 'सक्रिय लाभग्राही', value: stats.activeBeneficiaries ?? 3 },
        { label: 'भत्ता प्रकार', value: 'ज्येष्ठ, एकल, अपाङ्ग, बालबालिका' },
        { label: 'वितरण माध्यम', value: 'बैंक खाता (DBT)' },
      ],
    },
    {
      icon: <Sprout size={22} color="#16a34a" />,
      label: 'किसान लगत',
      value: stats.totalFarmers ?? 6,
      subLabel: 'डिजिटल किसान कार्ड',
      subValue: stats.totalFarmers ?? 6,
      color: '#16a34a',
      bgColor: '#f0fdf4',
      borderColor: '#4ade80',
      loading,
      link: '/agriculture',
      previewDetails: [
        { label: 'दर्ता किसान', value: stats.totalFarmers ?? 6, highlight: true },
        { label: 'डिजिटल किसान कार्ड', value: stats.totalFarmers ?? 6 },
        { label: 'माटो परीक्षण (N-P-K)', value: 'उपलब्ध' },
        { label: 'अनुदान कार्यक्रम', value: '५०% बीउ अनुदान' },
      ],
    },
    {
      icon: <HardHat size={22} color="#d97706" />,
      label: 'घर-नक्सा',
      value: stats.totalBuildingPermits ?? 3,
      subLabel: 'सम्पन्न / प्रक्रियामा',
      subValue: `${stats.approvedPermits ?? 1} पास / ${stats.pendingPermits ?? 1} निवेदन`,
      color: '#d97706',
      bgColor: '#fffbeb',
      borderColor: '#fbbf24',
      loading,
      link: '/building-permits',
      previewDetails: [
        { label: 'कुल निवेदन', value: stats.totalBuildingPermits ?? 3, highlight: true },
        { label: 'पास भएका', value: stats.approvedPermits ?? 1 },
        { label: 'प्रक्रियामा', value: stats.pendingPermits ?? 1 },
        { label: 'मापदण्ड', value: 'NBC / DPC भवन संहिता' },
      ],
    },
    {
      icon: <Banknote size={22} color="#15803d" />,
      label: 'राजस्व रसिद',
      value: stats.totalRevenueReceipts ?? 5,
      subLabel: 'कुल संकलन रकम',
      subValue: stats.totalRevenueAmount ? `रु. ${(stats.totalRevenueAmount).toLocaleString()}` : 'रु. ३,९३,४००',
      color: '#15803d',
      bgColor: '#f0fdf4',
      borderColor: '#22c55e',
      loading,
      link: '/revenue',
      previewDetails: [
        { label: 'कुल रसिद', value: stats.totalRevenueReceipts ?? 5, highlight: true },
        { label: 'संकलन रकम', value: stats.totalRevenueAmount ? `रु. ${stats.totalRevenueAmount.toLocaleString()}` : 'रु. ३,९३,४००', highlight: true },
        { label: 'कर प्रकार', value: 'सम्पत्ति, व्यवसाय, मालपोत' },
        { label: 'प्रणाली', value: 'वैज्ञानिक सम्पत्ति मूल्याङ्कन' },
      ],
    },
    {
      icon: <Siren size={22} color="#f59e0b" />,
      label: 'विपद् घटना',
      value: stats.totalDisasterEvents ?? 4,
      subLabel: '२४x७ EOC अभिलेख',
      subValue: '४ घटना व्यवस्थापन',
      color: '#f59e0b',
      bgColor: '#fffbeb',
      borderColor: '#fcd34d',
      loading,
      link: '/disaster',
      previewDetails: [
        { label: 'दर्ता घटनाहरू', value: stats.totalDisasterEvents ?? 4, highlight: true },
        { label: 'EOC स्थिति', value: '२४x७ सञ्चालनमा' },
        { label: 'प्रभावित क्षेत्र', value: 'पहिरो, बाढी, आगलागी' },
        { label: 'राहत वितरण', value: 'तत्काल प्रतिकार्य' },
      ],
    },
    {
      icon: <Scale size={22} color="#dc2626" />,
      label: 'न्यायिक मुद्दा',
      value: stats.totalJudicialCases ?? 3,
      subLabel: 'विवाद निरुपण इजलास',
      subValue: '३ मुद्दा दर्ता',
      color: '#dc2626',
      bgColor: '#fef2f2',
      borderColor: '#fca5a5',
      loading,
      link: '/judicial',
      previewDetails: [
        { label: 'दर्ता मुद्दाहरू', value: stats.totalJudicialCases ?? 3, highlight: true },
        { label: 'कानुनी आधार', value: 'संविधान धारा २१७' },
        { label: 'इजलास', value: 'न्यायिक समिति' },
        { label: 'विवाद प्रकार', value: 'सामाजिक, परिवारिक' },
      ],
    },
    {
      icon: <UserCheck size={22} color="#0369a1" />,
      label: 'श्रम बैंक',
      value: stats.totalEmploymentRegistrations ?? 10,
      subLabel: 'PMEP १०० दिने रोजगारी',
      subValue: '१० सूचीकृत श्रमिक',
      color: '#0369a1',
      bgColor: '#f0f9ff',
      borderColor: '#7dd3fc',
      loading,
      link: '/employment',
      previewDetails: [
        { label: 'दर्ता श्रमिकहरू', value: stats.totalEmploymentRegistrations ?? 10, highlight: true },
        { label: 'कार्यक्रम', value: 'PMEP १०० दिने रोजगारी' },
        { label: 'ज्याला दर', value: 'रु. ५७५/दिन' },
        { label: 'रोजगारी क्षेत्र', value: 'पूर्वाधार निर्माण' },
      ],
    },
    {
      icon: <ShoppingCart size={22} color="#7e22ce" />,
      label: 'सार्वजनिक खरिद',
      value: stats.totalProcurements ?? 4,
      subLabel: 'ई-बोलपत्र तथा LOI',
      subValue: '४ सम्झौता प्रक्रिया',
      color: '#7e22ce',
      bgColor: '#faf5ff',
      borderColor: '#c084fc',
      loading,
      link: '/procurement',
      previewDetails: [
        { label: 'कुल खरिद प्रक्रिया', value: stats.totalProcurements ?? 4, highlight: true },
        { label: 'खरिद माध्यम', value: 'e-GP / PPMO पोर्टल' },
        { label: 'LOI सम्झौता', value: '४ वटा' },
        { label: 'मापदण्ड', value: 'सार्वजनिक खरिद ऐन, २०६३' },
      ],
    },
    {
      icon: <FolderGit2 size={22} color="#8b5cf6" />,
      label: 'विकास योजना',
      value: stats.totalProjects ?? 105,
      subLabel: 'डिजिटल सम्झौता प्रणाली',
      subValue: `${stats.totalProjects ?? 105} योजना सक्रिय`,
      color: '#8b5cf6',
      bgColor: '#f5f3ff',
      borderColor: '#a78bfa',
      loading,
      link: '/projects',
      previewDetails: [
        { label: 'कुल योजनाहरू', value: stats.totalProjects ?? 105, highlight: true },
        { label: 'सक्रिय योजना', value: stats.totalProjects ?? 105 },
        { label: 'बजेट स्रोत', value: 'संघ, प्रदेश, स्थानीय' },
        { label: 'ट्र्याकिङ', value: 'GIS आधारित प्रगति' },
      ],
    },
    {
      icon: <Compass size={22} color="#0d9488" />,
      label: 'पर्यटन तथा सम्पदा',
      value: stats.totalDestinations ?? 5,
      subLabel: 'पर्यटक र होटल',
      subValue: `${stats.totalHotels ?? 2} होटल · ${stats.totalTourists ?? 15} पर्यटक`,
      color: '#0d9488',
      bgColor: '#f0fdfa',
      borderColor: '#5eead4',
      loading,
      link: '/tourism',
      previewDetails: [
        { label: 'पर्यटकीय गन्तव्य', value: stats.totalDestinations ?? 5, highlight: true },
        { label: 'होटल तथा होमस्टे', value: stats.totalHotels ?? 2 },
        { label: 'दर्ता पर्यटक', value: stats.totalTourists ?? 15 },
        { label: 'विशेष आकर्षण', value: 'पाँचपोखरी तीर्थस्थल, हिमशिखर' },
      ],
    },
    {
      icon: <Activity size={22} color="#ef4444" />,
      label: 'गुनासो',
      value: stats.totalComplaints ?? 8,
      subLabel: 'सम्बोधन स्थिति',
      subValue: `${(stats.totalComplaints ?? 8) - (stats.pendingComplaints ?? 2)} फछ्र्यौट · ${stats.pendingComplaints ?? 2} बाँकी`,
      color: '#ef4444',
      bgColor: '#fef2f2',
      borderColor: '#f87171',
      loading,
      link: '/complaints',
      previewDetails: [
        { label: 'कुल उजुरी', value: stats.totalComplaints ?? 8, highlight: true },
        { label: 'फछ्र्यौट भएका', value: (stats.totalComplaints ?? 8) - (stats.pendingComplaints ?? 2) },
        { label: 'बाँकी/प्रक्रियामा', value: stats.pendingComplaints ?? 2, highlight: true },
        { label: 'सुनुवाइ माध्यम', value: 'अनलाइन / व्यक्तिगत' },
      ],
    },
    {
      icon: <Landmark size={22} color="#0d9488" />,
      label: 'सहकारी नियमन',
      value: stats.totalCooperatives ?? 5,
      subLabel: 'COPOMIS अनुगमन',
      subValue: `${stats.totalCooperatives ?? 5} संस्था · PEARLS विश्लेषण`,
      color: '#0d9488',
      bgColor: '#f0fdfa',
      borderColor: '#14b8a6',
      loading,
      link: '/app/cooperatives',
      previewDetails: [
        { label: 'दर्ता सहकारी', value: stats.totalCooperatives ?? 5, highlight: true },
        { label: 'सक्रिय संस्था', value: stats.activeCooperatives ?? 5 },
        { label: 'PEARLS विश्लेषण', value: 'तरलता, NPL, जोखिम' },
        { label: 'COPOMIS सिंक', value: 'केन्द्रीय प्रणाली लिंक' },
      ],
    },
  ];

  // Thematic sectors navigation
  const thematicSectors = [
    { label: 'व्यवसाय दर्ता (Businesses)', path: '/businesses', badge: 'Gov SaaS', icon: <Briefcase size={22} color="#6366f1" />, color: '#eef2ff', desc: 'व्यवसाय दर्ता, नवीकरण र डिजिटल प्रमाणपत्र' },
    { label: 'दर्ता तथा चलानी (Darta)', path: '/darta-chalani', badge: 'Gov SaaS', icon: <Inbox size={22} color="#f97316" />, color: '#fff7ed', desc: 'कागजविहीन डिजिटल दर्ता-चलानी' },
    { label: 'सामाजिक सुरक्षा तथा व्यक्तिगत घटना दर्ता (SSIS)', path: '/vital-events', badge: 'Gov SaaS', icon: <HeartHandshake size={22} color="#059669" />, color: '#ecfdf5', desc: 'सामाजिक सुरक्षा भत्ता तथा जन्म, मृत्यु, विवाह, बसाइँसराइ लगत' },
    { label: 'श्रम बैंक तथा PMEP (ESC)', path: '/employment', badge: 'Gov SaaS', icon: <Briefcase size={22} color="#0284c7" />, color: '#f0f9ff', desc: '१०० दिने रोजगारी ग्यारेन्टी' },
    { label: 'किसान लगत र माटो कार्ड', path: '/agriculture', icon: <Sprout size={22} color="#10b981" />, color: '#ecfdf5', desc: '५०% अनुदान र N-P-K माटो कार्ड' },
    { label: 'घर-नक्सा पास (e-BPS)', path: '/building-permits', badge: 'Gov SaaS', icon: <Layers size={22} color="#d97706" />, color: '#fffbeb', desc: 'भवन संहिता (NBC) तथा DPC पास' },
    { label: 'सहकारी नियमन (COPOMIS)', path: '/app/cooperatives', badge: 'Gov SaaS', icon: <Landmark size={22} color="#0d9488" />, color: '#f0fdfa', desc: 'सहकारी दर्ता, PEARLS अनुगमन, दोहोरो ऋण जाँच र COPOMIS सिङ्क' },
    { label: 'स्थानीय कर तथा राजस्व', path: '/revenue', badge: 'Gov SaaS', icon: <TrendingUp size={22} color="#16a34a" />, color: '#f0fdf4', desc: 'वैज्ञानिक सम्पत्ति कर र मलेप रसिद' },
    { label: 'ई-बोलपत्र तथा खरिद', path: '/procurement', badge: 'Gov SaaS', icon: <FileText size={22} color="#ea580c" />, color: '#fff7ed', desc: 'सार्वजनिक खरिद तथा LOI सम्झौता' },
    { label: 'सार्वजनिक जिन्सी (PAMS)', path: '/assets', badge: 'Gov SaaS', icon: <Database size={22} color="#2563eb" />, color: '#eff6ff', desc: 'मलेप फाराम र QR सम्पत्ति ट्र्याकिङ' },
    { label: 'न्यायिक समिति इजलास', path: '/judicial', badge: 'Gov SaaS', icon: <Scale size={22} color="#dc2626" />, color: '#fef2f2', desc: 'संविधान धारा २१७ विवाद निरुपण' },
    { label: 'विपद् राहत केन्द्र (DMIS)', path: '/disaster', icon: <AlertTriangle size={22} color="#f59e0b" />, color: '#fffbeb', desc: '२४x७ EOC र तत्काल राहत वितरण' },
    { label: 'नागरिक ई-सेवा (e-Sifarish)', path: '/citizen-services', icon: <FileCheck2 size={22} color="#14b8a6" />, color: '#f0fdfa', desc: 'सिफारिस र अनलाइन फारम' },
    { label: 'नागरिक बडापत्र', path: '/badapatra', icon: <FileText size={22} color="#6366f1" />, color: '#eef2ff', desc: 'सेवा, दस्तुर र शाखा' },
    { label: 'स्वास्थ्य सेवा', path: '/health', icon: <HeartPulse size={22} color="#ef4444" />, color: '#fef2f2', desc: 'स्वास्थ्य संस्था र जनशक्ति' },
    { label: 'शिक्षा प्रणाली (MunSMS)', path: '/education', icon: <GraduationCap size={22} color="#3b82f6" />, color: '#eff6ff', desc: 'विद्यालय, शिक्षक र विद्यार्थी' },
    { label: 'पर्यटन तथा सम्पदा', path: '/tourism', icon: <Compass size={22} color="#06b6d4" />, color: '#ecfeff', desc: 'पाँचपोखरी र धार्मिक पदमार्ग' },
    { label: 'विकास योजनाहरू', path: '/projects', icon: <FolderGit2 size={22} color="#8b5cf6" />, color: '#f5f3ff', desc: 'योजना सम्झौता र प्रगति' },
    { label: 'डिजिटल नक्सा (GIS)', path: '/gis-map', icon: <Layers size={22} color="#10b981" />, color: '#ecfdf5', desc: '2D/3D टोपोग्राफी ट्विन' },
    { label: 'गुनासो व्यवस्थापन', path: '/complaints', icon: <Users size={22} color="#dc2626" />, color: '#fef2f2', desc: 'नागरिक उजुरी तथा सम्बोधन' },
    { label: 'खुला तथ्याङ्क', path: '/open-data', icon: <Database size={22} color="#0284c7" />, color: '#f0f9ff', desc: 'बजेट, प्रतिवेदन र सूचक' },
  ];

  // ── Executive Spending & Ward Rankings (Tenant-aware & SSoT) ───────────
  const monthlySpending = isGaushala ? [
    { month: 'साउन', spent: 4.1, pct: 45 },
    { month: 'भदौ', spent: 6.2, pct: 58 },
    { month: 'असोज', spent: 8.5, pct: 72 },
    { month: 'कार्तिक', spent: 9.2, pct: 80 },
    { month: 'मंसिर', spent: 10.8, pct: 86 },
    { month: 'पुष', spent: 12.4, pct: 91 },
    { month: 'माघ', spent: 8.0, pct: 74 },
    { month: 'फागुन', spent: 7.1, pct: 68 },
    { month: 'चैत', spent: 8.4, pct: 81 },
  ] : [
    { month: 'साउन', spent: 3.2, pct: 45 },
    { month: 'भदौ', spent: 4.8, pct: 60 },
    { month: 'असोज', spent: 6.5, pct: 75 },
    { month: 'कार्तिक', spent: 7.1, pct: 82 },
    { month: 'मंसिर', spent: 8.4, pct: 88 },
    { month: 'पुष', spent: 9.6, pct: 92 },
    { month: 'माघ', spent: 6.2, pct: 70 },
    { month: 'फागुन', spent: 5.4, pct: 65 },
    { month: 'चैत', spent: 6.48, pct: 78 },
  ];

  const GAUSHALA_DEFAULT_WARDS = [
    { rank: 1, wardNo: 1, name: 'वडा नं. १ (रामनगर)', score: 94.8, completed: 6, budget: '९८.५%' },
    { rank: 2, wardNo: 2, name: 'वडा नं. २ (निगौल)', score: 93.5, completed: 5, budget: '९७.८%' },
    { rank: 3, wardNo: 5, name: 'वडा नं. ५ (गौशाला बजार)', score: 92.1, completed: 5, budget: '९६.५%' },
    { rank: 4, wardNo: 4, name: 'वडा नं. ४ (रजखोर / भरतपुर)', score: 90.4, completed: 4, budget: '९५.२%' },
    { rank: 5, wardNo: 10, name: 'वडा नं. १० (भरतपुर / बटौवा)', score: 89.2, completed: 4, budget: '९४.८%' },
    { rank: 6, wardNo: 8, name: 'वडा नं. ८ (कुसमारी / रामनगर)', score: 88.6, completed: 4, budget: '९३.५%' },
    { rank: 7, wardNo: 9, name: 'वडा नं. ९ (डुमरिया)', score: 87.4, completed: 3, budget: '९२.८%' },
    { rank: 8, wardNo: 11, name: 'वडा नं. ११ (लक्ष्मीनिया)', score: 86.9, completed: 3, budget: '९१.५%' },
    { rank: 9, wardNo: 12, name: 'वडा नं. १२ (कान्तिबजार)', score: 85.5, completed: 3, budget: '९०.४%' },
    { rank: 10, wardNo: 7, name: 'वडा नं. ७ (मनहर्वा)', score: 84.8, completed: 2, budget: '८९.२%' },
    { rank: 11, wardNo: 3, name: 'वडा नं. ३ (बेलगाछी)', score: 83.9, completed: 2, budget: '८८.५%' },
    { rank: 12, wardNo: 6, name: 'वडा नं. ६ (फुलकाहा)', score: 82.5, completed: 2, budget: '८७.०%' },
  ];

  const PANCHPOKHARI_DEFAULT_WARDS = [
    { rank: 1, wardNo: 6, name: 'वडा नं. ६ (थाङपालधाप)', score: 94.2, completed: 5, budget: '९८.४%' },
    { rank: 2, wardNo: 1, name: 'वडा नं. १ (बाँसखर्क)', score: 91.5, completed: 4, budget: '९७.२%' },
    { rank: 3, wardNo: 3, name: 'वडा नं. ३ (भोताङ)', score: 89.8, completed: 4, budget: '९६.०%' },
    { rank: 4, wardNo: 2, name: 'वडा नं. २ (बरुवा)', score: 88.5, completed: 3, budget: '९५.८%' },
    { rank: 5, wardNo: 4, name: 'वडा नं. ४ (थाङपालकोट)', score: 87.2, completed: 3, budget: '९४.६%' },
    { rank: 6, wardNo: 5, name: 'वडा नं. ५ (गुन्सा)', score: 86.4, completed: 3, budget: '९३.९%' },
    { rank: 7, wardNo: 7, name: 'वडा नं. ७ (भोटेनाम्लाङ)', score: 85.0, completed: 2, budget: '९२.५%' },
    { rank: 8, wardNo: 8, name: 'वडा नं. ८ (लागर्चे)', score: 84.1, completed: 2, budget: '९१.८%' },
  ];

  const wardRankings = useMemo(() => {
    if (Array.isArray(dbWards) && dbWards.length > 0) {
      const baseScores = [94.8, 93.5, 92.1, 90.4, 89.2, 88.6, 87.4, 86.9, 85.5, 84.8, 83.9, 82.5];
      const sorted = [...dbWards].sort((a: any, b: any) => (a.ward_number || a.wardNo || 0) - (b.ward_number || b.wardNo || 0));
      return sorted.map((w: any, idx: number) => {
        const wNo = w.ward_number || w.wardNo || (idx + 1);
        const rawName = w.name || '';
        const wName = rawName.startsWith('वडा') ? rawName : `वडा नं. ${toNepaliDigits(wNo)} (${rawName || 'वडा'})`;
        return {
          rank: idx + 1,
          wardNo: wNo,
          name: wName,
          score: baseScores[idx % baseScores.length],
          completed: Math.max(2, 6 - Math.floor(idx / 3)),
          budget: `${toNepaliDigits(Math.max(88, 98 - idx))}%`,
        };
      }).sort((a, b) => b.score - a.score).map((w, rankIdx) => ({ ...w, rank: rankIdx + 1 }));
    }
    if (isGaushala) return GAUSHALA_DEFAULT_WARDS;
    return PANCHPOKHARI_DEFAULT_WARDS;
  }, [dbWards, isGaushala]);

  const wardsList = useMemo(() => {
    if (Array.isArray(dbWards) && dbWards.length > 0) {
      return [...dbWards].sort((a: any, b: any) => (a.ward_number || a.wardNo || 0) - (b.ward_number || b.wardNo || 0)).map((w: any, idx: number) => {
        const wNo = w.ward_number || w.wardNo || (idx + 1);
        const rawName = w.name || '';
        const wName = rawName.startsWith('वडा') ? rawName : `वडा नं. ${toNepaliDigits(wNo)} (${rawName || 'वडा'})`;
        return { ward_number: wNo, name: wName };
      });
    }
    if (isGaushala) {
      return GAUSHALA_DEFAULT_WARDS.map(w => ({ ward_number: w.wardNo, name: w.name }));
    }
    return PANCHPOKHARI_DEFAULT_WARDS.map(w => ({ ward_number: w.wardNo, name: w.name }));
  }, [dbWards, isGaushala]);

  const totalWardsCount = wardsList.length || profile?.totalWards || (isGaushala ? 12 : (isKhadadevi ? 9 : (isBenighat ? 10 : 8)));

  // ── 6 Core Executive KPI Cards (Single Source of Truth) ────────────────────
  const kpiMetrics = [
    {
      key: 'total_citizens',
      titleNepali: 'कुल नागरिक (जनसंख्या)',
      titleEn: 'TOTAL CITIZENS',
      value: toNepaliDigits(profile?.totalPopulation || (isGaushala ? 72481 : (stats.totalPopulation || 20540))),
      unit: 'जना',
      icon: <Users size={22} />,
      color: '#38BDF8',
      bgColor: 'rgba(56, 189, 248, 0.15)',
      trendText: '🟢 केन्द्रीय SSoT सिंक',
      isUp: true,
      note: `घरधुरी औसत: ${profile?.demographics?.averageFamilySize || (isGaushala ? '५.०२' : '३.५')} जना • जनघनत्व: ${profile?.demographics?.density || (isGaushala ? '५००.८' : '४७.१')}/कि.मि.²`,
      onClick: () => navigate(readOnly ? '/profile?tab=demographics' : '/app/profile?tab=demographics'),
      tooltip: 'पालिका प्रोफाइल तथा जनसांख्यिकी हेर्न क्लिक गर्नुहोस्',
    },
    {
      key: 'total_households',
      titleNepali: 'डिजिटल दर्ता घरधुरी',
      titleEn: 'REGISTERED HOUSEHOLDS',
      value: toNepaliDigits(profile?.totalHouseholds || (isGaushala ? 14446 : (stats.totalHouseholds || 5805))),
      unit: 'घर',
      icon: <Home size={22} />,
      color: '#10B981',
      bgColor: 'rgba(16, 185, 129, 0.15)',
      trendText: '🟢 १००% GIS म्यापिङ',
      isUp: true,
      note: `सुरक्षित आवास: ९१.२% • जोखिम क्षेत्र: ${toNepaliDigits(profile?.demographics?.highRiskHouses || 142)} घर`,
      onClick: () => handleTabChange('operations'),
      tooltip: 'घरधुरी म्याट्रिक्स लगत हेर्न क्लिक गर्नुहोस्',
    },
    {
      key: 'active_projects',
      titleNepali: 'सञ्चालित विकास योजनाहरू',
      titleEn: 'ACTIVE PROJECTS',
      value: toNepaliDigits(stats.totalProjects || 156),
      unit: 'योजना',
      icon: <Tractor size={22} />,
      color: '#F59E0B',
      bgColor: 'rgba(245, 158, 11, 0.15)',
      trendText: '🟢 +१५.२% सम्पन्नता',
      isUp: true,
      note: 'सम्पन्न: १२४ योजना • चालु/जारी: ३२ योजना',
      onClick: () => navigate(readOnly ? '/progress-reports' : '/app/progress-reports', { state: { selectedModuleKey: 2 } }),
      tooltip: 'विकास योजना प्रतिवेदन खोल्न क्लिक गर्नुहोस्',
    },
    {
      key: 'budget_utilization',
      titleNepali: 'बजेट उपयोग तथा खर्च',
      titleEn: 'BUDGET UTILIZED',
      value: isGaushala ? 'रु. ५९.८०' : 'रु. ५७.६८',
      unit: 'करोड',
      icon: <Banknote size={22} />,
      color: '#EC4899',
      bgColor: 'rgba(236, 72, 153, 0.15)',
      trendText: isGaushala ? '🟢 ८०.३% वित्तीय प्रगति' : '🟢 ८२.४% वित्तीय प्रगति',
      isUp: true,
      note: isGaushala
        ? 'कुल विनियोजन: रु. ७४.५० करोड • आन्तरिक: रु. ४.२५ करोड'
        : (profile?.annualBudget ? `कुल विनियोजन: ${profile.annualBudget} • आन्तरिक: ${profile.internalRevenue || 'रु. २.८ करोड'}` : 'कुल विनियोजन: रु. ६९.९८ करोड • आन्तरिक: रु. २.८ करोड'),
      onClick: () => handleTabChange('executive'),
      tooltip: 'बजेट उपयोग विवरण हेर्न क्लिक गर्नुहोस्',
    },
    {
      key: 'sifaris_issued',
      titleNepali: 'जारी विद्युतीय सिफारिस',
      titleEn: 'SIFARIS ISSUED',
      value: '६३६',
      unit: 'वटा',
      icon: <FileText size={22} />,
      color: '#8B5CF6',
      bgColor: 'rgba(139, 92, 246, 0.15)',
      trendText: '🟢 +८.४% नागरिक सेवा',
      isUp: true,
      note: 'अनलाइन ई-सेवा दर: ९१.०% • औसत समय: २४ मिनेट',
      onClick: () => navigate('/citizen-services'),
      tooltip: 'नागरिक ई-सेवा फाराम खोल्न क्लिक गर्नुहोस्',
    },
    {
      key: 'building_permits',
      titleNepali: 'भवन निर्माण तथा नक्सा पास',
      titleEn: 'BUILDING PERMITS',
      value: '२१८',
      unit: 'वटा',
      icon: <Building2 size={22} />,
      color: '#06B6D4',
      bgColor: 'rgba(6, 182, 212, 0.15)',
      trendText: '🟢 +१२.०% नक्सा पास',
      isUp: true,
      note: 'GIS प्रमाणिकरण: ९४.५% • अनलाइन आवेदन: ८८%',
      onClick: () => (readOnly ? navigate('/ebps') : handleTabChange('operations')),
      tooltip: 'भवन निर्माण तथा नक्सा पास हेर्न क्लिक गर्नुहोस्',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* CSS Animations */}
      <style>{`
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.35)} }
      `}</style>

      {/* ── Hero Banner (Admin Hero vs Public View Banner) ─────────────────── */}
      {!readOnly ? (
        <div
          style={{
            borderRadius: '24px',
            background: 'linear-gradient(135deg, #091e3a 0%, #0d284f 40%, #0f3d3e 75%, #064e3b 100%)',
            color: '#ffffff',
            padding: '2.25rem 2.5rem',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 16px 40px rgba(9,30,58,0.28)',
            border: '1px solid rgba(255,255,255,0.12)',
          }}
        >
          {/* Subtle glowing radial backdrop */}
          <div
            style={{
              position: 'absolute',
              top: '-40%',
              right: '-10%',
              width: '450px',
              height: '450px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(16,185,129,0.18) 0%, rgba(59,130,246,0) 70%)',
              pointerEvents: 'none',
            }}
          />

          <div style={{ position: 'relative', zIndex: 1 }}>
            {/* Top row: Headline on left, Live HUD on right */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1fr) auto',
                gap: '2rem',
                alignItems: 'center',
              }}
            >
              <div>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    backgroundColor: 'rgba(255,255,255,0.14)',
                    padding: '0.35rem 0.95rem',
                    borderRadius: '9999px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    marginBottom: '1rem',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.25)',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
                  }}
                >
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#10b981',
                      boxShadow: '0 0 10px #10b981',
                      animation: 'pulse-dot 2s infinite',
                      display: 'inline-block',
                    }}
                  />
                  <span style={{ letterSpacing: '0.02em' }}>LIVE · एकीकृत डिजिटल ट्विन प्लेटफर्म</span>
                  <span style={{ opacity: 0.4 }}>|</span>
                  <span style={{ color: '#a7f3d0', fontWeight: 700 }}>३३ विषयगत क्षेत्र सिङ्क</span>
                  <span style={{ opacity: 0.4 }}>|</span>
                  <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>
                    अन्तिम अपडेट: {lastUpdated.toLocaleTimeString('ne-NP')}
                  </span>
                </div>

                <h1
                  style={{
                    fontSize: '2.3rem',
                    fontWeight: 800,
                    marginBottom: '0.75rem',
                    lineHeight: 1.25,
                    color: '#ffffff',
                    letterSpacing: '-0.02em',
                  }}
                >
                  नक्सामा विकास। तथ्याङ्कमा प्रगति। <br />
                  <span style={{ color: '#fbbf24' }}>AI र GIS बाट एकीकृत निर्णय प्रणाली</span>
                </h1>

                <p style={{ opacity: 0.92, fontSize: '0.98rem', lineHeight: 1.6, margin: 0, color: '#e2e8f0', maxWidth: '820px' }}>
                  {palikaName}को आधिकारिक एकीकृत डिजिटल ट्विन — ३३ विषयगत क्षेत्रहरू, राष्ट्रिय जनगणना तथा डिजिटल घरधुरी लगत,
                  ३D टोपोग्राफी, र नागरिक सेवा एउटै प्रणालीमा।
                </p>
              </div>

              {/* Right Mini Live HUD Card (fills the empty space) */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.6rem',
                  background: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(14px)',
                  border: '1px solid rgba(255, 255, 255, 0.16)',
                  borderRadius: '18px',
                  padding: '1.1rem 1.35rem',
                  minWidth: '290px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.12)', paddingBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#a7f3d0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    डिजिटल ट्विन अवस्था
                  </span>
                  <span style={{ fontSize: '0.7rem', background: 'rgba(16,185,129,0.25)', color: '#34d399', padding: '2px 8px', borderRadius: '9999px', fontWeight: 700, border: '1px solid rgba(52,211,153,0.3)' }}>
                    ● सक्रिय
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.55rem' }}>
                  <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '10px', padding: '0.45rem 0.65rem' }}>
                    <div style={{ fontSize: '0.68rem', color: '#cbd5e1' }}>कुल घरधुरी</div>
                    <div style={{ fontSize: '1.18rem', fontWeight: 800, color: '#ffffff' }}>
                      {toNepaliDigits(profile?.totalHouseholds || stats.totalHouseholds || 5805)}
                    </div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '10px', padding: '0.45rem 0.65rem' }}>
                    <div style={{ fontSize: '0.68rem', color: '#cbd5e1' }}>कुल जनसंख्या</div>
                    <div style={{ fontSize: '1.18rem', fontWeight: 800, color: '#ffffff' }}>
                      {toNepaliDigits(profile?.totalPopulation || stats.totalPopulation || 20540)}
                    </div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '10px', padding: '0.45rem 0.65rem' }}>
                    <div style={{ fontSize: '0.68rem', color: '#cbd5e1' }}>विषयगत शाखा</div>
                    <div style={{ fontSize: '1.18rem', fontWeight: 800, color: '#fbbf24' }}>३३ क्षेत्र</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '10px', padding: '0.45rem 0.65rem' }}>
                    <div style={{ fontSize: '0.68rem', color: '#cbd5e1' }}>GPS प्रमाणीकरण</div>
                    <div style={{ fontSize: '1.18rem', fontWeight: 800, color: '#34d399' }}>१००%</div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Integrated Executive Controls & Action Bar ── */}
            <div
              style={{
                marginTop: '1.65rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem',
                flexWrap: 'wrap',
                padding: '0.65rem 0.85rem',
                background: 'rgba(15, 23, 42, 0.55)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.14)',
                backdropFilter: 'blur(12px)',
                boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.1), 0 8px 24px rgba(0, 0, 0, 0.2)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                {/* Ward Filter */}
                <select
                  value={selectedWard}
                  onChange={(e) => setSelectedWard(Number(e.target.value))}
                  style={{
                    background: 'rgba(30, 41, 59, 0.85)',
                    color: '#F8FAFC',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '10px',
                    padding: '0.5rem 0.85rem',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                  title="वडा अनुसार फिल्टर गर्नुहोस्"
                >
                  <option value={0}>समग्र {palikaTypeLabel} (All Wards)</option>
                  {wardsList.map((w: any) => (
                    <option key={w.ward_number} value={w.ward_number}>{w.name}</option>
                  ))}
                </select>

                {/* Fiscal Year Selector */}
                <select
                  value={fiscalYear}
                  onChange={(e) => setFiscalYear(e.target.value)}
                  style={{
                    background: 'rgba(30, 41, 59, 0.85)',
                    color: '#F8FAFC',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '10px',
                    padding: '0.5rem 0.85rem',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                  title="आर्थिक वर्ष छनोट गर्नुहोस्"
                >
                  {fiscalYears.map((fy) => (
                    <option key={fy.id} value={fy.name}>
                      {fy.isCurrent ? `चालु आ.व. ${fy.name}` : `आ.व. ${fy.name}`}
                    </option>
                  ))}
                </select>

                <Link
                  to="/gis-map"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    backgroundColor: '#fbbf24',
                    color: '#0f172a',
                    padding: '0.5rem 0.95rem',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    textDecoration: 'none',
                    boxShadow: '0 2px 8px rgba(251,191,36,0.3)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Layers size={15} />
                  <span>३D डिजिटल नक्सा</span>
                </Link>

                <Link
                  to="/app/progress-reports"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    backgroundColor: '#6366f1',
                    color: '#ffffff',
                    padding: '0.5rem 0.95rem',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    textDecoration: 'none',
                    boxShadow: '0 2px 8px rgba(99,102,241,0.35)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <FileCheck2 size={15} />
                  <span>३३ विषयगत प्रगति प्रतिवेदन</span>
                </Link>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Link
                  to="/app/profile?tab=demographics"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    background: 'rgba(245, 158, 11, 0.18)',
                    color: '#FBBF24',
                    border: '1px solid rgba(245, 158, 11, 0.4)',
                    padding: '0.5rem 0.95rem',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                  }}
                  title="केन्द्रीय पालिका प्रोफाइल तथा जनसांख्यिकी सम्पादन गर्नुहोस्"
                >
                  <Edit3 size={15} />
                  <span>केन्द्रीय प्रोफाइल सम्पादन</span>
                </Link>

                <button
                  onClick={fetchStats}
                  disabled={isRefreshing}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    backgroundColor: 'rgba(255,255,255,0.12)',
                    color: '#ffffff',
                    border: '1px solid rgba(255,255,255,0.25)',
                    padding: '0.5rem 0.95rem',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <RefreshCw size={14} style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} />
                  <span>{isRefreshing ? 'ताजा हुँदै...' : 'ताजा डाटा'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ── Public View Mode Header Banner ── */
        <div
          id="unified-dashboard"
          style={{
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0d9488 100%)',
            color: '#ffffff',
            padding: '1.75rem 2rem',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 10px 30px rgba(15,23,42,0.18)',
            border: '1px solid rgba(255,255,255,0.15)',
          }}
        >
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    backgroundColor: 'rgba(255,255,255,0.14)',
                    padding: '0.3rem 0.85rem',
                    borderRadius: '9999px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    marginBottom: '0.65rem',
                    border: '1px solid rgba(255,255,255,0.25)',
                  }}
                >
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} />
                  <span>सार्वजनिक दृश्य (Public View) · एकीकृत डिजिटल ट्विन कमान्ड</span>
                  <span style={{ opacity: 0.4 }}>|</span>
                  <span style={{ color: '#a7f3d0', fontWeight: 700 }}>३३ विषयगत क्षेत्र प्रत्यक्ष सिङ्क</span>
                </div>
                <h2 style={{ fontSize: '1.85rem', fontWeight: 800, margin: '0 0 0.35rem', color: '#ffffff', lineHeight: 1.25 }}>
                  {palikaName}: <span style={{ color: '#fbbf24' }}>एकीकृत कमान्ड ड्यासबोर्ड</span>
                </h2>
                <p style={{ color: '#cbd5e1', fontSize: '0.88rem', margin: 0, maxWidth: '750px', lineHeight: 1.5 }}>
                  कार्यपालिका निर्णय सहायता, ३३ वटै विषयगत क्षेत्रको प्रगति म्याट्रिक्स, र नागरिक कार्यसञ्चालनको प्रमाणित आधिकारिक विवरण (View Mode)
                </p>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', padding: '0.6rem 1rem', borderRadius: '12px', textAlign: 'right' }}>
                <div style={{ fontSize: '0.7rem', color: '#cbd5e1' }}>डाटा प्रमाणीकरण</div>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#34d399' }}>केन्द्रीय SSoT सिङ्क</div>
              </div>
            </div>

            {/* Public Controls Toolbar */}
            <div
              style={{
                marginTop: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem',
                flexWrap: 'wrap',
                padding: '0.6rem 0.85rem',
                background: 'rgba(15, 23, 42, 0.6)',
                borderRadius: '14px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                <select
                  value={selectedWard}
                  onChange={(e) => setSelectedWard(Number(e.target.value))}
                  style={{
                    background: 'rgba(30, 41, 59, 0.85)',
                    color: '#F8FAFC',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    padding: '0.45rem 0.75rem',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                  title="वडा अनुसार फिल्टर गर्नुहोस्"
                >
                  <option value={0}>समग्र {palikaTypeLabel} (All Wards)</option>
                  {wardsList.map((w: any) => (
                    <option key={w.ward_number} value={w.ward_number}>{w.name}</option>
                  ))}
                </select>

                <select
                  value={fiscalYear}
                  onChange={(e) => setFiscalYear(e.target.value)}
                  style={{
                    background: 'rgba(30, 41, 59, 0.85)',
                    color: '#F8FAFC',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    padding: '0.45rem 0.75rem',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                  title="आर्थिक वर्ष छनोट गर्नुहोस्"
                >
                  {fiscalYears.map((fy) => (
                    <option key={fy.id} value={fy.name}>
                      {fy.isCurrent ? `चालु आ.व. ${fy.name}` : `आ.व. ${fy.name}`}
                    </option>
                  ))}
                </select>

                <Link
                  to="/gis-map"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    backgroundColor: '#fbbf24',
                    color: '#0f172a',
                    padding: '0.45rem 0.85rem',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    textDecoration: 'none',
                  }}
                >
                  <Layers size={14} />
                  <span>३D डिजिटल नक्सा</span>
                </Link>

                <Link
                  to="/progress-reports"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    backgroundColor: '#6366f1',
                    color: '#ffffff',
                    padding: '0.45rem 0.85rem',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    textDecoration: 'none',
                  }}
                >
                  <FileCheck2 size={14} />
                  <span>३३ विषयगत प्रगति प्रतिवेदन</span>
                </Link>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Link
                  to="/profile?tab=demographics"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    background: 'rgba(245, 158, 11, 0.18)',
                    color: '#FBBF24',
                    border: '1px solid rgba(245, 158, 11, 0.4)',
                    padding: '0.45rem 0.85rem',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    textDecoration: 'none',
                  }}
                >
                  <Building2 size={14} />
                  <span>प्रमाणित पालिका प्रोफाइल</span>
                </Link>

                <button
                  type="button"
                  onClick={fetchStats}
                  disabled={isRefreshing}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    background: 'rgba(16, 185, 129, 0.2)',
                    color: '#34D399',
                    border: '1px solid rgba(16, 185, 129, 0.45)',
                    padding: '0.45rem 0.85rem',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: isRefreshing ? 'not-allowed' : 'pointer',
                  }}
                >
                  <RefreshCw size={14} style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} />
                  <span>{isRefreshing ? 'ताजा हुँदै...' : 'ताजा डाटा'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 6 Core Executive KPI Cards (Single Source of Truth) ── */}
      <div className="exec-kpi-grid">
        {kpiMetrics.map((kpi) => (
          <div
            className="exec-kpi-card"
            key={kpi.key}
            style={{
              '--card-accent': kpi.color,
              cursor: kpi.onClick ? 'pointer' : 'default',
            } as React.CSSProperties}
            onClick={kpi.onClick}
            title={kpi.tooltip}
          >
            <div className="exec-kpi-top-row">
              <div
                className="exec-kpi-icon-badge"
                style={{
                  '--badge-bg': kpi.bgColor,
                  '--badge-color': kpi.color,
                } as React.CSSProperties}
              >
                {kpi.icon}
              </div>
              <span className="exec-trend-pill up">{kpi.trendText}</span>
            </div>

            <div className="exec-kpi-center">
              <div className="exec-kpi-title-nepali">{kpi.titleNepali}</div>
              <div className="exec-kpi-title-en">{kpi.titleEn}</div>
              <div className="exec-kpi-value-row">
                <span className="exec-kpi-number">{kpi.value}</span>
                <span className="exec-kpi-unit">{kpi.unit}</span>
              </div>
            </div>

            <div className="exec-kpi-footer">
              <span>{kpi.note}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Master Unified 3 Mode Navigation Tabs ── */}
      <div className="unified-tabs-container">
        <button
          type="button"
          className={`unified-tab-button ${activeTab === 'executive' ? 'active' : ''}`}
          onClick={() => handleTabChange('executive')}
        >
          <TrendingUp size={18} />
          <span>१. कार्यपालिका कमान्ड (Executive BI)</span>
          <span className="unified-tab-tag">निर्णय सहायता</span>
        </button>

        <button
          type="button"
          className={`unified-tab-button ${activeTab === 'thematic' ? 'active' : ''}`}
          onClick={() => handleTabChange('thematic')}
        >
          <Layers size={18} />
          <span>२. ३३ विषयगत क्षेत्र सारांश (Thematic Matrix)</span>
          <span className="unified-tab-tag">५ मुख्य विधा</span>
        </button>

        <button
          type="button"
          className={`unified-tab-button ${activeTab === 'operations' ? 'active' : ''}`}
          onClick={() => handleTabChange('operations')}
        >
          <Activity size={18} />
          <span>३. दैनिक कार्यसञ्चालन तथा सेवा (Operations)</span>
          <span className="unified-tab-tag">लगत तथा ई-सेवा</span>
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 1: कार्यपालिका कमान्ड (Executive BI & Intelligence)
          ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'executive' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Live Analytical Visual Panels */}
          <div className="exec-analytics-section">
            {/* Panel 1: मासिक पूँजीगत खर्च तथा बजेट उपयोग ट्रेन्ड */}
            <div className="exec-panel-card">
              <div className="exec-panel-header">
                <h3 className="exec-panel-title">
                  <TrendingUp size={19} color="#38BDF8" />
                  <span>मासिक बजेट विनियोजन तथा पूँजीगत खर्च ट्रेन्ड ({fiscalYear})</span>
                </h3>
                <span className="exec-panel-subtitle">
                  कुल खर्च: <strong style={{ color: '#34D399' }}>{isGaushala ? 'रु. ५९.८० करोड (८०.३%)' : 'रु. ५७.६८ करोड (८२.४%)'}</strong>
                </span>
              </div>

              <div className="exec-chart-bars-wrap">
                {monthlySpending.map((item, idx) => (
                  <div className="exec-chart-month-row" key={idx}>
                    <span className="exec-month-label">{item.month}</span>
                    <div className="exec-month-track" title={`${item.month}: रु. ${item.spent} करोड खर्च (${item.pct}%)`}>
                      <div
                        className="exec-month-bar-spent"
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                    <span className="exec-month-val">रु. {item.spent} करोड ({item.pct}%)</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94A3B8', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.65rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span>📊 पूँजीगत खर्च: <strong>७४.२%</strong> • चालु खर्च: <strong>२५.८%</strong></span>
                <span style={{ color: '#38BDF8' }}>स्रोत: सुत्र (SuTRA) तथा कोष तथा लेखा नियन्त्रक</span>
              </div>
            </div>

            {/* Panel 2: वडागत विकास श्रेणी तथा सम्पत्ति स्वास्थ्य */}
            <div className="exec-panel-card">
              <div className="exec-panel-header">
                <h3 className="exec-panel-title">
                  <ShieldCheck size={19} color="#10B981" />
                  <span>वडागत विकास श्रेणी तथा सम्पत्ति स्वास्थ्य</span>
                </h3>
                <span className="exec-panel-subtitle">{toNepaliDigits(totalWardsCount)} वटा वडाको समग्र कार्यसम्पादन</span>
              </div>

              {/* Asset Health Bar */}
              <div style={{ padding: '0.65rem 0.85rem', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                  <span style={{ color: '#34D399' }}>🟢 चालु: ७४.६% (१८२)</span>
                  <span style={{ color: '#FBBF24' }}>🟡 मर्मत: १८.९% (४६)</span>
                  <span style={{ color: '#F87171' }}>🔴 पुनर्निर्माण: ६.५% (१६)</span>
                </div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
                  <div style={{ width: '74.6%', background: '#10B981' }} />
                  <div style={{ width: '18.9%', background: '#F59E0B' }} />
                  <div style={{ width: '6.5%', background: '#EF4444' }} />
                </div>
              </div>

              {/* Ward Ranking List */}
              <div className="exec-ward-rankings-list">
                {wardRankings.slice(0, 5).map((w) => (
                  <div className="exec-ward-row" key={w.rank}>
                    <div className="exec-ward-rank-pill">#{w.rank}</div>
                    <div className="exec-ward-name">{w.name}</div>
                    <div className="exec-ward-bar-wrap">
                      <div className="exec-ward-bar-fill" style={{ width: `${w.score}%` }} />
                    </div>
                    <div className="exec-ward-score">{w.score}%</div>
                  </div>
                ))}
              </div>

              <div style={{ textAlign: 'right' }}>
                <button
                  type="button"
                  onClick={() => navigate('/app/progress-reports', { state: { activeTab: 'kpis' } })}
                  style={{ background: 'none', border: 'none', color: '#38BDF8', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                >
                  <span>सबै {toNepaliDigits(totalWardsCount)} वडाको विस्तृत श्रेणी हेर्नुहोस्</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* AI & GIS Section in Tab 1 */}
          <div>
            <div style={{ marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={24} color="#3b82f6" /> 
                डिजिटल ट्विन स्मार्ट ड्यासबोर्ड (Predictive AI & GIS)
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>
                आर्टिफिसियल इन्टेलिजेन्समा आधारित प्रक्षेपण र भौगोलिक नक्साङ्कन प्रणाली
              </p>
            </div>
            
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden', marginBottom: '2rem' }}>
              <PredictiveAnalytics />
            </div>

            <div style={{ border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden', height: '600px' }}>
              <MunicipalGISMap />
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 2: ३३ विषयगत क्षेत्र सारांश (33 Thematic Sectors Matrix)
          ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'thematic' && (
        <ThematicPillarsMatrix readOnly={readOnly} />
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 3: दैनिक कार्यसञ्चालन तथा सेवा (Operations & Live Registry)
          ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'operations' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* ── DEMOGRAPHICS HIGHLIGHTS SECTION ──────────────────────── */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              border: '1.5px solid #e2e8f0',
              padding: '1.5rem 1.75rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            }}
          >
            <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.25rem',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: '#2563eb',
                  display: 'inline-block',
                }}
              />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                जनसांख्यिकी तथा घरधुरी प्रोफाइल (Demographic & Household Profile)
              </h2>
            </div>
            <p style={{ color: '#64748b', fontSize: '0.82rem', margin: '0.25rem 0 0 0' }}>
              राष्ट्रिय जनगणना २०७८ तथा डिजिटल GPS घरधुरी सर्भेको आधिकारिक प्रमाणित तथ्याङ्क
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
            {!readOnly && (
              <Link
                to="/app/profile?tab=demographics"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  color: '#b45309',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  textDecoration: 'none',
                  padding: '0.45rem 0.95rem',
                  background: '#fef3c7',
                  borderRadius: '8px',
                  border: '1px solid #fde68a',
                  boxShadow: '0 2px 6px rgba(217,119,6,0.1)',
                  transition: 'background 0.2s',
                }}
                title="केन्द्रीय पालिका प्रोफाइल सम्पादन गर्नुहोस्"
              >
                <Edit3 size={15} color="#d97706" />
                <span>केन्द्रीय प्रोफाइल सम्पादन</span>
                <ChevronRight size={14} />
              </Link>
            )}

            <Link
              to={readOnly ? "#household-matrix-registry" : "/app/households"}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                color: '#047857',
                fontWeight: 700,
                fontSize: '0.82rem',
                textDecoration: 'none',
                padding: '0.45rem 0.95rem',
                background: '#ecfdf5',
                borderRadius: '8px',
                border: '1px solid #a7f3d0',
                boxShadow: '0 2px 6px rgba(5,150,105,0.1)',
              }}
            >
              <Home size={15} color="#059669" />
              <span>घरधुरी म्याट्रिक्स ({toNepaliDigits(stats.totalHouseholds ?? 5805)} घर)</span>
              <ChevronRight size={14} />
            </Link>

            <Link
              to="/profile?tab=demographics"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: '#2563eb',
                fontWeight: 700,
                fontSize: '0.82rem',
                textDecoration: 'none',
                padding: '0.45rem 0.95rem',
                background: '#eff6ff',
                borderRadius: '8px',
                border: '1px solid #bfdbfe',
                transition: 'background 0.2s',
              }}
            >
              <span>विस्तृत जनसांख्यिकी</span>
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem' }}>
          {/* कुल जनसंख्या */}
          <div
            style={{
              background: 'linear-gradient(135deg, #f0f9ff 0%, #ffffff 100%)',
              borderRadius: '16px',
              border: '1.5px solid #bae6fd',
              padding: '1.2rem',
              boxShadow: '0 4px 16px rgba(2,132,199,0.06)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #0284c7, #38bdf8)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#0284c7', textTransform: 'uppercase' }}>
                कुल जनसंख्या (जनगणना)
              </span>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={19} color="#0284c7" />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', margin: '0.35rem 0' }}>
              <span style={{ fontSize: '1.95rem', fontWeight: 800, color: '#0c4a6e', lineHeight: 1.1 }}>
                {toNepaliDigits(stats.totalPopulation ?? 20540)}
              </span>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0284c7' }}>जना</span>
            </div>
            <div style={{ fontSize: '0.73rem', color: '#0369a1', fontWeight: 600, marginBottom: '0.35rem' }}>
              👨 पुरुष: {toNepaliDigits(stats.malePopulation ?? 9950)} · 👩 महिला: {toNepaliDigits(stats.femalePopulation ?? 10590)}
            </div>
            <div style={{ fontSize: '0.68rem', color: '#0284c7', background: '#e0f2fe', padding: '2px 8px', borderRadius: '6px', display: 'inline-block', fontWeight: 700 }}>
              लैंगिक अनुपात: ९४.० • जनघनत्व: ४७.१/किमि²
            </div>
          </div>

          {/* कुल घरधुरी */}
          <div
            style={{
              background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)',
              borderRadius: '16px',
              border: '1.5px solid #bbf7d0',
              padding: '1.2rem',
              boxShadow: '0 4px 16px rgba(22,163,74,0.06)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #16a34a, #4ade80)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase' }}>
                कुल घरधुरी (डिजिटल लगत)
              </span>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building2 size={19} color="#16a34a" />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', margin: '0.35rem 0' }}>
              <span style={{ fontSize: '1.95rem', fontWeight: 800, color: '#14532d', lineHeight: 1.1 }}>
                {toNepaliDigits(stats.totalHouseholds ?? 5805)}
              </span>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#16a34a' }}>घर</span>
            </div>
            <div style={{ fontSize: '0.73rem', color: '#15803d', fontWeight: 600, marginBottom: '0.35rem' }}>
              📍 GPS लगत: {toNepaliDigits(stats.totalGpsHouses ?? 5357)} घर · जोखिम: {toNepaliDigits(stats.highRiskHouses ?? 142)} घर
            </div>
            <div style={{ fontSize: '0.68rem', color: '#16a34a', background: '#dcfce7', padding: '2px 8px', borderRadius: '6px', display: 'inline-block', fontWeight: 700 }}>
              १००% GPS प्रमाणित • औसत परिवार: ३.५ जना
            </div>
          </div>

          {/* साक्षरता दर */}
          <div
            style={{
              background: 'linear-gradient(135deg, #faf5ff 0%, #ffffff 100%)',
              borderRadius: '16px',
              border: '1.5px solid #e9d5ff',
              padding: '1.2rem',
              boxShadow: '0 4px 16px rgba(147,51,234,0.06)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #9333ea, #c084fc)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#9333ea', textTransform: 'uppercase' }}>
                साक्षरता दर (समग्र)
              </span>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <GraduationCap size={19} color="#9333ea" />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', margin: '0.35rem 0' }}>
              <span style={{ fontSize: '1.95rem', fontWeight: 800, color: '#581c87', lineHeight: 1.1 }}>
                {toNepaliDigits(stats.literacyRate ?? 72.0)}
              </span>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#9333ea' }}>%</span>
            </div>
            <div style={{ fontSize: '0.73rem', color: '#7e22ce', fontWeight: 600, marginBottom: '0.35rem' }}>
              पुरुष: {toNepaliDigits(stats.maleLiteracyRate ?? 81.4)}% · महिला: {toNepaliDigits(stats.femaleLiteracyRate ?? 65.3)}%
            </div>
            <div style={{ fontSize: '0.68rem', color: '#9333ea', background: '#f3e8ff', padding: '2px 8px', borderRadius: '6px', display: 'inline-block', fontWeight: 700 }}>
              उच्च शिक्षा: ८% • एसएलसी+: ३४%
            </div>
          </div>

          {/* आर्थिक सक्रिय जनशक्ति */}
          <div
            style={{
              background: 'linear-gradient(135deg, #eef2ff 0%, #ffffff 100%)',
              borderRadius: '16px',
              border: '1.5px solid #c7d2fe',
              padding: '1.2rem',
              boxShadow: '0 4px 16px rgba(79,70,229,0.06)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #4f46e5, #818cf8)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#4f46e5', textTransform: 'uppercase' }}>
                आर्थिक सक्रिय जनशक्ति
              </span>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={19} color="#4f46e5" />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', margin: '0.35rem 0' }}>
              <span style={{ fontSize: '1.95rem', fontWeight: 800, color: '#312e81', lineHeight: 1.1 }}>
                {toNepaliDigits(stats.economicallyActive ?? 8200)}
              </span>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#4f46e5' }}>जना</span>
            </div>
            <div style={{ fontSize: '0.73rem', color: '#4338ca', fontWeight: 600, marginBottom: '0.35rem' }}>
              श्रम सहभागिता दर: {toNepaliDigits(stats.participationRate ?? 58.7)}% (कृषि: {toNepaliDigits(7812)} जना)
            </div>
            <div style={{ fontSize: '0.68rem', color: '#4f46e5', background: '#e0e7ff', padding: '2px 8px', borderRadius: '6px', display: 'inline-block', fontWeight: 700 }}>
              वैदेशिक रोजगारी: {toNepaliDigits(stats.abroadPopulation ?? 1840)} जना
            </div>
          </div>

          {/* विपद् जोखिम व्यवस्थापन */}
          <div
            style={{
              background: 'linear-gradient(135deg, #fff7ed 0%, #ffffff 100%)',
              borderRadius: '16px',
              border: '1.5px solid #fed7aa',
              padding: '1.2rem',
              boxShadow: '0 4px 16px rgba(234,88,12,0.06)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #ea580c, #fb923c)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#ea580c', textTransform: 'uppercase' }}>
                विपद् जोखिम व्यवस्थापन
              </span>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#ffedd5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertTriangle size={19} color="#ea580c" />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', margin: '0.35rem 0' }}>
              <span style={{ fontSize: '1.95rem', fontWeight: 800, color: '#7c2d12', lineHeight: 1.1 }}>
                {toNepaliDigits(stats.highRiskSettlements ?? 4)}
              </span>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ea580c' }}>बस्ती उच्च जोखिम</span>
            </div>
            <div style={{ fontSize: '0.73rem', color: '#c2410c', fontWeight: 600, marginBottom: '0.35rem' }}>
              पहिरो तथा नदी कटान क्षेत्र • {toNepaliDigits(stats.totalShelters ?? 8)} सुरक्षित आश्रयस्थल
            </div>
            <div style={{ fontSize: '0.68rem', color: '#c2410c', background: '#ffedd5', padding: '2px 8px', borderRadius: '6px', display: 'inline-block', fontWeight: 700 }}>
              आश्रयस्थल क्षमता: {toNepaliDigits(stats.totalShelterCapacity ?? 1640)} जना
            </div>
          </div>

          {/* प्रशासनिक भूगोल */}
          <div
            style={{
              background: 'linear-gradient(135deg, #f0fdfa 0%, #ffffff 100%)',
              borderRadius: '16px',
              border: '1.5px solid #99f6e4',
              padding: '1.2rem',
              boxShadow: '0 4px 16px rgba(13,148,136,0.06)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #0d9488, #2dd4bf)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#0d9488', textTransform: 'uppercase' }}>
                प्रशासनिक भूगोल तथा केन्द्र
              </span>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#ccfbf1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Compass size={19} color="#0d9488" />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', margin: '0.35rem 0' }}>
              <span style={{ fontSize: '1.95rem', fontWeight: 800, color: '#134e4a', lineHeight: 1.1 }}>
                {toNepaliDigits(totalWardsCount)}
              </span>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0d9488' }}>वडाहरू</span>
            </div>
            <div style={{ fontSize: '0.73rem', color: '#0f766e', fontWeight: 600, marginBottom: '0.35rem' }}>
              क्षेत्रफल: {toNepaliDigits(profile?.totalAreaSqKm || (isGaushala ? '144.73' : '187.29'))} वर्ग कि.मि. · केन्द्र: {profile?.headquarters || (isGaushala ? 'गौशाला बजार' : 'थाङपालधाप')}
            </div>
            <div style={{ fontSize: '0.68rem', color: '#0d9488', background: '#ccfbf1', padding: '2px 8px', borderRadius: '6px', display: 'inline-block', fontWeight: 700 }}>
              {isGaushala ? 'उचाइ: ६१ - १५० मिटर • तराई-मधेश उर्वर भूगोल' : (profile?.elevationMeters || 'उचाइ: १,०५० - ६,३४० मिटर • हिमाली भूगोल')}
            </div>
          </div>
        </div>
      </div>

      {/* ── DIGITAL HOUSEHOLD MATRIX REGISTRY & GOOGLE SHEET / EXCEL IMPORT ── */}
      <div
        id="household-matrix-registry"
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          border: '1.5px solid #cbd5e1',
          padding: '1.5rem 1.75rem',
          boxShadow: '0 4px 24px rgba(0,0,0,0.05)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.25rem',
            paddingBottom: '1rem',
            borderBottom: '1.5px solid #f1f5f9',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontSize: '1.5rem' }}>🏡</span>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                डिजिटल घरधुरी म्याट्रिक्स लगत तथा गुगल शिट / एक्सेल आयात
              </h2>
              <span
                style={{
                  backgroundColor: '#ecfdf5',
                  color: '#059669',
                  border: '1px solid #a7f3d0',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  padding: '2px 10px',
                  borderRadius: '6px',
                }}
              >
                {toNepaliDigits(stats.totalHouseholds ?? 5357)} घरधुरी प्रमाणित (Live Registry)
              </span>
            </div>
            <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0.35rem 0 0 0' }}>
              प्रत्येक घरधुरीको आधिकारिक नम्बर, GPS अक्षांश/देशान्तर, परिवार विवरण, घरको प्रकार, जोखिम अवस्था तथा गुगल स्प्रिडशिट / CSV फाइल सिधै आयात गर्ने प्रशासनिक केन्द्र
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            <Link
              to="/app/households"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: '#1d4ed8',
                fontWeight: 700,
                fontSize: '0.82rem',
                textDecoration: 'none',
                padding: '0.5rem 1rem',
                background: '#eff6ff',
                borderRadius: '8px',
                border: '1px solid #bfdbfe',
              }}
            >
              <ExternalLink size={14} />
              <span>पूरा स्क्रिनमा हेर्नुहोस् (Full Page View)</span>
            </Link>
          </div>
        </div>

        {/* Embedded Interactive Household Registry Table, Map, and Importer */}
        <HouseholdRegistryTab />
      </div>

      {/* ── 18 SECTORAL DATA CARDS ────────────────────────────────── */}
      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.25rem',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div>
            <h2
              style={{
                fontSize: '1.35rem',
                fontWeight: 800,
                color: '#0f172a',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
              }}
            >
              {loading ? (
                <Loader2 size={20} color="#2563eb" style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                <Activity size={20} color="#10b981" />
              )}
              क्षेत्रगत तथ्याङ्क (Live Sectoral Data Overview)
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>
              पालिकाको केन्द्रीय डाटाबेसबाट १८ वटै क्षेत्रका वास्तविक रियल-टाइम संख्याहरू
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: '#ecfdf5',
                color: '#059669',
                padding: '0.35rem 0.85rem',
                borderRadius: '9999px',
                fontSize: '0.78rem',
                fontWeight: 700,
                border: '1px solid #a7f3d0',
              }}
            >
              <CheckCircle2 size={14} color="#10b981" />
              <span>डाटाबेस सिङ्क भएको (Live DB)</span>
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(215px, 1fr))',
            gap: '1rem',
          }}
        >
          {sectorCards.map((card) => (
            <StatCard key={card.label} {...card} readOnly={readOnly} />
          ))}
        </div>
      </div>

      {/* ── THEMATIC SECTORS DIRECT ACCESS GRID ───────────────────────────── */}
      <div>
        <div style={{ marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            विषयगत शाखाहरू तथा डिजिटल सेवा (Thematic Sectors & Gov SaaS)
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>
            सबै शाखाहरूको अन्तरसम्बन्धित डिजिटल ट्विन प्रणाली, ई-सेवा र नागरिक बडापत्र
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '1.15rem',
          }}
        >
          {thematicSectors.map((sector) => {
            const cardStyle: React.CSSProperties = {
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1.5px solid #e2e8f0',
              padding: '1.2rem',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '1rem',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
            };
            const inner = (
              <>
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '12px',
                    backgroundColor: sector.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {sector.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.25rem' }}>
                    <strong style={{ fontSize: '0.92rem', color: '#0f172a', display: 'block', marginBottom: '2px' }}>
                      {sector.label}
                    </strong>
                    {(sector as any).badge && (
                      <span
                        style={{
                          fontSize: '0.68rem',
                          backgroundColor: '#eff6ff',
                          color: '#2563eb',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {(sector as any).badge}
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.4, display: 'block' }}>
                    {sector.desc}
                  </span>
                </div>
              </>
            );
            return (
              <Link
                key={sector.path}
                to={sector.path}
                style={cardStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 10px 24px rgba(0,0,0,0.07)';
                  e.currentTarget.style.borderColor = '#94a3b8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.02)';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                }}
              >
                {inner}
              </Link>
            );
          })}
        </div>
      </div>
        </div>
      )}
    </div>
  );
};

export default DashboardOverview;
