import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client';
import { NepaliDatePicker } from '../../components/common/NepaliDatePicker';
import * as XLSX from 'xlsx';
import ssisFallbackData from '../../data/ssis_vital_report.json';
import {
  Users,
  Search,
  Plus,
  Printer,
  X,
  FileCheck,
  Calendar,
  Building,
  QrCode,
  Baby,
  Heart,
  Compass,
  FileSpreadsheet,
  UploadCloud,
  BarChart3,
  TrendingUp,
  Download,
  AlertCircle,
  CheckCircle,
  FileText,
  RefreshCw,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  CreditCard,
  UserCheck,
  Edit2,
  Trash2,
  Eye,
  Phone,
  Landmark
} from 'lucide-react';

interface VitalEvent {
  id: string;
  registrationNumber: string;
  eventType: string;
  personName: string;
  personNameEn?: string;
  eventDateBs: string;
  eventDateAd?: string;
  wardNumber: number;
  informantName: string;
  informantCitizenshipNo?: string;
  fatherOrHusbandName?: string;
  motherName?: string;
  status: string;
  remarks?: string;
}

interface WardVitalData {
  ward: number;
  ward_label: string;
  birth: { male: number; female: number; third_gender: number; total: number };
  death: { male: number; female: number; third_gender: number; total: number };
  divorce: number;
  marriage: number;
  migration_in: { cases: number; members: number };
  migration_out: { cases: number; members: number };
  unclaimed: number;
  total_events: number;
}

interface Beneficiary {
  id: string;
  beneficiary_id: string;
  full_name: string;
  full_name_en?: string;
  citizenship_or_nid_no?: string;
  category: string;
  ward_number: number;
  tole_village?: string;
  gender?: string;
  date_of_birth_bs?: string;
  contact_phone?: string;
  guardian_name?: string;
  bank_name?: string;
  bank_account_no?: string;
  monthly_allowance_npr?: number;
  quarterly_allowance_npr?: number;
  status: string;
  fiscal_year?: string;
  renewal_date_bs?: string;
}

const BENEFICIARY_CATEGORIES = [
  'जेष्ठ नागरिक (६८ वर्ष माथि)',
  'जेष्ठ नागरिक दलित (६० वर्ष माथि)',
  'एकल महिला / विधवा (६० वर्ष माथि)',
  'पूर्ण अपाङ्गता (क वर्ग - रातो कार्ड)',
  'अति अशक्त अपाङ्गता (ख वर्ग - नीलो कार्ड)',
  'बालबालिका पोषण भत्ता (५ वर्ष मुनि)',
  'लोपोन्मुख आदिवासी / जनजाति'
];

const CATEGORY_RATES: Record<string, number> = {
  'जेष्ठ नागरिक (६८ वर्ष माथि)': 4000,
  'जेष्ठ नागरिक दलित (६० वर्ष माथि)': 2660,
  'एकल महिला / विधवा (६० वर्ष माथि)': 2660,
  'पूर्ण अपाङ्गता (क वर्ग - रातो कार्ड)': 3990,
  'अति अशक्त अपाङ्गता (ख वर्ग - नीलो कार्ड)': 2128,
  'बालबालिका पोषण भत्ता (५ वर्ष मुनि)': 532,
  'लोपोन्मुख आदिवासी / जनजाति': 3990
};

const EVENT_TYPES = [
  'जन्म दर्ता (Birth Registration)',
  'मृत्यु दर्ता (Death Registration)',
  'विवाह दर्ता (Marriage Registration)',
  'बसाइँसराइ दर्ता (Migration Registration)',
  'सम्बन्ध विच्छेद (Divorce Registration)',
];

