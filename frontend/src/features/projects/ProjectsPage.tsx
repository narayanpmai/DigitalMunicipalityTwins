import React, { useState, useMemo } from 'react';
import { NepaliDatePicker } from '../../components/common/NepaliDatePicker';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as XLSX from 'xlsx';
import { projectsApi } from '../../api/projects';
import type { Project } from '../../api/projects';
import { useFiscalYear } from '../../context/FiscalYearContext';
import { useAuth } from '../../context/AuthContext';
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
  FolderOpen,
  Smartphone,
  LayoutGrid,
  List,
} from 'lucide-react';
import { nepaliNumberToWords } from '../../utils/nepaliNumberWords';
import { ProjectAgreementModal } from './components/ProjectAgreementModal';
import { ProjectAgreementPrintModal } from './components/ProjectAgreementPrintModal';
import { BudgetVirementModal } from './components/BudgetVirementModal';
import { ProjectExcelImportModal } from './components/ProjectExcelImportModal';
import { OfficialLettersGeneratorModal } from './components/OfficialLettersGeneratorModal';
import { ConsumerCommitteeModal } from './components/ConsumerCommitteeModal';
import { MeasurementBookInstallmentModal } from './components/MeasurementBookInstallmentModal';
import { MonitoringSocialAuditModal } from './components/MonitoringSocialAuditModal';
import { ProjectFarfarakModal } from './components/ProjectFarfarakModal';
import { ProjectDocumentsModal } from './components/ProjectDocumentsModal';
import { ProjectApprovalModal, APPROVAL_PIPELINE_STAGES } from './components/ProjectApprovalModal';
import { ProjectHoardingBoardModal } from './components/ProjectHoardingBoardModal';
import { ProjectTimeExtensionModal } from './components/ProjectTimeExtensionModal';
import { ProjectSutraAuditExportModal } from './components/ProjectSutraAuditExportModal';
import { ProjectSmsNotificationModal } from './components/ProjectSmsNotificationModal';
import { ProjectsDashboardTab } from './components/ProjectsDashboardTab';
import { ProjectsGisTab } from './components/ProjectsGisTab';
import { BudgetSourcesTab } from './components/BudgetSourcesTab';
import { BudgetSubHeadsTab } from './components/BudgetSubHeadsTab';
import type { BudgetSubHeadItem, TimeExtensionRecord } from '../../types/sectoral';

// Nepali digit converter
const toNepaliNum = (num: number | string): string => {
  const nepaliDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  return String(num).replace(/\d/g, (d) => nepaliDigits[parseInt(d, 10)]);
};

// Compact Action Button Style helper
const actionBtnStyle = (color: string, bg: string, border: string): React.CSSProperties => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '3px',
  padding: '3px 5px',
  borderRadius: '5px',
  border: `1px solid ${border}`,
  backgroundColor: bg,
  color: color,
  fontSize: '0.68rem',
  fontWeight: 700,
  cursor: 'pointer',
  height: '24px',
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  transition: 'all 0.15s ease',
});

