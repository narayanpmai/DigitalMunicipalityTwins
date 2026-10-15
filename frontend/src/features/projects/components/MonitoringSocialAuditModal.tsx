import React, { useState } from 'react';
import { Project, MonitoringRecord, SocialAuditRecord } from '../../../types/sectoral';
import {
  X,
  Eye,
  ShieldCheck,
  CheckCircle,
  Camera,
  Users,
  Award,
  Save,
  Plus,
  MessageSquare,
  Star,
  MapPin,
} from 'lucide-react';

interface MonitoringSocialAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  onAddMonitoring: (record: Partial<MonitoringRecord>) => Promise<void>;
  onSaveSocialAudit: (audit: Partial<SocialAuditRecord>) => Promise<void>;
}

const toNepaliNum = (num: number | string): string => {
  const nepaliDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  return String(num).replace(/\d/g, (d) => nepaliDigits[parseInt(d, 10)]);
};

export const MonitoringSocialAuditModal: React.FC<MonitoringSocialAuditModalProps> = ({
  isOpen,
  onClose,
  project,
  onAddMonitoring,
  onSaveSocialAudit,
}) => {
  const [activeTab, setActiveTab] = useState<'monitoring' | 'photos' | 'social_audit'>('monitoring');

  // Monitoring form state
  const [monitorName, setMonitorName] = useState<string>('वडा अनुगमन समिति');
  const [designation, setDesignation] = useState<string>('वडा अध्यक्ष / संयोजक');
  const [monDateBs, setMonDateBs] = useState<string>('२०८३-०३-०१');
  const [progressObserved, setProgressObserved] = useState<number>(project?.progressPercentage || 80);
  const [rating, setRating] = useState<string>('A');
  const [monStatus, setMonStatus] = useState<string>('गुणस्तरीय तथा सन्तोषजनक');
  const [recommendation, setRecommendation] = useState<string>('प्राविधिक मापदण्ड अनुसार काम भइरहेकोले दोस्रो किस्ता निकासाका लागि सिफारिस गरिन्छ।');
  const [isSubmittingMon, setIsSubmittingMon] = useState(false);

  // Social audit state
  const [auditDate, setAuditDate] = useState<string>(project?.socialAudit?.date  || '');
  const [auditVenue, setAuditVenue] = useState<string>(
    project?.socialAudit?.venue || `${project?.location || 'वडा कार्यालय'}, पाँचपोखरी थाङपाल`,
  );
  const [participantsCount, setParticipantsCount] = useState<number>(
    project?.socialAudit?.participantsCount || 54,
  );
  const [femaleCount, setFemaleCount] = useState<number>(
    project?.socialAudit?.femaleCount || 28,
  );
  const [marginalizedCount, setMarginalizedCount] = useState<number>(
    project?.socialAudit?.marginalizedCount || 16,
  );
  const [publicSatisfaction, setPublicSatisfaction] = useState<string>(
    project?.socialAudit?.publicSatisfaction || 'उत्कृष्ट (९२%)',
  );
  const [auditorName, setAuditorName] = useState<string>(
    project?.socialAudit?.auditorName || 'सामाजिक परिचालक / सहजकर्ता',
  );
  const [decisionsSummary, setDecisionsSummary] = useState<string>(
    project?.socialAudit?.decisionsSummary ||
      'उपभोक्ता भेलामा आयोजनाको आय-व्यय, गुणस्तर र सार्वजनिक सामग्री खरिद बारे छलफल भई सर्वसम्मत रूपमा खर्च अनुमोदन गरियो।',
  );
  const [isSubmittingAudit, setIsSubmittingAudit] = useState(false);

  if (!isOpen || !project) return null;

  const records = project.monitoringRecords || [
    {
      id: 'mon-1',
      date: '२०८३-०२-२९',
      monitorName: 'वडा अनुगमन समिति',
      designation: 'वडा अध्यक्ष / संयोजक',
      status: 'सन्तोषजनक',
      rating: 'A',
      progressObserved: 60,
      recommendation: 'काम द्रुत गतिमा बढाउन र सुरक्षा तारजाली बलियो बनाउन निर्देशन।',
    },
  ];

  const handleMonitoringSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingMon(true);
    try {
      await onAddMonitoring({
        date: monDateBs,
        monitorName,
        designation,
        status: monStatus,
        rating,
        progressObserved: Number(progressObserved),
        recommendation,
      });
      setRecommendation('');
    } finally {
      setIsSubmittingMon(false);
    }
  };

  const handleSocialAuditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingAudit(true);
    try {
      await onSaveSocialAudit({
        date: auditDate,
        venue: auditVenue,
        participantsCount: Number(participantsCount),
        femaleCount: Number(femaleCount),
        marginalizedCount: Number(marginalizedCount),
        publicSatisfaction,
        auditorName,
        decisionsSummary,
      });
      onClose();
    } finally {
      setIsSubmittingAudit(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl my-6 flex flex-col max-h-[92vh] overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white px-6 py-4 flex items-center justify-between border-b border-blue-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-700/50 flex items-center justify-center text-white border border-blue-400/30">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                अनुगमन, गुणस्तर परीक्षण तथा सामाजिक परीक्षण
              </h2>
              <p className="text-xs text-blue-200">
                {project.name} | वडा नं. {toNepaliNum(project.wardNumber)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-blue-200 hover:text-white rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-tabs */}
        <div className="bg-slate-100 px-6 py-2.5 border-b border-slate-200 flex gap-3 text-xs font-semibold text-slate-700">
          <button
            onClick={() => setActiveTab('monitoring')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
              activeTab === 'monitoring'
                ? 'bg-blue-800 text-white shadow-sm'
                : 'bg-white hover:bg-slate-200 border border-slate-300'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            १. वडा तथा प्राविधिक अनुगमन प्रतिवेदन
          </button>
          <button
            onClick={() => setActiveTab('photos')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
              activeTab === 'photos'
                ? 'bg-blue-800 text-white shadow-sm'
                : 'bg-white hover:bg-slate-200 border border-slate-300'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            २. स्थलगत Geotagged फोटो ग्यालरी
          </button>
          <button
            onClick={() => setActiveTab('social_audit')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
              activeTab === 'social_audit'
                ? 'bg-blue-800 text-white shadow-sm'
                : 'bg-white hover:bg-slate-200 border border-slate-300'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            ३. सार्वजनिक सुनुवाइ तथा सामाजिक परीक्षण
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 text-xs bg-slate-50 space-y-6">
          {activeTab === 'monitoring' && (
            <div className="space-y-5">
              {/* Existing Monitoring Reports */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
                <h3 className="font-bold text-blue-950 text-sm flex items-center gap-2 border-b pb-2">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  विगतका अनुगमन प्रतिवेदनहरू ({toNepaliNum(records.length)})
                </h3>

                <div className="space-y-3">
                  {records.map((r, idx) => (
                    <div key={idx} className="p-3.5 border border-slate-200 rounded-lg bg-slate-50 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800">{r.monitorName}</span>
                          <span className="text-slate-500">({r.designation})</span>
                          <span className="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded text-[11px]">
                            मिति: {toNepaliNum(r.date)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-600">भौतिक प्रगति: <strong>{toNepaliNum(r.progressObserved || 0)}%</strong></span>
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            गुणस्तर ग्रेड: {r.rating || 'A'}
                          </span>
                        </div>
                      </div>
                      <p className="text-slate-700 leading-relaxed">
                        <strong>सिफारिस तथा निर्देशन:</strong> {r.recommendation || r.remarks || 'गुणस्तर सन्तोषजनक'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add New Monitoring Report */}
              <form onSubmit={handleMonitoringSubmit} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-bold text-blue-950 text-sm border-b pb-2 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-blue-600" />
                  नयाँ अनुगमन प्रतिवेदन दर्ता गर्नुहोस्
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">अनुगमनकर्ताको नाम</label>
                    <input
                      type="text"
                      value={monitorName}
                      onChange={(e) => setMonitorName(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">पद / भूमिका</label>
                    <input
                      type="text"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">अनुगमन मिति (वि.सं.)</label>
                    <input
                      type="text"
                      value={monDateBs}
                      onChange={(e) => setMonDateBs(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">देखिएको भौतिक प्रगति (%)</label>
                    <input
                      type="number"
                      value={progressObserved}
                      onChange={(e) => setProgressObserved(Number(e.target.value))}
                      className="w-full px-3 py-2 border rounded-lg font-bold text-blue-900 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">गुणस्तर ग्रेडिङ</label>
                    <select
                      value={rating}
                      onChange={(e) => setRating(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg bg-white"
                    >
                      <option value="A">Grade A (उत्कृष्ट - Excellent)</option>
                      <option value="B">Grade B (राम्रो - Good)</option>
                      <option value="C">Grade C (सन्तोषजनक - Satisfactory)</option>
                      <option value="D">Grade D (सुधार आवश्यक - Needs Improvement)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">समग्र स्थिति</label>
                    <input
                      type="text"
                      value={monStatus}
                      onChange={(e) => setMonStatus(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block font-semibold text-slate-700 mb-1">
                      अनुगमन टोलीको निर्देशन तथा किस्ता भुक्तानी सिफारिस
                    </label>
                    <textarea
                      rows={2}
                      value={recommendation}
                      onChange={(e) => setRecommendation(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="उपभोक्ता समितिलाई दिइएका सुझाव, निर्देशन र सिफारिस"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isSubmittingMon}
                    className="px-5 py-2 bg-blue-800 hover:bg-blue-900 text-white rounded-lg font-semibold flex items-center gap-2 shadow"
                  >
                    <Save className="w-4 h-4" />
                    {isSubmittingMon ? 'दर्ता हुँदैछ...' : 'अनुगमन प्रतिवेदन सुरक्षित गर्नुहोस्'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'photos' && (
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="font-bold text-blue-950 text-sm flex items-center gap-2">
                  <Camera className="w-4 h-4 text-blue-600" />
                  योजना स्थलगत Geotagged फोटो ग्यालरी (३ वटा चरण)
                </h3>
                <span className="text-slate-500 text-[11px] flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-red-500" />
                  GPS: {project.latitude || 27.9610}° N, {project.longitude || 85.5980}° E
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Phase 1: Before */}
                <div className="border border-slate-200 rounded-lg p-3 bg-slate-50 space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-700 border-b pb-1">
                    <span>१. कार्य सुरु हुनु अघि</span>
                    <span className="text-slate-500 text-[10px]">प्रारम्भिक</span>
                  </div>
                  <div className="w-full h-40 bg-slate-200 rounded flex flex-col items-center justify-center text-slate-400 border border-dashed border-slate-300">
                    <Camera className="w-8 h-8 mb-1 opacity-50" />
                    <span className="text-[11px]">स्थलगत फोटो (सुरुवाती)</span>
                  </div>
                  <p className="text-[11px] text-slate-600">आयोजना सुरु हुनुपूर्वको मौजुदा अवस्था</p>
                </div>

                {/* Phase 2: During */}
                <div className="border border-slate-200 rounded-lg p-3 bg-slate-50 space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-blue-800 border-b pb-1">
                    <span>२. निर्माणको क्रममा (चालु)</span>
                    <span className="text-blue-600 text-[10px]">प्रगति {toNepaliNum(project.progressPercentage || 80)}%</span>
                  </div>
                  <div className="w-full h-40 bg-blue-50 rounded flex flex-col items-center justify-center text-blue-400 border border-dashed border-blue-300">
                    <Camera className="w-8 h-8 mb-1 opacity-70" />
                    <span className="text-[11px] font-semibold text-blue-700">ग्याबियन / निर्माण कार्य चालु</span>
                  </div>
                  <p className="text-[11px] text-slate-600">भौतिक निर्माण तथा कामदार संलग्न फोटो</p>
                </div>

                {/* Phase 3: After */}
                <div className="border border-slate-200 rounded-lg p-3 bg-slate-50 space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-emerald-800 border-b pb-1">
                    <span>३. कार्य सम्पन्न भएपछि</span>
                    <span className="text-emerald-600 text-[10px]">अन्तिम रूप</span>
                  </div>
                  <div className="w-full h-40 bg-emerald-50 rounded flex flex-col items-center justify-center text-emerald-400 border border-dashed border-emerald-300">
                    <Camera className="w-8 h-8 mb-1 opacity-70" />
                    <span className="text-[11px] font-semibold text-emerald-700">सम्पन्न संरचना तथा नागरिक पाटी</span>
                  </div>
                  <p className="text-[11px] text-slate-600">अन्तिम भुक्तानी तथा फरफारक प्रयोजनार्थ</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'social_audit' && (
            <form onSubmit={handleSocialAuditSubmit} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div className="border-b pb-2 flex justify-between items-center">
                <h3 className="font-bold text-blue-950 text-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  सार्वजनिक सुनुवाइ तथा सामाजिक परीक्षण (Social Audit) प्रतिवेदन
                </h3>
                <span className="bg-indigo-50 border border-indigo-200 text-indigo-800 px-3 py-0.5 rounded-full font-bold">
                  सन्तुष्टि दर: {publicSatisfaction}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">परीक्षण सम्पन्न मिति (वि.सं.)</label>
                  <input
                    type="text"
                    value={auditDate}
                    onChange={(e) => setAuditDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">भेला भएको स्थान</label>
                  <input
                    type="text"
                    value={auditVenue}
                    onChange={(e) => setAuditVenue(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">सहजकर्ता / सामाजिक परिचालक</label>
                  <input
                    type="text"
                    value={auditorName}
                    onChange={(e) => setAuditorName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">कुल उपस्थित उपभोक्ता संख्या</label>
                  <input
                    type="number"
                    value={participantsCount}
                    onChange={(e) => setParticipantsCount(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">महिला सहभागी संख्या</label>
                  <input
                    type="number"
                    value={femaleCount}
                    onChange={(e) => setFemaleCount(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg font-bold text-teal-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">दलित / सीमान्तकृत संख्या</label>
                  <input
                    type="number"
                    value={marginalizedCount}
                    onChange={(e) => setMarginalizedCount(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg font-bold text-indigo-800"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block font-semibold text-slate-700 mb-1">
                    सामाजिक परीक्षणमा पारित प्रमुख निर्णयहरू (Minutes Summary)
                  </label>
                  <textarea
                    rows={3}
                    value={decisionsSummary}
                    onChange={(e) => setDecisionsSummary(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700"
                >
                  रद्द गर्नुहोस्
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAudit}
                  className="px-5 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg font-semibold flex items-center gap-2 shadow"
                >
                  <Save className="w-4 h-4" />
                  {isSubmittingAudit ? 'सुरक्षित गर्दै...' : 'सामाजिक परीक्षण प्रतिवेदन सुरक्षित गर्नुहोस्'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
