import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, apiClient } from '../../api/client';
import {
  Users,
  Search,
  Plus,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  X,
  CheckCircle,
  Building,
  FileText,
  Upload,
  Trash2,
  Shield,
  MapPin,
  Send,
  FileCheck,
  Download,
  Info,
  Edit,
  Camera,
  LayoutGrid,
  Table as TableIcon,
  BadgeCheck,
  RefreshCw,
} from 'lucide-react';
import { branchesApi, Branch } from '../../api/branches';
import { ROLE_DEFINITIONS } from '../super-admin/SuperAdminPage';

export interface EmployeeDocument {
  id: string;
  title: string;
  type: string; // appointment_letter, ramana_patra, citizenship, academic, tor, training, property_return, other
  fileName: string;
  fileUrl: string;
  fileSize?: string;
  uploadedAtBs?: string;
  remarks?: string;
}

export interface Employee {
  id: string;
  employeeId: string;
  fullName: string;
  department: string;
  designation: string;
  employmentType: string;
  contactPhone: string;
  email: string;
  joinDateBs: string;
  status: string;
  photoUrl?: string;
  isDepartmentHead?: boolean;
  isInformationOfficer?: boolean;
  isGrievanceOfficer?: boolean;

  // Personal Details
  citizenshipNo?: string;
  nationalIdNo?: string;
  dobBs?: string;
  gender?: string;
  bloodGroup?: string;
  permanentAddress?: string;
  temporaryAddress?: string;
  emergencyContact?: string;

  // Service & Post
  levelGrade?: string;
  serviceGroup?: string;
  branchCode?: string;

  // TOR
  employeeTor?: string;
  branchTor?: string;

  // Appointment
  appointmentDateBs?: string;
  appointmentLetterUrl?: string;
  appointmentLetterName?: string;

  // Transfer & Ramana
  serviceStatus?: string;
  transferTargetType?: string;
  transferTargetProvince?: string;
  transferTargetDistrict?: string;
  transferTargetPalika?: string;
  transferDateBs?: string;
  transferDecisionNo?: string;
  ramanaDateBs?: string;
  ramanaLetterUrl?: string;
  ramanaLetterName?: string;

  // Documents
  documents?: EmployeeDocument[];
}

const PROVINCES_LIST = [
  'बागमती प्रदेश',
  'कोशी प्रदेश',
  'मधेश प्रदेश',
  'गण्डकी प्रदेश',
  'लुम्बिनी प्रदेश',
  'कर्णाली प्रदेश',
  'सुदूरपश्चिम प्रदेश',
];

const POPULAR_PALIKAS = [
  'मेलम्ची नगरपालिका',
  'हेलम्बु गाउँपालिका',
  'इन्द्रावती गाउँपालिका',
  'चौतारा साँगाचोकगढी नगरपालिका',
  'बलेफी गाउँपालिका',
  'बाह्रबिसे नगरपालिका',
  'भोटेकोशी गाउँपालिका',
  'त्रिपुरासुन्दरी गाउँपालिका',
  'जुगल गाउँपालिका',
  'लिसंखु पाखर गाउँपालिका',
  'सुनकोशी गाउँपालिका',
  'काठमाडौं महानगरपालिका',
  'ललितपुर महानगरपालिका',
  'भक्तपुर नगरपालिका',
  'पोखरा महानगरपालिका',
  'भरतपुर महानगरपालिका',
  'धुलिखेल नगरपालिका',
  'बनेपा नगरपालिका',
];

const COMMON_DESIGNATIONS = [
  'प्रमुख प्रशासकीय अधिकृत',
  'योजना शाखा प्रमुख',
  'प्रशासन शाखा प्रमुख',
  'लेखा अधिकृत / आ.प्र. प्रमुख',
  'इन्जिनियर (सिभिल)',
  'सव-इन्जिनियर',
  'शिक्षा अधिकृत',
  'स्वास्थ्य संयोजक',
  'अहेव (HA / AHW)',
  'स्टाफ नर्स / अनमी',
  'कृषि विकास अधिकृत',
  'पशु सेवा प्राविधिक',
  'कम्प्युटर अपरेटर',
  'सहायक कम्प्युटर अपरेटर',
  'वडा सचिव',
  'कार्यालय सहयोगी',
];

const INITIAL_FORM_STATE = {
  fullName: '',
  department: 'प्रशासन तथा आन्तरिक व्यवस्थापन शाखा',
  branchCode: 'ADMIN',
  designation: '',
  levelGrade: 'अधिकृत छैटौं',
  serviceGroup: 'नेपाल प्रशासन सेवा / सामान्य प्रशासन',
  employmentType: 'स्थायी (Permanent)',
  contactPhone: '',
  email: '',
  photoUrl: '',
  citizenshipNo: '',
  nationalIdNo: '',
  dobBs: '',
  gender: 'पुरुष',
  bloodGroup: 'A+',
  permanentAddress: '',
  temporaryAddress: '',
  emergencyContact: '',
  isDepartmentHead: false,
  isInformationOfficer: false,
  isGrievanceOfficer: false,
  employeeTor: '',
  branchTor: '',
  appointmentDateBs: '',
  joinDateBs: '',
  appointmentLetterUrl: '',
  appointmentLetterName: '',
  serviceStatus: 'कार्यरत (Active)',
  transferTargetType: 'स्थानीय तह / पालिका',
  transferTargetProvince: 'बागमती प्रदेश',
  transferTargetDistrict: 'सिन्धुपाल्चोक',
  transferTargetPalika: '',
  transferDateBs: '',
  transferDecisionNo: '',
  ramanaDateBs: '',
  ramanaLetterUrl: '',
  ramanaLetterName: '',
  documents: [] as EmployeeDocument[],
};

