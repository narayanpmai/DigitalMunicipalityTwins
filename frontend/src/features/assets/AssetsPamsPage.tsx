import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client';
import {
  Database,
  Search,
  Plus,
  Printer,
  X,
  CheckCircle,
  AlertCircle,
  Building,
  Car,
  Laptop,
  Wrench,
  QrCode,
  Tag,
  Coins
} from 'lucide-react';

interface Asset {
  id: string;
  assetCode: string;
  assetName: string;
  category: string;
  malepaForm: string;
  condition: string;
  wardNumber: number;
  department: string;
  custodianName: string;
  location?: string;
  purchaseDateBs: string;
  purchaseCost: number;
  depreciationRatePercent: number;
  currentBookValue: number;
  modelOrPlateNo?: string;
  remarks?: string;
  inspections?: any[];
}

const ASSET_CATEGORIES = [
  'जग्गा तथा भवन (Land & Building)',
  'सवारी साधन (Vehicles)',
  'कम्प्युटर तथा आईटी उपकरण (IT & Electronics)',
  'फर्निचर तथा फिक्चर्स (Furniture & Fixtures)',
  'मेशिनरी तथा हेभी उपकरण (Machinery & Tools)',
  'कार्यालय सामग्री तथा अन्य (Office Equipment)',
];

