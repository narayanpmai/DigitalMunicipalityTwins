import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client';
import { NepaliDatePicker } from '../../components/common/NepaliDatePicker';
import * as XLSX from 'xlsx';
import {
  HardHat,
  Search,
  Plus,
  Printer,
  X,
  CheckCircle,
  AlertCircle,
  Users,
  Calendar,
  Building,
  CreditCard,
  QrCode,
  Wrench,
  Hammer,
  Send,
  Clock,
  Briefcase,
  FileSpreadsheet,
  Download,
  Filter,
  Check,
  RefreshCw,
  FolderGit2,
  TrendingUp,
  ChevronRight,
  Eye,
  Trash2,
  DollarSign,
  Phone,
  MapPin,
  Award,
  Layers,
  ArrowRight
} from 'lucide-react';

interface Worker {
  id: string;
  workerId: string;
  worker_id?: string;
  fullName: string;
  full_name?: string;
  citizenshipNo: string;
  citizenship_no?: string;
  gender?: string;
  phone?: string;
  contactPhone?: string;
  contact_phone?: string;
  wardNumber: number;
  ward_number?: number;
  tole?: string;
  toleVillage?: string;
  tole_village?: string;
  skillCategory: string;
  skill_category?: string;
  skillLevel?: string;
  skill_level?: string;
  dailyWageRate: number;
  daily_wage_rate?: number;
  guaranteedDaysAllocated: number;
  guaranteed_days_allocated?: number;
  totalDaysWorked?: number;
  total_days_worked?: number;
  allocatedProject?: string;
  allocated_project?: string;
  totalWagePaid?: number;
  total_wage_paid?: number;
  bankName?: string;
  bank_name?: string;
  bankAccountNo?: string;
  bank_account_no?: string;
  status: string;
  pmepFiscalYear?: string;
  registeredDateBs?: string;
  notes?: string;
}

interface Project {
  id: string;
  project_code: string;
  title: string;
  ward_number: number;
  tole_village?: string;
  allocated_budget: number;
  target_person_days: number;
  completed_person_days: number;
  daily_wage_rate: number;
  workers_count: number;
  supervisor_name?: string;
  supervisor_phone?: string;
  status: string;
  fiscal_year?: string;
  start_date_bs?: string;
  end_date_bs?: string;
}

interface WorkLog {
  id: string;
  worker_id: string;
  worker_name: string;
  project_title: string;
  ward_number: number;
  work_date_bs: string;
  days_worked: number;
  daily_wage_rate: number;
  wage_amount: number;
  payout_status: string;
  voucher_no?: string;
  remarks?: string;
  created_at?: string;
}

interface LabourDemand {
  id: string;
  employer_name: string;
  contact_person?: string;
  contact_phone?: string;
  ward_number: number;
  skill_required: string;
  required_count: number;
  daily_wage_offered: number;
  work_duration_days: number;
  status: string;
  created_at?: string;
}

interface EmploymentSummary {
  totalRegistered: number;
  totalDeployed: number;
  guaranteed100DaysCompleted: number;
  totalPersonDaysGenerated: number;
  totalWageDisbursedNPR: number;
  totalProjects?: number;
  activeProjects?: number;
  completedProjects?: number;
  totalProjectBudget?: number;
  totalDemands?: number;
  skillBreakdown?: { skill: string; count: string }[];
  wardBreakdown?: { ward: number; count: string }[];
}

const SKILL_CATEGORIES = [
  'डकर्मी (Mason)',
  'सिकर्मी (Carpenter)',
  'प्लम्बर (Plumber)',
  'विद्युतकर्म (Electrician)',
  'सवारी चालक (Driver)',
  'भारी यन्त्र अपरेटर (Heavy Equipment)',
  'कृषि तथा पशुपालन (Agri-Labor)',
  'सामान्य निर्माण श्रमिक (General Construction)',
  'ग्याभियन तथा सडक मर्मत (Road Maintenance)',
];

