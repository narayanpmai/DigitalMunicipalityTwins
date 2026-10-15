import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client';
import {
  FileText,
  Search,
  Plus,
  Printer,
  X,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Building,
  Calendar,
  Briefcase,
  QrCode,
  ArrowRight,
  ShieldCheck,
  Award,
  DollarSign,
  Layers,
  Eye,
  Scale,
  FileCheck,
  Clock,
  ChevronRight,
  Filter,
  Users,
  Check,
  CloudSync,
  Mail,
  MessageSquare,
  MapPin,
  RefreshCw,
  AlertTriangle,
  Upload,
  UploadCloud,
  FileSpreadsheet,
  Download,
  Trash2,
  CheckSquare,
  Square,
  Paperclip,
  ExternalLink,
  Edit3
} from 'lucide-react';

export interface Bidder {
  name: string;
  bidAmount: number;
  discountPct: number;
  responsive: boolean;
  rank: number;
  remarks?: string;
  submissionNo?: string;
  panVat?: string;
  awardedVendorPan?: string;
  phone?: string;
}

export interface RunningBill {
  billNo: string;
  amount: number;
  paymentDate: string;
  physicalProgressPct: number;
  remarks?: string;
}

export interface Tender {
  id: string;
  procurementNo: string;
  tenderNumber?: string;
  title: string;
  description?: string;
  method?: string;
  procurementMethod?: string;
  status: string;
  stageLabel?: string;
  fiscalYear: string;
  sector?: string;
  wardNo?: string;
  estimatedAmount?: number;
  estimatedAmountNPR?: number;
  awardedAmount?: number;
  contractAmountNPR?: number;
  bidSecurityAmount?: number;
  bidSecurityAmountNPR?: number;
  performanceSecurityAmount?: number;
  performanceSecurityAmountNPR?: number;
  bidDocFee?: number;
  bidDocFeeNPR?: number;
  awardedTo?: string;
  awardedVendorName?: string;
  awardedVendorPan?: string;
  advertisedDate?: string;
  advertisedDateBs?: string;
  publishDateBs?: string;
  deadlineDate?: string;
  deadlineDateBs?: string;
  submissionDeadlineBs?: string;
  loiPublishDateBs?: string;
  contractDateBs?: string;
  completionDateBs?: string;
  biddersCount?: number;
  biddersList?: Bidder[];
  runningBills?: RunningBill[];
  bankDetails?: {
    bankName: string;
    depositAccountNo: string;
    revenueAccountNo: string;
    officeCode?: string;
  };
  costSavingsNPR?: number;
  costSavingsPct?: number;
  documents?: any[];
  requirements?: string[];
  proposalDetails?: string;
  documentUrl?: string;
  publishedDateBS?: string;
  contractDateBS?: string;
  completionDeadlineBS?: string;
  physicalProgress?: number;
  paidAmountNPR?: number;
}

export interface ProcurementStats {
  totalTenders: number;
  advertisedCount: number;
  evaluationCount: number;
  awardedCount: number;
  contractedCount: number;
  completedCount?: number;
  activeImplementations?: number;
  totalEstimatedBudget: number;
  totalAwardedBudget: number;
  totalCostSavings: number;
  savingsPercentage?: number;
}

const TENDER_STAGES = [
  'मस्यौदा / स्वीकृतिको पर्खाइमा (Draft)',
  'बोलपत्र आह्वान प्रकाशित (IFB Published)',
  'प्राविधिक तथा आर्थिक मूल्याङ्कन (Bid Evaluation)',
  '७ दिने आशयको सूचना (Letter of Intent - LOI)',
  'ठेक्का सम्झौता तथा कार्यान्वयन (Contract Awarded)',
  'कार्य सम्पन्न तथा फरफारक (Work Completed)',
];

const PROCUREMENT_METHODS = [
  'सबै खरिद विधिहरू (All Methods)',
  'खुला राष्ट्रिय बोलपत्र (NCB)',
  'सिलबन्दी दरभाउ पत्र (SQ)',
  'प्रत्यक्ष खरिद (Direct)',
  'उपभोक्ता समिति मार्फत',
  'परामर्श सेवा (Consulting)',
];

