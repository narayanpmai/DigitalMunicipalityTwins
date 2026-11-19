import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client';
import { NepaliDatePicker } from '../../components/common/NepaliDatePicker';
import * as XLSX from 'xlsx';
import QRCode from 'qrcode';
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
  LogIn,
  DollarSign,
  Receipt,
  Landmark,
  Wallet,
  ShieldAlert,
  History,
  Lock,
  ArrowLeft
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
  inclusiveGroupFee?: number;
  inclusive_group_fee?: number;
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
  inclusiveCategories?: string;
  inclusive_categories?: string;
  paymentMethod?: string;
  payment_method?: string;
  paymentVoucherNo?: string;
  payment_voucher_no?: string;
  paymentStatus?: string;
  payment_status?: string;
  receiptNo?: string;
  receipt_no?: string;
  paidAmount?: number;
  paid_amount?: number;
  paidAt?: string;
  paid_at?: string;
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
  paid_applications: number;
  unpaid_applications: number;
  total_revenue: number;
}

interface OfficialReceipt {
  receiptNo: string;
  applicationNo: string;
  transactionUuid: string;
  fullNameNp: string;
  fullNameEn?: string;
  postTitle: string;
  vacancyNo: string;
  citizenshipNo?: string;
  contactPhone: string;
  amount: number;
  feeBreakdown: {
    base_fee: number;
    inclusive_categories: string;
    inclusive_fee: number;
    total: number;
  };
  revenueTitle: string;
  gateway: string;
  paymentStatus: string;
  paidAt: string;
  verificationQr: string;
}

