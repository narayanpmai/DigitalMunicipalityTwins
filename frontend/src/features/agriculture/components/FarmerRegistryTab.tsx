import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  agricultureApi,
  AgricultureFarmer,
  FarmerSubsidy,
  SoilHealthCardData,
} from '../../../api/agriculture';
import {
  UserPlus,
  Search,
  Filter,
  Users,
  Layers,
  Banknote,
  FileBadge,
  Eye,
  PlusCircle,
  Activity,
  CheckCircle2,
  X,
  Phone,
  Home,
  FileSpreadsheet,
  Printer,
} from 'lucide-react';
import { FarmerDigitalIdModal } from './FarmerDigitalIdModal';

export const FarmerRegistryTab: React.FC = () => {
  const queryClient = useQueryClient();

  // Filters
  const [selectedWard, setSelectedWard] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isAddFarmerOpen, setIsAddFarmerOpen] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState<AgricultureFarmer | null>(null);
  const [isSubsidyModalOpen, setIsSubsidyModalOpen] = useState(false);
  const [isSoilModalOpen, setIsSoilModalOpen] = useState(false);
  const [isIdCardOpen, setIsIdCardOpen] = useState(false);
  const [cardFarmer, setCardFarmer] = useState<AgricultureFarmer | null>(null);

  // New Farmer Form State
  const [newFarmer, setNewFarmer] = useState<Partial<AgricultureFarmer>>({
    fullName: '',
    gender: 'पुरुष',
    citizenshipNo: '',
    contactPhone: '',
    wardNumber: 3,
    toleVillage: '',
    farmerCategory: 'साना किसान (२-१० रोपनी)',
    landAreaRopani: 3.5,
    majorCrops: '',
    livestockDetails: '',
    bankName: '',
    bankAccountNo: '',
    remarks: '',
  });

  // New Subsidy Form State
  const [newSubsidy, setNewSubsidy] = useState<FarmerSubsidy>({
    programName: '',
    fiscalYear: '२०८१/०८२',
    subsidyAmount: 0,
    item: '',
    dateBs: new Date().toISOString().slice(0, 10),
  });

  // Soil Card Form State
  const [soilForm, setSoilForm] = useState<SoilHealthCardData>({
    ph: 6.2,
    nitrogen: 'मध्यम',
    phosphorus: 'मध्यम',
    potassium: 'उच्च',
    organicMatter: '२.५%',
    advisory: 'सन्तुलित कम्पोस्ट मल प्रयोग गर्ने र अम्लीयपन न्यूनीकरणका लागि कृषि चुन हाल्ने।',
    testDateBs: '२०८१-०१-१५',
    status: 'उपयुक्त',
  });

  // Summary Query
  const { data: summary } = useQuery({
    queryKey: ['farmer-summary'],
    queryFn: () => agricultureApi.getFarmerSummary(),
  });

  // Farmers List Query
  const { data: farmers = [], isLoading } = useQuery({
    queryKey: ['farmers-list', selectedWard, selectedCategory, searchTerm],
    queryFn: () =>
      agricultureApi.getFarmers({
        ward: selectedWard > 0 ? selectedWard : undefined,
        category: selectedCategory || undefined,
        search: searchTerm || undefined,
      }),
  });

  // Create Farmer Mutation
  const createMutation = useMutation({
    mutationFn: (data: Partial<AgricultureFarmer>) => agricultureApi.createFarmer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farmers-list'] });
      queryClient.invalidateQueries({ queryKey: ['farmer-summary'] });
      setIsAddFarmerOpen(false);
      setNewFarmer({
        fullName: '',
        gender: 'पुरुष',
        citizenshipNo: '',
        contactPhone: '',
        wardNumber: 3,
        toleVillage: '',
        farmerCategory: 'साना किसान (२-१० रोपनी)',
        landAreaRopani: 3.5,
        majorCrops: '',
        livestockDetails: '',
        bankName: '',
        bankAccountNo: '',
        remarks: '',
      });
      alert('कृषक सफलतापूर्वक दर्ता भयो!');
    },
    onError: (err: any) => {
      alert('त्रुटि: ' + (err.response?.data?.message || err.message));
    },
  });

  // Disburse Subsidy Mutation
  const subsidyMutation = useMutation({
    mutationFn: ({ id, subsidy }: { id: string; subsidy: FarmerSubsidy }) =>
      agricultureApi.disburseFarmerSubsidy(id, subsidy),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['farmers-list'] });
      queryClient.invalidateQueries({ queryKey: ['farmer-summary'] });
      setSelectedFarmer(updated);
      setIsSubsidyModalOpen(false);
      setNewSubsidy({
        programName: '',
        fiscalYear: '२०८१/०८२',
        subsidyAmount: 0,
        item: '',
        dateBs: new Date().toISOString().slice(0, 10),
      });
      alert('अनुदान सफलतापूर्वक वितरण गरियो!');
    },
    onError: (err: any) => {
      alert('त्रुटि: ' + (err.response?.data?.message || err.message));
    },
  });

  // Update Soil Card Mutation
  const soilMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: SoilHealthCardData }) =>
      agricultureApi.updateSoilHealthCard(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['farmers-list'] });
      queryClient.invalidateQueries({ queryKey: ['farmer-summary'] });
      setSelectedFarmer(updated);
      setIsSoilModalOpen(false);
      alert('माटो स्वास्थ्य कार्ड सफलतापूर्वक जारी/अद्यावधिक गरियो!');
    },
    onError: (err: any) => {
      alert('त्रुटि: ' + (err.response?.data?.message || err.message));
    },
  });

  // Helper parser for subsidies history
  const parseSubsidies = (hist: any): FarmerSubsidy[] => {
    if (!hist) return [];
    if (Array.isArray(hist)) return hist;
    try {
      return JSON.parse(hist);
    } catch {
      return [];
    }
  };

  // Helper parser for soil card
  const parseSoilCard = (card: any): SoilHealthCardData | null => {
    if (!card) return null;
    if (typeof card === 'object') return card;
    try {
      return JSON.parse(card);
    } catch {
      return null;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Metric Cards */}
      <div className="agri-grid-auto">
        <div className="dt-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid #16a34a' }}>
          <div style={{ padding: '0.75rem', borderRadius: '10px', backgroundColor: '#dcfce7', color: '#16a34a' }}>
            <Users size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>कुल दर्ता कृषक</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{summary?.totalRegisteredFarmers || farmers.length} जना</div>
          </div>
        </div>

        <div className="dt-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid #0284c7' }}>
          <div style={{ padding: '0.75rem', borderRadius: '10px', backgroundColor: '#e0f2fe', color: '#0284c7' }}>
            <Layers size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>कुल जग्गा क्षेत्रफल</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{summary?.totalLandRopani || 0} रोपनी</div>
          </div>
        </div>

        <div className="dt-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid #d97706' }}>
          <div style={{ padding: '0.75rem', borderRadius: '10px', backgroundColor: '#fef3c7', color: '#d97706' }}>
            <Banknote size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>वितरित कुल अनुदान</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#b45309' }}>
              रु. {(summary?.totalSubsidiesDisbursedNPR || 0).toLocaleString()}
            </div>
          </div>
        </div>

        <div className="dt-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid #9333ea' }}>
          <div style={{ padding: '0.75rem', borderRadius: '10px', backgroundColor: '#f3e8ff', color: '#9333ea' }}>
            <FileBadge size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>माटो स्वास्थ्य कार्ड</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#7e22ce' }}>
              {summary?.soilHealthCardsIssued || 0} थान जारी
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar: Filters & Add Farmer */}
      <div className="dt-card" style={{ padding: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center', flex: 1 }}>
          {/* Search */}
          <div style={{ position: 'relative', minWidth: '220px', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="नाम, कृषक नं, फोन, बाली खोज्नुहोस्..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="dt-input"
              style={{ paddingLeft: '2rem', width: '100%' }}
            />
          </div>

          {/* Ward filter */}
          <select
            value={selectedWard}
            onChange={(e) => setSelectedWard(Number(e.target.value))}
            className="dt-select"
            style={{ minWidth: '130px' }}
          >
            <option value={0}>सबै वडाहरू</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
              <option key={w} value={w}>वडा नं. {w}</option>
            ))}
          </select>

          {/* Category filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="dt-select"
            style={{ minWidth: '160px' }}
          >
            <option value="">सबै किसान वर्ग</option>
            <option value="साना किसान (२-१० रोपनी)">साना किसान (२-१० रोपनी)</option>
            <option value="व्यावसायिक किसान (> १० रोपनी)">व्यावसायिक किसान (&gt; १० रोपनी)</option>
            <option value="सीमान्तकृत किसान (< २ रोपनी)">सीमान्तकृत किसान (&lt; २ रोपनी)</option>
          </select>
        </div>

        <button
          onClick={() => setIsAddFarmerOpen(true)}
          className="dt-btn dt-btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <UserPlus size={16} />
          <span>नयाँ कृषक दर्ता गर्नुहोस्</span>
        </button>
      </div>

      {/* Farmers Table */}
      <div className="dt-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>
            डिजिटल कृषक सूची ({farmers.length})
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            अद्यावधिक गरिएको वास्तविक अभिलेख
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="dt-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-muted, #f8fafc)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.8rem' }}>कृषक नं.</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.8rem' }}>पूरा नाम</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.8rem' }}>वडा / टोल</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.8rem' }}>किसान वर्ग</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontSize: '0.8rem' }}>जग्गा (रोपनी)</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.8rem' }}>मुख्य बाली / पशुपन्छी</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontSize: '0.8rem' }}>माटो कार्ड</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontSize: '0.8rem' }}>कार्य</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    लोड हुँदैछ...
                  </td>
                </tr>
              ) : farmers.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    कुनै कृषक रेकर्ड फेला परेन।
                  </td>
                </tr>
              ) : (
                farmers.map((farmer) => {
                  const hasSoil = !!farmer.soilHealthCard;
                  const subsidies = parseSubsidies(farmer.subsidiesHistory);
                  return (
                    <tr key={farmer.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', fontWeight: 700, color: '#0284c7' }}>
                        {farmer.farmerId}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>
                        <div>{farmer.fullName}</div>
                        {farmer.contactPhone && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <Phone size={10} /> {farmer.contactPhone}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span style={{ display: 'inline-block', padding: '2px 6px', borderRadius: '4px', background: '#f1f5f9', fontSize: '0.75rem', fontWeight: 600 }}>
                          वडा {farmer.wardNumber}
                        </span>
                        {farmer.toleVillage && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{farmer.toleVillage}</div>
                        )}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.8rem' }}>
                        {farmer.farmerCategory}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 700 }}>
                        {farmer.landAreaRopani}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', maxWidth: '240px' }}>
                        <div>🌾 {farmer.majorCrops || '-'}</div>
                        {farmer.livestockDetails && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>🐄 {farmer.livestockDetails}</div>
                        )}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                        {hasSoil ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '2px 8px', borderRadius: '9999px', background: '#dcfce7', color: '#15803d', fontSize: '0.72rem', fontWeight: 700 }}>
                            <CheckCircle2 size={12} /> जारी
                          </span>
                        ) : (
                          <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '9999px', background: '#fef3c7', color: '#b45309', fontSize: '0.72rem', fontWeight: 600 }}>
                            बाँकी
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: '4px' }}>
                          <button
                            onClick={() => setSelectedFarmer(farmer)}
                            className="dt-btn dt-btn-outline"
                            style={{ padding: '4px 8px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Eye size={13} /> विवरण / सेवा
                          </button>
                          <button
                            onClick={() => {
                              setCardFarmer(farmer);
                              setIsIdCardOpen(true);
                            }}
                            className="dt-btn dt-btn-outline"
                            style={{ padding: '4px 8px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#15803d', borderColor: '#86efac', backgroundColor: '#f0fdf4' }}
                            title="डिजिटल किसान परिचयपत्र तथा प्रमाणपत्र प्रिन्ट गर्नुहोस्"
                          >
                            <Printer size={13} /> 🪪 कार्ड
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

      {/* Add Farmer Modal */}
      {isAddFarmerOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div className="dt-card" style={{ maxWidth: '650px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
              <h3 style={{ margin: 0, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <UserPlus size={18} color="#16a34a" /> नयाँ कृषक दर्ता फारम
              </h3>
              <button onClick={() => setIsAddFarmerOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createMutation.mutate(newFarmer);
              }}
              className="agri-grid-auto"
            >
              <div>
                <label className="dt-label">पूरा नाम *</label>
                <input
                  type="text"
                  required
                  placeholder="उदा: राम बहादुर तामाङ"
                  value={newFarmer.fullName || ''}
                  onChange={(e) => setNewFarmer({ ...newFarmer, fullName: e.target.value })}
                  className="dt-input"
                />
              </div>

              <div>
                <label className="dt-label">लिङ्ग *</label>
                <select
                  value={newFarmer.gender || 'पुरुष'}
                  onChange={(e) => setNewFarmer({ ...newFarmer, gender: e.target.value })}
                  className="dt-select"
                >
                  <option value="पुरुष">पुरुष</option>
                  <option value="महिला">महिला</option>
                  <option value="अन्य">अन्य</option>
                </select>
              </div>

              <div>
                <label className="dt-label">सम्पर्क फोन नं. *</label>
                <input
                  type="text"
                  required
                  placeholder="९८xxxxxxxx"
                  value={newFarmer.contactPhone || ''}
                  onChange={(e) => setNewFarmer({ ...newFarmer, contactPhone: e.target.value })}
                  className="dt-input"
                />
              </div>

              <div>
                <label className="dt-label">नागरिकता नं.</label>
                <input
                  type="text"
                  placeholder="२७-०१-xx-xxxxx"
                  value={newFarmer.citizenshipNo || ''}
                  onChange={(e) => setNewFarmer({ ...newFarmer, citizenshipNo: e.target.value })}
                  className="dt-input"
                />
              </div>

              <div>
                <label className="dt-label">वडा नम्बर *</label>
                <select
                  value={newFarmer.wardNumber || 3}
                  onChange={(e) => setNewFarmer({ ...newFarmer, wardNumber: Number(e.target.value) })}
                  className="dt-select"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
                    <option key={w} value={w}>वडा नं. {w}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="dt-label">टोल / बस्ती</label>
                <input
                  type="text"
                  placeholder="उदा: भोताङ, गाम्चेत"
                  value={newFarmer.toleVillage || ''}
                  onChange={(e) => setNewFarmer({ ...newFarmer, toleVillage: e.target.value })}
                  className="dt-input"
                />
              </div>

              <div>
                <label className="dt-label">किसान वर्ग *</label>
                <select
                  value={newFarmer.farmerCategory || 'साना किसान (२-१० रोपनी)'}
                  onChange={(e) => setNewFarmer({ ...newFarmer, farmerCategory: e.target.value })}
                  className="dt-select"
                >
                  <option value="साना किसान (२-१० रोपनी)">साना किसान (२-१० रोपनी)</option>
                  <option value="व्यावसायिक किसान (> १० रोपनी)">व्यावसायिक किसान (&gt; १० रोपनी)</option>
                  <option value="सीमान्तकृत किसान (< २ रोपनी)">सीमान्तकृत किसान (&lt; २ रोपनी)</option>
                </select>
              </div>

              <div>
                <label className="dt-label">खेती क्षेत्रफल (रोपनी) *</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  required
                  value={newFarmer.landAreaRopani || 3.5}
                  onChange={(e) => setNewFarmer({ ...newFarmer, landAreaRopani: Number(e.target.value) })}
                  className="dt-input"
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label className="dt-label">मुख्य उत्पादित बालीहरू</label>
                <input
                  type="text"
                  placeholder="उदा: भोताङे रातो आलु, किबी फल, स्थानीय सिमी, मकै"
                  value={newFarmer.majorCrops || ''}
                  onChange={(e) => setNewFarmer({ ...newFarmer, majorCrops: e.target.value })}
                  className="dt-input"
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label className="dt-label">पशुपालन विवरण</label>
                <input
                  type="text"
                  placeholder="उदा: गाई २, भैंसी १, बाख्रा ६, चौंरी ४"
                  value={newFarmer.livestockDetails || ''}
                  onChange={(e) => setNewFarmer({ ...newFarmer, livestockDetails: e.target.value })}
                  className="dt-input"
                />
              </div>

              <div>
                <label className="dt-label">बैंकको नाम</label>
                <input
                  type="text"
                  placeholder="उदा: नेपाल बैंक लि., भोताङ शाखा"
                  value={newFarmer.bankName || ''}
                  onChange={(e) => setNewFarmer({ ...newFarmer, bankName: e.target.value })}
                  className="dt-input"
                />
              </div>

              <div>
                <label className="dt-label">बैंक खाता नम्बर</label>
                <input
                  type="text"
                  placeholder="खाता नम्बर"
                  value={newFarmer.bankAccountNo || ''}
                  onChange={(e) => setNewFarmer({ ...newFarmer, bankAccountNo: e.target.value })}
                  className="dt-input"
                />
              </div>

              <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setIsAddFarmerOpen(false)} className="dt-btn dt-btn-outline">
                  रद्द गर्नुहोस्
                </button>
                <button type="submit" disabled={createMutation.isPending} className="dt-btn dt-btn-primary">
                  {createMutation.isPending ? 'दर्ता हुँदैछ...' : 'कृषक दर्ता सुरक्षित गर्नुहोस्'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Farmer Detail & Service Modal */}
      {selectedFarmer && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div className="dt-card" style={{ maxWidth: '800px', width: '100%', maxHeight: '92vh', overflowY: 'auto' }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800 }}>{selectedFarmer.fullName}</h3>
                  <span style={{ padding: '2px 8px', borderRadius: '4px', background: '#e0f2fe', color: '#0369a1', fontFamily: 'monospace', fontWeight: 700, fontSize: '0.85rem' }}>
                    {selectedFarmer.farmerId}
                  </span>
                </div>
                <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  वडा नं. {selectedFarmer.wardNumber}, {selectedFarmer.toleVillage || 'पाँचपोखरी थाङपाल'} | सम्पर्क: {selectedFarmer.contactPhone || 'उपलब्ध छैन'}
                </p>
              </div>
              <button onClick={() => setSelectedFarmer(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {/* Quick Actions inside detail */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => {
                  setCardFarmer(selectedFarmer);
                  setIsIdCardOpen(true);
                }}
                className="dt-btn dt-btn-primary"
                style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', background: '#16a34a', borderColor: '#16a34a' }}
              >
                <Printer size={14} /> 🪪 डिजिटल परिचयपत्र / प्रमाणपत्र प्रिन्ट
              </button>
              <button
                onClick={() => setIsSubsidyModalOpen(true)}
                className="dt-btn dt-btn-primary"
                style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Banknote size={14} /> ५०% अनुदान वितरण थप्नुहोस्
              </button>
              <button
                onClick={() => {
                  const existing = parseSoilCard(selectedFarmer.soilHealthCard);
                  if (existing) setSoilForm(existing);
                  setIsSoilModalOpen(true);
                }}
                className="dt-btn dt-btn-outline"
                style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', color: '#7e22ce', borderColor: '#d8b4fe' }}
              >
                <Activity size={14} /> माटो स्वास्थ्य कार्ड जारी / अद्यावधिक
              </button>
            </div>

            {/* Two Column Grid */}
            <div className="agri-grid-auto" style={{ marginBottom: '1.25rem' }}>
              {/* Profile Card */}
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                  👨‍🌾 कृषक प्रोफाइल विवरण
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem' }}>
                  <div><strong>किसान वर्ग:</strong> {selectedFarmer.farmerCategory}</div>
                  <div><strong>खेती जग्गा:</strong> {selectedFarmer.landAreaRopani} रोपनी</div>
                  <div><strong>नागरिकता नं:</strong> {selectedFarmer.citizenshipNo || '-'}</div>
                  <div><strong>मुख्य बाली:</strong> {selectedFarmer.majorCrops || '-'}</div>
                  <div><strong>पशुपालन:</strong> {selectedFarmer.livestockDetails || '-'}</div>
                  <div><strong>बैंक खाता:</strong> {selectedFarmer.bankName ? `${selectedFarmer.bankName} (${selectedFarmer.bankAccountNo})` : '-'}</div>
                </div>
              </div>

              {/* Enhanced Soil Health Card Section */}
              <div style={{ background: '#faf5ff', padding: '1.1rem', borderRadius: '10px', border: '1px solid #d8b4fe' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#6b21a8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FileBadge size={17} /> डिजिटल माटो स्वास्थ्य कार्ड (Soil Health Card)
                  </h4>
                  {selectedFarmer.soilHealthCard && (
                    <button
                      onClick={() => window.print()}
                      style={{
                        padding: '2px 8px',
                        fontSize: '0.72rem',
                        borderRadius: '4px',
                        backgroundColor: '#f3e8ff',
                        color: '#7e22ce',
                        border: '1px solid #d8b4fe',
                        cursor: 'pointer',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Printer size={12} /> प्रमाणपत्र प्रिन्ट
                    </button>
                  )}
                </div>

                {selectedFarmer.soilHealthCard ? (
                  (() => {
                    const card = parseSoilCard(selectedFarmer.soilHealthCard);
                    if (!card) return <div>माटो कार्ड लोड हुन सकेन।</div>;
                    const phVal = Number(card.ph) || 6.2;
                    const isAcidic = phVal < 6.0;
                    const isNeutral = phVal >= 6.0 && phVal <= 7.5;
                    const phColor = isAcidic ? '#dc2626' : isNeutral ? '#16a34a' : '#d97706';

                    return (
                      <div style={{ fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span><strong>कार्ड नं:</strong> <code style={{ color: '#6b21a8', fontWeight: 700 }}>{card.cardNo || 'SHC-2081-01'}</code></span>
                          <span
                            style={{
                              backgroundColor: isAcidic ? '#fee2e2' : '#dcfce7',
                              color: isAcidic ? '#991b1b' : '#166534',
                              fontWeight: 700,
                              fontSize: '0.75rem',
                              padding: '2px 8px',
                              borderRadius: '12px',
                            }}
                          >
                            स्थिति: {card.status}
                          </span>
                        </div>

                        {/* Visual pH Gauge Bar */}
                        <div style={{ backgroundColor: '#ffffff', padding: '0.6rem', borderRadius: '6px', border: '1px solid #e9d5ff' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.78rem' }}>
                            <span>माटोको अम्लीयपन (pH): <strong style={{ color: phColor }}>{phVal}</strong></span>
                            <span style={{ fontWeight: 700, color: phColor }}>
                              {isAcidic ? '⚠️ अम्लीय (Acidic - चुन आवश्यक)' : isNeutral ? '✅ उपयुक्त (Neutral)' : 'क्षारीय (Alkaline)'}
                            </span>
                          </div>
                          <div style={{ height: '8px', borderRadius: '4px', background: 'linear-gradient(to right, #ef4444 0%, #f59e0b 35%, #10b981 55%, #0284c7 100%)', position: 'relative' }}>
                            <div
                              style={{
                                position: 'absolute',
                                left: `${Math.min(Math.max(((phVal - 4) / 4.5) * 100, 2), 98)}%`,
                                top: '-3px',
                                width: '14px',
                                height: '14px',
                                backgroundColor: '#1e293b',
                                border: '2px solid #ffffff',
                                borderRadius: '50%',
                                transform: 'translateX(-50%)',
                              }}
                            />
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                            <span>४.० (कडा अम्लीय)</span>
                            <span>६.०-७.० (सर्वोत्तम)</span>
                            <span>८.५ (क्षारीय)</span>
                          </div>
                        </div>

                        {/* N-P-K & Organic Matter Nutrient Gauges */}
                        <div className="agri-grid-4" style={{ textAlign: 'center' }}>
                          <div style={{ backgroundColor: '#ffffff', padding: '0.4rem', borderRadius: '6px', border: '1px solid #e9d5ff' }}>
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>नाइट्रोजन (N)</div>
                            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: card.nitrogen.includes('न्यून') ? '#dc2626' : '#16a34a' }}>
                              {card.nitrogen}
                            </div>
                          </div>
                          <div style={{ backgroundColor: '#ffffff', padding: '0.4rem', borderRadius: '6px', border: '1px solid #e9d5ff' }}>
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>फस्फोरस (P)</div>
                            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: card.phosphorus.includes('न्यून') ? '#dc2626' : '#16a34a' }}>
                              {card.phosphorus}
                            </div>
                          </div>
                          <div style={{ backgroundColor: '#ffffff', padding: '0.4rem', borderRadius: '6px', border: '1px solid #e9d5ff' }}>
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>पोटास (K)</div>
                            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: card.potassium.includes('न्यून') ? '#dc2626' : '#16a34a' }}>
                              {card.potassium}
                            </div>
                          </div>
                          <div style={{ backgroundColor: '#ffffff', padding: '0.4rem', borderRadius: '6px', border: '1px solid #e9d5ff' }}>
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>प्राङ्गारिक (OM)</div>
                            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#047857' }}>
                              {card.organicMatter}
                            </div>
                          </div>
                        </div>

                        {/* Fertilizer & Lime Recommendation Box */}
                        <div style={{ background: '#fef3c7', padding: '8px 10px', borderRadius: '6px', fontSize: '0.78rem', color: '#92400e', border: '1px solid #fde68a' }}>
                          <div style={{ fontWeight: 800, marginBottom: '2px' }}>💡 कृषि प्राविधिक सिफारिस:</div>
                          <div>{card.advisory}</div>
                          {isAcidic && (
                            <div style={{ marginTop: '4px', fontWeight: 700, color: '#b91c1c' }}>
                              ⚠️ माटो अम्लीय भएकाले प्रति रोपनी २०-२५ केजी कृषि चुन प्रयोग गर्न अनिवार्य छ।
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <div style={{ padding: '1rem', textAlign: 'center', color: '#6b21a8' }}>
                    यो कृषकको माटो परीक्षण कार्ड हालसम्म जारी गरिएको छैन।
                    <div style={{ marginTop: '0.5rem' }}>
                      <button
                        onClick={() => setIsSoilModalOpen(true)}
                        className="dt-btn dt-btn-primary"
                        style={{ fontSize: '0.75rem', background: '#9333ea', borderColor: '#9333ea' }}
                      >
                        अहिले कार्ड जारी गर्नुहोस्
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Subsidies History Table */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>
                  💰 प्राप्त अनुदान तथा सहयोग इतिहास
                </h4>
                <button
                  onClick={() => setIsSubsidyModalOpen(true)}
                  className="dt-btn dt-btn-outline"
                  style={{ padding: '3px 8px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <PlusCircle size={13} /> नयाँ अनुदान थप्नुहोस्
                </button>
              </div>

              {parseSubsidies(selectedFarmer.subsidiesHistory).length === 0 ? (
                <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  हालसम्म कुनै सरकारी/पालिका अनुदान प्राप्त भएको रेकर्ड छैन।
                </div>
              ) : (
                <table className="dt-table" style={{ width: '100%', fontSize: '0.8rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      <th style={{ padding: '6px 8px', textAlign: 'left' }}>कार्यक्रमको नाम</th>
                      <th style={{ padding: '6px 8px', textAlign: 'left' }}>आ.व.</th>
                      <th style={{ padding: '6px 8px', textAlign: 'left' }}>प्राप्त सामग्री / यन्त्र</th>
                      <th style={{ padding: '6px 8px', textAlign: 'right' }}>अनुदान रकम (रु.)</th>
                      <th style={{ padding: '6px 8px', textAlign: 'left' }}>मिति</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parseSubsidies(selectedFarmer.subsidiesHistory).map((s, idx) => (
                      <tr key={idx}>
                        <td style={{ padding: '6px 8px', fontWeight: 600 }}>{s.programName}</td>
                        <td style={{ padding: '6px 8px' }}>{s.fiscalYear}</td>
                        <td style={{ padding: '6px 8px' }}>{s.item || '-'}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 700, color: '#16a34a' }}>
                          रु. {Number(s.subsidyAmount || 0).toLocaleString()}
                        </td>
                        <td style={{ padding: '6px 8px', color: 'var(--text-muted)' }}>{s.dateBs || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Disburse Subsidy Modal */}
      {isSubsidyModalOpen && selectedFarmer && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '1rem' }}>
          <div className="dt-card" style={{ maxWidth: '500px', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4 style={{ margin: 0, fontWeight: 700 }}>कृषि अनुदान वितरण फारम</h4>
              <button onClick={() => setIsSubsidyModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '-0.5rem', marginBottom: '1rem' }}>
              कृषक: <strong>{selectedFarmer.fullName}</strong> ({selectedFarmer.farmerId})
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                subsidyMutation.mutate({ id: selectedFarmer.id, subsidy: newSubsidy });
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
            >
              <div>
                <label className="dt-label">अनुदान कार्यक्रमको नाम *</label>
                <input
                  type="text"
                  required
                  placeholder="उदा: ५०% अनुदानमा मिनि टिलर वितरण"
                  value={newSubsidy.programName}
                  onChange={(e) => setNewSubsidy({ ...newSubsidy, programName: e.target.value })}
                  className="dt-input"
                />
              </div>

              <div className="agri-grid-2">
                <div>
                  <label className="dt-label">आर्थिक वर्ष *</label>
                  <input
                    type="text"
                    required
                    value={newSubsidy.fiscalYear}
                    onChange={(e) => setNewSubsidy({ ...newSubsidy, fiscalYear: e.target.value })}
                    className="dt-input"
                  />
                </div>
                <div>
                  <label className="dt-label">अनुदान रकम (रु.) *</label>
                  <input
                    type="number"
                    min="100"
                    required
                    value={newSubsidy.subsidyAmount || ''}
                    onChange={(e) => setNewSubsidy({ ...newSubsidy, subsidyAmount: Number(e.target.value) })}
                    className="dt-input"
                  />
                </div>
              </div>

              <div>
                <label className="dt-label">प्राप्त सामग्री / विवरण</label>
                <input
                  type="text"
                  placeholder="उदा: ७ HP Power Tiller, आलु बीउ, आदि"
                  value={newSubsidy.item || ''}
                  onChange={(e) => setNewSubsidy({ ...newSubsidy, item: e.target.value })}
                  className="dt-input"
                />
              </div>

              <div>
                <label className="dt-label">वितरण मिति (वि.सं.)</label>
                <input
                  type="text"
                  value={newSubsidy.dateBs || ''}
                  onChange={(e) => setNewSubsidy({ ...newSubsidy, dateBs: e.target.value })}
                  className="dt-input"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setIsSubsidyModalOpen(false)} className="dt-btn dt-btn-outline">
                  रद्द
                </button>
                <button type="submit" disabled={subsidyMutation.isPending} className="dt-btn dt-btn-primary">
                  {subsidyMutation.isPending ? 'सुरक्षित हुँदैछ...' : 'अनुदान सुरक्षित गर्नुहोस्'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Soil Health Card Modal */}
      {isSoilModalOpen && selectedFarmer && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '1rem' }}>
          <div className="dt-card" style={{ maxWidth: '550px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4 style={{ margin: 0, fontWeight: 700, color: '#7e22ce' }}>डिजिटल माटो स्वास्थ्य कार्ड अद्यावधिक</h4>
              <button onClick={() => setIsSoilModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '-0.5rem', marginBottom: '1rem' }}>
              कृषक: <strong>{selectedFarmer.fullName}</strong> (वडा नं. {selectedFarmer.wardNumber})
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                soilMutation.mutate({ id: selectedFarmer.id, data: soilForm });
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
            >
              <div className="agri-grid-2">
                <div>
                  <label className="dt-label">माटो pH मान *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="3.0"
                    max="9.0"
                    required
                    value={soilForm.ph}
                    onChange={(e) => setSoilForm({ ...soilForm, ph: Number(e.target.value) })}
                    className="dt-input"
                  />
                </div>
                <div>
                  <label className="dt-label">प्राङ्गारिक पदार्थ (Organic Matter)</label>
                  <input
                    type="text"
                    value={soilForm.organicMatter}
                    onChange={(e) => setSoilForm({ ...soilForm, organicMatter: e.target.value })}
                    className="dt-input"
                    placeholder="उदा: २.८% (मध्यम)"
                  />
                </div>
              </div>

              <div className="agri-grid-3">
                <div>
                  <label className="dt-label">नाइट्रोजन (N)</label>
                  <select
                    value={soilForm.nitrogen}
                    onChange={(e) => setSoilForm({ ...soilForm, nitrogen: e.target.value })}
                    className="dt-select"
                  >
                    <option value="न्यून">न्यून</option>
                    <option value="मध्यम">मध्यम</option>
                    <option value="उच्च">उच्च</option>
                  </select>
                </div>
                <div>
                  <label className="dt-label">फस्फोरस (P)</label>
                  <select
                    value={soilForm.phosphorus}
                    onChange={(e) => setSoilForm({ ...soilForm, phosphorus: e.target.value })}
                    className="dt-select"
                  >
                    <option value="न्यून">न्यून</option>
                    <option value="मध्यम">मध्यम</option>
                    <option value="उच्च">उच्च</option>
                  </select>
                </div>
                <div>
                  <label className="dt-label">पोटासियम (K)</label>
                  <select
                    value={soilForm.potassium}
                    onChange={(e) => setSoilForm({ ...soilForm, potassium: e.target.value })}
                    className="dt-select"
                  >
                    <option value="न्यून">न्यून</option>
                    <option value="मध्यम">मध्यम</option>
                    <option value="उच्च">उच्च</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="dt-label">परीक्षण मिति (वि.सं.) *</label>
                <input
                  type="text"
                  required
                  value={soilForm.testDateBs}
                  onChange={(e) => setSoilForm({ ...soilForm, testDateBs: e.target.value })}
                  className="dt-input"
                />
              </div>

              <div>
                <label className="dt-label">माटो स्वास्थ्य स्थिति</label>
                <input
                  type="text"
                  value={soilForm.status}
                  onChange={(e) => setSoilForm({ ...soilForm, status: e.target.value })}
                  className="dt-input"
                  placeholder="उदा: उत्कृष्ट / सुधार आवश्यक / सामान्य"
                />
              </div>

              <div>
                <label className="dt-label">प्राविधिक मलखाद सल्लाह *</label>
                <textarea
                  required
                  rows={3}
                  value={soilForm.advisory}
                  onChange={(e) => setSoilForm({ ...soilForm, advisory: e.target.value })}
                  className="dt-input"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setIsSoilModalOpen(false)} className="dt-btn dt-btn-outline">
                  रद्द
                </button>
                <button type="submit" disabled={soilMutation.isPending} className="dt-btn dt-btn-primary" style={{ background: '#9333ea', borderColor: '#9333ea' }}>
                  {soilMutation.isPending ? 'अद्यावधिक हुँदैछ...' : 'माटो कार्ड सुरक्षित गर्नुहोस्'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Printable Farmer Digital ID Card Modal */}
      <FarmerDigitalIdModal
        farmer={cardFarmer}
        isOpen={isIdCardOpen}
        onClose={() => {
          setIsIdCardOpen(false);
          setCardFarmer(null);
        }}
      />
    </div>
  );
};
