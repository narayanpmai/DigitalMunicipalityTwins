import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Project,
  MeasurementBookEntry,
  BoqItem,
  MeasurementBookItemEntry,
} from '../../../types/sectoral';
import { NepaliDatePicker } from '../../../components/common/NepaliDatePicker';
import { adToBs } from '../../../utils/nepaliCalendar';
import { api } from '../../../api/client';
import {
  X,
  Calculator,
  BookOpen,
  DollarSign,
  Plus,
  Save,
  CheckCircle2,
  AlertCircle,
  Layers,
  Trash2,
} from 'lucide-react';

interface MeasurementBookInstallmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  onSaveBOQ?: (boqItems: BoqItem[], syncEstimate?: boolean) => Promise<void>;
  onSaveMB: (entry: Partial<MeasurementBookEntry>) => Promise<void>;
  onRecordPayment: (payload: { amount: number; installmentPhase: string; deductions: any }) => Promise<void>;
}

const BOQ_PRESETS: Array<{ itemDescription: string; unit: string }> = [
  { itemDescription: 'माटो खन्ने तथा सम्याउने कार्य (Earthwork Excavation)', unit: 'घन मी. (m³)' },
  { itemDescription: 'ढुङ्गा सोलिङ तथा चिनाई कार्य (Stone Masonry)', unit: 'घन मी. (m³)' },
  { itemDescription: 'ग्याबियन तारजाली भर्ने कार्य (Gabion Crate Work)', unit: 'घन मी. (m³)' },
  { itemDescription: 'सिमेन्ट कङ्क्रिट ढलान (PCC / RCC Work)', unit: 'घन मी. (m³)' },
  { itemDescription: 'HDPE पाइपलाइन आपूर्ति तथा जडान', unit: 'रनिङ मी. (rm)' },
  { itemDescription: 'नागरिक सूचना पाटी (Signboard) निर्माण', unit: 'थान (nos)' },
];

const toNepaliNum = (num: number | string): string => {
  const nepaliDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  return String(num).replace(/\d/g, (d) => nepaliDigits[parseInt(d, 10)]);
};

