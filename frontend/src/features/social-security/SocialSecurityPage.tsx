import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  HeartHandshake,
  Search,
  Plus,
  Printer,
  X,
  CheckCircle,
  AlertCircle,
  Users,
  Wallet,
  Calendar,
  Building,
  CreditCard,
  UserCheck,
  RefreshCw,
  QrCode,
  FileSpreadsheet,
  Download,
  Filter,
  Eye,
  FileText,
  ShieldCheck,
  Baby,
  Activity,
  UserX,
  BadgeAlert,
  Send,
  Sparkles,
  MapPin,
  Phone,
  Clock
} from 'lucide-react';
import { NepaliDatePicker } from '../../components/common/NepaliDatePicker';
import {
  socialSecurityApi,
  Beneficiary,
  QuarterlyPayroll,
  LifeVerificationRecord,
  VitalEventLinkage,
  CATEGORY_RATES
} from '../../api/social-security';

type TabKey = 'beneficiaries' | 'payroll' | 'life_verification' | 'vital_linkage' | 'analytics';

export const SocialSecurityPage: React.FC = () => {
  const queryClient = useQueryClient();

  // Active Tab
  const [activeTab, setActiveTab] = useState<TabKey>('beneficiaries');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedWard, setSelectedWard] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [cardModalData, setCardModalData] = useState<Beneficiary | null>(null);
  const [payrollModalData, setPayrollModalData] = useState<QuarterlyPayroll | null>(null);
  const [showLifeVerifModal, setShowLifeVerifModal] = useState(false);
  const [detailModalData, setDetailModalData] = useState<Beneficiary | null>(null);

  // New Beneficiary Form
  const [formData, setFormData] = useState({
    fullName: '',
    fullNameEn: '',
    citizenshipNo: '',
    nationalIdNo: '',
    gender: 'महिला',
    dateOfBirthBs: '',
    wardNumber: 1,
    tole: '',
    phone: '',
    category: 'जेष्ठ नागरिक (६८ वर्ष माथि)',
    bankName: 'राष्ट्रिय वाणिज्य बैंक लि.',
    bankAccountNumber: '',
    bankBranch: 'थाङपालधाप शाखा',
    guardianName: '',
    guardianPhone: '',
  });

  // Life Verification Form
  const [lifeVerifForm, setLifeVerifForm] = useState({
    beneficiaryId: '',
    verificationMethod: 'बायोमेट्रिक (Biometric)' as LifeVerificationRecord['verificationMethod'],
    verifiedByOfficer: 'सुरेन्द्र श्रेष्ठ (वडा सचिव)',
    remarks: 'भौतिक तथा बायोमेट्रिक रुजु गरी चालु आव नवीकरण स्वीकृत गरियो।',
    biometricMatched: true,
  });

  // Queries
  const { data: beneficiaries = [], isLoading: isLoadingBeneficiaries } = useQuery({
    queryKey: ['ssis-beneficiaries'],
    queryFn: () => socialSecurityApi.getBeneficiaries(),
  });

  const { data: payrolls = [], isLoading: isLoadingPayrolls } = useQuery({
    queryKey: ['ssis-payrolls'],
    queryFn: () => socialSecurityApi.getQuarterlyPayrolls(),
  });

  const { data: lifeVerifications = [] } = useQuery({
    queryKey: ['ssis-life-verifications'],
    queryFn: () => socialSecurityApi.getLifeVerifications(),
  });

  const { data: vitalEvents = [] } = useQuery({
    queryKey: ['ssis-vital-events'],
    queryFn: () => socialSecurityApi.getVitalEvents(),
  });

  const { data: summary } = useQuery({
    queryKey: ['ssis-summary'],
    queryFn: () => socialSecurityApi.getSummary(),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => socialSecurityApi.createBeneficiary(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ssis-beneficiaries'] });
      queryClient.invalidateQueries({ queryKey: ['ssis-summary'] });
      setShowAddModal(false);
      setFormData({
        fullName: '',
        fullNameEn: '',
        citizenshipNo: '',
        nationalIdNo: '',
        gender: 'महिला',
        dateOfBirthBs: '',
        wardNumber: 1,
        tole: '',
        phone: '',
        category: 'जेष्ठ नागरिक (६८ वर्ष माथि)',
        bankName: 'राष्ट्रिय वाणिज्य बैंक लि.',
        bankAccountNumber: '',
        bankBranch: 'थाङपालधाप शाखा',
        guardianName: '',
        guardianPhone: '',
      });
      alert('नयाँ सामाजिक सुरक्षा लाभग्राही सफलतापूर्वक दर्ता गरियो!');
    },
  });

  const renewMutation = useMutation({
    mutationFn: (id: string) => socialSecurityApi.renewBeneficiary(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ssis-beneficiaries'] });
      queryClient.invalidateQueries({ queryKey: ['ssis-summary'] });
      alert('लाभग्राहीको चालु आव नवीकरण सम्पन्न भयो!');
    },
  });

  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      socialSecurityApi.cancelBeneficiary(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ssis-beneficiaries'] });
      queryClient.invalidateQueries({ queryKey: ['ssis-summary'] });
      alert('लाभग्राहीको लगत कट्टा गरियो!');
    },
  });

  const updatePayrollMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: QuarterlyPayroll['status'] }) =>
      socialSecurityApi.updatePayrollStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ssis-payrolls'] });
      alert('पेरोल निकासा अवस्था अद्यावधिक गरियो!');
    },
  });

  const lifeVerifMutation = useMutation({
    mutationFn: (data: typeof lifeVerifForm) => {
      const b = beneficiaries.find(
        (x) => x.beneficiaryId === data.beneficiaryId || x.id === data.beneficiaryId
      );
      return socialSecurityApi.recordLifeVerification({
        beneficiaryId: b?.beneficiaryId || data.beneficiaryId,
        fullName: b?.fullName || '',
        wardNumber: b?.wardNumber || 1,
        category: b?.category || '',
        verificationMethod: data.verificationMethod,
        verifiedByOfficer: data.verifiedByOfficer,
        remarks: data.remarks,
        biometricMatched: data.biometricMatched,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ssis-life-verifications'] });
      queryClient.invalidateQueries({ queryKey: ['ssis-beneficiaries'] });
      queryClient.invalidateQueries({ queryKey: ['ssis-summary'] });
      setShowLifeVerifModal(false);
      alert('जीवन प्रमाणीकरण अभिलेख सफलतापूर्वक सुरक्षित भयो!');
    },
  });

  const vitalActionMutation = useMutation({
    mutationFn: (id: string) => socialSecurityApi.applyVitalEventAction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ssis-vital-events'] });
      alert('घटना दर्ता कारबाही सम्पन्न भयो!');
    },
  });

  // Filtered Beneficiaries List
  const filteredBeneficiaries = beneficiaries.filter((b) => {
    const matchSearch =
      b.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.beneficiaryId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.citizenshipNo.includes(searchTerm) ||
      (b.nationalIdNo && b.nationalIdNo.toLowerCase().includes(searchTerm.toLowerCase())) ||
      b.bankAccountNumber.includes(searchTerm);

    const matchCategory = selectedCategory === 'all' || b.category === selectedCategory;
    const matchWard = selectedWard === 'all' || b.wardNumber === Number(selectedWard);
    const matchStatus = selectedStatus === 'all' || b.status === selectedStatus;

    return matchSearch && matchCategory && matchWard && matchStatus;
  });

  // Calculate live numbers
  const totalBeneficiaries = summary?.totalBeneficiaries ?? beneficiaries.length;
  const activeCount = summary?.activeCount ?? beneficiaries.filter((b) => b.status === 'सक्रिय' || b.status === 'नवीकृत').length;
  const renewedCount = summary?.renewedCount ?? beneficiaries.filter((b) => b.status === 'नवीकृत').length;
  const cancelledCount = summary?.cancelledCount ?? beneficiaries.filter((b) => b.status === 'लगत कट्टा').length;
  const quarterlyBudget = summary?.totalQuarterlyBudgetNPR ?? beneficiaries.filter((b) => b.status !== 'लगत कट्टा').reduce((s, b) => s + (b.quarterlyAllowanceNPR || b.monthlyAllowanceNPR * 3), 0);
  const renewalPercent = totalBeneficiaries > 0 ? Math.round((renewedCount / totalBeneficiaries) * 100) : 0;

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1600px', margin: '0 auto', color: '#1e293b' }}>
      {/* Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #4338ca 100%)',
          color: '#fff',
          borderRadius: '16px',
          padding: '1.75rem 2rem',
          marginBottom: '1.5rem',
          boxShadow: '0 10px 25px -5px rgba(30, 58, 138, 0.25)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(8px)',
              padding: '1rem',
              borderRadius: '14px',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <HeartHandshake size={36} color="#67e8f9" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
              <span
                style={{
                  background: '#f59e0b',
                  color: '#78350f',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '0.2rem 0.6rem',
                  borderRadius: '20px',
                  textTransform: 'uppercase',
                }}
              >
                DoNIDCR मानक
              </span>
              <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                पाँचपोखरी थाङपाल गाउँपालिका, सिन्धुपाल्चोक
              </span>
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
              सामाजिक सुरक्षा भत्ता तथा व्यक्तिगत घटना दर्ता प्रणाली (SSIS)
            </h1>
            <p style={{ margin: '0.35rem 0 0', opacity: 0.9, fontSize: '0.9rem', maxWidth: '850px' }}>
              नेपाल सरकारको सामाजिक सुरक्षा ऐन, २०७५ बमोजिम ७ वर्गका लाभग्राही अभिलेख, ई-नवीकरण, बायोमेट्रिक जीवन प्रमाणीकरण तथा प्रत्यक्ष बैंक खाता (DBT) निकासा व्यवस्थापन
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <a
            href="/api/v1/social-security/export-excel"
            download
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.65rem 1.15rem',
              background: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              borderRadius: '10px',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.875rem',
              textDecoration: 'none',
              backdropFilter: 'blur(4px)',
              transition: 'all 0.2s',
            }}
          >
            <FileSpreadsheet size={16} /> एक्सेल विवरण डाउनलोड
          </a>

          <button
            onClick={() => {
              if (payrolls.length > 0) {
                setPayrollModalData(payrolls[0]);
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.65rem 1.15rem',
              background: '#0ea5e9',
              border: 'none',
              borderRadius: '10px',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.875rem',
              boxShadow: '0 4px 6px -1px rgba(14, 165, 233, 0.3)',
            }}
          >
            <Printer size={16} /> बैंक निकासा आदेश सिट
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.65rem 1.35rem',
              background: '#10b981',
              border: 'none',
              borderRadius: '10px',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.9rem',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)',
            }}
          >
            <Plus size={18} /> नयाँ लाभग्राही दर्ता
          </button>
        </div>
      </div>

      {/* KPI Stats Overview */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem',
          marginBottom: '1.5rem',
        }}
      >
        {/* Card 1: Total Beneficiaries */}
        <div
          style={{
            background: '#fff',
            padding: '1.25rem',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: '0.825rem', color: '#64748b', fontWeight: 600 }}>कुल दर्ता लाभग्राही संख्या</div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#1e293b', marginTop: '0.2rem' }}>
              {totalBeneficiaries.toLocaleString('ne-NP')} <span style={{ fontSize: '1rem', fontWeight: 600, color: '#64748b' }}>जना</span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem' }}>
              <span style={{ fontSize: '0.75rem', background: '#ecfdf5', color: '#059669', padding: '0.15rem 0.5rem', borderRadius: '12px', fontWeight: 600 }}>
                सक्रिय: {activeCount}
              </span>
              <span style={{ fontSize: '0.75rem', background: '#fef3c7', color: '#b45309', padding: '0.15rem 0.5rem', borderRadius: '12px', fontWeight: 600 }}>
                नवीकृत: {renewedCount}
              </span>
            </div>
          </div>
          <div style={{ background: '#eff6ff', color: '#2563eb', padding: '0.9rem', borderRadius: '12px' }}>
            <Users size={28} />
          </div>
        </div>

        {/* Card 2: Quarterly Budget */}
        <div
          style={{
            background: '#fff',
            padding: '1.25rem',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: '0.825rem', color: '#64748b', fontWeight: 600 }}>त्रैमासिक निकासा बजेट (Q3)</div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#047857', marginTop: '0.2rem' }}>
              रु. {Number(quarterlyBudget).toLocaleString('ne-NP')}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <CreditCard size={13} color="#059669" /> शतप्रतिशत DBT बैंक खातामा जम्मा
            </div>
          </div>
          <div style={{ background: '#ecfdf5', color: '#059669', padding: '0.9rem', borderRadius: '12px' }}>
            <Wallet size={28} />
          </div>
        </div>

        {/* Card 3: Renewal & Life Verification */}
        <div
          style={{
            background: '#fff',
            padding: '1.25rem',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: '0.825rem', color: '#64748b', fontWeight: 600 }}>चालु आव ई-नवीकरण दर</div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0284c7', marginTop: '0.2rem' }}>
              {renewalPercent}% <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#64748b' }}>({renewedCount}/{totalBeneficiaries})</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#0284c7', marginTop: '0.4rem' }}>
              साउन १ - भदौ मसान्त म्याद अवधि
            </div>
          </div>
          <div style={{ background: '#f0f9ff', color: '#0284c7', padding: '0.9rem', borderRadius: '12px' }}>
            <RefreshCw size={28} />
          </div>
        </div>

        {/* Card 4: Dropout / CRVS Alerts */}
        <div
          style={{
            background: '#fff',
            padding: '1.25rem',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: '0.825rem', color: '#64748b', fontWeight: 600 }}>लगत कट्टा तथा घटना अलर्ट</div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#b91c1c', marginTop: '0.2rem' }}>
              {cancelledCount} <span style={{ fontSize: '1rem', fontWeight: 600, color: '#64748b' }}>जना</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <BadgeAlert size={13} /> मृत्यु तथा बसाइँसराइ लगत समायोजन
            </div>
          </div>
          <div style={{ background: '#fef2f2', color: '#dc2626', padding: '0.9rem', borderRadius: '12px' }}>
            <AlertCircle size={28} />
          </div>
        </div>
      </div>

      {/* Tab Navigation Navigation */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '2px solid #e2e8f0',
          marginBottom: '1.5rem',
          overflowX: 'auto',
          paddingBottom: '0.25rem',
        }}
      >
        <button
          onClick={() => setActiveTab('beneficiaries')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            background: activeTab === 'beneficiaries' ? '#1e3a8a' : 'transparent',
            color: activeTab === 'beneficiaries' ? '#fff' : '#64748b',
            border: 'none',
            borderRadius: '10px 10px 0 0',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <Users size={18} />
          लाभग्राही अभिलेख तथा ई-परिचयपत्र
          <span
            style={{
              fontSize: '0.75rem',
              background: activeTab === 'beneficiaries' ? '#3b82f6' : '#e2e8f0',
              color: activeTab === 'beneficiaries' ? '#fff' : '#475569',
              padding: '0.15rem 0.5rem',
              borderRadius: '12px',
            }}
          >
            {beneficiaries.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('payroll')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            background: activeTab === 'payroll' ? '#1e3a8a' : 'transparent',
            color: activeTab === 'payroll' ? '#fff' : '#64748b',
            border: 'none',
            borderRadius: '10px 10px 0 0',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <Wallet size={18} />
          त्रैमासिक DBT पेरोल तथा बैंक सिट
          <span
            style={{
              fontSize: '0.75rem',
              background: activeTab === 'payroll' ? '#3b82f6' : '#e2e8f0',
              color: activeTab === 'payroll' ? '#fff' : '#475569',
              padding: '0.15rem 0.5rem',
              borderRadius: '12px',
            }}
          >
            ४ किस्ता
          </span>
        </button>

        <button
          onClick={() => setActiveTab('life_verification')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            background: activeTab === 'life_verification' ? '#1e3a8a' : 'transparent',
            color: activeTab === 'life_verification' ? '#fff' : '#64748b',
            border: 'none',
            borderRadius: '10px 10px 0 0',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <UserCheck size={18} />
          वार्षिक जीवन प्रमाणीकरण (Life Verification)
          <span
            style={{
              fontSize: '0.75rem',
              background: activeTab === 'life_verification' ? '#3b82f6' : '#e2e8f0',
              color: activeTab === 'life_verification' ? '#fff' : '#475569',
              padding: '0.15rem 0.5rem',
              borderRadius: '12px',
            }}
          >
            {lifeVerifications.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('vital_linkage')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            background: activeTab === 'vital_linkage' ? '#1e3a8a' : 'transparent',
            color: activeTab === 'vital_linkage' ? '#fff' : '#64748b',
            border: 'none',
            borderRadius: '10px 10px 0 0',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <Activity size={18} />
          व्यक्तिगत घटना दर्ता अन्तरआबद्धता (CRVS Linkage)
          <span
            style={{
              fontSize: '0.75rem',
              background: activeTab === 'vital_linkage' ? '#3b82f6' : '#e2e8f0',
              color: activeTab === 'vital_linkage' ? '#fff' : '#475569',
              padding: '0.15rem 0.5rem',
              borderRadius: '12px',
            }}
          >
            {vitalEvents.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            background: activeTab === 'analytics' ? '#1e3a8a' : 'transparent',
            color: activeTab === 'analytics' ? '#fff' : '#64748b',
            border: 'none',
            borderRadius: '10px 10px 0 0',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <FileText size={18} />
          वडागत तथा वर्गगत बजेट विश्लेषण
        </button>
      </div>

      {/* TAB 1: BENEFICIARIES REGISTRY */}
      {activeTab === 'beneficiaries' && (
        <div>
          {/* Filter Bar */}
          <div
            style={{
              background: '#fff',
              padding: '1.15rem 1.25rem',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              marginBottom: '1.25rem',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1rem',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
            }}
          >
            <div style={{ display: 'flex', flex: 1, minWidth: '300px', position: 'relative' }}>
              <Search
                size={18}
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#64748b',
                }}
              />
              <input
                type="text"
                placeholder="लाभग्राही संकेत, नाम, नागरिकता, NID वा बैंक खाता नम्बर खोज्नुहोस्..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 1rem 0.65rem 2.6rem',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                  outline: 'none',
                  fontSize: '0.9rem',
                  color: '#0f172a',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{
                  padding: '0.65rem 1rem',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                  outline: 'none',
                  fontSize: '0.875rem',
                  background: '#fff',
                  color: '#0f172a',
                  fontWeight: 500,
                }}
              >
                <option value="all">सबै भत्ताका वर्ग (All Categories)</option>
                {Object.keys(CATEGORY_RATES).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <select
                value={selectedWard}
                onChange={(e) => setSelectedWard(e.target.value)}
                style={{
                  padding: '0.65rem 1rem',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                  outline: 'none',
                  fontSize: '0.875rem',
                  background: '#fff',
                  color: '#0f172a',
                  fontWeight: 500,
                }}
              >
                <option value="all">सबै वडा (Wards १-८)</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
                  <option key={w} value={w}>
                    वडा नं. {w}
                  </option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                style={{
                  padding: '0.65rem 1rem',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                  outline: 'none',
                  fontSize: '0.875rem',
                  background: '#fff',
                  color: '#0f172a',
                  fontWeight: 500,
                }}
              >
                <option value="all">सबै अवस्था (All Status)</option>
                <option value="नवीकृत">नवीकृत (Renewed)</option>
                <option value="सक्रिय">सक्रिय (Active)</option>
                <option value="प्रमाणीकरण बाँकी">प्रमाणीकरण बाँकी (Pending)</option>
                <option value="लगत कट्टा">लगत कट्टा (Cancelled)</option>
              </select>
            </div>
          </div>

          {/* Table Container */}
          <div
            style={{
              background: '#fff',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
            }}
          >
            <div className="dt-responsive-table-wrapper">
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                  <tr>
                    <th style={{ padding: '0.9rem 1rem' }}>संकेत नं</th>
                    <th style={{ padding: '0.9rem 1rem' }}>लाभग्राहीको नाम</th>
                    <th style={{ padding: '0.9rem 1rem' }}>भत्ताको वर्ग</th>
                    <th style={{ padding: '0.9rem 1rem' }}>वडा / टोल</th>
                    <th style={{ padding: '0.9rem 1rem' }}>नागरिकता / NID</th>
                    <th style={{ padding: '0.9rem 1rem' }}>बैंक खाता विवरण</th>
                    <th style={{ padding: '0.9rem 1rem' }}>मासिक / त्रैमासिक दर</th>
                    <th style={{ padding: '0.9rem 1rem' }}>अवस्था</th>
                    <th style={{ padding: '0.9rem 1rem', textAlign: 'right' }}>कार्य (Actions)</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingBeneficiaries ? (
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                        लाभग्राही विवरण लोड हुँदैछ...
                      </td>
                    </tr>
                  ) : filteredBeneficiaries.length === 0 ? (
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                        कुनै लाभग्राही फेला परेन।
                      </td>
                    </tr>
                  ) : (
                    filteredBeneficiaries.map((b) => (
                      <tr
                        key={b.id}
                        style={{
                          borderBottom: '1px solid #f1f5f9',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = '#fff')}
                      >
                        <td style={{ padding: '0.9rem 1rem', fontWeight: 700, color: '#1e40af' }}>
                          {b.beneficiaryId}
                        </td>
                        <td style={{ padding: '0.9rem 1rem' }}>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{b.fullName}</div>
                          {b.fullNameEn && (
                            <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>
                              {b.fullNameEn}
                            </div>
                          )}
                          <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.15rem' }}>
                            लिङ्ग: {b.gender} {b.dateOfBirthBs && `| जन्म: ${b.dateOfBirthBs}`}
                          </div>
                        </td>
                        <td style={{ padding: '0.9rem 1rem' }}>
                          <span
                            style={{
                              background: '#e0f2fe',
                              color: '#0369a1',
                              padding: '0.3rem 0.65rem',
                              borderRadius: '8px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              display: 'inline-block',
                            }}
                          >
                            {b.category}
                          </span>
                        </td>
                        <td style={{ padding: '0.9rem 1rem' }}>
                          <div style={{ fontWeight: 600, color: '#334155' }}>वडा नं. {b.wardNumber}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{b.tole || 'गाउँ क्षेत्र'}</div>
                        </td>
                        <td style={{ padding: '0.9rem 1rem', color: '#334155' }}>
                          <div>{b.citizenshipNo || '-'}</div>
                          {b.nationalIdNo && (
                            <div style={{ fontSize: '0.72rem', color: '#2563eb', fontWeight: 600 }}>
                              {b.nationalIdNo}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '0.9rem 1rem' }}>
                          <div style={{ fontWeight: 600, color: '#1e293b' }}>{b.bankName}</div>
                          <div style={{ fontSize: '0.75rem', color: '#475569', fontFamily: 'monospace' }}>
                            {b.bankAccountNumber}
                          </div>
                          {b.bankBranch && (
                            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{b.bankBranch}</div>
                          )}
                        </td>
                        <td style={{ padding: '0.9rem 1rem' }}>
                          <div style={{ fontWeight: 700, color: '#047857', fontSize: '0.95rem' }}>
                            रु. {Number(b.quarterlyAllowanceNPR || b.monthlyAllowanceNPR * 3).toLocaleString('ne-NP')}
                          </div>
                          <div style={{ fontSize: '0.725rem', color: '#64748b' }}>
                            (रु. {Number(b.monthlyAllowanceNPR).toLocaleString('ne-NP')}/महिना)
                          </div>
                        </td>
                        <td style={{ padding: '0.9rem 1rem' }}>
                          <span
                            style={{
                              background:
                                b.status === 'लगत कट्टा'
                                  ? '#fee2e2'
                                  : b.status === 'नवीकृत'
                                  ? '#dcfce7'
                                  : b.status === 'प्रमाणीकरण बाँकी'
                                  ? '#fef3c7'
                                  : '#e0e7ff',
                              color:
                                b.status === 'लगत कट्टा'
                                  ? '#b91c1c'
                                  : b.status === 'नवीकृत'
                                  ? '#15803d'
                                  : b.status === 'प्रमाणीकरण बाँकी'
                                  ? '#b45309'
                                  : '#3730a3',
                              padding: '0.3rem 0.7rem',
                              borderRadius: '20px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                            }}
                          >
                            {b.status === 'नवीकृत' && <CheckCircle size={12} />}
                            {b.status === 'लगत कट्टा' && <X size={12} />}
                            {b.status || 'सक्रिय'}
                          </span>
                        </td>
                        <td style={{ padding: '0.9rem 1rem', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => setDetailModalData(b)}
                              title="विस्तृत विवरण हेर्नुहोस्"
                              style={{
                                padding: '0.4rem 0.65rem',
                                background: '#f8fafc',
                                border: '1px solid #cbd5e1',
                                color: '#334155',
                                borderRadius: '8px',
                                cursor: 'pointer',
                              }}
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              onClick={() => setCardModalData(b)}
                              title="स्मार्ट परिचयपत्र प्रिन्ट गर्नुहोस्"
                              style={{
                                padding: '0.4rem 0.65rem',
                                background: '#eff6ff',
                                border: '1px solid #bfdbfe',
                                color: '#1d4ed8',
                                borderRadius: '8px',
                                cursor: 'pointer',
                              }}
                            >
                              <QrCode size={14} />
                            </button>
                            {b.status !== 'नवीकृत' && b.status !== 'लगत कट्टा' && (
                              <button
                                onClick={() => {
                                  if (confirm(`${b.fullName} को चालु आव २०८१/०८२ नवीकरण स्वीकृत गर्ने?`)) {
                                    renewMutation.mutate(b.id);
                                  }
                                }}
                                title="नवीकरण गर्नुहोस्"
                                style={{
                                  padding: '0.4rem 0.65rem',
                                  background: '#ecfdf5',
                                  border: '1px solid #a7f3d0',
                                  color: '#047857',
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                }}
                              >
                                <RefreshCw size={14} />
                              </button>
                            )}
                            {b.status !== 'लगत कट्टा' && (
                              <button
                                onClick={() => {
                                  const r = prompt('लगत कट्टाको कारण प्रविष्ट गर्नुहोस् (उदा: मृत्यु, बसाइँसराइ):');
                                  if (r) cancelMutation.mutate({ id: b.id, reason: r });
                                }}
                                title="लगत कट्टा गर्नुहोस्"
                                style={{
                                  padding: '0.4rem 0.65rem',
                                  background: '#fef2f2',
                                  border: '1px solid #fecaca',
                                  color: '#b91c1c',
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                }}
                              >
                                <X size={14} />
                              </button>
                            )}
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

      {/* TAB 2: QUARTERLY DBT PAYROLL & BANK ADVICE */}
      {activeTab === 'payroll' && (
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.25rem',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#1e293b' }}>
                आर्थिक वर्ष २०८१/०८२ त्रैमासिक भत्ता निकासा पेरोल
              </h2>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                प्रत्यक्ष बैंक खाता (Direct Benefit Transfer - DBT) निकासा आदेश पत्र तथा लाभग्राही सूची
              </p>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1.25rem',
              marginBottom: '1.5rem',
            }}
          >
            {payrolls.map((p) => {
              const isApproved = p.status.includes('Approved') || p.status.includes('निकासा आदेश जारी');
              const isTransferred = p.status.includes('Transferred') || p.status.includes('बैंकमा पठाइएको');
              return (
                <div
                  key={p.id}
                  style={{
                    background: '#fff',
                    borderRadius: '14px',
                    border: '1px solid #e2e8f0',
                    padding: '1.5rem',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <span
                        style={{
                          background: isTransferred ? '#ecfdf5' : isApproved ? '#eff6ff' : '#fef3c7',
                          color: isTransferred ? '#047857' : isApproved ? '#1d4ed8' : '#b45309',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '20px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                        }}
                      >
                        {p.status}
                      </span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>
                        आव {p.fiscalYear}
                      </span>
                    </div>

                    <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.15rem', fontWeight: 800, color: '#1e3a8a' }}>
                      {p.quarter}
                    </h3>

                    <div style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '1rem', lineHeight: '1.6' }}>
                      <div><strong>पत्र चलानी नं:</strong> {p.adviceLetterNo}</div>
                      <div><strong>भुक्तानी बैंक:</strong> {p.bankName} ({p.bankBranch})</div>
                      <div><strong>निकासा मिति:</strong> {p.disbursementDateBs}</div>
                    </div>

                    <div
                      style={{
                        background: '#f8fafc',
                        borderRadius: '10px',
                        padding: '1rem',
                        marginBottom: '1rem',
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '0.75rem',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>लाभग्राही संख्या</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                          {p.totalBeneficiaries.toLocaleString('ne-NP')} जना
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>कुल निकासा रकम</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#047857' }}>
                          रु. {p.totalAmountNPR.toLocaleString('ne-NP')}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <button
                      onClick={() => setPayrollModalData(p)}
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem',
                        padding: '0.65rem 1rem',
                        background: '#1e3a8a',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      <Printer size={15} /> भरपाई सिट प्रिन्ट
                    </button>

                    {!isTransferred && (
                      <button
                        onClick={() => {
                          const nextStatus: QuarterlyPayroll['status'] = isApproved
                            ? 'बैंकमा पठाइएको (Transferred)'
                            : 'निकासा आदेश जारी (Approved)';
                          updatePayrollMutation.mutate({ id: p.id, status: nextStatus });
                        }}
                        style={{
                          padding: '0.65rem 0.9rem',
                          background: isApproved ? '#10b981' : '#2563eb',
                          border: 'none',
                          borderRadius: '8px',
                          color: '#fff',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                        title={isApproved ? 'बैंकमा पठाइएको चिन्ह लगाउनुहोस्' : 'निकासा आदेश जारी गर्नुहोस्'}
                      >
                        <Send size={15} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: LIFE VERIFICATION & BIOMETRIC RENEWAL */}
      {activeTab === 'life_verification' && (
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.25rem',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#1e293b' }}>
                वार्षिक जीवन प्रमाणीकरण तथा बायोमेट्रिक नवीकरण अभिलेख (Life Verification Audit)
              </h2>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                सामाजिक सुरक्षा नियमावली २०७७ बमोजिम प्रत्येक वर्ष साउन-भदौ महिनामा लाभग्राहीको जीवित रहेको प्रमाणीकरण
              </p>
            </div>
            <button
              onClick={() => setShowLifeVerifModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1.25rem',
                background: '#047857',
                border: 'none',
                borderRadius: '10px',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: 'pointer',
                boxShadow: '0 4px 6px rgba(4, 120, 87, 0.25)',
              }}
            >
              <Plus size={16} /> नयाँ प्रमाणीकरण दर्ता
            </button>
          </div>

          <div
            style={{
              background: '#fff',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.04)',
            }}
          >
            <div className="dt-responsive-table-wrapper">
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                  <tr>
                    <th style={{ padding: '0.9rem 1rem' }}>प्रमाणीकरण मिति</th>
                    <th style={{ padding: '0.9rem 1rem' }}>लाभग्राही संकेत</th>
                    <th style={{ padding: '0.9rem 1rem' }}>लाभग्राहीको नाम</th>
                    <th style={{ padding: '0.9rem 1rem' }}>वडा नं.</th>
                    <th style={{ padding: '0.9rem 1rem' }}>भत्ताको वर्ग</th>
                    <th style={{ padding: '0.9rem 1rem' }}>प्रमाणीकरण विधि</th>
                    <th style={{ padding: '0.9rem 1rem' }}>रुजु गर्ने अधिकारी</th>
                    <th style={{ padding: '0.9rem 1rem' }}>अवस्था</th>
                    <th style={{ padding: '0.9rem 1rem' }}>कैफियत</th>
                  </tr>
                </thead>
                <tbody>
                  {lifeVerifications.map((lv) => (
                    <tr key={lv.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.9rem 1rem', fontWeight: 600, color: '#334155' }}>
                        {lv.verificationDateBs}
                      </td>
                      <td style={{ padding: '0.9rem 1rem', fontWeight: 700, color: '#1e40af' }}>
                        {lv.beneficiaryId}
                      </td>
                      <td style={{ padding: '0.9rem 1rem', fontWeight: 700, color: '#0f172a' }}>
                        {lv.fullName}
                      </td>
                      <td style={{ padding: '0.9rem 1rem' }}>वडा नं. {lv.wardNumber}</td>
                      <td style={{ padding: '0.9rem 1rem' }}>
                        <span
                          style={{
                            background: '#e0f2fe',
                            color: '#0369a1',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                          }}
                        >
                          {lv.category}
                        </span>
                      </td>
                      <td style={{ padding: '0.9rem 1rem' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            color: '#334155',
                          }}
                        >
                          <ShieldCheck size={14} color="#059669" />
                          {lv.verificationMethod}
                        </span>
                      </td>
                      <td style={{ padding: '0.9rem 1rem', color: '#475569' }}>
                        {lv.verifiedByOfficer}
                      </td>
                      <td style={{ padding: '0.9rem 1rem' }}>
                        <span
                          style={{
                            background: lv.verificationStatus.includes('Verified') ? '#ecfdf5' : '#fef3c7',
                            color: lv.verificationStatus.includes('Verified') ? '#059669' : '#b45309',
                            padding: '0.25rem 0.6rem',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                          }}
                        >
                          {lv.verificationStatus}
                        </span>
                      </td>
                      <td style={{ padding: '0.9rem 1rem', fontSize: '0.8rem', color: '#64748b' }}>
                        {lv.remarks || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: VITAL EVENT LINKAGE & ALERTS */}
      {activeTab === 'vital_linkage' && (
        <div>
          <div style={{ marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#1e293b' }}>
              व्यक्तिगत घटना दर्ता प्रणाली (CRVS) सँग प्रत्यक्ष अन्तरआबद्धता
            </h2>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>
              जन्म दर्ताबाट पोषण भत्ता स्वतः दर्ता, मृत्यु दर्ताबाट लगत कट्टा अलर्ट, विवाह दर्ताबाट वर्ग अद्यावधिक
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1.25rem',
              marginBottom: '1.5rem',
            }}
          >
            {vitalEvents.map((ve) => {
              const isApplied = ve.appliedStatus === 'कारबाही सम्पन्न';
              return (
                <div
                  key={ve.id}
                  style={{
                    background: '#fff',
                    borderRadius: '14px',
                    border: '1px solid #e2e8f0',
                    padding: '1.5rem',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span
                        style={{
                          background: ve.eventType.includes('Birth')
                            ? '#ecfdf5'
                            : ve.eventType.includes('Death')
                            ? '#fee2e2'
                            : '#eff6ff',
                          color: ve.eventType.includes('Birth')
                            ? '#047857'
                            : ve.eventType.includes('Death')
                            ? '#b91c1c'
                            : '#1d4ed8',
                          padding: '0.25rem 0.65rem',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                        }}
                      >
                        {ve.eventType}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        दर्ता मिति: {ve.eventDateBs}
                      </span>
                    </div>

                    <h3 style={{ margin: '0 0 0.35rem', fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                      {ve.personName}
                    </h3>
                    <div style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.6', marginBottom: '1rem' }}>
                      <div><strong>घटना दर्ता नं:</strong> {ve.registrationNo}</div>
                      <div><strong>सम्बन्धित वडा:</strong> वडा नं. {ve.wardNumber}</div>
                      <div>
                        <strong>प्रणाली सिफारिस कार्य:</strong>{' '}
                        <span style={{ color: '#2563eb', fontWeight: 700 }}>{ve.ssisAction}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: isApplied ? '#059669' : '#d97706',
                      }}
                    >
                      {ve.appliedStatus}
                    </span>
                    {!isApplied ? (
                      <button
                        onClick={() => vitalActionMutation.mutate(ve.id)}
                        style={{
                          padding: '0.45rem 1rem',
                          background: '#2563eb',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        कारबाही स्वीकृत गर्नुहोस्
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: '#059669', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <CheckCircle size={14} /> समायोजन सम्पन्न
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: ANALYTICS & BUDGET OVERVIEW */}
      {activeTab === 'analytics' && (
        <div>
          <div style={{ marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#1e293b' }}>
              वडागत तथा वर्गगत सामाजिक सुरक्षा बजेट विश्लेषण
            </h2>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>
              वार्षिक कुल बजेट दायित्व रु. {Number(quarterlyBudget * 4).toLocaleString('ne-NP')} को विस्तृत वितरण
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
              gap: '1.5rem',
              marginBottom: '1.5rem',
            }}
          >
            {/* Ward Breakdown Card */}
            <div
              style={{
                background: '#fff',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                padding: '1.5rem',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.04)',
              }}
            >
              <h3 style={{ margin: '0 0 1rem', fontSize: '1.05rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={18} color="#2563eb" /> वडागत लाभग्राही संख्या वितरण
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => {
                  const count = beneficiaries.filter((b) => b.wardNumber === w).length;
                  const pct = totalBeneficiaries > 0 ? Math.round((count / totalBeneficiaries) * 100) : 0;
                  return (
                    <div key={w}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 600 }}>वडा नं. {w}</span>
                        <span style={{ color: '#64748b' }}>
                          {count} जना ({pct}%)
                        </span>
                      </div>
                      <div style={{ background: '#f1f5f9', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                        <div
                          style={{
                            background: '#2563eb',
                            height: '100%',
                            width: `${pct || 5}%`,
                            borderRadius: '4px',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Category Breakdown Card */}
            <div
              style={{
                background: '#fff',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                padding: '1.5rem',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.04)',
              }}
            >
              <h3 style={{ margin: '0 0 1rem', fontSize: '1.05rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={18} color="#059669" /> भत्ताका ७ वर्ग अनुसार वितरण
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {Object.keys(CATEGORY_RATES).map((cat) => {
                  const count = beneficiaries.filter((b) => b.category === cat).length;
                  const rate = CATEGORY_RATES[cat];
                  return (
                    <div
                      key={cat}
                      style={{
                        padding: '0.65rem 0.85rem',
                        background: '#f8fafc',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1e293b' }}>{cat}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          मासिक दर: रु. {rate.toLocaleString('ne-NP')}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span
                          style={{
                            background: '#eff6ff',
                            color: '#1d4ed8',
                            padding: '0.2rem 0.6rem',
                            borderRadius: '12px',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                          }}
                        >
                          {count} जना
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD BENEFICIARY */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '720px',
              maxHeight: '92vh',
              overflowY: 'auto',
              padding: '1.75rem',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.25rem',
                borderBottom: '1.5px solid #f1f5f9',
                paddingBottom: '0.85rem',
              }}
            >
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: '#1e3a8a' }}>
                  नयाँ सामाजिक सुरक्षा लाभग्राही दर्ता फारम
                </h2>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                  गृह मन्त्रालय, राष्ट्रिय परिचयपत्र तथा पञ्जीकरण विभाग (DoNIDCR) मानक अनुरुप
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={22} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createMutation.mutate(formData);
              }}
            >
              {/* Row 1: Full Names */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, marginBottom: '0.35rem', color: '#334155' }}>
                    लाभग्राहीको पूरा नाम (नेपालीमा)*
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="उदा: सुर्य बहादुर तामाङ"
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.85rem',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      outline: 'none',
                      fontSize: '0.875rem',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, marginBottom: '0.35rem', color: '#334155' }}>
                    Full Name (English in BLOCK)*
                  </label>
                  <input
                    type="text"
                    value={formData.fullNameEn}
                    onChange={(e) => setFormData({ ...formData, fullNameEn: e.target.value.toUpperCase() })}
                    placeholder="SURYA BAHADUR TAMANG"
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.85rem',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      outline: 'none',
                      fontSize: '0.875rem',
                    }}
                  />
                </div>
              </div>

              {/* Row 2: Category */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, marginBottom: '0.35rem', color: '#334155' }}>
                  भत्ताको वर्ग (Social Security Category)*
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.85rem',
                    borderRadius: '8px',
                    border: '1.5px solid #cbd5e1',
                    outline: 'none',
                    fontSize: '0.875rem',
                    background: '#fff',
                    fontWeight: 600,
                    color: '#1e3a8a',
                  }}
                >
                  {Object.keys(CATEGORY_RATES).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat} — (मासिक दर: रु. {CATEGORY_RATES[cat].toLocaleString('ne-NP')} | त्रैमासिक: रु.{' '}
                      {(CATEGORY_RATES[cat] * 3).toLocaleString('ne-NP')})
                    </option>
                  ))}
                </select>
              </div>

              {/* Row 3: Citizenship, NID, Gender */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, marginBottom: '0.35rem', color: '#334155' }}>
                    नागरिकता / जन्म दर्ता नं.*
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.citizenshipNo}
                    onChange={(e) => setFormData({ ...formData, citizenshipNo: e.target.value })}
                    placeholder="२३-०१-७५-००१२३"
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.85rem',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      outline: 'none',
                      fontSize: '0.875rem',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, marginBottom: '0.35rem', color: '#334155' }}>
                    राष्ट्रिय परिचयपत्र नं. (NID)
                  </label>
                  <input
                    type="text"
                    value={formData.nationalIdNo}
                    onChange={(e) => setFormData({ ...formData, nationalIdNo: e.target.value })}
                    placeholder="उदा: NID-98214401"
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.85rem',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      outline: 'none',
                      fontSize: '0.875rem',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, marginBottom: '0.35rem', color: '#334155' }}>
                    लिङ्ग (Gender)*
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.85rem',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      outline: 'none',
                      fontSize: '0.875rem',
                      background: '#fff',
                    }}
                  >
                    <option value="महिला">महिला (Female)</option>
                    <option value="पुरुष">पुरुष (Male)</option>
                    <option value="अन्य">अन्य (Other)</option>
                  </select>
                </div>
              </div>

              {/* Row 4: Ward, Tole, DOB BS */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, marginBottom: '0.35rem', color: '#334155' }}>
                    वडा नं.*
                  </label>
                  <select
                    value={formData.wardNumber}
                    onChange={(e) => setFormData({ ...formData, wardNumber: Number(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.85rem',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      outline: 'none',
                      fontSize: '0.875rem',
                      background: '#fff',
                    }}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
                      <option key={w} value={w}>
                        वडा नं. {w}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, marginBottom: '0.35rem', color: '#334155' }}>
                    गाउँ / टोलको नाम
                  </label>
                  <input
                    type="text"
                    value={formData.tole}
                    onChange={(e) => setFormData({ ...formData, tole: e.target.value })}
                    placeholder="उदा: थाङपालकोट"
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.85rem',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      outline: 'none',
                      fontSize: '0.875rem',
                    }}
                  />
                </div>
                <NepaliDatePicker
                  label="जन्म मिति (वि.सं.)*"
                  value={formData.dateOfBirthBs}
                  onChange={(bs) => setFormData({ ...formData, dateOfBirthBs: bs })}
                  placeholder="२०१२-०२-१४"
                />
              </div>

              {/* Row 5: Bank details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, marginBottom: '0.35rem', color: '#334155' }}>
                    बैंकको नाम*
                  </label>
                  <input
                    type="text"
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    placeholder="राष्ट्रिय वाणिज्य बैंक लि."
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.85rem',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      outline: 'none',
                      fontSize: '0.875rem',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, marginBottom: '0.35rem', color: '#334155' }}>
                    बैंक खाता नम्बर*
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.bankAccountNumber}
                    onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
                    placeholder="१०९०१०००१२३४"
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.85rem',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      outline: 'none',
                      fontSize: '0.875rem',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, marginBottom: '0.35rem', color: '#334155' }}>
                    शाखा (Branch)
                  </label>
                  <input
                    type="text"
                    value={formData.bankBranch}
                    onChange={(e) => setFormData({ ...formData, bankBranch: e.target.value })}
                    placeholder="थाङपालधाप शाखा"
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.85rem',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      outline: 'none',
                      fontSize: '0.875rem',
                    }}
                  />
                </div>
              </div>

              {/* Row 6: Guardian Details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, marginBottom: '0.35rem', color: '#334155' }}>
                    संरक्षक / हकवालाको नाम (लागू हुने भएमा)
                  </label>
                  <input
                    type="text"
                    value={formData.guardianName}
                    onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                    placeholder="उदा: दावा शेर्पा (छोरा)"
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.85rem',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      outline: 'none',
                      fontSize: '0.875rem',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, marginBottom: '0.35rem', color: '#334155' }}>
                    सम्पर्क फोन नम्बर
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="९८४१००००००"
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.85rem',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      outline: 'none',
                      fontSize: '0.875rem',
                    }}
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.75rem',
                  borderTop: '1.5px solid #f1f5f9',
                  paddingTop: '1rem',
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    padding: '0.65rem 1.25rem',
                    background: '#f1f5f9',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '8px',
                    color: '#475569',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  रद्द गर्नुहोस्
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  style={{
                    padding: '0.65rem 1.75rem',
                    background: '#10b981',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {createMutation.isPending ? 'दर्ता हुँदैछ...' : 'लाभग्राही दर्ता सुरक्षित गर्नुहोस्'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: SMART IDENTITY CARD PRINT */}
      {cardModalData && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '560px',
              padding: '1.75rem',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#1e3a8a' }}>
                सामाजिक सुरक्षा डिजिटल परिचयपत्र (DoNIDCR मानक)
              </h3>
              <button
                onClick={() => setCardModalData(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Printable ID Container */}
            <div
              id="ssis-id-card-printable"
              style={{
                border: '2px solid #1e3a8a',
                borderRadius: '12px',
                padding: '1.25rem',
                background: 'linear-gradient(180deg, #ffffff 0%, #f0f7ff 100%)',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                position: 'relative',
              }}
            >
              {/* Card Header */}
              <div
                style={{
                  textAlign: 'center',
                  borderBottom: '2px solid #1e3a8a',
                  paddingBottom: '0.65rem',
                  marginBottom: '0.85rem',
                }}
              >
                <div style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: 800, letterSpacing: '0.05em' }}>
                  नेपाल सरकार | गृह मन्त्रालय
                </div>
                <div style={{ fontSize: '0.8rem', color: '#1e293b', fontWeight: 700 }}>
                  राष्ट्रिय परिचयपत्र तथा पञ्जीकरण विभाग
                </div>
                <div style={{ fontSize: '1.05rem', color: '#1e3a8a', fontWeight: 800, marginTop: '0.15rem' }}>
                  पाँचपोखरी थाङपाल गाउँ कार्यपालिकाको कार्यालय
                </div>
                <div
                  style={{
                    display: 'inline-block',
                    background: '#1e3a8a',
                    color: '#fff',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.75rem',
                    borderRadius: '12px',
                    marginTop: '0.35rem',
                  }}
                >
                  सामाजिक सुरक्षा परिचयपत्र (SSIS SMART CARD)
                </div>
              </div>

              {/* Card Body */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px', gap: '1rem' }}>
                <div style={{ fontSize: '0.85rem', lineHeight: '1.7', color: '#1e293b' }}>
                  <div>
                    <strong>संकेत नं (ID):</strong>{' '}
                    <span style={{ color: '#1e40af', fontWeight: 800 }}>{cardModalData.beneficiaryId}</span>
                  </div>
                  <div>
                    <strong>लाभग्राही:</strong> {cardModalData.fullName}
                  </div>
                  {cardModalData.fullNameEn && (
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{cardModalData.fullNameEn}</div>
                  )}
                  <div>
                    <strong>भत्ताको वर्ग:</strong> <span style={{ color: '#0369a1', fontWeight: 700 }}>{cardModalData.category}</span>
                  </div>
                  <div>
                    <strong>नागरिकता / जन्म दर्ता नं:</strong> {cardModalData.citizenshipNo}
                  </div>
                  <div>
                    <strong>ठेगाना:</strong> वडा नं. {cardModalData.wardNumber}, {cardModalData.tole || 'थाङपालधाप'}
                  </div>
                  <div>
                    <strong>बैंक तथा खाता नं:</strong> {cardModalData.bankName} -{' '}
                    <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{cardModalData.bankAccountNumber}</span>
                  </div>
                  <div>
                    <strong>त्रैमासिक दर:</strong>{' '}
                    <span style={{ color: '#047857', fontWeight: 800 }}>
                      रु. {Number(cardModalData.quarterlyAllowanceNPR || cardModalData.monthlyAllowanceNPR * 3).toLocaleString('ne-NP')}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#fff',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '10px',
                    padding: '0.5rem',
                  }}
                >
                  <QrCode size={70} color="#1e3a8a" />
                  <span style={{ fontSize: '0.625rem', color: '#64748b', marginTop: '0.25rem', textAlign: 'center', fontWeight: 600 }}>
                    DoNIDCR QR
                  </span>
                </div>
              </div>

              {/* Card Footer */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                  marginTop: '1rem',
                  paddingTop: '0.65rem',
                  borderTop: '1px dashed #cbd5e1',
                  fontSize: '0.75rem',
                }}
              >
                <div>
                  जारी मिति: चालु आव {cardModalData.fiscalYear || '२०८१/०८२'}<br />
                  अवस्था: <strong style={{ color: '#047857' }}>{cardModalData.status || 'सक्रिय'}</strong>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ borderBottom: '1px solid #475569', width: '120px', marginBottom: '0.2rem' }} />
                  वडा सचिव / पञ्जीकाधिकारी
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
              <button
                onClick={() => setCardModalData(null)}
                style={{
                  padding: '0.55rem 1.25rem',
                  background: '#f1f5f9',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '8px',
                  color: '#475569',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                बन्द गर्नुहोस्
              </button>
              <button
                onClick={() => window.print()}
                style={{
                  padding: '0.55rem 1.5rem',
                  background: '#2563eb',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                प्रिन्ट गर्नुहोस्
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: OFFICIAL BANK ADVICE & PAYROLL SHEET */}
      {payrollModalData && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '850px',
              maxHeight: '92vh',
              overflowY: 'auto',
              padding: '2rem',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#1e3a8a' }}>
                आधिकारिक बैंक निकासा आदेश तथा भरपाई सिट (Bank Advice Slip)
              </h3>
              <button
                onClick={() => setPayrollModalData(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={22} />
              </button>
            </div>

            {/* Official Sheet Container */}
            <div
              id="bank-advice-sheet"
              style={{
                border: '1.5px solid #cbd5e1',
                padding: '2rem',
                borderRadius: '8px',
                background: '#fff',
                color: '#0f172a',
              }}
            >
              {/* Header Letterhead */}
              <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.85rem', color: '#dc2626', fontWeight: 800 }}>नेपाल सरकार</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>गृह मन्त्रालय, राष्ट्रिय परिचयपत्र तथा पञ्जीकरण विभाग</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#1e3a8a', margin: '0.2rem 0' }}>
                  पाँचपोखरी थाङपाल गाउँ कार्यपालिकाको कार्यालय
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>थाङपालधाप, सिन्धुपाल्चोक, बागमती प्रदेश</div>
                <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.2rem' }}>
                  सामाजिक सुरक्षा तथा व्यक्तिगत घटना दर्ता शाखा
                </div>
              </div>

              {/* Meta Info */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                <div>
                  <strong>पत्र संख्या:</strong> २०८१/०८२<br />
                  <strong>चलानी नं:</strong> {payrollModalData.adviceLetterNo}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <strong>मिति:</strong> {payrollModalData.disbursementDateBs} वि.सं.<br />
                  <strong>किस्ता:</strong> {payrollModalData.quarter}
                </div>
              </div>

              {/* Bank Recipient */}
              <div style={{ fontSize: '0.9rem', marginBottom: '1rem', lineHeight: '1.6' }}>
                <strong>श्री शाखा प्रबन्धक ज्यू,</strong><br />
                {payrollModalData.bankName}, {payrollModalData.bankBranch}, सिन्धुपाल्चोक।
              </div>

              <div style={{ textAlign: 'center', fontSize: '1rem', fontWeight: 800, margin: '1rem 0', textDecoration: 'underline' }}>
                विषय: सामाजिक सुरक्षा भत्ता रकम प्रत्यक्ष बैंक खाता (DBT) मा जम्मा गरिदिने सम्बन्धमा।
              </div>

              <p style={{ fontSize: '0.875rem', lineHeight: '1.7', textAlign: 'justify' }}>
                प्रस्तुत विषयमा पाँचपोखरी थाङपाल गाउँपालिका अन्तर्गत आर्थिक वर्ष <strong>{payrollModalData.fiscalYear}</strong> को{' '}
                <strong>{payrollModalData.quarter}</strong> को सामाजिक सुरक्षा भत्ता बापत यस गाउँपालिकाका ८ वटै वडाका जम्मा{' '}
                <strong>{payrollModalData.totalBeneficiaries.toLocaleString('ne-NP')}</strong> जना योग्य लाभग्राहीहरूको तपसिल बमोजिमको कुल रकम{' '}
                <strong>रु. {payrollModalData.totalAmountNPR.toLocaleString('ne-NP')}</strong> (अक्षरेपी: {payrollModalData.totalAmountNPR.toLocaleString('ne-NP')} मात्र)
                यस कार्यालयको सामाजिक सुरक्षा भत्ता खाताबाट सम्बन्धित लाभग्राहीहरूको व्यक्तिगत बैंक खातामा दाखिला/जम्मा गरी सोको प्रतिवेदन उपलब्ध गराइदिनुहुन अनुरोध छ।
              </p>

              {/* Ward-wise Summary Table */}
              <div style={{ margin: '1.25rem 0' }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem', color: '#1e3a8a' }}>
                  तपसिल: वडागत लाभग्राही संख्या तथा निकासा रकम सारांश
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', border: '1px solid #cbd5e1' }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                      <th style={{ padding: '0.5rem', border: '1px solid #cbd5e1' }}>क्र.सं.</th>
                      <th style={{ padding: '0.5rem', border: '1px solid #cbd5e1' }}>वडा नम्बर</th>
                      <th style={{ padding: '0.5rem', border: '1px solid #cbd5e1', textAlign: 'right' }}>लाभग्राही संख्या</th>
                      <th style={{ padding: '0.5rem', border: '1px solid #cbd5e1', textAlign: 'right' }}>निकासा रकम (रु.)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payrollModalData.wardWiseSummary.map((ws, idx) => (
                      <tr key={ws.wardNumber}>
                        <td style={{ padding: '0.45rem', border: '1px solid #cbd5e1', textAlign: 'center' }}>{idx + 1}</td>
                        <td style={{ padding: '0.45rem', border: '1px solid #cbd5e1' }}>वडा नं. {ws.wardNumber}</td>
                        <td style={{ padding: '0.45rem', border: '1px solid #cbd5e1', textAlign: 'right' }}>
                          {ws.beneficiaryCount.toLocaleString('ne-NP')}
                        </td>
                        <td style={{ padding: '0.45rem', border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 600 }}>
                          रु. {ws.amountNPR.toLocaleString('ne-NP')}
                        </td>
                      </tr>
                    ))}
                    <tr style={{ background: '#f8fafc', fontWeight: 800 }}>
                      <td colSpan={2} style={{ padding: '0.5rem', border: '1px solid #cbd5e1', textAlign: 'center' }}>
                        जम्मा कुल योग (Total)
                      </td>
                      <td style={{ padding: '0.5rem', border: '1px solid #cbd5e1', textAlign: 'right' }}>
                        {payrollModalData.totalBeneficiaries.toLocaleString('ne-NP')} जना
                      </td>
                      <td style={{ padding: '0.5rem', border: '1px solid #cbd5e1', textAlign: 'right', color: '#047857' }}>
                        रु. {payrollModalData.totalAmountNPR.toLocaleString('ne-NP')}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Signoff Authorities */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginTop: '2.5rem', textAlign: 'center', fontSize: '0.825rem' }}>
                <div>
                  <div style={{ borderBottom: '1px solid #64748b', height: '40px', marginBottom: '0.4rem' }} />
                  <strong>पेश गर्ने (शाखा प्रमुख)</strong><br />
                  सामाजिक सुरक्षा तथा पञ्जीकरण शाखा
                </div>
                <div>
                  <div style={{ borderBottom: '1px solid #64748b', height: '40px', marginBottom: '0.4rem' }} />
                  <strong>जाँच गर्ने (लेखा अधिकृत)</strong><br />
                  आर्थिक प्रशासन शाखा
                </div>
                <div>
                  <div style={{ borderBottom: '1px solid #64748b', height: '40px', marginBottom: '0.4rem' }} />
                  <strong>सदर गर्ने (प्र.प्र.अ.)</strong><br />
                  प्रमुख प्रशासकीय अधिकृत
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
              <button
                onClick={() => setPayrollModalData(null)}
                style={{
                  padding: '0.6rem 1.25rem',
                  background: '#f1f5f9',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '8px',
                  color: '#475569',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                बन्द गर्नुहोस्
              </button>
              <button
                onClick={() => window.print()}
                style={{
                  padding: '0.6rem 1.5rem',
                  background: '#1e3a8a',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <Printer size={16} /> बैंक निकासा आदेश प्रिन्ट
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: LIFE VERIFICATION RECORD */}
      {showLifeVerifModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '600px',
              padding: '1.75rem',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#1e3a8a' }}>
                  वार्षिक जीवन प्रमाणीकरण दर्ता (Life Verification)
                </h3>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                  साउन-भदौ म्याद नवीकरण तथा बायोमेट्रिक औंठाछाप रुजु
                </p>
              </div>
              <button
                onClick={() => setShowLifeVerifModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                lifeVerifMutation.mutate(lifeVerifForm);
              }}
            >
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, marginBottom: '0.35rem', color: '#334155' }}>
                  प्रमाणीकरण गरिने लाभग्राही छान्नुहोस्*
                </label>
                <select
                  required
                  value={lifeVerifForm.beneficiaryId}
                  onChange={(e) => setLifeVerifForm({ ...lifeVerifForm, beneficiaryId: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    borderRadius: '8px',
                    border: '1.5px solid #cbd5e1',
                    outline: 'none',
                    fontSize: '0.875rem',
                    background: '#fff',
                  }}
                >
                  <option value="">-- लाभग्राही छान्नुहोस् --</option>
                  {beneficiaries
                    .filter((b) => b.status !== 'लगत कट्टा')
                    .map((b) => (
                      <option key={b.id} value={b.beneficiaryId}>
                        {b.fullName} ({b.beneficiaryId}) - वडा नं. {b.wardNumber} [{b.category}]
                      </option>
                    ))}
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, marginBottom: '0.35rem', color: '#334155' }}>
                  प्रमाणीकरण विधि (Verification Method)*
                </label>
                <select
                  value={lifeVerifForm.verificationMethod}
                  onChange={(e) =>
                    setLifeVerifForm({
                      ...lifeVerifForm,
                      verificationMethod: e.target.value as LifeVerificationRecord['verificationMethod'],
                    })
                  }
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    borderRadius: '8px',
                    border: '1.5px solid #cbd5e1',
                    outline: 'none',
                    fontSize: '0.875rem',
                    background: '#fff',
                  }}
                >
                  <option value="बायोमेट्रिक (Biometric)">बायोमेट्रिक (Biometric - औंठाछाप मिलान)</option>
                  <option value="भौतिक उपस्थिति (Physical)">भौतिक उपस्थिति (वडा कार्यालयमा प्रत्यक्ष उपस्थिति)</option>
                  <option value="घरदैलो घुम्ती सेवा (Mobile)">घरदैलो घुम्ती सेवा (अशक्त/जेष्ठ नागरिक घरमै प्रमाणीकरण)</option>
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, marginBottom: '0.35rem', color: '#334155' }}>
                  रुजु तथा प्रमाणीकरण गर्ने कर्मचारीको नाम*
                </label>
                <input
                  type="text"
                  required
                  value={lifeVerifForm.verifiedByOfficer}
                  onChange={(e) => setLifeVerifForm({ ...lifeVerifForm, verifiedByOfficer: e.target.value })}
                  placeholder="उदा: सुरेन्द्र श्रेष्ठ (वडा सचिव)"
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    borderRadius: '8px',
                    border: '1.5px solid #cbd5e1',
                    outline: 'none',
                    fontSize: '0.875rem',
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, marginBottom: '0.35rem', color: '#334155' }}>
                  कैफियत तथा निर्णय
                </label>
                <textarea
                  rows={3}
                  value={lifeVerifForm.remarks}
                  onChange={(e) => setLifeVerifForm({ ...lifeVerifForm, remarks: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    borderRadius: '8px',
                    border: '1.5px solid #cbd5e1',
                    outline: 'none',
                    fontSize: '0.875rem',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setShowLifeVerifModal(false)}
                  style={{
                    padding: '0.6rem 1.25rem',
                    background: '#f1f5f9',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '8px',
                    color: '#475569',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  रद्द गर्नुहोस्
                </button>
                <button
                  type="submit"
                  disabled={lifeVerifMutation.isPending}
                  style={{
                    padding: '0.6rem 1.5rem',
                    background: '#047857',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {lifeVerifMutation.isPending ? 'सुरक्षित हुँदैछ...' : 'प्रमाणीकरण स्वीकृत गर्नुहोस्'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: BENEFICIARY DETAIL VIEW */}
      {detailModalData && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '650px',
              padding: '1.75rem',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#1e3a8a' }}>
                  {detailModalData.fullName}
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  लाभग्राही संकेत: {detailModalData.beneficiaryId}
                </span>
              </div>
              <button
                onClick={() => setDetailModalData(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.875rem', lineHeight: '1.8' }}>
              <div><strong>नागरिकता नं:</strong> {detailModalData.citizenshipNo}</div>
              <div><strong>NID नं:</strong> {detailModalData.nationalIdNo || '-'}</div>
              <div><strong>जन्म मिति (वि.सं.):</strong> {detailModalData.dateOfBirthBs || '-'}</div>
              <div><strong>लिङ्ग:</strong> {detailModalData.gender}</div>
              <div><strong>वडा नं:</strong> {detailModalData.wardNumber} ({detailModalData.tole || 'गाउँ'})</div>
              <div><strong>सम्पर्क फोन:</strong> {detailModalData.phone || '-'}</div>
              <div><strong>भत्ताको वर्ग:</strong> {detailModalData.category}</div>
              <div><strong>अवस्था:</strong> {detailModalData.status}</div>
              <div><strong>बैंक:</strong> {detailModalData.bankName}</div>
              <div><strong>खाता नं:</strong> {detailModalData.bankAccountNumber}</div>
              <div><strong>मासिक दर:</strong> रु. {detailModalData.monthlyAllowanceNPR.toLocaleString('ne-NP')}</div>
              <div><strong>त्रैमासिक दर:</strong> रु. {detailModalData.quarterlyAllowanceNPR.toLocaleString('ne-NP')}</div>
              <div><strong>संरक्षकको नाम:</strong> {detailModalData.guardianName || '-'}</div>
              <div><strong>अन्तिम प्रमाणीकरण:</strong> {detailModalData.lastLifeVerificationDateBs || '-'}</div>
              {detailModalData.dropoutReason && (
                <div style={{ gridColumn: '1 / -1', color: '#b91c1c' }}>
                  <strong>लगत कट्टा कारण:</strong> {detailModalData.dropoutReason} ({detailModalData.dropoutDateBs})
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
              <button
                onClick={() => setDetailModalData(null)}
                style={{
                  padding: '0.6rem 1.25rem',
                  background: '#f1f5f9',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '8px',
                  color: '#475569',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                बन्द गर्नुहोस्
              </button>
              <button
                onClick={() => {
                  const b = detailModalData;
                  setDetailModalData(null);
                  setCardModalData(b);
                }}
                style={{
                  padding: '0.6rem 1.25rem',
                  background: '#1e3a8a',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <QrCode size={16} /> परिचयपत्र हेर्नुहोस्
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialSecurityPage;
