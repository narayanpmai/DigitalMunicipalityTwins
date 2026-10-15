import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sectoralApi } from '../../api/sectoral';
import type {
  HealthFacility,
  AmbulanceContact,
  BloodStockItem,
  ImmunizationSchedule,
  HealthDhis2Report,
  MedicineStockItem,
  PatientRecord,
  IpdAdmission,
  LabTestRecord,
  HealthPrescription,
  HealthDischargeSummary,
  AutoCalculatedDhis2Metrics,
  HealthInsuranceClaim,
  HealthSupplier,
  HealthPurchase,
  MedicineBatch,
  HealthPosSale,
  HealthStockTransfer,
} from '../../types/health';
import { OpdPatientModal } from './components/OpdPatientModal';
import { OpdTicketSlipModal } from './components/OpdTicketSlipModal';
import { IpdAdmissionModal, IpdDischargeModal } from './components/IpdAdmissionModal';
import { LabOrderModal, LabResultModal } from './components/LabModal';
import { HealthExcelImportModal } from './components/HealthExcelImportModal';
import { HealthFacilityModal } from './components/HealthFacilityModal';
import { AmbulanceModal } from './components/AmbulanceModal';
import { PrescriptionModal } from './components/PrescriptionModal';
import { DischargeSummaryModal } from './components/DischargeSummaryModal';
import { PatientEhrTimelineModal } from './components/PatientEhrTimelineModal';
import { PatientStickerModal } from './components/PatientStickerModal';
import { PharmacyPosModal } from './components/PharmacyPosModal';
import { PurchaseGrnModal } from './components/PurchaseGrnModal';
import { InsuranceClaimModal } from './components/InsuranceClaimModal';
import { StockTransferModal } from './components/StockTransferModal';
import { HealthSettingsTab } from './components/HealthSettingsTab';
import { Dhis2ReportDetailModal } from './components/Dhis2ReportDetailModal';
import { ReturnBillModal } from './components/ReturnBillModal';
import { getHealthMedCategories, getHealthUnits, getHealthDepartments } from './healthSettingsStorage';
import './health.css';
import {
  RotateCcw,
  UserCheck,
  TestTube2,
  DollarSign,
  HeartPulse,
  Truck,
  Droplet,
  CalendarCheck,
  Phone,
  Search,
  MapPin,
  Building2,
  FileCheck2,
  Pill,
  Activity,
  Plus,
  RefreshCw,
  Download,
  AlertCircle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Baby,
  Stethoscope,
  X,
  ExternalLink,
  Printer,
  Users,
  ShieldCheck,
  Eye,
  FileText,
  FileSpreadsheet,
  Repeat,
  Edit3,
  Trash2,
  Sparkles,
  Tag,
  TestTube,
  ShoppingBag,
  ShoppingCart,
  Boxes,
  ArrowRightLeft,
  CreditCard,
  Layers,
  Settings,
  Zap,
  Check,
  ChevronRight,
  Shield,
} from 'lucide-react';

const MONTHS_NEPALI = [
  'बैशाख', 'जेठ', 'असार', 'श्रावण', 'भाद्र', 'असोज',
  'कार्तिक', 'मंसिर', 'पौष', 'माघ', 'फाल्गुन', 'चैत'
];

const toNepaliNumber = (num: number | string | undefined | null): string => {
  if (num === undefined || num === null || num === '') return '-';
  const nepaliDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  return String(num).replace(/[0-9]/g, (d) => nepaliDigits[parseInt(d, 10)]);
};

