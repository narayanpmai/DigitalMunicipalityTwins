import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client';
import { NepaliDatePicker } from '../../components/common/NepaliDatePicker';
import * as XLSX from 'xlsx';
import './recruitment.css';
import {
  FileCheck,
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
  Phone,
  MapPin,
  Award,
  Layers,
  ArrowRight,
  ShieldCheck,
  FileText,
  UserCheck,
  Clock,
  Sparkles,
  ExternalLink,
  UploadCloud,
  Paperclip,
  Image as ImageIcon,
  CheckCircle2,
  Loader2,
  File as FileIcon,
  Pencil,
  Globe,
  LogIn
} from 'lucide-react';

interface Vacancy {
  id: string;
  vacancyNo: string;
  vacancy_no?: string;
  title: string;
  serviceGroup: string;
  service_group?: string;
  level: string;
  openingsCount: number;
  openings_count?: number;
  employmentType: string;
  employment_type?: string;
  applicationFee: number;
  application_fee?: number;
  minQualification: string;
  min_qualification?: string;
  publishDateBs: string;
  publish_date_bs?: string;
  deadlineDateBs: string;
  deadline_date_bs?: string;
  examDateBs?: string;
  exam_date_bs?: string;
  status: string;
  description?: string;
  createdAt?: string;
}

interface Application {
  id: string;
  applicationNo: string;
  application_no?: string;
  vacancyId: string;
  vacancy_id?: string;
  vacancyNo: string;
  vacancy_no?: string;
  postTitle: string;
  post_title?: string;
  fullNameNp: string;
  full_name_np?: string;
  fullNameEn?: string;
  full_name_en?: string;
  dobBs?: string;
  dob_bs?: string;
  gender: string;
  citizenshipNo?: string;
  citizenship_no?: string;
  citizenshipDistrict?: string;
  citizenship_district?: string;
  contactPhone: string;
  contact_phone?: string;
  email?: string;
  permanentAddress: string;
  permanent_address?: string;
  temporaryAddress?: string;
  temporary_address?: string;
  qualificationTitle?: string;
  qualification_title?: string;
  boardUniversity?: string;
  board_university?: string;
  passedYearBs?: string;
  passed_year_bs?: string;
  divisionGpa?: string;
  division_gpa?: string;
  councilRegNo?: string;
  council_reg_no?: string;
  experienceYears?: number;
  experience_years?: number;
  paymentMethod?: string;
  payment_method?: string;
  paymentVoucherNo?: string;
  payment_voucher_no?: string;
  status: string;
  rejectionReason?: string;
  rejection_reason?: string;
  admitCardRollNo?: string;
  admit_card_roll_no?: string;
  examCenter?: string;
  exam_center?: string;
  examDateTime?: string;
  exam_date_time?: string;
  photoUrl?: string;
  photo_url?: string;
  signatureUrl?: string;
  signature_url?: string;
  citizenshipDocUrl?: string;
  citizenship_doc_url?: string;
  qualificationDocUrl?: string;
  qualification_doc_url?: string;
  councilDocUrl?: string;
  council_doc_url?: string;
  experienceDocUrl?: string;
  experience_doc_url?: string;
  paymentVoucherDocUrl?: string;
  payment_voucher_doc_url?: string;
  documentsJson?: string;
  documents_json?: string;
  createdAt?: string;
}

interface RecruitmentSummary {
  total_vacancies: number;
  active_vacancies: number;
  total_openings: number;
  total_applications: number;
  pending_applications: number;
  approved_applications: number;
  rejected_applications: number;
}

