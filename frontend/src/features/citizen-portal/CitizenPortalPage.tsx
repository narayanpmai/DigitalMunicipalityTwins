import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { citizensApi, type CitizenRecord } from '../../api/citizens';
import {
  Users,
  Search,
  Plus,
  Filter,
  Download,
  Upload,
  RefreshCw,
  Printer,
  Eye,
  Edit2,
  Trash2,
  ShieldCheck,
  HeartPulse,
  UserCheck,
  Building,
  Phone,
  FileText,
  MapPin,
  Calendar,
  X,
  CheckCircle2,
  AlertCircle,
  QrCode,
  BarChart3,
  Trash2 as TrashIcon, // alias to avoid conflict with default Trash2 usage if any
  Leaf,
  Wallet
} from 'lucide-react';

const WARDS = [
  { id: 'all', name: 'सबै वडा (१-८)' },
  { id: '1', name: 'वडा नं. १ (बाँसखर्क)' },
  { id: '2', name: 'वडा नं. २ (बरुवा)' },
  { id: '3', name: 'वडा नं. ३ (भोताङ)' },
  { id: '4', name: 'वडा नं. ४ (थाङपालकोट)' },
  { id: '5', name: 'वडा नं. ५ (गुन्सा)' },
  { id: '6', name: 'वडा नं. ६ (थाङपालधाप)' },
  { id: '7', name: 'वडा नं. ७ (तिपेनी)' },
  { id: '8', name: 'वडा नं. ८ (लागर्चे)' },
];

const TARGETED_GROUPS = [
  'सबै लक्षित वर्ग',
  'सामान्य नागरिक (General)',
  'ज्येष्ठ नागरिक (Senior Citizen)',
  'एकल महिला / बिधवा (Single/Widow)',
  'अपाङ्गता - क वर्ग (पूर्ण अशक्त)',
  'अपाङ्गता - ख वर्ग (अति अशक्त)',
  'अपाङ्गता - ग/घ वर्ग',
  'दलित तथा लोपोन्मुख',
  'अति विपन्न परिवार',
];

const SERVICE_PURPOSES = [
  'सबै सेवा प्रयोजन',
  'स्वास्थ्य उपचार तथा परामर्श (EHR/OPD)',
  'घटना दर्ता (जन्म/मृत्यु/विवाह)',
  'सामाजिक सुरक्षा भत्ता नवीकरण/दर्ता',
  'सिफारिस तथा प्रमाणिकरण',
  'राजस्व, सम्पत्ति कर तथा मालपोत',
  'योजना, पूर्वाधार तथा उपभोक्ता समिति',
  'कृषि तथा पशुसेवा अनुदान',
  'व्यवसाय दर्ता तथा नवीकरण',
  'पुस्तकालय सदस्यता',
  'अन्य प्रशासनिक सेवा',
];

