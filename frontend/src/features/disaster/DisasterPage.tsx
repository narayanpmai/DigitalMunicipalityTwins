import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSensorsSocket } from '../../api/socket';
import { sectoralApi } from '../../api/sectoral';
import { municipalityApi, type SensorItem, type CameraItem } from '../../api/municipality';
import { disasterApi } from '../../api/disaster';
import type { DisasterEvent, EmergencyContact, Shelter, ReliefInventoryItem, DisasterFundDistribution, VulnerableSettlement } from '../../api/disaster';
import { api } from '../../api/client';
import {
  PhoneCall,
  AlertTriangle,
  Send,
  MessageSquare,
  Smartphone,
  CheckCircle2,
  Building,
  Radio,
  Clock,
  Waves,
  Mountain,
  CloudSnow,
  Plus,
  Download,
  Trash2,
  Edit,
  CheckCircle,
  Video,
  Camera,
  Activity,
  CloudRain,
  Zap,
  RefreshCw,
  Eye,
  Maximize2,
  ShieldAlert,
  Gauge,
  Sliders,
  ExternalLink,
  Tent,
  MapPin,
  Users,
  Droplets,
  Package,
  Boxes,
  Warehouse,
  Coins,
  ShieldCheck,
  Home,
  CheckSquare,
  HardHat,
} from 'lucide-react';
import { DisasterModal } from './components/DisasterModal';
import { EmergencyContactModal } from './components/EmergencyContactModal';
import { AddShelterModal } from './components/AddShelterModal';
import { RecoveryProjectsTab } from './components/RecoveryProjectsTab';

interface BroadcastRecord {
  id: string;
  title: string;
  message: string;
  hazardType: string;
  severity: string;
  targetWard: number | 'all';
  channels: string[];
  recipientsCount: number;
  status: string;
  timestampBs: string;
}

interface BroadcastStats {
  totalAlertsDispatched: number;
  totalSmsDelivered: number;
  deliverySuccessRate: number;
}

const INITIAL_RELIEF_INVENTORY: ReliefInventoryItem[] = [
  { id: 'rel-1', itemName: 'हेभी-ड्युटी वाटरप्रुफ त्रिपाल (Tarpaulins)', category: 'shelter', quantity: 450, unit: 'थान', warehouseLocation: 'थाङपालधाप पालिका मुख्य गोदाम', wardNumber: 4, condition: 'good', lastUpdatedBs: '२०८१-०५-१०', contactPerson: 'सुरेश श्रेष्ठ (जिन्सी शाखा)' },
  { id: 'rel-2', itemName: 'पारिवारिक टेन्ट सेट (६-८ जना क्षमता)', category: 'shelter', quantity: 80, unit: 'सेट', warehouseLocation: 'भोताङ आपतकालीन संकलन डिपो', wardNumber: 3, condition: 'good', lastUpdatedBs: '२०८१-०५-०५', contactPerson: 'पेम्बा तामाङ' },
  { id: 'rel-3', itemName: 'न्यानो कम्बल तथा म्याट्रेस सेट', category: 'clothing', quantity: 620, unit: 'थान', warehouseLocation: 'मानेखर्क विपद् उप-केन्द्र', wardNumber: 5, condition: 'good', lastUpdatedBs: '२०८१-०४-२८', contactPerson: 'मिङ्मार शेर्पा' },
  { id: 'rel-4', itemName: 'खोज तथा उद्धार डोरी र लाइफ ज्याकेट सेट', category: 'search_rescue', quantity: 45, unit: 'सेट', warehouseLocation: 'मेलम्ची रिभर बेस क्याम्प', wardNumber: 2, condition: 'good', lastUpdatedBs: '२०८१-०५-१२', contactPerson: 'प्रहरी चौकी तिम्बु' },
  { id: 'rel-5', itemName: 'स्ट्रेचर तथा आकस्मिक औषधि किट (First Aid Box)', category: 'medical', quantity: 35, unit: 'सेट', warehouseLocation: 'थाङपालकोट स्वास्थ्य चौकी', wardNumber: 6, condition: 'good', lastUpdatedBs: '२०८१-०५-१५', contactPerson: 'डा. अनिता थापा' },
  { id: 'rel-6', itemName: 'पेट्रोल जेनेरेटर (३.५ KVA) र बत्ती सेट', category: 'search_rescue', quantity: 6, unit: 'थान', warehouseLocation: 'पालिका कार्यसञ्चालन केन्द्र (EOC)', wardNumber: 4, condition: 'needs_restock', lastUpdatedBs: '२०८१-०४-१५', contactPerson: 'सुरेश श्रेष्ठ' },
  { id: 'rel-7', itemName: 'सुक्खा खाद्यान्न तथा प्रोटिन पोषण प्याक', category: 'food', quantity: 300, unit: 'प्याक', warehouseLocation: 'थाङपालधाप पालिका मुख्य गोदाम', wardNumber: 4, condition: 'good', lastUpdatedBs: '२०८१-०५-०२', contactPerson: 'सुरेश श्रेष्ठ' }
];

const INITIAL_RELIEF_FUNDS: DisasterFundDistribution[] = [
  { id: 'df-1', disasterTitle: 'मानेखर्क भिरालो पहिरो विस्थापित', wardNumber: 5, beneficiaryName: 'राम बहादुर तामाङ', citizenshipNo: '२७-०१-७२-०३४२१', familyCount: 5, reliefType: 'नगद राहत (DBT)', amountNPR: 25000, distributionDateBs: '२०८१-०५-०४', disbursedByOfficer: 'नवराज पौडेल (विपद् अधिकृत)', voucherNo: 'VOUCH-DIS-२०८१-००१', status: 'वितरण सम्पन्न' },
  { id: 'df-2', disasterTitle: 'तिम्बु खोला बाढी कटान राहत', wardNumber: 2, beneficiaryName: 'फुर्बा शेर्पा', citizenshipNo: '२७-०१-६८-०९१२३', familyCount: 4, reliefType: 'त्रिपाल/टेन्ट', amountNPR: 12000, distributionDateBs: '२०८१-०५-०८', disbursedByOfficer: 'सुरेश श्रेष्ठ (जिन्सी शाखा)', voucherNo: 'VOUCH-DIS-२०८१-००२', status: 'वितरण सम्पन्न' },
  { id: 'df-3', disasterTitle: 'भोताङ भारी वर्षा जमिन कटान', wardNumber: 3, beneficiaryName: 'माया तामाङ', citizenshipNo: '२७-०१-७५-११४५६', familyCount: 6, reliefType: 'खाद्यान्न सामग्री', amountNPR: 15000, distributionDateBs: '२०८१-०५-११', disbursedByOfficer: 'नवराज पौडेल (विपद् अधिकृत)', voucherNo: 'VOUCH-DIS-२०८१-००३', status: 'वितरण सम्पन्न' },
  { id: 'df-4', disasterTitle: 'बाँसखर्क हावाहुरी तथा छाना उडाएको', wardNumber: 1, beneficiaryName: 'दिल बहादुर घले', citizenshipNo: '२७-०१-७०-०५६७८', familyCount: 4, reliefType: 'पुनर्स्थापना सहयोग', amountNPR: 20000, distributionDateBs: '२०८१-०५-१६', disbursedByOfficer: 'नवराज पौडेल (विपद् अधिकृत)', voucherNo: 'VOUCH-DIS-२०८१-००४', status: 'वितरण सम्पन्न' }
];

const INITIAL_VULNERABLE_SETTLEMENTS: VulnerableSettlement[] = [
  { id: 'vs-1', settlementName: 'मानेखर्क भिरालो बस्ती (माथिल्लो टोल)', wardNumber: 5, hazardType: 'पहिरो (Landslide)', riskLevel: 'अति उच्च', atRiskHouseholds: 42, atRiskPopulation: 195, resettlementPriority: 'तत्काल सुरक्षित स्थानान्तरण', safeShelterName: 'मानेखर्क सामुदायिक भवन तथा मा.वि.', focalPerson: 'मिङ्मार शेर्पा', focalPersonPhone: '९८४१२२३३४४' },
  { id: 'vs-2', settlementName: 'तिम्बु खोला तटीय बजार तथा बस्ती', wardNumber: 2, hazardType: 'बाढी/कटान (Flood)', riskLevel: 'उच्च', atRiskHouseholds: 28, atRiskPopulation: 130, resettlementPriority: 'तटबन्धन/रोकथाम निर्माण', safeShelterName: 'तिम्बु स्वास्थ्य चौकी भवन', focalPerson: 'पेम्बा दोर्जे', focalPersonPhone: '९८४१५५६६७७' },
  { id: 'vs-3', settlementName: 'भोताङ लेकाली भिर बस्ती', wardNumber: 3, hazardType: 'पहिरो (Landslide)', riskLevel: 'अति उच्च', atRiskHouseholds: 25, atRiskPopulation: 115, resettlementPriority: 'तत्काल सुरक्षित स्थानान्तरण', safeShelterName: 'भोताङ कभर्ड हल', focalPerson: 'दावा लामा', focalPersonPhone: '९८५१२३४५६७' },
  { id: 'vs-4', settlementName: 'सेर्माथाङ डाँडा बस्ती', wardNumber: 3, hazardType: 'हिमपात/हिमपहिरो (Snow)', riskLevel: 'मध्यम', atRiskHouseholds: 18, atRiskPopulation: 76, resettlementPriority: 'पूर्वतयारी तथा सतर्कता', safeShelterName: 'सेर्माथाङ गुम्बा परिसर', focalPerson: 'तेन्जिङ नोर्बु', focalPersonPhone: '९८४१६६७७८८' },
  { id: 'vs-5', settlementName: 'बरुवा खोला गल्छी बस्ती', wardNumber: 8, hazardType: 'बाढी/कटान (Flood)', riskLevel: 'उच्च', atRiskHouseholds: 22, atRiskPopulation: 104, resettlementPriority: 'तटबन्धन/रोकथाम निर्माण', safeShelterName: 'बरुवा आधारभूत विद्यालय', focalPerson: 'सूर्य बहादुर तामाङ', focalPersonPhone: '९८०८१२३४५६' }
];

