import React, { useState } from 'react';
import { Project, FarfarakDetails } from '../../../types/sectoral';
import {
  X,
  CheckCircle2,
  Award,
  FileText,
  ShieldCheck,
  Printer,
  DollarSign,
  AlertCircle,
  Building,
} from 'lucide-react';

interface ProjectFarfarakModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  onProcessFarfarak: (data: Partial<FarfarakDetails>) => Promise<void>;
  onOpenLetter: (letterType: 'completion_farfarak') => void;
}

const toNepaliNum = (num: number | string): string => {
  const nepaliDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  return String(num).replace(/\d/g, (d) => nepaliDigits[parseInt(d, 10)]);
};

export const ProjectFarfarakModal: React.FC<ProjectFarfarakModalProps> = ({
  isOpen,
  onClose,
  project,
  onProcessFarfarak,
  onOpenLetter,
}) => {
  if (!isOpen || !project) return null;

  const totalCost = Number(project.officeCost || project.budget || 0);
  const defaultMaintenance = Math.round(totalCost * 0.03); // 3%
  const defaultSecurity = Math.round(totalCost * 0.05); // 5%

  const [farfarakDate, setFarfarakDate] = useState<string>(
    project.farfarakDetails?.farfarakDate || 'मिति उपलब्ध छैन',
  );
  const [finalAuditedCost, setFinalAuditedCost] = useState<number>(
    project.farfarakDetails?.finalAuditedCost || totalCost,
  );
  const [maintenanceFund, setMaintenanceFund] = useState<number>(
    project.farfarakDetails?.maintenanceFundRetained !== undefined
      ? project.farfarakDetails.maintenanceFundRetained
      : defaultMaintenance,
  );
  const [securityDeposit, setSecurityDeposit] = useState<number>(
    project.farfarakDetails?.securityDepositRefunded !== undefined
      ? project.farfarakDetails.securityDepositRefunded
      : defaultSecurity,
  );
  const [completionCertNo, setCompletionCertNo] = useState<string>(
    project.farfarakDetails?.completionCertificateNo ||
      `PPK-CMP-${project.projectCode.slice(-7)}`,
  );
  const [handoverTo, setHandoverTo] = useState<string>(
    project.farfarakDetails?.handoverTo ||
      `पाँचपोखरी थाङपाल गाउँपालिका वडा नं. ${project.wardNumber} कार्यालय तथा उपभोक्ता समुदाय`,
  );
  const [remarks, setRemarks] = useState<string>(
    project.farfarakDetails?.remarks ||
      'सम्पूर्ण कार्य सन्तोषजनक रूपमा सम्पन्न भई आयोजना समुदायलाई हस्तान्तरण तथा फरफारक स्वीकृत।',
  );

  // Mandatory checklist toggles
  const [checkWorkDone, setCheckWorkDone] = useState(true);
  const [checkMBVerified, setCheckMBVerified] = useState(true);
  const [checkSocialAudit, setCheckSocialAudit] = useState(true);
  const [checkWardRec, setCheckWardRec] = useState(true);
  const [checkMaintenanceFund, setCheckMaintenanceFund] = useState(true);

  const [isProcessing, setIsProcessing] = useState(false);

  const allChecked =
    checkWorkDone &&
    checkMBVerified &&
    checkSocialAudit &&
    checkWardRec &&
    checkMaintenanceFund;

  const handleProcess = async () => {
    setIsProcessing(true);
    try {
      await onProcessFarfarak({
        isFarfarakDone: true,
        farfarakDate,
        finalAuditedCost: Number(finalAuditedCost),
        maintenanceFundRetained: Number(maintenanceFund),
        securityDepositRefunded: Number(securityDeposit),
        completionCertificateNo: completionCertNo,
        handoverTo,
        remarks,
        approvedBy: 'प्रमुख प्रशासकीय अधिकृत',
      });
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  const isAlreadyFarfarak = Boolean(project.farfarakDetails?.isFarfarakDone);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl my-6 flex flex-col max-h-[92vh] overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-950 text-white px-6 py-4 flex items-center justify-between border-b border-emerald-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-600/50 flex items-center justify-center text-white border border-emerald-400/30">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                योजना निर्माण सम्पन्न तथा फरफारक (Project Clearance & Farfarak)
              </h2>
              <p className="text-xs text-emerald-200">
                {project.name} | कोड: {project.projectCode}
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs bg-slate-50">
          {/* Status banner */}
          <div
            className={`p-4 rounded-xl border flex flex-wrap items-center justify-between gap-3 ${
              isAlreadyFarfarak
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                : 'bg-amber-50 border-amber-300 text-amber-950'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-white ${
                  isAlreadyFarfarak ? 'bg-emerald-600' : 'bg-amber-600'
                }`}
              >
                {isAlreadyFarfarak ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              </div>
              <div>
                <p className="font-bold text-sm">
                  {isAlreadyFarfarak
                    ? 'योजना फरफारक सम्पन्न भइसकेको छ (Cleared & Closed)'
                    : 'योजना अन्तिम फरफारकको प्रक्रियामा छ'}
                </p>
                <p className="text-[11px] opacity-80">
                  प्रमाणपत्र नं: {completionCertNo} | मिति: {toNepaliNum(farfarakDate)}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenLetter('completion_farfarak');
              }}
              className="px-3 py-1.5 bg-white text-emerald-800 border border-emerald-400 hover:bg-emerald-100 rounded-lg font-semibold flex items-center gap-1.5 transition shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              फरफारक सिफारिस पत्र प्रिन्ट
            </button>
          </div>

          {/* Section 1: Mandatory Checklist */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 border-b pb-2 text-teal-900">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              १. स्थानीय तह योजना फरफारक पूर्वशर्त जाँचसूची (Mandatory Checklist)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <label className="flex items-start gap-2.5 p-2.5 border rounded-lg hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checkWorkDone}
                  onChange={(e) => setCheckWorkDone(e.target.checked)}
                  className="mt-0.5 rounded text-teal-600 focus:ring-teal-500"
                />
                <div>
                  <p className="font-bold text-slate-800">भौतिक निर्माण कार्य १००% सम्पन्न</p>
                  <p className="text-[11px] text-slate-500">सम्झौता र नक्सा डिजाइन अनुसारको कार्य पुरा</p>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-2.5 border rounded-lg hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checkMBVerified}
                  onChange={(e) => setCheckMBVerified(e.target.checked)}
                  className="mt-0.5 rounded text-teal-600 focus:ring-teal-500"
                />
                <div>
                  <p className="font-bold text-slate-800">नापी किताब (MB) तथा प्राविधिक मूल्याङ्कन</p>
                  <p className="text-[11px] text-slate-500">इन्जिनियरबाट नापजाँच सम्पन्न र प्रमाणित</p>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-2.5 border rounded-lg hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checkSocialAudit}
                  onChange={(e) => setCheckSocialAudit(e.target.checked)}
                  className="mt-0.5 rounded text-teal-600 focus:ring-teal-500"
                />
                <div>
                  <p className="font-bold text-slate-800">सार्वजनिक सुनुवाइ तथा सामाजिक परीक्षण</p>
                  <p className="text-[11px] text-slate-500">उपभोक्ता भेलाबाट खर्च अनुमोदन र माइन्युट पेश</p>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-2.5 border rounded-lg hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checkWardRec}
                  onChange={(e) => setCheckWardRec(e.target.checked)}
                  className="mt-0.5 rounded text-teal-600 focus:ring-teal-500"
                />
                <div>
                  <p className="font-bold text-slate-800">वडा अनुगमन समितिको सिफारिस प्राप्त</p>
                  <p className="text-[11px] text-slate-500">वडाध्यक्षको संयोजकत्वमा रहेको समितिबाट फरफारक सिफारिस</p>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-2.5 border rounded-lg hover:bg-slate-50 cursor-pointer md:col-span-2">
                <input
                  type="checkbox"
                  checked={checkMaintenanceFund}
                  onChange={(e) => setCheckMaintenanceFund(e.target.checked)}
                  className="mt-0.5 rounded text-teal-600 focus:ring-teal-500"
                />
                <div>
                  <p className="font-bold text-slate-800">मर्मत सम्भार कोष (३%) दाखिला तथा बिल भर्पाई अडिट ट्रेल</p>
                  <p className="text-[11px] text-slate-500">
                    योजना संरक्षणका लागि मर्मत सम्भार कोष खातामा ३% रकम कट्टी भई दाखिला भएको
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Section 2: Financial Settlement Form */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 border-b pb-2 text-teal-900">
              <DollarSign className="w-4 h-4 text-teal-600" />
              २. अन्तिम आर्थिक फरफारक तथा हिसाब मिलान विवरण
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  अन्तिम लेखापरीक्षण लागत (Final Cost) रु.
                </label>
                <input
                  type="number"
                  value={finalAuditedCost}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setFinalAuditedCost(val);
                    setMaintenanceFund(Math.round(val * 0.03));
                    setSecurityDeposit(Math.round(val * 0.05));
                  }}
                  className="w-full px-3 py-2 border rounded-lg font-bold text-slate-800 focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  मर्मत सम्भार कोष कट्टी (३%) रु.
                </label>
                <input
                  type="number"
                  value={maintenanceFund}
                  onChange={(e) => setMaintenanceFund(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg font-semibold text-emerald-800 focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  धरौटी रकम (५%) रु.
                </label>
                <input
                  type="number"
                  value={securityDeposit}
                  onChange={(e) => setSecurityDeposit(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg font-semibold text-teal-800 focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">फरफारक मिति (वि.सं.)</label>
                <input
                  type="text"
                  value={farfarakDate}
                  onChange={(e) => setFarfarakDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">सम्पन्नता प्रमाणपत्र नं.</label>
                <input
                  type="text"
                  value={completionCertNo}
                  onChange={(e) => setCompletionCertNo(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg font-mono focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">हस्तान्तरण गरिने निकाय / समुदाय</label>
                <input
                  type="text"
                  value={handoverTo}
                  onChange={(e) => setHandoverTo(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block font-semibold text-slate-700 mb-1">फरफारक टिप्पणी तथा निर्णय</label>
                <textarea
                  rows={2}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-6 py-4 flex items-center justify-between border-t border-slate-200">
          <p className="text-xs text-slate-500">
            * फरफारक सम्पन्न गरेपछि आयोजनाको स्थिति स्वतः 'सम्पन्न' (Completed) मा अद्यावधिक हुन्छ।
          </p>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg font-medium transition"
            >
              रद्द गर्नुहोस्
            </button>
            <button
              type="button"
              disabled={!allChecked || isProcessing}
              onClick={handleProcess}
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold flex items-center gap-2 shadow-md transition disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isProcessing ? 'फरफारक गरिँदै...' : 'योजना फरफारक सम्पन्न गर्नुहोस्'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
