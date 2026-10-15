import React, { useState, useMemo } from 'react';
import { NepaliDatePicker } from '../../components/common/NepaliDatePicker';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as XLSX from 'xlsx';
import { projectsApi } from '../../api/projects';
import type { Project } from '../../api/projects';
import {
  FolderGit2,
  CheckCircle2,
  Clock,
  Coins,
  Search,
  CheckSquare,
  Plus,
  Download,
  QrCode,
  X,
  FileSpreadsheet,
  Printer,
  FileText,
  Building,
  Calendar,
  Layers,
  ArrowRightLeft,
  Trash2,
  Edit2,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Phone,
  User,
  Users,
  Award,
  Eye,
  Send,
  ShieldCheck,
  Calculator,
  BookOpen,
  DollarSign,
  Camera,
  Map,
  BarChart3,
} from 'lucide-react';
import { ProjectAgreementModal } from './components/ProjectAgreementModal';
import { ProjectAgreementPrintModal } from './components/ProjectAgreementPrintModal';
import { BudgetVirementModal } from './components/BudgetVirementModal';
import { ProjectExcelImportModal } from './components/ProjectExcelImportModal';
import { OfficialLettersGeneratorModal } from './components/OfficialLettersGeneratorModal';
import { ConsumerCommitteeModal } from './components/ConsumerCommitteeModal';
import { MeasurementBookInstallmentModal } from './components/MeasurementBookInstallmentModal';
import { MonitoringSocialAuditModal } from './components/MonitoringSocialAuditModal';
import { ProjectFarfarakModal } from './components/ProjectFarfarakModal';
import { ProjectsDashboardTab } from './components/ProjectsDashboardTab';
import { ProjectsGisTab } from './components/ProjectsGisTab';

// Nepali digit converter
const toNepaliNum = (num: number | string): string => {
  const nepaliDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  return String(num).replace(/\d/g, (d) => nepaliDigits[parseInt(d, 10)]);
};

