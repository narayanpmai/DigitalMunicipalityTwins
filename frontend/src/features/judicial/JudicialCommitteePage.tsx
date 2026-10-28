import React, { useState } from 'react';
import { NepaliDatePicker } from '../../components/common/NepaliDatePicker';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  judicialApi, 
  type JudicialCase, 
  type Mediator, 
  type CauseListItem, 
  type HearingRecord, 
  type FinalSettlement 
} from '../../api/judicial';
import {
  Scale,
  Search,
  Plus,
  Printer,
  X,
  CheckCircle,
  AlertCircle,
  Users,
  Calendar,
  Building,
  FileText,
  Clock,
  Eye,
  Award,
  ChevronRight,
  Gavel,
  Phone,
  ShieldCheck,
  UserCheck,
  MapPin,
  FileCheck,
  Sparkles,
  BookOpen,
  Filter,
  Download,
  FileSpreadsheet,
} from 'lucide-react';
import { exportJudicialCasesData } from '../../utils/exportUtils';

const DISPUTE_TYPES = [
  'साँध सिमाना / जग्गा विवाद (Boundary Dispute)',
  'पानी कुलो तथा सिँचाइ (Canal & Irrigation)',
  'घर बहाल तथा सम्झौता (House Rent)',
  'बाटो निकास तथा सार्वजनिक जग्गा (Right of Way)',
  'पारिवारिक / घरेलु झैझगडा (Domestic Dispute)',
  'ज्याला मजदुरी विवाद (Wage Dispute)',
  'गाली बेइज्जती तथा अन्य (Defamation & Other)',
];

const CASE_STATUSES = [
  'नयाँ दर्ता (Registered)',
  'म्याद तामेल / लिखित जवाफ (Summons Issued)',
  'मेलमिलाप प्रक्रियामा (In Mediation)',
  'इजलास सुनुवाइमा (In Hearing)',
  'फैसला भएको (Decided)',
];