export const HealthPage: React.FC = () => {
  const queryClient = useQueryClient();

  // Navigation Tabs
  type HealthTab =
    | 'facilities'
    | 'opd'
    | 'ipd'
    | 'lab'
    | 'dhis2'
    | 'medicines'
    | 'pos'
    | 'purchase'
    | 'insurance'
    | 'transfers'
    | 'ambulances'
    | 'blood'
    | 'immunization'
    | 'settings';

  type EhrModality = 'clinical' | 'pharmacy_store' | 'insurance' | 'public_health' | 'settings';

  const getModalityFromTab = (tab: HealthTab): EhrModality => {
    if (['opd', 'ipd', 'lab'].includes(tab)) return 'clinical';
    if (['pos', 'purchase', 'medicines', 'transfers'].includes(tab)) return 'pharmacy_store';
    if (tab === 'insurance') return 'insurance';
    if (['facilities', 'dhis2', 'ambulances', 'blood', 'immunization'].includes(tab)) return 'public_health';
    return 'settings';
  };

  const [activeTab, setActiveTab] = useState<HealthTab>('opd');
  const [activeModality, setActiveModality] = useState<EhrModality>('clinical');
  const [selectedWard, setSelectedWard] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState('');

  const handleModalityChange = (mod: EhrModality) => {
    setActiveModality(mod);
    if (mod === 'clinical' && !['opd', 'ipd', 'lab'].includes(activeTab)) {
      setActiveTab('opd');
    } else if (mod === 'pharmacy_store' && !['pos', 'purchase', 'medicines', 'transfers'].includes(activeTab)) {
      setActiveTab('pos');
    } else if (mod === 'insurance') {
      setActiveTab('insurance');
    } else if (mod === 'public_health' && !['facilities', 'dhis2', 'ambulances', 'blood', 'immunization'].includes(activeTab)) {
      setActiveTab('facilities');
    } else if (mod === 'settings') {
      setActiveTab('settings');
    }
  };

  // Hospital Modals & States
  const [showPatientStickerModal, setShowPatientStickerModal] = useState(false);
  const [selectedStickerPatient, setSelectedStickerPatient] = useState<PatientRecord | null>(null);
  const [selectedStickerLabTest, setSelectedStickerLabTest] = useState<LabTestRecord | null>(null);
  const [showPosModal, setShowPosModal] = useState(false);
  const [showReturnBillModal, setShowReturnBillModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showInsuranceModal, setShowInsuranceModal] = useState(false);
  const [selectedInsuranceClaim, setSelectedInsuranceClaim] = useState<HealthInsuranceClaim | null>(null);
  const [showTransferModal, setShowTransferModal] = useState(false);


  // Hospital Modals & States
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [patientModalMode, setPatientModalMode] = useState<'new' | 'existing'>('new');
  const [selectedTicketPatient, setSelectedTicketPatient] = useState<PatientRecord | null>(null);
  const [showIpdModal, setShowIpdModal] = useState(false);
  const [selectedIpdBed, setSelectedIpdBed] = useState<string>('Bed-01');
  const [dischargeAdmission, setDischargeAdmission] = useState<IpdAdmission | null>(null);
  const [showLabOrderModal, setShowLabOrderModal] = useState(false);
  const [selectedLabForResults, setSelectedLabForResults] = useState<LabTestRecord | null>(null);
  const [opdDepartmentFilter, setOpdDepartmentFilter] = useState('all');
  const [ipdStatusFilter, setIpdStatusFilter] = useState('all');
  const [labStatusFilter, setLabStatusFilter] = useState('all');

  // EHR, E-Prescriptions & Clinical Discharge Summary States
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [selectedRxPatient, setSelectedRxPatient] = useState<PatientRecord | null>(null);
  const [showDischargeSummaryModal, setShowDischargeSummaryModal] = useState(false);
  const [selectedDischargeAdmission, setSelectedDischargeAdmission] = useState<IpdAdmission | null>(null);
  const [showEhrModal, setShowEhrModal] = useState(false);
  const [selectedEhrPatientNo, setSelectedEhrPatientNo] = useState<string>('');
  const [rxStatusFilter, setRxStatusFilter] = useState<'all' | 'pending' | 'dispensed'>('all');
  const [transferTypeFilter, setTransferTypeFilter] = useState('all');
  const [transferStatusFilter, setTransferStatusFilter] = useState('all');
  const [isAutoCalculatingDhis2, setIsAutoCalculatingDhis2] = useState(false);

  // Modals
  const [showFacilityModal, setShowFacilityModal] = useState(false);
  const [facilityToEdit, setFacilityToEdit] = useState<HealthFacility | null>(null);
  const [showDhis2Modal, setShowDhis2Modal] = useState(false);
  const [showDhis2DetailModal, setShowDhis2DetailModal] = useState(false);
  const [selectedDhis2Report, setSelectedDhis2Report] = useState<HealthDhis2Report | null>(null);
  const [dhis2MonthFilter, setDhis2MonthFilter] = useState('all');
  const [dhis2SyncFilter, setDhis2SyncFilter] = useState('all');
  const [departmentsList, setDepartmentsList] = useState(() => getHealthDepartments());

  useEffect(() => {
    const handleSettingsChange = () => setDepartmentsList(getHealthDepartments());
    window.addEventListener('p5-health-settings-changed', handleSettingsChange);
    return () => window.removeEventListener('p5-health-settings-changed', handleSettingsChange);
  }, []);

  useEffect(() => {
    setActiveModality(getModalityFromTab(activeTab));
  }, [activeTab]);

  const [showMedicineModal, setShowMedicineModal] = useState(false);
  const [showHealthExcelModal, setShowHealthExcelModal] = useState(false);
  const [healthExcelInitialTab, setHealthExcelInitialTab] = useState<'facilities' | 'dhis2' | 'opd' | 'medicines'>('facilities');
  const [showAmbulanceModal, setShowAmbulanceModal] = useState(false);
  const [ambulanceToEdit, setAmbulanceToEdit] = useState<AmbulanceContact | null>(null);

  // Form State for DHIS2 Report
  const initialDhis2Form = {
    fiscalYear: '२०८१/०८२',
    monthNepali: 'भाद्र',
    healthFacilityName: 'पाँचपोखरी आधारभूत अस्पताल',
    wardNumber: 6,
    dhis2OrgUnitId: 'NP_BAG_SIN_P01',
    totalOpdVisits: 450,
    maleOpdVisits: 200,
    femaleOpdVisits: 250,
    emergencyVisits: 45,
    firstAncVisits: 25,
    fourAncProtocolVisits: 20,
    institutionalDeliveries: 12,
    pncVisits: 15,
    fullyImmunizedChildren: 30,
    growthMonitoredChildren: 80,
    diarrheaCases: 8,
    ariPneumoniaCases: 16,
    hypertensionDiabetesCases: 42,
    mentalHealthCases: 3,
    reportedBy: 'स्वास्थ्य अधिकृत',
    syncStatus: 'pending',
  };
  const [dhis2FormData, setDhis2FormData] = useState(initialDhis2Form);

  // Form State for Medicine
  const initialMedicineForm = {
    medicineName: '',
    genericName: '',
    category: 'essential',
    healthFacilityName: 'पाँचपोखरी आधारभूत अस्पताल',
    wardNumber: 6,
    batchNo: '',
    unit: 'ट्याब्लेट',
    stockQuantity: 500,
    minimumRequiredStock: 100,
    expiryDate: '२०८३/०१/०१',
    status: 'sufficient',
  };
  const [medicineFormData, setMedicineFormData] = useState(initialMedicineForm);

  // Queries
  const { data: facilities = [], isLoading: isFacilitiesLoading } = useQuery({
    queryKey: ['health-facilities', selectedWard],
    queryFn: () => sectoralApi.getHealthFacilities(selectedWard),
  });

  const { data: ambulances = [] } = useQuery({
    queryKey: ['ambulance-contacts'],
    queryFn: () => sectoralApi.getAmbulanceContacts(),
  });

  const { data: bloodStock = [] } = useQuery({
    queryKey: ['blood-stock'],
    queryFn: () => sectoralApi.getBloodStock(),
  });

  const { data: immunization = [] } = useQuery({
    queryKey: ['immunization-schedule'],
    queryFn: () => sectoralApi.getImmunizationSchedule(),
  });

  const { data: dhis2Reports = [], isLoading: isDhis2Loading } = useQuery({
    queryKey: ['health-dhis2-reports'],
    queryFn: () => sectoralApi.getDhis2Reports(),
  });

  const { data: dhis2Summary } = useQuery({
    queryKey: ['health-dhis2-summary'],
    queryFn: () => sectoralApi.getDhis2Summary(),
  });

  const { data: medicines = [], isLoading: isMedicinesLoading } = useQuery({
    queryKey: ['health-medicines'],
    queryFn: () => sectoralApi.getMedicineStock(),
  });

  // Primary Hospital: Patient Registration (OPD)
  const { data: patients = [], isLoading: isPatientsLoading } = useQuery({
    queryKey: ['health-patients', selectedWard, opdDepartmentFilter],
    queryFn: () => sectoralApi.getPatients({ ward: selectedWard || undefined, department: opdDepartmentFilter }),
  });

  // Primary Hospital: IPD Admissions (15 Beds)
  const { data: ipdAdmissions = [], isLoading: isIpdLoading } = useQuery({
    queryKey: ['health-ipd-admissions', ipdStatusFilter],
    queryFn: () => sectoralApi.getIpdAdmissions(ipdStatusFilter),
  });

  // Primary Hospital: Laboratory Tests
  const { data: labTests = [], isLoading: isLabLoading } = useQuery({
    queryKey: ['health-lab-tests', labStatusFilter],
    queryFn: () => sectoralApi.getLabTests({ status: labStatusFilter }),
  });

  // Primary Hospital: E-Prescriptions
  const { data: prescriptions = [], isLoading: isPrescriptionsLoading } = useQuery({
    queryKey: ['health-prescriptions'],
    queryFn: () => sectoralApi.getPrescriptions(),
  });

  const createPrescriptionMutation = useMutation({
    mutationFn: (data: Partial<HealthPrescription>) => sectoralApi.createPrescription(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health-prescriptions'] });
      setShowPrescriptionModal(false);
      setSelectedRxPatient(null);
    },
  });

  const dispensePrescriptionMutation = useMutation({
    mutationFn: ({ id, pharmacistName }: { id: string; pharmacistName?: string }) =>
      sectoralApi.dispensePrescription(id, pharmacistName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health-prescriptions'] });
      queryClient.invalidateQueries({ queryKey: ['health-medicines'] });
    },
  });

  const createDischargeSummaryMutation = useMutation({
    mutationFn: (data: Partial<HealthDischargeSummary>) => sectoralApi.createDischargeSummary(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health-ipd-admissions'] });
      setShowDischargeSummaryModal(false);
      setSelectedDischargeAdmission(null);
    },
  });

  // Mutations
  const createDhis2Mutation = useMutation({
    mutationFn: (data: any) => sectoralApi.createDhis2Report(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health-dhis2-reports'] });
      queryClient.invalidateQueries({ queryKey: ['health-dhis2-summary'] });
      setShowDhis2Modal(false);
      setDhis2FormData(initialDhis2Form);
    },
  });

  const syncDhis2Mutation = useMutation({
    mutationFn: (id: string) => sectoralApi.syncDhis2Report(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health-dhis2-reports'] });
      queryClient.invalidateQueries({ queryKey: ['health-dhis2-summary'] });
    },
  });

  const deleteDhis2Mutation = useMutation({
    mutationFn: (id: string) => sectoralApi.deleteDhis2Report(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health-dhis2-reports'] });
      queryClient.invalidateQueries({ queryKey: ['health-dhis2-summary'] });
    },
  });

  const createMedicineMutation = useMutation({
    mutationFn: (data: any) => sectoralApi.createMedicine(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health-medicines'] });
      setShowMedicineModal(false);
      setMedicineFormData(initialMedicineForm);
    },
  });

  // Primary Hospital Mutations
  const createPatientMutation = useMutation({
    mutationFn: (data: Partial<PatientRecord>) => sectoralApi.createPatient(data),
    onSuccess: (savedPatient) => {
      queryClient.invalidateQueries({ queryKey: ['health-patients'] });
      setShowPatientModal(false);
      if (savedPatient) {
        setSelectedTicketPatient(savedPatient);
      }
    },
  });

  const updatePatientMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PatientRecord> }) =>
      sectoralApi.updatePatient(id, data),
    onSuccess: (updatedPatient) => {
      queryClient.invalidateQueries({ queryKey: ['health-patients'] });
      setShowPatientModal(false);
      if (updatedPatient) {
        setSelectedTicketPatient(updatedPatient);
      }
    },
  });

  const admitPatientMutation = useMutation({
    mutationFn: (data: Partial<IpdAdmission>) => sectoralApi.admitPatient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health-ipd-admissions'] });
      setShowIpdModal(false);
    },
  });

  const dischargePatientMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { dischargeDate?: string; treatmentSummary?: string } }) =>
      sectoralApi.dischargePatient(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health-ipd-admissions'] });
      setDischargeAdmission(null);
    },
  });

  const createLabTestMutation = useMutation({
    mutationFn: (data: Partial<LabTestRecord>) => sectoralApi.createLabTest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health-lab-tests'] });
      setShowLabOrderModal(false);
    },
  });

  const updateLabTestMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<LabTestRecord> }) =>
      sectoralApi.updateLabTest(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health-lab-tests'] });
      setSelectedLabForResults(null);
    },
  });

  // Health Facilities Mutations
  const saveFacilityMutation = useMutation({
    mutationFn: (data: Partial<HealthFacility>) => {
      if (facilityToEdit?.id) {
        return sectoralApi.updateHealthFacility(facilityToEdit.id, data);
      }
      return sectoralApi.createHealthFacility(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health-facilities'] });
      setShowFacilityModal(false);
      setFacilityToEdit(null);
      alert('स्वास्थ्य संस्थाको विवरण सफलतापूर्वक सुरक्षित भयो!');
    },
    onError: (err: any) => {
      console.error('Failed to save health facility:', err);
      alert('स्वास्थ्य संस्था सुरक्षित गर्न सकिएन: ' + (err?.response?.data?.message || err.message));
    },
  });

  const deleteFacilityMutation = useMutation({
    mutationFn: (id: string) => sectoralApi.deleteHealthFacility(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health-facilities'] });
    },
  });

  // ── Hospital ERP Queries: POS, Purchases, Batches, Claims, Transfers ──
  const { data: posSales = [] } = useQuery({
    queryKey: ['health-pos-sales'],
    queryFn: () => sectoralApi.getPosSales(),
  });

  const { data: purchases = [] } = useQuery({
    queryKey: ['health-purchases'],
    queryFn: () => sectoralApi.getPurchases(),
  });

  const { data: batches = [] } = useQuery({
    queryKey: ['health-batches'],
    queryFn: () => sectoralApi.getMedicineBatches(),
  });

  const { data: insuranceClaims = [] } = useQuery({
    queryKey: ['health-insurance-claims'],
    queryFn: () => sectoralApi.getInsuranceClaims(),
  });

  const { data: insuranceSummary } = useQuery({
    queryKey: ['health-insurance-summary'],
    queryFn: () => sectoralApi.getInsuranceSummary(),
  });

  const { data: stockTransfers = [] } = useQuery({
    queryKey: ['health-stock-transfers'],
    queryFn: () => sectoralApi.getStockTransfers(),
  });

  // ── Hospital ERP Mutations ──
  const createPosSaleMutation = useMutation({
    mutationFn: (data: any) => sectoralApi.createPosSale(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health-pos-sales'] });
      queryClient.invalidateQueries({ queryKey: ['health-batches'] });
      queryClient.invalidateQueries({ queryKey: ['health-medicines'] });
      queryClient.invalidateQueries({ queryKey: ['health-insurance-claims'] });
      queryClient.invalidateQueries({ queryKey: ['health-insurance-summary'] });
      queryClient.invalidateQueries({ queryKey: ['health-prescriptions'] });
      setShowPosModal(false);
      alert('फार्मेसी काउन्टर बिक्री बिल सफलतापूर्वक जारी भयो!');
    },
  });

  const createPurchaseMutation = useMutation({
    mutationFn: (data: any) => sectoralApi.createPurchase(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health-purchases'] });
      queryClient.invalidateQueries({ queryKey: ['health-batches'] });
      queryClient.invalidateQueries({ queryKey: ['health-medicines'] });
      setShowPurchaseModal(false);
      alert('खरिद दाखिला प्रतिवेदन (GRN) सफलतापूर्वक सुरक्षित भयो!');
    },
  });

  const updateInsuranceClaimMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => sectoralApi.updateInsuranceClaim(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health-insurance-claims'] });
      queryClient.invalidateQueries({ queryKey: ['health-insurance-summary'] });
      setShowInsuranceModal(false);
      alert('बीमा दावी स्थिति सफलतापूर्वक अद्यावधिक भयो!');
    },
  });

  const createStockTransferMutation = useMutation({
    mutationFn: (data: any) => sectoralApi.createStockTransfer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health-stock-transfers'] });
      queryClient.invalidateQueries({ queryKey: ['health-batches'] });
      queryClient.invalidateQueries({ queryKey: ['health-medicines'] });
      setShowTransferModal(false);
      alert('स्टोर निकासा/मिन्हा सफलतापूर्वक सम्पन्न भयो!');
    },
  });

  // Filtered lists
  const safeFacilities = Array.isArray(facilities) ? facilities : [];
  const filteredFacilities = safeFacilities
    .filter((f) => {
      if (selectedWard && f.wardNumber !== selectedWard) return false;
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        (f.nameNepali || '').toLowerCase().includes(term) ||
        (f.name || '').toLowerCase().includes(term) ||
        (f.location || '').toLowerCase().includes(term) ||
        (f.chiefName || '').toLowerCase().includes(term) ||
        (f.inChargeName || '').toLowerCase().includes(term) ||
        (f.phone || '').toLowerCase().includes(term) ||
        (f.contactNumber || '').toLowerCase().includes(term) ||
        (f.address || '').toLowerCase().includes(term)
      );
    })
    .sort((a, b) => (a.orderNo || 999) - (b.orderNo || 999) || (a.wardNumber || 0) - (b.wardNumber || 0));

  const safeAmbulances = Array.isArray(ambulances) ? ambulances : [];
  const filteredAmbulances = safeAmbulances.filter((a) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (a.driverName || '').toLowerCase().includes(term) ||
      (a.stationLocation || '').toLowerCase().includes(term) ||
      (a.vehicleNumber || '').toLowerCase().includes(term)
    );
  });

  const safeDhis2Reports: HealthDhis2Report[] = Array.isArray(dhis2Reports) ? dhis2Reports : [];
  const filteredDhis2Reports = safeDhis2Reports.filter((r) => {
    if (selectedWard && r.wardNumber !== selectedWard) return false;
    if (dhis2MonthFilter !== 'all' && r.monthNepali !== dhis2MonthFilter) return false;
    if (dhis2SyncFilter === 'synced' && r.syncStatus !== 'synced') return false;
    if (dhis2SyncFilter === 'pending' && r.syncStatus === 'synced') return false;
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (r.healthFacilityName || '').toLowerCase().includes(term) ||
      (r.monthNepali || '').toLowerCase().includes(term) ||
      (r.fiscalYear || '').toLowerCase().includes(term) ||
      (r.reportedBy || '').toLowerCase().includes(term)
    );
  });

  const dhis2TotalCount = filteredDhis2Reports.length;
  const dhis2SyncedCount = filteredDhis2Reports.filter(r => r.syncStatus === 'synced').length;
  const dhis2PendingCount = dhis2TotalCount - dhis2SyncedCount;
  const dhis2TotalOpdSum = filteredDhis2Reports.reduce((acc, r) => acc + (Number(r.totalOpdVisits) || 0), 0);
  const dhis2TotalDeliveriesSum = filteredDhis2Reports.reduce((acc, r) => acc + (Number(r.institutionalDeliveries) || 0), 0);
  const dhis2TotalImmunizedSum = filteredDhis2Reports.reduce((acc, r) => acc + (Number(r.fullyImmunizedChildren) || 0), 0);

  const safeMedicines: MedicineStockItem[] = Array.isArray(medicines) ? medicines : [];
  const filteredMedicines = safeMedicines.filter((m) => {
    if (selectedWard && m.wardNumber !== selectedWard) return false;
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (m.medicineName || (m as any).medicine_name || '').toLowerCase().includes(term) ||
      (m.genericName || (m as any).generic_name || '').toLowerCase().includes(term) ||
      (m.healthFacilityName || (m as any).health_facility_name || '').toLowerCase().includes(term)
    );
  });

  const safePrescriptions: HealthPrescription[] = Array.isArray(prescriptions) ? prescriptions : [];
  const filteredPrescriptions = safePrescriptions.filter((rx) => {
    if (selectedWard && rx.wardNumber !== selectedWard) return false;
    if (rxStatusFilter !== 'all' && rx.dispenseStatus !== rxStatusFilter) return false;
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (rx.patientName || '').toLowerCase().includes(term) ||
      (rx.patientNo || '').toLowerCase().includes(term) ||
      (rx.rxNumber || '').toLowerCase().includes(term) ||
      (rx.doctorName || '').toLowerCase().includes(term) ||
      (rx.insuranceNumber || '').toLowerCase().includes(term)
    );
  });

  const safePatients: PatientRecord[] = Array.isArray(patients) ? patients : [];
  const filteredPatients = safePatients.filter((p) => {
    if (selectedWard && p.wardNumber !== selectedWard) return false;
    if (opdDepartmentFilter !== 'all' && p.department !== opdDepartmentFilter) return false;
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (p.fullName || '').toLowerCase().includes(term) ||
      (p.patientNo || '').toLowerCase().includes(term) ||
      (p.phone || '').toLowerCase().includes(term) ||
      (p.insuranceNumber || '').toLowerCase().includes(term) ||
      (p.department || '').toLowerCase().includes(term)
    );
  });

  const safeIpdAdmissions: IpdAdmission[] = Array.isArray(ipdAdmissions) ? ipdAdmissions : [];
  const filteredIpdAdmissions = safeIpdAdmissions.filter((a) => {
    if (ipdStatusFilter !== 'all' && a.status !== ipdStatusFilter) return false;
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (a.patientName || '').toLowerCase().includes(term) ||
      (a.admissionNo || '').toLowerCase().includes(term) ||
      (a.bedNumber || '').toLowerCase().includes(term) ||
      (a.diagnosis || '').toLowerCase().includes(term) ||
      (a.admittingDoctor || '').toLowerCase().includes(term)
    );
  });

  const safeLabTests: LabTestRecord[] = Array.isArray(labTests) ? labTests : [];
  const filteredLabTests = safeLabTests.filter((l) => {
    if (labStatusFilter !== 'all' && l.status !== labStatusFilter) return false;
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (l.patientName || '').toLowerCase().includes(term) ||
      (l.testOrderNo || '').toLowerCase().includes(term) ||
      (l.testName || '').toLowerCase().includes(term) ||
      (l.testCategory || '').toLowerCase().includes(term)
    );
  });

  const safeStockTransfers: HealthStockTransfer[] = Array.isArray(stockTransfers) ? stockTransfers : [];
  const filteredStockTransfers = safeStockTransfers.filter((t: any) => {
    const type = t.transferType || t.transfer_type;
    if (transferTypeFilter !== 'all' && type !== transferTypeFilter) return false;
    if (transferStatusFilter !== 'all' && t.status !== transferStatusFilter) return false;
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (t.transferNo || t.transfer_no || '').toLowerCase().includes(term) ||
      (t.medicineName || t.medicine_name || '').toLowerCase().includes(term) ||
      (t.batchNo || t.batch_no || '').toLowerCase().includes(term) ||
      (t.fromLocation || t.from_location || t.fromFacility || '').toLowerCase().includes(term) ||
      (t.toLocation || t.to_location || t.toFacility || '').toLowerCase().includes(term) ||
      (t.requestedBy || t.requested_by || '').toLowerCase().includes(term) ||
      (t.issuedBy || t.issued_by || t.transferredBy || '').toLowerCase().includes(term) ||
      (t.remarks || '').toLowerCase().includes(term)
    );
  });

  // Export JSON for DHIS2 format
  const exportDhis2Json = (report: HealthDhis2Report) => {
    const dhis2Payload = {
      orgUnit: report.dhis2OrgUnitId || 'NP_BAG_SIN_P01',
      period: `2024${String(MONTHS_NEPALI.indexOf(report.monthNepali) + 1).padStart(2, '0')}`,
      dataValues: [
        { dataElement: 'DE_OPD_TOTAL', value: report.totalOpdVisits },
        { dataElement: 'DE_OPD_MALE', value: report.maleOpdVisits },
        { dataElement: 'DE_OPD_FEMALE', value: report.femaleOpdVisits },
        { dataElement: 'DE_EMERGENCY', value: report.emergencyVisits },
        { dataElement: 'DE_ANC_1ST', value: report.firstAncVisits },
        { dataElement: 'DE_ANC_4TH_PROTOCOL', value: report.fourAncProtocolVisits },
        { dataElement: 'DE_INSTITUTIONAL_DELIVERY', value: report.institutionalDeliveries },
        { dataElement: 'DE_EPI_FULLY_IMMUNIZED', value: report.fullyImmunizedChildren },
        { dataElement: 'DE_NUTRITION_GROWTH_MONITORED', value: report.growthMonitoredChildren },
        { dataElement: 'DE_DISEASE_DIARRHEA', value: report.diarrheaCases },
        { dataElement: 'DE_DISEASE_PNEUMONIA', value: report.ariPneumoniaCases },
      ],
    };

    const blob = new Blob([JSON.stringify(dhis2Payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DHIS2_${report.monthNepali}_${report.healthFacilityName.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '3rem' }}>
      {/* ── HEADER ── */}
      {/* ── HEALTH MODULE HERO HEADER & QUICK ACTIONS ── */}
      <div
        className="dt-card"
        style={{
          padding: '1.25rem 1.5rem',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 12px -2px rgba(0,0,0,0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.15rem',
        }}
      >
        {/* Top Header Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(220, 38, 38, 0.15)',
              }}
            >
              <HeartPulse size={30} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  स्वास्थ्य सेवा तथा DHIS2 / HMIS व्यवस्थापन प्रणाली
                </h1>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: '12px', backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' }}>
                  ● अस्पताल ERP & e-LMIS
                </span>
              </div>
              <p style={{ fontSize: '0.84rem', color: '#475569', margin: '3px 0 0 0' }}>
                पाँचपोखरी थाङपाल: नेपाल सरकार DHIS2 मासिक रिपोर्टिङ, १५-शय्या आधारभूत अस्पताल, ई-फार्मेसी, ल्याब र स्वास्थ्य चौकीहरू
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#64748b' }}>
              <div style={{ fontWeight: 800, color: '#0f172a' }}>वि.सं. २०८१/०५/१५</div>
              <div style={{ color: '#0284c7', fontWeight: 600 }}>HMIS v2.1 • TypeORM PostGIS</div>
            </div>
            <a
              href="/app/admin"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '9999px',
                backgroundColor: '#f8fafc',
                color: '#334155',
                fontSize: '0.78rem',
                fontWeight: 700,
                textDecoration: 'none',
                border: '1.5px solid #cbd5e1',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                transition: 'all 0.18s ease',
              }}
              title="प्रयोगकर्ता तथा कर्मचारी भूमिका व्यवस्थापन गर्न Admin Console मा जानुहोस्"
            >
              <Shield size={14} color="#0284c7" />
              <span>प्रयोगकर्ता तथा भूमिका (Admin)</span>
            </a>
          </div>
        </div>
      </div>


      {/* ── KPI INDICATOR CARDS (MoHP / DHIS2 Benchmarks) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div className="dt-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '10px', backgroundColor: '#ffe4e6', color: '#be123c' }}>
            <Activity size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 600 }}>कुल बहिरङ्ग (OPD) बिरामी</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
              {(dhis2Summary?.totalOpd || 1317).toLocaleString('ne-NP')} जना
            </div>
          </div>
        </div>

        <div className="dt-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '10px', backgroundColor: '#fff7ed', color: '#ea580c' }}>
            <Baby size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 600 }}>संस्थागत सुत्केरी (Delivery)</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
              {(dhis2Summary?.totalDeliveries || 38).toLocaleString('ne-NP')} जना
            </div>
          </div>
        </div>

        <div className="dt-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '10px', backgroundColor: '#f0fdf4', color: '#16a34a' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 600 }}>पूर्ण खोप पाएका बालबालिका</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
              {(dhis2Summary?.totalImmunized || 111).toLocaleString('ne-NP')} जना
            </div>
          </div>
        </div>

        <div className="dt-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '10px', backgroundColor: '#fffbeb', color: '#d97706' }}>
            <Pill size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 600 }}>औषधि मौज्दात सूची (LMIS)</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
              {safeMedicines.length} प्रकार
            </div>
          </div>
        </div>
      </div>

            {/* ── MODERN EHR MODALITY PILL NAVIGATION SYSTEM ── */}
      <div className="ehr-nav-card">
        {/* Top Header Row with Title and System Status */}
        <div className="ehr-modality-header">
          <div className="ehr-title-box">
            <div className="ehr-title-icon">
              <Layers size={22} />
            </div>
            <div className="ehr-title-text">
              <h2>
                <span>अस्पताल कार्यक्षेत्र तथा EHR मोडालिटी (Hospital EHR Modules)</span>
                <span style={{ fontSize: '0.72rem', backgroundColor: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                  ५ मुख्य मोडालिटीहरू
                </span>
              </h2>
              <p>
                आधुनिक अस्पताल सूचना प्रणाली (EHR) अनुसार मोडालिटी चयन गरी सम्बन्धित सेवा, अभिलेख तथा प्रतिवेदन व्यवस्थापन गर्नुहोस्
              </p>
            </div>
          </div>

          {/* Quick Active Status Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
              सक्रिय कार्यक्षेत्र:
            </span>
            <span className={`ehr-status-chip mod-${activeModality}`}>
              <span className="ehr-pulse-dot" />
              {activeModality === 'clinical' && 'क्लिनिकल सेवा (Clinical EHR)'}
              {activeModality === 'pharmacy_store' && 'फार्मेसी तथा स्टोर (Pharmacy)'}
              {activeModality === 'insurance' && 'स्वास्थ्य बीमा (Insurance HIB)'}
              {activeModality === 'public_health' && 'जनस्वास्थ्य तथा HMIS (Public)'}
              {activeModality === 'settings' && 'मास्टर सेटिङ्स (EHR Setup)'}
            </span>
          </div>
        </div>

        {/* ── THE SEGMENTED DOCK SWITCHER ── */}
        <div className="ehr-pill-switcher-container">
          <div className="ehr-pill-switcher">
            <button
              type="button"
              onClick={() => handleModalityChange('clinical')}
              className={`ehr-pill-btn ehr-mod-clinical ${activeModality === 'clinical' ? 'active' : ''}`}
            >
              <Stethoscope size={16} />
              <span>क्लिनिकल (Clinical EHR)</span>
              <span className="ehr-pill-badge">३</span>
            </button>

            <button
              type="button"
              onClick={() => handleModalityChange('pharmacy_store')}
              className={`ehr-pill-btn ehr-mod-pharmacy ${activeModality === 'pharmacy_store' ? 'active' : ''}`}
            >
              <Boxes size={16} />
              <span>फार्मेसी र स्टोर (Pharmacy & Store)</span>
              <span className="ehr-pill-badge">४</span>
            </button>

            <button
              type="button"
              onClick={() => handleModalityChange('insurance')}
              className={`ehr-pill-btn ehr-mod-insurance ${activeModality === 'insurance' ? 'active' : ''}`}
            >
              <ShieldCheck size={16} />
              <span>स्वास्थ्य बीमा (Insurance HIB)</span>
              <span className="ehr-pill-badge">१</span>
            </button>

            <button
              type="button"
              onClick={() => handleModalityChange('public_health')}
              className={`ehr-pill-btn ehr-mod-public ${activeModality === 'public_health' ? 'active' : ''}`}
            >
              <Building2 size={16} />
              <span>जनस्वास्थ्य (Public Health)</span>
              <span className="ehr-pill-badge">५</span>
            </button>

            <button
              type="button"
              onClick={() => handleModalityChange('settings')}
              className={`ehr-pill-btn ehr-mod-settings ${activeModality === 'settings' ? 'active' : ''}`}
            >
              <Settings size={16} />
              <span>मास्टर सेटिङ्स (Setup)</span>
            </button>
          </div>
        </div>

        {/* ── SECONDARY SUB-NAVIGATION TOOLBAR ── */}
        <div className="ehr-subpill-toolbar">
          {/* Sub-Pills Group */}
          <div className="ehr-subpills-group">
            {/* SUB-PILLS: Clinical */}
            {activeModality === 'clinical' && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveTab('opd')}
                  className={`ehr-subpill-btn ${activeTab === 'opd' ? 'active' : ''}`}
                >
                  <Users size={14} />
                  <span>बिरामी दर्ता / ओपिडी (OPD)</span>
                  <span className="ehr-subpill-tag">{safePatients.length}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('ipd')}
                  className={`ehr-subpill-btn ${activeTab === 'ipd' ? 'active' : ''}`}
                >
                  <Building2 size={14} />
                  <span>१५-शय्या अन्तरङ्ग (IPD)</span>
                  <span className="ehr-subpill-tag">
                    {safeIpdAdmissions.filter((a: any) => a.status === 'admitted').length} भर्ना
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('lab')}
                  className={`ehr-subpill-btn ${activeTab === 'lab' ? 'active' : ''}`}
                >
                  <Activity size={14} />
                  <span>प्रयोगशाला (Lab Tests)</span>
                  <span className="ehr-subpill-tag">{safeLabTests.length}</span>
                </button>
              </>
            )}

            {/* SUB-PILLS: Pharmacy & Store */}
            {activeModality === 'pharmacy_store' && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveTab('pos')}
                  className={`ehr-subpill-btn ${activeTab === 'pos' ? 'active' : ''}`}
                >
                  <ShoppingCart size={14} />
                  <span>फार्मेसी बिलिङ (POS)</span>
                  <span className="ehr-subpill-tag">{posSales.length}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('medicines')}
                  className={`ehr-subpill-btn ${activeTab === 'medicines' ? 'active' : ''}`}
                >
                  <Pill size={14} />
                  <span>औषधि मौज्दात (e-LMIS)</span>
                  <span className="ehr-subpill-tag">{safeMedicines.length}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('purchase')}
                  className={`ehr-subpill-btn ${activeTab === 'purchase' ? 'active' : ''}`}
                >
                  <Boxes size={14} />
                  <span>खरिद दाखिला (GRN ४०३)</span>
                  <span className="ehr-subpill-tag">{purchases.length}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('transfers')}
                  className={`ehr-subpill-btn ${activeTab === 'transfers' ? 'active' : ''}`}
                >
                  <ArrowRightLeft size={14} />
                  <span>औषधि स्थानान्तरण</span>
                  <span className="ehr-subpill-tag">{safeStockTransfers.length}</span>
                </button>
              </>
            )}

            {/* SUB-PILLS: Insurance */}
            {activeModality === 'insurance' && (
              <button
                type="button"
                onClick={() => setActiveTab('insurance')}
                className={`ehr-subpill-btn ${activeTab === 'insurance' ? 'active' : ''}`}
              >
                <ShieldCheck size={14} />
                <span>राष्ट्रिय स्वास्थ्य बीमा बोर्ड दाबी (HIB Claims)</span>
                <span className="ehr-subpill-tag">{insuranceClaims.length} दाबी</span>
              </button>
            )}

            {/* SUB-PILLS: Public Health & HMIS */}
            {activeModality === 'public_health' && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveTab('facilities')}
                  className={`ehr-subpill-btn ${activeTab === 'facilities' ? 'active' : ''}`}
                >
                  <Building2 size={14} />
                  <span>स्वास्थ्य संस्थाहरू</span>
                  <span className="ehr-subpill-tag">{facilities.length}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('dhis2')}
                  className={`ehr-subpill-btn ${activeTab === 'dhis2' ? 'active' : ''}`}
                >
                  <FileCheck2 size={14} />
                  <span>DHIS2 मासिक प्रतिवेदन</span>
                  <span className="ehr-subpill-tag">{safeDhis2Reports.length}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('ambulances')}
                  className={`ehr-subpill-btn ${activeTab === 'ambulances' ? 'active' : ''}`}
                >
                  <Truck size={14} />
                  <span>एम्बुलेन्स सेवा</span>
                  <span className="ehr-subpill-tag">{safeAmbulances.length}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('blood')}
                  className={`ehr-subpill-btn ${activeTab === 'blood' ? 'active' : ''}`}
                >
                  <Droplet size={14} />
                  <span>रक्त सञ्चार केन्द्र</span>
                  <span className="ehr-subpill-tag">{bloodStock?.length || 8}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('immunization')}
                  className={`ehr-subpill-btn ${activeTab === 'immunization' ? 'active' : ''}`}
                >
                  <CalendarCheck size={14} />
                  <span>खोप क्यालेन्डर (EPI)</span>
                </button>
              </>
            )}

            {/* SUB-PILLS: Settings */}
            {activeModality === 'settings' && (
              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                className={`ehr-subpill-btn ${activeTab === 'settings' ? 'active' : ''}`}
              >
                <Settings size={14} />
                <span>अस्पताल मास्टर सेटिङ्स (Catalogs & Setup)</span>
              </button>
            )}
          </div>

          {/* Filter Actions: Ward Selector & Global Search */}
          <div className="ehr-filter-actions">
            <div className="ehr-ward-wrapper">
              <MapPin size={13} className="ehr-ward-icon" />
              <select
                value={selectedWard}
                onChange={(e) => setSelectedWard(Number(e.target.value))}
                className="ehr-ward-select"
              >
                <option value={0}>सबै वडाहरू (All Wards)</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
                  <option key={w} value={w}>
                    वडा नं. {w}
                  </option>
                ))}
              </select>
            </div>

            <div className="ehr-search-box">
              <Search
                size={14}
                className="ehr-search-icon"
              />
              <input
                type="text"
                placeholder="खोज्नुहोस् (बिरामी, बिल, औषधि)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="ehr-search-input"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="ehr-search-clear"
                  title="खोजी हटाउनुहोस्"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── SLEEK MINIMAL CONTEXT BREADCRUMB STRIP ── */}
        <div className="ehr-context-bar">
          <div className="ehr-context-left">
            <span className="ehr-context-dot" />
            <span className="ehr-context-modality">
              {activeModality === 'clinical' && 'क्लिनिकल तथा अन्तरङ्ग सेवा'}
              {activeModality === 'pharmacy_store' && 'फार्मेसी, स्टोर र आपूर्ति लजिस्टिक्स'}
              {activeModality === 'insurance' && 'स्वास्थ्य बीमा बोर्ड (HIB) कार्यक्रम'}
              {activeModality === 'public_health' && 'जनस्वास्थ्य तथा DHIS2 प्रतिवेदन'}
              {activeModality === 'settings' && 'अस्पताल मास्टर कन्फिगरेसन'}
            </span>
            <ChevronRight size={13} className="ehr-context-arrow" />
            <span className="ehr-context-title">
              {activeTab === 'opd' && 'ओपिडी दर्ता नामावली, टिकट प्रिन्ट र कन्सल्टेशन'}
              {activeTab === 'ipd' && '१५-शय्या अन्तरङ्ग भर्ना, राउन्ड नोट्स र डिस्चार्ज सारांश'}
              {activeTab === 'lab' && 'प्रयोगशाला जाँच अर्डर, बारकोड र नतिजा रेकर्ड'}
              {activeTab === 'pos' && 'फार्मेसी काउन्टर बिक्री बिल (POS Billing) र रसिद'}
              {activeTab === 'purchase' && 'खरिद दाखिला प्रतिवेदन (GRN म.ले.प. फाराम नं. ४०३)'}
              {activeTab === 'medicines' && 'औषधि मौज्दात सूची, म्याद (FEFO) र ब्याच नियन्त्रण'}
              {activeTab === 'insurance' && 'राष्ट्रिय स्वास्थ्य बीमा बोर्ड (HIB) दाबी व्यवस्थापन'}
              {activeTab === 'transfers' && 'औषधि मौज्दात ट्रान्सफर, अन्तर-शाखा स्थानान्तरण तथा म्याद मिन्हा'}
              {activeTab === 'facilities' && 'गाउँपालिका अन्तर्गतका स्वास्थ्य संस्थाहरूको आधिकारिक लगत'}
              {activeTab === 'dhis2' && 'DHIS2 / HMIS मासिक एकीकृत स्वास्थ्य प्रतिवेदन'}
              {activeTab === 'ambulances' && '२४/७ आपतकालीन एम्बुलेन्स सेवा र चालक सम्पर्क'}
              {activeTab === 'blood' && 'रक्त सञ्चार केन्द्र र आकस्मिक दाता समन्वय'}
              {activeTab === 'immunization' && 'राष्ट्रिय बाल खोप क्यालेन्डर र केन्द्र तालिका'}
              {activeTab === 'settings' && 'अस्पताल मास्टर सेटिङ्स (चिकित्सक, ल्याब, औषधि वर्ग र एकाइ)'}
            </span>
          </div>

          <div className="ehr-context-badge">
            {activeTab === 'opd' && `दर्ता रेकर्ड: ${safePatients.length} जना`}
            {activeTab === 'ipd' && `भर्ना बिरामी: ${safeIpdAdmissions.filter((a: any) => a.status === 'admitted').length} जना`}
            {activeTab === 'lab' && `ल्याब अर्डर: ${safeLabTests.length} वटा`}
            {activeTab === 'pos' && `बिक्री बिल: ${posSales.length} वटा`}
            {activeTab === 'purchase' && `GRN दाखिला: ${purchases.length} वटा`}
            {activeTab === 'medicines' && `औषधि प्रकार: ${safeMedicines.length} प्रकार`}
            {activeTab === 'insurance' && `बीमा दाबी: ${insuranceClaims.length} वटा`}
            {activeTab === 'transfers' && `औषधि स्थानान्तरण: ${safeStockTransfers.length} वटा`}
            {activeTab === 'facilities' && `स्वास्थ्य संस्था: ${facilities.length} वटा`}
            {activeTab === 'dhis2' && `DHIS2 प्रतिवेदन: ${safeDhis2Reports.length} वटा`}
            {activeTab === 'ambulances' && `एम्बुलेन्स: ${safeAmbulances.length} वटा`}
            {activeTab === 'blood' && `रक्त बैंक: समन्वय सक्रिय`}
            {activeTab === 'immunization' && `खोप तालिका: राष्ट्रिय क्यालेन्डर`}
            {activeTab === 'settings' && `मास्टर क्याटलग: सक्रिय`}
          </div>
        </div>
      </div>



