import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  agricultureApi,
  FertilizerDistributionRecord,
  FertilizerStockItem,
} from '../../../api/agriculture';
import {
  Warehouse,
  Coins,
  Users,
  Sprout,
  Calculator,
  Search,
  PlusCircle,
  FileBadge,
  Printer,
  X,
  Phone,
  CheckCircle2,
  TrendingDown,
  Building2,
  Calendar,
  AlertCircle,
  Sliders,
  QrCode,
  ShieldCheck,
} from 'lucide-react';

export const FertilizerQuotaTab: React.FC = () => {
  const queryClient = useQueryClient();

  // Filters & State
  const [selectedWard, setSelectedWard] = useState<number>(0);
  const [selectedFertType, setSelectedFertType] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeSubTab, setActiveSubTab] = useState<'depots' | 'calculator' | 'ledger'>('depots');

  // Modals
  const [isDisburseModalOpen, setIsDisburseModalOpen] = useState<boolean>(false);
  const [selectedVoucher, setSelectedVoucher] = useState<FertilizerDistributionRecord | null>(null);

  // Calculator State
  const [calcCrop, setCalcCrop] = useState<string>('आलु');
  const [calcRopani, setCalcRopani] = useState<number>(4.0);
  const [calcPh, setCalcPh] = useState<number>(5.8);

  // New Distribution Form State
  const [formData, setFormData] = useState({
    farmerId: 'KMP-2081-001',
    depotName: 'भोताङ साना किसान कृषि सहकारी डिपो',
    fertilizerType: 'DAP',
    quantityKg: 50,
    cropSeason: 'हिउँदे आलु तथा किबी सिजन (२०८१/०८२)',
    remarks: '',
    distributionDateBs: new Date().toISOString().slice(0, 10),
  });

  // Queries
  const { data: summary } = useQuery({
    queryKey: ['fertilizer-summary'],
    queryFn: () => agricultureApi.getFertilizerSummary(),
  });

  const { data: stocks = [] } = useQuery({
    queryKey: ['fertilizer-stocks', selectedWard],
    queryFn: () => agricultureApi.getFertilizerStocks(selectedWard > 0 ? selectedWard : undefined),
  });

  const { data: distributions = [], isLoading: loadingDists } = useQuery({
    queryKey: ['fertilizer-distributions', selectedWard, selectedFertType, searchTerm],
    queryFn: () =>
      agricultureApi.getFertilizerDistributions({
        ward: selectedWard > 0 ? selectedWard : undefined,
        fertilizerType: selectedFertType || undefined,
        search: searchTerm || undefined,
      }),
  });

  const { data: farmers = [] } = useQuery({
    queryKey: ['farmers-list'],
    queryFn: () => agricultureApi.getFarmers(),
  });

  const { data: calcResult } = useQuery({
    queryKey: ['fertilizer-quota-calc', calcCrop, calcRopani, calcPh],
    queryFn: () =>
      agricultureApi.calculateFertilizerQuota({
        cropName: calcCrop,
        landAreaRopani: calcRopani,
        soilPh: calcPh,
      }),
  });

  // Disburse Mutation
  const disburseMutation = useMutation({
    mutationFn: (data: typeof formData) => agricultureApi.disburseFertilizerQuota(data),
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: ['fertilizer-distributions'] });
      queryClient.invalidateQueries({ queryKey: ['fertilizer-stocks'] });
      queryClient.invalidateQueries({ queryKey: ['fertilizer-summary'] });
      queryClient.invalidateQueries({ queryKey: ['farmers-list'] });
      setIsDisburseModalOpen(false);
      setSelectedVoucher(saved);
      alert('मलखाद कोटा सफलतापूर्वक वितरण गरियो र डिजिटल रसिद तयार भयो!');
    },
    onError: (err: any) => {
      alert('त्रुटि: ' + (err.response?.data?.message || err.message));
    },
  });

  // Filtered Distributions
  const filteredDistributions = distributions.filter((d) => {
    if (selectedWard > 0 && d.wardNumber !== selectedWard) return false;
    if (selectedFertType && d.fertilizerType !== selectedFertType) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        d.farmerName.toLowerCase().includes(q) ||
        d.farmerId.toLowerCase().includes(q) ||
        d.receiptNo.toLowerCase().includes(q) ||
        d.depotName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Group Stocks by Depot
  const depotGroups = stocks.reduce((acc, item) => {
    if (!acc[item.depotName]) {
      acc[item.depotName] = {
        depotName: item.depotName,
        wardNumber: item.wardNumber,
        contactPerson: item.contactPerson,
        contactPhone: item.contactPhone,
        items: [],
      };
    }
    acc[item.depotName].items.push(item);
    return acc;
  }, {} as Record<string, { depotName: string; wardNumber: number; contactPerson?: string; contactPhone?: string; items: FertilizerStockItem[] }>);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Banner & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Warehouse className="dt-text-primary" size={24} />
            <span>अनुदानित मलखाद कोटा तथा सहकारी डिपो व्यवस्थापन</span>
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>
            नेपाल सरकार तथा पालिका अनुदानित रासायनिक (युरिया, डीएपी, पोटास) र जैविक मलको वैज्ञानिक कोटा वितरण, डिपो मौज्दात र डिजिटल कुपन प्रणाली
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setIsDisburseModalOpen(true)}
            className="dt-btn dt-btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem', fontWeight: 700 }}
          >
            <PlusCircle size={16} /> नयाँ मल कोटा वितरण दर्ता
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="agri-grid-auto">
        <div className="dt-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid #10b981' }}>
          <div style={{ padding: '0.75rem', borderRadius: '10px', backgroundColor: '#dcfce7', color: '#16a34a' }}>
            <Sprout size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>कुल वितरित अनुदानित मल</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#065f46' }}>
              {summary?.totalDistributedMetricTons || 0.85} मे.टन ({summary?.totalDistributedKg || 850} केजी)
            </div>
            <div style={{ fontSize: '0.72rem', color: '#10b981' }}>चालु आ.व. २०८१/०८२</div>
          </div>
        </div>

        <div className="dt-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ padding: '0.75rem', borderRadius: '10px', backgroundColor: '#fef3c7', color: '#b45309' }}>
            <Coins size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>कृषकलाई प्रत्यक्ष अनुदान बचत</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#b45309' }}>
              रु. {(summary?.totalSubsidyDisbursedNpr || 24150).toLocaleString()}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#d97706' }}>बजार मूल्यको ५२% सम्म छुट</div>
          </div>
        </div>

        <div className="dt-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid #0284c7' }}>
          <div style={{ padding: '0.75rem', borderRadius: '10px', backgroundColor: '#e0f2fe', color: '#0284c7' }}>
            <Building2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>सक्रिय सहकारी डिपोहरू</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0369a1' }}>
              {summary?.activeDepotsCount || 4} वटा डिपो
            </div>
            <div style={{ fontSize: '0.72rem', color: '#0284c7' }}>वडा १, ३, ४ र ६ मा अवस्थित</div>
          </div>
        </div>

        <div className="dt-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ padding: '0.75rem', borderRadius: '10px', backgroundColor: '#ede9fe', color: '#7c3aed' }}>
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>लाभान्वित कृषक परिवार</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#6d28d9' }}>
              {summary?.beneficiaryFarmersCount || 5} जना कृषक
            </div>
            <div style={{ fontSize: '0.72rem', color: '#7c3aed' }}>१००% डिजिटल रसिद प्रमाणित</div>
          </div>
        </div>
      </div>

      {/* Sub-Tabs Switcher */}
      <div className="dt-card" style={{ padding: '0.6rem 1rem', display: 'flex', flexWrap: 'wrap', gap: '0.6rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveSubTab('depots')}
            className={`dt-btn ${activeSubTab === 'depots' ? 'dt-btn-primary' : 'dt-btn-outline'}`}
            style={{ fontSize: '0.82rem', padding: '0.45rem 0.9rem' }}
          >
            <Warehouse size={15} />
            <span>डिपो मौज्दात इन्भेन्टरी (Depot Stocks)</span>
          </button>
          <button
            onClick={() => setActiveSubTab('calculator')}
            className={`dt-btn ${activeSubTab === 'calculator' ? 'dt-btn-primary' : 'dt-btn-outline'}`}
            style={{ fontSize: '0.82rem', padding: '0.45rem 0.9rem' }}
          >
            <Calculator size={15} />
            <span>स्मार्ट कोटा सिफारिस क्यालकुलेटर (NARC Norms)</span>
          </button>
          <button
            onClick={() => setActiveSubTab('ledger')}
            className={`dt-btn ${activeSubTab === 'ledger' ? 'dt-btn-primary' : 'dt-btn-outline'}`}
            style={{ fontSize: '0.82rem', padding: '0.45rem 0.9rem' }}
          >
            <FileBadge size={15} />
            <span>मलखाद वितरण अभिलेख तथा रसिद ({distributions.length})</span>
          </button>
        </div>

        {activeSubTab === 'ledger' && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', width: '180px' }}>
              <Search size={14} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="कृषक/रसिद खोज्नुहोस्..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="dt-input"
                style={{ paddingLeft: '26px', fontSize: '0.8rem', height: '32px' }}
              />
            </div>
            <select
              value={selectedWard}
              onChange={(e) => setSelectedWard(Number(e.target.value))}
              className="dt-select"
              style={{ fontSize: '0.8rem', height: '32px' }}
            >
              <option value={0}>सबै वडाहरू</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
                <option key={w} value={w}>वडा नं. {w}</option>
              ))}
            </select>
            <select
              value={selectedFertType}
              onChange={(e) => setSelectedFertType(e.target.value)}
              className="dt-select"
              style={{ fontSize: '0.8rem', height: '32px' }}
            >
              <option value="">सबै मल प्रकार</option>
              <option value="UREA">युरिया (Urea)</option>
              <option value="DAP">डीएपी (DAP)</option>
              <option value="POTASH">पोटास (Potash)</option>
              <option value="AGRI_LIME">कृषि चुन (Lime)</option>
              <option value="ORGANIC_COMPOST">प्राङ्गारिक मल</option>
            </select>
          </div>
        )}
      </div>

      {/* Sub-Tab 1: Depots & Stock Inventory */}
      {activeSubTab === 'depots' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Municipal Stock Aggregates */}
          <div className="dt-card">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Building2 size={18} className="dt-text-primary" />
              <span>गाउँपालिकाभर उपलब्ध मलखाद मौज्दात (Municipal Stock Overview)</span>
            </h3>

            <div className="agri-grid-auto">
              {summary?.stockByType?.map((item) => {
                const total = Number(item.totalStockKg) || 1;
                const avail = Number(item.availableStockKg) || 0;
                const percent = Math.round((avail / total) * 100);
                const isLow = percent < 25;

                return (
                  <div key={item.type} style={{ padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>{item.name}</span>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '0.15rem 0.45rem',
                          borderRadius: '4px',
                          backgroundColor: isLow ? '#fee2e2' : '#dcfce7',
                          color: isLow ? '#b91c1c' : '#15803d',
                        }}
                      >
                        {percent}% उपलब्ध
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                      <span>बाँकी: <strong style={{ color: 'var(--text-main)' }}>{avail.toLocaleString()} केजी</strong></span>
                      <span>कुल: {total.toLocaleString()} केजी</span>
                    </div>

                    <div style={{ height: '7px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${percent}%`,
                          height: '100%',
                          backgroundColor: isLow ? '#ef4444' : '#10b981',
                          transition: 'width 0.4s ease',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Individual Depot Cards */}
          <div className="agri-grid-auto">
            {Object.values(depotGroups).map((depot) => (
              <div key={depot.depotName} className="dt-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>{depot.depotName}</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.35rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      <span className="dt-badge dt-badge-info">वडा नं. {depot.wardNumber}</span>
                      {depot.contactPerson && (
                        <span>सम्पर्क: <strong>{depot.contactPerson}</strong></span>
                      )}
                    </div>
                  </div>

                  {depot.contactPhone && (
                    <a
                      href={`tel:${depot.contactPhone}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        fontSize: '0.75rem',
                        padding: '0.35rem 0.65rem',
                        borderRadius: '6px',
                        backgroundColor: '#e0f2fe',
                        color: '#0284c7',
                        textDecoration: 'none',
                        fontWeight: 700,
                      }}
                      title="सहकारी डिपोमा फोन गर्नुहोस्"
                    >
                      <Phone size={13} /> {depot.contactPhone}
                    </a>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {depot.items.map((it) => {
                    const avail = Number(it.availableStockKg);
                    const total = Number(it.totalStockKg);
                    const percent = Math.round((avail / (total || 1)) * 100);

                    return (
                      <div key={it.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', padding: '0.45rem', borderRadius: '6px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                          <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{it.fertilizerNameNepali}</span>
                          <span style={{ fontWeight: 700, color: avail > 500 ? '#047857' : '#b91c1c' }}>
                            {avail.toLocaleString()} केजी बाँकी
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          <span>अनुदानित दर: <strong>रु. {it.subsidizedPricePerKg}/केजी</strong> (बजार: रु. {it.marketPricePerKg})</span>
                          <span>कुल कोटा: {total.toLocaleString()} केजी</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, depotName: depot.depotName }));
                    setIsDisburseModalOpen(true);
                  }}
                  className="dt-btn dt-btn-outline"
                  style={{ width: '100%', fontSize: '0.82rem', padding: '0.45rem', justifyContent: 'center' }}
                >
                  यस डिपोबाट कोटा वितरण गर्नुहोस्
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-Tab 2: Smart NARC Quota Calculator */}
      {activeSubTab === 'calculator' && (
        <div className="agri-responsive-split-layout">
          {/* Calculator Parameters */}
          <div className="dt-card">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sliders size={18} className="dt-text-primary" />
              <span>जग्गा, बाली र माटो प्यारामिटर</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              {/* Quick autofill from registered farmer */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  दर्ता कृषकबाट स्वतः विवरण तान्नुहोस् (वैकल्पिक):
                </label>
                <select
                  className="dt-select"
                  style={{ width: '100%', fontSize: '0.85rem' }}
                  onChange={(e) => {
                    const f = farmers.find((farm) => farm.farmerId === e.target.value);
                    if (f) {
                      setCalcRopani(Number(f.landAreaRopani) || 4);
                      if (f.majorCrops?.includes('आलु')) setCalcCrop('आलु');
                      else if (f.majorCrops?.includes('किबी')) setCalcCrop('किबी/स्याउ');
                      else if (f.majorCrops?.includes('धान')) setCalcCrop('धान');
                      else if (f.majorCrops?.includes('मकै')) setCalcCrop('मकै');
                      if (typeof f.soilHealthCard === 'object' && f.soilHealthCard?.ph) {
                        setCalcPh(Number(f.soilHealthCard.ph));
                      }
                    }
                  }}
                >
                  <option value="">-- कृषक छान्नुहोस् --</option>
                  {farmers.map((f) => (
                    <option key={f.id} value={f.farmerId}>
                      {f.farmerId} - {f.fullName} (वडा {f.wardNumber}, {f.landAreaRopani} रोपनी)
                    </option>
                  ))}
                </select>
              </div>

              {/* Crop Selector */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  लगाइने मुख्य बाली छान्नुहोस्:
                </label>
                <select
                  value={calcCrop}
                  onChange={(e) => setCalcCrop(e.target.value)}
                  className="dt-select"
                  style={{ width: '100%', fontSize: '0.85rem' }}
                >
                  <option value="आलु">भोताङे रातो आलु (Organic Potato - NARC Rec)</option>
                  <option value="धान">स्थानीय तथा उन्नत धान (Paddy/Rice)</option>
                  <option value="मकै">मकै तथा कोदो (Maize & Millet)</option>
                  <option value="किबी/स्याउ">किबी तथा फलफूल बगैँचा (Kiwi/Apple)</option>
                  <option value="तरकारी">टनेल तथा बेमौसमी ताजा तरकारी (Tunnel Vegetables)</option>
                </select>
              </div>

              {/* Land Area Ropani */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  <span>खेती गरिने क्षेत्रफल (रोपनी):</span>
                  <span style={{ color: 'var(--primary)', fontWeight: 800 }}>{calcRopani} रोपनी</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="25"
                  step="0.5"
                  value={calcRopani}
                  onChange={(e) => setCalcRopani(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  <span>०.५ रोपनी</span>
                  <span>१० रोपनी</span>
                  <span>२५ रोपनी</span>
                </div>
              </div>

              {/* Soil pH Slider */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  <span>माटोको pH स्तर (Soil Acidity):</span>
                  <span
                    style={{
                      fontWeight: 800,
                      color: calcPh < 6.0 ? '#b91c1c' : calcPh > 7.5 ? '#b45309' : '#047857',
                    }}
                  >
                    pH {calcPh} ({calcPh < 6.0 ? 'अम्लीय/चुन आवश्यक' : calcPh > 7.5 ? 'क्षारीय' : 'उत्कृष्ट तटस्थ'})
                  </span>
                </div>
                <input
                  type="range"
                  min="4.5"
                  max="8.0"
                  step="0.1"
                  value={calcPh}
                  onChange={(e) => setCalcPh(Number(e.target.value))}
                  style={{ width: '100%', accentColor: calcPh < 6.0 ? '#ef4444' : '#10b981', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  <span>४.५ (तीव्र अम्लीय)</span>
                  <span>६.२ (तटस्थ)</span>
                  <span>८.० (क्षारीय)</span>
                </div>
              </div>

              {/* Advisory Box */}
              <div style={{ padding: '0.85rem', borderRadius: '8px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', fontSize: '0.78rem', color: '#166534' }}>
                <div style={{ fontWeight: 700, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <ShieldCheck size={16} /> NARC वैज्ञानिक सिफारिस मापदण्ड
                </div>
                <div>{calcResult?.soilAdvisory}</div>
              </div>
            </div>
          </div>

          {/* Calculator Results & Cost Savings */}
          <div className="dt-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.6rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <Coins size={18} color="#10b981" />
                  <span>सिफारिस कोटा तथा सरकारी अनुदान बचत विश्लेषण</span>
                </h3>
                <span className="dt-badge dt-badge-success">{calcCrop} - {calcRopani} रोपनी</span>
              </div>

              {/* Highlight Box */}
              <div className="agri-grid-3" style={{ marginBottom: '1.25rem' }}>
                <div style={{ padding: '0.75rem', borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid var(--border)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>अनुदानित कृषक मूल्य</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.2rem' }}>
                    रु. {calcResult?.totalFarmerCostNpr?.toLocaleString() || 0}
                  </div>
                </div>

                <div style={{ padding: '0.75rem', borderRadius: '8px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: '#991b1b' }}>खुला बजार मूल्य</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#b91c1c', marginTop: '0.2rem' }}>
                    रु. {calcResult?.totalMarketCostNpr?.toLocaleString() || 0}
                  </div>
                </div>

                <div style={{ padding: '0.75rem', borderRadius: '8px', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: '#065f46' }}>सरकारी अनुदान बचत</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#047857', marginTop: '0.2rem' }}>
                    रु. {calcResult?.totalGovSubsidyNpr?.toLocaleString() || 0}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 700 }}>
                    ({calcResult?.overallSavingsPercent}% बचत)
                  </div>
                </div>
              </div>

              {/* Table of Recommended Dosages */}
              <div className="dt-responsive-table-wrapper">
                <table className="dt-table" style={{ fontSize: '0.8rem' }}>
                  <thead>
                    <tr>
                      <th>मलको नाम</th>
                      <th>प्रति रोपनी</th>
                      <th>सिफारिस परिमाण</th>
                      <th>अनुदानित दर</th>
                      <th>बजार दर</th>
                      <th>कृषक मूल्य</th>
                      <th>अनुदान छुट</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calcResult?.items?.map((it) => (
                      <tr key={it.type}>
                        <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>{it.name}</td>
                        <td>{it.ratePerRopaniKg} केजी</td>
                        <td>
                          <strong style={{ color: 'var(--primary)' }}>{it.recommendedKg} केजी</strong>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>
                            ({it.recommendedBags} बोरा)
                          </span>
                        </td>
                        <td>रु. {it.subsidizedRate}/केजी</td>
                        <td style={{ color: '#991b1b' }}>रु. {it.marketRate}/केजी</td>
                        <td style={{ fontWeight: 700 }}>रु. {it.farmerCostNpr.toLocaleString()}</td>
                        <td style={{ fontWeight: 700, color: '#047857' }}>
                          रु. {it.govSubsidyNpr.toLocaleString()} ({it.savingsPercent}%)
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.85rem', marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                * नेपाल सरकार कृषि तथा पशुपन्छी विकास मन्त्रालय एवं NARC मापदण्ड अनुसार
              </span>
              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    cropSeason: `${calcCrop} बाली सिजन २०८१/०८२`,
                    quantityKg: calcResult?.items[0]?.recommendedKg || 50,
                  }));
                  setIsDisburseModalOpen(true);
                }}
                className="dt-btn dt-btn-primary"
                style={{ fontSize: '0.82rem', padding: '0.45rem 1rem' }}
              >
                यस सिफारिस अनुसार कोटा वितरण फारम भर्नुहोस्
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 3: Distribution Ledger */}
      {activeSubTab === 'ledger' && (
        <div className="dt-card" style={{ padding: 0 }}>
          <div className="dt-responsive-table-wrapper">
            <table className="dt-table">
              <thead>
                <tr>
                  <th>रसिद नं.</th>
                  <th>कृषकको नाम र परिचयपत्र</th>
                  <th>वडा नं.</th>
                  <th>सहकारी डिपो</th>
                  <th>मलको प्रकार</th>
                  <th>परिमाण (बोरा/केजी)</th>
                  <th>कृषकले तिरेको</th>
                  <th>सरकारी अनुदान</th>
                  <th>बाली सिजन</th>
                  <th>मिति</th>
                  <th>कार्य (Action)</th>
                </tr>
              </thead>
              <tbody>
                {filteredDistributions.map((d) => (
                  <tr key={d.id}>
                    <td>
                      <span className="dt-badge dt-badge-info" style={{ fontFamily: 'monospace', fontWeight: 700 }}>
                        {d.receiptNo}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{d.farmerName}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{d.farmerId}</div>
                    </td>
                    <td>वडा {d.wardNumber}</td>
                    <td style={{ fontSize: '0.82rem' }}>{d.depotName}</td>
                    <td>
                      <span className="dt-badge dt-badge-outline">{d.fertilizerNameNepali}</span>
                    </td>
                    <td>
                      <strong>{d.quantityKg} केजी</strong>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>
                        ({d.quantityBags} बोरा)
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                      रु. {Number(d.farmerPaidAmountNpr).toLocaleString()}
                    </td>
                    <td style={{ fontWeight: 700, color: '#047857' }}>
                      रु. {Number(d.governmentSubsidyAmountNpr).toLocaleString()}
                    </td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{d.cropSeason}</td>
                    <td style={{ fontSize: '0.78rem' }}>{d.distributionDateBs}</td>
                    <td>
                      <button
                        onClick={() => setSelectedVoucher(d)}
                        className="dt-btn dt-btn-outline"
                        style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                        title="डिजिटल मलखाद कुपन/रसिद हेर्नुहोस्"
                      >
                        <Printer size={13} /> कुपन/रसिद
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Disburse Modal */}
      {isDisburseModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            className="dt-card"
            style={{
              width: '100%',
              maxWidth: '560px',
              maxHeight: '90vh',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <PlusCircle size={20} className="dt-text-primary" />
                <span>नयाँ अनुदानित मल कोटा वितरण दर्ता</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsDisburseModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                disburseMutation.mutate(formData);
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}
            >
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                  लाभान्वित कृषक छान्नुहोस्:
                </label>
                <select
                  className="dt-select"
                  style={{ width: '100%' }}
                  value={formData.farmerId}
                  onChange={(e) => setFormData({ ...formData, farmerId: e.target.value })}
                  required
                >
                  {farmers.map((f) => (
                    <option key={f.id} value={f.farmerId}>
                      {f.farmerId} - {f.fullName} (वडा {f.wardNumber}, {f.toleVillage || 'गाउँठाउँ'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                  सहकारी तथा वितरण डिपो:
                </label>
                <select
                  className="dt-select"
                  style={{ width: '100%' }}
                  value={formData.depotName}
                  onChange={(e) => setFormData({ ...formData, depotName: e.target.value })}
                  required
                >
                  <option value="भोताङ साना किसान कृषि सहकारी डिपो">भोताङ साना किसान कृषि सहकारी डिपो (वडा ३)</option>
                  <option value="थाङपालधाप कृषि सहकारी डिपो">थाङपालधाप कृषि सहकारी डिपो (वडा ६)</option>
                  <option value="बाँसखर्क कृषि सेवा केन्द्र डिपो">बाँसखर्क कृषि सेवा केन्द्र डिपो (वडा १)</option>
                  <option value="मानेखर्क बहुउद्देश्यीय सहकारी डिपो">मानेखर्क बहुउद्देश्यीय सहकारी डिपो (वडा ४)</option>
                </select>
              </div>

              <div className="agri-grid-form">
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                    मलको प्रकार:
                  </label>
                  <select
                    className="dt-select"
                    style={{ width: '100%' }}
                    value={formData.fertilizerType}
                    onChange={(e) => setFormData({ ...formData, fertilizerType: e.target.value })}
                    required
                  >
                    <option value="UREA">युरिया मल (Urea 46% N)</option>
                    <option value="DAP">डीएपी मल (DAP 18:46:0)</option>
                    <option value="POTASH">पोटास मल (MOP 60% K2O)</option>
                    <option value="AGRI_LIME">कृषि चुन (Agricultural Lime)</option>
                    <option value="ORGANIC_COMPOST">प्राङ्गारिक जैविक मल</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                    परिमाण (केजी):
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="500"
                    step="5"
                    className="dt-input"
                    value={formData.quantityKg}
                    onChange={(e) => setFormData({ ...formData, quantityKg: Number(e.target.value) })}
                    required
                  />
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    = {Math.round((formData.quantityKg / 50) * 10) / 10} बोरा (५० केजी प्रति बोरा)
                  </span>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                  बाली सिजन:
                </label>
                <input
                  type="text"
                  className="dt-input"
                  value={formData.cropSeason}
                  onChange={(e) => setFormData({ ...formData, cropSeason: e.target.value })}
                  placeholder="उदा: हिउँदे आलु तथा किबी सिजन (२०८१/०८२)"
                  required
                />
              </div>

              <div className="agri-grid-2">
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                    वितरण मिति (वि.सं.):
                  </label>
                  <input
                    type="text"
                    className="dt-input"
                    value={formData.distributionDateBs}
                    onChange={(e) => setFormData({ ...formData, distributionDateBs: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                    कैफियत:
                  </label>
                  <input
                    type="text"
                    className="dt-input"
                    value={formData.remarks}
                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                    placeholder="कोटा अनुमोदन विवरण"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsDisburseModalOpen(false)}
                  className="dt-btn dt-btn-outline"
                >
                  रद्द गर्नुहोस्
                </button>
                <button
                  type="submit"
                  disabled={disburseMutation.isPending}
                  className="dt-btn dt-btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <CheckCircle2 size={16} />
                  <span>{disburseMutation.isPending ? 'दर्ता हुँदैछ...' : 'वितरण सुरक्षित गरी रसिद निकाल्नुहोस्'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Digital Fertilizer Voucher Modal */}
      {selectedVoucher && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            className="dt-card"
            style={{
              width: '100%',
              maxWidth: '650px',
              backgroundColor: '#ffffff',
              color: '#0f172a',
              padding: '1.75rem',
              borderRadius: '12px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
              position: 'relative',
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedVoucher(null)}
              style={{
                position: 'absolute',
                right: '1rem',
                top: '1rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#64748b',
              }}
            >
              <X size={20} />
            </button>

            {/* Print Header */}
            <div style={{ textAlign: 'center', borderBottom: '2px solid #0284c7', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.85rem', color: '#dc2626', fontWeight: 700 }}>नेपाल सरकार | बागमती प्रदेश</div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#1e3a8a', margin: '0.2rem 0' }}>
                पाँचपोखरी थाङपाल गाउँपालिका
              </h2>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#047857' }}>
                कृषि तथा पशुपन्छी विकास शाखा
              </div>
              <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '0.15rem' }}>
                गाउँ कार्यपालिकाको कार्यालय, थाङपालधाप, सिन्धुपाल्चोक
              </div>
              <div style={{ display: 'inline-block', backgroundColor: '#e0f2fe', color: '#0369a1', fontWeight: 800, padding: '0.2rem 0.8rem', borderRadius: '4px', fontSize: '0.85rem', marginTop: '0.45rem' }}>
                अनुदानित रासायनिक/जैविक मलखाद वितरण कुपन तथा रसिद
              </div>
            </div>

            {/* Voucher Body */}
            <div className="agri-grid-form" style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <div><strong>रसिद नं.:</strong> <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#0284c7' }}>{selectedVoucher.receiptNo}</span></div>
                <div><strong>कृषकको नाम:</strong> {selectedVoucher.farmerName} ({selectedVoucher.farmerId})</div>
                <div><strong>वडा नं.:</strong> {selectedVoucher.wardNumber} | <strong>वितरण डिपो:</strong> {selectedVoucher.depotName}</div>
                <div><strong>बाली सिजन:</strong> {selectedVoucher.cropSeason}</div>
                <div><strong>वितरण मिति:</strong> {selectedVoucher.distributionDateBs}</div>
              </div>

              {/* QR Verification Box */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px dashed #94a3b8', borderRadius: '8px', padding: '0.5rem', backgroundColor: '#f8fafc' }}>
                <QrCode size={64} color="#0f172a" />
                <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '0.25rem', textAlign: 'center' }}>
                  डिजिटल प्रमाणीकरण QR
                </div>
              </div>
            </div>

            {/* Receipt Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', marginBottom: '1rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9', borderTop: '1px solid #cbd5e1', borderBottom: '1px solid #cbd5e1', textAlign: 'left' }}>
                  <th style={{ padding: '0.5rem' }}>विवरण</th>
                  <th style={{ padding: '0.5rem' }}>परिमाण</th>
                  <th style={{ padding: '0.5rem' }}>अनुदानित दर</th>
                  <th style={{ padding: '0.5rem' }}>कृषकले बुझाएको</th>
                  <th style={{ padding: '0.5rem' }}>सरकारी अनुदान</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '0.5rem', fontWeight: 600 }}>{selectedVoucher.fertilizerNameNepali}</td>
                  <td style={{ padding: '0.5rem' }}>{selectedVoucher.quantityKg} केजी ({selectedVoucher.quantityBags} बोरा)</td>
                  <td style={{ padding: '0.5rem' }}>रु. {selectedVoucher.subsidizedRatePerKg}/केजी</td>
                  <td style={{ padding: '0.5rem', fontWeight: 800 }}>रु. {Number(selectedVoucher.farmerPaidAmountNpr).toLocaleString()}</td>
                  <td style={{ padding: '0.5rem', fontWeight: 800, color: '#047857' }}>
                    रु. {Number(selectedVoucher.governmentSubsidyAmountNpr).toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Signatures */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '2.5rem', paddingTop: '1rem', borderTop: '1px dotted #cbd5e1', fontSize: '0.8rem' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '130px', borderBottom: '1px solid #475569', marginBottom: '0.25rem' }} />
                <div>कृषकको हस्ताक्षर / औँठाछाप</div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '80px', height: '40px', border: '1px dashed #cbd5e1', margin: '0 auto 0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', color: '#94a3b8' }}>
                  [ पालिका छाप ]
                </div>
                <div>डिपो / सहकारी छाप</div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '130px', borderBottom: '1px solid #475569', marginBottom: '0.25rem' }} />
                <div>अधिकृत प्राविधिक हस्ताक्षर</div>
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '1.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setSelectedVoucher(null)}
                className="dt-btn dt-btn-outline"
                style={{ fontSize: '0.82rem' }}
              >
                बन्द गर्नुहोस्
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="dt-btn dt-btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem' }}
              >
                <Printer size={15} /> प्रिन्ट / PDF डाउनलोड
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FertilizerQuotaTab;
