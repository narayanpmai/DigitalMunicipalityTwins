import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenant } from '../../context/TenantContext';
import {
  Shield,
  Settings,
  Users,
  Layers,
  Save,
  CheckCircle2,
  Plus,
  Activity,
  X,
  Edit2,
  Building2,
  ShieldCheck,
  FileText,
  Clock,
  Phone,
  Mail,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Search,
  Check,
  Trash2,
  ExternalLink,
  UserCheck,
  UserX,
  AlertCircle,
  UserPlus,
  HeartPulse,
  Database,
  FileSpreadsheet,
  CalendarRange,
} from 'lucide-react';
import { ROLE_DEFINITIONS } from '../super-admin/SuperAdminPage';
import { branchesApi, type Branch } from '../../api/branches';
import { rtiApi, type RtiRequest, type RtiStatus } from '../../api/rti';
import { usersApi, type User as ApiUser, type Role as ApiRole } from '../../api/users';
import { UserActionModal } from './UserActionModal';
import { SecurityAuditPage } from '../security-audit/SecurityAuditPage';
import { BackupManagement } from './BackupManagement';
import { DataExportCenter } from './DataExportCenter';
import { FiscalYearManagement } from './FiscalYearManagement';

interface AdminConsolePageProps {
  defaultTab?: 'settings' | 'users' | 'wards' | 'branches' | 'rti' | 'audit' | 'permissions' | 'backup' | 'export' | 'fiscal-year';
}