export const DisasterPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<
    | 'events'
    | 'relief_inventory'
    | 'relief_funds'
    | 'vulnerable_settlements'
    | 'environmental_risks'
    | 'shelters'
    | 'hydromet'
    | 'cameras'
    | 'broadcast'
    | 'recovery_projects'
  >('events');
  const [selectedCamera, setSelectedCamera] = useState<CameraItem | null>(null);
  const [cameraFilter, setCameraFilter] = useState<string>('all');
  const [riskSeverityFilter, setRiskSeverityFilter] = useState<string>('all');
  const [riskTypeFilter, setRiskTypeFilter] = useState<string>('all');

  const { data: environmentalRisks = [], isLoading: isRisksLoading } = useQuery<any[]>({
    queryKey: ['gis-environmental-risks', riskSeverityFilter, riskTypeFilter],
    queryFn: () => {
      let url = '/gis/environmental-risks?';
      if (riskSeverityFilter !== 'all') url += `severity_level=${encodeURIComponent(riskSeverityFilter)}&`;
      if (riskTypeFilter !== 'all') url += `risk_type=${encodeURIComponent(riskTypeFilter)}&`;
      return api.get(url).then((r: any) => Array.isArray(r) ? r : r.data || []);
    },
  });

  const { data: riskStats } = useQuery<any>({
    queryKey: ['gis-environmental-risks-stats'],
    queryFn: () => api.get('/gis/environmental-risks/stats').then((r: any) => r.data || r),
  });

  // Municipal Relief Inventory State
  const [reliefItems, setReliefItems] = useState<ReliefInventoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('palika_relief_inventory');
      return saved ? JSON.parse(saved) : INITIAL_RELIEF_INVENTORY;
    } catch {
      return INITIAL_RELIEF_INVENTORY;
    }
  });
  const [isReliefModalOpen, setIsReliefModalOpen] = useState(false);
  const [reliefCategoryFilter, setReliefCategoryFilter] = useState<string>('all');

  // Municipal Relief Fund Distributions State
  const [reliefFunds, setReliefFunds] = useState<DisasterFundDistribution[]>(() => {
    try {
      const saved = localStorage.getItem('palika_disaster_funds');
      return saved ? JSON.parse(saved) : INITIAL_RELIEF_FUNDS;
    } catch {
      return INITIAL_RELIEF_FUNDS;
    }
  });
  const [isFundModalOpen, setIsFundModalOpen] = useState(false);

  // Vulnerable Settlements State
  const [vulnerableSettlements, setVulnerableSettlements] = useState<VulnerableSettlement[]>(() => {
    try {
      const saved = localStorage.getItem('palika_vulnerable_settlements');
      return saved ? JSON.parse(saved) : INITIAL_VULNERABLE_SETTLEMENTS;
    } catch {
      return INITIAL_VULNERABLE_SETTLEMENTS;
    }
  });
  const [isSettlementModalOpen, setIsSettlementModalOpen] = useState(false);

  // Modal and Filter states
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<DisasterEvent | null>(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [filterWard, setFilterWard] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Shelter states
  const [isShelterModalOpen, setIsShelterModalOpen] = useState(false);
  const [selectedShelter, setSelectedShelter] = useState<Shelter | null>(null);
  const [shelterWardFilter, setShelterWardFilter] = useState<number | 'all'>('all');

  // Emergency Alert Broadcast State
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [hazardType, setHazardType] = useState('flood');
  const [targetWard, setTargetWard] = useState<number | 'all'>('all');
  const [useSms, setUseSms] = useState(true);
  const [useWhatsapp, setUseWhatsapp] = useState(true);
  const [isSuccessNotification, setIsSuccessNotification] = useState(false);

  const { data: events = [], isLoading: isEventsLoading } = useQuery<DisasterEvent[]>({
    queryKey: ['disaster-events'],
    queryFn: () => disasterApi.getEvents(),
  });

  const { data: contacts = [] } = useQuery<EmergencyContact[]>({
    queryKey: ['emergency-contacts'],
    queryFn: () => disasterApi.getContacts(),
  });

  const { data: shelters = [], isLoading: isSheltersLoading } = useQuery<Shelter[]>({
    queryKey: ['evacuation-shelters'],
    queryFn: () => disasterApi.getShelters(),
  });

  const { data: history = [] } = useQuery<BroadcastRecord[]>({
    queryKey: ['broadcast-history'],
    queryFn: () => sectoralApi.getBroadcastHistory() as Promise<BroadcastRecord[]>,
  });

  const { data: stats } = useQuery<BroadcastStats>({
    queryKey: ['broadcast-stats'],
    queryFn: () => sectoralApi.getBroadcastStats() as Promise<BroadcastStats>,
  });

  // IoT Sensors Telemetry Query
  const { data: sensors = [], isLoading: isSensorsLoading, refetch: refetchSensors } = useQuery<SensorItem[]>({
    queryKey: ['iot-sensors'],
    queryFn: () => municipalityApi.getSensors(),
    refetchInterval: 12000,
  });

  useEffect(() => {
    const socket = getSensorsSocket();
    
    const handleSensorUpdate = (updatedSensor: SensorItem) => {
      queryClient.setQueryData<SensorItem[]>(['iot-sensors'], (oldSensors = []) => {
        const exists = oldSensors.find(s => s.sensorId === updatedSensor.sensorId);
        if (exists) {
          return oldSensors.map(s => s.sensorId === updatedSensor.sensorId ? updatedSensor : s);
        }
        return [...oldSensors, updatedSensor];
      });
    };

    socket.on('sensorUpdate', handleSensorUpdate);

    return () => {
      socket.off('sensorUpdate', handleSensorUpdate);
    };
  }, [queryClient]);

  // CCTV Cameras Query (Auto-refresh every 12s)
  const { data: cameras = [], isLoading: isCamerasLoading, refetch: refetchCameras } = useQuery<CameraItem[]>({
    queryKey: ['cctv-cameras'],
    queryFn: () => municipalityApi.getCameras(),
    refetchInterval: 12000,
  });

  const { data: cameraStats } = useQuery({
    queryKey: ['camera-stats'],
    queryFn: () => municipalityApi.getCameraStats(),
    refetchInterval: 12000,
  });

  // Sensor Telemetry Trigger Mutation (Simulator)
  const sensorTelemetryMutation = useMutation({
    mutationFn: ({ sensorId, value }: { sensorId: string; value: number }) =>
      municipalityApi.pushSensorTelemetry(sensorId, value),
    onSuccess: () => {
      refetchSensors();
      queryClient.invalidateQueries({ queryKey: ['iot-sensors'] });
    },
  });

  // Camera Mock Ping Mutation (AI Footfall Simulator)
  const cameraPingMutation = useMutation({
    mutationFn: ({ cameraId, count }: { cameraId: string; count: number }) =>
      municipalityApi.mockCameraPing(cameraId, count),
    onSuccess: () => {
      refetchCameras();
      queryClient.invalidateQueries({ queryKey: ['cctv-cameras'] });
      queryClient.invalidateQueries({ queryKey: ['camera-stats'] });
    },
  });

  const activeSensorAlerts = sensors.filter(s => s.status === 'Warning' || s.status === 'Critical');

  // Event Mutations
  const createEventMutation = useMutation({
    mutationFn: (data: Partial<DisasterEvent>) => disasterApi.createEvent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disaster-events'] });
      setIsEventModalOpen(false);
      alert('नयाँ विपद् घटना सुरक्षित गरियो!');
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<DisasterEvent> }) =>
      disasterApi.updateEvent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disaster-events'] });
      setIsEventModalOpen(false);
      alert('विपद् विवरण अद्यावधिक गरियो!');
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: (id: string) => disasterApi.deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disaster-events'] });
    },
  });

  // Contact Mutations
  const createContactMutation = useMutation({
    mutationFn: (data: Partial<EmergencyContact>) => disasterApi.createContact(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emergency-contacts'] });
      setIsContactModalOpen(false);
      alert('आपतकालीन सम्पर्क सुरक्षित गरियो!');
    },
  });

  const deleteContactMutation = useMutation({
    mutationFn: (id: string) => sectoralApi.deleteEmergencyContact(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emergency-contacts'] });
    },
  });

  // Shelter Mutations
  const createShelterMutation = useMutation({
    mutationFn: (data: Partial<Shelter>) => disasterApi.createShelter(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evacuation-shelters'] });
      setIsShelterModalOpen(false);
      alert('नयाँ सुरक्षित आश्रयस्थल सफलतापूर्वक सुरक्षित गरियो!');
    },
  });

  const updateShelterMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Shelter> }) =>
      disasterApi.updateShelter(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evacuation-shelters'] });
      setIsShelterModalOpen(false);
      setSelectedShelter(null);
      alert('आश्रयस्थलको विवरण अद्यावधिक गरियो!');
    },
  });

  const deleteShelterMutation = useMutation({
    mutationFn: (id: string) => disasterApi.deleteShelter(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evacuation-shelters'] });
    },
  });

  const handleApplySensorAlert = (sensor: SensorItem) => {
    setActiveTab('broadcast');
    const type = sensor.type === 'water_level' ? 'flood' : sensor.type === 'rain_gauge' ? 'weather' : 'landslide';
    setHazardType(type);
    setTargetWard(sensor.ward || 'all');
    setAlertTitle(`🚨 ${sensor.name} - आपतकालीन ${sensor.status === 'Critical' ? 'उच्च खतरा' : 'पूर्वसतर्कता'} सूचना`);
    setAlertMessage(
      `🚨 पाँचपोखरी थाङपाल आपतकालीन पूर्वसूचना: ${sensor.name} (वडा नं. ${sensor.ward}) मा हाल ${
        sensor.type === 'water_level' ? 'जलसतह' : 'वर्षा'
      } ${sensor.currentValue} ${sensor.unit} पुगेको छ (खतरा स्तर: ${sensor.thresholdCritical || 4.5} ${
        sensor.unit
      })। सम्बन्धित वडा तथा तटीय क्षेत्रका सम्पूर्ण नागरिकहरूलाई उच्च सतर्कता अपनाउन र सुरक्षित आश्रयस्थलमा रहन अनुरोध छ। आपतकालीन हटलाइन: ०११-४६०१२३।`
    );
  };

  // Broadcast Mutation
  const broadcastMutation = useMutation({
    mutationFn: (payload: {
      title: string;
      message: string;
      hazardType: string;
      severity: string;
      targetWard: number | 'all';
      channels: string[];
    }) => sectoralApi.sendEmergencyBroadcast(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['broadcast-history'] });
      setIsSuccessNotification(true);
      setTimeout(() => setIsSuccessNotification(false), 4000);
    },
  });

  const handleExportCsv = () => {
    if (events.length === 0) {
      alert('कुनै विवरण उपलब्ध छैन');
      return;
    }
    const headers = ['शीर्षक', 'प्रकार', 'वडा नं', 'जोखिम स्तर', 'मिति (BS)', 'प्रभावित घरधुरी', 'क्षति (रु.)', 'स्थिति', 'राहत'];
    const rows = events.map((e) => [
      `"${e.title || ''}"`,
      `"${e.type || ''}"`,
      e.wardNumber || '',
      `"${e.severity || ''}"`,
      `"${e.incidentDateBs || e.dateReportedBs || ''}"`,
      e.affectedHouseholds ?? 0,
      e.estimatedLossNPR ?? 0,
      `"${e.status || ''}"`,
      `"${e.reliefStatus || e.reliefDistributed || ''}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `disaster_events_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const emergencyTemplates = [
    {
      label: 'मेलम्ची खोला बाढी सतर्कता',
      icon: <Waves size={14} />,
      type: 'flood',
      title: 'मेलम्ची खोला तटीय क्षेत्र बाढी सतर्कता सूचना',
      msg: '🚨 पाँचपोखरी थाङपाल गाउँपालिका विपद् पूर्वसूचना: भारी वर्षाका कारण मेलम्ची खोलामा जलसतह ५.२ मिटर पुगेको छ। तटीय क्षेत्रका नागरिकहरू तुरुन्तै अग्लो र सुरक्षित स्थानमा जानुहोला। आपतकालीन हटलाइन: ९८५११*****।',
    },
    {
      label: 'मानेखर्क पहिरो जोखिम',
      icon: <Mountain size={14} />,
      type: 'landslide',
      title: 'मानेखर्क भिरालो क्षेत्र पहिरो चेतावनी',
      msg: '⚠️ पाँचपोखरी गाउँपालिका सतर्कता: निरन्तर वर्षाका कारण मानेखर्क भिरालो जमिनमा पहिरोको जोखिम बढेको छ। जोखिमयुक्त बस्तीका बासिन्दा सामुदायिक भवनमा स्थानान्तरण हुनुहोला। सम्पर्क: ९८४१२२३३४४।',
    },
    {
      label: 'पाँचपोखरी पदमार्ग हिमपात',
      icon: <CloudSnow size={14} />,
      type: 'weather',
      title: 'पाँचपोखरी उच्च हिमाली पदमार्ग मौसम सतर्कता',
      msg: '❄️ पाँचपोखरी पदमार्ग क्षेत्र (४,१००m) मा भारी हिमपात र चिसो हावा चलेकोले पदयात्रा आजका लागि स्थगित गर्न अनुरोध छ। उद्धार टोली सम्पर्क: ९८४१******।',
    },
    {
      label: 'सुरक्षित आश्रयस्थल सूचना',
      icon: <Building size={14} />,
      type: 'evacuation',
      title: 'सुरक्षित आश्रयस्थल तथा राहत केन्द्र सञ्चालन',
      msg: '📢 पाँचपोखरी गाउँपालिका सूचना: थाङपालधाप माध्यमिक विद्यालय र भोताङ सामुदायिक भवनमा सुरक्षित आश्रयस्थल, खाना र प्राथमिक उपचारको व्यवस्था गरिएको छ।',
    },
  ];

  const handleApplyTemplate = (tmpl: (typeof emergencyTemplates)[0]) => {
    setAlertTitle(tmpl.title);
    setAlertMessage(tmpl.msg);
    setHazardType(tmpl.type);
  };

  const handleSendBroadcast = () => {
    const channels: string[] = [];
    if (useSms) channels.push('sms');
    if (useWhatsapp) channels.push('whatsapp');
    if (channels.length === 0) {
      alert('कृपया कम्तीमा एउटा प्रसारण माध्यम (SMS वा WhatsApp) छान्नुहोस्।');
      return;
    }

    broadcastMutation.mutate({
      title: alertTitle,
      message: alertMessage,
      hazardType,
      severity: 'high',
      targetWard,
      channels,
    });
  };

  const getSeverityBadge = (severity: DisasterEvent['severity']) => {
    switch (severity) {
      case 'critical':
        return <span className="dt-badge dt-badge-danger">अति संवेदनशील</span>;
      case 'high':
        return <span className="dt-badge dt-badge-danger">उच्च सतर्कता (High)</span>;
      case 'medium':
        return <span className="dt-badge dt-badge-warning">मध्यम जोखिम</span>;
      default:
        return <span className="dt-badge dt-badge-info">सामान्य</span>;
    }
  };

  const filteredShelters = shelters.filter((s) => {
    return shelterWardFilter === 'all' || s.wardNumber === shelterWardFilter;
  });
  const totalShelterCapacity = shelters.reduce((acc, s) => acc + (s.capacity || 0), 0);

  const filteredEvents = events.filter((e) => {
    const matchWard = filterWard === 'all' || e.wardNumber === filterWard;
    const matchQuery =
      !searchQuery ||
      (e.title && e.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (e.description && e.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchWard && matchQuery;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={28} color="#e11d48" />
            <span>विपद् व्यवस्थापन तथा नागरिक पूर्वसूचना प्रणाली</span>
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            बाढी, पहिरो तथा प्राकृतिक विपद् प्रत्यक्ष अनुगमन, राहत व्यवस्थापन र नागरिक आपतकालीन SMS/WhatsApp प्रसारण गेटवे
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              setSelectedEvent(null);
              setIsEventModalOpen(true);
            }}
            className="dt-btn dt-btn-primary"
            style={{ backgroundColor: '#dc2626', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Plus size={16} /> नयाँ विपद् घटना दर्ता
          </button>
          <button
            onClick={handleExportCsv}
            className="dt-btn"
            style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Download size={16} /> CSV निर्यात
          </button>
        </div>
      </div>

      {/* Navigation Tabs (8 Municipal Disaster Subsystems) */}
      <div className="dt-card" style={{ padding: '0.75rem 1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('events')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              backgroundColor: activeTab === 'events' ? '#dc2626' : '#f1f5f9',
              color: activeTab === 'events' ? '#ffffff' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <AlertTriangle size={15} />
            <span>१. विपद् घटना तथा पूर्वसूचना</span>
          </button>

          <button
            onClick={() => setActiveTab('relief_inventory')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              backgroundColor: activeTab === 'relief_inventory' ? '#d97706' : '#f1f5f9',
              color: activeTab === 'relief_inventory' ? '#ffffff' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <Boxes size={15} />
            <span>२. राहत सामग्री जिन्सी भण्डार</span>
            <span style={{ backgroundColor: activeTab === 'relief_inventory' ? 'rgba(255,255,255,0.3)' : '#e2e8f0', color: activeTab === 'relief_inventory' ? '#fff' : '#475569', fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '10px', fontWeight: 700 }}>
              {reliefItems.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('relief_funds')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              backgroundColor: activeTab === 'relief_funds' ? '#059669' : '#f1f5f9',
              color: activeTab === 'relief_funds' ? '#ffffff' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <Coins size={15} />
            <span>३. पालिका विपद् कोष राहत वितरण</span>
            <span style={{ backgroundColor: activeTab === 'relief_funds' ? 'rgba(255,255,255,0.3)' : '#e2e8f0', color: activeTab === 'relief_funds' ? '#fff' : '#475569', fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '10px', fontWeight: 700 }}>
              रु. {(reliefFunds.reduce((a, b) => a + b.amountNPR, 0) / 1000).toFixed(0)}K
            </span>
          </button>

          <button
            onClick={() => setActiveTab('vulnerable_settlements')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              backgroundColor: activeTab === 'vulnerable_settlements' ? '#4f46e5' : '#f1f5f9',
              color: activeTab === 'vulnerable_settlements' ? '#ffffff' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <ShieldCheck size={15} />
            <span>४. जोखिमयुक्त बस्ती तथा स्थानान्तरण</span>
            <span style={{ backgroundColor: activeTab === 'vulnerable_settlements' ? 'rgba(255,255,255,0.3)' : '#e2e8f0', color: activeTab === 'vulnerable_settlements' ? '#fff' : '#475569', fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '10px', fontWeight: 700 }}>
              {vulnerableSettlements.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('environmental_risks')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              backgroundColor: activeTab === 'environmental_risks' ? '#dc2626' : '#f1f5f9',
              color: activeTab === 'environmental_risks' ? '#ffffff' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <AlertTriangle size={15} />
            <span>५. वातावरणीय तथा पहिरो/बाढी जोखिम क्षेत्र</span>
            <span style={{ backgroundColor: activeTab === 'environmental_risks' ? 'rgba(255,255,255,0.3)' : '#e2e8f0', color: activeTab === 'environmental_risks' ? '#fff' : '#475569', fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '10px', fontWeight: 700 }}>
              {environmentalRisks.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('shelters')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              backgroundColor: activeTab === 'shelters' ? 'var(--primary)' : '#f1f5f9',
              color: activeTab === 'shelters' ? '#ffffff' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <Building size={15} />
            <span>५. सुरक्षित आश्रयस्थल</span>
            <span style={{ backgroundColor: activeTab === 'shelters' ? 'rgba(255,255,255,0.3)' : '#e2e8f0', color: activeTab === 'shelters' ? '#fff' : '#475569', fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '10px', fontWeight: 700 }}>
              {shelters.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('hydromet')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              backgroundColor: activeTab === 'hydromet' ? '#0284c7' : '#f1f5f9',
              color: activeTab === 'hydromet' ? '#ffffff' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <Waves size={15} />
            <span>६. वर्षा तथा जलसतह (IoT)</span>
            {activeSensorAlerts.length > 0 && (
              <span style={{ backgroundColor: '#ef4444', color: '#fff', fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '10px', fontWeight: 700 }}>
                {activeSensorAlerts.length} अलर्ट
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('cameras')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              backgroundColor: activeTab === 'cameras' ? '#7c3aed' : '#f1f5f9',
              color: activeTab === 'cameras' ? '#ffffff' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <Video size={15} />
            <span>७. CCTV क्यामेरा</span>
            <span style={{ backgroundColor: '#10b981', color: '#fff', fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '10px', fontWeight: 700 }}>
              {cameras.length} Live
            </span>
          </button>

          <button
            onClick={() => setActiveTab('broadcast')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              backgroundColor: activeTab === 'broadcast' ? '#e11d48' : '#f1f5f9',
              color: activeTab === 'broadcast' ? '#ffffff' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <MessageSquare size={15} />
            <span>८. आपतकालीन SMS/WhatsApp प्रसारण</span>
          </button>

          <button
            onClick={() => setActiveTab('recovery_projects')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              backgroundColor: activeTab === 'recovery_projects' ? '#b45309' : '#f1f5f9',
              color: activeTab === 'recovery_projects' ? '#ffffff' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <HardHat size={15} />
            <span>९. विपद् पुनःलाभ तथा पुनर्निर्माण</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Events & Hotlines */}
      {activeTab === 'events' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Emergency Hotlines Row */}
          <div className="dt-card" style={{ background: '#fff1f2', border: '1px solid #fecdd3', padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#9f1239', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <PhoneCall size={20} /> आपतकालीन सम्पर्क नम्बरहरू (Emergency Hotlines)
              </h2>
              <button
                onClick={() => setIsContactModalOpen(true)}
                className="dt-btn"
                style={{ backgroundColor: '#ffffff', border: '1px solid #fecdd3', color: '#9f1239', fontSize: '0.8rem', padding: '0.3rem 0.6rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              >
                <Plus size={14} /> नयाँ सम्पर्क थप्नुहोस्
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
              {contacts.map((c: EmergencyContact) => (
                <div
                  key={c.id}
                  style={{
                    backgroundColor: '#ffffff',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid #ffe4e6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{c.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.role} {c.wardNumber ? `(वडा ${c.wardNumber})` : ''}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <a
                      href={`tel:${c.phone}`}
                      className="dt-btn dt-btn-primary"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', backgroundColor: '#e11d48' }}
                    >
                      {c.phone}
                    </a>
                    <button
                      onClick={() => {
                        if (confirm(`के तपाईं "${c.name}" हटाउन निश्चित हुनुहुन्छ?`)) {
                          deleteContactMutation.mutate(c.id!);
                        }
                      }}
                      style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8', padding: '0.2rem' }}
                      title="हटाउनुहोस्"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Disaster Alerts Table */}
          <div className="dt-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                हालका विपद् घटना तथा सतर्कता सूचना
              </h2>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="शीर्षक वा विवरण खोज्नुहोस्..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="dt-input"
                  style={{ width: '200px', fontSize: '0.85rem' }}
                />
                <select
                  value={filterWard}
                  onChange={(e) => setFilterWard(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                  className="dt-input"
                  style={{ width: '130px', fontSize: '0.85rem' }}
                >
                  <option value="all">सबै वडाहरू</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
                    <option key={w} value={w}>वडा नं. {w}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="dt-table-wrapper">
              <div className="dt-responsive-table-wrapper">
                <table className="dt-table">
                  <thead>
                    <tr>
                      <th>घटना / पूर्वसूचना तथा बस्ती</th>
                      <th>प्रकार</th>
                      <th>वडा नं.</th>
                      <th>जोखिम स्तर</th>
                      <th>मिति (B.S.)</th>
                      <th>क्षति विवरण (मानवीय/भौतिक)</th>
                      <th>स्थिति तथा राहत निकासा</th>
                      <th style={{ textAlign: 'center' }}>कार्यहरू</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isEventsLoading ? (
                      <tr>
                        <td colSpan={8} style={{ textAlign: 'center', padding: '1.5rem' }}>
                          लोड हुँदैछ...
                        </td>
                      </tr>
                    ) : filteredEvents.length === 0 ? (
                      <tr>
                        <td colSpan={8} style={{ textAlign: 'center', padding: '1.5rem' }}>
                          कुनै विपद् घटना भेटिएन।
                        </td>
                      </tr>
                    ) : (
                      filteredEvents.map((e: DisasterEvent) => (
                        <tr key={e.id}>
                          <td style={{ fontWeight: 600 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                              <span>{e.title}</span>
                              {e.tolsSettlement && (
                                <span style={{ fontSize: '0.72rem', backgroundColor: '#e2e8f0', color: '#1e293b', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>
                                  📍 {e.tolsSettlement}
                                </span>
                              )}
                            </div>
                            {e.description && (
                              <div style={{ fontSize: '0.75rem', color: '#64748b', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }}>
                                {e.description}
                              </div>
                            )}
                          </td>
                          <td>
                            <span className="dt-badge dt-badge-info">
                              {e.type === 'flood' ? 'बाढी' : e.type === 'landslide' ? 'पहिरो' : e.type === 'fire' ? 'आगलागी' : e.type}
                            </span>
                          </td>
                          <td>वडा {e.wardNumber || '-'}</td>
                          <td>{getSeverityBadge(e.severity)}</td>
                          <td>{e.incidentDateBs || e.dateReportedBs || '-'}</td>
                          <td>
                            <div style={{ fontSize: '0.76rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              <div><strong>{e.affectedHouseholds ?? 0}</strong> घरधुरी प्रभावित</div>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '2px' }}>
                                {(e.humanCasualties || 0) > 0 && (
                                  <span style={{ color: '#b91c1c', fontWeight: 700, backgroundColor: '#fee2e2', padding: '1px 5px', borderRadius: '3px' }}>
                                    मृतक: {e.humanCasualties}
                                  </span>
                                )}
                                {(e.missingPersons || 0) > 0 && (
                                  <span style={{ color: '#c2410c', fontWeight: 700, backgroundColor: '#ffedd5', padding: '1px 5px', borderRadius: '3px' }}>
                                    बेपत्ता: {e.missingPersons}
                                  </span>
                                )}
                                {(e.fullyDamagedHouses || 0) > 0 && (
                                  <span style={{ color: '#4338ca', backgroundColor: '#e0e7ff', padding: '1px 5px', borderRadius: '3px' }}>
                                    पूर्ण घर: {e.fullyDamagedHouses}
                                  </span>
                                )}
                                {(e.livestockLossCount || 0) > 0 && (
                                  <span style={{ color: '#047857', backgroundColor: '#d1fae5', padding: '1px 5px', borderRadius: '3px' }}>
                                    पशुधन: {e.livestockLossCount}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={`dt-badge ${e.status === 'resolved' ? 'dt-badge-success' : 'dt-badge-warning'}`}>
                              {e.status === 'resolved' ? 'नियन्त्रित' : 'सक्रिय'}
                            </span>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                              {e.reliefStatus || e.reliefDistributed || 'निगरानी भइरहेको'}
                            </div>
                            {(e.reliefDisbursedNPR || 0) > 0 && (
                              <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700, marginTop: '2px' }}>
                                कोष निकासा: रु. {e.reliefDisbursedNPR?.toLocaleString()}
                              </div>
                            )}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '0.3rem', justifyContent: 'center' }}>
                              {e.status !== 'resolved' && (
                                <button
                                  onClick={() => updateEventMutation.mutate({ id: e.id!, data: { status: 'resolved', reliefStatus: 'नियन्त्रित तथा राहत सम्पन्न' } })}
                                  className="dt-btn"
                                  style={{ padding: '0.25rem 0.4rem', fontSize: '0.75rem', backgroundColor: '#dcfce7', color: '#15803d', border: '1px solid #86efac' }}
                                  title="नियन्त्रित भएको जनाउनुहोस्"
                                >
                                  <CheckCircle size={13} />
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  setSelectedEvent(e);
                                  setIsEventModalOpen(true);
                                }}
                                className="dt-btn"
                                style={{ padding: '0.25rem 0.4rem', fontSize: '0.75rem', backgroundColor: '#f1f5f9', color: '#334155' }}
                                title="सम्पादन गर्नुहोस्"
                              >
                                <Edit size={13} />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`के तपाईं "${e.title}" मेटाउन निश्चित हुनुहुन्छ?`)) {
                                    deleteEventMutation.mutate(e.id!);
                                  }
                                }}
                                className="dt-btn"
                                style={{ padding: '0.25rem 0.4rem', fontSize: '0.75rem', backgroundColor: '#fee2e2', color: '#b91c1c' }}
                                title="मेटाउनुहोस्"
                              >
                                <Trash2 size={13} />
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
        </div>
      )}

      {/* Tab 2: Relief Inventory (आपतकालीन राहत सामग्री जिन्सी भण्डार) */}
      {activeTab === 'relief_inventory' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Header & Controls */}
          <div className="dt-card" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#92400e', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Boxes size={22} color="#d97706" />
                <span>आपतकालीन राहत सामग्री तथा जिन्सी भण्डार (Relief Stock Inventory)</span>
              </h2>
              <div style={{ fontSize: '0.825rem', color: '#64748b', marginTop: '3px' }}>
                पाँचपोखरी थाङपाल गाउँपालिकाका मुख्य तथा वडास्तरीय गोदाममा मौज्दात उद्धार तथा राहत सामग्री विवरण
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <select
                className="dt-select"
                value={reliefCategoryFilter}
                onChange={(e) => setReliefCategoryFilter(e.target.value)}
                style={{ fontSize: '0.825rem', padding: '0.45rem 0.75rem' }}
              >
                <option value="all">सबै वर्ग (All Categories)</option>
                <option value="shelter">अस्थायी आश्रय (त्रिपाल/टेन्ट)</option>
                <option value="search_rescue">खोज तथा उद्धार सामग्री</option>
                <option value="clothing">कम्बल तथा कपडा</option>
                <option value="medical">स्वास्थ्य तथा प्राथमिक उपचार</option>
                <option value="food">सुक्खा खाद्यान्न</option>
              </select>
              <button
                onClick={() => setIsReliefModalOpen(true)}
                className="dt-btn"
                style={{ backgroundColor: '#d97706', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600, fontSize: '0.825rem' }}
              >
                <Plus size={15} /> नयाँ जिन्सी सामग्री दर्ता
              </button>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="dt-card" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', borderLeft: '4px solid #d97706' }}>
              <div style={{ padding: '0.75rem', borderRadius: '8px', backgroundColor: '#fef3c7', color: '#d97706' }}>
                <Package size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>कुल सामग्री प्रकार</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{reliefItems.length} प्रकार</div>
              </div>
            </div>

            <div className="dt-card" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', borderLeft: '4px solid #0284c7' }}>
              <div style={{ padding: '0.75rem', borderRadius: '8px', backgroundColor: '#e0f2fe', color: '#0284c7' }}>
                <Tent size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>त्रिपाल तथा टेन्ट मौज्दात</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                  {reliefItems.filter(i => i.category === 'shelter').reduce((a, b) => a + b.quantity, 0)} थान
                </div>
              </div>
            </div>

            <div className="dt-card" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', borderLeft: '4px solid #16a34a' }}>
              <div style={{ padding: '0.75rem', borderRadius: '8px', backgroundColor: '#dcfce7', color: '#16a34a' }}>
                <Warehouse size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>सञ्चालित आपतकालीन डिपो</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>४ स्थान (केन्द्र+वडा)</div>
              </div>
            </div>
          </div>

          {/* Relief Inventory Table */}
          <div className="dt-card" style={{ padding: 0 }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="dt-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#fffbeb', borderBottom: '1.5px solid #fef3c7' }}>
                    <th style={{ padding: '0.75rem 0.85rem', textAlign: 'left' }}>सामग्रीको विवरण</th>
                    <th style={{ padding: '0.75rem 0.85rem' }}>वर्ग</th>
                    <th style={{ padding: '0.75rem 0.85rem', textAlign: 'right' }}>मौज्दात परिमाण</th>
                    <th style={{ padding: '0.75rem 0.85rem' }}>भण्डारण गोदाम / स्थान</th>
                    <th style={{ padding: '0.75rem 0.85rem' }}>वडा नं.</th>
                    <th style={{ padding: '0.75rem 0.85rem' }}>अवस्था</th>
                    <th style={{ padding: '0.75rem 0.85rem' }}>सम्पर्क जिम्मेवार</th>
                    <th style={{ padding: '0.75rem 0.85rem', textAlign: 'center' }}>कार्य</th>
                  </tr>
                </thead>
                <tbody>
                  {reliefItems
                    .filter(i => reliefCategoryFilter === 'all' || i.category === reliefCategoryFilter)
                    .map((item) => (
                      <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.75rem 0.85rem', fontWeight: 700, color: '#0f172a' }}>{item.itemName}</td>
                        <td style={{ padding: '0.75rem 0.85rem' }}>
                          <span style={{ fontSize: '0.725rem', padding: '2px 6px', borderRadius: '4px', backgroundColor: '#fef3c7', color: '#92400e', fontWeight: 600 }}>
                            {item.category === 'shelter' ? 'अस्थायी आश्रय' : item.category === 'search_rescue' ? 'खोज तथा उद्धार' : item.category === 'clothing' ? 'कपडा/कम्बल' : item.category === 'medical' ? 'औषधि/किट' : 'खाद्यान्न'}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem 0.85rem', textAlign: 'right', fontWeight: 800, color: '#0284c7' }}>
                          {item.quantity.toLocaleString()} {item.unit}
                        </td>
                        <td style={{ padding: '0.75rem 0.85rem', color: '#475569' }}>
                          <Warehouse size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle', color: '#94a3b8' }} />
                          {item.warehouseLocation}
                        </td>
                        <td style={{ padding: '0.75rem 0.85rem' }}>वडा {item.wardNumber}</td>
                        <td style={{ padding: '0.75rem 0.85rem' }}>
                          <span style={{
                            fontSize: '0.725rem',
                            padding: '2px 7px',
                            borderRadius: '12px',
                            fontWeight: 700,
                            backgroundColor: item.condition === 'good' ? '#dcfce7' : item.condition === 'needs_restock' ? '#fef3c7' : '#fee2e2',
                            color: item.condition === 'good' ? '#166534' : item.condition === 'needs_restock' ? '#b45309' : '#b91c1c'
                          }}>
                            {item.condition === 'good' ? 'उपलब्ध (Good)' : item.condition === 'needs_restock' ? 'थप मौज्दात आवश्यक' : 'क्षतिग्रस्त'}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem 0.85rem', fontSize: '0.8rem', color: '#64748b' }}>{item.contactPerson || '-'}</td>
                        <td style={{ padding: '0.75rem 0.85rem', textAlign: 'center' }}>
                          <button
                            onClick={() => {
                              if (confirm(`के तपाईं "${item.itemName}" हटाउन चाहनुहुन्छ?`)) {
                                const updated = reliefItems.filter(i => i.id !== item.id);
                                setReliefItems(updated);
                                localStorage.setItem('palika_relief_inventory', JSON.stringify(updated));
                              }
                            }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                            title="हटाउनुहोस्"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Disaster Relief Funds (पालिका विपद् कोष राहत वितरण) */}
      {activeTab === 'relief_funds' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Header */}
          <div className="dt-card" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#047857', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Coins size={22} color="#059669" />
                <span>पालिका विपद् कोष राहत वितरण लगत (Disaster Relief Funds)</span>
              </h2>
              <div style={{ fontSize: '0.825rem', color: '#64748b', marginTop: '3px' }}>
                स्थानीय विपद् कोष तथा राहत वितरण मापदण्ड बमोजिम पीडित घरधुरीलाई प्रत्यक्ष निकासा गरिएको राहत
              </div>
            </div>
            <button
              onClick={() => setIsFundModalOpen(true)}
              className="dt-btn"
              style={{ backgroundColor: '#059669', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600, fontSize: '0.825rem' }}
            >
              <Plus size={15} /> नयाँ राहत वितरण दर्ता
            </button>
          </div>

          {/* Quick Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="dt-card" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', borderLeft: '4px solid #059669' }}>
              <div style={{ padding: '0.75rem', borderRadius: '8px', backgroundColor: '#d1fae5', color: '#059669' }}>
                <Coins size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>कुल निकासा राहत रकम</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#047857' }}>
                  रु. {reliefFunds.reduce((a, b) => a + b.amountNPR, 0).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="dt-card" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', borderLeft: '4px solid #0284c7' }}>
              <div style={{ padding: '0.75rem', borderRadius: '8px', backgroundColor: '#e0f2fe', color: '#0284c7' }}>
                <Users size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>लाभान्वित घरधुरी</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
                  {reliefFunds.length} परिवार
                </div>
              </div>
            </div>

            <div className="dt-card" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', borderLeft: '4px solid #7c3aed' }}>
              <div style={{ padding: '0.75rem', borderRadius: '8px', backgroundColor: '#ede9fe', color: '#7c3aed' }}>
                <CheckCircle2 size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>वितरण सम्पन्न दर</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#7c3aed' }}>१००% (लेखा परीक्षण योग्य)</div>
              </div>
            </div>
          </div>

          {/* Fund Distributions Table */}
          <div className="dt-card" style={{ padding: 0 }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="dt-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#ecfdf5', borderBottom: '1.5px solid #a7f3d0' }}>
                    <th style={{ padding: '0.75rem 0.85rem', textAlign: 'left' }}>लाभार्थी कृषक/नागरिक</th>
                    <th style={{ padding: '0.75rem 0.85rem' }}>नागरिकता नं. / वडा</th>
                    <th style={{ padding: '0.75rem 0.85rem' }}>सम्बन्धित विपद् घटना</th>
                    <th style={{ padding: '0.75rem 0.85rem' }}>राहत प्रकार</th>
                    <th style={{ padding: '0.75rem 0.85rem', textAlign: 'right' }}>निकासा रकम (रु.)</th>
                    <th style={{ padding: '0.75rem 0.85rem' }}>भौचर नं.</th>
                    <th style={{ padding: '0.75rem 0.85rem' }}>वितरण मिति</th>
                    <th style={{ padding: '0.75rem 0.85rem' }}>प्रमाणीकरण अधिकृत</th>
                    <th style={{ padding: '0.75rem 0.85rem', textAlign: 'center' }}>कार्य</th>
                  </tr>
                </thead>
                <tbody>
                  {reliefFunds.map((rf) => (
                    <tr key={rf.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.75rem 0.85rem', fontWeight: 700, color: '#0f172a' }}>
                        <div>{rf.beneficiaryName}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>परिवार: {rf.familyCount} जना</div>
                      </td>
                      <td style={{ padding: '0.75rem 0.85rem' }}>
                        <div>वडा नं. {rf.wardNumber}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{rf.citizenshipNo || '-'}</div>
                      </td>
                      <td style={{ padding: '0.75rem 0.85rem', color: '#334155' }}>{rf.disasterTitle}</td>
                      <td style={{ padding: '0.75rem 0.85rem' }}>
                        <span style={{ fontSize: '0.725rem', padding: '2px 6px', borderRadius: '4px', backgroundColor: '#ecfdf5', color: '#065f46', fontWeight: 700 }}>
                          {rf.reliefType}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 0.85rem', textAlign: 'right', fontWeight: 800, color: '#047857', fontSize: '0.95rem' }}>
                        रु. {rf.amountNPR.toLocaleString()}
                      </td>
                      <td style={{ padding: '0.75rem 0.85rem', fontSize: '0.775rem', color: '#64748b', fontFamily: 'monospace' }}>
                        {rf.voucherNo || '-'}
                      </td>
                      <td style={{ padding: '0.75rem 0.85rem', fontSize: '0.8rem' }}>{rf.distributionDateBs}</td>
                      <td style={{ padding: '0.75rem 0.85rem', fontSize: '0.8rem', color: '#475569' }}>{rf.disbursedByOfficer}</td>
                      <td style={{ padding: '0.75rem 0.85rem', textAlign: 'center' }}>
                        <button
                          onClick={() => {
                            if (confirm(`के तपाईं "${rf.beneficiaryName}" को राहत रेकर्ड हटाउन चाहनुहुन्छ?`)) {
                              const updated = reliefFunds.filter(f => f.id !== rf.id);
                              setReliefFunds(updated);
                              localStorage.setItem('palika_disaster_funds', JSON.stringify(updated));
                            }
                          }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                          title="हटाउनुहोस्"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Vulnerable Settlements (जोखिमयुक्त बस्ती तथा स्थानान्तरण योजना) */}
      {activeTab === 'vulnerable_settlements' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Header */}
          <div className="dt-card" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#4338ca', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={22} color="#4f46e5" />
                <span>उच्च जोखिमयुक्त बस्ती पहिचान तथा स्थानान्तरण योजना (Vulnerable Settlements)</span>
              </h2>
              <div style={{ fontSize: '0.825rem', color: '#64748b', marginTop: '3px' }}>
                पहिरो, बाढी तथा नदी कटानबाट प्रभावित हुन सक्ने अति संवेदनशील बस्ती तथा सुरक्षित आश्रयस्थल म्यापिङ
              </div>
            </div>
            <button
              onClick={() => setIsSettlementModalOpen(true)}
              className="dt-btn"
              style={{ backgroundColor: '#4f46e5', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600, fontSize: '0.825rem' }}
            >
              <Plus size={15} /> नयाँ जोखिम बस्ती दर्ता
            </button>
          </div>

          {/* Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
            {vulnerableSettlements.map((vs) => {
              const isCritical = vs.riskLevel === 'अति उच्च';
              const isHigh = vs.riskLevel === 'उच्च';
              const badgeBg = isCritical ? '#fee2e2' : isHigh ? '#ffedd5' : '#fef3c7';
              const badgeColor = isCritical ? '#991b1b' : isHigh ? '#9a3412' : '#92400e';

              return (
                <div key={vs.id} className="dt-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.85rem', borderLeft: `4px solid ${isCritical ? '#dc2626' : isHigh ? '#ea580c' : '#ca8a04'}` }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', backgroundColor: '#f1f5f9', color: '#334155' }}>
                        वडा नं. {vs.wardNumber}
                      </span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', backgroundColor: badgeBg, color: badgeColor }}>
                        {vs.riskLevel} जोखिम
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '0.2rem 0 0.4rem' }}>
                      {vs.settlementName}
                    </h3>

                    <div style={{ fontSize: '0.825rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                      <div>⚠️ जोखिम प्रकार: <strong>{vs.hazardType}</strong></div>
                      <div>👥 जोखिम घरधुरी: <strong>{vs.atRiskHouseholds} घरधुरी</strong> ({vs.atRiskPopulation} नागरिक)</div>
                      <div style={{ padding: '0.45rem 0.65rem', borderRadius: '6px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', marginTop: '0.3rem' }}>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>स्थानान्तरण प्राथमिकता / रणनीति:</div>
                        <div style={{ fontWeight: 700, color: isCritical ? '#b91c1c' : '#0f172a' }}>{vs.resettlementPriority}</div>
                      </div>
                      {vs.safeShelterName && (
                        <div style={{ fontSize: '0.78rem', color: '#166534', marginTop: '0.2rem' }}>
                          🏛️ तोकिएको आश्रयस्थल: <strong>{vs.safeShelterName}</strong>
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '0.65rem' }}>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      {vs.focalPerson ? `सम्पर्क: ${vs.focalPerson} (${vs.focalPersonPhone})` : 'सम्पर्क उपलब्ध छैन'}
                    </div>
                    <button
                      onClick={() => {
                        if (confirm(`के तपाईं "${vs.settlementName}" हटाउन चाहनुहुन्छ?`)) {
                          const updated = vulnerableSettlements.filter(s => s.id !== vs.id);
                          setVulnerableSettlements(updated);
                          localStorage.setItem('palika_vulnerable_settlements', JSON.stringify(updated));
                        }
                      }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                      title="हटाउनुहोस्"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 5: Environmental & Hazard GIS Risk Zones (वातावरणीय तथा पहिरो/बाढी जोखिम क्षेत्र) */}
      {activeTab === 'environmental_risks' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Header */}
          <div className="dt-card" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#b91c1c', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={22} color="#dc2626" />
                <span>वातावरणीय, पहिरो तथा बाढी जोखिम क्षेत्र (Environmental Risk Zones Twin)</span>
              </h2>
              <div style={{ fontSize: '0.825rem', color: '#64748b', marginTop: '3px' }}>
                इन्जिनियर तथा प्राविधिकद्वारा जीआईएस पोलिगन नक्साङ्कन गरिएका पहिरो, बाढी, हिमताल विस्फोटन (GLOF) तथा भू-क्षय जोखिम क्षेत्रहरू
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => window.open('/gis-map', '_blank')}
                className="dt-btn"
                style={{ backgroundColor: '#0284c7', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600, fontSize: '0.825rem' }}
              >
                🌐 GIS डिजिटल नक्सामा हेर्नुहोस्
              </button>
            </div>
          </div>

          {/* KPI Analytics Stats Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div className="dt-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.1rem' }}>
              <div style={{ padding: '0.75rem', borderRadius: '10px', backgroundColor: 'rgba(220, 38, 38, 0.1)', color: '#dc2626' }}>
                <AlertTriangle size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>कुल पहिचान गरिएका जोखिम क्षेत्र</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>{riskStats?.totalRisks || environmentalRisks.length} स्थान</div>
              </div>
            </div>

            <div className="dt-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.1rem' }}>
              <div style={{ padding: '0.75rem', borderRadius: '10px', backgroundColor: 'rgba(234, 88, 12, 0.1)', color: '#ea580c' }}>
                <Mountain size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>उच्च तथा अति-उच्च संवेदनशीलता</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ea580c' }}>{riskStats?.highOrExtreme || 6} स्थान</div>
              </div>
            </div>

            <div className="dt-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.1rem' }}>
              <div style={{ padding: '0.75rem', borderRadius: '10px', backgroundColor: 'rgba(5, 150, 105, 0.1)', color: '#059669' }}>
                <CheckCircle2 size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>नियन्त्रण तथा पूर्वसूचना जडान</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#059669' }}>{riskStats?.mitigated || 3} स्थान</div>
              </div>
            </div>

            <div className="dt-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.1rem' }}>
              <div style={{ padding: '0.75rem', borderRadius: '10px', backgroundColor: 'rgba(2, 132, 199, 0.1)', color: '#0284c7' }}>
                <Activity size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>नियमित अनुगमन तथा नियन्त्रण कार्य</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0284c7' }}>{riskStats?.inProgress || 5} स्थान</div>
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="dt-card" style={{ padding: '0.85rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569' }}>जोखिम प्रकार:</label>
                <select
                  value={riskTypeFilter}
                  onChange={(e) => setRiskTypeFilter(e.target.value)}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    background: '#f8fafc'
                  }}
                >
                  <option value="all">सबै विपद् प्रकार</option>
                  <option value="Flood">बाढी (Flood)</option>
                  <option value="Landslide">पहिरो (Landslide)</option>
                  <option value="GLOF">हिमताल विस्फोटन (GLOF)</option>
                  <option value="Avalanche">हिमपहिरो (Avalanche)</option>
                  <option value="Forest Fire">वन डढेलो (Forest Fire)</option>
                  <option value="Soil Erosion">भू-क्षय (Soil Erosion)</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569' }}>संवेदनशीलता:</label>
                <select
                  value={riskSeverityFilter}
                  onChange={(e) => setRiskSeverityFilter(e.target.value)}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    background: '#f8fafc'
                  }}
                >
                  <option value="all">सबै स्तर</option>
                  <option value="Extreme">अति उच्च (Extreme)</option>
                  <option value="High">उच्च (High)</option>
                  <option value="Moderate">मध्यम (Moderate)</option>
                </select>
              </div>
            </div>

            <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
              कुल नतिजा: <strong>{environmentalRisks.length}</strong> वटा जोखिम क्षेत्र
            </div>
          </div>

          {/* Risk Registry Table */}
          <div className="dt-card" style={{ padding: 0, overflow: 'hidden' }}>
            {isRisksLoading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>जोखिम क्षेत्र लोड हुँदैछ...</div>
            ) : environmentalRisks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>कुनै जोखिम क्षेत्र भेटिएन।</div>
            ) : (
              <div className="dt-responsive-table-wrapper" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
                      <th style={{ padding: '0.85rem 1rem' }}>संकेत नं. (ID)</th>
                      <th style={{ padding: '0.85rem 1rem' }}>जोखिम प्रकार (Hazard Type)</th>
                      <th style={{ padding: '0.85rem 1rem' }}>संवेदनशीलता (Severity Level)</th>
                      <th style={{ padding: '0.85rem 1rem' }}>व्यवस्थापन अवस्था (Mitigation)</th>
                      <th style={{ padding: '0.85rem 1rem' }}>जीआईएस बहुभुज (GeoJSON Boundary)</th>
                      <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>कार्य</th>
                    </tr>
                  </thead>
                  <tbody>
                    {environmentalRisks.map((item: any) => {
                      const isExtreme = item.severity_level === 'Extreme' || item.severityLevel === 'Extreme';
                      const isHigh = item.severity_level === 'High' || item.severityLevel === 'High';
                      const riskTypeNepali: Record<string, string> = {
                        Flood: 'बाढी (Flood)',
                        Landslide: 'पहिरो (Landslide)',
                        GLOF: 'हिमताल विस्फोटन (GLOF)',
                        Avalanche: 'हिमपहिरो (Avalanche)',
                        'Forest Fire': 'वन डढेलो (Forest Fire)',
                        'Soil Erosion': 'भू-क्षय (Soil Erosion)'
                      };
                      const coords = item.gis_polygon?.coordinates?.[0] || item.gisPolygon?.coordinates?.[0] || [];

                      return (
                        <tr
                          key={item.id}
                          style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s ease' }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = '#ffffff')}
                        >
                          <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#0f172a' }}>
                            <span style={{ background: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.78rem' }}>
                              {item.id}
                            </span>
                          </td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              fontWeight: 700,
                              color: item.risk_type === 'GLOF' ? '#b91c1c' : item.risk_type === 'Flood' ? '#0369a1' : item.risk_type === 'Landslide' ? '#b45309' : '#047857'
                            }}>
                              <AlertTriangle size={14} />
                              {riskTypeNepali[item.risk_type] || item.risk_type}
                            </span>
                          </td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <span style={{
                              display: 'inline-block',
                              fontSize: '0.74rem',
                              fontWeight: 800,
                              padding: '0.2rem 0.6rem',
                              borderRadius: '12px',
                              background: isExtreme ? '#fee2e2' : isHigh ? '#ffedd5' : '#fef9c3',
                              color: isExtreme ? '#991b1b' : isHigh ? '#9a3412' : '#854d0e',
                            }}>
                              {isExtreme ? 'अति उच्च (Extreme)' : isHigh ? 'उच्च (High)' : 'मध्यम (Moderate)'}
                            </span>
                          </td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <span style={{
                              display: 'inline-block',
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              padding: '0.2rem 0.6rem',
                              borderRadius: '12px',
                              background: item.mitigation_status === 'Mitigated' ? '#dcfce7' : item.mitigation_status === 'Early Warning Installed' ? '#e0f2fe' : item.mitigation_status === 'In Progress' ? '#fef3c7' : '#f1f5f9',
                              color: item.mitigation_status === 'Mitigated' ? '#166534' : item.mitigation_status === 'Early Warning Installed' ? '#0369a1' : item.mitigation_status === 'In Progress' ? '#92400e' : '#475569',
                            }}>
                              {item.mitigation_status === 'Early Warning Installed' ? '📡 पूर्वसूचना प्रणाली जडान' : item.mitigation_status === 'Mitigated' ? '✓ नियन्त्रण सम्पन्न' : item.mitigation_status === 'In Progress' ? 'कार्य प्रगतिमा' : item.mitigation_status || 'अनुगमनमा'}
                            </span>
                          </td>
                          <td style={{ padding: '0.85rem 1rem', fontSize: '0.78rem', color: '#64748b' }}>
                            {coords.length > 0 ? (
                              <span>Polygon ({coords.length} शीर्षविन्दु) • {coords[0]?.[1]?.toFixed(3)}°N, {coords[0]?.[0]?.toFixed(3)}°E</span>
                            ) : (
                              <span>बहुभुज नक्साङ्कन</span>
                            )}
                          </td>
                          <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                            <button
                              onClick={() => {
                                const lat = coords[0]?.[1] || 27.985;
                                const lng = coords[0]?.[0] || 85.642;
                                window.open(`/gis-map?filter=hazard&lat=${lat}&lng=${lng}`, '_blank');
                              }}
                              className="dt-btn"
                              style={{ padding: '0.25rem 0.6rem', fontSize: '0.76rem', background: '#f0f9ff', color: '#0284c7', border: '1px solid #bae6fd', cursor: 'pointer', fontWeight: 700 }}
                            >
                              नक्सामा हेर्नुहोस्
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Citizen Emergency SMS & WhatsApp Broadcast Gateway */}
      {activeTab === 'broadcast' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* KPI Header Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div className="dt-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '0.75rem', borderRadius: '10px', backgroundColor: 'rgba(225, 29, 72, 0.1)', color: '#e11d48' }}>
                <Send size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>पठाइएको आपतकालीन SMS</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{stats?.totalSmsDelivered?.toLocaleString() || '१२,६४०'} सन्देश</div>
              </div>
            </div>

            <div className="dt-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '0.75rem', borderRadius: '10px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                <CheckCircle2 size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>डेलिभरी सफलता दर</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{stats?.deliverySuccessRate || 99.4}%</div>
              </div>
            </div>

            <div className="dt-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '0.75rem', borderRadius: '10px', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#2563eb' }}>
                <Radio size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>गेटवे स्थिति</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#166534' }}>NTC + Ncell + WhatsApp</div>
              </div>
            </div>
          </div>

          {/* Success Banner */}
          {isSuccessNotification && (
            <div style={{ padding: '1rem', borderRadius: '8px', backgroundColor: '#dcfce7', border: '1px solid #86efac', color: '#166534', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={20} />
              <span>
                <strong>सफलतापूर्वक प्रसारण सम्पन्न!</strong> आपतकालीन सतर्कता SMS तथा WhatsApp सन्देश तोकिएका नागरिकहरूको मोबाइलमा सफलतापूर्वक पठाइयो।
              </span>
            </div>
          )}

          {/* Real-time IoT Threshold Alert Trigger */}
          {activeSensorAlerts.length > 0 && (
            <div
              style={{
                padding: '1.25rem',
                borderRadius: '12px',
                backgroundColor: '#fff1f2',
                border: '2px solid #e11d48',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
                boxShadow: '0 4px 12px rgba(225, 29, 72, 0.15)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ padding: '0.6rem', borderRadius: '50%', backgroundColor: '#e11d48', color: '#ffffff', display: 'flex' }}>
                  <ShieldAlert size={24} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, color: '#9f1239', fontSize: '1.05rem' }}>
                    🚨 प्रत्यक्ष IoT सेन्सर खतरा पूर्वसूचना ({activeSensorAlerts.length} वटा सेन्सर जोखिम स्तरमा!)
                  </div>
                  <div style={{ fontSize: '0.825rem', color: '#be123c', marginTop: '0.2rem' }}>
                    {activeSensorAlerts.map(s => `${s.name} (वडा ${s.ward}): ${s.currentValue} ${s.unit} [${s.status}]`).join(' • ')}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {activeSensorAlerts.map(sensor => (
                  <button
                    key={sensor.sensorId}
                    onClick={() => handleApplySensorAlert(sensor)}
                    className="dt-btn dt-btn-sm"
                    style={{
                      backgroundColor: '#e11d48',
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      cursor: 'pointer',
                    }}
                  >
                    <Send size={14} />
                    <span>{sensor.name} को SMS अलर्ट तयार गर्नुहोस्</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Composer & Phone Simulator Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.8fr) minmax(320px, 1.2fr)', gap: '1.5rem' }}>
            {/* Left: Composer Box */}
            <div className="dt-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MessageSquare size={18} color="#e11d48" />
                <span>आपतकालीन अलर्ट कम्पोजर (Broadcast Composer)</span>
              </h3>

              {/* Emergency Templates */}
              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
                  द्रुत आपतकालीन टेम्पलेटहरू (Quick Templates):
                </span>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {emergencyTemplates.map((t, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleApplyTemplate(t)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        padding: '0.35rem 0.65rem',
                        borderRadius: '6px',
                        border: '1px solid var(--border)',
                        backgroundColor: '#f8fafc',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {t.icon}
                      <span>{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title Input */}
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>
                  सतर्कता सूचनाको शीर्षक (Alert Title):
                </label>
                <input
                  type="text"
                  className="dt-input"
                  value={alertTitle}
                  onChange={(e) => setAlertTitle(e.target.value)}
                  style={{ width: '100%', fontSize: '0.9rem' }}
                />
              </div>

              {/* Message Body */}
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>
                  नागरिकलाई जाने SMS/WhatsApp सन्देश (Message Body):
                </label>
                <textarea
                  className="dt-input"
                  rows={4}
                  value={alertMessage}
                  onChange={(e) => setAlertMessage(e.target.value)}
                  style={{ width: '100%', fontSize: '0.9rem', lineHeight: '1.5' }}
                />
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right', marginTop: '0.2rem' }}>
                  अक्षर गणना: {alertMessage.length} (१६० क्यारेक्टर = १ SMS)
                </div>
              </div>

              {/* Target Ward & Channels */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>
                    लक्षित वडा (Target Ward):
                  </label>
                  <select
                    className="dt-select"
                    value={targetWard}
                    onChange={(e) => setTargetWard(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                    style={{ width: '100%' }}
                  >
                    <option value="all">सबै वडाहरू (५,२३४ घरधुरी)</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
                      <option key={w} value={w}>
                        वडा नं. {w}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>
                    प्रसारण माध्यम (Channels):
                  </label>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.4rem' }}>
                    <label style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}>
                      <input type="checkbox" checked={useSms} onChange={(e) => setUseSms(e.target.checked)} />
                      <span>बल्क SMS</span>
                    </label>
                    <label style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}>
                      <input type="checkbox" checked={useWhatsapp} onChange={(e) => setUseWhatsapp(e.target.checked)} />
                      <span>WhatsApp</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleSendBroadcast}
                disabled={broadcastMutation.isPending || !alertMessage.trim()}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: '#e11d48',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  marginTop: '0.5rem',
                  transition: 'all 0.15s ease',
                }}
              >
                <Send size={18} />
                <span>
                  {broadcastMutation.isPending ? 'प्रसारण भइरहेको छ...' : '🚨 नागरिकहरूलाई आपतकालीन अलर्ट प्रसारण गर्नुहोस्'}
                </span>
              </button>
            </div>

            {/* Right: Realistic Mobile Phone Preview */}
            <div className="dt-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Smartphone size={16} />
                <span>नागरिकको मोबाइलमा देखिने सन्देश (Live SMS Preview)</span>
              </div>

              {/* Simulated Phone Frame */}
              <div
                style={{
                  width: '280px',
                  height: '460px',
                  backgroundColor: '#0f172a',
                  borderRadius: '36px',
                  border: '8px solid #334155',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.25)',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Phone Speaker Notch */}
                <div style={{ width: '80px', height: '6px', backgroundColor: '#334155', borderRadius: '3px', margin: '0 auto 1rem' }} />

                {/* Sender Header */}
                <div style={{ textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                  <div style={{ color: '#ffffff', fontSize: '0.8rem', fontWeight: 700 }}>PALIKA-ALERT</div>
                  <div style={{ color: '#94a3b8', fontSize: '0.65rem' }}>पाँचपोखरी थाङपाल गाउँपालिका</div>
                </div>

                {/* SMS Bubble */}
                <div
                  style={{
                    backgroundColor: '#1e293b',
                    color: '#f8fafc',
                    padding: '0.85rem',
                    borderRadius: '14px',
                    fontSize: '0.8rem',
                    lineHeight: '1.45',
                    border: '1px solid #475569',
                    wordBreak: 'break-word',
                  }}
                >
                  <div style={{ fontWeight: 700, color: '#f43f5e', marginBottom: '0.3rem', fontSize: '0.8rem' }}>
                    {alertTitle}
                  </div>
                  <div>{alertMessage}</div>
                  <div style={{ fontSize: '0.65rem', color: '#94a3b8', textAlign: 'right', marginTop: '0.4rem' }}>
                    अहिले • NTC/Ncell SMS
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Broadcast History Table */}
          <div className="dt-card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Clock size={18} color="var(--primary)" />
              <span>हालै पठाइएका आपतकालीन अलर्टहरूको इतिहास (Broadcast History)</span>
            </h3>
            <div className="dt-table-wrapper">
              <div className="dt-responsive-table-wrapper">
<table className="dt-table">
                <thead>
                  <tr>
                    <th>सूचना शीर्षक</th>
                    <th>प्रकार</th>
                    <th>लक्षित क्षेत्र</th>
                    <th>माध्यम</th>
                    <th>प्राप्तकर्ता (घरधुरी)</th>
                    <th>मिति (B.S.)</th>
                    <th>डेलिभरी स्थिति</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((rec) => (
                    <tr key={rec.id}>
                      <td style={{ fontWeight: 600 }}>{rec.title}</td>
                      <td>
                        <span className="dt-badge dt-badge-danger">{rec.hazardType}</span>
                      </td>
                      <td>{rec.targetWard === 'all' ? 'सम्पूर्ण पालिका' : `वडा नं. ${rec.targetWard}`}</td>
                      <td>{rec.channels.join(', ').toUpperCase()}</td>
                      <td>
                        <strong>{rec.recipientsCount.toLocaleString()}</strong> मोबाइल
                      </td>
                      <td>{rec.timestampBs}</td>
                      <td>
                        <span
                          style={{
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            backgroundColor: '#dcfce7',
                            color: '#166534',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.2rem',
                          }}
                        >
                          <CheckCircle2 size={12} />
                          <span>सफलतापूर्वक डेलिभर</span>
                        </span>
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

      
      {/* Tab: IoT Hydromet - River Level & Rainfall Stations */}
      {activeTab === 'hydromet' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Active Flood Alert Banner if any sensor exceeds warning/critical */}
          {activeSensorAlerts.length > 0 && (
            <div
              style={{
                padding: '1rem 1.25rem',
                borderRadius: '8px',
                backgroundColor: '#fef2f2',
                border: '2px solid #ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.15)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: '#ef4444',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: 'pulse 1.5s infinite',
                  }}
                >
                  <AlertTriangle size={22} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#991b1b' }}>
                    🚨 उच्च विपद् जोखिम सतर्कता: {activeSensorAlerts.map(s => s.name.split('(')[0]).join(', ')} खतरा स्तर पार!
                  </h4>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.825rem', color: '#b91c1c' }}>
                    नदीको जलसतह वा वर्षा मापन खतरा विन्दु भन्दा माथि पुगेको छ। तुरुन्तै तटीय बस्तीमा पूर्वसूचना साइरन तथा SMS प्रसारण गर्नुहोस्।
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setAlertTitle('मेलम्ची खोला तटीय क्षेत्र उच्च बाढी सतर्कता');
                  setAlertMessage('🚨 पाँचपोखरी थाङपाल गाउँपालिका आपतकालीन सतर्कता: मेलम्ची खोलामा जलसतह ' + (sensors.find(s => s.sensorId === 'SEN-MEL-01')?.lastValue || '5.8') + ' मिटर पुगेको छ। तटीय क्षेत्रका सम्पूर्ण नागरिकहरू तुरुन्तै नजिकको अग्लो र सुरक्षित आश्रयस्थलमा जानुहोला। सम्पर्क: ०११-४६०१११, ९८५११*****।');
                  setActiveTab('broadcast');
                }}
                className="dt-btn dt-btn-primary"
                style={{ backgroundColor: '#dc2626', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}
              >
                <Send size={15} /> नागरिक SMS/WhatsApp प्रसारण गर्नुहोस्
              </button>
            </div>
          )}

          {/* Hydromet Overview KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div className="dt-card" style={{ borderLeft: '4px solid #0284c7', padding: '1rem 1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>कुल IoT स्टेशनहरू</span>
                <Activity size={20} color="#0284c7" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.3rem' }}>
                {sensors.length} <span style={{ fontSize: '0.9rem', fontWeight: 500, color: '#64748b' }}>केन्द्रहरू</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#0284c7', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <CheckCircle2 size={12} /> २४/७ स्वचालित टेलिमेट्री सक्रिय
              </div>
            </div>

            <div className="dt-card" style={{ borderLeft: '4px solid #2563eb', padding: '1rem 1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>नदी जलसतह स्टेशन (River)</span>
                <Waves size={20} color="#2563eb" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.3rem' }}>
                {sensors.filter(s => s.type === 'river_level').length} <span style={{ fontSize: '0.9rem', fontWeight: 500, color: '#64748b' }}>स्थान</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#2563eb', marginTop: '0.2rem' }}>
                मेलम्ची खोला पुल तथा गुन्सा तटीय क्षेत्र
              </div>
            </div>

            <div className="dt-card" style={{ borderLeft: '4px solid #06b6d4', padding: '1rem 1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>स्वचालित वर्षामापन केन्द्र (Rain)</span>
                <CloudRain size={20} color="#06b6d4" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.3rem' }}>
                {sensors.filter(s => s.type === 'rain_gauge').length} <span style={{ fontSize: '0.9rem', fontWeight: 500, color: '#64748b' }}>केन्द्र</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#06b6d4', marginTop: '0.2rem' }}>
                भोताङ वडा कार्यालय स्वचालित वर्षा गेज
              </div>
            </div>

            <div className="dt-card" style={{ borderLeft: '4px solid #10b981', padding: '1rem 1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>मौसम तथा पहिरो सेन्सर</span>
                <Mountain size={20} color="#10b981" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.3rem' }}>
                {sensors.filter(s => s.type === 'landslide_motion' || s.type === 'weather_station').length} <span style={{ fontSize: '0.9rem', fontWeight: 500, color: '#64748b' }}>स्टेशन</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '0.2rem' }}>
                पाँचपोखरी ताल मौसम र मानेखर्क इनक्लिनोमिटर
              </div>
            </div>
          </div>

          {/* IoT Telemetry Simulation & Testing Toolbar */}
          <div
            className="dt-card"
            style={{
              padding: '1rem 1.25rem',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Zap size={16} color="#f59e0b" />
                <span>IoT टेलिमेट्री सिमुलेटर तथा परीक्षण (Disaster Early Warning Drill Simulator)</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.15rem' }}>
                आपतकालीन अभ्यास वा परीक्षणका लागि सेन्सरको रिडिङ उच्च बनाएर पूर्वसूचना साइरन तथा अलर्ट प्रणाली जाँच्नुहोस्।
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => sensorTelemetryMutation.mutate({ sensorId: 'SEN-MEL-01', value: 5.8 })}
                disabled={sensorTelemetryMutation.isPending}
                className="dt-btn"
                style={{ backgroundColor: '#ef4444', color: '#ffffff', fontSize: '0.8rem', padding: '0.4rem 0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              >
                🚨 उच्च बाढी सिमुलेट (Melamchi 5.8m)
              </button>
              <button
                onClick={() => sensorTelemetryMutation.mutate({ sensorId: 'SEN-BHO-02', value: 92.0 })}
                disabled={sensorTelemetryMutation.isPending}
                className="dt-btn"
                style={{ backgroundColor: '#f59e0b', color: '#ffffff', fontSize: '0.8rem', padding: '0.4rem 0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              >
                🌧️ भारी वर्षा सिमुलेट (Bhotang 92mm)
              </button>
              <button
                onClick={() => {
                  sensorTelemetryMutation.mutate({ sensorId: 'SEN-MEL-01', value: 3.2 });
                  sensorTelemetryMutation.mutate({ sensorId: 'SEN-BHO-02', value: 42.0 });
                }}
                disabled={sensorTelemetryMutation.isPending}
                className="dt-btn"
                style={{ backgroundColor: '#10b981', color: '#ffffff', fontSize: '0.8rem', padding: '0.4rem 0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              >
                <RefreshCw size={13} /> सामान्य अवस्था रिसेट
              </button>
              <button
                onClick={() => refetchSensors()}
                className="dt-btn"
                style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: '#475569', fontSize: '0.8rem', padding: '0.4rem 0.6rem' }}
                title="रिफ्रेस गर्नुहोस्"
              >
                <RefreshCw size={14} className={isSensorsLoading ? 'spin' : ''} />
              </button>
            </div>
          </div>

          {/* Live Sensor Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {sensors.map((s) => {
              const isCritical = s.status === 'Critical';
              const isWarning = s.status === 'Warning';
              const statusColor = isCritical ? '#ef4444' : isWarning ? '#f59e0b' : '#10b981';
              const statusBg = isCritical ? '#fef2f2' : isWarning ? '#fffbeb' : '#f0fdf4';
              const threshold = s.dangerThreshold || (s.type === 'river_level' ? 5.0 : 80.0);
              const percentage = Math.min(Math.round((s.lastValue / threshold) * 100), 100);

              let icon = <Waves size={24} color="#2563eb" />;
              let typeNepali = 'नदी जलसतह सेन्सर';
              if (s.type === 'rain_gauge') {
                icon = <CloudRain size={24} color="#06b6d4" />;
                typeNepali = 'स्वचालित वर्षा मापन केन्द्र';
              } else if (s.type === 'landslide_motion') {
                icon = <Mountain size={24} color="#f59e0b" />;
                typeNepali = 'पहिरो इनक्लिनोमिटर';
              } else if (s.type === 'weather_station') {
                icon = <Activity size={24} color="#8b5cf6" />;
                typeNepali = 'हिमाली मौसम केन्द्र';
              }

              return (
                <div
                  key={s.id || s.sensorId}
                  className="dt-card"
                  style={{
                    backgroundColor: '#ffffff',
                    border: `1.5px solid ${isCritical ? '#ef4444' : isWarning ? '#f59e0b' : '#e2e8f0'}`,
                    borderRadius: '12px',
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    boxShadow: isCritical ? '0 6px 16px rgba(239, 68, 68, 0.12)' : '0 2px 6px rgba(0,0,0,0.04)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div>
                    {/* Header: ID, Name, Status Badge */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div style={{ padding: '0.5rem', borderRadius: '8px', backgroundColor: statusBg }}>
                          {icon}
                        </div>
                        <div>
                          <span style={{ fontSize: '0.725rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            {s.sensorId} • {typeNepali}
                          </span>
                          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', margin: '0.1rem 0 0' }}>
                            {s.name}
                          </h3>
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.55rem',
                          borderRadius: '6px',
                          backgroundColor: statusBg,
                          color: statusColor,
                          border: `1px solid ${statusColor}40`,
                        }}
                      >
                        {isCritical ? 'खतरा (Critical)' : isWarning ? 'सचेत (Warning)' : 'सामान्य (Normal)'}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.8rem' }}>
                      <span>📍 स्थान: <strong>{s.location || 'पाँचपोखरी थाङपाल'}</strong></span>
                      {s.latitude && s.longitude && (
                        <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>({s.latitude.toFixed(3)}, {s.longitude.toFixed(3)})</span>
                      )}
                    </div>

                    {/* Current Reading Hero */}
                    <div
                      style={{
                        padding: '0.85rem 1rem',
                        borderRadius: '8px',
                        backgroundColor: statusBg,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'baseline',
                        marginBottom: '0.75rem',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>हालको मापन (Live Reading)</div>
                        <div style={{ fontSize: '2.2rem', fontWeight: 800, color: statusColor, lineHeight: 1.1 }}>
                          {s.lastValue} <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>{s.unit}</span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>खतरा थ्रेसहोल्ड (Danger)</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#dc2626' }}>
                          {threshold} {s.unit}
                        </div>
                      </div>
                    </div>

                    {/* Threshold Progress Bar */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>
                        <span>जोखिम स्तर (Threshold Reach)</span>
                        <span style={{ fontWeight: 700, color: statusColor }}>{percentage}%</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${percentage}%`,
                            height: '100%',
                            backgroundColor: statusColor,
                            borderRadius: '4px',
                            transition: 'width 0.5s ease',
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Footer & Actions */}
                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.725rem', color: '#94a3b8' }}>
                      पछिल्लो अपडेट: {s.lastPing ? new Date(s.lastPing).toLocaleTimeString() : 'अहिले'}
                    </div>
                    {isCritical || isWarning ? (
                      <button
                        onClick={() => {
                          setAlertTitle(`${s.name.split('(')[0]} सतर्कता सूचना`);
                          setAlertMessage(`🚨 पाँचपोखरी थाङपाल गाउँपालिका सूचना: ${s.name.split('(')[0]} मा जलसतह/वर्षा ${s.lastValue}${s.unit} पुगेको छ। खतरा विन्दु ${threshold}${s.unit} नजिक पुगेकाले सतर्क रहन अनुरोध छ।`);
                          setActiveTab('broadcast');
                        }}
                        className="dt-btn"
                        style={{ backgroundColor: '#dc2626', color: '#ffffff', fontSize: '0.75rem', padding: '0.3rem 0.6rem', fontWeight: 600 }}
                      >
                        ⚠️ SMS सतर्कता पठाउनुहोस्
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>
                        ✓ सामान्य अवस्था
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed Sensor Telemetry Log Table */}
          <div className="dt-card">
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.75rem' }}>
              📊 सम्पूर्ण IoT स्टेशनहरूको प्राविधिक विवरण तालिका
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <div className="dt-responsive-table-wrapper">
<table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                    <th style={{ padding: '0.6rem 0.8rem' }}>सेन्सर आईडी</th>
                    <th style={{ padding: '0.6rem 0.8rem' }}>स्टेशनको नाम</th>
                    <th style={{ padding: '0.6rem 0.8rem' }}>प्रकार</th>
                    <th style={{ padding: '0.6rem 0.8rem' }}>स्थान</th>
                    <th style={{ padding: '0.6rem 0.8rem' }}>पछिल्लो रिडिङ</th>
                    <th style={{ padding: '0.6rem 0.8rem' }}>खतरा स्तर</th>
                    <th style={{ padding: '0.6rem 0.8rem' }}>स्थिति</th>
                    <th style={{ padding: '0.6rem 0.8rem' }}>परीक्षण कार्य</th>
                  </tr>
                </thead>
                <tbody>
                  {sensors.map(s => (
                    <tr key={s.id || s.sensorId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.6rem 0.8rem', fontWeight: 700, color: '#0284c7' }}>{s.sensorId}</td>
                      <td style={{ padding: '0.6rem 0.8rem', fontWeight: 600 }}>{s.name}</td>
                      <td style={{ padding: '0.6rem 0.8rem', color: '#64748b' }}>{s.type}</td>
                      <td style={{ padding: '0.6rem 0.8rem' }}>{s.location || '-'}</td>
                      <td style={{ padding: '0.6rem 0.8rem', fontWeight: 700 }}>{s.lastValue} {s.unit}</td>
                      <td style={{ padding: '0.6rem 0.8rem', color: '#dc2626' }}>{s.dangerThreshold || '-'} {s.unit}</td>
                      <td style={{ padding: '0.6rem 0.8rem' }}>
                        <span
                          style={{
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            backgroundColor: s.status === 'Critical' ? '#fee2e2' : s.status === 'Warning' ? '#fef3c7' : '#dcfce7',
                            color: s.status === 'Critical' ? '#991b1b' : s.status === 'Warning' ? '#92400e' : '#166534',
                          }}
                        >
                          {s.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.6rem 0.8rem' }}>
                        <button
                          onClick={() => sensorTelemetryMutation.mutate({ sensorId: s.sensorId, value: (s.dangerThreshold || 5.0) + 0.5 })}
                          className="dt-btn"
                          style={{ fontSize: '0.7rem', padding: '0.2rem 0.45rem', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1' }}
                        >
                          अलर्ट जाँच्नुहोस्
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

      {/* Tab: CCTV Cameras & AI Live Surveillance Grid */}
      {activeTab === 'cameras' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* CCTV Overview Statistics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div className="dt-card" style={{ borderLeft: '4px solid #7c3aed', padding: '1rem 1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>कुल CCTV क्यामेरा</span>
                <Video size={20} color="#7c3aed" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.3rem' }}>
                {cameras.length} <span style={{ fontSize: '0.9rem', fontWeight: 500, color: '#64748b' }}>वटा</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#7c3aed', marginTop: '0.2rem' }}>
                सबै रणनीतिक विन्दुमा २४/७ जडान
              </div>
            </div>

            <div className="dt-card" style={{ borderLeft: '4px solid #10b981', padding: '1rem 1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>सक्रिय लाइभ स्ट्रिम</span>
                <Camera size={20} color="#10b981" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981', marginTop: '0.3rem' }}>
                {cameras.filter(c => c.status === 'Active').length} / {cameras.length}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '0.2rem' }}>
                १००% नेटवर्क कभरेज अनलाइन
              </div>
            </div>

            <div className="dt-card" style={{ borderLeft: '4px solid #f59e0b', padding: '1rem 1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>आजको AI भिजिटर / ट्राफिक</span>
                <Activity size={20} color="#f59e0b" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.3rem' }}>
                {cameraStats?.todayTotal || cameras.reduce((acc, c) => acc + (c.todayVisitorCount || 0), 0)}{' '}
                <span style={{ fontSize: '0.9rem', fontWeight: 500, color: '#64748b' }}>जना</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#f59e0b', marginTop: '0.2rem' }}>
                स्वचालित AI गति पहिचान काउन्टर
              </div>
            </div>

            <div className="dt-card" style={{ borderLeft: '4px solid #0284c7', padding: '1rem 1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>कुल संचित निगरानी रेकर्ड</span>
                <Eye size={20} color="#0284c7" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.3rem' }}>
                {cameraStats?.allTimeTotal || cameras.reduce((acc, c) => acc + (c.totalVisitorCount || 0), 0)}{' '}
                <span style={{ fontSize: '0.9rem', fontWeight: 500, color: '#64748b' }}>रेकर्ड</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#0284c7', marginTop: '0.2rem' }}>
                सुरक्षा तथा विपद् अडिट लग
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {[
                { id: 'all', label: 'सबै क्यामेरा' },
                { id: 'Entrance', label: 'प्रवेशद्वार (Gate)' },
                { id: 'Flood', label: 'नदी तथा बाढी निगरानी' },
                { id: 'Heritage', label: 'सम्पदा तथा भीड' },
                { id: 'Hazard', label: 'पहिरो/जोखिम क्षेत्र' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setCameraFilter(f.id)}
                  style={{
                    padding: '0.4rem 0.8rem',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    backgroundColor: cameraFilter === f.id ? '#7c3aed' : '#ffffff',
                    color: cameraFilter === f.id ? '#ffffff' : '#64748b',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => refetchCameras()}
                className="dt-btn"
                style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              >
                <RefreshCw size={14} className={isCamerasLoading ? 'spin' : ''} /> क्यामेरा रिफ्रेस
              </button>
            </div>
          </div>

          {/* Live CCTV Stream Video Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
            {cameras
              .filter(c => {
                if (cameraFilter === 'all') return true;
                return (c.type || '').toLowerCase().includes(cameraFilter.toLowerCase());
              })
              .map(cam => {
                const isActive = cam.status === 'Active';

                return (
                  <div
                    key={cam.id || cam.cameraId}
                    className="dt-card"
                    style={{
                      padding: '0',
                      overflow: 'hidden',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      backgroundColor: '#ffffff',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    {/* Camera Card Top Bar */}
                    <div
                      style={{
                        padding: '0.75rem 1rem',
                        backgroundColor: '#0f172a',
                        color: '#ffffff',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Camera size={16} color="#a78bfa" />
                        <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{cam.cameraId}: {cam.name.split('(')[0]}</span>
                      </div>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '0.15rem 0.5rem',
                          borderRadius: '4px',
                          backgroundColor: isActive ? '#10b981' : '#ef4444',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                        }}
                      >
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#fff' }} />
                        {isActive ? 'LIVE' : 'OFFLINE'}
                      </span>
                    </div>

                    {/* Simulated High-Tech CCTV Viewport or Live Stream */}
                    <div
                      onClick={() => setSelectedCamera(cam)}
                      style={{
                        position: 'relative',
                        height: '210px',
                        backgroundColor: '#070b14',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        overflow: 'hidden',
                      }}
                    >
                      {cam.streamUrl && cam.streamUrl.startsWith('http') ? (
                        <iframe 
                          src={cam.streamUrl} 
                          width="100%" 
                          height="100%" 
                          style={{ border: 'none', zIndex: 10 }} 
                          allowFullScreen
                        />
                      ) : (
                        <>
                          {/* Grid / Lens Overlay */}
                          <div
                            style={{
                              position: 'absolute',
                              inset: 0,
                              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
                              backgroundSize: '24px 24px',
                              opacity: 0.8,
                            }}
                          />

                          {/* Corner Target Markers */}
                          <div style={{ position: 'absolute', top: '10px', left: '10px', width: '16px', height: '16px', borderTop: '2px solid #38bdf8', borderLeft: '2px solid #38bdf8' }} />
                          <div style={{ position: 'absolute', top: '10px', right: '10px', width: '16px', height: '16px', borderTop: '2px solid #38bdf8', borderRight: '2px solid #38bdf8' }} />
                          <div style={{ position: 'absolute', bottom: '10px', left: '10px', width: '16px', height: '16px', borderBottom: '2px solid #38bdf8', borderLeft: '2px solid #38bdf8' }} />
                          <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '16px', height: '16px', borderBottom: '2px solid #38bdf8', borderRight: '2px solid #38bdf8' }} />

                          {/* Top Viewport Watermark & REC indicator */}
                          <div
                        style={{
                          position: 'absolute',
                          top: '10px',
                          left: '32px',
                          right: '32px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: '0.7rem',
                          fontFamily: 'monospace',
                          color: '#e2e8f0',
                          zIndex: 2,
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#ef4444', fontWeight: 700 }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444', display: 'inline-block', animation: 'pulse 1.2s infinite' }} />
                          ● REC
                        </span>
                        <span style={{ color: '#94a3b8' }}>{cam.type}</span>
                        <span style={{ color: '#38bdf8' }}>{new Date().toLocaleTimeString()} NPT</span>
                      </div>

                      {/* Center Viewport Graphic */}
                      <div style={{ textAlign: 'center', zIndex: 1, color: '#94a3b8' }}>
                        <div
                          style={{
                            width: '54px',
                            height: '54px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 0.5rem',
                          }}
                        >
                          <Video size={28} color="#a78bfa" />
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600 }}>{cam.location || 'Panchpokhari'}</div>
                        <div style={{ fontSize: '0.68rem', color: '#64748b' }}>क्लिक गरी पूर्ण स्क्रिन हेर्नुहोस्</div>
                      </div>

                      {/* Bottom Technical Telemetry */}
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '10px',
                          left: '32px',
                          right: '32px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '0.68rem',
                          fontFamily: 'monospace',
                          color: '#64748b',
                          zIndex: 2,
                        }}
                      >
                        <span>1080P FHD @ 30FPS</span>
                        <span>BITRATE: 2.4Mbps</span>
                      </div>
                        </>
                      )}
                    </div>

                    {/* Card Content Details */}
                    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                        <span style={{ color: '#64748b' }}>📍 स्थान:</span>
                        <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{cam.location || '-'}</span>
                      </div>

                      <div
                        style={{
                          padding: '0.6rem 0.8rem',
                          borderRadius: '8px',
                          backgroundColor: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>आजको AI भिजिटर संख्या</div>
                          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#7c3aed' }}>
                            {cam.todayVisitorCount} <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>जना</span>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>कुल संचित संख्या</div>
                          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>
                            {cam.totalVisitorCount} <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>जना</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: 'flex', gap: '0.4rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.6rem' }}>
                        <button
                          onClick={() => cameraPingMutation.mutate({ cameraId: cam.cameraId, count: 5 })}
                          disabled={cameraPingMutation.isPending}
                          className="dt-btn"
                          style={{
                            flex: 1,
                            backgroundColor: '#f5f3ff',
                            border: '1px solid #ddd6fe',
                            color: '#6d28d9',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            padding: '0.35rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.25rem',
                          }}
                        >
                          <Activity size={12} /> AI काउन्ट पिंग (+५)
                        </button>
                        <button
                          onClick={() => setSelectedCamera(cam)}
                          className="dt-btn"
                          style={{
                            flex: 1,
                            backgroundColor: '#0f172a',
                            color: '#ffffff',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            padding: '0.35rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.25rem',
                          }}
                        >
                          <Maximize2 size={12} /> पूर्ण स्क्रिन
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Full-Screen Camera Live Stream Modal */}
      {selectedCamera && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '900px',
              backgroundColor: '#0f172a',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
              border: '1px solid #334155',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '1rem 1.25rem',
                borderBottom: '1px solid #334155',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                color: '#ffffff',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Camera size={20} color="#a78bfa" />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
                    {selectedCamera.name} ({selectedCamera.cameraId})
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    स्थान: {selectedCamera.location} • प्रकार: {selectedCamera.type}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedCamera(null)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  padding: '0.2rem 0.6rem',
                }}
              >
                ✕
              </button>
            </div>

            {/* Simulated Full Live Player */}
            <div
              style={{
                position: 'relative',
                height: '420px',
                backgroundColor: '#020617',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* Scanlines / Grid */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%)',
                  backgroundSize: '100% 4px',
                  pointerEvents: 'none',
                }}
              />

              {/* HUD Telemetry Elements */}
              <div style={{ position: 'absolute', top: '15px', left: '20px', color: '#ef4444', fontWeight: 700, fontFamily: 'monospace', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444', animation: 'pulse 1s infinite' }} />
                ● LIVE STREAM - {selectedCamera.cameraId}
              </div>

              <div style={{ position: 'absolute', top: '15px', right: '20px', color: '#38bdf8', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                {new Date().toLocaleTimeString()} NPT
              </div>

              {/* Center Stream View */}
              <div style={{ textAlign: 'center', color: '#cbd5e1' }}>
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '2px solid rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem',
                  }}
                >
                  <Video size={42} color="#a78bfa" />
                </div>
                <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc' }}>{selectedCamera.name}</h4>
                <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.3rem' }}>
                  प्रोटोकल: RTSP/HLS Stream • इन्क्रिप्सन: AES-128
                </div>
                <div style={{ marginTop: '1rem', display: 'inline-block', padding: '0.3rem 0.8rem', borderRadius: '20px', backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#34d399', fontSize: '0.75rem', fontWeight: 700 }}>
                  ✓ क्यामेरा स्थिति: सक्रिय (Online Stream 1080p@30fps)
                </div>
              </div>

              {/* Bottom Stream Info */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '15px',
                  left: '20px',
                  right: '20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontFamily: 'monospace',
                  fontSize: '0.75rem',
                  color: '#94a3b8',
                }}
              >
                <span>CODEC: H.264 / AAC</span>
                <span>LATITUDE: {selectedCamera.latitude || '27.980'} • LONGITUDE: {selectedCamera.longitude || '85.752'}</span>
                <span>STATUS: ACTIVE_TRANSMITTING</span>
              </div>
            </div>

            {/* Modal Footer Controls */}
            <div
              style={{
                padding: '1rem 1.25rem',
                borderTop: '1px solid #334155',
                backgroundColor: '#0b1120',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.8rem',
              }}
            >
              <div style={{ display: 'flex', gap: '1.5rem', color: '#cbd5e1', fontSize: '0.85rem' }}>
                <div>
                  आजको AI भिजिटर: <strong style={{ color: '#a78bfa' }}>{selectedCamera.todayVisitorCount}</strong> जना
                </div>
                <div>
                  कुल संचित भिजिटर: <strong style={{ color: '#38bdf8' }}>{selectedCamera.totalVisitorCount}</strong> जना
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => {
                    cameraPingMutation.mutate({ cameraId: selectedCamera.cameraId, count: 10 });
                    setSelectedCamera(prev => prev ? { ...prev, todayVisitorCount: prev.todayVisitorCount + 10, totalVisitorCount: prev.totalVisitorCount + 10 } : null);
                  }}
                  className="dt-btn"
                  style={{ backgroundColor: '#7c3aed', color: '#ffffff', fontSize: '0.8rem', fontWeight: 600 }}
                >
                  +१० AI भिजिटर सिमुलेट गर्नुहोस्
                </button>
                <button
                  onClick={() => setSelectedCamera(null)}
                  className="dt-btn"
                  style={{ backgroundColor: '#334155', color: '#ffffff', fontSize: '0.8rem' }}
                >
                  बन्द गर्नुहोस्
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Safe Evacuation Shelters & Relief Stock */}
      {activeTab === 'shelters' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Shelters Control Header */}
          <div
            className="dt-card"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: '1.15rem',
                  fontWeight: 700,
                  color: '#166534',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  margin: 0,
                }}
              >
                <Tent size={22} color="#15803d" />
                <span>सुरक्षित आपतकालीन आश्रयस्थलहरू (Evacuation Shelters)</span>
              </h2>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#15803d' }}>
                बाढी, पहिरो तथा आपतकालीन अवस्थामा नागरिकहरूलाई सुरक्षित राख्न तोकिएका आश्रयस्थलहरू
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: '0.825rem',
                  fontWeight: 700,
                  backgroundColor: '#dcfce7',
                  color: '#166534',
                  padding: '0.4rem 0.8rem',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  border: '1px solid #86efac',
                }}
              >
                <Users size={15} />
                <span>कुल क्षमता: {totalShelterCapacity.toLocaleString()} जना ({shelters.length} आश्रयस्थल)</span>
              </span>

              <select
                className="dt-select"
                value={shelterWardFilter}
                onChange={(e) => setShelterWardFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                style={{ fontSize: '0.85rem', padding: '0.4rem 0.75rem' }}
              >
                <option value="all">सबै वडाहरू ({shelters.length})</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => {
                  const count = shelters.filter((s) => s.wardNumber === w).length;
                  return (
                    <option key={w} value={w}>
                      वडा नं. {w} ({count})
                    </option>
                  );
                })}
              </select>

              <button
                onClick={() => {
                  setSelectedShelter(null);
                  setIsShelterModalOpen(true);
                }}
                className="dt-btn"
                style={{
                  backgroundColor: '#16a34a',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                }}
              >
                <Plus size={16} /> नयाँ आश्रयस्थल दर्ता
              </button>
            </div>
          </div>

          {/* Shelters Cards Grid */}
          {isSheltersLoading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              आश्रयस्थलहरूको सूची लोड हुँदैछ...
            </div>
          ) : filteredShelters.length === 0 ? (
            <div className="dt-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              यस वडामा कुनै आश्रयस्थल दर्ता गरिएको छैन।
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
              {filteredShelters.map((sh) => {
                const statusBadge =
                  sh.status === 'full' ? (
                    <span className="dt-badge dt-badge-danger">भरिएको (Full)</span>
                  ) : sh.status === 'standby' ? (
                    <span className="dt-badge dt-badge-warning">तयारी अवस्था</span>
                  ) : (
                    <span className="dt-badge dt-badge-success">सक्रिय (Active)</span>
                  );

                return (
                  <div
                    key={sh.id}
                    className="dt-card"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '1rem',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                          <span className="dt-badge dt-badge-info">वडा नं. {sh.wardNumber}</span>
                          {statusBadge}
                        </div>
                        <span style={{ fontSize: '0.8rem', color: '#166534', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Users size={14} /> क्षमता: {sh.capacity} जना
                        </span>
                      </div>

                      <h3
                        style={{
                          fontSize: '1.05rem',
                          fontWeight: 700,
                          color: 'var(--text-main)',
                          marginBottom: '0.4rem',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.4rem',
                        }}
                      >
                        <Tent size={18} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span>{sh.name}</span>
                      </h3>

                      <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.5rem' }}>
                        <MapPin size={14} color="#64748b" />
                        <span>
                          स्थान: <strong>{sh.location}</strong>
                        </span>
                      </div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.5rem', fontSize: '0.775rem', color: '#475569' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Droplets size={14} color={sh.hasWater ? '#0284c7' : '#94a3b8'} />
                          खानेपानी: {sh.hasWater ? 'उपलब्ध' : 'ट्याङ्कर'}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Zap size={14} color={sh.hasPowerBackup ? '#eab308' : '#94a3b8'} />
                          बत्ती: {sh.hasPowerBackup ? 'सोलार/जेनेरेटर' : 'सामान्य'}
                        </span>
                      </div>

                      {sh.facilitiesDescription && (
                        <div
                          style={{
                            marginTop: '0.6rem',
                            fontSize: '0.775rem',
                            color: '#64748b',
                            backgroundColor: '#f8fafc',
                            padding: '0.4rem 0.6rem',
                            borderRadius: '6px',
                            border: '1px solid #f1f5f9',
                          }}
                        >
                          {sh.facilitiesDescription}
                        </div>
                      )}
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderTop: '1px solid var(--border)',
                        paddingTop: '0.75rem',
                        flexWrap: 'wrap',
                        gap: '0.5rem',
                      }}
                    >
                      <div>
                        {sh.contactPhone ? (
                          <a
                            href={`tel:${sh.contactPhone}`}
                            style={{
                              color: '#16a34a',
                              fontWeight: 700,
                              fontSize: '0.825rem',
                              textDecoration: 'none',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                            }}
                          >
                            <PhoneCall size={14} />
                            <span>
                              {sh.contactPerson ? `${sh.contactPerson}: ` : ''}
                              {sh.contactPhone}
                            </span>
                          </a>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>सम्पर्क नम्बर उपलब्ध छैन</span>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                        {sh.lat && sh.lng && (
                          <a
                            href={`/gis-map?filter=shelter&lat=${sh.lat}&lng=${sh.lng}`}
                            className="dt-btn dt-btn-xs"
                            style={{
                              backgroundColor: '#ecfdf5',
                              color: '#047857',
                              border: '1px solid #a7f3d0',
                              fontSize: '0.725rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.2rem',
                              textDecoration: 'none',
                            }}
                            title="GIS नक्सामा हेर्नुहोस्"
                          >
                            <ExternalLink size={12} /> नक्सा
                          </a>
                        )}
                        <button
                          onClick={() => {
                            setSelectedShelter(sh);
                            setIsShelterModalOpen(true);
                          }}
                          className="dt-btn dt-btn-xs"
                          style={{ backgroundColor: '#f1f5f9', color: '#475569', fontSize: '0.725rem' }}
                          title="सम्पादन गर्नुहोस्"
                        >
                          <Edit size={12} />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`के तपाईं "${sh.name}" आश्रयस्थल हटाउन निश्चित हुनुहुन्छ?`)) {
                              deleteShelterMutation.mutate(sh.id!);
                            }
                          }}
                          className="dt-btn dt-btn-xs"
                          style={{ backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', fontSize: '0.725rem' }}
                          title="हटाउनुहोस्"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 9: Disaster Recovery & Reconstruction Projects */}
      {activeTab === 'recovery_projects' && (
        <RecoveryProjectsTab />
      )}

      {/* Disaster Event Modal */}
      <DisasterModal
        isOpen={isEventModalOpen}
        onClose={() => {
          setIsEventModalOpen(false);
          setSelectedEvent(null);
        }}
        onSubmit={(data) => {
          if (selectedEvent) {
            updateEventMutation.mutate({ id: selectedEvent.id!, data });
          } else {
            createEventMutation.mutate(data);
          }
        }}
        initialData={selectedEvent}
        isLoading={createEventMutation.isPending || updateEventMutation.isPending}
      />

      {/* Emergency Contact Modal */}
      <EmergencyContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        onSubmit={(data) => createContactMutation.mutate(data)}
        isLoading={createContactMutation.isPending}
      />

      {/* Add / Edit Shelter Modal */}
      <AddShelterModal
        isOpen={isShelterModalOpen}
        onClose={() => {
          setIsShelterModalOpen(false);
          setSelectedShelter(null);
        }}
        onSubmit={(data) => {
          if (selectedShelter?.id) {
            updateShelterMutation.mutate({ id: selectedShelter.id, data });
          } else {
            createShelterMutation.mutate(data);
          }
        }}
        initialData={selectedShelter}
        isLoading={createShelterMutation.isPending || updateShelterMutation.isPending}
      />

      {/* Modal 1: नयाँ राहत सामग्री जिन्सी प्रविष्टि फारम */}
      {isReliefModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)', padding: '1rem' }}>
          <div className="dt-card" style={{ width: '100%', maxWidth: '560px', backgroundColor: '#ffffff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#92400e', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Boxes size={20} color="#d97706" />
              <span>नयाँ आपतकालीन जिन्सी सामग्री दर्ता</span>
            </h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const newItem: ReliefInventoryItem = {
                id: `rel-${Date.now()}`,
                itemName: fd.get('itemName') as string,
                category: fd.get('category') as any,
                quantity: Number(fd.get('quantity')),
                unit: fd.get('unit') as string,
                warehouseLocation: fd.get('warehouseLocation') as string,
                wardNumber: Number(fd.get('wardNumber')),
                condition: fd.get('condition') as any,
                lastUpdatedBs: '२०८१-०५-२०',
                contactPerson: fd.get('contactPerson') as string,
              };
              const updated = [newItem, ...reliefItems];
              setReliefItems(updated);
              localStorage.setItem('palika_relief_inventory', JSON.stringify(updated));
              setIsReliefModalOpen(false);
            }} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.2rem' }}>सामग्रीको नाम *</label>
                <input required name="itemName" placeholder="उदा. हेभी-ड्युटी त्रिपाल (Waterproof Tarpaulin)" className="dt-input" style={{ width: '100%' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.2rem' }}>वर्ग (Category) *</label>
                  <select name="category" className="dt-select" style={{ width: '100%' }}>
                    <option value="shelter">अस्थायी आश्रय (त्रिपाल/टेन्ट)</option>
                    <option value="search_rescue">खोज तथा उद्धार सामग्री</option>
                    <option value="clothing">कम्बल तथा कपडा</option>
                    <option value="medical">स्वास्थ्य तथा प्राथमिक उपचार</option>
                    <option value="food">सुक्खा खाद्यान्न</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.2rem' }}>सम्बन्धित वडा नं. *</label>
                  <select name="wardNumber" className="dt-select" style={{ width: '100%' }}>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(w => <option key={w} value={w}>वडा नं. {w}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.2rem' }}>मौज्दात परिमाण *</label>
                  <input required type="number" name="quantity" placeholder="उदा. १००" className="dt-input" style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.2rem' }}>एकाइ (Unit) *</label>
                  <input required name="unit" placeholder="थान / सेट / किट / बण्डल" className="dt-input" style={{ width: '100%' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.2rem' }}>भण्डारण गोदाम / स्थान *</label>
                  <input required name="warehouseLocation" placeholder="थाङपालधाप पालिका मुख्य गोदाम" className="dt-input" style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.2rem' }}>मौज्दात अवस्था *</label>
                  <select name="condition" className="dt-select" style={{ width: '100%' }}>
                    <option value="good">उपलब्ध / तयारी (Good)</option>
                    <option value="needs_restock">थप मौज्दात आवश्यक (Low)</option>
                    <option value="damaged">क्षतिग्रस्त / मर्मत आवश्यक</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.2rem' }}>जिम्मेवार अधिकृत / सम्पर्क</label>
                <input name="contactPerson" placeholder="नाम र पद वा फोन" className="dt-input" style={{ width: '100%' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem' }}>
                <button type="button" onClick={() => setIsReliefModalOpen(false)} className="dt-btn" style={{ backgroundColor: '#f1f5f9' }}>रद्द गर्नुहोस्</button>
                <button type="submit" className="dt-btn" style={{ backgroundColor: '#d97706', color: '#ffffff' }}>सुरक्षित गर्नुहोस्</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: नयाँ विपद् कोष राहत निकासा फारम */}
      {isFundModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)', padding: '1rem' }}>
          <div className="dt-card" style={{ width: '100%', maxWidth: '580px', backgroundColor: '#ffffff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#047857', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Coins size={20} color="#059669" />
              <span>नयाँ पालिका विपद् कोष राहत निकासा प्रविष्टि</span>
            </h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const newFund: DisasterFundDistribution = {
                id: `df-${Date.now()}`,
                disasterTitle: fd.get('disasterTitle') as string,
                wardNumber: Number(fd.get('wardNumber')),
                beneficiaryName: fd.get('beneficiaryName') as string,
                citizenshipNo: fd.get('citizenshipNo') as string,
                familyCount: Number(fd.get('familyCount') || 1),
                reliefType: fd.get('reliefType') as any,
                amountNPR: Number(fd.get('amountNPR')),
                distributionDateBs: fd.get('distributionDateBs') as string || '२०८१-०५-२०',
                disbursedByOfficer: fd.get('disbursedByOfficer') as string || 'विपद् अधिकृत',
                voucherNo: fd.get('voucherNo') as string || `VOUCH-${Date.now().toString().slice(-4)}`,
                status: 'वितरण सम्पन्न',
              };
              const updated = [newFund, ...reliefFunds];
              setReliefFunds(updated);
              localStorage.setItem('palika_disaster_funds', JSON.stringify(updated));
              setIsFundModalOpen(false);
            }} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.2rem' }}>लाभार्थी नागरिकको नाम *</label>
                  <input required name="beneficiaryName" placeholder="उदा. राम बहादुर तामाङ" className="dt-input" style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.2rem' }}>नागरिकता नम्बर</label>
                  <input name="citizenshipNo" placeholder="२७-०१-७२-*****" className="dt-input" style={{ width: '100%' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.2rem' }}>सम्बन्धित वडा नं. *</label>
                  <select name="wardNumber" className="dt-select" style={{ width: '100%' }}>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(w => <option key={w} value={w}>वडा नं. {w}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.2rem' }}>परिवार सदस्य संख्या</label>
                  <input type="number" defaultValue={4} name="familyCount" className="dt-input" style={{ width: '100%' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.2rem' }}>सम्बन्धित विपद् घटना *</label>
                <input required name="disasterTitle" placeholder="उदा. मानेखर्क पहिरो विस्थापित राहत" className="dt-input" style={{ width: '100%' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.2rem' }}>राहत प्रकार *</label>
                  <select name="reliefType" className="dt-select" style={{ width: '100%' }}>
                    <option value="नगद राहत (DBT)">नगद राहत (DBT)</option>
                    <option value="खाद्यान्न सामग्री">खाद्यान्न सामग्री</option>
                    <option value="त्रिपाल/टेन्ट">त्रिपाल / टेन्ट सहयोग</option>
                    <option value="पुनर्स्थापना सहयोग">पुनर्स्थापना सहयोग</option>
                    <option value="घाइते उपचार सहयोग">घाइते उपचार सहयोग</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.2rem' }}>निकासा रकम (रु.) *</label>
                  <input required type="number" name="amountNPR" placeholder="२५०००" className="dt-input" style={{ width: '100%' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.2rem' }}>भौचर / चेक नम्बर</label>
                  <input name="voucherNo" placeholder="VOUCH-DIS-२०८१-००५" className="dt-input" style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.2rem' }}>प्रमाणीकरण अधिकृत *</label>
                  <input name="disbursedByOfficer" placeholder="अधिकृतको नाम" defaultValue="नवराज पौडेल (विपद् अधिकृत)" className="dt-input" style={{ width: '100%' }} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem' }}>
                <button type="button" onClick={() => setIsFundModalOpen(false)} className="dt-btn" style={{ backgroundColor: '#f1f5f9' }}>रद्द गर्नुहोस्</button>
                <button type="submit" className="dt-btn" style={{ backgroundColor: '#059669', color: '#ffffff' }}>राहत सुरक्षित गर्नुहोस्</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: नयाँ जोखिमयुक्त बस्ती दर्ता फारम */}
      {isSettlementModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)', padding: '1rem' }}>
          <div className="dt-card" style={{ width: '100%', maxWidth: '580px', backgroundColor: '#ffffff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#4338ca', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={20} color="#4f46e5" />
              <span>नयाँ जोखिमयुक्त बस्ती दर्ता तथा योजना</span>
            </h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const newSettlement: VulnerableSettlement = {
                id: `vs-${Date.now()}`,
                settlementName: fd.get('settlementName') as string,
                wardNumber: Number(fd.get('wardNumber')),
                hazardType: fd.get('hazardType') as any,
                riskLevel: fd.get('riskLevel') as any,
                atRiskHouseholds: Number(fd.get('atRiskHouseholds')),
                atRiskPopulation: Number(fd.get('atRiskPopulation')),
                resettlementPriority: fd.get('resettlementPriority') as any,
                safeShelterName: fd.get('safeShelterName') as string,
                focalPerson: fd.get('focalPerson') as string,
                focalPersonPhone: fd.get('focalPersonPhone') as string,
              };
              const updated = [newSettlement, ...vulnerableSettlements];
              setVulnerableSettlements(updated);
              localStorage.setItem('palika_vulnerable_settlements', JSON.stringify(updated));
              setIsSettlementModalOpen(false);
            }} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.2rem' }}>बस्ती / टोलको नाम *</label>
                  <input required name="settlementName" placeholder="उदा. मानेखर्क भिरालो बस्ती" className="dt-input" style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.2rem' }}>वडा नं. *</label>
                  <select name="wardNumber" className="dt-select" style={{ width: '100%' }}>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(w => <option key={w} value={w}>वडा नं. {w}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.2rem' }}>विपद् जोखिम प्रकार *</label>
                  <select name="hazardType" className="dt-select" style={{ width: '100%' }}>
                    <option value="पहिरो (Landslide)">पहिरो (Landslide)</option>
                    <option value="बाढी/कटान (Flood)">बाढी/कटान (Flood)</option>
                    <option value="हिमपात/हिमपहिरो (Snow)">हिमपात/हिमपहिरो (Snow)</option>
                    <option value="डढेलो (Wildfire)">डढेलो (Wildfire)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.2rem' }}>जोखिम स्तर *</label>
                  <select name="riskLevel" className="dt-select" style={{ width: '100%' }}>
                    <option value="अति उच्च">अति उच्च (Critical)</option>
                    <option value="उच्च">उच्च (High)</option>
                    <option value="मध्यम">मध्यम (Medium)</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.2rem' }}>जोखिममा रहेका घरधुरी *</label>
                  <input required type="number" name="atRiskHouseholds" placeholder="उदा. ३५" className="dt-input" style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.2rem' }}>अनुमानित कुल नागरिक *</label>
                  <input required type="number" name="atRiskPopulation" placeholder="उदा. १६०" className="dt-input" style={{ width: '100%' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.2rem' }}>स्थानान्तरण प्राथमिकता / रणनीति *</label>
                <select name="resettlementPriority" className="dt-select" style={{ width: '100%' }}>
                  <option value="तत्काल सुरक्षित स्थानान्तरण">तत्काल सुरक्षित स्थानान्तरण (Urgent Evacuation)</option>
                  <option value="तटबन्धन/रोकथाम निर्माण">तटबन्धन तथा रोकथाम संरचना निर्माण</option>
                  <option value="पूर्वतयारी तथा सतर्कता">पूर्वतयारी, निगरानी तथा सतर्कता</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.2rem' }}>तोकिएको सुरक्षित आश्रयस्थल</label>
                <input name="safeShelterName" placeholder="उदा. मानेखर्क सामुदायिक भवन तथा मा.वि." className="dt-input" style={{ width: '100%' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.2rem' }}>सम्पर्क व्यक्ति (Focal Person)</label>
                  <input name="focalPerson" placeholder="नाम र पद" className="dt-input" style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.2rem' }}>सम्पर्क मोबाइल नं.</label>
                  <input name="focalPersonPhone" placeholder="९८४१******" className="dt-input" style={{ width: '100%' }} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem' }}>
                <button type="button" onClick={() => setIsSettlementModalOpen(false)} className="dt-btn" style={{ backgroundColor: '#f1f5f9' }}>रद्द गर्नुहोस्</button>
                <button type="submit" className="dt-btn" style={{ backgroundColor: '#4f46e5', color: '#ffffff' }}>जोखिम बस्ती दर्ता गर्नुहोस्</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DisasterPage;