export const CitizenPortalPage: React.FC = () => {
  const queryClient = useQueryClient();

  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWard, setSelectedWard] = useState<string>('all');
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [selectedGroup, setSelectedGroup] = useState<string>('सबै लक्षित वर्ग');
  const [selectedPurpose, setSelectedPurpose] = useState<string>('सबै सेवा प्रयोजन');

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCitizen, setEditingCitizen] = useState<CitizenRecord | null>(null);
  const [isProfileSlipOpen, setIsProfileSlipOpen] = useState(false);
  const [viewingCitizen, setViewingCitizen] = useState<CitizenRecord | null>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'personal' | 'address' | 'social' | 'service'>('personal');

  // Waste Management States
  const [isWasteModalOpen, setIsWasteModalOpen] = useState(false);
  const [wasteRequestCitizen, setWasteRequestCitizen] = useState<CitizenRecord | null>(null);

  // Form State
  const initialFormState: Partial<CitizenRecord> = {
    fullName: '',
    fullNameEn: '',
    citizenshipNo: '',
    nationalId: '',
    phone: '',
    gender: 'FEMALE',
    dateOfBirth: '',
    dobBs: '',
    bloodGroup: 'O+',
    maritalStatus: 'विवाहित',
    wardNumber: 3,
    address: 'पाँचपोखरी थाङपाल गाउँपालिका',
    tole: '',
    occupation: 'कृषि तथा पशुपालन',
    fatherName: '',
    motherName: '',
    spouseName: '',
    targetedGroup: 'सामान्य नागरिक (General)',
    insuranceNumber: '',
    servicePurpose: 'स्वास्थ्य उपचार तथा परामर्श (EHR/OPD)',
    issuedDistrict: 'सिन्धुपाल्चोक',
    issuedDate: '',
    emergencyContactName: '',
    emergencyContactRelation: '',
    emergencyContactPhone: '',
  };
  const [formData, setFormData] = useState<Partial<CitizenRecord>>(initialFormState);

  // Verification Workflow States
  const [selectedVerificationStatus, setSelectedVerificationStatus] = useState<string>('all');
  const [verifyingCitizen, setVerifyingCitizen] = useState<CitizenRecord | null>(null);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [verifyRemarks, setVerifyRemarks] = useState('');
  const [verifyIsPublic, setVerifyIsPublic] = useState(true);

  // Queries
  const { data: citizens = [], isLoading, refetch } = useQuery({
    queryKey: ['citizens', searchTerm, selectedWard],
    queryFn: () => citizensApi.getAll(searchTerm, selectedWard === 'all' ? undefined : Number(selectedWard)),
  });

  const { data: stats } = useQuery({
    queryKey: ['citizen-stats'],
    queryFn: () => citizensApi.getStats(),
  });

  // Verification Mutation
  const verifyMutation = useMutation({
    mutationFn: ({
      id,
      status,
      isPublic,
      remarks,
    }: {
      id: string;
      status: 'VERIFIED' | 'REJECTED';
      isPublic?: boolean;
      remarks?: string;
    }) => citizensApi.verify(id, status, isPublic, remarks),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['citizens'] });
      queryClient.invalidateQueries({ queryKey: ['citizen-stats'] });
      setIsVerifyModalOpen(false);
      setVerifyingCitizen(null);
      setVerifyRemarks('');
    },
    onError: (err: any) => {
      alert('प्रमाणीकरण गर्न असफल भयो: ' + (err?.response?.data?.message || err.message));
    },
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: Partial<CitizenRecord>) => citizensApi.create(data),
    onSuccess: (newCitizen) => {
      queryClient.invalidateQueries({ queryKey: ['citizens'] });
      queryClient.invalidateQueries({ queryKey: ['citizen-stats'] });
      setIsFormOpen(false);
      setViewingCitizen(newCitizen);
      setIsProfileSlipOpen(true);
    },
    onError: (err: any) => {
      alert('नागरिक दर्ता गर्न असफल भयो: ' + (err?.response?.data?.message || err.message));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CitizenRecord> }) => citizensApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['citizens'] });
      queryClient.invalidateQueries({ queryKey: ['citizen-stats'] });
      setIsFormOpen(false);
      setEditingCitizen(null);
    },
    onError: (err: any) => {
      alert('नागरिक विवरण सम्पादन गर्न असफल भयो: ' + (err?.response?.data?.message || err.message));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => citizensApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['citizens'] });
      queryClient.invalidateQueries({ queryKey: ['citizen-stats'] });
    },
    onError: (err: any) => {
      alert('नागरिक हटाउन असफल भयो: ' + (err?.response?.data?.message || err.message));
    },
  });

  // Verification Counts
  const pendingCount = useMemo(() => citizens.filter((c) => c.verificationStatus === 'PENDING').length, [citizens]);
  const verifiedCount = useMemo(
    () => citizens.filter((c) => (c.verificationStatus || 'VERIFIED') === 'VERIFIED').length,
    [citizens]
  );
  const rejectedCount = useMemo(() => citizens.filter((c) => c.verificationStatus === 'REJECTED').length, [citizens]);

  // Filtered List
  const filteredCitizens = useMemo(() => {
    return citizens.filter((c) => {
      if (selectedVerificationStatus !== 'all') {
        const vStatus = (c.verificationStatus || 'VERIFIED').toUpperCase();
        if (vStatus !== selectedVerificationStatus.toUpperCase()) return false;
      }
      if (selectedGender !== 'all' && c.gender !== selectedGender) return false;
      if (selectedGroup !== 'सबै लक्षित वर्ग' && c.targetedGroup !== selectedGroup) return false;
      if (selectedPurpose !== 'सबै सेवा प्रयोजन' && c.servicePurpose !== selectedPurpose) return false;
      return true;
    });
  }, [citizens, selectedVerificationStatus, selectedGender, selectedGroup, selectedPurpose]);

  const handleOpenCreate = () => {
    setEditingCitizen(null);
    setFormData(initialFormState);
    setActiveTab('personal');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (citizen: CitizenRecord) => {
    setEditingCitizen(citizen);
    setFormData({
      ...citizen,
      wardNumber: citizen.wardNumber || 1,
      gender: citizen.gender || 'FEMALE',
    });
    setActiveTab('personal');
    setIsFormOpen(true);
  };

  const handleSaveCitizen = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.fullName.trim()) {
      alert('कृपया नागरिकको पूरा नाम अनिवार्य लेख्नुहोस्।');
      return;
    }
    const payload = { ...formData };
    // Remove empty dateOfBirth to prevent backend 500 error on type conversion
    if (!payload.dateOfBirth || payload.dateOfBirth.trim() === '') {
      delete payload.dateOfBirth;
    }

    if (editingCitizen) {
      updateMutation.mutate({ id: editingCitizen.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDeleteCitizen = (citizen: CitizenRecord) => {
    if (window.confirm(`के तपाईं निश्चित हुनुहुन्छ? "${citizen.fullName}" को अभिलेख पालिका प्रणालीबाट हटाइनेछ।`)) {
      deleteMutation.mutate(citizen.id);
    }
  };

  const handleExportCsv = () => {
    if (!filteredCitizens.length) {
      alert('निर्यात गर्न कुनै डेटा छैन।');
      return;
    }
    const headers = ['CitizenCode', 'FullName', 'NID', 'CitizenshipNo', 'Gender', 'DOB_BS', 'Ward', 'Tole', 'Phone', 'TargetedGroup', 'InsuranceNo', 'Purpose'];
    const rows = filteredCitizens.map((c) => [
      `"${c.citizenCode || ''}"`,
      `"${c.fullName}"`,
      `"${c.nationalId || ''}"`,
      `"${c.citizenshipNo || ''}"`,
      `"${c.gender}"`,
      `"${c.dobBs || ''}"`,
      `"${c.wardNumber}"`,
      `"${c.tole || ''}"`,
      `"${c.phone || ''}"`,
      `"${c.targetedGroup || ''}"`,
      `"${c.insuranceNumber || ''}"`,
      `"${c.servicePurpose || ''}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Panchpokhari_Citizens_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ padding: '1.5rem', fontFamily: 'Outfit, "Noto Sans Devanagari", sans-serif' }}>
      {/* Top Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #0369a1 100%)',
          borderRadius: '16px',
          padding: '1.75rem',
          color: '#ffffff',
          boxShadow: '0 10px 25px -5px rgba(30, 58, 138, 0.3)',
          marginBottom: '1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>
              नेपाल सरकार • स्थानीय सरकार
            </span>
            <span style={{ backgroundColor: '#10b981', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>
              लाइभ डिजिटल लगत
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 0.25rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Users size={32} />
            नागरिक पोर्टल तथा सेवाग्राही लगत व्यवस्थापन प्रणाली
          </h1>
          <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem' }}>
            पाँचपोखरी थाङपाल गाउँपालिका — सम्पूर्ण वडा, स्वास्थ्य, पञ्जीकरण तथा सामाजिक सुरक्षामा आबद्ध नागरिकहरूको एकीकृत डाटा हब
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          <button
            onClick={handleOpenCreate}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: '#f59e0b',
              color: '#000000',
              fontWeight: 700,
              padding: '0.65rem 1.25rem',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
              transition: 'all 0.2s ease',
            }}
          >
            <Plus size={18} />
            + नयाँ सेवाग्राही दर्ता
          </button>
          <button
            onClick={handleExportCsv}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'rgba(255,255,255,0.15)',
              color: '#ffffff',
              padding: '0.65rem 1rem',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.3)',
              cursor: 'pointer',
            }}
          >
            <Download size={16} />
            CSV निर्यात
          </button>
          <button
            onClick={() => refetch()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'rgba(255,255,255,0.15)',
              color: '#ffffff',
              padding: '0.65rem 1rem',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.3)',
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={16} />
            ताजा गर्नुहोस्
          </button>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ backgroundColor: 'var(--card-bg, #ffffff)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border, #e2e8f0)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '10px', backgroundColor: '#dbeafe', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted, #64748b)', fontWeight: 600 }}>कुल दर्ता नागरिक / सेवाग्राही</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main, #0f172a)' }}>
              {stats?.total || citizens.length} जना
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--card-bg, #ffffff)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border, #e2e8f0)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '10px', backgroundColor: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HeartPulse size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted, #64748b)', fontWeight: 600 }}>स्वास्थ्य बीमा आबद्ध</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#15803d' }}>
              {citizens.filter((c) => c.insuranceNumber).length} जना
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--card-bg, #ffffff)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border, #e2e8f0)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '10px', backgroundColor: '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted, #64748b)', fontWeight: 600 }}>लक्षित तथा सामाजिक सुरक्षा</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#b45309' }}>
              {citizens.filter((c) => c.targetedGroup && !c.targetedGroup.includes('General')).length} जना
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--card-bg, #ffffff)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border, #e2e8f0)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '10px', backgroundColor: '#f3e8ff', color: '#7e22ce', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UserCheck size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted, #64748b)', fontWeight: 600 }}>राष्ट्रिय परिचयपत्र (NID) प्रविष्ट</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#7e22ce' }}>
              {citizens.filter((c) => c.nationalId).length} जना
            </div>
          </div>
        </div>
      </div>

      {/* Verification Status Filter Bar */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '1rem',
          flexWrap: 'wrap',
          alignItems: 'center',
          backgroundColor: 'var(--card-bg, #ffffff)',
          padding: '0.65rem 1rem',
          borderRadius: '10px',
          border: '1px solid var(--border, #e2e8f0)',
        }}
      >
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main, #0f172a)', marginRight: '0.5rem' }}>
          प्रमाणीकरण फिल्टर:
        </span>

        <button
          onClick={() => setSelectedVerificationStatus('all')}
          style={{
            padding: '0.4rem 0.85rem',
            borderRadius: '20px',
            border: selectedVerificationStatus === 'all' ? '1px solid #3b82f6' : '1px solid #e2e8f0',
            backgroundColor: selectedVerificationStatus === 'all' ? '#eff6ff' : 'transparent',
            color: selectedVerificationStatus === 'all' ? '#1d4ed8' : '#64748b',
            fontWeight: selectedVerificationStatus === 'all' ? 700 : 500,
            fontSize: '0.825rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
          }}
        >
          <span>सबै लगत</span>
          <span style={{ backgroundColor: '#dbeafe', color: '#1e40af', padding: '1px 6px', borderRadius: '10px', fontSize: '0.72rem' }}>
            {citizens.length}
          </span>
        </button>

        <button
          onClick={() => setSelectedVerificationStatus('pending')}
          style={{
            padding: '0.4rem 0.85rem',
            borderRadius: '20px',
            border: selectedVerificationStatus === 'pending' ? '2px solid #f59e0b' : '1px solid #fde68a',
            backgroundColor: selectedVerificationStatus === 'pending' ? '#fffbeb' : '#fefce8',
            color: '#b45309',
            fontWeight: 700,
            fontSize: '0.825rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            boxShadow: pendingCount > 0 ? '0 1px 4px rgba(245, 158, 11, 0.2)' : 'none',
          }}
        >
          <span>⏳ अनलाइन दर्ता / प्रमाणीकरण बाँकी</span>
          <span style={{ backgroundColor: '#f59e0b', color: '#ffffff', padding: '1px 7px', borderRadius: '10px', fontSize: '0.72rem', fontWeight: 800 }}>
            {pendingCount}
          </span>
        </button>

        <button
          onClick={() => setSelectedVerificationStatus('verified')}
          style={{
            padding: '0.4rem 0.85rem',
            borderRadius: '20px',
            border: selectedVerificationStatus === 'verified' ? '1px solid #16a34a' : '1px solid #e2e8f0',
            backgroundColor: selectedVerificationStatus === 'verified' ? '#f0fdf4' : 'transparent',
            color: selectedVerificationStatus === 'verified' ? '#15803d' : '#64748b',
            fontWeight: selectedVerificationStatus === 'verified' ? 700 : 500,
            fontSize: '0.825rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
          }}
        >
          <span>✅ प्रमाणीकृत (सार्वजनिक)</span>
          <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '1px 6px', borderRadius: '10px', fontSize: '0.72rem' }}>
            {verifiedCount}
          </span>
        </button>

        <button
          onClick={() => setSelectedVerificationStatus('rejected')}
          style={{
            padding: '0.4rem 0.85rem',
            borderRadius: '20px',
            border: selectedVerificationStatus === 'rejected' ? '1px solid #dc2626' : '1px solid #e2e8f0',
            backgroundColor: selectedVerificationStatus === 'rejected' ? '#fef2f2' : 'transparent',
            color: selectedVerificationStatus === 'rejected' ? '#b91c1c' : '#64748b',
            fontWeight: selectedVerificationStatus === 'rejected' ? 700 : 500,
            fontSize: '0.825rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
          }}
        >
          <span>❌ अस्वीकृत</span>
          <span style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '1px 6px', borderRadius: '10px', fontSize: '0.72rem' }}>
            {rejectedCount}
          </span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          backgroundColor: 'var(--card-bg, #ffffff)',
          padding: '1.25rem',
          borderRadius: '12px',
          border: '1px solid var(--border, #e2e8f0)',
          marginBottom: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', gridColumn: 'span 2' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="नाम, NID, नागरिकता वा मोबाइल नं. खोज्नुहोस्..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 1rem 0.65rem 2.5rem',
                borderRadius: '8px',
                border: '1px solid var(--border, #cbd5e1)',
                backgroundColor: 'var(--input-bg, #ffffff)',
                color: 'var(--text-main, #0f172a)',
                fontSize: '0.9rem',
              }}
            />
          </div>

          {/* Ward Selector */}
          <div>
            <select
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid var(--border, #cbd5e1)',
                backgroundColor: 'var(--input-bg, #ffffff)',
                color: 'var(--text-main, #0f172a)',
                fontSize: '0.9rem',
              }}
            >
              {WARDS.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>

          {/* Gender Selector */}
          <div>
            <select
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid var(--border, #cbd5e1)',
                backgroundColor: 'var(--input-bg, #ffffff)',
                color: 'var(--text-main, #0f172a)',
                fontSize: '0.9rem',
              }}
            >
              <option value="all">सबै लिङ्ग</option>
              <option value="MALE">पुरुष (Male)</option>
              <option value="FEMALE">महिला (Female)</option>
              <option value="OTHER">अन्य (Other)</option>
            </select>
          </div>

          {/* Targeted Group Selector */}
          <div>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid var(--border, #cbd5e1)',
                backgroundColor: 'var(--input-bg, #ffffff)',
                color: 'var(--text-main, #0f172a)',
                fontSize: '0.9rem',
              }}
            >
              {TARGETED_GROUPS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* Service Purpose Selector */}
          <div>
            <select
              value={selectedPurpose}
              onChange={(e) => setSelectedPurpose(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid var(--border, #cbd5e1)',
                backgroundColor: 'var(--input-bg, #ffffff)',
                color: 'var(--text-main, #0f172a)',
                fontSize: '0.9rem',
              }}
            >
              {SERVICE_PURPOSES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter chips summary */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted, #64748b)' }}>
          <Filter size={14} />
          <span>फेला परेका नागरिक: <strong>{filteredCitizens.length}</strong> जना</span>
          {(selectedWard !== 'all' || selectedGender !== 'all' || selectedGroup !== 'सबै लक्षित वर्ग' || selectedPurpose !== 'सबै सेवा प्रयोजन') && (
            <button
              onClick={() => {
                setSelectedWard('all');
                setSelectedGender('all');
                setSelectedGroup('सबै लक्षित वर्ग');
                setSelectedPurpose('सबै सेवा प्रयोजन');
              }}
              style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
            >
              फिल्टर हटाउनुहोस्
            </button>
          )}
        </div>
      </div>

      {/* Citizen Data Table */}
      <div
        style={{
          backgroundColor: 'var(--card-bg, #ffffff)',
          borderRadius: '12px',
          border: '1px solid var(--border, #e2e8f0)',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <div className="dt-responsive-table-wrapper">
<table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--table-header-bg, #f8fafc)', borderBottom: '2px solid var(--border, #e2e8f0)', color: 'var(--text-muted, #475569)' }}>
                <th style={{ padding: '0.85rem 1rem' }}>नागरिक कोड / नाम</th>
                <th style={{ padding: '0.85rem 1rem' }}>NID / नागरिकता नं.</th>
                <th style={{ padding: '0.85rem 1rem' }}>ठेगाना (वडा)</th>
                <th style={{ padding: '0.85rem 1rem' }}>सम्पर्क</th>
                <th style={{ padding: '0.85rem 1rem' }}>लक्षित वर्ग</th>
                <th style={{ padding: '0.85rem 1rem' }}>स्वास्थ्य बीमा</th>
                <th style={{ padding: '0.85rem 1rem' }}>प्रमाणीकरण स्थिति</th>
                <th style={{ padding: '0.85rem 1rem' }}>सेवा प्रयोजन</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>कार्यहरू (Actions)</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    डेटा लोड हुँदैछ, कृपया प्रतीक्षा गर्नुहोस्...
                  </td>
                </tr>
              ) : filteredCitizens.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    कुनै नागरिकको विवरण फेला परेन।
                  </td>
                </tr>
              ) : (
                filteredCitizens.map((c) => (
                  <tr
                    key={c.id}
                    style={{
                      borderBottom: '1px solid var(--border, #f1f5f9)',
                      transition: 'background 0.15s ease',
                    }}
                  >
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div
                          style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '50%',
                            backgroundColor: c.gender === 'FEMALE' ? '#fce7f3' : '#e0e7ff',
                            color: c.gender === 'FEMALE' ? '#db2777' : '#4338ca',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.9rem',
                          }}
                        >
                          {c.fullName ? c.fullName.slice(0, 1) : '—'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text-main, #0f172a)' }}>{c.fullName}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <span style={{ backgroundColor: '#f1f5f9', padding: '1px 5px', borderRadius: '4px', fontFamily: 'monospace' }}>
                              {c.citizenCode || (c.id ? `CIT-${c.id.slice(0, 5)}` : 'CIT-NEW')}
                            </span>
                            {c.bloodGroup && <span style={{ color: '#dc2626', fontWeight: 600 }}>({c.bloodGroup})</span>}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{c.nationalId || '—'}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>ना: {c.citizenshipNo || '—'}</div>
                    </td>

                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span style={{ backgroundColor: '#e2e8f0', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>
                        वडा नं. {c.wardNumber}
                      </span>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>{c.tole || c.address}</div>
                    </td>

                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem' }}>
                        <Phone size={13} style={{ color: '#64748b' }} />
                        <span>{c.phone || '—'}</span>
                      </div>
                    </td>

                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          padding: '3px 8px',
                          borderRadius: '12px',
                          backgroundColor: c.targetedGroup && !c.targetedGroup.includes('General') ? '#fef3c7' : '#f1f5f9',
                          color: c.targetedGroup && !c.targetedGroup.includes('General') ? '#92400e' : '#475569',
                          fontWeight: 600,
                        }}
                      >
                        {c.targetedGroup || 'सामान्य'}
                      </span>
                    </td>

                    <td style={{ padding: '0.85rem 1rem' }}>
                      {c.insuranceNumber ? (
                        <span style={{ fontSize: '0.75rem', color: '#15803d', backgroundColor: '#dcfce7', padding: '2px 7px', borderRadius: '6px', fontWeight: 600 }}>
                          ✓ {c.insuranceNumber}
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>छैन</span>
                      )}
                    </td>

                    <td style={{ padding: '0.85rem 1rem' }}>
                      {c.verificationStatus === 'PENDING' ? (
                        <span style={{ backgroundColor: '#fef3c7', color: '#b45309', padding: '3px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, border: '1px solid #fde68a', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          ⏳ अनलाइन दर्ता (प्रतिक्षारत)
                        </span>
                      ) : c.verificationStatus === 'REJECTED' ? (
                        <span style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '3px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>
                          ❌ अस्वीकृत
                        </span>
                      ) : (
                        <span style={{ backgroundColor: '#dcfce7', color: '#15803d', padding: '3px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          ✓ प्रमाणीकृत {c.isPublic !== false ? '(सार्वजनिक)' : ''}
                        </span>
                      )}
                      <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
                        {c.source === 'PUBLIC_PORTAL' ? '🌐 सार्वजनिक अनलाइन' : '🏢 कार्यालय प्रविष्टि'}
                      </div>
                    </td>

                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: 'var(--text-main, #1e293b)' }}>
                      {c.servicePurpose || 'प्रशासनिक'}
                    </td>

                    <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem' }}>
                        {c.verificationStatus === 'PENDING' && (
                          <button
                            title="नागरिक लगत प्रमाणीकरण (Verify & Approve)"
                            onClick={() => {
                              setVerifyingCitizen(c);
                              setVerifyIsPublic(true);
                              setVerifyRemarks('');
                              setIsVerifyModalOpen(true);
                            }}
                            style={{
                              backgroundColor: '#16a34a',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '5px 10px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '0.775rem',
                              fontWeight: 700,
                              boxShadow: '0 2px 4px rgba(22, 163, 74, 0.25)',
                            }}
                          >
                            <ShieldCheck size={14} />
                            <span>भेरिफाई</span>
                          </button>
                        )}
                        <button
                          title="डिजिटल परिचयपत्र / टोकन स्लिप"
                          onClick={() => {
                            setViewingCitizen(c);
                            setIsProfileSlipOpen(true);
                          }}
                          style={{
                            backgroundColor: '#eff6ff',
                            color: '#1d4ed8',
                            border: '1px solid #bfdbfe',
                            borderRadius: '6px',
                            padding: '5px 8px',
                            cursor: 'pointer',
                          }}
                        >
                          <Printer size={15} />
                        </button>
                        <button
                          title="सम्पादन गर्नुहोस्"
                          onClick={() => handleOpenEdit(c)}
                          style={{
                            backgroundColor: '#f8fafc',
                            color: '#0f172a',
                            border: '1px solid #cbd5e1',
                            borderRadius: '6px',
                            padding: '5px 8px',
                            cursor: 'pointer',
                          }}
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          title="हटाउनुहोस्"
                          onClick={() => handleDeleteCitizen(c)}
                          style={{
                            backgroundColor: '#fef2f2',
                            color: '#dc2626',
                            border: '1px solid #fecaca',
                            borderRadius: '6px',
                            padding: '5px 8px',
                            cursor: 'pointer',
                          }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
</div>
        </div>
      </div>

      {/* MODAL: VERIFICATION REVIEW */}
      {isVerifyModalOpen && verifyingCitizen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '650px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#f8fafc',
                borderTopLeftRadius: '16px',
                borderTopRightRadius: '16px',
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                  नागरिक लगत प्रमाणीकरण (Verification Review)
                </h3>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  स्रोत: {verifyingCitizen.source === 'PUBLIC_PORTAL' ? '🌐 सार्वजनिक अनलाइन दर्ता' : '🏢 कार्यालय प्रविष्टि'}
                </span>
              </div>
              <button
                onClick={() => {
                  setIsVerifyModalOpen(false);
                  setVerifyingCitizen(null);
                }}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Details */}
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '10px', padding: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.875rem' }}>
                  <div><strong>नागरिकको नाम:</strong> {verifyingCitizen.fullName}</div>
                  <div><strong>English:</strong> {verifyingCitizen.fullNameEn || '—'}</div>
                  <div><strong>नागरिक कोड:</strong> {verifyingCitizen.citizenCode}</div>
                  <div><strong>लिङ्ग:</strong> {verifyingCitizen.gender === 'FEMALE' ? 'महिला' : verifyingCitizen.gender === 'MALE' ? 'पुरुष' : 'अन्य'}</div>
                  <div><strong>सम्पर्क फोन:</strong> {verifyingCitizen.phone || '—'}</div>
                  <div><strong>नागरिकता नं.:</strong> {verifyingCitizen.citizenshipNo || '—'}</div>
                  <div><strong>राष्ट्रिय परिचयपत्र:</strong> {verifyingCitizen.nationalId || '—'}</div>
                  <div><strong>ठेगाना:</strong> वडा नं. {verifyingCitizen.wardNumber}, {verifyingCitizen.tole || verifyingCitizen.address}</div>
                  <div><strong>लक्षित वर्ग:</strong> {verifyingCitizen.targetedGroup || 'सामान्य'}</div>
                  <div><strong>सेवा प्रयोजन:</strong> {verifyingCitizen.servicePurpose || 'प्रशासनिक'}</div>
                </div>
              </div>

              {/* Public toggle & remarks */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, color: '#1e293b' }}>
                  <input
                    type="checkbox"
                    checked={verifyIsPublic}
                    onChange={(e) => setVerifyIsPublic(e.target.checked)}
                  />
                  <span>सार्वजनिक नागरिक पोर्टलमा प्रकाशित गर्ने (Show in Public Registry)</span>
                </label>
                <p style={{ margin: '0.25rem 0 0 1.5rem', fontSize: '0.78rem', color: '#64748b' }}>
                  यदि चिन्ह लगाइएमा, यो नागरिकको नाम, वडा र सार्वजनिक विवरण सार्वजनिक नागरिक पोर्टलमा प्रकाशित हुनेछ।
                </p>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                  प्रमाणीकरण टिप्पणी / कैफियत (Remarks)
                </label>
                <input
                  type="text"
                  placeholder="जस्तै: नागरिकता र वडा लगत रुजु भएको..."
                  value={verifyRemarks}
                  onChange={(e) => setVerifyRemarks(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.875rem',
                  }}
                />
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('के तपाईं यो दर्ता अस्वीकृत गर्न निश्चित हुनुहुन्छ?')) {
                      verifyMutation.mutate({
                        id: verifyingCitizen.id,
                        status: 'REJECTED',
                        isPublic: false,
                        remarks: verifyRemarks || 'कागजात अपुग वा अमान्य',
                      });
                    }
                  }}
                  disabled={verifyMutation.isPending}
                  style={{
                    padding: '0.65rem 1.25rem',
                    backgroundColor: '#fee2e2',
                    color: '#dc2626',
                    border: '1px solid #fecaca',
                    borderRadius: '8px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  ❌ अस्वीकार गर्नुहोस्
                </button>

                <button
                  type="button"
                  onClick={() => {
                    verifyMutation.mutate({
                      id: verifyingCitizen.id,
                      status: 'VERIFIED',
                      isPublic: verifyIsPublic,
                      remarks: verifyRemarks || 'प्रमाणीकरण सम्पन्न',
                    });
                  }}
                  disabled={verifyMutation.isPending}
                  style={{
                    padding: '0.65rem 1.5rem',
                    backgroundColor: '#16a34a',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 2px 6px rgba(22, 163, 74, 0.3)',
                  }}
                >
                  <CheckCircle2 size={18} />
                  <span>{verifyMutation.isPending ? 'प्रमाणीकरण हुँदै...' : '✓ प्रमाणीकरण (Verify & Approve)'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT CITIZEN */}
      {isFormOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '850px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#f8fafc',
                borderTopLeftRadius: '16px',
                borderTopRightRadius: '16px',
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                  {editingCitizen ? 'नागरिक / सेवाग्राही विवरण सम्पादन' : 'नयाँ नागरिक / सेवाग्राही दर्ता फारम'}
                </h3>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                  पाँचपोखरी थाङपाल गाउँपालिका — राष्ट्रिय परिचयपत्र तथा एकीकृत नागरिक डेटाबेस
                </p>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
              >
                <X size={22} />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', backgroundColor: '#ffffff', padding: '0 1.5rem' }}>
              <button
                onClick={() => setActiveTab('personal')}
                style={{
                  padding: '0.75rem 1rem',
                  border: 'none',
                  background: 'none',
                  borderBottom: activeTab === 'personal' ? '3px solid #2563eb' : '3px solid transparent',
                  color: activeTab === 'personal' ? '#2563eb' : '#64748b',
                  fontWeight: activeTab === 'personal' ? 700 : 500,
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                }}
              >
                १. व्यक्तिगत विवरण
              </button>
              <button
                onClick={() => setActiveTab('address')}
                style={{
                  padding: '0.75rem 1rem',
                  border: 'none',
                  background: 'none',
                  borderBottom: activeTab === 'address' ? '3px solid #2563eb' : '3px solid transparent',
                  color: activeTab === 'address' ? '#2563eb' : '#64748b',
                  fontWeight: activeTab === 'address' ? 700 : 500,
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                }}
              >
                २. ठेगाना र परिवार
              </button>
              <button
                onClick={() => setActiveTab('social')}
                style={{
                  padding: '0.75rem 1rem',
                  border: 'none',
                  background: 'none',
                  borderBottom: activeTab === 'social' ? '3px solid #2563eb' : '3px solid transparent',
                  color: activeTab === 'social' ? '#2563eb' : '#64748b',
                  fontWeight: activeTab === 'social' ? 700 : 500,
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                }}
              >
                ३. सामाजिक तथा स्वास्थ्य बीमा
              </button>
              <button
                onClick={() => setActiveTab('service')}
                style={{
                  padding: '0.75rem 1rem',
                  border: 'none',
                  background: 'none',
                  borderBottom: activeTab === 'service' ? '3px solid #2563eb' : '3px solid transparent',
                  color: activeTab === 'service' ? '#2563eb' : '#64748b',
                  fontWeight: activeTab === 'service' ? 700 : 500,
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                }}
              >
                ४. पालिका सेवा प्रयोजन
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSaveCitizen} style={{ padding: '1.5rem', flex: 1 }}>
              {activeTab === 'personal' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                      पूरा नाम (नेपालीमा) <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="उदा: सुनिता तामाङ"
                      value={formData.fullName || ''}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                      Full Name (In English)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Sunita Tamang"
                      value={formData.fullNameEn || ''}
                      onChange={(e) => setFormData({ ...formData, fullNameEn: e.target.value })}
                      style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                      राष्ट्रिय परिचयपत्र नं. (NID No.)
                    </label>
                    <input
                      type="text"
                      placeholder="उदा: NID-9823-4412"
                      value={formData.nationalId || ''}
                      onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                      style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                      नागरिकता प्रमाणपत्र नं.
                    </label>
                    <input
                      type="text"
                      placeholder="उदा: २७-०१-७९-००४२८"
                      value={formData.citizenshipNo || ''}
                      onChange={(e) => setFormData({ ...formData, citizenshipNo: e.target.value })}
                      style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                      नागरिकता जारी जिल्ला
                    </label>
                    <input
                      type="text"
                      value={formData.issuedDistrict || 'सिन्धुपाल्चोक'}
                      onChange={(e) => setFormData({ ...formData, issuedDistrict: e.target.value })}
                      style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                      लिङ्ग
                    </label>
                    <select
                      value={formData.gender || 'FEMALE'}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                      style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    >
                      <option value="FEMALE">महिला (Female)</option>
                      <option value="MALE">पुरुष (Male)</option>
                      <option value="OTHER">अन्य (Other)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                      जन्ममिति (वि.सं.)
                    </label>
                    <input
                      type="text"
                      placeholder="उदा: २०५५-०४-१०"
                      value={formData.dobBs || ''}
                      onChange={(e) => setFormData({ ...formData, dobBs: e.target.value })}
                      style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                      रक्त समूह (Blood Group)
                    </label>
                    <select
                      value={formData.bloodGroup || 'O+'}
                      onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                      style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    >
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="थाहा नभएको">थाहा नभएको</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                      वैवाहिक स्थिति
                    </label>
                    <select
                      value={formData.maritalStatus || 'विवाहित'}
                      onChange={(e) => setFormData({ ...formData, maritalStatus: e.target.value })}
                      style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    >
                      <option value="विवाहित">विवाहित (Married)</option>
                      <option value="अविवाहित">अविवाहित (Unmarried)</option>
                      <option value="एकल/बिधवा">एकल / बिधवा (Single/Widow)</option>
                      <option value="सम्बन्धविच्छेद">सम्बन्धविच्छेद (Divorced)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                      पेशा (Occupation)
                    </label>
                    <input
                      type="text"
                      placeholder="उदा: कृषि, व्यापार, शिक्षण"
                      value={formData.occupation || ''}
                      onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                      style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                </div>
              )}

              {activeTab === 'address' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                      वडा नम्बर <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <select
                      value={formData.wardNumber || 1}
                      onChange={(e) => setFormData({ ...formData, wardNumber: Number(e.target.value) })}
                      style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                        <option key={num} value={num}>
                          वडा नं. {num}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                      गाउँ / टोल
                    </label>
                    <input
                      type="text"
                      placeholder="उदा: भोताङ, मानेखर्क, तिपेनी"
                      value={formData.tole || ''}
                      onChange={(e) => setFormData({ ...formData, tole: e.target.value })}
                      style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                      स्थायी ठेगाना
                    </label>
                    <input
                      type="text"
                      value={formData.address || 'पाँचपोखरी थाङपाल गाउँपालिका'}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                      मोबाइल नम्बर
                    </label>
                    <input
                      type="tel"
                      placeholder="उदा: ९८४१२३४५६७"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                      बाबुको पूरा नाम
                    </label>
                    <input
                      type="text"
                      value={formData.fatherName || ''}
                      onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                      style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                      आमाको पूरा नाम
                    </label>
                    <input
                      type="text"
                      value={formData.motherName || ''}
                      onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                      style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                      पति / पत्नीको नाम
                    </label>
                    <input
                      type="text"
                      value={formData.spouseName || ''}
                      onChange={(e) => setFormData({ ...formData, spouseName: e.target.value })}
                      style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                      आपतकालीन सम्पर्क व्यक्ति र फोन
                    </label>
                    <input
                      type="text"
                      placeholder="उदा: दोर्जे तामाङ (९८१२३४५६७८)"
                      value={formData.emergencyContactName || ''}
                      onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                      style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                </div>
              )}

              {activeTab === 'social' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                      लक्षित वर्ग समूह (Targeted Inclusion Group)
                    </label>
                    <select
                      value={formData.targetedGroup || 'सामान्य नागरिक (General)'}
                      onChange={(e) => setFormData({ ...formData, targetedGroup: e.target.value })}
                      style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    >
                      {TARGETED_GROUPS.filter((g) => g !== 'सबै लक्षित वर्ग').map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                      स्वास्थ्य बीमा नम्बर (Health Insurance No.)
                    </label>
                    <input
                      type="text"
                      placeholder="उदा: HIB-8192-3312"
                      value={formData.insuranceNumber || ''}
                      onChange={(e) => setFormData({ ...formData, insuranceNumber: e.target.value })}
                      style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                      पारिवारिक वार्षिक आय स्तर
                    </label>
                    <select
                      style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    >
                      <option>विपन्न (वार्षिक रु २ लाख भन्दा कम)</option>
                      <option>मध्यम (वार्षिक रु २ देखि ५ लाख)</option>
                      <option>सबल (वार्षिक रु ५ लाख भन्दा माथि)</option>
                    </select>
                  </div>
                </div>
              )}

              {activeTab === 'service' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                      हाल पालिकामा सेवा लिन आउनुको मुख्य प्रयोजन / शाखा
                    </label>
                    <select
                      value={formData.servicePurpose || 'स्वास्थ्य उपचार तथा परामर्श (EHR/OPD)'}
                      onChange={(e) => setFormData({ ...formData, servicePurpose: e.target.value })}
                      style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    >
                      {SERVICE_PURPOSES.filter((p) => p !== 'सबै सेवा प्रयोजन').map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                      विशेष टिप्पणी / कैफियत (Remarks)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="सेवाग्राहीको माग, पेश गरेको कागजात वा विशेष निर्देशन..."
                      style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                </div>
              )}

              {/* Bottom Actions */}
              <div
                style={{
                  marginTop: '1.5rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {activeTab !== 'personal' && (
                    <button
                      type="button"
                      onClick={() => {
                        if (activeTab === 'address') setActiveTab('personal');
                        if (activeTab === 'social') setActiveTab('address');
                        if (activeTab === 'service') setActiveTab('social');
                      }}
                      style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', cursor: 'pointer' }}
                    >
                      पछाडि
                    </button>
                  )}
                  {activeTab !== 'service' && (
                    <button
                      type="button"
                      onClick={() => {
                        if (activeTab === 'personal') setActiveTab('address');
                        if (activeTab === 'address') setActiveTab('social');
                        if (activeTab === 'social') setActiveTab('service');
                      }}
                      style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #2563eb', backgroundColor: '#eff6ff', color: '#2563eb', fontWeight: 600, cursor: 'pointer' }}
                    >
                      अर्को चरण →
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    style={{ padding: '0.6rem 1.25rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', cursor: 'pointer' }}
                  >
                    रद्द गर्नुहोस्
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: '0.6rem 1.5rem',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: '#2563eb',
                      color: '#ffffff',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
                    }}
                  >
                    {editingCitizen ? 'विवरण अद्यावधिक गर्नुहोस्' : 'नागरिक दर्ता सुरक्षित गर्नुहोस्'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PRINTABLE CITIZEN SLIP & DIGITAL ID */}
      {isProfileSlipOpen && viewingCitizen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '650px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Modal Actions */}
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, color: '#0f172a' }}>डिजिटल नागरिक पहिचान तथा सेवा स्लिप</span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => window.print()}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
                >
                  <Printer size={15} /> प्रिन्ट गर्नुहोस्
                </button>
                <button onClick={() => setIsProfileSlipOpen(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Printable Slip Container */}
            <div style={{ padding: '2rem', border: '2px solid #0f172a', margin: '1.5rem', borderRadius: '12px', position: 'relative' }}>
              {/* Slip Header */}
              <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>नेपाल सरकार • बागमती प्रदेश</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#b91c1c' }}>पाँचपोखरी थाङपाल गाउँपालिका</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>गाउँ कार्यपालिकाको कार्यालय, थाङपालधाप, सिन्धुपाल्चोक</div>
                <div style={{ marginTop: '0.5rem', display: 'inline-block', backgroundColor: '#0f172a', color: '#ffffff', padding: '0.2rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700 }}>
                  नागरिक लगत तथा सेवाग्राही पहिचान पत्र (Citizen Master Slip)
                </div>
              </div>

              {/* Citizen Details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{viewingCitizen.fullName}</div>
                  <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '0.75rem' }}>{viewingCitizen.fullNameEn || ''}</div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.85rem' }}>
                    <div><strong>नागरिक कोड:</strong> <span style={{ fontFamily: 'monospace', color: '#2563eb' }}>{viewingCitizen.citizenCode || (viewingCitizen.id ? `CIT-${viewingCitizen.id.slice(0, 5)}` : 'CIT-NEW')}</span></div>
                    <div><strong>राष्ट्रिय परिचयपत्र:</strong> {viewingCitizen.nationalId || '—'}</div>
                    <div><strong>नागरिकता नं.:</strong> {viewingCitizen.citizenshipNo || '—'}</div>
                    <div><strong>जन्ममिति:</strong> {viewingCitizen.dobBs || '—'}</div>
                    <div><strong>लिङ्ग / रक्त समूह:</strong> {viewingCitizen.gender} / <span style={{ color: '#dc2626' }}>{viewingCitizen.bloodGroup || '—'}</span></div>
                    <div><strong>ठेगाना:</strong> वडा नं. {viewingCitizen.wardNumber}, {viewingCitizen.tole || ''}</div>
                    <div><strong>सम्पर्क नं.:</strong> {viewingCitizen.phone || '—'}</div>
                    <div><strong>स्वास्थ्य बीमा:</strong> {viewingCitizen.insuranceNumber || 'छैन'}</div>
                  </div>
                </div>

                {/* QR / Photo Placeholder */}
                <div style={{ border: '1px dashed #94a3b8', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0.5rem', textAlign: 'center' }}>
                  <QrCode size={64} style={{ color: '#0f172a', marginBottom: '0.25rem' }} />
                  <span style={{ fontSize: '0.65rem', color: '#64748b' }}>आधिकारिक QR लगत</span>
                </div>
              </div>

              {/* Service Details */}
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                <div><strong>सेवा प्रयोजन:</strong> {viewingCitizen.servicePurpose || 'प्रशासनिक सेवा'}</div>
                <div><strong>लक्षित वर्ग समूह:</strong> {viewingCitizen.targetedGroup || 'सामान्य नागरिक'}</div>
                <div><strong>दर्ता मिति:</strong> {new Date().toLocaleDateString('ne-NP')}</div>
              </div>

              {/* Clean for Cash Wallet Summary */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#166534', fontWeight: 700 }}>
                  <Leaf size={18} />
                  Clean for Cash (फोहोरबाट मोहर) खाता
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.7rem', color: '#15803d' }}>जम्मा पोइन्ट / रकम</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#166534' }}>रु. ४५०.००</div>
                  </div>
                  <Wallet size={24} style={{ color: '#22c55e' }} />
                </div>
              </div>

              {/* Signature footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px dashed #cbd5e1', fontSize: '0.8rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '140px', borderTop: '1px solid #0f172a', paddingTop: '4px' }}>सेवाग्राहीको दस्तखत</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '140px', borderTop: '1px solid #0f172a', paddingTop: '4px' }}>प्रमाणीकरण गर्ने अधिकृत</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: WASTE PICKUP REQUEST */}
      {isWasteModalOpen && wasteRequestCitizen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', width: '100%', maxWidth: '500px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f0fdf4', borderRadius: '12px 12px 0 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#166534', fontWeight: 700 }}>
                <Leaf size={20} /> फोहोर संकलन अनुरोध
              </div>
              <button onClick={() => setIsWasteModalOpen(false)} style={{ background: 'none', border: 'none', color: '#15803d', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1rem', fontSize: '0.9rem', color: '#334155' }}>
                नागरिक: <strong>{wasteRequestCitizen.fullName}</strong> (वडा नं. {wasteRequestCitizen.wardNumber})
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>फोहोरको प्रकार (छान्नुहोस्)</label>
                <select style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                  <option>प्लास्टिक र पेट बोतल (Recyclable)</option>
                  <option>कागज र गत्ता (Recyclable)</option>
                  <option>फलाम र धातु (Recyclable)</option>
                  <option>अर्गानिक / कुहिने (Organic)</option>
                  <option>मिश्रित फोहोर (General Waste)</option>
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>अन्दाजी तौल (किलोग्राममा)</label>
                <input type="number" placeholder="उदा: ५" style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>संकलन मिति र समय</label>
                <input type="datetime-local" style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button onClick={() => setIsWasteModalOpen(false)} style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}>रद्द गर्नुहोस्</button>
                <button onClick={() => {
                  alert('फोहोर संकलन अनुरोध सफलतापूर्वक दर्ता भयो!');
                  setIsWasteModalOpen(false);
                }} style={{ padding: '0.6rem 1.5rem', borderRadius: '8px', border: 'none', background: '#16a34a', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>अनुरोध पठाउनुहोस्</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CitizenPortalPage;
