import React, { useState, useEffect, useMemo } from 'react';
import {
  Compass,
  Plus,
  Search,
  Filter,
  Layers,
  MapPin,
  TrendingUp,
  Truck,
  Car,
  Activity,
  CheckCircle2,
  AlertTriangle,
  FileText,
  DollarSign,
  Wrench,
  Bus,
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useTenant } from '../../context/TenantContext';
import { useFiscalYear } from '../../context/FiscalYearContext';

interface RoadSegment {
  id: string;
  roadName: string; // सडकको नाम
  roadCode: string; // सडक कोड (MTMP)
  startPoint: string; // सुरु बिन्दु
  endPoint: string; // अन्त्य बिन्दु
  lengthKm: number; // लम्बाइ (कि.मी.)
  widthM: number; // चौडाइ (मिटर)
  surfaceType: 'कालोपत्रे' | 'आरसीसी ढलान' | 'ग्राभेल' | 'कच्ची (माटो)' | 'नयाँ ट्रयाक';
  wardNumbers: string; // वडाहरू (उदा. १, २, ३)
  trafficVolume: 'उच्च' | 'मध्यम' | 'न्यून';
  condition: 'राम्रो' | 'मर्मत आवश्यक' | 'जीर्ण/जोखिमपूर्ण';
  annualMaintenanceNpr: number; // मर्मत बजेट
}

const INITIAL_ROADS: RoadSegment[] = [
  {
    id: 'rd-1',
    name: 'थाङपालधाप - मानेखर्क - भोताङ मुख्य चक्रपथ',
    roadName: 'थाङपालधाप - मानेखर्क - भोताङ मुख्य चक्रपथ',
    roadCode: 'P5-MR-01',
    startPoint: 'थाङपालधाप बजार',
    endPoint: 'भोताङ मानेचौर',
    lengthKm: 18.5,
    widthM: 6.5,
    surfaceType: 'कालोपत्रे',
    wardNumbers: '१, २, ३, ४',
    trafficVolume: 'उच्च',
    condition: 'राम्रो',
    annualMaintenanceNpr: 1500000,
  },
  {
    id: 'rd-2',
    name: 'मेलम्ची सिन्धु - गुन्सा कृषि लिंक सडक',
    roadName: 'मेलम्ची सिन्धु - गुन्सा कृषि लिंक सडक',
    roadCode: 'P5-AR-04',
    startPoint: 'गुन्सा पुल',
    endPoint: 'सिम्ले फाँट',
    lengthKm: 8.2,
    widthM: 5.0,
    surfaceType: 'ग्राभेल',
    wardNumbers: '२',
    trafficVolume: 'मध्यम',
    condition: 'मर्मत आवश्यक',
    annualMaintenanceNpr: 650000,
  },
  {
    id: 'rd-3',
    name: 'थाङपालकोट - छिम्ती धार्मिक पर्यटन सडक',
    roadName: 'थाङपालकोट - छिम्ती धार्मिक पर्यटन सडक',
    roadCode: 'P5-TR-02',
    startPoint: 'थाङपालकोट गढी',
    endPoint: 'छिम्ती गुम्बा',
    lengthKm: 11.4,
    widthM: 4.5,
    surfaceType: 'आरसीसी ढलान',
    wardNumbers: '६, ७',
    trafficVolume: 'मध्यम',
    condition: 'राम्रो',
    annualMaintenanceNpr: 400000,
  },
  {
    id: 'rd-4',
    name: 'बरुवा - याङ्ग्री हिमाली ग्रामीण सडक',
    roadName: 'बरुवा - याङ्ग्री हिमाली ग्रामीण सडक',
    roadCode: 'P5-RR-09',
    startPoint: 'बरुवा बजार',
    endPoint: 'याङ्ग्री खोला दोभान',
    lengthKm: 14.0,
    widthM: 4.0,
    surfaceType: 'कच्ची (माटो)',
    wardNumbers: '५, ८',
    trafficVolume: 'न्यून',
    condition: 'जीर्ण/जोखिमपूर्ण',
    annualMaintenanceNpr: 900000,
  },
];