export const JudicialCommitteePage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'registry' | 'bench' | 'mediators' | 'verdicts'>('registry');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedWard, setSelectedWard] = useState<number | 'all'>('all');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewModalData, setViewModalData] = useState<JudicialCase | null>(null);
  const [benchModalData, setBenchModalData] = useState<JudicialCase | null>(null);
  const [settlementModalData, setSettlementModalData] = useState<JudicialCase | null>(null);
  const [showAddMediatorModal, setShowAddMediatorModal] = useState(false);
  const [showCauseListPrint, setShowCauseListPrint] = useState(false);

  // New Case Form
  const [caseForm, setCaseForm] = useState({
    title: '',
    disputeType: 'साँध सिमाना / जग्गा विवाद (Boundary Dispute)',
    wardNumber: 3,
    registrationDateBs: '२०८१-०६-०१',
    nextHearingDateBs: '२०८१-०६-१५',
    complainantName: '',
    complainantPhone: '',
    complainantAddress: '',
    complainantCitizenship: '',
    respondentName: '',
    respondentPhone: '',
    respondentAddress: '',
    respondentCitizenship: '',
    disputedKittaNo: '',
    claimDetails: '',
    assignedMediatorId: '',
  });

  // Bench Hearing Form
  const [hearingForm, setHearingForm] = useState({
    dateBs: '२०८१-०६-०५',
    presidedBy: 'उपाध्यक्ष / संयोजक',
    attendees: 'वादी तथा प्रतिवादी पक्ष र साक्षीहरू',
    summary: '',
    orderVerdict: '',
    nextHearingDateBs: '२०८१-०६-२०',
    status: 'order_issued' as 'adjourned' | 'order_issued' | 'settled'
  });

  // Final Settlement Form
  const [settlementForm, setSettlementForm] = useState({
    verdictType: 'मिलापत्र (Reconciliation)' as 'मिलापत्र (Reconciliation)' | 'निर्णय / फैसला (Verdict)' | 'अदालत पठाइएको (Referred to Court)',
    settledDateBs: '२०८१-०६-०५',
    settlementTerms: '',
    presidedBy: 'सुनिता अधिकारी (उपाध्यक्ष तथा संयोजक)',
    members: 'वडाध्यक्ष पासाङ शेर्पा, कार्यपालिका सदस्य रिता विक',
    remarks: 'स्थानीय सरकार सञ्चालन ऐन, २०७४ को दफा ४७ बमोजिम दुवै पक्षको रोहबरमा मिलापत्र प्रमाणित गरिएको।',
    complainantAccepted: true,
    respondentAccepted: true,
  });

  // New Mediator Form
  const [mediatorForm, setMediatorForm] = useState({
    fullName: '',
    wardNo: 3,
    phone: '',
    email: '',
    trainingInstitute: 'मेलमिलाप परिषद् नेपाल (४८ घण्टे तालिम)',
    certificateNo: '',
    specialization: 'साँध सिमाना तथा जग्गा विवाद',
  });

  // Fetch Cases
  const { data: cases = [], isLoading } = useQuery<JudicialCase[]>({
    queryKey: ['judicial-cases'],
    queryFn: () => judicialApi.getCases(),
  });

  // Fetch Stats
  const { data: stats } = useQuery({
    queryKey: ['judicial-stats'],
    queryFn: () => judicialApi.getStats(),
  });

  // Fetch Mediators
  const { data: mediators = [] } = useQuery<Mediator[]>({
    queryKey: ['judicial-mediators'],
    queryFn: () => judicialApi.getMediators(),
  });

  // Fetch Cause List
  const { data: causeList = [] } = useQuery<CauseListItem[]>({
    queryKey: ['judicial-cause-list'],
    queryFn: () => judicialApi.getCauseList(),
  });

  // Mutations
  const createCaseMutation = useMutation({
    mutationFn: (data: Partial<JudicialCase>) => judicialApi.createCase(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['judicial-cases'] });
      queryClient.invalidateQueries({ queryKey: ['judicial-stats'] });
      setShowAddModal(false);
      setCaseForm({
        title: '',
        disputeType: 'साँध सिमाना / जग्गा विवाद (Boundary Dispute)',
        wardNumber: 3,
        registrationDateBs: '२०८१-०६-०१',
        nextHearingDateBs: '२०८१-०६-१५',
        complainantName: '',
        complainantPhone: '',
        complainantAddress: '',
        complainantCitizenship: '',
        respondentName: '',
        respondentPhone: '',
        respondentAddress: '',
        respondentCitizenship: '',
        disputedKittaNo: '',
        claimDetails: '',
        assignedMediatorId: '',
      });
    },
  });

  const addHearingMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<HearingRecord> }) => judicialApi.addHearing(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['judicial-cases'] });
      queryClient.invalidateQueries({ queryKey: ['judicial-stats'] });
      setBenchModalData(null);
    },
  });

  const settlementMutation = useMutation({
    mutationFn: ({ id, settlement }: { id: string; settlement: FinalSettlement }) => judicialApi.finalizeSettlement(id, settlement),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['judicial-cases'] });
      queryClient.invalidateQueries({ queryKey: ['judicial-stats'] });
      setSettlementModalData(null);
    },
  });

  const createMediatorMutation = useMutation({
    mutationFn: (data: Partial<Mediator>) => judicialApi.createMediator(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['judicial-mediators'] });
      queryClient.invalidateQueries({ queryKey: ['judicial-stats'] });
      setShowAddMediatorModal(false);
      setMediatorForm({
        fullName: '',
        wardNo: 3,
        phone: '',
        email: '',
        trainingInstitute: 'मेलमिलाप परिषद् नेपाल (४८ घण्टे तालिम)',
        certificateNo: '',
        specialization: 'साँध सिमाना तथा जग्गा विवाद',
      });
    },
  });

  const handleCaseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseForm.title || !caseForm.complainantName || !caseForm.respondentName) return;

    const selectedMed = mediators.find(m => m.id === caseForm.assignedMediatorId);

    createCaseMutation.mutate({
      ...caseForm,
      assignedMediatorName: selectedMed ? selectedMed.fullName : undefined,
    });
  };

  const handleHearingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!benchModalData) return;
    addHearingMutation.mutate({
      id: benchModalData.id,
      data: hearingForm
    });
  };

  const handleSettlementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settlementModalData) return;

    const settlement: FinalSettlement = {
      settlementNo: `मिलापत्र-०${settlementModalData.wardNumber}/२०८१-०${Math.floor(Math.random()*80+10)}`,
      verdictType: settlementForm.verdictType,
      settledDateBs: settlementForm.settledDateBs,
      settlementTerms: settlementForm.settlementTerms,
      presidedBy: settlementForm.presidedBy,
      members: settlementForm.members.split(',').map(m => m.trim()),
      complainantAccepted: settlementForm.complainantAccepted,
      respondentAccepted: settlementForm.respondentAccepted,
      remarks: settlementForm.remarks,
    };

    settlementMutation.mutate({
      id: settlementModalData.id,
      settlement
    });
  };

  const handleMediatorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediatorForm.fullName || !mediatorForm.phone) return;
    createMediatorMutation.mutate(mediatorForm);
  };

  // Filtered List
  const filteredCases = cases.filter((c) => {
    const matchSearch =
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.caseNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.complainantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.respondentName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = selectedType === 'all' || c.disputeType === selectedType;
    const matchStatus = selectedStatus === 'all' || c.status === selectedStatus;
    const matchWard = selectedWard === 'all' || c.wardNumber === Number(selectedWard);

    let matchTab = true;
    if (activeTab === 'registry') {
      matchTab = true;
    } else if (activeTab === 'verdicts') {
      matchTab = c.status.includes('फैसला') || !!c.finalSettlement;
    }

    return matchSearch && matchType && matchStatus && matchWard && matchTab;
  });

  const decidedCount = cases.filter(c => c.status.includes('फैसला') || !!c.finalSettlement).length;
  const inHearingCount = cases.filter(c => c.status.includes('इजलास') || c.status.includes('सुनुवाइ')).length;

  return (
    <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', system-ui, sans-serif" }}>
      
      {/* ── HERO BANNER ────────────────────────────────────────── */}
      <div style={{
        position: 'relative',
        background: 'linear-gradient(135deg, #1e1b4b 0%, #3b0764 50%, #581c87 100%)',
        color: '#fff',
        borderRadius: '20px',
        padding: '2rem 2.25rem',
        overflow: 'hidden',
        boxShadow: '0 12px 36px -4px rgba(59, 7, 100, 0.35)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.5rem'
      }}>
        <div style={{ position: 'absolute', right: '-40px', top: '-40px', width: '220px', height: '220px', background: 'radial-gradient(circle, rgba(216, 180, 254, 0.15) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '720px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(8px)', padding: '0.3rem 0.85rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700, color: '#f5d0fe', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '0.75rem', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
            <Scale size={14} color="#f5d0fe" />
            नेपालको संविधान धारा २१७ • स्थानीय न्यायिक इजलास (e-Ijlas)
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, margin: '0 0 0.5rem', letterSpacing: '-0.02em', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
            न्यायिक समिति इजलास तथा मेलमिलाप व्यवस्थापन प्रणाली
          </h1>
          <p style={{ margin: 0, opacity: 0.9, fontSize: '0.95rem', lineHeight: 1.6, color: '#e9d5ff' }}>
            पाँचपोखरी थाङपाल गाउँपालिकाको इजलास पेशी, सूचीकृत मेलमिलापकर्ता, डिजिटल तारेख तथा स्थानीय सरकार सञ्चालन ऐन २०७४ अनुसार मिलापत्र अभिलेख
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
          <button
            onClick={() => setShowCauseListPrint(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.25rem',
              background: 'rgba(255,255,255,0.12)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.25)',
              borderRadius: '10px',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.875rem',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
          >
            <Printer size={16} /> दैनिक पेशी सूची (Cause List)
          </button>

          <button
            onClick={() => exportJudicialCasesData(filteredCases, 'xlsx')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.7rem 1.15rem',
              background: '#10b981',
              border: '1px solid #059669',
              borderRadius: '10px',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.85rem',
              boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
              transition: 'all 0.2s ease',
            }}
            title="वर्तमान खोज तथा फिल्टर अनुसार न्यायिक मुद्दा लगत एक्सेल (.xlsx) मा डाउनलोड गर्नुहोस्"
          >
            <FileSpreadsheet size={16} /> मुद्दा लगत Excel (.xlsx)
          </button>

          <button
            onClick={() => exportJudicialCasesData(filteredCases, 'csv')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.7rem 0.95rem',
              background: 'rgba(255,255,255,0.14)',
              border: '1px solid rgba(255,255,255,0.25)',
              borderRadius: '10px',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem',
              transition: 'all 0.2s ease',
            }}
            title="CSV ढाँचामा डाउनलोड गर्नुहोस्"
          >
            <Download size={15} /> CSV
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.4rem',
              background: 'linear-gradient(135deg, #c026d3 0%, #a21caf 100%)',
              border: 'none',
              borderRadius: '10px',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.875rem',
              boxShadow: '0 4px 16px rgba(192, 38, 211, 0.4)',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'none'}
          >
            <Plus size={18} /> नयाँ उजुरी दर्ता गर्नुहोस्
          </button>
        </div>
      </div>

      {/* ── KPI METRICS CARDS ────────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '1.15rem'
      }}>
        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '1.35rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#7e22ce' }} />
          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b' }}>कुल उजुरी दर्ता</div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#0f172a', margin: '0.35rem 0' }}>{stats?.totalCases || cases.length}</div>
          <div style={{ fontSize: '0.75rem', color: '#7e22ce', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
            <FileText size={13} /> न्यायिक लगत अभिलेख
          </div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '1.35rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#d97706' }} />
          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b' }}>इजलास तथा पेशीमा</div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#0f172a', margin: '0.35rem 0' }}>{stats?.inHearing || inHearingCount}</div>
          <div style={{ fontSize: '0.75rem', color: '#d97706', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
            <Clock size={13} /> सक्रिय सुनुवाइ प्रक्रियामा
          </div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '1.35rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#10b981' }} />
          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b' }}>फैसला तथा मिलापत्र सम्पन्न</div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#0f172a', margin: '0.35rem 0' }}>{stats?.decidedCases || decidedCount}</div>
          <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
            <CheckCircle size={13} /> पूर्ण निरुपण / मिलापत्र
          </div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '1.35rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#0284c7' }} />
          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b' }}>सूचीकृत मेलमिलापकर्ता</div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#0f172a', margin: '0.35rem 0' }}>{stats?.totalMediators || mediators.length} जना</div>
          <div style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
            <UserCheck size={13} /> वडा स्तरमा खटिएका
          </div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '1.35rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#c026d3' }} />
          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b' }}>विवाद समाधान सफलता दर</div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#701a75', margin: '0.35rem 0' }}>{stats?.resolutionRate || 67}%</div>
          <div style={{ fontSize: '0.75rem', color: '#a21caf', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
            <Award size={13} /> मेलमिलाप तथा इजलास
          </div>
        </div>
      </div>

      {/* ── TAB SYSTEM ───────────────────────────────────────────── */}
      <div style={{ 
        display: 'flex', 
        gap: '0.6rem', 
        background: '#ffffff',
        padding: '0.55rem',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
        flexWrap: 'wrap'
      }}>
        {[
          { id: 'registry', label: 'उजुरी दर्ता तथा लगत', count: cases.length, icon: <FileText size={17} /> },
          { id: 'bench', label: 'दैनिक इजलास पेशी सूची (Cause List)', count: causeList.length, icon: <Gavel size={17} /> },
          { id: 'mediators', label: 'सूचीकृत मेलमिलापकर्ता रोष्टर', count: mediators.length, icon: <UserCheck size={17} /> },
          { id: 'verdicts', label: 'मिलापत्र तथा फैसला अभिलेख', count: decidedCount, icon: <Award size={17} /> },
        ].map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                flex: '1 1 auto',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.85rem 1.35rem',
                background: isActive ? 'linear-gradient(135deg, #581c87 0%, #4a044e 100%)' : 'transparent',
                border: 'none',
                color: isActive ? '#ffffff' : '#64748b',
                fontWeight: isActive ? 700 : 600,
                cursor: 'pointer',
                borderRadius: '12px',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: isActive ? '0 4px 14px rgba(74, 4, 78, 0.25)' : 'none',
              }}
            >
              {tab.icon}
              <span style={{ fontSize: '0.92rem' }}>{tab.label}</span>
              <span style={{ 
                background: isActive ? 'rgba(255,255,255,0.22)' : '#f1f5f9',
                color: isActive ? '#ffffff' : '#475569',
                padding: '0.15rem 0.55rem',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: 700,
                marginLeft: '4px'
              }}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── TAB 1 & TAB 4: CASES & VERDICTS TABLE ────────────────── */}
      {(activeTab === 'registry' || activeTab === 'verdicts') && (
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
          {/* Enhanced Filter Bar */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem', marginBottom: '1.35rem', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
              <Search size={17} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="मुद्दा नं, वादी, प्रतिवादी वा कित्ता नम्बर खोज्नुहोस्..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '0.65rem 0.85rem 0.65rem 2.4rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
              />
            </div>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              style={{ padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.85rem', background: '#fff', color: '#334155', fontWeight: 500 }}
            >
              <option value="all">विवादको सबै प्रकृति (All Dispute Types)</option>
              {DISPUTE_TYPES.map((t, idx) => (
                <option key={idx} value={t}>{t}</option>
              ))}
            </select>

            <select
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              style={{ padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.85rem', background: '#fff', color: '#334155', fontWeight: 500 }}
            >
              <option value="all">सबै वडाहरू (All Wards)</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(w => (
                <option key={w} value={w}>वडा नं. {w}</option>
              ))}
            </select>
          </div>

          {/* Cases Table */}
          <div style={{ overflowX: 'auto', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead style={{ background: '#faf5ff', borderBottom: '2px solid #f3e8ff', color: '#581c87' }}>
                <tr>
                  <th style={{ padding: '0.85rem 1rem' }}>मुद्दा नं / दर्ता मिति</th>
                  <th style={{ padding: '0.85rem 1rem' }}>विवादको विषय / कित्ता</th>
                  <th style={{ padding: '0.85rem 1rem' }}>वादी (उजुरीकर्ता)</th>
                  <th style={{ padding: '0.85rem 1rem' }}>प्रतिवादी (विपक्षी)</th>
                  <th style={{ padding: '0.85rem 1rem' }}>मेलमिलापकर्ता / पेशी</th>
                  <th style={{ padding: '0.85rem 1rem' }}>अवस्था</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>कार्य (Actions)</th>
                </tr>
              </thead>
              <tbody>
                {filteredCases.map(c => (
                  <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s ease' }} onMouseOver={(e) => e.currentTarget.style.background = '#faf5ff'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ fontWeight: 800, color: '#581c87', fontSize: '0.9rem' }}>{c.caseNo}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
                        <Calendar size={12} /> दर्ता: {c.registrationDateBs}
                      </div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a', maxWidth: '250px' }}>{c.title}</div>
                      <div style={{ fontSize: '0.75rem', color: '#0369a1', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 600 }}>वडा {c.wardNumber}</span>
                        {c.disputedKittaNo && <span style={{ background: '#fdf4ff', color: '#701a75', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 600 }}>{c.disputedKittaNo}</span>}
                      </div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ fontWeight: 700, color: '#166534' }}>{c.complainantName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{c.complainantPhone || '-'}</div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ fontWeight: 700, color: '#991b1b' }}>{c.respondentName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{c.respondentPhone || '-'}</div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      {c.assignedMediatorName ? (
                        <div style={{ fontSize: '0.82rem', color: '#1e3a8a', fontWeight: 700 }}>
                          {c.assignedMediatorName}
                        </div>
                      ) : (
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>मेलमिलापकर्ता तोकिएको छैन</div>
                      )}
                      {c.nextHearingDateBs && (
                        <div style={{ fontSize: '0.75rem', color: '#b45309', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px', fontWeight: 600 }}>
                          <Clock size={11} /> पेशी: {c.nextHearingDateBs}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span style={{ 
                        background: c.status.includes('फैसला') ? '#dcfce7' : c.status.includes('इजलास') ? '#fef3c7' : '#f0fdf4',
                        color: c.status.includes('फैसला') ? '#166534' : c.status.includes('इजलास') ? '#92400e' : '#059669',
                        padding: '0.25rem 0.65rem',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        display: 'inline-block',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                      }}>
                        {c.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                        <button
                          onClick={() => setViewModalData(c)}
                          title="मुद्दाको पूर्ण मिसिल फाइल हेर्नुहोस्"
                          style={{ padding: '0.45rem 0.65rem', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', color: '#334155', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 600, fontSize: '0.75rem' }}
                        >
                          <Eye size={14} /> मिसिल
                        </button>
                        
                        {!c.finalSettlement && (
                          <>
                            <button
                              onClick={() => setBenchModalData(c)}
                              title="इजलास सुनुवाइ आदेश प्रविष्टि"
                              style={{ padding: '0.45rem 0.65rem', background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '8px', cursor: 'pointer', color: '#92400e', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 600, fontSize: '0.75rem' }}
                            >
                              <Gavel size={14} /> आदेश
                            </button>
                            <button
                              onClick={() => setSettlementModalData(c)}
                              title="मिलापत्र तथा फैसला प्रमाणीकरण"
                              style={{ padding: '0.45rem 0.65rem', background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: '8px', cursor: 'pointer', color: '#166534', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 600, fontSize: '0.75rem' }}
                            >
                              <Award size={14} /> फैसला
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredCases.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '3.5rem', color: '#64748b' }}>
                      कुनै विवाद उजुरी फेला परेन।
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 2: DAILY CAUSE LIST DISPLAY BOARD ──────────────── */}
      {activeTab === 'bench' && (
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#581c87', fontWeight: 700, fontSize: '1.25rem' }}>
                <Gavel size={22} color="#581c87" />
                दैनिक इजलास पेशी सूची (Court Hearing Cause List)
              </div>
              <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.875rem' }}>
                उपाध्यक्षको संयोजकत्वमा बस्ने इजलासमा तोकिएका मुद्दाहरू र सुनुवाइको अवस्था
              </p>
            </div>
            <button
              onClick={() => setShowCauseListPrint(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.65rem 1.25rem', background: '#581c87', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem', boxShadow: '0 4px 12px rgba(88, 28, 135, 0.25)' }}
            >
              <Printer size={16} /> पेशी सूची आधिकारिक प्रिन्ट
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem' }}>
            {causeList.map(item => {
              const targetCase = cases.find(c => c.id === item.caseId || c.caseNo === item.caseNo);
              return (
                <div key={item.id} style={{ border: '1.5px solid #e9d5ff', borderRadius: '14px', padding: '1.35rem', background: '#fdf4ff', boxShadow: '0 4px 12px rgba(88, 28, 135, 0.04)', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontWeight: 800, color: '#581c87', fontSize: '1rem' }}>{item.caseNo}</span>
                    <span style={{ background: '#581c87', color: '#fff', padding: '0.2rem 0.65rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>
                      {item.benchTime}
                    </span>
                  </div>

                  <h3 style={{ margin: '0 0 0.4rem', fontSize: '1.1rem', color: '#0f172a' }}>{item.parties}</h3>
                  <div style={{ fontSize: '0.85rem', color: '#6b21a8', fontWeight: 600, marginBottom: '0.85rem' }}>
                    विषय: {item.disputeType}
                  </div>

                  <div style={{ background: '#ffffff', padding: '0.85rem', borderRadius: '10px', border: '1px solid #e9d5ff', marginBottom: '1rem', fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>इजलास मिति:</span>
                      <strong style={{ color: '#0f172a' }}>{item.benchDateBs}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>सुनुवाइको चरण:</span>
                      <strong style={{ color: '#0369a1' }}>{item.stage}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>इजलास संयोजक:</span>
                      <strong>{item.benchPresidedBy}</strong>
                    </div>
                  </div>

                  <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    {targetCase && (
                      <button
                        onClick={() => setBenchModalData(targetCase)}
                        style={{ padding: '0.5rem 1rem', background: '#581c87', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                      >
                        <Gavel size={14} /> आदेश प्रविष्टि गर्नुहोस्
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TAB 3: LISTED MEDIATORS ROSTER ───────────────────────── */}
      {activeTab === 'mediators' && (
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#0284c7', fontWeight: 700, fontSize: '1.25rem' }}>
                <UserCheck size={22} color="#0284c7" />
                सूचीकृत मेलमिलापकर्ता रोष्टर (Mediator Roster)
              </div>
              <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.875rem' }}>
                स्थानीय सरकार सञ्चालन ऐन २०७४ को दफा ४९ बमोजिम तालिमप्राप्त सूचीकृत मेलमिलापकर्ताहरू
              </p>
            </div>
            <button
              onClick={() => setShowAddMediatorModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.65rem 1.25rem', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem', boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)' }}
            >
              <Plus size={16} /> नयाँ मेलमिलापकर्ता सूचीकरण
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.35rem' }}>
            {mediators.map(m => (
              <div key={m.id} style={{ border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.35rem', background: '#ffffff', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 800, color: '#0369a1', background: '#f0f9ff', padding: '0.2rem 0.55rem', borderRadius: '6px' }}>
                    {m.mediatorCode}
                  </span>
                  <span style={{ background: '#dcfce7', color: '#166534', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>
                    ● सक्रिय (Active)
                  </span>
                </div>

                <h4 style={{ margin: '0 0 0.3rem', fontSize: '1.15rem', color: '#0f172a', fontWeight: 800 }}>{m.fullName}</h4>
                <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.75rem' }}>
                  तोकिएको कार्यक्षेत्र: <strong style={{ color: '#0f172a' }}>वडा नं. {m.wardNo}</strong>
                </div>

                <div style={{ background: '#f8fafc', padding: '0.75rem 0.95rem', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.82rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1rem' }}>
                  <div>
                    <span style={{ fontWeight: 600 }}>तालिम संस्था:</span> {m.trainingInstitute}
                  </div>
                  <div>
                    <span style={{ fontWeight: 600 }}>प्रमाणपत्र नं:</span> {m.certificateNo}
                  </div>
                  <div>
                    <span style={{ fontWeight: 600 }}>विज्ञता क्षेत्र:</span> <strong style={{ color: '#0284c7' }}>{m.specialization}</strong>
                  </div>
                </div>

                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '0.85rem', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#059669', fontWeight: 700 }}>
                    <Phone size={14} /> {m.phone}
                  </div>
                  <div style={{ color: '#64748b' }}>
                    सम्पन्न मिलापत्र: <strong style={{ color: '#16a34a', fontSize: '0.95rem' }}>{m.resolvedCasesCount}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── MODALS (Forms & Dossiers) ─────────────────────────────── */}

      {/* Modal 1: New Case Registration */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '640px', maxHeight: '92vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ background: 'linear-gradient(135deg, #701a75 0%, #4a044e 100%)', color: '#fff', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>नयाँ उजुरी / विवाद दर्ता फाराम</h3>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', opacity: 0.9 }}>स्थानीय सरकार सञ्चालन ऐन २०७४ अनुसार न्यायिक समितिमा दर्ता</p>
              </div>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', borderRadius: '50%', padding: '0.4rem', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCaseSubmit} style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>विवादको शीर्षक / विषय संक्षेप *</label>
                <input
                  type="text"
                  required
                  placeholder="उदा: तार्केघ्याङ खेत साँध सिमाना तथा पर्खाल विवाद"
                  value={caseForm.title}
                  onChange={(e) => setCaseForm({ ...caseForm, title: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>विवादको प्रकृति / प्रकार *</label>
                  <select
                    value={caseForm.disputeType}
                    onChange={(e) => setCaseForm({ ...caseForm, disputeType: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', background: '#fff' }}
                  >
                    {DISPUTE_TYPES.map((t, idx) => (
                      <option key={idx} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>सम्बन्धित वडा नं.</label>
                  <select
                    value={caseForm.wardNumber}
                    onChange={(e) => setCaseForm({ ...caseForm, wardNumber: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', background: '#fff' }}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(w => (
                      <option key={w} value={w}>वडा नं. {w}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Complainant */}
              <div style={{ background: '#f0fdf4', padding: '0.85rem', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.85rem', color: '#166534' }}>१. वादी (उजुरीकर्ता) को विवरण</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#166534' }}>वादीको पूरा नाम *</label>
                    <input
                      type="text"
                      required
                      placeholder="उदा: दावा लामा"
                      value={caseForm.complainantName}
                      onChange={(e) => setCaseForm({ ...caseForm, complainantName: e.target.value })}
                      style={{ width: '100%', padding: '0.45rem', borderRadius: '4px', border: '1px solid #86efac', fontSize: '0.82rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#166534' }}>सम्पर्क फोन</label>
                    <input
                      type="tel"
                      placeholder="९८xxxxxxxx"
                      value={caseForm.complainantPhone}
                      onChange={(e) => setCaseForm({ ...caseForm, complainantPhone: e.target.value })}
                      style={{ width: '100%', padding: '0.45rem', borderRadius: '4px', border: '1px solid #86efac', fontSize: '0.82rem' }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#166534' }}>नागरिकता नं. वा ठेगाना</label>
                  <input
                    type="text"
                    placeholder="नागरिकता नं. २७-०१-७०-XXXX, वडा नं ३"
                    value={caseForm.complainantAddress}
                    onChange={(e) => setCaseForm({ ...caseForm, complainantAddress: e.target.value })}
                    style={{ width: '100%', padding: '0.45rem', borderRadius: '4px', border: '1px solid #86efac', fontSize: '0.82rem' }}
                  />
                </div>
              </div>

              {/* Respondent */}
              <div style={{ background: '#fef2f2', padding: '0.85rem', borderRadius: '8px', border: '1px solid #fecaca' }}>
                <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.85rem', color: '#991b1b' }}>२. प्रतिवादी (विपक्षी) को विवरण</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#991b1b' }}>प्रतिवादीको पूरा नाम *</label>
                    <input
                      type="text"
                      required
                      placeholder="उदा: पेम्बा दोर्जे शेर्पा"
                      value={caseForm.respondentName}
                      onChange={(e) => setCaseForm({ ...caseForm, respondentName: e.target.value })}
                      style={{ width: '100%', padding: '0.45rem', borderRadius: '4px', border: '1px solid #fca5a5', fontSize: '0.82rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#991b1b' }}>सम्पर्क फोन</label>
                    <input
                      type="tel"
                      placeholder="९८xxxxxxxx"
                      value={caseForm.respondentPhone}
                      onChange={(e) => setCaseForm({ ...caseForm, respondentPhone: e.target.value })}
                      style={{ width: '100%', padding: '0.45rem', borderRadius: '4px', border: '1px solid #fca5a5', fontSize: '0.82rem' }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#991b1b' }}>ठेगाना</label>
                  <input
                    type="text"
                    placeholder="गाउँपालिका-३, तार्केघ्याङ"
                    value={caseForm.respondentAddress}
                    onChange={(e) => setCaseForm({ ...caseForm, respondentAddress: e.target.value })}
                    style={{ width: '100%', padding: '0.45rem', borderRadius: '4px', border: '1px solid #fca5a5', fontSize: '0.82rem' }}
                  />
                </div>
              </div>

              {/* Land / Kitta No & Mediator */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>विवादित कित्ता नं. (जग्गा विवाद भएमा)</label>
                  <input
                    type="text"
                    placeholder="उदा: कित्ता नं. ३४२, ३४३"
                    value={caseForm.disputedKittaNo}
                    onChange={(e) => setCaseForm({ ...caseForm, disputedKittaNo: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>तोकिएको मेलमिलापकर्ता</label>
                  <select
                    value={caseForm.assignedMediatorId}
                    onChange={(e) => setCaseForm({ ...caseForm, assignedMediatorId: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', background: '#fff' }}
                  >
                    <option value="">-- मेलमिलापकर्ता छनोट गर्नुहोस् --</option>
                    {mediators.map(m => (
                      <option key={m.id} value={m.id}>{m.fullName} (वडा {m.wardNo})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>उजुरीको व्यहोरा तथा दाबी *</label>
                <textarea
                  rows={3}
                  placeholder="विवादको मुख्य कारण र मागदाबीको विवरण यहाँ उल्लेख गर्नुहोस्..."
                  value={caseForm.claimDetails}
                  onChange={(e) => setCaseForm({ ...caseForm, claimDetails: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ flex: 1, padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontWeight: 600 }}>रद्द गर्नुहोस्</button>
                <button type="submit" disabled={createCaseMutation.isPending} style={{ flex: 2, padding: '0.65rem', borderRadius: '8px', border: 'none', background: '#701a75', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>उजुरी दर्ता गर्नुहोस्</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Bench Hearing Order */}
      {benchModalData && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '580px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ background: 'linear-gradient(135deg, #b45309 0%, #d97706 100%)', color: '#fff', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>इजलास सुनुवाइ आदेश प्रविष्टि</h3>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', opacity: 0.9 }}>मुद्दा नं: {benchModalData.caseNo}</p>
              </div>
              <button onClick={() => setBenchModalData(null)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', borderRadius: '50%', padding: '0.4rem', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleHearingSubmit} style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: '#fef3c7', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', color: '#92400e' }}>
                <strong>{benchModalData.title}</strong>
                <div>वादी: {benchModalData.complainantName} विरुद्ध प्रतिवादी: {benchModalData.respondentName}</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>सुनुवाइ मिति (वि.सं.)</label>
                  <NepaliDatePicker
                    value={hearingForm.dateBs}
                    onChange={(bs) => setHearingForm({ ...hearingForm, dateBs: bs })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>इजलास संयोजक</label>
                  <input
                    type="text"
                    value={hearingForm.presidedBy}
                    onChange={(e) => setHearingForm({ ...hearingForm, presidedBy: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>उपस्थित पक्ष तथा साक्षीहरू</label>
                <input
                  type="text"
                  placeholder="उदा: वादी दावा लामा, प्रतिवादी पेम्बा शेर्पा, वडा अमिन"
                  value={hearingForm.attendees}
                  onChange={(e) => setHearingForm({ ...hearingForm, attendees: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>सुनुवाइको संक्षेप तथा बकपत्र व्यहोरा *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="इजलासमा दुवै पक्षले राखेका भनाइ वा पेश भएको प्रमाणको विवरण..."
                  value={hearingForm.summary}
                  onChange={(e) => setHearingForm({ ...hearingForm, summary: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>इजलासको आदेश (Order / Directive) *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="उदा: विवादित जग्गाको नापजाँच गर्न वडा अमिन खटाउने आदेश भयो..."
                  value={hearingForm.orderVerdict}
                  onChange={(e) => setHearingForm({ ...hearingForm, orderVerdict: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>अर्को पेशी तारेख मिति (वि.सं.)</label>
                <NepaliDatePicker
                  value={hearingForm.nextHearingDateBs}
                  onChange={(bs) => setHearingForm({ ...hearingForm, nextHearingDateBs: bs })}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setBenchModalData(null)} style={{ flex: 1, padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontWeight: 600 }}>रद्द गर्नुहोस्</button>
                <button type="submit" disabled={addHearingMutation.isPending} style={{ flex: 2, padding: '0.65rem', borderRadius: '8px', border: 'none', background: '#b45309', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>आदेश प्रमाणित गर्नुहोस्</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Final Settlement Deed */}
      {settlementModalData && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '620px', maxHeight: '92vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ background: 'linear-gradient(135deg, #15803d 0%, #16a34a 100%)', color: '#fff', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>औपचारिक मिलापत्र तथा फैसला प्रमाणीकरण</h3>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', opacity: 0.9 }}>स्थानीय सरकार सञ्चालन ऐन, २०७४ को दफा ४७ बमोजिम अन्तिम निरूपण</p>
              </div>
              <button onClick={() => setSettlementModalData(null)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', borderRadius: '50%', padding: '0.4rem', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSettlementSubmit} style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: '#f0fdf4', padding: '0.75rem', borderRadius: '8px', border: '1px solid #bbf7d0', fontSize: '0.85rem' }}>
                <div style={{ fontWeight: 700, color: '#166534' }}>{settlementModalData.title} ({settlementModalData.caseNo})</div>
                <div style={{ color: '#475569', marginTop: '2px' }}>वादी: {settlementModalData.complainantName} | प्रतिवादी: {settlementModalData.respondentName}</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>निर्णयको प्रकार *</label>
                  <select
                    value={settlementForm.verdictType}
                    onChange={(e) => setSettlementForm({ ...settlementForm, verdictType: e.target.value as any })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  >
                    <option value="मिलापत्र (Reconciliation)">🤝 मिलापत्र (Reconciliation)</option>
                    <option value="निर्णय / फैसला (Verdict)">⚖️ इजलासको निर्णय / फैसला</option>
                    <option value="अदालत पठाइएको (Referred to Court)">🏛️ अदालत सिफारिस</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>फैसला मिति (वि.सं.)</label>
                  <NepaliDatePicker
                    value={settlementForm.settledDateBs}
                    onChange={(bs) => setSettlementForm({ ...settlementForm, settledDateBs: bs })}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>मिलापत्र / फैसलाका मुख्य सर्तहरू तथा आदेश *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="१. विपक्षीले यसो गर्ने...&#10;२. वादीले यसरी छाड्ने...&#10;३. भविष्यमा यस विषयमा कुनै विवाद नगर्ने सहमति भयो।"
                  value={settlementForm.settlementTerms}
                  onChange={(e) => setSettlementForm({ ...settlementForm, settlementTerms: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>संयोजकको नाम तथा पद</label>
                  <input
                    type="text"
                    value={settlementForm.presidedBy}
                    onChange={(e) => setSettlementForm({ ...settlementForm, presidedBy: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>रोहबरमा रहने सदस्यहरू</label>
                  <input
                    type="text"
                    value={settlementForm.members}
                    onChange={(e) => setSettlementForm({ ...settlementForm, members: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', background: '#f8fafc', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={settlementForm.complainantAccepted}
                    onChange={(e) => setSettlementForm({ ...settlementForm, complainantAccepted: e.target.checked })}
                  />
                  <span>वादी मञ्जुर रहेको</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={settlementForm.respondentAccepted}
                    onChange={(e) => setSettlementForm({ ...settlementForm, respondentAccepted: e.target.checked })}
                  />
                  <span>प्रतिवादी मञ्जुर रहेको</span>
                </label>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setSettlementModalData(null)} style={{ flex: 1, padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontWeight: 600 }}>रद्द गर्नुहोस्</button>
                <button type="submit" disabled={settlementMutation.isPending} style={{ flex: 2, padding: '0.65rem', borderRadius: '8px', border: 'none', background: '#16a34a', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>मिलापत्र पारित गर्नुहोस्</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4: Case Dossier Viewer & Print */}
      {viewModalData && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '720px', maxHeight: '92vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: '#fff', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>न्यायिक समिति मिसिल तथा फैसला विवरण</h3>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', opacity: 0.85 }}>मुद्दा नं: {viewModalData.caseNo} • दर्ता मिति: {viewModalData.registrationDateBs}</p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => window.print()} style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', borderRadius: '8px', padding: '0.45rem 0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', fontWeight: 600 }}>
                  <Printer size={15} /> मिसिल प्रिन्ट
                </button>
                <button onClick={() => setViewModalData(null)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', borderRadius: '50%', padding: '0.4rem', cursor: 'pointer' }}>
                  <X size={18} />
                </button>
              </div>
            </div>

            <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.2rem', color: '#0f172a' }}>{viewModalData.title}</h2>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.85rem', color: '#64748b' }}>
                  <span>प्रकार: <strong style={{ color: '#0369a1' }}>{viewModalData.disputeType}</strong></span>
                  <span>वडा: <strong>{viewModalData.wardNumber}</strong></span>
                  {viewModalData.disputedKittaNo && <span>कित्ता नं: <strong style={{ color: '#701a75' }}>{viewModalData.disputedKittaNo}</strong></span>}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ background: '#f0fdf4', padding: '1rem', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
                  <h4 style={{ margin: '0 0 0.4rem', color: '#166534', fontSize: '0.9rem' }}>वादी (उजुरीकर्ता)</h4>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{viewModalData.complainantName}</div>
                  <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '2px' }}>फोन: {viewModalData.complainantPhone || '-'}</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>ठेगाना: {viewModalData.complainantAddress || '-'}</div>
                </div>

                <div style={{ background: '#fef2f2', padding: '1rem', borderRadius: '10px', border: '1px solid #fecaca' }}>
                  <h4 style={{ margin: '0 0 0.4rem', color: '#991b1b', fontSize: '0.9rem' }}>प्रतिवादी (विपक्षी)</h4>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{viewModalData.respondentName}</div>
                  <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '2px' }}>फोन: {viewModalData.respondentPhone || '-'}</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>ठेगाना: {viewModalData.respondentAddress || '-'}</div>
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 0.4rem', fontSize: '0.9rem', color: '#1e293b' }}>उजुरी तथा दाबीको व्यहोरा</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#334155', lineHeight: 1.6 }}>{viewModalData.claimDetails}</p>
              </div>

              <div>
                <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.95rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Clock size={16} /> इजलास सुनुवाइ तथा तारेख इतिहास
                </h4>
                {viewModalData.hearings && viewModalData.hearings.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    {viewModalData.hearings.map((h, idx) => (
                      <div key={idx} style={{ borderLeft: '3px solid #701a75', padding: '0.75rem 1rem', background: '#faf5ff', borderRadius: '0 8px 8px 0', fontSize: '0.82rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                          <span style={{ fontWeight: 700, color: '#701a75' }}>सुनुवाइ संख्या #{h.hearingNo} ({h.dateBs})</span>
                          <span style={{ color: '#64748b' }}>इजलास: {h.presidedBy}</span>
                        </div>
                        <div style={{ color: '#334155', marginBottom: '0.25rem' }}><strong>व्यहोरा:</strong> {h.summary}</div>
                        <div style={{ color: '#92400e', fontWeight: 600 }}><strong>आदेश:</strong> {h.orderVerdict}</div>
                        {h.nextHearingDateBs && (
                          <div style={{ color: '#059669', fontSize: '0.75rem', marginTop: '0.2rem' }}>अर्को पेशी तारेख: {h.nextHearingDateBs}</div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ color: '#94a3b8', fontSize: '0.85rem', fontStyle: 'italic' }}>हालसम्म कुनै इजलास आदेश प्रविष्टि भएको छैन।</div>
                )}
              </div>

              {viewModalData.finalSettlement && (
                <div style={{ background: '#f0fdf4', border: '2px solid #86efac', borderRadius: '12px', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#166534', fontWeight: 700, fontSize: '1rem' }}>
                      <CheckCircle size={18} /> {viewModalData.finalSettlement.verdictType}
                    </div>
                    <span style={{ fontSize: '0.8rem', color: '#15803d', fontWeight: 600 }}>
                      प्रमाणित मिति: {viewModalData.finalSettlement.settledDateBs}
                    </span>
                  </div>
                  <div style={{ background: '#fff', padding: '1rem', borderRadius: '8px', border: '1px solid #bbf7d0', whiteSpace: 'pre-line', fontSize: '0.85rem', color: '#1f2937', lineHeight: 1.6, marginBottom: '0.75rem' }}>
                    {viewModalData.finalSettlement.settlementTerms}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#166534', display: 'flex', justifyContent: 'space-between' }}>
                    <span>संयोजक: {viewModalData.finalSettlement.presidedBy}</span>
                    <span>सदस्यहरू: {viewModalData.finalSettlement.members?.join(', ')}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal 5: Add Mediator */}
      {showAddMediatorModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '540px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#fff', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>नयाँ मेलमिलापकर्ता सूचीकरण फाराम</h3>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', opacity: 0.9 }}>स्थानीय सरकार सञ्चालन ऐन २०७४ अनुसार सूचीकृत</p>
              </div>
              <button onClick={() => setShowAddMediatorModal(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', borderRadius: '50%', padding: '0.4rem', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleMediatorSubmit} style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>मेलमिलापकर्ताको पूरा नाम *</label>
                <input
                  type="text"
                  required
                  placeholder="उदा: कुल प्रसाद सापकोटा"
                  value={mediatorForm.fullName}
                  onChange={(e) => setMediatorForm({ ...mediatorForm, fullName: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>तोकिएको वडा</label>
                  <select
                    value={mediatorForm.wardNo}
                    onChange={(e) => setMediatorForm({ ...mediatorForm, wardNo: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(w => (
                      <option key={w} value={w}>वडा नं. {w}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>सम्पर्क फोन *</label>
                  <input
                    type="tel"
                    required
                    placeholder="९८xxxxxxxx"
                    value={mediatorForm.phone}
                    onChange={(e) => setMediatorForm({ ...mediatorForm, phone: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>तालिम प्रदायक संस्था</label>
                <input
                  type="text"
                  placeholder="उदा: मेलमिलाप परिषद् नेपाल (४८ घण्टे तालिम)"
                  value={mediatorForm.trainingInstitute}
                  onChange={(e) => setMediatorForm({ ...mediatorForm, trainingInstitute: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>प्रमाणपत्र नं.</label>
                  <input
                    type="text"
                    placeholder="MC-NP-२०८१-XXXX"
                    value={mediatorForm.certificateNo}
                    onChange={(e) => setMediatorForm({ ...mediatorForm, certificateNo: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>विज्ञता क्षेत्र</label>
                  <input
                    type="text"
                    placeholder="उदा: साँध सिमाना, घरायसी"
                    value={mediatorForm.specialization}
                    onChange={(e) => setMediatorForm({ ...mediatorForm, specialization: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowAddMediatorModal(false)} style={{ flex: 1, padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontWeight: 600 }}>रद्द गर्नुहोस्</button>
                <button type="submit" disabled={createMediatorMutation.isPending} style={{ flex: 2, padding: '0.65rem', borderRadius: '8px', border: 'none', background: '#0284c7', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>रोष्टरमा थप्नुहोस्</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 6: Print Official Cause List */}
      {showCauseListPrint && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '780px', maxHeight: '92vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ background: '#1e293b', color: '#fff', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 700 }}>दैनिक इजलास पेशी सूची (Daily Cause List Print)</div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => window.print()} style={{ background: '#059669', border: 'none', color: '#fff', borderRadius: '6px', padding: '0.4rem 0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.82rem', fontWeight: 600 }}>
                  <Printer size={15} /> प्रिन्ट गर्नुहोस्
                </button>
                <button onClick={() => setShowCauseListPrint(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', borderRadius: '50%', padding: '0.35rem', cursor: 'pointer' }}>
                  <X size={18} />
                </button>
              </div>
            </div>

            <div style={{ padding: '2rem', overflowY: 'auto' }}>
              <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.9rem', color: '#475569' }}>नेपाल सरकार / बागमती प्रदेश</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#701a75' }}>पाँचपोखरी थाङपाल गाउँपालिका</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>न्यायिक समितिको कार्यालय</div>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>थाङपालधाप, सिन्धुपाल्चोक</div>
                <div style={{ display: 'inline-block', marginTop: '0.5rem', padding: '0.2rem 1rem', background: '#fdf4ff', border: '1px solid #f5d0fe', borderRadius: '20px', fontWeight: 700, color: '#701a75', fontSize: '0.95rem' }}>
                  दैनिक इजलास पेशी सूची (Cause List)
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '1rem', color: '#334155' }}>
                <div><strong>इजलास मिति:</strong> २०८१-०६-०५ (दिउँसो ०१:०० बजेदेखि)</div>
                <div><strong>इजलास संयोजक:</strong> सुनिता अधिकारी (उपाध्यक्ष)</div>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                    <th style={{ padding: '0.6rem 0.75rem', border: '1px solid #cbd5e1' }}>क्र.सं.</th>
                    <th style={{ padding: '0.6rem 0.75rem', border: '1px solid #cbd5e1' }}>मुद्दा नं.</th>
                    <th style={{ padding: '0.6rem 0.75rem', border: '1px solid #cbd5e1' }}>वादी विरुद्ध प्रतिवादी</th>
                    <th style={{ padding: '0.6rem 0.75rem', border: '1px solid #cbd5e1' }}>विवादको विषय</th>
                    <th style={{ padding: '0.6rem 0.75rem', border: '1px solid #cbd5e1' }}>पेशीको अवस्था</th>
                    <th style={{ padding: '0.6rem 0.75rem', border: '1px solid #cbd5e1' }}>इजलासको आदेश / कैफियत</th>
                  </tr>
                </thead>
                <tbody>
                  {causeList.map((item, idx) => (
                    <tr key={idx}>
                      <td style={{ padding: '0.6rem 0.75rem', border: '1px solid #cbd5e1', textAlign: 'center' }}>{idx + 1}</td>
                      <td style={{ padding: '0.6rem 0.75rem', border: '1px solid #cbd5e1', fontWeight: 600 }}>{item.caseNo}</td>
                      <td style={{ padding: '0.6rem 0.75rem', border: '1px solid #cbd5e1' }}>{item.parties}</td>
                      <td style={{ padding: '0.6rem 0.75rem', border: '1px solid #cbd5e1' }}>{item.disputeType}</td>
                      <td style={{ padding: '0.6rem 0.75rem', border: '1px solid #cbd5e1' }}>{item.stage}</td>
                      <td style={{ padding: '0.6rem 0.75rem', border: '1px solid #cbd5e1', color: '#64748b' }}>सुनुवाइ प्रक्रियामा</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'space-between', padding: '0 2rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ borderTop: '1px dotted #334155', width: '150px', marginBottom: '4px' }}></div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>फाँटवाला / कर्मचारी</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ borderTop: '1px dotted #334155', width: '180px', marginBottom: '4px' }}></div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>सुनिता अधिकारी</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>उपाध्यक्ष तथा संयोजक, न्यायिक समिति</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default JudicialCommitteePage;
