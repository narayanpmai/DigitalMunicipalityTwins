import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client';
import { useTenant } from '../../context/TenantContext';
import { NepaliDatePicker } from '../../components/common/NepaliDatePicker';
import * as XLSX from 'xlsx';
import QRCode from 'qrcode';
import JSZip from 'jszip';
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
  Hash,
  ArrowRight,
  ShieldCheck,
  FileText,
  UserCheck,
  UserPlus,
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
import {
  CentralDocumentSheet,
  CentralLetterheadHeader,
  CentralLetterheadFooter,
  CentralPrintPreviewModal,
  printElement,
  computeNepalSambat,
} from '../../components/common/CentralLetterhead';
import { bsToAd, toEnglishDigits } from '../../utils/nepaliCalendar';

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
  teachingLicenseNo?: string;
  teaching_license_no?: string;
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
  applicationLetterDocUrl?: string;
  application_letter_doc_url?: string;
  teachingLicenseDocUrl?: string;
  teaching_license_doc_url?: string;
  councilDocUrl?: string;
  council_doc_url?: string;
  experienceDocUrl?: string;
  experience_doc_url?: string;
  paymentVoucherDocUrl?: string;
  payment_voucher_doc_url?: string;
  documentsJson?: string;
  documents_json?: string;
  onboardedEmployeeId?: string;
  onboarded_employee_id?: string;
  onboardedAt?: string;
  onboarded_at?: string;
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

  // Municipal Tenant Settings & Dynamic Branding (from Palika Setup / TenantContext)
  let tenantSettings: any = null;
  let activeTenantId = 'panchpokhari';
  try {
    const tenantCtx = useTenant();
    tenantSettings = tenantCtx?.settings;
    if (tenantCtx?.tenantId) {
      activeTenantId = tenantCtx.tenantId;
    }
  } catch {
    activeTenantId = localStorage.getItem('tenant_id') || 'panchpokhari';
  }

  const [palikaSync, setPalikaSync] = useState(0);
  useEffect(() => {
    const handleSettingsUpdate = () => setPalikaSync((prev) => prev + 1);
    window.addEventListener('storage', handleSettingsUpdate);
    window.addEventListener('palika-settings-updated', handleSettingsUpdate);
    return () => {
      window.removeEventListener('storage', handleSettingsUpdate);
      window.removeEventListener('palika-settings-updated', handleSettingsUpdate);
    };
  }, []);

  const localOverride = React.useMemo(() => {
    try {
      const raw = localStorage.getItem(`palika_settings_${activeTenantId}`);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }, [activeTenantId, palikaSync]);

  const dynamicPalikaName =
    localOverride.palika_name?.trim() ||
    tenantSettings?.palika_name?.trim() ||
    'पाँचपोखरी थाङपाल गाउँपालिका';

  const dynamicPalikaNameEn =
    localOverride.palika_name_en?.trim() ||
    tenantSettings?.palika_name_en?.trim() ||
    'PANCHPOKHARI THANGPAL RURAL MUNICIPALITY';

  const dynamicOfficeTitle =
    localOverride.chief_officer_title?.trim() ||
    tenantSettings?.office_title?.trim() ||
    'गाउँ कार्यपालिकाको कार्यालय';

  const dynamicAddress =
    localOverride.headquarters?.trim() ||
    localOverride.address?.trim() ||
    tenantSettings?.headquarters?.trim() ||
    tenantSettings?.address?.trim() ||
    'थाङपालधाप, सिन्धुपाल्चोक';

  const dynamicProvince =
    localOverride.province?.trim() ||
    tenantSettings?.province?.trim() ||
    'बागमती प्रदेश';

  const dynamicProvinceCountry = dynamicProvince.includes('नेपाल') ? dynamicProvince : `${dynamicProvince}, नेपाल`;

  const dynamicPalikaLogo =
    localOverride.logo_url?.trim() ||
    tenantSettings?.logo_url?.trim() ||
    '/panchpokhari-logo.png';

  const dynamicEmblemUrl =
    localOverride.emblem_url?.trim() ||
    tenantSettings?.emblem_url?.trim() ||
    '/emblem-of-nepal.png';

  const dynamicSlogan =
    localOverride.slogan?.trim() ||
    tenantSettings?.slogan?.trim() ||
    '“शिक्षा, स्वास्थ्य, कृषि र पर्यटन: समृद्ध पाँचपोखरीको मूलधन”';

  const dynamicWebsite =
    localOverride.website?.trim() ||
    tenantSettings?.website?.trim() ||
    'http://panchpokharithangpalmun.gov.np/';

  const dynamicEmail =
    localOverride.email?.trim() ||
    tenantSettings?.email?.trim() ||
    'ito.panchpokharithangpalmun@gmail.com';

  const dynamicPhone =
    localOverride.phone?.trim() ||
    tenantSettings?.phone?.trim() ||
    '+9779851109808';

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

  // Centralized Official Documents Preview & Print Modals
  const [showAdmitCardPreviewModal, setShowAdmitCardPreviewModal] = useState(false);
  const [showApprovalLetterModal, setShowApprovalLetterModal] = useState(false);
  const [selectedApprovalApp, setSelectedApprovalApp] = useState<any>(null);
  const [showExamNoticeModal, setShowExamNoticeModal] = useState(false);
  const [selectedNoticeVacancy, setSelectedNoticeVacancy] = useState<any>(null);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [selectedAppointmentApp, setSelectedAppointmentApp] = useState<any>(null);
  const [showAttendanceSheetModal, setShowAttendanceSheetModal] = useState(false);
  const [selectedAttendanceVacancy, setSelectedAttendanceVacancy] = useState<any>(null);

  // Candidate Document Resubmission Window State
  const [resubmitDocType, setResubmitDocType] = useState('teaching_license');
  const [resubmitFileUrl, setResubmitFileUrl] = useState('');
  const [resubmitAuthInput, setResubmitAuthInput] = useState('');
  const [resubmitCandidateRemarks, setResubmitCandidateRemarks] = useState('');
  const [isResubmitting, setIsResubmitting] = useState(false);
  const [resubmitSuccessMsg, setResubmitSuccessMsg] = useState('');

  // Document Preview & Admin Download State
  const [previewDoc, setPreviewDoc] = useState<{ url: string; label: string; isImg?: boolean } | null>(null);
  const [isZipping, setIsZipping] = useState(false);
  const [downloadingDocKey, setDownloadingDocKey] = useState<string | null>(null);

  const getAppDocuments = (app: Application | null) => {
    if (!app) return [];
    return [
      { key: 'photo', label: 'पासपोर्ट साइजको फोटो', fileTag: 'फोटो_Photo', url: app.photoUrl || app.photo_url, isImg: true },
      { key: 'signature', label: 'उम्मेदवारको दस्तखत', fileTag: 'दस्तखत_Signature', url: app.signatureUrl || app.signature_url, isImg: true },
      { key: 'applicationLetter', label: 'निवेदन (Application Letter)', fileTag: 'निवेदन_Nivedan', url: app.applicationLetterDocUrl || app.application_letter_doc_url },
      { key: 'citizenship', label: 'नेपाली नागरिकता प्रमाणपत्र', fileTag: 'नागरिकता_Citizenship', url: app.citizenshipDocUrl || app.citizenship_doc_url },
      { key: 'qualification', label: 'शैक्षिक प्रमाणपत्र / लब्धाङ्क', fileTag: 'शैक्षिक_योग्यता_Qualification', url: app.qualificationDocUrl || app.qualification_doc_url },
      { key: 'teachingLicense', label: 'अध्यापन अनुमति पत्र', fileTag: 'अध्यापन_अनुमति_पत्र_TeachingLicense', url: app.teachingLicenseDocUrl || app.teaching_license_doc_url },
      { key: 'council', label: 'काउन्सिल दर्ता प्रमाणपत्र', fileTag: 'काउन्सिल_दर्ता_Council', url: app.councilDocUrl || app.council_doc_url },
      { key: 'experience', label: 'कार्य अनुभव तथा तालिम', fileTag: 'कार्य_अनुभव_Experience', url: app.experienceDocUrl || app.experience_doc_url },
      { key: 'voucher', label: 'राजस्व भौचर / बैंक रसिद', fileTag: 'राजस्व_भौचर_Voucher', url: app.paymentVoucherDocUrl || app.payment_voucher_doc_url },
    ].filter(d => Boolean(d.url));
  };

  const handleDownloadSingleDoc = async (url: string, fileTag: string, app: Application) => {
    try {
      setDownloadingDocKey(fileTag);
      const appNo = (app.applicationNo || app.application_no || 'PTRM-APP').replace(/[^a-zA-Z0-9_-]/g, '_');
      const candidateName = (app.fullNameNp || app.full_name_np || app.fullNameEn || 'Applicant').replace(/[\s/\\:*?"<>|]/g, '_');
      
      const cleanUrl = url.split('?')[0];
      let ext = 'jpg';
      if (cleanUrl.includes('.')) {
        ext = cleanUrl.split('.').pop()?.toLowerCase() || 'jpg';
      }
      const filename = `${appNo}_${fileTag}_${candidateName}.${ext}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.warn('Direct download fallback to window.open', err);
      window.open(url, '_blank');
    } finally {
      setDownloadingDocKey(null);
    }
  };

  const handleDownloadAllDocsAsZip = async (app: Application) => {
    const docs = getAppDocuments(app);
    if (docs.length === 0) {
      alert('कुनै कागजात संलग्न गरिएको छैन।');
      return;
    }
    try {
      setIsZipping(true);
      const zip = new JSZip();
      const appNo = (app.applicationNo || app.application_no || 'PTRM-APP').replace(/[^a-zA-Z0-9_-]/g, '_');
      const candidateName = (app.fullNameNp || app.full_name_np || 'Applicant').replace(/[\s/\\:*?"<>|]/g, '_');

      const folder = zip.folder(`${appNo}_${candidateName}_कागजातहरू`);
      const targetFolder = folder || zip;

      await Promise.all(
        docs.map(async (doc, idx) => {
          try {
            const res = await fetch(doc.url!);
            if (!res.ok) return;
            const blob = await res.blob();
            const cleanUrl = doc.url!.split('?')[0];
            let ext = 'jpg';
            if (cleanUrl.includes('.')) {
              ext = cleanUrl.split('.').pop()?.toLowerCase() || 'jpg';
            }
            const filename = `${idx + 1}_${doc.fileTag}.${ext}`;
            targetFolder.file(filename, blob);
          } catch (e) {
            console.error(`Failed to download ${doc.label}`, e);
          }
        })
      );

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const zipUrl = window.URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = zipUrl;
      a.download = `${appNo}_${candidateName}_सम्पूर्ण_कागजातहरू.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(zipUrl);
    } catch (err) {
      console.error('ZIP generation failed:', err);
      alert('कागजातहरू जिप गर्दा समस्या आयो। कृपया व्यक्तिगत कागजात डाउनलोड गर्नुहोस्।');
    } finally {
      setIsZipping(false);
    }
  };

  // Helper to format Exam Date in both BS and AD
  const getExamDateTimeDetails = (app: any, vac: any) => {
    const rawDate = (app?.examDateTime || app?.exam_date_time || vac?.examDateBs || vac?.exam_date_bs || '').trim();
    if (!rawDate) {
      return { bs: '', ad: '' };
    }
    const western = toEnglishDigits(rawDate);
    const dateMatch = western.match(/(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);

    let adDateStr = '';
    if (dateMatch) {
      try {
        adDateStr = bsToAd(parseInt(dateMatch[1], 10), parseInt(dateMatch[2], 10), parseInt(dateMatch[3], 10));
      } catch {}
    }

    let timeAd = '';
    if (rawDate.includes('बिहान')) {
      const timeMatch = western.match(/(\d{1,2}):(\d{2})/);
      timeAd = timeMatch ? `${timeMatch[1]}:${timeMatch[2]} AM` : '11:00 AM';
    } else if (rawDate.includes('दिउँसो') || rawDate.includes('दिउसो') || rawDate.includes('अपराह्न')) {
      const timeMatch = western.match(/(\d{1,2}):(\d{2})/);
      timeAd = timeMatch ? `${timeMatch[1]}:${timeMatch[2]} PM` : '01:00 PM';
    }

    return {
      bs: rawDate,
      ad: adDateStr ? `${adDateStr} ${timeAd}`.trim() : ''
    };
  };

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
    teachingLicenseNo: '',
    experienceYears: 1,
    photoUrl: '',
    signatureUrl: '',
    citizenshipDocUrl: '',
    qualificationDocUrl: '',
    applicationLetterDocUrl: '',
    teachingLicenseDocUrl: '',
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
    publishDateBs: '२०८३-०५-०१',
    deadlineDateBs: '२०८३-०५-२५',
    examDateBs: '',
    examCenter: '',
    status: 'खुला (Active)',
    description: '',
  });

  // Edit Vacancy Form State
  const [editVacancyForm, setEditVacancyForm] = useState({
    id: '',
    vacancyNo: '',
    title: '',
    serviceGroup: 'प्रशासन / प्राविधिक',
    level: 'सहायक पाँचौं (5th Level)',
    openingsCount: 1,
    employmentType: 'करार सेवा (Contract)',
    applicationFee: 500,
    inclusiveGroupFee: 200,
    minQualification: '',
    publishDateBs: '२०८३-०५-०१',
    deadlineDateBs: '२०८३-०५-२५',
    examDateBs: '',
    examCenter: '',
    status: 'खुला (Active)',
    description: '',
  });

  const openEditVacancyModal = (vac: any) => {
    setEditingVacancy(vac);
    setEditVacancyForm({
      id: vac.id,
      vacancyNo: vac.vacancyNo || vac.vacancy_no || '',
      title: vac.title || '',
      serviceGroup: vac.serviceGroup || vac.service_group || 'प्रशासन / प्राविधिक',
      level: vac.level || 'सहायक पाँचौं (5th Level)',
      openingsCount: Number(vac.openingsCount || vac.openings_count || 1),
      employmentType: vac.employmentType || vac.employment_type || 'करार सेवा (Contract)',
      applicationFee: Number(vac.applicationFee || (vac as any).application_fee || 500),
      inclusiveGroupFee: Number(vac.inclusiveGroupFee || (vac as any).inclusive_group_fee || 200),
      minQualification: vac.minQualification || vac.min_qualification || '',
      publishDateBs: vac.publishDateBs || vac.publish_date_bs || '',
      deadlineDateBs: vac.deadlineDateBs || vac.deadline_date_bs || '',
      examDateBs: vac.examDateBs !== undefined && vac.examDateBs !== null ? vac.examDateBs : (vac.exam_date_bs || ''),
      examCenter: vac.examCenter !== undefined && vac.examCenter !== null ? vac.examCenter : (vac.exam_center || ''),
      status: vac.status || 'खुला (Active)',
      description: vac.description || '',
    });
    setShowEditVacancyModal(true);
  };

  // Verify Form
  const [verifyForm, setVerifyForm] = useState({
    status: 'स्वीकृत (Approved)',
    rejectionReason: '',
    admitCardRollNo: '',
    examCenter: '',
    examDateTime: '',
  });

  // HRMS Onboarding State
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [onboardingApp, setOnboardingApp] = useState<Application | null>(null);
  const [isOnboardingLoading, setIsOnboardingLoading] = useState(false);
  const [onboardSuccessData, setOnboardSuccessData] = useState<any>(null);

  const [onboardForm, setOnboardForm] = useState({
    employeeId: '',
    department: 'प्रशासन तथा सामान्य प्रशासन शाखा',
    designation: '',
    levelGrade: 'सहायक पाँचौं (Assistant 5th)',
    serviceGroup: 'नेपाल प्रशासन सेवा',
    employmentType: 'करार सेवा (Contract)',
    appointmentDateBs: '२०८१-०८-०१',
    joinDateBs: '२०८१-०८-०१',
    remarks: '',
  });

  const openOnboardModal = (app: Application) => {
    setOnboardingApp(app);
    setOnboardSuccessData(null);
    const postTitle = app.postTitle || app.post_title || 'सहायक पाँचौं';
    const isTechnical = postTitle.includes('इन्जिनियर') || postTitle.includes('अमिन') || postTitle.includes('प्राविधिक');
    
    // Auto-suggest next employee ID format: EMP-2081-XXXX
    const randomDigits = String(Math.floor(1000 + Math.random() * 9000));
    const suggestedEmpId = app.onboardedEmployeeId || app.onboarded_employee_id || `EMP-2081-${randomDigits}`;

    setOnboardForm({
      employeeId: suggestedEmpId,
      department: isTechnical ? 'योजना तथा भौतिक पूर्वाधार विकास शाखा' : 'प्रशासन तथा सामान्य प्रशासन शाखा',
      designation: postTitle,
      levelGrade: postTitle.includes('अधिकृत') ? 'अधिकृत छैटौं (Officer 6th)' : 'सहायक पाँचौं (Assistant 5th)',
      serviceGroup: isTechnical ? 'नेपाल इन्जिनियरिङ्ग सेवा' : 'नेपाल प्रशासन सेवा',
      employmentType: 'करार सेवा (Contract)',
      appointmentDateBs: '२०८१-०८-०१',
      joinDateBs: '२०८१-०८-०१',
      remarks: `विज्ञापन नं: ${app.vacancyNo || app.vacancy_no || ''} (आवेदन नं: ${app.applicationNo || app.application_no || ''}) बाट छनोट भई पदस्थापन`,
    });
    setShowOnboardModal(true);
  };

  const handleConfirmOnboard = async () => {
    if (!onboardingApp) return;
    setIsOnboardingLoading(true);
    try {
      const res: any = await api.post(`/recruitment/applications/${onboardingApp.id}/onboard-to-hrms`, onboardForm);
      const data = res.data || res;
      if (data.success) {
        setOnboardSuccessData(data);
        queryClient.invalidateQueries({ queryKey: ['recruitment-applications'] });
        queryClient.invalidateQueries({ queryKey: ['recruitment-summary'] });
      }
    } catch (err: any) {
      alert('HRMS मा दर्ता गर्न सकिएन: ' + (err?.response?.data?.detail || err.message));
    } finally {
      setIsOnboardingLoading(false);
    }
  };

  // Calculate live application fee
  const calculatedFee = React.useMemo(() => {
    const base = Number(applyForm.baseFee || 500);
    const incFee = Number(applyForm.inclusiveGroupFee || 200);
    const extraCount = applyForm.selectedInclusive.filter(c => c !== 'खुला').length;
    return base + (extraCount * incFee);
  }, [applyForm.baseFee, applyForm.inclusiveGroupFee, applyForm.selectedInclusive]);

  // QR Code Generator Effect for NIMB Account 18301400000109 with Instant Fallback
  useEffect(() => {
    const rawQr = activePaymentTxn?.qr_data || activePaymentTxn?.qrData || activePaymentTxn?.parameters?.qrData;
    const appNo = savedDraftApp?.applicationNo || savedDraftApp?.application_no || activePaymentTxn?.application_no || 'PTRM-2083-XXXX';
    const amountVal = Number(activePaymentTxn?.amount || calculatedFee || 1000).toFixed(2);

    // Standard EMVCo & Fonepay/NepalPay QR payload for NIMB Account 18301400000109
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
  }, [activePaymentTxn, savedDraftApp, calculatedFee, wizardStep]);

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

// Selected active vacancy for application form
const selectedVacancy = useMemo(
  () => vacancies.find(v => v.id === applyForm.vacancyId),
  [vacancies, applyForm.vacancyId]
);
const isTeacherPost = useMemo(
  () => Boolean(
    (selectedVacancy?.level || '').includes('शिक्षक') ||
    (applyForm.postTitle || '').includes('शिक्षक')
  ),
  [selectedVacancy, applyForm.postTitle]
);

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

  if (isTeacherPost && !applyForm.teachingLicenseDocUrl) {
    alert('शिक्षक पदको लागि अध्यापन अनुमति पत्र (Teaching License) अनिवार्य छ। कृपया अध्यापन अनुमति पत्रको प्रतिलिपि अपलोड गर्नुहोस्।');
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
      teachingLicenseNo: applyForm.teachingLicenseNo,
      experienceYears: applyForm.experienceYears,
      inclusiveCategories: applyForm.selectedInclusive.join(', '),
      paymentMethod: selectedGateway,
      photoUrl: applyForm.photoUrl,
      signatureUrl: applyForm.signatureUrl,
      citizenshipDocUrl: applyForm.citizenshipDocUrl,
      qualificationDocUrl: applyForm.qualificationDocUrl,
      applicationLetterDocUrl: applyForm.applicationLetterDocUrl,
      teachingLicenseDocUrl: applyForm.teachingLicenseDocUrl,
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

// Vacancy Update Mutation
const updateVacancyMutation = useMutation({
  mutationFn: async ({ id, data }: { id: string; data: any }) => {
    return await api.put(`/recruitment/vacancies/${encodeURIComponent(id)}`, data);
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['recruitment-vacancies'] });
    queryClient.invalidateQueries({ queryKey: ['recruitment-summary'] });
    setShowEditVacancyModal(false);
    setEditingVacancy(null);
    alert('विज्ञापन विवरण सफलतापूर्वक संशोधन (Update) गरियो!');
  },
  onError: (err: any) => {
    alert('विज्ञापन संशोधन असफल भयो: ' + (err?.response?.data?.detail || err.message));
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
              ? `${dynamicPalikaName} — खुला अनलाइन दरखास्त तथा पदपूर्ति पोर्टल`
              : 'अनलाइन दरखास्त, भुक्तानी तथा कर्मचारी पदपूर्ति व्यवस्थापन प्रणाली'}
          </h1>
          <p className="rec-hero-desc">
            {isPublicView
              ? 'खुला विज्ञापन तथा पदहरू हेर्नुहोस्, ५-चरणको अनलाइन आवेदन फारम भर्नुहोस्, Fonepay QR/eSewa/ConnectIPS बाट तत्काल शुल्क तिरी डिजिटल रसिद र प्रवेशपत्र प्राप्त गर्नुहोस्।'
              : `${dynamicPalikaName} — रिक्त पदहरूमा विज्ञापन, डिजिटल राजस्व भुक्तानी रुजु, रोल नम्बर बाँडफाँड, परीक्षा केन्द्र तथा वित्तीय मेलमिलाप व्यवस्थापन।`}
          </p>
        </div>

        {/* Quick Action Buttons */}
        {isPublicView ? (
          <div className="rec-hero-actions">
            <a
              href="/HOW_TO_APPLY.html"
              target="_blank"
              rel="noopener noreferrer"
              className="rec-btn rec-btn-hero-guide"
              style={{ fontSize: '0.98rem', padding: '0.8rem 1.6rem', boxShadow: '0 4px 18px rgba(2, 132, 199, 0.45)' }}
            >
              <Sparkles size={18} />
              <span>दरखास्त कसरी दिने ? (सचित्र गाइड)</span>
            </a>
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

      {/* Real-time Summary KPI Cards - Visible only in Administrative View */}
      {!isPublicView && (
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
      )}
    </div>

    {/* 2. NAVIGATION TABS */}
    {!isPublicView ? (
      /* ADMIN BALANCED 2-LINE TABS (3 CARDS x 2 ROWS) */
      <div className="rec-tabs-grid rec-tabs-admin">
        {/* Row 1 - Card 1: Vacancies */}
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

        {/* Row 1 - Card 2: Applications Review Desk */}
        <button
          onClick={() => setActiveTab('applications')}
          className={`rec-tab-card ${activeTab === 'applications' ? 'active-applications' : ''}`}
        >
          <div className="rec-tab-card-left">
            <div className="rec-tab-icon-box" style={{ background: '#eff6ff', color: '#2563eb' }}>
              <UserCheck size={22} />
            </div>
            <div className="rec-tab-text-group">
              <div className="rec-tab-title">दरखास्त रुजु तथा पदपूर्ति</div>
              <div className="rec-tab-subtitle">छानबिन, स्वीकृत तथा HRMS दर्ता</div>
            </div>
          </div>
          <span className="rec-tab-pill-badge" style={{ background: '#dbeafe', color: '#1d4ed8' }}>
            {applications.length} उम्मेदवार
          </span>
        </button>

        {/* Row 1 - Card 3: Finance & Reconciliation */}
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
              <div className="rec-tab-subtitle">Fonepay QR, eSewa, ConnectIPS</div>
            </div>
          </div>
          <span className="rec-tab-pill-badge" style={{ background: '#d1fae5', color: '#065f46' }}>
            राजस्व
          </span>
        </button>

        {/* Row 2 - Card 4: Security & Audit Logs */}
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

        {/* Row 2 - Card 5: Apply Form Preview */}
        <button
          onClick={() => {
            setWizardStep(1);
            setActiveTab('apply');
          }}
          className={`rec-tab-card ${activeTab === 'apply' ? 'active-apply' : ''}`}
        >
          <div className="rec-tab-card-left">
            <div className="rec-tab-icon-box" style={{ background: '#fffbeb', color: '#d97706' }}>
              <FileText size={22} />
            </div>
            <div className="rec-tab-text-group">
              <div className="rec-tab-title">अनलाइन दरखास्त फारम</div>
              <div className="rec-tab-subtitle">५-चरणको डिजिटल आवेदन पूर्वावलोकन</div>
            </div>
          </div>
          <span className="rec-tab-pill-badge" style={{ background: '#fef3c7', color: '#b45309' }}>
            Apply Now
          </span>
        </button>

        {/* Row 2 - Card 6: Admit Card Status */}
        <button
          onClick={() => setActiveTab('admitCard')}
          className={`rec-tab-card ${activeTab === 'admitCard' ? 'active-admit' : ''}`}
        >
          <div className="rec-tab-card-left">
            <div className="rec-tab-icon-box" style={{ background: '#f0f9ff', color: '#0284c7' }}>
              <QrCode size={22} />
            </div>
            <div className="rec-tab-text-group">
              <div className="rec-tab-title">प्रवेशपत्र तथा आवेदन स्थिति</div>
              <div className="rec-tab-subtitle">रसिद, प्रवेशपत्र र बाँकी शुल्क भुक्तानी</div>
            </div>
          </div>
          <span className="rec-tab-pill-badge" style={{ background: '#e0f2fe', color: '#0369a1' }}>
            Admit Card
          </span>
        </button>
      </div>
    ) : (
      /* CITIZEN PUBLIC 3-CARD HERO TABS */
      <div className="rec-tabs-grid rec-tabs-public">
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
                {vacancies.filter(v => v.status.includes('खुला')).length} पदहरूमा दरखास्त आह्वान
              </div>
            </div>
          </div>
          <span className="rec-tab-pill-badge">{vacancies.length} पद</span>
        </button>

        {/* Tab 2: 5-Step Online Apply Form */}
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
              <div className="rec-tab-subtitle">५-चरणको डिजिटल आवेदन र भुक्तानी</div>
            </div>
          </div>
          <span className="rec-tab-pill-badge">Apply Now</span>
        </button>

        {/* Tab 3: Digital Admit Card */}
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
    )}

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

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {!isPublicView && (
              <button
                onClick={() => setShowAddVacancyModal(true)}
                className="rec-btn rec-btn-primary"
                style={{ fontSize: '0.82rem', padding: '0.45rem 0.95rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Plus size={15} /> नयाँ विज्ञापन थप्नुहोस्
              </button>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#64748b' }}>
              <Landmark size={15} color="#0284c7" />
              <span>डिजिटल भुक्तानी: Fonepay QR, ConnectIPS, eSewa, Khalti स्वीकृत</span>
            </div>
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span className={isActive ? 'rec-badge-active' : 'rec-badge-closed'}>
                          <span className="rec-pulse-dot" />
                          {vac.status}
                        </span>
                      </div>
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

                      <button
                        onClick={() => {
                          setSelectedNoticeVacancy(vac);
                          setShowExamNoticeModal(true);
                        }}
                        className="rec-btn rec-btn-outline"
                        style={{ color: '#1e3a8a', background: '#eff6ff', borderColor: '#bfdbfe', fontSize: '0.78rem', padding: '0.4rem 0.75rem', fontWeight: 700 }}
                        title="केन्द्रीकृत लेटरहेडमा आधिकारिक परीक्षा सूचना हेर्नुहोस् र प्रिन्ट गर्नुहोस्"
                      >
                        <FileText size={14} /> परीक्षा सूचना
                      </button>

                      <button
                        onClick={() => {
                          setSelectedAttendanceVacancy(vac);
                          setShowAttendanceSheetModal(true);
                        }}
                        className="rec-btn rec-btn-outline"
                        style={{ color: '#065f46', background: '#ecfdf5', borderColor: '#a7f3d0', fontSize: '0.78rem', padding: '0.4rem 0.75rem', fontWeight: 700 }}
                        title="परीक्षा हल उम्मेदवार हाजिरी तथा रुजु फारम हेर्नुहोस् र प्रिन्ट गर्नुहोस्"
                      >
                        <Users size={14} /> हाजिरी फारम
                      </button>

                      {!isPublicView && (
                        <button
                          onClick={() => openEditVacancyModal(vac)}
                          className="rec-btn"
                          style={{
                            background: '#fef3c7',
                            color: '#92400e',
                            border: '1px solid #fde68a',
                            fontSize: '0.78rem',
                            padding: '0.4rem 0.75rem',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                          title="विज्ञापन संशोधन / सम्पादन गर्नुहोस्"
                        >
                          <Pencil size={13} /> संशोधन (Edit)
                        </button>
                      )}
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
                          {(app.onboardedEmployeeId || app.onboarded_employee_id) && (
                            <div style={{ marginTop: '0.3rem' }}>
                              <a
                                href="/app/employees"
                                className="rec-onboard-success-badge"
                                title="कर्मचारी व्यवस्थापन (HRMS) मा विवरण हेर्नुहोस्"
                              >
                                <CheckCircle size={11} /> {app.onboardedEmployeeId || app.onboarded_employee_id}
                              </a>
                            </div>
                          )}
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
                                  admitCardRollNo: app.admitCardRollNo || app.admit_card_roll_no || `2083-ROLL-${String(Math.floor(Math.random() * 899) + 100)}`,
                                  examCenter: app.examCenter || app.exam_center || vacancies.find((v: any) => v.id === app.vacancyId || v.vacancyNo === app.vacancyNo || v.vacancy_no === app.vacancy_no)?.examCenter || vacancies.find((v: any) => v.id === app.vacancyId || v.vacancyNo === app.vacancyNo || v.vacancy_no === app.vacancy_no)?.exam_center || '',
                                  examDateTime: app.examDateTime || app.exam_date_time || vacancies.find((v: any) => v.id === app.vacancyId || v.vacancyNo === app.vacancyNo || v.vacancy_no === app.vacancy_no)?.examDateBs || vacancies.find((v: any) => v.id === app.vacancyId || v.vacancyNo === app.vacancyNo || v.vacancy_no === app.vacancy_no)?.exam_date_bs || '',
                                });
                                setShowVerifyModal(true);
                              }}
                              className="rec-icon-btn rec-icon-btn-verify"
                              title="रुजु तथा निर्णय गर्नुहोस्"
                            >
                              <ShieldCheck size={15} />
                            </button>

                            {/* Approval Letter Action */}
                            {app.status.includes('स्वीकृत') && (
                              <button
                                onClick={() => {
                                  setSelectedApprovalApp(app);
                                  setShowApprovalLetterModal(true);
                                }}
                                className="rec-icon-btn"
                                style={{ background: '#eff6ff', color: '#1d4ed8', borderColor: '#bfdbfe' }}
                                title="आधिकारिक आवेदन स्वीकृति पत्र (Approval Letter) हेर्नुहोस् र प्रिन्ट गर्नुहोस्"
                              >
                                <FileCheck size={15} />
                              </button>
                            )}

                            {/* HRMS Onboarding Action */}
                            {app.onboardedEmployeeId || app.onboarded_employee_id ? (
                              <>
                                <a
                                  href="/app/employees"
                                  className="rec-icon-btn rec-icon-btn-onboarded"
                                  title={`HRMS मा दर्ता सम्पन्न (संकेत नं: ${app.onboardedEmployeeId || app.onboarded_employee_id}) - HRMS प्रोफाइल हेर्नुहोस्`}
                                >
                                  <UserCheck size={15} />
                                </a>
                                <button
                                  onClick={() => {
                                    setSelectedAppointmentApp(app);
                                    setShowAppointmentModal(true);
                                  }}
                                  className="rec-icon-btn"
                                  style={{ background: '#fef3c7', color: '#b45309', borderColor: '#fde68a' }}
                                  title="करार नियुक्ति तथा पदस्थापन पत्र (Appointment Letter) हेर्नुहोस् र प्रिन्ट गर्नुहोस्"
                                >
                                  <Award size={15} />
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => openOnboardModal(app)}
                                className="rec-icon-btn rec-icon-btn-onboard"
                                title="कर्मचारी अभिलेख तथा व्यक्तिगत विवरण (HRMS) मा OnBoarding दर्ता गर्नुहोस्"
                              >
                                <UserPlus size={15} />
                              </button>
                            )}

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
                  <label className="rec-label">
                    अध्यापन अनुमति पत्र नं {isTeacherPost ? <span className="rec-req">*</span> : '(लागू भएमा)'}
                  </label>
                  <input
                    type="text"
                    placeholder="शिक्षक सेवा आयोग अनुमति पत्र नं"
                    value={applyForm.teachingLicenseNo}
                    onChange={(e) => setApplyForm({ ...applyForm, teachingLicenseNo: e.target.value })}
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

                  {/* 5. Application Letter / Nivedan */}
                  <div className={`rec-doc-box ${applyForm.applicationLetterDocUrl ? 'has-file' : ''}`}>
                    <div className="rec-doc-header">
                      <div className="rec-doc-icon-badge">
                        {applyForm.applicationLetterDocUrl ? <CheckCircle2 size={20} color="#059669" /> : <FileText size={18} />}
                      </div>
                      <div className="rec-doc-info">
                        <h4 className="rec-doc-title">निवेदन (Application Letter) <span className="rec-req">*</span></h4>
                        <p className="rec-doc-subtitle">हस्तलिखित वा टाइप निवेदन (PDF/JPG)</p>
                      </div>
                    </div>
                    {applyForm.applicationLetterDocUrl ? (
                      <div className="rec-doc-preview-area">
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0369a1' }}>निवेदन संलग्न छ</span>
                        <div className="rec-doc-actions">
                          <a href={applyForm.applicationLetterDocUrl} target="_blank" rel="noopener noreferrer" className="rec-doc-view-btn">हेर्नुहोस्</a>
                          <button type="button" onClick={() => handleRemoveFile('applicationLetterDocUrl')} className="rec-doc-remove-btn">हटाउनुहोस्</button>
                        </div>
                      </div>
                    ) : (
                      <label className="rec-doc-upload-trigger">
                        <UploadCloud size={16} /> <span>निवेदन छनोट गर्नुहोस्</span>
                        <input type="file" accept=".pdf,image/*" onChange={(e) => handleFileUpload('applicationLetterDocUrl', e)} style={{ display: 'none' }} />
                      </label>
                    )}
                  </div>

                  {/* 6. Teaching License */}
                  <div className={`rec-doc-box ${applyForm.teachingLicenseDocUrl ? 'has-file' : ''}`}>
                    <div className="rec-doc-header">
                      <div className="rec-doc-icon-badge">
                        {applyForm.teachingLicenseDocUrl ? <CheckCircle2 size={20} color="#059669" /> : <Award size={18} />}
                      </div>
                      <div className="rec-doc-info">
                        <h4 className="rec-doc-title">
                          अध्यापन अनुमति पत्र {isTeacherPost ? <span className="rec-req">*</span> : <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 400 }}>(शिक्षक पदको लागि)</span>}
                        </h4>
                        <p className="rec-doc-subtitle">शिक्षक सेवा आयोगबाट जारी अनुमति पत्र</p>
                      </div>
                    </div>
                    {applyForm.teachingLicenseDocUrl ? (
                      <div className="rec-doc-preview-area">
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0369a1' }}>अनुमति पत्र संलग्न छ</span>
                        <div className="rec-doc-actions">
                          <a href={applyForm.teachingLicenseDocUrl} target="_blank" rel="noopener noreferrer" className="rec-doc-view-btn">हेर्नुहोस्</a>
                          <button type="button" onClick={() => handleRemoveFile('teachingLicenseDocUrl')} className="rec-doc-remove-btn">हटाउनुहोस्</button>
                        </div>
                      </div>
                    ) : (
                      <label className="rec-doc-upload-trigger">
                        <UploadCloud size={16} /> <span>अनुमति पत्र छनोट</span>
                        <input type="file" accept=".pdf,image/*" onChange={(e) => handleFileUpload('teachingLicenseDocUrl', e)} style={{ display: 'none' }} />
                      </label>
                    )}
                  </div>

                  {/* 7. Council Certificate (Optional / Technical) */}
                  <div className={`rec-doc-box ${applyForm.councilDocUrl ? 'has-file' : ''}`}>
                    <div className="rec-doc-header">
                      <div className="rec-doc-icon-badge">
                        {applyForm.councilDocUrl ? <CheckCircle2 size={20} color="#059669" /> : <ShieldCheck size={18} />}
                      </div>
                      <div className="rec-doc-info">
                        <h4 className="rec-doc-title">काउन्सिल दर्ता प्रमाणपत्र <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 400 }}>(लागू हुने पदमा)</span></h4>
                        <p className="rec-doc-subtitle">NEC / NNC / स्वास्थ्य काउन्सिल (PDF/JPG)</p>
                      </div>
                    </div>
                    {applyForm.councilDocUrl ? (
                      <div className="rec-doc-preview-area">
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0369a1' }}>काउन्सिल प्रमाणपत्र संलग्न</span>
                        <div className="rec-doc-actions">
                          <a href={applyForm.councilDocUrl} target="_blank" rel="noopener noreferrer" className="rec-doc-view-btn">हेर्नुहोस्</a>
                          <button type="button" onClick={() => handleRemoveFile('councilDocUrl')} className="rec-doc-remove-btn">हटाउनुहोस्</button>
                        </div>
                      </div>
                    ) : (
                      <label className="rec-doc-upload-trigger">
                        <UploadCloud size={16} /> <span>काउन्सिल प्रमाणपत्र छनोट</span>
                        <input type="file" accept=".pdf,image/*" onChange={(e) => handleFileUpload('councilDocUrl', e)} style={{ display: 'none' }} />
                      </label>
                    )}
                  </div>

                  {/* 8. Experience / Training */}
                  <div className={`rec-doc-box ${applyForm.experienceDocUrl ? 'has-file' : ''}`}>
                    <div className="rec-doc-header">
                      <div className="rec-doc-icon-badge">
                        {applyForm.experienceDocUrl ? <CheckCircle2 size={20} color="#059669" /> : <FileText size={18} />}
                      </div>
                      <div className="rec-doc-info">
                        <h4 className="rec-doc-title">कार्य अनुभव तथा तालिम <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 400 }}>(ऐच्छिक)</span></h4>
                        <p className="rec-doc-subtitle">अनुभव वा तालिमका प्रमाणपत्रहरू</p>
                      </div>
                    </div>
                    {applyForm.experienceDocUrl ? (
                      <div className="rec-doc-preview-area">
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0369a1' }}>अनुभव प्रमाणपत्र संलग्न</span>
                        <div className="rec-doc-actions">
                          <a href={applyForm.experienceDocUrl} target="_blank" rel="noopener noreferrer" className="rec-doc-view-btn">हेर्नुहोस्</a>
                          <button type="button" onClick={() => handleRemoveFile('experienceDocUrl')} className="rec-doc-remove-btn">हटाउनुहोस्</button>
                        </div>
                      </div>
                    ) : (
                      <label className="rec-doc-upload-trigger">
                        <UploadCloud size={16} /> <span>अनुभव/तालिम छनोट</span>
                        <input type="file" accept=".pdf,image/*" onChange={(e) => handleFileUpload('experienceDocUrl', e)} style={{ display: 'none' }} />
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

              {/* Gateway Active Screen: Official NIMB Revenue Transfer */}
              {selectedGateway === 'FONEPAY' && (
                <div className="rec-qr-display-card" style={{ maxWidth: '540px', margin: '0 auto', textAlign: 'left' }}>
                  {/* Bank & Account Official Banner */}
                  <div style={{ background: '#eff6ff', border: '2px solid #93c5fd', borderRadius: '12px', padding: '1rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1e40af', fontWeight: 800, fontSize: '0.92rem' }}>
                      <Landmark size={20} />
                      <span>नेपाल इन्भेष्टमेन्ट मेगा बैंक (NIMB) — गाउँपालिका आन्तरिक राजस्व खाता</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#1e293b', marginTop: '0.4rem', lineHeight: 1.5 }}>
                      खातावालाको नाम: <strong>GA 1.1 PANCHPOKHARI THANGPAL GA.PA. AANTARIK RAJASHO KHATA</strong>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#334155', marginTop: '0.2rem' }}>
                      शाखा: <strong>पाँचपोखरी थाङपाल शाखा, सिन्धुपाल्चोक</strong>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px dashed #93c5fd' }}>
                      <span style={{ fontSize: '0.82rem', color: '#1e40af', fontWeight: 700 }}>आधिकारिक खाता नम्बर:</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontFamily: 'monospace', fontWeight: 900, color: '#0f172a', fontSize: '1.15rem', letterSpacing: '1px' }}>
                          18301400000109
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText('18301400000109');
                            alert('NIMB खाता नं 18301400000109 कपी भयो!');
                          }}
                          style={{ background: '#1d4ed8', border: 'none', borderRadius: '6px', padding: '0.25rem 0.65rem', fontSize: '0.74rem', cursor: 'pointer', color: '#ffffff', fontWeight: 700 }}
                        >
                          कपी गर्नुहोस्
                        </button>
                      </div>
                    </div>
                  </div>

                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.85rem 1rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <span style={{ fontSize: '0.82rem', color: '#64748b' }}>दाखिला गर्नुपर्ने दस्तुर रकम:</span>
                      <strong style={{ fontSize: '1.25rem', color: '#15803d' }}>
                        रु. {Number(activePaymentTxn?.amount || calculatedFee).toLocaleString('ne-NP')} /-
                      </strong>
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                      कारोबार संकेत: <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{activePaymentTxn?.transaction_uuid || activePaymentTxn?.transactionUuid}</span>
                    </div>
                  </div>

                  {/* Payment Instructions */}
                  <div style={{ background: '#fefce8', border: '1px solid #fef08a', borderRadius: '10px', padding: '0.85rem 1rem', marginBottom: '1rem', fontSize: '0.78rem', color: '#713f12' }}>
                    <strong style={{ display: 'block', marginBottom: '0.35rem', color: '#854d0e', fontSize: '0.82rem' }}>
                      📌 रकम दाखिला गर्ने तरिका (Payment Instructions):
                    </strong>
                    <ol style={{ margin: 0, paddingLeft: '1.2rem', lineHeight: 1.6 }}>
                      <li>आफ्नो जुनसुकै बैंकको <strong>Mobile Banking एप</strong> (NIMB Smart, Global Smart, NIC Asia MoBank, Nabil Smart, आदि) वा <strong>ConnectIPS / eSewa</strong> खोल्नुहोस्।</li>
                      <li><strong>'Fund Transfer'</strong> वा <strong>'Send Money'</strong> मा गई माथिको खाता नम्बर (<strong>18301400000109</strong>) मा रु. {Number(activePaymentTxn?.amount || calculatedFee).toLocaleString('ne-NP')} ट्रान्सफर गर्नुहोस् (वा बैंक काउन्टरमा भौचर दाखिला गर्नुहोस्)।</li>
                      <li><strong>Remarks</strong> मा आफ्नो नाम र दरखास्त नम्बर (<strong>{savedDraftApp?.applicationNo || savedDraftApp?.application_no}</strong>) उल्लेख गर्नुहोस्।</li>
                      <li>भुक्तानी सम्पन्न भएपछि प्राप्त <strong>कारोबार संकेत (Transaction ID / भौचर नं.)</strong> तल राखी भौचर/स्क्रिनसट अपलोड गर्नुहोस्।</li>
                    </ol>
                  </div>

                  {/* Voucher Upload & Input */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div>
                      <label className="rec-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                        कारोबार / भौचर नम्बर (Txn / Voucher ID)
                      </label>
                      <input
                        type="text"
                        placeholder="उदा: TXN-12345 वा भौचर नं"
                        value={applyForm.paymentVoucherNo || ''}
                        onChange={(e) => setApplyForm({ ...applyForm, paymentVoucherNo: e.target.value })}
                        className="rec-input-control"
                        style={{ padding: '0.45rem 0.65rem', fontSize: '0.82rem' }}
                      />
                    </div>
                    <div>
                      <label className="rec-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                        भौचर / स्क्रिनसट (Payment Receipt)
                      </label>
                      {applyForm.paymentVoucherDocUrl ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', height: '36px' }}>
                          <span style={{ fontSize: '0.74rem', color: '#059669', fontWeight: 700 }}>संलग्न छ</span>
                          <a href={applyForm.paymentVoucherDocUrl} target="_blank" rel="noopener noreferrer" className="rec-doc-view-btn" style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}>हेर्नुहोस्</a>
                          <button type="button" onClick={() => handleRemoveFile('paymentVoucherDocUrl')} className="rec-doc-remove-btn" style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}>हटाउनुहोस्</button>
                        </div>
                      ) : (
                        <label className="rec-doc-upload-trigger" style={{ padding: '0.35rem 0.65rem', minHeight: '36px', height: '36px', fontSize: '0.76rem' }}>
                          <UploadCloud size={14} /> <span>भौचर अपलोड</span>
                          <input type="file" accept=".pdf,image/*" onChange={(e) => handleFileUpload('paymentVoucherDocUrl', e)} style={{ display: 'none' }} />
                        </label>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleVerifyPayment}
                    disabled={isVerifyingPayment}
                    className="rec-btn rec-btn-success"
                    style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem', justifyContent: 'center' }}
                  >
                    {isVerifyingPayment ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        दरखास्त रुजुका लागि दर्ता गरिँदैछ...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={18} />
                        मैले रकम दाखिला गरें — दरखास्त सुरक्षित गर्नुहोस् (Confirm & Submit)
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
                    तपाईंको दरखास्त नम्बर (उदा: PTRM-2083-0001) वा नागरिकता नम्बर वा मोबाइल नम्बर प्रविष्ट गरी खोजी गर्नुहोस्।
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

                    {/* Document Correction Window Banner if status is कागजात अपूरो */}
                    {(admitCardResult.application.status || '').includes('कागजात अपूरो') && (
                      <div style={{ background: '#fffbeb', border: '2px solid #f59e0b', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1rem' }}>
                          <div style={{ background: '#fef3c7', padding: '0.5rem', borderRadius: '8px', color: '#d97706' }}>
                            <AlertTriangle size={26} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#92400e' }}>
                              ⚠️ कागजात अपूरो / सच्याउन अनुरोध (Document Correction Required)
                            </h4>
                            <p style={{ margin: '0.35rem 0 0', fontSize: '0.82rem', color: '#78350f', lineHeight: 1.6 }}>
                              <strong>प्रशासकीय निर्देशन / कैफियत:</strong> {admitCardResult.application.rejectionReason || admitCardResult.application.rejection_reason || 'माग भए बमोजिमको कागजात स्पष्ट रूपमा पुनः अपलोड गर्नुहोस्।'}
                            </p>
                          </div>
                        </div>

                        {resubmitSuccessMsg ? (
                          <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <CheckCircle size={18} /> {resubmitSuccessMsg}
                          </div>
                        ) : (
                          <form
                            onSubmit={async (e) => {
                              e.preventDefault();
                              if (!resubmitFileUrl) {
                                alert('कृपया नयाँ कागजात फाइल छनोट गरी अपलोड गर्नुहोस्।');
                                return;
                              }
                              if (!resubmitAuthInput) {
                                alert('सुरक्षा प्रमाणीकरणको लागि दर्ता भएको फोन वा नागरिकता नम्बर प्रविष्ट गर्नुहोस्।');
                                return;
                              }
                              setIsResubmitting(true);
                              try {
                                const appNo = admitCardResult.application.applicationNo || admitCardResult.application.application_no;
                                const res: any = await api.post(`/recruitment/applications/${appNo}/resubmit-document`, {
                                  phoneOrCitizenship: resubmitAuthInput,
                                  docType: resubmitDocType,
                                  newDocUrl: resubmitFileUrl,
                                  candidateRemarks: resubmitCandidateRemarks
                                });
                                setResubmitSuccessMsg(res?.message || 'कागजात सफलतापूर्वक पेश भयो। प्रशासनबाट रुजु गरिनेछ।');
                                handleSearchAdmitCard();
                                refetchApps();
                              } catch (err: any) {
                                alert(err?.response?.data?.detail || 'कागजात पुनः पेश गर्दा त्रुटि भयो। कृपया विवरण जाँच गर्नुहोस्।');
                              } finally {
                                setIsResubmitting(false);
                              }
                            }}
                            style={{ background: '#ffffff', border: '1px solid #fde68a', borderRadius: '10px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}
                          >
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                              <div className="rec-field-group">
                                <label className="rec-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                                  सच्याउनुपर्ने कागजात छनोट <span className="rec-req">*</span>
                                </label>
                                <select
                                  value={resubmitDocType}
                                  onChange={(e) => setResubmitDocType(e.target.value)}
                                  className="rec-input-control"
                                  style={{ padding: '0.45rem', fontSize: '0.82rem' }}
                                >
                                  <option value="teaching_license">अध्यापन अनुमति पत्र (Teaching License)</option>
                                  <option value="application_letter">निवेदन (Application Letter)</option>
                                  <option value="qualification">शैक्षिक योग्यता प्रमाणपत्र (Academic Certificate)</option>
                                  <option value="citizenship_front">नागरिकता प्रमाणपत्र अगाडि (Citizenship Front)</option>
                                  <option value="citizenship_back">नागरिकता प्रमाणपत्र पछाडि (Citizenship Back)</option>
                                  <option value="voucher">राजस्व भौचर (Bank / Payment Voucher)</option>
                                  <option value="photo">पासपोर्ट साइजको फोटो (Photo)</option>
                                </select>
                              </div>

                              <div className="rec-field-group">
                                <label className="rec-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                                  सुरक्षा प्रमाणीकरण (फोन वा नागरिकता नं.) <span className="rec-req">*</span>
                                </label>
                                <input
                                  type="text"
                                  required
                                  placeholder="फारममा भरेको मोबाइल वा नागरिकता नं."
                                  value={resubmitAuthInput}
                                  onChange={(e) => setResubmitAuthInput(e.target.value)}
                                  className="rec-input-control"
                                  style={{ padding: '0.45rem', fontSize: '0.82rem' }}
                                />
                              </div>
                            </div>

                            <div className="rec-field-group">
                              <label className="rec-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                                नयाँ सच्याइएको कागजात फाइल अपलोड <span className="rec-req">*</span> (JPG/PNG/PDF)
                              </label>
                              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <input
                                  type="file"
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    const formData = new FormData();
                                    formData.append('file', file);
                                    try {
                                      const res: any = await api.post('/recruitment/upload-document', formData, {
                                        headers: { 'Content-Type': 'multipart/form-data' }
                                      });
                                      setResubmitFileUrl(res.data?.url || res.url);
                                      alert('फाइल सफलतापूर्वक अपलोड भयो!');
                                    } catch {
                                      alert('फाइल अपलोड गर्न सकिएन।');
                                    }
                                  }}
                                  style={{ fontSize: '0.82rem' }}
                                />
                                {resubmitFileUrl && (
                                  <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 700 }}>
                                    ✓ फाइल तयार छ
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="rec-field-group">
                              <label className="rec-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                                उम्मेदवारको संक्षिप्त व्यहोरा / टिप्पणी (वैकल्पिक)
                              </label>
                              <input
                                type="text"
                                placeholder="उदा: माग भए बमोजिम अध्यापन अनुमति पत्रको स्पष्ट स्क्यान प्रति संलग्न गरेको छु।"
                                value={resubmitCandidateRemarks}
                                onChange={(e) => setResubmitCandidateRemarks(e.target.value)}
                                className="rec-input-control"
                                style={{ padding: '0.45rem', fontSize: '0.82rem' }}
                              />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.25rem' }}>
                              <button
                                type="submit"
                                disabled={isResubmitting || !resubmitFileUrl}
                                className="rec-btn rec-btn-primary"
                                style={{ background: '#d97706', fontSize: '0.84rem', padding: '0.5rem 1.25rem', fontWeight: 700 }}
                              >
                                {isResubmitting ? 'पेश गरिँदैछ...' : 'सच्याइएको कागजात पेश गर्नुहोस् (Submit)'}
                              </button>
                            </div>
                          </form>
                        )}
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
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              type="button"
                              onClick={() => setShowAdmitCardPreviewModal(true)}
                              className="rec-btn"
                              style={{
                                fontSize: '0.8rem',
                                padding: '0.45rem 0.85rem',
                                background: '#0284c7',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: 700,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                cursor: 'pointer'
                              }}
                            >
                              <Eye size={15} />
                              प्रवेशपत्र पूर्वावलोकन (Preview)
                            </button>
                            <button
                              type="button"
                              onClick={() => printElement('printable-admit-card', 'A4')}
                              className="rec-btn rec-btn-primary"
                              style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                            >
                              <Printer size={15} />
                              प्रवेशपत्र प्रिन्ट (Print)
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Printable Official Admit Card (Centralized Letterhead Sheet) */}
                    {admitCardResult.is_admit_card_ready && (() => {
                      const schedule = getExamDateTimeDetails(admitCardResult.application, admitCardResult.vacancy);
                      const rollNumber = admitCardResult.application.admitCardRollNo || admitCardResult.application.admit_card_roll_no || '2083-ROLL-001';
                      const chalaniNumber = admitCardResult.application.chalaniNo ||
                        admitCardResult.application.chalani_no ||
                        (rollNumber.includes('-') ? rollNumber.split('-').pop() : '३५२');
                      const examCenterVal = (admitCardResult.vacancy?.examCenter ||
                        admitCardResult.vacancy?.exam_center ||
                        admitCardResult.application?.examCenter ||
                        admitCardResult.application?.exam_center || '').trim();
                      const examDateVal = (admitCardResult.vacancy?.examDateBs ||
                        admitCardResult.vacancy?.exam_date_bs ||
                        admitCardResult.application?.examDateTime ||
                        admitCardResult.application?.exam_date_time || '').trim();
                      const showExamScheduleBanner = Boolean(examCenterVal || examDateVal);

                      return (
                        <CentralDocumentSheet
                          id="printable-admit-card"
                          className="rec-admit-official-card"
                          paperSize="A4"
                          palikaName={dynamicPalikaName}
                          palikaNameEn={dynamicPalikaNameEn}
                          localGovType="स्थानीय सरकार"
                          officeTitle={dynamicOfficeTitle}
                          location={dynamicAddress}
                          provinceCountry={dynamicProvinceCountry}
                          establishedYear="२०७३"
                          activeFiscalYear="२०८३/०८४"
                          patraSankhya="२०८३/०८४"
                          chalaniNo={chalaniNumber}
                          branchTitle="कर्मचारी पदपूर्ति तथा आन्तरिक परीक्षा सञ्चालन समिति"
                          branchPlacement="below-title"
                          documentTitle="प्रवेशपत्र (ADMIT CARD)"
                          slogan={dynamicSlogan}
                          website={dynamicWebsite}
                          email={dynamicEmail}
                          phone={dynamicPhone}
                          logoUrl={dynamicPalikaLogo}
                          emblemUrl={dynamicEmblemUrl}
                          dateBs="२०८३/०८/०५"
                          dateAd="2026-11-20"
                          showWatermark={true}
                          showFooter={true}
                        >
                          {/* Candidate Grid with Photo, Table and QR */}
                          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '0.65rem' }}>
                            {/* Table on Left */}
                            <div style={{ flex: 1 }}>
                              <div className="rec-admit-roll-banner" style={{ marginBottom: '0.45rem' }}>
                                <div>
                                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block' }}>रोल नम्बर (Roll No.):</span>
                                  <span className="rec-admit-roll-no">{rollNumber}</span>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block' }}>दरखास्त नं:</span>
                                  <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#334155', fontSize: '0.95rem' }}>
                                    {admitCardResult.application.applicationNo || admitCardResult.application.application_no}
                                  </span>
                                </div>
                              </div>

                              <table className="rec-admit-table">
                                <tbody>
                                  <tr>
                                    <td className="label-col">उम्मेदवारको नाम:</td>
                                    <td className="val-col">
                                      <strong>{admitCardResult.application.fullNameNp || admitCardResult.application.full_name_np}</strong>
                                      {admitCardResult.application.fullNameEn && ` (${admitCardResult.application.fullNameEn})`}
                                    </td>
                                  </tr>
                                  <tr>
                                    <td className="label-col">विज्ञापन नं:</td>
                                    <td className="val-col" style={{ color: '#0369a1', fontWeight: 700 }}>
                                      {admitCardResult.application.vacancyNo || admitCardResult.application.vacancy_no}
                                    </td>
                                  </tr>
                                  <tr>
                                    <td className="label-col">पद / सेवा / तह:</td>
                                    <td className="val-col">
                                      <strong>{admitCardResult.application.postTitle || admitCardResult.application.post_title}</strong>
                                      {admitCardResult.vacancy?.level && ` - ${admitCardResult.vacancy.level}`}
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

                            {/* Candidate Photo and Signature on Right */}
                            <div style={{ width: '120px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.45rem' }}>
                              <div className="rec-photo-paste-box" style={{ width: '110px', height: '130px', margin: 0 }}>
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

                              {/* Candidate Signature Box */}
                              <div style={{ width: '100%', textAlign: 'center', borderTop: '1px solid #cbd5e1', paddingTop: '4px' }}>
                                <span style={{ fontSize: '0.68rem', color: '#64748b', display: 'block' }}>उम्मेदवारको हस्ताक्षर</span>
                                <div style={{ height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  {admitCardResult.application.signatureUrl || admitCardResult.application.signature_url ? (
                                    <img
                                      src={admitCardResult.application.signatureUrl || admitCardResult.application.signature_url}
                                      alt="हस्ताक्षर"
                                      style={{ maxHeight: '26px', maxWidth: '100%', objectFit: 'contain' }}
                                    />
                                  ) : (
                                    <div style={{ width: '90%', borderBottom: '1px dashed #94a3b8', height: '100%' }} />
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Exam Schedule Banner with BS and AD dates (Shown only if exam date or center is specified) */}
                          {showExamScheduleBanner && (
                            <div className="rec-admit-exam-banner" style={{ margin: '0.45rem 0' }}>
                              {Boolean(examCenterVal) && (
                                <div>
                                  <span className="rec-exam-detail-title">परीक्षा केन्द्र (Exam Center):</span>
                                  <div className="rec-exam-detail-val" style={{ fontWeight: 800, color: '#0f172a' }}>
                                    {examCenterVal}
                                  </div>
                                </div>
                              )}
                              {Boolean(examDateVal) && (
                                <div>
                                  <span className="rec-exam-detail-title">परीक्षा मिति तथा समय (Exam Schedule):</span>
                                  <div className="rec-exam-detail-val rec-exam-time-val" style={{ fontWeight: 800 }}>
                                    <div>नेपाली (BS): <strong>{schedule.bs}</strong></div>
                                    {schedule.ad && <div style={{ fontSize: '0.8rem', color: '#0369a1', marginTop: '2px' }}>English (AD): {schedule.ad}</div>}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Instructions: Summarized from Official 14 Rules for perfect A4 fit */}
                          <div className="rec-admit-instructions" style={{ padding: '0.45rem 0.85rem', margin: '0.45rem 0', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                              <strong style={{ color: '#0f172a', fontSize: '0.76rem' }}>
                                उम्मेदवारले पालना गर्नुपर्ने नियमहरू (Rules & Instructions for Candidates):
                              </strong>
                              <span style={{ fontSize: '0.66rem', color: '#64748b', fontWeight: 600 }}>परीक्षा आचारसंहिता</span>
                            </div>
                            <ol style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.72rem', lineHeight: '1.45', color: '#1e293b' }}>
                              <li style={{ marginBottom: '2.5px' }}>
                                <strong>प्रवेशपत्र र पहिचान:</strong> परीक्षा दिन आउँदा यो प्रवेशपत्र र सक्कल नेपाली नागरिकता अनिवार्य साथमा ल्याउनुपर्नेछ (प्रवेशपत्र विना परीक्षामा बस्न पाइने छैन)। प्रयोगात्मक परीक्षा तथा अन्तर्वार्तामा समेत प्रवेशपत्र अनिवार्य छ।
                              </li>
                              <li style={{ marginBottom: '2.5px' }}>
                                <strong>समय पालना:</strong> परीक्षा सुरु हुनुभन्दा ३० मिनेट अगावै हलमा प्रवेश गर्नुपर्नेछ। वस्तुगत परीक्षा सुरु भएको १५ मिनेट र विषयगत परीक्षा सुरु भएको ३० मिनेटपछि आउने उम्मेदवारलाई परीक्षामा बस्न दिइने छैन।
                              </li>
                              <li style={{ marginBottom: '2.5px' }}>
                                <strong>निषेधित सामग्री:</strong> परीक्षा हलभित्र मोबाइल फोन, क्यालकुलेटर, स्मार्टवाच, कुनै पनि विद्युतीय उपकरण, पुस्तक, कापी वा चिट लैजान तथा आपसमा कुराकानी वा संकेत गर्न पूर्ण निषेध छ।
                              </li>
                              <li style={{ marginBottom: '2.5px' }}>
                                <strong>उत्तरपुस्तिका र "की" (Key):</strong> वस्तुगत परीक्षाको उत्तरपुस्तिकामा आफूलाई प्राप्त प्रश्नपत्रको "की" (Key) अनिवार्य लेख्नुपर्नेछ; नलेखेमा उत्तरपुस्तिका स्वतः रद्द हुनेछ। समावेशी समूहको व्यहोरा समेत खुलाउनुपर्नेछ।
                              </li>
                              <li>
                                <strong>मर्यादा र हाजिर:</strong> परीक्षामा दैनिक हाजिर अनिवार्य छ। परीक्षाको मर्यादा विपरीत कार्य गरेमा केन्द्राध्यक्षले तत्काल निष्कासन गरी कानुन बमोजिम कारबाही गर्नेछ।
                              </li>
                            </ol>
                          </div>

                          {/* Official Signatures Row */}
                          <div className="rec-admit-signatures" style={{ marginTop: '0.75rem', padding: '0 0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                            {/* Candidate Signature */}
                            <div style={{ textAlign: 'center', minWidth: '160px' }}>
                              <div style={{ height: '42px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', marginBottom: '2px' }}>
                                {admitCardResult.application.signatureUrl || admitCardResult.application.signature_url ? (
                                  <img
                                    src={admitCardResult.application.signatureUrl || admitCardResult.application.signature_url}
                                    alt="उम्मेदवारको हस्ताक्षर"
                                    style={{ maxHeight: '40px', maxWidth: '145px', objectFit: 'contain' }}
                                  />
                                ) : null}
                              </div>
                              <div className="rec-sig-line" style={{ width: '160px', borderTop: 'none', borderBottom: '1.5px solid #1e293b', margin: '0 auto 0.35rem auto' }}></div>
                              <span style={{ fontWeight: 800, fontSize: '0.82rem', color: '#0f172a' }}>उम्मेदवारको हस्ताक्षर</span>
                            </div>

                            {/* Committee / CAO Signature & Stamp Area */}
                            <div style={{ textAlign: 'center', minWidth: '220px' }}>
                              <div style={{ height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span style={{ fontSize: '0.66rem', color: '#94a3b8', fontStyle: 'italic' }}>[ हस्ताक्षर तथा कार्यालयको छाप ]</span>
                              </div>
                              <div className="rec-sig-line" style={{ width: '220px', borderTop: 'none', borderBottom: '1.5px solid #1e293b', margin: '0 auto 0.35rem auto' }}></div>
                              <span style={{ fontWeight: 800, fontSize: '0.82rem', color: '#0f172a', display: 'block', whiteSpace: 'nowrap' }}>
                                पदपूर्ति समिति / प्रमुख प्रशासकीय अधिकृत
                              </span>
                              <span style={{ fontSize: '0.74rem', color: '#475569', display: 'block', marginTop: '0.12rem', fontWeight: 600 }}>
                                {dynamicPalikaName}
                              </span>
                            </div>
                          </div>
                        </CentralDocumentSheet>
                      );
                    })()}
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
                      <div className="rec-receipt-watermark">
                        <img
                          src={dynamicPalikaLogo}
                          alt="Watermark"
                          style={{ width: '220px', height: '220px', objectFit: 'contain', opacity: 0.05, filter: 'grayscale(100%)' }}
                          onError={(e: any) => {
                            e.currentTarget.src = '/panchpokhari-logo.png';
                          }}
                        />
                      </div>
                      <div className="rec-receipt-header">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.5rem' }}>
                          <img
                            src={dynamicEmblemUrl}
                            alt="नेपाल सरकार निशाना छाप"
                            style={{ width: '56px', height: '56px', objectFit: 'contain' }}
                            onError={(e: any) => {
                              e.currentTarget.src = '/emblem-of-nepal.png';
                            }}
                          />
                          <div style={{ flex: 1, textAlign: 'center' }}>
                            <p className="rec-receipt-title-gov">नेपाल सरकार | स्थानीय सरकार | {dynamicProvinceCountry}</p>
                            <h2 className="rec-receipt-title-office">{dynamicPalikaName}</h2>
                            <p className="rec-receipt-title-sub">{dynamicOfficeTitle}, {dynamicAddress}</p>
                          </div>
                          <img
                            src={dynamicPalikaLogo}
                            alt="पालिका लोगो"
                            style={{ width: '56px', height: '56px', objectFit: 'contain', borderRadius: '50%', border: '1.5px solid #dc2626', background: '#ffffff', padding: '2px' }}
                            onError={(e: any) => {
                              e.currentTarget.src = '/panchpokhari-logo.png';
                            }}
                          />
                        </div>
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
                          <span style={{ fontSize: '0.68rem', color: '#64748b', display: 'block' }}>{dynamicPalikaName}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rec-modal-footer">
                    <button onClick={() => printElement('printable-receipt')} className="rec-btn rec-btn-primary">
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
                <div
                  className="rec-modal-panel"
                  style={{
                    width: '95%',
                    maxWidth: '960px',
                    borderRadius: '14px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    className="rec-modal-header"
                    style={{
                      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                      padding: '0.75rem 1.25rem',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#ffffff' }}>
                      <Plus size={18} color="#38bdf8" /> नयाँ कर्मचारी पदपूर्ति विज्ञापन आह्वान (Create Vacancy)
                    </h3>
                    <button onClick={() => setShowAddVacancyModal(false)} style={{ background: 'transparent', border: 'none', color: '#cbd5e1', cursor: 'pointer', padding: '4px' }}>
                      <X size={20} />
                    </button>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      createVacancyMutation.mutate(vacancyForm);
                    }}
                    style={{ display: 'flex', flexDirection: 'column', flex: 1, margin: 0 }}
                  >
                    <div
                      className="rec-modal-body"
                      style={{
                        padding: '0.85rem 1.25rem',
                        gap: '0.65rem',
                        overflowY: 'visible',
                        maxHeight: 'none',
                      }}
                    >
                      {/* Row 1: Basic Classification (3 Columns) */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.35fr 1fr', gap: '0.75rem' }}>
                        <div className="rec-field-group">
                          <label className="rec-label" style={{ fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.15rem' }}>
                            विज्ञापन नं (Vacancy No)
                          </label>
                          <input
                            type="text"
                            placeholder="उदा: ०६/२०८३/०८४ (खाली छाडे स्वतः बन्नेछ)"
                            value={vacancyForm.vacancyNo}
                            onChange={(e) => setVacancyForm({ ...vacancyForm, vacancyNo: e.target.value })}
                            className="rec-input-control"
                            style={{ padding: '0.38rem 0.65rem', fontSize: '0.84rem' }}
                          />
                        </div>

                        <div className="rec-field-group">
                          <label className="rec-label" style={{ fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.15rem' }}>
                            पदको नाम (Post Title) <span className="rec-req">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="उदा: सव-इन्जिनियर / रोजगार सहायक / शिक्षक"
                            value={vacancyForm.title}
                            onChange={(e) => {
                              const tVal = e.target.value;
                              let newLevel = vacancyForm.level;
                              let newService = vacancyForm.serviceGroup;
                              if (tVal.includes('शिक्षक आ.वि.') || tVal.includes('प्राथमिक') || tVal.includes('प्रावि')) {
                                newLevel = 'शिक्षक आ.वि. (१-५)';
                                if (!newService || newService === 'प्रशासन / प्राविधिक') newService = 'नेपाल शिक्षा सेवा / शिक्षक';
                              } else if (tVal.includes('शिक्षक निमावी') || tVal.includes('निमावि')) {
                                newLevel = 'शिक्षक निमावी (६-८)';
                                if (!newService || newService === 'प्रशासन / प्राविधिक') newService = 'नेपाल शिक्षा सेवा / शिक्षक';
                              } else if (tVal.includes('शिक्षक मावी') || tVal.includes('मावि')) {
                                newLevel = 'शिक्षक मावी';
                                if (!newService || newService === 'प्रशासन / प्राविधिक') newService = 'नेपाल शिक्षा सेवा / शिक्षक';
                              }
                              setVacancyForm({ ...vacancyForm, title: tVal, level: newLevel, serviceGroup: newService });
                            }}
                            className="rec-input-control"
                            style={{ padding: '0.38rem 0.65rem', fontSize: '0.84rem' }}
                          />
                        </div>

                        <div className="rec-field-group">
                          <label className="rec-label" style={{ fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.15rem' }}>
                            तह / श्रेणी (Level)
                          </label>
                          <select
                            value={vacancyForm.level}
                            onChange={(e) => {
                              const val = e.target.value;
                              const isTeacher = val.includes('शिक्षक');
                              const teacherDocs = 
`क) हस्तलिखित वा टाइप गरिएको निवेदन
ख) शैक्षिक योग्यताका प्रमाणपत्रहरूको प्रमाणित प्रतिलिपि
ग) सम्बन्धित तहको अध्यापन अनुमति पत्रको प्रमाणित प्रतिलिपि
घ) नेपाली नागरिकताको प्रमाणपत्रको प्रमाणित प्रतिलिपि`;
                              setVacancyForm({
                                ...vacancyForm,
                                level: val,
                                serviceGroup: isTeacher && (!vacancyForm.serviceGroup || vacancyForm.serviceGroup === 'प्रशासन / प्राविधिक') ? 'नेपाल शिक्षा सेवा / शिक्षक' : vacancyForm.serviceGroup,
                                minQualification: isTeacher && !vacancyForm.minQualification ? teacherDocs : vacancyForm.minQualification
                              });
                            }}
                            className="rec-input-control"
                            style={{ padding: '0.38rem 0.65rem', fontSize: '0.84rem' }}
                          >
                            <optgroup label="📋 निजामती तथा प्राविधिक सेवा (Civil & Technical)">
                              <option value="सहायक चौथो (4th Level)">सहायक चौथो (4th Level)</option>
                              <option value="सहायक पाँचौं (5th Level)">सहायक पाँचौं (5th Level)</option>
                              <option value="अधिकृत छैटौं (6th Level)">अधिकृत छैटौं (6th Level)</option>
                              <option value="अधिकृत सातौं (7th Level)">अधिकृत सातौं (7th Level)</option>
                              <option value="अधिकृत आठौं (8th Level)">अधिकृत आठौं (8th Level)</option>
                              <option value="श्रेणीविहीन (Unranked)">श्रेणीविहीन (Unranked)</option>
                            </optgroup>
                            <optgroup label="🎓 शिक्षक सेवा (Teacher Service)">
                              <option value="शिक्षक आ.वि. (१-५)">शिक्षक आ.वि. (१-५) — आधारभूत तह (कक्षा १-५)</option>
                              <option value="शिक्षक निमावी (६-८)">शिक्षक निमावी (६-८) — आधारभूत तह (कक्षा ६-८)</option>
                              <option value="शिक्षक मावी">शिक्षक मावी — माध्यमिक तह (कक्षा ९-१२)</option>
                            </optgroup>
                          </select>
                        </div>
                      </div>

                      {/* Row 2: Service, Employment Type, Openings & Status (4 Columns) */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 0.8fr 1.2fr', gap: '0.75rem' }}>
                        <div className="rec-field-group">
                          <label className="rec-label" style={{ fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.15rem' }}>
                            सेवा / समूह
                          </label>
                          <input
                            type="text"
                            value={vacancyForm.serviceGroup}
                            onChange={(e) => {
                              const sVal = e.target.value;
                              let newLevel = vacancyForm.level;
                              if (sVal.includes('शिक्षक आ.वि.') || sVal.includes('प्राथमिक')) newLevel = 'शिक्षक आ.वि. (१-५)';
                              else if (sVal.includes('शिक्षक निमावी') || sVal.includes('निमावि')) newLevel = 'शिक्षक निमावी (६-८)';
                              else if (sVal.includes('शिक्षक मावी') || sVal.includes('मावि')) newLevel = 'शिक्षक मावी';
                              setVacancyForm({ ...vacancyForm, serviceGroup: sVal, level: newLevel });
                            }}
                            className="rec-input-control"
                            style={{ padding: '0.38rem 0.65rem', fontSize: '0.84rem' }}
                          />
                        </div>

                        <div className="rec-field-group">
                          <label className="rec-label" style={{ fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.15rem' }}>
                            सेवा प्रकार (Employment Type)
                          </label>
                          <select
                            value={vacancyForm.employmentType}
                            onChange={(e) => setVacancyForm({ ...vacancyForm, employmentType: e.target.value })}
                            className="rec-input-control"
                            style={{ padding: '0.38rem 0.65rem', fontSize: '0.84rem' }}
                          >
                            <option value="करार सेवा (Contract)">करार सेवा (Contract)</option>
                            <option value="स्थायी सेवा (Permanent)">स्थायी सेवा (Permanent)</option>
                            <option value="ज्यालादारी (Daily Wage)">ज्यालादारी (Daily Wage)</option>
                            <option value="अन्य (Other)">अन्य (Other)</option>
                          </select>
                        </div>

                        <div className="rec-field-group">
                          <label className="rec-label" style={{ fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.15rem' }}>
                            माग पद संख्या <span className="rec-req">*</span>
                          </label>
                          <input
                            type="number"
                            min="1"
                            required
                            value={vacancyForm.openingsCount}
                            onChange={(e) => setVacancyForm({ ...vacancyForm, openingsCount: parseInt(e.target.value) || 1 })}
                            className="rec-input-control"
                            style={{ padding: '0.38rem 0.65rem', fontSize: '0.84rem' }}
                          />
                        </div>

                        <div className="rec-field-group">
                          <label className="rec-label" style={{ fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.15rem' }}>
                            विज्ञापन अवस्था (Status)
                          </label>
                          <select
                            value={vacancyForm.status}
                            onChange={(e) => setVacancyForm({ ...vacancyForm, status: e.target.value })}
                            className="rec-input-control"
                            style={{ padding: '0.38rem 0.65rem', fontSize: '0.84rem', fontWeight: 700, color: '#15803d' }}
                          >
                            <option value="खुला (Active)">सक्रिय / खुला (Active) — दरखास्त खुला रहनेछ</option>
                            <option value="म्याद सकिएको (Closed)">म्याद सकिएको (Closed)</option>
                          </select>
                        </div>
                      </div>

                      {/* Row 3: Fees & Dates (4 Columns) */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                        <div className="rec-field-group">
                          <label className="rec-label" style={{ fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.15rem' }}>
                            आधार दरखास्त दस्तुर (रु.) <span className="rec-req">*</span>
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="50"
                            required
                            value={vacancyForm.applicationFee}
                            onChange={(e) => setVacancyForm({ ...vacancyForm, applicationFee: parseFloat(e.target.value) || 0 })}
                            className="rec-input-control"
                            style={{ padding: '0.38rem 0.65rem', fontSize: '0.84rem' }}
                          />
                        </div>

                        <div className="rec-field-group">
                          <label className="rec-label" style={{ fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.15rem' }}>
                            समावेशी थप शुल्क (रु.) <span className="rec-req">*</span>
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="50"
                            required
                            value={vacancyForm.inclusiveGroupFee}
                            onChange={(e) => setVacancyForm({ ...vacancyForm, inclusiveGroupFee: parseFloat(e.target.value) || 0 })}
                            className="rec-input-control"
                            style={{ padding: '0.38rem 0.65rem', fontSize: '0.84rem' }}
                          />
                        </div>

                        <div className="rec-field-group">
                          <label className="rec-label" style={{ fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.15rem' }}>
                            प्रकाशन मिति (वि.सं.)
                          </label>
                          <NepaliDatePicker
                            value={vacancyForm.publishDateBs}
                            onChange={(val) => setVacancyForm({ ...vacancyForm, publishDateBs: val })}
                          />
                        </div>

                        <div className="rec-field-group">
                          <label className="rec-label" style={{ fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.15rem' }}>
                            दरखास्त दिने अन्तिम मिति <span className="rec-req">*</span>
                          </label>
                          <NepaliDatePicker
                            value={vacancyForm.deadlineDateBs}
                            onChange={(val) => setVacancyForm({ ...vacancyForm, deadlineDateBs: val })}
                          />
                        </div>
                      </div>

                      {/* Row 4: Exam Schedule & Center Compact Highlight Box */}
                      <div
                        style={{
                          background: '#f0fdf4',
                          padding: '0.55rem 0.85rem',
                          borderRadius: '8px',
                          border: '1px solid #bbf7d0',
                        }}
                      >
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.35fr', gap: '0.75rem', alignItems: 'center' }}>
                          <div>
                            <label className="rec-label" style={{ color: '#166534', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 800, fontSize: '0.78rem', marginBottom: '0.15rem' }}>
                              <Clock size={14} color="#16a34a" /> परीक्षा मिति र समय (Exam Date & Time)
                            </label>
                            <input
                              type="text"
                              placeholder="उदा: २०८१-०६-१५ बिहान ११:०० बजे"
                              value={vacancyForm.examDateBs}
                              onChange={(e) => setVacancyForm({ ...vacancyForm, examDateBs: e.target.value })}
                              className="rec-input-control"
                              style={{ background: '#ffffff', borderColor: '#86efac', padding: '0.35rem 0.65rem', fontSize: '0.84rem' }}
                            />
                          </div>
                          <div>
                            <label className="rec-label" style={{ color: '#166534', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 800, fontSize: '0.78rem', marginBottom: '0.15rem' }}>
                              <MapPin size={14} color="#16a34a" /> परीक्षा केन्द्र (Exam Center)
                            </label>
                            <input
                              type="text"
                              placeholder="उदा: पाँचपोखरी थाङपाल मा.वि., वडा नं ६, सिन्धुपाल्चोक"
                              value={vacancyForm.examCenter}
                              onChange={(e) => setVacancyForm({ ...vacancyForm, examCenter: e.target.value })}
                              className="rec-input-control"
                              style={{ background: '#ffffff', borderColor: '#86efac', padding: '0.35rem 0.65rem', fontSize: '0.84rem' }}
                            />
                          </div>
                        </div>
                        <span style={{ fontSize: '0.7rem', color: '#15803d', marginTop: '0.2rem', display: 'block', fontWeight: 500 }}>
                          * परीक्षा मिति र केन्द्र तोकेको अवस्थामा मात्र उम्मेदवारको विज्ञापन कार्ड तथा प्रवेशपत्रमा स्वतः प्रदर्शित हुनेछ।
                        </span>
                      </div>

                      {/* Row 5: Qualification & Description */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '0.75rem' }}>
                        <div className="rec-field-group">
                          <label className="rec-label" style={{ fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.15rem' }}>
                            न्यूनतम आवश्यक शैक्षिक योग्यता <span className="rec-req">*</span>
                          </label>
                          <textarea
                            required
                            rows={2}
                            placeholder="उदा: मान्यता प्राप्त शिक्षण संस्थाबाट सम्बन्धित विषयमा प्रविणता प्रमाणपत्र तह..."
                            value={vacancyForm.minQualification}
                            onChange={(e) => setVacancyForm({ ...vacancyForm, minQualification: e.target.value })}
                            className="rec-input-control"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.82rem', resize: 'vertical' }}
                          />
                        </div>

                        <div className="rec-field-group">
                          <label className="rec-label" style={{ fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.15rem' }}>
                            विस्तृत विवरण / टिप्पणी (Description / Remarks)
                          </label>
                          <textarea
                            rows={2}
                            placeholder="कुनै थप नियम, शर्त वा आवश्यक अनुभव विवरण..."
                            value={vacancyForm.description}
                            onChange={(e) => setVacancyForm({ ...vacancyForm, description: e.target.value })}
                            className="rec-input-control"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.82rem', resize: 'vertical' }}
                          />
                        </div>
                      </div>
                    </div>

                    <div
                      className="rec-modal-footer"
                      style={{
                        padding: '0.65rem 1.25rem',
                        background: '#f8fafc',
                        borderTop: '1px solid #e2e8f0',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '0.75rem',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setShowAddVacancyModal(false)}
                        className="rec-btn"
                        style={{
                          padding: '0.45rem 1.15rem',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          background: '#f1f5f9',
                          color: '#334155',
                          border: '1.5px solid #cbd5e1',
                          borderRadius: '8px',
                          cursor: 'pointer',
                        }}
                      >
                        रद्द गर्नुहोस्
                      </button>
                      <button type="submit" disabled={createVacancyMutation.isPending} className="rec-btn rec-btn-primary" style={{ padding: '0.45rem 1.25rem', fontSize: '0.85rem' }}>
                        {createVacancyMutation.isPending ? 'प्रकाशन हुँदैछ...' : 'विज्ञापन प्रकाशन गर्नुहोस्'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* 11B. MODAL: EDIT VACANCY ANNOUNCEMENT (विज्ञापन संशोधन) */}
            {/* ============================================================== */}
            {showEditVacancyModal && editingVacancy && (
              <div className="rec-modal-backdrop">
                <div
                  className="rec-modal-panel"
                  style={{
                    width: '95%',
                    maxWidth: '960px',
                    borderRadius: '14px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    className="rec-modal-header"
                    style={{
                      background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                      padding: '0.75rem 1.25rem',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ffffff' }}>
                        <Pencil size={18} color="#38bdf8" /> विज्ञापन विवरण संशोधन / सम्पादन (Edit Vacancy)
                      </h3>
                      <span style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.2rem', display: 'block' }}>
                        विज्ञापन नं: {editVacancyForm.vacancyNo || editingVacancy.vacancyNo} | {editVacancyForm.title}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setShowEditVacancyModal(false);
                        setEditingVacancy(null);
                      }}
                      style={{ background: 'transparent', border: 'none', color: '#cbd5e1', cursor: 'pointer', padding: '4px' }}
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      updateVacancyMutation.mutate({
                        id: editingVacancy.id,
                        data: {
                          vacancyNo: editVacancyForm.vacancyNo,
                          title: editVacancyForm.title,
                          serviceGroup: editVacancyForm.serviceGroup,
                          level: editVacancyForm.level,
                          openingsCount: editVacancyForm.openingsCount,
                          employmentType: editVacancyForm.employmentType,
                          applicationFee: editVacancyForm.applicationFee,
                          inclusiveGroupFee: editVacancyForm.inclusiveGroupFee,
                          minQualification: editVacancyForm.minQualification,
                          publishDateBs: editVacancyForm.publishDateBs,
                          deadlineDateBs: editVacancyForm.deadlineDateBs,
                          examDateBs: editVacancyForm.examDateBs !== undefined ? editVacancyForm.examDateBs.trim() : '',
                          examCenter: editVacancyForm.examCenter !== undefined ? editVacancyForm.examCenter.trim() : '',
                          status: editVacancyForm.status,
                          description: editVacancyForm.description,
                        }
                      });
                    }}
                    style={{ display: 'flex', flexDirection: 'column', flex: 1, margin: 0 }}
                  >
                    <div
                      className="rec-modal-body"
                      style={{
                        padding: '0.85rem 1.25rem',
                        gap: '0.65rem',
                        overflowY: 'visible',
                        maxHeight: 'none',
                      }}
                    >
                      {/* Row 1: Basic Classification (3 Columns) */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.35fr 1fr', gap: '0.75rem' }}>
                        <div className="rec-field-group">
                          <label className="rec-label" style={{ fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.15rem' }}>
                            विज्ञापन नं (Vacancy No) <span className="rec-req">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={editVacancyForm.vacancyNo}
                            onChange={(e) => setEditVacancyForm({ ...editVacancyForm, vacancyNo: e.target.value })}
                            className="rec-input-control"
                            style={{ padding: '0.38rem 0.65rem', fontSize: '0.84rem' }}
                          />
                        </div>

                        <div className="rec-field-group">
                          <label className="rec-label" style={{ fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.15rem' }}>
                            पदको नाम (Post / Title) <span className="rec-req">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={editVacancyForm.title}
                            onChange={(e) => {
                              const tVal = e.target.value;
                              let newLevel = editVacancyForm.level;
                              let newService = editVacancyForm.serviceGroup;
                              if (tVal.includes('शिक्षक आ.वि.') || tVal.includes('प्राथमिक') || tVal.includes('प्रावि')) {
                                newLevel = 'शिक्षक आ.वि. (१-५)';
                                if (!newService || newService === 'प्रशासन / प्राविधिक') newService = 'नेपाल शिक्षा सेवा / शिक्षक';
                              } else if (tVal.includes('शिक्षक निमावी') || tVal.includes('निमावि')) {
                                newLevel = 'शिक्षक निमावी (६-८)';
                                if (!newService || newService === 'प्रशासन / प्राविधिक') newService = 'नेपाल शिक्षा सेवा / शिक्षक';
                              } else if (tVal.includes('शिक्षक मावी') || tVal.includes('मावि')) {
                                newLevel = 'शिक्षक मावी';
                                if (!newService || newService === 'प्रशासन / प्राविधिक') newService = 'नेपाल शिक्षा सेवा / शिक्षक';
                              }
                              setEditVacancyForm({ ...editVacancyForm, title: tVal, level: newLevel, serviceGroup: newService });
                            }}
                            className="rec-input-control"
                            style={{ padding: '0.38rem 0.65rem', fontSize: '0.84rem' }}
                          />
                        </div>

                        <div className="rec-field-group">
                          <label className="rec-label" style={{ fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.15rem' }}>
                            तह / श्रेणी (Level / Grade)
                          </label>
                          <select
                            value={editVacancyForm.level}
                            onChange={(e) => {
                              const val = e.target.value;
                              const isTeacher = val.includes('शिक्षक');
                              setEditVacancyForm({
                                ...editVacancyForm,
                                level: val,
                                serviceGroup: isTeacher && (!editVacancyForm.serviceGroup || editVacancyForm.serviceGroup === 'प्रशासन / प्राविधिक') ? 'नेपाल शिक्षा सेवा / शिक्षक' : editVacancyForm.serviceGroup
                              });
                            }}
                            className="rec-input-control"
                            style={{ padding: '0.38rem 0.65rem', fontSize: '0.84rem' }}
                          >
                            <optgroup label="📋 निजामती तथा प्राविधिक सेवा (Civil & Technical)">
                              <option value="सहायक चौथो (4th Level)">सहायक चौथो (4th Level)</option>
                              <option value="सहायक पाँचौं (5th Level)">सहायक पाँचौं (5th Level)</option>
                              <option value="अधिकृत छैटौं (6th Level)">अधिकृत छैटौं (6th Level)</option>
                              <option value="अधिकृत सातौं (7th Level)">अधिकृत सातौं (7th Level)</option>
                              <option value="अधिकृत आठौं (8th Level)">अधिकृत आठौं (8th Level)</option>
                              <option value="श्रेणीविहीन (Unranked)">श्रेणीविहीन (Unranked)</option>
                            </optgroup>
                            <optgroup label="🎓 शिक्षक सेवा (Teacher Service)">
                              <option value="शिक्षक आ.वि. (१-५)">शिक्षक आ.वि. (१-५) — आधारभूत तह (कक्षा १-५)</option>
                              <option value="शिक्षक निमावी (६-८)">शिक्षक निमावी (६-८) — आधारभूत तह (कक्षा ६-८)</option>
                              <option value="शिक्षक मावी">शिक्षक मावी — माध्यमिक तह (कक्षा ९-१२)</option>
                            </optgroup>
                          </select>
                        </div>
                      </div>

                      {/* Row 2: Service, Employment Type, Openings & Status (4 Columns) */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 0.8fr 1.2fr', gap: '0.75rem' }}>
                        <div className="rec-field-group">
                          <label className="rec-label" style={{ fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.15rem' }}>
                            सेवा / समूह (Service Group)
                          </label>
                          <input
                            type="text"
                            value={editVacancyForm.serviceGroup}
                            onChange={(e) => {
                              const sVal = e.target.value;
                              let newLevel = editVacancyForm.level;
                              if (sVal.includes('शिक्षक आ.वि.') || sVal.includes('प्राथमिक')) newLevel = 'शिक्षक आ.वि. (१-५)';
                              else if (sVal.includes('शिक्षक निमावी') || sVal.includes('निमावि')) newLevel = 'शिक्षक निमावी (६-८)';
                              else if (sVal.includes('शिक्षक मावी') || sVal.includes('मावि')) newLevel = 'शिक्षक मावी';
                              setEditVacancyForm({ ...editVacancyForm, serviceGroup: sVal, level: newLevel });
                            }}
                            className="rec-input-control"
                            style={{ padding: '0.38rem 0.65rem', fontSize: '0.84rem' }}
                          />
                        </div>

                        <div className="rec-field-group">
                          <label className="rec-label" style={{ fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.15rem' }}>
                            सेवा प्रकार (Employment Type)
                          </label>
                          <select
                            value={editVacancyForm.employmentType}
                            onChange={(e) => setEditVacancyForm({ ...editVacancyForm, employmentType: e.target.value })}
                            className="rec-input-control"
                            style={{ padding: '0.38rem 0.65rem', fontSize: '0.84rem' }}
                          >
                            <option value="करार सेवा (Contract)">करार सेवा (Contract)</option>
                            <option value="स्थायी सेवा (Permanent)">स्थायी सेवा (Permanent)</option>
                            <option value="ज्यालादारी (Daily Wage)">ज्यालादारी (Daily Wage)</option>
                            <option value="अन्य (Other)">अन्य (Other)</option>
                          </select>
                        </div>

                        <div className="rec-field-group">
                          <label className="rec-label" style={{ fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.15rem' }}>
                            माग पद संख्या <span className="rec-req">*</span>
                          </label>
                          <input
                            type="number"
                            min="1"
                            required
                            value={editVacancyForm.openingsCount}
                            onChange={(e) => setEditVacancyForm({ ...editVacancyForm, openingsCount: parseInt(e.target.value) || 1 })}
                            className="rec-input-control"
                            style={{ padding: '0.38rem 0.65rem', fontSize: '0.84rem' }}
                          />
                        </div>

                        <div className="rec-field-group">
                          <label className="rec-label" style={{ fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.15rem' }}>
                            विज्ञापन अवस्था (Status) <span className="rec-req">*</span>
                          </label>
                          <select
                            value={editVacancyForm.status}
                            onChange={(e) => setEditVacancyForm({ ...editVacancyForm, status: e.target.value })}
                            className="rec-input-control"
                            style={{
                              padding: '0.38rem 0.65rem',
                              fontSize: '0.84rem',
                              fontWeight: 700,
                              color: editVacancyForm.status.includes('खुला') ? '#15803d' : '#b91c1c',
                            }}
                          >
                            <option value="खुला (Active)">सक्रिय / खुला (Active) — दरखास्त खुला रहनेछ</option>
                            <option value="म्याद सकिएको (Closed)">म्याद सकिएको (Closed) — नयाँ दरखास्त बन्द रहनेछ</option>
                            <option value="स्थगित (Suspended)">स्थगित (Suspended) — प्रक्रिया हाल स्थगित रहनेछ</option>
                            <option value="खारेज (Cancelled)">खारेज (Cancelled)</option>
                          </select>
                        </div>
                      </div>

                      {/* Row 3: Fees & Dates (4 Columns) */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                        <div className="rec-field-group">
                          <label className="rec-label" style={{ fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.15rem' }}>
                            आधार दरखास्त शुल्क (रु.) <span className="rec-req">*</span>
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="50"
                            required
                            value={editVacancyForm.applicationFee}
                            onChange={(e) => setEditVacancyForm({ ...editVacancyForm, applicationFee: parseFloat(e.target.value) || 0 })}
                            className="rec-input-control"
                            style={{ padding: '0.38rem 0.65rem', fontSize: '0.84rem' }}
                          />
                        </div>

                        <div className="rec-field-group">
                          <label className="rec-label" style={{ fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.15rem' }}>
                            समावेशी थप शुल्क (रु.) <span className="rec-req">*</span>
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="50"
                            required
                            value={editVacancyForm.inclusiveGroupFee}
                            onChange={(e) => setEditVacancyForm({ ...editVacancyForm, inclusiveGroupFee: parseFloat(e.target.value) || 0 })}
                            className="rec-input-control"
                            style={{ padding: '0.38rem 0.65rem', fontSize: '0.84rem' }}
                          />
                        </div>

                        <div className="rec-field-group">
                          <label className="rec-label" style={{ fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.15rem' }}>
                            प्रकाशन मिति (वि.सं.)
                          </label>
                          <NepaliDatePicker
                            value={editVacancyForm.publishDateBs}
                            onChange={(val) => setEditVacancyForm({ ...editVacancyForm, publishDateBs: val })}
                          />
                        </div>

                        <div className="rec-field-group">
                          <label className="rec-label" style={{ fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.15rem' }}>
                            दरखास्त दिने अन्तिम मिति (वि.सं.) <span className="rec-req">*</span>
                          </label>
                          <NepaliDatePicker
                            value={editVacancyForm.deadlineDateBs}
                            onChange={(val) => setEditVacancyForm({ ...editVacancyForm, deadlineDateBs: val })}
                          />
                        </div>
                      </div>

                      {/* Row 4: Exam Schedule & Center Compact Highlight Box */}
                      <div
                        style={{
                          background: '#f0fdf4',
                          padding: '0.55rem 0.85rem',
                          borderRadius: '8px',
                          border: '1px solid #bbf7d0',
                        }}
                      >
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.35fr', gap: '0.75rem', alignItems: 'center' }}>
                          <div>
                            <label className="rec-label" style={{ color: '#166534', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 800, fontSize: '0.78rem', marginBottom: '0.15rem' }}>
                              <Clock size={14} color="#16a34a" /> परीक्षा मिति र समय (Exam Date & Time)
                            </label>
                            <input
                              type="text"
                              placeholder="उदा: २०८१-०६-१५ बिहान ११:०० बजे"
                              value={editVacancyForm.examDateBs}
                              onChange={(e) => setEditVacancyForm({ ...editVacancyForm, examDateBs: e.target.value })}
                              className="rec-input-control"
                              style={{ background: '#ffffff', borderColor: '#86efac', padding: '0.35rem 0.65rem', fontSize: '0.84rem' }}
                            />
                          </div>
                          <div>
                            <label className="rec-label" style={{ color: '#166534', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 800, fontSize: '0.78rem', marginBottom: '0.15rem' }}>
                              <MapPin size={14} color="#16a34a" /> परीक्षा केन्द्र (Exam Center)
                            </label>
                            <input
                              type="text"
                              placeholder="उदा: पाँचपोखरी थाङपाल मा.वि., वडा नं ६, सिन्धुपाल्चोक"
                              value={editVacancyForm.examCenter}
                              onChange={(e) => setEditVacancyForm({ ...editVacancyForm, examCenter: e.target.value })}
                              className="rec-input-control"
                              style={{ background: '#ffffff', borderColor: '#86efac', padding: '0.35rem 0.65rem', fontSize: '0.84rem' }}
                            />
                          </div>
                        </div>
                        <span style={{ fontSize: '0.7rem', color: '#15803d', marginTop: '0.2rem', display: 'block', fontWeight: 500 }}>
                          * परीक्षा मिति र केन्द्र तोकेको अवस्थामा मात्र उम्मेदवारको विज्ञापन कार्ड तथा प्रवेशपत्रमा स्वतः प्रदर्शित हुनेछ।
                        </span>
                      </div>

                      {/* Row 5: Qualification & Description (2 Columns) */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '0.75rem' }}>
                        <div className="rec-field-group">
                          <label className="rec-label" style={{ fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.15rem' }}>
                            न्यूनतम आवश्यक शैक्षिक योग्यता <span className="rec-req">*</span>
                          </label>
                          <textarea
                            required
                            rows={2}
                            value={editVacancyForm.minQualification}
                            onChange={(e) => setEditVacancyForm({ ...editVacancyForm, minQualification: e.target.value })}
                            className="rec-input-control"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.82rem', resize: 'vertical' }}
                          />
                        </div>

                        <div className="rec-field-group">
                          <label className="rec-label" style={{ fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.15rem' }}>
                            विस्तृत विवरण / टिप्पणी (Description / Remarks)
                          </label>
                          <textarea
                            rows={2}
                            placeholder="कुनै थप नियम, शर्त वा आवश्यक अनुभव विवरण..."
                            value={editVacancyForm.description}
                            onChange={(e) => setEditVacancyForm({ ...editVacancyForm, description: e.target.value })}
                            className="rec-input-control"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.82rem', resize: 'vertical' }}
                          />
                        </div>
                      </div>
                    </div>

                    <div
                      className="rec-modal-footer"
                      style={{
                        padding: '0.65rem 1.25rem',
                        background: '#f8fafc',
                        borderTop: '1px solid #e2e8f0',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '0.75rem',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setShowEditVacancyModal(false);
                          setEditingVacancy(null);
                        }}
                        className="rec-btn"
                        style={{
                          padding: '0.45rem 1.15rem',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          background: '#f1f5f9',
                          color: '#334155',
                          border: '1.5px solid #cbd5e1',
                          borderRadius: '8px',
                          cursor: 'pointer',
                        }}
                      >
                        रद्द गर्नुहोस्
                      </button>
                      <button
                        type="submit"
                        disabled={updateVacancyMutation.isPending}
                        className="rec-btn rec-btn-primary"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 1.25rem', fontSize: '0.85rem' }}
                      >
                        {updateVacancyMutation.isPending ? (
                          <>
                            <Loader2 size={16} className="animate-spin" /> अद्यावधिक गरिँदैछ...
                          </>
                        ) : (
                          <>
                            <CheckCircle size={16} /> परिवर्तन सुरक्षित गर्नुहोस् (Save Changes)
                          </>
                        )}
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
                <div className="rec-modal-panel" style={{ maxWidth: '720px' }}>
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

                      {/* Uploaded Documents for Scrutiny */}
                      <div style={{ marginTop: '0.85rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <h4 style={{ margin: 0, fontSize: '0.82rem', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <Paperclip size={14} color="#0284c7" />
                            छानबिनका लागि संलग्न कागजातहरू ({getAppDocuments(selectedApp).length} वटा):
                          </h4>
                          {getAppDocuments(selectedApp).length > 0 && (
                            <button
                              type="button"
                              disabled={isZipping}
                              onClick={() => handleDownloadAllDocsAsZip(selectedApp)}
                              className="rec-btn"
                              style={{ fontSize: '0.72rem', padding: '0.25rem 0.55rem', background: '#f0fdf4', border: '1px solid #86efac', color: '#166534', fontWeight: 700 }}
                              title="सबै संलग्न कागजातहरू संकलन गरी .ZIP फाइलमा डाउनलोड गर्नुहोस्"
                            >
                              {isZipping ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
                              {isZipping ? 'जिप तयार गरिँदैछ...' : 'एकमुष्ट ZIP डाउनलोड'}
                            </button>
                          )}
                        </div>
                        {(() => {
                          const docs = getAppDocuments(selectedApp);
                          if (docs.length === 0) {
                            return <div style={{ color: '#94a3b8', fontSize: '0.78rem' }}>कुनै कागजात संलग्न गरिएको छैन।</div>;
                          }
                          return (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto', paddingRight: '4px' }}>
                              {docs.map((d, idx) => (
                                <div key={idx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                  <span style={{ fontSize: '0.73rem', fontWeight: 700, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={d.label}>
                                    {d.label}
                                  </span>
                                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                                    <button
                                      type="button"
                                      onClick={() => setPreviewDoc(d)}
                                      style={{ flex: 1, padding: '0.2rem 0.4rem', fontSize: '0.72rem', height: '26px', background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#1e293b', fontWeight: 700, borderRadius: '6px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', cursor: 'pointer' }}
                                      title="पूर्वावलोकन हेर्नुहोस्"
                                    >
                                      <Eye size={12} color="#0284c7" /> हेर्नुहोस्
                                    </button>
                                    <button
                                      type="button"
                                      disabled={downloadingDocKey === d.fileTag}
                                      onClick={() => handleDownloadSingleDoc(d.url!, d.fileTag, selectedApp)}
                                      style={{ flex: 1, padding: '0.2rem 0.4rem', fontSize: '0.72rem', height: '26px', background: '#eff6ff', border: '1px solid #93c5fd', color: '#1d4ed8', fontWeight: 700, borderRadius: '6px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', cursor: 'pointer' }}
                                      title="कागजात डाउनलोड गर्नुहोस्"
                                    >
                                      {downloadingDocKey === d.fileTag ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} color="#1d4ed8" />}
                                      डाउनलोड
                                    </button>
                                    <a
                                      href={d.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      style={{ width: '26px', height: '26px', minWidth: '26px', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#475569', borderRadius: '6px', textDecoration: 'none' }}
                                      title="नयाँ ट्याबमा खोल्नुहोस्"
                                    >
                                      <ExternalLink size={12} />
                                    </a>
                                  </div>
                                </div>
                              ))}
                            </div>
                          );
                        })()}
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
                          <option value="कागजात अपूरो (Action Required)">कागजात अपूरो (Action Required) — सच्याउन / पुनः अपलोड अनुरोध</option>
                          <option value="अस्वीकृत (Rejected)">अस्वीकृत (Rejected) — मापदण्ड नपुगेको</option>
                          <option value="विचाराधीन (Pending)">विचाराधीन (Pending) — थप छानबिन</option>
                        </select>
                      </div>

                      {verifyForm.status.includes('कागजात अपूरो') && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid #fde68a', background: '#fffbeb', padding: '0.75rem', borderRadius: '8px' }}>
                          <div className="rec-field-group">
                            <label className="rec-label" style={{ color: '#92400e', fontWeight: 800 }}>
                              ⚠️ सच्याउनुपर्ने व्यहोरा / प्रशासकीय निर्देशन (Correction Instructions):
                            </label>
                            <textarea
                              rows={3}
                              required
                              placeholder="उदा: अध्यापन अनुमति पत्र अस्पष्ट भएकाले स्पष्ट स्क्यान कपी पुनः अपलोड गर्नुहोला वा नागरिकताको पछाडिको भाग अस्पष्ट छ।"
                              value={verifyForm.rejectionReason}
                              onChange={(e) => setVerifyForm({ ...verifyForm, rejectionReason: e.target.value })}
                              className="rec-input-control"
                              style={{ borderColor: '#f59e0b', background: '#ffffff', fontSize: '0.84rem' }}
                            />
                            <div style={{ fontSize: '0.72rem', color: '#b45309', marginTop: '0.25rem' }}>
                              * यो निर्देशन उम्मेदवारले आफ्नो प्रवेशपत्र/स्थिति ट्र्याकिङ पोर्टलमा हेरी सोही कागजात मात्र सुरक्षित रूपमा पुनः अपलोड गर्न सक्नेछन्।
                            </div>
                          </div>
                        </div>
                      )}

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
                <div className="rec-modal-panel" style={{ maxWidth: '760px' }}>
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

                    {/* Uploaded Documents Gallery with Direct Download & ZIP */}
                    <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.85rem', marginTop: '0.85rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                        <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Paperclip size={15} color="#0284c7" />
                          संलग्न कागजातहरू तथा प्रमाणपत्रहरू ({getAppDocuments(selectedApp).length} वटा):
                        </h4>
                        {getAppDocuments(selectedApp).length > 0 && (
                          <button
                            type="button"
                            disabled={isZipping}
                            onClick={() => handleDownloadAllDocsAsZip(selectedApp)}
                            className="rec-btn"
                            style={{ fontSize: '0.75rem', padding: '0.3rem 0.7rem', background: '#f0fdf4', border: '1px solid #86efac', color: '#166534', fontWeight: 800, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                            title="उम्मेदवारका सबै संलग्न कागजातहरू संकलन गरी .ZIP फाइलमा डाउनलोड गर्नुहोस्"
                          >
                            {isZipping ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
                            {isZipping ? 'जिप तयार गरिँदैछ...' : 'सबै कागजात एकमुष्ट डाउनलोड (.ZIP)'}
                          </button>
                        )}
                      </div>

                      {(() => {
                        const docs = getAppDocuments(selectedApp);
                        if (docs.length === 0) {
                          return <div style={{ color: '#94a3b8', fontSize: '0.8rem', padding: '0.5rem 0' }}>कुनै कागजात संलग्न गरिएको छैन।</div>;
                        }

                        return (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(215px, 1fr))', gap: '0.65rem' }}>
                            {docs.map((d, idx) => (
                              <div key={idx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.65rem', display: 'flex', flexDirection: 'column', gap: '0.45rem', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={d.label}>
                                    {d.label}
                                  </span>
                                </div>
                                <div style={{ display: 'flex', gap: '0.35rem' }}>
                                  <button
                                    type="button"
                                    onClick={() => setPreviewDoc(d)}
                                    style={{ flex: 1, padding: '0.25rem 0.45rem', fontSize: '0.74rem', height: '28px', background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#1e293b', fontWeight: 700, borderRadius: '6px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', cursor: 'pointer' }}
                                    title="पूर्वावलोकन हेर्नुहोस्"
                                  >
                                    <Eye size={13} color="#0284c7" /> हेर्नुहोस्
                                  </button>
                                  <button
                                    type="button"
                                    disabled={downloadingDocKey === d.fileTag}
                                    onClick={() => handleDownloadSingleDoc(d.url!, d.fileTag, selectedApp)}
                                    style={{ flex: 1, padding: '0.25rem 0.45rem', fontSize: '0.74rem', height: '28px', background: '#eff6ff', border: '1px solid #93c5fd', color: '#1d4ed8', fontWeight: 700, borderRadius: '6px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', cursor: 'pointer' }}
                                    title="कागजात सिधै डाउनलोड गर्नुहोस्"
                                  >
                                    {downloadingDocKey === d.fileTag ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} color="#1d4ed8" />}
                                    डाउनलोड
                                  </button>
                                  <a
                                    href={d.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ width: '28px', height: '28px', minWidth: '28px', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#475569', borderRadius: '6px', textDecoration: 'none' }}
                                    title="नयाँ ट्याबमा खोल्नुहोस्"
                                  >
                                    <ExternalLink size={13} />
                                  </a>
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  <div className="rec-modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      {selectedApp.onboardedEmployeeId || selectedApp.onboarded_employee_id ? (
                        <a
                          href="/app/employees"
                          className="rec-onboard-success-badge"
                          style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
                        >
                          <CheckCircle size={14} /> HRMS दर्ता सम्पन्न: {selectedApp.onboardedEmployeeId || selectedApp.onboarded_employee_id}
                        </a>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            const app = selectedApp;
                            setShowDetailModal(false);
                            openOnboardModal(app);
                          }}
                          className="rec-btn rec-btn-success"
                          style={{ fontSize: '0.82rem', padding: '0.45rem 0.85rem' }}
                        >
                          <UserPlus size={15} /> HRMS मा OnBoarding दर्ता गर्नुहोस्
                        </button>
                      )}
                    </div>
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

            {/* ============================================================== */}
            {/* 7. HRMS ONBOARDING MODAL (PREMIUM EXECUTIVE REDESIGN)          */}
            {/* ============================================================== */}
            {showOnboardModal && onboardingApp && (
              <div className="rec-onboard-modal-overlay">
                <div className="rec-onboard-modal">
                  {/* Sticky Header */}
                  <div className="rec-onboard-header">
                    <div className="rec-onboard-header-left">
                      <div className="rec-onboard-header-icon-box">
                        <UserCheck size={24} />
                      </div>
                      <div>
                        <div className="rec-onboard-header-badge">
                          <Sparkles size={12} /> कर्मचारी पदस्थापन तथा अभिलेख
                        </div>
                        <h3 className="rec-onboard-title">
                          कर्मचारी व्यक्तिगत विवरण (HRMS) दर्ता
                        </h3>
                        <p className="rec-onboard-subtitle">
                          खुला दरखास्तबाट छनोट भएका उम्मेदवारलाई आधिकारिक कर्मचारी संकेत नम्बर जारी गरी HRMS मा दर्ता गर्नुहोस्
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowOnboardModal(false);
                        setOnboardingApp(null);
                        setOnboardSuccessData(null);
                      }}
                      className="rec-onboard-close-btn"
                      title="बन्द गर्नुहोस्"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Scrollable Body */}
                  <div className="rec-onboard-body">
                    {onboardSuccessData ? (
                      <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                        <div style={{ width: '68px', height: '68px', borderRadius: '50%', background: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto', border: '3px solid #86efac', boxShadow: '0 8px 24px rgba(22, 163, 74, 0.25)' }}>
                          <CheckCircle2 size={42} />
                        </div>
                        <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#15803d', margin: '0 0 0.5rem 0' }}>
                          HRMS मा सफलतापूर्वक दर्ता सम्पन्न भयो!
                        </h3>
                        <p style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                          {onboardSuccessData.message}
                        </p>
                        <div style={{ background: '#f8fafc', border: '1.5px dashed #86efac', borderRadius: '14px', padding: '1.15rem', maxWidth: '400px', margin: '0 auto 1.75rem auto' }}>
                          <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>आधिकारिक कर्मचारी संकेत नम्बर:</div>
                          <div style={{ fontFamily: 'monospace', fontSize: '1.6rem', fontWeight: 900, color: '#047857', letterSpacing: '0.5px', marginTop: '0.2rem' }}>
                            {onboardSuccessData.employeeId}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.85rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            onClick={() => {
                              setShowOnboardModal(false);
                              navigate('/app/employees');
                            }}
                            className="rec-btn rec-btn-onboard-confirm"
                          >
                            <Users size={17} /> कर्मचारी व्यवस्थापन (HRMS) मा हेर्नुहोस्
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowOnboardModal(false);
                              setOnboardingApp(null);
                              setOnboardSuccessData(null);
                            }}
                            className="rec-btn rec-btn-outline"
                          >
                            बन्द गर्नुहोस्
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* 1. Candidate Executive Profile Card */}
                        <div className="rec-onboard-card">
                          <div className="rec-onboard-card-accent" />
                          <div className="rec-onboard-card-content">
                            <div className="rec-onboard-avatar-wrap">
                              {onboardingApp.photoUrl || onboardingApp.photo_url ? (
                                <img
                                  src={onboardingApp.photoUrl || onboardingApp.photo_url}
                                  alt={onboardingApp.fullNameNp || onboardingApp.full_name_np}
                                  className="rec-onboard-avatar-img"
                                />
                              ) : (
                                <div className="rec-onboard-avatar-placeholder">
                                  {(onboardingApp.fullNameNp || onboardingApp.full_name_np || 'उ')[0]}
                                </div>
                              )}
                              <span className="rec-onboard-status-badge">छनोट उम्मेदवार</span>
                            </div>

                            <div className="rec-onboard-info-wrap">
                              <div className="rec-onboard-name-row">
                                <div>
                                  <span className="rec-onboard-name-np">
                                    {onboardingApp.fullNameNp || onboardingApp.full_name_np}
                                  </span>
                                  {onboardingApp.fullNameEn && (
                                    <span className="rec-onboard-name-en">
                                      ({onboardingApp.fullNameEn})
                                    </span>
                                  )}
                                </div>
                                <span className="rec-onboard-app-pill">
                                  {onboardingApp.applicationNo || onboardingApp.application_no}
                                </span>
                              </div>

                              <div className="rec-onboard-post-pill">
                                <Briefcase size={14} />
                                <span>पद: <strong>{onboardingApp.postTitle || onboardingApp.post_title}</strong></span>
                                <span className="rec-pill-dot">•</span>
                                <span>विज्ञापन नं: <strong>{onboardingApp.vacancyNo || onboardingApp.vacancy_no}</strong></span>
                              </div>

                              <div className="rec-onboard-meta-grid">
                                <div className="rec-onboard-meta-item">
                                  <span className="rec-meta-label">नागरिकता नं:</span>
                                  <span className="rec-meta-val">{onboardingApp.citizenshipNo || onboardingApp.citizenship_no} ({onboardingApp.citizenshipDistrict || onboardingApp.citizenship_district || 'सिन्धुपाल्चोक'})</span>
                                </div>
                                <div className="rec-onboard-meta-item">
                                  <span className="rec-meta-label">सम्पर्क:</span>
                                  <span className="rec-meta-val">{onboardingApp.contactPhone || onboardingApp.contact_phone}</span>
                                </div>
                                <div className="rec-onboard-meta-item" style={{ gridColumn: 'span 2' }}>
                                  <span className="rec-meta-label">स्थायी ठेगाना:</span>
                                  <span className="rec-meta-val">{onboardingApp.permanentAddress || onboardingApp.permanent_address}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 2. Form Inputs Card */}
                        <div className="rec-onboard-form-card">
                          <div className="rec-onboard-section-title">
                            <Building size={17} color="#059669" />
                            <span>पदस्थापन तथा सेवा अभिलेख विवरण (HRMS Appointment Details)</span>
                          </div>

                          <div className="rec-onboard-fields-grid">
                            {/* Employee ID */}
                            <div className="rec-field-group">
                              <label className="rec-onboard-label">
                                <Hash size={14} color="#059669" />
                                <span>कर्मचारी संकेत नम्बर (Employee ID)</span>
                                <span className="rec-req">*</span>
                              </label>
                              <div className="rec-input-affix-wrap">
                                <input
                                  type="text"
                                  value={onboardForm.employeeId}
                                  onChange={e => setOnboardForm(p => ({ ...p, employeeId: e.target.value }))}
                                  className="rec-onboard-input rec-input-empid"
                                  placeholder="EMP-2081-XXXX"
                                  required
                                />
                                <span className="rec-input-badge-green">प्रणाली सिफारिस</span>
                              </div>
                              <span className="rec-field-hint">
                                💡 प्रणालीद्वारा स्वतः सिफारिस संकेत नं (आवश्यकतानुसार परिमार्जन गर्न सकिने)
                              </span>
                            </div>

                            {/* Designation */}
                            <div className="rec-field-group">
                              <label className="rec-onboard-label">
                                <Briefcase size={14} color="#0284c7" />
                                <span>पद / पदनाम (Designation)</span>
                                <span className="rec-req">*</span>
                              </label>
                              <input
                                type="text"
                                value={onboardForm.designation}
                                onChange={e => setOnboardForm(p => ({ ...p, designation: e.target.value }))}
                                className="rec-onboard-input"
                                required
                              />
                            </div>

                            {/* Department */}
                            <div className="rec-field-group">
                              <label className="rec-onboard-label">
                                <Building size={14} color="#0284c7" />
                                <span>शाखा / विभाग (Department)</span>
                                <span className="rec-req">*</span>
                              </label>
                              <select
                                value={onboardForm.department}
                                onChange={e => setOnboardForm(p => ({ ...p, department: e.target.value }))}
                                className="rec-onboard-select"
                              >
                                <option value="प्रशासन तथा सामान्य प्रशासन शाखा">प्रशासन तथा सामान्य प्रशासन शाखा</option>
                                <option value="योजना तथा भौतिक पूर्वाधार विकास शाखा">योजना तथा भौतिक पूर्वाधार विकास शाखा</option>
                                <option value="स्वास्थ्य शाखा">स्वास्थ्य शाखा</option>
                                <option value="शिक्षा, युवा तथा खेलकुद शाखा">शिक्षा, युवा तथा खेलकुद शाखा</option>
                                <option value="आर्थिक प्रशासन (लेखा) शाखा">आर्थिक प्रशासन (लेखा) शाखा</option>
                                <option value="राजस्व तथा आन्तरिक नियन्त्रण शाखा">राजस्व तथा आन्तरिक नियन्त्रण शाखा</option>
                                <option value="कृषि तथा पशुपन्छी विकास शाखा">कृषि तथा पशुपन्छी विकास शाखा</option>
                                <option value="महिला, बालबालिका तथा ज्येष्ठ नागरिक शाखा">महिला, बालबालिका तथा ज्येष्ठ नागरिक शाखा</option>
                                <option value="सूचना प्रविधि (IT) तथा डिजिटल शाखा">सूचना प्रविधि (IT) तथा डिजिटल शाखा</option>
                                <option value="विपद् व्यवस्थापन तथा वातावरण शाखा">विपद् व्यवस्थापन तथा वातावरण शाखा</option>
                              </select>
                            </div>

                            {/* Level / Grade */}
                            <div className="rec-field-group">
                              <label className="rec-onboard-label">
                                <Layers size={14} color="#0284c7" />
                                <span>तह / श्रेणी (Level / Grade)</span>
                              </label>
                              <select
                                value={onboardForm.levelGrade}
                                onChange={e => setOnboardForm(p => ({ ...p, levelGrade: e.target.value }))}
                                className="rec-onboard-select"
                              >
                                <option value="सहायक पाँचौं (Assistant 5th)">सहायक पाँचौं (Assistant 5th)</option>
                                <option value="सहायक चौथो (Assistant 4th)">सहायक चौथो (Assistant 4th)</option>
                                <option value="अधिकृत छैटौं (Officer 6th)">अधिकृत छैटौं (Officer 6th)</option>
                                <option value="अधिकृत सातौं (Officer 7th)">अधिकृत सातौं (Officer 7th)</option>
                                <option value="अधिकृत आठौं (Officer 8th)">अधिकृत आठौं (Officer 8th)</option>
                                <option value="श्रेणीविहीन (Non-Classified)">श्रेणीविहीन (Non-Classified)</option>
                                <option value="शिक्षक आ.वि. (१-५)">शिक्षक आ.वि. (१-५)</option>
                                <option value="शिक्षक निमावी (६-८)">शिक्षक निमावी (६-८)</option>
                                <option value="शिक्षक मावी">शिक्षक मावी</option>
                              </select>
                            </div>

                            {/* Employment Type */}
                            <div className="rec-field-group">
                              <label className="rec-onboard-label">
                                <Briefcase size={14} color="#64748b" />
                                <span>सेवा प्रकार (Employment Type)</span>
                              </label>
                              <select
                                value={onboardForm.employmentType}
                                onChange={e => setOnboardForm(p => ({ ...p, employmentType: e.target.value }))}
                                className="rec-onboard-select"
                              >
                                <option value="करार सेवा (Contract)">करार सेवा (Contract)</option>
                                <option value="स्थायी (Permanent)">स्थायी (Permanent)</option>
                                <option value="अस्थायी / ज्यालादारी">अस्थायी / ज्यालादारी</option>
                              </select>
                            </div>

                            {/* Service Group */}
                            <div className="rec-field-group">
                              <label className="rec-onboard-label">
                                <Layers size={14} color="#64748b" />
                                <span>सेवा समूह (Service Group)</span>
                              </label>
                              <input
                                type="text"
                                value={onboardForm.serviceGroup}
                                onChange={e => setOnboardForm(p => ({ ...p, serviceGroup: e.target.value }))}
                                className="rec-onboard-input"
                                placeholder="उदा: नेपाल प्रशासन / इन्जिनियरिङ्ग"
                              />
                            </div>

                            {/* Appointment Date */}
                            <div className="rec-field-group">
                              <label className="rec-onboard-label">
                                <Calendar size={14} color="#0284c7" />
                                <span>नियुक्ति मिति (वि.सं.)</span>
                              </label>
                              <input
                                type="text"
                                value={onboardForm.appointmentDateBs}
                                onChange={e => setOnboardForm(p => ({ ...p, appointmentDateBs: e.target.value }))}
                                className="rec-onboard-input"
                                placeholder="२०८१-०८-०१"
                              />
                            </div>

                            {/* Joining Date */}
                            <div className="rec-field-group">
                              <label className="rec-onboard-label">
                                <Calendar size={14} color="#0284c7" />
                                <span>हाजिर मिति (वि.सं.)</span>
                              </label>
                              <input
                                type="text"
                                value={onboardForm.joinDateBs}
                                onChange={e => setOnboardForm(p => ({ ...p, joinDateBs: e.target.value }))}
                                className="rec-onboard-input"
                                placeholder="२०८१-०८-०१"
                              />
                            </div>
                          </div>

                          {/* Remarks */}
                          <div className="rec-field-group" style={{ marginTop: '1.15rem' }}>
                            <label className="rec-onboard-label">
                              <FileText size={14} color="#64748b" />
                              <span>कैफियत / पदस्थापन टिप्पणी (Remarks)</span>
                            </label>
                            <textarea
                              value={onboardForm.remarks}
                              onChange={e => setOnboardForm(p => ({ ...p, remarks: e.target.value }))}
                              className="rec-onboard-textarea"
                              rows={2}
                              placeholder="पदस्थापन सम्बन्धी विशेष टिप्पणी वा निर्णय..."
                            />
                          </div>
                        </div>

                        {/* 3. Document Sync Card */}
                        <div className="rec-onboard-docs-box">
                          <div className="rec-onboard-docs-header">
                            <CheckCircle size={18} color="#059669" />
                            <span style={{ fontWeight: 800, color: '#065f46', fontSize: '0.86rem' }}>
                              कागजात स्वतः स्थानान्तरण (Automatic Document Sync)
                            </span>
                          </div>
                          <p style={{ margin: '0.35rem 0 0.55rem 0', fontSize: '0.78rem', color: '#334155', lineHeight: 1.5 }}>
                            यो पदस्थापन सुरक्षित गर्नासाथ उम्मेदवारका यी सम्पूर्ण कागजातहरू सिधै HRMS डिजिटल व्यक्तिगत फाइलमा सुरक्षित हुनेछन्:
                          </p>
                          <div className="rec-onboard-doc-pills">
                            <span className="rec-doc-pill">✓ नागरिकता प्रमाणपत्र</span>
                            <span className="rec-doc-pill">✓ शैक्षिक प्रमाणपत्र</span>
                            <span className="rec-doc-pill">✓ पासपोर्ट फोटो</span>
                            <span className="rec-doc-pill">✓ काउन्सिल / तालिम</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Sticky Footer */}
                  {!onboardSuccessData && (
                    <div className="rec-onboard-footer">
                      <button
                        type="button"
                        onClick={() => {
                          setShowOnboardModal(false);
                          setOnboardingApp(null);
                        }}
                        className="rec-btn rec-btn-outline"
                        disabled={isOnboardingLoading}
                      >
                        रद्द गर्नुहोस्
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmOnboard}
                        disabled={isOnboardingLoading || !onboardForm.employeeId || !onboardForm.department}
                        className="rec-btn rec-btn-onboard-confirm"
                      >
                        {isOnboardingLoading ? (
                          <>
                            <Loader2 size={16} className="animate-spin" /> दर्ता हुँदैछ...
                          </>
                        ) : (
                          <>
                            <UserPlus size={16} /> कर्मचारी दर्ता सुरक्षित गर्नुहोस् (Confirm & Save)
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ─── MODAL 1: ADMIT CARD PRINT PREVIEW ─── */}
            <CentralPrintPreviewModal
              isOpen={showAdmitCardPreviewModal}
              onClose={() => setShowAdmitCardPreviewModal(false)}
              title="प्रवेशपत्र (Admit Card) - A4 प्रिन्ट पूर्वावलोकन"
              targetElementId="modal-preview-admit-card"
              paperFormat="A4"
              onPrint={() => printElement('modal-preview-admit-card', 'A4')}
            >
              {admitCardResult && admitCardResult.is_admit_card_ready && (() => {
                const schedule = getExamDateTimeDetails(admitCardResult.application, admitCardResult.vacancy);
                const rollNumber = admitCardResult.application.admitCardRollNo || admitCardResult.application.admit_card_roll_no || '2083-ROLL-001';
                const chalaniNumber = admitCardResult.application.chalaniNo ||
                  admitCardResult.application.chalani_no ||
                  (rollNumber.includes('-') ? rollNumber.split('-').pop() : '३५२');
                const examCenterVal = (admitCardResult.vacancy?.examCenter ||
                  admitCardResult.vacancy?.exam_center ||
                  admitCardResult.application?.examCenter ||
                  admitCardResult.application?.exam_center || '').trim();
                const examDateVal = (admitCardResult.vacancy?.examDateBs ||
                  admitCardResult.vacancy?.exam_date_bs ||
                  admitCardResult.application?.examDateTime ||
                  admitCardResult.application?.exam_date_time || '').trim();
                const showExamScheduleBanner = Boolean(examCenterVal || examDateVal);

                return (
                  <CentralDocumentSheet
                    id="modal-preview-admit-card"
                    className="rec-admit-official-card"
                    paperSize="A4"
                    palikaName={dynamicPalikaName}
                    palikaNameEn={dynamicPalikaNameEn}
                    localGovType="स्थानीय सरकार"
                    officeTitle={dynamicOfficeTitle}
                    location={dynamicAddress}
                    provinceCountry={dynamicProvinceCountry}
                    establishedYear="२०७३"
                    activeFiscalYear="२०८३/०८४"
                    patraSankhya="२०८३/०८४"
                    chalaniNo={chalaniNumber}
                    branchTitle="कर्मचारी पदपूर्ति तथा आन्तरिक परीक्षा सञ्चालन समिति"
                    branchPlacement="below-title"
                    documentTitle="प्रवेशपत्र (ADMIT CARD)"
                    slogan={dynamicSlogan}
                    website={dynamicWebsite}
                    email={dynamicEmail}
                    phone={dynamicPhone}
                    logoUrl={dynamicPalikaLogo}
                    emblemUrl={dynamicEmblemUrl}
                    dateBs="२०८३/०८/०५"
                    dateAd="2026-11-20"
                    showWatermark={true}
                    showFooter={true}
                  >
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '0.65rem' }}>
                      <div style={{ flex: 1 }}>
                        <div className="rec-admit-roll-banner" style={{ marginBottom: '0.45rem' }}>
                          <div>
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block' }}>रोल नम्बर (Roll No.):</span>
                            <span className="rec-admit-roll-no">{rollNumber}</span>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block' }}>दरखास्त नं:</span>
                            <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#334155', fontSize: '0.95rem' }}>
                              {admitCardResult.application.applicationNo || admitCardResult.application.application_no}
                            </span>
                          </div>
                        </div>

                        <table className="rec-admit-table">
                          <tbody>
                            <tr>
                              <td className="label-col">उम्मेदवारको नाम:</td>
                              <td className="val-col">
                                <strong>{admitCardResult.application.fullNameNp || admitCardResult.application.full_name_np}</strong>
                                {admitCardResult.application.fullNameEn && ` (${admitCardResult.application.fullNameEn})`}
                              </td>
                            </tr>
                            <tr>
                              <td className="label-col">विज्ञापन नं:</td>
                              <td className="val-col" style={{ color: '#0369a1', fontWeight: 700 }}>
                                {admitCardResult.application.vacancyNo || admitCardResult.application.vacancy_no}
                              </td>
                            </tr>
                            <tr>
                              <td className="label-col">पद / सेवा / तह:</td>
                              <td className="val-col">
                                <strong>{admitCardResult.application.postTitle || admitCardResult.application.post_title}</strong>
                                {admitCardResult.vacancy?.level && ` - ${admitCardResult.vacancy.level}`}
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

                      <div style={{ width: '120px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.45rem' }}>
                        <div className="rec-photo-paste-box" style={{ width: '110px', height: '130px', margin: 0 }}>
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

                        <div style={{ width: '100%', textAlign: 'center', borderTop: '1px solid #cbd5e1', paddingTop: '4px' }}>
                          <span style={{ fontSize: '0.68rem', color: '#64748b', display: 'block' }}>उम्मेदवारको हस्ताक्षर</span>
                          <div style={{ height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {admitCardResult.application.signatureUrl || admitCardResult.application.signature_url ? (
                              <img
                                src={admitCardResult.application.signatureUrl || admitCardResult.application.signature_url}
                                alt="हस्ताक्षर"
                                style={{ maxHeight: '26px', maxWidth: '100%', objectFit: 'contain' }}
                              />
                            ) : (
                              <div style={{ width: '90%', borderBottom: '1px dashed #94a3b8', height: '100%' }} />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Exam Schedule Banner with BS and AD dates (Shown only if exam date or center is specified) */}
                    {showExamScheduleBanner && (
                      <div className="rec-admit-exam-banner" style={{ margin: '0.45rem 0' }}>
                        {Boolean(examCenterVal) && (
                          <div>
                            <span className="rec-exam-detail-title">परीक्षा केन्द्र (Exam Center):</span>
                            <div className="rec-exam-detail-val" style={{ fontWeight: 800, color: '#0f172a' }}>
                              {examCenterVal}
                            </div>
                          </div>
                        )}
                        {Boolean(examDateVal) && (
                          <div>
                            <span className="rec-exam-detail-title">परीक्षा मिति तथा समय (Exam Schedule):</span>
                            <div className="rec-exam-detail-val rec-exam-time-val" style={{ fontWeight: 800 }}>
                              <div>नेपाली (BS): <strong>{schedule.bs}</strong></div>
                              {schedule.ad && <div style={{ fontSize: '0.8rem', color: '#0369a1', marginTop: '2px' }}>English (AD): {schedule.ad}</div>}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Instructions: Summarized from Official 14 Rules for perfect A4 fit */}
                    <div className="rec-admit-instructions" style={{ padding: '0.45rem 0.85rem', margin: '0.45rem 0', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                        <strong style={{ color: '#0f172a', fontSize: '0.76rem' }}>
                          उम्मेदवारले पालना गर्नुपर्ने नियमहरू (Rules & Instructions for Candidates):
                        </strong>
                        <span style={{ fontSize: '0.66rem', color: '#64748b', fontWeight: 600 }}>परीक्षा आचारसंहिता</span>
                      </div>
                      <ol style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.72rem', lineHeight: '1.45', color: '#1e293b' }}>
                        <li style={{ marginBottom: '2.5px' }}>
                          <strong>प्रवेशपत्र र पहिचान:</strong> परीक्षा दिन आउँदा यो प्रवेशपत्र र सक्कल नेपाली नागरिकता अनिवार्य साथमा ल्याउनुपर्नेछ (प्रवेशपत्र विना परीक्षामा बस्न पाइने छैन)। प्रयोगात्मक परीक्षा तथा अन्तर्वार्तामा समेत प्रवेशपत्र अनिवार्य छ।
                        </li>
                        <li style={{ marginBottom: '2.5px' }}>
                          <strong>समय पालना:</strong> परीक्षा सुरु हुनुभन्दा ३० मिनेट अगावै हलमा प्रवेश गर्नुपर्नेछ। वस्तुगत परीक्षा सुरु भएको १५ मिनेट र विषयगत परीक्षा सुरु भएको ३० मिनेटपछि आउने उम्मेदवारलाई परीक्षामा बस्न दिइने छैन।
                        </li>
                        <li style={{ marginBottom: '2.5px' }}>
                          <strong>निषेधित सामग्री:</strong> परीक्षा हलभित्र मोबाइल फोन, क्यालकुलेटर, स्मार्टवाच, कुनै पनि विद्युतीय उपकरण, पुस्तक, कापी वा चिट लैजान तथा आपसमा कुराकानी वा संकेत गर्न पूर्ण निषेध छ।
                        </li>
                        <li style={{ marginBottom: '2.5px' }}>
                          <strong>उत्तरपुस्तिका र "की" (Key):</strong> वस्तुगत परीक्षाको उत्तरपुस्तिकामा आफूलाई प्राप्त प्रश्नपत्रको "की" (Key) अनिवार्य लेख्नुपर्नेछ; नलेखेमा उत्तरपुस्तिका स्वतः रद्द हुनेछ। समावेशी समूहको व्यहोरा समेत खुलाउनुपर्नेछ।
                        </li>
                        <li>
                          <strong>मर्यादा र हाजिर:</strong> परीक्षामा दैनिक हाजिर अनिवार्य छ। परीक्षाको मर्यादा विपरीत कार्य गरेमा केन्द्राध्यक्षले तत्काल निष्कासन गरी कानुन बमोजिम कारबाही गर्नेछ।
                        </li>
                      </ol>
                    </div>

                    {/* Official Signatures Row */}
                    <div className="rec-admit-signatures" style={{ marginTop: '0.75rem', padding: '0 0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                      {/* Candidate Signature */}
                      <div style={{ textAlign: 'center', minWidth: '160px' }}>
                        <div style={{ height: '42px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', marginBottom: '2px' }}>
                          {admitCardResult.application.signatureUrl || admitCardResult.application.signature_url ? (
                            <img
                              src={admitCardResult.application.signatureUrl || admitCardResult.application.signature_url}
                              alt="उम्मेदवारको हस्ताक्षर"
                              style={{ maxHeight: '40px', maxWidth: '145px', objectFit: 'contain' }}
                            />
                          ) : null}
                        </div>
                        <div className="rec-sig-line" style={{ width: '160px', borderTop: 'none', borderBottom: '1.5px solid #1e293b', margin: '0 auto 0.35rem auto' }}></div>
                        <span style={{ fontWeight: 800, fontSize: '0.82rem', color: '#0f172a' }}>उम्मेदवारको हस्ताक्षर</span>
                      </div>

                      {/* Committee / CAO Signature & Stamp Area */}
                      <div style={{ textAlign: 'center', minWidth: '220px' }}>
                        <div style={{ height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: '0.66rem', color: '#94a3b8', fontStyle: 'italic' }}>[ हस्ताक्षर तथा कार्यालयको छाप ]</span>
                        </div>
                        <div className="rec-sig-line" style={{ width: '220px', borderTop: 'none', borderBottom: '1.5px solid #1e293b', margin: '0 auto 0.35rem auto' }}></div>
                        <span style={{ fontWeight: 800, fontSize: '0.82rem', color: '#0f172a', display: 'block', whiteSpace: 'nowrap' }}>
                          पदपूर्ति समिति / प्रमुख प्रशासकीय अधिकृत
                        </span>
                        <span style={{ fontSize: '0.74rem', color: '#475569', display: 'block', marginTop: '0.12rem', fontWeight: 600 }}>
                          {dynamicPalikaName}
                        </span>
                      </div>
                    </div>
                  </CentralDocumentSheet>
                );
              })()}
            </CentralPrintPreviewModal>

            {/* ─── MODAL 2: APPLICATION APPROVAL LETTER PREVIEW ─── */}
            <CentralPrintPreviewModal
              isOpen={showApprovalLetterModal}
              onClose={() => setShowApprovalLetterModal(false)}
              title="आवेदन स्वीकृति पत्र (Application Acceptance Letter) - A4"
              targetElementId="printable-approval-letter-sheet"
            >
              {selectedApprovalApp && (
                <CentralDocumentSheet
                  id="printable-approval-letter-sheet"
                  palikaName={dynamicPalikaName}
                  palikaNameEn={dynamicPalikaNameEn}
                  localGovType="स्थानीय सरकार"
                  officeTitle={dynamicOfficeTitle}
                  location={dynamicAddress}
                  provinceCountry={dynamicProvinceCountry}
                  establishedYear="२०७३"
                  activeFiscalYear="२०८३/०८४"
                  patraSankhya="२०८३/०८४"
                  chalaniNo={selectedApprovalApp.chalaniNo || selectedApprovalApp.chalani_no || '३५२'}
                  branchTitle="कर्मचारी पदपूर्ति तथा आन्तरिक परीक्षा सञ्चालन समिति"
                  documentTitle="दरखास्त फारम स्वीकृति पत्र (APPLICATION ACCEPTANCE LETTER)"
                  slogan={dynamicSlogan}
                  website={dynamicWebsite}
                  email={dynamicEmail}
                  phone={dynamicPhone}
                  logoUrl={dynamicPalikaLogo}
                  emblemUrl={dynamicEmblemUrl}
                  dateBs="२०८३/०८/०५"
                  dateAd="2026-11-20"
                  showWatermark={true}
                  showFooter={true}
                >
                  <div style={{ padding: '1.25rem 0.5rem', minHeight: '360px' }}>
                    <div style={{ marginBottom: '1rem', lineHeight: 1.6, fontSize: '0.92rem', color: '#1e293b' }}>
                      <div>श्री <strong>{selectedApprovalApp.fullNameNp || selectedApprovalApp.full_name_np}</strong></div>
                      <div>ठेगाना: {selectedApprovalApp.permanentAddress || selectedApprovalApp.permanent_address}</div>
                      <div>नागरिकता नं: {selectedApprovalApp.citizenshipNo || selectedApprovalApp.citizenship_no}</div>
                    </div>

                    <p style={{ fontWeight: 800, color: '#1e293b', fontSize: '1rem', marginBottom: '1rem', textAlign: 'center' }}>
                      विषय: <span style={{ textDecoration: 'underline' }}>दरखास्त फारम स्वीकृत भएको तथा परीक्षामा सम्मिलित हुने सम्बन्धी।</span>
                    </p>

                    <p style={{ fontSize: '0.9rem', lineHeight: '1.75', color: '#1e293b', textAlign: 'justify', marginBottom: '1rem' }}>
                      महोदय / महोदया,<br />
                      यस <strong>{dynamicPalikaName}</strong>द्वारा प्रकाशित विज्ञापन नं. <strong>{selectedApprovalApp.vacancyNo || selectedApprovalApp.vacancy_no}</strong>,
                      पद: <strong>{selectedApprovalApp.postTitle || selectedApprovalApp.post_title}</strong> को लागि तपाईंले पेस गर्नुभएको
                      अनलाइन दरखास्त फारम (दरखास्त नं: {selectedApprovalApp.applicationNo || selectedApprovalApp.application_no}) तथा संलग्न आवश्यक शैक्षिक योग्यता र कागजातहरू
                      प्रारम्भिक रुजु गर्दा रीतपूर्वक प्राप्त भएकोले यो <strong>स्वीकृति पत्र</strong> जारी गरिएको छ।
                    </p>

                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', marginBottom: '1.25rem' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.86rem' }}>
                        <div><strong>रोल नम्बर:</strong> <span style={{ fontFamily: 'monospace', color: '#1d4ed8', fontWeight: 800 }}>{selectedApprovalApp.admitCardRollNo || selectedApprovalApp.admit_card_roll_no || '2083-ROLL-352'}</span></div>
                        <div><strong>राजस्व स्थिति:</strong> <span style={{ color: '#059669', fontWeight: 800 }}>भुक्तानी सम्पन्न (PAID)</span></div>
                        <div><strong>परीक्षा केन्द्र:</strong> {selectedApprovalApp.examCenter || selectedApprovalApp.exam_center || 'पाँचपोखरी थाङपाल मा.वि., वडा नं ६, सिन्धुपाल्चोक'}</div>
                        <div><strong>परीक्षा मिति (BS):</strong> {selectedApprovalApp.examDateTime || selectedApprovalApp.exam_date_time || '२०८३-०९-१५ बिहान ११:०० बजे'}</div>
                      </div>
                    </div>

                    <p style={{ fontSize: '0.88rem', lineHeight: '1.7', color: '#1e293b', textAlign: 'justify' }}>
                      तपाईंले पोर्टलमा लगइन गरी वा नागरिकता नम्बर प्रविष्ट गरी आधिकारिक प्रवेश पत्र (Admit Card) डाउनलोड तथा प्रिन्ट गरी तोकिएको मिति र समयमा परीक्षा केन्द्रमा उपस्थित हुन सूचित गरिन्छ।
                    </p>

                    <div style={{ marginTop: '3.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                      <div>
                        <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'block' }}>बोधार्थ:</span>
                        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>१. प्रशासन शाखा, {dynamicPalikaName}</span>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ width: '160px', borderBottom: '1px dashed #64748b', marginBottom: '4px' }}></div>
                        <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>सदस्य सचिव / अधिकृत</span>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>कर्मचारी पदपूर्ति समिति</span>
                      </div>
                    </div>
                  </div>
                </CentralDocumentSheet>
              )}
            </CentralPrintPreviewModal>

            {/* ─── MODAL 3: OFFICIAL EXAM NOTICE PREVIEW ─── */}
            <CentralPrintPreviewModal
              isOpen={showExamNoticeModal}
              onClose={() => setShowExamNoticeModal(false)}
              title="परीक्षा सम्बन्धी आधिकारिक सूचना (Official Exam Notice) - A4"
              targetElementId="printable-exam-notice-sheet"
            >
              {selectedNoticeVacancy && (
                <CentralDocumentSheet
                  id="printable-exam-notice-sheet"
                  palikaName={dynamicPalikaName}
                  palikaNameEn={dynamicPalikaNameEn}
                  localGovType="स्थानीय सरकार"
                  officeTitle={dynamicOfficeTitle}
                  location={dynamicAddress}
                  provinceCountry={dynamicProvinceCountry}
                  establishedYear="२०७३"
                  activeFiscalYear="२०८३/०८४"
                  patraSankhya="२०८३/०८४"
                  chalaniNo={selectedNoticeVacancy.vacancyNo || selectedNoticeVacancy.vacancy_no || '०४/२०८३/०८४'}
                  branchTitle="कर्मचारी पदपूर्ति तथा आन्तरिक परीक्षा सञ्चालन समिति"
                  documentTitle="लिखित तथा प्रयोगात्मक परीक्षा सञ्चालन सम्बन्धी अत्यन्त जरुरी सूचना"
                  slogan={dynamicSlogan}
                  website={dynamicWebsite}
                  email={dynamicEmail}
                  phone={dynamicPhone}
                  logoUrl={dynamicPalikaLogo}
                  emblemUrl={dynamicEmblemUrl}
                  dateBs="२०८३/०८/०५"
                  dateAd="2026-11-20"
                  showWatermark={true}
                  showFooter={true}
                >
                  <div style={{ padding: '1.25rem 0.5rem', minHeight: '360px' }}>
                    <p style={{ fontSize: '0.9rem', lineHeight: '1.8', color: '#1e293b', textAlign: 'justify', marginBottom: '1.25rem' }}>
                      यस <strong>{dynamicPalikaName}</strong>को रिक्त पदपूर्ति गर्ने प्रयोजनका लागि प्रकाशित विज्ञापन नं. <strong>{selectedNoticeVacancy.vacancyNo || selectedNoticeVacancy.vacancy_no}</strong>,
                      पद: <strong>{selectedNoticeVacancy.title || 'नापी अधिकृत'}</strong> तह: <strong>{selectedNoticeVacancy.level || 'सहायक पाँचौं (5th Level)'}</strong> पदको खुला तथा समावेशी प्रतियोगितात्मक लिखित तथा प्रयोगात्मक परीक्षा निम्नानुसारको मिति, समय तथा परीक्षा केन्द्रमा सञ्चालन हुने व्यहोरा सम्बन्धित सबै उम्मेदवारहरूको जानकारीका लागि यो सूचना प्रकाशित गरिएको छ।
                    </p>

                    <table className="rec-admit-table" style={{ marginBottom: '1.25rem', border: '1px solid #cbd5e1' }}>
                      <tbody>
                        <tr>
                          <td className="label-col" style={{ width: '25%', background: '#f8fafc' }}>विज्ञापन नं:</td>
                          <td className="val-col" style={{ fontWeight: 800, color: '#0369a1' }}>{selectedNoticeVacancy.vacancyNo || selectedNoticeVacancy.vacancy_no}</td>
                        </tr>
                        <tr>
                          <td className="label-col" style={{ background: '#f8fafc' }}>पद, सेवा र तह:</td>
                          <td className="val-col" style={{ fontWeight: 800 }}>{selectedNoticeVacancy.title} ({selectedNoticeVacancy.level || 'सहायक पाँचौं'})</td>
                        </tr>
                        <tr>
                          <td className="label-col" style={{ background: '#f8fafc' }}>परीक्षा मिति तथा समय (BS):</td>
                          <td className="val-col" style={{ fontWeight: 800, color: '#dc2626' }}>{selectedNoticeVacancy.examDateBs || selectedNoticeVacancy.exam_date_bs || 'पछि तोकिनेछ (To be announced)'}</td>
                        </tr>
                        <tr>
                          <td className="label-col" style={{ background: '#f8fafc' }}>Exam Date & Time (AD):</td>
                          <td className="val-col" style={{ fontWeight: 700 }}>2026-12-30 11:00 AM</td>
                        </tr>
                        <tr>
                          <td className="label-col" style={{ background: '#f8fafc' }}>परीक्षा केन्द्र (Exam Center):</td>
                          <td className="val-col" style={{ fontWeight: 700 }}>पाँचपोखरी थाङपाल मा.वि., वडा नं ६, सिन्धुपाल्चोक</td>
                        </tr>
                      </tbody>
                    </table>

                    <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '0.85rem', marginBottom: '1.5rem', fontSize: '0.82rem', lineHeight: 1.6 }}>
                      <strong style={{ color: '#991b1b', display: 'block' }}>परीक्षार्थीहरूका लागि आवश्यक निर्देशनहरू:</strong>
                      १. परीक्षा हलमा प्रवेश गर्दा डिजिटल प्रणालीबाट जारी भएको रंगिन प्रवेश पत्र (Admit Card) र सक्कल नागरिकता अनिवार्य ल्याउनुपर्नेछ।<br />
                      २. परीक्षा सुरु हुनुभन्दा ३० मिनेट अगावै परीक्षा केन्द्रमा उपस्थित हुनुपर्नेछ।
                    </div>

                    <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'flex-end' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ width: '160px', borderBottom: '1px dashed #64748b', marginBottom: '4px' }}></div>
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, display: 'block' }}>सदस्य सचिव</span>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>कर्मचारी पदपूर्ति समिति</span>
                      </div>
                    </div>
                  </div>
                </CentralDocumentSheet>
              )}
            </CentralPrintPreviewModal>

            {/* ─── MODAL 4: APPOINTMENT & RECOMMENDATION LETTER PREVIEW ─── */}
            <CentralPrintPreviewModal
              isOpen={showAppointmentModal}
              onClose={() => setShowAppointmentModal(false)}
              title="करार नियुक्ति तथा पदस्थापन पत्र (Appointment Letter) - A4"
              targetElementId="printable-appointment-sheet"
            >
              {selectedAppointmentApp && (
                <CentralDocumentSheet
                  id="printable-appointment-sheet"
                  palikaName={dynamicPalikaName}
                  palikaNameEn={dynamicPalikaNameEn}
                  localGovType="स्थानीय सरकार"
                  officeTitle={dynamicOfficeTitle}
                  location={dynamicAddress}
                  provinceCountry={dynamicProvinceCountry}
                  establishedYear="२०७३"
                  activeFiscalYear="२०८३/०८४"
                  patraSankhya="२०८३/०८४"
                  chalaniNo={selectedAppointmentApp.onboardedEmployeeId || selectedAppointmentApp.onboarded_employee_id || 'EMP-2081-001'}
                  branchTitle="सामान्य प्रशासन तथा मानव संशाधन शाखा"
                  documentTitle="करार पदस्थापन तथा नियुक्ति पत्र (OFFICIAL APPOINTMENT LETTER)"
                  slogan={dynamicSlogan}
                  website={dynamicWebsite}
                  email={dynamicEmail}
                  phone={dynamicPhone}
                  logoUrl={dynamicPalikaLogo}
                  emblemUrl={dynamicEmblemUrl}
                  dateBs="२०८३/०८/०५"
                  dateAd="2026-11-20"
                  showWatermark={true}
                  showFooter={true}
                >
                  <div style={{ padding: '1.25rem 0.5rem', minHeight: '360px' }}>
                    <div style={{ marginBottom: '1rem', lineHeight: 1.6, fontSize: '0.92rem', color: '#1e293b' }}>
                      <div>श्री <strong>{selectedAppointmentApp.fullNameNp || selectedAppointmentApp.full_name_np}</strong></div>
                      <div>कर्मचारी संकेत नं: <strong style={{ color: '#047857' }}>{selectedAppointmentApp.onboardedEmployeeId || selectedAppointmentApp.onboarded_employee_id || 'EMP-2081-001'}</strong></div>
                      <div>स्थायी ठेगाना: {selectedAppointmentApp.permanentAddress || selectedAppointmentApp.permanent_address}</div>
                    </div>

                    <p style={{ fontWeight: 800, color: '#1e293b', fontSize: '1rem', marginBottom: '1rem', textAlign: 'center' }}>
                      विषय: <span style={{ textDecoration: 'underline' }}>करार सेवामा पदस्थापन तथा नियुक्ति गरिएको सम्बन्धी।</span>
                    </p>

                    <p style={{ fontSize: '0.9rem', lineHeight: '1.8', color: '#1e293b', textAlign: 'justify', marginBottom: '1.25rem' }}>
                      यस <strong>{dynamicPalikaName}</strong>द्वारा सञ्चालित पदपूर्ति प्रक्रिया अनुसार विज्ञापन नं. <strong>{selectedAppointmentApp.vacancyNo || selectedAppointmentApp.vacancy_no}</strong> पद: <strong>{selectedAppointmentApp.postTitle || selectedAppointmentApp.post_title}</strong> मा छनोट हुनुभएकोमा कर्मचारी व्यवस्थापन कार्यविधि अनुसार तपाईंलाई देहाय बमोजिमको सेवा तथा सर्तमा रही कामकाज गर्न यो <strong>करार नियुक्ति पत्र</strong> प्रदान गरिएको छ।
                    </p>

                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', marginBottom: '1.25rem', fontSize: '0.86rem' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                        <div><strong>पद / तह:</strong> {selectedAppointmentApp.postTitle || selectedAppointmentApp.post_title}</div>
                        <div><strong>कर्मचारी संकेत नं:</strong> {selectedAppointmentApp.onboardedEmployeeId || selectedAppointmentApp.onboarded_employee_id}</div>
                        <div><strong>पदस्थापन शाखा:</strong> प्रशासन तथा सामान्य प्रशासन शाखा</div>
                        <div><strong>नियुक्ति मिति:</strong> २०८३/०८/०५ (2026-11-20)</div>
                      </div>
                    </div>

                    <div style={{ marginTop: '3.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                      <div>
                        <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'block' }}>बोधार्थ:</span>
                        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>१. मानव संशाधन व्यवस्थापन शाखा (HRMS File)</span><br />
                        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>२. आर्थिक प्रशासन शाखा (तलब भुक्तानी प्रयोजनार्थ)</span>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ width: '160px', borderBottom: '1px dashed #64748b', marginBottom: '4px' }}></div>
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, display: 'block' }}>प्रमुख प्रशासकीय अधिकृत</span>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{dynamicPalikaName}</span>
                      </div>
                    </div>
                  </div>
                </CentralDocumentSheet>
              )}
            </CentralPrintPreviewModal>

            {/* ─── MODAL 5: EXAM ATTENDANCE & VERIFICATION SHEET PREVIEW ─── */}
            <CentralPrintPreviewModal
              isOpen={showAttendanceSheetModal}
              onClose={() => setShowAttendanceSheetModal(false)}
              title="परीक्षा हल उम्मेदवार हाजिरी तथा रुजु फारम (Exam Hall Attendance Sheet) - A4"
              targetElementId="printable-attendance-sheet"
            >
              {selectedAttendanceVacancy && (() => {
                const vacApps = applications.filter(a =>
                  (a.vacancyId === selectedAttendanceVacancy.id ||
                   a.vacancy_id === selectedAttendanceVacancy.id ||
                   a.vacancyNo === (selectedAttendanceVacancy.vacancyNo || selectedAttendanceVacancy.vacancy_no) ||
                   a.vacancy_no === (selectedAttendanceVacancy.vacancyNo || selectedAttendanceVacancy.vacancy_no)) &&
                  (a.status?.includes('स्वीकृत') || a.status?.includes('Approved') || a.status?.includes('विचाराधीन'))
                );

                return (
                  <CentralDocumentSheet
                    id="printable-attendance-sheet"
                    palikaName={dynamicPalikaName}
                    palikaNameEn={dynamicPalikaNameEn}
                    localGovType="स्थानीय सरकार"
                    officeTitle={dynamicOfficeTitle}
                    location={dynamicAddress}
                    provinceCountry={dynamicProvinceCountry}
                    establishedYear="२०७३"
                    activeFiscalYear="२०८३/०८४"
                    patraSankhya="२०८३/०८४"
                    chalaniNo={selectedAttendanceVacancy.vacancyNo || selectedAttendanceVacancy.vacancy_no || '०४/२०८३/०८४'}
                    branchTitle="कर्मचारी पदपूर्ति तथा आन्तरिक परीक्षा सञ्चालन समिति"
                    documentTitle="परीक्षा हल उम्मेदवार हाजिरी तथा रुजु फारम (Attendance & Verification Sheet)"
                    slogan={dynamicSlogan}
                    website={dynamicWebsite}
                    email={dynamicEmail}
                    phone={dynamicPhone}
                    logoUrl={dynamicPalikaLogo}
                    emblemUrl={dynamicEmblemUrl}
                    dateBs="२०८३/०८/०५"
                    dateAd="2026-11-20"
                    showWatermark={true}
                    showFooter={true}
                  >
                    <div style={{ padding: '0.75rem 0.25rem' }}>
                      {/* Vacancy Info Box */}
                      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '0.75rem', fontSize: '0.8rem', border: '1px solid #94a3b8' }}>
                        <tbody>
                          <tr style={{ background: '#f8fafc' }}>
                            <td style={{ padding: '5px 8px', border: '1px solid #cbd5e1', width: '15%', fontWeight: 700 }}>विज्ञापन नं.:</td>
                            <td style={{ padding: '5px 8px', border: '1px solid #cbd5e1', width: '35%', fontWeight: 800, color: '#0369a1' }}>
                              {selectedAttendanceVacancy.vacancyNo || selectedAttendanceVacancy.vacancy_no}
                            </td>
                            <td style={{ padding: '5px 8px', border: '1px solid #cbd5e1', width: '15%', fontWeight: 700 }}>पद, तह र सेवा:</td>
                            <td style={{ padding: '5px 8px', border: '1px solid #cbd5e1', width: '35%', fontWeight: 800 }}>
                              {selectedAttendanceVacancy.title} | {selectedAttendanceVacancy.level} | {selectedAttendanceVacancy.serviceGroup}
                            </td>
                          </tr>
                          <tr>
                            <td style={{ padding: '5px 8px', border: '1px solid #cbd5e1', fontWeight: 700 }}>परीक्षा मिति र समय:</td>
                            <td style={{ padding: '5px 8px', border: '1px solid #cbd5e1', fontWeight: 800, color: '#dc2626' }}>
                              {selectedAttendanceVacancy.examDateBs || selectedAttendanceVacancy.exam_date_bs || 'तोकिएको सूचना बमोजिम'}
                            </td>
                            <td style={{ padding: '5px 8px', border: '1px solid #cbd5e1', fontWeight: 700 }}>परीक्षा केन्द्र:</td>
                            <td style={{ padding: '5px 8px', border: '1px solid #cbd5e1', fontWeight: 700 }}>
                              {selectedAttendanceVacancy.examCenter || 'पाँचपोखरी थाङपाल मा.वि., वडा नं ६, सिन्धुपाल्चोक'}
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      {/* Candidates Attendance Table */}
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', border: '1px solid #334155' }}>
                        <thead>
                          <tr style={{ background: '#e2e8f0', color: '#0f172a', textAlign: 'center', fontWeight: 800 }}>
                            <th style={{ border: '1px solid #64748b', padding: '5px 3px', width: '30px' }}>क्र.सं.</th>
                            <th style={{ border: '1px solid #64748b', padding: '5px 4px', width: '90px' }}>रोल नं. / दरखास्त नं.</th>
                            <th style={{ border: '1px solid #64748b', padding: '5px 6px', textAlign: 'left' }}>उम्मेदवारको नाम र ठेगाना</th>
                            <th style={{ border: '1px solid #64748b', padding: '5px 4px', width: '80px' }}>नागरिकता / फोन</th>
                            <th style={{ border: '1px solid #64748b', padding: '5px 4px', width: '50px' }}>तस्बिर</th>
                            <th style={{ border: '1px solid #64748b', padding: '5px 4px', width: '95px' }}>उम्मेदवारको दस्तखत</th>
                            <th style={{ border: '1px solid #64748b', padding: '5px 4px', width: '70px' }}>उत्तरपुस्तिका नं.</th>
                            <th style={{ border: '1px solid #64748b', padding: '5px 4px', width: '75px' }}>निरीक्षक दस्तखत</th>
                          </tr>
                        </thead>
                        <tbody>
                          {vacApps.length === 0 ? (
                            <tr>
                              <td colSpan={8} style={{ padding: '1.5rem', textAlign: 'center', color: '#64748b', border: '1px solid #cbd5e1' }}>
                                यस विज्ञापनमा स्वीकृत उम्मेदवारहरू उपलब्ध छैनन्।
                              </td>
                            </tr>
                          ) : (
                            vacApps.map((cand, idx) => (
                              <tr key={cand.id || idx} style={{ borderBottom: '1px solid #cbd5e1', height: '54px' }}>
                                <td style={{ border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 700 }}>{idx + 1}</td>
                                <td style={{ border: '1px solid #cbd5e1', textAlign: 'center', fontFamily: 'monospace' }}>
                                  <div style={{ fontWeight: 800, color: '#1e3a8a' }}>{cand.admitCardRollNo || cand.admit_card_roll_no || 'रजिष्टर्ड'}</div>
                                  <div style={{ fontSize: '0.66rem', color: '#64748b' }}>{cand.applicationNo || cand.application_no}</div>
                                </td>
                                <td style={{ border: '1px solid #cbd5e1', padding: '4px 6px' }}>
                                  <div style={{ fontWeight: 800, color: '#0f172a' }}>{cand.fullNameNp || cand.full_name_np}</div>
                                  <div style={{ fontSize: '0.7rem', color: '#475569' }}>{cand.fullNameEn || cand.full_name_en}</div>
                                  <div style={{ fontSize: '0.66rem', color: '#64748b' }}>वडा नं. {cand.wardNo || cand.ward_no || '६'}, सिन्धुपाल्चोक</div>
                                </td>
                                <td style={{ border: '1px solid #cbd5e1', textAlign: 'center', fontSize: '0.7rem' }}>
                                  <div style={{ fontWeight: 600 }}>{cand.citizenshipNo || cand.citizenship_no}</div>
                                  <div style={{ color: '#0284c7', fontSize: '0.68rem' }}>{cand.phone}</div>
                                </td>
                                <td style={{ border: '1px solid #cbd5e1', textAlign: 'center', padding: '2px' }}>
                                  {cand.photoDocUrl || cand.photo_doc_url ? (
                                    <img
                                      src={cand.photoDocUrl || cand.photo_doc_url}
                                      alt="Photo"
                                      style={{ width: '38px', height: '46px', objectFit: 'cover', borderRadius: '3px', margin: '0 auto', display: 'block' }}
                                    />
                                  ) : (
                                    <div style={{ width: '36px', height: '44px', border: '1px dashed #94a3b8', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.58rem', color: '#94a3b8' }}>
                                      फोटो
                                    </div>
                                  )}
                                </td>
                                <td style={{ border: '1px solid #cbd5e1', textAlign: 'center', verticalAlign: 'bottom', paddingBottom: '4px' }}>
                                  <div style={{ borderBottom: '1px dotted #94a3b8', margin: '0 4px', height: '32px' }}></div>
                                </td>
                                <td style={{ border: '1px solid #cbd5e1', textAlign: 'center' }}>
                                  <div style={{ borderBottom: '1px dotted #94a3b8', margin: '0 4px', height: '22px' }}></div>
                                </td>
                                <td style={{ border: '1px solid #cbd5e1', textAlign: 'center', verticalAlign: 'bottom', paddingBottom: '4px' }}>
                                  <div style={{ borderBottom: '1px dotted #94a3b8', margin: '0 4px', height: '22px' }}></div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>

                      {/* Selection Committee / Invigilator Sign-off Blocks */}
                      <div style={{ marginTop: '2.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem', textAlign: 'center', paddingTop: '1.25rem', borderTop: '1px solid #cbd5e1' }}>
                        <div>
                          <div style={{ borderBottom: '1px dashed #64748b', height: '36px', marginBottom: '4px' }}></div>
                          <span style={{ fontSize: '0.78rem', fontWeight: 800, display: 'block' }}>सहायक केन्द्राध्यक्ष / निरीक्षक</span>
                          <span style={{ fontSize: '0.68rem', color: '#64748b' }}>परीक्षा हल</span>
                        </div>
                        <div>
                          <div style={{ borderBottom: '1px dashed #64748b', height: '36px', marginBottom: '4px' }}></div>
                          <span style={{ fontSize: '0.78rem', fontWeight: 800, display: 'block' }}>केन्द्राध्यक्ष (दस्तखत/छाप)</span>
                          <span style={{ fontSize: '0.68rem', color: '#64748b' }}>परीक्षा केन्द्र</span>
                        </div>
                        <div>
                          <div style={{ borderBottom: '1px dashed #64748b', height: '36px', marginBottom: '4px' }}></div>
                          <span style={{ fontSize: '0.78rem', fontWeight: 800, display: 'block' }}>सदस्य-सचिव</span>
                          <span style={{ fontSize: '0.68rem', color: '#64748b' }}>पदपूर्ति उपसमिति</span>
                        </div>
                        <div>
                          <div style={{ borderBottom: '1px dashed #64748b', height: '36px', marginBottom: '4px' }}></div>
                          <span style={{ fontSize: '0.78rem', fontWeight: 800, display: 'block' }}>संयोजक / अध्यक्ष</span>
                          <span style={{ fontSize: '0.68rem', color: '#64748b' }}>पदपूर्ति तथा छनोट समिति</span>
                        </div>
                      </div>
                    </div>
                  </CentralDocumentSheet>
                );
              })()}
            </CentralPrintPreviewModal>

            {/* ─── MODAL: DOCUMENT PREVIEW MODAL ─── */}
            {previewDoc && (
              <div className="rec-modal-backdrop" style={{ zIndex: 99999 }}>
                <div className="rec-modal-panel" style={{ maxWidth: '850px', maxHeight: '92vh', width: '95%' }}>
                  <div className="rec-modal-header" style={{ background: '#1e3a8a', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Eye size={16} />
                      कागजात पूर्वावलोकन: {previewDoc.label}
                    </h3>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <a
                        href={previewDoc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rec-btn"
                        style={{ fontSize: '0.72rem', padding: '0.25rem 0.55rem', background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.4)' }}
                      >
                        <ExternalLink size={12} /> नयाँ विन्डोमा खोल्नुहोस्
                      </a>
                      <button
                        type="button"
                        onClick={() => setPreviewDoc(null)}
                        style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: '0.2rem' }}
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                  <div className="rec-modal-body" style={{ padding: '0.75rem', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#0f172a', minHeight: '400px' }}>
                    {previewDoc.isImg || previewDoc.url.match(/\.(jpg|jpeg|png|webp|gif)($|\?)/i) ? (
                      <img
                        src={previewDoc.url}
                        alt={previewDoc.label}
                        style={{ maxWidth: '100%', maxHeight: '72vh', objectFit: 'contain', borderRadius: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }}
                      />
                    ) : (
                      <iframe
                        src={previewDoc.url}
                        title={previewDoc.label}
                        style={{ width: '100%', height: '72vh', border: 'none', background: '#fff', borderRadius: '4px' }}
                      />
                    )}
                  </div>
                  <div className="rec-modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>{previewDoc.label}</span>
                    <button
                      type="button"
                      onClick={() => setPreviewDoc(null)}
                      className="rec-btn rec-btn-outline"
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