export const RecruitmentPage: React.FC = () => {
  const queryClient = useQueryClient();
  const location = useLocation();
  const navigate = useNavigate();

  // Detect whether page is public or admin
  const isPublicView = location.pathname === '/recruitment';

  // Active Tab
  const [activeTab, setActiveTab] = useState<'vacancies' | 'applications' | 'apply' | 'admitCard'>('vacancies');

  useEffect(() => {
    if (isPublicView && activeTab === 'applications') {
      setActiveTab('vacancies');
    }
  }, [isPublicView, activeTab]);

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedVacancyFilter, setSelectedVacancyFilter] = useState('all');

  // Modals
  const [showAddVacancyModal, setShowAddVacancyModal] = useState(false);
  const [showEditVacancyModal, setShowEditVacancyModal] = useState(false);
  const [editingVacancy, setEditingVacancy] = useState<Vacancy | null>(null);

  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  const [showEditAppModal, setShowEditAppModal] = useState(false);
  const [editingApp, setEditingApp] = useState<Application | null>(null);

  // Admit Card Search
  const [admitSearchQuery, setAdmitSearchQuery] = useState('');
  const [admitCardResult, setAdmitCardResult] = useState<any>(null);
  const [isAdmitSearching, setIsAdmitSearching] = useState(false);
  const [admitSearchError, setAdmitSearchError] = useState('');

  // Submit Feedback
  const [submitSuccessAppNo, setSubmitSuccessAppNo] = useState<string | null>(null);

  // New Vacancy Form
  const [vacancyForm, setVacancyForm] = useState({
    vacancyNo: '',
    title: '',
    serviceGroup: 'प्रशासन / प्राविधिक',
    level: 'सहायक पाँचौं (5th Level)',
    openingsCount: 1,
    employmentType: 'करार सेवा (Contract)',
    applicationFee: 500,
    minQualification: '',
    publishDateBs: '२०८१-०५-०१',
    deadlineDateBs: '२०८१-०५-२५',
    examDateBs: '२०८१-०६-१५ बिहान ११:०० बजे',
    status: 'खुला (Active)',
    description: '',
  });

  // Verify Form
  const [verifyForm, setVerifyForm] = useState({
    status: 'स्वीकृत (Approved)',
    rejectionReason: '',
    admitCardRollNo: '',
    examCenter: 'पाँचपोखरी थाङपाल मा.वि., वडा नं ६, सिन्धुपाल्चोक',
    examDateTime: '२०८१/०६/१५ बिहान ११:०० बजे',
  });

  // Apply Online Form
  const [applyForm, setApplyForm] = useState({
    vacancyId: '',
    vacancyNo: '',
    postTitle: '',
    fullNameNp: '',
    fullNameEn: '',
    dobBs: '२०५८-०२-१५',
    gender: 'पुरुष',
    citizenshipNo: '',
    citizenshipDistrict: 'सिन्धुपाल्चोक',
    contactPhone: '',
    email: '',
    permanentAddress: 'पाँचपोखरी थाङपाल गाउँपालिका, वडा नं ',
    temporaryAddress: '',
    qualificationTitle: '',
    boardUniversity: '',
    passedYearBs: '२०७८',
    divisionGpa: 'प्रथम (First)',
    councilRegNo: '',
    experienceYears: 1,
    paymentMethod: 'eSewa / Khalti / ConnectIPS',
    paymentVoucherNo: '',
    photoUrl: '',
    signatureUrl: '',
    citizenshipDocUrl: '',
    qualificationDocUrl: '',
    councilDocUrl: '',
    experienceDocUrl: '',
    paymentVoucherDocUrl: '',
    agreeTerms: false,
  });

  // File Upload State & Handlers
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  const handleFileUpload = async (field: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      alert('फाइलको आकार १५ MB भन्दा बढी हुन सक्दैन।');
      return;
    }
    setUploadingField(field);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res: any = await api.post('/recruitment/upload-document', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const data = res.data || res;
      if (data && data.url) {
        setApplyForm(prev => ({
          ...prev,
          [field]: data.url
        }));
      }
    } catch (err: any) {
      alert('फाइल अपलोड हुन सकेन: ' + (err?.response?.data?.detail || err.message));
    } finally {
      setUploadingField(null);
    }
  };

  const handleRemoveFile = (field: string) => {
    setApplyForm(prev => ({
      ...prev,
      [field]: ''
    }));
  };

  const renderDocSlot = (
    fieldKey: string,
    title: string,
    subtitle: string,
    isRequired: boolean,
    acceptTypes: string,
    icon: React.ReactNode
  ) => {
    const currentUrl = (applyForm as any)[fieldKey];
    const isUploading = uploadingField === fieldKey;
    const isImage = currentUrl && (currentUrl.endsWith('.jpg') || currentUrl.endsWith('.jpeg') || currentUrl.endsWith('.png') || currentUrl.endsWith('.webp'));

    return (
      <div className={`rec-doc-box ${currentUrl ? 'has-file' : ''} ${isUploading ? 'is-uploading' : ''}`} key={fieldKey}>
        <div className="rec-doc-header">
          <div className="rec-doc-icon-badge">
            {currentUrl ? <CheckCircle2 size={20} color="#059669" /> : icon}
          </div>
          <div className="rec-doc-info">
            <h4 className="rec-doc-title">
              {title} {isRequired && <span className="rec-req">*</span>}
            </h4>
            <p className="rec-doc-subtitle">{subtitle}</p>
          </div>
        </div>

        {currentUrl ? (
          <div className="rec-doc-preview-area">
            {isImage ? (
              <img src={currentUrl} alt="Preview" className="rec-doc-thumb-img" />
            ) : (
              <div className="rec-doc-thumb-pdf">PDF</div>
            )}
            <div className="rec-doc-file-meta">
              <div className="rec-doc-filename" title={currentUrl}>
                {currentUrl.split('/').pop()}
              </div>
              <div className="rec-doc-status-text">
                <Check size={12} /> संलग्न भयो
              </div>
            </div>
          </div>
        ) : isUploading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1rem', color: '#0284c7', fontSize: '0.8rem', fontWeight: 700 }}>
            <Loader2 size={18} className="animate-spin" />
            अपलोड हुँदैछ...
          </div>
        ) : (
          <div style={{ padding: '0.4rem 0', color: '#94a3b8', fontSize: '0.72rem' }}>
            कुनै फाइल अपलोड गरिएको छैन
          </div>
        )}

        <div className="rec-doc-actions">
          {currentUrl ? (
            <>
              <a
                href={currentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rec-doc-view-btn"
                title="फाइल हेर्नुहोस्"
              >
                <Eye size={13} /> हेर्नुहोस्
              </a>
              <button
                type="button"
                onClick={() => handleRemoveFile(fieldKey)}
                className="rec-doc-remove-btn"
                title="हटाउनुहोस्"
              >
                <Trash2 size={13} /> हटाउनुहोस्
              </button>
            </>
          ) : (
            <label className="rec-doc-upload-trigger">
              <UploadCloud size={16} />
              <span>फाइल छनोट गर्नुहोस्</span>
              <input
                type="file"
                accept={acceptTypes}
                onChange={(e) => handleFileUpload(fieldKey, e)}
                style={{ display: 'none' }}
                disabled={isUploading}
              />
            </label>
          )}
        </div>
      </div>
    );
  };


  // 1. Fetch Summary
  const { data: summary, refetch: refetchSummary } = useQuery<RecruitmentSummary>({
    queryKey: ['recruitment-summary'],
    queryFn: async () => {
      const res: any = await api.get('/recruitment/summary');
      return res.data || res || {
        total_vacancies: 0,
        active_vacancies: 0,
        total_openings: 0,
        total_applications: 0,
        pending_applications: 0,
        approved_applications: 0,
        rejected_applications: 0,
      };
    },
  });

  // 2. Fetch Vacancies
  const { data: vacancies = [], isLoading: isVacanciesLoading, refetch: refetchVacancies } = useQuery<Vacancy[]>({
    queryKey: ['recruitment-vacancies'],
    queryFn: async () => {
      const res: any = await api.get('/recruitment/vacancies');
      return res.data || res || [];
    },
  });

  // 3. Fetch Applications
  const { data: applications = [], isLoading: isAppsLoading, refetch: refetchApps } = useQuery<Application[]>({
    queryKey: ['recruitment-applications'],
    queryFn: async () => {
      const res: any = await api.get('/recruitment/applications');
      return res.data || res || [];
    },
  });

  // Create Vacancy Mutation
  const createVacancyMutation = useMutation({
    mutationFn: async (data: any) => {
      return await api.post('/recruitment/vacancies', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruitment-vacancies'] });
      queryClient.invalidateQueries({ queryKey: ['recruitment-summary'] });
      setShowAddVacancyModal(false);
      setVacancyForm({
        vacancyNo: '',
        title: '',
        serviceGroup: 'प्रशासन / प्राविधिक',
        level: 'सहायक पाँचौं (5th Level)',
        openingsCount: 1,
        employmentType: 'करार सेवा (Contract)',
        applicationFee: 500,
        minQualification: '',
        publishDateBs: '२०८१-०५-०१',
        deadlineDateBs: '२०८१-०५-२५',
        examDateBs: '२०८१-०६-१५ बिहान ११:०० बजे',
        status: 'खुला (Active)',
        description: '',
      });
      alert('नयाँ पदपूर्ति विज्ञापन सफलतापूर्वक प्रकाशन भयो!');
    },
    onError: (err: any) => {
      alert('विज्ञापन प्रकाशन गर्न सकिएन: ' + (err?.response?.data?.detail || err.message));
    }
  });

  // Submit Application Mutation
  const submitApplicationMutation = useMutation({
    mutationFn: async (data: any) => {
      return await api.post('/recruitment/apply', data);
    },
    onSuccess: (res: any) => {
      const saved = res.data || res;
      queryClient.invalidateQueries({ queryKey: ['recruitment-applications'] });
      queryClient.invalidateQueries({ queryKey: ['recruitment-summary'] });
      setSubmitSuccessAppNo(saved.applicationNo || saved.application_no || 'सफलतापूर्वक दर्ता भयो');
      setAdmitSearchQuery(saved.applicationNo || saved.application_no || '');
      setApplyForm({
        vacancyId: '',
        vacancyNo: '',
        postTitle: '',
        fullNameNp: '',
        fullNameEn: '',
        dobBs: '२०५८-०२-१५',
        gender: 'पुरुष',
        citizenshipNo: '',
        citizenshipDistrict: 'सिन्धुपाल्चोक',
        contactPhone: '',
        email: '',
        permanentAddress: 'पाँचपोखरी थाङपाल गाउँपालिका, वडा नं ',
        temporaryAddress: '',
        qualificationTitle: '',
        boardUniversity: '',
        passedYearBs: '२०७८',
        divisionGpa: 'प्रथम (First)',
        councilRegNo: '',
        experienceYears: 1,
        paymentMethod: 'eSewa / Khalti / ConnectIPS',
        paymentVoucherNo: '',
        photoUrl: '',
        signatureUrl: '',
        citizenshipDocUrl: '',
        qualificationDocUrl: '',
        councilDocUrl: '',
        experienceDocUrl: '',
        paymentVoucherDocUrl: '',
        agreeTerms: false,
      });
    },
    onError: (err: any) => {
      alert('दरखास्त पेश गर्न सकिएन: ' + (err?.response?.data?.detail || err.message));
    }
  });

  // Verify Application Mutation
  const verifyMutation = useMutation({
    mutationFn: async ({ appId, payload }: { appId: string; payload: any }) => {
      return await api.put(`/recruitment/applications/${appId}/verify`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruitment-applications'] });
      queryClient.invalidateQueries({ queryKey: ['recruitment-summary'] });
      setShowVerifyModal(false);
      setSelectedApp(null);
      alert('दरखास्त प्रमाणीकरण सफलतापूर्वक सम्पन्न भयो!');
    },
    onError: (err: any) => {
      alert('प्रमाणीकरण असफल भयो: ' + (err?.response?.data?.detail || err.message));
    }
  });

  // Update Vacancy Mutation
  const updateVacancyMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await api.put(`/recruitment/vacancies/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruitment-vacancies'] });
      queryClient.invalidateQueries({ queryKey: ['recruitment-summary'] });
      setShowEditVacancyModal(false);
      setEditingVacancy(null);
      alert('विज्ञापन विवरण सफलतापूर्वक अद्यावधिक गरियो!');
    },
    onError: (err: any) => {
      alert('विज्ञापन अद्यावधिक गर्न सकिएन: ' + (err?.response?.data?.detail || err.message));
    }
  });

  // Delete Vacancy Mutation
  const deleteVacancyMutation = useMutation({
    mutationFn: async (id: string) => {
      return await api.delete(`/recruitment/vacancies/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruitment-vacancies'] });
      queryClient.invalidateQueries({ queryKey: ['recruitment-summary'] });
      alert('विज्ञापन सफलतापूर्वक हटाइयो!');
    },
    onError: (err: any) => {
      alert('विज्ञापन हटाउन सकिएन: ' + (err?.response?.data?.detail || err.message));
    }
  });

  // Update Application Mutation
  const updateAppMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await api.put(`/recruitment/applications/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruitment-applications'] });
      queryClient.invalidateQueries({ queryKey: ['recruitment-summary'] });
      setShowEditAppModal(false);
      setEditingApp(null);
      alert('उम्मेदवारको दरखास्त विवरण सफलतापूर्वक अद्यावधिक गरियो!');
    },
    onError: (err: any) => {
      alert('विवरण अद्यावधिक गर्न सकिएन: ' + (err?.response?.data?.detail || err.message));
    }
  });

  // Delete Application Mutation
  const deleteAppMutation = useMutation({
    mutationFn: async (id: string) => {
      return await api.delete(`/recruitment/applications/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruitment-applications'] });
      queryClient.invalidateQueries({ queryKey: ['recruitment-summary'] });
      alert('दरखास्त आवेदन सफलतापूर्वक हटाइयो!');
    },
    onError: (err: any) => {
      alert('आवेदन हटाउन सकिएन: ' + (err?.response?.data?.detail || err.message));
    }
  });

  // Action Handlers
  const handleOpenEditVacancy = (vac: Vacancy) => {
    setEditingVacancy({
      ...vac,
      vacancyNo: vac.vacancyNo || vac.vacancy_no || '',
      serviceGroup: vac.serviceGroup || vac.service_group || '',
      employmentType: vac.employmentType || vac.employment_type || '',
      openingsCount: vac.openingsCount || vac.openings_count || 1,
      applicationFee: vac.applicationFee ?? (vac as any).application_fee ?? 500,
      minQualification: vac.minQualification || vac.min_qualification || '',
      publishDateBs: vac.publishDateBs || vac.publish_date_bs || '',
      deadlineDateBs: vac.deadlineDateBs || vac.deadline_date_bs || '',
      examDateBs: vac.examDateBs || vac.exam_date_bs || '',
      status: vac.status || 'खुला (Active)',
      description: vac.description || '',
    });
    setShowEditVacancyModal(true);
  };

  const handleDeleteVacancy = (vac: Vacancy) => {
    const vId = vac.id || vac.vacancyNo || vac.vacancy_no || '';
    const title = vac.title;
    if (window.confirm(`के तपाईं निश्चित हुनुहुन्छ? पद: "${title}" (विज्ञापन नं: ${vac.vacancyNo || vac.vacancy_no}) लाई हटाउन चाहनुहुन्छ?`)) {
      deleteVacancyMutation.mutate(vId);
    }
  };

  const handleOpenEditApp = (app: Application) => {
    setEditingApp({
      ...app,
      fullNameNp: app.fullNameNp || app.full_name_np || '',
      fullNameEn: app.fullNameEn || '',
      dobBs: app.dobBs || '',
      citizenshipNo: app.citizenshipNo || app.citizenship_no || '',
      citizenshipDistrict: app.citizenshipDistrict || app.citizenship_district || '',
      contactPhone: app.contactPhone || app.contact_phone || '',
      email: app.email || '',
      permanentAddress: app.permanentAddress || app.permanent_address || '',
      qualificationTitle: app.qualificationTitle || app.qualification_title || '',
      boardUniversity: app.boardUniversity || app.board_university || '',
      passedYearBs: app.passedYearBs || app.passed_year_bs || '',
      divisionGpa: app.divisionGpa || app.division_gpa || '',
      councilRegNo: app.councilRegNo || app.council_reg_no || '',
      experienceYears: app.experienceYears || app.experience_years || 0,
      paymentMethod: app.paymentMethod || app.payment_method || '',
      paymentVoucherNo: app.paymentVoucherNo || app.payment_voucher_no || '',
      status: app.status || 'विचाराधीन (Pending)',
      admitCardRollNo: app.admitCardRollNo || app.admit_card_roll_no || '',
      examCenter: app.examCenter || app.exam_center || '',
      examDateTime: app.examDateTime || app.exam_date_time || '',
    });
    setShowEditAppModal(true);
  };

  const handleDeleteApp = (app: Application) => {
    const appId = app.id || app.applicationNo || app.application_no || '';
    const name = app.fullNameNp || app.full_name_np;
    const appNo = app.applicationNo || app.application_no;
    if (window.confirm(`के तपाईं निश्चित हुनुहुन्छ? दरखास्त नं: ${appNo} (उम्मेदवार: ${name}) लाई हटाउन चाहनुहुन्छ?`)) {
      deleteAppMutation.mutate(appId);
    }
  };

  // Excel Export Handler
  const handleExportExcel = async () => {
    try {
      window.open('/api/v1/recruitment/export-excel', '_blank');
    } catch {
      const rows = applications.map((a, i) => ({
        'क्र.सं.': i + 1,
        'दरखास्त नं': a.applicationNo || a.application_no,
        'विज्ञापन नं': a.vacancyNo || a.vacancy_no,
        'पद': a.postTitle || a.post_title,
        'उम्मेदवारको नाम': a.fullNameNp || a.full_name_np,
        'लिङ्ग': a.gender,
        'सम्पर्क फोन': a.contactPhone || a.contact_phone,
        'नागरिकता नं': a.citizenshipNo || a.citizenship_no,
        'ठेगाना': a.permanentAddress || a.permanent_address,
        'शैक्षिक योग्यता': a.qualificationTitle || a.qualification_title,
        'अवस्था': a.status,
        'रोल नम्बर': a.admitCardRollNo || a.admit_card_roll_no || '-',
        'परीक्षा केन्द्र': a.examCenter || a.exam_center || '-'
      }));
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'दरखास्त_विवरण');
      XLSX.writeFile(wb, `Paanchpokhari_Recruitment_Applications_${new Date().toISOString().slice(0, 10)}.xlsx`);
    }
  };

  // Search Admit Card
  const handleSearchAdmitCard = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!admitSearchQuery.trim()) {
      setAdmitSearchError('कृपया दरखास्त नं वा नागरिकता/मोबाइल नम्बर प्रविष्ट गर्नुहोस्।');
      return;
    }
    setIsAdmitSearching(true);
    setAdmitSearchError('');
    setAdmitCardResult(null);

    try {
      const res: any = await api.get(`/recruitment/admit-card?phone_or_citizenship=${encodeURIComponent(admitSearchQuery.trim())}`);
      const data = res.data || res;
      setAdmitCardResult(data);
    } catch (err: any) {
      setAdmitSearchError(err?.response?.data?.detail || 'उल्लेखित विवरण अनुसार कुनै दरखास्त वा प्रवेशपत्र फेला परेन। कृपया विवरण रुजु गर्नुहोस्।');
    } finally {
      setIsAdmitSearching(false);
    }
  };

  // Switch to Apply tab with vacancy pre-selected
  const handleApplyToVacancy = (vac: Vacancy) => {
    setApplyForm(prev => ({
      ...prev,
      vacancyId: vac.id,
      vacancyNo: vac.vacancyNo || vac.vacancy_no || '',
      postTitle: vac.title || '',
    }));
    setActiveTab('apply');
    setSubmitSuccessAppNo(null);
  };

  // Open Verify Modal
  const handleOpenVerify = (app: Application) => {
    setSelectedApp(app);
    setVerifyForm({
      status: app.status.includes('स्वीकृत') ? app.status : 'स्वीकृत (Approved)',
      rejectionReason: app.rejectionReason || app.rejection_reason || '',
      admitCardRollNo: app.admitCardRollNo || app.admit_card_roll_no || `ROLL-2081-${Math.floor(100 + Math.random() * 900)}`,
      examCenter: app.examCenter || app.exam_center || 'पाँचपोखरी थाङपाल मा.वि., वडा नं ६, सिन्धुपाल्चोक',
      examDateTime: app.examDateTime || app.exam_date_time || '२०८१/०६/१५ बिहान ११:०० बजे',
    });
    setShowVerifyModal(true);
  };

  // Open Admit Card directly from list
  const handleViewAdmitCard = (app: Application) => {
    const appNo = app.applicationNo || app.application_no || '';
    setAdmitSearchQuery(appNo);
    setActiveTab('admitCard');
    api.get(`/recruitment/admit-card?application_no=${encodeURIComponent(appNo)}`)
      .then((res: any) => {
        setAdmitCardResult(res.data || res);
      })
      .catch(() => {
        setAdmitSearchError('प्रवेशपत्र लोड गर्न सकिएन।');
      });
  };

  // Filtered Applications
  const filteredApplications = applications.filter(a => {
    const q = searchTerm.toLowerCase();
    const fullName = (a.fullNameNp || a.full_name_np || '').toLowerCase();
    const appNo = (a.applicationNo || a.application_no || '').toLowerCase();
    const phone = a.contactPhone || a.contact_phone || '';
    const post = (a.postTitle || a.post_title || '').toLowerCase();
    const cit = a.citizenshipNo || a.citizenship_no || '';

    const matchesSearch =
      !searchTerm ||
      fullName.includes(q) ||
      appNo.includes(q) ||
      phone.includes(q) ||
      post.includes(q) ||
      cit.includes(q);

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'pending' && a.status.includes('विचाराधीन')) ||
      (statusFilter === 'approved' && a.status.includes('स्वीकृत')) ||
      (statusFilter === 'rejected' && a.status.includes('अस्वीकृत'));

    const matchesVacancy =
      selectedVacancyFilter === 'all' ||
      a.vacancyId === selectedVacancyFilter ||
      a.vacancy_id === selectedVacancyFilter ||
      a.vacancyNo === selectedVacancyFilter ||
      a.vacancy_no === selectedVacancyFilter;

    return matchesSearch && matchesStatus && matchesVacancy;
  });

  return (
    <div className="rec-page">
      {/* 1. TOP HERO BANNER & STATS */}
      <div className="rec-hero">
        <div className="rec-hero-bg-icon">
          <FileCheck size={280} />
        </div>

        <div className="rec-hero-content">
          <div>
            <div className="rec-hero-badge-group">
              <span className="rec-hero-badge">
                <Sparkles size={14} color="#facc15" />
                {isPublicView ? 'नागरिक सेवा तथा सार्वजनिक पदपूर्ति पोर्टल' : 'नागरिक सेवा तथा सुशासन पोर्टल'}
              </span>
              <span className="rec-hero-badge rec-hero-badge-year">
                आ.व. २०८१/०८२
              </span>
            </div>
            <h1 className="rec-hero-title">
              <FileCheck size={32} color="#38bdf8" />
              {isPublicView
                ? 'पाँचपोखरी थाङपाल गाउँपालिका — खुला अनलाइन दरखास्त तथा पदपूर्ति पोर्टल'
                : 'अनलाइन दरखास्त तथा कर्मचारी पदपूर्ति व्यवस्थापन प्रणाली'}
            </h1>
            <p className="rec-hero-desc">
              {isPublicView
                ? 'खुला विज्ञापन तथा पदहरू हेर्नुहोस्, योग्यता अनुसार अनलाइन आवेदन फारम भर्नुहोस् र डिजिटल प्रवेशपत्र (Admit Card) प्राप्त गर्नुहोस्।'
                : 'पाँचपोखरी थाङपाल गाउँ कार्यपालिका — रिक्त पदहरूमा खुला विज्ञापन, अनलाइन आवेदन, दर्ता रुजु, डिजिटल प्रवेशपत्र (Admit Card) तथा परीक्षा व्यवस्थापन'}
            </p>
          </div>

          {/* Quick Action Buttons */}
          {isPublicView ? (
            <div className="rec-hero-actions">
              <button
                onClick={() => {
                  setActiveTab('apply');
                  setSubmitSuccessAppNo(null);
                }}
                className="rec-btn rec-btn-accent"
              >
                <Briefcase size={16} />
                अनलाइन दरखास्त फारम (Apply Now)
              </button>
              <button
                onClick={() => setActiveTab('admitCard')}
                className="rec-btn rec-btn-success"
              >
                <QrCode size={16} />
                प्रवेशपत्र खोज तथा प्रिन्ट
              </button>
              <button
                onClick={() => navigate('/app/recruitment')}
                className="rec-btn rec-btn-outline"
                style={{ background: 'rgba(255, 255, 255, 0.15)', borderColor: 'rgba(255,255,255,0.4)' }}
              >
                <LogIn size={16} />
                कार्यालय कर्मचारी लगइन
              </button>
            </div>
          ) : (
            <div className="rec-hero-actions">
              <button onClick={handleExportExcel} className="rec-btn rec-btn-success">
                <FileSpreadsheet size={16} />
                Excel रिपोर्ट
              </button>
              <button onClick={() => setShowAddVacancyModal(true)} className="rec-btn rec-btn-primary">
                <Plus size={16} />
                नयाँ विज्ञापन आह्वान
              </button>
              <a
                href="/recruitment"
                target="_blank"
                rel="noopener noreferrer"
                className="rec-btn rec-btn-outline"
                style={{ textDecoration: 'none', background: 'rgba(255, 255, 255, 0.15)', borderColor: 'rgba(255,255,255,0.4)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Globe size={16} />
                सार्वजनिक पोर्टल (Public View)
              </a>
            </div>
          )}
        </div>

        {/* Real-time Summary KPI Cards */}
        <div className="rec-stats-grid">
          <div className="rec-stat-card">
            <div className="rec-stat-label">
              <span>कुल विज्ञापनहरू</span>
              <Briefcase size={16} color="#7dd3fc" />
            </div>
            <div className="rec-stat-value">
              {summary?.total_vacancies ?? vacancies.length}
            </div>
            <div className="rec-stat-sub rec-stat-emerald">
              खुला: {summary?.active_vacancies ?? vacancies.filter(v => v.status.includes('खुला')).length} पद
            </div>
          </div>

          <div className="rec-stat-card">
            <div className="rec-stat-label">
              <span>कुल माग पद संख्या</span>
              <Users size={16} color="#38bdf8" />
            </div>
            <div className="rec-stat-value rec-stat-sky">
              {summary?.total_openings ?? 8} जना
            </div>
            <div className="rec-stat-sub" style={{ color: '#93c5fd' }}>करार तथा प्राविधिक</div>
          </div>

          <div className="rec-stat-card">
            <div className="rec-stat-label">
              <span>कुल दरखास्त परेको</span>
              <FileText size={16} color="#fde68a" />
            </div>
            <div className="rec-stat-value rec-stat-amber">
              {summary?.total_applications ?? applications.length}
            </div>
            <div className="rec-stat-sub rec-stat-amber">उम्मेदवारहरू दर्ता</div>
          </div>

          <div className="rec-stat-card">
            <div className="rec-stat-label">
              <span>प्रवेशपत्र जारी (स्वीकृत)</span>
              <CheckCircle size={16} color="#6ee7b7" />
            </div>
            <div className="rec-stat-value rec-stat-emerald">
              {summary?.approved_applications ?? applications.filter(a => a.status.includes('स्वीकृत')).length}
            </div>
            <div className="rec-stat-sub rec-stat-emerald">परीक्षा योग्य उम्मेदवार</div>
          </div>

          <div className="rec-stat-card">
            <div className="rec-stat-label">
              <span>रुजु हुन बाँकी (विचाराधीन)</span>
              <Clock size={16} color="#fef08a" />
            </div>
            <div className="rec-stat-value rec-stat-yellow">
              {summary?.pending_applications ?? applications.filter(a => a.status.includes('विचाराधीन')).length}
            </div>
            <div className="rec-stat-sub rec-stat-yellow">रुजु डेस्कमा प्रतीक्षारत</div>
          </div>
        </div>
      </div>

      {/* 2. NAVIGATION TABS */}
      <div
        className="rec-tabs-grid"
        style={{
          gridTemplateColumns: isPublicView ? 'repeat(auto-fit, minmax(280px, 1fr))' : undefined
        }}
      >
        {/* Tab 1: Vacancies */}
        <button
          onClick={() => setActiveTab('vacancies')}
          className={`rec-tab-card ${activeTab === 'vacancies' ? 'active-vacancies' : ''}`}
        >
          <div className="rec-tab-card-left">
            <div className="rec-tab-icon-box">
              <Briefcase size={22} />
            </div>
            <div className="rec-tab-text-group">
              <div className="rec-tab-title">खुला विज्ञापन तथा पदहरू</div>
              <div className="rec-tab-subtitle">
                {vacancies.filter(v => v.status.includes('खुला')).length} सक्रिय विज्ञापन / पदहरू
              </div>
            </div>
          </div>
          <span className="rec-tab-pill-badge">
            {vacancies.length} पद
          </span>
        </button>

        {/* Tab 2: Applications Review Desk (ADMIN ONLY) */}
        {!isPublicView && (
          <button
            onClick={() => setActiveTab('applications')}
            className={`rec-tab-card ${activeTab === 'applications' ? 'active-applications' : ''}`}
          >
            <div className="rec-tab-card-left">
              <div className="rec-tab-icon-box">
                <UserCheck size={22} />
              </div>
              <div className="rec-tab-text-group">
                <div className="rec-tab-title">दरखास्त रुजु तथा पदपूर्ति डेस्क</div>
                <div className="rec-tab-subtitle">
                  छानबिन, स्वीकृत/अस्वीकृत तथा रोल नं
                </div>
              </div>
            </div>
            <span className="rec-tab-pill-badge">
              {applications.length} उम्मेदवार
            </span>
          </button>
        )}

        {/* Tab 3: Online Apply Form */}
        <button
          onClick={() => setActiveTab('apply')}
          className={`rec-tab-card ${activeTab === 'apply' ? 'active-apply' : ''}`}
        >
          <div className="rec-tab-card-left">
            <div className="rec-tab-icon-box">
              <FileText size={22} />
            </div>
            <div className="rec-tab-text-group">
              <div className="rec-tab-title">अनलाइन दरखास्त फारम (Apply)</div>
              <div className="rec-tab-subtitle">
                नागरिक खुला आवेदन तथा कागजात
              </div>
            </div>
          </div>
          <span className="rec-tab-pill-badge">
            खुला फारम
          </span>
        </button>

        {/* Tab 4: Digital Admit Card */}
        <button
          onClick={() => setActiveTab('admitCard')}
          className={`rec-tab-card ${activeTab === 'admitCard' ? 'active-admit' : ''}`}
        >
          <div className="rec-tab-card-left">
            <div className="rec-tab-icon-box">
              <QrCode size={22} />
            </div>
            <div className="rec-tab-text-group">
              <div className="rec-tab-title">डिजिटल प्रवेशपत्र तथा आवेदन स्थिति</div>
              <div className="rec-tab-subtitle">
                रोल नम्बर, परीक्षा केन्द्र र प्रिन्ट
              </div>
            </div>
          </div>
          <span className="rec-tab-pill-badge">
            Admit Card
          </span>
        </button>
      </div>

      {/* 3. TAB 1: VACANCIES (खुला विज्ञापन तथा पदहरू) */}
      {activeTab === 'vacancies' && (
        <div>
          {/* Controls Bar */}
          <div className="rec-toolbar">
            <div className="rec-toolbar-group">
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>विज्ञापन अवस्था:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rec-select"
              >
                <option value="all">सबै विज्ञापनहरू (All)</option>
                <option value="खुला (Active)">सक्रिय/खुला (Active)</option>
                <option value="म्याद सकिएको (Closed)">म्याद सकिएको (Closed)</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#64748b' }}>
              <Calendar size={15} color="#0284c7" />
              <span>दरखास्त दस्तुर भुक्तानी: डिजिटल (eSewa/Khalti) वा पालिकाको राजस्व खाता</span>
            </div>
          </div>

          {/* Vacancies Grid */}
          <div className="rec-vacancies-grid">
            {vacancies
              .filter(v => statusFilter === 'all' || v.status === statusFilter)
              .map((vac) => {
                const isActive = vac.status.includes('खुला');
                const openings = vac.openingsCount || vac.openings_count || 1;
                const fee = vac.applicationFee || vac.application_fee || 500;

                return (
                  <div key={vac.id} className="rec-vacancy-card">
                    <div className="rec-vacancy-card-body">
                      {/* Top Badges */}
                      <div className="rec-vacancy-header">
                        <span className="rec-vacancy-no">
                          विज्ञापन नं: {vac.vacancyNo || vac.vacancy_no}
                        </span>
                        <span className={isActive ? 'rec-badge-active' : 'rec-badge-closed'}>
                          <span className="rec-pulse-dot" />
                          {vac.status}
                        </span>
                      </div>

                      {/* Title & Service Group */}
                      <div>
                        <h3 className="rec-vacancy-title">{vac.title}</h3>
                        <div className="rec-vacancy-meta" style={{ marginTop: '0.45rem' }}>
                          <span className="rec-meta-pill rec-meta-group">
                            {vac.serviceGroup || vac.service_group}
                          </span>
                          <span className="rec-meta-pill rec-meta-level">
                            {vac.level}
                          </span>
                          <span className="rec-meta-pill rec-meta-type">
                            {vac.employmentType || vac.employment_type}
                          </span>
                        </div>
                      </div>

                      {/* Info Matrix */}
                      <div className="rec-vacancy-matrix">
                        <div className="rec-matrix-item">
                          <span className="rec-matrix-label">माग पद संख्या:</span>
                          <span className="rec-matrix-val rec-val-highlight">{openings} जना</span>
                        </div>
                        <div className="rec-matrix-item">
                          <span className="rec-matrix-label">दरखास्त दस्तुर:</span>
                          <span className="rec-matrix-val">रु. {fee} /-</span>
                        </div>
                        <div className="rec-matrix-item">
                          <span className="rec-matrix-label">प्रकाशन मिति:</span>
                          <span className="rec-matrix-val">{vac.publishDateBs || vac.publish_date_bs}</span>
                        </div>
                        <div className="rec-matrix-item">
                          <span className="rec-matrix-label">दरखास्त दिने अन्तिम मिति:</span>
                          <span className="rec-matrix-val rec-val-deadline">{vac.deadlineDateBs || vac.deadline_date_bs}</span>
                        </div>
                      </div>

                      {/* Minimum Qualification */}
                      <div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.25rem' }}>
                          न्यूनतम योग्यता:
                        </span>
                        <div className="rec-qual-box">
                          {vac.minQualification || vac.min_qualification}
                        </div>
                      </div>

                      {/* Exam Schedule */}
                      {(vac.examDateBs || vac.exam_date_bs) && (
                        <div className="rec-exam-alert">
                          <Clock size={15} />
                          <span>परीक्षा मिति: {vac.examDateBs || vac.exam_date_bs}</span>
                        </div>
                      )}
                    </div>

                    {/* Footer Actions */}
                    <div className="rec-vacancy-card-footer" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => {
                            alert(
                              `विज्ञापन नं: ${vac.vacancyNo || vac.vacancy_no}\nपद: ${vac.title}\nविवरण: ${vac.description || 'कुनै थप विवरण उपलब्ध छैन।'}`
                            );
                          }}
                          className="rec-btn rec-btn-outline"
                          style={{ color: '#334155', background: '#e2e8f0', borderColor: '#cbd5e1', fontSize: '0.78rem', padding: '0.4rem 0.75rem' }}
                        >
                          <Eye size={14} /> विवरण
                        </button>

                        {!isPublicView && (
                          <>
                            <button
                              onClick={() => handleOpenEditVacancy(vac)}
                              className="rec-btn-sm rec-btn-sm-edit"
                              title="विज्ञापन सम्पादन गर्नुहोस्"
                            >
                              <Pencil size={13} /> सम्पादन
                            </button>

                            <button
                              onClick={() => handleDeleteVacancy(vac)}
                              className="rec-btn-sm rec-btn-sm-delete"
                              title="विज्ञापन हटाउनुहोस्"
                            >
                              <Trash2 size={13} /> हटाउने
                            </button>
                          </>
                        )}
                      </div>

                      {isActive ? (
                        <button
                          onClick={() => handleApplyToVacancy(vac)}
                          className="rec-btn rec-btn-primary"
                          style={{ fontSize: '0.78rem', padding: '0.45rem 0.9rem' }}
                        >
                          {isPublicView ? 'अनलाइन दरखास्त भर्नुहोस्' : 'फारम भर्नुहोस्'}
                          <ArrowRight size={14} />
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, fontStyle: 'italic' }}>
                          म्याद सकिएको
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* 4. TAB 2: APPLICATIONS REVIEW (दरखास्त रुजु तथा पदपूर्ति डेस्क) */}
      {activeTab === 'applications' && (
        <div>
          {/* Controls Bar */}
          <div className="rec-toolbar">
            <div className="rec-toolbar-group" style={{ flex: 1 }}>
              <div className="rec-input-search-wrapper">
                <Search size={16} className="rec-search-icon" />
                <input
                  type="text"
                  placeholder="उम्मेदवारको नाम, दरखास्त नं, फोन वा नागरिकता नं खोज्नुहोस्..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="rec-input"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rec-select"
              >
                <option value="all">सबै अवस्था (All Status)</option>
                <option value="pending">विचाराधीन (Pending)</option>
                <option value="approved">स्वीकृत (Approved)</option>
                <option value="rejected">अस्वीकृत (Rejected)</option>
              </select>

              <select
                value={selectedVacancyFilter}
                onChange={(e) => setSelectedVacancyFilter(e.target.value)}
                className="rec-select"
                style={{ maxWidth: '240px' }}
              >
                <option value="all">सबै पद / विज्ञापन</option>
                {vacancies.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.title} ({v.vacancyNo || v.vacancy_no})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <button
                onClick={() => {
                  refetchApps();
                  refetchSummary();
                }}
                className="rec-btn rec-btn-outline"
                style={{ color: '#334155', background: '#f1f5f9', borderColor: '#cbd5e1', padding: '0.55rem' }}
                title="रिफ्रेस गर्नुहोस्"
              >
                <RefreshCw size={16} />
              </button>
              <button onClick={handleExportExcel} className="rec-btn rec-btn-success" style={{ fontSize: '0.8rem', padding: '0.55rem 0.95rem' }}>
                <Download size={15} />
                Excel डाउनलोड
              </button>
            </div>
          </div>

          {/* Applications Table */}
          <div className="rec-table-card">
            <div className="rec-table-responsive">
              <table className="rec-table">
                <thead>
                  <tr>
                    <th style={{ textAlign: 'center', width: '50px' }}>क्र.सं.</th>
                    <th>दरखास्त नं</th>
                    <th>उम्मेदवारको नाम</th>
                    <th>पद तथा विज्ञापन</th>
                    <th>सम्पर्क / नागरिकता</th>
                    <th>योग्यता</th>
                    <th>दस्तुर भुक्तानी</th>
                    <th style={{ textAlign: 'center' }}>अवस्था (Status)</th>
                    <th>रोल नं / केन्द्र</th>
                    <th style={{ textAlign: 'center' }}>कार्यहरू</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplications.length === 0 ? (
                    <tr>
                      <td colSpan={10} style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
                        {isAppsLoading ? 'विवरण लोड हुँदैछ...' : 'कुनै दरखास्त फेला परेन।'}
                      </td>
                    </tr>
                  ) : (
                    filteredApplications.map((app, idx) => {
                      const isApproved = app.status.includes('स्वीकृत');
                      const isRejected = app.status.includes('अस्वीकृत');

                      return (
                        <tr key={app.id}>
                          <td style={{ textAlign: 'center', fontWeight: 600, color: '#64748b' }}>{idx + 1}</td>
                          <td>
                            <span className="rec-app-no-badge">
                              {app.applicationNo || app.application_no}
                            </span>
                          </td>
                          <td>
                            <div style={{ fontWeight: 800, color: '#0f172a' }}>{app.fullNameNp || app.full_name_np}</div>
                            {app.fullNameEn && <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{app.fullNameEn}</div>}
                            <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>लिङ्ग: {app.gender}</div>
                          </td>
                          <td>
                            <div style={{ fontWeight: 700, color: '#1e293b' }}>{app.postTitle || app.post_title}</div>
                            <div style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 700 }}>{app.vacancyNo || app.vacancy_no}</div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600, color: '#334155' }}>
                              <Phone size={13} color="#64748b" />
                              {app.contactPhone || app.contact_phone}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                              ना.नं: {app.citizenshipNo || app.citizenship_no} ({app.citizenshipDistrict || app.citizenship_district})
                            </div>
                          </td>
                          <td>
                            <div style={{ fontWeight: 600, color: '#1e293b' }}>{app.qualificationTitle || app.qualification_title}</div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{app.boardUniversity || app.board_university}</div>
                            {(() => {
                              const docsCount = [
                                app.photoUrl || app.photo_url,
                                app.signatureUrl || app.signature_url,
                                app.citizenshipDocUrl || app.citizenship_doc_url,
                                app.qualificationDocUrl || app.qualification_doc_url,
                                app.councilDocUrl || app.council_doc_url,
                                app.experienceDocUrl || app.experience_doc_url,
                                app.paymentVoucherDocUrl || app.payment_voucher_doc_url,
                              ].filter(Boolean).length;

                              return docsCount > 0 ? (
                                <div style={{ marginTop: '0.25rem' }}>
                                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.68rem', fontWeight: 700, color: '#0369a1', background: '#e0f2fe', padding: '0.15rem 0.45rem', borderRadius: '4px', border: '1px solid #bae6fd' }}>
                                    <Paperclip size={11} /> {docsCount} कागजात संलग्न
                                  </span>
                                </div>
                              ) : null;
                            })()}
                          </td>
                          <td>
                            <span style={{ display: 'inline-block', background: '#f1f5f9', color: '#334155', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600, border: '1px solid #cbd5e1' }}>
                              {app.paymentMethod || app.payment_method}
                            </span>
                            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.2rem' }}>
                              भौचर: {app.paymentVoucherNo || app.payment_voucher_no || '-'}
                            </div>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span className={isApproved ? 'rec-status-approved' : isRejected ? 'rec-status-rejected' : 'rec-status-pending'}>
                              <span className="rec-pulse-dot" />
                              {app.status}
                            </span>
                          </td>
                          <td>
                            {app.admitCardRollNo || app.admit_card_roll_no ? (
                              <div>
                                <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#1e3a8a', background: '#eff6ff', padding: '0.15rem 0.45rem', borderRadius: '4px', border: '1px solid #bfdbfe', fontSize: '0.72rem' }}>
                                  {app.admitCardRollNo || app.admit_card_roll_no}
                                </span>
                                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.2rem', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {app.examCenter || app.exam_center}
                                </div>
                              </div>
                            ) : (
                              <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.72rem' }}>रुजु हुन बाँकी</span>
                            )}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                              <button
                                onClick={() => {
                                  setSelectedApp(app);
                                  setShowDetailModal(true);
                                }}
                                className="rec-icon-btn rec-icon-btn-view"
                                title="पूर्ण विवरण हेर्नुहोस् (View)"
                              >
                                <Eye size={15} />
                              </button>

                              <button
                                onClick={() => handleOpenEditApp(app)}
                                className="rec-icon-btn rec-icon-btn-edit"
                                title="दरखास्त विवरण सम्पादन गर्नुहोस् (Edit)"
                              >
                                <Pencil size={15} />
                              </button>

                              <button
                                onClick={() => handleOpenVerify(app)}
                                className="rec-icon-btn rec-icon-btn-verify"
                                title="रुजु तथा निर्णय गर्नुहोस् (Verify/Approve)"
                              >
                                <ShieldCheck size={15} />
                              </button>

                              {isApproved && (
                                <button
                                  onClick={() => handleViewAdmitCard(app)}
                                  className="rec-icon-btn rec-icon-btn-print"
                                  title="प्रवेशपत्र छाप्नुहोस् (Admit Card)"
                                >
                                  <Printer size={15} />
                                </button>
                              )}

                              <button
                                onClick={() => handleDeleteApp(app)}
                                className="rec-icon-btn rec-icon-btn-delete"
                                title="दरखास्त हटाउनुहोस् (Delete)"
                              >
                                <Trash2 size={15} />
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

      {/* 5. TAB 3: APPLY ONLINE FORM (अनलाइन दरखास्त फारम) */}
      {activeTab === 'apply' && (
        <div className="rec-form-wrapper">
          {submitSuccessAppNo ? (
            <div style={{ background: '#ecfdf5', border: '2px solid #10b981', borderRadius: '18px', padding: '2.5rem', textAlign: 'center', boxShadow: 'var(--rec-shadow-lg)' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#d1fae5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' }}>
                <CheckCircle size={36} />
              </div>
              <h2 style={{ fontSize: '1.65rem', fontWeight: 900, color: '#064e3b', margin: '0 0 0.5rem 0' }}>
                तपाईंको दरखास्त सफलतापूर्वक दर्ता भएको छ!
              </h2>
              <p style={{ fontSize: '0.9rem', color: '#047857', maxWidth: '540px', margin: '0 auto 1.5rem auto', lineHeight: 1.5 }}>
                तपाईंको आवेदन रुजु डेस्कमा प्राप्त भइसकेको छ। कृपया तपाईंको निम्न दरखास्त नम्बर (Tracking Number) सुरक्षित राख्नुहोस्:
              </p>
              <div style={{ display: 'inline-block', background: '#ffffff', border: '2px dashed #059669', padding: '1rem 2rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block' }}>दरखास्त नम्बर (Application No.)</span>
                <span style={{ fontSize: '1.85rem', fontFamily: 'monospace', fontWeight: 900, color: '#1e3a8a', letterSpacing: '1px' }}>
                  {submitSuccessAppNo}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => {
                    setActiveTab('admitCard');
                    handleSearchAdmitCard();
                  }}
                  className="rec-btn rec-btn-success"
                >
                  <QrCode size={16} />
                  प्रवेशपत्र खोज तथा स्थिति हेर्नुहोस्
                </button>
                <button
                  onClick={() => setSubmitSuccessAppNo(null)}
                  className="rec-btn rec-btn-outline"
                  style={{ color: '#334155', background: '#ffffff', borderColor: '#cbd5e1' }}
                >
                  अर्को दरखास्त भर्नुहोस्
                </button>
              </div>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!applyForm.vacancyId) {
                  alert('कृपया विज्ञापन तथा पद छनोट गर्नुहोस्।');
                  return;
                }
                if (!applyForm.fullNameNp || !applyForm.contactPhone || !applyForm.citizenshipNo) {
                  alert('कृपया उम्मेदवारको नाम, सम्पर्क फोन र नागरिकता नम्बर अनिवार्य भर्नुहोस्।');
                  return;
                }
                if (!applyForm.agreeTerms) {
                  alert('कृपया सर्त तथा स्वघोषणा मन्जुर गर्नुहोस्।');
                  return;
                }
                submitApplicationMutation.mutate(applyForm);
              }}
              className="rec-form-card"
            >
              {/* Form Header */}
              <div className="rec-form-header">
                <FileText size={32} color="#7dd3fc" />
                <div>
                  <h2 style={{ fontSize: '1.45rem', fontWeight: 800, margin: 0 }}>नागरिक खुला अनलाइन दरखास्त फारम</h2>
                  <p style={{ fontSize: '0.85rem', opacity: 0.85, margin: '0.2rem 0 0 0' }}>
                    पाँचपोखरी थाङपाल गाउँ कार्यपालिकामा प्रकाशित रिक्त पदहरूका लागि आवेदन
                  </p>
                </div>
              </div>

              <div className="rec-form-body">
                {/* 1. Vacancy Selection */}
                <div className="rec-form-section">
                  <h3 className="rec-form-section-title">
                    <span className="rec-section-num">१</span>
                    विज्ञापन तथा पद छनोट (Vacancy Selection)
                  </h3>

                  <div className="rec-form-grid-2">
                    <div className="rec-field-group">
                      <label className="rec-label">
                        दरखास्त दिन चाहेको पद छनोट गर्नुहोस् <span className="rec-req">*</span>
                      </label>
                      <select
                        required
                        value={applyForm.vacancyId}
                        onChange={(e) => {
                          const vId = e.target.value;
                          const selected = vacancies.find(v => v.id === vId);
                          setApplyForm(prev => ({
                            ...prev,
                            vacancyId: vId,
                            vacancyNo: selected ? (selected.vacancyNo || selected.vacancy_no || '') : '',
                            postTitle: selected ? selected.title : '',
                          }));
                        }}
                        className="rec-input-control"
                        style={{ cursor: 'pointer' }}
                      >
                        <option value="">-- विज्ञापन तथा पद चयन गर्नुहोस् --</option>
                        {vacancies.filter(v => v.status.includes('खुला')).map(v => (
                          <option key={v.id} value={v.id}>
                            {v.title} — वि.नं. {v.vacancyNo || v.vacancy_no} ({v.level})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="rec-field-group">
                      <label className="rec-label">विज्ञापन नं (Auto)</label>
                      <input
                        type="text"
                        readOnly
                        value={applyForm.vacancyNo || 'विज्ञापन चयन गर्नुहोस्'}
                        className="rec-input-control"
                        style={{ background: '#f8fafc', color: '#64748b', fontFamily: 'monospace', fontWeight: 700 }}
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Personal Information */}
                <div className="rec-form-section">
                  <h3 className="rec-form-section-title">
                    <span className="rec-section-num">२</span>
                    उम्मेदवारको व्यक्तिगत विवरण (Personal Information)
                  </h3>

                  <div className="rec-form-grid-3">
                    <div className="rec-field-group">
                      <label className="rec-label">
                        उम्मेदवारको पूरा नाम (नेपालीमा) <span className="rec-req">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="उदा: सुवास तामाङ"
                        value={applyForm.fullNameNp}
                        onChange={(e) => setApplyForm({ ...applyForm, fullNameNp: e.target.value })}
                        className="rec-input-control"
                      />
                    </div>

                    <div className="rec-field-group">
                      <label className="rec-label">Full Name (English BLOCK)</label>
                      <input
                        type="text"
                        placeholder="e.g. SUBASH TAMANG"
                        value={applyForm.fullNameEn}
                        onChange={(e) => setApplyForm({ ...applyForm, fullNameEn: e.target.value.toUpperCase() })}
                        className="rec-input-control"
                      />
                    </div>

                    <div className="rec-field-group">
                      <label className="rec-label">जन्ममिति (वि.सं.)</label>
                      <NepaliDatePicker
                        value={applyForm.dobBs}
                        onChange={(val) => setApplyForm({ ...applyForm, dobBs: val })}
                      />
                    </div>

                    <div className="rec-field-group">
                      <label className="rec-label">लिङ्ग</label>
                      <select
                        value={applyForm.gender}
                        onChange={(e) => setApplyForm({ ...applyForm, gender: e.target.value })}
                        className="rec-input-control"
                        style={{ cursor: 'pointer' }}
                      >
                        <option value="पुरुष">पुरुष (Male)</option>
                        <option value="महिला">महिला (Female)</option>
                        <option value="अन्य">अन्य (Other)</option>
                      </select>
                    </div>

                    <div className="rec-field-group">
                      <label className="rec-label">
                        नागरिकता नम्बर <span className="rec-req">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="उदा: २३-०१-७५-०२८४५"
                        value={applyForm.citizenshipNo}
                        onChange={(e) => setApplyForm({ ...applyForm, citizenshipNo: e.target.value })}
                        className="rec-input-control"
                      />
                    </div>

                    <div className="rec-field-group">
                      <label className="rec-label">नागरिकता जारी जिल्ला</label>
                      <input
                        type="text"
                        value={applyForm.citizenshipDistrict}
                        onChange={(e) => setApplyForm({ ...applyForm, citizenshipDistrict: e.target.value })}
                        className="rec-input-control"
                      />
                    </div>

                    <div className="rec-field-group">
                      <label className="rec-label">
                        मोबाइल नम्बर <span className="rec-req">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="९८xxxxxxxx"
                        value={applyForm.contactPhone}
                        onChange={(e) => setApplyForm({ ...applyForm, contactPhone: e.target.value })}
                        className="rec-input-control"
                      />
                    </div>

                    <div className="rec-field-group">
                      <label className="rec-label">इमेल ठेगाना</label>
                      <input
                        type="email"
                        placeholder="candidate@example.com"
                        value={applyForm.email}
                        onChange={(e) => setApplyForm({ ...applyForm, email: e.target.value })}
                        className="rec-input-control"
                      />
                    </div>

                    <div className="rec-field-group">
                      <label className="rec-label">
                        स्थायी ठेगाना <span className="rec-req">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={applyForm.permanentAddress}
                        onChange={(e) => setApplyForm({ ...applyForm, permanentAddress: e.target.value })}
                        className="rec-input-control"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Academic & Qualification */}
                <div className="rec-form-section">
                  <h3 className="rec-form-section-title">
                    <span className="rec-section-num">३</span>
                    शैक्षिक योग्यता तथा अनुभव (Academic & Skills)
                  </h3>

                  <div className="rec-form-grid-3">
                    <div className="rec-field-group">
                      <label className="rec-label">न्यूनतम योग्यता / तह</label>
                      <input
                        type="text"
                        placeholder="उदा: डिप्लोमा इन सिभिल इन्जिनियरिङ"
                        value={applyForm.qualificationTitle}
                        onChange={(e) => setApplyForm({ ...applyForm, qualificationTitle: e.target.value })}
                        className="rec-input-control"
                      />
                    </div>

                    <div className="rec-field-group">
                      <label className="rec-label">बोर्ड / विश्वविद्यालय</label>
                      <input
                        type="text"
                        placeholder="उदा: CTEVT / त्रिभुवन विश्वविद्यालय"
                        value={applyForm.boardUniversity}
                        onChange={(e) => setApplyForm({ ...applyForm, boardUniversity: e.target.value })}
                        className="rec-input-control"
                      />
                    </div>

                    <div className="rec-field-group">
                      <label className="rec-label">उत्तीर्ण वर्ष (वि.सं.)</label>
                      <input
                        type="text"
                        placeholder="२०७८"
                        value={applyForm.passedYearBs}
                        onChange={(e) => setApplyForm({ ...applyForm, passedYearBs: e.target.value })}
                        className="rec-input-control"
                      />
                    </div>

                    <div className="rec-field-group">
                      <label className="rec-label">श्रेणी / GPA</label>
                      <input
                        type="text"
                        placeholder="उदा: प्रथम श्रेणी (GPA 3.4)"
                        value={applyForm.divisionGpa}
                        onChange={(e) => setApplyForm({ ...applyForm, divisionGpa: e.target.value })}
                        className="rec-input-control"
                      />
                    </div>

                    <div className="rec-field-group">
                      <label className="rec-label">काउन्सिल दर्ता नं (यदि लागू भए)</label>
                      <input
                        type="text"
                        placeholder="उदा: NEC / NNC दर्ता नं"
                        value={applyForm.councilRegNo}
                        onChange={(e) => setApplyForm({ ...applyForm, councilRegNo: e.target.value })}
                        className="rec-input-control"
                      />
                    </div>

                    <div className="rec-field-group">
                      <label className="rec-label">सम्बन्धित कार्य अनुभव (वर्ष)</label>
                      <input
                        type="number"
                        min="0"
                        value={applyForm.experienceYears}
                        onChange={(e) => setApplyForm({ ...applyForm, experienceYears: parseInt(e.target.value) || 0 })}
                        className="rec-input-control"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Required Documents Upload */}
                <div className="rec-form-section">
                  <h3 className="rec-form-section-title">
                    <span className="rec-section-num">४</span>
                    आवश्यक कागजातहरू तथा प्रमाणपत्र अपलोड (Required Documents Upload)
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 1rem 0' }}>
                    कृपया निम्न कागजातहरू प्रष्ट बुझिने गरि तस्बिर (.jpg, .jpeg, .png) वा PDF (.pdf) ढाँचामा अपलोड गर्नुहोस् (प्रति फाइल अधिकतम १५ MB सम्म)।
                  </p>

                  <div className="rec-doc-upload-grid">
                    {renderDocSlot(
                      'photoUrl',
                      'पासपोर्ट साइजको फोटो',
                      'उम्मेदवारको हालसालै खिचिएको प्रष्ट फोटो (JPG/PNG)',
                      true,
                      'image/jpeg,image/png,image/webp',
                      <ImageIcon size={18} />
                    )}

                    {renderDocSlot(
                      'signatureUrl',
                      'उम्मेदवारको दस्तखत (Signature)',
                      'सेतो कागजमा कालो वा निलो मसीले गरिएको हस्ताक्षर',
                      true,
                      'image/jpeg,image/png,image/webp',
                      <FileCheck size={18} />
                    )}

                    {renderDocSlot(
                      'citizenshipDocUrl',
                      'नेपाली नागरिकता प्रमाणपत्र',
                      'नागरिकताको अगाडि र पछाडिको भाग वा संयुक्त PDF',
                      true,
                      '.pdf,image/jpeg,image/png',
                      <ShieldCheck size={18} />
                    )}

                    {renderDocSlot(
                      'qualificationDocUrl',
                      'न्यूनतम योग्यताको प्रमाणपत्र / लब्धाङ्क',
                      'शैक्षिक योग्यताको Transcript वा Character Certificate',
                      true,
                      '.pdf,image/jpeg,image/png',
                      <Award size={18} />
                    )}

                    {renderDocSlot(
                      'councilDocUrl',
                      'सम्बन्धित काउन्सिल दर्ता प्रमाणपत्र',
                      'NEC / NNC वा अन्य व्यवसायिक काउन्सिल दर्ता (लागू भएमा)',
                      false,
                      '.pdf,image/jpeg,image/png',
                      <Building size={18} />
                    )}

                    {renderDocSlot(
                      'experienceDocUrl',
                      'कार्य अनुभव तथा तालिम प्रमाणपत्र',
                      'सम्बन्धित क्षेत्रमा काम गरेको अनुभव वा तालिम प्रमाणपत्र',
                      false,
                      '.pdf,image/jpeg,image/png',
                      <Briefcase size={18} />
                    )}

                    {renderDocSlot(
                      'paymentVoucherDocUrl',
                      'दरखास्त दस्तुर भुक्तानी भौचर / रसिद',
                      'eSewa / Khalti भौचर स्क्रिनसट वा पालिकाको राजस्व रसिद',
                      true,
                      '.pdf,image/jpeg,image/png',
                      <CreditCard size={18} />
                    )}
                  </div>
                </div>

                {/* 5. Payment & Declaration */}
                <div className="rec-form-section">
                  <h3 className="rec-form-section-title">
                    <span className="rec-section-num">५</span>
                    दरखास्त दस्तुर भुक्तानी तथा स्वघोषणा (Payment & Declaration)
                  </h3>

                  <div className="rec-form-grid-2">
                    <div className="rec-field-group">
                      <label className="rec-label">भुक्तानी माध्यम (Payment Method)</label>
                      <select
                        value={applyForm.paymentMethod}
                        onChange={(e) => setApplyForm({ ...applyForm, paymentMethod: e.target.value })}
                        className="rec-input-control"
                        style={{ cursor: 'pointer' }}
                      >
                        <option value="eSewa / Khalti / ConnectIPS">eSewa / Khalti / ConnectIPS</option>
                        <option value="गाउँपालिका राजस्व रसिद (Municipal Revenue Receipt)">गाउँपालिका राजस्व रसिद</option>
                        <option value="बैंक भौचर (Bank Voucher)">बैंक भौचर (नेपाल बैंक लि.)</option>
                      </select>
                    </div>

                    <div className="rec-field-group">
                      <label className="rec-label">भौचर / ट्रान्जेक्सन नम्बर</label>
                      <input
                        type="text"
                        placeholder="उदा: TXN-948201 वा रसिद नं"
                        value={applyForm.paymentVoucherNo}
                        onChange={(e) => setApplyForm({ ...applyForm, paymentVoucherNo: e.target.value })}
                        className="rec-input-control"
                        style={{ fontFamily: 'monospace', fontWeight: 600 }}
                      />
                    </div>
                  </div>

                  <div className="rec-declaration-box">
                    <input
                      type="checkbox"
                      id="agreeTerms"
                      checked={applyForm.agreeTerms}
                      onChange={(e) => setApplyForm({ ...applyForm, agreeTerms: e.target.checked })}
                      style={{ marginTop: '0.2rem', width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <label htmlFor="agreeTerms" className="rec-declaration-text" style={{ cursor: 'pointer' }}>
                      म प्रमाणित गर्दछु कि माथि उल्लिखित सम्पूर्ण विवरणहरू मेरो जानकारी र विश्वास अनुसार सत्य र सही छन्। कुनै विवरण झुट्ठा वा नक्कली ठहरिएमा प्रचलित कानून बमोजिम हुने कारबाही स्वीकार गर्न तयार छु।
                    </label>
                  </div>
                </div>

                {/* Form Submit Buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                  <button
                    type="button"
                    onClick={() => setActiveTab('vacancies')}
                    className="rec-btn rec-btn-outline"
                    style={{ color: '#334155', background: '#f1f5f9', borderColor: '#cbd5e1' }}
                  >
                    रद्द गर्नुहोस्
                  </button>
                  <button
                    type="submit"
                    disabled={submitApplicationMutation.isPending}
                    className="rec-btn rec-btn-primary"
                    style={{ padding: '0.75rem 1.75rem', fontSize: '0.9rem' }}
                  >
                    {submitApplicationMutation.isPending ? 'पेश गरिँदैछ...' : 'दरखास्त पेश गर्नुहोस् (Submit Application)'}
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      )}

      {/* 6. TAB 4: DIGITAL ADMIT CARD SEARCH & PRINT (डिजिटल प्रवेशपत्र) */}
      {activeTab === 'admitCard' && (
        <div className="rec-form-wrapper">
          {/* Search Box */}
          <div className="rec-admit-search-card">
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <QrCode size={22} color="#0284c7" />
              डिजिटल प्रवेशपत्र खोज तथा आवेदन स्थिति
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
              तपाईंको दरखास्त नम्बर (उदा: APP-2081-0001) वा नागरिकता नम्बर वा मोबाइल नम्बर प्रविष्ट गरी खोजी गर्नुहोस्।
            </p>

            <form onSubmit={handleSearchAdmitCard} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
              <input
                type="text"
                required
                placeholder="दरखास्त नं / नागरिकता नं / मोबाइल नं..."
                value={admitSearchQuery}
                onChange={(e) => setAdmitSearchQuery(e.target.value)}
                className="rec-input-control"
                style={{ flex: 1, minWidth: '240px', fontWeight: 600 }}
              />
              <button
                type="submit"
                disabled={isAdmitSearching}
                className="rec-btn rec-btn-primary"
              >
                {isAdmitSearching ? 'खोजी हुँदैछ...' : 'खोज्नुहोस्'}
                <Search size={16} />
              </button>
            </form>

            {admitSearchError && (
              <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', color: '#9f1239', padding: '0.75rem', borderRadius: '8px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                <AlertCircle size={16} color="#e11d48" />
                <span>{admitSearchError}</span>
              </div>
            )}
          </div>

          {/* Admit Card Result */}
          {admitCardResult && (
            <div>
              {/* Status Header */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ padding: '0.5rem', borderRadius: '8px', background: admitCardResult.is_admit_card_ready ? '#d1fae5' : '#fef3c7', color: admitCardResult.is_admit_card_ready ? '#059669' : '#d97706', display: 'flex' }}>
                    <CheckCircle size={22} />
                  </span>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                      {admitCardResult.is_admit_card_ready
                        ? 'प्रवेशपत्र जारी भएको छ (Admit Card Ready)'
                        : 'दरखास्त प्राप्त भएको (Under Review)'}
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      अवस्था: {admitCardResult.application.status}
                    </span>
                  </div>
                </div>

                {admitCardResult.is_admit_card_ready && (
                  <button onClick={() => window.print()} className="rec-btn rec-btn-primary">
                    <Printer size={16} />
                    प्रवेशपत्र प्रिन्ट गर्नुहोस् (Print)
                  </button>
                )}
              </div>

              {/* Printable Official Admit Card */}
              {admitCardResult.is_admit_card_ready ? (
                <div id="printable-admit-card" className="rec-admit-official-card">
                  <div className="rec-admit-watermark">
                    <FileCheck size={420} />
                  </div>

                  {/* Top Header */}
                  <div className="rec-admit-header">
                    <div className="rec-gov-emblem-box">
                      नेपाल सरकार
                    </div>
                    <div className="rec-admit-title-center">
                      <h2 className="rec-admit-title-main">पाँचपोखरी थाङपाल गाउँपालिका</h2>
                      <h3 className="rec-admit-sub-office">गाउँ कार्यपालिकाको कार्यालय, सिन्धुपाल्चोक</h3>
                      <p className="rec-admit-sub-province">बागमती प्रदेश, नेपाल</p>
                      <div className="rec-admit-ribbon">प्रवेशपत्र (ADMIT CARD)</div>
                    </div>
                    <div className="rec-photo-paste-box">
                      {admitCardResult.application.photoUrl || admitCardResult.application.photo_url ? (
                        <img
                          src={admitCardResult.application.photoUrl || admitCardResult.application.photo_url}
                          alt="उम्मेदवार फोटो"
                          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }}
                        />
                      ) : (
                        <>
                          <span>फोटो</span>
                          <span>टाँस्नुहोस्</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Content Grid */}
                  <div className="rec-admit-content-grid">
                    <div>
                      <div className="rec-admit-roll-banner">
                        <div>
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', display: 'block' }}>रोल नम्बर (Roll No.):</span>
                          <span className="rec-admit-roll-no">
                            {admitCardResult.application.admitCardRollNo ||
                              admitCardResult.application.admit_card_roll_no ||
                              'ROLL-2081-001'}
                          </span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', display: 'block' }}>दरखास्त नं:</span>
                          <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#334155', fontSize: '0.95rem' }}>
                            {admitCardResult.application.applicationNo ||
                              admitCardResult.application.application_no}
                          </span>
                        </div>
                      </div>

                      <table className="rec-admit-table">
                        <tbody>
                          <tr>
                            <td className="label-col">उम्मेदवारको नाम:</td>
                            <td className="val-col">
                              {admitCardResult.application.fullNameNp || admitCardResult.application.full_name_np}
                              {admitCardResult.application.fullNameEn && ` (${admitCardResult.application.fullNameEn})`}
                            </td>
                          </tr>
                          <tr>
                            <td className="label-col">विज्ञापन नं:</td>
                            <td className="val-col" style={{ color: '#0369a1' }}>
                              {admitCardResult.application.vacancyNo || admitCardResult.application.vacancy_no}
                            </td>
                          </tr>
                          <tr>
                            <td className="label-col">पद / सेवा / तह:</td>
                            <td className="val-col">
                              {admitCardResult.application.postTitle || admitCardResult.application.post_title}
                            </td>
                          </tr>
                          <tr>
                            <td className="label-col">नागरिकता नं र जिल्ला:</td>
                            <td className="val-col">
                              {admitCardResult.application.citizenshipNo || admitCardResult.application.citizenship_no} (
                              {admitCardResult.application.citizenshipDistrict || admitCardResult.application.citizenship_district})
                            </td>
                          </tr>
                          <tr>
                            <td className="label-col">स्थायी ठेगाना:</td>
                            <td className="val-col">
                              {admitCardResult.application.permanentAddress || admitCardResult.application.permanent_address}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* QR Code and Candidate Signature */}
                    <div className="rec-admit-qr-col">
                      <div>
                        <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          आधिकारिक QR प्रमाणीकरण
                        </span>
                        <div className="rec-qr-img-wrap">
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(
                              `Paanchpokhari e-Recruitment | Roll: ${
                                admitCardResult.application.admitCardRollNo ||
                                admitCardResult.application.admit_card_roll_no
                              } | Name: ${
                                admitCardResult.application.fullNameNp ||
                                admitCardResult.application.full_name_np
                              } | Post: ${
                                admitCardResult.application.postTitle ||
                                admitCardResult.application.post_title
                              }`
                            )}`}
                            alt="Admit Card QR"
                            style={{ width: '105px', height: '105px', display: 'block' }}
                          />
                        </div>
                      </div>

                      <div style={{ width: '100%', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #cbd5e1' }}>
                        <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>उम्मेदवारको हस्ताक्षर</span>
                        <div style={{ height: '32px', marginTop: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {admitCardResult.application.signatureUrl || admitCardResult.application.signature_url ? (
                            <img
                              src={admitCardResult.application.signatureUrl || admitCardResult.application.signature_url}
                              alt="हस्ताक्षर"
                              style={{ maxHeight: '30px', maxWidth: '100%', objectFit: 'contain' }}
                            />
                          ) : (
                            <div style={{ width: '100%', borderBottom: '1px dashed #94a3b8', height: '100%' }}></div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Exam Venue & Timing Box */}
                  <div className="rec-admit-exam-banner">
                    <div>
                      <span className="rec-exam-detail-title">परीक्षा केन्द्र (Exam Center):</span>
                      <div className="rec-exam-detail-val">
                        {admitCardResult.application.examCenter ||
                          admitCardResult.application.exam_center ||
                          'पाँचपोखरी थाङपाल मा.वि., वडा नं ६, सिन्धुपाल्चोक'}
                      </div>
                    </div>
                    <div>
                      <span className="rec-exam-detail-title">परीक्षा मिति तथा समय:</span>
                      <div className="rec-exam-detail-val rec-exam-time-val">
                        {admitCardResult.application.examDateTime ||
                          admitCardResult.application.exam_date_time ||
                          '२०८१/०६/१५ बिहान ११:०० बजे'}
                      </div>
                    </div>
                  </div>

                  {/* Rules & Instructions */}
                  <div className="rec-admit-instructions">
                    <strong style={{ color: '#0f172a' }}>परीक्षार्थीहरूका लागि आवश्यक निर्देशनहरू:</strong>
                    <ol>
                      <li>परीक्षा हलमा प्रवेश गर्दा यो प्रवेशपत्र र सक्कल नेपाली नागरिकताको प्रमाणपत्र अनिवार्य साथमा ल्याउनुपर्नेछ।</li>
                      <li>परीक्षा सुरु हुनुभन्दा कम्तीमा ३० मिनेट अगावै तोकिएको परीक्षा केन्द्रमा उपस्थित भइसक्नुपर्नेछ।</li>
                      <li>परीक्षा भवनभित्र मोबाइल फोन, स्मार्टवाच वा कुनै पनि विद्युतीय उपकरण लैजान पूर्ण निषेध गरिएको छ।</li>
                    </ol>
                  </div>

                  {/* Signatures */}
                  <div className="rec-admit-signatures">
                    <div style={{ textAlign: 'center' }}>
                      <div className="rec-sig-line"></div>
                      <span>उम्मेदवारको हस्ताक्षर</span>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div className="rec-sig-line"></div>
                      <span>पदपूर्ति समिति / प्रमुख प्रशासकीय अधिकृत</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '16px', padding: '2.5rem', textAlign: 'center' }}>
                  <Clock size={36} color="#d97706" style={{ margin: '0 auto 0.75rem auto' }} />
                  <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#92400e', margin: '0 0 0.4rem 0' }}>दरखास्त रुजु हुँदैछ</h4>
                  <p style={{ fontSize: '0.85rem', color: '#b45309', maxWidth: '500px', margin: '0 auto', lineHeight: 1.5 }}>
                    तपाईंको दरखास्त कार्यालयको रुजु डेस्कमा प्राप्त भइसकेको छ। सम्बन्धित शाखाबाट कागजात रुजु भई स्वीकृत भएपश्चात रोल नम्बर र प्रवेशपत्र स्वतः उपलब्ध हुनेछ।
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 7. MODAL 1: ADD VACANCY (नयाँ विज्ञापन प्रकाशन) */}
      {showAddVacancyModal && (
        <div className="rec-modal-backdrop">
          <div className="rec-modal-panel">
            <div className="rec-modal-header">
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Plus size={18} /> नयाँ कर्मचारी पदपूर्ति विज्ञापन आह्वान
              </h3>
              <button onClick={() => setShowAddVacancyModal(false)} style={{ background: 'transparent', border: 'none', color: '#cbd5e1', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createVacancyMutation.mutate(vacancyForm);
              }}
              style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}
            >
              <div className="rec-modal-body">
                <div className="rec-form-grid-2">
                  <div className="rec-field-group">
                    <label className="rec-label">विज्ञापन नं (Vacancy No)</label>
                    <input
                      type="text"
                      placeholder="उदा: ०६/२०८१/०८२ (खाली छाडे स्वतः बन्नेछ)"
                      value={vacancyForm.vacancyNo}
                      onChange={(e) => setVacancyForm({ ...vacancyForm, vacancyNo: e.target.value })}
                      className="rec-input-control"
                    />
                  </div>

                  <div className="rec-field-group">
                    <label className="rec-label">पदको नाम (Post Title) <span className="rec-req">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="उदा: सव-इन्जिनियर / रोजगार सहायक"
                      value={vacancyForm.title}
                      onChange={(e) => setVacancyForm({ ...vacancyForm, title: e.target.value })}
                      className="rec-input-control"
                    />
                  </div>

                  <div className="rec-field-group">
                    <label className="rec-label">सेवा / समूह</label>
                    <input
                      type="text"
                      value={vacancyForm.serviceGroup}
                      onChange={(e) => setVacancyForm({ ...vacancyForm, serviceGroup: e.target.value })}
                      className="rec-input-control"
                    />
                  </div>

                  <div className="rec-field-group">
                    <label className="rec-label">तह / श्रेणी (Level)</label>
                    <select
                      value={vacancyForm.level}
                      onChange={(e) => setVacancyForm({ ...vacancyForm, level: e.target.value })}
                      className="rec-input-control"
                    >
                      <option value="सहायक चौथो (4th Level)">सहायक चौथो (4th Level)</option>
                      <option value="सहायक पाँचौं (5th Level)">सहायक पाँचौं (5th Level)</option>
                      <option value="अधिकृत छैटौं (6th Level)">अधिकृत छैटौं (6th Level)</option>
                      <option value="श्रेणीविहीन (Unranked)">श्रेणीविहीन (Unranked)</option>
                    </select>
                  </div>

                  <div className="rec-field-group">
                    <label className="rec-label">माग पद संख्या</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={vacancyForm.openingsCount}
                      onChange={(e) => setVacancyForm({ ...vacancyForm, openingsCount: parseInt(e.target.value) || 1 })}
                      className="rec-input-control"
                    />
                  </div>

                  <div className="rec-field-group">
                    <label className="rec-label">दरखास्त दस्तुर (रु.)</label>
                    <input
                      type="number"
                      min="0"
                      step="50"
                      required
                      value={vacancyForm.applicationFee}
                      onChange={(e) => setVacancyForm({ ...vacancyForm, applicationFee: parseFloat(e.target.value) || 0 })}
                      className="rec-input-control"
                    />
                  </div>

                  <div className="rec-field-group">
                    <label className="rec-label">प्रकाशन मिति (वि.सं.)</label>
                    <NepaliDatePicker
                      value={vacancyForm.publishDateBs}
                      onChange={(val) => setVacancyForm({ ...vacancyForm, publishDateBs: val })}
                    />
                  </div>

                  <div className="rec-field-group">
                    <label className="rec-label">दरखास्त दिने अन्तिम मिति</label>
                    <NepaliDatePicker
                      value={vacancyForm.deadlineDateBs}
                      onChange={(val) => setVacancyForm({ ...vacancyForm, deadlineDateBs: val })}
                    />
                  </div>
                </div>

                <div className="rec-field-group">
                  <label className="rec-label">न्यूनतम आवश्यक शैक्षिक योग्यता <span className="rec-req">*</span></label>
                  <textarea
                    required
                    rows={2}
                    placeholder="उदा: मान्यता प्राप्त शिक्षण संस्थाबाट सम्बन्धित विषयमा प्रविणता प्रमाणपत्र तह..."
                    value={vacancyForm.minQualification}
                    onChange={(e) => setVacancyForm({ ...vacancyForm, minQualification: e.target.value })}
                    className="rec-input-control"
                  />
                </div>

                <div className="rec-field-group">
                  <label className="rec-label">थप विवरण तथा सर्तहरू</label>
                  <textarea
                    rows={2}
                    placeholder="उमेरको हद, दरखास्त साथ संलग्न गर्नुपर्ने कागजातहरू आदि..."
                    value={vacancyForm.description}
                    onChange={(e) => setVacancyForm({ ...vacancyForm, description: e.target.value })}
                    className="rec-input-control"
                  />
                </div>
              </div>

              <div className="rec-modal-footer">
                <button
                  type="button"
                  onClick={() => setShowAddVacancyModal(false)}
                  className="rec-btn rec-btn-outline"
                  style={{ color: '#334155', background: '#e2e8f0', borderColor: '#cbd5e1' }}
                >
                  रद्द
                </button>
                <button
                  type="submit"
                  disabled={createVacancyMutation.isPending}
                  className="rec-btn rec-btn-primary"
                >
                  {createVacancyMutation.isPending ? 'प्रकाशन हुँदैछ...' : 'विज्ञापन प्रकाशन गर्नुहोस्'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. MODAL 2: APPLICATION VERIFICATION & DECISION */}
      {showVerifyModal && selectedApp && (
        <div className="rec-modal-backdrop">
          <div className="rec-modal-panel">
            <div className="rec-modal-header" style={{ background: '#0f172a' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={18} color="#34d399" />
                दरखास्त रुजु तथा निर्णय (Application Verification)
              </h3>
              <button
                onClick={() => {
                  setShowVerifyModal(false);
                  setSelectedApp(null);
                }}
                style={{ background: 'transparent', border: 'none', color: '#cbd5e1', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                verifyMutation.mutate({
                  appId: selectedApp.id,
                  payload: verifyForm,
                });
              }}
              style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}
            >
              <div className="rec-modal-body">
                {/* Applicant Info Summary */}
                <div style={{ background: '#eff6ff', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid #bfdbfe', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>उम्मेदवार:</span>
                    <strong style={{ color: '#0f172a' }}>{selectedApp.fullNameNp || selectedApp.full_name_np}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>पद:</span>
                    <strong style={{ color: '#1e40af' }}>{selectedApp.postTitle || selectedApp.post_title}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>दरखास्त नं:</span>
                    <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#334155' }}>
                      {selectedApp.applicationNo || selectedApp.application_no}
                    </span>
                  </div>
                </div>

                {/* Attached Documents for Verification */}
                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#334155', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Paperclip size={14} color="#0284c7" />
                    संलग्न कागजातहरू (रुजु गर्नुहोस्):
                  </div>
                  {(() => {
                    const docs = [
                      { label: 'फोटो', url: selectedApp.photoUrl || selectedApp.photo_url },
                      { label: 'दस्तखत', url: selectedApp.signatureUrl || selectedApp.signature_url },
                      { label: 'नागरिकता', url: selectedApp.citizenshipDocUrl || selectedApp.citizenship_doc_url },
                      { label: 'शैक्षिक योग्यता', url: selectedApp.qualificationDocUrl || selectedApp.qualification_doc_url },
                      { label: 'काउन्सिल', url: selectedApp.councilDocUrl || selectedApp.council_doc_url },
                      { label: 'अनुभव', url: selectedApp.experienceDocUrl || selectedApp.experience_doc_url },
                      { label: 'राजस्व भौचर', url: selectedApp.paymentVoucherDocUrl || selectedApp.payment_voucher_doc_url },
                    ].filter(d => Boolean(d.url));

                    if (docs.length === 0) {
                      return <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>कागजात संलग्न गरिएको छैन ।</span>;
                    }

                    return (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                        {docs.map((d, idx) => (
                          <a
                            key={idx}
                            href={d.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontSize: '0.72rem',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '6px',
                              background: '#e0f2fe',
                              color: '#0369a1',
                              textDecoration: 'none',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              border: '1px solid #bae6fd'
                            }}
                          >
                            <ExternalLink size={12} />
                            {d.label}
                          </a>
                        ))}
                      </div>
                    );
                  })()}
                </div>

                <div className="rec-field-group">
                  <label className="rec-label">द्रुत निर्णय (Quick Decision) / अवस्था:</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => {
                        const roll = verifyForm.admitCardRollNo || `2081-ROLL-${String(Math.floor(Math.random() * 899) + 100)}`;
                        setVerifyForm({
                          ...verifyForm,
                          status: 'स्वीकृत (Approved)',
                          admitCardRollNo: roll,
                        });
                      }}
                      style={{
                        padding: '0.55rem 0.4rem',
                        borderRadius: '8px',
                        border: verifyForm.status.includes('स्वीकृत') ? '2px solid #059669' : '1px solid #cbd5e1',
                        background: verifyForm.status.includes('स्वीकृत') ? '#ecfdf5' : '#ffffff',
                        color: verifyForm.status.includes('स्वीकृत') ? '#065f46' : '#334155',
                        fontWeight: 800,
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.2rem'
                      }}
                    >
                      <span>✅ स्वीकृत (Approve)</span>
                      <span style={{ fontSize: '0.65rem', fontWeight: 600 }}>प्रवेशपत्र जारी</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setVerifyForm({ ...verifyForm, status: 'अस्वीकृत (Rejected)' })}
                      style={{
                        padding: '0.55rem 0.4rem',
                        borderRadius: '8px',
                        border: verifyForm.status.includes('अस्वीकृत') ? '2px solid #e11d48' : '1px solid #cbd5e1',
                        background: verifyForm.status.includes('अस्वीकृत') ? '#fff1f2' : '#ffffff',
                        color: verifyForm.status.includes('अस्वीकृत') ? '#9f1239' : '#334155',
                        fontWeight: 800,
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.2rem'
                      }}
                    >
                      <span>❌ अस्वीकृत (Reject)</span>
                      <span style={{ fontSize: '0.65rem', fontWeight: 600 }}>मापदण्ड नपुगेको</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setVerifyForm({ ...verifyForm, status: 'विचाराधीन (Pending)' })}
                      style={{
                        padding: '0.55rem 0.4rem',
                        borderRadius: '8px',
                        border: verifyForm.status.includes('विचाराधीन') ? '2px solid #d97706' : '1px solid #cbd5e1',
                        background: verifyForm.status.includes('विचाराधीन') ? '#fffbeb' : '#ffffff',
                        color: verifyForm.status.includes('विचाराधीन') ? '#92400e' : '#334155',
                        fontWeight: 800,
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.2rem'
                      }}
                    >
                      <span>⏳ विचाराधीन</span>
                      <span style={{ fontSize: '0.65rem', fontWeight: 600 }}>थप छानबिन</span>
                    </button>
                  </div>

                  <select
                    value={verifyForm.status}
                    onChange={(e) => setVerifyForm({ ...verifyForm, status: e.target.value })}
                    className="rec-input-control"
                    style={{ fontWeight: 700 }}
                  >
                    <option value="स्वीकृत (Approved)">स्वीकृत (Approved) — प्रवेशपत्र जारी गर्ने</option>
                    <option value="अस्वीकृत (Rejected)">अस्वीकृत (Rejected) — मापदण्ड नपुगेको</option>
                    <option value="विचाराधीन (Pending)">विचाराधीन (Pending) — थप छानबिन आवश्यक</option>
                  </select>
                </div>

                {verifyForm.status.includes('स्वीकृत') && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid #e2e8f0' }}>
                    <div className="rec-field-group">
                      <label className="rec-label">प्रवेशपत्र रोल नम्बर (Admit Card Roll No)</label>
                      <input
                        type="text"
                        required
                        value={verifyForm.admitCardRollNo}
                        onChange={(e) => setVerifyForm({ ...verifyForm, admitCardRollNo: e.target.value })}
                        className="rec-input-control"
                        style={{ fontFamily: 'monospace', fontWeight: 800, color: '#1e3a8a' }}
                      />
                    </div>

                    <div className="rec-field-group">
                      <label className="rec-label">परीक्षा केन्द्र (Exam Center)</label>
                      <input
                        type="text"
                        required
                        value={verifyForm.examCenter}
                        onChange={(e) => setVerifyForm({ ...verifyForm, examCenter: e.target.value })}
                        className="rec-input-control"
                      />
                    </div>

                    <div className="rec-field-group">
                      <label className="rec-label">परीक्षा मिति तथा समय</label>
                      <input
                        type="text"
                        value={verifyForm.examDateTime}
                        onChange={(e) => setVerifyForm({ ...verifyForm, examDateTime: e.target.value })}
                        className="rec-input-control"
                      />
                    </div>
                  </div>
                )}

                {verifyForm.status.includes('अस्वीकृत') && (
                  <div className="rec-field-group">
                    <label className="rec-label">अस्वीकृत गर्नुको कारण (Rejection Reason)</label>
                    <textarea
                      rows={2}
                      required
                      placeholder="उदा: न्यूनतम शैक्षिक योग्यता नपुगेको / राजस्व भौचर अस्पष्ट भएको..."
                      value={verifyForm.rejectionReason}
                      onChange={(e) => setVerifyForm({ ...verifyForm, rejectionReason: e.target.value })}
                      className="rec-input-control"
                    />
                  </div>
                )}
              </div>

              <div className="rec-modal-footer">
                <button
                  type="button"
                  onClick={() => {
                    setShowVerifyModal(false);
                    setSelectedApp(null);
                  }}
                  className="rec-btn rec-btn-outline"
                  style={{ color: '#334155', background: '#e2e8f0', borderColor: '#cbd5e1' }}
                >
                  रद्द
                </button>
                <button
                  type="submit"
                  disabled={verifyMutation.isPending}
                  className="rec-btn rec-btn-primary"
                >
                  {verifyMutation.isPending ? 'सुरक्षित गरिँदैछ...' : 'निर्णय सुरक्षित गर्नुहोस्'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 9. MODAL 3: FULL DETAIL PROFILE */}
      {showDetailModal && selectedApp && (
        <div className="rec-modal-backdrop">
          <div className="rec-modal-panel">
            <div className="rec-modal-header">
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UserCheck size={18} />
                दरखास्त विस्तृत प्रोफाइल: {selectedApp.applicationNo || selectedApp.application_no}
              </h3>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedApp(null);
                }}
                style={{ background: 'transparent', border: 'none', color: '#cbd5e1', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="rec-modal-body" style={{ fontSize: '0.82rem' }}>
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>उम्मेदवारको नाम:</span>
                  <strong style={{ color: '#0f172a' }}>{selectedApp.fullNameNp || selectedApp.full_name_np}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>English Name:</span>
                  <strong style={{ color: '#334155' }}>{selectedApp.fullNameEn || '-'}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>पद:</span>
                  <strong style={{ color: '#0284c7' }}>{selectedApp.postTitle || selectedApp.post_title}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>विज्ञापन नं:</span>
                  <strong style={{ color: '#334155' }}>{selectedApp.vacancyNo || selectedApp.vacancy_no}</strong>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.85rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', fontWeight: 800, color: '#1e293b' }}>सम्पर्क तथा ठेगाना:</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', color: '#475569' }}>
                  <div>फोन: {selectedApp.contactPhone || selectedApp.contact_phone}</div>
                  <div>इमेल: {selectedApp.email || '-'}</div>
                  <div>नागरिकता: {selectedApp.citizenshipNo || selectedApp.citizenship_no}</div>
                  <div>जिल्ला: {selectedApp.citizenshipDistrict || selectedApp.citizenship_district}</div>
                  <div style={{ gridColumn: 'span 2' }}>स्थायी ठेगाना: {selectedApp.permanentAddress || selectedApp.permanent_address}</div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.85rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', fontWeight: 800, color: '#1e293b' }}>शैक्षिक योग्यता तथा अनुभव:</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', color: '#475569' }}>
                  <div>उपाधि: {selectedApp.qualificationTitle || selectedApp.qualification_title}</div>
                  <div>बोर्ड: {selectedApp.boardUniversity || selectedApp.board_university}</div>
                  <div>उत्तीर्ण वर्ष: {selectedApp.passedYearBs || selectedApp.passed_year_bs}</div>
                  <div>श्रेणी/GPA: {selectedApp.divisionGpa || selectedApp.division_gpa}</div>
                  <div>काउन्सिल नं: {selectedApp.councilRegNo || selectedApp.council_reg_no || '-'}</div>
                  <div>अनुभव: {selectedApp.experienceYears || selectedApp.experience_years || 0} वर्ष</div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.85rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', fontWeight: 800, color: '#1e293b' }}>राजस्व भुक्तानी:</h4>
                <div style={{ background: '#f8fafc', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
                  <span>माध्यम: {selectedApp.paymentMethod || selectedApp.payment_method}</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#0369a1' }}>
                    भौचर: {selectedApp.paymentVoucherNo || selectedApp.payment_voucher_no || '-'}
                  </span>
                </div>
              </div>

              {/* Uploaded Documents Gallery */}
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.85rem' }}>
                <h4 style={{ margin: '0 0 0.65rem 0', fontSize: '0.85rem', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Paperclip size={16} color="#0284c7" />
                  संलग्न कागजातहरू तथा प्रमाणपत्रहरू (Uploaded Documents & Certificates):
                </h4>
                {(() => {
                  const docs = [
                    { label: 'पासपोर्ट साइजको फोटो', url: selectedApp.photoUrl || selectedApp.photo_url, isImg: true },
                    { label: 'उम्मेदवारको दस्तखत', url: selectedApp.signatureUrl || selectedApp.signature_url, isImg: true },
                    { label: 'नेपाली नागरिकता प्रमाणपत्र', url: selectedApp.citizenshipDocUrl || selectedApp.citizenship_doc_url },
                    { label: 'शैक्षिक प्रमाणपत्र / लब्धाङ्क', url: selectedApp.qualificationDocUrl || selectedApp.qualification_doc_url },
                    { label: 'काउन्सिल दर्ता प्रमाणपत्र', url: selectedApp.councilDocUrl || selectedApp.council_doc_url },
                    { label: 'कार्य अनुभव तथा तालिम', url: selectedApp.experienceDocUrl || selectedApp.experience_doc_url },
                    { label: 'राजस्व भुक्तानी भौचर / रसिद', url: selectedApp.paymentVoucherDocUrl || selectedApp.payment_voucher_doc_url },
                  ].filter(d => Boolean(d.url));

                  if (docs.length === 0) {
                    return (
                      <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', color: '#94a3b8', textAlign: 'center', fontSize: '0.78rem' }}>
                        कुनै पनि कागजात संलग्न गरिएको छैन ।
                      </div>
                    );
                  }

                  return (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.65rem' }}>
                      {docs.map((d, idx) => {
                        const isImage = d.isImg || /\.(png|jpe?g|webp|svg)$/i.test(d.url || '');
                        return (
                          <div
                            key={idx}
                            style={{
                              background: '#f8fafc',
                              border: '1px solid #e2e8f0',
                              borderRadius: '8px',
                              padding: '0.5rem',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.4rem'
                            }}
                          >
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {d.label}
                            </span>
                            <div
                              style={{
                                height: '90px',
                                background: '#ffffff',
                                borderRadius: '6px',
                                border: '1px solid #e2e8f0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden'
                              }}
                            >
                              {isImage ? (
                                <img
                                  src={d.url}
                                  alt={d.label}
                                  style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                                />
                              ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', color: '#e11d48' }}>
                                  <FileText size={28} />
                                  <span style={{ fontSize: '0.65rem', fontWeight: 800 }}>PDF FILE</span>
                                </div>
                              )}
                            </div>
                            <a
                              href={d.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rec-btn rec-btn-outline"
                              style={{
                                padding: '0.25rem 0.5rem',
                                fontSize: '0.7rem',
                                textAlign: 'center',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.35rem',
                                textDecoration: 'none',
                                borderColor: '#0284c7',
                                color: '#0284c7',
                                background: '#f0f9ff'
                              }}
                            >
                              <ExternalLink size={12} />
                              खोल्नुहोस् / हेर्नुहोस्
                            </a>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>

            <div className="rec-modal-footer">
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedApp(null);
                }}
                className="rec-btn rec-btn-primary"
              >
                बन्द गर्नुहोस्
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 10. MODAL 4: EDIT VACANCY MODAL */}
      {showEditVacancyModal && editingVacancy && (
        <div className="rec-modal-backdrop">
          <div className="rec-modal-panel">
            <div className="rec-modal-header">
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Pencil size={18} color="#facc15" />
                पदपूर्ति विज्ञापन सम्पादन: {editingVacancy.vacancyNo || editingVacancy.vacancy_no}
              </h3>
              <button
                onClick={() => {
                  setShowEditVacancyModal(false);
                  setEditingVacancy(null);
                }}
                style={{ background: 'transparent', border: 'none', color: '#cbd5e1', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateVacancyMutation.mutate({
                  id: editingVacancy.id || editingVacancy.vacancyNo || editingVacancy.vacancy_no || '',
                  data: editingVacancy
                });
              }}
              style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}
            >
              <div className="rec-modal-body">
                <div className="rec-form-grid-2">
                  <div className="rec-field-group">
                    <label className="rec-label">विज्ञापन नम्बर <span className="rec-req">*</span></label>
                    <input
                      type="text"
                      required
                      value={editingVacancy.vacancyNo || editingVacancy.vacancy_no || ''}
                      onChange={(e) => setEditingVacancy({ ...editingVacancy, vacancyNo: e.target.value, vacancy_no: e.target.value })}
                      className="rec-input-control"
                    />
                  </div>
                  <div className="rec-field-group">
                    <label className="rec-label">पदको नाम <span className="rec-req">*</span></label>
                    <input
                      type="text"
                      required
                      value={editingVacancy.title}
                      onChange={(e) => setEditingVacancy({ ...editingVacancy, title: e.target.value })}
                      className="rec-input-control"
                    />
                  </div>
                </div>

                <div className="rec-form-grid-3">
                  <div className="rec-field-group">
                    <label className="rec-label">सेवा / समूह</label>
                    <input
                      type="text"
                      value={editingVacancy.serviceGroup || editingVacancy.service_group || ''}
                      onChange={(e) => setEditingVacancy({ ...editingVacancy, serviceGroup: e.target.value, service_group: e.target.value })}
                      className="rec-input-control"
                    />
                  </div>
                  <div className="rec-field-group">
                    <label className="rec-label">तह / श्रेणी</label>
                    <input
                      type="text"
                      value={editingVacancy.level}
                      onChange={(e) => setEditingVacancy({ ...editingVacancy, level: e.target.value })}
                      className="rec-input-control"
                    />
                  </div>
                  <div className="rec-field-group">
                    <label className="rec-label">माग पद संख्या <span className="rec-req">*</span></label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={editingVacancy.openingsCount || editingVacancy.openings_count || 1}
                      onChange={(e) => setEditingVacancy({ ...editingVacancy, openingsCount: parseInt(e.target.value) || 1, openings_count: parseInt(e.target.value) || 1 })}
                      className="rec-input-control"
                    />
                  </div>
                </div>

                <div className="rec-form-grid-3">
                  <div className="rec-field-group">
                    <label className="rec-label">रोजगार प्रकार</label>
                    <input
                      type="text"
                      value={editingVacancy.employmentType || editingVacancy.employment_type || ''}
                      onChange={(e) => setEditingVacancy({ ...editingVacancy, employmentType: e.target.value, employment_type: e.target.value })}
                      className="rec-input-control"
                    />
                  </div>
                  <div className="rec-field-group">
                    <label className="rec-label">दरखास्त शुल्क (रु.)</label>
                    <input
                      type="number"
                      value={editingVacancy.applicationFee ?? (editingVacancy as any).application_fee ?? 500}
                      onChange={(e) => setEditingVacancy({ ...editingVacancy, applicationFee: parseFloat(e.target.value) || 0, application_fee: parseFloat(e.target.value) || 0 } as any)}
                      className="rec-input-control"
                    />
                  </div>
                  <div className="rec-field-group">
                    <label className="rec-label">विज्ञापन अवस्था (Status)</label>
                    <select
                      value={editingVacancy.status || 'खुला (Active)'}
                      onChange={(e) => setEditingVacancy({ ...editingVacancy, status: e.target.value })}
                      className="rec-input-control"
                      style={{ fontWeight: 700 }}
                    >
                      <option value="खुला (Active)">खुला (Active)</option>
                      <option value="म्याद सकिएको (Expired)">म्याद सकिएको (Expired)</option>
                      <option value="स्थगित (Suspended)">स्थगित (Suspended)</option>
                      <option value="रद्द (Cancelled)">रद्द (Cancelled)</option>
                    </select>
                  </div>
                </div>

                <div className="rec-field-group">
                  <label className="rec-label">न्यूनतम योग्यता</label>
                  <textarea
                    rows={2}
                    value={editingVacancy.minQualification || editingVacancy.min_qualification || ''}
                    onChange={(e) => setEditingVacancy({ ...editingVacancy, minQualification: e.target.value, min_qualification: e.target.value })}
                    className="rec-input-control"
                  />
                </div>

                <div className="rec-form-grid-3">
                  <div className="rec-field-group">
                    <label className="rec-label">प्रकाशन मिति (वि.सं.)</label>
                    <input
                      type="text"
                      value={editingVacancy.publishDateBs || editingVacancy.publish_date_bs || ''}
                      onChange={(e) => setEditingVacancy({ ...editingVacancy, publishDateBs: e.target.value, publish_date_bs: e.target.value })}
                      className="rec-input-control"
                    />
                  </div>
                  <div className="rec-field-group">
                    <label className="rec-label">अन्तिम मिति (वि.सं.)</label>
                    <input
                      type="text"
                      value={editingVacancy.deadlineDateBs || editingVacancy.deadline_date_bs || ''}
                      onChange={(e) => setEditingVacancy({ ...editingVacancy, deadlineDateBs: e.target.value, deadline_date_bs: e.target.value })}
                      className="rec-input-control"
                    />
                  </div>
                  <div className="rec-field-group">
                    <label className="rec-label">परीक्षा मिति तथा समय</label>
                    <input
                      type="text"
                      value={editingVacancy.examDateBs || editingVacancy.exam_date_bs || ''}
                      onChange={(e) => setEditingVacancy({ ...editingVacancy, examDateBs: e.target.value, exam_date_bs: e.target.value })}
                      className="rec-input-control"
                    />
                  </div>
                </div>
              </div>

              <div className="rec-modal-footer">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditVacancyModal(false);
                    setEditingVacancy(null);
                  }}
                  className="rec-btn rec-btn-outline"
                  style={{ color: '#334155', background: '#e2e8f0', borderColor: '#cbd5e1' }}
                >
                  रद्द
                </button>
                <button
                  type="submit"
                  disabled={updateVacancyMutation.isPending}
                  className="rec-btn rec-btn-primary"
                >
                  {updateVacancyMutation.isPending ? 'सुरक्षित गरिँदैछ...' : 'परिवर्तन सुरक्षित गर्नुहोस्'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 11. MODAL 5: EDIT APPLICATION MODAL */}
      {showEditAppModal && editingApp && (
        <div className="rec-modal-backdrop">
          <div className="rec-modal-panel">
            <div className="rec-modal-header">
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Pencil size={18} color="#38bdf8" />
                उम्मेदवार दरखास्त विवरण सम्पादन: {editingApp.applicationNo || editingApp.application_no}
              </h3>
              <button
                onClick={() => {
                  setShowEditAppModal(false);
                  setEditingApp(null);
                }}
                style={{ background: 'transparent', border: 'none', color: '#cbd5e1', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateAppMutation.mutate({
                  id: editingApp.id || editingApp.applicationNo || editingApp.application_no || '',
                  data: editingApp
                });
              }}
              style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}
            >
              <div className="rec-modal-body">
                <div style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span>पद: <strong style={{ color: '#0369a1' }}>{editingApp.postTitle || editingApp.post_title}</strong></span>
                  <span>विज्ञापन नं: <strong style={{ color: '#334155' }}>{editingApp.vacancyNo || editingApp.vacancy_no}</strong></span>
                </div>

                <div className="rec-form-grid-3">
                  <div className="rec-field-group">
                    <label className="rec-label">उम्मेदवारको नाम (नेपाली) <span className="rec-req">*</span></label>
                    <input
                      type="text"
                      required
                      value={editingApp.fullNameNp || editingApp.full_name_np || ''}
                      onChange={(e) => setEditingApp({ ...editingApp, fullNameNp: e.target.value, full_name_np: e.target.value })}
                      className="rec-input-control"
                    />
                  </div>
                  <div className="rec-field-group">
                    <label className="rec-label">Full Name (English)</label>
                    <input
                      type="text"
                      value={editingApp.fullNameEn || ''}
                      onChange={(e) => setEditingApp({ ...editingApp, fullNameEn: e.target.value.toUpperCase() })}
                      className="rec-input-control"
                    />
                  </div>
                  <div className="rec-field-group">
                    <label className="rec-label">लिङ्ग</label>
                    <select
                      value={editingApp.gender || 'पुरुष'}
                      onChange={(e) => setEditingApp({ ...editingApp, gender: e.target.value })}
                      className="rec-input-control"
                    >
                      <option value="पुरुष">पुरुष</option>
                      <option value="महिला">महिला</option>
                      <option value="अन्य">अन्य</option>
                    </select>
                  </div>
                </div>

                <div className="rec-form-grid-3">
                  <div className="rec-field-group">
                    <label className="rec-label">सम्पर्क फोन <span className="rec-req">*</span></label>
                    <input
                      type="text"
                      required
                      value={editingApp.contactPhone || editingApp.contact_phone || ''}
                      onChange={(e) => setEditingApp({ ...editingApp, contactPhone: e.target.value, contact_phone: e.target.value })}
                      className="rec-input-control"
                    />
                  </div>
                  <div className="rec-field-group">
                    <label className="rec-label">नागरिकता नम्बर <span className="rec-req">*</span></label>
                    <input
                      type="text"
                      required
                      value={editingApp.citizenshipNo || editingApp.citizenship_no || ''}
                      onChange={(e) => setEditingApp({ ...editingApp, citizenshipNo: e.target.value, citizenship_no: e.target.value })}
                      className="rec-input-control"
                    />
                  </div>
                  <div className="rec-field-group">
                    <label className="rec-label">नागरिकता जारी जिल्ला</label>
                    <input
                      type="text"
                      value={editingApp.citizenshipDistrict || editingApp.citizenship_district || ''}
                      onChange={(e) => setEditingApp({ ...editingApp, citizenshipDistrict: e.target.value, citizenship_district: e.target.value })}
                      className="rec-input-control"
                    />
                  </div>
                </div>

                <div className="rec-form-grid-2">
                  <div className="rec-field-group">
                    <label className="rec-label">स्थायी ठेगाना <span className="rec-req">*</span></label>
                    <input
                      type="text"
                      required
                      value={editingApp.permanentAddress || editingApp.permanent_address || ''}
                      onChange={(e) => setEditingApp({ ...editingApp, permanentAddress: e.target.value, permanent_address: e.target.value })}
                      className="rec-input-control"
                    />
                  </div>
                  <div className="rec-field-group">
                    <label className="rec-label">इमेल ठेगाना</label>
                    <input
                      type="email"
                      value={editingApp.email || ''}
                      onChange={(e) => setEditingApp({ ...editingApp, email: e.target.value })}
                      className="rec-input-control"
                    />
                  </div>
                </div>

                <div className="rec-form-grid-3">
                  <div className="rec-field-group">
                    <label className="rec-label">न्यूनतम योग्यता</label>
                    <input
                      type="text"
                      value={editingApp.qualificationTitle || editingApp.qualification_title || ''}
                      onChange={(e) => setEditingApp({ ...editingApp, qualificationTitle: e.target.value, qualification_title: e.target.value })}
                      className="rec-input-control"
                    />
                  </div>
                  <div className="rec-field-group">
                    <label className="rec-label">बोर्ड / विश्वविद्यालय</label>
                    <input
                      type="text"
                      value={editingApp.boardUniversity || editingApp.board_university || ''}
                      onChange={(e) => setEditingApp({ ...editingApp, boardUniversity: e.target.value, board_university: e.target.value })}
                      className="rec-input-control"
                    />
                  </div>
                  <div className="rec-field-group">
                    <label className="rec-label">उत्तीर्ण वर्ष (वि.सं.)</label>
                    <input
                      type="text"
                      value={editingApp.passedYearBs || editingApp.passed_year_bs || ''}
                      onChange={(e) => setEditingApp({ ...editingApp, passedYearBs: e.target.value, passed_year_bs: e.target.value })}
                      className="rec-input-control"
                    />
                  </div>
                </div>

                <div className="rec-form-grid-3">
                  <div className="rec-field-group">
                    <label className="rec-label">श्रेणी / GPA</label>
                    <input
                      type="text"
                      value={editingApp.divisionGpa || editingApp.division_gpa || ''}
                      onChange={(e) => setEditingApp({ ...editingApp, divisionGpa: e.target.value, division_gpa: e.target.value })}
                      className="rec-input-control"
                    />
                  </div>
                  <div className="rec-field-group">
                    <label className="rec-label">काउन्सिल दर्ता नं</label>
                    <input
                      type="text"
                      value={editingApp.councilRegNo || editingApp.council_reg_no || ''}
                      onChange={(e) => setEditingApp({ ...editingApp, councilRegNo: e.target.value, council_reg_no: e.target.value })}
                      className="rec-input-control"
                    />
                  </div>
                  <div className="rec-field-group">
                    <label className="rec-label">अनुभव (वर्ष)</label>
                    <input
                      type="number"
                      value={editingApp.experienceYears || editingApp.experience_years || 0}
                      onChange={(e) => setEditingApp({ ...editingApp, experienceYears: parseInt(e.target.value) || 0, experience_years: parseInt(e.target.value) || 0 })}
                      className="rec-input-control"
                    />
                  </div>
                </div>

                <div className="rec-form-grid-2">
                  <div className="rec-field-group">
                    <label className="rec-label">प्रवेशपत्र रोल नम्बर</label>
                    <input
                      type="text"
                      value={editingApp.admitCardRollNo || editingApp.admit_card_roll_no || ''}
                      onChange={(e) => setEditingApp({ ...editingApp, admitCardRollNo: e.target.value, admit_card_roll_no: e.target.value })}
                      className="rec-input-control"
                      style={{ fontFamily: 'monospace', fontWeight: 800 }}
                    />
                  </div>
                  <div className="rec-field-group">
                    <label className="rec-label">परीक्षा केन्द्र</label>
                    <input
                      type="text"
                      value={editingApp.examCenter || editingApp.exam_center || ''}
                      onChange={(e) => setEditingApp({ ...editingApp, examCenter: e.target.value, exam_center: e.target.value })}
                      className="rec-input-control"
                    />
                  </div>
                </div>
              </div>

              <div className="rec-modal-footer">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditAppModal(false);
                    setEditingApp(null);
                  }}
                  className="rec-btn rec-btn-outline"
                  style={{ color: '#334155', background: '#e2e8f0', borderColor: '#cbd5e1' }}
                >
                  रद्द
                </button>
                <button
                  type="submit"
                  disabled={updateAppMutation.isPending}
                  className="rec-btn rec-btn-primary"
                >
                  {updateAppMutation.isPending ? 'सुरक्षित गरिँदैछ...' : 'परिवर्तन सुरक्षित गर्नुहोस्'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecruitmentPage;
