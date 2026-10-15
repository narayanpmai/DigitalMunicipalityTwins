import React, { useState } from 'react';
import { X, HardHat, CheckCircle2, AlertCircle } from 'lucide-react';
import { disasterApi } from '../../../api/disaster';

interface AddRecoveryProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddRecoveryProjectModal: React.FC<AddRecoveryProjectModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [incidentId, setIncidentId] = useState('drrm-inc-01');
  const [reconstructionType, setReconstructionType] = useState('निजी आवास पुनर्निर्माण (Private Housing)');
  const [recoveryStatus, setRecoveryStatus] = useState<'Planned' | 'In Progress' | 'Completed'>('In Progress');
  const [projectId, setProjectId] = useState('');
  const [beneficiaryHouseholdId, setBeneficiaryHouseholdId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await disasterApi.createRecoveryProject({
        incident_id: incidentId,
        reconstruction_type: reconstructionType,
        recovery_status: recoveryStatus,
        project_id: projectId.trim() || null,
        beneficiary_household_id: beneficiaryHouseholdId.trim() || null,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Failed to create recovery project:', err);
      setErrorMsg(err?.response?.data?.detail || 'आयोजना सुरक्षित गर्न सकिएन। कृपया विवरण जाँच गर्नुहोस्।');
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
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
              <HardHat className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">नयाँ विपद् पुनर्निर्माण आयोजना</h2>
              <p className="text-xs text-slate-400">Post-Disaster Reconstruction & Recovery Project</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
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

          {/* Incident Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              सम्बन्धित विपद् घटना <span className="text-rose-400">*</span>
            </label>
            <select
              value={incidentId}
              onChange={(e) => setIncidentId(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
              required
            >
              <option value="drrm-inc-01">drrm-inc-01: वडा नं. ४ - मानेखर्क डाँडागाउँ पहिरो (उच्च जोखिम)</option>
              <option value="drrm-inc-02">drrm-inc-02: वडा नं. ७ - तिपेनी मेलम्ची बाढी कटान (अति संवेदनशील)</option>
              <option value="drrm-inc-03">drrm-inc-03: वडा नं. ३ - भोताङ सडक पहिरो (मध्यम)</option>
              <option value="drrm-inc-04">drrm-inc-04: वडा नं. १ - बाँसखर्क वन डढेलो (मध्यम)</option>
            </select>
          </div>

          {/* Reconstruction Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              पुनर्निर्माण / पुनःलाभ प्रकार <span className="text-rose-400">*</span>
            </label>
            <select
              value={reconstructionType}
              onChange={(e) => setReconstructionType(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
              required
            >
              <option value="निजी आवास पुनर्निर्माण (Private Housing)">निजी आवास पुनर्निर्माण (Private Housing)</option>
              <option value="तटबन्ध तथा गेबियन पर्खाल (River/Slope Embankment & Gabion)">तटबन्ध तथा गेबियन पर्खाल (River/Slope Embankment & Gabion)</option>
              <option value="सडक तथा कल्भर्ट पुनर्स्थापना (Road & Culvert Restoration)">सडक तथा कल्भर्ट पुनर्स्थापना (Road & Culvert Restoration)</option>
              <option value="झोलुङ्गे पुल तथा पदमार्ग मर्मत (Suspension Bridge & Trail Repair)">झोलुङ्गे पुल तथा पदमार्ग मर्मत (Suspension Bridge & Trail Repair)</option>
              <option value="सिँचाइ कुलो पुनर्निर्माण (Irrigation Canal Reconstruction)">सिँचाइ कुलो पुनर्निर्माण (Irrigation Canal Reconstruction)</option>
              <option value="बायो-इन्जिनियरिङ तथा वृक्षारोपण (Bio-Engineering & Slope Stabilization)">बायो-इन्जिनियरिङ तथा वृक्षारोपण (Bio-Engineering & Slope Stabilization)</option>
              <option value="सामुदायिक वन पुनरुत्थान तथा अग्निरेखा (Community Forest Fire Recovery)">सामुदायिक वन पुनरुत्थान तथा अग्निरेखा (Community Forest Fire Recovery)</option>
              <option value="कृषि फार्म तथा टहरा पुनर्निर्माण (Agro-Shed & Infrastructure)">कृषि फार्म तथा टहरा पुनर्निर्माण (Agro-Shed & Infrastructure)</option>
              <option value="स्वास्थ्य चौकी तथा सार्वजनिक भवन सुदृढीकरण (Public Health Facility Retrofitting)">स्वास्थ्य चौकी तथा सार्वजनिक भवन सुदृढीकरण (Public Health Facility Retrofitting)</option>
            </select>
          </div>

          {/* Recovery Status */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              आयोजना स्थिति (Recovery Status)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Planned', 'In Progress', 'Completed'] as const).map((st) => (
                <button
                  type="button"
                  key={st}
                  onClick={() => setRecoveryStatus(st)}
                  className={`py-2 px-3 text-xs font-medium rounded-xl border transition text-center ${
                    recoveryStatus === st
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-semibold'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {st === 'Planned' && 'योजना (Planned)'}
                  {st === 'In Progress' && 'कार्यान्वयनमा (In Progress)'}
                  {st === 'Completed' && 'सम्पन्न (Completed)'}
                </button>
              ))}
            </div>
          </div>

          {/* Beneficiary Household ID */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              लाभान्वित घरधुरी ID (Beneficiary Household - ऐच्छिक)
            </label>
            <input
              type="text"
              value={beneficiaryHouseholdId}
              onChange={(e) => setBeneficiaryHouseholdId(e.target.value)}
              placeholder="उदा. e96f3a4d-5e69-4b80-874a-06b7d44ac76e"
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono text-xs"
            />
            <p className="text-[11px] text-slate-500 mt-1">घरधुरी पञ्जीकरण प्रणाली (Household Registry) सँग स्वतः आबद्ध हुनेछ।</p>
          </div>

          {/* Project Link */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              पालिका विकास आयोजना ID (Municipal Project Link - ऐच्छिक)
            </label>
            <input
              type="text"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              placeholder="उदा. 95db7655-4c1e-590c-98fc-cab2827bc7de"
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono text-xs"
            />
          </div>

          {/* Actions */}
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
              className="flex items-center gap-2 px-5 py-2 text-sm font-medium bg-amber-600 hover:bg-amber-500 text-white rounded-xl shadow-lg shadow-amber-600/20 transition disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isSubmitting ? 'सुरक्षित गर्दै...' : 'आयोजना थप्नुहोस्'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
