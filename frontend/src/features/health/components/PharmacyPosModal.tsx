import React, { useState, useEffect } from 'react';
import {
  X,
  Printer,
  Plus,
  Trash2,
  Search,
  ShoppingCart,
  ShieldCheck,
  CreditCard,
  QrCode,
  FileText,
  User,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { sectoralApi } from '../../../api/sectoral';
import type { MedicineStockItem, MedicineBatch, HealthPrescription } from '../../../types/health';

interface CartItem {
  medicineName: string;
  genericName?: string;
  batchNo: string;
  expiryDate: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  availableStock: number;
  isInsuranceCovered: boolean;
}

interface PharmacyPosModalProps {
  onClose: () => void;
  onSuccess: (saleData: any) => void;
}

export const PharmacyPosModal: React.FC<PharmacyPosModalProps> = ({ onClose, onSuccess }) => {
  // Queries for data
  const { data: medicines = [] } = useQuery<MedicineStockItem[]>({
    queryKey: ['health-medicines-pos'],
    queryFn: () => sectoralApi.getMedicineStock(),
  });

  const { data: batches = [] } = useQuery({
    queryKey: ['health-batches-pos'],
    queryFn: () => sectoralApi.getMedicineBatches(),
  });

  const { data: prescriptions = [] } = useQuery({
    queryKey: ['health-prescriptions-pos'],
    queryFn: () => sectoralApi.getPrescriptions({ status: 'pending' }),
  });

  // Billing Header States
  const [patientName, setPatientName] = useState('सामान्य सेवाग्राही');
  const [patientNo, setPatientNo] = useState('');
  const [isInsured, setIsInsured] = useState(false);
  const [insuranceNumber, setInsuranceNumber] = useState('');
  const [copayPercent, setCopayPercent] = useState<number>(10);
  const [paymentMode, setPaymentMode] = useState<'cash' | 'fonepay_qr' | 'mixed' | 'insurance_claim'>('cash');
  const [cashReceived, setCashReceived] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [selectedPrescriptionNo, setSelectedPrescriptionNo] = useState('');

  // Cart & Line Items
  const [cart, setCart] = useState<CartItem[]>([]);

  // Item input row
  const [searchMed, setSearchMed] = useState('');
  const [selectedMed, setSelectedMed] = useState<MedicineStockItem | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<MedicineBatch | null>(null);
  const [inputQty, setInputQty] = useState<number>(1);
  const [inputRate, setInputRate] = useState<number>(0);

  // Filtered medicines for autocomplete
  const filteredMeds = medicines.filter(
    (m: any) => {
      const name = m?.medicineName || m?.medicine_name || '';
      const generic = m?.genericName || m?.generic_name || '';
      const query = (searchMed || '').toLowerCase();
      return name.toLowerCase().includes(query) || generic.toLowerCase().includes(query);
    },
  );

  // Available batches for selected medicine
  const medBatches = batches.filter(
    (b: any) => {
      if (!selectedMed) return false;
      const bName = b?.medicineName || b?.medicine_name || '';
      const sName = (selectedMed as any)?.medicineName || (selectedMed as any)?.medicine_name || '';
      const stock = b?.stockQuantity ?? b?.stock_quantity ?? 0;
      return bName.toLowerCase() === sName.toLowerCase() && stock > 0;
    },
  );

  // Select medicine
  const handleSelectMedicine = (med: any) => {
    setSelectedMed(med);
    const mName = med?.medicineName || med?.medicine_name || '';
    setSearchMed(mName);

    // Auto-select earliest expiry batch (FEFO)
    const available = batches.filter(
      (b: any) => {
        const bName = b?.medicineName || b?.medicine_name || '';
        const stock = b?.stockQuantity ?? b?.stock_quantity ?? 0;
        return bName.toLowerCase() === mName.toLowerCase() && stock > 0;
      },
    );
    if (available.length > 0) {
      setSelectedBatch(available[0]);
      setInputRate(Number(available[0]?.salesRate || (available[0] as any)?.sales_rate) || 5);
    } else {
      setSelectedBatch(null);
      setInputRate(5);
    }
  };

  // Add Item to Cart
  const handleAddToCart = () => {
    if (!selectedMed) return;
    const qty = Number(inputQty) || 1;
    const rate = Number(inputRate) || 0;
    const selMedName = (selectedMed as any)?.medicineName || (selectedMed as any)?.medicine_name || 'औषधि';
    const selBatchNo = selectedBatch?.batchNo || (selectedBatch as any)?.batch_no || 'DEFAULT';

    const existingIdx = cart.findIndex(
      (item) => item.medicineName === selMedName && item.batchNo === selBatchNo,
    );

    if (existingIdx >= 0) {
      const updated = [...cart];
      updated[existingIdx].quantity += qty;
      updated[existingIdx].totalAmount = updated[existingIdx].quantity * updated[existingIdx].unitPrice;
      setCart(updated);
    } else {
      setCart([
        ...cart,
        {
          medicineName: selMedName,
          genericName: (selectedMed as any)?.genericName || (selectedMed as any)?.generic_name || '',
          batchNo: selBatchNo,
          expiryDate: selectedBatch?.expiryDate || (selectedBatch as any)?.expiry_date || '२०८३/०४/३०',
          unit: selectedMed.unit || 'ट्याब्लेट',
          quantity: qty,
          unitPrice: rate,
          totalAmount: qty * rate,
          availableStock: selectedBatch?.stockQuantity ?? (selectedBatch as any)?.stock_quantity ?? selectedMed.stockQuantity ?? (selectedMed as any)?.stock_quantity ?? 100,
          isInsuranceCovered: true,
        },
      ]);
    }

    // Reset line input
    setSelectedMed(null);
    setSelectedBatch(null);
    setSearchMed('');
    setInputQty(1);
    setInputRate(0);
  };

  const handleRemoveFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  // 1-Click Load from Doctor's E-Prescription
  const handleImportPrescription = (rx: HealthPrescription) => {
    setSelectedPrescriptionNo(rx.rxNumber);
    setPatientName(rx.patientName);
    setPatientNo(rx.patientNo);
    setIsInsured(rx.isInsured);
    setInsuranceNumber(rx.insuranceNumber || '');
    if (rx.isInsured) setCopayPercent(10);

    // Auto-populate cart with prescribed medicines
    const newItems: CartItem[] = [];
    if (Array.isArray(rx.medicines)) {
      rx.medicines.forEach((m: any) => {
        const mName = m?.medicineName || m?.medicine_name || '';
        // Match batch
        const batch = batches.find(
          (b: any) => {
            const bName = b?.medicineName || b?.medicine_name || '';
            const stock = b?.stockQuantity ?? b?.stock_quantity ?? 0;
            return bName.toLowerCase() === mName.toLowerCase() && stock > 0;
          },
        );
        const bRate = Number(batch?.salesRate || (batch as any)?.sales_rate) || 4.5;
        const bStock = batch?.stockQuantity ?? (batch as any)?.stock_quantity ?? 100;
        newItems.push({
          medicineName: mName,
          batchNo: batch?.batchNo || (batch as any)?.batch_no || 'FEFO-DEF',
          expiryDate: batch?.expiryDate || (batch as any)?.expiry_date || '२०८३/०४/३०',
          unit: 'ट्याब्लेट',
          quantity: Number(m.quantity) || 10,
          unitPrice: bRate,
          totalAmount: (Number(m.quantity) || 10) * bRate,
          availableStock: bStock,
          isInsuranceCovered: true,
        });
      });
    }
    setCart(newItems);
  };

  // Financial Calculations
  const subTotal = cart.reduce((sum, item) => sum + item.totalAmount, 0);
  const totalAmount = Math.max(0, subTotal - Number(discountAmount || 0));
  const copayAmount = isInsured ? Math.round(totalAmount * (copayPercent / 100)) : totalAmount;
  const insuranceClaimAmount = isInsured ? totalAmount - copayAmount : 0;
  const changeReturned = Math.max(0, Number(cashReceived || 0) - copayAmount);

  // Submit Bill
  const handleSubmitBill = () => {
    if (cart.length === 0) {
      alert('कृपया कम्तीमा एउटा औषधि कार्टमा थप्नुहोस्!');
      return;
    }

    const payload = {
      patientName,
      patientNo,
      prescriptionNo: selectedPrescriptionNo || null,
      isInsured,
      insuranceNumber: isInsured ? insuranceNumber : null,
      subTotal,
      discountAmount,
      totalAmount,
      copayPercent: isInsured ? copayPercent : 0,
      copayAmount,
      insuranceClaimAmount,
      paymentMode,
      cashReceived: Number(cashReceived) || copayAmount,
      changeReturned,
      items: cart,
    };

    onSuccess(payload);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
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
          maxWidth: '1050px',
          height: '92vh',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 24px',
            backgroundColor: '#0f172a',
            color: '#ffffff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShoppingCart size={22} color="#38bdf8" />
            <div>
              <span style={{ fontWeight: 800, fontSize: '1.05rem' }}>
                फार्मेसी काउन्टर बिलिङ तथा बिक्री (Pharmacy POS Counter)
              </span>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                पाँचपोखरी प्राथमिक आधारभूत अस्पताल | FEFO मौज्दात प्रणाली
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

        {/* Modal Body: Split into Left (Cart & Items) and Right (Customer, Prescriptions, Summary) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', flex: 1, overflow: 'hidden' }}>
          {/* ── LEFT PANEL: Item Selection & Cart ── */}
          <div
            style={{
              padding: '16px 20px',
              overflowY: 'auto',
              borderRight: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            {/* Quick Item Search & Add Bar */}
            <div
              style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '10px',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#334155' }}>
                🔍 औषधि छनोट (द्रुत खोज तथा FEFO ब्याच छनोट)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.3fr 1fr 1fr auto', gap: '8px' }}>
                {/* Search / Select Medicine */}
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="औषधिको नाम वा जेनेरिक नाम..."
                    value={searchMed}
                    onChange={(e) => setSearchMed(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '7px 10px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.82rem',
                    }}
                  />
                  {searchMed && !selectedMed && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        backgroundColor: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        maxHeight: '180px',
                        overflowY: 'auto',
                        zIndex: 100,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      }}
                    >
                      {filteredMeds.slice(0, 8).map((m: any) => {
                        const mName = m?.medicineName || m?.medicine_name || '';
                        const gName = m?.genericName || m?.generic_name || m?.unit || '';
                        const stock = m?.stockQuantity ?? m?.stock_quantity ?? 0;
                        return (
                          <div
                            key={m.id}
                            onClick={() => handleSelectMedicine(m)}
                            style={{
                              padding: '6px 10px',
                              cursor: 'pointer',
                              fontSize: '0.8rem',
                              borderBottom: '1px solid #f1f5f9',
                            }}
                          >
                            <strong>{mName}</strong>
                            <span style={{ fontSize: '0.72rem', color: '#64748b', marginLeft: '6px' }}>
                              ({gName}) | मौज्दात: {stock}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Batch Selector (FEFO) */}
                <select
                  value={selectedBatch?.batchNo || (selectedBatch as any)?.batch_no || ''}
                  onChange={(e) => {
                    const b = medBatches.find((item: any) => (item?.batchNo || item?.batch_no) === e.target.value);
                    if (b) {
                      setSelectedBatch(b);
                      setInputRate(Number(b.salesRate || (b as any)?.sales_rate) || 5);
                    }
                  }}
                  disabled={!selectedMed || medBatches.length === 0}
                  style={{
                    padding: '7px 8px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.8rem',
                    backgroundColor: '#ffffff',
                  }}
                >
                  <option value="">-- FEFO ब्याच छनोट --</option>
                  {medBatches.map((b: any) => {
                    const bNo = b?.batchNo || b?.batch_no || '';
                    const exp = b?.expiryDate || b?.expiry_date || '';
                    const stock = b?.stockQuantity ?? b?.stock_quantity ?? 0;
                    return (
                      <option key={b.id} value={bNo}>
                        {bNo} (म्याद: {exp} | मौज्दात: {stock})
                      </option>
                    );
                  })}
                </select>

                {/* Quantity */}
                <input
                  type="number"
                  min="1"
                  placeholder="संख्या"
                  value={inputQty}
                  onChange={(e) => setInputQty(Math.max(1, parseInt(e.target.value) || 1))}
                  style={{
                    padding: '7px 8px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.82rem',
                    textAlign: 'center',
                  }}
                />

                {/* Rate */}
                <input
                  type="number"
                  placeholder="बिक्री दर"
                  value={inputRate}
                  onChange={(e) => setInputRate(parseFloat(e.target.value) || 0)}
                  style={{
                    padding: '7px 8px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.82rem',
                    textAlign: 'right',
                  }}
                />

                {/* Add Button */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={!selectedMed}
                  style={{
                    backgroundColor: selectedMed ? '#0284c7' : '#94a3b8',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '7px 14px',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: selectedMed ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Plus size={16} />
                  <span>थप्नुहोस्</span>
                </button>
              </div>
            </div>

            {/* Cart Items Table */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e293b', marginBottom: '6px' }}>
                बिल आइटमहरू ({cart.length} औषधिहरू)
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f1f5f9', color: '#475569', textAlign: 'left' }}>
                    <th style={{ padding: '8px 10px' }}>क्र.सं.</th>
                    <th style={{ padding: '8px 10px' }}>औषधिको नाम</th>
                    <th style={{ padding: '8px 10px' }}>ब्याच नं</th>
                    <th style={{ padding: '8px 10px' }}>म्याद</th>
                    <th style={{ padding: '8px 10px', textAlign: 'center' }}>परिमाण</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right' }}>दर (रु.)</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right' }}>जम्मा (रु.)</th>
                    <th style={{ padding: '8px 10px', textAlign: 'center' }}>कार्य</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                        कार्ट खाली छ। माथिबाट औषधि छनोट गर्नुहोस् वा दायाँबाट डाक्टरको पुर्जी लोड गर्नुहोस्।
                      </td>
                    </tr>
                  ) : (
                    cart.map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '8px 10px', color: '#64748b' }}>{idx + 1}</td>
                        <td style={{ padding: '8px 10px', fontWeight: 700 }}>
                          {item.medicineName}
                          {item.genericName && (
                            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{item.genericName}</div>
                          )}
                        </td>
                        <td style={{ padding: '8px 10px', fontFamily: 'monospace' }}>{item.batchNo}</td>
                        <td style={{ padding: '8px 10px', color: '#d97706', fontSize: '0.75rem', fontWeight: 600 }}>
                          {item.expiryDate}
                        </td>
                        <td style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 700 }}>
                          {item.quantity} {item.unit}
                        </td>
                        <td style={{ padding: '8px 10px', textAlign: 'right' }}>
                          रु. {item.unitPrice.toFixed(2)}
                        </td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>
                          रु. {item.totalAmount.toFixed(2)}
                        </td>
                        <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => handleRemoveFromCart(idx)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#ef4444',
                              cursor: 'pointer',
                              padding: '2px',
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── RIGHT PANEL: Prescriptions & Billing Summary ── */}
          <div
            style={{
              padding: '16px 20px',
              overflowY: 'auto',
              backgroundColor: '#f8fafc',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            {/* Quick 1-Click Load from Doctor Prescriptions */}
            <div
              style={{
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '10px',
                padding: '10px 12px',
              }}
            >
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#1e40af', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileText size={15} />
                <span>१-क्लिक ई-प्रेस्क्रिप्सन आयात (Doctor Rx Sync)</span>
              </div>
              <div style={{ maxHeight: '100px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {prescriptions.slice(0, 4).map((rx) => (
                  <div
                    key={rx.id}
                    onClick={() => handleImportPrescription(rx)}
                    style={{
                      padding: '5px 8px',
                      borderRadius: '6px',
                      backgroundColor: selectedPrescriptionNo === rx.rxNumber ? '#dbeafe' : '#ffffff',
                      border: '1px solid #cbd5e1',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <strong>{rx.patientName}</strong> ({rx.patientNo})
                      <div style={{ fontSize: '0.68rem', color: '#64748b' }}>{rx.medicines?.length || 0} प्रकारका औषधि</div>
                    </div>
                    <span style={{ fontSize: '0.68rem', color: '#0284c7', fontWeight: 700 }}>
                      {rx.rxNumber} ➔
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Patient & Health Insurance Form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>ग्राहक तथा बिरामी विवरण</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="बिरामीको नाम"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  style={{ padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                />
                <input
                  type="text"
                  placeholder="MRN नं (PT-2081-XXXX)"
                  value={patientNo}
                  onChange={(e) => setPatientNo(e.target.value)}
                  style={{ padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                />
              </div>

              {/* Insurance Checkbox */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: isInsured ? '#f0fdf4' : '#ffffff',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: `1px solid ${isInsured ? '#86efac' : '#cbd5e1'}`,
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: isInsured ? '#166534' : '#334155',
                }}
              >
                <input
                  type="checkbox"
                  checked={isInsured}
                  onChange={(e) => setIsInsured(e.target.checked)}
                />
                <ShieldCheck size={16} color={isInsured ? '#16a34a' : '#64748b'} />
                <span>स्वास्थ्य बीमा सेवाग्राही (Health Insurance Member)</span>
              </label>

              {/* Insurance Policy Input & Co-payment Rate */}
              {isInsured && (
                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="बीमा कार्ड नं (HIB-XXXXX)"
                    value={insuranceNumber}
                    onChange={(e) => setInsuranceNumber(e.target.value)}
                    style={{
                      padding: '6px 8px',
                      borderRadius: '6px',
                      border: '1px solid #86efac',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                    }}
                  />
                  <select
                    value={copayPercent}
                    onChange={(e) => setCopayPercent(parseInt(e.target.value, 10))}
                    style={{
                      padding: '6px 8px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.8rem',
                      backgroundColor: '#ffffff',
                    }}
                  >
                    <option value={10}>१०% Co-Pay (प्राथमिक)</option>
                    <option value={20}>२०% Co-Pay (विशेषज्ञ)</option>
                    <option value={0}>०% Co-Pay (निःशुल्क)</option>
                  </select>
                </div>
              )}
            </div>

            {/* Billing Breakdown & Co-Payment Calculation */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                fontSize: '0.85rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                <span>उप-जम्मा (Sub-Total):</span>
                <span>रु. {subTotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748b' }}>छुट (Discount):</span>
                <input
                  type="number"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                  style={{
                    width: '90px',
                    padding: '3px 6px',
                    borderRadius: '4px',
                    border: '1px solid #cbd5e1',
                    textAlign: 'right',
                    fontSize: '0.8rem',
                  }}
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontWeight: 800,
                  fontSize: '1rem',
                  borderTop: '1px solid #e2e8f0',
                  paddingTop: '6px',
                  marginTop: '2px',
                }}
              >
                <span>कुल बिल रकम:</span>
                <span style={{ color: '#0f172a' }}>रु. {totalAmount.toFixed(2)}</span>
              </div>

              {/* Health Insurance Co-pay Split Display */}
              {isInsured && (
                <div
                  style={{
                    backgroundColor: '#f0fdf4',
                    border: '1px dashed #86efac',
                    borderRadius: '8px',
                    padding: '8px',
                    marginTop: '4px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#166534', fontWeight: 700 }}>
                    <span>सह-भुक्तानी (Co-Pay {copayPercent}% - नगद):</span>
                    <span style={{ color: '#dc2626' }}>रु. {copayAmount.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#166534', fontSize: '0.78rem' }}>
                    <span>बीमा दावी रकम (Claim to HIB):</span>
                    <span style={{ fontWeight: 800 }}>रु. {insuranceClaimAmount.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {/* Cash Tender & Change */}
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '6px', marginTop: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 700, color: '#334155' }}>नगद प्राप्त (Cash Tender):</span>
                  <input
                    type="number"
                    value={cashReceived}
                    onChange={(e) => setCashReceived(parseFloat(e.target.value) || 0)}
                    placeholder={String(copayAmount)}
                    style={{
                      width: '100px',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      border: '1px solid #cbd5e1',
                      textAlign: 'right',
                      fontWeight: 800,
                      fontSize: '0.9rem',
                    }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b' }}>
                  <span>फिर्ता रकम (Change):</span>
                  <strong style={{ color: '#059669' }}>रु. {changeReturned.toFixed(2)}</strong>
                </div>
              </div>
            </div>

            {/* Payment Mode Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setPaymentMode('cash')}
                style={{
                  padding: '8px',
                  borderRadius: '6px',
                  border: '1px solid',
                  borderColor: paymentMode === 'cash' ? '#0284c7' : '#cbd5e1',
                  backgroundColor: paymentMode === 'cash' ? '#e0f2fe' : '#ffffff',
                  color: paymentMode === 'cash' ? '#0369a1' : '#475569',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <CreditCard size={15} />
                <span>नगद (Cash)</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMode('fonepay_qr')}
                style={{
                  padding: '8px',
                  borderRadius: '6px',
                  border: '1px solid',
                  borderColor: paymentMode === 'fonepay_qr' ? '#dc2626' : '#cbd5e1',
                  backgroundColor: paymentMode === 'fonepay_qr' ? '#fef2f2' : '#ffffff',
                  color: paymentMode === 'fonepay_qr' ? '#b91c1c' : '#475569',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <QrCode size={15} />
                <span>फोनपे / QR</span>
              </button>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
              <button
                type="button"
                onClick={handleSubmitBill}
                disabled={cart.length === 0}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: '8px',
                  backgroundColor: cart.length === 0 ? '#94a3b8' : '#16a34a',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  cursor: cart.length === 0 ? 'not-allowed' : 'pointer',
                  boxShadow: '0 2px 4px rgba(22, 163, 74, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <Printer size={17} />
                <span>बिल जारी तथा प्रिन्ट गर्नुहोस्</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
