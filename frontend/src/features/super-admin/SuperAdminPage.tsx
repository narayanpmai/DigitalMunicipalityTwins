import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Shield,
  Building2,
  Users,
  Settings,
  Calendar,
  Activity,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Edit2,
  Trash2,
  Lock,
  Unlock,
  LogOut,
  Globe,
  Cpu,
  ArrowRight,
  Sparkles,
  CalendarCheck,
  CalendarRange,
  Check,
  Key,
  UserCheck,
  ShieldCheck,
  X,
  Eye,
  EyeOff,
  RefreshCw,
} from 'lucide-react';
import axios from 'axios';
import { tenantApi } from '../../api/tenant';
import '../../superadmin.css';
import { BsCalendarModal } from '../../components/common/BsCalendarModal';
import {
  calculateFiscalYearDates,
  toNepaliDigits,
} from '../../utils/nepaliCalendar';
import { NEPAL_ADMIN_STRUCTURE } from '../../utils/nepalAdministrativeData';

interface Tenant {
  id: string;
  nameNp: string;
  nameEn: string;
  subdomain: string;
  province?: string;
  district?: string;
  adminEmail?: string;
  status: 'active' | 'inactive';
}

interface UserItem {
  id: string;
  fullName: string;
  email: string;
  role: string;
  status: string;
  tenantId?: string;
  wardNumber?: number;
}

export interface RoleDef {
  value: string;
  label: string;
  color: string;
  bg: string;
  border: string;
  desc: string;
}

