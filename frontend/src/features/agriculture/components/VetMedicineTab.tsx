import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  agricultureApi,
  VetMedicine,
  VetDistribution,
  AgricultureFarmer,
} from '../../../api/agriculture';
import {
  Pill,
  Plus,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  Package,
  History,
  Search,
  X,
  PlusCircle,
  MinusCircle,
  AlertCircle
} from 'lucide-react';
import '../agriculture-pro.css';

export const VetMedicineTab: React.FC = () => {
  const queryClient = useQueryClient();
  const [subTab, setSubTab] = useState<'inventory' | 'distributions'>('inventory');
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  React.useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Modals
  const [showAddMedicine, setShowAddMedicine] = useState(false);
  const [newMedicine, setNewMedicine] = useState<Partial<VetMedicine>>({
    medicineName: '',
    batchNumber: '',
    unit: 'Vial',
    stockQuantity: 50,
  });

  const [showDistribute, setShowDistribute] = useState(false);
  const [distData, setDistData] = useState<Partial<VetDistribution>>({
    medicineId: '',
    farmerId: '',
    animalType: 'गाई/भैँसी',
    quantityGiven: 1,
    remarks: '',
  });

  const [showStockModal, setShowStockModal] = useState<VetMedicine | null>(null);
  const [stockAmount, setStockAmount] = useState<number>(10);
  const [stockAction, setStockAction] = useState<'add' | 'reduce'>('add');

  // Queries
  const { data: medicines = [], isLoading: loadingMeds } = useQuery({
    queryKey: ['vet-medicines'],
    queryFn: () => agricultureApi.getMedicines(),
  });

  const { data: distributions = [], isLoading: loadingDist } = useQuery({
    queryKey: ['vet-distributions'],
    queryFn: () => agricultureApi.getDistributions(),
  });

  const { data: farmers = [] } = useQuery({
    queryKey: ['farmers-simple'],
    queryFn: () => agricultureApi.getFarmers(),
  });

  // Mutations
  const addMedicineMutation = useMutation({
    mutationFn: (data: Partial<VetMedicine>) => agricultureApi.createMedicine(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vet-medicines'] });
      setShowAddMedicine(false);
      setNewMedicine({ medicineName: '', batchNumber: '', unit: 'Vial', stockQuantity: 50 });
      setToastMessage({ type: 'success', text: 'नयाँ औषधि सफलतापूर्वक दर्ता भयो!' });
    },
    onError: (err: any) => {
      setToastMessage({ type: 'error', text: 'त्रुटि: ' + (err.response?.data?.message || err.message) });
    },
  });

  const distributeMutation = useMutation({
    mutationFn: (data: VetDistribution) => agricultureApi.distributeMedicine(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vet-medicines'] });
      queryClient.invalidateQueries({ queryKey: ['vet-distributions'] });
      setShowDistribute(false);
      setDistData({ medicineId: '', farmerId: '', animalType: 'गाई/भैँसी', quantityGiven: 1, remarks: '' });
      setToastMessage({ type: 'success', text: 'औषधि सफलतापूर्वक वितरण गरियो!' });
    },
    onError: (err: any) => {
      setToastMessage({ type: 'error', text: 'त्रुटि: ' + (err.response?.data?.message || err.message) });
    },
  });

  const updateStockMutation = useMutation({
    mutationFn: ({ id, amount, type }: { id: string; amount: number; type: 'add' | 'reduce' }) =>
      agricultureApi.updateStock(id, amount, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vet-medicines'] });
      setShowStockModal(null);
      setToastMessage({ type: 'success', text: 'स्टक सफलतापूर्वक अद्यावधिक गरियो!' });
    },
    onError: (err: any) => {
      setToastMessage({ type: 'error', text: 'त्रुटि: ' + (err.response?.data?.message || err.message) });
    },
  });

  const filteredMedicines = medicines.filter((m) =>
    !searchTerm || m.medicineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.batchNumber && m.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredDistributions = distributions.filter((d) =>
    !searchTerm || d.farmerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.animalType && d.animalType.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (d.remarks && d.remarks.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            padding: '0.85rem 1.25rem',
            borderRadius: '10px',
            backgroundColor: toastMessage.type === 'success' ? '#065f46' : '#991b1b',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontWeight: 700,
            fontSize: '0.88rem',
            boxShadow: '0 8px 20px rgba(0,0,0,0.15)'
          }}
        >
          {toastMessage.type === 'success' ? <CheckCircle2 size={18} className="text-emerald-300" /> : <AlertCircle size={18} />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Top Header & Actions */}
      <div className="agri-glass-card" style={{ padding: '1.1rem 1.4rem', display: 'flex', flexWrap: 'wrap', gap: '0.85rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Sub-tabs */}
          <button
            onClick={() => setSubTab('inventory')}
            className={`dt-btn ${subTab === 'inventory' ? 'dt-btn-primary' : 'dt-btn-outline'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Package size={16} />
            <span>औषधि भण्डार मौज्दात ({medicines.length})</span>
          </button>
          <button
            onClick={() => setSubTab('distributions')}
            className={`dt-btn ${subTab === 'distributions' ? 'dt-btn-primary' : 'dt-btn-outline'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <History size={16} />
            <span>निःशुल्क वितरण रेकर्ड ({distributions.length})</span>
          </button>

          {/* Search */}
          <div style={{ position: 'relative', minWidth: '200px' }}>
            <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="औषधि, कृषक नं, ब्याच खोज्नुहोस्..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="dt-input"
              style={{ paddingLeft: '2rem' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setShowDistribute(true)}
            className="dt-btn dt-btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#059669', borderColor: '#059669' }}
          >
            <UserCheck size={16} />
            <span>कृषकलाई औषधि वितरण</span>
          </button>
          <button
            onClick={() => setShowAddMedicine(true)}
            className="dt-btn dt-btn-outline"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={16} />
            <span>नयाँ औषधि थप्नुहोस्</span>
          </button>
        </div>
      </div>

      {/* Sub-Tab 1: Inventory Table */}
      {subTab === 'inventory' && (
        <div className="dt-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Pill size={18} color="#0284c7" /> पशुरोग निदान तथा भेटेरिनरी औषधि मौज्दात
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              पालिकाको केन्द्रीय भेटेरिनरी स्टोर
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="dt-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-muted, #f8fafc)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.8rem' }}>औषधिको नाम</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.8rem' }}>ब्याच नम्बर</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontSize: '0.8rem' }}>स्टक मौज्दात</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontSize: '0.8rem' }}>म्याद सकिने मिति</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontSize: '0.8rem' }}>स्टक अवस्था</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontSize: '0.8rem' }}>कार्य</th>
                </tr>
              </thead>
              <tbody>
                {loadingMeds ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      लोड हुँदैछ...
                    </td>
                  </tr>
                ) : filteredMedicines.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      कुनै औषधि रेकर्ड फेला परेन।
                    </td>
                  </tr>
                ) : (
                  filteredMedicines.map((med) => {
                    const isLow = med.stockQuantity < 15;
                    const isOut = med.stockQuantity <= 0;
                    return (
                      <tr key={med.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>
                          {med.medicineName}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                          {med.batchNumber || '-'}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 800, fontSize: '0.95rem' }}>
                          <span style={{ color: isOut ? '#dc2626' : (isLow ? '#d97706' : '#16a34a') }}>
                            {med.stockQuantity} {med.unit}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {med.expiryDate ? new Date(med.expiryDate).toLocaleDateString() : '-'}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                          {isOut ? (
                            <span style={{ padding: '2px 8px', borderRadius: '9999px', background: '#fee2e2', color: '#991b1b', fontSize: '0.72rem', fontWeight: 700 }}>
                              समाप्त
                            </span>
                          ) : isLow ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '2px 8px', borderRadius: '9999px', background: '#fef3c7', color: '#92400e', fontSize: '0.72rem', fontWeight: 700 }}>
                              <AlertTriangle size={11} /> न्यून स्टक
                            </span>
                          ) : (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '2px 8px', borderRadius: '9999px', background: '#dcfce7', color: '#16a34a', fontSize: '0.72rem', fontWeight: 700 }}>
                              <CheckCircle2 size={11} /> पर्याप्त
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                          <button
                            onClick={() => {
                              setShowStockModal(med);
                              setStockAmount(10);
                              setStockAction('add');
                            }}
                            className="dt-btn dt-btn-outline"
                            style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                          >
                            स्टक घटबढ
                          </button>
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

      {/* Sub-Tab 2: Distributions Table */}
      {subTab === 'distributions' && (
        <div className="dt-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <History size={18} color="#059669" /> निःशुल्क भेटेरिनरी औषधि तथा खोप वितरण अभिलेख
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              कुल {distributions.length} वितरणहरू रेकर्ड गरिएको
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="dt-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-muted, #f8fafc)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.8rem' }}>मिति</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.8rem' }}>औषधिको नाम</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.8rem' }}>कृषक आइडी (Farmer ID)</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.8rem' }}>पशुको प्रकार</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontSize: '0.8rem' }}>परिमाण</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.8rem' }}>प्रयोजन / कैफियत</th>
                </tr>
              </thead>
              <tbody>
                {loadingDist ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      लोड हुँदैछ...
                    </td>
                  </tr>
                ) : filteredDistributions.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      कुनै वितरण रेकर्ड फेला परेन।
                    </td>
                  </tr>
                ) : (
                  filteredDistributions.map((dist) => (
                    <tr key={dist.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {dist.distributedDate ? new Date(dist.distributedDate).toLocaleDateString() : '-'}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>
                        {dist.medicine?.medicineName || 'औषधि'}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', fontWeight: 700, color: '#0284c7' }}>
                        {dist.farmerId}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.8rem' }}>
                        {dist.animalType || '-'}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 700, color: '#059669' }}>
                        {dist.quantityGiven} {dist.medicine?.unit || ''}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {dist.remarks || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Medicine Modal */}
      {showAddMedicine && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '1rem' }}>
          <div className="dt-card" style={{ maxWidth: '500px', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4 style={{ margin: 0, fontWeight: 700 }}>नयाँ भेटेरिनरी औषधि दर्ता</h4>
              <button onClick={() => setShowAddMedicine(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                addMedicineMutation.mutate(newMedicine);
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
            >
              <div>
                <label className="dt-label">औषधिको नाम *</label>
                <input
                  type="text"
                  required
                  placeholder="उदा: खोरेत भ्याक्सिन, अल्बेन्डाजोल, आदि"
                  value={newMedicine.medicineName || ''}
                  onChange={(e) => setNewMedicine({ ...newMedicine, medicineName: e.target.value })}
                  className="dt-input"
                />
              </div>

              <div className="agri-grid-2">
                <div>
                  <label className="dt-label">ब्याच नम्बर</label>
                  <input
                    type="text"
                    placeholder="उदा: BATCH-2026-01"
                    value={newMedicine.batchNumber || ''}
                    onChange={(e) => setNewMedicine({ ...newMedicine, batchNumber: e.target.value })}
                    className="dt-input"
                  />
                </div>
                <div>
                  <label className="dt-label">इकाई (Unit) *</label>
                  <select
                    value={newMedicine.unit || 'Vial'}
                    onChange={(e) => setNewMedicine({ ...newMedicine, unit: e.target.value })}
                    className="dt-select"
                  >
                    <option value="Vial">Vial</option>
                    <option value="Bottle">Bottle</option>
                    <option value="Bolus">Bolus</option>
                    <option value="Tube">Tube</option>
                    <option value="Sachet">Sachet</option>
                    <option value="Packet">Packet</option>
                  </select>
                </div>
              </div>

              <div className="agri-grid-2">
                <div>
                  <label className="dt-label">प्रारम्भिक स्टक मात्रा *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newMedicine.stockQuantity || 0}
                    onChange={(e) => setNewMedicine({ ...newMedicine, stockQuantity: Number(e.target.value) })}
                    className="dt-input"
                  />
                </div>
                <div>
                  <label className="dt-label">म्याद सकिने मिति</label>
                  <input
                    type="date"
                    value={newMedicine.expiryDate ? new Date(newMedicine.expiryDate).toISOString().slice(0, 10) : ''}
                    onChange={(e) => setNewMedicine({ ...newMedicine, expiryDate: e.target.value })}
                    className="dt-input"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowAddMedicine(false)} className="dt-btn dt-btn-outline">
                  रद्द
                </button>
                <button type="submit" disabled={addMedicineMutation.isPending} className="dt-btn dt-btn-primary">
                  {addMedicineMutation.isPending ? 'दर्ता हुँदैछ...' : 'औषधि सुरक्षित गर्नुहोस्'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Distribute Medicine Modal */}
      {showDistribute && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '1rem' }}>
          <div className="dt-card" style={{ maxWidth: '520px', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4 style={{ margin: 0, fontWeight: 700, color: '#059669' }}>कृषकलाई निःशुल्क औषधि/भ्याक्सिन वितरण</h4>
              <button onClick={() => setShowDistribute(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                distributeMutation.mutate(distData as VetDistribution);
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
            >
              <div>
                <label className="dt-label">औषधि छनोट गर्नुहोस् *</label>
                <select
                  required
                  value={distData.medicineId || ''}
                  onChange={(e) => setDistData({ ...distData, medicineId: e.target.value })}
                  className="dt-select"
                >
                  <option value="">-- औषधि छान्नुहोस् --</option>
                  {medicines.map((m) => (
                    <option key={m.id} value={m.id} disabled={m.stockQuantity <= 0}>
                      {m.medicineName} (मौज्दात: {m.stockQuantity} {m.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="dt-label">कृषक आइडी (Farmer ID) *</label>
                <input
                  type="text"
                  required
                  placeholder="उदा: KMP-2081-001"
                  value={distData.farmerId || ''}
                  onChange={(e) => setDistData({ ...distData, farmerId: e.target.value })}
                  className="dt-input"
                  list="registered-farmers-list"
                />
                <datalist id="registered-farmers-list">
                  {farmers.map((f) => (
                    <option key={f.id} value={f.farmerId}>
                      {f.fullName} (वडा {f.wardNumber})
                    </option>
                  ))}
                </datalist>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  सुझाव: दर्ता कृषकको नम्बर टाइप गर्दा स्वतः सुझाव आउँछ।
                </div>
              </div>

              <div className="agri-grid-2">
                <div>
                  <label className="dt-label">पशुको प्रकार *</label>
                  <select
                    value={distData.animalType || 'गाई/भैँसी'}
                    onChange={(e) => setDistData({ ...distData, animalType: e.target.value })}
                    className="dt-select"
                  >
                    <option value="गाई/गोरु">गाई/गोरु</option>
                    <option value="भैँसी/राँगा">भैँसी/राँगा</option>
                    <option value="बाख्रा/च्याङ्ग्रा">बाख्रा/च्याङ्ग्रा</option>
                    <option value="चौंरी/याक">चौंरी/याक</option>
                    <option value="कुखुरा/हाँस">कुखुरा/हाँस</option>
                    <option value="अन्य">अन्य</option>
                  </select>
                </div>
                <div>
                  <label className="dt-label">वितरण परिमाण *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={distData.quantityGiven || 1}
                    onChange={(e) => setDistData({ ...distData, quantityGiven: Number(e.target.value) })}
                    className="dt-input"
                  />
                </div>
              </div>

              <div>
                <label className="dt-label">प्रयोजन / कैफियत</label>
                <input
                  type="text"
                  placeholder="उदा: खोरेत रोकथाम, जुकाको औषधि, थुनेलो उपचार"
                  value={distData.remarks || ''}
                  onChange={(e) => setDistData({ ...distData, remarks: e.target.value })}
                  className="dt-input"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowDistribute(false)} className="dt-btn dt-btn-outline">
                  रद्द
                </button>
                <button type="submit" disabled={distributeMutation.isPending} className="dt-btn dt-btn-primary" style={{ background: '#059669', borderColor: '#059669' }}>
                  {distributeMutation.isPending ? 'वितरण हुँदैछ...' : 'वितरण दर्ता गर्नुहोस्'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Adjust Modal */}
      {showStockModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '1rem' }}>
          <div className="dt-card" style={{ maxWidth: '420px', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4 style={{ margin: 0, fontWeight: 700 }}>स्टक मौज्दात अद्यावधिक</h4>
              <button onClick={() => setShowStockModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '-0.5rem' }}>
              औषधि: <strong>{showStockModal.medicineName}</strong> (हाल: {showStockModal.stockQuantity} {showStockModal.unit})
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateStockMutation.mutate({
                  id: showStockModal.id,
                  amount: stockAmount,
                  type: stockAction,
                });
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
            >
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setStockAction('add')}
                  className={`dt-btn ${stockAction === 'add' ? 'dt-btn-primary' : 'dt-btn-outline'}`}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                >
                  <PlusCircle size={14} /> स्टक थप्नुहोस्
                </button>
                <button
                  type="button"
                  onClick={() => setStockAction('reduce')}
                  className={`dt-btn ${stockAction === 'reduce' ? 'dt-btn-primary' : 'dt-btn-outline'}`}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                >
                  <MinusCircle size={14} /> स्टक घटाउनुहोस्
                </button>
              </div>

              <div>
                <label className="dt-label">मात्रा ({showStockModal.unit}) *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={stockAmount}
                  onChange={(e) => setStockAmount(Number(e.target.value))}
                  className="dt-input"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowStockModal(null)} className="dt-btn dt-btn-outline">
                  रद्द
                </button>
                <button type="submit" disabled={updateStockMutation.isPending} className="dt-btn dt-btn-primary">
                  {updateStockMutation.isPending ? 'अद्यावधिक हुँदैछ...' : 'स्टक सुरक्षित गर्नुहोस्'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
