import React, { useState } from 'react';
import { X, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { citizen360Api } from '../../../api/citizen360';
import { Citizen360Item } from '../../../types/citizen360';

interface AddApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  citizens: Citizen360Item[];
}

export const AddApplicationModal: React.FC<AddApplicationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  citizens,
}) => {
  const [citizenId, setCitizenId] = useState(citizens?.[0]?.id || 'cit-01');
  const [serviceModule, setServiceModule] = useState('eSifaris (नागरिकता प्रमाणपत्र सिफारिस)');
  const [status, setStatus] = useState('Approved');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await citizen360Api.createApplication({
        citizenId,
        serviceModule,
        status,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Failed to create application:', err);
      setErrorMsg(err?.response?.data?.detail || 'सेवा आवेदन रेकर्ड गर्न सकिएन।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-500/10 border border-sky-500/20 rounded-xl text-sky-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">नयाँ नागरिक सेवा आवेदन प्रविष्टि</h2>
              <p className="text-xs text-slate-400">Log Citizen Service Application</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              नागरिक चयन गर्नुहोस् <span className="text-rose-400">*</span>
            </label>
            <select
              value={citizenId}
              onChange={(e) => setCitizenId(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-sky-500"
            >
              {(citizens || []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.fullName} ({c.citizenshipNo || c.id})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              सेवा मोड्युल तथा सिफारिस प्रकार <span className="text-rose-400">*</span>
            </label>
            <select
              value={serviceModule}
              onChange={(e) => setServiceModule(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-sky-500"
            >
              <option value="eSifaris (नागरिकता प्रमाणपत्र सिफारिस)">eSifaris (नागरिकता प्रमाणपत्र सिफारिस)</option>
              <option value="SocialSecurity (ज्येष्ठ नागरिक सामाजिक सुरक्षा भत्ता)">SocialSecurity (ज्येष्ठ नागरिक सामाजिक सुरक्षा भत्ता)</option>
              <option value="VitalRegistration (जन्म दर्ता प्रमाणपत्र)">VitalRegistration (जन्म दर्ता प्रमाणपत्र)</option>
              <option value="VitalRegistration (विवाह दर्ता प्रमाणपत्र)">VitalRegistration (विवाह दर्ता प्रमाणपत्र)</option>
              <option value="eBPS (भवन निर्माण नक्सा पास इजाजत)">eBPS (भवन निर्माण नक्सा पास इजाजत)</option>
              <option value="Grievance (सार्वजनिक खानेपानी मर्मत गुनासो)">Grievance (सार्वजनिक खानेपानी मर्मत गुनासो)</option>
              <option value="AgriSubsidy (किबी पकेट अनुदान माग)">AgriSubsidy (किबी पकेट अनुदान माग)</option>
              <option value="eSifaris (चारकिल्ला प्रमाणित सिफारिस)">eSifaris (चारकिल्ला प्रमाणित सिफारिस)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">आवेदन स्थिति</label>
            <div className="grid grid-cols-3 gap-2">
              {(['Approved', 'Pending', 'In Review'] as const).map((st) => (
                <button
                  type="button"
                  key={st}
                  onClick={() => setStatus(st)}
                  className={`py-2 px-3 text-xs font-medium rounded-xl border transition text-center ${
                    status === st
                      ? 'bg-sky-500/20 border-sky-500 text-sky-300 font-semibold'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {st === 'Approved' && 'स्वीकृत (Approved)'}
                  {st === 'Pending' && 'प्रक्रियामा (Pending)'}
                  {st === 'In Review' && 'पुनरावलोकन (In Review)'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-300 hover:text-white rounded-xl hover:bg-slate-800 transition"
            >
              रद्द गर्नुहोस्
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 text-sm font-medium bg-sky-600 hover:bg-sky-500 text-white rounded-xl shadow-lg shadow-sky-600/20 transition disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isSubmitting ? 'सुरक्षित गर्दै...' : 'आवेदन दर्ता गर्नुहोस्'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