export const AdminConsolePage: React.FC<AdminConsolePageProps> = ({ defaultTab }) => {
  const queryClient = useQueryClient();
  const { settings, tenantId } = useTenant();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlTab = searchParams.get('tab') as any;

  const [activeTab, setActiveTab] = useState<'settings' | 'users' | 'wards' | 'branches' | 'rti' | 'audit' | 'permissions' | 'backup' | 'export' | 'fiscal-year'>(
    urlTab || defaultTab || 'settings'
  );

  useEffect(() => {
    if (urlTab && urlTab !== activeTab) {
      setActiveTab(urlTab);
    }
  }, [urlTab]);

  // Municipal Settings Form State
  const [palikaName, setPalikaName] = useState(settings?.palika_name || 'पाँचपोखरी थाङपाल गाउँपालिका');
  const [slogan, setSlogan] = useState(settings?.slogan || 'आधुनिक, सुशासनयुक्त र समृद्ध पालिका');
  const [phone, setPhone] = useState(settings?.phone || '011-690***');
  const [email, setEmail] = useState(settings?.email || 'info@panchpokhari.gov.np');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const { data: realUsers = [], isLoading: isLoadingUsers } = useQuery<ApiUser[]>({
    queryKey: ['users'],
    queryFn: () => usersApi.getAll(),
  });

  const toggleUserActiveMutation = useMutation({
    mutationFn: (id: string) => usersApi.toggleActive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: () => {
      alert('स्थिति परिवर्तन गर्न असफल भयो।');
    }
  });

  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  const handleOpenUserModal = (user?: any) => {
    setEditingUser(user || null);
    setUserModalOpen(true);
  };

  // User Management State & Category Filters
  const [userCategoryFilter, setUserCategoryFilter] = useState<'all' | 'pending' | 'health' | 'staff' | 'public'>('all');
  const [userSearchTerm, setUserSearchTerm] = useState('');

  const healthRoles = ['health_officer', 'medical_officer', 'lab_technician', 'pharmacist'];
  const pendingUsers = useMemo(() => realUsers.filter(u => !(u.isActive ?? (u as any).is_active)), [realUsers]);
  const healthUsers = useMemo(() => realUsers.filter(u => healthRoles.includes(u.role || '')), [realUsers]);
  const publicUsers = useMemo(() => realUsers.filter(u => u.role?.startsWith('public_')), [realUsers]);
  const staffUsers = useMemo(() => realUsers.filter(u => !u.role?.startsWith('public_') && !healthRoles.includes(u.role || '')), [realUsers]);

  const filteredUsers = useMemo(() => {
    return realUsers.filter(u => {
      const active = (u.isActive ?? (u as any).is_active) ?? true;
      if (userCategoryFilter === 'pending' && active) return false;
      if (userCategoryFilter === 'health' && !healthRoles.includes(u.role || '')) return false;
      if (userCategoryFilter === 'public' && !u.role?.startsWith('public_')) return false;
      if (userCategoryFilter === 'staff' && (u.role?.startsWith('public_') || healthRoles.includes(u.role || ''))) return false;

      if (userSearchTerm.trim()) {
        const q = userSearchTerm.toLowerCase();
        const matchName = (u.fullName || (u as any).full_name || '').toLowerCase().includes(q);
        const matchEmail = (u.email || '').toLowerCase().includes(q);
        const matchRole = (u.role || '').toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchRole) return false;
      }
      return true;
    });
  }, [realUsers, userCategoryFilter, userSearchTerm]);

  // Branches State & API Query
  const [branchTypeFilter, setBranchTypeFilter] = useState<'all' | 'palika' | 'ward'>('all');
  const [branchSearch, setBranchSearch] = useState('');
  const [expandedBranchId, setExpandedBranchId] = useState<string | null>(null);

  const { data: branches = [], isLoading: isLoadingBranches } = useQuery<Branch[]>({
    queryKey: ['branches', branchTypeFilter],
    queryFn: () => branchesApi.getAll(branchTypeFilter),
  });

  // RTI (Right to Information) State & API Query
  const [rtiStatusFilter, setRtiStatusFilter] = useState<string>('all');
  const [rtiSearch, setRtiSearch] = useState('');
  const [selectedRti, setSelectedRti] = useState<RtiRequest | null>(null);
  const [rtiActionNotes, setRtiActionNotes] = useState('');
  const [rtiAttachmentUrl, setRtiAttachmentUrl] = useState('');
  const [rtiStatusUpdate, setRtiStatusUpdate] = useState<RtiStatus>('pending');

  const { data: rtiRequests = [], isLoading: isLoadingRti } = useQuery<RtiRequest[]>({
    queryKey: ['rtiRequests', rtiStatusFilter],
    queryFn: () => rtiApi.getAll(rtiStatusFilter),
  });

  // Complete Features / Modules Matrix (5-Layer Digital Twin)
  const FEATURES = [
    { id: 'f_executive', name: 'कार्यपालिका कमान्ड ड्यासवोर्ड (Executive BI)' },
    { id: 'f_dashboard', name: 'दैनिक कार्यसञ्चालन (Overview)' },
    { id: 'f_progress', name: 'प्रगति तथा अनुगमन प्रतिवेदन (Progress Reports)' },
    { id: 'f_ai', name: 'एआई पालिका सहायक (AI Municipal Copilot)' },
    { id: 'f_mdm', name: 'मास्टर डाटा व्यवस्थापन (MDM Core Foundation)' },
    { id: 'f_master', name: 'घरधुरी तथा जनसांख्यिकी ३६० (Household Demographics)' },
    { id: 'f_eoffice', name: 'एकीकृत ई-अफिस तथा टिप्पणी (E-Office Tippani)' },
    { id: 'f_darta', name: 'दर्ता तथा चलानी अभिलेख (Darta Chalani)' },
    { id: 'f_digital_sifaris', name: 'डिजिटल सिफारिस प्रणाली (Digital Sifaris 40+)' },
    { id: 'f_portal', name: 'नागरिक सेवा पोर्टल (Citizen 360)' },
    { id: 'f_charter', name: 'नागरिक बडापत्र (Citizen Charter)' },
    { id: 'f_project_lifecycle', name: 'सम्पूर्ण आयोजना जीवनचक्र ३६० (Project Lifecycle)' },
    { id: 'f_planning', name: 'वार्षिक योजना तथा कार्यक्रम (Planning & LMBIS)' },
    { id: 'f_ebps', name: 'डिजिटल नक्सा पास (e-BPS Building Permit)' },
    { id: 'f_asset_twin', name: '३डी/जीआईएस डिजिटल ट्विन (3D GIS Asset Twin)' },
    { id: 'f_gis', name: 'डिजिटल क्याडास्ट्रल नक्सा (GIS Map)' },
    { id: 'f_vital', name: 'सामाजिक सुरक्षा तथा घटना दर्ता (SSIS)' },
    { id: 'f_revenue', name: 'स्थानीय राजस्व तथा कर (e-Tax)' },
    { id: 'f_business', name: 'व्यवसाय दर्ता तथा नियमन (Business Registration)' },
    { id: 'f_grievance', name: 'नागरिक गुनासो व्यवस्थापन (Grievance Redressal)' },
    { id: 'f_disaster', name: 'विपद् जोखिम व्यवस्थापन (Disaster Risk Twin)' },
    { id: 'f_education', name: 'शिक्षा तथा विद्यालय व्यवस्थापन (Education IEMIS)' },
    { id: 'f_health', name: 'स्वास्थ्य सेवा व्यवस्थापन (Health HMIS)' },
    { id: 'f_agriculture', name: 'कृषि तथा कृषक प्रोफाइल (Agriculture & Farmer Twin)' },
    { id: 'f_tourism', name: 'पर्यटन तथा सम्पदा (Tourism & Cultural Twin)' },
    { id: 'f_library', name: 'डिजिटल पुस्तकालय (Digital Library)' },
    { id: 'f_museum', name: 'सांस्कृतिक सङ्ग्रहालय (Cultural Museum)' }
  ];

  // Map of Roles to assigned Feature IDs
  const { data: dbRoles = [], isLoading: isLoadingRoles } = useQuery<ApiRole[]>({
    queryKey: ['roles'],
    queryFn: async () => {
      const roles = await usersApi.getRoles();
      if (Array.isArray(roles) && roles.length > 0) {
        try {
          localStorage.setItem('p5_role_permissions', JSON.stringify(roles));
        } catch {}
      }
      return roles;
    },
  });

  const updateRolePermissionsMutation = useMutation({
    mutationFn: ({ roleName, permissions }: { roleName: string; permissions: string[] }) =>
      usersApi.updateRolePermissions(roleName, permissions),
    onSuccess: (_savedRole, variables) => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      try {
        const cached = localStorage.getItem('p5_role_permissions');
        let list: any[] = cached ? JSON.parse(cached) : [];
        const idx = list.findIndex((r: any) => r.name === variables.roleName);
        if (idx >= 0) {
          list[idx].permissions = variables.permissions;
        } else {
          list.push({ name: variables.roleName, permissions: variables.permissions });
        }
        localStorage.setItem('p5_role_permissions', JSON.stringify(list));
      } catch {}
    },
    onError: (error) => {
      console.error('Failed to update role permissions:', error);
      alert('अनुमति अद्यावधिक गर्दा त्रुटि भयो।');
    }
  });

  const handleTogglePermission = (roleId: string, featureId: string) => {
    const role = dbRoles.find(r => r.name === roleId);
    if (!role) return;

    const currentPermissions = role.permissions || [];
    const updated = currentPermissions.includes(featureId)
      ? currentPermissions.filter(id => id !== featureId)
      : [...currentPermissions, featureId];

    updateRolePermissionsMutation.mutate({ roleName: roleId, permissions: updated });
  };

  const handleGrantAllPermissions = () => {
    if (!window.confirm('के तपाईं निश्चित हुनुहुन्छ? यसले सबै भूमिकाहरूलाई सबै सुविधाहरूको पहुँच दिनेछ।')) return;

    ROLE_DEFINITIONS.filter(r => r.value !== 'super_admin' && r.value !== 'it_admin').forEach(role => {
      updateRolePermissionsMutation.mutate({ roleName: role.value, permissions: FEATURES.map(f => f.id) });
    });
  };

  const handleRevokeAllPermissions = () => {
    if (!window.confirm('के तपाईं निश्चित हुनुहुन्छ? यसले सबै भूमिकाहरूबाट सबै सुविधाहरूको पहुँच हटाउनेछ।')) return;

    ROLE_DEFINITIONS.filter(r => r.value !== 'super_admin' && r.value !== 'it_admin').forEach(role => {
      updateRolePermissionsMutation.mutate({ roleName: role.value, permissions: [] });
    });
  };

  const handleToggleRoleAllPermissions = (roleId: string) => {
    const role = dbRoles.find(r => r.name === roleId);
    const currentPermissions = role?.permissions || [];
    // If they already have all permissions, clear them; otherwise grant all
    const permissions = currentPermissions.length === FEATURES.length ? [] : FEATURES.map(f => f.id);
    updateRolePermissionsMutation.mutate({ roleName: roleId, permissions });
  };

  const handleToggleFeatureAllRoles = (featureId: string) => {
    const validRoles = ROLE_DEFINITIONS.filter(r => r.value !== 'super_admin' && r.value !== 'it_admin');

    // Check if every valid role already has this feature
    const allHaveIt = validRoles.every(role => {
      const dbRole = dbRoles.find(r => r.name === role.value);
      return dbRole ? (dbRole.permissions || []).includes(featureId) : false;
    });

    // Update each role
    validRoles.forEach(role => {
      const dbRole = dbRoles.find(r => r.name === role.value);
      const currentPermissions = dbRole ? (dbRole.permissions || []) : [];

      let updated: string[];
      if (allHaveIt) {
        // revoke from all
        updated = currentPermissions.filter(id => id !== featureId);
      } else {
        // grant to all
        updated = currentPermissions.includes(featureId) ? currentPermissions : [...currentPermissions, featureId];
      }
      updateRolePermissionsMutation.mutate({ roleName: role.value, permissions: updated });
    });
  };

  const [branchModalOpen, setBranchModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Partial<Branch> | null>(null);
  const [responsibilitiesText, setResponsibilitiesText] = useState('');

  const handleOpenBranchModal = (branch?: Branch) => {
    if (branch) {
      setEditingBranch(branch);
      setResponsibilitiesText(branch.rolesAndResponsibilities ? branch.rolesAndResponsibilities.join('\n') : '');
    } else {
      setEditingBranch({
        name: '',
        code: '',
        type: 'palika',
        wardNumber: undefined,
        headEmployeeName: '',
        contactPhone: '',
        email: '',
        isInformationOfficerBranch: false,
        isGrievanceOfficerBranch: false,
        status: 'active',
      });
      setResponsibilitiesText('');
    }
    setBranchModalOpen(true);
  };

  const handleSaveBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBranch || !editingBranch.name) return;

    const parsedRoles = responsibilitiesText
      .split('\n')
      .map(r => r.trim())
      .filter(r => r.length > 0);

    const payload: Partial<Branch> = {
      ...editingBranch,
      rolesAndResponsibilities: parsedRoles,
    };

    try {
      if (editingBranch.id) {
        await branchesApi.update(editingBranch.id, payload);
      } else {
        await branchesApi.create(payload);
      }
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      setBranchModalOpen(false);
    } catch (err) {
      alert('शाखा सुरक्षित गर्दा समस्या आयो।');
    }
  };

  const handleDeleteBranch = async (id: string, name: string) => {
    if (!window.confirm(`के तपाईं निश्चित हुनुहुन्छ "${name}" शाखा हटाउन चाहनुहुन्छ?`)) return;
    try {
      await branchesApi.remove(id);
      queryClient.invalidateQueries({ queryKey: ['branches'] });
    } catch (err) {
      alert('शाखा हटाउन सकिएन।');
    }
  };

  const handleOpenRtiModal = (rti: RtiRequest) => {
    setSelectedRti(rti);
    setRtiActionNotes(rti.actionTakenNotes || '');
    setRtiAttachmentUrl(rti.attachmentUrl || '');
    setRtiStatusUpdate(rti.status);
  };

  const handleSaveRtiAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRti) return;
    try {
      await rtiApi.update(selectedRti.id, {
        actionTakenNotes: rtiActionNotes,
        attachmentUrl: rtiAttachmentUrl,
        status: rtiStatusUpdate,
      });
      queryClient.invalidateQueries({ queryKey: ['rtiRequests'] });
      setSelectedRti(null);
      alert('सूचना मागको कारबाही/निर्णय सफलतापूर्वक अद्यावधिक भयो!');
    } catch (err) {
      alert('अद्यावधिक गर्दा त्रुटि भयो।');
    }
  };

  // Mock Audit Log
  const [auditLogs] = useState([
    { id: 'al1', action: 'कृषि अनुदान वितरण अद्यावधिक', user: 'admin@p5digital.local', module: 'Agriculture', time: '१० मिनेट अगाडि', status: 'success' },
    { id: 'al2', action: 'नयाँ प्रयोगकर्ता खाता सिर्जना (वडा सचिव)', user: 'cao@panchpokhari.gov.np', module: 'User Auth', time: '१ घण्टा अगाडि', status: 'success' },
    { id: 'al3', action: 'डिजिटल बडापत्र दस्तुर संशोधन', user: 'admin@p5digital.local', module: 'Citizen Charter', time: '३ घण्टा अगाडि', status: 'success' },
  ]);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={24} color="var(--primary)" />
            <span>डिजिटल ट्विन प्रशासनिक नियन्त्रण केन्द्र (Admin Console)</span>
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            पालिका ब्रान्डिङ, कर्मचारी अनुमति, वडा व्यवस्थापन र प्रणाली अडिट कन्फिगरेसन
          </p>
        </div>

        <span className="dt-badge dt-badge-info">
          Tenant: {tenantId}
        </span>
      </div>

      {/* Tabs */}
      <div className="dt-card" style={{ padding: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('settings')}
          className={`dt-btn ${activeTab === 'settings' ? 'dt-btn-primary' : 'dt-btn-outline'}`}
        >
          <Settings size={16} />
          <span>प्रणाली सेटिङ तथा ब्रान्डिङ</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`dt-btn ${activeTab === 'users' ? 'dt-btn-primary' : 'dt-btn-outline'}`}
          style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Users size={16} />
          <span>प्रयोगकर्ता तथा भूमिका (Users & Roles)</span>
          {pendingUsers.length > 0 && (
            <span style={{
              backgroundColor: '#ef4444',
              color: '#ffffff',
              fontSize: '0.7rem',
              fontWeight: 800,
              padding: '1px 6px',
              borderRadius: '999px',
              boxShadow: '0 1px 4px rgba(239, 68, 68, 0.4)'
            }}>
              {pendingUsers.length} पेन्डिङ
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('branches')}
          className={`dt-btn ${activeTab === 'branches' ? 'dt-btn-primary' : 'dt-btn-outline'}`}
        >
          <Building2 size={16} />
          <span>शाखा तथा महाशाखा (Branches)</span>
        </button>

        <button
          onClick={() => setActiveTab('rti')}
          className={`dt-btn ${activeTab === 'rti' ? 'dt-btn-primary' : 'dt-btn-outline'}`}
        >
          <FileText size={16} />
          <span>सूचना माग व्यवस्थापन (RTI - सूचना अधिकारी)</span>
        </button>

        <button
          onClick={() => setActiveTab('permissions')}
          className={`dt-btn ${activeTab === 'permissions' ? 'dt-btn-primary' : 'dt-btn-outline'}`}
        >
          <ShieldCheck size={16} />
          <span>अधिकार व्यवस्थापन (Permissions)</span>
        </button>

        <button
          onClick={() => setActiveTab('wards')}
          className={`dt-btn ${activeTab === 'wards' ? 'dt-btn-primary' : 'dt-btn-outline'}`}
        >
          <Layers size={16} />
          <span>वडा प्रोफाइल कन्फिगरेसन</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`dt-btn ${activeTab === 'audit' ? 'dt-btn-primary' : 'dt-btn-outline'}`}
        >
          <Activity size={16} />
          <span>अडिट तथा सुरक्षा लग</span>
        </button>

        <button
          onClick={() => setActiveTab('backup')}
          className={`dt-btn ${activeTab === 'backup' ? 'dt-btn-primary' : 'dt-btn-outline'}`}
        >
          <Database size={16} />
          <span>डाटाबेस ब्याकअप (Backup)</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('export');
            setSearchParams({ tab: 'export' });
          }}
          className={`dt-btn ${activeTab === 'export' ? 'dt-btn-primary' : 'dt-btn-outline'}`}
          style={{
            backgroundColor: activeTab === 'export' ? '#10b981' : undefined,
            borderColor: activeTab === 'export' ? '#059669' : undefined,
            color: activeTab === 'export' ? '#ffffff' : undefined,
          }}
        >
          <FileSpreadsheet size={16} />
          <span>डाटा निर्यात केन्द्र (Data Export)</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('fiscal-year');
            setSearchParams({ tab: 'fiscal-year' });
          }}
          className={`dt-btn ${activeTab === 'fiscal-year' ? 'dt-btn-primary' : 'dt-btn-outline'}`}
          style={{
            backgroundColor: activeTab === 'fiscal-year' ? '#2563eb' : undefined,
            borderColor: activeTab === 'fiscal-year' ? '#1d4ed8' : undefined,
            color: activeTab === 'fiscal-year' ? '#ffffff' : undefined,
          }}
        >
          <CalendarRange size={16} />
          <span>आर्थिक वर्ष व्यवस्थापन (Fiscal Year)</span>
        </button>
      </div>

      {/* Tab 1: System Settings */}
      {activeTab === 'settings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
          <div className="dt-card" style={{ maxWidth: '750px', padding: '2rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem' }}>
              पालिका ब्रान्डिङ तथा आधारभूत विवरण
            </h2>

            {saveSuccess && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--success-light)', color: '#065f46', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem' }}>
                <CheckCircle2 size={16} />
                <span>सेटिङ सफलतापूर्वक सुरक्षित भयो!</span>
              </div>
            )}

            <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                  गाउँपालिकाको नाम (Palika Name) *
                </label>
                <input
                  type="text"
                  required
                  className="dt-input"
                  value={palikaName}
                  onChange={(e) => setPalikaName(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                  पालिकाको नारा (Slogan) *
                </label>
                <input
                  type="text"
                  required
                  className="dt-input"
                  value={slogan}
                  onChange={(e) => setSlogan(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                    आधिकारिक फोन नम्बर
                  </label>
                  <input
                    type="text"
                    className="dt-input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                    आधिकारिक इमेल ठेगाना
                  </label>
                  <input
                    type="email"
                    className="dt-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <button type="submit" className="dt-btn dt-btn-primary" style={{ alignSelf: 'flex-start', marginTop: '0.5rem' }}>
                <Save size={16} />
                <span>परिवर्तन सुरक्षित गर्नुहोस्</span>
              </button>
            </form>
          </div>

          {/* Dedicated Full-Width Database Backup Section */}
          <div style={{ width: '100%' }}>
            <BackupManagement />
          </div>
        </div>
      )}

      {/* Tab 2: Users Management & Approvals */}
      {activeTab === 'users' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Stat Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div className="dt-card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '0.75rem', borderRadius: '12px', background: '#eff6ff', color: '#2563eb' }}>
                <Users size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>जम्मा प्रयोगकर्ता खाता</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{realUsers.length} जना</div>
              </div>
            </div>

            <div className="dt-card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '0.75rem', borderRadius: '12px', background: '#f0fdf4', color: '#16a34a' }}>
                <CheckCircle2 size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>सक्रिय खाताहरू (Active)</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{realUsers.filter(u => (u.isActive ?? (u as any).is_active)).length} जना</div>
              </div>
            </div>

            <div className="dt-card" style={{
              padding: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              border: pendingUsers.length > 0 ? '2px solid #fca5a5' : '1px solid var(--border-color)',
              backgroundColor: pendingUsers.length > 0 ? '#fff5f5' : 'var(--bg-card)',
            }}>
              <div style={{
                padding: '0.75rem',
                borderRadius: '12px',
                background: pendingUsers.length > 0 ? '#fee2e2' : '#f8fafc',
                color: pendingUsers.length > 0 ? '#dc2626' : '#64748b'
              }}>
                <Clock size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: pendingUsers.length > 0 ? '#b91c1c' : 'var(--text-muted)', fontWeight: pendingUsers.length > 0 ? 700 : 400 }}>
                  अनुमोदन पर्खिरहेका (Pending)
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: pendingUsers.length > 0 ? '#dc2626' : 'inherit' }}>
                  {pendingUsers.length} जना
                </div>
              </div>
            </div>

            <div className="dt-card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '0.75rem', borderRadius: '12px', background: '#ffe4e6', color: '#be123c' }}>
                <HeartPulse size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>स्वास्थ्य तथा अस्पताल जनशक्ति</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{healthUsers.length} जना</div>
              </div>
            </div>

            <div className="dt-card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '0.75rem', borderRadius: '12px', background: '#faf5ff', color: '#9333ea' }}>
                <UserCheck size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>सार्वजनिक/नागरिक दर्ता</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{publicUsers.length} जना</div>
              </div>
            </div>
          </div>

          {/* Category Filter Pills & Search Controls */}
          <div className="dt-card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ position: 'relative', width: '280px' }}>
                <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="dt-input"
                  style={{ paddingLeft: '32px' }}
                  placeholder="नाम, इमेल वा भूमिका खोज्नुहोस्..."
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                />
              </div>

              <button
                onClick={() => setUserCategoryFilter('all')}
                className={`dt-btn ${userCategoryFilter === 'all' ? 'dt-btn-primary' : 'dt-btn-outline'}`}
                style={{ fontSize: '0.85rem' }}
              >
                सबै ({realUsers.length})
              </button>

              <button
                onClick={() => setUserCategoryFilter('pending')}
                className={`dt-btn ${userCategoryFilter === 'pending' ? 'dt-btn-primary' : 'dt-btn-outline'}`}
                style={{
                  fontSize: '0.85rem',
                  borderColor: pendingUsers.length > 0 ? '#f87171' : undefined,
                  color: userCategoryFilter !== 'pending' && pendingUsers.length > 0 ? '#dc2626' : undefined,
                  fontWeight: pendingUsers.length > 0 ? 700 : 500
                }}
              >
                ⏳ स्वीकृति पर्खिरहेका ({pendingUsers.length})
              </button>

              <button
                onClick={() => setUserCategoryFilter('health')}
                className={`dt-btn ${userCategoryFilter === 'health' ? 'dt-btn-primary' : 'dt-btn-outline'}`}
                style={{
                  fontSize: '0.85rem',
                  borderColor: userCategoryFilter === 'health' ? '#be123c' : undefined,
                  backgroundColor: userCategoryFilter === 'health' ? '#be123c' : undefined,
                  color: userCategoryFilter === 'health' ? '#ffffff' : '#be123c',
                  fontWeight: healthUsers.length > 0 ? 700 : 500
                }}
              >
                🏥 स्वास्थ्य/अस्पताल जनशक्ति ({healthUsers.length})
              </button>

              <button
                onClick={() => setUserCategoryFilter('staff')}
                className={`dt-btn ${userCategoryFilter === 'staff' ? 'dt-btn-primary' : 'dt-btn-outline'}`}
                style={{ fontSize: '0.85rem' }}
              >
                🏛️ पालिका कर्मचारी ({staffUsers.length})
              </button>

              <button
                onClick={() => setUserCategoryFilter('public')}
                className={`dt-btn ${userCategoryFilter === 'public' ? 'dt-btn-primary' : 'dt-btn-outline'}`}
                style={{ fontSize: '0.85rem' }}
              >
                👥 सार्वजनिक नागरिक ({publicUsers.length})
              </button>
            </div>

            <button className="dt-btn dt-btn-primary" onClick={() => handleOpenUserModal()}>
              <Plus size={16} />
              <span>नयाँ कर्मचारी खाता थप्नुहोस्</span>
            </button>
          </div>

          {/* Users Table */}
          <div className="dt-table-wrapper">
            <div className="dt-responsive-table-wrapper">
              <table className="dt-table">
                <thead>
                  <tr>
                    <th>नाम र प्रयोगकर्ता विवरण</th>
                    <th>इमेल ठेगाना</th>
                    <th>खाता प्रकार / भूमिका (Role)</th>
                    <th>खाता स्थिति</th>
                    <th style={{ textAlign: 'right' }}>प्रमाणीकरण तथा कार्य</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingUsers ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '2.5rem' }}>प्रयोगकर्ताहरू लोड हुँदैछन्...</td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                        कुनै प्रयोगकर्ता फेला परेन।
                      </td>
                    </tr>
                  ) : filteredUsers.map((u) => {
                    const roleDef = ROLE_DEFINITIONS.find(r => r.value === u.role);
                    const isPublicRole = u.role?.startsWith('public_');

                    const userIsActive = (u.isActive !== undefined ? u.isActive : (u as any).is_active) ?? true;
                    const userName = u.fullName || (u as any).full_name || '';

                    return (
                      <tr key={u.id} style={{ backgroundColor: !userIsActive ? '#fffbeb' : undefined }}>
                        <td>
                          <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.95rem' }}>
                            {userName}
                          </div>
                          {isPublicRole && (
                            <span style={{ fontSize: '0.72rem', color: '#0284c7', display: 'inline-flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
                              🌐 अनलाइन दर्ता भएको खाता
                            </span>
                          )}
                        </td>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.88rem' }}>{u.email}</td>
                        <td>
                          <span
                            className="dt-badge"
                            style={{
                              backgroundColor: roleDef?.bg || '#f1f5f9',
                              color: roleDef?.color || '#334155',
                              border: `1px solid ${roleDef?.border || '#cbd5e1'}`,
                              fontWeight: 600,
                              fontSize: '0.8rem'
                            }}
                          >
                            {roleDef?.label || u.role}
                          </span>
                        </td>
                        <td>
                          {userIsActive ? (
                            <span className="dt-badge dt-badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <CheckCircle2 size={12} /> सक्रिय (Active)
                            </span>
                          ) : (
                            <span className="dt-badge" style={{
                              backgroundColor: '#fee2e2',
                              color: '#991b1b',
                              border: '1px solid #fecaca',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              <Clock size={12} /> पेन्डिङ अनुमोदन
                            </span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', alignItems: 'center' }}>
                          {!userIsActive ? (
                            <button
                              onClick={() => toggleUserActiveMutation.mutate(u.id)}
                              style={{
                                backgroundColor: '#10b981',
                                color: '#ffffff',
                                border: 'none',
                                padding: '0.4rem 0.85rem',
                                borderRadius: '8px',
                                fontWeight: 700,
                                fontSize: '0.8rem',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                cursor: 'pointer',
                                boxShadow: '0 2px 4px rgba(16, 185, 129, 0.25)',
                                transition: 'background-color 0.2s'
                              }}
                              disabled={toggleUserActiveMutation.isPending}
                              title="यो खातालाई तत्काल अनुमोदन गरी सक्रिय गर्नुहोस्"
                            >
                              <CheckCircle2 size={14} /> अनुमोदन गर्नुहोस् (Approve)
                            </button>
                          ) : (
                            <button
                              onClick={() => toggleUserActiveMutation.mutate(u.id)}
                              className="dt-btn dt-btn-outline"
                              style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#dc2626', borderColor: '#fca5a5' }}
                              disabled={toggleUserActiveMutation.isPending}
                              title="यो खातालाई अस्थायी रूपमा निष्क्रिय/निलम्बन गर्नुहोस्"
                            >
                              <X size={13} /> निलम्बन
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenUserModal(u)}
                            className="dt-btn dt-btn-outline"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                            title="खाता विवरण सम्पादन गर्नुहोस्"
                          >
                            <Edit2 size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Wards Management */}
      {activeTab === 'wards' && (
        <div className="dt-table-wrapper">
          <div className="dt-responsive-table-wrapper">
            <table className="dt-table">
              <thead>
                <tr>
                  <th>वडा नं.</th>
                  <th>वडा केन्द्र / स्थान</th>
                  <th>स्थिति</th>
                  <th>कर्मचारी संख्या</th>
                  <th style={{ textAlign: 'right' }}>कार्य</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
                  <tr key={w}>
                    <td style={{ fontWeight: 700, color: 'var(--primary)' }}>वडा नं. {w}</td>
                    <td>वडा कार्यालय (पाँचपोखरी थाङपाल)</td>
                    <td><span className="dt-badge dt-badge-success">सक्रिय</span></td>
                    <td>५ जना</td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="dt-btn dt-btn-outline" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>
                        कन्फिगर
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Branches Management */}
      {activeTab === 'branches' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Stat Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div className="dt-card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '0.75rem', borderRadius: '12px', background: '#eff6ff', color: '#2563eb' }}>
                <Building2 size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>जम्मा शाखा तथा कार्यालय</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{branches.length} वटा</div>
              </div>
            </div>

            <div className="dt-card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '0.75rem', borderRadius: '12px', background: '#f0fdf4', color: '#16a34a' }}>
                <ShieldCheck size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>पालिका स्तरका शाखाहरू</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{branches.filter(b => b.type === 'palika').length} वटा</div>
              </div>
            </div>

            <div className="dt-card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '0.75rem', borderRadius: '12px', background: '#faf5ff', color: '#9333ea' }}>
                <Layers size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>वडा कार्यालयहरू</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{branches.filter(b => b.type === 'ward').length} वटा</div>
              </div>
            </div>

            <div className="dt-card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '0.75rem', borderRadius: '12px', background: '#fffbeb', color: '#d97706' }}>
                <FileText size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>विशेष अधिकारी तोकिएको</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#b45309' }}>सूचना & गुनासो अधिकृत</div>
              </div>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="dt-card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ position: 'relative', width: '280px' }}>
                <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="dt-input"
                  style={{ paddingLeft: '32px' }}
                  placeholder="शाखा वा जिम्मेवारी खोज्नुहोस्..."
                  value={branchSearch}
                  onChange={(e) => setBranchSearch(e.target.value)}
                />
              </div>

              <button
                onClick={() => setBranchTypeFilter('all')}
                className={`dt-btn ${branchTypeFilter === 'all' ? 'dt-btn-primary' : 'dt-btn-outline'}`}
                style={{ fontSize: '0.85rem' }}
              >
                सबै शाखाहरू
              </button>
              <button
                onClick={() => setBranchTypeFilter('palika')}
                className={`dt-btn ${branchTypeFilter === 'palika' ? 'dt-btn-primary' : 'dt-btn-outline'}`}
                style={{ fontSize: '0.85rem' }}
              >
                पालिका स्तर (Palika)
              </button>
              <button
                onClick={() => setBranchTypeFilter('ward')}
                className={`dt-btn ${branchTypeFilter === 'ward' ? 'dt-btn-primary' : 'dt-btn-outline'}`}
                style={{ fontSize: '0.85rem' }}
              >
                वडा कार्यालय (Ward)
              </button>
            </div>

            <button className="dt-btn dt-btn-primary" onClick={() => handleOpenBranchModal()}>
              <Plus size={16} />
              <span>नयाँ शाखा थप्नुहोस्</span>
            </button>
          </div>

          {/* Branches Table */}
          <div className="dt-table-wrapper">
            <div className="dt-responsive-table-wrapper">
              <table className="dt-table">
                <thead>
                  <tr>
                    <th>शाखा / महाशाखाको नाम</th>
                    <th>प्रकार र कोड</th>
                    <th>शाखा प्रमुख / सम्पर्क</th>
                    <th>तोकिएका विशेष भूमिका</th>
                    <th>कार्यक्षेत्र (Roles & Responsibilities)</th>
                    <th>स्थिति</th>
                    <th style={{ textAlign: 'right' }}>कार्य</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingBranches ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}>शाखाहरू लोड हुँदैछन्...</td>
                    </tr>
                  ) : branches.filter(b => {
                    if (!branchSearch.trim()) return true;
                    const q = branchSearch.toLowerCase();
                    return (
                      b.name.toLowerCase().includes(q) ||
                      (b.code && b.code.toLowerCase().includes(q)) ||
                      (b.headEmployeeName && b.headEmployeeName.toLowerCase().includes(q)) ||
                      (b.rolesAndResponsibilities && b.rolesAndResponsibilities.some(r => r.toLowerCase().includes(q)))
                    );
                  }).length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                        कुनै शाखा फेला परेन।
                      </td>
                    </tr>
                  ) : (
                    branches
                      .filter(b => {
                        if (!branchSearch.trim()) return true;
                        const q = branchSearch.toLowerCase();
                        return (
                          b.name.toLowerCase().includes(q) ||
                          (b.code && b.code.toLowerCase().includes(q)) ||
                          (b.headEmployeeName && b.headEmployeeName.toLowerCase().includes(q)) ||
                          (b.rolesAndResponsibilities && b.rolesAndResponsibilities.some(r => r.toLowerCase().includes(q)))
                        );
                      })
                      .map((b) => {
                        const isExpanded = expandedBranchId === b.id;
                        return (
                          <React.Fragment key={b.id}>
                            <tr>
                              <td>
                                <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.95rem' }}>{b.name}</div>
                                {b.description && (
                                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                    {b.description}
                                  </div>
                                )}
                              </td>
                              <td>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                  <span className="dt-badge dt-badge-info" style={{ alignSelf: 'flex-start' }}>
                                    {b.type === 'palika' ? 'पालिका स्तर (Palika)' : `वडा नं. ${b.wardNumber || '-'} कार्यालय`}
                                  </span>
                                  {b.code && (
                                    <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#64748b' }}>
                                      CODE: {b.code}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td>
                                <div>
                                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{b.headEmployeeName || 'तोकिएको छैन'}</div>
                                  {b.contactPhone && (
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                      <Phone size={11} /> {b.contactPhone}
                                    </div>
                                  )}
                                  {b.email && (
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                      <Mail size={11} /> {b.email}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                  {b.isInformationOfficerBranch && (
                                    <span className="dt-badge" style={{ backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d', fontSize: '0.72rem' }}>
                                      📢 सूचना अधिकारी (RTI)
                                    </span>
                                  )}
                                  {b.isGrievanceOfficerBranch && (
                                    <span className="dt-badge" style={{ backgroundColor: '#e0e7ff', color: '#3730a3', border: '1px solid #c7d2fe', fontSize: '0.72rem' }}>
                                      🛡️ गुनासो सुन्ने अधिकारी
                                    </span>
                                  )}
                                  {!b.isInformationOfficerBranch && !b.isGrievanceOfficerBranch && (
                                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>-</span>
                                  )}
                                </div>
                              </td>
                              <td>
                                {b.rolesAndResponsibilities && b.rolesAndResponsibilities.length > 0 ? (
                                  <button
                                    type="button"
                                    onClick={() => setExpandedBranchId(isExpanded ? null : b.id)}
                                    className="dt-btn dt-btn-outline"
                                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                  >
                                    {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                    <span>{b.rolesAndResponsibilities.length} मुख्य जिम्मेवारी</span>
                                  </button>
                                ) : (
                                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>विवरण थप भएको छैन</span>
                                )}
                              </td>
                              <td>
                                <span className={`dt-badge ${b.status === 'active' ? 'dt-badge-success' : 'dt-badge-danger'}`}>
                                  {b.status === 'active' ? 'सक्रिय' : 'निष्क्रिय'}
                                </span>
                              </td>
                              <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                                <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                                  <button
                                    onClick={() => handleOpenBranchModal(b)}
                                    className="dt-btn dt-btn-outline"
                                    style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                                  >
                                    <Edit2 size={12} />
                                    सम्पादन
                                  </button>
                                  <button
                                    onClick={() => handleDeleteBranch(b.id, b.name)}
                                    className="dt-btn dt-btn-outline"
                                    style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem', color: '#dc2626', borderColor: '#fca5a5' }}
                                    title="शाखा हटाउनुहोस्"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </td>
                            </tr>

                            {/* Expanded Responsibilities Row */}
                            {isExpanded && b.rolesAndResponsibilities && (
                              <tr style={{ background: '#f8fafc' }}>
                                <td colSpan={7} style={{ padding: '1rem 1.5rem', borderLeft: '4px solid var(--primary)' }}>
                                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>
                                    स्थानीय सरकार सञ्चालन ऐन, २०७४ अनुसार {b.name} का मुख्य काम, कर्तव्य र जिम्मेवारीहरू:
                                  </div>
                                  <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.82rem', color: '#475569', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '0.35rem' }}>
                                    {b.rolesAndResponsibilities.map((resp, rIdx) => (
                                      <li key={rIdx} style={{ lineHeight: 1.4 }}>
                                        {resp}
                                      </li>
                                    ))}
                                  </ul>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: RTI (Right to Information) Management */}
      {activeTab === 'rti' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Statutory Officer Banner */}
          <div className="dt-card" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)', color: '#ffffff', padding: '1.5rem', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                  <FileText size={22} color="#93c5fd" />
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                    सूचनाको हक सम्बन्धी ऐन, २०६४ अनुसार सूचना माग तथा व्यवस्थापन
                  </h2>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#bfdbfe', margin: 0, maxWidth: '800px', lineHeight: 1.5 }}>
                  सार्वजनिक निकायमा नागरिकबाट प्राप्त हुने सम्पूर्ण सूचना मागका निवेदनहरू सिधै <strong>सूचना अधिकारी</strong> समक्ष पेश हुन्छन्। कानुनी रूपमा निवेदन दर्ता भएको मितिले <strong>१५ दिनभित्र</strong> माग बमोजिमको सूचना उपलब्ध गराउनुपर्ने बाध्यात्मक व्यवस्था छ।
                </p>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(4px)', padding: '0.75rem 1.25rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.25)' }}>
                <div style={{ fontSize: '0.75rem', color: '#93c5fd', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
                  तोकिएको सूचना अधिकारी (Information Officer)
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: '2px' }}>
                  श्री कुमार बस्नेत (सम्पर्क / WhatsApp: ९८५१२७८५३०)
                </div>
                <div style={{ fontSize: '0.8rem', color: '#e0e7ff', marginTop: '2px' }}>
                  प्रशासन शाखा | विपद्/IT फोकल: नारायण क्षेत्री (९८६४११२९५५)
                </div>
              </div>
            </div>
          </div>

          {/* RTI Status Filter & Search */}
          <div className="dt-card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ position: 'relative', width: '280px' }}>
                <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="dt-input"
                  style={{ paddingLeft: '32px' }}
                  placeholder="दर्ता नं., निवेदक वा विषय खोज्नुहोस्..."
                  value={rtiSearch}
                  onChange={(e) => setRtiSearch(e.target.value)}
                />
              </div>

              <button
                onClick={() => setRtiStatusFilter('all')}
                className={`dt-btn ${rtiStatusFilter === 'all' ? 'dt-btn-primary' : 'dt-btn-outline'}`}
                style={{ fontSize: '0.85rem' }}
              >
                सबै ({rtiRequests.length})
              </button>
              <button
                onClick={() => setRtiStatusFilter('pending')}
                className={`dt-btn ${rtiStatusFilter === 'pending' ? 'dt-btn-primary' : 'dt-btn-outline'}`}
                style={{ fontSize: '0.85rem' }}
              >
                नयाँ दर्ता (Pending)
              </button>
              <button
                onClick={() => setRtiStatusFilter('in_progress')}
                className={`dt-btn ${rtiStatusFilter === 'in_progress' ? 'dt-btn-primary' : 'dt-btn-outline'}`}
                style={{ fontSize: '0.85rem' }}
              >
                प्रक्रियामा (In Progress)
              </button>
              <button
                onClick={() => setRtiStatusFilter('info_provided')}
                className={`dt-btn ${rtiStatusFilter === 'info_provided' ? 'dt-btn-primary' : 'dt-btn-outline'}`}
                style={{ fontSize: '0.85rem' }}
              >
                सूचना उपलब्ध गराइएको (Resolved)
              </button>
            </div>
          </div>

          {/* RTI Requests Table */}
          <div className="dt-table-wrapper">
            <div className="dt-responsive-table-wrapper">
              <table className="dt-table">
                <thead>
                  <tr>
                    <th>दर्ता नं. र विषय</th>
                    <th>निवेदकको विवरण</th>
                    <th>माग गरिएको सूचनाको विवरण</th>
                    <th>दर्ता मिति र कानुनी म्याद (१५ दिन)</th>
                    <th>जिम्मेवार अधिकृत</th>
                    <th>स्थिति</th>
                    <th style={{ textAlign: 'right' }}>कार्य</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingRti ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}>सूचना मागका निवेदनहरू लोड हुँदैछन्...</td>
                    </tr>
                  ) : rtiRequests.filter(r => {
                    if (!rtiSearch.trim()) return true;
                    const q = rtiSearch.toLowerCase();
                    return (
                      r.requestNo.toLowerCase().includes(q) ||
                      r.applicantName.toLowerCase().includes(q) ||
                      r.subject.toLowerCase().includes(q) ||
                      r.requestedInformation.toLowerCase().includes(q)
                    );
                  }).length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                        कुनै सूचना मागको निवेदन फेला परेन।
                      </td>
                    </tr>
                  ) : (
                    rtiRequests
                      .filter(r => {
                        if (!rtiSearch.trim()) return true;
                        const q = rtiSearch.toLowerCase();
                        return (
                          r.requestNo.toLowerCase().includes(q) ||
                          r.applicantName.toLowerCase().includes(q) ||
                          r.subject.toLowerCase().includes(q) ||
                          r.requestedInformation.toLowerCase().includes(q)
                        );
                      })
                      .map((r) => (
                        <tr key={r.id}>
                          <td>
                            <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{r.subject}</div>
                            <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--primary)', marginTop: '2px' }}>
                              दर्ता नं.: {r.requestNo} (टोकन: {r.trackingToken})
                            </div>
                          </td>
                          <td>
                            <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{r.applicantName}</div>
                            {r.applicantPhone && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.applicantPhone}</div>}
                            {r.applicantAddress && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{r.applicantAddress}</div>}
                          </td>
                          <td style={{ maxWidth: '280px' }}>
                            <div style={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {r.requestedInformation}
                            </div>
                            {r.purpose && (
                              <div style={{ fontSize: '0.72rem', color: '#64748b', fontStyle: 'italic', marginTop: '2px' }}>
                                प्रयोजन: {r.purpose}
                              </div>
                            )}
                          </td>
                          <td>
                            <div style={{ fontSize: '0.82rem' }}>दर्ता: <strong>{r.filingDateBs || '-'}</strong></div>
                            <div style={{ fontSize: '0.78rem', color: '#b45309', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
                              <Clock size={12} /> म्याद: {r.legalDeadlineBs || '१५ दिनभित्र'}
                            </div>
                          </td>
                          <td>
                            <span className="dt-badge" style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}>
                              {r.assignedOfficer}
                            </span>
                          </td>
                          <td>
                            {r.status === 'info_provided' && (
                              <span className="dt-badge dt-badge-success">सूचना उपलब्ध गराइएको</span>
                            )}
                            {r.status === 'in_progress' && (
                              <span className="dt-badge dt-badge-info">प्रक्रियामा</span>
                            )}
                            {r.status === 'pending' && (
                              <span className="dt-badge dt-badge-warning">नयाँ दर्ता</span>
                            )}
                            {r.status === 'rejected' && (
                              <span className="dt-badge dt-badge-danger">अस्वीकृत</span>
                            )}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              onClick={() => handleOpenRtiModal(r)}
                              className="dt-btn dt-btn-primary"
                              style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            >
                              <Edit2 size={12} />
                              <span>सम्बोधन / जवाफ</span>
                            </button>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Audit Logs */}
      {activeTab === 'audit' && (
        <div style={{ marginTop: '0.5rem' }}>
          <SecurityAuditPage />
        </div>
      )}

      {/* Tab: Permissions Management */}
      {activeTab === 'permissions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 14px rgba(0,0,0,0.03)', overflowX: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>भूमिका र मोड्युल पहुँच (Role-Based Access Matrix)</h3>
                  <span style={{ fontSize: '0.75rem', backgroundColor: '#e2e8f0', color: '#475569', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
                    अटो-सेभ हुन्छ
                  </span>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
                  कुन भूमिका (Role) ले प्रणालीको कुन-कुन सुविधाहरू (Features) प्रयोग गर्न पाउने भनेर यहाँबाट सेटिङ गर्न सकिन्छ।
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={handleGrantAllPermissions}
                  className="dt-btn dt-btn-primary"
                  style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem', backgroundColor: '#10b981', borderColor: '#10b981' }}
                >
                  <CheckCircle2 size={14} /> सबैलाई सबै पहुँच दिनुहोस्
                </button>
                <button
                  onClick={handleRevokeAllPermissions}
                  className="dt-btn dt-btn-outline"
                  style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem', color: '#ef4444', borderColor: '#ef4444' }}
                >
                  <X size={14} /> सबैको पहुँच हटाउनुहोस्
                </button>
              </div>
            </div>

            <div className="dt-responsive-table-wrapper" style={{ maxHeight: '600px', overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, minWidth: '800px' }}>
                <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                  <tr>
                    <th style={{ position: 'sticky', left: 0, zIndex: 11, padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#334155', fontWeight: 700 }}>सुविधाहरू (Features)</th>
                    {ROLE_DEFINITIONS.filter(r => r.value !== 'super_admin' && r.value !== 'it_admin').map(role => {
                      const dbRole = dbRoles.find(r => r.name === role.value);
                      const hasAllPermissions = dbRole ? (dbRole.permissions || []).length === FEATURES.length : false;
                      return (
                        <th key={role.value} style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '2px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#334155', fontWeight: 700, verticalAlign: 'bottom' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.8rem', lineHeight: '1.2' }}>{role.label.split(' (')[0]}</span>
                            <input
                              type="checkbox"
                              checked={hasAllPermissions}
                              onChange={() => handleToggleRoleAllPermissions(role.value)}
                              title="यस भूमिकालाई सबै पहुँच दिनुहोस्/हटाउनुहोस्"
                              style={{ width: '1rem', height: '1rem', cursor: 'pointer', accentColor: 'var(--primary)' }}
                            />
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {FEATURES.map((feature, idx) => {
                    const validRoles = ROLE_DEFINITIONS.filter(r => r.value !== 'super_admin' && r.value !== 'it_admin');
                    const hasAllRoles = validRoles.every(role => {
                      const dbRole = dbRoles.find(r => r.name === role.value);
                      return dbRole ? (dbRole.permissions || []).includes(feature.id) : false;
                    });

                    return (
                      <tr key={feature.id} style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                        <td style={{ position: 'sticky', left: 0, zIndex: 5, padding: '0.75rem', fontSize: '0.9rem', fontWeight: 600, color: '#334155', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc', borderBottom: '1px solid #f1f5f9', borderRight: '1px solid #e2e8f0' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <input
                              type="checkbox"
                              checked={hasAllRoles}
                              onChange={() => handleToggleFeatureAllRoles(feature.id)}
                              title="सबै भूमिकाहरूमा यो सुविधा दिनुहोस्/हटाउनुहोस्"
                              style={{ width: '1rem', height: '1rem', cursor: 'pointer', accentColor: 'var(--primary)' }}
                            />
                            <span>{feature.name}</span>
                          </div>
                        </td>
                        {validRoles.map(role => {
                          const dbRole = dbRoles.find(r => r.name === role.value);
                          const hasPermission = dbRole ? (dbRole.permissions || []).includes(feature.id) : false;
                          return (
                            <td key={role.value} style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '1px solid #f1f5f9' }}>
                              <input
                                type="checkbox"
                                checked={hasPermission}
                                onChange={() => handleTogglePermission(role.value, feature.id)}
                                style={{ width: '1.1rem', height: '1.1rem', cursor: 'pointer', accentColor: 'var(--primary)' }}
                              />
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </div>

          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 14px rgba(0,0,0,0.03)', overflowX: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>वडा अनुसार सुविधा व्यवस्थापन (Ward-Based Feature Mapping)</h3>
              <span style={{ fontSize: '0.7rem', backgroundColor: '#fef3c7', color: '#d97706', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 700, border: '1px solid #fde68a' }}>
                🚧 निर्माणाधीन
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem' }}>
              कुन-कुन वडाहरूले प्रणालीको कुन सुविधा प्रयोग गर्न पाउने भन्ने नियन्त्रण गर्न। (हाल परीक्षणको लागि मात्र)
            </p>
            <div className="dt-responsive-table-wrapper">
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#334155', fontWeight: 700 }}>सुविधाहरू (Features)</th>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(ward => (
                      <th key={ward} style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '2px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#334155', fontWeight: 700 }}>वडा {ward}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {FEATURES.slice(0, 8).map((feature, idx) => (
                    <tr key={feature.id} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                      <td style={{ padding: '0.75rem', fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>{feature.name}</td>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(ward => (
                        <td key={ward} style={{ padding: '0.75rem', textAlign: 'center' }}>
                          <input type="checkbox" defaultChecked={Math.random() > 0.3} style={{ width: '1.1rem', height: '1.1rem', cursor: 'pointer', accentColor: 'var(--primary)' }} disabled title="यो सुविधा छिट्टै आउँदैछ" />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 14px rgba(0,0,0,0.03)', overflowX: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>शाखा अनुसार सुविधा व्यवस्थापन (Branch-Based Feature Mapping)</h3>
              <span style={{ fontSize: '0.7rem', backgroundColor: '#fef3c7', color: '#d97706', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 700, border: '1px solid #fde68a' }}>
                🚧 निर्माणाधीन
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem' }}>
              गाउँपालिकाका विभिन्न शाखाहरूलाई उनीहरूको कार्यक्षेत्र अनुसार प्रणालीका मोड्युलहरू असाइन गर्न। (हाल परीक्षणको लागि मात्र)
            </p>
            <div className="dt-responsive-table-wrapper">
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#334155', fontWeight: 700 }}>शाखा / महाशाखा</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#334155', fontWeight: 700 }}>तोकिएका सुविधाहरू (Assigned Features)</th>
                  </tr>
                </thead>
                <tbody>
                  {branches.slice(0, 4).map((branch, idx) => (
                    <tr key={branch.id} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                      <td style={{ padding: '0.75rem', fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>{branch.name}</td>
                      <td style={{ padding: '0.75rem' }}>
                        <select multiple style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '8px', opacity: 0.7 }} disabled title="यो सुविधा छिट्टै आउँदैछ">
                          {FEATURES.map(f => (
                            <option key={f.id} value={f.id}>{f.name}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 8: Database Backup & Recovery */}
      {activeTab === 'backup' && (
        <BackupManagement />
      )}

      {/* Tab 9: Centralized Data Export Center */}
      {activeTab === 'export' && (
        <DataExportCenter />
      )}

      {/* Tab 10: Fiscal Year Setup */}
      {activeTab === 'fiscal-year' && (
        <FiscalYearManagement />
      )}

      {/* Add/Edit User Modal */}
      <UserActionModal
        isOpen={userModalOpen}
        user={editingUser}
        branches={branches}
        onClose={() => setUserModalOpen(false)}
      />

      {/* Add/Edit Branch Modal */}
      {branchModalOpen && editingBranch && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          padding: '1rem',
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '620px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#ffffff', zIndex: 2 }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
                {editingBranch.id ? 'शाखा विवरण तथा जिम्मेवारी सम्पादन' : 'नयाँ शाखा सिर्जना गर्नुहोस्'}
              </h3>
              <button onClick={() => setBranchModalOpen(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '0.25rem' }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <form onSubmit={handleSaveBranch} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>शाखा/महाशाखाको नाम *</label>
                    <input
                      type="text"
                      required
                      placeholder="उदा. स्वास्थ्य तथा जनसंख्या शाखा"
                      value={editingBranch.name || ''}
                      onChange={(e) => setEditingBranch({ ...editingBranch, name: e.target.value })}
                      className="dt-input"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>सङ्केत (Code)</label>
                    <input
                      type="text"
                      placeholder="उदा. HEALTH"
                      value={editingBranch.code || ''}
                      onChange={(e) => setEditingBranch({ ...editingBranch, code: e.target.value.toUpperCase() })}
                      className="dt-input"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>प्रकार (Type) *</label>
                    <select
                      value={editingBranch.type || 'palika'}
                      onChange={(e) => setEditingBranch({ ...editingBranch, type: e.target.value as 'palika' | 'ward' })}
                      className="dt-input"
                    >
                      <option value="palika">पालिका स्तर (Palika Level)</option>
                      <option value="ward">वडा स्तर (Ward Level)</option>
                    </select>
                  </div>

                  {editingBranch.type === 'ward' ? (
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>सम्बन्धित वडा नं. *</label>
                      <input
                        type="number"
                        required
                        min="1"
                        max="8"
                        placeholder="वडा नम्बर (१-८)"
                        value={editingBranch.wardNumber || ''}
                        onChange={(e) => setEditingBranch({ ...editingBranch, wardNumber: parseInt(e.target.value) || undefined })}
                        className="dt-input"
                      />
                    </div>
                  ) : (
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>स्थिति</label>
                      <select
                        value={editingBranch.status || 'active'}
                        onChange={(e) => setEditingBranch({ ...editingBranch, status: e.target.value as 'active' | 'inactive' })}
                        className="dt-input"
                      >
                        <option value="active">सक्रिय (Active)</option>
                        <option value="inactive">निष्क्रिय (Inactive)</option>
                      </select>
                    </div>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>शाखा प्रमुखको नाम</label>
                    <input
                      type="text"
                      placeholder="उदा. सीता शर्मा (अधिकृत)"
                      value={editingBranch.headEmployeeName || ''}
                      onChange={(e) => setEditingBranch({ ...editingBranch, headEmployeeName: e.target.value })}
                      className="dt-input"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>सम्पर्क फोन / मोबाइल</label>
                    <input
                      type="text"
                      placeholder="उदा. ०११-६९०१२३"
                      value={editingBranch.contactPhone || ''}
                      onChange={(e) => setEditingBranch({ ...editingBranch, contactPhone: e.target.value })}
                      className="dt-input"
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>आधिकारिक इमेल</label>
                  <input
                    type="email"
                    placeholder="उदा. branch@panchpokhari.gov.np"
                    value={editingBranch.email || ''}
                    onChange={(e) => setEditingBranch({ ...editingBranch, email: e.target.value })}
                    className="dt-input"
                  />
                </div>

                {/* Designated Special Roles Checkboxes */}
                <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>
                    तोकिएका विशेष कानुनी जिम्मेवारी (Special Statutory Roles):
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer', color: '#334155' }}>
                      <input
                        type="checkbox"
                        checked={!!editingBranch.isInformationOfficerBranch}
                        onChange={(e) => setEditingBranch({ ...editingBranch, isInformationOfficerBranch: e.target.checked })}
                      />
                      <span>📢 <strong>सूचना अधिकारी (Information Officer)</strong> यसै शाखामा तोकिएको छ (सूचनाको हक ऐन, २०६४)</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer', color: '#334155' }}>
                      <input
                        type="checkbox"
                        checked={!!editingBranch.isGrievanceOfficerBranch}
                        onChange={(e) => setEditingBranch({ ...editingBranch, isGrievanceOfficerBranch: e.target.checked })}
                      />
                      <span>🛡️ <strong>गुनासो सुन्ने अधिकारी (Grievance Officer)</strong> यसै शाखामा तोकिएको छ (सुशासन ऐन, २०६४)</span>
                    </label>
                  </div>
                </div>

                {/* Roles & Responsibilities list textarea */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                    स्थानीय तहको Role and Responsibilities अनुसारका मुख्य जिम्मेवारीहरू (प्रत्येक लाइनमा एउटा)
                  </label>
                  <textarea
                    rows={4}
                    placeholder="उदा.&#10;मातृ तथा नवजात शिशु सुरक्षा कार्यक्रम सञ्चालन&#10;नियमित खोप तथा महामारी नियन्त्रण व्यवस्थापन&#10;औषधी आपूर्ति र स्वास्थ्य चौकीहरूको अनुगमन"
                    value={responsibilitiesText}
                    onChange={(e) => setResponsibilitiesText(e.target.value)}
                    className="dt-input"
                    style={{ resize: 'vertical', fontSize: '0.85rem' }}
                  />
                  <small style={{ color: '#64748b' }}>स्थानीय सरकार सञ्चालन ऐन, २०७४ अनुसारका बुँदाहरू खुलाउनुहोस्।</small>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button type="button" onClick={() => setBranchModalOpen(false)} className="dt-btn dt-btn-outline">
                    रद्द गर्नुहोस्
                  </button>
                  <button type="submit" className="dt-btn dt-btn-primary">
                    सुरक्षित गर्नुहोस्
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* RTI Action Modal for Information Officer */}
      {selectedRti && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          padding: '1rem',
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '580px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  सूचना माग निवेदन सम्बोधन (सूचना अधिकारी)
                </h3>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace', marginTop: '2px' }}>
                  दर्ता नं: {selectedRti.requestNo}
                </div>
              </div>
              <button onClick={() => setSelectedRti(null)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Application Details summary */}
              <div style={{ background: '#eff6ff', padding: '1rem', borderRadius: '10px', border: '1px solid #bfdbfe' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e40af' }}>{selectedRti.subject}</div>
                <div style={{ fontSize: '0.8rem', color: '#334155', marginTop: '4px' }}>
                  <strong>निवेदक:</strong> {selectedRti.applicantName} ({selectedRti.applicantPhone || 'फोन उपलब्ध छैन'})
                </div>
                <div style={{ fontSize: '0.8rem', color: '#334155', marginTop: '2px' }}>
                  <strong>माग गरिएको सूचना:</strong> {selectedRti.requestedInformation}
                </div>
                {selectedRti.purpose && (
                  <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '2px', fontStyle: 'italic' }}>
                    <strong>प्रयोजन:</strong> {selectedRti.purpose}
                  </div>
                )}
                <div style={{ fontSize: '0.75rem', color: '#b45309', fontWeight: 600, marginTop: '6px' }}>
                  कानुनी म्याद: दर्ता {selectedRti.filingDateBs || '-'} | १५ दिने अन्तिम मिति: {selectedRti.legalDeadlineBs || '-'}
                </div>
              </div>

              {/* Action Form */}
              <form onSubmit={handleSaveRtiAction} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                    कारबाहीको स्थिति (Status) *
                  </label>
                  <select
                    className="dt-input"
                    value={rtiStatusUpdate}
                    onChange={(e) => setRtiStatusUpdate(e.target.value as RtiStatus)}
                  >
                    <option value="pending">नयाँ दर्ता (Pending)</option>
                    <option value="in_progress">प्रक्रियामा / सूचना संकलन हुँदै (In Progress)</option>
                    <option value="info_provided">सूचना उपलब्ध गराइएको (Information Provided)</option>
                    <option value="rejected">अस्वीकृत / कानुन बमोजिम नमिल्ने (Rejected)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                    सूचना अधिकारीको आदेश / निर्णय तथा टिपोट *
                  </label>
                  <textarea
                    required
                    rows={4}
                    className="dt-input"
                    style={{ resize: 'vertical' }}
                    placeholder="माग गरिएको सूचना उपलब्ध गराउने सम्बन्धमा गरिएको निर्णय वा व्यहोरा खुलाउनुहोस्..."
                    value={rtiActionNotes}
                    onChange={(e) => setRtiActionNotes(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                    प्रमाणित सूचना फाइल वा डिजिटल कागजातको लिङ्क (Attachment URL)
                  </label>
                  <input
                    type="text"
                    className="dt-input"
                    placeholder="उदा. /documents/rti-response-2081-001.pdf"
                    value={rtiAttachmentUrl}
                    onChange={(e) => setRtiAttachmentUrl(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button type="button" onClick={() => setSelectedRti(null)} className="dt-btn dt-btn-outline">
                    रद्द गर्नुहोस्
                  </button>
                  <button type="submit" className="dt-btn dt-btn-primary">
                    निर्णय तथा जवाफ सुरक्षित गर्नुहोस्
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
