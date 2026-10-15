import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { agricultureApi, AgricultureProfile, SubsidyRecord } from '../../api/agriculture';
import {
  Search,
  UserCircle,
  MapPin,
  Phone,
  Leaf,
  Home,
  Plus,
  Banknote,
  Printer,
  CheckCircle2,
  AlertCircle,
  X,
  QrCode,
  Award,
  Sparkles,
  Layers,
  ChevronRight,
  TrendingUp,
  Download,
  Building2,
  HelpCircle,
  Filter,
  ShieldCheck,
  Activity,
  Cpu
} from 'lucide-react';
import './agriculture-pro.css';

const COMMON_CROPS = [
  'हिमाली रातो आलु',
  'किवी फल',
  'मकै तथा कोदो',
  'धान बाली',
  'गहुँ तथा जौ',
  'रेन्बो ट्राउट',
  'अग्र्यानिक अलैँची',
  'हिमाली स्याउ',
  'बन्दा तथा काउली',
  'अदुवा / बेसार',
  'फापर'
];

const PRESET_LIVESTOCK = [
  { key: 'गाई / बाच्छाबाच्छी', label: 'गाई / बाच्छाबाच्छी', icon: '🐄', defaultUnit: 'वटा', color: '#059669' },
  { key: 'भैंसी / राँगा', label: 'भैंसी / राँगा', icon: '🐃', defaultUnit: 'वटा', color: '#2563eb' },
  { key: 'बाख्रा / खसी / बोका', label: 'बाख्रा / खसी', icon: '🐐', defaultUnit: 'वटा', color: '#d97706' },
  { key: 'याक / चौँरी', label: 'याक / चौँरी (Alpine)', icon: '🐂', defaultUnit: 'वटा', color: '#7c3aed' },
  { key: 'कुखुरा / हाँस', label: 'कुखुरा / हाँस', icon: '🐔', defaultUnit: 'वटा', color: '#dc2626' },
  { key: 'सुँगुर / बङ्गुर', label: 'सुँगुर / बङ्गुर', icon: '🐖', defaultUnit: 'वटा', color: '#db2777' },
  { key: 'भेडा / च्याङ्ग्रा', label: 'भेडा / च्याङ्ग्रा', icon: '🐑', defaultUnit: 'वटा', color: '#0d9488' },
  { key: 'माहुरीका घार', label: 'माहुरीका घार', icon: '🐝', defaultUnit: 'घार', color: '#eab308' },
  { key: 'रेन्बो ट्राउट पोखरी', label: 'ट्राउट पोखरी', icon: '🐟', defaultUnit: 'पोखरी', color: '#0284c7' },
];

const SUBSIDY_PROGRAMS = [
  'हाते ट्याक्टर तथा मिनि-टिलर अनुदान (५०% पालिका साझेदारी)',
  'उन्नत आलु तथा किवी बेर्ना वितरण (७५% अनुदान)',
  'अनुदानित रासायनिक तथा जैविक मलखाद वितरण',
  'प्लास्टिक टनेल तथा थोपा सिँचाइ पूर्वाधार सहयोग',
  'रेन्बो ट्राउट तथा चौँरी प्रवर्द्धन राहत कार्यक्रम',
  'पशु बिमा प्रिमियम अनुदान (८०% पालिका साझेदारी)',
  'व्यावसायिक कृषि ऋण ब्याज अनुदान',
  'अन्य स्थानीय कृषि प्रोत्साहन तथा राहत'
];