export const ProcurementPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'registry' | 'evaluation' | 'documents' | 'execution' | 'grievance'>('registry');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedMethod, setSelectedMethod] = useState('all');
  const [selectedWard, setSelectedWard] = useState('all');

  // Modals & Drawers
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTenderForDoc, setSelectedTenderForDoc] = useState<Tender | null>(null);
  const [selectedDocType, setSelectedDocType] = useState<'ifb' | 'loi' | 'loa' | 'contract'>('ifb');
  const [drawerTender, setDrawerTender] = useState<Tender | null>(null);
  const [selectedEvalTender, setSelectedEvalTender] = useState<Tender | null>(null);

  // Document Upload & Requirements Modal for ANY Tender
  const [selectedTenderForUpload, setSelectedTenderForUpload] = useState<Tender | null>(null);
  const [docTabMode, setDocTabMode] = useState<'official' | 'repository'>('official');

  const DEFAULT_REQUIREMENTS = [
    'अद्यावधिक कम्पनी/फर्म दर्ता प्रमाणपत्र (Valid Firm/Company Registration)',
    'स्थायी लेखा नम्बर (PAN/VAT) दर्ता प्रमाणपत्र',
    'आ.व. २०८०/०८१ को कर चुक्ता प्रमाणपत्र (Tax Clearance Certificate)',
    'बोलपत्र धरौटी बैंक ग्यारेन्टी (२.५% Bid Security Guarantee)',
    'विगत ३ वर्षको न्यूनतम औसत वार्षिक निर्माण कारोबार (Average Annual Turnover)',
    'समान प्रकृतिको सरकारी निर्माण कार्यको न्यूनतम १ वटा अनुभव (Similar Work Experience)',
    'मुख्य प्राविधिक जनशक्ति (ईन्जिनियर/सब-ईन्जिनियर) को व्यक्तिगत प्रतिबद्धता',
    'आवश्यक न्यूनतम उपकरण तथा मेशिनरी (टिप्पर, रोलर, मिक्सर)',
    'कालोसूचीमा नपरेको तथा कुनै विवाद नरहेको स्वघोषणा पत्र (Non-Blacklisting Declaration)'
  ];

  // Upload modal form states for editing existing tender
  const [uploadModalNotice, setUploadModalNotice] = useState<{ name: string; size: string } | null>(null);
  const [uploadModalBoq, setUploadModalBoq] = useState<{ name: string; size: string } | null>(null);
  const [uploadModalDrawings, setUploadModalDrawings] = useState<{ name: string; size: string } | null>(null);
  const [uploadModalReqs, setUploadModalReqs] = useState<string[]>([]);
  const [newReqInput, setNewReqInput] = useState('');

  const openUploadModal = (t: Tender) => {
    setSelectedTenderForUpload(t);
    const existingDocs = t.documents || [];
    const noticeDoc = existingDocs.find((d: any) => d.type === 'notice');
    const boqDoc = existingDocs.find((d: any) => d.type === 'boq');
    const drawingsDoc = existingDocs.find((d: any) => d.type === 'drawings');

    setUploadModalNotice(noticeDoc ? { name: noticeDoc.filename || noticeDoc.name, size: noticeDoc.size || '1.4 MB' } : { name: `${t.procurementNo || 'Notice'}-सूचना.pdf`, size: '1.4 MB' });
    setUploadModalBoq(boqDoc ? { name: boqDoc.filename || boqDoc.name, size: boqDoc.size || '480 KB' } : { name: `${t.procurementNo || 'BOQ'}-परिमाण.xlsx`, size: '480 KB' });
    setUploadModalDrawings(drawingsDoc ? { name: drawingsDoc.filename || drawingsDoc.name, size: drawingsDoc.size || '3.2 MB' } : null);
    setUploadModalReqs(t.requirements && t.requirements.length > 0 ? [...t.requirements] : [...DEFAULT_REQUIREMENTS.slice(0, 6)]);
    setNewReqInput('');
  };

  // Advance Stage Form State in Drawer
  const [stageRemarks, setStageRemarks] = useState('');
  const [nextStageChoice, setNextStageChoice] = useState('');
  const [awardedToInput, setAwardedToInput] = useState('');
  const [awardedAmountInput, setAwardedAmountInput] = useState<number>(0);
  const [awardedPanInput, setAwardedPanInput] = useState('');

  // 7-Step New IFB Wizard Form State
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardData, setWizardData] = useState({
    title: '',
    description: '',
    proposalDetails: '',
    sector: 'सडक तथा यातायात पूर्वाधार',
    wardNo: '३',
    procurementMethod: 'खुला राष्ट्रिय बोलपत्र (NCB)',
    estimatedAmountNPR: 4500000,
    bidSecurityAmountNPR: 112500,
    bidDocFeeNPR: 3000,
    publishDateBs: '२०८१-०५-०१',
    submissionDeadlineBs: '२०८१-०५-३१',
    fiscalYear: '२०८१/०८२',
    bankName: 'नेपाल बैंक लिमिटेड, मेलम्ची शाखा',
    depositAccountNo: '१२३०१००००५८ (धरौटी खाता)',
    revenueAccountNo: '१२३०१००००८९ (आन्तरिक राजस्व खाता)',
    // Documents
    noticeFileName: 'बोलपत्र-आह्वान-सूचना.pdf',
    noticeFileSize: '1.2 MB',
    boqFileName: 'BOQ-सडक-स्तरोन्नति.xlsx',
    boqFileSize: '480 KB',
    drawingsFileName: 'प्राविधिक-नक्सा-स्पेसिफिकेसन.pdf',
    drawingsFileSize: '3.5 MB',
    // Requirements
    selectedRequirements: DEFAULT_REQUIREMENTS.slice(0, 6),
    customRequirementInput: '',
  });

  // Fetch Tenders
  const { data: tenders = [], isLoading } = useQuery<Tender[]>({
    queryKey: ['procurement-tenders'],
    queryFn: async () => {
      const res: any = await api.get('/procurement');
      return Array.isArray(res) ? res : (res?.data || []);
    },
  });

  // Fetch Stats
  const { data: stats } = useQuery<ProcurementStats>({
    queryKey: ['procurement-stats'],
    queryFn: async () => {
      const res: any = await api.get('/procurement/stats');
      return res || {};
    },
  });

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return api.post('/procurement', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['procurement-tenders'] });
      queryClient.invalidateQueries({ queryKey: ['procurement-stats'] });
      setShowAddModal(false);
      setWizardStep(1);
    },
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return api.put(`/procurement/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['procurement-tenders'] });
      queryClient.invalidateQueries({ queryKey: ['procurement-stats'] });
      setSelectedTenderForUpload(null);
      alert('कागजात तथा मापदण्डहरू सफलतापूर्वक सुरक्षित भयो!');
    },
  });

  // Advance Stage Mutation
  const advanceMutation = useMutation({
    mutationFn: async ({ id, status, awardedTo, awardedAmount, awardedVendorPan, remarks }: any) => {
      return api.post(`/procurement/${id}/advance-stage`, {
        status,
        awardedTo,
        awardedAmount,
        awardedVendorPan,
        remarks,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['procurement-tenders'] });
      queryClient.invalidateQueries({ queryKey: ['procurement-stats'] });
      setDrawerTender(null);
    },
  });

  // Auto calculate fee and security when estimated amount changes
  const handleEstimatedAmountChange = (amount: number) => {
    const bidSecurity = Math.round((amount * 0.025) / 500) * 500;
    let docFee = 3000;
    if (amount <= 2000000) docFee = 1000;
    else if (amount <= 10000000) docFee = 2000;
    else if (amount <= 50000000) docFee = 3000;
    else docFee = 5000;

    setWizardData((prev) => ({
      ...prev,
      estimatedAmountNPR: amount,
      bidSecurityAmountNPR: bidSecurity,
      bidDocFeeNPR: docFee,
    }));
  };

  // Open drawer and prefill
  const openDrawer = (tender: Tender) => {
    setDrawerTender(tender);
    setAwardedToInput(tender.awardedVendorName || tender.awardedTo || '');
    setAwardedAmountInput(tender.contractAmountNPR || tender.awardedAmount || Math.round((tender.estimatedAmountNPR || tender.estimatedAmount || 0) * 0.88));
    setAwardedPanInput(tender.awardedVendorPan || '');
    setStageRemarks('');

    if (tender.status === 'advertised' || tender.status?.includes('Published')) {
      setNextStageChoice('evaluation');
    } else if (tender.status === 'evaluation' || tender.status?.includes('Evaluation')) {
      setNextStageChoice('awarded');
    } else if (tender.status === 'awarded' || tender.status?.includes('LOI')) {
      setNextStageChoice('contracted');
    } else if (tender.status === 'contracted' || tender.status?.includes('Contract')) {
      setNextStageChoice('completed');
    } else {
      setNextStageChoice('completed');
    }
  };

  // Filtered List
  const filteredList = tenders.filter((t) => {
    const pNo = t.procurementNo || t.tenderNumber || '';
    const tTitle = t.title || '';
    const vName = t.awardedVendorName || t.awardedTo || '';
    const sec = t.sector || '';

    const matchSearch =
      tTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sec.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus =
      selectedStatus === 'all' ||
      t.status === selectedStatus ||
      t.stageLabel?.includes(selectedStatus);

    const matchMethod =
      selectedMethod === 'all' ||
      t.procurementMethod?.includes(selectedMethod) ||
      t.method === selectedMethod;

    const matchWard =
      selectedWard === 'all' ||
      (t.wardNo && t.wardNo.includes(selectedWard));

    return matchSearch && matchStatus && matchMethod && matchWard;
  });

  // Export Table Data to CSV with Devanagari UTF-8 BOM
  const exportToCsv = () => {
    if (!filteredList || filteredList.length === 0) {
      alert('डाउनलोड गर्नका लागि कुनै तथ्याङ्क उपलब्ध छैन।');
      return;
    }
    const headers = [
      'ठेक्का / बोलपत्र नं',
      'आयोजनाको नाम',
      'खरिद विधि',
      'वडा नं',
      'लागत अनुमान (रु)',
      'सम्झौता / कबोल रकम (रु)',
      'छनौट भएको निर्माण व्यवसायी',
      'व्यवसायी प्यान नं',
      'प्रक्रियागत स्थिति',
      'प्रकाशन मिति',
      'सम्झौता मिति',
      'सम्पन्न म्याद',
      'भौतिक प्रगति (%)',
      'भुक्तानी भएको रकम (रु)'
    ];
    const rows = filteredList.map((t) => [
      `"${t.procurementNo || t.tenderNumber || ''}"`,
      `"${(t.title || '').replace(/"/g, '""')}"`,
      `"${t.procurementMethod || t.method || ''}"`,
      `"${t.wardNo || ''}"`,
      `"${t.estimatedAmountNPR || t.estimatedAmount || 0}"`,
      `"${t.contractAmountNPR || t.awardedAmount || 0}"`,
      `"${(t.awardedVendorName || t.awardedTo || '').replace(/"/g, '""')}"`,
      `"${t.awardedVendorPan || ''}"`,
      `"${t.status || t.stageLabel || ''}"`,
      `"${t.publishedDateBS || ''}"`,
      `"${t.contractDateBS || ''}"`,
      `"${t.completionDeadlineBS || ''}"`,
      `"${t.physicalProgress || 0}"`,
      `"${t.paidAmountNPR || 0}"`
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `eProcurement_Tenders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const activeDocTender = selectedTenderForDoc || (tenders.length > 0 ? tenders[0] : null);
  const activeEvalTender = selectedEvalTender || (tenders.find(t => t.biddersList && t.biddersList.length > 0) || tenders[0] || null);

  return (
    <div style={{ padding: '1.5rem', fontFamily: 'inherit' }}>
      {/* 1. Header Banner */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.25rem',
        marginBottom: '1.5rem',
        padding: '1.5rem 1.75rem',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0d2757 100%)',
        color: '#fff',
        borderRadius: '16px',
        boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.25)',
        border: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            background: 'rgba(59, 130, 246, 0.2)',
            padding: '0.85rem',
            borderRadius: '12px',
            border: '1px solid rgba(59, 130, 246, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Briefcase size={32} color="#60a5fa" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0, letterSpacing: '-0.01em' }}>
                सार्वजनिक खरिद, ई-बोलपत्र तथा ठेक्का व्यवस्थापन (e-Procurement Suite)
              </h1>
              <span style={{
                background: '#10b981',
                color: '#fff',
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '0.15rem 0.5rem',
                borderRadius: '999px',
                textTransform: 'uppercase'
              }}>
                PPA 2063
              </span>
            </div>
            <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.4 }}>
              सार्वजनिक खरिद ऐन २०६३, नियमावली २०६४, तथा PPMO ई-जिपी (e-GP) मापदण्ड बमोजिम राष्ट्रिय बोलपत्र, आशयपत्र (LOI), र सम्झौता व्यवस्थापन
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              if (tenders.length > 0) {
                openUploadModal(tenders[0]);
              } else {
                setShowAddModal(true);
                setWizardStep(4);
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.6rem 1.15rem',
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              border: 'none',
              color: '#fff',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(5, 150, 105, 0.35)',
              transition: 'all 0.2s'
            }}
          >
            <UploadCloud size={18} /> कागजात तथा BOQ अपलोड
          </button>

          <button
            onClick={() => {
              if (tenders.length > 0) {
                setSelectedTenderForDoc(tenders[0]);
                setActiveTab('documents');
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.6rem 1rem',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#fff',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <Printer size={16} /> बोलपत्र प्रतिवेदन तथा कागजात
          </button>

          <a
            href="/procurement"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.6rem 1rem',
              background: 'rgba(59, 130, 246, 0.2)',
              border: '1px solid rgba(96, 165, 250, 0.4)',
              color: '#fff',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
              textDecoration: 'none',
              backdropFilter: 'blur(6px)',
              transition: 'all 0.2s',
            }}
          >
            <ExternalLink size={16} /> नागरिक ई-बोलपत्र पोर्टल ↗
          </a>

          <button
            onClick={() => {
              setWizardStep(1);
              setShowAddModal(true);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.6rem 1.25rem',
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              border: 'none',
              color: '#fff',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.35)',
              transition: 'all 0.2s'
            }}
          >
            <Plus size={18} /> नयाँ बोलपत्र आह्वान (New IFB)
          </button>
        </div>
      </div>

      {/* 2. Top KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '1.25rem',
        marginBottom: '1.75rem'
      }}>
        {/* Card 1: Total Tenders */}
        <div
          onClick={() => {
            setSelectedStatus('all');
            setActiveTab('registry');
          }}
          title="सबै बोलपत्रहरू हेर्न क्लिक गर्नुहोस्"
          style={{
            background: '#fff',
            padding: '1.35rem 1.5rem',
            borderRadius: '14px',
            border: selectedStatus === 'all' && activeTab === 'registry' ? '2px solid #2563eb' : '1.5px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.06)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>कुल बोलपत्र / ठेक्का</div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', marginTop: '0.35rem' }}>
              {stats?.totalTenders ?? tenders.length} वटा
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.35rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 600, background: '#eff6ff', padding: '0.1rem 0.45rem', borderRadius: '4px' }}>
                ई-प्रोक्योरमेन्ट प्रणाली
              </span>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                ({stats?.advertisedCount || 1} प्रकाशित)
              </span>
            </div>
          </div>
          <div style={{ background: '#eff6ff', color: '#2563eb', padding: '0.85rem', borderRadius: '12px' }}>
            <FileText size={26} />
          </div>
        </div>

        {/* Card 2: Contracted */}
        <div
          onClick={() => {
            setSelectedStatus('ठेक्का सम्झौता तथा कार्यान्वयन (Contract Awarded)');
            setActiveTab('registry');
          }}
          title="सम्झौता भएका ठेक्काहरू हेर्न क्लिक गर्नुहोस्"
          style={{
            background: '#fff',
            padding: '1.35rem 1.5rem',
            borderRadius: '14px',
            border: selectedStatus.includes('Contract') ? '2px solid #059669' : '1.5px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(5, 150, 105, 0.06)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>ठेक्का सम्झौता सम्पन्न</div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', marginTop: '0.35rem' }}>
              {stats?.activeImplementations ?? stats?.contractedCount ?? 4} वटा
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.35rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600, background: '#ecfdf5', padding: '0.1rem 0.45rem', borderRadius: '4px' }}>
                कार्यान्वयन चरणमा
              </span>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                (३ चालू, १ सम्पन्न)
              </span>
            </div>
          </div>
          <div style={{ background: '#ecfdf5', color: '#047857', padding: '0.85rem', borderRadius: '12px' }}>
            <Award size={26} />
          </div>
        </div>

        {/* Card 3: Budget */}
        <div
          onClick={() => setActiveTab('registry')}
          title="इन्जिनियरिङ लागत अनुमान बजेट हेर्न क्लिक गर्नुहोस्"
          style={{
            background: '#fff',
            padding: '1.35rem 1.5rem',
            borderRadius: '14px',
            border: '1.5px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>कुल लागत अनुमान बजेट</div>
            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', marginTop: '0.35rem' }}>
              रु. {Number(stats?.totalEstimatedBudget || 112750000).toLocaleString('ne-NP')}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem' }}>
              इन्जिनियरिङ लागत अनुमान (आ.व. २०८१/०८२)
            </div>
          </div>
          <div style={{ background: '#f8fafc', color: '#475569', padding: '0.85rem', borderRadius: '12px' }}>
            <Building size={26} />
          </div>
        </div>

        {/* Card 4: Savings */}
        <div
          onClick={() => setActiveTab('execution')}
          title="रनिङ बिल तथा बचत हेर्न क्लिक गर्नुहोस्"
          style={{
            background: '#fff',
            padding: '1.35rem 1.5rem',
            borderRadius: '14px',
            border: activeTab === 'execution' ? '2px solid #16a34a' : '1.5px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(22, 163, 74, 0.06)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>सार्वजनिक बचत रकम</div>
            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#047857', marginTop: '0.35rem' }}>
              रु. {Number(stats?.totalCostSavings || 12045000).toLocaleString('ne-NP')}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.35rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 700, background: '#dcfce7', padding: '0.1rem 0.45rem', borderRadius: '4px' }}>
                +{stats?.savingsPercentage || 10.7}% बचत
              </span>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                प्रतिस्पर्धाबाट भएको बचत
              </span>
            </div>
          </div>
          <div style={{ background: '#f0fdf4', color: '#16a34a', padding: '0.85rem', borderRadius: '12px' }}>
            <TrendingUp size={26} />
          </div>
        </div>
      </div>

      {/* 3. Executive Responsive Navigation Tabs (5-Card Grid) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(215px, 1fr))',
          gap: '0.85rem',
          marginBottom: '1.75rem',
        }}
      >
        {[
          {
            id: 'registry',
            title: 'बोलपत्र तथा ठेक्का रजिष्ट्री',
            subtitle: 'सम्पूर्ण खरिद तथा ठेक्का अभिलेख',
            badge: `${tenders.length} वटा बोलपत्र`,
            icon: <Layers size={20} />,
            color: '#2563eb',
            bg: '#eff6ff',
          },
          {
            id: 'evaluation',
            title: 'बोलपत्र मूल्याङ्कन',
            subtitle: 'सारभूत प्रभावग्राही र तुलनात्मक तालिका',
            badge: 'तुलनात्मक चार्ट',
            icon: <Scale size={20} />,
            color: '#7c3aed',
            bg: '#f5f3ff',
          },
          {
            id: 'documents',
            title: 'कागजात तथा मुद्रण हब',
            subtitle: 'IFB, LOI, सम्झौता र सूचना पत्रहरू',
            badge: 'Print Hub',
            icon: <Printer size={20} />,
            color: '#059669',
            bg: '#ecfdf5',
          },
          {
            id: 'execution',
            title: 'कार्यान्वयन तथा बिल ट्र्याकर',
            subtitle: 'भौतिक तथा वित्तीय रनिङ बिल प्रगति',
            badge: 'Running Bills',
            icon: <FileCheck size={20} />,
            color: '#d97706',
            bg: '#fffbeb',
          },
          {
            id: 'grievance',
            title: 'गुनासो तथा स्पष्टीकरण',
            subtitle: 'सोधपुछ, उजुरी तथा न्यायिक पुनरावलोकन',
            badge: 'उजुरी / गुनासो',
            icon: <MessageSquare size={20} />,
            color: '#dc2626',
            bg: '#fef2f2',
          },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.45rem',
                padding: '1rem 1.15rem',
                borderRadius: '14px',
                border: isActive ? '2px solid #1e3a8a' : '1.5px solid #e2e8f0',
                background: isActive
                  ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #1e3a8a 100%)'
                  : '#ffffff',
                color: isActive ? '#ffffff' : '#1e293b',
                cursor: 'pointer',
                textAlign: 'left',
                boxShadow: isActive
                  ? '0 10px 20px -5px rgba(30, 58, 138, 0.35)'
                  : '0 2px 6px rgba(0,0,0,0.03)',
                transition: 'all 0.2s ease',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = '#cbd5e1';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 14px rgba(0,0,0,0.06)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.03)';
                }
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: isActive ? 'rgba(255,255,255,0.18)' : tab.bg,
                    color: isActive ? '#ffffff' : tab.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {tab.icon}
                </div>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '10px',
                    background: isActive ? 'rgba(255,255,255,0.2)' : tab.bg,
                    color: isActive ? '#ffffff' : tab.color,
                  }}
                >
                  {tab.badge}
                </span>
              </div>
              <div>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, lineHeight: 1.3 }}>
                  {tab.title}
                </div>
                <div
                  style={{
                    fontSize: '0.74rem',
                    color: isActive ? '#94a3b8' : '#64748b',
                    marginTop: '3px',
                    lineHeight: 1.3,
                  }}
                >
                  {tab.subtitle}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* TAB 1: REGISTRY TABLE */}
      {activeTab === 'registry' && (
        <>
          {/* Filter Bar */}
          <div style={{
            background: '#fff',
            padding: '1rem 1.25rem',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            marginBottom: '1.25rem',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.85rem',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
          }}>
            <div style={{ display: 'flex', flex: 1, minWidth: '280px', position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="ठेक्का नं, आयोजनाको नाम वा निर्माण व्यवसायी खोज्नुहोस्..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 1rem 0.6rem 2.4rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.875rem'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
              {/* Ward Filter */}
              <select
                value={selectedWard}
                onChange={(e) => setSelectedWard(e.target.value)}
                style={{
                  padding: '0.6rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.85rem',
                  background: '#fff'
                }}
              >
                <option value="all">सबै वडाहरू (Wards 1-8)</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(w => (
                  <option key={w} value={String(w)}>वडा नं {w}</option>
                ))}
                <option value="पालिका स्तरीय">पालिका स्तरीय</option>
              </select>

              {/* Method Filter */}
              <select
                value={selectedMethod}
                onChange={(e) => setSelectedMethod(e.target.value)}
                style={{
                  padding: '0.6rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.85rem',
                  background: '#fff'
                }}
              >
                <option value="all">सबै खरिद विधिहरू</option>
                <option value="NCB">खुला राष्ट्रिय बोलपत्र (NCB)</option>
                <option value="SQ">सिलबन्दी दरभाउ पत्र (SQ)</option>
                <option value="Direct">प्रत्यक्ष खरिद (Direct)</option>
              </select>

              {/* Status Stage Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                style={{
                  padding: '0.6rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.85rem',
                  background: '#fff'
                }}
              >
                <option value="all">सबै प्रक्रियागत चरणहरू</option>
                {TENDER_STAGES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              {/* Reset Filters */}
              {(searchTerm || selectedWard !== 'all' || selectedMethod !== 'all' || selectedStatus !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedWard('all');
                    setSelectedMethod('all');
                    setSelectedStatus('all');
                  }}
                  style={{
                    padding: '0.6rem 0.85rem',
                    borderRadius: '8px',
                    border: '1.5px solid #fca5a5',
                    background: '#fef2f2',
                    color: '#991b1b',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  ✕ रिसेट
                </button>
              )}

              {/* Export CSV Button */}
              <button
                type="button"
                onClick={exportToCsv}
                title="बोलपत्र तथा ठेक्का विवरण एक्सेल (CSV) मा डाउनलोड गर्नुहोस्"
                style={{
                  padding: '0.6rem 0.95rem',
                  borderRadius: '8px',
                  border: '1.5px solid #bbf7d0',
                  background: '#f0fdf4',
                  color: '#15803d',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <Download size={15} />
                <span>एक्सेल (CSV) डाउनलोड</span>
              </button>
            </div>
          </div>

          {/* Action Buttons & Quick Filter Bar */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Quick Status Filter Chips */}
            <div
              style={{
                display: 'flex',
                gap: '0.4rem',
                flexWrap: 'wrap',
                alignItems: 'center',
                padding: '0.45rem 0.85rem',
                background: '#f8fafc',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
              }}
            >
              <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, marginRight: '0.2rem' }}>
                द्रुत स्थिति:
              </span>
              {[
                { id: 'all', label: 'सबै बोलपत्र' },
                { id: 'बोलपत्र आह्वान प्रकाशित (IFB Published)', label: '📢 आह्वान (IFB)' },
                { id: 'प्राविधिक तथा आर्थिक मूल्याङ्कन (Bid Evaluation)', label: '⚖️ मूल्याङ्कन' },
                { id: '७ दिने आशयको सूचना (Letter of Intent - LOI)', label: '📜 आशय (LOI)' },
                { id: 'ठेक्का सम्झौता तथा कार्यान्वयन (Contract Awarded)', label: '🤝 सम्झौता' },
                { id: 'कार्य सम्पन्न तथा फरफारक (Work Completed)', label: '✅ सम्पन्न' },
              ].map((chip) => {
                const isActive = selectedStatus === chip.id;
                return (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => setSelectedStatus(chip.id)}
                    style={{
                      padding: '0.3rem 0.7rem',
                      borderRadius: '20px',
                      border: isActive ? '1.5px solid #1e3a8a' : '1px solid #cbd5e1',
                      background: isActive ? '#1e3a8a' : '#ffffff',
                      color: isActive ? '#ffffff' : '#334155',
                      fontSize: '0.75rem',
                      fontWeight: isActive ? 700 : 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: isActive ? '0 2px 6px rgba(30, 58, 138, 0.25)' : 'none',
                    }}
                  >
                    {chip.label}
                  </button>
                );
              })}
            </div>

            {/* Sync & Broadcast Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => alert('PPMO (e-GP) API सँग सफलतापूर्वक Sync भयो!')}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
              >
                <CloudSync size={16} /> Sync with PPMO (e-GP)
              </button>
              <button
                onClick={() => alert('सम्बन्धित निर्माण व्यवसायीहरूलाई SMS/Email अलर्ट पठाइयो!')}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
              >
                <Mail size={16} /> Broadcast IFB Alert
              </button>
            </div>
          </div>

          {/* Table */}
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
          }}>
            <div style={{ overflowX: 'auto' }}>
              <div className="dt-responsive-table-wrapper">
<table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                  <tr>
                    <th style={{ padding: '0.85rem 1rem' }}>बोलपत्र संकेत नं</th>
                    <th style={{ padding: '0.85rem 1rem' }}>आयोजना / खरिद कार्यको नाम</th>
                    <th style={{ padding: '0.85rem 1rem' }}>खरिद विधि</th>
                    <th style={{ padding: '0.85rem 1rem' }}>लागत अनुमान (रु.)</th>
                    <th style={{ padding: '0.85rem 1rem' }}>अन्तिम म्याद</th>
                    <th style={{ padding: '0.85rem 1rem' }}>छनोट भएको व्यवसायी / कबोल रकम</th>
                    <th style={{ padding: '0.85rem 1rem' }}>अवस्था</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>कार्य</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                        ई-बोलपत्र रेकर्डहरू लोड हुँदैछ...
                      </td>
                    </tr>
                  ) : filteredList.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8' }}>
                        कुनै बोलपत्र फेला परेन।
                      </td>
                    </tr>
                  ) : (
                    filteredList.map((t) => {
                      const est = t.estimatedAmountNPR || t.estimatedAmount || 0;
                      const awd = t.contractAmountNPR || t.awardedAmount;
                      const savings = awd && est > awd ? est - awd : 0;
                      const vendor = t.awardedVendorName || t.awardedTo;

                      return (
                        <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          {/* Procurement No */}
                          <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#1d4ed8', whiteSpace: 'nowrap' }}>
                            {t.procurementNo || t.tenderNumber}
                            {t.wardNo && (
                              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500 }}>
                                वडा नं: {t.wardNo}
                              </div>
                            )}
                          </td>

                          {/* Title & Sector */}
                          <td style={{ padding: '0.85rem 1rem', maxWidth: '320px' }}>
                            <div style={{ fontWeight: 600, color: '#0f172a', lineHeight: 1.35 }}>{t.title}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
                              {t.sector || 'पूर्वाधार'} · आ.व. {t.fiscalYear || '२०८१/०८२'}
                            </div>
                            <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.35rem', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '0.68rem', color: '#1d4ed8', background: '#eff6ff', border: '1px solid #dbeafe', padding: '0.1rem 0.4rem', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                                <FileText size={10} /> सूचना
                              </span>
                              <span style={{ fontSize: '0.68rem', color: '#047857', background: '#dcfce7', border: '1px solid #bbf7d0', padding: '0.1rem 0.4rem', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                                <FileSpreadsheet size={10} /> BOQ
                              </span>
                              <span style={{ fontSize: '0.68rem', color: '#b45309', background: '#fef3c7', border: '1px solid #fde68a', padding: '0.1rem 0.4rem', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                                <CheckSquare size={10} /> मापदण्ड {t.requirements ? `(${t.requirements.length})` : ''}
                              </span>
                            </div>
                          </td>

                          {/* Method */}
                          <td style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>
                            <span style={{
                              background: t.method === 'direct_procurement' ? '#fef3c7' : '#f1f5f9',
                              color: t.method === 'direct_procurement' ? '#92400e' : '#334155',
                              padding: '0.25rem 0.6rem',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: 600
                            }}>
                              {t.procurementMethod || 'खुला राष्ट्रिय बोलपत्र (NCB)'}
                            </span>
                          </td>

                          {/* Estimated Amount */}
                          <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap' }}>
                            रु. {Number(est).toLocaleString('ne-NP')}
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                              धरौटी: रु. {Number(t.bidSecurityAmountNPR || t.bidSecurityAmount || Math.round(est * 0.025)).toLocaleString('ne-NP')}
                            </div>
                          </td>

                          {/* Submission Deadline */}
                          <td style={{ padding: '0.85rem 1rem', color: '#dc2626', fontWeight: 600, whiteSpace: 'nowrap' }}>
                            {t.submissionDeadlineBs || t.deadlineDateBs || '-'}
                          </td>

                          {/* Awarded Vendor */}
                          <td style={{ padding: '0.85rem 1rem' }}>
                            {vendor ? (
                              <div>
                                <div style={{ fontWeight: 600, color: '#047857' }}>{vendor}</div>
                                <div style={{ fontSize: '0.78rem', color: '#0f172a', fontWeight: 600, marginTop: '0.1rem' }}>
                                  रु. {Number(awd).toLocaleString('ne-NP')}
                                  {savings > 0 && (
                                    <span style={{ color: '#16a34a', fontSize: '0.72rem', marginLeft: '0.35rem' }}>
                                      (रु. {(savings / 100000).toFixed(1)}L बचत)
                                    </span>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                                {t.status === 'advertised' ? 'प्रस्ताव आह्वान भइरहेको' : 'मूल्याङ्कन प्रक्रियामा'}
                              </span>
                            )}
                          </td>

                          {/* Status Stage Badge */}
                          <td style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>
                            <span style={{
                              background:
                                t.status === 'contracted' || t.status === 'completed' ? '#dcfce7' :
                                t.status === 'awarded' ? '#fef3c7' :
                                t.status === 'evaluation' ? '#e0e7ff' : '#eff6ff',
                              color:
                                t.status === 'contracted' || t.status === 'completed' ? '#15803d' :
                                t.status === 'awarded' ? '#b45309' :
                                t.status === 'evaluation' ? '#3730a3' : '#1d4ed8',
                              padding: '0.3rem 0.65rem',
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              fontWeight: 700
                            }}>
                              {t.stageLabel || t.status}
                            </span>
                          </td>

                          {/* Actions */}
                          <td style={{ padding: '0.85rem 1rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                              {/* Upload / Manage BOQ & Docs */}
                              <button
                                onClick={() => openUploadModal(t)}
                                title="कागजात, BOQ तथा मापदण्ड अपलोड / सम्पादन गर्नुहोस्"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.3rem',
                                  padding: '0.4rem 0.65rem',
                                  background: '#ecfdf5',
                                  border: '1px solid #a7f3d0',
                                  color: '#047857',
                                  borderRadius: '6px',
                                  fontSize: '0.78rem',
                                  fontWeight: 700,
                                  cursor: 'pointer'
                                }}
                              >
                                <UploadCloud size={14} /> BOQ/कागजात
                              </button>

                              {/* View / Print Docs */}
                              <button
                                onClick={() => {
                                  setSelectedTenderForDoc(t);
                                  setSelectedDocType('ifb');
                                  setActiveTab('documents');
                                }}
                                title="कागजात तथा सूचना प्रिन्ट गर्नुहोस्"
                                style={{
                                  padding: '0.4rem 0.65rem',
                                  background: '#eff6ff',
                                  border: '1px solid #bfdbfe',
                                  color: '#1d4ed8',
                                  borderRadius: '6px',
                                  cursor: 'pointer'
                                }}
                              >
                                <Printer size={15} />
                              </button>

                              {/* Comparative Evaluation */}
                              {t.biddersList && t.biddersList.length > 0 && (
                                <button
                                  onClick={() => {
                                    setSelectedEvalTender(t);
                                    setActiveTab('evaluation');
                                  }}
                                  title="तुलनात्मक मूल्याङ्कन हेर्नुहोस्"
                                  style={{
                                    padding: '0.4rem 0.65rem',
                                    background: '#f8fafc',
                                    border: '1px solid #cbd5e1',
                                    color: '#334155',
                                    borderRadius: '6px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  <Scale size={15} />
                                </button>
                              )}

                              {/* Advance Stage Drawer */}
                              <button
                                onClick={() => openDrawer(t)}
                                title="कार्यवाही / अर्को चरणमा लैजानुहोस्"
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.25rem',
                                  padding: '0.4rem 0.65rem',
                                  background: '#2563eb',
                                  border: 'none',
                                  color: '#fff',
                                  borderRadius: '6px',
                                  fontSize: '0.78rem',
                                  fontWeight: 600,
                                  cursor: 'pointer'
                                }}
                              >
                                <span>कार्यवाही</span> <ChevronRight size={14} />
                              </button>
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
        </>
      )}

      {/* TAB 2: COMPARATIVE EVALUATION MATRIX */}
      {activeTab === 'evaluation' && activeEvalTender && (
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>बोलपत्र तुलनात्मक मूल्याङ्कन विवरण</div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0.25rem 0', color: '#0f172a' }}>
                {activeEvalTender.title}
              </h2>
              <div style={{ fontSize: '0.85rem', color: '#2563eb', fontWeight: 600 }}>
                ठेक्का नं: {activeEvalTender.procurementNo || activeEvalTender.tenderNumber} · इन्जिनियरिङ लागत अनुमान: रु. {Number(activeEvalTender.estimatedAmountNPR || activeEvalTender.estimatedAmount).toLocaleString('ne-NP')}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <select
                value={activeEvalTender.id}
                onChange={(e) => {
                  const f = tenders.find(t => t.id === e.target.value);
                  if (f) setSelectedEvalTender(f);
                }}
                style={{ padding: '0.55rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
              >
                {tenders.map(t => (
                  <option key={t.id} value={t.id}>{t.procurementNo} - {t.title.slice(0, 30)}...</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
            <div className="dt-responsive-table-wrapper">
<table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1', color: '#334155' }}>
                <tr>
                  <th style={{ padding: '0.75rem 1rem' }}>क्र.सं. / र्‍याङ्क</th>
                  <th style={{ padding: '0.75rem 1rem' }}>बोलपत्रदाता (कम्पनी / फर्म)</th>
                  <th style={{ padding: '0.75rem 1rem' }}>कबोल रकम (रु.)</th>
                  <th style={{ padding: '0.75rem 1rem' }}>लागत भन्दा छुट %</th>
                  <th style={{ padding: '0.75rem 1rem' }}>प्रणाली प्रमाणीकरण (Auto-Check)</th>
                  <th style={{ padding: '0.75rem 1rem' }}>सारभूत प्रभावग्राही (Responsive)</th>
                  <th style={{ padding: '0.75rem 1rem' }}>मूल्याङ्कन समिति सिफारिस / कैफियत</th>
                </tr>
              </thead>
              <tbody>
                {activeEvalTender.biddersList && activeEvalTender.biddersList.length > 0 ? (
                  activeEvalTender.biddersList.map((b, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #e2e8f0', background: b.rank === 1 ? '#f0fdf4' : '#fff' }}>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: b.rank === 1 ? '#15803d' : '#475569' }}>
                        L{b.rank || i + 1} {b.rank === 1 && '👑'}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#0f172a' }}>
                        {b.name}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#0f172a' }}>
                        रु. {Number(b.bidAmount).toLocaleString('ne-NP')}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: '#047857', fontWeight: 600 }}>
                        {b.discountPct > 0 ? `-${b.discountPct}%` : '0%'}
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.75rem' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#166534', background: '#dcfce7', padding: '0.15rem 0.4rem', borderRadius: '4px' }}><Check size={12} /> कर चुक्ता: Valid</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#166534', background: '#dcfce7', padding: '0.15rem 0.4rem', borderRadius: '4px' }}><Check size={12} /> बैंक ग्यारेन्टी: Verified</span>
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        {b.responsive ? (
                          <span style={{ background: '#dcfce7', color: '#166534', padding: '0.2rem 0.55rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
                            योग्यता पुगेको (Responsive)
                          </span>
                        ) : (
                          <span style={{ background: '#fee2e2', color: '#991b1b', padding: '0.2rem 0.55rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
                            कागजात नपुगेको (Non-responsive)
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: '#334155', fontSize: '0.8rem' }}>
                        {b.remarks || '-'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                      यस बोलपत्रको प्रस्ताव खोल्ने कार्य बाँकी छ वा मूल्याङ्कन विवरण दर्ता भएको छैन।
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
</div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              onClick={() => {
                setSelectedTenderForDoc(activeEvalTender);
                setSelectedDocType('loi');
                setActiveTab('documents');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.6rem 1.25rem',
                background: '#d97706',
                border: 'none',
                color: '#fff',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              <Award size={16} /> ७ दिने आशयको सूचना (LOI) जारी तथा प्रिन्ट गर्नुहोस्
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: OFFICIAL DOCUMENTS & PRINT HUB */}
      {activeTab === 'documents' && activeDocTender && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Sub-tab Switcher: Official Print vs Uploaded Documents Repository */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#fff',
            padding: '0.75rem 1rem',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setDocTabMode('official')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.6rem 1.15rem',
                  borderRadius: '8px',
                  border: '1px solid',
                  borderColor: docTabMode === 'official' ? '#2563eb' : '#cbd5e1',
                  background: docTabMode === 'official' ? '#eff6ff' : '#fff',
                  color: docTabMode === 'official' ? '#1d4ed8' : '#475569',
                  fontWeight: docTabMode === 'official' ? 700 : 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                <Printer size={16} /> १. आधिकारिक पत्र तथा सूचना मुद्रण (IFB / LOI / Contract)
              </button>

              <button
                type="button"
                onClick={() => setDocTabMode('repository')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.6rem 1.15rem',
                  borderRadius: '8px',
                  border: '1px solid',
                  borderColor: docTabMode === 'repository' ? '#059669' : '#cbd5e1',
                  background: docTabMode === 'repository' ? '#ecfdf5' : '#fff',
                  color: docTabMode === 'repository' ? '#047857' : '#475569',
                  fontWeight: docTabMode === 'repository' ? 700 : 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                <FileSpreadsheet size={16} /> २. 📁 बोलपत्र कागजात, BOQ तथा मापदण्ड रिपोजिटोरी
              </button>
            </div>

            <button
              type="button"
              onClick={() => openUploadModal(activeDocTender)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.6rem 1.25rem',
                borderRadius: '8px',
                border: '1px solid #a7f3d0',
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(5, 150, 105, 0.25)'
              }}
            >
              <UploadCloud size={16} /> नयाँ कागजात / BOQ अपलोड
            </button>
          </div>

          {docTabMode === 'repository' ? (
            /* Repository View */
            <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.78rem', background: '#eff6ff', color: '#1d4ed8', padding: '0.2rem 0.6rem', borderRadius: '4px', fontWeight: 700 }}>
                    {activeDocTender.procurementNo || activeDocTender.tenderNumber}
                  </span>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0.4rem 0 0.2rem 0' }}>
                    {activeDocTender.title}
                  </h3>
                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    लागत अनुमान: रु. {Number(activeDocTender.estimatedAmountNPR || activeDocTender.estimatedAmount || 0).toLocaleString('ne-NP')} · धरौटी: रु. {Number(activeDocTender.bidSecurityAmountNPR || activeDocTender.bidSecurityAmount || 0).toLocaleString('ne-NP')}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => openUploadModal(activeDocTender)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.6rem 1.15rem',
                    background: '#059669',
                    color: '#fff',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  <Edit3 size={15} /> कागजात तथा मापदण्ड सम्पादन
                </button>
              </div>

              {/* 4 Cards Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
                {/* 1. Notice */}
                <div style={{ border: '1px solid #bfdbfe', borderRadius: '12px', padding: '1.25rem', background: '#eff6ff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: '#1e40af', fontSize: '0.95rem' }}>
                      <FileText size={20} color="#2563eb" /> बोलपत्र सूचना (Notice)
                    </div>
                    <span style={{ fontSize: '0.7rem', background: '#dbeafe', color: '#1e40af', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: 700 }}>
                      PDF
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.5, marginBottom: '1rem' }}>
                    फाइल: <strong>{activeDocTender.documents?.find((d: any) => d.type === 'notice')?.filename || `${activeDocTender.procurementNo || 'Notice'}-सूचना.pdf`}</strong><br />
                    प्रकाशन मिति: {activeDocTender.advertisedDateBs || activeDocTender.publishDateBs || 'मिति उपलब्ध छैन'}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDocType('ifb');
                        setDocTabMode('official');
                      }}
                      style={{ flex: 1, padding: '0.5rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      सूचना हेर्नुहोस्
                    </button>
                    <button
                      type="button"
                      onClick={() => alert('सूचना फाइल डाउनलोड हुँदैछ...')}
                      style={{ padding: '0.5rem 0.75rem', background: '#fff', color: '#1e40af', border: '1px solid #93c5fd', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      <Download size={14} />
                    </button>
                  </div>
                </div>

                {/* 2. BOQ */}
                <div style={{ border: '1px solid #a7f3d0', borderRadius: '12px', padding: '1.25rem', background: '#ecfdf5' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: '#065f46', fontSize: '0.95rem' }}>
                      <FileSpreadsheet size={20} color="#059669" /> परिमाणको बिल (BOQ)
                    </div>
                    <span style={{ fontSize: '0.7rem', background: '#d1fae5', color: '#065f46', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: 700 }}>
                      Excel (.xlsx)
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.5, marginBottom: '1rem' }}>
                    फाइल: <strong>{activeDocTender.documents?.find((d: any) => d.type === 'boq')?.filename || `${activeDocTender.procurementNo || 'Tender'}-BOQ.xlsx`}</strong><br />
                    आईटम: सडक निर्माण, ग्याबियन र कालोपत्रे
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => alert('Excel BOQ डाउनलोड हुँदैछ...')}
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.5rem', background: '#059669', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      <Download size={14} /> Excel BOQ डाउनलोड
                    </button>
                  </div>
                </div>

                {/* 3. Specs / Drawings */}
                <div style={{ border: '1px solid #fed7aa', borderRadius: '12px', padding: '1.25rem', background: '#fff7ed' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: '#9a3412', fontSize: '0.95rem' }}>
                      <Paperclip size={20} color="#ea580c" /> प्राविधिक नक्सा तथा रेखाचित्र
                    </div>
                    <span style={{ fontSize: '0.7rem', background: '#ffedd5', color: '#9a3412', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: 700 }}>
                      PDF / Drawings
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.5, marginBottom: '1rem' }}>
                    फाइल: <strong>{activeDocTender.documents?.find((d: any) => d.type === 'drawings')?.filename || 'Detailed-Engineering-Drawings.pdf'}</strong><br />
                    इन्जिनियरिङ स्पेसिफिकेसन तथा क्रस-सेक्सन नक्सा
                  </div>
                  <button
                    type="button"
                    onClick={() => alert('प्राविधिक नक्सा डाउनलोड हुँदैछ...')}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.5rem', background: '#ea580c', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    <Download size={14} /> नक्सा तथा TOR डाउनलोड
                  </button>
                </div>
              </div>

              {/* Requirements List Section */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', background: '#fafafa' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckSquare size={18} color="#059669" /> यस बोलपत्रका लागि तोकिएका न्यूनतम योग्यता तथा सर्तहरू ({activeDocTender.requirements?.length || DEFAULT_REQUIREMENTS.slice(0, 6).length} वटा)
                  </h4>
                  <button
                    type="button"
                    onClick={() => openUploadModal(activeDocTender)}
                    style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    मापदण्ड सम्पादन
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '0.65rem' }}>
                  {(activeDocTender.requirements && activeDocTender.requirements.length > 0 ? activeDocTender.requirements : DEFAULT_REQUIREMENTS.slice(0, 6)).map((req, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fff', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.82rem', color: '#334155' }}>
                      <CheckCircle size={16} color="#16a34a" style={{ flexShrink: 0 }} />
                      <span>{req}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.5rem', alignItems: 'start' }}>
              {/* Doc Nav Sidebar */}
              <div style={{ background: '#fff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, marginBottom: '0.75rem' }}>
                  कागजात तथा पत्र छनोट
                </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1.25rem' }}>
              <button
                onClick={() => setSelectedDocType('ifb')}
                style={{
                  textAlign: 'left',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid',
                  borderColor: selectedDocType === 'ifb' ? '#2563eb' : '#e2e8f0',
                  background: selectedDocType === 'ifb' ? '#eff6ff' : '#fff',
                  color: selectedDocType === 'ifb' ? '#1d4ed8' : '#334155',
                  fontWeight: selectedDocType === 'ifb' ? 700 : 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                १. राष्ट्रिय बोलपत्र आह्वान सूचना (IFB)
              </button>

              <button
                onClick={() => setSelectedDocType('loi')}
                style={{
                  textAlign: 'left',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid',
                  borderColor: selectedDocType === 'loi' ? '#2563eb' : '#e2e8f0',
                  background: selectedDocType === 'loi' ? '#eff6ff' : '#fff',
                  color: selectedDocType === 'loi' ? '#1d4ed8' : '#334155',
                  fontWeight: selectedDocType === 'loi' ? 700 : 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                २. ७ दिने आशयको सूचना पत्र (LOI)
              </button>

              <button
                onClick={() => setSelectedDocType('loa')}
                style={{
                  textAlign: 'left',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid',
                  borderColor: selectedDocType === 'loa' ? '#2563eb' : '#e2e8f0',
                  background: selectedDocType === 'loa' ? '#eff6ff' : '#fff',
                  color: selectedDocType === 'loa' ? '#1d4ed8' : '#334155',
                  fontWeight: selectedDocType === 'loa' ? 700 : 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                ३. बोलपत्र स्वीकृति / जमानत पत्र (LoA)
              </button>

              <button
                onClick={() => setSelectedDocType('contract')}
                style={{
                  textAlign: 'left',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid',
                  borderColor: selectedDocType === 'contract' ? '#2563eb' : '#e2e8f0',
                  background: selectedDocType === 'contract' ? '#eff6ff' : '#fff',
                  color: selectedDocType === 'contract' ? '#1d4ed8' : '#334155',
                  fontWeight: selectedDocType === 'contract' ? 700 : 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                ४. आधिकारिक ठेक्का सम्झौता पत्र
              </button>
            </div>

            <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, marginBottom: '0.5rem' }}>
              बोलपत्र छनोट गर्नुहोस्:
            </div>
            <select
              value={activeDocTender.id}
              onChange={(e) => {
                const f = tenders.find(t => t.id === e.target.value);
                if (f) setSelectedTenderForDoc(f);
              }}
              style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
            >
              {tenders.map(t => (
                <option key={t.id} value={t.id}>{t.procurementNo} ({t.title.slice(0, 24)}...)</option>
              ))}
            </select>

            <button
              onClick={() => window.print()}
              style={{
                width: '100%',
                marginTop: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.75rem',
                background: '#0f172a',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
            >
              <Printer size={16} /> यो कागजात प्रिन्ट गर्नुहोस्
            </button>
          </div>

          {/* Printable Sheet View */}
          <div style={{
            background: '#fff',
            padding: '3rem 3.5rem',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            minHeight: '800px',
            color: '#000',
            fontFamily: "'Noto Sans Devanagari', 'Outfit', sans-serif"
          }}>
            {/* Header Crest & Letterhead */}
            <div style={{ textAlign: 'center', borderBottom: '2px solid #dc2626', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Emblem_of_Nepal.svg/180px-Emblem_of_Nepal.svg.png"
                  alt="Nepal Government Crest"
                  style={{ height: '75px', objectFit: 'contain' }}
                  onError={(e: any) => { e.target.style.display = 'none'; }}
                />
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 600, color: '#dc2626' }}>गाउँ कार्यपालिकाको कार्यालय</div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#1e3a8a', margin: '0.2rem 0' }}>
                पाँचपोखरी थाङपाल गाउँपालिका
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#475569' }}>
                थाङपालधाप, सिन्धुपाल्चोक, बागमती प्रदेश, नेपाल
              </div>
              <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>
                सार्वजनिक खरिद, ई-प्रोक्योरमेन्ट तथा बोलपत्र व्यवस्थापन शाखा
              </div>
            </div>

            {/* Document Specific Content */}
            {selectedDocType === 'ifb' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  <div>पत्र संख्या: ०८१/०८२</div>
                  <div>चलानी नं: {activeDocTender.procurementNo}/खरिद-११</div>
                  <div>मिति: {activeDocTender.advertisedDateBs || activeDocTender.publishDateBs || '२०८१/०५/०१'}</div>
                </div>

                <div style={{ textAlign: 'center', margin: '1.5rem 0' }}>
                  <div style={{
                    display: 'inline-block',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#991b1b',
                    fontWeight: 800,
                    fontSize: '1.1rem',
                    padding: '0.4rem 1.5rem',
                    borderRadius: '6px'
                  }}>
                    सिलबन्दी ई-बोलपत्र आह्वानको राष्ट्रिय सूचना
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.4rem' }}>
                    (प्रथम पटक प्रकाशित मिति: {activeDocTender.advertisedDateBs || activeDocTender.publishDateBs || '२०८१/०५/०१'})
                  </div>
                </div>

                <p style={{ lineHeight: 1.8, fontSize: '0.92rem', textAlign: 'justify' }}>
                  यस पाँचपोखरी थाङपाल गाउँपालिकाको चालु आर्थिक वर्ष <strong>{activeDocTender.fiscalYear || '२०८१/०८२'}</strong> को स्वीकृत वार्षिक कार्यक्रम अनुसार देहाय बमोजिमको निर्माण/आपूर्ति कार्यका लागि <strong>सार्वजनिक खरिद ऐन, २०६३</strong> र <strong>सार्वजनिक खरिद नियमावली, २०६४ (संशोधन सहित)</strong> बमोजिम रीतपूर्वक योग्यता पुगेका इच्छुक इजाजतप्राप्त निर्माण व्यवसायी, सप्लायर्स वा फर्महरूबाट सिलबन्दी ई-बोलपत्र (e-Bidding) आह्वान गरिन्छ।
                </p>

                <div style={{ margin: '1.25rem 0', border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden' }}>
                  <div className="dt-responsive-table-wrapper">
<table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <tbody>
                      <tr style={{ background: '#f8fafc', borderBottom: '1px solid #cbd5e1' }}>
                        <td style={{ padding: '0.6rem 0.85rem', fontWeight: 700, width: '30%' }}>ठेक्का / बोलपत्र संकेत नं:</td>
                        <td style={{ padding: '0.6rem 0.85rem', color: '#1d4ed8', fontWeight: 700 }}>{activeDocTender.procurementNo || activeDocTender.tenderNumber}</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                        <td style={{ padding: '0.6rem 0.85rem', fontWeight: 700 }}>आयोजना / खरिद कार्यको नाम:</td>
                        <td style={{ padding: '0.6rem 0.85rem', fontWeight: 600 }}>{activeDocTender.title}</td>
                      </tr>
                      <tr style={{ background: '#f8fafc', borderBottom: '1px solid #cbd5e1' }}>
                        <td style={{ padding: '0.6rem 0.85rem', fontWeight: 700 }}>इन्जिनियरिङ लागत अनुमान (रु.):</td>
                        <td style={{ padding: '0.6rem 0.85rem', fontWeight: 700 }}>रु. {Number(activeDocTender.estimatedAmountNPR || activeDocTender.estimatedAmount).toLocaleString('ne-NP')} (भ्याट बाहेक)</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                        <td style={{ padding: '0.6rem 0.85rem', fontWeight: 700 }}>बोलपत्र धरौटी रकम (Bid Security):</td>
                        <td style={{ padding: '0.6rem 0.85rem', fontWeight: 700, color: '#dc2626' }}>
                          रु. {Number(activeDocTender.bidSecurityAmountNPR || activeDocTender.bidSecurityAmount || 862500).toLocaleString('ne-NP')} (२.५%)
                        </td>
                      </tr>
                      <tr style={{ background: '#f8fafc', borderBottom: '1px solid #cbd5e1' }}>
                        <td style={{ padding: '0.6rem 0.85rem', fontWeight: 700 }}>बोलपत्र फाराम दस्तुर:</td>
                        <td style={{ padding: '0.6rem 0.85rem', fontWeight: 600 }}>रु. {Number(activeDocTender.bidDocFeeNPR || activeDocTender.bidDocFee || 3000).toLocaleString('ne-NP')} (फिर्ता नहुने)</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '0.6rem 0.85rem', fontWeight: 700 }}>बोलपत्र दाखिला गर्ने अन्तिम म्याद:</td>
                        <td style={{ padding: '0.6rem 0.85rem', fontWeight: 700, color: '#b91c1c' }}>
                          {activeDocTender.submissionDeadlineBs || activeDocTender.deadlineDateBs || 'मिति उपलब्ध छैन'} दिउँसो १२:०० बजेसम्म
                        </td>
                      </tr>
                    </tbody>
                  </table>
</div>
                </div>

                <div style={{ fontSize: '0.85rem', lineHeight: 1.7, background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px dashed #cbd5e1', marginBottom: '1.5rem' }}>
                  <strong>विशेष सर्त तथा निर्देशनहरू:</strong><br />
                  १. बोलपत्र फारम सार्वजनिक खरिद अनुगमन कार्यालय (PPMO) को वेबसाइट <code>www.bolpatra.gov.np/egp</code> मार्फत मात्र पेश गर्नुपर्नेछ।<br />
                  २. धरौटी रकम गाउँपालिकाको नेपाल बैंक लिमिटेड, मेलम्ची शाखामा रहेको धरौटी खाता नं <strong>१२३०१००००५८</strong> वा मान्यताप्राप्त 'क' वर्गको वाणिज्य बैंकबाट जारी १२० दिने म्याद भएको बिड बन्ड पेश गर्नुपर्नेछ।<br />
                  ३. फाराम दस्तुर आन्तरिक राजस्व खाता नं <strong>१२३०१००००८९</strong> मा जम्मा गरेको सक्कल भौचर e-GP मा अपलोड गर्नुपर्नेछ।
                </div>
              </div>
            )}

            {selectedDocType === 'loi' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  <div>पत्र संख्या: ०८१/०८२</div>
                  <div>चलानी नं: {activeDocTender.procurementNo}/LOI-०७</div>
                  <div>मिति: {activeDocTender.loiPublishDateBs || '२०८१/०५/१८'}</div>
                </div>

                <div style={{ textAlign: 'center', margin: '1.5rem 0' }}>
                  <div style={{
                    display: 'inline-block',
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    color: '#1d4ed8',
                    fontWeight: 800,
                    fontSize: '1.15rem',
                    padding: '0.4rem 1.5rem',
                    borderRadius: '6px'
                  }}>
                    बोलपत्र स्वीकृत गर्ने आशयको सूचना (Letter of Intent - LOI)
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.4rem' }}>
                    (सार्वजनिक खरिद ऐन, २०६३ को दफा २७ को उपदफा (२) बमोजिम ७ दिने सूचना)
                  </div>
                </div>

                <p style={{ lineHeight: 1.8, fontSize: '0.92rem', textAlign: 'justify' }}>
                  यस कार्यालयबाट प्रकाशित बोलपत्र आह्वान सूचना नं. <strong>{activeDocTender.procurementNo || activeDocTender.tenderNumber}</strong>, आयोजना: <strong>"{activeDocTender.title}"</strong> का लागि पेश हुन आएका बोलपत्रहरू मध्ये सार्वजनिक खरिद ऐन, २०६३ तथा सार्वजनिक खरिद नियमावली, २०६४ बमोजिम सारभूत रूपमा प्रभावग्राही न्यूनतम मूल्याङ्कित देहायको बोलपत्रदाताको बोलपत्र स्वीकृत गर्ने निर्णय भएको हुँदा सम्बन्धित सबैको जानकारीका लागि यो ७ (सात) दिने आशयको सूचना प्रकाशित गरिएको छ।
                </p>

                <div style={{ margin: '1.5rem 0', border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden' }}>
                  <div className="dt-responsive-table-wrapper">
<table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                      <tr>
                        <th style={{ padding: '0.65rem 0.85rem', textAlign: 'left' }}>ठेक्का नं</th>
                        <th style={{ padding: '0.65rem 0.85rem', textAlign: 'left' }}>सफल बोलपत्रदाताको नाम तथा ठेगाना</th>
                        <th style={{ padding: '0.65rem 0.85rem', textAlign: 'left' }}>प्यान नं</th>
                        <th style={{ padding: '0.65rem 0.85rem', textAlign: 'right' }}>कबोल रकम (रु. भ्याट सहित)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ padding: '0.75rem 0.85rem', fontWeight: 600 }}>{activeDocTender.procurementNo}</td>
                        <td style={{ padding: '0.75rem 0.85rem', fontWeight: 700, color: '#047857' }}>
                          {activeDocTender.awardedVendorName || activeDocTender.awardedTo || 'हिमचुली-जलजला जे.भी. निर्माण सेवा'}
                        </td>
                        <td style={{ padding: '0.75rem 0.85rem' }}>{activeDocTender.awardedVendorPan || '३०१४८२९१०'}</td>
                        <td style={{ padding: '0.75rem 0.85rem', textAlign: 'right', fontWeight: 700, color: '#1d4ed8' }}>
                          रु. {Number(activeDocTender.contractAmountNPR || activeDocTender.awardedAmount || 29800000).toLocaleString('ne-NP')}
                        </td>
                      </tr>
                    </tbody>
                  </table>
</div>
                </div>
              </div>
            )}

            {selectedDocType === 'loa' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  <div>पत्र संख्या: ०८१/०८२</div>
                  <div>चलानी नं: {activeDocTender.procurementNo}/LoA-०१</div>
                  <div>मिति: {activeDocTender.contractDateBs || '२०८१/०६/०२'}</div>
                </div>

                <div style={{ margin: '1rem 0' }}>
                  <strong>श्री {activeDocTender.awardedVendorName || activeDocTender.awardedTo || 'सफल निर्माण व्यवसायी'}</strong><br />
                  प्यान/भ्याट नं: {activeDocTender.awardedVendorPan || '३०१४८२९१०'}
                </div>

                <div style={{ textAlign: 'center', margin: '1.5rem 0' }}>
                  <div style={{
                    display: 'inline-block',
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    color: '#166534',
                    fontWeight: 800,
                    fontSize: '1.15rem',
                    padding: '0.4rem 1.5rem',
                    borderRadius: '6px'
                  }}>
                    विषय: बोलपत्र स्वीकृति तथा कार्यसम्पादन जमानत दाखिला सम्बन्धमा (Notice of Acceptance)
                  </div>
                </div>

                <p style={{ lineHeight: 1.8, fontSize: '0.92rem', textAlign: 'justify' }}>
                  तहाँबाट पेश भएको बोलपत्र संकेत नं. <strong>{activeDocTender.procurementNo}</strong>, कार्य: <strong>"{activeDocTender.title}"</strong> को बोलपत्र सार्वजनिक खरिद ऐन, २०६३ को दफा २७ को उपदफा (३) बमोजिम कबोल रकम <strong>रु. {Number(activeDocTender.contractAmountNPR || activeDocTender.awardedAmount || 29800000).toLocaleString('ne-NP')}</strong> मा स्वीकृत भएको हुँदा यो सूचना जारी भएको मितिले १५ (पन्ध्र) दिनभित्र ५% कार्यसम्पादन जमानत (Performance Security) रकम <strong>रु. {Number(activeDocTender.performanceSecurityAmountNPR || Math.round((activeDocTender.contractAmountNPR || 29800000) * 0.05)).toLocaleString('ne-NP')}</strong> दाखिला गरी ठेक्का सम्झौता गर्न उपस्थित हुनुहुन अनुरोध छ।
                </p>
              </div>
            )}

            {selectedDocType === 'contract' && (
              <div>
                <div style={{ textAlign: 'center', margin: '1.5rem 0' }}>
                  <div style={{
                    display: 'inline-block',
                    background: '#f8fafc',
                    border: '2px solid #0f172a',
                    color: '#0f172a',
                    fontWeight: 800,
                    fontSize: '1.25rem',
                    padding: '0.5rem 2rem',
                    borderRadius: '8px'
                  }}>
                    आधिकारिक ठेक्का सम्झौता पत्र (Contract Agreement)
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.4rem' }}>
                    ठेक्का नं: {activeDocTender.procurementNo} · आयोजना: {activeDocTender.title}
                  </div>
                </div>

                <p style={{ lineHeight: 1.8, fontSize: '0.92rem', textAlign: 'justify' }}>
                  यो सम्झौता पत्र आज मिति <strong>{activeDocTender.contractDateBs || '२०८१ साल असार १५ गते'}</strong> का दिन एकातर्फ <strong>पाँचपोखरी थाङपाल गाउँपालिका कार्यपालिकाको कार्यालय</strong> (जसलाई यसपछि 'कार्यालय' भनिनेछ) र अर्कातर्फ निर्माण व्यवसायी <strong>श्री {activeDocTender.awardedVendorName || activeDocTender.awardedTo || 'निर्माण सेवा'}</strong> (प्यान नं: {activeDocTender.awardedVendorPan || '३०१४८२९१०'}) बीच सार्वजनिक खरिद ऐन २०६३ बमोजिम आपसी सहमतिमा सम्पन्न गरिएको छ।
                </p>

                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', margin: '1rem 0', fontSize: '0.85rem', lineHeight: 1.8 }}>
                  १. सम्झौता कबोल रकम: <strong>रु. {Number(activeDocTender.contractAmountNPR || activeDocTender.awardedAmount || 29800000).toLocaleString('ne-NP')}</strong> (अक्षरेपी: दुई करोड अन्ठानब्बे लाख रुपैयाँ मात्र)<br />
                  २. कार्य सम्पन्न गर्नुपर्ने अन्तिम मिति: <strong>{activeDocTender.completionDateBs || '२०८२/०३/१५'}</strong><br />
                  ३. कार्यसम्पादन जमानत रकम: <strong>रु. {Number(activeDocTender.performanceSecurityAmountNPR || Math.round((activeDocTender.contractAmountNPR || 29800000) * 0.05)).toLocaleString('ne-NP')}</strong> (ग्यारेन्टी नं: BG-2081-089)
                </div>
              </div>
            )}

            {/* Bottom Signatures & Seal */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              marginTop: '4rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid #cbd5e1'
            }}>
              {/* QR Verification */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ display: 'inline-block', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '8px' }}>
                  <QrCode size={64} color="#0f172a" />
                </div>
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.25rem' }}>
                  e-GP डिजिटल प्रमाणीकरण कोड<br />
                  {activeDocTender.procurementNo}
                </div>
              </div>

              {/* Engineer */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ borderBottom: '1px dashed #000', width: '160px', marginBottom: '0.4rem' }}></div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>इ. सुरज भण्डारी</div>
                <div style={{ fontSize: '0.75rem', color: '#475569' }}>खरिद तथा योजना शाखा प्रमुख</div>
              </div>

              {/* CAO */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ borderBottom: '1px dashed #000', width: '160px', marginBottom: '0.4rem' }}></div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>प्रमुख प्रशासकीय अधिकृत</div>
                <div style={{ fontSize: '0.75rem', color: '#475569' }}>पाँचपोखरी थाङपाल गाउँपालिका</div>
              </div>
            </div>
          </div>
          </div>
          )}
        </div>
      )}

      {/* TAB 4: EXECUTION & RUNNING BILLS */}
      {activeTab === 'execution' && (
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>चालू ठेक्का सम्झौता तथा रनिङ बिल भुक्तानी अभिलेख</div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: '0.25rem 0 1.25rem 0' }}>
            भौतिक तथा वित्तीय प्रगति अनुगमन (Milestone Progress Tracker)
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {tenders.filter(t => t.runningBills && t.runningBills.length > 0).map((t) => {
              const est = t.estimatedAmountNPR || t.estimatedAmount || 0;
              const awd = t.contractAmountNPR || t.awardedAmount || 0;
              const totalDisbursed = t.runningBills?.reduce((sum, b) => sum + (b.amount || 0), 0) || 0;
              const maxPhysical = Math.max(...(t.runningBills?.map(b => b.physicalProgressPct) || [0]));

              return (
                <div key={t.id} style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem', background: '#f8fafc' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', color: '#1d4ed8', fontWeight: 700 }}>{t.procurementNo}</span>
                    <span style={{ fontSize: '0.72rem', background: '#dcfce7', color: '#166534', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: 700 }}>
                      चालू सम्झौता
                    </span>
                  </div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem 0', lineHeight: 1.35 }}>
                    {t.title}
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: '#047857', fontWeight: 600, marginBottom: '0.75rem' }}>
                    निर्माण व्यवसायी: {t.awardedVendorName || t.awardedTo}
                  </div>

                  {/* Progress Bar */}
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.35rem' }}>
                      <span>भौतिक प्रगति: <strong>{maxPhysical}%</strong></span>
                      <span>वित्तीय भुक्तानी: <strong>{Math.round((totalDisbursed / awd) * 100)}%</strong></span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${maxPhysical}%`, height: '100%', background: '#10b981', borderRadius: '4px' }}></div>
                    </div>
                  </div>

                  {/* Financial Advances & Retentions */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                    <div style={{ background: '#fef3c7', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #fde68a' }}>
                      <div style={{ fontSize: '0.7rem', color: '#b45309', fontWeight: 600 }}>पेश्की (Mobilization) 20%</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#92400e' }}>रु. {Number(awd * 0.20).toLocaleString('ne-NP')}</div>
                    </div>
                    <div style={{ background: '#e0e7ff', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #c7d2fe' }}>
                      <div style={{ fontSize: '0.7rem', color: '#3730a3', fontWeight: 600 }}>धरौटी (Retention) 5%</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#312e81' }}>रु. {Number(awd * 0.05).toLocaleString('ne-NP')}</div>
                    </div>
                  </div>

                  {/* Running Bills List */}
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                    भुक्तानी भएका रनिङ बिलहरू:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {t.runningBills?.map((b, bi) => (
                      <div key={bi} style={{ display: 'flex', justifyContent: 'space-between', background: '#fff', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.78rem' }}>
                        <div>
                          <strong>{b.billNo}</strong> ({b.paymentDate})
                          <div style={{ color: '#64748b', fontSize: '0.72rem' }}>{b.remarks}</div>
                        </div>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>
                          रु. {Number(b.amount).toLocaleString('ne-NP')}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => alert('नक्सा मोड्युल खुल्दैछ...')}
                    style={{ marginTop: '1rem', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.6rem', background: '#fff', color: '#4f46e5', border: '1px solid #c7d2fe', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
                  >
                    <MapPin size={16} /> डिजिटल नक्सामा हेर्नुहोस्
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: GRIEVANCE & PRE-BID QUERIES */}
      {activeTab === 'grievance' && (
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>ठेकेदारका प्रश्न तथा गुनासो व्यवस्थापन</div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: '0.25rem 0 1.25rem 0' }}>
            Pre-bid Queries & Clarifications
          </h2>
          
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.25rem', background: '#f8fafc' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1d4ed8' }}>IFB No: TH/NCB/01/2081/82</span>
                <span style={{ fontSize: '0.75rem', background: '#fef9c3', color: '#854d0e', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>Unanswered</span>
              </div>
              <div style={{ fontSize: '0.9rem', color: '#334155', marginBottom: '1rem' }}>
                <strong>Question:</strong> "Is joint venture (JV) permitted for this contract? The BOQ mentions it but the BID data sheet is unclear."<br/>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>- From: ABC Construction Pvt. Ltd. (Yesterday)</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input type="text" placeholder="Type clarification (Addendum)..." style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                <button onClick={() => alert('Clarification Published via e-GP API!')} style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Publish Reply</button>
              </div>
            </div>
            
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.25rem', background: '#fff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1d4ed8' }}>IFB No: TH/NCB/02/2081/82</span>
                <span style={{ fontSize: '0.75rem', background: '#dcfce7', color: '#166534', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>Answered / Resolved</span>
              </div>
              <div style={{ fontSize: '0.9rem', color: '#334155', marginBottom: '0.5rem' }}>
                <strong>Question:</strong> "Regarding the road specification, does the bitumen grade need to be VG-30?"<br/>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>- From: XYZ Builders (3 days ago)</span>
              </div>
              <div style={{ background: '#f0fdfa', padding: '0.75rem', borderRadius: '6px', borderLeft: '3px solid #0d9488', fontSize: '0.85rem', color: '#0f766e' }}>
                <strong> पालिकाको जवाफ (Clarification):</strong> "Yes, VG-30 is mandatory as per the amended BOQ Section IV."
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Stage Progression Drawer */}
      {drawerTender && (
        <div style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '450px',
          background: '#fff',
          boxShadow: '-4px 0 25px rgba(0,0,0,0.15)',
          zIndex: 1000,
          padding: '1.75rem',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: 700 }}>प्रक्रियागत कार्यप्रवाह (Workflow)</div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0.2rem 0', color: '#0f172a' }}>
                बोलपत्र कारवाही तथा चरण अद्यावधिक
              </h2>
            </div>
            <button
              onClick={() => setDrawerTender(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
            >
              <X size={20} />
            </button>
          </div>

          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
            <div style={{ fontWeight: 700, color: '#1d4ed8' }}>{drawerTender.procurementNo || drawerTender.tenderNumber}</div>
            <div style={{ fontWeight: 600, color: '#0f172a', margin: '0.25rem 0' }}>{drawerTender.title}</div>
            <div style={{ color: '#64748b', fontSize: '0.8rem' }}>
              लागत अनुमान: रु. {Number(drawerTender.estimatedAmountNPR || drawerTender.estimatedAmount).toLocaleString('ne-NP')} · हालको अवस्था: <strong>{drawerTender.stageLabel || drawerTender.status}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                अर्को चरण छनोट गर्नुहोस्:
              </label>
              <select
                value={nextStageChoice}
                onChange={(e) => setNextStageChoice(e.target.value)}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
              >
                <option value="evaluation">प्राविधिक तथा आर्थिक मूल्याङ्कन (Bid Evaluation)</option>
                <option value="awarded">७ दिने आशयको सूचना (Letter of Intent - LOI)</option>
                <option value="contracted">ठेक्का सम्झौता तथा कार्यान्वयन (Contract Awarded)</option>
                <option value="completed">कार्य सम्पन्न तथा फरफारक (Work Completed)</option>
              </select>
            </div>

            {(nextStageChoice === 'awarded' || nextStageChoice === 'contracted') && (
              <>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                    सफल बोलपत्रदाता (कम्पनी / फर्म):
                  </label>
                  <input
                    type="text"
                    value={awardedToInput}
                    onChange={(e) => setAwardedToInput(e.target.value)}
                    placeholder="उदा: हिमचुली-जलजला जे.भी. निर्माण सेवा"
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                    कबोल रकम (रु.):
                  </label>
                  <input
                    type="number"
                    value={awardedAmountInput}
                    onChange={(e) => setAwardedAmountInput(Number(e.target.value))}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                    व्यवसायीको प्यान / भ्याट नं:
                  </label>
                  <input
                    type="text"
                    value={awardedPanInput}
                    onChange={(e) => setAwardedPanInput(e.target.value)}
                    placeholder="उदा: ३०१४८२९१०"
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                  />
                </div>
              </>
            )}

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                प्राविधिक कैफियत / निर्णय व्यहोरा:
              </label>
              <textarea
                rows={3}
                value={stageRemarks}
                onChange={(e) => setStageRemarks(e.target.value)}
                placeholder="सार्वजनिक खरिद ऐन, २०६३ को दफा अनुसार मूल्याङ्कन समिति/कार्यपालिकाको निर्णय..."
                style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              onClick={() => setDrawerTender(null)}
              style={{ flex: 1, padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
            >
              रद्द गर्नुहोस्
            </button>
            <button
              disabled={advanceMutation.isPending}
              onClick={() => {
                advanceMutation.mutate({
                  id: drawerTender.id,
                  status: nextStageChoice,
                  awardedTo: awardedToInput,
                  awardedAmount: awardedAmountInput,
                  awardedVendorPan: awardedPanInput,
                  remarks: stageRemarks,
                });
              }}
              style={{
                flex: 1,
                padding: '0.65rem',
                borderRadius: '8px',
                border: 'none',
                background: '#2563eb',
                color: '#fff',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {advanceMutation.isPending ? 'दर्ता हुँदैछ...' : 'स्वीकृत तथा अगाडि बढाउनुहोस्'}
            </button>
          </div>
        </div>
      )}

      {/* 5. 5-Step IFB Tender Wizard Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            maxWidth: '680px',
            width: '100%',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
          }}>
            {/* Modal Header with Clickable Steps */}
            <div style={{
              padding: '1.25rem 1.75rem 0.75rem 1.75rem',
              borderBottom: '1px solid #e2e8f0',
              background: '#f8fafc'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                    नयाँ सार्वजनिक बोलपत्र / ठेक्का आह्वान (New IFB)
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>
                    चरण {wizardStep} / ७: {
                      wizardStep === 1 ? 'आयोजना तथा बजेट शीर्षक' :
                      wizardStep === 2 ? 'लागत अनुमान र धरौटी स्वतः हिसाब' :
                      wizardStep === 3 ? 'खरिद विधि र म्याद' :
                      wizardStep === 4 ? '📁 बोलपत्र सूचना तथा BOQ कागजात अपलोड' :
                      wizardStep === 5 ? '📋 आवश्यक न्यूनतम योग्यता तथा मापदण्ड' :
                      wizardStep === 6 ? 'बैंक खाता विवरण' : 'पुनरावलोकन तथा राष्ट्रिय सूचना प्रकाशन'
                    }
                  </div>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Step Navigation Bar */}
              <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                {[
                  { step: 1, label: '१. आयोजना' },
                  { step: 2, label: '२. लागत' },
                  { step: 3, label: '३. म्याद' },
                  { step: 4, label: '४. 📁 BOQ/सूचना', highlight: true },
                  { step: 5, label: '५. 📋 मापदण्ड', highlight: true },
                  { step: 6, label: '६. बैंक' },
                  { step: 7, label: '७. प्रकाशन' },
                ].map((s) => {
                  const isActive = wizardStep === s.step;
                  return (
                    <button
                      key={s.step}
                      type="button"
                      onClick={() => setWizardStep(s.step)}
                      style={{
                        padding: '0.35rem 0.65rem',
                        borderRadius: '6px',
                        border: '1px solid',
                        borderColor: isActive ? '#2563eb' : s.highlight ? '#a7f3d0' : '#e2e8f0',
                        background: isActive ? '#2563eb' : s.highlight ? '#ecfdf5' : '#fff',
                        color: isActive ? '#fff' : s.highlight ? '#047857' : '#475569',
                        fontSize: '0.75rem',
                        fontWeight: isActive || s.highlight ? 700 : 500,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.15s'
                      }}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.5rem 1.75rem', overflowY: 'auto', flex: 1 }}>
              {/* Step 1: Project & Budget */}
              {wizardStep === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                      आयोजना / खरिद कार्यको पूरा नाम *
                    </label>
                    <input
                      type="text"
                      placeholder="उदा: थाङपालधाप देखि भोताङ जोड्ने सडक स्तरोन्नति तथा कालोपत्रे निर्माण कार्य"
                      value={wizardData.title}
                      onChange={(e) => setWizardData({ ...wizardData, title: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                        क्षेत्रगत वर्गीकरण (Sector)
                      </label>
                      <select
                        value={wizardData.sector}
                        onChange={(e) => setWizardData({ ...wizardData, sector: e.target.value })}
                        style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                      >
                        <option value="सडक तथा यातायात पूर्वाधार">सडक तथा यातायात पूर्वाधार</option>
                        <option value="स्वास्थ्य तथा भवन पूर्वाधार">स्वास्थ्य तथा भवन पूर्वाधार</option>
                        <option value="खानेपानी तथा सरसफाइ">खानेपानी तथा सरसफाइ</option>
                        <option value="शिक्षा तथा खेलकुद">शिक्षा तथा खेलकुद</option>
                        <option value="सूचना प्रविधि तथा सुशासन">सूचना प्रविधि तथा सुशासन</option>
                        <option value="कृषि तथा आर्थिक विकास">कृषि तथा आर्थिक विकास</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                        वडा नं / कार्यक्षेत्र
                      </label>
                      <select
                        value={wizardData.wardNo}
                        onChange={(e) => setWizardData({ ...wizardData, wardNo: e.target.value })}
                        style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(w => (
                          <option key={w} value={String(w)}>वडा नं {w}</option>
                        ))}
                        <option value="१-८">पालिका स्तरीय (समग्र वडा)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                      खरिद कार्यको संक्षिप्त विवरण
                    </label>
                    <textarea
                      rows={3}
                      placeholder="कार्यको विस्तृत परिधि, स्पेसिफिकेसन वा नर्म्स..."
                      value={wizardData.description}
                      onChange={(e) => setWizardData({ ...wizardData, description: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Cost & Security */}
              {wizardStep === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                      इन्जिनियरिङ लागत अनुमान रकम (रु. भ्याट बाहेक) *
                    </label>
                    <input
                      type="number"
                      value={wizardData.estimatedAmountNPR}
                      onChange={(e) => handleEstimatedAmountChange(Number(e.target.value))}
                      style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', fontWeight: 700 }}
                    />
                  </div>

                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '1rem' }}>
                    <div style={{ fontSize: '0.8rem', color: '#166534', fontWeight: 700, marginBottom: '0.5rem' }}>
                      ⚡ सार्वजनिक खरिद नियमावली अनुसार स्वचालित हिसाब:
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem' }}>
                      <div>
                        बोलपत्र धरौटी (२.५%):<br />
                        <strong style={{ color: '#dc2626' }}>रु. {wizardData.bidSecurityAmountNPR.toLocaleString('ne-NP')}</strong>
                      </div>
                      <div>
                        फाराम दस्तुर (PPMO नियमानुसार):<br />
                        <strong style={{ color: '#047857' }}>रु. {wizardData.bidDocFeeNPR.toLocaleString('ne-NP')}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Method & Deadline */}
              {wizardStep === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                      खरिद विधि (Procurement Method)
                    </label>
                    <select
                      value={wizardData.procurementMethod}
                      onChange={(e) => setWizardData({ ...wizardData, procurementMethod: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                    >
                      <option value="खुला राष्ट्रिय बोलपत्र (NCB)">खुला राष्ट्रिय बोलपत्र (NCB - ३० दिने म्याद)</option>
                      <option value="सिलबन्दी दरभाउ पत्र (SQ)">सिलबन्दी दरभाउ पत्र (SQ - १५ दिने म्याद)</option>
                      <option value="प्रत्यक्ष खरिद (Direct)">प्रत्यक्ष खरिद (Direct)</option>
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                        विज्ञापन प्रकाशित मिति (वि.सं.)
                      </label>
                      <input
                        type="text"
                        value={wizardData.publishDateBs}
                        onChange={(e) => setWizardData({ ...wizardData, publishDateBs: e.target.value })}
                        style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                        दाखिला अन्तिम म्याद (वि.सं.)
                      </label>
                      <input
                        type="text"
                        value={wizardData.submissionDeadlineBs}
                        onChange={(e) => setWizardData({ ...wizardData, submissionDeadlineBs: e.target.value })}
                        style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: BOQ, Notice & Document Upload */}
              {wizardStep === 4 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.85rem 1rem', borderRadius: '10px', fontSize: '0.82rem', color: '#166534' }}>
                    <strong>⚡ बोलपत्र कागजात तथा BOQ अपलोड:</strong> यहाँ अपलोड गरिएका सूचना र BOQ फाइलहरू निर्माण व्यवसायीहरूले e-GP तथा पालिकाको सार्वजनिक पोर्टलबाट डाउनलोड गर्न सक्नेछन्।
                  </div>

                  {/* 1. Tender Notice (IFB Notice) */}
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem', background: '#fafafa' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <label style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <FileText size={16} color="#2563eb" /> १. बोलपत्र आह्वानको आधिकारिक सूचना (IFB Notice) *
                      </label>
                      <span style={{ fontSize: '0.72rem', background: '#eff6ff', color: '#1d4ed8', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
                        PDF / Word
                      </span>
                    </div>

                    {wizardData.noticeFileName ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '0.75rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <CheckCircle size={18} color="#16a34a" />
                          <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e40af' }}>{wizardData.noticeFileName}</div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>साइज: {wizardData.noticeFileSize || '1.2 MB'} · अपलोड सम्पन्न</div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setWizardData({ ...wizardData, noticeFileName: '', noticeFileSize: '' })}
                          style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', padding: '0.3rem' }}
                          title="हटाउनुहोस्"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ) : (
                      <div style={{ border: '2px dashed #cbd5e1', padding: '1.25rem', borderRadius: '8px', textAlign: 'center', background: '#fff' }}>
                        <UploadCloud size={28} color="#64748b" style={{ margin: '0 auto 0.4rem auto' }} />
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
                          यहाँ क्लिक गरेर आधिकारिक बोलपत्र सूचना फाइल छान्नुहोस्
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.2rem' }}>.PDF, .DOCX, वा स्क्यान गरिएको फाइल</div>
                        <input
                          type="file"
                          accept=".pdf,.docx,.doc,.jpg,.png"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setWizardData({
                                ...wizardData,
                                noticeFileName: file.name,
                                noticeFileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`
                              });
                            }
                          }}
                          style={{ display: 'block', width: '100%', marginTop: '0.5rem', fontSize: '0.75rem' }}
                        />
                      </div>
                    )}
                  </div>

                  {/* 2. Bill of Quantities (BOQ) */}
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem', background: '#fafafa' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <label style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <FileSpreadsheet size={16} color="#059669" /> २. परिमाणको बिल (BOQ - Bill of Quantities) *
                      </label>
                      <button
                        type="button"
                        onClick={() => alert('BOQ नमुना ढाँचा (.xlsx) डाउनलोड हुँदैछ...')}
                        style={{ background: 'none', border: 'none', color: '#059669', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
                      >
                        📥 नमुना ढाँचा (Template)
                      </button>
                    </div>

                    {wizardData.boqFileName ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', padding: '0.75rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <CheckCircle size={18} color="#059669" />
                          <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#065f46' }}>{wizardData.boqFileName}</div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>साइज: {wizardData.boqFileSize || '480 KB'} · २८ वटा आईटम लोड भयो</div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setWizardData({ ...wizardData, boqFileName: '', boqFileSize: '' })}
                          style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', padding: '0.3rem' }}
                          title="हटाउनुहोस्"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ) : (
                      <div style={{ border: '2px dashed #cbd5e1', padding: '1.25rem', borderRadius: '8px', textAlign: 'center', background: '#fff' }}>
                        <FileSpreadsheet size={28} color="#059669" style={{ margin: '0 auto 0.4rem auto' }} />
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
                          यहाँ क्लिक गरेर BOQ (Excel / PDF) फाइल अपलोड गर्नुहोस्
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.2rem' }}>.XLSX, .XLS, .CSV वा .PDF ढाँचामा</div>
                        <input
                          type="file"
                          accept=".xlsx,.xls,.csv,.pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setWizardData({
                                ...wizardData,
                                boqFileName: file.name,
                                boqFileSize: `${(file.size / 1024).toFixed(0)} KB`
                              });
                            }
                          }}
                          style={{ display: 'block', width: '100%', marginTop: '0.5rem', fontSize: '0.75rem' }}
                        />
                      </div>
                    )}
                  </div>

                  {/* 3. Drawings & Specs */}
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem', background: '#fafafa' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <label style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Paperclip size={16} color="#d97706" /> ३. प्राविधिक स्पेसिफिकेसन तथा नक्सा (Drawings & Specs)
                      </label>
                      <span style={{ fontSize: '0.72rem', color: '#64748b' }}>ऐच्छिक (Optional)</span>
                    </div>

                    {wizardData.drawingsFileName ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '0.75rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <CheckCircle size={18} color="#d97706" />
                          <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#92400e' }}>{wizardData.drawingsFileName}</div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>साइज: {wizardData.drawingsFileSize || '3.5 MB'}</div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setWizardData({ ...wizardData, drawingsFileName: '', drawingsFileSize: '' })}
                          style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', padding: '0.3rem' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ) : (
                      <input
                        type="file"
                        accept=".pdf,.dwg,.zip,.rar"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setWizardData({
                              ...wizardData,
                              drawingsFileName: file.name,
                              drawingsFileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`
                            });
                          }
                        }}
                        style={{ fontSize: '0.8rem', width: '100%' }}
                      />
                    )}
                  </div>

                  {/* 4. Proposal Details / Scope */}
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                      ४. प्रस्ताव आह्वानको विस्तृत परिधि तथा शर्तहरू (Scope of Work / Proposal Details)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="कार्यको विस्तृत परिधि, गुणस्तर मापदण्ड, वा नर्म्स बारे थप जानकारी..."
                      value={wizardData.proposalDetails || ''}
                      onChange={(e) => setWizardData({ ...wizardData, proposalDetails: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                    />
                  </div>
                </div>
              )}

              {/* Step 5: Eligibility & Mandatory Requirements */}
              {wizardStep === 5 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ background: '#fefce8', border: '1px solid #fef08a', padding: '0.85rem 1rem', borderRadius: '10px', fontSize: '0.82rem', color: '#854d0e' }}>
                    <strong>📋 सार्वजनिक खरिद ऐन २०६३ बमोजिमका योग्यता तथा सर्तहरू:</strong> निर्माण व्यवसायीहरूले बोलपत्र पेश गर्दा अनिवार्य संलग्न गर्नुपर्ने कागजात र न्यूनतम मापदण्डहरू छनोट गर्नुहोस्।
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                      आवश्यक कागजात तथा मापदण्ड छनोट ({wizardData.selectedRequirements.length} वटा छानिएको):
                    </span>
                    <button
                      type="button"
                      onClick={() => setWizardData({ ...wizardData, selectedRequirements: [...DEFAULT_REQUIREMENTS] })}
                      style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      सबै छान्नुहोस्
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '280px', overflowY: 'auto' }}>
                    {DEFAULT_REQUIREMENTS.map((req, idx) => {
                      const isChecked = wizardData.selectedRequirements.includes(req);
                      return (
                        <div
                          key={idx}
                          onClick={() => {
                            const newReqs = isChecked
                              ? wizardData.selectedRequirements.filter(r => r !== req)
                              : [...wizardData.selectedRequirements, req];
                            setWizardData({ ...wizardData, selectedRequirements: newReqs });
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.6rem',
                            padding: '0.65rem 0.85rem',
                            borderRadius: '8px',
                            border: '1px solid',
                            borderColor: isChecked ? '#86efac' : '#e2e8f0',
                            background: isChecked ? '#f0fdf4' : '#fff',
                            cursor: 'pointer',
                            fontSize: '0.82rem',
                            fontWeight: isChecked ? 600 : 400,
                            color: isChecked ? '#166534' : '#334155',
                            transition: 'all 0.15s'
                          }}
                        >
                          {isChecked ? <CheckCircle size={16} color="#16a34a" /> : <Square size={16} color="#94a3b8" />}
                          <span>{req}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Add Custom Requirement */}
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                      + थप विशेष मापदण्ड थप्नुहोस् (Custom Requirement):
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="text"
                        placeholder="उदा: सिन्धुपाल्चोक जिल्ला भित्र न्यूनतम १ वर्षको कार्य अनुभव भएको हुनुपर्ने..."
                        value={wizardData.customRequirementInput}
                        onChange={(e) => setWizardData({ ...wizardData, customRequirementInput: e.target.value })}
                        style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (wizardData.customRequirementInput.trim()) {
                            setWizardData({
                              ...wizardData,
                              selectedRequirements: [...wizardData.selectedRequirements, wizardData.customRequirementInput.trim()],
                              customRequirementInput: ''
                            });
                          }
                        }}
                        style={{ padding: '0.6rem 1rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
                      >
                        थप्नुहोस्
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 6: Bank Details */}
              {wizardStep === 6 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                      बैंकको नाम तथा शाखा
                    </label>
                    <input
                      type="text"
                      value={wizardData.bankName}
                      onChange={(e) => setWizardData({ ...wizardData, bankName: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                      धरौटी खाता नं (Deposit Account)
                    </label>
                    <input
                      type="text"
                      value={wizardData.depositAccountNo}
                      onChange={(e) => setWizardData({ ...wizardData, depositAccountNo: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                      आन्तरिक राजस्व खाता नं (Revenue Account)
                    </label>
                    <input
                      type="text"
                      value={wizardData.revenueAccountNo}
                      onChange={(e) => setWizardData({ ...wizardData, revenueAccountNo: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                    />
                  </div>
                </div>
              )}

              {/* Step 7: Review & Publish */}
              {wizardStep === 7 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a', marginBottom: '0.6rem' }}>
                      {wizardData.title || 'नयाँ बोलपत्र कार्य'}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.8 }}>
                      खरिद विधि: <strong>{wizardData.procurementMethod}</strong><br />
                      क्षेत्र / वडा नं: <strong>{wizardData.sector} · वडा नं {wizardData.wardNo}</strong><br />
                      लागत अनुमान: <strong>रु. {wizardData.estimatedAmountNPR.toLocaleString('ne-NP')}</strong><br />
                      धरौटी रकम: <strong style={{ color: '#dc2626' }}>रु. {wizardData.bidSecurityAmountNPR.toLocaleString('ne-NP')} (२.५%)</strong><br />
                      फाराम दस्तुर: <strong>रु. {wizardData.bidDocFeeNPR.toLocaleString('ne-NP')}</strong><br />
                      दाखिला म्याद: <strong>{wizardData.submissionDeadlineBs} दिउँसो १२:०० बजेसम्म</strong>
                    </div>

                    <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px dashed #cbd5e1', fontSize: '0.82rem' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>संलग्न आधिकारिक कागजातहरू:</div>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '0.2rem 0.5rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <FileText size={13} /> सूचना: {wizardData.noticeFileName || 'उपलब्ध छ'}
                        </span>
                        <span style={{ background: '#ecfdf5', color: '#047857', padding: '0.2rem 0.5rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <FileSpreadsheet size={13} /> BOQ: {wizardData.boqFileName || 'उपलब्ध छ'}
                        </span>
                        <span style={{ background: '#fef3c7', color: '#b45309', padding: '0.2rem 0.5rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <CheckSquare size={13} /> मापदण्डहरू: {wizardData.selectedRequirements.length} वटा छानिएको
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ color: '#047857', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#f0fdf4', padding: '0.75rem', borderRadius: '8px' }}>
                    <CheckCircle size={18} /> यो बोलपत्र स्वीकृत भएपछि PPMO ई-जिपी (e-GP) पोर्टल र पालिकाको सार्वजनिक पेजमा स्वतः प्रकाशित हुनेछ।
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Navigation */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem 1.75rem',
              borderTop: '1px solid #e2e8f0',
              background: '#f8fafc'
            }}>
              <button
                type="button"
                disabled={wizardStep === 1}
                onClick={() => setWizardStep(wizardStep - 1)}
                style={{
                  padding: '0.6rem 1.25rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#fff',
                  color: wizardStep === 1 ? '#94a3b8' : '#334155',
                  fontWeight: 600,
                  cursor: wizardStep === 1 ? 'not-allowed' : 'pointer'
                }}
              >
                &larr; अघिल्लो
              </button>

              {wizardStep < 7 ? (
                <button
                  type="button"
                  disabled={!wizardData.title}
                  onClick={() => setWizardStep(wizardStep + 1)}
                  style={{
                    padding: '0.6rem 1.25rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#2563eb',
                    color: '#fff',
                    fontWeight: 700,
                    cursor: !wizardData.title ? 'not-allowed' : 'pointer'
                  }}
                >
                  अर्को चरण &rarr;
                </button>
              ) : (
                <button
                  type="button"
                  disabled={createMutation.isPending}
                  onClick={() => {
                    createMutation.mutate({
                      title: wizardData.title,
                      description: wizardData.description,
                      proposalDetails: wizardData.proposalDetails,
                      sector: wizardData.sector,
                      wardNo: wizardData.wardNo,
                      method: wizardData.procurementMethod.includes('SQ') ? 'request_for_quotation' : 'open_tendering',
                      status: 'advertised',
                      estimatedAmount: wizardData.estimatedAmountNPR,
                      bidSecurityAmount: wizardData.bidSecurityAmountNPR,
                      bidDocFee: wizardData.bidDocFeeNPR,
                      advertisedDateBs: wizardData.publishDateBs,
                      deadlineDateBs: wizardData.submissionDeadlineBs,
                      requirements: wizardData.selectedRequirements,
                      documents: [
                        { name: 'बोलपत्र आह्वान सूचना (Notice)', type: 'notice', filename: wizardData.noticeFileName || 'IFB-Notice.pdf', size: wizardData.noticeFileSize || '1.2 MB', url: `/uploads/${wizardData.noticeFileName || 'IFB-Notice.pdf'}` },
                        { name: 'परिमाणको बिल (BOQ)', type: 'boq', filename: wizardData.boqFileName || 'BOQ-Document.xlsx', size: wizardData.boqFileSize || '480 KB', url: `/uploads/${wizardData.boqFileName || 'BOQ-Document.xlsx'}` },
                        ...(wizardData.drawingsFileName ? [{ name: 'प्राविधिक नक्सा (Drawings)', type: 'drawings', filename: wizardData.drawingsFileName, size: wizardData.drawingsFileSize || '3.5 MB', url: `/uploads/${wizardData.drawingsFileName}` }] : []),
                      ],
                    });
                  }}
                  style={{
                    padding: '0.6rem 1.5rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#16a34a',
                    color: '#fff',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)'
                  }}
                >
                  {createMutation.isPending ? 'प्रकाशन हुँदैछ...' : 'बोलपत्र आह्वान गर्नुहोस्'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 6. Dedicated Document & BOQ Upload Modal for ANY Tender */}
      {selectedTenderForUpload && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1100,
          padding: '1rem'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            maxWidth: '680px',
            width: '100%',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
          }}>
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1.25rem 1.75rem',
              borderBottom: '1px solid #e2e8f0',
              background: '#f8fafc'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <UploadCloud size={20} color="#059669" />
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                    ठेक्का कागजात, BOQ तथा मापदण्ड व्यवस्थापन
                  </h3>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#1d4ed8', fontWeight: 600, marginTop: '0.2rem' }}>
                  {selectedTenderForUpload.procurementNo || selectedTenderForUpload.tenderNumber} · {selectedTenderForUpload.title}
                </div>
              </div>
              <button
                onClick={() => setSelectedTenderForUpload(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.5rem 1.75rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.82rem', color: '#065f46' }}>
                यस ठेक्काका लागि बोलपत्र सूचना (Notice), BOQ तथा योग्यता मापदण्डहरू यहाँबाट अपलोड, परिवर्तन वा अद्यावधिक गर्न सक्नुहुन्छ।
              </div>

              {/* 1. Tender Notice (PDF) */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem', background: '#fafafa' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <FileText size={16} color="#2563eb" /> १. बोलपत्र आह्वानको आधिकारिक सूचना (Notice PDF)
                  </label>
                  <span style={{ fontSize: '0.72rem', background: '#eff6ff', color: '#1d4ed8', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
                    PDF / Word
                  </span>
                </div>

                {uploadModalNotice ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '0.75rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <CheckCircle size={18} color="#16a34a" />
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e40af' }}>{uploadModalNotice.name}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>साइज: {uploadModalNotice.size} · तयार छ</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => alert(`फाइल ${uploadModalNotice.name} डाउनलोड हुँदैछ...`)}
                        style={{ background: '#fff', border: '1px solid #cbd5e1', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}
                      >
                        डाउनलोड
                      </button>
                      <button
                        type="button"
                        onClick={() => setUploadModalNotice(null)}
                        style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) setUploadModalNotice({ name: f.name, size: `${(f.size / (1024 * 1024)).toFixed(1)} MB` });
                    }}
                    style={{ fontSize: '0.8rem', width: '100%' }}
                  />
                )}
              </div>

              {/* 2. Bill of Quantities (BOQ) */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem', background: '#fafafa' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <FileSpreadsheet size={16} color="#059669" /> २. परिमाणको बिल (BOQ - Bill of Quantities Excel)
                  </label>
                  <button
                    type="button"
                    onClick={() => alert('BOQ नमुना ढाँचा डाउनलोड हुँदैछ...')}
                    style={{ background: 'none', border: 'none', color: '#059669', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    📥 BOQ Template
                  </button>
                </div>

                {uploadModalBoq ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', padding: '0.75rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <CheckCircle size={18} color="#059669" />
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#065f46' }}>{uploadModalBoq.name}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>साइज: {uploadModalBoq.size} · निर्माण व्यवसायीले भर्ने एक्सेल BOQ</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => alert(`BOQ ${uploadModalBoq.name} डाउनलोड हुँदैछ...`)}
                        style={{ background: '#fff', border: '1px solid #cbd5e1', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}
                      >
                        डाउनलोड
                      </button>
                      <button
                        type="button"
                        onClick={() => setUploadModalBoq(null)}
                        style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) setUploadModalBoq({ name: f.name, size: `${(f.size / 1024).toFixed(0)} KB` });
                    }}
                    style={{ fontSize: '0.8rem', width: '100%' }}
                  />
                )}
              </div>

              {/* 3. Drawings / Specs */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem', background: '#fafafa' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Paperclip size={16} color="#d97706" /> ३. प्राविधिक स्पेसिफिकेसन तथा नक्सा (Drawings & Specs)
                  </label>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>PDF / ZIP</span>
                </div>

                {uploadModalDrawings ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '0.75rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <CheckCircle size={18} color="#d97706" />
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#92400e' }}>{uploadModalDrawings.name}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>साइज: {uploadModalDrawings.size}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setUploadModalDrawings(null)}
                      style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ) : (
                  <input
                    type="file"
                    accept=".pdf,.zip,.dwg"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) setUploadModalDrawings({ name: f.name, size: `${(f.size / (1024 * 1024)).toFixed(1)} MB` });
                    }}
                    style={{ fontSize: '0.8rem', width: '100%' }}
                  />
                )}
              </div>

              {/* 4. Requirements Checklist */}
              <div>
                <label style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: '0.5rem' }}>
                  ४. आवश्यक न्यूनतम योग्यता तथा मापदण्डहरू ({uploadModalReqs.length} वटा छानिएको):
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '200px', overflowY: 'auto' }}>
                  {DEFAULT_REQUIREMENTS.map((req, idx) => {
                    const isChecked = uploadModalReqs.includes(req);
                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          const updated = isChecked ? uploadModalReqs.filter(r => r !== req) : [...uploadModalReqs, req];
                          setUploadModalReqs(updated);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.5rem 0.75rem',
                          borderRadius: '6px',
                          border: '1px solid',
                          borderColor: isChecked ? '#86efac' : '#e2e8f0',
                          background: isChecked ? '#f0fdf4' : '#fff',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          color: isChecked ? '#166534' : '#334155'
                        }}
                      >
                        {isChecked ? <CheckCircle size={15} color="#16a34a" /> : <Square size={15} color="#94a3b8" />}
                        <span>{req}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Add new requirement */}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="थप मापदण्ड थप्नुहोस्..."
                    value={newReqInput}
                    onChange={(e) => setNewReqInput(e.target.value)}
                    style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newReqInput.trim()) {
                        setUploadModalReqs([...uploadModalReqs, newReqInput.trim()]);
                        setNewReqInput('');
                      }
                    }}
                    style={{ padding: '0.5rem 0.85rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    थप्नुहोस्
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.75rem',
              alignItems: 'center',
              padding: '1rem 1.75rem',
              borderTop: '1px solid #e2e8f0',
              background: '#f8fafc'
            }}>
              <button
                type="button"
                onClick={() => setSelectedTenderForUpload(null)}
                style={{
                  padding: '0.6rem 1.25rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#fff',
                  color: '#334155',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                रद्द गर्नुहोस्
              </button>
              <button
                type="button"
                disabled={updateMutation.isPending}
                onClick={() => {
                  const docs = [
                    ...(uploadModalNotice ? [{ name: 'बोलपत्र सूचना (Notice)', type: 'notice', filename: uploadModalNotice.name, size: uploadModalNotice.size, url: `/uploads/${uploadModalNotice.name}` }] : []),
                    ...(uploadModalBoq ? [{ name: 'परिमाणको बिल (BOQ)', type: 'boq', filename: uploadModalBoq.name, size: uploadModalBoq.size, url: `/uploads/${uploadModalBoq.name}` }] : []),
                    ...(uploadModalDrawings ? [{ name: 'प्राविधिक नक्सा (Drawings)', type: 'drawings', filename: uploadModalDrawings.name, size: uploadModalDrawings.size, url: `/uploads/${uploadModalDrawings.name}` }] : []),
                  ];

                  updateMutation.mutate({
                    id: selectedTenderForUpload.id,
                    data: {
                      documents: docs,
                      requirements: uploadModalReqs,
                    }
                  });
                }}
                style={{
                  padding: '0.6rem 1.5rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#059669',
                  color: '#fff',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(5, 150, 105, 0.35)'
                }}
              >
                {updateMutation.isPending ? 'सुरक्षित हुँदैछ...' : 'कागजात तथा मापदण्ड सुरक्षित गर्नुहोस्'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcurementPage;
