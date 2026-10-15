import React, { useState } from 'react';
import { X, ArrowRightLeft, AlertOctagon, CheckCircle2, Building2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { sectoralApi } from '../../../api/sectoral';
import type { MedicineStockItem, MedicineBatch } from '../../../types/health';

interface StockTransferModalProps {
  onClose: () => void;
  onSuccess: (data: any) => void;
}

const FACILITY_OPTIONS = [
  'गाउँपालिका केन्द्रीय भण्डार (तिपेनी)',
  'पाँचपोखरी प्राथमिक अस्पताल (१५ शय्या)',
  'बाँसखर्क स्वास्थ्य चौकी तथा बर्थिङ सेन्टर (वडा १)',
  'बरुवा स्वास्थ्य चौकी तथा बर्थिङ सेन्टर (वडा २)',
  'भोताङ प्राथमिक स्वास्थ्य केन्द्र (वडा ३)',
  'छिम्ती सामुदायिक स्वास्थ्य एकाइ (वडा ३)',
  'मानेखर्क स्वास्थ्य चौकी तथा प्रसूति गृह (वडा ४)',
  'गुन्सा स्वास्थ्य चौकी (वडा ५)',
  'थाङपालधाप गाउँ घर क्लिनिक (वडा ६)',
  'भोटेनाम्लाङ स्वास्थ्य चौकी (वडा ७)',
  'लाँगर्चे स्वास्थ्य चौकी (वडा ८)',
  'फार्मेसी डिस्पेन्सरी (Pharmacy Counter)',
  'आकस्मिक कक्ष (Emergency Ward)',
  'प्रसूति वार्ड (Maternity Ward)',
  'गाउँपालिका औषधि विसर्जन समिति (डम्पिङ साइट)',
];

export const StockTransferModal: React.FC<StockTransferModalProps> = ({ onClose, onSuccess }) => {
  const { data: batches = [] } = useQuery({
    queryKey: ['health-batches-transfer'],
    queryFn: () => sectoralApi.getMedicineBatches(),
  });

  const [transferType, setTransferType] = useState<'internal_issue' | 'inter_facility' | 'emergency_reallocation' | 'disposal_expired'>('inter_facility');
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [manualMedicineName, setManualMedicineName] = useState('');
  const [manualBatchNo, setManualBatchNo] = useState('');
  const [manualUnit, setManualUnit] = useState('Tablets');
  const [fromLocation, setFromLocation] = useState('गाउँपालिका केन्द्रीय भण्डार (तिपेनी)');
  const [toLocation, setToLocation] = useState('पाँचपोखरी प्राथमिक अस्पताल (१५ शय्या)');
  const [quantity, setQuantity] = useState<number>(100);
  const [transferDateBs, setTransferDateBs] = useState('२०८१/०५/२५');
  const [requestedBy, setRequestedBy] = useState('स्वास्थ्य संस्था प्रमुख');
  const [issuedBy, setIssuedBy] = useState('स्टोर किपर');
  const [status, setStatus] = useState<'completed' | 'in_transit'>('completed');
  const [remarks, setRemarks] = useState('');

  const selectedBatch = batches.find((b) => b.id === selectedBatchId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const medName = selectedBatch ? selectedBatch.medicineName : manualMedicineName.trim();
    if (!medName) {
      alert('कृपया औषधि र ब्याच छनोट गर्नुहोस् वा औषधिको नाम लेख्नुहोस्!');
      return;
    }

    if (selectedBatch && quantity > selectedBatch.stockQuantity) {
      alert(`मौज्दात भन्दा बढी परिमाण निकासा गर्न मिल्दैन! उपलब्ध: ${selectedBatch.stockQuantity}`);
      return;
    }

    const payload = {
      transferType,
      fromLocation: transferType === 'disposal_expired' ? 'अस्पताल स्टोर' : fromLocation,
      toLocation: transferType === 'disposal_expired' ? 'गाउँपालिका औषधि विसर्जन समिति' : toLocation,
      medicineName: medName,
      batchNo: selectedBatch ? selectedBatch.batchNo : (manualBatchNo.trim() || 'GEN-2081'),
      quantity: Number(quantity),
      unit: selectedBatch?.unit || manualUnit || 'Tablets',
      transferDateBs,
      requestedBy,
      issuedBy,
      status,
      remarks,
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
          maxWidth: '640px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 20px',
            backgroundColor: '#0f172a',
            color: '#ffffff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ArrowRightLeft size={18} color="#38bdf8" />
            <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>
              औषधि मौज्दात ट्रान्सफर तथा मिन्हा (Stock Transfer / Reallocation)
            </span>
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
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto' }}>
          {/* Transfer Type Select */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              स्थानान्तरणको प्रकार छनोट गर्नुहोस्:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                onClick={() => {
                  setTransferType('inter_facility');
                  setFromLocation('गाउँपालिका केन्द्रीय भण्डार (तिपेनी)');
                  setToLocation('पाँचपोखरी प्राथमिक अस्पताल (१५ शय्या)');
                }}
                style={{
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: '1.5px solid',
                  borderColor: transferType === 'inter_facility' ? '#4f46e5' : '#cbd5e1',
                  backgroundColor: transferType === 'inter_facility' ? '#eef2ff' : '#ffffff',
                  color: transferType === 'inter_facility' ? '#4338ca' : '#475569',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                🏢 अन्तर-संस्था स्थानान्तरण
              </button>
              <button
                type="button"
                onClick={() => {
                  setTransferType('emergency_reallocation');
                  setFromLocation('पाँचपोखरी प्राथमिक अस्पताल (१५ शय्या)');
                  setToLocation('भोताङ प्राथमिक स्वास्थ्य केन्द्र (वडा ३)');
                }}
                style={{
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: '1.5px solid',
                  borderColor: transferType === 'emergency_reallocation' ? '#ea580c' : '#cbd5e1',
                  backgroundColor: transferType === 'emergency_reallocation' ? '#fff7ed' : '#ffffff',
                  color: transferType === 'emergency_reallocation' ? '#c2410c' : '#475569',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                🚨 आपतकालीन पुनःवितरण
              </button>
              <button
                type="button"
                onClick={() => {
                  setTransferType('internal_issue');
                  setFromLocation('अस्पताल भण्डार (Main Store)');
                  setToLocation('फार्मेसी डिस्पेन्सरी (Pharmacy Counter)');
                }}
                style={{
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: '1.5px solid',
                  borderColor: transferType === 'internal_issue' ? '#0284c7' : '#cbd5e1',
                  backgroundColor: transferType === 'internal_issue' ? '#e0f2fe' : '#ffffff',
                  color: transferType === 'internal_issue' ? '#0369a1' : '#475569',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                📦 आन्तरिक निकासा (Store to Ward)
              </button>
              <button
                type="button"
                onClick={() => {
                  setTransferType('disposal_expired');
                  setFromLocation('अस्पताल भण्डार');
                  setToLocation('गाउँपालिका औषधि विसर्जन समिति');
                }}
                style={{
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: '1.5px solid',
                  borderColor: transferType === 'disposal_expired' ? '#ef4444' : '#cbd5e1',
                  backgroundColor: transferType === 'disposal_expired' ? '#fef2f2' : '#ffffff',
                  color: transferType === 'disposal_expired' ? '#b91c1c' : '#475569',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                ⚠️ म्याद नाघेको मिन्हा (Disposal)
              </button>
            </div>
          </div>

          {/* Locations */}
          {transferType !== 'disposal_expired' ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  कहाँबाट निकासा (From):
                </label>
                <input
                  list="facility-options-from"
                  type="text"
                  value={fromLocation}
                  onChange={(e) => setFromLocation(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                  required
                />
                <datalist id="facility-options-from">
                  {FACILITY_OPTIONS.map((f) => (
                    <option key={f} value={f} />
                  ))}
                </datalist>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  कहाँ प्राप्त हुने (To):
                </label>
                <input
                  list="facility-options-to"
                  type="text"
                  value={toLocation}
                  onChange={(e) => setToLocation(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                  required
                />
                <datalist id="facility-options-to">
                  {FACILITY_OPTIONS.map((f) => (
                    <option key={f} value={f} />
                  ))}
                </datalist>
              </div>
            </div>
          ) : (
            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 14px', fontSize: '0.78rem', color: '#991b1b' }}>
              ⚠️ म्याद नाघेका वा बिग्रिएका औषधिहरू मुचुल्का उठाएर विसर्जन गर्दा स्टकबाट परिमाण स्वतः घट्नेछ र लेखा परीक्षणका लागि मिन्हा अभिलेख सुरक्षित रहनेछ।
            </div>
          )}

          {/* Medicine and Batch selector */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
              औषधि तथा ब्याच छनोट गर्नुहोस्:
            </label>
            {batches.length > 0 ? (
              <select
                value={selectedBatchId}
                onChange={(e) => {
                  setSelectedBatchId(e.target.value);
                  const b = batches.find((x) => x.id === e.target.value);
                  if (b) {
                    setManualMedicineName(b.medicineName);
                    setManualBatchNo(b.batchNo);
                    setManualUnit(b.unit || 'Tablets');
                  }
                }}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.82rem',
                  backgroundColor: '#ffffff',
                }}
              >
                <option value="">-- मौज्दात ब्याचबाट छनोट गर्नुहोस् --</option>
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.medicineName} | ब्याच: {b.batchNo} | म्याद: {b.expiryDate} (उपलब्ध: {b.stockQuantity} {b.unit})
                  </option>
                ))}
              </select>
            ) : null}

            {(!selectedBatch || batches.length === 0) && (
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr', gap: '8px', marginTop: '6px' }}>
                <input
                  type="text"
                  placeholder="औषधिको नाम (उदा. Paracetamol 500mg)"
                  value={manualMedicineName}
                  onChange={(e) => setManualMedicineName(e.target.value)}
                  style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                  required={!selectedBatch}
                />
                <input
                  type="text"
                  placeholder="ब्याच नं (उदा. PCM-2024-08A)"
                  value={manualBatchNo}
                  onChange={(e) => setManualBatchNo(e.target.value)}
                  style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                />
                <input
                  type="text"
                  placeholder="एकाइ (Tablets)"
                  value={manualUnit}
                  onChange={(e) => setManualUnit(e.target.value)}
                  style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                />
              </div>
            )}
          </div>

          {/* Quantity, Date & Status */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                निकासा परिमाण:
              </label>
              <input
                type="number"
                min="1"
                max={selectedBatch?.stockQuantity || 100000}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 800 }}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                मिति (वि.सं.):
              </label>
              <input
                type="text"
                value={transferDateBs}
                onChange={(e) => setTransferDateBs(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                स्थानान्तरण स्थिति:
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem', backgroundColor: '#fff' }}
              >
                <option value="completed">✓ सम्पन्न (Completed)</option>
                <option value="in_transit">🚚 बाटोमा (In Transit)</option>
              </select>
            </div>
          </div>

          {/* Personnel */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                माग गर्ने व्यक्ति / पद:
              </label>
              <input
                type="text"
                value={requestedBy}
                onChange={(e) => setRequestedBy(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                निकासा/जारी गर्ने:
              </label>
              <input
                type="text"
                value={issuedBy}
                onChange={(e) => setIssuedBy(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
              />
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
              कैफियत (Remarks):
            </label>
            <input
              type="text"
              placeholder="प्रयोजन वा माग फाराम नम्बर..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
            />
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '9px 16px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#475569',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
              }}
            >
              रद्द गर्नुहोस्
            </button>
            <button
              type="submit"
              style={{
                padding: '9px 20px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: transferType === 'disposal_expired' ? '#dc2626' : '#4f46e5',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.84rem',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(79, 70, 229, 0.3)',
              }}
            >
              {transferType === 'disposal_expired' ? 'मिन्हा पुष्टि गर्नुहोस्' : 'स्थानान्तरण सम्पन्न गर्नुहोस्'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
