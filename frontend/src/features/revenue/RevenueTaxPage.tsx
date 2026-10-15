import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Coins,
  Receipt,
  Building,
  CreditCard,
  Calculator,
  QrCode,
  Printer,
  Search,
  Plus,
  X,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Filter,
  Layers,
  BarChart3,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Eye
} from 'lucide-react';
import { revenueApi, RevenueRecord, RevenueStats } from '../../api/revenue';
import { TaxCalculatorCard } from './components/TaxCalculatorCard';
import { RevenuePaymentModal } from './components/RevenuePaymentModal';
import { MalepaReceiptModal } from './components/MalepaReceiptModal';
import { toNepaliDigits } from './utils/nepaliCurrencyWords';

const REVENUE_TYPES = [
  'सम्पत्ति कर (Integrated Property Tax)',
  'व्यवसाय कर (Business Tax)',
  'मालपोत तथा भूमिकर (Land Revenue)',
  'घरबहाल कर (House Rent Tax)',
  'सवारी साधन कर (Vehicle Tax)',
  'सिफारिस तथा प्रशासनिक दस्तुर (Recommendation Fee)',
  'नक्सा पास दस्तुर (Building Permit Fee)',
  'अन्य स्थानीय शुल्क तथा दण्ड जरिवाना (Other Fees)',
];

const PAYMENT_METHODS = [
  { id: 'all', label: 'सबै भुक्तानी माध्यम' },
  { id: 'FONEPAY', label: 'Fonepay (Nepal QR)' },
  { id: 'ESEWA', label: 'eSewa' },
  { id: 'KHALTI', label: 'Khalti' },
  { id: 'CONNECTIPS', label: 'ConnectIPS' },
  { id: 'CLEAN_CASH', label: 'Clean for Cash (फोहोरबाट मोहर)' },
  { id: 'CASH', label: 'नगद (Cash)' },
];

