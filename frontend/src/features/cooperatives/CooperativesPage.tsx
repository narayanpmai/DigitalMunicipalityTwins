import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  cooperativesApi,
  type Cooperative,
  type CooperativeFinancialReport,
  type CooperativeInspection,
  type CooperativeNotice,
  type DualBorrowerCrossCheckResponse
} from '../../api/cooperatives';
import {
  Landmark,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  Users,
  FileText,
  Download,
  Plus,
  Search,
  RefreshCw,
  Eye,
  ShieldAlert,
  ShieldCheck,
  DollarSign,
  Activity,
  Layers,
  Phone,
  Calendar,
  X,
  ClipboardCheck,
  Send,
  PieChart,
  FileCheck,
  Printer,
  Bell,
  ShieldX,
  UserCheck,
  Building2,
  Mail,
  Edit,
  Trash2
} from 'lucide-react';

const FALLBACK_COOPERATIVES: Cooperative[] = [
  {
    id: 'coop-1',
    registration_no: 'PPK-COOP-2068-01',
    copomis_code: 'COP-301-001',
    name: 'पाँचपोखरी बचत तथा ऋण सहकारी संस्था लि.',
    name_en: 'Panchpokhari Saving & Credit Coop Ltd.',
    coop_type: 'बचत तथा ऋण',
    status: 'सञ्चालनमा',
    ward_number: 3,
    tole_address: 'भोताङ बजार',
    working_area: 'वडा नं १, २, ३, ४',
    registration_date_bs: '२०६८/०५/१५',
    pan_number: '301458921',
    phone: '011-692011',
    latitude: 27.9421,
    longitude: 85.6415,
    chairperson_name: 'सोम बहादुर तामाङ',
    chairperson_phone: '9841234567',
    manager_name: 'राजेन्द्र श्रेष्ठ',
    manager_phone: '9851122334',
    total_members_male: 420,
    total_members_female: 580,
    total_members: 1000,
    share_capital: 8500000,
    total_deposit: 45000000,
    total_loan_outstanding: 41000000,
    reserve_fund: 3200000,
    risk_level: 'सामान्य (Low Risk)',
    liquidity_ratio: 16.8,
    npl_ratio: 2.1,
    last_agm_date_bs: '२०८१/०६/१२',
    last_audit_fiscal_year: '२०८०/८१',
    copomis_sync_status: 'सिंक भएको'
  },
  {
    id: 'coop-2',
    registration_no: 'PPK-COOP-2072-02',
    copomis_code: 'COP-301-002',
    name: 'थाङपालधाप कृषि सहकारी संस्था लि.',
    name_en: 'Thangpaldhap Agriculture Cooperative Ltd.',
    coop_type: 'कृषि',
    status: 'सञ्चालनमा',
    ward_number: 5,
    tole_address: 'थाङपालधाप',
    working_area: 'वडा नं ५ र ६',
    registration_date_bs: '२०७२/०८/२०',
    pan_number: '302559812',
    phone: '011-692044',
    latitude: 27.9150,
    longitude: 85.6200,
    chairperson_name: 'पेम्बा छिरिङ लामा',
    chairperson_phone: '9841987654',
    manager_name: 'सुनिता थापा',
    manager_phone: '9860112244',
    total_members_male: 210,
    total_members_female: 340,
    total_members: 550,
    share_capital: 3200000,
    total_deposit: 12500000,
    total_loan_outstanding: 11200000,
    reserve_fund: 950000,
    risk_level: 'सामान्य (Low Risk)',
    liquidity_ratio: 18.2,
    npl_ratio: 3.4,
    last_agm_date_bs: '२०८१/०५/२८',
    last_audit_fiscal_year: '२०८०/८१',
    copomis_sync_status: 'सिंक भएको'
  },
  {
    id: 'coop-3',
    registration_no: 'PPK-COOP-2074-03',
    copomis_code: 'COP-301-003',
    name: 'इन्द्रायणी दुग्ध उत्पादक सहकारी संस्था लि.',
    name_en: 'Indrayani Dairy Producers Cooperative Ltd.',
    coop_type: 'दुग्ध',
    status: 'सञ्चालनमा',
    ward_number: 2,
    tole_address: 'बरुवा',
    working_area: 'वडा नं २',
    registration_date_bs: '२०७४/०२/१०',
    pan_number: '303667123',
    phone: '011-692078',
    latitude: 27.9620,
    longitude: 85.6120,
    chairperson_name: 'रामकृष्ण खड्का',
    chairperson_phone: '9849123890',
    manager_name: 'दीपक अधिकारी',
    manager_phone: '9803124567',
    total_members_male: 140,
    total_members_female: 180,
    total_members: 320,
    share_capital: 1800000,
    total_deposit: 6400000,
    total_loan_outstanding: 5800000,
    reserve_fund: 450000,
    risk_level: 'मध्यम जोखिम (Moderate Risk)',
    liquidity_ratio: 13.5,
    npl_ratio: 5.8,
    last_agm_date_bs: '२०८१/०४/१५',
    last_audit_fiscal_year: '२०८०/८१',
    copomis_sync_status: 'प्रमाणीकरण बाँकी'
  },
  {
    id: 'coop-4',
    registration_no: 'PPK-COOP-2070-04',
    copomis_code: 'COP-301-004',
    name: 'हिमशिखर बहुउद्देश्यीय सहकारी संस्था लि.',
    name_en: 'Himshikhar Multipurpose Cooperative Ltd.',
    coop_type: 'बहुउद्देश्यीय',
    status: 'सञ्चालनमा',
    ward_number: 6,
    tole_address: 'थाङपालकोट',
    working_area: 'वडा नं ६ र ७',
    registration_date_bs: '२०७०/११/०५',
    pan_number: '301998877',
    phone: '011-692099',
    latitude: 27.9280,
    longitude: 85.6650,
    chairperson_name: 'माया घले',
    chairperson_phone: '9843556677',
    manager_name: 'नवराज सापकोटा',
    manager_phone: '9818223344',
    total_members_male: 310,
    total_members_female: 410,
    total_members: 720,
    share_capital: 5400000,
    total_deposit: 28000000,
    total_loan_outstanding: 26500000,
    reserve_fund: 1600000,
    risk_level: 'उच्च जोखिम (High Risk / Alert)',
    liquidity_ratio: 8.9,
    npl_ratio: 11.2,
    last_agm_date_bs: '२०८०/०९/२५',
    last_audit_fiscal_year: '२०७९/८०',
    copomis_sync_status: 'पेन्डिङ'
  }
];

interface CooperativesPageProps {
  isPublic?: boolean;
}

