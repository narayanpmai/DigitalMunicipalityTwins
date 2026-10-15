import React, { useState, useEffect } from 'react';
import { 
  Recycle, 
  Trash2, 
  Wallet, 
  TrendingUp, 
  MapPin, 
  Leaf, 
  Truck, 
  DollarSign,
  AlertTriangle,
  Download,
  CheckCircle,
  Clock,
  Calendar,
  Users,
  HardHat,
  Factory,
  Plus,
  Search,
  Phone,
  ShieldCheck,
  X,
  FileText
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './waste-management.css';
import { 
  wasteApi, 
  type DashboardStats, 
  type WasteWallet, 
  type WasteRate, 
  type WasteAlert, 
  type LiveVehicle,
  type CollectionSchedule,
  type DisposalSite,
  type SanitationWorker
} from '../../api/waste-management';

// Fix for default marker icon in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom truck icon
const truckIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3097/3097180.png',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16]
});

export const WasteManagementDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'routes_schedule' | 'disposal_sites' | 'sanitation_staff' | 'wallet' | 'alerts'>('overview');

  const [stats, setStats] = useState<DashboardStats>({
    totalCollectedKg: 28450,
    recycledKg: 19020,
    totalPayouts: 342500,
    activeVehicles: 3,
    totalVehicles: 4
  });
  const [wallets, setWallets] = useState<WasteWallet[]>([]);
  const [rates, setRates] = useState<WasteRate[]>([]);
  const [alerts, setAlerts] = useState<WasteAlert[]>([]);
  const [liveVehicles, setLiveVehicles] = useState<LiveVehicle[]>([]);
  const [schedules, setSchedules] = useState<CollectionSchedule[]>([]);
  const [disposalSites, setDisposalSites] = useState<DisposalSite[]>([]);
  const [workers, setWorkers] = useState<SanitationWorker[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search states
  const [scheduleWardFilter, setScheduleWardFilter] = useState<number | 'all'>('all');
  const [scheduleSearch, setScheduleSearch] = useState('');
  const [siteSearch, setSiteSearch] = useState('');
  const [workerSearch, setWorkerSearch] = useState('');

  // Modals state
  const [isAddScheduleOpen, setIsAddScheduleOpen] = useState(false);
  const [isAddSiteOpen, setIsAddSiteOpen] = useState(false);
  const [isAddWorkerOpen, setIsAddWorkerOpen] = useState(false);

  // New Schedule form
  const [newSch, setNewSch] = useState<Partial<CollectionSchedule>>({
    wardNo: 3,
    routeCode: '',
    routeName: '',
    collectionDaysBio: 'आइतबार, बुधबार',
    collectionDaysNonBio: 'मंगलबार, शुक्रबार',
    vehicleNumber: 'बा २ क ',
    vehicleType: 'tractor',
    driverName: '',
    driverPhone: '',
    supervisorName: '',
    supervisorPhone: '',
    timing: 'बिहान ०६:३० - ०९:३०',
    status: 'active',
  });

  // New Disposal Site form
  const [newSite, setNewSite] = useState<Partial<DisposalSite>>({
    siteName: '',
    siteType: 'compost_plant',
    wardNo: 3,
    locationName: '',
    totalAreaRopani: 10,
    dailyCapacityTons: 5,
    currentUtilizationPercent: 50,
    leachateTreatment: 'active_biological',
    eiaRegistrationNo: '',
    inchargeName: '',
    inchargePhone: '',
    status: 'operational',
  });

  // New Sanitation Worker form
  const [newWorker, setNewWorker] = useState<Partial<SanitationWorker>>({
    workerCode: '',
    fullName: '',
    wardNo: 3,
    role: 'sweeper',
    employmentType: 'contract',
    phone: '',
    emergencyContact: '',
    ppeKitStatus: 'distributed_complete',
    ppeDistributionDate: new Date().toISOString().split('T')[0],
    ppeItems: ['गमबुट', 'हेभी ड्युटी पन्जा', 'मास्क', 'फ्लोरोसेन्ट ज्याकेट'],
    lastHealthCheckupDate: new Date().toISOString().split('T')[0],
    vaccinationStatus: 'fully_vaccinated',
    insuranceStatus: 'active',
  });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [statsData, walletsData, ratesData, alertsData, vehiclesData, schData, sitesData, wrkData] = await Promise.all([
        wasteApi.getDashboardStats(),
        wasteApi.getWallets(),
        wasteApi.getRates(),
        wasteApi.getAlerts(),
        wasteApi.getLiveVehicles(),
        wasteApi.getSchedules(),
        wasteApi.getDisposalSites(),
        wasteApi.getSanitationWorkers(),
      ]);

      setStats(statsData);
      setWallets(walletsData);
      setRates(ratesData);
      setAlerts(alertsData);
      setLiveVehicles(vehiclesData);
      setSchedules(schData);
      setDisposalSites(sitesData);
      setWorkers(wrkData);
    } catch (e) {
      console.error('Error fetching waste management data', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSch.routeName || !newSch.driverName) return;
    await wasteApi.createSchedule(newSch);
    setIsAddScheduleOpen(false);
    setNewSch({
      wardNo: 3,
      routeCode: '',
      routeName: '',
      collectionDaysBio: 'आइतबार, बुधबार',
      collectionDaysNonBio: 'मंगलबार, शुक्रबार',
      vehicleNumber: 'बा २ क ',
      vehicleType: 'tractor',
      driverName: '',
      driverPhone: '',
      supervisorName: '',
      supervisorPhone: '',
      timing: 'बिहान ०६:३० - ०९:३०',
      status: 'active',
    });
    loadAllData();
  };

  const handleCreateSite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSite.siteName) return;
    await wasteApi.createDisposalSite(newSite);
    setIsAddSiteOpen(false);
    setNewSite({
      siteName: '',
      siteType: 'compost_plant',
      wardNo: 3,
      locationName: '',
      totalAreaRopani: 10,
      dailyCapacityTons: 5,
      currentUtilizationPercent: 50,
      leachateTreatment: 'active_biological',
      eiaRegistrationNo: '',
      inchargeName: '',
      inchargePhone: '',
      status: 'operational',
    });
    loadAllData();
  };

  const handleCreateWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorker.fullName) return;
    await wasteApi.createSanitationWorker(newWorker);
    setIsAddWorkerOpen(false);
    setNewWorker({
      workerCode: '',
      fullName: '',
      wardNo: 3,
      role: 'sweeper',
      employmentType: 'contract',
      phone: '',
      emergencyContact: '',
      ppeKitStatus: 'distributed_complete',
      ppeDistributionDate: new Date().toISOString().split('T')[0],
      ppeItems: ['गमबुट', 'हेभी ड्युटी पन्जा', 'मास्क', 'फ्लोरोसेन्ट ज्याकेट'],
      lastHealthCheckupDate: new Date().toISOString().split('T')[0],
      vaccinationStatus: 'fully_vaccinated',
      insuranceStatus: 'active',
    });
    loadAllData();
  };

  const handleResolveAlert = async (id: string) => {
    try {
      await wasteApi.updateAlertStatus(id, 'resolved');
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'resolved' } : a));
    } catch (e) {
      console.error(e);
    }
  };

  // ── 1. OVERVIEW TAB ─────────────────────────────────────────
  const renderOverview = () => (
    <>
      <div className="waste-kpi-grid">
        <div className="waste-kpi-card" style={{ '--kpi-accent': '#10b981' } as any}>
          <div className="waste-kpi-title">कुल फोहोर संकलन (यो महिना)</div>
          <div className="waste-kpi-val">{stats.totalCollectedKg.toLocaleString("en-IN")} <span style={{ fontSize: '1rem' }}>kg</span></div>
          <div className="waste-kpi-sub">
            <TrendingUp size={14} color="#10b981" /> +१२% अघिल्लो महिना भन्दा
          </div>
          <div className="waste-kpi-icon" style={{ '--icon-bg': '#ecfdf5', '--icon-color': '#10b981' } as any}>
            <Trash2 size={24} />
          </div>
        </div>

        <div className="waste-kpi-card" style={{ '--kpi-accent': '#3b82f6' } as any}>
          <div className="waste-kpi-title">पुनः प्रयोग (Recycled / Composted)</div>
          <div className="waste-kpi-val">{stats.recycledKg.toLocaleString("en-IN")} <span style={{ fontSize: '1rem' }}>kg</span></div>
          <div className="waste-kpi-sub">
            <Leaf size={14} color="#3b82f6" /> ६६.८% कुल संकलनको पुनर्चक्रण
          </div>
          <div className="waste-kpi-icon" style={{ '--icon-bg': '#eff6ff', '--icon-color': '#3b82f6' } as any}>
            <Recycle size={24} />
          </div>
        </div>

        <div className="waste-kpi-card" style={{ '--kpi-accent': '#f59e0b' } as any}>
          <div className="waste-kpi-title">नागरिकलाई भुक्तानी (Clean for Cash)</div>
          <div className="waste-kpi-val">रु. {stats.totalPayouts.toLocaleString("en-IN")}</div>
          <div className="waste-kpi-sub">
            <Wallet size={14} color="#f59e0b" /> ८४० घरधुरी लाभान्वित
          </div>
          <div className="waste-kpi-icon" style={{ '--icon-bg': '#fef3c7', '--icon-color': '#f59e0b' } as any}>
            <DollarSign size={24} />
          </div>
        </div>

        <div className="waste-kpi-card" style={{ '--kpi-accent': '#8b5cf6' } as any}>
          <div className="waste-kpi-title">सक्रिय सवारी तथा संकलन रुट</div>
          <div className="waste-kpi-val">{stats.activeVehicles} / {schedules.length}</div>
          <div className="waste-kpi-sub">
            <MapPin size={14} color="#8b5cf6" /> Live GPS Tracking Active
          </div>
          <div className="waste-kpi-icon" style={{ '--icon-bg': '#f3e8ff', '--icon-color': '#8b5cf6' } as any}>
            <Truck size={24} />
          </div>
        </div>
      </div>

      <div className="waste-content-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div className="waste-panel" style={{ height: '100%', minHeight: '480px', display: 'flex', flexDirection: 'column' }}>
            <div className="waste-panel-header">
              <div className="waste-panel-title">
                <MapPin size={18} color="#0f172a" />
                Live Vehicle Tracking & GIS Heatmap
              </div>
              <button className="waste-btn waste-btn-primary" onClick={() => window.print()}>
                <Download size={14} /> मासिक प्रतिवेदन
              </button>
            </div>
            <div style={{ flex: 1, borderRadius: '8px', overflow: 'hidden', marginTop: '0.5rem', border: '1px solid #e2e8f0' }}>
              <MapContainer 
                center={[27.8500, 85.5500]} 
                zoom={12} 
                style={{ height: '100%', width: '100%', minHeight: '380px' }}
              >
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                  attribution='&copy; OpenStreetMap contributors &copy; CARTO'
                />
                
                {liveVehicles.map(v => (
                  <Marker key={v.id} position={[Number(v.currentLat) || 27.8500, Number(v.currentLon) || 85.5500]} icon={truckIcon}>
                    <Popup>
                      <strong>{v.licensePlate}</strong><br/>
                      चालक: {v.driverName}<br/>
                      तोकिएको रुट: {v.routeAssigned}
                    </Popup>
                  </Marker>
                ))}

                <Circle center={[27.8500, 85.5500]} radius={800} pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.35 }}>
                  <Popup>पाँचपोखरी बजार क्षेत्र - उच्च फोहोर घनत्व</Popup>
                </Circle>
                <Circle center={[27.8300, 85.5700]} radius={500} pathOptions={{ color: 'orange', fillColor: 'orange', fillOpacity: 0.35 }}>
                  <Popup>मानेखर्क - मध्यम फोहोर उत्पादन क्षेत्र</Popup>
                </Circle>
              </MapContainer>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div className="waste-panel">
            <div className="waste-panel-header">
              <div className="waste-panel-title">
                <Wallet size={18} color="#0f172a" />
                Clean for Cash दररेट (प्रतिकेजी)
              </div>
            </div>
            
            <div className="waste-rate-list">
              {rates.map(rate => (
                <div key={rate.id} className="waste-rate-item">
                  <div className="waste-rate-name">
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: rate.colorCode || '#3b82f6' }}></div>
                    {rate.wasteType}
                  </div>
                  <div className="waste-rate-val">रु. {rate.ratePerKg}/kg</div>
                </div>
              ))}
            </div>
          </div>

          <div className="waste-panel">
            <div className="waste-panel-header">
              <div className="waste-panel-title">
                <AlertTriangle size={18} color="#ef4444" />
                पछिल्ला नागरिक गुनासो तथा रिपोर्ट
              </div>
              <button 
                className="waste-btn" 
                style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                onClick={() => setActiveTab('alerts')}
              >
                सबै हेर्नुहोस्
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {alerts.slice(0, 3).map((alert, idx) => (
                <div key={idx} style={{ padding: '0.85rem', borderLeft: `3px solid ${alert.status === 'pending' ? '#ef4444' : (alert.status === 'in-progress' ? '#f59e0b' : '#10b981')}`, background: alert.status === 'pending' ? '#fef2f2' : (alert.status === 'in-progress' ? '#fffbeb' : '#f0fdf4'), borderRadius: '0 6px 6px 0', fontSize: '0.82rem' }}>
                  <div style={{ fontWeight: 600, color: alert.status === 'pending' ? '#991b1b' : (alert.status === 'in-progress' ? '#92400e' : '#166534'), marginBottom: '4px' }}>{alert.issue}</div>
                  <div style={{ color: '#64748b' }}>स्थान: {alert.location} • {alert.reporter}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );

  // ── 2. WARD COLLECTION SCHEDULE & ROUTE PLANNING ──────────
  const renderRoutesSchedule = () => {
    const filteredSchedules = schedules.filter(s => {
      const matchWard = scheduleWardFilter === 'all' || s.wardNo === Number(scheduleWardFilter);
      const matchSearch = s.routeName.toLowerCase().includes(scheduleSearch.toLowerCase()) ||
        s.vehicleNumber.toLowerCase().includes(scheduleSearch.toLowerCase()) ||
        s.driverName.toLowerCase().includes(scheduleSearch.toLowerCase()) ||
        s.routeCode.toLowerCase().includes(scheduleSearch.toLowerCase());
      return matchWard && matchSearch;
    });

    return (
      <div className="waste-panel" style={{ marginTop: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <div className="waste-panel-title" style={{ fontSize: '1.25rem' }}>
              <Calendar size={22} color="#059669" />
              वडा फोहोर संकलन तालिका तथा रुट योजना (Ward Collection Schedules)
            </div>
            <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.85rem' }}>
              कुहिने तथा नकुहिने फोहोर संकलन बार, तोकिएको सवारी (ट्रयाक्टर/टिप्पर), चालक र सुपरभाइजरको विवरण
            </p>
          </div>
          <button 
            className="waste-btn waste-btn-primary"
            onClick={() => setIsAddScheduleOpen(true)}
            style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem' }}
          >
            <Plus size={16} /> नयाँ संकलन तालिका थप्नुहोस्
          </button>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input 
              type="text" 
              placeholder="रुट, सवारी नं. वा चालक खोज्नुहोस्..." 
              value={scheduleSearch}
              onChange={(e) => setScheduleSearch(e.target.value)}
              style={{ width: '100%', padding: '0.55rem 0.75rem 0.55rem 2.25rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>वडा:</span>
            <select
              value={scheduleWardFilter}
              onChange={(e) => setScheduleWardFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              style={{ padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', background: '#fff' }}
            >
              <option value="all">सबै वडाहरू (All Wards)</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(w => (
                <option key={w} value={w}>वडा नं. {w}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Schedule Cards / Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
              <tr>
                <th style={{ padding: '0.75rem 1rem' }}>रुट कोड / वडा</th>
                <th style={{ padding: '0.75rem 1rem' }}>रुटको विवरण</th>
                <th style={{ padding: '0.75rem 1rem' }}>कुहिने फोहोर बार (Organic)</th>
                <th style={{ padding: '0.75rem 1rem' }}>नकुहिने फोहोर बार (Inorganic)</th>
                <th style={{ padding: '0.75rem 1rem' }}>सवारी साधन (Vehicle)</th>
                <th style={{ padding: '0.75rem 1rem' }}>चालक तथा सम्पर्क</th>
                <th style={{ padding: '0.75rem 1rem' }}>सुपरभाइजर</th>
                <th style={{ padding: '0.75rem 1rem' }}>स्थिति</th>
              </tr>
            </thead>
            <tbody>
              {filteredSchedules.map((s) => (
                <tr key={s.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <div style={{ fontWeight: 700, color: '#0f766e' }}>{s.routeCode}</div>
                    <span style={{ display: 'inline-block', background: '#e0f2fe', color: '#0369a1', padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, marginTop: '2px' }}>
                      वडा {s.wardNo}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{s.routeName}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '2px' }}>
                      <Clock size={12} /> {s.timing}
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: '#dcfce7', color: '#166534', padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
                      <Leaf size={13} /> {s.collectionDaysBio}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: '#eff6ff', color: '#1d4ed8', padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
                      <Recycle size={13} /> {s.collectionDaysNonBio}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <div style={{ fontWeight: 600, color: '#334155' }}>{s.vehicleNumber}</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>प्रकार: {s.vehicleType === 'tractor' ? 'ट्र्याक्टर' : s.vehicleType === 'mini_truck' ? 'मिनी ट्रक' : 'टिप्पर'}</div>
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{s.driverName}</div>
                    <div style={{ fontSize: '0.78rem', color: '#059669', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Phone size={12} /> {s.driverPhone}
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <div style={{ fontWeight: 500, color: '#334155' }}>{s.supervisorName}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{s.supervisorPhone}</div>
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span style={{ background: s.status === 'active' ? '#dcfce7' : '#fee2e2', color: s.status === 'active' ? '#166534' : '#991b1b', padding: '0.2rem 0.5rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>
                      {s.status === 'active' ? '● सक्रिय' : 'मर्मतमा'}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredSchedules.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                    कुनै रुट तालिका भेटिएन।
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // ── 3. DUMPING SITES & COMPOST PLANTS ──────────────────────
  const renderDisposalSites = () => {
    const filteredSites = disposalSites.filter(site =>
      site.siteName.toLowerCase().includes(siteSearch.toLowerCase()) ||
      site.locationName.toLowerCase().includes(siteSearch.toLowerCase()) ||
      site.inchargeName.toLowerCase().includes(siteSearch.toLowerCase())
    );

    return (
      <div className="waste-panel" style={{ marginTop: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <div className="waste-panel-title" style={{ fontSize: '1.25rem' }}>
              <Factory size={22} color="#059669" />
              ल्यान्डफिल तथा कम्पोस्ट प्लान्ट व्यवस्थापन (Disposal & Composting Sites)
            </div>
            <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.85rem' }}>
              जैविक कम्पोस्ट प्लान्ट, सेनेटरी ल्यान्डफिल, दैनिक प्रशोधन क्षमता, लिचेट व्यवस्थापन र EIA स्वीकृति
            </p>
          </div>
          <button 
            className="waste-btn waste-btn-primary"
            onClick={() => setIsAddSiteOpen(true)}
            style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem' }}
          >
            <Plus size={16} /> नयाँ साइट दर्ता गर्नुहोस्
          </button>
        </div>

        <div style={{ marginBottom: '1.25rem', width: '320px', maxWidth: '100%', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input 
            type="text" 
            placeholder="साइट वा स्थान खोज्नुहोस्..." 
            value={siteSearch}
            onChange={(e) => setSiteSearch(e.target.value)}
            style={{ width: '100%', padding: '0.55rem 0.75rem 0.55rem 2.25rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
          {filteredSites.map((site) => (
            <div key={site.id} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', background: '#fff', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <span style={{ 
                  background: site.siteType === 'compost_plant' ? '#dcfce7' : site.siteType === 'recycling_hub' ? '#eff6ff' : '#fef3c7',
                  color: site.siteType === 'compost_plant' ? '#166534' : site.siteType === 'recycling_hub' ? '#1d4ed8' : '#92400e',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}>
                  {site.siteType === 'compost_plant' ? '🌿 जैविक कम्पोस्ट प्लान्ट' : site.siteType === 'recycling_hub' ? '♻️ रिसाइक्लिङ हब' : '🏗️ स्यानेटरी ल्यान्डफिल'}
                </span>
                <span style={{ background: '#f1f5f9', color: '#475569', fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
                  वडा नं. {site.wardNo}
                </span>
              </div>

              <h3 style={{ margin: '0 0 0.4rem', fontSize: '1.1rem', color: '#0f172a' }}>{site.siteName}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#64748b', fontSize: '0.82rem', marginBottom: '0.85rem' }}>
                <MapPin size={14} color="#059669" /> {site.locationName}
              </div>

              {/* Progress/Utilization */}
              <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                  <span style={{ color: '#475569' }}>दैनिक प्रशोधन / भण्डारण क्षमता:</span>
                  <strong>{site.dailyCapacityTons} टन/दिन</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                  <span style={{ color: '#475569' }}>कुल क्षेत्रफल:</span>
                  <strong>{site.totalAreaRopani} रोपनी</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                  <span style={{ color: '#475569' }}>उपयोग दर (Utilization):</span>
                  <strong style={{ color: site.currentUtilizationPercent > 80 ? '#ef4444' : '#059669' }}>{site.currentUtilizationPercent}%</strong>
                </div>
                <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${site.currentUtilizationPercent}%`, height: '100%', background: site.currentUtilizationPercent > 80 ? '#ef4444' : '#10b981', borderRadius: '3px' }} />
                </div>
              </div>

              <div style={{ fontSize: '0.8rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.3rem', marginBottom: '0.85rem' }}>
                <div>
                  <span style={{ fontWeight: 600 }}>लिचेट व्यवस्थापन:</span> {site.leachateTreatment === 'active_biological' ? 'जैविक उपचार प्रणाली (Biological)' : site.leachateTreatment === 'aeration_tank' ? 'एरेसन ट्याङ्क' : 'सोकपिट'}
                </div>
                <div>
                  <span style={{ fontWeight: 600 }}>EIA/IEE स्वीकृति नं:</span> <span style={{ fontFamily: 'monospace', color: '#0369a1' }}>{site.eiaRegistrationNo}</span>
                </div>
              </div>

              <div style={{ marginTop: 'auto', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                <div>
                  <div style={{ color: '#64748b' }}>केन्द्र इन्चार्ज:</div>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>{site.inchargeName}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#059669', fontWeight: 600 }}>
                  <Phone size={13} /> {site.inchargePhone}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ── 4. SANITATION STAFF & PPE TRACKING ─────────────────────
  const renderSanitationStaff = () => {
    const filteredWorkers = workers.filter(w =>
      w.fullName.toLowerCase().includes(workerSearch.toLowerCase()) ||
      w.workerCode.toLowerCase().includes(workerSearch.toLowerCase()) ||
      w.phone.toLowerCase().includes(workerSearch.toLowerCase())
    );

    return (
      <div className="waste-panel" style={{ marginTop: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <div className="waste-panel-title" style={{ fontSize: '1.25rem' }}>
              <HardHat size={22} color="#059669" />
              सफाइ कर्मचारी तथा सुरक्षा सामग्री (Sanitation Staff & PPE Safety Tracking)
            </div>
            <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.85rem' }}>
              सफाइ मित्रहरूको कार्यक्षेत्र, व्यक्तिगत सुरक्षा उपकरण (PPE Kit), स्वास्थ्य जाँच, खोप तथा बीमा ट्र्याकिङ
            </p>
          </div>
          <button 
            className="waste-btn waste-btn-primary"
            onClick={() => setIsAddWorkerOpen(true)}
            style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem' }}
          >
            <Plus size={16} /> नयाँ सफाइकर्मी दर्ता गर्नुहोस्
          </button>
        </div>

        <div style={{ marginBottom: '1.25rem', width: '320px', maxWidth: '100%', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input 
            type="text" 
            placeholder="सफाइकर्मीको नाम वा कोड खोज्नुहोस्..." 
            value={workerSearch}
            onChange={(e) => setWorkerSearch(e.target.value)}
            style={{ width: '100%', padding: '0.55rem 0.75rem 0.55rem 2.25rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
          />
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
              <tr>
                <th style={{ padding: '0.75rem 1rem' }}>संकेत नं / नाम</th>
                <th style={{ padding: '0.75rem 1rem' }}>कार्यक्षेत्र / पद</th>
                <th style={{ padding: '0.75rem 1rem' }}>सम्पर्क तथा आपतकालीन</th>
                <th style={{ padding: '0.75rem 1rem' }}>सुरक्षा सामग्री (PPE Kit) स्थिति</th>
                <th style={{ padding: '0.75rem 1rem' }}>स्वास्थ्य परीक्षण तथा खोप</th>
                <th style={{ padding: '0.75rem 1rem' }}>दुर्घटना बीमा</th>
              </tr>
            </thead>
            <tbody>
              {filteredWorkers.map(w => (
                <tr key={w.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{w.fullName}</div>
                    <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#0369a1', background: '#f0f9ff', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                      {w.workerCode}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <div style={{ fontWeight: 600, color: '#334155' }}>
                      {w.role === 'sweeper' ? 'सडक सफाइकर्मी (Sweeper)' : w.role === 'driver' ? 'ट्र्याक्टर चालक' : w.role === 'compost_operator' ? 'कम्पोस्ट अपरेटर' : 'सहयोगी'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      वडा नं. {w.wardNo} • {w.employmentType === 'permanent' ? 'स्थायी' : 'करार'}
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <div style={{ fontWeight: 500, color: '#047857', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Phone size={12} /> {w.phone}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                      आपतकालीन: {w.emergencyContact}
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <div style={{ marginBottom: '0.25rem' }}>
                      <span style={{ 
                        background: w.ppeKitStatus === 'distributed_complete' ? '#dcfce7' : '#fef3c7',
                        color: w.ppeKitStatus === 'distributed_complete' ? '#166534' : '#92400e',
                        padding: '0.2rem 0.55rem',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}>
                        <ShieldCheck size={13} /> {w.ppeKitStatus === 'distributed_complete' ? 'पूर्ण वितरण भएको' : 'थप आवश्यक'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                      {w.ppeItems.map((item, i) => (
                        <span key={i} style={{ background: '#f1f5f9', color: '#475569', fontSize: '0.7rem', padding: '0.1rem 0.35rem', borderRadius: '3px' }}>
                          {item}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <div style={{ fontSize: '0.8rem', color: '#334155' }}>
                      पछिल्लो जाँच: <strong>{w.lastHealthCheckupDate}</strong>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: w.vaccinationStatus === 'fully_vaccinated' ? '#16a34a' : '#d97706', marginTop: '2px', fontWeight: 600 }}>
                      खोप: {w.vaccinationStatus === 'fully_vaccinated' ? '✓ पूर्ण खोप प्राप्त (Hep-B/Tetanus)' : 'आंशिक'}
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '0.25rem 0.6rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600 }}>
                      रु ५ लाख सक्रिय
                    </span>
                  </td>
                </tr>
              ))}
              {filteredWorkers.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                    कुनै सफाइकर्मी भेटिएन।
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // ── 5. WALLET TAB ──────────────────────────────────────────
  const renderWallet = () => (
    <div className="waste-panel" style={{ marginTop: '1rem' }}>
      <div className="waste-panel-header" style={{ marginBottom: '1.5rem' }}>
        <div className="waste-panel-title">
          <Wallet size={24} color="#10b981" />
          Clean for Cash (नागरिक वालेट रेकर्ड)
        </div>
      </div>
      <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
        नागरिकले छुट्याएर दिएको फोहोरको तौल अनुसार उनीहरूको खातामा जम्मा भएको रकम। यो रकम उनीहरूको मासिक शुल्कमा कट्टा गर्न वा सिधै भुक्तानी गर्न सकिन्छ।
      </p>
      
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }}>
        <thead>
          <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
            <th style={{ padding: '1rem', color: '#475569', fontWeight: 600 }}>घरधुरी आईडी</th>
            <th style={{ padding: '1rem', color: '#475569', fontWeight: 600 }}>नाम</th>
            <th style={{ padding: '1rem', color: '#475569', fontWeight: 600 }}>वडा नं</th>
            <th style={{ padding: '1rem', color: '#475569', fontWeight: 600 }}>जम्मा भएको रकम (रू)</th>
            <th style={{ padding: '1rem', color: '#475569', fontWeight: 600 }}>पछिल्लो संकलन मिति</th>
            <th style={{ padding: '1rem', color: '#475569', fontWeight: 600 }}>कार्य</th>
          </tr>
        </thead>
        
        <tbody>
          {wallets.map((row, idx) => (
            <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '1rem', fontWeight: 600, color: '#0f766e' }}>{row.id}</td>
              <td style={{ padding: '1rem' }}>{row.name}</td>
              <td style={{ padding: '1rem' }}>वडा {row.ward}</td>
              <td style={{ padding: '1rem', color: '#059669', fontWeight: 700 }}>रु. {row.balance.toLocaleString()}</td>
              <td style={{ padding: '1rem', color: '#64748b' }}>{new Date(row.date).toLocaleDateString()}</td>
              <td style={{ padding: '1rem' }}>
                <button className="waste-btn waste-btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                  भुक्तानी / मिलान
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // ── 6. ALERTS TAB ──────────────────────────────────────────
  const renderAlerts = () => (
    <div className="waste-panel" style={{ marginTop: '1rem' }}>
      <div className="waste-panel-header" style={{ marginBottom: '1.5rem' }}>
        <div className="waste-panel-title">
          <AlertTriangle size={24} color="#ef4444" />
          नागरिक रिपोर्टिङ तथा गुनासो व्यवस्थापन
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {alerts.map((tkt) => (
          <div key={tkt.id} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>{tkt.id}</span>
              {tkt.status === 'pending' && <span style={{ padding: '0.25rem 0.6rem', backgroundColor: '#fef2f2', color: '#ef4444', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>नयाँ रिपोर्ट</span>}
              {tkt.status === 'in-progress' && <span style={{ padding: '0.25rem 0.6rem', backgroundColor: '#fffbeb', color: '#d97706', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>काम भइरहेको</span>}
              {tkt.status === 'resolved' && <span style={{ padding: '0.25rem 0.6rem', backgroundColor: '#f0fdf4', color: '#16a34a', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>समाधान भयो</span>}
            </div>
            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.05rem', color: '#0f172a' }}>{tkt.issue}</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
              <MapPin size={14} /> {tkt.location}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              <Clock size={14} /> {new Date(tkt.date).toLocaleDateString()} | रिपोर्टकर्ता: {tkt.reporter}
            </div>
            
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {tkt.status !== 'resolved' && (
                <button
                  type="button"
                  onClick={() => handleResolveAlert(tkt.id)}
                  className="waste-btn waste-btn-primary"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  <CheckCircle size={16} /> समाधान मार्क गर्नुहोस्
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="waste-dashboard-wrapper">
      {/* ── COMMAND CENTER HERO BANNER ──────────────────────────────────────── */}
      <div className="waste-hero">
        <div className="waste-hero-content">
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
            <div className="waste-hero-badge">
              <Recycle size={14} /> Clean for Cash (फोहोरबाट मोहर)
            </div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                borderRadius: '20px',
                background: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                fontSize: '0.74rem',
                fontWeight: 700,
                color: '#d1fae5',
              }}
            >
              <ShieldCheck size={14} /> फोहोरमैला व्यवस्थापन ऐन २०६८ • LGOA २०७४ अनुसूची ८
            </div>
          </div>
          <h1>फोहोरमैला व्यवस्थापन, रुट योजना तथा राजस्व केन्द्र</h1>
          <p>
            पाँचपोखरी थाङपाल गाउँपालिकाको स्मार्ट फोहोर संकलन तालिका, डम्पिङ तथा कम्पोस्ट प्लान्ट, सफाइकर्मी सुरक्षा र नागरिक क्यास पोइन्ट एकीकृत प्रणाली
          </p>
        </div>
      </div>

      {/* ── MODULE TABS ──────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '0.5rem', margin: '0.5rem 0 1rem', background: '#f8fafc', padding: '0.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
        <button 
          onClick={() => setActiveTab('overview')}
          className={`waste-btn ${activeTab === 'overview' ? 'waste-btn-primary' : ''}`}
          style={{ background: activeTab !== 'overview' ? 'transparent' : '', color: activeTab !== 'overview' ? '#64748b' : '' }}
        >
          <TrendingUp size={16} /> Overview (ड्यासबोर्ड)
        </button>
        <button 
          onClick={() => setActiveTab('routes_schedule')}
          className={`waste-btn ${activeTab === 'routes_schedule' ? 'waste-btn-primary' : ''}`}
          style={{ background: activeTab !== 'routes_schedule' ? 'transparent' : '', color: activeTab !== 'routes_schedule' ? '#64748b' : '' }}
        >
          <Calendar size={16} /> वडा संकलन तालिका तथा रुट
        </button>
        <button 
          onClick={() => setActiveTab('disposal_sites')}
          className={`waste-btn ${activeTab === 'disposal_sites' ? 'waste-btn-primary' : ''}`}
          style={{ background: activeTab !== 'disposal_sites' ? 'transparent' : '', color: activeTab !== 'disposal_sites' ? '#64748b' : '' }}
        >
          <Factory size={16} /> डम्पिङ तथा कम्पोस्ट प्लान्ट
        </button>
        <button 
          onClick={() => setActiveTab('sanitation_staff')}
          className={`waste-btn ${activeTab === 'sanitation_staff' ? 'waste-btn-primary' : ''}`}
          style={{ background: activeTab !== 'sanitation_staff' ? 'transparent' : '', color: activeTab !== 'sanitation_staff' ? '#64748b' : '' }}
        >
          <HardHat size={16} /> सफाइ कर्मचारी तथा PPE सुरक्षा
        </button>
        <button 
          onClick={() => setActiveTab('wallet')}
          className={`waste-btn ${activeTab === 'wallet' ? 'waste-btn-primary' : ''}`}
          style={{ background: activeTab !== 'wallet' ? 'transparent' : '', color: activeTab !== 'wallet' ? '#64748b' : '' }}
        >
          <Wallet size={16} /> Clean for Cash (वालेट)
        </button>
        <button 
          onClick={() => setActiveTab('alerts')}
          className={`waste-btn ${activeTab === 'alerts' ? 'waste-btn-primary' : ''}`}
          style={{ background: activeTab !== 'alerts' ? 'transparent' : '', color: activeTab !== 'alerts' ? '#64748b' : '' }}
        >
          <AlertTriangle size={16} /> नागरिक गुनासो
        </button>
      </div>

      {/* ── DYNAMIC CONTENT ──────────────────────────────────────── */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'routes_schedule' && renderRoutesSchedule()}
      {activeTab === 'disposal_sites' && renderDisposalSites()}
      {activeTab === 'sanitation_staff' && renderSanitationStaff()}
      {activeTab === 'wallet' && renderWallet()}
      {activeTab === 'alerts' && renderAlerts()}

      {/* ── MODAL 1: ADD COLLECTION SCHEDULE ───────────────────── */}
      {isAddScheduleOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '580px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ background: 'linear-gradient(135deg, #065f46 0%, #059669 100%)', color: '#fff', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>नयाँ संकलन तालिका तथा रुट प्रविष्टि</h3>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', opacity: 0.9 }}>वडा फोहोरमैला संकलन बार, समय र सवारी साधन विवरण</p>
              </div>
              <button onClick={() => setIsAddScheduleOpen(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', borderRadius: '50%', padding: '0.4rem', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSchedule} style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>वडा नं. *</label>
                  <select
                    value={newSch.wardNo}
                    onChange={(e) => setNewSch({ ...newSch, wardNo: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(w => (
                      <option key={w} value={w}>वडा नं. {w}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>रुट कोड</label>
                  <input
                    type="text"
                    placeholder="उदा: RT-03-C"
                    value={newSch.routeCode}
                    onChange={(e) => setNewSch({ ...newSch, routeCode: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>रुटको पूरा नाम तथा क्षेत्र *</label>
                <input
                  type="text"
                  required
                  placeholder="उदा: तार्केघ्याङ - गुम्बाडाँडा - शेर्पा बस्ती"
                  value={newSch.routeName}
                  onChange={(e) => setNewSch({ ...newSch, routeName: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#166534', marginBottom: '0.3rem' }}>कुहिने फोहोर बार (Bio)</label>
                  <input
                    type="text"
                    placeholder="उदा: आइतबार, बुधबार"
                    value={newSch.collectionDaysBio}
                    onChange={(e) => setNewSch({ ...newSch, collectionDaysBio: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #86efac', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#1d4ed8', marginBottom: '0.3rem' }}>नकुहिने फोहोर बार (Non-Bio)</label>
                  <input
                    type="text"
                    placeholder="उदा: मंगलबार, शुक्रबार"
                    value={newSch.collectionDaysNonBio}
                    onChange={(e) => setNewSch({ ...newSch, collectionDaysNonBio: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #93c5fd', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>सवारी साधन नं. *</label>
                  <input
                    type="text"
                    required
                    placeholder="बा २ क ४५६७"
                    value={newSch.vehicleNumber}
                    onChange={(e) => setNewSch({ ...newSch, vehicleNumber: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>सवारी प्रकार</label>
                  <select
                    value={newSch.vehicleType}
                    onChange={(e) => setNewSch({ ...newSch, vehicleType: e.target.value as any })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  >
                    <option value="tractor">ट्र्याक्टर (Tractor)</option>
                    <option value="mini_truck">मिनी ट्रक / टिप्पर</option>
                    <option value="tipper">ठूलो टिप्पर</option>
                    <option value="compactor">कम्प्याक्टर</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>चालकको नाम *</label>
                  <input
                    type="text"
                    required
                    placeholder="उदा: राम बहादुर श्रेष्ठ"
                    value={newSch.driverName}
                    onChange={(e) => setNewSch({ ...newSch, driverName: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>चालकको सम्पर्क नं.</label>
                  <input
                    type="tel"
                    placeholder="९८xxxxxxxx"
                    value={newSch.driverPhone}
                    onChange={(e) => setNewSch({ ...newSch, driverPhone: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>सुपरभाइजरको नाम</label>
                  <input
                    type="text"
                    placeholder="उदा: सुरेश तामाङ"
                    value={newSch.supervisorName}
                    onChange={(e) => setNewSch({ ...newSch, supervisorName: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>सुपरभाइजरको फोन नं.</label>
                  <input
                    type="tel"
                    placeholder="९८xxxxxxxx"
                    value={newSch.supervisorPhone}
                    onChange={(e) => setNewSch({ ...newSch, supervisorPhone: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setIsAddScheduleOpen(false)} style={{ flex: 1, padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontWeight: 600 }}>रद्द गर्नुहोस्</button>
                <button type="submit" style={{ flex: 2, padding: '0.65rem', borderRadius: '8px', border: 'none', background: '#059669', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>तालिका सुरक्षित गर्नुहोस्</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 2: ADD DISPOSAL SITE ─────────────────────────── */}
      {isAddSiteOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '560px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 100%)', color: '#fff', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>नयाँ डम्पिङ / कम्पोस्ट साइट दर्ता</h3>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', opacity: 0.9 }}>फोहोर प्रशोधन प्लान्ट, क्षमता तथा वातावरणीय स्वीकृति</p>
              </div>
              <button onClick={() => setIsAddSiteOpen(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', borderRadius: '50%', padding: '0.4rem', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSite} style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>साइट वा प्लान्टको नाम *</label>
                <input
                  type="text"
                  required
                  placeholder="उदा: पाँचपोखरी जैविक कम्पोस्ट मल उत्पादन केन्द्र"
                  value={newSite.siteName}
                  onChange={(e) => setNewSite({ ...newSite, siteName: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>साइटको प्रकार</label>
                  <select
                    value={newSite.siteType}
                    onChange={(e) => setNewSite({ ...newSite, siteType: e.target.value as any })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  >
                    <option value="compost_plant">🌿 जैविक कम्पोस्ट प्लान्ट</option>
                    <option value="landfill_site">🏗️ स्यानेटरी ल्यान्डफिल</option>
                    <option value="recycling_hub">♻️ फोहोर वर्गीकरण तथा रिसाइक्लिङ हब</option>
                    <option value="transfer_station">🚚 ट्रान्सफर स्टेसन</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>वडा नं.</label>
                  <select
                    value={newSite.wardNo}
                    onChange={(e) => setNewSite({ ...newSite, wardNo: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(w => (
                      <option key={w} value={w}>वडा नं. {w}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>स्थान / टोल</label>
                <input
                  type="text"
                  placeholder="उदा: तार्केघ्याङ फेदी, चिसोपानी"
                  value={newSite.locationName}
                  onChange={(e) => setNewSite({ ...newSite, locationName: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>कुल क्षेत्रफल (रोपनी)</label>
                  <input
                    type="number"
                    min="1"
                    value={newSite.totalAreaRopani}
                    onChange={(e) => setNewSite({ ...newSite, totalAreaRopani: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>दैनिक क्षमता (टन/दिन)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={newSite.dailyCapacityTons}
                    onChange={(e) => setNewSite({ ...newSite, dailyCapacityTons: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>केन्द्र इन्चार्ज</label>
                  <input
                    type="text"
                    placeholder="उदा: ई. रोहन थापा"
                    value={newSite.inchargeName}
                    onChange={(e) => setNewSite({ ...newSite, inchargeName: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>इन्चार्ज सम्पर्क नं.</label>
                  <input
                    type="tel"
                    placeholder="९८xxxxxxxx"
                    value={newSite.inchargePhone}
                    onChange={(e) => setNewSite({ ...newSite, inchargePhone: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setIsAddSiteOpen(false)} style={{ flex: 1, padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontWeight: 600 }}>रद्द गर्नुहोस्</button>
                <button type="submit" style={{ flex: 2, padding: '0.65rem', borderRadius: '8px', border: 'none', background: '#0f766e', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>साइट दर्ता गर्नुहोस्</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 3: ADD SANITATION WORKER ─────────────────────── */}
      {isAddWorkerOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '580px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)', color: '#fff', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>नयाँ सफाइकर्मी तथा PPE सुरक्षा दर्ता</h3>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', opacity: 0.9 }}>सफाइ मित्र विवरण, PPE किट, खोप तथा स्वास्थ्य जाँच अभिलेख</p>
              </div>
              <button onClick={() => setIsAddWorkerOpen(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', borderRadius: '50%', padding: '0.4rem', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateWorker} style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>सफाइकर्मीको पूरा नाम *</label>
                  <input
                    type="text"
                    required
                    placeholder="उदा: माइला तामाङ"
                    value={newWorker.fullName}
                    onChange={(e) => setNewWorker({ ...newWorker, fullName: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>कर्मचारी संकेत नं.</label>
                  <input
                    type="text"
                    placeholder="P5-SAN-05"
                    value={newWorker.workerCode}
                    onChange={(e) => setNewWorker({ ...newWorker, workerCode: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>तोकिएको वडा</label>
                  <select
                    value={newWorker.wardNo}
                    onChange={(e) => setNewWorker({ ...newWorker, wardNo: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(w => (
                      <option key={w} value={w}>वडा नं. {w}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>पद / भूमिका</label>
                  <select
                    value={newWorker.role}
                    onChange={(e) => setNewWorker({ ...newWorker, role: e.target.value as any })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  >
                    <option value="sweeper">सडक सफाइकर्मी</option>
                    <option value="driver">ट्र्याक्टर चालक</option>
                    <option value="compost_operator">कम्पोस्ट अपरेटर</option>
                    <option value="loader">लोड/अनलोड सहयोगी</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>रोजगारीको प्रकार</label>
                  <select
                    value={newWorker.employmentType}
                    onChange={(e) => setNewWorker({ ...newWorker, employmentType: e.target.value as any })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  >
                    <option value="contract">करार सेवा</option>
                    <option value="permanent">स्थायी सेवा</option>
                    <option value="daily_wage">दैनिक ज्यालादारी</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>सम्पर्क फोन नं.</label>
                  <input
                    type="tel"
                    placeholder="९८xxxxxxxx"
                    value={newWorker.phone}
                    onChange={(e) => setNewWorker({ ...newWorker, phone: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>आपतकालीन सम्पर्क व्यक्ति र फोन</label>
                  <input
                    type="text"
                    placeholder="उदा: सुन्तली तामाङ - ९८१२०००१११"
                    value={newWorker.emergencyContact}
                    onChange={(e) => setNewWorker({ ...newWorker, emergencyContact: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ background: '#eff6ff', padding: '0.85rem', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.85rem', color: '#1d4ed8', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <ShieldCheck size={15} /> PPE किट तथा स्वास्थ्य स्थिति
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#1e3a8a', marginBottom: '0.25rem' }}>PPE किट वितरण स्थिति</label>
                    <select
                      value={newWorker.ppeKitStatus}
                      onChange={(e) => setNewWorker({ ...newWorker, ppeKitStatus: e.target.value as any })}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #93c5fd', fontSize: '0.82rem' }}
                    >
                      <option value="distributed_complete">✓ पूर्ण वितरण (Complete)</option>
                      <option value="partially_distributed">आंशिक वितरण (Partial)</option>
                      <option value="replacement_needed">नवीकरण/फेरबदल आवश्यक</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#1e3a8a', marginBottom: '0.25rem' }}>खोप स्थिति</label>
                    <select
                      value={newWorker.vaccinationStatus}
                      onChange={(e) => setNewWorker({ ...newWorker, vaccinationStatus: e.target.value as any })}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #93c5fd', fontSize: '0.82rem' }}
                    >
                      <option value="fully_vaccinated">✓ पूर्ण खोप प्राप्त</option>
                      <option value="partially_vaccinated">आंशिक खोप</option>
                      <option value="due">खोप लिन बाँकी</option>
                    </select>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setIsAddWorkerOpen(false)} style={{ flex: 1, padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontWeight: 600 }}>रद्द गर्नुहोस्</button>
                <button type="submit" style={{ flex: 2, padding: '0.65rem', borderRadius: '8px', border: 'none', background: '#2563eb', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>सफाइकर्मी सुरक्षित गर्नुहोस्</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WasteManagementDashboard;