export const RevenueTaxPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const verifyParam = searchParams.get('verify');

  // View Mode Tabs
  const [activeTab, setActiveTab] = useState<'records' | 'calculator' | 'analytics' | 'online_payments'>('records');

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedWard, setSelectedWard] = useState('all');
  const [selectedMethod, setSelectedMethod] = useState('all');

  // e-Services Payments Filters
  const [esrvMethodFilter, setEsrvMethodFilter] = useState('all');
  const [esrvStatusFilter, setEsrvStatusFilter] = useState('all');
  const [esrvWardFilter, setEsrvWardFilter] = useState('all');

  // Modals State
  const [showManualAddModal, setShowManualAddModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [receiptModalData, setReceiptModalData] = useState<RevenueRecord | null>(null);
  const [isDirectVerification, setIsDirectVerification] = useState(false);

  // E-Payment Prefill Data
  const [paymentPrefill, setPaymentPrefill] = useState({
    revenueHead: 'सम्पत्ति कर (Integrated Property Tax)',
    baseAmount: 15000,
    discountAmount: 1500,
    fineAmount: 0,
    netAmount: 13500,
    taxAssessmentDetails: undefined as any,
  });

  // Manual Add Form State
  const [manualFormData, setManualFormData] = useState({
    payerName: '',
    payerPan: '',
    payerPhone: '',
    revenueHead: 'सम्पत्ति कर (Integrated Property Tax)',
    type: 'सम्पत्ति कर (Integrated Property Tax)',
    amount: 2500,
    fineAmount: 0,
    discountAmount: 0,
    paymentMethod: 'CASH',
    paymentStatus: 'PAID',
    wardNumber: 1,
    fiscalYear: '२०८१/०८२',
    description: '',
  });

  // Fetch Revenue Records
  const { data: records = [], isLoading } = useQuery<RevenueRecord[]>({
    queryKey: ['revenue-records'],
    queryFn: async () => {
      const res = await revenueApi.getRevenueRecords();
      return ((res as any)?.data ?? res) || [];
    },
  });

  // Fetch Revenue Stats
  const { data: stats } = useQuery<RevenueStats>({
    queryKey: ['revenue-stats'],
    queryFn: async () => {
      const res = await revenueApi.getRevenueStats();
      return ((res as any)?.data ?? res) || ({} as RevenueStats);
    },
  });

  // Fetch e-Services Gateway Payments
  const { data: esrvPayments = [], isLoading: isLoadingEsrv } = useQuery<any[]>({
    queryKey: ['esrv-payments'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/v1/e-services/payments/');
        if (!res.ok) return [];
        return await res.json();
      } catch {
        return [];
      }
    },
  });

  const { data: esrvStats } = useQuery<any>({
    queryKey: ['esrv-payments-stats'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/v1/e-services/payments/stats');
        if (!res.ok) return null;
        return await res.json();
      } catch {
        return null;
      }
    },
  });

  // Filtered e-Services Payments
  const filteredEsrvPayments = useMemo(() => {
    return (Array.isArray(esrvPayments) ? esrvPayments : []).filter((p: any) => {
      if (esrvMethodFilter !== 'all' && !(p.payment_method || '').toLowerCase().includes(esrvMethodFilter.toLowerCase())) {
        return false;
      }
      if (esrvStatusFilter !== 'all' && (p.payment_status || '').toLowerCase() !== esrvStatusFilter.toLowerCase()) {
        return false;
      }
      if (esrvWardFilter !== 'all' && String(p.ward_id || '') !== String(esrvWardFilter)) {
        return false;
      }
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        (p.transaction_id || '').toLowerCase().includes(term) ||
        (p.application_no || '').toLowerCase().includes(term) ||
        (p.service_name || '').toLowerCase().includes(term) ||
        (p.applicant_name || '').toLowerCase().includes(term) ||
        (p.payment_method || '').toLowerCase().includes(term)
      );
    });
  }, [esrvPayments, esrvMethodFilter, esrvStatusFilter, esrvWardFilter, searchTerm]);

  // Handle URL Verification parameter (?verify=P5-REV-2081-00001)
  useEffect(() => {
    if (verifyParam && records.length > 0) {
      const match = records.find(
        (r) =>
          r.receiptNo?.toLowerCase() === verifyParam.toLowerCase() ||
          r.receiptNumber?.toLowerCase() === verifyParam.toLowerCase()
      );
      if (match) {
        setReceiptModalData(match);
        setIsDirectVerification(true);
      }
    }
  }, [verifyParam, records]);

  // Create Manual Receipt Mutation
  const createMutation = useMutation({
    mutationFn: async (data: typeof manualFormData) => {
      const net = Number(data.amount) + Number(data.fineAmount || 0) - Number(data.discountAmount || 0);
      return revenueApi.createRevenueRecord({
        ...data,
        baseAmount: Number(data.amount),
        amount: net,
        totalAmount: net,
      });
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['revenue-records'] });
      queryClient.invalidateQueries({ queryKey: ['revenue-stats'] });
      setShowManualAddModal(false);
      if (res) {
        setReceiptModalData((res as any)?.data ?? res);
      }
    },
  });

  // Filtered List
  const filteredList = useMemo(() => {
    return records.filter((r) => {
      const q = searchTerm.toLowerCase();
      const matchSearch =
        !q ||
        r.payerName?.toLowerCase().includes(q) ||
        r.receiptNo?.toLowerCase().includes(q) ||
        r.receiptNumber?.toLowerCase().includes(q) ||
        r.payerPhone?.includes(q) ||
        r.payerPan?.includes(q) ||
        r.transactionId?.toLowerCase().includes(q);

      const rHead = r.revenueHead || r.type;
      const matchType = selectedType === 'all' || rHead === selectedType || rHead?.includes(selectedType.split(' ')[0]);
      const matchWard = selectedWard === 'all' || r.wardNumber === Number(selectedWard);

      const rMethod = (r.paymentGateway || r.paymentMethod || '').toUpperCase();
      const matchMethod =
        selectedMethod === 'all' ||
        rMethod.includes(selectedMethod.toUpperCase());

      return matchSearch && matchType && matchWard && matchMethod;
    });
  }, [records, searchTerm, selectedType, selectedWard, selectedMethod]);

  // Summary Metrics
  const totalRevenue = stats?.totalRevenue ?? records.reduce((acc, r) => acc + Number(r.amount || r.totalAmount || 0), 0);
  const totalReceipts = stats?.totalReceipts ?? records.length;

  const digitalReceiptsCount = records.filter(
    (r) =>
      r.paymentGateway === 'ESEWA' ||
      r.paymentGateway === 'KHALTI' ||
      r.paymentGateway === 'FONEPAY' ||
      r.paymentGateway === 'CONNECTIPS' ||
      r.paymentGateway === 'CLEAN_CASH' ||
      (r.paymentMethod && !r.paymentMethod.includes('नगद') && !r.paymentMethod.includes('CASH'))
  ).length;

  const digitalAdoptionPct = totalReceipts > 0 ? Math.round((digitalReceiptsCount / totalReceipts) * 100) : 50;

  // Handle Calculator CTA
  const handleProceedToPayment = (calcDetails: any) => {
    setPaymentPrefill({
      revenueHead: calcDetails.revenueHead,
      baseAmount: calcDetails.baseAmount,
      discountAmount: calcDetails.discountAmount,
      fineAmount: calcDetails.fineAmount,
      netAmount: calcDetails.netAmount,
      taxAssessmentDetails: calcDetails.details,
    });
    setShowPaymentModal(true);
  };

  // Gateway Badge helper
  const renderGatewayBadge = (r: RevenueRecord) => {
    const gw = (r.paymentGateway || r.paymentMethod || 'CASH').toUpperCase();
    if (gw.includes('ESEWA')) {
      return (
        <span style={{ backgroundColor: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
          eSewa
        </span>
      );
    }
    if (gw.includes('KHALTI')) {
      return (
        <span style={{ backgroundColor: '#f5f3ff', color: '#7c3aed', border: '1px solid #ddd6fe', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
          Khalti
        </span>
      );
    }
    if (gw.includes('FONEPAY') || gw.includes('QR')) {
      return (
        <span style={{ backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
          Fonepay QR
        </span>
      );
    }
    if (gw.includes('CONNECTIPS') || gw.includes('IPS')) {
      return (
        <span style={{ backgroundColor: '#eff6ff', color: '#0284c7', border: '1px solid #bae6fd', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
          ConnectIPS
        </span>
      );
    }
    if (gw.includes('CLEAN_CASH')) {
      return (
        <span style={{ backgroundColor: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          फोहोरबाट मोहर
        </span>
      );
    }
    return (
      <span style={{ backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600 }}>
        नगद (Cash)
      </span>
    );
  };

  return (
    <div style={{ padding: '1.5rem', color: '#0f172a' }}>
      {/* ── Top Header Banner ── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem',
          padding: '1.5rem 1.75rem',
          background: 'linear-gradient(135deg, #0f766e 0%, #042f2e 100%)',
          color: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 10px 20px -5px rgba(15, 118, 110, 0.25)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              padding: '0.75rem',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#5eead4',
            }}
          >
            <Coins size={32} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>
                डिजिटल राजस्व तथा ई-पेमेन्ट प्रणाली (e-Revenue & Tax Suite)
              </h1>
              <span
                style={{
                  backgroundColor: '#14b8a6',
                  color: '#042f2e',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '10px',
                }}
              >
                मलेप १०२ प्रमाणीकृत
              </span>
            </div>
            <p style={{ margin: '0.35rem 0 0', opacity: 0.9, fontSize: '0.85rem', color: '#ccfbf1' }}>
              पाँचपोखरी थाङपाल गाउँपालिका — सम्पत्ति कर, व्यवसाय कर, मालपोत तथा eSewa, Khalti, Fonepay, ConnectIPS ई-भुक्तानी
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setActiveTab('calculator')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.65rem 1.15rem',
              backgroundColor: activeTab === 'calculator' ? '#ffffff' : 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '8px',
              color: activeTab === 'calculator' ? '#0f766e' : '#ffffff',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.85rem',
              transition: 'all 0.15s ease',
            }}
          >
            <Calculator size={17} />
            <span>कर क्याल्कुलेटर</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setPaymentPrefill({
                revenueHead: 'सम्पत्ति कर (Integrated Property Tax)',
                baseAmount: 15000,
                discountAmount: 1500,
                fineAmount: 0,
                netAmount: 13500,
                taxAssessmentDetails: undefined,
              });
              setShowPaymentModal(true);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.65rem 1.25rem',
              backgroundColor: '#15803d',
              border: 'none',
              borderRadius: '8px',
              color: '#ffffff',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.85rem',
              boxShadow: '0 4px 12px rgba(21, 128, 61, 0.3)',
              transition: 'all 0.15s ease',
            }}
          >
            <CreditCard size={17} />
            <span>अनलाइन ई-भुक्तानी (e-Pay)</span>
          </button>

          {window.location.pathname.startsWith('/app') && (
            <button
              type="button"
              onClick={() => setShowManualAddModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1.25rem',
                backgroundColor: '#0d9488',
                border: 'none',
                borderRadius: '8px',
                color: '#ffffff',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.85rem',
                boxShadow: '0 4px 12px rgba(13, 148, 136, 0.3)',
                transition: 'all 0.15s ease',
              }}
            >
              <Plus size={17} />
              <span>नयाँ रसिद जारी</span>
            </button>
          )}
        </div>
      </div>

      {/* ── KPI Summary Cards ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div
          style={{
            backgroundColor: '#ffffff',
            padding: '1.25rem',
            borderRadius: '12px',
            border: '1.5px solid #e2e8f0',
            boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>कुल संकलित आन्तरिक राजस्व</div>
            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f766e', marginTop: '0.2rem' }}>
              रु. {Number(totalRevenue).toLocaleString('ne-NP')}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#059669', marginTop: '0.2rem', fontWeight: 600 }}>
              चालु आ.व. २०८१/८२ संकलित रकम
            </div>
          </div>
          <div style={{ backgroundColor: '#f0fdfa', color: '#0d9488', padding: '0.85rem', borderRadius: '10px' }}>
            <Coins size={26} />
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#ffffff',
            padding: '1.25rem',
            borderRadius: '12px',
            border: '1.5px solid #e2e8f0',
            boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>कुल जारी कर रसिद</div>
            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#1e293b', marginTop: '0.2rem' }}>
              {totalReceipts} वटा
            </div>
            <div style={{ fontSize: '0.75rem', color: '#2563eb', marginTop: '0.2rem', fontWeight: 600 }}>
              मलेप फारम १०२ डिजिटल दाखिला
            </div>
          </div>
          <div style={{ backgroundColor: '#eff6ff', color: '#2563eb', padding: '0.85rem', borderRadius: '10px' }}>
            <Receipt size={26} />
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#ffffff',
            padding: '1.25rem',
            borderRadius: '12px',
            border: '1.5px solid #e2e8f0',
            boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>डिजिटल ई-पेमेन्ट अनुपात</div>
            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#7c3aed', marginTop: '0.2rem' }}>
              {digitalAdoptionPct}%
            </div>
            <div style={{ fontSize: '0.75rem', color: '#7c3aed', marginTop: '0.2rem', fontWeight: 600 }}>
              Fonepay, eSewa, Khalti, ConnectIPS
            </div>
          </div>
          <div style={{ backgroundColor: '#f5f3ff', color: '#7c3aed', padding: '0.85rem', borderRadius: '10px' }}>
            <CreditCard size={26} />
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#ffffff',
            padding: '1.25rem',
            borderRadius: '12px',
            border: '1.5px solid #e2e8f0',
            boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>प्रमाणीकरण अवस्था</div>
            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#15803d', marginTop: '0.2rem' }}>
              १००% प्रमाणित
            </div>
            <div style={{ fontSize: '0.75rem', color: '#15803d', marginTop: '0.2rem', fontWeight: 600 }}>
              क्युआर कोड + डिजिटल हस्ताक्षर
            </div>
          </div>
          <div style={{ backgroundColor: '#dcfce7', color: '#15803d', padding: '0.85rem', borderRadius: '10px' }}>
            <ShieldCheck size={26} />
          </div>
        </div>
      </div>

      {/* ── Sub-Navigation Tabs ── */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '2px solid #e2e8f0',
          marginBottom: '1.5rem',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('records')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            border: 'none',
            borderBottom: activeTab === 'records' ? '3px solid #0f766e' : '3px solid transparent',
            backgroundColor: 'transparent',
            color: activeTab === 'records' ? '#0f766e' : '#64748b',
            fontWeight: activeTab === 'records' ? 800 : 600,
            fontSize: '0.95rem',
            cursor: 'pointer',
            marginBottom: '-2px',
          }}
        >
          <Layers size={18} />
          <span>कर रसिद अभिलेख (Receipts & Records)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('calculator')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            border: 'none',
            borderBottom: activeTab === 'calculator' ? '3px solid #0f766e' : '3px solid transparent',
            backgroundColor: 'transparent',
            color: activeTab === 'calculator' ? '#0f766e' : '#64748b',
            fontWeight: activeTab === 'calculator' ? 800 : 600,
            fontSize: '0.95rem',
            cursor: 'pointer',
            marginBottom: '-2px',
          }}
        >
          <Calculator size={18} />
          <span>वैज्ञानिक कर क्याल्कुलेटर (Tax Calculator)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('analytics')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            border: 'none',
            borderBottom: activeTab === 'analytics' ? '3px solid #0f766e' : '3px solid transparent',
            backgroundColor: 'transparent',
            color: activeTab === 'analytics' ? '#0f766e' : '#64748b',
            fontWeight: activeTab === 'analytics' ? 800 : 600,
            fontSize: '0.95rem',
            cursor: 'pointer',
            marginBottom: '-2px',
          }}
        >
          <BarChart3 size={18} />
          <span>राजस्व विश्लेषण तथा गेटवे हिसाब (Analytics)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('online_payments')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            border: 'none',
            borderBottom: activeTab === 'online_payments' ? '3px solid #0f766e' : '3px solid transparent',
            backgroundColor: 'transparent',
            color: activeTab === 'online_payments' ? '#0f766e' : '#64748b',
            fontWeight: activeTab === 'online_payments' ? 800 : 600,
            fontSize: '0.95rem',
            cursor: 'pointer',
            marginBottom: '-2px',
          }}
        >
          <CreditCard size={18} />
          <span>नागरिक ई-सेवा भुक्तानी (e-Services Gateway)</span>
          <span style={{ fontSize: '0.72rem', backgroundColor: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '10px', fontWeight: 800 }}>
            {esrvPayments.length} कारोबार
          </span>
        </button>
      </div>

      {/* ── TAB 1: TAX CALCULATOR ── */}
      {activeTab === 'calculator' && (
        <TaxCalculatorCard onProceedToPayment={handleProceedToPayment} />
      )}

      {/* ── TAB 2: ANALYTICS & PAYMENT BREAKDOWN ── */}
      {activeTab === 'analytics' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          {/* Payment Gateways Breakdown */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1.5px solid #e2e8f0',
              padding: '1.5rem',
              boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
            }}
          >
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 1rem', color: '#0f172a' }}>
              भुक्तानी माध्यम अनुसार संकलन हिस्सा (By Payment Gateway)
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {[
                { name: 'Fonepay (Nepal QR)', code: 'FONEPAY', color: '#dc2626', bg: '#fef2f2' },
                { name: 'eSewa डिजिटल वालेट', code: 'ESEWA', color: '#16a34a', bg: '#f0fdf4' },
                { name: 'ConnectIPS (NCHL)', code: 'CONNECTIPS', color: '#0284c7', bg: '#eff6ff' },
                { name: 'Khalti डिजिटल वालेट', code: 'KHALTI', color: '#7c3aed', bg: '#f5f3ff' },
                { name: 'वडा कार्यालय नगद दाखिला', code: 'CASH', color: '#475569', bg: '#f1f5f9' },
              ].map((g) => {
                const count = records.filter((r) =>
                  (r.paymentGateway || r.paymentMethod || '').toUpperCase().includes(g.code)
                ).length;
                const total = records
                  .filter((r) => (r.paymentGateway || r.paymentMethod || '').toUpperCase().includes(g.code))
                  .reduce((sum, r) => sum + Number(r.amount || r.totalAmount || 0), 0);
                const pct = totalRevenue > 0 ? Math.round((total / totalRevenue) * 100) : 0;

                return (
                  <div key={g.code} style={{ padding: '0.75rem', borderRadius: '8px', backgroundColor: g.bg }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem', color: g.color }}>{g.name}</span>
                      <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>
                        रु. {total.toLocaleString('ne-NP')} ({pct}%)
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', backgroundColor: g.color }} />
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.25rem' }}>
                      कुल {count} वटा कारोबार
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Revenue Head Breakdown */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1.5px solid #e2e8f0',
              padding: '1.5rem',
              boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
            }}
          >
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 1rem', color: '#0f172a' }}>
              प्रमुख कर शीर्षक अनुसार संकलन (By Revenue Heads)
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { head: 'सम्पत्ति कर (Property Tax)', color: '#0f766e' },
                { head: 'व्यवसाय कर (Business Tax)', color: '#0284c7' },
                { head: 'मालपोत तथा भूमिकर (Land Revenue)', color: '#15803d' },
                { head: 'घरबहाल कर (Rent Tax)', color: '#b45309' },
                { head: 'सिफारिस तथा प्रशासनिक दस्तुर', color: '#6d28d9' },
              ].map((h) => {
                const subTotal = records
                  .filter((r) => (r.revenueHead || r.type || '').includes(h.head.split(' ')[0]))
                  .reduce((sum, r) => sum + Number(r.amount || r.totalAmount || 0), 0);
                const pct = totalRevenue > 0 ? Math.round((subTotal / totalRevenue) * 100) : 0;

                return (
                  <div key={h.head} style={{ paddingBottom: '0.5rem', borderBottom: '1px dashed #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 600, color: '#1e293b' }}>{h.head}</span>
                      <strong style={{ color: h.color }}>रु. {subTotal.toLocaleString('ne-NP')} ({pct}%)</strong>
                    </div>
                    <div style={{ width: '100%', height: '5px', backgroundColor: '#f1f5f9', borderRadius: '3px' }}>
                      <div style={{ width: `${pct}%`, height: '100%', backgroundColor: h.color, borderRadius: '3px' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: RECORDS LIST & SEARCH/FILTER ── */}
      {activeTab === 'records' && (
        <>
          {/* Filter and Search Bar */}
          <div
            style={{
              backgroundColor: '#ffffff',
              padding: '1rem 1.25rem',
              borderRadius: '12px',
              border: '1.5px solid #e2e8f0',
              marginBottom: '1.5rem',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.85rem',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
            }}
          >
            {/* Search Input */}
            <div style={{ display: 'flex', flex: 1, minWidth: '280px', position: 'relative' }}>
              <Search
                size={18}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#64748b',
                }}
              />
              <input
                type="text"
                placeholder="रसिद नं, करदाताको नाम, PAN, फोन वा Txn ID खोज्नुहोस्..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 1rem 0.55rem 2.4rem',
                  borderRadius: '8px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.85rem',
                  outline: 'none',
                  color: '#0f172a',
                }}
              />
            </div>

            {/* Filter Dropdowns */}
            <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
              {/* Category Filter */}
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                style={{
                  padding: '0.55rem 0.85rem',
                  borderRadius: '8px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.825rem',
                  backgroundColor: '#ffffff',
                  outline: 'none',
                  color: '#0f172a',
                }}
              >
                <option value="all">सबै कर शीर्षक (All Revenue Types)</option>
                {REVENUE_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>

              {/* Ward Filter */}
              <select
                value={selectedWard}
                onChange={(e) => setSelectedWard(e.target.value)}
                style={{
                  padding: '0.55rem 0.85rem',
                  borderRadius: '8px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.825rem',
                  backgroundColor: '#ffffff',
                  outline: 'none',
                  color: '#0f172a',
                }}
              >
                <option value="all">सबै वडा (All Wards)</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
                  <option key={w} value={w}>वडा नं. {w}</option>
                ))}
              </select>

              {/* Payment Method Filter */}
              <select
                value={selectedMethod}
                onChange={(e) => setSelectedMethod(e.target.value)}
                style={{
                  padding: '0.55rem 0.85rem',
                  borderRadius: '8px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.825rem',
                  backgroundColor: '#ffffff',
                  outline: 'none',
                  color: '#0f172a',
                }}
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m.id} value={m.id}>{m.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Main Receipts Table */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '14px',
              border: '1.5px solid #e2e8f0',
              overflow: 'hidden',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
            }}
          >
            <div className="dt-responsive-table-wrapper">
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                  <tr>
                    <th style={{ padding: '0.85rem 1rem' }}>रसिद नम्बर</th>
                    <th style={{ padding: '0.85rem 1rem' }}>करदाताको नाम / PAN</th>
                    <th style={{ padding: '0.85rem 1rem' }}>करको शीर्षक</th>
                    <th style={{ padding: '0.85rem 1rem' }}>वडा</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>दाखिला रकम</th>
                    <th style={{ padding: '0.85rem 1rem' }}>भुक्तानी माध्यम</th>
                    <th style={{ padding: '0.85rem 1rem' }}>मिति / आ.व.</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>कार्य</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                        राजस्व अभिलेख लोड हुँदैछ...
                      </td>
                    </tr>
                  ) : filteredList.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                        कुनै कर रसिद फेला परेन।
                      </td>
                    </tr>
                  ) : (
                    filteredList.map((r) => {
                      const rNo = r.receiptNo || r.receiptNumber || '';
                      const net = Number(r.amount || r.totalAmount || 0);

                      return (
                        <tr
                          key={r.id}
                          style={{
                            borderBottom: '1px solid #f1f5f9',
                            transition: 'background-color 0.15s ease',
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.backgroundColor = '#f8fafc';
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                          }}
                        >
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0f766e' }}>
                                {rNo}
                              </span>
                              <QrCode size={13} color="#0d9488" />
                            </div>
                            {r.transactionId && (
                              <div style={{ fontSize: '0.7rem', color: '#64748b', fontFamily: 'monospace' }}>
                                Txn: {r.transactionId}
                              </div>
                            )}
                          </td>

                          <td style={{ padding: '0.85rem 1rem' }}>
                            <div style={{ fontWeight: 700, color: '#0f172a' }}>{r.payerName}</div>
                            {r.payerPan && (
                              <div style={{ fontSize: '0.75rem', color: '#475569' }}>
                                PAN: {r.payerPan}
                              </div>
                            )}
                            {r.payerPhone && (
                              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                {r.payerPhone}
                              </div>
                            )}
                          </td>

                          <td style={{ padding: '0.85rem 1rem' }}>
                            <span
                              style={{
                                backgroundColor: '#f0fdfa',
                                color: '#0f766e',
                                border: '1px solid #ccfbf1',
                                padding: '3px 8px',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                              }}
                            >
                              {r.revenueHead || r.type}
                            </span>
                          </td>

                          <td style={{ padding: '0.85rem 1rem' }}>
                            वडा नं. {r.wardNumber || 1}
                          </td>

                          <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: 800, color: '#047857' }}>
                            रु. {net.toLocaleString('ne-NP')}
                          </td>

                          <td style={{ padding: '0.85rem 1rem' }}>
                            {renderGatewayBadge(r)}
                          </td>

                          <td style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', color: '#475569' }}>
                            <div>{r.fiscalYear || '२०८१/०८२'}</div>
                            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                              {r.createdAt ? new Date(r.createdAt).toLocaleDateString('ne-NP') : '२०८१/११/०४'}
                            </div>
                          </td>

                          <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                            <button
                              type="button"
                              onClick={() => {
                                setReceiptModalData(r);
                                setIsDirectVerification(false);
                              }}
                              style={{
                                padding: '0.4rem 0.85rem',
                                backgroundColor: '#f0fdfa',
                                border: '1px solid #99f6e4',
                                color: '#0f766e',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                fontWeight: 700,
                                fontSize: '0.8rem',
                              }}
                            >
                              <Printer size={14} />
                              <span>मलेप रसिद</span>
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
        </>
      )}

      {/* ── TAB 4: CITIZEN E-SERVICES ONLINE PAYMENTS & GATEWAY ── */}
      {activeTab === 'online_payments' && (
        <>
          {/* Top KPI Cards for e-Services Online Revenue */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '1.25rem', border: '1.5px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#64748b', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>
                <span>कुल अनलाइन कारोबार</span>
                <CreditCard size={18} color="#0f766e" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', margin: '0.4rem 0 0.2rem' }}>
                {esrvPayments.length} <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>वटा</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 700 }}>
                डिजिटल सिफारिस तथा ई-सेवा दस्तुर
              </div>
            </div>

            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '1.25rem', border: '1.5px solid #bbf7d0', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#15803d', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>
                <span>कुल संकलित ई-राजस्व</span>
                <Coins size={18} color="#16a34a" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#15803d', margin: '0.4rem 0 0.2rem' }}>
                रु. {(esrvStats?.totalAmount ?? esrvPayments.reduce((acc: number, p: any) => acc + (Number(p.amount) || 0), 0)).toLocaleString('ne-NP')}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#15803d', fontWeight: 600 }}>
                eSewa, Khalti, ConnectIPS, Fonepay मार्फत
              </div>
            </div>

            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '1.25rem', border: '1.5px solid #bae6fd', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#0369a1', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>
                <span>सफल / प्रमाणित दाखिला</span>
                <ShieldCheck size={18} color="#0284c7" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0369a1', margin: '0.4rem 0 0.2rem' }}>
                {esrvPayments.filter((p: any) => (p.payment_status || p.paymentStatus) === 'Completed' || (p.payment_status || p.paymentStatus) === 'Verified').length} <span style={{ fontSize: '0.9rem', color: '#0284c7', fontWeight: 600 }}>वटा</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                पेन्डिङ: <strong>{esrvPayments.filter((p: any) => (p.payment_status || p.paymentStatus) === 'Pending').length} वटा</strong>
              </div>
            </div>

            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '1.25rem', border: '1.5px solid #fecaca', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#b91c1c', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>
                <span>डिजिटल वालेट हिस्सा</span>
                <QrCode size={18} color="#dc2626" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#b91c1c', margin: '0.4rem 0 0.2rem' }}>
                {esrvPayments.length > 0 ? Math.round((esrvPayments.filter((p: any) => !p.payment_method?.includes('Cash') && !p.payment_method?.includes('नगद')).length / esrvPayments.length) * 100) : 0}%
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                कैशलेस नागरिक भुक्तानी अनुपात
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              backgroundColor: '#ffffff',
              padding: '1rem 1.25rem',
              borderRadius: '12px',
              border: '1.5px solid #e2e8f0',
              marginBottom: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '260px', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', width: '100%', maxWidth: '380px' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="text"
                  placeholder="कारोबार नं, आवेदन नं वा नागरिकको नाम खोज्नुहोस्..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem 0.55rem 2.25rem',
                    borderRadius: '8px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.85rem',
                    outline: 'none',
                  }}
                />
              </div>

              <select
                value={esrvMethodFilter}
                onChange={(e) => setEsrvMethodFilter(e.target.value)}
                style={{
                  padding: '0.55rem 0.75rem',
                  borderRadius: '8px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.85rem',
                  outline: 'none',
                  backgroundColor: '#ffffff',
                }}
              >
                <option value="all">सबै भुक्तानी माध्यम</option>
                <option value="eSewa">eSewa वालेट</option>
                <option value="Khalti">Khalti वालेट</option>
                <option value="ConnectIPS">ConnectIPS</option>
                <option value="Fonepay">Fonepay (Nepal QR)</option>
                <option value="Cash">नगद दाखिला</option>
              </select>

              <select
                value={esrvWardFilter}
                onChange={(e) => setEsrvWardFilter(e.target.value)}
                style={{
                  padding: '0.55rem 0.75rem',
                  borderRadius: '8px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.85rem',
                  outline: 'none',
                  backgroundColor: '#ffffff',
                }}
              >
                <option value="all">सबै वडाहरू (१-८)</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
                  <option key={w} value={w}>वडा नं. {w}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => queryClient.invalidateQueries({ queryKey: ['esrv-payments'] })}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '0.55rem 0.95rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#f8fafc',
                  color: '#334155',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                ताजा गर्नुहोस्
              </button>
            </div>
          </div>

          {/* e-Services Payments Registry Table */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1.5px solid #e2e8f0',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                    <th style={{ padding: '0.9rem 1rem' }}>कारोबार नं (Txn ID)</th>
                    <th style={{ padding: '0.9rem 1rem' }}>आवेदन नं</th>
                    <th style={{ padding: '0.9rem 1rem' }}>नागरिक ई-सेवा शीर्षक</th>
                    <th style={{ padding: '0.9rem 1rem' }}>करदाता / आवेदक</th>
                    <th style={{ padding: '0.9rem 1rem', textAlign: 'center' }}>वडा नं</th>
                    <th style={{ padding: '0.9rem 1rem', textAlign: 'right' }}>रकम (रु.)</th>
                    <th style={{ padding: '0.9rem 1rem' }}>भुक्तानी माध्यम</th>
                    <th style={{ padding: '0.9rem 1rem' }}>अवस्था</th>
                    <th style={{ padding: '0.9rem 1rem' }}>मिति</th>
                    <th style={{ padding: '0.9rem 1rem', textAlign: 'right' }}>डिजिटल रसिद</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEsrvPayments.length === 0 ? (
                    <tr>
                      <td colSpan={10} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                        कुनै अनलाइन सेवा भुक्तानी फेला परेन।
                      </td>
                    </tr>
                  ) : (
                    filteredEsrvPayments.map((p: any) => {
                      const method = (p.payment_method || '').toLowerCase();
                      const isEsewa = method.includes('esewa');
                      const isKhalti = method.includes('khalti');
                      const isCips = method.includes('connectips') || method.includes('ips');
                      const isFonepay = method.includes('fonepay') || method.includes('qr');

                      const methodBadge = isEsewa
                        ? { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0', label: 'eSewa वालेट' }
                        : isKhalti
                        ? { bg: '#f5f3ff', text: '#7c3aed', border: '#ddd6fe', label: 'Khalti वालेट' }
                        : isCips
                        ? { bg: '#eff6ff', text: '#0284c7', border: '#bae6fd', label: 'ConnectIPS' }
                        : isFonepay
                        ? { bg: '#fef2f2', text: '#dc2626', border: '#fecaca', label: 'Fonepay QR' }
                        : { bg: '#f1f5f9', text: '#475569', border: '#e2e8f0', label: p.payment_method || 'नगद' };

                      const isVerified = (p.payment_status || p.paymentStatus) === 'Completed' || (p.payment_status || p.paymentStatus) === 'Verified';

                      return (
                        <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '0.85rem 1rem', fontWeight: 800, fontFamily: 'monospace', color: '#0f766e' }}>
                            {p.transaction_id || `TXN-${p.id.slice(0, 8).toUpperCase()}`}
                          </td>
                          <td style={{ padding: '0.85rem 1rem', fontFamily: 'monospace', fontSize: '0.78rem', color: '#64748b' }}>
                            {p.application_no || p.application_id?.slice(0, 8)}
                          </td>
                          <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#0f172a' }}>
                            {p.service_name || 'नागरिक सिफारिस सेवा'}
                          </td>
                          <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>
                            {p.applicant_name || 'नागरिक'}
                          </td>
                          <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                            <span style={{ padding: '2px 8px', borderRadius: '4px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', fontSize: '0.75rem', fontWeight: 700 }}>
                              वडा {p.ward_id || 1}
                            </span>
                          </td>
                          <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: 800, color: '#0f766e' }}>
                            रु. {Number(p.amount).toLocaleString('ne-NP')}
                          </td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: methodBadge.bg, color: methodBadge.text, border: `1px solid ${methodBadge.border}`, whiteSpace: 'nowrap' }}>
                              {methodBadge.label}
                            </span>
                          </td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 700, backgroundColor: isVerified ? '#dcfce7' : '#fef3c7', color: isVerified ? '#15803d' : '#92400e', border: `1px solid ${isVerified ? '#bbf7d0' : '#fde68a'}`, whiteSpace: 'nowrap' }}>
                              {isVerified ? '✓ प्रमाणित' : '⏳ पेन्डिङ'}
                            </span>
                          </td>
                          <td style={{ padding: '0.85rem 1rem', fontSize: '0.78rem', color: '#64748b' }}>
                            {p.created_at ? new Date(p.created_at).toLocaleDateString('ne-NP') : '२०८१/०५/२५'}
                          </td>
                          <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                            <button
                              type="button"
                              onClick={() => {
                                setReceiptModalData({
                                  id: p.id,
                                  receiptNo: p.transaction_id || `REC-${p.id.slice(0, 8).toUpperCase()}`,
                                  receiptNumber: p.transaction_id || `REC-${p.id.slice(0, 8).toUpperCase()}`,
                                  payerName: p.applicant_name || 'नागरिक',
                                  revenueHead: `ई-सिफारिस: ${p.service_name || 'अनलाइन सेवा'}`,
                                  type: p.service_name || 'सिफारिस',
                                  amount: p.amount,
                                  totalAmount: p.amount,
                                  baseAmount: p.amount,
                                  discountAmount: 0,
                                  fineAmount: 0,
                                  paymentMethod: p.payment_method,
                                  paymentGateway: p.payment_method,
                                  paymentStatus: p.payment_status || 'PAID',
                                  wardNumber: Number(p.ward_id) || 1,
                                  fiscalYear: '२०८१/०८२',
                                  dateBs: '२०८१/०५/२५',
                                  createdAt: p.created_at,
                                } as any);
                                setIsDirectVerification(false);
                              }}
                              style={{
                                padding: '0.4rem 0.85rem',
                                backgroundColor: '#f0fdfa',
                                border: '1px solid #99f6e4',
                                color: '#0f766e',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                fontWeight: 700,
                                fontSize: '0.78rem',
                              }}
                            >
                              <Printer size={14} />
                              <span>मलेप रसिद</span>
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
        </>
      )}

      {/* ── MODAL 1: OFFICIAL MALEPA 102 RECEIPT MODAL ── */}
      <MalepaReceiptModal
        receipt={receiptModalData}
        isOpen={!!receiptModalData}
        onClose={() => {
          setReceiptModalData(null);
          setIsDirectVerification(false);
        }}
        isDirectVerification={isDirectVerification}
      />

      {/* ── MODAL 2: E-PAYMENT GATEWAY MODAL ── */}
      <RevenuePaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        revenueHead={paymentPrefill.revenueHead}
        baseAmount={paymentPrefill.baseAmount}
        discountAmount={paymentPrefill.discountAmount}
        fineAmount={paymentPrefill.fineAmount}
        netAmount={paymentPrefill.netAmount}
        taxAssessmentDetails={paymentPrefill.taxAssessmentDetails}
        onPaymentSuccess={(newReceipt) => {
          setShowPaymentModal(false);
          queryClient.invalidateQueries({ queryKey: ['revenue-records'] });
          queryClient.invalidateQueries({ queryKey: ['revenue-stats'] });
          setReceiptModalData(newReceipt);
        }}
      />

      {/* ── MODAL 3: MANUAL NEW RECEIPT MODAL ── */}
      {showManualAddModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '620px',
              width: '100%',
              maxHeight: '92vh',
              overflowY: 'auto',
              padding: '1.75rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid #cbd5e1',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.25rem',
                borderBottom: '1px solid #e2e8f0',
                paddingBottom: '0.75rem',
              }}
            >
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#0f766e' }}>
                नयाँ कर तथा राजस्व रसिद जारी (मलेप फारम १०२)
              </h2>
              <button
                type="button"
                onClick={() => setShowManualAddModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={22} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createMutation.mutate(manualFormData);
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    करदाताको नाम / संस्था*
                  </label>
                  <input
                    type="text"
                    required
                    value={manualFormData.payerName}
                    onChange={(e) => setManualFormData({ ...manualFormData, payerName: e.target.value })}
                    placeholder="जस्तै: दावा छिरिङ लामा"
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', outline: 'none', fontSize: '0.875rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    सम्पर्क फोन / मोबाइल
                  </label>
                  <input
                    type="text"
                    value={manualFormData.payerPhone}
                    onChange={(e) => setManualFormData({ ...manualFormData, payerPhone: e.target.value })}
                    placeholder="९८४१२३४५६७"
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', outline: 'none', fontSize: '0.875rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    करको शीर्षक*
                  </label>
                  <select
                    value={manualFormData.revenueHead}
                    onChange={(e) => setManualFormData({ ...manualFormData, revenueHead: e.target.value, type: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', outline: 'none', fontSize: '0.875rem', backgroundColor: '#ffffff' }}
                  >
                    {REVENUE_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    स्थायी लेखा नं (PAN)
                  </label>
                  <input
                    type="text"
                    value={manualFormData.payerPan}
                    onChange={(e) => setManualFormData({ ...manualFormData, payerPan: e.target.value })}
                    placeholder="६०१२३४५६७"
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', outline: 'none', fontSize: '0.875rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    मूल कर रकम (रु.)*
                  </label>
                  <input
                    type="number"
                    required
                    value={manualFormData.amount}
                    onChange={(e) => setManualFormData({ ...manualFormData, amount: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', outline: 'none', fontSize: '0.875rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    छुट रकम (रु.)
                  </label>
                  <input
                    type="number"
                    value={manualFormData.discountAmount}
                    onChange={(e) => setManualFormData({ ...manualFormData, discountAmount: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', outline: 'none', fontSize: '0.875rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    जरिवाना (रु.)
                  </label>
                  <input
                    type="number"
                    value={manualFormData.fineAmount}
                    onChange={(e) => setManualFormData({ ...manualFormData, fineAmount: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', outline: 'none', fontSize: '0.875rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    वडा नं.*
                  </label>
                  <select
                    value={manualFormData.wardNumber}
                    onChange={(e) => setManualFormData({ ...manualFormData, wardNumber: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', outline: 'none', fontSize: '0.875rem', backgroundColor: '#ffffff' }}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
                      <option key={w} value={w}>वडा नं. {w}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    भुक्तानी विधि*
                  </label>
                  <select
                    value={manualFormData.paymentMethod}
                    onChange={(e) => setManualFormData({ ...manualFormData, paymentMethod: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', outline: 'none', fontSize: '0.875rem', backgroundColor: '#ffffff' }}
                  >
                    <option value="CASH">नगद दाखिला (Cash)</option>
                    <option value="FONEPAY">Fonepay (Nepal QR)</option>
                    <option value="ESEWA">eSewa डिजिटल वालेट</option>
                    <option value="KHALTI">Khalti डिजिटल वालेट</option>
                    <option value="CONNECTIPS">ConnectIPS</option>
                    <option value="CLEAN_CASH">Clean for Cash (फोहोरबाट मोहर)</option>
                  </select>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.75rem',
                  borderTop: '1px solid #e2e8f0',
                  paddingTop: '1.25rem',
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowManualAddModal(false)}
                  style={{
                    padding: '0.65rem 1.25rem',
                    backgroundColor: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    color: '#475569',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  रद्द गर्नुहोस्
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  style={{
                    padding: '0.65rem 1.75rem',
                    backgroundColor: '#0f766e',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#ffffff',
                    cursor: createMutation.isPending ? 'wait' : 'pointer',
                    fontWeight: 700,
                    boxShadow: '0 4px 12px rgba(15, 118, 110, 0.25)',
                  }}
                >
                  {createMutation.isPending ? 'रसिद जारी हुँदैछ...' : 'रसिद जारी गर्नुहोस् (Issue Receipt)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RevenueTaxPage;
