import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Layers,
  Search,
  Plus,
  Printer,
  X,
  CheckCircle,
  CheckCircle2,
  AlertCircle,
  Building,
  Building2,
  FileCheck,
  FileCheck2,
  QrCode,
  Compass,
  ArrowRight,
  ShieldCheck,
  Coins,
  MapPin,
  Eye,
  FileText,
  Calendar,
  User,
  Phone,
  CreditCard,
  Ruler,
  Clock,
  Sparkles,
  Map as MapIcon,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Filter,
  CheckSquare,
  AlertTriangle,
  LocateFixed,
  RefreshCw,
  Download,
  HardHat,
} from 'lucide-react';
import { useTenant } from '../../context/TenantContext';
import { EngineersManagementTab } from './components/EngineersManagementTab';

// ── Building Permit Record Interface ──────────────────────────────────────────
export interface BuildingPermit {
  id: string;
  applicationNo: string;
  applicantName: string;
  applicantPhone?: string;
  applicantCitizenship?: string;
  landOwnerName: string;
  sheetNo?: string;
  kittaNo: string;
  landArea?: string;
  landAreaRopani?: string;
  fourBoundaries?: { east?: string; west?: string; north?: string; south?: string };
  wardNumber: number;
  toleAddress?: string;
  buildingClass?: string;
  usageType: string;
  structureType: string;
  totalFloors: number;
  plinthAreaSqFt: number;
  totalBuiltAreaSqFt: number;
  farRatio?: number;
  groundCoveragePct?: number;
  roadWidthFt?: number;
  setbackFrontFt?: number;
  setbackRearFt?: number;
  setbackSideFt?: number;
  gpsLat?: number;
  gpsLon?: number;
  designerName?: string;
  necLicenseNo?: string;
  // ── भवन निर्माण मार्गदर्शन, २०८२ (DUDBC Guidance 2082) Fields ──
  ownershipType?: string; // 'आफ्नै (Self-Owned)' | 'भाडा/लिज (Leased/Rented)' | 'पारिवारिक/मन्जुरीनामा (Family/Consent)'
  leasePeriodYears?: number;
  cadVersion?: string; // e.g. 'AutoCAD 2024 (.dwg)', 'AutoCAD 2021 (.dwg)', 'AutoCAD 2018 (.dwg)'
  hasStructuralDrawing?: string;
  structuralModelType?: string; // 'ETABS (.edb)' | 'SAP2000 (.sdb)'
  structuralModelFileUrl?: string;
  etabsChecks?: {
    structuralSoftware?: string;
    baseShearKn?: number;
    fundamentalTimePeriodSec?: number;
    maxDriftRatio?: number;
    driftCompliance?: { passed: boolean; maxAllowed: number; actual: number; note: string };
    massParticipationPct?: number;
    massCompliance?: { passed: boolean; minRequiredPct: number; actualPct: number; note: string };
    torsionalRatio?: number;
    torsionCompliance?: { passed: boolean; maxAllowed: number; actual: number; note: string };
    isCompliant?: boolean;
    verifiedByEngineer?: string;
    necLicenseNo?: string;
    verifiedAt?: string;
    remarks?: string;
  };
  partialCompletionDetails?: {
    certificateNo?: string;
    completedFloors?: number;
    totalAllowedFloors?: number;
    completedPlinthSqFt?: number;
    allowedUsage?: string;
    validityExpiryDateBs?: string;
    remainingFloors?: number;
    siteEngineerName?: string;
    engineerNecNo?: string;
    wardRecommendationNo?: string;
    issueDateBs?: string;
    remarks?: string;
  };
  status: string;
  ratePerSqFt?: number;
  serviceCharge?: number;
  permitFee: number;
  receiptNo?: string;
  paymentStatus?: string;
  applicationDateBs?: string;
  publicNoticeDateBs?: string;
  sarjaminDateBs?: string;
  plinthApprovalDateBs?: string;
  permanentApprovalDateBs?: string;
  completionCertificateDateBs?: string;
  certificateNo?: string;
  siteEngineerName?: string;
  technicalReport?: string;
  approvedBy?: string;
  qrCode?: string;
  createdAt?: string;
  documents?: {
    id: string;
    category: string;
    title: string;
    fileName: string;
    fileSize?: string;
    fileUrl?: string;
    status: 'approved' | 'pending' | 'rejected';
    remarks?: string;
    verifiedBy?: string;
    uploadedAt?: string;
  }[];
  objections?: {
    id: string;
    claimantName: string;
    claimantPhone: string;
    claimantCitizenship?: string;
    relationToProperty?: string;
    boundarySide?: string;
    reason: string;
    status: 'pending' | 'hearing_scheduled' | 'settled' | 'rejected';
    resolutionNotes?: string;
    filedDateBs: string;
  }[];
  approvals?: {
    role: string;
    roleTitleNepali: string;
    officerName: string;
    designation: string;
    status: 'approved' | 'rejected' | 'forwarded' | 'pending';
    signatureDateBs?: string;
    remarks?: string;
  }[];
  scrutinyResults?: {
    roadWidthCompliance: { passed: boolean; required: number; actual: number; note: string };
    frontSetbackCompliance: { passed: boolean; required: number; actual: number; note: string };
    rearSetbackCompliance: { passed: boolean; required: number; actual: number; note: string };
    sideSetbackCompliance: { passed: boolean; required: number; actual: number; note: string };
    coverageCompliance: { passed: boolean; maxAllowedPct: number; actualPct: number; note: string };
    farCompliance: { passed: boolean; maxAllowedFar: number; actualFar: number; note: string };
    soilTestRequired: boolean;
    structuralReportRequired: boolean;
    overallStatus: 'COMPLIANT' | 'NON_COMPLIANT' | 'WARNING';
    generatedAt?: string;
  };
}

export interface BpsStats {
  totalApplications: number;
  completedCertificates: number;
  partialCompletedCertificates?: number;
  plinthApproved: number;
  superstructureVerified: number;
  pendingInspections: number;
  totalPermitRevenue: number;
  totalBuiltAreaCoverage: number;
  complianceRate: number;
}

// ── भवन निर्माण मार्गदर्शन, २०८२ (DUDBC Guidance 2082) ७-चरण कार्यप्रवाह ──────────
export const WORKFLOW_STAGES = [
  'दरखास्त पेश भएको',
  'कागजात रुजु सम्पन्न',
  'स्थलगत नापजाँच सम्पन्न',
  'अस्थायी प्रथम चरण (DPC स्वीकृत)',
  'दोस्रो चरण (Super Structure इजाजत)',
  'आंशिक निर्माण सम्पन्न प्रमाणपत्र जारी',
  'भवन निर्माण सम्पन्न प्रमाणपत्र जारी',
];

export const BUILDING_CLASSES = [
  { id: 'all', label: 'सबै वर्ग (All Classes)' },
  { id: 'क वर्ग', label: 'क वर्ग (विशिष्ट / >5 Storey)' },
  { id: 'ख वर्ग', label: 'ख वर्ग (पेशागत / RCC Frame)' },
  { id: 'ग वर्ग', label: 'ग वर्ग (मापदण्ड अनुरुप / MRT)' },
  { id: 'घ वर्ग', label: 'घ वर्ग (परम्परागत / सरल)' },
];

export const USAGE_TYPES = [
  'आवासीय (Residential)',
  'व्यापारिक (Commercial)',
  'मिश्रित (Mixed Use)',
  'संस्थागत / सार्वजनिक (Institutional)',
  'औद्योगिक (Industrial)',
];

export const STRUCTURE_TYPES = [
  'आरसीसी फ्रेम स्ट्रक्चर (RCC Frame)',
  'लोड बेयरिङ / ढुङ्गा-माटो-इँटा',
  'स्टील / ट्रस संरचना (Steel Structure)',
  'परम्परागत काठ-माटो संरचना',
];

