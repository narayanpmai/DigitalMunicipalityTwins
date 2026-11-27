import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  X,
  FolderGit2,
  Save,
  AlertCircle,
  Building,
  Coins,
  Calendar,
  UserCheck,
  MapPin,
  Link2,
  Users,
  Plus,
  Trash2,
  CheckSquare,
  Square,
  FileText,
  DollarSign,
  ShieldCheck,
} from 'lucide-react';
import type {
  Project,
  LinkableBudget,
  LinkableProcurement,
  LinkableSourcesResponse,
  BudgetSubHeadItem,
  BudgetSourceItem,
  CommitteeMember,
} from '../../../types/sectoral';
import { useFiscalYear } from '../../../context/FiscalYearContext';
import { NepaliDatePicker } from '../../../components/common/NepaliDatePicker';
import { adToBs } from '../../../utils/nepaliCalendar';
import { api } from '../../../api/client';
import { projectsApi } from '../../../api/projects';

export interface ProjectAgreementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: Partial<Project>) => Promise<void> | void;
  projectToEdit?: Project | null;
  initialSubhead?: BudgetSubHeadItem | null;
  isSubmitting?: boolean;
}

const MARFAT_OPTIONS = [
  'उपभोक्ता समिति',
  'ठेक्का / बोलपत्र',
  'रोजगार सेवा केन्द्र',
  'विद्यालय',
  'टोल सुधार समिति',
  'अमानत',
  'संस्था / समूह',
];

const WARD_COORDS: Record<number, { lat: number; lng: number }> = {
  0: { lat: 27.9398, lng: 85.5921 },
  1: { lat: 27.9450, lng: 85.6130 },
  2: { lat: 27.9880, lng: 85.6310 },
  3: { lat: 27.9789, lng: 85.6123 },
  4: { lat: 27.9610, lng: 85.5980 },
  5: { lat: 27.9234, lng: 85.5801 },
  6: { lat: 27.9398, lng: 85.5921 },
  7: { lat: 27.9117, lng: 85.5692 },
  8: { lat: 27.9087, lng: 85.5745 },
};

const toNepaliNum = (num: number | string): string => {
  const nepaliDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  return String(num).replace(/\d/g, (d) => nepaliDigits[parseInt(d, 10)]);
};

