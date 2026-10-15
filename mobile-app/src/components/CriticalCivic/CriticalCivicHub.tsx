import React, { useState, useEffect, useRef } from 'react';
import {
  Waves,
  AlertTriangle,
  ShieldCheck,
  Truck,
  Scale,
  Wrench,
  Search,
  Phone,
  Camera,
  MapPin,
  Clock,
  CheckCircle2,
  Bell,
  Navigation,
  FileText,
  UserCheck,
  Volume2,
  Sparkles,
  ChevronRight,
  Send,
  X,
  ExternalLink,
  ShieldAlert,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import {
  MOCK_RIVER_GAUGES,
  MOCK_SHELTERS,
  MOCK_BENEFICIARIES,
  MOCK_GARBAGE_TRUCK,
  MOCK_JUDICIAL_CASES,
  MOCK_SKILLED_WORKERS,
  RiverGauge,
  BeneficiaryRecord,
  JudicialCase,
  SkilledWorker,
} from '../../data/mockCriticalCivicData';

export const CriticalCivicHub: React.FC = () => {
  // 5 Features Tab
  const [activeTab, setActiveTab] = useState<'flood' | 'ekyc' | 'garbage' | 'judicial' | 'skills'>('flood');

  // 1. Flood & Early Warning State
  const [isFloodSirenPlaying, setIsFloodSirenPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // 2. Social Security e-KYC State
  const [searchCitizenId, setSearchCitizenId] = useState('');
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<BeneficiaryRecord | null>(MOCK_BENEFICIARIES[0]);
  const [isCapturingLiveness, setIsCapturingLiveness] = useState(false);
  const [livenessStep, setLivenessStep] = useState<'idle' | 'scanning' | 'verifying' | 'success'>('idle');
  const [renewedSuccess, setRenewedSuccess] = useState(false);

  // 3. Garbage Truck State
  const [isBellAlertEnabled, setIsBellAlertEnabled] = useState(true);
  const [truckEta, setTruckEta] = useState(MOCK_GARBAGE_TRUCK.etaMinutes);
  const [truckPositionPercent, setTruckPositionPercent] = useState(42);

  // 4. Judicial Committee State
  const [judicialSearch, setJudicialSearch] = useState('');
  const [selectedCase, setSelectedCase] = useState<JudicialCase | null>(null);
  const [isFilingModalOpen, setIsFilingModalOpen] = useState(false);
  const [newCaseForm, setNewCaseForm] = useState({
    plaintiff: '',
    defendant: '',
    ward: 3,
    category: 'जग्गाको साँध-सिमाना विवाद',
    desc: '',
    phone: '',
  });
  const [caseSubmittedSuccess, setCaseSubmittedSuccess] = useState<string | null>(null);

  // 5. Skill Bank State
  const [skillCategoryFilter, setSkillCategoryFilter] = useState('सबै');
  const [skillSearch, setSkillSearch] = useState('');
  const [isSkillRegisterOpen, setIsSkillRegisterOpen] = useState(false);
  const [skillForm, setSkillForm] = useState({
    name: '',
    phone: '',
    skill: 'प्लम्बर',
    ward: 3,
    exp: 3,
    about: '',
  });
  const [skillSuccessMsg, setSkillSuccessMsg] = useState(false);

  // Truck Animation Tick
  useEffect(() => {
    const interval = setInterval(() => {
      setTruckPositionPercent((prev) => (prev >= 90 ? 25 : prev + 1));
      setTruckEta((prev) => (prev <= 2 ? 18 : prev - 0.2));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Web Audio Flood Warning Siren
  const toggleFloodSiren = () => {
    if (isFloodSirenPlaying) {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
      setIsFloodSirenPlaying(false);
    } else {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        audioCtxRef.current = ctx;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        gain.gain.setValueAtTime(0.25, ctx.currentTime);

        let freq = 450;
        let up = true;
        const sirenTimer = setInterval(() => {
          if (!audioCtxRef.current) {
            clearInterval(sirenTimer);
            return;
          }
          freq = up ? freq + 25 : freq - 25;
          if (freq > 850) up = false;
          if (freq < 450) up = true;
          osc.frequency.setValueAtTime(freq, ctx.currentTime);
        }, 50);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        setIsFloodSirenPlaying(true);
      } catch (err) {
        console.error('Audio siren error:', err);
      }
    }
  };

  // e-KYC Face Liveness Trigger
  const runLivenessVerification = () => {
    setIsCapturingLiveness(true);
    setLivenessStep('scanning');

    setTimeout(() => {
      setLivenessStep('verifying');
      setTimeout(() => {
        setLivenessStep('success');
        setRenewedSuccess(true);
        if (selectedBeneficiary) {
          selectedBeneficiary.status = 'सफल';
          selectedBeneficiary.lastRenewedDateBs = '२०८१/०६/१२ (अनलाइन e-KYC)';
        }
      }, 2000);
    }, 2500);
  };

  return (
    <div style={{ marginTop: '0.5rem' }}>
      {/* ─── 5 SPECIAL FEATURES HORIZONTAL CHIPS DOCK ─── */}
      <div
        style={{
          display: 'flex',
          gap: '0.45rem',
          overflowX: 'auto',
          paddingBottom: '8px',
          scrollbarWidth: 'none',
          marginBottom: '0.85rem',
        }}
      >
        {[
          { id: 'flood', label: '१. बाढी पूर्वसूचना', icon: <Waves size={14} />, badge: '२ नदी अलर्ट' },
          { id: 'ekyc', label: '२. भत्ता e-KYC', icon: <UserCheck size={14} />, badge: 'फेस प्रमाणीकरण' },
          { id: 'garbage', label: '३. फोहोर गाडी GPS', icon: <Truck size={14} />, badge: 'प्रत्यक्ष' },
          { id: 'judicial', label: '४. न्यायिक इजलास', icon: <Scale size={14} />, badge: 'उजुरी/तारेख' },
          { id: 'skills', label: '५. सीप/रोजगार बैंक', icon: <Wrench size={14} />, badge: `${MOCK_SKILLED_WORKERS.length} जनशक्ति` },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 12px',
                borderRadius: '20px',
                border: isActive ? '1.5px solid #0F4C81' : '1px solid #e2e8f0',
                backgroundColor: isActive ? '#0F4C81' : '#ffffff',
                color: isActive ? '#ffffff' : '#334155',
                fontSize: '0.74rem',
                fontWeight: 800,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                boxShadow: isActive ? '0 3px 10px rgba(15, 76, 129, 0.25)' : '0 1px 3px rgba(0,0,0,0.02)',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>
              <span
                style={{
                  fontSize: '0.62rem',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
                  color: isActive ? '#ffffff' : '#64748b',
                }}
              >
                {tab.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 1. DISASTER & FLOOD EARLY WARNING SYSTEM (विपद् तथा बाढी पूर्वसूचना) */}
      {/* ========================================================================= */}
      {activeTab === 'flood' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {/* Critical Flood Alert Banner */}
          <div
            style={{
              background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
              color: '#ffffff',
              borderRadius: '14px',
              padding: '1rem',
              boxShadow: '0 6px 20px rgba(239, 68, 68, 0.3)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldAlert size={18} />
                <span style={{ fontSize: '0.78rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  बाढी तथा पहिरो पूर्वसूचना केन्द्र
                </span>
              </div>
              <span
                style={{
                  backgroundColor: 'rgba(255,255,255,0.25)',
                  fontSize: '0.65rem',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  fontWeight: 700,
                }}
              >
                प्रत्यक्ष IoT सेन्सर
              </span>
            </div>

            <p style={{ fontSize: '0.76rem', lineHeight: 1.4, margin: '0 0 0.75rem 0', opacity: 0.95 }}>
              इन्द्रावती नदीमा जलसतह खतराको विन्दु (६.० मिटर) नाघेको छ। वडा नं. १ र ३ का नदी तटीय बासिन्दालाई तत्काल सुरक्षित उच्च स्थानमा जान अनुरोध छ।
            </p>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={toggleFloodSiren}
                style={{
                  flex: 1,
                  backgroundColor: isFloodSirenPlaying ? '#ffffff' : 'rgba(255,255,255,0.2)',
                  color: isFloodSirenPlaying ? '#b91c1c' : '#ffffff',
                  border: '1px solid rgba(255,255,255,0.4)',
                  padding: '8px',
                  borderRadius: '8px',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <Volume2 size={16} />
                <span>{isFloodSirenPlaying ? 'साइरन बन्द गर्नुहोस्' : 'परीक्षण साइरन बजाउनुहोस्'}</span>
              </button>

              <a
                href="tel:9841234567"
                style={{
                  backgroundColor: '#ffffff',
                  color: '#b91c1c',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontWeight: 900,
                  fontSize: '0.75rem',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Phone size={14} />
                <span>उद्धार हटलाइन</span>
              </a>
            </div>
          </div>

          {/* Real-time River Water Level Gauges */}
          <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>
            🌊 मुख्य नदीहरूको प्रत्यक्ष जलसतह (Real-time Water Levels):
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {MOCK_RIVER_GAUGES.map((rg) => {
              const pct = Math.min(100, Math.round((rg.currentLevelM / (rg.dangerLevelM * 1.2)) * 100));
              const isDanger = rg.status === 'danger';
              const isWarning = rg.status === 'warning';
              const color = isDanger ? '#ef4444' : isWarning ? '#f59e0b' : '#10b981';

              return (
                <div
                  key={rg.id}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    padding: '0.85rem',
                    border: `1px solid ${isDanger ? '#fecdd3' : '#e2e8f0'}`,
                    boxShadow: '0 2px 5px rgba(0,0,0,0.02)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>{rg.riverName}</div>
                      <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                        {rg.stationName} • वडा नं. {rg.wardNo}
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        backgroundColor: isDanger ? '#fee2e2' : isWarning ? '#fef3c7' : '#ecfdf5',
                        color,
                      }}
                    >
                      {isDanger ? '🔴 खतरा विन्दु नाघ्यो' : isWarning ? '🟡 सतर्कता तह' : '🟢 सामान्य स्थिति'}
                    </span>
                  </div>

                  {/* Water Meter Bar */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem', color: '#475569', marginBottom: '4px' }}>
                    <span>हालको सतह: <strong style={{ color, fontSize: '0.88rem' }}>{rg.currentLevelM} मिटर</strong></span>
                    <span>खतरा तह: <strong>{rg.dangerLevelM} मिटर</strong></span>
                  </div>

                  <div style={{ height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${pct}%`,
                        backgroundColor: color,
                        borderRadius: '4px',
                        transition: 'width 0.5s ease',
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', fontSize: '0.65rem', color: '#64748b' }}>
                    <span>प्रवृत्ति: {rg.trend === 'rising' ? '🔺 जलसतह बढ्दो क्रममा' : '➖ स्थिर'}</span>
                    <span>अपडेट: {rg.updatedAt}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Designated Evacuation Shelters */}
          <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', marginTop: '0.35rem' }}>
            🏕️ सुरक्षित आपतकालीन आश्रयस्थलहरू (Evacuation Shelters):
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            {MOCK_SHELTERS.map((sh) => (
              <div
                key={sh.id}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '10px',
                  padding: '0.75rem',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f172a' }}>{sh.name}</div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                    {sh.location} (वडा नं. {sh.wardNo}) • क्षमता: {sh.capacityPersons} जना
                  </div>
                  <div style={{ display: 'flex', gap: '4px', marginTop: '4px', flexWrap: 'wrap' }}>
                    {sh.facilities.map((fac, i) => (
                      <span key={i} style={{ fontSize: '0.6rem', backgroundColor: '#f1f5f9', padding: '1px 5px', borderRadius: '4px', color: '#475569' }}>
                        ✓ {fac}
                      </span>
                    ))}
                  </div>
                </div>
                <a
                  href={`tel:${sh.contactNo}`}
                  style={{
                    backgroundColor: '#16a34a',
                    color: '#ffffff',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textDecoration: 'none',
                    flexShrink: 0,
                    marginLeft: '8px',
                  }}
                  title="सम्पर्क व्यक्तिलाई कल गर्नुहोस्"
                >
                  <Phone size={15} />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. SOCIAL SECURITY ALLOWANCE e-KYC (सामाजिक सुरक्षा भत्ता नवीकरण) */}
      {/* ========================================================================= */}
      {activeTab === 'ekyc' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div
            style={{
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#ffffff',
              borderRadius: '14px',
              padding: '1rem',
              boxShadow: '0 4px 15px rgba(2, 132, 199, 0.25)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.35rem' }}>
              <UserCheck size={18} />
              <div style={{ fontSize: '0.88rem', fontWeight: 900 }}>सामाजिक सुरक्षा भत्ता डिजिटल e-KYC</div>
            </div>
            <p style={{ fontSize: '0.75rem', opacity: 0.95, margin: 0, lineHeight: 1.4 }}>
              ८० वर्ष माथिका ज्येष्ठ नागरिक, अशक्त र अपाङ्गता भएका लाभग्राहीले वडा कार्यालय धाउनु नपर्ने गरी घरमै मोबाइल क्यामेराबाट अनुहार प्रमाणीकरण (Face Liveness) गरी भत्ता नवीकरण गर्नुहोस्।
            </p>
          </div>

          {/* Citizen Search / Card Selection */}
          <div style={{ backgroundColor: '#ffffff', padding: '0.85rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569' }}>
              लाभग्राही छान्नुहोस् वा नागरिकता नं. हाल्नुहोस्:
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '4px' }}>
              <select
                style={{
                  flex: 1,
                  height: '38px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  padding: '0 8px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                }}
                value={selectedBeneficiary?.ssnCardNo || ''}
                onChange={(e) => {
                  const b = MOCK_BENEFICIARIES.find((x) => x.ssnCardNo === e.target.value);
                  if (b) {
                    setSelectedBeneficiary(b);
                    setRenewedSuccess(false);
                    setLivenessStep('idle');
                  }
                }}
              >
                {MOCK_BENEFICIARIES.map((b) => (
                  <option key={b.ssnCardNo} value={b.ssnCardNo}>
                    {b.fullName} ({b.category} - वडा {b.wardNo})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Beneficiary Details Card */}
          {selectedBeneficiary && (
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                padding: '1rem',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div>
                  <span style={{ fontSize: '0.68rem', backgroundColor: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '4px', fontWeight: 800 }}>
                    {selectedBeneficiary.category}
                  </span>
                  <div style={{ fontSize: '1rem', fontWeight: 900, color: '#0f172a', marginTop: '4px' }}>
                    {selectedBeneficiary.fullName}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    padding: '3px 8px',
                    borderRadius: '6px',
                    backgroundColor: selectedBeneficiary.status === 'सफल' ? '#dcfce7' : '#fee2e2',
                    color: selectedBeneficiary.status === 'सफल' ? '#166534' : '#b91c1c',
                  }}
                >
                  {selectedBeneficiary.status}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.45rem', fontSize: '0.75rem', backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '8px', marginBottom: '0.85rem' }}>
                <div>नागरिकता नं.: <strong>{selectedBeneficiary.citizenshipNo}</strong></div>
                <div>कार्ड नं.: <strong>{selectedBeneficiary.ssnCardNo}</strong></div>
                <div>जन्म मिति: <strong>{selectedBeneficiary.dobBs}</strong></div>
                <div>वडा नं.: <strong>{selectedBeneficiary.wardNo}</strong></div>
                <div style={{ gridColumn: 'span 2' }}>
                  बैंक खाता: <strong>{selectedBeneficiary.bankName}</strong> ({selectedBeneficiary.accountNo})
                </div>
                <div style={{ gridColumn: 'span 2', color: '#64748b', fontSize: '0.7rem' }}>
                  अन्तिम नवीकरण: {selectedBeneficiary.lastRenewedDateBs}
                </div>
              </div>

              {/* Face Liveness Verification Box */}
              {renewedSuccess ? (
                <div
                  style={{
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #86efac',
                    padding: '1rem',
                    borderRadius: '10px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ width: '45px', height: '45px', borderRadius: '50%', backgroundColor: '#22c55e', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px auto' }}>
                    <CheckCircle2 size={24} />
                  </div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 900, color: '#166534' }}>
                    ✓ जीवन प्रमाणीकरण (e-KYC) सफल भयो!
                  </div>
                  <p style={{ fontSize: '0.74rem', color: '#15803d', margin: '4px 0 8px 0' }}>
                    राष्ट्रिय परिचयपत्र तथा पञ्जीकरण विभाग (VERSP-MICS) प्रणालीमा चालु आ.व. को भत्ता नवीकरण अद्यावधिक भयो।
                  </p>
                  <div style={{ fontSize: '0.7rem', color: '#475569', backgroundColor: '#ffffff', padding: '6px', borderRadius: '6px', border: '1px dashed #86efac' }}>
                    प्रमाणीकरण कोड: <strong>KYC-PPK-8821-2081</strong>
                  </div>
                </div>
              ) : isCapturingLiveness ? (
                <div
                  style={{
                    backgroundColor: '#0f172a',
                    color: '#ffffff',
                    padding: '1.25rem',
                    borderRadius: '12px',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      width: '120px',
                      height: '120px',
                      borderRadius: '50%',
                      border: '3px dashed #38bdf8',
                      margin: '0 auto 12px auto',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column',
                      animation: 'pulse 1.5s infinite',
                    }}
                  >
                    <Camera size={32} color="#38bdf8" />
                    <span style={{ fontSize: '0.62rem', color: '#94a3b8', marginTop: '4px' }}>
                      {livenessStep === 'scanning' ? 'आँखा झिम्क्याउनुहोस्' : 'प्रमाणीकरण हुँदै...'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>
                    {livenessStep === 'scanning' ? 'अनुहार फ्रेमभित्र राख्नुहोस्...' : 'बायोमेट्रिक प्रमाणीकरण हुँदैछ...'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px' }}>
                    कृपया क्यामेरातिर सिधा हेर्नुहोस् र उज्यालोमा बस्नुहोस्।
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={runLivenessVerification}
                  style={{
                    width: '100%',
                    backgroundColor: '#16a34a',
                    color: '#ffffff',
                    border: 'none',
                    height: '42px',
                    borderRadius: '8px',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <Camera size={16} />
                  <span>घरमै बसी क्यामेराबाट e-KYC नवीकरण गर्नुहोस्</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. LIVE GARBAGE TRUCK TRACKER (फोहोरमैला संकलन गाडी प्रत्यक्ष ट्र्याकिङ) */}
      {/* ========================================================================= */}
      {activeTab === 'garbage' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {/* Header Card */}
          <div
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
              color: '#ffffff',
              borderRadius: '14px',
              padding: '1rem',
              boxShadow: '0 4px 15px rgba(16, 185, 129, 0.25)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Truck size={18} />
                <span style={{ fontSize: '0.88rem', fontWeight: 900 }}>फोहोर गाडी प्रत्यक्ष GPS ट्र्याकिङ</span>
              </div>
              <span style={{ backgroundColor: 'rgba(255,255,255,0.25)', fontSize: '0.62rem', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
                प्रत्यक्ष लाइभ
              </span>
            </div>

            <div style={{ fontSize: '0.78rem', opacity: 0.95 }}>
              गाडी नं.: <strong>{MOCK_GARBAGE_TRUCK.vehicleNumber}</strong>
            </div>
            <div style={{ fontSize: '0.72rem', opacity: 0.85, marginTop: '2px' }}>
              चालक: {MOCK_GARBAGE_TRUCK.driverName} • आजको संकलन: <strong>{MOCK_GARBAGE_TRUCK.wasteType}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.85rem', backgroundColor: 'rgba(0,0,0,0.15)', padding: '6px 10px', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.75rem' }}>
                तपाईंको टोलमा आइपुग्न बाँकी समय: <strong style={{ fontSize: '0.95rem', color: '#fde047' }}>~{Math.round(truckEta)} मिनेट</strong>
              </div>
              <button
                type="button"
                onClick={() => setIsBellAlertEnabled(!isBellAlertEnabled)}
                style={{
                  backgroundColor: isBellAlertEnabled ? '#fde047' : '#ffffff',
                  color: isBellAlertEnabled ? '#0f172a' : '#475569',
                  border: 'none',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Bell size={12} />
                <span>{isBellAlertEnabled ? 'घण्टी चालु' : 'घण्टी बन्द'}</span>
              </button>
            </div>
          </div>

          {/* Interactive Simulated Route Canvas / Map */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '1rem', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem' }}>
              🗺️ प्रत्यक्ष रुट नक्सा (Live Route Progress):
            </div>

            {/* Styled Map Pathway */}
            <div
              style={{
                position: 'relative',
                height: '70px',
                backgroundColor: '#f1f5f9',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                padding: '0 15px',
              }}
            >
              {/* Road Dash line */}
              <div
                style={{
                  position: 'absolute',
                  left: '15px',
                  right: '15px',
                  height: '4px',
                  backgroundColor: '#94a3b8',
                  borderRadius: '2px',
                }}
              />

              {/* Truck Icon moving */}
              <div
                style={{
                  position: 'absolute',
                  left: `${truckPositionPercent}%`,
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  transition: 'left 2.5s ease-in-out',
                }}
              >
                <div
                  style={{
                    backgroundColor: '#10b981',
                    color: '#ffffff',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 10px rgba(16, 185, 129, 0.5)',
                  }}
                >
                  <Truck size={17} />
                </div>
                <span style={{ fontSize: '0.6rem', fontWeight: 800, backgroundColor: '#0f172a', color: '#fff', padding: '1px 5px', borderRadius: '4px', marginTop: '2px', whiteSpace: 'nowrap' }}>
                  {MOCK_GARBAGE_TRUCK.speedKmH} किमी/घण्टा
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#64748b', marginTop: '6px' }}>
              <span>भोटेनाम्लाङ बसपार्क</span>
              <span>गुन्सा बजार (तपाईंको टोल)</span>
              <span>वडा कार्यालय</span>
            </div>
          </div>

          {/* Stops Timeline */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '1rem', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.65rem' }}>
              🚏 आजको संकलन तालिका र स्टपहरू:
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {MOCK_GARBAGE_TRUCK.stops.map((stop, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', padding: '6px 0', borderBottom: i < MOCK_GARBAGE_TRUCK.stops.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        backgroundColor: stop.passed ? '#10b981' : '#cbd5e1',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.62rem',
                        fontWeight: 900,
                      }}
                    >
                      {stop.passed ? '✓' : i + 1}
                    </div>
                    <span style={{ fontWeight: stop.passed ? 600 : 700, color: stop.passed ? '#64748b' : '#0f172a' }}>
                      {stop.name}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: stop.passed ? '#10b981' : '#64748b', fontWeight: 700 }}>
                    {stop.passed ? 'सम्पन्न भयो' : stop.time}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
              <a
                href={`tel:${MOCK_GARBAGE_TRUCK.driverPhone}`}
                style={{
                  flex: 1,
                  backgroundColor: '#f1f5f9',
                  color: '#334155',
                  padding: '8px',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                }}
              >
                <Phone size={14} />
                <span>चालकसँग सम्पर्क ({MOCK_GARBAGE_TRUCK.driverPhone})</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. JUDICIAL COMMITTEE e-COURT (न्यायिक समिति अनलाइन इजलास) */}
      {/* ========================================================================= */}
      {activeTab === 'judicial' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {/* Header Card */}
          <div
            style={{
              background: 'linear-gradient(135deg, #475569 0%, #1e293b 100%)',
              color: '#ffffff',
              borderRadius: '14px',
              padding: '1rem',
              boxShadow: '0 4px 15px rgba(30, 41, 59, 0.25)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Scale size={18} />
                <span style={{ fontSize: '0.88rem', fontWeight: 900 }}>न्यायिक समिति डिजिटल इजलास</span>
              </div>
              <span style={{ backgroundColor: 'rgba(255,255,255,0.2)', fontSize: '0.62rem', padding: '2px 8px', borderRadius: '10px' }}>
                ऐन, २०७४
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', opacity: 0.95, margin: 0, lineHeight: 1.4 }}>
              गाउँपालिका उपाध्यक्ष/नगर उपप्रमुख संयोजक रहेको न्यायिक समितिमा साँध-सिमाना, घरेलु झैझगडा र ज्याला मजुरी सम्बन्धी उजुरी अनलाइन दर्ता, पेशी तारेख र मेलमिलाप फैसला हेर्नुहोस्।
            </p>

            <button
              type="button"
              onClick={() => setIsFilingModalOpen(true)}
              style={{
                backgroundColor: '#f59e0b',
                color: '#0f172a',
                border: 'none',
                padding: '8px 14px',
                borderRadius: '8px',
                fontWeight: 900,
                fontSize: '0.78rem',
                cursor: 'pointer',
                marginTop: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <FileText size={15} />
              <span>+ नयाँ न्यायिक उजुरी दर्ता गर्नुहोस्</span>
            </button>
          </div>

          {/* Search Case */}
          <div style={{ position: 'relative' }}>
            <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="मुद्दा नं., वादी वा प्रतिवादीको नामबाट खोज्नुहोस्..."
              value={judicialSearch}
              onChange={(e) => setJudicialSearch(e.target.value)}
              style={{
                width: '100%',
                height: '38px',
                paddingLeft: '32px',
                paddingRight: '12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.78rem',
              }}
            />
          </div>

          {/* Active Judicial Cases */}
          <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>
            📋 न्यायिक समितिमा विचाराधीन तथा फैसला भएका मुद्दाहरू:
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {MOCK_JUDICIAL_CASES.filter((c) => {
              const q = judicialSearch.toLowerCase();
              return !q || c.caseNo.toLowerCase().includes(q) || c.plaintiff.toLowerCase().includes(q) || c.defendant.toLowerCase().includes(q) || c.disputeCategory.toLowerCase().includes(q);
            }).map((c) => (
              <div
                key={c.caseNo}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  padding: '0.9rem',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.02)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, backgroundColor: '#f1f5f9', color: '#334155', padding: '2px 8px', borderRadius: '4px' }}>
                    {c.caseNo}
                  </span>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '6px',
                      backgroundColor: c.status === 'फैसला तयार' ? '#dcfce7' : '#fef3c7',
                      color: c.status === 'फैसला तयार' ? '#166534' : '#b45309',
                    }}
                  >
                    {c.status}
                  </span>
                </div>

                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                  {c.disputeCategory}
                </div>

                <div style={{ fontSize: '0.74rem', color: '#475569', marginBottom: '6px' }}>
                  वादी: <strong>{c.plaintiff}</strong> • प्रतिवादी: <strong>{c.defendant}</strong> (वडा नं. {c.wardNo})
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '0.65rem', borderRadius: '8px', fontSize: '0.72rem', color: '#334155', lineHeight: 1.4, marginBottom: '6px' }}>
                  {c.summary}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.68rem', color: '#64748b' }}>
                  <span>📅 आगामी पेशी/तारेख: <strong style={{ color: '#0284c7' }}>{c.nextHearingDateBs}</strong></span>
                  <span>दर्ता: {c.filingDateBs}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Modal for Filing Judicial Complaint */}
          {isFilingModalOpen && (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0,0,0,0.6)',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem',
              }}
            >
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  maxWidth: '460px',
                  width: '100%',
                  maxHeight: '90vh',
                  overflowY: 'auto',
                  padding: '1.25rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#0f172a' }}>
                    न्यायिक समिति उजुरी दरखास्त फारम
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsFilingModalOpen(false)}
                    style={{ background: '#f1f5f9', border: 'none', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer' }}
                  >
                    ✕
                  </button>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const code = `न्या.स.-०८१/०८२-${Math.floor(100 + Math.random() * 900)}`;
                    setCaseSubmittedSuccess(code);
                    setIsFilingModalOpen(false);
                  }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}
                >
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700 }}>वादी (निवेदक) को नाम:</label>
                    <input
                      type="text"
                      required
                      value={newCaseForm.plaintiff}
                      onChange={(e) => setNewCaseForm({ ...newCaseForm, plaintiff: e.target.value })}
                      style={{ width: '100%', height: '36px', padding: '0 8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700 }}>प्रतिवादीको नाम र वडा:</label>
                    <input
                      type="text"
                      required
                      placeholder="नाम र ठेगाना..."
                      value={newCaseForm.defendant}
                      onChange={(e) => setNewCaseForm({ ...newCaseForm, defendant: e.target.value })}
                      style={{ width: '100%', height: '36px', padding: '0 8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700 }}>विवादको विषय:</label>
                    <select
                      value={newCaseForm.category}
                      onChange={(e) => setNewCaseForm({ ...newCaseForm, category: e.target.value })}
                      style={{ width: '100%', height: '36px', padding: '0 8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    >
                      <option value="जग्गाको साँध-सिमाना विवाद">जग्गाको साँध-सिमाना विवाद</option>
                      <option value="सिँचाइ कुलो तथा पानी निकास विवाद">सिँचाइ कुलो तथा पानी निकास विवाद</option>
                      <option value="कृषि ज्याला मजुरी भुक्तानी">कृषि ज्याला मजुरी भुक्तानी</option>
                      <option value="ज्येष्ठ नागरिक पालनपोषण विवाद">ज्येष्ठ नागरिक पालनपोषण विवाद</option>
                      <option value="घरेलु तथा टोल विवाद">घरेलु तथा टोल विवाद</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700 }}>उजुरीको विस्तृत व्यहोरा:</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="विवाद भएको मिति, स्थान र समस्या खुलाउनुहोस्..."
                      value={newCaseForm.desc}
                      onChange={(e) => setNewCaseForm({ ...newCaseForm, desc: e.target.value })}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  <button
                    type="submit"
                    style={{
                      backgroundColor: '#16a34a',
                      color: '#ffffff',
                      border: 'none',
                      height: '38px',
                      borderRadius: '8px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      marginTop: '0.4rem',
                    }}
                  >
                    उजुरी दर्ता गर्नुहोस्
                  </button>
                </form>
              </div>
            </div>
          )}

          {caseSubmittedSuccess && (
            <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #86efac', padding: '0.85rem', borderRadius: '8px' }}>
              <div style={{ color: '#16a34a', fontWeight: 800, fontSize: '0.85rem' }}>
                ✓ उजुरी सफलतापूर्वक दर्ता भयो!
              </div>
              <div style={{ fontSize: '0.75rem', color: '#334155', marginTop: '2px' }}>
                उजुरी दर्ता नं.: <strong>{caseSubmittedSuccess}</strong> (तपाईंलाई म्याद र तारेख सम्बन्धी जानकारी SMS मार्फत पठाइनेछ)।
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. PALIKA ROJGAR & SKILL BANK (स्थानीय सीप तथा रोजगार बैंक) */}
      {/* ========================================================================= */}
      {activeTab === 'skills' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {/* Header Card */}
          <div
            style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: '#ffffff',
              borderRadius: '14px',
              padding: '1rem',
              boxShadow: '0 4px 15px rgba(245, 158, 11, 0.25)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Wrench size={18} />
                <span style={{ fontSize: '0.88rem', fontWeight: 900 }}>पालिका सीप तथा रोजगार बैंक</span>
              </div>
              <span style={{ backgroundColor: 'rgba(255,255,255,0.25)', fontSize: '0.62rem', padding: '2px 8px', borderRadius: '10px' }}>
                प्रमाणित जनशक्ति
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', opacity: 0.95, margin: 0, lineHeight: 1.4 }}>
              घरमा प्लम्बर, इलेक्ट्रिसियन, डकर्मी वा प्राविधिक आवश्यक पर्दा १-ट्यापमा स्थानीय दक्ष युवालाई काम दिनुहोस्।
            </p>

            <button
              type="button"
              onClick={() => setIsSkillRegisterOpen(true)}
              style={{
                backgroundColor: '#ffffff',
                color: '#d97706',
                border: 'none',
                padding: '8px 14px',
                borderRadius: '8px',
                fontWeight: 900,
                fontSize: '0.78rem',
                cursor: 'pointer',
                marginTop: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Sparkles size={14} />
              <span>+ आफ्नो सीप दर्ता गर्नुहोस् (काम पाउनुहोस्)</span>
            </button>
          </div>

          {/* Category Chips */}
          <div
            style={{
              display: 'flex',
              gap: '0.35rem',
              overflowX: 'auto',
              scrollbarWidth: 'none',
              paddingBottom: '4px',
            }}
          >
            {['सबै', 'प्लम्बर', 'इलेक्ट्रिसियन/वायरिङ', 'सिकर्मी (Carpenter)', 'डकर्मी (Mason)', 'कृषि/भेट प्राविधिक', 'कम्प्युटर अपरेटर'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSkillCategoryFilter(cat)}
                style={{
                  padding: '5px 10px',
                  borderRadius: '16px',
                  border: skillCategoryFilter === cat ? '1px solid #d97706' : '1px solid #e2e8f0',
                  backgroundColor: skillCategoryFilter === cat ? '#d97706' : '#ffffff',
                  color: skillCategoryFilter === cat ? '#ffffff' : '#475569',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative' }}>
            <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="नाम, सीप वा वडाबाट खोज्नुहोस्..."
              value={skillSearch}
              onChange={(e) => setSkillSearch(e.target.value)}
              style={{
                width: '100%',
                height: '38px',
                paddingLeft: '32px',
                paddingRight: '12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.78rem',
              }}
            />
          </div>

          {/* Worker Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {MOCK_SKILLED_WORKERS.filter((w) => {
              const matchCat = skillCategoryFilter === 'सबै' || w.skillCategory === skillCategoryFilter;
              const q = skillSearch.toLowerCase();
              const matchQ = !q || w.fullName.toLowerCase().includes(q) || w.about.toLowerCase().includes(q) || w.trainingInstitute.toLowerCase().includes(q);
              return matchCat && matchQ;
            }).map((w) => (
              <div
                key={w.id}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  padding: '0.9rem',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.92rem', fontWeight: 900, color: '#0f172a' }}>
                        {w.fullName}
                      </span>
                      {w.isVerified && (
                        <span style={{ fontSize: '0.6rem', backgroundColor: '#e0f2fe', color: '#0284c7', padding: '1px 5px', borderRadius: '4px', fontWeight: 800 }}>
                          ✓ प्रमाणित
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#d97706', fontWeight: 700, marginTop: '2px' }}>
                      {w.skillCategory} • वडा नं. {w.wardNo}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#f59e0b' }}>
                      ⭐ {w.rating}
                    </div>
                    <div style={{ fontSize: '0.62rem', color: '#64748b' }}>
                      {w.totalJobsDone} काम सम्पन्न
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: '0.74rem', color: '#475569', margin: '6px 0', lineHeight: 1.4 }}>
                  {w.about}
                </p>

                <div style={{ fontSize: '0.68rem', color: '#0284c7', backgroundColor: '#f0f9ff', padding: '4px 8px', borderRadius: '6px', marginBottom: '8px' }}>
                  🎓 {w.trainingInstitute} (अनुभव: {w.experienceYears} वर्ष)
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <a
                    href={`tel:${w.phone}`}
                    style={{
                      flex: 1,
                      backgroundColor: '#16a34a',
                      color: '#ffffff',
                      height: '36px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                    }}
                  >
                    <Phone size={15} />
                    <span>सम्पर्क गर्नुहोस् ({w.phone})</span>
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Skill Registration Modal */}
          {isSkillRegisterOpen && (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0,0,0,0.6)',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem',
              }}
            >
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  maxWidth: '440px',
                  width: '100%',
                  maxHeight: '90vh',
                  overflowY: 'auto',
                  padding: '1.25rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#0f172a' }}>
                    सीप तथा रोजगार बैंक दर्ता फारम
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsSkillRegisterOpen(false)}
                    style={{ background: '#f1f5f9', border: 'none', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer' }}
                  >
                    ✕
                  </button>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSkillSuccessMsg(true);
                    setIsSkillRegisterOpen(false);
                  }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}
                >
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700 }}>तपाईंको पूरा नाम:</label>
                    <input
                      type="text"
                      required
                      value={skillForm.name}
                      onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })}
                      style={{ width: '100%', height: '36px', padding: '0 8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700 }}>मोबाइल नम्बर:</label>
                    <input
                      type="tel"
                      required
                      value={skillForm.phone}
                      onChange={(e) => setSkillForm({ ...skillForm, phone: e.target.value })}
                      style={{ width: '100%', height: '36px', padding: '0 8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700 }}>मुख्य सीप / पेशा:</label>
                    <select
                      value={skillForm.skill}
                      onChange={(e) => setSkillForm({ ...skillForm, skill: e.target.value })}
                      style={{ width: '100%', height: '36px', padding: '0 8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    >
                      <option value="प्लम्बर">प्लम्बर (Plumber)</option>
                      <option value="इलेक्ट्रिसियन/वायरिङ">इलेक्ट्रिसियन/वायरिङ</option>
                      <option value="डकर्मी (Mason)">डकर्मी (Mason)</option>
                      <option value="सिकर्मी (Carpenter)">सिकर्मी (Carpenter)</option>
                      <option value="कृषि/भेट प्राविधिक">कृषि/भेट प्राविधिक</option>
                      <option value="कम्प्युटर अपरेटर">कम्प्युटर अपरेटर</option>
                      <option value="सवारी/डोजर चालक">सवारी/डोजर चालक</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700 }}>अनुभव (वर्ष) र तालिम विवरण:</label>
                    <textarea
                      rows={3}
                      placeholder="कुन संस्थाबाट तालिम लिनुभएको छ र के-के काम गर्न सक्नुहुन्छ..."
                      value={skillForm.about}
                      onChange={(e) => setSkillForm({ ...skillForm, about: e.target.value })}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  <button
                    type="submit"
                    style={{
                      backgroundColor: '#d97706',
                      color: '#ffffff',
                      border: 'none',
                      height: '38px',
                      borderRadius: '8px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      marginTop: '0.4rem',
                    }}
                  >
                    दर्ता सुरक्षित गर्नुहोस्
                  </button>
                </form>
              </div>
            </div>
          )}

          {skillSuccessMsg && (
            <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #86efac', padding: '0.85rem', borderRadius: '8px' }}>
              <div style={{ color: '#16a34a', fontWeight: 800, fontSize: '0.85rem' }}>
                ✓ तपाईंको सीप विवरण रोजगार बैंकमा सुरक्षित भयो!
              </div>
              <div style={{ fontSize: '0.74rem', color: '#334155', marginTop: '2px' }}>
                वडा शाखाबाट प्रमाणीकरणपछि नागरिकहरूले तपाईंलाई सिधै सम्पर्क गर्न सक्नेछन्।
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