export const EmploymentPage: React.FC = () => {
  const queryClient = useQueryClient();

  // Active Tab: workers | projects | attendance | payroll | demands
  const [activeTab, setActiveTab] = useState<'workers' | 'projects' | 'attendance' | 'payroll' | 'demands'>('workers');

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('all');
  const [selectedWard, setSelectedWard] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Modals
  const [showAddWorkerModal, setShowAddWorkerModal] = useState(false);
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [showAddDemandModal, setShowAddDemandModal] = useState(false);
  const [showLogWorkModal, setShowLogWorkModal] = useState(false);
  const [allocateModalData, setAllocateModalData] = useState<Worker | null>(null);
  const [cardModalData, setCardModalData] = useState<Worker | null>(null);
  const [selectedWorkerForLog, setSelectedWorkerForLog] = useState<Worker | null>(null);

  // Forms
  const [workerForm, setWorkerForm] = useState({
    fullName: '',
    citizenshipNo: '',
    gender: 'पुरुष',
    phone: '',
    wardNumber: 1,
    tole: '',
    skillCategory: 'सामान्य निर्माण श्रमिक (General Construction)',
    skillLevel: 'सामान्य (Unskilled)',
    dailyWageRate: 850,
    guaranteedDaysAllocated: 100,
    bankName: 'नेपाल बैंक लि., भोताङ शाखा',
    bankAccountNo: '',
    pmepFiscalYear: '२०८१/०८२',
    notes: '',
  });

  const [projectForm, setProjectForm] = useState({
    title: '',
    ward_number: 1,
    tole_village: '',
    allocated_budget: 800000,
    target_person_days: 600,
    daily_wage_rate: 850,
    supervisor_name: '',
    supervisor_phone: '',
    status: 'सञ्चालनमा (In Progress)',
    fiscal_year: '२०८१/०८२',
    start_date_bs: '२०८१-०२-०१',
    end_date_bs: '२०८१-०५-३०',
  });

  const [demandForm, setDemandForm] = useState({
    employer_name: '',
    contact_person: '',
    contact_phone: '',
    ward_number: 1,
    skill_required: 'सामान्य निर्माण श्रमिक (General Construction)',
    required_count: 5,
    daily_wage_offered: 1000,
    work_duration_days: 30,
    status: 'माग दर्ता (Registered)',
  });

  const [logWorkForm, setLogWorkForm] = useState({
    days: 15,
    work_date_bs: '२०८१-०३-१५',
    remarks: 'कार्यस्थल हाजिरी अनुसार',
  });

  const [allocationForm, setAllocationForm] = useState({
    projectTitle: '',
    days: 30,
    dailyWageRate: 850,
  });

  // 1. Fetch Workers
  const { data: workers = [], isLoading: isWorkersLoading } = useQuery<Worker[]>({
    queryKey: ['employment-workers'],
    queryFn: async () => {
      const res: any = await api.get('/employment');
      return res.data || res || [];
    },
  });

  // 2. Fetch Summary
  const { data: summary } = useQuery<EmploymentSummary>({
    queryKey: ['employment-summary'],
    queryFn: async () => {
      const res: any = await api.get('/employment/summary');
      return res.data || res || {};
    },
  });

  // 3. Fetch Projects
  const { data: projects = [], isLoading: isProjectsLoading } = useQuery<Project[]>({
    queryKey: ['employment-projects'],
    queryFn: async () => {
      const res: any = await api.get('/employment/projects');
      return res.data || res || [];
    },
  });

  // 4. Fetch Work Logs
  const { data: workLogs = [], isLoading: isLogsLoading } = useQuery<WorkLog[]>({
    queryKey: ['employment-work-logs'],
    queryFn: async () => {
      const res: any = await api.get('/employment/work-logs');
      return res.data || res || [];
    },
  });

  // 5. Fetch Labour Demands
  const { data: demands = [], isLoading: isDemandsLoading } = useQuery<LabourDemand[]>({
    queryKey: ['employment-demands'],
    queryFn: async () => {
      const res: any = await api.get('/employment/demands');
      return res.data || res || [];
    },
  });

  // ── MUTATIONS ───────────────────────────────────────────────

  // Add Worker
  const createWorkerMutation = useMutation({
    mutationFn: async (data: any) => api.post('/employment', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employment-workers'] });
      queryClient.invalidateQueries({ queryKey: ['employment-summary'] });
      setShowAddWorkerModal(false);
      setWorkerForm({
        fullName: '',
        citizenshipNo: '',
        gender: 'पुरुष',
        phone: '',
        wardNumber: 1,
        tole: '',
        skillCategory: 'सामान्य निर्माण श्रमिक (General Construction)',
        skillLevel: 'सामान्य (Unskilled)',
        dailyWageRate: 850,
        guaranteedDaysAllocated: 100,
        bankName: 'नेपाल बैंक लि., भोताङ शाखा',
        bankAccountNo: '',
        pmepFiscalYear: '२०८१/०८२',
        notes: '',
      });
    },
  });

  // Allocate Worker
  const allocateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return api.put(`/employment/${id}/allocate`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employment-workers'] });
      queryClient.invalidateQueries({ queryKey: ['employment-projects'] });
      queryClient.invalidateQueries({ queryKey: ['employment-summary'] });
      setAllocateModalData(null);
    },
  });

  // Log Work Days
  const logWorkMutation = useMutation({
    mutationFn: async ({ id, days, work_date_bs, remarks }: { id: string; days: number; work_date_bs: string; remarks: string }) => {
      return api.put(`/employment/${id}/log-work?days=${days}&work_date_bs=${work_date_bs}&remarks=${encodeURIComponent(remarks)}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employment-workers'] });
      queryClient.invalidateQueries({ queryKey: ['employment-work-logs'] });
      queryClient.invalidateQueries({ queryKey: ['employment-projects'] });
      queryClient.invalidateQueries({ queryKey: ['employment-summary'] });
      setShowLogWorkModal(false);
      setSelectedWorkerForLog(null);
    },
  });

  // Disburse Work Log Payout
  const disburseMutation = useMutation({
    mutationFn: async (logId: string) => {
      return api.put(`/employment/work-logs/${logId}/disburse`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employment-work-logs'] });
      queryClient.invalidateQueries({ queryKey: ['employment-summary'] });
    },
  });

  // Add Project
  const createProjectMutation = useMutation({
    mutationFn: async (data: any) => api.post('/employment/projects', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employment-projects'] });
      queryClient.invalidateQueries({ queryKey: ['employment-summary'] });
      setShowAddProjectModal(false);
    },
  });

  // Add Labour Demand
  const createDemandMutation = useMutation({
    mutationFn: async (data: any) => api.post('/employment/demands', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employment-demands'] });
      queryClient.invalidateQueries({ queryKey: ['employment-summary'] });
      setShowAddDemandModal(false);
    },
  });

  // Delete Worker
  const deleteWorkerMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/employment/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employment-workers'] });
      queryClient.invalidateQueries({ queryKey: ['employment-summary'] });
    },
  });

  // Client-Side Excel Export
  const handleExportClientExcel = () => {
    const wsData = workers.map((w, idx) => ({
      'क्र.सं.': idx + 1,
      'श्रमिक संकेत नं': w.workerId || w.worker_id,
      'श्रमिकको नाम': w.fullName || w.full_name,
      'नागरिकता नं': w.citizenshipNo || w.citizenship_no || '-',
      'लिङ्ग': w.gender || 'पुरुष',
      'वडा नं': w.wardNumber || w.ward_number,
      'टोल / गाउँ': w.tole || w.toleVillage || w.tole_village || '-',
      'सम्पर्क फोन': w.phone || w.contactPhone || w.contact_phone || '-',
      'सीप वर्ग': w.skillCategory || w.skill_category,
      'दैनिक ज्याला दर (रु.)': w.dailyWageRate || w.daily_wage_rate || 850,
      'काम गरेको दिन': w.totalDaysWorked || w.total_days_worked || 0,
      'कुल भुक्तानी भएको ज्याला (रु.)': w.totalWagePaid || w.total_wage_paid || 0,
      'खटाइएको आयोजना': w.allocatedProject || w.allocated_project || 'खटाउन बाँकी',
      'बैंकको नाम': w.bankName || w.bank_name || '-',
      'बैंक खाता नं': w.bankAccountNo || w.bank_account_no || '-',
      'अवस्था': w.status || 'सूचीकृत'
    }));

    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'श्रम_बैंक_श्रमिक_लगत');
    XLSX.writeFile(wb, `Paanchpokhari_Labour_Bank_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // Filtered Workers
  const filteredWorkers = workers.filter((w) => {
    const name = (w.fullName || w.full_name || '').toLowerCase();
    const idStr = (w.workerId || w.worker_id || '').toLowerCase();
    const cit = (w.citizenshipNo || w.citizenship_no || '').toLowerCase();
    const phone = (w.phone || w.contactPhone || w.contact_phone || '').toLowerCase();
    const term = searchTerm.toLowerCase();

    const matchSearch = name.includes(term) || idStr.includes(term) || cit.includes(term) || phone.includes(term);
    const skill = w.skillCategory || w.skill_category || '';
    const matchSkill = selectedSkill === 'all' || skill === selectedSkill;
    const ward = w.wardNumber || w.ward_number || 1;
    const matchWard = selectedWard === 'all' || ward === Number(selectedWard);
    const st = w.status || '';
    const matchStatus = selectedStatus === 'all' || st.includes(selectedStatus);

    return matchSearch && matchSkill && matchWard && matchStatus;
  });

  return (
    <div style={{ padding: '1.5rem', minHeight: '100vh', background: '#f8fafc', color: '#0f172a' }}>
      
      {/* ── HEADER BANNER ────────────────────────────────────────── */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.25rem',
        marginBottom: '1.5rem',
        padding: '1.5rem 1.75rem',
        background: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #059669 100%)',
        color: '#fff',
        borderRadius: '16px',
        boxShadow: '0 10px 25px -5px rgba(6, 78, 59, 0.35)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
            <span style={{
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(8px)',
              padding: '0.2rem 0.65rem',
              borderRadius: '20px',
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.5px'
            }}>
              नेपाल सरकार | श्रम, रोजगार तथा सामाजिक सुरक्षा मन्त्रालय (MoLESS)
            </span>
            <span style={{
              background: 'rgba(245, 158, 11, 0.35)',
              color: '#fef3c7',
              padding: '0.2rem 0.65rem',
              borderRadius: '20px',
              fontSize: '0.72rem',
              fontWeight: 700
            }}>
              पाँचपोखरी थाङपाल गाउँपालिका
            </span>
          </div>

          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 0.35rem 0', lineHeight: 1.25 }}>
            रोजगार सेवा केन्द्र तथा स्थानीय श्रम बैंक (ESC & Labour Bank)
          </h1>
          <p style={{ margin: 0, opacity: 0.95, fontSize: '0.875rem', maxWidth: '820px', lineHeight: 1.5 }}>
            रोजगारीको हकसम्बन्धी ऐन, २०७५ बमोजिम १०० दिने न्यूनतम रोजगारी प्रत्याभूति, सीपयुक्त स्थानीय श्रम बैंक, 
            विकास आयोजना परिचालन, हाजिरी तथा बैंक खाता प्रत्यक्ष ज्याला भुक्तानी व्यवस्थापन प्रणाली।
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
          <button
            onClick={() => window.print()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.65rem 1.15rem',
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '10px',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem',
              backdropFilter: 'blur(6px)',
              transition: 'all 0.2s'
            }}
          >
            <Printer size={16} /> भरपाई / लगत प्रिन्ट
          </button>

          <button
            onClick={handleExportClientExcel}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.65rem 1.15rem',
              background: '#10b981',
              border: '1px solid #059669',
              borderRadius: '10px',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem',
              boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.3)',
              transition: 'all 0.2s'
            }}
          >
            <FileSpreadsheet size={16} /> श्रम बैंक Excel (.xlsx)
          </button>

          <button
            onClick={() => setShowAddWorkerModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.65rem 1.25rem',
              background: '#f59e0b',
              border: 'none',
              borderRadius: '10px',
              color: '#0f172a',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.85rem',
              boxShadow: '0 4px 10px rgba(245, 158, 11, 0.4)',
              transition: 'all 0.2s'
            }}
          >
            <Plus size={16} /> नयाँ श्रमिक सूचीकरण
          </button>
        </div>
      </div>

      {/* ── KPI CARDS ────────────────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        {/* KPI 1 */}
        <div style={{
          background: '#fff',
          padding: '1.25rem',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>कुल सूचीकृत जनशक्ति</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#065f46', marginTop: '0.2rem' }}>
              {summary?.totalRegistered || workers.length || 0} <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>जना</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 600, marginTop: '0.15rem' }}>
              श्रम बैंकमा आवद्ध सीपयुक्त नागरिक
            </div>
          </div>
          <div style={{ background: '#ecfdf5', color: '#047857', padding: '0.85rem', borderRadius: '12px' }}>
            <Users size={26} />
          </div>
        </div>

        {/* KPI 2 */}
        <div style={{
          background: '#fff',
          padding: '1.25rem',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>आयोजनामा परिचालित श्रमिक</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1e40af', marginTop: '0.2rem' }}>
              {summary?.totalDeployed || 0} <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>जना</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#2563eb', fontWeight: 600, marginTop: '0.15rem' }}>
              पूर्वाधार निर्माणमा खटिएका
            </div>
          </div>
          <div style={{ background: '#eff6ff', color: '#1e40af', padding: '0.85rem', borderRadius: '12px' }}>
            <HardHat size={26} />
          </div>
        </div>

        {/* KPI 3 */}
        <div style={{
          background: '#fff',
          padding: '1.25rem',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>१०० दिन रोजगारी सम्पन्न</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#16a34a', marginTop: '0.2rem' }}>
              {summary?.guaranteed100DaysCompleted || 0} <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>जना</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 600, marginTop: '0.15rem' }}>
              पूर्ण रोजगारी ग्यारेन्टी प्राप्त
            </div>
          </div>
          <div style={{ background: '#f0fdf4', color: '#16a34a', padding: '0.85rem', borderRadius: '12px' }}>
            <CheckCircle size={26} />
          </div>
        </div>

        {/* KPI 4 */}
        <div style={{
          background: '#fff',
          padding: '1.25rem',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>सिर्जना भएको श्रम-दिन</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#d97706', marginTop: '0.2rem' }}>
              {summary?.totalPersonDaysGenerated || 0} <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>दिन</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#b45309', fontWeight: 600, marginTop: '0.15rem' }}>
              ८ वटै वडामा मानव-दिन
            </div>
          </div>
          <div style={{ background: '#fffbeb', color: '#d97706', padding: '0.85rem', borderRadius: '12px' }}>
            <Clock size={26} />
          </div>
        </div>

        {/* KPI 5 */}
        <div style={{
          background: '#fff',
          padding: '1.25rem',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>कुल ज्याला भुक्तानी रकम</div>
            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f766e', marginTop: '0.2rem' }}>
              रु. {(summary?.totalWageDisbursedNPR || 0).toLocaleString('ne-NP')}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#0f766e', fontWeight: 600, marginTop: '0.15rem' }}>
              प्रत्यक्ष बैंक खाता निकासा
            </div>
          </div>
          <div style={{ background: '#f0fdfa', color: '#0f766e', padding: '0.85rem', borderRadius: '12px' }}>
            <CreditCard size={26} />
          </div>
        </div>
      </div>

      {/* ── 5 PREMIUM SEGMENTED CARD TABS ───────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '0.75rem',
        marginBottom: '1.5rem',
        background: '#f1f5f9',
        padding: '0.5rem',
        borderRadius: '16px',
        border: '1.5px solid #e2e8f0'
      }}>
        {/* Tab 1: Labour Bank Workers */}
        <button
          onClick={() => setActiveTab('workers')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            padding: '0.75rem 1rem',
            borderRadius: '12px',
            border: activeTab === 'workers' ? '2px solid #059669' : '2px solid transparent',
            cursor: 'pointer',
            background: activeTab === 'workers' ? '#ffffff' : 'transparent',
            boxShadow: activeTab === 'workers' ? '0 6px 16px rgba(5, 150, 105, 0.2)' : 'none',
            transition: 'all 0.25s ease',
            textAlign: 'left'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: activeTab === 'workers' ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)' : '#e2e8f0',
              color: activeTab === 'workers' ? '#fff' : '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Users size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: activeTab === 'workers' ? '#065f46' : '#334155' }}>
                स्थानीय श्रम बैंक
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>श्रमिक लगत तथा सीप</div>
            </div>
          </div>
          <span style={{
            background: activeTab === 'workers' ? '#059669' : '#e2e8f0',
            color: activeTab === 'workers' ? '#fff' : '#475569',
            padding: '0.2rem 0.55rem',
            borderRadius: '14px',
            fontSize: '0.72rem',
            fontWeight: 700
          }}>
            {workers.length} जना
          </span>
        </button>

        {/* Tab 2: PMEP Projects */}
        <button
          onClick={() => setActiveTab('projects')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            padding: '0.75rem 1rem',
            borderRadius: '12px',
            border: activeTab === 'projects' ? '2px solid #2563eb' : '2px solid transparent',
            cursor: 'pointer',
            background: activeTab === 'projects' ? '#ffffff' : 'transparent',
            boxShadow: activeTab === 'projects' ? '0 6px 16px rgba(37, 99, 235, 0.2)' : 'none',
            transition: 'all 0.25s ease',
            textAlign: 'left'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: activeTab === 'projects' ? 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)' : '#e2e8f0',
              color: activeTab === 'projects' ? '#fff' : '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FolderGit2 size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: activeTab === 'projects' ? '#1e40af' : '#334155' }}>
                रोजगारी आयोजनाहरू
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>PMEP पूर्वाधार योजना</div>
            </div>
          </div>
          <span style={{
            background: activeTab === 'projects' ? '#2563eb' : '#e2e8f0',
            color: activeTab === 'projects' ? '#fff' : '#475569',
            padding: '0.2rem 0.55rem',
            borderRadius: '14px',
            fontSize: '0.72rem',
            fontWeight: 700
          }}>
            {projects.length} आयोजना
          </span>
        </button>

        {/* Tab 3: Work Log & Attendance */}
        <button
          onClick={() => setActiveTab('attendance')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            padding: '0.75rem 1rem',
            borderRadius: '12px',
            border: activeTab === 'attendance' ? '2px solid #d97706' : '2px solid transparent',
            cursor: 'pointer',
            background: activeTab === 'attendance' ? '#ffffff' : 'transparent',
            boxShadow: activeTab === 'attendance' ? '0 6px 16px rgba(217, 119, 6, 0.2)' : 'none',
            transition: 'all 0.25s ease',
            textAlign: 'left'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: activeTab === 'attendance' ? 'linear-gradient(135deg, #b45309 0%, #f59e0b 100%)' : '#e2e8f0',
              color: activeTab === 'attendance' ? '#fff' : '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Clock size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: activeTab === 'attendance' ? '#b45309' : '#334155' }}>
                कार्य दिन तथा हाजिरी लग
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>१०० दिने रोजगारी ट्र्याकिङ</div>
            </div>
          </div>
          <span style={{
            background: activeTab === 'attendance' ? '#d97706' : '#e2e8f0',
            color: activeTab === 'attendance' ? '#fff' : '#475569',
            padding: '0.2rem 0.55rem',
            borderRadius: '14px',
            fontSize: '0.72rem',
            fontWeight: 700
          }}>
            {workLogs.length} लग
          </span>
        </button>

        {/* Tab 4: Payroll & Disbursement */}
        <button
          onClick={() => setActiveTab('payroll')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            padding: '0.75rem 1rem',
            borderRadius: '12px',
            border: activeTab === 'payroll' ? '2px solid #0f766e' : '2px solid transparent',
            cursor: 'pointer',
            background: activeTab === 'payroll' ? '#ffffff' : 'transparent',
            boxShadow: activeTab === 'payroll' ? '0 6px 16px rgba(15, 118, 110, 0.2)' : 'none',
            transition: 'all 0.25s ease',
            textAlign: 'left'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: activeTab === 'payroll' ? 'linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)' : '#e2e8f0',
              color: activeTab === 'payroll' ? '#fff' : '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CreditCard size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: activeTab === 'payroll' ? '#0f766e' : '#334155' }}>
                ज्याला भुक्तानी भरपाई
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>बैंक खाता निकासा ट्र्याकिङ</div>
            </div>
          </div>
          <span style={{
            background: activeTab === 'payroll' ? '#0f766e' : '#e2e8f0',
            color: activeTab === 'payroll' ? '#fff' : '#475569',
            padding: '0.2rem 0.55rem',
            borderRadius: '14px',
            fontSize: '0.72rem',
            fontWeight: 700
          }}>
            रु. {Math.round((summary?.totalWageDisbursedNPR || 0) / 1000)}K
          </span>
        </button>

        {/* Tab 5: Demands & Job Matching */}
        <button
          onClick={() => setActiveTab('demands')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            padding: '0.75rem 1rem',
            borderRadius: '12px',
            border: activeTab === 'demands' ? '2px solid #7c3aed' : '2px solid transparent',
            cursor: 'pointer',
            background: activeTab === 'demands' ? '#ffffff' : 'transparent',
            boxShadow: activeTab === 'demands' ? '0 6px 16px rgba(124, 58, 237, 0.2)' : 'none',
            transition: 'all 0.25s ease',
            textAlign: 'left'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: activeTab === 'demands' ? 'linear-gradient(135deg, #6d28d9 0%, #8b5cf6 100%)' : '#e2e8f0',
              color: activeTab === 'demands' ? '#fff' : '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Briefcase size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: activeTab === 'demands' ? '#6d28d9' : '#334155' }}>
                श्रम माग र मिलान
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>निजी/समुदाय रोजगार माग</div>
            </div>
          </div>
          <span style={{
            background: activeTab === 'demands' ? '#7c3aed' : '#e2e8f0',
            color: activeTab === 'demands' ? '#fff' : '#475569',
            padding: '0.2rem 0.55rem',
            borderRadius: '14px',
            fontSize: '0.72rem',
            fontWeight: 700
          }}>
            {demands.length} माग
          </span>
        </button>
      </div>

      {/* ── TAB 1: WORKERS (स्थानीय श्रम बैंक तथा श्रमिक लगत) ─────── */}
      {activeTab === 'workers' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Controls Bar */}
          <div style={{
            background: '#fff',
            padding: '1rem 1.25rem',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', flex: 1, minWidth: '280px', position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="श्रमिक संकेत, नाम, नागरिकता वा फोन खोज्नुहोस्..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 1rem 0.6rem 2.4rem',
                  borderRadius: '8px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.875rem',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
              <select
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
                style={{
                  padding: '0.6rem 0.85rem',
                  borderRadius: '8px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.85rem',
                  background: '#fff',
                  outline: 'none'
                }}
              >
                <option value="all">सबै सीप वर्ग (All Skills)</option>
                {SKILL_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <select
                value={selectedWard}
                onChange={(e) => setSelectedWard(e.target.value)}
                style={{
                  padding: '0.6rem 0.85rem',
                  borderRadius: '8px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.85rem',
                  background: '#fff',
                  outline: 'none'
                }}
              >
                <option value="all">सबै वडा (All Wards)</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
                  <option key={w} value={w}>वडा नं. {w}</option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                style={{
                  padding: '0.6rem 0.85rem',
                  borderRadius: '8px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.85rem',
                  background: '#fff',
                  outline: 'none'
                }}
              >
                <option value="all">सबै अवस्था (Status)</option>
                <option value="सूचीकृत">सूचीकृत (Registered)</option>
                <option value="परिचालित">परिचालित (Deployed)</option>
                <option value="१०० दिन">१०० दिन सम्पन्न (Completed)</option>
              </select>
            </div>
          </div>

          {/* Workers Table */}
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            boxShadow: '0 2px 5px rgba(0,0,0,0.03)'
          }}>
            <div className="dt-responsive-table-wrapper">
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                  <tr>
                    <th style={{ padding: '0.85rem 1rem' }}>संकेत नं</th>
                    <th style={{ padding: '0.85rem 1rem' }}>श्रमिकको नाम / सम्पर्क</th>
                    <th style={{ padding: '0.85rem 1rem' }}>सीप वर्ग र तह</th>
                    <th style={{ padding: '0.85rem 1rem' }}>वडा / टोल</th>
                    <th style={{ padding: '0.85rem 1rem' }}>दैनिक ज्याला</th>
                    <th style={{ padding: '0.85rem 1rem' }}>परिचालित आयोजना</th>
                    <th style={{ padding: '0.85rem 1rem' }}>१०० दिने कार्य दिन प्रगति</th>
                    <th style={{ padding: '0.85rem 1rem' }}>कुल भुक्तानी</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>अवस्था</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>कार्य (Actions)</th>
                  </tr>
                </thead>
                <tbody>
                  {isWorkersLoading ? (
                    <tr>
                      <td colSpan={10} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                        श्रम बैंक डेटा लोड हुँदैछ...
                      </td>
                    </tr>
                  ) : filteredWorkers.length === 0 ? (
                    <tr>
                      <td colSpan={10} style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8' }}>
                        कुनै श्रमिक फेला परेन।
                      </td>
                    </tr>
                  ) : (
                    filteredWorkers.map((w) => {
                      const daysWorked = w.totalDaysWorked || w.total_days_worked || 0;
                      const progressPct = Math.min(Math.round((daysWorked / 100) * 100), 100);
                      const dailyWage = w.dailyWageRate || w.daily_wage_rate || 850;
                      const totalPaid = w.totalWagePaid || w.total_wage_paid || 0;

                      return (
                        <tr key={w.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}>
                          <td style={{ padding: '0.8rem 1rem', fontWeight: 700, color: '#047857' }}>
                            {w.workerId || w.worker_id}
                          </td>

                          <td style={{ padding: '0.8rem 1rem' }}>
                            <div style={{ fontWeight: 700, color: '#1e293b' }}>{w.fullName || w.full_name}</div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '0.15rem' }}>
                              <Phone size={12} /> {w.phone || w.contactPhone || w.contact_phone || w.citizenshipNo || w.citizenship_no}
                            </div>
                          </td>

                          <td style={{ padding: '0.8rem 1rem' }}>
                            <span style={{
                              background: '#ecfdf5',
                              color: '#065f46',
                              padding: '0.2rem 0.55rem',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              display: 'inline-block'
                            }}>
                              {w.skillCategory || w.skill_category}
                            </span>
                            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.15rem' }}>
                              {w.skillLevel || w.skill_level || 'सामान्य'}
                            </div>
                          </td>

                          <td style={{ padding: '0.8rem 1rem' }}>
                            <div style={{ fontWeight: 600, color: '#334155' }}>वडा नं. {w.wardNumber || w.ward_number}</div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{w.tole || w.toleVillage || w.tole_village || 'गाम्चेत'}</div>
                          </td>

                          <td style={{ padding: '0.8rem 1rem', fontWeight: 700, color: '#1e293b' }}>
                            रु. {dailyWage.toLocaleString('ne-NP')}/दिन
                          </td>

                          <td style={{ padding: '0.8rem 1rem', maxWidth: '200px' }}>
                            {w.allocatedProject || w.allocated_project ? (
                              <div style={{ color: '#1e40af', fontWeight: 600, fontSize: '0.8rem', lineHeight: 1.3 }}>
                                {w.allocatedProject || w.allocated_project}
                              </div>
                            ) : (
                              <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.8rem' }}>खटाउन बाँकी</span>
                            )}
                          </td>

                          {/* 100 Days Progress */}
                          <td style={{ padding: '0.8rem 1rem', minWidth: '150px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.2rem' }}>
                              <strong style={{ color: daysWorked >= 100 ? '#10b981' : '#d97706' }}>
                                {daysWorked} दिन
                              </strong>
                              <span style={{ color: '#64748b' }}>१०० दिन लक्ष्य</span>
                            </div>
                            <div style={{ width: '100%', height: '7px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                              <div style={{
                                width: `${progressPct}%`,
                                height: '100%',
                                background: daysWorked >= 100 ? '#10b981' : progressPct > 50 ? '#3b82f6' : '#f59e0b',
                                transition: 'width 0.3s ease'
                              }} />
                            </div>
                          </td>

                          <td style={{ padding: '0.8rem 1rem', fontWeight: 800, color: '#0f766e' }}>
                            रु. {totalPaid.toLocaleString('ne-NP')}
                          </td>

                          <td style={{ padding: '0.8rem 1rem', textAlign: 'center' }}>
                            <span style={{
                              background: (w.status || '').includes('१०० दिन') ? '#dcfce7' :
                                (w.status || '').includes('परिचालित') ? '#dbeafe' : '#fef3c7',
                              color: (w.status || '').includes('१०० दिन') ? '#15803d' :
                                (w.status || '').includes('परिचालित') ? '#1e40af' : '#b45309',
                              padding: '0.25rem 0.6rem',
                              borderRadius: '12px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              whiteSpace: 'nowrap'
                            }}>
                              {w.status || 'सूचीकृत'}
                            </span>
                          </td>

                          {/* Actions */}
                          <td style={{ padding: '0.8rem 1rem', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                              {/* Log Days Button */}
                              <button
                                onClick={() => {
                                  setSelectedWorkerForLog(w);
                                  setShowLogWorkModal(true);
                                }}
                                title="कार्य दिन हाजिरी लग थप्नुहोस्"
                                style={{
                                  padding: '0.35rem 0.55rem',
                                  background: '#fffbeb',
                                  border: '1px solid #fde68a',
                                  color: '#b45309',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '2px',
                                  fontSize: '0.72rem',
                                  fontWeight: 700
                                }}
                              >
                                <Clock size={12} /> हाजिरी
                              </button>

                              {/* Allocate to Project Button */}
                              <button
                                onClick={() => {
                                  setAllocateModalData(w);
                                  setAllocationForm({
                                    projectTitle: w.allocatedProject || w.allocated_project || '',
                                    days: 30,
                                    dailyWageRate: dailyWage,
                                  });
                                }}
                                title="आयोजनामा परिचालन गर्नुहोस्"
                                style={{
                                  padding: '0.35rem 0.55rem',
                                  background: '#eff6ff',
                                  border: '1px solid #bfdbfe',
                                  color: '#1e40af',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '2px',
                                  fontSize: '0.72rem',
                                  fontWeight: 700
                                }}
                              >
                                <Send size={12} /> परिचालन
                              </button>

                              {/* Labour Card Modal */}
                              <button
                                onClick={() => setCardModalData(w)}
                                title="श्रम कार्ड हेर्नुहोस्"
                                style={{
                                  padding: '0.35rem 0.5rem',
                                  background: '#ecfdf5',
                                  border: '1px solid #a7f3d0',
                                  color: '#047857',
                                  borderRadius: '6px',
                                  cursor: 'pointer'
                                }}
                              >
                                <QrCode size={14} />
                              </button>

                              {/* Delete Button */}
                              <button
                                onClick={() => {
                                  if (window.confirm(`${w.fullName || w.full_name} को श्रमिक लगत मेटाउन निश्चित हुनुहुन्छ?`)) {
                                    deleteWorkerMutation.mutate(w.id);
                                  }
                                }}
                                title="हटाउनुहोस्"
                                style={{
                                  padding: '0.35rem 0.5rem',
                                  background: '#fef2f2',
                                  border: '1px solid #fecaca',
                                  color: '#dc2626',
                                  borderRadius: '6px',
                                  cursor: 'pointer'
                                }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: PMEP PROJECTS (रोजगारी आयोजनाहरूको ट्र्याकिङ) ─── */}
      {activeTab === 'projects' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                प्रधानमन्त्री रोजगार कार्यक्रम (PMEP) पूर्वाधार आयोजनाहरू
              </h2>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                पाँचपोखरी थाङपालका ८ वटै वडामा सञ्चालित श्रममूलक सामुदायिक आयोजना, बजेट र मानव-दिन प्रगति
              </p>
            </div>
            <button
              onClick={() => setShowAddProjectModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.65rem 1.25rem',
                background: '#1e40af',
                border: 'none',
                borderRadius: '10px',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.85rem',
                boxShadow: '0 4px 10px rgba(30, 64, 175, 0.3)'
              }}
            >
              <Plus size={16} /> नयाँ आयोजना थप्नुहोस्
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '1.25rem'
          }}>
            {projects.map((p) => {
              const targetDays = p.target_person_days || 100;
              const completedDays = p.completed_person_days || 0;
              const pct = Math.min(Math.round((completedDays / targetDays) * 100), 100);

              return (
                <div key={p.id} style={{
                  background: '#fff',
                  borderRadius: '14px',
                  border: '1px solid #e2e8f0',
                  padding: '1.35rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{
                        background: '#eff6ff',
                        color: '#1e40af',
                        padding: '0.2rem 0.55rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 700
                      }}>
                        {p.project_code}
                      </span>
                      <span style={{
                        background: p.status.includes('सम्पन्न') ? '#dcfce7' : '#dbeafe',
                        color: p.status.includes('सम्पन्न') ? '#15803d' : '#1e40af',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '12px',
                        fontSize: '0.72rem',
                        fontWeight: 700
                      }}>
                        {p.status}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: '#0f172a', lineHeight: 1.35 }}>
                      {p.title}
                    </h3>

                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#64748b', marginBottom: '0.75rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <MapPin size={14} color="#059669" /> वडा नं. {p.ward_number} ({p.tole_village || 'गाउँ'})
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Users size={14} color="#2563eb" /> {p.workers_count || 0} जना परिचालित
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.3rem' }}>
                        <span style={{ fontWeight: 600, color: '#334155' }}>
                          सम्पन्न श्रम-दिन: <strong style={{ color: '#059669' }}>{completedDays}</strong> / {targetDays} दिन
                        </span>
                        <strong style={{ color: pct >= 100 ? '#10b981' : '#2563eb' }}>{pct}%</strong>
                      </div>
                      <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${pct}%`,
                          height: '100%',
                          background: pct >= 100 ? '#10b981' : 'linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%)',
                          borderRadius: '4px'
                        }} />
                      </div>
                    </div>
                  </div>

                  <div style={{
                    paddingTop: '0.85rem',
                    borderTop: '1px solid #f1f5f9',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.82rem'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>विनियोजित बजेट</div>
                      <div style={{ fontWeight: 800, color: '#0f766e', fontSize: '0.95rem' }}>
                        रु. {Number(p.allocated_budget || 0).toLocaleString('ne-NP')}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>सुपरभाइजर</div>
                      <div style={{ fontWeight: 600, color: '#334155' }}>
                        {p.supervisor_name || 'प्राविधिक अधिकृत'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TAB 3: WORK DAYS & ATTENDANCE LOG ───────────────────── */}
      {activeTab === 'attendance' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                कार्य दिन तथा दैनिक हाजिरी ट्र्याकिङ लग
              </h2>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                रोजगारीको हक सम्बन्धी ऐन बमोजिम प्रत्येक श्रमिकको कार्य दिन प्रविष्टि, आयोजना खटनपटन र ज्याला गणना
              </p>
            </div>
            <button
              onClick={() => {
                if (workers.length > 0) {
                  setSelectedWorkerForLog(workers[0]);
                  setShowLogWorkModal(true);
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.65rem 1.25rem',
                background: '#d97706',
                border: 'none',
                borderRadius: '10px',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.85rem',
                boxShadow: '0 4px 10px rgba(217, 119, 6, 0.3)'
              }}
            >
              <Plus size={16} /> हाजिरी लग थप्नुहोस्
            </button>
          </div>

          <div style={{
            background: '#fff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            boxShadow: '0 2px 5px rgba(0,0,0,0.03)'
          }}>
            <div className="dt-responsive-table-wrapper">
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                  <tr>
                    <th style={{ padding: '0.85rem 1rem' }}>मिति (वि.सं.)</th>
                    <th style={{ padding: '0.85rem 1rem' }}>श्रमिक संकेत नं</th>
                    <th style={{ padding: '0.85rem 1rem' }}>श्रमिकको नाम</th>
                    <th style={{ padding: '0.85rem 1rem' }}>कार्यरत आयोजना</th>
                    <th style={{ padding: '0.85rem 1rem' }}>वडा नं</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>काम गरेको दिन</th>
                    <th style={{ padding: '0.85rem 1rem' }}>दैनिक ज्याला</th>
                    <th style={{ padding: '0.85rem 1rem' }}>कुल ज्याला रकम</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>निकासा अवस्था</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>कार्य</th>
                  </tr>
                </thead>
                <tbody>
                  {isLogsLoading ? (
                    <tr>
                      <td colSpan={10} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                        हाजिरी लग डेटा लोड हुँदैछ...
                      </td>
                    </tr>
                  ) : workLogs.length === 0 ? (
                    <tr>
                      <td colSpan={10} style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8' }}>
                        कुनै कार्य लग फेला परेन।
                      </td>
                    </tr>
                  ) : (
                    workLogs.map((log) => (
                      <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.8rem 1rem', fontWeight: 600, color: '#334155' }}>
                          {log.work_date_bs}
                        </td>
                        <td style={{ padding: '0.8rem 1rem', fontWeight: 700, color: '#047857' }}>
                          {log.worker_id}
                        </td>
                        <td style={{ padding: '0.8rem 1rem', fontWeight: 700, color: '#0f172a' }}>
                          {log.worker_name}
                        </td>
                        <td style={{ padding: '0.8rem 1rem', color: '#1e40af', fontWeight: 600, maxWidth: '240px' }}>
                          {log.project_title}
                        </td>
                        <td style={{ padding: '0.8rem 1rem', color: '#475569' }}>
                          वडा नं. {log.ward_number}
                        </td>
                        <td style={{ padding: '0.8rem 1rem', textAlign: 'center', fontWeight: 800, color: '#d97706' }}>
                          {log.days_worked} दिन
                        </td>
                        <td style={{ padding: '0.8rem 1rem', color: '#475569' }}>
                          रु. {Number(log.daily_wage_rate || 850).toLocaleString('ne-NP')}
                        </td>
                        <td style={{ padding: '0.8rem 1rem', fontWeight: 800, color: '#0f766e' }}>
                          रु. {Number(log.wage_amount || 0).toLocaleString('ne-NP')}
                        </td>
                        <td style={{ padding: '0.8rem 1rem', textAlign: 'center' }}>
                          <span style={{
                            background: log.payout_status.includes('सम्पन्न') ? '#dcfce7' : '#fef3c7',
                            color: log.payout_status.includes('सम्पन्न') ? '#15803d' : '#b45309',
                            padding: '0.2rem 0.55rem',
                            borderRadius: '12px',
                            fontSize: '0.72rem',
                            fontWeight: 700
                          }}>
                            {log.payout_status}
                          </span>
                        </td>
                        <td style={{ padding: '0.8rem 1rem', textAlign: 'right' }}>
                          {!log.payout_status.includes('सम्पन्न') ? (
                            <button
                              onClick={() => disburseMutation.mutate(log.id)}
                              style={{
                                padding: '0.35rem 0.65rem',
                                background: '#10b981',
                                border: 'none',
                                borderRadius: '6px',
                                color: '#fff',
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                                fontWeight: 700
                              }}
                            >
                              निकासा प्रमाणित
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>
                              {log.voucher_no || 'सम्पन्न'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: PAYROLL & DISBURSEMENT ───────────────────────── */}
      {activeTab === 'payroll' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                श्रम बैंक प्रत्यक्ष बैंक खाता ज्याला निकासा भरपाई
              </h2>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                पारदर्शी ई-भुक्तानी: राष्ट्रिय वाणिज्य बैंक तथा नेपाल बैंक लि. मार्फत श्रमिकको खातामा सिधै रकम निकासा
              </p>
            </div>
            <button
              onClick={() => window.print()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.65rem 1.25rem',
                background: '#0f766e',
                border: 'none',
                borderRadius: '10px',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.85rem',
                boxShadow: '0 4px 10px rgba(15, 118, 110, 0.3)'
              }}
            >
              <Printer size={16} /> बैंक निकासा भरपाई प्रिन्ट (Print Payroll)
            </button>
          </div>

          <div style={{
            background: '#fff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            boxShadow: '0 2px 5px rgba(0,0,0,0.03)'
          }}>
            <div className="dt-responsive-table-wrapper">
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead style={{ background: '#f0fdfa', borderBottom: '2px solid #ccfbf1', color: '#134e4a' }}>
                  <tr>
                    <th style={{ padding: '0.85rem 1rem' }}>क्र.सं.</th>
                    <th style={{ padding: '0.85rem 1rem' }}>श्रमिक संकेत नं</th>
                    <th style={{ padding: '0.85rem 1rem' }}>श्रमिकको नाम</th>
                    <th style={{ padding: '0.85rem 1rem' }}>वडा नं</th>
                    <th style={{ padding: '0.85rem 1rem' }}>बैंकको नाम</th>
                    <th style={{ padding: '0.85rem 1rem' }}>बैंक खाता नम्बर</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>काम गरेको दिन</th>
                    <th style={{ padding: '0.85rem 1rem' }}>दैनिक दर</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>कुल निकासा रकम</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>भुक्तानी स्थिति</th>
                  </tr>
                </thead>
                <tbody>
                  {workers.map((w, idx) => {
                    const daysWorked = w.totalDaysWorked || w.total_days_worked || 0;
                    const dailyWage = w.dailyWageRate || w.daily_wage_rate || 850;
                    const totalWage = w.totalWagePaid || w.total_wage_paid || (daysWorked * dailyWage);

                    return (
                      <tr key={w.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.8rem 1rem', color: '#64748b' }}>{idx + 1}</td>
                        <td style={{ padding: '0.8rem 1rem', fontWeight: 700, color: '#047857' }}>
                          {w.workerId || w.worker_id}
                        </td>
                        <td style={{ padding: '0.8rem 1rem', fontWeight: 700, color: '#0f172a' }}>
                          {w.fullName || w.full_name}
                        </td>
                        <td style={{ padding: '0.8rem 1rem' }}>वडा नं. {w.wardNumber || w.ward_number}</td>
                        <td style={{ padding: '0.8rem 1rem', color: '#0f766e', fontWeight: 600 }}>
                          {w.bankName || w.bank_name || 'नेपाल बैंक लि.'}
                        </td>
                        <td style={{ padding: '0.8rem 1rem', fontFamily: 'monospace', fontWeight: 600, color: '#334155' }}>
                          {w.bankAccountNo || w.bank_account_no || 'खाता विवरण प्राप्त हुन बाँकी'}
                        </td>
                        <td style={{ padding: '0.8rem 1rem', textAlign: 'center', fontWeight: 700 }}>
                          {daysWorked} दिन
                        </td>
                        <td style={{ padding: '0.8rem 1rem' }}>
                          रु. {dailyWage.toLocaleString('ne-NP')}
                        </td>
                        <td style={{ padding: '0.8rem 1rem', textAlign: 'right', fontWeight: 800, color: '#0f766e', fontSize: '0.95rem' }}>
                          रु. {totalWage.toLocaleString('ne-NP')}
                        </td>
                        <td style={{ padding: '0.8rem 1rem', textAlign: 'center' }}>
                          <span style={{
                            background: daysWorked > 0 ? '#dcfce7' : '#f1f5f9',
                            color: daysWorked > 0 ? '#15803d' : '#64748b',
                            padding: '0.2rem 0.55rem',
                            borderRadius: '12px',
                            fontSize: '0.72rem',
                            fontWeight: 700
                          }}>
                            {daysWorked > 0 ? 'बैंक निकासा प्रमाणित' : 'प्रक्रियामा'}
                          </span>
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

      {/* ── TAB 5: DEMANDS & MATCHING ────────────────────────────── */}
      {activeTab === 'demands' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                निजी क्षेत्र तथा स्थानीय रोजगार माग र श्रमिक मिलान (Job Matching)
              </h2>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                स्थानीय कृषि फार्म, उद्योग, निर्माण व्यवसायी तथा होटलबाट आएका जनशक्ति माग र श्रम बैंकबाट सिफारिस
              </p>
            </div>
            <button
              onClick={() => setShowAddDemandModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.65rem 1.25rem',
                background: '#7c3aed',
                border: 'none',
                borderRadius: '10px',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.85rem',
                boxShadow: '0 4px 10px rgba(124, 58, 237, 0.3)'
              }}
            >
              <Plus size={16} /> नयाँ रोजगार माग दर्ता
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.25rem'
          }}>
            {demands.map((d) => (
              <div key={d.id} style={{
                background: '#fff',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                padding: '1.35rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{
                      background: '#f5f3ff',
                      color: '#6d28d9',
                      padding: '0.2rem 0.55rem',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 700
                    }}>
                      वडा नं. {d.ward_number}
                    </span>
                    <span style={{
                      background: d.status.includes('सम्पन्न') ? '#dcfce7' :
                        d.status.includes('सिफारिस') ? '#dbeafe' : '#fef3c7',
                      color: d.status.includes('सम्पन्न') ? '#15803d' :
                        d.status.includes('सिफारिस') ? '#1e40af' : '#b45309',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '12px',
                      fontSize: '0.72rem',
                      fontWeight: 700
                    }}>
                      {d.status}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 0.4rem 0', color: '#0f172a' }}>
                    {d.employer_name}
                  </h3>

                  <div style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '0.75rem' }}>
                    <strong>आवश्यक सीप:</strong> <span style={{ color: '#065f46', fontWeight: 600 }}>{d.skill_required}</span>
                  </div>

                  <div style={{
                    background: '#f8fafc',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    color: '#334155',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem',
                    marginBottom: '1rem'
                  }}>
                    <div>माग संख्या: <strong>{d.required_count} जना</strong></div>
                    <div>प्रस्तावित ज्याला: <strong>रु. {Number(d.daily_wage_offered || 1000).toLocaleString('ne-NP')}/दिन</strong></div>
                    <div>कार्य अवधि: <strong>{d.work_duration_days} दिन</strong></div>
                  </div>
                </div>

                <div style={{
                  paddingTop: '0.75rem',
                  borderTop: '1px solid #f1f5f9',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.8rem',
                  color: '#64748b'
                }}>
                  <div>
                    सम्पर्क: <strong>{d.contact_person || 'रोजगारदाता'}</strong> ({d.contact_phone || '-'})
                  </div>
                  <button
                    onClick={() => {
                      alert(`${d.employer_name} को लागि श्रम बैंकबाट श्रमिक सिफारिस प्रक्रिया सुरु गरियो।`);
                    }}
                    style={{
                      padding: '0.35rem 0.65rem',
                      background: '#7c3aed',
                      border: 'none',
                      borderRadius: '6px',
                      color: '#fff',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      fontWeight: 700
                    }}
                  >
                    श्रमिक सिफारिस
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── MODAL 1: ADD WORKER MODAL ────────────────────────────── */}
      {showAddWorkerModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '650px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
          }}>
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)',
              color: '#fff',
              borderTopLeftRadius: '16px',
              borderTopRightRadius: '16px'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>
                  नयाँ श्रमिक सूचीकरण फारम (Labour Bank Registration)
                </h3>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', opacity: 0.9 }}>
                  प्रधानमन्त्री रोजगार कार्यक्रम तथा स्थानीय श्रम बैंकमा नागरिक लगत प्रविष्टि
                </p>
              </div>
              <button
                onClick={() => setShowAddWorkerModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createWorkerMutation.mutate({
                  fullName: workerForm.fullName,
                  citizenshipNo: workerForm.citizenshipNo,
                  gender: workerForm.gender,
                  contactPhone: workerForm.phone,
                  wardNumber: Number(workerForm.wardNumber),
                  toleVillage: workerForm.tole,
                  skillCategory: workerForm.skillCategory,
                  skillLevel: workerForm.skillLevel,
                  dailyWageRate: Number(workerForm.dailyWageRate),
                  guaranteedDaysAllocated: Number(workerForm.guaranteedDaysAllocated),
                  bankName: workerForm.bankName,
                  bankAccountNo: workerForm.bankAccountNo,
                  pmepFiscalYear: workerForm.pmepFiscalYear,
                  notes: workerForm.notes
                });
              }}
              style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem', color: '#334155' }}>
                    श्रमिकको पूरा नाम *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="उदा: मिङ्मार तामाङ"
                    value={workerForm.fullName}
                    onChange={(e) => setWorkerForm({ ...workerForm, fullName: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem', color: '#334155' }}>
                    नागरिकता वा राष्ट्रिय परिचयपत्र नं *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="२७-०१-७२-०३४२१"
                    value={workerForm.citizenshipNo}
                    onChange={(e) => setWorkerForm({ ...workerForm, citizenshipNo: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem', color: '#334155' }}>
                    लिङ्ग
                  </label>
                  <select
                    value={workerForm.gender}
                    onChange={(e) => setWorkerForm({ ...workerForm, gender: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', background: '#fff' }}
                  >
                    <option value="पुरुष">पुरुष</option>
                    <option value="महिला">महिला</option>
                    <option value="अन्य">अन्य</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem', color: '#334155' }}>
                    सम्पर्क फोन नम्बर
                  </label>
                  <input
                    type="text"
                    placeholder="९८४१२३४५६७"
                    value={workerForm.phone}
                    onChange={(e) => setWorkerForm({ ...workerForm, phone: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem', color: '#334155' }}>
                    वडा नम्बर
                  </label>
                  <select
                    value={workerForm.wardNumber}
                    onChange={(e) => setWorkerForm({ ...workerForm, wardNumber: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', background: '#fff' }}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
                      <option key={w} value={w}>वडा नं. {w}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem', color: '#334155' }}>
                  टोल / बस्ती
                </label>
                <input
                  type="text"
                  placeholder="उदा: भोताङ, गाम्चेत"
                  value={workerForm.tole}
                  onChange={(e) => setWorkerForm({ ...workerForm, tole: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem', color: '#334155' }}>
                    सीप क्षेत्र (Skill Category)
                  </label>
                  <select
                    value={workerForm.skillCategory}
                    onChange={(e) => setWorkerForm({ ...workerForm, skillCategory: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', background: '#fff' }}
                  >
                    {SKILL_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem', color: '#334155' }}>
                    सीप तह (Skill Level)
                  </label>
                  <select
                    value={workerForm.skillLevel}
                    onChange={(e) => setWorkerForm({ ...workerForm, skillLevel: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', background: '#fff' }}
                  >
                    <option value="दक्ष (Skilled)">दक्ष (Skilled)</option>
                    <option value="अर्धदक्ष (Semi-skilled)">अर्धदक्ष (Semi-skilled)</option>
                    <option value="सामान्य (Unskilled)">सामान्य (Unskilled)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem', color: '#334155' }}>
                    दैनिक ज्याला दर (रु.)
                  </label>
                  <input
                    type="number"
                    value={workerForm.dailyWageRate}
                    onChange={(e) => setWorkerForm({ ...workerForm, dailyWageRate: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem', color: '#334155' }}>
                    न्यूनतम रोजगार ग्यारेन्टी (दिन)
                  </label>
                  <input
                    type="number"
                    value={workerForm.guaranteedDaysAllocated}
                    onChange={(e) => setWorkerForm({ ...workerForm, guaranteedDaysAllocated: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem', color: '#334155' }}>
                    बैंकको नाम
                  </label>
                  <input
                    type="text"
                    value={workerForm.bankName}
                    onChange={(e) => setWorkerForm({ ...workerForm, bankName: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem', color: '#334155' }}>
                    बैंक खाता नम्बर
                  </label>
                  <input
                    type="text"
                    placeholder="०२३००१०००४५१२३"
                    value={workerForm.bankAccountNo}
                    onChange={(e) => setWorkerForm({ ...workerForm, bankAccountNo: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowAddWorkerModal(false)}
                  style={{
                    padding: '0.6rem 1.25rem',
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  रद्द गर्नुहोस्
                </button>
                <button
                  type="submit"
                  disabled={createWorkerMutation.isPending}
                  style={{
                    padding: '0.6rem 1.5rem',
                    background: '#047857',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {createWorkerMutation.isPending ? 'दर्ता हुँदैछ...' : 'श्रमिक सुरक्षित गर्नुहोस्'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 2: LOG WORK DAYS MODAL ─────────────────────────── */}
      {showLogWorkModal && selectedWorkerForLog && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '500px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
          }}>
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'linear-gradient(135deg, #b45309 0%, #d97706 100%)',
              color: '#fff',
              borderTopLeftRadius: '16px',
              borderTopRightRadius: '16px'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>
                  कार्य दिन तथा हाजिरी प्रविष्टि
                </h3>
                <p style={{ margin: '0.15rem 0 0', fontSize: '0.75rem', opacity: 0.9 }}>
                  श्रमिक: {selectedWorkerForLog.fullName || selectedWorkerForLog.full_name} ({selectedWorkerForLog.workerId || selectedWorkerForLog.worker_id})
                </p>
              </div>
              <button
                onClick={() => setShowLogWorkModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                logWorkMutation.mutate({
                  id: selectedWorkerForLog.id,
                  days: Number(logWorkForm.days),
                  work_date_bs: logWorkForm.work_date_bs,
                  remarks: logWorkForm.remarks
                });
              }}
              style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem', color: '#334155' }}>
                  काम गरेको दिन संख्या (Days) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="100"
                  value={logWorkForm.days}
                  onChange={(e) => setLogWorkForm({ ...logWorkForm, days: Number(e.target.value) })}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '1rem', fontWeight: 700 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem', color: '#334155' }}>
                  कार्य मिति (वि.सं.)
                </label>
                <input
                  type="text"
                  value={logWorkForm.work_date_bs}
                  onChange={(e) => setLogWorkForm({ ...logWorkForm, work_date_bs: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem', color: '#334155' }}>
                  कैफियत (Remarks)
                </label>
                <input
                  type="text"
                  value={logWorkForm.remarks}
                  onChange={(e) => setLogWorkForm({ ...logWorkForm, remarks: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                />
              </div>

              <div style={{
                background: '#fef3c7',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                color: '#92400e'
              }}>
                थपिने ज्याला: <strong>रु. {((selectedWorkerForLog.dailyWageRate || selectedWorkerForLog.daily_wage_rate || 850) * logWorkForm.days).toLocaleString('ne-NP')}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowLogWorkModal(false)}
                  style={{
                    padding: '0.6rem 1.25rem',
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  रद्द गर्नुहोस्
                </button>
                <button
                  type="submit"
                  disabled={logWorkMutation.isPending}
                  style={{
                    padding: '0.6rem 1.5rem',
                    background: '#d97706',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {logWorkMutation.isPending ? 'दर्ता हुँदैछ...' : 'हाजिरी सुरक्षित गर्नुहोस्'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 3: ALLOCATE PROJECT MODAL ──────────────────────── */}
      {allocateModalData && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '520px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
          }}>
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
              color: '#fff',
              borderTopLeftRadius: '16px',
              borderTopRightRadius: '16px'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>
                  विकास आयोजनामा परिचालन गर्नुहोस्
                </h3>
                <p style={{ margin: '0.15rem 0 0', fontSize: '0.75rem', opacity: 0.9 }}>
                  श्रमिक: {allocateModalData.fullName || allocateModalData.full_name} ({allocateModalData.workerId || allocateModalData.worker_id})
                </p>
              </div>
              <button
                onClick={() => setAllocateModalData(null)}
                style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                allocateMutation.mutate({
                  id: allocateModalData.id,
                  data: {
                    projectTitle: allocationForm.projectTitle,
                    days: Number(allocationForm.days),
                    dailyWageRate: Number(allocationForm.dailyWageRate)
                  }
                });
              }}
              style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem', color: '#334155' }}>
                  आयोजना चयन गर्नुहोस् *
                </label>
                <select
                  required
                  value={allocationForm.projectTitle}
                  onChange={(e) => setAllocationForm({ ...allocationForm, projectTitle: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', background: '#fff' }}
                >
                  <option value="">-- विकास आयोजना छान्नुहोस् --</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.title}>
                      [{p.project_code}] वडा नं {p.ward_number} - {p.title}
                    </option>
                  ))}
                  <option value="पाँचपोखरी थाङपाल कृषि सडक स्तरोन्नति">पाँचपोखरी थाङपाल कृषि सडक स्तरोन्नति</option>
                  <option value="मानेखर्क पहिरो रोकथाम बायो-इन्जिनियरिङ">मानेखर्क पहिरो रोकथाम बायो-इन्जिनियरिङ</option>
                  <option value="सिम्पालकाभ्रे गोरेटो बाटो मर्मत">सिम्पालकाभ्रे गोरेटो बाटो मर्मत</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem', color: '#334155' }}>
                    खटाइने दिन संख्या
                  </label>
                  <input
                    type="number"
                    value={allocationForm.days}
                    onChange={(e) => setAllocationForm({ ...allocationForm, days: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem', color: '#334155' }}>
                    दैनिक ज्याला दर (रु.)
                  </label>
                  <input
                    type="number"
                    value={allocationForm.dailyWageRate}
                    onChange={(e) => setAllocationForm({ ...allocationForm, dailyWageRate: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setAllocateModalData(null)}
                  style={{
                    padding: '0.6rem 1.25rem',
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  रद्द गर्नुहोस्
                </button>
                <button
                  type="submit"
                  disabled={allocateMutation.isPending}
                  style={{
                    padding: '0.6rem 1.5rem',
                    background: '#1e40af',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {allocateMutation.isPending ? 'खटाउँदै...' : 'आयोजनामा परिचालन गर्नुहोस्'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 4: ADD PMEP PROJECT MODAL ──────────────────────── */}
      {showAddProjectModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
          }}>
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
              color: '#fff',
              borderTopLeftRadius: '16px',
              borderTopRightRadius: '16px'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>
                  नयाँ PMEP रोजगारी आयोजना प्रविष्टि
                </h3>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', opacity: 0.9 }}>
                  श्रममूलक पूर्वाधार आयोजना, बजेट तथा मानव-दिन लक्ष्य दर्ता
                </p>
              </div>
              <button
                onClick={() => setShowAddProjectModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createProjectMutation.mutate({
                  title: projectForm.title,
                  ward_number: Number(projectForm.ward_number),
                  tole_village: projectForm.tole_village,
                  allocated_budget: Number(projectForm.allocated_budget),
                  target_person_days: Number(projectForm.target_person_days),
                  daily_wage_rate: Number(projectForm.daily_wage_rate),
                  supervisor_name: projectForm.supervisor_name,
                  supervisor_phone: projectForm.supervisor_phone,
                  status: projectForm.status,
                  fiscal_year: projectForm.fiscal_year,
                  start_date_bs: projectForm.start_date_bs,
                  end_date_bs: projectForm.end_date_bs
                });
              }}
              style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem', color: '#334155' }}>
                  आयोजनाको नाम *
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा: भोताङ-मानेखर्क कृषि सडक तथा ग्याभियन पर्खाल निर्माण"
                  value={projectForm.title}
                  onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem', color: '#334155' }}>
                    वडा नम्बर
                  </label>
                  <select
                    value={projectForm.ward_number}
                    onChange={(e) => setProjectForm({ ...projectForm, ward_number: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', background: '#fff' }}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
                      <option key={w} value={w}>वडा नं. {w}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem', color: '#334155' }}>
                    टोल / बस्ती
                  </label>
                  <input
                    type="text"
                    placeholder="उदा: धाप बजार"
                    value={projectForm.tole_village}
                    onChange={(e) => setProjectForm({ ...projectForm, tole_village: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem', color: '#334155' }}>
                    विनियोजित बजेट (रु.)
                  </label>
                  <input
                    type="number"
                    value={projectForm.allocated_budget}
                    onChange={(e) => setProjectForm({ ...projectForm, allocated_budget: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem', color: '#334155' }}>
                    लक्ष्य मानव-दिन (Target Days)
                  </label>
                  <input
                    type="number"
                    value={projectForm.target_person_days}
                    onChange={(e) => setProjectForm({ ...projectForm, target_person_days: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem', color: '#334155' }}>
                    सुपरभाइजर / प्राविधिक नाम
                  </label>
                  <input
                    type="text"
                    placeholder="उदा: केशव खड्का"
                    value={projectForm.supervisor_name}
                    onChange={(e) => setProjectForm({ ...projectForm, supervisor_name: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem', color: '#334155' }}>
                    सम्पर्क फोन
                  </label>
                  <input
                    type="text"
                    placeholder="९८४१२३४५६१"
                    value={projectForm.supervisor_phone}
                    onChange={(e) => setProjectForm({ ...projectForm, supervisor_phone: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowAddProjectModal(false)}
                  style={{
                    padding: '0.6rem 1.25rem',
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  रद्द गर्नुहोस्
                </button>
                <button
                  type="submit"
                  disabled={createProjectMutation.isPending}
                  style={{
                    padding: '0.6rem 1.5rem',
                    background: '#1e40af',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {createProjectMutation.isPending ? 'दर्ता हुँदैछ...' : 'आयोजना सुरक्षित गर्नुहोस्'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 5: ADD LABOUR DEMAND MODAL ─────────────────────── */}
      {showAddDemandModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '520px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
          }}>
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)',
              color: '#fff',
              borderTopLeftRadius: '16px',
              borderTopRightRadius: '16px'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>
                  निजी / स्थानीय रोजगार माग दर्ता फारम
                </h3>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', opacity: 0.9 }}>
                  स्थानीय रोजगारदाताबाट श्रम बैंकमा आएको जनशक्ति माग प्रविष्टि
                </p>
              </div>
              <button
                onClick={() => setShowAddDemandModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createDemandMutation.mutate({
                  employer_name: demandForm.employer_name,
                  contact_person: demandForm.contact_person,
                  contact_phone: demandForm.contact_phone,
                  ward_number: Number(demandForm.ward_number),
                  skill_required: demandForm.skill_required,
                  required_count: Number(demandForm.required_count),
                  daily_wage_offered: Number(demandForm.daily_wage_offered),
                  work_duration_days: Number(demandForm.work_duration_days),
                  status: demandForm.status
                });
              }}
              style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem', color: '#334155' }}>
                  रोजगारदाता / फार्म / कम्पनीको नाम *
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा: पाँचपोखरी स्याउ तथा किवी फार्म"
                  value={demandForm.employer_name}
                  onChange={(e) => setDemandForm({ ...demandForm, employer_name: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem', color: '#334155' }}>
                    सम्पर्क व्यक्ति
                  </label>
                  <input
                    type="text"
                    placeholder="दावा शेर्पा"
                    value={demandForm.contact_person}
                    onChange={(e) => setDemandForm({ ...demandForm, contact_person: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem', color: '#334155' }}>
                    सम्पर्क नम्बर
                  </label>
                  <input
                    type="text"
                    placeholder="९८५१२३४५६७"
                    value={demandForm.contact_phone}
                    onChange={(e) => setDemandForm({ ...demandForm, contact_phone: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem', color: '#334155' }}>
                    आवश्यक सीप
                  </label>
                  <select
                    value={demandForm.skill_required}
                    onChange={(e) => setDemandForm({ ...demandForm, skill_required: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', background: '#fff' }}
                  >
                    {SKILL_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem', color: '#334155' }}>
                    संख्या (जना)
                  </label>
                  <input
                    type="number"
                    value={demandForm.required_count}
                    onChange={(e) => setDemandForm({ ...demandForm, required_count: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem', color: '#334155' }}>
                    प्रस्तावित दैनिक ज्याला (रु.)
                  </label>
                  <input
                    type="number"
                    value={demandForm.daily_wage_offered}
                    onChange={(e) => setDemandForm({ ...demandForm, daily_wage_offered: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem', color: '#334155' }}>
                    कार्य अवधि (दिन)
                  </label>
                  <input
                    type="number"
                    value={demandForm.work_duration_days}
                    onChange={(e) => setDemandForm({ ...demandForm, work_duration_days: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowAddDemandModal(false)}
                  style={{
                    padding: '0.6rem 1.25rem',
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  रद्द गर्नुहोस्
                </button>
                <button
                  type="submit"
                  disabled={createDemandMutation.isPending}
                  style={{
                    padding: '0.6rem 1.5rem',
                    background: '#7c3aed',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {createDemandMutation.isPending ? 'दर्ता हुँदैछ...' : 'माग दर्ता गर्नुहोस्'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 6: LABOUR IDENTITY CARD PRINT MODAL ────────────── */}
      {cardModalData && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '480px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
            overflow: 'hidden'
          }}>
            {/* Printable Card Area */}
            <div id="esc-labour-card" style={{
              padding: '1.5rem',
              background: 'linear-gradient(145deg, #f0fdf4 0%, #ecfdf5 100%)',
              border: '2px solid #059669',
              borderRadius: '14px',
              margin: '1.25rem',
              position: 'relative'
            }}>
              {/* Header */}
              <div style={{ textAlign: 'center', borderBottom: '1.5px solid #059669', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#065f46' }}>
                  पाँचपोखरी थाङपाल गाउँपालिका | रोजगार सेवा केन्द्र (ESC)
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#064e3b', margin: '0.2rem 0' }}>
                  डिजिटल श्रम परिचयपत्र (Labour Identity Card)
                </div>
                <div style={{ fontSize: '0.7rem', color: '#047857' }}>
                  श्रम, रोजगार तथा सामाजिक सुरक्षा मन्त्रालय / PMEP
                </div>
              </div>

              {/* Body */}
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{
                  width: '90px',
                  height: '105px',
                  background: '#e2e8f0',
                  borderRadius: '8px',
                  border: '1.5px solid #cbd5e1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  color: '#64748b'
                }}>
                  <Users size={36} />
                  <span style={{ fontSize: '0.65rem', marginTop: '0.2rem' }}>फोटो</span>
                </div>

                <div style={{ flex: 1, fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <div>
                    <span style={{ color: '#64748b' }}>संकेत नं: </span>
                    <strong style={{ color: '#047857', fontSize: '0.9rem' }}>
                      {cardModalData.workerId || cardModalData.worker_id}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>नाम: </span>
                    <strong style={{ color: '#0f172a' }}>
                      {cardModalData.fullName || cardModalData.full_name}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>नागरिकता: </span>
                    <span>{cardModalData.citizenshipNo || cardModalData.citizenship_no}</span>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>ठेगाना: </span>
                    <span>वडा नं. {cardModalData.wardNumber || cardModalData.ward_number}, {cardModalData.tole || cardModalData.toleVillage || 'पाँचपोखरी'}</span>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>सीप वर्ग: </span>
                    <strong style={{ color: '#065f46' }}>{cardModalData.skillCategory || cardModalData.skill_category}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>दैनिक दर: </span>
                    <strong>रु. {Number(cardModalData.dailyWageRate || cardModalData.daily_wage_rate || 850).toLocaleString('ne-NP')}</strong>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div style={{
                marginTop: '1rem',
                paddingTop: '0.65rem',
                borderTop: '1px dashed #059669',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                fontSize: '0.72rem',
                color: '#64748b'
              }}>
                <div>
                  जारी मिति: {cardModalData.registeredDateBs || '२०८१-०१-१५'}<br />
                  आर्थिक वर्ष: {cardModalData.pmepFiscalYear || '२०८१/०८२'}
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '80px', borderBottom: '1px solid #334155', marginBottom: '2px' }} />
                  प्रमुख प्रशासकीय अधिकृत
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ padding: '0.75rem 1.25rem 1.25rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                onClick={() => setCardModalData(null)}
                style={{
                  padding: '0.55rem 1rem',
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                बन्द गर्नुहोस्
              </button>
              <button
                onClick={() => window.print()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.55rem 1.25rem',
                  background: '#047857',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <Printer size={16} /> कार्ड प्रिन्ट गर्नुहोस्
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