export const ROLE_DEFINITIONS: RoleDef[] = [
  { value: 'super_admin', label: 'सुपर एडमिन (Super Admin)', color: '#dc2626', bg: '#fef2f2', border: '#fecaca', desc: 'सम्पूर्ण प्लेटफर्म तथा सबै पालिकाहरूको पूर्ण नियन्त्रण' },
  { value: 'admin', label: 'पालिका प्रशासक (Palika Admin)', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', desc: 'सम्बन्धित पालिकाको सम्पूर्ण मोड्युल तथा प्रयोगकर्ता व्यवस्थापन' },
  { value: 'cao', label: 'प्रमुख प्रशासकीय अधिकृत (CAO)', color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe', desc: 'अन्तिम निर्णय, ई-हस्ताक्षर तथा सिफारिस प्रमाणीकरण' },
  { value: 'planning_officer', label: 'योजना अधिकृत (Planning Officer)', color: '#059669', bg: '#ecfdf5', border: '#a7f3d0', desc: 'योजना, बजेट तर्जुमा, अनुगमन तथा मूल्याङ्कन' },
  { value: 'revenue_officer', label: 'राजस्व अधिकृत (Revenue Officer)', color: '#d97706', bg: '#fffbeb', border: '#fde68a', desc: 'कर, दस्तुर, राजस्व संकलन तथा दाखिला' },
  { value: 'ward_user', label: 'वडा सचिव / कर्मचारी (Ward User)', color: '#0891b2', bg: '#ecfeff', border: '#a5f3fc', desc: 'वडा स्तरको सेवा प्रवाह, नागरिक सिफारिस दर्ता' },
  { value: 'it_admin', label: 'सूचना प्रविधि अधिकृत (IT Admin)', color: '#4f46e5', bg: '#eef2ff', border: '#c7d2fe', desc: 'डाटा इन्टिग्रेशन, सेन्सर, क्यामेरा तथा सर्भर' },
  { value: 'disaster_officer', label: 'विपद् अधिकृत (Disaster Officer)', color: '#ea580c', bg: '#fff7ed', border: '#fed7aa', desc: 'आपतकालीन पूर्वसूचना, साइरन तथा SMS प्रसारण' },
  { value: 'tourism_officer', label: 'पर्यटन अधिकृत (Tourism Officer)', color: '#0d9488', bg: '#f0fdfa', border: '#5eead4', desc: 'पर्यटन प्रवर्द्धन, सम्पदा तथा होमस्टे व्यवस्थापन' },
  { value: 'data_entry', label: 'तथ्यांक प्रविष्टि (Data Entry)', color: '#475569', bg: '#f1f5f9', border: '#cbd5e1', desc: 'पारिवारिक लगत तथा अभिलेख प्रविष्टि' },
  { value: 'public_citizen', label: 'नागरिक (Citizen)', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', desc: 'सार्वजनिक सेवाग्राही' },
  { value: 'public_business', label: 'व्यवसाय/फर्म (Business)', color: '#ca8a04', bg: '#fefce8', border: '#fef08a', desc: 'व्यावसायिक प्रयोगकर्ता' },
  { value: 'public_contractor', label: 'निर्माण व्यवसायी (Contractor)', color: '#9333ea', bg: '#faf5ff', border: '#e9d5ff', desc: 'ठेकेदार / निर्माण व्यवसायी' },
  { value: 'public_engineer', label: 'प्राविधिक/इन्जिनियर (Engineer)', color: '#0ea5e9', bg: '#f0f9ff', border: '#bae6fd', desc: 'इन्जिनियर / डिजाइनर' },
  { value: 'health_officer', label: 'स्वास्थ्य अधिकृत (Health Officer)', color: '#be123c', bg: '#ffe4e6', border: '#fecdd3', desc: 'स्वास्थ्य शाखा प्रमुख / पालिका स्वास्थ्य प्रशासन' },
  { value: 'medical_officer', label: 'मेडिकल अधिकृत / डाक्टर (Medical Officer / Doctor)', color: '#0284c7', bg: '#e0f2fe', border: '#bae6fd', desc: 'अस्पताल ओपिडी, १५-शय्या भर्ना तथा क्लिनिकल उपचार' },
  { value: 'lab_technician', label: 'प्रयोगशाला प्राविधिक (Lab Technician)', color: '#9333ea', bg: '#faf5ff', border: '#e9d5ff', desc: 'ल्याब जाँच अर्डर, नमुना संकलन तथा परीक्षण नतिजा' },
  { value: 'pharmacist', label: 'फार्मेसी अधिकृत (Pharmacist)', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', desc: 'फार्मेसी बिलिङ (POS), औषधि मौज्दात (e-LMIS) र खरिद दाखिला' },
  { value: 'education_officer', label: 'शिक्षा अधिकृत (Education Officer)', color: '#1d4ed8', bg: '#dbeafe', border: '#bfdbfe', desc: 'शिक्षा शाखा प्रमुख / अधिकृत' },
  { value: 'agriculture_officer', label: 'कृषि अधिकृत (Agriculture Officer)', color: '#4d7c0f', bg: '#ecfccb', border: '#d9f99d', desc: 'कृषि शाखा प्रमुख / अधिकृत' },
  { value: 'accountant', label: 'लेखा अधिकृत (Accountant)', color: '#047857', bg: '#d1fae5', border: '#a7f3d0', desc: 'लेखा शाखा प्रमुख / अधिकृत' },
  { value: 'engineer', label: 'इन्जिनियर (Engineer)', color: '#0369a1', bg: '#e0f2fe', border: '#7dd3fc', desc: 'इन्जिनियर' },
];

interface FiscalYear {
  name: string;
  startBs: string;
  startAd: string;
  endBs: string;
  endAd: string;
  isActive: boolean;
}

export const SuperAdminPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'municipalities' | 'users' | 'roles' | 'settings' | 'fiscal-year'
  >('dashboard');

  // Auth state
  const [userEmail, setUserEmail] = useState<string>('super_admin@p5digital.local');

  // Data states
  const [tenants, setTenants] = useState<Tenant[]>([
    {
      id: 'panchpokhari',
      nameNp: 'पाँचपोखरी थाङपाल गाउँपालिका',
      nameEn: 'Panchpokhari Thangpal Rural Municipality',
      subdomain: 'panchpokhari',
      province: 'बागमती',
      district: 'सिन्धुपाल्चोक',
      adminEmail: 'admin@p5digital.local',
      status: 'active',
    },
    {
      id: 'helambu',
      nameNp: 'हेलम्बु गाउँपालिका',
      nameEn: 'Helambu Rural Municipality',
      subdomain: 'helambu',
      province: 'बागमती',
      district: 'सिन्धुपाल्चोक',
      adminEmail: 'admin@helambu.gov.np',
      status: 'active',
    },
    {
      id: 'melamchi',
      nameNp: 'मेलम्ची नगरपालिका',
      nameEn: 'Melamchi Municipality',
      subdomain: 'melamchi',
      province: 'बागमती',
      district: 'सिन्धुपाल्चोक',
      adminEmail: 'admin@melamchi.gov.np',
      status: 'active',
    },
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [usersList, setUsersList] = useState<UserItem[]>([
    { id: 'u1', fullName: 'सुपर प्रशासक (Super Admin)', email: 'super_admin@p5digital.local', role: 'super_admin', status: 'active', tenantId: 'all' },
    { id: 'u2', fullName: 'पाँचपोखरी IT Admin', email: 'admin@p5digital.local', role: 'admin', status: 'active', tenantId: 'panchpokhari' },
    { id: 'u3', fullName: 'प्रमुख प्रशासकीय अधिकृत (CAO)', email: 'cao@panchpokhari.gov.np', role: 'cao', status: 'active', tenantId: 'panchpokhari' },
    { id: 'u4', fullName: 'योजना शाखा अधिकृत', email: 'planning@panchpokhari.gov.np', role: 'planning_officer', status: 'active', tenantId: 'panchpokhari' },
    { id: 'u5', fullName: 'वडा सचिव (वडा नं १)', email: 'ward1@panchpokhari.gov.np', role: 'ward_user', status: 'active', tenantId: 'panchpokhari', wardNumber: 1 },
    { id: 'u6', fullName: 'हेलम्बु पालिका प्रशासक', email: 'admin@helambu.gov.np', role: 'admin', status: 'active', tenantId: 'helambu' },
    { id: 'u7', fullName: 'हेलम्बु CAO अधिकृत', email: 'cao@helambu.gov.np', role: 'cao', status: 'active', tenantId: 'helambu' },
    { id: 'u8', fullName: 'मेलम्ची योजना अधिकृत', email: 'planning@melamchi.gov.np', role: 'planning_officer', status: 'active', tenantId: 'melamchi' },
  ]);

  // Role Assignment & Multi-Tenant User Management States
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [userTenantFilter, setUserTenantFilter] = useState<string>('all');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');
  const [userSearchQuery, setUserSearchQuery] = useState<string>('');

  // ── Fiscal Years Management State ─────────────────────────────
  const [fiscalYearsList, setFiscalYearsList] = useState<FiscalYear[]>([
    { name: '२०८०/०८१', startBs: '२०८०-०४-०१', startAd: '2023-07-17', endBs: '२०८१-०३-३१', endAd: '2024-07-15', isActive: false },
    { name: '२०८१/०८२', startBs: '२०८१-०४-०१', startAd: '2024-07-16', endBs: '२०८२-०३-३१', endAd: '2025-07-15', isActive: true },
    { name: '२०८२/०८३', startBs: '२०८२-०४-०१', startAd: '2025-07-16', endBs: '२०८३-०३-३१', endAd: '2026-07-15', isActive: false },
  ]);

  // Form states for fiscal year
  const [fyName, setFyName] = useState<string>('');
  const [fyStartBs, setFyStartBs] = useState<string>('');
  const [fyStartAd, setFyStartAd] = useState<string>('');
  const [fyEndBs, setFyEndBs] = useState<string>('');
  const [fyEndAd, setFyEndAd] = useState<string>('');
  const [fyIsActive, setFyIsActive] = useState<boolean>(false);
  const [editFyIndex, setEditFyIndex] = useState<number>(-1);

  // Calendar Modal State
  const [calendarModalOpen, setCalendarModalOpen] = useState<boolean>(false);
  const [calendarTarget, setCalendarTarget] = useState<'start' | 'end'>('start');

  // New Tenant Form State
  const [newTenant, setNewTenant] = useState({
    nameNp: '',
    nameEn: '',
    subdomain: '',
    province: 'बागमती प्रदेश',
    district: '',
    adminEmail: '',
  });

  // New User Form State
  const [newUser, setNewUser] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'admin',
    tenantId: 'panchpokhari',
    wardNumber: 1,
  });
  const [showNewUserPassword, setShowNewUserPassword] = useState<boolean>(false);
  const [editUserPassword, setEditUserPassword] = useState<string>('');
  const [showEditPassword, setShowEditPassword] = useState<boolean>(false);

  // System Settings State
  const [systemSettings, setSystemSettings] = useState({
    platformName: 'Municipal Digital Twins Nepal',
    maintenanceMode: false,
    autoBackupDaily: true,
    smsGatewayEnabled: true,
    aiServiceStatus: 'Online',
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load initial settings & fiscal years
  useEffect(() => {
    const token = localStorage.getItem('p5_token');
    const email = localStorage.getItem('p5_email');

    if (email) setUserEmail(email);

    // Try to load saved fiscal years from localStorage or backend
    const savedLocalFy = localStorage.getItem('p5_fiscal_years');
    if (savedLocalFy) {
      try {
        const parsed = JSON.parse(savedLocalFy);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setFiscalYearsList(parsed);
        }
      } catch (e) {}
    }

    // Load saved users from localStorage (deduplicating by unique email)
    const savedLocalUsers = localStorage.getItem('p5_users_list');
    if (savedLocalUsers) {
      try {
        const parsed = JSON.parse(savedLocalUsers);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const seen = new Set<string>();
          const dedupedUsers: UserItem[] = [];
          for (const u of parsed) {
            const key = (u.email || '').trim().toLowerCase();
            if (key && !seen.has(key)) {
              seen.add(key);
              dedupedUsers.push(u);
            }
          }
          setUsersList(dedupedUsers);
          localStorage.setItem('p5_users_list', JSON.stringify(dedupedUsers));
        }
      } catch (e) {}
    }

    const fetchTenants = async () => {
      try {
        const remoteTenants = await tenantApi.getAllTenants();
        if (remoteTenants && Array.isArray(remoteTenants)) {
          setTenants(remoteTenants);
          localStorage.setItem('p5_tenants_list', JSON.stringify(remoteTenants));
          return;
        }
      } catch (err) {
        console.warn('Failed to fetch tenants from API, falling back to local storage', err);
      }
      
      // Load saved tenants from localStorage as fallback
      const savedLocalTenants = localStorage.getItem('p5_tenants_list');
      if (savedLocalTenants) {
        try {
          const parsed = JSON.parse(savedLocalTenants);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setTenants(parsed);
          }
        } catch (e) {}
      }
    };
    fetchTenants();

    const fetchSettings = async () => {
      try {
        const res = await axios.get('/api/v1/settings', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.data) {
          const s = res.data.data || res.data;
          if (s.fiscal_years_list) {
            const parsed = typeof s.fiscal_years_list === 'string' ? JSON.parse(s.fiscal_years_list) : s.fiscal_years_list;
            if (Array.isArray(parsed) && parsed.length > 0) {
              setFiscalYearsList(parsed);
            }
          }
        }
      } catch (err) {
        // Fallback to local
      }
    };
    fetchSettings();
  }, [navigate]);

  // Persist Fiscal Years to backend & localStorage
  const saveFiscalYears = async (updatedList: FiscalYear[]) => {
    setFiscalYearsList(updatedList);
    localStorage.setItem('p5_fiscal_years', JSON.stringify(updatedList));

    const token = localStorage.getItem('p5_token');
    const activeFy = updatedList.find((x) => x.isActive);
    try {
      await axios.post(
        '/api/v1/settings/bulk',
        {
          fiscal_years_list: JSON.stringify(updatedList),
          active_fiscal_year: activeFy ? activeFy.name : '२०८१/०८२',
        },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
    } catch (err) {
      // Non-blocking warning
    }
  };

  // Fiscal Year Preset Selector with Auto-Date Calculations
  const handleSetPreset = (presetName: string) => {
    setFyName(presetName);
    const calculated = calculateFiscalYearDates(presetName);
    if (calculated) {
      setFyStartBs(calculated.startBs);
      setFyStartAd(calculated.startAd);
      setFyEndBs(calculated.endBs);
      setFyEndAd(calculated.endAd);
      showToast(`आ.व. ${presetName} को सुरु र अन्त्य मिति स्वतः भरियो`);
    }
  };

  // Dynamic input typing handler with date math
  const handleFyNameChange = (val: string) => {
    setFyName(val);
    const calculated = calculateFiscalYearDates(val);
    if (calculated) {
      setFyStartBs(calculated.startBs);
      setFyStartAd(calculated.startAd);
      setFyEndBs(calculated.endBs);
      setFyEndAd(calculated.endAd);
    }
  };

  // Open BS Calendar Modal
  const openBsCalendar = (target: 'start' | 'end') => {
    setCalendarTarget(target);
    setCalendarModalOpen(true);
  };

  // Calendar date selected callback
  const handleCalendarDateSelect = (bsDate: string, adDate: string) => {
    if (calendarTarget === 'start') {
      setFyStartBs(bsDate);
      setFyStartAd(adDate);
    } else {
      setFyEndBs(bsDate);
      setFyEndAd(adDate);
    }
  };

  // Add or Edit Fiscal Year
  const handleFiscalYearSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = fyName.trim();
    if (!name) return showToast('कृपया आर्थिक वर्षको नाम प्रविष्ट गर्नुहोस्!');
    if (!fyStartBs) return showToast('कृपया सुरु मिति (वि.सं.) छान्नुहोस्!');
    if (!fyEndBs) return showToast('कृपया अन्त्य मिति (वि.सं.) छान्नुहोस्!');

    let updated = [...fiscalYearsList];
    if (fyIsActive) {
      updated = updated.map((item) => ({ ...item, isActive: false }));
    }

    const newEntry: FiscalYear = {
      name,
      startBs: fyStartBs,
      startAd: fyStartAd,
      endBs: fyEndBs,
      endAd: fyEndAd,
      isActive: fyIsActive,
    };

    if (editFyIndex >= 0 && editFyIndex < updated.length) {
      updated[editFyIndex] = newEntry;
      showToast(`आर्थिक वर्ष ${name} सफलतापूर्वक अद्यावधिक गरियो!`);
    } else {
      const exists = updated.find((x) => x.name === name);
      if (exists) {
        return showToast(`आर्थिक वर्ष ${name} पहिले नै दर्ता भइसकेको छ!`);
      }
      updated.unshift(newEntry);
      showToast(`नयाँ आर्थिक वर्ष ${name} सफलतापूर्वक थपियो!`);
    }

    saveFiscalYears(updated);
    resetFiscalYearForm();
  };

  // Reset form
  const resetFiscalYearForm = () => {
    setFyName('');
    setFyStartBs('');
    setFyStartAd('');
    setFyEndBs('');
    setFyEndAd('');
    setFyIsActive(false);
    setEditFyIndex(-1);
  };

  // Edit action
  const handleEditFiscalYear = (idx: number) => {
    const fy = fiscalYearsList[idx];
    if (!fy) return;
    setEditFyIndex(idx);
    setFyName(fy.name);
    setFyStartBs(fy.startBs || '');
    setFyStartAd(fy.startAd || '');
    setFyEndBs(fy.endBs || '');
    setFyEndAd(fy.endAd || '');
    setFyIsActive(!!fy.isActive);
  };

  // Toggle Active
  const handleToggleFiscalYearActive = (idx: number) => {
    const updated = fiscalYearsList.map((item, i) => ({
      ...item,
      isActive: i === idx,
    }));
    saveFiscalYears(updated);
    showToast(`आर्थिक वर्ष ${fiscalYearsList[idx].name} लाई सक्रिय बनाइयो!`);
  };

  // Delete action
  const handleDeleteFiscalYear = (idx: number) => {
    const fy = fiscalYearsList[idx];
    if (!fy) return;
    if (fy.isActive) {
      return showToast('सक्रिय आर्थिक वर्ष मेटाउन सकिँदैन! पहिले अर्को वर्षलाई सक्रिय बनाउनुहोस्।');
    }
    if (!window.confirm(`के तपाईं आर्थिक वर्ष "${fy.name}" मेटाउन निश्चित हुनुहुन्छ?`)) return;

    const updated = fiscalYearsList.filter((_, i) => i !== idx);
    saveFiscalYears(updated);
    showToast(`आर्थिक वर्ष ${fy.name} हटाइयो`);
  };

  // Tenant handlers
  const handleAddTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTenant.nameNp || !newTenant.subdomain) {
      showToast('कृपया पालिकाको नाम र सबडोमेन अनिवार्य भर्नुहोस्');
      return;
    }
    const tenantPayload = {
      nameNp: newTenant.nameNp,
      nameEn: newTenant.nameEn || newTenant.subdomain,
      subdomain: newTenant.subdomain.toLowerCase(),
      province: newTenant.province,
      district: newTenant.district,
      adminEmail: newTenant.adminEmail || `admin@${newTenant.subdomain.toLowerCase()}.local`,
      status: 'active',
    };

    try {
      const response = await tenantApi.registerTenant(tenantPayload);
      if (response.success && response.data) {
        const updatedTenants = [response.data as Tenant, ...tenants];
        setTenants(updatedTenants);
        localStorage.setItem('p5_tenants_list', JSON.stringify(updatedTenants));
        setNewTenant({ nameNp: '', nameEn: '', subdomain: '', province: 'बागमती प्रदेश', district: '', adminEmail: '' });
        showToast(`पालिका ${tenantPayload.nameNp} सफलतापूर्वक दर्ता भयो!`);
      } else {
        showToast(response.message || 'पालिका दर्ता गर्न सकिएन');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'सर्भरमा समस्या आयो, दर्ता हुन सकेन');
    }
  };

  const handleToggleTenantStatus = (id: string) => {
    setTenants(
      tenants.map((t) =>
        t.id === id ? { ...t, status: t.status === 'active' ? 'inactive' : 'active' } : t
      )
    );
    showToast('पालिकाको स्टाटस परिवर्तन गरियो');
  };

  // Helper functions for roles and tenants
  const getRoleInfo = (r: string) => {
    return (
      ROLE_DEFINITIONS.find((x) => x.value === r) || {
        value: r,
        label: r.toUpperCase(),
        color: '#475569',
        bg: '#f1f5f9',
        border: '#cbd5e1',
        desc: '',
      }
    );
  };

  const getTenantName = (tId?: string) => {
    if (!tId || tId === 'all') return 'सबै पालिका (केन्द्रीय Root)';
    const found = tenants.find((t) => t.id === tId || t.subdomain === tId);
    return found ? found.nameNp : tId;
  };

  // User & Multi-Tenant Role Handlers
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.email || !newUser.fullName) {
      showToast('कृपया नाम र इमेल अनिवार्य भर्नुहोस्');
      return;
    }

    const trimmedEmail = newUser.email.trim().toLowerCase();
    // 1. Enforce unique email check on existing users
    const isDuplicate = usersList.some(
      (u) => (u.email || '').trim().toLowerCase() === trimmedEmail
    );
    if (isDuplicate) {
      showToast(`⚠️ यो इमेल (${newUser.email}) पहिले नै दर्ता भइसकेको छ! एउटा इमेलबाट एउटा मात्र प्रयोगकर्ता बनाउन मिल्छ।`);
      return;
    }

    const pwd = newUser.password.trim();
    if (!pwd || pwd.length < 6) {
      showToast('कृपया कम्तीमा ६ अक्षरको पासवर्ड राख्नुहोस्');
      return;
    }
    const u: UserItem = {
      id: `u-${Date.now()}`,
      fullName: newUser.fullName,
      email: trimmedEmail,
      role: newUser.role,
      tenantId: newUser.role === 'super_admin' ? 'all' : newUser.tenantId,
      wardNumber: newUser.role === 'ward_user' ? Number(newUser.wardNumber) || 1 : undefined,
      status: 'active',
    };

    // Sync with backend /api/v1/users if online
    const token = localStorage.getItem('p5_token');
    try {
      await axios.post(
        '/api/v1/users',
        {
          fullName: newUser.fullName,
          email: trimmedEmail,
          password: pwd,
          role: newUser.role,
          tenantId: u.tenantId,
          wardNumber: u.wardNumber,
          isActive: true,
        },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
    } catch (err: any) {
      if (err.response?.status === 409 || err.response?.data?.message?.includes('already registered')) {
        showToast(`⚠️ यो इमेल (${newUser.email}) पहिले नै डाटाबेसमा दर्ता भइसकेको छ!`);
        return; // Halt: do not create duplicate
      }
    }

    const updated = [u, ...usersList.filter((x) => (x.email || '').trim().toLowerCase() !== trimmedEmail)];
    setUsersList(updated);
    localStorage.setItem('p5_users_list', JSON.stringify(updated));
    setNewUser({ fullName: '', email: '', password: '', role: 'admin', tenantId: 'panchpokhari', wardNumber: 1 });
    setShowNewUserPassword(false);
    showToast(`नयाँ प्रयोगकर्ता "${u.fullName}" (${getRoleInfo(u.role).label}) सफलतापूर्वक थपियो!`);
  };

  const handleUpdateUserRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    if (editUserPassword.trim()) {
      if (editUserPassword.trim().length < 6) {
        showToast('नयाँ पासवर्ड कम्तीमा ६ अक्षरको हुनुपर्छ!');
        return;
      }
      const token = localStorage.getItem('p5_token');
      try {
        await axios.put(
          `/api/v1/users/${editingUser.id}`,
          {
            password: editUserPassword.trim(),
            role: editingUser.role,
            tenantId: editingUser.tenantId,
            wardNumber: editingUser.wardNumber,
            isActive: editingUser.status === 'active',
          },
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );
      } catch (err) {
        // Offline fallback
      }
    }

    const updated = usersList.map((u) => (u.id === editingUser.id ? editingUser : u));
    setUsersList(updated);
    localStorage.setItem('p5_users_list', JSON.stringify(updated));
    showToast(
      editUserPassword.trim()
        ? `प्रयोगकर्ता "${editingUser.fullName}" को भूमिका तथा पासवर्ड सुरक्षित गरियो!`
        : `प्रयोगकर्ता "${editingUser.fullName}" को भूमिका तथा पालिका अद्यावधिक गरियो!`
    );
    setEditingUser(null);
    setEditUserPassword('');
    setShowEditPassword(false);
  };

  const handleDeleteUser = (id: string, name: string) => {
    if (id === 'u1') {
      showToast('केन्द्रीय सुपर एडमिनलाई मेटाउन सकिँदैन!');
      return;
    }
    if (!window.confirm(`के तपाईं प्रयोगकर्ता "${name}" हटाउन निश्चित हुनुहुन्छ?`)) return;
    const updated = usersList.filter((u) => u.id !== id);
    setUsersList(updated);
    localStorage.setItem('p5_users_list', JSON.stringify(updated));
    showToast(`प्रयोगकर्ता ${name} हटाइयो`);
  };

  const handleToggleUserStatus = (id: string) => {
    const updated = usersList.map((u) =>
      u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u
    );
    setUsersList(updated);
    localStorage.setItem('p5_users_list', JSON.stringify(updated));
    showToast('प्रयोगकर्ताको पहुँच परिवर्तन गरियो');
  };

  const filteredUsers = (() => {
    const seenEmails = new Set<string>();
    return usersList.filter((u) => {
      const normEmail = (u.email || '').trim().toLowerCase();
      if (seenEmails.has(normEmail)) return false;
      seenEmails.add(normEmail);

      const q = userSearchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        (u.fullName && u.fullName.toLowerCase().includes(q)) ||
        normEmail.includes(q) ||
        (u.role && u.role.toLowerCase().includes(q));
      const matchesTenant =
        userTenantFilter === 'all' ||
        (userTenantFilter === 'super_admin' && (u.tenantId === 'all' || u.role === 'super_admin')) ||
        u.tenantId === userTenantFilter;
      const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
      return matchesSearch && matchesTenant && matchesRole;
    });
  })();

  const handleLogout = () => {
    localStorage.removeItem('p5_token');
    localStorage.removeItem('p5_user');
    localStorage.removeItem('p5_role');
    localStorage.removeItem('p5_email');
    localStorage.removeItem('p5_name');
    sessionStorage.clear();
    window.location.href = '/index.html';
  };

  const filteredTenants = tenants.filter(
    (t) =>
      (t.nameNp && t.nameNp.includes(searchQuery)) ||
      (t.nameEn && t.nameEn.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.subdomain && t.subdomain.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f1f5f9', fontFamily: "'Outfit', 'Noto Sans Devanagari', sans-serif" }}>
      {/* Toast Alert */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 10000,
            backgroundColor: '#0f172a',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            border: '1px solid #3b82f6',
            fontSize: '0.9rem',
            fontWeight: 600,
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          <Sparkles size={18} color="#38bdf8" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* BS Calendar Date Picker Modal */}
      <BsCalendarModal
        isOpen={calendarModalOpen}
        onClose={() => setCalendarModalOpen(false)}
        initialBsDate={calendarTarget === 'start' ? fyStartBs : fyEndBs}
        onSelectDate={handleCalendarDateSelect}
        title={calendarTarget === 'start' ? 'आर्थिक वर्ष सुरु मिति (वि.सं.)' : 'आर्थिक वर्ष अन्त्य मिति (वि.सं.)'}
      />

      {/* ── SUPER ADMIN DARK BLUE MODERN SIDEBAR ── */}
      <aside
        style={{
          width: '256px',
          backgroundColor: '#0d1f3c',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 100,
          boxShadow: '4px 0 24px rgba(0,0,0,0.25)',
          flexShrink: 0,
        }}
      >
        {/* Brand Header */}
        <div
          style={{
            padding: '1.25rem 1rem',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #1565C0, #0284c7)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: '0.9rem',
              boxShadow: '0 2px 8px rgba(2,132,199,0.4)',
            }}
          >
            P5
          </div>
          <div>
            <h1 style={{ fontSize: '0.85rem', fontWeight: 700, margin: 0, color: '#ffffff', lineHeight: 1.2 }}>
              Super Admin Console
            </h1>
            <small style={{ color: '#7ba3d4', fontSize: '0.7rem', fontWeight: 500 }}>
              केन्द्रीय प्रशासन कन्सोल
            </small>
          </div>
        </div>

        {/* User Badge */}
        <div
          style={{
            margin: '0.75rem 0.75rem 0.25rem',
            padding: '8px 12px',
            borderRadius: '10px',
            backgroundColor: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #dc2626, #0284c7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.72rem',
            }}
          >
            SA
          </div>
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <span style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#ffffff', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {userEmail}
            </span>
            <span style={{ fontSize: '0.65rem', color: '#34d399', fontWeight: 600 }}>Root Super Admin</span>
          </div>
        </div>

        {/* Nav Links */}
        <div style={{ flex: 1, padding: '0.75rem 0.625rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1px' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#7ba3d4', padding: '0.25rem 0.625rem 0.5rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>
            प्रशासनिक मेनु
          </div>

          {[
            { id: 'dashboard', label: 'ड्यासबोर्ड (Overview)', sub: 'सिंहावलोकन', icon: <Activity size={16} /> },
            { id: 'municipalities', label: 'पालिकाहरू (Tenants)', sub: 'पालिका दर्ता', icon: <Building2 size={16} /> },
            { id: 'users', label: 'प्रयोगकर्ता व्यवस्थापन', sub: 'User Setup', icon: <Users size={16} /> },
            { id: 'roles', label: 'भूमिका तथा पहुँच (Roles)', sub: 'RBAC Access', icon: <Shield size={16} /> },
            { id: 'settings', label: 'प्रणाली सेटिङ (Settings)', sub: 'System Settings', icon: <Settings size={16} /> },
            { id: 'fiscal-year', label: 'आर्थिक वर्ष (Fiscal Year)', sub: 'वि.सं. पात्रो सेटअप', icon: <Calendar size={16} /> },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.625rem',
                padding: '0.5rem 0.625rem',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === item.id ? '#1e4d9b' : 'transparent',
                color: activeTab === item.id ? '#ffffff' : '#c8daf5',
                fontWeight: activeTab === item.id ? 600 : 400,
                fontSize: '0.825rem',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
                width: '100%',
              }}
              onMouseEnter={(e) => {
                if (activeTab !== item.id) {
                  (e.currentTarget as HTMLElement).style.backgroundColor = '#1a3260';
                  (e.currentTarget as HTMLElement).style.color = '#ffffff';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== item.id) {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                  (e.currentTarget as HTMLElement).style.color = '#c8daf5';
                }
              }}
            >
              <span style={{ opacity: 0.85, flexShrink: 0 }}>{item.icon}</span>
              <div>
                <span style={{ display: 'block', lineHeight: 1.3 }}>{item.label}</span>
                <small style={{ fontSize: '0.68rem', color: activeTab === item.id ? '#7ba3d4' : '#7ba3d4', opacity: 0.8 }}>
                  {item.sub}
                </small>
              </div>
            </button>
          ))}

          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#7ba3d4', padding: '0.75rem 0.625rem 0.4rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            द्रुत पहुँच
          </div>

          <a
            href="/app.html"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 12px',
              borderRadius: '10px',
              color: '#93bbf6',
              textDecoration: 'none',
              fontSize: '0.82rem',
              fontWeight: 600,
              background: 'rgba(255,255,255,0.04)',
            }}
          >
            <Building2 size={15} />
            <span>पालिका Admin ड्यासबोर्ड</span>
            <ArrowRight size={13} style={{ marginLeft: 'auto' }} />
          </a>

          <a
            href="/index.html"
            onClick={(e) => {
              e.preventDefault();
              const confirmed = window.confirm(
                'सार्वजनिक पोर्टलमा जाँदा Super Admin Session बाट Logout हुनेछ।\n\nके तपाईं निश्चित हुनुहुन्छ?'
              );
              if (!confirmed) return;
              handleLogout();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 12px',
              borderRadius: '10px',
              color: '#93bbf6',
              textDecoration: 'none',
              fontSize: '0.82rem',
              fontWeight: 600,
              background: 'rgba(255,255,255,0.04)',
              cursor: 'pointer',
            }}
          >
            <Globe size={15} />
            <span>मुख्य सार्वजनिक पोर्टल (Logout)</span>
            <ArrowRight size={13} style={{ marginLeft: 'auto' }} />
          </a>
        </div>

        {/* Logout button */}
        <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '10px',
              backgroundColor: '#dc2626',
              color: '#ffffff',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(220,38,38,0.3)',
            }}
          >
            <LogOut size={16} />
            <span>लगआउट</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN ADMINISTRATIVE CONTENT AREA ── */}
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        <div style={{ }}>
          {/* Header Bar */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
              padding: '1.25rem 1.5rem',
              marginBottom: '1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '14px',
                  backgroundColor: '#eff6ff',
                  color: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Shield size={26} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                  सुपर एडमिन केन्द्रीय कन्सोल (Super Admin Portal)
                </h2>
                <small style={{ color: '#64748b' }}>
                  Municipal Digital Twins Platform • केन्द्रीय नियन्त्रण कक्ष
                </small>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <div className="sa-service-pill">
                <span className="sa-pulse-dot" />
                <span>क्लस्टर सक्रिय (All 4 Services Online)</span>
              </div>

              <button
                onClick={() => {
                  setActiveTab('fiscal-year');
                  resetFiscalYearForm();
                }}
                style={{
                  padding: '8px 16px',
                  borderRadius: '10px',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
                }}
              >
                <Plus size={16} />
                <span>नयाँ आर्थिक वर्ष</span>
              </button>

              <button
                onClick={() => setActiveTab('municipalities')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '10px',
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Building2 size={16} />
                <span>नयाँ पालिका दर्ता</span>
              </button>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════
              TAB 6: FISCAL YEAR MANAGEMENT (RICH BIKRAM SAMBAT ENGINE)
             ══════════════════════════════════════════════════════════ */}
          {activeTab === 'fiscal-year' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Presets & Header */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '18px',
                  padding: '1.25rem 1.5rem',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
              >
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 4px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CalendarRange size={22} color="#2563eb" />
                    <span>आर्थिक वर्ष व्यवस्थापन (Fiscal Year Setup)</span>
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                    नेपाल सरकारको स्थानीय तहमा प्रयोग हुने आर्थिक वर्ष, सुरु तथा अन्त्य मिति (विक्रम संवत् वि.सं. पात्रो) व्यवस्थापन
                  </p>
                </div>

                {/* Quick Presets */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b' }}>द्रुत वर्ष छान्नुहोस्:</span>
                  <button
                    type="button"
                    onClick={() => handleSetPreset('२०८१/०८२')}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '9999px',
                      border: '1px solid #93c5fd',
                      backgroundColor: '#eff6ff',
                      color: '#1d4ed8',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    २०८१/०८२
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetPreset('२०८२/०८३')}
                    style={{
                      padding: '5px 14px',
                      borderRadius: '9999px',
                      border: 'none',
                      backgroundColor: '#2563eb',
                      color: '#ffffff',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      boxShadow: '0 4px 10px rgba(37,99,235,0.3)',
                    }}
                  >
                    <Plus size={13} />
                    <span>२०८२/०८३ थप्नुहोस्</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetPreset('२०८३/०८४')}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '9999px',
                      border: '1px solid #bbf7d0',
                      backgroundColor: '#f0fdf4',
                      color: '#15803d',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    २०८३/०८४
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetPreset('२०८४/०८५')}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '9999px',
                      border: '1px solid #e2e8f0',
                      backgroundColor: '#f8fafc',
                      color: '#475569',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    २०८४/०८५
                  </button>
                </div>
              </div>

              {/* 2-Column Layout: Form (Left) & List (Right) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 380px) 1fr', gap: '1.5rem' }}>
                {/* LEFT: Add / Edit Fiscal Year Card */}
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '18px',
                    border: '1px solid #e2e8f0',
                    padding: '1.5rem',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
                    height: 'fit-content',
                  }}
                >
                  <h4
                    style={{
                      fontSize: '1.05rem',
                      fontWeight: 800,
                      color: '#0f172a',
                      marginBottom: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <CalendarCheck size={20} color="#2563eb" />
                    <span>{editFyIndex >= 0 ? `आर्थिक वर्ष सम्पादन (${fyName})` : 'नयाँ आर्थिक वर्ष थप्नुहोस्'}</span>
                  </h4>

                  <form onSubmit={handleFiscalYearSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                    {/* FY Name */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        आर्थिक वर्ष (उदा. २०८१/०८२) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="उदा. २०८२/०८३"
                        value={fyName}
                        onChange={(e) => handleFyNameChange(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          borderRadius: '10px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.9rem',
                          fontWeight: 700,
                          outline: 'none',
                          color: '#0f172a',
                        }}
                      />
                      <small style={{ display: 'block', color: '#64748b', fontSize: '0.72rem', marginTop: '3px' }}>
                        आर्थिक वर्ष लेख्दा सुरु (१ साउन) र अन्त्य (असार मसान्त) मिति स्वतः भरिनेछ
                      </small>
                    </div>

                    {/* Start Date (BS) */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>
                          सुरु मिति (वि.सं.) *
                        </label>
                        <span style={{ fontSize: '0.7rem', color: '#2563eb', fontWeight: 700, backgroundColor: '#eff6ff', padding: '1px 6px', borderRadius: '4px' }}>
                          १ साउन
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <input
                          type="text"
                          required
                          readOnly
                          onClick={() => openBsCalendar('start')}
                          placeholder="२०८२-०४-०१"
                          value={fyStartBs}
                          style={{
                            flex: 1,
                            padding: '8px 12px',
                            borderRadius: '10px',
                            border: '1px solid #cbd5e1',
                            fontSize: '0.88rem',
                            fontWeight: 700,
                            backgroundColor: '#f8fafc',
                            cursor: 'pointer',
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => openBsCalendar('start')}
                          style={{
                            padding: '8px 12px',
                            borderRadius: '10px',
                            backgroundColor: '#2563eb',
                            color: '#ffffff',
                            border: 'none',
                            cursor: 'pointer',
                          }}
                          title="नेपाली पात्रो खोल्नुहोस्"
                        >
                          <Calendar size={16} />
                        </button>
                      </div>
                      {fyStartAd && (
                        <small style={{ display: 'block', color: '#64748b', fontSize: '0.75rem', marginTop: '2px' }}>
                          (ई.सं.: {fyStartAd})
                        </small>
                      )}
                    </div>

                    {/* End Date (BS) */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>
                          अन्त्य मिति (वि.सं.) *
                        </label>
                        <span style={{ fontSize: '0.7rem', color: '#dc2626', fontWeight: 700, backgroundColor: '#fef2f2', padding: '1px 6px', borderRadius: '4px' }}>
                          मसान्त असार
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <input
                          type="text"
                          required
                          readOnly
                          onClick={() => openBsCalendar('end')}
                          placeholder="२०८३-०३-३१"
                          value={fyEndBs}
                          style={{
                            flex: 1,
                            padding: '8px 12px',
                            borderRadius: '10px',
                            border: '1px solid #cbd5e1',
                            fontSize: '0.88rem',
                            fontWeight: 700,
                            backgroundColor: '#f8fafc',
                            cursor: 'pointer',
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => openBsCalendar('end')}
                          style={{
                            padding: '8px 12px',
                            borderRadius: '10px',
                            backgroundColor: '#2563eb',
                            color: '#ffffff',
                            border: 'none',
                            cursor: 'pointer',
                          }}
                          title="नेपाली पात्रो खोल्नुहोस्"
                        >
                          <Calendar size={16} />
                        </button>
                      </div>
                      {fyEndAd && (
                        <small style={{ display: 'block', color: '#64748b', fontSize: '0.75rem', marginTop: '2px' }}>
                          (ई.सं.: {fyEndAd})
                        </small>
                      )}
                    </div>

                    {/* Active Checkbox */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0' }}>
                      <input
                        type="checkbox"
                        id="fyActiveCb"
                        checked={fyIsActive}
                        onChange={(e) => setFyIsActive(e.target.checked)}
                        style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                      />
                      <label htmlFor="fyActiveCb" style={{ fontSize: '0.85rem', color: '#334155', fontWeight: 600, cursor: 'pointer' }}>
                        सक्रिय (Active Fiscal Year) बनाउनुहोस्
                      </label>
                    </div>

                    {/* Submit & Reset Buttons */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="submit"
                        style={{
                          flex: 1,
                          padding: '10px',
                          borderRadius: '10px',
                          backgroundColor: '#2563eb',
                          color: '#ffffff',
                          border: 'none',
                          fontWeight: 700,
                          fontSize: '0.9rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
                        }}
                      >
                        <Check size={18} />
                        <span>{editFyIndex >= 0 ? 'अद्यावधिक गर्नुहोस्' : 'नयाँ आर्थिक वर्ष थप्नुहोस्'}</span>
                      </button>

                      {editFyIndex >= 0 && (
                        <button
                          type="button"
                          onClick={resetFiscalYearForm}
                          style={{
                            padding: '10px 14px',
                            borderRadius: '10px',
                            backgroundColor: '#f1f5f9',
                            color: '#475569',
                            border: '1px solid #cbd5e1',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                          }}
                        >
                          रद्द
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                {/* RIGHT: Fiscal Years Table */}
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '18px',
                    border: '1px solid #e2e8f0',
                    padding: '1.5rem',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                      आर्थिक वर्षहरूको सूची (Registered Fiscal Years)
                    </h4>
                    <span
                      style={{
                        padding: '4px 12px',
                        borderRadius: '9999px',
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        color: '#475569',
                      }}
                    >
                      कुल: {toNepaliDigits(fiscalYearsList.length)}
                    </span>
                  </div>

                  <div style={{ overflowX: 'auto' }}>
                    <div className="dt-responsive-table-wrapper">
<table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: '0.875rem' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f8fafc', color: '#475569', textAlign: 'left' }}>
                          <th style={{ padding: '12px 14px', borderBottom: '2px solid #e2e8f0', fontWeight: 700 }}>आर्थिक वर्ष</th>
                          <th style={{ padding: '12px 14px', borderBottom: '2px solid #e2e8f0', fontWeight: 700 }}>सुरु मिति (वि.सं. / ई.सं.)</th>
                          <th style={{ padding: '12px 14px', borderBottom: '2px solid #e2e8f0', fontWeight: 700 }}>अन्त्य मिति (वि.सं. / ई.सं.)</th>
                          <th style={{ padding: '12px 14px', borderBottom: '2px solid #e2e8f0', fontWeight: 700 }}>स्थिति</th>
                          <th style={{ padding: '12px 14px', borderBottom: '2px solid #e2e8f0', fontWeight: 700, textAlign: 'right' }}>कार्य (Action)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {fiscalYearsList.map((fy, idx) => (
                          <tr key={fy.name} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '14px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div
                                  style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '8px',
                                    backgroundColor: fy.isActive ? '#eff6ff' : '#f8fafc',
                                    color: fy.isActive ? '#2563eb' : '#64748b',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 700,
                                  }}
                                >
                                  <Calendar size={16} />
                                </div>
                                <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>
                                  {fy.name}
                                </span>
                              </div>
                            </td>

                            <td style={{ padding: '14px' }}>
                              <strong style={{ color: '#1d4ed8', display: 'block' }}>{fy.startBs}</strong>
                              <small style={{ color: '#64748b', fontSize: '0.75rem' }}>AD: {fy.startAd}</small>
                            </td>

                            <td style={{ padding: '14px' }}>
                              <strong style={{ color: '#dc2626', display: 'block' }}>{fy.endBs}</strong>
                              <small style={{ color: '#64748b', fontSize: '0.75rem' }}>AD: {fy.endAd}</small>
                            </td>

                            <td style={{ padding: '14px' }}>
                              {fy.isActive ? (
                                <span
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    padding: '3px 10px',
                                    borderRadius: '9999px',
                                    backgroundColor: '#ecfdf5',
                                    color: '#059669',
                                    fontSize: '0.78rem',
                                    fontWeight: 700,
                                    boxShadow: '0 2px 6px rgba(16,185,129,0.15)',
                                  }}
                                >
                                  <CheckCircle2 size={13} />
                                  <span>सक्रिय (Active)</span>
                                </span>
                              ) : (
                                <span
                                  style={{
                                    padding: '3px 10px',
                                    borderRadius: '9999px',
                                    backgroundColor: '#f1f5f9',
                                    color: '#64748b',
                                    fontSize: '0.78rem',
                                    fontWeight: 600,
                                  }}
                                >
                                  निष्क्रिय
                                </span>
                              )}
                            </td>

                            <td style={{ padding: '14px', textAlign: 'right' }}>
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                {!fy.isActive && (
                                  <button
                                    type="button"
                                    onClick={() => handleToggleFiscalYearActive(idx)}
                                    title="सक्रिय बनाउनुहोस्"
                                    style={{
                                      padding: '4px 10px',
                                      borderRadius: '6px',
                                      border: '1px solid #bbf7d0',
                                      backgroundColor: '#f0fdf4',
                                      color: '#15803d',
                                      fontSize: '0.75rem',
                                      fontWeight: 700,
                                      cursor: 'pointer',
                                    }}
                                  >
                                    सक्रिय बनाउनुहोस्
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => handleEditFiscalYear(idx)}
                                  title="सम्पादन गर्नुहोस्"
                                  style={{
                                    padding: '5px 8px',
                                    borderRadius: '6px',
                                    border: '1px solid #cbd5e1',
                                    backgroundColor: '#ffffff',
                                    color: '#2563eb',
                                    cursor: 'pointer',
                                  }}
                                >
                                  <Edit2 size={14} />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteFiscalYear(idx)}
                                  title="मेटाउनुहोस्"
                                  style={{
                                    padding: '5px 8px',
                                    borderRadius: '6px',
                                    border: '1px solid #fca5a5',
                                    backgroundColor: '#fff',
                                    color: '#dc2626',
                                    cursor: 'pointer',
                                  }}
                                >
                                  <Trash2 size={14} />
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
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              TAB 1: EXECUTIVE DASHBOARD OVERVIEW
             ══════════════════════════════════════════════════════════ */}
          {activeTab === 'dashboard' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Top Executive KPI Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                <div className="sa-kpi-card sa-kpi-blue">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>जम्मा पालिकाहरू</span>
                      <h3 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', margin: '4px 0' }}>
                        {toNepaliDigits(tenants.length)}
                      </h3>
                      <small style={{ color: '#059669', fontWeight: 700 }}>१००% क्लाउड अनबोर्डिङ</small>
                    </div>
                    <div className="sa-icon-circle" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
                      <Building2 size={24} />
                    </div>
                  </div>
                </div>

                <div className="sa-kpi-card sa-kpi-green">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>प्रणाली प्रयोगकर्ता</span>
                      <h3 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', margin: '4px 0' }}>
                        {toNepaliDigits(usersList.length)}
                      </h3>
                      <small style={{ color: '#059669', fontWeight: 700 }}>प्रशासक तथा वडा सचिवहरू</small>
                    </div>
                    <div className="sa-icon-circle" style={{ backgroundColor: '#ecfdf5', color: '#059669' }}>
                      <Users size={24} />
                    </div>
                  </div>
                </div>

                <div className="sa-kpi-card sa-kpi-amber">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>सक्रिय आर्थिक वर्ष</span>
                      <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', margin: '4px 0' }}>
                        {fiscalYearsList.find((x) => x.isActive)?.name || '२०८१/०८२'}
                      </h3>
                      <small style={{ color: '#2563eb', fontWeight: 700 }}>वि.सं. विक्रम संवत् पात्रो</small>
                    </div>
                    <div className="sa-icon-circle" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
                      <Calendar size={24} />
                    </div>
                  </div>
                </div>

                <div className="sa-kpi-card sa-kpi-purple">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>क्लस्टर पूर्वाधार</span>
                      <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a', margin: '4px 0' }}>
                        ४ / ४
                      </h3>
                      <small style={{ color: '#059669', fontWeight: 700 }}>कन्टेनरहरू अनलाइन</small>
                    </div>
                    <div className="sa-icon-circle" style={{ backgroundColor: '#f5f3ff', color: '#7c3aed' }}>
                      <Cpu size={24} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Tenants Table */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '18px',
                  border: '1px solid #e2e8f0',
                  padding: '1.5rem',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                      दर्ता भएका पालिकाहरू (Registered Municipalities)
                    </h4>
                    <small style={{ color: '#64748b' }}>केन्द्रीय डिजिटल ट्विन प्लेटफर्ममा आबद्ध स्थानीय तहहरूको सूची</small>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ position: 'relative' }}>
                      <Search size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }} />
                      <input
                        type="text"
                        placeholder="पालिका खोज्नुहोस्..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                          padding: '6px 12px 6px 34px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.85rem',
                          width: '220px',
                          outline: 'none',
                        }}
                      />
                    </div>
                    <button
                      onClick={() => setActiveTab('municipalities')}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        backgroundColor: '#2563eb',
                        color: '#ffffff',
                        border: 'none',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Plus size={14} />
                      <span>नयाँ पालिका</span>
                    </button>
                  </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <div className="dt-responsive-table-wrapper">
<table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: '0.875rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8fafc', color: '#475569', textAlign: 'left' }}>
                        <th style={{ padding: '12px 14px', borderBottom: '2px solid #e2e8f0', fontWeight: 700 }}>पालिकाको नाम</th>
                        <th style={{ padding: '12px 14px', borderBottom: '2px solid #e2e8f0', fontWeight: 700 }}>प्रदेश</th>
                        <th style={{ padding: '12px 14px', borderBottom: '2px solid #e2e8f0', fontWeight: 700 }}>जिल्ला</th>
                        <th style={{ padding: '12px 14px', borderBottom: '2px solid #e2e8f0', fontWeight: 700 }}>सम्पर्क / सबडोमेन</th>
                        <th style={{ padding: '12px 14px', borderBottom: '2px solid #e2e8f0', fontWeight: 700 }}>स्थिति</th>
                        <th style={{ padding: '12px 14px', borderBottom: '2px solid #e2e8f0', fontWeight: 700, textAlign: 'right' }}>कार्य</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTenants.map((t) => (
                        <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div
                                style={{
                                  width: '36px',
                                  height: '36px',
                                  borderRadius: '10px',
                                  background: 'linear-gradient(135deg, #1565c0, #e65100)',
                                  color: '#ffffff',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 800,
                                  fontSize: '0.85rem',
                                }}
                              >
                                {t.nameNp && typeof t.nameNp === 'string' ? t.nameNp.substring(0, 2) : 'NA'}
                              </div>
                              <div>
                                <strong style={{ color: '#0f172a', display: 'block' }}>{t.nameNp}</strong>
                                <small style={{ color: '#64748b' }}>{t.nameEn}</small>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '14px' }}>
                            <span style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '3px 10px', borderRadius: '9999px', fontSize: '0.78rem', fontWeight: 600 }}>
                              {t.province || 'बागमती'}
                            </span>
                          </td>
                          <td style={{ padding: '14px', fontWeight: 600, color: '#334155' }}>
                            {t.district || 'सिन्धुपाल्चोक'}
                          </td>
                          <td style={{ padding: '14px' }}>
                            <span style={{ display: 'block', fontSize: '0.8rem', color: '#0f172a' }}>{t.adminEmail}</span>
                            <code style={{ fontSize: '0.75rem', color: '#2563eb' }}>{t.subdomain}.local</code>
                          </td>
                          <td style={{ padding: '14px' }}>
                            <span
                              style={{
                                backgroundColor: t.status === 'active' ? '#ecfdf5' : '#fef2f2',
                                color: t.status === 'active' ? '#059669' : '#dc2626',
                                padding: '3px 10px',
                                borderRadius: '9999px',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                              }}
                            >
                              {t.status === 'active' ? '● सक्रिय' : '○ बन्द'}
                            </span>
                          </td>
                          <td style={{ padding: '14px', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '6px' }}>
                              <Link
                                to="/admin"
                                style={{
                                  padding: '5px 12px',
                                  borderRadius: '6px',
                                  backgroundColor: '#2563eb',
                                  color: '#ffffff',
                                  textDecoration: 'none',
                                  fontSize: '0.8rem',
                                  fontWeight: 600,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                }}
                              >
                                <ExternalLink size={12} />
                                <span>व्यवस्थापन</span>
                              </Link>
                              <button
                                onClick={() => handleToggleTenantStatus(t.id)}
                                title="Status परिवर्तन"
                                style={{
                                  padding: '5px 8px',
                                  borderRadius: '6px',
                                  border: '1px solid #cbd5e1',
                                  backgroundColor: '#ffffff',
                                  cursor: 'pointer',
                                  color: t.status === 'active' ? '#dc2626' : '#10b981',
                                }}
                              >
                                {t.status === 'active' ? <Lock size={13} /> : <Unlock size={13} />}
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
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              TAB 2: MUNICIPALITIES SETUP
             ══════════════════════════════════════════════════════════ */}
          {activeTab === 'municipalities' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 380px) 1fr', gap: '1.5rem' }}>
                {/* Form */}
                <div style={{ backgroundColor: '#ffffff', borderRadius: '18px', border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>
                    नयाँ पालिका दर्ता गर्नुहोस्
                  </h4>
                  <form onSubmit={handleAddTenant} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        प्रदेश (Province) *
                      </label>
                      <select
                        value={newTenant.province}
                        onChange={(e) => setNewTenant({ ...newTenant, province: e.target.value, district: '', nameNp: '' })}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                      >
                        <option value="">प्रदेश छान्नुहोस्</option>
                        {NEPAL_ADMIN_STRUCTURE.map((p) => (
                          <option key={p.name} value={p.name}>{p.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        जिल्ला (District) *
                      </label>
                      <select
                        required
                        value={newTenant.district}
                        onChange={(e) => setNewTenant({ ...newTenant, district: e.target.value, nameNp: '' })}
                        disabled={!newTenant.province}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', backgroundColor: !newTenant.province ? '#f1f5f9' : '#ffffff' }}
                      >
                        <option value="">जिल्ला छान्नुहोस्</option>
                        {newTenant.province && NEPAL_ADMIN_STRUCTURE.find(p => p.name === newTenant.province)?.districts.map(d => (
                          <option key={d.name} value={d.name}>{d.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        स्थानीय तहको नाम (नेपालीमा) *
                      </label>
                      <select
                        required
                        value={newTenant.nameNp}
                        onChange={(e) => setNewTenant({ ...newTenant, nameNp: e.target.value })}
                        disabled={!newTenant.district}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', backgroundColor: !newTenant.district ? '#f1f5f9' : '#ffffff' }}
                      >
                        <option value="">स्थानीय तह छान्नुहोस्</option>
                        {newTenant.province && newTenant.district && NEPAL_ADMIN_STRUCTURE.find(p => p.name === newTenant.province)?.districts.find(d => d.name === newTenant.district)?.palikas.map(palika => (
                          <option key={palika.name} value={palika.name}>{palika.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        सबडोमेन कोड (Subdomain) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="उदा. panchpokhari"
                        value={newTenant.subdomain}
                        onChange={(e) => setNewTenant({ ...newTenant, subdomain: e.target.value })}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        प्रशासक इमेल (Admin Email)
                      </label>
                      <input
                        type="email"
                        placeholder="admin@panchpokhari.gov.np"
                        value={newTenant.adminEmail}
                        onChange={(e) => setNewTenant({ ...newTenant, adminEmail: e.target.value })}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                      />
                    </div>

                    <button
                      type="submit"
                      style={{
                        padding: '10px',
                        borderRadius: '8px',
                        backgroundColor: '#2563eb',
                        color: '#ffffff',
                        border: 'none',
                        fontWeight: 700,
                        cursor: 'pointer',
                        marginTop: '4px',
                      }}
                    >
                      पालिका थप्नुहोस्
                    </button>
                  </form>
                </div>

                {/* List */}
                <div style={{ backgroundColor: '#ffffff', borderRadius: '18px', border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>
                    मल्टि-टेनेन्ट पालिकाहरूको सूची
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {tenants.map((t) => (
                      <div
                        key={t.id}
                        style={{
                          padding: '12px 16px',
                          borderRadius: '12px',
                          border: '1px solid #e2e8f0',
                          backgroundColor: '#f8fafc',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div>
                          <strong style={{ fontSize: '0.95rem', color: '#0f172a', display: 'block' }}>{t.nameNp}</strong>
                          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                            {t.province} • {t.district} • सबडोमेन: {t.subdomain}
                          </span>
                        </div>
                        <span
                          style={{
                            padding: '3px 10px',
                            borderRadius: '9999px',
                            backgroundColor: t.status === 'active' ? '#ecfdf5' : '#fef2f2',
                            color: t.status === 'active' ? '#059669' : '#dc2626',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                          }}
                        >
                          {t.status === 'active' ? 'Active' : 'Disabled'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              TAB 3: USERS SETUP & MULTI-TENANT ROLE ASSIGNMENT
             ══════════════════════════════════════════════════════════ */}
          {activeTab === 'users' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(330px, 400px) 1fr', gap: '1.5rem' }}>
              {/* LEFT CARD: Add User & Assign Role */}
              <div style={{ backgroundColor: '#ffffff', borderRadius: '18px', border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <UserCheck size={20} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      नयाँ प्रयोगकर्ता थप्नुहोस्
                    </h4>
                    <small style={{ color: '#64748b' }}>पालिका छान्नुहोस् र भूमिका (Role) तोक्नुहोस्</small>
                  </div>
                </div>

                <form onSubmit={handleAddUser} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      पुरा नाम (Full Name) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="उदा. राम बहादुर थापा"
                      value={newUser.fullName}
                      onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      इमेल ठेगाना (Email) *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="user@panchpokhari.gov.np"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: (newUser.email.trim() && usersList.some((u) => (u.email || '').trim().toLowerCase() === newUser.email.trim().toLowerCase()))
                          ? '1px solid #ef4444'
                          : '1px solid #cbd5e1',
                        backgroundColor: (newUser.email.trim() && usersList.some((u) => (u.email || '').trim().toLowerCase() === newUser.email.trim().toLowerCase()))
                          ? '#fef2f2'
                          : '#ffffff',
                        fontSize: '0.88rem',
                      }}
                    />
                    {newUser.email.trim() && usersList.some((u) => (u.email || '').trim().toLowerCase() === newUser.email.trim().toLowerCase()) && (
                      <small style={{ color: '#dc2626', fontSize: '0.74rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                        <AlertCircle size={13} />
                        <span>यो इमेल पहिले नै दर्ता भइसकेको छ। कृपया अर्को फरक इमेल राख्नुहोस्।</span>
                      </small>
                    )}
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>
                        लगइन पासवर्ड (Password) *
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const generated = 'Palika@' + Math.floor(1000 + Math.random() * 9000);
                          setNewUser({ ...newUser, password: generated });
                          setShowNewUserPassword(true);
                          showToast(`स्वतः सुरक्षित पासवर्ड सिर्जना भयो: ${generated}`);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#2563eb',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          padding: 0,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Key size={12} />
                        <span>स्वतः पासवर्ड बनाउनुहोस्</span>
                      </button>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showNewUserPassword ? 'text' : 'password'}
                        required
                        placeholder="पासवर्ड राख्नुहोस् (उदा. Palika@2025!)"
                        value={newUser.password}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                        style={{ width: '100%', padding: '8px 36px 8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewUserPassword(!showNewUserPassword)}
                        style={{
                          position: 'absolute',
                          right: '8px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          color: '#64748b',
                          cursor: 'pointer',
                          padding: '4px',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                        title={showNewUserPassword ? 'पासवर्ड लुकाउनुहोस्' : 'पासवर्ड देखाउनुहोस्'}
                      >
                        {showNewUserPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <small style={{ display: 'block', marginTop: '3px', fontSize: '0.72rem', color: '#64748b' }}>
                      कम्तीमा ६ अक्षर लामो हुनुपर्छ। यो पासवर्ड प्रयोगकर्ताले लगइन गर्दा प्रयोग गर्नेछन्।
                    </small>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      सम्बन्धित स्थानीय तह (Tenant / पालिका) *
                    </label>
                    <select
                      value={newUser.tenantId}
                      onChange={(e) => setNewUser({ ...newUser, tenantId: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                    >
                      <option value="panchpokhari">पाँचपोखरी थाङपाल गाउँपालिका</option>
                      <option value="helambu">हेलम्बु गाउँपालिका</option>
                      <option value="melamchi">मेलम्ची नगरपालिका</option>
                      {tenants
                        .filter((t) => !['panchpokhari', 'helambu', 'melamchi'].includes(t.id))
                        .map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.nameNp}
                          </option>
                        ))}
                      <option value="all">केन्द्रीय प्रशासन (All Tenants / Super Admin)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      तोकिने भूमिका (Role Assignment) *
                    </label>
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                    >
                      {ROLE_DEFINITIONS.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                    <small style={{ display: 'block', marginTop: '4px', fontSize: '0.72rem', color: '#64748b' }}>
                      {getRoleInfo(newUser.role).desc}
                    </small>
                  </div>

                  {newUser.role === 'ward_user' && (
                    <div style={{ backgroundColor: '#f0fdf4', padding: '10px 12px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#15803d', marginBottom: '4px' }}>
                        वडा नम्बर (Ward Number) *
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={32}
                        value={newUser.wardNumber}
                        onChange={(e) => setNewUser({ ...newUser, wardNumber: parseInt(e.target.value) || 1 })}
                        style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #86efac', fontSize: '0.85rem' }}
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    style={{
                      padding: '11px',
                      borderRadius: '8px',
                      backgroundColor: '#2563eb',
                      color: '#ffffff',
                      border: 'none',
                      fontWeight: 700,
                      cursor: 'pointer',
                      marginTop: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 12px rgba(37,99,235,0.25)',
                    }}
                  >
                    <Plus size={16} />
                    <span>प्रयोगकर्ता थप्नुहोस् र Role तोक्नुहोस्</span>
                  </button>
                </form>
              </div>

              {/* RIGHT CARD: Users List & Role Actions */}
              <div style={{ backgroundColor: '#ffffff', borderRadius: '18px', border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
                {/* Header with Search & Filter */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                      प्रणाली प्रयोगकर्ता तथा भूमिका व्यवस्थापन
                    </h4>
                    <small style={{ color: '#64748b' }}>
                      पालिका अनुसारका प्रयोगकर्ताहरूको भूमिका (Role) तोक्ने तथा सम्पादन गर्ने कक्ष
                    </small>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: 700, backgroundColor: '#eff6ff', padding: '4px 10px', borderRadius: '9999px' }}>
                    जम्मा: {filteredUsers.length} प्रयोगकर्ता
                  </span>
                </div>

                {/* Filters Row */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ position: 'relative', flex: '1 1 200px' }}>
                    <Search size={15} style={{ position: 'absolute', left: '10px', top: '9px', color: '#94a3b8' }} />
                    <input
                      type="text"
                      placeholder="नाम वा इमेल खोज्नुहोस्..."
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '6px 12px 6px 32px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.82rem',
                      }}
                    />
                  </div>

                  <select
                    value={userTenantFilter}
                    onChange={(e) => setUserTenantFilter(e.target.value)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.82rem',
                      backgroundColor: '#ffffff',
                    }}
                  >
                    <option value="all">सबै पालिकाहरू (All Tenants)</option>
                    <option value="panchpokhari">पाँचपोखरी थाङपाल</option>
                    <option value="helambu">हेलम्बु गाउँपालिका</option>
                    <option value="melamchi">मेलम्ची नगरपालिका</option>
                    <option value="super_admin">केन्द्रीय Root Admin</option>
                  </select>

                  <select
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.82rem',
                      backgroundColor: '#ffffff',
                    }}
                  >
                    <option value="all">सबै भूमिकाहरू (All Roles)</option>
                    {ROLE_DEFINITIONS.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Users Table */}
                <div style={{ overflowX: 'auto' }}>
                  <div className="dt-responsive-table-wrapper">
<table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8fafc', color: '#475569', textAlign: 'left' }}>
                        <th style={{ padding: '10px 12px', borderBottom: '2px solid #e2e8f0', fontWeight: 700 }}>प्रयोगकर्ता</th>
                        <th style={{ padding: '10px 12px', borderBottom: '2px solid #e2e8f0', fontWeight: 700 }}>पालिका (Tenant)</th>
                        <th style={{ padding: '10px 12px', borderBottom: '2px solid #e2e8f0', fontWeight: 700 }}>तोकिएको भूमिका</th>
                        <th style={{ padding: '10px 12px', borderBottom: '2px solid #e2e8f0', fontWeight: 700 }}>वडा</th>
                        <th style={{ padding: '10px 12px', borderBottom: '2px solid #e2e8f0', fontWeight: 700 }}>स्थिति</th>
                        <th style={{ padding: '10px 12px', borderBottom: '2px solid #e2e8f0', textAlign: 'right', fontWeight: 700 }}>कार्य</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>
                            कुनै प्रयोगकर्ता भेटिएन।
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((u) => {
                          const roleInfo = getRoleInfo(u.role);
                          return (
                            <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '12px' }}>
                                <strong style={{ color: '#0f172a', display: 'block' }}>{u.fullName}</strong>
                                <small style={{ color: '#64748b' }}>{u.email}</small>
                              </td>

                              <td style={{ padding: '12px' }}>
                                <span
                                  style={{
                                    backgroundColor: u.tenantId === 'all' || u.role === 'super_admin' ? '#f5f3ff' : '#f0fdf4',
                                    color: u.tenantId === 'all' || u.role === 'super_admin' ? '#7c3aed' : '#15803d',
                                    border: `1px solid ${u.tenantId === 'all' || u.role === 'super_admin' ? '#ddd6fe' : '#bbf7d0'}`,
                                    padding: '3px 8px',
                                    borderRadius: '6px',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {getTenantName(u.tenantId)}
                                </span>
                              </td>

                              <td style={{ padding: '12px' }}>
                                <span
                                  title={roleInfo.desc}
                                  style={{
                                    backgroundColor: roleInfo.bg,
                                    color: roleInfo.color,
                                    border: `1px solid ${roleInfo.border}`,
                                    padding: '3px 10px',
                                    borderRadius: '9999px',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  <ShieldCheck size={12} />
                                  <span>{roleInfo.label}</span>
                                </span>
                              </td>

                              <td style={{ padding: '12px', fontWeight: 600, color: '#475569' }}>
                                {u.wardNumber ? `वडा नं ${u.wardNumber}` : '-'}
                              </td>

                              <td style={{ padding: '12px' }}>
                                <span
                                  style={{
                                    color: u.status === 'active' ? '#059669' : '#dc2626',
                                    backgroundColor: u.status === 'active' ? '#ecfdf5' : '#fef2f2',
                                    padding: '2px 8px',
                                    borderRadius: '9999px',
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                  }}
                                >
                                  {u.status === 'active' ? '● सक्रिय' : '○ निष्क्रिय'}
                                </span>
                              </td>

                              <td style={{ padding: '12px', textAlign: 'right' }}>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                  {/* Assign Role / Edit Button */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingUser({ ...u });
                                      setEditUserPassword('');
                                      setShowEditPassword(false);
                                    }}
                                    title="भूमिका वा पासवर्ड परिवर्तन गर्नुहोस्"
                                    style={{
                                      padding: '5px 10px',
                                      borderRadius: '6px',
                                      border: '1px solid #93c5fd',
                                      backgroundColor: '#eff6ff',
                                      color: '#1d4ed8',
                                      fontSize: '0.75rem',
                                      fontWeight: 700,
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                    }}
                                  >
                                    <Key size={13} />
                                    <span>Role / Password</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleToggleUserStatus(u.id)}
                                    title={u.status === 'active' ? 'खाता निष्क्रिय गर्नुहोस्' : 'खाता सक्रिय गर्नुहोस्'}
                                    style={{
                                      padding: '5px 8px',
                                      borderRadius: '6px',
                                      border: '1px solid #cbd5e1',
                                      backgroundColor: '#fff',
                                      color: u.status === 'active' ? '#dc2626' : '#059669',
                                      cursor: 'pointer',
                                    }}
                                  >
                                    {u.status === 'active' ? <Lock size={13} /> : <Unlock size={13} />}
                                  </button>

                                  {u.id !== 'u1' && (
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteUser(u.id, u.fullName)}
                                      title="प्रयोगकर्ता हटाउनुहोस्"
                                      style={{
                                        padding: '5px 8px',
                                        borderRadius: '6px',
                                        border: '1px solid #fecaca',
                                        backgroundColor: '#fff',
                                        color: '#dc2626',
                                        cursor: 'pointer',
                                      }}
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  )}
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
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              TAB 4: ROLES & RBAC PERMISSION MATRIX
             ══════════════════════════════════════════════════════════ */}
          {activeTab === 'roles' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Top Banner with Quick Assign Role Action */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '18px',
                  padding: '1.25rem 1.5rem',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ backgroundColor: '#2563eb', color: '#fff', padding: '2px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 800 }}>
                      MULTI-TENANT RBAC
                    </span>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                      भूमिका तथा पहुँच नियन्त्रण (RBAC Matrix)
                    </h3>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', maxWidth: '750px' }}>
                    यो तालिकाले प्रत्येक भूमिका (Role) लाई प्लेटफर्मका विभिन्न मोड्युलहरूमा प्राप्त अधिकार देखाउँछ। कुनै पनि प्रयोगकर्ता वा कर्मचारीलाई भूमिका तोक्न तलको बटन थिच्नुहोस्।
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('users')}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '10px',
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(37,99,235,0.3)',
                  }}
                >
                  <Key size={16} />
                  <span>प्रयोगकर्तालाई भूमिका तोक्नुहोस् (Assign Role)</span>
                  <ArrowRight size={15} />
                </button>
              </div>

              {/* Role Distribution Summary Badges */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                {[
                  { role: 'super_admin', label: 'Super Admin', count: usersList.filter((u) => u.role === 'super_admin').length, color: '#dc2626', bg: '#fef2f2' },
                  { role: 'admin', label: 'Palika Admin', count: usersList.filter((u) => u.role === 'admin').length, color: '#2563eb', bg: '#eff6ff' },
                  { role: 'cao', label: 'CAO (प्रशासकीय अधिकृत)', count: usersList.filter((u) => u.role === 'cao').length, color: '#7c3aed', bg: '#f5f3ff' },
                  { role: 'planning_officer', label: 'Planning Officer', count: usersList.filter((u) => u.role === 'planning_officer').length, color: '#059669', bg: '#ecfdf5' },
                  { role: 'ward_user', label: 'Ward Users (वडा)', count: usersList.filter((u) => u.role === 'ward_user').length, color: '#0891b2', bg: '#ecfeff' },
                ].map((item) => (
                  <div
                    key={item.role}
                    onClick={() => {
                      setUserRoleFilter(item.role);
                      setActiveTab('users');
                    }}
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: '14px',
                      padding: '14px',
                      border: '1px solid #e2e8f0',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>{item.label}</span>
                      <h4 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '2px 0 0', color: item.color }}>
                        {toNepaliDigits(item.count)} जना
                      </h4>
                    </div>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: item.bg, color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <UserCheck size={18} />
                    </div>
                  </div>
                ))}
              </div>

              {/* RBAC Matrix Table */}
              <div style={{ backgroundColor: '#ffffff', borderRadius: '18px', border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      मोड्युल अनुसार अधिकार तालिका (Permission Matrix)
                    </h4>
                    <small style={{ color: '#64748b' }}>कुन भूमिकाले कुन मोड्युलमा के-के कार्य गर्न सक्छन् भन्ने विवरण</small>
                  </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <div className="dt-responsive-table-wrapper">
<table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8fafc', color: '#475569', textAlign: 'left' }}>
                        <th style={{ padding: '12px 14px', borderBottom: '2px solid #e2e8f0', fontWeight: 700 }}>मोड्युल / सेवा</th>
                        <th style={{ padding: '12px 14px', borderBottom: '2px solid #e2e8f0', fontWeight: 700 }}>Super Admin</th>
                        <th style={{ padding: '12px 14px', borderBottom: '2px solid #e2e8f0', fontWeight: 700 }}>Palika Admin</th>
                        <th style={{ padding: '12px 14px', borderBottom: '2px solid #e2e8f0', fontWeight: 700 }}>CAO (प्रशासकीय)</th>
                        <th style={{ padding: '12px 14px', borderBottom: '2px solid #e2e8f0', fontWeight: 700 }}>Planning (योजना)</th>
                        <th style={{ padding: '12px 14px', borderBottom: '2px solid #e2e8f0', fontWeight: 700 }}>Ward User (वडा)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { mod: 'नागरिक बडापत्र तथा ई-सिफारिस', sa: 'Full Access', pa: 'Palika Level', cao: 'Approve/Sign', po: 'Manage', wu: 'Ward Only' },
                        { mod: 'दर्ता तथा चलानी प्रणाली', sa: 'Full Access', pa: 'Palika Level', cao: 'Approve/Sign', po: 'Manage', wu: 'Ward Only' },
                        { mod: 'योजना तथा कार्यक्रम व्यवस्थापन', sa: 'Full Access', pa: 'Palika Level', cao: 'Approve/Sign', po: 'Full Manage', wu: '-' },
                        { mod: 'राजस्व, कर तथा दस्तुर संकलन', sa: 'Full Access', pa: 'Palika Level', cao: 'Approve/Audit', po: 'View Reports', wu: 'Ward Entry' },
                        { mod: 'विपद् व्यवस्थापन तथा SMS गेटवे', sa: 'Full Access', pa: 'Palika Level', cao: 'Broadcast Sign', po: '-', wu: 'Ward Alert' },
                        { mod: 'स्वास्थ्य, शिक्षा तथा सामाजिक अभिलेख', sa: 'Full Access', pa: 'Palika Level', cao: 'Approve/Sign', po: 'Manage', wu: 'Ward Only' },
                        { mod: 'GIS नक्सा तथा सेन्सर स्ट्रिम', sa: 'Full Access', pa: 'Palika Level', cao: 'Approve/Sign', po: 'Manage', wu: '-' },
                        { mod: 'प्रणाली सेटिङ तथा आर्थिक वर्ष', sa: 'Full Access', pa: '-', cao: '-', po: '-', wu: '-' },
                      ].map((row, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '14px', fontWeight: 700, color: '#0f172a' }}>{row.mod}</td>
                          <td style={{ padding: '14px', color: '#059669', fontWeight: 700 }}>
                            <span style={{ backgroundColor: '#ecfdf5', padding: '2px 8px', borderRadius: '6px' }}>{row.sa}</span>
                          </td>
                          <td style={{ padding: '14px', color: row.pa !== '-' ? '#059669' : '#94a3b8', fontWeight: 600 }}>
                            {row.pa !== '-' ? <span style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '2px 8px', borderRadius: '6px' }}>{row.pa}</span> : '-'}
                          </td>
                          <td style={{ padding: '14px', color: row.cao !== '-' ? '#7c3aed' : '#94a3b8', fontWeight: 600 }}>
                            {row.cao !== '-' ? <span style={{ backgroundColor: '#f5f3ff', color: '#7c3aed', padding: '2px 8px', borderRadius: '6px' }}>{row.cao}</span> : '-'}
                          </td>
                          <td style={{ padding: '14px', color: row.po !== '-' ? '#059669' : '#94a3b8', fontWeight: 600 }}>
                            {row.po !== '-' ? <span style={{ backgroundColor: '#ecfdf5', color: '#059669', padding: '2px 8px', borderRadius: '6px' }}>{row.po}</span> : '-'}
                          </td>
                          <td style={{ padding: '14px', color: row.wu !== '-' ? '#0891b2' : '#94a3b8', fontWeight: 600 }}>
                            {row.wu !== '-' ? <span style={{ backgroundColor: '#ecfeff', color: '#0891b2', padding: '2px 8px', borderRadius: '6px' }}>{row.wu}</span> : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
</div>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              TAB 5: SYSTEM SETTINGS
             ══════════════════════════════════════════════════════════ */}
          {activeTab === 'settings' && (
            <div style={{ backgroundColor: '#ffffff', borderRadius: '18px', border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
                केन्द्रीय प्रणाली सेटिङ (Global System Settings)
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem' }}>
                क्लाउड पूर्वाधार, PostGIS डाटाबेस अटोमेसन, SMS गेटवे तथा सुरक्षा नीतिहरू
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '650px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    प्लेटफर्म ब्रान्डिङ नाम
                  </label>
                  <input
                    type="text"
                    value={systemSettings.platformName}
                    onChange={(e) => setSystemSettings({ ...systemSettings, platformName: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                  <div>
                    <strong style={{ fontSize: '0.88rem', display: 'block', color: '#0f172a' }}>दैनिक PostGIS स्वचालित ब्याकअप (Automated Backup)</strong>
                    <small style={{ color: '#64748b' }}>scripts/backup_db.ps1 स्वचालित रोटेसन (७ दिनको स्न्यापसट सुरक्षित)</small>
                  </div>
                  <span style={{ color: '#059669', fontWeight: 700, fontSize: '0.82rem' }}>सक्रिय</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                  <div>
                    <strong style={{ fontSize: '0.88rem', display: 'block', color: '#0f172a' }}>आपतकालीन SMS गेटवे (NTC / Sparrow SMS)</strong>
                    <small style={{ color: '#64748b' }}>विपद् पूर्वसूचनाको नागरिक प्रसारणका लागि जडित गेटवे</small>
                  </div>
                  <span style={{ color: '#059669', fontWeight: 700, fontSize: '0.82rem' }}>सक्रिय</span>
                </div>

                <button
                  onClick={() => showToast('प्रणाली सेटिङहरू सुरक्षित गरियो!')}
                  style={{
                    padding: '10px 24px',
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '9999px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    alignSelf: 'flex-start',
                    boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
                  }}
                >
                  सेटिङ सुरक्षित गर्नुहोस्
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ── ROLE ASSIGNMENT & TENANT EDIT MODAL ── */}
      {editingUser && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '1rem',
          }}
          onClick={() => setEditingUser(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              padding: '2rem',
              width: '100%',
              maxWidth: '520px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid #e2e8f0',
              animation: 'fadeIn 0.15s ease-out',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    backgroundColor: '#eff6ff',
                    color: '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Key size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                    भूमिका तथा पहुँच परिवर्तन (Assign Role)
                  </h3>
                  <small style={{ color: '#64748b' }}>Multi-Tenant Role & Municipality Setup</small>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateUserRole} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              {/* User Identity Info */}
              <div style={{ backgroundColor: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  प्रयोगकर्ता विवरण
                </span>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                  <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{editingUser.fullName}</strong>
                  <span style={{ fontSize: '0.8rem', color: '#475569' }}>{editingUser.email}</span>
                </div>
              </div>

              {/* Municipality (Tenant) Selection */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  सम्बन्धित स्थानीय तह (Municipality / Tenant) *
                </label>
                <select
                  value={editingUser.tenantId || 'panchpokhari'}
                  onChange={(e) => setEditingUser({ ...editingUser, tenantId: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    backgroundColor: '#ffffff',
                  }}
                >
                  <option value="panchpokhari">पाँचपोखरी थाङपाल गाउँपालिका</option>
                  <option value="helambu">हेलम्बु गाउँपालिका</option>
                  <option value="melamchi">मेलम्ची नगरपालिका</option>
                  {tenants
                    .filter((t) => !['panchpokhari', 'helambu', 'melamchi'].includes(t.id))
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nameNp}
                      </option>
                    ))}
                  <option value="all">केन्द्रीय प्रशासन (All Tenants / Super Admin)</option>
                </select>
                <small style={{ display: 'block', marginTop: '3px', fontSize: '0.72rem', color: '#64748b' }}>
                  यो प्रयोगकर्ता कुन पालिकाको डेटाबेसमा सिमित रहनेछ भन्ने निर्धारण गर्नुहोस्
                </small>
              </div>

              {/* Role Selection */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  तोकिने भूमिका (Role Assignment) *
                </label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    backgroundColor: '#ffffff',
                  }}
                >
                  {ROLE_DEFINITIONS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
                <div
                  style={{
                    marginTop: '6px',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    backgroundColor: getRoleInfo(editingUser.role).bg,
                    border: `1px solid ${getRoleInfo(editingUser.role).border}`,
                    color: getRoleInfo(editingUser.role).color,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  }}
                >
                  {getRoleInfo(editingUser.role).desc}
                </div>
              </div>

              {/* Ward Number (if Ward User) */}
              {editingUser.role === 'ward_user' && (
                <div style={{ backgroundColor: '#f0fdf4', padding: '10px 14px', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#15803d', marginBottom: '4px' }}>
                    वडा नम्बर (Ward Number) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={32}
                    value={editingUser.wardNumber || 1}
                    onChange={(e) => setEditingUser({ ...editingUser, wardNumber: parseInt(e.target.value) || 1 })}
                    style={{
                      width: '100%',
                      padding: '7px 10px',
                      borderRadius: '6px',
                      border: '1px solid #86efac',
                      fontSize: '0.88rem',
                    }}
                  />
                </div>
              )}

              {/* Status Toggle */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  खाता स्थिति (Account Status)
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600, color: '#059669' }}>
                    <input
                      type="radio"
                      name="status"
                      checked={editingUser.status === 'active'}
                      onChange={() => setEditingUser({ ...editingUser, status: 'active' })}
                    />
                    सक्रिय (Active)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600, color: '#dc2626' }}>
                    <input
                      type="radio"
                      name="status"
                      checked={editingUser.status === 'inactive'}
                      onChange={() => setEditingUser({ ...editingUser, status: 'inactive' })}
                    />
                    निष्क्रिय (Disabled)
                  </label>
                </div>
              </div>

              {/* Reset / Change Password Field */}
              <div style={{ backgroundColor: '#fffbeb', padding: '12px 14px', borderRadius: '10px', border: '1px solid #fde68a' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#92400e', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Key size={14} />
                    <span>पासवर्ड रिसेट गर्नुहोस् (Reset / Change Password)</span>
                  </label>
                  <span style={{ fontSize: '0.7rem', color: '#b45309', fontWeight: 600 }}>ऐच्छिक (खाली छोडे पुरानै रहनेछ)</span>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showEditPassword ? 'text' : 'password'}
                    placeholder="नयाँ पासवर्ड राख्नुहोस् (परिवर्तन नगर्ने भए खाली छोड्नुहोस्)"
                    value={editUserPassword}
                    onChange={(e) => setEditUserPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 36px 8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #fcd34d',
                      fontSize: '0.88rem',
                      backgroundColor: '#ffffff',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPassword(!showEditPassword)}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#92400e',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    title={showEditPassword ? 'पासवर्ड लुकाउनुहोस्' : 'पासवर्ड देखाउनुहोस्'}
                  >
                    {showEditPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <small style={{ display: 'block', marginTop: '3px', fontSize: '0.72rem', color: '#78350f' }}>
                  यस प्रयोगकर्ताको लगइन पासवर्ड बदल्न चाहेमा मात्र यहाँ नयाँ पासवर्ड लेख्नुहोस् (कम्तीमा ६ अक्षर)।
                </small>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#475569',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                  }}
                >
                  रद्द गर्नुहोस्
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 20px',
                    borderRadius: '8px',
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
                  }}
                >
                  भूमिका अद्यावधिक गर्नुहोस्
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminPage;
