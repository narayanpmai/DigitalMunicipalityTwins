import React, { useState, useMemo } from 'react';
import { NepaliDatePicker } from '../../components/common/NepaliDatePicker';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FileText,
  MapPin,
  Building,
  Search,
  Download,
  AlertCircle,
  FileCheck,
  Calendar,
  MessageSquare,
  Briefcase,
  Plus,
  CheckCircle2,
  QrCode,
  Printer,
  Users,
  HelpCircle,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  X,
  Coins,
  Sparkles,
  Phone,
  User,
  CreditCard,
  FileSpreadsheet,
  Layers,
  Scale,
  Check,
  Info,
} from 'lucide-react';
import { api } from '../../api/client';
import { Tender } from '../../features/procurement/ProcurementPage';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const PublicProcurement: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Active Main Navigation Tab
  const [activeTab, setActiveTab] = useState<'tenders' | 'apply' | 'track' | 'calculator' | 'guidelines'>('tenders');

  React.useEffect(() => {
    if (activeTab === 'apply' && !isAuthenticated) {
      alert('तपाईंले ई-बोलपत्रमा आवेदन दिनको लागि पहिले दर्ता (Register) गर्नुपर्दछ।');
      navigate('/register');
    }
  }, [activeTab, isAuthenticated, navigate]);

  // Filter States for Tender Listing
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWard, setSelectedWard] = useState('all');
  const [selectedMethod, setSelectedMethod] = useState('all');

  // Pre-bid Query Modal
  const [showQueryModal, setShowQueryModal] = useState<Tender | null>(null);
  const [queryText, setQueryText] = useState('');

  // Fetch Public Tenders
  const { data: tenders = [], isLoading } = useQuery<Tender[]>({
    queryKey: ['public-tenders'],
    queryFn: async () => {
      const res: any = await api.get('/procurement');
      return Array.isArray(res) ? res : (res?.data || []);
    },
  });

  // Filter Active / All Tenders
  const filteredTenders = useMemo(() => {
    return tenders.filter((t) => {
      const matchSearch =
        t.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.procurementNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.sector?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchWard = selectedWard === 'all' || (t.wardNo && t.wardNo.includes(selectedWard));
      const matchMethod =
        selectedMethod === 'all' ||
        t.method === selectedMethod ||
        t.procurementMethod?.includes(selectedMethod);

      return matchSearch && matchWard && matchMethod;
    });
  }, [tenders, searchTerm, selectedWard, selectedMethod]);

  // Pre-bid Query Mutation
  const submitQueryMutation = useMutation({
    mutationFn: async (data: { tenderId: string; query: string }) => {
      return new Promise((resolve) => setTimeout(resolve, 800));
    },
    onSuccess: () => {
      alert('तपाईंको प्रश्न वा जिज्ञासा सफलतापूर्वक दर्ता भयो। पालिकाको खरिद शाखाले चाँडै जवाफ प्रकाशित गर्नेछ।');
      setShowQueryModal(null);
      setQueryText('');
    },
  });

  // ── Online Bid & Application Submission Wizard State ─────────────────────────
  const [applyStep, setApplyStep] = useState(1);
  const [applySuccessData, setApplySuccessData] = useState<any | null>(null);

  const [applyForm, setApplyForm] = useState({
    tenderId: '',
    applicantType: 'निर्माण व्यवसायी / फर्म (Contractor / Firm)',
    applicantName: '',
    contactPerson: '',
    phone: '',
    email: '',
    panVat: '',
    citizenshipNo: '',
    address: 'पाँचपोखरी थाङपाल गाउँपालिका, वडा नं ',
    bidAmount: 0,
    bidSecurityBank: 'नेपाल बैंक लिमिटेड, मेलम्ची शाखा',
    bidSecurityVoucherNo: '',
    bidSecurityAmount: 0,
    bidSecurityExpiryDate: '२०८१-०९-३०',
    attachedDocs: ['फर्म दर्ता प्रमाणपत्र', 'कर चुक्ता रसिद २०८०/८१', 'धरौटी बैंक ग्यारेन्टी भौचर'],
    declarationAgreed: false,
    remarks: '',
  });

  // Selected Tender details for application
  const currentTenderForApply = useMemo(() => {
    return tenders.find((t) => t.id === applyForm.tenderId) || tenders[0] || null;
  }, [tenders, applyForm.tenderId]);

  // When tender changes, auto-set default bid security amount
  const handleSelectTender = (tender: Tender) => {
    const est = Number(tender.estimatedAmountNPR || tender.estimatedAmount || 0);
    const sec = Number(tender.bidSecurityAmount || Math.round(est * 0.025));
    setApplyForm((prev) => ({
      ...prev,
      tenderId: tender.id,
      bidAmount: Math.round(est * 0.9), // default 10% below estimate
      bidSecurityAmount: sec,
    }));
    setActiveTab('apply');
    setApplyStep(1);
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  // Difference Percentage between Bid and Estimate
  const bidDiff = useMemo(() => {
    if (!currentTenderForApply) return { diffPct: 0, isBelow: false, diffAmount: 0 };
    const est = Number(currentTenderForApply.estimatedAmountNPR || currentTenderForApply.estimatedAmount || 0);
    const bid = Number(applyForm.bidAmount) || 0;
    if (est <= 0 || bid <= 0) return { diffPct: 0, isBelow: false, diffAmount: 0 };
    const diffAmount = est - bid;
    const diffPct = Math.round((diffAmount / est) * 10000) / 100;
    return { diffPct: Math.abs(diffPct), isBelow: diffAmount >= 0, diffAmount: Math.abs(diffAmount) };
  }, [currentTenderForApply, applyForm.bidAmount]);

  // Submit Bid Mutation
  const submitBidMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res: any = await api.post(`/procurement/${payload.tenderId}/submit-bid`, payload);
      return res.data || res;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['public-tenders'] });
      setApplySuccessData(data);
    },
    onError: () => {
      alert('ई-बोलपत्र दर्ता गर्न असफल भयो। कृपया सबै अनिवार्य विवरणहरू रुजु गर्नुहोस्।');
    },
  });

  // ── Bid Tracking State ───────────────────────────────────────────────────────
  const [trackQuery, setTrackQuery] = useState('');
  const [trackedBidResult, setTrackedBidResult] = useState<any | null>(null);
  const [trackNotFound, setTrackNotFound] = useState(false);

  const handleTrackBid = () => {
    setTrackNotFound(false);
    setTrackedBidResult(null);
    const q = trackQuery.trim().toLowerCase();
    if (!q) return;

    // Search across all tenders and their biddersList
    for (const tender of tenders) {
      const list = tender.biddersList || [];
      for (const b of list) {
        const subNo = (b.submissionNo || '').toLowerCase();
        const pan = (b.panVat || b.awardedVendorPan || '').toLowerCase();
        const name = (b.name || '').toLowerCase();
        const phone = (b.phone || '').toLowerCase();

        if (subNo.includes(q) || pan.includes(q) || name.includes(q) || phone.includes(q)) {
          setTrackedBidResult({
            bidder: b,
            tender: tender,
          });
          return;
        }
      }
    }
    setTrackNotFound(true);
  };

  // ── Fee & Guarantee Calculator State ─────────────────────────────────────────
  const [calcEstAmount, setCalcEstAmount] = useState<number>(10000000);
  const calculatedParameters = useMemo(() => {
    const est = Number(calcEstAmount) || 0;
    const bidSecurity25 = Math.round(est * 0.025);
    const perfSecurity5 = Math.round(est * 0.05);
    let docFee = 3000;
    if (est > 20000000) docFee = 5000;
    else if (est > 100000000) docFee = 10000;
    else if (est <= 2000000) docFee = 1000;

    return {
      bidSecurity: bidSecurity25,
      perfSecurity: perfSecurity5,
      docFee: docFee,
    };
  }, [calcEstAmount]);

  return (
    <div style={{ fontFamily: "'Noto Sans Devanagari', 'Inter', sans-serif", background: '#f8fafc', minHeight: '100vh', paddingBottom: '5rem' }}>
      
      {/* ── Hero Section ────────────────────────────────────────────── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0c204c 100%)',
          color: '#ffffff',
          padding: '3.5rem 1.5rem 4rem 1.5rem',
          textAlign: 'center',
          position: 'relative',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <div style={{ width: '100%', maxWidth: '100%', margin: '0' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(59, 130, 246, 0.2)', padding: '0.45rem 1.1rem', borderRadius: '24px', color: '#93c5fd', fontWeight: 700, fontSize: '0.85rem', marginBottom: '1.25rem', border: '1px solid rgba(147, 197, 253, 0.3)' }}>
            <Briefcase size={16} /> खुल्ला ई-बोलपत्र तथा ठेक्का व्यवस्थापन प्रणाली (e-Procurement Portal)
          </div>

          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, margin: '0 0 1rem 0', lineHeight: 1.3, letterSpacing: '-0.02em' }}>
            पाँचपोखरी थाङपाल गाउँपालिका ई-बोलपत्र पोर्टल
          </h1>

          <p style={{ fontSize: '1.05rem', color: '#cbd5e1', lineHeight: 1.6, margin: '0 auto', maxWidth: '760px' }}>
            सार्वजनिक खरिद ऐन २०६३, नियमावली २०६४, तथा स्थानीय उपभोक्ता समिति कार्यविधि बमोजिम निर्माण व्यवसायी, आपूर्तिकर्ता तथा नागरिक उपभोक्ता समितिका लागि अनलाइन बोलपत्र दर्ता र ट्र्याकिङ सेवा।
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#6ee7b7', border: '1px solid rgba(16, 185, 129, 0.4)', padding: '0.35rem 0.85rem', borderRadius: '16px', fontSize: '0.78rem', fontWeight: 700 }}>
              ✓ सार्वजनिक खरिद ऐन २०६३
            </span>
            <span style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#93c5fd', border: '1px solid rgba(59, 130, 246, 0.4)', padding: '0.35rem 0.85rem', borderRadius: '16px', fontSize: '0.78rem', fontWeight: 700 }}>
              ✓ PPMO e-GP मापदण्ड
            </span>
            <span style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fcd34d', border: '1px solid rgba(245, 158, 11, 0.4)', padding: '0.35rem 0.85rem', borderRadius: '16px', fontSize: '0.78rem', fontWeight: 700 }}>
              ✓ नागरिक उपभोक्ता समिति योजना आवेदन
            </span>
          </div>

          {/* Quick Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                if (tenders.length > 0 && !applyForm.tenderId) {
                  setApplyForm((prev) => ({ ...prev, tenderId: tenders[0].id }));
                }
                setActiveTab('apply');
              }}
              style={{
                padding: '0.9rem 1.8rem',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                border: 'none',
                fontSize: '1rem',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <Plus size={20} /> अनलाइन बोलपत्र / योजना आवेदन दिनुहोस्
            </button>

            <button
              onClick={() => setActiveTab('track')}
              style={{
                padding: '0.9rem 1.8rem',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.12)',
                backdropFilter: 'blur(8px)',
                color: '#ffffff',
                border: '1.5px solid rgba(255,255,255,0.3)',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.22)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.12)')}
            >
              <Search size={18} /> पेश भएको ई-बोलपत्र ट्र्याक गर्नुहोस्
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Navigation Grid (5 Tabs) ─────────────────────────── */}
      <div style={{ width: '100%', maxWidth: '100%', margin: '-2rem 0 0 0', padding: '0 0.5rem', position: 'relative', zIndex: 10 }}>
        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            boxShadow: '0 12px 30px -8px rgba(0,0,0,0.12)',
            border: '1.5px solid #e2e8f0',
            padding: '0.6rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '0.5rem',
          }}
        >
          {[
            { id: 'tenders', label: '📋 खुलेका बोलपत्रहरू', desc: `चालू सूचना तथा BOQ (${tenders.length})` },
            { id: 'apply', label: '📝 अनलाइन बिड आवेदन', desc: 'व्यवसायी / उपभोक्ता समिति' },
            { id: 'track', label: '🔍 ई-बोलपत्र ट्र्याकिङ', desc: 'दर्ता स्थिति तथा नतिजा' },
            { id: 'calculator', label: '🧮 धरौटी क्यालकुलेटर', desc: '२.५% बिड र दस्तुर हिसाब' },
            { id: 'guidelines', label: '📚 मापदण्ड तथा निर्देशिका', desc: 'आवश्यक कागजात चेकलिस्ट' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: '12px',
                  border: 'none',
                  background: isActive ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #1e3a8a 100%)' : 'transparent',
                  color: isActive ? '#ffffff' : '#334155',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.15s ease',
                  boxShadow: isActive ? '0 4px 14px rgba(30, 58, 138, 0.25)' : 'none',
                }}
              >
                <div style={{ fontSize: '0.92rem', fontWeight: 800 }}>{tab.label}</div>
                <div style={{ fontSize: '0.72rem', opacity: isActive ? 0.9 : 0.65, marginTop: '2px' }}>
                  {tab.desc}
                </div>
              </button>
            );
          })}
        </div>

        {/* ── TAB 1: हाल खुलेका बोलपत्रहरूको सूची (Active Tenders Listing) ─────── */}
        {activeTab === 'tenders' && (
          <div style={{ marginTop: '2.5rem' }}>
            {/* Filters Row */}
            <div
              style={{
                background: '#ffffff',
                padding: '1.25rem 1.5rem',
                borderRadius: '14px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1rem',
                border: '1.5px solid #e2e8f0',
                alignItems: 'center',
                marginBottom: '2rem',
              }}
            >
              <div style={{ position: 'relative' }}>
                <Search size={18} color="#64748b" style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="ठेक्का नं वा आयोजनाको नाम खोज्नुहोस्..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ width: '100%', padding: '0.7rem 1rem 0.7rem 2.6rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.88rem', outline: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', color: '#0f172a' }}
                />
              </div>

              <select
                value={selectedWard}
                onChange={(e) => setSelectedWard(e.target.value)}
                style={{ padding: '0.7rem 1rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.88rem', background: '#fff', outline: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', color: '#0f172a' }}
              >
                <option value="all">सबै वडाहरू (Wards 1-8)</option>
                <option value="पालिका स्तरीय">पालिका स्तरीय योजनाहरू</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
                  <option key={w} value={String(w)}>वडा नं {w}</option>
                ))}
              </select>

              <select
                value={selectedMethod}
                onChange={(e) => setSelectedMethod(e.target.value)}
                style={{ padding: '0.7rem 1rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.88rem', background: '#fff', outline: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', color: '#0f172a' }}
              >
                <option value="all">सबै खरिद विधिहरू</option>
                <option value="NCB">खुला राष्ट्रिय बोलपत्र (NCB)</option>
                <option value="SQ">सिलबन्दी दरभाउ पत्र (SQ)</option>
                <option value="Direct">प्रत्यक्ष खरिद (Direct)</option>
              </select>
            </div>

            {/* Tender Listing Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ background: '#2563eb', width: '8px', height: '24px', borderRadius: '4px' }}></span>
                खुल्ला बोलपत्र तथा ठेक्का आह्वानहरू ({filteredTenders.length})
              </h2>
              <span style={{ fontSize: '0.82rem', color: '#475569' }}>
                इन्जिनियरिङ लागत अनुमान तथा योग्यता मापदण्ड सहित
              </span>
            </div>

            {isLoading ? (
              <div style={{ textAlign: 'center', padding: '4rem', color: '#475569' }}>लोड हुँदैछ... (Loading Tenders...)</div>
            ) : filteredTenders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem', background: '#fff', borderRadius: '12px', border: '1px dashed #cbd5e1', color: '#475569' }}>
                तपाईंले खोज्नुभएको मापदण्डमा कुनै बोलपत्र फेला परेन।
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
                {filteredTenders.map((t, i) => {
                  const isClosed = t.status !== 'advertised' && t.status !== 'ADVERTISED';
                  const estAmount = t.estimatedAmountNPR || t.estimatedAmount || 0;

                  return (
                    <div
                      key={t.id || i}
                      style={{
                        background: '#ffffff',
                        borderRadius: '14px',
                        overflow: 'hidden',
                        border: '1.5px solid #e2e8f0',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.03)',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                      }}
                    >
                      {/* Card Header */}
                      <div style={{ padding: '1.25rem', borderBottom: '1px solid #f1f5f9', background: '#fafaf9' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1e3a8a', background: '#eff6ff', padding: '0.2rem 0.65rem', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
                            {t.procurementNo || t.tenderNumber}
                          </span>
                          {isClosed ? (
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#991b1b', background: '#fef2f2', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                              बन्द भइसकेको (Closed)
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#166534', background: '#dcfce7', padding: '0.2rem 0.5rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              <span style={{ display: 'block', width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }}></span> खुला छ (Active)
                            </span>
                          )}
                        </div>

                        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0', lineHeight: 1.4 }}>
                          {t.title}
                        </h3>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.8rem', color: '#475569' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><MapPin size={14} /> वडा नं: {t.wardNo}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Building size={14} /> {t.sector}</span>
                        </div>
                      </div>

                      {/* Financial & Timeline Details */}
                      <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                          <div>
                            <div style={{ fontSize: '0.72rem', color: '#475569', fontWeight: 600 }}>लागत अनुमान (Estimate)</div>
                            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                              रु. {Number(estAmount).toLocaleString('ne-NP')}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.72rem', color: '#475569', fontWeight: 600 }}>खरिद विधि (Method)</div>
                            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#1e3a8a' }}>
                              {t.method || t.procurementMethod || 'NCB'}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                          <div>
                            <div style={{ fontSize: '0.7rem', color: '#475569', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                              <Calendar size={12} /> प्रकाशित मिति
                            </div>
                            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>
                              {t.advertisedDateBs || t.publishDateBs || 'मिति उपलब्ध छैन'}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                              <AlertCircle size={12} /> अन्तिम म्याद
                            </div>
                            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#b91c1c' }}>
                              {t.deadlineDateBs || t.submissionDeadlineBs || 'मिति उपलब्ध छैन'}
                            </div>
                          </div>
                        </div>

                        {/* Bid Security & Requirements */}
                        <div style={{ background: '#fefce8', border: '1px solid #fef08a', padding: '0.8rem', borderRadius: '8px', fontSize: '0.78rem', color: '#854d0e' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, marginBottom: '0.3rem' }}>
                            <span>धरौटी (२.५% Bid Security):</span>
                            <span>रु. {Number(t.bidSecurityAmount || Math.round(estAmount * 0.025)).toLocaleString('ne-NP')}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#a16207', fontSize: '0.74rem' }}>
                            <span>बोलपत्र फारम दस्तुर:</span>
                            <span>रु. {Number(t.bidDocFeeNPR || t.bidDocFee || 3000).toLocaleString('ne-NP')}</span>
                          </div>
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                        {/* Primary Citizen Action: Apply Online Button */}
                        <button
                          onClick={() => handleSelectTender(t)}
                          disabled={isClosed}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.45rem',
                            padding: '0.75rem',
                            background: isClosed ? '#cbd5e1' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: isClosed ? 'not-allowed' : 'pointer',
                            fontWeight: 800,
                            fontSize: '0.9rem',
                            boxShadow: isClosed ? 'none' : '0 4px 12px rgba(16, 185, 129, 0.3)',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <Plus size={18} />
                          {isClosed ? 'बोलपत्र पेश गर्ने म्याद समाप्त' : '📝 अनलाइन बिड / आवेदन पेश गर्नुहोस्'}
                        </button>

                        {/* Secondary Actions: Notice & BOQ Download */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                          <button
                            onClick={() => {
                              alert(`बोलपत्र आह्वान सूचना डाउनलोड हुँदैछ:\nNotice_${t.procurementNo || 'tender'}.pdf`);
                            }}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', padding: '0.55rem', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.76rem' }}
                            title="बोलपत्र आह्वान सूचना (Notice)"
                          >
                            <FileText size={14} /> 📄 सूचना (IFB)
                          </button>
                          <button
                            onClick={() => {
                              alert(`बिल अफ क्वान्टिटी (BOQ) डाउनलोड हुँदैछ:\nBOQ_${t.procurementNo || 'tender'}.xlsx`);
                            }}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', padding: '0.55rem', background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.76rem' }}
                            title="परिमाण विवरण (BOQ) डाउनलोड"
                          >
                            <Download size={14} /> 📊 BOQ डाउनलोड
                          </button>
                        </div>

                        <button
                          onClick={() => setShowQueryModal(t)}
                          style={{ background: 'transparent', border: 'none', paddingTop: '0.4rem', fontSize: '0.78rem', color: '#2563eb', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}
                        >
                          <MessageSquare size={13} /> सोधपुछ वा प्राविधिक जिज्ञासा राख्नुहोस्
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: अनलाइन बोलपत्र / योजना आवेदन (Apply Online Wizard) ───────── */}
        {activeTab === 'apply' && (
          <div style={{ marginTop: '2.5rem' }}>
            <div
              style={{
                background: '#ffffff',
                padding: '2rem',
                borderRadius: '16px',
                border: '1.5px solid #e2e8f0',
                boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
              }}
            >
              {applySuccessData ? (
                /* Application Success Receipt Slip */
                <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                  <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' }}>
                    <CheckCircle2 size={42} />
                  </div>

                  <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#166534', margin: '0 0 0.5rem 0' }}>
                    ई-बोलपत्र / योजना आवेदन सफलतापूर्वक दर्ता भयो!
                  </h2>

                  <p style={{ fontSize: '0.95rem', color: '#475569', maxWidth: '650px', margin: '0 auto 1.5rem auto' }}>
                    तपाईंको बोलपत्र पालिकाको खरिद इकाई प्रणालीमा सुरक्षित रूपमा प्राप्त भएको छ। बोलपत्र खोल्ने मितिमा मूल्याङ्कन समितिले आधिकारिक खोल्ने कार्य (Bid Opening) सम्पन्न गर्नेछ।
                  </p>

                  {/* Printable Registration Slip Container */}
                  <div
                    id="printable-bid-slip"
                    style={{
                      maxWidth: '650px',
                      margin: '0 auto 2rem auto',
                      background: '#f8fafc',
                      border: '2px solid #cbd5e1',
                      borderRadius: '14px',
                      padding: '1.75rem',
                      textAlign: 'left',
                      fontFamily: "'Noto Sans Devanagari', sans-serif",
                    }}
                  >
                    <div style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '0.78rem', color: '#475569' }}>पाँचपोखरी थाङपाल गाउँपालिका कार्यपालिकाको कार्यालय</div>
                        <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e3a8a', marginTop: '2px' }}>
                          ई-बोलपत्र दर्ता निस्सा (E-Bid Submission Slip)
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.75rem', color: '#475569' }}>दर्ता संकेत नम्बर</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#047857' }}>
                          {applySuccessData.submissionNo}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', fontSize: '0.88rem', color: '#334155' }}>
                      <div>बोलपत्र नं: <strong>{applySuccessData.tenderNo}</strong></div>
                      <div>दर्ता मिति: <strong>{applySuccessData.submittedBid?.submissionDateBs}</strong></div>
                      <div style={{ gridColumn: '1 / -1' }}>आयोजना: <strong>{applySuccessData.tenderTitle}</strong></div>
                      <div>आवेदक / फर्म: <strong>{applySuccessData.submittedBid?.name}</strong></div>
                      <div>प्यान / भ्याट नं: <strong>{applySuccessData.submittedBid?.panVat}</strong></div>
                      <div>सम्पर्क फोन: <strong>{applySuccessData.submittedBid?.phone}</strong></div>
                      <div>कबोल रकम: <strong style={{ color: '#047857', fontSize: '1rem' }}>रु. {Number(applySuccessData.submittedBid?.bidAmount).toLocaleString('ne-NP')}</strong></div>
                      <div>लागत तुलना: <strong>{applySuccessData.submittedBid?.discountPct}% घटी</strong></div>
                      <div>धरौटी रकम: <strong>रु. {Number(applySuccessData.submittedBid?.bidSecurityAmount).toLocaleString('ne-NP')}</strong></div>
                    </div>

                    <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px dashed #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: '#475569' }}>
                        <QrCode size={38} color="#1e3a8a" />
                        <div>
                          <div>प्रमाणीकरण कोड: {applySuccessData.submissionNo}</div>
                          <div>अभिलेख: PPA 2063 प्रमाणित</div>
                        </div>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 700 }}>
                        ✓ ई-हाजिरी दर्ता सुरक्षित
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.85rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => window.print()}
                      style={{ padding: '0.75rem 1.4rem', background: '#1e3a8a', color: '#ffffff', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                      <Printer size={16} /> दर्ता निस्सा प्रिन्ट गर्नुहोस् (Print Slip)
                    </button>

                    <button
                      onClick={() => {
                        setTrackQuery(applySuccessData.submissionNo);
                        setTrackedBidResult({
                          bidder: applySuccessData.submittedBid,
                          tender: applySuccessData.tender,
                        });
                        setApplySuccessData(null);
                        setActiveTab('track');
                      }}
                      style={{ padding: '0.75rem 1.4rem', background: '#059669', color: '#ffffff', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                      <Search size={16} /> दरखास्त स्थिति ट्र्याक गर्नुहोस्
                    </button>

                    <button
                      onClick={() => {
                        setApplySuccessData(null);
                        setApplyStep(1);
                      }}
                      style={{ padding: '0.75rem 1.4rem', background: '#f1f5f9', color: '#475569', border: '1.5px solid #cbd5e1', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}
                    >
                      + अर्को नयाँ बोलपत्र आवेदन भर्नुहोस्
                    </button>
                  </div>
                </div>
              ) : (
                /* Step by Step Application Wizard */
                <div>
                  <div style={{ borderBottom: '1.5px solid #f1f5f9', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                          अनलाइन ई-बोलपत्र तथा योजना आवेदन फारम (Online Bid Submission)
                        </h2>
                        <p style={{ fontSize: '0.85rem', color: '#475569', margin: '0.3rem 0 0 0' }}>
                          सार्वजनिक खरिद ऐन २०६३ बमोजिम निर्माण व्यवसायी तथा उपभोक्ता समितिले अनलाइनबाटै दरखास्त दर्ता गर्नुहोस्।
                        </p>
                      </div>
                      <span style={{ background: '#e0e7ff', color: '#3730a3', padding: '0.3rem 0.8rem', borderRadius: '16px', fontSize: '0.78rem', fontWeight: 700 }}>
                        चरण {applyStep} / ४
                      </span>
                    </div>
                  </div>

                  {/* Wizard Stepper Tabs */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '0.5rem', background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '12px', border: '1.5px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    {[
                      { step: 1, label: '१. आवेदक प्रकार र बोलपत्र' },
                      { step: 2, label: '२. फर्म तथा कानुनी विवरण' },
                      { step: 3, label: '३. कबोल रकम र बैंक धरौटी' },
                      { step: 4, label: '४. कागजात र स्वघोषणा' },
                    ].map((s) => (
                      <div
                        key={s.step}
                        onClick={() => setApplyStep(s.step)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          cursor: 'pointer',
                          color: applyStep === s.step ? '#1e3a8a' : applyStep > s.step ? '#059669' : '#94a3b8',
                          fontWeight: applyStep === s.step ? 800 : 600,
                          fontSize: '0.82rem',
                        }}
                      >
                        <span
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            background: applyStep === s.step ? '#1e3a8a' : applyStep > s.step ? '#059669' : '#cbd5e1',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                          }}
                        >
                          {applyStep > s.step ? '✓' : s.step}
                        </span>
                        <span>{s.label}</span>
                      </div>
                    ))}
                  </div>

                  {/* FORM STEP 1: Applicant Type & Tender Selection */}
                  {applyStep === 1 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      <div>
                        <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', color: '#1e293b', marginBottom: '0.5rem' }}>
                          आवेदकको प्रकार छनोट गर्नुहोस्:*
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.85rem' }}>
                          {[
                            { id: 'निर्माण व्यवसायी / फर्म (Contractor / Firm)', label: '🏢 निर्माण व्यवसायी / फर्म', desc: 'पंजीकृत इजाजतप्राप्त निर्माण कम्पनी वा सप्लायर्स' },
                            { id: 'उपभोक्ता समिति / नागरिक समूह (User Committee)', label: '👥 उपभोक्ता समिति / नागरिक समूह', desc: 'स्थानीय वडास्तरीय विकास निर्माण उपभोक्ता समिति' },
                            { id: 'परामर्शदाता / सेवा प्रदायक (Consultant)', label: '💼 परामर्शदाता / सेवा प्रदायक', desc: 'विज्ञता, सर्भे वा प्राविधिक सेवा प्रदायक' },
                          ].map((opt) => (
                            <div
                              key={opt.id}
                              onClick={() => setApplyForm({ ...applyForm, applicantType: opt.id })}
                              style={{
                                padding: '1rem',
                                borderRadius: '12px',
                                border: applyForm.applicantType === opt.id ? '2px solid #1e3a8a' : '1.5px solid #e2e8f0',
                                background: applyForm.applicantType === opt.id ? '#eff6ff' : '#ffffff',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                              }}
                            >
                              <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.92rem' }}>{opt.label}</div>
                              <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '3px' }}>{opt.desc}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', color: '#1e293b', marginBottom: '0.5rem' }}>
                          आवेदन दिन चाहेको बोलपत्र / ठेक्का छनोट गर्नुहोस्:*
                        </label>
                        <select
                          value={applyForm.tenderId}
                          onChange={(e) => {
                            const selected = tenders.find((t) => t.id === e.target.value);
                            if (selected) {
                              handleSelectTender(selected);
                            }
                          }}
                          style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.92rem', background: '#fff' }}
                        >
                          <option value="">-- उपलब्ध बोलपत्रहरू मध्ये छनोट गर्नुहोस् --</option>
                          {tenders.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.procurementNo} — {t.title} (लागत: रु. {Number(t.estimatedAmountNPR || t.estimatedAmount || 0).toLocaleString('ne-NP')})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Selected Tender Preview Card */}
                      {currentTenderForApply && (
                        <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1.5px solid #cbd5e1' }}>
                          <div style={{ fontSize: '0.78rem', color: '#2563eb', fontWeight: 700 }}>छनोट गरिएको बोलपत्र विवरण:</div>
                          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginTop: '3px' }}>{currentTenderForApply.title}</div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.6rem', marginTop: '0.75rem', fontSize: '0.82rem', color: '#475569' }}>
                            <div>संकेत नं: <strong>{currentTenderForApply.procurementNo}</strong></div>
                            <div>वडा नं: <strong>{currentTenderForApply.wardNo}</strong></div>
                            <div>लागत अनुमान: <strong style={{ color: '#047857' }}>रु. {Number(currentTenderForApply.estimatedAmountNPR || currentTenderForApply.estimatedAmount || 0).toLocaleString('ne-NP')}</strong></div>
                            <div>धरौटी रकम: <strong>रु. {Number(currentTenderForApply.bidSecurityAmount || Math.round(Number(currentTenderForApply.estimatedAmountNPR || currentTenderForApply.estimatedAmount || 0) * 0.025)).toLocaleString('ne-NP')}</strong></div>
                            <div>म्याद: <strong style={{ color: '#b91c1c' }}>{currentTenderForApply.deadlineDateBs || 'मिति उपलब्ध छैन'}</strong></div>
                          </div>
                        </div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                        <button
                          type="button"
                          disabled={!applyForm.tenderId}
                          onClick={() => setApplyStep(2)}
                          style={{ padding: '0.75rem 1.6rem', background: '#1e3a8a', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: applyForm.tenderId ? 'pointer' : 'not-allowed', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                        >
                          अर्को चरण (आवेदक विवरण) →
                        </button>
                      </div>
                    </div>
                  )}

                  {/* FORM STEP 2: Applicant & Legal Details */}
                  {applyStep === 2 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                          <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                            फर्म / कम्पनी वा उपभोक्ता समितिको नाम:*
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="उदा: हिमचुली-जलजला जे.भी. / थाङपालधोप खानेपानी उपभोक्ता समिति"
                            value={applyForm.applicantName}
                            onChange={(e) => setApplyForm({ ...applyForm, applicantName: e.target.value })}
                            style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                            मुख्य सम्पर्क व्यक्ति / प्रोप्राइटर वा अध्यक्ष:*
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="उदा: रामबहादुर तामाङ"
                            value={applyForm.contactPerson}
                            onChange={(e) => setApplyForm({ ...applyForm, contactPerson: e.target.value })}
                            style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                          <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                            स्थायी लेखा नम्बर (PAN / VAT) वा समिति दर्ता नं:*
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="९ अंकको PAN वा दर्ता नं"
                            value={applyForm.panVat}
                            onChange={(e) => setApplyForm({ ...applyForm, panVat: e.target.value })}
                            style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                            सम्पर्क मोबाइल नम्बर:*
                          </label>
                          <input
                            type="tel"
                            required
                            placeholder="९८४१२३४५६७"
                            value={applyForm.phone}
                            onChange={(e) => setApplyForm({ ...applyForm, phone: e.target.value })}
                            style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                          <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                            नागरिकता नम्बर (अध्यक्ष / प्रोप्राइटर):*
                          </label>
                          <input
                            type="text"
                            placeholder="२३-०१-७५-०२१३"
                            value={applyForm.citizenshipNo}
                            onChange={(e) => setApplyForm({ ...applyForm, citizenshipNo: e.target.value })}
                            style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                            इमेल ठेगाना:
                          </label>
                          <input
                            type="email"
                            placeholder="info@company.com.np"
                            value={applyForm.email}
                            onChange={(e) => setApplyForm({ ...applyForm, email: e.target.value })}
                            style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                          />
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                          कार्यालय वा कार्यस्थल ठेगाना:*
                        </label>
                        <input
                          type="text"
                          value={applyForm.address}
                          onChange={(e) => setApplyForm({ ...applyForm, address: e.target.value })}
                          style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                        />
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                        <button
                          type="button"
                          onClick={() => setApplyStep(1)}
                          style={{ padding: '0.65rem 1.4rem', background: '#f1f5f9', border: '1.5px solid #cbd5e1', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
                        >
                          ← अघिल्लो
                        </button>
                        <button
                          type="button"
                          disabled={!applyForm.applicantName || !applyForm.phone || !applyForm.panVat}
                          onClick={() => setApplyStep(3)}
                          style={{ padding: '0.75rem 1.6rem', background: '#1e3a8a', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}
                        >
                          अर्को चरण (कबोल रकम र धरौटी) →
                        </button>
                      </div>
                    </div>
                  )}

                  {/* FORM STEP 3: Financial Bid & Bid Security */}
                  {applyStep === 3 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      {/* Financial Bid Calculation Box */}
                      <div style={{ background: '#eff6ff', padding: '1.25rem', borderRadius: '12px', border: '1.5px solid #bfdbfe' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e3a8a', marginBottom: '0.75rem' }}>
                          आर्थिक प्रस्ताव (Financial Bid Calculation)
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.82rem', color: '#475569', fontWeight: 600, marginBottom: '0.3rem' }}>
                              इन्जिनियरिङ लागत अनुमान (VAT बाहेक/सहित):
                            </label>
                            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                              रु. {Number(currentTenderForApply?.estimatedAmountNPR || currentTenderForApply?.estimatedAmount || 0).toLocaleString('ne-NP')}
                            </div>
                          </div>

                          <div>
                            <label style={{ display: 'block', fontSize: '0.82rem', color: '#1e3a8a', fontWeight: 700, marginBottom: '0.3rem' }}>
                              तपाईंको कबोल रकम (Bid Amount NPR)*:
                            </label>
                            <input
                              type="number"
                              required
                              value={applyForm.bidAmount}
                              onChange={(e) => setApplyForm({ ...applyForm, bidAmount: Number(e.target.value) })}
                              style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '2px solid #2563eb', fontSize: '1.1rem', fontWeight: 800 }}
                            />
                          </div>
                        </div>

                        {/* Live Comparison Indicator */}
                        <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px dashed #bfdbfe', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                          <span style={{ fontWeight: 700 }}>लागत तुलना:</span>
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: '6px',
                              fontWeight: 800,
                              background: bidDiff.isBelow ? '#dcfce7' : '#fee2e2',
                              color: bidDiff.isBelow ? '#166534' : '#991b1b',
                            }}
                          >
                            {bidDiff.isBelow ? `लागत अनुमान भन्दा -${bidDiff.diffPct}% घटी (रु. ${bidDiff.diffAmount.toLocaleString()} बचत)` : `लागत अनुमान भन्दा +${bidDiff.diffPct}% बढी`}
                          </span>
                        </div>
                      </div>

                      {/* 2.5% Bid Security Details */}
                      <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
                          २.५% बोलपत्र धरौटी विवरण (Bid Security Guarantee)
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>बैंकको नाम*</label>
                            <input
                              type="text"
                              required
                              value={applyForm.bidSecurityBank}
                              onChange={(e) => setApplyForm({ ...applyForm, bidSecurityBank: e.target.value })}
                              style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1.5px solid #cbd5e1' }}
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>भौचर वा ग्यारेन्टी नं*</label>
                            <input
                              type="text"
                              required
                              placeholder="BG-2081-0492"
                              value={applyForm.bidSecurityVoucherNo}
                              onChange={(e) => setApplyForm({ ...applyForm, bidSecurityVoucherNo: e.target.value })}
                              style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1.5px solid #cbd5e1' }}
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>धरौटी रकम (रु.)*</label>
                            <input
                              type="number"
                              required
                              value={applyForm.bidSecurityAmount}
                              onChange={(e) => setApplyForm({ ...applyForm, bidSecurityAmount: Number(e.target.value) })}
                              style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1.5px solid #cbd5e1' }}
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>मान्य हुने अन्तिम मिति</label>
                            <input
                              type="text"
                              value={applyForm.bidSecurityExpiryDate}
                              onChange={(e) => setApplyForm({ ...applyForm, bidSecurityExpiryDate: e.target.value })}
                              style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1.5px solid #cbd5e1' }}
                            />
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                        <button
                          type="button"
                          onClick={() => setApplyStep(2)}
                          style={{ padding: '0.65rem 1.4rem', background: '#f1f5f9', border: '1.5px solid #cbd5e1', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
                        >
                          ← अघिल्लो
                        </button>
                        <button
                          type="button"
                          disabled={!applyForm.bidAmount || !applyForm.bidSecurityVoucherNo}
                          onClick={() => setApplyStep(4)}
                          style={{ padding: '0.75rem 1.6rem', background: '#1e3a8a', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}
                        >
                          अर्को चरण (कागजात र स्वघोषणा) →
                        </button>
                      </div>
                    </div>
                  )}

                  {/* FORM STEP 4: Documents & Declaration */}
                  {applyStep === 4 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      <div>
                        <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', color: '#0f172a', marginBottom: '0.6rem' }}>
                          संलग्न गरिएका अनिवार्य कागजातहरूको सूची (Required Documents Check):
                        </label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {[
                            'अद्यावधिक कम्पनी / फर्म वा उपभोक्ता समिति दर्ता प्रमाणपत्र',
                            'स्थायी लेखा नम्बर (PAN / VAT) दर्ता प्रमाणपत्र',
                            'आ.व. २०८०/८१ को कर चुक्ता प्रमाणपत्र (Tax Clearance)',
                            '२.५% बोलपत्र धरौटी बैंक ग्यारेन्टी वा नगद भौचर (Bid Security)',
                            'बोलपत्र फारम दस्तुर बुझाएको बैंक रसिद',
                            'प्राविधिक जनशक्ति, मेशिनरी उपकरण तथा अनुभव स्वघोषणा',
                          ].map((doc, idx) => (
                            <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: '#334155', cursor: 'pointer' }}>
                              <input type="checkbox" defaultChecked />
                              <span>{doc}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* File Upload Box */}
                      <div style={{ border: '2px dashed #cbd5e1', borderRadius: '12px', padding: '1.5rem', textAlign: 'center', background: '#f8fafc' }}>
                        <FileText size={32} color="#64748b" style={{ margin: '0 auto 0.5rem auto' }} />
                        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1e293b' }}>
                          प्रमाण कागजातहरूको संयुक्त पीडीएफ (Single Combined PDF) अपलोड गर्नुहोस्
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '2px' }}>
                          अधिकतम २५ एमबी सम्म (दरखास्त फारम, कर चुक्ता, धरौटी भौचर, र प्राविधिक विवरण)
                        </div>
                        <input type="file" style={{ marginTop: '0.75rem', fontSize: '0.8rem' }} />
                      </div>

                      {/* Legal Declaration */}
                      <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '1rem', borderRadius: '10px' }}>
                        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            required
                            checked={applyForm.declarationAgreed}
                            onChange={(e) => setApplyForm({ ...applyForm, declarationAgreed: e.target.checked })}
                            style={{ marginTop: '3px' }}
                          />
                          <span style={{ fontSize: '0.82rem', color: '#991b1b', lineHeight: 1.5 }}>
                            <strong>स्वघोषणा प्रतिबद्धता:</strong> हामी सार्वजनिक खरिद ऐन २०६३ को दफा ६३ बमोजिम कुनै पनि कालोसूचीमा नपरेको, आयोजना कार्यान्वयन गर्न योग्य रहेको र पेश गरिएका सम्पूर्ण कागजातहरू सत्य-तथ्य भएको घोषणा गर्दछौं। झुठ्ठा ठहरिएमा कानून बमोजिम कारबाही भोग्न मञ्जुर छौं।
                          </span>
                        </label>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                        <button
                          type="button"
                          onClick={() => setApplyStep(3)}
                          style={{ padding: '0.65rem 1.4rem', background: '#f1f5f9', border: '1.5px solid #cbd5e1', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
                        >
                          ← अघिल्लो
                        </button>
                        <button
                          type="button"
                          disabled={!applyForm.declarationAgreed || submitBidMutation.isPending}
                          onClick={() => submitBidMutation.mutate(applyForm)}
                          style={{
                            padding: '0.85rem 2rem',
                            background: applyForm.declarationAgreed ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : '#cbd5e1',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '10px',
                            fontWeight: 800,
                            fontSize: '0.95rem',
                            cursor: applyForm.declarationAgreed ? 'pointer' : 'not-allowed',
                            boxShadow: applyForm.declarationAgreed ? '0 4px 15px rgba(16, 185, 129, 0.4)' : 'none',
                          }}
                        >
                          {submitBidMutation.isPending ? 'ई-बोलपत्र दर्ता हुँदैछ...' : '✓ सुरक्षित ई-बोलपत्र दर्ता गर्नुहोस् (Submit Bid)'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB 3: ई-बोलपत्र स्थिति ट्र्याकिङ (Bid Tracking) ──────────────── */}
        {activeTab === 'track' && (
          <div style={{ marginTop: '2.5rem' }}>
            <div
              style={{
                background: '#ffffff',
                padding: '2rem',
                borderRadius: '16px',
                border: '1.5px solid #e2e8f0',
                boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
              }}
            >
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
                ई-बोलपत्र तथा योजना दरखास्त स्थिति ट्र्याकिङ (Live Bid Tracking)
              </h2>
              <p style={{ fontSize: '0.88rem', color: '#475569', margin: '0 0 1.5rem 0' }}>
                आफ्नो ई-बोलपत्र दर्ता नम्बर (उदा: <code>EBID-2081-XXXX</code>) वा फर्मको PAN / सम्पर्क नम्बर प्रविष्ट गरी हालको अवस्था हेर्नुहोस्:
              </p>

              <div style={{ display: 'flex', gap: '0.75rem', maxWidth: '600px', marginBottom: '2rem' }}>
                <input
                  type="text"
                  placeholder="दर्ता संकेत नं वा PAN वा सम्पर्क नम्बर हाल्नुहोस्..."
                  value={trackQuery}
                  onChange={(e) => setTrackQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleTrackBid()}
                  style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', color: '#0f172a' }}
                />
                <button
                  onClick={handleTrackBid}
                  style={{ padding: '0.75rem 1.4rem', background: '#1e3a8a', color: '#ffffff', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Search size={16} /> खोज्नुहोस्
                </button>
              </div>

              {trackNotFound && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '1.25rem', borderRadius: '10px', color: '#991b1b', fontSize: '0.88rem' }}>
                  ⚠️ तपाईंले खोज्नुभएको दर्ता नम्बर वा विवरण फेला परेन। कृपया सही दर्ता नम्बर (उदा: <code>EBID-2081-XXXX</code>) वा प्यान नम्बर प्रविष्ट गर्नुहोस्।
                </div>
              )}

              {trackedBidResult && (
                <div style={{ background: '#f8fafc', border: '1.5px solid #bbf7d0', borderRadius: '14px', padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 800, background: '#dcfce7', padding: '2px 8px', borderRadius: '10px' }}>
                        दर्ता प्रमाणित
                      </span>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                        {trackedBidResult.bidder?.name}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.75rem', color: '#475569' }}>दर्ता नम्बर:</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e3a8a' }}>
                        {trackedBidResult.bidder?.submissionNo || 'EBID-2081-AUTHENTIC'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', fontSize: '0.85rem', color: '#334155', marginBottom: '1.5rem' }}>
                    <div>बोलपत्र नं: <strong>{trackedBidResult.tender?.procurementNo}</strong></div>
                    <div>आयोजना: <strong>{trackedBidResult.tender?.title}</strong></div>
                    <div>कबोल रकम: <strong style={{ color: '#047857' }}>रु. {Number(trackedBidResult.bidder?.bidAmount).toLocaleString('ne-NP')}</strong></div>
                    <div>धरौटी विवरण: <strong>रु. {Number(trackedBidResult.bidder?.bidSecurityAmount || trackedBidResult.tender?.bidSecurityAmount || 0).toLocaleString('ne-NP')}</strong></div>
                    <div>दर्ता मिति: <strong>{trackedBidResult.bidder?.submissionDateBs || 'मिति उपलब्ध छैन'}</strong></div>
                    <div>प्रक्रियागत अवस्था: <strong style={{ color: '#2563eb' }}>{trackedBidResult.tender?.status || 'मूल्याङ्कन चरणमा'}</strong></div>
                  </div>

                  {/* 4 Stage Stepper */}
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '0.6rem' }}>
                      प्रक्रियागत प्रगति मार्गचित्र:
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', textAlign: 'center' }}>
                      {[
                        { title: '१. दर्ता सम्पन्न', active: true },
                        { title: '२. बोलपत्र खोल्ने/मूल्याङ्कन', active: true },
                        { title: '३. ७ दिने आशयपत्र (LOI)', active: trackedBidResult.tender?.status?.includes('awarded') || trackedBidResult.tender?.status?.includes('contracted') },
                        { title: '४. सम्झौता तथा कार्यान्वयन', active: trackedBidResult.tender?.status?.includes('contracted') },
                      ].map((st, idx) => (
                        <div
                          key={idx}
                          style={{
                            background: st.active ? '#10b981' : '#e2e8f0',
                            color: st.active ? '#ffffff' : '#64748b',
                            padding: '0.6rem',
                            borderRadius: '8px',
                            fontWeight: 700,
                            fontSize: '0.78rem',
                          }}
                        >
                          {st.title}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB 4: धरौटी तथा दस्तुर क्यालकुलेटर ────────────────────────────── */}
        {activeTab === 'calculator' && (
          <div style={{ marginTop: '2.5rem' }}>
            <div
              style={{
                background: '#ffffff',
                padding: '2rem',
                borderRadius: '16px',
                border: '1.5px solid #e2e8f0',
                boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                maxWidth: '800px',
                margin: '0 auto',
              }}
            >
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
                बोलपत्र धरौटी तथा दस्तुर क्यालकुलेटर (Bid Security & Fee Calculator)
              </h2>
              <p style={{ fontSize: '0.88rem', color: '#475569', margin: '0 0 1.5rem 0' }}>
                सार्वजनिक खरिद नियमावली २०६४ बमोजिम लागत अनुमान अनुसार लाग्ने २.५% बोलपत्र जमानत, ५% कार्यसम्पादन जमानत र फारम दस्तुर हिसाब गर्नुहोस्:
              </p>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.4rem', color: '#1e293b' }}>
                  इन्जिनियरिङ लागत अनुमान रकम (रु.):
                </label>
                <input
                  type="number"
                  step="50000"
                  value={calcEstAmount}
                  onChange={(e) => setCalcEstAmount(Number(e.target.value))}
                  style={{ width: '100%', padding: '0.85rem', borderRadius: '10px', border: '2px solid #3b82f6', fontSize: '1.25rem', fontWeight: 800 }}
                />
              </div>

              {/* Calculated Result Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div style={{ background: '#eff6ff', padding: '1.25rem', borderRadius: '12px', border: '1.5px solid #bfdbfe' }}>
                  <div style={{ fontSize: '0.78rem', color: '#1e3a8a', fontWeight: 700 }}>२.५% बोलपत्र जमानत (Bid Security)</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1d4ed8', margin: '0.3rem 0' }}>
                    रु. {calculatedParameters.bidSecurity.toLocaleString('ne-NP')}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#475569' }}>बैंक ग्यारेन्टी वा नगद धरौटी (१२० दिन म्याद)</div>
                </div>

                <div style={{ background: '#f0fdf4', padding: '1.25rem', borderRadius: '12px', border: '1.5px solid #bbf7d0' }}>
                  <div style={{ fontSize: '0.78rem', color: '#166534', fontWeight: 700 }}>५% कार्यसम्पादन जमानत (Performance Bond)</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#15803d', margin: '0.3rem 0' }}>
                    रु. {calculatedParameters.perfSecurity.toLocaleString('ne-NP')}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#475569' }}>सम्झौता गर्दा बुझाउनुपर्ने सुरक्षण</div>
                </div>

                <div style={{ background: '#fefce8', padding: '1.25rem', borderRadius: '12px', border: '1.5px solid #fef08a' }}>
                  <div style={{ fontSize: '0.78rem', color: '#854d0e', fontWeight: 700 }}>बोलपत्र फारम दस्तुर (Tender Doc Fee)</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#b45309', margin: '0.3rem 0' }}>
                    रु. {calculatedParameters.docFee.toLocaleString('ne-NP')}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#475569' }}>फिर्ता नहुने राजस्व रसिद दस्तुर</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 5: बोलपत्र मार्गचित्र तथा योग्यता मापदण्ड ──────────────────── */}
        {activeTab === 'guidelines' && (
          <div style={{ marginTop: '2.5rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
                सार्वजनिक खरिद तथा बोलपत्र प्रक्रियाका ६ मुख्य चरणहरू
              </h2>
              <p style={{ color: '#475569', fontSize: '0.95rem' }}>
                सार्वजनिक खरिद ऐन २०६३ बमोजिम स्वच्छ, प्रतिस्पर्धी र पारदर्शी प्रक्रिया:
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
              {[
                { step: '१', title: 'बोलपत्र आह्वान प्रकाशन (IFB)', desc: 'राष्ट्रिय दैनिक पत्रिका तथा पालिकाको अनलाइन पोर्टलमा १५ देखि ३० दिनको म्याद दिई सूचना प्रकाशन हुन्छ।' },
                { step: '२', title: 'अनलाइन बोलपत्र दर्ता (Bid Submission)', desc: 'निर्माण व्यवसायी तथा उपभोक्ता समितिले योग्यता, प्राविधिक विवरण, धरौटी र कबोल रकम अनलाइन पेश गर्दछन्।' },
                { step: '३', title: 'सारभूत मूल्याङ्कन (Bid Evaluation)', desc: 'मूल्याङ्कन समितिले योग्यता, अनुभव, र न्यूनतम कबोल रकमका आधारमा प्रभावग्राही बोलपत्र छनोट गर्दछ।' },
                { step: '४', title: '७ दिने आशयको सूचना (LOI)', desc: 'छनोट भएको व्यवसायीको नाम र कबोल रकम सहित ७ दिने आशयपत्र (Letter of Intent) प्रकाशित गरिन्छ।' },
                { step: '५', title: 'ठेक्का सम्झौता (Contract Agreement)', desc: '५% कार्यसम्पादन धरौटी र सम्झौता पत्रमा हस्ताक्षर गरी आधिकारिक कार्यादेश जारी गरिन्छ।' },
                { step: '६', title: 'कार्य सम्पन्न तथा फरफारक (Completion)', desc: 'कार्य सम्पन्न भएपछि स्थलगत प्राविधिक जाँच गरी अन्तिम फरफारक तथा भुक्तानी गरिन्छ।' },
              ].map((item) => (
                <div key={item.step} style={{ background: '#fff', borderRadius: '12px', padding: '1.25rem', border: '1.5px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, marginBottom: '0.6rem' }}>
                    {item.step}
                  </div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.35rem 0' }}>{item.title}</h3>
                  <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>{item.desc}</p>
                </div>
              ))}
            </div>

            {/* Required Documents Checklist Card */}
            <div style={{ background: '#ffffff', padding: '1.75rem', borderRadius: '16px', border: '1.5px solid #e2e8f0', maxWidth: '800px', margin: '0 auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <ShieldCheck size={24} color="#16a34a" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                  बोलपत्र पेश गर्दा अनिवार्य संलग्न गर्नुपर्ने कागजातहरू
                </h3>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.88rem', color: '#334155' }}>
                {[
                  'अद्यावधिक फर्म वा कम्पनी दर्ता प्रमाणपत्र (Company / Firm Registration)',
                  'स्थायी लेखा नम्बर (PAN / VAT) दर्ता प्रमाणपत्र',
                  'आ.व. २०८०/८१ सम्मको कर चुक्ता प्रमाणपत्र (Tax Clearance Certificate)',
                  'सार्वजनिक खरिद ऐन २०६३ बमोजिम कालोसूचीमा नपरेको तथा स्वार्थ नबाझिएको स्वघोषणा पत्र',
                  'तोकिएको वाणिज्य बैंकबाट जारी भएको २.५% बोलपत्र जमानत (Bid Security Guarantee)',
                  'समान प्रकृतिको सरकारी निर्माण कार्यको अनुभव प्रमाणपत्र (आवश्यक भएमा)',
                  'मुख्य प्राविधिक जनशक्ति (ईन्जिनियर/सब-ईन्जिनियर) को प्रतिबद्धता पत्र',
                ].map((doc, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Check size={16} color="#16a34a" style={{ flexShrink: 0 }} />
                    <span>{doc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

      </div>

      {/* ── Pre-bid Query Modal ──────────────────────────────────────── */}
      {showQueryModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div style={{ background: '#fff', width: '100%', maxWidth: '500px', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ background: '#1e293b', padding: '1.25rem', color: '#fff' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>प्रश्न वा प्राविधिक जिज्ञासा (Pre-bid Query)</h3>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.25rem' }}>{showQueryModal.procurementNo || showQueryModal.tenderNumber}</div>
            </div>

            <div style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>तपाईंको प्रश्न वा स्पष्टीकरण:</label>
                <textarea
                  value={queryText}
                  onChange={(e) => setQueryText(e.target.value)}
                  placeholder="यहाँ लेख्नुहोस् (जस्तै: JV permitted छ कि छैन?)..."
                  rows={4}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', color: '#0f172a', resize: 'vertical' }}
                />
                <p style={{ fontSize: '0.75rem', color: '#475569', marginTop: '0.5rem', lineHeight: 1.5 }}>
                  तपाईंले पठाउनुभएको प्रश्न पालिकाको खरिद इकाईमा पुग्नेछ र पालिकाले यसको आधिकारिक जवाफ प्रकाशित गर्नेछ।
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  onClick={() => setShowQueryModal(null)}
                  style={{ padding: '0.6rem 1rem', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
                >
                  रद्द गर्नुहोस्
                </button>
                <button
                  onClick={() => submitQueryMutation.mutate({ tenderId: showQueryModal.id, query: queryText })}
                  disabled={!queryText.trim() || submitQueryMutation.isPending}
                  style={{ padding: '0.6rem 1rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', cursor: queryText.trim() ? 'pointer' : 'not-allowed', fontWeight: 600, fontSize: '0.85rem', opacity: !queryText.trim() ? 0.5 : 1 }}
                >
                  {submitQueryMutation.isPending ? 'पठाउँदै...' : 'पेश गर्नुहोस् (Submit)'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
export default PublicProcurement;
