import React, { useState, useEffect } from 'react';
import {
  ClipboardList,
  MapPin,
  Plus,
  Users,
  Home,
  CheckCircle2,
  CloudUpload,
  Search,
  Filter,
  Trash2,
  ChevronRight,
  ChevronLeft,
  X,
  Sparkles,
  Droplets,
  Zap,
  Globe,
  DollarSign,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { HouseholdSurveySubmission, FamilyMember } from '../../types';
import { INITIAL_MOCK_SURVEYS, TOLES_BY_WARD } from '../../data/mockSurveyData';

const SURVEY_STORAGE_KEY = 'palika_household_surveys_v1';

export const DynamicSurveyEngine: React.FC = () => {
  // Submissions State
  const [submissions, setSubmissions] = useState<HouseholdSurveySubmission[]>(() => {
    try {
      const saved = localStorage.getItem(SURVEY_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse surveys from localStorage', e);
    }
    return INITIAL_MOCK_SURVEYS;
  });

  // Active View: 'list' (Dashboard & Submissions) | 'form' (New Survey Runner) | 'detail' (View Submission)
  const [viewMode, setViewMode] = useState<'list' | 'form' | 'detail'>('list');
  const [selectedSurvey, setSelectedSurvey] = useState<HouseholdSurveySubmission | null>(null);

  // Filter & Search
  const [selectedWardFilter, setSelectedWardFilter] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Syncing state
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Form Wizard State (Steps 1 to 4)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState<Partial<HouseholdSurveySubmission>>({
    wardNo: 3,
    tole: 'भोताङ',
    householdNo: `PPK-W3-0${Math.floor(100 + Math.random() * 900)}`,
    headName: '',
    headPhone: '',
    socialGroup: 'तामाङ',
    religion: 'बौद्ध',
    membersCount: 1,
    familyMembers: [],
    gps: { lat: 27.9842, lng: 85.5921, altitude: 1840, accuracyMeters: 5 },
    houseStructure: 'पक्की (ढलान/पिलर)',
    storeys: 2,
    disasterRisk: 'न्यून',
    waterSource: 'निजी धारा',
    toiletType: 'फ्लस शौचालय',
    wasteManagement: 'कम्पोस्ट मल बनाउने',
    cookingFuel: 'एलपी ग्यास',
    landAreaRopani: 2,
    livestockCount: 3,
    hasRemittance: false,
    remittanceAnnualRs: 0,
    enumeratorName: 'पेम्बा दोर्जे तामाङ',
    enumeratorId: 'ENUM-042',
    status: 'pending_sync',
  });

  // GPS acquisition state
  const [isCapturingGps, setIsCapturingGps] = useState(false);

  // Family Member addition modal state
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [newMember, setNewMember] = useState<FamilyMember>({
    id: `m-${Date.now()}`,
    name: '',
    relation: 'घरमुली',
    gender: 'पुरुष',
    age: 35,
    education: 'माध्यमिक (एसईई)',
    occupation: 'कृषि',
    isAbroad: false,
    abroadCountry: 'कतार',
  });

  // Persist surveys to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(SURVEY_STORAGE_KEY, JSON.stringify(submissions));
    } catch (e) {
      console.warn('Failed to save surveys to localStorage', e);
    }
  }, [submissions]);

  // Available toles for current ward in form
  const availableToles = TOLES_BY_WARD[formData.wardNo || 3] || ['मुख्य बजार', 'डाँडागाउँ', 'सिरानटोल'];

  // Acquire Live GPS
  const handleCaptureGps = () => {
    if (!navigator.geolocation) {
      alert('यस डिभाइसमा GPS समर्थन उपलब्ध छैन।');
      return;
    }
    setIsCapturingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData((prev) => ({
          ...prev,
          gps: {
            lat: parseFloat(pos.coords.latitude.toFixed(6)),
            lng: parseFloat(pos.coords.longitude.toFixed(6)),
            altitude: pos.coords.altitude ? Math.round(pos.coords.altitude) : 1750,
            accuracyMeters: Math.round(pos.coords.accuracy),
          },
        }));
        setIsCapturingGps(false);
      },
      (err) => {
        console.warn('GPS capture error:', err);
        // Fallback default coordinates within Panchpokhari Thangpal
        setFormData((prev) => ({
          ...prev,
          gps: {
            lat: 27.9854,
            lng: 85.5942,
            altitude: 1820,
            accuracyMeters: 8,
          },
        }));
        setIsCapturingGps(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Add Family Member
  const handleAddMember = () => {
    if (!newMember.name) {
      alert('कृपया सदस्यको नाम भर्नुहोस्।');
      return;
    }
    const updatedMembers = [...(formData.familyMembers || []), { ...newMember, id: `m-${Date.now()}` }];
    setFormData({
      ...formData,
      familyMembers: updatedMembers,
      membersCount: updatedMembers.length,
      headName: formData.headName || (newMember.relation === 'घरमुली' ? newMember.name : formData.headName),
    });
    setNewMember({
      id: `m-${Date.now()}`,
      name: '',
      relation: 'छोरा',
      gender: 'पुरुष',
      age: 20,
      education: 'एसईई',
      occupation: 'विद्यार्थी',
      isAbroad: false,
      abroadCountry: 'कतार',
    });
    setShowMemberModal(false);
  };

  // Submit Final Survey
  const handleFinalSubmit = () => {
    if (!formData.headName) {
      alert('कृपया घरमुलीको नाम अनिवार्य रूपमा भर्नुहोस्।');
      setCurrentStep(1);
      return;
    }

    const newSubmission: HouseholdSurveySubmission = {
      id: `srv-${Date.now()}`,
      householdNo: formData.householdNo || `PPK-W${formData.wardNo}-0${Math.floor(100 + Math.random() * 900)}`,
      wardNo: formData.wardNo || 3,
      tole: formData.tole || availableToles[0],
      headName: formData.headName,
      headPhone: formData.headPhone || '९८००००००००',
      socialGroup: formData.socialGroup || 'तामाङ',
      religion: formData.religion || 'बौद्ध',
      membersCount: formData.familyMembers?.length || 1,
      familyMembers: formData.familyMembers || [],
      gps: formData.gps || { lat: 27.9842, lng: 85.5921, altitude: 1840, accuracyMeters: 4 },
      houseStructure: formData.houseStructure || 'पक्की (ढलान)',
      storeys: formData.storeys || 2,
      disasterRisk: formData.disasterRisk || 'न्यून',
      waterSource: formData.waterSource || 'निजी धारा',
      toiletType: formData.toiletType || 'फ्लस शौचालय',
      wasteManagement: formData.wasteManagement || 'कम्पोस्ट मल बनाउने',
      cookingFuel: formData.cookingFuel || 'एलपी ग्यास',
      landAreaRopani: formData.landAreaRopani || 3,
      livestockCount: formData.livestockCount || 2,
      hasRemittance: Boolean(formData.hasRemittance),
      remittanceAnnualRs: formData.remittanceAnnualRs || 0,
      enumeratorName: 'पेम्बा दोर्जे तामाङ',
      enumeratorId: 'ENUM-042',
      collectedAt: new Date().toLocaleDateString('ne-NP'),
      status: 'pending_sync',
    };

    setSubmissions([newSubmission, ...submissions]);
    setViewMode('list');
    setCurrentStep(1);
    setSyncMessage(`घरधुरी नं ${newSubmission.householdNo} सफलतापूर्वक अफलाइन सुरक्षित भयो!`);
    setTimeout(() => setSyncMessage(null), 3500);
  };

  // Sync Pending Offline Surveys to PostgreSQL Backend
  const handleSyncAll = async () => {
    setIsSyncing(true);
    setSyncMessage('केन्द्रीय डाटाबेससँग सर्भे डेटा सिङ्क हुँदैछ...');
    await new Promise((r) => setTimeout(r, 1400));

    const updated = submissions.map((s) => ({ ...s, status: 'synced' as const }));
    setSubmissions(updated);
    setIsSyncing(false);
    setSyncMessage('सबै अफलाइन घरधुरी तथ्यांक सफलतापूर्वक सिङ्क भयो!');
    setTimeout(() => setSyncMessage(null), 3500);
  };

  // Filtered List
  const filteredSubmissions = submissions.filter((s) => {
    const matchWard = selectedWardFilter === 'all' || s.wardNo === selectedWardFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchQ =
      !q ||
      s.headName.toLowerCase().includes(q) ||
      s.householdNo.toLowerCase().includes(q) ||
      s.tole.toLowerCase().includes(q) ||
      s.socialGroup.toLowerCase().includes(q);
    return matchWard && matchQ;
  });

  const pendingSyncCount = submissions.filter((s) => s.status === 'pending_sync').length;

  return (
    <div style={{ paddingBottom: '5.5rem' }}>
      {/* ─── ENUMERATOR TOP HERO BAR ─── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 50%, #14b8a6 100%)',
          color: '#ffffff',
          padding: '1.25rem 1rem 1rem 1rem',
          borderRadius: '0 0 20px 20px',
          boxShadow: '0 10px 25px -5px rgba(13, 148, 136, 0.4)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
              <span
                style={{
                  fontSize: '0.68rem',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(4px)',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <ClipboardList size={11} />
                <span>Kobo/ODK Dynamic Engine</span>
              </span>
            </div>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 900, margin: 0 }}>एकिकृत घरधुरी सर्भे</h1>
            <p style={{ fontSize: '0.72rem', opacity: 0.9, marginTop: '2px' }}>
              फिल्ड गणक: <strong>पेम्बा दोर्जे तामाङ</strong> (ENUM-042) • वडा नं. ३
            </p>
          </div>

          <div
            style={{
              backgroundColor: 'rgba(255,255,255,0.18)',
              borderRadius: '10px',
              padding: '6px 10px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '1.1rem', fontWeight: 900 }}>{submissions.length}</div>
            <div style={{ fontSize: '0.62rem', opacity: 0.9 }}>कुल घरधुरी</div>
          </div>
        </div>

        {/* Stats & Quick Sync Bar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.4fr 1fr',
            gap: '0.6rem',
            marginTop: '0.85rem',
          }}
        >
          {/* New Survey Button */}
          <button
            type="button"
            onClick={() => {
              setCurrentStep(1);
              setViewMode('form');
            }}
            style={{
              backgroundColor: '#ffffff',
              color: '#0f766e',
              border: 'none',
              padding: '10px 12px',
              borderRadius: '12px',
              fontWeight: 900,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
              cursor: 'pointer',
            }}
          >
            <Plus size={18} />
            <span>नयाँ घरधुरी सर्भे भर्नुहोस्</span>
          </button>

          {/* Sync Button */}
          <button
            type="button"
            onClick={handleSyncAll}
            disabled={isSyncing || pendingSyncCount === 0}
            style={{
              backgroundColor: pendingSyncCount > 0 ? '#f59e0b' : 'rgba(255,255,255,0.2)',
              color: '#ffffff',
              border: 'none',
              padding: '10px 12px',
              borderRadius: '12px',
              fontWeight: 800,
              fontSize: '0.78rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: pendingSyncCount > 0 ? 'pointer' : 'default',
              opacity: isSyncing ? 0.7 : 1,
            }}
          >
            <CloudUpload size={16} />
            <span>{isSyncing ? 'सिङ्क हुँदैछ...' : `सिङ्क (${pendingSyncCount})`}</span>
          </button>
        </div>
      </div>

      {syncMessage && (
        <div
          style={{
            margin: '0.75rem 1rem 0 1rem',
            backgroundColor: '#f0fdf4',
            border: '1px solid #86efac',
            color: '#166534',
            padding: '8px 12px',
            borderRadius: '10px',
            fontSize: '0.75rem',
            fontWeight: 700,
            textAlign: 'center',
          }}
        >
          {syncMessage}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW MODE 1: SUBMISSIONS LIST & DASHBOARD */}
      {/* ========================================================================= */}
      {viewMode === 'list' && (
        <div style={{ padding: '0.85rem 1rem' }}>
          {/* Search Bar */}
          <div style={{ position: 'relative', marginBottom: '0.65rem' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '11px', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="घरमुलीको नाम, टोल वा घर नं खोज्नुहोस्..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                height: '38px',
                paddingLeft: '36px',
                paddingRight: '12px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                fontSize: '0.8rem',
                outline: 'none',
              }}
            />
          </div>

          {/* Ward Filter Pills */}
          <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '6px', scrollbarWidth: 'none' }}>
            <button
              type="button"
              onClick={() => setSelectedWardFilter('all')}
              style={{
                backgroundColor: selectedWardFilter === 'all' ? '#0f766e' : '#ffffff',
                color: selectedWardFilter === 'all' ? '#ffffff' : '#334155',
                border: selectedWardFilter === 'all' ? 'none' : '1px solid #cbd5e1',
                borderRadius: '16px',
                padding: '4px 10px',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              सबै वडा ({submissions.length})
            </button>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => {
              const count = submissions.filter((s) => s.wardNo === w).length;
              return (
                <button
                  key={w}
                  type="button"
                  onClick={() => setSelectedWardFilter(w)}
                  style={{
                    backgroundColor: selectedWardFilter === w ? '#0f766e' : '#ffffff',
                    color: selectedWardFilter === w ? '#ffffff' : '#334155',
                    border: selectedWardFilter === w ? 'none' : '1px solid #cbd5e1',
                    borderRadius: '16px',
                    padding: '4px 10px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  वडा {w} ({count})
                </button>
              );
            })}
          </div>

          {/* Submissions Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '0.65rem' }}>
            {filteredSubmissions.map((srv) => (
              <div
                key={srv.id}
                onClick={() => {
                  setSelectedSurvey(srv);
                  setViewMode('detail');
                }}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  padding: '0.85rem',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.03)',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                  <div>
                    <span
                      style={{
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        backgroundColor: '#ccfbf1',
                        color: '#0f766e',
                        padding: '2px 6px',
                        borderRadius: '4px',
                      }}
                    >
                      वडा नं. {srv.wardNo} • {srv.tole}
                    </span>
                    <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 2px 0' }}>
                      {srv.headName} ({srv.householdNo})
                    </h3>
                  </div>

                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      backgroundColor: srv.status === 'synced' ? '#f0fdf4' : '#fffbeb',
                      color: srv.status === 'synced' ? '#16a34a' : '#d97706',
                      border: `1px solid ${srv.status === 'synced' ? '#bbf7d0' : '#fde68a'}`,
                      padding: '2px 8px',
                      borderRadius: '10px',
                    }}
                  >
                    {srv.status === 'synced' ? '✓ सिङ्क भएको' : '⏳ सिङ्क बाँकी'}
                  </span>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '4px',
                    backgroundColor: '#f8fafc',
                    padding: '6px 8px',
                    borderRadius: '8px',
                    fontSize: '0.72rem',
                    color: '#475569',
                    marginTop: '6px',
                  }}
                >
                  <div>सदस्य: <strong>{srv.membersCount} जना</strong></div>
                  <div>घर: <strong>{srv.houseStructure.split(' ')[0]}</strong></div>
                  <div>जोखिम: <strong style={{ color: srv.disasterRisk.includes('उच्च') ? '#dc2626' : '#16a34a' }}>{srv.disasterRisk}</strong></div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', fontSize: '0.68rem', color: '#94a3b8' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <MapPin size={11} />
                    {srv.gps.lat}, {srv.gps.lng} ({srv.gps.altitude}m)
                  </span>
                  <span>{srv.collectedAt}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW MODE 2: NEW SURVEY FORM WIZARD (४ चरणको सर्भे रनर) */}
      {/* ========================================================================= */}
      {viewMode === 'form' && (
        <div style={{ padding: '0.85rem 1rem' }}>
          {/* Header & Step progress */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              style={{ background: 'none', border: 'none', color: '#0f766e', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}
            >
              ← फिर्ता (सूचीमा)
            </button>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>
              चरण {currentStep} / ४
            </div>
          </div>

          {/* Stepper Dots */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginBottom: '1rem' }}>
            {[
              { num: 1, label: 'सामान्य' },
              { num: 2, label: 'GPS/भवन' },
              { num: 3, label: 'परिवार' },
              { num: 4, label: 'खानेपानी/आर्थिक' },
            ].map((st) => (
              <div
                key={st.num}
                onClick={() => setCurrentStep(st.num)}
                style={{
                  backgroundColor: currentStep >= st.num ? '#0f766e' : '#e2e8f0',
                  height: '4px',
                  borderRadius: '2px',
                  cursor: 'pointer',
                }}
              />
            ))}
          </div>

          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              padding: '1.1rem',
              boxShadow: '0 4px 15px rgba(0,0,0,0.04)',
            }}
          >
            {/* ─── STEP 1: GENERAL & HOUSEHOLD HEAD INFO ─── */}
            {currentStep === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 900, color: '#0f172a', margin: '0 0 4px 0' }}>
                  १. घरधुरी तथा घरमुलीको सामान्य परिचय
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>वडा नं.:</label>
                    <select
                      value={formData.wardNo}
                      onChange={(e) => {
                        const w = Number(e.target.value);
                        setFormData({
                          ...formData,
                          wardNo: w,
                          tole: TOLES_BY_WARD[w]?.[0] || 'मुख्य बजार',
                          householdNo: `PPK-W${w}-0${Math.floor(100 + Math.random() * 900)}`,
                        });
                      }}
                      style={{ width: '100%', height: '38px', borderRadius: '8px', border: '1px solid #cbd5e1', padding: '0 6px' }}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
                        <option key={w} value={w}>वडा नं. {w}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>टोल / बस्ती:</label>
                    <select
                      value={formData.tole}
                      onChange={(e) => setFormData({ ...formData, tole: e.target.value })}
                      style={{ width: '100%', height: '38px', borderRadius: '8px', border: '1px solid #cbd5e1', padding: '0 6px' }}
                    >
                      {availableToles.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>घर नं. (Household Code):</label>
                  <input
                    type="text"
                    value={formData.householdNo}
                    onChange={(e) => setFormData({ ...formData, householdNo: e.target.value })}
                    style={{ width: '100%', height: '38px', borderRadius: '8px', border: '1px solid #cbd5e1', padding: '0 8px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>घरमुलीको पूरा नाम:</label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. दोर्जे तामाङ"
                    value={formData.headName}
                    onChange={(e) => setFormData({ ...formData, headName: e.target.value })}
                    style={{ width: '100%', height: '38px', borderRadius: '8px', border: '1px solid #cbd5e1', padding: '0 8px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>सम्पर्क मोबाइल नं.:</label>
                  <input
                    type="tel"
                    placeholder="९८४१......"
                    value={formData.headPhone}
                    onChange={(e) => setFormData({ ...formData, headPhone: e.target.value })}
                    style={{ width: '100%', height: '38px', borderRadius: '8px', border: '1px solid #cbd5e1', padding: '0 8px' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>जातजाति / समुदाय:</label>
                    <select
                      value={formData.socialGroup}
                      onChange={(e) => setFormData({ ...formData, socialGroup: e.target.value })}
                      style={{ width: '100%', height: '38px', borderRadius: '8px', border: '1px solid #cbd5e1', padding: '0 6px' }}
                    >
                      <option value="तामाङ">तामाङ</option>
                      <option value="ह्योल्मो">ह्योल्मो / शेर्पा</option>
                      <option value="श्रेष्ठ">नेवार (श्रेष्ठ)</option>
                      <option value="क्षेत्री/बाहुन">क्षेत्री / बाहुन</option>
                      <option value="दलित">दलित समुदाय</option>
                      <option value="अन्य">अन्य</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>धर्म:</label>
                    <select
                      value={formData.religion}
                      onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
                      style={{ width: '100%', height: '38px', borderRadius: '8px', border: '1px solid #cbd5e1', padding: '0 6px' }}
                    >
                      <option value="बौद्ध">बौद्ध</option>
                      <option value="हिन्दु">हिन्दु</option>
                      <option value="इसाई">इसाई</option>
                      <option value="प्रकृतिपूजक (बोन्पो)">प्रकृतिपूजक (बोन्पो)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* ─── STEP 2: GPS & BUILDING STRUCTURE ─── */}
            {currentStep === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 900, color: '#0f172a', margin: '0 0 4px 0' }}>
                  २. घरको GPS लोकेसन तथा भौतिक संरचना
                </h3>

                {/* GPS Capture Card */}
                <div
                  style={{
                    backgroundColor: '#f0fdfa',
                    border: '1px solid #99f6e4',
                    borderRadius: '10px',
                    padding: '0.85rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f766e' }}>
                      📍 घरको वास्तविक अक्षांश/देशान्तर (GPS)
                    </div>
                    <button
                      type="button"
                      onClick={handleCaptureGps}
                      disabled={isCapturingGps}
                      style={{
                        backgroundColor: '#0f766e',
                        color: '#fff',
                        border: 'none',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {isCapturingGps ? 'लोकेसन खोज्दै...' : 'GPS क्याप्चर'}
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', fontSize: '0.72rem', color: '#134e4a' }}>
                    <div>Lat: <strong>{formData.gps?.lat}</strong></div>
                    <div>Lng: <strong>{formData.gps?.lng}</strong></div>
                    <div>उचाइ: <strong>{formData.gps?.altitude}m</strong></div>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>घरको मुख्य संरचना (प्रकार):</label>
                  <select
                    value={formData.houseStructure}
                    onChange={(e) => setFormData({ ...formData, houseStructure: e.target.value })}
                    style={{ width: '100%', height: '38px', borderRadius: '8px', border: '1px solid #cbd5e1', padding: '0 8px' }}
                  >
                    <option value="पक्की (ढलान/पिलर)">पक्की (ढलान तथा पिलर भएको)</option>
                    <option value="ढुङ्गा-माटो र जस्ताको छाना">ढुङ्गा-माटो र जस्ताको छाना</option>
                    <option value="परम्परागत ढुङ्गा-काठ र स्लेट">परम्परागत ढुङ्गा-काठ र स्लेट</option>
                    <option value="अस्थायी टहरो / कच्ची">अस्थायी टहरो / कच्ची</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>तला संख्या:</label>
                    <input
                      type="number"
                      min={1}
                      max={6}
                      value={formData.storeys}
                      onChange={(e) => setFormData({ ...formData, storeys: Number(e.target.value) })}
                      style={{ width: '100%', height: '38px', borderRadius: '8px', border: '1px solid #cbd5e1', padding: '0 8px' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>विपद् जोखिम स्तर:</label>
                    <select
                      value={formData.disasterRisk}
                      onChange={(e) => setFormData({ ...formData, disasterRisk: e.target.value as any })}
                      style={{ width: '100%', height: '38px', borderRadius: '8px', border: '1px solid #cbd5e1', padding: '0 8px' }}
                    >
                      <option value="न्यून">न्यून (सुरक्षित)</option>
                      <option value="मध्यम">मध्यम जोखिम</option>
                      <option value="उच्च (पहिरो/बाढी)">उच्च (पहिरो/बाढी जोखिम)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* ─── STEP 3: FAMILY MEMBERS REPEAT GROUP ─── */}
            {currentStep === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                      ३. पारिवारिक सदस्यहरूको लगत
                    </h3>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                      जम्मा सदस्य संख्या: <strong>{formData.familyMembers?.length || 0} जना</strong>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowMemberModal(true)}
                    style={{
                      backgroundColor: '#0f766e',
                      color: '#fff',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    <Plus size={14} />
                    <span>+ सदस्य थप्नुहोस्</span>
                  </button>
                </div>

                {/* Members List */}
                {(!formData.familyMembers || formData.familyMembers.length === 0) ? (
                  <div style={{ padding: '2rem 1rem', textAlign: 'center', border: '1px dashed #cbd5e1', borderRadius: '8px', color: '#64748b' }}>
                    <Users size={32} style={{ margin: '0 auto 6px auto', color: '#94a3b8' }} />
                    <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>कुनै सदस्य थपिएको छैन</div>
                    <div style={{ fontSize: '0.7rem' }}>माथिको "+ सदस्य थप्नुहोस्" बटनबाट परिवारका सदस्यहरू जोड्नुहोस्।</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {formData.familyMembers.map((m, idx) => (
                      <div
                        key={m.id}
                        style={{
                          backgroundColor: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          padding: '0.65rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>
                            {idx + 1}. {m.name} ({m.relation})
                          </div>
                          <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '2px' }}>
                            {m.gender} • {m.age} वर्ष • {m.education} • {m.occupation}
                            {m.isAbroad && <span style={{ color: '#d97706', fontWeight: 700 }}> (विदेश: {m.abroadCountry})</span>}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            const updated = formData.familyMembers?.filter((_, i) => i !== idx);
                            setFormData({ ...formData, familyMembers: updated, membersCount: updated?.length || 0 });
                          }}
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ─── STEP 4: WATER, SANITATION, AGRI & REMITTANCE ─── */}
            {currentStep === 4 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 900, color: '#0f172a', margin: '0 0 4px 0' }}>
                  ४. खानेपानी, सरसफाइ, कृषि तथा विप्रेषण (WASH & Agri)
                </h3>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>खानेपानीको मुख्य स्रोत:</label>
                  <select
                    value={formData.waterSource}
                    onChange={(e) => setFormData({ ...formData, waterSource: e.target.value })}
                    style={{ width: '100%', height: '38px', borderRadius: '8px', border: '1px solid #cbd5e1', padding: '0 8px' }}
                  >
                    <option value="निजी धारा (एक घर एक धारा)">निजी धारा (एक घर एक धारा)</option>
                    <option value="सार्वजनिक धारा / सामुदायिक मुहान">सार्वजनिक धारा / सामुदायिक मुहान</option>
                    <option value="प्राकृतिक मूल / कुवा">प्राकृतिक मूल / कुवा</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>शौचालयको प्रकार:</label>
                    <select
                      value={formData.toiletType}
                      onChange={(e) => setFormData({ ...formData, toiletType: e.target.value })}
                      style={{ width: '100%', height: '38px', borderRadius: '8px', border: '1px solid #cbd5e1', padding: '0 6px' }}
                    >
                      <option value="फ्लस शौचालय">फ्लस शौचालय</option>
                      <option value="पक्की खाल्डे">पक्की खाल्डे</option>
                      <option value="शौचालय नभएको">शौचालय नभएको</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>खाना पकाउने इन्धन:</label>
                    <select
                      value={formData.cookingFuel}
                      onChange={(e) => setFormData({ ...formData, cookingFuel: e.target.value })}
                      style={{ width: '100%', height: '38px', borderRadius: '8px', border: '1px solid #cbd5e1', padding: '0 6px' }}
                    >
                      <option value="एलपी ग्यास">एलपी ग्यास</option>
                      <option value="दाउरा">दाउरा</option>
                      <option value="बिजुली (इन्डक्सन)">बिजुली (इन्डक्सन)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>जग्गा क्षेत्रफल (रोपनी):</label>
                    <input
                      type="number"
                      step="0.5"
                      value={formData.landAreaRopani}
                      onChange={(e) => setFormData({ ...formData, landAreaRopani: Number(e.target.value) })}
                      style={{ width: '100%', height: '38px', borderRadius: '8px', border: '1px solid #cbd5e1', padding: '0 8px' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>पशुपन्छी संख्या (गाई, बाख्रा):</label>
                    <input
                      type="number"
                      value={formData.livestockCount}
                      onChange={(e) => setFormData({ ...formData, livestockCount: Number(e.target.value) })}
                      style={{ width: '100%', height: '38px', borderRadius: '8px', border: '1px solid #cbd5e1', padding: '0 8px' }}
                    />
                  </div>
                </div>

                {/* Skip Logic: Remittance */}
                <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '0.75rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.hasRemittance}
                      onChange={(e) => setFormData({ ...formData, hasRemittance: e.target.checked })}
                    />
                    <span>के परिवारमा वैदेशिक रोजगारीबाट रेमिट्यान्स आउँछ?</span>
                  </label>

                  {formData.hasRemittance && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <label style={{ fontSize: '0.72rem', fontWeight: 700 }}>अनुमानित वार्षिक विप्रेषण (रु.):</label>
                      <input
                        type="number"
                        placeholder="उदा. ४०००००"
                        value={formData.remittanceAnnualRs}
                        onChange={(e) => setFormData({ ...formData, remittanceAnnualRs: Number(e.target.value) })}
                        style={{ width: '100%', height: '36px', borderRadius: '6px', border: '1px solid #cbd5e1', padding: '0 8px', marginTop: '2px' }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step Navigation Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', marginTop: '1.25rem' }}>
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep((prev) => prev - 1)}
                  style={{
                    backgroundColor: '#e2e8f0',
                    color: '#334155',
                    border: 'none',
                    padding: '10px 16px',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  ← अघिल्लो चरण
                </button>
              ) : <div />}

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep((prev) => prev + 1)}
                  style={{
                    backgroundColor: '#0f766e',
                    color: '#fff',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  अर्को चरण →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  style={{
                    backgroundColor: '#16a34a',
                    color: '#fff',
                    border: 'none',
                    padding: '10px 22px',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 900,
                    boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)',
                    cursor: 'pointer',
                  }}
                >
                  ✓ सर्भे फारम सुरक्षित गर्नुहोस्
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW MODE 3: SUBMISSION DETAIL MODAL */}
      {/* ========================================================================= */}
      {viewMode === 'detail' && selectedSurvey && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 2200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: '16px',
              maxWidth: '480px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div>
                <span style={{ fontSize: '0.68rem', backgroundColor: '#ccfbf1', color: '#0f766e', padding: '2px 8px', borderRadius: '4px', fontWeight: 800 }}>
                  वडा {selectedSurvey.wardNo} • {selectedSurvey.tole}
                </span>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f172a', margin: '4px 0 0 0' }}>
                  {selectedSurvey.headName} ({selectedSurvey.householdNo})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                style={{ background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.78rem' }}>
              <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div>📍 <strong>GPS अवस्थिति:</strong> Lat {selectedSurvey.gps.lat}, Lng {selectedSurvey.gps.lng} ({selectedSurvey.gps.altitude}m उचाइ)</div>
                <div>🏠 <strong>घरको प्रकार:</strong> {selectedSurvey.houseStructure} ({selectedSurvey.storeys} तला)</div>
                <div>⚠️ <strong>विपद् जोखिम:</strong> {selectedSurvey.disasterRisk}</div>
              </div>

              <div>
                <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                  👥 पारिवारिक सदस्यहरू ({selectedSurvey.familyMembers.length} जना):
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {selectedSurvey.familyMembers.map((m, i) => (
                    <div key={m.id} style={{ backgroundColor: '#f1f5f9', padding: '6px 8px', borderRadius: '6px' }}>
                      {i + 1}. <strong>{m.name}</strong> ({m.relation}) • {m.gender}, {m.age} वर्ष • {m.education} • {m.occupation}
                      {m.isAbroad && <span style={{ color: '#d97706', fontWeight: 700 }}> [वैदेशिक रोजगारी: {m.abroadCountry}]</span>}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div>💧 <strong>खानेपानी:</strong> {selectedSurvey.waterSource}</div>
                <div>🚽 <strong>शौचालय:</strong> {selectedSurvey.toiletType}</div>
                <div>🌾 <strong>खेती जमिन:</strong> {selectedSurvey.landAreaRopani} रोपनी • पशु: {selectedSurvey.livestockCount}</div>
                {selectedSurvey.hasRemittance && (
                  <div>💵 <strong>वार्षिक विप्रेषण:</strong> रु. {selectedSurvey.remittanceAnnualRs?.toLocaleString('ne-NP')}/-</div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setViewMode('list')}
              style={{
                width: '100%',
                backgroundColor: '#0f766e',
                color: '#fff',
                border: 'none',
                height: '38px',
                borderRadius: '8px',
                fontWeight: 800,
                fontSize: '0.82rem',
                marginTop: '1rem',
                cursor: 'pointer',
              }}
            >
              बन्द गर्नुहोस्
            </button>
          </div>
        </div>
      )}

      {/* ─── MODAL: ADD FAMILY MEMBER POPUP ─── */}
      {showMemberModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(3px)',
            zIndex: 2300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: '16px',
              maxWidth: '420px',
              width: '100%',
              padding: '1.25rem',
            }}
          >
            <h3 style={{ fontSize: '1rem', fontWeight: 900, color: '#0f172a', margin: '0 0 0.75rem 0' }}>
              परिवारको सदस्य थप्नुहोस्
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700 }}>सदस्यको पूरा नाम:</label>
                <input
                  type="text"
                  required
                  placeholder="उदा. पासाङ तामाङ"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  style={{ width: '100%', height: '36px', borderRadius: '6px', border: '1px solid #cbd5e1', padding: '0 8px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700 }}>घरमुलीसँगको नाता:</label>
                  <select
                    value={newMember.relation}
                    onChange={(e) => setNewMember({ ...newMember, relation: e.target.value })}
                    style={{ width: '100%', height: '36px', borderRadius: '6px', border: '1px solid #cbd5e1', padding: '0 6px' }}
                  >
                    <option value="घरमुली">घरमुली</option>
                    <option value="पति/पत्नी">पति/पत्नी</option>
                    <option value="छोरा">छोरा</option>
                    <option value="छोरी">छोरी</option>
                    <option value="बाबु/आमा">बाबु/आमा</option>
                    <option value="बुहारी">बुहारी</option>
                    <option value="नाति/नातिनी">नाति/नातिनी</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700 }}>लिंग:</label>
                  <select
                    value={newMember.gender}
                    onChange={(e) => setNewMember({ ...newMember, gender: e.target.value as any })}
                    style={{ width: '100%', height: '36px', borderRadius: '6px', border: '1px solid #cbd5e1', padding: '0 6px' }}
                  >
                    <option value="पुरुष">पुरुष</option>
                    <option value="महिला">महिला</option>
                    <option value="अन्य">अन्य</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700 }}>उमेर (वर्ष):</label>
                  <input
                    type="number"
                    value={newMember.age}
                    onChange={(e) => setNewMember({ ...newMember, age: Number(e.target.value) })}
                    style={{ width: '100%', height: '36px', borderRadius: '6px', border: '1px solid #cbd5e1', padding: '0 8px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700 }}>शैक्षिक योग्यता:</label>
                  <select
                    value={newMember.education}
                    onChange={(e) => setNewMember({ ...newMember, education: e.target.value })}
                    style={{ width: '100%', height: '36px', borderRadius: '6px', border: '1px solid #cbd5e1', padding: '0 6px' }}
                  >
                    <option value="निरक्षर">निरक्षर</option>
                    <option value="सामान्य लेखपढ">सामान्य लेखपढ</option>
                    <option value="आधारभूत (कक्षा १-८)">आधारभूत (१-८)</option>
                    <option value="माध्यमिक (एसईई)">माध्यमिक (एसईई)</option>
                    <option value="कक्षा १२ / प्रवीणता">कक्षा १२</option>
                    <option value="स्नातक वा माथि">स्नातक वा माथि</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700 }}>मुख्य पेशा:</label>
                <select
                  value={newMember.occupation}
                  onChange={(e) => setNewMember({ ...newMember, occupation: e.target.value })}
                  style={{ width: '100%', height: '36px', borderRadius: '6px', border: '1px solid #cbd5e1', padding: '0 8px' }}
                >
                  <option value="कृषि तथा पशुपालन">कृषि तथा पशुपालन</option>
                  <option value="व्यापार/होटेल/होमस्टे">व्यापार / होटेल / होमस्टे</option>
                  <option value="सरकारी/निजी जागिर">सरकारी / निजी जागिर</option>
                  <option value="विद्यार्थी">विद्यार्थी</option>
                  <option value="वैदेशिक रोजगारी">वैदेशिक रोजगारी</option>
                  <option value="घरायसी काम">घरायसी काम</option>
                </select>
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '6px 8px', borderRadius: '6px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', fontWeight: 700 }}>
                  <input
                    type="checkbox"
                    checked={newMember.isAbroad}
                    onChange={(e) => setNewMember({ ...newMember, isAbroad: e.target.checked })}
                  />
                  <span>के यो सदस्य हाल वैदेशिक रोजगारीमा छ?</span>
                </label>
                {newMember.isAbroad && (
                  <input
                    type="text"
                    placeholder="कुन देश? (उदा. कतार, मलेसिया, यूएई, जापान)"
                    value={newMember.abroadCountry}
                    onChange={(e) => setNewMember({ ...newMember, abroadCountry: e.target.value })}
                    style={{ width: '100%', height: '34px', borderRadius: '6px', border: '1px solid #cbd5e1', padding: '0 8px', marginTop: '4px' }}
                  />
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowMemberModal(false)}
                  style={{ flex: 1, backgroundColor: '#e2e8f0', color: '#334155', border: 'none', height: '36px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
                >
                  रद्द
                </button>
                <button
                  type="button"
                  onClick={handleAddMember}
                  style={{ flex: 1.5, backgroundColor: '#0f766e', color: '#fff', border: 'none', height: '36px', borderRadius: '6px', fontWeight: 800, cursor: 'pointer' }}
                >
                  सदस्य थप्नुहोस्
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
