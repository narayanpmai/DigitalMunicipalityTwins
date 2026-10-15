import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sectoralApi } from '../../api/sectoral';
import {
  Sprout,
  Milk,
  Coins,
  Warehouse,
  Search,
  Bot,
  TrendingUp,
  Calculator,
  Plus,
  Download,
  FileSpreadsheet,
  Volume2,
  Square,
  Loader2,
  Users,
  Store,
  Pill,
  ShieldAlert,
  Map,
  UserCheck,
  CheckCircle2,
  Sparkles,
  Layers,
  ArrowRight,
  Filter,
  Activity,
  Radio
} from 'lucide-react';
import { agricultureApi } from '../../api/agriculture';
import { CropModal } from './components/CropModal';
import { AgricultureExcelImportModal } from './components/AgricultureExcelImportModal';
import { FarmerRegistryTab } from './components/FarmerRegistryTab';
import { MarketPricesTab } from './components/MarketPricesTab';
import { VetMedicineTab } from './components/VetMedicineTab';
import { AgriAdvisoryTab } from './components/AgriAdvisoryTab';
import { FertilizerQuotaTab } from './components/FertilizerQuotaTab';
import { SubsidyManagementTab } from './components/SubsidyManagementTab';
import './agriculture-pro.css';

interface ForecastResult {
  crop_name: string;
  cultivated_area_hectares: number;
  predicted_yield_ton_per_ha: number;
  total_estimated_production_metric_tons: number;
  projected_revenue_npr: number;
}

