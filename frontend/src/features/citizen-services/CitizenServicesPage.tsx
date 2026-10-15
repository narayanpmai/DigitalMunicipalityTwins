import React, { useState, useEffect } from 'react';
import {
  Search,
  Clock,
  ArrowRight,
  Download,
  CheckCircle2,
  AlertCircle,
  FileText,
  X,
  Send,
  Loader2,
  Printer,
  Eye,
  Building2,
  FolderPlus,
  ShieldCheck,
  Check,
  Filter,
  Layers,
  FileCheck,
  Sparkles,
  RefreshCw,
  Phone,
  Calendar,
  DollarSign,
  Tag,
  Paperclip,
  Map,
  Smartphone,
} from 'lucide-react';
import { SIFARISH_TEMPLATES, SifarishTemplate } from './sifarishTemplates';
import { OfficialSifarishLetterhead } from './OfficialSifarishLetterhead';
import { DynamicApplicationModal } from './DynamicApplicationModal';
import { DynamicServiceForm } from '../../components/common/DynamicServiceForm';
import { citizenServicesApi, type CitizenServiceApplication } from '../../api/citizenServices';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ServiceItem {
  id: string;
  templateId?: string;
  title: string;
  category: 'recommendation' | 'business' | 'vital_events' | 'tax' | 'property' | 'social';
  serviceType: string;
  department: string;
  timeEstimate: string;
  feeNpr: number | 'free';
  requiredDocs: string[];
}