export const ProjectsPage: React.FC = () => {
  const queryClient = useQueryClient();

  // Navigation tab state supporting all modern municipal modules in 2 balanced rows
  const [activeTab, setActiveTab] = useState<
    | 'report_list'
    | 'committees_list'
    | 'mb_installments'
    | 'monitoring_audit'
    | 'farfarak_clearance'
    | 'budget_virement'
    | 'budget_sources'
    | 'budget_subheads'
    | 'dashboard'
    | 'gis_map'
    | 'sutra_audit'
    | 'sms_hub'
  >('dashboard');

  // Unified Tab 1 view mode toggle: 'table' vs 'cards'
  const [projectViewMode, setProjectViewMode] = useState<'table' | 'cards'>('table');

  const { fiscalYears, activeFiscalYear } = useFiscalYear();
  const { hasRole } = useAuth();
  const canCreateEditProject = hasRole([
    'super_admin',
    'admin',
    'cao',
    'it_admin',
    'planning_officer',
    'engineer',
    'accountant',
    'ward_user',
    'data_entry',
  ]);
  const canDeleteProject = hasRole(['super_admin', 'admin', 'cao', 'planning_officer']);
  const canTransferBudget = hasRole(['super_admin', 'admin', 'cao', 'accountant', 'planning_officer']);

  // Filter states
  const [filterFiscalYear, setFilterFiscalYear] = useState<string>(activeFiscalYear || 'all');
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
  const [isDocsModalOpen, setIsDocsModalOpen] = useState(false);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [isHoardingModalOpen, setIsHoardingModalOpen] = useState(false);
  const [isTimeExtModalOpen, setIsTimeExtModalOpen] = useState(false);
  const [isSutraModalOpen, setIsSutraModalOpen] = useState(false);
  const [isSmsModalOpen, setIsSmsModalOpen] = useState(false);
  const [initialLetterType, setInitialLetterType] = useState<string>('work_order');

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
      showToast(selectedProject?.id ? 'आयोजना विवरण सफलतापूर्वक अद्यावधिक गरियो!' : 'नयाँ आयोजना सम्झौता फारम सुरक्षित गरियो!');
    },
    onError: (err: any) => {
      showToast(err?.response?.data?.detail || err?.message || 'आयोजना सुरक्षित गर्दा त्रुटि भयो', 'error');
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
      showToast(err?.response?.data?.detail || err?.message || 'हटाउँदा त्रुटि भयो', 'error');
    },
  });

  const saveCommitteeMutation = useMutation({
    mutationFn: (data: any) => {
      if (!selectedProject?.id) throw new Error('कुनै आयोजना छनोट गरिएको छैन।');
      return projectsApi.update(selectedProject.id, {
        committeeName: data.committeeName,
        committeeChair: data.chairperson?.name,
        committeeSecretary: data.secretary?.name,
        committeeTreasurer: data.treasurer?.name,
        consumerCommittee: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects-list'] });
      setIsCommitteeModalOpen(false);
      setSelectedProject(null);
      showToast('उपभोक्ता समिति विवरण सुरक्षित गरियो!');
    },
    onError: (err: any) => showToast(err?.response?.data?.detail || err?.message || 'समिति सुरक्षित गर्दा त्रुटि भयो', 'error'),
  });

  const addInstallmentMutation = useMutation({
    mutationFn: (inst: any) => {
      if (!selectedProject?.id) throw new Error('कुनै आयोजना छनोट गरिएको छैन।');
      const existing = selectedProject.installments || [];
      const updated = [...existing, inst];
      return projectsApi.update(selectedProject.id, {
        installments: updated,
        paidAmount: updated.reduce((sum, item) => sum + Number(item.amount || 0), 0),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects-list'] });
      showToast('किस्ता भुक्तानी सुरक्षित गरियो!');
    },
    onError: (err: any) => showToast(err?.response?.data?.detail || err?.message || 'किस्ता सुरक्षित गर्दा त्रुटि भयो', 'error'),
  });

  const updateMeasurementBookMutation = useMutation({
    mutationFn: (mb: any) => {
      if (!selectedProject?.id) throw new Error('कुनै आयोजना छनोट गरिएको छैन।');
      const existingMb = selectedProject.measurementBooks || [];
      return projectsApi.update(selectedProject.id, {
        measurementBooks: [...existingMb, mb],
        physicalProgressPercent: mb.cumulativePhysicalPercent,
        progressPercentage: mb.cumulativePhysicalPercent,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects-list'] });
      showToast('नापी किताब (MB) प्रविष्टि सुरक्षित गरियो!');
    },
    onError: (err: any) => showToast(err?.response?.data?.detail || err?.message || 'MB सुरक्षित गर्दा त्रुटि भयो', 'error'),
  });

  const addMonitoringMutation = useMutation({
    mutationFn: (rec: any) => {
      if (!selectedProject?.id) throw new Error('कुनै आयोजना छनोट गरिएको छैन।');
      const existing = selectedProject.monitoringRecords || [];
      return projectsApi.update(selectedProject.id, {
        monitoringRecords: [rec, ...existing],
        progressPercentage: rec.progressObserved ?? selectedProject.progressPercentage,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects-list'] });
      showToast('स्थलगत अनुगमन प्रतिवेदन दर्ता गरियो!');
    },
    onError: (err: any) => showToast(err?.response?.data?.detail || err?.message || 'अनुगमन सुरक्षित गर्दा त्रुटि भयो', 'error'),
  });

  const saveSocialAuditMutation = useMutation({
    mutationFn: (audit: any) => {
      if (!selectedProject?.id) throw new Error('कुनै आयोजना छनोट गरिएको छैन।');
      return projectsApi.update(selectedProject.id, { socialAudit: audit });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects-list'] });
      showToast('सार्वजनिक सुनुवाइ तथा सामाजिक परीक्षण सुरक्षित गरियो!');
    },
    onError: (err: any) => showToast(err?.response?.data?.detail || err?.message || 'सामाजिक परीक्षण सुरक्षित गर्दा त्रुटि भयो', 'error'),
  });

  const saveFarfarakMutation = useMutation({
    mutationFn: (farfarak: any) => {
      if (!selectedProject?.id) throw new Error('कुनै आयोजना छनोट गरिएको छैन।');
      return projectsApi.update(selectedProject.id, {
        farfarakDetails: farfarak,
        approvalStage: farfarak.isFarfarakDone ? 'completed' : selectedProject.approvalStage,
        status: farfarak.isFarfarakDone ? 'सम्पन्न' : selectedProject.status,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects-list'] });
      setIsFarfarakModalOpen(false);
      setSelectedProject(null);
      showToast('योजना सम्पन्नता तथा फरफारक अभिलेख सुरक्षित गरियो!');
    },
    onError: (err: any) => showToast(err?.response?.data?.detail || err?.message || 'फरफारक सुरक्षित गर्दा त्रुटि भयो', 'error'),
  });

  const updateDocumentsMutation = useMutation({
    mutationFn: (docs: any[]) => {
      if (!selectedProject?.id) throw new Error('कुनै आयोजना छनोट गरिएको छैन।');
      return projectsApi.update(selectedProject.id, { documents: docs });
    },
    onSuccess: (updated: any) => {
      if (updated?.id) setSelectedProject(updated);
      queryClient.invalidateQueries({ queryKey: ['projects-list'] });
      showToast('कागजात अभिलेख सुरक्षित गरियो!');
    },
    onError: (err: any) => showToast(err?.response?.data?.detail || err?.message || 'कागजात सुरक्षित गर्दा त्रुटि भयो', 'error'),
  });

  const updateTimeExtensionMutation = useMutation({
    mutationFn: (records: TimeExtensionRecord[]) => {
      if (!selectedProject?.id) throw new Error('कुनै आयोजना छनोट गरिएको छैन।');
      const latestApproved = records.filter((r) => r.isApproved).sort((a, b) => b.extensionDays - a.extensionDays)[0];
      const payload: Partial<Project> = { timeExtensions: records };
      if (latestApproved?.extendedCompletionDateBs) {
        payload.completionDateBs = latestApproved.extendedCompletionDateBs;
      }
      return projectsApi.update(selectedProject.id, payload);
    },
    onSuccess: (updated: any) => {
      if (updated?.id) setSelectedProject(updated);
      queryClient.invalidateQueries({ queryKey: ['projects-list'] });
      showToast('म्याद थप अभिलेख तथा आदेश सफलतापूर्वक अद्यावधिक गरियो!');
    },
    onError: (err: any) => showToast(err?.response?.data?.detail || err?.message || 'म्याद थप सुरक्षित गर्दा त्रुटि भयो', 'error'),
  });

  const updateApprovalMutation = useMutation({
    mutationFn: ({ stage, record }: { stage: string; record: any }) => {
      if (!selectedProject?.id) throw new Error('कुनै आयोजना छनोट गरिएको छैन।');
      const existingHistory = selectedProject.approvalHistory || [];
      return projectsApi.update(selectedProject.id, {
        approvalStage: stage,
        approvalHistory: [record, ...existingHistory],
      });
    },
    onSuccess: (updated: any) => {
      if (updated?.id) setSelectedProject(updated);
      queryClient.invalidateQueries({ queryKey: ['projects-list'] });
      showToast('स्वीकृति तह (Approval Pipeline) अद्यावधिक गरियो!');
    },
    onError: (err: any) => showToast(err?.response?.data?.detail || err?.message || 'स्वीकृति प्रक्रिया त्रुटि', 'error'),
  });

  // Financial calculations
  const { totalOfficeCost, totalCommitteeCost, totalPaidAmount } = useMemo(() => {
    let office = 0;
    let committee = 0;
    let paid = 0;
    projects.forEach((p) => {
      office += Number(p.officeCost || p.budget || 0);
      committee += Number(p.committeeCost || 0);
      paid += Number(p.paidAmount || 0);
    });
    return { totalOfficeCost: office, totalCommitteeCost: committee, totalPaidAmount: paid };
  }, [projects]);

  // Handlers
  const handleOpenEditModal = (p: Project) => {
    setSelectedProject(p);
    setIsAgreementModalOpen(true);
  };

  const handleOpenPrintModal = (p: Project) => {
    setSelectedProject(p);
    setIsPrintModalOpen(true);
  };

  const handleOpenLettersModal = (p: Project, letterType = 'work_order') => {
    setSelectedProject(p);
    setInitialLetterType(letterType);
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

  const handleOpenDocsModal = (p: Project) => {
    setSelectedProject(p);
    setIsDocsModalOpen(true);
  };

  const handleOpenApprovalModal = (p: Project) => {
    setSelectedProject(p);
    setIsApprovalModalOpen(true);
  };

  const handleOpenHoardingModal = (p: Project) => {
    setSelectedProject(p);
    setIsHoardingModalOpen(true);
  };

  const handleOpenTimeExtModal = (p: Project) => {
    setSelectedProject(p);
    setIsTimeExtModalOpen(true);
  };

  const handleOpenSutraModal = (p?: Project) => {
    if (p) setSelectedProject(p);
    setIsSutraModalOpen(true);
  };

  const handleOpenSmsModal = (p?: Project) => {
    if (p) setSelectedProject(p);
    setIsSmsModalOpen(true);
  };

  const handleExportExcel = () => {
    if (!projects || projects.length === 0) {
      showToast('निर्यात गर्न कुनै डाटा छैन!', 'error');
      return;
    }
    const exportData = projects.map((p, idx) => ({
      'क्र.स.': idx + 1,
      'आर्थिक वर्ष': p.fiscalYear || '',
      'बजेट स्रोत': p.budgetSource || '',
      'वडा/नगर': p.wardNumber ? `वडा नं. ${p.wardNumber}` : p.level || '',
      'आयोजनाको नाम': p.name || '',
      'मार्फत': p.marfat || 'उपभोक्ता समिति',
      'सुरु हुने मिति': p.startDateBs || '',
      'सम्पन्न हुने मिति': p.completionDateBs || '',
      'कार्यालय लागत (रु.)': Number(p.officeCost || p.budget || 0),
      'उपभोक्ता समिति लागत (रु.)': Number(p.committeeCost || 0),
      'कुल भुक्तानी (रु.)': Number(p.paidAmount || 0),
      'स्थिति': p.status || '',
      'स्वीकृति तह': APPROVAL_PIPELINE_STAGES.find((s) => s.key === p.approvalStage)?.labelNp || p.approvalStage || 'योजना दर्ता',
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'योजना सम्झौता सुची');
    XLSX.writeFile(wb, `योजना_सम्झौता_प्रतिवेदन_${new Date().toISOString().split('T')[0]}.xlsx`);
    showToast('Excel फाइल सफलतापूर्वक डाउनलोड भयो!');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="dt-page-container" style={{ padding: '1.25rem', maxWidth: '1600px', margin: '0 auto' }}>
      {/* Toast Alert */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 99999,
            backgroundColor: toastMessage.type === 'error' ? '#ef4444' : '#10b981',
            color: '#ffffff',
            padding: '0.75rem 1.25rem',
            borderRadius: '8px',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: 600,
            fontSize: '0.875rem',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          {toastMessage.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Main Header matching Government Banner */}
      <div
        className="d-print-none"
        style={{
          background: 'linear-gradient(135deg, #0f4c81 0%, #1e3a8a 100%)',
          borderRadius: '12px',
          padding: '1.25rem 1.5rem',
          color: '#ffffff',
          marginBottom: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: '0 4px 12px rgba(15, 76, 129, 0.25)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(4px)',
            }}
          >
            <FolderGit2 size={26} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: '0.7rem',
                  letterSpacing: '0.5px',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontWeight: 600,
                }}
              >
                LGOA २०७४ अनुसूची ८ • स्थानीय स्तरका विकास आयोजना तथा पूर्वाधार
              </span>
            </div>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, margin: '4px 0 2px 0' }}>
              आधुनिक योजना सम्झौता तथा कार्यान्वयन व्यवस्थापन प्रणाली
            </h1>
            <p style={{ fontSize: '0.8rem', color: '#bfdbfe', margin: 0 }}>
              पाँचपोखरी थाङपाल गाउँपालिका — योजना सम्झौता, उपभोक्ता समिति, कार्यादेश, नापी किताब (MB), किस्ता निकासा, अनुगमन र फरफारक
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setIsExcelImportModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.55rem 0.95rem',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.825rem',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
          >
            <Download size={15} />
            <span>Excel फाइल अपलोड</span>
          </button>

          {canTransferBudget && (
            <button
              onClick={() => setIsVirementModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.55rem 0.95rem',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '0.825rem',
                cursor: 'pointer',
              }}
            >
              <ArrowRightLeft size={15} />
              <span>बजेट रकमान्तर</span>
            </button>
          )}

          {canCreateEditProject && (
            <button
              onClick={() => {
                setSelectedProject(null);
                setIsAgreementModalOpen(true);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.55rem 1.1rem',
                borderRadius: '8px',
                backgroundColor: '#ffffff',
                color: '#0f4c81',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.825rem',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
              }}
            >
              <Plus size={16} />
              <span>+ नयाँ योजना सम्झौता फारम</span>
            </button>
          )}
        </div>
      </div>

      {/* 2-Row Balanced Tab Navigation Bar (६-६ वटा ट्याब) */}
      <div
        className="d-print-none"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.55rem',
          marginBottom: '1.15rem',
        }}
      >
        {/* Row 1: Core Planning & Execution (६ वटा ट्याब - बराबर चौडाइ) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
            gap: '0.5rem',
          }}
        >
          {[
            { id: 'dashboard', label: 'ड्यासबोर्ड (Dashboard)', icon: <BarChart3 size={15} /> },
            { id: 'gis_map', label: 'GIS नक्सा (Spatial Map)', icon: <Map size={15} /> },
            { id: 'report_list', label: '१. योजना तथा सम्झौता', icon: <FileText size={15} /> },
            { id: 'committees_list', label: '२. उपभोक्ता समिति', icon: <Users size={15} /> },
            { id: 'mb_installments', label: '३. किस्ता र नापी किताब', icon: <Calculator size={15} /> },
            { id: 'monitoring_audit', label: '४. अनुगमन तथा परीक्षण', icon: <Eye size={15} /> },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                title={tab.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.45rem',
                  padding: '0.65rem 0.5rem',
                  borderRadius: '10px',
                  border: isActive ? '1.5px solid #0f4c81' : '1px solid #cbd5e1',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  background: isActive
                    ? 'linear-gradient(135deg, #0f4c81 0%, #1e3a8a 100%)'
                    : '#ffffff',
                  color: isActive ? '#ffffff' : '#1e293b',
                  boxShadow: isActive ? '0 4px 12px rgba(15, 76, 129, 0.25)' : '0 1px 3px rgba(0,0,0,0.03)',
                  transition: 'all 0.15s ease',
                  minWidth: 0,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '6px',
                    background: isActive ? 'rgba(255,255,255,0.2)' : '#f0f9ff',
                    color: isActive ? '#ffffff' : '#0f4c81',
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

        {/* Row 2: Governance, Quality, Budget & Communication (६ वटा ट्याब - बराबर चौडाइ) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
            gap: '0.5rem',
          }}
        >
          {[
            { id: 'farfarak_clearance', label: '५. फरफारक र सम्पन्नता', icon: <Award size={15} /> },
            { id: 'budget_virement', label: '६. बजेट रकमान्तर', icon: <ArrowRightLeft size={15} /> },
            { id: 'budget_subheads', label: '७. बजेट उप-शीर्षक रकम', icon: <Layers size={15} /> },
            { id: 'budget_sources', label: '८. बजेट स्रोत सूची', icon: <Coins size={15} /> },
            { id: 'sms_hub', label: '९. SMS सूचना केन्द्र', icon: <Smartphone size={15} /> },
            { id: 'sutra_audit', label: '१०. SuTRA तथा अडिट', icon: <FileSpreadsheet size={15} /> },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  if (tab.id === 'sutra_audit') {
                    setIsSutraModalOpen(true);
                  } else if (tab.id === 'sms_hub') {
                    handleOpenSmsModal(projects[0] || null);
                  } else {
                    setActiveTab(tab.id as any);
                  }
                }}
                title={tab.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.45rem',
                  padding: '0.65rem 0.5rem',
                  borderRadius: '10px',
                  border: isActive ? '1.5px solid #0f4c81' : '1px solid #cbd5e1',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  background: isActive
                    ? 'linear-gradient(135deg, #0f4c81 0%, #1e3a8a 100%)'
                    : '#ffffff',
                  color: isActive ? '#ffffff' : '#1e293b',
                  boxShadow: isActive ? '0 4px 12px rgba(15, 76, 129, 0.25)' : '0 1px 3px rgba(0,0,0,0.03)',
                  transition: 'all 0.15s ease',
                  minWidth: 0,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '6px',
                    background: isActive ? 'rgba(255,255,255,0.2)' : '#f0f9ff',
                    color: isActive ? '#ffffff' : '#0f4c81',
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
      </div>

      {/* KPI Stats Bar */}
      <div
        className="d-print-none"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem',
          marginBottom: '1.25rem',
        }}
      >
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '1rem 1.15rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.9rem',
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '11px',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 3px 8px rgba(2, 132, 199, 0.28)',
            }}
          >
            <FolderGit2 size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>कुल सम्झौता आयोजना</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginTop: '1px' }}>
              {toNepaliNum(projects.length)} वटा आयोजना
            </div>
            <div style={{ fontSize: '0.7rem', color: '#0284c7', fontWeight: 600, marginTop: '1px' }}>
              चालु तथा स्वीकृत योजनाहरू
            </div>
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '1rem 1.15rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.9rem',
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '11px',
              background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 3px 8px rgba(16, 185, 129, 0.28)',
            }}
          >
            <Coins size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>कुल कार्यालय लागत (अनुदान)</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#047857', marginTop: '1px' }}>
              रु. {toNepaliNum((totalOfficeCost / 100000).toFixed(2))} लाख
            </div>
            <div style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 600, marginTop: '1px' }}>
              गाउँपालिका विनियोजित बजेट
            </div>
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '1rem 1.15rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.9rem',
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '11px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 3px 8px rgba(245, 158, 11, 0.28)',
            }}
          >
            <CheckSquare size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>उपभोक्ता समिति जनसहभागिता</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#d97706', marginTop: '1px' }}>
              रु. {toNepaliNum((totalCommitteeCost / 100000).toFixed(2))} लाख
            </div>
            <div style={{ fontSize: '0.7rem', color: '#b45309', fontWeight: 600, marginTop: '1px' }}>
              श्रमदान तथा स्थानीय लागत
            </div>
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '1rem 1.15rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.9rem',
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '11px',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 3px 8px rgba(139, 92, 246, 0.28)',
            }}
          >
            <TrendingUp size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>कुल भुक्तानी निकासा भएको</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#6d28d9', marginTop: '1px' }}>
              रु. {toNepaliNum((totalPaidAmount / 100000).toFixed(2))} लाख
            </div>
            <div style={{ fontSize: '0.7rem', color: '#7c3aed', fontWeight: 600, marginTop: '1px' }}>
              वित्तीय प्रगति: {totalOfficeCost > 0 ? toNepaliNum(((totalPaidAmount / totalOfficeCost) * 100).toFixed(1)) : '०'}%
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB: Dashboard */}
      {/* ========================================================================= */}
      {activeTab === 'dashboard' && <ProjectsDashboardTab projects={projects} />}

      {/* ========================================================================= */}
      {/* TAB: GIS Map */}
      {/* ========================================================================= */}
      {activeTab === 'gis_map' && (
        <ProjectsGisTab
          projects={projects}
          onOpenProject={(p) => handleOpenEditModal(p)}
          onUpdateCoordinates={async (projectId, lat, lng) => {
            await projectsApi.update(projectId, { latitude: lat, longitude: lng });
            queryClient.invalidateQueries({ queryKey: ['projects-list'] });
            showToast('आयोजनाको GPS स्थान सफलतापूर्वक अद्यावधिक गरियो!');
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* TAB 1: योजना तथा सम्झौता व्यवस्थापन (UNIFIED TABLE & CARDS VIEW) */}
      {/* ========================================================================= */}
      {activeTab === 'report_list' && (
        <div className="dt-card" style={{ padding: '1.25rem' }}>
          {/* Header Bar */}
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
                योजना तथा सम्झौता व्यवस्थापन
              </h2>
              <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '3px' }}>
                स्वीकृत आयोजनाहरूको लागत अनुमान, सम्झौता, कार्यादेश तथा प्रगति स्थिति
              </div>
            </div>

            <div className="d-print-none" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              {/* View Mode Toggle: Table vs Cards */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#f1f5f9',
                  padding: '3px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                }}
              >
                <button
                  type="button"
                  onClick={() => setProjectViewMode('table')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '5px 11px',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: 'none',
                    backgroundColor: projectViewMode === 'table' ? '#0f4c81' : 'transparent',
                    color: projectViewMode === 'table' ? '#ffffff' : '#475569',
                    boxShadow: projectViewMode === 'table' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                  title="तालिका ढाँचामा हेर्नुहोस् (MIS Table View)"
                >
                  <List size={14} />
                  <span>तालिका (Table)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setProjectViewMode('cards')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '5px 11px',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: 'none',
                    backgroundColor: projectViewMode === 'cards' ? '#0f4c81' : 'transparent',
                    color: projectViewMode === 'cards' ? '#ffffff' : '#475569',
                    boxShadow: projectViewMode === 'cards' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                  title="कार्ड ढाँचामा हेर्नुहोस् (Interactive Cards View)"
                >
                  <LayoutGrid size={14} />
                  <span>कार्डहरू (Cards)</span>
                </button>
              </div>

              <button
                onClick={() => handleOpenSutraModal()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.5rem 0.9rem',
                  borderRadius: '6px',
                  backgroundColor: '#0f4c81',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.825rem',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(15, 76, 129, 0.25)',
                }}
                title="SuTRA Excel/CSV एक्सपोर्ट तथा महालेखा अडिट ट्रेल प्रतिवेदन"
              >
                <FileSpreadsheet size={15} />
                <span>📊 SuTRA / अडिट</span>
              </button>

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
                <span>Excel</span>
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

          {/* Executive Filter Bar */}
          <div
            className="d-print-none"
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              padding: '1rem 1.25rem',
              marginBottom: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>
                <Search size={16} color="#0f4c81" />
                <span>योजना खोज तथा फिल्टर (Search & Filter)</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                कुल <span style={{ color: '#0f4c81', fontWeight: 800 }}>{toNepaliNum(projects.length)}</span> वटा आयोजना फेला परे
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                gap: '0.75rem',
                alignItems: 'flex-end',
              }}
            >
              <div>
                <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  आर्थिक वर्ष
                </label>
                <select
                  value={filterFiscalYear}
                  onChange={(e) => setFilterFiscalYear(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem 0.6rem', borderRadius: '7px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#0f172a', fontSize: '0.825rem', outline: 'none' }}
                >
                  <option value="all">सबै आर्थिक वर्ष</option>
                  {fiscalYears.map((fy) => (
                    <option key={fy.id} value={fy.name}>
                      {fy.name} {fy.isCurrent ? '(चालु)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  वडा / नगर
                </label>
                <select
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem 0.6rem', borderRadius: '7px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#0f172a', fontSize: '0.825rem', outline: 'none' }}
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
                  style={{ width: '100%', padding: '0.5rem 0.6rem', borderRadius: '7px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#0f172a', fontSize: '0.825rem', outline: 'none' }}
                >
                  <option value="all">सबै बजेट स्रोतहरू</option>
                  <option value="गाउँपालिका आन्तरिक स्रोत">गाउँपालिका आन्तरिक स्रोत</option>
                  <option value="संघीय सरकार वित्तीय समानीकरण अनुदान">संघीय सरकार वित्तीय समानीकरण अनुदान</option>
                  <option value="संघीय विशेष अनुदान">संघीय विशेष अनुदान</option>
                  <option value="प्रदेश समपूरक अनुदान">प्रदेश समपूरक अनुदान</option>
                  <option value="प्रदेश विशेष अनुदान">प्रदेश विशेष अनुदान</option>
                  <option value="वडास्तरीय बजेट">वडास्तरीय बजेट</option>
                  <option value="प्रकोप/विपद् व्यवस्थापन कोष">प्रकोप/विपद् व्यवस्थापन कोष</option>
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
                  style={{ width: '100%', padding: '0.5rem 0.65rem', borderRadius: '7px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#0f172a', fontSize: '0.825rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  मिति (वि.सं.)
                </label>
                <NepaliDatePicker
                  value={filterDate}
                  onChange={(bs) => setFilterDate(bs)}
                  placeholder="मिति छान्नुहोस्"
                  inputStyle={{ padding: '0.45rem 0.6rem', fontSize: '0.825rem', border: '1px solid #cbd5e1', borderRadius: '7px' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.4rem' }}>
                <button
                  onClick={() => refetch()}
                  style={{
                    padding: '0.55rem 1rem',
                    borderRadius: '7px',
                    backgroundColor: '#0f4c81',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.825rem',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    boxShadow: '0 2px 4px rgba(15, 76, 129, 0.25)',
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
                    padding: '0.55rem 0.85rem',
                    borderRadius: '7px',
                    backgroundColor: '#f1f5f9',
                    fontWeight: 600,
                    fontSize: '0.825rem',
                    border: '1px solid #cbd5e1',
                    color: '#475569',
                    cursor: 'pointer',
                  }}
                >
                  रिसेट
                </button>
              </div>
            </div>
          </div>

          {/* View Mode: 10-Column Primary MIS Table OR Interactive Cards View */}
          {projectViewMode === 'table' ? (
            <div style={{ borderRadius: '10px', border: '1px solid #cbd5e1', boxShadow: '0 2px 6px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
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
                        background: 'linear-gradient(135deg, #0f2942 0%, #1e3a8a 100%)',
                        color: '#ffffff',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                      }}
                    >
                      <th style={{ padding: '11px 8px', border: '1px solid #1e3a8a', textAlign: 'center', width: '45px' }}>क्र.स.</th>
                      <th style={{ padding: '11px 8px', border: '1px solid #1e3a8a', width: '90px' }}>आर्थिक वर्ष</th>
                      <th style={{ padding: '11px 10px', border: '1px solid #1e3a8a', minWidth: '150px' }}>बजेट स्रोत</th>
                      <th style={{ padding: '11px 8px', border: '1px solid #1e3a8a', width: '85px' }}>वडा/नगर</th>
                      <th style={{ padding: '11px 12px', border: '1px solid #1e3a8a', minWidth: '220px' }}>आयोजनाको नाम</th>
                      <th style={{ padding: '11px 8px', border: '1px solid #1e3a8a', width: '105px' }}>मार्फत</th>
                      <th style={{ padding: '11px 8px', border: '1px solid #1e3a8a', width: '90px' }}>सुरु हुने मिति</th>
                      <th style={{ padding: '11px 8px', border: '1px solid #1e3a8a', width: '90px' }}>सम्पन्न हुने मिति</th>
                      <th style={{ padding: '11px 10px', border: '1px solid #1e3a8a', textAlign: 'right', width: '115px' }}>कार्यालय लागत</th>
                      <th style={{ padding: '11px 10px', border: '1px solid #1e3a8a', textAlign: 'right', width: '125px' }}>उपभोक्ता समिति लागत</th>
                      <th className="d-print-none" style={{ padding: '11px 8px', border: '1px solid #1e3a8a', textAlign: 'center', width: '275px', minWidth: '275px' }}>कार्य</th>
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
                                <span
                                  style={{
                                    fontSize: '0.68rem',
                                    backgroundColor: (p.approvalStage || 'draft') === 'completed' ? '#dcfce7' : (p.approvalStage || 'draft') === 'cao_approved' ? '#e0e7ff' : '#f1f5f9',
                                    color: (p.approvalStage || 'draft') === 'completed' ? '#166534' : (p.approvalStage || 'draft') === 'cao_approved' ? '#3730a3' : '#334155',
                                    padding: '1px 6px',
                                    borderRadius: '3px',
                                    fontWeight: 700,
                                  }}
                                >
                                  {APPROVAL_PIPELINE_STAGES.find((s) => s.key === (p.approvalStage || 'draft'))?.labelNp || '१. योजना दर्ता'}
                                </span>
                                {p.budgetId && (
                                  <span style={{ fontSize: '0.68rem', backgroundColor: '#ede9fe', color: '#5b21b6', padding: '1px 5px', borderRadius: '3px', fontWeight: 600 }}>
                                    रातो किताब आबद्ध
                                  </span>
                                )}
                                {p.procurementNo && (
                                  <span style={{ fontSize: '0.68rem', backgroundColor: '#fef3c7', color: '#92400e', padding: '1px 5px', borderRadius: '3px', fontFamily: 'monospace', fontWeight: 600 }}>
                                    ठेक्का: {p.procurementNo}
                                  </span>
                                )}
                                {p.responsibleEngineer && (
                                  <span style={{ fontSize: '0.68rem', backgroundColor: '#e0f2fe', color: '#0369a1', padding: '1px 5px', borderRadius: '3px' }}>
                                    👷 {p.responsibleEngineer}
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
                            <td className="d-print-none" style={{ padding: '6px 6px', border: '1.5px solid #e2e8f0', textAlign: 'center', verticalAlign: 'middle', width: '275px', minWidth: '275px' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '270px', margin: '0 auto' }}>
                                {/* Row 1: मुख्य सरकारी प्रक्रियाहरू (४ वटा बटन) */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
                                  <button
                                    onClick={() => handleOpenPrintModal(p)}
                                    title="कानूनी सम्झौता पत्र (Formal Legal Agreement Deed) प्रिन्ट"
                                    style={actionBtnStyle('#0369a1', '#f0f9ff', '#bae6fd')}
                                  >
                                    <FileText size={11} />
                                    <span>सम्झौता</span>
                                  </button>

                                  <button
                                    onClick={() => handleOpenLettersModal(p, 'bank_rec')}
                                    title="बैंक खाता सञ्चालन सिफारिस पत्र"
                                    style={actionBtnStyle('#0f766e', '#f0fdfa', '#99f6e4')}
                                  >
                                    <Building size={11} />
                                    <span>बैंक खाता</span>
                                  </button>

                                  <button
                                    onClick={() => handleOpenHoardingModal(p)}
                                    title="नागरिक सूचना पाटी (Citizen Information Hoarding Board) अटो-जेनेरेटर"
                                    style={actionBtnStyle('#b45309', '#fffbeb', '#fde68a')}
                                  >
                                    <QrCode size={11} />
                                    <span>सूचना पाटी</span>
                                  </button>

                                  <button
                                    onClick={() => handleOpenTimeExtModal(p)}
                                    title="योजना म्याद थप (Time Extension) व्यवस्थापन तथा आदेश पत्र"
                                    style={actionBtnStyle('#6d28d9', '#f5f3ff', '#ddd6fe')}
                                  >
                                    <Clock size={11} />
                                    <span>म्याद थप</span>
                                  </button>
                                </div>

                                {/* Row 2: सञ्चार, अडिट, फाइल तथा व्यवस्थापन (५ वा ६ वटा बटन) */}
                                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${canCreateEditProject && canDeleteProject ? 6 : canCreateEditProject || canDeleteProject ? 5 : 4}, 1fr)`, gap: '4px' }}>
                                  <button
                                    onClick={() => handleOpenApprovalModal(p)}
                                    title="तहगत स्वीकृति प्रक्रिया (Workflow & RBAC)"
                                    style={actionBtnStyle('#4338ca', '#eef2ff', '#c7d2fe')}
                                  >
                                    <ShieldCheck size={11} />
                                    <span>स्वीकृति</span>
                                  </button>

                                  <button
                                    onClick={() => handleOpenSmsModal(p)}
                                    title="उपभोक्ता समितिलाई SMS सूचना पठाउनुहोस् र लग हेर्नुहोस्"
                                    style={actionBtnStyle('#0284c7', '#f0f9ff', '#bae6fd')}
                                  >
                                    <Smartphone size={11} />
                                    <span>SMS</span>
                                  </button>

                                  <button
                                    onClick={() => handleOpenSutraModal(p)}
                                    title="SuTRA अडिट ट्रेल तथा वित्तीय प्रतिवेदन"
                                    style={actionBtnStyle('#0f4c81', '#eff6ff', '#bfdbfe')}
                                  >
                                    <FileSpreadsheet size={11} />
                                    <span>अडिट</span>
                                  </button>

                                  <button
                                    onClick={() => handleOpenDocsModal(p)}
                                    title="कागजात अभिलेख (माइन्युट, नागरिकता, इस्टिमेट)"
                                    style={actionBtnStyle('#0f766e', '#f0fdfa', '#99f6e4')}
                                  >
                                    <FolderOpen size={11} />
                                    <span>कागजात ({toNepaliNum(Array.isArray(p.documents) ? p.documents.length : 0)})</span>
                                  </button>

                                  {canCreateEditProject && (
                                    <button
                                      onClick={() => handleOpenEditModal(p)}
                                      title="आयोजना सम्पादन गर्नुहोस्"
                                      style={actionBtnStyle('#2563eb', '#eff6ff', '#bfdbfe')}
                                    >
                                      <Edit2 size={11} />
                                    </button>
                                  )}

                                  {canDeleteProject && (
                                    <button
                                      onClick={() => setProjectToDelete(p)}
                                      title="आयोजना मेटाउनुहोस्"
                                      style={actionBtnStyle('#dc2626', '#fef2f2', '#fecaca')}
                                    >
                                      <Trash2 size={11} />
                                    </button>
                                  )}
                                </div>
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
          ) : (
            /* Interactive Cards View (अक्षरेपी, प्रगति टाइमलाइन तथा पूर्ण कार्यहरू) */
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
              {projects.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>कुनै रेकर्ड फेला परेन।</div>
              ) : (
                projects.map((p: any) => {
                  const officeAmt = Number(p.officeCost || p.budget || 0);
                  const committeeAmt = Number(p.committeeCost || 0);
                  const stageKey = p.approvalStage || 'draft';
                  const words = nepaliNumberToWords(officeAmt);

                  return (
                    <div
                      key={p.id}
                      className="dt-card"
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '0.9rem',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        borderTop: '4px solid #0f4c81',
                        padding: '1.15rem',
                        backgroundColor: '#ffffff',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                      }}
                    >
                      <div>
                        {/* Header Badges */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '4px' }}>
                          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.72rem', padding: '2px 7px', borderRadius: '4px', backgroundColor: '#e0f2fe', color: '#0369a1', fontWeight: 700 }}>
                              {p.fiscalYear || 'चालु'}
                            </span>
                            <span style={{ fontSize: '0.72rem', padding: '2px 7px', borderRadius: '4px', backgroundColor: '#f1f5f9', color: '#334155', fontWeight: 600 }}>
                              {p.wardNumber ? `वडा नं. ${toNepaliNum(p.wardNumber)}` : p.level || 'नगर स्तरिय'}
                            </span>
                          </div>
                          <span style={{ fontSize: '0.72rem', padding: '2px 7px', borderRadius: '4px', backgroundColor: '#f0fdf4', color: '#16a34a', fontWeight: 700 }}>
                            {p.marfat || 'उपभोक्ता समिति'}
                          </span>
                        </div>

                        {/* Title & Committee */}
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.35rem 0', lineHeight: 1.35 }}>
                          {p.name}
                        </h3>
                        {p.committeeName && (
                          <div style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 500, marginBottom: '0.5rem' }}>
                            👥 {p.committeeName}
                          </div>
                        )}

                        {/* Visual 5-Step Lifecycle Stepper */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', margin: '0.6rem 0', backgroundColor: '#f8fafc', padding: '6px 8px', borderRadius: '6px' }}>
                          {[
                            { label: '१. दर्ता', done: true },
                            { label: '२. सम्झौता', done: stageKey !== 'draft' },
                            { label: '३. किस्ता', done: ['first_installment', 'running_bill', 'final_bill', 'completed'].includes(stageKey) },
                            { label: '४. अनुगमन', done: (p.monitoringRecords?.length > 0) || ['final_bill', 'completed'].includes(stageKey) },
                            { label: '५. फरफारक', done: stageKey === 'completed' || Boolean(p.farfarakDetails?.isFarfarakDone) },
                          ].map((step, sIdx, sArr) => (
                            <React.Fragment key={step.label}>
                              <span
                                style={{
                                  fontSize: '0.65rem',
                                  fontWeight: 700,
                                  padding: '2px 5px',
                                  borderRadius: '4px',
                                  backgroundColor: step.done ? '#dcfce7' : '#f1f5f9',
                                  color: step.done ? '#166534' : '#94a3b8',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {step.label}
                              </span>
                              {sIdx < sArr.length - 1 && (
                                <span style={{ fontSize: '0.65rem', color: '#cbd5e1' }}>›</span>
                              )}
                            </React.Fragment>
                          ))}
                        </div>

                        {/* Financial Box with Amount in Words */}
                        <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '0.65rem' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.35rem' }}>
                            <div>
                              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>कार्यालय लागत (अनुदान):</span>
                              <div style={{ fontWeight: 800, color: '#0f4c81', fontSize: '0.95rem' }}>रु. {officeAmt.toLocaleString('en-IN')}</div>
                            </div>
                            <div>
                              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>उपभोक्ता सहभागिता:</span>
                              <div style={{ fontWeight: 700, color: '#d97706', fontSize: '0.95rem' }}>रु. {committeeAmt.toLocaleString('en-IN')}</div>
                            </div>
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#0369a1', fontWeight: 600, borderTop: '1px dashed #cbd5e1', paddingTop: '4px' }}>
                            अक्षरेपी: {words}
                          </div>
                        </div>

                        {/* Duration & Budget Source */}
                        <div style={{ fontSize: '0.75rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <div><strong>बजेट स्रोत:</strong> {p.budgetSource || 'गाउँपालिका आन्तरिक स्रोत'}</div>
                          <div><strong>म्याद:</strong> {p.startDateBs || 'उपलब्ध छैन'} देखि {p.completionDateBs || 'उपलब्ध छैन'}</div>
                        </div>
                      </div>

                      {/* Action buttons grid */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderTop: '1px solid #e2e8f0', paddingTop: '0.65rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
                          <button onClick={() => handleOpenPrintModal(p)} style={actionBtnStyle('#0369a1', '#f0f9ff', '#bae6fd')}>
                            <FileText size={11} />
                            <span>सम्झौता</span>
                          </button>
                          <button onClick={() => handleOpenLettersModal(p, 'bank_rec')} style={actionBtnStyle('#0f766e', '#f0fdfa', '#99f6e4')}>
                            <Building size={11} />
                            <span>बैंक खाता</span>
                          </button>
                          <button onClick={() => handleOpenHoardingModal(p)} style={actionBtnStyle('#b45309', '#fffbeb', '#fde68a')}>
                            <QrCode size={11} />
                            <span>सूचना पाटी</span>
                          </button>
                          <button onClick={() => handleOpenTimeExtModal(p)} style={actionBtnStyle('#6d28d9', '#f5f3ff', '#ddd6fe')}>
                            <Clock size={11} />
                            <span>म्याद थप</span>
                          </button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${canCreateEditProject && canDeleteProject ? 6 : canCreateEditProject || canDeleteProject ? 5 : 4}, 1fr)`, gap: '4px' }}>
                          <button onClick={() => handleOpenApprovalModal(p)} style={actionBtnStyle('#4338ca', '#eef2ff', '#c7d2fe')}>
                            <ShieldCheck size={11} />
                            <span>स्वीकृति</span>
                          </button>
                          <button onClick={() => handleOpenSmsModal(p)} style={actionBtnStyle('#0284c7', '#f0f9ff', '#bae6fd')}>
                            <Smartphone size={11} />
                            <span>SMS</span>
                          </button>
                          <button onClick={() => handleOpenSutraModal(p)} style={actionBtnStyle('#0f4c81', '#eff6ff', '#bfdbfe')}>
                            <FileSpreadsheet size={11} />
                            <span>अडिट</span>
                          </button>
                          <button onClick={() => handleOpenDocsModal(p)} style={actionBtnStyle('#0f766e', '#f0fdfa', '#99f6e4')}>
                            <FolderOpen size={11} />
                            <span>कागजात ({toNepaliNum(Array.isArray(p.documents) ? p.documents.length : 0)})</span>
                          </button>
                          {canCreateEditProject && (
                            <button onClick={() => handleOpenEditModal(p)} style={actionBtnStyle('#2563eb', '#eff6ff', '#bfdbfe')}>
                              <Edit2 size={11} />
                            </button>
                          )}
                          {canDeleteProject && (
                            <button onClick={() => setProjectToDelete(p)} style={actionBtnStyle('#dc2626', '#fef2f2', '#fecaca')}>
                              <Trash2 size={11} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: उपभोक्ता समिति व्यवस्थापन (CONSUMER COMMITTEES ROSTER) */}
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

          <div style={{ borderRadius: '10px', border: '1px solid #cbd5e1', boxShadow: '0 2px 6px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
            <div className="dt-responsive-table-wrapper">
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem' }}>
                <thead>
                  <tr style={{ background: 'linear-gradient(135deg, #0f2942 0%, #1e3a8a 100%)', color: '#ffffff' }}>
                    <th style={{ padding: '11px 8px', border: '1px solid #1e3a8a', textAlign: 'center' }}>क्र.स.</th>
                    <th style={{ padding: '11px 10px', border: '1px solid #1e3a8a' }}>आयोजना तथा वडा</th>
                    <th style={{ padding: '11px 10px', border: '1px solid #1e3a8a' }}>उपभोक्ता समितिको नाम</th>
                    <th style={{ padding: '11px 10px', border: '1px solid #1e3a8a' }}>अध्यक्ष</th>
                    <th style={{ padding: '11px 10px', border: '1px solid #1e3a8a' }}>सचिव</th>
                    <th style={{ padding: '11px 10px', border: '1px solid #1e3a8a' }}>कोषाध्यक्ष</th>
                    <th style={{ padding: '11px 10px', border: '1px solid #1e3a8a' }}>बैंक खाता विवरण</th>
                    <th style={{ padding: '11px 10px', border: '1px solid #1e3a8a', textAlign: 'center' }}>कार्य</th>
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
                      <td style={{ padding: '9px 10px', border: '1.5px solid #e2e8f0' }}>
                        {p.committeeName || <span style={{ color: '#94a3b8' }}>दर्ता बाँकी</span>}
                      </td>
                      <td style={{ padding: '9px 10px', border: '1.5px solid #e2e8f0', fontWeight: 600 }}>
                        {p.committeeChair || <span style={{ color: '#94a3b8', fontWeight: 400 }}>तोकिएको छैन</span>}
                      </td>
                      <td style={{ padding: '9px 10px', border: '1.5px solid #e2e8f0' }}>
                        {p.committeeSecretary || <span style={{ color: '#94a3b8' }}>तोकिएको छैन</span>}
                      </td>
                      <td style={{ padding: '9px 10px', border: '1.5px solid #e2e8f0', color: '#0f766e', fontWeight: 600 }}>
                        {p.committeeTreasurer || <span style={{ color: '#94a3b8', fontWeight: 400 }}>तोकिएको छैन</span>}
                      </td>
                      <td style={{ padding: '9px 10px', border: '1.5px solid #e2e8f0', fontSize: '0.75rem' }}>
                        {p.consumerCommittee?.bankName ? (
                          <div>
                            <strong>{p.consumerCommittee.bankName}</strong>
                            <div>खाता नं: {p.consumerCommittee.bankAccountNumber || '-'}</div>
                          </div>
                        ) : (
                          <span style={{ color: '#94a3b8' }}>खाता प्रविष्टि बाँकी</span>
                        )}
                      </td>
                      <td style={{ padding: '9px 10px', border: '1.5px solid #e2e8f0', textAlign: 'center' }}>
                        <button
                          onClick={() => handleOpenCommitteeModal(p)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '6px',
                            backgroundColor: '#0f4c81',
                            color: '#ffffff',
                            border: 'none',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                          }}
                        >
                          समिति हेर्नुहोस् / सम्पादन
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
      {/* TAB 3: नापी किताब (MB) तथा किस्ता भुक्तानी ट्रयाकर */}
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

          <div style={{ borderRadius: '10px', border: '1px solid #cbd5e1', boxShadow: '0 2px 6px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
            <div className="dt-responsive-table-wrapper">
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem' }}>
                <thead>
                  <tr style={{ background: 'linear-gradient(135deg, #0f2942 0%, #1e3a8a 100%)', color: '#ffffff' }}>
                    <th style={{ padding: '11px 8px', border: '1px solid #1e3a8a', textAlign: 'center' }}>क्र.स.</th>
                    <th style={{ padding: '11px 10px', border: '1px solid #1e3a8a' }}>आयोजनाको नाम</th>
                    <th style={{ padding: '11px 10px', border: '1px solid #1e3a8a', textAlign: 'right' }}>कार्यालय लागत</th>
                    <th style={{ padding: '11px 10px', border: '1px solid #1e3a8a', textAlign: 'right' }}>हालसम्म भुक्तानी</th>
                    <th style={{ padding: '11px 10px', border: '1px solid #1e3a8a', textAlign: 'right' }}>बाँकी बजेट</th>
                    <th style={{ padding: '11px 10px', border: '1px solid #1e3a8a', textAlign: 'center' }}>वित्तीय प्रगति</th>
                    <th style={{ padding: '11px 10px', border: '1px solid #1e3a8a', textAlign: 'center' }}>नापी किताब (MB)</th>
                    <th style={{ padding: '11px 10px', border: '1px solid #1e3a8a', textAlign: 'center' }}>कार्य</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((p: any, idx: number) => {
                    const agreed = Number(p.officeCost || p.budget || 0);
                    const paid = Number(p.paidAmount || 0);
                    const remaining = agreed - paid;
                    const pct = agreed > 0 ? ((paid / agreed) * 100).toFixed(1) : '0';
                    const mbCount = p.measurementBooks?.length || 0;

                    return (
                      <tr key={p.id} style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                        <td style={{ padding: '9px 8px', border: '1.5px solid #e2e8f0', textAlign: 'center' }}>{idx + 1}</td>
                        <td style={{ padding: '9px 10px', border: '1.5px solid #e2e8f0', fontWeight: 600 }}>
                          <div>{p.name}</div>
                          <span style={{ fontSize: '0.725rem', color: '#0284c7' }}>वडा नं. {toNepaliNum(p.wardNumber)}</span>
                        </td>
                        <td style={{ padding: '9px 10px', border: '1.5px solid #e2e8f0', textAlign: 'right', fontWeight: 600 }}>
                          रु. {agreed.toLocaleString()}
                        </td>
                        <td style={{ padding: '9px 10px', border: '1.5px solid #e2e8f0', textAlign: 'right', color: '#16a34a', fontWeight: 600 }}>
                          रु. {paid.toLocaleString()}
                        </td>
                        <td style={{ padding: '9px 10px', border: '1.5px solid #e2e8f0', textAlign: 'right', color: remaining < 0 ? '#dc2626' : '#d97706', fontWeight: 600 }}>
                          रु. {remaining.toLocaleString()}
                        </td>
                        <td style={{ padding: '9px 10px', border: '1.5px solid #e2e8f0', textAlign: 'center' }}>
                          <span style={{ padding: '2px 8px', borderRadius: '12px', backgroundColor: '#e0f2fe', color: '#0369a1', fontWeight: 700, fontSize: '0.75rem' }}>
                            {toNepaliNum(pct)}%
                          </span>
                        </td>
                        <td style={{ padding: '9px 10px', border: '1.5px solid #e2e8f0', textAlign: 'center' }}>
                          <span style={{ fontSize: '0.775rem', color: mbCount > 0 ? '#0f766e' : '#94a3b8', fontWeight: 600 }}>
                            {mbCount > 0 ? `${toNepaliNum(mbCount)} प्रविष्टि` : 'बाँकी'}
                          </span>
                        </td>
                        <td style={{ padding: '9px 10px', border: '1.5px solid #e2e8f0', textAlign: 'center' }}>
                          <button
                            onClick={() => handleOpenMBModal(p)}
                            style={{
                              padding: '4px 8px',
                              borderRadius: '6px',
                              backgroundColor: '#0284c7',
                              color: '#ffffff',
                              border: 'none',
                              fontWeight: 600,
                              fontSize: '0.75rem',
                              cursor: 'pointer',
                            }}
                          >
                            MB तथा किस्ता व्यवस्थापन
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
      {/* TAB 4: अनुगमन तथा सामाजिक परीक्षण (MONITORING & SOCIAL AUDIT) */}
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
            {projects.map((p: any) => {
              const lastMon = p.monitoringRecords?.[0] || null;
              const physPct = Number(p.progressPercentage ?? p.physicalProgressPercent ?? 0);

              return (
                <div
                  key={p.id}
                  className="dt-card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                    borderLeft: '4px solid #0f4c81',
                    borderRadius: '10px',
                    padding: '1rem',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f4c81' }}>वडा नं. {toNepaliNum(p.wardNumber)}</span>
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: '12px',
                          backgroundColor: lastMon ? '#dcfce7' : '#fef3c7',
                          color: lastMon ? '#166534' : '#92400e',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                        }}
                      >
                        {lastMon ? `गुणस्तर ग्रेड: ${lastMon.rating || 'A'}` : 'अनुगमन बाँकी'}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem' }}>{p.name}</h3>

                    <div style={{ backgroundColor: '#f8fafc', padding: '0.6rem', borderRadius: '6px', fontSize: '0.775rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <div>
                        <strong>अन्तिम अनुगमन:</strong>{' '}
                        {lastMon ? `${toNepaliNum(lastMon.date)} (${lastMon.monitorName})` : 'दर्ता भएको छैन'}
                      </div>
                      <div><strong>भौतिक प्रगति:</strong> {toNepaliNum(physPct)}%</div>
                      <div>
                        <strong>सामाजिक परीक्षण:</strong>{' '}
                        {p.socialAudit?.date
                          ? `सम्पन्न (${toNepaliNum(p.socialAudit.date)} • ${p.socialAudit.publicSatisfaction || 'सन्तोषजनक'})`
                          : 'सम्पन्न गर्न बाँकी'}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenMonitoringModal(p)}
                    style={{
                      width: '100%',
                      padding: '0.55rem',
                      borderRadius: '7px',
                      backgroundColor: '#0f4c81',
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
      {/* TAB 5: योजना फरफारक तथा सम्पन्नता (PROJECT CLEARANCE & FARFARAK) */}
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

          <div style={{ borderRadius: '10px', border: '1px solid #cbd5e1', boxShadow: '0 2px 6px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
            <div className="dt-responsive-table-wrapper">
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem' }}>
                <thead>
                  <tr style={{ background: 'linear-gradient(135deg, #0f2942 0%, #1e3a8a 100%)', color: '#ffffff' }}>
                    <th style={{ padding: '11px 8px', border: '1px solid #1e3a8a', textAlign: 'center' }}>क्र.स.</th>
                    <th style={{ padding: '11px 10px', border: '1px solid #1e3a8a' }}>आयोजनाको नाम</th>
                    <th style={{ padding: '11px 10px', border: '1px solid #1e3a8a', textAlign: 'right' }}>कुल लागत अनुमान</th>
                    <th style={{ padding: '11px 10px', border: '1px solid #1e3a8a', textAlign: 'right' }}>मर्मत सम्भार कोष (३%)</th>
                    <th style={{ padding: '11px 10px', border: '1px solid #1e3a8a', textAlign: 'center' }}>सम्पन्नता प्रमाणपत्र</th>
                    <th style={{ padding: '11px 10px', border: '1px solid #1e3a8a', textAlign: 'center' }}>फरफारक स्थिति</th>
                    <th style={{ padding: '11px 10px', border: '1px solid #1e3a8a', textAlign: 'center' }}>कार्य</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((p: any, idx: number) => {
                    const cost = Number(p.officeCost || p.budget || 0);
                    const isFarfarak = Boolean(p.farfarakDetails?.isFarfarakDone);
                    const certNo = p.farfarakDetails?.completionCertificateNo || `PPK-CMP-${(p.projectCode || p.id || '').slice(-6)}`;

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
                              padding: '4px 8px',
                              borderRadius: '6px',
                              backgroundColor: '#0f4c81',
                              color: '#ffffff',
                              border: 'none',
                              fontWeight: 600,
                              fontSize: '0.75rem',
                              cursor: 'pointer',
                            }}
                          >
                            फरफारक फारम
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
      {/* TAB 6: बजेट रकमान्तर (BUDGET VIREMENT) */}
      {/* ========================================================================= */}
      {activeTab === 'budget_virement' && (
        <div className="dt-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.75rem' }}>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                बजेट रकमान्तर तथा भेरियसन व्यवस्थापन
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#475569', margin: '3px 0 0' }}>
                कार्यपालिकाको निर्णय अनुसार बजेट रकमान्तर (Virement) तथा योजना संशोधन अभिलेख
              </p>
            </div>
            {canTransferBudget && (
              <button
                onClick={() => setIsVirementModalOpen(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.5rem 0.9rem',
                  borderRadius: '6px',
                  backgroundColor: '#0f4c81',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.825rem',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <ArrowRightLeft size={15} />
                <span>+ नयाँ रकमान्तर सिफारिस</span>
              </button>
            )}
          </div>

          <div style={{ borderRadius: '10px', border: '1px solid #cbd5e1', boxShadow: '0 2px 6px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
            <div className="dt-responsive-table-wrapper">
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem' }}>
                <thead>
                  <tr style={{ background: 'linear-gradient(135deg, #0f2942 0%, #1e3a8a 100%)', color: '#ffffff' }}>
                    <th style={{ padding: '11px 8px', border: '1px solid #1e3a8a', textAlign: 'center' }}>क्र.स.</th>
                    <th style={{ padding: '11px 10px', border: '1px solid #1e3a8a' }}>आयोजनाको नाम</th>
                    <th style={{ padding: '11px 10px', border: '1px solid #1e3a8a' }}>बजेट स्रोत</th>
                    <th style={{ padding: '11px 10px', border: '1px solid #1e3a8a', textAlign: 'right' }}>हालको कुल बजेट</th>
                    <th style={{ padding: '11px 10px', border: '1px solid #1e3a8a' }}>रकमान्तर स्थिति / विवरण</th>
                    <th style={{ padding: '11px 10px', border: '1px solid #1e3a8a', textAlign: 'center' }}>कार्य</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((p: any, idx: number) => (
                    <tr key={p.id} style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                      <td style={{ padding: '9px 8px', border: '1.5px solid #e2e8f0', textAlign: 'center' }}>{idx + 1}</td>
                      <td style={{ padding: '9px 10px', border: '1.5px solid #e2e8f0', fontWeight: 600 }}>{p.name}</td>
                      <td style={{ padding: '9px 10px', border: '1.5px solid #e2e8f0' }}>{p.budgetSource || 'गाउँपालिका आन्तरिक स्रोत'}</td>
                      <td style={{ padding: '9px 10px', border: '1.5px solid #e2e8f0', textAlign: 'right', fontWeight: 600 }}>
                        रु. {Number(p.officeCost || p.budget || 0).toLocaleString()}
                      </td>
                      <td style={{ padding: '9px 10px', border: '1.5px solid #e2e8f0' }}>
                        {p.virementRecords?.length ? (
                          <span style={{ fontSize: '0.75rem', color: '#0f766e', fontWeight: 600 }}>
                            {toNepaliNum(p.virementRecords.length)} पटक रकमान्तर भएको
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>रकमान्तर भएको छैन</span>
                        )}
                      </td>
                      <td style={{ padding: '9px 10px', border: '1.5px solid #e2e8f0', textAlign: 'center' }}>
                        <button
                          onClick={() => {
                            setSelectedProject(p);
                            setIsVirementModalOpen(true);
                          }}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '6px',
                            backgroundColor: '#0f4c81',
                            color: '#ffffff',
                            border: 'none',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                          }}
                        >
                          रकमान्तर गर्नुहोस्
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
      {/* TAB 7: बजेट उप-शीर्षक रकम */}
      {/* ========================================================================= */}
      {activeTab === 'budget_subheads' && <BudgetSubHeadsTab />}

      {/* ========================================================================= */}
      {/* TAB 8: बजेट स्रोत सूची */}
      {/* ========================================================================= */}
      {activeTab === 'budget_sources' && <BudgetSourcesTab />}

      {/* ========================================================================= */}
      {/* ALL MODALS */}
      {/* ========================================================================= */}
      <ProjectAgreementModal
        isOpen={isAgreementModalOpen}
        onClose={() => {
          setIsAgreementModalOpen(false);
          setSelectedProject(null);
        }}
        onSave={(data) => saveProjectMutation.mutateAsync(data)}
        project={selectedProject}
      />

      <ProjectAgreementPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => {
          setIsPrintModalOpen(false);
          setSelectedProject(null);
        }}
        project={selectedProject}
      />

      <OfficialLettersGeneratorModal
        isOpen={isLettersModalOpen}
        onClose={() => {
          setIsLettersModalOpen(false);
          setSelectedProject(null);
        }}
        project={selectedProject}
        initialLetterType={initialLetterType}
      />

      <ConsumerCommitteeModal
        isOpen={isCommitteeModalOpen}
        onClose={() => {
          setIsCommitteeModalOpen(false);
          setSelectedProject(null);
        }}
        project={selectedProject}
        onSave={(committee) => saveCommitteeMutation.mutateAsync(committee)}
      />

      <MeasurementBookInstallmentModal
        isOpen={isMBModalOpen}
        onClose={() => {
          setIsMBModalOpen(false);
          setSelectedProject(null);
        }}
        project={selectedProject}
        onAddInstallment={(inst) => addInstallmentMutation.mutateAsync(inst)}
        onSaveMB={(mb) => updateMeasurementBookMutation.mutateAsync(mb)}
      />

      <MonitoringSocialAuditModal
        isOpen={isMonitoringModalOpen}
        onClose={() => {
          setIsMonitoringModalOpen(false);
          setSelectedProject(null);
        }}
        project={selectedProject}
        onAddMonitoring={(rec) => addMonitoringMutation.mutateAsync(rec)}
        onSaveSocialAudit={(audit) => saveSocialAuditMutation.mutateAsync(audit)}
      />

      <ProjectFarfarakModal
        isOpen={isFarfarakModalOpen}
        onClose={() => {
          setIsFarfarakModalOpen(false);
          setSelectedProject(null);
        }}
        project={selectedProject}
        onSaveFarfarak={(details) => saveFarfarakMutation.mutateAsync(details)}
      />

      <ProjectDocumentsModal
        isOpen={isDocsModalOpen}
        onClose={() => {
          setIsDocsModalOpen(false);
          setSelectedProject(null);
        }}
        project={selectedProject}
        onSaveDocuments={(docs) => updateDocumentsMutation.mutateAsync(docs)}
      />

      <ProjectApprovalModal
        isOpen={isApprovalModalOpen}
        onClose={() => {
          setIsApprovalModalOpen(false);
          setSelectedProject(null);
        }}
        project={selectedProject}
        onAdvanceStage={(stage, record) => updateApprovalMutation.mutateAsync({ stage, record })}
      />

      <ProjectHoardingBoardModal
        isOpen={isHoardingModalOpen}
        onClose={() => {
          setIsHoardingModalOpen(false);
          setSelectedProject(null);
        }}
        project={selectedProject}
      />

      <ProjectTimeExtensionModal
        isOpen={isTimeExtModalOpen}
        onClose={() => {
          setIsTimeExtModalOpen(false);
          setSelectedProject(null);
        }}
        project={selectedProject}
        onSaveExtensions={(records) => updateTimeExtensionMutation.mutateAsync(records)}
      />

      <ProjectSutraAuditExportModal
        isOpen={isSutraModalOpen}
        onClose={() => {
          setIsSutraModalOpen(false);
          setSelectedProject(null);
        }}
        projects={projects}
        selectedProject={selectedProject}
      />

      <ProjectSmsNotificationModal
        isOpen={isSmsModalOpen}
        onClose={() => {
          setIsSmsModalOpen(false);
          setSelectedProject(null);
        }}
        project={selectedProject}
      />

      <ProjectExcelImportModal
        isOpen={isExcelImportModalOpen}
        onClose={() => setIsExcelImportModalOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['projects-list'] });
          showToast('Excel डाटा सफलतापूर्वक इम्पोर्ट भयो!');
        }}
      />

      <BudgetVirementModal
        isOpen={isVirementModalOpen}
        onClose={() => {
          setIsVirementModalOpen(false);
          setSelectedProject(null);
        }}
        projects={projects}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['projects-list'] });
          showToast('बजेट रकमान्तर सफलतापूर्वक सुरक्षित गरियो!');
        }}
      />

      {/* Delete Confirmation Modal */}
      {projectToDelete && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              padding: '1.5rem',
              borderRadius: '8px',
              maxWidth: '400px',
              width: '90%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
          >
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a' }}>आयोजना हटाउने पुष्टि</h3>
            <p style={{ margin: '0 0 1.25rem 0', color: '#64748b', fontSize: '0.875rem' }}>
              के तपाईं पक्का <strong>"{projectToDelete.name}"</strong> आयोजना हटाउन चाहनुहुन्छ? यो कार्य फिर्ता गर्न सकिँदैन।
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button
                onClick={() => setProjectToDelete(null)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#475569',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                }}
              >
                रद्द गर्नुहोस्
              </button>
              <button
                onClick={() => deleteProjectMutation.mutate(projectToDelete.id)}
                disabled={deleteProjectMutation.isPending}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                }}
              >
                {deleteProjectMutation.isPending ? 'हटाउँदै...' : 'हटाउनुहोस्'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default ProjectsPage;
