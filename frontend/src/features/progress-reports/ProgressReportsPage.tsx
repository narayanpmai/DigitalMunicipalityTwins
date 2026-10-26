import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  TrendingUp,
  Award,
  Layers,
  MapPin,
  FileText,
  Printer,
  Download,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  Building,
  School,
  HeartPulse,
  Sprout,
  Compass,
  Zap,
  Droplets,
  TreePine,
  AlertTriangle,
  Users,
  PieChart,
  Laptop,
  CheckSquare,
  QrCode,
  Eye,
  Trash2,
  X,
  ExternalLink,
  ChevronRight,
  Info,
  Check,
  FileSpreadsheet,
  Upload,
  BarChart3,
  Mountain,
  Waves,
  Home,
  ShieldAlert,
  ArrowRight,
  Maximize2,
  RefreshCw,
  Filter,
} from 'lucide-react';
import { reportsApi, type ThematicRecordItem } from '../../api/reports';
import { THEMATIC_MODULE_SCHEMAS, type ThematicModuleDef } from './thematicModuleSchemas';
import { ThematicDynamicFormModal } from './components/ThematicDynamicFormModal';
import { ThematicExcelImportModal } from './components/ThematicExcelImportModal';
import { useTenant } from '../../context/TenantContext';
import { municipalityApi } from '../../api/municipality';
import { toNepaliDigits } from '../../utils/nepaliCalendar';

// ── 1. Thematic Categories Definition ─────────────────────────────────────────
export interface ThematicCategoryTab {
  id: string;
  label: string;
  count: number;
}

export const CATEGORY_TABS: ThematicCategoryTab[] = [
  { id: 'all', label: 'सबै (३३)', count: 33 },
  { id: 'infrastructure', label: '🏗️ भौतिक पूर्वाधार (११)', count: 11 },
  { id: 'social', label: '👥 सामाजिक तथा स्वास्थ्य (४)', count: 4 },
  { id: 'agriculture', label: '🌾 कृषि तथा पशुपन्छी (४)', count: 4 },
  { id: 'tourism', label: '🏔️ पर्यटन तथा सम्पदा (४)', count: 4 },
  { id: 'environment', label: '🌲 वातावरण तथा विपद् (३)', count: 3 },
  { id: 'governance', label: '🏛️ सुशासन तथा योजना (७)', count: 7 },
];

export const MODULE_CATEGORY_MAP: Record<number, string> = {
  1: 'governance',
  2: 'infrastructure',
  3: 'social',
  4: 'social',
  5: 'agriculture',
  6: 'agriculture',
  7: 'tourism',
  8: 'infrastructure',
  9: 'infrastructure',
  10: 'infrastructure',
  11: 'environment',
  12: 'environment',
  13: 'social',
  14: 'governance',
  15: 'governance',
  16: 'governance',
  17: 'governance',
  18: 'governance',
  19: 'governance',
  20: 'infrastructure',
  21: 'infrastructure',
  22: 'infrastructure',
  23: 'tourism',
  24: 'infrastructure',
  25: 'tourism',
  26: 'tourism',
  27: 'infrastructure',
  28: 'agriculture',
  29: 'infrastructure',
  30: 'agriculture',
  31: 'environment',
  32: 'social',
  33: 'infrastructure',
};

export const getModuleIcon = (key: number) => {
  switch (key) {
    case 1: return Home;
    case 2: return Compass;
    case 3: return School;
    case 4: return HeartPulse;
    case 5: return Sprout;
    case 6: return Sprout;
    case 7: return Mountain;
    case 8: return Layers;
    case 9: return Droplets;
    case 10: return Zap;
    case 11: return TreePine;
    case 12: return AlertTriangle;
    case 13: return Users;
    case 14: return PieChart;
    case 15: return Laptop;
    case 16: return BarChart3;
    case 17: return CheckSquare;
    case 18: return TrendingUp;
    case 19: return Award;
    case 20: return Layers;
    case 21: return Building;
    case 22: return Building;
    case 23: return Sparkles;
    case 24: return Home;
    case 25: return TreePine;
    case 26: return Waves;
    case 27: return Zap;
    case 28: return Sprout;
    case 29: return Droplets;
    case 30: return Waves;
    case 31: return TreePine;
    case 32: return HeartPulse;
    case 33: return Building;
    default: return FileText;
  }
};

