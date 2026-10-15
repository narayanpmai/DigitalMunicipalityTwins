import React, { useState } from 'react';
import { Project, MeasurementBookEntry } from '../../../types/sectoral';
import {
  X,
  Calculator,
  BookOpen,
  DollarSign,
  Plus,
  Save,
  CheckCircle2,
  Calendar,
  Layers,
  FileCheck,
  TrendingUp,
} from 'lucide-react';

interface MeasurementBookInstallmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  onSaveMB: (entry: Partial<MeasurementBookEntry>) => Promise<void>;
  onRecordPayment: (payload: { amount: number; installmentPhase: string; deductions: any }) => Promise<void>;
}

const toNepaliNum = (num: number | string): string => {
  const nepaliDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  return String(num).replace(/\d/g, (d) => nepaliDigits[parseInt(d, 10)]);
};

export const MeasurementBookInstallmentModal: React.FC<MeasurementBookInstallmentModalProps> = ({
  isOpen,
  onClose,
  project,
  onSaveMB,
  onRecordPayment,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'mb_list' | 'add_mb' | 'installment_pay'>('mb_list');

  // MB Form state
  const [mbNumber, setMbNumber] = useState<string>(`MB-०८२/०८३-${Date.now().toString().slice(-3)}`);
  const [mbDateBs, setMbDateBs] = useState<string>('२०८३-०३-०२');
  const [engineerName, setEngineerName] = useState<string>('इन्जिनियर सुबास श्रेष्ठ');
  const [workDescription, setWorkDescription] = useState<string>('ग्याबियन जाली, ढुङ्गा चिनाई र माटो कटिङ कार्य नापजाँच');
  const [measuredAmount, setMeasuredAmount] = useState<number>(100000);
  const [verifiedBy, setVerifiedBy] = useState<string>('प्रमुख प्रशासकीय अधिकृत / योजना शाखा');
  const [mbRemarks, setMbRemarks] = useState<string>('प्राविधिक स्पेसिफिकेसन अनुसार गुणस्तर सन्तोषजनक');
  const [isSubmittingMB, setIsSubmittingMB] = useState<boolean>(false);

  // Installment Pay Form state
  const [installmentPhase, setInstallmentPhase] = useState<string>('दोस्रो किस्ता');
  const [claimAmount, setClaimAmount] = useState<number>(100000);
  const [contingencyRate, setContingencyRate] = useState<number>(3); // 3%
  const [maintenanceRate, setMaintenanceRate] = useState<number>(3); // 3%
  const [securityRate, setSecurityRate] = useState<number>(0); // 5% on final
  const [taxRate, setTaxRate] = useState<number>(1.5); // 1.5%
  const [paymentDateBs, setPaymentDateBs] = useState<string>('२०८३-०३-०५');
  const [voucherNumber, setVoucherNumber] = useState<string>(`VCH-${Date.now().toString().slice(-4)}`);
  const [isSubmittingPay, setIsSubmittingPay] = useState<boolean>(false);

  if (!isOpen || !project) return null;

  const officeCost = Number(project.officeCost || project.budget || 0);
  const committeeCost = Number(project.committeeCost || 0);
  const totalAgreed = officeCost + committeeCost;
  const paidAmount = Number(project.paidAmount || 0);
  const remainingBudget = Math.max(0, officeCost - paidAmount);
  const financialProg = officeCost > 0 ? Math.round((paidAmount / officeCost) * 100) : 0;

  // Measurement book calculations
  const mbList = project.measurementBook || [
    {
      id: 'mb-seed-1',
      mbNumber: 'MB-०८२/०८३-०१',
      date: '२०८३-०२-२८',
      engineerName: 'इन्जिनियर सुबास श्रेष्ठ',
      workDescription: 'जग खन्ने तथा ढुङ्गा चिनाई कार्य नापजाँच',
      measuredAmount: Math.round(officeCost * 0.4),
      cumulativeAmount: Math.round(officeCost * 0.4),
      verifiedBy: 'प्राविधिक शाखा प्रमुख',
      remarks: 'मापदण्ड अनुसार सम्पन्न',
    },
  ];

  const totalMeasuredAmount = mbList.reduce((acc, m) => acc + Number(m.measuredAmount || 0), 0);

  // Deductions calculations
  const contingencyAmt = Math.round((claimAmount * contingencyRate) / 100);
  const maintenanceAmt = Math.round((claimAmount * maintenanceRate) / 100);
  const securityAmt = Math.round((claimAmount * securityRate) / 100);
  const taxAmt = Math.round((claimAmount * taxRate) / 100);
  const totalDeductions = contingencyAmt + maintenanceAmt + securityAmt + taxAmt;
  const netPayable = Math.max(0, claimAmount - totalDeductions);

  const handleSubmitMB = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingMB(true);
    try {
      await onSaveMB({
        mbNumber,
        date: mbDateBs,
        engineerName,
        workDescription,
        measuredAmount: Number(measuredAmount),
        cumulativeAmount: totalMeasuredAmount + Number(measuredAmount),
        verifiedBy,
        remarks: mbRemarks,
      });
      setActiveSubTab('mb_list');
    } finally {
      setIsSubmittingMB(false);
    }
  };

  const handleRecordPayment = async () => {
    setIsSubmittingPay(true);
    try {
      await onRecordPayment({
        amount: Number(claimAmount),
        installmentPhase,
        deductions: {
          contingencyAmt,
          maintenanceAmt,
          securityAmt,
          taxAmt,
          netPayable,
          voucherNumber,
          paymentDateBs,
        },
      });
      onClose();
    } finally {
      setIsSubmittingPay(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl my-6 flex flex-col max-h-[92vh] overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white px-6 py-4 flex items-center justify-between border-b border-emerald-700">
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
        <div className="bg-white px-6 py-2 border-b border-slate-200 flex gap-3 text-xs font-semibold text-slate-700">
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
            + नयाँ नापी किताब प्रविष्टि
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
            किस्ता निकासा तथा कट्टी हिसाब
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 text-xs bg-slate-50">
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
                    {mbList.map((m, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-2.5 border-r font-mono font-bold text-teal-800">{m.mbNumber}</td>
                        <td className="p-2.5 border-r">{toNepaliNum(m.date)}</td>
                        <td className="p-2.5 border-r">{m.engineerName}</td>
                        <td className="p-2.5 border-r max-w-xs">{m.workDescription || '-'}</td>
                        <td className="p-2.5 border-r text-right font-bold text-emerald-700">
                          रु. {toNepaliNum(Number(m.measuredAmount || 0).toLocaleString('en-IN'))}
                        </td>
                        <td className="p-2.5 border-r text-right font-semibold text-slate-700">
                          रु. {toNepaliNum(Number(m.cumulativeAmount || 0).toLocaleString('en-IN'))}
                        </td>
                        <td className="p-2.5 text-slate-600">{m.verifiedBy || '-'}</td>
                      </tr>
                    ))}
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
                  <label className="block font-semibold text-slate-700 mb-1">नापजाँच मिति (वि.सं.)</label>
                  <input
                    type="text"
                    value={mbDateBs}
                    onChange={(e) => setMbDateBs(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                    placeholder="२०८३-०३-०२"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">प्राविधिक / इन्जिनियरको नाम</label>
                  <input
                    type="text"
                    value={engineerName}
                    onChange={(e) => setEngineerName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">नापजाँच मूल्याङ्कन रकम (रु.)</label>
                  <input
                    type="number"
                    value={measuredAmount}
                    onChange={(e) => setMeasuredAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg font-semibold text-teal-800 focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>

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
                किस्ता भुक्तानी निकासा तथा वैधानिक कट्टी हिसाब (Deduction Breakdown)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">किस्ता चरण (Phase)</label>
                  <select
                    value={installmentPhase}
                    onChange={(e) => {
                      setInstallmentPhase(e.target.value);
                      if (e.target.value === 'अन्तिम किस्ता (Final Payment)') {
                        setSecurityRate(5);
                      } else {
                        setSecurityRate(0);
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
                  <label className="block font-semibold text-slate-700 mb-1">भुक्तानी माग रकम (Claim Amount) रु.</label>
                  <input
                    type="number"
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
              </div>

              {/* Deduction calculation sheet */}
              <div className="border border-slate-300 rounded-lg p-4 bg-slate-50 space-y-3">
                <h4 className="font-bold text-slate-800 text-xs text-teal-950">
                  कानूनी कट्टी विवरण तालिका (Statutory Deductions):
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-white p-2.5 rounded border border-slate-200">
                    <p className="text-slate-500 font-semibold">कन्टिन्जेन्सी ({contingencyRate}%):</p>
                    <p className="font-bold text-slate-800 mt-0.5">रु. {toNepaliNum(contingencyAmt.toLocaleString('en-IN'))}</p>
                  </div>
                  <div className="bg-white p-2.5 rounded border border-slate-200">
                    <p className="text-slate-500 font-semibold">मर्मत सम्भार कोष ({maintenanceRate}%):</p>
                    <p className="font-bold text-slate-800 mt-0.5">रु. {toNepaliNum(maintenanceAmt.toLocaleString('en-IN'))}</p>
                  </div>
                  <div className="bg-white p-2.5 rounded border border-slate-200">
                    <p className="text-slate-500 font-semibold">धरौटी कट्टी ({securityRate}%):</p>
                    <p className="font-bold text-slate-800 mt-0.5">रु. {toNepaliNum(securityAmt.toLocaleString('en-IN'))}</p>
                  </div>
                  <div className="bg-white p-2.5 rounded border border-slate-200">
                    <p className="text-slate-500 font-semibold">सामाजिक सुरक्षा/अग्रिम कर ({taxRate}%):</p>
                    <p className="font-bold text-slate-800 mt-0.5">रु. {toNepaliNum(taxAmt.toLocaleString('en-IN'))}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between pt-3 border-t border-slate-300 gap-3">
                  <div>
                    <span className="text-slate-600 font-semibold">कुल कट्टी रकम: </span>
                    <span className="font-bold text-red-700">रु. {toNepaliNum(totalDeductions.toLocaleString('en-IN'))}</span>
                  </div>

                  <div className="bg-emerald-100 border border-emerald-300 px-4 py-2 rounded-lg text-emerald-950">
                    <span className="text-xs font-semibold">उपभोक्ता समितिको बैंक खातामा जाने खुद रकम (Net Payable): </span>
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
