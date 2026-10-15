import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { organizationsApi } from '../../api/organizations';
import type { Organization, OrgType, OrgStatus, CommitteeMember, OrgRenewal, OrgAgreement, OrgProgram, OrgAudit } from '../../types/organization';
import orgsFallbackData from '../../organizations-data.json';
import {
  Building,
  CheckCircle2,
  AlertCircle,
  Clock,
  Search,
  Plus,
  RefreshCw,
  Phone,
  MapPin,
  FileCheck,
  Users,
  FileText,
  DollarSign,
  Printer,
  X,
  Eye,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  Award,
  ChevronRight,
  BookOpen,
} from 'lucide-react';

type ActiveTab = 'directory' | 'renewals' | 'members' | 'agreements' | 'programs' | 'audits';

export const OrganizationsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<ActiveTab>('directory');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<OrgType | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<OrgStatus | 'all'>('all');
  const [selectedWard, setSelectedWard] = useState<number | 'all'>('all');

  // Modals state
  const [selectedOrgForView, setSelectedOrgForView] = useState<Organization | null>(null);
  const [modalSubTab, setModalSubTab] = useState<'profile' | 'members' | 'renewals' | 'agreements' | 'audits'>('profile');
  const [showAddOrgModal, setShowAddOrgModal] = useState(false);
  const [addOrgStep, setAddOrgStep] = useState<1 | 2>(1);
  const [showAddRenewalModal, setShowAddRenewalModal] = useState(false);
  const [showAddAgreementModal, setShowAddAgreementModal] = useState(false);

  // New Organization Form State
  const [newOrgForm, setNewOrgForm] = useState({
    name: '',
    nameEn: '',
    type: 'ngo' as OrgType,
    wardNo: 3,
    address: '',
    executiveHead: '',
    phone: '',
    email: '',
    registrationNo: '',
    registrationDate: '२०८०/०१/१५',
    suchikritMiti: '२०८०/०६/०१',
    registrationNikaya: 'गाउँपालिका सामाजिक विकास शाखा',
    panNo: '',
    sector: 'सामाजिक विकास',
    objectives: '',
  });

  // New Renewal Form State
  const [newRenewalForm, setNewRenewalForm] = useState({
    orgId: '',
    fiscalYear: '2080/081',
    renewalDate: '२०८०/०६/०१',
    fee: 1500,
    receiptNo: `PTRM-RN-${Math.floor(100 + Math.random() * 900)}`,
    remarks: 'नियमित नवीकरण',
  });

  // New Agreement Form State
  const [newAgreementForm, setNewAgreementForm] = useState({
    orgId: '',
    subject: '',
    fiscalYear: '2080/081',
    totalBudget: 1000000,
    palikaBudget: 700000,
    orgBudget: 300000,
    donorAgency: 'गाउँपालिका योजना शाखा',
    agreementDate: '२०८०/०६/०१',
    endDate: '२०८१/०३/३०',
    terms: '',
  });

  // Data Query with local fallback
  const {
    data: organizationsData = [],
    isLoading,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['organizations', selectedType, selectedStatus, selectedWard],
    queryFn: async () => {
      try {
        const res = await organizationsApi.getAll({
          type: selectedType,
          status: selectedStatus,
          wardNo: selectedWard,
        });
        if (Array.isArray(res) && res.length > 0) return res;
      } catch (e) {
        console.warn('API error, falling back to local dataset:', e);
      }
      return (orgsFallbackData as any[]) || [];
    },
    staleTime: 1000 * 60 * 5,
  });

  // Normalized safe organizations list
  const safeOrganizations: Organization[] = useMemo(() => {
    const list = Array.isArray(organizationsData) && organizationsData.length > 0
      ? organizationsData
      : (orgsFallbackData as any[]);

    return list.map((item: any) => ({
      ...item,
      wardNo: item.wardNo || item.wardNumber || 3,
      executiveHead: item.executiveHead || item.chairperson || '-',
      panNo: item.panNo || item.pan || '-',
      committeeMembers: item.committeeMembers || item.members || [],
      renewals: item.renewals || [],
      agreements: item.agreements || [],
      programs: item.programs || [],
      audits: item.audits || [],
    }));
  }, [organizationsData]);

  // Client-side search & filtering
  const filteredOrganizations = useMemo(() => {
    return safeOrganizations.filter((org) => {
      const matchesType = selectedType === 'all' || org.type === selectedType;
      const matchesStatus = selectedStatus === 'all' || org.status === selectedStatus;
      const matchesWard = selectedWard === 'all' || Number(org.wardNo) === Number(selectedWard);

      let matchesSearch = true;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        matchesSearch =
          (org.name?.toLowerCase().includes(term) ?? false) ||
          (org.nameEn?.toLowerCase().includes(term) ?? false) ||
          (org.registrationNo?.toLowerCase().includes(term) ?? false) ||
          (org.executiveHead?.toLowerCase().includes(term) ?? false) ||
          (org.sector?.toLowerCase().includes(term) ?? false);
      }
      return matchesType && matchesStatus && matchesWard && matchesSearch;
    });
  }, [safeOrganizations, selectedType, selectedStatus, selectedWard, searchTerm]);

  // Aggregate Lists for sub-tabs
  const allRenewals = useMemo(() => {
    const list: Array<OrgRenewal & { orgName: string; orgId: string; wardNo?: number }> = [];
    filteredOrganizations.forEach((org) => {
      if (org.renewals && Array.isArray(org.renewals)) {
        org.renewals.forEach((r) => {
          list.push({ ...r, orgName: org.name, orgId: org.id, wardNo: org.wardNo });
        });
      }
    });
    return list;
  }, [filteredOrganizations]);

  const allMembers = useMemo(() => {
    const list: Array<CommitteeMember & { orgName: string; orgId: string }> = [];
    filteredOrganizations.forEach((org) => {
      if (org.committeeMembers && Array.isArray(org.committeeMembers)) {
        org.committeeMembers.forEach((m) => {
          list.push({ ...m, orgName: org.name, orgId: org.id });
        });
      }
    });
    return list;
  }, [filteredOrganizations]);

  const allAgreements = useMemo(() => {
    const list: Array<OrgAgreement & { orgName: string; orgId: string; wardNo?: number }> = [];
    filteredOrganizations.forEach((org) => {
      if (org.agreements && Array.isArray(org.agreements)) {
        org.agreements.forEach((a) => {
          list.push({ ...a, orgName: org.name, orgId: org.id, wardNo: org.wardNo });
        });
      }
    });
    return list;
  }, [filteredOrganizations]);

  const allPrograms = useMemo(() => {
    const list: Array<OrgProgram & { orgName: string; orgId: string }> = [];
    filteredOrganizations.forEach((org) => {
      if (org.programs && Array.isArray(org.programs)) {
        org.programs.forEach((p) => {
          list.push({ ...p, orgName: org.name, orgId: org.id });
        });
      }
    });
    return list;
  }, [filteredOrganizations]);

  const allAudits = useMemo(() => {
    const list: Array<OrgAudit & { orgName: string; orgId: string }> = [];
    filteredOrganizations.forEach((org) => {
      if (org.audits && Array.isArray(org.audits)) {
        org.audits.forEach((au) => {
          list.push({ ...au, orgName: org.name, orgId: org.id });
        });
      }
    });
    return list;
  }, [filteredOrganizations]);

  // Overall KPIs
  const stats = useMemo(() => {
    const total = safeOrganizations.length;
    const active = safeOrganizations.filter((o) => o.status === 'active').length;
    const renewedThisFy = safeOrganizations.filter((o) =>
      o.renewals?.some((r) => r.fiscalYear === '2080/081')
    ).length;

    let totalAgreements = 0;
    let totalBudget = 0;
    safeOrganizations.forEach((o) => {
      if (o.agreements) {
        totalAgreements += o.agreements.length;
        o.agreements.forEach((a) => (totalBudget += Number(a.totalBudget || 0)));
      }
    });

    return { total, active, renewedThisFy, totalAgreements, totalBudget };
  }, [safeOrganizations]);

  const getTypeLabel = (type: OrgType): { label: string; badge: string } => {
    switch (type) {
      case 'cooperative':
        return { label: 'सहकारी संस्था', badge: 'dt-badge-info' };
      case 'ngo':
        return { label: 'गैर-सरकारी संस्था (NGO)', badge: 'dt-badge-success' };
      case 'ingo':
        return { label: 'अन्तर्राष्ट्रिय संस्था (INGO)', badge: 'dt-badge-info' };
      case 'club':
        return { label: 'युवा/खेलकुद क्लब', badge: 'dt-badge-warning' };
      case 'community':
        return { label: 'सामुदायिक संस्था', badge: 'dt-badge-success' };
      case 'government':
        return { label: 'सरकारी निकाय', badge: 'dt-badge-info' };
      default:
        return { label: type, badge: 'dt-badge-warning' };
    }
  };

  const getStatusBadge = (status: OrgStatus) => {
    switch (status) {
      case 'active':
        return (
          <span className="dt-badge dt-badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle2 size={12} /> सक्रिय
          </span>
        );
      case 'expired':
        return (
          <span className="dt-badge dt-badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <AlertCircle size={12} /> नवीकरण बाँकी
          </span>
        );
      case 'pending':
        return (
          <span className="dt-badge dt-badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={12} /> प्रक्रियामा
          </span>
        );
      default:
        return <span className="dt-badge dt-badge-danger">निष्क्रिय</span>;
    }
  };

  // Submit Handler: Add Organization
  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgForm.name.trim()) return;

    const newOrg: any = {
      id: `org-${Date.now()}`,
      name: newOrgForm.name.trim(),
      nameEn: newOrgForm.nameEn.trim(),
      type: newOrgForm.type,
      wardNo: Number(newOrgForm.wardNo) || 3,
      wardNumber: Number(newOrgForm.wardNo) || 3,
      address: newOrgForm.address.trim(),
      executiveHead: newOrgForm.executiveHead.trim(),
      chairperson: newOrgForm.executiveHead.trim(),
      phone: newOrgForm.phone.trim(),
      email: newOrgForm.email.trim(),
      registrationNo: newOrgForm.registrationNo.trim() || `${Math.floor(10 + Math.random() * 90)}/२०८०`,
      registrationDate: newOrgForm.registrationDate,
      suchikritMiti: newOrgForm.suchikritMiti,
      registrationNikaya: newOrgForm.registrationNikaya,
      panNo: newOrgForm.panNo.trim(),
      pan: newOrgForm.panNo.trim(),
      sector: newOrgForm.sector,
      objectives: newOrgForm.objectives.trim(),
      status: 'active',
      isActive: true,
      committeeMembers: [],
      renewals: [
        {
          id: `rn-${Date.now()}`,
          fiscalYear: '2080/081',
          renewalDate: '२०८०/०६/०१',
          fee: 1500,
          receiptNo: `PTRM-RN-${Math.floor(100 + Math.random() * 900)}`,
          validUntil: '२०८१/०३/३२',
          remarks: 'नयाँ दर्ता तथा सूचीकरण',
        },
      ],
      agreements: [],
      programs: [],
      audits: [],
    };

    try {
      await organizationsApi.create(newOrg);
    } catch (err) {
      console.warn('API save warning:', err);
    }

    queryClient.setQueryData(
      ['organizations', selectedType, selectedStatus, selectedWard],
      (prev: any) => [newOrg, ...(Array.isArray(prev) ? prev : safeOrganizations)]
    );

    alert(`संस्था "${newOrg.name}" सफलतापूर्वक दर्ता भयो!`);
    setShowAddOrgModal(false);
    setAddOrgStep(1);
    setNewOrgForm({
      name: '',
      nameEn: '',
      type: 'ngo',
      wardNo: 3,
      address: '',
      executiveHead: '',
      phone: '',
      email: '',
      registrationNo: '',
      registrationDate: '२०८०/०१/१५',
      suchikritMiti: '२०८०/०६/०१',
      registrationNikaya: 'गाउँपालिका सामाजिक विकास शाखा',
      panNo: '',
      sector: 'सामाजिक विकास',
      objectives: '',
    });
  };

  // Submit Handler: Add Renewal
  const handleCreateRenewal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRenewalForm.orgId) {
      alert('कृपया सम्बन्धित संस्था छनोट गर्नुहोस्।');
      return;
    }

    const org = safeOrganizations.find((o) => o.id === newRenewalForm.orgId);
    if (!org) return;

    const newRenewal: OrgRenewal = {
      id: `rn-${Date.now()}`,
      fiscalYear: newRenewalForm.fiscalYear,
      renewalDate: newRenewalForm.renewalDate,
      fee: Number(newRenewalForm.fee) || 1500,
      receiptNo: newRenewalForm.receiptNo,
      validUntil: '२०८१/०३/३२',
      remarks: newRenewalForm.remarks,
    };

    if (!org.renewals) org.renewals = [];
    org.renewals.unshift(newRenewal);

    queryClient.setQueryData(
      ['organizations', selectedType, selectedStatus, selectedWard],
      [...safeOrganizations]
    );

    alert(`संस्था "${org.name}" को आ.व. ${newRenewal.fiscalYear} को नवीकरण दर्ता भयो!`);
    setShowAddRenewalModal(false);
  };

  // Submit Handler: Add Agreement
  const handleCreateAgreement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgreementForm.orgId || !newAgreementForm.subject.trim()) {
      alert('कृपया संस्था र सम्झौताको विषय प्रविष्ट गर्नुहोस्।');
      return;
    }

    const org = safeOrganizations.find((o) => o.id === newAgreementForm.orgId);
    if (!org) return;

    const newAgreement: OrgAgreement = {
      id: `agr-${Date.now()}`,
      subject: newAgreementForm.subject.trim(),
      fiscalYear: newAgreementForm.fiscalYear,
      totalBudget: Number(newAgreementForm.totalBudget) || 1000000,
      palikaBudget: Number(newAgreementForm.palikaBudget) || 700000,
      orgBudget: Number(newAgreementForm.orgBudget) || 300000,
      donorAgency: newAgreementForm.donorAgency.trim(),
      agreementDate: newAgreementForm.agreementDate,
      endDate: newAgreementForm.endDate,
      status: 'active',
      terms: newAgreementForm.terms.trim(),
    };

    if (!org.agreements) org.agreements = [];
    org.agreements.unshift(newAgreement);

    queryClient.setQueryData(
      ['organizations', selectedType, selectedStatus, selectedWard],
      [...safeOrganizations]
    );

    alert(`नयाँ योजना सम्झौता "${newAgreement.subject}" दर्ता भयो!`);
    setShowAddAgreementModal(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '3rem' }}>
      {/* Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
          color: '#ffffff',
          borderRadius: '16px',
          padding: '2rem',
          boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(255,255,255,0.12)', padding: '0.35rem 0.85rem', borderRadius: '9999px', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
              <ShieldCheck size={14} color="#818cf8" />
              <span>Dolphin-Trap System Integrated • स्थानीय सरकार सञ्चालन ऐन २०७४</span>
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
              संघसंस्था तथा गैरसरकारी संस्था व्यवस्थापन प्रणाली
            </h1>
            <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)', margin: '0.5rem 0 0 0', maxWidth: '820px', lineHeight: 1.5 }}>
              पाँचपोखरी थाङपाल गाउँपालिकामा दर्ता तथा सूचिकृत गैरसरकारी संस्था (NGOs), क्लब, महिला सहकारी, सामुदायिक समूह तथा साझेदार निकायहरूको एकीकृत प्रोफाइल, वार्षिक नवीकरण, कार्यसमिति, द्विपक्षीय सम्झौता (MoU), बजेट परिचालन र प्रगति अभिलेख प्रणाली।
            </p>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
            <button
              onClick={() => refetch()}
              className="dt-btn dt-btn-outline"
              style={{ backgroundColor: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.2)', color: '#ffffff' }}
              disabled={isFetching}
              title="रिफ्रेस गर्नुहोस्"
            >
              <RefreshCw size={15} className={isFetching ? 'animate-spin' : ''} />
              <span>रिफ्रेस</span>
            </button>
            <button
              onClick={() => setShowAddRenewalModal(true)}
              className="dt-btn"
              style={{ backgroundColor: '#f59e0b', color: '#ffffff', fontWeight: 600 }}
            >
              <FileCheck size={15} />
              <span>नयाँ नवीकरण</span>
            </button>
            <button
              onClick={() => setShowAddAgreementModal(true)}
              className="dt-btn"
              style={{ backgroundColor: '#0284c7', color: '#ffffff', fontWeight: 600 }}
            >
              <FileText size={15} />
              <span>सम्झौता दर्ता</span>
            </button>
            <button
              onClick={() => {
                setAddOrgStep(1);
                setShowAddOrgModal(true);
              }}
              className="dt-btn"
              style={{ backgroundColor: '#4338ca', color: '#ffffff', fontWeight: 700 }}
            >
              <Plus size={16} />
              <span>नयाँ संस्था दर्ता</span>
            </button>
          </div>
        </div>

        {/* Top 5 KPI Metrics Strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
          <div style={{ backgroundColor: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', padding: '1rem' }}>
            <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)' }}>कुल दर्ता संस्था</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fcd34d' }}>{stats.total}</div>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)' }}>गाउँपालिकामा सूचिकृत</div>
          </div>

          <div style={{ backgroundColor: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', padding: '1rem' }}>
            <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)' }}>सक्रिय संस्थाहरू</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#34d399' }}>{stats.active}</div>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)' }}>नियमित सञ्चालित</div>
          </div>

          <div style={{ backgroundColor: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', padding: '1rem' }}>
            <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)' }}>नवीकृत (२०८०/८१)</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#60a5fa' }}>{stats.renewedThisFy}</div>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)' }}>चालु आ.व. मा प्रमाणित</div>
          </div>

          <div style={{ backgroundColor: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', padding: '1rem' }}>
            <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)' }}>साझेदारी सम्झौता (MoU)</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#a78bfa' }}>{stats.totalAgreements}</div>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)' }}>पालिका संयुक्त आयोजना</div>
          </div>

          <div style={{ backgroundColor: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', padding: '1rem' }}>
            <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)' }}>परिचालित साझेदारी बजेट</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fbbf24' }}>
              रु. {stats.totalBudget.toLocaleString('en-IN')}/-
            </div>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)' }}>विकास तथा लक्षित कार्यक्रम</div>
          </div>
        </div>
      </div>

      {/* ── Ultra-Premium Segmented Tab Navigation ─────────────────── */}
      <div
        style={{
          background: '#f8fafc',
          borderRadius: '20px',
          border: '1px solid #e2e8f0',
          padding: '12px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.02)',
          alignItems: 'stretch'
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', flex: 1 }}>
          {[
            { id: 'directory', label: `संस्था निर्देशिका (${filteredOrganizations.length})`, desc: 'Directory', icon: <Building size={20} /> },
            { id: 'renewals', label: `वार्षिक नवीकरण (${allRenewals.length})`, desc: 'Renewals', icon: <FileCheck size={20} /> },
            { id: 'members', label: `कार्यसमिति पदाधिकारी (${allMembers.length})`, desc: 'Committee', icon: <Users size={20} /> },
            { id: 'agreements', label: `द्विपक्षीय सम्झौता (${allAgreements.length})`, desc: 'MoU Agreements', icon: <FileText size={20} /> },
            { id: 'programs', label: `कार्यक्रम तथा बजेट (${allPrograms.length})`, desc: 'Programs & Budget', icon: <Layers size={20} /> },
            { id: 'audits', label: `साधारण सभा तथा अडिट (${allAudits.length})`, desc: 'Audits', icon: <BookOpen size={20} /> },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ActiveTab)}
                style={{
                  flex: '1 1 200px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  gap: '12px',
                  padding: '12px 18px',
                  borderRadius: '14px',
                  border: isActive ? '1.5px solid rgba(59, 130, 246, 0.4)' : '1.5px solid transparent',
                  background: isActive 
                    ? 'linear-gradient(145deg, #ffffff 0%, #f0f9ff 100%)' 
                    : '#ffffff',
                  color: isActive ? '#1e40af' : '#475569',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: isActive
                    ? '0 6px 16px rgba(59, 130, 246, 0.12), 0 2px 4px rgba(59, 130, 246, 0.04)'
                    : '0 2px 6px rgba(0,0,0,0.03)',
                  outline: 'none',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.06)';
                    e.currentTarget.style.color = '#0f172a';
                    e.currentTarget.style.borderColor = '#e2e8f0';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.03)';
                    e.currentTarget.style.color = '#475569';
                    e.currentTarget.style.borderColor = 'transparent';
                  }
                }}
              >
                {isActive && (
                  <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: '#3b82f6', borderRadius: '4px 0 0 4px' }} />
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', zIndex: 1, width: '100%' }}>
                  <span style={{ 
                    color: isActive ? '#2563eb' : '#64748b', 
                    display: 'flex', 
                    alignItems: 'center',
                    background: isActive ? '#dbeafe' : '#f1f5f9',
                    padding: '8px',
                    borderRadius: '10px',
                    transition: 'all 0.3s'
                  }}>
                    {tab.icon}
                  </span>
                  <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '14px', fontWeight: isActive ? 700 : 600 }}>{tab.label}</span>
                    <span style={{ fontSize: '11px', color: isActive ? '#3b82f6' : '#94a3b8', fontWeight: 500, marginTop: '2px' }}>
                      {tab.desc}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        
        <button
          onClick={() => window.print()}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '12px 24px',
            borderRadius: '14px',
            border: '1.5px solid #e2e8f0',
            background: '#ffffff',
            color: '#475569',
            fontWeight: 600,
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
          }}
          title="प्रिन्ट गर्नुहोस्"
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.06)';
            e.currentTarget.style.borderColor = '#cbd5e1';
            e.currentTarget.style.color = '#0f172a';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.03)';
            e.currentTarget.style.borderColor = '#e2e8f0';
            e.currentTarget.style.color = '#475569';
          }}
        >
          <Printer size={20} />
          <span>प्रिन्ट</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="dt-card" style={{ padding: '0.85rem 1.25rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
        <div style={{ flex: '1 1 240px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="dt-input"
            style={{ paddingLeft: '32px' }}
            placeholder="संस्थाको नाम, दर्ता नं., अध्यक्ष वा कार्यक्षेत्र खोज्नुहोस्..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="dt-select"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value as OrgType | 'all')}
          style={{ width: '160px' }}
        >
          <option value="all">सबै संस्था प्रकार</option>
          <option value="ngo">गैर-सरकारी संस्था (NGO)</option>
          <option value="cooperative">सहकारी संस्था</option>
          <option value="club">युवा/खेलकुद क्लब</option>
          <option value="community">सामुदायिक संस्था</option>
          <option value="private">निजी/कम्पनी</option>
        </select>

        <select
          className="dt-select"
          value={selectedWard}
          onChange={(e) => setSelectedWard(e.target.value === 'all' ? 'all' : Number(e.target.value))}
          style={{ width: '130px' }}
        >
          <option value="all">सबै वडा</option>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
            <option key={w} value={w}>वडा नं. {w}</option>
          ))}
        </select>

        <select
          className="dt-select"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value as OrgStatus | 'all')}
          style={{ width: '140px' }}
        >
          <option value="all">सबै स्थिति</option>
          <option value="active">सक्रिय (Active)</option>
          <option value="expired">नवीकरण बाँकी</option>
          <option value="pending">प्रक्रियामा</option>
        </select>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TAB 1: ORGANIZATIONS DIRECTORY
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'directory' && (
        <div className="dt-table-wrapper">
          <div className="dt-responsive-table-wrapper">
<table className="dt-table">
            <thead>
              <tr>
                <th>संस्थाको नाम / ठेगाना</th>
                <th>प्रकार</th>
                <th>दर्ता नं. र मिति</th>
                <th>नेतृत्व / अध्यक्ष</th>
                <th>सम्पर्क विवरण</th>
                <th>कार्यक्षेत्र (Sector)</th>
                <th>नवीकरण स्थिति</th>
                <th>स्थिति</th>
                <th style={{ textAlign: 'right' }}>कार्य</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '3rem' }}>
                    <RefreshCw size={20} className="animate-spin" />
                    <span style={{ marginLeft: '8px' }}>डेटा लोड हुँदैछ...</span>
                  </td>
                </tr>
              ) : filteredOrganizations.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    कुनै पनि संस्था फेला परेन।
                  </td>
                </tr>
              ) : (
                filteredOrganizations.map((org) => {
                  const typeInfo = getTypeLabel(org.type);
                  const latestRenewal = org.renewals && org.renewals[0] ? org.renewals[0].fiscalYear : 'अनविज्ञ';

                  return (
                    <tr key={org.id || org.registrationNo}>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{org.name}</div>
                        {org.nameEn && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{org.nameEn}</div>}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          <MapPin size={12} />
                          <span>वडा नं. {org.wardNo}, {org.address || 'पाँचपोखरी थाङपाल'}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`dt-badge ${typeInfo.badge}`}>{typeInfo.label}</span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{org.registrationNo}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>दर्ता: {org.registrationDate || '-'}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{org.executiveHead}</div>
                        {org.panNo && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PAN: {org.panNo}</div>}
                      </td>
                      <td>
                        {org.phone && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.78rem' }}>
                            <Phone size={12} color="var(--primary)" />
                            <a href={`tel:${org.phone}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                              {org.phone}
                            </a>
                          </div>
                        )}
                        {org.email && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{org.email}</div>}
                      </td>
                      <td>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{org.sector || '-'}</span>
                      </td>
                      <td>
                        <span className="dt-badge dt-badge-success" style={{ fontSize: '0.72rem' }}>
                          आ.व. {latestRenewal}
                        </span>
                      </td>
                      <td>{getStatusBadge(org.status)}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => {
                            setSelectedOrgForView(org);
                            setModalSubTab('profile');
                          }}
                          className="dt-btn dt-btn-outline"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                        >
                          <Eye size={13} />
                          <span>विवरण</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
</div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 2: ANNUAL RENEWALS
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'renewals' && (
        <div className="dt-table-wrapper">
          <div className="dt-responsive-table-wrapper">
<table className="dt-table">
            <thead>
              <tr>
                <th>संस्थाको नाम</th>
                <th>आर्थिक वर्ष</th>
                <th>नवीकरण मिति (B.S.)</th>
                <th>राजस्व दस्तुर (रु.)</th>
                <th>रसिद नम्बर</th>
                <th>नवीकृत म्याद</th>
                <th>कैफियत / स्थिति</th>
              </tr>
            </thead>
            <tbody>
              {allRenewals.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    कुनै पनि नवीकरण रेकर्ड फेला परेन।
                  </td>
                </tr>
              ) : (
                allRenewals.map((r, i) => (
                  <tr key={r.id || i}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--primary)' }}>{r.orgName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>वडा नं. {r.wardNo || '-'}</div>
                    </td>
                    <td>
                      <span className="dt-badge dt-badge-info" style={{ fontWeight: 600 }}>{r.fiscalYear}</span>
                    </td>
                    <td>{r.renewalDate}</td>
                    <td style={{ fontWeight: 700, color: '#059669' }}>रु. {(r.fee || 0).toLocaleString('en-IN')}</td>
                    <td><code>{r.receiptNo || '-'}</code></td>
                    <td>{r.validUntil || '-'}</td>
                    <td>
                      <span className="dt-badge dt-badge-success">{r.remarks || 'प्रमाणीकृत'}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
</div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 3: COMMITTEE MEMBERS
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'members' && (
        <div className="dt-table-wrapper">
          <div className="dt-responsive-table-wrapper">
<table className="dt-table">
            <thead>
              <tr>
                <th>सम्बन्धित संस्था</th>
                <th>पद (Designation)</th>
                <th>पदाधिकारीको नाम</th>
                <th>सम्पर्क फोन</th>
                <th>ठेगाना</th>
                <th>कार्यकाल समाप्त</th>
              </tr>
            </thead>
            <tbody>
              {allMembers.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    कुनै पनि पदाधिकारी फेला परेन।
                  </td>
                </tr>
              ) : (
                allMembers.map((m, i) => (
                  <tr key={m.id || i}>
                    <td style={{ fontWeight: 600 }}>{m.orgName}</td>
                    <td>
                      <span className="dt-badge dt-badge-info" style={{ fontWeight: 700 }}>
                        {m.designation}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{m.name}</td>
                    <td>
                      {m.phone ? (
                        <a href={`tel:${m.phone}`} style={{ textDecoration: 'none', color: 'var(--primary)', fontSize: '0.85rem' }}>
                          {m.phone}
                        </a>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td>{m.address || '-'}</td>
                    <td>{m.termEnd || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
</div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 4: AGREEMENTS (MoU)
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'agreements' && (
        <div className="dt-table-wrapper">
          <div className="dt-responsive-table-wrapper">
<table className="dt-table">
            <thead>
              <tr>
                <th>सम्झौताको विषय</th>
                <th>साझेदार संस्था</th>
                <th>आ.व.</th>
                <th>कुल बजेट (रु.)</th>
                <th>पालिका बजेट</th>
                <th>संस्था बजेट</th>
                <th>सम्बन्धित शाखा</th>
                <th>अवधि</th>
                <th>स्थिति</th>
              </tr>
            </thead>
            <tbody>
              {allAgreements.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    कुनै पनि साझेदारी सम्झौता फेला परेन।
                  </td>
                </tr>
              ) : (
                allAgreements.map((a, i) => (
                  <tr key={a.id || i}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{a.subject}</div>
                      {a.terms && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{a.terms}</div>}
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{a.orgName}</td>
                    <td>
                      <span className="dt-badge dt-badge-info">{a.fiscalYear}</span>
                    </td>
                    <td style={{ fontWeight: 800 }}>रु. {(a.totalBudget || 0).toLocaleString('en-IN')}</td>
                    <td style={{ fontWeight: 700, color: '#059669' }}>रु. {(a.palikaBudget || 0).toLocaleString('en-IN')}</td>
                    <td style={{ color: 'var(--text-muted)' }}>रु. {(a.orgBudget || 0).toLocaleString('en-IN')}</td>
                    <td style={{ fontSize: '0.8rem' }}>{a.donorAgency || 'गाउँपालिका'}</td>
                    <td style={{ fontSize: '0.78rem' }}>{a.agreementDate} देखि {a.endDate || '-'}</td>
                    <td>
                      <span className={`dt-badge ${a.status === 'completed' ? 'dt-badge-warning' : 'dt-badge-success'}`}>
                        {a.status === 'completed' ? 'सम्पन्न' : 'चालु'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
</div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 5: PROGRAMS & BUDGET
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'programs' && (
        <div className="dt-table-wrapper">
          <div className="dt-responsive-table-wrapper">
<table className="dt-table">
            <thead>
              <tr>
                <th>कार्यक्रमको नाम</th>
                <th>सञ्चालक संस्था</th>
                <th>कार्यक्षेत्र (Sector)</th>
                <th>आ.व.</th>
                <th>स्वीकृत बजेट</th>
                <th>खर्च बजेट</th>
                <th>लाभान्वित जनसंख्या</th>
                <th>प्रगति स्थिति</th>
              </tr>
            </thead>
            <tbody>
              {allPrograms.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    कुनै कार्यक्रम फेला परेन।
                  </td>
                </tr>
              ) : (
                allPrograms.map((p, i) => (
                  <tr key={p.id || i}>
                    <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>{p.title}</td>
                    <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{p.orgName}</td>
                    <td>
                      <span className="dt-badge dt-badge-info">{p.sector || '-'}</span>
                    </td>
                    <td>{p.fiscalYear}</td>
                    <td style={{ fontWeight: 700 }}>रु. {(p.budget || 0).toLocaleString('en-IN')}</td>
                    <td style={{ color: 'var(--text-muted)' }}>रु. {(p.spentBudget || 0).toLocaleString('en-IN')}</td>
                    <td>
                      <span className="dt-badge dt-badge-success">{p.beneficiariesCount || 0} जना</span>
                    </td>
                    <td>
                      <span className={`dt-badge ${p.status === 'completed' ? 'dt-badge-success' : 'dt-badge-warning'}`}>
                        {p.status === 'completed' ? 'सम्पन्न' : 'सञ्चालित'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
</div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 6: AUDITS & AGM
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'audits' && (
        <div className="dt-table-wrapper">
          <div className="dt-responsive-table-wrapper">
<table className="dt-table">
            <thead>
              <tr>
                <th>संस्थाको नाम</th>
                <th>आर्थिक वर्ष</th>
                <th>साधारण सभा मिति</th>
                <th>लेखापरीक्षक (Auditor)</th>
                <th>पेश मिति</th>
                <th>करचुक्ता स्थिति</th>
                <th>कैफियत</th>
              </tr>
            </thead>
            <tbody>
              {allAudits.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    कुनै अडिट रेकर्ड फेला परेन।
                  </td>
                </tr>
              ) : (
                allAudits.map((au, i) => (
                  <tr key={au.id || i}>
                    <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{au.orgName}</td>
                    <td>
                      <span className="dt-badge dt-badge-info">{au.fiscalYear}</span>
                    </td>
                    <td>{au.agmDate || '-'}</td>
                    <td style={{ fontWeight: 600 }}>{au.auditorName || '-'}</td>
                    <td>{au.submissionDate || '-'}</td>
                    <td>
                      <span className="dt-badge dt-badge-success">नियमित करचुक्ता</span>
                    </td>
                    <td>
                      <small style={{ color: 'var(--text-muted)' }}>{au.remarks || '-'}</small>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
</div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          ORGANIZATION DETAIL MODAL
      ───────────────────────────────────────────────────────────── */}
      {selectedOrgForView && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
        >
          <div
            className="dt-card"
            style={{
              width: '100%',
              maxWidth: '860px',
              maxHeight: '90vh',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              padding: '1.75rem',
              borderRadius: '16px',
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <span className={`dt-badge ${getTypeLabel(selectedOrgForView.type).badge}`}>
                    {getTypeLabel(selectedOrgForView.type).label}
                  </span>
                  <span className="dt-badge dt-badge-info">वडा नं. {selectedOrgForView.wardNo}</span>
                  {getStatusBadge(selectedOrgForView.status)}
                </div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                  {selectedOrgForView.name}
                </h2>
                {selectedOrgForView.nameEn && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                    {selectedOrgForView.nameEn}
                  </p>
                )}
              </div>
              <button
                onClick={() => setSelectedOrgForView(null)}
                className="dt-btn dt-btn-outline"
                style={{ padding: '0.4rem', borderRadius: '50%' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Sub-Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              <button
                onClick={() => setModalSubTab('profile')}
                className={`dt-btn ${modalSubTab === 'profile' ? 'dt-btn-primary' : 'dt-btn-outline'}`}
                style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
              >
                सामान्य परिचय
              </button>
              <button
                onClick={() => setModalSubTab('members')}
                className={`dt-btn ${modalSubTab === 'members' ? 'dt-btn-primary' : 'dt-btn-outline'}`}
                style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
              >
                कार्यसमिति ({selectedOrgForView.committeeMembers?.length || 0})
              </button>
              <button
                onClick={() => setModalSubTab('renewals')}
                className={`dt-btn ${modalSubTab === 'renewals' ? 'dt-btn-primary' : 'dt-btn-outline'}`}
                style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
              >
                नवीकरण इतिहास ({selectedOrgForView.renewals?.length || 0})
              </button>
              <button
                onClick={() => setModalSubTab('agreements')}
                className={`dt-btn ${modalSubTab === 'agreements' ? 'dt-btn-primary' : 'dt-btn-outline'}`}
                style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
              >
                सम्झौता तथा कार्यक्रम ({selectedOrgForView.agreements?.length || 0})
              </button>
              <button
                onClick={() => setModalSubTab('audits')}
                className={`dt-btn ${modalSubTab === 'audits' ? 'dt-btn-primary' : 'dt-btn-outline'}`}
                style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
              >
                लेखापरीक्षण
              </button>
            </div>

            {/* Sub-tab 1: Profile */}
            {modalSubTab === 'profile' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>दर्ता नम्बर</div>
                  <div style={{ fontWeight: 700 }}>{selectedOrgForView.registrationNo}</div>
                </div>
                <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>दर्ता मिति (B.S.)</div>
                  <div style={{ fontWeight: 700 }}>{selectedOrgForView.establishedDate || selectedOrgForView.lastRenewalDate || '-'}</div>
                </div>
                <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>प्यान (PAN) नम्बर</div>
                  <div style={{ fontWeight: 700 }}>{selectedOrgForView.panNo || '-'}</div>
                </div>
                <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>अध्यक्ष / नेतृत्व</div>
                  <div style={{ fontWeight: 700 }}>{selectedOrgForView.executiveHead}</div>
                </div>
                <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>सम्पर्क फोन / मोबाइल</div>
                  <div style={{ fontWeight: 700 }}>{selectedOrgForView.phone || '-'}</div>
                </div>
                <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>इमेल ठेगाना</div>
                  <div style={{ fontWeight: 700 }}>{selectedOrgForView.email || '-'}</div>
                </div>
                <div style={{ gridColumn: '1 / -1', padding: '0.75rem', backgroundColor: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>मुख्य उद्देश्य तथा कार्यक्षेत्र</div>
                  <div style={{ fontSize: '0.88rem', lineHeight: 1.6 }}>{selectedOrgForView.category || selectedOrgForView.address || 'विवरण उपलब्ध छैन।'}</div>
                </div>
              </div>
            )}

            {/* Sub-tab 2: Members */}
            {modalSubTab === 'members' && (
              <div className="dt-table-wrapper">
                <div className="dt-responsive-table-wrapper">
<table className="dt-table">
                  <thead>
                    <tr>
                      <th>पद</th>
                      <th>नाम</th>
                      <th>सम्पर्क</th>
                      <th>ठेगाना</th>
                      <th>कार्यकाल</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!selectedOrgForView.committeeMembers || selectedOrgForView.committeeMembers.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                          कुनै पदाधिकारी विवरण छैन।
                        </td>
                      </tr>
                    ) : (
                      selectedOrgForView.committeeMembers.map((m, i) => (
                        <tr key={m.id || i}>
                          <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{m.designation}</td>
                          <td style={{ fontWeight: 600 }}>{m.name}</td>
                          <td>{m.phone || '-'}</td>
                          <td>{m.address || '-'}</td>
                          <td>{m.termEnd || '-'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
</div>
              </div>
            )}

            {/* Sub-tab 3: Renewals */}
            {modalSubTab === 'renewals' && (
              <div className="dt-table-wrapper">
                <div className="dt-responsive-table-wrapper">
<table className="dt-table">
                  <thead>
                    <tr>
                      <th>आर्थिक वर्ष</th>
                      <th>नवीकरण मिति</th>
                      <th>शुल्क (रु.)</th>
                      <th>रसिद नं.</th>
                      <th>म्याद</th>
                      <th>कैफियत</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!selectedOrgForView.renewals || selectedOrgForView.renewals.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                          कुनै नवीकरण इतिहास छैन।
                        </td>
                      </tr>
                    ) : (
                      selectedOrgForView.renewals.map((r, i) => (
                        <tr key={r.id || i}>
                          <td style={{ fontWeight: 700 }}>{r.fiscalYear}</td>
                          <td>{r.renewalDate}</td>
                          <td style={{ fontWeight: 700, color: '#059669' }}>रु. {(r.fee || 0).toLocaleString('en-IN')}</td>
                          <td><code>{r.receiptNo || '-'}</code></td>
                          <td>{r.validUntil || '-'}</td>
                          <td>
                            <span className="dt-badge dt-badge-success">{r.remarks || 'प्रमाणीकृत'}</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
</div>
              </div>
            )}

            {/* Sub-tab 4: Agreements & Programs */}
            {modalSubTab === 'agreements' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                    गाउँपालिकासँग भएका सम्झौताहरू (MoU)
                  </h4>
                  <div className="dt-table-wrapper">
                    <div className="dt-responsive-table-wrapper">
<table className="dt-table">
                      <thead>
                        <tr>
                          <th>विषय</th>
                          <th>आ.व.</th>
                          <th>कुल बजेट (रु.)</th>
                          <th>पालिका बजेट</th>
                          <th>अवधि</th>
                        </tr>
                      </thead>
                      <tbody>
                        {!selectedOrgForView.agreements || selectedOrgForView.agreements.length === 0 ? (
                          <tr><td colSpan={5} style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>कुनै सम्झौता छैन</td></tr>
                        ) : (
                          selectedOrgForView.agreements.map((a, i) => (
                            <tr key={a.id || i}>
                              <td style={{ fontWeight: 600 }}>{a.subject}</td>
                              <td>{a.fiscalYear}</td>
                              <td style={{ fontWeight: 700 }}>रु. {(a.totalBudget || 0).toLocaleString('en-IN')}</td>
                              <td style={{ color: '#059669' }}>रु. {(a.palikaBudget || 0).toLocaleString('en-IN')}</td>
                              <td>{a.agreementDate} देखि {a.endDate || '-'}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
</div>
                  </div>
                </div>

                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                    सञ्चालित कार्यक्रमहरू
                  </h4>
                  <div className="dt-table-wrapper">
                    <div className="dt-responsive-table-wrapper">
<table className="dt-table">
                      <thead>
                        <tr>
                          <th>कार्यक्रम</th>
                          <th>क्षेत्र</th>
                          <th>बजेट (रु.)</th>
                          <th>लाभान्वित</th>
                          <th>स्थिति</th>
                        </tr>
                      </thead>
                      <tbody>
                        {!selectedOrgForView.programs || selectedOrgForView.programs.length === 0 ? (
                          <tr><td colSpan={5} style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>कुनै कार्यक्रम छैन</td></tr>
                        ) : (
                          selectedOrgForView.programs.map((p, i) => (
                            <tr key={p.id || i}>
                              <td style={{ fontWeight: 600 }}>{p.title}</td>
                              <td>{p.sector}</td>
                              <td style={{ fontWeight: 700 }}>रु. {(p.budget || 0).toLocaleString('en-IN')}</td>
                              <td>{p.beneficiariesCount || 0} जना</td>
                              <td>
                                <span className="dt-badge dt-badge-success">{p.status}</span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
</div>
                  </div>
                </div>
              </div>
            )}

            {/* Sub-tab 5: Audits */}
            {modalSubTab === 'audits' && (
              <div className="dt-table-wrapper">
                <div className="dt-responsive-table-wrapper">
<table className="dt-table">
                  <thead>
                    <tr>
                      <th>आर्थिक वर्ष</th>
                      <th>साधारण सभा मिति</th>
                      <th>लेखापरीक्षक</th>
                      <th>स्थिति</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!selectedOrgForView.audits || selectedOrgForView.audits.length === 0 ? (
                      <tr><td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>कुनै अडिट छैन</td></tr>
                    ) : (
                      selectedOrgForView.audits.map((au, i) => (
                        <tr key={au.id || i}>
                          <td style={{ fontWeight: 700 }}>{au.fiscalYear}</td>
                          <td>{au.agmDate || '-'}</td>
                          <td>{au.auditorName || '-'}</td>
                          <td><span className="dt-badge dt-badge-success">स्वीकृत</span></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
</div>
              </div>
            )}

            {/* Modal Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <button
                onClick={() => window.print()}
                className="dt-btn dt-btn-outline"
              >
                <Printer size={15} />
                <span>प्रिन्ट गर्नुहोस्</span>
              </button>
              <button
                onClick={() => setSelectedOrgForView(null)}
                className="dt-btn dt-btn-primary"
              >
                बन्द गर्नुहोस्
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2-STEP REGISTRATION WIZARD MODAL
      ───────────────────────────────────────────────────────────── */}
      {showAddOrgModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
        >
          <div
            className="dt-card"
            style={{
              width: '100%',
              maxWidth: '680px',
              maxHeight: '90vh',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              padding: '1.75rem',
              borderRadius: '16px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                  नयाँ संघसंस्था दर्ता तथा सूचीकरण (Dolphin-Trap 2-Step Wizard)
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  चरण {addOrgStep} / २: {addOrgStep === 1 ? 'संस्था तथा सम्पर्क विवरण' : 'कानुनी तथा उद्देश्य विवरण'}
                </span>
              </div>
              <button onClick={() => setShowAddOrgModal(false)} className="dt-btn dt-btn-outline" style={{ padding: '0.35rem', borderRadius: '50%' }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={addOrgStep === 1 ? (e) => { e.preventDefault(); setAddOrgStep(2); } : handleCreateOrg}>
              {addOrgStep === 1 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.85rem' }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>संस्थाको नाम (नेपालीमा) *</label>
                    <input
                      type="text"
                      className="dt-input"
                      required
                      placeholder="उदा: पाँचपोखरी युवा समाज"
                      value={newOrgForm.name}
                      onChange={(e) => setNewOrgForm({ ...newOrgForm, name: e.target.value })}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>संस्थाको नाम (अंग्रेजीमा)</label>
                    <input
                      type="text"
                      className="dt-input"
                      placeholder="e.g., Panchpokhari Youth Club"
                      value={newOrgForm.nameEn}
                      onChange={(e) => setNewOrgForm({ ...newOrgForm, nameEn: e.target.value })}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>संस्थाको प्रकार *</label>
                    <select
                      className="dt-select"
                      value={newOrgForm.type}
                      onChange={(e) => setNewOrgForm({ ...newOrgForm, type: e.target.value as OrgType })}
                    >
                      <option value="ngo">गैर-सरकारी संस्था (NGO)</option>
                      <option value="cooperative">सहकारी संस्था (Cooperative)</option>
                      <option value="club">युवा/खेलकुद क्लब (Club)</option>
                      <option value="community">सामुदायिक संस्था (Community)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>सम्बन्धित वडा नं. *</label>
                    <select
                      className="dt-select"
                      value={newOrgForm.wardNo}
                      onChange={(e) => setNewOrgForm({ ...newOrgForm, wardNo: Number(e.target.value) })}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
                        <option key={w} value={w}>वडा नं. {w}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>कार्यालय ठेगाना *</label>
                    <input
                      type="text"
                      className="dt-input"
                      required
                      placeholder="टोल / गाउँ"
                      value={newOrgForm.address}
                      onChange={(e) => setNewOrgForm({ ...newOrgForm, address: e.target.value })}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>अध्यक्ष / नेतृत्वकर्ताको नाम *</label>
                    <input
                      type="text"
                      className="dt-input"
                      required
                      placeholder="पूरा नाम"
                      value={newOrgForm.executiveHead}
                      onChange={(e) => setNewOrgForm({ ...newOrgForm, executiveHead: e.target.value })}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>सम्पर्क फोन / मोबाइल *</label>
                    <input
                      type="tel"
                      className="dt-input"
                      required
                      placeholder="९८XXXXXXXX"
                      value={newOrgForm.phone}
                      onChange={(e) => setNewOrgForm({ ...newOrgForm, phone: e.target.value })}
                    />
                  </div>

                  <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                    <button type="submit" className="dt-btn dt-btn-primary">
                      <span>अर्को चरण (Step 2)</span>
                      <ArrowRight size={15} />
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.85rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>दर्ता नम्बर *</label>
                    <input
                      type="text"
                      className="dt-input"
                      required
                      placeholder="दर्ता नं."
                      value={newOrgForm.registrationNo}
                      onChange={(e) => setNewOrgForm({ ...newOrgForm, registrationNo: e.target.value })}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>दर्ता मिति (B.S.) *</label>
                    <input
                      type="text"
                      className="dt-input"
                      required
                      placeholder="२०७५/०४/१२"
                      value={newOrgForm.registrationDate}
                      onChange={(e) => setNewOrgForm({ ...newOrgForm, registrationDate: e.target.value })}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>दर्ता निकाय *</label>
                    <input
                      type="text"
                      className="dt-input"
                      required
                      placeholder="जि.प्र.का. / समाज कल्याण / गाउँपालिका"
                      value={newOrgForm.registrationNikaya}
                      onChange={(e) => setNewOrgForm({ ...newOrgForm, registrationNikaya: e.target.value })}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>प्यान (PAN) नम्बर *</label>
                    <input
                      type="text"
                      className="dt-input"
                      required
                      placeholder="९ अङ्कको प्यान"
                      value={newOrgForm.panNo}
                      onChange={(e) => setNewOrgForm({ ...newOrgForm, panNo: e.target.value })}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>इमेल ठेगाना</label>
                    <input
                      type="email"
                      className="dt-input"
                      placeholder="org@gmail.com"
                      value={newOrgForm.email}
                      onChange={(e) => setNewOrgForm({ ...newOrgForm, email: e.target.value })}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>मुख्य कार्यक्षेत्र *</label>
                    <input
                      type="text"
                      className="dt-input"
                      required
                      placeholder="शिक्षा, स्वास्थ्य, वातावरण आदि"
                      value={newOrgForm.sector}
                      onChange={(e) => setNewOrgForm({ ...newOrgForm, sector: e.target.value })}
                    />
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>संस्थाको उद्देश्यहरू *</label>
                    <textarea
                      className="dt-input"
                      rows={3}
                      required
                      placeholder="संस्थाका प्रमुख उद्देश्य तथा लक्षित वर्ग..."
                      value={newOrgForm.objectives}
                      onChange={(e) => setNewOrgForm({ ...newOrgForm, objectives: e.target.value })}
                    />
                  </div>

                  <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                    <button type="button" onClick={() => setAddOrgStep(1)} className="dt-btn dt-btn-outline">
                      <span>अघिल्लो चरण</span>
                    </button>
                    <button type="submit" className="dt-btn dt-btn-primary">
                      <CheckCircle2 size={16} />
                      <span>संस्था दर्ता सुरक्षित गर्नुहोस्</span>
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          NEW RENEWAL MODAL
      ───────────────────────────────────────────────────────────── */}
      {showAddRenewalModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
        >
          <div className="dt-card" style={{ width: '100%', maxWidth: '520px', padding: '1.5rem', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>वार्षिक संस्था नवीकरण दर्ता</h3>
              <button onClick={() => setShowAddRenewalModal(false)} className="dt-btn dt-btn-outline" style={{ padding: '0.35rem', borderRadius: '50%' }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateRenewal} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>सम्बन्धित संस्था छनोट *</label>
                <select
                  className="dt-select"
                  required
                  value={newRenewalForm.orgId}
                  onChange={(e) => setNewRenewalForm({ ...newRenewalForm, orgId: e.target.value })}
                >
                  <option value="">-- संस्था चयन गर्नुहोस् --</option>
                  {safeOrganizations.map((o) => (
                    <option key={o.id} value={o.id}>{o.name} (वडा {o.wardNo})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>नवीकरण आर्थिक वर्ष *</label>
                <input
                  type="text"
                  className="dt-input"
                  required
                  value={newRenewalForm.fiscalYear}
                  onChange={(e) => setNewRenewalForm({ ...newRenewalForm, fiscalYear: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>नवीकरण मिति (B.S.) *</label>
                <input
                  type="text"
                  className="dt-input"
                  required
                  value={newRenewalForm.renewalDate}
                  onChange={(e) => setNewRenewalForm({ ...newRenewalForm, renewalDate: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>राजस्व दस्तुर (रु.) *</label>
                <input
                  type="number"
                  className="dt-input"
                  required
                  value={newRenewalForm.fee}
                  onChange={(e) => setNewRenewalForm({ ...newRenewalForm, fee: Number(e.target.value) })}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>रसिद नम्बर</label>
                <input
                  type="text"
                  className="dt-input"
                  value={newRenewalForm.receiptNo}
                  onChange={(e) => setNewRenewalForm({ ...newRenewalForm, receiptNo: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowAddRenewalModal(false)} className="dt-btn dt-btn-outline">
                  रद्द
                </button>
                <button type="submit" className="dt-btn dt-btn-primary">
                  नवीकरण सुरक्षित गर्नुहोस्
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          NEW AGREEMENT MODAL
      ───────────────────────────────────────────────────────────── */}
      {showAddAgreementModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
        >
          <div className="dt-card" style={{ width: '100%', maxWidth: '620px', padding: '1.5rem', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>गाउँपालिका र संस्थाबीच द्विपक्षीय सम्झौता (MoU) दर्ता</h3>
              <button onClick={() => setShowAddAgreementModal(false)} className="dt-btn dt-btn-outline" style={{ padding: '0.35rem', borderRadius: '50%' }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateAgreement} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.85rem' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>साझेदार संस्था छनोट *</label>
                <select
                  className="dt-select"
                  required
                  value={newAgreementForm.orgId}
                  onChange={(e) => setNewAgreementForm({ ...newAgreementForm, orgId: e.target.value })}
                >
                  <option value="">-- संस्था चयन गर्नुहोस् --</option>
                  {safeOrganizations.map((o) => (
                    <option key={o.id} value={o.id}>{o.name} (वडा {o.wardNo})</option>
                  ))}
                </select>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>सम्झौताको विषय (Project Title) *</label>
                <input
                  type="text"
                  className="dt-input"
                  required
                  placeholder="उदा: पदमार्ग जैविक फोहोर व्यवस्थापन आयोजना"
                  value={newAgreementForm.subject}
                  onChange={(e) => setNewAgreementForm({ ...newAgreementForm, subject: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>कुल लागत / बजेट (रु.) *</label>
                <input
                  type="number"
                  className="dt-input"
                  required
                  value={newAgreementForm.totalBudget}
                  onChange={(e) => setNewAgreementForm({ ...newAgreementForm, totalBudget: Number(e.target.value) })}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>गाउँपालिका साझेदारी बजेट (रु.) *</label>
                <input
                  type="number"
                  className="dt-input"
                  required
                  value={newAgreementForm.palikaBudget}
                  onChange={(e) => setNewAgreementForm({ ...newAgreementForm, palikaBudget: Number(e.target.value) })}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>सम्बन्धित शाखा / निकाय *</label>
                <input
                  type="text"
                  className="dt-input"
                  required
                  value={newAgreementForm.donorAgency}
                  onChange={(e) => setNewAgreementForm({ ...newAgreementForm, donorAgency: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>सम्झौता मिति (B.S.) *</label>
                <input
                  type="text"
                  className="dt-input"
                  required
                  value={newAgreementForm.agreementDate}
                  onChange={(e) => setNewAgreementForm({ ...newAgreementForm, agreementDate: e.target.value })}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>सर्त तथा कार्यक्षेत्र</label>
                <textarea
                  className="dt-input"
                  rows={2}
                  placeholder="सम्झौताका मुख्य बुँदाहरू..."
                  value={newAgreementForm.terms}
                  onChange={(e) => setNewAgreementForm({ ...newAgreementForm, terms: e.target.value })}
                />
              </div>

              <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowAddAgreementModal(false)} className="dt-btn dt-btn-outline">
                  रद्द
                </button>
                <button type="submit" className="dt-btn dt-btn-primary">
                  सम्झौता दर्ता गर्नुहोस्
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