interface BridgeItem {
  id: string;
  name: string;
  riverName: string;
  bridgeType: 'आरसीसी मोटरेबल' | 'स्टिल ट्रस' | 'झोलुङ्गे पुल' | 'ह्युमपाइप कल्भर्ट';
  spanMeter: number;
  widthMeter: number;
  ward: number;
  condition: 'सुरक्षित' | 'तत्काल मर्मत' | 'नयाँ निर्माण सिफारिस';
}

const INITIAL_BRIDGES: BridgeItem[] = [
  {
    id: 'br-1',
    name: 'याङ्ग्री खोला पक्की मोटरेबल पुल',
    riverName: 'याङ्ग्री खोला',
    bridgeType: 'आरसीसी मोटरेबल',
    spanMeter: 45,
    widthMeter: 7.5,
    ward: 2,
    condition: 'सुरक्षित',
  },
  {
    id: 'br-2',
    name: 'इन्द्रावती भोटेकोसी दोभान झोलुङ्गे पुल',
    riverName: 'इन्द्रावती नदी',
    bridgeType: 'झोलुङ्गे पुल',
    spanMeter: 120,
    widthMeter: 1.5,
    ward: 1,
    condition: 'सुरक्षित',
  },
  {
    id: 'br-3',
    name: 'छहरे खोला कल्भर्ट तथा कजवे',
    riverName: 'छहरे खोला',
    bridgeType: 'ह्युमपाइप कल्भर्ट',
    spanMeter: 12,
    widthMeter: 6.0,
    ward: 4,
    condition: 'तत्काल मर्मत',
  },
];

export interface RoadsPageProps {
  isPublic?: boolean;
}

