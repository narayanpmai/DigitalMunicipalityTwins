import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client';
import './it-branch.css';
import {
  Monitor,
  Laptop,
  Printer,
  Server,
  Wifi,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  Search,
  X,
  Cpu,
  Database,
  Globe,
  Lock,
  Unlock,
  TrendingUp,
  DollarSign,
  Users,
  Activity,
  Key,
  Network,
  Camera,
  Zap,
  RefreshCw,
  Eye,
  Trash2,
  Edit2,
  ChevronRight,
  AlertCircle,
  FileText,
  Settings,
  Download,
  Sparkles,
  BarChart2,
  HardDrive,
  Terminal,
  Bug,
  Mail,
  Phone,
  MapPin,
  Star,
  Award,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ITSummary {
  assets: { total: number; active: number; under_repair: number };
  licenses: { total: number; expiring_soon: number };
  tickets: { open: number; in_progress: number; resolved: number; critical: number };
  network: { total_devices: number; online: number; offline: number };
  digital_services: { total: number; active: number; avg_uptime_percent: number };
  cybersecurity: { total_incidents: number; unresolved: number; critical: number };
  budget: { fiscal_year: string; total_allocated: number; total_spent: number; utilization_percent: number };
}

interface ITAsset {
  id: string;
  asset_code: string;
  name: string;
  category: string;
  brand_model?: string;
  serial_number?: string;
  purchase_date_bs?: string;
  purchase_price?: number;
  warranty_expiry_bs?: string;
  assigned_to?: string;
  location?: string;
  status: string;
  condition: string;
  remarks?: string;
}

interface SoftwareLicense {
  id: string;
  software_name: string;
  vendor?: string;
  license_key?: string;
  license_type: string;
  seats: number;
  purchase_date_bs?: string;
  expiry_date_bs?: string;
  annual_cost?: number;
  assigned_to?: string;
  status: string;
  remarks?: string;
}

interface SupportTicket {
  id: string;
  ticket_no: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  raised_by: string;
  raised_department?: string;
  assigned_to?: string;
  status: string;
  resolution_notes?: string;
  created_at_bs?: string;
  resolved_at_bs?: string;
}

interface NetworkDevice {
  id: string;
  device_name: string;
  device_type: string;
  ip_address?: string;
  mac_address?: string;
  location?: string;
  vlan?: string;
  isp_provider?: string;
  bandwidth_mbps?: number;
  status: string;
  last_checked_bs?: string;
  remarks?: string;
}

interface DigitalService {
  id: string;
  service_name: string;
  service_type: string;
  url?: string;
  responsible_officer?: string;
  launch_date_bs?: string;
  status: string;
  uptime_percent?: number;
  monthly_users?: number;
  remarks?: string;
}

interface CyberLog {
  id: string;
  log_type: string;
  severity: string;
  source_ip?: string;
  target_system?: string;
  action_taken?: string;
  detected_at_bs?: string;
  resolved: boolean;
  remarks?: string;
}

interface BudgetItem {
  id: string;
  fiscal_year: string;
  head: string;
  budget_allocated: number;
  budget_spent: number;
  remarks?: string;
}

interface ITStaff {
  id: string;
  name: string;
  designation: string;
  level: string;
  qualifications: string;
  phone: string;
  email: string;
  join_date_bs: string;
  responsibilities: string[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getAssetIcon(category: string, size = 22): React.ReactNode {
  const c = category.toLowerCase();
  if (c.includes('laptop')) return <Laptop size={size} />;
  if (c.includes('printer')) return <Printer size={size} />;
  if (c.includes('server')) return <Server size={size} />;
  if (c.includes('network') || c.includes('router') || c.includes('switch')) return <Network size={size} />;
  if (c.includes('ups')) return <Zap size={size} />;
  if (c.includes('cctv') || c.includes('camera')) return <Camera size={size} />;
  if (c.includes('storage') || c.includes('nas')) return <HardDrive size={size} />;
  return <Monitor size={size} />;
}

function getStatusBadge(status: string) {
  if (status.includes('सक्रिय') || status.includes('Online') || status.includes('Active') || status.includes('समाधान'))
    return <span className="it-badge it-badge-active"><span className="it-pulse" />सक्रिय</span>;
  if (status.includes('मर्मत') || status.includes('Repair'))
    return <span className="it-badge it-badge-repair">मर्मत सुधार</span>;
  if (status.includes('प्रगति') || status.includes('Progress'))
    return <span className="it-badge it-badge-progress">प्रगतिमा</span>;
  if (status.includes('म्याद सकिँदै') || status.includes('Expiring'))
    return <span className="it-badge it-badge-expiring">⚠ म्याद सकिँदै</span>;
  if (status.includes('खुला') || status.includes('Open'))
    return <span className="it-badge it-badge-open">खुला</span>;
  if (status.includes('अफलाइन') || status.includes('Offline'))
    return <span className="it-badge it-badge-critical">● अफलाइन</span>;
  return <span className="it-badge it-badge-info">{status}</span>;
}

function getPriorityClass(priority: string): string {
  if (priority.includes('अत्यावश्यक') || priority.includes('Critical')) return 'it-priority-critical';
  if (priority.includes('उच्च') || priority.includes('High')) return 'it-priority-high';
  if (priority.includes('मध्यम') || priority.includes('Medium')) return 'it-priority-medium';
  return 'it-priority-low';
}

function getSeverityClass(severity: string): string {
  if (severity.includes('अत्यावश्यक') || severity.includes('Critical')) return 'it-sev-critical';
  if (severity.includes('उच्च') || severity.includes('High')) return 'it-sev-high';
  if (severity.includes('मध्यम') || severity.includes('Medium')) return 'it-sev-medium';
  return 'it-sev-low';
}

function formatNPR(val: number | undefined): string {
  if (!val && val !== 0) return '—';
  return `रू ${val.toLocaleString('en-IN')}`;
}

function getNetworkDeviceIcon(type: string, size = 22): React.ReactNode {
  const t = type.toLowerCase();
  if (t.includes('router')) return <Wifi size={size} />;
  if (t.includes('switch')) return <Network size={size} />;
  if (t.includes('firewall')) return <Shield size={size} />;
  if (t.includes('server')) return <Server size={size} />;
  if (t.includes('camera') || t.includes('cctv')) return <Camera size={size} />;
  if (t.includes('nas') || t.includes('storage')) return <HardDrive size={size} />;
  return <Wifi size={size} />;
}

// ─── Main Component ───────────────────────────────────────────────────────────

type TabType = 'overview' | 'assets' | 'licenses' | 'tickets' | 'network' | 'services' | 'cyber' | 'budget' | 'staff';

export const ITBranchPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showModal, setShowModal] = useState<'asset' | 'license' | 'ticket' | 'network' | 'service' | 'cyber' | 'budget' | 'staff' | null>(null);
  const [detailItem, setDetailItem] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [resolveForm, setResolveForm] = useState({ notes: '', resolved_at_bs: '२०८१-०५-१२' });

  // ─── Edit States
  const [editingAsset, setEditingAsset] = useState<ITAsset | null>(null);
  const [showEditAssetModal, setShowEditAssetModal] = useState(false);

  const [editingLicense, setEditingLicense] = useState<SoftwareLicense | null>(null);
  const [showEditLicenseModal, setShowEditLicenseModal] = useState(false);

  const [editingTicket, setEditingTicket] = useState<SupportTicket | null>(null);
  const [showEditTicketModal, setShowEditTicketModal] = useState(false);

  const [editingNetwork, setEditingNetwork] = useState<NetworkDevice | null>(null);
  const [showEditNetworkModal, setShowEditNetworkModal] = useState(false);

  const [editingService, setEditingService] = useState<DigitalService | null>(null);
  const [showEditServiceModal, setShowEditServiceModal] = useState(false);

  const [editingCyber, setEditingCyber] = useState<CyberLog | null>(null);
  const [showEditCyberModal, setShowEditCyberModal] = useState(false);

  const [editingBudget, setEditingBudget] = useState<BudgetItem | null>(null);
  const [showEditBudgetModal, setShowEditBudgetModal] = useState(false);

  const [editingStaff, setEditingStaff] = useState<ITStaff | null>(null);
  const [showEditStaffModal, setShowEditStaffModal] = useState(false);

  // ─── Fetch Summary
  const { data: summary, refetch: refetchSummary } = useQuery<ITSummary>({
    queryKey: ['it-summary'],
    queryFn: async () => {
      const res: any = await api.get('/it-branch/summary');
      return res.data || res;
    },
  });

  // ─── Fetch Assets
  const { data: assets = [], refetch: refetchAssets } = useQuery<ITAsset[]>({
    queryKey: ['it-assets'],
    queryFn: async () => {
      const res: any = await api.get('/it-branch/assets');
      return res.data || res || [];
    },
  });

  // ─── Fetch Licenses
  const { data: licenses = [], refetch: refetchLicenses } = useQuery<SoftwareLicense[]>({
    queryKey: ['it-licenses'],
    queryFn: async () => {
      const res: any = await api.get('/it-branch/licenses');
      return res.data || res || [];
    },
  });

  // ─── Fetch Tickets
  const { data: tickets = [], refetch: refetchTickets } = useQuery<SupportTicket[]>({
    queryKey: ['it-tickets'],
    queryFn: async () => {
      const res: any = await api.get('/it-branch/tickets');
      return res.data || res || [];
    },
  });

  // ─── Fetch Network Devices
  const { data: networkDevices = [], refetch: refetchNetwork } = useQuery<NetworkDevice[]>({
    queryKey: ['it-network'],
    queryFn: async () => {
      const res: any = await api.get('/it-branch/network');
      return res.data || res || [];
    },
  });

  // ─── Fetch Digital Services
  const { data: services = [], refetch: refetchServices } = useQuery<DigitalService[]>({
    queryKey: ['it-services'],
    queryFn: async () => {
      const res: any = await api.get('/it-branch/services');
      return res.data || res || [];
    },
  });

  // ─── Fetch Cyber Logs
  const { data: cyberLogs = [], refetch: refetchCyber } = useQuery<CyberLog[]>({
    queryKey: ['it-cyber-logs'],
    queryFn: async () => {
      const res: any = await api.get('/it-branch/cyber-logs');
      return res.data || res || [];
    },
  });

  // ─── Fetch Budget
  const { data: budgetItems = [], refetch: refetchBudget } = useQuery<BudgetItem[]>({
    queryKey: ['it-budget'],
    queryFn: async () => {
      const res: any = await api.get('/it-branch/budget');
      return res.data || res || [];
    },
  });

  // ─── Fetch Staff
  const { data: staff = [], refetch: refetchStaff } = useQuery<ITStaff[]>({
    queryKey: ['it-staff'],
    queryFn: async () => {
      const res: any = await api.get('/it-branch/staff');
      return res.data || res || [];
    },
  });

  // ─── Forms for New Entities
  const [assetForm, setAssetForm] = useState({
    asset_code: '', name: '', category: 'Computer', brand_model: '', serial_number: '',
    purchase_date_bs: '२०८१-०४-०१', purchase_price: 0, warranty_expiry_bs: '',
    assigned_to: '', location: 'मुख्य कार्यालय', status: 'सक्रिय (Active)',
    condition: 'राम्रो (Good)', remarks: '',
  });

  const [ticketForm, setTicketForm] = useState({
    title: '', description: '', category: 'Hardware', priority: 'मध्यम (Medium)',
    raised_by: '', raised_department: '', assigned_to: 'कृष्ण बहादुर (IT Officer)',
    status: 'खुला (Open)', created_at_bs: '२०८१-०५-१२',
  });

  const [licenseForm, setLicenseForm] = useState({
    software_name: '', vendor: '', license_key: '', license_type: 'Paid', seats: 1,
    purchase_date_bs: '२०८१-०४-०१', expiry_date_bs: '', annual_cost: 0,
    assigned_to: '', status: 'सक्रिय (Active)', remarks: '',
  });

  const [cyberForm, setCyberForm] = useState({
    log_type: 'Firewall Block', severity: 'मध्यम (Medium)', source_ip: '',
    target_system: '', action_taken: '', detected_at_bs: '२०८१-०५-१२', resolved: false, remarks: '',
  });

  const [networkForm, setNetworkForm] = useState({
    device_name: '', device_type: 'Router', ip_address: '', mac_address: '',
    location: 'मुख्य कार्यालय', vlan: 'VLAN1', isp_provider: 'Nepal Telecom Fiber',
    bandwidth_mbps: 100, status: 'अनलाइन (Online)', last_checked_bs: '२०८१-०५-१२', remarks: '',
  });

  const [serviceForm, setServiceForm] = useState({
    service_name: '', service_type: 'Portal', url: '',
    responsible_officer: 'IT शाखा प्रमुख', launch_date_bs: '२०८१-०१-०१',
    status: 'सक्रिय (Active)', uptime_percent: 99.5, monthly_users: 250, remarks: '',
  });

  const [budgetForm, setBudgetForm] = useState({
    fiscal_year: '२०८१/०८२', head: '', budget_allocated: 100000, budget_spent: 0, remarks: '',
  });

  const [staffForm, setStaffForm] = useState({
    name: '', designation: '', level: 'अधिकृत छैठौं (6th)', qualifications: '',
    phone: '', email: '', join_date_bs: '२०८१-०१-०१', responsibilities: '',
  });

  // ─── Asset Mutations
  const createAssetMutation = useMutation({
    mutationFn: (data: any) => api.post('/it-branch/assets', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['it-assets'] });
      queryClient.invalidateQueries({ queryKey: ['it-summary'] });
      setShowModal(null);
      alert('IT उपकरण सफलतापूर्वक दर्ता भयो!');
    },
    onError: (e: any) => alert('दर्ता गर्न सकिएन: ' + (e?.response?.data?.detail || e.message)),
  });

  const updateAssetMutation = useMutation({
    mutationFn: (data: any) => api.put(`/it-branch/assets/${data.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['it-assets'] });
      queryClient.invalidateQueries({ queryKey: ['it-summary'] });
      setShowEditAssetModal(false);
      setEditingAsset(null);
      alert('IT उपकरण विवरण सफलतापूर्वक अद्यावधिक भयो!');
    },
    onError: (e: any) => alert('अद्यावधिक गर्न सकिएन: ' + (e?.response?.data?.detail || e.message)),
  });

  const deleteAssetMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/it-branch/assets/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['it-assets'] });
      queryClient.invalidateQueries({ queryKey: ['it-summary'] });
      alert('IT उपकरण सफलतापूर्वक हटाइयो!');
    },
  });

  // ─── License Mutations
  const createLicenseMutation = useMutation({
    mutationFn: (data: any) => api.post('/it-branch/licenses', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['it-licenses'] });
      queryClient.invalidateQueries({ queryKey: ['it-summary'] });
      setShowModal(null);
      alert('सफ्टवेयर इजाजत सफलतापूर्वक दर्ता भयो!');
    },
    onError: (e: any) => alert('दर्ता गर्न सकिएन: ' + (e?.response?.data?.detail || e.message)),
  });

  const updateLicenseMutation = useMutation({
    mutationFn: (data: any) => api.put(`/it-branch/licenses/${data.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['it-licenses'] });
      queryClient.invalidateQueries({ queryKey: ['it-summary'] });
      setShowEditLicenseModal(false);
      setEditingLicense(null);
      alert('सफ्टवेयर इजाजत सफलतापूर्वक अद्यावधिक भयो!');
    },
    onError: (e: any) => alert('अद्यावधिक गर्न सकिएन: ' + (e?.response?.data?.detail || e.message)),
  });

  const deleteLicenseMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/it-branch/licenses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['it-licenses'] });
      queryClient.invalidateQueries({ queryKey: ['it-summary'] });
      alert('सफ्टवेयर इजाजत सफलतापूर्वक हटाइयो!');
    },
  });

  // ─── Ticket Mutations
  const createTicketMutation = useMutation({
    mutationFn: (data: any) => api.post('/it-branch/tickets', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['it-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['it-summary'] });
      setShowModal(null);
      alert('सहायता अनुरोध (Ticket) सफलतापूर्वक दर्ता भयो!');
    },
    onError: (e: any) => alert('दर्ता गर्न सकिएन: ' + (e?.response?.data?.detail || e.message)),
  });

  const updateTicketMutation = useMutation({
    mutationFn: (data: any) => api.put(`/it-branch/tickets/${data.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['it-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['it-summary'] });
      setShowEditTicketModal(false);
      setEditingTicket(null);
      alert('सहायता अनुरोध विवरण अद्यावधिक भयो!');
    },
    onError: (e: any) => alert('अद्यावधिक गर्न सकिएन: ' + (e?.response?.data?.detail || e.message)),
  });

  const resolveTicketMutation = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: any }) => api.put(`/it-branch/tickets/${id}/resolve`, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['it-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['it-summary'] });
      setShowDetailModal(false);
      alert('समस्या समाधान दर्ता भयो!');
    },
  });

  const deleteTicketMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/it-branch/tickets/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['it-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['it-summary'] });
      alert('टिकेट सफलतापूर्वक हटाइयो!');
    },
  });

  // ─── Network Mutations
  const createNetworkMutation = useMutation({
    mutationFn: (data: any) => api.post('/it-branch/network', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['it-network'] });
      queryClient.invalidateQueries({ queryKey: ['it-summary'] });
      setShowModal(null);
      alert('नेटवर्क उपकरण दर्ता भयो!');
    },
    onError: (e: any) => alert('दर्ता गर्न सकिएन: ' + (e?.response?.data?.detail || e.message)),
  });

  const updateNetworkMutation = useMutation({
    mutationFn: (data: any) => api.put(`/it-branch/network/${data.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['it-network'] });
      queryClient.invalidateQueries({ queryKey: ['it-summary'] });
      setShowEditNetworkModal(false);
      setEditingNetwork(null);
      alert('नेटवर्क उपकरण अद्यावधिक भयो!');
    },
    onError: (e: any) => alert('अद्यावधिक गर्न सकिएन: ' + (e?.response?.data?.detail || e.message)),
  });

  const deleteNetworkMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/it-branch/network/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['it-network'] });
      queryClient.invalidateQueries({ queryKey: ['it-summary'] });
      alert('नेटवर्क उपकरण हटाइयो!');
    },
  });

  // ─── Digital Service Mutations
  const createServiceMutation = useMutation({
    mutationFn: (data: any) => api.post('/it-branch/services', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['it-services'] });
      queryClient.invalidateQueries({ queryKey: ['it-summary'] });
      setShowModal(null);
      alert('डिजिटल सेवा दर्ता भयो!');
    },
    onError: (e: any) => alert('दर्ता गर्न सकिएन: ' + (e?.response?.data?.detail || e.message)),
  });

  const updateServiceMutation = useMutation({
    mutationFn: (data: any) => api.put(`/it-branch/services/${data.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['it-services'] });
      queryClient.invalidateQueries({ queryKey: ['it-summary'] });
      setShowEditServiceModal(false);
      setEditingService(null);
      alert('डिजिटल सेवा अद्यावधिक भयो!');
    },
    onError: (e: any) => alert('अद्यावधिक गर्न सकिएन: ' + (e?.response?.data?.detail || e.message)),
  });

  const deleteServiceMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/it-branch/services/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['it-services'] });
      queryClient.invalidateQueries({ queryKey: ['it-summary'] });
      alert('डिजिटल सेवा हटाइयो!');
    },
  });

  // ─── Cyber Log Mutations
  const createCyberLogMutation = useMutation({
    mutationFn: (data: any) => api.post('/it-branch/cyber-logs', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['it-cyber-logs'] });
      queryClient.invalidateQueries({ queryKey: ['it-summary'] });
      setShowModal(null);
      alert('साइबर घटना लग दर्ता भयो!');
    },
    onError: (e: any) => alert('दर्ता गर्न सकिएन: ' + (e?.response?.data?.detail || e.message)),
  });

  const updateCyberMutation = useMutation({
    mutationFn: (data: any) => api.put(`/it-branch/cyber-logs/${data.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['it-cyber-logs'] });
      queryClient.invalidateQueries({ queryKey: ['it-summary'] });
      setShowEditCyberModal(false);
      setEditingCyber(null);
      alert('साइबर घटना अद्यावधिक भयो!');
    },
    onError: (e: any) => alert('अद्यावधिक गर्न सकिएन: ' + (e?.response?.data?.detail || e.message)),
  });

  const resolveCyberMutation = useMutation({
    mutationFn: (id: string) => api.put(`/it-branch/cyber-logs/${id}/resolve`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['it-cyber-logs'] });
      queryClient.invalidateQueries({ queryKey: ['it-summary'] });
      alert('साइबर घटना समाधान भयो!');
    },
  });

  const deleteCyberMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/it-branch/cyber-logs/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['it-cyber-logs'] });
      queryClient.invalidateQueries({ queryKey: ['it-summary'] });
      alert('साइबर लग हटाइयो!');
    },
  });

  // ─── Budget Mutations
  const createBudgetMutation = useMutation({
    mutationFn: (data: any) => api.post('/it-branch/budget', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['it-budget'] });
      queryClient.invalidateQueries({ queryKey: ['it-summary'] });
      setShowModal(null);
      alert('बजेट शीर्षक सफलतापूर्वक दर्ता भयो!');
    },
    onError: (e: any) => alert('दर्ता गर्न सकिएन: ' + (e?.response?.data?.detail || e.message)),
  });

  const updateBudgetMutation = useMutation({
    mutationFn: (data: any) => api.put(`/it-branch/budget/${data.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['it-budget'] });
      queryClient.invalidateQueries({ queryKey: ['it-summary'] });
      setShowEditBudgetModal(false);
      setEditingBudget(null);
      alert('बजेट शीर्षक अद्यावधिक भयो!');
    },
    onError: (e: any) => alert('अद्यावधिक गर्न सकिएन: ' + (e?.response?.data?.detail || e.message)),
  });

  const deleteBudgetMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/it-branch/budget/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['it-budget'] });
      queryClient.invalidateQueries({ queryKey: ['it-summary'] });
      alert('बजेट शीर्षक हटाइयो!');
    },
  });

  // ─── Staff Mutations
  const createStaffMutation = useMutation({
    mutationFn: (data: any) => api.post('/it-branch/staff', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['it-staff'] });
      setShowModal(null);
      alert('कर्मचारी सफलतापूर्वक दर्ता भयो!');
    },
    onError: (e: any) => alert('दर्ता गर्न सकिएन: ' + (e?.response?.data?.detail || e.message)),
  });

  const updateStaffMutation = useMutation({
    mutationFn: (data: any) => api.put(`/it-branch/staff/${data.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['it-staff'] });
      setShowEditStaffModal(false);
      setEditingStaff(null);
      alert('कर्मचारी विवरण अद्यावधिक भयो!');
    },
    onError: (e: any) => alert('अद्यावधिक गर्न सकिएन: ' + (e?.response?.data?.detail || e.message)),
  });

  const deleteStaffMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/it-branch/staff/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['it-staff'] });
      alert('कर्मचारी हटाइयो!');
    },
  });

  // ─── Filters
  const filteredAssets = assets.filter(a => {
    const q = searchTerm.toLowerCase();
    const matchQ = !q || a.name.toLowerCase().includes(q) || a.asset_code.toLowerCase().includes(q) || (a.assigned_to || '').toLowerCase().includes(q);
    const matchCat = categoryFilter === 'all' || a.category.toLowerCase().includes(categoryFilter.toLowerCase());
    const matchStatus = statusFilter === 'all' || a.status.includes(statusFilter);
    return matchQ && matchCat && matchStatus;
  });

  const filteredTickets = tickets.filter(t => {
    const q = searchTerm.toLowerCase();
    const matchQ = !q || t.title.toLowerCase().includes(q) || t.raised_by.toLowerCase().includes(q) || t.ticket_no.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || t.status.includes(statusFilter);
    const matchPri = priorityFilter === 'all' || t.priority.includes(priorityFilter);
    const matchCat = categoryFilter === 'all' || t.category.toLowerCase().includes(categoryFilter.toLowerCase());
    return matchQ && matchStatus && matchPri && matchCat;
  });

  const filteredLicenses = licenses.filter(l => {
    const q = searchTerm.toLowerCase();
    return !q || l.software_name.toLowerCase().includes(q) || (l.vendor || '').toLowerCase().includes(q);
  });

  // ─── OVERVIEW TAB ─────────────────────────────────────────────────────────────
  const renderOverview = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Quick Stats Row */}
      <div className="it-quick-stats">
        <div className="it-quick-stat">
          <div className="it-quick-stat-num" style={{ color: '#06b6d4' }}>{summary?.assets.total ?? assets.length}</div>
          <div className="it-quick-stat-label">कुल IT उपकरण</div>
        </div>
        <div className="it-quick-stat">
          <div className="it-quick-stat-num" style={{ color: '#10b981' }}>{summary?.tickets.resolved ?? tickets.filter(t => t.status.includes('समाधान')).length}</div>
          <div className="it-quick-stat-label">समाधान भएका टिकेट</div>
        </div>
        <div className="it-quick-stat">
          <div className="it-quick-stat-num" style={{ color: '#6366f1' }}>{summary?.digital_services.avg_uptime_percent ?? 99.0}%</div>
          <div className="it-quick-stat-label">औसत अपटाइम</div>
        </div>
        <div className="it-quick-stat">
          <div className="it-quick-stat-num" style={{ color: '#f59e0b' }}>{summary?.budget.utilization_percent ?? 0}%</div>
          <div className="it-quick-stat-label">बजेट उपयोग</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
        {/* Recent Open Tickets */}
        <div className="it-card">
          <div className="it-card-header">
            <h3 className="it-card-title"><AlertCircle size={18} color="#f59e0b" /> खुला सहायता अनुरोधहरू</h3>
            <button className="it-btn it-btn-ghost it-btn-sm" onClick={() => setActiveTab('tickets')}>सबै हेर्नुहोस् <ChevronRight size={14} /></button>
          </div>
          <div className="it-cyber-list">
            {tickets.filter(t => !t.status.includes('समाधान')).slice(0, 5).map(t => (
              <div key={t.id} className="it-cyber-item">
                <div className={`it-cyber-severity-dot ${getPriorityClass(t.priority).replace('it-priority-', 'it-sev-')}`} style={{ background: t.priority.includes('अत्यावश्यक') ? '#f43f5e' : t.priority.includes('उच्च') ? '#f59e0b' : '#06b6d4' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--it-text)' }}>{t.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--it-text-muted)', marginTop: '0.2rem' }}>
                    {t.ticket_no} · {t.raised_by} · {t.category}
                  </div>
                </div>
                <div>{getStatusBadge(t.status)}</div>
              </div>
            ))}
            {tickets.filter(t => !t.status.includes('समाधान')).length === 0 && (
              <div className="it-empty"><CheckCircle size={36} className="it-empty-icon" /><div className="it-empty-title">कुनै खुला टिकेट छैन</div></div>
            )}
          </div>
        </div>

        {/* Network Status */}
        <div className="it-card">
          <div className="it-card-header">
            <h3 className="it-card-title"><Wifi size={18} color="#06b6d4" /> नेटवर्क उपकरण स्थिति</h3>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span className="it-badge it-badge-active"><span className="it-pulse" /> {summary?.network.online ?? networkDevices.filter(n => n.status.includes('अनलाइन')).length} Online</span>
              {(summary?.network.offline ?? networkDevices.filter(n => n.status.includes('अफलाइन')).length) > 0 && (
                <span className="it-badge it-badge-critical">{summary?.network.offline} Offline</span>
              )}
            </div>
          </div>
          <div style={{ padding: '0.5rem 0' }}>
            {networkDevices.slice(0, 5).map(n => (
              <div key={n.id} className="it-cyber-item">
                <div className={`it-device-icon ${n.status.includes('अफलाइन') ? 'it-device-icon-offline' : 'it-device-icon-online'}`} style={{ width: 36, height: 36, borderRadius: 8 }}>
                  {getNetworkDeviceIcon(n.device_type, 16)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{n.device_name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--it-text-muted)' }}>{n.device_type} · <span className="it-device-ip">{n.ip_address}</span></div>
                </div>
                {getStatusBadge(n.status)}
              </div>
            ))}
          </div>
        </div>

        {/* Cyber Threats */}
        <div className="it-card">
          <div className="it-card-header">
            <h3 className="it-card-title"><Shield size={18} color="#f43f5e" /> साइबर घटनाहरू</h3>
            <button className="it-btn it-btn-ghost it-btn-sm" onClick={() => setActiveTab('cyber')}>सबै हेर्नुहोस् <ChevronRight size={14} /></button>
          </div>
          <div className="it-cyber-list">
            {cyberLogs.slice(0, 5).map(c => (
              <div key={c.id} className="it-cyber-item">
                <div className={`it-cyber-severity-dot ${getSeverityClass(c.severity)}`} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{c.log_type}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--it-text-muted)', marginTop: '0.15rem' }}>{c.target_system || '—'} · {c.detected_at_bs}</div>
                </div>
                {c.resolved
                  ? <span className="it-badge it-badge-active"><CheckCircle size={11} /> समाधान</span>
                  : <span className="it-badge it-badge-critical"><AlertCircle size={11} /> विचाराधीन</span>
                }
              </div>
            ))}
          </div>
        </div>

        {/* Digital Services Uptime */}
        <div className="it-card">
          <div className="it-card-header">
            <h3 className="it-card-title"><Globe size={18} color="#6366f1" /> डिजिटल सेवाहरू — अपटाइम</h3>
            <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 700 }}>⬆ {summary?.digital_services.avg_uptime_percent ?? 99.0}% औसत</span>
          </div>
          <div style={{ padding: '0.75rem 0' }}>
            {services.map(s => {
              const up = s.uptime_percent ?? 99;
              const fillClass = up < 90 ? 'critical' : up < 97 ? 'warn' : '';
              return (
                <div key={s.id} style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.83rem' }}>{s.service_name}</div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: up >= 99 ? '#10b981' : up >= 97 ? '#f59e0b' : '#f43f5e' }}>{up}%</div>
                  </div>
                  <div className="it-uptime-bar-wrap">
                    <div className="it-uptime-bar-bg">
                      <div className={`it-uptime-bar-fill ${fillClass}`} style={{ width: `${up}%` }} />
                    </div>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--it-text-muted)', marginTop: '0.3rem' }}>
                    {s.service_type} · {s.monthly_users?.toLocaleString() ?? '—'} मासिक प्रयोगकर्ता
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Budget Overview */}
        <div className="it-card" style={{ gridColumn: '1 / -1' }}>
          <div className="it-card-header">
            <h3 className="it-card-title"><BarChart2 size={18} color="#06b6d4" /> बजेट खर्च स्थिति — आ.व. {summary?.budget.fiscal_year ?? '२०८१/०८२'}</h3>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.8rem' }}>
              <span>कुल बजेट: <strong style={{ color: '#06b6d4' }}>{formatNPR(summary?.budget.total_allocated)}</strong></span>
              <span>खर्च: <strong style={{ color: '#f59e0b' }}>{formatNPR(summary?.budget.total_spent)}</strong></span>
              <span>उपयोग: <strong style={{ color: '#10b981' }}>{summary?.budget.utilization_percent}%</strong></span>
            </div>
          </div>
          <div>
            {budgetItems.map(b => {
              const pct = b.budget_allocated > 0 ? Math.round((b.budget_spent / b.budget_allocated) * 100) : 0;
              const fillClass = pct > 90 ? 'over-90' : pct > 60 ? 'over-60' : '';
              return (
                <div key={b.id} className="it-budget-item">
                  <div className="it-budget-item-header">
                    <div className="it-budget-head">{b.head}</div>
                    <div className="it-budget-amounts">{formatNPR(b.budget_spent)} / <strong>{formatNPR(b.budget_allocated)}</strong> ({pct}%)</div>
                  </div>
                  <div className="it-budget-bar-bg">
                    <div className={`it-budget-bar-fill ${fillClass}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  // ─── ASSETS TAB ───────────────────────────────────────────────────────────────
  const renderAssets = () => (
    <div>
      <div className="it-section-header">
        <h2 className="it-section-title">
          <HardDrive size={20} color="#06b6d4" /> IT उपकरण भण्डार
          <span className="it-section-count">{filteredAssets.length} उपकरण</span>
        </h2>
        <button className="it-btn it-btn-cyan" onClick={() => setShowModal('asset')}>
          <Plus size={16} /> नयाँ उपकरण दर्ता
        </button>
      </div>
      <div className="it-toolbar">
        <div className="it-toolbar-group">
          <div className="it-search-wrapper">
            <Search size={16} className="it-search-icon" />
            <input id="it-asset-search" className="it-input" placeholder="खोज्नुहोस्: नाम, कोड, प्रयोगकर्ता..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <select id="it-asset-cat" className="it-select" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
            <option value="all">सबै श्रेणी</option>
            <option value="Computer">Computer/Desktop</option>
            <option value="Laptop">Laptop</option>
            <option value="Printer">Printer</option>
            <option value="Server">Server</option>
            <option value="UPS">UPS</option>
            <option value="CCTV">CCTV/Camera</option>
            <option value="Network">Network Device</option>
          </select>
          <select id="it-asset-status" className="it-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">सबै अवस्था</option>
            <option value="सक्रिय">सक्रिय</option>
            <option value="मर्मत">मर्मत सुधार</option>
          </select>
        </div>
        <button className="it-btn it-btn-ghost" onClick={() => { setSearchTerm(''); setStatusFilter('all'); setCategoryFilter('all'); }}>
          <RefreshCw size={15} /> रिसेट
        </button>
      </div>
      <div className="it-grid-2">
        {filteredAssets.map(a => (
          <div key={a.id} className="it-asset-card">
            <div className="it-asset-card-top">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div className="it-asset-icon-box">{getAssetIcon(a.category)}</div>
                <div>
                  <div className="it-asset-code">{a.asset_code}</div>
                  <div style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, marginTop: '0.2rem' }}>{a.category}</div>
                </div>
              </div>
              {getStatusBadge(a.status)}
            </div>
            <div className="it-asset-card-body">
              <h3 className="it-asset-name">{a.name}</h3>
              {a.brand_model && (
                <div className="it-asset-row">
                  <span className="it-asset-row-label">ब्राण्ड:</span>
                  <span className="it-asset-row-val">{a.brand_model}</span>
                </div>
              )}
              <div className="it-asset-row">
                <span className="it-asset-row-label">प्रयोगकर्ता:</span>
                <span className="it-asset-row-val" style={{ color: '#0891b2', fontWeight: 700 }}>{a.assigned_to || '—'}</span>
              </div>
              <div className="it-asset-row">
                <span className="it-asset-row-label">स्थान:</span>
                <span className="it-asset-row-val">{a.location || '—'}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                {a.purchase_price && (
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '0.5rem' }}>
                    <div style={{ fontSize: '0.65rem', color: '#166534', fontWeight: 600 }}>खरिद मूल्य</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#065f46' }}>{formatNPR(a.purchase_price)}</div>
                  </div>
                )}
                {a.warranty_expiry_bs && (
                  <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '0.5rem' }}>
                    <div style={{ fontSize: '0.65rem', color: '#1d4ed8', fontWeight: 600 }}>वारेन्टी</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e40af' }}>{a.warranty_expiry_bs}</div>
                  </div>
                )}
              </div>
              {a.condition && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem' }}>
                  <span style={{ color: 'var(--it-text-muted)', fontWeight: 600 }}>अवस्था:</span>
                  <span className={`it-badge ${a.condition.includes('राम्रो') ? 'it-badge-active' : a.condition.includes('मर्मत') ? 'it-badge-repair' : 'it-badge-warn'}`}>{a.condition}</span>
                </div>
              )}
            </div>
            <div className="it-asset-card-footer">
              <span style={{ fontSize: '0.72rem', color: 'var(--it-text-muted)' }}>क्र.: {a.serial_number || '—'}</span>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button className="it-icon-btn it-icon-btn-view" title="विवरण हेर्नुहोस्" onClick={() => { setDetailItem(a); setShowDetailModal(true); }}><Eye size={14} /></button>
                <button className="it-icon-btn it-icon-btn-edit" title="सम्पादन गर्नुहोस्" onClick={() => { setEditingAsset(a); setShowEditAssetModal(true); }}><Edit2 size={14} /></button>
                <button className="it-icon-btn it-icon-btn-delete" title="हटाउनुहोस्" onClick={() => { if (confirm('यो उपकरण हटाउने?')) deleteAssetMutation.mutate(a.id); }}><Trash2 size={14} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {filteredAssets.length === 0 && (
        <div className="it-empty"><HardDrive size={48} className="it-empty-icon" /><div className="it-empty-title">उपकरण फेला परेन</div><div className="it-empty-desc">खोज वा फिल्टर मिलाउनुहोस्</div></div>
      )}
    </div>
  );

  // ─── LICENSES TAB ─────────────────────────────────────────────────────────────
  const renderLicenses = () => (
    <div>
      <div className="it-section-header">
        <h2 className="it-section-title">
          <Key size={20} color="#818cf8" /> सफ्टवेयर इजाजत व्यवस्थापन
          <span className="it-section-count">{licenses.length}</span>
        </h2>
        <button className="it-btn it-btn-indigo" onClick={() => setShowModal('license')}>
          <Plus size={16} /> नयाँ इजाजत दर्ता
        </button>
      </div>
      <div className="it-toolbar">
        <div className="it-toolbar-group">
          <div className="it-search-wrapper">
            <Search size={16} className="it-search-icon" />
            <input id="it-lic-search" className="it-input" placeholder="सफ्टवेयर / विक्रेता खोज्नुहोस्..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
        </div>
      </div>
      <div className="it-table-card">
        <div className="it-table-responsive">
          <table className="it-table">
            <thead>
              <tr>
                <th>सफ्टवेयर</th>
                <th>विक्रेता</th>
                <th>प्रकार</th>
                <th>Seats</th>
                <th>वार्षिक शुल्क</th>
                <th>म्याद सम्म</th>
                <th>प्रयोगकर्ता</th>
                <th>अवस्था</th>
                <th>कारबाही</th>
              </tr>
            </thead>
            <tbody>
              {filteredLicenses.map(l => (
                <tr key={l.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--it-text)' }}>{l.software_name}</div>
                    {l.license_key && <div style={{ fontFamily: 'monospace', fontSize: '0.68rem', color: 'var(--it-text-muted)' }}>{l.license_key.slice(0, 20)}...</div>}
                  </td>
                  <td style={{ color: 'var(--it-text-muted)' }}>{l.vendor || '—'}</td>
                  <td>
                    <span className={`it-badge ${l.license_type === 'Free/Open Source' ? 'it-badge-free' : 'it-badge-paid'}`}>
                      {l.license_type}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700, color: '#0891b2' }}>{l.seats}</td>
                  <td style={{ fontWeight: 700, color: '#10b981' }}>{l.annual_cost ? formatNPR(l.annual_cost) : 'निःशुल्क'}</td>
                  <td style={{ color: l.expiry_date_bs ? '#f59e0b' : 'var(--it-text-muted)', fontWeight: l.expiry_date_bs ? 700 : 400 }}>
                    {l.expiry_date_bs || 'स्थायी'}
                  </td>
                  <td style={{ fontSize: '0.78rem' }}>{l.assigned_to || '—'}</td>
                  <td>{getStatusBadge(l.status)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.3rem' }}>
                      <button className="it-icon-btn it-icon-btn-view" title="विवरण हेर्नुहोस्" onClick={() => { setDetailItem(l); setShowDetailModal(true); }}><Eye size={13} /></button>
                      <button className="it-icon-btn it-icon-btn-edit" title="सम्पादन गर्नुहोस्" onClick={() => { setEditingLicense(l); setShowEditLicenseModal(true); }}><Edit2 size={13} /></button>
                      <button className="it-icon-btn it-icon-btn-delete" title="हटाउनुहोस्" onClick={() => { if (confirm('यो सफ्टवेयर इजाजत हटाउने?')) deleteLicenseMutation.mutate(l.id); }}><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // ─── TICKETS TAB ──────────────────────────────────────────────────────────────
  const renderTickets = () => (
    <div>
      <div className="it-section-header">
        <h2 className="it-section-title">
          <AlertCircle size={20} color="#f59e0b" /> IT सहायता अनुरोध (Helpdesk)
          <span className="it-section-count">{filteredTickets.length}</span>
        </h2>
        <button className="it-btn it-btn-amber" onClick={() => setShowModal('ticket')}>
          <Plus size={16} /> नयाँ टिकेट खोल्नुहोस्
        </button>
      </div>
      <div className="it-toolbar">
        <div className="it-toolbar-group">
          <div className="it-search-wrapper">
            <Search size={16} className="it-search-icon" />
            <input id="it-tkt-search" className="it-input" placeholder="टिकेट नं, समस्या, व्यक्ति..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <select id="it-tkt-status" className="it-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">सबै अवस्था</option>
            <option value="खुला">खुला (Open)</option>
            <option value="प्रगति">प्रगतिमा</option>
            <option value="समाधान">समाधान भयो</option>
          </select>
          <select id="it-tkt-pri" className="it-select" value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
            <option value="all">सबै प्राथमिकता</option>
            <option value="अत्यावश्यक">अत्यावश्यक (Critical)</option>
            <option value="उच्च">उच्च (High)</option>
            <option value="मध्यम">मध्यम (Medium)</option>
            <option value="न्यून">न्यून (Low)</option>
          </select>
          <select id="it-tkt-cat" className="it-select" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
            <option value="all">सबै श्रेणी</option>
            <option value="Hardware">Hardware</option>
            <option value="Software">Software</option>
            <option value="Network">Network</option>
            <option value="Email">Email</option>
            <option value="CCTV">CCTV</option>
          </select>
        </div>
        <button className="it-btn it-btn-ghost" onClick={() => { setSearchTerm(''); setStatusFilter('all'); setPriorityFilter('all'); setCategoryFilter('all'); }}>
          <RefreshCw size={15} /> रिसेट
        </button>
      </div>
      <div className="it-table-card">
        <div className="it-table-responsive">
          <table className="it-table">
            <thead>
              <tr>
                <th>टिकेट नं</th>
                <th>समस्या विवरण</th>
                <th>श्रेणी</th>
                <th>प्राथमिकता</th>
                <th>उठाउने व्यक्ति</th>
                <th>जिम्मेवार</th>
                <th>दर्ता मिति</th>
                <th>अवस्था</th>
                <th>कारबाही</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map(t => (
                <tr key={t.id}>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#0891b2', background: '#e0f9ff', padding: '0.15rem 0.45rem', borderRadius: 6, fontSize: '0.78rem' }}>
                      {t.ticket_no}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{t.title}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--it-text-muted)', marginTop: '0.15rem' }}>{t.description.slice(0, 60)}...</div>
                  </td>
                  <td>
                    <span className="it-badge it-badge-info">{t.category}</span>
                  </td>
                  <td>
                    <span className={getPriorityClass(t.priority)} style={{ fontWeight: 700, fontSize: '0.8rem' }}>
                      {t.priority.includes('अत्यावश्यक') ? '🔴 अत्यावश्यक' :
                       t.priority.includes('उच्च') ? '🟠 उच्च' :
                       t.priority.includes('मध्यम') ? '🔵 मध्यम' : '⚪ न्यून'}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8rem' }}>
                    <div style={{ fontWeight: 600 }}>{t.raised_by}</div>
                    <div style={{ color: 'var(--it-text-muted)', fontSize: '0.72rem' }}>{t.raised_department}</div>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: '#0891b2', fontWeight: 600 }}>{t.assigned_to || '—'}</td>
                  <td style={{ fontSize: '0.78rem', color: 'var(--it-text-muted)' }}>{t.created_at_bs}</td>
                  <td>{getStatusBadge(t.status)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.3rem' }}>
                      <button className="it-icon-btn it-icon-btn-view" title="विवरण" onClick={() => { setDetailItem(t); setShowDetailModal(true); }}><Eye size={13} /></button>
                      <button className="it-icon-btn it-icon-btn-edit" title="सम्पादन गर्नुहोस्" onClick={() => { setEditingTicket(t); setShowEditTicketModal(true); }}><Edit2 size={13} /></button>
                      {!t.status.includes('समाधान') && (
                        <button className="it-icon-btn it-icon-btn-resolve" title="समाधान गर्नुहोस्" onClick={() => resolveTicketMutation.mutate({ id: t.id, notes: { notes: 'समस्या समाधान गरियो', resolved_at_bs: '२०८१-०५-१२' } })}>
                          <CheckCircle size={13} />
                        </button>
                      )}
                      <button className="it-icon-btn it-icon-btn-delete" title="हटाउनुहोस्" onClick={() => { if (confirm('टिकेट हटाउने?')) deleteTicketMutation.mutate(t.id); }}><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // ─── NETWORK TAB ──────────────────────────────────────────────────────────────
  const renderNetwork = () => (
    <div>
      <div className="it-section-header">
        <h2 className="it-section-title">
          <Network size={20} color="#06b6d4" /> नेटवर्क तथा पूर्वाधार
          <span className="it-section-count">{networkDevices.length} उपकरण</span>
        </h2>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button className="it-btn it-btn-cyan" onClick={() => setShowModal('network')}>
            <Plus size={16} /> नयाँ उपकरण दर्ता
          </button>
          <span className="it-badge it-badge-active" style={{ padding: '0.4rem 0.8rem' }}>✔ {networkDevices.filter(n => n.status.includes('अनलाइन')).length} Online</span>
          <span className="it-badge it-badge-critical" style={{ padding: '0.4rem 0.8rem' }}>✘ {networkDevices.filter(n => n.status.includes('अफलाइन')).length} Offline</span>
        </div>
      </div>
      <div className="it-network-grid">
        {networkDevices.map(n => (
          <div key={n.id} className={`it-network-card ${n.status.includes('अफलाइन') ? 'offline' : ''}`}>
            <div className={`it-device-icon ${n.status.includes('अफलाइन') ? 'it-device-icon-offline' : 'it-device-icon-online'}`}>
              {getNetworkDeviceIcon(n.device_type)}
            </div>
            <div style={{ flex: 1 }}>
              <div className="it-device-name">{n.device_name}</div>
              <div className="it-device-type">{n.device_type}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                {n.ip_address && <div className="it-device-ip">📍 {n.ip_address}</div>}
                {n.bandwidth_mbps && <span style={{ fontSize: '0.72rem', color: 'var(--it-text-muted)', fontWeight: 600 }}>⚡ {n.bandwidth_mbps} Mbps</span>}
                {n.isp_provider && <span style={{ fontSize: '0.72rem', color: '#6366f1', fontWeight: 600 }}>📡 {n.isp_provider}</span>}
              </div>
              {n.location && <div style={{ fontSize: '0.72rem', color: 'var(--it-text-muted)', marginTop: '0.25rem' }}><MapPin size={11} style={{ display: 'inline', marginRight: 3 }} />{n.location}</div>}
              {n.remarks && <div style={{ fontSize: '0.72rem', color: n.status.includes('अफलाइन') ? '#dc2626' : 'var(--it-text-muted)', marginTop: '0.25rem', fontStyle: 'italic' }}>{n.remarks}</div>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between', height: '100%', gap: '0.75rem' }}>
              {getStatusBadge(n.status)}
              <div style={{ display: 'flex', gap: '0.3rem' }}>
                <button className="it-icon-btn it-icon-btn-view" title="विवरण" onClick={() => { setDetailItem(n); setShowDetailModal(true); }}><Eye size={13} /></button>
                <button className="it-icon-btn it-icon-btn-edit" title="सम्पादन" onClick={() => { setEditingNetwork(n); setShowEditNetworkModal(true); }}><Edit2 size={13} /></button>
                <button className="it-icon-btn it-icon-btn-delete" title="हटाउनुहोस्" onClick={() => { if (confirm('यो नेटवर्क उपकरण हटाउने?')) deleteNetworkMutation.mutate(n.id); }}><Trash2 size={13} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ─── SERVICES TAB ─────────────────────────────────────────────────────────────
  const renderServices = () => (
    <div>
      <div className="it-section-header">
        <h2 className="it-section-title">
          <Globe size={20} color="#6366f1" /> डिजिटल सेवाहरू तथा पोर्टलहरू
          <span className="it-section-count">{services.length} सेवा</span>
        </h2>
        <button className="it-btn it-btn-indigo" onClick={() => setShowModal('service')}>
          <Plus size={16} /> नयाँ डिजिटल सेवा दर्ता
        </button>
      </div>
      <div className="it-services-grid">
        {services.map(s => {
          const up = s.uptime_percent ?? 99;
          const fillClass = up < 90 ? 'critical' : up < 97 ? 'warn' : '';
          return (
            <div key={s.id} className="it-service-card">
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.75rem' }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '0.25rem' }}>{s.service_name}</div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span className="it-badge it-badge-info">{s.service_type}</span>
                    {getStatusBadge(s.status)}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: up >= 99 ? '#10b981' : up >= 97 ? '#f59e0b' : '#f43f5e', lineHeight: 1 }}>{up}%</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--it-text-muted)', fontWeight: 600 }}>UPTIME</div>
                </div>
              </div>
              <div className="it-uptime-bar-wrap">
                <div className="it-uptime-bar-bg">
                  <div className={`it-uptime-bar-fill ${fillClass}`} style={{ width: `${up}%` }} />
                </div>
              </div>
              <div className="it-detail-grid" style={{ marginTop: '0.85rem' }}>
                {s.monthly_users && (
                  <div className="it-detail-item">
                    <div className="it-detail-label">मासिक प्रयोगकर्ता</div>
                    <div className="it-detail-val" style={{ color: '#06b6d4' }}>{s.monthly_users.toLocaleString()}</div>
                  </div>
                )}
                {s.responsible_officer && (
                  <div className="it-detail-item">
                    <div className="it-detail-label">जिम्मेवार अधिकारी</div>
                    <div className="it-detail-val">{s.responsible_officer}</div>
                  </div>
                )}
                {s.launch_date_bs && (
                  <div className="it-detail-item">
                    <div className="it-detail-label">सञ्चालन मिति</div>
                    <div className="it-detail-val">{s.launch_date_bs}</div>
                  </div>
                )}
                {s.url && (
                  <div className="it-detail-item" style={{ gridColumn: '1 / -1' }}>
                    <div className="it-detail-label">URL</div>
                    <div className="it-detail-val" style={{ color: '#6366f1', wordBreak: 'break-all' }}>{s.url}</div>
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9' }}>
                {s.remarks ? <div style={{ fontSize: '0.75rem', color: 'var(--it-text-muted)', fontStyle: 'italic' }}>{s.remarks}</div> : <div />}
                <div style={{ display: 'flex', gap: '0.3rem' }}>
                  <button className="it-icon-btn it-icon-btn-view" title="विवरण" onClick={() => { setDetailItem(s); setShowDetailModal(true); }}><Eye size={13} /></button>
                  <button className="it-icon-btn it-icon-btn-edit" title="सम्पादन" onClick={() => { setEditingService(s); setShowEditServiceModal(true); }}><Edit2 size={13} /></button>
                  <button className="it-icon-btn it-icon-btn-delete" title="हटाउनुहोस्" onClick={() => { if (confirm('यो सेवा हटाउने?')) deleteServiceMutation.mutate(s.id); }}><Trash2 size={13} /></button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ─── CYBER TAB ────────────────────────────────────────────────────────────────
  const renderCyber = () => (
    <div>
      <div className="it-section-header">
        <h2 className="it-section-title">
          <Shield size={20} color="#f43f5e" /> साइबर सुरक्षा घटना लग
          <span className="it-section-count">{cyberLogs.length} घटना</span>
        </h2>
        <button className="it-btn it-btn-rose" onClick={() => setShowModal('cyber')}>
          <Plus size={16} /> घटना दर्ता गर्नुहोस्
        </button>
      </div>
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <div className="it-quick-stat" style={{ minWidth: 140 }}>
          <div className="it-quick-stat-num" style={{ color: '#f43f5e', fontSize: '1.5rem' }}>{cyberLogs.length}</div>
          <div className="it-quick-stat-label">कुल घटनाहरू</div>
        </div>
        <div className="it-quick-stat" style={{ minWidth: 140 }}>
          <div className="it-quick-stat-num" style={{ color: '#10b981', fontSize: '1.5rem' }}>{cyberLogs.filter(c => c.resolved).length}</div>
          <div className="it-quick-stat-label">समाधान भयो</div>
        </div>
        <div className="it-quick-stat" style={{ minWidth: 140 }}>
          <div className="it-quick-stat-num" style={{ color: '#f59e0b', fontSize: '1.5rem' }}>{cyberLogs.filter(c => !c.resolved).length}</div>
          <div className="it-quick-stat-label">विचाराधीन</div>
        </div>
        <div className="it-quick-stat" style={{ minWidth: 140 }}>
          <div className="it-quick-stat-num" style={{ color: '#f43f5e', fontSize: '1.5rem' }}>{cyberLogs.filter(c => c.severity.includes('अत्यावश्यक')).length}</div>
          <div className="it-quick-stat-label">Critical</div>
        </div>
      </div>
      <div className="it-table-card">
        <div className="it-table-responsive">
          <table className="it-table">
            <thead>
              <tr>
                <th>गम्भीरता</th>
                <th>घटना प्रकार</th>
                <th>लक्ष्य प्रणाली</th>
                <th>स्रोत IP</th>
                <th>गरिएको कारबाही</th>
                <th>पत्ता लागेको मिति</th>
                <th>अवस्था</th>
                <th>कारबाही</th>
              </tr>
            </thead>
            <tbody>
              {cyberLogs.map(c => (
                <tr key={c.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div className={`it-cyber-severity-dot ${getSeverityClass(c.severity)}`} />
                      <span className={`it-badge ${c.severity.includes('अत्यावश्यक') ? 'it-badge-critical' : c.severity.includes('उच्च') ? 'it-badge-repair' : 'it-badge-warn'}`}>
                        {c.severity.split('(')[0].trim()}
                      </span>
                    </div>
                  </td>
                  <td style={{ fontWeight: 700 }}>{c.log_type}</td>
                  <td style={{ fontSize: '0.8rem' }}>{c.target_system || '—'}</td>
                  <td><span style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: '#dc2626' }}>{c.source_ip || '—'}</span></td>
                  <td style={{ fontSize: '0.78rem', maxWidth: 200 }}>{c.action_taken || '—'}</td>
                  <td style={{ fontSize: '0.78rem', color: 'var(--it-text-muted)' }}>{c.detected_at_bs}</td>
                  <td>
                    {c.resolved
                      ? <span className="it-badge it-badge-active"><CheckCircle size={11} /> समाधान</span>
                      : <span className="it-badge it-badge-critical"><AlertCircle size={11} /> विचाराधीन</span>
                    }
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.3rem' }}>
                      <button className="it-icon-btn it-icon-btn-view" title="विवरण" onClick={() => { setDetailItem(c); setShowDetailModal(true); }}><Eye size={13} /></button>
                      <button className="it-icon-btn it-icon-btn-edit" title="सम्पादन गर्नुहोस्" onClick={() => { setEditingCyber(c); setShowEditCyberModal(true); }}><Edit2 size={13} /></button>
                      {!c.resolved && (
                        <button className="it-icon-btn it-icon-btn-resolve" title="समाधान गर्नुहोस्" onClick={() => resolveCyberMutation.mutate(c.id)}>
                          <CheckCircle size={13} />
                        </button>
                      )}
                      <button className="it-icon-btn it-icon-btn-delete" title="हटाउनुहोस्" onClick={() => { if (confirm('यो साइबर घटना लग हटाउने?')) deleteCyberMutation.mutate(c.id); }}><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // ─── STAFF TAB ────────────────────────────────────────────────────────────────
  const renderStaff = () => (
    <div>
      <div className="it-section-header">
        <h2 className="it-section-title">
          <Users size={20} color="#06b6d4" /> IT शाखाको कर्मचारीहरू तथा जिम्मेवारी
          <span className="it-section-count">{staff.length} कर्मचारी</span>
        </h2>
        <button className="it-btn it-btn-cyan" onClick={() => setShowModal('staff')}>
          <Plus size={16} /> नयाँ कर्मचारी दर्ता
        </button>
      </div>

      <div className="it-staff-grid" style={{ marginBottom: '1.5rem' }}>
        {staff.map(s => (
          <div key={s.id} className="it-staff-card">
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.25rem' }}>
              <div className="it-staff-avatar">{s.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
              <div style={{ flex: 1 }}>
                <div className="it-staff-name">{s.name}</div>
                <div className="it-staff-designation">{s.designation}</div>
                <div className="it-staff-level">{s.level} · {s.qualifications}</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 8, padding: '0.6rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600, marginBottom: '0.2rem' }}>📞 सम्पर्क</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#fff' }}>{s.phone}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 8, padding: '0.6rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600, marginBottom: '0.2rem' }}>📧 इमेल</div>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#67e8f9', wordBreak: 'break-all' }}>{s.email}</div>
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>जिम्मेवारीहरू</div>
              <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {(Array.isArray(s.responsibilities) ? s.responsibilities : String(s.responsibilities || '').split(',')).filter(Boolean).map((r, i) => (
                  <span key={i} className="it-responsibility-chip"><Star size={10} />{r}</span>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.85rem', paddingTop: '0.6rem', borderTop: '1px solid rgba(255,255,255,0.15)', justifyContent: 'flex-end' }}>
              <button className="it-icon-btn it-icon-btn-edit" title="सम्पादन" onClick={() => { setEditingStaff(s); setShowEditStaffModal(true); }}><Edit2 size={13} /></button>
              <button className="it-icon-btn it-icon-btn-delete" title="हटाउनुहोस्" onClick={() => { if (confirm('यो कर्मचारी विवरण हटाउने?')) deleteStaffMutation.mutate(s.id); }}><Trash2 size={13} /></button>
            </div>
          </div>
        ))}
      </div>

      {/* IT Branch Functions Reference */}
      <div className="it-card">
        <div className="it-card-header">
          <h3 className="it-card-title"><Terminal size={18} color="#06b6d4" /> IT शाखाको काम, कर्तव्य र अधिकार</h3>
        </div>
        <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          {[
            { icon: <HardDrive size={18} color="#06b6d4" />, title: 'IT पूर्वाधार व्यवस्थापन', desc: 'कम्प्युटर, सर्भर, नेटवर्क उपकरण, UPS, CCTV खरिद, संचालन तथा मर्मत' },
            { icon: <Shield size={18} color="#f43f5e" />, title: 'साइबर सुरक्षा', desc: 'Firewall, Antivirus, Data Backup, Unauthorized Access रोकथाम तथा Incident Response' },
            { icon: <Globe size={18} color="#6366f1" />, title: 'डिजिटल सेवा संचालन', desc: 'ई-सेवा पोर्टल, डिजिटल ट्विन, GIS, SMS प्रणाली संचालन तथा Uptime निगरानी' },
            { icon: <Key size={18} color="#f59e0b" />, title: 'सफ्टवेयर तथा इजाजत', desc: 'सफ्टवेयर खरिद, License नवीकरण, Antivirus अद्यावधिक, Open Source प्रयोग' },
            { icon: <Users size={18} color="#10b981" />, title: 'क्षमता विकास तथा प्रशिक्षण', desc: 'कर्मचारी IT प्रशिक्षण, साइबर जागरण, Digital Literacy, Help Desk सेवा' },
            { icon: <Database size={18} color="#8b5cf6" />, title: 'डेटा व्यवस्थापन', desc: 'Database Backup, Recovery, Data Privacy Policy, Record Management' },
            { icon: <FileText size={18} color="#0891b2" />, title: 'IT नीति तथा योजना', desc: 'IT Policy निर्माण, Strategic Plan, Annual IT Budget, Procurement Planning' },
            { icon: <Activity size={18} color="#f43f5e" />, title: 'प्रणाली अनुगमन', desc: 'Server Health, Network Monitoring, Alert System, Performance Tuning' },
          ].map((item, i) => (
            <div key={i} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: '#fff', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.icon}</div>
                <div style={{ fontWeight: 800, fontSize: '0.88rem' }}>{item.title}</div>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--it-text-muted)', lineHeight: 1.6 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ─── TAB CONTENT
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'assets': return renderAssets();
      case 'licenses': return renderLicenses();
      case 'tickets': return renderTickets();
      case 'network': return renderNetwork();
      case 'services': return renderServices();
      case 'cyber': return renderCyber();
      case 'budget': return (
        <div>
          <div className="it-section-header">
            <h2 className="it-section-title"><DollarSign size={20} color="#10b981" /> IT बजेट व्यवस्थापन — आ.व. {summary?.budget.fiscal_year}</h2>
            <button className="it-btn it-btn-emerald" onClick={() => setShowModal('budget')}>
              <Plus size={16} /> नयाँ बजेट शीर्षक थप्नुहोस्
            </button>
          </div>
          <div className="it-card">
            <div className="it-card-header">
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.9rem' }}>
                <span>📊 कुल बजेट: <strong style={{ color: '#06b6d4' }}>{formatNPR(summary?.budget.total_allocated)}</strong></span>
                <span>💸 कुल खर्च: <strong style={{ color: '#f59e0b' }}>{formatNPR(summary?.budget.total_spent)}</strong></span>
                <span>✅ उपयोग: <strong style={{ color: '#10b981' }}>{summary?.budget.utilization_percent}%</strong></span>
                <span>💰 बाँकी: <strong style={{ color: '#6366f1' }}>{formatNPR((summary?.budget.total_allocated ?? 0) - (summary?.budget.total_spent ?? 0))}</strong></span>
              </div>
            </div>
            {budgetItems.map(b => {
              const pct = b.budget_allocated > 0 ? Math.round((b.budget_spent / b.budget_allocated) * 100) : 0;
              const fillClass = pct > 90 ? 'over-90' : pct > 60 ? 'over-60' : '';
              return (
                <div key={b.id} className="it-budget-item">
                  <div className="it-budget-item-header">
                    <div className="it-budget-head">{b.head}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div className="it-budget-amounts">
                        खर्च: <strong>{formatNPR(b.budget_spent)}</strong> / कुल: <strong>{formatNPR(b.budget_allocated)}</strong>
                        &nbsp;&nbsp;<span className={`it-badge ${pct > 90 ? 'it-badge-critical' : pct > 60 ? 'it-badge-warn' : 'it-badge-info'}`}>{pct}%</span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <button className="it-icon-btn it-icon-btn-edit" title="सम्पादन" onClick={() => { setEditingBudget(b); setShowEditBudgetModal(true); }}><Edit2 size={13} /></button>
                        <button className="it-icon-btn it-icon-btn-delete" title="हटाउनुहोस्" onClick={() => { if (confirm('यो बजेट शीर्षक हटाउने?')) deleteBudgetMutation.mutate(b.id); }}><Trash2 size={13} /></button>
                      </div>
                    </div>
                  </div>
                  <div className="it-budget-bar-bg" style={{ height: 10 }}>
                    <div className={`it-budget-bar-fill ${fillClass}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                  </div>
                  {b.remarks && <div style={{ fontSize: '0.75rem', color: 'var(--it-text-muted)', marginTop: '0.35rem', fontStyle: 'italic' }}>{b.remarks}</div>}
                </div>
              );
            })}
          </div>
        </div>
      );
      case 'staff': return renderStaff();
      default: return null;
    }
  };

  // ─── RENDER ───────────────────────────────────────────────────────────────────
  return (
    <div className="it-page">

      {/* ── HERO BANNER */}
      <div className="it-hero">
        <div className="it-hero-grid-bg" />
        <div className="it-hero-icon-bg"><Monitor size={320} /></div>

        <div className="it-hero-content">
          <div>
            <div className="it-hero-badge-group">
              <span className="it-hero-badge"><Sparkles size={13} /> स्थानीय तह — सूचना प्रविधि शाखा</span>
              <span className="it-hero-badge it-hero-badge-variant">आ.व. {summary?.budget.fiscal_year ?? '२०८१/०८२'}</span>
            </div>
            <h1 className="it-hero-title">
              <Cpu size={34} color="#67e8f9" />
              <span className="it-hero-title-highlight">सूचना प्रविधि</span> शाखा प्रणाली
            </h1>
            <p className="it-hero-desc">
              पाँचपोखरी थाङपाल गाउँपालिका — IT उपकरण, सफ्टवेयर इजाजत, सहायता टिकेट, नेटवर्क निगरानी, डिजिटल सेवा र साइबर सुरक्षा एकीकृत व्यवस्थापन प्रणाली
            </p>
          </div>
          <div className="it-hero-actions">
            <button className="it-btn it-btn-outline" onClick={() => { refetchSummary(); refetchAssets(); refetchTickets(); refetchCyber(); }}>
              <RefreshCw size={15} /> ताजा गर्नुहोस्
            </button>
            <button className="it-btn it-btn-cyan" onClick={() => setActiveTab('tickets')}>
              <AlertCircle size={15} /> सहायता अनुरोध
            </button>
            <button className="it-btn it-btn-indigo" onClick={() => setActiveTab('assets')}>
              <Plus size={15} /> उपकरण दर्ता
            </button>
          </div>
        </div>

        {/* KPI Stats */}
        <div className="it-stats-grid">
          <div className="it-stat-card">
            <div className="it-stat-label">IT उपकरण<Monitor size={14} color="#67e8f9" /></div>
            <div className="it-stat-value it-c-cyan">{summary?.assets.total ?? assets.length}</div>
            <div className="it-stat-sub it-c-emerald">सक्रिय: {summary?.assets.active ?? assets.filter(a => a.status.includes('सक्रिय')).length}</div>
          </div>
          <div className="it-stat-card">
            <div className="it-stat-label">खुला टिकेट<AlertCircle size={14} color="#fde68a" /></div>
            <div className="it-stat-value it-c-amber">{summary?.tickets.open ?? tickets.filter(t => t.status.includes('खुला')).length}</div>
            <div className="it-stat-sub it-c-rose">Critical: {summary?.tickets.critical ?? 0}</div>
          </div>
          <div className="it-stat-card">
            <div className="it-stat-label">नेटवर्क Online<Wifi size={14} color="#67e8f9" /></div>
            <div className="it-stat-value it-c-cyan">{summary?.network.online ?? networkDevices.filter(n => n.status.includes('अनलाइन')).length}</div>
            <div className="it-stat-sub it-c-rose">Offline: {summary?.network.offline ?? 0}</div>
          </div>
          <div className="it-stat-card">
            <div className="it-stat-label">Digital Services<Globe size={14} color="#a5b4fc" /></div>
            <div className="it-stat-value it-c-indigo">{summary?.digital_services.active ?? services.length}</div>
            <div className="it-stat-sub it-c-cyan">Uptime: {summary?.digital_services.avg_uptime_percent}%</div>
          </div>
          <div className="it-stat-card">
            <div className="it-stat-label">साइबर घटना<Shield size={14} color="#fda4af" /></div>
            <div className="it-stat-value it-c-rose">{summary?.cybersecurity.total_incidents ?? cyberLogs.length}</div>
            <div className="it-stat-sub it-c-amber">विचाराधीन: {summary?.cybersecurity.unresolved ?? 0}</div>
          </div>
          <div className="it-stat-card">
            <div className="it-stat-label">बजेट उपयोग<TrendingUp size={14} color="#6ee7b7" /></div>
            <div className="it-stat-value it-c-emerald">{summary?.budget.utilization_percent ?? 0}%</div>
            <div className="it-stat-sub it-c-violet">बाँकी: {formatNPR((summary?.budget.total_allocated ?? 0) - (summary?.budget.total_spent ?? 0))}</div>
          </div>
        </div>
      </div>

      {/* ── TABS */}
      <div className="it-tabs" role="tablist">
        {[
          { id: 'overview', label: 'अवलोकन', icon: <BarChart2 size={16} />, badge: null },
          { id: 'assets', label: 'IT उपकरण', icon: <HardDrive size={16} />, badge: assets.length },
          { id: 'licenses', label: 'सफ्टवेयर इजाजत', icon: <Key size={16} />, badge: licenses.length },
          { id: 'tickets', label: 'Helpdesk टिकेट', icon: <AlertCircle size={16} />, badge: tickets.filter(t => !t.status.includes('समाधान')).length, badgeWarn: true },
          { id: 'network', label: 'नेटवर्क', icon: <Network size={16} />, badge: networkDevices.length },
          { id: 'services', label: 'डिजिटल सेवाहरू', icon: <Globe size={16} />, badge: services.length },
          { id: 'cyber', label: 'साइबर लग', icon: <Shield size={16} />, badge: cyberLogs.filter(c => !c.resolved).length, badgeWarn: true },
          { id: 'budget', label: 'IT बजेट', icon: <DollarSign size={16} />, badge: null },
          { id: 'staff', label: 'कर्मचारी', icon: <Users size={16} />, badge: staff.length },
        ].map(tab => (
          <button
            key={tab.id}
            id={`it-tab-${tab.id}`}
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`it-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => { setActiveTab(tab.id as TabType); setSearchTerm(''); setStatusFilter('all'); setCategoryFilter('all'); setPriorityFilter('all'); }}
          >
            {tab.icon}
            {tab.label}
            {tab.badge !== null && tab.badge !== undefined && (
              <span className={`it-tab-badge ${tab.badgeWarn && (tab.badge as number) > 0 ? 'it-tab-badge-warn' : ''}`}>{tab.badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── TAB CONTENT */}
      <div role="tabpanel">{renderTabContent()}</div>

      {/* ── MODALS ─────────────────────────────────────────────────────────── */}

      {/* Add Asset Modal */}
      {showModal === 'asset' && (
        <div className="it-modal-overlay" onClick={() => setShowModal(null)}>
          <div className="it-modal it-modal-lg" onClick={e => e.stopPropagation()}>
            <div className="it-modal-header">
              <h2 className="it-modal-title"><HardDrive size={20} /> नयाँ IT उपकरण दर्ता</h2>
              <button className="it-modal-close" onClick={() => setShowModal(null)}><X size={16} /></button>
            </div>
            <div className="it-modal-body">
              <div className="it-form-section-title"><Settings size={16} color="#06b6d4" /> आधारभूत जानकारी</div>
              <div className="it-form-grid-2">
                <div className="it-form-group">
                  <label className="it-form-label">उपकरण कोड *</label>
                  <input className="it-form-input" value={assetForm.asset_code} onChange={e => setAssetForm(p => ({...p, asset_code: e.target.value}))} placeholder="IT-COM-007" />
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">उपकरणको नाम *</label>
                  <input className="it-form-input" value={assetForm.name} onChange={e => setAssetForm(p => ({...p, name: e.target.value}))} placeholder="Desktop Computer" />
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">श्रेणी *</label>
                  <select className="it-form-select" value={assetForm.category} onChange={e => setAssetForm(p => ({...p, category: e.target.value}))}>
                    {['Computer', 'Laptop', 'Printer', 'Server', 'UPS', 'CCTV', 'Network Device', 'Other'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">ब्राण्ड / मोडेल</label>
                  <input className="it-form-input" value={assetForm.brand_model} onChange={e => setAssetForm(p => ({...p, brand_model: e.target.value}))} placeholder="HP ProDesk 400 G9" />
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">Serial Number</label>
                  <input className="it-form-input" value={assetForm.serial_number} onChange={e => setAssetForm(p => ({...p, serial_number: e.target.value}))} placeholder="SN-2081-..." />
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">खरिद मिति (BS)</label>
                  <input className="it-form-input" value={assetForm.purchase_date_bs} onChange={e => setAssetForm(p => ({...p, purchase_date_bs: e.target.value}))} />
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">खरिद मूल्य (रू)</label>
                  <input className="it-form-input" type="number" value={assetForm.purchase_price} onChange={e => setAssetForm(p => ({...p, purchase_price: +e.target.value}))} />
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">वारेन्टी सम्म (BS)</label>
                  <input className="it-form-input" value={assetForm.warranty_expiry_bs} onChange={e => setAssetForm(p => ({...p, warranty_expiry_bs: e.target.value}))} placeholder="२०८४-०४-०१" />
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">प्रयोगकर्ता / शाखा</label>
                  <input className="it-form-input" value={assetForm.assigned_to} onChange={e => setAssetForm(p => ({...p, assigned_to: e.target.value}))} placeholder="लेखा शाखा — रमेश थापा" />
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">स्थान</label>
                  <input className="it-form-input" value={assetForm.location} onChange={e => setAssetForm(p => ({...p, location: e.target.value}))} />
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">अवस्था</label>
                  <select className="it-form-select" value={assetForm.status} onChange={e => setAssetForm(p => ({...p, status: e.target.value}))}>
                    <option>सक्रिय (Active)</option>
                    <option>मर्मत सुधार (Under Repair)</option>
                    <option>बिगारिएको (Out of Order)</option>
                    <option>अन्य शाखामा हस्तान्तरण</option>
                  </select>
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">अवस्था (Condition)</label>
                  <select className="it-form-select" value={assetForm.condition} onChange={e => setAssetForm(p => ({...p, condition: e.target.value}))}>
                    <option>राम्रो (Good)</option>
                    <option>मर्मत आवश्यक (Needs Repair)</option>
                    <option>पुरानो (Aging)</option>
                  </select>
                </div>
              </div>
              <div className="it-form-group">
                <label className="it-form-label">कैफियत / टिप्पणी</label>
                <textarea className="it-form-textarea" value={assetForm.remarks} onChange={e => setAssetForm(p => ({...p, remarks: e.target.value}))} placeholder="थप विवरण..." />
              </div>
            </div>
            <div className="it-modal-footer">
              <button className="it-btn it-btn-ghost" onClick={() => setShowModal(null)}>रद्द गर्नुहोस्</button>
              <button className="it-btn it-btn-cyan" disabled={createAssetMutation.isPending} onClick={() => createAssetMutation.mutate(assetForm)}>
                {createAssetMutation.isPending ? <RefreshCw size={15} /> : <Plus size={15} />} दर्ता गर्नुहोस्
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Ticket Modal */}
      {showModal === 'ticket' && (
        <div className="it-modal-overlay" onClick={() => setShowModal(null)}>
          <div className="it-modal" onClick={e => e.stopPropagation()}>
            <div className="it-modal-header">
              <h2 className="it-modal-title"><AlertCircle size={20} /> नयाँ IT सहायता अनुरोध</h2>
              <button className="it-modal-close" onClick={() => setShowModal(null)}><X size={16} /></button>
            </div>
            <div className="it-modal-body">
              <div className="it-form-group">
                <label className="it-form-label">समस्याको शीर्षक *</label>
                <input className="it-form-input" value={ticketForm.title} onChange={e => setTicketForm(p => ({...p, title: e.target.value}))} placeholder="जस्तै: Printer बन्द छ, Internet slow छ..." />
              </div>
              <div className="it-form-group">
                <label className="it-form-label">विस्तृत विवरण *</label>
                <textarea className="it-form-textarea" style={{ minHeight: 100 }} value={ticketForm.description} onChange={e => setTicketForm(p => ({...p, description: e.target.value}))} placeholder="समस्याको पूर्ण विवरण लेख्नुहोस्..." />
              </div>
              <div className="it-form-grid-2">
                <div className="it-form-group">
                  <label className="it-form-label">श्रेणी</label>
                  <select className="it-form-select" value={ticketForm.category} onChange={e => setTicketForm(p => ({...p, category: e.target.value}))}>
                    {['Hardware', 'Software', 'Network', 'Email', 'Data', 'Printer', 'CCTV', 'Other'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">प्राथमिकता</label>
                  <select className="it-form-select" value={ticketForm.priority} onChange={e => setTicketForm(p => ({...p, priority: e.target.value}))}>
                    <option>न्यून (Low)</option>
                    <option>मध्यम (Medium)</option>
                    <option>उच्च (High)</option>
                    <option>अत्यावश्यक (Critical)</option>
                  </select>
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">उठाउने व्यक्ति *</label>
                  <input className="it-form-input" value={ticketForm.raised_by} onChange={e => setTicketForm(p => ({...p, raised_by: e.target.value}))} placeholder="नाम थर..." />
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">शाखा / विभाग</label>
                  <input className="it-form-input" value={ticketForm.raised_department} onChange={e => setTicketForm(p => ({...p, raised_department: e.target.value}))} placeholder="प्रशासन शाखा..." />
                </div>
              </div>
            </div>
            <div className="it-modal-footer">
              <button className="it-btn it-btn-ghost" onClick={() => setShowModal(null)}>रद्द गर्नुहोस्</button>
              <button className="it-btn it-btn-amber" disabled={createTicketMutation.isPending} onClick={() => createTicketMutation.mutate(ticketForm)}>
                {createTicketMutation.isPending ? <RefreshCw size={15} /> : <Plus size={15} />} टिकेट दर्ता गर्नुहोस्
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add License Modal */}
      {showModal === 'license' && (
        <div className="it-modal-overlay" onClick={() => setShowModal(null)}>
          <div className="it-modal" onClick={e => e.stopPropagation()}>
            <div className="it-modal-header">
              <h2 className="it-modal-title"><Key size={20} /> नयाँ सफ्टवेयर इजाजत दर्ता</h2>
              <button className="it-modal-close" onClick={() => setShowModal(null)}><X size={16} /></button>
            </div>
            <div className="it-modal-body">
              <div className="it-form-grid-2">
                <div className="it-form-group">
                  <label className="it-form-label">सफ्टवेयरको नाम *</label>
                  <input className="it-form-input" value={licenseForm.software_name} onChange={e => setLicenseForm(p => ({...p, software_name: e.target.value}))} placeholder="Microsoft Office 365..." />
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">विक्रेता (Vendor)</label>
                  <input className="it-form-input" value={licenseForm.vendor} onChange={e => setLicenseForm(p => ({...p, vendor: e.target.value}))} placeholder="Microsoft..." />
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">License Key</label>
                  <input className="it-form-input" value={licenseForm.license_key} onChange={e => setLicenseForm(p => ({...p, license_key: e.target.value}))} placeholder="XXXXX-XXXXX-..." />
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">प्रकार</label>
                  <select className="it-form-select" value={licenseForm.license_type} onChange={e => setLicenseForm(p => ({...p, license_type: e.target.value}))}>
                    <option>Paid</option>
                    <option>Free/Open Source</option>
                    <option>Freeware</option>
                    <option>Trial</option>
                  </select>
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">Seats (प्रयोगकर्ता संख्या)</label>
                  <input className="it-form-input" type="number" value={licenseForm.seats} onChange={e => setLicenseForm(p => ({...p, seats: +e.target.value}))} />
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">वार्षिक शुल्क (रू)</label>
                  <input className="it-form-input" type="number" value={licenseForm.annual_cost} onChange={e => setLicenseForm(p => ({...p, annual_cost: +e.target.value}))} />
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">खरिद मिति (BS)</label>
                  <input className="it-form-input" value={licenseForm.purchase_date_bs} onChange={e => setLicenseForm(p => ({...p, purchase_date_bs: e.target.value}))} />
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">म्याद सम्म (BS)</label>
                  <input className="it-form-input" value={licenseForm.expiry_date_bs} onChange={e => setLicenseForm(p => ({...p, expiry_date_bs: e.target.value}))} placeholder="२०८२-०४-०१" />
                </div>
              </div>
              <div className="it-form-group">
                <label className="it-form-label">प्रयोगकर्ता / शाखा</label>
                <input className="it-form-input" value={licenseForm.assigned_to} onChange={e => setLicenseForm(p => ({...p, assigned_to: e.target.value}))} placeholder="सम्पूर्ण कर्मचारी..." />
              </div>
            </div>
            <div className="it-modal-footer">
              <button className="it-btn it-btn-ghost" onClick={() => setShowModal(null)}>रद्द गर्नुहोस्</button>
              <button className="it-btn it-btn-indigo" disabled={createLicenseMutation.isPending} onClick={() => createLicenseMutation.mutate(licenseForm)}>
                {createLicenseMutation.isPending ? <RefreshCw size={15} /> : <Plus size={15} />} दर्ता गर्नुहोस्
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cyber Log Modal */}
      {showModal === 'cyber' && (
        <div className="it-modal-overlay" onClick={() => setShowModal(null)}>
          <div className="it-modal" onClick={e => e.stopPropagation()}>
            <div className="it-modal-header">
              <h2 className="it-modal-title"><Shield size={20} /> साइबर घटना दर्ता</h2>
              <button className="it-modal-close" onClick={() => setShowModal(null)}><X size={16} /></button>
            </div>
            <div className="it-modal-body">
              <div className="it-form-grid-2">
                <div className="it-form-group">
                  <label className="it-form-label">घटना प्रकार *</label>
                  <select className="it-form-select" value={cyberForm.log_type} onChange={e => setCyberForm(p => ({...p, log_type: e.target.value}))}>
                    {['Firewall Block', 'Virus Found', 'Unauthorized Access Attempt', 'Phishing Email', 'Data Breach', 'Policy Violation', 'Ransomware', 'Other'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">गम्भीरता</label>
                  <select className="it-form-select" value={cyberForm.severity} onChange={e => setCyberForm(p => ({...p, severity: e.target.value}))}>
                    <option>न्यून (Low)</option>
                    <option>मध्यम (Medium)</option>
                    <option>उच्च (High)</option>
                    <option>अत्यावश्यक (Critical)</option>
                  </select>
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">स्रोत IP</label>
                  <input className="it-form-input" value={cyberForm.source_ip} onChange={e => setCyberForm(p => ({...p, source_ip: e.target.value}))} placeholder="192.168.x.x" />
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">लक्ष्य प्रणाली</label>
                  <input className="it-form-input" value={cyberForm.target_system} onChange={e => setCyberForm(p => ({...p, target_system: e.target.value}))} placeholder="Server / Portal / Desktop..." />
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">पत्ता लागेको मिति (BS)</label>
                  <input className="it-form-input" value={cyberForm.detected_at_bs} onChange={e => setCyberForm(p => ({...p, detected_at_bs: e.target.value}))} />
                </div>
              </div>
              <div className="it-form-group">
                <label className="it-form-label">गरिएको कारबाही</label>
                <textarea className="it-form-textarea" value={cyberForm.action_taken} onChange={e => setCyberForm(p => ({...p, action_taken: e.target.value}))} placeholder="IP blocked, Virus quarantined, Account locked..." />
              </div>
            </div>
            <div className="it-modal-footer">
              <button className="it-btn it-btn-ghost" onClick={() => setShowModal(null)}>रद्द गर्नुहोस्</button>
              <button className="it-btn it-btn-rose" disabled={createCyberLogMutation.isPending} onClick={() => createCyberLogMutation.mutate(cyberForm)}>
                {createCyberLogMutation.isPending ? <RefreshCw size={15} /> : <Bug size={15} />} घटना दर्ता गर्नुहोस्
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Network Device Modal */}
      {showModal === 'network' && (
        <div className="it-modal-overlay" onClick={() => setShowModal(null)}>
          <div className="it-modal it-modal-lg" onClick={e => e.stopPropagation()}>
            <div className="it-modal-header">
              <h2 className="it-modal-title"><Network size={20} /> नयाँ नेटवर्क उपकरण दर्ता</h2>
              <button className="it-modal-close" onClick={() => setShowModal(null)}><X size={16} /></button>
            </div>
            <div className="it-modal-body">
              <div className="it-form-grid-2">
                <div className="it-form-group">
                  <label className="it-form-label">उपकरणको नाम *</label>
                  <input className="it-form-input" value={networkForm.device_name} onChange={e => setNetworkForm(p => ({ ...p, device_name: e.target.value }))} placeholder="Main Router / Core Switch..." />
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">उपकरणको प्रकार *</label>
                  <select className="it-form-select" value={networkForm.device_type} onChange={e => setNetworkForm(p => ({ ...p, device_type: e.target.value }))}>
                    {['Router', 'Switch', 'Access Point', 'Firewall', 'Server', 'Camera', 'NAS', 'Other'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">IP Address</label>
                  <input className="it-form-input" value={networkForm.ip_address} onChange={e => setNetworkForm(p => ({ ...p, ip_address: e.target.value }))} placeholder="10.0.0.1 / 192.168.1.1" />
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">MAC Address</label>
                  <input className="it-form-input" value={networkForm.mac_address} onChange={e => setNetworkForm(p => ({ ...p, mac_address: e.target.value }))} placeholder="AA:BB:CC:DD:EE:FF" />
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">स्थान / कोठा</label>
                  <input className="it-form-input" value={networkForm.location} onChange={e => setNetworkForm(p => ({ ...p, location: e.target.value }))} placeholder="मुख्य कार्यालय - IT Room" />
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">VLAN</label>
                  <input className="it-form-input" value={networkForm.vlan} onChange={e => setNetworkForm(p => ({ ...p, vlan: e.target.value }))} placeholder="VLAN1 / Office / Guest" />
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">इन्टरनेट प्रदायक (ISP)</label>
                  <input className="it-form-input" value={networkForm.isp_provider} onChange={e => setNetworkForm(p => ({ ...p, isp_provider: e.target.value }))} placeholder="Nepal Telecom Fiber / WorldLink" />
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">ब्यान्डविथ (Mbps)</label>
                  <input className="it-form-input" type="number" value={networkForm.bandwidth_mbps} onChange={e => setNetworkForm(p => ({ ...p, bandwidth_mbps: +e.target.value }))} />
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">अवस्था</label>
                  <select className="it-form-select" value={networkForm.status} onChange={e => setNetworkForm(p => ({ ...p, status: e.target.value }))}>
                    <option>अनलाइन (Online)</option>
                    <option>अफलाइन (Offline)</option>
                    <option>मर्मत सुधार (Under Repair)</option>
                  </select>
                </div>
              </div>
              <div className="it-form-group">
                <label className="it-form-label">कैफियत / टिप्पणी</label>
                <textarea className="it-form-textarea" value={networkForm.remarks} onChange={e => setNetworkForm(p => ({ ...p, remarks: e.target.value }))} placeholder="उपकरणको थप विवरण..." />
              </div>
            </div>
            <div className="it-modal-footer">
              <button className="it-btn it-btn-ghost" onClick={() => setShowModal(null)}>रद्द गर्नुहोस्</button>
              <button className="it-btn it-btn-cyan" disabled={createNetworkMutation.isPending} onClick={() => createNetworkMutation.mutate(networkForm)}>
                {createNetworkMutation.isPending ? <RefreshCw size={15} /> : <Plus size={15} />} उपकरण दर्ता गर्नुहोस्
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Digital Service Modal */}
      {showModal === 'service' && (
        <div className="it-modal-overlay" onClick={() => setShowModal(null)}>
          <div className="it-modal it-modal-lg" onClick={e => e.stopPropagation()}>
            <div className="it-modal-header">
              <h2 className="it-modal-title"><Globe size={20} /> नयाँ डिजिटल सेवा दर्ता</h2>
              <button className="it-modal-close" onClick={() => setShowModal(null)}><X size={16} /></button>
            </div>
            <div className="it-modal-body">
              <div className="it-form-grid-2">
                <div className="it-form-group">
                  <label className="it-form-label">सेवाको नाम *</label>
                  <input className="it-form-input" value={serviceForm.service_name} onChange={e => setServiceForm(p => ({ ...p, service_name: e.target.value }))} placeholder="नागरिक ई-सेवा / डिजिटल ड्यासबोर्ड..." />
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">सेवाको प्रकार</label>
                  <select className="it-form-select" value={serviceForm.service_type} onChange={e => setServiceForm(p => ({ ...p, service_type: e.target.value }))}>
                    {['Portal', 'Mobile App', 'SMS', 'API', 'System', 'Other'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="it-form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="it-form-label">URL / लिङ्क</label>
                  <input className="it-form-input" value={serviceForm.url} onChange={e => setServiceForm(p => ({ ...p, url: e.target.value }))} placeholder="https://palika.gov.np/service" />
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">जिम्मेवार अधिकारी / शाखा</label>
                  <input className="it-form-input" value={serviceForm.responsible_officer} onChange={e => setServiceForm(p => ({ ...p, responsible_officer: e.target.value }))} placeholder="IT शाखा प्रमुख..." />
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">सञ्चालन मिति (BS)</label>
                  <input className="it-form-input" value={serviceForm.launch_date_bs} onChange={e => setServiceForm(p => ({ ...p, launch_date_bs: e.target.value }))} placeholder="२०८१-०१-०१" />
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">औसत Uptime (%)</label>
                  <input className="it-form-input" type="number" step="0.1" value={serviceForm.uptime_percent} onChange={e => setServiceForm(p => ({ ...p, uptime_percent: +e.target.value }))} />
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">मासिक प्रयोगकर्ता संख्या</label>
                  <input className="it-form-input" type="number" value={serviceForm.monthly_users} onChange={e => setServiceForm(p => ({ ...p, monthly_users: +e.target.value }))} />
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">अवस्था</label>
                  <select className="it-form-select" value={serviceForm.status} onChange={e => setServiceForm(p => ({ ...p, status: e.target.value }))}>
                    <option>सक्रिय (Active)</option>
                    <option>विकासक्रममा (Under Development)</option>
                    <option>मर्मतमा (Under Maintenance)</option>
                    <option>स्थगित (Inactive)</option>
                  </select>
                </div>
              </div>
              <div className="it-form-group">
                <label className="it-form-label">कैफियत</label>
                <textarea className="it-form-textarea" value={serviceForm.remarks} onChange={e => setServiceForm(p => ({ ...p, remarks: e.target.value }))} placeholder="सेवा सम्बन्धी थप टिप्पणी..." />
              </div>
            </div>
            <div className="it-modal-footer">
              <button className="it-btn it-btn-ghost" onClick={() => setShowModal(null)}>रद्द गर्नुहोस्</button>
              <button className="it-btn it-btn-indigo" disabled={createServiceMutation.isPending} onClick={() => createServiceMutation.mutate(serviceForm)}>
                {createServiceMutation.isPending ? <RefreshCw size={15} /> : <Plus size={15} />} सेवा दर्ता गर्नुहोस्
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Budget Modal */}
      {showModal === 'budget' && (
        <div className="it-modal-overlay" onClick={() => setShowModal(null)}>
          <div className="it-modal" onClick={e => e.stopPropagation()}>
            <div className="it-modal-header">
              <h2 className="it-modal-title"><DollarSign size={20} /> नयाँ IT बजेट शीर्षक दर्ता</h2>
              <button className="it-modal-close" onClick={() => setShowModal(null)}><X size={16} /></button>
            </div>
            <div className="it-modal-body">
              <div className="it-form-group">
                <label className="it-form-label">आर्थिक वर्ष *</label>
                <input className="it-form-input" value={budgetForm.fiscal_year} onChange={e => setBudgetForm(p => ({ ...p, fiscal_year: e.target.value }))} placeholder="२०८१/०८२" />
              </div>
              <div className="it-form-group">
                <label className="it-form-label">बजेट शीर्षक (Head / Title) *</label>
                <input className="it-form-input" value={budgetForm.head} onChange={e => setBudgetForm(p => ({ ...p, head: e.target.value }))} placeholder="IT उपकरण खरिद / सफ्टवेयर नवीकरण..." />
              </div>
              <div className="it-form-grid-2">
                <div className="it-form-group">
                  <label className="it-form-label">विनियोजित बजेट (रू) *</label>
                  <input className="it-form-input" type="number" value={budgetForm.budget_allocated} onChange={e => setBudgetForm(p => ({ ...p, budget_allocated: +e.target.value }))} />
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">खर्च भएको बजेट (रू)</label>
                  <input className="it-form-input" type="number" value={budgetForm.budget_spent} onChange={e => setBudgetForm(p => ({ ...p, budget_spent: +e.target.value }))} />
                </div>
              </div>
              <div className="it-form-group">
                <label className="it-form-label">कैफियत</label>
                <textarea className="it-form-textarea" value={budgetForm.remarks} onChange={e => setBudgetForm(p => ({ ...p, remarks: e.target.value }))} placeholder="बजेट सम्बन्धी थप विवरण..." />
              </div>
            </div>
            <div className="it-modal-footer">
              <button className="it-btn it-btn-ghost" onClick={() => setShowModal(null)}>रद्द गर्नुहोस्</button>
              <button className="it-btn it-btn-emerald" disabled={createBudgetMutation.isPending} onClick={() => createBudgetMutation.mutate(budgetForm)}>
                {createBudgetMutation.isPending ? <RefreshCw size={15} /> : <Plus size={15} />} बजेट दर्ता गर्नुहोस्
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      {showModal === 'staff' && (
        <div className="it-modal-overlay" onClick={() => setShowModal(null)}>
          <div className="it-modal it-modal-lg" onClick={e => e.stopPropagation()}>
            <div className="it-modal-header">
              <h2 className="it-modal-title"><Users size={20} /> नयाँ IT कर्मचारी दर्ता</h2>
              <button className="it-modal-close" onClick={() => setShowModal(null)}><X size={16} /></button>
            </div>
            <div className="it-modal-body">
              <div className="it-form-grid-2">
                <div className="it-form-group">
                  <label className="it-form-label">कर्मचारीको नाम *</label>
                  <input className="it-form-input" value={staffForm.name} onChange={e => setStaffForm(p => ({ ...p, name: e.target.value }))} placeholder="नाम थर..." />
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">पद / पदनाम *</label>
                  <input className="it-form-input" value={staffForm.designation} onChange={e => setStaffForm(p => ({ ...p, designation: e.target.value }))} placeholder="सूचना प्रविधि अधिकृत / कम्प्युटर अपरेटर..." />
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">तह / श्रेणी</label>
                  <input className="it-form-input" value={staffForm.level} onChange={e => setStaffForm(p => ({ ...p, level: e.target.value }))} placeholder="अधिकृत छैठौं (6th) / सहायक पाँचौं..." />
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">शैक्षिक योग्यता</label>
                  <input className="it-form-input" value={staffForm.qualifications} onChange={e => setStaffForm(p => ({ ...p, qualifications: e.target.value }))} placeholder="BIT, CCNA, CTEVT..." />
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">सम्पर्क फोन</label>
                  <input className="it-form-input" value={staffForm.phone} onChange={e => setStaffForm(p => ({ ...p, phone: e.target.value }))} placeholder="९८XXXXXXXX" />
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">इमेल ठेगाना</label>
                  <input className="it-form-input" value={staffForm.email} onChange={e => setStaffForm(p => ({ ...p, email: e.target.value }))} placeholder="it@palika.gov.np" />
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">नियुक्ति मिति (BS)</label>
                  <input className="it-form-input" value={staffForm.join_date_bs} onChange={e => setStaffForm(p => ({ ...p, join_date_bs: e.target.value }))} placeholder="२०८०-०३-०१" />
                </div>
              </div>
              <div className="it-form-group">
                <label className="it-form-label">जिम्मेवारीहरू (अल्पविराम ',' ले छुट्याउनुहोस्)</label>
                <textarea className="it-form-textarea" value={staffForm.responsibilities} onChange={e => setStaffForm(p => ({ ...p, responsibilities: e.target.value }))} placeholder="IT Infrastructure, Cybersecurity, System Administration, Hardware Support..." />
              </div>
            </div>
            <div className="it-modal-footer">
              <button className="it-btn it-btn-ghost" onClick={() => setShowModal(null)}>रद्द गर्नुहोस्</button>
              <button className="it-btn it-btn-cyan" disabled={createStaffMutation.isPending} onClick={() => createStaffMutation.mutate({ ...staffForm, responsibilities: staffForm.responsibilities.split(',').map(r => r.trim()).filter(Boolean) })}>
                {createStaffMutation.isPending ? <RefreshCw size={15} /> : <Plus size={15} />} कर्मचारी दर्ता गर्नुहोस्
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Asset Modal */}
      {showEditAssetModal && editingAsset && (
        <div className="it-modal-overlay" onClick={() => setShowEditAssetModal(false)}>
          <div className="it-modal it-modal-lg" onClick={e => e.stopPropagation()}>
            <div className="it-modal-header">
              <h2 className="it-modal-title"><Edit2 size={20} /> IT उपकरण सम्पादन: {editingAsset.asset_code}</h2>
              <button className="it-modal-close" onClick={() => setShowEditAssetModal(false)}><X size={16} /></button>
            </div>
            <div className="it-modal-body">
              <div className="it-form-grid-2">
                <div className="it-form-group">
                  <label className="it-form-label">उपकरण कोड *</label>
                  <input className="it-form-input" value={editingAsset.asset_code} onChange={e => setEditingAsset({ ...editingAsset, asset_code: e.target.value })} />
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">उपकरणको नाम *</label>
                  <input className="it-form-input" value={editingAsset.name} onChange={e => setEditingAsset({ ...editingAsset, name: e.target.value })} />
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">श्रेणी</label>
                  <select className="it-form-select" value={editingAsset.category} onChange={e => setEditingAsset({ ...editingAsset, category: e.target.value })}>
                    {['Computer', 'Laptop', 'Printer', 'Server', 'UPS', 'CCTV', 'Network Device', 'Other'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">ब्राण्ड / मोडेल</label>
                  <input className="it-form-input" value={editingAsset.brand_model || ''} onChange={e => setEditingAsset({ ...editingAsset, brand_model: e.target.value })} />
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">Serial Number</label>
                  <input className="it-form-input" value={editingAsset.serial_number || ''} onChange={e => setEditingAsset({ ...editingAsset, serial_number: e.target.value })} />
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">खरिद मिति (BS)</label>
                  <input className="it-form-input" value={editingAsset.purchase_date_bs || ''} onChange={e => setEditingAsset({ ...editingAsset, purchase_date_bs: e.target.value })} />
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">खरिद मूल्य (रू)</label>
                  <input className="it-form-input" type="number" value={editingAsset.purchase_price || 0} onChange={e => setEditingAsset({ ...editingAsset, purchase_price: +e.target.value })} />
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">वारेन्टी सम्म (BS)</label>
                  <input className="it-form-input" value={editingAsset.warranty_expiry_bs || ''} onChange={e => setEditingAsset({ ...editingAsset, warranty_expiry_bs: e.target.value })} />
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">प्रयोगकर्ता / शाखा</label>
                  <input className="it-form-input" value={editingAsset.assigned_to || ''} onChange={e => setEditingAsset({ ...editingAsset, assigned_to: e.target.value })} />
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">स्थान</label>
                  <input className="it-form-input" value={editingAsset.location || ''} onChange={e => setEditingAsset({ ...editingAsset, location: e.target.value })} />
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">अवस्था</label>
                  <select className="it-form-select" value={editingAsset.status} onChange={e => setEditingAsset({ ...editingAsset, status: e.target.value })}>
                    <option>सक्रिय (Active)</option>
                    <option>मर्मत सुधार (Under Repair)</option>
                    <option>बिगारिएको (Out of Order)</option>
                    <option>अन्य शाखामा हस्तान्तरण</option>
                  </select>
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">अवस्था (Condition)</label>
                  <select className="it-form-select" value={editingAsset.condition} onChange={e => setEditingAsset({ ...editingAsset, condition: e.target.value })}>
                    <option>राम्रो (Good)</option>
                    <option>मर्मत आवश्यक (Needs Repair)</option>
                    <option>पुरानो (Aging)</option>
                  </select>
                </div>
              </div>
              <div className="it-form-group">
                <label className="it-form-label">कैफियत / टिप्पणी</label>
                <textarea className="it-form-textarea" value={editingAsset.remarks || ''} onChange={e => setEditingAsset({ ...editingAsset, remarks: e.target.value })} />
              </div>
            </div>
            <div className="it-modal-footer">
              <button className="it-btn it-btn-ghost" onClick={() => setShowEditAssetModal(false)}>रद्द गर्नुहोस्</button>
              <button className="it-btn it-btn-cyan" disabled={updateAssetMutation.isPending} onClick={() => updateAssetMutation.mutate(editingAsset)}>
                {updateAssetMutation.isPending ? <RefreshCw size={15} /> : <CheckCircle size={15} />} परिवर्तन सुरक्षित गर्नुहोस्
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit License Modal */}
      {showEditLicenseModal && editingLicense && (
        <div className="it-modal-overlay" onClick={() => setShowEditLicenseModal(false)}>
          <div className="it-modal it-modal-lg" onClick={e => e.stopPropagation()}>
            <div className="it-modal-header">
              <h2 className="it-modal-title"><Edit2 size={20} /> सफ्टवेयर इजाजत सम्पादन</h2>
              <button className="it-modal-close" onClick={() => setShowEditLicenseModal(false)}><X size={16} /></button>
            </div>
            <div className="it-modal-body">
              <div className="it-form-grid-2">
                <div className="it-form-group">
                  <label className="it-form-label">सफ्टवेयरको नाम *</label>
                  <input className="it-form-input" value={editingLicense.software_name} onChange={e => setEditingLicense({ ...editingLicense, software_name: e.target.value })} />
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">विक्रेता (Vendor)</label>
                  <input className="it-form-input" value={editingLicense.vendor || ''} onChange={e => setEditingLicense({ ...editingLicense, vendor: e.target.value })} />
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">License Key</label>
                  <input className="it-form-input" value={editingLicense.license_key || ''} onChange={e => setEditingLicense({ ...editingLicense, license_key: e.target.value })} />
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">प्रकार</label>
                  <select className="it-form-select" value={editingLicense.license_type} onChange={e => setEditingLicense({ ...editingLicense, license_type: e.target.value })}>
                    <option>Paid</option>
                    <option>Free/Open Source</option>
                    <option>Freeware</option>
                    <option>Trial</option>
                  </select>
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">Seats</label>
                  <input className="it-form-input" type="number" value={editingLicense.seats} onChange={e => setEditingLicense({ ...editingLicense, seats: +e.target.value })} />
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">वार्षिक शुल्क (रू)</label>
                  <input className="it-form-input" type="number" value={editingLicense.annual_cost || 0} onChange={e => setEditingLicense({ ...editingLicense, annual_cost: +e.target.value })} />
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">खरिद मिति (BS)</label>
                  <input className="it-form-input" value={editingLicense.purchase_date_bs || ''} onChange={e => setEditingLicense({ ...editingLicense, purchase_date_bs: e.target.value })} />
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">म्याद सम्म (BS)</label>
                  <input className="it-form-input" value={editingLicense.expiry_date_bs || ''} onChange={e => setEditingLicense({ ...editingLicense, expiry_date_bs: e.target.value })} />
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">अवस्था</label>
                  <select className="it-form-select" value={editingLicense.status} onChange={e => setEditingLicense({ ...editingLicense, status: e.target.value })}>
                    <option>सक्रिय (Active)</option>
                    <option>म्याद सकिँदै (Expiring Soon)</option>
                    <option>म्याद सकिएको (Expired)</option>
                  </select>
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">प्रयोगकर्ता / शाखा</label>
                  <input className="it-form-input" value={editingLicense.assigned_to || ''} onChange={e => setEditingLicense({ ...editingLicense, assigned_to: e.target.value })} />
                </div>
              </div>
            </div>
            <div className="it-modal-footer">
              <button className="it-btn it-btn-ghost" onClick={() => setShowEditLicenseModal(false)}>रद्द गर्नुहोस्</button>
              <button className="it-btn it-btn-indigo" disabled={updateLicenseMutation.isPending} onClick={() => updateLicenseMutation.mutate(editingLicense)}>
                {updateLicenseMutation.isPending ? <RefreshCw size={15} /> : <CheckCircle size={15} />} परिवर्तन सुरक्षित गर्नुहोस्
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Ticket Modal */}
      {showEditTicketModal && editingTicket && (
        <div className="it-modal-overlay" onClick={() => setShowEditTicketModal(false)}>
          <div className="it-modal it-modal-lg" onClick={e => e.stopPropagation()}>
            <div className="it-modal-header">
              <h2 className="it-modal-title"><Edit2 size={20} /> टिकेट सम्पादन: {editingTicket.ticket_no}</h2>
              <button className="it-modal-close" onClick={() => setShowEditTicketModal(false)}><X size={16} /></button>
            </div>
            <div className="it-modal-body">
              <div className="it-form-group">
                <label className="it-form-label">समस्याको शीर्षक *</label>
                <input className="it-form-input" value={editingTicket.title} onChange={e => setEditingTicket({ ...editingTicket, title: e.target.value })} />
              </div>
              <div className="it-form-group">
                <label className="it-form-label">विस्तृत विवरण</label>
                <textarea className="it-form-textarea" style={{ minHeight: 90 }} value={editingTicket.description} onChange={e => setEditingTicket({ ...editingTicket, description: e.target.value })} />
              </div>
              <div className="it-form-grid-2">
                <div className="it-form-group">
                  <label className="it-form-label">श्रेणी</label>
                  <select className="it-form-select" value={editingTicket.category} onChange={e => setEditingTicket({ ...editingTicket, category: e.target.value })}>
                    {['Hardware', 'Software', 'Network', 'Email', 'Data', 'Printer', 'CCTV', 'Other'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">प्राथमिकता</label>
                  <select className="it-form-select" value={editingTicket.priority} onChange={e => setEditingTicket({ ...editingTicket, priority: e.target.value })}>
                    <option>न्यून (Low)</option>
                    <option>मध्यम (Medium)</option>
                    <option>उच्च (High)</option>
                    <option>अत्यावश्यक (Critical)</option>
                  </select>
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">उठाउने व्यक्ति</label>
                  <input className="it-form-input" value={editingTicket.raised_by} onChange={e => setEditingTicket({ ...editingTicket, raised_by: e.target.value })} />
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">शाखा / विभाग</label>
                  <input className="it-form-input" value={editingTicket.raised_department || ''} onChange={e => setEditingTicket({ ...editingTicket, raised_department: e.target.value })} />
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">जिम्मेवार व्यक्ति</label>
                  <input className="it-form-input" value={editingTicket.assigned_to || ''} onChange={e => setEditingTicket({ ...editingTicket, assigned_to: e.target.value })} />
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">अवस्था</label>
                  <select className="it-form-select" value={editingTicket.status} onChange={e => setEditingTicket({ ...editingTicket, status: e.target.value })}>
                    <option>खुला (Open)</option>
                    <option>प्रगतिमा (In Progress)</option>
                    <option>समाधान भयो (Resolved)</option>
                  </select>
                </div>
              </div>
              <div className="it-form-group">
                <label className="it-form-label">समाधान टिप्पणी (Resolution Notes)</label>
                <textarea className="it-form-textarea" value={editingTicket.resolution_notes || ''} onChange={e => setEditingTicket({ ...editingTicket, resolution_notes: e.target.value })} placeholder="समस्या कसरी समाधान भयो..." />
              </div>
            </div>
            <div className="it-modal-footer">
              <button className="it-btn it-btn-ghost" onClick={() => setShowEditTicketModal(false)}>रद्द गर्नुहोस्</button>
              <button className="it-btn it-btn-amber" disabled={updateTicketMutation.isPending} onClick={() => updateTicketMutation.mutate(editingTicket)}>
                {updateTicketMutation.isPending ? <RefreshCw size={15} /> : <CheckCircle size={15} />} परिवर्तन सुरक्षित गर्नुहोस्
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Network Device Modal */}
      {showEditNetworkModal && editingNetwork && (
        <div className="it-modal-overlay" onClick={() => setShowEditNetworkModal(false)}>
          <div className="it-modal it-modal-lg" onClick={e => e.stopPropagation()}>
            <div className="it-modal-header">
              <h2 className="it-modal-title"><Edit2 size={20} /> नेटवर्क उपकरण सम्पादन: {editingNetwork.device_name}</h2>
              <button className="it-modal-close" onClick={() => setShowEditNetworkModal(false)}><X size={16} /></button>
            </div>
            <div className="it-modal-body">
              <div className="it-form-grid-2">
                <div className="it-form-group">
                  <label className="it-form-label">उपकरणको नाम *</label>
                  <input className="it-form-input" value={editingNetwork.device_name} onChange={e => setEditingNetwork({ ...editingNetwork, device_name: e.target.value })} />
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">प्रकार</label>
                  <select className="it-form-select" value={editingNetwork.device_type} onChange={e => setEditingNetwork({ ...editingNetwork, device_type: e.target.value })}>
                    {['Router', 'Switch', 'Access Point', 'Firewall', 'Server', 'Camera', 'NAS', 'Other'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">IP Address</label>
                  <input className="it-form-input" value={editingNetwork.ip_address || ''} onChange={e => setEditingNetwork({ ...editingNetwork, ip_address: e.target.value })} />
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">MAC Address</label>
                  <input className="it-form-input" value={editingNetwork.mac_address || ''} onChange={e => setEditingNetwork({ ...editingNetwork, mac_address: e.target.value })} />
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">स्थान / कोठा</label>
                  <input className="it-form-input" value={editingNetwork.location || ''} onChange={e => setEditingNetwork({ ...editingNetwork, location: e.target.value })} />
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">VLAN</label>
                  <input className="it-form-input" value={editingNetwork.vlan || ''} onChange={e => setEditingNetwork({ ...editingNetwork, vlan: e.target.value })} />
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">इन्टरनेट प्रदायक (ISP)</label>
                  <input className="it-form-input" value={editingNetwork.isp_provider || ''} onChange={e => setEditingNetwork({ ...editingNetwork, isp_provider: e.target.value })} />
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">ब्यान्डविथ (Mbps)</label>
                  <input className="it-form-input" type="number" value={editingNetwork.bandwidth_mbps || 0} onChange={e => setEditingNetwork({ ...editingNetwork, bandwidth_mbps: +e.target.value })} />
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">अवस्था</label>
                  <select className="it-form-select" value={editingNetwork.status} onChange={e => setEditingNetwork({ ...editingNetwork, status: e.target.value })}>
                    <option>अनलाइन (Online)</option>
                    <option>अफलाइन (Offline)</option>
                    <option>मर्मत सुधार (Under Repair)</option>
                  </select>
                </div>
              </div>
              <div className="it-form-group">
                <label className="it-form-label">कैफियत</label>
                <textarea className="it-form-textarea" value={editingNetwork.remarks || ''} onChange={e => setEditingNetwork({ ...editingNetwork, remarks: e.target.value })} />
              </div>
            </div>
            <div className="it-modal-footer">
              <button className="it-btn it-btn-ghost" onClick={() => setShowEditNetworkModal(false)}>रद्द गर्नुहोस्</button>
              <button className="it-btn it-btn-cyan" disabled={updateNetworkMutation.isPending} onClick={() => updateNetworkMutation.mutate(editingNetwork)}>
                {updateNetworkMutation.isPending ? <RefreshCw size={15} /> : <CheckCircle size={15} />} परिवर्तन सुरक्षित गर्नुहोस्
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Digital Service Modal */}
      {showEditServiceModal && editingService && (
        <div className="it-modal-overlay" onClick={() => setShowEditServiceModal(false)}>
          <div className="it-modal it-modal-lg" onClick={e => e.stopPropagation()}>
            <div className="it-modal-header">
              <h2 className="it-modal-title"><Edit2 size={20} /> डिजिटल सेवा सम्पादन: {editingService.service_name}</h2>
              <button className="it-modal-close" onClick={() => setShowEditServiceModal(false)}><X size={16} /></button>
            </div>
            <div className="it-modal-body">
              <div className="it-form-grid-2">
                <div className="it-form-group">
                  <label className="it-form-label">सेवाको नाम *</label>
                  <input className="it-form-input" value={editingService.service_name} onChange={e => setEditingService({ ...editingService, service_name: e.target.value })} />
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">सेवा प्रकार</label>
                  <select className="it-form-select" value={editingService.service_type} onChange={e => setEditingService({ ...editingService, service_type: e.target.value })}>
                    {['Portal', 'Mobile App', 'SMS', 'API', 'System', 'Other'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="it-form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="it-form-label">URL / लिङ्क</label>
                  <input className="it-form-input" value={editingService.url || ''} onChange={e => setEditingService({ ...editingService, url: e.target.value })} />
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">जिम्मेवार अधिकारी / शाखा</label>
                  <input className="it-form-input" value={editingService.responsible_officer || ''} onChange={e => setEditingService({ ...editingService, responsible_officer: e.target.value })} />
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">सञ्चालन मिति (BS)</label>
                  <input className="it-form-input" value={editingService.launch_date_bs || ''} onChange={e => setEditingService({ ...editingService, launch_date_bs: e.target.value })} />
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">Uptime (%)</label>
                  <input className="it-form-input" type="number" step="0.1" value={editingService.uptime_percent || 99} onChange={e => setEditingService({ ...editingService, uptime_percent: +e.target.value })} />
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">मासिक प्रयोगकर्ता</label>
                  <input className="it-form-input" type="number" value={editingService.monthly_users || 0} onChange={e => setEditingService({ ...editingService, monthly_users: +e.target.value })} />
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">अवस्था</label>
                  <select className="it-form-select" value={editingService.status} onChange={e => setEditingService({ ...editingService, status: e.target.value })}>
                    <option>सक्रिय (Active)</option>
                    <option>विकासक्रममा (Under Development)</option>
                    <option>मर्मतमा (Under Maintenance)</option>
                    <option>स्थगित (Inactive)</option>
                  </select>
                </div>
              </div>
              <div className="it-form-group">
                <label className="it-form-label">कैफियत</label>
                <textarea className="it-form-textarea" value={editingService.remarks || ''} onChange={e => setEditingService({ ...editingService, remarks: e.target.value })} />
              </div>
            </div>
            <div className="it-modal-footer">
              <button className="it-btn it-btn-ghost" onClick={() => setShowEditServiceModal(false)}>रद्द गर्नुहोस्</button>
              <button className="it-btn it-btn-indigo" disabled={updateServiceMutation.isPending} onClick={() => updateServiceMutation.mutate(editingService)}>
                {updateServiceMutation.isPending ? <RefreshCw size={15} /> : <CheckCircle size={15} />} परिवर्तन सुरक्षित गर्नुहोस्
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Cyber Log Modal */}
      {showEditCyberModal && editingCyber && (
        <div className="it-modal-overlay" onClick={() => setShowEditCyberModal(false)}>
          <div className="it-modal" onClick={e => e.stopPropagation()}>
            <div className="it-modal-header">
              <h2 className="it-modal-title"><Edit2 size={20} /> साइबर सुरक्षा घटना सम्पादन</h2>
              <button className="it-modal-close" onClick={() => setShowEditCyberModal(false)}><X size={16} /></button>
            </div>
            <div className="it-modal-body">
              <div className="it-form-grid-2">
                <div className="it-form-group">
                  <label className="it-form-label">घटना प्रकार *</label>
                  <select className="it-form-select" value={editingCyber.log_type} onChange={e => setEditingCyber({ ...editingCyber, log_type: e.target.value })}>
                    {['Firewall Block', 'Virus Found', 'Unauthorized Access Attempt', 'Phishing Email', 'Data Breach', 'Policy Violation', 'Ransomware', 'Other'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">गम्भीरता</label>
                  <select className="it-form-select" value={editingCyber.severity} onChange={e => setEditingCyber({ ...editingCyber, severity: e.target.value })}>
                    <option>न्यून (Low)</option>
                    <option>मध्यम (Medium)</option>
                    <option>उच्च (High)</option>
                    <option>अत्यावश्यक (Critical)</option>
                  </select>
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">स्रोत IP</label>
                  <input className="it-form-input" value={editingCyber.source_ip || ''} onChange={e => setEditingCyber({ ...editingCyber, source_ip: e.target.value })} />
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">लक्ष्य प्रणाली</label>
                  <input className="it-form-input" value={editingCyber.target_system || ''} onChange={e => setEditingCyber({ ...editingCyber, target_system: e.target.value })} />
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">पत्ता लागेको मिति (BS)</label>
                  <input className="it-form-input" value={editingCyber.detected_at_bs || ''} onChange={e => setEditingCyber({ ...editingCyber, detected_at_bs: e.target.value })} />
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">समाधान अवस्था</label>
                  <select className="it-form-select" value={editingCyber.resolved ? 'true' : 'false'} onChange={e => setEditingCyber({ ...editingCyber, resolved: e.target.value === 'true' })}>
                    <option value="false">विचाराधीन (Unresolved)</option>
                    <option value="true">समाधान भयो (Resolved)</option>
                  </select>
                </div>
              </div>
              <div className="it-form-group">
                <label className="it-form-label">गरिएको कारबाही</label>
                <textarea className="it-form-textarea" value={editingCyber.action_taken || ''} onChange={e => setEditingCyber({ ...editingCyber, action_taken: e.target.value })} />
              </div>
            </div>
            <div className="it-modal-footer">
              <button className="it-btn it-btn-ghost" onClick={() => setShowEditCyberModal(false)}>रद्द गर्नुहोस्</button>
              <button className="it-btn it-btn-rose" disabled={updateCyberMutation.isPending} onClick={() => updateCyberMutation.mutate(editingCyber)}>
                {updateCyberMutation.isPending ? <RefreshCw size={15} /> : <CheckCircle size={15} />} परिवर्तन सुरक्षित गर्नुहोस्
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Budget Modal */}
      {showEditBudgetModal && editingBudget && (
        <div className="it-modal-overlay" onClick={() => setShowEditBudgetModal(false)}>
          <div className="it-modal" onClick={e => e.stopPropagation()}>
            <div className="it-modal-header">
              <h2 className="it-modal-title"><Edit2 size={20} /> बजेट शीर्षक सम्पादन</h2>
              <button className="it-modal-close" onClick={() => setShowEditBudgetModal(false)}><X size={16} /></button>
            </div>
            <div className="it-modal-body">
              <div className="it-form-group">
                <label className="it-form-label">आर्थिक वर्ष *</label>
                <input className="it-form-input" value={editingBudget.fiscal_year} onChange={e => setEditingBudget({ ...editingBudget, fiscal_year: e.target.value })} />
              </div>
              <div className="it-form-group">
                <label className="it-form-label">बजेट शीर्षक *</label>
                <input className="it-form-input" value={editingBudget.head} onChange={e => setEditingBudget({ ...editingBudget, head: e.target.value })} />
              </div>
              <div className="it-form-grid-2">
                <div className="it-form-group">
                  <label className="it-form-label">विनियोजित बजेट (रू) *</label>
                  <input className="it-form-input" type="number" value={editingBudget.budget_allocated} onChange={e => setEditingBudget({ ...editingBudget, budget_allocated: +e.target.value })} />
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">खर्च रकम (रू)</label>
                  <input className="it-form-input" type="number" value={editingBudget.budget_spent} onChange={e => setEditingBudget({ ...editingBudget, budget_spent: +e.target.value })} />
                </div>
              </div>
              <div className="it-form-group">
                <label className="it-form-label">कैफियत</label>
                <textarea className="it-form-textarea" value={editingBudget.remarks || ''} onChange={e => setEditingBudget({ ...editingBudget, remarks: e.target.value })} />
              </div>
            </div>
            <div className="it-modal-footer">
              <button className="it-btn it-btn-ghost" onClick={() => setShowEditBudgetModal(false)}>रद्द गर्नुहोस्</button>
              <button className="it-btn it-btn-emerald" disabled={updateBudgetMutation.isPending} onClick={() => updateBudgetMutation.mutate(editingBudget)}>
                {updateBudgetMutation.isPending ? <RefreshCw size={15} /> : <CheckCircle size={15} />} परिवर्तन सुरक्षित गर्नुहोस्
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Staff Modal */}
      {showEditStaffModal && editingStaff && (
        <div className="it-modal-overlay" onClick={() => setShowEditStaffModal(false)}>
          <div className="it-modal it-modal-lg" onClick={e => e.stopPropagation()}>
            <div className="it-modal-header">
              <h2 className="it-modal-title"><Edit2 size={20} /> कर्मचारी विवरण सम्पादन: {editingStaff.name}</h2>
              <button className="it-modal-close" onClick={() => setShowEditStaffModal(false)}><X size={16} /></button>
            </div>
            <div className="it-modal-body">
              <div className="it-form-grid-2">
                <div className="it-form-group">
                  <label className="it-form-label">कर्मचारीको नाम *</label>
                  <input className="it-form-input" value={editingStaff.name} onChange={e => setEditingStaff({ ...editingStaff, name: e.target.value })} />
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">पद / पदनाम *</label>
                  <input className="it-form-input" value={editingStaff.designation} onChange={e => setEditingStaff({ ...editingStaff, designation: e.target.value })} />
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">तह / श्रेणी</label>
                  <input className="it-form-input" value={editingStaff.level} onChange={e => setEditingStaff({ ...editingStaff, level: e.target.value })} />
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">शैक्षिक योग्यता</label>
                  <input className="it-form-input" value={editingStaff.qualifications} onChange={e => setEditingStaff({ ...editingStaff, qualifications: e.target.value })} />
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">सम्पर्क फोन</label>
                  <input className="it-form-input" value={editingStaff.phone} onChange={e => setEditingStaff({ ...editingStaff, phone: e.target.value })} />
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">इमेल ठेगाना</label>
                  <input className="it-form-input" value={editingStaff.email} onChange={e => setEditingStaff({ ...editingStaff, email: e.target.value })} />
                </div>
                <div className="it-form-group">
                  <label className="it-form-label">नियुक्ति मिति (BS)</label>
                  <input className="it-form-input" value={editingStaff.join_date_bs} onChange={e => setEditingStaff({ ...editingStaff, join_date_bs: e.target.value })} />
                </div>
              </div>
              <div className="it-form-group">
                <label className="it-form-label">जिम्मेवारीहरू (अल्पविराम ',' ले छुट्याउनुहोस्)</label>
                <textarea
                  className="it-form-textarea"
                  value={Array.isArray(editingStaff.responsibilities) ? editingStaff.responsibilities.join(', ') : editingStaff.responsibilities}
                  onChange={e => setEditingStaff({ ...editingStaff, responsibilities: e.target.value.split(',').map((s: string) => s.trim()) })}
                />
              </div>
            </div>
            <div className="it-modal-footer">
              <button className="it-btn it-btn-ghost" onClick={() => setShowEditStaffModal(false)}>रद्द गर्नुहोस्</button>
              <button
                className="it-btn it-btn-cyan"
                disabled={updateStaffMutation.isPending}
                onClick={() => updateStaffMutation.mutate({
                  ...editingStaff,
                  responsibilities: Array.isArray(editingStaff.responsibilities)
                    ? editingStaff.responsibilities
                    : String(editingStaff.responsibilities).split(',').map((r: string) => r.trim()).filter(Boolean)
                })}
              >
                {updateStaffMutation.isPending ? <RefreshCw size={15} /> : <CheckCircle size={15} />} परिवर्तन सुरक्षित गर्नुहोस्
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ITBranchPage;
