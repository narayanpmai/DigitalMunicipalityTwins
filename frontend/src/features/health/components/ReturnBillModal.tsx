import React, { useState } from 'react';
import {
  X,
  RotateCcw,
  Search,
  AlertTriangle,
  CheckCircle2,
  Printer,
  Calendar,
  DollarSign,
  User,
  FileText,
  Clock,
} from 'lucide-react';
import { sectoralApi } from '../../../api/sectoral';
import type { HealthPosSale } from '../../../types/health';

interface ReturnBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ReturnBillModal: React.FC<ReturnBillModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [billSearchTerm, setBillSearchTerm] = useState('');
  const [searching, setSearching] = useState(false);
  const [foundSale, setFoundSale] = useState<HealthPosSale | null>(null);
  const [searchError, setSearchError] = useState('');

  // Return Form State
  const [returnItems, setReturnItems] = useState<
    {
      medicineName: string;
      batchNo: string;
      unit: string;
      unitPrice: number;
      soldQty: number;
      returnQty: number;
      refundAmount: number;
    }[]
  >([]);
  const [returnReason, setReturnReason] = useState('चिकित्सकले औषधि परिवर्तन गरेको');
  const [refundMode, setRefundMode] = useState<'cash' | 'adjustment'>('cash');
  const [returnedBy, setReturnedBy] = useState('फार्मासिस्ट (Hospital Pharmacy)');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedReturn, setCompletedReturn] = useState<any | null>(null);

  if (!isOpen) return null;

  const handleSearchBill = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!billSearchTerm.trim()) return;

    setSearching(true);
    setSearchError('');
    setFoundSale(null);
    setReturnItems([]);
    setCompletedReturn(null);

    try {
      const sale = await sectoralApi.searchPosSaleByBill(billSearchTerm.trim());
      if (sale && sale.id) {
        setFoundSale(sale);
        // Prepare items array
        const rawItems = (sale as any).items || [];
        const mapped = rawItems.map((item: any) => ({
          medicineName: item.medicineName || item.name || 'औषधि',
          batchNo: item.batchNo || 'BATCH-01',
          unit: item.unit || 'ट्याब्लेट',
          unitPrice: Number(item.unitPrice || item.rate || 0),
          soldQty: Number(item.quantity || item.qty || 1),
          returnQty: 0,
          refundAmount: 0,
        }));
        setReturnItems(mapped);
      } else {
        setSearchError('उक्त बिल नम्बर फेला परेन। कृपया पुनः जाँच गर्नुहोस्।');
      }
    } catch (err: any) {
      setSearchError('बिल खोज्दा समस्या भयो वा उक्त बिल नम्बर भेटिएन।');
    } finally {
      setSearching(false);
    }
  };

  const handleReturnQtyChange = (idx: number, qty: number) => {
    setReturnItems((prev) => {
      const next = [...prev];
      const maxAllowed = next[idx].soldQty;
      const safeQty = Math.max(0, Math.min(maxAllowed, qty));
      next[idx].returnQty = safeQty;
      next[idx].refundAmount = safeQty * next[idx].unitPrice;
      return next;
    });
  };

  const totalRefundAmount = returnItems.reduce((acc, curr) => acc + curr.refundAmount, 0);
  const totalReturnQty = returnItems.reduce((acc, curr) => acc + curr.returnQty, 0);

  const handleSubmitReturn = async () => {
    if (!foundSale) return;
    if (totalReturnQty <= 0) {
      alert('कृपया फिर्ता गर्न कम्तीमा १ औषधिको संख्या राख्नुहोस्।');
      return;
    }

    setIsSubmitting(true);
    try {
      const activeItemsToReturn = returnItems
        .filter((item) => item.returnQty > 0)
        .map((item) => ({
          medicineName: item.medicineName,
          batchNo: item.batchNo,
          unit: item.unit,
          quantity: item.returnQty,
          unitPrice: item.unitPrice,
          refundAmount: item.refundAmount,
        }));

      const isFull = returnItems.every((item) => item.returnQty === item.soldQty);

      const payload = {
        originalBillNo: (foundSale as any).billNumber || (foundSale as any).bill_no || foundSale.id,
        patientNo: (foundSale as any).patientNo || (foundSale as any).patient_no,
        patientName: (foundSale as any).patientName || (foundSale as any).patient_name,
        items: activeItemsToReturn,
        totalRefundAmount: totalRefundAmount,
        refundMode,
        returnReason,
        returnedBy,
        wardNumber: (foundSale as any).wardNumber || 0,
        isFullReturn: isFull,
      };

      const result = await sectoralApi.createPosReturn(payload);
      setCompletedReturn(result);
      onSuccess();
    } catch (err: any) {
      console.error('Error submitting return bill:', err);
      alert('बिल फिर्ता गर्दा त्रुटि भयो। कृपया पुनः प्रयास गर्नुहोस्।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
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
        id="printableReturnSlip"
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '1rem',
          maxWidth: '820px',
          width: '100%',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
          border: '1.5px solid #e2e8f0',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          className="no-print"
          style={{
            padding: '1.25rem 1.5rem',
            background: 'linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <RotateCcw size={22} color="#ffffff" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>
                फार्मेसी बिल फिर्ता तथा सोधभर्ना (Returns Bill / Sales Refund)
              </h3>
              <div style={{ fontSize: '0.75rem', color: '#fecaca', marginTop: '0.15rem' }}>
                पहिले जारी भएको बिल खोजेर औषधि फिर्ता लिने र स्टक पुनः थप्ने प्रणाली
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Completed Return Voucher State */}
          {completedReturn ? (
            <div style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: '#dcfce7',
                  color: '#16a34a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                }}
              >
                <CheckCircle2 size={36} />
              </div>
              <h4 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#166534', margin: '0 0 0.5rem' }}>
                बिल फिर्ता सफलतापूर्वक सम्पन्न भयो!
              </h4>
              <p style={{ color: '#4b5563', fontSize: '0.85rem', margin: '0 0 1.25rem' }}>
                फिर्ता भौचर नम्बर:{' '}
                <strong style={{ color: '#b91c1c', fontFamily: 'monospace', fontSize: '1.1rem' }}>
                  {completedReturn.return_no || completedReturn.returnNo}
                </strong>
                <br />
                औषधिहरू पुनः फार्मेसी स्टकमा थपिएका छन् र रकम फिर्ता हिसाब गरिएको छ।
              </p>

              <div
                style={{
                  background: '#f8fafc',
                  border: '1.5px dashed #cbd5e1',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  maxWidth: '480px',
                  margin: '0 auto 1.5rem',
                  textAlign: 'left',
                  fontSize: '0.85rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ color: '#64748b' }}>मूल बिल नं.:</span>
                  <strong>{completedReturn.original_bill_no || completedReturn.originalBillNo}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ color: '#64748b' }}>सेवाग्राही:</span>
                  <strong>{completedReturn.patient_name || completedReturn.patientName}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ color: '#64748b' }}>फिर्ता रकम (Refund Amount):</span>
                  <strong style={{ color: '#b91c1c', fontSize: '1.1rem' }}>
                    रु. {Number(completedReturn.total_refund_amount || completedReturn.totalRefundAmount || 0).toLocaleString()}
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>फिर्ता कारण:</span>
                  <span>{completedReturn.return_reason || completedReturn.returnReason}</span>
                </div>
              </div>

              <div className="no-print" style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
                <button
                  onClick={() => window.print()}
                  style={{
                    background: '#1e293b',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.6rem 1.25rem',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                  }}
                >
                  <Printer size={16} /> रसिद प्रिन्ट गर्नुहोस्
                </button>
                <button
                  onClick={onClose}
                  style={{
                    background: '#e2e8f0',
                    color: '#1e293b',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.6rem 1.25rem',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  बन्द गर्नुहोस्
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Step 1: Search Original Bill */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '1rem',
                }}
              >
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                  १. मूल बिल नम्बर खोज्नुहोस् (Search Original Bill Number) *
                </label>
                <form onSubmit={handleSearchBill} style={{ display: 'flex', gap: '0.5rem' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                      type="text"
                      placeholder="बिल नम्बर हान्नुहोस् (उदा: BILL-2610...)..."
                      value={billSearchTerm}
                      onChange={(e) => setBillSearchTerm(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.75rem 0.5rem 2.2rem',
                        border: '1.5px solid #cbd5e1',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={searching || !billSearchTerm.trim()}
                    style={{
                      background: '#b91c1c',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.5rem 1.2rem',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      opacity: searching ? 0.7 : 1,
                    }}
                  >
                    <Search size={15} />
                    <span>{searching ? 'खोज्दै...' : 'बिल खोज्नुहोस्'}</span>
                  </button>
                </form>

                {searchError && (
                  <div style={{ marginTop: '0.5rem', color: '#dc2626', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <AlertTriangle size={14} /> {searchError}
                  </div>
                )}
              </div>

              {/* Step 2: Found Bill Details */}
              {foundSale && (
                <div>
                  <div
                    style={{
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                      borderRadius: '10px',
                      padding: '0.85rem 1rem',
                      marginBottom: '1rem',
                      display: 'flex',
                      flexWrap: 'wrap',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.82rem',
                    }}
                  >
                    <div>
                      <span style={{ color: '#64748b' }}>सेवाग्राही:</span>{' '}
                      <strong style={{ color: '#0f172a' }}>{(foundSale as any).patientName || (foundSale as any).patient_name}</strong>{' '}
                      <span style={{ color: '#64748b' }}>({(foundSale as any).patientNo || 'Walk-in'})</span>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>कुल बिक्री रकम:</span>{' '}
                      <strong style={{ color: '#0f172a' }}>रु. {Number((foundSale as any).totalAmount || (foundSale as any).net_amount || 0).toLocaleString()}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>भुक्तानी स्थिति:</span>{' '}
                      <span style={{ background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '10px', fontWeight: 700, fontSize: '0.72rem' }}>
                        {(foundSale as any).status || 'Completed'}
                      </span>
                    </div>
                  </div>

                  {/* Step 3: Item Selection for Return */}
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>
                    २. फिर्ता हुने औषधि र संख्या छान्नुहोस् (Select Return Quantity):
                  </label>
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden', marginBottom: '1rem' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
                      <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                          <th style={{ padding: '0.65rem 0.85rem' }}>औषधि नाम</th>
                          <th style={{ padding: '0.65rem 0.85rem' }}>ब्याच नं.</th>
                          <th style={{ padding: '0.65rem 0.85rem' }}>बिक्री संख्या</th>
                          <th style={{ padding: '0.65rem 0.85rem' }}>दर (दर/रु)</th>
                          <th style={{ padding: '0.65rem 0.85rem', width: '120px' }}>फिर्ता संख्या</th>
                          <th style={{ padding: '0.65rem 0.85rem', textAlign: 'right' }}>फिर्ता रकम (रु.)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {returnItems.map((item, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', background: item.returnQty > 0 ? '#fff1f2' : 'transparent' }}>
                            <td style={{ padding: '0.65rem 0.85rem', fontWeight: 600 }}>{item.medicineName}</td>
                            <td style={{ padding: '0.65rem 0.85rem', fontFamily: 'monospace', color: '#64748b' }}>{item.batchNo}</td>
                            <td style={{ padding: '0.65rem 0.85rem' }}>{item.soldQty} {item.unit}</td>
                            <td style={{ padding: '0.65rem 0.85rem' }}>रु. {item.unitPrice}</td>
                            <td style={{ padding: '0.65rem 0.85rem' }}>
                              <input
                                type="number"
                                min={0}
                                max={item.soldQty}
                                value={item.returnQty}
                                onChange={(e) => handleReturnQtyChange(idx, parseInt(e.target.value, 10) || 0)}
                                style={{
                                  width: '80px',
                                  padding: '0.3rem 0.5rem',
                                  borderRadius: '6px',
                                  border: item.returnQty > 0 ? '1.5px solid #e11d48' : '1px solid #cbd5e1',
                                  fontWeight: 700,
                                  color: item.returnQty > 0 ? '#be123c' : '#0f172a',
                                  outline: 'none',
                                }}
                              />
                            </td>
                            <td style={{ padding: '0.65rem 0.85rem', textAlign: 'right', fontWeight: 700, color: item.returnQty > 0 ? '#be123c' : '#64748b' }}>
                              रु. {item.refundAmount.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Step 4: Reason and Return Execution */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.25rem' }}>
                        फिर्ता कारण (Reason for Return) *
                      </label>
                      <select
                        value={returnReason}
                        onChange={(e) => setReturnReason(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.45rem',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                        }}
                      >
                        <option value="चिकित्सकले औषधि परिवर्तन गरेको">चिकित्सकले औषधि परिवर्तन गरेको</option>
                        <option value="औषधि नमिलेको / एलर्जी देखिएको">औषधि नमिलेको / एलर्जी देखिएको</option>
                        <option value="बिरामी डिस्चार्ज भएको / बाँकी औषधि">बिरामी डिस्चार्ज भएको / बाँकी औषधि</option>
                        <option value="गलत औषधि बिलिङ भएको">गलत औषधि बिलिङ भएको</option>
                        <option value="अन्य कारण">अन्य कारण</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.25rem' }}>
                        फिर्ता विधि (Refund Mode)
                      </label>
                      <select
                        value={refundMode}
                        onChange={(e) => setRefundMode(e.target.value as any)}
                        style={{
                          width: '100%',
                          padding: '0.45rem',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                        }}
                      >
                        <option value="cash">नगद फिर्ता (Cash Refund)</option>
                        <option value="adjustment">सोधभर्ना समायोजन (Credit/Adjustment)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.25rem' }}>
                        फिर्ता बुझ्ने कर्मचारी (Received By)
                      </label>
                      <input
                        type="text"
                        value={returnedBy}
                        onChange={(e) => setReturnedBy(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.45rem',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                        }}
                      />
                    </div>
                  </div>

                  {/* Total Summary Footer Bar */}
                  <div
                    style={{
                      background: '#1e293b',
                      color: '#ffffff',
                      borderRadius: '10px',
                      padding: '1rem',
                      display: 'flex',
                      flexWrap: 'wrap',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '1rem',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>कुल फिर्ता गर्नुपर्ने रकम (Total Refund):</div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f87171' }}>
                        रु. {totalRefundAmount.toLocaleString()}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={onClose}
                        style={{
                          background: '#334155',
                          color: '#f8fafc',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '0.55rem 1rem',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        रद्द गर्नुहोस्
                      </button>
                      <button
                        onClick={handleSubmitReturn}
                        disabled={isSubmitting || totalRefundAmount <= 0}
                        style={{
                          background: '#dc2626',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '0.55rem 1.4rem',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.45rem',
                          opacity: totalRefundAmount <= 0 || isSubmitting ? 0.6 : 1,
                        }}
                      >
                        <RotateCcw size={15} />
                        <span>{isSubmitting ? 'प्रक्रिया हुँदै...' : 'बिल फिर्ता पुष्टि गर्नुहोस्'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReturnBillModal;