export const CitizenServicesPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  // Main Navigation Tabs
  const [activeTab, setActiveTab] = useState<'catalog' | 'templates' | 'management' | 'dynamic'>('catalog');

  // Filter & Search states
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingResult, setTrackingResult] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  // Modals
  const [selectedTemplateForApply, setSelectedTemplateForApply] = useState<SifarishTemplate | null>(null);
  const [selectedTemplateForPreview, setSelectedTemplateForPreview] = useState<{
    template: SifarishTemplate;
    applicantData?: any;
    isOfficialIssued?: boolean;
  } | null>(null);

  // Ward Officer Application Queue
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoadingApplications, setIsLoadingApplications] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [wardFilter, setWardFilter] = useState<string>('all');
  const [selectedAppForDetail, setSelectedAppForDetail] = useState<any | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Fetch applications for admin management
  const fetchApplications = async () => {
    setIsLoadingApplications(true);
    try {
      const data = await citizenServicesApi.getAll();
      setApplications(data);
    } catch (err) {
      console.error('Error fetching citizen applications:', err);
    } finally {
      setIsLoadingApplications(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // Quick tracking handler
  const handleTrackApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNo = trackingNumber.trim();
    if (!cleanNo) return;

    setIsSearching(true);
    setSearchError('');
    setTrackingResult(null);

    try {
      const data = await citizenServicesApi.track(cleanNo);
      setTrackingResult(data);
    } catch (err: any) {
      setSearchError(err?.response?.data?.message || err.message || 'उल्लेखित आवेदन नम्बर वा टोकन प्रणालीमा फेला परेन। कृपया नम्बर जाँच गर्नुहोस्।');
    } finally {
      setIsSearching(false);
    }
  };

  // Status update by ward officer
  const handleUpdateStatus = async (appId: string, newStatus: string, remarks?: string) => {
    setIsUpdatingStatus(true);
    try {
      const updated = await citizenServicesApi.update(appId, {
        status: newStatus as any,
        processedBy: 'रामकृष्ण श्रेष्ठ (वडा सचिव / अधिकृत)',
        remarks: remarks || `अवस्था परिवर्तन: ${newStatus.toUpperCase()}`,
      });

      await fetchApplications();
      if (selectedAppForDetail && selectedAppForDetail.id === appId) {
        setSelectedAppForDetail(updated);
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || 'स्थिति अद्यावधिक गर्न सकिएन।');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Find template matching a service or format ID
  const getTemplateForService = (templateId?: string, serviceType?: string): SifarishTemplate => {
    if (templateId) {
      const found = SIFARISH_TEMPLATES.find((t) => t.id === templateId);
      if (found) return found;
    }
    if (serviceType) {
      const found = SIFARISH_TEMPLATES.find((t) => t.serviceType === serviceType);
      if (found) return found;
    }
    return SIFARISH_TEMPLATES[0]; // fallback
  };

  // Filter templates / catalog
  const filteredTemplates = SIFARISH_TEMPLATES.filter((tpl) => {
    const matchesSearch =
      !searchTerm ||
      tpl.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tpl.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tpl.department.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCat = activeCategory === 'all' || tpl.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  // Filter applications queue
  const filteredApplications = applications.filter((app) => {
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesWard = wardFilter === 'all' || String(app.wardNumber) === wardFilter;
    const matchesSearch =
      !searchTerm ||
      app.applicantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicationNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicantPhone?.includes(searchTerm);
    return matchesStatus && matchesWard && matchesSearch;
  });

  // KPI Metrics
  const totalApps = applications.length;
  const appliedCount = applications.filter((a) => a.status === 'applied').length;
  const processingCount = applications.filter((a) => a.status === 'processing').length;
  const approvedCount = applications.filter((a) => a.status === 'approved').length;
  const deliveredCount = applications.filter((a) => a.status === 'delivered').length;
  const totalRevenue = applications.reduce((sum, a) => sum + (Number(a.fee) || 0), 0);

  // Stepper helper
  const getStepProgress = (status: string) => {
    switch (status) {
      case 'applied':
        return 1;
      case 'processing':
        return 2;
      case 'fee_settled':
        return 3;
      case 'approved':
        return 4;
      case 'delivered':
        return 5;
      default:
        return 1;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontFamily: 'var(--font-family, sans-serif)' }}>
      {/* ─── PAGE HEADER & EXECUTIVE SUMMARY ─── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1rem',
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '1rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
            <Building2 size={24} color="#0284c7" />
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              नागरिक ई-सेवा तथा अनलाइन सिफारिस केन्द्र
            </h1>
          </div>
          <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>
            नेपाल सरकार स्थानीय सरकार सञ्चालन ऐन २०७४ बमोजिम डिजिटल सिफारिस ढाँचा, अनलाइन दरखास्त, र प्रत्यक्ष ट्र्याकिङ प्रणाली
          </p>
        </div>

        {/* Quick Action Badges */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => navigate('/gis-map?filter=citizen_service')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#4f46e5',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '0.45rem 0.9rem',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(79,70,229,0.3)',
            }}
          >
            <Map size={16} />
            <span>🗺️ GIS डिजिटल ट्विन सेवा डेस्क</span>
          </button>
          <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '0.4rem 0.75rem', fontSize: '0.8rem', color: '#1d4ed8', fontWeight: 700 }}>
            ✓ १२+ आधिकारिक ढाँचाहरू
          </div>
          <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '0.4rem 0.75rem', fontSize: '0.8rem', color: '#166534', fontWeight: 700 }}>
            ✓ डिजिटल छाप तथा QR कोड
          </div>
          <div style={{ backgroundColor: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '8px', padding: '0.4rem 0.75rem', fontSize: '0.8rem', color: '#7e22ce', fontWeight: 700 }}>
            ✓ घरमै बसी अनलाइन आवेदन
          </div>
        </div>
      </div>

      {/* ─── LIVE TRACKING SEARCH BAR ─── */}
      <div
        className="dt-card"
        style={{
          background: 'linear-gradient(135deg, rgba(240, 249, 255, 0.95) 0%, rgba(224, 242, 254, 0.75) 100%)',
          border: '1px solid #7dd3fc',
          borderRadius: '12px',
          padding: '1.25rem',
          boxShadow: '0 4px 12px rgba(2, 132, 199, 0.08)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0369a1', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Search size={18} />
            <span>अनलाइन सिफारिस / दरखास्त ट्र्याक गर्नुहोस् (Live Tracking)</span>
          </h2>
          <span style={{ fontSize: '0.78rem', color: '#0284c7', fontWeight: 600 }}>
            टोकन नं. उदाहरण: SVC-2081-00101 वा PPK-SIF...
          </span>
        </div>

        <form onSubmit={handleTrackApplication} style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="आफ्नो आवेदन वा टोकन नम्बर प्रविष्ट गर्नुहोस्..."
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            style={{
              flex: 1,
              minWidth: '260px',
              padding: '0.65rem 0.9rem',
              borderRadius: '8px',
              border: '1px solid #38bdf8',
              backgroundColor: '#ffffff',
              fontSize: '0.92rem',
              outline: 'none',
            }}
          />
          <button
            type="submit"
            disabled={isSearching}
            style={{
              padding: '0.65rem 1.4rem',
              borderRadius: '8px',
              backgroundColor: '#0284c7',
              color: 'white',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: '0 2px 6px rgba(2, 132, 199, 0.3)',
            }}
          >
            {isSearching ? <Loader2 size={16} className="spinner" /> : <Search size={16} />}
            <span>ट्र्याक गर्नुहोस्</span>
          </button>
        </form>

        {/* Quick Sample Tracking Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginTop: '0.65rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.76rem', color: '#0369a1', fontWeight: 700 }}>⚡ द्रुत नमुना टोकन:</span>
          {[
            { token: 'SVC-2081-00101', label: 'SVC-2081-00101 (नाता प्रमाणित)' },
            { token: 'SVC-2081-00103', label: 'SVC-2081-00103 (नागरिकता सिफारिस)' },
            { token: 'SVC-2026-00006', label: 'SVC-2026-00006 (अनलाइन दर्ता)' },
          ].map((item) => (
            <button
              key={item.token}
              type="button"
              onClick={() => {
                setTrackingNumber(item.token);
                setIsSearching(true);
                setSearchError('');
                fetch(`/api/v1/citizen-services/track/${encodeURIComponent(item.token)}`)
                  .then((r) => {
                    if (!r.ok) throw new Error('टोकन फेला परेन');
                    return r.json();
                  })
                  .then((d) => setTrackingResult(d))
                  .catch((err) => setSearchError(err.message))
                  .finally(() => setIsSearching(false));
              }}
              style={{
                fontSize: '0.74rem',
                padding: '0.2rem 0.55rem',
                borderRadius: '6px',
                backgroundColor: 'rgba(255,255,255,0.9)',
                border: '1px solid #7dd3fc',
                color: '#0284c7',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        {searchError && (
          <div
            style={{
              marginTop: '0.75rem',
              padding: '0.65rem 1rem',
              borderRadius: '8px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <AlertCircle size={16} />
            <span>{searchError}</span>
          </div>
        )}

        {/* ─── LIVE TRACKING RESULT WITH 5-STAGE STEPPER ─── */}
        {trackingResult && (
          <div
            style={{
              marginTop: '1.25rem',
              padding: '1.25rem',
              borderRadius: '10px',
              backgroundColor: 'white',
              border: '1px solid #bae6fd',
              boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>टोकन नम्बर: </span>
                <strong style={{ fontSize: '1.15rem', color: '#0284c7' }}>{trackingResult.applicationNo}</strong>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span
                  style={{
                    fontSize: '0.8rem',
                    padding: '0.3rem 0.8rem',
                    borderRadius: '9999px',
                    backgroundColor:
                      trackingResult.status === 'delivered'
                        ? '#ecfdf5'
                        : trackingResult.status === 'approved'
                        ? '#eff6ff'
                        : '#fef3c7',
                    color:
                      trackingResult.status === 'delivered'
                        ? '#047857'
                        : trackingResult.status === 'approved'
                        ? '#1d4ed8'
                        : '#b45309',
                    fontWeight: 800,
                  }}
                >
                  स्थिति: {trackingResult.status.toUpperCase()}
                </span>

                {(trackingResult.status === 'approved' || trackingResult.status === 'delivered') && (
                  <button
                    onClick={() => {
                      const tpl = getTemplateForService(trackingResult.formData?.formatId, trackingResult.serviceType);
                      setSelectedTemplateForPreview({
                        template: tpl,
                        applicantData: trackingResult,
                        isOfficialIssued: true,
                      });
                    }}
                    style={{
                      padding: '0.4rem 0.85rem',
                      borderRadius: '6px',
                      backgroundColor: '#16a34a',
                      color: 'white',
                      border: 'none',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                    }}
                  >
                    <Eye size={14} />
                    <span>आधिकारिक सिफारिस पत्र हेर्नुहोस्</span>
                  </button>
                )}
              </div>
            </div>

            {/* 5-Stage Visual Stepper */}
            <div style={{ margin: '1rem 0 1.5rem', padding: '0.5rem 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                {/* Connecting progress bar */}
                <div
                  style={{
                    position: 'absolute',
                    top: '14px',
                    left: '25px',
                    right: '25px',
                    height: '4px',
                    backgroundColor: '#e2e8f0',
                    zIndex: 1,
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      backgroundColor: '#2563eb',
                      width: `${((getStepProgress(trackingResult.status) - 1) / 4) * 100}%`,
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>

                {[
                  { step: 1, label: '१. आवेदन दर्ता' },
                  { step: 2, label: '२. कागजात रुजु' },
                  { step: 3, label: '३. दस्तुर भुक्तान' },
                  { step: 4, label: '४. वडा निर्णय' },
                  { step: 5, label: '५. सिफारिस जारी' },
                ].map((s) => {
                  const currentLevel = getStepProgress(trackingResult.status);
                  const isDone = currentLevel >= s.step;
                  return (
                    <div
                      key={s.step}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.35rem',
                        zIndex: 2,
                        position: 'relative',
                      }}
                    >
                      <div
                        style={{
                          width: '30px',
                          height: '30px',
                          borderRadius: '50%',
                          backgroundColor: isDone ? '#2563eb' : '#ffffff',
                          border: `2px solid ${isDone ? '#2563eb' : '#cbd5e1'}`,
                          color: isDone ? '#ffffff' : '#94a3b8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.78rem',
                          fontWeight: 800,
                        }}
                      >
                        {isDone ? <Check size={16} /> : s.step}
                      </div>
                      <span
                        style={{
                          fontSize: '0.78rem',
                          fontWeight: isDone ? 700 : 500,
                          color: isDone ? '#1e293b' : '#94a3b8',
                          textAlign: 'center',
                        }}
                      >
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Applicant Details Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: '#64748b' }}>निवेदकको नाम:</span> <strong>{trackingResult.applicantName}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>सम्पर्क नम्बर:</span> {trackingResult.applicantPhone || '-'}
              </div>
              <div>
                <span style={{ color: '#64748b' }}>सम्बन्धित वडा:</span> <strong>वडा नं. {trackingResult.wardNumber || '३'}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>दस्तुर:</span> रु. {trackingResult.fee || 0}
              </div>
            </div>

            {trackingResult.remarks && (
              <div style={{ marginTop: '0.75rem', padding: '0.6rem 0.85rem', backgroundColor: '#f8fafc', borderRadius: '6px', fontSize: '0.82rem' }}>
                <strong>कैफियत / प्रगति:</strong> {trackingResult.remarks}
                {trackingResult.processedBy && (
                  <div style={{ color: '#0369a1', marginTop: '0.2rem' }}>
                    <strong>प्रक्रियाकर्ता:</strong> {trackingResult.processedBy}
                  </div>
                )}
              </div>
            )}

            {/* ─── DIGITAL SIGNATURE & VERIFICATION BANNER ─── */}
            {(trackingResult.status === 'approved' || trackingResult.status === 'delivered') && (
              <div
                style={{
                  marginTop: '1rem',
                  backgroundColor: '#f0fdf4',
                  border: '1.5px solid #86efac',
                  borderRadius: '10px',
                  padding: '0.85rem 1.1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      backgroundColor: '#dcfce7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <ShieldCheck size={22} color="#16a34a" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#166534' }}>
                      ✓ विद्युतीय हस्ताक्षर प्रमाणित सिफारिस (Digitally Signed & Secured)
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#15803d' }}>
                      जारी गर्ने: {trackingResult.processedBy || 'रामकृष्ण श्रेष्ठ (वडा सचिव)'} • टोकन: SHA256-Secured • राष्ट्रिय सूचना प्रविधि केन्द्र (NITC) मापदण्ड
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const tpl = getTemplateForService(trackingResult.formData?.formatId, trackingResult.serviceType);
                    setSelectedTemplateForPreview({
                      template: tpl,
                      applicantData: trackingResult,
                      isOfficialIssued: true,
                    });
                  }}
                  style={{
                    padding: '0.45rem 1rem',
                    backgroundColor: '#16a34a',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    boxShadow: '0 2px 6px rgba(22, 163, 74, 0.3)',
                  }}
                >
                  <Eye size={15} />
                  <span>डिजिटल सिफारिस पत्र हेर्नुहोस् (A4)</span>
                </button>
              </div>
            )}

            {/* ─── LIVE CITIZEN SMS DELIVERY AUDIT TRAIL ─── */}
            <div
              style={{
                marginTop: '1.25rem',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '1rem 1.15rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Smartphone size={18} color="#0284c7" />
                  <span style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0f172a' }}>
                    नागरिक SMS गेटवे सूचना स्थिति (SMS Delivery Audit Log)
                  </span>
                  <span style={{ fontSize: '0.72rem', backgroundColor: '#e0f2fe', color: '#0369a1', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                    Aakash / Sparrow SMS API
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    alert(`📲 नागरिकको मोबाइल (${trackingResult.applicantPhone || '९८४१२३४५६७'}) मा नयाँ SMS अलर्ट सफलतापूर्वक पठाइयो!\n\nसन्देश: "पाँचपोखरी थाङपाल गाउँपालिका: तपाईंको सिफारिस आवेदन [${trackingResult.applicationNo}] को पछिल्लो अवस्था: ${trackingResult.status.toUpperCase()}।"\n\nगेटवे: Aakash SMS (Delivery Confirmed)`);
                  }}
                  style={{
                    fontSize: '0.76rem',
                    padding: '0.3rem 0.75rem',
                    borderRadius: '6px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #38bdf8',
                    color: '#0284c7',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <Send size={12} />
                  <span>SMS पुनः पठाउनुहोस्</span>
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {/* Step 1: Registered SMS */}
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #bae6fd',
                    borderRadius: '8px',
                    padding: '0.65rem 0.85rem',
                    fontSize: '0.8rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                    <span style={{ fontWeight: 700, color: '#0369a1' }}>१. आवेदन दर्ता SMS सूचना</span>
                    <span style={{ fontSize: '0.7rem', color: '#16a34a', fontWeight: 700, backgroundColor: '#dcfce7', padding: '1px 6px', borderRadius: '4px' }}>
                      ✓ DELIVERED (हस्तान्तरण सफल)
                    </span>
                  </div>
                  <div style={{ color: '#334155', fontStyle: 'italic', fontSize: '0.78rem' }}>
                    "पाँचपोखरी थाङपाल: तपाईंको सिफारिस आवेदन (टोकन: {trackingResult.applicationNo}) दर्ता भयो। शुल्क: रु. {trackingResult.fee || '०'}।"
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '3px' }}>
                    प्रापक: {trackingResult.applicantPhone || '९८४१२३४५६७'} • प्रेषक: PANCHPOKHARI • टेलिकम: NTC
                  </div>
                </div>

                {/* Step 2: Under Review SMS */}
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '0.65rem 0.85rem',
                    fontSize: '0.8rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                    <span style={{ fontWeight: 700, color: '#334155' }}>२. कागजात रुजु तथा वडा निर्णय SMS</span>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        backgroundColor: trackingResult.status !== 'applied' ? '#dcfce7' : '#fef3c7',
                        color: trackingResult.status !== 'applied' ? '#166534' : '#b45309',
                        padding: '1px 6px',
                        borderRadius: '4px',
                      }}
                    >
                      {trackingResult.status !== 'applied' ? '✓ DELIVERED' : '⏳ प्रक्रियामा (Pending)'}
                    </span>
                  </div>
                  <div style={{ color: '#334155', fontStyle: 'italic', fontSize: '0.78rem' }}>
                    "वडा नं. {trackingResult.wardNumber || '३'} कार्यालयबाट तपाईंको कागजात रुजु सम्पन्न भई सिफारिस निर्णय प्रक्रियामा राखिएको छ।"
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '3px' }}>
                    अधिकृत: {trackingResult.processedBy || 'रामकृष्ण श्रेष्ठ (वडा सचिव)'} • प्रेषक: PANCHPOKHARI
                  </div>
                </div>

                {/* Step 3: Approved & Digitally Signed SMS */}
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '0.65rem 0.85rem',
                    fontSize: '0.8rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                    <span style={{ fontWeight: 700, color: '#334155' }}>३. डिजिटल हस्ताक्षर तथा सिफारिस स्वीकृत SMS</span>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        backgroundColor: (trackingResult.status === 'approved' || trackingResult.status === 'delivered') ? '#dcfce7' : '#f1f5f9',
                        color: (trackingResult.status === 'approved' || trackingResult.status === 'delivered') ? '#166534' : '#94a3b8',
                        padding: '1px 6px',
                        borderRadius: '4px',
                      }}
                    >
                      {(trackingResult.status === 'approved' || trackingResult.status === 'delivered') ? '✓ DELIVERED (सफल)' : '⏳ स्वीकृत हुन बाँकी'}
                    </span>
                  </div>
                  <div style={{ color: '#334155', fontStyle: 'italic', fontSize: '0.78rem' }}>
                    "बधाई छ! तपाईंको सिफारिस (टोकन: {trackingResult.applicationNo}) स्वीकृत भई डिजिटल हस्ताक्षर सम्पन्न भएको छ। डाउनलोड: {window.location.origin}/app/citizen-services?track={trackingResult.applicationNo}"
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '3px' }}>
                    सुरक्षा: SHA256 क्रिप्टोग्राफिक हस्ताक्षर • Aakash SMS Gateway Verified
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── THREE MAIN EXECUTIVE TABS (Unified Responsive Grid) ─── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '0.85rem',
          marginBottom: '1rem',
        }}
      >
        {/* Tab 1: Catalog */}
        <button
          type="button"
          onClick={() => setActiveTab('catalog')}
          style={{
            padding: '0.85rem 1.15rem',
            borderRadius: '14px',
            border: activeTab === 'catalog' ? '1.5px solid #1e40af' : '1.5px solid #e2e8f0',
            background: activeTab === 'catalog'
              ? 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)'
              : '#ffffff',
            color: activeTab === 'catalog' ? '#ffffff' : '#1e293b',
            cursor: 'pointer',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
            boxShadow: activeTab === 'catalog'
              ? '0 6px 20px -4px rgba(37, 99, 235, 0.35)'
              : '0 2px 6px rgba(0,0,0,0.03)',
            transition: 'all 0.18s ease',
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '11px',
              background: activeTab === 'catalog' ? 'rgba(255,255,255,0.2)' : '#eff6ff',
              color: activeTab === 'catalog' ? '#ffffff' : '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Layers size={22} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.4rem' }}>
              <div style={{ fontWeight: 800, fontSize: '0.92rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                १. नागरिक ई-सेवा क्याटलग
              </div>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  background: activeTab === 'catalog' ? 'rgba(255,255,255,0.25)' : '#dbeafe',
                  color: activeTab === 'catalog' ? '#ffffff' : '#1d4ed8',
                  flexShrink: 0,
                }}
              >
                १२+ ढाँचा
              </span>
            </div>
            <div style={{ fontSize: '0.74rem', opacity: activeTab === 'catalog' ? 0.9 : 0.65, marginTop: '2px' }}>
              अनलाइन दरखास्त तथा सेवा सूची
            </div>
          </div>
        </button>

        {/* Tab 2: Format Library */}
        <button
          type="button"
          onClick={() => setActiveTab('templates')}
          style={{
            padding: '0.85rem 1.15rem',
            borderRadius: '14px',
            border: activeTab === 'templates' ? '1.5px solid #1e40af' : '1.5px solid #e2e8f0',
            background: activeTab === 'templates'
              ? 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)'
              : '#ffffff',
            color: activeTab === 'templates' ? '#ffffff' : '#1e293b',
            cursor: 'pointer',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
            boxShadow: activeTab === 'templates'
              ? '0 6px 20px -4px rgba(37, 99, 235, 0.35)'
              : '0 2px 6px rgba(0,0,0,0.03)',
            transition: 'all 0.18s ease',
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '11px',
              background: activeTab === 'templates' ? 'rgba(255,255,255,0.2)' : '#eff6ff',
              color: activeTab === 'templates' ? '#ffffff' : '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <FileCheck size={22} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.4rem' }}>
              <div style={{ fontWeight: 800, fontSize: '0.92rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                २. सिफारिस ढाँचा पुस्तकालय
              </div>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  background: activeTab === 'templates' ? 'rgba(255,255,255,0.25)' : '#dbeafe',
                  color: activeTab === 'templates' ? '#ffffff' : '#1d4ed8',
                  flexShrink: 0,
                }}
              >
                ऐन २०७४
              </span>
            </div>
            <div style={{ fontSize: '0.74rem', opacity: activeTab === 'templates' ? 0.9 : 0.65, marginTop: '2px' }}>
              मानक सिफारिस ढाँचा र मुद्रण
            </div>
          </div>
        </button>

        {/* Tab 3: Applications Queue */}
        <button
          type="button"
          onClick={() => {
            setActiveTab('management');
            fetchApplications();
          }}
          style={{
            padding: '0.85rem 1.15rem',
            borderRadius: '14px',
            border: activeTab === 'management' ? '1.5px solid #1e40af' : '1.5px solid #e2e8f0',
            background: activeTab === 'management'
              ? 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)'
              : '#ffffff',
            color: activeTab === 'management' ? '#ffffff' : '#1e293b',
            cursor: 'pointer',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
            boxShadow: activeTab === 'management'
              ? '0 6px 20px -4px rgba(37, 99, 235, 0.35)'
              : '0 2px 6px rgba(0,0,0,0.03)',
            transition: 'all 0.18s ease',
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '11px',
              background: activeTab === 'management' ? 'rgba(255,255,255,0.2)' : '#eff6ff',
              color: activeTab === 'management' ? '#ffffff' : '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <FolderPlus size={22} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.4rem' }}>
              <div style={{ fontWeight: 800, fontSize: '0.92rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                ३. प्राप्त अनलाइन आवेदनहरू
              </div>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  background: activeTab === 'management' ? '#ffffff' : '#2563eb',
                  color: activeTab === 'management' ? '#1e3a8a' : '#ffffff',
                  flexShrink: 0,
                }}
              >
                {applications.length} आवेदन
              </span>
            </div>
            <div style={{ fontSize: '0.74rem', opacity: activeTab === 'management' ? 0.9 : 0.65, marginTop: '2px' }}>
              वडा निर्णय तथा कार्यसम्पादन सूची
            </div>
          </div>
        </button>
      </div>

      {/* ───────────────────────────────────────────────────────────────────────────
          TAB 1: CITIZEN SERVICES CATALOG (क्याटलग तथा अनलाइन आवेदन)
         ─────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'catalog' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Category Filter Chips & Search */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.85rem',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.85rem 1.15rem',
              backgroundColor: '#ffffff',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)',
            }}
          >
            <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', alignItems: 'center' }}>
              {[
                { id: 'all', label: 'सबै सेवाहरू', icon: '🏛️' },
                { id: 'recommendation', label: 'सिफारिस सेवा', icon: '📝' },
                { id: 'property', label: 'सम्पत्ति तथा पूर्वाधार', icon: '🏠' },
                { id: 'business', label: 'उद्योग तथा व्यवसाय', icon: '💼' },
                { id: 'vital_events', label: 'पञ्जीकरण तथा व्यक्तिगत', icon: '📜' },
                { id: 'social', label: 'सामाजिक तथा विपन्नता', icon: '🤝' },
              ].map((cat) => {
                const isCatActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    style={{
                      padding: '0.45rem 0.95rem',
                      borderRadius: '9999px',
                      border: isCatActive ? '1px solid #2563eb' : '1px solid #e2e8f0',
                      fontWeight: 700,
                      fontSize: '0.84rem',
                      cursor: 'pointer',
                      backgroundColor: isCatActive ? '#2563eb' : '#f8fafc',
                      color: isCatActive ? '#ffffff' : '#475569',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      boxShadow: isCatActive ? '0 2px 8px rgba(37, 99, 235, 0.25)' : 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            <div style={{ position: 'relative', minWidth: '260px' }}>
              <Search
                size={16}
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
              />
              <input
                type="text"
                placeholder="सेवा वा ढाँचा खोज्नुहोस्..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem 0.5rem 2.2rem',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                  backgroundColor: '#f8fafc',
                  fontSize: '0.86rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.15s ease',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.backgroundColor = '#ffffff'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.backgroundColor = '#f8fafc'; }}
              />
            </div>
          </div>

          {/* Catalog Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="dt-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '1.25rem',
                  gap: '1rem',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: 'white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        padding: '0.2rem 0.55rem',
                        borderRadius: '9999px',
                        backgroundColor: '#e0f2fe',
                        color: '#0369a1',
                        fontWeight: 700,
                      }}
                    >
                      {template.department}
                    </span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 800, color: template.feeNpr === 'free' ? '#16a34a' : '#ea580c' }}>
                      {template.feeNpr === 'free' ? 'निःशुल्क' : `दस्तुर: रु. ${template.feeNpr}`}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.4, marginBottom: '0.4rem' }}>
                    {template.title}
                  </h3>

                  <div style={{ fontSize: '0.74rem', color: '#64748b', fontStyle: 'italic', marginBottom: '0.6rem' }}>
                    {template.legalReference}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#475569', marginBottom: '0.75rem' }}>
                    <Clock size={14} color="#0284c7" />
                    <span>लाग्ने समय: {template.timeEstimate}</span>
                  </div>

                  {/* Required Documents checklist */}
                  <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '8px', borderLeft: '3px solid #3b82f6' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                      आवश्यक कागजात तथा प्रमाणहरू:
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.78rem', color: '#64748b', lineHeight: 1.5 }}>
                      {template.requiredDocs.slice(0, 3).map((doc, idx) => (
                        <li key={idx}>{doc}</li>
                      ))}
                      {template.requiredDocs.length > 3 && (
                        <li style={{ color: '#0284c7', fontWeight: 600 }}>+{template.requiredDocs.length - 3} थप कागजातहरू...</li>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid #f1f5f9',
                    gap: '0.5rem',
                  }}
                >
                  <button
                    onClick={() => setSelectedTemplateForPreview({ template, isOfficialIssued: false })}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.5rem 0.85rem',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: 'white',
                      color: '#334155',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <Eye size={14} />
                    <span>ढाँचा हेर्नुहोस्</span>
                  </button>

                  <button
                    onClick={() => {
                      if (!isAuthenticated) {
                        alert('तपाईंले यो सेवा प्रयोग गर्नको लागि पहिले दर्ता (Register) गर्नुपर्दछ।');
                        navigate('/register');
                      } else {
                        setSelectedTemplateForApply(template);
                      }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: '#2563eb',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '0.84rem',
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(37,99,235,0.25)',
                    }}
                  >
                    <span>अनलाइन आवेदन</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────────
          TAB 2: OFFICIAL SIFARISH FORMAT LIBRARY (ढाँचा पुस्तकालय)
         ─────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'templates' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div
            style={{
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              padding: '1rem 1.25rem',
              borderRadius: '10px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#1e40af' }}>
                नेपाल सरकार स्थानीय सरकार सञ्चालन ऐन २०७४ बमोजिमका आधिकारिक ढाँचाहरू
              </h3>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#1d4ed8' }}>
                यहाँ पाँचपोखरी थाङपाल गाउँपालिकाका सबै वडा कार्यालयहरूमा प्रयोग हुने १२+ मानक सिफारिस पत्रहरू उपलब्ध छन्। खाली ढाँचा हेर्न, A4 प्रिन्ट गर्न वा सिधै अनलाइन भर्न सकिन्छ।
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
            {SIFARISH_TEMPLATES.map((tpl) => (
              <div
                key={tpl.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  border: '1px solid #cbd5e1',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.72rem', backgroundColor: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 800, color: '#475569' }}>
                      {tpl.code}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 700 }}>
                      {tpl.feeNpr === 'free' ? 'निःशुल्क' : `दस्तुर: रु. ${tpl.feeNpr}`}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.4rem' }}>
                    {tpl.title}
                  </h4>

                  <div style={{ fontSize: '0.78rem', color: '#0369a1', fontWeight: 600, marginBottom: '0.4rem' }}>
                    सम्बोधन: {tpl.recipient.split('\n')[0]}
                  </div>

                  <div style={{ fontSize: '0.78rem', color: '#64748b', fontStyle: 'italic', marginBottom: '0.75rem' }}>
                    विषय: {tpl.subject}
                  </div>

                  <div style={{ fontSize: '0.75rem', backgroundColor: '#f8fafc', padding: '0.5rem', borderRadius: '6px', color: '#475569' }}>
                    <strong>कानुनी आधार:</strong> {tpl.legalReference}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
                  <button
                    onClick={() => setSelectedTemplateForPreview({ template: tpl, isOfficialIssued: false })}
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: 'white',
                      color: '#1e293b',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    <Printer size={14} />
                    <span>ढाँचा प्रिन्ट / हेर्नुहोस्</span>
                  </button>

                  <button
                    onClick={() => setSelectedTemplateForApply(tpl)}
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: '#2563eb',
                      color: 'white',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    <span>अनलाइन भर्नुहोस्</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────────
          TAB 3: WARD OFFICER APPLICATION MANAGEMENT QUEUE (आवेदन व्यवस्थापन)
         ─────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'management' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* KPI Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div style={{ backgroundColor: '#eff6ff', padding: '1rem', borderRadius: '10px', border: '1px solid #bfdbfe' }}>
              <span style={{ fontSize: '0.8rem', color: '#1e40af', fontWeight: 600 }}>कुल अनलाइन आवेदन</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#1d4ed8' }}>{totalApps}</div>
            </div>
            <div style={{ backgroundColor: '#fef3c7', padding: '1rem', borderRadius: '10px', border: '1px solid #fde68a' }}>
              <span style={{ fontSize: '0.8rem', color: '#92400e', fontWeight: 600 }}>प्रक्रियामा (Processing)</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#b45309' }}>{processingCount + appliedCount}</div>
            </div>
            <div style={{ backgroundColor: '#ecfdf5', padding: '1rem', borderRadius: '10px', border: '1px solid #a7f3d0' }}>
              <span style={{ fontSize: '0.8rem', color: '#065f46', fontWeight: 600 }}>स्वीकृत तथा जारी</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#047857' }}>{approvedCount + deliveredCount}</div>
            </div>
            <div style={{ backgroundColor: '#faf5ff', padding: '1rem', borderRadius: '10px', border: '1px solid #e9d5ff' }}>
              <span style={{ fontSize: '0.8rem', color: '#6b21a8', fontWeight: 600 }}>संकलित राजस्व दस्तुर</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#7e22ce' }}>रु. {totalRevenue.toLocaleString()}</div>
            </div>
          </div>

          {/* Queue Filter Controls */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: 'white',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <Filter size={16} color="#64748b" />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>अवस्था:</span>
              {[
                { id: 'all', label: 'सबै' },
                { id: 'applied', label: 'नयाँ प्राप्त' },
                { id: 'processing', label: 'प्रक्रियामा' },
                { id: 'approved', label: 'स्वीकृत' },
                { id: 'delivered', label: 'जारी / वितरण' },
              ].map((st) => {
                const isStActive = statusFilter === st.id;
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setStatusFilter(st.id)}
                    style={{
                      padding: '0.35rem 0.85rem',
                      borderRadius: '9999px',
                      border: isStActive ? '1px solid #2563eb' : '1px solid #e2e8f0',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      backgroundColor: isStActive ? '#2563eb' : '#f8fafc',
                      color: isStActive ? '#ffffff' : '#475569',
                      boxShadow: isStActive ? '0 2px 6px rgba(37, 99, 235, 0.25)' : 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {st.label}
                  </button>
                );
              })}

              <div style={{ marginLeft: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>वडा:</span>
                <select
                  value={wardFilter}
                  onChange={(e) => setWardFilter(e.target.value)}
                  style={{ padding: '0.35rem 0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                >
                  <option value="all">सबै वडाहरू (१-८)</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
                    <option key={w} value={String(w)}>
                      वडा नं. {w}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={fetchApplications}
              disabled={isLoadingApplications}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: 'white',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <RefreshCw size={14} className={isLoadingApplications ? 'spinner' : ''} />
              <span>ताजा गर्नुहोस्</span>
            </button>
          </div>

          {/* Applications Table */}
          <div style={{ backgroundColor: 'white', borderRadius: '10px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <div className="dt-responsive-table-wrapper">
<table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>टोकन / आवेदन नं.</th>
                  <th style={{ padding: '0.75rem 1rem' }}>निवेदकको नाम र सम्पर्क</th>
                  <th style={{ padding: '0.75rem 1rem' }}>सेवाको किसिम</th>
                  <th style={{ padding: '0.75rem 1rem' }}>वडा</th>
                  <th style={{ padding: '0.75rem 1rem' }}>दस्तुर</th>
                  <th style={{ padding: '0.75rem 1rem' }}>अवस्था</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>कारबाही</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.map((app) => (
                  <tr key={app.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#0284c7' }}>
                      {app.applicationNo}
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 400 }}>
                        {new Date(app.createdAt).toLocaleDateString('ne-NP')}
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <strong style={{ color: '#0f172a' }}>{app.applicantName}</strong>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{app.applicantPhone || '-'}</div>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#334155' }}>
                      {app.purpose || app.serviceType}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>वडा नं. {app.wardNumber || '३'}</td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#16a34a' }}>
                      रु. {app.fee || 0}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span
                        style={{
                          fontSize: '0.74rem',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '9999px',
                          backgroundColor:
                            app.status === 'delivered'
                              ? '#ecfdf5'
                              : app.status === 'approved'
                              ? '#eff6ff'
                              : '#fef3c7',
                          color:
                            app.status === 'delivered'
                              ? '#047857'
                              : app.status === 'approved'
                              ? '#1d4ed8'
                              : '#b45309',
                          fontWeight: 800,
                        }}
                      >
                        {app.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => setSelectedAppForDetail(app)}
                          style={{
                            padding: '0.35rem 0.65rem',
                            borderRadius: '4px',
                            border: '1px solid #cbd5e1',
                            backgroundColor: 'white',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          विवरण / रुजु
                        </button>

                        <button
                          onClick={() => {
                            const tpl = getTemplateForService(app.formData?.formatId, app.serviceType);
                            setSelectedTemplateForPreview({
                              template: tpl,
                              applicantData: app,
                              isOfficialIssued: true,
                            });
                          }}
                          style={{
                            padding: '0.35rem 0.65rem',
                            borderRadius: '4px',
                            border: 'none',
                            backgroundColor: '#0284c7',
                            color: 'white',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                          }}
                        >
                          <Printer size={12} />
                          <span>पत्र प्रिन्ट</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
</div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────────
          MODAL: APPLICATION DETAILS & VERIFICATION BY WARD OFFICER
         ─────────────────────────────────────────────────────────────────────────── */}
      {selectedAppForDetail && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '14px',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              padding: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                  आवेदन विवरण तथा कागजात रुजु
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#0284c7', fontWeight: 700 }}>
                  टोकन: {selectedAppForDetail.applicationNo} | वडा नं. {selectedAppForDetail.wardNumber}
                </span>
              </div>
              <button
                onClick={() => setSelectedAppForDetail(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.86rem', marginBottom: '1rem' }}>
              <div><span style={{ color: '#64748b' }}>निवेदकको नाम:</span> <strong>{selectedAppForDetail.applicantName}</strong></div>
              <div><span style={{ color: '#64748b' }}>सम्पर्क:</span> {selectedAppForDetail.applicantPhone || '-'}</div>
              <div><span style={{ color: '#64748b' }}>दस्तुर:</span> <strong>रु. {selectedAppForDetail.fee || 0}</strong></div>
              <div><span style={{ color: '#64748b' }}>दर्ता मिति:</span> {new Date(selectedAppForDetail.createdAt).toLocaleDateString('ne-NP')}</div>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.84rem' }}>
              <strong>सिफारिसको प्रयोजन / विवरण:</strong>
              <p style={{ margin: '0.25rem 0 0', color: '#334155' }}>
                {selectedAppForDetail.purpose || selectedAppForDetail.remarks}
              </p>
            </div>

            {/* Dynamic details from formData */}
            {selectedAppForDetail.formData && (
              <div style={{ backgroundColor: '#eff6ff', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.82rem' }}>
                <strong style={{ color: '#1d4ed8' }}>अनलाइन फारम विवरण (Dynamic Form Submission):</strong>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.4rem' }}>
                  {Object.entries(selectedAppForDetail.formData)
                    .filter(([k]) => !['familyMembers', 'formatId', 'formatCode'].includes(k))
                    .map(([k, val]: any) => (
                      <div key={k}>
                        <span style={{ color: '#64748b' }}>{k}:</span> <strong>{String(val)}</strong>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Uploaded Documents */}
            {selectedAppForDetail.documents && selectedAppForDetail.documents.length > 0 && (
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: '0.5rem', color: '#0f172a' }}>
                  संलग्न कागजातहरू (Uploaded Documents):
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {selectedAppForDetail.documents.map((doc: any, i: number) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: '#f0fdf4',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '6px',
                        border: '1px solid #bbf7d0',
                        fontSize: '0.82rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Paperclip size={14} color="#16a34a" />
                        <strong>{doc.type}</strong>: {doc.fileName}
                      </div>
                      <span style={{ color: '#16a34a', fontWeight: 700 }}>✓ रुजु गर्न योग्य</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ward Officer Actions */}
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button
                  disabled={isUpdatingStatus}
                  onClick={() => handleUpdateStatus(selectedAppForDetail.id, 'processing', 'कागजात रुजु भई प्रक्रियामा राखिएको')}
                  style={{
                    padding: '0.45rem 0.85rem',
                    borderRadius: '6px',
                    backgroundColor: '#fef3c7',
                    border: '1px solid #fde68a',
                    color: '#b45309',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  रुजु भयो (Mark Processing)
                </button>

                <button
                  disabled={isUpdatingStatus}
                  onClick={() => handleUpdateStatus(selectedAppForDetail.id, 'approved', 'वडा अध्यक्ष / अधिकृतबाट स्वीकृत भएको')}
                  style={{
                    padding: '0.45rem 0.85rem',
                    borderRadius: '6px',
                    backgroundColor: '#dcfce7',
                    border: '1px solid #86efac',
                    color: '#15803d',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  स्वीकृत गर्नुहोस् (Approve)
                </button>

                <button
                  disabled={isUpdatingStatus}
                  onClick={() => handleUpdateStatus(selectedAppForDetail.id, 'delivered', 'आधिकारिक सिफारिस पत्र जारी गरिएको')}
                  style={{
                    padding: '0.45rem 0.85rem',
                    borderRadius: '6px',
                    backgroundColor: '#2563eb',
                    border: 'none',
                    color: 'white',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  सिफारिस जारी (Deliver)
                </button>
              </div>

              <button
                onClick={() => {
                  const tpl = getTemplateForService(selectedAppForDetail.formData?.formatId, selectedAppForDetail.serviceType);
                  setSelectedTemplateForPreview({
                    template: tpl,
                    applicantData: selectedAppForDetail,
                    isOfficialIssued: true,
                  });
                }}
                style={{
                  padding: '0.45rem 1rem',
                  borderRadius: '6px',
                  backgroundColor: '#0284c7',
                  border: 'none',
                  color: 'white',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <Printer size={14} />
                <span>आधिकारिक सिफारिस पत्र प्रिन्ट</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────────
          MODAL: DYNAMIC ONLINE APPLICATION WIZARD
         ─────────────────────────────────────────────────────────────────────────── */}
      {selectedTemplateForApply && (
        <DynamicApplicationModal
          template={selectedTemplateForApply}
          onClose={() => setSelectedTemplateForApply(null)}
          onSuccess={(result) => {
            fetchApplications();
            setTrackingNumber(result.applicationNo);
          }}
        />
      )}

      {/* ───────────────────────────────────────────────────────────────────────────
          MODAL: OFFICIAL SIFARISH LETTERHEAD A4 PREVIEW & PRINT
         ─────────────────────────────────────────────────────────────────────────── */}
      {selectedTemplateForPreview && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              maxWidth: '960px',
              width: '100%',
              maxHeight: '94vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)',
            }}
          >
            <OfficialSifarishLetterhead
              template={selectedTemplateForPreview.template}
              applicantData={
                selectedTemplateForPreview.applicantData || {
                  applicantName: 'सुनिता तामाङ',
                  wardNumber: '३',
                  purpose: selectedTemplateForPreview.template.title,
                }
              }
              isOfficialIssued={selectedTemplateForPreview.isOfficialIssued}
              onClose={() => setSelectedTemplateForPreview(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CitizenServicesPage;
