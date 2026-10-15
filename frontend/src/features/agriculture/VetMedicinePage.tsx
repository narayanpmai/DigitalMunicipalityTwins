import React, { useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  agricultureApi, 
  VetMedicine, 
  VetDistribution,
  VetAiRecord,
  VetVaccinationRecord,
  VetDiagnosisRecord
} from '../../api/agriculture';
import {
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Pill,
  UserCheck,
  Package,
  Calendar,
  Layers,
  Printer,
  X,
  FileText,
  Clock,
  ShieldCheck,
  TrendingDown,
  Activity,
  HeartPulse,
  Filter,
  ShieldAlert,
  Syringe,
  Stethoscope,
  BadgeCheck,
  Sparkles,
  Eye
} from 'lucide-react';
import './agriculture-pro.css';

const ANIMAL_TYPES = [
  { label: 'गाई (Cow)', icon: '🐄' },
  { label: 'भैंसी (Buffalo)', icon: '🐃' },
  { label: 'बाख्रा (Goat)', icon: '🐐' },
  { label: 'याक / चौँरी (Yak/Chauri)', icon: '🐂' },
  { label: 'भेडा (Sheep)', icon: '🐑' },
  { label: 'कुखुरा / हाँस (Poultry)', icon: '🐔' },
  { label: 'सुँगुर / बङ्गुर (Pig)', icon: '🐖' },
  { label: 'कुकुर / अन्य (Canine/Other)', icon: '🐕' }
];

const INITIAL_AI_RECORDS: VetAiRecord[] = [
  { 
    id: 'AI-2081-01', 
    farmerName: 'सुवास तामाङ', 
    contactPhone: '9841234567', 
    wardNumber: 3, 
    animalType: 'गाई (Cow)', 
    breed: 'होलिस्टिन फ्रिजियन (HF 75%)', 
    strawNumber: 'NLDB-HF-9812', 
    aiDateBs: '२०८१/०६/१०', 
    expectedCalvingDateBs: '२०८२/०३/१८', 
    technicianName: 'रामेश्वर थापा (पशु प्राविधिक)', 
    status: 'सफल (Confirmed)', 
    remarks: 'पहिलो प्रयासमै गर्भधारण सफल' 
  },
  { 
    id: 'AI-2081-02', 
    farmerName: 'पासाङ ल्हामु शेर्पा', 
    contactPhone: '9861987654', 
    wardNumber: 1, 
    animalType: 'चौँरी (Chauri)', 
    breed: 'अल्पाइन याक क्रस', 
    strawNumber: 'YAK-ST-4421', 
    aiDateBs: '२०८१/०५/२४', 
    expectedCalvingDateBs: '२०८२/०२/२८', 
    technicianName: 'सोनाम लामा (जेटीए)', 
    status: 'निरीक्षण बाँकी (Pending)', 
    remarks: 'गर्भ परीक्षण बाँकी' 
  },
  { 
    id: 'AI-2081-03', 
    farmerName: 'केशव पराजुली', 
    contactPhone: '9851123456', 
    wardNumber: 6, 
    animalType: 'भैंसी (Buffalo)', 
    breed: 'मुर्रा नश्ल (Murrah)', 
    strawNumber: 'MUR-BUF-119', 
    aiDateBs: '२०८१/०६/०२', 
    expectedCalvingDateBs: '२०८२/०४/१५', 
    technicianName: 'रामेश्वर थापा (पशु प्राविधिक)', 
    status: 'पुनः गर्भाधान आवश्यक (Repeat)', 
    remarks: 'दोस्रो पटक आवश्यक' 
  }
];

const INITIAL_VACCINE_RECORDS: VetVaccinationRecord[] = [
  { 
    id: 'VAC-2081-101', 
    vaccineName: 'पीपीआर (PPR) विरुद्धको खोप', 
    earTagNumber: 'NP-PKT-81-00214', 
    animalType: 'बाख्रा (Goat)', 
    farmerName: 'दलबहादुर तामाङ', 
    wardNumber: 4, 
    vaccinatedDateBs: '२०८१/०५/१५', 
    boosterDueDateBs: '२०८२/०५/१५', 
    batchNumber: 'PPR-B881', 
    technicianName: 'गोविन्द अधिकारी (भेटेरिनरी जेटीए)', 
    status: 'सम्पन्न (Completed)' 
  },
  { 
    id: 'VAC-2081-102', 
    vaccineName: 'खोरेत (FMD) रोग विरुद्धको खोप', 
    earTagNumber: 'NP-PKT-81-00318', 
    animalType: 'गाई (Cow)', 
    farmerName: 'मैया श्रेष्ठ', 
    wardNumber: 2, 
    vaccinatedDateBs: '२०८१/०६/०१', 
    boosterDueDateBs: '२०८१/१२/०१', 
    batchNumber: 'FMD-K42', 
    technicianName: 'रामेश्वर थापा (पशु प्राविधिक)', 
    status: 'बूस्टर बाँकी (Booster Due)' 
  },
  { 
    id: 'VAC-2081-103', 
    vaccineName: 'रेबिज (Anti-Rabies) खोप अभियान', 
    earTagNumber: 'NP-PKT-81-00445', 
    animalType: 'कुकुर (Canine)', 
    farmerName: 'सामुदायिक / टोल स्तर', 
    wardNumber: 5, 
    vaccinatedDateBs: '२०८१/०६/०५', 
    boosterDueDateBs: '२०८२/०६/०५', 
    batchNumber: 'RAB-9901', 
    technicianName: 'सोनाम लामा (जेटीए)', 
    status: 'सम्पन्न (Completed)' 
  },
  { 
    id: 'VAC-2081-104', 
    vaccineName: 'लम्पि स्किन (LSD) विरुद्धको खोप', 
    earTagNumber: 'NP-PKT-81-00512', 
    animalType: 'भैंसी (Buffalo)', 
    farmerName: 'चक्र बहादुर खड्का', 
    wardNumber: 7, 
    vaccinatedDateBs: '२०८१/०५/२८', 
    boosterDueDateBs: '२०८२/०५/२८', 
    batchNumber: 'LSD-N81', 
    technicianName: 'रामेश्वर थापा (पशु प्राविधिक)', 
    status: 'सम्पन्न (Completed)' 
  }
];

const INITIAL_DIAGNOSIS_RECORDS: VetDiagnosisRecord[] = [
  { 
    id: 'DX-2081-201', 
    farmerName: 'तेन्जिङ शेर्पा', 
    wardNumber: 1, 
    animalType: 'चौँरी (Chauri)', 
    symptoms: 'उच्च ज्वरो, कडा सास फेर्ने, नाकबाट सिँगान बग्ने', 
    suspectedDisease: 'हेमोरेजिक सेप्टिसेमिया (HS)', 
    prescribedMedicine: 'अक्सिटेट्रासाइक्लिन (Oxytetracycline) + प्यारासिटामोल', 
    dosageInstructions: 'दैनिक २० मिली मांसपेशीमा ३ दिनसम्म', 
    doctorTechnician: 'डा. सञ्जय श्रेष्ठ (पशु चिकित्सक)', 
    dateBs: '२०८१/०६/१०', 
    status: 'उपचार जारी (Under Treatment)' 
  },
  { 
    id: 'DX-2081-202', 
    farmerName: 'कमला भण्डारी', 
    wardNumber: 5, 
    animalType: 'गाई (Cow)', 
    symptoms: 'थुन सुन्निएको, दुधमा रगत/पिँप मिसिएको', 
    suspectedDisease: 'म्यास्टाइटिस (Mastitis / थुनेलो)', 
    prescribedMedicine: 'इन्ट्राम्यामारी ट्युब + एन्टिबायोटिक पेन्सिलिन', 
    dosageInstructions: 'बिहान-बेलुका थुन सफा गरी ट्युब चढाउने', 
    doctorTechnician: 'रामेश्वर थापा (पशु प्राविधिक)', 
    dateBs: '२०८१/०६/०८', 
    status: 'निको भएको (Recovered)' 
  }
];

export interface VetMedicinePageProps {
  isPublic?: boolean;
}