{/* ── TAB: OPD PATIENT REGISTRATION & TICKETING ── */}
      {activeTab === 'opd' && (
        <div className="dt-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={20} color="#dc2626" />
                <span>पाँचपोखरी प्राथमिक अस्पताल: बहिरङ्ग बिरामी दर्ता तथा ओपिडी (OPD Register)</span>
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#475569', margin: '3px 0 0 0' }}>
                नेपाल सरकार स्वास्थ्य बीमा कार्यक्रम (NIB/HIB), दर्ता पुर्जी, प्रारम्भिक जाँच (Triage) र कन्सल्टेशन रेकर्ड
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <select
                className="dt-input"
                value={opdDepartmentFilter}
                onChange={(e) => setOpdDepartmentFilter(e.target.value)}
                style={{ width: 'auto', padding: '6px 12px', fontSize: '0.82rem' }}
              >
                <option value="all">सबै ओपिडी विभागहरू (All Departments)</option>
                {departmentsList.map((dept) => (
                  <option key={dept.id} value={dept.name}>
                    {dept.name}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => {
                  setHealthExcelInitialTab('opd');
                  setShowHealthExcelModal(true);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#16a34a',
                  color: '#ffffff',
                  padding: '7px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(22, 163, 74, 0.2)',
                }}
                title="Excel बाट बिरामीहरूको विवरण एकमुष्ट अपलोड गर्नुहोस्"
              >
                <FileSpreadsheet size={15} />
                <span>Excel बाट दर्ता</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPatientModalMode('new');
                  setShowPatientModal(true);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  padding: '7px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(220, 38, 38, 0.2)',
                }}
              >
                <Plus size={15} />
                <span>+ नयाँ बिरामी दर्ता</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPatientModalMode('existing');
                  setShowPatientModal(true);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#059669',
                  color: '#ffffff',
                  padding: '7px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(5, 150, 105, 0.2)',
                }}
              >
                <Repeat size={15} />
                <span>🔁 पुराना बिरामी पुर्जी (Re-visit)</span>
              </button>
            </div>
          </div>

          {isPatientsLoading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#475569' }}>बिरामी रेकर्ड लोड हुँदैछ...</div>
          ) : filteredPatients.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
              <Users size={36} color="#94a3b8" style={{ margin: '0 auto 8px auto' }} />
              <div style={{ fontWeight: 700, color: '#334155', fontSize: '0.95rem' }}>कुनै बिरामी रेकर्ड फेला परेन</div>
              <p style={{ fontSize: '0.82rem', color: '#475569', margin: '4px 0 12px 0' }}>
                नयाँ बिरामी दर्ता गर्न माथिको '+ नयाँ बिरामी दर्ता' बटन थिच्नुहोस् ।
              </p>
              <button
                type="button"
                onClick={() => setShowPatientModal(true)}
                style={{
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                }}
              >
                + नयाँ बिरामी दर्ता फारम खोल्नुहोस्
              </button>
            </div>
          ) : (
            <div style={{ flexWrap: 'wrap' }}>
              <div className="dt-responsive-table-wrapper">
<table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                    <th style={{ padding: '10px 12px', fontWeight: 700 }}>दर्ता नं (MRN)</th>
                    <th style={{ padding: '10px 12px', fontWeight: 700 }}>बिरामीको नाम</th>
                    <th style={{ padding: '10px 12px', fontWeight: 700 }}>उमेर / लिङ्ग</th>
                    <th style={{ padding: '10px 12px', fontWeight: 700 }}>सम्पर्क / वडा</th>
                    <th style={{ padding: '10px 12px', fontWeight: 700 }}>स्वास्थ्य बीमा स्थिति</th>
                    <th style={{ padding: '10px 12px', fontWeight: 700 }}>विभाग / चिकित्सक</th>
                    <th style={{ padding: '10px 12px', fontWeight: 700 }}>भाइटल (BP/Pulse/Temp/SpO2)</th>
                    <th style={{ padding: '10px 12px', fontWeight: 700 }}>शुल्क</th>
                    <th style={{ padding: '10px 12px', fontWeight: 700, textAlign: 'center' }}>कार्य</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map((p) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 800, color: '#dc2626', fontFamily: 'monospace' }}>
                        {p.patientNo}
                      </td>
                      <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0f172a' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          <span>{p.fullName}</span>
                          {p.bloodGroup && (
                            <span style={{ backgroundColor: '#fee2e2', color: '#b91c1c', fontSize: '0.68rem', padding: '1px 5px', borderRadius: '4px', fontWeight: 800 }}>
                              {p.bloodGroup}
                            </span>
                          )}
                          {p.triagePriority === 'emergency' && (
                            <span style={{ backgroundColor: '#fef2f2', color: '#dc2626', fontSize: '0.65rem', padding: '1px 5px', borderRadius: '4px', fontWeight: 800, border: '1px solid #fca5a5' }}>
                              EMERGENCY
                            </span>
                          )}
                        </div>
                        {p.knownAllergies && (
                          <div style={{ fontSize: '0.7rem', color: '#dc2626', fontWeight: 700, marginTop: '2px' }}>
                            ⚠️ एलर्जी: {p.knownAllergies}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '10px 12px', color: '#334155' }}>
                        {p.age} वर्ष / {p.gender === 'female' ? 'महिला' : p.gender === 'male' ? 'पुरुष' : 'अन्य'}
                      </td>
                      <td style={{ padding: '10px 12px', color: '#475569' }}>
                        <div>वडा नं. {p.wardNumber}</div>
                        {p.phone && <small style={{ color: '#475569' }}>{p.phone}</small>}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        {p.hasHealthInsurance ? (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: '6px', backgroundColor: '#dcfce7', color: '#166534', fontWeight: 700, fontSize: '0.74rem' }}>
                            <ShieldCheck size={13} />
                            <span>बीमित ({p.insuranceNumber || 'NIB'})</span>
                          </div>
                        ) : (
                          <span style={{ padding: '2px 8px', borderRadius: '6px', backgroundColor: '#f1f5f9', color: '#475569', fontSize: '0.74rem' }}>
                            गैर-बीमित
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ fontWeight: 600, color: '#0284c7' }}>{p.department}</div>
                        <small style={{ color: '#475569' }}>{p.attendingDoctor || 'डा. सुजन खनाल'}</small>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', fontSize: '0.72rem' }}>
                          <span style={{ padding: '1px 5px', backgroundColor: '#f1f5f9', borderRadius: '4px', fontWeight: 600 }}>
                            BP: {p.bloodPressure || '-'}
                          </span>
                          <span style={{ padding: '1px 5px', backgroundColor: '#f1f5f9', borderRadius: '4px' }}>
                            P: {p.pulseRate || '-'}
                          </span>
                          <span style={{ padding: '1px 5px', backgroundColor: '#f1f5f9', borderRadius: '4px' }}>
                            T: {p.temperatureF ? `${p.temperatureF}°F` : '-'}
                          </span>
                          <span style={{ padding: '1px 5px', backgroundColor: '#f1f5f9', borderRadius: '4px' }}>
                            SpO2: {p.spo2Percent ? `${p.spo2Percent}%` : '-'}
                          </span>
                          {p.bmi && (
                            <span style={{ padding: '1px 5px', backgroundColor: '#e0f2fe', color: '#0369a1', borderRadius: '4px', fontWeight: 700 }}>
                              BMI: {p.bmi}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '10px 12px', fontWeight: 700 }}>
                        {p.ticketFee === 0 ? (
                          <span style={{ color: '#16a34a' }}>निशुल्क</span>
                        ) : (
                          <span>रु. {p.ticketFee}</span>
                        )}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedRxPatient(p);
                              setShowPrescriptionModal(true);
                            }}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              backgroundColor: '#ecfdf5',
                              border: '1px solid #a7f3d0',
                              color: '#065f46',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              fontWeight: 700,
                              fontSize: '0.74rem',
                              cursor: 'pointer',
                            }}
                            title="चिकित्सक ई-प्रेस्क्रिप्सन लेख्नुहोस्"
                          >
                            <Pill size={13} color="#059669" />
                            <span>Rx औषधि</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedEhrPatientNo(p.patientNo);
                              setShowEhrModal(true);
                            }}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              backgroundColor: '#eff6ff',
                              border: '1px solid #bfdbfe',
                              color: '#1d4ed8',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              fontWeight: 700,
                              fontSize: '0.74rem',
                              cursor: 'pointer',
                            }}
                            title="बिरामीको पूर्ण EHR एकीकृत इतिहास हेर्नुहोस्"
                          >
                            <Activity size={13} color="#2563eb" />
                            <span>EHR</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedTicketPatient(p)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              backgroundColor: '#f8fafc',
                              border: '1.5px solid #cbd5e1',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                              outline: 'none',
                              color: '#0f172a',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              fontWeight: 600,
                              fontSize: '0.74rem',
                              cursor: 'pointer',
                            }}
                            title="ओपिडी पुर्जी प्रिन्ट गर्नुहोस्"
                          >
                            <Printer size={13} color="#dc2626" />
                            <span>पुर्जी</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedStickerPatient(p);
                              setSelectedStickerLabTest(null);
                              setShowPatientStickerModal(true);
                            }}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              backgroundColor: '#f0f9ff',
                              border: '1.5px solid #7dd3fc',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                              outline: 'none',
                              color: '#0369a1',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              fontWeight: 700,
                              fontSize: '0.74rem',
                              cursor: 'pointer',
                            }}
                            title="थर्मल स्टिकर (50x30mm) प्रिन्ट गर्नुहोस्"
                          >
                            <Tag size={13} color="#0284c7" />
                            <span>🏷️ स्टिकर</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