export const ProjectsPage: React.FC = () => {
  const queryClient = useQueryClient();

  // Navigation tab state supporting all 7 modern municipal modules
  const [activeTab, setActiveTab] = useState<
    | 'report_list'
    | 'agreements_list'
    | 'committees_list'
    | 'mb_installments'
    | 'monitoring_audit'
    | 'farfarak_clearance'
    | 'budget_virement'
    | 'dashboard'
    | 'gis_map'
  >('dashboard');

  // Filter states matching the screenshot
  const [filterFiscalYear, setFilterFiscalYear] = useState<string>('all');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filterBudgetSource, setFilterBudgetSource] = useState<string>('all');
  const [filterProjectName, setFilterProjectName] = useState<string>('');
  const [filterDate, setFilterDate] = useState<string>('');

  // Modals state
  const [isAgreementModalOpen, setIsAgreementModalOpen] = useState(false);
  const [isExcelImportModalOpen, setIsExcelImportModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isVirementModalOpen, setIsVirementModalOpen] = useState(false);
  const [isLettersModalOpen, setIsLettersModalOpen] = useState(false);
  const [isCommitteeModalOpen, setIsCommitteeModalOpen] = useState(false);
  const [isMBModalOpen, setIsMBModalOpen] = useState(false);
  const [isMonitoringModalOpen, setIsMonitoringModalOpen] = useState(false);
  const [isFarfarakModalOpen, setIsFarfarakModalOpen] = useState(false);

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Queries
  const { data: projectsData, isLoading, refetch } = useQuery({
    queryKey: ['projects-list', filterFiscalYear, filterLevel, filterBudgetSource, filterProjectName, filterDate],
    queryFn: () =>
      projectsApi.getAll({
        fiscalYear: filterFiscalYear === 'all' ? undefined : filterFiscalYear,
        level: filterLevel === 'all' ? undefined : filterLevel,
        budgetSource: filterBudgetSource === 'all' ? undefined : filterBudgetSource,
        search: filterProjectName.trim() === '' ? undefined : filterProjectName,
        date: filterDate.trim() === '' ? undefined : filterDate,
      }),
  });
  
  const projects: Project[] = Array.isArray(projectsData)
    ? projectsData
    : (projectsData?.data && Array.isArray(projectsData.data) ? projectsData.data : []);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Mutations
  const saveProjectMutation = useMutation({
    mutationFn: (data: Partial<Project>) => {
      if (selectedProject?.id) {
        return projectsApi.update(selectedProject.id, data);
      } else {
        return projectsApi.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects-list'] });
      setIsAgreementModalOpen(false);
      setSelectedProject(null);
      showToast(selectedProject ? 'योजना सम्झौता सफलतापूर्वक अद्यावधिक गरियो!' : 'नयाँ योजना सम्झौता सुरक्षित गरियो!');
    },
    onError: (err: any) => {
      showToast(err?.response?.data?.message || 'सुरक्षित गर्दा त्रुटि देखापर्यो।', 'error');
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: (id: string) => projectsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects-list'] });
      setProjectToDelete(null);
      showToast('आयोजना सफलतापूर्वक हटाइयो!');
    },
    onError: (err: any) => {
      showToast(err?.response?.data?.message || 'हटाउँदा त्रुटि देखापर्यो।', 'error');
    },
  });

  const saveMBMutation = useMutation({
    mutationFn: (entry: any) => {
      const currentMB = selectedProject?.measurementBook || [];
      return projectsApi.update(selectedProject!.id!, { measurementBook: [...currentMB, entry] });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects-list'] });
      showToast('नापी किताब (MB) विवरण सुरक्षित गरियो!');
    },
    onError: (err: any) => showToast(err?.message || 'त्रुटि भयो', 'error'),
  });

  const recordPaymentMutation = useMutation({
    mutationFn: (payload: any) =>
      projectsApi.update(selectedProject!.id!, {
        paidAmount: Number(selectedProject!.paidAmount || 0) + Number(payload.amount),
        financialProgress: Math.min(
          100,
          Math.round(
            ((Number(selectedProject!.paidAmount || 0) + Number(payload.amount)) /
              Number(selectedProject!.officeCost || selectedProject!.budget || 1)) *
              100,
          ),
        ),
        installmentDetails: {
          ...(selectedProject!.installmentDetails || {}),
          lastPayment: payload,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects-list'] });
      showToast('किस्ता भुक्तानी सफलतापूर्वक निकासा भयो!');
    },
    onError: (err: any) => showToast(err?.message || 'त्रुटि भयो', 'error'),
  });

  const saveSocialAuditMutation = useMutation({
    mutationFn: (audit: any) => projectsApi.update(selectedProject!.id!, { socialAudit: audit }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects-list'] });
      showToast('सामाजिक परीक्षण प्रतिवेदन सुरक्षित गरियो!');
    },
    onError: (err: any) => showToast(err?.message || 'त्रुटि भयो', 'error'),
  });

  const processFarfarakMutation = useMutation({
    mutationFn: (farfarak: any) => projectsApi.update(selectedProject!.id!, { farfarakDetails: farfarak, status: 'completed' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects-list'] });
      showToast('योजना फरफारक तथा सम्पन्नता सफलतापूर्वक सम्पन्न भयो!');
    },
    onError: (err: any) => showToast(err?.message || 'त्रुटि भयो', 'error'),
  });

  // Calculate totals
  const totalOfficeCost = useMemo(
    () => projects.reduce((acc, p) => acc + Number(p.officeCost || p.budget || 0), 0),
    [projects],
  );

  const totalCommitteeCost = useMemo(
    () => projects.reduce((acc, p) => acc + Number(p.committeeCost || 0), 0),
    [projects],
  );

  const totalPaidAmount = useMemo(
    () => projects.reduce((acc, p) => acc + Number(p.paidAmount || 0), 0),
    [projects],
  );

  // Export to Excel
  const handleExportExcel = () => {
    if (projects.length === 0) {
      showToast('डाउनलोड गर्न कुनै डेटा छैन।', 'error');
      return;
    }

    const exportData = projects.map((p, index) => ({
      'क्र.स.': index + 1,
      'आर्थिक वर्ष': p.fiscalYear || '',
      'बजेट स्रोत': p.budgetSource || 'संघीय सरकार वित्तीय समानीकरण अनुदान',
      'वडा/नगर': p.wardNumber ? `वडा नं. ${p.wardNumber}` : p.level || 'नगर स्तरिय',
      'आयोजनाको नाम': p.name,
      'मार्फत': p.marfat || 'उपभोक्ता समिति',
      'सुरु हुने मिति': p.startDateBs || 'मिति उपलब्ध छैन',
      'सम्पन्न हुने मिति': p.completionDateBs || 'मिति उपलब्ध छैन',
      'कार्यालय लागत (रु.)': Number(p.officeCost || p.budget || 0).toFixed(2),
      'उपभोक्ता समिति लागत (रु.)': Number(p.committeeCost || 0).toFixed(2),
      'कुल सम्झौता लागत (रु.)': (
        Number(p.officeCost || p.budget || 0) + Number(p.committeeCost || 0)
      ).toFixed(2),
      'भुक्तानी भएको रकम (रु.)': Number(p.paidAmount || 0).toFixed(2),
      'उपभोक्ता समिति': p.committeeName || '-',
      'समिति अध्यक्ष': p.committeeChair || '-',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'योजना प्रगति प्रतिवेदन');
    XLSX.writeFile(workbook, `Panchpokhari_Yojana_Pragati_Pratibedan_${Date.now()}.xlsx`);
    showToast('एक्सेल फाइल सफलतापूर्वक डाउनलोड भयो!');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleOpenAddModal = () => {
    setSelectedProject(null);
    setIsAgreementModalOpen(true);
  };

  const handleOpenEditModal = (p: Project) => {
    setSelectedProject(p);
    setIsAgreementModalOpen(true);
  };

  const handleOpenPrintModal = (p: Project) => {
    setSelectedProject(p);
    setIsPrintModalOpen(true);
  };

  const handleOpenLettersModal = (p: Project) => {
    setSelectedProject(p);
    setIsLettersModalOpen(true);
  };

  const handleOpenCommitteeModal = (p: Project) => {
    setSelectedProject(p);
    setIsCommitteeModalOpen(true);
  };

  const handleOpenMBModal = (p: Project) => {
    setSelectedProject(p);
    setIsMBModalOpen(true);
  };

  const handleOpenMonitoringModal = (p: Project) => {
    setSelectedProject(p);
    setIsMonitoringModalOpen(true);
  };

  const handleOpenFarfarakModal = (p: Project) => {
    setSelectedProject(p);
    setIsFarfarakModalOpen(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative' }}>
      {/* Toast Alert */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 10000,
            padding: '0.85rem 1.25rem',
            borderRadius: '10px',
            backgroundColor: toastMessage.type === 'success' ? '#10b981' : '#ef4444',
            color: '#ffffff',
            fontWeight: 600,
            fontSize: '0.9rem',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
          }}
        >
          {toastMessage.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* System Banner & Municipal Header */}
      <div
        className="dt-card d-print-none"
        style={{
          background: 'linear-gradient(135deg, #0369a1 0%, #0284c7 100%)',
          color: '#ffffff',
          padding: '1.25rem 1.5rem',
          borderRadius: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: '0 4px 12px rgba(2, 132, 199, 0.2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '10px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FolderGit2 size={26} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '2px 8px', borderRadius: '6px', backgroundColor: 'rgba(255, 255, 255, 0.2)', border: '1px solid rgba(255, 255, 255, 0.3)', fontSize: '0.72rem', fontWeight: 700, color: '#f0fdf4', marginBottom: '4px' }}>
              <span>LGOA २०७४ अनुसूची ८ • स्थानीय स्तरका विकास आयोजना तथा पूर्वाधार</span>
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '0.3px' }}>
              आधुनिक योजना सम्झौता तथा कार्यान्वयन व्यवस्थापन प्रणाली
            </div>
            <div style={{ fontSize: '0.825rem', color: '#e0f2fe', marginTop: '2px' }}>
              पाँचपोखरी थाङपाल गाउँपालिका — योजना सम्झौता, उपभोक्ता समिति, कार्यादेश, नापी किताब (MB), किस्ता निकासा, अनुगमन र फरफारक
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setIsExcelImportModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.55rem 0.95rem',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.825rem',
              cursor: 'pointer',
              backdropFilter: 'blur(4px)',
            }}
          >
            <FileSpreadsheet size={16} />
            <span>Excel फाइल अपलोड</span>
          </button>

          <button
            onClick={() => setIsVirementModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.55rem 0.95rem',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.825rem',
              cursor: 'pointer',
            }}
          >
            <ArrowRightLeft size={16} />
            <span>बजेट रकमान्तर</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.55rem 1.15rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#ffffff',
              color: '#0369a1',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
            }}
          >
            <Plus size={16} />
            <span>+ नयाँ योजना सम्झौता फारम</span>
          </button>
        </div>
      </div>

      {/* 7 Modern Municipal Modules Navigation Tabs (Unified Responsive Grid) */}
      <div
        className="d-print-none"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(175px, 1fr))',
          gap: '0.65rem',
          marginBottom: '1rem',
        }}
      >
        {[
          { id: 'dashboard', label: 'ड्यासबोर्ड (Dashboard)', icon: <BarChart3 size={16} /> },
          { id: 'gis_map', label: 'GIS नक्सा (Spatial View)', icon: <Map size={16} /> },
          { id: 'report_list', label: '१. योजना प्रतिवेदन', icon: <FileText size={16} /> },
          { id: 'agreements_list', label: '२. सम्झौता र कार्यादेश', icon: <Send size={16} /> },
          { id: 'committees_list', label: '३. उपभोक्ता समिति', icon: <Users size={16} /> },
          { id: 'mb_installments', label: '४. किस्ता र नापी किताब', icon: <Calculator size={16} /> },
          { id: 'monitoring_audit', label: '५. अनुगमन तथा परीक्षण', icon: <Eye size={16} /> },
          { id: 'farfarak_clearance', label: '६. फरफारक र सम्पन्नता', icon: <Award size={16} /> },
          { id: 'budget_virement', label: '७. रकमान्तर र भेरियसन', icon: <ArrowRightLeft size={16} /> },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.55rem',
                padding: '0.75rem 0.85rem',
                borderRadius: '12px',
                border: isActive ? '1.5px solid #0284c7' : '1.5px solid #e2e8f0',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                background: isActive
                  ? 'linear-gradient(135deg, #0369a1 0%, #0284c7 100%)'
                  : '#ffffff',
                color: isActive ? '#ffffff' : '#334155',
                boxShadow: isActive ? '0 4px 14px rgba(2, 132, 199, 0.3)' : '0 2px 5px rgba(0,0,0,0.02)',
                transition: 'all 0.15s ease',
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '7px',
                  background: isActive ? 'rgba(255,255,255,0.2)' : '#f0f9ff',
                  color: isActive ? '#ffffff' : '#0284c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {tab.icon}
              </div>
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* KPI Stats Bar */}
      <div
        className="d-print-none"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '1rem',
        }}
      >
        <div
          className="dt-card"
          style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', borderLeft: '4px solid #0284c7' }}
        >
          <div style={{ padding: '0.75rem', borderRadius: '8px', backgroundColor: '#e0f2fe', color: '#0284c7' }}>
            <FolderGit2 size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>कुल सम्झौता आयोजना</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-main)' }}>
              {toNepaliNum(projects.length)} वटा आयोजना
            </div>
          </div>
        </div>

        <div
          className="dt-card"
          style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', borderLeft: '4px solid #16a34a' }}>
          <div style={{ padding: '0.75rem', borderRadius: '8px', backgroundColor: '#f0fdf4', color: '#16a34a' }}>
            <Coins size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>कुल कार्यालय लागत अनुमान</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-main)' }}>
              रु. {(totalOfficeCost / 100000).toFixed(2)} लाख
            </div>
          </div>
        </div>

        <div
          className="dt-card"
          style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', borderLeft: '4px solid #ea580c' }}>
          <div style={{ padding: '0.75rem', borderRadius: '8px', backgroundColor: '#fff7ed', color: '#ea580c' }}>
            <CheckSquare size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>उपभोक्ता समिति लागत (जनसहभागिता)</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-main)' }}>
              रु. {(totalCommitteeCost / 100000).toFixed(2)} लाख
            </div>
          </div>
        </div>

        <div
          className="dt-card"
          style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', borderLeft: '4px solid #9333ea' }}>
          <div style={{ padding: '0.75rem', borderRadius: '8px', backgroundColor: '#faf5ff', color: '#9333ea' }}>
            <TrendingUp size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>कुल भुक्तानी निकासा भएको</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-main)' }}>
              रु. {(totalPaidAmount / 100000).toFixed(2)} लाख
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: योजना प्रगति प्रतिवेदन सुची (SCREENSHOT PORTAL MATCH) */}
      {/* ========================================================================= */}
      {/* TAB 8: Dashboard */}
      {activeTab === 'dashboard' && <ProjectsDashboardTab projects={projects} />}

      {/* TAB 9: GIS Map */}
      {activeTab === 'gis_map' && <ProjectsGisTab projects={projects} />}

      {/* TAB 1: Projects List & Filter Table */}
      {activeTab === 'report_list' && (
        <div className="dt-card" style={{ padding: '1.25rem' }}>
          {/* Header Bar matching Screenshot */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              marginBottom: '1rem',
              paddingBottom: '0.75rem',
              borderBottom: '2px solid #e2e8f0',
            }}
          >
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                योजना प्रगति प्रतिवेदन सुची
              </h2>
              <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '3px' }}>
                स्वीकृत आयोजनाहरूको लागत अनुमान, सम्झौता तथा प्रगति स्थिति
              </div>
            </div>

            <div className="d-print-none" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                onClick={handleExportExcel}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.5rem 0.9rem',
                  borderRadius: '6px',
                  backgroundColor: '#16a34a',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.825rem',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(22, 163, 74, 0.25)',
                }}
              >
                <FileSpreadsheet size={15} />
                <span>Excel मा लैजानुहोस्</span>
              </button>

              <button
                onClick={handlePrint}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.5rem 0.9rem',
                  borderRadius: '6px',
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.825rem',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(2, 132, 199, 0.25)',
                }}
              >
                <Printer size={15} />
                <span>प्रिन्ट</span>
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div
            className="d-print-none"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
              gap: '0.75rem',
              backgroundColor: '#f8fafc',
              padding: '1rem',
              borderRadius: '8px',
              border: '1.5px solid #e2e8f0',
              marginBottom: '1.25rem',
            }}
          >
            <div>
              <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                आर्थिक वर्ष
              </label>
              <select
                value={filterFiscalYear}
                onChange={(e) => setFilterFiscalYear(e.target.value)}
                style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1.5px solid #cbd5e1', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', outline: 'none', color: '#0f172a', fontSize: '0.825rem' }}
              >
                <option value="all">सबै आर्थिक वर्ष</option>
                <option value="०८२/०८३">०८२/०८३</option>
                <option value="२०८१/०८२">२०८१/०८२</option>
                <option value="२०८०/०८१">२०८०/०८१</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                वडा / नगर
              </label>
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1.5px solid #cbd5e1', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', outline: 'none', color: '#0f172a', fontSize: '0.825rem' }}
              >
                <option value="all">सबै (गाउँपालिका तथा वडा)</option>
                <option value="नगर स्तरिय">गाउँपालिका स्तरीय</option>
                <option value="वडा स्तरिय">वडा स्तरीय</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                बजेट स्रोत
              </label>
              <select
                value={filterBudgetSource}
                onChange={(e) => setFilterBudgetSource(e.target.value)}
                style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1.5px solid #cbd5e1', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', outline: 'none', color: '#0f172a', fontSize: '0.825rem' }}
              >
                <option value="all">सबै बजेट स्रोतहरू</option>
                <option value="संघीय सरकार वित्तीय समानीकरण अनुदान">संघीय सरकार वित्तीय समानीकरण अनुदान</option>
                <option value="कन्टिन्जेन्सी">कन्टिन्जेन्सी</option>
                <option value="आन्तरिक स्रोत">आन्तरिक स्रोत</option>
                <option value="प्रकोप/विपद् व्यवस्थापन कोष">प्रकोप/विपद् व्यवस्थापन कोष</option>
                <option value="प्रदेश समपूरक अनुदान">प्रदेश समपूरक अनुदान</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                आयोजनाको नाम
              </label>
              <input
                type="text"
                placeholder="खोजी गर्नुहोस्..."
                value={filterProjectName}
                onChange={(e) => setFilterProjectName(e.target.value)}
                style={{ width: '100%', padding: '0.45rem 0.6rem', borderRadius: '6px', border: '1.5px solid #cbd5e1', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', outline: 'none', color: '#0f172a', fontSize: '0.825rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                मिति
              </label>
              <input
                type="text"
                placeholder="२०८३-०२-३०"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                style={{ width: '100%', padding: '0.45rem 0.6rem', borderRadius: '6px', border: '1.5px solid #cbd5e1', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', outline: 'none', color: '#0f172a', fontSize: '0.825rem' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.4rem' }}>
              <button
                onClick={() => refetch()}
                style={{
                  padding: '0.5rem 0.9rem',
                  borderRadius: '6px',
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.825rem',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <Search size={14} />
                <span>खोज्नुहोस्</span>
              </button>

              <button
                onClick={() => {
                  setFilterFiscalYear('all');
                  setFilterLevel('all');
                  setFilterBudgetSource('all');
                  setFilterProjectName('');
                  setFilterDate('');
                }}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: '6px',
                  backgroundColor: '#f1f5f9',
                  fontWeight: 600,
                  fontSize: '0.825rem',
                  border: '1.5px solid #cbd5e1', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', outline: 'none', color: '#475569',
                  cursor: 'pointer',
                }}
              >
                रिसेट
              </button>
            </div>
          </div>

          {/* 10-Column Primary Table Matching Government Screenshot */}
          <div style={{ flexWrap: 'wrap', borderRadius: '8px', border: '1.5px solid #cbd5e1', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', outline: 'none', color: '#0f172a' }}>
            <div className="dt-responsive-table-wrapper">
<table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.825rem',
                textAlign: 'left',
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: '#0f766e',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                  }}
                >
                  <th style={{ padding: '10px 8px', border: '1px solid #0d9488', textAlign: 'center', width: '45px' }}>क्र.स.</th>
                  <th style={{ padding: '10px 8px', border: '1px solid #0d9488', width: '90px' }}>आर्थिक वर्ष</th>
                  <th style={{ padding: '10px 10px', border: '1px solid #0d9488', minWidth: '160px' }}>बजेट स्रोत</th>
                  <th style={{ padding: '10px 8px', border: '1px solid #0d9488', width: '90px' }}>वडा/नगर</th>
                  <th style={{ padding: '10px 12px', border: '1px solid #0d9488', minWidth: '220px' }}>आयोजनाको नाम</th>
                  <th style={{ padding: '10px 8px', border: '1px solid #0d9488', width: '110px' }}>मार्फत</th>
                  <th style={{ padding: '10px 8px', border: '1px solid #0d9488', width: '95px' }}>सुरु हुने मिति</th>
                  <th style={{ padding: '10px 8px', border: '1px solid #0d9488', width: '95px' }}>सम्पन्न हुने मिति</th>
                  <th style={{ padding: '10px 10px', border: '1px solid #0d9488', textAlign: 'right', width: '120px' }}>कार्यालय लागत</th>
                  <th style={{ padding: '10px 10px', border: '1px solid #0d9488', textAlign: 'right', width: '135px' }}>उपभोक्ता समिति लागत</th>
                  <th className="d-print-none" style={{ padding: '10px 8px', border: '1px solid #0d9488', textAlign: 'center', width: '130px' }}>कार्य</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={11} style={{ textAlign: 'center', padding: '2rem', color: '#475569' }}>
                      डेटा लोड हुँदैछ...
                    </td>
                  </tr>
                ) : projects.length === 0 ? (
                  <tr>
                    <td colSpan={11} style={{ textAlign: 'center', padding: '2rem', color: '#475569' }}>
                      कुनै रेकर्ड फेला परेन।
                    </td>
                  </tr>
                ) : (
                  projects.map((p: any, idx: number) => {
                    const officeAmt = Number(p.officeCost || p.budget || 0);
                    const committeeAmt = Number(p.committeeCost || 0);

                    return (
                      <tr
                        key={p.id}
                        style={{
                          backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc',
                          transition: 'background-color 0.15s ease',
                        }}
                      >
                        <td style={{ padding: '9px 8px', border: '1.5px solid #e2e8f0', textAlign: 'center', fontWeight: 600, color: '#475569' }}>
                          {idx + 1}
                        </td>
                        <td style={{ padding: '9px 8px', border: '1.5px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>{p.fiscalYear || ''}</td>
                        <td style={{ padding: '9px 10px', border: '1.5px solid #e2e8f0', color: '#334155' }}>
                          {p.budgetSource || 'संघीय सरकार वित्तीय समानीकरण अनुदान'}
                        </td>
                        <td style={{ padding: '9px 8px', border: '1.5px solid #e2e8f0', fontWeight: 500 }}>
                          {p.wardNumber ? `वडा नं. ${p.wardNumber}` : p.level || 'नगर स्तरिय'}
                        </td>
                        <td style={{ padding: '9px 12px', border: '1.5px solid #e2e8f0', fontWeight: 600, color: '#0f172a' }}>
                          <div>{p.name}</div>
                          {p.committeeName && (
                            <div style={{ fontSize: '0.725rem', color: '#475569', fontWeight: 400 }}>
                              {p.committeeName}
                            </div>
                          )}
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '3px' }}>
                            {p.responsibleEngineer && (
                              <span style={{ fontSize: '0.68rem', backgroundColor: '#e0f2fe', color: '#0369a1', padding: '1px 5px', borderRadius: '3px' }}>
                                👷 {p.responsibleEngineer}
                              </span>
                            )}
                            {p.monitoringCommitteeScore !== undefined && p.monitoringCommitteeScore > 0 && (
                              <span style={{ fontSize: '0.68rem', backgroundColor: '#dcfce7', color: '#166534', padding: '1px 5px', borderRadius: '3px', fontWeight: 700 }}>
                                अनुगमन: {p.monitoringCommitteeScore}/१००
                              </span>
                            )}
                            {p.contingencyRatePercent !== undefined && (
                              <span style={{ fontSize: '0.68rem', backgroundColor: '#fef3c7', color: '#92400e', padding: '1px 5px', borderRadius: '3px' }}>
                                कन्टिन्जेन्सी: {p.contingencyRatePercent}%
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '9px 8px', border: '1.5px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>{p.marfat || 'उपभोक्ता समिति'}</td>
                        <td style={{ padding: '9px 8px', border: '1.5px solid #e2e8f0', color: '#475569' }}>
                          {p.startDateBs || 'मिति उपलब्ध छैन'}
                        </td>
                        <td style={{ padding: '9px 8px', border: '1.5px solid #e2e8f0', color: '#475569' }}>
                          {p.completionDateBs || 'मिति उपलब्ध छैन'}
                        </td>
                        <td style={{ padding: '9px 10px', border: '1.5px solid #e2e8f0', textAlign: 'right', fontWeight: 600, color: '#0f172a' }}>
                          {officeAmt.toFixed(2)}
                        </td>
                        <td style={{ padding: '9px 10px', border: '1.5px solid #e2e8f0', textAlign: 'right', color: '#0f172a' }}>
                          {committeeAmt.toFixed(2)}
                        </td>
                        <td className="d-print-none" style={{ padding: '9px 6px', border: '1.5px solid #e2e8f0', textAlign: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                            <button
                              onClick={() => handleOpenLettersModal(p)}
                              title="६ वटा आधिकारिक सरकारी पत्रहरू (कार्यादेश, बैंक सिफारिस, सम्झौता, आदि)"
                              style={{
                                padding: '4px 6px',
                                borderRadius: '4px',
                                border: '1px solid #0284c7',
                                backgroundColor: '#e0f2fe',
                                color: '#0284c7',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '3px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                              }}
                            >
                              <FileText size={12} />
                              <span>पत्रहरू</span>
                            </button>

                            <button
                              onClick={() => handleOpenEditModal(p)}
                              title="सम्पादन गर्नुहोस्"
                              style={{
                                padding: '4px 6px',
                                borderRadius: '4px',
                                border: '1.5px solid #cbd5e1', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', outline: 'none', backgroundColor: '#f8fafc',
                                color: '#2563eb',
                                cursor: 'pointer',
                              }}
                            >
                              <Edit2 size={12} />
                            </button>

                            <button
                              onClick={() => setProjectToDelete(p)}
                              title="हटाउनुहोस्"
                              style={{
                                padding: '4px 5px',
                                borderRadius: '4px',
                                border: '1px solid #fee2e2',
                                backgroundColor: '#fef2f2',
                                color: '#dc2626',
                                cursor: 'pointer',
                              }}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              {!isLoading && projects.length > 0 && (
                <tfoot>
                  <tr style={{ backgroundColor: '#f1f5f9', fontWeight: 800, borderTop: '2px solid #0284c7' }}>
                    <td colSpan={4} style={{ padding: '10px 12px', textAlign: 'left', border: '1.5px solid #cbd5e1', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', outline: 'none', color: '#0f172a' }}>
                      कुल जम्मा ({toNepaliNum(projects.length)} वटा आयोजना)
                    </td>
                    <td colSpan={4} style={{ padding: '10px 12px', textAlign: 'right', border: '1.5px solid #cbd5e1', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', outline: 'none', color: '#475569' }}>
                      लागत योगफल (रु.):
                    </td>
                    <td style={{ padding: '10px 10px', textAlign: 'right', border: '1.5px solid #cbd5e1', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', outline: 'none', color: '#0369a1', fontSize: '0.9rem' }}>
                      {totalOfficeCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '10px 10px', textAlign: 'right', border: '1.5px solid #cbd5e1', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', outline: 'none', color: '#0369a1', fontSize: '0.9rem' }}>
                      {totalCommitteeCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="d-print-none" style={{ border: '1.5px solid #cbd5e1', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', outline: 'none', color: '#0f172a' }}></td>
                  </tr>
                </tfoot>
              )}
            </table>
</div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: योजना सम्झौता तथा कार्यादेश पत्र (AGREEMENTS & WORK ORDERS) */}
      {/* ========================================================================= */}
      {activeTab === 'agreements_list' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
          {projects.map((p: any) => {
            const officeAmt = Number(p.officeCost || p.budget || 0);
            const committeeAmt = Number(p.committeeCost || 0);

            return (
              <div
                key={p.id}
                className="dt-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  borderTop: '4px solid #0284c7',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px', backgroundColor: '#e0f2fe', color: '#0369a1', fontWeight: 700 }}>
                      {p.fiscalYear || ''} | {p.level || 'नगर स्तरिय'}
                    </span>
                    <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px', backgroundColor: '#f0fdf4', color: '#16a34a', fontWeight: 600 }}>
                      {p.marfat || 'उपभोक्ता समिति'}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', margin: '0.3rem 0 0.5rem' }}>
                    {p.name}
                  </h3>

                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                    <div><strong>स्रोत:</strong> {p.budgetSource || 'संघीय समानीकरण'}</div>
                    <div><strong>अवधि:</strong> {p.startDateBs || 'मिति उपलब्ध छैन'} देखि {p.completionDateBs || 'मिति उपलब्ध छैन'}</div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', backgroundColor: '#f8fafc', padding: '0.6rem', borderRadius: '6px', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                    <div>
                      <span style={{ color: '#475569' }}>कार्यालय लागत:</span>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>रु. {officeAmt.toLocaleString()}</div>
                    </div>
                    <div>
                      <span style={{ color: '#475569' }}>उपभोक्ता लागत:</span>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>रु. {committeeAmt.toLocaleString()}</div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem' }}>
                  <button
                    onClick={() => handleOpenLettersModal(p)}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                      padding: '0.45rem',
                      borderRadius: '6px',
                      backgroundColor: '#0284c7',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '0.775rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <Send size={14} />
                    <span>कार्यादेश / पत्रहरू</span>
                  </button>

                  <button
                    onClick={() => handleOpenPrintModal(p)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      padding: '0.45rem 0.75rem',
                      borderRadius: '6px',
                      border: '1.5px solid #cbd5e1', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', outline: 'none',
                      backgroundColor: '#ffffff',
                      color: '#0369a1',
                      fontSize: '0.775rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <FileText size={14} />
                    <span>सम्झौता पत्र</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: उपभोक्ता समिति व्यवस्थापन (CONSUMER COMMITTEES ROSTER) */}
      {/* ========================================================================= */}
      {activeTab === 'committees_list' && (
        <div className="dt-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.75rem' }}>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                उपभोक्ता समिति तथा सरोकारवाला रोष्टर
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#475569', margin: '3px 0 0' }}>
                कार्यविधि बमोजिम गठन भएका उपभोक्ता समिति, पदाधिकारीहरू (अध्यक्ष, सचिव, कोषाध्यक्ष) र बैंक खाता विवरण
              </p>
            </div>
          </div>

          <div style={{ flexWrap: 'wrap', borderRadius: '8px', border: '1.5px solid #cbd5e1', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', outline: 'none', color: '#0f172a' }}>
            <div className="dt-responsive-table-wrapper">
<table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#0f766e', color: '#ffffff' }}>
                  <th style={{ padding: '10px 8px', border: '1px solid #0d9488', textAlign: 'center' }}>क्र.स.</th>
                  <th style={{ padding: '10px 10px', border: '1px solid #0d9488' }}>आयोजना तथा वडा</th>
                  <th style={{ padding: '10px 10px', border: '1px solid #0d9488' }}>उपभोक्ता समितिको नाम</th>
                  <th style={{ padding: '10px 10px', border: '1px solid #0d9488' }}>अध्यक्ष</th>
                  <th style={{ padding: '10px 10px', border: '1px solid #0d9488' }}>सचिव</th>
                  <th style={{ padding: '10px 10px', border: '1px solid #0d9488' }}>कोषाध्यक्ष</th>
                  <th style={{ padding: '10px 10px', border: '1px solid #0d9488' }}>बैंक खाता विवरण</th>
                  <th style={{ padding: '10px 10px', border: '1px solid #0d9488', textAlign: 'center' }}>कार्य</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p: any, idx: number) => (
                  <tr key={p.id} style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                    <td style={{ padding: '9px 8px', border: '1.5px solid #e2e8f0', textAlign: 'center' }}>{idx + 1}</td>
                    <td style={{ padding: '9px 10px', border: '1.5px solid #e2e8f0', fontWeight: 600 }}>
                      <div>{p.name}</div>
                      <span style={{ fontSize: '0.725rem', color: '#0284c7' }}>वडा नं. {toNepaliNum(p.wardNumber)}</span>
                    </td>
                    <td style={{ padding: '9px 10px', border: '1.5px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                      {p.committeeName || `${p.name} उपभोक्ता समिति`}
                    </td>
                    <td style={{ padding: '9px 10px', border: '1.5px solid #e2e8f0', fontWeight: 600 }}>
                      {p.committeeChair || 'दावा दोर्जे तामाङ'}
                    </td>
                    <td style={{ padding: '9px 10px', border: '1.5px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                      {p.committeeSecretary || 'निमा लामा'}
                    </td>
                    <td style={{ padding: '9px 10px', border: '1.5px solid #e2e8f0', color: '#0f766e', fontWeight: 600 }}>
                      {p.committeeTreasurer || 'पासाङ ल्हामु शेर्पा'}
                    </td>
                    <td style={{ padding: '9px 10px', border: '1.5px solid #e2e8f0', fontSize: '0.775rem' }}>
                      <div style={{ fontWeight: 600 }}>
                        {p.committeeBankDetails?.bankName || 'राष्ट्रिय वाणिज्य बैंक'}
                      </div>
                      <div style={{ color: '#475569' }}>
                        खाता: {p.committeeBankDetails?.accountNumber || '११६००२३४५६७८९'}
                      </div>
                    </td>
                    <td style={{ padding: '9px 10px', border: '1.5px solid #e2e8f0', textAlign: 'center' }}>
                      <button
                        onClick={() => handleOpenCommitteeModal(p)}
                        style={{
                          padding: '5px 10px',
                          borderRadius: '6px',
                          backgroundColor: '#0f766e',
                          color: '#ffffff',
                          border: 'none',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                        }}
                      >
                        समिति व्यवस्थापन
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
</div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: किस्ता तथा नापी किताब (MB) (INSTALLMENTS & MB) */}
      {/* ========================================================================= */}
      {activeTab === 'mb_installments' && (
        <div className="dt-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.75rem' }}>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                नापी किताब (Measurement Book) तथा किस्ता भुक्तानी ट्रयाकर
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#475569', margin: '3px 0 0' }}>
                प्राविधिक नापजाँच (MB), प्रगति मूल्याङ्कन र वैधानिक कट्टीहरू (कन्टिन्जेन्सी, मर्मत कोष, धरौटी) सहितको किस्ता निकासा
              </p>
            </div>
          </div>

          <div style={{ flexWrap: 'wrap', borderRadius: '8px', border: '1.5px solid #cbd5e1', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', outline: 'none', color: '#0f172a' }}>
            <div className="dt-responsive-table-wrapper">
<table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#0f766e', color: '#ffffff' }}>
                  <th style={{ padding: '10px 8px', border: '1px solid #0d9488', textAlign: 'center' }}>क्र.स.</th>
                  <th style={{ padding: '10px 10px', border: '1px solid #0d9488' }}>आयोजनाको नाम</th>
                  <th style={{ padding: '10px 10px', border: '1px solid #0d9488', textAlign: 'right' }}>कार्यालय लागत</th>
                  <th style={{ padding: '10px 10px', border: '1px solid #0d9488', textAlign: 'right' }}>हालसम्म भुक्तानी</th>
                  <th style={{ padding: '10px 10px', border: '1px solid #0d9488', textAlign: 'right' }}>बाँकी बजेट</th>
                  <th style={{ padding: '10px 10px', border: '1px solid #0d9488', textAlign: 'center' }}>वित्तीय प्रगति</th>
                  <th style={{ padding: '10px 10px', border: '1px solid #0d9488', textAlign: 'center' }}>नापी किताब (MB)</th>
                  <th style={{ padding: '10px 10px', border: '1px solid #0d9488', textAlign: 'center' }}>कार्य</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p: any, idx: number) => {
                  const agreed = Number(p.officeCost || p.budget || 0);
                  const paid = Number(p.paidAmount || 0);
                  const remaining = Math.max(0, agreed - paid);
                  const pct = agreed > 0 ? Math.round((paid / agreed) * 100) : 0;
                  const mbCount = p.measurementBook?.length || 1;

                  return (
                    <tr key={p.id} style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                      <td style={{ padding: '9px 8px', border: '1.5px solid #e2e8f0', textAlign: 'center' }}>{idx + 1}</td>
                      <td style={{ padding: '9px 10px', border: '1.5px solid #e2e8f0', fontWeight: 600 }}>{p.name}</td>
                      <td style={{ padding: '9px 10px', border: '1.5px solid #e2e8f0', textAlign: 'right', fontWeight: 600 }}>
                        रु. {agreed.toLocaleString()}
                      </td>
                      <td style={{ padding: '9px 10px', border: '1.5px solid #e2e8f0', textAlign: 'right', color: '#16a34a', fontWeight: 700 }}>
                        रु. {paid.toLocaleString()}
                      </td>
                      <td style={{ padding: '9px 10px', border: '1.5px solid #e2e8f0', textAlign: 'right', color: '#ea580c' }}>
                        रु. {remaining.toLocaleString()}
                      </td>
                      <td style={{ padding: '9px 10px', border: '1.5px solid #e2e8f0', textAlign: 'center' }}>
                        <span style={{ fontWeight: 800, color: pct >= 80 ? '#16a34a' : '#0284c7' }}>{toNepaliNum(pct)}%</span>
                      </td>
                      <td style={{ padding: '9px 10px', border: '1.5px solid #e2e8f0', textAlign: 'center' }}>
                        <span style={{ padding: '3px 8px', borderRadius: '12px', backgroundColor: '#e0f2fe', color: '#0369a1', fontWeight: 700, fontSize: '0.75rem' }}>
                          {toNepaliNum(mbCount)} नापजाँच
                        </span>
                      </td>
                      <td style={{ padding: '9px 10px', border: '1.5px solid #e2e8f0', textAlign: 'center' }}>
                        <button
                          onClick={() => handleOpenMBModal(p)}
                          style={{
                            padding: '5px 10px',
                            borderRadius: '6px',
                            backgroundColor: '#0284c7',
                            color: '#ffffff',
                            border: 'none',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                          }}
                        >
                          नापी किताब / किस्ता
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
      )}

      {/* ========================================================================= */}
      {/* TAB 5: अनुगमन तथा सामाजिक परीक्षण (MONITORING & SOCIAL AUDIT) */}
      {/* ========================================================================= */}
      {activeTab === 'monitoring_audit' && (
        <div className="dt-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.75rem' }}>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                वडा/पालिकास्तरीय अनुगमन तथा सामाजिक परीक्षण
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#475569', margin: '3px 0 0' }}>
                अनुगमन समितिको प्रतिवेदन, गुणस्तर ग्रेड (A/B/C/D), Geotagged फोटोहरू र सार्वजनिक सुनुवाइ
              </p>
            </div>
          </div>

          <div className="dt-responsive-grid-stack" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
            {projects.map((p: any) => {
              const lastMon = p.monitoringRecords?.[0] || {
                date: '२०८३-०२-२९',
                status: 'सन्तोषजनक',
                rating: 'A',
                monitorName: 'वडा अनुगमन समिति',
              };

              return (
                <div
                  key={p.id}
                  className="dt-card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                    borderLeft: '4px solid #2563eb',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb' }}>वडा नं. {toNepaliNum(p.wardNumber)}</span>
                      <span style={{ padding: '2px 8px', borderRadius: '12px', backgroundColor: '#dcfce7', color: '#166534', fontWeight: 700, fontSize: '0.75rem' }}>
                        गुणस्तर ग्रेड: {lastMon.rating || 'A'}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem' }}>{p.name}</h3>

                    <div style={{ backgroundColor: '#f8fafc', padding: '0.6rem', borderRadius: '6px', fontSize: '0.775rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <div><strong>अन्तिम अनुगमन:</strong> {toNepaliNum(lastMon.date)} ({lastMon.monitorName})</div>
                      <div><strong>भौतिक प्रगति:</strong> {toNepaliNum(p.progressPercentage || 80)}%</div>
                      <div><strong>सामाजिक परीक्षण:</strong> {p.socialAudit?.publicSatisfaction ? `सम्पन्न (${p.socialAudit.publicSatisfaction})` : 'सम्पन्न भइसकेको'}</div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenMonitoringModal(p)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '6px',
                      backgroundColor: '#1e40af',
                      color: '#ffffff',
                      border: 'none',
                      fontWeight: 600,
                      fontSize: '0.775rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                    }}
                  >
                    <Eye size={14} />
                    <span>अनुगमन, फोटो तथा सामाजिक परीक्षण</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: योजना फरफारक तथा सम्पन्नता (PROJECT CLEARANCE & FARFARAK) */}
      {/* ========================================================================= */}
      {activeTab === 'farfarak_clearance' && (
        <div className="dt-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.75rem' }}>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                योजना निर्माण सम्पन्नता तथा अन्तिम फरफारक (Farfarak)
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#475569', margin: '3px 0 0' }}>
                निर्माण सम्पन्न प्रमाणपत्र, मर्मत सम्भार कोष (३%) दाखिला, धरौटी मिलान र समुदायलाई आयोजना हस्तान्तरण
              </p>
            </div>
          </div>

          <div style={{ flexWrap: 'wrap', borderRadius: '8px', border: '1.5px solid #cbd5e1', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', outline: 'none', color: '#0f172a' }}>
            <div className="dt-responsive-table-wrapper">
<table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#0f766e', color: '#ffffff' }}>
                  <th style={{ padding: '10px 8px', border: '1px solid #0d9488', textAlign: 'center' }}>क्र.स.</th>
                  <th style={{ padding: '10px 10px', border: '1px solid #0d9488' }}>आयोजनाको नाम</th>
                  <th style={{ padding: '10px 10px', border: '1px solid #0d9488', textAlign: 'right' }}>कुल लागत अनुमान</th>
                  <th style={{ padding: '10px 10px', border: '1px solid #0d9488', textAlign: 'right' }}>मर्मत सम्भार कोष (३%)</th>
                  <th style={{ padding: '10px 10px', border: '1px solid #0d9488', textAlign: 'center' }}>सम्पन्नता प्रमाणपत्र</th>
                  <th style={{ padding: '10px 10px', border: '1px solid #0d9488', textAlign: 'center' }}>फरफारक स्थिति</th>
                  <th style={{ padding: '10px 10px', border: '1px solid #0d9488', textAlign: 'center' }}>कार्य</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p: any, idx: number) => {
                  const cost = Number(p.officeCost || p.budget || 0);
                  const isFarfarak = Boolean(p.farfarakDetails?.isFarfarakDone);
                  const certNo = p.farfarakDetails?.completionCertificateNo || `PPK-CMP-${p.projectCode.slice(-6)}`;

                  return (
                    <tr key={p.id} style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                      <td style={{ padding: '9px 8px', border: '1.5px solid #e2e8f0', textAlign: 'center' }}>{idx + 1}</td>
                      <td style={{ padding: '9px 10px', border: '1.5px solid #e2e8f0', fontWeight: 600 }}>{p.name}</td>
                      <td style={{ padding: '9px 10px', border: '1.5px solid #e2e8f0', textAlign: 'right', fontWeight: 600 }}>
                        रु. {cost.toLocaleString()}
                      </td>
                      <td style={{ padding: '9px 10px', border: '1.5px solid #e2e8f0', textAlign: 'right', color: '#0f766e', fontWeight: 600 }}>
                        रु. {Math.round(cost * 0.03).toLocaleString()}
                      </td>
                      <td style={{ padding: '9px 10px', border: '1.5px solid #e2e8f0', textAlign: 'center', fontFamily: 'monospace' }}>
                        {certNo}
                      </td>
                      <td style={{ padding: '9px 10px', border: '1.5px solid #e2e8f0', textAlign: 'center' }}>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '12px',
                            backgroundColor: isFarfarak ? '#dcfce7' : '#fef3c7',
                            color: isFarfarak ? '#166534' : '#92400e',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                          }}
                        >
                          {isFarfarak ? 'फरफारक सम्पन्न' : 'फरफारक बाँकी'}
                        </span>
                      </td>
                      <td style={{ padding: '9px 10px', border: '1.5px solid #e2e8f0', textAlign: 'center' }}>
                        <button
                          onClick={() => handleOpenFarfarakModal(p)}
                          style={{
                            padding: '5px 10px',
                            borderRadius: '6px',
                            backgroundColor: '#059669',
                            color: '#ffffff',
                            border: 'none',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                          }}
                        >
                          फरफारक व्यवस्थापन
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
      )}

      {/* ========================================================================= */}
      {/* TAB 7: बजेट रकमान्तर तथा भेरियसन (BUDGET VIREMENT & VARIATION) */}
      {/* ========================================================================= */}
      {activeTab === 'budget_virement' && (
        <div className="dt-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.75rem' }}>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                बजेट रकमान्तर, थप निकासा तथा भेरियसन व्यवस्थापन
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#475569', margin: '3px 0 0' }}>
                गाउँ कार्यपालिकाको निर्णयानुसार योजनाहरू बीच बजेट रकमान्तर (Virement) तथा पूरक बजेट विनियोजन लग
              </p>
            </div>

            <button
              onClick={() => setIsVirementModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.55rem 1rem',
                borderRadius: '6px',
                backgroundColor: '#0284c7',
                color: '#ffffff',
                border: 'none',
                fontWeight: 600,
                fontSize: '0.825rem',
                cursor: 'pointer',
              }}
            >
              <ArrowRightLeft size={16} />
              <span>+ नयाँ बजेट रकमान्तर गर्नुहोस्</span>
            </button>
          </div>

          <div style={{ flexWrap: 'wrap', borderRadius: '8px', border: '1.5px solid #cbd5e1', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', outline: 'none', color: '#0f172a' }}>
            <div className="dt-responsive-table-wrapper">
<table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#0f766e', color: '#ffffff' }}>
                  <th style={{ padding: '10px 8px', border: '1px solid #0d9488', textAlign: 'center' }}>क्र.स.</th>
                  <th style={{ padding: '10px 10px', border: '1px solid #0d9488' }}>आयोजनाको नाम</th>
                  <th style={{ padding: '10px 10px', border: '1px solid #0d9488' }}>बजेट स्रोत</th>
                  <th style={{ padding: '10px 10px', border: '1px solid #0d9488', textAlign: 'right' }}>हालको कुल बजेट</th>
                  <th style={{ padding: '10px 10px', border: '1px solid #0d9488' }}>रकमान्तर स्थिति / विवरण</th>
                  <th style={{ padding: '10px 10px', border: '1px solid #0d9488', textAlign: 'center' }}>कार्य</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p: any, idx: number) => (
                  <tr key={p.id} style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                    <td style={{ padding: '9px 8px', border: '1.5px solid #e2e8f0', textAlign: 'center' }}>{idx + 1}</td>
                    <td style={{ padding: '9px 10px', border: '1.5px solid #e2e8f0', fontWeight: 600 }}>{p.name}</td>
                    <td style={{ padding: '9px 10px', border: '1.5px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>{p.budgetSource}</td>
                    <td style={{ padding: '9px 10px', border: '1.5px solid #e2e8f0', textAlign: 'right', fontWeight: 700, color: '#0369a1' }}>
                      रु. {Number(p.officeCost || p.budget || 0).toLocaleString()}
                    </td>
                    <td style={{ padding: '9px 10px', border: '1.5px solid #e2e8f0', color: '#475569' }}>
                      {p.virementDetails?.transferredIn
                        ? `रकमान्तर प्राप्त: रु. ${Number(p.virementDetails.transferredIn.amount).toLocaleString()} (${p.virementDetails.transferredIn.fromProject})`
                        : p.virementDetails?.transferredOut
                        ? `रकमान्तर पठाइएको: रु. ${Number(p.virementDetails.transferredOut.amount).toLocaleString()}`
                        : 'सामान्य विनियोजन'}
                    </td>
                    <td style={{ padding: '9px 10px', border: '1.5px solid #e2e8f0', textAlign: 'center' }}>
                      <button
                        onClick={() => {
                          setSelectedProject(p);
                          setIsVirementModalOpen(true);
                        }}
                        style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          backgroundColor: '#e0f2fe',
                          color: '#0369a1',
                          border: '1px solid #bae6fd',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                        }}
                      >
                        रकमान्तर
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
</div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {projectToDelete && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(3px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '1.5rem',
              maxWidth: '420px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#dc2626', marginBottom: '0.75rem' }}>
              <AlertCircle size={24} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>आयोजना मेटाउने निश्चित गर्नुहुन्छ?</h3>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: '1.5', margin: '0 0 1.25rem 0' }}>
              तपाईं "<strong>{projectToDelete.name}</strong>" सम्झौता रेकर्ड हटाउन लाग्नुभएको छ।
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                onClick={() => setProjectToDelete(null)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  border: '1.5px solid #cbd5e1', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', outline: 'none',
                  backgroundColor: '#ffffff',
                  color: '#475569',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                रद्द गर्नुहोस्
              </button>
              <button
                onClick={() => deleteProjectMutation.mutate(projectToDelete.id)}
                disabled={deleteProjectMutation.isPending}
                style={{
                  padding: '0.5rem 1.25rem',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                {deleteProjectMutation.isPending ? 'मेटाउँदैछ...' : 'निश्चय नै मेटाउनुहोस्'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Project Agreement Entry & Edit Modal */}
      <ProjectAgreementModal
        isOpen={isAgreementModalOpen}
        onClose={() => {
          setIsAgreementModalOpen(false);
          setSelectedProject(null);
        }}
        onSave={(data) => saveProjectMutation.mutate(data)}
        projectToEdit={selectedProject}
        isSubmitting={saveProjectMutation.isPending}
      />

      {/* Agreement Document Print Modal */}
      <ProjectAgreementPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => {
          setIsPrintModalOpen(false);
          setSelectedProject(null);
        }}
        project={selectedProject}
      />

      {/* Official Letters & Certificates Generator Modal */}
      <OfficialLettersGeneratorModal
        isOpen={isLettersModalOpen}
        onClose={() => {
          setIsLettersModalOpen(false);
          setSelectedProject(null);
        }}
        project={selectedProject}
      />

      {/* Consumer Committee Management Modal */}
      <ConsumerCommitteeModal
        isOpen={isCommitteeModalOpen}
        onClose={() => {
          setIsCommitteeModalOpen(false);
          setSelectedProject(null);
        }}
        project={selectedProject}
        onSave={async (data) => {
          await projectsApi.update(selectedProject!.id!, data);
          queryClient.invalidateQueries({ queryKey: ['projects-list'] });
          showToast('उपभोक्ता समिति विवरण सुरक्षित गरियो!');
        }}
        onOpenLetter={(type) => {
          setIsCommitteeModalOpen(false);
          setIsLettersModalOpen(true);
        }}
      />

      {/* Measurement Book & Installment Payment Modal */}
      <MeasurementBookInstallmentModal
        isOpen={isMBModalOpen}
        onClose={() => {
          setIsMBModalOpen(false);
          setSelectedProject(null);
        }}
        project={selectedProject}
        onSaveMB={async (entry) => {
          await saveMBMutation.mutateAsync(entry);
        }}
        onRecordPayment={async (payload) => {
          await recordPaymentMutation.mutateAsync(payload);
        }}
      />

      {/* Monitoring & Social Audit Modal */}
      <MonitoringSocialAuditModal
        isOpen={isMonitoringModalOpen}
        onClose={() => {
          setIsMonitoringModalOpen(false);
          setSelectedProject(null);
        }}
        project={selectedProject}
        onAddMonitoring={async (record) => {
          // await addMonitoringMutation.mutateAsync(record);
        }}
        onSaveSocialAudit={async (audit) => {
          await saveSocialAuditMutation.mutateAsync(audit);
        }}
      />

      {/* Project Clearance & Farfarak Modal */}
      <ProjectFarfarakModal
        isOpen={isFarfarakModalOpen}
        onClose={() => {
          setIsFarfarakModalOpen(false);
          setSelectedProject(null);
        }}
        project={selectedProject}
        onProcessFarfarak={async (data) => {
          await processFarfarakMutation.mutateAsync(data);
        }}
        onOpenLetter={(type) => {
          setIsFarfarakModalOpen(false);
          setIsLettersModalOpen(true);
        }}
      />

      {/* Budget Virement Modal */}
      <BudgetVirementModal
        isOpen={isVirementModalOpen}
        onClose={() => setIsVirementModalOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['projects-list'] });
          showToast('रकमान्तर कार्य सफलतापूर्वक सम्पन्न भयो!');
        }}
        projects={projects}
      />

      {/* Excel File Import Modal */}
      <ProjectExcelImportModal
        isOpen={isExcelImportModalOpen}
        onClose={() => setIsExcelImportModalOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['projects-list'] });
          showToast('एक्सेलबाट आयोजनाहरू सफलतापूर्वक आयात गरियो!');
        }}
      />
    </div>
  );
};

export default ProjectsPage;