export const AgriculturePage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<
    'crops' | 'livestock' | 'farmers' | 'subsidies' | 'fertilizer' | 'market' | 'vet' | 'advisories' | 'ai-predictor'
  >('crops');
  const [selectedWard, setSelectedWard] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);

  // Live Farmers & Agriculture KPIs
  const { data: farmerSummary } = useQuery({
    queryKey: ['farmer-summary-kpis'],
    queryFn: () => agricultureApi.getFarmerSummary(),
  });

  // Fertilizer Summary KPIs
  const { data: fertSummary } = useQuery({
    queryKey: ['fertilizer-summary-kpis'],
    queryFn: () => agricultureApi.getFertilizerSummary(),
  });

  // Audio and TTS States
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  // Stop Audio
  const stopAudio = () => {
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const handlePlayAudio = async () => {
    if (isPlaying) {
      stopAudio();
      return;
    }

    try {
      setIsGeneratingAudio(true);
      const totalCrops = crops.length;
      const totalLivestock = livestock.length;
      
      const summaryText = `नमस्कार! पाँचपोखरी थाङपाल कृषि, पशुपन्छी तथा खाद्य सुरक्षा कमाण्ड सेन्टरमा स्वागत छ। हाल पालिकामा ${totalCrops} प्रकारका मुख्य बाली र ${totalLivestock} पशुपालन सम्बन्धी रेकर्डहरू दर्ता भएका छन्। एआई प्रविधिको प्रयोगबाट बाली उत्पादन अनुमान गर्न सकिन्छ। थप जानकारीका लागि स्थानीय कृषि शाखामा सम्पर्क गर्नुहोस्। धन्यवाद!`;

      const blob = await agricultureApi.generateSpeech(summaryText);
      const url = URL.createObjectURL(blob);
      const newAudio = new Audio(url);
      
      newAudio.onended = () => {
        setIsPlaying(false);
      };
      
      setAudio(newAudio);
      newAudio.play();
      setIsPlaying(true);
    } catch (error) {
      console.error('TTS Error:', error);
      alert('अडियो बनाउन समस्या भयो, कृपया पछि प्रयास गर्नुहोस्।');
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  // AI Predictor State
  const [selectedCrop, setSelectedCrop] = useState<string>('आलु');
  const [areaHectares, setAreaHectares] = useState<number>(5.0);
  const [rainfallFactor, setRainfallFactor] = useState<number>(1.0);
  const [fertilizerApplied, setFertilizerApplied] = useState<boolean>(true);

  const { data: crops = [] } = useQuery({
    queryKey: ['agriculture-crops', selectedWard],
    queryFn: () => sectoralApi.getAgricultureRecords(selectedWard),
  });

  const { data: livestock = [] } = useQuery({
    queryKey: ['livestock-data'],
    queryFn: () => sectoralApi.getLivestockRecords(),
  });

  const createCropMutation = useMutation({
    mutationFn: (data: any) => sectoralApi.createAgricultureRecord(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agriculture-crops'] });
      setIsCropModalOpen(false);
    },
  });

  // FastAPI Prediction Mutation
  const forecastMutation = useMutation<
    ForecastResult,
    Error,
    {
      crop_name: string;
      area_hectares: number;
      rainfall_factor: number;
      fertilizer_applied: boolean;
    }
  >({
    mutationFn: (params) => sectoralApi.forecastCropYield(params) as Promise<ForecastResult>,
  });

  const handleExportCrops = () => {
    const headers = ['बालीको नाम,वडा नं,वर्ग,खेती क्षेत्रफल (हेक्टर),वार्षिक उत्पादन (मे.टन),उत्पादकत्व (टन/हेक्टर),कृषक परिवार'];
    const rows = filteredCrops.map((c) =>
      `"${c.cropName}","${c.wardNo}","${c.category}","${c.cultivatedAreaHectares}","${c.annualProductionMetricTons}","${c.yieldPerHectare}","${c.farmerHouseholds}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Panchpokhari_Agriculture_W${selectedWard || 'All'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePredict = (e: React.FormEvent) => {
    e.preventDefault();
    forecastMutation.mutate({
      crop_name: selectedCrop,
      area_hectares: areaHectares,
      rainfall_factor: rainfallFactor,
      fertilizer_applied: fertilizerApplied,
    });
  };

  const filteredCrops = crops.filter((c) => {
    if (!searchTerm) return true;
    return c.cropName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const filteredLivestock = livestock.filter((l) => {
    if (!searchTerm) return true;
    return l.animalNameNepali.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="gov-content-wrapper" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.35rem' }}>
      {/* COMMAND CENTER HERO BANNER */}
      <div className="agri-hero-banner">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', position: 'relative', zIndex: 2 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.55rem', flexWrap: 'wrap' }}>
              <span className="agri-telemetry-badge">
                <span className="agri-pulse-dot"></span>
                एकीकृत कृषि कमाण्ड प्रणाली
              </span>
              <span style={{ fontSize: '0.78rem', color: '#a7f3d0', fontWeight: 600 }}>
                नेपाल सरकार • पाँचपोखरी थाङपाल गाउँ कार्यपालिका
              </span>
              <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.12)', color: '#ffffff' }}>
                खाद्य सुरक्षा तथा कृषि आधुनिकीकरण
              </span>
            </div>

            <h1 style={{ fontSize: '1.9rem', fontWeight: 900, margin: 0, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#ffffff' }}>
              <Sprout size={36} className="text-emerald-300" />
              कृषि, पशुपन्छी तथा खाद्य सुरक्षा विकास पोर्टल
            </h1>
            <p style={{ fontSize: '0.92rem', color: '#d1fae5', margin: '0.5rem 0 0', maxWidth: '840px', lineHeight: 1.5 }}>
              पाँचपोखरी थाङपालका मुख्य बालीहरू (हिमाली आलु, किवी, मकै), पशुपालन (याक/चौँरी, रेन्बो ट्राउट), अनुदानित मलखाद कोटा, दैनिक बजार भाउ र AI उत्पादन प्रक्षेपण प्रणाली
            </p>
          </div>

          {/* Quick Action Ribbon inside Hero */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              type="button"
              onClick={handlePlayAudio}
              disabled={isGeneratingAudio}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.55rem 1rem',
                borderRadius: '9px',
                backgroundColor: isPlaying ? '#ef4444' : 'rgba(255, 255, 255, 0.95)',
                color: isPlaying ? '#ffffff' : '#065f46',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.84rem',
                cursor: isGeneratingAudio ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}
            >
              {isGeneratingAudio ? (
                <Loader2 size={16} className="dt-spin" />
              ) : isPlaying ? (
                <Square size={16} fill="currentColor" />
              ) : (
                <Volume2 size={16} className="text-purple-600" />
              )}
              {isGeneratingAudio ? 'अडियो बन्दैछ...' : isPlaying ? 'रोक्नुहोस्' : 'अडियो बुलेटिन'}
            </button>

            <a
              href="/gis-map?filter=agriculture"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.55rem 1rem',
                borderRadius: '9px',
                backgroundColor: '#10b981',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.84rem',
                textDecoration: 'none',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)',
              }}
            >
              <Map size={16} /> जीआईएस कृषि नक्सा
            </a>

            <button
              type="button"
              onClick={() => setIsExcelModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.55rem 1rem',
                borderRadius: '9px',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                backdropFilter: 'blur(8px)',
                fontWeight: 700,
                fontSize: '0.84rem',
                cursor: 'pointer',
              }}
            >
              <FileSpreadsheet size={16} /> एक्सेल आयात
            </button>

            <button
              type="button"
              onClick={() => setIsCropModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.55rem 1rem',
                borderRadius: '9px',
                backgroundColor: '#f59e0b',
                color: '#ffffff',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.84rem',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)',
              }}
            >
              <Plus size={16} /> नयाँ बाली दर्ता
            </button>
          </div>
        </div>
      </div>

      {/* GLOWING KPI CARDS ROW */}
      <div className="agri-kpi-grid">
        <div className="agri-kpi-glow-card" style={{ '--kpi-accent': '#10b981' } as any}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b' }}>कुल कृषियोग्य जमिन</div>
              <div className="agri-kpi-value-text" style={{ marginTop: '4px' }}>
                {farmerSummary?.totalLandRopani || 81.3} <span style={{ fontSize: '1rem', fontWeight: 600 }}>रोपनी</span>
              </div>
            </div>
            <div className="agri-kpi-icon-wrap" style={{ '--icon-bg': '#ecfdf5', '--icon-color': '#059669', '--icon-shadow': 'rgba(5, 150, 105, 0.2)' } as any}>
              <Sprout size={24} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '0.85rem', fontSize: '0.78rem' }}>
            <span className="agri-badge agri-badge-success">{crops.length} मुख्य बाली</span>
            <span style={{ color: '#64748b' }}>८ वटै वडामा</span>
          </div>
        </div>

        <div className="agri-kpi-glow-card" style={{ '--kpi-accent': '#2563eb' } as any}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b' }}>पशुपालन तथा दैनिक दुग्ध</div>
              <div className="agri-kpi-value-text" style={{ marginTop: '4px', color: '#1e40af' }}>
                {livestock.length} <span style={{ fontSize: '1rem', fontWeight: 600 }}>प्रजाति</span>
              </div>
            </div>
            <div className="agri-kpi-icon-wrap" style={{ '--icon-bg': '#eff6ff', '--icon-color': '#2563eb', '--icon-shadow': 'rgba(37, 99, 235, 0.2)' } as any}>
              <Milk size={24} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '0.85rem', fontSize: '0.78rem' }}>
            <span className="agri-badge agri-badge-info">दैनिक ३,०५०+ लिटर</span>
            <span style={{ color: '#64748b' }}>चौँरी, गाई र भैंसी</span>
          </div>
        </div>

        <div className="agri-kpi-glow-card" style={{ '--kpi-accent': '#0d9488' } as any}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b' }}>अनुदानित मलखाद कोटा</div>
              <div className="agri-kpi-value-text" style={{ marginTop: '4px', color: '#0d9488' }}>
                {fertSummary?.totalDistributedMetricTons || 0.85} <span style={{ fontSize: '1rem', fontWeight: 600 }}>मे.टन</span>
              </div>
            </div>
            <div className="agri-kpi-icon-wrap" style={{ '--icon-bg': '#f0fdfa', '--icon-color': '#0d9488', '--icon-shadow': 'rgba(13, 148, 136, 0.2)' } as any}>
              <Warehouse size={24} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '0.85rem', fontSize: '0.78rem' }}>
            <span className="agri-badge agri-badge-success">८ सहकारी डिपो</span>
            <span style={{ color: '#64748b' }}>युरिया, डीएपी, पोटास</span>
          </div>
        </div>

        <div className="agri-kpi-glow-card" style={{ '--kpi-accent': '#c2410c' } as any}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b' }}>वितरित कृषि तथा मल अनुदान</div>
              <div className="agri-kpi-value-text" style={{ marginTop: '4px', color: '#c2410c' }}>
                रु. {(((farmerSummary?.totalSubsidiesDisbursedNPR || 174000) + (fertSummary?.totalSubsidyDisbursedNpr || 24150))).toLocaleString()}
              </div>
            </div>
            <div className="agri-kpi-icon-wrap" style={{ '--icon-bg': '#fff7ed', '--icon-color': '#c2410c', '--icon-shadow': 'rgba(194, 65, 12, 0.2)' } as any}>
              <Coins size={24} />
            </div>
          </div>
          <div style={{ marginTop: '0.85rem', fontSize: '0.75rem', color: '#64748b' }}>
            यन्त्र: रु. {(farmerSummary?.totalSubsidiesDisbursedNPR || 174000).toLocaleString()} + मल: रु. {(fertSummary?.totalSubsidyDisbursedNpr || 24150).toLocaleString()}
          </div>
        </div>
      </div>

      {/* UNIFIED 8-SUBSYSTEM TAB SWITCHER */}
      <div className="agri-glass-card" style={{ padding: '0.65rem 0.85rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div className="agri-tab-ribbon" style={{ flex: 1, minWidth: '320px' }}>
            {[
              { id: 'crops', label: 'बाली तथा फलफूल', badge: crops.length, icon: <Sprout size={16} /> },
              { id: 'livestock', label: 'पशुपालन', badge: livestock.length, icon: <Milk size={16} /> },
              { id: 'farmers', label: 'कृषक दर्ता तथा माटो कार्ड', icon: <Users size={16} /> },
              { id: 'subsidies', label: 'अनुदान तथा राहत', icon: <Coins size={16} /> },
              { id: 'fertilizer', label: 'मलखाद कोटा', badge: `${fertSummary?.totalDistributedMetricTons || 0.85} टन`, icon: <Warehouse size={16} /> },
              { id: 'market', label: 'दैनिक बजार भाउ', badge: 'लाइभ', icon: <Store size={16} /> },
              { id: 'vet', label: 'भेटेरिनरी औषधि/खोप', icon: <Pill size={16} /> },
              { id: 'advisories', label: 'कृषि-मौसम सल्लाह', icon: <ShieldAlert size={16} /> },
              { id: 'ai-predictor', label: 'AI उत्पादन क्यालकुलेटर', icon: <Bot size={16} />, highlight: true },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    if (tab.id === 'ai-predictor' && !forecastMutation.data) {
                      forecastMutation.mutate({
                        crop_name: selectedCrop,
                        area_hectares: areaHectares,
                        rainfall_factor: rainfallFactor,
                        fertilizer_applied: fertilizerApplied,
                      });
                    }
                  }}
                  className={`agri-tab-pill ${isActive ? (tab.highlight ? 'active' : 'active emerald') : ''}`}
                  style={tab.highlight && isActive ? { background: '#10b981', color: '#ffffff' } : {}}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && (
                    <span className="agri-tab-badge">{tab.badge}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Search & Ward Select for Data Tabs */}
          {(activeTab === 'crops' || activeTab === 'livestock') && (
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

              {activeTab === 'crops' && (
                <select
                  value={selectedWard}
                  onChange={(e) => setSelectedWard(Number(e.target.value))}
                  style={{
                    padding: '0.45rem 0.75rem',
                    borderRadius: '8px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    outline: 'none',
                  }}
                >
                  <option value={0}>सबै वडाहरू (All Wards)</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
                    <option key={w} value={w}>वडा नं. {w}</option>
                  ))}
                </select>
              )}
            </div>
          )}
        </div>
      </div>

      {/* TAB 1: CROPS */}
      {activeTab === 'crops' && (
        <div className="agri-glass-card" style={{ padding: 0 }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="agri-pro-table">
              <thead>
                <tr>
                  <th>बालीको नाम</th>
                  <th>वडा नं.</th>
                  <th>वर्ग (Category)</th>
                  <th>खेती क्षेत्रफल</th>
                  <th>वार्षिक उत्पादन</th>
                  <th>उत्पादकत्व</th>
                  <th>कृषक परिवार</th>
                  <th style={{ textAlign: 'right' }}>अनुदान सहयोग</th>
                </tr>
              </thead>
              <tbody>
                {filteredCrops.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '3.5rem 1rem', textAlign: 'center', color: '#64748b' }}>
                      कुनै बाली रेकर्ड फेला परेन।
                    </td>
                  </tr>
                ) : (
                  filteredCrops.map((c) => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 800, color: '#0f172a' }}>{c.cropName}</td>
                      <td>
                        <span style={{ padding: '2px 8px', borderRadius: '4px', backgroundColor: '#f1f5f9', fontSize: '0.75rem', fontWeight: 700 }}>
                          वडा {c.wardNo}
                        </span>
                      </td>
                      <td>
                        <span className="agri-badge agri-badge-info">
                          {c.category === 'cash_crop' ? 'नगदे बाली' : c.category === 'fruit' ? 'फलफूल' : c.category === 'spices' ? 'मसला' : 'अन्नबाली'}
                        </span>
                      </td>
                      <td>{c.cultivatedAreaHectares} हेक्टर</td>
                      <td style={{ fontWeight: 800, color: '#047857' }}>
                        {c.annualProductionMetricTons} मे.टन
                      </td>
                      <td>{c.yieldPerHectare} टन/हेक्टर</td>
                      <td>{c.farmerHouseholds} घरधुरी</td>
                      <td style={{ textAlign: 'right' }}>
                        {c.subsidiesProvidedNpr ? (
                          <span style={{ fontWeight: 800, color: '#b45309' }}>
                            रु. {c.subsidiesProvidedNpr.toLocaleString()}
                          </span>
                        ) : (
                          <span style={{ color: '#94a3b8' }}>-</span>
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

      {/* TAB 2: LIVESTOCK */}
      {activeTab === 'livestock' && (
        <div className="agri-grid-auto">
          {filteredLivestock.map((l) => (
            <div key={l.id} className="agri-glass-card" style={{ padding: '1.35rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                  {l.animalNameNepali}
                </h3>
                <span className="agri-badge agri-badge-success">वडा {l.wardNo}</span>
              </div>
              <div style={{ fontSize: '0.88rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <div>कुल संख्या: <strong style={{ color: '#0f172a', fontSize: '1.1rem' }}>{l.count.toLocaleString()} वटा</strong></div>
                <div>सञ्चालित व्यावसायिक फार्म: <strong>{l.farmsCount} वटा</strong></div>
              </div>
              {l.milkProductionLitersPerDay && (
                <div style={{ padding: '0.65rem 0.85rem', borderRadius: '10px', backgroundColor: '#eff6ff', color: '#1d4ed8', fontSize: '0.82rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  🥛 दैनिक दुध: {l.milkProductionLitersPerDay.toLocaleString()} लिटर
                </div>
              )}
              {l.meatProductionKg && (
                <div style={{ padding: '0.65rem 0.85rem', borderRadius: '10px', backgroundColor: '#fef2f2', color: '#991b1b', fontSize: '0.82rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  🐟 वार्षिक माछा/मासु: {l.meatProductionKg.toLocaleString()} के.जी.
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: AI YIELD PREDICTOR */}
      {activeTab === 'ai-predictor' && (
        <div className="agri-responsive-split-layout">
          <div className="agri-glass-card" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calculator size={22} className="text-emerald-600" />
              <span>बाली तथा क्षेत्रफल प्यारामिटर</span>
            </h2>

            <form onSubmit={handlePredict} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, marginBottom: '0.35rem', color: '#0f172a' }}>
                  बालीको नाम छान्नुहोस्:
                </label>
                <select
                  value={selectedCrop}
                  onChange={(e) => setSelectedCrop(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.9rem', fontWeight: 700 }}
                >
                  <option value="आलु">हिमाली रातो आलु (Organic Potato)</option>
                  <option value="किबी">किबी फल (Kiwi Fruit)</option>
                  <option value="स्याउ">स्याउ (Apple)</option>
                  <option value="मकै">मकै तथा कोदो (Maize & Millet)</option>
                  <option value="अलैँची">अग्र्यानिक अलैँची (Cardamom)</option>
                </select>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 800, marginBottom: '0.35rem' }}>
                  <span>खेती क्षेत्रफल:</span>
                  <span style={{ color: '#065f46' }}>{areaHectares} हेक्टर (≈ {(areaHectares * 19.65).toFixed(1)} रोपनी)</span>
                </div>
                <input
                  type="number"
                  min="0.5"
                  max="100"
                  step="0.5"
                  value={areaHectares}
                  onChange={(e) => setAreaHectares(Number(e.target.value))}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, marginBottom: '0.35rem', color: '#0f172a' }}>
                  वर्षा / मौसमी अनुकूलता फ्याक्टर:
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {[
                    { label: 'कम वर्षा (0.85)', val: 0.85 },
                    { label: 'सामान्य (1.0)', val: 1.0 },
                    { label: 'अनुकूल वर्षा (1.15)', val: 1.15 },
                  ].map((item) => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => setRainfallFactor(item.val)}
                      style={{
                        flex: 1,
                        padding: '0.55rem',
                        borderRadius: '8px',
                        border: '1.5px solid',
                        borderColor: rainfallFactor === item.val ? '#0284c7' : '#cbd5e1',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        backgroundColor: rainfallFactor === item.val ? '#e0f2fe' : '#ffffff',
                        color: rainfallFactor === item.val ? '#0284c7' : '#475569',
                        cursor: 'pointer',
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.4rem 0' }}>
                <input
                  type="checkbox"
                  id="fert"
                  checked={fertilizerApplied}
                  onChange={(e) => setFertilizerApplied(e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor="fert" style={{ fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', color: '#0f172a' }}>
                  उन्नत प्राङ्गारिक मल तथा सूक्ष्म पोषक तत्व प्रयोग गरिनेछ (+१५% लाभ)
                </label>
              </div>

              <button
                type="submit"
                disabled={forecastMutation.isPending}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.8rem',
                  borderRadius: '10px',
                  backgroundColor: '#10b981',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 900,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
                }}
              >
                <TrendingUp size={18} />
                <span>{forecastMutation.isPending ? 'गणना हुँदैछ...' : 'FastAPI AI प्रक्षेपण चलाउनुहोस्'}</span>
              </button>
            </form>
          </div>

          {/* Results Box */}
          <div className="agri-glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.65rem' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#047857', margin: 0, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <Bot size={24} />
                  <span>AI प्रक्षेपण प्रतिवेदन (FastAPI ML)</span>
                </h2>
                <span className="agri-badge agri-badge-success">Live ML Microservice</span>
              </div>

              {forecastMutation.data ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="agri-grid-2">
                    <div style={{ padding: '0.85rem', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>बाली / हेक्टर</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a', marginTop: '2px' }}>
                        {forecastMutation.data.crop_name} ({forecastMutation.data.cultivated_area_hectares} ha)
                      </div>
                    </div>

                    <div style={{ padding: '0.85rem', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>अनुमानित उत्पादकत्व</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0284c7', marginTop: '2px' }}>
                        {forecastMutation.data.predicted_yield_ton_per_ha} टन/हेक्टर
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: '1.25rem', borderRadius: '12px', backgroundColor: '#ecfdf5', border: '1.5px solid #a7f3d0', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.85rem', color: '#065f46', fontWeight: 800 }}>कुल सम्भावित उत्पादन</div>
                    <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#047857', margin: '0.25rem 0' }}>
                      {forecastMutation.data.total_estimated_production_metric_tons} मे.टन
                    </div>
                    <div style={{ fontSize: '0.95rem', color: '#059669' }}>
                      अनुमानित आम्दानी: <strong>रु. {forecastMutation.data.projected_revenue_npr.toLocaleString()}</strong>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.82rem', color: '#334155', padding: '0.9rem', borderRadius: '10px', backgroundColor: '#f1f5f9', borderLeft: '4px solid #065f46', lineHeight: 1.6 }}>
                    <strong>💡 कृषि प्राविधिक सल्लाह:</strong> उच्च पहाडी भू-भागमा आलु र फलफूलको उत्पादकत्व बढाउन थोपा सिँचाइ र मल्चिङ प्रविधि प्रयोग गर्दा थप १०-२०% उत्पादन वृद्धि गर्न सकिन्छ।
                  </div>
                </div>
              ) : (
                <div style={{ padding: '4rem 1rem', textAlign: 'center', color: '#64748b' }}>
                  <Calculator size={40} style={{ margin: '0 auto 0.6rem', opacity: 0.35 }} />
                  बायाँ फारम भरेर <strong>FastAPI AI प्रक्षेपण चलाउनुहोस्</strong> बटन थिच्नुहोस्।
                </div>
              )}
            </div>

            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem', fontSize: '0.75rem', color: '#94a3b8' }}>
              Microservice: <code>http://localhost:8000/api/v1/analytics/crop-yield-forecast</code>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Digital Farmer Registry & Soil Health */}
      {activeTab === 'farmers' && <FarmerRegistryTab />}

      {/* TAB 4.1: Subsidy Management */}
      {activeTab === 'subsidies' && <SubsidyManagementTab />}

      {/* TAB 4.5: Subsidized Fertilizer Quota & Depots */}
      {activeTab === 'fertilizer' && <FertilizerQuotaTab />}

      {/* TAB 5: Daily Agri Market Prices */}
      {activeTab === 'market' && <MarketPricesTab />}

      {/* TAB 6: Vet Medicine & Free Distribution */}
      {activeTab === 'vet' && <VetMedicineTab />}

      {/* TAB 7: Agro-Met Advisories & Pest Alerts */}
      {activeTab === 'advisories' && <AgriAdvisoryTab />}

      {/* Crop Registration Modal */}
      <CropModal
        isOpen={isCropModalOpen}
        onClose={() => setIsCropModalOpen(false)}
        onSave={async (cropData) => {
          await createCropMutation.mutateAsync(cropData);
        }}
      />

      {/* Agriculture Excel Bulk Import Modal */}
      <AgricultureExcelImportModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['agriculture-crops'] });
        }}
      />
    </div>
  );
};

export default AgriculturePage;