export const RecruitmentPage: React.FC = () => {
  const queryClient = useQueryClient();
  const location = useLocation();
  const navigate = useNavigate();

  // Detect whether page is public or admin
  const isPublicView = location.pathname === '/recruitment';

  // Active Tab: 'vacancies' | 'applications' | 'apply' | 'admitCard' | 'finance' | 'audit'
  const [activeTab, setActiveTab] = useState<'vacancies' | 'applications' | 'apply' | 'admitCard' | 'finance' | 'audit'>('vacancies');

  useEffect(() => {
    if (isPublicView && (activeTab === 'applications' || activeTab === 'finance' || activeTab === 'audit')) {
      setActiveTab('vacancies');
    }
  }, [isPublicView, activeTab]);

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
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

  // Official Receipt Modal
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<OfficialReceipt | null>(null);
  const [receiptQrDataUrl, setReceiptQrDataUrl] = useState<string>('');

  // Refund Modal
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundForm, setRefundForm] = useState({
    applicationNo: '',
    refundAmount: 0,
    reason: 'विज्ञापन रद्द वा दोहोरो भुक्तानी फिर्ता',
    bankInfo: ''
  });

  // Admit Card & Application Search
  const [admitSearchQuery, setAdmitSearchQuery] = useState('');
  const [admitCardResult, setAdmitCardResult] = useState<any>(null);
  const [isAdmitSearching, setIsAdmitSearching] = useState(false);
  const [admitSearchError, setAdmitSearchError] = useState('');

  // -------------------------------------------------------------
  // 5-STEP WIZARD STATE
  // -------------------------------------------------------------
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Apply Form
  const [applyForm, setApplyForm] = useState({
    vacancyId: '',
    vacancyNo: '',
    postTitle: '',
    baseFee: 500,
    inclusiveGroupFee: 200,
    selectedInclusive: ['खुला'] as string[],
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
    photoUrl: '',
    signatureUrl: '',
    citizenshipDocUrl: '',
    qualificationDocUrl: '',
    councilDocUrl: '',
    experienceDocUrl: '',
    paymentVoucherDocUrl: '',
    agreeTerms: false,
  });

  // Saved Application and Payment State
  const [savedDraftApp, setSavedDraftApp] = useState<Application | null>(null);
  const [selectedGateway, setSelectedGateway] = useState<'FONEPAY' | 'CONNECTIPS' | 'ESEWA' | 'KHALTI' | 'BANK_VOUCHER'>('FONEPAY');
  const [activePaymentTxn, setActivePaymentTxn] = useState<any>(null);
  const [dynamicQrUrl, setDynamicQrUrl] = useState<string>('');
  const [isInitiatingPayment, setIsInitiatingPayment] = useState(false);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [paymentTimerSeconds, setPaymentTimerSeconds] = useState(900); // 15 mins

  // File Upload State & Handlers
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  // New Vacancy Form
  const [vacancyForm, setVacancyForm] = useState({
    vacancyNo: '',
    title: '',
    serviceGroup: 'प्रशासन / प्राविधिक',
    level: 'सहायक पाँचौं (5th Level)',
    openingsCount: 1,
    employmentType: 'करार सेवा (Contract)',
    applicationFee: 500,
    inclusiveGroupFee: 200,
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

  // Calculate live application fee
  const calculatedFee = React.useMemo(() => {
    const base = Number(applyForm.baseFee || 500);
    const incFee = Number(applyForm.inclusiveGroupFee || 200);
    const extraCount = applyForm.selectedInclusive.filter(c => c !== 'खुला').length;
    return base + (extraCount * incFee);
  }, [applyForm.baseFee, applyForm.inclusiveGroupFee, applyForm.selectedInclusive]);

  // QR Code Generator Effect for NIMB Account 18301400000109
  useEffect(() => {
    const rawQr = activePaymentTxn?.qr_data || activePaymentTxn?.qrData || activePaymentTxn?.parameters?.qrData;
    const appNo = savedDraftApp?.applicationNo || savedDraftApp?.application_no || 'APP-2081-XXXX';
    const amountVal = Number(activePaymentTxn?.amount || calculatedFee || 1000).toFixed(2);

    // Standard EMVCo & Fonepay/NepalPay QR payload for NIMB
    const finalQrString = rawQr || `fonepay://pay?merchant=NIMB&bank=Nepal+Investment+Mega+Bank&account=18301400000109&name=GA+1.1+PANCHPOKHARI+THANGPAL+GA.PA.+AANTARIK+RAJASHO+KHATA&prn=${appNo}&amount=${amountVal}&remarks=Recruitment+Fee+${appNo}`;

    QRCode.toDataURL(finalQrString, {
      width: 260,
      margin: 1,
      color: { dark: '#0f172a', light: '#ffffff' }
    })
      .then(url => {
        setDynamicQrUrl(url);
      })
      .catch(err => {
        console.error('QR generation error:', err);
      });
  }, [activePaymentTxn, savedDraftApp, calculatedFee]);

// Payment Countdown Timer
useEffect(() => {
  let interval: any = null;
  if (wizardStep === 4 && activePaymentTxn && paymentTimerSeconds > 0) {
    interval = setInterval(() => {
      setPaymentTimerSeconds(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
  }
  return () => clearInterval(interval);
}, [wizardStep, activePaymentTxn, paymentTimerSeconds]);

// Document Upload Handler
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

const toggleInclusiveCategory = (cat: string) => {
  setApplyForm(prev => {
    const exists = prev.selectedInclusive.includes(cat);
    let updated: string[];
    if (exists) {
      updated = prev.selectedInclusive.filter(c => c !== cat);
      if (updated.length === 0) updated = ['खुला'];
    } else {
      updated = [...prev.selectedInclusive, cat];
    }
    return { ...prev, selectedInclusive: updated };
  });
};

// -------------------------------------------------------------
// REACT QUERY FETCH HOOKS
// -------------------------------------------------------------
// 1. Summary
const { data: summary, refetch: refetchSummary } = useQuery<RecruitmentSummary>({
  queryKey: ['recruitment-summary'],
  queryFn: async () => {
    const res: any = await api.get('/recruitment/summary');
    return res.data || res;
  },
});

// 2. Vacancies
const { data: vacancies = [], isLoading: isVacanciesLoading, refetch: refetchVacancies } = useQuery<Vacancy[]>({
  queryKey: ['recruitment-vacancies'],
  queryFn: async () => {
    const res: any = await api.get('/recruitment/vacancies');
    return res.data || res || [];
  },
});

// 3. Applications
const { data: applications = [], isLoading: isAppsLoading, refetch: refetchApps } = useQuery<Application[]>({
  queryKey: ['recruitment-applications'],
  queryFn: async () => {
    const res: any = await api.get('/recruitment/applications');
    return res.data || res || [];
  },
});

// 4. Reconciliation
const { data: reconciliation, refetch: refetchRecon } = useQuery<any>({
  queryKey: ['recruitment-reconciliation'],
  queryFn: async () => {
    const res: any = await api.get('/recruitment/admin/reconciliation');
    return res.data || res;
  },
  enabled: !isPublicView
});

// 5. Admin Payments
const { data: adminPayments = [], refetch: refetchPayments } = useQuery<any[]>({
  queryKey: ['recruitment-admin-payments'],
  queryFn: async () => {
    const res: any = await api.get('/recruitment/admin/payments');
    return res.data || res || [];
  },
  enabled: !isPublicView
});

// 6. Audit Logs
const { data: auditLogs = [], refetch: refetchAuditLogs } = useQuery<any[]>({
  queryKey: ['recruitment-audit-logs'],
  queryFn: async () => {
    const res: any = await api.get('/recruitment/admin/audit-logs');
    return res.data || res || [];
  },
  enabled: !isPublicView
});

// -------------------------------------------------------------
// WIZARD STEP NAVIGATION & SUBMISSION
// -------------------------------------------------------------
const handleProceedToStep2 = () => {
  if (!applyForm.vacancyId) {
    alert('कृपया विज्ञापन तथा पद छनोट गर्नुहोस्।');
    return;
  }
  setWizardStep(2);
};

const handleProceedToStep3 = () => {
  if (!applyForm.fullNameNp || !applyForm.contactPhone || !applyForm.citizenshipNo) {
    alert('कृपया उम्मेदवारको नाम (नेपालीमा), सम्पर्क मोबाइल नम्बर र नागरिकता नम्बर अनिवार्य भर्नुहोस्।');
    return;
  }
  setWizardStep(3);
};

// Submit Draft and proceed to Step 4 (Payment)
const handleProceedToPayment = async () => {
  if (!applyForm.agreeTerms) {
    alert('कृपया सर्त तथा स्वघोषणा मन्जुर गर्नुहोस्।');
    return;
  }
  if (!applyForm.photoUrl || !applyForm.signatureUrl || !applyForm.citizenshipDocUrl || !applyForm.qualificationDocUrl) {
    alert('कृपया अनिवार्य कागजातहरू (फोटो, दस्तखत, नागरिकता, न्यूनतम योग्यता प्रमाणपत्र) अपलोड गर्नुहोस्।');
    return;
  }

  try {
    const payload = {
      vacancyId: applyForm.vacancyId,
      vacancyNo: applyForm.vacancyNo,
      postTitle: applyForm.postTitle,
      fullNameNp: applyForm.fullNameNp,
      fullNameEn: applyForm.fullNameEn,
      dobBs: applyForm.dobBs,
      gender: applyForm.gender,
      citizenshipNo: applyForm.citizenshipNo,
      citizenshipDistrict: applyForm.citizenshipDistrict,
      contactPhone: applyForm.contactPhone,
      email: applyForm.email,
      permanentAddress: applyForm.permanentAddress,
      temporaryAddress: applyForm.temporaryAddress,
      qualificationTitle: applyForm.qualificationTitle,
      boardUniversity: applyForm.boardUniversity,
      passedYearBs: applyForm.passedYearBs,
      divisionGpa: applyForm.divisionGpa,
      councilRegNo: applyForm.councilRegNo,
      experienceYears: applyForm.experienceYears,
      inclusiveCategories: applyForm.selectedInclusive.join(', '),
      paymentMethod: selectedGateway,
      photoUrl: applyForm.photoUrl,
      signatureUrl: applyForm.signatureUrl,
      citizenshipDocUrl: applyForm.citizenshipDocUrl,
      qualificationDocUrl: applyForm.qualificationDocUrl,
      councilDocUrl: applyForm.councilDocUrl,
      experienceDocUrl: applyForm.experienceDocUrl,
      paymentVoucherDocUrl: applyForm.paymentVoucherDocUrl,
    };

    const res: any = await api.post('/recruitment/apply-draft', payload);
    const saved = res.data || res;
    setSavedDraftApp(saved);

    // Now immediately initiate payment for default gateway
    await handleInitiatePaymentForApp(saved.applicationNo || saved.application_no, selectedGateway);
    setWizardStep(4);
  } catch (err: any) {
    alert('दरखास्त ड्राफ्ट सेभ गर्न सकिएन: ' + (err?.response?.data?.detail || err.message));
  }
};

// Payment Initiation
const handleInitiatePaymentForApp = async (appNo: string, gateway: string) => {
  setIsInitiatingPayment(true);
  try {
    const res: any = await api.post('/recruitment/payment/initiate', {
      applicationNo: appNo,
      gateway: gateway
    });
    const data = res.data || res;
    setActivePaymentTxn(data);
    setPaymentTimerSeconds(900);
  } catch (err: any) {
    alert('भुक्तानी प्रारम्भ गर्न सकिएन: ' + (err?.response?.data?.detail || err.message));
  } finally {
    setIsInitiatingPayment(false);
  }
};

// Payment Verification
const handleVerifyPayment = async () => {
  if (!activePaymentTxn?.transaction_uuid && !activePaymentTxn?.transactionUuid) {
    alert('कुनै सक्रिय कारोबार फेला परेन।');
    return;
  }
  setIsVerifyingPayment(true);
  const txnId = activePaymentTxn.transaction_uuid || activePaymentTxn.transactionUuid;
  try {
    const res: any = await api.post('/recruitment/payment/verify', {
      transactionUuid: txnId,
      gateway: selectedGateway,
      mockAutoApprove: true
    });
    const data = res.data || res;
    if (data.success) {
      queryClient.invalidateQueries({ queryKey: ['recruitment-summary'] });
      queryClient.invalidateQueries({ queryKey: ['recruitment-applications'] });

      // Fetch Official Receipt
      const appNo = data.applicationNo || data.application_no;
      await handleFetchReceipt(appNo);
      setWizardStep(5);
    }
  } catch (err: any) {
    alert('भुक्तानी प्रमाणीकरण असफल भयो: ' + (err?.response?.data?.detail || err.message));
  } finally {
    setIsVerifyingPayment(false);
  }
};

// Fetch Official Receipt
const handleFetchReceipt = async (appNo: string) => {
  try {
    const res: any = await api.get(`/recruitment/receipt/${encodeURIComponent(appNo)}`);
    const rcpt: OfficialReceipt = res.data || res;
    setActiveReceipt(rcpt);
    if (rcpt.verificationQr) {
      QRCode.toDataURL(rcpt.verificationQr, { width: 140, margin: 1 }).then(setReceiptQrDataUrl);
    }
    setShowReceiptModal(true);
  } catch (err: any) {
    alert('रसिद लोड गर्न सकिएन: ' + (err?.response?.data?.detail || err.message));
  }
};

// Pay Pending / Retry Lookup
const handlePayPendingLookup = async (appNo: string) => {
  try {
    const res: any = await api.post(`/recruitment/payment/retry?applicationNo=${encodeURIComponent(appNo)}`);
    const data = res.data || res;
    if (data.already_paid) {
      await handleFetchReceipt(appNo);
    } else {
      setSavedDraftApp({
        ...data,
        applicationNo: data.application_no,
        fullNameNp: data.full_name,
        postTitle: data.post_title,
        vacancyNo: data.vacancy_no,
        paidAmount: data.amount,
      } as any);
      await handleInitiatePaymentForApp(data.application_no, 'FONEPAY');
      setActiveTab('apply');
      setWizardStep(4);
    }
  } catch (err: any) {
    alert('पुनः भुक्तानी प्रक्रिया सुरु गर्न सकिएन: ' + (err?.response?.data?.detail || err.message));
  }
};

// Vacancy Creation Mutation
const createVacancyMutation = useMutation({
  mutationFn: async (data: any) => {
    return await api.post('/recruitment/vacancies', data);
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['recruitment-vacancies'] });
    queryClient.invalidateQueries({ queryKey: ['recruitment-summary'] });
    setShowAddVacancyModal(false);
    alert('नयाँ पदपूर्ति विज्ञापन आह्वान सफलतापूर्वक सम्पन्न भयो!');
  },
  onError: (err: any) => {
    alert('विज्ञापन प्रकाशन असफल: ' + (err?.response?.data?.detail || err.message));
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

// Refund Mutation
const refundMutation = useMutation({
  mutationFn: async (payload: any) => {
    return await api.post('/recruitment/admin/refund', payload);
  },
  onSuccess: (res: any) => {
    queryClient.invalidateQueries({ queryKey: ['recruitment-applications'] });
    queryClient.invalidateQueries({ queryKey: ['recruitment-admin-payments'] });
    queryClient.invalidateQueries({ queryKey: ['recruitment-reconciliation'] });
    setShowRefundModal(false);
    alert(res.data?.message || 'रकम फिर्ता सफलतापूर्वक दर्ता भयो!');
  },
  onError: (err: any) => {
    alert('रकम फिर्ता असफल: ' + (err?.response?.data?.detail || err.message));
  }
});

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
    setAdmitSearchError(err?.response?.data?.detail || 'उल्लेखित विवरण अनुसार कुनै दरखास्त फेला परेन। कृपया विवरण रुजु गर्नुहोस्।');
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
    baseFee: Number(vac.applicationFee || (vac as any).application_fee || 500),
    inclusiveGroupFee: Number(vac.inclusiveGroupFee || (vac as any).inclusive_group_fee || 200),
    selectedInclusive: ['खुला']
  }));
  setWizardStep(1);
  setActiveTab('apply');
};

// Filtered Applications for Desk
const filteredApplications = applications.filter(a => {
  const q = searchTerm.toLowerCase();
  const fullName = (a.fullNameNp || a.full_name_np || '').toLowerCase();
  const appNo = (a.applicationNo || a.application_no || '').toLowerCase();
  const phone = a.contactPhone || a.contact_phone || '';
  const post = (a.postTitle || a.post_title || '').toLowerCase();
  const rcpt = (a.receiptNo || a.receipt_no || '').toLowerCase();

  const matchesSearch = !searchTerm || fullName.includes(q) || appNo.includes(q) || phone.includes(q) || post.includes(q) || rcpt.includes(q);

  const matchesStatus =
    statusFilter === 'all' ||
    (statusFilter === 'pending' && a.status.includes('विचाराधीन')) ||
    (statusFilter === 'approved' && a.status.includes('स्वीकृत')) ||
    (statusFilter === 'rejected' && a.status.includes('अस्वीकृत'));

  const matchesPayment =
    paymentFilter === 'all' ||
    (paymentFilter === 'paid' && (a.paymentStatus === 'PAID' || a.payment_status === 'PAID')) ||
    (paymentFilter === 'unpaid' && (a.paymentStatus === 'UNPAID' || a.payment_status === 'UNPAID' || !a.paymentStatus));

  const matchesVacancy =
    selectedVacancyFilter === 'all' ||
    a.vacancyId === selectedVacancyFilter ||
    a.vacancy_id === selectedVacancyFilter ||
    a.vacancyNo === selectedVacancyFilter ||
    a.vacancy_no === selectedVacancyFilter;

  return matchesSearch && matchesStatus && matchesPayment && matchesVacancy;
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
              : 'अनलाइन दरखास्त, भुक्तानी तथा कर्मचारी पदपूर्ति व्यवस्थापन प्रणाली'}
          </h1>
          <p className="rec-hero-desc">
            {isPublicView
              ? 'खुला विज्ञापन तथा पदहरू हेर्नुहोस्, ५-चरणको अनलाइन आवेदन फारम भर्नुहोस्, Fonepay QR/eSewa/ConnectIPS बाट तत्काल शुल्क तिरी डिजिटल रसिद र प्रवेशपत्र प्राप्त गर्नुहोस्।'
              : 'पाँचपोखरी थाङपाल गाउँ कार्यपालिका — रिक्त पदहरूमा विज्ञापन, डिजिटल राजस्व भुक्तानी रुजु, रोल नम्बर बाँडफाँड, परीक्षा केन्द्र तथा वित्तीय मेलमिलाप व्यवस्थापन।'}
          </p>
        </div>

        {/* Quick Action Buttons */}
        {isPublicView ? (
          <div className="rec-hero-actions">
            <button
              onClick={() => {
                setWizardStep(1);
                setActiveTab('apply');
              }}
              className="rec-btn rec-btn-hero-primary"
            >
              <Briefcase size={16} />
              <span>अनलाइन दरखास्त फारम (Apply Now)</span>
            </button>
            <a
              href="/HOW_TO_APPLY.html"
              target="_blank"
              rel="noopener noreferrer"
              className="rec-btn rec-btn-hero-guide"
            >
              <Sparkles size={16} />
              <span>दरखास्त कसरी दिने ? (सचित्र गाइड)</span>
            </a>
            <button
              onClick={() => setActiveTab('admitCard')}
              className="rec-btn rec-btn-hero-status"
            >
              <QrCode size={16} />
              <span>प्रवेशपत्र तथा आवेदन स्थिति</span>
            </button>
            <button
              onClick={() => navigate('/app/recruitment')}
              className="rec-btn rec-btn-hero-login"
            >
              <LogIn size={16} />
              <span>कार्यालय कर्मचारी लगइन</span>
            </button>
          </div>
        ) : (
          <div className="rec-hero-actions">
            <button
              onClick={() => window.open('/api/v1/recruitment/export-excel', '_blank')}
              className="rec-btn rec-btn-success"
            >
              <FileSpreadsheet size={16} />
              Excel रिपोर्ट
            </button>
            <button onClick={() => setShowAddVacancyModal(true)} className="rec-btn rec-btn-primary">
              <Plus size={16} />
              नयाँ विज्ञापन आह्वान
            </button>
            <a
              href="/HOW_TO_APPLY.html"
              target="_blank"
              rel="noopener noreferrer"
              className="rec-btn rec-btn-hero-guide"
            >
              <Sparkles size={16} />
              <span>सचित्र गाइड (Visual)</span>
            </a>
            <a
              href="/recruitment"
              target="_blank"
              rel="noopener noreferrer"
              className="rec-btn rec-btn-hero-login"
            >
              <Globe size={16} />
              <span>सार्वजनिक पोर्टल (Public View)</span>
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
            <span>शुल्क भुक्तानी सम्पन्न</span>
            <Receipt size={16} color="#34d399" />
          </div>
          <div className="rec-stat-value rec-stat-emerald">
            {summary?.paid_applications ?? 0}
          </div>
          <div className="rec-stat-sub rec-stat-emerald">रसिद जारी भएको</div>
        </div>

        <div className="rec-stat-card">
          <div className="rec-stat-label">
            <span>संकलित दस्तुर राजस्व</span>
            <DollarSign size={16} color="#a7f3d0" />
          </div>
          <div className="rec-stat-value rec-stat-sky">
            रु. {Number(summary?.total_revenue || 0).toLocaleString('ne-NP')}
          </div>
          <div className="rec-stat-sub" style={{ color: '#93c5fd' }}>राजस्व शीर्षक १४२२९</div>
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
      </div>
    </div>

    {/* 2. NAVIGATION TABS */}
    <div className={`rec-tabs-grid ${isPublicView ? 'rec-tabs-public' : 'rec-tabs-admin'}`}>
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
              {vacancies.filter(v => v.status.includes('खुला')).length} पदहरूमा दरखास्त खुला
            </div>
          </div>
        </div>
        <span className="rec-tab-pill-badge">{vacancies.length} पद</span>
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
              <div className="rec-tab-title">दरखास्त रुजु तथा पदपूर्ति</div>
              <div className="rec-tab-subtitle">
                छानबिन, स्वीकृत/अस्वीकृत तथा रोल नं
              </div>
            </div>
          </div>
          <span className="rec-tab-pill-badge">{applications.length} उम्मेदवार</span>
        </button>
      )}

      {/* Tab 3: Finance & Reconciliation (ADMIN ONLY) */}
      {!isPublicView && (
        <button
          onClick={() => setActiveTab('finance')}
          className={`rec-tab-card ${activeTab === 'finance' ? 'active-finance' : ''}`}
        >
          <div className="rec-tab-card-left">
            <div className="rec-tab-icon-box" style={{ background: '#ecfdf5', color: '#059669' }}>
              <Landmark size={22} />
            </div>
            <div className="rec-tab-text-group">
              <div className="rec-tab-title">वित्तीय तथा राजस्व मेलमिलाप</div>
              <div className="rec-tab-subtitle">
                Fonepay QR, eSewa, ConnectIPS
              </div>
            </div>
          </div>
          <span className="rec-tab-pill-badge" style={{ background: '#d1fae5', color: '#065f46' }}>
            राजस्व
          </span>
        </button>
      )}

      {/* Tab 4: Security Audit Logs (ADMIN ONLY) */}
      {!isPublicView && (
        <button
          onClick={() => setActiveTab('audit')}
          className={`rec-tab-card ${activeTab === 'audit' ? 'active-audit' : ''}`}
        >
          <div className="rec-tab-card-left">
            <div className="rec-tab-icon-box" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
              <History size={22} />
            </div>
            <div className="rec-tab-text-group">
              <div className="rec-tab-title">सुरक्षा तथा अडिट लग</div>
              <div className="rec-tab-subtitle">कारोबार तथा कर्मचारी कार्य लग</div>
            </div>
          </div>
          <span className="rec-tab-pill-badge" style={{ background: '#ede9fe', color: '#6d28d9' }}>
            Audit
          </span>
        </button>
      )}

      {/* Tab 5: 5-Step Online Apply Form */}
      <button
        onClick={() => {
          setWizardStep(1);
          setActiveTab('apply');
        }}
        className={`rec-tab-card ${activeTab === 'apply' ? 'active-apply' : ''}`}
      >
        <div className="rec-tab-card-left">
          <div className="rec-tab-icon-box">
            <FileText size={22} />
          </div>
          <div className="rec-tab-text-group">
            <div className="rec-tab-title">अनलाइन दरखास्त फारम</div>
            <div className="rec-tab-subtitle">५-चरणको डिजिटल आवेदन र QR पेमेन्ट</div>
          </div>
        </div>
        <span className="rec-tab-pill-badge">Apply Now</span>
      </button>

      {/* Tab 6: Digital Admit Card */}
      <button
        onClick={() => setActiveTab('admitCard')}
        className={`rec-tab-card ${activeTab === 'admitCard' ? 'active-admit' : ''}`}
      >
        <div className="rec-tab-card-left">
          <div className="rec-tab-icon-box">
            <QrCode size={22} />
          </div>
          <div className="rec-tab-text-group">
            <div className="rec-tab-title">प्रवेशपत्र तथा आवेदन स्थिति</div>
            <div className="rec-tab-subtitle">रसिद, प्रवेशपत्र र बाँकी शुल्क भुक्तानी</div>
          </div>
        </div>
        <span className="rec-tab-pill-badge">Admit Card</span>
      </button>
    </div>

    {/* ============================================================== */}
    {/* 3. TAB 1: VACANCIES (खुला विज्ञापन तथा पदहरू) */}
    {/* ============================================================== */}
    {activeTab === 'vacancies' && (
      <div>
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
            <Landmark size={15} color="#0284c7" />
            <span>डिजिटल भुक्तानी: Fonepay QR, ConnectIPS, eSewa, Khalti स्वीकृत</span>
          </div>
        </div>

        <div className="rec-vacancies-grid">
          {vacancies
            .filter(v => statusFilter === 'all' || v.status === statusFilter)
            .map((vac) => {
              const isActive = vac.status.includes('खुला');
              const openings = vac.openingsCount || vac.openings_count || 1;
              const fee = vac.applicationFee || vac.application_fee || 500;
              const incFee = vac.inclusiveGroupFee || (vac as any).inclusive_group_fee || 200;

              return (
                <div key={vac.id} className="rec-vacancy-card">
                  <div className="rec-vacancy-card-body">
                    <div className="rec-vacancy-header">
                      <span className="rec-vacancy-no">
                        विज्ञापन नं: {vac.vacancyNo || vac.vacancy_no}
                      </span>
                      <span className={isActive ? 'rec-badge-active' : 'rec-badge-closed'}>
                        <span className="rec-pulse-dot" />
                        {vac.status}
                      </span>
                    </div>

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

                    <div className="rec-vacancy-matrix">
                      <div className="rec-matrix-item">
                        <span className="rec-matrix-label">माग पद संख्या:</span>
                        <span className="rec-matrix-val rec-val-highlight">{openings} जना</span>
                      </div>
                      <div className="rec-matrix-item">
                        <span className="rec-matrix-label">आधार दरखास्त शुल्क:</span>
                        <span className="rec-matrix-val">रु. {fee} /-</span>
                      </div>
                      <div className="rec-matrix-item">
                        <span className="rec-matrix-label">समावेशी थप शुल्क:</span>
                        <span className="rec-matrix-val">रु. {incFee} / समूह</span>
                      </div>
                      <div className="rec-matrix-item">
                        <span className="rec-matrix-label">अन्तिम मिति:</span>
                        <span className="rec-matrix-val rec-val-deadline">{vac.deadlineDateBs || vac.deadline_date_bs}</span>
                      </div>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.25rem' }}>
                        न्यूनतम योग्यता:
                      </span>
                      <div className="rec-qual-box">
                        {vac.minQualification || vac.min_qualification}
                      </div>
                    </div>

                    {(vac.examDateBs || vac.exam_date_bs) && (
                      <div className="rec-exam-alert">
                        <Clock size={15} />
                        <span>परीक्षा मिति: {vac.examDateBs || vac.exam_date_bs}</span>
                      </div>
                    )}
                  </div>

                  <div className="rec-vacancy-card-footer">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => {
                          alert(`विज्ञापन नं: ${vac.vacancyNo || vac.vacancy_no}\nपद: ${vac.title}\nविवरण: ${vac.description || 'कुनै थप विवरण छैन।'}`);
                        }}
                        className="rec-btn rec-btn-outline"
                        style={{ color: '#334155', background: '#e2e8f0', borderColor: '#cbd5e1', fontSize: '0.78rem', padding: '0.4rem 0.75rem' }}
                      >
                        <Eye size={14} /> विवरण
                      </button>
                    </div>

                    {isActive ? (
                      <button
                        onClick={() => handleApplyToVacancy(vac)}
                        className="rec-btn rec-btn-primary"
                        style={{ fontSize: '0.78rem', padding: '0.45rem 0.9rem' }}
                      >
                        अनलाइन दरखास्त भर्नुहोस्
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

    {/* ============================================================== */}
    {/* 4. TAB 2: APPLICATIONS REVIEW (दरखास्त रुजु तथा पदपूर्ति डेस्क) */}
    {/* ============================================================== */}
    {activeTab === 'applications' && !isPublicView && (
      <div>
        <div className="rec-toolbar">
          <div className="rec-toolbar-group" style={{ flex: 1 }}>
            <div className="rec-input-search-wrapper">
              <Search size={16} className="rec-search-icon" />
              <input
                type="text"
                placeholder="उम्मेदवारको नाम, दरखास्त नं, रसिद नं वा फोन..."
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
              <option value="all">सबै निर्णय अवस्था</option>
              <option value="pending">विचाराधीन (Pending)</option>
              <option value="approved">स्वीकृत (Approved)</option>
              <option value="rejected">अस्वीकृत (Rejected)</option>
            </select>

            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="rec-select"
            >
              <option value="all">सबै भुक्तानी अवस्था</option>
              <option value="paid">✅ भुक्तानी सम्पन्न (PAID)</option>
              <option value="unpaid">⏳ भुक्तानी बाँकी (UNPAID)</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <button
              onClick={() => {
                refetchApps();
                refetchSummary();
              }}
              className="rec-btn rec-btn-outline"
              style={{ color: '#334155', background: '#f1f5f9', padding: '0.55rem' }}
              title="रिफ्रेस गर्नुहोस्"
            >
              <RefreshCw size={16} />
            </button>
            <button
              onClick={() => window.open('/api/v1/recruitment/export-excel', '_blank')}
              className="rec-btn rec-btn-success"
              style={{ fontSize: '0.8rem', padding: '0.55rem 0.95rem' }}
            >
              <Download size={15} />
              Excel डाउनलोड
            </button>
          </div>
        </div>

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
                  <th>दस्तुर भुक्तानी</th>
                  <th>रसिद नं</th>
                  <th style={{ textAlign: 'center' }}>निर्णय अवस्था</th>
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
                    const isPaid = (app.paymentStatus === 'PAID' || app.payment_status === 'PAID');

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
                          <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>समूह: {app.inclusiveCategories || app.inclusive_categories || 'खुला'}</div>
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
                            ना.नं: {app.citizenshipNo || app.citizenship_no}
                          </div>
                        </td>
                        <td>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '0.2rem 0.55rem',
                              borderRadius: '4px',
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              background: isPaid ? '#dcfce7' : '#fee2e2',
                              color: isPaid ? '#15803d' : '#b91c1c',
                              border: `1px solid ${isPaid ? '#86efac' : '#fca5a5'}`
                            }}
                          >
                            {isPaid ? 'PAID (रु. ' + (app.paidAmount || app.paid_amount || 0) + ')' : 'UNPAID'}
                          </span>
                          <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.2rem' }}>
                            {app.paymentMethod || app.payment_method}
                          </div>
                        </td>
                        <td>
                          {app.receiptNo || app.receipt_no ? (
                            <button
                              onClick={() => handleFetchReceipt(app.applicationNo || app.application_no)}
                              style={{
                                background: '#eff6ff',
                                border: '1px solid #bfdbfe',
                                color: '#1e40af',
                                padding: '0.2rem 0.45rem',
                                borderRadius: '4px',
                                fontSize: '0.72rem',
                                fontFamily: 'monospace',
                                fontWeight: 800,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem'
                              }}
                            >
                              <Receipt size={12} />
                              {app.receiptNo || app.receipt_no}
                            </button>
                          ) : (
                            <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>रसिद छैन</span>
                          )}
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
                            <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.72rem' }}>रोल नं तोकिएको छैन</span>
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
                              title="पूर्ण विवरण तथा कागजात हेर्नुहोस्"
                            >
                              <Eye size={15} />
                            </button>

                            <button
                              onClick={() => {
                                setSelectedApp(app);
                                setVerifyForm({
                                  status: app.status.includes('स्वीकृत') ? app.status : 'स्वीकृत (Approved)',
                                  rejectionReason: app.rejectionReason || app.rejection_reason || '',
                                  admitCardRollNo: app.admitCardRollNo || app.admit_card_roll_no || `2081-ROLL-${String(Math.floor(Math.random() * 899) + 100)}`,
                                  examCenter: app.examCenter || app.exam_center || 'पाँचपोखरी थाङपाल मा.वि., वडा नं ६, सिन्धुपाल्चोक',
                                  examDateTime: app.examDateTime || app.exam_date_time || '२०८१/०६/१५ बिहान ११:०० बजे',
                                });
                                setShowVerifyModal(true);
                              }}
                              className="rec-icon-btn rec-icon-btn-verify"
                              title="रुजु तथा निर्णय गर्नुहोस्"
                            >
                              <ShieldCheck size={15} />
                            </button>

                            {isPaid && (
                              <button
                                onClick={() => handleFetchReceipt(app.applicationNo || app.application_no)}
                                className="rec-icon-btn rec-icon-btn-print"
                                title="विद्युतीय राजस्व रसिद हेर्नुहोस्"
                                style={{ background: '#ecfdf5', color: '#059669', borderColor: '#a7f3d0' }}
                              >
                                <Receipt size={15} />
                              </button>
                            )}
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

    {/* ============================================================== */}
    {/* 5. TAB 3: FINANCE & RECONCILIATION DESK (ADMIN ONLY) */}
    {/* ============================================================== */}
    {activeTab === 'finance' && !isPublicView && (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Summary KPI Cards */}
        <div className="rec-stats-grid">
          <div className="rec-stat-card">
            <div className="rec-stat-label">
              <span>कुल संकलित राजस्व</span>
              <DollarSign size={16} color="#34d399" />
            </div>
            <div className="rec-stat-value rec-stat-emerald">
              रु. {Number(reconciliation?.total_collected || 0).toLocaleString('ne-NP')}
            </div>
            <div className="rec-stat-sub rec-stat-emerald">सफल कारोबार</div>
          </div>

          <div className="rec-stat-card">
            <div className="rec-stat-label">
              <span>कुल फिर्ता रकम (Refunded)</span>
              <History size={16} color="#f87171" />
            </div>
            <div className="rec-stat-value" style={{ color: '#dc2626' }}>
              रु. {Number(reconciliation?.total_refunded || 0).toLocaleString('ne-NP')}
            </div>
            <div className="rec-stat-sub" style={{ color: '#ef4444' }}>रद्द/फिर्ता कारोबार</div>
          </div>

          <div className="rec-stat-card">
            <div className="rec-stat-label">
              <span>खुद जम्मा रकम (Net Revenue)</span>
              <Landmark size={16} color="#38bdf8" />
            </div>
            <div className="rec-stat-value rec-stat-sky">
              रु. {Number(reconciliation?.net_revenue || 0).toLocaleString('ne-NP')}
            </div>
            <div className="rec-stat-sub" style={{ color: '#38bdf8' }}>पालिका सञ्चित कोष दाखिला</div>
          </div>
        </div>

        {/* Breakdown by Gateway */}
        <div className="rec-table-card" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CreditCard size={18} color="#0284c7" />
            भुक्तानी गेटवे अनुसार राजस्व संकलन विवरण (Gateway Breakdown)
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {(reconciliation?.by_gateway || []).map((gw: any, idx: number) => (
              <div key={idx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>{gw.gateway}</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', marginTop: '0.2rem' }}>
                  रु. {Number(gw.total || 0).toLocaleString('ne-NP')}
                </div>
                <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 600 }}>{gw.count} कारोबार</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Payments Table */}
        <div className="rec-table-card">
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
              हालसालैका सम्पूर्ण डिजिटल कारोबार अभिलेख (All Transactions)
            </h3>
            <button
              onClick={() => {
                refetchPayments();
                refetchRecon();
              }}
              className="rec-btn rec-btn-outline"
              style={{ padding: '0.4rem 0.75rem', fontSize: '0.78rem' }}
            >
              <RefreshCw size={13} /> रिफ्रेस
            </button>
          </div>
          <div className="rec-table-responsive">
            <table className="rec-table">
              <thead>
                <tr>
                  <th>कारोबार संकेत (Txn UUID)</th>
                  <th>दरखास्त नं</th>
                  <th>गेटवे</th>
                  <th>रकम (रु.)</th>
                  <th>स्थिति (Status)</th>
                  <th>मिति तथा समय</th>
                  <th>कार्य</th>
                </tr>
              </thead>
              <tbody>
                {adminPayments.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                      कुनै कारोबार फेला परेन।
                    </td>
                  </tr>
                ) : (
                  adminPayments.map((p: any) => (
                    <tr key={p.id}>
                      <td style={{ fontFamily: 'monospace', fontWeight: 800, color: '#1e3a8a' }}>
                        {p.transaction_uuid}
                      </td>
                      <td>
                        <span className="rec-app-no-badge">{p.application_no}</span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700 }}>{p.gateway}</span>
                      </td>
                      <td style={{ fontWeight: 800, color: '#059669' }}>
                        रु. {Number(p.amount).toLocaleString('ne-NP')}
                      </td>
                      <td>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            background: p.status === 'SUCCESS' ? '#dcfce7' : p.status === 'REFUNDED' ? '#fee2e2' : '#fef3c7',
                            color: p.status === 'SUCCESS' ? '#15803d' : p.status === 'REFUNDED' ? '#b91c1c' : '#d97706'
                          }}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {new Date(p.created_at).toLocaleString('ne-NP')}
                      </td>
                      <td>
                        {p.status === 'SUCCESS' && (
                          <button
                            onClick={() => {
                              setRefundForm({
                                applicationNo: p.application_no,
                                refundAmount: Number(p.amount),
                                reason: 'विज्ञापन रद्द वा दोहोरो भुक्तानी फिर्ता',
                                bankInfo: ''
                              });
                              setShowRefundModal(true);
                            }}
                            className="rec-btn-sm rec-btn-sm-delete"
                            title="रकम फिर्ता प्रक्रिया सुरु गर्नुहोस्"
                          >
                            फिर्ता (Refund)
                          </button>
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

    {/* ============================================================== */}
    {/* 6. TAB 4: SECURITY AUDIT LOGS (ADMIN ONLY) */}
    {/* ============================================================== */}
    {activeTab === 'audit' && !isPublicView && (
      <div className="rec-table-card">
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
              अपरिवर्तनीय सुरक्षा तथा वित्तीय अडिट लग (Security Audit Trail)
            </h3>
            <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0.2rem 0 0 0' }}>
              उम्मेदवार दरखास्त दर्ता, भुक्तानी प्रमाणीकरण र प्रशासनिक निर्णयहरूको पूर्ण समय-तालिका
            </p>
          </div>
          <button
            onClick={() => refetchAuditLogs()}
            className="rec-btn rec-btn-outline"
            style={{ padding: '0.4rem 0.75rem', fontSize: '0.78rem' }}
          >
            <RefreshCw size={13} /> रिफ्रेस
          </button>
        </div>
        <div className="rec-table-responsive">
          <table className="rec-table">
            <thead>
              <tr>
                <th>मिति तथा समय</th>
                <th>इकाइ (Entity)</th>
                <th>कार्य (Action)</th>
                <th>सञ्चालक (Actor)</th>
                <th>IP ठेगाना</th>
                <th>विस्तृत विवरण</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                    कुनै अडिट लग फेला परेन।
                  </td>
                </tr>
              ) : (
                auditLogs.map((log: any) => (
                  <tr key={log.id}>
                    <td style={{ fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                      {new Date(log.created_at || log.createdAt).toLocaleString('ne-NP')}
                    </td>
                    <td>
                      <span style={{ fontWeight: 800, color: '#1e3a8a', fontSize: '0.75rem' }}>
                        {log.entity_type || log.entityType}
                      </span>
                    </td>
                    <td>
                      <span style={{ background: '#f1f5f9', padding: '0.2rem 0.45rem', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700 }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                      {log.performed_by || log.performedBy}
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#64748b' }}>
                      {log.ip_address || log.ipAddress || '-'}
                    </td>
                    <td style={{ fontSize: '0.78rem', color: '#334155' }}>
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    )}

    {/* ============================================================== */}
    {/* 7. TAB 5: 5-STEP ONLINE APPLY WIZARD (नागरिक खुला दरखास्त) */}
    {/* ============================================================== */}
    {activeTab === 'apply' && (
      <div className="rec-form-wrapper">
        {/* Step Wizard Navigation Header */}
        <div className="rec-wizard-nav">
          <div
            onClick={() => wizardStep > 1 && setWizardStep(1)}
            className={`rec-wizard-step ${wizardStep === 1 ? 'active' : ''} ${wizardStep > 1 ? 'completed' : ''}`}
          >
            <div className="rec-step-circle">१</div>
            <div className="rec-step-info">
              <span className="rec-step-title">विज्ञापन तथा पद</span>
              <span className="rec-step-desc">समावेशी समूह र शुल्क</span>
            </div>
          </div>

          <ChevronRight size={16} color="#cbd5e1" />

          <div
            onClick={() => wizardStep > 2 && setWizardStep(2)}
            className={`rec-wizard-step ${wizardStep === 2 ? 'active' : ''} ${wizardStep > 2 ? 'completed' : ''}`}
          >
            <div className="rec-step-circle">२</div>
            <div className="rec-step-info">
              <span className="rec-step-title">व्यक्तिगत विवरण</span>
              <span className="rec-step-desc">नाम, नागरिकता, ठेगाना</span>
            </div>
          </div>

          <ChevronRight size={16} color="#cbd5e1" />

          <div
            onClick={() => wizardStep > 3 && setWizardStep(3)}
            className={`rec-wizard-step ${wizardStep === 3 ? 'active' : ''} ${wizardStep > 3 ? 'completed' : ''}`}
          >
            <div className="rec-step-circle">३</div>
            <div className="rec-step-info">
              <span className="rec-step-title">योग्यता र कागजात</span>
              <span className="rec-step-desc">फोटो, दस्तखत, प्रमाणपत्र</span>
            </div>
          </div>

          <ChevronRight size={16} color="#cbd5e1" />

          <div
            onClick={() => wizardStep > 4 && setWizardStep(4)}
            className={`rec-wizard-step ${wizardStep === 4 ? 'active' : ''} ${wizardStep > 4 ? 'completed' : ''}`}
          >
            <div className="rec-step-circle">४</div>
            <div className="rec-step-info">
              <span className="rec-step-title">डिजिटल भुक्तानी</span>
              <span className="rec-step-desc">Fonepay QR / eSewa</span>
            </div>
          </div>

          <ChevronRight size={16} color="#cbd5e1" />

          <div className={`rec-wizard-step ${wizardStep === 5 ? 'active' : ''} ${wizardStep === 5 ? 'completed' : ''}`}>
            <div className="rec-step-circle">५</div>
            <div className="rec-step-info">
              <span className="rec-step-title">रसिद तथा प्रवेशपत्र</span>
              <span className="rec-step-desc">दर्ता पुष्टिकरण</span>
            </div>
          </div>
        </div>

        {/* STEP 1: Vacancy & Category Selection */}
        {wizardStep === 1 && (
          <div className="rec-form-card">
            <div className="rec-form-header">
              <Briefcase size={28} color="#7dd3fc" />
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>चरण १: विज्ञापन तथा पद छनोट</h3>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', opacity: 0.9 }}>
                  तपाईंले आवेदन दिन चाहेको रिक्त पद र समूह छनोट गर्नुहोस्।
                </p>
              </div>
            </div>

            <div className="rec-form-body">
              <div className="rec-field-group">
                <label className="rec-label">
                  खुला विज्ञापन तथा पद छनोट गर्नुहोस् <span className="rec-req">*</span>
                </label>
                <select
                  value={applyForm.vacancyId}
                  onChange={(e) => {
                    const vId = e.target.value;
                    const selected = vacancies.find(v => v.id === vId);
                    setApplyForm(prev => ({
                      ...prev,
                      vacancyId: vId,
                      vacancyNo: selected ? (selected.vacancyNo || selected.vacancy_no || '') : '',
                      postTitle: selected ? selected.title : '',
                      baseFee: Number(selected?.applicationFee || (selected as any)?.application_fee || 500),
                      inclusiveGroupFee: Number(selected?.inclusiveGroupFee || (selected as any)?.inclusive_group_fee || 200)
                    }));
                  }}
                  className="rec-input-control"
                  style={{ fontWeight: 700 }}
                >
                  <option value="">-- विज्ञापन तथा पद चयन गर्नुहोस् --</option>
                  {vacancies.filter(v => v.status.includes('खुला')).map(v => (
                    <option key={v.id} value={v.id}>
                      {v.title} — वि.नं. {v.vacancyNo || v.vacancy_no} ({v.level}) — शुल्क: रु. {v.applicationFee || 500}
                    </option>
                  ))}
                </select>
              </div>

              {applyForm.vacancyId && (
                <div style={{ marginTop: '1.5rem', background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <label className="rec-label" style={{ fontSize: '0.9rem' }}>
                    समावेशी समूह छनोट गर्नुहोस् (लागू हुने समूहमा चिन्ह लगाउनुहोस्):
                  </label>
                  <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0.2rem 0 0.75rem 0' }}>
                    आधारभूत शुल्कमा प्रत्येक अतिरिक्त समावेशी समूहका लागि रु. {applyForm.inclusiveGroupFee} थप हुनेछ।
                  </p>

                  <div className="rec-inclusive-grid">
                    {['खुला', 'महिला', 'आदिवासी / जनजाति', 'मधेशी', 'दलित', 'अपाङ्गता भएको', 'पिछडिएको क्षेत्र'].map(cat => {
                      const isSelected = applyForm.selectedInclusive.includes(cat);
                      return (
                        <div
                          key={cat}
                          onClick={() => toggleInclusiveCategory(cat)}
                          className={`rec-inclusive-card ${isSelected ? 'selected' : ''}`}
                        >
                          <input type="checkbox" checked={isSelected} readOnly />
                          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e293b' }}>{cat}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px dashed #cbd5e1' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>
                      कुल निर्धारण भएको दरखास्त दस्तुर:
                    </span>
                    <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#15803d' }}>
                      रु. {calculatedFee.toLocaleString('ne-NP')} /-
                    </span>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button onClick={handleProceedToStep2} className="rec-btn rec-btn-primary">
                  अर्को चरण (व्यक्तिगत विवरण)
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Personal Details */}
        {wizardStep === 2 && (
          <div className="rec-form-card">
            <div className="rec-form-header">
              <Users size={28} color="#7dd3fc" />
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>चरण २: उम्मेदवारको व्यक्तिगत विवरण</h3>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', opacity: 0.9 }}>
                  नागरिकता प्रमाणपत्र अनुसार आफ्नो शुद्ध व्यक्तिगत विवरण प्रविष्ट गर्नुहोस्।
                </p>
              </div>
            </div>

            <div className="rec-form-body">
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
                    मोबाइल नम्बर (SMS तथा प्रवेशपत्रका लागि) <span className="rec-req">*</span>
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

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                <button onClick={() => setWizardStep(1)} className="rec-btn rec-btn-outline">
                  <ArrowLeft size={16} /> अघिल्लो चरण
                </button>
                <button onClick={handleProceedToStep3} className="rec-btn rec-btn-primary">
                  अर्को चरण (योग्यता र कागजात)
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Academic & Documents Upload */}
        {wizardStep === 3 && (
          <div className="rec-form-card">
            <div className="rec-form-header">
              <Award size={28} color="#7dd3fc" />
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>चरण ३: शैक्षिक योग्यता तथा कागजात अपलोड</h3>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', opacity: 0.9 }}>
                  न्यूनतम योग्यता विवरण र प्रष्ट बुझिने कागजातहरू (JPG, PNG वा PDF, अधिकतम १५ MB) अपलोड गर्नुहोस्।
                </p>
              </div>
            </div>

            <div className="rec-form-body">
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
                    placeholder="CTEVT / त्रिभुवन विश्वविद्यालय"
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
                    placeholder="प्रथम श्रेणी / 3.4 GPA"
                    value={applyForm.divisionGpa}
                    onChange={(e) => setApplyForm({ ...applyForm, divisionGpa: e.target.value })}
                    className="rec-input-control"
                  />
                </div>

                <div className="rec-field-group">
                  <label className="rec-label">काउन्सिल दर्ता नं (लागू भएमा)</label>
                  <input
                    type="text"
                    placeholder="NEC / NNC दर्ता नं"
                    value={applyForm.councilRegNo}
                    onChange={(e) => setApplyForm({ ...applyForm, councilRegNo: e.target.value })}
                    className="rec-input-control"
                  />
                </div>

                <div className="rec-field-group">
                  <label className="rec-label">सम्बन्धित अनुभव (वर्ष)</label>
                  <input
                    type="number"
                    min="0"
                    value={applyForm.experienceYears}
                    onChange={(e) => setApplyForm({ ...applyForm, experienceYears: parseInt(e.target.value) || 0 })}
                    className="rec-input-control"
                  />
                </div>
              </div>

              <div style={{ marginTop: '1.5rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Paperclip size={18} color="#0284c7" />
                  आवश्यक कागजातहरू अपलोड गर्नुहोस्:
                </h4>

                <div className="rec-doc-upload-grid">
                  {/* 1. Photo */}
                  <div className={`rec-doc-box ${applyForm.photoUrl ? 'has-file' : ''}`}>
                    <div className="rec-doc-header">
                      <div className="rec-doc-icon-badge">
                        {applyForm.photoUrl ? <CheckCircle2 size={20} color="#059669" /> : <ImageIcon size={18} />}
                      </div>
                      <div className="rec-doc-info">
                        <h4 className="rec-doc-title">पासपोर्ट साइजको फोटो <span className="rec-req">*</span></h4>
                        <p className="rec-doc-subtitle">हालसालै खिचिएको प्रष्ट फोटो</p>
                      </div>
                    </div>
                    {applyForm.photoUrl ? (
                      <div className="rec-doc-preview-area">
                        <img src={applyForm.photoUrl} alt="Photo" className="rec-doc-thumb-img" />
                        <div className="rec-doc-actions">
                          <a href={applyForm.photoUrl} target="_blank" rel="noopener noreferrer" className="rec-doc-view-btn">हेर्नुहोस्</a>
                          <button type="button" onClick={() => handleRemoveFile('photoUrl')} className="rec-doc-remove-btn">हटाउनुहोस्</button>
                        </div>
                      </div>
                    ) : (
                      <label className="rec-doc-upload-trigger">
                        <UploadCloud size={16} /> <span>फोटो छनोट गर्नुहोस्</span>
                        <input type="file" accept="image/*" onChange={(e) => handleFileUpload('photoUrl', e)} style={{ display: 'none' }} />
                      </label>
                    )}
                  </div>

                  {/* 2. Signature */}
                  <div className={`rec-doc-box ${applyForm.signatureUrl ? 'has-file' : ''}`}>
                    <div className="rec-doc-header">
                      <div className="rec-doc-icon-badge">
                        {applyForm.signatureUrl ? <CheckCircle2 size={20} color="#059669" /> : <FileCheck size={18} />}
                      </div>
                      <div className="rec-doc-info">
                        <h4 className="rec-doc-title">उम्मेदवारको दस्तखत <span className="rec-req">*</span></h4>
                        <p className="rec-doc-subtitle">सेतो कागजमा गरिएको हस्ताक्षर</p>
                      </div>
                    </div>
                    {applyForm.signatureUrl ? (
                      <div className="rec-doc-preview-area">
                        <img src={applyForm.signatureUrl} alt="Signature" className="rec-doc-thumb-img" />
                        <div className="rec-doc-actions">
                          <a href={applyForm.signatureUrl} target="_blank" rel="noopener noreferrer" className="rec-doc-view-btn">हेर्नुहोस्</a>
                          <button type="button" onClick={() => handleRemoveFile('signatureUrl')} className="rec-doc-remove-btn">हटाउनुहोस्</button>
                        </div>
                      </div>
                    ) : (
                      <label className="rec-doc-upload-trigger">
                        <UploadCloud size={16} /> <span>दस्तखत छनोट गर्नुहोस्</span>
                        <input type="file" accept="image/*" onChange={(e) => handleFileUpload('signatureUrl', e)} style={{ display: 'none' }} />
                      </label>
                    )}
                  </div>

                  {/* 3. Citizenship */}
                  <div className={`rec-doc-box ${applyForm.citizenshipDocUrl ? 'has-file' : ''}`}>
                    <div className="rec-doc-header">
                      <div className="rec-doc-icon-badge">
                        {applyForm.citizenshipDocUrl ? <CheckCircle2 size={20} color="#059669" /> : <ShieldCheck size={18} />}
                      </div>
                      <div className="rec-doc-info">
                        <h4 className="rec-doc-title">नागरिकता प्रमाणपत्र <span className="rec-req">*</span></h4>
                        <p className="rec-doc-subtitle">अगाडि/पछाडि दुवै भाग (PDF/JPG)</p>
                      </div>
                    </div>
                    {applyForm.citizenshipDocUrl ? (
                      <div className="rec-doc-preview-area">
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0369a1' }}>नागरिकता संलग्न छ</span>
                        <div className="rec-doc-actions">
                          <a href={applyForm.citizenshipDocUrl} target="_blank" rel="noopener noreferrer" className="rec-doc-view-btn">हेर्नुहोस्</a>
                          <button type="button" onClick={() => handleRemoveFile('citizenshipDocUrl')} className="rec-doc-remove-btn">हटाउनुहोस्</button>
                        </div>
                      </div>
                    ) : (
                      <label className="rec-doc-upload-trigger">
                        <UploadCloud size={16} /> <span>नागरिकता छनोट गर्नुहोस्</span>
                        <input type="file" accept=".pdf,image/*" onChange={(e) => handleFileUpload('citizenshipDocUrl', e)} style={{ display: 'none' }} />
                      </label>
                    )}
                  </div>

                  {/* 4. Academic Qualification */}
                  <div className={`rec-doc-box ${applyForm.qualificationDocUrl ? 'has-file' : ''}`}>
                    <div className="rec-doc-header">
                      <div className="rec-doc-icon-badge">
                        {applyForm.qualificationDocUrl ? <CheckCircle2 size={20} color="#059669" /> : <Award size={18} />}
                      </div>
                      <div className="rec-doc-info">
                        <h4 className="rec-doc-title">शैक्षिक योग्यता लब्धाङ्क <span className="rec-req">*</span></h4>
                        <p className="rec-doc-subtitle">Transcript वा प्रमाणपत्र</p>
                      </div>
                    </div>
                    {applyForm.qualificationDocUrl ? (
                      <div className="rec-doc-preview-area">
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0369a1' }}>प्रमाणपत्र संलग्न छ</span>
                        <div className="rec-doc-actions">
                          <a href={applyForm.qualificationDocUrl} target="_blank" rel="noopener noreferrer" className="rec-doc-view-btn">हेर्नुहोस्</a>
                          <button type="button" onClick={() => handleRemoveFile('qualificationDocUrl')} className="rec-doc-remove-btn">हटाउनुहोस्</button>
                        </div>
                      </div>
                    ) : (
                      <label className="rec-doc-upload-trigger">
                        <UploadCloud size={16} /> <span>शैक्षिक लब्धाङ्क छनोट</span>
                        <input type="file" accept=".pdf,image/*" onChange={(e) => handleFileUpload('qualificationDocUrl', e)} style={{ display: 'none' }} />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              <div className="rec-declaration-box" style={{ marginTop: '1.5rem' }}>
                <input
                  type="checkbox"
                  id="agreeTerms"
                  checked={applyForm.agreeTerms}
                  onChange={(e) => setApplyForm({ ...applyForm, agreeTerms: e.target.checked })}
                  style={{ marginTop: '0.2rem', width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor="agreeTerms" className="rec-declaration-text">
                  म प्रमाणित गर्दछु कि माथि उल्लिखित सम्पूर्ण विवरणहरू मेरो जानकारी र विश्वास अनुसार सत्य र सही छन्। कुनै विवरण झुट्ठा वा नक्कली ठहरिएमा प्रचलित कानून बमोजिम हुने कारबाही स्वीकार गर्न तयार छु।
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                <button onClick={() => setWizardStep(2)} className="rec-btn rec-btn-outline">
                  <ArrowLeft size={16} /> अघिल्लो चरण
                </button>
                <button onClick={handleProceedToPayment} className="rec-btn rec-btn-primary" style={{ background: '#15803d' }}>
                  दरखास्त सुरक्षित गर्नुहोस् र भुक्तानीमा जानुहोस्
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Fee Review & Digital Payment Hub */}
        {wizardStep === 4 && (
          <div className="rec-form-card">
            <div className="rec-form-header" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)' }}>
              <CreditCard size={28} color="#38bdf8" />
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>चरण ४: दरखास्त दस्तुर समीक्षा र डिजिटल भुक्तानी</h3>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', opacity: 0.9 }}>
                  दरखास्त नम्बर: <strong style={{ color: '#facc15' }}>{savedDraftApp?.applicationNo || savedDraftApp?.application_no}</strong> — भुक्तानी सम्पन्न हुनासाथ आवेदन स्वतः दर्ता हुनेछ।
                </p>
              </div>
            </div>

            <div className="rec-form-body">
              {/* Fee Summary Matrix */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.82rem' }}>
                  <div>
                    <span style={{ color: '#64748b', display: 'block' }}>उम्मेदवार:</span>
                    <strong style={{ color: '#0f172a' }}>{savedDraftApp?.fullNameNp || savedDraftApp?.full_name_np}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block' }}>पद / विज्ञापन:</span>
                    <strong style={{ color: '#0284c7' }}>{savedDraftApp?.postTitle || savedDraftApp?.post_title}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block' }}>समावेशी समूह:</span>
                    <strong style={{ color: '#334155' }}>{savedDraftApp?.inclusiveCategories || savedDraftApp?.inclusive_categories || 'खुला'}</strong>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ color: '#64748b', display: 'block' }}>कुल बुझाउनुपर्ने रकम:</span>
                    <strong style={{ fontSize: '1.35rem', color: '#15803d' }}>
                      रु. {Number(savedDraftApp?.paidAmount || savedDraftApp?.paid_amount || calculatedFee).toLocaleString('ne-NP')} /-
                    </strong>
                  </div>
                </div>
              </div>

              {/* Gateway Selector Cards */}
              <label className="rec-label">भुक्तानी माध्यम छनोट गर्नुहोस्:</label>
              <div className="rec-gateway-grid">
                {/* Fonepay QR */}
                <div
                  onClick={() => {
                    setSelectedGateway('FONEPAY');
                    handleInitiatePaymentForApp(savedDraftApp?.applicationNo || savedDraftApp?.application_no || '', 'FONEPAY');
                  }}
                  className={`rec-gateway-card ${selectedGateway === 'FONEPAY' ? 'selected' : ''}`}
                >
                  <div className="rec-gateway-icon-wrap" style={{ background: '#dbeafe', color: '#1d4ed8' }}>
                    <QrCode size={24} />
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.88rem', color: '#0f172a', display: 'block' }}>Fonepay Dynamic QR</strong>
                    <small style={{ color: '#64748b', fontSize: '0.72rem' }}>सबै बैंक एपबाट स्क्यान</small>
                  </div>
                </div>

                {/* ConnectIPS */}
                <div
                  onClick={() => {
                    setSelectedGateway('CONNECTIPS');
                    handleInitiatePaymentForApp(savedDraftApp?.applicationNo || savedDraftApp?.application_no || '', 'CONNECTIPS');
                  }}
                  className={`rec-gateway-card ${selectedGateway === 'CONNECTIPS' ? 'selected' : ''}`}
                >
                  <div className="rec-gateway-icon-wrap" style={{ background: '#eff6ff', color: '#2563eb' }}>
                    <Landmark size={24} />
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.88rem', color: '#0f172a', display: 'block' }}>ConnectIPS (NCHL)</strong>
                    <small style={{ color: '#64748b', fontSize: '0.72rem' }}>सरकारी राष्ट्रिय भुक्तानी स्वीच</small>
                  </div>
                </div>

                {/* eSewa */}
                <div
                  onClick={() => {
                    setSelectedGateway('ESEWA');
                    handleInitiatePaymentForApp(savedDraftApp?.applicationNo || savedDraftApp?.application_no || '', 'ESEWA');
                  }}
                  className={`rec-gateway-card ${selectedGateway === 'ESEWA' ? 'selected' : ''}`}
                >
                  <div className="rec-gateway-icon-wrap" style={{ background: '#60bb46', color: '#ffffff' }}>
                    eS
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.88rem', color: '#0f172a', display: 'block' }}>eSewa डिजिटल वालेट</strong>
                    <small style={{ color: '#64748b', fontSize: '0.72rem' }}>मोबाइल वालेट भुक्तानी</small>
                  </div>
                </div>

                {/* Khalti */}
                <div
                  onClick={() => {
                    setSelectedGateway('KHALTI');
                    handleInitiatePaymentForApp(savedDraftApp?.applicationNo || savedDraftApp?.application_no || '', 'KHALTI');
                  }}
                  className={`rec-gateway-card ${selectedGateway === 'KHALTI' ? 'selected' : ''}`}
                >
                  <div className="rec-gateway-icon-wrap" style={{ background: '#5c2d91', color: '#ffffff' }}>
                    Kh
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.88rem', color: '#0f172a', display: 'block' }}>Khalti डिजिटल वालेट</strong>
                    <small style={{ color: '#64748b', fontSize: '0.72rem' }}>तत्काल वालेट भुक्तानी</small>
                  </div>
                </div>
              </div>

              {/* Gateway Active Screen */}
              {selectedGateway === 'FONEPAY' && (
                <div className="rec-qr-display-card">
                  {/* Bank & Account Official Banner */}
                  <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '0.75rem', textAlign: 'left' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#1e40af', fontWeight: 800, fontSize: '0.82rem' }}>
                      <Landmark size={15} />
                      <span>नेपाल इन्भेष्टमेन्ट मेगा बैंक (NIMB) — राजस्व खाता</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#334155', marginTop: '0.25rem' }}>
                      खातावाला: <strong>GA 1.1 PANCHPOKHARI THANGPAL GA.PA. AANTARIK RAJASHO KHATA</strong>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.35rem', paddingTop: '0.35rem', borderTop: '1px dashed #cbd5e1' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>खाता नम्बर:</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ fontFamily: 'monospace', fontWeight: 900, color: '#0f172a', fontSize: '0.95rem', letterSpacing: '0.5px' }}>
                          18301400000109
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText('18301400000109');
                            alert('NIMB खाता नं 18301400000109 कपी भयो!');
                          }}
                          style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '0.15rem 0.4rem', fontSize: '0.68rem', cursor: 'pointer', color: '#0284c7', fontWeight: 700 }}
                        >
                          कपी
                        </button>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: '#0284c7', fontWeight: 800, fontSize: '0.88rem' }}>
                    <QrCode size={18} />
                    <span>NIMB / Fonepay Dynamic QR स्क्यान गरी भुक्तानी गर्नुहोस्</span>
                  </div>

                  {dynamicQrUrl ? (
                    <img src={dynamicQrUrl} alt="Fonepay Dynamic QR" className="rec-qr-code-img" />
                  ) : (
                    <div style={{ height: '210px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Loader2 size={32} className="animate-spin" color="#0284c7" />
                    </div>
                  )}

                  <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#15803d' }}>
                    रकम: रु. {Number(activePaymentTxn?.amount || calculatedFee).toLocaleString('ne-NP')} /-
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                    कारोबार संकेत: <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{activePaymentTxn?.transaction_uuid || activePaymentTxn?.transactionUuid}</span>
                  </div>

                  <div className="rec-qr-timer-pill">
                    <Clock size={13} />
                    <span>समय बाँकी: {Math.floor(paymentTimerSeconds / 60)}:{String(paymentTimerSeconds % 60).padStart(2, '0')} मिनेट</span>
                  </div>

                  <p style={{ fontSize: '0.78rem', color: '#475569', marginTop: '0.75rem', lineHeight: 1.4 }}>
                    नेपालका सम्पूर्ण वाणिज्य तथा विकास बैंकहरूको <strong>Mobile Banking एप</strong> (NIMB Smart, Global Smart Plus, NIC Asia MoBank, Nabil Smart, आदि) वा <strong>eSewa/Khalti</strong> बाट यो QR स्क्यान गरी पिन हानेर भुक्तानी स्वीकृत गर्नुहोस्।
                  </p>

                  <button
                    onClick={handleVerifyPayment}
                    disabled={isVerifyingPayment}
                    className="rec-btn rec-btn-success"
                    style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem', justifyContent: 'center', marginTop: '1rem' }}
                  >
                    {isVerifyingPayment ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        भुक्तानी रुजु गरिँदैछ...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={18} />
                        मैले भुक्तानी सम्पन्न गरें (Verify & Confirm)
                      </>
                    )}
                  </button>
                </div>
              )}

                    {selectedGateway !== 'FONEPAY' && (
                      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.5rem', textAlign: 'center', maxWidth: '460px', margin: '1rem auto' }}>
                        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.05rem', fontWeight: 800 }}>
                          {selectedGateway} गेटवे मार्फत सुरक्षित भुक्तानी
                        </h4>
                        <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1.25rem' }}>
                          कारोबार संकेत: <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{activePaymentTxn?.transaction_uuid || activePaymentTxn?.transactionUuid}</span>
                        </p>
                        <button
                          onClick={handleVerifyPayment}
                          disabled={isVerifyingPayment}
                          className="rec-btn rec-btn-primary"
                          style={{ width: '100%', padding: '0.85rem', justifyContent: 'center' }}
                        >
                          {isVerifyingPayment ? 'प्रमाणीकरण हुँदैछ...' : `${selectedGateway} बाट भुक्तानी सम्पन्न गर्नुहोस्`}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 5: Confirmation & Official Receipt */}
              {wizardStep === 5 && (
                <div style={{ background: '#ecfdf5', border: '2px solid #10b981', borderRadius: '18px', padding: '2.5rem', textAlign: 'center', boxShadow: 'var(--rec-shadow-lg)' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#d1fae5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' }}>
                    <CheckCircle size={36} />
                  </div>
                  <h2 style={{ fontSize: '1.65rem', fontWeight: 900, color: '#064e3b', margin: '0 0 0.5rem 0' }}>
                    बधाई छ! तपाईंको दरखास्त र भुक्तानी सफलतापूर्वक सम्पन्न भयो!
                  </h2>
                  <p style={{ fontSize: '0.9rem', color: '#047857', maxWidth: '560px', margin: '0 auto 1.5rem auto', lineHeight: 1.5 }}>
                    तपाईंको दरखास्त दस्तुर दाखिला भई कार्यालयको रुजु डेस्कमा प्राप्त भइसकेको छ। कृपया तपाईंको निम्न दरखास्त नम्बर र रसिद सुरक्षित राख्नुहोस्:
                  </p>

                  <div style={{ display: 'inline-flex', gap: '2rem', background: '#ffffff', border: '2px dashed #059669', padding: '1.25rem 2.5rem', borderRadius: '14px', marginBottom: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block' }}>दरखास्त नम्बर (Application No)</span>
                      <span style={{ fontSize: '1.75rem', fontFamily: 'monospace', fontWeight: 900, color: '#1e3a8a' }}>
                        {savedDraftApp?.applicationNo || savedDraftApp?.application_no}
                      </span>
                    </div>
                    {activeReceipt?.receiptNo && (
                      <div style={{ borderLeft: '1px solid #e2e8f0', paddingLeft: '2rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block' }}>विद्युतीय रसिद नम्बर (Receipt No)</span>
                        <span style={{ fontSize: '1.75rem', fontFamily: 'monospace', fontWeight: 900, color: '#059669' }}>
                          {activeReceipt.receiptNo}
                        </span>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => setShowReceiptModal(true)}
                      className="rec-btn rec-btn-success"
                      style={{ padding: '0.75rem 1.5rem', fontSize: '0.95rem' }}
                    >
                      <Receipt size={18} />
                      आधिकारिक विद्युतीय राजस्व रसिद हेर्नुहोस् (Print Receipt)
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('admitCard');
                        setAdmitSearchQuery(savedDraftApp?.applicationNo || savedDraftApp?.application_no || '');
                        handleSearchAdmitCard();
                      }}
                      className="rec-btn rec-btn-primary"
                      style={{ padding: '0.75rem 1.5rem', fontSize: '0.95rem' }}
                    >
                      <QrCode size={18} />
                      प्रवेशपत्र स्थिति हेर्नुहोस्
                    </button>
                  </div>
                </div>
              )}
            </div>
      )}

            {/* ============================================================== */}
            {/* 8. TAB 6: DIGITAL ADMIT CARD & PAY PENDING (प्रवेशपत्र तथा स्थिति) */}
            {/* ============================================================== */}
            {activeTab === 'admitCard' && (
              <div className="rec-form-wrapper">
                <div className="rec-admit-search-card">
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <QrCode size={22} color="#0284c7" />
                    डिजिटल प्रवेशपत्र, रसिद खोज तथा आवेदन स्थिति ट्र्याकिङ
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

                {/* Search Result */}
                {admitCardResult && (
                  <div>
                    {/* Payment Notice Banner if UNPAID */}
                    {admitCardResult.payment_status !== 'PAID' && (
                      <div style={{ background: '#fffbeb', border: '2px solid #f59e0b', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <ShieldAlert size={28} color="#d97706" />
                          <div>
                            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#92400e' }}>
                              दरखास्त दस्तुर भुक्तानी हुन बाँकी छ!
                            </h4>
                            <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: '#b45309' }}>
                              तपाईंको फारम ड्राफ्टमा सुरक्षित छ तर शुल्क नबुझाएसम्म रुजु प्रक्रिया अगाडि बढ्दैन।
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handlePayPendingLookup(admitCardResult.application.applicationNo || admitCardResult.application.application_no)}
                          className="rec-btn rec-btn-primary"
                          style={{ background: '#15803d' }}
                        >
                          <CreditCard size={16} />
                          अहिले शुल्क भुक्तानी गर्नुहोस् (Pay Fee Now)
                        </button>
                      </div>
                    )}

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
                            निर्णय अवस्था: {admitCardResult.application.status} | भुक्तानी अवस्था: {admitCardResult.payment_status}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {admitCardResult.receipt_no && (
                          <button
                            onClick={() => handleFetchReceipt(admitCardResult.application.applicationNo || admitCardResult.application.application_no)}
                            className="rec-btn rec-btn-success"
                            style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
                          >
                            <Receipt size={15} />
                            रसिद हेर्नुहोस्
                          </button>
                        )}
                        {admitCardResult.is_admit_card_ready && (
                          <button onClick={() => window.print()} className="rec-btn rec-btn-primary" style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}>
                            <Printer size={15} />
                            प्रवेशपत्र प्रिन्ट (Print)
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Printable Official Admit Card */}
                    {admitCardResult.is_admit_card_ready && (
                      <div id="printable-admit-card" className="rec-admit-official-card">
                        <div className="rec-admit-watermark">
                          <FileCheck size={420} />
                        </div>

                        <div className="rec-admit-header">
                          <div className="rec-gov-emblem-box">नेपाल सरकार</div>
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

                          <div className="rec-admit-qr-col">
                            <div>
                              <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                                आधिकारिक QR प्रमाणीकरण
                              </span>
                              <div className="rec-qr-img-wrap">
                                <img
                                  src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(
                                    `Paanchpokhari e-Recruitment | Roll: ${admitCardResult.application.admitCardRollNo ||
                                    admitCardResult.application.admit_card_roll_no
                                    } | Name: ${admitCardResult.application.fullNameNp ||
                                    admitCardResult.application.full_name_np
                                    } | Post: ${admitCardResult.application.postTitle ||
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

                        <div className="rec-admit-instructions">
                          <strong style={{ color: '#0f172a' }}>परीक्षार्थीहरूका लागि आवश्यक निर्देशनहरू:</strong>
                          <ol>
                            <li>परीक्षा हलमा प्रवेश गर्दा यो प्रवेशपत्र र सक्कल नेपाली नागरिकताको प्रमाणपत्र अनिवार्य साथमा ल्याउनुपर्नेछ।</li>
                            <li>परीक्षा सुरु हुनुभन्दा कम्तीमा ३० मिनेट अगावै तोकिएको परीक्षा केन्द्रमा उपस्थित भइसक्नुपर्नेछ।</li>
                            <li>परीक्षा भवनभित्र मोबाइल फोन, स्मार्टवाच वा कुनै पनि विद्युतीय उपकरण लैजान पूर्ण निषेध गरिएको छ।</li>
                          </ol>
                        </div>

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
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ============================================================== */}
            {/* 9. MODAL: OFFICIAL ELECTRONIC REVENUE RECEIPT */}
            {/* ============================================================== */}
            {showReceiptModal && activeReceipt && (
              <div className="rec-modal-backdrop">
                <div className="rec-modal-panel" style={{ maxWidth: '640px' }}>
                  <div className="rec-modal-header" style={{ background: '#1e3a8a' }}>
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Receipt size={18} color="#93c5fd" />
                      आधिकारिक विद्युतीय राजस्व रसिद (Electronic Revenue Receipt)
                    </h3>
                    <button
                      onClick={() => setShowReceiptModal(false)}
                      style={{ background: 'transparent', border: 'none', color: '#cbd5e1', cursor: 'pointer' }}
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="rec-modal-body" style={{ background: '#f8fafc' }}>
                    <div id="printable-receipt" className="rec-receipt-modal-wrapper">
                      <div className="rec-receipt-header">
                        <p className="rec-receipt-title-gov">नेपाल सरकार | बागमती प्रदेश</p>
                        <h2 className="rec-receipt-title-office">पाँचपोखरी थाङपाल गाउँपालिका</h2>
                        <p className="rec-receipt-title-sub">गाउँ कार्यपालिकाको कार्यालय, सिन्धुपाल्चोक</p>
                        <span className="rec-receipt-ribbon">विद्युतीय राजस्व रसिद (REVENUE RECEIPT)</span>
                      </div>

                      <div className="rec-receipt-meta-grid">
                        <div>
                          <span style={{ color: '#64748b', display: 'block' }}>रसिद नम्बर:</span>
                          <strong style={{ color: '#1e3a8a', fontFamily: 'monospace', fontSize: '0.95rem' }}>
                            {activeReceipt.receiptNo}
                          </strong>
                        </div>
                        <div>
                          <span style={{ color: '#64748b', display: 'block' }}>दरखास्त नम्बर:</span>
                          <strong style={{ fontFamily: 'monospace' }}>{activeReceipt.applicationNo}</strong>
                        </div>
                        <div>
                          <span style={{ color: '#64748b', display: 'block' }}>कारोबार संकेत (Txn ID):</span>
                          <span style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{activeReceipt.transactionUuid}</span>
                        </div>
                        <div>
                          <span style={{ color: '#64748b', display: 'block' }}>दाखिला मिति/समय:</span>
                          <span>{activeReceipt.paidAt}</span>
                        </div>
                      </div>

                      <table className="rec-receipt-table">
                        <tbody>
                          <tr>
                            <td style={{ background: '#f8fafc', fontWeight: 700, width: '35%' }}>करदाता/उम्मेदवारको नाम:</td>
                            <td style={{ fontWeight: 800, color: '#0f172a' }}>
                              {activeReceipt.fullNameNp} {activeReceipt.fullNameEn ? `(${activeReceipt.fullNameEn})` : ''}
                            </td>
                          </tr>
                          <tr>
                            <td style={{ background: '#f8fafc', fontWeight: 700 }}>नागरिकता / फोन:</td>
                            <td>{activeReceipt.citizenshipNo || '-'} / {activeReceipt.contactPhone}</td>
                          </tr>
                          <tr>
                            <td style={{ background: '#f8fafc', fontWeight: 700 }}>विज्ञापन नं तथा पद:</td>
                            <td>{activeReceipt.postTitle} (वि.नं. {activeReceipt.vacancyNo})</td>
                          </tr>
                          <tr>
                            <td style={{ background: '#f8fafc', fontWeight: 700 }}>राजस्व शीर्षक:</td>
                            <td>{activeReceipt.revenueTitle}</td>
                          </tr>
                          <tr>
                            <td style={{ background: '#f8fafc', fontWeight: 700 }}>भुक्तानी माध्यम:</td>
                            <td>{activeReceipt.gateway} (सम्पन्न)</td>
                          </tr>
                          <tr style={{ background: '#f0fdf4' }}>
                            <td style={{ fontWeight: 800, color: '#15803d' }}>जम्मा प्राप्त रकम:</td>
                            <td style={{ fontSize: '1.25rem', fontWeight: 900, color: '#15803d' }}>
                              रु. {Number(activeReceipt.amount).toLocaleString('ne-NP')} /-
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      <div className="rec-receipt-footer">
                        <div>
                          {receiptQrDataUrl && (
                            <img src={receiptQrDataUrl} alt="Receipt QR" style={{ width: '90px', height: '90px', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '3px' }} />
                          )}
                          <span style={{ fontSize: '0.65rem', color: '#64748b', display: 'block', marginTop: '0.2rem' }}>डिजिटल छाप तथा प्रमाणीकरण</span>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ width: '160px', borderBottom: '1px dashed #0f172a', marginBottom: '0.35rem' }}></div>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>राजस्व अधिकृत / कम्प्युटर प्रणाली</span>
                          <span style={{ fontSize: '0.68rem', color: '#64748b', display: 'block' }}>पाँचपोखरी थाङपाल गाउँपालिका</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rec-modal-footer">
                    <button onClick={() => window.print()} className="rec-btn rec-btn-primary">
                      <Printer size={16} /> रसिद प्रिन्ट गर्नुहोस्
                    </button>
                    <button onClick={() => setShowReceiptModal(false)} className="rec-btn rec-btn-outline">
                      बन्द गर्नुहोस्
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* 10. MODAL: REFUND MANAGEMENT MODAL */}
            {/* ============================================================== */}
            {showRefundModal && (
              <div className="rec-modal-backdrop">
                <div className="rec-modal-panel" style={{ maxWidth: '480px' }}>
                  <div className="rec-modal-header" style={{ background: '#991b1b' }}>
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <History size={18} />
                      रकम फिर्ता व्यवस्थापन (Refund Management)
                    </h3>
                    <button onClick={() => setShowRefundModal(false)} style={{ background: 'transparent', border: 'none', color: '#cbd5e1', cursor: 'pointer' }}>
                      <X size={18} />
                    </button>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      refundMutation.mutate(refundForm);
                    }}
                    style={{ display: 'flex', flexDirection: 'column', flex: 1 }}
                  >
                    <div className="rec-modal-body">
                      <div className="rec-field-group">
                        <label className="rec-label">दरखास्त नम्बर (Application No)</label>
                        <input
                          type="text"
                          readOnly
                          value={refundForm.applicationNo}
                          className="rec-input-control"
                          style={{ background: '#f8fafc', fontWeight: 800 }}
                        />
                      </div>

                      <div className="rec-field-group">
                        <label className="rec-label">फिर्ता गरिने रकम (रु.) <span className="rec-req">*</span></label>
                        <input
                          type="number"
                          required
                          value={refundForm.refundAmount}
                          onChange={(e) => setRefundForm({ ...refundForm, refundAmount: parseFloat(e.target.value) || 0 })}
                          className="rec-input-control"
                          style={{ fontWeight: 800, color: '#dc2626' }}
                        />
                      </div>

                      <div className="rec-field-group">
                        <label className="rec-label">फिर्ता गर्नुको कारण <span className="rec-req">*</span></label>
                        <textarea
                          required
                          rows={2}
                          value={refundForm.reason}
                          onChange={(e) => setRefundForm({ ...refundForm, reason: e.target.value })}
                          className="rec-input-control"
                        />
                      </div>

                      <div className="rec-field-group">
                        <label className="rec-label">उम्मेदवारको बैंक खाता विवरण</label>
                        <input
                          type="text"
                          placeholder="बैंकको नाम, खाता नं र खातावालाको नाम"
                          value={refundForm.bankInfo}
                          onChange={(e) => setRefundForm({ ...refundForm, bankInfo: e.target.value })}
                          className="rec-input-control"
                        />
                      </div>
                    </div>

                    <div className="rec-modal-footer">
                      <button type="button" onClick={() => setShowRefundModal(false)} className="rec-btn rec-btn-outline">
                        रद्द
                      </button>
                      <button type="submit" disabled={refundMutation.isPending} className="rec-btn rec-btn-primary" style={{ background: '#dc2626' }}>
                        {refundMutation.isPending ? 'प्रक्रिया हुँदैछ...' : 'फिर्ता जारी गर्नुहोस्'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* 11. MODAL: ADD VACANCY */}
            {/* ============================================================== */}
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
                          <label className="rec-label">आधार दरखास्त दस्तुर (रु.)</label>
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
                          <label className="rec-label">समावेशी थप शुल्क (रु.)</label>
                          <input
                            type="number"
                            min="0"
                            step="50"
                            required
                            value={vacancyForm.inclusiveGroupFee}
                            onChange={(e) => setVacancyForm({ ...vacancyForm, inclusiveGroupFee: parseFloat(e.target.value) || 0 })}
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
                    </div>

                    <div className="rec-modal-footer">
                      <button type="button" onClick={() => setShowAddVacancyModal(false)} className="rec-btn rec-btn-outline">
                        रद्द
                      </button>
                      <button type="submit" disabled={createVacancyMutation.isPending} className="rec-btn rec-btn-primary">
                        {createVacancyMutation.isPending ? 'प्रकाशन हुँदैछ...' : 'विज्ञापन प्रकाशन गर्नुहोस्'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* 12. MODAL: APPLICATION VERIFICATION & DECISION */}
            {/* ============================================================== */}
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
                          <span style={{ color: '#64748b' }}>भुक्तानी अवस्था:</span>
                          <strong style={{ color: (selectedApp.paymentStatus === 'PAID' || selectedApp.payment_status === 'PAID') ? '#059669' : '#dc2626' }}>
                            {(selectedApp.paymentStatus === 'PAID' || selectedApp.payment_status === 'PAID') ? 'PAID (रसिद नं: ' + (selectedApp.receiptNo || selectedApp.receipt_no) + ')' : 'UNPAID'}
                          </strong>
                        </div>
                      </div>

                      <div className="rec-field-group" style={{ marginTop: '0.75rem' }}>
                        <label className="rec-label">निर्णय अवस्था:</label>
                        <select
                          value={verifyForm.status}
                          onChange={(e) => setVerifyForm({ ...verifyForm, status: e.target.value })}
                          className="rec-input-control"
                          style={{ fontWeight: 700 }}
                        >
                          <option value="स्वीकृत (Approved)">स्वीकृत (Approved) — प्रवेशपत्र जारी गर्ने</option>
                          <option value="अस्वीकृत (Rejected)">अस्वीकृत (Rejected) — मापदण्ड नपुगेको</option>
                          <option value="विचाराधीन (Pending)">विचाराधीन (Pending) — थप छानबिन</option>
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
                      >
                        रद्द
                      </button>
                      <button type="submit" disabled={verifyMutation.isPending} className="rec-btn rec-btn-primary">
                        {verifyMutation.isPending ? 'सुरक्षित गरिँदैछ...' : 'निर्णय सुरक्षित गर्नुहोस्'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* 13. MODAL: APPLICANT PROFILE DETAILS */}
            {/* ============================================================== */}
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
                        <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>पद:</span>
                        <strong style={{ color: '#0284c7' }}>{selectedApp.postTitle || selectedApp.post_title}</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>फोन / इमेल:</span>
                        <span>{selectedApp.contactPhone || selectedApp.contact_phone} / {selectedApp.email || '-'}</span>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>नागरिकता:</span>
                        <span>{selectedApp.citizenshipNo || selectedApp.citizenship_no} ({selectedApp.citizenshipDistrict || selectedApp.citizenship_district})</span>
                      </div>
                    </div>

                    {/* Uploaded Documents Gallery */}
                    <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.85rem', marginTop: '0.85rem' }}>
                      <h4 style={{ margin: '0 0 0.65rem 0', fontSize: '0.85rem', fontWeight: 800, color: '#1e293b' }}>
                        संलग्न कागजातहरू तथा प्रमाणपत्रहरू:
                      </h4>
                      {(() => {
                        const docs = [
                          { label: 'पासपोर्ट साइजको फोटो', url: selectedApp.photoUrl || selectedApp.photo_url, isImg: true },
                          { label: 'उम्मेदवारको दस्तखत', url: selectedApp.signatureUrl || selectedApp.signature_url, isImg: true },
                          { label: 'नेपाली नागरिकता प्रमाणपत्र', url: selectedApp.citizenshipDocUrl || selectedApp.citizenship_doc_url },
                          { label: 'शैक्षिक प्रमाणपत्र / लब्धाङ्क', url: selectedApp.qualificationDocUrl || selectedApp.qualification_doc_url },
                          { label: 'काउन्सिल दर्ता प्रमाणपत्र', url: selectedApp.councilDocUrl || selectedApp.council_doc_url },
                          { label: 'कार्य अनुभव तथा तालिम', url: selectedApp.experienceDocUrl || selectedApp.experience_doc_url },
                          { label: 'राजस्व भौचर / रसिद', url: selectedApp.paymentVoucherDocUrl || selectedApp.payment_voucher_doc_url },
                        ].filter(d => Boolean(d.url));

                        if (docs.length === 0) {
                          return <div style={{ color: '#94a3b8' }}>कुनै कागजात संलग्न गरिएको छैन।</div>;
                        }

                        return (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.65rem' }}>
                            {docs.map((d, idx) => (
                              <div key={idx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#334155' }}>{d.label}</span>
                                <a
                                  href={d.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="rec-btn rec-btn-outline"
                                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', justifyContent: 'center' }}
                                >
                                  <ExternalLink size={12} /> हेर्नुहोस्
                                </a>
                              </div>
                            ))}
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
          </div>
        );
};

        export default RecruitmentPage;