export const RoadsPage: React.FC<RoadsPageProps> = ({ isPublic: propIsPublic }) => {
  const location = useLocation();
  const isPublic = propIsPublic !== undefined ? propIsPublic : !location.pathname.startsWith('/app');
  const { tenantId, settings } = useTenant();
  const { activeFiscalYear } = useFiscalYear();

  const [activeTab, setActiveTab] = useState<'inventory' | 'bridges' | 'transit' | 'maintenance'>('inventory');
  const [roads, setRoads] = useState<RoadSegment[]>(() => {
    const saved = localStorage.getItem(`roads_inventory_${tenantId}`);
    return saved ? JSON.parse(saved) : INITIAL_ROADS;
  });
  const [bridges, setBridges] = useState<BridgeItem[]>(() => {
    const saved = localStorage.getItem(`roads_bridges_${tenantId}`);
    return saved ? JSON.parse(saved) : INITIAL_BRIDGES;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSurface, setSelectedSurface] = useState<string>('all');
  const [isAddRoadModalOpen, setIsAddRoadModalOpen] = useState(false);

  // Form State
  const [fName, setFName] = useState('');
  const [fCode, setFCode] = useState('');
  const [fStart, setFStart] = useState('');
  const [fEnd, setFEnd] = useState('');
  const [fLength, setFLength] = useState('5.0');
  const [fWidth, setFWidth] = useState('5.0');
  const [fSurface, setFSurface] = useState<RoadSegment['surfaceType']>('ग्राभेल');
  const [fWards, setFWards] = useState('1');

  useEffect(() => {
    localStorage.setItem(`roads_inventory_${tenantId}`, JSON.stringify(roads));
  }, [roads, tenantId]);

  useEffect(() => {
    localStorage.setItem(`roads_bridges_${tenantId}`, JSON.stringify(bridges));
  }, [bridges, tenantId]);

  const handleAddRoad = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fName) return;

    const newRoad: RoadSegment = {
      id: `rd-${Date.now()}`,
      roadName: fName,
      roadCode: fCode || `P5-RD-0${roads.length + 1}`,
      startPoint: fStart || 'पालिका केन्द्र',
      endPoint: fEnd || 'वडा सिमाना',
      lengthKm: Number(fLength) || 1,
      widthM: Number(fWidth) || 4,
      surfaceType: fSurface,
      wardNumbers: fWards,
      trafficVolume: 'मध्यम',
      condition: 'राम्रो',
      annualMaintenanceNpr: 250000,
    };

    setRoads([newRoad, ...roads]);
    setIsAddRoadModalOpen(false);
    setFName('');
    setFCode('');
  };

  // KPIs
  const totalKm = roads.reduce((acc, r) => acc + r.lengthKm, 0);
  const pavedKm = roads
    .filter((r) => r.surfaceType === 'कालोपत्रे' || r.surfaceType === 'आरसीसी ढलान')
    .reduce((acc, r) => acc + r.lengthKm, 0);
  const pavedPct = totalKm > 0 ? ((pavedKm / totalKm) * 100).toFixed(1) : '0';
  const totalBridges = bridges.length;
  const maintenanceNeededCount = roads.filter((r) => r.condition !== 'राम्रो').length;

  const filteredRoads = useMemo(() => {
    return roads.filter((r) => {
      const matchSearch =
        r.roadName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.roadCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.startPoint.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.endPoint.toLowerCase().includes(searchQuery.toLowerCase());
      const matchSurface = selectedSurface === 'all' || r.surfaceType === selectedSurface;
      return matchSearch && matchSurface;
    });
  }, [roads, searchQuery, selectedSurface]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', padding: '1rem' }}>
      {/* ── HEADER BANNER ── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f766e 0%, #115e59 100%)',
          borderRadius: '18px',
          padding: '1.75rem',
          color: '#ffffff',
          boxShadow: '0 8px 24px rgba(15, 118, 110, 0.22)',
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
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(8px)',
            }}
          >
            <Compass size={28} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>
                स्थानीय सडक पूर्वाधार तथा यातायात सञ्जाल (Roads & MTMP)
              </h1>
              <span
                style={{
                  backgroundColor: 'rgba(255,255,255,0.25)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '999px',
                }}
              >
                संविधान अनुसूची ८ (एकल अधिकार ११)
              </span>
            </div>
            <p style={{ margin: '4px 0 0', opacity: 0.9, fontSize: '0.85rem' }}>
              {settings?.palika_name || 'गाउँ/नगर कार्यपालिका'} — नगरपालिका यातायात गुरुयोजना (MTMP), पुल-पुलेसा, सार्वजनिक यातायात तथा सडक सञ्जाल
            </p>
          </div>
        </div>

        {!isPublic ? (
          <button
            onClick={() => setIsAddRoadModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#ffffff',
              color: '#0f766e',
              border: 'none',
              borderRadius: '12px',
              padding: '10px 18px',
              fontWeight: 800,
              fontSize: '0.88rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
              transition: 'transform 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            <Plus size={18} />
            <span>नयाँ सडक खण्ड दर्ता</span>
          </button>
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.35)',
              padding: '8px 16px',
              borderRadius: '12px',
              fontSize: '0.82rem',
              fontWeight: 700,
              color: '#ffffff',
            }}
          >
            <Compass size={16} />
            <span>सार्वजनिक यातायात तथा सडक सञ्जाल (Citizen MTMP)</span>
          </div>
        )}
      </div>

      {/* ── KPI METRICS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem' }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '1.2rem', border: '1px solid #e2e8f0', borderLeft: '4px solid #0f766e' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>कुल सडक सञ्जाल लम्बाइ</div>
          <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#0f766e', marginTop: '4px' }}>{totalKm.toFixed(1)} कि.मी.</div>
          <div style={{ fontSize: '0.75rem', color: '#0f766e', marginTop: '2px', fontWeight: 600 }}>
            {roads.length} वटा प्रमुख तथा शाखा सडक खण्डहरू
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '1.2rem', border: '1px solid #e2e8f0', borderLeft: '4px solid #0284c7' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>पक्की (कालोपत्रे/ढलान) प्रतिशत</div>
          <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#0369a1', marginTop: '4px' }}>{pavedPct}%</div>
          <div style={{ fontSize: '0.75rem', color: '#0284c7', marginTop: '2px', fontWeight: 600 }}>
            कुल {pavedKm.toFixed(1)} कि.मी. बाह्रै महिना चालु
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '1.2rem', border: '1px solid #e2e8f0', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>पुल तथा मुख्य कल्भर्ट</div>
          <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#d97706', marginTop: '4px' }}>{totalBridges} वटा</div>
          <div style={{ fontSize: '0.75rem', color: '#f59e0b', marginTop: '2px', fontWeight: 600 }}>
            मोटरेबल र झोलुङ्गे पुल सञ्जाल
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '1.2rem', border: '1px solid #e2e8f0', borderLeft: '4px solid #ef4444' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>मर्मत प्राथमिकतामा परेका</div>
          <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#dc2626', marginTop: '4px' }}>{maintenanceNeededCount} खण्ड</div>
          <div style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '2px', fontWeight: 600 }}>
            सडक मर्मतसम्भार योजना (RMP) अन्तर्गत
          </div>
        </div>
      </div>

      {/* ── TABS NAVIGATION ── */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #e2e8f0', paddingBottom: '2px' }}>
        {[
          { key: 'inventory', label: 'सडक सञ्जाल इन्भेन्टरी (MTMP)', icon: <Layers size={16} /> },
          { key: 'bridges', label: 'पुल तथा कल्भर्ट अभिलेख', icon: <Compass size={16} /> },
          { key: 'transit', label: 'सार्वजनिक यातायात तथा भाडादर', icon: <Bus size={16} /> },
          { key: 'maintenance', label: 'सडक मर्मत कोष तथा प्राथमिकता', icon: <Wrench size={16} /> },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key as any)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 18px',
              borderRadius: '10px 10px 0 0',
              border: 'none',
              backgroundColor: activeTab === t.key ? '#ffffff' : 'transparent',
              color: activeTab === t.key ? '#0f766e' : '#64748b',
              fontWeight: 800,
              fontSize: '0.88rem',
              cursor: 'pointer',
              borderBottom: activeTab === t.key ? '3px solid #0f766e' : '3px solid transparent',
              transition: 'all 0.15s ease',
            }}
          >
            {t.icon}
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* ── TAB 1: INVENTORY TABLE ── */}
      {activeTab === 'inventory' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', flex: 1 }}>
              <div style={{ position: 'relative', minWidth: '240px' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="text"
                  placeholder="सडक नाम, कोड, सुरु बिन्दु..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>

              <select
                value={selectedSurface}
                onChange={(e) => setSelectedSurface(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 600 }}
              >
                <option value="all">सबै सडक प्रकार</option>
                <option value="कालोपत्रे">कालोपत्रे</option>
                <option value="आरसीसी ढलान">आरसीसी ढलान</option>
                <option value="ग्राभेल">ग्राभेल</option>
                <option value="कच्ची (माटो)">कच्ची (माटो)</option>
              </select>
            </div>

            <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700 }}>
              देखाउँदै: {filteredRoads.length} / {roads.length} सडक खण्डहरू
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', textAlign: 'left' }}>
                  <th style={{ padding: '10px 12px' }}>कोड</th>
                  <th style={{ padding: '10px 12px' }}>सडकको नाम</th>
                  <th style={{ padding: '10px 12px' }}>सुरु - अन्त्य बिन्दु</th>
                  <th style={{ padding: '10px 12px' }}>लम्बाइ (कि.मी.)</th>
                  <th style={{ padding: '10px 12px' }}>चौडाइ (मि.)</th>
                  <th style={{ padding: '10px 12px' }}>सडक प्रकार (Surface)</th>
                  <th style={{ padding: '10px 12px' }}>वडाहरू</th>
                  <th style={{ padding: '10px 12px' }}>अवस्था</th>
                </tr>
              </thead>
              <tbody>
                {filteredRoads.map((r) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px', fontWeight: 700, color: '#0f766e' }}>{r.roadCode}</td>
                    <td style={{ padding: '12px', fontWeight: 700, color: '#0f172a' }}>{r.roadName}</td>
                    <td style={{ padding: '12px', color: '#475569' }}>
                      {r.startPoint} → {r.endPoint}
                    </td>
                    <td style={{ padding: '12px', fontWeight: 800 }}>{r.lengthKm} कि.मी.</td>
                    <td style={{ padding: '12px' }}>{r.widthM} मि.</td>
                    <td style={{ padding: '12px' }}>
                      <span
                        style={{
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          backgroundColor:
                            r.surfaceType === 'कालोपत्रे'
                              ? '#dcfce7'
                              : r.surfaceType === 'आरसीसी ढलान'
                              ? '#eff6ff'
                              : r.surfaceType === 'ग्राभेल'
                              ? '#fef3c7'
                              : '#fee2e2',
                          color:
                            r.surfaceType === 'कालोपत्रे'
                              ? '#15803d'
                              : r.surfaceType === 'आरसीसी ढलान'
                              ? '#1d4ed8'
                              : r.surfaceType === 'ग्राभेल'
                              ? '#b45309'
                              : '#b91c1c',
                        }}
                      >
                        {r.surfaceType}
                      </span>
                    </td>
                    <td style={{ padding: '12px', color: '#64748b' }}>वडा {r.wardNumbers}</td>
                    <td style={{ padding: '12px' }}>
                      <span
                        style={{
                          padding: '3px 8px',
                          borderRadius: '999px',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          backgroundColor: r.condition === 'राम्रो' ? '#dcfce7' : '#fee2e2',
                          color: r.condition === 'राम्रो' ? '#166534' : '#991b1b',
                        }}
                      >
                        ● {r.condition}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 2: BRIDGES & CULVERTS ── */}
      {activeTab === 'bridges' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          {bridges.map((b) => (
            <div key={b.id} style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>{b.name}</h4>
                <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '6px', backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: 700 }}>
                  वडा नं. {b.ward}
                </span>
              </div>
              <div style={{ fontSize: '0.82rem', color: '#475569', marginBottom: '10px' }}>
                खोला / नदी: <strong>{b.riverName}</strong>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '10px', backgroundColor: '#f8fafc', borderRadius: '10px', fontSize: '0.8rem' }}>
                <div>
                  <span style={{ color: '#64748b' }}>संरचना प्रकार:</span>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{b.bridgeType}</div>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>स्पान लम्बाइ:</span>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{b.spanMeter} मिटर</div>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>चौडाइ:</span>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{b.widthMeter} मिटर</div>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>सुरक्षा अवस्था:</span>
                  <div style={{ fontWeight: 800, color: b.condition === 'सुरक्षित' ? '#15803d' : '#dc2626' }}>
                    {b.condition}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── TAB 3: PUBLIC TRANSIT & PARKING ── */}
      {activeTab === 'transit' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
          <h4 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 800 }}>सार्वजनिक यातायात (बस/जिप) रूट तथा भाडादर तालिका</h4>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                <th style={{ padding: '10px 12px' }}>रूटको नाम</th>
                <th style={{ padding: '10px 12px' }}>सवारी साधन प्रकार</th>
                <th style={{ padding: '10px 12px' }}>सुरुवाती स्टेसन</th>
                <th style={{ padding: '10px 12px' }}>अन्तिम गन्तव्य</th>
                <th style={{ padding: '10px 12px' }}>दूरी</th>
                <th style={{ padding: '10px 12px' }}>तोकिएको भाडा (रू.)</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '12px', fontWeight: 700 }}>काठमाडौँ - थाङपालधाप एक्सप्रेस</td>
                <td style={{ padding: '12px' }}>मिनीबस / बस</td>
                <td style={{ padding: '12px' }}>चाबहिल, काठमाडौँ</td>
                <td style={{ padding: '12px' }}>थाङपालधाप बजार</td>
                <td style={{ padding: '12px' }}>६८ कि.मी.</td>
                <td style={{ padding: '12px', fontWeight: 800, color: '#15803d' }}>रू. ४५०</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '12px', fontWeight: 700 }}>मेलम्ची - मानेखर्क - भोताङ लिंक</td>
                <td style={{ padding: '12px' }}>फोर-ह्वील जिप</td>
                <td style={{ padding: '12px' }}>मेलम्ची पुलबजार</td>
                <td style={{ padding: '12px' }}>भोताङ</td>
                <td style={{ padding: '12px' }}>२८ कि.मी.</td>
                <td style={{ padding: '12px', fontWeight: 800, color: '#15803d' }}>रू. ३००</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* ── TAB 4: MAINTENANCE FUND ── */}
      {activeTab === 'maintenance' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
            <h4 style={{ margin: '0 0 10px', fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>वार्षिक सडक मर्मत कोष (Road Board)</h4>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f766e' }}>रू. ७५,००,०००</div>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '4px 0 12px' }}>
              सडक बोर्ड नेपाल तथा पालिकाको आन्तरिक बजेटबाट सडक नियमित तथा आवधिक मर्मतका लागि विनियोजित।
            </p>
          </div>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
            <h4 style={{ margin: '0 0 10px', fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>वर्षायाम सडक खुलाउने द्रुत कार्यदल</h4>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#2563eb' }}>४ वटा डोजर/एक्साभेटर</div>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '4px 0' }}>
              पहिरो नियन्त्रण तथा अवरुद्ध सडक तत्काल खुलाउन वडा क्षेत्रगत तैनाथ उपकरणहरू।
            </p>
          </div>
        </div>
      )}

      {/* ── ADD ROAD MODAL ── */}
      {isAddRoadModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
        >
          <div style={{ backgroundColor: '#ffffff', borderRadius: '18px', width: '100%', maxWidth: '600px', padding: '1.5rem', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
              नयाँ सडक खण्ड इन्भेन्टरी दर्ता
            </h3>
            <form onSubmit={handleAddRoad} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>सडकको नाम *</label>
                <input
                  type="text"
                  required
                  placeholder="उदा. थाङपालधाप - मानेखर्क चक्रपथ"
                  value={fName}
                  onChange={(e) => setFName(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>सडक कोड (MTMP Code)</label>
                <input
                  type="text"
                  placeholder="P5-MR-05"
                  value={fCode}
                  onChange={(e) => setFCode(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>सडक प्रकार (Surface Type)</label>
                <select
                  value={fSurface}
                  onChange={(e) => setFSurface(e.target.value as any)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                >
                  <option value="कालोपत्रे">कालोपत्रे</option>
                  <option value="आरसीसी ढलान">आरसीसी ढलान</option>
                  <option value="ग्राभेल">ग्राभेल</option>
                  <option value="कच्ची (माटो)">कच्ची (माटो)</option>
                  <option value="नयाँ ट्रयाक">नयाँ ट्रयाक</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>सुरु बिन्दु</label>
                <input type="text" placeholder="थाङपाल बजार" value={fStart} onChange={(e) => setFStart(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>अन्त्य बिन्दु</label>
                <input type="text" placeholder="मानेखर्क" value={fEnd} onChange={(e) => setFEnd(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>लम्बाइ (कि.मी.)</label>
                <input type="number" step="0.1" value={fLength} onChange={(e) => setFLength(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>समेटिएका वडाहरू</label>
                <input type="text" placeholder="उदा. १, २, ३" value={fWards} onChange={(e) => setFWards(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>

              <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsAddRoadModalOpen(false)}
                  style={{ padding: '9px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontWeight: 700, cursor: 'pointer' }}
                >
                  रद्द
                </button>
                <button
                  type="submit"
                  style={{ padding: '9px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#0f766e', color: '#ffffff', fontWeight: 800, cursor: 'pointer' }}
                >
                  सडक खण्ड सुरक्षित गर्नुहोस्
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
