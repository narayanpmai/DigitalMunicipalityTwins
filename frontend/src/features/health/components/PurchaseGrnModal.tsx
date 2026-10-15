import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, FileCheck2, Building2, Calendar, Truck, DollarSign } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { sectoralApi } from '../../../api/sectoral';
import type { HealthSupplier, HealthPurchaseItem } from '../../../types/health';
import { getHealthMedUnits } from '../healthSettingsStorage';

interface PurchaseGrnModalProps {
  onClose: () => void;
  onSuccess: (data: any) => void;
}

export const PurchaseGrnModal: React.FC<PurchaseGrnModalProps> = ({ onClose, onSuccess }) => {
  const [medUnits, setMedUnits] = useState(() => getHealthMedUnits());

  useEffect(() => {
    const handleSettingsChange = () => setMedUnits(getHealthMedUnits());
    window.addEventListener('p5-health-settings-changed', handleSettingsChange);
    return () => window.removeEventListener('p5-health-settings-changed', handleSettingsChange);
  }, []);

  const { data: suppliers = [] } = useQuery({
    queryKey: ['health-suppliers-list'],
    queryFn: () => sectoralApi.getSuppliers(),
  });

  const [invoiceNo, setInvoiceNo] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [purchaseDateBs, setPurchaseDateBs] = useState('२०८१/०५/१५');
  const [paymentStatus, setPaymentStatus] = useState('paid');
  const [receivedBy, setReceivedBy] = useState('स्टोर अधिकृत नवराज खड्का');
  const [remarks, setRemarks] = useState('');
  const [discountAmount, setDiscountAmount] = useState<number>(0);

  // Line items
  const [items, setItems] = useState<HealthPurchaseItem[]>([
    {
      medicineName: 'Paracetamol 500mg',
      genericName: 'Paracetamol',
      batchNo: 'PCM-81-05',
      expiryDate: '२०८३/०६/३०',
      quantity: 1000,
      freeQuantity: 50,
      unit: 'ट्याब्लेट',
      purchaseRate: 1.2,
      salesRate: 1.5,
      totalAmount: 1200,
    },
  ]);

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        medicineName: '',
        genericName: '',
        batchNo: `B-${Math.floor(Math.random() * 90000 + 10000)}`,
        expiryDate: '२०८३/०४/३०',
        quantity: 100,
        freeQuantity: 0,
        unit: 'ट्याब्लेट',
        purchaseRate: 0,
        salesRate: 0,
        totalAmount: 0,
      },
    ]);
  };

  const handleUpdateItem = (index: number, field: keyof HealthPurchaseItem, val: any) => {
    const updated = [...items];
    (updated[index] as any)[field] = val;

    if (field === 'quantity' || field === 'purchaseRate') {
      const q = Number(updated[index].quantity) || 0;
      const r = Number(updated[index].purchaseRate) || 0;
      updated[index].totalAmount = q * r;
      if (!updated[index].salesRate || field === 'purchaseRate') {
        updated[index].salesRate = Math.round(r * 1.2 * 10) / 10;
      }
    }

    setItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const subTotal = items.reduce((sum, it) => sum + (Number(it.totalAmount) || 0), 0);
  const totalAmount = Math.max(0, subTotal - Number(discountAmount || 0));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierName) {
      alert('कृपया आपूर्तिकर्ताको नाम छनोट वा प्रविष्टि गर्नुहोस्!');
      return;
    }
    if (items.some((it) => !it.medicineName)) {
      alert('कृपया सबै औषधिहरूको नाम भर्नुहोस्!');
      return;
    }

    const payload = {
      invoiceNo: invoiceNo || `INV-${Date.now()}`,
      supplierName,
      supplierId: supplierId || null,
      purchaseDateBs,
      healthFacilityName: 'पाँचपोखरी आधारभूत अस्पताल',
      wardNumber: 6,
      subTotal,
      discountAmount,
      taxAmount: 0,
      totalAmount,
      paymentStatus,
      receivedBy,
      remarks,
      items,
    };

    onSuccess(payload);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '950px',
          maxHeight: '90vh',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 24px',
            backgroundColor: '#0f172a',
            color: '#ffffff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileCheck2 size={22} color="#38bdf8" />
            <div>
              <span style={{ fontWeight: 800, fontSize: '1.05rem' }}>
                नयाँ खरिद दाखिला प्रतिवेदन (Goods Receipt Note - GRN)
              </span>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                म.ले.प. फाराम नं ४०३/४०१ ढाँचा | औषधि तथा जिन्सी आम्दानी
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#94a3b8',
              padding: '4px',
            }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Purchase Meta Fields */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '12px',
                backgroundColor: '#f8fafc',
                padding: '14px',
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
              }}
            >
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  आपूर्तिकर्ता (Supplier):
                </label>
                <select
                  value={supplierName}
                  onChange={(e) => {
                    setSupplierName(e.target.value);
                    const s = suppliers.find((sub) => sub.supplierName === e.target.value);
                    if (s) setSupplierId(s.id);
                  }}
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.82rem',
                    backgroundColor: '#ffffff',
                  }}
                  required
                >
                  <option value="">-- आपूर्तिकर्ता छनोट --</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.supplierName}>
                      {s.supplierName} (प्यान: {s.panVatNumber || 'N/A'})
                    </option>
                  ))}
                  <option value="नयाँ आपूर्तिकर्ता / बजार खरिद">नयाँ आपूर्तिकर्ता / बजार खरिद</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  सप्लायर बिल/बीजक नं:
                </label>
                <input
                  type="text"
                  placeholder="उदा: INV-9842"
                  value={invoiceNo}
                  onChange={(e) => setInvoiceNo(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.82rem',
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  दाखिला मिति (वि.सं.):
                </label>
                <input
                  type="text"
                  value={purchaseDateBs}
                  onChange={(e) => setPurchaseDateBs(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.82rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  भुक्तानी स्थिति:
                </label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.82rem',
                    backgroundColor: '#ffffff',
                  }}
                >
                  <option value="paid">भुक्तानी भइसकेको (Paid)</option>
                  <option value="credit">बाँकी / उधारो (Credit)</option>
                  <option value="partial">आंशिक भुक्तानी (Partial)</option>
                </select>
              </div>
            </div>

            {/* Line Items Table */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#1e293b' }}>
                  दाखिला हुने औषधि तथा स्वास्थ्य सामग्रीहरू ({items.length} आइटम)
                </div>
                <button
                  type="button"
                  onClick={handleAddItem}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '5px 12px',
                    backgroundColor: '#0284c7',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <Plus size={15} />
                  <span>+ लाइन थप्नुहोस्</span>
                </button>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f1f5f9', color: '#475569', textAlign: 'left' }}>
                      <th style={{ padding: '8px', width: '35px' }}>#</th>
                      <th style={{ padding: '8px', minWidth: '170px' }}>औषधि नाम</th>
                      <th style={{ padding: '8px', width: '110px' }}>ब्याच नं</th>
                      <th style={{ padding: '8px', width: '110px' }}>म्याद (Expiry)</th>
                      <th style={{ padding: '8px', width: '75px' }}>परिमाण</th>
                      <th style={{ padding: '8px', width: '75px' }}>बोनस (Free)</th>
                      <th style={{ padding: '8px', width: '85px' }}>एकाइ</th>
                      <th style={{ padding: '8px', width: '85px' }}>खरिद दर (रु.)</th>
                      <th style={{ padding: '8px', width: '85px' }}>बिक्री दर (MRP)</th>
                      <th style={{ padding: '8px', width: '95px', textAlign: 'right' }}>जम्मा (रु.)</th>
                      <th style={{ padding: '8px', width: '40px', textAlign: 'center' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '6px 8px', color: '#64748b' }}>{idx + 1}</td>
                        <td style={{ padding: '6px 8px' }}>
                          <input
                            type="text"
                            placeholder="औषधिको नाम"
                            value={item.medicineName}
                            onChange={(e) => handleUpdateItem(idx, 'medicineName', e.target.value)}
                            style={{ width: '100%', padding: '5px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.78rem' }}
                            required
                          />
                        </td>
                        <td style={{ padding: '6px 8px' }}>
                          <input
                            type="text"
                            placeholder="ब्याच नं"
                            value={item.batchNo}
                            onChange={(e) => handleUpdateItem(idx, 'batchNo', e.target.value)}
                            style={{ width: '100%', padding: '5px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.78rem', fontFamily: 'monospace' }}
                            required
                          />
                        </td>
                        <td style={{ padding: '6px 8px' }}>
                          <input
                            type="text"
                            placeholder="२०८३/०४/३०"
                            value={item.expiryDate}
                            onChange={(e) => handleUpdateItem(idx, 'expiryDate', e.target.value)}
                            style={{ width: '100%', padding: '5px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.78rem' }}
                            required
                          />
                        </td>
                        <td style={{ padding: '6px 8px' }}>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleUpdateItem(idx, 'quantity', parseInt(e.target.value) || 0)}
                            style={{ width: '100%', padding: '5px 6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.78rem', textAlign: 'center' }}
                            required
                          />
                        </td>
                        <td style={{ padding: '6px 8px' }}>
                          <input
                            type="number"
                            min="0"
                            value={item.freeQuantity}
                            onChange={(e) => handleUpdateItem(idx, 'freeQuantity', parseInt(e.target.value) || 0)}
                            style={{ width: '100%', padding: '5px 6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.78rem', textAlign: 'center' }}
                          />
                        </td>
                        <td style={{ padding: '6px 8px' }}>
                          <select
                            value={item.unit}
                            onChange={(e) => handleUpdateItem(idx, 'unit', e.target.value)}
                            style={{ width: '100%', padding: '5px 4px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.75rem', backgroundColor: '#fff' }}
                          >
                            {medUnits.map((u) => (
                              <option key={u.id} value={u.nameNepali || u.name}>
                                {u.nameNepali || u.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td style={{ padding: '6px 8px' }}>
                          <input
                            type="number"
                            step="0.01"
                            value={item.purchaseRate}
                            onChange={(e) => handleUpdateItem(idx, 'purchaseRate', parseFloat(e.target.value) || 0)}
                            style={{ width: '100%', padding: '5px 6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.78rem', textAlign: 'right' }}
                            required
                          />
                        </td>
                        <td style={{ padding: '6px 8px' }}>
                          <input
                            type="number"
                            step="0.01"
                            value={item.salesRate}
                            onChange={(e) => handleUpdateItem(idx, 'salesRate', parseFloat(e.target.value) || 0)}
                            style={{ width: '100%', padding: '5px 6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.78rem', textAlign: 'right' }}
                            required
                          />
                        </td>
                        <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>
                          रु. {Number(item.totalAmount || 0).toFixed(2)}
                        </td>
                        <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            disabled={items.length <= 1}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: items.length <= 1 ? '#cbd5e1' : '#ef4444',
                              cursor: items.length <= 1 ? 'not-allowed' : 'pointer',
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Remarks & Totals */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '16px', alignItems: 'flex-start' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  कैफियत / प्रयोजन (Remarks):
                </label>
                <textarea
                  rows={3}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="आर्थिक वर्षको नियमित खरिद वा आकस्मिक आपूर्ति सम्बन्धी विवरण..."
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                />
              </div>

              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  fontSize: '0.85rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                  <span>कुल खरिद रकम (Subtotal):</span>
                  <span>रु. {subTotal.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748b' }}>छुट रकम (Discount):</span>
                  <input
                    type="number"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                    style={{ width: '100px', padding: '3px 6px', borderRadius: '4px', border: '1px solid #cbd5e1', textAlign: 'right', fontSize: '0.8rem' }}
                  />
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontWeight: 900,
                    fontSize: '1.1rem',
                    color: '#0f172a',
                    borderTop: '1px solid #cbd5e1',
                    paddingTop: '6px',
                    marginTop: '2px',
                  }}
                >
                  <span>दाखिला हुने खुद रकम:</span>
                  <span>रु. {totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div
            style={{
              padding: '14px 24px',
              backgroundColor: '#f8fafc',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
              💡 यो फारम सुरक्षित गरेपछि स्टोरको मौज्दात र ब्याच (FEFO) स्वतः अद्यावधिक हुनेछ।
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#475569',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                }}
              >
                रद्द गर्नुहोस्
              </button>
              <button
                type="submit"
                style={{
                  padding: '8px 20px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(2, 132, 199, 0.25)',
                }}
              >
                दाखिला सुरक्षित गर्नुहोस् (Save GRN)
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