export const VetMedicinePage: React.FC<VetMedicinePageProps> = ({ isPublic }) => {
  const location = useLocation();
  const isPublicView = isPublic !== undefined ? isPublic : !location.pathname.startsWith('/app');
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'stock' | 'distribution' | 'ai' | 'vaccination' | 'diagnosis'>('stock');
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'adequate' | 'expired'>('all');
  const [wardFilter, setWardFilter] = useState<number>(0);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDistributeModal, setShowDistributeModal] = useState(false);
  const [showStockAdjustModal, setShowStockAdjustModal] = useState<VetMedicine | null>(null);
  const [selectedSlipDist, setSelectedSlipDist] = useState<VetDistribution | null>(null);

  // New Modals for Phase-1
  const [showAiModal, setShowAiModal] = useState(false);
  const [showVaccineModal, setShowVaccineModal] = useState(false);
  const [showDiagnosisModal, setShowDiagnosisModal] = useState(false);
  const [selectedDiagnosisSlip, setSelectedDiagnosisSlip] = useState<VetDiagnosisRecord | null>(null);

  // Local Storage Fallback Datasets
  const [localAiRecords, setLocalAiRecords] = useState<VetAiRecord[]>(() => {
    const saved = localStorage.getItem('vet_ai_records');
    return saved ? JSON.parse(saved) : INITIAL_AI_RECORDS;
  });

  const [localVaccineRecords, setLocalVaccineRecords] = useState<VetVaccinationRecord[]>(() => {
    const saved = localStorage.getItem('vet_vaccine_records');
    return saved ? JSON.parse(saved) : INITIAL_VACCINE_RECORDS;
  });

  const [localDiagnosisRecords, setLocalDiagnosisRecords] = useState<VetDiagnosisRecord[]>(() => {
    const saved = localStorage.getItem('vet_diagnosis_records');
    return saved ? JSON.parse(saved) : INITIAL_DIAGNOSIS_RECORDS;
  });

  // Save to localStorage
  React.useEffect(() => {
    localStorage.setItem('vet_ai_records', JSON.stringify(localAiRecords));
  }, [localAiRecords]);

  React.useEffect(() => {
    localStorage.setItem('vet_vaccine_records', JSON.stringify(localVaccineRecords));
  }, [localVaccineRecords]);

  React.useEffect(() => {
    localStorage.setItem('vet_diagnosis_records', JSON.stringify(localDiagnosisRecords));
  }, [localDiagnosisRecords]);

  // Toast
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // States for Stock
  const [newMedicine, setNewMedicine] = useState<Partial<VetMedicine>>({
    stockQuantity: 50,
    unit: 'भाइल (Vials)',
  });

  // States for Distribution
  const [distributionData, setDistributionData] = useState<Partial<VetDistribution>>({
    animalType: 'गाई (Cow)',
    quantityGiven: 1,
    distributedDate: new Date().toISOString().slice(0, 10),
  });

  // Form state for AI
  const [newAi, setNewAi] = useState<Partial<VetAiRecord>>({
    farmerName: '',
    contactPhone: '',
    wardNumber: 1,
    animalType: 'गाई (Cow)',
    breed: 'होलिस्टिन फ्रिजियन',
    strawNumber: 'NLDB-',
    aiDateBs: '२०८१/०६/१५',
    expectedCalvingDateBs: '२०८२/०३/२५',
    technicianName: 'रामेश्वर थापा (पशु प्राविधिक)',
    status: 'निरीक्षण बाँकी (Pending)',
    remarks: ''
  });

  // Form state for Vaccine
  const [newVaccine, setNewVaccine] = useState<Partial<VetVaccinationRecord>>({
    vaccineName: 'पीपीआर (PPR) विरुद्धको खोप',
    earTagNumber: 'NP-PKT-81-',
    animalType: 'बाख्रा (Goat)',
    farmerName: '',
    wardNumber: 1,
    vaccinatedDateBs: '२०८१/०६/१५',
    boosterDueDateBs: '२०८२/०६/१५',
    batchNumber: 'VAC-',
    technicianName: 'गोविन्द अधिकारी (भेटेरिनरी जेटीए)',
    status: 'सम्पन्न (Completed)'
  });

  // Form state for Diagnosis
  const [newDiagnosis, setNewDiagnosis] = useState<Partial<VetDiagnosisRecord>>({
    farmerName: '',
    wardNumber: 1,
    animalType: 'गाई (Cow)',
    symptoms: '',
    suspectedDisease: '',
    prescribedMedicine: '',
    dosageInstructions: '',
    doctorTechnician: 'डा. सञ्जय श्रेष्ठ (पशु चिकित्सक)',
    dateBs: '२०८१/०६/१५',
    status: 'उपचार जारी (Under Treatment)'
  });

  // States for Quick Stock Adjust
  const [adjustAmount, setAdjustAmount] = useState<number>(10);
  const [adjustType, setAdjustType] = useState<'add' | 'reduce'>('add');

  React.useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const { data: medicines = [], isLoading: loadingMedicines } = useQuery({
    queryKey: ['vet-medicines'],
    queryFn: agricultureApi.getMedicines,
  });

  const { data: distributions = [], isLoading: loadingDistributions } = useQuery({
    queryKey: ['vet-distributions'],
    queryFn: agricultureApi.getDistributions,
  });

  const addMedicineMutation = useMutation({
    mutationFn: agricultureApi.createMedicine,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vet-medicines'] });
      setShowAddModal(false);
      setNewMedicine({ stockQuantity: 50, unit: 'भाइल (Vials)' });
      setToastMessage({ type: 'success', text: 'नयाँ भेटेरिनरी औषधि सफलतापूर्वक दर्ता गरियो!' });
    },
    onError: (err: any) => {
      setToastMessage({ type: 'error', text: 'त्रुटि: ' + (err.message || 'औषधि थप्न सकिएन') });
    }
  });

  const distributeMutation = useMutation({
    mutationFn: agricultureApi.distributeMedicine,
    onSuccess: (newDist) => {
      queryClient.invalidateQueries({ queryKey: ['vet-medicines'] });
      queryClient.invalidateQueries({ queryKey: ['vet-distributions'] });
      setShowDistributeModal(false);
      setToastMessage({ type: 'success', text: 'कृषकलाई औषधि वितरण रेकर्ड सम्पन्न भयो!' });
      if (newDist) {
        setSelectedSlipDist(newDist);
      }
      setDistributionData({
        animalType: 'गाई (Cow)',
        quantityGiven: 1,
        distributedDate: new Date().toISOString().slice(0, 10),
      });
    },
    onError: (err: any) => {
      setToastMessage({ type: 'error', text: 'त्रुटि: ' + (err.response?.data?.message || err.message) });
    }
  });

  const adjustStockMutation = useMutation({
    mutationFn: ({ id, amount, type }: { id: string; amount: number; type: 'add' | 'reduce' }) =>
      agricultureApi.updateStock(id, amount, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vet-medicines'] });
      setShowStockAdjustModal(null);
      setToastMessage({ type: 'success', text: 'स्टक मौज्दात सफलतापूर्वक समायोजन गरियो!' });
    },
    onError: (err: any) => {
      setToastMessage({ type: 'error', text: 'त्रुटि: ' + (err.message || 'स्टक समायोजन गर्न सकिएन') });
    }
  });

  const { data: dbAiRecords = [] } = useQuery({
    queryKey: ['vet-ai-records'],
    queryFn: () => agricultureApi.getAiRecords(),
  });

  const { data: dbVaccineRecords = [] } = useQuery({
    queryKey: ['vet-vaccine-records'],
    queryFn: () => agricultureApi.getVaccineRecords(),
  });

  const { data: dbDiagnosisRecords = [] } = useQuery({
    queryKey: ['vet-diagnosis-records'],
    queryFn: () => agricultureApi.getDiagnosisRecords(),
  });

  const aiRecords = useMemo(() => {
    return (dbAiRecords && dbAiRecords.length > 0) ? dbAiRecords : localAiRecords;
  }, [dbAiRecords, localAiRecords]);

  const vaccineRecords = useMemo(() => {
    return (dbVaccineRecords && dbVaccineRecords.length > 0) ? dbVaccineRecords : localVaccineRecords;
  }, [dbVaccineRecords, localVaccineRecords]);

  const diagnosisRecords = useMemo(() => {
    return (dbDiagnosisRecords && dbDiagnosisRecords.length > 0) ? dbDiagnosisRecords : localDiagnosisRecords;
  }, [dbDiagnosisRecords, localDiagnosisRecords]);

  const addAiMutation = useMutation({
    mutationFn: agricultureApi.createAiRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vet-ai-records'] });
    }
  });

  const addVaccineMutation = useMutation({
    mutationFn: agricultureApi.createVaccineRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vet-vaccine-records'] });
    }
  });

  const addDiagnosisMutation = useMutation({
    mutationFn: agricultureApi.createDiagnosisRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vet-diagnosis-records'] });
    }
  });

  // KPIs
  const totalSkus = medicines.length;
  const lowStockCount = useMemo(() => {
    return medicines.filter(m => m.stockQuantity < 10).length;
  }, [medicines]);

  const expiringSoonCount = useMemo(() => {
    const now = new Date();
    const thirtyDaysAhead = new Date();
    thirtyDaysAhead.setDate(now.getDate() + 45);
    return medicines.filter(m => {
      if (!m.expiryDate) return false;
      const exp = new Date(m.expiryDate);
      return exp <= thirtyDaysAhead;
    }).length;
  }, [medicines]);

  const totalBeneficiaries = distributions.length;

  // Filtered Medicines
  const filteredMedicines = useMemo(() => {
    return medicines.filter(m => {
      const matchSearch = !searchTerm ||
        m.medicineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.batchNumber && m.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!matchSearch) return false;

      if (stockFilter === 'low') return m.stockQuantity < 10;
      if (stockFilter === 'adequate') return m.stockQuantity >= 10;
      if (stockFilter === 'expired') {
        if (!m.expiryDate) return false;
        return new Date(m.expiryDate) <= new Date();
      }
      return true;
    });
  }, [medicines, searchTerm, stockFilter]);

  // Filtered Distributions
  const filteredDistributions = useMemo(() => {
    return distributions.filter(d => {
      if (!searchTerm) return true;
      return (
        d.farmerId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.medicine?.medicineName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.animalType?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [distributions, searchTerm]);

  // Filtered AI Records
  const filteredAiRecords = useMemo(() => {
    return aiRecords.filter(r => {
      const matchWard = !wardFilter || r.wardNumber === wardFilter;
      const matchSearch = !searchTerm ||
        r.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.strawNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.animalType.toLowerCase().includes(searchTerm.toLowerCase());
      return matchWard && matchSearch;
    });
  }, [aiRecords, searchTerm, wardFilter]);

  // Filtered Vaccine Records
  const filteredVaccineRecords = useMemo(() => {
    return vaccineRecords.filter(r => {
      const matchWard = !wardFilter || r.wardNumber === wardFilter;
      const matchSearch = !searchTerm ||
        r.earTagNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.vaccineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.animalType.toLowerCase().includes(searchTerm.toLowerCase());
      return matchWard && matchSearch;
    });
  }, [vaccineRecords, searchTerm, wardFilter]);

  // Filtered Diagnosis Records
  const filteredDiagnosisRecords = useMemo(() => {
    return diagnosisRecords.filter(r => {
      const matchWard = !wardFilter || r.wardNumber === wardFilter;
      const matchSearch = !searchTerm ||
        r.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.suspectedDisease.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.symptoms.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.prescribedMedicine.toLowerCase().includes(searchTerm.toLowerCase());
      return matchWard && matchSearch;
    });
  }, [diagnosisRecords, searchTerm, wardFilter]);

  return (
    <div className="gov-content-wrapper" style={{ padding: '0.5rem 0', width: '100%', boxSizing: 'border-box' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '24px',
            zIndex: 9999,
            backgroundColor: toastMessage.type === 'success' ? '#064e3b' : '#991b1b',
            color: '#ffffff',
            padding: '0.9rem 1.35rem',
            borderRadius: '12px',
            boxShadow: '0 15px 35px rgba(0,0,0,0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.8rem',
            fontWeight: 700,
            fontSize: '0.9rem',
            border: '1px solid rgba(255,255,255,0.2)',
          }}
        >
          {toastMessage.type === 'success' ? <CheckCircle2 size={20} className="text-emerald-400" /> : <AlertTriangle size={20} className="text-red-300" />}
          <span>{toastMessage.text}</span>
          <button
            onClick={() => setToastMessage(null)}
            style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', marginLeft: '0.5rem' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* COMMAND CENTER HERO BANNER */}
      <div className="agri-hero-banner" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 45%, #0284c7 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', position: 'relative', zIndex: 2 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.55rem', flexWrap: 'wrap' }}>
              <span className="agri-telemetry-badge" style={{ background: 'rgba(255, 255, 255, 0.15)', color: '#bfdbfe' }}>
                <span className="agri-pulse-dot" style={{ backgroundColor: '#60a5fa', boxShadow: '0 0 8px #60a5fa' }}></span>
                भेटेरिनरी अस्पताल, खोप तथा नश्ल सुधार कमाण्ड सेन्टर
              </span>
              <span style={{ fontSize: '0.78rem', color: '#93c5fd', fontWeight: 600 }}>
                नेपाल सरकार • पाँचपोखरी थाङपाल गाउँ कार्यपालिका • पशु सेवा शाखा
              </span>
            </div>

            <h1 style={{ fontSize: '1.9rem', fontWeight: 900, margin: 0, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#ffffff' }}>
              <Pill size={36} className="text-sky-300" />
              भेटेरिनरी अस्पताल, खोप अभियान तथा पशु स्वास्थ्य प्रणाली
            </h1>
            <p style={{ fontSize: '0.92rem', color: '#dbeafe', margin: '0.5rem 0 0', maxWidth: '860px', lineHeight: 1.5 }}>
              औषधि भण्डारण, कृषकलाई निःशुल्क वितरण, कृत्रिम गर्भाधान (AI लगत), खोप अभियान (PPR, FMD, LSD) तथा डिजिटल स्वास्थ्य परीक्षण पुर्जी
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {isPublicView ? (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem 1.25rem',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(8px)',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.86rem',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                }}
              >
                <Eye size={18} /> सार्वजनिक खुला दृश्य (Public Read-Only View)
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setShowAiModal(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.65rem 1.15rem',
                    borderRadius: '10px',
                    background: '#8b5cf6',
                    color: '#ffffff',
                    fontWeight: 900,
                    fontSize: '0.86rem',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(139, 92, 246, 0.4)',
                  }}
                >
                  <Sparkles size={17} /> 🧬 नयाँ AI दर्ता
                </button>
                <button
                  type="button"
                  onClick={() => setShowVaccineModal(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.65rem 1.15rem',
                    borderRadius: '10px',
                    background: '#0284c7',
                    color: '#ffffff',
                    fontWeight: 900,
                    fontSize: '0.86rem',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)',
                  }}
                >
                  <Syringe size={17} /> 💉 नयाँ खोप दर्ता
                </button>
                <button
                  type="button"
                  onClick={() => setShowDiagnosisModal(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.65rem 1.15rem',
                    borderRadius: '10px',
                    background: '#059669',
                    color: '#ffffff',
                    fontWeight: 900,
                    fontSize: '0.86rem',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(5, 150, 105, 0.4)',
                  }}
                >
                  <Stethoscope size={17} /> 🩺 नयाँ पुर्जी
                </button>
                <button
                  type="button"
                  onClick={() => setShowDistributeModal(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.65rem 1.15rem',
                    borderRadius: '10px',
                    background: '#10b981',
                    color: '#ffffff',
                    fontWeight: 900,
                    fontSize: '0.86rem',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
                  }}
                >
                  <UserCheck size={17} /> औषधि वितरण
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.65rem 1.15rem',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.95)',
                    color: '#1e40af',
                    fontWeight: 900,
                    fontSize: '0.86rem',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  }}
                >
                  <Plus size={17} /> औषधि थप्नुहोस्
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* GLOWING KPI CARDS ROW */}
      <div className="agri-kpi-grid">
        <div className="agri-kpi-glow-card" style={{ '--kpi-accent': '#2563eb' } as any}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b' }}>कुल औषधि प्रकार (SKUs)</div>
              <div className="agri-kpi-value-text" style={{ marginTop: '4px', color: '#1e40af' }}>{totalSkus}</div>
            </div>
            <div className="agri-kpi-icon-wrap" style={{ '--icon-bg': '#eff6ff', '--icon-color': '#2563eb', '--icon-shadow': 'rgba(37, 99, 235, 0.2)' } as any}>
              <Package size={24} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '0.85rem', fontSize: '0.78rem' }}>
            <span className="agri-badge agri-badge-info">केन्द्रीय भण्डार</span>
            <span style={{ color: '#64748b' }}>सबै उपशाखा उपलब्ध</span>
          </div>
        </div>

        <div className="agri-kpi-glow-card" style={{ '--kpi-accent': lowStockCount > 0 ? '#ef4444' : '#10b981' } as any}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b' }}>न्यून स्टक चेतावनी (&lt; १०)</div>
              <div className="agri-kpi-value-text" style={{ marginTop: '4px', color: lowStockCount > 0 ? '#dc2626' : '#059669' }}>
                {lowStockCount}
              </div>
            </div>
            <div className="agri-kpi-icon-wrap" style={{ '--icon-bg': lowStockCount > 0 ? '#fef2f2' : '#ecfdf5', '--icon-color': lowStockCount > 0 ? '#dc2626' : '#059669', '--icon-shadow': 'rgba(220, 38, 38, 0.2)' } as any}>
              <AlertTriangle size={24} />
            </div>
          </div>
          <div style={{ marginTop: '0.85rem', fontSize: '0.78rem', color: '#64748b' }}>
            {lowStockCount > 0 ? 'तत्काल खरिद अर्डर आवश्यक' : 'पर्याप्त मौज्दात स्थिति'}
          </div>
        </div>

        <div className="agri-kpi-glow-card" style={{ '--kpi-accent': '#d97706' } as any}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b' }}>म्याद सकिन लागेका औषधि</div>
              <div className="agri-kpi-value-text" style={{ marginTop: '4px', color: expiringSoonCount > 0 ? '#b45309' : '#0f172a' }}>
                {expiringSoonCount}
              </div>
            </div>
            <div className="agri-kpi-icon-wrap" style={{ '--icon-bg': '#fffbeb', '--icon-color': '#d97706', '--icon-shadow': 'rgba(217, 119, 6, 0.2)' } as any}>
              <Clock size={24} />
            </div>
          </div>
          <div style={{ marginTop: '0.85rem', fontSize: '0.78rem', color: '#64748b' }}>
            आगामी ४५ दिनभित्र म्याद सकिने
          </div>
        </div>

        <div className="agri-kpi-glow-card" style={{ '--kpi-accent': '#10b981' } as any}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b' }}>उपचार तथा वितरण संख्या</div>
              <div className="agri-kpi-value-text" style={{ marginTop: '4px', color: '#047857' }}>{totalBeneficiaries}</div>
            </div>
            <div className="agri-kpi-icon-wrap" style={{ '--icon-bg': '#ecfdf5', '--icon-color': '#059669', '--icon-shadow': 'rgba(5, 150, 105, 0.2)' } as any}>
              <HeartPulse size={24} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '0.85rem', fontSize: '0.78rem' }}>
            <span className="agri-badge agri-badge-success">निःशुल्क सेवा</span>
            <span style={{ color: '#64748b' }}>८ वटै वडाका कृषक</span>
          </div>
        </div>
      </div>

      {/* TABS & SEARCH RIBBON */}
      <div className="agri-glass-card" style={{ padding: '0.75rem 1rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div className="agri-tab-ribbon" style={{ overflowX: 'auto', display: 'flex', gap: '0.4rem' }}>
            <button
              type="button"
              onClick={() => setActiveTab('stock')}
              className={`agri-tab-pill ${activeTab === 'stock' ? 'active' : ''}`}
              style={activeTab === 'stock' ? { background: '#1e40af', color: '#ffffff' } : {}}
            >
              <Package size={16} /> औषधि मौज्दात (Stock)
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('distribution')}
              className={`agri-tab-pill ${activeTab === 'distribution' ? 'active' : ''}`}
              style={activeTab === 'distribution' ? { background: '#1e40af', color: '#ffffff' } : {}}
            >
              <FileText size={16} /> वितरण अभिलेख (Log)
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('ai')}
              className={`agri-tab-pill ${activeTab === 'ai' ? 'active' : ''}`}
              style={activeTab === 'ai' ? { background: '#7c3aed', color: '#ffffff' } : {}}
            >
              <Sparkles size={16} /> कृत्रिम गर्भाधान (AI - {aiRecords.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('vaccination')}
              className={`agri-tab-pill ${activeTab === 'vaccination' ? 'active' : ''}`}
              style={activeTab === 'vaccination' ? { background: '#0284c7', color: '#ffffff' } : {}}
            >
              <Syringe size={16} /> खोप अभियान ({vaccineRecords.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('diagnosis')}
              className={`agri-tab-pill ${activeTab === 'diagnosis' ? 'active' : ''}`}
              style={activeTab === 'diagnosis' ? { background: '#059669', color: '#ffffff' } : {}}
            >
              <Stethoscope size={16} /> उपचार तथा पुर्जी ({diagnosisRecords.length})
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: '200px' }}>
              <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="खोज्नुहोस्..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.45rem 0.75rem 0.45rem 2rem',
                  borderRadius: '8px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.82rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <select
              value={wardFilter}
              onChange={(e) => setWardFilter(parseInt(e.target.value) || 0)}
              style={{
                padding: '0.45rem 0.75rem',
                borderRadius: '8px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.82rem',
                fontWeight: 700,
                outline: 'none',
              }}
            >
              <option value={0}>सबै वडा (All Wards)</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(w => (
                <option key={w} value={w}>वडा नं. {w}</option>
              ))}
            </select>

            {activeTab === 'stock' && (
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value as any)}
                style={{
                  padding: '0.45rem 0.75rem',
                  borderRadius: '8px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  outline: 'none',
                }}
              >
                <option value="all">सबै अवस्था (All Status)</option>
                <option value="adequate">पर्याप्त स्टक (Adequate)</option>
                <option value="low">न्यून स्टक (&lt; १०)</option>
                <option value="expired">म्याद सकिएको (Expired)</option>
              </select>
            )}
          </div>
        </div>
      </div>

      {/* TAB 1: MEDICINE STOCK TABLE */}
      {activeTab === 'stock' && (
        <div className="agri-glass-card" style={{ padding: 0 }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="agri-pro-table">
              <thead>
                <tr>
                  <th>औषधिको नाम</th>
                  <th>ब्याच नं.</th>
                  <th>मौज्दात थर्मोमिटर</th>
                  <th>संख्या / इकाई</th>
                  <th>म्याद सकिने मिति</th>
                  <th>अवस्था</th>
                  <th style={{ textAlign: 'center' }}>{isPublicView ? 'उपलब्धता स्थिति' : 'कार्य (Actions)'}</th>
                </tr>
              </thead>
              <tbody>
                {loadingMedicines ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '3.5rem 1rem', textAlign: 'center', color: '#64748b' }}>
                      औषधि लोड हुँदैछ...
                    </td>
                  </tr>
                ) : filteredMedicines.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '3.5rem 1rem', textAlign: 'center', color: '#64748b' }}>
                      कुनै औषधि फेला परेन।
                    </td>
                  </tr>
                ) : (
                  filteredMedicines.map((med) => {
                    const isLowStock = med.stockQuantity < 10;
                    const isExpired = med.expiryDate && new Date(med.expiryDate) <= new Date();
                    const meterPct = Math.min(100, Math.max(8, (med.stockQuantity / 100) * 100));
                    const meterColor = isExpired ? '#ef4444' : isLowStock ? '#f59e0b' : '#10b981';

                    return (
                      <tr key={med.id}>
                        <td style={{ fontWeight: 800, color: '#0f172a' }}>{med.medicineName}</td>
                        <td style={{ color: '#475569', fontFamily: 'monospace' }}>{med.batchNumber || '-'}</td>
                        <td style={{ width: '160px' }}>
                          <div style={{ width: '100%', height: '8px', borderRadius: '999px', background: '#e2e8f0', overflow: 'hidden' }}>
                            <div style={{ width: `${meterPct}%`, height: '100%', backgroundColor: meterColor, borderRadius: '999px', transition: 'width 0.4s' }} />
                          </div>
                        </td>
                        <td style={{ fontWeight: 900, fontSize: '0.95rem', color: isLowStock ? '#dc2626' : '#059669' }}>
                          {med.stockQuantity} {med.unit}
                        </td>
                        <td style={{ color: '#475569' }}>
                          {med.expiryDate ? new Date(med.expiryDate).toLocaleDateString('ne-NP') : '-'}
                        </td>
                        <td>
                          {isExpired ? (
                            <span className="agri-badge agri-badge-danger">म्याद सकिएको</span>
                          ) : isLowStock ? (
                            <span className="agri-badge agri-badge-warning">⚠️ न्यून स्टक</span>
                          ) : (
                            <span className="agri-badge agri-badge-success">✓ पर्याप्त</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {isPublicView ? (
                            <span className="agri-badge agri-badge-info" style={{ fontSize: '0.78rem' }}>
                              {med.stockQuantity > 0 ? '✓ उपलब्ध' : 'हाल अपर्याप्त'}
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setShowStockAdjustModal(med)}
                              style={{
                                padding: '4px 11px',
                                borderRadius: '6px',
                                border: '1.5px solid #cbd5e1',
                                background: '#ffffff',
                                fontSize: '0.78rem',
                                fontWeight: 800,
                                cursor: 'pointer',
                                color: '#1e40af'
                              }}
                            >
                              स्टक समायोजन (+/-)
                            </button>
                          )}
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

      {/* TAB 2: DISTRIBUTION LOG TABLE */}
      {activeTab === 'distribution' && (
        <div className="agri-glass-card" style={{ padding: 0 }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="agri-pro-table">
              <thead>
                <tr>
                  <th>वितरण मिति</th>
                  <th>कृषक संकेत / नाम</th>
                  <th>औषधिको नाम</th>
                  <th>मात्रा</th>
                  <th>पशुको प्रकार</th>
                  <th>कैफियत / लक्षण</th>
                  <th style={{ textAlign: 'center' }}>पुर्जी (Slip)</th>
                </tr>
              </thead>
              <tbody>
                {loadingDistributions ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '3.5rem 1rem', textAlign: 'center', color: '#64748b' }}>
                      वितरण लग लोड हुँदैछ...
                    </td>
                  </tr>
                ) : filteredDistributions.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '3.5rem 1rem', textAlign: 'center', color: '#64748b' }}>
                      कुनै वितरण रेकर्ड फेला परेन।
                    </td>
                  </tr>
                ) : (
                  filteredDistributions.map((dist) => (
                    <tr key={dist.id}>
                      <td style={{ color: '#475569' }}>
                        {dist.distributedDate ? new Date(dist.distributedDate).toLocaleDateString('ne-NP') : '-'}
                      </td>
                      <td style={{ fontWeight: 800, color: '#1e40af' }}>{dist.farmerId}</td>
                      <td style={{ fontWeight: 800, color: '#0f172a' }}>{dist.medicine?.medicineName}</td>
                      <td style={{ fontWeight: 900, color: '#047857' }}>
                        {dist.quantityGiven} {dist.medicine?.unit}
                      </td>
                      <td>
                        <span style={{ padding: '3px 8px', borderRadius: '6px', backgroundColor: '#f1f5f9', fontSize: '0.78rem', fontWeight: 700 }}>
                          {dist.animalType}
                        </span>
                      </td>
                      <td style={{ color: '#64748b', fontSize: '0.82rem' }}>{dist.remarks || '-'}</td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => setSelectedSlipDist(dist)}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '6px',
                            border: '1.5px solid #bfdbfe',
                            background: '#eff6ff',
                            fontSize: '0.78rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            color: '#1d4ed8',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Printer size={14} /> पुर्जी प्रिन्ट
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

      {/* TAB 3: ARTIFICIAL INSEMINATION (AI) RECORDS */}
      {activeTab === 'ai' && (
        <div className="agri-glass-card" style={{ padding: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={20} className="text-purple-600" />
                पशु नश्ल सुधार तथा कृत्रिम गर्भाधान (AI) अभिलेख
              </h3>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                गाई, भैंसी तथा चौँरीको उन्नत नश्ल विकास, सिमेन स्ट्र ट्र्याकिङ र अनुमानित ब्याउने मिति निगरानी
              </div>
            </div>

            {!isPublicView && (
              <button
                type="button"
                onClick={() => setShowAiModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.55rem 1.1rem',
                  borderRadius: '8px',
                  background: '#7c3aed',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.84rem',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)'
                }}
              >
                <Plus size={16} /> नयाँ कृत्रिम गर्भाधान दर्ता
              </button>
            )}
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="agri-pro-table">
              <thead>
                <tr>
                  <th>सिमेन स्ट्र नं.</th>
                  <th>कृषकको नाम / वडा</th>
                  <th>पशुको प्रकार र नश्ल</th>
                  <th>गर्भाधान मिति</th>
                  <th>अनुमानित ब्याउने मिति</th>
                  <th>प्राविधिक / JTA</th>
                  <th style={{ textAlign: 'center' }}>नतिजा / स्थिति</th>
                  <th style={{ textAlign: 'center' }}>{isPublicView ? 'प्रमाणीकरण' : 'कार्य'}</th>
                </tr>
              </thead>
              <tbody>
                {filteredAiRecords.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '3.5rem 1rem', textAlign: 'center', color: '#64748b' }}>
                      कुनै कृत्रिम गर्भाधान रेकर्ड भेटिएन।
                    </td>
                  </tr>
                ) : (
                  filteredAiRecords.map((ai) => (
                    <tr key={ai.id}>
                      <td style={{ fontWeight: 800, color: '#7c3aed' }}>
                        <code>{ai.strawNumber}</code>
                      </td>
                      <td>
                        <div style={{ fontWeight: 800, color: '#0f172a' }}>{ai.farmerName}</div>
                        <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                          वडा नं. {ai.wardNumber} {ai.contactPhone ? `• ${ai.contactPhone}` : ''}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: '#334155' }}>{ai.animalType}</div>
                        <div style={{ fontSize: '0.74rem', color: '#0369a1', fontWeight: 600 }}>{ai.breed}</div>
                      </td>
                      <td style={{ fontWeight: 600, color: '#475569' }}>{ai.aiDateBs}</td>
                      <td style={{ fontWeight: 700, color: '#b45309' }}>
                        {ai.expectedCalvingDateBs || '-'}
                      </td>
                      <td style={{ color: '#475569', fontSize: '0.84rem' }}>{ai.technicianName}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span 
                          className={`agri-badge ${
                            ai.status.includes('Confirmed') ? 'agri-badge-success' : 
                            ai.status.includes('Repeat') ? 'agri-badge-warning' : 'agri-badge-info'
                          }`}
                        >
                          {ai.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {isPublicView ? (
                          <span style={{ fontSize: '0.76rem', color: '#059669', fontWeight: 700 }}>
                            ✓ दर्ता प्रमाणित
                          </span>
                        ) : (
                          <div style={{ display: 'inline-flex', gap: '4px' }}>
                            <button
                              type="button"
                              title="गर्भधारण सफल प्रमाणित"
                              onClick={() => {
                                setLocalAiRecords(prev => prev.map(r => r.id === ai.id ? { ...r, status: 'सफल (Confirmed)' } : r));
                                setToastMessage({ type: 'success', text: `${ai.farmerName}को पशुको गर्भधारण सफल प्रमाणित गरियो!` });
                              }}
                              style={{ padding: '3px 8px', borderRadius: '5px', border: '1px solid #86efac', background: '#f0fdf4', color: '#166534', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700 }}
                            >
                              ✓ सफल
                            </button>
                            <button
                              type="button"
                              title="पुनः गर्भाधान आवश्यक"
                              onClick={() => {
                                setLocalAiRecords(prev => prev.map(r => r.id === ai.id ? { ...r, status: 'पुनः गर्भाधान आवश्यक (Repeat)' } : r));
                                setToastMessage({ type: 'success', text: `${ai.farmerName}को पशुको दोस्रो गर्भाधान आवश्यकमा सारियो` });
                              }}
                              style={{ padding: '3px 8px', borderRadius: '5px', border: '1px solid #fed7aa', background: '#fff7ed', color: '#9a3412', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700 }}
                            >
                              रिपिट
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: VACCINATION CAMPAIGN TRACKER */}
      {activeTab === 'vaccination' && (
        <div className="agri-glass-card" style={{ padding: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Syringe size={20} className="text-sky-600" />
                पशुपन्छी खोप अभियान तथा संक्रामक रोग नियन्त्रण ट्र्याकर
              </h3>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                पीपीआर, खोरेत (FMD), रेबिज तथा लम्पि स्किन (LSD) विरुद्धको खोप वितरण, इयर ट्याग र बुस्टर तालिका
              </div>
            </div>

            {!isPublicView && (
              <button
                type="button"
                onClick={() => setShowVaccineModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.55rem 1.1rem',
                  borderRadius: '8px',
                  background: '#0284c7',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.84rem',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)'
                }}
              >
                <Plus size={16} /> नयाँ खोप दर्ता
              </button>
            )}
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="agri-pro-table">
              <thead>
                <tr>
                  <th>खोपको नाम</th>
                  <th>कर्ण नम्बर (Ear Tag)</th>
                  <th>पशुको प्रकार</th>
                  <th>कृषक / वडा</th>
                  <th>खोप मिति</th>
                  <th>बुस्टर खोप मिति</th>
                  <th>ब्याच नं.</th>
                  <th>खोप प्राविधिक</th>
                  <th style={{ textAlign: 'center' }}>स्थिति</th>
                </tr>
              </thead>
              <tbody>
                {filteredVaccineRecords.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ padding: '3.5rem 1rem', textAlign: 'center', color: '#64748b' }}>
                      कुनै खोप रेकर्ड भेटिएन।
                    </td>
                  </tr>
                ) : (
                  filteredVaccineRecords.map((vac) => (
                    <tr key={vac.id}>
                      <td style={{ fontWeight: 800, color: '#0284c7' }}>{vac.vaccineName}</td>
                      <td>
                        <span style={{ padding: '3px 8px', borderRadius: '6px', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', fontFamily: 'monospace', fontWeight: 800, fontSize: '0.82rem', color: '#0f172a' }}>
                          {vac.earTagNumber}
                        </span>
                      </td>
                      <td style={{ fontWeight: 700, color: '#334155' }}>{vac.animalType}</td>
                      <td>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{vac.farmerName}</div>
                        <div style={{ fontSize: '0.74rem', color: '#64748b' }}>वडा नं. {vac.wardNumber}</div>
                      </td>
                      <td style={{ color: '#475569' }}>{vac.vaccinatedDateBs}</td>
                      <td style={{ fontWeight: 700, color: vac.status.includes('Due') ? '#dc2626' : '#059669' }}>
                        {vac.boosterDueDateBs || '-'}
                      </td>
                      <td style={{ fontSize: '0.78rem', color: '#64748b' }}>{vac.batchNumber || '-'}</td>
                      <td style={{ color: '#475569', fontSize: '0.82rem' }}>{vac.technicianName}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`agri-badge ${vac.status.includes('Completed') ? 'agri-badge-success' : 'agri-badge-warning'}`}>
                          {vac.status}
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

      {/* TAB 5: CLINICAL DIAGNOSIS & PRESCRIPTION */}
      {activeTab === 'diagnosis' && (
        <div className="agri-glass-card" style={{ padding: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Stethoscope size={20} className="text-emerald-600" />
                पशु स्वास्थ्य परीक्षण, रोग निदान तथा डिजिटल पुर्जी (OPD)
              </h3>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                लक्षण पहिचान, सम्भावित रोग निदान, सिफारिस औषधि तथा कृषकलाई आधिकारिक डिजिटल पुर्जी जारी
              </div>
            </div>

            {!isPublicView && (
              <button
                type="button"
                onClick={() => setShowDiagnosisModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.55rem 1.1rem',
                  borderRadius: '8px',
                  background: '#059669',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.84rem',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)'
                }}
              >
                <Plus size={16} /> नयाँ परीक्षण तथा पुर्जी
              </button>
            )}
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="agri-pro-table">
              <thead>
                <tr>
                  <th>मिति</th>
                  <th>कृषक / वडा</th>
                  <th>पशुको प्रकार</th>
                  <th>लक्षण (Symptoms)</th>
                  <th>सम्भावित रोग (Diagnosis)</th>
                  <th>सिफारिस औषधि र मात्रा</th>
                  <th>परीक्षण गर्ने प्राविधिक/चिकित्सक</th>
                  <th style={{ textAlign: 'center' }}>स्थिति</th>
                  <th style={{ textAlign: 'center' }}>पुर्जी प्रिन्ट</th>
                </tr>
              </thead>
              <tbody>
                {filteredDiagnosisRecords.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ padding: '3.5rem 1rem', textAlign: 'center', color: '#64748b' }}>
                      कुनै उपचार रेकर्ड भेटिएन।
                    </td>
                  </tr>
                ) : (
                  filteredDiagnosisRecords.map((dx) => (
                    <tr key={dx.id}>
                      <td style={{ color: '#475569' }}>{dx.dateBs}</td>
                      <td>
                        <div style={{ fontWeight: 800, color: '#0f172a' }}>{dx.farmerName}</div>
                        <div style={{ fontSize: '0.74rem', color: '#64748b' }}>वडा नं. {dx.wardNumber}</div>
                      </td>
                      <td style={{ fontWeight: 700, color: '#334155' }}>{dx.animalType}</td>
                      <td style={{ fontSize: '0.82rem', color: '#dc2626', maxWidth: '200px' }}>
                        {dx.symptoms}
                      </td>
                      <td style={{ fontWeight: 800, color: '#b45309' }}>{dx.suspectedDisease}</td>
                      <td>
                        <div style={{ fontWeight: 700, color: '#047857' }}>{dx.prescribedMedicine}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{dx.dosageInstructions}</div>
                      </td>
                      <td style={{ color: '#475569', fontSize: '0.82rem' }}>{dx.doctorTechnician}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`agri-badge ${dx.status.includes('Recovered') ? 'agri-badge-success' : 'agri-badge-info'}`}>
                          {dx.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => setSelectedDiagnosisSlip(dx)}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '6px',
                            border: '1.5px solid #a7f3d0',
                            background: '#ecfdf5',
                            fontSize: '0.78rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            color: '#065f46',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Printer size={14} /> पुर्जी
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

      {/* MODAL 1: Add New Medicine */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div className="agri-glass-card" style={{ maxWidth: '540px', width: '100%', padding: '1.75rem', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, margin: 0, color: '#0f172a' }}>
                  नयाँ भेटेरिनरी औषधि दर्ता
                </h3>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                  पालिका भेटेरिनरी केन्द्रीय भण्डारमा नयाँ औषधि प्रविष्टि
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newMedicine.medicineName) return;
                addMedicineMutation.mutate(newMedicine as VetMedicine);
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, marginBottom: '0.35rem' }}>औषधिको नाम (जेनेरिक / व्यापारिक नाम)</label>
                <input
                  type="text"
                  required
                  placeholder="जस्तै: आइभरमेक्टिन इन्जेक्सन (Ivermectin 1%)"
                  value={newMedicine.medicineName || ''}
                  onChange={e => setNewMedicine({ ...newMedicine, medicineName: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                />
              </div>

              <div className="agri-grid-2">
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, marginBottom: '0.35rem' }}>ब्याच नम्बर</label>
                  <input
                    type="text"
                    placeholder="BATCH-2081-XX"
                    value={newMedicine.batchNumber || ''}
                    onChange={e => setNewMedicine({ ...newMedicine, batchNumber: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, marginBottom: '0.35rem' }}>इकाई (Unit)</label>
                  <select
                    value={newMedicine.unit || 'भाइल (Vials)'}
                    onChange={e => setNewMedicine({ ...newMedicine, unit: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.9rem' }}
                  >
                    <option value="भाइल (Vials)">भाइल (Vials)</option>
                    <option value="ट्याब्लेट / बोलस">ट्याब्लेट / बोलस</option>
                    <option value="बोतल (Bottles/ML)">बोतल (Bottles/ML)</option>
                    <option value="पोका (Pkts/Grams)">पोका (Pkts/Grams)</option>
                    <option value="डोज (Doses)">डोज खोप (Doses)</option>
                  </select>
                </div>
              </div>

              <div className="agri-grid-2">
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, marginBottom: '0.35rem' }}>प्रारम्भिक मौज्दात संख्या</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newMedicine.stockQuantity || ''}
                    onChange={e => setNewMedicine({ ...newMedicine, stockQuantity: parseInt(e.target.value) || 0 })}
                    style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontWeight: 900 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, marginBottom: '0.35rem' }}>म्याद सकिने मिति</label>
                  <input
                    type="date"
                    value={newMedicine.expiryDate || ''}
                    onChange={e => setNewMedicine({ ...newMedicine, expiryDate: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '0.5rem', paddingTop: '0.85rem', borderTop: '1px solid #e2e8f0' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ padding: '0.6rem 1.1rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', cursor: 'pointer', fontWeight: 700 }}
                >
                  रद्द
                </button>
                <button
                  type="submit"
                  disabled={addMedicineMutation.isPending}
                  style={{ padding: '0.6rem 1.4rem', borderRadius: '8px', border: 'none', background: '#1e40af', color: '#ffffff', cursor: 'pointer', fontWeight: 800 }}
                >
                  {addMedicineMutation.isPending ? 'दर्ता हुँदैछ...' : 'औषधि सुरक्षित गर्नुहोस्'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Distribute to Farmer */}
      {showDistributeModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div className="agri-glass-card" style={{ maxWidth: '560px', width: '100%', padding: '1.75rem', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, margin: 0, color: '#0f172a' }}>
                  कृषकलाई पशु औषधि वितरण
                </h3>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                  निःशुल्क वा अनुदानित औषधि वितरण तथा उपचार रेकर्ड
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDistributeModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!distributionData.farmerId || !distributionData.medicineId || !distributionData.quantityGiven) return;
                distributeMutation.mutate(distributionData as VetDistribution);
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, marginBottom: '0.35rem' }}>कृषकको नाम वा घरधुरी संकेत / फोन</label>
                <input
                  type="text"
                  required
                  placeholder="जस्तै: राम बहादुर लामा (वडा नं. ३) / 9841..."
                  value={distributionData.farmerId || ''}
                  onChange={e => setDistributionData({ ...distributionData, farmerId: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, marginBottom: '0.35rem' }}>औषधि छान्नुहोस् (सक्रिय स्टकबाट)</label>
                <select
                  required
                  value={distributionData.medicineId || ''}
                  onChange={e => setDistributionData({ ...distributionData, medicineId: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.9rem' }}
                >
                  <option value="">छान्नुहोस्...</option>
                  {medicines.filter(m => m.stockQuantity > 0).map(med => (
                    <option key={med.id} value={med.id}>
                      {med.medicineName} ({med.stockQuantity} {med.unit} मौज्दात)
                    </option>
                  ))}
                </select>
              </div>

              {/* Animal Type Chips */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, marginBottom: '0.4rem' }}>पशुको प्रकार (Animal Type):</label>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {ANIMAL_TYPES.map(an => {
                    const isSelected = distributionData.animalType === an.label;
                    return (
                      <button
                        key={an.label}
                        type="button"
                        onClick={() => setDistributionData({ ...distributionData, animalType: an.label })}
                        style={{
                          padding: '0.4rem 0.75rem',
                          borderRadius: '8px',
                          border: '1.5px solid',
                          borderColor: isSelected ? '#10b981' : '#cbd5e1',
                          backgroundColor: isSelected ? '#ecfdf5' : '#ffffff',
                          color: isSelected ? '#065f46' : '#475569',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        {an.icon} {an.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="agri-grid-2">
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, marginBottom: '0.35rem' }}>वितरण मात्रा (Quantity)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={distributionData.quantityGiven || ''}
                    onChange={e => setDistributionData({ ...distributionData, quantityGiven: parseInt(e.target.value) || 1 })}
                    style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontWeight: 900 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, marginBottom: '0.35rem' }}>वितरण मिति</label>
                  <input
                    type="date"
                    required
                    value={distributionData.distributedDate || ''}
                    onChange={e => setDistributionData({ ...distributionData, distributedDate: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, marginBottom: '0.35rem' }}>लक्षण तथा कैफियत (Symptoms & Remarks)</label>
                <input
                  type="text"
                  placeholder="जस्तै: खोरेत नियन्त्रण खोप, जुकाको औषधि..."
                  value={distributionData.remarks || ''}
                  onChange={e => setDistributionData({ ...distributionData, remarks: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '0.5rem', paddingTop: '0.85rem', borderTop: '1px solid #e2e8f0' }}>
                <button
                  type="button"
                  onClick={() => setShowDistributeModal(false)}
                  style={{ padding: '0.6rem 1.1rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', cursor: 'pointer', fontWeight: 700 }}
                >
                  रद्द
                </button>
                <button
                  type="submit"
                  disabled={distributeMutation.isPending}
                  style={{ padding: '0.6rem 1.4rem', borderRadius: '8px', border: 'none', background: '#10b981', color: '#ffffff', cursor: 'pointer', fontWeight: 800 }}
                >
                  {distributeMutation.isPending ? 'वितरण हुँदैछ...' : 'औषधि वितरण गर्नुहोस्'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Stock Adjust Modal */}
      {showStockAdjustModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div className="agri-glass-card" style={{ maxWidth: '440px', width: '100%', padding: '1.75rem', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.65rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 900, margin: 0, color: '#0f172a' }}>
                मौज्दात समायोजन (Stock Adjust)
              </h3>
              <button
                type="button"
                onClick={() => setShowStockAdjustModal(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: '1rem', padding: '0.85rem', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 900, fontSize: '1rem', color: '#0f172a' }}>{showStockAdjustModal.medicineName}</div>
              <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>हालको मौज्दात: <strong>{showStockAdjustModal.stockQuantity} {showStockAdjustModal.unit}</strong></div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, marginBottom: '0.35rem' }}>समायोजन प्रकार:</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setAdjustType('add')}
                    style={{
                      flex: 1,
                      padding: '0.55rem',
                      borderRadius: '8px',
                      border: '1.5px solid',
                      borderColor: adjustType === 'add' ? '#059669' : '#cbd5e1',
                      backgroundColor: adjustType === 'add' ? '#ecfdf5' : '#ffffff',
                      color: adjustType === 'add' ? '#065f46' : '#475569',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    + नयाँ मौज्दात थप (Stock In)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustType('reduce')}
                    style={{
                      flex: 1,
                      padding: '0.55rem',
                      borderRadius: '8px',
                      border: '1.5px solid',
                      borderColor: adjustType === 'reduce' ? '#dc2626' : '#cbd5e1',
                      backgroundColor: adjustType === 'reduce' ? '#fef2f2' : '#ffffff',
                      color: adjustType === 'reduce' ? '#991b1b' : '#475569',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    - मौज्दात कटौती (Deduce)
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, marginBottom: '0.35rem' }}>मात्रा ({showStockAdjustModal.unit}):</label>
                <input
                  type="number"
                  min="1"
                  value={adjustAmount}
                  onChange={e => setAdjustAmount(parseInt(e.target.value) || 1)}
                  style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '1.1rem', fontWeight: 900 }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '0.5rem', paddingTop: '0.85rem', borderTop: '1px solid #e2e8f0' }}>
                <button
                  type="button"
                  onClick={() => setShowStockAdjustModal(null)}
                  style={{ padding: '0.6rem 1.1rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', cursor: 'pointer', fontWeight: 700 }}
                >
                  रद्द
                </button>
                <button
                  type="button"
                  onClick={() => {
                    adjustStockMutation.mutate({
                      id: showStockAdjustModal.id,
                      amount: adjustAmount,
                      type: adjustType
                    });
                  }}
                  disabled={adjustStockMutation.isPending}
                  style={{ padding: '0.6rem 1.4rem', borderRadius: '8px', border: 'none', background: '#1e40af', color: '#ffffff', cursor: 'pointer', fontWeight: 800 }}
                >
                  {adjustStockMutation.isPending ? 'अद्यावधिक हुँदैछ...' : 'मौज्दात अद्यावधिक गर्नुहोस्'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Printable Slip */}
      {selectedSlipDist && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div className="agri-glass-card" style={{ maxWidth: '540px', width: '100%', padding: '2rem', backgroundColor: '#ffffff', borderRadius: '20px', boxShadow: '0 30px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#eff6ff', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={26} />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1d4ed8' }}>पाँचपोखरी थाङपाल गाउँ कार्यपालिका</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a' }}>पशु स्वास्थ्य उपचार तथा औषधि वितरण पुर्जी</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSlipDist(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={22} />
              </button>
            </div>

            <div
              id="printable-slip"
              style={{
                borderRadius: '12px',
                border: '2px solid #1e40af',
                padding: '1.4rem',
                backgroundColor: '#f8fafc',
                fontSize: '0.88rem',
                lineHeight: 1.75,
              }}
            >
              <div style={{ textAlign: 'center', borderBottom: '1.5px solid #cbd5e1', paddingBottom: '0.75rem', marginBottom: '0.85rem' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b' }}>नेपाल सरकार | बागमती प्रदेश</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#1e40af' }}>पाँचपोखरी थाङपाल गाउँपालिका</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>पशु सेवा तथा भेटेरिनरी शाखा</div>
              </div>

              <div><strong>वितरण मिति:</strong> {selectedSlipDist.distributedDate ? new Date(selectedSlipDist.distributedDate).toLocaleDateString('ne-NP') : new Date().toLocaleDateString('ne-NP')}</div>
              <div><strong>कृषकको विवरण:</strong> {selectedSlipDist.farmerId}</div>
              <div><strong>पशुको प्रकार:</strong> {selectedSlipDist.animalType}</div>
              <div><strong>औषधिको नाम:</strong> {selectedSlipDist.medicine?.medicineName}</div>
              <div><strong>वितरित परिमाण:</strong> {selectedSlipDist.quantityGiven} {selectedSlipDist.medicine?.unit}</div>
              <div><strong>लक्षण / उपचार:</strong> {selectedSlipDist.remarks || 'नियमित पशु स्वास्थ्य परीक्षण'}</div>
              <div><strong>शुल्क:</strong> <span style={{ color: '#059669', fontWeight: 800 }}>निःशुल्क (गाउँपालिका अनुदान कार्यक्रम)</span></div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px dashed #cbd5e1' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>प्रमाणित: {new Date().toLocaleDateString('ne-NP')}</div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ borderBottom: '1px solid #0f172a', width: '130px', height: '32px', marginBottom: '3px' }}></div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800 }}>पशु प्राविधिकको हस्ताक्षर</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={() => setSelectedSlipDist(null)}
                style={{ padding: '0.6rem 1.1rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', cursor: 'pointer', fontWeight: 700 }}
              >
                बन्द
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                style={{ padding: '0.6rem 1.4rem', borderRadius: '8px', border: 'none', background: '#1e40af', color: '#ffffff', cursor: 'pointer', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Printer size={16} /> पुर्जी प्रिन्ट गर्नुहोस्
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: Register New AI (कृत्रिम गर्भाधान) */}
      {showAiModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div className="agri-glass-card" style={{ maxWidth: '580px', width: '100%', padding: '1.75rem', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sparkles size={20} className="text-purple-600" />
                  नयाँ कृत्रिम गर्भाधान (AI) दर्ता फारम
                </h3>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                  सिमेन स्ट्र विवरण, पशु नश्ल तथा सम्भावित ब्याउने मिति प्रविष्टि
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newAi.farmerName || !newAi.strawNumber) return;
                const newRecord: VetAiRecord = {
                  id: `AI-2081-${Math.floor(100 + Math.random() * 900)}`,
                  farmerName: newAi.farmerName || '',
                  contactPhone: newAi.contactPhone || '',
                  wardNumber: Number(newAi.wardNumber) || 1,
                  animalType: newAi.animalType || 'गाई (Cow)',
                  breed: newAi.breed || 'होलिस्टिन फ्रिजियन',
                  strawNumber: newAi.strawNumber || 'NLDB-001',
                  aiDateBs: newAi.aiDateBs || '२०८१/०६/१५',
                  expectedCalvingDateBs: newAi.expectedCalvingDateBs || '२०८२/०३/२५',
                  technicianName: newAi.technicianName || 'पशु प्राविधिक',
                  status: (newAi.status as any) || 'निरीक्षण बाँकी (Pending)',
                  remarks: newAi.remarks || ''
                };
                addAiMutation.mutate(newRecord);
                setLocalAiRecords(prev => [newRecord, ...prev]);
                setShowAiModal(false);
                setToastMessage({ type: 'success', text: `नयाँ AI रेकर्ड (स्ट्र नं: ${newRecord.strawNumber}) सफलतापूर्वक दर्ता गरियो!` });
                setNewAi({
                  farmerName: '',
                  contactPhone: '',
                  wardNumber: 1,
                  animalType: 'गाई (Cow)',
                  breed: 'होलिस्टिन फ्रिजियन',
                  strawNumber: 'NLDB-',
                  aiDateBs: '२०८१/०६/१५',
                  expectedCalvingDateBs: '२०८२/०३/२५',
                  technicianName: 'रामेश्वर थापा (पशु प्राविधिक)',
                  status: 'निरीक्षण बाँकी (Pending)',
                  remarks: ''
                });
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              <div className="agri-grid-2">
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, marginBottom: '0.35rem' }}>कृषकको नाम</label>
                  <input
                    type="text"
                    required
                    placeholder="कृषकको पूरा नाम"
                    value={newAi.farmerName || ''}
                    onChange={e => setNewAi({ ...newAi, farmerName: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, marginBottom: '0.35rem' }}>सम्पर्क मोबाइल नं.</label>
                  <input
                    type="text"
                    placeholder="९८xxxxxxxx"
                    value={newAi.contactPhone || ''}
                    onChange={e => setNewAi({ ...newAi, contactPhone: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div className="agri-grid-3">
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, marginBottom: '0.35rem' }}>वडा नं.</label>
                  <select
                    value={newAi.wardNumber || 1}
                    onChange={e => setNewAi({ ...newAi, wardNumber: parseInt(e.target.value) || 1 })}
                    style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(w => (
                      <option key={w} value={w}>वडा नं. {w}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, marginBottom: '0.35rem' }}>पशुको प्रकार</label>
                  <select
                    value={newAi.animalType || 'गाई (Cow)'}
                    onChange={e => setNewAi({ ...newAi, animalType: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                  >
                    <option value="गाई (Cow)">🐄 गाई (Cow)</option>
                    <option value="भैंसी (Buffalo)">🐃 भैंसी (Buffalo)</option>
                    <option value="याक / चौँरी (Yak/Chauri)">🐂 याक / चौँरी</option>
                    <option value="बाख्रा (Goat)">🐐 बाख्रा (Goat)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, marginBottom: '0.35rem' }}>नश्ल / जात</label>
                  <input
                    type="text"
                    placeholder="जस्तै: HF 75%, मुर्रा"
                    value={newAi.breed || ''}
                    onChange={e => setNewAi({ ...newAi, breed: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div className="agri-grid-2">
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, marginBottom: '0.35rem' }}>सिमेन स्ट्र नम्बर (Straw No.)</label>
                  <input
                    type="text"
                    required
                    placeholder="जस्तै: NLDB-HF-9812"
                    value={newAi.strawNumber || ''}
                    onChange={e => setNewAi({ ...newAi, strawNumber: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontWeight: 800, color: '#7c3aed' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, marginBottom: '0.35rem' }}>गर्भाधान गराउने प्राविधिक</label>
                  <input
                    type="text"
                    placeholder="प्राविधिकको नाम"
                    value={newAi.technicianName || ''}
                    onChange={e => setNewAi({ ...newAi, technicianName: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div className="agri-grid-2">
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, marginBottom: '0.35rem' }}>गर्भाधान मिति (वि.सं.)</label>
                  <input
                    type="text"
                    placeholder="२०८१/०६/१५"
                    value={newAi.aiDateBs || ''}
                    onChange={e => setNewAi({ ...newAi, aiDateBs: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, marginBottom: '0.35rem' }}>अनुमानित ब्याउने मिति (वि.सं.)</label>
                  <input
                    type="text"
                    placeholder="२०८२/०३/२५ (~२८० दिन)"
                    value={newAi.expectedCalvingDateBs || ''}
                    onChange={e => setNewAi({ ...newAi, expectedCalvingDateBs: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontWeight: 700, color: '#b45309' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '0.5rem', paddingTop: '0.85rem', borderTop: '1px solid #e2e8f0' }}>
                <button
                  type="button"
                  onClick={() => setShowAiModal(false)}
                  style={{ padding: '0.6rem 1.1rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', cursor: 'pointer', fontWeight: 700 }}
                >
                  रद्द
                </button>
                <button
                  type="submit"
                  style={{ padding: '0.6rem 1.4rem', borderRadius: '8px', border: 'none', background: '#7c3aed', color: '#ffffff', cursor: 'pointer', fontWeight: 800 }}
                >
                  AI दर्ता सुरक्षित गर्नुहोस्
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: Register New Vaccination (खोप दर्ता) */}
      {showVaccineModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div className="agri-glass-card" style={{ maxWidth: '580px', width: '100%', padding: '1.75rem', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Syringe size={20} className="text-sky-600" />
                  पशुपन्छी खोप अभियान दर्ता फारम
                </h3>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                  रोग नियन्त्रण, इयर ट्याग र बुस्टर तालिका प्रविष्टि
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowVaccineModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newVaccine.farmerName || !newVaccine.earTagNumber) return;
                const newRecord: VetVaccinationRecord = {
                  id: `VAC-2081-${Math.floor(100 + Math.random() * 900)}`,
                  vaccineName: newVaccine.vaccineName || 'पीपीआर (PPR) विरुद्धको खोप',
                  earTagNumber: newVaccine.earTagNumber || 'NP-PKT-81-000',
                  animalType: newVaccine.animalType || 'बाख्रा (Goat)',
                  farmerName: newVaccine.farmerName || '',
                  wardNumber: Number(newVaccine.wardNumber) || 1,
                  vaccinatedDateBs: newVaccine.vaccinatedDateBs || '२०८१/०६/१५',
                  boosterDueDateBs: newVaccine.boosterDueDateBs || '२०८२/०६/१५',
                  batchNumber: newVaccine.batchNumber || 'VAC-B1',
                  technicianName: newVaccine.technicianName || 'खोप प्राविधिक',
                  status: (newVaccine.status as any) || 'सम्पन्न (Completed)'
                };
                addVaccineMutation.mutate(newRecord);
                setLocalVaccineRecords(prev => [newRecord, ...prev]);
                setShowVaccineModal(false);
                setToastMessage({ type: 'success', text: `इयर ट्याग ${newRecord.earTagNumber} को खोप सफलतापूर्वक दर्ता गरियो!` });
                setNewVaccine({
                  vaccineName: 'पीपीआर (PPR) विरुद्धको खोप',
                  earTagNumber: 'NP-PKT-81-',
                  animalType: 'बाख्रा (Goat)',
                  farmerName: '',
                  wardNumber: 1,
                  vaccinatedDateBs: '२०८१/०६/१५',
                  boosterDueDateBs: '२०८२/०६/१५',
                  batchNumber: 'VAC-',
                  technicianName: 'गोविन्द अधिकारी (भेटेरिनरी जेटीए)',
                  status: 'सम्पन्न (Completed)'
                });
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, marginBottom: '0.35rem' }}>खोपको नाम (Vaccine)</label>
                <select
                  value={newVaccine.vaccineName || 'पीपीआर (PPR) विरुद्धको खोप'}
                  onChange={e => setNewVaccine({ ...newVaccine, vaccineName: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.9rem' }}
                >
                  <option value="पीपीआर (PPR) विरुद्धको खोप">पीपीआर (PPR) विरुद्धको खोप (बाख्रा/भेडा)</option>
                  <option value="खोरेत (FMD) रोग विरुद्धको खोप">खोरेत (FMD) रोग विरुद्धको खोप (गाई/भैंसी/बाख्रा)</option>
                  <option value="रेबिज (Anti-Rabies) खोप अभियान">रेबिज (Anti-Rabies) खोप (कुकुर/बिरालो/चौपाया)</option>
                  <option value="लम्पि स्किन (LSD) विरुद्धको खोप">लम्पि स्किन (LSD) विरुद्धको खोप (गाई/भैंसी)</option>
                  <option value="रानीखेत (Ranikhet / ND) खोप">रानीखेत (Ranikhet / ND) खोप (कुखुरा/हाँस)</option>
                </select>
              </div>

              <div className="agri-grid-2">
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, marginBottom: '0.35rem' }}>कर्ण नम्बर (Ear Tag No.)</label>
                  <input
                    type="text"
                    required
                    placeholder="NP-PKT-81-00214"
                    value={newVaccine.earTagNumber || ''}
                    onChange={e => setNewVaccine({ ...newVaccine, earTagNumber: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontFamily: 'monospace', fontWeight: 800 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, marginBottom: '0.35rem' }}>पशुको प्रकार</label>
                  <select
                    value={newVaccine.animalType || 'बाख्रा (Goat)'}
                    onChange={e => setNewVaccine({ ...newVaccine, animalType: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                  >
                    <option value="बाख्रा (Goat)">🐐 बाख्रा (Goat)</option>
                    <option value="गाई (Cow)">🐄 गाई (Cow)</option>
                    <option value="भैंसी (Buffalo)">🐃 भैंसी (Buffalo)</option>
                    <option value="कुकुर (Canine)">🐕 कुकुर (Canine)</option>
                    <option value="चौँरी / याक">🐂 चौँरी / याक</option>
                    <option value="भेडा (Sheep)">🐑 भेडा (Sheep)</option>
                  </select>
                </div>
              </div>

              <div className="agri-grid-2">
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, marginBottom: '0.35rem' }}>कृषकको नाम</label>
                  <input
                    type="text"
                    required
                    placeholder="कृषकको नाम"
                    value={newVaccine.farmerName || ''}
                    onChange={e => setNewVaccine({ ...newVaccine, farmerName: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, marginBottom: '0.35rem' }}>वडा नं.</label>
                  <select
                    value={newVaccine.wardNumber || 1}
                    onChange={e => setNewVaccine({ ...newVaccine, wardNumber: parseInt(e.target.value) || 1 })}
                    style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(w => (
                      <option key={w} value={w}>वडा नं. {w}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="agri-grid-3">
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, marginBottom: '0.35rem' }}>खोप मिति</label>
                  <input
                    type="text"
                    placeholder="२०८१/०६/१५"
                    value={newVaccine.vaccinatedDateBs || ''}
                    onChange={e => setNewVaccine({ ...newVaccine, vaccinatedDateBs: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, marginBottom: '0.35rem' }}>बुस्टर खोप मिति</label>
                  <input
                    type="text"
                    placeholder="२०८२/०६/१५"
                    value={newVaccine.boosterDueDateBs || ''}
                    onChange={e => setNewVaccine({ ...newVaccine, boosterDueDateBs: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, marginBottom: '0.35rem' }}>ब्याच नं.</label>
                  <input
                    type="text"
                    placeholder="PPR-B881"
                    value={newVaccine.batchNumber || ''}
                    onChange={e => setNewVaccine({ ...newVaccine, batchNumber: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, marginBottom: '0.35rem' }}>खोप लगाउने प्राविधिक / जेटीए</label>
                <input
                  type="text"
                  placeholder="प्राविधिकको नाम"
                  value={newVaccine.technicianName || ''}
                  onChange={e => setNewVaccine({ ...newVaccine, technicianName: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '0.5rem', paddingTop: '0.85rem', borderTop: '1px solid #e2e8f0' }}>
                <button
                  type="button"
                  onClick={() => setShowVaccineModal(false)}
                  style={{ padding: '0.6rem 1.1rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', cursor: 'pointer', fontWeight: 700 }}
                >
                  रद्द
                </button>
                <button
                  type="submit"
                  style={{ padding: '0.6rem 1.4rem', borderRadius: '8px', border: 'none', background: '#0284c7', color: '#ffffff', cursor: 'pointer', fontWeight: 800 }}
                >
                  खोप दर्ता सुरक्षित गर्नुहोस्
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 7: Register Clinical Diagnosis (उपचार तथा पुर्जी) */}
      {showDiagnosisModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div className="agri-glass-card" style={{ maxWidth: '600px', width: '100%', padding: '1.75rem', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Stethoscope size={20} className="text-emerald-600" />
                  नयाँ पशु स्वास्थ्य परीक्षण तथा डिजिटल पुर्जी (OPD)
                </h3>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                  रोगको लक्षण, सम्भावित पहिचान र सिफारिस औषधि
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDiagnosisModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newDiagnosis.farmerName || !newDiagnosis.suspectedDisease) return;
                const newRecord: VetDiagnosisRecord = {
                  id: `DX-2081-${Math.floor(100 + Math.random() * 900)}`,
                  farmerName: newDiagnosis.farmerName || '',
                  wardNumber: Number(newDiagnosis.wardNumber) || 1,
                  animalType: newDiagnosis.animalType || 'गाई (Cow)',
                  symptoms: newDiagnosis.symptoms || '',
                  suspectedDisease: newDiagnosis.suspectedDisease || '',
                  prescribedMedicine: newDiagnosis.prescribedMedicine || '',
                  dosageInstructions: newDiagnosis.dosageInstructions || '',
                  doctorTechnician: newDiagnosis.doctorTechnician || 'पशु चिकित्सक',
                  dateBs: newDiagnosis.dateBs || '२०८१/०६/१५',
                  status: (newDiagnosis.status as any) || 'उपचार जारी (Under Treatment)'
                };
                addDiagnosisMutation.mutate(newRecord);
                setLocalDiagnosisRecords(prev => [newRecord, ...prev]);
                setShowDiagnosisModal(false);
                setSelectedDiagnosisSlip(newRecord);
                setToastMessage({ type: 'success', text: `उपचार पुर्जी सफलतापूर्वक जारी गरियो!` });
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              <div className="agri-grid-3">
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, marginBottom: '0.35rem' }}>कृषकको नाम</label>
                  <input
                    type="text"
                    required
                    placeholder="कृषकको नाम"
                    value={newDiagnosis.farmerName || ''}
                    onChange={e => setNewDiagnosis({ ...newDiagnosis, farmerName: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, marginBottom: '0.35rem' }}>वडा नं.</label>
                  <select
                    value={newDiagnosis.wardNumber || 1}
                    onChange={e => setNewDiagnosis({ ...newDiagnosis, wardNumber: parseInt(e.target.value) || 1 })}
                    style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(w => (
                      <option key={w} value={w}>वडा नं. {w}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, marginBottom: '0.35rem' }}>पशुको प्रकार</label>
                  <select
                    value={newDiagnosis.animalType || 'गाई (Cow)'}
                    onChange={e => setNewDiagnosis({ ...newDiagnosis, animalType: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                  >
                    <option value="गाई (Cow)">🐄 गाई (Cow)</option>
                    <option value="भैंसी (Buffalo)">🐃 भैंसी (Buffalo)</option>
                    <option value="बाख्रा (Goat)">🐐 बाख्रा (Goat)</option>
                    <option value="चौँरी / याक">🐂 चौँरी / याक</option>
                    <option value="कुखुरा / हाँस">🐔 कुखुरा / हाँस</option>
                    <option value="कुकुर (Canine)">🐕 कुकुर (Canine)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, marginBottom: '0.35rem' }}>देखा परेका मुख्य लक्षणहरू (Clinical Symptoms)</label>
                <textarea
                  rows={2}
                  required
                  placeholder="जस्तै: उच्च ज्वरो, थुन कडा भएको, दुध फाटेको, दाना नखाएको..."
                  value={newDiagnosis.symptoms || ''}
                  onChange={e => setNewDiagnosis({ ...newDiagnosis, symptoms: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, marginBottom: '0.35rem' }}>सम्भावित रोग निदान (Tentative Diagnosis)</label>
                <input
                  type="text"
                  required
                  placeholder="जस्तै: म्यास्टाइटिस (Mastitis / थुनेलो) वा निमोनिया"
                  value={newDiagnosis.suspectedDisease || ''}
                  onChange={e => setNewDiagnosis({ ...newDiagnosis, suspectedDisease: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontWeight: 800, color: '#b45309' }}
                />
              </div>

              <div className="agri-grid-2">
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, marginBottom: '0.35rem' }}>सिफारिस औषधिहरू (Prescribed Rx)</label>
                  <input
                    type="text"
                    required
                    placeholder="जस्तै: अक्सिटेट्रासाइक्लिन + मेक्सिक्याम"
                    value={newDiagnosis.prescribedMedicine || ''}
                    onChange={e => setNewDiagnosis({ ...newDiagnosis, prescribedMedicine: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, marginBottom: '0.35rem' }}>मात्रा तथा सेवन विधि (Dosage & Route)</label>
                  <input
                    type="text"
                    placeholder="जस्तै: दैनिक १५ मिली ३ दिनसम्म"
                    value={newDiagnosis.dosageInstructions || ''}
                    onChange={e => setNewDiagnosis({ ...newDiagnosis, dosageInstructions: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div className="agri-grid-2">
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, marginBottom: '0.35rem' }}>उपचार गर्ने पशु चिकित्सक / जेटीए</label>
                  <input
                    type="text"
                    value={newDiagnosis.doctorTechnician || ''}
                    onChange={e => setNewDiagnosis({ ...newDiagnosis, doctorTechnician: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, marginBottom: '0.35rem' }}>परीक्षण मिति</label>
                  <input
                    type="text"
                    value={newDiagnosis.dateBs || ''}
                    onChange={e => setNewDiagnosis({ ...newDiagnosis, dateBs: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '0.5rem', paddingTop: '0.85rem', borderTop: '1px solid #e2e8f0' }}>
                <button
                  type="button"
                  onClick={() => setShowDiagnosisModal(false)}
                  style={{ padding: '0.6rem 1.1rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', cursor: 'pointer', fontWeight: 700 }}
                >
                  रद्द
                </button>
                <button
                  type="submit"
                  style={{ padding: '0.6rem 1.4rem', borderRadius: '8px', border: 'none', background: '#059669', color: '#ffffff', cursor: 'pointer', fontWeight: 800 }}
                >
                  पुर्जी जारी गर्नुहोस्
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 8: Printable Clinical Diagnosis & OPD Prescription Slip */}
      {selectedDiagnosisSlip && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div className="agri-glass-card" style={{ maxWidth: '580px', width: '100%', padding: '2rem', backgroundColor: '#ffffff', borderRadius: '20px', boxShadow: '0 30px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Stethoscope size={26} />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#059669' }}>पाँचपोखरी थाङपाल गाउँ कार्यपालिका</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a' }}>पशु स्वास्थ्य उपचार पुर्जी (OPD Prescription)</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDiagnosisSlip(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={22} />
              </button>
            </div>

            <div
              id="printable-diagnosis-slip"
              style={{
                borderRadius: '12px',
                border: '2px solid #059669',
                padding: '1.4rem',
                backgroundColor: '#f8fafc',
                fontSize: '0.88rem',
                lineHeight: 1.75,
              }}
            >
              <div style={{ textAlign: 'center', borderBottom: '1.5px solid #cbd5e1', paddingBottom: '0.75rem', marginBottom: '0.85rem' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b' }}>नेपाल सरकार | बागमती प्रदेश</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#065f46' }}>पाँचपोखरी थाङपाल गाउँपालिका</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#047857' }}>पशु सेवा अस्पताल तथा भेटेरिनरी क्लिनिक</div>
              </div>

              <div className="agri-grid-2" style={{ marginBottom: '0.5rem' }}>
                <div><strong>पुर्जी नं:</strong> {selectedDiagnosisSlip.id}</div>
                <div><strong>मिति:</strong> {selectedDiagnosisSlip.dateBs}</div>
                <div><strong>कृषकको नाम:</strong> {selectedDiagnosisSlip.farmerName}</div>
                <div><strong>स्थान:</strong> वडा नं. {selectedDiagnosisSlip.wardNumber}</div>
                <div><strong>पशुको विवरण:</strong> {selectedDiagnosisSlip.animalType}</div>
                <div><strong>उपचार अवस्था:</strong> <span style={{ color: '#047857', fontWeight: 700 }}>{selectedDiagnosisSlip.status}</span></div>
              </div>

              <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '0.65rem', marginTop: '0.65rem' }}>
                <div><strong>देखा परेका लक्षण:</strong> {selectedDiagnosisSlip.symptoms}</div>
                <div><strong>रोग निदान (Diagnosis):</strong> <span style={{ color: '#b45309', fontWeight: 800 }}>{selectedDiagnosisSlip.suspectedDisease}</span></div>
              </div>

              <div style={{ borderTop: '1.5px solid #cbd5e1', paddingTop: '0.65rem', marginTop: '0.65rem', backgroundColor: '#f0fdf4', padding: '0.75rem', borderRadius: '8px' }}>
                <div style={{ fontWeight: 900, color: '#065f46', fontSize: '0.95rem', marginBottom: '4px' }}>Rx सिफारिस औषधि तथा प्रयोग विधि:</div>
                <div style={{ fontWeight: 800, color: '#0f172a' }}>💊 {selectedDiagnosisSlip.prescribedMedicine}</div>
                <div style={{ color: '#334155', fontSize: '0.85rem' }}>⏱️ {selectedDiagnosisSlip.dosageInstructions}</div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px dashed #cbd5e1' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>शुल्क: निःशुल्क (पालिका सेवा)</div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ borderBottom: '1px solid #0f172a', width: '140px', height: '30px', marginBottom: '3px' }}></div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800 }}>{selectedDiagnosisSlip.doctorTechnician}</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={() => setSelectedDiagnosisSlip(null)}
                style={{ padding: '0.6rem 1.1rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', cursor: 'pointer', fontWeight: 700 }}
              >
                बन्द
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                style={{ padding: '0.6rem 1.4rem', borderRadius: '8px', border: 'none', background: '#059669', color: '#ffffff', cursor: 'pointer', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Printer size={16} /> पुर्जी प्रिन्ट गर्नुहोस्
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