export const ProjectAgreementModal: React.FC<ProjectAgreementModalProps> = ({
  isOpen,
  onClose,
  onSave,
  projectToEdit,
  initialSubhead,
  isSubmitting = false,
}) => {
  const { fiscalYears, activeFiscalYear } = useFiscalYear();
  const todayBs = adToBs(new Date().toISOString().split('T')[0]) || '२०८१-०४-०१';

  // Fetch Employees for Technical Signatory & CAO
  const { data: employees = [] } = useQuery<any[]>({
    queryKey: ['employees-roster'],
    queryFn: async () => {
      const res: any = await api.get('/employees');
      return Array.isArray(res) ? res : res?.data || [];
    },
    staleTime: 60000,
    enabled: isOpen,
  });

  // Fetch Budget Sources (all 37 sources)
  const { data: budgetSourcesList = [] } = useQuery<BudgetSourceItem[]>({
    queryKey: ['budget-sources'],
    queryFn: () => projectsApi.getBudgetSources(),
    staleTime: 30000,
    enabled: isOpen,
  });

  // Fetch Budget Sub-Heads (50 authentic Panchpokhari subheads)
  const { data: allSubHeads = [] } = useQuery<BudgetSubHeadItem[]>({
    queryKey: ['budget-sub-heads'],
    queryFn: () => projectsApi.getBudgetSubHeads(),
    staleTime: 30000,
    enabled: isOpen,
  });

  // Linkable sources (Budgets & Procurements)
  const { data: linkableData } = useQuery<LinkableSourcesResponse>({
    queryKey: ['project-linkable-sources'],
    queryFn: () => projectsApi.getLinkableSources(),
    staleTime: 30000,
    enabled: isOpen,
  });

  const linkableProcurements: LinkableProcurement[] = linkableData?.procurements || [];

  // Filter Sub-Heads based on Fiscal Year, Level, and Ward
  const [selectedFy, setSelectedFy] = useState<string>(activeFiscalYear || '२०८१/०८२');
  const [selectedLevel, setSelectedLevel] = useState<string>('नगर स्तरिय');
  const [selectedWard, setSelectedWard] = useState<number | string>('all');
  const [selectedSubHeadId, setSelectedSubHeadId] = useState<string>('');

  const filteredSubHeads = useMemo(() => {
    return allSubHeads.filter((sh) => {
      const matchFy = !selectedFy || selectedFy === 'all' || sh.fiscalYear === selectedFy;
      const matchLevel =
        !selectedLevel ||
        selectedLevel === 'all' ||
        (selectedLevel === 'वडा स्तरिय' ? sh.level?.includes('वडा') : !sh.level?.includes('वडा'));
      const matchWard =
        selectedWard === 'all' ||
        selectedWard === '' ||
        sh.wardNumber === Number(selectedWard);
      return matchFy && matchLevel && matchWard;
    });
  }, [allSubHeads, selectedFy, selectedLevel, selectedWard]);

  // Main Form Data State
  const [formData, setFormData] = useState<Partial<Project>>({
    name: '',
    subProjectName: '',
    projectCode: '',
    wardNumber: 0,
    level: 'नगर स्तरिय',
    sector: 'पूर्वाधार विकास',
    fiscalYear: activeFiscalYear || '२०८१/०८२',
    budgetSource: 'आन्तरीक स्रोत',
    budgetSubHead: '',
    chalaniNo: '',
    wardRecommendationDateBs: '',
    marfat: 'उपभोक्ता समिति',
    location: '',
    objective: '',
    startDateBs: '',
    completionDateBs: '',
    agreementDateBs: todayBs,

    // Cost Breakdown
    technicalEstimateAmount: 0,
    officeCost: 0,
    committeeCost: 0,
    communityContribution: 0,
    laborContribution: 0,
    contingencyRatePercent: 3,
    contingencyAmount: 0,
    maintenanceFundPercent: 3,

    // Beneficiaries
    beneficiaryHouseholds: 0,
    beneficiaryCommunity: '',
    beneficiaryOrganization: 0,
    beneficiaryFemale: 0,
    beneficiaryMale: 0,
    beneficiaryCount: 0,

    // Consumer Committee
    committeeFormationDateBs: '',
    committeeFormationAttendees: 0,
    committeeName: '',
    committeeChair: '',
    committeeViceChair: '',
    committeeSecretary: '',
    committeeTreasurer: '',
    committeePhone: '',
    committeeMembers: [],
    monitoringCommitteeMembers: [],

    // Installment Schedule (३ किस्ता तालिका)
    installmentDetails: {
      schedule: [
        { phase: 'पहिलो किस्ता', dateBs: '', amount: 0, materialsQty: '', remarks: '' },
        { phase: 'दोस्रो किस्ता', dateBs: '', amount: 0, materialsQty: '', remarks: '' },
        { phase: 'तेस्रो किस्ता', dateBs: '', amount: 0, materialsQty: '', remarks: '' },
      ],
    },

    // Signatories
    signatories: {
      committeeChair: '',
      committeeSecretary: '',
      committeeTreasurer: '',
      technicalRecommenderName: '',
      technicalRecommenderDesignation: 'सब-इन्जिनियर',
      technicalRecommendationDateBs: todayBs,
      approverName: '',
      approverDesignation: 'प्रमुख प्रशासकीय अधिकृत',
      approvalDateBs: todayBs,
    },

    // Procurement
    procurementId: '',
    procurementNo: '',
    contractorName: '',
    contractorPan: '',
    contractDetails: {},

    // Status
    status: 'planned',
    agreementStatus: 'draft',
    physicalProgressPercent: 0,
    financialProgress: 0,
    paidAmount: 0,
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize or reset form
  useEffect(() => {
    if (!isOpen) return;

    if (projectToEdit) {
      setFormData({
        ...projectToEdit,
        fiscalYear: projectToEdit.fiscalYear || activeFiscalYear || '२०८१/०८२',
        level: projectToEdit.level || 'नगर स्तरिय',
        wardNumber: Number(projectToEdit.wardNumber ?? 0),
        signatories: projectToEdit.signatories || {
          committeeChair: projectToEdit.committeeChair || '',
          committeeSecretary: projectToEdit.committeeSecretary || '',
          committeeTreasurer: projectToEdit.committeeTreasurer || '',
          technicalRecommenderName: projectToEdit.responsibleEngineer || '',
          technicalRecommenderDesignation: 'सब-इन्जिनियर',
          technicalRecommendationDateBs: todayBs,
          approverName: '',
          approverDesignation: 'प्रमुख प्रशासकीय अधिकृत',
          approvalDateBs: todayBs,
        },
        installmentDetails: projectToEdit.installmentDetails?.schedule
          ? projectToEdit.installmentDetails
          : {
              schedule: [
                { phase: 'पहिलो किस्ता', dateBs: '', amount: 0, materialsQty: '', remarks: '' },
                { phase: 'दोस्रो किस्ता', dateBs: '', amount: 0, materialsQty: '', remarks: '' },
                { phase: 'तेस्रो किस्ता', dateBs: '', amount: 0, materialsQty: '', remarks: '' },
              ],
            },
      });
      setSelectedFy(projectToEdit.fiscalYear || activeFiscalYear || '२०८१/०८२');
      setSelectedLevel(projectToEdit.level || 'नगर स्तरिय');
      setSelectedWard(projectToEdit.wardNumber !== undefined ? projectToEdit.wardNumber : 'all');
    } else if (initialSubhead) {
      handleSelectSubHeadItem(initialSubhead);
    } else {
      resetToDefault();
    }
    setErrorMessage(null);
  }, [projectToEdit, initialSubhead, isOpen, activeFiscalYear, todayBs]);

  const resetToDefault = () => {
    setFormData({
      name: '',
      subProjectName: '',
      projectCode: '',
      wardNumber: 0,
      level: 'नगर स्तरिय',
      sector: 'पूर्वाधार विकास',
      fiscalYear: activeFiscalYear || '२०८१/०८२',
      budgetSource: 'आन्तरीक स्रोत',
      budgetSubHead: '',
      chalaniNo: '',
      wardRecommendationDateBs: '',
      marfat: 'उपभोक्ता समिति',
      location: '',
      objective: '',
      startDateBs: '',
      completionDateBs: '',
      agreementDateBs: todayBs,
      technicalEstimateAmount: 0,
      officeCost: 0,
      committeeCost: 0,
      communityContribution: 0,
      laborContribution: 0,
      contingencyRatePercent: 3,
      contingencyAmount: 0,
      maintenanceFundPercent: 3,
      beneficiaryHouseholds: 0,
      beneficiaryCommunity: '',
      beneficiaryOrganization: 0,
      beneficiaryFemale: 0,
      beneficiaryMale: 0,
      beneficiaryCount: 0,
      committeeFormationDateBs: '',
      committeeFormationAttendees: 0,
      committeeName: '',
      committeeChair: '',
      committeeViceChair: '',
      committeeSecretary: '',
      committeeTreasurer: '',
      committeePhone: '',
      committeeMembers: [],
      monitoringCommitteeMembers: [],
      installmentDetails: {
        schedule: [
          { phase: 'पहिलो किस्ता', dateBs: '', amount: 0, materialsQty: '', remarks: '' },
          { phase: 'दोस्रो किस्ता', dateBs: '', amount: 0, materialsQty: '', remarks: '' },
          { phase: 'तेस्रो किस्ता', dateBs: '', amount: 0, materialsQty: '', remarks: '' },
        ],
      },
      signatories: {
        committeeChair: '',
        committeeSecretary: '',
        committeeTreasurer: '',
        technicalRecommenderName: '',
        technicalRecommenderDesignation: 'सब-इन्जिनियर',
        technicalRecommendationDateBs: todayBs,
        approverName: '',
        approverDesignation: 'प्रमुख प्रशासकीय अधिकृत',
        approvalDateBs: todayBs,
      },
      status: 'planned',
      agreementStatus: 'draft',
      physicalProgressPercent: 0,
      financialProgress: 0,
      paidAmount: 0,
    });
    setSelectedSubHeadId('');
  };

  // Program selection handler (Auto-fills all matching fields)
  const handleSelectSubHeadItem = (sh: BudgetSubHeadItem) => {
    setSelectedSubHeadId(sh.id);
    const cost = sh.allocatedAmount || 0;
    const contAmt = Math.round((cost * (formData.contingencyRatePercent || 3)) / 100);

    // Initial 3 installment breakdown suggestion: 40%, 40%, 20%
    const firstKista = Math.round(cost * 0.4);
    const secondKista = Math.round(cost * 0.4);
    const thirdKista = cost - firstKista - secondKista;

    setFormData((prev) => ({
      ...prev,
      name: sh.title,
      budgetId: sh.id,
      budgetSubHead: sh.subHeadNo || '',
      budgetSource: sh.sourceOfFund || prev.budgetSource,
      sector: sh.sector || prev.sector || 'पूर्वाधार विकास',
      level: sh.level || prev.level,
      wardNumber: sh.wardNumber !== null && sh.wardNumber !== undefined ? sh.wardNumber : prev.wardNumber,
      officeCost: cost,
      allocatedBudget: cost,
      palikaGrant: cost,
      technicalEstimateAmount: prev.technicalEstimateAmount || cost,
      contingencyAmount: contAmt,
      location: prev.location || (sh.wardNumber ? `पाँचपोखरी थाङपाल वडा नं. ${sh.wardNumber}` : 'पाँचपोखरी थाङपाल गाउँपालिका'),
      installmentDetails: {
        schedule: [
          { phase: 'पहिलो किस्ता', dateBs: prev.startDateBs || todayBs, amount: firstKista, materialsQty: '४०% पेश्की किस्ता', remarks: 'सम्झौता पश्चात्' },
          { phase: 'दोस्रो किस्ता', dateBs: '', amount: secondKista, materialsQty: '४०% दोस्रो किस्ता', remarks: '५०% भौतिक प्रगति पछि' },
          { phase: 'तेस्रो किस्ता', dateBs: '', amount: thirdKista, materialsQty: '२०% अन्तिम किस्ता', remarks: 'अन्तिम नापी किताब र सामाजिक परीक्षण पश्चात्' },
        ],
      },
    }));
  };

  const handleInputChange = (field: keyof Project | string, value: any) => {
    setFormData((prev) => {
      const next: any = { ...prev, [field]: value };

      // Auto-recalculate contingency
      if (field === 'officeCost' || field === 'contingencyRatePercent') {
        const oCost = field === 'officeCost' ? Number(value) : Number(prev.officeCost || 0);
        const rate = field === 'contingencyRatePercent' ? Number(value) : Number(prev.contingencyRatePercent || 3);
        next.contingencyAmount = Math.round((oCost * rate) / 100);
      }

      // Auto-sum beneficiaries total
      if (field === 'beneficiaryFemale' || field === 'beneficiaryMale') {
        const f = field === 'beneficiaryFemale' ? Number(value) : Number(prev.beneficiaryFemale || 0);
        const m = field === 'beneficiaryMale' ? Number(value) : Number(prev.beneficiaryMale || 0);
        next.beneficiaryCount = f + m;
      }

      // Auto-sync committee leaders to signatories
      if (field === 'committeeChair') {
        next.signatories = { ...(prev.signatories || {}), committeeChair: value };
      }
      if (field === 'committeeSecretary') {
        next.signatories = { ...(prev.signatories || {}), committeeSecretary: value };
      }
      if (field === 'committeeTreasurer') {
        next.signatories = { ...(prev.signatories || {}), committeeTreasurer: value };
      }

      // Auto-set ward coordinates
      if (field === 'wardNumber') {
        const wc = WARD_COORDS[Number(value)] || WARD_COORDS[0];
        next.latitude = wc.lat;
        next.longitude = wc.lng;
      }

      return next;
    });
  };

  // Dynamic Committee Member Handlers
  const handleAddMember = () => {
    setFormData((prev) => ({
      ...prev,
      committeeMembers: [
        ...(prev.committeeMembers || []),
        { id: String(Date.now()), name: '', role: 'सदस्य', phone: '', gender: 'महिला' },
      ],
    }));
  };

  const handleUpdateMember = (idx: number, key: string, val: string) => {
    setFormData((prev) => {
      const list = [...(prev.committeeMembers || [])];
      list[idx] = { ...list[idx], [key]: val };
      return { ...prev, committeeMembers: list };
    });
  };

  const handleRemoveMember = (idx: number) => {
    setFormData((prev) => {
      const list = [...(prev.committeeMembers || [])];
      list.splice(idx, 1);
      return { ...prev, committeeMembers: list };
    });
  };

  // Dynamic Monitoring Committee Handlers
  const handleAddMonitoringMember = () => {
    setFormData((prev) => ({
      ...prev,
      monitoringCommitteeMembers: [
        ...(prev.monitoringCommitteeMembers || []),
        { id: String(Date.now()), name: '', role: 'सदस्य', phone: '' },
      ],
    }));
  };

  const handleUpdateMonitoringMember = (idx: number, key: string, val: string) => {
    setFormData((prev) => {
      const list = [...(prev.monitoringCommitteeMembers || [])];
      list[idx] = { ...list[idx], [key]: val };
      return { ...prev, monitoringCommitteeMembers: list };
    });
  };

  const handleRemoveMonitoringMember = (idx: number) => {
    setFormData((prev) => {
      const list = [...(prev.monitoringCommitteeMembers || [])];
      list.splice(idx, 1);
      return { ...prev, monitoringCommitteeMembers: list };
    });
  };

  // Installment Schedule Handler
  const handleUpdateInstallment = (idx: number, key: string, val: any) => {
    setFormData((prev) => {
      const sched = [...(prev.installmentDetails?.schedule || [])];
      sched[idx] = { ...sched[idx], [key]: val };
      return {
        ...prev,
        installmentDetails: {
          ...(prev.installmentDetails || {}),
          schedule: sched,
        },
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || formData.name.trim() === '') {
      setErrorMessage('कृपया योजना / कार्यक्रमको नाम अनिवार्य रूपमा भर्नुहोस्।');
      return;
    }

    const officeAmt = Number(formData.officeCost) || 0;
    const commAmt = Number(formData.committeeCost) || 0;
    const totalAmt = officeAmt + commAmt;

    const submissionData: Partial<Project> = {
      ...formData,
      officeCost: officeAmt,
      committeeCost: commAmt,
      allocatedBudget: officeAmt,
      budget: officeAmt,
      palikaGrant: Number(formData.palikaGrant) || officeAmt,
      totalAgreementAmount: totalAmt,
      beneficiaryCount: Number(formData.beneficiaryCount) || (Number(formData.beneficiaryFemale || 0) + Number(formData.beneficiaryMale || 0)),
    };

    onSave(submissionData);
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(5px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '1080px',
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '1.25rem 1.75rem',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, #0369a1 0%, #0284c7 100%)',
            color: '#ffffff',
            position: 'sticky',
            top: 0,
            zIndex: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
              }}
            >
              <FolderGit2 size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#ffffff' }}>
                {projectToEdit ? 'योजना सम्झौता फारम सम्पादन' : 'नयाँ सम्झौता फारम (योजना सम्झौता तथा कार्यान्वयन प्रणाली)'}
              </h2>
              <p style={{ fontSize: '0.825rem', color: '#e0f2fe', margin: '2px 0 0 0' }}>
                पाँचपोखरी थाङपाल गाउँपालिका — बजेट उप-शीर्षक कार्यक्रम छनोट, लागत विवरण र किस्ता तालिका
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              cursor: 'pointer',
              color: '#ffffff',
              padding: '6px',
              borderRadius: '8px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ overflowY: 'auto', padding: '1.5rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '1.35rem' }}>
          {errorMessage && (
            <div
              style={{
                padding: '0.85rem 1.15rem',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                fontSize: '0.875rem',
                fontWeight: 600,
              }}
            >
              <AlertCircle size={20} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════════
              TOP SECTION: बजेट उप-शीर्षक कार्यक्रम छनोट (Dynamic Cascade Selector)
              ═══════════════════════════════════════════════════════════════════════ */}
          <div
            style={{
              border: '2px solid #38bdf8',
              borderRadius: '12px',
              padding: '1.15rem',
              backgroundColor: '#f0f9ff',
              boxShadow: '0 2px 8px rgba(56, 189, 248, 0.15)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0369a1', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Coins size={18} color="#0284c7" />
                <span>योजना / कार्यक्रम छनोट (बजेट उप-शीर्षक सूचीबाट स्वतः तान्नुहोस्)</span>
              </div>
              <span style={{ fontSize: '0.78rem', color: '#0284c7', backgroundColor: '#e0f2fe', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                उपलब्ध कार्यक्रम: {toNepaliNum(filteredSubHeads.length)} वटा
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '0.85rem', marginBottom: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0369a1', marginBottom: '0.3rem' }}>
                  आर्थिक वर्ष
                </label>
                <select
                  value={selectedFy}
                  onChange={(e) => setSelectedFy(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #7dd3fc', fontSize: '0.85rem', backgroundColor: '#ffffff' }}
                >
                  <option value="२०८१/०८२">२०८१/०८२ (चालु)</option>
                  <option value="२०८०/०८१">२०८०/०८१</option>
                  <option value="all">सबै आर्थिक वर्ष</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0369a1', marginBottom: '0.3rem' }}>
                  वडा/नगर स्तरिय *
                </label>
                <select
                  value={selectedLevel}
                  onChange={(e) => {
                    setSelectedLevel(e.target.value);
                    handleInputChange('level', e.target.value);
                  }}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #7dd3fc', fontSize: '0.85rem', backgroundColor: '#ffffff' }}
                >
                  <option value="नगर स्तरिय">नगर स्तरिय</option>
                  <option value="वडा स्तरिय">वडा स्तरिय</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0369a1', marginBottom: '0.3rem' }}>
                  वडा नं.
                </label>
                <select
                  value={selectedWard}
                  onChange={(e) => {
                    setSelectedWard(e.target.value);
                    if (e.target.value !== 'all') {
                      handleInputChange('wardNumber', Number(e.target.value));
                    }
                  }}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #7dd3fc', fontSize: '0.85rem', backgroundColor: '#ffffff' }}
                >
                  <option value="all">-- सबै वडाहरू / पालिका स्तर --</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
                    <option key={w} value={w}>
                      वडा नं. {toNepaliNum(w)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sub-Head Selection Dropdown */}
            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: '#0369a1', marginBottom: '0.35rem' }}>
                स्वीकृत योजना / कार्यक्रम छान्नुहोस् *
              </label>
              <select
                value={selectedSubHeadId}
                onChange={(e) => {
                  const found = allSubHeads.find((s) => s.id === e.target.value);
                  if (found) handleSelectSubHeadItem(found);
                }}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  border: '1.5px solid #0284c7',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                }}
              >
                <option value="">-- योजना / कार्यक्रम छान्नुहोस् --</option>
                {filteredSubHeads.map((sh) => (
                  <option key={sh.id} value={sh.id}>
                    [{toNepaliNum(sh.subHeadNo || '—')}] {sh.title} — रु. {sh.allocatedAmount?.toLocaleString('en-IN')} ({sh.sourceOfFund})
                  </option>
                ))}
              </select>
              <p style={{ margin: '0.35rem 0 0', fontSize: '0.75rem', color: '#0369a1' }}>
                💡 कार्यक्रम छान्नासाथ बजेट उप-शीर्षक नं., बजेट स्रोत, विनियोजित रकम र स्थलगत विवरण स्वतः भरिनेछ।
              </p>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════════════
              SECTION 1: १. नाम तथा आयोजना स्थल सम्बन्धी विवरण
              ═══════════════════════════════════════════════════════════════════════ */}
          <div style={{ border: '1px solid #cbd5e1', borderRadius: '12px', padding: '1.25rem', backgroundColor: '#f8fafc' }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Building size={18} color="#0284c7" />
              <span>१. नाम तथा आयोजना स्थल सम्बन्धी विवरण</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.95rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                    १. योजनाको नाम *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="उदा. पेमाथाङ टासी छ्योलिङ गुम्बा"
                    style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                    सह आयोजनाको नाम
                  </label>
                  <input
                    type="text"
                    value={formData.subProjectName || ''}
                    onChange={(e) => handleInputChange('subProjectName', e.target.value)}
                    placeholder="सह आयोजनाको नाम भएमा"
                    style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.9rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                    बजेट उप-शिर्षक नं.
                  </label>
                  <input
                    type="text"
                    value={formData.budgetSubHead || ''}
                    onChange={(e) => handleInputChange('budgetSubHead', e.target.value)}
                    placeholder="८०३२७५०४२०४"
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 600, color: '#0369a1' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                    बजेट स्रोत नाम *
                  </label>
                  <select
                    value={formData.budgetSource || ''}
                    onChange={(e) => handleInputChange('budgetSource', e.target.value)}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', backgroundColor: '#ffffff' }}
                  >
                    <option value="">-- बजेट स्रोत छान्नुहोस् --</option>
                    {budgetSourcesList.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                    च.नं. / निर्णय नं.
                  </label>
                  <input
                    type="text"
                    value={formData.chalaniNo || ''}
                    onChange={(e) => handleInputChange('chalaniNo', e.target.value)}
                    placeholder="उदा. ४५२/०८१"
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <NepaliDatePicker
                    label="वडा सिफारिस मिति *"
                    value={formData.wardRecommendationDateBs || ''}
                    onChange={(bs) => handleInputChange('wardRecommendationDateBs', bs)}
                    inputStyle={{ border: '1px solid #cbd5e1', padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.9rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                    सम्झौता को मार्फत *
                  </label>
                  <select
                    value={formData.marfat || 'उपभोक्ता समिति'}
                    onChange={(e) => handleInputChange('marfat', e.target.value)}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', backgroundColor: '#ffffff' }}
                  >
                    {MARFAT_OPTIONS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                    २. आयोजना स्थल *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location || ''}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="उदा. थाङपालधाप, बासखर्क"
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                    कार्य क्षेत्र (Sector)
                  </label>
                  <input
                    type="text"
                    value={formData.sector || 'पूर्वाधार विकास'}
                    onChange={(e) => handleInputChange('sector', e.target.value)}
                    placeholder="पूर्वाधार / सामाजिक विकास"
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                  ३. उद्देश्य (Project Objective)
                </label>
                <textarea
                  rows={2}
                  value={formData.objective || ''}
                  onChange={(e) => handleInputChange('objective', e.target.value)}
                  placeholder="योजना निर्माणको प्रमुख उद्देश्य..."
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>

              {/* Dates */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.9rem' }}>
                <NepaliDatePicker
                  label="सम्झौता मिति (वि.सं.)"
                  value={formData.agreementDateBs || ''}
                  onChange={(bs) => handleInputChange('agreementDateBs', bs)}
                  inputStyle={{ border: '1px solid #cbd5e1', padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                />
                <NepaliDatePicker
                  label="४. आयोजना सुरु हुने मिति *"
                  value={formData.startDateBs || ''}
                  onChange={(bs) => handleInputChange('startDateBs', bs)}
                  required
                  inputStyle={{ border: '1px solid #cbd5e1', padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                />
                <NepaliDatePicker
                  label="५. आयोजना सम्पन्न हुने मिति *"
                  value={formData.completionDateBs || ''}
                  onChange={(bs) => handleInputChange('completionDateBs', bs)}
                  required
                  inputStyle={{ border: '1px solid #cbd5e1', padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                />
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════════════
              SECTION 2: २. लागत सम्बन्धी विवरण (Cost Breakdown & Contingency)
              ═══════════════════════════════════════════════════════════════════════ */}
          <div style={{ border: '1px solid #bbf7d0', borderRadius: '12px', padding: '1.25rem', backgroundColor: '#f0fdf4' }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#166534', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Coins size={18} color="#16a34a" />
              <span>२. लागत सम्बन्धी विवरण (लागत अनुमान, अनुदान तथा कन्टिन्जेन्सी)</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.9rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#166534', marginBottom: '0.25rem' }}>
                  १. लागत अनुमान रु. *
                </label>
                <input
                  type="number"
                  required
                  value={formData.technicalEstimateAmount ?? ''}
                  onChange={(e) => handleInputChange('technicalEstimateAmount', Number(e.target.value))}
                  placeholder="उदा. ५०००००"
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #86efac', fontSize: '0.875rem', fontWeight: 700 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#166534', marginBottom: '0.25rem' }}>
                  १. कार्यालय लागत रु. *
                </label>
                <input
                  type="number"
                  required
                  value={formData.officeCost ?? ''}
                  onChange={(e) => handleInputChange('officeCost', Number(e.target.value))}
                  placeholder="उदा. ४५००००"
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #86efac', fontSize: '0.875rem', fontWeight: 700, color: '#0369a1' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#166534', marginBottom: '0.25rem' }}>
                  २. उपभोक्ता समिति लागत रु.
                </label>
                <input
                  type="number"
                  value={formData.committeeCost ?? ''}
                  onChange={(e) => handleInputChange('committeeCost', Number(e.target.value))}
                  placeholder="उदा. ५००००"
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #86efac', fontSize: '0.875rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#166534', marginBottom: '0.25rem' }}>
                  सह आयोजनाको रकम रु.
                </label>
                <input
                  type="number"
                  value={formData.communityContribution ?? ''}
                  onChange={(e) => handleInputChange('communityContribution', Number(e.target.value))}
                  placeholder="सह आयोजना रकम"
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #86efac', fontSize: '0.875rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#166534', marginBottom: '0.25rem' }}>
                  ३. उपभोक्ताको जन श्रमदान रकम रु.
                </label>
                <input
                  type="number"
                  value={formData.laborContribution ?? ''}
                  onChange={(e) => handleInputChange('laborContribution', Number(e.target.value))}
                  placeholder="उदा. २००००"
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #86efac', fontSize: '0.875rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#166534', marginBottom: '0.25rem' }}>
                  ४. कन्टिन्जेन्सी %
                </label>
                <select
                  value={formData.contingencyRatePercent ?? 3}
                  onChange={(e) => handleInputChange('contingencyRatePercent', Number(e.target.value))}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #86efac', fontSize: '0.875rem', backgroundColor: '#ffffff' }}
                >
                  <option value={3}>३.०% (मानक उपभोक्ता समिति)</option>
                  <option value={1.5}>१.५% (ठेक्का आयोजना)</option>
                  <option value={5}>५.०% (विशेष संरचना)</option>
                  <option value={0}>०% (छुट)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#166534', marginBottom: '0.25rem' }}>
                  ४. कन्टिन्जेन्सी कट्टी रकम (रु.)
                </label>
                <input
                  type="number"
                  readOnly
                  value={formData.contingencyAmount ?? 0}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #86efac', fontSize: '0.875rem', backgroundColor: '#e2e8f0', color: '#334155', fontWeight: 700 }}
                />
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════════════
              SECTION 3: ३. लाभान्वित हुने जनसंख्या (Beneficiary Population)
              ═══════════════════════════════════════════════════════════════════════ */}
          <div style={{ border: '1px solid #fed7aa', borderRadius: '12px', padding: '1.25rem', backgroundColor: '#fff7ed' }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#9a3412', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={18} color="#ea580c" />
              <span>३. लाभान्वित हुने जनसंख्या विवरण</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.9rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#9a3412', marginBottom: '0.25rem' }}>
                  १. घरपरिवार संख्या
                </label>
                <input
                  type="number"
                  value={formData.beneficiaryHouseholds ?? ''}
                  onChange={(e) => handleInputChange('beneficiaryHouseholds', Number(e.target.value))}
                  placeholder="उदा. ४५"
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #fdba74', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#9a3412', marginBottom: '0.25rem' }}>
                  २. समुदाय
                </label>
                <input
                  type="text"
                  value={formData.beneficiaryCommunity || ''}
                  onChange={(e) => handleInputChange('beneficiaryCommunity', e.target.value)}
                  placeholder="उदा. तामाङ / ह्योल्मो"
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #fdba74', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#9a3412', marginBottom: '0.25rem' }}>
                  ३. संगठित संस्था
                </label>
                <input
                  type="number"
                  value={formData.beneficiaryOrganization ?? ''}
                  onChange={(e) => handleInputChange('beneficiaryOrganization', Number(e.target.value))}
                  placeholder="उदा. २"
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #fdba74', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#9a3412', marginBottom: '0.25rem' }}>
                  महिला जनसंख्या
                </label>
                <input
                  type="number"
                  value={formData.beneficiaryFemale ?? ''}
                  onChange={(e) => handleInputChange('beneficiaryFemale', Number(e.target.value))}
                  placeholder="उदा. १२५"
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #fdba74', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#9a3412', marginBottom: '0.25rem' }}>
                  पुरुष जनसंख्या
                </label>
                <input
                  type="number"
                  value={formData.beneficiaryMale ?? ''}
                  onChange={(e) => handleInputChange('beneficiaryMale', Number(e.target.value))}
                  placeholder="उदा. १२०"
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #fdba74', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#9a3412', marginBottom: '0.25rem' }}>
                  जम्मा जनसंख्या
                </label>
                <input
                  type="number"
                  readOnly
                  value={formData.beneficiaryCount ?? 0}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #fdba74', fontSize: '0.85rem', backgroundColor: '#fed7aa', fontWeight: 700, color: '#7c2d12' }}
                />
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════════════
              SECTION 4: ४. उपभोक्ता समिति पदाधिकारी तथा अनुगमन समिति विवरण
              ═══════════════════════════════════════════════════════════════════════ */}
          <div style={{ border: '1px solid #e9d5ff', borderRadius: '12px', padding: '1.25rem', backgroundColor: '#faf5ff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#6b21a8', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UserCheck size={18} color="#9333ea" />
                <span>४. उपभोक्ता समिति पदाधिकारी तथा गठन विवरण</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={handleAddMember}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid #c084fc',
                    backgroundColor: '#ffffff',
                    color: '#6b21a8',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <Plus size={14} />
                  <span>सदस्य थप्नुहोस्</span>
                </button>
                <button
                  type="button"
                  onClick={handleAddMonitoringMember}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid #c084fc',
                    backgroundColor: '#ffffff',
                    color: '#6b21a8',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <Plus size={14} />
                  <span>अनुगमन समिति थप्नुहोस्</span>
                </button>
              </div>
            </div>

            {/* Committee Formation Details */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.9rem', marginBottom: '1rem' }}>
              <NepaliDatePicker
                label="उपभोक्ता समिति गठन मिति *"
                value={formData.committeeFormationDateBs || ''}
                onChange={(bs) => handleInputChange('committeeFormationDateBs', bs)}
                inputStyle={{ border: '1px solid #d8b4fe', padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
              />

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#6b21a8', marginBottom: '0.25rem' }}>
                  उपस्थित संख्या
                </label>
                <input
                  type="number"
                  value={formData.committeeFormationAttendees ?? ''}
                  onChange={(e) => handleInputChange('committeeFormationAttendees', Number(e.target.value))}
                  placeholder="उदा. ३५"
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #d8b4fe', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#6b21a8', marginBottom: '0.25rem' }}>
                  उपभोक्ता समितिको नाम
                </label>
                <input
                  type="text"
                  value={formData.committeeName || ''}
                  onChange={(e) => handleInputChange('committeeName', e.target.value)}
                  placeholder="उदा. पेमाथाङ टासी छ्योलिङ गुम्बा उपभोक्ता समिति"
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #d8b4fe', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            {/* 4 Core Leaders */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '0.85rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#6b21a8', marginBottom: '0.25rem' }}>
                  १. अध्यक्षको नाम
                </label>
                <input
                  type="text"
                  value={formData.committeeChair || ''}
                  onChange={(e) => handleInputChange('committeeChair', e.target.value)}
                  placeholder="अध्यक्षको नाम"
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #d8b4fe', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#6b21a8', marginBottom: '0.25rem' }}>
                  २. उपाध्यक्षको नाम
                </label>
                <input
                  type="text"
                  value={formData.committeeViceChair || ''}
                  onChange={(e) => handleInputChange('committeeViceChair', e.target.value)}
                  placeholder="उपाध्यक्षको नाम"
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #d8b4fe', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#6b21a8', marginBottom: '0.25rem' }}>
                  ३. सचिवको नाम
                </label>
                <input
                  type="text"
                  value={formData.committeeSecretary || ''}
                  onChange={(e) => handleInputChange('committeeSecretary', e.target.value)}
                  placeholder="सचिवको नाम"
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #d8b4fe', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#6b21a8', marginBottom: '0.25rem' }}>
                  ४. कोषाध्यक्षको नाम
                </label>
                <input
                  type="text"
                  value={formData.committeeTreasurer || ''}
                  onChange={(e) => handleInputChange('committeeTreasurer', e.target.value)}
                  placeholder="कोषाध्यक्षको नाम"
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #d8b4fe', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#6b21a8', marginBottom: '0.25rem' }}>
                  सम्पर्क फोन नं.
                </label>
                <input
                  type="text"
                  value={formData.committeePhone || ''}
                  onChange={(e) => handleInputChange('committeePhone', e.target.value)}
                  placeholder="९८XXXXXXXX"
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #d8b4fe', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            {/* Additional Committee Members List */}
            {formData.committeeMembers && formData.committeeMembers.length > 0 && (
              <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', padding: '0.85rem', marginBottom: '0.85rem', border: '1px solid #e9d5ff' }}>
                <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#6b21a8', marginBottom: '0.5rem' }}>
                  थप सदस्यहरू ({toNepaliNum(formData.committeeMembers.length)} जना)
                </div>
                {formData.committeeMembers.map((m: any, idx: number) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 40px', gap: '0.6rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                    <input
                      type="text"
                      placeholder="सदस्यको नाम थर"
                      value={m.name || ''}
                      onChange={(e) => handleUpdateMember(idx, 'name', e.target.value)}
                      style={{ padding: '0.45rem 0.65rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                    />
                    <select
                      value={m.gender || 'महिला'}
                      onChange={(e) => handleUpdateMember(idx, 'gender', e.target.value)}
                      style={{ padding: '0.45rem 0.65rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                    >
                      <option value="महिला">महिला</option>
                      <option value="पुरुष">पुरुष</option>
                      <option value="अन्य">अन्य</option>
                    </select>
                    <input
                      type="text"
                      placeholder="फोन नं."
                      value={m.phone || ''}
                      onChange={(e) => handleUpdateMember(idx, 'phone', e.target.value)}
                      style={{ padding: '0.45rem 0.65rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(idx)}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Monitoring Committee Members List */}
            {formData.monitoringCommitteeMembers && formData.monitoringCommitteeMembers.length > 0 && (
              <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', padding: '0.85rem', border: '1px solid #e9d5ff' }}>
                <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#6b21a8', marginBottom: '0.5rem' }}>
                  अनुगमन समिति सदस्यहरू ({toNepaliNum(formData.monitoringCommitteeMembers.length)} जना)
                </div>
                {formData.monitoringCommitteeMembers.map((m: any, idx: number) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 40px', gap: '0.6rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                    <input
                      type="text"
                      placeholder="अनुगमन सदस्यको नाम"
                      value={m.name || ''}
                      onChange={(e) => handleUpdateMonitoringMember(idx, 'name', e.target.value)}
                      style={{ padding: '0.45rem 0.65rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                    />
                    <input
                      type="text"
                      placeholder="पद / भूमिका"
                      value={m.role || 'सदस्य'}
                      onChange={(e) => handleUpdateMonitoringMember(idx, 'role', e.target.value)}
                      style={{ padding: '0.45rem 0.65rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                    />
                    <input
                      type="text"
                      placeholder="फोन नं."
                      value={m.phone || ''}
                      onChange={(e) => handleUpdateMonitoringMember(idx, 'phone', e.target.value)}
                      style={{ padding: '0.45rem 0.65rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveMonitoringMember(idx)}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ═══════════════════════════════════════════════════════════════════════
              SECTION 5: ५. किस्ता भुक्तानी तालिका (Installment Schedule Table)
              ═══════════════════════════════════════════════════════════════════════ */}
          <div style={{ border: '1px solid #93c5fd', borderRadius: '12px', padding: '1.25rem', backgroundColor: '#eff6ff' }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1e40af', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={18} color="#2563eb" />
              <span>५. किस्ता भुक्तानी तालिका (Installment Release Schedule)</span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#dbeafe', color: '#1e40af', borderBottom: '1px solid #bfdbfe' }}>
                    <th style={{ padding: '0.55rem', textAlign: 'left', width: '120px' }}>किस्ता</th>
                    <th style={{ padding: '0.55rem', textAlign: 'left', width: '160px' }}>मिति</th>
                    <th style={{ padding: '0.55rem', textAlign: 'left', width: '160px' }}>रकम (रु.)</th>
                    <th style={{ padding: '0.55rem', textAlign: 'left' }}>निर्माण सामग्री परिमाण</th>
                    <th style={{ padding: '0.55rem', textAlign: 'left' }}>कैफियत</th>
                  </tr>
                </thead>
                <tbody>
                  {(formData.installmentDetails?.schedule || []).map((row: any, idx: number) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #e0f2fe' }}>
                      <td style={{ padding: '0.55rem', fontWeight: 700, color: '#1e40af' }}>
                        {row.phase}
                      </td>
                      <td style={{ padding: '0.55rem' }}>
                        <input
                          type="text"
                          placeholder="२०८१-०४-१५"
                          value={row.dateBs || ''}
                          onChange={(e) => handleUpdateInstallment(idx, 'dateBs', e.target.value)}
                          style={{ width: '100%', padding: '0.4rem 0.55rem', borderRadius: '4px', border: '1px solid #bfdbfe', fontSize: '0.8rem' }}
                        />
                      </td>
                      <td style={{ padding: '0.55rem' }}>
                        <input
                          type="number"
                          placeholder="रकम"
                          value={row.amount || ''}
                          onChange={(e) => handleUpdateInstallment(idx, 'amount', Number(e.target.value))}
                          style={{ width: '100%', padding: '0.4rem 0.55rem', borderRadius: '4px', border: '1px solid #bfdbfe', fontSize: '0.8rem', fontWeight: 700, color: '#0369a1' }}
                        />
                      </td>
                      <td style={{ padding: '0.55rem' }}>
                        <input
                          type="text"
                          placeholder="परिमाण / विवरण"
                          value={row.materialsQty || ''}
                          onChange={(e) => handleUpdateInstallment(idx, 'materialsQty', e.target.value)}
                          style={{ width: '100%', padding: '0.4rem 0.55rem', borderRadius: '4px', border: '1px solid #bfdbfe', fontSize: '0.8rem' }}
                        />
                      </td>
                      <td style={{ padding: '0.55rem' }}>
                        <input
                          type="text"
                          placeholder="कैफियत"
                          value={row.remarks || ''}
                          onChange={(e) => handleUpdateInstallment(idx, 'remarks', e.target.value)}
                          style={{ width: '100%', padding: '0.4rem 0.55rem', borderRadius: '4px', border: '1px solid #bfdbfe', fontSize: '0.8rem' }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════════════
              SECTION 6: ६. सिफारिसकर्ता तथा स्वीकृति (Signatories & Approval)
              ═══════════════════════════════════════════════════════════════════════ */}
          <div style={{ border: '1px solid #cbd5e1', borderRadius: '12px', padding: '1.25rem', backgroundColor: '#f8fafc' }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={18} color="#0284c7" />
              <span>६. सम्झौता सिफारिस तथा स्वीकृति (Signatories & Official Approval)</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.15rem', marginBottom: '1.25rem' }}>
              {/* Technical Recommendation */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.85rem', backgroundColor: '#ffffff' }}>
                <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#0369a1', marginBottom: '0.5rem' }}>
                  स्थानीय तह प्राविधिक सिफारिसकर्ता
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <select
                    value={formData.signatories?.technicalRecommenderName || ''}
                    onChange={(e) => {
                      const emp = employees.find((x) => (x.fullName || x.full_name) === e.target.value);
                      setFormData((prev) => ({
                        ...prev,
                        responsibleEngineer: e.target.value,
                        signatories: {
                          ...(prev.signatories || {}),
                          technicalRecommenderName: e.target.value,
                          technicalRecommenderDesignation: emp?.designation || 'सब-इन्जिनियर',
                        },
                      }));
                    }}
                    style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.8rem', backgroundColor: '#ffffff' }}
                  >
                    <option value="">-- प्राविधिक कर्मचारी छान्नुहोस् --</option>
                    {employees.map((emp) => {
                      const name = emp.fullName || emp.full_name;
                      return (
                        <option key={emp.id} value={name}>
                          {name} ({emp.designation || 'प्राविधिक'})
                        </option>
                      );
                    })}
                  </select>
                  <input
                    type="text"
                    placeholder="पद / दर्जा (उदा. सब-इन्जिनियर)"
                    value={formData.signatories?.technicalRecommenderDesignation || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        signatories: { ...(prev.signatories || {}), technicalRecommenderDesignation: e.target.value },
                      }))
                    }
                    style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                  />
                </div>
              </div>

              {/* Administrative Approver (CAO) */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.85rem', backgroundColor: '#ffffff' }}>
                <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#0369a1', marginBottom: '0.5rem' }}>
                  सम्झौता स्वीकृत गर्ने (CAO / प्रशासकीय अधिकृत)
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <select
                    value={formData.signatories?.approverName || ''}
                    onChange={(e) => {
                      const emp = employees.find((x) => (x.fullName || x.full_name) === e.target.value);
                      setFormData((prev) => ({
                        ...prev,
                        signatories: {
                          ...(prev.signatories || {}),
                          approverName: e.target.value,
                          approverDesignation: emp?.designation || 'प्रमुख प्रशासकीय अधिकृत',
                        },
                      }));
                    }}
                    style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.8rem', backgroundColor: '#ffffff' }}
                  >
                    <option value="">-- प्रशासकीय अधिकृत छान्नुहोस् --</option>
                    {employees.map((emp) => {
                      const name = emp.fullName || emp.full_name;
                      return (
                        <option key={emp.id} value={name}>
                          {name} ({emp.designation || 'अधिकृत'})
                        </option>
                      );
                    })}
                  </select>
                  <input
                    type="text"
                    placeholder="पद (उदा. प्रमुख प्रशासकीय अधिकृत)"
                    value={formData.signatories?.approverDesignation || 'प्रमुख प्रशासकीय अधिकृत'}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        signatories: { ...(prev.signatories || {}), approverDesignation: e.target.value },
                      }))
                    }
                    style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                  />
                </div>
              </div>
            </div>

            {/* Approval Checkbox (Matching HTML prompt) */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                backgroundColor: formData.agreementStatus === 'approved' ? '#ecfdf5' : '#f1f5f9',
                padding: '0.85rem 1.15rem',
                borderRadius: '8px',
                border: formData.agreementStatus === 'approved' ? '1.5px solid #10b981' : '1px solid #cbd5e1',
                cursor: 'pointer',
              }}
              onClick={() => {
                const isCurrentlyApproved = formData.agreementStatus === 'approved';
                if (!isCurrentlyApproved) {
                  if (confirm('एक पटक स्वीकृत गरिएको योजना सम्झौता फारम सुरक्षित भएपछि सम्झौता सक्रिय हुनेछ। के तपाईं सम्झौता स्वीकृत गर्न चाहनुहुन्छ?')) {
                    handleInputChange('agreementStatus', 'approved');
                    handleInputChange('status', 'approved');
                  }
                } else {
                  handleInputChange('agreementStatus', 'draft');
                  handleInputChange('status', 'planned');
                }
              }}
            >
              {formData.agreementStatus === 'approved' ? (
                <CheckSquare size={22} color="#059669" />
              ) : (
                <Square size={22} color="#64748b" />
              )}
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.875rem', color: formData.agreementStatus === 'approved' ? '#065f46' : '#334155' }}>
                  सम्झौता स्वीकृत गर्नुहोस (Approve Agreement)
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  सम्झौता स्वीकृत गरेपछि यो योजना कार्यान्वयन तथा किस्ता निकासाका लागि योग्य हुनेछ।
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: '0.85rem',
              paddingTop: '1rem',
              borderTop: '1px solid #e2e8f0',
              position: 'sticky',
              bottom: 0,
              backgroundColor: '#ffffff',
              zIndex: 10,
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                padding: '0.65rem 1.35rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#475569',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'pointer',
              }}
            >
              रद्द गर्नुहोस्
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1.65rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#0284c7',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 6px rgba(2, 132, 199, 0.3)',
              }}
            >
              <Save size={18} />
              <span>{isSubmitting ? 'सुरक्षित हुँदैछ...' : projectToEdit ? 'परिवर्तन सुरक्षित गर्नुहोस्' : 'सम्झौता सुरक्षित गर्नुहोस्'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