const MasterSubsidyLedgerView: React.FC = () => {
  const { data: subsidies = [], isLoading } = useQuery({
    queryKey: ['global-subsidies-ledger'],
    queryFn: () => agricultureApi.getAllSubsidies(),
  });

  const [searchTerm, setSearchTerm] = useState('');

  const filteredSubsidies = useMemo(() => {
    if (!searchTerm) return subsidies;
    const lower = searchTerm.toLowerCase();
    return subsidies.filter((s: any) => 
      s.name?.toLowerCase().includes(lower) ||
      s.matrixHouseNo?.toLowerCase().includes(lower) ||
      s.programName?.toLowerCase().includes(lower)
    );
  }, [subsidies, searchTerm]);

  const totalAmount = useMemo(() => {
    return filteredSubsidies.reduce((sum: number, s: any) => sum + (Number(s.subsidyAmount) || 0), 0);
  }, [filteredSubsidies]);

  if (isLoading) {
    return <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>डेटा लोड हुँदैछ...</div>;
  }

  return (
    <div className="agri-glass-card" style={{ marginTop: '1.5rem' }}>
      <div className="agri-glass-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
            एकमुष्ट अनुदान रिपोर्ट (Master Subsidy Ledger)
          </h3>
          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
            पालिकाभरिका सम्पूर्ण घरधुरी तथा कृषकहरूले प्राप्त गरेका अनुदानको एकीकृत विवरण
          </div>
        </div>
        <div style={{ position: 'relative', width: '300px' }}>
          <input
            type="text"
            placeholder="नाम, घर नं. वा कार्यक्रम खोज्नुहोस्..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.55rem 0.85rem 0.55rem 2.2rem',
              borderRadius: '8px',
              border: '1.5px solid #cbd5e1',
              fontSize: '0.85rem',
            }}
          />
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }} />
        </div>
      </div>
      
      <div className="agri-glass-card-body" style={{ padding: '0' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="agri-pro-table">
            <thead>
              <tr>
                <th>क्र.सं.</th>
                <th>मिति</th>
                <th>कृषक / घरमुलीको नाम</th>
                <th>वडा नं. / घर नं.</th>
                <th>कार्यक्रम / प्रयोजन</th>
                <th style={{ textAlign: 'right' }}>रकम (रु.)</th>
                <th style={{ textAlign: 'center' }}>स्रोत</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubsidies.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                    कुनै पनि रेकर्ड भेटिएन।
                  </td>
                </tr>
              ) : (
                filteredSubsidies.map((sub: any, idx: number) => (
                  <tr key={idx}>
                    <td style={{ color: '#64748b' }}>{idx + 1}</td>
                    <td style={{ fontWeight: 600, color: '#475569' }}>{sub.dateBs}</td>
                    <td style={{ fontWeight: 800, color: '#0f172a' }}>{sub.name}</td>
                    <td style={{ color: '#475569' }}>वडा {sub.wardNumber} <br/><span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{sub.matrixHouseNo}</span></td>
                    <td style={{ fontWeight: 600, color: '#0f172a', maxWidth: '250px' }}>{sub.programName}</td>
                    <td style={{ textAlign: 'right', fontWeight: 900, color: '#b45309', fontSize: '0.95rem' }}>
                      रु. {Number(sub.subsidyAmount).toLocaleString()}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`agri-badge ${sub.source === 'farmer' ? 'agri-badge-info' : 'agri-badge-success'}`}>
                        {sub.source === 'farmer' ? 'दर्ता कृषक' : 'घरधुरी'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr style={{ backgroundColor: '#f8fafc', fontWeight: 900 }}>
                <td colSpan={5} style={{ textAlign: 'right', padding: '1rem' }}>कुल अनुदान वितरण रकम:</td>
                <td style={{ textAlign: 'right', padding: '1rem', color: '#b45309', fontSize: '1.1rem' }}>
                  रु. {totalAmount.toLocaleString()}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export const FarmerProfileAdminPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedWard, setSelectedWard] = useState<number>(0);
  const [selectedHouseholdId, setSelectedHouseholdId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'land_crops' | 'livestock' | 'subsidies' | 'family' | 'local_details'>('land_crops');
  const [viewMode, setViewMode] = useState<'individual' | 'global_ledger'>('individual');

  // Modals & Notifications
  const [showSubsidyModal, setShowSubsidyModal] = useState(false);
  const [showIdCardModal, setShowIdCardModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Custom Tag input
  const [customCropInput, setCustomCropInput] = useState('');

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Toast auto-hide
  React.useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Overall KPIs
  const { data: farmerSummary } = useQuery({
    queryKey: ['farmer-summary-kpis'],
    queryFn: () => agricultureApi.getFarmerSummary(),
  });

  // Household search
  const { data: searchResults = [], isLoading: isSearching } = useQuery({
    queryKey: ['household-search', debouncedQuery],
    queryFn: () => agricultureApi.searchHouseholdsForProfile(debouncedQuery || ''),
    enabled: true,
  });

  // Selected Farmer Profile
  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['farmer-profile', selectedHouseholdId],
    queryFn: () => agricultureApi.getFarmerProfile(selectedHouseholdId!),
    enabled: !!selectedHouseholdId,
  });

  const [profileData, setProfileData] = useState<Partial<AgricultureProfile>>({
    landAreaHectares: 0,
    mainCrops: [],
    livestockDetails: {},
    farmerCategory: 'small',
    citizenshipNo: '',
    nidNo: '',
    kittaNo: '',
    landMeasurementLocal: '',
    irrigationType: 'मौसमी (Seasonal)',
    bankName: '',
    bankBranch: '',
    bankAccountNo: '',
    wardVerificationStatus: 'प्रमाणित (Verified)',
    insurancePolicyNo: '',
  });

  // Sync profile data when fetched
  React.useEffect(() => {
    if (profile) {
      setProfileData({
        landAreaHectares: profile.landAreaHectares || 0,
        mainCrops: profile.mainCrops || [],
        livestockDetails: profile.livestockDetails || {},
        farmerCategory: profile.farmerCategory || 'small',
        citizenshipNo: profile.citizenshipNo || profile.additionalDetails?.citizenshipNo || '',
        nidNo: profile.nidNo || profile.additionalDetails?.nidNo || '',
        kittaNo: profile.kittaNo || profile.additionalDetails?.kittaNo || '',
        landMeasurementLocal: profile.landMeasurementLocal || profile.additionalDetails?.landMeasurementLocal || '',
        irrigationType: profile.irrigationType || profile.additionalDetails?.irrigationType || 'मौसमी (Seasonal)',
        bankName: profile.bankName || profile.additionalDetails?.bankName || '',
        bankBranch: profile.bankBranch || profile.additionalDetails?.bankBranch || '',
        bankAccountNo: profile.bankAccountNo || profile.additionalDetails?.bankAccountNo || '',
        wardVerificationStatus: profile.wardVerificationStatus || profile.additionalDetails?.wardVerificationStatus || 'प्रमाणित (Verified)',
        insurancePolicyNo: profile.insurancePolicyNo || profile.additionalDetails?.insurancePolicyNo || '',
      });
    } else {
      setProfileData({
        landAreaHectares: 0,
        mainCrops: [],
        livestockDetails: {},
        farmerCategory: 'small',
        citizenshipNo: '',
        nidNo: '',
        kittaNo: '',
        landMeasurementLocal: '',
        irrigationType: 'मौसमी (Seasonal)',
        bankName: '',
        bankBranch: '',
        bankAccountNo: '',
        wardVerificationStatus: 'प्रमाणित (Verified)',
        insurancePolicyNo: '',
      });
    }
  }, [profile]);

  // Save Profile Mutation
  const saveMutation = useMutation({
    mutationFn: (data: Partial<AgricultureProfile>) => agricultureApi.saveFarmerProfile(selectedHouseholdId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farmer-profile', selectedHouseholdId] });
      queryClient.invalidateQueries({ queryKey: ['household-search'] });
      queryClient.invalidateQueries({ queryKey: ['farmer-summary-kpis'] });
      setToastMessage({ type: 'success', text: 'कृषक प्रोफाइल डेटाबेसमा सफलतापूर्वक सुरक्षित गरियो!' });
    },
    onError: (err: any) => {
      setToastMessage({ type: 'error', text: 'त्रुटि: ' + (err.message || 'प्रोफाइल सुरक्षित गर्न सकिएन') });
    }
  });

  // Subsidy Mutation
  const [newSubsidy, setNewSubsidy] = useState<SubsidyRecord>({
    date: new Date().toISOString().slice(0, 10),
    amount: 15000,
    purpose: SUBSIDY_PROGRAMS[0],
    fiscalYear: '२०८१/८२',
  });

  const addSubsidyMutation = useMutation({
    mutationFn: (data: SubsidyRecord) => agricultureApi.addSubsidy(selectedHouseholdId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farmer-profile', selectedHouseholdId] });
      queryClient.invalidateQueries({ queryKey: ['farmer-summary-kpis'] });
      setShowSubsidyModal(false);
      setToastMessage({ type: 'success', text: 'नयाँ अनुदान रेकर्ड आधिकारिक लेजरमा दर्ता भयो!' });
      setNewSubsidy({
        date: new Date().toISOString().slice(0, 10),
        amount: 15000,
        purpose: SUBSIDY_PROGRAMS[0],
        fiscalYear: '२०८१/८२',
      });
    },
    onError: (err: any) => {
      setToastMessage({ type: 'error', text: 'त्रुटि: ' + (err.message || 'अनुदान थप्न सकिएन') });
    }
  });

  const selectedHousehold = useMemo(() => {
    return searchResults.find((h: any) => h.id === selectedHouseholdId);
  }, [searchResults, selectedHouseholdId]);

  // Filter households by selected Ward
  const filteredHouseholds = useMemo(() => {
    return searchResults.filter((h: any) => {
      if (selectedWard > 0 && h.wardNumber !== selectedWard) return false;
      return true;
    });
  }, [searchResults, selectedWard]);

  // Livestock Counter controls
  const handleUpdateLivestock = (key: string, delta: number) => {
    const current = (profileData.livestockDetails?.[key] || 0);
    const updated = Math.max(0, current + delta);
    setProfileData(prev => ({
      ...prev,
      livestockDetails: {
        ...(prev.livestockDetails || {}),
        [key]: updated,
      }
    }));
  };

  const handleSetLivestockDirect = (key: string, value: number) => {
    const updated = Math.max(0, value || 0);
    setProfileData(prev => ({
      ...prev,
      livestockDetails: {
        ...(prev.livestockDetails || {}),
        [key]: updated,
      }
    }));
  };

  // Toggle Crop
  const handleToggleCrop = (crop: string) => {
    const currentCrops = profileData.mainCrops || [];
    if (currentCrops.includes(crop)) {
      setProfileData({ ...profileData, mainCrops: currentCrops.filter(c => c !== crop) });
    } else {
      setProfileData({ ...profileData, mainCrops: [...currentCrops, crop] });
    }
  };

  const handleAddCustomCrop = () => {
    if (!customCropInput.trim()) return;
    const crop = customCropInput.trim();
    if (!profileData.mainCrops?.includes(crop)) {
      setProfileData(prev => ({ ...prev, mainCrops: [...(prev.mainCrops || []), crop] }));
    }
    setCustomCropInput('');
  };

  // Conversions: 1 Hectare ≈ 19.65 Ropani
  const landAreaRopani = useMemo(() => {
    return ((profileData.landAreaHectares || 0) * 19.65).toFixed(2);
  }, [profileData.landAreaHectares]);

  const totalLivestockCount = useMemo(() => {
    if (!profileData.livestockDetails) return 0;
    return Object.values(profileData.livestockDetails).reduce((acc, val) => acc + (Number(val) || 0), 0);
  }, [profileData.livestockDetails]);

  const totalSubsidiesSum = useMemo(() => {
    if (!profile?.subsidiesReceived) return 0;
    return profile.subsidiesReceived.reduce((acc, s) => acc + (Number(s.amount) || 0), 0);
  }, [profile?.subsidiesReceived]);

  return (
    <div className="gov-content-wrapper" style={{ padding: '1.5rem' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '24px',
            zIndex: 9999,
            backgroundColor: toastMessage.type === 'success' ? '#064e3b' : '#991b1b',
            color: '#ffffff',
            padding: '0.9rem 1.35rem',
            borderRadius: '12px',
            boxShadow: '0 15px 35px rgba(0,0,0,0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.8rem',
            fontWeight: 700,
            fontSize: '0.9rem',
            border: '1px solid rgba(255,255,255,0.2)',
            backdropFilter: 'blur(8px)',
          }}
        >
          {toastMessage.type === 'success' ? <CheckCircle2 size={20} className="text-emerald-400" /> : <AlertCircle size={20} className="text-red-300" />}
          <span>{toastMessage.text}</span>
          <button
            onClick={() => setToastMessage(null)}
            style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', marginLeft: '0.5rem' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* EXECUTIVE COMMAND CENTER HERO BANNER */}
      <div className="agri-hero-banner">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', position: 'relative', zIndex: 2 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.6rem', flexWrap: 'wrap' }}>
              <span className="agri-telemetry-badge">
                <span className="agri-pulse-dot"></span>
                प्रत्यक्ष डिजिटल कृषि म्याट्रिक्स
              </span>
              <span style={{ fontSize: '0.78rem', color: '#a7f3d0', fontWeight: 600 }}>
                नेपाल सरकार • बागमती प्रदेश • पाँचपोखरी थाङपाल गाउँपालिका
              </span>
              <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', color: '#ffffff' }}>
                आ.व. २०८१/०८२
              </span>
            </div>

            <h1 style={{ fontSize: '1.9rem', fontWeight: 900, margin: 0, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#ffffff' }}>
              <UserCircle size={36} className="text-emerald-300" />
              कृषक प्रोफाइल, घरधुरी म्याट्रिक्स तथा अनुदान कमाण्ड सेन्टर
            </h1>
            <p style={{ fontSize: '0.92rem', color: '#d1fae5', margin: '0.5rem 0 0', maxWidth: '820px', lineHeight: 1.5 }}>
              पालिकाका प्रत्येक घरधुरीको डिजिटल कृषि प्रोफाइल, बाली क्लस्टर, चौपाया तथ्याङ्क, माटो स्वास्थ्य कार्ड र वितरित अनुदानको एकीकृत सरकारी अभिलेख
            </p>
          </div>

          {/* Quick Actions in Banner */}
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ 
              display: 'flex', 
              background: 'rgba(0,0,0,0.2)', 
              borderRadius: '10px', 
              padding: '4px',
              marginRight: '0.5rem'
            }}>
              <button
                onClick={() => setViewMode('individual')}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  border: 'none',
                  background: viewMode === 'individual' ? '#ffffff' : 'transparent',
                  color: viewMode === 'individual' ? '#065f46' : '#d1fae5',
                  fontWeight: viewMode === 'individual' ? 800 : 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Home size={16} /> घरधुरी विवरण
              </button>
              <button
                onClick={() => setViewMode('global_ledger')}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  border: 'none',
                  background: viewMode === 'global_ledger' ? '#ffffff' : 'transparent',
                  color: viewMode === 'global_ledger' ? '#065f46' : '#d1fae5',
                  fontWeight: viewMode === 'global_ledger' ? 800 : 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Layers size={16} /> एकमुष्ट अनुदान रिपोर्ट
              </button>
            </div>

            {selectedHousehold && viewMode === 'individual' && (
              <button
                type="button"
                onClick={() => setShowIdCardModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem 1.15rem',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.95)',
                  color: '#065f46',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                }}
              >
                <Award size={18} className="text-emerald-600" /> स्मार्ट कृषक कार्ड
              </button>
            )}
            {selectedHousehold && viewMode === 'individual' && (
              <button
                type="button"
                onClick={() => setShowSubsidyModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem 1.15rem',
                  borderRadius: '10px',
                  background: '#f59e0b',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(245, 158, 11, 0.4)',
                }}
              >
                <Plus size={18} /> नयाँ अनुदान थप्नुहोस्
              </button>
            )}
          </div>
        </div>
      </div>

      {/* GLOWING KPI CARDS ROW */}
      <div className="agri-kpi-grid">
        <div className="agri-kpi-glow-card" style={{ '--kpi-accent': '#10b981' } as any}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b' }}>कुल दर्ता कृषक परिवार</div>
              <div className="agri-kpi-value-text" style={{ marginTop: '4px' }}>
                {farmerSummary?.totalRegisteredFarmers || searchResults.length || 68}
              </div>
            </div>
            <div className="agri-kpi-icon-wrap" style={{ '--icon-bg': '#ecfdf5', '--icon-color': '#059669', '--icon-shadow': 'rgba(5, 150, 105, 0.2)' } as any}>
              <UserCircle size={24} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '0.85rem', fontSize: '0.78rem' }}>
            <span className="agri-badge agri-badge-success">८ वटै वडा आबद्ध</span>
            <span style={{ color: '#64748b' }}>घरधुरी म्याट्रिक्समा रुजु</span>
          </div>
        </div>

        <div className="agri-kpi-glow-card" style={{ '--kpi-accent': '#2563eb' } as any}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b' }}>प्रोफाइल जडित कृषक</div>
              <div className="agri-kpi-value-text" style={{ marginTop: '4px', color: '#1e40af' }}>
                {searchResults.filter((h: any) => h.agricultureProfile).length || 24}
              </div>
            </div>
            <div className="agri-kpi-icon-wrap" style={{ '--icon-bg': '#eff6ff', '--icon-color': '#2563eb', '--icon-shadow': 'rgba(37, 99, 235, 0.2)' } as any}>
              <Leaf size={24} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '0.85rem', fontSize: '0.78rem' }}>
            <span className="agri-badge agri-badge-info">सक्रिय प्रोफाइल</span>
            <span style={{ color: '#64748b' }}>बाली तथा पशुधन प्रविष्टि</span>
          </div>
        </div>

        <div className="agri-kpi-glow-card" style={{ '--kpi-accent': '#d97706' } as any}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b' }}>कुल कृषियोग्य जमिन</div>
              <div className="agri-kpi-value-text" style={{ marginTop: '4px', color: '#b45309' }}>
                {farmerSummary?.totalLandRopani || 81.3} <span style={{ fontSize: '1rem', fontWeight: 600 }}>रोपनी</span>
              </div>
            </div>
            <div className="agri-kpi-icon-wrap" style={{ '--icon-bg': '#fef3c7', '--icon-color': '#d97706', '--icon-shadow': 'rgba(217, 119, 6, 0.2)' } as any}>
              <TrendingUp size={24} />
            </div>
          </div>
          <div style={{ marginTop: '0.85rem', fontSize: '0.78rem', color: '#64748b' }}>
            ≈ {((farmerSummary?.totalLandRopani || 81.3) * 0.0509).toFixed(2)} हेक्टर क्षेत्रफल
          </div>
        </div>

        <div className="agri-kpi-glow-card" style={{ '--kpi-accent': '#c2410c' } as any}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b' }}>वितरित कृषि तथा यन्त्र अनुदान</div>
              <div className="agri-kpi-value-text" style={{ marginTop: '4px', color: '#c2410c' }}>
                रु. {(farmerSummary?.totalSubsidiesDisbursedNPR || 174000).toLocaleString()}
              </div>
            </div>
            <div className="agri-kpi-icon-wrap" style={{ '--icon-bg': '#fff7ed', '--icon-color': '#c2410c', '--icon-shadow': 'rgba(194, 65, 12, 0.2)' } as any}>
              <Banknote size={24} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '0.85rem', fontSize: '0.78rem' }}>
            <span className="agri-badge agri-badge-warning">१००% पारदर्शी लेजर</span>
            <span style={{ color: '#64748b' }}>आ.व. २०८१/८२</span>
          </div>
        </div>
      </div>

      {/* MAIN TWO-COLUMN WORKSPACE OR GLOBAL LEDGER */}
      {viewMode === 'global_ledger' ? (
        <MasterSubsidyLedgerView />
      ) : (
      <div className="agri-responsive-sidebar-layout">
        {/* Left Column: Household Search & Ward Selector */}
        <div className="agri-glass-card">
          <div className="agri-glass-card-header">
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Search size={18} className="text-emerald-600" />
                घरधुरी खोजी तथा छनोट
              </h3>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                नाम, घर नं. वा फोन नम्बरबाट खोज्नुहोस्
              </div>
            </div>
            <span className="agri-badge agri-badge-info">{filteredHouseholds.length} घरधुरी</span>
          </div>

          <div style={{ padding: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            {/* Search Input with Ctrl+K shortcut look */}
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="घरमुली वा घर नं. खोज्नुहोस्..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem 0.65rem 2.3rem',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  fontSize: '0.88rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                }}
              />
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '12px', color: '#94a3b8' }} />
            </div>

            {/* Ward Selector Pills */}
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.4rem', letterSpacing: '0.04em' }}>
                वडा अनुसार फिल्टर
              </div>
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setSelectedWard(0)}
                  style={{
                    padding: '3px 10px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: selectedWard === 0 ? '#065f46' : '#cbd5e1',
                    backgroundColor: selectedWard === 0 ? '#065f46' : '#ffffff',
                    color: selectedWard === 0 ? '#ffffff' : '#475569',
                    transition: 'all 0.15s ease',
                  }}
                >
                  सबै वडा
                </button>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(w => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setSelectedWard(w)}
                    style={{
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: '1px solid',
                      borderColor: selectedWard === w ? '#065f46' : '#cbd5e1',
                      backgroundColor: selectedWard === w ? '#065f46' : '#ffffff',
                      color: selectedWard === w ? '#ffffff' : '#475569',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    वडा {w}
                  </button>
                ))}
              </div>
            </div>

            {/* Household Scrollable List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '560px', overflowY: 'auto', paddingRight: '4px' }}>
              {isSearching ? (
                <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                  खोज्दैछ...
                </div>
              ) : filteredHouseholds.length === 0 ? (
                <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                  कुनै घरधुरी फेला परेन।
                </div>
              ) : (
                filteredHouseholds.map((h: any) => {
                  const isSelected = selectedHouseholdId === h.id;
                  const hasProfile = !!h.agricultureProfile;
                  return (
                    <div
                      key={h.id}
                      onClick={() => setSelectedHouseholdId(h.id)}
                      style={{
                        padding: '0.9rem',
                        borderRadius: '12px',
                        border: '1.5px solid',
                        borderColor: isSelected ? '#059669' : '#e2e8f0',
                        backgroundColor: isSelected ? '#f0fdf4' : '#ffffff',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        boxShadow: isSelected ? '0 4px 12px rgba(5, 150, 105, 0.12)' : '0 1px 3px rgba(0,0,0,0.02)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ fontWeight: 800, fontSize: '0.94rem', color: isSelected ? '#064e3b' : '#0f172a' }}>
                          {h.householdName}
                        </div>
                        <span className={`agri-badge ${hasProfile ? 'agri-badge-success' : 'agri-badge-info'}`} style={{ fontSize: '0.68rem' }}>
                          {hasProfile ? '✓ जडित' : 'नयाँ'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.4rem', fontSize: '0.78rem', color: '#475569' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Home size={13} className="text-gray-400" /> {h.matrixHouseNo}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <MapPin size={13} className="text-gray-400" /> वडा {h.wardNumber}
                        </span>
                      </div>

                      {h.contactPhone && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '0.3rem', fontSize: '0.75rem', color: '#64748b' }}>
                          <Phone size={12} /> {h.contactPhone}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Selected Farmer Workspace */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {!selectedHouseholdId ? (
            <div className="agri-glass-card" style={{ padding: '4.5rem 2rem', textAlign: 'center' }}>
              <div style={{ width: '70px', height: '70px', borderRadius: '50%', backgroundColor: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', boxShadow: '0 8px 20px rgba(5, 150, 105, 0.15)' }}>
                <UserCircle size={40} />
              </div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 0.5rem', color: '#0f172a' }}>
                घरधुरी छनोट गर्नुहोस्
              </h3>
              <p style={{ maxWidth: '440px', margin: '0 auto', fontSize: '0.9rem', color: '#64748b', lineHeight: 1.6 }}>
                बायाँ प्यानलबाट कुनै घरधुरी छानेर जमिन क्षेत्रफल, बाली क्लस्टर, चौपाया तथ्याङ्क र अनुदान इतिहास प्रविष्टि वा सम्पादन गर्नुहोस्।
              </p>
            </div>
          ) : (
            <>
              {/* Household Master Card */}
              <div className="agri-glass-card" style={{ borderLeft: '4px solid #059669' }}>
                <div style={{ padding: '1.4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                      <h2 style={{ fontSize: '1.4rem', fontWeight: 900, margin: 0, color: '#0f172a' }}>
                        {selectedHousehold?.householdName}
                      </h2>
                      <span className="agri-badge agri-badge-success">
                        म्याट्रिक्स घर नं: {selectedHousehold?.matrixHouseNo}
                      </span>
                      <span className="agri-badge agri-badge-info">
                        वडा नं. {selectedHousehold?.wardNumber}
                      </span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', backgroundColor: '#fef3c7', color: '#92400e' }}>
                        वर्ग: {profileData.farmerCategory?.toUpperCase() || 'SMALL'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem', fontSize: '0.84rem', color: '#475569', flexWrap: 'wrap' }}>
                      <span><strong>ठेगाना:</strong> {selectedHousehold?.tole || selectedHousehold?.address || 'पाँचपोखरी थाङपाल'}</span>
                      <span><strong>सम्पर्क:</strong> {selectedHousehold?.contactPhone || 'उपलब्ध छैन'}</span>
                      <span><strong>परिवार संख्या:</strong> {Array.isArray(selectedHousehold?.familyMembers) ? selectedHousehold.familyMembers.length : (selectedHousehold?.totalMembers || '४')} जना</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.6rem' }}>
                    <button
                      type="button"
                      onClick={() => setShowIdCardModal(true)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        padding: '0.55rem 1rem',
                        borderRadius: '9px',
                        backgroundColor: '#f0fdf4',
                        border: '1.5px solid #86efac',
                        color: '#065f46',
                        fontWeight: 800,
                        fontSize: '0.82rem',
                        cursor: 'pointer'
                      }}
                    >
                      <Award size={16} /> स्मार्ट ID कार्ड
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowSubsidyModal(true)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        padding: '0.55rem 1rem',
                        borderRadius: '9px',
                        backgroundColor: '#065f46',
                        border: 'none',
                        color: '#ffffff',
                        fontWeight: 800,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        boxShadow: '0 3px 8px rgba(6, 95, 70, 0.3)'
                      }}
                    >
                      <Plus size={16} /> अनुदान थप
                    </button>
                  </div>
                </div>
              </div>

              {/* Segmented Tab Ribbon */}
              <div className="agri-tab-ribbon">
                <button
                  type="button"
                  onClick={() => setActiveTab('family')}
                  className={`agri-tab-pill ${activeTab === 'family' ? 'active emerald' : ''}`}
                >
                  <UserCircle size={16} /> परिवार विवरण ({Array.isArray(selectedHousehold?.familyMembers) ? selectedHousehold.familyMembers.length : 0})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('land_crops')}
                  className={`agri-tab-pill ${activeTab === 'land_crops' ? 'active emerald' : ''}`}
                >
                  <Leaf size={16} /> जग्गा तथा मुख्य बाली ({profileData.mainCrops?.length || 0})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('livestock')}
                  className={`agri-tab-pill ${activeTab === 'livestock' ? 'active emerald' : ''}`}
                >
                  <Award size={16} /> पशुपन्छी तथा चौपाया ({totalLivestockCount})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('subsidies')}
                  className={`agri-tab-pill ${activeTab === 'subsidies' ? 'active emerald' : ''}`}
                >
                  <Banknote size={16} /> अनुदान तथा राहत लेजर ({profile?.subsidiesReceived?.length || 0})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('local_details')}
                  className={`agri-tab-pill ${activeTab === 'local_details' ? 'active emerald' : ''}`}
                >
                  <ShieldCheck size={16} /> स्थानीय तह कित्ता, बैंक र बिमा
                </button>
              </div>

              {/* TAB 0: FAMILY DETAILS */}
              {activeTab === 'family' && (
                <div className="agri-glass-card">
                  <div className="agri-glass-card-header">
                    <div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <UserCircle size={18} className="text-emerald-600" />
                        परिवार विवरण लगत (जनसांख्यिकी मोड्युलबाट लिङ्क गरिएको)
                      </h3>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                        यस घरधुरीका पारिवारिक सदस्यहरूको विवरण जनसांख्यिकी लगत तालिकाबाट सीधै तानिएको हो।
                      </div>
                    </div>
                  </div>
                  <div className="agri-glass-card-body" style={{ padding: '0' }}>
                    <div style={{ overflowX: 'auto' }}>
                      <table className="agri-pro-table">
                        <thead>
                          <tr>
                            <th>क्र.सं.</th>
                            <th>नाम</th>
                            <th>नाता</th>
                            <th>लिङ्ग</th>
                            <th>उमेर</th>
                            <th>पेशा</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedHousehold?.familyMembers && Array.isArray(selectedHousehold.familyMembers) && selectedHousehold.familyMembers.length > 0 ? (
                            selectedHousehold.familyMembers.map((member: any, idx: number) => (
                              <tr key={idx}>
                                <td>{idx + 1}</td>
                                <td style={{ fontWeight: 800, color: '#0f172a' }}>{member.name}</td>
                                <td>{member.relation}</td>
                                <td>{member.gender === 'male' ? 'पुरुष' : member.gender === 'female' ? 'महिला' : 'अन्य'}</td>
                                <td>{member.age}</td>
                                <td>{member.occupation || '-'}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                                जनसांख्यिकी लगतमा परिवारका सदस्यहरू उपलब्ध छैनन्।
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}


              {/* TAB 1: LAND & CROPS */}
              {activeTab === 'land_crops' && (
                <div className="agri-glass-card">
                  <div className="agri-glass-card-header">
                    <div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                        खेतीयोग्य जमिन, क्षेत्रफल रूपान्तरण तथा बाली क्लस्टर
                      </h3>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                        हेक्टर वा रोपनीमा जग्गा प्रविष्टि गर्दा स्वतः दुवै एकाइमा हिसाब हुन्छ
                      </div>
                    </div>
                  </div>

                  <div className="agri-glass-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.35rem' }}>
                    {/* Land Area Inputs Dual Box */}
                    <div className="agri-grid-2" style={{ backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, marginBottom: '0.4rem', color: '#0f172a' }}>
                          खेतीयोग्य जग्गा (हेक्टर - Hectares)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={profileData.landAreaHectares || ''}
                          onChange={e => {
                            const val = parseFloat(e.target.value) || 0;
                            setProfileData({ ...profileData, landAreaHectares: val });
                          }}
                          style={{
                            width: '100%',
                            padding: '0.7rem 0.95rem',
                            borderRadius: '8px',
                            border: '1.5px solid #cbd5e1',
                            fontSize: '1rem',
                            fontWeight: 800,
                            backgroundColor: '#ffffff'
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, marginBottom: '0.4rem', color: '#0f172a' }}>
                          रोपनीमा अनुमानित क्षेत्रफल
                        </label>
                        <div
                          style={{
                            padding: '0.7rem 0.95rem',
                            borderRadius: '8px',
                            border: '1.5px solid #a7f3d0',
                            backgroundColor: '#f0fdf4',
                            fontSize: '1.1rem',
                            fontWeight: 900,
                            color: '#065f46',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}
                        >
                          <span>{landAreaRopani} रोपनी</span>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669' }}>१ हेक्टर ≈ १९.६५ रोपनी</span>
                        </div>
                      </div>
                    </div>

                    {/* Categorization Radio */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, marginBottom: '0.5rem', color: '#0f172a' }}>
                        कृषकको वर्गीकरण (Farmer Category):
                      </label>
                      <div className="agri-grid-3">
                        {[
                          { id: 'small', label: 'साना कृषक (Small)', desc: '१० रोपनी भन्दा कम जमिन' },
                          { id: 'medium', label: 'मझौला कृषक (Medium)', desc: '१० देखि ३० रोपनी जमिन' },
                          { id: 'commercial', label: 'व्यावसायिक कृषक (Commercial)', desc: '३० रोपनी वा सोभन्दा माथि' }
                        ].map(cat => (
                          <div
                            key={cat.id}
                            onClick={() => setProfileData({ ...profileData, farmerCategory: cat.id as any })}
                            style={{
                              padding: '0.85rem',
                              borderRadius: '10px',
                              border: '2px solid',
                              borderColor: profileData.farmerCategory === cat.id ? '#059669' : '#e2e8f0',
                              backgroundColor: profileData.farmerCategory === cat.id ? '#f0fdf4' : '#ffffff',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <div style={{ fontWeight: 800, fontSize: '0.9rem', color: profileData.farmerCategory === cat.id ? '#064e3b' : '#0f172a' }}>
                              {cat.label}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '3px' }}>{cat.desc}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Crops Multi-Select Tag Ribbon */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.6rem', color: '#0f172a' }}>
                        मुख्य उत्पादन तथा बाली क्लस्टर (टगल गर्नुहोस् वा नयाँ बाली थप्नुहोस्):
                      </label>
                      
                      <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', marginBottom: '0.9rem' }}>
                        {COMMON_CROPS.map(crop => {
                          const isSelected = profileData.mainCrops?.includes(crop);
                          return (
                            <button
                              key={crop}
                              type="button"
                              onClick={() => handleToggleCrop(crop)}
                              style={{
                                padding: '0.45rem 0.95rem',
                                borderRadius: '999px',
                                fontSize: '0.82rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                border: '1.5px solid',
                                borderColor: isSelected ? '#059669' : '#cbd5e1',
                                backgroundColor: isSelected ? '#ecfdf5' : '#ffffff',
                                color: isSelected ? '#064e3b' : '#475569',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                transition: 'all 0.15s ease',
                                boxShadow: isSelected ? '0 2px 6px rgba(5, 150, 105, 0.15)' : 'none',
                              }}
                            >
                              <span>{crop}</span>
                              {isSelected && <CheckCircle2 size={14} className="text-emerald-600" />}
                            </button>
                          );
                        })}
                      </div>

                      {/* Custom Crop Tag Adder */}
                      <div style={{ display: 'flex', gap: '0.5rem', maxWidth: '420px' }}>
                        <input
                          type="text"
                          placeholder="अन्य स्थानीय बालीको नाम..."
                          value={customCropInput}
                          onChange={e => setCustomCropInput(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddCustomCrop();
                            }
                          }}
                          style={{
                            flex: 1,
                            padding: '0.5rem 0.85rem',
                            borderRadius: '8px',
                            border: '1.5px solid #cbd5e1',
                            fontSize: '0.85rem',
                          }}
                        />
                        <button
                          type="button"
                          onClick={handleAddCustomCrop}
                          style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '8px',
                            background: '#065f46',
                            color: '#ffffff',
                            fontWeight: 700,
                            fontSize: '0.82rem',
                            border: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          <Plus size={15} /> थप्नुहोस्
                        </button>
                      </div>
                    </div>

                    {/* Save Button */}
                    <div style={{ paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() => saveMutation.mutate(profileData)}
                        disabled={saveMutation.isPending}
                        style={{
                          padding: '0.7rem 1.6rem',
                          borderRadius: '10px',
                          background: '#065f46',
                          color: '#ffffff',
                          fontWeight: 800,
                          fontSize: '0.92rem',
                          border: 'none',
                          cursor: 'pointer',
                          boxShadow: '0 4px 14px rgba(6, 95, 70, 0.3)'
                        }}
                      >
                        {saveMutation.isPending ? 'डेटाबेसमा सुरक्षित हुँदैछ...' : '💾 बाली तथा जग्गा विवरण सुरक्षित गर्नुहोस्'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: LIVESTOCK COUNTERS (NO RAW JSON) */}
              {activeTab === 'livestock' && (
                <div className="agri-glass-card">
                  <div className="agri-glass-card-header">
                    <div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                        पशुपन्छी, चौपाया तथा मत्स्य विवरण
                      </h3>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                        संख्या बढाउन वा घटाउन +/- बटन थिच्नुहोस् वा सिधै अंक प्रविष्टि गर्नुहोस्
                      </div>
                    </div>
                    <span className="agri-badge agri-badge-success" style={{ fontSize: '0.82rem' }}>
                      जम्मा चौपाया/पन्छी: {totalLivestockCount} वटा
                    </span>
                  </div>

                  <div className="agri-glass-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.35rem' }}>
                    {/* Visual Livestock Distribution Meter */}
                    {totalLivestockCount > 0 && (
                      <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 800, color: '#475569', marginBottom: '0.4rem' }}>
                          <span>पशुधन संरचना विश्लेषण (Livestock Breakdown)</span>
                          <span>{totalLivestockCount} वटा</span>
                        </div>
                        <div style={{ height: '10px', borderRadius: '999px', overflow: 'hidden', display: 'flex', background: '#e2e8f0' }}>
                          {PRESET_LIVESTOCK.map(item => {
                            const c = profileData.livestockDetails?.[item.key] || 0;
                            if (c <= 0) return null;
                            const pct = ((c / totalLivestockCount) * 100).toFixed(1);
                            return (
                              <div
                                key={item.key}
                                title={`${item.label}: ${c} (${pct}%)`}
                                style={{ width: `${pct}%`, backgroundColor: item.color, transition: 'width 0.3s' }}
                              />
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Interactive Livestock Cards Grid */}
                    <div className="agri-grid-auto">
                      {PRESET_LIVESTOCK.map(item => {
                        const count = profileData.livestockDetails?.[item.key] || 0;
                        return (
                          <div
                            key={item.key}
                            style={{
                              padding: '1rem',
                              borderRadius: '12px',
                              border: '1.5px solid',
                              borderColor: count > 0 ? '#86efac' : '#e2e8f0',
                              backgroundColor: count > 0 ? '#f0fdf4' : '#ffffff',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                              gap: '0.85rem',
                              boxShadow: count > 0 ? '0 4px 12px rgba(5, 150, 105, 0.08)' : '0 1px 3px rgba(0,0,0,0.02)',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                              <span style={{ fontSize: '1.75rem' }}>{item.icon}</span>
                              <div>
                                <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>
                                  {item.label}
                                </div>
                                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                                  {item.defaultUnit}
                                </div>
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                              <button
                                type="button"
                                onClick={() => handleUpdateLivestock(item.key, -1)}
                                disabled={count <= 0}
                                style={{
                                  width: '34px',
                                  height: '34px',
                                  borderRadius: '8px',
                                  border: '1.5px solid #cbd5e1',
                                  backgroundColor: '#ffffff',
                                  cursor: count > 0 ? 'pointer' : 'not-allowed',
                                  fontWeight: 800,
                                  fontSize: '1.1rem',
                                  opacity: count > 0 ? 1 : 0.35,
                                }}
                              >
                                -
                              </button>

                              <input
                                type="number"
                                min="0"
                                value={count || ''}
                                placeholder="0"
                                onChange={e => handleSetLivestockDirect(item.key, parseInt(e.target.value) || 0)}
                                style={{
                                  width: '60px',
                                  textAlign: 'center',
                                  padding: '5px',
                                  borderRadius: '8px',
                                  border: '1.5px solid #cbd5e1',
                                  fontWeight: 900,
                                  fontSize: '1.05rem',
                                  color: count > 0 ? '#065f46' : '#64748b',
                                  backgroundColor: '#ffffff'
                                }}
                              />

                              <button
                                type="button"
                                onClick={() => handleUpdateLivestock(item.key, 1)}
                                style={{
                                  width: '34px',
                                  height: '34px',
                                  borderRadius: '8px',
                                  border: 'none',
                                  backgroundColor: '#059669',
                                  color: '#ffffff',
                                  cursor: 'pointer',
                                  fontWeight: 900,
                                  fontSize: '1.1rem',
                                  boxShadow: '0 2px 6px rgba(5, 150, 105, 0.3)'
                                }}
                              >
                                +
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Save Button */}
                    <div style={{ paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() => saveMutation.mutate(profileData)}
                        disabled={saveMutation.isPending}
                        style={{
                          padding: '0.7rem 1.6rem',
                          borderRadius: '10px',
                          background: '#065f46',
                          color: '#ffffff',
                          fontWeight: 800,
                          fontSize: '0.92rem',
                          border: 'none',
                          cursor: 'pointer',
                          boxShadow: '0 4px 14px rgba(6, 95, 70, 0.3)'
                        }}
                      >
                        {saveMutation.isPending ? 'सुरक्षित हुँदैछ...' : '💾 पशुधन विवरण सुरक्षित गर्नुहोस्'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: SUBSIDIES LEDGER */}
              {activeTab === 'subsidies' && (
                <div className="agri-glass-card">
                  <div className="agri-glass-card-header">
                    <div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                        अनुदान तथा राहत वितरण आधिकारिक लेजर
                      </h3>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                        यस घरधुरीले पालिका तथा संघ/प्रदेशबाट प्राप्त गरेका सबै अनुदानहरूको पूर्ण अडिट अभिलेख
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowSubsidyModal(true)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.55rem 1rem',
                        borderRadius: '8px',
                        background: '#065f46',
                        color: '#ffffff',
                        fontWeight: 800,
                        fontSize: '0.84rem',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <Plus size={16} /> नयाँ अनुदान दर्ता
                    </button>
                  </div>

                  <div className="agri-glass-card-body" style={{ padding: '0' }}>
                    {(!profile?.subsidiesReceived || profile.subsidiesReceived.length === 0) ? (
                      <div style={{ padding: '3.5rem 1.5rem', textAlign: 'center', color: '#64748b' }}>
                        <Banknote size={40} style={{ margin: '0 auto 0.6rem', opacity: 0.35 }} />
                        <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem' }}>हालसम्म कुनै अनुदान लिएको रेकर्ड छैन।</p>
                        <button
                          type="button"
                          onClick={() => setShowSubsidyModal(true)}
                          style={{ marginTop: '0.75rem', background: 'none', border: 'none', color: '#059669', cursor: 'pointer', fontWeight: 800, textDecoration: 'underline' }}
                        >
                          पहिलो अनुदान दर्ता गर्नुहोस्
                        </button>
                      </div>
                    ) : (
                      <div style={{ overflowX: 'auto' }}>
                        <table className="agri-pro-table">
                          <thead>
                            <tr>
                              <th>क्र.सं.</th>
                              <th>आ.व.</th>
                              <th>वितरण मिति</th>
                              <th>कार्यक्रम / प्रयोजन</th>
                              <th>प्रकार / साझेदारी</th>
                              <th style={{ textAlign: 'right' }}>अनुदान रकम (रु.)</th>
                              <th style={{ textAlign: 'center' }}>स्थिति / भौचर</th>
                            </tr>
                          </thead>
                          <tbody>
                            {profile.subsidiesReceived.map((sub, idx) => (
                              <tr key={idx}>
                                <td style={{ color: '#64748b' }}>{idx + 1}</td>
                                <td style={{ fontWeight: 700 }}>{sub.fiscalYear}</td>
                                <td style={{ color: '#475569' }}>{sub.date}</td>
                                <td>
                                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{sub.purpose}</div>
                                  {sub.verificationOfficer && (
                                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>अधिकृत: {sub.verificationOfficer}</div>
                                  )}
                                </td>
                                <td>
                                  <span style={{ fontSize: '0.78rem', color: '#0369a1', fontWeight: 600 }}>{sub.subsidyType || 'सामग्री/नगद'}</span>
                                  {sub.partnershipPercent && (
                                    <div style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 700 }}>{sub.partnershipPercent}</div>
                                  )}
                                </td>
                                <td style={{ textAlign: 'right', fontWeight: 900, color: '#b45309', fontSize: '0.95rem' }}>
                                  रु. {Number(sub.amount).toLocaleString()}
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                  <span className="agri-badge agri-badge-success">
                                    ✓ भुक्तानी सम्पन्न
                                  </span>
                                  {sub.bankTransferRef && (
                                    <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>भौचर: {sub.bankTransferRef}</div>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr style={{ backgroundColor: '#f8fafc', fontWeight: 900 }}>
                              <td colSpan={5} style={{ textAlign: 'right', padding: '1rem' }}>कुल प्राप्त अनुदान रकम:</td>
                              <td style={{ textAlign: 'right', padding: '1rem', color: '#b45309', fontSize: '1.1rem' }}>
                                रु. {totalSubsidiesSum.toLocaleString()}
                              </td>
                              <td></td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: LOCAL MUNICIPAL DETAILS (KITTA, BANK, INSURANCE, VERIFICATION) */}
              {activeTab === 'local_details' && (
                <div className="agri-glass-card">
                  <div className="agri-glass-card-header">
                    <div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ShieldCheck size={20} className="text-emerald-600" />
                        स्थानीय तह जग्गा कित्ता, बैंक खाता (DBT) र बाली/पशु बिमा विवरण
                      </h3>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                        पालिका अनुदान, क्षतिपूर्ति भुक्तानी तथा वडास्तरीय सिफारिसका लागि अनिवार्य विवरणहरू
                      </div>
                    </div>
                  </div>

                  <div className="agri-glass-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* SECTION 1: Personal & Land Details */}
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#065f46', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', borderBottom: '1.5px solid #d1fae5', paddingBottom: '0.35rem' }}>
                        <MapPin size={16} /> १. व्यक्तिगत पहिचान तथा जग्गा कित्ता विवरण
                      </div>
                      <div className="agri-grid-2">
                        <div>
                          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                            नागरिकता नम्बर (Citizenship No.)
                          </label>
                          <input
                            type="text"
                            placeholder="जस्तै: २७-०१-७५-०२३४५"
                            value={profileData.citizenshipNo || ''}
                            onChange={(e) => setProfileData({ ...profileData, citizenshipNo: e.target.value })}
                            style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.9rem' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                            राष्ट्रिय परिचयपत्र नम्बर (NID No.)
                          </label>
                          <input
                            type="text"
                            placeholder="१० अङ्कको राष्ट्रिय परिचयपत्र नं."
                            value={profileData.nidNo || ''}
                            onChange={(e) => setProfileData({ ...profileData, nidNo: e.target.value })}
                            style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.9rem' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                            जग्गा कित्ता नम्बरहरू (Kitta No.)
                          </label>
                          <input
                            type="text"
                            placeholder="जस्तै: कित्ता नं. २३४, २३५, २४०"
                            value={profileData.kittaNo || ''}
                            onChange={(e) => setProfileData({ ...profileData, kittaNo: e.target.value })}
                            style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.9rem' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                            स्थानीय नापजाँच क्षेत्रफल (रोपनी-आना / बिघा-कठ्ठा)
                          </label>
                          <input
                            type="text"
                            placeholder="जस्तै: ३ रोपनी ४ आना २ पैसा"
                            value={profileData.landMeasurementLocal || ''}
                            onChange={(e) => setProfileData({ ...profileData, landMeasurementLocal: e.target.value })}
                            style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.9rem' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                            सिंचाइ सुविधा प्रकार (Irrigation Type)
                          </label>
                          <select
                            value={profileData.irrigationType || 'मौसमी कुलो'}
                            onChange={(e) => setProfileData({ ...profileData, irrigationType: e.target.value })}
                            style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.9rem' }}
                          >
                            <option value="बारैमासे नहर/कुलो">बारैमासे नहर / कुलो (Perennial)</option>
                            <option value="मौसमी कुलो">मौसमी कुलो (Seasonal)</option>
                            <option value="लिफ्टिङ / बोरिङ / पम्प">लिफ्टिङ / बोरिङ / सोलार पम्प</option>
                            <option value="प्लास्टिक पोखरी / वर्षात संकलन">प्लास्टिक पोखरी / वर्षात संकलन</option>
                            <option value="आकाशे पानीमा निर्भर (असिंचित)">आकाशे पानीमा निर्भर (असिंचित)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* SECTION 2: Banking & DBT Details */}
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#065f46', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', borderBottom: '1.5px solid #d1fae5', paddingBottom: '0.35rem' }}>
                        <Banknote size={16} /> २. प्रत्यक्ष लाभ हस्तान्तरण (DBT) बैंक खाता विवरण
                      </div>
                      <div className="agri-grid-2">
                        <div>
                          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                            बैंकको नाम (Bank Name)
                          </label>
                          <input
                            type="text"
                            placeholder="जस्तै: कृषि विकास बैंक / राष्ट्रिय वाणिज्य बैंक"
                            value={profileData.bankName || ''}
                            onChange={(e) => setProfileData({ ...profileData, bankName: e.target.value })}
                            style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.9rem' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                            शाखा कार्यालय (Branch)
                          </label>
                          <input
                            type="text"
                            placeholder="जस्तै: भोताङ शाखा / मेलम्ची शाखा"
                            value={profileData.bankBranch || ''}
                            onChange={(e) => setProfileData({ ...profileData, bankBranch: e.target.value })}
                            style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.9rem' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                            बैंक खाता नम्बर (Account Number)
                          </label>
                          <input
                            type="text"
                            placeholder="कृषकको खाता नम्बर"
                            value={profileData.bankAccountNo || ''}
                            onChange={(e) => setProfileData({ ...profileData, bankAccountNo: e.target.value })}
                            style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.95rem', fontWeight: 700, letterSpacing: '0.03em' }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* SECTION 3: Ward Verification & Insurance */}
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#065f46', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', borderBottom: '1.5px solid #d1fae5', paddingBottom: '0.35rem' }}>
                        <CheckCircle2 size={16} /> ३. वडा प्रमाणीकरण तथा बाली/पशु बिमा
                      </div>
                      <div className="agri-grid-2">
                        <div>
                          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                            वडा कार्यालय प्रमाणीकरण स्थिति
                          </label>
                          <select
                            value={profileData.wardVerificationStatus || 'प्रमाणित (Verified)'}
                            onChange={(e) => setProfileData({ ...profileData, wardVerificationStatus: e.target.value })}
                            style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.9rem', fontWeight: 700 }}
                          >
                            <option value="प्रमाणित (Verified)">✅ प्रमाणित (वडा सिफारिस प्राप्त)</option>
                            <option value="प्रक्रियामा (Pending)">⏳ प्रक्रियामा (स्थलगत निरीक्षण बाँकी)</option>
                            <option value="अस्वीकृत (Rejected)">❌ कागजात अपुग / अस्वीकृत</option>
                          </select>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                            बाली तथा पशुधन बिमा लेख नम्बर (Insurance Policy No.)
                          </label>
                          <input
                            type="text"
                            placeholder="जस्तै: POL-AGRI-2081-4412"
                            value={profileData.insurancePolicyNo || ''}
                            onChange={(e) => setProfileData({ ...profileData, insurancePolicyNo: e.target.value })}
                            style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.9rem' }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Save Button */}
                    <div style={{ paddingTop: '1rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() => saveMutation.mutate(profileData)}
                        disabled={saveMutation.isPending}
                        style={{
                          padding: '0.75rem 1.75rem',
                          borderRadius: '10px',
                          background: '#065f46',
                          color: '#ffffff',
                          fontWeight: 800,
                          fontSize: '0.95rem',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          boxShadow: '0 4px 14px rgba(6, 95, 70, 0.3)'
                        }}
                      >
                        <ShieldCheck size={18} />
                        {saveMutation.isPending ? 'सुरक्षित हुँदैछ...' : '💾 स्थानीय तह विवरण सुरक्षित गर्नुहोस्'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      )}

      {/* MODAL 1: Add New Subsidy */}
      {showSubsidyModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div className="agri-glass-card" style={{ maxWidth: '600px', width: '100%', padding: '1.75rem', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, margin: 0, color: '#0f172a' }}>
                  नयाँ कृषि अनुदान तथा राहत दर्ता
                </h3>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                  {selectedHousehold?.householdName} (घर नं: {selectedHousehold?.matrixHouseNo})
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSubsidyModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                addSubsidyMutation.mutate(newSubsidy);
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              <div className="agri-grid-2">
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, marginBottom: '0.35rem' }}>आर्थिक वर्ष</label>
                  <input
                    type="text"
                    required
                    value={newSubsidy.fiscalYear}
                    onChange={e => setNewSubsidy({ ...newSubsidy, fiscalYear: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, marginBottom: '0.35rem' }}>वितरण मिति</label>
                  <input
                    type="date"
                    required
                    value={newSubsidy.date}
                    onChange={e => setNewSubsidy({ ...newSubsidy, date: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, marginBottom: '0.35rem' }}>कार्यक्रम / प्रयोजन छनोट</label>
                <select
                  value={newSubsidy.purpose}
                  onChange={e => setNewSubsidy({ ...newSubsidy, purpose: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.9rem' }}
                >
                  {SUBSIDY_PROGRAMS.map((prog, i) => (
                    <option key={i} value={prog}>{prog}</option>
                  ))}
                </select>
              </div>

              <div className="agri-grid-2">
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, marginBottom: '0.35rem' }}>अनुदान प्रकार (Type)</label>
                  <select
                    value={newSubsidy.subsidyType || 'सामग्री/उपकरण (In-kind)'}
                    onChange={e => setNewSubsidy({ ...newSubsidy, subsidyType: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.9rem' }}
                  >
                    <option value="सामग्री/उपकरण (In-kind)">सामग्री / मेशिनरी उपकरण (In-kind)</option>
                    <option value="नगद DBT (Bank Transfer)">नगद DBT (बैंक खाता भुक्तानी)</option>
                    <option value="बिउबिजन तथा मल">बिउबिजन तथा मल वितरण</option>
                    <option value="विपद् राहत तथा क्षतिपूर्ति">विपद् राहत तथा क्षतिपूर्ति</option>
                    <option value="प्राविधिक तालिम तथा भ्रमण">प्राविधिक तालिम तथा भ्रमण</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, marginBottom: '0.35rem' }}>साझेदारी प्रतिशत (Partnership)</label>
                  <select
                    value={newSubsidy.partnershipPercent || '५०% पालिका साझेदारी'}
                    onChange={e => setNewSubsidy({ ...newSubsidy, partnershipPercent: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.9rem' }}
                  >
                    <option value="१००% पूर्ण अनुदान">१००% पूर्ण अनुदान</option>
                    <option value="५०% पालिका साझेदारी">५०% पालिका ५०% कृषक साझेदारी</option>
                    <option value="७५% पालिका साझेदारी">७५% पालिका २५% कृषक साझेदारी</option>
                    <option value="२५% अनुदान">२५% अनुदान</option>
                  </select>
                </div>
              </div>

              <div className="agri-grid-2">
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, marginBottom: '0.35rem' }}>अनुदान रकम (रु. NPR)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newSubsidy.amount || ''}
                    onChange={e => setNewSubsidy({ ...newSubsidy, amount: parseFloat(e.target.value) || 0 })}
                    style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '1.1rem', fontWeight: 900, color: '#b45309' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, marginBottom: '0.35rem' }}>बैंक / भौचर ट्रान्सफर नं.</label>
                  <input
                    type="text"
                    placeholder="जस्तै: VOUCH-81-0921"
                    value={newSubsidy.bankTransferRef || ''}
                    onChange={e => setNewSubsidy({ ...newSubsidy, bankTransferRef: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, marginBottom: '0.35rem' }}>प्रमाणीकरण गर्ने अधिकृत / प्राविधिक</label>
                <input
                  type="text"
                  placeholder="जस्तै: कृषि अधिकृत / जेटीए"
                  value={newSubsidy.verificationOfficer || ''}
                  onChange={e => setNewSubsidy({ ...newSubsidy, verificationOfficer: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '0.5rem', paddingTop: '0.85rem', borderTop: '1px solid #e2e8f0' }}>
                <button
                  type="button"
                  onClick={() => setShowSubsidyModal(false)}
                  style={{ padding: '0.6rem 1.1rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', cursor: 'pointer', fontWeight: 700 }}
                >
                  रद्द गर्नुहोस्
                </button>
                <button
                  type="submit"
                  disabled={addSubsidyMutation.isPending}
                  style={{ padding: '0.6rem 1.4rem', borderRadius: '8px', border: 'none', background: '#065f46', color: '#ffffff', cursor: 'pointer', fontWeight: 800 }}
                >
                  {addSubsidyMutation.isPending ? 'दर्ता हुँदैछ...' : 'अनुदान रेकर्ड थप्नुहोस्'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Hologram Smart Farmer ID Card */}
      {showIdCardModal && selectedHousehold && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div className="agri-glass-card" style={{ maxWidth: '560px', width: '100%', padding: '2rem', backgroundColor: '#ffffff', borderRadius: '20px', boxShadow: '0 30px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(5, 150, 105, 0.2)' }}>
                  <Award size={26} />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#059669', letterSpacing: '0.04em' }}>पाँचपोखरी थाङपाल गाउँपालिका</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a' }}>डिजिटल स्मार्ट कृषक परिचयपत्र</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowIdCardModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={22} />
              </button>
            </div>

            {/* Smart Hologram Card Body */}
            <div id="printable-farmer-card" className="agri-hologram-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1.5px dashed #86efac', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#065f46' }}>नेपाल सरकार | बागमती प्रदेश</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#064e3b' }}>पाँचपोखरी थाङपाल गाउँ कार्यपालिका</div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#047857' }}>कृषि, पशुपन्छी तथा खाद्य सुरक्षा शाखा</div>
                </div>
                <div className="agri-smart-chip" title="NFC / QR Integrated Smart Chip"></div>
              </div>

              <div className="agri-grid-2" style={{ alignItems: 'center' }}>
                <div style={{ width: '95px', height: '110px', borderRadius: '10px', backgroundColor: '#dcfce7', border: '2px solid #86efac', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#065f46', position: 'relative' }}>
                  <UserCircle size={52} />
                  <span style={{ fontSize: '0.65rem', fontWeight: 800, marginTop: '2px' }}>प्रमाणित कृषक</span>
                </div>

                <div style={{ fontSize: '0.85rem', color: '#064e3b', lineHeight: 1.65 }}>
                  <div><strong>घरमुलीको नाम:</strong> {selectedHousehold.householdName}</div>
                  <div><strong>म्याट्रिक्स घर नं:</strong> {selectedHousehold.matrixHouseNo}</div>
                  <div><strong>वडा नं:</strong> {selectedHousehold.wardNumber}, {selectedHousehold.tole || 'गाउँपालिका'}</div>
                  <div><strong>सम्पर्क नं:</strong> {selectedHousehold.contactPhone || 'N/A'}</div>
                  <div><strong>कृषक वर्गीकरण:</strong> {profileData.farmerCategory?.toUpperCase() || 'SMALL'}</div>
                  <div><strong>जमिन क्षेत्रफल:</strong> {landAreaRopani} रोपनी ({profileData.landAreaHectares || 0} ha)</div>
                </div>
              </div>

              <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1.5px dashed #86efac', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#047857' }}>मुख्य उत्पादन:</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#064e3b' }}>
                    {profileData.mainCrops?.slice(0, 4).join(', ') || 'स्थानीय प्रमुख बालीहरू'}
                  </div>
                </div>
                <div style={{ width: '52px', height: '52px', borderRadius: '6px', backgroundColor: '#ffffff', border: '1px solid #86efac', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.06)' }}>
                  <QrCode size={40} className="text-emerald-900" />
                </div>
              </div>
            </div>

            {/* Print Controls */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={() => setShowIdCardModal(false)}
                style={{ padding: '0.6rem 1.1rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', cursor: 'pointer', fontWeight: 700 }}
              >
                बन्द
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                style={{ padding: '0.6rem 1.4rem', borderRadius: '8px', border: 'none', background: '#059669', color: '#ffffff', cursor: 'pointer', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)' }}
              >
                <Printer size={16} /> स्मार्ट कार्ड प्रिन्ट गर्नुहोस्
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