export const MeasurementBookInstallmentModal: React.FC<MeasurementBookInstallmentModalProps> = ({
  isOpen,
  onClose,
  project,
  onSaveBOQ,
  onSaveMB,
  onRecordPayment,
}) => {
  const todayBs = adToBs(new Date().toISOString().split('T')[0]) || '२०८१-०४-०१';
  const [activeSubTab, setActiveSubTab] = useState<'boq' | 'mb_list' | 'add_mb' | 'installment_pay'>('mb_list');

  const { data: employees = [] } = useQuery<any[]>({
    queryKey: ['employees-roster'],
    queryFn: async () => {
      const res: any = await api.get('/employees');
      return Array.isArray(res) ? res : res?.data || [];
    },
    staleTime: 60000,
    enabled: isOpen,
  });

  // BOQ State
  const [boqRows, setBoqRows] = useState<BoqItem[]>([]);
  const [syncEstimate, setSyncEstimate] = useState<boolean>(true);
  const [isSavingBOQ, setIsSavingBOQ] = useState<boolean>(false);

  // MB Form state
  const [mbNumber, setMbNumber] = useState<string>('');
  const [mbDateBs, setMbDateBs] = useState<string>(todayBs);
  const [engineerName, setEngineerName] = useState<string>('');
  const [workDescription, setWorkDescription] = useState<string>('');
  const [mbMode, setMbMode] = useState<'itemwise' | 'lumpsum'>('lumpsum');
  const [mbItemDrafts, setMbItemDrafts] = useState<MeasurementBookItemEntry[]>([]);
  const [measuredAmount, setMeasuredAmount] = useState<number>(0);
  const [verifiedBy, setVerifiedBy] = useState<string>('प्रमुख प्रशासकीय अधिकृत / योजना शाखा');
  const [mbRemarks, setMbRemarks] = useState<string>('');
  const [isSubmittingMB, setIsSubmittingMB] = useState<boolean>(false);

  // Installment Pay Form state
  const [installmentPhase, setInstallmentPhase] = useState<string>('प्रथम किस्ता (पेश्की / मोबिलाइजेसन)');
  const [claimAmount, setClaimAmount] = useState<number>(0);
  const [contingencyRate, setContingencyRate] = useState<number>(3);
  const [maintenanceRate, setMaintenanceRate] = useState<number>(3);
  const [securityRate, setSecurityRate] = useState<number>(0);
  const [taxRate, setTaxRate] = useState<number>(1.5);
  const [vatPercent, setVatPercent] = useState<number>(13);
  const [vatWithheldPercent, setVatWithheldPercent] = useState<number>(30);
  const [advanceRecovery, setAdvanceRecovery] = useState<number>(0);
  const [paymentDateBs, setPaymentDateBs] = useState<string>(todayBs);
  const [voucherNumber, setVoucherNumber] = useState<string>('');
  const [payError, setPayError] = useState<string | null>(null);
  const [isSubmittingPay, setIsSubmittingPay] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen || !project) return;
    const count = Array.isArray(project.measurementBook) ? project.measurementBook.length : 0;
    const fyPrefix = project.fiscalYear || '२०८१/०८२';
    const existingBoq: BoqItem[] = Array.isArray(project.boqItems)
      ? (project.boqItems as BoqItem[])
      : [];
    setBoqRows(existingBoq);
    setActiveSubTab('mb_list');
    setMbNumber(`MB-${fyPrefix}-${count + 1}`);
    setMbDateBs(todayBs);
    setEngineerName(project.responsibleEngineer || '');
    setWorkDescription('');
    setMbMode(existingBoq.length > 0 ? 'itemwise' : 'lumpsum');
    setMbItemDrafts(
      existingBoq.map((b) => ({
        boqItemId: b.id,
        itemDescription: b.itemDescription,
        unit: b.unit,
        nos: 1,
        length: undefined,
        breadth: undefined,
        height: undefined,
        quantity: 0,
        rate: b.rate,
        amount: 0,
      })),
    );
    setMeasuredAmount(0);
    setVerifiedBy('प्राविधिक शाखा / प्रमुख प्रशासकीय अधिकृत');
    setMbRemarks('');

    const paymentsCount = Array.isArray(project.installmentDetails?.payments)
      ? project.installmentDetails!.payments.length
      : 0;
    setInstallmentPhase(
      paymentsCount === 0
        ? 'प्रथम किस्ता (पेश्की / मोबिलाइजेसन)'
        : paymentsCount === 1
        ? 'दोस्रो किस्ता'
        : paymentsCount === 2
        ? 'तेस्रो किस्ता'
        : 'अन्तिम किस्ता (Final Payment)',
    );
    const isContr = project.marfat === 'ठेक्का / बोलपत्र';
    setClaimAmount(0);
    setContingencyRate(isContr ? 0 : Number(project.contingencyRatePercent ?? 3));
    setMaintenanceRate(isContr ? 0 : Number(project.maintenanceFundPercent ?? 3));
    setSecurityRate(isContr ? Number(project.contractDetails?.retentionPercent ?? 5) : 0);
    setTaxRate(isContr ? Number(project.contractDetails?.tdsRate ?? 1.5) : 0);
    setVatPercent(isContr ? Number(project.contractDetails?.vatPercent ?? 13) : 0);
    setVatWithheldPercent(isContr ? Number(project.contractDetails?.vatWithheldPercent ?? 30) : 0);
    setAdvanceRecovery(0);
    setPaymentDateBs(todayBs);
    setVoucherNumber(`VCH-${Date.now().toString().slice(-4)}`);
    setPayError(null);
  }, [isOpen, project, todayBs]);

  if (!isOpen || !project) return null;

  const officeCost = Number(project.officeCost || project.budget || 0);
  const paidAmount = Number(project.paidAmount || 0);
  const remainingBudget = Math.max(0, officeCost - paidAmount);
  const financialProg = officeCost > 0 ? Math.min(100, Math.round((paidAmount / officeCost) * 100)) : 0;

  const mbList = Array.isArray(project.measurementBook) ? project.measurementBook : [];
  const paymentLedger = Array.isArray(project.installmentDetails?.payments)
    ? project.installmentDetails!.payments
    : [];
  const totalMeasuredAmount = mbList.reduce((acc, m) => acc + Number(m.measuredAmount || 0), 0);
  const totalBoqAmount = boqRows.reduce((acc, b) => acc + Number(b.quantity || 0) * Number(b.rate || 0), 0);
  const itemwiseTotal = mbItemDrafts.reduce((acc, it) => acc + Number(it.amount || 0), 0);
  const effectiveMbAmount = mbMode === 'itemwise' && mbItemDrafts.length > 0 ? Math.round(itemwiseTotal * 100) / 100 : measuredAmount;

  const handleAddBoqRow = (preset?: { itemDescription: string; unit: string }) => {
    setBoqRows([
      ...boqRows,
      {
        id: `boq-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        sn: boqRows.length + 1,
        itemDescription: preset?.itemDescription || '',
        unit: preset?.unit || 'घन मी. (m³)',
        quantity: 1,
        rate: 0,
        amount: 0,
        completedQuantity: 0,
        remarks: '',
      },
    ]);
  };

  const handleUpdateBoqRow = (idx: number, field: keyof BoqItem, val: any) => {
    const next = [...boqRows];
    const row = { ...next[idx], [field]: val };
    row.amount = Math.round(Number(row.quantity || 0) * Number(row.rate || 0) * 100) / 100;
    next[idx] = row;
    setBoqRows(next);
  };

  const handleRemoveBoqRow = (idx: number) => {
    setBoqRows(boqRows.filter((_, i) => i !== idx));
  };

  const handleSaveBoq = async () => {
    if (!onSaveBOQ) return;
    setIsSavingBOQ(true);
    try {
      const cleaned = boqRows
        .filter((b) => b.itemDescription.trim() !== '')
        .map((b, i) => ({
          ...b,
          sn: i + 1,
          amount: Math.round(Number(b.quantity || 0) * Number(b.rate || 0) * 100) / 100,
        }));
      await onSaveBOQ(cleaned, syncEstimate);
      setMbItemDrafts(
        cleaned.map((b) => ({
          boqItemId: b.id,
          itemDescription: b.itemDescription,
          unit: b.unit,
          nos: 1,
          quantity: 0,
          rate: b.rate,
          amount: 0,
        })),
      );
      if (cleaned.length > 0) setMbMode('itemwise');
    } finally {
      setIsSavingBOQ(false);
    }
  };

  const handleUpdateMbItem = (idx: number, field: keyof MeasurementBookItemEntry, val: any) => {
    const next = [...mbItemDrafts];
    const row = { ...next[idx], [field]: val };
    if (field === 'nos' || field === 'length' || field === 'breadth' || field === 'height') {
      const hasDims =
        row.length !== undefined || row.breadth !== undefined || row.height !== undefined;
      if (hasDims) {
        const nos = Number(row.nos ?? 1);
        const l = row.length !== undefined ? Number(row.length) : 1;
        const b = row.breadth !== undefined ? Number(row.breadth) : 1;
        const h = row.height !== undefined ? Number(row.height) : 1;
        row.quantity = Math.round(nos * l * b * h * 1000) / 1000;
      }
    }
    row.amount = Math.round(Number(row.quantity || 0) * Number(row.rate || 0) * 100) / 100;
    next[idx] = row;
    setMbItemDrafts(next);
  };

  const isContractor = project.marfat === 'ठेक्का / बोलपत्र';
  const billExclVat =
    isContractor && vatPercent > 0
      ? Math.round((claimAmount / (1 + vatPercent / 100)) * 100) / 100
      : claimAmount;
  const vatAmt = isContractor ? Math.max(0, Math.round((claimAmount - billExclVat) * 100) / 100) : 0;
  const vatWithheldAmt = isContractor ? Math.round((vatAmt * vatWithheldPercent) / 100) : 0;
  const dedBaseAmt = isContractor ? billExclVat : claimAmount;
  const contingencyAmt = Math.round((dedBaseAmt * contingencyRate) / 100);
  const maintenanceAmt = Math.round((dedBaseAmt * maintenanceRate) / 100);
  const securityAmt = Math.round((dedBaseAmt * securityRate) / 100);
  const taxAmt = Math.round((dedBaseAmt * taxRate) / 100);
  const advRecAmt = Math.max(0, Math.round(advanceRecovery || 0));
  const totalDeductions = contingencyAmt + maintenanceAmt + securityAmt + taxAmt + vatWithheldAmt + advRecAmt;
  const netPayable = Math.max(0, claimAmount - totalDeductions);

  const handleSubmitMB = async (e: React.FormEvent) => {
    e.preventDefault();
    const activeItems = mbMode === 'itemwise' ? mbItemDrafts.filter((it) => Number(it.quantity) > 0) : [];
    const finalAmt = effectiveMbAmount;
    if (!finalAmt || finalAmt <= 0) return;
    setIsSubmittingMB(true);
    try {
      await onSaveMB({
        mbNumber,
        date: mbDateBs,
        engineerName,
        workDescription,
        mbItems: activeItems.length > 0 ? activeItems : undefined,
        measuredAmount: Number(finalAmt),
        cumulativeAmount: totalMeasuredAmount + Number(finalAmt),
        verifiedBy,
        remarks: mbRemarks,
      });
      setActiveSubTab('mb_list');
    } finally {
      setIsSubmittingMB(false);
    }
  };

  const handleRecordPayment = async () => {
    if (!claimAmount || claimAmount <= 0) {
      setPayError('कृपया मान्य भुक्तानी माग रकम प्रविष्ट गर्नुहोस्।');
      return;
    }
    if (officeCost > 0 && claimAmount > remainingBudget + 0.01) {
      setPayError(`बाँकी निकासा बजेट रु. ${remainingBudget.toLocaleString('en-IN')} भन्दा बढी भुक्तानी गर्न मिल्दैन।`);
      return;
    }
    setPayError(null);
    setIsSubmittingPay(true);
    try {
      await onRecordPayment({
        amount: Number(claimAmount),
        installmentPhase,
        deductions: {
          mode: isContractor ? 'contractor' : 'committee',
          billAmountExclVat: billExclVat,
          vatPercent: isContractor ? vatPercent : 0,
          vatAmount: vatAmt,
          vatWithheldPercent: isContractor ? vatWithheldPercent : 0,
          vatWithheldAmount: vatWithheldAmt,
          tdsPercent: taxRate,
          retentionPercent: securityRate,
          contingencyRate,
          maintenanceRate,
          securityRate,
          taxRate,
          contingencyAmt,
          maintenanceAmt,
          securityAmt,
          taxAmt,
          advanceRecovery: advRecAmt,
          netPayable,
          voucherNumber,
          paymentDateBs,
        },
      });
      onClose();
    } catch (err: any) {
      setPayError(err?.response?.data?.detail || err?.message || 'भुक्तानी निकासा गर्न सकिएन।');
    } finally {
      setIsSubmittingPay(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        overflowY: 'auto',
      }}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl my-6 flex flex-col max-h-[92vh] overflow-hidden border border-slate-200"
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '960px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          border: '1px solid #cbd5e1',
          margin: 'auto',
        }}
      >
        {/* Header */}
        <div
          className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white px-6 py-4 flex items-center justify-between border-b border-emerald-700"
          style={{
            background: 'linear-gradient(135deg, #065f46 0%, #134e4a 100%)',
            color: '#ffffff',
            padding: '1.2rem 1.5rem',
            borderBottom: '1px solid #047857',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-600/50 flex items-center justify-center text-white border border-emerald-400/30">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                किस्ता भुक्तानी तथा नापी किताब (MB) मूल्याङ्कन
              </h2>
              <p className="text-xs text-emerald-200">
                {project.name} | आ.व. {toNepaliNum(project.fiscalYear || '०८२/०८३')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-emerald-200 hover:text-white rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Financial KPI Summary Cards */}
        <div className="bg-slate-100 px-6 py-3 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm">
            <p className="text-slate-500 font-semibold">गाउँपालिका कार्यालय लागत</p>
            <p className="text-sm font-bold text-slate-800 mt-0.5">
              रु. {toNepaliNum(officeCost.toLocaleString('en-IN', { minimumFractionDigits: 2 }))}
            </p>
          </div>
          <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm">
            <p className="text-slate-500 font-semibold">हालसम्म भुक्तानी भएको</p>
            <p className="text-sm font-bold text-emerald-700 mt-0.5">
              रु. {toNepaliNum(paidAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 }))}
            </p>
          </div>
          <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm">
            <p className="text-slate-500 font-semibold">बाँकी निकासा बजेट</p>
            <p className="text-sm font-bold text-amber-700 mt-0.5">
              रु. {toNepaliNum(remainingBudget.toLocaleString('en-IN', { minimumFractionDigits: 2 }))}
            </p>
          </div>
          <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm">
            <p className="text-slate-500 font-semibold">वित्तीय प्रगति</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-sm font-bold text-teal-800">{toNepaliNum(financialProg)}%</span>
              <div className="flex-1 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-teal-600 h-full rounded-full"
                  style={{ width: `${Math.min(financialProg, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="bg-white px-6 py-2 border-b border-slate-200 flex flex-wrap gap-2 text-xs font-semibold text-slate-700">
          <button
            onClick={() => setActiveSubTab('boq')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
              activeSubTab === 'boq'
                ? 'bg-teal-700 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            लगत इस्टिमेट / BOQ ({toNepaliNum(boqRows.length)})
          </button>
          <button
            onClick={() => setActiveSubTab('mb_list')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
              activeSubTab === 'mb_list'
                ? 'bg-teal-700 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            नापी किताब (MB) सूची ({toNepaliNum(mbList.length)})
          </button>
          <button
            onClick={() => setActiveSubTab('add_mb')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
              activeSubTab === 'add_mb'
                ? 'bg-teal-700 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            + नयाँ नापी किताब (Item-wise MB)
          </button>
          <button
            onClick={() => setActiveSubTab('installment_pay')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
              activeSubTab === 'installment_pay'
                ? 'bg-teal-700 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            किस्ता निकासा तथा लेजर ({toNepaliNum(paymentLedger.length)})
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 text-xs bg-slate-50">
          {activeSubTab === 'boq' && (
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-wrap justify-between items-center gap-3 border-b pb-3">
                <div>
                  <h3 className="font-bold text-teal-900 text-sm">
                    आइटम-वाइज प्राविधिक लगत इस्टिमेट (Bill of Quantities - BOQ)
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    प्रत्येक भौतिक कार्यको परिमाण र दर प्रविष्ट गर्नुहोस्; नापी किताब (MB) यसै BOQ बाट स्वतः गणना हुनेछ।
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-900 font-bold">
                    कुल BOQ इस्टिमेट: रु. {toNepaliNum(totalBoqAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 }))}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleAddBoqRow()}
                    className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> आइटम थप्नुहोस्
                  </button>
                </div>
              </div>

              {/* Quick item presets */}
              <div className="flex flex-wrap items-center gap-1.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="font-semibold text-slate-600 mr-1">द्रुत आइटम थप्नुहोस्:</span>
                {BOQ_PRESETS.map((pr, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAddBoqRow(pr)}
                    className="px-2 py-1 bg-white border border-slate-300 hover:border-teal-500 hover:text-teal-800 rounded text-[11px]"
                  >
                    + {pr.itemDescription.split('(')[0].trim()}
                  </button>
                ))}
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="dt-responsive-table-wrapper">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 border-b border-slate-200 font-bold text-slate-700">
                      <tr>
                        <th className="p-2 border-r w-10 text-center">क्र.स.</th>
                        <th className="p-2 border-r min-w-[200px]">कार्य विवरण (Item Description)</th>
                        <th className="p-2 border-r w-28">एकाइ (Unit)</th>
                        <th className="p-2 border-r w-24 text-right">लक्ष्य परिमाण</th>
                        <th className="p-2 border-r w-28 text-right">दर (रु.)</th>
                        <th className="p-2 border-r w-32 text-right">कुल रकम (रु.)</th>
                        <th className="p-2 border-r w-24 text-right">नाप भएको</th>
                        <th className="p-2 w-12 text-center">हटाउने</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {boqRows.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="p-6 text-center text-slate-500">
                            अहिलेसम्म BOQ आइटम थपिएको छैन। माथिको बटनबाट आइटम थप्नुहोस्।
                          </td>
                        </tr>
                      ) : (
                        boqRows.map((row, idx) => (
                          <tr key={row.id || idx}>
                            <td className="p-2 border-r text-center font-semibold text-slate-500">{toNepaliNum(idx + 1)}</td>
                            <td className="p-2 border-r">
                              <input
                                type="text"
                                value={row.itemDescription}
                                onChange={(e) => handleUpdateBoqRow(idx, 'itemDescription', e.target.value)}
                                placeholder="निर्माण कार्यको विवरण"
                                className="w-full px-2 py-1 border rounded"
                              />
                            </td>
                            <td className="p-2 border-r">
                              <input
                                type="text"
                                value={row.unit}
                                onChange={(e) => handleUpdateBoqRow(idx, 'unit', e.target.value)}
                                className="w-full px-2 py-1 border rounded"
                              />
                            </td>
                            <td className="p-2 border-r">
                              <input
                                type="number"
                                step="0.01"
                                min={0}
                                value={row.quantity}
                                onChange={(e) => handleUpdateBoqRow(idx, 'quantity', Number(e.target.value))}
                                className="w-full px-2 py-1 border rounded text-right font-semibold"
                              />
                            </td>
                            <td className="p-2 border-r">
                              <input
                                type="number"
                                step="0.01"
                                min={0}
                                value={row.rate}
                                onChange={(e) => handleUpdateBoqRow(idx, 'rate', Number(e.target.value))}
                                className="w-full px-2 py-1 border rounded text-right"
                              />
                            </td>
                            <td className="p-2 border-r text-right font-bold text-teal-900">
                              {(Number(row.quantity || 0) * Number(row.rate || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="p-2 border-r text-right text-emerald-700 font-semibold">
                              {toNepaliNum(Number(row.completedQuantity || 0))}
                            </td>
                            <td className="p-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveBoqRow(idx)}
                                className="p-1 text-red-500 hover:bg-red-50 rounded"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t">
                <label className="flex items-center gap-2 font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={syncEstimate}
                    onChange={(e) => setSyncEstimate(e.target.checked)}
                    className="rounded text-teal-600"
                  />
                  <span>कुल BOQ योगफललाई योजनाको "प्राविधिक लगत अनुमान" मा अद्यावधिक गर्ने</span>
                </label>

                {onSaveBOQ && (
                  <button
                    type="button"
                    disabled={isSavingBOQ}
                    onClick={handleSaveBoq}
                    className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg font-semibold flex items-center gap-2 shadow disabled:opacity-60"
                  >
                    <Save className="w-4 h-4" />
                    {isSavingBOQ ? 'सुरक्षित हुँदैछ...' : 'BOQ लगत इस्टिमेट सुरक्षित गर्नुहोस्'}
                  </button>
                )}
              </div>
            </div>
          )}

          {activeSubTab === 'mb_list' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-800 text-sm">
                  इन्जिनियर नापी किताब (Measurement Book) विवरण
                </h3>
                <span className="text-teal-800 font-bold bg-teal-50 border border-teal-200 px-3 py-1 rounded-full">
                  कुल नापजाँच मूल्याङ्कन: रु. {toNepaliNum(totalMeasuredAmount.toLocaleString('en-IN'))}
                </span>
              </div>

              <div className="bg-white rounded-lg border border-slate-200 overflow-x-auto shadow-sm">
                <div className="dt-responsive-table-wrapper">
<table className="w-full text-left">
                  <thead className="bg-slate-100 border-b border-slate-200 font-bold text-slate-700">
                    <tr>
                      <th className="p-2.5 border-r">नापी किताब (MB) नं.</th>
                      <th className="p-2.5 border-r">नापजाँच मिति</th>
                      <th className="p-2.5 border-r">इन्जिनियरको नाम</th>
                      <th className="p-2.5 border-r">नाप गरिएको कामको विवरण</th>
                      <th className="p-2.5 border-r text-right">नाप रकम (रु.)</th>
                      <th className="p-2.5 border-r text-right">कुल संचित रकम (रु.)</th>
                      <th className="p-2.5">प्रमाणित गर्ने</th>
                    </tr>
                  </thead>
                <tbody className="divide-y divide-slate-200">
                  {mbList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-slate-500">
                        अहिलेसम्म कुनै नापी किताब (Measurement Book) प्रविष्ट गरिएको छैन। "+ नयाँ नापी किताब प्रविष्टि" बाट थप्नुहोस्।
                      </td>
                    </tr>
                  ) : (
                    mbList.map((m, idx) => (
                      <tr key={m.id || idx} className="hover:bg-slate-50">
                        <td className="p-2.5 border-r font-mono font-bold text-teal-800">{m.mbNumber}</td>
                        <td className="p-2.5 border-r">{toNepaliNum(m.date)}</td>
                        <td className="p-2.5 border-r">{m.engineerName}</td>
                        <td className="p-2.5 border-r max-w-xs">
                          <div>{m.workDescription || '-'}</div>
                          {Array.isArray(m.mbItems) && m.mbItems.length > 0 && (
                            <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200 text-[10px] font-semibold">
                              {toNepaliNum(m.mbItems.length)} BOQ आइटम नापिएको
                            </span>
                          )}
                        </td>
                        <td className="p-2.5 border-r text-right font-bold text-emerald-700">
                          रु. {toNepaliNum(Number(m.measuredAmount || 0).toLocaleString('en-IN'))}
                        </td>
                        <td className="p-2.5 border-r text-right font-semibold text-slate-700">
                          रु. {toNepaliNum(Number(m.cumulativeAmount || 0).toLocaleString('en-IN'))}
                        </td>
                        <td className="p-2.5 text-slate-600">{m.verifiedBy || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
                </table>
</div>
              </div>
            </div>
          )}

          {activeSubTab === 'add_mb' && (
            <form onSubmit={handleSubmitMB} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-teal-900 text-sm border-b pb-2">
                नयाँ नापी किताब (Measurement Book) प्रविष्टि फारम
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">नापी किताब (MB) नम्बर</label>
                  <input
                    type="text"
                    value={mbNumber}
                    onChange={(e) => setMbNumber(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg font-mono focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>

                <div>
                  <NepaliDatePicker
                    label="नापजाँच मिति (वि.सं.)"
                    value={mbDateBs}
                    onChange={(bs) => setMbDateBs(bs)}
                    required
                    inputStyle={{ padding: '0.45rem 0.65rem', fontSize: '0.75rem' }}
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">प्राविधिक / इन्जिनियरको नाम</label>
                  <select
                    value={employees.some((e) => (e.fullName || e.full_name) === engineerName) ? engineerName : '__custom__'}
                    onChange={(e) => {
                      if (e.target.value !== '__custom__') setEngineerName(e.target.value);
                    }}
                    className="w-full px-3 py-2 border rounded-lg bg-white mb-1"
                  >
                    <option value="">-- कर्मचारी छान्नुहोस् --</option>
                    {employees.map((emp) => {
                      const n = emp.fullName || emp.full_name;
                      return <option key={emp.id} value={n}>{n} {emp.designation ? `(${emp.designation})` : ''}</option>;
                    })}
                    <option value="__custom__">अन्य (तल टाइप गर्नुहोस्)</option>
                  </select>
                  <input
                    type="text"
                    value={engineerName}
                    onChange={(e) => setEngineerName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                    placeholder="इन्जिनियरको नाम"
                    required
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-semibold text-slate-700">नापजाँच प्रविष्टि विधि</label>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => setMbMode('itemwise')}
                        disabled={mbItemDrafts.length === 0}
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          mbMode === 'itemwise'
                            ? 'bg-teal-700 text-white'
                            : 'bg-slate-100 text-slate-600 disabled:opacity-40'
                        }`}
                      >
                        आइटम-वाइज (BOQ)
                      </button>
                      <button
                        type="button"
                        onClick={() => setMbMode('lumpsum')}
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          mbMode === 'lumpsum' ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        एकमुष्ट रकम
                      </button>
                    </div>
                  </div>
                  <input
                    type="number"
                    value={effectiveMbAmount}
                    readOnly={mbMode === 'itemwise' && mbItemDrafts.length > 0}
                    onChange={(e) => setMeasuredAmount(Number(e.target.value))}
                    className={`w-full px-3 py-2 border rounded-lg font-semibold text-teal-800 focus:ring-2 focus:ring-teal-500 ${
                      mbMode === 'itemwise' && mbItemDrafts.length > 0 ? 'bg-teal-50' : ''
                    }`}
                    required
                  />
                  {totalBoqAmount > 0 && totalMeasuredAmount + effectiveMbAmount > totalBoqAmount && (
                    <div className="text-[11px] text-amber-700 font-semibold mt-1">
                      ⚠️ ध्यान दिनुहोस्: संचित नापी रकम BOQ इस्टिमेटभन्दा बढी भइरहेको छ (Variation आदेश आवश्यक पर्न सक्छ)।
                    </div>
                  )}
                </div>

                {mbMode === 'itemwise' && mbItemDrafts.length > 0 && (
                  <div className="md:col-span-2 border border-teal-200 rounded-lg overflow-hidden bg-slate-50">
                    <div className="bg-teal-50 px-3 py-2 font-bold text-teal-900 border-b border-teal-200 flex justify-between">
                      <span>BOQ अनुसार आइटम-वाइज नापजाँच (Nos × L × B × H)</span>
                      <span>कुल आइटम योगफल: रु. {toNepaliNum(itemwiseTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 }))}</span>
                    </div>
                    <div className="dt-responsive-table-wrapper">
                      <table className="w-full text-left text-[11px]">
                        <thead className="bg-white border-b text-slate-600">
                          <tr>
                            <th className="p-2 border-r">आइटम विवरण</th>
                            <th className="p-2 border-r w-16">Nos</th>
                            <th className="p-2 border-r w-16">L</th>
                            <th className="p-2 border-r w-16">B</th>
                            <th className="p-2 border-r w-16">H</th>
                            <th className="p-2 border-r w-20 text-right">परिमाण (Qty)</th>
                            <th className="p-2 border-r w-20 text-right">दर (रु.)</th>
                            <th className="p-2 w-24 text-right">रकम (रु.)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                          {mbItemDrafts.map((it, idx) => (
                            <tr key={it.boqItemId || idx}>
                              <td className="p-2 border-r font-semibold">
                                <div>{it.itemDescription}</div>
                                <span className="text-[10px] text-slate-400">{it.unit}</span>
                              </td>
                              <td className="p-1.5 border-r">
                                <input
                                  type="number"
                                  min={0}
                                  value={it.nos ?? 1}
                                  onChange={(e) => handleUpdateMbItem(idx, 'nos', Number(e.target.value))}
                                  className="w-full px-1.5 py-1 border rounded text-right"
                                />
                              </td>
                              <td className="p-1.5 border-r">
                                <input
                                  type="number"
                                  step="0.01"
                                  placeholder="-"
                                  value={it.length ?? ''}
                                  onChange={(e) => handleUpdateMbItem(idx, 'length', e.target.value === '' ? undefined : Number(e.target.value))}
                                  className="w-full px-1.5 py-1 border rounded text-right"
                                />
                              </td>
                              <td className="p-1.5 border-r">
                                <input
                                  type="number"
                                  step="0.01"
                                  placeholder="-"
                                  value={it.breadth ?? ''}
                                  onChange={(e) => handleUpdateMbItem(idx, 'breadth', e.target.value === '' ? undefined : Number(e.target.value))}
                                  className="w-full px-1.5 py-1 border rounded text-right"
                                />
                              </td>
                              <td className="p-1.5 border-r">
                                <input
                                  type="number"
                                  step="0.01"
                                  placeholder="-"
                                  value={it.height ?? ''}
                                  onChange={(e) => handleUpdateMbItem(idx, 'height', e.target.value === '' ? undefined : Number(e.target.value))}
                                  className="w-full px-1.5 py-1 border rounded text-right"
                                />
                              </td>
                              <td className="p-1.5 border-r">
                                <input
                                  type="number"
                                  step="0.01"
                                  value={it.quantity}
                                  onChange={(e) => handleUpdateMbItem(idx, 'quantity', Number(e.target.value))}
                                  className="w-full px-1.5 py-1 border rounded text-right font-semibold"
                                />
                              </td>
                              <td className="p-2 border-r text-right text-slate-600">{Number(it.rate || 0).toLocaleString()}</td>
                              <td className="p-2 text-right font-bold text-teal-800">{Number(it.amount || 0).toLocaleString('en-IN')}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="md:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">नाप गरिएको भौतिक कामको विवरण</label>
                  <textarea
                    rows={2}
                    value={workDescription}
                    onChange={(e) => setWorkDescription(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                    placeholder="उदा: ग्याबियन वाल, कङ्क्रिट ढलान र ग्रेडिङ कार्य सम्पन्न"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">प्रमाणित गर्ने पदाधिकारी</label>
                  <input
                    type="text"
                    value={verifiedBy}
                    onChange={(e) => setVerifiedBy(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">प्राविधिक कैफियत</label>
                  <input
                    type="text"
                    value={mbRemarks}
                    onChange={(e) => setMbRemarks(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setActiveSubTab('mb_list')}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700"
                >
                  रद्द गर्नुहोस्
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingMB}
                  className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg font-semibold flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {isSubmittingMB ? 'सुरक्षित गर्दै...' : 'नापी किताब सुरक्षित गर्नुहोस्'}
                </button>
              </div>
            </form>
          )}

          {activeSubTab === 'installment_pay' && (
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-5">
              <h3 className="font-bold text-teal-900 text-sm border-b pb-2 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-teal-600" />
                किस्ता भुक्तानी निकासा, लेजर तथा वैधानिक कट्टी हिसाब (Deduction Breakdown)
              </h3>

              {payError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{payError}</span>
                </div>
              )}

              {paymentLedger.length > 0 && (
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="bg-slate-100 px-3 py-2 font-bold text-slate-700 border-b border-slate-200">
                    पहिले निकासा भएका किस्ताहरूको लेजर ({toNepaliNum(paymentLedger.length)} किस्ता)
                  </div>
                  <div className="dt-responsive-table-wrapper">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-50 border-b text-slate-600">
                        <tr>
                          <th className="p-2 border-r">क्र.स.</th>
                          <th className="p-2 border-r">किस्ता चरण</th>
                          <th className="p-2 border-r">भौचर नं. / मिति</th>
                          <th className="p-2 border-r text-right">कुल बिल (रु.)</th>
                          <th className="p-2 border-r text-right">कट्टी / कर / धरौटी</th>
                          <th className="p-2 text-right">खुद बैंक निकासा (रु.)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {paymentLedger.map((pay, idx) => {
                          const ded = pay.deductions || {};
                          const totalDedRow = Number(
                            ded.totalDeductions ??
                              Number(ded.contingencyAmt || 0) +
                                Number(ded.maintenanceAmt || 0) +
                                Number(ded.securityAmt || ded.retentionAmount || 0) +
                                Number(ded.taxAmt || ded.tdsAmount || 0) +
                                Number(ded.vatWithheldAmount || 0) +
                                Number(ded.advanceRecovery || 0),
                          );
                          return (
                            <tr key={pay.id || idx}>
                              <td className="p-2 border-r">{toNepaliNum(idx + 1)}</td>
                              <td className="p-2 border-r font-semibold text-teal-900">
                                <div>{pay.installmentPhase}</div>
                                {ded.mode === 'contractor' && (
                                  <span className="text-[10px] text-amber-700 font-semibold">
                                    ठेक्का (VAT {toNepaliNum(ded.vatPercent ?? 13)}% | TDS {toNepaliNum(ded.tdsPercent ?? 1.5)}%)
                                  </span>
                                )}
                              </td>
                              <td className="p-2 border-r font-mono">
                                {ded.voucherNumber || '-'} ({toNepaliNum(ded.paymentDateBs || '-')})
                              </td>
                              <td className="p-2 border-r text-right font-semibold">
                                रु. {toNepaliNum(Number(pay.amount || 0).toLocaleString('en-IN'))}
                              </td>
                              <td className="p-2 border-r text-right text-red-700 font-medium">
                                रु. {toNepaliNum(totalDedRow.toLocaleString('en-IN'))}
                              </td>
                              <td className="p-2 text-right font-bold text-emerald-700">
                                रु. {toNepaliNum(Number(ded.netPayable ?? pay.amount ?? 0).toLocaleString('en-IN'))}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">किस्ता चरण (Phase)</label>
                  <select
                    value={installmentPhase}
                    onChange={(e) => {
                      setInstallmentPhase(e.target.value);
                      if (e.target.value === 'अन्तिम किस्ता (Final Payment)' && isContractor) {
                        setSecurityRate(5);
                      }
                    }}
                    className="w-full px-3 py-2 border rounded-lg bg-white"
                  >
                    <option value="प्रथम किस्ता (पेश्की / मोबिलाइजेसन)">१. प्रथम किस्ता (पेश्की / मोबिलाइजेसन)</option>
                    <option value="दोस्रो किस्ता">२. दोस्रो किस्ता (प्रगति मूल्याङ्कनको आधारमा)</option>
                    <option value="तेस्रो किस्ता">३. तेस्रो किस्ता</option>
                    <option value="अन्तिम किस्ता (Final Payment)">४. अन्तिम किस्ता (Final Payment)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {isContractor ? 'कुल बिल रकम (VAT सहित रु.)' : 'भुक्तानी माग रकम (रु.)'}{' '}
                    <span className="text-[10px] text-slate-500">(अधिकतम: रु. {remainingBudget.toLocaleString()})</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={officeCost > 0 ? remainingBudget : undefined}
                    value={claimAmount}
                    onChange={(e) => setClaimAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg font-bold text-teal-900"
                    placeholder="रु. मा"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">भुक्तानी आदेश / भौचर नं.</label>
                  <input
                    type="text"
                    value={voucherNumber}
                    onChange={(e) => setVoucherNumber(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg font-mono"
                  />
                </div>

                <div>
                  <NepaliDatePicker
                    label="निकासा मिति (वि.सं.)"
                    value={paymentDateBs}
                    onChange={(bs) => setPaymentDateBs(bs)}
                    inputStyle={{ padding: '0.45rem 0.65rem', fontSize: '0.75rem' }}
                  />
                </div>
              </div>

              {/* Contractor VAT Breakdown Banner when marfat === ठेक्का / बोलपत्र */}
              {isContractor && (
                <div className="border border-amber-300 bg-amber-50/70 rounded-lg p-3 space-y-2">
                  <div className="flex flex-wrap justify-between items-center gap-2 text-xs font-bold text-amber-950">
                    <span>ठेक्का / बोलपत्र रनिङ बिल कर तथा भ्याट हिसाब (Contractor VAT / TDS / Retention)</span>
                    {project.contractorPan && (
                      <span className="px-2 py-0.5 bg-white border border-amber-300 rounded font-mono">
                        PAN/VAT नं.: {project.contractorPan}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
                    <div className="bg-white p-2 rounded border border-amber-200">
                      <div className="text-slate-500">भ्याट बाहेक बिल रकम (Excl. VAT)</div>
                      <div className="font-bold text-slate-900 text-xs">
                        रु. {toNepaliNum(billExclVat.toLocaleString('en-IN', { minimumFractionDigits: 2 }))}
                      </div>
                    </div>
                    <div className="bg-white p-2 rounded border border-amber-200">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">मू.अ.कर (VAT %)</span>
                        <input
                          type="number"
                          step="1"
                          min={0}
                          max={20}
                          value={vatPercent}
                          onChange={(e) => setVatPercent(Number(e.target.value))}
                          className="w-12 px-1 py-0.5 border rounded text-right font-bold"
                        />
                      </div>
                      <div className="font-bold text-slate-900 text-xs">
                        रु. {toNepaliNum(vatAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 }))}
                      </div>
                    </div>
                    <div className="bg-white p-2 rounded border border-amber-200">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">कोष दाखिला भ्याट कट्टी (%)</span>
                        <select
                          value={vatWithheldPercent}
                          onChange={(e) => setVatWithheldPercent(Number(e.target.value))}
                          className="px-1 py-0.5 border rounded font-bold bg-white"
                        >
                          <option value={30}>३०%</option>
                          <option value={50}>५०%</option>
                          <option value={0}>०%</option>
                        </select>
                      </div>
                      <div className="font-bold text-red-700 text-xs">
                        - रु. {toNepaliNum(vatWithheldAmt.toLocaleString('en-IN'))}
                      </div>
                    </div>
                    <div className="bg-white p-2 rounded border border-amber-200">
                      <div className="text-slate-500 mb-0.5">पेश्की फर्स्यौट (Advance Rec.)</div>
                      <input
                        type="number"
                        min={0}
                        value={advanceRecovery}
                        onChange={(e) => setAdvanceRecovery(Number(e.target.value))}
                        className="w-full px-1.5 py-0.5 border rounded text-right font-bold text-red-700"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Deduction calculation sheet with editable rates */}
              <div className="border border-slate-300 rounded-lg p-4 bg-slate-50 space-y-3">
                <h4 className="font-bold text-slate-800 text-xs text-teal-950">
                  कानूनी कट्टी विवरण तालिका (प्रतिशत आवश्यकतानुसार समायोजन गर्न सकिन्छ):
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-white p-2.5 rounded border border-slate-200 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-semibold">कन्टिन्जेन्सी (%)</span>
                      <input
                        type="number"
                        step="0.5"
                        min={0}
                        max={20}
                        value={contingencyRate}
                        onChange={(e) => setContingencyRate(Number(e.target.value))}
                        className="w-14 px-1 py-0.5 border rounded text-right font-bold"
                      />
                    </div>
                    <p className="font-bold text-slate-800">रु. {toNepaliNum(contingencyAmt.toLocaleString('en-IN'))}</p>
                  </div>
                  <div className="bg-white p-2.5 rounded border border-slate-200 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-semibold">मर्मत कोष (%)</span>
                      <input
                        type="number"
                        step="0.5"
                        min={0}
                        max={20}
                        value={maintenanceRate}
                        onChange={(e) => setMaintenanceRate(Number(e.target.value))}
                        className="w-14 px-1 py-0.5 border rounded text-right font-bold"
                      />
                    </div>
                    <p className="font-bold text-slate-800">रु. {toNepaliNum(maintenanceAmt.toLocaleString('en-IN'))}</p>
                  </div>
                  <div className="bg-white p-2.5 rounded border border-slate-200 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-semibold">{isContractor ? 'धरौटी / Retention (%)' : 'धरौटी (%)'}</span>
                      <input
                        type="number"
                        step="0.5"
                        min={0}
                        max={20}
                        value={securityRate}
                        onChange={(e) => setSecurityRate(Number(e.target.value))}
                        className="w-14 px-1 py-0.5 border rounded text-right font-bold"
                      />
                    </div>
                    <p className="font-bold text-slate-800">रु. {toNepaliNum(securityAmt.toLocaleString('en-IN'))}</p>
                  </div>
                  <div className="bg-white p-2.5 rounded border border-slate-200 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-semibold">अग्रिम कर / TDS (%)</span>
                      <input
                        type="number"
                        step="0.5"
                        min={0}
                        max={20}
                        value={taxRate}
                        onChange={(e) => setTaxRate(Number(e.target.value))}
                        className="w-14 px-1 py-0.5 border rounded text-right font-bold"
                      />
                    </div>
                    <p className="font-bold text-slate-800">रु. {toNepaliNum(taxAmt.toLocaleString('en-IN'))}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between pt-3 border-t border-slate-300 gap-3">
                  <div>
                    <span className="text-slate-600 font-semibold">कुल कट्टी रकम: </span>
                    <span className="font-bold text-red-700">रु. {toNepaliNum(totalDeductions.toLocaleString('en-IN'))}</span>
                  </div>

                  <div className="bg-emerald-100 border border-emerald-300 px-4 py-2 rounded-lg text-emerald-950">
                    <span className="text-xs font-semibold">
                      {isContractor
                        ? 'ठेकेदार / निर्माण व्यवसायीको बैंक खातामा जाने खुद रकम (Net Payable): '
                        : 'उपभोक्ता समितिको बैंक खातामा जाने खुद रकम (Net Payable): '}
                    </span>
                    <span className="text-base font-black ml-2">रु. {toNepaliNum(netPayable.toLocaleString('en-IN', { minimumFractionDigits: 2 }))}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700"
                >
                  बन्द गर्नुहोस्
                </button>
                <button
                  type="button"
                  disabled={isSubmittingPay}
                  onClick={handleRecordPayment}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold flex items-center gap-2 shadow"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {isSubmittingPay ? 'निकासा गरिँदै...' : 'किस्ता भुक्तानी स्वीकृत तथा निकासा गर्नुहोस्'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