</div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB: IPD 15-BED INPATIENT WARD MANAGEMENT ── */}
      {activeTab === 'ipd' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Bed Statistics Overview */}
          {(() => {
            const admittedList = safeIpdAdmissions.filter((a) => a.status === 'admitted');
            const occupiedCount = admittedList.length;
            const vacantCount = Math.max(0, 15 - occupiedCount);
            const occupancyRate = Math.round((occupiedCount / 15) * 100);

            return (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div className="dt-card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ padding: '0.75rem', borderRadius: '10px', backgroundColor: '#e0f2fe', color: '#0284c7' }}>
                    <Building2 size={24} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 600 }}>कुल अस्पताल शैय्या</div>
                    <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>१५ शैय्या</div>
                  </div>
                </div>

                <div className="dt-card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ padding: '0.75rem', borderRadius: '10px', backgroundColor: '#fee2e2', color: '#dc2626' }}>
                    <HeartPulse size={24} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 600 }}>उपचाररत बिरामी (भर्ना)</div>
                    <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#dc2626' }}>
                      {occupiedCount} जना
                    </div>
                  </div>
                </div>

                <div className="dt-card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ padding: '0.75rem', borderRadius: '10px', backgroundColor: '#dcfce7', color: '#16a34a' }}>
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 600 }}>खाली शैय्या (Available)</div>
                    <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#16a34a' }}>
                      {vacantCount} शैय्या
                    </div>
                  </div>
                </div>

                <div className="dt-card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ padding: '0.75rem', borderRadius: '10px', backgroundColor: '#fef3c7', color: '#d97706' }}>
                    <Activity size={24} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 600 }}>शैय्या उपयोग दर (Occupancy)</div>
                    <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#d97706' }}>
                      {occupancyRate}%
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* 15-Bed Visual Matrix by Wards */}
          <div className="dt-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  १५-शय्या प्रत्यक्ष वार्ड नक्सा (Visual 15-Bed Matrix)
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#475569', margin: '2px 0 0 0' }}>
                  पाँचपोखरी प्राथमिक अस्पताल: पुरुष वार्ड, महिला वार्ड, प्रसूति तथा आकस्मिक अब्जर्भेसन
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedIpdBed('Bed-01');
                  setShowIpdModal(true);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  padding: '7px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                }}
              >
                <Plus size={15} />
                <span>+ नयाँ शैय्या भर्ना</span>
              </button>
            </div>

            {/* Ward Groups */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {[
                { title: 'पुरुष अन्तरङ्ग वार्ड (Male Ward)', beds: ['Bed-01', 'Bed-02', 'Bed-03', 'Bed-04'], color: '#0284c7', bg: '#f0f9ff' },
                { title: 'महिला अन्तरङ्ग वार्ड (Female Ward)', beds: ['Bed-05', 'Bed-06', 'Bed-07', 'Bed-08'], color: '#db2777', bg: '#fdf2f8' },
                { title: 'प्रसूति तथा सुत्केरी वार्ड (Maternity & Postpartum)', beds: ['Bed-09', 'Bed-10', 'Bed-11', 'Bed-12'], color: '#7c3aed', bg: '#f5f3ff' },
                { title: 'आकस्मिक अब्जर्भेसन वार्ड (Emergency Observation)', beds: ['Bed-13', 'Bed-14', 'Bed-15'], color: '#dc2626', bg: '#fef2f2' },
              ].map((ward) => (
                <div key={ward.title} style={{ border: '1.5px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                  <div style={{ backgroundColor: ward.bg, padding: '8px 16px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.86rem', color: ward.color }}>{ward.title}</span>
                    <span style={{ fontSize: '0.74rem', color: '#475569' }}>४ शैय्या क्षमता</span>
                  </div>

                  <div style={{ padding: '12px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                    {ward.beds.map((bId) => {
                      const activeAdmission = safeIpdAdmissions.find(
                        (a) => a.bedNumber === bId && a.status === 'admitted'
                      );

                      return (
                        <div
                          key={bId}
                          style={{
                            border: `1.5px solid ${activeAdmission ? '#fca5a5' : '#86efac'}`,
                            borderRadius: '10px',
                            backgroundColor: activeAdmission ? '#fff1f2' : '#f0fdf4',
                            padding: '12px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            minHeight: '140px',
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                              <strong style={{ fontSize: '0.92rem', color: '#0f172a' }}>{bId}</strong>
                              <span
                                style={{
                                  fontSize: '0.7rem',
                                  fontWeight: 800,
                                  padding: '2px 8px',
                                  borderRadius: '20px',
                                  backgroundColor: activeAdmission ? '#dc2626' : '#16a34a',
                                  color: '#ffffff',
                                }}
                              >
                                {activeAdmission ? 'बिरामी भर्ना (Occupied)' : 'खाली (Available)'}
                              </span>
                            </div>

                            {activeAdmission ? (
                              <div style={{ fontSize: '0.78rem', color: '#334155' }}>
                                <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.86rem' }}>
                                  {activeAdmission.patientName} ({activeAdmission.age} वर्ष)
                                </div>
                                <div style={{ color: '#dc2626', fontWeight: 600, marginTop: '2px' }}>
                                  {activeAdmission.diagnosis}
                                </div>
                                <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: '2px' }}>
                                  भर्ना: {activeAdmission.admissionDate} | {activeAdmission.admittingDoctor}
                                </div>
                              </div>
                            ) : (
                              <div style={{ fontSize: '0.75rem', color: '#15803d', marginTop: '8px' }}>
                                शैय्या तयार र सफा गरिएको छ । नयाँ बिरामी भर्ना लिन सकिने ।
                              </div>
                            )}
                          </div>

                          <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px dashed rgba(0,0,0,0.1)' }}>
                            {activeAdmission ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedDischargeAdmission(activeAdmission);
                                  setShowDischargeSummaryModal(true);
                                }}
                                style={{
                                  width: '100%',
                                  padding: '5px 8px',
                                  borderRadius: '6px',
                                  border: 'none',
                                  backgroundColor: '#dc2626',
                                  color: '#ffffff',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                }}
                              >
                                ✓ डिस्चार्ज स्लिप जारी गर्नुहोस्
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedIpdBed(bId);
                                  setShowIpdModal(true);
                                }}
                                style={{
                                  width: '100%',
                                  padding: '5px 8px',
                                  borderRadius: '6px',
                                  border: '1px solid #16a34a',
                                  backgroundColor: '#ffffff',
                                  color: '#16a34a',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                }}
                              >
                                + यहाँ भर्ना गर्नुहोस्
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Admission Records Table */}
          <div className="dt-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '8px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                अन्तरङ्ग (IPD) भर्ना तथा डिस्चार्ज अभिलेख
              </h3>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => setIpdStatusFilter('all')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    backgroundColor: ipdStatusFilter === 'all' ? '#0f172a' : '#ffffff',
                    color: ipdStatusFilter === 'all' ? '#ffffff' : '#475569',
                    cursor: 'pointer',
                  }}
                >
                  सबै ({safeIpdAdmissions.length})
                </button>
                <button
                  type="button"
                  onClick={() => setIpdStatusFilter('admitted')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    backgroundColor: ipdStatusFilter === 'admitted' ? '#dc2626' : '#ffffff',
                    color: ipdStatusFilter === 'admitted' ? '#ffffff' : '#475569',
                    cursor: 'pointer',
                  }}
                >
                  उपचाररत ({safeIpdAdmissions.filter((a) => a.status === 'admitted').length})
                </button>
                <button
                  type="button"
                  onClick={() => setIpdStatusFilter('discharged')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    backgroundColor: ipdStatusFilter === 'discharged' ? '#16a34a' : '#ffffff',
                    color: ipdStatusFilter === 'discharged' ? '#ffffff' : '#475569',
                    cursor: 'pointer',
                  }}
                >
                  डिस्चार्ज भएका ({safeIpdAdmissions.filter((a) => a.status === 'discharged').length})
                </button>
              </div>
            </div>

            <div style={{ flexWrap: 'wrap' }}>
              <div className="dt-responsive-table-wrapper">
<table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                    <th style={{ padding: '10px 12px', fontWeight: 700 }}>भर्ना नं</th>
                    <th style={{ padding: '10px 12px', fontWeight: 700 }}>बिरामीको नाम</th>
                    <th style={{ padding: '10px 12px', fontWeight: 700 }}>शैय्या तथा वार्ड</th>
                    <th style={{ padding: '10px 12px', fontWeight: 700 }}>रोग निदान (Diagnosis)</th>
                    <th style={{ padding: '10px 12px', fontWeight: 700 }}>चिकित्सक</th>
                    <th style={{ padding: '10px 12px', fontWeight: 700 }}>भर्ना मिति</th>
                    <th style={{ padding: '10px 12px', fontWeight: 700 }}>डिस्चार्ज मिति</th>
                    <th style={{ padding: '10px 12px', fontWeight: 700 }}>स्थिति</th>
                    <th style={{ padding: '10px 12px', fontWeight: 700, textAlign: 'center' }}>कार्य (Action)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIpdAdmissions.map((a) => (
                    <tr key={a.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 800, color: '#0284c7', fontFamily: 'monospace' }}>
                        {a.admissionNo}
                      </td>
                      <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0f172a' }}>
                        {a.patientName} ({a.age} वर्ष)
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ fontWeight: 700, color: '#0f172a' }}>{a.bedNumber}</span>
                        <div style={{ fontSize: '0.72rem', color: '#475569' }}>{a.departmentWard}</div>
                      </td>
                      <td style={{ padding: '10px 12px', color: '#dc2626', fontWeight: 600 }}>
                        {a.diagnosis}
                      </td>
                      <td style={{ padding: '10px 12px', color: '#334155' }}>
                        {a.admittingDoctor}
                      </td>
                      <td style={{ padding: '10px 12px', color: '#475569' }}>
                        {a.admissionDate}
                      </td>
                      <td style={{ padding: '10px 12px', color: '#475569' }}>
                        {a.dischargeDate || '-'}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '0.74rem',
                            fontWeight: 800,
                            backgroundColor: a.status === 'admitted' ? '#fee2e2' : '#dcfce7',
                            color: a.status === 'admitted' ? '#b91c1c' : '#166534',
                          }}
                        >
                          {a.status === 'admitted' ? 'उपचाररत' : 'डिस्चार्ज'}
                        </span>
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDischargeAdmission(a);
                            setShowDischargeSummaryModal(true);
                          }}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            backgroundColor: a.status === 'admitted' ? '#eff6ff' : '#f0fdf4',
                            border: `1px solid ${a.status === 'admitted' ? '#bfdbfe' : '#bbf7d0'}`,
                            color: a.status === 'admitted' ? '#1d4ed8' : '#15803d',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontWeight: 700,
                            fontSize: '0.74rem',
                            cursor: 'pointer',
                          }}
                          title={a.status === 'admitted' ? 'क्लिनिकल डिस्चार्ज सारांश बनाउनुहोस्' : 'डिस्चार्ज स्लिप हेर्नुहोस् र प्रिन्ट गर्नुहोस्'}
                        >
                          <FileText size={13} />
                          <span>{a.status === 'admitted' ? 'डिस्चार्ज गर्नुहोस्' : 'डिस्चार्ज स्लिप'}</span>
                        </button>
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

      {/* ── TAB: HOSPITAL LABORATORY SERVICES ── */}
      {activeTab === 'lab' && (
        <div className="dt-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={20} color="#059669" />
                <span>पाँचपोखरी प्राथमिक अस्पताल: रोग निदान प्रयोगशाला (Pathology Lab)</span>
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#475569', margin: '3px 0 0 0' }}>
                हेमाटोलोजी (CBC), बायोकेमिस्ट्री (RBS/LFT/RFT), सेरोलोजी (Widal/Dengue) तथा पिसाब/खकार जाँच
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <select
                className="dt-input"
                value={labStatusFilter}
                onChange={(e) => setLabStatusFilter(e.target.value)}
                style={{ width: 'auto', padding: '6px 12px', fontSize: '0.82rem' }}
              >
                <option value="all">सबै स्थिति (All Status)</option>
                <option value="pending">नतिजा विचाराधीन (Pending)</option>
                <option value="completed">नतिजा सम्पन्न (Completed)</option>
              </select>

              <button
                type="button"
                onClick={() => setShowLabOrderModal(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#059669',
                  color: '#ffffff',
                  padding: '7px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(5, 150, 105, 0.2)',
                }}
              >
                <Plus size={15} />
                <span>+ नयाँ ल्याब अर्डर</span>
              </button>
            </div>
          </div>

          {isLabLoading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#475569' }}>ल्याब परीक्षण रेकर्ड लोड हुँदैछ...</div>
          ) : filteredLabTests.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
              <Activity size={36} color="#94a3b8" style={{ margin: '0 auto 8px auto' }} />
              <div style={{ fontWeight: 700, color: '#334155', fontSize: '0.95rem' }}>कुनै ल्याब परीक्षण अर्डर फेला परेन</div>
              <p style={{ fontSize: '0.82rem', color: '#475569', margin: '4px 0 12px 0' }}>
                नयाँ ल्याब परीक्षण अर्डर गर्न '+ नयाँ ल्याब अर्डर' बटन थिच्नुहोस् ।
              </p>
              <button
                type="button"
                onClick={() => setShowLabOrderModal(true)}
                style={{
                  backgroundColor: '#059669',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                }}
              >
                + नयाँ ल्याब परीक्षण अर्डर गर्नुहोस्
              </button>
            </div>
          ) : (
            <div style={{ flexWrap: 'wrap' }}>
              <div className="dt-responsive-table-wrapper">
<table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                    <th style={{ padding: '10px 12px', fontWeight: 700 }}>अर्डर नं</th>
                    <th style={{ padding: '10px 12px', fontWeight: 700 }}>बिरामीको नाम</th>
                    <th style={{ padding: '10px 12px', fontWeight: 700 }}>परीक्षणको नाम (Test)</th>
                    <th style={{ padding: '10px 12px', fontWeight: 700 }}>वर्ग तथा नमुना</th>
                    <th style={{ padding: '10px 12px', fontWeight: 700 }}>सिफारिस चिकित्सक</th>
                    <th style={{ padding: '10px 12px', fontWeight: 700 }}>शुल्क / बीमा</th>
                    <th style={{ padding: '10px 12px', fontWeight: 700 }}>नतिजा (Findings)</th>
                    <th style={{ padding: '10px 12px', fontWeight: 700 }}>स्थिति</th>
                    <th style={{ padding: '10px 12px', fontWeight: 700, textAlign: 'center' }}>कार्य</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLabTests.map((l) => (
                    <tr key={l.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 800, color: '#059669', fontFamily: 'monospace' }}>
                        {l.testOrderNo}
                      </td>
                      <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0f172a' }}>
                        {l.patientName}
                        <div style={{ fontSize: '0.72rem', color: '#475569' }}>{l.age} वर्ष / {l.gender}</div>
                      </td>
                      <td style={{ padding: '10px 12px', fontWeight: 700, color: '#1e293b' }}>
                        {l.testName}
                      </td>
                      <td style={{ padding: '10px 12px', color: '#475569' }}>
                        <div>{l.testCategory}</div>
                        <small style={{ color: '#475569' }}>{l.sampleType}</small>
                      </td>
                      <td style={{ padding: '10px 12px', color: '#334155' }}>
                        {l.orderedBy || 'डा. सुजन खनाल'}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        {l.isCoveredByInsurance ? (
                          <span style={{ color: '#16a34a', fontWeight: 700 }}>निशुल्क (बीमा)</span>
                        ) : (
                          <span style={{ fontWeight: 600 }}>रु. {l.fee}</span>
                        )}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        {l.results?.findings ? (
                          <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#0f172a', fontWeight: 600 }}>
                            {l.results.findings}
                          </div>
                        ) : (
                          <span style={{ color: '#64748b', fontStyle: 'italic' }}>प्रविष्टि हुन बाँकी</span>
                        )}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            backgroundColor: l.status === 'completed' ? '#dcfce7' : '#fef3c7',
                            color: l.status === 'completed' ? '#166534' : '#b45309',
                          }}
                        >
                          {l.status === 'completed' ? 'सम्पन्न' : 'विचाराधीन'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', alignItems: 'center' }}>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedStickerLabTest(l);
                              setSelectedStickerPatient(null);
                              setShowPatientStickerModal(true);
                            }}
                            title="ल्याब टेस्ट ट्युब बारकोड स्टिकर (३०x२० मिमी) र २D QR कोड प्रिन्ट"
                            style={{
                              padding: '4px 8px',
                              borderRadius: '6px',
                              border: '1.5px solid #c4b5fd',
                              boxShadow: '0 1px 3px rgba(124, 58, 237, 0.1)',
                              outline: 'none',
                              backgroundColor: '#f5f3ff',
                              color: '#7c3aed',
                              fontWeight: 700,
                              fontSize: '0.73rem',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <TestTube size={13} />
                            <span>ट्युब स्टिकर</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedLabForResults(l)}
                            style={{
                              padding: '4px 10px',
                              borderRadius: '6px',
                              border: '1px solid #cbd5e1',
                              backgroundColor: '#ffffff',
                              color: '#059669',
                              fontWeight: 700,
                              fontSize: '0.75rem',
                              cursor: 'pointer',
                            }}
                          >
                            {l.status === 'completed' ? 'नतिजा हेर्नुहोस्' : 'नतिजा प्रविष्टि'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
</div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 1: HEALTH FACILITIES LIST (आधिकारिक स्वास्थ्य संस्था विवरण) ── */}
      {activeTab === 'facilities' && (
        <div className="dt-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HeartPulse size={20} color="#dc2626" />
                <span>पाँचपोखरी थाङपाल गाउँपालिका — स्वास्थ्य संस्थाहरूको आधिकारिक विवरण</span>
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#475569', margin: '3px 0 0 0' }}>
                गाउँपालिका अन्तर्गतका स्वास्थ्य चौकी तथा सामुदायिक स्वास्थ्य ईकाइहरूको विवरण र सम्पर्क
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => window.open('/gis-map?filter=health', '_blank')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(15, 23, 42, 0.25)',
                }}
              >
                <span>🗺️ GIS नक्सामा स्वास्थ्य संस्थाहरू</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setHealthExcelInitialTab('facilities');
                  setShowHealthExcelModal(true);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#16a34a',
                  color: '#ffffff',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(22, 163, 74, 0.25)',
                }}
              >
                <FileSpreadsheet size={15} />
                <span>Excel अपलोड</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setFacilityToEdit(null);
                  setShowFacilityModal(true);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(220, 38, 38, 0.25)',
                }}
              >
                <Plus size={15} />
                <span>+ नयाँ स्वास्थ्य संस्था थप्नुहोस्</span>
              </button>
            </div>
          </div>

          {isFacilitiesLoading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#475569' }}>तथ्याङ्क लोड हुँदैछ...</div>
          ) : filteredFacilities.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#475569' }}>कुनै स्वास्थ्य संस्था फेला परेन।</div>
          ) : (
            <div style={{ flexWrap: 'wrap', border: '1.5px solid #cbd5e1', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', outline: 'none', color: '#0f172a', borderRadius: '10px' }}>
              <div className="dt-responsive-table-wrapper">
<table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #cbd5e1', color: '#1e293b' }}>
                    <th style={{ padding: '10px 10px', fontWeight: 800, textAlign: 'center', width: '45px', borderRight: '1px solid #e2e8f0' }}>सि.</th>
                    <th style={{ padding: '10px 12px', fontWeight: 800, width: '160px', borderRight: '1px solid #e2e8f0' }}>ठेगाना</th>
                    <th style={{ padding: '10px 10px', fontWeight: 800, textAlign: 'center', width: '50px', borderRight: '1px solid #e2e8f0' }}>वडा</th>
                    <th style={{ padding: '10px 12px', fontWeight: 800, width: '110px', borderRight: '1px solid #e2e8f0' }}>स्थान</th>
                    <th style={{ padding: '10px 12px', fontWeight: 800, minWidth: '190px', borderRight: '1px solid #e2e8f0' }}>संस्थाको नाम</th>
                    <th style={{ padding: '10px 12px', fontWeight: 800, width: '150px', borderRight: '1px solid #e2e8f0' }}>प्रकार</th>
                    <th style={{ padding: '10px 10px', fontWeight: 800, textAlign: 'center', width: '60px', borderRight: '1px solid #e2e8f0' }}>दर्जा</th>
                    <th style={{ padding: '10px 12px', fontWeight: 800, width: '140px', borderRight: '1px solid #e2e8f0' }}>प्रमुखको नामथर</th>
                    <th style={{ padding: '10px 12px', fontWeight: 800, width: '120px', borderRight: '1px solid #e2e8f0' }}>मोबाइल नं.</th>
                    <th style={{ padding: '10px 10px', fontWeight: 800, textAlign: 'center', width: '90px' }}>कार्य</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFacilities.map((f, index) => {
                    const snNepali = f.orderNo ? toNepaliNumber(f.orderNo) : toNepaliNumber(index + 1);
                    return (
                      <tr
                        key={f.id}
                        style={{
                          borderBottom: '1px solid #e2e8f0',
                          backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc',
                          transition: 'background-color 0.15s ease',
                        }}
                      >
                        <td style={{ padding: '10px 10px', textAlign: 'center', fontWeight: 700, color: '#334155', borderRight: '1px solid #e2e8f0' }}>
                          {snNepali}
                        </td>
                        <td style={{ padding: '10px 12px', color: '#1e293b', fontWeight: 600, borderRight: '1px solid #e2e8f0' }}>
                          {f.address || 'पाँचपोखरी थाङपाल गा.पा.'}
                        </td>
                        <td style={{ padding: '10px 10px', textAlign: 'center', fontWeight: 700, color: '#0f172a', borderRight: '1px solid #e2e8f0' }}>
                          <span style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '2px 8px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 800 }}>
                            {toNepaliNumber(f.wardNumber)}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px', color: '#334155', fontWeight: 600, borderRight: '1px solid #e2e8f0' }}>
                          <div>{f.location || '-'}</div>
                          {f.latitude && f.longitude ? (
                            <a
                              href={`https://maps.google.com/?q=${f.latitude},${f.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Google Maps मा स्थान हेर्नुहोस्"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                                backgroundColor: '#ecfdf5',
                                color: '#059669',
                                padding: '1px 6px',
                                borderRadius: '4px',
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                textDecoration: 'none',
                                border: '1px solid #a7f3d0',
                                marginTop: '3px',
                              }}
                            >
                              <MapPin size={10} color="#059669" />
                              <span>{Number(f.latitude).toFixed(4)}, {Number(f.longitude).toFixed(4)}</span>
                            </a>
                          ) : (
                            <span
                              style={{
                                display: 'inline-block',
                                backgroundColor: '#fef2f2',
                                color: '#dc2626',
                                padding: '1px 5px',
                                borderRadius: '4px',
                                fontSize: '0.66rem',
                                fontWeight: 600,
                                border: '1px solid #fecaca',
                                marginTop: '3px',
                              }}
                            >
                              GPS खाली
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0f172a', borderRight: '1px solid #e2e8f0' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <HeartPulse size={15} color="#dc2626" />
                            <span>{f.nameNepali || f.name}</span>
                          </div>
                          {f.nameEn && <small style={{ color: '#475569', fontSize: '0.72rem', display: 'block', marginLeft: '21px' }}>{f.nameEn}</small>}
                        </td>
                        <td style={{ padding: '10px 12px', borderRight: '1px solid #e2e8f0' }}>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '3px 9px',
                              borderRadius: '6px',
                              fontSize: '0.76rem',
                              fontWeight: 700,
                              backgroundColor: f.categoryNepali?.includes('सामुदायिक') ? '#fef3c7' : f.type === 'hospital' ? '#fee2e2' : '#eff6ff',
                              color: f.categoryNepali?.includes('सामुदायिक') ? '#92400e' : f.type === 'hospital' ? '#dc2626' : '#1d4ed8',
                              border: `1px solid ${f.categoryNepali?.includes('सामुदायिक') ? '#fde68a' : f.type === 'hospital' ? '#fecaca' : '#bfdbfe'}`,
                            }}
                          >
                            {f.categoryNepali || (f.type === 'hospital' ? 'आधारभूत अस्पताल' : 'स्वास्थ्य चौकी')}
                          </span>
                        </td>
                        <td style={{ padding: '10px 10px', textAlign: 'center', color: '#475569', borderRight: '1px solid #e2e8f0' }}>
                          {f.designation || '-'}
                        </td>
                        <td style={{ padding: '10px 12px', fontWeight: 700, color: '#1e293b', borderRight: '1px solid #e2e8f0' }}>
                          {f.chiefName || f.inChargeName || '-'}
                        </td>
                        <td style={{ padding: '10px 12px', borderRight: '1px solid #e2e8f0' }}>
                          {f.phone || f.contactNumber ? (
                            <a
                              href={`tel:${f.phone || f.contactNumber}`}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                color: '#0369a1',
                                textDecoration: 'none',
                                fontWeight: 700,
                                fontFamily: 'monospace',
                                fontSize: '0.85rem',
                              }}
                            >
                              <Phone size={13} color="#0284c7" />
                              <span>{f.phone || f.contactNumber}</span>
                            </a>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                            <button
                              type="button"
                              onClick={() => window.open(`/facilities/${f.id}`, '_blank')}
                              title="विस्तृत प्रोफाइल र नक्सा हेर्नुहोस्"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '5px 10px',
                                borderRadius: '6px',
                                border: '1px solid #c7d2fe',
                                backgroundColor: '#e0e7ff',
                                color: '#4338ca',
                                cursor: 'pointer',
                                fontSize: '0.74rem',
                                fontWeight: 700,
                                transition: 'all 0.15s ease',
                              }}
                            >
                              <span>🌐 विस्तृत प्रोफाइल / नक्सा</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setFacilityToEdit(f);
                                setShowFacilityModal(true);
                              }}
                              title="सम्पादन गर्नुहोस् र GPS कोर्डिनेट अद्यावधिक गर्नुहोस्"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '5px 10px',
                                borderRadius: '6px',
                                border: '1px solid #bae6fd',
                                backgroundColor: '#f0f9ff',
                                color: '#0284c7',
                                cursor: 'pointer',
                                fontSize: '0.74rem',
                                fontWeight: 700,
                                transition: 'all 0.15s ease',
                              }}
                            >
                              <Edit3 size={13} color="#0284c7" />
                              <span>सम्पादन</span>
                            </button>
                          </div>
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

      {/* ── TAB 2: DHIS2 / HMIS MONTHLY REPORTING ── */}
      {activeTab === 'dhis2' && (
        <div className="dt-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileCheck2 size={20} color="#dc2626" />
                <span>नेपाल सरकार DHIS2 / HMIS मासिक स्वास्थ्य प्रतिवेदन</span>
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#475569', margin: '3px 0 0 0' }}>
                स्वास्थ्य तथा जनसंख्या मन्त्रालय (MoHP) मानक अनुसार OPD, खोप, मातृ-शिशु र महामारी रोग प्रतिवेदन
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => {
                  setHealthExcelInitialTab('dhis2');
                  setShowHealthExcelModal(true);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#16a34a',
                  color: '#ffffff',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(22, 163, 74, 0.25)',
                  transition: 'all 0.15s ease',
                }}
                title="DHIS2 / HMIS मासिक स्वास्थ्य प्रतिवेदन Excel फाइलबाट एकमुष्ट अपलोड गर्नुहोस्"
              >
                <FileSpreadsheet size={16} />
                <span>Excel फाइल अपलोड</span>
              </button>

              <button
                type="button"
                onClick={() => setShowDhis2Modal(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                }}
              >
                <Plus size={16} />
                <span>+ नयाँ मासिक प्रतिवेदन भर्नुहोस्</span>
              </button>
            </div>
          </div>

          {/* DHIS2 Aggregate KPI Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '12px',
            marginBottom: '1.25rem',
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
              padding: '14px 16px',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            }}>
              <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600 }}>कुल मासिक प्रतिवेदनहरू (Total)</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                {dhis2TotalCount} <span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#64748b' }}>वटा</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#059669', marginTop: '4px' }}>
                ✓ {dhis2SyncedCount} सिङ्क | ⏳ {dhis2PendingCount} पेन्डिङ
              </div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #ecfdf5 0%, #ffffff 100%)',
              padding: '14px 16px',
              borderRadius: '10px',
              border: '1px solid #a7f3d0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            }}>
              <div style={{ fontSize: '0.76rem', color: '#065f46', fontWeight: 600 }}>DHIS2 सिङ्क स्थिति (Sync Rate)</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#059669', marginTop: '4px' }}>
                {dhis2TotalCount > 0 ? Math.round((dhis2SyncedCount / dhis2TotalCount) * 100) : 0}%
              </div>
              <div style={{ fontSize: '0.72rem', color: '#047857', marginTop: '4px' }}>
                MoHP केन्द्रीय सर्भरमा अद्यावधिक
              </div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)',
              padding: '14px 16px',
              borderRadius: '10px',
              border: '1px solid #bfdbfe',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            }}>
              <div style={{ fontSize: '0.76rem', color: '#1e40af', fontWeight: 600 }}>कुल OPD बिरामी (Aggregated OPD)</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#2563eb', marginTop: '4px' }}>
                {dhis2TotalOpdSum.toLocaleString()} <span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#64748b' }}>जना</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#1d4ed8', marginTop: '4px' }}>
                प्रतिवेदन गरिएका सबै संस्थाबाट
              </div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #fdf4ff 0%, #ffffff 100%)',
              padding: '14px 16px',
              borderRadius: '10px',
              border: '1px solid #f5d0fe',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            }}>
              <div style={{ fontSize: '0.76rem', color: '#86198f', fontWeight: 600 }}>मातृ तथा बाल स्वास्थ्य (MCH & Imm.)</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#9333ea', marginTop: '4px' }}>
                {dhis2TotalDeliveriesSum} <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>सुत्केरी</span> / {dhis2TotalImmunizedSum} <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>पूर्ण खोप</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#7e22ce', marginTop: '4px' }}>
                संस्थागत सुत्केरी र पूर्ण खोप बालबालिका
              </div>
            </div>
          </div>

          {/* DHIS2 Filter Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
            backgroundColor: '#f8fafc',
            padding: '10px 14px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            marginBottom: '1rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>प्रतिवेदन फिल्टर:</span>
              <select
                className="dt-input"
                value={dhis2MonthFilter}
                onChange={(e) => setDhis2MonthFilter(e.target.value)}
                style={{ width: 'auto', padding: '5px 10px', fontSize: '0.8rem' }}
              >
                <option value="all">सबै महिना (All Months)</option>
                <option value="बैशाख">बैशाख (Baishakh)</option>
                <option value="जेठ">जेठ (Jestha)</option>
                <option value="असार">असार (Ashadh)</option>
                <option value="श्रावण">श्रावण (Shrawan)</option>
                <option value="भदौ">भदौ (Bhadra)</option>
                <option value="असोज">असोज (Ashwin)</option>
                <option value="कार्तिक">कार्तिक (Kartik)</option>
                <option value="मंसिर">मंसिर (Mangsir)</option>
                <option value="पौष">पौष (Poush)</option>
                <option value="माघ">माघ (Magh)</option>
                <option value="फाल्गुन">फाल्गुन (Falgun)</option>
                <option value="चैत्र">चैत्र (Chaitra)</option>
              </select>

              <select
                className="dt-input"
                value={dhis2SyncFilter}
                onChange={(e) => setDhis2SyncFilter(e.target.value)}
                style={{ width: 'auto', padding: '5px 10px', fontSize: '0.8rem' }}
              >
                <option value="all">सबै सिङ्क स्थिति (All Status)</option>
                <option value="synced">सिङ्क भएको (Synced)</option>
                <option value="pending">पेन्डिङ (Pending)</option>
              </select>
            </div>

            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
              जम्मा <strong>{filteredDhis2Reports.length}</strong> प्रतिवेदनहरू फेला परे
            </div>
          </div>

          <div style={{ flexWrap: 'wrap' }}>
            <div className="dt-responsive-table-wrapper">
<table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                  <th style={{ padding: '10px 12px', fontWeight: 700 }}>संस्था / वडा</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700 }}>आर्थिक वर्ष / महिना</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700 }}>OPD बिरामी</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700 }}>संस्थागत सुत्केरी</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700 }}>पूर्ण खोप बालबालिका</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700 }}>प्रमुख रोग प्रकोप</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700 }}>DHIS2 सिङ्क स्थिति</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700, textAlign: 'center' }}>कार्य</th>
                </tr>
              </thead>
              <tbody>
                {filteredDhis2Reports.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                      कुनै DHIS2 प्रतिवेदन फेला परेन।
                    </td>
                  </tr>
                ) : (
                  filteredDhis2Reports.map((r) => {
                    const isSynced = r.syncStatus === 'synced';

                    return (
                      <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '10px 12px' }}>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{r.healthFacilityName}</div>
                          <small style={{ color: '#475569' }}>वडा नं. {r.wardNumber} | कोड: {r.dhis2OrgUnitId || '-'}</small>
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <div style={{ fontWeight: 700, color: '#1e40af' }}>{r.monthNepali}</div>
                          <small style={{ color: '#475569' }}>आ.व. {r.fiscalYear}</small>
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <strong style={{ color: '#0f172a' }}>{r.totalOpdVisits}</strong> जना
                          <div style={{ fontSize: '0.72rem', color: '#475569' }}>
                            (पु: {r.maleOpdVisits} / म: {r.femaleOpdVisits})
                          </div>
                        </td>
                        <td style={{ padding: '10px 12px', color: '#15803d', fontWeight: 700 }}>
                          {r.institutionalDeliveries} जना
                        </td>
                        <td style={{ padding: '10px 12px', color: '#0369a1', fontWeight: 700 }}>
                          {r.fullyImmunizedChildren} जना
                        </td>
                        <td style={{ padding: '10px 12px', fontSize: '0.78rem' }}>
                          <div>झाडापखाला: <strong>{r.diarrheaCases}</strong></div>
                          <div>निमोनिया: <strong>{r.ariPneumoniaCases}</strong></div>
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <span
                            style={{
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              backgroundColor: isSynced ? '#dcfce7' : '#fef3c7',
                              color: isSynced ? '#15803d' : '#b45309',
                              border: `1px solid ${isSynced ? '#bbf7d0' : '#fde68a'}`,
                            }}
                          >
                            {isSynced ? '✓ सिङ्क भएको (Synced)' : '⏳ पेन्डिङ (Pending)'}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', alignItems: 'center' }}>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedDhis2Report(r);
                                setShowDhis2DetailModal(true);
                              }}
                              title="HMIS ९.३ विस्तृत फाराम हेर्नुहोस् तथा प्रिन्ट गर्नुहोस्"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                backgroundColor: '#eff6ff',
                                color: '#1d4ed8',
                                border: '1px solid #bfdbfe',
                                fontSize: '0.74rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              <Eye size={12} />
                              <span>विवरण</span>
                            </button>

                            {!isSynced && (
                              <button
                                type="button"
                                onClick={() => syncDhis2Mutation.mutate(r.id)}
                                disabled={syncDhis2Mutation.isPending}
                                title="DHIS2 सर्भरमा सिङ्क गर्नुहोस्"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '4px 8px',
                                  borderRadius: '6px',
                                  backgroundColor: '#10b981',
                                  color: '#ffffff',
                                  border: 'none',
                                  fontSize: '0.74rem',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                }}
                              >
                                <RefreshCw size={12} className={syncDhis2Mutation.isPending ? 'spin' : ''} />
                                <span>सिङ्क</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => exportDhis2Json(r)}
                              title="DHIS2 JSON फाइल डाउनलोड"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                backgroundColor: '#f1f5f9',
                                color: '#334155',
                                border: '1px solid #cbd5e1',
                                fontSize: '0.74rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              <Download size={12} />
                              <span>JSON</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`के तपाईं निश्चित हुनुहुन्छ? "${r.healthFacilityName}" को महिना "${r.monthNepali}" को DHIS2 प्रतिवेदन मेटिनेछ।`)) {
                                  deleteDhis2Mutation.mutate(r.id);
                                }
                              }}
                              disabled={deleteDhis2Mutation.isPending}
                              title="प्रतिवेदन मेटाउनुहोस्"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                backgroundColor: '#fee2e2',
                                color: '#b91c1c',
                                border: '1px solid #fecaca',
                                fontSize: '0.74rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              <Trash2 size={12} />
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
      )}

      {/* ── TAB 3: MEDICINE STOCK (e-LMIS) ── */}
      {activeTab === 'medicines' && (
        <div className="dt-card" style={{ padding: '1.25rem' }}>
          {/* ── 1. PHARMACY DISPENSING COUNTER (फार्मेसी काउन्टर) ── */}
          <div
            style={{
              padding: '1.25rem',
              backgroundColor: '#f8fafc',
              borderRadius: '12px',
              border: '1.5px solid #cbd5e1',
              marginBottom: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: '#059669', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Pill size={22} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                    अस्पताल फार्मेसी काउन्टर (Doctor E-Prescription & Pharmacy Dispense Queue)
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
                    चिकित्सकले लेखेका प्रेस्क्रिप्सन अनुसार औषधि वितरण गर्नुहोस् — वितरण गर्दा मौज्दात (Stock) स्वतः घट्नेछ
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => setRxStatusFilter('all')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    backgroundColor: rxStatusFilter === 'all' ? '#059669' : '#ffffff',
                    color: rxStatusFilter === 'all' ? '#ffffff' : '#475569',
                    cursor: 'pointer',
                  }}
                >
                  सबै ({safePrescriptions.length})
                </button>
                <button
                  type="button"
                  onClick={() => setRxStatusFilter('pending')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: '1px solid #fed7aa',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    backgroundColor: rxStatusFilter === 'pending' ? '#ea580c' : '#ffffff',
                    color: rxStatusFilter === 'pending' ? '#ffffff' : '#c2410c',
                    cursor: 'pointer',
                  }}
                >
                  वितरण बाँकी ({safePrescriptions.filter((r) => r.dispenseStatus === 'pending').length})
                </button>
                <button
                  type="button"
                  onClick={() => setRxStatusFilter('dispensed')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: '1px solid #bbf7d0',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    backgroundColor: rxStatusFilter === 'dispensed' ? '#16a34a' : '#ffffff',
                    color: rxStatusFilter === 'dispensed' ? '#ffffff' : '#15803d',
                    cursor: 'pointer',
                  }}
                >
                  वितरण सम्पन्न ({safePrescriptions.filter((r) => r.dispenseStatus === 'dispensed').length})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRxPatient(null);
                    setShowPrescriptionModal(true);
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: '#059669',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <Plus size={14} /> + नयाँ प्रेस्क्रिप्सन
                </button>
              </div>
            </div>

            {/* Prescriptions List / Cards */}
            {filteredPrescriptions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: '#64748b', fontSize: '0.85rem' }}>
                हाल कुनै प्रेस्क्रिप्सन फेला परेन।
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '0.75rem' }}>
                {filteredPrescriptions.map((rx) => {
                  const isPending = rx.dispenseStatus === 'pending';
                  return (
                    <div
                      key={rx.id}
                      style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '8px',
                        border: `1.5px solid ${isPending ? '#fed7aa' : '#bbf7d0'}`,
                        padding: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.9rem' }}>{rx.rxNumber}</span>
                          <span
                            style={{
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: '9999px',
                              backgroundColor: isPending ? '#ffedd5' : '#dcfce7',
                              color: isPending ? '#c2410c' : '#15803d',
                            }}
                          >
                            {isPending ? '⏳ वितरण बाँकी' : '✓ वितरण भइसकेको'}
                          </span>
                        </div>

                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                          {rx.patientName} ({rx.patientAge} वर्ष, {rx.patientGender})
                          {rx.isInsured && (
                            <span style={{ marginLeft: '6px', fontSize: '0.7rem', color: '#059669', backgroundColor: '#ecfdf5', padding: '1px 6px', borderRadius: '4px', border: '1px solid #a7f3d0' }}>
                              HIB बीमित
                            </span>
                          )}
                        </div>

                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                          डाक्टर: {rx.doctorName} • वडा नं. {rx.wardNumber}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: 600, marginTop: '2px' }}>
                          निदान: {rx.diagnosis}
                        </div>

                        {/* Prescribed Meds */}
                        <div style={{ backgroundColor: '#f8fafc', padding: '6px 8px', borderRadius: '6px', marginTop: '8px', fontSize: '0.75rem' }}>
                          <div style={{ fontWeight: 700, color: '#334155', marginBottom: '2px' }}>औषधि:</div>
                          <ul style={{ margin: 0, paddingLeft: '1rem', color: '#475569' }}>
                            {Array.isArray(rx.medicines) &&
                              rx.medicines.map((m, mIdx) => (
                                <li key={mIdx}>
                                  <strong>{m.medicineName}</strong>: {m.dosage} ({m.frequency}) • {m.quantity} थान
                                </li>
                              ))}
                          </ul>
                        </div>
                      </div>

                      <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px dashed #e2e8f0' }}>
                        {isPending ? (
                          <button
                            type="button"
                            disabled={dispensePrescriptionMutation.isPending}
                            onClick={async () => {
                              try {
                                await dispensePrescriptionMutation.mutateAsync({ id: rx.id, pharmacistName: 'फार्मेसी अधिकृत रामशरण कार्की' });
                                alert(`औषधि वितरण सम्पन्न भयो र ${rx.rxNumber} को मौज्दात e-LMIS बाट घटाइयो !`);
                              } catch {
                                alert('औषधि वितरण गर्दा त्रुटि भयो।');
                              }
                            }}
                            style={{
                              width: '100%',
                              padding: '6px 12px',
                              backgroundColor: '#059669',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                            }}
                          >
                            <CheckCircle2 size={14} />
                            <span>औषधि वितरण गर्नुहोस् (Dispense & Deduct Stock)</span>
                          </button>
                        ) : (
                          <div style={{ fontSize: '0.72rem', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle2 size={13} />
                            <span>वितरण सम्पन्न: {rx.dispensedBy || 'फार्मेसी अधिकृत'} ({rx.dispensedAt ? new Date(rx.dispensedAt).toLocaleDateString('ne-NP') : 'सम्पन्न'})</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── 2. MEDICINE INVENTORY TABLE ── */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Pill size={20} color="#0284c7" />
                <span>निःशुल्क औषधि मौज्दात व्यवस्थापन (e-LMIS Inventory)</span>
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#475569', margin: '3px 0 0 0' }}>
                वडागत स्वास्थ्य चौकीहरूमा नेपाल सरकारले उपलब्ध गराउने ९८ प्रकारका अत्यावश्यक औषधिको आपूर्ति तथा मौज्दात
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => {
                  setHealthExcelInitialTab('medicines');
                  setShowHealthExcelModal(true);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#16a34a',
                  color: '#ffffff',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(22, 163, 74, 0.25)',
                }}
                title="निःशुल्क औषधि मौज्दात Excel बाट अपलोड गर्नुहोस्"
              >
                <FileSpreadsheet size={16} />
                <span>Excel बाट औषधि मौज्दात</span>
              </button>

              <button
                type="button"
                onClick={() => setShowMedicineModal(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                }}
              >
                <Plus size={16} />
                <span>+ नयाँ औषधि थप्नुहोस्</span>
              </button>

              <button
                type="button"
                onClick={() => setShowTransferModal(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#4f46e5',
                  color: '#ffffff',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(79, 70, 229, 0.25)',
                }}
                title="स्वास्थ्य संस्था बीच औषधि मौज्दात ट्रान्सफर वा म्याद मिन्हा गर्नुहोस्"
              >
                <ArrowRightLeft size={16} />
                <span>+ औषधि स्थानान्तरण (Transfer)</span>
              </button>
            </div>
          </div>

          <div style={{ flexWrap: 'wrap' }}>
            <div className="dt-responsive-table-wrapper">
<table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                  <th style={{ padding: '10px 12px', fontWeight: 700 }}>औषधिको नाम</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700 }}>प्रकार / समूह</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700 }}>स्वास्थ्य संस्था / वडा</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700 }}>ब्याच नं</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700 }}>हालको मौज्दात</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700 }}>म्याद सकिने मिति</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700 }}>स्थिति</th>
                </tr>
              </thead>
              <tbody>
                {filteredMedicines.map((m) => {
                  const isLow = m.stockQuantity <= m.minimumRequiredStock;

                  return (
                    <tr key={m.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0f172a' }}>
                        <div>{m.medicineName}</div>
                        {m.genericName && <small style={{ color: '#475569' }}>जेनेरिक: {m.genericName}</small>}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '0.74rem',
                            fontWeight: 600,
                            backgroundColor: '#f1f5f9',
                            color: '#475569',
                          }}
                        >
                          {m.category === 'essential'
                            ? 'अत्यावश्यक'
                            : m.category === 'antibiotic'
                            ? 'एन्टिबायोटिक'
                            : m.category === 'mch'
                            ? 'मातृ-शिशु'
                            : 'आकस्मिक'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', color: '#334155' }}>
                        <div>{m.healthFacilityName}</div>
                        <small style={{ color: '#475569' }}>वडा नं. {m.wardNumber}</small>
                      </td>
                      <td style={{ padding: '10px 12px', color: '#475569', fontSize: '0.8rem' }}>{m.batchNo || '-'}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <strong style={{ color: isLow ? '#dc2626' : '#15803d', fontSize: '0.92rem' }}>
                          {m.stockQuantity}
                        </strong>{' '}
                        {m.unit}
                        <div style={{ fontSize: '0.7rem', color: '#475569' }}>न्यूनतम: {m.minimumRequiredStock}</div>
                      </td>
                      <td style={{ padding: '10px 12px', color: '#475569' }}>{m.expiryDate || '-'}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            backgroundColor: isLow ? '#fee2e2' : '#dcfce7',
                            color: isLow ? '#991b1b' : '#15803d',
                            border: `1px solid ${isLow ? '#fecaca' : '#bbf7d0'}`,
                          }}
                        >
                          {isLow ? '⚠️ न्यून मौज्दात' : '✓ पर्याप्त मौज्दात'}
                        </span>
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

      {/* ── TAB: PHARMACY POS SALES ── */}
      {activeTab === 'pos' && (
        <div className="dt-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShoppingCart size={22} color="#0284c7" />
                <span>अस्पताल फार्मेसी काउन्टर बिक्री तथा बिलिङ (Pharmacy POS Management)</span>
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#475569', margin: '3px 0 0 0' }}>
                द्रुत बारकोड बिलिङ, FEFO अनुसार मौज्दात कटौति, ई-प्रेस्क्रिप्सन आयात र स्वास्थ्य बीमा सह-भुक्तानी
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setShowReturnBillModal(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#fff1f2',
                  color: '#be123c',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1.5px solid #fecdd3',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(225, 29, 72, 0.08)',
                  transition: 'all 0.15s ease',
                }}
              >
                <RotateCcw size={16} />
                <span>बिल फिर्ता / Refund (Returns Bill)</span>
              </button>

              <button
                type="button"
                onClick={() => setShowPosModal(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  padding: '8px 18px',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(2, 132, 199, 0.25)',
                }}
              >
                <ShoppingCart size={16} />
                <span>+ नयाँ बिल काट्नुहोस् (Open POS)</span>
              </button>
            </div>
          </div>

          {/* Quick Stats Banner */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ padding: '12px', backgroundColor: '#f0f9ff', borderRadius: '10px', border: '1px solid #bae6fd' }}>
              <div style={{ fontSize: '0.75rem', color: '#0369a1', fontWeight: 600 }}>कुल बिक्री संख्या</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{posSales.length} वटा बिल</div>
            </div>
            <div style={{ padding: '12px', backgroundColor: '#f0fdf4', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
              <div style={{ fontSize: '0.75rem', color: '#15803d', fontWeight: 600 }}>कुल बिक्री राजस्व</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#166534' }}>
                रु. {posSales.reduce((sum, s) => sum + Number(s.totalAmount || 0), 0).toLocaleString('ne-NP')}
              </div>
            </div>
            <div style={{ padding: '12px', backgroundColor: '#fffbeb', borderRadius: '10px', border: '1px solid #fde68a' }}>
              <div style={{ fontSize: '0.75rem', color: '#b45309', fontWeight: 600 }}>बीमा सह-भुक्तानी (Co-Pay)</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#92400e' }}>
                रु. {posSales.reduce((sum, s) => sum + Number(s.copayAmount || 0), 0).toLocaleString('ne-NP')}
              </div>
            </div>
            <div style={{ padding: '12px', backgroundColor: '#f5f3ff', borderRadius: '10px', border: '1px solid #ddd6fe' }}>
              <div style={{ fontSize: '0.75rem', color: '#6d28d9', fontWeight: 600 }}>बीमा दावी रकम (To HIB)</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#5b21b6' }}>
                रु. {posSales.reduce((sum, s) => sum + Number(s.insuranceClaimAmount || 0), 0).toLocaleString('ne-NP')}
              </div>
            </div>
          </div>

          {/* Sales Bills Table */}
          <div className="dt-responsive-table-wrapper">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                  <th style={{ padding: '10px 12px' }}>बिल नं</th>
                  <th style={{ padding: '10px 12px' }}>मिति / समय</th>
                  <th style={{ padding: '10px 12px' }}>ग्राहक / बिरामी</th>
                  <th style={{ padding: '10px 12px' }}>बीमा स्थिति</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>कुल रकम (रु.)</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>सह-भुक्तानी (Co-Pay)</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>बीमा दावी</th>
                  <th style={{ padding: '10px 12px' }}>भुक्तानी प्रकार</th>
                  <th style={{ padding: '10px 12px' }}>बिलर</th>
                </tr>
              </thead>
              <tbody>
                {posSales.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                      कुनै बिक्री बिल फेला परेन। माथिको '+ नयाँ बिल काट्नुहोस्' बटनबाट नयाँ बिल जारी गर्नुहोस्।
                    </td>
                  </tr>
                ) : (
                  posSales.map((s) => (
                    <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 800, color: '#0284c7', fontFamily: 'monospace' }}>
                        {s.billNo}
                      </td>
                      <td style={{ padding: '10px 12px', color: '#64748b' }}>
                        {s.createdAt ? new Date(s.createdAt).toLocaleDateString('ne-NP') : '२०८१/०५/१५'}
                      </td>
                      <td style={{ padding: '10px 12px', fontWeight: 700 }}>
                        {s.patientName}
                        {s.patientNo && <div style={{ fontSize: '0.7rem', color: '#64748b' }}>MRN: {s.patientNo}</div>}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        {s.isInsured ? (
                          <span style={{ backgroundColor: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700 }}>
                            🛡️ HIB बीमित ({s.copayPercent}%)
                          </span>
                        ) : (
                          <span style={{ color: '#64748b', fontSize: '0.72rem' }}>सामान्य (Private)</span>
                        )}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 800 }}>
                        रु. {Number(s.totalAmount).toFixed(2)}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', color: '#dc2626', fontWeight: 700 }}>
                        रु. {Number(s.copayAmount).toFixed(2)}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', color: '#16a34a', fontWeight: 700 }}>
                        रु. {Number(s.insuranceClaimAmount).toFixed(2)}
                      </td>
                      <td style={{ padding: '10px 12px', textTransform: 'uppercase', fontSize: '0.74rem' }}>
                        {s.paymentMode}
                      </td>
                      <td style={{ padding: '10px 12px', color: '#475569' }}>
                        {s.billerName}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB: PURCHASE MANAGEMENT & GRN ── */}
      {activeTab === 'purchase' && (
        <div className="dt-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Boxes size={22} color="#0284c7" />
                <span>खरिद व्यवस्थापन तथा दाखिला प्रतिवेदन (Purchase Management & GRN)</span>
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#475569', margin: '3px 0 0 0' }}>
                नेपाल सरकार म.ले.प. फाराम नं ४०३/४०१ अनुसार औषधि खरिद, आपूर्तिकर्ता भुक्तानी र ब्याच-वाइज जिन्सी दाखिला
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowPurchaseModal(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#0284c7',
                color: '#ffffff',
                padding: '8px 18px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(2, 132, 199, 0.25)',
              }}
            >
              <Plus size={16} />
              <span>+ नयाँ दाखिला प्रविष्टि (New GRN)</span>
            </button>
          </div>

          {/* Purchases Table */}
          <div className="dt-responsive-table-wrapper">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                  <th style={{ padding: '10px 12px' }}>दाखिला नं (GRN)</th>
                  <th style={{ padding: '10px 12px' }}>सप्लायर बिल नं</th>
                  <th style={{ padding: '10px 12px' }}>आपूर्तिकर्ताको नाम</th>
                  <th style={{ padding: '10px 12px' }}>दाखिला मिति</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>जम्मा रकम (रु.)</th>
                  <th style={{ padding: '10px 12px' }}>भुक्तानी अवस्था</th>
                  <th style={{ padding: '10px 12px' }}>दाखिला लिने कर्मचारी</th>
                  <th style={{ padding: '10px 12px' }}>कैफियत</th>
                </tr>
              </thead>
              <tbody>
                {purchases.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                      कुनै खरिद दाखिला प्रतिवेदन फेला परेन। माथिको '+ नयाँ दाखिला प्रविष्टि' थिच्नुहोस्।
                    </td>
                  </tr>
                ) : (
                  purchases.map((p) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 800, color: '#dc2626', fontFamily: 'monospace' }}>
                        {p.grnNo}
                      </td>
                      <td style={{ padding: '10px 12px', fontFamily: 'monospace' }}>{p.invoiceNo}</td>
                      <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0f172a' }}>{p.supplierName}</td>
                      <td style={{ padding: '10px 12px', color: '#475569' }}>{p.purchaseDateBs}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 800 }}>
                        रु. {Number(p.totalAmount).toLocaleString('ne-NP')}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            backgroundColor: p.paymentStatus === 'paid' ? '#dcfce7' : '#fee2e2',
                            color: p.paymentStatus === 'paid' ? '#166534' : '#991b1b',
                          }}
                        >
                          {p.paymentStatus === 'paid' ? '✓ भुक्तान भइसकेको' : 'उधारो / बाँकी'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px' }}>{p.receivedBy}</td>
                      <td style={{ padding: '10px 12px', color: '#64748b', fontSize: '0.75rem' }}>
                        {p.remarks || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB: HEALTH INSURANCE (HIB) ── */}
      {activeTab === 'insurance' && (
        <div className="dt-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={22} color="#16a34a" />
                <span>स्वास्थ्य बीमा बोर्ड (Health Insurance Board - HIB) व्यवस्थापन</span>
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#475569', margin: '3px 0 0 0' }}>
                प्रथम सेवा बिन्दु व्यवस्थापन, सह-भुक्तानी (Co-Pay १०%/२०%), दावी फारम (Claim Sheet) र प्रेषण पुर्जी (Referral)
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => {
                  setSelectedInsuranceClaim(insuranceClaims[0] || null);
                  setShowInsuranceModal(true);
                }}
                disabled={insuranceClaims.length === 0}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#16a34a',
                  color: '#ffffff',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: insuranceClaims.length === 0 ? 'not-allowed' : 'pointer',
                }}
              >
                <FileText size={15} />
                <span>दावी सिट तथा सिफारिस हेर्नुहोस्</span>
              </button>
            </div>
          </div>

          {/* Insurance KPI Indicator Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ padding: '14px', backgroundColor: '#f0fdf4', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
              <div style={{ fontSize: '0.78rem', color: '#166534', fontWeight: 600 }}>कुल बीमा दावी संख्या</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#14532d' }}>
                {insuranceSummary?.totalClaims || insuranceClaims.length} वटा दावी
              </div>
            </div>
            <div style={{ padding: '14px', backgroundColor: '#eff6ff', borderRadius: '10px', border: '1px solid #bfdbfe' }}>
              <div style={{ fontSize: '0.78rem', color: '#1e40af', fontWeight: 600 }}>कुल दावी पेश रकम (Claimed)</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#1e3a8a' }}>
                रु. {(insuranceSummary?.totalClaimedAmount || 0).toLocaleString('ne-NP')}
              </div>
            </div>
            <div style={{ padding: '14px', backgroundColor: '#fffbeb', borderRadius: '10px', border: '1px solid #fde68a' }}>
              <div style={{ fontSize: '0.78rem', color: '#b45309', fontWeight: 600 }}>सह-भुक्तानी संकलन (Co-Pay)</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#78350f' }}>
                रु. {(insuranceSummary?.totalCopayAmount || 0).toLocaleString('ne-NP')}
              </div>
            </div>
            <div style={{ padding: '14px', backgroundColor: '#ecfdf5', borderRadius: '10px', border: '1px solid #a7f3d0' }}>
              <div style={{ fontSize: '0.78rem', color: '#047857', fontWeight: 600 }}>भुक्तानी प्राप्त (Reimbursed)</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#064e3b' }}>
                रु. {(insuranceSummary?.totalReimbursedAmount || 0).toLocaleString('ne-NP')}
              </div>
            </div>
          </div>

          {/* Insurance Claims Table */}
          <div className="dt-responsive-table-wrapper">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                  <th style={{ padding: '10px 12px' }}>दावी नं (Claim No)</th>
                  <th style={{ padding: '10px 12px' }}>बीमा कार्ड नं</th>
                  <th style={{ padding: '10px 12px' }}>बिरामीको नाम</th>
                  <th style={{ padding: '10px 12px' }}>मिति</th>
                  <th style={{ padding: '10px 12px' }}>सेवा प्रकार</th>
                  <th style={{ padding: '10px 12px' }}>निदान / ICD कोड</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>कुल बिल</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>सह-भुक्तानी</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>दावी रकम</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center' }}>स्थिति</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center' }}>कार्य</th>
                </tr>
              </thead>
              <tbody>
                {insuranceClaims.length === 0 ? (
                  <tr>
                    <td colSpan={11} style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                      कुनै बीमा दावी फेला परेन। फार्मेसी वा ओपिडीबाट बीमा टिकट काट्दा दावी स्वतः सिर्जना हुन्छ।
                    </td>
                  </tr>
                ) : (
                  insuranceClaims.map((c) => (
                    <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 800, color: '#16a34a', fontFamily: 'monospace' }}>
                        {c.claimNo}
                      </td>
                      <td style={{ padding: '10px 12px', fontWeight: 700, fontFamily: 'monospace' }}>
                        {c.policyNumber}
                      </td>
                      <td style={{ padding: '10px 12px', fontWeight: 700 }}>
                        {c.patientName}
                        {c.patientNo && <div style={{ fontSize: '0.7rem', color: '#64748b' }}>MRN: {c.patientNo}</div>}
                      </td>
                      <td style={{ padding: '10px 12px', color: '#64748b' }}>{c.claimDateBs}</td>
                      <td style={{ padding: '10px 12px', textTransform: 'uppercase', fontSize: '0.74rem' }}>
                        {c.serviceType}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        {c.diagnosisName || 'सामान्य परामर्श'}
                        {c.diagnosisCode && <span style={{ marginLeft: '4px', color: '#0284c7' }}>({c.diagnosisCode})</span>}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                        रु. {Number(c.totalBillAmount).toFixed(2)}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', color: '#dc2626', fontWeight: 700 }}>
                        रु. {Number(c.copayAmount).toFixed(2)}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', color: '#16a34a', fontWeight: 800 }}>
                        रु. {Number(c.claimedAmount).toFixed(2)}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '9999px',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            backgroundColor:
                              c.claimStatus === 'approved' ? '#dcfce7' : c.claimStatus === 'rejected' ? '#fee2e2' : '#fef3c7',
                            color:
                              c.claimStatus === 'approved' ? '#15803d' : c.claimStatus === 'rejected' ? '#991b1b' : '#92400e',
                          }}
                        >
                          {c.claimStatus === 'approved' ? '✓ स्वीकृत' : c.claimStatus === 'rejected' ? '✗ अस्वीकृत' : '⏳ पेश गरिएको'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedInsuranceClaim(c);
                            setShowInsuranceModal(true);
                          }}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            border: '1px solid #bbf7d0',
                            backgroundColor: '#f0fdf4',
                            color: '#15803d',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          <FileText size={13} />
                          <span>दावी पत्र</span>
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

      {/* ── TAB: STOCK TRANSFERS & INTER-FACILITY REALLOCATION ── */}
      {activeTab === 'transfers' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Header Action Bar */}
          <div
            className="dt-card"
            style={{
              padding: '1.25rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              backgroundColor: '#ffffff',
              border: '1.5px solid #cbd5e1',
              borderRadius: '14px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#4f46e5', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ArrowRightLeft size={22} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                    औषधि मौज्दात ट्रान्सफर तथा अन्तर-शाखा स्थानान्तरण प्रणाली
                  </h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                    केन्द्रीय औषधि भण्डार (तिपेनी), १५-शय्या प्राथमिक अस्पताल तथा वडास्तरीय स्वास्थ्य चौकीहरू बीच मौज्दात स्थानान्तरण र म्याद विसर्जन
                  </p>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => queryClient.invalidateQueries({ queryKey: ['health-stock-transfers'] })}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#f1f5f9',
                  color: '#334155',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                }}
              >
                <RefreshCw size={15} />
                <span>ताजा गर्नुहोस्</span>
              </button>

              <button
                type="button"
                onClick={() => setShowTransferModal(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#4f46e5',
                  color: '#ffffff',
                  padding: '9px 18px',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  boxShadow: '0 3px 10px rgba(79, 70, 229, 0.3)',
                }}
              >
                <Plus size={16} />
                <span>+ नयाँ स्थानान्तरण / मिन्हा फाराम</span>
              </button>
            </div>
          </div>

          {/* KPI Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>कुल स्थानान्तरण (Total)</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a', marginTop: '4px' }}>
                {safeStockTransfers.length} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>वटा</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: '4px' }}>सबै प्रकारका निकासा र स्थानान्तरण</div>
            </div>

            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '1rem', border: '1px solid #c7d2fe', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4338ca', textTransform: 'uppercase' }}>अन्तर-संस्था स्थानान्तरण</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#4338ca', marginTop: '4px' }}>
                {safeStockTransfers.filter((t: any) => (t.transferType || t.transfer_type) === 'inter_facility').length} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#6366f1' }}>पटक</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: '4px' }}>केन्द्रीय भण्डारबाट स्वास्थ्य चौकीमा</div>
            </div>

            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '1rem', border: '1px solid #fed7aa', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#c2410c', textTransform: 'uppercase' }}>आपतकालीन पुनःवितरण</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#c2410c', marginTop: '4px' }}>
                {safeStockTransfers.filter((t: any) => (t.transferType || t.transfer_type) === 'emergency_reallocation').length} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ea580c' }}>पटक</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: '4px' }}>संस्था-संस्था बीच तत्काल सापटी</div>
            </div>

            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '1rem', border: '1px solid #bbf7d0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#15803d', textTransform: 'uppercase' }}>सम्पन्न / दाखिला भएको</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#15803d', marginTop: '4px' }}>
                {safeStockTransfers.filter((t: any) => t.status === 'completed').length} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#16a34a' }}>वटा</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: '4px' }}>
                बाटोमा/ढुवानीमा: <strong>{safeStockTransfers.filter((t: any) => t.status === 'in_transit').length} वटा</strong>
              </div>
            </div>

            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '1rem', border: '1px solid #fecdd3', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#be123c', textTransform: 'uppercase' }}>कुल औषधीय परिमाण</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#be123c', marginTop: '4px' }}>
                {safeStockTransfers.reduce((acc: number, t: any) => acc + (Number(t.quantity) || 0), 0).toLocaleString('ne-NP')} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e11d48' }}>एकाइ</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: '4px' }}>ट्याब्लेट, क्याप्सुल, भायल र बोतल</div>
            </div>
          </div>

          {/* Filter Bar */}
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: '#f8fafc',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>प्रकार फिल्टर:</span>
              {[
                { key: 'all', label: 'सबै प्रकार' },
                { key: 'inter_facility', label: 'अन्तर-संस्था' },
                { key: 'emergency_reallocation', label: 'आपतकालीन सापटी' },
                { key: 'internal_issue', label: 'आन्तरिक निकासा' },
                { key: 'disposal_expired', label: 'म्याद मिन्हा' },
              ].map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={() => setTransferTypeFilter(chip.key)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: transferTypeFilter === chip.key ? '#4f46e5' : '#cbd5e1',
                    backgroundColor: transferTypeFilter === chip.key ? '#eef2ff' : '#ffffff',
                    color: transferTypeFilter === chip.key ? '#4338ca' : '#475569',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>स्थिति:</span>
              {[
                { key: 'all', label: 'सबै' },
                { key: 'completed', label: '✓ सम्पन्न' },
                { key: 'in_transit', label: '🚚 बाटोमा' },
              ].map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={() => setTransferStatusFilter(chip.key)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: transferStatusFilter === chip.key ? '#059669' : '#cbd5e1',
                    backgroundColor: transferStatusFilter === chip.key ? '#ecfdf5' : '#ffffff',
                    color: transferStatusFilter === chip.key ? '#065f46' : '#475569',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* Transfers Table */}
          <div className="dt-card" style={{ padding: '0', overflow: 'hidden', border: '1.5px solid #e2e8f0', borderRadius: '14px' }}>
            <div className="dt-responsive-table-wrapper">
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                    <th style={{ padding: '12px 14px' }}>चलानी नं</th>
                    <th style={{ padding: '12px 14px' }}>स्थानान्तरण प्रकार</th>
                    <th style={{ padding: '12px 14px' }}>पठाउने स्वास्थ्य संस्था / शाखा</th>
                    <th style={{ padding: '12px 14px' }}>पाउने संस्था / वार्ड</th>
                    <th style={{ padding: '12px 14px' }}>औषधि र ब्याच नं</th>
                    <th style={{ padding: '12px 14px', textAlign: 'right' }}>परिमाण</th>
                    <th style={{ padding: '12px 14px' }}>मिति</th>
                    <th style={{ padding: '12px 14px' }}>मागकर्ता / जारी गर्ने</th>
                    <th style={{ padding: '12px 14px' }}>अवस्था</th>
                    <th style={{ padding: '12px 14px' }}>कैफियत</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStockTransfers.length === 0 ? (
                    <tr>
                      <td colSpan={10} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                        कुनै स्थानान्तरण रेकर्ड फेला परेन। माथिको '+ नयाँ स्थानान्तरण / मिन्हा फाराम' बाट नयाँ निकासा प्रविष्टि गर्नुहोस्।
                      </td>
                    </tr>
                  ) : (
                    filteredStockTransfers.map((t: any) => {
                      const typeLabel =
                        (t.transferType || t.transfer_type) === 'inter_facility'
                          ? 'अन्तर-संस्था स्थानान्तरण'
                          : (t.transferType || t.transfer_type) === 'emergency_reallocation'
                          ? 'आपतकालीन पुनःवितरण'
                          : (t.transferType || t.transfer_type) === 'disposal_expired'
                          ? 'म्याद मिन्हा/विसर्जन'
                          : 'आन्तरिक निकासा';

                      const typeColor =
                        (t.transferType || t.transfer_type) === 'inter_facility'
                          ? { bg: '#e0e7ff', text: '#3730a3', border: '#c7d2fe' }
                          : (t.transferType || t.transfer_type) === 'emergency_reallocation'
                          ? { bg: '#ffedd5', text: '#9a3412', border: '#fed7aa' }
                          : (t.transferType || t.transfer_type) === 'disposal_expired'
                          ? { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' }
                          : { bg: '#f1f5f9', text: '#334155', border: '#cbd5e1' };

                      const isTransit = t.status === 'in_transit';

                      return (
                        <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '12px 14px', fontWeight: 800, fontFamily: 'monospace', color: '#4f46e5' }}>
                            {t.transferNo || t.transfer_no || t.id.slice(0, 8)}
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <span
                              style={{
                                padding: '3px 8px',
                                borderRadius: '6px',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                backgroundColor: typeColor.bg,
                                color: typeColor.text,
                                border: `1px solid ${typeColor.border}`,
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {typeLabel}
                            </span>
                          </td>
                          <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0f172a' }}>
                            {t.fromLocation || t.from_location || t.fromFacility || '-'}
                          </td>
                          <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0369a1' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span style={{ color: '#94a3b8' }}>➜</span>
                              <span>{t.toLocation || t.to_location || t.toFacility || '-'}</span>
                            </div>
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ fontWeight: 800, color: '#0f172a' }}>
                              {t.medicineName || t.medicine_name}
                            </div>
                            {(t.batchNo || t.batch_no) && (
                              <div style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'monospace' }}>
                                ब्याच: {t.batchNo || t.batch_no}
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>
                            {Number(t.quantity).toLocaleString('ne-NP')}{' '}
                            <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 500 }}>
                              {t.unit || 'एकाइ'}
                            </span>
                          </td>
                          <td style={{ padding: '12px 14px', color: '#475569', fontSize: '0.78rem' }}>
                            {t.transferDateBs || t.transfer_date_bs || '२०८१/०५/१५'}
                          </td>
                          <td style={{ padding: '12px 14px', fontSize: '0.76rem' }}>
                            {t.requestedBy || t.requested_by ? (
                              <div style={{ color: '#0f172a' }}>
                                माग: <span style={{ fontWeight: 600 }}>{t.requestedBy || t.requested_by}</span>
                              </div>
                            ) : null}
                            {t.issuedBy || t.issued_by || t.transferredBy ? (
                              <div style={{ color: '#64748b' }}>
                                जारी: {t.issuedBy || t.issued_by || t.transferredBy}
                              </div>
                            ) : null}
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <span
                              style={{
                                padding: '3px 8px',
                                borderRadius: '6px',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                backgroundColor: isTransit ? '#fef3c7' : '#dcfce7',
                                color: isTransit ? '#b45309' : '#166534',
                                border: `1px solid ${isTransit ? '#fde68a' : '#bbf7d0'}`,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {isTransit ? '🚚 बाटोमा' : '✓ सम्पन्न'}
                            </span>
                          </td>
                          <td style={{ padding: '12px 14px', color: '#64748b', fontSize: '0.75rem', maxWidth: '240px' }}>
                            {t.remarks || '-'}
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
      )}

      {/* ── TAB 4: AMBULANCES ── */}
      {activeTab === 'ambulances' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Header Action Bar */}
          <div
            className="dt-card"
            style={{
              padding: '1rem 1.25rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Truck size={22} color="#0284c7" />
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
                  पाँचपोखरी थाङपाल एम्बुलेन्स सेवा व्यवस्थापन
                </h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px', fontSize: '0.78rem', color: '#64748b' }}>
                <span>कुल: <strong style={{ color: '#0f172a' }}>{filteredAmbulances.length} वटा</strong></span>
                <span>•</span>
                <span style={{ color: '#166534' }}>
                  सञ्चालनमा: <strong>{filteredAmbulances.filter((a) => a.isAvailable).length} वटा</strong>
                </span>
                <span>•</span>
                <span style={{ color: '#991b1b' }}>
                  व्यस्त/मर्मतमा: <strong>{filteredAmbulances.filter((a) => !a.isAvailable).length} वटा</strong>
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setAmbulanceToEdit(null);
                setShowAmbulanceModal(true);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                backgroundColor: '#0284c7',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(2, 132, 199, 0.3)',
                transition: 'all 0.15s ease',
              }}
            >
              <Plus size={16} />
              <span>नयाँ एम्बुलेन्स थप्नुहोस्</span>
            </button>
          </div>

          {/* Ambulances Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {filteredAmbulances.map((a) => (
              <div
                key={a.id}
                className="dt-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '0.85rem',
                  padding: '1.25rem',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '14px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  position: 'relative',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                }}
              >
                <div>
                  {/* Top Bar: Vehicle Number & Status Badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          backgroundColor: '#e0f2fe',
                          color: '#0284c7',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Truck size={18} />
                      </div>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
                        {a.vehicleNumber}
                      </span>
                    </div>

                    <span
                      style={{
                        padding: '0.25rem 0.65rem',
                        borderRadius: '50px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        backgroundColor: a.isAvailable ? '#dcfce7' : '#fee2e2',
                        color: a.isAvailable ? '#166534' : '#991b1b',
                        border: `1px solid ${a.isAvailable ? '#bbf7d0' : '#fecaca'}`,
                      }}
                    >
                      {a.isAvailable ? 'सञ्चालनमा' : 'व्यस्त / मर्मत'}
                    </span>
                  </div>

                  {/* Driver & Station Details */}
                  <div style={{ fontSize: '0.85rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ color: '#94a3b8', minWidth: '65px' }}>चालक:</span>
                      <strong style={{ color: '#1e293b' }}>{a.driverName}</strong>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ color: '#94a3b8', minWidth: '65px' }}>स्टेशन:</span>
                      <span>{a.stationLocation} (वडा नं. {a.wardNumber})</span>
                    </div>
                    {a.notes && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#0369a1', marginTop: '2px' }}>
                        <span style={{ color: '#94a3b8', minWidth: '65px' }}>कैफियत:</span>
                        <span>{a.notes}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                  {/* Phone Call Button */}
                  <a
                    href={`tel:${a.contactNumber}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      padding: '0.6rem',
                      borderRadius: '8px',
                      backgroundColor: '#dc2626',
                      color: 'white',
                      textDecoration: 'none',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      boxShadow: '0 2px 6px rgba(220, 38, 38, 0.25)',
                    }}
                  >
                    <Phone size={15} />
                    <span>तुरुन्त सम्पर्क गर्नुहोस् ({a.contactNumber})</span>
                  </a>

                  {/* Edit / Status Toggle / Delete Toolbar */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '6px' }}>
                    {/* Edit Button */}
                    <button
                      onClick={() => {
                        setAmbulanceToEdit(a);
                        setShowAmbulanceModal(true);
                      }}
                      style={{
                        padding: '6px 10px',
                        backgroundColor: '#f8fafc',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        color: '#0284c7',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                      }}
                      title="एम्बुलेन्स तथा चालकको विवरण सच्याउनुहोस्"
                    >
                      <Edit3 size={13} />
                      <span>सच्याउनुहोस्</span>
                    </button>

                    {/* Toggle Status Button */}
                    <button
                      onClick={async () => {
                        try {
                          await sectoralApi.toggleAmbulanceAvailability(a.id);
                          queryClient.invalidateQueries({ queryKey: ['ambulance-contacts'] });
                        } catch (err: any) {
                          alert('स्थिति परिवर्तन गर्न सकिएन: ' + err.message);
                        }
                      }}
                      style={{
                        padding: '6px 10px',
                        backgroundColor: a.isAvailable ? '#fef2f2' : '#f0fdf4',
                        border: `1px solid ${a.isAvailable ? '#fecaca' : '#bbf7d0'}`,
                        borderRadius: '6px',
                        color: a.isAvailable ? '#dc2626' : '#16a34a',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                      }}
                      title="सञ्चालन वा व्यस्त अवस्था फेर्नुहोस्"
                    >
                      <RefreshCw size={12} />
                      <span>{a.isAvailable ? 'व्यस्त बनाउने' : 'उपलब्ध गराउने'}</span>
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={async () => {
                        if (confirm(`के तपाईं निश्चित हुनुहुन्छ? ${a.vehicleNumber} लाई हटाउन चाहनुहुन्छ?`)) {
                          try {
                            await sectoralApi.deleteAmbulanceContact(a.id);
                            queryClient.invalidateQueries({ queryKey: ['ambulance-contacts'] });
                          } catch (err: any) {
                            alert('हटाउन सकिएन: ' + err.message);
                          }
                        }
                      }}
                      style={{
                        padding: '6px 8px',
                        backgroundColor: '#f8fafc',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      title="एम्बुलेन्स सूचीबाट हटाउनुहोस्"
                    >
                      <Trash2 size={14} color="#ef4444" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredAmbulances.length === 0 && (
            <div
              style={{
                padding: '3rem',
                textAlign: 'center',
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: '1px dashed #cbd5e1',
                color: '#64748b',
              }}
            >
              <Truck size={36} color="#94a3b8" style={{ marginBottom: '8px' }} />
              <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>कुनै एम्बुलेन्स फेला परेन</div>
              <p style={{ fontSize: '0.8rem', margin: '4px 0 12px 0' }}>खोजिएको शब्द वा वडामा कुनै एम्बुलेन्स दर्ता छैन।</p>
              <button
                onClick={() => {
                  setAmbulanceToEdit(null);
                  setShowAmbulanceModal(true);
                }}
                style={{
                  padding: '7px 14px',
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                + नयाँ एम्बुलेन्स थप्नुहोस्
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 5: BLOOD BANK ── */}
      {activeTab === 'blood' && (
        <div className="dt-card" style={{ padding: '1.25rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: '#0f172a' }}>
            रक्त सञ्चार सेवा तथा आकस्मिक मौज्दात स्थिति
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
            {bloodStock.map((b) => (
              <div
                key={b.bloodGroup}
                style={{
                  padding: '1rem',
                  borderRadius: '10px',
                  border: '1.5px solid #e2e8f0',
                  textAlign: 'center',
                  backgroundColor: b.status === 'critical' ? '#fef2f2' : b.status === 'moderate' ? '#fffbeb' : '#f0fdf4',
                }}
              >
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#dc2626' }}>{b.bloodGroup}</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0.25rem 0' }}>{b.unitsAvailable} पिन्ट</div>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    padding: '0.15rem 0.5rem',
                    borderRadius: '4px',
                    backgroundColor: b.status === 'critical' ? '#fee2e2' : b.status === 'moderate' ? '#fef3c7' : '#dcfce7',
                    color: b.status === 'critical' ? '#991b1b' : b.status === 'moderate' ? '#92400e' : '#166534',
                  }}
                >
                  {b.status === 'critical' ? 'अति न्यून' : b.status === 'moderate' ? 'मध्यम' : 'पर्याप्त'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 6: IMMUNIZATION SCHEDULE ── */}
      {activeTab === 'immunization' && (
        <div className="dt-card" style={{ padding: '1.25rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: '#0f172a' }}>
            नियमित खोप क्यालेन्डर तथा अभियान तालिका
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {immunization.map((imm) => (
              <div
                key={imm.id}
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: '8px',
                  border: '1.5px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>{imm.vaccineName}</div>
                  <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                    लक्षित समूह: <strong>{imm.targetGroup}</strong> | स्थान: {imm.location}
                  </div>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '50px',
                    backgroundColor: '#e0f2fe',
                    color: '#0369a1',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                  }}
                >
                  <CalendarCheck size={14} />
                  <span>{imm.scheduledDay}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── MODAL: DHIS2 MONTHLY REPORT ENTRY ── */}
      {showDhis2Modal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '800px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1.2rem 1.5rem',
                borderBottom: '1px solid #e2e8f0',
                backgroundColor: '#fef2f2',
                borderTopLeftRadius: '16px',
                borderTopRightRadius: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '8px', borderRadius: '8px' }}>
                  <FileCheck2 size={22} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    नेपाल सरकार DHIS2 / HMIS मासिक स्वास्थ्य प्रतिवेदन प्रविष्टि
                  </h2>
                  <p style={{ fontSize: '0.78rem', color: '#475569', margin: '2px 0 0 0' }}>
                    स्वास्थ्य चौकी तथा प्राथमिक अस्पतालको मासिक सेवा प्रवाह तथ्याङ्क
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDhis2Modal(false)}
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#475569' }}
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createDhis2Mutation.mutate(dhis2FormData);
              }}
              style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}
            >
              {/* SECTION 1: FACILITY & PERIOD */}
              <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1.5px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#dc2626', marginBottom: '0.75rem' }}>
                  १. स्वास्थ्य संस्था र प्रतिवेदन अवधि
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                      स्वास्थ्य संस्थाको नाम
                    </label>
                    <select
                      className="dt-input"
                      value={dhis2FormData.healthFacilityName}
                      onChange={(e) => setDhis2FormData({ ...dhis2FormData, healthFacilityName: e.target.value })}
                    >
                      {safeFacilities.map((f) => (
                        <option key={f.id} value={f.nameNepali}>
                          {f.nameNepali} (वडा {f.wardNumber})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                      महिना (Month)
                    </label>
                    <select
                      className="dt-input"
                      value={dhis2FormData.monthNepali}
                      onChange={(e) => setDhis2FormData({ ...dhis2FormData, monthNepali: e.target.value })}
                    >
                      {MONTHS_NEPALI.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                      आर्थिक वर्ष
                    </label>
                    <input
                      type="text"
                      className="dt-input"
                      value={dhis2FormData.fiscalYear}
                      onChange={(e) => setDhis2FormData({ ...dhis2FormData, fiscalYear: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* 1-CLICK DHIS2 INDICATORS AUTO CALCULATOR */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  backgroundColor: '#ecfdf5',
                  borderRadius: '8px',
                  border: '1.5px solid #a7f3d0',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: '#065f46', fontSize: '0.86rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sparkles size={16} color="#059669" />
                    <span>अस्पतालको EHR तथ्याङ्कबाट स्वचालित हिसाब (1-Click Auto Calculate)</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#047857', marginTop: '2px' }}>
                    वास्तविक बिरामी दर्ता, प्रसूति, खोप र ल्याब रेकर्डबाट DHIS2 सूचकहरू स्वतः भर्नुहोस्
                  </div>
                </div>
                <button
                  type="button"
                  disabled={isAutoCalculatingDhis2}
                  onClick={async () => {
                    setIsAutoCalculatingDhis2(true);
                    try {
                      const calculated = await sectoralApi.autoCalculateDhis2Metrics({
                        fiscalYear: dhis2FormData.fiscalYear,
                        month: dhis2FormData.monthNepali,
                        ward: selectedWard,
                      });
                      setDhis2FormData((prev) => ({
                        ...prev,
                        totalOpdVisits: calculated.totalOpdVisits,
                        maleOpdVisits: calculated.maleOpdVisits,
                        femaleOpdVisits: calculated.femaleOpdVisits,
                        emergencyVisits: calculated.emergencyVisits,
                        firstAncVisits: calculated.firstAncVisits,
                        fourAncProtocolVisits: calculated.fourAncProtocolVisits,
                        institutionalDeliveries: calculated.institutionalDeliveries,
                        pncVisits: calculated.pncVisits,
                        fullyImmunizedChildren: calculated.fullyImmunizedChildren,
                        growthMonitoredChildren: calculated.growthMonitoredChildren,
                      }));
                      alert('अस्पतालको वास्तविक EHR तथ्याङ्कबाट DHIS2 सूचकहरू सफलतापूर्वक हिसाब गरी भरियो !');
                    } catch (err) {
                      alert('स्वचालित हिसाब गर्न सकिएन।');
                    } finally {
                      setIsAutoCalculatingDhis2(false);
                    }
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    backgroundColor: '#059669',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: isAutoCalculatingDhis2 ? 'not-allowed' : 'pointer',
                    opacity: isAutoCalculatingDhis2 ? 0.7 : 1,
                  }}
                >
                  <Sparkles size={14} />
                  <span>{isAutoCalculatingDhis2 ? 'हिसाब गर्दै...' : 'स्वचालित हिसाब भर्नुहोस्'}</span>
                </button>
              </div>

              {/* SECTION 2: OPD SERVICES */}
              <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1.5px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}>
                  २. बहिरङ्ग (OPD) तथा आकस्मिक सेवा
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                      कुल OPD बिरामी
                    </label>
                    <input
                      type="number"
                      className="dt-input"
                      value={dhis2FormData.totalOpdVisits}
                      onChange={(e) => setDhis2FormData({ ...dhis2FormData, totalOpdVisits: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                      पुरुष (Male)
                    </label>
                    <input
                      type="number"
                      className="dt-input"
                      value={dhis2FormData.maleOpdVisits}
                      onChange={(e) => setDhis2FormData({ ...dhis2FormData, maleOpdVisits: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                      महिला (Female)
                    </label>
                    <input
                      type="number"
                      className="dt-input"
                      value={dhis2FormData.femaleOpdVisits}
                      onChange={(e) => setDhis2FormData({ ...dhis2FormData, femaleOpdVisits: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                      आकस्मिक (Emergency)
                    </label>
                    <input
                      type="number"
                      className="dt-input"
                      value={dhis2FormData.emergencyVisits}
                      onChange={(e) => setDhis2FormData({ ...dhis2FormData, emergencyVisits: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: MCH & SAFE MOTHERHOOD */}
              <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1.5px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#15803d', marginBottom: '0.75rem' }}>
                  ३. सुरक्षित मातृत्व तथा प्रजनन स्वास्थ्य (MCH)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                      १ पटक गर्भजाँच (1st ANC)
                    </label>
                    <input
                      type="number"
                      className="dt-input"
                      value={dhis2FormData.firstAncVisits}
                      onChange={(e) => setDhis2FormData({ ...dhis2FormData, firstAncVisits: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                      ४ पटक प्रोटोकल जाँच
                    </label>
                    <input
                      type="number"
                      className="dt-input"
                      value={dhis2FormData.fourAncProtocolVisits}
                      onChange={(e) => setDhis2FormData({ ...dhis2FormData, fourAncProtocolVisits: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                      संस्थागत सुत्केरी
                    </label>
                    <input
                      type="number"
                      className="dt-input"
                      value={dhis2FormData.institutionalDeliveries}
                      onChange={(e) => setDhis2FormData({ ...dhis2FormData, institutionalDeliveries: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                      पूर्ण खोप बालबालिका
                    </label>
                    <input
                      type="number"
                      className="dt-input"
                      value={dhis2FormData.fullyImmunizedChildren}
                      onChange={(e) => setDhis2FormData({ ...dhis2FormData, fullyImmunizedChildren: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4: DISEASE SURVEILLANCE */}
              <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1.5px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#b45309', marginBottom: '0.75rem' }}>
                  ४. महामारी तथा सर्भिलेन्स रोगहरू (Disease Surveillance)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                      झाडापखाला (Diarrhea)
                    </label>
                    <input
                      type="number"
                      className="dt-input"
                      value={dhis2FormData.diarrheaCases}
                      onChange={(e) => setDhis2FormData({ ...dhis2FormData, diarrheaCases: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                      निमोनिया / ARI
                    </label>
                    <input
                      type="number"
                      className="dt-input"
                      value={dhis2FormData.ariPneumoniaCases}
                      onChange={(e) => setDhis2FormData({ ...dhis2FormData, ariPneumoniaCases: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                      उच्च रक्तचाप / मधुमेह
                    </label>
                    <input
                      type="number"
                      className="dt-input"
                      value={dhis2FormData.hypertensionDiabetesCases}
                      onChange={(e) => setDhis2FormData({ ...dhis2FormData, hypertensionDiabetesCases: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                      मानसिक स्वास्थ्य समस्या
                    </label>
                    <input
                      type="number"
                      className="dt-input"
                      value={dhis2FormData.mentalHealthCases}
                      onChange={(e) => setDhis2FormData({ ...dhis2FormData, mentalHealthCases: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '0.5rem', borderTop: '1px solid #e2e8f0' }}>
                <button
                  type="button"
                  onClick={() => setShowDhis2Modal(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#475569',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  रद्द गर्नुहोस्
                </button>
                <button
                  type="submit"
                  disabled={createDhis2Mutation.isPending}
                  style={{
                    padding: '8px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#dc2626',
                    color: '#ffffff',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {createDhis2Mutation.isPending ? 'बचत हुँदैछ...' : '✓ प्रतिवेदन प्रविष्टि गर्नुहोस्'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: MEDICINE STOCK ENTRY ── */}
      {showMedicineModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '560px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1.2rem 1.5rem',
                borderBottom: '1px solid #e2e8f0',
                backgroundColor: '#f0f9ff',
                borderTopLeftRadius: '16px',
                borderTopRightRadius: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '8px', borderRadius: '8px' }}>
                  <Pill size={20} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    नयाँ औषधि मौज्दात थप्नुहोस् (e-LMIS)
                  </h2>
                  <p style={{ fontSize: '0.78rem', color: '#475569', margin: '2px 0 0 0' }}>
                    स्वास्थ्य चौकीका लागि निःशुल्क औषधि प्रविष्टि
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowMedicineModal(false)}
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#475569' }}
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createMedicineMutation.mutate(medicineFormData);
              }}
              style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  औषधिको ब्रान्ड / नाम *
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा: Paracetamol 500mg, Amoxicillin 500mg"
                  className="dt-input"
                  value={medicineFormData.medicineName}
                  onChange={(e) => setMedicineFormData({ ...medicineFormData, medicineName: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    जेनेरिक नाम
                  </label>
                  <input
                    type="text"
                    placeholder="उदा: Paracetamol"
                    className="dt-input"
                    value={medicineFormData.genericName}
                    onChange={(e) => setMedicineFormData({ ...medicineFormData, genericName: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    वर्ग (Category)
                  </label>
                  <select
                    className="dt-input"
                    value={medicineFormData.category}
                    onChange={(e) => setMedicineFormData({ ...medicineFormData, category: e.target.value })}
                  >
                    {getHealthMedCategories().map((cat) => (
                      <option key={cat.id} value={(cat.name || cat.id || '').toLowerCase()}>
                        {cat.nameNepali}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    स्वास्थ्य संस्था
                  </label>
                  <select
                    className="dt-input"
                    value={medicineFormData.healthFacilityName}
                    onChange={(e) => setMedicineFormData({ ...medicineFormData, healthFacilityName: e.target.value })}
                  >
                    {safeFacilities.map((f) => (
                      <option key={f.id} value={f.nameNepali}>
                        {f.nameNepali} (वडा {f.wardNumber})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    एकाइ (Unit)
                  </label>
                  <select
                    className="dt-input"
                    value={medicineFormData.unit}
                    onChange={(e) => setMedicineFormData({ ...medicineFormData, unit: e.target.value })}
                  >
                    {getHealthUnits().map((u) => (
                      <option key={u.id} value={u.nameNepali}>
                        {u.nameNepali} ({u.name})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    मौज्दात संख्या (Quantity)
                  </label>
                  <input
                    type="number"
                    className="dt-input"
                    value={medicineFormData.stockQuantity}
                    onChange={(e) => setMedicineFormData({ ...medicineFormData, stockQuantity: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    म्याद सकिने मिति (Expiry)
                  </label>
                  <input
                    type="text"
                    className="dt-input"
                    placeholder="२०८३/०४/१५"
                    value={medicineFormData.expiryDate}
                    onChange={(e) => setMedicineFormData({ ...medicineFormData, expiryDate: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '0.5rem', borderTop: '1px solid #e2e8f0' }}>
                <button
                  type="button"
                  onClick={() => setShowMedicineModal(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#475569',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  रद्द गर्नुहोस्
                </button>
                <button
                  type="submit"
                  disabled={createMedicineMutation.isPending}
                  style={{
                    padding: '8px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#0284c7',
                    color: '#ffffff',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {createMedicineMutation.isPending ? 'बचत हुँदैछ...' : '✓ मौज्दात सुरक्षित गर्नुहोस्'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── TAB: HOSPITAL MASTER SETTINGS (ONE-TIME SETTINGS) ── */}
      {activeTab === 'settings' && <HealthSettingsTab />}

      {/* ── HOSPITAL MODALS ── */}
      {/* 1. New Patient Registration & OPD Ticketing Modal */}
      <OpdPatientModal
        isOpen={showPatientModal}
        onClose={() => setShowPatientModal(false)}
        onSubmit={(data) => createPatientMutation.mutateAsync(data)}
        onUpdatePatient={(id, data) => updatePatientMutation.mutateAsync({ id, data })}
        existingPatients={safePatients}
        initialMode={patientModalMode}
      />

      {/* 2. Official Printable OPD Ticket Slip Modal */}
      <OpdTicketSlipModal
        patient={selectedTicketPatient}
        onClose={() => setSelectedTicketPatient(null)}
      />

      {/* 3. 15-Bed IPD Ward Admission Modal */}
      <IpdAdmissionModal
        isOpen={showIpdModal}
        onClose={() => setShowIpdModal(false)}
        preSelectedBed={selectedIpdBed}
        admissions={safeIpdAdmissions}
        onSubmit={(data) => admitPatientMutation.mutateAsync(data)}
      />

      {/* 4. IPD Discharge Modal */}
      <IpdDischargeModal
        admission={dischargeAdmission}
        onClose={() => setDischargeAdmission(null)}
        onSubmit={(id, data) => dischargePatientMutation.mutateAsync({ id, data })}
      />

      {/* 5. Laboratory Test Order Modal */}
      <LabOrderModal
        isOpen={showLabOrderModal}
        onClose={() => setShowLabOrderModal(false)}
        onSubmit={(data) => createLabTestMutation.mutateAsync(data)}
      />

      {/* 6. Laboratory Test Results Entry Modal */}
      <LabResultModal
        test={selectedLabForResults}
        onClose={() => setSelectedLabForResults(null)}
        onSubmit={(id, data) => updateLabTestMutation.mutateAsync({ id, data })}
      />

      {/* 7. Health Excel Bulk Import Modal (DHIS2, OPD, Medicines, Facilities) */}
      <HealthExcelImportModal
        isOpen={showHealthExcelModal}
        onClose={() => setShowHealthExcelModal(false)}
        initialTab={healthExcelInitialTab}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['health-facilities'] });
          queryClient.invalidateQueries({ queryKey: ['health-dhis2-reports'] });
          queryClient.invalidateQueries({ queryKey: ['health-dhis2-summary'] });
          queryClient.invalidateQueries({ queryKey: ['health-medicines'] });
          queryClient.invalidateQueries({ queryKey: ['health-patients'] });
        }}
      />

      {/* 8. Health Facility Add / Edit Modal */}
      <HealthFacilityModal
        isOpen={showFacilityModal}
        onClose={() => {
          setShowFacilityModal(false);
          setFacilityToEdit(null);
        }}
        facilityToEdit={facilityToEdit}
        onSave={(data) => saveFacilityMutation.mutateAsync(data)}
        isSubmitting={saveFacilityMutation.isPending}
      />

      {/* 9. Ambulance Add / Edit Modal */}
      <AmbulanceModal
        isOpen={showAmbulanceModal}
        onClose={() => {
          setShowAmbulanceModal(false);
          setAmbulanceToEdit(null);
        }}
        ambulanceToEdit={ambulanceToEdit}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['ambulance-contacts'] });
        }}
      />

      {/* 10. Doctor E-Prescription Modal */}
      <PrescriptionModal
        isOpen={showPrescriptionModal}
        onClose={() => {
          setShowPrescriptionModal(false);
          setSelectedRxPatient(null);
        }}
        patient={selectedRxPatient}
        availableMedicines={safeMedicines}
        onSubmit={(data) => createPrescriptionMutation.mutateAsync(data)}
      />

      {/* 11. 15-Bed IPD Clinical Discharge Summary Slip Modal */}
      <DischargeSummaryModal
        isOpen={showDischargeSummaryModal}
        onClose={() => {
          setShowDischargeSummaryModal(false);
          setSelectedDischargeAdmission(null);
        }}
        admission={selectedDischargeAdmission}
        onSubmit={(data) => createDischargeSummaryMutation.mutateAsync(data)}
      />

      {/* 12. Patient Unified EHR History Timeline Modal */}
      <PatientEhrTimelineModal
        isOpen={showEhrModal}
        onClose={() => {
          setShowEhrModal(false);
          setSelectedEhrPatientNo('');
        }}
        patientNo={selectedEhrPatientNo}
      />

      {/* 13. Patient Registration & Lab Tube Thermal Barcode/QR Sticker Modal */}
      {showPatientStickerModal && (
        <PatientStickerModal
          patient={selectedStickerPatient}
          labTest={selectedStickerLabTest}
          initialSize={selectedStickerLabTest ? '30x20' : '50x30'}
          onClose={() => {
            setShowPatientStickerModal(false);
            setSelectedStickerPatient(null);
            setSelectedStickerLabTest(null);
          }}
        />
      )}

      {/* 14. Pharmacy Point-of-Sale (POS) Billing Modal */}
      {showPosModal && (
        <PharmacyPosModal
          onClose={() => setShowPosModal(false)}
          onSuccess={(saleData) => createPosSaleMutation.mutate(saleData)}
        />
      )}

      {/* 14b. Pharmacy Returns Bill / Sales Refund Modal */}
      <ReturnBillModal
        isOpen={showReturnBillModal}
        onClose={() => setShowReturnBillModal(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['health-pos-sales'] });
          queryClient.invalidateQueries({ queryKey: ['health-medicines'] });
          queryClient.invalidateQueries({ queryKey: ['health-batches'] });
          queryClient.invalidateQueries({ queryKey: ['health-pos-returns'] });
        }}
      />

      {/* 15. Purchase Management & Goods Receipt Note (GRN) Modal */}
      {showPurchaseModal && (
        <PurchaseGrnModal
          onClose={() => setShowPurchaseModal(false)}
          onSuccess={(data) => createPurchaseMutation.mutate(data)}
        />
      )}

      {/* 16. Health Insurance Board (HIB) Claim & Referral Slip Modal */}
      <InsuranceClaimModal
        claim={selectedInsuranceClaim}
        onClose={() => {
          setShowInsuranceModal(false);
          setSelectedInsuranceClaim(null);
        }}
        onUpdateStatus={(claimId, status, reimbursedAmt) =>
          updateInsuranceClaimMutation.mutate({
            id: claimId,
            data: { claimStatus: status, reimbursedAmount: reimbursedAmt },
          })
        }
      />

      {/* 17. Hospital Store Internal Issue & Expired Stock Disposal Modal */}
      {showTransferModal && (
        <StockTransferModal
          onClose={() => setShowTransferModal(false)}
          onSuccess={(data) => createStockTransferMutation.mutate(data)}
        />
      )}

      {/* 18. Nepal MoHP HMIS 9.3 Monthly Health Reporting Sheet Modal */}
      <Dhis2ReportDetailModal
        isOpen={showDhis2DetailModal}
        onClose={() => {
          setShowDhis2DetailModal(false);
          setSelectedDhis2Report(null);
        }}
        report={selectedDhis2Report}
        onSync={(id) => syncDhis2Mutation.mutate(id)}
        isSyncing={syncDhis2Mutation.isPending}
      />
    </div>
  );
};

export default HealthPage;