export const EmployeeManagementPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modal State
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'personal' | 'service_tor' | 'appointment_transfer' | 'documents'>('personal');
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSyncStaff = async () => {
    if (!confirm('पालिकाको आधिकारिक वेबसाइट (old.panchpokharithangpalmun.gov.np/staff) बाट कर्मचारी विवरण सिङ्क गर्न चाहनुहुन्छ?')) {
      return;
    }
    setIsSyncing(true);
    try {
      const res = await api.post<any>('/employees/sync-from-old-portal', {});
      alert(res.message || 'कर्मचारी विवरण सफलतापूर्वक सिङ्क भयो!');
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    } catch (e: any) {
      alert(e.message || 'सिङ्क गर्दा समस्या आयो।');
    } finally {
      setIsSyncing(false);
    }
  };

  // Photo state
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Role Assignment Modal
  const [showRoleModal, setShowRoleModal] = useState<{ open: boolean; employee: Employee | null }>({ open: false, employee: null });
  const [selectedRole, setSelectedRole] = useState('health_officer');

  // Form Data State
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);

  // New Document Input State for Tab 4
  const [newDoc, setNewDoc] = useState({
    title: '',
    type: 'appointment_letter',
    fileName: '',
    fileUrl: '',
    fileSize: '',
    uploadedAtBs: '',
    remarks: '',
  });

  // Fetch Employees
  const { data: employees = [], isLoading } = useQuery<Employee[]>({
    queryKey: ['employees'],
    queryFn: async () => api.get<Employee[]>('/employees'),
  });

  // Fetch Branches for dynamic branch selection and TOR auto-population
  const { data: branches = [] } = useQuery<Branch[]>({
    queryKey: ['branches'],
    queryFn: () => branchesApi.getAll(),
  });

  // Branch change handler
  const handleBranchChange = (branchName: string) => {
    const foundBranch = branches.find(b => b.name === branchName || b.code === branchName);
    const code = (foundBranch && foundBranch.code) ? foundBranch.code : '';
    let torText = formData.branchTor;

    if (foundBranch && foundBranch.rolesAndResponsibilities && foundBranch.rolesAndResponsibilities.length > 0) {
      torText = foundBranch.rolesAndResponsibilities.map((r, i) => `${i + 1}. ${r}`).join('\n');
    }

    setFormData(prev => ({
      ...prev,
      department: branchName,
      branchCode: code || '',
      branchTor: torText,
    }));
  };

  // Open modal for Create
  const handleOpenCreate = () => {
    setEditingEmployeeId(null);
    setPhotoPreview(null);
    setPhotoFile(null);
    const adminBranch = branches.find(b => b.code === 'ADMIN');
    const adminTor = adminBranch?.rolesAndResponsibilities?.map((r, i) => `${i + 1}. ${r}`).join('\n') || '';

    setFormData({
      ...INITIAL_FORM_STATE,
      branchTor: adminTor,
    });
    setActiveTab('personal');
    setShowFormModal(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (emp: Employee) => {
    setEditingEmployeeId(emp.id);
    setPhotoPreview(emp.photoUrl || null);
    setPhotoFile(null);
    setFormData({
      fullName: emp.fullName || '',
      department: emp.department || 'प्रशासन तथा आन्तरिक व्यवस्थापन शाखा',
      branchCode: emp.branchCode || '',
      designation: emp.designation || '',
      levelGrade: emp.levelGrade || 'अधिकृत छैटौं',
      serviceGroup: emp.serviceGroup || 'नेपाल प्रशासन सेवा / सामान्य प्रशासन',
      employmentType: emp.employmentType || 'स्थायी (Permanent)',
      contactPhone: emp.contactPhone || '',
      email: emp.email || '',
      photoUrl: emp.photoUrl || '',
      citizenshipNo: emp.citizenshipNo || '',
      nationalIdNo: emp.nationalIdNo || '',
      dobBs: emp.dobBs || '',
      gender: emp.gender || 'पुरुष',
      bloodGroup: emp.bloodGroup || 'A+',
      permanentAddress: emp.permanentAddress || '',
      temporaryAddress: emp.temporaryAddress || '',
      emergencyContact: emp.emergencyContact || '',
      isDepartmentHead: !!emp.isDepartmentHead,
      isInformationOfficer: !!emp.isInformationOfficer,
      isGrievanceOfficer: !!emp.isGrievanceOfficer,
      employeeTor: emp.employeeTor || '',
      branchTor: emp.branchTor || '',
      appointmentDateBs: emp.appointmentDateBs || '',
      joinDateBs: emp.joinDateBs || '',
      appointmentLetterUrl: emp.appointmentLetterUrl || '',
      appointmentLetterName: emp.appointmentLetterName || '',
      serviceStatus: emp.serviceStatus || 'कार्यरत (Active)',
      transferTargetType: emp.transferTargetType || 'स्थानीय तह / पालिका',
      transferTargetProvince: emp.transferTargetProvince || 'बागमती प्रदेश',
      transferTargetDistrict: emp.transferTargetDistrict || 'सिन्धुपाल्चोक',
      transferTargetPalika: emp.transferTargetPalika || '',
      transferDateBs: emp.transferDateBs || '',
      transferDecisionNo: emp.transferDecisionNo || '',
      ramanaDateBs: emp.ramanaDateBs || '',
      ramanaLetterUrl: emp.ramanaLetterUrl || '',
      ramanaLetterName: emp.ramanaLetterName || '',
      documents: emp.documents || [],
    });
    setActiveTab('personal');
    setShowFormModal(true);
  };

  // Photo change handler
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  // Save Mutation (Create or Update)
  const saveMutation = useMutation({
    mutationFn: async (dataToSave: any) => {
      let savedEmp: any;
      if (editingEmployeeId) {
        savedEmp = await api.put(`/employees/${editingEmployeeId}`, dataToSave);
      } else {
        savedEmp = await api.post('/employees', dataToSave);
      }
      const empId = savedEmp?.id || editingEmployeeId;
      if (photoFile && empId) {
        setUploadingPhoto(true);
        const fd = new FormData();
        fd.append('file', photoFile);
        await apiClient.post(`/employees/${empId}/upload-photo`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setUploadingPhoto(false);
      }
      return savedEmp;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setShowFormModal(false);
      setPhotoFile(null);
      setPhotoPreview(null);
      alert(editingEmployeeId ? 'कर्मचारीको विवरण सफलतापूर्वक अद्यावधिक गरियो!' : 'नयाँ कर्मचारी सफलतापूर्वक दर्ता भयो!');
    },
    onError: (err: any) => {
      setUploadingPhoto(false);
      alert(err.response?.data?.message || err.response?.data?.detail || 'सुरक्षित गर्न असफल भयो।');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim()) {
      alert('कृपया कर्मचारीको पूरा नाम प्रविष्ट गर्नुहोस्!');
      setActiveTab('personal');
      return;
    }
    if (!formData.designation.trim()) {
      alert('कृपया पद (Designation) प्रविष्ट गर्नुहोस्!');
      setActiveTab('service_tor');
      return;
    }
    saveMutation.mutate(formData);
  };

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/employees/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      alert('कर्मचारी विवरण हटाइयो।');
    }
  });

  const handleDelete = (id: string) => {
    if (window.confirm('के तपाईं यो कर्मचारीको सम्पूर्ण अभिलेख हटाउन निश्चित हुनुहुन्छ?')) {
      deleteMutation.mutate(id);
    }
  };

  // Role Mutation
  const assignRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) => api.put(`/employees/${id}/role`, { role }),
    onSuccess: (data: any) => {
      alert(data.message || 'भूमिका सफलतापूर्वक प्रदान गरियो');
      setShowRoleModal({ open: false, employee: null });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'भूमिका प्रदान गर्न असफल। प्रयोगकर्ता खाता लिङ्क भएको पुष्टि गर्नुहोस्।');
    },
  });

  // Handle Document Upload simulation (FileReader)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, targetField: 'appointment' | 'ramana' | 'doc') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fakeSize = `${(file.size / (1024 * 1024)).toFixed(2)} MB`;
    const reader = new FileReader();

    reader.onload = () => {
      const dataUrl = reader.result as string;
      if (targetField === 'appointment') {
        setFormData(prev => ({
          ...prev,
          appointmentLetterUrl: dataUrl,
          appointmentLetterName: file.name,
        }));
      } else if (targetField === 'ramana') {
        setFormData(prev => ({
          ...prev,
          ramanaLetterUrl: dataUrl,
          ramanaLetterName: file.name,
        }));
      } else if (targetField === 'doc') {
        setNewDoc(prev => ({
          ...prev,
          fileName: file.name,
          fileUrl: dataUrl,
          fileSize: fakeSize,
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Add Document to list
  const handleAddDocument = () => {
    if (!newDoc.title.trim()) {
      alert('कृपया कागजातको शीर्षक लेख्नुहोस्!');
      return;
    }
    const docItem: EmployeeDocument = {
      id: `doc-${Date.now()}`,
      title: newDoc.title,
      type: newDoc.type,
      fileName: newDoc.fileName || `${newDoc.title}.pdf`,
      fileUrl: newDoc.fileUrl || '#',
      fileSize: newDoc.fileSize || '1.0 MB',
      uploadedAtBs: newDoc.uploadedAtBs || '२०८१/०५/२२',
      remarks: newDoc.remarks || '',
    };

    setFormData(prev => ({
      ...prev,
      documents: [...(prev.documents || []), docItem],
    }));

    setNewDoc({
      title: '',
      type: 'academic',
      fileName: '',
      fileUrl: '',
      fileSize: '',
      uploadedAtBs: '',
      remarks: '',
    });
  };

  const handleRemoveDocument = (docId: string) => {
    setFormData(prev => ({
      ...prev,
      documents: (prev.documents || []).filter(d => d.id !== docId),
    }));
  };

  // Filtered employees
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      (emp.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.employeeId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.designation || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.citizenshipNo || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = departmentFilter === 'all' || emp.department === departmentFilter;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'transferred' && (emp.serviceStatus || '').includes('सरुवा')) ||
      (statusFilter === 'active' && !(emp.serviceStatus || '').includes('सरुवा'));
    return matchesSearch && matchesDept && matchesStatus;
  });

  const allDepts = Array.from(new Set([
    ...branches.map(b => b.name),
    ...employees.map(e => e.department),
  ])).filter(Boolean);

  const getServiceStatusBadge = (emp: Employee) => {
    const s = emp.serviceStatus || 'कार्यरत (Active)';
    if (s.includes('सरुवा')) {
      return {
        bg: '#fef2f2',
        text: '#dc2626',
        border: '#fecaca',
        label: `सरुवा भएको (${emp.transferTargetPalika || 'अन्य निकाय'})`,
        icon: <Send size={13} color="#dc2626" />,
      };
    }
    if (s.includes('काज')) {
      return {
        bg: '#eff6ff',
        text: '#2563eb',
        border: '#bfdbfe',
        label: 'काजमा',
        icon: <Building size={13} color="#2563eb" />,
      };
    }
    return {
      bg: '#f0fdf4',
      text: '#16a34a',
      border: '#bbf7d0',
      label: 'कार्यरत (Active)',
      icon: <CheckCircle size={13} color="#16a34a" />,
    };
  };

  const getPhotoSrc = (url?: string) => {
    if (!url) return null;
    return url;
  };

  const isBusy = saveMutation.isPending || uploadingPhoto;

  return (
    <div style={{ width: '100%', boxSizing: 'border-box', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.35rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: '#eff6ff', width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #bfdbfe' }}>
              <Users size={26} color="#0284c7" />
            </div>
            कर्मचारी अभिलेख तथा व्यक्तिगत विवरण (HRMS)
          </h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: '0.95rem' }}>
            कर्मचारीको व्यक्तिगत विवरण, व्यक्तिगत TOR, शाखाको TOR, नियुक्ति/रमना पत्र तथा कागजात व्यवस्थापन।
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={handleSyncStaff}
            disabled={isSyncing}
            style={{
              padding: '0.8rem 1.3rem',
              background: '#ffffff',
              color: '#0284c7',
              borderRadius: '10px',
              border: '1.5px solid #0284c7',
              fontWeight: 700,
              fontSize: '0.92rem',
              cursor: isSyncing ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
              transition: 'all 0.2s',
            }}
            title="पालिकाको पुरानो आधिकारिक पोर्टल (old.panchpokharithangpalmun.gov.np) बाट ३५ कर्मचारी सिङ्क गर्नुहोस्"
          >
            <RefreshCw size={17} className={isSyncing ? 'animate-spin' : ''} />
            {isSyncing ? 'सिङ्क हुँदैछ...' : 'वेबसाइटबाट कर्मचारी सिङ्क'}
          </button>

          <button
            onClick={handleOpenCreate}
            style={{
              padding: '0.8rem 1.6rem',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#fff',
              borderRadius: '10px',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)',
              transition: 'all 0.2s',
            }}
          >
            <Plus size={20} /> नयाँ कर्मचारी दर्ता फारम
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div style={{ background: '#fff', padding: '1.4rem', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.03)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#0284c7' }} />
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>जम्मा कर्मचारी संख्या</div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#0f172a', marginTop: '0.35rem' }}>{employees.length} <span style={{ fontSize: '1rem', fontWeight: 600, color: '#64748b' }}>जना</span></div>
        </div>

        <div style={{ background: '#fff', padding: '1.4rem', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.03)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#16a34a' }} />
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#16a34a' }}>कार्यरत कर्मचारी</div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#16a34a', marginTop: '0.35rem' }}>
            {employees.filter(e => !(e.serviceStatus || '').includes('सरुवा')).length} <span style={{ fontSize: '1rem', fontWeight: 600, color: '#16a34a' }}>जना</span>
          </div>
        </div>

        <div style={{ background: '#fff', padding: '1.4rem', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.03)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#dc2626' }} />
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#dc2626' }}>सरुवा / रमना भएका</div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#dc2626', marginTop: '0.35rem' }}>
            {employees.filter(e => (e.serviceStatus || '').includes('सरुवा')).length} <span style={{ fontSize: '1rem', fontWeight: 600, color: '#dc2626' }}>जना</span>
          </div>
        </div>

        <div style={{ background: '#fff', padding: '1.4rem', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.03)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#8b5cf6' }} />
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#8b5cf6' }}>शाखा प्रमुखहरू (Dept Heads)</div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#8b5cf6', marginTop: '0.35rem' }}>
            {employees.filter(e => e.isDepartmentHead).length} <span style={{ fontSize: '1rem', fontWeight: 600, color: '#8b5cf6' }}>जना</span>
          </div>
        </div>
      </div>

      {/* Filters & View Switcher Bar */}
      <div style={{ background: '#fff', padding: '1.1rem 1.4rem', borderRadius: '14px', border: '1px solid #e2e8f0', marginBottom: '1.75rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', gap: '1rem', flex: '1 1 500px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 260px', position: 'relative' }}>
            <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="नाम, पद, नागरिकता वा कर्मचारी संकेत नं. खोज्नुहोस्..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '0.7rem 1rem 0.7rem 2.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.92rem', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            style={{ padding: '0.7rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.92rem', outline: 'none', background: '#fff', fontWeight: 600, color: '#334155' }}
          >
            <option value="all">सबै शाखाहरू ({allDepts.length})</option>
            {allDepts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '0.7rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.92rem', outline: 'none', background: '#fff', fontWeight: 600, color: '#334155' }}
          >
            <option value="all">सबै सेवा स्थिति</option>
            <option value="active">कार्यरत मात्र</option>
            <option value="transferred">सरुवा भएका मात्र</option>
          </select>
        </div>

        {/* View Mode Switcher */}
        <div style={{ display: 'flex', background: '#f1f5f9', padding: '3px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <button
            onClick={() => setViewMode('grid')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5rem 0.85rem',
              borderRadius: '6px',
              border: 'none',
              background: viewMode === 'grid' ? '#fff' : 'transparent',
              color: viewMode === 'grid' ? '#0284c7' : '#64748b',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: viewMode === 'grid' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            <LayoutGrid size={16} /> कार्ड
          </button>
          <button
            onClick={() => setViewMode('table')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5rem 0.85rem',
              borderRadius: '6px',
              border: 'none',
              background: viewMode === 'table' ? '#fff' : 'transparent',
              color: viewMode === 'table' ? '#0284c7' : '#64748b',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: viewMode === 'table' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            <TableIcon size={16} /> तालिका
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>कर्मचारी विवरण लोड हुँदैछ...</div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div style={{ backgroundColor: '#fff', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              <tr>
                <th style={{ padding: '0.9rem 1rem', fontWeight: 700, color: '#334155', width: '70px', textAlign: 'center' }}>फोटो</th>
                <th style={{ padding: '0.9rem 1rem', fontWeight: 700, color: '#334155' }}>संकेत नं.</th>
                <th style={{ padding: '0.9rem 1rem', fontWeight: 700, color: '#334155' }}>नाम थर</th>
                <th style={{ padding: '0.9rem 1rem', fontWeight: 700, color: '#334155' }}>पद तथा तह</th>
                <th style={{ padding: '0.9rem 1rem', fontWeight: 700, color: '#334155' }}>शाखा / महाशाखा</th>
                <th style={{ padding: '0.9rem 1rem', fontWeight: 700, color: '#334155' }}>सम्पर्क नम्बर</th>
                <th style={{ padding: '0.9rem 1rem', fontWeight: 700, color: '#334155' }}>अवस्था</th>
                <th style={{ padding: '0.9rem 1rem', fontWeight: 700, color: '#334155', textAlign: 'right' }}>कार्य</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((emp) => {
                const photoSrc = getPhotoSrc(emp.photoUrl);
                const badge = getServiceStatusBadge(emp);

                return (
                  <tr key={emp.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.15s' }}>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      {photoSrc ? (
                        <img
                          src={photoSrc}
                          alt={emp.fullName}
                          style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #e2e8f0' }}
                        />
                      ) : (
                        <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.15rem', fontWeight: 700, color: '#0284c7', margin: '0 auto', border: '2px solid #bae6fd' }}>
                          {emp.fullName?.trim().charAt(0) || 'क'}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>
                      <span style={{ background: '#f1f5f9', padding: '3px 8px', borderRadius: '6px' }}>{emp.employeeId}</span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#0f172a' }}>
                      {emp.fullName}
                      {emp.isDepartmentHead && (
                        <span style={{ marginLeft: '6px', fontSize: '0.7rem', background: '#ede9fe', color: '#6d28d9', padding: '2px 6px', borderRadius: '10px' }}>शाखा प्रमुख</span>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ fontWeight: 600, color: '#0284c7', fontSize: '0.9rem' }}>{emp.designation}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{emp.levelGrade || '—'}</div>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#334155', fontSize: '0.88rem' }}>{emp.department}</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#475569', fontSize: '0.88rem' }}>{emp.contactPhone || '—'}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '3px 9px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 700, background: badge.bg, color: badge.text, border: `1px solid ${badge.border}` }}>
                        {badge.icon} {badge.label}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      <button
                        title="सम्पादन गर्नुहोस्"
                        onClick={() => handleOpenEdit(emp)}
                        style={{ background: '#f0f9ff', border: '1px solid #bae6fd', cursor: 'pointer', color: '#0284c7', padding: '6px 10px', borderRadius: '6px', marginRight: '0.4rem', fontWeight: 600, fontSize: '0.8rem' }}
                      >
                        <Edit size={14} style={{ display: 'inline', marginRight: '4px' }} /> सम्पादन
                      </button>
                      <button
                        title="हटाउनुहोस्"
                        onClick={() => handleDelete(emp.id)}
                        style={{ background: '#fef2f2', border: '1px solid #fecaca', cursor: 'pointer', color: '#ef4444', padding: '6px 8px', borderRadius: '6px' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>कुनै कर्मचारी विवरण भेटिएन।</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* GRID CARDS VIEW */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
          {filteredEmployees.map((emp) => {
            const badge = getServiceStatusBadge(emp);
            const docCount = emp.documents?.length || 0;
            const photoSrc = getPhotoSrc(emp.photoUrl);

            return (
              <div
                key={emp.id}
                style={{
                  background: '#fff',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  overflow: 'hidden',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                }}
              >
                {/* Top header */}
                <div style={{ padding: '1.25rem 1.4rem', borderBottom: '1px solid #f1f5f9', background: '#fafbfc', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: '0.9rem', alignItems: 'center' }}>
                    {photoSrc ? (
                      <img
                        src={photoSrc}
                        alt={emp.fullName}
                        style={{
                          width: '54px',
                          height: '54px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '2px solid #e2e8f0',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '54px',
                          height: '54px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#0284c7',
                          fontSize: '1.4rem',
                          fontWeight: 800,
                          border: '2px solid #bae6fd',
                        }}
                      >
                        {emp.fullName?.trim().charAt(0) || 'क'}
                      </div>
                    )}
                    <div>
                      <h3 style={{ margin: '0 0 0.2rem 0', fontSize: '1.12rem', fontWeight: 800, color: '#0f172a' }}>
                        {emp.fullName}
                      </h3>
                      <div style={{ fontSize: '0.85rem', color: '#0284c7', fontWeight: 700 }}>
                        {emp.designation} {emp.levelGrade && `• ${emp.levelGrade}`}
                      </div>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 8px', borderRadius: '8px', background: '#f1f5f9', color: '#475569' }}>
                    {emp.employeeId}
                  </span>
                </div>

                {/* Status & Badges */}
                <div style={{ padding: '0.75rem 1.4rem', background: '#fff', display: 'flex', flexWrap: 'wrap', gap: '0.4rem', borderBottom: '1px solid #f8fafc' }}>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '3px 10px',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      background: badge.bg,
                      color: badge.text,
                      border: `1px solid ${badge.border}`,
                    }}
                  >
                    {badge.icon} {badge.label}
                  </div>
                  {emp.isDepartmentHead && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '3px 9px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700, background: '#ede9fe', color: '#6d28d9' }}>
                      <BadgeCheck size={13} /> शाखा प्रमुख
                    </div>
                  )}
                  {emp.isInformationOfficer && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '3px 9px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700, background: '#eff6ff', color: '#1d4ed8' }}>
                      📢 सूचना अधिकारी
                    </div>
                  )}
                  {emp.isGrievanceOfficer && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '3px 9px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700, background: '#fef3c7', color: '#b45309' }}>
                      🛡️ गुनासो अधिकारी
                    </div>
                  )}
                </div>

                {/* Body Info */}
                <div style={{ padding: '1.1rem 1.4rem', display: 'flex', flexDirection: 'column', gap: '0.65rem', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.88rem', color: '#334155' }}>
                    <Building size={16} color="#64748b" />
                    <strong>शाखा:</strong> <span style={{ color: '#0f172a' }}>{emp.department}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.88rem', color: '#334155' }}>
                    <Phone size={16} color="#64748b" />
                    <strong>सम्पर्क:</strong> <span>{emp.contactPhone || 'उपलब्ध छैन'}</span>
                  </div>
                  {emp.citizenshipNo && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: '#475569' }}>
                      <Shield size={16} color="#64748b" />
                      <strong>नागरिकता:</strong> {emp.citizenshipNo}
                    </div>
                  )}
                  {emp.appointmentDateBs && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: '#475569' }}>
                      <Calendar size={16} color="#64748b" />
                      <strong>नियुक्ति मिति:</strong> {emp.appointmentDateBs}
                    </div>
                  )}
                  {docCount > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#0284c7', background: '#f0f9ff', padding: '4px 10px', borderRadius: '6px', width: 'fit-content' }}>
                      <FileCheck size={14} /> <strong>कागजातहरू:</strong> {docCount} वटा सुरक्षित
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div style={{ background: '#f8fafc', padding: '0.85rem 1.4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9' }}>
                  <button
                    onClick={() => handleOpenEdit(emp)}
                    style={{
                      background: '#fff',
                      border: '1px solid #cbd5e1',
                      padding: '0.45rem 1rem',
                      borderRadius: '8px',
                      color: '#0f172a',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    }}
                  >
                    <Edit size={14} color="#0284c7" /> सम्पादन
                  </button>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => setShowRoleModal({ open: true, employee: emp })}
                      style={{ background: 'none', border: 'none', color: '#0284c7', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
                    >
                      भूमिका
                    </button>
                    <button
                      onClick={() => handleDelete(emp.id)}
                      style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', padding: '2px 6px' }}
                    >
                      हटाउनुहोस्
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {filteredEmployees.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', background: '#fff', borderRadius: '16px', border: '1px dashed #cbd5e1', color: '#64748b' }}>
              कुनै कर्मचारी भेटिएन।
            </div>
          )}
        </div>
      )}

      {/* REDESIGNED SLEEK MULTI-TAB EMPLOYEE MODAL */}
      {showFormModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '920px',
              maxHeight: '92vh',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.35)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              border: '1px solid #e2e8f0',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '1.25rem 1.8rem',
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                color: '#fff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Users size={24} />
                  {editingEmployeeId ? 'कर्मचारी विवरण तथा सम्पादन' : 'नयाँ कर्मचारी दर्ता फारम'}
                </h2>
                <div style={{ fontSize: '0.84rem', color: '#e0f2fe', marginTop: '0.2rem' }}>
                  व्यक्तिगत विवरण, व्यक्तिगत TOR, शाखाको TOR, नियुक्ति पत्र, रमना पत्र तथा सरुवा व्यवस्थापन
                </div>
              </div>
              <button
                onClick={() => setShowFormModal(false)}
                style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', transition: 'all 0.15s' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Redesigned 4-Column Step Navigation Tabs (Never wraps awkwardly) */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                background: '#f8fafc',
                borderBottom: '2px solid #e2e8f0',
                padding: '0.5rem',
                gap: '0.4rem',
              }}
            >
              <button
                type="button"
                onClick={() => setActiveTab('personal')}
                style={{
                  padding: '0.75rem 0.5rem',
                  border: 'none',
                  borderRadius: '10px',
                  background: activeTab === 'personal' ? '#fff' : 'transparent',
                  color: activeTab === 'personal' ? '#0284c7' : '#64748b',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.25rem',
                  transition: 'all 0.2s',
                  boxShadow: activeTab === 'personal' ? '0 2px 8px rgba(2, 132, 199, 0.15)' : 'none',
                  borderBottom: activeTab === 'personal' ? '3px solid #0284c7' : '3px solid transparent',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.88rem', fontWeight: activeTab === 'personal' ? 800 : 600 }}>
                  <Users size={16} color={activeTab === 'personal' ? '#0284c7' : '#64748b'} />
                  <span>१. व्यक्तिगत विवरण</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('service_tor')}
                style={{
                  padding: '0.75rem 0.5rem',
                  border: 'none',
                  borderRadius: '10px',
                  background: activeTab === 'service_tor' ? '#fff' : 'transparent',
                  color: activeTab === 'service_tor' ? '#0284c7' : '#64748b',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.25rem',
                  transition: 'all 0.2s',
                  boxShadow: activeTab === 'service_tor' ? '0 2px 8px rgba(2, 132, 199, 0.15)' : 'none',
                  borderBottom: activeTab === 'service_tor' ? '3px solid #0284c7' : '3px solid transparent',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.88rem', fontWeight: activeTab === 'service_tor' ? 800 : 600 }}>
                  <Briefcase size={16} color={activeTab === 'service_tor' ? '#0284c7' : '#64748b'} />
                  <span>२. पद, सेवा तथा TOR</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('appointment_transfer')}
                style={{
                  padding: '0.75rem 0.5rem',
                  border: 'none',
                  borderRadius: '10px',
                  background: activeTab === 'appointment_transfer' ? '#fff' : 'transparent',
                  color: activeTab === 'appointment_transfer' ? '#0284c7' : '#64748b',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.25rem',
                  transition: 'all 0.2s',
                  boxShadow: activeTab === 'appointment_transfer' ? '0 2px 8px rgba(2, 132, 199, 0.15)' : 'none',
                  borderBottom: activeTab === 'appointment_transfer' ? '3px solid #0284c7' : '3px solid transparent',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.88rem', fontWeight: activeTab === 'appointment_transfer' ? 800 : 600 }}>
                  <Send size={16} color={activeTab === 'appointment_transfer' ? '#0284c7' : '#64748b'} />
                  <span>३. नियुक्ति र सरुवा</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('documents')}
                style={{
                  padding: '0.75rem 0.5rem',
                  border: 'none',
                  borderRadius: '10px',
                  background: activeTab === 'documents' ? '#fff' : 'transparent',
                  color: activeTab === 'documents' ? '#0284c7' : '#64748b',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.25rem',
                  transition: 'all 0.2s',
                  boxShadow: activeTab === 'documents' ? '0 2px 8px rgba(2, 132, 199, 0.15)' : 'none',
                  borderBottom: activeTab === 'documents' ? '3px solid #0284c7' : '3px solid transparent',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.88rem', fontWeight: activeTab === 'documents' ? 800 : 600 }}>
                  <FileText size={16} color={activeTab === 'documents' ? '#0284c7' : '#64748b'} />
                  <span>४. कागजातहरू ({formData.documents?.length || 0})</span>
                </div>
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSubmit} style={{ overflowY: 'auto', padding: '1.75rem 2rem', flex: 1, backgroundColor: '#ffffff' }}>
              {/* TAB 1: PERSONAL DETAILS */}
              {activeTab === 'personal' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {/* Photo Upload Circle */}
                  <div style={{ textAlign: 'center', marginBottom: '0.5rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
                    <div
                      onClick={() => photoInputRef.current?.click()}
                      style={{
                        width: '108px',
                        height: '108px',
                        borderRadius: '50%',
                        border: '2px dashed #0284c7',
                        margin: '0 auto',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        overflow: 'hidden',
                        backgroundColor: '#f0f9ff',
                        position: 'relative',
                        boxShadow: '0 4px 10px rgba(2, 132, 199, 0.12)',
                        transition: 'all 0.2s',
                      }}
                    >
                      {photoPreview ? (
                        <img
                          src={getPhotoSrc(photoPreview) || photoPreview}
                          alt="preview"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <>
                          <Camera size={30} color="#0284c7" />
                          <span style={{ fontSize: '0.72rem', color: '#0284c7', marginTop: '4px', fontWeight: 600 }}>फोटो छान्नुहोस्</span>
                        </>
                      )}
                    </div>
                    <input ref={photoInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoSelect} />
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.4rem' }}>
                      कर्मचारीको पासपोर्ट साइज फोटो (JPG, PNG, WebP)
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.1rem' }}>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                        पूरा नाम (Full Name) *
                      </label>
                      <input
                        required
                        type="text"
                        placeholder="उदाहरण: राम बहादुर थापा"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', backgroundColor: '#ffffff', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                        नागरिकता नम्बर (Citizenship No.)
                      </label>
                      <input
                        type="text"
                        placeholder="२७-०१-७०-०१२३४"
                        value={formData.citizenshipNo}
                        onChange={(e) => setFormData({ ...formData, citizenshipNo: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                        राष्ट्रिय परिचयपत्र नम्बर (National ID / NID)
                      </label>
                      <input
                        type="text"
                        placeholder="NID-123456789"
                        value={formData.nationalIdNo}
                        onChange={(e) => setFormData({ ...formData, nationalIdNo: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                        जन्म मिति (Date of Birth B.S.)
                      </label>
                      <input
                        type="text"
                        placeholder="YYYY/MM/DD (उदाहरण: २०४५/०३/१०)"
                        value={formData.dobBs}
                        onChange={(e) => setFormData({ ...formData, dobBs: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                          लिङ्ग (Gender)
                        </label>
                        <select
                          value={formData.gender}
                          onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                          style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', backgroundColor: '#ffffff', boxSizing: 'border-box' }}
                        >
                          <option value="पुरुष">पुरुष (Male)</option>
                          <option value="महिला">महिला (Female)</option>
                          <option value="अन्य">अन्य (Other)</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                          रक्त समूह (Blood Group)
                        </label>
                        <select
                          value={formData.bloodGroup}
                          onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                          style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', backgroundColor: '#ffffff', boxSizing: 'border-box' }}
                        >
                          <option value="A+">A+</option>
                          <option value="A-">A-</option>
                          <option value="B+">B+</option>
                          <option value="B-">B-</option>
                          <option value="AB+">AB+</option>
                          <option value="AB-">AB-</option>
                          <option value="O+">O+</option>
                          <option value="O-">O-</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                        मोबाइल / सम्पर्क फोन
                      </label>
                      <input
                        type="text"
                        placeholder="९८४१०००००१"
                        value={formData.contactPhone}
                        onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                        इमेल ठेगाना
                      </label>
                      <input
                        type="email"
                        placeholder="employee@panchpokhari.gov.np"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                        स्थायी ठेगाना (Permanent Address)
                      </label>
                      <input
                        type="text"
                        placeholder="प्रदेश, जिल्ला, पालिका, वडा नं., टोल (उदाहरण: पाँचपोखरी थाङपाल गाउँपालिका - ६, सिन्धुपाल्चोक)"
                        value={formData.permanentAddress}
                        onChange={(e) => setFormData({ ...formData, permanentAddress: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                        हालको / अस्थायी ठेगाना (Temporary Address)
                      </label>
                      <input
                        type="text"
                        placeholder="हाल बसोबास गरिरहेको स्थान वा ठेगाना"
                        value={formData.temporaryAddress}
                        onChange={(e) => setFormData({ ...formData, temporaryAddress: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                        आपतकालीन सम्पर्क व्यक्ति र फोन (Emergency Contact)
                      </label>
                      <input
                        type="text"
                        placeholder="नाम, नाता र फोन नम्बर (उदाहरण: हरिकला थापा (श्रीमती) - ९८४१०९९८८१)"
                        value={formData.emergencyContact}
                        onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: SERVICE, POST & TOR (TERMS OF REFERENCE) */}
              {activeTab === 'service_tor' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.1rem' }}>
                  <div style={{ gridColumn: '1 / -1', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '0.85rem 1.25rem', fontSize: '0.85rem', color: '#1e40af' }}>
                    <Info size={16} style={{ display: 'inline', marginRight: '6px' }} />
                    शाखा/महाशाखा छनोट गर्दा सो शाखाका आधिकारिक कानुनी काम, कर्तव्य र अधिकार (शाखाको TOR) तल स्वचालित रूपमा लोड हुनेछ।
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                      शाखा / महाशाखा / वडा कार्यालय *
                    </label>
                    <select
                      value={formData.department}
                      onChange={(e) => handleBranchChange(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', backgroundColor: '#ffffff', boxSizing: 'border-box' }}
                    >
                      {branches.map((b) => (
                        <option key={b.id} value={b.name}>
                          {b.name} ({b.type === 'ward' ? `वडा नं. ${b.wardNumber}` : 'पालिका शाखा'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                      पद (Designation) * <span style={{ fontWeight: 400, color: '#64748b' }}>(छान्नुहोस् वा लेख्नुहोस्)</span>
                    </label>
                    <input
                      list="designationList"
                      required
                      type="text"
                      placeholder="उदाहरण: शाखा अधिकृत / इन्जिनियर / अहेव"
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', backgroundColor: '#ffffff', boxSizing: 'border-box' }}
                    />
                    <datalist id="designationList">
                      {COMMON_DESIGNATIONS.map(d => (
                        <option key={d} value={d} />
                      ))}
                    </datalist>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                      तह / श्रेणी (Level / Grade)
                    </label>
                    <select
                      value={formData.levelGrade}
                      onChange={(e) => setFormData({ ...formData, levelGrade: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', backgroundColor: '#ffffff', boxSizing: 'border-box' }}
                    >
                      <option value="अधिकृत नवौं (9th Level)">अधिकृत नवौं (9th Level)</option>
                      <option value="अधिकृत आठौं (8th Level)">अधिकृत आठौं (8th Level)</option>
                      <option value="अधिकृत सातौं (7th Level)">अधिकृत सातौं (7th Level)</option>
                      <option value="अधिकृत छैटौं (6th Level)">अधिकृत छैटौं (6th Level)</option>
                      <option value="सहायक पाँचौं (5th Level)">सहायक पाँचौं (5th Level)</option>
                      <option value="सहायक चौथो (4th Level)">सहायक चौथो (4th Level)</option>
                      <option value="श्रेणीविहीन (Non-Graded)">श्रेणीविहीन (Non-Graded)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                      सेवा / समूह (Service & Group)
                    </label>
                    <input
                      type="text"
                      placeholder="उदाहरण: नेपाल प्रशासन सेवा / सामान्य प्रशासन"
                      value={formData.serviceGroup}
                      onChange={(e) => setFormData({ ...formData, serviceGroup: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                      रोजगारीको प्रकार (Employment Type) *
                    </label>
                    <select
                      value={formData.employmentType}
                      onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', backgroundColor: '#ffffff', boxSizing: 'border-box' }}
                    >
                      <option value="स्थायी (Permanent)">स्थायी (Permanent)</option>
                      <option value="अस्थायी (Temporary)">अस्थायी (Temporary)</option>
                      <option value="करार (Contract)">करार (Contract)</option>
                      <option value="ज्यालादारी (Wage/Daily)">ज्यालादारी (Wage/Daily)</option>
                    </select>
                  </div>

                  {/* Special Designations Checkboxes */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input
                        type="checkbox"
                        id="isHead"
                        checked={formData.isDepartmentHead}
                        onChange={(e) => setFormData({ ...formData, isDepartmentHead: e.target.checked })}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                      <label htmlFor="isHead" style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', cursor: 'pointer' }}>
                        यो कर्मचारी शाखा प्रमुख (Department Head) हो
                      </label>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input
                        type="checkbox"
                        id="isRti"
                        checked={formData.isInformationOfficer}
                        onChange={(e) => setFormData({ ...formData, isInformationOfficer: e.target.checked })}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                      <label htmlFor="isRti" style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0284c7', cursor: 'pointer' }}>
                        📢 सूचना अधिकारी (Information Officer) तोकिएको
                      </label>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input
                        type="checkbox"
                        id="isGrievance"
                        checked={formData.isGrievanceOfficer}
                        onChange={(e) => setFormData({ ...formData, isGrievanceOfficer: e.target.checked })}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                      <label htmlFor="isGrievance" style={{ fontSize: '0.88rem', fontWeight: 700, color: '#b45309', cursor: 'pointer' }}>
                        🛡️ गुनासो सुन्ने अधिकारी (Grievance Officer) तोकिएको
                      </label>
                    </div>
                  </div>

                  {/* Employee Individual TOR */}
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 800, color: '#1e3a8a', marginBottom: '0.4rem' }}>
                      📝 कर्मचारीको व्यक्तिगत TOR (Individual Job Description / Terms of Reference)
                    </label>
                    <textarea
                      rows={3}
                      placeholder={`१. सम्बन्धित फाँटको दैनिक सेवा प्रवाह र कार्यसम्पादन गर्ने।\n२. सम्बन्धित विषयगत तथ्याङ्क तथा प्रतिवेदन तयार गर्ने।\n३. शाखा प्रमुखले दिएका अन्य प्रशासनिक निर्देशनहरू पालना गर्ने।`}
                      value={formData.employeeTor}
                      onChange={(e) => setFormData({ ...formData, employeeTor: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', lineHeight: '1.5', boxSizing: 'border-box' }}
                    />
                  </div>

                  {/* Branch Official TOR */}
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 800, color: '#0f766e', marginBottom: '0.4rem' }}>
                      🏛️ शाखाको TOR (Branch Responsibilities / काम, कर्तव्य र अधिकार)
                    </label>
                    <textarea
                      rows={3}
                      value={formData.branchTor}
                      onChange={(e) => setFormData({ ...formData, branchTor: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', lineHeight: '1.5', background: '#f8fafc', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: APPOINTMENT, TRANSFER & RAMANA */}
              {activeTab === 'appointment_transfer' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.1rem' }}>
                  <div style={{ gridColumn: '1 / -1', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '0.3rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Calendar size={18} color="#0284c7" /> नियुक्ति तथा पदस्थापन विवरण
                    </h3>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                      नियुक्ति मिति (Appointment Date B.S.)
                    </label>
                    <input
                      type="text"
                      placeholder="YYYY/MM/DD (उदाहरण: २०७५/०१/१२)"
                      value={formData.appointmentDateBs}
                      onChange={(e) => setFormData({ ...formData, appointmentDateBs: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                      हाजिर / पदस्थापन मिति (Joining Date B.S.)
                    </label>
                    <input
                      type="text"
                      placeholder="YYYY/MM/DD (उदाहरण: २०७५/०२/१५)"
                      value={formData.joinDateBs}
                      onChange={(e) => setFormData({ ...formData, joinDateBs: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box' }}
                    />
                  </div>

                  {/* Appointment Letter Attachment */}
                  <div style={{ gridColumn: '1 / -1', background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px dashed #cbd5e1' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.4rem' }}>
                      📄 नियुक्ति पत्र (Appointment Letter) अपलोड / फाइल छनोट
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.docx"
                        onChange={(e) => handleFileUpload(e, 'appointment')}
                        style={{ fontSize: '0.85rem' }}
                      />
                      {formData.appointmentLetterName && (
                        <div style={{ fontSize: '0.85rem', color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <CheckCircle size={14} /> {formData.appointmentLetterName}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Transfer / Deputation / Relieving (Ramana) Section */}
                  <div style={{ gridColumn: '1 / -1', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginTop: '1rem', marginBottom: '0.3rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Send size={18} color="#b91c1c" /> सेवा स्थिति, सरुवा तथा रमना विवरण
                    </h3>
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                      वर्तमान सेवा स्थिति (Current Service Status) *
                    </label>
                    <select
                      value={formData.serviceStatus}
                      onChange={(e) => setFormData({ ...formData, serviceStatus: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', background: '#fff', fontWeight: 700, boxSizing: 'border-box' }}
                    >
                      <option value="कार्यरत (Active)">कार्यरत (Active - हाल यसै पालिकामा सेवारत)</option>
                      <option value="सरुवा भएको (Transferred)">सरुवा भएको (Transferred - अन्य पालिका/निकायमा सरुवा)</option>
                      <option value="काजमा (On Deputation)">काजमा (On Deputation - अन्य कार्यालयमा काज)</option>
                      <option value="अध्ययन विदा (Study Leave)">अध्ययन विदा (Study Leave)</option>
                      <option value="अवकाश प्राप्त (Retired)">अवकाश प्राप्त (Retired)</option>
                      <option value="राजीनामा स्वीकृत (Resigned)">राजीनामा स्वीकृत (Resigned)</option>
                    </select>
                  </div>

                  {/* Transfer Details Panel */}
                  {(formData.serviceStatus?.includes('सरुवा') || formData.serviceStatus?.includes('काज')) && (
                    <div
                      style={{
                        gridColumn: '1 / -1',
                        background: '#fff1f2',
                        border: '1.5px solid #fecdd3',
                        borderRadius: '12px',
                        padding: '1.25rem',
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '1rem',
                      }}
                    >
                      <div style={{ gridColumn: '1 / -1', fontSize: '0.95rem', fontWeight: 800, color: '#9f1239', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <MapPin size={18} /> सरुवा / काज भएको निकाय तथा पालिका छनोट विवरण
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#881337', marginBottom: '0.4rem' }}>
                          सरुवा भएको निकायको प्रकार *
                        </label>
                        <select
                          value={formData.transferTargetType}
                          onChange={(e) => setFormData({ ...formData, transferTargetType: e.target.value })}
                          style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #f43f5e', fontSize: '0.9rem', background: '#fff', boxSizing: 'border-box' }}
                        >
                          <option value="स्थानीय तह / पालिका">स्थानीय तह / गाउँपालिका / नगरपालिका</option>
                          <option value="संघीय मन्त्रालय / विभाग">संघीय मन्त्रालय / विभाग / निकाय</option>
                          <option value="प्रदेश मन्त्रालय / निर्देशनालय">प्रदेश मन्त्रालय / निर्देशनालय</option>
                          <option value="अन्य सरकारी निकाय">अन्य सरकारी निकाय</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#881337', marginBottom: '0.4rem' }}>
                          प्रदेश
                        </label>
                        <select
                          value={formData.transferTargetProvince}
                          onChange={(e) => setFormData({ ...formData, transferTargetProvince: e.target.value })}
                          style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #f43f5e', fontSize: '0.9rem', background: '#fff', boxSizing: 'border-box' }}
                        >
                          {PROVINCES_LIST.map((p) => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#881337', marginBottom: '0.4rem' }}>
                          जिल्ला (District)
                        </label>
                        <input
                          type="text"
                          placeholder="उदाहरण: सिन्धुपाल्चोक, काठमाडौं, काभ्रे"
                          value={formData.transferTargetDistrict}
                          onChange={(e) => setFormData({ ...formData, transferTargetDistrict: e.target.value })}
                          style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #f43f5e', fontSize: '0.9rem', boxSizing: 'border-box' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#881337', marginBottom: '0.4rem' }}>
                          सरुवा भएको पालिकाको नाम *
                        </label>
                        <input
                          list="palikas-datalist"
                          type="text"
                          placeholder="पालिका चयन गर्नुहोस् वा लेख्नुहोस्..."
                          value={formData.transferTargetPalika}
                          onChange={(e) => setFormData({ ...formData, transferTargetPalika: e.target.value })}
                          style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #f43f5e', fontSize: '0.95rem', fontWeight: 600, boxSizing: 'border-box' }}
                        />
                        <datalist id="palikas-datalist">
                          {POPULAR_PALIKAS.map((pal) => (
                            <option key={pal} value={pal} />
                          ))}
                        </datalist>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#881337', marginBottom: '0.4rem' }}>
                          सरुवा निर्णय / चलानी नम्बर
                        </label>
                        <input
                          type="text"
                          placeholder="म.वि./नि.नं.-४५२/२०८१"
                          value={formData.transferDecisionNo}
                          onChange={(e) => setFormData({ ...formData, transferDecisionNo: e.target.value })}
                          style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #f43f5e', fontSize: '0.9rem', boxSizing: 'border-box' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#881337', marginBottom: '0.4rem' }}>
                          सरुवा भएको मिति (Transfer Date B.S.)
                        </label>
                        <input
                          type="text"
                          placeholder="YYYY/MM/DD (२०८१/०४/१५)"
                          value={formData.transferDateBs}
                          onChange={(e) => setFormData({ ...formData, transferDateBs: e.target.value })}
                          style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #f43f5e', fontSize: '0.9rem', boxSizing: 'border-box' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#881337', marginBottom: '0.4rem' }}>
                          रमना भएको मिति (Ramana Date B.S.)
                        </label>
                        <input
                          type="text"
                          placeholder="YYYY/MM/DD (२०८१/०४/२२)"
                          value={formData.ramanaDateBs}
                          onChange={(e) => setFormData({ ...formData, ramanaDateBs: e.target.value })}
                          style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #f43f5e', fontSize: '0.9rem', boxSizing: 'border-box' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#881337', marginBottom: '0.4rem' }}>
                          📜 रमना पत्र (Relieving Letter)
                        </label>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileUpload(e, 'ramana')}
                          style={{ fontSize: '0.85rem' }}
                        />
                        {formData.ramanaLetterName && (
                          <div style={{ fontSize: '0.85rem', color: '#15803d', fontWeight: 700, marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <CheckCircle size={14} /> {formData.ramanaLetterName}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: COMPREHENSIVE DOCUMENTS MANAGEMENT */}
              {activeTab === 'documents' && (
                <div>
                  <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #cbd5e1', marginBottom: '1.5rem' }}>
                    <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Upload size={18} color="#0284c7" /> नयाँ कागजात थप्नुहोस् (Add New Document)
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '1rem', alignItems: 'flex-end' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                          कागजातको शीर्षक *
                        </label>
                        <input
                          type="text"
                          placeholder="उदाहरण: शैक्षिक प्रमाणपत्र / नागरिकता / TOR"
                          value={newDoc.title}
                          onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })}
                          style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', boxSizing: 'border-box' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                          कागजात प्रकार
                        </label>
                        <select
                          value={newDoc.type}
                          onChange={(e) => setNewDoc({ ...newDoc, type: e.target.value })}
                          style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', background: '#fff', boxSizing: 'border-box' }}
                        >
                          <option value="appointment_letter">नियुक्ति पत्र (Appointment Letter)</option>
                          <option value="ramana_patra">रमना पत्र (Ramana Patra)</option>
                          <option value="citizenship">नागरिकता प्रमाणपत्र (Citizenship)</option>
                          <option value="academic">शैक्षिक योग्यता (Academic)</option>
                          <option value="tor">कार्यसम्पादन सम्झौता (TOR)</option>
                          <option value="training">तालिम प्रमाणपत्र (Training)</option>
                          <option value="property_return">सम्पत्ति विवरण (Property Return)</option>
                          <option value="other">अन्य सरकारी कागजात (Other)</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                          फाइल छनोट (PDF/Image/Doc)
                        </label>
                        <input
                          type="file"
                          onChange={(e) => handleFileUpload(e, 'doc')}
                          style={{ fontSize: '0.82rem', width: '100%' }}
                        />
                      </div>

                      <div style={{ gridColumn: '1 / 3' }}>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                          कैफियत / टिप्पणी
                        </label>
                        <input
                          type="text"
                          placeholder="कागजात सम्बन्धी संक्षिप्त कैफियत"
                          value={newDoc.remarks}
                          onChange={(e) => setNewDoc({ ...newDoc, remarks: e.target.value })}
                          style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', boxSizing: 'border-box' }}
                        />
                      </div>

                      <div>
                        <button
                          type="button"
                          onClick={handleAddDocument}
                          style={{
                            width: '100%',
                            padding: '0.7rem',
                            background: '#0284c7',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: 700,
                            fontSize: '0.88rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.4rem',
                          }}
                        >
                          <Plus size={16} /> कागजात थप्नुहोस्
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Documents List */}
                  <div>
                    <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                      कर्मचारीका सुरक्षित कागजातहरूको सूची ({formData.documents?.length || 0})
                    </h4>
                    {formData.documents && formData.documents.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {formData.documents.map((doc, idx) => (
                          <div
                            key={doc.id || idx}
                            style={{
                              background: '#fff',
                              border: '1px solid #e2e8f0',
                              borderRadius: '10px',
                              padding: '0.85rem 1.25rem',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                              <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}>
                                <FileText size={20} />
                              </div>
                              <div>
                                <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0f172a' }}>
                                  {doc.title}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', gap: '0.75rem', marginTop: '2px' }}>
                                  <span>फाइल: {doc.fileName}</span>
                                  {doc.fileSize && <span>आकार: {doc.fileSize}</span>}
                                </div>
                                {doc.remarks && (
                                  <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '2px', fontStyle: 'italic' }}>
                                    कैफियत: {doc.remarks}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <a
                                href={doc.fileUrl}
                                download={doc.fileName}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  padding: '0.4rem 0.8rem',
                                  background: '#f1f5f9',
                                  color: '#0284c7',
                                  borderRadius: '6px',
                                  textDecoration: 'none',
                                  fontSize: '0.8rem',
                                  fontWeight: 700,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.3rem',
                                }}
                              >
                                <Download size={14} /> डाउनलोड
                              </a>
                              <button
                                type="button"
                                onClick={() => handleRemoveDocument(doc.id)}
                                style={{
                                  padding: '0.4rem 0.6rem',
                                  background: '#fef2f2',
                                  color: '#dc2626',
                                  border: 'none',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                }}
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '2.5rem', background: '#fafbfc', borderRadius: '12px', border: '1px dashed #cbd5e1', color: '#64748b', fontSize: '0.9rem' }}>
                        कुनै कागजात संलग्न गरिएको छैन। माथिको फारमबाट नियुक्ति पत्र, रमना पत्र वा अन्य प्रमाणपत्र थप्नुहोस्।
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Modal Footer Controls */}
              <div
                style={{
                  marginTop: '1.75rem',
                  paddingTop: '1.25rem',
                  borderTop: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  style={{
                    padding: '0.65rem 1.4rem',
                    background: '#f1f5f9',
                    color: '#475569',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                  }}
                >
                  रद्द गर्नुहोस्
                </button>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  {activeTab !== 'personal' && (
                    <button
                      type="button"
                      onClick={() => {
                        if (activeTab === 'service_tor') setActiveTab('personal');
                        if (activeTab === 'appointment_transfer') setActiveTab('service_tor');
                        if (activeTab === 'documents') setActiveTab('appointment_transfer');
                      }}
                      style={{
                        padding: '0.65rem 1.25rem',
                        background: '#f8fafc',
                        color: '#334155',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                      }}
                    >
                      ← अघिल्लो ट्याब
                    </button>
                  )}

                  {activeTab !== 'documents' ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (activeTab === 'personal') setActiveTab('service_tor');
                        else if (activeTab === 'service_tor') setActiveTab('appointment_transfer');
                        else if (activeTab === 'appointment_transfer') setActiveTab('documents');
                      }}
                      style={{
                        padding: '0.65rem 1.4rem',
                        background: '#0284c7',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                      }}
                    >
                      अर्को ट्याब →
                    </button>
                  ) : null}

                  <button
                    type="submit"
                    disabled={isBusy}
                    style={{
                      padding: '0.65rem 1.6rem',
                      background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 800,
                      fontSize: '0.95rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)',
                      opacity: isBusy ? 0.75 : 1,
                    }}
                  >
                    <CheckCircle size={18} />
                    {uploadingPhoto ? 'फोटो अपलोड...' : isBusy ? 'सुरक्षित गरिँदै...' : editingEmployeeId ? 'परिमार्जन सुरक्षित गर्नुहोस्' : 'कर्मचारी सुरक्षित गर्नुहोस्'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Role Assignment Modal */}
      {showRoleModal.open && showRoleModal.employee && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '420px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>प्रणाली भूमिका प्रदान गर्नुहोस्</h2>
              <button onClick={() => setShowRoleModal({ open: false, employee: null })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#475569' }}>
                तपाईं <strong>{showRoleModal.employee.fullName}</strong> लाई प्रणालीको कुन मुख्य भूमिका दिन चाहनुहुन्छ?
              </p>
              <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '1.25rem', background: '#fff', fontWeight: 600, boxSizing: 'border-box' }}>
                {ROLE_DEFINITIONS.filter(r => r.value !== 'super_admin').map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
              <button
                onClick={() => assignRoleMutation.mutate({ id: showRoleModal.employee!.id, role: selectedRole })}
                disabled={assignRoleMutation.isPending}
                style={{ width: '100%', padding: '0.75rem', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
              >
                {assignRoleMutation.isPending ? 'प्रदान गरिँदै...' : 'भूमिका प्रदान गर्नुहोस्'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