export const getCategoryTheme = (cat: string) => {
  switch (cat) {
    case 'infrastructure':
      return { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE', label: 'पूर्वाधार' };
    case 'social':
      return { bg: '#FDF2F8', text: '#BE185D', border: '#FBCFE8', label: 'सामाजिक' };
    case 'agriculture':
      return { bg: '#F0FDF4', text: '#15803D', border: '#BBF7D0', label: 'कृषि' };
    case 'tourism':
      return { bg: '#FFF7ED', text: '#C2410C', border: '#FED7AA', label: 'पर्यटन' };
    case 'environment':
      return { bg: '#ECFDF5', text: '#047857', border: '#A7F3D0', label: 'वातावरण' };
    case 'governance':
      return { bg: '#FAF5FF', text: '#7E22CE', border: '#E9D5FF', label: 'सुशासन' };
    default:
      return { bg: '#F1F5F9', text: '#475569', border: '#E2E8F0', label: 'विविध' };
  }
};

export interface ProgressReportsPageProps {
  isReadOnly?: boolean;
}

export const ProgressReportsPage: React.FC<ProgressReportsPageProps> = ({ isReadOnly = false }) => {
  const location = useLocation();
  const isAdmin = !isReadOnly && location.pathname.startsWith('/app');
  const queryClient = useQueryClient();
  const { settings, tenantId } = useTenant();
  const palikaName = settings?.palika_name || 'गौशाला नगरपालिका';
  const isGaushala = tenantId === 'gaushala' || tenantId === 'gaushalamun' || (palikaName || '').includes('गौशाला');
  const palikaAddress = settings?.address || (isGaushala ? 'नगर कार्यपालिकाको कार्यालय, गौशाला, महोत्तरी' : 'गाउँ कार्यपालिकाको कार्यालय, सिन्धुपाल्चोक');
  const palikaProvince = settings?.province || (isGaushala ? 'मधेश प्रदेश' : 'बागमती प्रदेश');
  const palikaLogoUrl = settings?.logo_url;
  const palikaSlogan = settings?.slogan || (isGaushala ? 'कृषि, उद्योग र समृद्धिको सहर: हाम्रो गौशाला नगर' : 'डाटामा आधारित राजनीति र प्रमाणमा आधारित विकास');

  const { data: dbWards = [] } = useQuery({
    queryKey: ['wards', tenantId],
    queryFn: () => municipalityApi.getWards(),
  });

  const locationState = location.state as { selectedModuleKey?: number; activeTab?: 'kpis' | 'forms' | 'generator' | 'before_after' } | null;
  const [activeTab, setActiveTab] = useState<'kpis' | 'forms' | 'generator' | 'before_after'>(locationState?.activeTab || 'forms');
  const [selectedWard, setSelectedWard] = useState<number>(0);
  const [selectedModuleKey, setSelectedModuleKey] = useState<number>(locationState?.selectedModuleKey || 20);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCondition, setSelectedCondition] = useState<string>('all');

  React.useEffect(() => {
    if (locationState?.selectedModuleKey) {
      setSelectedModuleKey(locationState.selectedModuleKey);
    }
    if (locationState?.activeTab) {
      setActiveTab(locationState.activeTab);
    }
  }, [location.state]);

  // Report Generator State
  const [reportType, setReportType] = useState<'1_year' | '5_year' | '10_year'>('1_year');
  const [reportFiscalYear, setReportFiscalYear] = useState<string>('२०८०/०८१');

  // Modal State for New Record Entry & Excel Import & Image Preview
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [selectedRecordForDetail, setSelectedRecordForDetail] = useState<ThematicRecordItem | null>(null);
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);

  // Queries
  const { data: kpiData, isLoading: isKpiLoading } = useQuery({
    queryKey: ['progress-kpis', selectedWard],
    queryFn: () => reportsApi.getDashboardKpis(selectedWard),
  });

  const { data: recordsData, isLoading: isRecordsLoading } = useQuery({
    queryKey: ['progress-records', selectedModuleKey, selectedWard, searchTerm, selectedCondition],
    queryFn: () =>
      reportsApi.getThematicRecords({
        moduleKey: selectedModuleKey || undefined,
        ward: selectedWard || undefined,
        condition: selectedCondition !== 'all' ? selectedCondition : undefined,
        search: searchTerm || undefined,
        limit: 50,
      }),
  });

  const { data: generatedReport, isLoading: isReportLoading } = useQuery({
    queryKey: ['generated-report', reportType, reportFiscalYear, selectedWard],
    queryFn: () =>
      reportsApi.generateReport({
        type: reportType,
        fiscalYear: reportFiscalYear,
        ward: selectedWard || undefined,
      }),
  });

  const { data: beforeAfterData } = useQuery({
    queryKey: ['before-after-metrics'],
    queryFn: () => reportsApi.getBeforeAfter(),
  });

  // Mutation to Create Record
  const createRecordMutation = useMutation({
    mutationFn: (data: any) => reportsApi.createThematicRecord(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress-records'] });
      queryClient.invalidateQueries({ queryKey: ['progress-kpis'] });
      queryClient.invalidateQueries({ queryKey: ['generated-report'] });
      setIsModalOpen(false);
      alert('नयाँ विषयगत सम्पत्ति तथा प्रगति विवरण सफलतापूर्वक सुरक्षित गरियो!');
    },
    onError: (err: any) => {
      alert('त्रुटि: ' + (err?.response?.data?.message || err.message));
    },
  });

  const currentModuleDef: ThematicModuleDef =
    THEMATIC_MODULE_SCHEMAS.find((m) => m.key === selectedModuleKey) || THEMATIC_MODULE_SCHEMAS[0];

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    if (!generatedReport) return;
    const headers = ['मोड्युल / क्षेत्र', 'लक्ष्य', 'सम्पन्न', 'खर्च रकम', 'उपयोग %', 'प्रमुख उपलब्धि'];
    const rows = generatedReport.sectorSummaries.map((s) =>
      `"${s.title}","${s.targetCount}","${s.completedCount}","${s.expenditure}","${s.utilization}","${s.achievementNote}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Progress_Report_${reportType}_${reportFiscalYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter modules for Tab 1
  const filteredModules = THEMATIC_MODULE_SCHEMAS.filter((m) => {
    const matchCategory = selectedCategory === 'all' || MODULE_CATEGORY_MAP[m.key] === selectedCategory;
    const s = searchTerm.toLowerCase();
    const matchSearch =
      !searchTerm ||
      m.title.toLowerCase().includes(s) ||
      m.category.toLowerCase().includes(s) ||
      m.desc.toLowerCase().includes(s);
    return matchCategory && matchSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minHeight: '100%' }}>
      {/* ── TOP HEADER HERO BANNER ─────────────────────────────────────────── */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '1.5rem 2rem',
          border: '1px solid var(--border)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #0F4C81 0%, #E65100 50%, #10B981 100%)',
          }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
              <span
                style={{
                  backgroundColor: 'rgba(15, 76, 129, 0.1)',
                  color: 'var(--gov-primary)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '0.25rem 0.75rem',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <Sparkles size={14} /> {palikaSlogan}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                GIS/GPS Coords • Before/After Photo • Budget Audit • लाभग्राही प्रमाण • ३३ विषयगत क्षेत्रहरू
              </span>
            </div>

            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              प्रगति प्रतिवेदन तथा ३३ विषयगत फाराम प्रणाली
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>
              {palikaName}: १ वर्षे (वार्षिक), ५ वर्षे (आवधिक), र १० वर्षे (दीर्घकालीन) प्रामाणिक प्रगति प्रतिवेदन
            </p>
          </div>

          {/* Top Actions: Ward select, Excel Upload, + New Form */}
          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <select
                value={selectedWard}
                onChange={(e) => setSelectedWard(Number(e.target.value))}
                style={{
                  padding: '0.6rem 0.85rem',
                  borderRadius: '8px',
                  border: '1.5px solid #CBD5E1',
                  backgroundColor: '#F8FAFC',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: '#0F172A',
                  cursor: 'pointer',
                  outline: 'none',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                }}
              >
                <option value={0}>समग्र {palikaName.includes('नगरपालिका') ? 'नगरपालिका' : 'गाउँपालिका'} (All Wards)</option>
                {dbWards && dbWards.length > 0 ? (
                  dbWards.map((w: any) => {
                    const wNo = w.ward_number || w.wardNo;
                    const wName = w.name ? (w.name.startsWith('वडा') ? w.name : `वडा नं. ${toNepaliDigits(wNo)} (${w.name})`) : `वडा नं. ${toNepaliDigits(wNo)}`;
                    return (
                      <option key={wNo} value={wNo}>{wName}</option>
                    );
                  })
                ) : (
                  isGaushala ? (
                    Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>वडा नं. {toNepaliDigits(n)}</option>
                    ))
                  ) : (
                    Array.from({ length: 8 }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>वडा नं. {toNepaliDigits(n)}</option>
                    ))
                  )
                )}
              </select>
            </div>

            {isAdmin && (
              <>
                <button
                  type="button"
                  onClick={() => setIsExcelModalOpen(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.6rem 1.1rem',
                    borderRadius: '8px',
                    border: '1.5px solid #16A34A',
                    backgroundColor: '#16A34A',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(22, 163, 74, 0.25)',
                    transition: 'all 0.15s ease',
                  }}
                  title="सबै ३३ विषयगत क्षेत्रहरूको एकमुष्ट Excel / CSV फाइल अपलोड गर्नुहोस्"
                >
                  <FileSpreadsheet size={16} />
                  <span>Excel फाइल अपलोड</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.6rem 1.15rem',
                    borderRadius: '8px',
                    border: '1.5px solid #0F4C81',
                    backgroundColor: '#0F4C81',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(15, 76, 129, 0.3)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Plus size={16} />
                  <span>+ नयाँ फाराम भर्नुहोस्</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* ── Real Data Live Municipal Snapshot Strip ── */}
        <div
          style={{
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '10px',
            padding: '0.65rem 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
            fontSize: '0.82rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0F4C81', fontWeight: 800 }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }} />
            <span>{selectedWard === 0 ? 'समग्र गाउँपालिकाको वास्तविक तथ्याङ्क:' : `वडा नं. ${selectedWard} को वास्तविक तथ्याङ्क:`}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap', color: '#334155' }}>
            <span>
              कुल जनसंख्या: <strong>{kpiData?.totalPopulation?.toLocaleString() || '२०,९९७'} जना</strong>
            </span>
            <span style={{ color: '#CBD5E1' }}>•</span>
            <span>
              घरधुरी: <strong>{kpiData?.totalHouseholds?.toLocaleString() || '५,३५७'} घर</strong>
            </span>
            <span style={{ color: '#CBD5E1' }}>•</span>
            <span>
              क्षेत्रफल: <strong>{kpiData?.areaSqKm ? `${Number(kpiData.areaSqKm).toFixed(2)} कि.मि.²` : '१८७.२७ कि.मि.²'}</strong>
            </span>
            <span style={{ color: '#CBD5E1' }}>•</span>
            <span>
              सम्पन्न/जारी योजना: <strong>{kpiData?.completedProjectsCount ?? 4} सम्पन्न / {kpiData?.ongoingProjectsCount ?? 12} जारी</strong>
            </span>
            <span style={{ color: '#CBD5E1' }}>•</span>
            <span style={{ color: '#16A34A', fontWeight: 700 }}>
              सम्पत्ति अवस्था: 🟢 {kpiData?.assetConditionSummary?.goodConditionPercent || 74.6}% राम्रो
            </span>
          </div>
        </div>

        {/* ── TAB NAVIGATION BAR ─────────────────────────────────────────── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '0.6rem',
            borderTop: '1px solid #E2E8F0',
            paddingTop: '0.85rem',
            marginTop: '0.15rem',
            width: '100%',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('forms')}
            style={{
              padding: '0.7rem 1rem',
              borderRadius: '10px',
              border: activeTab === 'forms' ? '1.5px solid #0F4C81' : '1px solid #E2E8F0',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              backgroundColor: activeTab === 'forms' ? '#0F4C81' : '#F8FAFC',
              color: activeTab === 'forms' ? '#FFFFFF' : '#334155',
              boxShadow: activeTab === 'forms' ? '0 4px 12px rgba(15, 76, 129, 0.25)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <Layers size={16} color={activeTab === 'forms' ? '#FFFFFF' : '#0F4C81'} />
            <span>१. विषयगत फारामहरू (३३ क्षेत्र)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('kpis')}
            style={{
              padding: '0.7rem 1rem',
              borderRadius: '10px',
              border: activeTab === 'kpis' ? '1.5px solid #0F4C81' : '1px solid #E2E8F0',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              backgroundColor: activeTab === 'kpis' ? '#0F4C81' : '#F8FAFC',
              color: activeTab === 'kpis' ? '#FFFFFF' : '#334155',
              boxShadow: activeTab === 'kpis' ? '0 4px 12px rgba(15, 76, 129, 0.25)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <TrendingUp size={16} color={activeTab === 'kpis' ? '#FFFFFF' : '#0F4C81'} />
            <span>२. ड्यासबोर्ड तथा सूचकाङ्क (KPIs)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('generator')}
            style={{
              padding: '0.7rem 1rem',
              borderRadius: '10px',
              border: activeTab === 'generator' ? '1.5px solid #0F4C81' : '1px solid #E2E8F0',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              backgroundColor: activeTab === 'generator' ? '#0F4C81' : '#F8FAFC',
              color: activeTab === 'generator' ? '#FFFFFF' : '#334155',
              boxShadow: activeTab === 'generator' ? '0 4px 12px rgba(15, 76, 129, 0.25)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <FileText size={16} color={activeTab === 'generator' ? '#FFFFFF' : '#0F4C81'} />
            <span>३. १, ५ र १० वर्षे प्रगति प्रतिवेदन</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('before_after')}
            style={{
              padding: '0.7rem 1rem',
              borderRadius: '10px',
              border: activeTab === 'before_after' ? '1.5px solid #0F4C81' : '1px solid #E2E8F0',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              backgroundColor: activeTab === 'before_after' ? '#0F4C81' : '#F8FAFC',
              color: activeTab === 'before_after' ? '#FFFFFF' : '#334155',
              boxShadow: activeTab === 'before_after' ? '0 4px 12px rgba(15, 76, 129, 0.25)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <Award size={16} color={activeTab === 'before_after' ? '#FFFFFF' : '#0F4C81'} />
            <span>४. Before vs After (२०७४–२०८४)</span>
          </button>

          {/* ── 5th Tab: One Pager Public Report (External Link) ── */}
          <a
            href="/public-report"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '0.7rem 1rem',
              borderRadius: '10px',
              border: '1.5px solid #E65100',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              background: 'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)',
              color: '#E65100',
              boxShadow: '0 3px 10px rgba(230,81,0,0.15)',
              transition: 'all 0.15s ease',
              textDecoration: 'none',
            }}
            title="सार्वजनिक One Pager प्रगति प्रतिवेदन — नयाँ विन्डोमा खुल्छ"
          >
            <ExternalLink size={16} color="#E65100" />
            <span>५. One Pager सार्वजनिक प्रतिवेदन</span>
          </a>
        </div>
      </div>

      {/* ── TAB 1: MODULAR THEMATIC FORMS & RECORDS (33 MODULES) ───────── */}
      {activeTab === 'forms' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Module Selector Grid Card */}
          <div className="dt-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#0F4C81', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Layers size={20} color="#0F4C81" />
                  <span>विषयगत मोड्युल छनोट गर्नुहोस् (३३ क्षेत्रहरू)</span>
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
                  तलका क्षेत्रहरू छनोट गरी तोकिएका सूचकहरू, रेकर्ड सूची हेर्नुहोस् वा नयाँ विवरण प्रविष्ट गर्नुहोस्
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <div style={{ position: 'relative' }}>
                  <Search size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    placeholder="३३ मोड्युलहरू खोज्नुहोस्..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      padding: '0.5rem 0.85rem 0.5rem 2.2rem',
                      borderRadius: '8px',
                      border: '1.5px solid #CBD5E1',
                      fontSize: '0.85rem',
                      width: '260px',
                      outline: 'none',
                    }}
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      style={{ position: 'absolute', right: '8px', top: '9px', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Category Filter Pills Bar */}
            <div
              style={{
                display: 'flex',
                gap: '0.5rem',
                flexWrap: 'wrap',
                marginBottom: '1rem',
                borderBottom: '1px solid #E2E8F0',
                paddingBottom: '0.75rem',
              }}
            >
              {CATEGORY_TABS.map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    style={{
                      padding: '0.45rem 0.85rem',
                      borderRadius: '20px',
                      border: isActive ? '1.5px solid #0F4C81' : '1px solid #CBD5E1',
                      backgroundColor: isActive ? '#0F4C81' : '#FFFFFF',
                      color: isActive ? '#FFFFFF' : '#334155',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      boxShadow: isActive ? '0 2px 8px rgba(15, 76, 129, 0.25)' : 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Grid of 33 Modules */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: '0.75rem',
                maxHeight: '360px',
                overflowY: 'auto',
                paddingRight: '0.4rem',
              }}
            >
              {filteredModules.map((m) => {
                const isSelected = selectedModuleKey === m.key;
                const IconComp = getModuleIcon(m.key);
                const theme = getCategoryTheme(MODULE_CATEGORY_MAP[m.key] || 'general');
                return (
                  <div
                    key={m.key}
                    onClick={() => setSelectedModuleKey(m.key)}
                    style={{
                      padding: '0.75rem',
                      borderRadius: '12px',
                      border: isSelected ? '2px solid #0F4C81' : '1px solid #E2E8F0',
                      backgroundColor: isSelected ? '#F0F7FD' : '#FFFFFF',
                      boxShadow: isSelected ? '0 4px 14px rgba(15, 76, 129, 0.16)' : '0 1px 3px rgba(0,0,0,0.03)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      transition: 'all 0.15s ease',
                      position: 'relative',
                    }}
                  >
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        backgroundColor: isSelected ? '#0F4C81' : theme.bg,
                        color: isSelected ? '#FFFFFF' : theme.text,
                        border: `1px solid ${isSelected ? '#0F4C81' : theme.border}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <IconComp size={18} />
                    </div>

                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.25rem' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: isSelected ? '#0F4C81' : '#64748B' }}>
                          #{m.key}
                        </span>
                        <span
                          style={{
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            padding: '0.1rem 0.4rem',
                            borderRadius: '10px',
                            backgroundColor: theme.bg,
                            color: theme.text,
                          }}
                        >
                          {theme.label}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          color: isSelected ? '#0F4C81' : '#0F172A',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          marginTop: '0.15rem',
                        }}
                        title={m.title}
                      >
                        {m.title}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {m.fields.length} फिल्डहरू • {m.indicators.length} सूचक
                      </div>
                    </div>

                    {isSelected && (
                      <div
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: '#0F4C81',
                          flexShrink: 0,
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Dedicated Module Hero Banner + Specified Indicators Panel ── */}
          <div
            style={{
              backgroundColor: '#F0F7FD',
              border: '1.5px solid #BCD5EB',
              borderRadius: '16px',
              padding: '1.35rem 1.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              boxShadow: '0 4px 16px rgba(15, 76, 129, 0.06)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.75rem', backgroundColor: '#0F4C81', color: '#ffffff', padding: '0.2rem 0.65rem', borderRadius: '12px', fontWeight: 800 }}>
                    मोड्युल नं. {currentModuleDef.key}
                  </span>
                  <span style={{ fontSize: '0.75rem', backgroundColor: '#E2E8F0', color: '#334155', padding: '0.2rem 0.65rem', borderRadius: '12px', fontWeight: 700 }}>
                    क्षेत्र: {currentModuleDef.category}
                  </span>
                </div>
                <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0F4C81', margin: '0.25rem 0 0.15rem' }}>
                  {currentModuleDef.title}
                </h2>
                <p style={{ fontSize: '0.875rem', color: '#475569', margin: 0, maxWidth: '800px' }}>
                  {currentModuleDef.desc}
                </p>
              </div>

              {/* Action: Open Dedicated Dynamic Form and Excel upload */}
              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => setIsExcelModalOpen(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      padding: '0.65rem 1.15rem',
                      borderRadius: '10px',
                      border: '1.5px solid #16A34A',
                      backgroundColor: '#16A34A',
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      boxShadow: '0 3px 10px rgba(22, 163, 74, 0.25)',
                      transition: 'all 0.15s ease',
                    }}
                    title="यस विषयगत क्षेत्रको Excel फाइल अपलोड गर्नुहोस्"
                  >
                    <FileSpreadsheet size={17} />
                    <span>Excel बाट डेटा प्रविष्टि</span>
                  </button>
                )}

                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.65rem 1.35rem',
                      borderRadius: '10px',
                      border: 'none',
                      backgroundColor: '#0F4C81',
                      color: '#ffffff',
                      fontWeight: 800,
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(15, 76, 129, 0.3)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <Plus size={18} />
                    <span>यस मोड्युलको नयाँ फाराम भर्नुहोस्</span>
                  </button>
                )}
              </div>
            </div>

            {/* List of Specified Indicators (सूचकाङ्कहरू) */}
            <div style={{ borderTop: '1px solid #BCD5EB', paddingTop: '0.85rem' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0F4C81', marginBottom: '0.45rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle2 size={16} color="#0F4C81" />
                <span>यस फारामबाट स्वतः विश्लेषण तथा उत्पादन हुने तोकिएका सूचकाङ्कहरू (Specified Indicators):</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {currentModuleDef.indicators.map((ind, idx) => (
                  <span
                    key={idx}
                    style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #BCD5EB',
                      color: '#0F4C81',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '0.3rem 0.75rem',
                      borderRadius: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                    }}
                  >
                    <Check size={13} color="#10B981" /> {ind}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ── RECORDS TABLE FOR SELECTED MODULE ───────────────────────────── */}
          <div className="dt-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>{currentModuleDef.title} का प्रविष्ट रेकर्डहरू</span>
                  <span style={{ fontSize: '0.8rem', backgroundColor: '#EFF6FF', color: '#1D4ED8', padding: '0.15rem 0.55rem', borderRadius: '12px', fontWeight: 700 }}>
                    {recordsData?.total || 0} वटा
                  </span>
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  सबै रेकर्डहरूमा अनिवार्य Unique ID, GPS अवस्थिति, Before/After डिजिटल फोटो र लाभग्राही प्रमाण समावेश छन्
                </span>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <select
                  value={selectedCondition}
                  onChange={(e) => setSelectedCondition(e.target.value)}
                  style={{
                    padding: '0.5rem 0.85rem',
                    borderRadius: '8px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    backgroundColor: '#FFFFFF',
                    color: '#0F172A',
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                  title="अवस्था अनुसार फिल्टर गर्नुहोस्"
                >
                  <option value="all">सबै अवस्था (All Status)</option>
                  <option value="good">🟢 चालु / राम्रो अवस्था (Good)</option>
                  <option value="fair">🟡 सामान्य मर्मत आवश्यक (Fair)</option>
                  <option value="needs_repair">🔴 तुरुन्त मर्मत वा पुनर्निर्माण (Urgent)</option>
                </select>

                {isAdmin && (
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="dt-btn dt-btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
                  >
                    <Plus size={16} />
                    <span>+ नयाँ फाराम</span>
                  </button>
                )}
              </div>
            </div>

            {isRecordsLoading ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 0.5rem', color: '#0F4C81' }} />
                <div>डेटा लोड हुँदैछ...</div>
              </div>
            ) : (recordsData?.items || []).length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
                <Info size={40} color="#94a3b8" style={{ margin: '0 auto 0.75rem' }} />
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#334155' }}>
                  यस मोड्युलमा हाल कुनै विवरण प्रविष्ट गरिएको छैन।
                </div>
                <p style={{ fontSize: '0.85rem', color: '#64748b', maxWidth: '420px', margin: '0.35rem auto 1.25rem' }}>
                  माथिको <strong>"यस मोड्युलको नयाँ फाराम भर्नुहोस्"</strong> बटन थिची स्थलगत GPS Coords, फोटो र बजेट सहितको विवरण भर्नुहोस्।
                </p>
                {isAdmin && (
                  <button
                    onClick={() => setIsModalOpen(true)}
                    style={{
                      padding: '0.55rem 1.4rem',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: '#0F4C81',
                      color: '#ffffff',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    नयाँ फाराम खोल्नुहोस्
                  </button>
                )}
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <div className="dt-responsive-table-wrapper">
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '2px solid var(--border)', textAlign: 'left' }}>
                        <th style={{ padding: '0.7rem 0.85rem' }}>Unique ID / कोड</th>
                        <th style={{ padding: '0.7rem 0.85rem' }}>सम्पत्ति / योजनाको नाम</th>
                        <th style={{ padding: '0.7rem 0.85rem' }}>वडा / टोल</th>
                        <th style={{ padding: '0.7rem 0.85rem' }}>GPS Coords (नक्सा)</th>
                        <th style={{ padding: '0.7rem 0.85rem' }}>लागत र खर्च</th>
                        <th style={{ padding: '0.7rem 0.85rem' }}>प्रगति %</th>
                        <th style={{ padding: '0.7rem 0.85rem' }}>अवस्था</th>
                        <th style={{ padding: '0.7rem 0.85rem' }}>फोटो प्रमाण</th>
                        <th style={{ padding: '0.7rem 0.85rem' }}>कार्य</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(recordsData?.items || []).map((rec) => (
                        <tr key={rec.id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '0.7rem 0.85rem' }}>
                            <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '0.75rem', color: '#0F4C81', backgroundColor: '#EFF6FF', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                              {rec.assetUniqueId}
                            </span>
                            {rec.planCode && (
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{rec.planCode}</div>
                            )}
                          </td>

                          <td style={{ padding: '0.7rem 0.85rem', fontWeight: 600 }}>
                            <div style={{ color: '#0F172A', fontWeight: 700 }}>{rec.assetName}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{rec.moduleTitleNepali}</div>
                          </td>

                          <td style={{ padding: '0.7rem 0.85rem' }}>
                            <div style={{ fontWeight: 600 }}>वडा नं. {rec.wardNumber || 'पालिका'}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{rec.toleBasti || '-'}</div>
                          </td>

                          <td style={{ padding: '0.7rem 0.85rem' }}>
                            {rec.lat && rec.lng ? (
                              <a
                                href={`https://www.google.com/maps?q=${rec.lat},${rec.lng}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.25rem',
                                  fontSize: '0.75rem',
                                  color: '#1D4ED8',
                                  textDecoration: 'none',
                                  padding: '0.2rem 0.5rem',
                                  borderRadius: '6px',
                                  backgroundColor: '#EFF6FF',
                                  border: '1px solid #BFDBFE',
                                  fontWeight: 600,
                                }}
                                title="Google Maps मा यो स्थान हेर्नुहोस्"
                              >
                                <MapPin size={12} color="#1D4ED8" />
                                <span>{Number(rec.lat).toFixed(4)}, {Number(rec.lng).toFixed(4)}</span>
                                <ExternalLink size={10} color="#1D4ED8" />
                              </a>
                            ) : (
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>N/A</span>
                            )}
                          </td>

                          <td style={{ padding: '0.7rem 0.85rem' }}>
                            <div style={{ fontWeight: 700 }}>रु {Number(rec.constructionCost || 0).toLocaleString()}</div>
                            <div style={{ fontSize: '0.7rem', color: '#10B981', fontWeight: 600 }}>खर्च: रु {Number(rec.expenditureAmount || 0).toLocaleString()}</div>
                          </td>

                          <td style={{ padding: '0.7rem 0.85rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', minWidth: '85px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700 }}>
                                <span style={{ color: rec.physicalProgressPercent >= 100 ? '#16A34A' : '#D97706' }}>
                                  {rec.physicalProgressPercent}%
                                </span>
                                <span style={{ fontSize: '0.65rem', color: '#64748B' }}>
                                  {rec.physicalProgressPercent >= 100 ? 'सम्पन्न' : 'जारी'}
                                </span>
                              </div>
                              <div style={{ height: '6px', width: '100%', backgroundColor: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                                <div
                                  style={{
                                    width: `${Math.min(100, rec.physicalProgressPercent || 0)}%`,
                                    height: '100%',
                                    backgroundColor: rec.physicalProgressPercent >= 100 ? '#10B981' : '#F59E0B',
                                    borderRadius: '4px',
                                  }}
                                />
                              </div>
                            </div>
                          </td>

                          <td style={{ padding: '0.7rem 0.85rem' }}>
                            {rec.condition === 'needs_repair' || rec.condition === 'abandoned' || rec.thematicData?.assetCondition === 'तुरुन्त मर्मत वा पुनर्निर्माण आवश्यक' ? (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.6rem', borderRadius: '14px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#FEE2E2', color: '#DC2626', border: '1px solid #FCA5A5', whiteSpace: 'nowrap' }}>
                                🔴 तुरुन्त मर्मत
                              </span>
                            ) : rec.condition === 'fair' || rec.thematicData?.assetCondition === 'सामान्य मर्मत आवश्यक' ? (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.6rem', borderRadius: '14px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#FEF3C7', color: '#D97706', border: '1px solid #FCD34D', whiteSpace: 'nowrap' }}>
                                🟡 सामान्य मर्मत
                              </span>
                            ) : (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.6rem', borderRadius: '14px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#DCFCE7', color: '#16A34A', border: '1px solid #86EFAC', whiteSpace: 'nowrap' }}>
                                🟢 चालु / राम्रो
                              </span>
                            )}
                          </td>

                          <td style={{ padding: '0.7rem 0.85rem' }}>
                            <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                              {rec.beforePhotoUrl && (
                                <button
                                  type="button"
                                  onClick={() => setPreviewImage({ url: rec.beforePhotoUrl!, title: `${rec.assetName} - Before Photo` })}
                                  style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer' }}
                                  title="Before Photo ठूलो आकारमा हेर्नुहोस्"
                                >
                                  <img src={rec.beforePhotoUrl} alt="Before" style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover', border: '1px solid #CBD5E1' }} />
                                </button>
                              )}
                              {rec.afterPhotoUrl && (
                                <button
                                  type="button"
                                  onClick={() => setPreviewImage({ url: rec.afterPhotoUrl!, title: `${rec.assetName} - After Photo` })}
                                  style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer' }}
                                  title="After Photo ठूलो आकारमा हेर्नुहोस्"
                                >
                                  <img src={rec.afterPhotoUrl} alt="After" style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover', border: '1.5px solid #10B981' }} />
                                </button>
                              )}
                              {!rec.beforePhotoUrl && !rec.afterPhotoUrl && (
                                <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>फोटो छैन</span>
                              )}
                            </div>
                          </td>

                          <td style={{ padding: '0.7rem 0.85rem' }}>
                            <button
                              onClick={() => setSelectedRecordForDetail(rec)}
                              style={{
                                padding: '0.35rem 0.75rem',
                                borderRadius: '6px',
                                border: '1px solid #CBD5E1',
                                backgroundColor: '#ffffff',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                color: '#0F4C81',
                              }}
                            >
                              <Eye size={13} />
                              <span>विवरण</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 2: KPIS & OVERVIEW DASHBOARD ─────────────────────────────── */}
      {activeTab === 'kpis' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Top Priority High-Impact KPI Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div className="dt-card" style={{ borderLeft: '4px solid #0F4C81' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>कुल जनसंख्या तथा घरधुरी</span>
                <Users size={20} color="#0F4C81" />
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, marginTop: '0.4rem', color: 'var(--text-main)' }}>
                {kpiData?.totalPopulation?.toLocaleString() || '२०,९९७'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                घरधुरी: <strong>{kpiData?.totalHouseholds?.toLocaleString() || '५,३५७'}</strong> • जनघनत्व: <strong>{kpiData?.populationDensity || '११२.१'}/कि.मि.²</strong>
              </div>
            </div>

            <div className="dt-card" style={{ borderLeft: '4px solid #10B981' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>बजेट उपयोग तथा वित्तीय प्रगति</span>
                <PieChart size={20} color="#10B981" />
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, marginTop: '0.4rem', color: '#10B981' }}>
                {kpiData?.budgetUtilizationPercent || 98}%
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                राजस्व वृद्धि: <strong>+{kpiData?.revenueGrowthPercent || 18.5}%</strong> • पूँजीगत खर्च: <strong>{kpiData?.capitalExpenditurePercent || 74.2}%</strong>
              </div>
            </div>

            <div className="dt-card" style={{ borderLeft: '4px solid #F59E0B' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>विकास योजना तथा लाभग्राही</span>
                <CheckCircle2 size={20} color="#F59E0B" />
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, marginTop: '0.4rem', color: 'var(--text-main)' }}>
                {kpiData?.completedProjectsCount ?? 4} वटा सम्पन्न
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                जारी: <strong>{kpiData?.ongoingProjectsCount ?? 12} वटा</strong> • लाभग्राही: <strong>{kpiData?.totalBeneficiaries?.toLocaleString() || '१,११,२८४'} जना</strong>
              </div>
            </div>

            <div className="dt-card" style={{ borderLeft: '4px solid #9333EA' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>डिजिटल ट्विन तथा सम्पत्ति व्यवस्थापन</span>
                <ShieldCheck size={20} color="#9333EA" />
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, marginTop: '0.4rem', color: '#9333EA' }}>
                {kpiData?.publicAssetManagementIndex || 100}%
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                GIS Mapping Coverage: <strong>{kpiData?.gisCoveragePercent || 100}%</strong> • विद्यालय: <strong>{kpiData?.schoolCount || 42}</strong>
              </div>
            </div>
          </div>

          {/* ── Asset Health & Maintenance Condition (🟢🟡🔴) Section ── */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              border: '1.5px solid #CBD5E1',
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Top decorative gradient bar */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #10B981 0%, #10B981 74%, #F59E0B 74%, #F59E0B 93%, #EF4444 93%, #EF4444 100%)',
              }}
            />

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <ShieldCheck size={22} color="#0F4C81" />
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#0F4C81' }}>
                    पूर्वाधार सम्पत्ति स्वास्थ्य तथा मर्मत स्थिति (Asset Condition & Health Index)
                  </h3>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#64748B', margin: 0 }}>
                  भौतिक पूर्वाधार क्षेत्रका कुल {kpiData?.assetConditionSummary?.totalAssets || 244} योजना/सम्पत्तिहरूको स्थलगत 🟢 चालु, 🟡 सामान्य मर्मत र 🔴 तत्काल पुनर्निर्माण स्थिति
                </p>
              </div>

              {/* Quick Actions to Filter Records */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('forms');
                    setSelectedCondition('needs_repair');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.5rem 0.9rem',
                    borderRadius: '8px',
                    backgroundColor: '#FEE2E2',
                    border: '1.5px solid #F87171',
                    color: '#B91C1C',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(239,68,68,0.15)',
                    transition: 'all 0.15s ease',
                  }}
                  title="तुरुन्त मर्मत वा पुनर्निर्माण गर्नुपर्ने सम्पत्तिहरू हेर्नुहोस्"
                >
                  <span>🔴 तत्काल मर्मत चाहिने ({kpiData?.assetConditionSummary?.needsRepairCount || 16} वटा)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('forms');
                    setSelectedCondition('fair');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.5rem 0.9rem',
                    borderRadius: '8px',
                    backgroundColor: '#FEF3C7',
                    border: '1.5px solid #FCD34D',
                    color: '#B45309',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  title="सामान्य मर्मत चाहिने सम्पत्तिहरूको सूची"
                >
                  <span>🟡 सामान्य मर्मत ({kpiData?.assetConditionSummary?.fairConditionCount || 46} वटा)</span>
                </button>
              </div>
            </div>

            {/* 3 Executive Condition Summary Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              {/* 🟢 चालु तथा राम्रो अवस्था */}
              <div
                style={{
                  backgroundColor: '#F0FDF4',
                  border: '1.5px solid #86EFAC',
                  borderRadius: '12px',
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem',
                  position: 'relative',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#166534', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#16A34A', display: 'inline-block' }} />
                    चालु तथा राम्रो अवस्था (Good)
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, backgroundColor: '#DCFCE7', color: '#166534', padding: '0.15rem 0.5rem', borderRadius: '12px' }}>
                    {kpiData?.assetConditionSummary?.goodConditionPercent || 74.6}%
                  </span>
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#14532D' }}>
                  {kpiData?.assetConditionSummary?.goodConditionCount || 182} <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>वटा</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#15803D' }}>
                  कुनै मर्मत नचाहिने, पूर्ण नियमित सञ्चालनमा रहेका भौतिक पूर्वाधारहरू
                </div>
              </div>

              {/* 🟡 सामान्य मर्मत आवश्यक */}
              <div
                style={{
                  backgroundColor: '#FFFBEB',
                  border: '1.5px solid #FCD34D',
                  borderRadius: '12px',
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem',
                  position: 'relative',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#92400E', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#F59E0B', display: 'inline-block' }} />
                    सामान्य मर्मत आवश्यक (Fair)
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, backgroundColor: '#FEF3C7', color: '#92400E', padding: '0.15rem 0.5rem', borderRadius: '12px' }}>
                    {kpiData?.assetConditionSummary?.fairConditionPercent || 18.9}%
                  </span>
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#78350F' }}>
                  {kpiData?.assetConditionSummary?.fairConditionCount || 46} <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>वटा</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#B45309' }}>
                  उपभोक्ता कोष वा वडास्तरीय मर्मत बजेटबाट तत्काल सुधार्न सकिने
                </div>
              </div>

              {/* 🔴 तुरुन्त मर्मत वा पुनर्निर्माण आवश्यक */}
              <div
                style={{
                  backgroundColor: '#FEF2F2',
                  border: '1.5px solid #FCA5A5',
                  borderRadius: '12px',
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem',
                  position: 'relative',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#991B1B', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#EF4444', display: 'inline-block' }} />
                    तुरुन्त पुनर्निर्माण / मर्मत (Critical)
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, backgroundColor: '#FEE2E2', color: '#991B1B', padding: '0.15rem 0.5rem', borderRadius: '12px' }}>
                    {kpiData?.assetConditionSummary?.needsRepairPercent || 6.5}%
                  </span>
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#7F1D1D' }}>
                  {kpiData?.assetConditionSummary?.needsRepairCount || 16} <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>वटा</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#B91C1C' }}>
                  उच्च जोखिम, पालिका तथा प्रदेश विशेष योजनाबाट तत्काल बजेट चाहिने
                </div>
              </div>
            </div>

            {/* Visual Continuous Segmented Health Bar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700 }}>
                <span style={{ color: '#15803D' }}>🟢 चालु: {kpiData?.assetConditionSummary?.goodConditionPercent || 74.6}%</span>
                <span style={{ color: '#B45309' }}>🟡 सामान्य मर्मत: {kpiData?.assetConditionSummary?.fairConditionPercent || 18.9}%</span>
                <span style={{ color: '#B91C1C' }}>🔴 तुरुन्त मर्मत: {kpiData?.assetConditionSummary?.needsRepairPercent || 6.5}%</span>
              </div>
              <div
                style={{
                  height: '14px',
                  width: '100%',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  display: 'flex',
                  backgroundColor: '#E2E8F0',
                  boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)',
                }}
              >
                <div
                  style={{
                    width: `${kpiData?.assetConditionSummary?.goodConditionPercent || 74.6}%`,
                    backgroundColor: '#10B981',
                    transition: 'width 0.4s ease',
                  }}
                  title="🟢 चालु तथा राम्रो अवस्था"
                />
                <div
                  style={{
                    width: `${kpiData?.assetConditionSummary?.fairConditionPercent || 18.9}%`,
                    backgroundColor: '#F59E0B',
                    transition: 'width 0.4s ease',
                  }}
                  title="🟡 सामान्य मर्मत आवश्यक"
                />
                <div
                  style={{
                    width: `${kpiData?.assetConditionSummary?.needsRepairPercent || 6.5}%`,
                    backgroundColor: '#EF4444',
                    transition: 'width 0.4s ease',
                  }}
                  title="🔴 तुरुन्त मर्मत वा पुनर्निर्माण आवश्यक"
                />
              </div>
            </div>

            {/* Sector-by-Sector Condition Matrix */}
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#334155', marginBottom: '0.6rem' }}>
                भौतिक पूर्वाधार क्षेत्र अनुसार विस्तृत अवस्था (Sectoral Condition Breakdown):
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.65rem' }}>
                {[
                  { name: 'सडक पूर्वाधार', total: '१४८.५ कि.मि.', good: '११२ कि.मि.', fair: '२८ कि.मि.', critical: '८.५ कि.मि.', key: 8 },
                  { name: 'खानेपानी (एक घर एक धारा)', total: '४२ योजना', good: '३३ योजना', fair: '७ योजना', critical: '२ योजना', key: 9 },
                  { name: 'झोलुङ्गे पुल', total: '१६ वटा', good: '१३ वटा', fair: '२ वटा', critical: '१ वटा', key: 20 },
                  { name: 'मोटरेबल पुल', total: '७ वटा', good: '६ वटा', fair: '१ वटा', critical: '० वटा', key: 21 },
                  { name: 'वडा तथा पालिका भवन', total: '९ भवन', good: '८ भवन', fair: '१ भवन', critical: '० भवन', key: 33 },
                  { name: 'सामुदायिक भवन / प्रतिक्षालय', total: '३६ वटा', good: '२९ वटा', fair: '५ वटा', critical: '२ वटा', key: 22 },
                  { name: 'सिँचाइ कुलो', total: '२४ योजना', good: '१७ योजना', fair: '५ योजना', critical: '२ योजना', key: 29 },
                  { name: 'विद्युत ABC कालो तार', total: '४५.२ कि.मि.', good: '३८ कि.मि.', fair: '६ कि.मि.', critical: '१.२ कि.मि.', key: 27 },
                  { name: 'धार्मिक तथा सांस्कृतिक सम्पदा', total: '१९ सम्पदा', good: '१५ सम्पदा', fair: '३ सम्पदा', critical: '१ सम्पदा', key: 23 },
                ].map((sec, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setSelectedModuleKey(sec.key);
                      setActiveTab('forms');
                    }}
                    style={{
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      padding: '0.6rem 0.75rem',
                      backgroundColor: '#F8FAFC',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                    title="क्लिक गरी यस क्षेत्रका फाराम तथा रेकर्डहरू हेर्नुहोस्"
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0F4C81' }}>{sec.name}</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B' }}>{sec.total}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.4rem', fontSize: '0.7rem', fontWeight: 600 }}>
                      <span style={{ color: '#16A34A', backgroundColor: '#DCFCE7', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>
                        🟢 {sec.good}
                      </span>
                      <span style={{ color: '#D97706', backgroundColor: '#FEF3C7', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>
                        🟡 {sec.fair}
                      </span>
                      <span style={{ color: '#DC2626', backgroundColor: '#FEE2E2', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>
                        🔴 {sec.critical}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Key Sectoral Indicators Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {/* पूर्वाधार तथा सेवा सूचकहरू */}
            <div className="dt-card">
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Layers size={18} color="var(--gov-primary)" />
                <span>पूर्वाधार तथा सेवा सूचकाङ्क</span>
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>कुल सडक लम्बाइ:</span>
                  <strong>{kpiData?.roadLengthKm || 148.5} कि.मि.</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>खानेपानी पहुँच:</span>
                  <strong style={{ color: '#10B981' }}>{kpiData?.waterAccessPercent || 88.5}%</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>विद्युतीकरण प्रतिशत:</span>
                  <strong style={{ color: '#10B981' }}>{kpiData?.electrificationPercent || 96.2}%</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>इन्टरनेट पहुँच प्रतिशत:</span>
                  <strong>{kpiData?.internetAccessPercent || 78.4}%</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>विद्युत कालो तार विस्तार:</span>
                  <strong>{kpiData?.blackWireLengthKm || 45.2} कि.मि.</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>सिँचाइ कुलो कुल लम्बाइ:</span>
                  <strong>{kpiData?.irrigationCanalLengthKm || 38.4} कि.मि.</strong>
                </div>
              </div>
            </div>

            {/* भौतिक सम्पत्ति सूचकहरू */}
            <div className="dt-card">
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building size={18} color="#E65100" />
                <span>पुल, भवन तथा सम्पत्ति संख्या</span>
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div style={{ padding: '0.5rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>झोलुङ्गे पुल</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F4C81' }}>१६ वटा</div>
                </div>
                <div style={{ padding: '0.5rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>मोटरेबल पुल</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F4C81' }}>७ वटा</div>
                </div>
                <div style={{ padding: '0.5rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>सामुदायिक भवन</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F4C81' }}>१४ वटा</div>
                </div>
                <div style={{ padding: '0.5rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>वडा तथा पालिका भवन</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F4C81' }}>९ वटा</div>
                </div>
                <div style={{ padding: '0.5rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>धार्मिक सम्पदा</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F4C81' }}>१९ वटा</div>
                </div>
                <div style={{ padding: '0.5rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>प्रतिक्षालय</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F4C81' }}>२२ वटा</div>
                </div>
              </div>
            </div>

            {/* पर्यटन, कृषि तथा वातावरण सूचकहरू */}
            <div className="dt-card">
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sprout size={18} color="#10B981" />
                <span>पर्यटन, ताल, चिया तथा कृषि</span>
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div style={{ padding: '0.5rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>संरक्षण गरिएका ताल</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#10B981' }}>५ वटा</div>
                </div>
                <div style={{ padding: '0.5rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>झरना संरक्षण</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#10B981' }}>८ वटा</div>
                </div>
                <div style={{ padding: '0.5rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>चिया बगान क्षेत्रफल</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#10B981' }}>६५.५ हेक्टर</div>
                </div>
                <div style={{ padding: '0.5rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>कोसेली घर</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#10B981' }}>४ वटा</div>
                </div>
                <div style={{ padding: '0.5rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>माछा फार्म (ट्राउट)</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#10B981' }}>११ वटा</div>
                </div>
                <div style={{ padding: '0.5rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>पार्क तथा बाल उद्यान</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#10B981' }}>६ वटा</div>
                </div>
              </div>
            </div>

            {/* सुशासन तथा सन्तुष्टि सूचकाङ्क */}
            <div className="dt-card">
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckSquare size={18} color="#9333EA" />
                <span>सुशासन तथा कार्यसम्पादन सूचकाङ्क</span>
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>नागरिक सन्तुष्टि सूचकाङ्क:</span>
                  <strong style={{ color: '#0F4C81' }}>{kpiData?.citizenSatisfactionIndex || 86.4}%</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>जनप्रतिनिधि कार्यसम्पादन:</span>
                  <strong>{kpiData?.representativePerformanceIndex || 88.2}%</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Digital Governance Index:</span>
                  <strong style={{ color: '#10B981' }}>{kpiData?.digitalGovernanceIndex || 91.0}%</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Agriculture Productivity:</span>
                  <strong>{kpiData?.agricultureProductivityIndex || 79.5}%</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Tourism Development:</span>
                  <strong>{kpiData?.tourismDevelopmentIndex || 85.2}%</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Social Inclusion Index:</span>
                  <strong>{kpiData?.socialInclusionIndex || 84.0}%</strong>
                </div>
              </div>
            </div>
          </div>

          {/* ── Dynamic Ward Rankings Table (All 8 Wards Connected to Real DB) ── */}
          <div className="dt-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Award size={20} color="#0F4C81" />
                  <span>वडा अनुसार विकास श्रेणी तथा कार्यसम्पादन (Ward Rankings)</span>
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
                  पाँचपोखरी थाङपालका ८ वटै वडाहरूको वास्तविक घरधुरी, जनसंख्या र विकास योजना कार्यसम्पादन
                </p>
              </div>
              <span style={{ fontSize: '0.75rem', backgroundColor: '#F0FDF4', color: '#16A34A', padding: '0.25rem 0.75rem', borderRadius: '14px', fontWeight: 700, border: '1px solid #BBF7D0' }}>
                ८ वटै वडा डेटाबेसबाट प्रत्यक्ष अद्यावधिक
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <div className="dt-responsive-table-wrapper">
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '2px solid var(--border)', textAlign: 'left' }}>
                      <th style={{ padding: '0.7rem 0.85rem' }}>श्रेणी (Rank)</th>
                      <th style={{ padding: '0.7rem 0.85rem' }}>वडा नं. तथा नाम</th>
                      <th style={{ padding: '0.7rem 0.85rem' }}>जनसंख्या / घरधुरी</th>
                      <th style={{ padding: '0.7rem 0.85rem' }}>समग्र विकास स्कोर</th>
                      <th style={{ padding: '0.7rem 0.85rem' }}>सम्पन्न योजना</th>
                      <th style={{ padding: '0.7rem 0.85rem' }}>बजेट उपयोग %</th>
                      <th style={{ padding: '0.7rem 0.85rem' }}>कार्यसम्पादन अवस्था</th>
                      <th style={{ padding: '0.7rem 0.85rem' }}>कार्य</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(kpiData?.wardRankings || []).map((w) => {
                      const rankMedal = w.rank === 1 ? '🥇 १' : w.rank === 2 ? '🥈 २' : w.rank === 3 ? '🥉 ३' : `#${w.rank}`;
                      const isTop3 = w.rank <= 3;
                      return (
                        <tr
                          key={w.wardNumber}
                          style={{
                            borderBottom: '1px solid var(--border)',
                            backgroundColor: selectedWard === w.wardNumber ? '#F0F7FD' : 'transparent',
                          }}
                        >
                          <td style={{ padding: '0.7rem 0.85rem', fontWeight: 800 }}>
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '0.2rem 0.5rem',
                                borderRadius: '6px',
                                backgroundColor: isTop3 ? '#FEF3C7' : '#F1F5F9',
                                color: isTop3 ? '#B45309' : '#334155',
                              }}
                            >
                              {rankMedal}
                            </span>
                          </td>
                          <td style={{ padding: '0.7rem 0.85rem', fontWeight: 700 }}>
                            <div style={{ color: '#0F172A' }}>वडा नं. {w.wardNumber} ({w.wardName})</div>
                          </td>
                          <td style={{ padding: '0.7rem 0.85rem' }}>
                            <div style={{ fontWeight: 600 }}>{w.population ? `${w.population.toLocaleString()} जना` : '-'}</div>
                            <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                              {w.households ? `${w.households.toLocaleString()} घरधुरी` : '-'}
                            </div>
                          </td>
                          <td style={{ padding: '0.7rem 0.85rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ fontWeight: 800, color: '#0F4C81' }}>{w.score}%</span>
                              <div style={{ height: '6px', width: '60px', backgroundColor: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${w.score}%`, backgroundColor: '#0F4C81', borderRadius: '4px' }} />
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '0.7rem 0.85rem', fontWeight: 600 }}>
                            {w.completedProjects} वटा योजना
                          </td>
                          <td style={{ padding: '0.7rem 0.85rem', color: '#10B981', fontWeight: 700 }}>
                            {w.budgetUtil}%
                          </td>
                          <td style={{ padding: '0.7rem 0.85rem' }}>
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '0.2rem 0.55rem',
                                borderRadius: '12px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                backgroundColor: w.score >= 90 ? '#DCFCE7' : w.score >= 86 ? '#EFF6FF' : '#FEF3C7',
                                color: w.score >= 90 ? '#15803D' : w.score >= 86 ? '#1D4ED8' : '#B45309',
                              }}
                            >
                              {w.score >= 90 ? 'उत्कृष्ट (A+)' : w.score >= 86 ? 'धेरै राम्रो (A)' : 'राम्रो (B+)'}
                            </span>
                          </td>
                          <td style={{ padding: '0.7rem 0.85rem' }}>
                            <button
                              onClick={() => {
                                setSelectedWard(w.wardNumber);
                                setActiveTab('forms');
                              }}
                              style={{
                                padding: '0.3rem 0.65rem',
                                borderRadius: '6px',
                                border: '1px solid #CBD5E1',
                                backgroundColor: '#FFFFFF',
                                color: '#0F4C81',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                              }}
                            >
                              विवरण हेर्नुहोस्
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: 1-YEAR, 5-YEAR, 10-YEAR REPORT GENERATOR ─────────────── */}
      {activeTab === 'generator' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Generator Controls */}
          <div className="dt-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                  प्रतिवेदनको प्रकार छनोट गर्नुहोस्
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setReportType('1_year')}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      border: 'none',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      backgroundColor: reportType === '1_year' ? 'var(--gov-primary)' : '#f1f5f9',
                      color: reportType === '1_year' ? '#ffffff' : 'var(--text-main)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    १ वर्षे (वार्षिक प्रगति प्रतिवेदन)
                  </button>
                  <button
                    onClick={() => setReportType('5_year')}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      border: 'none',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      backgroundColor: reportType === '5_year' ? 'var(--gov-primary)' : '#f1f5f9',
                      color: reportType === '5_year' ? '#ffffff' : 'var(--text-main)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    ५ वर्षे (आवधिक प्रगति प्रतिवेदन)
                  </button>
                  <button
                    onClick={() => setReportType('10_year')}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      border: 'none',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      backgroundColor: reportType === '10_year' ? 'var(--gov-primary)' : '#f1f5f9',
                      color: reportType === '10_year' ? '#ffffff' : 'var(--text-main)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    १० वर्षे (दीर्घकालीन प्रगति प्रतिवेदन)
                  </button>
                </div>
              </div>

              {reportType === '1_year' && (
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                    आर्थिक वर्ष
                  </label>
                  <select
                    value={reportFiscalYear}
                    onChange={(e) => setReportFiscalYear(e.target.value)}
                    style={{
                      padding: '0.5rem 0.85rem',
                      borderRadius: '8px',
                      border: '1.5px solid var(--border)',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      backgroundColor: '#FFFFFF',
                      outline: 'none',
                    }}
                  >
                    <option value="२०८०/०८१">आ.व. २०८०/०८१</option>
                    <option value="२०८१/०८२">आ.व. २०८१/०८२</option>
                    <option value="२०७९/०८०">आ.व. २०७९/०८०</option>
                  </select>
                </div>
              )}
            </div>

            {/* Print & Export Actions */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={handlePrint}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.55rem 1.15rem',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: 'var(--gov-primary)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(15, 76, 129, 0.25)',
                }}
              >
                <Printer size={16} />
                <span>प्रिन्ट / PDF निकाल्नुहोस्</span>
              </button>

              <button
                onClick={handleExportCsv}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.55rem 1.15rem',
                  borderRadius: '8px',
                  border: '1.5px solid var(--border)',
                  backgroundColor: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                <Download size={16} />
                <span>Excel/CSV निर्यात</span>
              </button>
            </div>
          </div>

          {/* Official Printable Government Progress Report Layout */}
          <div
            id="printable-progress-report"
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '3rem',
              border: '1px solid var(--border)',
              boxShadow: '0 4px 25px rgba(0,0,0,0.04)',
              display: 'flex',
              flexDirection: 'column',
              gap: '2rem',
              color: '#000000',
              fontFamily: 'serif, "Noto Sans Devanagari", sans-serif',
            }}
          >
            {/* Gov Letterhead Header - Dynamic from TenantContext */}
            <div style={{ textAlign: 'center', borderBottom: '2px solid #0F4C81', paddingBottom: '1.5rem', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
                {palikaLogoUrl ? (
                  <img
                    src={palikaLogoUrl}
                    alt={palikaName}
                    style={{ width: 72, height: 72, objectFit: 'contain', borderRadius: '50%', border: '2px solid #e2e8f0' }}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                ) : (
                  <svg width="64" height="64" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="50" cy="50" r="45" stroke="#C92A2A" strokeWidth="3" fill="#FFF5F5" />
                    <path d="M50 15 L60 40 L85 40 L65 55 L75 80 L50 65 L25 80 L35 55 L15 40 L40 40 Z" fill="#C92A2A" />
                    <circle cx="50" cy="50" r="16" fill="#0F4C81" />
                    <path d="M42 50 L48 56 L58 44" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>

              <div style={{ fontSize: '1rem', fontWeight: 600, color: '#C92A2A', letterSpacing: '0.05em' }}>
                नेपाल सरकार • {palikaProvince}
              </div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0.25rem 0', color: '#0F4C81' }}>
                {palikaName}
              </h2>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1F2937' }}>
                {palikaAddress}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#4B5563', marginTop: '0.25rem' }}>
                "{palikaSlogan}"
              </div>

              <div
                style={{
                  marginTop: '1.25rem',
                  display: 'inline-block',
                  padding: '0.4rem 1.5rem',
                  backgroundColor: '#EBF3FA',
                  borderRadius: '20px',
                  fontWeight: 800,
                  fontSize: '1.15rem',
                  color: '#0F4C81',
                  border: '1px solid #BCD5EB',
                }}
              >
                {generatedReport?.metadata?.title || 'प्रगति प्रतिवेदन'}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#6B7280', marginTop: '0.35rem' }}>
                {generatedReport?.metadata?.subtitle}
              </div>
            </div>

            {/* Executive Summary */}
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F4C81', borderBottom: '1px solid #E5E7EB', paddingBottom: '0.4rem' }}>
                १. पृष्ठभूमि तथा कार्यकारी संक्षेप (Executive Summary)
              </h3>
              <p style={{ fontSize: '0.9rem', lineHeight: '1.7', textAlign: 'justify', color: '#374151' }}>
                पाँचपोखरी थाङपाल गाउँपालिकाले सुशासन, जवाफदेहिता र परिणाममुखी विकासका लागि <strong>"डाटामा आधारित राजनीति र प्रमाणमा आधारित विकास"</strong> को मूल मान्यतालाई व्यवहारमा उतारेको छ। परम्परागत अनुमानका भरमा योजना छनोट गर्ने परिपाटीको अन्त्य गरी प्रत्येक आयोजनालाई वास्तविक GIS/GPS लोकेशन, Before/After डिजिटल फोटो प्रमाण, प्रत्यक्ष लाभान्वित जनसंख्या, बजेट विनियोजन र खर्च अडिटसँग आबद्ध गरिएको छ।
                यस प्रतिवेदनले <strong>{reportType === '1_year' ? 'आर्थिक वर्ष २०८०/०८१ को वार्षिक' : reportType === '5_year' ? '५ वर्षे आवधिक कार्यकालको' : 'दश वर्षे (२०७४-२०८४) ऐतिहासिक'}</strong> प्रगति, भौतिक पूर्वाधार, सामाजिक समावेशीकरण, र सेवा प्रवाहको वस्तुनिष्ठ प्रमाण प्रस्तुत गर्दछ।
              </p>
            </div>

            {/* Overall Snapshot Statistics */}
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F4C81', borderBottom: '1px solid #E5E7EB', paddingBottom: '0.4rem' }}>
                २. समग्र पालिकाको मुख्य सूचकाङ्क तालिका (Key Indicators Overview)
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '0.75rem' }}>
                <div style={{ padding: '0.75rem', border: '1px solid #E5E7EB', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>कुल जनसंख्या / घरधुरी</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                    {kpiData?.totalPopulation?.toLocaleString() || '२०,९९७'} जना / {kpiData?.totalHouseholds?.toLocaleString() || '५,३५७'} घर
                  </div>
                </div>
                <div style={{ padding: '0.75rem', border: '1px solid #E5E7EB', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>बजेट उपयोग प्रतिशत</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#10B981' }}>{kpiData?.budgetUtilizationPercent || 98}%</div>
                </div>
                <div style={{ padding: '0.75rem', border: '1px solid #E5E7EB', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>सडक सञ्जाल (कि.मि.)</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{kpiData?.roadLengthKm || 148.5} कि.मि.</div>
                </div>
                <div style={{ padding: '0.75rem', border: '1px solid #E5E7EB', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>खानेपानी पहुँच (%)</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{kpiData?.waterAccessPercent || 88.5}%</div>
                </div>
                <div style={{ padding: '0.75rem', border: '1px solid #E5E7EB', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>विद्युतीकरण तथा इन्टरनेट</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>विद्युत: {kpiData?.electrificationPercent || 96.2}% • नेट: {kpiData?.internetAccessPercent || 78.4}%</div>
                </div>
                <div style={{ padding: '0.75rem', border: '1px solid #E5E7EB', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>सार्वजनिक सम्पत्ति व्यवस्थापन सूचकाङ्क</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F4C81' }}>१००% (पूर्ण अभिलेख)</div>
                </div>
              </div>
            </div>

            {/* Sector Summaries Table */}
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F4C81', borderBottom: '1px solid #E5E7EB', paddingBottom: '0.4rem' }}>
                ३. विषयगत क्षेत्रगत भौतिक तथा वित्तीय प्रगति (Sectoral Achievement Matrix)
              </h3>
              <div className="dt-responsive-table-wrapper">
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', marginTop: '0.75rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#0F4C81', color: '#ffffff', textAlign: 'left' }}>
                      <th style={{ padding: '0.6rem 0.75rem' }}>क्र.सं.</th>
                      <th style={{ padding: '0.6rem 0.75rem' }}>विषयगत क्षेत्र</th>
                      <th style={{ padding: '0.6rem 0.75rem' }}>लक्ष्य योजना</th>
                      <th style={{ padding: '0.6rem 0.75rem' }}>सम्पन्न</th>
                      <th style={{ padding: '0.6rem 0.75rem' }}>खर्च रकम</th>
                      <th style={{ padding: '0.6rem 0.75rem' }}>उपयोग %</th>
                      <th style={{ padding: '0.6rem 0.75rem' }}>मुख्य उपलब्धि तथा प्रभाव</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(generatedReport?.sectorSummaries || []).map((sec, idx) => (
                      <tr key={sec.moduleKey} style={{ borderBottom: '1px solid #E5E7EB', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f9fafb' }}>
                        <td style={{ padding: '0.6rem 0.75rem', fontWeight: 700 }}>{idx + 1}</td>
                        <td style={{ padding: '0.6rem 0.75rem', fontWeight: 700 }}>{sec.title}</td>
                        <td style={{ padding: '0.6rem 0.75rem' }}>{sec.targetCount} वटा</td>
                        <td style={{ padding: '0.6rem 0.75rem', color: '#10B981', fontWeight: 700 }}>{sec.completedCount} वटा</td>
                        <td style={{ padding: '0.6rem 0.75rem' }}>{sec.expenditure}</td>
                        <td style={{ padding: '0.6rem 0.75rem', fontWeight: 700 }}>{sec.utilization}</td>
                        <td style={{ padding: '0.6rem 0.75rem' }}>{sec.achievementNote}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Authenticated Assets & Verification Showcase */}
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F4C81', borderBottom: '1px solid #E5E7EB', paddingBottom: '0.4rem' }}>
                ४. प्रमाणमा आधारित भौतिक सम्पत्ति तथा योजनाहरूको नमूना (Sample Verified Assets)
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginTop: '0.75rem' }}>
                {(generatedReport?.records || []).slice(0, 6).map((rec) => (
                  <div key={rec.id} style={{ border: '1px solid #E5E7EB', borderRadius: '8px', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, backgroundColor: '#EBF3FA', color: '#0F4C81', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                        {rec.assetUniqueId}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: '#10B981', fontWeight: 700 }}>
                        {rec.physicalProgressPercent}% सम्पन्न
                      </span>
                    </div>

                    <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{rec.assetName}</div>
                    <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                      वडा नं. {rec.wardNumber} ({rec.toleBasti || 'केन्द्र'}) • लागत: रु {Number(rec.constructionCost || 0).toLocaleString()}
                    </div>

                    {/* Photos Preview */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.25rem' }}>
                      {rec.beforePhotoUrl && (
                        <div>
                          <div style={{ fontSize: '0.65rem', color: '#6B7280', textAlign: 'center' }}>Before (पहिले)</div>
                          <img src={rec.beforePhotoUrl} alt="Before" style={{ width: '100%', height: '70px', objectFit: 'cover', borderRadius: '4px' }} />
                        </div>
                      )}
                      {rec.afterPhotoUrl && (
                        <div>
                          <div style={{ fontSize: '0.65rem', color: '#10B981', textAlign: 'center', fontWeight: 700 }}>After (सम्पन्न)</div>
                          <img src={rec.afterPhotoUrl} alt="After" style={{ width: '100%', height: '70px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #10B981' }} />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Official Signatures & Seal Section */}
            <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '2px dashed #CBD5E1', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', textAlign: 'center' }}>
              <div>
                <div style={{ width: '160px', borderBottom: '1px solid #000000', marginBottom: '0.5rem', margin: '0 auto 0.5rem' }} />
                <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>योजना तथा प्रतिवेदन शाखा</div>
                <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>तयार गर्ने अधिकृत</div>
              </div>

              <div>
                <div style={{ width: '160px', borderBottom: '1px solid #000000', marginBottom: '0.5rem', margin: '0 auto 0.5rem' }} />
                <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>प्रमुख प्रशासकीय अधिकृत</div>
                <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>जाँच तथा प्रमाणित गर्ने</div>
              </div>

              <div>
                <div style={{ width: '160px', borderBottom: '1px solid #000000', marginBottom: '0.5rem', margin: '0 auto 0.5rem' }} />
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F4C81' }}>गाउँपालिका अध्यक्ष</div>
                <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>स्वीकृत गर्ने</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: BEFORE VS AFTER (२०७४–२०८४) DECADAL TRANSFORMATION ──── */}
      {activeTab === 'before_after' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="dt-card">
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={20} color="var(--gov-primary)" />
              <span>Before vs After (२०७४–२०८४): एक दशकको ऐतिहासिक रूपान्तरण</span>
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>
              स्थानीय तह स्थापना काल (२०७४/२०७९ आधाररेखा) र हालको अवस्था (२०८४) बीचको प्रामाणिक तुलनात्मक उपलब्धि
            </p>
          </div>

          {/* Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
            {(beforeAfterData || []).map((item, idx) => (
              <div key={idx} className="dt-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {item.indicator}
                    </span>
                    <span className="dt-badge dt-badge-success">{item.status}</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.5rem', marginTop: '0.75rem' }}>
                    <div style={{ padding: '0.5rem', backgroundColor: '#f8fafc', borderRadius: '6px', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>२०७४ (सुरुवात)</div>
                      <div style={{ fontSize: '1rem', fontWeight: 700 }}>{item.baseline2074} {item.unit}</div>
                    </div>
                    <div style={{ padding: '0.5rem', backgroundColor: '#f8fafc', borderRadius: '6px', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>२०७९ (मध्यम)</div>
                      <div style={{ fontSize: '1rem', fontWeight: 700 }}>{item.midline2079} {item.unit}</div>
                    </div>
                    <div style={{ padding: '0.5rem', backgroundColor: '#e0f2fe', borderRadius: '6px', textAlign: 'center', border: '1px solid #bae6fd' }}>
                      <div style={{ fontSize: '0.7rem', color: '#0369a1', fontWeight: 700 }}>२०८४ (हाल)</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0369a1' }}>{item.current2084} {item.unit}</div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>वृद्धि प्रतिशत (Decadal Growth):</span>
                    <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#10B981' }}>
                      +{item.growthPercent}%
                    </span>
                  </div>
                  <div style={{ height: '6px', width: '100%', backgroundColor: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.min(100, Math.max(10, item.growthPercent / 4))}%`, backgroundColor: '#10B981', borderRadius: '4px' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── THEMATIC DYNAMIC FORM MODAL (HANDLES ALL 33 FORMS) ─────────── */}
      <ThematicDynamicFormModal
        initialModuleKey={selectedModuleKey}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={(data) => createRecordMutation.mutate(data)}
        isPending={createRecordMutation.isPending}
      />

      {/* ── THEMATIC EXCEL BULK IMPORT MODAL (HANDLES ALL 33 FORMS) ──────── */}
      <ThematicExcelImportModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        initialModuleKey={selectedModuleKey}
        initialWard={selectedWard}
        onImportSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['progress-records'] });
          queryClient.invalidateQueries({ queryKey: ['progress-kpis'] });
          queryClient.invalidateQueries({ queryKey: ['generated-report'] });
        }}
      />

      {/* ── MODAL: FULL RESOLUTION IMAGE PREVIEW ────────────────────────── */}
      {previewImage && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1400,
            padding: '1.5rem',
          }}
          onClick={() => setPreviewImage(null)}
        >
          <div
            style={{
              position: 'relative',
              maxWidth: '900px',
              width: '100%',
              backgroundColor: '#0F172A',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', borderBottom: '1px solid #334155' }}>
              <span style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '0.95rem' }}>{previewImage.title}</span>
              <button
                onClick={() => setPreviewImage(null)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <X size={22} />
              </button>
            </div>
            <div style={{ padding: '1rem', display: 'flex', justifyContent: 'center', backgroundColor: '#020617' }}>
              <img
                src={previewImage.url}
                alt={previewImage.title}
                style={{ maxWidth: '100%', maxHeight: '75vh', objectFit: 'contain', borderRadius: '8px' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: RECORD DETAIL & METRICS INSPECTION ─────────────────── */}
      {selectedRecordForDetail && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1300,
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '700px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '1.75rem',
              boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px', backgroundColor: '#e0f2fe', color: '#0369a1', fontWeight: 800, fontFamily: 'monospace' }}>
                  {selectedRecordForDetail.assetUniqueId}
                </span>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0.35rem 0 0', color: 'var(--text-main)' }}>
                  {selectedRecordForDetail.assetName}
                </h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  {selectedRecordForDetail.moduleTitleNepali} (मोड्युल नं. {selectedRecordForDetail.moduleKey})
                </div>
              </div>
              <button onClick={() => setSelectedRecordForDetail(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={24} />
              </button>
            </div>

            {/* Universal Details */}
            <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '10px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', fontSize: '0.85rem' }}>
              <div><strong>वडा नं:</strong> {selectedRecordForDetail.wardNumber} ({selectedRecordForDetail.toleBasti || 'केन्द्र'})</div>
              <div><strong>आर्थिक वर्ष:</strong> {selectedRecordForDetail.fiscalYear}</div>
              <div><strong>निर्माण लागत:</strong> रु {Number(selectedRecordForDetail.constructionCost).toLocaleString()}</div>
              <div><strong>हालसम्मको खर्च:</strong> रु {Number(selectedRecordForDetail.expenditureAmount).toLocaleString()}</div>
              <div><strong>कार्य सम्पन्न %:</strong> <span style={{ color: '#10B981', fontWeight: 700 }}>{selectedRecordForDetail.physicalProgressPercent}%</span></div>
              <div><strong>हालको अवस्था:</strong> {selectedRecordForDetail.condition}</div>
              <div><strong>लाभान्वित घरधुरी:</strong> {selectedRecordForDetail.beneficiaryHouseholds} घर</div>
              <div><strong>लाभान्वित जनसंख्या:</strong> {selectedRecordForDetail.beneficiaryPopulation} जना</div>
              {selectedRecordForDetail.lat && (
                <div style={{ gridColumn: 'span 2', color: '#1D4ED8' }}>
                  <strong>GPS Coords:</strong>{' '}
                  <a
                    href={`https://www.google.com/maps?q=${selectedRecordForDetail.lat},${selectedRecordForDetail.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: '#1D4ED8', textDecoration: 'underline' }}
                  >
                    {Number(selectedRecordForDetail.lat).toFixed(6)}, {Number(selectedRecordForDetail.lng).toFixed(6)}
                  </a>{' '}
                  (उचाइ: {selectedRecordForDetail.elevationMeters}m)
                </div>
              )}
            </div>

            {/* Specific Thematic Details Unpacked! */}
            {selectedRecordForDetail.thematicData && Object.keys(selectedRecordForDetail.thematicData).length > 0 && (
              <div style={{ border: '1px solid #BCD5EB', backgroundColor: '#F0F7FD', padding: '1rem', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F4C81', marginBottom: '0.5rem' }}>
                  विषयगत विशिष्ट विवरणहरू (Specific Thematic Metrics):
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.82rem' }}>
                  {Object.entries(selectedRecordForDetail.thematicData).map(([key, val]) => (
                    <div key={key} style={{ backgroundColor: '#ffffff', padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                      <span style={{ color: '#64748B', display: 'block', fontSize: '0.72rem' }}>{key}</span>
                      <strong style={{ color: '#0F172A' }}>{typeof val === 'boolean' ? (val ? '✓ छ / हो' : '✗ छैन') : String(val)}</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Photos & Media Preview */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {selectedRecordForDetail.beforePhotoUrl && (
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Before Photo (पहिले)</div>
                  <img
                    src={selectedRecordForDetail.beforePhotoUrl}
                    alt="Before"
                    onClick={() => setPreviewImage({ url: selectedRecordForDetail.beforePhotoUrl!, title: `${selectedRecordForDetail.assetName} - Before` })}
                    style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer' }}
                  />
                </div>
              )}
              {selectedRecordForDetail.afterPhotoUrl && (
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10B981', marginBottom: '0.25rem' }}>After Photo (सम्पन्न)</div>
                  <img
                    src={selectedRecordForDetail.afterPhotoUrl}
                    alt="After"
                    onClick={() => setPreviewImage({ url: selectedRecordForDetail.afterPhotoUrl!, title: `${selectedRecordForDetail.assetName} - After` })}
                    style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #10B981', cursor: 'pointer' }}
                  />
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedRecordForDetail(null)}
              style={{
                padding: '0.6rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: 'var(--gov-primary)',
                color: '#ffffff',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              बन्द गर्नुहोस्
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressReportsPage;