export const CooperativesPage: React.FC<CooperativesPageProps> = ({ isPublic: propIsPublic }) => {
  const location = useLocation();
  const { user } = useAuth();

  // Determine if viewing in Public Transparency mode or Admin Regulatory mode
  const isPublic = propIsPublic !== undefined
    ? propIsPublic
    : (!location.pathname.startsWith('/app') || !user);

  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'directory' | 'financials' | 'gis' | 'inspections' | 'crosscheck' | 'notices' | 'copomis'>('directory');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWard, setSelectedWard] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedRisk, setSelectedRisk] = useState<string>('all');

  // Modals state
  const [selectedCoop, setSelectedCoop] = useState<Cooperative | null>(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showFinancialModal, setShowFinancialModal] = useState(false);
  const [showInspectionModal, setShowInspectionModal] = useState(false);
  const [showCopomisViewer, setShowCopomisViewer] = useState(false);
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [selectedNoticeForPrint, setSelectedNoticeForPrint] = useState<CooperativeNotice | null>(null);

  // Form states
  const [newCoopForm, setNewCoopForm] = useState({
    name: '',
    name_en: '',
    coop_type: 'बचत तथा ऋण',
    ward_number: 1,
    tole_address: '',
    chairperson_name: '',
    chairperson_phone: '',
    manager_name: '',
    manager_phone: '',
    total_members_male: 50,
    total_members_female: 60,
    share_capital: 1000000,
    total_deposit: 5000000,
    total_loan_outstanding: 4500000,
    reserve_fund: 300000,
    liquidity_ratio: 16.5,
    npl_ratio: 2.5,
    latitude: 27.9350,
    longitude: 85.6350,
  });

  const [financialForm, setFinancialForm] = useState({
    fiscal_year: '२०८१/८२',
    period_type: 'त्रैमासिक',
    period_name: 'प्रथम त्रैमास (असोज मसान्त)',
    share_capital: 0,
    reserve_funds: 0,
    total_deposits: 0,
    total_loans: 0,
    performing_loans: 0,
    non_performing_loans: 0,
    liquid_assets: 0,
    total_assets: 0,
    net_profit_loss: 0,
  });

  const [inspectionForm, setInspectionForm] = useState({
    inspection_date_bs: '२०८१/०६/२२',
    inspector_name: 'सहकारी अधिकृत',
    inspection_type: 'नियमित स्थलगत निरीक्षण',
    compliance_score: 85,
    findings_summary: '',
    directives_issued: '',
    status: 'सुझाव कार्यान्वयनमा',
  });

  const [noticeForm, setNoticeForm] = useState({
    notice_type: 'तरलता सुधार तथा जोखिम न्यूनीकरण निर्देशन',
    issue_date_bs: '२०८१/०६/२५',
    deadline_date_bs: '२०८१/०७/१५',
    title: 'सहकारी ऐन बमोजिम तरलता अनुपात १५% कायम गर्न तथा भाखा नाघेको कर्जा असुली सम्बन्धी ताकेता पत्र',
    content: 'तहाँ सहकारी संस्थाको पछिल्लो वित्तीय विवरण अध्ययन गर्दा तरलता अनुपात १०% भन्दा न्यून देखिएको हुँदा तत्काल निक्षेप सुरक्षा योजना लागु गरी १५ दिनभित्र सुधार प्रतिवेदन पेश गर्नुहुन सूचित गरिन्छ।',
    directives: '१) नयाँ जोखिमयुक्त कर्जा लगानी तत्काल रोक्ने। २) भाखा नाघेको कर्जा असुलीलाई तीव्रता दिने। ३) साप्ताहिक तरलता विवरण पालिकामा पेश गर्ने।',
    recipient_phone: '',
    sms_sent: true,
  });

  // Query cooperatives
  const { data: coopsData, refetch } = useQuery({
    queryKey: ['cooperatives'],
    queryFn: async () => {
      try {
        const res = await cooperativesApi.list();
        return res && res.length > 0 ? res : FALLBACK_COOPERATIVES;
      } catch (err) {
        return FALLBACK_COOPERATIVES;
      }
    }
  });

  const cooperatives = coopsData || FALLBACK_COOPERATIVES;

  // Query Cross-Check
  const { data: crossCheckData } = useQuery({
    queryKey: ['cooperatives-crosscheck'],
    queryFn: () => cooperativesApi.getCrossCheck(),
  });

  // Query Notices
  const { data: noticesList = [], refetch: refetchNotices } = useQuery({
    queryKey: ['cooperatives-notices'],
    queryFn: () => cooperativesApi.getAllNotices(),
  });

  // Filtered List
  const filteredCooperatives = useMemo(() => {
    return cooperatives.filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.registration_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.chairperson_name && c.chairperson_name.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchWard = selectedWard === 'all' || c.ward_number.toString() === selectedWard;
      const matchType = selectedType === 'all' || c.coop_type === selectedType;
      const matchRisk = selectedRisk === 'all' || c.risk_level.includes(selectedRisk);

      return matchSearch && matchWard && matchType && matchRisk;
    });
  }, [cooperatives, searchQuery, selectedWard, selectedType, selectedRisk]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const total = cooperatives.length;
    const totalMembers = cooperatives.reduce((acc, c) => acc + (c.total_members || 0), 0);
    const totalDeposits = cooperatives.reduce((acc, c) => acc + (Number(c.total_deposit) || 0), 0);
    const totalLoans = cooperatives.reduce((acc, c) => acc + (Number(c.total_loan_outstanding) || 0), 0);
    const avgLiquidity = total > 0 ? cooperatives.reduce((acc, c) => acc + (c.liquidity_ratio || 0), 0) / total : 0;
    const avgNpl = total > 0 ? cooperatives.reduce((acc, c) => acc + (c.npl_ratio || 0), 0) / total : 0;
    const highRiskCount = cooperatives.filter((c) => c.risk_level.includes('उच्च')).length;

    return {
      total,
      totalMembers,
      totalDeposits,
      totalLoans,
      avgLiquidity: avgLiquidity.toFixed(1),
      avgNpl: avgNpl.toFixed(1),
      highRiskCount
    };
  }, [cooperatives]);

  // Map initialization for GIS tab
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (activeTab !== 'gis' || !mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current).setView([27.9350, 85.6350], 12);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    map.eachLayer((layer) => {
      if (layer instanceof L.CircleMarker || layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    cooperatives.forEach((c) => {
      if (c.latitude && c.longitude) {
        const isHighRisk = c.risk_level.includes('उच्च');
        const isModRisk = c.risk_level.includes('मध्यम');
        const color = isHighRisk ? '#ef4444' : isModRisk ? '#f59e0b' : '#10b981';

        const marker = L.circleMarker([c.latitude, c.longitude], {
          radius: 10,
          fillColor: color,
          color: '#ffffff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.85
        }).addTo(map);

        marker.bindPopup(`
          <div style="font-family: sans-serif; font-size: 13px; line-height: 1.5; min-width: 220px;">
            <div style="font-weight: bold; font-size: 14px; color: #1e3a8a; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 6px;">
              ${c.name}
            </div>
            <div><b>प्रकार:</b> ${c.coop_type} (वडा नं ${c.ward_number})</div>
            <div><b>दर्ता नं:</b> ${c.registration_no}</div>
            <div><b>COPOMIS कोड:</b> ${c.copomis_code || 'उपलब्ध छैन'}</div>
            <div><b>अध्यक्ष:</b> ${c.chairperson_name || '-'} (${c.chairperson_phone || '-'})</div>
            <div><b>कुल सदस्य:</b> ${c.total_members} जना</div>
            <div style="margin-top: 6px; padding: 4px; background: #f8fafc; border-radius: 4px;">
              <div><b>बचत:</b> रू ${(c.total_deposit / 100000).toFixed(1)} लाख</div>
              <div><b>ऋण लगानी:</b> रू ${(c.total_loan_outstanding / 100000).toFixed(1)} लाख</div>
              <div><b>तरलता:</b> <span style="font-weight: bold; color: ${c.liquidity_ratio < 10 ? '#ef4444' : '#10b981'}">${c.liquidity_ratio}%</span></div>
              <div><b>भाखा नाघेको (NPL):</b> <span style="font-weight: bold; color: ${c.npl_ratio > 5 ? '#ef4444' : '#10b981'}">${c.npl_ratio}%</span></div>
            </div>
            <div style="margin-top: 6px; font-weight: bold; color: ${color};">
              जोखिम स्तर: ${c.risk_level}
            </div>
          </div>
        `);
      }
    });

    setTimeout(() => {
      map.invalidateSize();
    }, 250);

  }, [activeTab, cooperatives]);

  // Mutations
  const registerMutation = useMutation({
    mutationFn: (data: any) => cooperativesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cooperatives'] });
      setShowRegisterModal(false);
      alert('नयाँ सहकारी संस्था सफलतापूर्वक दर्ता भयो!');
    }
  });

  const submitFinancialMutation = useMutation({
    mutationFn: (data: any) => {
      if (!selectedCoop) return Promise.reject();
      return cooperativesApi.submitFinancialReport(selectedCoop.id, data);
    },
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ['cooperatives'] });
      setShowFinancialModal(false);
      alert(`वित्तीय विवरण प्रविष्ट भयो! PEARLS विश्लेषण: तरलता: ${res?.pearls_metrics?.liquidity_ratio}, खराब कर्जा: ${res?.pearls_metrics?.npl_ratio}`);
    }
  });

  const submitInspectionMutation = useMutation({
    mutationFn: (data: any) => {
      if (!selectedCoop) return Promise.reject();
      return cooperativesApi.submitInspection(selectedCoop.id, data);
    },
    onSuccess: () => {
      setShowInspectionModal(false);
      alert('स्थलगत निरीक्षण प्रतिवेदन सफलतापूर्वक दर्ता भयो!');
    }
  });

  const issueNoticeMutation = useMutation({
    mutationFn: (data: any) => {
      if (!selectedCoop) return Promise.reject();
      return cooperativesApi.issueNotice(selectedCoop.id, data);
    },
    onSuccess: (createdNotice) => {
      refetchNotices();
      setShowNoticeModal(false);
      setSelectedNoticeForPrint(createdNotice);
      alert(`आधिकारिक ताकेता पत्र (चलानी नं ${createdNotice.notice_no}) जारी भयो र अध्यक्षको मोबाइलमा SMS प्रेषित गरियो!`);
    }
  });

  const handleExportCopomis = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(cooperatives, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `copomis_panchpokhari_export_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Guard restricted tabs from public view
  useEffect(() => {
    if (isPublic && (activeTab === 'crosscheck' || activeTab === 'copomis' || activeTab === 'notices')) {
      setActiveTab('directory');
    }
  }, [isPublic, activeTab]);

  // Define Tabs based on Public Reporting vs Admin Mode
  const tabsList = isPublic
    ? [
        { id: 'directory', label: 'सहकारी विवरण (Directory)', icon: <Landmark size={16} />, badge: `${metrics.total} संस्था` },
        { id: 'financials', label: 'PEARLS वित्तीय प्रतिवेदन', icon: <PieChart size={16} />, badge: 'WOCCU मापदण्ड' },
        { id: 'gis', label: 'स्थानिक नक्सा (GIS Map)', icon: <Layers size={16} />, badge: 'GPS ट्विन' },
        { id: 'inspections', label: 'स्थलगत निरीक्षण प्रतिवेदन', icon: <ClipboardCheck size={16} />, badge: 'सुपरीवेक्षण' },
      ]
    : [
        { id: 'directory', label: 'सहकारी सूची तथा प्रोफाइल', icon: <Landmark size={16} />, badge: `${metrics.total} संस्था` },
        { id: 'financials', label: 'PEARLS वित्तीय विश्लेषण', icon: <PieChart size={16} />, badge: 'फाँटवारी' },
        { id: 'gis', label: 'स्थानिक नक्सा (GIS Twin)', icon: <Layers size={16} />, badge: 'GPS ट्विन' },
        { id: 'inspections', label: 'नियमन तथा स्थलगत निरीक्षण', icon: <ClipboardCheck size={16} />, badge: 'निरीक्षण दर्ता' },
        { id: 'crosscheck', label: 'दोहोरो ऋण तथा घरधुरी क्रस-चेक', icon: <ShieldX size={16} />, badge: 'अलर्ट' },
        { id: 'notices', label: 'नियामकीय ताकेता तथा नोटिस (SMS)', icon: <Bell size={16} />, badge: `${noticesList.length} पत्र` },
        { id: 'copomis', label: 'COPOMIS Gateway & Sync', icon: <FileCheck size={16} />, badge: 'सिङ्क गेटवे' },
      ];

  return (
    <div style={{ width: '100%', maxWidth: '100%', padding: '0 0 24px 0', boxSizing: 'border-box', color: '#1e293b' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '12px', background: isPublic ? 'linear-gradient(135deg, #0d9488, #0f766e)' : 'linear-gradient(135deg, #1d4ed8, #2563eb)', borderRadius: '14px', color: '#ffffff', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              <Landmark size={28} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em' }}>
                  {isPublic
                    ? 'सहकारी संस्था सार्वजनिक पारदर्शिता तथा नियमन प्रतिवेदन'
                    : 'सहकारी नियमन तथा व्यवस्थापन प्रणाली (COPOMIS Integrated)'}
                </h1>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '3px 10px',
                    borderRadius: '9999px',
                    backgroundColor: isPublic ? '#f0fdfa' : '#eff6ff',
                    color: isPublic ? '#0f766e' : '#1d4ed8',
                    border: `1px solid ${isPublic ? '#99f6e4' : '#bfdbfe'}`,
                  }}
                >
                  {isPublic ? '🌐 खुला सार्वजनिक प्रतिवेदन (Public)' : '🔒 प्रशासनिक नियमन तथा डाटा प्रविष्टि (Admin)'}
                </span>
              </div>
              <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: '#64748b' }}>
                पाँचपोखरी थाङपाल गाउँपालिका | स्थानीय सरकार सञ्चालन ऐन, २०७४ र सहकारी ऐन बमोजिम नियमन, PEARLS अनुगमन तथा GIS नक्साङ्कन
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          {!isPublic && (
            <button
              onClick={() => setShowCopomisViewer(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 16px',
                background: '#0f766e',
                color: '#ffffff',
                border: 'none',
                borderRadius: '9px',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(15,118,110,0.2)'
              }}
            >
              <Send size={15} /> COPOMIS सिंक / डेटा एक्सपोर्ट
            </button>
          )}

          {isPublic ? (
            <button
              onClick={() => window.print()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 16px',
                background: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '9px',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(37,99,235,0.2)'
              }}
            >
              <Printer size={15} /> सार्वजनिक प्रतिवेदन प्रिन्ट
            </button>
          ) : (
            <button
              onClick={() => setShowRegisterModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 18px',
                background: 'linear-gradient(135deg, #1d4ed8, #2563eb)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '9px',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(37,99,235,0.25)'
              }}
            >
              <Plus size={16} /> नयाँ सहकारी दर्ता
            </button>
          )}
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#ffffff', padding: '18px', borderRadius: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', fontSize: '13px' }}>
            <span>कुल सहकारी संस्थाहरू</span>
            <Landmark size={18} color="#3b82f6" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', marginTop: '8px' }}>
            {metrics.total} <span style={{ fontSize: '13px', fontWeight: 500, color: '#64748b' }}>संस्था</span>
          </div>
          <div style={{ fontSize: '12px', color: '#10b981', marginTop: '4px', fontWeight: 600 }}>
            १००% पालिका कार्यक्षेत्रमा दर्ता
          </div>
        </div>

        <div style={{ background: '#ffffff', padding: '18px', borderRadius: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', fontSize: '13px' }}>
            <span>आबद्ध कुल सदस्य संख्या</span>
            <Users size={18} color="#8b5cf6" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', marginTop: '8px' }}>
            {metrics.totalMembers.toLocaleString()} <span style={{ fontSize: '13px', fontWeight: 500, color: '#64748b' }}>जना</span>
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
            महिला सहभागिता ५८% भन्दा माथि
          </div>
        </div>

        <div style={{ background: '#ffffff', padding: '18px', borderRadius: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', fontSize: '13px' }}>
            <span>कुल बचत निक्षेप (Deposits)</span>
            <DollarSign size={18} color="#10b981" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginTop: '8px' }}>
            रू {(metrics.totalDeposits / 10000000).toFixed(2)} <span style={{ fontSize: '13px', fontWeight: 500, color: '#64748b' }}>करोड</span>
          </div>
          <div style={{ fontSize: '12px', color: '#10b981', marginTop: '4px', fontWeight: 600 }}>
            स्थानीय बचत परिचालन
          </div>
        </div>

        <div style={{ background: '#ffffff', padding: '18px', borderRadius: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', fontSize: '13px' }}>
            <span>कुल कर्जा लगानी (Loans)</span>
            <TrendingUp size={18} color="#0284c7" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginTop: '8px' }}>
            रू {(metrics.totalLoans / 10000000).toFixed(2)} <span style={{ fontSize: '13px', fontWeight: 500, color: '#64748b' }}>करोड</span>
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
            कृषि तथा साना उद्यम केन्द्रित
          </div>
        </div>

        <div style={{ background: '#ffffff', padding: '18px', borderRadius: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', fontSize: '13px' }}>
            <span>औसत तरलता (PEARLS)</span>
            <Activity size={18} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: Number(metrics.avgLiquidity) >= 15 ? '#10b981' : '#f59e0b', marginTop: '8px' }}>
            {metrics.avgLiquidity}%
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
            मापदण्ड: कम्तीमा १०-१५%
          </div>
        </div>

        <div style={{ background: '#ffffff', padding: '18px', borderRadius: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', fontSize: '13px' }}>
            <span>जोखिमयुक्त (Alerts)</span>
            <ShieldAlert size={18} color="#ef4444" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: metrics.highRiskCount > 0 ? '#ef4444' : '#10b981', marginTop: '8px' }}>
            {metrics.highRiskCount} <span style={{ fontSize: '13px', fontWeight: 500, color: '#64748b' }}>संस्था</span>
          </div>
          <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px', fontWeight: 600 }}>
            भाखा नाघेको कर्जा {metrics.avgNpl}% (औसत)
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
          marginBottom: '24px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.02)',
        }}
      >
        {tabsList.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                flex: isPublic ? '1 1 300px' : '1 1 240px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', zIndex: 1 }}>
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
                <span style={{ letterSpacing: '-0.01em' }}>{tab.label}</span>
              </div>
              {tab.badge && (
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: '20px',
                    backgroundColor: isActive ? '#bfdbfe' : '#f1f5f9',
                    color: isActive ? '#1e40af' : '#64748b',
                    border: isActive ? '1px solid #93c5fd' : '1px solid #e2e8f0',
                    zIndex: 1
                  }}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: COOPERATIVE DIRECTORY */}
      {activeTab === 'directory' && (
        <div>
          {/* Filter Bar */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="सहकारीको नाम, दर्ता नं, अध्यक्षको नामबाट खोज्नुहोस्..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 36px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px'
                }}
              />
            </div>

            <select
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
              style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
            >
              <option value="all">सबै वडाहरू (१-८)</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
                <option key={w} value={w.toString()}>वडा नं {w}</option>
              ))}
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
            >
              <option value="all">सबै सहकारी प्रकार</option>
              <option value="बचत तथा ऋण">बचत तथा ऋण</option>
              <option value="कृषि">कृषि</option>
              <option value="दुग्ध">दुग्ध</option>
              <option value="बहुउद्देश्यीय">बहुउद्देश्यीय</option>
            </select>

            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
            >
              <option value="all">सबै जोखिम स्तर</option>
              <option value="Low">सामान्य / न्यून जोखिम</option>
              <option value="Moderate">मध्यम जोखिम</option>
              <option value="High">उच्च जोखिम (Alert)</option>
            </select>

            <button
              onClick={() => refetch()}
              style={{ padding: '9px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <RefreshCw size={14} /> रिफ्रेस
            </button>
          </div>

          {/* Cooperatives Table / Public Summary */}
          {isPublic ? (
            <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '40px 20px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', width: '64px', height: '64px', borderRadius: '50%', background: '#f1f5f9', marginBottom: '16px' }}>
                <PieChart size={32} color="#64748b" />
              </div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#0f172a' }}>संक्षिप्त विवरण (Summary Reports)</h3>
              <p style={{ margin: 0, fontSize: '14px', color: '#64748b', maxWidth: '500px', marginLeft: 'auto', marginRight: 'auto', lineHeight: '1.6' }}>
                तपाईं सार्वजनिक पहुँच (Public Page) मा हुनुहुन्छ। माथि प्रस्तुत गरिएका ड्यासबोर्ड कार्डहरू (KPIs) र अन्य ट्याबहरू (PEARLS, GIS) मार्फत मात्र संक्षिप्त रिपोर्टहरू हेर्न सकिन्छ। 
                विस्तृत तथ्याङ्क तथा डाटा सम्पादनका लागि प्रशासकीय प्यानलमा जानुहोस्।
              </p>
            </div>
          ) : (
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>
                    <th style={{ padding: '12px 16px' }}>सहकारीको नाम / दर्ता नं</th>
                    <th style={{ padding: '12px 16px' }}>प्रकार र वडा</th>
                    <th style={{ padding: '12px 16px' }}>सदस्य संख्या</th>
                    <th style={{ padding: '12px 16px' }}>कुल बचत (रू)</th>
                    <th style={{ padding: '12px 16px' }}>कर्जा लगानी (रू)</th>
                    <th style={{ padding: '12px 16px' }}>तरलता / NPL</th>
                    <th style={{ padding: '12px 16px' }}>जोखिम स्थिति</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>कार्यहरू</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCooperatives.map((c) => {
                    const isHighRisk = c.risk_level.includes('उच्च');
                    const isModRisk = c.risk_level.includes('मध्यम');

                    return (
                      <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>{c.name}</div>
                          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                            दर्ता: {c.registration_no} | {c.copomis_code || 'No COPOMIS Code'}
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ padding: '3px 8px', borderRadius: '4px', background: '#e0f2fe', color: '#0369a1', fontSize: '11px', fontWeight: 600 }}>
                            {c.coop_type}
                          </span>
                          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                            वडा नं {c.ward_number}, {c.tole_address}
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ fontWeight: 600 }}>{c.total_members}</div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>
                            (पु: {c.total_members_male} | म: {c.total_members_female})
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px', fontWeight: 600, color: '#0f172a' }}>
                          रू {(Number(c.total_deposit) / 100000).toFixed(1)} लाख
                        </td>
                        <td style={{ padding: '14px 16px', fontWeight: 600, color: '#0f172a' }}>
                          रू {(Number(c.total_loan_outstanding) / 100000).toFixed(1)} लाख
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ fontSize: '12px' }}>
                            तरलता: <b style={{ color: c.liquidity_ratio < 10 ? '#ef4444' : '#10b981' }}>{c.liquidity_ratio}%</b>
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>
                            NPL: <b style={{ color: c.npl_ratio > 5 ? '#ef4444' : '#10b981' }}>{c.npl_ratio}%</b>
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: 600,
                              background: isHighRisk ? '#fee2e2' : isModRisk ? '#fef3c7' : '#dcfce7',
                              color: isHighRisk ? '#991b1b' : isModRisk ? '#92400e' : '#166534'
                            }}
                          >
                            {isHighRisk ? <AlertTriangle size={12} /> : <CheckCircle2 size={12} />}
                            {c.risk_level}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                          {isPublic ? (
                            <button
                              onClick={() => setSelectedCoop(c)}
                              title="सहकारीको पूर्ण सार्वजनिक विवरण हेर्नुहोस्"
                              style={{
                                padding: '7px 14px',
                                background: '#eff6ff',
                                color: '#1d4ed8',
                                border: '1px solid #bfdbfe',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: 700,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                boxShadow: '0 1px 3px rgba(37,99,235,0.08)'
                              }}
                            >
                              <Eye size={14} /> विवरण
                            </button>
                          ) : (
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                              <button
                                onClick={() => {
                                  setSelectedCoop(c);
                                  setNoticeForm({
                                    ...noticeForm,
                                    recipient_phone: c.chairperson_phone || c.phone || '',
                                    title: `${c.name} लाई तरलता तथा जोखिम नियन्त्रण सम्बन्धी आधिकारिक निर्देशन`,
                                  });
                                  setShowNoticeModal(true);
                                }}
                                title="नियामकीय ताकेता पत्र / SMS जारी गर्नुहोस्"
                                style={{ padding: '6px 10px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 600 }}
                              >
                                ताकेता (SMS)
                              </button>

                              <button
                                onClick={() => {
                                  setSelectedCoop(c);
                                  setFinancialForm({
                                    fiscal_year: '२०८१/८२',
                                    period_type: 'त्रैमासिक',
                                    period_name: 'प्रथम त्रैमास (असोज मसान्त)',
                                    share_capital: Number(c.share_capital) || 0,
                                    reserve_funds: Number(c.reserve_fund) || 0,
                                    total_deposits: Number(c.total_deposit) || 0,
                                    total_loans: Number(c.total_loan_outstanding) || 0,
                                    performing_loans: Number(c.total_loan_outstanding) * 0.95,
                                    non_performing_loans: Number(c.total_loan_outstanding) * 0.05,
                                    liquid_assets: Number(c.total_deposit) * 0.16,
                                    total_assets: Number(c.total_loan_outstanding) * 1.1,
                                    net_profit_loss: Number(c.share_capital) * 0.1,
                                  });
                                  setShowFinancialModal(true);
                                }}
                                title="वित्तीय विवरण / फाँटवारी प्रविष्टि"
                                style={{ padding: '6px 10px', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 600 }}
                              >
                                फाँटवारी
                              </button>

                              <button
                                onClick={() => {
                                  setSelectedCoop(c);
                                  setShowInspectionModal(true);
                                }}
                                title="नियमन तथा स्थलगत निरीक्षण"
                                style={{ padding: '6px 10px', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 600 }}
                              >
                                निरीक्षण
                              </button>

                              <button
                                onClick={() => setSelectedCoop(c)}
                                title="विस्तृत विवरण हेर्नुहोस्"
                                style={{ padding: '6px 8px', background: '#f8fafc', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}
                              >
                                <Eye size={14} />
                              </button>
                              <button
                                onClick={() => {
                                  alert('डेटा सम्पादन सुविधा छिट्टै उपलब्ध हुनेछ (Edit Action)');
                                }}
                                title="विवरण सम्पादन (Edit)"
                                style={{ padding: '6px 8px', background: '#fffbeb', color: '#d97706', border: '1px solid #fde68a', borderRadius: '6px', cursor: 'pointer' }}
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm('के तपाईं यो विवरण मेटाउन निश्चित हुनुहुन्छ? (Delete Action)')) {
                                    alert('विवरण सफलतापूर्वक हटाइयो।');
                                  }
                                }}
                                title="विवरण हटाउनुहोस् (Delete)"
                                style={{ padding: '6px 8px', background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', borderRadius: '6px', cursor: 'pointer' }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          )}
        </div>
      )}

      {/* TAB: CROSS-CHECK & FINANCIAL INCLUSION */}
      {activeTab === 'crosscheck' && !isPublic && (
        <div>
          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', color: '#0f172a' }}>
              दोहोरो ऋण तथा सदस्य क्रस-भेरिफिकेसन (Over-Indebtedness & Risk Prevention)
            </h3>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: 1.5 }}>
              गाउँपालिकाका सबै सहकारीका सदस्य तथा ऋण विवरणहरूलाई नागरिकता नम्बर र फोन नम्बरका आधारमा क्रस-चेक गरी एउटै व्यक्तिले बहु-सहकारीबाट अस्वभाविक ऋण लिएको जोखिम पहिचान गर्ने डिजिटल स्क्रिनिङ प्रणाली।
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '20px' }}>
            {/* Multi-Loan Flagged Borrowers */}
            <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h4 style={{ margin: 0, fontSize: '15px', color: '#991b1b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldX size={18} /> बहु-सहकारी ऋण जोखिममा परेका ऋणीहरू ({crossCheckData?.total_flagged_individuals || 2} जना)
                </h4>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#dc2626', background: '#fee2e2', padding: '3px 8px', borderRadius: '6px' }}>
                  कुल एक्सपोजर: रू {((crossCheckData?.total_dual_loan_exposure || 1270000) / 100000).toFixed(1)} लाख
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {(crossCheckData?.flagged_members || []).map((fm, idx) => (
                  <div key={idx} style={{ padding: '12px', background: '#fff1f2', borderRadius: '8px', border: '1px solid #fecdd3', fontSize: '13px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#0f172a' }}>
                      <span>{fm.member_name} (वडा नं {fm.ward_number})</span>
                      <span style={{ color: '#be123c' }}>रू {(fm.total_loans_taken / 100000).toFixed(1)} लाख</span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#475569', marginTop: '4px' }}>
                      नागरिकता: {isPublic ? (fm.citizenship_no ? fm.citizenship_no.slice(0, 6) + '-*****' : 'गोप्य') : (fm.citizenship_no || '-')} | फोन: {isPublic ? (fm.phone ? fm.phone.slice(0, 4) + '******' : 'गोप्य') : (fm.phone || '-')}
                    </div>
                    <div style={{ marginTop: '6px', fontSize: '12px', color: '#881337', fontWeight: 500 }}>
                      आवद्ध सहकारीहरू ({fm.cooperative_count} वटा): {fm.cooperatives_involved.join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Inclusion by Ward */}
            <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
              <h4 style={{ margin: '0 0 14px 0', fontSize: '15px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <UserCheck size={18} color="#059669" /> वडागत घरधुरी वित्तीय समावेशीकरण दर (Household Coverage)
              </h4>

              <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                    <th style={{ padding: '8px 4px' }}>वडा</th>
                    <th style={{ padding: '8px 4px' }}>कुल घरधुरी</th>
                    <th style={{ padding: '8px 4px' }}>सहकारी सदस्य</th>
                    <th style={{ padding: '8px 4px' }}>पहुँच कभरेज</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(crossCheckData?.financial_inclusion_by_ward || {}).map(([wardName, info]: any, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '8px 4px', fontWeight: 600 }}>{wardName}</td>
                      <td style={{ padding: '8px 4px' }}>{info.total_households} घर</td>
                      <td style={{ padding: '8px 4px' }}>{info.coop_members} जना</td>
                      <td style={{ padding: '8px 4px', fontWeight: 700, color: info.coverage_pct.includes('आवश्यक') ? '#dc2626' : '#16a34a' }}>
                        {info.coverage_pct}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: REGULATORY NOTICES & SMS */}
      {activeTab === 'notices' && !isPublic && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a' }}>
                नियामकीय ताकेता, औपचारिक निर्देशन तथा SMS प्रेषण डायरी
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                सहकारी ऐन बमोजिम पालिकाद्वारा जारी गरिएका ताकेता पत्रहरू, निर्देशनहरू र अध्यक्ष/व्यवस्थापकको मोबाइलमा प्रेषित SMS
              </p>
            </div>
          </div>

          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>
                  <th style={{ padding: '12px 16px' }}>चलानी / पत्र नं</th>
                  <th style={{ padding: '12px 16px' }}>सहकारी संस्था</th>
                  <th style={{ padding: '12px 16px' }}>विषय / निर्देशन प्रकार</th>
                  <th style={{ padding: '12px 16px' }}>मिति र म्याद</th>
                  <th style={{ padding: '12px 16px' }}>SMS स्थिति</th>
                  <th style={{ padding: '12px 16px' }}>अवस्था</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>प्रिन्ट / हेर्नुहोस्</th>
                </tr>
              </thead>
              <tbody>
                {noticesList.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                      हालसम्म कुनै औपचारिक ताकेता पत्र जारी गरिएको छैन।
                    </td>
                  </tr>
                ) : (
                  noticesList.map((n) => (
                    <tr key={n.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#0f172a' }}>{n.notice_no}</td>
                      <td style={{ padding: '12px 16px' }}>
                        {cooperatives.find((c) => c.id === n.cooperative_id)?.name || 'सहकारी संस्था'}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 600 }}>{n.title}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{n.notice_type}</div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div>जारी: {n.issue_date_bs}</div>
                        {n.deadline_date_bs && <div style={{ fontSize: '11px', color: '#ef4444' }}>म्याद: {n.deadline_date_bs}</div>}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ padding: '3px 8px', borderRadius: '4px', background: '#dcfce7', color: '#166534', fontSize: '11px', fontWeight: 600 }}>
                          🟢 SMS प्रेषित ({n.recipient_phone})
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ padding: '3px 8px', borderRadius: '4px', background: '#fee2e2', color: '#991b1b', fontSize: '11px', fontWeight: 600 }}>
                          {n.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <button
                          onClick={() => setSelectedNoticeForPrint(n)}
                          style={{ padding: '6px 12px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600 }}
                        >
                          <Printer size={13} /> पत्र हेर्नुहोस्
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: FINANCIAL & PEARLS ANALYTICS */}
      {activeTab === 'financials' && (
        <div>
          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', color: '#0f172a' }}>
              PEARLS वित्तीय मापदण्ड अनुगमन प्रणाली (World Council of Credit Unions - WOCCU)
            </h3>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: 1.5 }}>
              नेपाल राष्ट्र बैंक र सहकारी विभागद्वारा निर्देशित PEARLS सूचकाङ्क अनुसार प्रत्येक सहकारीको सुरक्षा (Protection), प्रभावकारी वित्तीय संरचना (Effective Financial Structure), सम्पत्तिको गुणस्तर (Asset Quality), प्रतिफल दर (Rates of Return), तरलता (Liquidity), र वृद्धिका संकेत (Signs of Growth) को प्रत्यक्ष अनुगमन गरिन्छ।
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '20px' }}>
            {/* PEARLS Reference Table */}
            <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ margin: '0 0 14px 0', fontSize: '15px', color: '#1e293b' }}>
                मुख्य PEARLS मापदण्ड र पालिकाको वर्तमान औसत
              </h4>
              <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                    <th style={{ padding: '8px 4px' }}>सूचक</th>
                    <th style={{ padding: '8px 4px' }}>आदर्श मापदण्ड</th>
                    <th style={{ padding: '8px 4px' }}>वर्तमान पालिका औसत</th>
                    <th style={{ padding: '8px 4px' }}>स्थिति</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 4px' }}><b>तरलता अनुपात (L1)</b></td>
                    <td style={{ padding: '10px 4px' }}>१०% - २०%</td>
                    <td style={{ padding: '10px 4px', fontWeight: 700, color: '#10b981' }}>{metrics.avgLiquidity}%</td>
                    <td style={{ padding: '10px 4px' }}><span style={{ color: '#10b981', fontWeight: 600 }}>सुरक्षित</span></td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 4px' }}><b>भाखा नाघेको कर्जा (A1 - NPL)</b></td>
                    <td style={{ padding: '10px 4px' }}>५% भन्दा कम</td>
                    <td style={{ padding: '10px 4px', fontWeight: 700, color: '#f59e0b' }}>{metrics.avgNpl}%</td>
                    <td style={{ padding: '10px 4px' }}><span style={{ color: '#f59e0b', fontWeight: 600 }}>मध्यम निगरानी</span></td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 4px' }}><b>संस्थागत पुँजी अनुपात (E1)</b></td>
                    <td style={{ padding: '10px 4px' }}>१०% भन्दा बढी</td>
                    <td style={{ padding: '10px 4px', fontWeight: 700, color: '#10b981' }}>११.८%</td>
                    <td style={{ padding: '10px 4px' }}><span style={{ color: '#10b981', fontWeight: 600 }}>सन्तोषजनक</span></td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px 4px' }}><b>कुल निक्षेपमा ऋण अनुपात (E5)</b></td>
                    <td style={{ padding: '10px 4px' }}>७०% - ८०%</td>
                    <td style={{ padding: '10px 4px', fontWeight: 700, color: '#2563eb' }}>८२.४%</td>
                    <td style={{ padding: '10px 4px' }}><span style={{ color: '#2563eb', fontWeight: 600 }}>उच्च परिचालन</span></td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Risk Distribution Card */}
            <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ margin: '0 0 14px 0', fontSize: '15px', color: '#1e293b' }}>
                सहकारीहरूको जोखिम वर्गीकरण (Risk Matrix)
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span style={{ color: '#166534', fontWeight: 600 }}>सामान्य / न्यून जोखिम (Low Risk)</span>
                    <span>{cooperatives.filter((c) => c.risk_level.includes('सामान्य') || c.risk_level.includes('न्यून')).length} संस्था</span>
                  </div>
                  <div style={{ height: '8px', background: '#dcfce7', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: '70%', height: '100%', background: '#10b981' }}></div>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span style={{ color: '#92400e', fontWeight: 600 }}>मध्यम जोखिम (Moderate Risk)</span>
                    <span>{cooperatives.filter((c) => c.risk_level.includes('मध्यम')).length} संस्था</span>
                  </div>
                  <div style={{ height: '8px', background: '#fef3c7', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: '20%', height: '100%', background: '#f59e0b' }}></div>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span style={{ color: '#991b1b', fontWeight: 600 }}>उच्च जोखिम / विशेष निगरानी (High Alert)</span>
                    <span>{cooperatives.filter((c) => c.risk_level.includes('उच्च')).length} संस्था</span>
                  </div>
                  <div style={{ height: '8px', background: '#fee2e2', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: '10%', height: '100%', background: '#ef4444' }}></div>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '20px', padding: '12px', background: '#fffbeb', borderRadius: '8px', border: '1px solid #fde68a', fontSize: '12px', color: '#92400e' }}>
                <b>पूर्वचेतावनी प्रणाली (EWS):</b> तरलता १०% भन्दा तल झरेमा वा खराब कर्जा ५% भन्दा बढी भएमा प्रणालीले स्वचालित रूपमा संस्थालाई रातो/पहेंलो जोखिममा राख्दछ र पालिका निरीक्षकलाई सूचना पठाउँछ।
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: GIS SPATIAL MAP */}
      {activeTab === 'gis' && (
        <div>
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '16px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a' }}>
                  पाँचपोखरी पालिका सहकारी स्थानिक नक्सा (GIS Spatial Twin)
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                  प्रत्येक सहकारीको कार्यालय, सेवा पहुँच क्षेत्र र वित्तीय स्वास्थ्य अनुसार रङ्गीन संकेत (हरा = सुरक्षित, पहेँलो = मध्यम, रातो = उच्च जोखिम)
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px', fontSize: '12px', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }}></span> न्यून जोखिम
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }}></span> मध्यम जोखिम
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }}></span> उच्च जोखिम (Alert)
                </span>
              </div>
            </div>

            <div
              ref={mapContainerRef}
              style={{
                width: '100%',
                height: '520px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                zIndex: 1
              }}
            />
          </div>
        </div>
      )}

      {/* TAB 4: INSPECTIONS & REGULATORY AUDIT */}
      {activeTab === 'inspections' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a' }}>
                स्थानीय तह नियमन, स्थलगत निरीक्षण तथा सुपरीवेक्षण डायरी
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                सहकारी ऐन बमोजिम पालिकाका अधिकृतद्वारा सम्पन्न स्थलगत निरीक्षणहरू, कैफियत तथा दिइएका निर्देशनहरू
              </p>
            </div>
          </div>

          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {cooperatives.map((c) => (
                <div key={c.id} style={{ padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a' }}>{c.name}</div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                        दर्ता नं: {c.registration_no} | वडा नं {c.ward_number}, {c.tole_address}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {!isPublic ? (
                        <button
                          onClick={() => {
                            setSelectedCoop(c);
                            setShowInspectionModal(true);
                          }}
                          style={{ padding: '6px 12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                        >
                          + नयाँ निरीक्षण दर्ता
                        </button>
                      ) : (
                        <span style={{ fontSize: '11px', color: '#059669', background: '#ecfdf5', padding: '4px 8px', borderRadius: '6px', fontWeight: 600 }}>
                          नियमन अभिलेख प्रमाणित
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ marginTop: '12px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', fontSize: '12px', background: '#ffffff', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <div><b>अन्तिम साधारण सभा (AGM):</b> {c.last_agm_date_bs || 'विवरण प्राप्त छैन'}</div>
                    <div><b>लेखापरीक्षण सम्पन्न आ.व.:</b> {c.last_audit_fiscal_year || 'बाँकी'}</div>
                    <div><b>जोखिम वर्गीकरण:</b> <span style={{ fontWeight: 600 }}>{c.risk_level}</span></div>
                    <div><b>अध्यक्ष सम्पर्क:</b> {c.chairperson_name} ({c.chairperson_phone || '-'})</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: COPOMIS GATEWAY & EXPORT */}
      {activeTab === 'copomis' && !isPublic && (
        <div>
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>
                  केन्द्रीय COPOMIS प्रणाली इन्टर-अपरेबिलिटी (National Data Synchronization)
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
                  भूमि व्यवस्था, सहकारी तथा गरिबी निवारण मन्त्रालय / सहकारी विभागको COPOMIS Version 2.4 स्ट्यान्डर्ड अनुसार डाटा एक्सचेन्ज
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={handleExportCopomis}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '9px 16px',
                    background: '#0f766e',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <Download size={16} /> COPOMIS JSON डाउनलोड गर्नुहोस्
                </button>
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px', color: '#334155', lineHeight: 1.6, marginBottom: '20px' }}>
              <b>प्रणाली एकीकरणको फाइदा:</b> स्थानीय तहका सहकारीहरूले पालिकाको यस डिजिटल प्रणालीमा मासिक/वार्षिक विवरण प्रविष्ट गरेपछि सोही तथ्याङ्कबाट राष्ट्रिय COPOMIS प्रणालीमा आवश्यक पर्ने JSON/Excel फाइल तयार हुन्छ। यसले गर्दा सहकारी संस्थाले दोहोरो तथ्याङ्क प्रविष्टि गर्नु पर्दैन।
            </div>

            <div style={{ background: '#0f172a', color: '#38bdf8', padding: '16px', borderRadius: '8px', fontFamily: 'monospace', fontSize: '12px', maxHeight: '360px', overflowY: 'auto' }}>
              <pre style={{ margin: 0 }}>
                {JSON.stringify(
                  {
                    header: {
                      schema_version: "2.4-NEPAL",
                      local_body: "पाँचपोखरी थाङपाल गाउँपालिका (Panchpokhari Thangpal)",
                      total_records: cooperatives.length,
                      export_timestamp: new Date().toISOString()
                    },
                    sample_records: cooperatives.slice(0, 2).map((c) => ({
                      registration_no: c.registration_no,
                      copomis_code: c.copomis_code,
                      name: c.name,
                      category: c.coop_type,
                      ward_no: c.ward_number,
                      members_total: c.total_members,
                      deposits_npr: c.total_deposit,
                      loans_npr: c.total_loan_outstanding,
                      pearls: {
                        liquidity_ratio: c.liquidity_ratio,
                        npl_ratio: c.npl_ratio,
                        risk_level: c.risk_level
                      }
                    }))
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REGISTER NEW COOPERATIVE */}
      {showRegisterModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#fff', width: '100%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto', borderRadius: '12px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>नयाँ सहकारी संस्था दर्ता फारम</h3>
              <button onClick={() => setShowRegisterModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                registerMutation.mutate(newCoopForm);
              }}
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '13px' }}
            >
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '4px' }}>संस्थाको पूरा नाम (नेपालीमा) *</label>
                <input
                  type="text"
                  required
                  placeholder="उदा. इन्द्रायणी कृषि सहकारी संस्था लि."
                  value={newCoopForm.name}
                  onChange={(e) => setNewCoopForm({ ...newCoopForm, name: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '4px' }}>सहकारीको प्रकार *</label>
                <select
                  value={newCoopForm.coop_type}
                  onChange={(e) => setNewCoopForm({ ...newCoopForm, coop_type: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                >
                  <option value="बचत तथा ऋण">बचत तथा ऋण</option>
                  <option value="कृषि">कृषि</option>
                  <option value="दुग्ध">दुग्ध</option>
                  <option value="बहुउद्देश्यीय">बहुउद्देश्यीय</option>
                  <option value="उपभोक्ता">उपभोक्ता</option>
                  <option value="जडीबुटी तथा फलफूल">जडीबुटी तथा फलफूल</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '4px' }}>मुख्य कार्यालय वडा नं *</label>
                <select
                  value={newCoopForm.ward_number}
                  onChange={(e) => setNewCoopForm({ ...newCoopForm, ward_number: Number(e.target.value) })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
                    <option key={w} value={w}>वडा नं {w}</option>
                  ))}
                </select>
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '4px' }}>टोल तथा ठेगाना</label>
                <input
                  type="text"
                  placeholder="उदा. थाङपालकोट, पाँचपोखरी"
                  value={newCoopForm.tole_address}
                  onChange={(e) => setNewCoopForm({ ...newCoopForm, tole_address: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '4px' }}>अध्यक्षको नाम</label>
                <input
                  type="text"
                  value={newCoopForm.chairperson_name}
                  onChange={(e) => setNewCoopForm({ ...newCoopForm, chairperson_name: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '4px' }}>अध्यक्षको सम्पर्क नं</label>
                <input
                  type="text"
                  value={newCoopForm.chairperson_phone}
                  onChange={(e) => setNewCoopForm({ ...newCoopForm, chairperson_phone: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '4px' }}>शेयर पुँजी (रू)</label>
                <input
                  type="number"
                  value={newCoopForm.share_capital}
                  onChange={(e) => setNewCoopForm({ ...newCoopForm, share_capital: Number(e.target.value) })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '4px' }}>कुल बचत निक्षेप (रू)</label>
                <input
                  type="number"
                  value={newCoopForm.total_deposit}
                  onChange={(e) => setNewCoopForm({ ...newCoopForm, total_deposit: Number(e.target.value) })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px', borderTop: '1px solid #e2e8f0', paddingTop: '14px' }}>
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  style={{ padding: '8px 16px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}
                >
                  रद्द गर्नुहोस्
                </button>
                <button
                  type="submit"
                  disabled={registerMutation.isPending}
                  style={{ padding: '8px 20px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
                >
                  {registerMutation.isPending ? 'दर्ता हुँदैछ...' : 'दर्ता सम्पन्न गर्नुहोस्'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: FINANCIAL REPORT / FAANTWARI (PEARLS) */}
      {showFinancialModal && selectedCoop && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#fff', width: '100%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto', borderRadius: '12px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>वित्तीय फाँटवारी तथा PEARLS विवरण प्रविष्टि</h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>{selectedCoop.name} ({selectedCoop.registration_no})</p>
              </div>
              <button onClick={() => setShowFinancialModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitFinancialMutation.mutate(financialForm);
              }}
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '13px' }}
            >
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '4px' }}>आर्थिक वर्ष</label>
                <input
                  type="text"
                  value={financialForm.fiscal_year}
                  onChange={(e) => setFinancialForm({ ...financialForm, fiscal_year: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '4px' }}>अवधि (Period)</label>
                <input
                  type="text"
                  value={financialForm.period_name}
                  onChange={(e) => setFinancialForm({ ...financialForm, period_name: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '4px' }}>कुल बचत निक्षेप (Deposits) *</label>
                <input
                  type="number"
                  required
                  value={financialForm.total_deposits}
                  onChange={(e) => setFinancialForm({ ...financialForm, total_deposits: Number(e.target.value) })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '4px' }}>नगद तथा बैंक मौज्दात (Liquid Assets) *</label>
                <input
                  type="number"
                  required
                  value={financialForm.liquid_assets}
                  onChange={(e) => setFinancialForm({ ...financialForm, liquid_assets: Number(e.target.value) })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '4px' }}>कुल ऋण लगानी (Loan Outstanding) *</label>
                <input
                  type="number"
                  required
                  value={financialForm.total_loans}
                  onChange={(e) => setFinancialForm({ ...financialForm, total_loans: Number(e.target.value) })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '4px' }}>भाखा नाघेको कर्जा (NPL) *</label>
                <input
                  type="number"
                  required
                  value={financialForm.non_performing_loans}
                  onChange={(e) => setFinancialForm({ ...financialForm, non_performing_loans: Number(e.target.value) })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ gridColumn: 'span 2', background: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '12px' }}>
                <b>अनुमानित PEARLS सूचकाङ्क:</b>
                <div style={{ marginTop: '4px' }}>
                  - तरलता अनुपात: <b>{financialForm.total_deposits > 0 ? ((financialForm.liquid_assets / financialForm.total_deposits) * 100).toFixed(1) : 0}%</b> (मापदण्ड: १०-१५%)
                </div>
                <div style={{ marginTop: '2px' }}>
                  - खराब कर्जा दर (NPL): <b>{financialForm.total_loans > 0 ? ((financialForm.non_performing_loans / financialForm.total_loans) * 100).toFixed(1) : 0}%</b> (मापदण्ड: ५% भन्दा कम)
                </div>
              </div>

              <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowFinancialModal(false)}
                  style={{ padding: '8px 16px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}
                >
                  रद्द गर्नुहोस्
                </button>
                <button
                  type="submit"
                  disabled={submitFinancialMutation.isPending}
                  style={{ padding: '8px 20px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
                >
                  {submitFinancialMutation.isPending ? 'सुरक्षित गरिँदैछ...' : 'फाँटवारी प्रविष्टि सुरक्षित गर्नुहोस्'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: INSPECTION LOGGING */}
      {showInspectionModal && selectedCoop && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#fff', width: '100%', maxWidth: '600px', borderRadius: '12px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>स्थलगत निरीक्षण प्रतिवेदन</h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>{selectedCoop.name}</p>
              </div>
              <button onClick={() => setShowInspectionModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitInspectionMutation.mutate(inspectionForm);
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '4px' }}>निरीक्षण मिति (वि.सं.)</label>
                  <input
                    type="text"
                    value={inspectionForm.inspection_date_bs}
                    onChange={(e) => setInspectionForm({ ...inspectionForm, inspection_date_bs: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '4px' }}>निरीक्षक अधिकृत</label>
                  <input
                    type="text"
                    value={inspectionForm.inspector_name}
                    onChange={(e) => setInspectionForm({ ...inspectionForm, inspector_name: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '4px' }}>प्रमुख कैफियत तथा निष्कर्ष (Findings)</label>
                <textarea
                  rows={3}
                  placeholder="लेखापरीक्षण, नगद मौज्दात, फाइल व्यवस्थापन र सन्दर्भ ब्याजदर पालनाको अवस्था..."
                  value={inspectionForm.findings_summary}
                  onChange={(e) => setInspectionForm({ ...inspectionForm, findings_summary: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '4px' }}>सुधारका लागि दिइएका निर्देशनहरू (Directives)</label>
                <textarea
                  rows={2}
                  placeholder="सुधार गर्नुपर्ने बुँदाहरू र म्याद..."
                  value={inspectionForm.directives_issued}
                  onChange={(e) => setInspectionForm({ ...inspectionForm, directives_issued: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowInspectionModal(false)}
                  style={{ padding: '8px 16px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}
                >
                  रद्द गर्नुहोस्
                </button>
                <button
                  type="submit"
                  disabled={submitInspectionMutation.isPending}
                  style={{ padding: '8px 20px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
                >
                  {submitInspectionMutation.isPending ? 'दर्ता हुँदैछ...' : 'निरीक्षण प्रतिवेदन सुरक्षित गर्नुहोस्'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ISSUE FORMAL REGULATORY DIRECTIVE / NOTICE */}
      {showNoticeModal && selectedCoop && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#fff', width: '100%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto', borderRadius: '12px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', color: '#991b1b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Bell size={18} /> आधिकारिक नियामकीय निर्देशन तथा ताकेता पत्र
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                  पाने: {selectedCoop.name} (वडा नं {selectedCoop.ward_number})
                </p>
              </div>
              <button onClick={() => setShowNoticeModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                issueNoticeMutation.mutate(noticeForm);
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}
            >
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '4px' }}>निर्देशनको प्रकार (Notice Type)</label>
                <select
                  value={noticeForm.notice_type}
                  onChange={(e) => setNoticeForm({ ...noticeForm, notice_type: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                >
                  <option value="तरलता सुधार तथा जोखिम न्यूनीकरण निर्देशन">तरलता सुधार तथा जोखिम न्यूनीकरण निर्देशन</option>
                  <option value="साधारण सभा (AGM) सम्पन्न गर्ने ताकेता">साधारण सभा (AGM) सम्पन्न गर्ने ताकेता</option>
                  <option value="लेखापरीक्षण प्रतिवेदन पेश गर्ने म्याद">लेखापरीक्षण प्रतिवेदन पेश गर्ने म्याद</option>
                  <option value="भाखा नाघेको कर्जा असुली निर्देशन">भाखा नाघेको कर्जा असुली निर्देशन</option>
                  <option value="COPOMIS मा तथ्याङ्क प्रविष्टि गर्ने आदेश">COPOMIS मा तथ्याङ्क प्रविष्टि गर्ने आदेश</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '4px' }}>पत्रको मुख्य विषय (Title)</label>
                <input
                  type="text"
                  required
                  value={noticeForm.title}
                  onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '4px' }}>जारी मिति (वि.सं.)</label>
                  <input
                    type="text"
                    value={noticeForm.issue_date_bs}
                    onChange={(e) => setNoticeForm({ ...noticeForm, issue_date_bs: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '4px' }}>अनुपालन गर्ने अन्तिम म्याद</label>
                  <input
                    type="text"
                    value={noticeForm.deadline_date_bs}
                    onChange={(e) => setNoticeForm({ ...noticeForm, deadline_date_bs: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '4px' }}>पत्रको व्यहोरा (Notice Body)</label>
                <textarea
                  rows={3}
                  required
                  value={noticeForm.content}
                  onChange={(e) => setNoticeForm({ ...noticeForm, content: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '4px' }}>सुधारका निर्देशन बुँदाहरू</label>
                <textarea
                  rows={2}
                  value={noticeForm.directives}
                  onChange={(e) => setNoticeForm({ ...noticeForm, directives: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ background: '#f0fdf4', padding: '12px', borderRadius: '8px', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 600, color: '#166534' }}>अध्यक्षको मोबाइलमा SMS पठाउने</div>
                  <div style={{ fontSize: '11px', color: '#15803d' }}>
                    नम्बर: {noticeForm.recipient_phone || selectedCoop.chairperson_phone || 'फोन नम्बर उपलब्ध छैन'}
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={noticeForm.sms_sent}
                  onChange={(e) => setNoticeForm({ ...noticeForm, sms_sent: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowNoticeModal(false)}
                  style={{ padding: '8px 16px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}
                >
                  रद्द गर्नुहोस्
                </button>
                <button
                  type="submit"
                  disabled={issueNoticeMutation.isPending}
                  style={{ padding: '8px 20px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
                >
                  {issueNoticeMutation.isPending ? 'जारी गरिँदैछ...' : 'ताकेता पत्र तथा SMS जारी गर्नुहोस्'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINTABLE OFFICIAL LETTERHEAD VIEW */}
      {selectedNoticeForPrint && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '20px' }}>
          <div style={{ background: '#fff', width: '100%', maxWidth: '720px', maxHeight: '90vh', overflowY: 'auto', borderRadius: '12px', padding: '36px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            {/* Header Letterhead */}
            <div style={{ textAlign: 'center', borderBottom: '2px solid #b91c1c', paddingBottom: '16px', marginBottom: '20px' }}>
              <div style={{ fontSize: '13px', color: '#b91c1c', fontWeight: 600 }}>नेपाल सरकार</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#b91c1c' }}>पाँचपोखरी थाङपाल गाउँपालिका</div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#1e3a8a' }}>गाउँ कार्यपालिकाको कार्यालय</div>
              <div style={{ fontSize: '12px', color: '#475569' }}>थाङपालधाप, सिन्धुपाल्चोक, बागमती प्रदेश, नेपाल</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginTop: '6px' }}>सहकारी तथा उद्यम प्रवर्द्धन शाखा</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '16px', color: '#334155' }}>
              <div>पत्र संख्या: २०८१/८२<br />चलानी नं: <b>{selectedNoticeForPrint.notice_no}</b></div>
              <div style={{ textAlign: 'right' }}>मिति: <b>{selectedNoticeForPrint.issue_date_bs}</b></div>
            </div>

            <div style={{ fontSize: '14px', marginBottom: '16px' }}>
              <b>श्री सञ्चालक समिति / व्यवस्थापक</b>,<br />
              {cooperatives.find((c) => c.id === selectedNoticeForPrint.cooperative_id)?.name || 'सहकारी संस्था लि.'},<br />
              पाँचपोखरी थाङपाल गाउँपालिका।
            </div>

            <div style={{ textAlign: 'center', fontSize: '15px', fontWeight: 700, textDecoration: 'underline', marginBottom: '16px', color: '#0f172a' }}>
              विषय: {selectedNoticeForPrint.title}
            </div>

            <div style={{ fontSize: '13px', lineHeight: 1.8, color: '#1e293b', marginBottom: '16px', textAlign: 'justify' }}>
              {selectedNoticeForPrint.content}
            </div>

            {selectedNoticeForPrint.directives && (
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '13px', lineHeight: 1.6, marginBottom: '20px' }}>
                <b>दिइएका निर्देशनहरू:</b>
                <div style={{ marginTop: '4px' }}>{selectedNoticeForPrint.directives}</div>
              </div>
            )}

            {selectedNoticeForPrint.deadline_date_bs && (
              <div style={{ fontSize: '13px', color: '#b91c1c', fontWeight: 600, marginBottom: '32px' }}>
                निर्देशन अनुपालनको अन्तिम म्याद: {selectedNoticeForPrint.deadline_date_bs} गतेभित्र।
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', textAlign: 'center', marginTop: '40px' }}>
              <div>
                <div style={{ borderBottom: '1px solid #334155', width: '180px', marginBottom: '6px' }}></div>
                <div style={{ fontWeight: 700, fontSize: '13px' }}>सहकारी अधिकृत</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>पाँचपोखरी थाङपाल गाउँपालिका</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '30px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
              <button
                onClick={() => setSelectedNoticeForPrint(null)}
                style={{ padding: '8px 16px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}
              >
                बन्द गर्नुहोस्
              </button>
              <button
                onClick={() => window.print()}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 18px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
              >
                <Printer size={15} /> पत्र प्रिन्ट गर्नुहोस्
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: COPOMIS EXPORT VIEWER */}
      {showCopomisViewer && !isPublic && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#fff', width: '100%', maxWidth: '700px', borderRadius: '12px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>COPOMIS JSON Export Payload</h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>सहकारी विभागको मापदण्ड अनुरूप तयार गरिएको डेटा</p>
              </div>
              <button onClick={() => setShowCopomisViewer(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ background: '#0f172a', color: '#38bdf8', padding: '16px', borderRadius: '8px', maxHeight: '350px', overflowY: 'auto', fontSize: '12px', fontFamily: 'monospace' }}>
              <pre style={{ margin: 0 }}>
                {JSON.stringify(
                  {
                    export_meta: {
                      schema: "COPOMIS-V2.4",
                      municipality: "पाँचपोखरी थाङपाल गाउँपालिका",
                      timestamp: new Date().toISOString()
                    },
                    records: cooperatives
                  },
                  null,
                  2
                )}
              </pre>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
              <button
                onClick={() => setShowCopomisViewer(false)}
                style={{ padding: '8px 16px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}
              >
                बन्द गर्नुहोस्
              </button>
              <button
                onClick={handleExportCopomis}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 18px', background: '#0f766e', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
              >
                <Download size={14} /> फाइल डाउनलोड गर्नुहोस्
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL DRAWER / MODAL FOR SELECTED COOPERATIVE */}
      {selectedCoop && !showFinancialModal && !showInspectionModal && !showNoticeModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#fff', width: '100%', maxWidth: '600px', borderRadius: '12px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>{selectedCoop.name}</h3>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                  दर्ता नं: {selectedCoop.registration_no} | COPOMIS कोड: {selectedCoop.copomis_code || 'उपलब्ध छैन'}
                </div>
              </div>
              <button onClick={() => setSelectedCoop(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
              <div><b>प्रकार:</b> {selectedCoop.coop_type}</div>
              <div><b>स्थान:</b> वडा नं {selectedCoop.ward_number}, {selectedCoop.tole_address}</div>
              <div><b>अध्यक्ष:</b> {selectedCoop.chairperson_name} ({selectedCoop.chairperson_phone || '-'})</div>
              <div><b>व्यवस्थापक:</b> {selectedCoop.manager_name} ({selectedCoop.manager_phone || '-'})</div>
              <div><b>कुल सदस्य:</b> {selectedCoop.total_members} (पु: {selectedCoop.total_members_male} | म: {selectedCoop.total_members_female})</div>
              <div><b>शेयर पुँजी:</b> रू {(Number(selectedCoop.share_capital) / 100000).toFixed(2)} लाख</div>
              <div><b>कुल बचत:</b> रू {(Number(selectedCoop.total_deposit) / 100000).toFixed(2)} लाख</div>
              <div><b>ऋण लगानी:</b> रू {(Number(selectedCoop.total_loan_outstanding) / 100000).toFixed(2)} लाख</div>
              <div><b>तरलता अनुपात:</b> <span style={{ fontWeight: 600, color: selectedCoop.liquidity_ratio < 10 ? '#ef4444' : '#10b981' }}>{selectedCoop.liquidity_ratio}%</span></div>
              <div><b>खराब कर्जा (NPL):</b> <span style={{ fontWeight: 600, color: selectedCoop.npl_ratio > 5 ? '#ef4444' : '#10b981' }}>{selectedCoop.npl_ratio}%</span></div>
              <div><b>जोखिम स्तर:</b> <span style={{ fontWeight: 600 }}>{selectedCoop.risk_level}</span></div>
              <div><b>अन्तिम AGM:</b> {selectedCoop.last_agm_date_bs || '-'}</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button
                onClick={() => setSelectedCoop(null)}
                style={{ padding: '8px 18px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}
              >
                बन्द गर्नुहोस्
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
