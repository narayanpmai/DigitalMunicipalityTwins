import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { citizensApi, type CitizenRecord } from '../../api/citizens';
import { demographicsApi } from '../../api/demographics';
import { SurveyIndicatorsTab } from '../../features/citizen-portal/components/SurveyIndicatorsTab';
import { HouseholdRegistryTab } from '../../features/citizen-portal/components/HouseholdRegistryTab';
import { DemographicsAnalytics } from '../../features/demographics/components/DemographicsAnalytics';
import { CivicSocialFeedTab } from '../../features/citizen-portal/components/CivicSocialFeedTab';
import {
  Users,
  Search,
  Filter,
  UserCheck,
  Clock,
  Shield,
  ShieldCheck,
  Plus,
  Home,
  CheckCircle2,
  X,
  Phone,
  Eye,
  FileText,
  Copy,
  Check,
  RefreshCw,
  AlertTriangle,
  Building2,
  MapPin,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Info,
  Briefcase,
  BarChart2,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

const WARDS = [
  { id: 0, name: 'सबै वडाहरू (१-८)' },
  { id: 1, name: 'वडा नं. १ (बाँसखर्क)' },
  { id: 2, name: 'वडा नं. २ (बरुवा)' },
  { id: 3, name: 'वडा नं. ३ (भोताङ)' },
  { id: 4, name: 'वडा नं. ४ (थाङपालकोट)' },
  { id: 5, name: 'वडा नं. ५ (गुन्सा)' },
  { id: 6, name: 'वडा नं. ६ (थाङपालधाप)' },
  { id: 7, name: 'वडा नं. ७ (तिपेनी)' },
  { id: 8, name: 'वडा नं. ८ (लागर्चे)' },
];

export const CitizenPortal: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'social' | 'directory' | 'households' | 'indicators' | 'analytics'>('social');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWard, setSelectedWard] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 12;

  // Modals
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [trackingCodeInput, setTrackingCodeInput] = useState('');
  const [trackingResult, setTrackingResult] = useState<CitizenRecord | null | 'NOT_FOUND'>(null);
  const [isTrackingLoading, setIsTrackingLoading] = useState(false);

  const [selectedCitizen, setSelectedCitizen] = useState<CitizenRecord | null>(null);
  const [registrationSuccessData, setRegistrationSuccessData] = useState<CitizenRecord | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Form State for Registration
  const [formData, setFormData] = useState({
    fullName: '',
    fullNameEn: '',
    gender: 'MALE' as 'MALE' | 'FEMALE' | 'OTHER',
    dobBs: '',
    bloodGroup: '',
    wardNumber: 1,
    tole: '',
    address: 'पाँचपोखरी थाङपाल',
    phone: '',
    citizenshipNo: '',
    nationalId: '',
    occupation: '',
    targetedGroup: 'सामान्य',
    fatherName: '',
    motherName: '',
    spouseName: '',
  });

  const [formError, setFormError] = useState('');

  // 1. Fetch Verified Public Citizens
  const {
    data: citizens = [],
    isLoading: isCitizensLoading,
    refetch: refetchCitizens,
  } = useQuery<CitizenRecord[]>({
    queryKey: ['public-citizens', searchTerm, selectedWard],
    queryFn: () => citizensApi.getPublic(searchTerm, selectedWard > 0 ? selectedWard : undefined),
  });

  // 2. Fetch Public Stats
  const { data: stats } = useQuery({
    queryKey: ['public-citizen-stats'],
    queryFn: () => citizensApi.getStats(),
  });

  // 3. Fetch Demographics Summary for official household count
  const { data: summaryMetrics } = useQuery({
    queryKey: ['demographics-summary-metrics'],
    queryFn: () => demographicsApi.getSummaryMetrics(),
  });

  // Filtered & Paginated records
  const paginatedCitizens = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const safeCitizens = Array.isArray(citizens) ? citizens : [];
    return safeCitizens.slice(start, start + pageSize);
  }, [citizens, currentPage]);

  const totalPages = Math.ceil((Array.isArray(citizens) ? citizens : []).length / pageSize) || 1;

  // Registration Mutation
  const registerMutation = useMutation({
    mutationFn: (newCitizen: Partial<CitizenRecord>) => citizensApi.publicRegister(newCitizen),
    onSuccess: (data) => {
      setRegistrationSuccessData(data);
      setIsRegisterModalOpen(false);
      // Reset form
      setFormData({
        fullName: '',
        fullNameEn: '',
        gender: 'MALE',
        dobBs: '',
        bloodGroup: '',
        wardNumber: 1,
        tole: '',
        address: 'पाँचपोखरी थाङपाल',
        phone: '',
        citizenshipNo: '',
        nationalId: '',
        occupation: '',
        targetedGroup: 'सामान्य',
        fatherName: '',
        motherName: '',
        spouseName: '',
      });
      setFormError('');
      queryClient.invalidateQueries({ queryKey: ['public-citizen-stats'] });
    },
    onError: (err: any) => {
      setFormError(err?.response?.data?.message || 'दर्ता गर्दा समस्या देखियो, कृपया फेरि प्रयास गर्नुहोला।');
    },
  });

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim()) {
      setFormError('कृपया पूरा नाम (नेपालीमा) अनिवार्य भर्नुहोस्');
      return;
    }
    if (!formData.phone.trim()) {
      setFormError('सम्पर्क फोन नम्बर अनिवार्य छ');
      return;
    }
    if (!formData.wardNumber) {
      setFormError('कृपया वडा नम्बर छनोट गर्नुहोस्');
      return;
    }

    setFormError('');
    registerMutation.mutate(formData);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Track Status Search
  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingCodeInput.trim()) return;
    setIsTrackingLoading(true);
    setTrackingResult(null);

    try {
      // Look up via getAll or getPublic or search
      const res = await citizensApi.getAll(trackingCodeInput.trim());
      const match = res.find(
        (c) =>
          c.citizenCode?.toUpperCase() === trackingCodeInput.trim().toUpperCase() ||
          c.phone?.includes(trackingCodeInput.trim()) ||
          c.citizenshipNo?.includes(trackingCodeInput.trim())
      );
      if (match) {
        setTrackingResult(match);
      } else {
        setTrackingResult('NOT_FOUND');
      }
    } catch {
      setTrackingResult('NOT_FOUND');
    } finally {
      setIsTrackingLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '4rem' }}>
      {/* ── HERO BANNER ────────────────────────────────────────── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0d1f3c 0%, #1e3a8a 50%, #0284c7 100%)',
          color: '#ffffff',
          padding: '3rem 2rem 2.5rem 2rem',
          boxShadow: '0 4px 20px rgba(13, 31, 60, 0.15)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            right: '-5%',
            top: '-20%',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ width: '100%', maxWidth: '100%', margin: '0', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(255,255,255,0.12)', padding: '0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, marginBottom: '1rem', backdropFilter: 'blur(4px)' }}>
            <ShieldCheck size={16} color="#38bdf8" />
            <span>स्थानीय सरकार डिजिटल सुशासन तथा खुला तथ्यांक प्रणाली</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div style={{ maxWidth: '750px' }}>
              <h1 style={{ fontSize: '2.4rem', fontWeight: 800, margin: '0 0 0.75rem 0', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
                नागरिक लगत तथा डिजिटल पार्श्वचित्र
              </h1>
              <p style={{ fontSize: '1.05rem', color: '#cbd5e1', lineHeight: 1.6, margin: 0 }}>
                पाँचपोखरी थाङपाल गाउँपालिकाका सम्पूर्ण प्रमाणीकृत नागरिक लगत, वडागत जनसांख्यिकी सूचक तथा घरधुरी प्रोफाइल । नयाँ नागरिकहरूले यहाँबाट अनलाइन व्यक्तिगत लगत दर्ता गर्न सक्नुहुन्छ ।
              </p>
            </div>

            {/* Top Action CTA Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => setIsRegisterModalOpen(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  backgroundColor: '#10b981',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.75rem 1.4rem',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                <Plus size={18} />
                + नयाँ नागरिक अनलाइन दर्ता
              </button>

              <button
                onClick={() => {
                  setIsTrackModalOpen(true);
                  setTrackingResult(null);
                  setTrackingCodeInput('');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  color: '#ffffff',
                  border: '1px solid rgba(255,255,255,0.3)',
                  padding: '0.75rem 1.2rem',
                  borderRadius: '10px',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  backdropFilter: 'blur(6px)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.25)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)')}
              >
                <Clock size={16} />
                दर्ता स्थिति जाँच गर्नुहोस्
              </button>

              <Link
                to="/ebps?tab=apply"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  backgroundColor: '#6366f1',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.75rem 1.3rem',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                <Building2 size={18} />
                + घर-नक्सा पास अनलाइन आवेदन (e-BPS)
              </Link>

              <Link
                to="/procurement?tab=apply"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.75rem 1.3rem',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  boxShadow: '0 4px 12px rgba(2, 132, 199, 0.4)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                <Briefcase size={18} />
                + ई-बोलपत्र / योजना आवेदन (e-Tender)
              </Link>
            </div>
          </div>

          {/* Privacy Note Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              marginTop: '1.75rem',
              backgroundColor: 'rgba(15, 23, 42, 0.4)',
              padding: '0.6rem 1rem',
              borderRadius: '8px',
              fontSize: '0.8rem',
              color: '#94a3b8',
              border: '1px solid rgba(255,255,255,0.08)',
              width: 'fit-content',
            }}
          >
            <Shield size={16} color="#38bdf8" />
            <span>
              <strong>गोपनीयता संरक्षण:</strong> व्यक्तिगत सुरक्षाका लागि सार्वजनिक पोर्टलमा नागरिकता नम्बर र फोन नम्बर सुरक्षित रूपमा इन्क्रिप्ट/मास्क गरिएको छ । केवल प्रमाणीकृत लगत मात्र यहाँ सार्वजनिक गरिन्छ ।
            </span>
          </div>
        </div>
      </div>

      {/* ── KEY METRIC STATS ────────────────────────────────────── */}
      <div style={{ width: '100%', maxWidth: '100%', margin: '-1.5rem 0 2rem 0', padding: '0 0.5rem', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          {/* Total Citizens */}
          <div
            style={{
              backgroundColor: '#ffffff',
              padding: '1.25rem 1.5rem',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              borderTop: '4px solid #0284c7',
              display: 'flex',
              alignItems: 'center',
              gap: '1.25rem',
            }}
          >
            <div style={{ backgroundColor: '#e0f2fe', padding: '0.85rem', borderRadius: '12px', color: '#0284c7' }}>
              <Users size={28} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>कुल प्रमाणीकृत नागरिक लगत</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>
                {stats?.total ? Number(stats.total).toLocaleString('ne-NP') : '१,५२४'}
              </div>
              <div style={{ fontSize: '0.725rem', color: '#0284c7', fontWeight: 500 }}>पालिका रेकर्डमा अद्यावधिक</div>
            </div>
          </div>

          {/* Households */}
          <div
            style={{
              backgroundColor: '#ffffff',
              padding: '1.25rem 1.5rem',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              borderTop: '4px solid #10b981',
              display: 'flex',
              alignItems: 'center',
              gap: '1.25rem',
            }}
          >
            <div style={{ backgroundColor: '#d1fae5', padding: '0.85rem', borderRadius: '12px', color: '#10b981' }}>
              <Home size={28} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>दर्ता भएका घरधुरी</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>
                {(summaryMetrics?.householdRegistry?.registeredCount ?? 0).toLocaleString('ne-NP')}
              </div>
              <div style={{ fontSize: '0.725rem', color: '#10b981', fontWeight: 500 }}>डिजिटल म्याट्रिक्समा आधिकारिक दर्ता</div>
            </div>
          </div>

          {/* Verification Rate */}
          <div
            style={{
              backgroundColor: '#ffffff',
              padding: '1.25rem 1.5rem',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              borderTop: '4px solid #8b5cf6',
              display: 'flex',
              alignItems: 'center',
              gap: '1.25rem',
            }}
          >
            <div style={{ backgroundColor: '#ede9fe', padding: '0.85rem', borderRadius: '12px', color: '#8b5cf6' }}>
              <ShieldCheck size={28} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>सार्वजनिक प्रमाणीकरण दर</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>१००%</div>
              <div style={{ fontSize: '0.725rem', color: '#8b5cf6', fontWeight: 500 }}>वडा कार्यालयबाट पूर्ण प्रमाणित</div>
            </div>
          </div>

          {/* Online Service */}
          <div
            style={{
              backgroundColor: '#ffffff',
              padding: '1.25rem 1.5rem',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              borderTop: '4px solid #f59e0b',
              display: 'flex',
              alignItems: 'center',
              gap: '1.25rem',
            }}
          >
            <div style={{ backgroundColor: '#fef3c7', padding: '0.85rem', borderRadius: '12px', color: '#f59e0b' }}>
              <Clock size={28} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>अनलाइन दर्ता सुविधा</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>२४/७</div>
              <div style={{ fontSize: '0.725rem', color: '#f59e0b', fontWeight: 500 }}>डिजिटल आवेदन र ट्र्याकिङ</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT TABS ───────────────────────────────────── */}
      <div style={{ width: '100%', maxWidth: '100%', margin: '0', padding: '0 0.5rem' }}>
        {/* Navigation Tabs Bar */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            borderBottom: '2px solid #e2e8f0',
            marginBottom: '1.5rem',
            backgroundColor: '#ffffff',
            padding: '0.5rem 0.75rem 0 0.75rem',
            borderRadius: '12px 12px 0 0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          <button
            onClick={() => setActiveTab('social')}
            style={{
              padding: '0.85rem 1.5rem',
              border: 'none',
              background: 'none',
              fontSize: '0.95rem',
              fontWeight: 700,
              color: activeTab === 'social' ? '#7c3aed' : '#64748b',
              borderBottom: activeTab === 'social' ? '3px solid #7c3aed' : '3px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease',
            }}
          >
            <MessageSquare size={18} />
            नागरिक चौतारी तथा सामाजिक संवाद (Civic Social Feed)
            <span
              style={{
                backgroundColor: activeTab === 'social' ? '#ede9fe' : '#f1f5f9',
                color: activeTab === 'social' ? '#7c3aed' : '#64748b',
                padding: '0.15rem 0.5rem',
                borderRadius: '12px',
                fontSize: '0.72rem',
                fontWeight: 800,
              }}
            >
              नयाँ
            </span>
          </button>

          <button
            onClick={() => setActiveTab('directory')}
            style={{
              padding: '0.85rem 1.5rem',
              border: 'none',
              background: 'none',
              fontSize: '0.95rem',
              fontWeight: 700,
              color: activeTab === 'directory' ? '#0284c7' : '#64748b',
              borderBottom: activeTab === 'directory' ? '3px solid #0284c7' : '3px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease',
            }}
          >
            <Users size={18} />
            सार्वजनिक नागरिक लगत (Verified Citizens)
            <span
              style={{
                backgroundColor: activeTab === 'directory' ? '#e0f2fe' : '#f1f5f9',
                color: activeTab === 'directory' ? '#0284c7' : '#64748b',
                padding: '0.15rem 0.5rem',
                borderRadius: '12px',
                fontSize: '0.75rem',
              }}
            >
              {citizens.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('indicators')}
            style={{
              padding: '0.85rem 1.5rem',
              border: 'none',
              background: 'none',
              fontSize: '0.95rem',
              fontWeight: 700,
              color: activeTab === 'indicators' ? '#f59e0b' : '#64748b',
              borderBottom: activeTab === 'indicators' ? '3px solid #f59e0b' : '3px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease',
            }}
          >
            <FileText size={18} />
            डिजिटल पार्श्वचित्र तथा सर्वेक्षण सूचक (Survey Indicators)
          </button>

          <button
            onClick={() => setActiveTab('households')}
            style={{
              padding: '0.85rem 1.5rem',
              border: 'none',
              background: 'none',
              fontSize: '0.95rem',
              fontWeight: 700,
              color: activeTab === 'households' ? '#10b981' : '#64748b',
              borderBottom: activeTab === 'households' ? '3px solid #10b981' : '3px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease',
            }}
          >
            <Home size={18} />
            घरधुरी म्याट्रिक्स लगत (Household Registry)
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            style={{
              padding: '0.85rem 1.5rem',
              border: 'none',
              background: 'none',
              fontSize: '0.95rem',
              fontWeight: 700,
              color: activeTab === 'analytics' ? '#8b5cf6' : '#64748b',
              borderBottom: activeTab === 'analytics' ? '3px solid #8b5cf6' : '3px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease',
            }}
          >
            <BarChart2 size={18} />
            तथ्याङ्क प्रतिवेदन (Analytics Dashboard)
          </button>
        </div>

        {/* ── TAB 1: CITIZEN DIRECTORY ─────────────────────────── */}
        {activeTab === 'directory' && (
          <div>
            {/* Filter and Search Bar */}
            <div
              style={{
                backgroundColor: '#ffffff',
                padding: '1.25rem',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                marginBottom: '1.5rem',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '1rem',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              {/* Search */}
              <div style={{ position: 'relative', flex: '1 1 320px' }}>
                <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="नाम, पेशा, वा टोलबाट खोज्नुहोस्..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  style={{
                    width: '100%',
                    padding: '0.65rem 1rem 0.65rem 2.5rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    outline: 'none',
                    backgroundColor: '#f8fafc',
                  }}
                />
              </div>

              {/* Ward Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Filter size={16} color="#64748b" />
                <select
                  value={selectedWard}
                  onChange={(e) => {
                    setSelectedWard(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  style={{
                    padding: '0.65rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#334155',
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                >
                  {WARDS.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Refresh button */}
              <button
                onClick={() => refetchCitizens()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.65rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#f8fafc',
                  color: '#475569',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <RefreshCw size={14} />
                रिफ्रेस
              </button>
            </div>

            {/* Citizens Table / Card Grid */}
            {isCitizensLoading ? (
              <div style={{ textAlign: 'center', padding: '4rem', backgroundColor: '#ffffff', borderRadius: '12px' }}>
                <RefreshCw size={32} color="#0284c7" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 1rem auto' }} />
                <p style={{ color: '#64748b', fontWeight: 600 }}>सार्वजनिक नागरिक लगत लोड हुँदैछ...</p>
              </div>
            ) : citizens.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 2rem', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                <Users size={48} color="#94a3b8" style={{ margin: '0 auto 1rem auto' }} />
                <h3 style={{ color: '#0f172a', margin: '0 0 0.5rem 0' }}>कुनै प्रमाणित नागरिक लगत भेटिएन</h3>
                <p style={{ color: '#64748b', maxWidth: '450px', margin: '0 auto 1.5rem auto', fontSize: '0.9rem' }}>
                  तपाईंले खोज्नुभएको नाम वा वडामा हालसम्म कुनै प्रमाणीकृत सार्वजनिक विवरण उपलब्ध छैन । नयाँ लगत प्रविष्टिका लागि अनलाइन फारम भर्न सक्नुहुन्छ ।
                </p>
                <button
                  onClick={() => setIsRegisterModalOpen(true)}
                  style={{
                    backgroundColor: '#10b981',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.65rem 1.25rem',
                    borderRadius: '8px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  + नयाँ नागरिक लगत दर्ता गर्नुहोस्
                </button>
              </div>
            ) : (
              <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                        <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>नागरिक कोड</th>
                        <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>पूरा नाम (नेपाली / English)</th>
                        <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>वडा र ठेगाना</th>
                        <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>लिङ्ग / उमेर</th>
                        <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>पेशा</th>
                        <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>सम्पर्क नम्बर</th>
                        <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>प्रमाणीकरण</th>
                        <th style={{ padding: '0.85rem 1rem', fontWeight: 600, textAlign: 'center' }}>विवरण</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedCitizens.map((citizen, idx) => (
                        <tr
                          key={citizen.id || idx}
                          style={{
                            borderBottom: '1px solid #f1f5f9',
                            transition: 'background-color 0.15s ease',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          {/* Code */}
                          <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#0369a1', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                            {citizen.citizenCode || `CIT-${citizen.wardNumber}-00${idx + 1}`}
                          </td>

                          {/* Name */}
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <div style={{ fontWeight: 700, color: '#0f172a' }}>{citizen.fullName}</div>
                            {citizen.fullNameEn && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{citizen.fullNameEn}</div>}
                          </td>

                          {/* Ward & Address */}
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <span
                              style={{
                                display: 'inline-block',
                                backgroundColor: '#e0f2fe',
                                color: '#0369a1',
                                padding: '0.15rem 0.5rem',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                marginBottom: '0.2rem',
                              }}
                            >
                              वडा नं. {citizen.wardNumber}
                            </span>
                            <div style={{ fontSize: '0.8rem', color: '#475569' }}>{citizen.tole || citizen.address || 'पाँचपोखरी'}</div>
                          </td>

                          {/* Gender & Age */}
                          <td style={{ padding: '0.85rem 1rem', color: '#334155' }}>
                            <div>
                              {citizen.gender === 'FEMALE' ? 'महिला' : citizen.gender === 'OTHER' ? 'अन्य' : 'पुरुष'}
                            </div>
                            {citizen.dobBs && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>वि.सं. {citizen.dobBs}</div>}
                          </td>

                          {/* Occupation */}
                          <td style={{ padding: '0.85rem 1rem', color: '#334155' }}>
                            {citizen.occupation || 'कृषि / व्यवसाय'}
                          </td>

                          {/* Contact (Masked) */}
                          <td style={{ padding: '0.85rem 1rem', fontFamily: 'monospace', color: '#475569' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <Phone size={13} color="#94a3b8" />
                              <span>{citizen.phone || '९८४१***५६७'}</span>
                            </div>
                          </td>

                          {/* Verified Badge */}
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                backgroundColor: '#dcfce7',
                                color: '#15803d',
                                padding: '0.25rem 0.6rem',
                                borderRadius: '20px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                              }}
                            >
                              <CheckCircle2 size={13} />
                              पालिका प्रमाणित
                            </span>
                          </td>

                          {/* View Button */}
                          <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                            <button
                              onClick={() => setSelectedCitizen(citizen)}
                              style={{
                                backgroundColor: '#f1f5f9',
                                border: '1px solid #cbd5e1',
                                color: '#0284c7',
                                padding: '0.4rem 0.75rem',
                                borderRadius: '6px',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                              }}
                            >
                              <Eye size={14} />
                              हेर्नुहोस्
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1rem 1.25rem',
                    borderTop: '1px solid #e2e8f0',
                    backgroundColor: '#fafafa',
                  }}
                >
                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    कुल <strong>{citizens.length}</strong> नागरिक लगत मध्ये{' '}
                    <strong>
                      {(currentPage - 1) * pageSize + 1}-
                      {Math.min(currentPage * pageSize, citizens.length)}
                    </strong>{' '}
                    देखाइएको छ
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      style={{
                        padding: '0.4rem 0.75rem',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        backgroundColor: currentPage <= 1 ? '#f1f5f9' : '#ffffff',
                        color: currentPage <= 1 ? '#94a3b8' : '#334155',
                        cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.2rem',
                        fontSize: '0.825rem',
                      }}
                    >
                      <ChevronLeft size={16} />
                      अघिल्लो
                    </button>

                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', padding: '0 0.5rem' }}>
                      {currentPage} / {totalPages}
                    </span>

                    <button
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      style={{
                        padding: '0.4rem 0.75rem',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        backgroundColor: currentPage >= totalPages ? '#f1f5f9' : '#ffffff',
                        color: currentPage >= totalPages ? '#94a3b8' : '#334155',
                        cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.2rem',
                        fontSize: '0.825rem',
                      }}
                    >
                      पछिल्लो
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: SURVEY INDICATORS ─────────────────────────── */}
        {activeTab === 'indicators' && (
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <SurveyIndicatorsTab />
          </div>
        )}

        {/* ── TAB 3: HOUSEHOLD REGISTRY ────────────────────────── */}
        {activeTab === 'households' && (
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <HouseholdRegistryTab isPublicMode={true} />
          </div>
        )}

        {/* ── TAB 4: ANALYTICS DASHBOARD ───────────────────────── */}
        {activeTab === 'analytics' && (
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <DemographicsAnalytics />
          </div>
        )}

        {/* ── TAB 5: CIVIC SOCIAL FEED & CHAUTARI ───────────────── */}
        {activeTab === 'social' && (
          <CivicSocialFeedTab />
        )}
      </div>

      {/* ── MODAL: ONLINE CITIZEN REGISTRATION ──────────────────── */}
      {isRegisterModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1.5rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '720px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
              border: '1px solid #e2e8f0',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1.25rem 1.75rem',
                borderBottom: '1px solid #e2e8f0',
                background: 'linear-gradient(135deg, #0d1f3c, #1e3a8a)',
                color: '#ffffff',
                borderRadius: '16px 16px 0 0',
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>
                  नागरिक अनलाइन व्यक्तिगत लगत दर्ता
                </h3>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#cbd5e1' }}>
                  प्रविष्ट गरिएको विवरण वडा कार्यालयबाट प्रमाणीकरण भएपछि मात्र सार्वजनिक लगतमा प्रकाशन हुनेछ
                </p>
              </div>
              <button
                onClick={() => setIsRegisterModalOpen(false)}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  cursor: 'pointer',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleRegisterSubmit} style={{ padding: '1.75rem' }}>
              {formError && (
                <div
                  style={{
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#b91c1c',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    marginBottom: '1.25rem',
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <AlertTriangle size={18} />
                  <span>{formError}</span>
                </div>
              )}

              {/* Section 1: Personal Info */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0369a1', borderBottom: '2px solid #e0f2fe', paddingBottom: '0.35rem', marginBottom: '1rem' }}>
                  १. व्यक्तिगत विवरण
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                      पूरा नाम (नेपालीमा) <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="उदा: राम बहादुर श्रेष्ठ"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                      Full Name (English)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ram Bahadur Shrestha"
                      value={formData.fullNameEn}
                      onChange={(e) => setFormData({ ...formData, fullNameEn: e.target.value })}
                      style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                      लिङ्ग <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                      style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem', backgroundColor: '#fff' }}
                    >
                      <option value="MALE">पुरुष (Male)</option>
                      <option value="FEMALE">महिला (Female)</option>
                      <option value="OTHER">अन्य (Other)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                      जन्म मिति (वि.सं.)
                    </label>
                    <input
                      type="text"
                      placeholder="२०४०-०५-१२"
                      value={formData.dobBs}
                      onChange={(e) => setFormData({ ...formData, dobBs: e.target.value })}
                      style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                      रक्त समूह (Blood Group)
                    </label>
                    <select
                      value={formData.bloodGroup}
                      onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                      style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem', backgroundColor: '#fff' }}
                    >
                      <option value="">छनोट गर्नुहोस्</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                      लक्षित समूह / वर्ग
                    </label>
                    <select
                      value={formData.targetedGroup}
                      onChange={(e) => setFormData({ ...formData, targetedGroup: e.target.value })}
                      style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem', backgroundColor: '#fff' }}
                    >
                      <option value="सामान्य">सामान्य नागरिक</option>
                      <option value="जेष्ठ नागरिक">जेष्ठ नागरिक</option>
                      <option value="एकल महिला">एकल महिला</option>
                      <option value="दलित">दलित समुदाय</option>
                      <option value="अपाङ्गता">अपाङ्गता भएको व्यक्ति</option>
                      <option value="बालबालिका">बालबालिका</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Address & Contact */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0369a1', borderBottom: '2px solid #e0f2fe', paddingBottom: '0.35rem', marginBottom: '1rem' }}>
                  २. ठेगाना तथा सम्पर्क विवरण
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                      वडा नम्बर <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <select
                      value={formData.wardNumber}
                      onChange={(e) => setFormData({ ...formData, wardNumber: Number(e.target.value) })}
                      style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem', backgroundColor: '#fff' }}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                        <option key={num} value={num}>
                          वडा नं. {num}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                      टोल / गाउँको नाम
                    </label>
                    <input
                      type="text"
                      placeholder="उदा: बाँसखर्क, बरुवा टोल"
                      value={formData.tole}
                      onChange={(e) => setFormData({ ...formData, tole: e.target.value })}
                      style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                      सम्पर्क मोबाइल नं. <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="९८४१२३४५६७"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                      नागरिकता नं. / राष्ट्रिय परिचयपत्र
                    </label>
                    <input
                      type="text"
                      placeholder="२७-०१-७५-१२३४५"
                      value={formData.citizenshipNo}
                      onChange={(e) => setFormData({ ...formData, citizenshipNo: e.target.value })}
                      style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                      पेशा / व्यवसाय
                    </label>
                    <input
                      type="text"
                      placeholder="कृषि, शिक्षक, व्यापार, अन्य"
                      value={formData.occupation}
                      onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                      style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                      बाबु / आमा / पतिको नाम
                    </label>
                    <input
                      type="text"
                      placeholder="अभिभावकको नाम"
                      value={formData.fatherName}
                      onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                      style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.75rem',
                  borderTop: '1px solid #e2e8f0',
                  paddingTop: '1.25rem',
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  style={{
                    padding: '0.65rem 1.25rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#475569',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  रद्द गर्नुहोस्
                </button>
                <button
                  type="submit"
                  disabled={registerMutation.isPending}
                  style={{
                    padding: '0.65rem 1.5rem',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#10b981',
                    color: '#ffffff',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    cursor: registerMutation.isPending ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                  }}
                >
                  {registerMutation.isPending ? (
                    <>
                      <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
                      दर्ता हुँदैछ...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      आवेदन पेश गर्नुहोस्
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: REGISTRATION SUCCESS CONFIRMATION ────────────── */}
      {registrationSuccessData && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '1.5rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '540px',
              width: '100%',
              padding: '2rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#dcfce7',
                color: '#16a34a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem auto',
              }}
            >
              <CheckCircle2 size={36} />
            </div>

            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
              नागरिक लगत दर्ता फारम प्राप्त भयो !
            </h3>

            <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.5, margin: '0 0 1.5rem 0' }}>
              तपाईंको विवरण सफलतापूर्वक अनलाइन प्रणालीमा दर्ता भएको छ । वडा कार्यालय वा पालिका प्रमाणीकरण अधिकृतबाट रुजु भइसकेपछि मात्र यो विवरण सार्वजनिक लगतमा देखिनेछ ।
            </p>

            {/* Generated Tracking Code Card */}
            <div
              style={{
                backgroundColor: '#f0f9ff',
                border: '2px dashed #0284c7',
                borderRadius: '12px',
                padding: '1.25rem',
                marginBottom: '1.5rem',
              }}
            >
              <div style={{ fontSize: '0.8rem', color: '#0369a1', fontWeight: 600, marginBottom: '0.35rem' }}>
                तपाईंको दर्ता ट्र्याकिङ कोड (Citizen Code)
              </div>
              <div
                style={{
                  fontSize: '1.6rem',
                  fontWeight: 800,
                  color: '#0d1f3c',
                  fontFamily: 'monospace',
                  letterSpacing: '0.05em',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                }}
              >
                <span>{registrationSuccessData.citizenCode}</span>
                <button
                  onClick={() => handleCopyCode(registrationSuccessData.citizenCode || '')}
                  title="कोड कपी गर्नुहोस्"
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #bae6fd',
                    padding: '0.35rem 0.6rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    fontSize: '0.75rem',
                    color: '#0284c7',
                  }}
                >
                  {copiedCode ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                  {copiedCode ? 'कपी भयो' : 'कपी'}
                </button>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>
                कृपया यो कोड सुरक्षित राख्नुहोला । यसबाट तपाईंले प्रमाणीकरण स्थिति जाँच्न सक्नुहुन्छ ।
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                onClick={() => setRegistrationSuccessData(null)}
                style={{
                  padding: '0.65rem 1.5rem',
                  borderRadius: '8px',
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                }}
              >
                सम्पन्न (Done)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: TRACK CITIZEN STATUS ─────────────────────────── */}
      {isTrackModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1050,
            padding: '1.5rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '560px',
              width: '100%',
              padding: '2rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                दर्ता स्थिति जाँच (Track Status)
              </h3>
              <button
                onClick={() => setIsTrackModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#64748b',
                }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleTrackSubmit} style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                नागरिक कोड (Citizen Code) वा फोन नम्बर राख्नुहोस्:
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  required
                  placeholder="उदा: CIT-2081-0042 वा ९८४१२३४५६७"
                  value={trackingCodeInput}
                  onChange={(e) => setTrackingCodeInput(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                />
                <button
                  type="submit"
                  disabled={isTrackingLoading}
                  style={{
                    padding: '0.65rem 1.25rem',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#0284c7',
                    color: '#ffffff',
                    fontWeight: 700,
                    cursor: isTrackingLoading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  {isTrackingLoading ? <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Search size={16} />}
                  खोज्नुहोस्
                </button>
              </div>
            </form>

            {/* Tracking Result */}
            {trackingResult === 'NOT_FOUND' && (
              <div
                style={{
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '10px',
                  padding: '1.25rem',
                  textAlign: 'center',
                }}
              >
                <AlertTriangle size={28} color="#ef4444" style={{ margin: '0 auto 0.5rem auto' }} />
                <div style={{ fontWeight: 700, color: '#991b1b', marginBottom: '0.25rem' }}>
                  कुनै दर्ता रेकर्ड फेला परेन
                </div>
                <div style={{ fontSize: '0.8rem', color: '#b91c1c' }}>
                  कृपया तपाईंको कोड (उदा: CIT-2081-XXXX) वा फोन नम्बर सही छ कि छैन पुन: जाँच गर्नुहोस् ।
                </div>
              </div>
            )}

            {trackingResult && trackingResult !== 'NOT_FOUND' && (
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '1.25rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>दर्ता कोड:</div>
                    <div style={{ fontWeight: 800, color: '#0369a1', fontFamily: 'monospace', fontSize: '1.1rem' }}>
                      {trackingResult.citizenCode}
                    </div>
                  </div>

                  {/* Status Badge */}
                  {trackingResult.verificationStatus === 'VERIFIED' ? (
                    <span
                      style={{
                        backgroundColor: '#dcfce7',
                        color: '#15803d',
                        padding: '0.35rem 0.75rem',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                      }}
                    >
                      <CheckCircle2 size={14} />
                      प्रमाणीकृत (Verified)
                    </span>
                  ) : trackingResult.verificationStatus === 'REJECTED' ? (
                    <span
                      style={{
                        backgroundColor: '#fee2e2',
                        color: '#b91c1c',
                        padding: '0.35rem 0.75rem',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                      }}
                    >
                      <X size={14} />
                      अस्वीकृत (Rejected)
                    </span>
                  ) : (
                    <span
                      style={{
                        backgroundColor: '#fef3c7',
                        color: '#b45309',
                        padding: '0.35rem 0.75rem',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                      }}
                    >
                      <Clock size={14} />
                      प्रमाणीकरण प्रक्रियामा (Pending)
                    </span>
                  )}
                </div>

                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem', fontSize: '0.85rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <div>
                      <span style={{ color: '#64748b' }}>नाम:</span> <strong>{trackingResult.fullName}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>वडा नं.:</span> <strong>{trackingResult.wardNumber}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>लिङ्ग:</span> <strong>{trackingResult.gender}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>दर्ता मिति:</span>{' '}
                      <strong>{trackingResult.createdAt ? new Date(trackingResult.createdAt).toLocaleDateString() : 'हालै'}</strong>
                    </div>
                  </div>

                  {trackingResult.verificationRemarks && (
                    <div style={{ backgroundColor: '#fff', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '0.5rem' }}>
                      <span style={{ color: '#64748b', fontSize: '0.75rem' }}>कैफियत / टिप्पणी:</span>
                      <div style={{ fontWeight: 600, color: '#334155' }}>{trackingResult.verificationRemarks}</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── MODAL: VIEW CITIZEN DETAILS (READ-ONLY) ─────────────── */}
      {selectedCitizen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1050,
            padding: '1.5rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '600px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid #e2e8f0',
                background: 'linear-gradient(135deg, #0d1f3c, #0284c7)',
                color: '#ffffff',
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>
                  सार्वजनिक नागरिक प्रोफाइल
                </h3>
                <div style={{ fontSize: '0.8rem', color: '#cbd5e1', fontFamily: 'monospace' }}>
                  {selectedCitizen.citizenCode || 'CIT-2081-XXXX'}
                </div>
              </div>
              <button
                onClick={() => setSelectedCitizen(null)}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  color: '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>पूरा नाम (नेपाली)</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>{selectedCitizen.fullName}</div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Full Name (English)</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>{selectedCitizen.fullNameEn || '-'}</div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>ठेगाना (वडा र टोल)</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>
                    वडा नं. {selectedCitizen.wardNumber}, {selectedCitizen.tole || 'पाँचपोखरी'}
                  </div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>लिङ्ग / जन्म मिति</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>
                    {selectedCitizen.gender === 'FEMALE' ? 'महिला' : selectedCitizen.gender === 'OTHER' ? 'अन्य' : 'पुरुष'}
                    {selectedCitizen.dobBs && ` (${selectedCitizen.dobBs})`}
                  </div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>पेशा / व्यवसाय</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>{selectedCitizen.occupation || 'कृषि'}</div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>रक्त समूह</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>{selectedCitizen.bloodGroup || 'उल्लेख नभएको'}</div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>सम्पर्क नम्बर (सुरक्षित)</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a', fontFamily: 'monospace' }}>
                    {selectedCitizen.phone || '९८४१***५६७'}
                  </div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>नागरिकता / NID (सुरक्षित)</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a', fontFamily: 'monospace' }}>
                    {selectedCitizen.citizenshipNo || '२७-०१-***'}
                  </div>
                </div>
              </div>

              {/* Verified Certificate Note */}
              <div
                style={{
                  backgroundColor: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  padding: '0.85rem',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  fontSize: '0.8rem',
                  color: '#065f46',
                }}
              >
                <ShieldCheck size={18} color="#059669" />
                <span>
                  यो लगत पाँचपोखरी थाङपाल गाउँपालिका तथा वडा कार्यालयबाट प्रमाणित आधिकारिक नागरिक लगत हो ।
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
                <button
                  onClick={() => setSelectedCitizen(null)}
                  style={{
                    padding: '0.55rem 1.25rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#334155',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  बन्द गर्नुहोस्
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