export const AssetsPamsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [tagModalData, setTagModalData] = useState<Asset | null>(null);
  const [showInspectionModal, setShowInspectionModal] = useState(false);
  const [inspectionAssetData, setInspectionAssetData] = useState<Asset | null>(null);
  const [inspectionForm, setInspectionForm] = useState({ dateBs: '२०८१-०५-२५', inspector: '', condition: 'चालु अवस्थामा (Operational)', remarks: '' });

  // Form State
  const [formData, setFormData] = useState({
    assetName: '',
    category: 'कम्प्युटर तथा आईटी उपकरण (IT & Electronics)',
    malepaForm: 'मलेप फारम नं ४०७ (खर्च नहुने जिन्सी खाता)',
    condition: 'चालु अवस्थामा (Operational)',
    wardNumber: 0,
    department: 'सामान्य प्रशासन शाखा',
    custodianName: '',
    location: 'कार्यपालिका भवन',
    purchaseDateBs: '२०८१-०४-१५',
    purchaseCost: 85000,
    depreciationRatePercent: 20,
    modelOrPlateNo: '',
  });

  // Fetch Assets
  const { data: assets = [], isLoading } = useQuery<Asset[]>({
    queryKey: ['pams-assets'],
    queryFn: async () => {
      const res: any = await api.get('/assets');
      return res.data || [];
    },
  });

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const currentBookValue = Number(data.purchaseCost) * (1 - Number(data.depreciationRatePercent || 0) / 100);
      return api.post('/assets', { ...data, currentBookValue });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pams-assets'] });
      setShowAddModal(false);
      setFormData({
        assetName: '',
        category: 'कम्प्युटर तथा आईटी उपकरण (IT & Electronics)',
        malepaForm: 'मलेप फारम नं ४०७ (खर्च नहुने जिन्सी खाता)',
        condition: 'चालु अवस्थामा (Operational)',
        wardNumber: 0,
        department: 'सामान्य प्रशासन शाखा',
        custodianName: '',
        location: 'कार्यपालिका भवन',
        purchaseDateBs: '२०८१-०४-१५',
        purchaseCost: 85000,
        depreciationRatePercent: 20,
        modelOrPlateNo: '',
      });
    },
  });

  const inspectMutation = useMutation({
    mutationFn: async (data: any) => {
      return api.post(`/assets/${inspectionAssetData?.id}/inspect`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pams-assets'] });
      setShowInspectionModal(false);
      setInspectionAssetData(null);
      setInspectionForm({ dateBs: '२०८१-०५-२५', inspector: '', condition: 'चालु अवस्थामा (Operational)', remarks: '' });
    },
  });

  // Filtered List
  const filteredList = assets.filter((a) => {
    const matchSearch =
      a.assetName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.assetCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.custodianName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.department?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = selectedCategory === 'all' || a.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  const totalCost = assets.reduce((sum, a) => sum + Number(a.purchaseCost || 0), 0);
  const totalBookVal = assets.reduce((sum, a) => sum + Number(a.currentBookValue || a.purchaseCost || 0), 0);

  return (
    <div style={{ padding: '1.5rem', }}>
      {/* Header Banner */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.5rem',
        padding: '1.25rem 1.5rem',
        background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
        color: '#fff',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.5rem', borderRadius: '8px' }}>
              <Database size={28} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
                सार्वजनिक जिन्सी तथा सम्पत्ति व्यवस्थापन प्रणाली (PAMS)
              </h1>
              <p style={{ margin: '0.25rem 0 0', opacity: 0.9, fontSize: '0.875rem' }}>
                महालेखा परीक्षक (मलेप) फाराम नं. ४०१, ४०३, ४०७ र ४०८ बमोजिम भौतिक सम्पत्ति लगत, ह्रासकट्टी र QR कोड ट्र्याकिङ
              </p>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => window.print()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.6rem 1rem',
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '8px',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 500
            }}
          >
            <Printer size={16} /> जिन्सी खाता प्रिन्ट
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.6rem 1.25rem',
              background: '#0ea5e9',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            <Plus size={18} /> नयाँ जिन्सी दाखिला
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{
          background: '#fff',
          padding: '1.25rem',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>कुल सार्वजनिक जिन्सी संख्या</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1e293b', marginTop: '0.25rem' }}>
              {assets.length} थान
            </div>
            <div style={{ fontSize: '0.75rem', color: '#0284c7', marginTop: '0.25rem' }}>मलेप खातामा अभिलेखिकृत</div>
          </div>
          <div style={{ background: '#f0f9ff', color: '#0284c7', padding: '0.75rem', borderRadius: '8px' }}>
            <Database size={24} />
          </div>
        </div>

        <div style={{
          background: '#fff',
          padding: '1.25rem',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>सम्पत्तिको प्रारम्भिक लागत मूल्य</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1e293b', marginTop: '0.25rem' }}>
              रु. {Number(totalCost).toLocaleString('ne-NP')}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>खरिद वा दाखिला रकम</div>
          </div>
          <div style={{ background: '#ecfdf5', color: '#047857', padding: '0.75rem', borderRadius: '8px' }}>
            <Coins size={24} />
          </div>
        </div>

        <div style={{
          background: '#fff',
          padding: '1.25rem',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>हालको किताबी मूल्य (Book Value)</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0284c7', marginTop: '0.25rem' }}>
              रु. {Number(totalBookVal).toLocaleString('ne-NP')}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '0.25rem' }}>वार्षिक ह्रासकट्टी समायोजन पश्चात</div>
          </div>
          <div style={{ background: '#eff6ff', color: '#2563eb', padding: '0.75rem', borderRadius: '8px' }}>
            <Tag size={24} />
          </div>
        </div>

        <div style={{
          background: '#fff',
          padding: '1.25rem',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>सञ्चालन अवस्था (Operational)</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#16a34a', marginTop: '0.25rem' }}>
              १००%
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>उपयोगमा रहेका वस्तुहरू</div>
          </div>
          <div style={{ background: '#f0fdf4', color: '#16a34a', padding: '0.75rem', borderRadius: '8px' }}>
            <CheckCircle size={24} />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        background: '#fff',
        padding: '1rem 1.25rem',
        borderRadius: '10px',
        border: '1px solid #e2e8f0',
        marginBottom: '1.5rem',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1rem',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', flex: 1, minWidth: '280px', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="जिन्सी संकेत, सामानको नाम वा जिम्मेवार व्यक्ति खोज्नुहोस्..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.55rem 1rem 0.55rem 2.5rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.875rem'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              padding: '0.55rem 1rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.875rem',
              background: '#fff'
            }}
          >
            <option value="all">सबै जिन्सी वर्ग (All Categories)</option>
            {ASSET_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div style={{
        background: '#fff',
        borderRadius: '10px',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <div className="dt-responsive-table-wrapper">
<table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
              <tr>
                <th style={{ padding: '0.75rem 1rem' }}>जिन्सी संकेत नं</th>
                <th style={{ padding: '0.75rem 1rem' }}>सम्पत्ति / सामानको नाम</th>
                <th style={{ padding: '0.75rem 1rem' }}>वर्ग (Category)</th>
                <th style={{ padding: '0.75rem 1rem' }}>शाखा / स्थान</th>
                <th style={{ padding: '0.75rem 1rem' }}>जिम्मेवार व्यक्ति</th>
                <th style={{ padding: '0.75rem 1rem' }}>प्रारम्भिक लागत</th>
                <th style={{ padding: '0.75rem 1rem' }}>किताबी मूल्य</th>
                <th style={{ padding: '0.75rem 1rem' }}>अवस्था</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>कार्य</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                    जिन्सी खाता लोड हुँदैछ...
                  </td>
                </tr>
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                    कुनै जिन्सी सामग्री फेला परेन।
                  </td>
                </tr>
              ) : (
                filteredList.map((a) => (
                  <tr key={a.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#0284c7' }}>
                      {a.assetCode}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ fontWeight: 600, color: '#1e293b' }}>{a.assetName}</div>
                      {a.modelOrPlateNo && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{a.modelOrPlateNo}</div>}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{
                        background: '#f0f9ff',
                        color: '#0369a1',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 600
                      }}>
                        {a.category}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div>{a.department}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{a.location || 'मुख्यालय'}</div>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 500 }}>
                      {a.custodianName}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#1e293b' }}>
                      रु. {Number(a.purchaseCost || 0).toLocaleString('ne-NP')}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#047857' }}>
                      रु. {Number(a.currentBookValue || a.purchaseCost || 0).toLocaleString('ne-NP')}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{
                        background: '#dcfce7',
                        color: '#15803d',
                        padding: '0.25rem 0.6rem',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: 600
                      }}>
                        {a.condition}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                                            <button
                        onClick={() => {
                          setInspectionAssetData(a);
                          setInspectionForm({ ...inspectionForm, condition: a.condition });
                          setShowInspectionModal(true);
                        }}
                        style={{
                          background: '#fef3c7',
                          color: '#d97706',
                          border: 'none',
                          padding: '0.35rem 0.6rem',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          fontSize: '0.85rem'
                        }}
                        title="निरिक्षण फारम भर्नुहोस्"
                      >
                        <AlertCircle size={14} /> निरिक्षण
                      </button>
                      <button
                        onClick={() => setTagModalData(a)}
                        title="QR ट्याग तथा मलेप कार्ड हेर्नुहोस्"
                        style={{
                          padding: '0.35rem 0.6rem',
                          background: '#f0f9ff',
                          border: '1px solid #bae6fd',
                          color: '#0284c7',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        <QrCode size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
</div>
        </div>
      </div>

      {/* Add Asset Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '650px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '1.5rem',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#1e293b' }}>
                नयाँ सार्वजनिक जिन्सी सामग्री दर्ता (मलेप फाराम)
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createMutation.mutate(formData);
              }}
            >
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  सामान / सम्पत्तिको नाम*
                </label>
                <input
                  type="text"
                  required
                  value={formData.assetName}
                  onChange={(e) => setFormData({ ...formData, assetName: e.target.value })}
                  placeholder="जस्तै: Dell PowerEdge सर्भर वा बा २ झ ४५२१ एम्बुलेन्स"
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    जिन्सी वर्ग (Category)*
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  >
                    {ASSET_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    सम्बन्धित शाखा / विभाग*
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="जस्तै: स्वास्थ्य शाखा"
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    जिम्मेवार व्यक्ति (Custodian)*
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.custodianName}
                    onChange={(e) => setFormData({ ...formData, custodianName: e.target.value })}
                    placeholder="जस्तै: सुरेश श्रेष्ठ (इन्चार्ज)"
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    स्थान / कोठा
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="थाङपालधाप कार्यपालिका भवन"
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    खरिद मूल्य (रु.)*
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.purchaseCost}
                    onChange={(e) => setFormData({ ...formData, purchaseCost: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    ह्रासकट्टी दर (%)
                  </label>
                  <input
                    type="number"
                    value={formData.depreciationRatePercent}
                    onChange={(e) => setFormData({ ...formData, depreciationRatePercent: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    मोडेल वा नम्बर प्लेट
                  </label>
                  <input
                    type="text"
                    value={formData.modelOrPlateNo}
                    onChange={(e) => setFormData({ ...formData, modelOrPlateNo: e.target.value })}
                    placeholder="बा १ क ७८९२"
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ padding: '0.6rem 1.25rem', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}
                >
                  रद्द गर्नुहोस्
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  style={{ padding: '0.6rem 1.5rem', background: '#0284c7', border: 'none', borderRadius: '6px', color: '#fff', cursor: 'pointer', fontWeight: 600 }}
                >
                  {createMutation.isPending ? 'दर्ता हुँदैछ...' : 'सुरक्षित गर्नुहोस्'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Asset Tag Modal */}
      {tagModalData && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '520px',
            padding: '1.5rem',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0369a1' }}>
                जिन्सी सम्पत्ति ट्याग (PAMS Asset Tag)
              </h3>
              <button
                onClick={() => setTagModalData(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{
              border: '2px solid #0284c7',
              borderRadius: '10px',
              padding: '1.25rem',
              background: '#f0f9ff',
              position: 'relative'
            }}>
              <div style={{ textAlign: 'center', borderBottom: '1px solid #bae6fd', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
                <div style={{ fontSize: '0.8rem', color: '#dc2626', fontWeight: 700 }}>नेपाल सरकार</div>
                <div style={{ fontSize: '1rem', color: '#0369a1', fontWeight: 700, marginTop: '0.2rem' }}>
                  पाँचपोखरी थाङपाल गाउँ कार्यपालिकाको कार्यालय
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#047857', marginTop: '0.25rem' }}>
                  सार्वजनिक जिन्सी परिचय ट्याग (मलेप फाराम नं. ४०७)
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px', gap: '1rem' }}>
                <div style={{ fontSize: '0.85rem', lineHeight: '1.6' }}>
                  <div><strong>जिन्सी संकेत:</strong> <span style={{ color: '#0284c7', fontWeight: 700 }}>{tagModalData.assetCode}</span></div>
                  <div><strong>सामान:</strong> {tagModalData.assetName}</div>
                  <div><strong>वर्ग:</strong> {tagModalData.category}</div>
                  <div><strong>शाखा:</strong> {tagModalData.department}</div>
                  <div><strong>जिम्मेवार:</strong> {tagModalData.custodianName}</div>
                  <div><strong>स्थान:</strong> {tagModalData.location || 'मुख्यालय'}</div>
                  <div><strong>किताबी मूल्य:</strong> रु. {Number(tagModalData.currentBookValue || tagModalData.purchaseCost).toLocaleString('ne-NP')}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fff', border: '1px solid #bae6fd', borderRadius: '8px', padding: '0.5rem' }}>
                  <QrCode size={64} color="#0284c7" />
                  <span style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '0.25rem', textAlign: 'center' }}>डिजिटल सम्पत्ति</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
              <button
                onClick={() => setTagModalData(null)}
                style={{ padding: '0.5rem 1rem', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}
              >
                बन्द गर्नुहोस्
              </button>
              <button
                onClick={() => window.print()}
                style={{ padding: '0.5rem 1.25rem', background: '#0284c7', border: 'none', borderRadius: '6px', color: '#fff', cursor: 'pointer', fontWeight: 600 }}
              >
                ट्याग प्रिन्ट गर्नुहोस्
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inspection Modal */}
      {showInspectionModal && inspectionAssetData && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem'
        }}>
          <div style={{
            background: '#fff', width: '100%', maxWidth: '600px',
            borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
            maxHeight: '90vh', overflowY: 'auto'
          }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc',
              borderRadius: '16px 16px 0 0'
            }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>डिजिटल जिन्सी निरिक्षण फारम</h2>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>{inspectionAssetData.assetCode} - {inspectionAssetData.assetName}</p>
              </div>
              <button onClick={() => setShowInspectionModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={24} />
              </button>
            </div>
            
            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>निरिक्षण मिति (वि.सं.)</label>
                  <input
                    type="text"
                    value={inspectionForm.dateBs}
                    onChange={(e) => setInspectionForm({ ...inspectionForm, dateBs: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>निरिक्षण गर्ने व्यक्तिको नाम</label>
                  <input
                    type="text"
                    placeholder="उदा: राम प्रसाद (शाखा अधिकृत)"
                    value={inspectionForm.inspector}
                    onChange={(e) => setInspectionForm({ ...inspectionForm, inspector: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>पाइएको अवस्था (Condition)</label>
                <select
                  value={inspectionForm.condition}
                  onChange={(e) => setInspectionForm({ ...inspectionForm, condition: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                >
                  <option>चालु अवस्थामा (Operational)</option>
                  <option>मर्मत सम्भार आवश्यक (Under Maintenance)</option>
                  <option>लिलाम बिक्री योग्य (Scrap / Auction)</option>
                  <option>निकासी / हस्तान्तरण सम्पन्न</option>
                </select>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>कैफियत तथा सुझाव (Remarks)</label>
                <textarea
                  rows={3}
                  value={inspectionForm.remarks}
                  onChange={(e) => setInspectionForm({ ...inspectionForm, remarks: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '8px', resize: 'vertical' }}
                  placeholder="निरिक्षण गर्दा देखिएका कुराहरू र सुझावहरू लेख्नुहोस्..."
                />
              </div>
              
              {/* Inspection History Log */}
              {Boolean(inspectionAssetData.inspections && inspectionAssetData.inspections.length > 0) && (
                <div style={{ marginBottom: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ fontSize: '0.9rem', color: '#0f172a', margin: '0 0 0.75rem', fontWeight: 600 }}>पछिल्ला निरिक्षणहरू (History)</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {(inspectionAssetData.inspections || []).map((insp: any, i: number, arr: any[]) => (
                      <div key={i} style={{ fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', borderBottom: i !== arr.length - 1 ? '1px solid #e2e8f0' : 'none', paddingBottom: i !== arr.length - 1 ? '0.5rem' : 0 }}>
                        <div>
                          <strong style={{ color: '#334155' }}>{insp.dateBs}</strong> • {insp.inspector}
                          <div style={{ color: '#64748b', marginTop: '0.2rem' }}>{insp.remarks}</div>
                        </div>
                        <span style={{ color: '#0ea5e9', fontWeight: 500 }}>{insp.condition}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  onClick={() => setShowInspectionModal(false)}
                  style={{ padding: '0.6rem 1.25rem', background: '#f1f5f9', border: 'none', borderRadius: '8px', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
                >
                  रद्द गर्नुहोस्
                </button>
                <button
                  onClick={() => inspectMutation.mutate(inspectionForm)}
                  disabled={inspectMutation.isPending || !inspectionForm.inspector}
                  style={{ padding: '0.6rem 1.25rem', background: '#0ea5e9', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 600, cursor: 'pointer', opacity: (!inspectionForm.inspector || inspectMutation.isPending) ? 0.6 : 1 }}
                >
                  {inspectMutation.isPending ? 'सेभ गर्दै...' : 'निरिक्षण रेकर्ड गर्नुहोस्'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AssetsPamsPage;