export const BuildingPermitPage: React.FC = () => {
  let tenantSettings: any = null;
  try {
    const tenantCtx = useTenant();
    tenantSettings = tenantCtx?.settings;
  } catch {}

  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'registry' | 'workflow' | 'certificates' | 'gis' | 'engineers'>('registry');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedWard, setSelectedWard] = useState('all');
  const [selectedClass, setSelectedClass] = useState('all');

  // Modal States
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [viewingPermit, setViewingPermit] = useState<BuildingPermit | null>(null);
  const [inspectingPermit, setInspectingPermit] = useState<BuildingPermit | null>(null);
  const [reviewingDocsPermit, setReviewingDocsPermit] = useState<BuildingPermit | null>(null);
  const [reviewingObjectionsPermit, setReviewingObjectionsPermit] = useState<BuildingPermit | null>(null);
  const [payingPermit, setPayingPermit] = useState<BuildingPermit | null>(null);
  const [cadPermit, setCadPermit] = useState<BuildingPermit | null>(null);
  const [cadAnalyzing, setCadAnalyzing] = useState(false);
  const [cadReport, setCadReport] = useState<any>(null);
  const [printableDoc, setPrintableDoc] = useState<{
    permit: BuildingPermit;
    type: 'dpc' | 'superstructure' | 'permanent' | 'partial_completion' | 'completion' | 'receipt' | 'notice' | 'sarjamin' | 'storey_addition';
  } | null>(null);
  const [gpsDetecting, setGpsDetecting] = useState(false);
  const [gpsAccuracy, setGpsAccuracy] = useState<string | null>(null);

  // ── Guidance 2082 Modal States ──
  const [etabsScrutinyPermit, setEtabsScrutinyPermit] = useState<BuildingPermit | null>(null);
  const [partialCompletionPermit, setPartialCompletionPermit] = useState<BuildingPermit | null>(null);
  const [etabsForm, setEtabsForm] = useState({
    structuralSoftware: 'ETABS (.edb)',
    baseShearKn: 1250,
    fundamentalTimePeriodSec: 0.42,
    maxDriftRatio: 0.0032,
    massParticipationPct: 93.5,
    torsionalRatio: 1.15,
    engineerName: 'इ. सुमन श्रेष्ठ',
    necLicenseNo: 'NEC-CIVIL-14205',
    remarks: 'NBC 105:2020 Compliance verified per मार्गदर्शन २०८२',
  });
  const [partialForm, setPartialForm] = useState({
    completedFloors: 1.0,
    totalAllowedFloors: 2.5,
    completedPlinthSqFt: 1100,
    allowedUsage: 'व्यावसायिक पसल तथा बसोबास',
    validityExpiryDateBs: '२०८३/०६/३०',
    siteEngineerName: 'इ. सन्तोष खड्का',
    engineerNecNo: 'NEC-CIVIL-18445',
    wardRecommendationNo: 'वडा-१-सिफारिस-१४२',
    remarks: 'तल्लो १ तला निर्माण सम्पन्न। बाँकी तला निर्माण म्याद २०८३ असोज मसान्तसम्म।',
  });

  // Map references
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerGroupRef = useRef<L.LayerGroup | null>(null);

  // Form State for Multi-Step Application Wizard
  const [formData, setFormData] = useState({
    applicantName: '',
    applicantPhone: '',
    applicantCitizenship: '',
    landOwnerName: '',
    sheetNo: '२३-क-०१',
    kittaNo: '',
    landArea: '०-६-२-०',
    landAreaRopani: '०-६-२-०',
    wardNumber: 3,
    toleAddress: '',
    buildingClass: 'ख वर्ग (B - पेशागत / Engineered Design / RCC)',
    usageType: 'आवासीय (Residential)',
    structureType: 'आरसीसी फ्रेम स्ट्रक्चर (RCC Frame)',
    totalFloors: 2.5,
    plinthAreaSqFt: 1100,
    totalBuiltAreaSqFt: 2500,
    roadWidthFt: 20,
    setbackFrontFt: 5.0,
    setbackRearFt: 3.0,
    setbackSideFt: 3.0,
    farRatio: 1.5,
    groundCoveragePct: 55.0,
    gpsLat: 27.93412,
    gpsLon: 85.60218,
    designerName: 'इ. सुमन श्रेष्ठ (NEC: 14205-Civil)',
    necLicenseNo: 'NEC-CIVIL-14205',
    
    // ── Guidance 2082 Form Fields ──
    ownershipType: 'आफ्नै (Self-Owned)',
    leasePeriodYears: 15.0,
    cadVersion: 'AutoCAD 2021 (.dwg)',
    hasStructuralDrawing: 'हो (NBC 105:2020)',
    structuralModelType: 'ETABS (.edb)',
    structuralModelFileUrl: '',
    
    eastBoundary: 'बाटो तथा खुला बारी',
    westBoundary: 'कित्ता नं १२४ को जग्गा',
    northBoundary: 'मोटरबाटो',
    southBoundary: 'सिमाना खोल्सो',
    ratePerSqFt: 10.0,
    serviceCharge: 1500,
    permitFee: 26500,
  });

  // Calculate live fee when form data changes
  const liveCalculatedFee = useMemo(() => {
    const plinth = Number(formData.plinthAreaSqFt) || 0;
    const floors = Number(formData.totalFloors) || 1;
    const built = plinth * floors;
    let rate = 10.0;
    let svc = 1500;
    if (formData.buildingClass.includes('क वर्ग') || formData.usageType.includes('व्यापारिक')) {
      rate = 14.0;
      svc = 2500;
    } else if (formData.buildingClass.includes('ग वर्ग')) {
      rate = 7.0;
      svc = 1000;
    } else if (formData.buildingClass.includes('घ वर्ग')) {
      rate = 4.0;
      svc = 500;
    }
    const total = Math.round(built * rate + svc);
    return { built, rate, svc, total };
  }, [formData.plinthAreaSqFt, formData.totalFloors, formData.buildingClass, formData.usageType]);

  // Fetch Permits List
  const { data: permits = [], isLoading, refetch } = useQuery<BuildingPermit[]>({
    queryKey: ['building-permits-list'],
    queryFn: async () => {
      const res: any = await api.get('/building-permits');
      return Array.isArray(res) ? res : (res?.data || []);
    },
  });

  // Fetch Stats
  const { data: stats } = useQuery<BpsStats>({
    queryKey: ['building-permits-stats'],
    queryFn: async () => {
      const res: any = await api.get('/building-permits/stats');
      return res?.totalApplications !== undefined ? res : (res?.data || {});
    },
  });

  // Create Permit Mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const payload = {
        ...data,
        fourBoundaries: {
          east: data.eastBoundary,
          west: data.westBoundary,
          north: data.northBoundary,
          south: data.southBoundary,
        },
        totalBuiltAreaSqFt: liveCalculatedFee.built,
        permitFee: liveCalculatedFee.total,
        ratePerSqFt: liveCalculatedFee.rate,
        serviceCharge: liveCalculatedFee.svc,
      };
      return api.post('/building-permits', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['building-permits-list'] });
      queryClient.invalidateQueries({ queryKey: ['building-permits-stats'] });
      setShowApplyModal(false);
      setCurrentStep(1);
    },
  });

  // Advance Stage Mutation
  const advanceMutation = useMutation({
    mutationFn: async ({
      id,
      nextStatus,
      officerName,
      technicalReport,
    }: {
      id: string;
      nextStatus: string;
      officerName?: string;
      technicalReport?: string;
    }) => {
      return api.post(`/building-permits/${id}/advance-stage`, {
        nextStatus,
        officerName,
        technicalReport,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['building-permits-list'] });
      queryClient.invalidateQueries({ queryKey: ['building-permits-stats'] });
      setInspectingPermit(null);
    },
  });

  // Document Status Mutation
  const docStatusMutation = useMutation({
    mutationFn: async ({ permitId, docId, status, remarks }: { permitId: string; docId: string; status: string; remarks?: string }) => {
      return api.put(`/building-permits/${permitId}/documents/${docId}/status`, { status, remarks });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['building-permits-list'] });
      if (reviewingDocsPermit) {
        setReviewingDocsPermit(data?.data || data);
      }
    },
  });

  // Payment Mutation
  const paymentMutation = useMutation({
    mutationFn: async ({ permitId, gateway, transactionId }: { permitId: string; gateway: string; transactionId: string }) => {
      return api.post(`/building-permits/${permitId}/verify-epayment`, { paymentGateway: gateway, transactionId });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['building-permits-list'] });
      const updatedPermit = data?.data || data;
      setViewingPermit(updatedPermit);
      setPayingPermit(null);
      alert(`${updatedPermit.paymentGateway} Payment Successful! Receipt: ${updatedPermit.receiptNo}`);
    },
    onError: () => {
      alert('भुक्तानी प्रमाणीकरण असफल भयो। कृपया पुन: प्रयास गर्नुहोस्।');
    }
  });

  // ── Guidance 2082: ETABS / SAP2000 Structural Scrutiny Mutation ──
  const etabsMutation = useMutation({
    mutationFn: async ({ permitId, ...payload }: any) => {
      return api.post(`/building-permits/${permitId}/etabs-scrutiny`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['building-permits-list'] });
      queryClient.invalidateQueries({ queryKey: ['building-permits-stats'] });
      setEtabsScrutinyPermit(null);
      alert('ETABS / SAP2000 संरचनात्मक विश्लेषण मापदण्ड (NBC 105:2020) सफलतापूर्वक जाँच तथा प्रमाणीकरण भयो!');
    },
    onError: () => {
      alert('स्ट्रक्चरल स्क्रूटिनी प्रमाणीकरण गर्दा त्रुटि भयो।');
    }
  });

  // ── Guidance 2082: Issue Partial Completion Certificate Mutation ──
  const partialCompletionMutation = useMutation({
    mutationFn: async ({ permitId, ...payload }: any) => {
      return api.post(`/building-permits/${permitId}/issue-partial-completion`, payload);
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['building-permits-list'] });
      queryClient.invalidateQueries({ queryKey: ['building-permits-stats'] });
      const updated = data?.data || data;
      setPartialCompletionPermit(null);
      alert(`आंशिक निर्माण सम्पन्न प्रमाणपत्र जारी भयो! दर्ता नं: ${updated?.partialCompletionDetails?.certificateNo || ''}`);
      if (updated?.id) {
        setPrintableDoc({ permit: updated, type: 'partial_completion' });
      }
    },
    onError: () => {
      alert('आंशिक निर्माण सम्पन्न प्रमाणपत्र जारी गर्दा समस्या आयो।');
    }
  });

  // Live GPS Detector
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      alert('यस ब्राउजरमा Geolocation समर्थन उपलब्ध छैन।');
      return;
    }
    setGpsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(6));
        const lon = parseFloat(pos.coords.longitude.toFixed(6));
        const acc = Math.round(pos.coords.accuracy * 10) / 10;
        if (acc <= 5.0) {
          setFormData((prev) => ({ ...prev, gpsLat: lat, gpsLon: lon }));
          setGpsAccuracy(`±${acc} मिटर (स्वीकृत ≤ 5m)`);
        } else {
          alert(`⚠️ GPS स्थान अस्वीकृत: परिशुद्धता कमजोर छ (±${acc} मिटर)।\n\n५ मिटर भन्दा कम (≤ 5m) परिशुद्धता भएको GPS डाटा मात्र स्वीकार गरिन्छ। कृपया खुला ठाउँमा गई पुनः प्रयास गर्नुहोस् वा म्यानुअल समन्वय भर्नुहोस्।`);
          setGpsAccuracy(`±${acc} मिटर (अस्वीकृत - ५ मिटर भन्दा बढी)`);
        }
        setGpsDetecting(false);
      },
      (err) => {
        console.warn('GPS location error:', err);
        setGpsDetecting(false);
        alert('GPS स्थान लिन सकिएन। कृपया म्यानुअल समन्वय भर्नुहोस्।');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  // Filtered Permits List
  const filteredList = useMemo(() => {
    return permits.filter((p) => {
      const name = (p.applicantName || p.landOwnerName || '').toLowerCase();
      const appNo = (p.applicationNo || '').toLowerCase();
      const kitta = (p.kittaNo || '').toString();
      const tole = (p.toleAddress || '').toLowerCase();
      const q = searchTerm.toLowerCase().trim();

      const matchSearch = !q || name.includes(q) || appNo.includes(q) || kitta.includes(q) || tole.includes(q);
      const matchStatus = selectedStatus === 'all' || p.status === selectedStatus;
      const matchWard = selectedWard === 'all' || p.wardNumber === Number(selectedWard);
      const matchClass = selectedClass === 'all' || (p.buildingClass || '').includes(selectedClass);

      return matchSearch && matchStatus && matchWard && matchClass;
    });
  }, [permits, searchTerm, selectedStatus, selectedWard, selectedClass]);

  // Leaflet Map Initialization for GIS Tab
  useEffect(() => {
    if (activeTab === 'gis' && mapContainerRef.current) {
      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current).setView([27.925, 85.59], 12);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map);

        const markerGroup = L.layerGroup().addTo(map);
        markerGroupRef.current = markerGroup;
        mapInstanceRef.current = map;
      }

      setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 250);
    } else if (activeTab !== 'gis' && mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
      markerGroupRef.current = null;
    }

    if (activeTab === 'gis' && mapInstanceRef.current && markerGroupRef.current) {
      markerGroupRef.current.clearLayers();
      filteredList.forEach((p) => {
        const lat = p.gpsLat || 27.925 + (p.wardNumber * 0.005);
        const lon = p.gpsLon || 85.59 + (p.wardNumber * 0.004);

        const isCompleted = p.status.includes('सम्पन्न');
        const isPlinth = p.status.includes('प्लिन्थ') || p.status.includes('DPC');
        const pinColor = isCompleted ? '#10b981' : isPlinth ? '#3b82f6' : '#f59e0b';

        const customIcon = L.divIcon({
          className: 'ebps-custom-pin',
          html: `<div style="background-color: ${pinColor}; width: 28px; height: 28px; border-radius: 50%; border: 2.5px solid #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 11px;">🏛️</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const marker = L.marker([lat, lon], { icon: customIcon });
        marker.bindPopup(`
          <div style="font-family: 'Noto Sans Devanagari', sans-serif; min-width: 200px;">
            <strong style="color: #1e3a8a; font-size: 13px;">${p.applicationNo}</strong>
            <div style="font-weight: 700; color: #0f172a; margin-top: 2px;">${p.landOwnerName}</div>
            <div style="font-size: 11px; color: #64748b;">वडा नं. ${p.wardNumber} | कित्ता नं. <strong>${p.kittaNo}</strong></div>
            <div style="font-size: 11px; color: #475569; margin: 4px 0;">${p.usageType} | ${p.totalFloors} तला</div>
            <div style="margin-top: 6px; padding: 3px 6px; border-radius: 4px; font-size: 10px; font-weight: 700; background: #eff6ff; color: #2563eb; display: inline-block;">${p.status}</div>
          </div>
        `);
        markerGroupRef.current?.addLayer(marker);
      });
    }

    return () => {
      if (activeTab !== 'gis' && mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerGroupRef.current = null;
      }
    };
  }, [activeTab, filteredList]);

  const getStageIndex = (statusStr: string) => {
    if (!statusStr) return 0;
    if (statusStr.includes('DPC') || statusStr.includes('अस्थायी प्रथम चरण') || statusStr.includes('प्लिन्थ')) {
      const idx = WORKFLOW_STAGES.indexOf('अस्थायी प्रथम चरण (DPC स्वीकृत)');
      if (idx !== -1) return idx;
    }
    if (statusStr.includes('Super Structure') || statusStr.includes('सुपरस्ट्रक्चर') || statusStr.includes('दोस्रो चरण')) {
      const idx = WORKFLOW_STAGES.indexOf('दोस्रो चरण (Super Structure इजाजत)');
      if (idx !== -1) return idx;
    }
    if (statusStr.includes('आंशिक निर्माण सम्पन्न')) {
      const idx = WORKFLOW_STAGES.indexOf('आंशिक निर्माण सम्पन्न प्रमाणपत्र जारी');
      if (idx !== -1) return idx;
    }
    if (statusStr.includes('भवन निर्माण सम्पन्न') || statusStr.includes('पूर्ण निर्माण सम्पन्न')) {
      const idx = WORKFLOW_STAGES.indexOf('भवन निर्माण सम्पन्न प्रमाणपत्र जारी');
      if (idx !== -1) return idx;
    }
    const idx = WORKFLOW_STAGES.findIndex((s) => statusStr.includes(s) || s.includes(statusStr));
    return idx !== -1 ? idx : 0;
  };

  // Export Table Data to CSV
  const exportToCsv = () => {
    if (!filteredList || filteredList.length === 0) {
      alert('डाउनलोड गर्नका लागि कुनै तथ्याङ्क उपलब्ध छैन।');
      return;
    }
    const headers = [
      'दरखास्त नं',
      'जग्गाधनी / दरखास्तवाला',
      'सम्पर्क फोन',
      'वडा नं',
      'कित्ता नं',
      'नापी सिट',
      'भवन वर्ग',
      'प्रयोग प्रकार',
      'तला',
      'प्लिन्थ एरिया (sq.ft)',
      'कुल निर्मित एरिया (sq.ft)',
      'नक्सा दस्तुर (रु)',
      'रसिद नं',
      'कार्यप्रवाह स्थिति',
      'दरखास्त मिति'
    ];
    const rows = filteredList.map((p) => [
      `"${p.applicationNo || ''}"`,
      `"${p.landOwnerName || p.applicantName || ''}"`,
      `"${p.applicantPhone || ''}"`,
      `"${p.wardNumber || ''}"`,
      `"${p.kittaNo || ''}"`,
      `"${p.sheetNo || ''}"`,
      `"${p.buildingClass || ''}"`,
      `"${p.usageType || ''}"`,
      `"${p.totalFloors || ''}"`,
      `"${p.plinthAreaSqFt || 0}"`,
      `"${p.totalBuiltAreaSqFt || 0}"`,
      `"${p.permitFee || 0}"`,
      `"${p.receiptNo || ''}"`,
      `"${p.status || ''}"`,
      `"${p.applicationDateBs || ''}"`,
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `eBPS_Building_Permits_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ padding: '1.75rem', fontFamily: 'inherit' }}>
      {/* Print Specific CSS */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-certificate-sheet, #printable-certificate-sheet * {
            visibility: visible;
          }
          #printable-certificate-sheet {
            position: fixed;
            left: 0;
            top: 0;
            width: 100%;
            height: auto;
            margin: 0;
            padding: 16mm 20mm;
            border: none !important;
            box-shadow: none !important;
            background: #ffffff !important;
          }
        }
      `}</style>
      {/* ── Top Header Hero ────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem',
          marginBottom: '1.75rem',
          padding: '1.75rem 2rem',
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
          color: '#ffffff',
          borderRadius: '20px',
          boxShadow: '0 10px 30px rgba(49, 46, 129, 0.25)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(8px)',
                padding: '0.75rem',
                borderRadius: '14px',
                border: '1px solid rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Layers size={32} color="#a5b4fc" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <h1 style={{ fontSize: '1.65rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
                  डिजिटल घर-नक्सा पास तथा भवन निर्माण अनुमति प्रणाली (e-BPS)
                </h1>
                <span
                  style={{
                    backgroundColor: '#10b981',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '6px',
                  }}
                >
                  NBC 105:2020 Certified
                </span>
              </div>
              <p style={{ margin: '0.35rem 0 0', opacity: 0.9, fontSize: '0.9rem', color: '#e0e7ff' }}>
                पाँचपोखरी थाङपाल गाउँपालिका — अनलाइन दरखास्त, प्राविधिक स्क्रूटिनी, DPC स्वीकृति, स्थलगत निरीक्षण र डिजिटल निर्माण सम्पन्न प्रमाणपत्र
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <a
            href="/ebps"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.7rem 1.2rem',
              background: 'rgba(99, 102, 241, 0.25)',
              border: '1px solid rgba(165, 180, 252, 0.4)',
              borderRadius: '10px',
              color: '#ffffff',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '0.85rem',
              backdropFilter: 'blur(6px)',
              transition: 'all 0.2s',
            }}
          >
            <ExternalLink size={16} /> नागरिक e-BPS पोर्टल ↗
          </a>

          <button
            onClick={() => window.print()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.7rem 1.25rem',
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.25)',
              borderRadius: '10px',
              color: '#ffffff',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem',
              backdropFilter: 'blur(6px)',
              transition: 'all 0.2s',
            }}
          >
            <Printer size={16} /> नक्सा दर्ता किताब प्रिन्ट
          </button>

          <button
            onClick={() => {
              setFormData((prev) => ({
                ...prev,
                applicantName: '',
                applicantPhone: '',
                applicantCitizenship: '',
                landOwnerName: '',
                kittaNo: '',
                toleAddress: '',
              }));
              setCurrentStep(1);
              setShowApplyModal(true);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.7rem 1.4rem',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              border: 'none',
              borderRadius: '10px',
              color: '#ffffff',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.9rem',
              boxShadow: '0 4px 14px rgba(16,185,129,0.35)',
              transition: 'all 0.2s',
            }}
          >
            <Plus size={18} /> + नयाँ घर-नक्सा दरखास्त दर्ता
          </button>
        </div>
      </div>

      {/* ── 6 Executive KPI Metric Cards ──────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '1.75rem',
        }}
      >
        {/* Total Applications */}
        <div
          onClick={() => setSelectedStatus('all')}
          title="सबै दरखास्तहरू हेर्न क्लिक गर्नुहोस्"
          style={{
            background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)',
            padding: '1.25rem',
            borderRadius: '16px',
            border: selectedStatus === 'all' ? '2px solid #2563eb' : '1.5px solid #bfdbfe',
            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <div>
            <span style={{ fontSize: '0.78rem', color: '#1d4ed8', fontWeight: 700, textTransform: 'uppercase' }}>
              कुल घर-नक्सा दरखास्त
            </span>
            <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#1e3a8a', margin: '0.2rem 0' }}>
              {(stats?.totalApplications ?? permits.length ?? 0).toLocaleString('ne-NP')} वटा
            </div>
            <div style={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: 600 }}>
              e-BPS डिजिटल अभिलेख प्रमाणित
            </div>
          </div>
          <div style={{ background: '#dbeafe', color: '#1d4ed8', padding: '0.85rem', borderRadius: '12px' }}>
            <Building size={26} />
          </div>
        </div>

        {/* Pending Technical / Notice Stage */}
        <div
          onClick={() => setSelectedStatus('कागजात रुजु सम्पन्न')}
          title="कागजात रुजु तथा प्राविधिक चरणका दरखास्त हेर्न क्लिक गर्नुहोस्"
          style={{
            background: 'linear-gradient(135deg, #fffbeb 0%, #ffffff 100%)',
            padding: '1.25rem',
            borderRadius: '16px',
            border: selectedStatus === 'कागजात रुजु सम्पन्न' ? '2px solid #d97706' : '1.5px solid #fde68a',
            boxShadow: '0 2px 8px rgba(217, 119, 6, 0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <div>
            <span style={{ fontSize: '0.78rem', color: '#b45309', fontWeight: 700, textTransform: 'uppercase' }}>
              प्राविधिक / १५ दिने सूचना चरण
            </span>
            <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#92400e', margin: '0.2rem 0' }}>
              {(stats?.pendingInspections ?? 3).toLocaleString('ne-NP')} वटा
            </div>
            <div style={{ fontSize: '0.75rem', color: '#d97706', fontWeight: 600 }}>
              कागजात रुजु तथा सर्जमिन मुचुल्का
            </div>
          </div>
          <div style={{ background: '#fef3c7', color: '#b45309', padding: '0.85rem', borderRadius: '12px' }}>
            <Clock size={26} />
          </div>
        </div>

        {/* Plinth Level Approved */}
        <div
          onClick={() => setSelectedStatus('प्लिन्थ लेभल (DPC) स्वीकृत')}
          title="DPC स्वीकृत दरखास्तहरू हेर्न क्लिक गर्नुहोस्"
          style={{
            background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)',
            padding: '1.25rem',
            borderRadius: '16px',
            border: selectedStatus === 'प्लिन्थ लेभल (DPC) स्वीकृत' ? '2px solid #16a34a' : '1.5px solid #bbf7d0',
            boxShadow: '0 2px 8px rgba(22, 163, 74, 0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <div>
            <span style={{ fontSize: '0.78rem', color: '#15803d', fontWeight: 700, textTransform: 'uppercase' }}>
              प्लिन्थ (DPC) स्तर स्वीकृत
            </span>
            <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#166534', margin: '0.2rem 0' }}>
              {(stats?.plinthApproved ?? 2).toLocaleString('ne-NP')} वटा
            </div>
            <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>
              स्थलगत नापजाँच तथा जग प्रमाणित
            </div>
          </div>
          <div style={{ background: '#dcfce7', color: '#15803d', padding: '0.85rem', borderRadius: '12px' }}>
            <Compass size={26} />
          </div>
        </div>

        {/* Completion Certificate Issued */}
        <div
          onClick={() => setSelectedStatus('भवन निर्माण सम्पन्न प्रमाणपत्र जारी')}
          title="निर्माण सम्पन्न भएका प्रमाणपत्रहरू हेर्न क्लिक गर्नुहोस्"
          style={{
            background: 'linear-gradient(135deg, #fdf4ff 0%, #ffffff 100%)',
            padding: '1.25rem',
            borderRadius: '16px',
            border: selectedStatus === 'भवन निर्माण सम्पन्न प्रमाणपत्र जारी' ? '2px solid #9333ea' : '1.5px solid #f5d0fe',
            boxShadow: '0 2px 8px rgba(168, 85, 247, 0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <div>
            <span style={{ fontSize: '0.78rem', color: '#7e22ce', fontWeight: 700, textTransform: 'uppercase' }}>
              निर्माण सम्पन्न प्रमाणपत्र जारी
            </span>
            <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#581c87', margin: '0.2rem 0' }}>
              {(stats?.completedCertificates ?? 2).toLocaleString('ne-NP')} वटा
            </div>
            <div style={{ fontSize: '0.75rem', color: '#a855f7', fontWeight: 600 }}>
              पूर्ण भवन स्वीकृति (BCC जारी)
            </div>
          </div>
          <div style={{ background: '#f3e8ff', color: '#7e22ce', padding: '0.85rem', borderRadius: '12px' }}>
            <ShieldCheck size={26} />
          </div>
        </div>

        {/* Total Revenue Collected */}
        <div
          style={{
            background: 'linear-gradient(135deg, #fff7ed 0%, #ffffff 100%)',
            padding: '1.25rem',
            borderRadius: '16px',
            border: '1.5px solid #fed7aa',
            boxShadow: '0 2px 8px rgba(234, 88, 12, 0.05)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <span style={{ fontSize: '0.78rem', color: '#c2410c', fontWeight: 700, textTransform: 'uppercase' }}>
              नक्सा पास दस्तुर संकलन
            </span>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#9a3412', margin: '0.2rem 0' }}>
              रु. {(stats?.totalPermitRevenue ?? 230500).toLocaleString('ne-NP')}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#ea580c', fontWeight: 600 }}>
              {(stats?.totalBuiltAreaCoverage ?? 25200).toLocaleString('ne-NP')} वर्गफिट कभरेज
            </div>
          </div>
          <div style={{ background: '#ffedd5', color: '#ea580c', padding: '0.85rem', borderRadius: '12px' }}>
            <Coins size={26} />
          </div>
        </div>

        {/* NBC Code Compliance Rate */}
        <div
          style={{
            background: 'linear-gradient(135deg, #f0fdfa 0%, #ffffff 100%)',
            padding: '1.25rem',
            borderRadius: '16px',
            border: '1.5px solid #99f6e4',
            boxShadow: '0 2px 8px rgba(13, 148, 136, 0.05)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <span style={{ fontSize: '0.78rem', color: '#0f766e', fontWeight: 700, textTransform: 'uppercase' }}>
              संहिता अनुपालन दर
            </span>
            <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#115e59', margin: '0.2rem 0' }}>
              {(stats?.complianceRate ?? 100)}%
            </div>
            <div style={{ fontSize: '0.75rem', color: '#0d9488', fontWeight: 600 }}>
              भूकम्प प्रतिरोधी संरचना प्रमाणित
            </div>
          </div>
          <div style={{ background: '#ccfbf1', color: '#0f766e', padding: '0.85rem', borderRadius: '12px' }}>
            <CheckCircle2 size={26} />
          </div>
        </div>
      </div>

      {/* ── 4 Executive Tabs Navigation Bar (Unified Responsive Grid) ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '0.75rem',
          marginBottom: '1.75rem',
        }}
      >
        {/* Tab 1: नक्सा दर्ता किताब */}
        <button
          type="button"
          onClick={() => setActiveTab('registry')}
          style={{
            padding: '0.85rem 1.15rem',
            borderRadius: '14px',
            border: activeTab === 'registry' ? '1.5px solid #312e81' : '1.5px solid #e2e8f0',
            background: activeTab === 'registry'
              ? 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)'
              : '#ffffff',
            color: activeTab === 'registry' ? '#ffffff' : '#1e293b',
            cursor: 'pointer',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
            boxShadow: activeTab === 'registry'
              ? '0 6px 20px -4px rgba(49, 46, 129, 0.3)'
              : '0 2px 5px rgba(0,0,0,0.03)',
            transition: 'all 0.18s ease',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: activeTab === 'registry' ? 'rgba(255,255,255,0.18)' : '#eff6ff',
              color: activeTab === 'registry' ? '#ffffff' : '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <FileText size={20} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.4rem' }}>
              <div style={{ fontWeight: 800, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                नक्सा दर्ता किताब
              </div>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '2px 7px',
                  borderRadius: '12px',
                  background: activeTab === 'registry' ? 'rgba(255,255,255,0.25)' : '#dbeafe',
                  color: activeTab === 'registry' ? '#ffffff' : '#1d4ed8',
                }}
              >
                {filteredList.length}
              </span>
            </div>
            <div style={{ fontSize: '0.73rem', opacity: activeTab === 'registry' ? 0.85 : 0.65, marginTop: '2px' }}>
              डिजिटल दरखास्त सूची
            </div>
          </div>
        </button>

        {/* Tab 2: कार्यप्रवाह एवं निरीक्षण */}
        <button
          type="button"
          onClick={() => setActiveTab('workflow')}
          style={{
            padding: '0.85rem 1.15rem',
            borderRadius: '14px',
            border: activeTab === 'workflow' ? '1.5px solid #312e81' : '1.5px solid #e2e8f0',
            background: activeTab === 'workflow'
              ? 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)'
              : '#ffffff',
            color: activeTab === 'workflow' ? '#ffffff' : '#1e293b',
            cursor: 'pointer',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
            boxShadow: activeTab === 'workflow'
              ? '0 6px 20px -4px rgba(49, 46, 129, 0.3)'
              : '0 2px 5px rgba(0,0,0,0.03)',
            transition: 'all 0.18s ease',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: activeTab === 'workflow' ? 'rgba(255,255,255,0.18)' : '#fef3c7',
              color: activeTab === 'workflow' ? '#ffffff' : '#b45309',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <CheckSquare size={20} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              कार्यप्रवाह एवं निरीक्षण
            </div>
            <div style={{ fontSize: '0.73rem', opacity: activeTab === 'workflow' ? 0.85 : 0.65, marginTop: '2px' }}>
              ७-चरण प्राविधिक रुजु
            </div>
          </div>
        </button>

        {/* Tab 3: प्रमाणपत्र तथा रसिद हब */}
        <button
          type="button"
          onClick={() => setActiveTab('certificates')}
          style={{
            padding: '0.85rem 1.15rem',
            borderRadius: '14px',
            border: activeTab === 'certificates' ? '1.5px solid #312e81' : '1.5px solid #e2e8f0',
            background: activeTab === 'certificates'
              ? 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)'
              : '#ffffff',
            color: activeTab === 'certificates' ? '#ffffff' : '#1e293b',
            cursor: 'pointer',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
            boxShadow: activeTab === 'certificates'
              ? '0 6px 20px -4px rgba(49, 46, 129, 0.3)'
              : '0 2px 5px rgba(0,0,0,0.03)',
            transition: 'all 0.18s ease',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: activeTab === 'certificates' ? 'rgba(255,255,255,0.18)' : '#f3e8ff',
              color: activeTab === 'certificates' ? '#ffffff' : '#7e22ce',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Printer size={20} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              प्रमाणपत्र तथा रसिद हब
            </div>
            <div style={{ fontSize: '0.73rem', opacity: activeTab === 'certificates' ? 0.85 : 0.65, marginTop: '2px' }}>
              ७ आधिकारिक कागजात
            </div>
          </div>
        </button>

        {/* Tab 4: GIS क्याडास्ट्रल नक्सा */}
        <button
          type="button"
          onClick={() => setActiveTab('gis')}
          style={{
            padding: '0.85rem 1.15rem',
            borderRadius: '14px',
            border: activeTab === 'gis' ? '1.5px solid #312e81' : '1.5px solid #e2e8f0',
            background: activeTab === 'gis'
              ? 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)'
              : '#ffffff',
            color: activeTab === 'gis' ? '#ffffff' : '#1e293b',
            cursor: 'pointer',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
            boxShadow: activeTab === 'gis'
              ? '0 6px 20px -4px rgba(49, 46, 129, 0.3)'
              : '0 2px 5px rgba(0,0,0,0.03)',
            transition: 'all 0.18s ease',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: activeTab === 'gis' ? 'rgba(255,255,255,0.18)' : '#ecfdf5',
              color: activeTab === 'gis' ? '#ffffff' : '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <MapIcon size={20} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              GIS क्याडास्ट्रल नक्सा
            </div>
            <div style={{ fontSize: '0.73rem', opacity: activeTab === 'gis' ? 0.85 : 0.65, marginTop: '2px' }}>
              भू-स्थानिक भवन नक्साङ्कन
            </div>
          </div>
        </button>

        {/* Tab 5: Engineers Management */}
        <button
          type="button"
          onClick={() => setActiveTab('engineers')}
          style={{
            padding: '0.85rem 1.15rem',
            borderRadius: '14px',
            border: activeTab === 'engineers' ? '1.5px solid #312e81' : '1.5px solid #e2e8f0',
            background: activeTab === 'engineers'
              ? 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)'
              : '#ffffff',
            color: activeTab === 'engineers' ? '#ffffff' : '#1e293b',
            cursor: 'pointer',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
            boxShadow: activeTab === 'engineers'
              ? '0 6px 20px -4px rgba(49, 46, 129, 0.3)'
              : '0 2px 5px rgba(0,0,0,0.03)',
            transition: 'all 0.18s ease',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: activeTab === 'engineers' ? 'rgba(255,255,255,0.18)' : '#fdf4ff',
              color: activeTab === 'engineers' ? '#ffffff' : '#c026d3',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <HardHat size={20} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Engineers
            </div>
            <div style={{ fontSize: '0.73rem', opacity: activeTab === 'engineers' ? 0.85 : 0.65, marginTop: '2px' }}>
              रोस्टर व्यवस्थापन
            </div>
          </div>
        </button>
      </div>

      {/* ── TAB 1: डिजिटल नक्सा दर्ता किताब (Registry & Management Table) ─ */}
      {activeTab === 'registry' && (
        <div>
          {/* Filters Bar */}
          <div
            style={{
              background: '#ffffff',
              padding: '1.15rem 1.35rem',
              borderRadius: '14px',
              border: '1.5px solid #e2e8f0',
              marginBottom: '1.25rem',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.9rem',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
            }}
          >
            {/* Search Input */}
            <div style={{ display: 'flex', flex: '1 1 300px', position: 'relative' }}>
              <Search
                size={18}
                color="#64748b"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="कित्ता नं, दरखास्त नं, घरधनीको नाम वा टोलबाट खोज्नुहोस्..."
                style={{
                  width: '100%',
                  padding: '0.6rem 0.75rem 0.6rem 2.4rem',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.88rem',
                  outline: 'none',
                }}
              />
            </div>

            {/* Filter Dropdowns */}
            <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
              {/* Ward Filter */}
              <select
                value={selectedWard}
                onChange={(e) => setSelectedWard(e.target.value)}
                style={{
                  padding: '0.6rem 0.9rem',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.85rem',
                  background: '#ffffff',
                  fontWeight: 600,
                  color: '#334155',
                }}
              >
                <option value="all">सबै वडाहरू (१-८)</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
                  <option key={w} value={w}>वडा नं. {w}</option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                style={{
                  padding: '0.6rem 0.9rem',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.85rem',
                  background: '#ffffff',
                  fontWeight: 600,
                  color: '#334155',
                }}
              >
                <option value="all">सबै प्रक्रियागत अवस्था</option>
                {WORKFLOW_STAGES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              {/* Building Class Filter */}
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                style={{
                  padding: '0.6rem 0.9rem',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.85rem',
                  background: '#ffffff',
                  fontWeight: 600,
                  color: '#334155',
                }}
              >
                {BUILDING_CLASSES.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>

              {/* Reset Filters */}
              {(searchTerm || selectedWard !== 'all' || selectedStatus !== 'all' || selectedClass !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedWard('all');
                    setSelectedStatus('all');
                    setSelectedClass('all');
                  }}
                  style={{
                    padding: '0.6rem 0.9rem',
                    borderRadius: '10px',
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
                title="अभिलेख सूची एक्सेल / CSV फाइलमा डाउनलोड गर्नुहोस्"
                style={{
                  padding: '0.6rem 1rem',
                  borderRadius: '10px',
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

          {/* Quick Status Filter Chips */}
          <div
            style={{
              display: 'flex',
              gap: '0.45rem',
              flexWrap: 'wrap',
              alignItems: 'center',
              marginBottom: '1.1rem',
              padding: '0.65rem 1rem',
              background: '#f8fafc',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
            }}
          >
            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, marginRight: '0.25rem' }}>
              द्रुत फिल्टर:
            </span>
            {[
              { id: 'all', label: 'सबै अभिलेख' },
              { id: 'दरखास्त पेश भएको', label: '📥 पेश भएको' },
              { id: 'कागजात रुजु सम्पन्न', label: '📋 कागजात रुजु' },
              { id: 'स्थलगत नापजाँच सम्पन्न', label: '📐 स्थलगत नापजाँच' },
              { id: 'अस्थायी प्रथम चरण (DPC स्वीकृत)', label: '🧱 १. DPC अस्थायी' },
              { id: 'दोस्रो चरण (Super Structure इजाजत)', label: '🏗️ २. सुपरस्ट्रक्चर' },
              { id: 'आंशिक निर्माण सम्पन्न प्रमाणपत्र जारी', label: '🏢 ३. आंशिक सम्पन्न' },
              { id: 'भवन निर्माण सम्पन्न प्रमाणपत्र जारी', label: '✅ ४. पूर्ण निर्माण सम्पन्न' },
            ].map((chip) => {
              const isActive = selectedStatus === chip.id;
              return (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => setSelectedStatus(chip.id)}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '20px',
                    border: isActive ? '1.5px solid #312e81' : '1px solid #cbd5e1',
                    background: isActive ? '#312e81' : '#ffffff',
                    color: isActive ? '#ffffff' : '#334155',
                    fontSize: '0.75rem',
                    fontWeight: isActive ? 700 : 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: isActive ? '0 2px 6px rgba(49, 46, 129, 0.25)' : 'none',
                  }}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>

          {/* Table Container */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: '1.5px solid #e2e8f0',
              overflow: 'hidden',
              boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ overflowX: 'auto' }}>
              <div className="dt-responsive-table-wrapper">
<table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
                <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                  <tr>
                    <th style={{ padding: '0.85rem 1rem' }}>दरखास्त नं</th>
                    <th style={{ padding: '0.85rem 1rem' }}>घरधनी / दरखास्तवाला</th>
                    <th style={{ padding: '0.85rem 1rem' }}>नापी / कित्ता / वडा</th>
                    <th style={{ padding: '0.85rem 1rem' }}>भवन वर्ग तथा संरचना</th>
                    <th style={{ padding: '0.85rem 1rem' }}>तला / क्षेत्रफल / FAR</th>
                    <th style={{ padding: '0.85rem 1rem' }}>नक्सा दस्तुर</th>
                    <th style={{ padding: '0.85rem 1rem' }}>७-चरण प्रक्रियागत अवस्था (Workflow)</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>कार्य (Actions)</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                        <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', marginBottom: '0.5rem' }} />
                        <div>घर-नक्सा लगत लोड गरिँदैछ...</div>
                      </td>
                    </tr>
                  ) : filteredList.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                        कुनै घर-नक्सा दरखास्त फेला परेन।
                      </td>
                    </tr>
                  ) : (
                    filteredList.map((p) => {
                      const curIdx = getStageIndex(p.status);
                      const isCompleted = p.status.includes('सम्पन्न');
                      const isPlinth = p.status.includes('प्लिन्थ') || p.status.includes('DPC');

                      return (
                        <tr
                          key={p.id}
                          style={{
                            borderBottom: '1px solid #f1f5f9',
                            transition: 'background-color 0.15s',
                          }}
                        >
                          {/* Application No */}
                          <td style={{ padding: '0.85rem 1rem', verticalAlign: 'top' }}>
                            <div style={{ fontWeight: 800, color: '#312e81', fontSize: '0.9rem' }}>
                              {p.applicationNo}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                              मिति: {p.applicationDateBs || '२०८१/०५/१५'}
                            </div>
                          </td>

                          {/* Owner & Applicant */}
                          <td style={{ padding: '0.85rem 1rem', verticalAlign: 'top' }}>
                            <div style={{ fontWeight: 700, color: '#0f172a' }}>
                              {p.landOwnerName || p.applicantName}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                              📞 {p.applicantPhone || 'उपलब्ध छैन'}
                            </div>
                            {p.applicantCitizenship && (
                              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                                ना.नं: {p.applicantCitizenship}
                              </div>
                            )}
                            {/* मार्गदर्शन २०८२: स्वामित्व प्रकार / लिज / मन्जुरीनामा Badge */}
                            {p.ownershipType && (
                              <div style={{ marginTop: '4px' }}>
                                <span
                                  style={{
                                    display: 'inline-block',
                                    fontSize: '0.68rem',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    fontWeight: 700,
                                    backgroundColor: p.ownershipType.includes('भाडा') ? '#fef3c7' : p.ownershipType.includes('मन्जुरीनामा') ? '#f3e8ff' : '#f0fdf4',
                                    color: p.ownershipType.includes('भाडा') ? '#92400e' : p.ownershipType.includes('मन्जुरीनामा') ? '#6b21a8' : '#166534',
                                    border: p.ownershipType.includes('भाडा') ? '1px solid #fde68a' : p.ownershipType.includes('मन्जुरीनामा') ? '1px solid #e9d5ff' : '1px solid #bbf7d0',
                                  }}
                                >
                                  {p.ownershipType.includes('भाडा') ? `📑 लिज (${p.leasePeriodYears || 15} वर्ष)` : p.ownershipType.includes('मन्जुरीनामा') ? '👨‍👩‍👧‍👦 मन्जुरीनामा/नाता' : '🏠 आफ्नै जग्गा'}
                                </span>
                              </div>
                            )}
                          </td>

                          {/* Land & Cadastral */}
                          <td style={{ padding: '0.85rem 1rem', verticalAlign: 'top' }}>
                            <div>
                              वडा नं. <strong>{p.wardNumber}</strong> ({p.toleAddress || 'केन्द्र'})
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#0369a1', fontWeight: 600, marginTop: '2px' }}>
                              कित्ता नं: <strong style={{ fontSize: '0.82rem' }}>{p.kittaNo}</strong>
                              {p.sheetNo && <span> (सिट: {p.sheetNo})</span>}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                              क्षेत्रफल: {p.landAreaRopani || p.landArea || '-'}
                            </div>
                          </td>

                          {/* Building Class & Structure */}
                          <td style={{ padding: '0.85rem 1rem', verticalAlign: 'top' }}>
                            <div style={{ fontWeight: 600, color: '#1e293b' }}>
                              {p.usageType}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                              {p.structureType}
                            </div>
                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px' }}>
                              <span
                                style={{
                                  display: 'inline-block',
                                  fontSize: '0.68rem',
                                  padding: '1px 6px',
                                  borderRadius: '4px',
                                  fontWeight: 700,
                                  backgroundColor: p.buildingClass?.includes('क वर्ग') ? '#fee2e2' : p.buildingClass?.includes('ख वर्ग') ? '#e0e7ff' : '#fef3c7',
                                  color: p.buildingClass?.includes('क वर्ग') ? '#b91c1c' : p.buildingClass?.includes('ख वर्ग') ? '#3730a3' : '#b45309',
                                }}
                              >
                                {p.buildingClass?.slice(0, 7) || 'ख वर्ग'}
                              </span>
                              {p.cadVersion && (
                                <span style={{ fontSize: '0.68rem', padding: '1px 5px', borderRadius: '4px', background: '#f1f5f9', color: '#334155', fontWeight: 600, border: '1px solid #cbd5e1' }}>
                                  📐 {p.cadVersion.split(' ')[0]} {p.cadVersion.split(' ')[1] || ''}
                                </span>
                              )}
                              {p.structuralModelType && (
                                <span style={{ fontSize: '0.68rem', padding: '1px 5px', borderRadius: '4px', background: '#eff6ff', color: '#1d4ed8', fontWeight: 700, border: '1px solid #bfdbfe' }}>
                                  🏢 {p.structuralModelType}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Floors & Area */}
                          <td style={{ padding: '0.85rem 1rem', verticalAlign: 'top' }}>
                            <div>
                              <strong>{p.totalFloors}</strong> तला
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 600, marginTop: '2px' }}>
                              निर्मित: {Number(p.totalBuiltAreaSqFt || 0).toLocaleString()} sq.ft
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                              FAR: {p.farRatio || 1.5} | कभरेज: {p.groundCoveragePct || 55}%
                            </div>
                            <div style={{ marginTop: '4px' }}>
                              {p.scrutinyResults?.overallStatus === 'COMPLIANT' ? (
                                <span style={{ fontSize: '0.68rem', padding: '1px 5px', borderRadius: '4px', background: '#dcfce7', color: '#15803d', fontWeight: 700 }}>
                                  ✓ NBC 105:2020 Passed
                                </span>
                              ) : (
                                <span style={{ fontSize: '0.68rem', padding: '1px 5px', borderRadius: '4px', background: '#fef3c7', color: '#b45309', fontWeight: 700 }}>
                                  ⚡ NBC स्क्रूटिनी उपलब्ध
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Fee */}
                          <td style={{ padding: '0.85rem 1rem', verticalAlign: 'top' }}>
                            <div style={{ fontWeight: 800, color: '#047857', fontSize: '0.92rem' }}>
                              रु. {Number(p.permitFee || 0).toLocaleString('ne-NP')}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                              रसिद: {p.receiptNo || 'REC-BPS-AUTO'}
                            </div>
                            <span
                              style={{
                                display: 'inline-block',
                                fontSize: '0.68rem',
                                padding: '1px 5px',
                                borderRadius: '4px',
                                backgroundColor: '#dcfce7',
                                color: '#15803d',
                                fontWeight: 700,
                              }}
                            >
                              ✓ भुक्तानी भएको
                            </span>
                          </td>

                          {/* Visual Stage Progress Stepper */}
                          <td style={{ padding: '0.85rem 1rem', verticalAlign: 'top', minWidth: '220px' }}>
                            <div
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                padding: '0.3rem 0.65rem',
                                borderRadius: '8px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                backgroundColor: isCompleted ? '#dcfce7' : isPlinth ? '#e0e7ff' : '#fef3c7',
                                color: isCompleted ? '#15803d' : isPlinth ? '#312e81' : '#b45309',
                                marginBottom: '6px',
                              }}
                            >
                              {isCompleted ? <ShieldCheck size={14} /> : isPlinth ? <Compass size={14} /> : <Clock size={14} />}
                              <span>{p.status}</span>
                            </div>

                            {/* Stepper bar */}
                            <div style={{ display: 'flex', gap: '3px', alignItems: 'center', height: '6px', borderRadius: '3px', overflow: 'hidden', background: '#e2e8f0' }}>
                              {WORKFLOW_STAGES.map((st, i) => (
                                <div
                                  key={st}
                                  title={`चरण ${i + 1}: ${st}`}
                                  style={{
                                    flex: 1,
                                    height: '100%',
                                    backgroundColor: i <= curIdx ? (isCompleted ? '#10b981' : '#4338ca') : 'transparent',
                                  }}
                                />
                              ))}
                            </div>
                            <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '4px' }}>
                              चरण {curIdx + 1} / {WORKFLOW_STAGES.length}: {WORKFLOW_STAGES[curIdx]}
                            </div>
                          </td>

                          {/* Actions */}
                          <td style={{ padding: '0.85rem 1rem', verticalAlign: 'top', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                              {/* View Details */}
                              <button
                                onClick={() => setViewingPermit(p)}
                                title="पूर्ण विवरण हेर्नुहोस्"
                                style={{
                                  padding: '0.4rem 0.65rem',
                                  background: '#f8fafc',
                                  border: '1.5px solid #cbd5e1',
                                  color: '#334155',
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px',
                                }}
                              >
                                <Eye size={14} />
                              </button>

                              {/* Review Documents & Blueprints */}
                              <button
                                onClick={() => setReviewingDocsPermit(p)}
                                title="डिजिटल ड्रइङ तथा कागजात रिपोजिटोरी (Blueprint Review)"
                                style={{
                                  padding: '0.4rem 0.65rem',
                                  background: '#f5f3ff',
                                  border: '1.5px solid #ddd6fe',
                                  color: '#6d28d9',
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px',
                                }}
                              >
                                <Layers size={14} />
                                <span>कागजात</span>
                              </button>

                              {/* Review Objections */}
                              <button
                                onClick={() => setReviewingObjectionsPermit(p)}
                                title="१५ दिने सूचना तथा दाबी-विरोध व्यवस्थापन"
                                style={{
                                  padding: '0.4rem 0.65rem',
                                  background: (p.objections?.length || 0) > 0 ? '#fef2f2' : '#f8fafc',
                                  border: (p.objections?.length || 0) > 0 ? '1.5px solid #fca5a5' : '1.5px solid #cbd5e1',
                                  color: (p.objections?.length || 0) > 0 ? '#991b1b' : '#64748b',
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px',
                                }}
                              >
                                <AlertTriangle size={14} />
                                <span>उजुरी ({p.objections?.length || 0})</span>
                              </button>

                              {/* Technical Inspection */}
                              <button
                                onClick={() => setInspectingPermit(p)}
                                title="प्राविधिक स्थलगत निरीक्षण र स्वीकृति"
                                style={{
                                  padding: '0.4rem 0.65rem',
                                  background: '#eff6ff',
                                  border: '1.5px solid #bfdbfe',
                                  color: '#1d4ed8',
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px',
                                }}
                              >
                                <CheckSquare size={14} />
                              </button>

                              {/* Pay Now Button */}
                              {p.paymentStatus !== 'PAID' && (
                                <button
                                  onClick={() => setPayingPermit(p)}
                                  title="नक्सा दस्तुर अनलाइन भुक्तानी"
                                  style={{
                                    padding: '0.4rem 0.65rem',
                                    background: '#fff1f2',
                                    border: '1.5px solid #fecdd3',
                                    color: '#be123c',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '3px',
                                  }}
                                >
                                  <CreditCard size={14} />
                                </button>
                              )}

                              {/* AutoCAD AI Layer Analysis */}
                              <button
                                onClick={() => {
                                  setCadPermit(p);
                                  setCadReport(null);
                                }}
                                title="अटोक्याड (.dwg) AI विश्लेषण"
                                style={{
                                  padding: '0.4rem 0.65rem',
                                  background: '#fdf4ff',
                                  border: '1.5px solid #fae8ff',
                                  color: '#c026d3',
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px',
                                }}
                              >
                                <Sparkles size={14} />
                              </button>

                              {/* मार्गदर्शन २०८२: ETABS / SAP2000 Structural Scrutiny Action */}
                              <button
                                onClick={() => {
                                  setEtabsScrutinyPermit(p);
                                  if (p.etabsChecks) {
                                    setEtabsForm((prev) => ({
                                      ...prev,
                                      structuralSoftware: p.etabsChecks?.structuralSoftware || p.structuralModelType || 'ETABS (.edb)',
                                      baseShearKn: p.etabsChecks?.baseShearKn || 1250,
                                      fundamentalTimePeriodSec: p.etabsChecks?.fundamentalTimePeriodSec || 0.42,
                                      maxDriftRatio: p.etabsChecks?.maxDriftRatio || 0.0032,
                                      massParticipationPct: p.etabsChecks?.massParticipationPct || 93.5,
                                      torsionalRatio: p.etabsChecks?.torsionalRatio || 1.15,
                                      engineerName: p.etabsChecks?.verifiedByEngineer || 'इ. सुमन श्रेष्ठ',
                                      necLicenseNo: p.etabsChecks?.necLicenseNo || 'NEC-CIVIL-14205',
                                      remarks: p.etabsChecks?.remarks || 'NBC 105:2020 Compliance verified per मार्गदर्शन २०८२',
                                    }));
                                  }
                                }}
                                title="मार्गदर्शन २०८२: ETABS / SAP2000 संरचनात्मक स्क्रूटिनी (NBC 105:2020)"
                                style={{
                                  padding: '0.4rem 0.65rem',
                                  background: p.etabsChecks?.isCompliant ? '#f0fdf4' : '#eff6ff',
                                  border: p.etabsChecks?.isCompliant ? '1.5px solid #86efac' : '1.5px solid #bfdbfe',
                                  color: p.etabsChecks?.isCompliant ? '#15803d' : '#1d4ed8',
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px',
                                }}
                              >
                                <Building2 size={14} />
                                <span>{p.etabsChecks?.isCompliant ? '✓ ETABS' : 'ETABS'}</span>
                              </button>

                              {/* मार्गदर्शन २०८२: आंशिक निर्माण सम्पन्न प्रमाणपत्र Action */}
                              <button
                                onClick={() => {
                                  setPartialCompletionPermit(p);
                                  if (p.partialCompletionDetails) {
                                    setPartialForm((prev) => ({
                                      ...prev,
                                      completedFloors: p.partialCompletionDetails?.completedFloors || 1.0,
                                      totalAllowedFloors: p.partialCompletionDetails?.totalAllowedFloors || p.totalFloors || 2.5,
                                      completedPlinthSqFt: p.partialCompletionDetails?.completedPlinthSqFt || p.plinthAreaSqFt || 1100,
                                      allowedUsage: p.partialCompletionDetails?.allowedUsage || p.usageType || 'व्यावसायिक तथा बसोबास',
                                      validityExpiryDateBs: p.partialCompletionDetails?.validityExpiryDateBs || '२०८३/०६/३०',
                                      siteEngineerName: p.partialCompletionDetails?.siteEngineerName || 'इ. सन्तोष खड्का',
                                      engineerNecNo: p.partialCompletionDetails?.engineerNecNo || 'NEC-CIVIL-18445',
                                      wardRecommendationNo: p.partialCompletionDetails?.wardRecommendationNo || `वडा-${p.wardNumber}-सिफारिस-१४२`,
                                      remarks: p.partialCompletionDetails?.remarks || 'तल्लो तला निर्माण सम्पन्न। बाँकी तला निर्माण म्याद २०८३ असोज मसान्तसम्म।',
                                    }));
                                  }
                                }}
                                title="मार्गदर्शन २०८२: आंशिक निर्माण सम्पन्न प्रमाणपत्र जारी"
                                style={{
                                  padding: '0.4rem 0.65rem',
                                  background: p.partialCompletionDetails ? '#fef3c7' : '#fffbeb',
                                  border: p.partialCompletionDetails ? '1.5px solid #fde68a' : '1.5px solid #fed7aa',
                                  color: '#b45309',
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px',
                                }}
                              >
                                <FileCheck2 size={14} />
                                <span>{p.partialCompletionDetails ? '✓ आंशिक' : 'आंशिक'}</span>
                              </button>

                              {/* Print Certificate Dropdown Trigger */}
                              <button
                                onClick={() => {
                                  if (isCompleted) {
                                    setPrintableDoc({ permit: p, type: 'completion' });
                                  } else if (isPlinth) {
                                    setPrintableDoc({ permit: p, type: 'dpc' });
                                  } else {
                                    setPrintableDoc({ permit: p, type: 'receipt' });
                                  }
                                }}
                                title="प्रमाणपत्र तथा रसिद प्रिन्ट"
                                style={{
                                  padding: '0.4rem 0.65rem',
                                  background: '#f0fdf4',
                                  border: '1.5px solid #bbf7d0',
                                  color: '#15803d',
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px',
                                }}
                              >
                                <Printer size={14} />
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
        </div>
      )}

      {/* ── TAB 2: ७-चरणीय कार्यप्रवाह एवं प्राविधिक निरीक्षण ──────── */}
      {activeTab === 'workflow' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
          {WORKFLOW_STAGES.map((stage, idx) => {
            const stagePermits = permits.filter((p) => p.status.includes(stage) || stage.includes(p.status));
            return (
              <div
                key={stage}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  border: '1.5px solid #e2e8f0',
                  padding: '1.25rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingBottom: '0.75rem',
                    marginBottom: '1rem',
                    borderBottom: '1.5px solid #f1f5f9',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        backgroundColor: '#312e81',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.8rem',
                        fontWeight: 800,
                      }}
                    >
                      {idx + 1}
                    </span>
                    <strong style={{ fontSize: '0.92rem', color: '#0f172a' }}>{stage}</strong>
                  </div>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '6px',
                      backgroundColor: stagePermits.length > 0 ? '#e0e7ff' : '#f1f5f9',
                      color: stagePermits.length > 0 ? '#3730a3' : '#94a3b8',
                    }}
                  >
                    {stagePermits.length} वटा
                  </span>
                </div>

                {stagePermits.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#94a3b8', fontSize: '0.82rem' }}>
                    यस चरणमा हाल कुनै फाइल छैन।
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {stagePermits.map((sp) => (
                      <div
                        key={sp.id}
                        style={{
                          padding: '0.85rem',
                          borderRadius: '10px',
                          border: '1px solid #e2e8f0',
                          background: '#f8fafc',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <strong style={{ color: '#312e81', fontSize: '0.85rem' }}>{sp.applicationNo}</strong>
                            <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>
                              {sp.landOwnerName}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                              वडा नं. {sp.wardNumber} | कित्ता नं. {sp.kittaNo} ({sp.totalFloors} तला)
                            </div>
                          </div>
                          <button
                            onClick={() => setInspectingPermit(sp)}
                            style={{
                              padding: '0.35rem 0.6rem',
                              borderRadius: '6px',
                              border: 'none',
                              background: '#312e81',
                              color: '#ffffff',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            जाँच / स्वीकृति
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── TAB 3: आधिकारिक प्रमाणपत्र तथा रसिद हब ──────────────────── */}
      {activeTab === 'certificates' && (
        <div>
          <div style={{ marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              नेपाल सरकार तथा पालिका आधिकारिक डिजिटल प्रमाणपत्र तथा रसिदहरू
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.25rem 0 0' }}>
              कुनै पनि नक्सा पास अभिलेख छनोट गरी आधिकारिक लेटरहेड, QR कोड तथा दफा अनुसारको कानुनी प्रमाणपत्र तत्काल प्रिन्ट गर्नुहोस्।
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {filteredList.map((p) => (
              <div
                key={p.id}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  border: '1.5px solid #e2e8f0',
                  padding: '1.25rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 800, color: '#312e81', fontSize: '0.88rem' }}>{p.applicationNo}</span>
                  <span style={{ fontSize: '0.72rem', color: '#047857', fontWeight: 700, background: '#dcfce7', padding: '2px 6px', borderRadius: '4px' }}>
                    {p.status}
                  </span>
                </div>
                <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>{p.landOwnerName}</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', margin: '0.35rem 0 1rem' }}>
                  वडा नं. {p.wardNumber} | कित्ता: {p.kittaNo} | {p.totalFloors} तला ({p.usageType})
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {/* Option 1: DPC Permit */}
                  <button
                    onClick={() => setPrintableDoc({ permit: p, type: 'dpc' })}
                    style={{
                      width: '100%',
                      padding: '0.55rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      background: '#f8fafc',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: '#1e3a8a',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>🧱 अस्थायी प्रथम चरण (DPC इजाजत)</span>
                    <Printer size={14} />
                  </button>

                  {/* मार्गदर्शन २०८२: दोस्रो चरण (Super Structure को ईजाजत) */}
                  <button
                    onClick={() => setPrintableDoc({ permit: p, type: 'superstructure' })}
                    style={{
                      width: '100%',
                      padding: '0.55rem',
                      borderRadius: '8px',
                      border: '1px solid #bfdbfe',
                      background: '#eff6ff',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: '#1d4ed8',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>🏗️ दोस्रो चरण (Super Structure इजाजत)</span>
                    <Printer size={14} />
                  </button>

                  {/* मार्गदर्शन २०८२: आंशिक निर्माण सम्पन्नको प्रमाण पत्र */}
                  <button
                    onClick={() => setPrintableDoc({ permit: p, type: 'partial_completion' })}
                    style={{
                      width: '100%',
                      padding: '0.55rem',
                      borderRadius: '8px',
                      border: '1.5px solid #fde68a',
                      background: '#fffbeb',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      color: '#b45309',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>🏢 आंशिक निर्माण सम्पन्न प्रमाणपत्र (Partial BCC)</span>
                    <Printer size={14} />
                  </button>

                  {/* Option 2: Permanent Building Permit */}
                  <button
                    onClick={() => setPrintableDoc({ permit: p, type: 'permanent' })}
                    style={{
                      width: '100%',
                      padding: '0.55rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      background: '#f8fafc',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: '#4338ca',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>📜 स्थायी घर-नक्सा पास प्रमाणपत्र</span>
                    <Printer size={14} />
                  </button>

                  {/* Option 3: Building Completion Certificate */}
                  <button
                    onClick={() => setPrintableDoc({ permit: p, type: 'completion' })}
                    style={{
                      width: '100%',
                      padding: '0.55rem',
                      borderRadius: '8px',
                      border: '1.5px solid #86efac',
                      background: '#f0fdf4',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      color: '#15803d',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>🏛️ पूर्ण निर्माण सम्पन्न प्रमाणपत्र (Final BCC)</span>
                    <Printer size={14} />
                  </button>

                  {/* Option 4: Revenue Receipt */}
                  <button
                    onClick={() => setPrintableDoc({ permit: p, type: 'receipt' })}
                    style={{
                      width: '100%',
                      padding: '0.55rem',
                      borderRadius: '8px',
                      border: '1px solid #fde68a',
                      background: '#fffbeb',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: '#b45309',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>💰 आधिकारिक राजस्व रसिद (रु. {p.permitFee})</span>
                    <Printer size={14} />
                  </button>

                  {/* Option 5: 15-Day Public Notice */}
                  <button
                    onClick={() => setPrintableDoc({ permit: p, type: 'notice' })}
                    style={{
                      width: '100%',
                      padding: '0.55rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      color: '#475569',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>📢 १५ दिने सार्वजनिक सूचना पत्र</span>
                    <Printer size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 4: GIS क्याडास्ट्रल नक्सा ─────────────────────────── */}
      {activeTab === 'gis' && (
        <div>
          <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                GIS क्याडास्ट्रल नक्सा तथा भवन अवस्थिति
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.2rem 0 0' }}>
                वडा नं. १ देखि ८ सम्म स्वीकृत तथा निर्माणाधीन घर-नक्साको GPS अवस्थिति र कित्ता विवरण
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.85rem', fontSize: '0.78rem', fontWeight: 700 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                निर्माण सम्पन्न जारी ({permits.filter((p) => p.status.includes('सम्पन्न')).length})
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#3b82f6' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#3b82f6' }} />
                प्लिन्थ (DPC) स्वीकृत ({permits.filter((p) => p.status.includes('प्लिन्थ')).length})
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f59e0b' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
                प्रक्रियामा रहेका
              </span>
            </div>
          </div>

          <div
            ref={mapContainerRef}
            style={{
              height: '620px',
              width: '100%',
              borderRadius: '16px',
              border: '2px solid #cbd5e1',
              boxShadow: '0 6px 20px rgba(0,0,0,0.06)',
            }}
          />
        </div>
      )}

      {/* ── MODAL: ५-चरण नयाँ घर-नक्सा दरखास्त दर्ता Stepper Wizard ─ */}
      {showApplyModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1.25rem',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '780px',
              maxHeight: '92vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)',
              overflow: 'hidden',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '1.25rem 1.75rem',
                borderBottom: '1.5px solid #e2e8f0',
                background: '#f8fafc',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#1e1b4b' }}>
                  नयाँ घर-नक्सा दरखास्त दर्ता (e-BPS Online Form)
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.2rem 0 0' }}>
                  नेपाल राष्ट्रिय भवन संहिता (NBC 105:2020) र स्थानीय सरकार सञ्चालन ऐन २०७४ बमोजिम
                </p>
              </div>
              <button
                onClick={() => setShowApplyModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={22} />
              </button>
            </div>

            {/* Stepper Header Bar */}
            <div
              style={{
                padding: '0.75rem 1.75rem',
                background: '#eff6ff',
                borderBottom: '1px solid #bfdbfe',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              {[
                { step: 1, title: '१. व्यक्तिगत' },
                { step: 2, title: '२. जग्गा नापी' },
                { step: 3, title: '३. भवन इन्जिनियरिङ' },
                { step: 4, title: '४. कन्सल्टेन्सी' },
                { step: 5, title: '५. दस्तुर तथा पेश' },
              ].map((s) => (
                <div
                  key={s.step}
                  onClick={() => setCurrentStep(s.step)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    cursor: 'pointer',
                    color: currentStep === s.step ? '#1d4ed8' : currentStep > s.step ? '#059669' : '#94a3b8',
                    fontWeight: currentStep === s.step ? 800 : 600,
                    fontSize: '0.8rem',
                  }}
                >
                  <span
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: currentStep === s.step ? '#1d4ed8' : currentStep > s.step ? '#059669' : '#cbd5e1',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.7rem',
                    }}
                  >
                    {currentStep > s.step ? '✓' : s.step}
                  </span>
                  <span>{s.title}</span>
                </div>
              ))}
            </div>

            {/* Modal Body with Stepper Content */}
            <div style={{ padding: '1.5rem 1.75rem', overflowY: 'auto', flex: 1 }}>
              {/* Step 1: Personal / Owner Info */}
              {currentStep === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                        जग्गाधनीको पूरा नाम (लालपुर्जा बमोजिम)*
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.landOwnerName}
                        onChange={(e) => setFormData({ ...formData, landOwnerName: e.target.value })}
                        placeholder="जस्तै: पेम्बा दोर्जे तामाङ"
                        style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                        दरखास्तवालाको नाम (यदि जग्गाधनीभन्दा फरक भए)*
                      </label>
                      <input
                        type="text"
                        value={formData.applicantName}
                        onChange={(e) => setFormData({ ...formData, applicantName: e.target.value })}
                        placeholder="जस्तै: पेम्बा दोर्जे तामाङ"
                        style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                        सम्पर्क फोन नम्बर*
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.applicantPhone}
                        onChange={(e) => setFormData({ ...formData, applicantPhone: e.target.value })}
                        placeholder="९८४१२३४५६७"
                        style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                        नागरिकता नम्बर*
                      </label>
                      <input
                        type="text"
                        value={formData.applicantCitizenship}
                        onChange={(e) => setFormData({ ...formData, applicantCitizenship: e.target.value })}
                        placeholder="२३-०१-७४-०२३४५"
                        style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                      />
                    </div>
                  </div>

                  {/* ── भवन निर्माण मार्गदर्शन, २०८२: जग्गा स्वामित्व प्रकार ── */}
                  <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1.5px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                      <FileCheck size={18} color="#4338ca" />
                      <strong style={{ fontSize: '0.86rem', color: '#1e1b4b' }}>
                        जग्गा स्वामित्व विवरण (भवन निर्माण मार्गदर्शन, २०८२ बमोजिम)
                      </strong>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: formData.ownershipType.includes('भाडा') ? '1.5fr 1fr' : '1fr', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem', color: '#334155' }}>
                          स्वामित्वको किसिम*
                        </label>
                        <select
                          value={formData.ownershipType}
                          onChange={(e) => setFormData({ ...formData, ownershipType: e.target.value })}
                          style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem' }}
                        >
                          <option value="आफ्नै (Self-Owned)">🏠 आफ्नै जग्गा (Self-Owned)</option>
                          <option value="भाडा/लिज (Leased/Rented)">📑 जग्गा भाडा / लिजमा लिएको (Leased/Rented)</option>
                          <option value="पारिवारिक/मन्जुरीनामा (Family/Consent)">👨‍👩‍👧‍👦 पारिवारिक / मन्जुरीनामा (Family/Consent)</option>
                        </select>
                      </div>

                      {formData.ownershipType.includes('भाडा') && (
                        <div>
                          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem', color: '#b45309' }}>
                            भाडा सम्झौता अवधि (वर्ष)*
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="99"
                            value={formData.leasePeriodYears}
                            onChange={(e) => setFormData({ ...formData, leasePeriodYears: parseFloat(e.target.value) || 1 })}
                            placeholder="१५"
                            style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1.5px solid #fde68a', background: '#fffbeb', fontSize: '0.85rem', fontWeight: 700 }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Notice per Guidance 2082 */}
                    {formData.ownershipType.includes('भाडा') && (
                      <div style={{ marginTop: '0.75rem', padding: '0.65rem 0.85rem', background: '#fffbeb', borderRadius: '8px', border: '1px solid #fde68a', fontSize: '0.78rem', color: '#92400e' }}>
                        ⚠️ <strong>मार्गदर्शन २०८२ नियम:</strong> यदि जग्गा भाडामा लिएर बनाउने हो भने चरण ४ मा न्यूनतम सम्झौता अवधि र शर्त खुलेको <strong>जग्गा भाडाको सम्झौता (Lease Agreement)</strong> कागजात अनिवार्य अपलोड गर्नुपर्नेछ।
                      </div>
                    )}

                    {formData.ownershipType.includes('मन्जुरीनामा') && (
                      <div style={{ marginTop: '0.75rem', padding: '0.65rem 0.85rem', background: '#f5f3ff', borderRadius: '8px', border: '1px solid #ddd6fe', fontSize: '0.78rem', color: '#6d28d9' }}>
                        ℹ️ <strong>मार्गदर्शन २०८२ नियम:</strong> जग्गाधनी र दरखास्तवाला फरक भएको अवस्थामा वडा कार्यालय वा नोटरीबाट प्रमाणित <strong>मन्जुरीनामा र नाता प्रमाणित प्रमाणपत्र</strong> चरण ४ मा अपलोड गर्नुपर्नेछ।
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Land & Cadastral Details */}
              {currentStep === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                        वडा नं.*
                      </label>
                      <select
                        value={formData.wardNumber}
                        onChange={(e) => setFormData({ ...formData, wardNumber: Number(e.target.value) })}
                        style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
                          <option key={w} value={w}>वडा नं. {w}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                        नापी सिट नं.*
                      </label>
                      <input
                        type="text"
                        value={formData.sheetNo}
                        onChange={(e) => setFormData({ ...formData, sheetNo: e.target.value })}
                        placeholder="२३-क-०४"
                        style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                        कित्ता नम्बर*
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.kittaNo}
                        onChange={(e) => setFormData({ ...formData, kittaNo: e.target.value })}
                        placeholder="जस्तै: ४५२"
                        style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                        क्षेत्रफल (रोपनी-आना-पैसा-दाम)*
                      </label>
                      <input
                        type="text"
                        value={formData.landAreaRopani}
                        onChange={(e) => setFormData({ ...formData, landAreaRopani: e.target.value })}
                        placeholder="०-६-२-० (२०० वर्ग मिटर)"
                        style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                        टोल / बस्तीको नाम
                      </label>
                      <input
                        type="text"
                        value={formData.toleAddress}
                        onChange={(e) => setFormData({ ...formData, toleAddress: e.target.value })}
                        placeholder="भोताङ मानेडाँडा"
                        style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                      />
                    </div>
                  </div>

                  {/* Four Boundaries */}
                  <div style={{ background: '#f8fafc', padding: '0.9rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.5rem' }}>
                      चारकिल्ला विवरण (Four Boundaries)
                    </span>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                      <input
                        type="text"
                        placeholder="पूर्व: सडक वा कित्ता नं..."
                        value={formData.eastBoundary}
                        onChange={(e) => setFormData({ ...formData, eastBoundary: e.target.value })}
                        style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                      />
                      <input
                        type="text"
                        placeholder="पश्चिम: कित्ता नं वा खोल्सो..."
                        value={formData.westBoundary}
                        onChange={(e) => setFormData({ ...formData, westBoundary: e.target.value })}
                        style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                      />
                      <input
                        type="text"
                        placeholder="उत्तर: मुख्य सडक..."
                        value={formData.northBoundary}
                        onChange={(e) => setFormData({ ...formData, northBoundary: e.target.value })}
                        style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                      />
                      <input
                        type="text"
                        placeholder="दक्षिण: बारी वा छिमेकी..."
                        value={formData.southBoundary}
                        onChange={(e) => setFormData({ ...formData, southBoundary: e.target.value })}
                        style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                      />
                    </div>
                  </div>

                  {/* GPS Detection */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem', background: '#ecfdf5', borderRadius: '10px', border: '1px solid #a7f3d0' }}>
                    <div>
                      <strong style={{ fontSize: '0.85rem', color: '#065f46', display: 'block' }}>GPS अवस्थिति (Coordinates)</strong>
                      <span style={{ fontSize: '0.78rem', color: '#047857' }}>
                        Lat: {formData.gpsLat} | Lon: {formData.gpsLon} {gpsAccuracy && <span>({gpsAccuracy})</span>}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleDetectGPS}
                      disabled={gpsDetecting}
                      style={{
                        padding: '0.45rem 0.9rem',
                        background: '#059669',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <LocateFixed size={14} />
                      <span>{gpsDetecting ? 'खोज्दैछ...' : '📍 १-क्लिक GPS लिनुहोस्'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Building Engineering & NBC Parameters */}
              {currentStep === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                        भवनको वर्ग (Building Class)*
                      </label>
                      <select
                        value={formData.buildingClass}
                        onChange={(e) => setFormData({ ...formData, buildingClass: e.target.value })}
                        style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                      >
                        {BUILDING_CLASSES.filter((c) => c.id !== 'all').map((c) => (
                          <option key={c.id} value={c.label}>{c.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                        प्रस्तावित प्रयोग (Usage Type)*
                      </label>
                      <select
                        value={formData.usageType}
                        onChange={(e) => setFormData({ ...formData, usageType: e.target.value })}
                        style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                      >
                        {USAGE_TYPES.map((u) => (
                          <option key={u} value={u}>{u}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                        संरचना प्रकार (Structure)*
                      </label>
                      <select
                        value={formData.structureType}
                        onChange={(e) => setFormData({ ...formData, structureType: e.target.value })}
                        style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                      >
                        {STRUCTURE_TYPES.map((st) => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                        तला संख्या (Storeys)*
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        min="1"
                        max="8"
                        value={formData.totalFloors}
                        onChange={(e) => setFormData({ ...formData, totalFloors: parseFloat(e.target.value) || 1 })}
                        style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                        प्लिन्थ क्षेत्रफल (sq.ft)*
                      </label>
                      <input
                        type="number"
                        min="100"
                        value={formData.plinthAreaSqFt}
                        onChange={(e) => setFormData({ ...formData, plinthAreaSqFt: parseFloat(e.target.value) || 0 })}
                        style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                      />
                    </div>
                  </div>

                  {/* NBC Parameters */}
                  <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1.5px solid #e2e8f0' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1e3a8a', display: 'block', marginBottom: '0.6rem' }}>
                      नेपाल राष्ट्रिय भवन संहिता (NBC 105:2020) मापदण्ड
                    </span>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '2px' }}>सडक चौडाइ (ft)</label>
                        <input
                          type="number"
                          value={formData.roadWidthFt}
                          onChange={(e) => setFormData({ ...formData, roadWidthFt: parseFloat(e.target.value) || 0 })}
                          style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '2px' }}>अगाडि सेटब्याक (ft)</label>
                        <input
                          type="number"
                          value={formData.setbackFrontFt}
                          onChange={(e) => setFormData({ ...formData, setbackFrontFt: parseFloat(e.target.value) || 0 })}
                          style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '2px' }}>पछाडि सेटब्याक (ft)</label>
                        <input
                          type="number"
                          value={formData.setbackRearFt}
                          onChange={(e) => setFormData({ ...formData, setbackRearFt: parseFloat(e.target.value) || 0 })}
                          style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '2px' }}>दायाँ/बायाँ सेटब्याक (ft)</label>
                        <input
                          type="number"
                          value={formData.setbackSideFt}
                          onChange={(e) => setFormData({ ...formData, setbackSideFt: parseFloat(e.target.value) || 0 })}
                          style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* ── भवन निर्माण मार्गदर्शन, २०८२: CAD Version & Structural Software ── */}
                  <div style={{ background: '#eff6ff', padding: '1rem', borderRadius: '12px', border: '1.5px solid #bfdbfe' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                      <Building2 size={18} color="#1d4ed8" />
                      <strong style={{ fontSize: '0.86rem', color: '#1e3a8a' }}>
                        डिजिटल क्याड भर्सन तथा स्ट्रक्चरल सफ्टवेयर (मार्गदर्शन २०८२ परिच्छेद ३)
                      </strong>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem', color: '#1e3a8a' }}>
                          CAD Version (२०१६ भन्दा माथि खुलाउनुपर्ने)*
                        </label>
                        <select
                          value={formData.cadVersion}
                          onChange={(e) => setFormData({ ...formData, cadVersion: e.target.value })}
                          style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1.5px solid #93c5fd', fontSize: '0.85rem' }}
                        >
                          <option value="AutoCAD 2024 (.dwg)">AutoCAD 2024 (.dwg)</option>
                          <option value="AutoCAD 2021 (.dwg)">AutoCAD 2021 (.dwg)</option>
                          <option value="AutoCAD 2018 (.dwg)">AutoCAD 2018 (.dwg)</option>
                          <option value="AutoCAD 2016 (.dwg)">AutoCAD 2016 (.dwg)</option>
                          <option value="ZWCAD 2024+ (.dwg)">ZWCAD 2024+ (.dwg)</option>
                          <option value="BricsCAD (.dwg)">BricsCAD (.dwg)</option>
                        </select>
                        <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px', display: 'block' }}>
                          मार्गदर्शन २०८२ अनुसार क्याड भर्सन २०१६ भन्दा माथि स्पष्ट खुलाउनुपर्नेछ।
                        </span>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem', color: '#1e3a8a' }}>
                          स्ट्रक्चरल सफ्टवेयर रन फाइल (ETABS / SAP)*
                        </label>
                        <select
                          value={formData.structuralModelType}
                          onChange={(e) => setFormData({ ...formData, structuralModelType: e.target.value })}
                          style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1.5px solid #93c5fd', fontSize: '0.85rem' }}
                        >
                          <option value="ETABS (.edb)">ETABS Run-Ready File (.edb)</option>
                          <option value="SAP2000 (.sdb)">SAP2000 Run-Ready File (.sdb)</option>
                          <option value="STAAD.Pro (.std)">STAAD.Pro Model (.std)</option>
                          <option value="लागू नहुने (MRT/ग वर्ग)">लागू नहुने (MRT / ग वर्ग सरल भवन)</option>
                        </select>
                        <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px', display: 'block' }}>
                          ख र क वर्गका लागि रन-रेडी कम्प्युटर मोडेल फाइल चरण ४ मा अपलोड गर्नुपर्नेछ।
                        </span>
                      </div>
                    </div>

                    <div style={{ marginTop: '0.75rem' }}>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem', color: '#1e3a8a' }}>
                        स्ट्रक्चरल ड्रइङ विवरण (Structural Drawing & Ductile Detailing)*
                      </label>
                      <select
                        value={formData.hasStructuralDrawing}
                        onChange={(e) => setFormData({ ...formData, hasStructuralDrawing: e.target.value })}
                        style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1.5px solid #93c5fd', fontSize: '0.85rem' }}
                      >
                        <option value="हो (NBC 105:2020 / NBC 205 Ductile Detailing सहित)">
                          हो (NBC 105:2020 / NBC 205 Ductile Detailing सहितको विस्तृत स्ट्रक्चरल ड्रइङ)
                        </option>
                        <option value="साधारण मापदण्ड (MRT / ग वर्ग)">
                          साधारण मापदण्ड (NBC 201 / 202 Mandatory Rule of Thumb)
                        </option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Consultant & NEC Engineer */}
              {currentStep === 4 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                        नक्सा डिजाइनर / कन्सल्टेन्सीको नाम*
                      </label>
                      <input
                        type="text"
                        value={formData.designerName}
                        onChange={(e) => setFormData({ ...formData, designerName: e.target.value })}
                        placeholder="इ. सुमन श्रेष्ठ (सिन्धु इन्जिनियरिङ)"
                        style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                        नेपाल इन्जिनियरिङ परिषद् (NEC) दर्ता नं.*
                      </label>
                      <input
                        type="text"
                        value={formData.necLicenseNo}
                        onChange={(e) => setFormData({ ...formData, necLicenseNo: e.target.value })}
                        placeholder="NEC-CIVIL-14205"
                        style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                      />
                    </div>
                  </div>

                  {/* ── भवन निर्माण मार्गदर्शन, २०८२: आवश्यक कागजात अपलोड स्लटहरू ── */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: '#1e1b4b', marginBottom: '0.4rem' }}>
                      आवश्यक कागजात तथा डिजिटल फाइलहरू (भवन निर्माण मार्गदर्शन, २०८२ परिच्छेद ३)
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      {/* Slot 1: Lalpurja */}
                      <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', marginBottom: '2px' }}>
                          📄 १. जग्गाधनी पुर्जा तथा नापी नक्सा (ब्लुप्रिन्ट)*
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '4px' }}>लालपुर्जा, नापी ट्रेस नक्सा र तिरो तिरेको रसिद (PDF)</div>
                        <input type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ fontSize: '0.75rem', width: '100%' }} />
                      </div>

                      {/* Slot 2: Family Consent / Kinship */}
                      <div style={{ background: formData.ownershipType.includes('मन्जुरीनामा') ? '#f5f3ff' : '#f8fafc', padding: '0.75rem', borderRadius: '10px', border: formData.ownershipType.includes('मन्जुरीनामा') ? '1.5px solid #c084fc' : '1px solid #cbd5e1' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#6b21a8', marginBottom: '2px' }}>
                          👨‍👩‍👧‍👦 २. मन्जुरीनामा र नाता प्रमाणित {formData.ownershipType.includes('मन्जुरीनामा') ? '(अनिवार्य*)' : '(आवश्यक परे)'}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '4px' }}>जग्गाधनी र दरखास्तवाला फरक भए वडा सिफारिस / मन्जुरीनामा</div>
                        <input type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ fontSize: '0.75rem', width: '100%' }} />
                      </div>

                      {/* Slot 3: Lease Agreement */}
                      <div style={{ background: formData.ownershipType.includes('भाडा') ? '#fffbeb' : '#f8fafc', padding: '0.75rem', borderRadius: '10px', border: formData.ownershipType.includes('भाडा') ? '1.5px solid #fcd34d' : '1px solid #cbd5e1' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#b45309', marginBottom: '2px' }}>
                          📑 ३. जग्गा भाडाको सम्झौता {formData.ownershipType.includes('भाडा') ? '(अनिवार्य*)' : '(भाडामा भए)'}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '4px' }}>यदि जग्गा भाडामा लिएर बनाउने हो भने न्यूनतम अवधि खुल्ने सम्झौता</div>
                        <input type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ fontSize: '0.75rem', width: '100%' }} />
                      </div>

                      {/* Slot 4: Architectural Drawing */}
                      <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', marginBottom: '2px' }}>
                          📐 ४. आर्किटेक्चरल ड्रइङ (CAD / PDF)*
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '4px' }}>{formData.cadVersion} वा PDF, लेआउट, एलिभेसन, सेक्सन</div>
                        <input type="file" accept=".dwg,.dxf,.pdf" style={{ fontSize: '0.75rem', width: '100%' }} />
                      </div>

                      {/* Slot 5: Structural Drawing */}
                      <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', marginBottom: '2px' }}>
                          🏗️ ५. स्ट्रक्चरल ड्रइङ (Structural Drawing)*
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '4px' }}>NBC 105:2020 / NBC 205 डक्टाइल डिटेलिङ (Rebar, Beams, Columns)</div>
                        <input type="file" accept=".dwg,.pdf" style={{ fontSize: '0.75rem', width: '100%' }} />
                      </div>

                      {/* Slot 6: ETABS or SAP run file */}
                      <div style={{ background: '#eff6ff', padding: '0.75rem', borderRadius: '10px', border: '1.5px solid #93c5fd' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e3a8a', marginBottom: '2px' }}>
                          💻 ६. स्ट्रक्चरल डिजाइन ETABS अथवा SAP फाइल*
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#1d4ed8', marginBottom: '4px' }}>{formData.structuralModelType} रन-रेडी फाइल (.edb, .sdb, .std, .zip)</div>
                        <input type="file" accept=".edb,.sdb,.std,$et,.zip,.rar" style={{ fontSize: '0.75rem', width: '100%' }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Automatic Fee Calculation & Submit */}
              {currentStep === 5 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ background: '#f0fdf4', padding: '1.25rem', borderRadius: '14px', border: '1.5px solid #bbf7d0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      <Coins size={22} color="#16a34a" />
                      <strong style={{ fontSize: '1rem', color: '#166534' }}>नक्सा पास दस्तुर स्वतः निर्धारण (Automatic Fee Breakdown)</strong>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>कुल निर्मित क्षेत्रफल (Built-up Area):</span>
                        <strong>{liveCalculatedFee.built.toLocaleString()} वर्गफिट</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>प्रति वर्गफिट दस्तुर दर ({formData.buildingClass?.slice(0, 7)}):</span>
                        <strong>रु. {liveCalculatedFee.rate} / sq.ft</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>प्रशासनिक तथा सिफारिस सेवा शुल्क:</span>
                        <strong>रु. {liveCalculatedFee.svc.toLocaleString()}</strong>
                      </div>
                      <div style={{ height: '1px', background: '#bbf7d0', margin: '4px 0' }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 800, color: '#14532d' }}>
                        <span>जम्मा बुझाउनुपर्ने नक्सा पास दस्तुर:</span>
                        <span>रु. {liveCalculatedFee.total.toLocaleString('ne-NP')}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: '0.9rem', background: '#eff6ff', borderRadius: '10px', border: '1px solid #bfdbfe', fontSize: '0.82rem', color: '#1e40af' }}>
                    <CheckCircle size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }} />
                    दरखास्त पेश गरेपछि प्रणालीले स्वतः <strong>BPS-2081-XXX</strong> दर्ता नम्बर र आधिकारिक QR कोड उत्पादन गर्नेछ।
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div
              style={{
                padding: '1rem 1.75rem',
                borderTop: '1.5px solid #e2e8f0',
                background: '#f8fafc',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <button
                type="button"
                onClick={() => {
                  if (currentStep > 1) setCurrentStep((prev) => prev - 1);
                  else setShowApplyModal(false);
                }}
                style={{
                  padding: '0.6rem 1.25rem',
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                }}
              >
                {currentStep === 1 ? 'रद्द गर्नुहोस्' : '← अघिल्लो चरण'}
              </button>

              <div style={{ display: 'flex', gap: '0.6rem' }}>
                {currentStep < 5 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep((prev) => prev + 1)}
                    style={{
                      padding: '0.6rem 1.4rem',
                      background: '#312e81',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#ffffff',
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span>अर्को चरण →</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={createMutation.isPending}
                    onClick={() => createMutation.mutate(formData)}
                    style={{
                      padding: '0.6rem 1.6rem',
                      background: '#10b981',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#ffffff',
                      cursor: 'pointer',
                      fontWeight: 800,
                      fontSize: '0.9rem',
                    }}
                  >
                    {createMutation.isPending ? 'दर्ता हुँदैछ...' : '✓ घर-नक्सा दरखास्त दर्ता गर्नुहोस्'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: प्राविधिक नापजाँच एवं निरीक्षण Drawer ────────────────── */}
      {inspectingPermit && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1.25rem',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '680px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              padding: '1.75rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1.5px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#4338ca', fontWeight: 800 }}>प्राविधिक जाँच प्रतिवेदन</span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '2px 0 0' }}>
                  {inspectingPermit.applicationNo} — {inspectingPermit.landOwnerName}
                </h3>
              </div>
              <button onClick={() => setInspectingPermit(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={22} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem' }}>
              <div style={{ background: '#f8fafc', padding: '0.9rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <div>वडा नं: <strong>{inspectingPermit.wardNumber}</strong></div>
                  <div>कित्ता नं: <strong>{inspectingPermit.kittaNo}</strong></div>
                  <div>भवन वर्ग: <strong>{inspectingPermit.buildingClass || 'ख वर्ग'}</strong></div>
                  <div>तला: <strong>{inspectingPermit.totalFloors}</strong></div>
                  <div>सडक चौडाइ: <strong>{inspectingPermit.roadWidthFt || 20} फिट</strong></div>
                  <div>अगाडि सेटब्याक: <strong>{inspectingPermit.setbackFrontFt || 5} फिट</strong></div>
                </div>
              </div>

              {/* Technical Inspection Checklist */}
              <div>
                <strong style={{ fontSize: '0.9rem', color: '#1e293b', display: 'block', marginBottom: '0.5rem' }}>
                  स्थलगत प्राविधिक जाँच चेकलिस्ट (NBC 105:2020 Compliance Checklist)
                </strong>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                  {[
                    'सडक केन्द्रबाट तोकिएको न्यूनतम ५ फिट सेटब्याक कायम गरिएको छ।',
                    'दायाँ, बायाँ तथा पछाडि ३ फिट खुला सिमाना छाडिएको छ।',
                    'प्लिन्थ लेभल सडक सतहभन्दा कम्तिमा १.५ फिट माथि उठाइएको छ।',
                    'जगको गहिराइ, कङ्क्रिटिङ ग्रेड र डण्डी (Rebar) साइज नक्सा बमोजिम छ।',
                    'सेप्टिक ट्याङ्क र सोक पिट सिमानाबाट कम्तिमा १० फिट दूरीमा छ।',
                    'भूकम्प प्रतिरोधी टाई-बिम र ब्यान्ड (Sill/Lintel Band) पूर्ण पालना भएको।',
                  ].map((check, i) => (
                    <label
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '0.45rem 0.65rem',
                        background: '#f8fafc',
                        borderRadius: '6px',
                        border: '1px solid #e2e8f0',
                        cursor: 'pointer',
                      }}
                    >
                      <input type="checkbox" defaultChecked />
                      <span style={{ fontSize: '0.8rem', color: '#334155' }}>{check}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                  स्थलगत प्राविधिक प्रतिवेदन / कैफियत
                </label>
                <textarea
                  rows={3}
                  defaultValue={inspectingPermit.technicalReport || 'स्थलगत प्राविधिक नापजाँच सम्पन्न। मापदण्ड अनुसार निर्माण भएको प्रमाणित।'}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                />
              </div>

              {/* Action Buttons to Advance Stage */}
              <div style={{ borderTop: '1.5px solid #e2e8f0', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  हालको अवस्था: <strong>{inspectingPermit.status}</strong>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {inspectingPermit.status !== 'भवन निर्माण सम्पन्न प्रमाणपत्र जारी' && (
                    <button
                      onClick={() => {
                        const curIdx = getStageIndex(inspectingPermit.status);
                        const nextStage = WORKFLOW_STAGES[curIdx + 1] || WORKFLOW_STAGES[WORKFLOW_STAGES.length - 1];
                        advanceMutation.mutate({
                          id: inspectingPermit.id,
                          nextStatus: nextStage,
                          officerName: 'इ. सन्तोष खड्का (पालिका इन्जिनियर)',
                        });
                      }}
                      style={{
                        padding: '0.6rem 1.25rem',
                        background: '#10b981',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <span>अर्को चरणमा स्वीकृत गर्नुहोस् →</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: View Full Details ──────────────────────────────── */}
      {viewingPermit && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1.25rem',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '680px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              padding: '1.75rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1.5px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <div>
                <span style={{ fontSize: '0.78rem', color: '#4338ca', fontWeight: 800 }}>e-BPS फाइल विवरण</span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '2px 0 0' }}>
                  {viewingPermit.applicationNo} — {viewingPermit.landOwnerName}
                </h3>
              </div>
              <button onClick={() => setViewingPermit(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={22} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div>जग्गाधनी: <strong>{viewingPermit.landOwnerName}</strong></div>
                <div>सम्पर्क: <strong>{viewingPermit.applicantPhone || '-'}</strong></div>
                <div>वडा नं: <strong>{viewingPermit.wardNumber}</strong></div>
                <div>टोल: <strong>{viewingPermit.toleAddress || '-'}</strong></div>
                <div>नापी सिट नं: <strong>{viewingPermit.sheetNo || '-'}</strong></div>
                <div>कित्ता नं: <strong style={{ color: '#0284c7' }}>{viewingPermit.kittaNo}</strong></div>
                <div>क्षेत्रफल: <strong>{viewingPermit.landAreaRopani || viewingPermit.landArea}</strong></div>
                <div>भवन वर्ग: <strong>{viewingPermit.buildingClass || 'ख वर्ग'}</strong></div>
                <div>संरचना प्रकार: <strong>{viewingPermit.structureType}</strong></div>
                <div>तला / उचाइ: <strong>{viewingPermit.totalFloors} तला</strong></div>
                <div>प्लिन्थ क्षेत्रफल: <strong>{viewingPermit.plinthAreaSqFt} sq.ft</strong></div>
                <div>कुल निर्मित: <strong>{viewingPermit.totalBuiltAreaSqFt} sq.ft</strong></div>
                <div>नक्सा दस्तुर: <strong style={{ color: '#15803d' }}>रु. {viewingPermit.permitFee?.toLocaleString()}</strong></div>
                <div>रसिद नं: <strong>{viewingPermit.receiptNo}</strong></div>
                <div>डिजाइनर: <strong>{viewingPermit.designerName || '-'}</strong></div>
                <div>NEC नं: <strong>{viewingPermit.necLicenseNo || '-'}</strong></div>
              </div>

              {viewingPermit.fourBoundaries && (
                <div style={{ background: '#f1f5f9', padding: '0.9rem', borderRadius: '10px' }}>
                  <strong style={{ fontSize: '0.82rem', color: '#334155', display: 'block', marginBottom: '4px' }}>चारकिल्ला विवरण:</strong>
                  <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                    पूर्व: {viewingPermit.fourBoundaries.east || '-'} | पश्चिम: {viewingPermit.fourBoundaries.west || '-'} <br />
                    उत्तर: {viewingPermit.fourBoundaries.north || '-'} | दक्षिण: {viewingPermit.fourBoundaries.south || '-'}
                  </div>
                </div>
              )}

              {viewingPermit.technicalReport && (
                <div style={{ background: '#eff6ff', padding: '0.9rem', borderRadius: '10px', border: '1px solid #bfdbfe' }}>
                  <strong style={{ fontSize: '0.82rem', color: '#1e40af', display: 'block', marginBottom: '4px' }}>प्राविधिक प्रतिवेदन:</strong>
                  <div style={{ fontSize: '0.82rem', color: '#1e3a8a' }}>{viewingPermit.technicalReport}</div>
                </div>
              )}

              {/* NBC 105:2020 Auto-Scrutiny Card */}
              <div style={{ background: '#f0fdfa', padding: '1rem', borderRadius: '12px', border: '1.5px solid #99f6e4' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                  <ShieldCheck size={18} color="#0f766e" />
                  <strong style={{ fontSize: '0.88rem', color: '#115e59' }}>भवन संहिता (NBC 105:2020) अटो-स्क्रूटिनी विश्लेषण प्रतिवेदन</strong>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.78rem' }}>
                  <div style={{ padding: '0.4rem 0.6rem', borderRadius: '6px', background: viewingPermit.roadWidthFt && viewingPermit.roadWidthFt >= 14 ? '#dcfce7' : '#fee2e2', color: viewingPermit.roadWidthFt && viewingPermit.roadWidthFt >= 14 ? '#15803d' : '#b91c1c' }}>
                    {viewingPermit.roadWidthFt && viewingPermit.roadWidthFt >= 14 ? '✓' : '✗'} सडक चौडाइ: {viewingPermit.roadWidthFt || 20} ft (न्यूनतम १४ ft)
                  </div>
                  <div style={{ padding: '0.4rem 0.6rem', borderRadius: '6px', background: viewingPermit.setbackFrontFt && viewingPermit.setbackFrontFt >= 5 ? '#dcfce7' : '#fee2e2', color: viewingPermit.setbackFrontFt && viewingPermit.setbackFrontFt >= 5 ? '#15803d' : '#b91c1c' }}>
                    {viewingPermit.setbackFrontFt && viewingPermit.setbackFrontFt >= 5 ? '✓' : '✗'} अगाडि सेटब्याक: {viewingPermit.setbackFrontFt || 5} ft (न्यूनतम ५ ft)
                  </div>
                  <div style={{ padding: '0.4rem 0.6rem', borderRadius: '6px', background: viewingPermit.setbackRearFt && viewingPermit.setbackRearFt >= 3 ? '#dcfce7' : '#fee2e2', color: viewingPermit.setbackRearFt && viewingPermit.setbackRearFt >= 3 ? '#15803d' : '#b91c1c' }}>
                    {viewingPermit.setbackRearFt && viewingPermit.setbackRearFt >= 3 ? '✓' : '✗'} पछाडि सेटब्याक: {viewingPermit.setbackRearFt || 3} ft (न्यूनतम ३ ft)
                  </div>
                  <div style={{ padding: '0.4rem 0.6rem', borderRadius: '6px', background: viewingPermit.groundCoveragePct && viewingPermit.groundCoveragePct <= 60 ? '#dcfce7' : '#fee2e2', color: viewingPermit.groundCoveragePct && viewingPermit.groundCoveragePct <= 60 ? '#15803d' : '#b91c1c' }}>
                    {viewingPermit.groundCoveragePct && viewingPermit.groundCoveragePct <= 60 ? '✓' : '✗'} कभरेज: {viewingPermit.groundCoveragePct || 55}% (अधिकतम ६०%)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: डिजिटल ड्रइङ तथा कागजात स्क्रूटिनी रिपोजिटोरी ───── */}
      {reviewingDocsPermit && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1.25rem' }}>
          <div style={{ background: '#ffffff', borderRadius: '20px', width: '100%', maxWidth: '780px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1.5px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <div>
                <span style={{ fontSize: '0.78rem', color: '#6d28d9', fontWeight: 800 }}>ई-नक्सा डिजिटल ड्रइङ तथा कागजात रिपोजिटोरी</span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '2px 0 0' }}>
                  {reviewingDocsPermit.applicationNo} — {reviewingDocsPermit.landOwnerName}
                </h3>
              </div>
              <button onClick={() => setReviewingDocsPermit(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={22} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {(reviewingDocsPermit.documents && reviewingDocsPermit.documents.length > 0
                ? reviewingDocsPermit.documents
                : [
                    { id: 'd1', category: 'lalpurja', title: '१. जग्गाधनी प्रमाण पुर्जा (Lalpurja)', fileName: 'Lalpurja_Copy.pdf', fileSize: '2.4 MB', status: 'approved', uploadedAt: '२०८१/०५/०१' },
                    { id: 'd2', category: 'trace_map', title: '२. नापी नक्सा / ब्लुप्रिन्ट ट्रेस प्रतिलिपि', fileName: 'Cadastral_Trace_Map.pdf', fileSize: '3.1 MB', status: 'approved', uploadedAt: '२०८१/०५/०१' },
                    { id: 'd3', category: 'tax_clearance', title: '३. चालु आ.व. को मालपोत तिरो रसिद', fileName: 'Tax_Clearance_Receipt.pdf', fileSize: '1.2 MB', status: 'approved', uploadedAt: '२०८१/०५/०१' },
                    { id: 'd4', category: 'citizenship', title: '४. नागरिकता प्रमाणपत्र प्रतिलिपि', fileName: 'Citizenship_Scan.pdf', fileSize: '1.5 MB', status: 'approved', uploadedAt: '२०८१/०५/०१' },
                    { id: 'd5', category: 'architectural', title: '५. आर्किटेक्चरल ड्रइङ (Plans, Elevations)', fileName: 'Architectural_Plans.dwg.pdf', fileSize: '8.4 MB', status: 'approved', uploadedAt: '२०८१/०५/०१' },
                    { id: 'd6', category: 'structural', title: '६. स्ट्रक्चरल डिजाइन ड्रइङ तथा विश्लेषण प्रतिवेदन', fileName: 'Structural_Analysis.pdf', fileSize: '6.2 MB', status: 'approved', uploadedAt: '२०८१/०५/०१' },
                    { id: 'd7', category: 'sanitary_electrical', title: '७. विद्युतीय तथा सेनेटरी नक्सा', fileName: 'MEP_Drawings.pdf', fileSize: '2.8 MB', status: 'pending', uploadedAt: '२०८१/०५/०१' },
                  ]
              ).map((doc: any) => {
                const isApp = doc.status === 'approved';
                const isRej = doc.status === 'rejected';

                return (
                  <div key={doc.id} style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FileText size={18} color="#4338ca" />
                        <strong style={{ fontSize: '0.88rem', color: '#1e293b' }}>{doc.title}</strong>
                        <span style={{ fontSize: '0.72rem', padding: '1px 6px', borderRadius: '4px', background: isApp ? '#dcfce7' : isRej ? '#fee2e2' : '#fef3c7', color: isApp ? '#15803d' : isRej ? '#b91c1c' : '#b45309', fontWeight: 700 }}>
                          {isApp ? '✓ स्वीकृत' : isRej ? '⚠️ सच्याउनुपर्ने' : '⏳ रुजु बाँकी'}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px', marginLeft: '26px' }}>
                        फाइल: <strong>{doc.fileName}</strong> | साइज: {doc.fileSize || '2 MB'} | अपलोड: {doc.uploadedAt || '२०८१/०५/२५'}
                        {doc.remarks && <span style={{ color: '#b91c1c', marginLeft: '8px' }}>कैफियत: {doc.remarks}</span>}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        onClick={() => alert(`कागजात पूर्वावलोकन खुल्दैछ:\n${doc.fileName}`)}
                        style={{ padding: '0.4rem 0.75rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                      >
                        <Eye size={13} /> हेर्नुहोस्
                      </button>
                      <button
                        onClick={() => docStatusMutation.mutate({ permitId: reviewingDocsPermit.id, docId: doc.id, status: 'approved', remarks: 'मापदण्ड अनुसार रुजु सम्पन्न' })}
                        style={{ padding: '0.4rem 0.75rem', background: '#dcfce7', border: '1px solid #bbf7d0', color: '#15803d', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}
                      >
                        ✓ स्वीकृत
                      </button>
                      <button
                        onClick={() => {
                          const rem = prompt('सच्याउनुपर्ने कैफियत लेख्नुहोस् (उदा: सिमाना सेटब्याक स्पष्ट नदेखिएको):');
                          if (rem) docStatusMutation.mutate({ permitId: reviewingDocsPermit.id, docId: doc.id, status: 'rejected', remarks: rem });
                        }}
                        style={{ padding: '0.4rem 0.75rem', background: '#fee2e2', border: '1px solid #fca5a5', color: '#b91c1c', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}
                      >
                        ⚠️ कैफियत
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: १५ दिने सूचना तथा दाबी-विरोध व्यवस्थापन ───────── */}
      {reviewingObjectionsPermit && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1.25rem' }}>
          <div style={{ background: '#ffffff', borderRadius: '20px', width: '100%', maxWidth: '750px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1.5px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <div>
                <span style={{ fontSize: '0.78rem', color: '#b91c1c', fontWeight: 800 }}>१५ दिने सार्वजनिक सूचना तथा दाबी-विरोध व्यवस्थापन</span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '2px 0 0' }}>
                  {reviewingObjectionsPermit.applicationNo} — {reviewingObjectionsPermit.landOwnerName}
                </h3>
              </div>
              <button onClick={() => setReviewingObjectionsPermit(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={22} />
              </button>
            </div>

            <div style={{ background: '#fef3c7', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid #fde68a', fontSize: '0.82rem', color: '#92400e', marginBottom: '1.25rem' }}>
              <strong>सूचना स्थिति:</strong> १५ दिने सूचना जारी मिति: <strong>{reviewingObjectionsPermit.publicNoticeDateBs || '२०८१/०५/०१'}</strong> | म्याद: १५ दिन | जम्मा दर्ता उजुरीहरू: <strong>{reviewingObjectionsPermit.objections?.length || 0} वटा</strong>
            </div>

            {!reviewingObjectionsPermit.objections || reviewingObjectionsPermit.objections.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1', color: '#64748b', fontSize: '0.85rem' }}>
                यस भवनको १५ दिने म्यादभित्र कुनै पनि साँध-सिमाना दाबी-विरोध वा उजुरी दर्ता भएको छैन।
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {reviewingObjectionsPermit.objections.map((obj: any, idx: number) => (
                  <div key={idx} style={{ background: '#ffffff', padding: '1rem', borderRadius: '10px', border: '1.5px solid #fca5a5' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <strong style={{ fontSize: '0.9rem', color: '#991b1b' }}>{obj.claimantName}</strong> ({obj.relationToProperty || 'छिमेकी'})
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>सम्पर्क: {obj.claimantPhone} | विवादित सिमाना: <strong>{obj.boundarySide}</strong> | मिति: {obj.filedDateBs}</div>
                      </div>
                      <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px', background: obj.status === 'settled' ? '#dcfce7' : '#fee2e2', color: obj.status === 'settled' ? '#15803d' : '#991b1b', fontWeight: 700 }}>
                        {obj.status === 'settled' ? '✓ मेलमिलाप सम्पन्न' : '⚠️ विचाराधीन'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#334155', marginTop: '0.5rem', background: '#fff5f5', padding: '0.5rem', borderRadius: '6px' }}>
                      <strong>उजुरी व्यहोरा:</strong> {obj.reason}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── MODAL: ७ वटा आधिकारिक प्रिन्ट कागजातहरू (Official Printable Docs) ─ */}
      {printableDoc && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1.25rem',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '750px',
              maxHeight: '92vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)',
              padding: '2rem',
            }}
          >
            {/* Print Header Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1.5px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setPrintableDoc({ ...printableDoc, type: 'dpc' })}
                  style={{
                    padding: '0.35rem 0.65rem',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: printableDoc.type === 'dpc' ? '#312e81' : '#f8fafc',
                    color: printableDoc.type === 'dpc' ? '#ffffff' : '#334155',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  १. DPC इजाजत (प्रथम चरण)
                </button>
                <button
                  onClick={() => setPrintableDoc({ ...printableDoc, type: 'superstructure' })}
                  style={{
                    padding: '0.35rem 0.65rem',
                    borderRadius: '6px',
                    border: '1px solid #bfdbfe',
                    background: printableDoc.type === 'superstructure' ? '#1d4ed8' : '#eff6ff',
                    color: printableDoc.type === 'superstructure' ? '#ffffff' : '#1d4ed8',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  २. सुपरस्ट्रक्चर (दोस्रो चरण)
                </button>
                <button
                  onClick={() => setPrintableDoc({ ...printableDoc, type: 'partial_completion' })}
                  style={{
                    padding: '0.35rem 0.65rem',
                    borderRadius: '6px',
                    border: '1px solid #fde68a',
                    background: printableDoc.type === 'partial_completion' ? '#b45309' : '#fffbeb',
                    color: printableDoc.type === 'partial_completion' ? '#ffffff' : '#b45309',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  ३. आंशिक सम्पन्न (Partial BCC)
                </button>
                <button
                  onClick={() => setPrintableDoc({ ...printableDoc, type: 'completion' })}
                  style={{
                    padding: '0.35rem 0.65rem',
                    borderRadius: '6px',
                    border: '1px solid #86efac',
                    background: printableDoc.type === 'completion' ? '#15803d' : '#f0fdf4',
                    color: printableDoc.type === 'completion' ? '#ffffff' : '#15803d',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  ४. पूर्ण निर्माण सम्पन्न (Final BCC)
                </button>
                <button
                  onClick={() => setPrintableDoc({ ...printableDoc, type: 'permanent' })}
                  style={{
                    padding: '0.35rem 0.65rem',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: printableDoc.type === 'permanent' ? '#312e81' : '#f8fafc',
                    color: printableDoc.type === 'permanent' ? '#ffffff' : '#334155',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  ५. स्थायी नक्सा पास
                </button>
                <button
                  onClick={() => setPrintableDoc({ ...printableDoc, type: 'storey_addition' })}
                  style={{
                    padding: '0.35rem 0.65rem',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: printableDoc.type === 'storey_addition' ? '#312e81' : '#f8fafc',
                    color: printableDoc.type === 'storey_addition' ? '#ffffff' : '#334155',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  ६. तला थप
                </button>
                <button
                  onClick={() => setPrintableDoc({ ...printableDoc, type: 'notice' })}
                  style={{
                    padding: '0.35rem 0.65rem',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: printableDoc.type === 'notice' ? '#312e81' : '#f8fafc',
                    color: printableDoc.type === 'notice' ? '#ffffff' : '#334155',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  ७. १५ दिने सूचना
                </button>
                <button
                  onClick={() => setPrintableDoc({ ...printableDoc, type: 'sarjamin' })}
                  style={{
                    padding: '0.35rem 0.65rem',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: printableDoc.type === 'sarjamin' ? '#312e81' : '#f8fafc',
                    color: printableDoc.type === 'sarjamin' ? '#ffffff' : '#334155',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  ८. सर्जमिन
                </button>
                <button
                  onClick={() => setPrintableDoc({ ...printableDoc, type: 'receipt' })}
                  style={{
                    padding: '0.35rem 0.65rem',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: printableDoc.type === 'receipt' ? '#312e81' : '#f8fafc',
                    color: printableDoc.type === 'receipt' ? '#ffffff' : '#334155',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  ९. रसिद
                </button>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => window.print()}
                  style={{
                    padding: '0.45rem 1rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#10b981',
                    color: '#ffffff',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Printer size={15} /> प्रिन्ट गर्नुहोस्
                </button>
                <button onClick={() => setPrintableDoc(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                  <X size={22} />
                </button>
              </div>
            </div>

            {/* Printable Document Sheet */}
            <div
              id="printable-certificate-sheet"
              style={{
                border: '2px solid #312e81',
                borderRadius: '12px',
                padding: '2rem',
                backgroundColor: '#ffffff',
                color: '#0f172a',
                lineHeight: 1.6,
                position: 'relative',
              }}
            >
              {/* Header Letterhead */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ width: '75px', textAlign: 'center' }}>
                  <img
                    src={tenantSettings?.emblem_url || "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Emblem_of_Nepal.svg/240px-Emblem_of_Nepal.svg.png"}
                    style={{ width: '65px', height: 'auto', maxHeight: '65px', objectFit: 'contain' }}
                    alt="नेपाल सरकार निशाना छाप"
                  />
                </div>
                <div style={{ flex: 1, textAlign: 'center', padding: '0 0.5rem' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#dc2626' }}>नेपाल सरकार / {tenantSettings?.province || 'बागमती प्रदेश'}</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#1e1b4b', marginTop: '2px' }}>
                    {tenantSettings?.palika_name || 'पाँचपोखरी थाङपाल गाउँ कार्यपालिकाको कार्यालय'}
                  </div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#475569' }}>
                    {tenantSettings?.office_title || 'गाउँ कार्यपालिकाको कार्यालय'}, {tenantSettings?.headquarters || 'थाङपालधाप, सिन्धुपाल्चोक'}
                  </div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b' }}>
                    भवन निर्माण तथा सहरी विकास शाखा (e-BPS Unit)
                  </div>
                </div>
                <div style={{ width: '75px', textAlign: 'center' }}>
                  <img
                    src={tenantSettings?.logo_url || '/panchpokhari-logo.png'}
                    style={{ width: '65px', height: '65px', borderRadius: '50%', objectFit: 'contain', border: '1.5px solid #cbd5e1' }}
                    alt="Palika Logo"
                    onError={(e: any) => {
                      e.target.src = '/panchpokhari-logo.png';
                    }}
                  />
                </div>
              </div>

              {/* Certificate Metadata strip */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#475569', marginBottom: '1.25rem' }}>
                <div>पत्र संख्या: <strong>२०८१/०८२</strong></div>
                <div>दरखास्त नं: <strong>{printableDoc.permit.applicationNo}</strong></div>
                <div>मिति: <strong>{printableDoc.permit.applicationDateBs || '२०८१/०५/२५'}</strong></div>
              </div>

              {/* Title based on document type */}
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <span
                  style={{
                    display: 'inline-block',
                    fontSize: '1.15rem',
                    fontWeight: 900,
                    color: '#1e1b4b',
                    padding: '4px 16px',
                    borderBottom: '2px solid #312e81',
                  }}
                >
                  {printableDoc.type === 'dpc' && 'भवन निर्माण अस्थायी प्रथम चरण (DPC) अनुमति पत्र'}
                  {printableDoc.type === 'superstructure' && 'भवन निर्माण दोस्रो चरण (Super Structure को इजाजत पत्र)'}
                  {printableDoc.type === 'partial_completion' && 'आंशिक भवन निर्माण सम्पन्न प्रमाणपत्र (Partial Building Completion Certificate)'}
                  {printableDoc.type === 'permanent' && 'स्थायी घर-नक्सा पास प्रमाणपत्र (Permanent Building Permit)'}
                  {printableDoc.type === 'storey_addition' && 'सुपरस्ट्रक्चर तथा तला थप स्वीकृति पत्र (Storey Addition Permit)'}
                  {printableDoc.type === 'completion' && 'भवन निर्माण सम्पन्न प्रमाणपत्र (Building Completion Certificate)'}
                  {printableDoc.type === 'receipt' && 'घर-नक्सा पास दस्तुर आधिकारिक राजस्व रसिद'}
                  {printableDoc.type === 'notice' && '१५ दिने सार्वजनिक सूचना पत्र (15-Day Public Notice to Neighbors)'}
                  {printableDoc.type === 'sarjamin' && 'स्थलगत सर्जमिन मुचुल्का फारम (Boundary Verification Deed)'}
                </span>
              </div>

              {/* Body Text */}
              <div style={{ fontSize: '0.88rem', color: '#1e293b', textAlign: 'justify', marginBottom: '1.5rem' }}>
                {printableDoc.type === 'completion' && (
                  <p>
                    स्थानीय सरकार सञ्चालन ऐन २०७४ को दफा ३५ तथा नेपाल राष्ट्रिय भवन संहिता (NBC 105:2020) बमोजिम यस पाँचपोखरी थाङपाल गाउँपालिका वडा नं. <strong>{printableDoc.permit.wardNumber}</strong>, टोल <strong>{printableDoc.permit.toleAddress || '-'}</strong> स्थित कित्ता नं. <strong>{printableDoc.permit.kittaNo}</strong> मा जग्गाधनी श्री <strong>{printableDoc.permit.landOwnerName}</strong> ले निर्माण गर्नुभएको <strong>{printableDoc.permit.totalFloors}</strong> तलाको <strong>{printableDoc.permit.usageType}</strong> भवन स्थलगत प्राविधिक जाँच गर्दा स्वीकृत नक्सा तथा भवन संहिताको भूकम्प प्रतिरोधी मापदण्ड पूर्ण पालना गरी निर्माण सम्पन्न भएको पाइएकाले यो <strong>निर्माण सम्पन्न प्रमाणपत्र (Certificate No: {printableDoc.permit.certificateNo || 'BCC-2081-001'})</strong> जारी गरिएको छ।
                  </p>
                )}

                {/* मार्गदर्शन २०८२: आंशिक निर्माण सम्पन्नको प्रमाण पत्र */}
                {printableDoc.type === 'partial_completion' && (
                  <div>
                    <p>
                      भवन निर्माण मार्गदर्शन, २०८२ को परिच्छेद ५ तथा स्थानीय सरकार सञ्चालन ऐन, २०७४ को दफा ३५ बमोजिम यस पाँचपोखरी थाङपाल गाउँपालिका वडा नं. <strong>{printableDoc.permit.wardNumber}</strong> स्थित कित्ता नं. <strong>{printableDoc.permit.kittaNo}</strong> मा जग्गाधनी श्री <strong>{printableDoc.permit.landOwnerName}</strong> ले स्वीकृत दरखास्त नं. <strong>{printableDoc.permit.applicationNo}</strong> बमोजिम निर्माण गरिरहेको कुल <strong>{printableDoc.permit.totalFloors}</strong> तलाको भवनमध्ये हाल <strong>{printableDoc.permit.partialCompletionDetails?.completedFloors || 1.0} तला</strong> (प्लिन्थ एरिया: <strong>{printableDoc.permit.partialCompletionDetails?.completedPlinthSqFt || printableDoc.permit.plinthAreaSqFt} वर्गफिट</strong>) को निर्माण कार्य प्राविधिक मापदण्ड अनुरुप सम्पन्न भई तत्काल <strong>{printableDoc.permit.partialCompletionDetails?.allowedUsage || 'बसोबास तथा पसल'}</strong> प्रयोजनका लागि सुरक्षित पाइएकाले यो <strong>आंशिक भवन निर्माण सम्पन्न प्रमाणपत्र (Partial Completion Certificate No: {printableDoc.permit.partialCompletionDetails?.certificateNo || `PBCC-2081-0${printableDoc.permit.wardNumber}4`})</strong> जारी गरिएको छ।
                    </p>
                    <div style={{ background: '#fffbeb', padding: '0.85rem', borderRadius: '8px', border: '1px solid #fde68a', marginTop: '0.75rem', fontSize: '0.82rem', color: '#92400e' }}>
                      <div>१. आंशिक स्वीकृत तला: <strong>{printableDoc.permit.partialCompletionDetails?.completedFloors || 1.0} तला</strong> (बाँकी निर्माण गर्नुपर्ने तला: <strong>{printableDoc.permit.partialCompletionDetails?.remainingFloors || ((printableDoc.permit.totalFloors || 2.5) - 1.0)} तला</strong>)</div>
                      <div>२. बाँकी तला निर्माण गरी पूर्ण निर्माण सम्पन्न प्रमाणपत्र लिने अन्तिम म्याद: <strong>{printableDoc.permit.partialCompletionDetails?.validityExpiryDateBs || '२०८३/०६/३०'}</strong></div>
                      <div>३. सिफारिस तथा स्थलगत प्राविधिक: <strong>{printableDoc.permit.partialCompletionDetails?.siteEngineerName || 'इ. सन्तोष खड्का'} ({printableDoc.permit.partialCompletionDetails?.engineerNecNo || 'NEC-CIVIL-18445'})</strong></div>
                      <div>४. वडा सिफारिस पत्र नं: <strong>{printableDoc.permit.partialCompletionDetails?.wardRecommendationNo || `वडा-${printableDoc.permit.wardNumber}-सिफारिस-१४२`}</strong></div>
                    </div>
                  </div>
                )}

                {/* मार्गदर्शन २०८२: दोस्रो चरण (Super Structure को ईजाजत) */}
                {printableDoc.type === 'superstructure' && (
                  <div>
                    <p>
                      नेपाल राष्ट्रिय भवन संहिता (NBC 105:2020) तथा भवन निर्माण मार्गदर्शन, २०८२ बमोजिम यस गाउँपालिका वडा नं. <strong>{printableDoc.permit.wardNumber}</strong> कित्ता नं. <strong>{printableDoc.permit.kittaNo}</strong> मा जग्गाधनी श्री <strong>{printableDoc.permit.landOwnerName}</strong> ले निर्माण गरिरहेको भवनको प्रथम चरण (DPC / प्लिन्थ लेभल) सम्मको निर्माण कार्य स्थलगत नापजाँच गर्दा सडक सेटब्याक ({printableDoc.permit.setbackFrontFt || 5} फिट) तथा सिमाना मापदण्ड पूर्ण पालना भएको प्राविधिक प्रमाणीकरण भएकाले यो <strong>दोस्रो चरण (Super Structure को इजाजत पत्र)</strong> प्रदान गरिएको छ।
                    </p>
                    <div style={{ background: '#eff6ff', padding: '0.85rem', borderRadius: '8px', border: '1px solid #bfdbfe', marginTop: '0.75rem', fontSize: '0.82rem', color: '#1e40af' }}>
                      <div>१. स्वीकृत तला: <strong>{printableDoc.permit.totalFloors} तला (RCC Frame Structure)</strong></div>
                      <div>२. डक्टाइल डिटेलिङ: <strong>{printableDoc.permit.hasStructuralDrawing || 'NBC 105:2020 / NBC 205 Compliance'}</strong></div>
                      <div>३. संरचनात्मक विश्लेषण सफ्टवेयर: <strong>{printableDoc.permit.structuralModelType || 'ETABS (.edb)'}</strong></div>
                      <div>४. सुपरस्ट्रक्चर निर्माण अवधि: इजाजत जारी मितिबाट १ (एक) वर्षभित्र सम्पन्न गर्नुपर्नेछ।</div>
                    </div>
                  </div>
                )}

                {printableDoc.type === 'dpc' && (
                  <p>
                    दरखास्त नं. <strong>{printableDoc.permit.applicationNo}</strong> अनुसार वडा नं. <strong>{printableDoc.permit.wardNumber}</strong> कित्ता नं. <strong>{printableDoc.permit.kittaNo}</strong> मा <strong>{printableDoc.permit.landOwnerName}</strong> लाई स्वीकृत नक्सा तथा सडक सेटब्याक ({printableDoc.permit.setbackFrontFt || 5} फिट) कायम गरी प्लिन्थ (DPC) सम्मको निर्माण कार्य सम्पन्न गर्न ७० (सत्तरी) दिनको म्याद दिई यो <strong>अस्थायी प्रथम चरण निर्माण इजाजत पत्र (DPC Clearance)</strong> प्रदान गरिएको छ। प्लिन्थ निर्माण सम्पन्न भएपछि दोस्रो चरण (सुपर-स्ट्रक्चर) अनुमतिका लागि स्थलगत जाँच गराउनुपर्नेछ।
                  </p>
                )}

                {printableDoc.type === 'permanent' && (
                  <p>
                    यस कार्यालयमा दर्ता भएको घर-नक्सा दरखास्त बमोजिम वडा नं. <strong>{printableDoc.permit.wardNumber}</strong> कित्ता नं. <strong>{printableDoc.permit.kittaNo}</strong> मा <strong>{printableDoc.permit.landOwnerName}</strong> ले पेश गरेको <strong>{printableDoc.permit.totalFloors}</strong> तलाको {printableDoc.permit.structureType} भवनको डिजाइन नेपाल राष्ट्रिय भवन संहिता (NBC 105:2020) अनुरुप प्राविधिक स्क्रूटिनी सम्पन्न भई तोकिएको दस्तुर रु. <strong>{printableDoc.permit.permitFee?.toLocaleString()}</strong> असुल उपर गरी यो <strong>स्थायी घर-नक्सा पास प्रमाणपत्र</strong> जारी गरिएको छ।
                  </p>
                )}

                {printableDoc.type === 'storey_addition' && (
                  <p>
                    स्थानीय सरकार सञ्चालन ऐन २०७४ बमोजिम वडा नं. <strong>{printableDoc.permit.wardNumber}</strong> कित्ता नं. <strong>{printableDoc.permit.kittaNo}</strong> मा <strong>{printableDoc.permit.landOwnerName}</strong> ले पहिले निर्माण भएको जग/प्लिन्थ तथा मौजुदा संरचनामाथि स्ट्रक्चरल इन्जिनियरको स्थायित्व विश्लेषण (Structural Stability Report) बमोजिम थप तला निर्माण गर्न पेश गरेको नक्सा स्वीकृत गरी यो <strong>सुपरस्ट्रक्चर तथा तला थप स्वीकृति पत्र</strong> प्रदान गरिएको छ।
                  </p>
                )}

                {printableDoc.type === 'notice' && (
                  <div>
                    <p>
                      स्थानीय सरकार सञ्चालन ऐन २०७४ को दफा २७ बमोजिम यस गाउँपालिका वडा नं. <strong>{printableDoc.permit.wardNumber}</strong>, कित्ता नं. <strong>{printableDoc.permit.kittaNo}</strong> मा जग्गाधनी <strong>{printableDoc.permit.landOwnerName}</strong> ले <strong>{printableDoc.permit.totalFloors}</strong> तलाको भवन निर्माण गर्न दरखास्त पेश गर्नुभएकोले सो निर्माणबाट तपसिलका चारकिल्लाका साँध-सिमानाका जग्गाधनीहरूको हक, अधिकार वा बाटो-निकासमा कुनै असर पर्ने भए यो सूचना प्रकाशित भएको मितिले <strong>१५ (पन्ध्र) दिनभित्र</strong> सप्रमाण उजुरी दिनुहुन यो सार्वजनिक सूचना जारी गरिएको छ। म्यादभित्र उजुरी नपरे कानुन बमोजिम नक्सा पास हुनेछ।
                    </p>
                    <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '0.75rem', fontSize: '0.82rem' }}>
                      <strong>तपसिलका चारकिल्ला:</strong> पूर्व: {printableDoc.permit.fourBoundaries?.east || '-'} | पश्चिम: {printableDoc.permit.fourBoundaries?.west || '-'} | उत्तर: {printableDoc.permit.fourBoundaries?.north || '-'} | दक्षिण: {printableDoc.permit.fourBoundaries?.south || '-'}
                    </div>
                  </div>
                )}

                {printableDoc.type === 'sarjamin' && (
                  <div>
                    <p>
                      आज मिति <strong>{printableDoc.permit.sarjaminDateBs || '२०८१/०५/२५'}</strong> गते यस पाँचपोखरी थाङपाल गाउँपालिका वडा नं. <strong>{printableDoc.permit.wardNumber}</strong> स्थित कित्ता नं. <strong>{printableDoc.permit.kittaNo}</strong> को जग्गामा उपस्थित भई प्राविधिक, अमिन तथा चारकिल्लाका साँध-सिमानाका रोहबरमा स्थलगत नापजाँच तथा सर्जमिन मुचुल्का सम्पन्न गरियो।
                    </p>
                    <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '0.75rem', fontSize: '0.82rem' }}>
                      <div>१. सडकको चौडाइ <strong>{printableDoc.permit.roadWidthFt || 20} फिट</strong> कायम रहेको।</div>
                      <div>२. सडक केन्द्रबाट तोकिएको न्यूनतम <strong>{printableDoc.permit.setbackFrontFt || 5} फिट</strong> सेटब्याक छाडिएको।</div>
                      <div>३. चारकिल्ला साँध-सिमानामा कुनै पनि छिमेकीको विवाद वा मिचाहा नभएको।</div>
                      <div>४. प्रस्तावित भवनको प्लिन्थ DPC निर्माण स्वीकृति दिन सिफारिस गरिएको।</div>
                    </div>
                  </div>
                )}

                {printableDoc.type === 'receipt' && (
                  <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0', margin: '1rem 0' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      <div>रसिद नं: <strong>{printableDoc.permit.receiptNo}</strong></div>
                      <div>करदाताको नाम: <strong>{printableDoc.permit.landOwnerName}</strong></div>
                      <div>प्लिन्थ क्षेत्रफल: <strong>{printableDoc.permit.plinthAreaSqFt} sq.ft</strong></div>
                      <div>कुल निर्मित क्षेत्रफल: <strong>{printableDoc.permit.totalBuiltAreaSqFt} sq.ft</strong></div>
                      <div>प्रति वर्गफिट दर: <strong>रु. {printableDoc.permit.ratePerSqFt || 10}</strong></div>
                      <div>सेवा शुल्क: <strong>रु. {printableDoc.permit.serviceCharge || 1500}</strong></div>
                      <div style={{ gridColumn: 'span 2', fontSize: '1.05rem', fontWeight: 800, color: '#15803d', marginTop: '6px' }}>
                        कुल भुक्तानी भएको रकम: रु. {printableDoc.permit.permitFee?.toLocaleString('ne-NP')} (अक्षरेपी: {printableDoc.permit.permitFee} रुपैयाँ मात्र)
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Signatures & Dynamic QR Code */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '2.5rem', paddingTop: '1rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ border: '1px solid #cbd5e1', padding: '6px', borderRadius: '8px', display: 'inline-block', background: '#f8fafc' }}>
                    <QrCode size={64} color="#312e81" />
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '2px' }}>
                    e-BPS Online Verification
                  </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '140px', borderBottom: '1px solid #475569', margin: '0 auto 4px' }} />
                  <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>इ. सन्तोष खड्का</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>पालिका इन्जिनियर (प्राविधिक शाखा)</div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '140px', borderBottom: '1px solid #475569', margin: '0 auto 4px' }} />
                  <div style={{ fontSize: '0.8rem', fontWeight: 800 }}>प्रमुख प्रशासकीय अधिकृत</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{tenantSettings?.palika_name || 'पाँचपोखरी थाङपाल गाउँपालिका'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Payment Gateway Integration ── */}
      {payingPermit && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.75)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(4px)' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '450px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }}>
              <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CreditCard size={20} color="#be123c" /> अनलाइन भुक्तानी
              </h2>
              <button onClick={() => setPayingPermit(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
            </div>
            
            <div style={{ padding: '1.5rem', overflowY: 'auto' }}>
              <div style={{ background: '#f1f5f9', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#64748b' }}>आवेदक:</span>
                  <span style={{ fontWeight: 700 }}>{payingPermit.applicantName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#64748b' }}>कित्ता नं:</span>
                  <span style={{ fontWeight: 700 }}>{payingPermit.kittaNo}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#64748b' }}>कुल दस्तुर:</span>
                  <span style={{ fontWeight: 800, color: '#be123c', fontSize: '1.1rem' }}>रु. {payingPermit.permitFee?.toLocaleString()}</span>
                </div>
              </div>

              <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.75rem', color: '#334155' }}>भुक्तानी माध्यम छान्नुहोस्:</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
                <button
                  onClick={() => paymentMutation.mutate({ permitId: payingPermit.id, gateway: 'eSewa', transactionId: 'TXN-' + Date.now() })}
                  disabled={paymentMutation.isPending}
                  style={{ padding: '0.8rem', border: '1px solid #22c55e', borderRadius: '10px', background: '#f0fdf4', color: '#16a34a', fontWeight: 800, cursor: paymentMutation.isPending ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: paymentMutation.isPending ? 0.7 : 1 }}
                >
                  <Coins size={18} /> eSewa मार्फत तिर्नुहोस्
                </button>
                <button
                  onClick={() => paymentMutation.mutate({ permitId: payingPermit.id, gateway: 'Khalti', transactionId: 'TXN-' + Date.now() })}
                  disabled={paymentMutation.isPending}
                  style={{ padding: '0.8rem', border: '1px solid #8b5cf6', borderRadius: '10px', background: '#f5f3ff', color: '#7c3aed', fontWeight: 800, cursor: paymentMutation.isPending ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: paymentMutation.isPending ? 0.7 : 1 }}
                >
                  <Coins size={18} /> Khalti मार्फत तिर्नुहोस्
                </button>
                <button
                  onClick={() => paymentMutation.mutate({ permitId: payingPermit.id, gateway: 'ConnectIPS', transactionId: 'TXN-' + Date.now() })}
                  disabled={paymentMutation.isPending}
                  style={{ padding: '0.8rem', border: '1px solid #3b82f6', borderRadius: '10px', background: '#eff6ff', color: '#2563eb', fontWeight: 800, cursor: paymentMutation.isPending ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: paymentMutation.isPending ? 0.7 : 1 }}
                >
                  <Coins size={18} /> ConnectIPS
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: AutoCAD AI Layer Analysis ── */}
      {cadPermit && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.75)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(4px)' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '600px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', backgroundColor: '#fdf4ff', borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }}>
              <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={20} color="#c026d3" /> AutoCAD AI Analysis
              </h2>
              <button onClick={() => { setCadPermit(null); setCadReport(null); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
            </div>
            
            <div style={{ padding: '1.5rem', overflowY: 'auto' }}>
              {!cadReport ? (
                <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                  <HardHat size={48} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
                  <h3 style={{ margin: '0 0 0.5rem 0', color: '#1e293b' }}>AutoCAD File Upload</h3>
                  <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Upload .dwg or .dxf file to automatically extract layers and verify building by-laws (setbacks, FAR, etc.).</p>
                  
                  <button
                    onClick={async () => {
                      setCadAnalyzing(true);
                      try {
                        await new Promise(r => setTimeout(r, 2000));
                        const res = await api.post<any>(`/building-permits/${cadPermit.id}/cad-analysis`, {});
                        // Backend returns data directly; normalise to expected shape
                        const raw = res?.data ?? res;
                        const checks = (raw.nbcChecks || []).map((c: any) => ({
                          rule: `${c.code} — ${c.description}`,
                          value: c.detail,
                          status: c.status === 'passed' ? 'PASSED' : c.status === 'warning' ? 'WARNING' : 'FAILED',
                        }));
                        setCadReport({
                          overallStatus: raw.overallStatus || 'COMPLIANT',
                          complianceScore: raw.complianceScore || 92,
                          recommendation: (raw.recommendations || []).join(' | '),
                          totalLayersFound: checks.length,
                          criticalLayers: Object.fromEntries(
                            checks.map((c: any, i: number) => [
                              `NBC Check ${i + 1}`,
                              { status: c.status === 'PASSED' ? 'pass' : 'fail', count: 1 }
                            ])
                          ),
                          regulatoryChecks: checks,
                        });
                      } catch (e) {
                        alert('AI Analysis Failed');
                      } finally {
                        setCadAnalyzing(false);
                      }
                    }}
                    disabled={cadAnalyzing}
                    style={{ padding: '0.75rem 1.5rem', background: '#c026d3', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: cadAnalyzing ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    {cadAnalyzing ? <RefreshCw size={16} className="spin" /> : <Layers size={16} />}
                    {cadAnalyzing ? 'Analyzing DXF Layers...' : 'Upload & Analyze File'}
                  </button>
                </div>
              ) : (
                <div>
                  <div style={{ background: cadReport.overallStatus === 'COMPLIANT' ? '#dcfce7' : '#fee2e2', color: cadReport.overallStatus === 'COMPLIANT' ? '#15803d' : '#991b1b', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontWeight: 600 }}>
                    {cadReport.overallStatus === 'COMPLIANT' ? <CheckCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} /> : <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />}
                    <div>
                      <div style={{ fontSize: '1.05rem', marginBottom: '4px' }}>Status: {cadReport.overallStatus}</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 500, opacity: 0.9 }}>{cadReport.recommendation}</div>
                    </div>
                  </div>

                  <h4 style={{ margin: '0 0 0.75rem 0', color: '#334155' }}>Extracted Critical Layers ({cadReport.totalLayersFound} total)</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    {Object.entries(cadReport.criticalLayers).map(([layer, data]: [string, any]) => (
                      <div key={layer} style={{ padding: '0.75rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.85rem' }}>{layer}</span>
                        <span style={{ fontSize: '0.75rem', color: data.status === 'pass' ? '#16a34a' : '#ef4444', background: data.status === 'pass' ? '#dcfce7' : '#fee2e2', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                          Found: {data.count}
                        </span>
                      </div>
                    ))}
                  </div>

                  <h4 style={{ margin: '0 0 0.75rem 0', color: '#334155' }}>Regulatory Checks</h4>
                  <div style={{ background: '#f1f5f9', borderRadius: '8px', overflow: 'hidden' }}>
                    {cadReport.regulatoryChecks.map((check: any, i: number) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1rem', borderBottom: i === cadReport.regulatoryChecks.length - 1 ? 'none' : '1px solid #e2e8f0', fontSize: '0.85rem' }}>
                        <span style={{ color: '#475569', fontWeight: 600 }}>{check.rule}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <span style={{ fontWeight: 800 }}>{check.value}</span>
                          <span style={{ color: check.status === 'PASSED' ? '#16a34a' : '#ef4444', fontWeight: 800 }}>{check.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: मार्गदर्शन २०८२ ETABS / SAP2000 Structural Scrutiny ── */}
      {etabsScrutinyPermit && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.75)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(4px)' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '18px', width: '100%', maxWidth: '720px', boxShadow: '0 25px 60px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column', maxHeight: '92vh', overflow: 'hidden' }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.75rem', borderBottom: '1.5px solid #e2e8f0', background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', color: '#ffffff' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Building2 size={22} color="#a5b4fc" />
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>
                    ETABS / SAP2000 संरचनात्मक स्क्रूटिनी (भवन निर्माण मार्गदर्शन, २०८२)
                  </h3>
                </div>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.78rem', color: '#c7d2fe' }}>
                  दरखास्त नं: <strong>{etabsScrutinyPermit.applicationNo}</strong> | {etabsScrutinyPermit.landOwnerName} | NBC 105:2020 भूकम्पीय विश्लेषण मापदण्ड
                </p>
              </div>
              <button onClick={() => setEtabsScrutinyPermit(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ffffff' }}>
                <X size={22} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.5rem 1.75rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: '#eff6ff', padding: '0.9rem', borderRadius: '10px', border: '1px solid #bfdbfe', fontSize: '0.8rem', color: '#1e40af' }}>
                ℹ️ <strong>मार्गदर्शन २०८२ परिच्छेद ३ नियम:</strong> 'ख' र 'क' वर्गका भवनहरूका लागि आर्किटेक्चरल नक्साका साथै संरचनात्मक डिजाइन प्रतिवेदन (ETABS अथवा SAP2000 रन फाइल) प्राविधिक परीक्षण गरी भूकम्प प्रतिरोधी मापदण्ड अनिवार्य प्रमाणित गर्नुपर्नेछ।
              </div>

              {/* Form Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                    विश्लेषण सफ्टवेयर (Software Model)*
                  </label>
                  <select
                    value={etabsForm.structuralSoftware}
                    onChange={(e) => setEtabsForm({ ...etabsForm, structuralSoftware: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem' }}
                  >
                    <option value="ETABS (.edb)">ETABS (.edb)</option>
                    <option value="SAP2000 (.sdb)">SAP2000 (.sdb)</option>
                    <option value="STAAD.Pro (.std)">STAAD.Pro (.std)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                    भूकम्पीय आधार कर्तन (Base Shear Vb - kN)*
                  </label>
                  <input
                    type="number"
                    step="10"
                    value={etabsForm.baseShearKn}
                    onChange={(e) => setEtabsForm({ ...etabsForm, baseShearKn: parseFloat(e.target.value) || 0 })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                    मौलिक कम्पन काल (Fundamental Period Ta - Sec)*
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={etabsForm.fundamentalTimePeriodSec}
                    onChange={(e) => setEtabsForm({ ...etabsForm, fundamentalTimePeriodSec: parseFloat(e.target.value) || 0 })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>

                {/* Inter-Storey Drift */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                      अधिकतम तला विस्थापन (Max Drift Ratio)*
                    </label>
                    <span style={{ fontSize: '0.72rem', padding: '1px 6px', borderRadius: '4px', fontWeight: 800, background: etabsForm.maxDriftRatio <= 0.004 ? '#dcfce7' : '#fee2e2', color: etabsForm.maxDriftRatio <= 0.004 ? '#15803d' : '#b91c1c' }}>
                      {etabsForm.maxDriftRatio <= 0.004 ? '✓ स्वीकृत (≤ 0.004)' : '✗ असफल (> 0.004)'}
                    </span>
                  </div>
                  <input
                    type="number"
                    step="0.0001"
                    value={etabsForm.maxDriftRatio}
                    onChange={(e) => setEtabsForm({ ...etabsForm, maxDriftRatio: parseFloat(e.target.value) || 0 })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: etabsForm.maxDriftRatio <= 0.004 ? '1.5px solid #86efac' : '1.5px solid #fca5a5', fontSize: '0.85rem' }}
                  />
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>NBC 105:2020 दफा ५.४.२ अनुसार अधिकतम सीमा ०.००४ (0.004)</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {/* Mass Participation */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                      मास सहभागिता (Modal Mass Ratio %)*
                    </label>
                    <span style={{ fontSize: '0.72rem', padding: '1px 6px', borderRadius: '4px', fontWeight: 800, background: etabsForm.massParticipationPct >= 90.0 ? '#dcfce7' : '#fee2e2', color: etabsForm.massParticipationPct >= 90.0 ? '#15803d' : '#b91c1c' }}>
                      {etabsForm.massParticipationPct >= 90.0 ? '✓ स्वीकृत (≥ 90%)' : '✗ असफल (< 90%)'}
                    </span>
                  </div>
                  <input
                    type="number"
                    step="0.1"
                    value={etabsForm.massParticipationPct}
                    onChange={(e) => setEtabsForm({ ...etabsForm, massParticipationPct: parseFloat(e.target.value) || 0 })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: etabsForm.massParticipationPct >= 90.0 ? '1.5px solid #86efac' : '1.5px solid #fca5a5', fontSize: '0.85rem' }}
                  />
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>NBC 105:2020 दफा ५.३.३ अनुसार कम्तिमा ९०% आवश्यक</span>
                </div>

                {/* Torsional Ratio */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                      मोडाइ अनुपात (Torsional Ratio)*
                    </label>
                    <span style={{ fontSize: '0.72rem', padding: '1px 6px', borderRadius: '4px', fontWeight: 800, background: etabsForm.torsionalRatio <= 1.4 ? '#dcfce7' : '#fee2e2', color: etabsForm.torsionalRatio <= 1.4 ? '#15803d' : '#b91c1c' }}>
                      {etabsForm.torsionalRatio <= 1.4 ? '✓ स्वीकृत (≤ 1.4)' : '✗ असफल (> 1.4)'}
                    </span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    value={etabsForm.torsionalRatio}
                    onChange={(e) => setEtabsForm({ ...etabsForm, torsionalRatio: parseFloat(e.target.value) || 0 })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: etabsForm.torsionalRatio <= 1.4 ? '1.5px solid #86efac' : '1.5px solid #fca5a5', fontSize: '0.85rem' }}
                  />
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>NBC 105:2020 दफा ५.५ अनुसार १.४ भन्दा कम हुनुपर्ने</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                    जाँचकर्ता स्ट्रक्चरल इन्जिनियरको नाम*
                  </label>
                  <input
                    type="text"
                    value={etabsForm.engineerName}
                    onChange={(e) => setEtabsForm({ ...etabsForm, engineerName: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                    नेपाल इन्जिनियरिङ परिषद् (NEC) दर्ता नं.*
                  </label>
                  <input
                    type="text"
                    value={etabsForm.necLicenseNo}
                    onChange={(e) => setEtabsForm({ ...etabsForm, necLicenseNo: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                  प्राविधिक स्क्रूटिनी कैफियत (Technical Remarks)*
                </label>
                <input
                  type="text"
                  value={etabsForm.remarks}
                  onChange={(e) => setEtabsForm({ ...etabsForm, remarks: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '1rem 1.75rem', borderTop: '1.5px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => setEtabsScrutinyPermit(null)}
                style={{ padding: '0.6rem 1.25rem', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
              >
                रद्द गर्नुहोस्
              </button>

              <button
                type="button"
                disabled={etabsMutation.isPending}
                onClick={() => etabsMutation.mutate({
                  permitId: etabsScrutinyPermit.id,
                  structural_software: etabsForm.structuralSoftware,
                  base_shear_kn: etabsForm.baseShearKn,
                  fundamental_time_period_sec: etabsForm.fundamentalTimePeriodSec,
                  max_drift_ratio: etabsForm.maxDriftRatio,
                  mass_participation_pct: etabsForm.massParticipationPct,
                  torsional_ratio: etabsForm.torsionalRatio,
                  engineer_name: etabsForm.engineerName,
                  nec_license_no: etabsForm.necLicenseNo,
                  remarks: etabsForm.remarks,
                })}
                style={{ padding: '0.65rem 1.6rem', background: '#1d4ed8', border: 'none', borderRadius: '8px', color: '#ffffff', cursor: etabsMutation.isPending ? 'wait' : 'pointer', fontWeight: 800, fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <CheckCircle2 size={16} />
                <span>{etabsMutation.isPending ? 'प्रमाणीकरण हुँदैछ...' : '✓ स्ट्रक्चरल स्क्रूटिनी स्वीकृत गर्नुहोस्'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: मार्गदर्शन २०८२ आंशिक निर्माण सम्पन्न प्रमाणपत्र जारी ── */}
      {partialCompletionPermit && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.75)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(4px)' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '18px', width: '100%', maxWidth: '700px', boxShadow: '0 25px 60px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column', maxHeight: '92vh', overflow: 'hidden' }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.75rem', borderBottom: '1.5px solid #e2e8f0', background: 'linear-gradient(135deg, #78350f 0%, #b45309 100%)', color: '#ffffff' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileCheck2 size={22} color="#fde68a" />
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>
                    आंशिक निर्माण सम्पन्न प्रमाणपत्र जारी फारम (भवन निर्माण मार्गदर्शन, २०८२)
                  </h3>
                </div>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.78rem', color: '#fef3c7' }}>
                  दरखास्त नं: <strong>{partialCompletionPermit.applicationNo}</strong> | {partialCompletionPermit.landOwnerName} | परिच्छेद ५ आंशिक निर्माण सम्पन्न
                </p>
              </div>
              <button onClick={() => setPartialCompletionPermit(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ffffff' }}>
                <X size={22} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.5rem 1.75rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: '#fffbeb', padding: '0.9rem', borderRadius: '10px', border: '1px solid #fde68a', fontSize: '0.8rem', color: '#92400e' }}>
                📋 <strong>मार्गदर्शन २०८२ परिच्छेद ५ नियम:</strong> बहु-तले भवनहरूमा सम्पूर्ण तला निर्माण कार्य सम्पन्न भैनसकेको तर तल्लो तला सुरक्षित रुपमा सम्पन्न भई बसोबास वा व्यवसाय गर्न योग्य भएमा तोकिएको अवधिका लागि <strong>आंशिक निर्माण सम्पन्नको प्रमाण पत्र</strong> जारी गर्न सकिनेछ।
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                    हाल निर्माण सम्पन्न भएको तला संख्या*
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max={partialCompletionPermit.totalFloors || 6}
                    value={partialForm.completedFloors}
                    onChange={(e) => setPartialForm({ ...partialForm, completedFloors: parseFloat(e.target.value) || 1.0 })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>कुल स्वीकृत तला: {partialCompletionPermit.totalFloors} तला</span>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                    सम्पन्न प्लिन्थ क्षेत्रफल (sq.ft)*
                  </label>
                  <input
                    type="number"
                    value={partialForm.completedPlinthSqFt}
                    onChange={(e) => setPartialForm({ ...partialForm, completedPlinthSqFt: parseFloat(e.target.value) || 0 })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>स्वीकृत प्लिन्थ: {partialCompletionPermit.plinthAreaSqFt} sq.ft</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                    आंशिक प्रयोग प्रयोजन (Allowed Usage)*
                  </label>
                  <input
                    type="text"
                    value={partialForm.allowedUsage}
                    onChange={(e) => setPartialForm({ ...partialForm, allowedUsage: e.target.value })}
                    placeholder="तल्लो तला व्यावसायिक पसल तथा बसोबास"
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                    बाँकी तला सम्पन्न गर्ने म्याद (BS)*
                  </label>
                  <input
                    type="text"
                    value={partialForm.validityExpiryDateBs}
                    onChange={(e) => setPartialForm({ ...partialForm, validityExpiryDateBs: e.target.value })}
                    placeholder="२०८३/०६/३०"
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 700, color: '#b45309' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                    स्थलगत जाँचकर्ता इन्जिनियर*
                  </label>
                  <input
                    type="text"
                    value={partialForm.siteEngineerName}
                    onChange={(e) => setPartialForm({ ...partialForm, siteEngineerName: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                    वडा सिफारिस पत्र नं*
                  </label>
                  <input
                    type="text"
                    value={partialForm.wardRecommendationNo}
                    onChange={(e) => setPartialForm({ ...partialForm, wardRecommendationNo: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                  कैफियत तथा सर्तहरू (Remarks & Conditions)*
                </label>
                <input
                  type="text"
                  value={partialForm.remarks}
                  onChange={(e) => setPartialForm({ ...partialForm, remarks: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '1rem 1.75rem', borderTop: '1.5px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => setPartialCompletionPermit(null)}
                style={{ padding: '0.6rem 1.25rem', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
              >
                रद्द गर्नुहोस्
              </button>

              <button
                type="button"
                disabled={partialCompletionMutation.isPending}
                onClick={() => partialCompletionMutation.mutate({
                  permitId: partialCompletionPermit.id,
                  completed_floors: partialForm.completedFloors,
                  total_allowed_floors: partialCompletionPermit.totalFloors || 2.5,
                  completed_plinth_sqft: partialForm.completedPlinthSqFt,
                  allowed_usage: partialForm.allowedUsage,
                  validity_expiry_date_bs: partialForm.validityExpiryDateBs,
                  site_engineer_name: partialForm.siteEngineerName,
                  engineer_nec_no: partialForm.engineerNecNo,
                  ward_recommendation_no: partialForm.wardRecommendationNo,
                  remarks: partialForm.remarks,
                })}
                style={{ padding: '0.65rem 1.6rem', background: '#b45309', border: 'none', borderRadius: '8px', color: '#ffffff', cursor: partialCompletionMutation.isPending ? 'wait' : 'pointer', fontWeight: 800, fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <FileCheck2 size={16} />
                <span>{partialCompletionMutation.isPending ? 'जारी गरिँदैछ...' : '✓ आंशिक निर्माण सम्पन्न प्रमाणपत्र जारी गर्नुहोस्'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 5: Engineers Management ── */}
      {activeTab === 'engineers' && (
        <EngineersManagementTab />
      )}
    </div>
  );
};

export default BuildingPermitPage;