export const VitalRegistrationPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');

  const [activeTab, setActiveTab] = useState<'ssis_report' | 'beneficiaries' | 'registry'>(() => {
    if (tabParam === 'beneficiaries' || tabParam === 'social-security') return 'beneficiaries';
    if (tabParam === 'registry') return 'registry';
    return 'ssis_report';
  });

  useEffect(() => {
    if (tabParam === 'beneficiaries' || tabParam === 'social-security') {
      setActiveTab('beneficiaries');
    } else if (tabParam === 'registry') {
      setActiveTab('registry');
    } else if (tabParam === 'ssis_report') {
      setActiveTab('ssis_report');
    }
  }, [tabParam]);

  const switchTab = (tab: 'ssis_report' | 'beneficiaries' | 'registry') => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };
  
  // General filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedWard, setSelectedWard] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddBeneficiaryModal, setShowAddBeneficiaryModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [certModalData, setCertModalData] = useState<VitalEvent | null>(null);
  const [viewBeneficiary, setViewBeneficiary] = useState<Beneficiary | null>(null);

  // Upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Event Form State
  const [formData, setFormData] = useState({
    eventType: 'जन्म दर्ता (Birth Registration)',
    personName: '',
    personNameEn: '',
    eventDateBs: '२०८१-०९-१४',
    eventDateAd: '',
    wardNumber: 1,
    informantName: '',
    informantCitizenshipNo: '',
    fatherOrHusbandName: '',
    motherName: '',
    remarks: '',
  });

  // Beneficiary Form State
  const [benForm, setBenForm] = useState({
    full_name: '',
    full_name_en: '',
    citizenship_or_nid_no: '',
    category: 'जेष्ठ नागरिक (६८ वर्ष माथि)',
    ward_number: 1,
    tole_village: '',
    gender: 'पुरुष',
    date_of_birth_bs: '२०१०-०१-०१',
    contact_phone: '',
    guardian_name: '',
    bank_name: 'नेपाल बैंक लि., भोताङ शाखा',
    bank_account_no: '',
    monthly_allowance_npr: 4000,
    status: 'सक्रिय',
    renewal_date_bs: '२०८१-०४-०१'
  });

  // 1. Fetch SSIS Ward-wise Report
  const { data: ssisReport = ssisFallbackData, isLoading: isReportLoading, refetch: refetchReport } = useQuery({
    queryKey: ['ssis-vital-report'],
    queryFn: async () => {
      try {
        const res: any = await api.get('/vital-events/ssis-report');
        return res?.data || res || ssisFallbackData;
      } catch (err) {
        console.warn('Backend API fallback to bundled SSIS data', err);
        return ssisFallbackData;
      }
    },
  });

  // 2. Fetch Beneficiaries List
  const { data: beneficiaries = [], isLoading: isBenLoading } = useQuery<Beneficiary[]>({
    queryKey: ['social-security-beneficiaries'],
    queryFn: async () => {
      try {
        const res: any = await api.get('/social-security/beneficiaries');
        return res?.data || res || [];
      } catch {
        return [];
      }
    },
  });

  // 3. Fetch Beneficiaries Summary
  const { data: benSummary } = useQuery({
    queryKey: ['social-security-summary'],
    queryFn: async () => {
      try {
        const res: any = await api.get('/social-security/summary');
        return res?.data || res || {};
      } catch {
        return {};
      }
    },
  });

  // 4. Fetch Events Registry
  const { data: events = [], isLoading: isEventsLoading } = useQuery<VitalEvent[]>({
    queryKey: ['vital-events'],
    queryFn: async () => {
      try {
        const res: any = await api.get('/vital-events');
        return res?.data || res || [];
      } catch {
        return [];
      }
    },
  });

  // 5. Fetch Vital Stats
  const { data: stats } = useQuery({
    queryKey: ['vital-events-stats'],
    queryFn: async () => {
      try {
        const res: any = await api.get('/vital-events/stats');
        return res?.data || res || {};
      } catch {
        return ssisFallbackData.summary;
      }
    },
  });

  // Create Event Mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return api.post('/vital-events', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vital-events'] });
      queryClient.invalidateQueries({ queryKey: ['vital-events-stats'] });
      setShowAddModal(false);
      setFormData({
        eventType: 'जन्म दर्ता (Birth Registration)',
        personName: '',
        personNameEn: '',
        eventDateBs: '२०८१-०९-१४',
        eventDateAd: '',
        wardNumber: 1,
        informantName: '',
        informantCitizenshipNo: '',
        fatherOrHusbandName: '',
        motherName: '',
        remarks: '',
      });
    },
  });

  // Create Beneficiary Mutation
  const createBeneficiaryMutation = useMutation({
    mutationFn: async (data: any) => {
      return api.post('/social-security/beneficiaries', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-security-beneficiaries'] });
      queryClient.invalidateQueries({ queryKey: ['social-security-summary'] });
      setShowAddBeneficiaryModal(false);
      setBenForm({
        full_name: '',
        full_name_en: '',
        citizenship_or_nid_no: '',
        category: 'जेष्ठ नागरिक (६८ वर्ष माथि)',
        ward_number: 1,
        tole_village: '',
        gender: 'पुरुष',
        date_of_birth_bs: '२०१०-०१-०१',
        contact_phone: '',
        guardian_name: '',
        bank_name: 'नेपाल बैंक लि., भोताङ शाखा',
        bank_account_no: '',
        monthly_allowance_npr: 4000,
        status: 'सक्रिय',
        renewal_date_bs: '२०८१-०४-०१'
      });
    },
  });

  // Delete Beneficiary Mutation
  const deleteBeneficiaryMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/social-security/beneficiaries/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-security-beneficiaries'] });
      queryClient.invalidateQueries({ queryKey: ['social-security-summary'] });
    },
  });

  // Renew Beneficiary Mutation
  const renewBeneficiaryMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.put(`/social-security/beneficiaries/${id}/renew`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-security-beneficiaries'] });
      queryClient.invalidateQueries({ queryKey: ['social-security-summary'] });
    },
  });

  // Handle SSIS File Upload
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      setUploadMsg({ type: 'error', text: 'कृपया पहिले SSIS को .xls वा .htm फाइल छान्नुहोस्।' });
      return;
    }
    setUploadLoading(true);
    setUploadMsg(null);
    try {
      const data = new FormData();
      data.append('file', uploadFile);
      const res: any = await api.post('/vital-events/import-ssis-report', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadMsg({ type: 'success', text: res?.data?.message || 'प्रतिवेदन सफलतापूर्वक आयात गरियो!' });
      queryClient.invalidateQueries({ queryKey: ['ssis-vital-report'] });
      queryClient.invalidateQueries({ queryKey: ['vital-events-stats'] });
      setTimeout(() => {
        setShowUploadModal(false);
        setUploadFile(null);
        setUploadMsg(null);
      }, 1500);
    } catch (err: any) {
      setUploadMsg({
        type: 'error',
        text: err?.response?.data?.detail || 'फाइल आयात गर्दा त्रुटि भयो। कृपया फाइल जाँच गरी पुनः प्रयास गर्नुहोस्।'
      });
    } finally {
      setUploadLoading(false);
    }
  };

  // Export SSIS Report to Excel
  const handleExportSSISExcel = () => {
    const wards: WardVitalData[] = ssisReport?.wards || [];
    const summary = ssisReport?.summary || {};

    const rows = wards.map((w, idx) => ({
      'क्र.सं.': idx + 1,
      'वडा नं.': `वडा नं. ${w.ward}`,
      'जन्म (पुरुष)': w.birth.male,
      'जन्म (महिला)': w.birth.female,
      'जन्म (अन्य)': w.birth.third_gender,
      'जन्म (कुल)': w.birth.total,
      'मृत्यु (पुरुष)': w.death.male,
      'मृत्यु (महिला)': w.death.female,
      'मृत्यु (अन्य)': w.death.third_gender,
      'मृत्यु (कुल)': w.death.total,
      'सम्बन्ध विच्छेद': w.divorce,
      'विवाह दर्ता': w.marriage,
      'बसाइँ आएको (दर्ता सं.)': w.migration_in.cases,
      'बसाइँ आएको (सदस्य सं.)': w.migration_in.members,
      'बसाइँ जाने (दर्ता सं.)': w.migration_out.cases,
      'बसाइँ जाने (सदस्य सं.)': w.migration_out.members,
      'बेवारिसे': w.unclaimed,
      'कुल दर्ता घटना': w.total_events,
      'प्रतिशत हिस्सा (%)': summary.total_events ? ((w.total_events / summary.total_events) * 100).toFixed(1) + '%' : '-'
    }));

    if (summary.total_events) {
      rows.push({
        'क्र.सं.': '' as any,
        'वडा नं.': 'कुल जम्मा',
        'जन्म (पुरुष)': summary.birth?.male || 0,
        'जन्म (महिला)': summary.birth?.female || 0,
        'जन्म (अन्य)': summary.birth?.third_gender || 0,
        'जन्म (कुल)': summary.birth?.total || 0,
        'मृत्यु (पुरुष)': summary.death?.male || 0,
        'मृत्यु (महिला)': summary.death?.female || 0,
        'मृत्यु (अन्य)': summary.death?.third_gender || 0,
        'मृत्यु (कुल)': summary.death?.total || 0,
        'सम्बन्ध विच्छेद': summary.divorce || 0,
        'विवाह दर्ता': summary.marriage || 0,
        'बसाइँ आएको (दर्ता सं.)': summary.migration_in?.cases || 0,
        'बसाइँ आएको (सदस्य सं.)': summary.migration_in?.members || 0,
        'बसाइँ जाने (दर्ता सं.)': summary.migration_out?.cases || 0,
        'बसाइँ जाने (सदस्य सं.)': summary.migration_out?.members || 0,
        'बेवारिसे': summary.unclaimed || 0,
        'कुल दर्ता घटना': summary.total_events || 0,
        'प्रतिशत हिस्सा (%)': '१००%'
      });
    }

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'SSIS_घटना_दर्ता_प्रतिवेदन');
    XLSX.writeFile(wb, `SSIS_Vital_Registration_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // Export Beneficiaries to Excel
  const handleExportBeneficiariesExcel = () => {
    const rows = filteredBeneficiaries.map((b, idx) => ({
      'क्र.सं.': idx + 1,
      'लाभग्राही परिचय नं.': b.beneficiary_id,
      'लाभग्राहीको नाम': b.full_name,
      'Name in English': b.full_name_en || '-',
      'लिङ्ग': b.gender || '-',
      'नागरिकता / NID नं.': b.citizenship_or_nid_no || '-',
      'भत्ताको प्रकार': b.category,
      'वडा नं.': `वडा नं. ${b.ward_number}`,
      'टोल / गाउँ': b.tole_village || '-',
      'सम्पर्क फोन': b.contact_phone || '-',
      'संरक्षकको नाम': b.guardian_name || '-',
      'बैंकको नाम': b.bank_name || '-',
      'बैंक खाता नम्बर': b.bank_account_no || '-',
      'मासिक रकम (रु.)': b.monthly_allowance_npr || 0,
      'त्रैमासिक रकम (रु.)': (b.monthly_allowance_npr || 0) * 3,
      'अवस्था': b.status,
      'आर्थिक वर्ष': b.fiscal_year || '२०८१/०८२',
      'नवीकरण मिति': b.renewal_date_bs || '-'
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'सामाजिक_सुरक्षा_लाभग्राही');
    XLSX.writeFile(wb, `Social_Security_Beneficiaries_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const wardsData: WardVitalData[] = ssisReport?.wards || [];
  const summaryData = ssisReport?.summary || {};

  // Filtered wards for table view if a single ward is selected
  const displayedWards = selectedWard === 'all'
    ? wardsData
    : wardsData.filter(w => w.ward === Number(selectedWard));

  // Filtered Beneficiaries List
  const filteredBeneficiaries = beneficiaries.filter((b) => {
    const matchSearch =
      b.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.beneficiary_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.citizenship_or_nid_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.bank_account_no?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchWard = selectedWard === 'all' || b.ward_number === Number(selectedWard);
    const matchCategory = selectedCategory === 'all' || b.category === selectedCategory;
    const matchStatus = selectedStatus === 'all' || b.status === selectedStatus;
    return matchSearch && matchWard && matchCategory && matchStatus;
  });

  // Filtered Registry List
  const filteredRegistry = events.filter((e) => {
    const matchSearch =
      e.personName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.registrationNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.informantName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = selectedType === 'all' || e.eventType === selectedType;
    const matchWard = selectedWard === 'all' || e.wardNumber === Number(selectedWard);
    return matchSearch && matchType && matchWard;
  });

  return (
    <div style={{ padding: '1.5rem', background: '#f8fafc', minHeight: '100vh' }}>
      {/* Top Banner Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.25rem',
        marginBottom: '1.5rem',
        padding: '1.5rem 1.75rem',
        background: 'linear-gradient(135deg, #0f766e 0%, #0369a1 50%, #1e40af 100%)',
        color: '#fff',
        borderRadius: '16px',
        boxShadow: '0 10px 25px -5px rgba(15, 118, 110, 0.25)'
      }}>
        <div style={{ maxWidth: '680px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
            <span style={{
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(8px)',
              padding: '0.25rem 0.75rem',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.5px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}>
              <ShieldCheck size={14} /> राष्ट्रिय परिचयपत्र तथा पञ्जीकरण विभाग (DoNIDCR / SSIS)
            </span>
            <span style={{
              background: 'rgba(16, 185, 129, 0.3)',
              border: '1px solid rgba(16, 185, 129, 0.5)',
              padding: '0.2rem 0.6rem',
              borderRadius: '20px',
              fontSize: '0.72rem',
              fontWeight: 600
            }}>
              पाँचपोखरी थाङपाल गाउँपालिका
            </span>
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, margin: '0 0 0.4rem 0', lineHeight: 1.25 }}>
            सामाजिक सुरक्षा तथा व्यक्तिगत घटना दर्ता प्रणाली (SSIS)
          </h1>
          <p style={{ margin: 0, opacity: 0.92, fontSize: '0.875rem', lineHeight: 1.5 }}>
            वडागत घटना दर्ता प्रतिवेदन, सामाजिक सुरक्षा भत्ता प्राप्त गर्ने लाभग्राही लगत तथा व्यक्तिगत घटना पञ्जीकरण व्यवस्थापन
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {activeTab === 'beneficiaries' ? (
            <>
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
                  transition: 'all 0.2s'
                }}
              >
                <Printer size={16} /> भरपाई प्रिन्ट (Print)
              </button>

              <button
                onClick={handleExportBeneficiariesExcel}
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
                <FileSpreadsheet size={16} /> लाभग्राही लगत Excel (.xlsx)
              </button>

              <button
                onClick={() => setShowAddBeneficiaryModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.65rem 1.25rem',
                  background: '#38bdf8',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#0f172a',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  boxShadow: '0 4px 6px -1px rgba(56, 189, 248, 0.4)'
                }}
              >
                <Plus size={16} /> नयाँ लाभग्राही थप्नुहोस्
              </button>
            </>
          ) : activeTab === 'ssis_report' ? (
            <>
              <button
                onClick={handleExportSSISExcel}
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
                <FileSpreadsheet size={16} /> एक्सेल Export (.xlsx)
              </button>

              <button
                onClick={() => setShowUploadModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.65rem 1.15rem',
                  background: 'rgba(255, 255, 255, 0.18)',
                  border: '1px solid rgba(255, 255, 255, 0.35)',
                  borderRadius: '10px',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  backdropFilter: 'blur(8px)',
                  transition: 'all 0.2s'
                }}
              >
                <UploadCloud size={16} /> नयाँ SSIS (.xls) आयात
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowAddModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.65rem 1.25rem',
                background: '#38bdf8',
                border: 'none',
                borderRadius: '10px',
                color: '#0f172a',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.85rem'
              }}
            >
              <Plus size={16} /> नयाँ घटना दर्ता
            </button>
          )}

          <button
            onClick={() => window.print()}
            title="प्रिन्ट गर्नुहोस्"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              background: 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '10px',
              color: '#fff',
              cursor: 'pointer'
            }}
          >
            <Printer size={16} />
          </button>
        </div>
      </div>

      {/* Primary Navigation Tabs - Premium Interactive Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
        gap: '0.85rem',
        marginBottom: '1.75rem',
        padding: '0.45rem',
        background: '#f1f5f9',
        borderRadius: '16px',
        border: '1.5px solid #e2e8f0',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.03)'
      }}>
        {/* Tab 1: SSIS Report */}
        <button
          onClick={() => { switchTab('ssis_report'); setSearchTerm(''); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.85rem',
            padding: '0.85rem 1.15rem',
            borderRadius: '12px',
            border: activeTab === 'ssis_report' ? '2px solid #0f766e' : '2px solid transparent',
            cursor: 'pointer',
            background: activeTab === 'ssis_report' ? '#ffffff' : 'transparent',
            boxShadow: activeTab === 'ssis_report'
              ? '0 8px 20px -3px rgba(15, 118, 110, 0.2), 0 3px 6px -1px rgba(0,0,0,0.05)'
              : 'none',
            transition: 'all 0.25s ease',
            textAlign: 'left'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '11px',
              background: activeTab === 'ssis_report'
                ? 'linear-gradient(135deg, #0f766e 0%, #0d9488 100%)'
                : '#e2e8f0',
              color: activeTab === 'ssis_report' ? '#ffffff' : '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: activeTab === 'ssis_report' ? '0 4px 12px rgba(15, 118, 110, 0.35)' : 'none',
              transition: 'all 0.25s'
            }}>
              <BarChart3 size={22} />
            </div>
            <div>
              <div style={{
                fontSize: '0.94rem',
                fontWeight: 800,
                color: activeTab === 'ssis_report' ? '#0f766e' : '#334155',
                lineHeight: 1.25
              }}>
                SSIS वडागत प्रतिवेदन
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '0.2rem' }}>
                ८ वटै वडाको पञ्जीकरण लगत
              </div>
            </div>
          </div>
          <span style={{
            background: activeTab === 'ssis_report' ? '#0f766e' : '#e2e8f0',
            color: activeTab === 'ssis_report' ? '#ffffff' : '#475569',
            padding: '0.35rem 0.75rem',
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: 700,
            whiteSpace: 'nowrap',
            boxShadow: activeTab === 'ssis_report' ? '0 2px 6px rgba(15, 118, 110, 0.3)' : 'none'
          }}>
            १,६१० दर्ता
          </span>
        </button>

        {/* Tab 2: Social Security Beneficiaries */}
        <button
          onClick={() => { switchTab('beneficiaries'); setSearchTerm(''); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.85rem',
            padding: '0.85rem 1.15rem',
            borderRadius: '12px',
            border: activeTab === 'beneficiaries' ? '2px solid #1e40af' : '2px solid transparent',
            cursor: 'pointer',
            background: activeTab === 'beneficiaries' ? '#ffffff' : 'transparent',
            boxShadow: activeTab === 'beneficiaries'
              ? '0 8px 20px -3px rgba(30, 64, 175, 0.2), 0 3px 6px -1px rgba(0,0,0,0.05)'
              : 'none',
            transition: 'all 0.25s ease',
            textAlign: 'left'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '11px',
              background: activeTab === 'beneficiaries'
                ? 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)'
                : '#e2e8f0',
              color: activeTab === 'beneficiaries' ? '#ffffff' : '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: activeTab === 'beneficiaries' ? '0 4px 12px rgba(30, 64, 175, 0.35)' : 'none',
              transition: 'all 0.25s'
            }}>
              <CreditCard size={22} />
            </div>
            <div>
              <div style={{
                fontSize: '0.94rem',
                fontWeight: 800,
                color: activeTab === 'beneficiaries' ? '#1e40af' : '#334155',
                lineHeight: 1.25
              }}>
                सामाजिक सुरक्षा भत्ता विवरण
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '0.2rem' }}>
                लाभग्राही बैंक खाता तथा निकासा
              </div>
            </div>
          </div>
          <span style={{
            background: activeTab === 'beneficiaries' ? '#1e40af' : '#e2e8f0',
            color: activeTab === 'beneficiaries' ? '#ffffff' : '#475569',
            padding: '0.35rem 0.75rem',
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: 700,
            whiteSpace: 'nowrap',
            boxShadow: activeTab === 'beneficiaries' ? '0 2px 6px rgba(30, 64, 175, 0.3)' : 'none'
          }}>
            {beneficiaries.length} जना
          </span>
        </button>

        {/* Tab 3: Vital Events Registry */}
        <button
          onClick={() => { switchTab('registry'); setSearchTerm(''); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.85rem',
            padding: '0.85rem 1.15rem',
            borderRadius: '12px',
            border: activeTab === 'registry' ? '2px solid #0284c7' : '2px solid transparent',
            cursor: 'pointer',
            background: activeTab === 'registry' ? '#ffffff' : 'transparent',
            boxShadow: activeTab === 'registry'
              ? '0 8px 20px -3px rgba(2, 132, 199, 0.2), 0 3px 6px -1px rgba(0,0,0,0.05)'
              : 'none',
            transition: 'all 0.25s ease',
            textAlign: 'left'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '11px',
              background: activeTab === 'registry'
                ? 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)'
                : '#e2e8f0',
              color: activeTab === 'registry' ? '#ffffff' : '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: activeTab === 'registry' ? '0 4px 12px rgba(2, 132, 199, 0.35)' : 'none',
              transition: 'all 0.25s'
            }}>
              <FileText size={22} />
            </div>
            <div>
              <div style={{
                fontSize: '0.94rem',
                fontWeight: 800,
                color: activeTab === 'registry' ? '#0369a1' : '#334155',
                lineHeight: 1.25
              }}>
                व्यक्तिगत घटना दर्ता सूची
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '0.2rem' }}>
                DoNIDCR प्रमाणपत्र तथा QR कोड
              </div>
            </div>
          </div>
          <span style={{
            background: activeTab === 'registry' ? '#0284c7' : '#e2e8f0',
            color: activeTab === 'registry' ? '#ffffff' : '#475569',
            padding: '0.35rem 0.75rem',
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: 700,
            whiteSpace: 'nowrap',
            boxShadow: activeTab === 'registry' ? '0 2px 6px rgba(2, 132, 199, 0.3)' : 'none'
          }}>
            {events.length} लगत
          </span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 2: SOCIAL SECURITY BENEFICIARIES (सामाजिक सुरक्षा भत्ता) */}
      {/* ============================================================== */}
      {activeTab === 'beneficiaries' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Beneficiaries Summary Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem'
          }}>
            <div style={{
              background: '#fff',
              padding: '1.25rem',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 5px rgba(0,0,0,0.03)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>कुल लाभग्राही संख्या</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e40af', marginTop: '0.2rem' }}>
                  {beneficiaries.length} <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>जना</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 600, marginTop: '0.15rem' }}>
                  सक्रिय / नवीकृत: {beneficiaries.filter(b => b.status !== 'स्थगित' && b.status !== 'कट्टा').length} जना
                </div>
              </div>
              <div style={{ background: '#eff6ff', color: '#1e40af', padding: '0.75rem', borderRadius: '12px' }}>
                <Users size={24} />
              </div>
            </div>

            <div style={{
              background: '#fff',
              padding: '1.25rem',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 5px rgba(0,0,0,0.03)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>मासिक भत्ता निकासा</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f766e', marginTop: '0.2rem' }}>
                  रु. {(benSummary?.totalMonthlyPayout || beneficiaries.reduce((acc, b) => acc + (b.monthly_allowance_npr || 0), 0)).toLocaleString('ne-NP')}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#0f766e', marginTop: '0.15rem' }}>
                  प्रत्यक्ष बैंक खाता भुक्तानी
                </div>
              </div>
              <div style={{ background: '#f0fdfa', color: '#0f766e', padding: '0.75rem', borderRadius: '12px' }}>
                <CreditCard size={24} />
              </div>
            </div>

            <div style={{
              background: '#fff',
              padding: '1.25rem',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 5px rgba(0,0,0,0.03)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>त्रैमासिक बजेट (Quarterly)</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#d97706', marginTop: '0.2rem' }}>
                  रु. {(benSummary?.totalQuarterlyPayout || beneficiaries.reduce((acc, b) => acc + ((b.monthly_allowance_npr || 0) * 3), 0)).toLocaleString('ne-NP')}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#b45309', marginTop: '0.15rem' }}>
                  चालु आ.व. २०८१/०८२
                </div>
              </div>
              <div style={{ background: '#fffbeb', color: '#d97706', padding: '0.75rem', borderRadius: '12px' }}>
                <Landmark size={24} />
              </div>
            </div>

            <div style={{
              background: '#fff',
              padding: '1.25rem',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 5px rgba(0,0,0,0.03)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>भत्ताका प्रकारहरू</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#7c3aed', marginTop: '0.2rem' }}>
                  ७ <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>समूह</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#7c3aed', marginTop: '0.15rem' }}>
                  जेष्ठ, एकल, अपाङ्ग, पोषण, लोपोन्मुख
                </div>
              </div>
              <div style={{ background: '#f5f3ff', color: '#7c3aed', padding: '0.75rem', borderRadius: '12px' }}>
                <Layers size={24} />
              </div>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div style={{
            background: '#fff',
            padding: '1rem 1.25rem',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.85rem',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', flex: 1, minWidth: '280px', position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type="text"
                placeholder="लाभग्राहीको नाम, परिचयपत्र नं, बैंक खाता वा नागरिकता नं खोज्नुहोस्..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 1rem 0.55rem 2.5rem',
                  borderRadius: '8px',
                  border: '1.5px solid #cbd5e1',
                  outline: 'none',
                  fontSize: '0.875rem',
                  background: '#f8fafc'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              <select
                value={selectedWard}
                onChange={(e) => setSelectedWard(e.target.value)}
                style={{
                  padding: '0.55rem 0.85rem',
                  borderRadius: '8px',
                  border: '1.5px solid #cbd5e1',
                  outline: 'none',
                  fontSize: '0.85rem',
                  background: '#fff'
                }}
              >
                <option value="all">सबै वडा (All Wards)</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
                  <option key={w} value={w}>वडा नं. {w}</option>
                ))}
              </select>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{
                  padding: '0.55rem 0.85rem',
                  borderRadius: '8px',
                  border: '1.5px solid #cbd5e1',
                  outline: 'none',
                  fontSize: '0.85rem',
                  background: '#fff'
                }}
              >
                <option value="all">सबै भत्ताका प्रकार (All Categories)</option>
                {BENEFICIARY_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                style={{
                  padding: '0.55rem 0.85rem',
                  borderRadius: '8px',
                  border: '1.5px solid #cbd5e1',
                  outline: 'none',
                  fontSize: '0.85rem',
                  background: '#fff'
                }}
              >
                <option value="all">सबै अवस्था (Status)</option>
                <option value="सक्रिय">सक्रिय (Active)</option>
                <option value="नवीकृत">नवीकृत (Renewed)</option>
                <option value="स्थगित">स्थगित (Suspended)</option>
              </select>
            </div>
          </div>

          {/* Beneficiaries Table */}
          <div style={{
            background: '#fff',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)'
          }}>
            <div style={{
              padding: '1rem 1.25rem',
              borderBottom: '1px solid #e2e8f0',
              background: '#f8fafc',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>
                  सामाजिक सुरक्षा भत्ता प्राप्त गर्ने लाभग्राही व्यक्तिहरूको सूची
                </h3>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                  पाँचपोखरी थाङपाल गाउँपालिकाका ८ वटै वडाका लाभग्राहीहरूको बैंक खाता तथा निकासा विवरण
                </p>
              </div>
              <span style={{ fontSize: '0.78rem', color: '#1e40af', fontWeight: 600, background: '#dbeafe', padding: '0.25rem 0.65rem', borderRadius: '6px' }}>
                देखाएको लगत: {filteredBeneficiaries.length} जना
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1', color: '#334155' }}>
                  <tr>
                    <th style={{ padding: '0.75rem 1rem' }}>परिचय नं. (SSIS ID)</th>
                    <th style={{ padding: '0.75rem 1rem' }}>लाभग्राहीको नाम</th>
                    <th style={{ padding: '0.75rem 1rem' }}>भत्ताको प्रकार (Category)</th>
                    <th style={{ padding: '0.75rem 1rem' }}>वडा / टोल</th>
                    <th style={{ padding: '0.75rem 1rem' }}>नागरिकता / NID नं.</th>
                    <th style={{ padding: '0.75rem 1rem' }}>बैंक तथा खाता नम्बर</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>मासिक रकम</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>अवस्था</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>कार्य</th>
                  </tr>
                </thead>
                <tbody>
                  {isBenLoading ? (
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                        लाभग्राही लगत लोड हुँदैछ...
                      </td>
                    </tr>
                  ) : filteredBeneficiaries.length === 0 ? (
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                        कुनै लाभग्राही लगत फेला परेन।
                      </td>
                    </tr>
                  ) : (
                    filteredBeneficiaries.map((b) => (
                      <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}>
                        {/* ID */}
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#1e40af' }}>
                          {b.beneficiary_id}
                        </td>

                        {/* Name */}
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{b.full_name}</div>
                          {b.full_name_en && (
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{b.full_name_en}</div>
                          )}
                          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.1rem' }}>
                            {b.gender || '-'} {b.date_of_birth_bs ? `| जन्म: ${b.date_of_birth_bs}` : ''}
                          </div>
                        </td>

                        {/* Category */}
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <span style={{
                            background: b.category?.includes('जेष्ठ') ? '#fef3c7' :
                              b.category?.includes('एकल') ? '#fce7f3' :
                              b.category?.includes('अपाङ्गता') ? '#ede9fe' :
                              b.category?.includes('पोषण') ? '#ecfdf5' : '#f1f5f9',
                            color: b.category?.includes('जेष्ठ') ? '#92400e' :
                              b.category?.includes('एकल') ? '#9d174d' :
                              b.category?.includes('अपाङ्गता') ? '#6b21a8' :
                              b.category?.includes('पोषण') ? '#065f46' : '#334155',
                            padding: '0.25rem 0.6rem',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            display: 'inline-block'
                          }}>
                            {b.category}
                          </span>
                        </td>

                        {/* Ward / Tole */}
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <div style={{ fontWeight: 600, color: '#334155' }}>वडा नं. {b.ward_number}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{b.tole_village || 'पाँचपोखरी'}</div>
                        </td>

                        {/* Citizenship */}
                        <td style={{ padding: '0.75rem 1rem', color: '#475569', fontSize: '0.8rem' }}>
                          {b.citizenship_or_nid_no || '-'}
                        </td>

                        {/* Bank Details */}
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <div style={{ fontWeight: 600, color: '#0f766e', fontSize: '0.8rem' }}>
                            {b.bank_name || '-'}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#475569', fontFamily: 'monospace' }}>
                            {b.bank_account_no || 'खाता उपलब्ध छैन'}
                          </div>
                        </td>

                        {/* Monthly Allowance */}
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 800, color: '#0f766e', fontSize: '0.9rem' }}>
                          रु. {(b.monthly_allowance_npr || 0).toLocaleString('ne-NP')}
                        </td>

                        {/* Status */}
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                          <span style={{
                            background: b.status === 'सक्रिय' ? '#dcfce7' :
                              b.status === 'नवीकृत' ? '#dbeafe' : '#fef2f2',
                            color: b.status === 'सक्रिय' ? '#15803d' :
                              b.status === 'नवीकृत' ? '#1e40af' : '#b91c1c',
                            padding: '0.2rem 0.55rem',
                            borderRadius: '12px',
                            fontSize: '0.72rem',
                            fontWeight: 700
                          }}>
                            {b.status || 'सक्रिय'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                            <button
                              onClick={() => {
                                renewBeneficiaryMutation.mutate(b.id);
                              }}
                              title="चालु आ.व. नवीकरण गर्नुहोस्"
                              style={{
                                padding: '0.35rem 0.55rem',
                                background: '#f0fdf4',
                                border: '1px solid #bbf7d0',
                                borderRadius: '6px',
                                color: '#16a34a',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                                fontSize: '0.72rem',
                                fontWeight: 700
                              }}
                            >
                              <RefreshCw size={12} /> नवीकरण
                            </button>
                            <button
                              onClick={() => setViewBeneficiary(b)}
                              title="कार्ड हेर्नुहोस्"
                              style={{
                                padding: '0.35rem 0.5rem',
                                background: '#f0fdfa',
                                border: '1px solid #99f6e4',
                                borderRadius: '6px',
                                color: '#0f766e',
                                cursor: 'pointer'
                              }}
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`${b.full_name} को लाभग्राही लगत मेटाउन निश्चित हुनुहुन्छ?`)) {
                                  deleteBeneficiaryMutation.mutate(b.id);
                                }
                              }}
                              title="हटाउनुहोस्"
                              style={{
                                padding: '0.35rem 0.5rem',
                                background: '#fef2f2',
                                border: '1px solid #fecaca',
                                borderRadius: '6px',
                                color: '#dc2626',
                                cursor: 'pointer'
                              }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
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
      {/* TAB 1: SSIS WARD-WISE OFFICIAL REPORT (तथ्याङ्क प्रतिवेदन) */}
      {/* ============================================================== */}
      {activeTab === 'ssis_report' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Controls Bar */}
          <div style={{
            background: '#fff',
            padding: '1rem 1.25rem',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>वडा छान्नुहोस्:</span>
              <select
                value={selectedWard}
                onChange={(e) => setSelectedWard(e.target.value)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  outline: 'none',
                  background: '#f8fafc',
                  cursor: 'pointer'
                }}
              >
                <option value="all">सबै वडाहरू (वडा १ देखि ८ सम्म)</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
                  <option key={w} value={w}>वडा नं. {w}</option>
                ))}
              </select>
            </div>

            <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>स्रोत फाइल: <strong>{ssisReport?.source_file || 'GenderEventAndEventRegristrationReportParam (2).xls'}</strong></span>
              <button
                onClick={() => refetchReport()}
                title="रिफ्रेस गर्नुहोस्"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0f766e', padding: '0.2rem' }}
              >
                <RefreshCw size={14} />
              </button>
            </div>
          </div>

          {/* Detailed Ward-wise Table */}
          <div style={{
            background: '#fff',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)'
          }}>
            <div style={{
              padding: '1rem 1.25rem',
              borderBottom: '1px solid #e2e8f0',
              background: '#f8fafc',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>
                  वडागत व्यक्तिगत घटना दर्ता तालिका (DoNIDCR / SSIS Standard)
                </h3>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                  पाँचपोखरी थाङपाल गाउँपालिकाका ८ वटै वडाको लैङ्गिक तथा घटना विवरण
                </p>
              </div>
              <span style={{ fontSize: '0.78rem', color: '#0f766e', fontWeight: 600, background: '#ccfbf1', padding: '0.25rem 0.6rem', borderRadius: '6px' }}>
                कुल दर्ता: {summaryData?.total_events || 1610}
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'center' }}>
                <thead>
                  <tr style={{ background: '#0f766e', color: '#fff', borderBottom: '1px solid #0d9488' }}>
                    <th rowSpan={2} style={{ padding: '0.75rem 0.6rem', borderRight: '1px solid rgba(255,255,255,0.2)', width: '90px' }}>वडा नं.</th>
                    <th colSpan={4} style={{ padding: '0.6rem', borderRight: '1px solid rgba(255,255,255,0.2)', background: '#0284c7' }}>जन्म (Birth)</th>
                    <th colSpan={4} style={{ padding: '0.6rem', borderRight: '1px solid rgba(255,255,255,0.2)', background: '#b91c1c' }}>मृत्यु (Death)</th>
                    <th rowSpan={2} style={{ padding: '0.75rem 0.6rem', borderRight: '1px solid rgba(255,255,255,0.2)', background: '#7c3aed' }}>सम्बन्ध विच्छेद</th>
                    <th rowSpan={2} style={{ padding: '0.75rem 0.6rem', borderRight: '1px solid rgba(255,255,255,0.2)', background: '#db2777' }}>विवाह दर्ता</th>
                    <th colSpan={2} style={{ padding: '0.6rem', borderRight: '1px solid rgba(255,255,255,0.2)', background: '#059669' }}>बसाइँ आएको</th>
                    <th colSpan={2} style={{ padding: '0.6rem', borderRight: '1px solid rgba(255,255,255,0.2)', background: '#d97706' }}>बसाइँ जाने</th>
                    <th rowSpan={2} style={{ padding: '0.75rem 0.6rem', borderRight: '1px solid rgba(255,255,255,0.2)' }}>बेवारिसे</th>
                    <th rowSpan={2} style={{ padding: '0.75rem 0.8rem', background: '#1e293b' }}>कुल जम्मा</th>
                    <th rowSpan={2} style={{ padding: '0.75rem 0.6rem', background: '#334155' }}>हिस्सा (%)</th>
                  </tr>
                  <tr style={{ background: '#0d9488', color: '#fff', fontSize: '0.78rem' }}>
                    {/* Birth sub */}
                    <th style={{ padding: '0.4rem 0.5rem', background: '#0369a1' }}>पुरुष</th>
                    <th style={{ padding: '0.4rem 0.5rem', background: '#0369a1' }}>महिला</th>
                    <th style={{ padding: '0.4rem 0.5rem', background: '#0369a1' }}>अन्य</th>
                    <th style={{ padding: '0.4rem 0.6rem', background: '#075985', fontWeight: 700 }}>जम्मा</th>
                    {/* Death sub */}
                    <th style={{ padding: '0.4rem 0.5rem', background: '#991b1b' }}>पुरुष</th>
                    <th style={{ padding: '0.4rem 0.5rem', background: '#991b1b' }}>महिला</th>
                    <th style={{ padding: '0.4rem 0.5rem', background: '#991b1b' }}>अन्य</th>
                    <th style={{ padding: '0.4rem 0.6rem', background: '#7f1d1d', fontWeight: 700 }}>जम्मा</th>
                    {/* In-migration sub */}
                    <th style={{ padding: '0.4rem 0.5rem', background: '#047857' }}>दर्ता</th>
                    <th style={{ padding: '0.4rem 0.5rem', background: '#065f46' }}>सदस्य</th>
                    {/* Out-migration sub */}
                    <th style={{ padding: '0.4rem 0.5rem', background: '#b45309' }}>दर्ता</th>
                    <th style={{ padding: '0.4rem 0.5rem', background: '#92400e' }}>सदस्य</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedWards.map((w, idx) => {
                    const pct = summaryData?.total_events ? ((w.total_events / summaryData.total_events) * 100).toFixed(1) : '0';
                    const isEven = idx % 2 === 0;
                    return (
                      <tr
                        key={w.ward}
                        style={{
                          background: isEven ? '#fff' : '#f8fafc',
                          borderBottom: '1px solid #e2e8f0',
                          transition: 'background 0.15s'
                        }}
                      >
                        <td style={{ padding: '0.7rem 0.6rem', fontWeight: 700, color: '#0f766e', borderRight: '1px solid #e2e8f0' }}>
                          वडा नं. {w.ward}
                        </td>
                        {/* Birth */}
                        <td style={{ padding: '0.7rem 0.5rem', color: '#0284c7' }}>{w.birth.male || '-'}</td>
                        <td style={{ padding: '0.7rem 0.5rem', color: '#0284c7' }}>{w.birth.female || '-'}</td>
                        <td style={{ padding: '0.7rem 0.5rem', color: '#64748b' }}>{w.birth.third_gender || '-'}</td>
                        <td style={{ padding: '0.7rem 0.6rem', fontWeight: 700, color: '#0369a1', background: '#f0f9ff' }}>{w.birth.total}</td>
                        {/* Death */}
                        <td style={{ padding: '0.7rem 0.5rem', color: '#dc2626' }}>{w.death.male || '-'}</td>
                        <td style={{ padding: '0.7rem 0.5rem', color: '#dc2626' }}>{w.death.female || '-'}</td>
                        <td style={{ padding: '0.7rem 0.5rem', color: '#64748b' }}>{w.death.third_gender || '-'}</td>
                        <td style={{ padding: '0.7rem 0.6rem', fontWeight: 700, color: '#b91c1c', background: '#fef2f2' }}>{w.death.total}</td>
                        {/* Divorce */}
                        <td style={{ padding: '0.7rem 0.6rem', color: '#7c3aed', fontWeight: 600 }}>{w.divorce || '-'}</td>
                        {/* Marriage */}
                        <td style={{ padding: '0.7rem 0.6rem', color: '#db2777', fontWeight: 600 }}>{w.marriage || '-'}</td>
                        {/* In migration */}
                        <td style={{ padding: '0.7rem 0.5rem', color: '#059669' }}>{w.migration_in.cases || '-'}</td>
                        <td style={{ padding: '0.7rem 0.5rem', color: '#047857', fontWeight: 600 }}>{w.migration_in.members || '-'}</td>
                        {/* Out migration */}
                        <td style={{ padding: '0.7rem 0.5rem', color: '#d97706' }}>{w.migration_out.cases || '-'}</td>
                        <td style={{ padding: '0.7rem 0.5rem', color: '#b45309', fontWeight: 600 }}>{w.migration_out.members || '-'}</td>
                        {/* Unclaimed */}
                        <td style={{ padding: '0.7rem 0.6rem', color: '#64748b' }}>{w.unclaimed || '-'}</td>
                        {/* Total */}
                        <td style={{ padding: '0.7rem 0.8rem', fontWeight: 800, color: '#0f172a', background: '#f1f5f9' }}>
                          {w.total_events}
                        </td>
                        {/* Pct */}
                        <td style={{ padding: '0.7rem 0.6rem', fontSize: '0.78rem', color: '#475569' }}>
                          {pct}%
                        </td>
                      </tr>
                    );
                  })}

                  {/* Summary Totals Row */}
                  {selectedWard === 'all' && summaryData?.total_events && (
                    <tr style={{ background: '#e0f2fe', fontWeight: 800, borderTop: '2px solid #0284c7' }}>
                      <td style={{ padding: '0.85rem 0.6rem', color: '#0369a1', fontSize: '0.9rem' }}>
                        कुल जम्मा
                      </td>
                      <td style={{ padding: '0.85rem 0.5rem', color: '#0284c7' }}>{summaryData.birth?.male}</td>
                      <td style={{ padding: '0.85rem 0.5rem', color: '#0284c7' }}>{summaryData.birth?.female}</td>
                      <td style={{ padding: '0.85rem 0.5rem', color: '#64748b' }}>{summaryData.birth?.third_gender || 0}</td>
                      <td style={{ padding: '0.85rem 0.6rem', color: '#0284c7', background: '#bae6fd' }}>{summaryData.birth?.total}</td>

                      <td style={{ padding: '0.85rem 0.5rem', color: '#dc2626' }}>{summaryData.death?.male}</td>
                      <td style={{ padding: '0.85rem 0.5rem', color: '#dc2626' }}>{summaryData.death?.female}</td>
                      <td style={{ padding: '0.85rem 0.5rem', color: '#64748b' }}>{summaryData.death?.third_gender || 0}</td>
                      <td style={{ padding: '0.85rem 0.6rem', color: '#b91c1c', background: '#fecaca' }}>{summaryData.death?.total}</td>

                      <td style={{ padding: '0.85rem 0.6rem', color: '#7c3aed' }}>{summaryData.divorce}</td>
                      <td style={{ padding: '0.85rem 0.6rem', color: '#db2777' }}>{summaryData.marriage}</td>

                      <td style={{ padding: '0.85rem 0.5rem', color: '#059669' }}>{summaryData.migration_in?.cases}</td>
                      <td style={{ padding: '0.85rem 0.5rem', color: '#047857' }}>{summaryData.migration_in?.members}</td>

                      <td style={{ padding: '0.85rem 0.5rem', color: '#d97706' }}>{summaryData.migration_out?.cases}</td>
                      <td style={{ padding: '0.85rem 0.5rem', color: '#b45309' }}>{summaryData.migration_out?.members}</td>

                      <td style={{ padding: '0.85rem 0.6rem', color: '#64748b' }}>{summaryData.unclaimed || 0}</td>
                      <td style={{ padding: '0.85rem 0.8rem', color: '#0f172a', background: '#cbd5e1', fontSize: '1rem' }}>
                        {summaryData.total_events}
                      </td>
                      <td style={{ padding: '0.85rem 0.6rem', color: '#0f172a' }}>१००%</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Visual Analysis Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            <div style={{
              background: '#fff',
              padding: '1.25rem',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 5px rgba(0,0,0,0.03)'
            }}>
              <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <BarChart3 size={16} color="#0f766e" /> वडागत कुल घटना दर्ता तुलना
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {wardsData.map((w) => {
                  const maxEvents = 268;
                  const widthPct = Math.round((w.total_events / maxEvents) * 100);
                  return (
                    <div key={w.ward} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem' }}>
                      <span style={{ width: '60px', fontWeight: 600, color: '#475569' }}>वडा नं. {w.ward}</span>
                      <div style={{ flex: 1, background: '#f1f5f9', height: '18px', borderRadius: '4px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${widthPct}%`,
                            background: w.ward === 7 ? '#0f766e' : '#0284c7',
                            height: '100%',
                            borderRadius: '4px',
                            transition: 'width 0.4s'
                          }}
                        />
                      </div>
                      <span style={{ width: '45px', textAlign: 'right', fontWeight: 700, color: '#1e293b' }}>
                        {w.total_events}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{
              background: '#fff',
              padding: '1.25rem',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 5px rgba(0,0,0,0.03)'
            }}>
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Compass size={16} color="#d97706" /> बसाइँसराइ विश्लेषण (Migration Dynamics)
              </h4>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 1rem 0' }}>
                गाउँपालिका भित्रिने र बाहिरिने परिवार तथा सदस्यहरूको विवरण
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ background: '#ecfdf5', padding: '0.85rem', borderRadius: '10px', border: '1px solid #a7f3d0' }}>
                  <div style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <ArrowDownRight size={14} /> बसाइँ सरी आएका
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#065f46', marginTop: '0.2rem' }}>
                    {summaryData?.migration_in?.members || 7} <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>सदस्य</span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#059669', marginTop: '0.1rem' }}>
                    {summaryData?.migration_in?.cases || 4} वटा परिवार / दर्ता
                  </div>
                </div>

                <div style={{ background: '#fffbeb', padding: '0.85rem', borderRadius: '10px', border: '1px solid #fde68a' }}>
                  <div style={{ fontSize: '0.75rem', color: '#b45309', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <ArrowUpRight size={14} /> बसाइँ सरी जाने
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#92400e', marginTop: '0.2rem' }}>
                    {summaryData?.migration_out?.members || 103} <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>सदस्य</span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#d97706', marginTop: '0.1rem' }}>
                    {summaryData?.migration_out?.cases || 30} वटा परिवार / दर्ता
                  </div>
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#475569' }}>
                <strong>खुद बसाइँसराइ असर (Net Migration):</strong> बाहिर जाने सदस्य संख्या <strong>९६ ले बढी</strong> छ (१०३ बाहिर vs ७ भित्र)। वडा ४ (२७ जना) र वडा ६ (२३ जना) बाट सबैभन्दा धेरै बसाइँसराइ भएको देखिन्छ।
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: INDIVIDUAL REGISTRY & CERTIFICATES (घटना पञ्जीकरण लगत) */}
      {/* ============================================================== */}
      {activeTab === 'registry' && (
        <div>
          {/* Filter and Search Bar */}
          <div style={{
            background: '#fff',
            padding: '1rem 1.25rem',
            borderRadius: '12px',
            border: '1.5px solid #e2e8f0',
            marginBottom: '1.5rem',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', flex: 1, minWidth: '280px', position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type="text"
                placeholder="दर्ता नं, व्यक्तिको नाम वा सूचकको नाम खोज्नुहोस्..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 1rem 0.55rem 2.5rem',
                  borderRadius: '8px',
                  border: '1.5px solid #cbd5e1',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  outline: 'none',
                  color: '#0f172a',
                  fontSize: '0.875rem'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                style={{
                  padding: '0.55rem 1rem',
                  borderRadius: '8px',
                  border: '1.5px solid #cbd5e1',
                  outline: 'none',
                  fontSize: '0.875rem',
                  background: '#fff'
                }}
              >
                <option value="all">सबै घटना प्रकार (All Event Types)</option>
                {EVENT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>

              <select
                value={selectedWard}
                onChange={(e) => setSelectedWard(e.target.value)}
                style={{
                  padding: '0.55rem 1rem',
                  borderRadius: '8px',
                  border: '1.5px solid #cbd5e1',
                  outline: 'none',
                  fontSize: '0.875rem',
                  background: '#fff'
                }}
              >
                <option value="all">सबै वडा (All Wards)</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
                  <option key={w} value={w}>वडा नं. {w}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Main Registry Table */}
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            border: '1.5px solid #e2e8f0',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <div className="dt-responsive-table-wrapper">
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                  <tr>
                    <th style={{ padding: '0.75rem 1rem' }}>दर्ता नम्बर</th>
                    <th style={{ padding: '0.75rem 1rem' }}>घटनाको प्रकार</th>
                    <th style={{ padding: '0.75rem 1rem' }}>सम्बन्धित व्यक्तिको नाम</th>
                    <th style={{ padding: '0.75rem 1rem' }}>घटना मिति (वि.सं.)</th>
                    <th style={{ padding: '0.75rem 1rem' }}>वडा नं</th>
                    <th style={{ padding: '0.75rem 1rem' }}>सूचना दिने व्यक्ति (सूचक)</th>
                    <th style={{ padding: '0.75rem 1rem' }}>अवस्था</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>कार्य</th>
                  </tr>
                </thead>
                <tbody>
                  {isEventsLoading ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: '#475569' }}>
                        पञ्जीकरण लगत लोड हुँदैछ...
                      </td>
                    </tr>
                  ) : filteredRegistry.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                        कुनै घटना दर्ता फेला परेन।
                      </td>
                    </tr>
                  ) : (
                    filteredRegistry.map((e) => (
                      <tr key={e.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#0284c7' }}>
                          {e.registrationNumber}
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <span style={{
                            background: '#f0f9ff',
                            color: '#0369a1',
                            padding: '0.2rem 0.6rem',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 600
                          }}>
                            {e.eventType}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <div style={{ fontWeight: 600, color: '#1e293b' }}>{e.personName}</div>
                          {e.personNameEn && <div style={{ fontSize: '0.75rem', color: '#475569' }}>{e.personNameEn}</div>}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', color: '#475569' }}>
                          {e.eventDateBs}
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          वडा नं. {e.wardNumber}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 500 }}>
                          {e.informantName}
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <span style={{
                            background: '#dcfce7',
                            color: '#15803d',
                            padding: '0.25rem 0.6rem',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: 600
                          }}>
                            {e.status || 'प्रमाणपत्र जारी'}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                          <button
                            onClick={() => setCertModalData(e)}
                            title="आधिकारिक प्रमाणपत्र प्रिन्ट गर्नुहोस्"
                            style={{
                              padding: '0.35rem 0.75rem',
                              background: '#f0f9ff',
                              border: '1px solid #bae6fd',
                              color: '#0284c7',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              fontWeight: 500
                            }}
                          >
                            <QrCode size={14} /> प्रमाणपत्र
                          </button>
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
      {/* MODAL 1: ADD BENEFICIARY (सामाजिक सुरक्षा लाभग्राही दर्ता) */}
      {/* ============================================================== */}
      {showAddBeneficiaryModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
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
            maxWidth: '680px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '1.75rem',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CreditCard size={22} color="#1e40af" />
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#1e293b' }}>
                  सामाजिक सुरक्षा भत्ता नयाँ लाभग्राही दर्ता
                </h2>
              </div>
              <button
                onClick={() => setShowAddBeneficiaryModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createBeneficiaryMutation.mutate(benForm);
              }}
            >
              {/* Category & Ward */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    भत्ताको प्रकार (Category)*
                  </label>
                  <select
                    value={benForm.category}
                    onChange={(e) => {
                      const cat = e.target.value;
                      const rate = CATEGORY_RATES[cat] || 4000;
                      setBenForm({ ...benForm, category: cat, monthly_allowance_npr: rate });
                    }}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', outline: 'none' }}
                  >
                    {BENEFICIARY_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    वडा नं.*
                  </label>
                  <select
                    value={benForm.ward_number}
                    onChange={(e) => setBenForm({ ...benForm, ward_number: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', outline: 'none' }}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
                      <option key={w} value={w}>वडा नं. {w}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Names */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    लाभग्राहीको पूरा नाम (नेपाली)*
                  </label>
                  <input
                    type="text"
                    required
                    value={benForm.full_name}
                    onChange={(e) => setBenForm({ ...benForm, full_name: e.target.value })}
                    placeholder="जस्तै: बुद्धिमान तामाङ"
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Name in English
                  </label>
                  <input
                    type="text"
                    value={benForm.full_name_en}
                    onChange={(e) => setBenForm({ ...benForm, full_name_en: e.target.value })}
                    placeholder="BUDDHIMAN TAMANG"
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', outline: 'none' }}
                  />
                </div>
              </div>

              {/* Gender, DOB & Citizenship */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    लिङ्ग*
                  </label>
                  <select
                    value={benForm.gender}
                    onChange={(e) => setBenForm({ ...benForm, gender: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', outline: 'none' }}
                  >
                    <option value="पुरुष">पुरुष (Male)</option>
                    <option value="महिला">महिला (Female)</option>
                    <option value="अन्य">अन्य (Other)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    जन्म मिति (वि.सं.)
                  </label>
                  <input
                    type="text"
                    value={benForm.date_of_birth_bs}
                    onChange={(e) => setBenForm({ ...benForm, date_of_birth_bs: e.target.value })}
                    placeholder="२०१०-०१-०१"
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    नागरिकता / NID नं.*
                  </label>
                  <input
                    type="text"
                    required
                    value={benForm.citizenship_or_nid_no}
                    onChange={(e) => setBenForm({ ...benForm, citizenship_or_nid_no: e.target.value })}
                    placeholder="२७-०१-७५-००१२४"
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', outline: 'none' }}
                  />
                </div>
              </div>

              {/* Tole & Phone */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    टोल / गाउँ
                  </label>
                  <input
                    type="text"
                    value={benForm.tole_village}
                    onChange={(e) => setBenForm({ ...benForm, tole_village: e.target.value })}
                    placeholder="जस्तै: भोताङ, बाँसखर्क"
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    सम्पर्क फोन
                  </label>
                  <input
                    type="text"
                    value={benForm.contact_phone}
                    onChange={(e) => setBenForm({ ...benForm, contact_phone: e.target.value })}
                    placeholder="९८४१००००००"
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', outline: 'none' }}
                  />
                </div>
              </div>

              {/* Bank Details & Monthly Rate */}
              <div style={{
                background: '#f8fafc',
                padding: '1rem',
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
                marginBottom: '1.25rem'
              }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f766e', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Landmark size={16} /> बैंक तथा भुक्तानी विवरण
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.85rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                      बैंकको नाम
                    </label>
                    <input
                      type="text"
                      value={benForm.bank_name}
                      onChange={(e) => setBenForm({ ...benForm, bank_name: e.target.value })}
                      placeholder="नेपाल बैंक लि."
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1.5px solid #cbd5e1', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                      बैंक खाता नम्बर
                    </label>
                    <input
                      type="text"
                      value={benForm.bank_account_no}
                      onChange={(e) => setBenForm({ ...benForm, bank_account_no: e.target.value })}
                      placeholder="०४५०१२३४५६७००१"
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1.5px solid #cbd5e1', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                      मासिक भत्ता रकम (रु.)
                    </label>
                    <input
                      type="number"
                      value={benForm.monthly_allowance_npr}
                      onChange={(e) => setBenForm({ ...benForm, monthly_allowance_npr: Number(e.target.value) })}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1.5px solid #cbd5e1', outline: 'none', fontWeight: 700, color: '#0f766e' }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowAddBeneficiaryModal(false)}
                  style={{ padding: '0.6rem 1.25rem', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer' }}
                >
                  रद्द
                </button>
                <button
                  type="submit"
                  disabled={createBeneficiaryMutation.isPending}
                  style={{ padding: '0.6rem 1.5rem', background: '#1e40af', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: 700 }}
                >
                  {createBeneficiaryMutation.isPending ? 'दर्ता हुँदैछ...' : 'लाभग्राही दर्ता गर्नुहोस्'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: BENEFICIARY DETAIL CARD (लाभग्राही परिचय कार्ड) */}
      {/* ============================================================== */}
      {viewBeneficiary && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
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
            maxWidth: '540px',
            padding: '1.5rem',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <ShieldCheck size={20} color="#1e40af" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#1e40af' }}>
                  सामाजिक सुरक्षा भत्ता लाभग्राही परिचय पत्र
                </h3>
              </div>
              <button
                onClick={() => setViewBeneficiary(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{
              border: '2px solid #1e40af',
              borderRadius: '12px',
              padding: '1.25rem',
              background: '#f8fafc',
              position: 'relative'
            }}>
              <div style={{ textAlign: 'center', borderBottom: '1px solid #bfdbfe', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
                <div style={{ fontSize: '0.8rem', color: '#dc2626', fontWeight: 700 }}>नेपाल सरकार</div>
                <div style={{ fontSize: '0.85rem', color: '#1e293b', fontWeight: 700 }}>गृह मन्त्रालय, राष्ट्रिय परिचयपत्र तथा पञ्जीकरण विभाग</div>
                <div style={{ fontSize: '1rem', color: '#1e40af', fontWeight: 800, marginTop: '0.15rem' }}>
                  पाँचपोखरी थाङपाल गाउँ कार्यपालिकाको कार्यालय
                </div>
                <div style={{ fontSize: '0.8rem', color: '#475569' }}>वडा नं. {viewBeneficiary.ward_number} कार्यालय, सिन्धुपाल्चोक</div>
                <div style={{
                  display: 'inline-block',
                  background: '#1e40af',
                  color: '#fff',
                  padding: '0.2rem 0.75rem',
                  borderRadius: '12px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  marginTop: '0.4rem'
                }}>
                  {viewBeneficiary.category}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px', gap: '1rem' }}>
                <div style={{ fontSize: '0.85rem', lineHeight: '1.65' }}>
                  <div><strong>लाभग्राही नं:</strong> <span style={{ color: '#1e40af', fontWeight: 800 }}>{viewBeneficiary.beneficiary_id}</span></div>
                  <div><strong>नाम:</strong> <span style={{ fontWeight: 700 }}>{viewBeneficiary.full_name}</span> {viewBeneficiary.full_name_en && `(${viewBeneficiary.full_name_en})`}</div>
                  <div><strong>नागरिकता / NID:</strong> {viewBeneficiary.citizenship_or_nid_no || '-'}</div>
                  <div><strong>ठेगाना:</strong> वडा नं. {viewBeneficiary.ward_number}, {viewBeneficiary.tole_village || 'पाँचपोखरी थाङपाल'}</div>
                  <div><strong>बैंकको नाम:</strong> {viewBeneficiary.bank_name || '-'}</div>
                  <div><strong>खाता नम्बर:</strong> <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{viewBeneficiary.bank_account_no || '-'}</span></div>
                  <div><strong>मासिक भत्ता:</strong> <span style={{ color: '#0f766e', fontWeight: 800 }}>रु. {(viewBeneficiary.monthly_allowance_npr || 0).toLocaleString('ne-NP')}</span> (त्रैमासिक रु. {((viewBeneficiary.monthly_allowance_npr || 0) * 3).toLocaleString('ne-NP')})</div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '0.5rem' }}>
                  <QrCode size={70} color="#1e40af" />
                  <span style={{ fontSize: '0.62rem', color: '#64748b', marginTop: '0.25rem', textAlign: 'center' }}>SSIS QR प्रमाणीकरण</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px dashed #bfdbfe' }}>
                <div style={{ fontSize: '0.75rem', color: '#475569' }}>
                  अवस्था: <strong style={{ color: '#15803d' }}>{viewBeneficiary.status}</strong> | आ.व. {viewBeneficiary.fiscal_year || '२०८१/०८२'}
                </div>
                <div style={{ textAlign: 'center', fontSize: '0.75rem' }}>
                  <div style={{ borderBottom: '1px solid #64748b', width: '110px', marginBottom: '0.2rem' }}></div>
                  पञ्जीकाधिकारी (वडा सचिव)
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
              <button
                onClick={() => setViewBeneficiary(null)}
                style={{ padding: '0.5rem 1rem', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer' }}
              >
                बन्द गर्नुहोस्
              </button>
              <button
                onClick={() => window.print()}
                style={{ padding: '0.5rem 1.25rem', background: '#1e40af', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: 600 }}
              >
                प्रिन्ट गर्नुहोस्
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: UPLOAD SSIS FILE (घटना दर्ता एक्सेल आयात) */}
      {/* ============================================================== */}
      {showUploadModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
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
            maxWidth: '540px',
            padding: '1.75rem',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UploadCloud size={22} color="#0f766e" />
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: '#1e293b' }}>
                  SSIS घटना दर्ता प्रतिवेदन आयात (Import)
                </h2>
              </div>
              <button
                onClick={() => { setShowUploadModal(false); setUploadMsg(null); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit}>
              <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5, marginTop: 0 }}>
                DoNIDCR / SSIS प्रणालीबाट डाउनलोड गरिएको <strong>GenderEventAndEventRegristrationReportParam (.xls)</strong> वा सम्बन्धित फाइल छान्नुहोस्। प्रणालीले स्वतः वडागत तथ्याङ्क अद्यावधिक गर्नेछ।
              </p>

              <div style={{
                border: '2px dashed #0f766e',
                borderRadius: '12px',
                padding: '2rem 1.5rem',
                textAlign: 'center',
                background: '#f0fdfa',
                marginBottom: '1.25rem',
                cursor: 'pointer'
              }}>
                <FileSpreadsheet size={40} color="#0f766e" style={{ margin: '0 auto 0.75rem' }} />
                <label style={{ display: 'block', cursor: 'pointer' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f766e' }}>
                    {uploadFile ? uploadFile.name : 'कम्प्युटरबाट .xls / .xlsx फाइल छान्नुहोस्'}
                  </span>
                  <input
                    type="file"
                    accept=".xls,.xlsx,.htm,.html"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setUploadFile(e.target.files[0]);
                        setUploadMsg(null);
                      }
                    }}
                    style={{ display: 'none' }}
                  />
                </label>
                <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginTop: '0.35rem' }}>
                  समर्थित ढाँचा: .xls, .xlsx, .htm (SSIS Reports)
                </span>
              </div>

              {uploadMsg && (
                <div style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: uploadMsg.type === 'success' ? '#ecfdf5' : '#fef2f2',
                  color: uploadMsg.type === 'success' ? '#047857' : '#b91c1c',
                  border: `1px solid ${uploadMsg.type === 'success' ? '#a7f3d0' : '#fecaca'}`
                }}>
                  {uploadMsg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                  <span>{uploadMsg.text}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  style={{
                    padding: '0.6rem 1.25rem',
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.85rem'
                  }}
                >
                  रद्द
                </button>
                <button
                  type="submit"
                  disabled={uploadLoading || !uploadFile}
                  style={{
                    padding: '0.6rem 1.5rem',
                    background: uploadLoading ? '#94a3b8' : '#0f766e',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    cursor: uploadLoading ? 'not-allowed' : 'pointer',
                    fontWeight: 700,
                    fontSize: '0.85rem'
                  }}
                >
                  {uploadLoading ? 'अपलोड हुँदैछ...' : 'आयात गर्नुहोस्'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 4: ADD EVENT (व्यक्तिगत घटना दर्ता) */}
      {/* ============================================================== */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '620px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '1.5rem',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#1e293b' }}>
                नयाँ व्यक्तिगत घटना दर्ता (DoNIDCR फाराम)
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569' }}
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createMutation.mutate(formData);
              }}
            >
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  घटनाको प्रकार*
                </label>
                <select
                  value={formData.eventType}
                  onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1.5px solid #cbd5e1', outline: 'none' }}
                >
                  {EVENT_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    व्यक्तिको नाम (नेपाली)*
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.personName}
                    onChange={(e) => setFormData({ ...formData, personName: e.target.value })}
                    placeholder="जस्तै: दावा तामाङ"
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1.5px solid #cbd5e1', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Name in English
                  </label>
                  <input
                    type="text"
                    value={formData.personNameEn}
                    onChange={(e) => setFormData({ ...formData, personNameEn: e.target.value })}
                    placeholder="DAWA TAMANG"
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1.5px solid #cbd5e1', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <NepaliDatePicker
                  label="घटना मिति (वि.सं.)"
                  required
                  value={formData.eventDateBs}
                  onChange={(bsDate, adDate) => setFormData({ ...formData, eventDateBs: bsDate, eventDateAd: adDate || '' })}
                  placeholder="उदा: २०८१-०९-१४"
                />
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    वडा नं.*
                  </label>
                  <select
                    value={formData.wardNumber}
                    onChange={(e) => setFormData({ ...formData, wardNumber: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1.5px solid #cbd5e1', outline: 'none' }}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
                      <option key={w} value={w}>वडा नं. {w}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    बाबु / पतिको नाम
                  </label>
                  <input
                    type="text"
                    value={formData.fatherOrHusbandName}
                    onChange={(e) => setFormData({ ...formData, fatherOrHusbandName: e.target.value })}
                    placeholder="जस्तै: प्रेम बहादुर तामाङ"
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1.5px solid #cbd5e1', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    आमाको नाम
                  </label>
                  <input
                    type="text"
                    value={formData.motherName}
                    onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                    placeholder="जस्तै: फुर्वा माया तामाङ"
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1.5px solid #cbd5e1', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    सूचना दिने व्यक्ति (सूचक)*
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.informantName}
                    onChange={(e) => setFormData({ ...formData, informantName: e.target.value })}
                    placeholder="जस्तै: प्रेम बहादुर तामाङ (बाबु)"
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1.5px solid #cbd5e1', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    सूचकको नागरिकता नं
                  </label>
                  <input
                    type="text"
                    value={formData.informantCitizenshipNo}
                    onChange={(e) => setFormData({ ...formData, informantCitizenshipNo: e.target.value })}
                    placeholder="२३-०१-७२-०३४२१"
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1.5px solid #cbd5e1', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ padding: '0.6rem 1.25rem', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}
                >
                  रद्द गर्नुहोस्
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  style={{ padding: '0.6rem 1.5rem', background: '#0f766e', border: 'none', borderRadius: '6px', color: '#fff', cursor: 'pointer', fontWeight: 600 }}
                >
                  {createMutation.isPending ? 'दर्ता हुँदैछ...' : 'घटना दर्ता गर्नुहोस्'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 5: VITAL EVENT CERTIFICATE (प्रमाणपत्र) */}
      {/* ============================================================== */}
      {certModalData && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '560px',
            padding: '1.5rem',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0369a1' }}>
                व्यक्तिगत घटना दर्ता प्रमाणपत्र (DoNIDCR ढाँचा)
              </h3>
              <button
                onClick={() => setCertModalData(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{
              border: '2px solid #0284c7',
              borderRadius: '10px',
              padding: '1.25rem',
              background: '#f8fafc',
              position: 'relative'
            }}>
              <div style={{ textAlign: 'center', borderBottom: '1px solid #bae6fd', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
                <div style={{ fontSize: '0.8rem', color: '#dc2626', fontWeight: 700 }}>नेपाल सरकार</div>
                <div style={{ fontSize: '0.8rem', color: '#1e293b', fontWeight: 600 }}>गृह मन्त्रालय, राष्ट्रिय परिचयपत्र तथा पञ्जीकरण विभाग</div>
                <div style={{ fontSize: '1rem', color: '#0369a1', fontWeight: 700, marginTop: '0.2rem' }}>
                  पाँचपोखरी थाङपाल गाउँ कार्यपालिकाको कार्यालय
                </div>
                <div style={{ fontSize: '0.8rem', color: '#475569' }}>वडा नं. {certModalData.wardNumber} को कार्यालय</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#047857', marginTop: '0.25rem' }}>
                  {certModalData.eventType} प्रमाणपत्र
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px', gap: '1rem' }}>
                <div style={{ fontSize: '0.85rem', lineHeight: '1.6' }}>
                  <div><strong>दर्ता नम्बर:</strong> <span style={{ color: '#0284c7', fontWeight: 700 }}>{certModalData.registrationNumber}</span></div>
                  <div><strong>सम्बन्धित व्यक्ति:</strong> {certModalData.personName}</div>
                  {certModalData.personNameEn && <div><strong>Name in English:</strong> {certModalData.personNameEn}</div>}
                  <div><strong>घटना मिति:</strong> {certModalData.eventDateBs}</div>
                  <div><strong>वडा नं:</strong> {certModalData.wardNumber}</div>
                  {certModalData.fatherOrHusbandName && <div><strong>बाबु / पतिको नाम:</strong> {certModalData.fatherOrHusbandName}</div>}
                  {certModalData.motherName && <div><strong>आमाको नाम:</strong> {certModalData.motherName}</div>}
                  <div><strong>सूचकको नाम:</strong> {certModalData.informantName}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fff', border: '1px solid #bae6fd', borderRadius: '8px', padding: '0.5rem' }}>
                  <QrCode size={64} color="#0284c7" />
                  <span style={{ fontSize: '0.65rem', color: '#475569', marginTop: '0.25rem', textAlign: 'center' }}>DoNIDCR प्रमाणीकरण</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px dashed #bae6fd' }}>
                <div style={{ fontSize: '0.75rem', color: '#475569' }}>
                  अवस्था: <strong style={{ color: '#047857' }}>प्रमाणपत्र जारी (Issued)</strong>
                </div>
                <div style={{ textAlign: 'center', fontSize: '0.75rem' }}>
                  <div style={{ borderBottom: '1px solid #64748b', width: '120px', marginBottom: '0.2rem' }}></div>
                  स्थानीय पञ्जीकाधिकारी (वडा सचिव)
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
              <button
                onClick={() => setCertModalData(null)}
                style={{ padding: '0.5rem 1rem', background: '#f1f5f9', border: '1.5px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}
              >
                बन्द गर्नुहोस्
              </button>
              <button
                onClick={() => window.print()}
                style={{ padding: '0.5rem 1.25rem', background: '#0284c7', border: 'none', borderRadius: '6px', color: '#fff', cursor: 'pointer', fontWeight: 600 }}
              >
                प्रिन्ट गर्नुहोस्
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VitalRegistrationPage;
