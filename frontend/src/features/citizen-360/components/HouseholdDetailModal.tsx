import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  X,
  Home,
  Users,
  Briefcase,
  Coins,
  ShieldAlert,
  Wifi,
  CreditCard,
  HeartPulse,
  Save,
  MapPin,
  CheckCircle2,
} from 'lucide-react';
import { citizen360Api } from '../../../api/citizen360';

interface HouseholdDetailModalProps {
  householdId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const HouseholdDetailModal: React.FC<HouseholdDetailModalProps> = ({
  householdId,
  isOpen,
  onClose,
}) => {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [incomeBracket, setIncomeBracket] = useState('');
  const [occupation, setOccupation] = useState('');
  const [hasBank, setHasBank] = useState(false);
  const [hasInsurance, setHasInsurance] = useState(false);
  const [hasInternet, setHasInternet] = useState(false);
  const [vulnerabilityScore, setVulnerabilityScore] = useState(30);
  const [disasterRisk, setDisasterRisk] = useState('Low');

  const { data: detail, isLoading } = useQuery({
    queryKey: ['household-detail', householdId],
    queryFn: () => (householdId ? citizen360Api.getHouseholdDetail(householdId) : null),
    enabled: !!householdId && isOpen,
  });

  // Populate state when detail loads
  React.useEffect(() => {
    if (detail?.socioEconomic) {
      const se = detail.socioEconomic;
      setIncomeBracket(se.annual_income_bracket || 'रु ३-५ लाख');
      setOccupation(se.primary_occupation || 'व्यावसायिक किबी तथा स्याउ खेती');
      setHasBank(!!se.has_bank_account);
      setHasInsurance(!!se.has_health_insurance);
      setHasInternet(!!se.has_internet_access);
      setVulnerabilityScore(se.vulnerability_score || 30);
      setDisasterRisk(se.disaster_risk_category || 'Low');
    }
  }, [detail]);

  const updateMutation = useMutation({
    mutationFn: () =>
      citizen360Api.updateHouseholdSocioEconomic(householdId!, {
        annual_income_bracket: incomeBracket,
        primary_occupation: occupation,
        has_bank_account: hasBank,
        has_health_insurance: hasInsurance,
        has_internet_access: hasInternet,
        vulnerability_score: vulnerabilityScore,
        disaster_risk_category: disasterRisk,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['household-detail', householdId] });
      queryClient.invalidateQueries({ queryKey: ['c360-households'] });
      queryClient.invalidateQueries({ queryKey: ['c360-stats'] });
      setIsEditing(false);
    },
  });

  if (!isOpen || !householdId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col my-8 max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                घरधुरी ३६०° विस्तृत प्रोफाइल ({detail?.householdNumber || householdId})
              </h2>
              <p className="text-xs text-slate-400">
                Panchpokhari Thangpal Municipal Household Digital Twin
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300">
          {isLoading ? (
            <div className="p-12 text-center text-slate-500">घरधुरी विवरण लोड हुँदैछ...</div>
          ) : (
            <>
              {/* Location & Infrastructure Card */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                  <div className="flex items-center gap-2 text-slate-200 font-semibold text-sm">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    <span>ठेगाना तथा आधारभूत पूर्वाधार</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-mono">
                    {detail?.address?.toleName || 'थाङपाल'}, वडा {detail?.address?.wardId?.replace('ward-0', '').replace('ward-', '') || 1}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 block">घरमुली:</span>
                    <strong className="text-white text-sm">{detail?.headOfHousehold?.name}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">खानेपानी स्रोत:</span>
                    <span className="text-slate-200">{detail?.waterSource || 'पाइपधारा'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">विद्युतीकरण:</span>
                    <span className="text-slate-200">{detail?.electricityType || 'राष्ट्रिय प्रसारण'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">शौचालय प्रकार:</span>
                    <span className="text-slate-200">{detail?.toiletType || 'पक्की फ्लस'}</span>
                  </div>
                </div>
              </div>

              {/* Family Members Table */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                  <div className="flex items-center gap-2 text-slate-200 font-semibold text-sm">
                    <Users className="w-4 h-4 text-sky-400" />
                    <span>परिवार सदस्य विवरण ({detail?.members?.length || 1} जना)</span>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 text-slate-400 text-[10px] uppercase border-b border-slate-800">
                      <tr>
                        <th className="px-3 py-2 font-semibold">नाम</th>
                        <th className="px-3 py-2 font-semibold">नाता</th>
                        <th className="px-3 py-2 font-semibold">लिङ्ग</th>
                        <th className="px-3 py-2 font-semibold">जन्म मिति</th>
                        <th className="px-3 py-2 font-semibold">नागरिकता नं.</th>
                        <th className="px-3 py-2 font-semibold">सम्पर्क</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {detail?.members?.map((m: any) => (
                        <tr key={m.id} className="hover:bg-slate-800/30">
                          <td className="px-3 py-2 font-medium text-white">{m.name}</td>
                          <td className="px-3 py-2 text-indigo-400">{m.relationshipToHead}</td>
                          <td className="px-3 py-2 text-slate-300">{m.gender}</td>
                          <td className="px-3 py-2 text-slate-400">{m.dobBs}</td>
                          <td className="px-3 py-2 font-mono text-slate-300">{m.citizenshipNo || '-'}</td>
                          <td className="px-3 py-2 font-mono text-slate-400">{m.mobileNo || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Socio-Economic Survey Card */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                  <div className="flex items-center gap-2 text-slate-200 font-semibold text-sm">
                    <Briefcase className="w-4 h-4 text-amber-400" />
                    <span>सामाजिक-आर्थिक सर्वेक्षण तथा जोखिम स्थिति</span>
                  </div>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                  >
                    {isEditing ? 'रद्द गर्नुहोस्' : 'सम्पादन (Edit)'}
                  </button>
                </div>

                {isEditing ? (
                  <div className="space-y-4 pt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">वार्षिक आय वर्ग</label>
                        <select
                          value={incomeBracket}
                          onChange={(e) => setIncomeBracket(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                        >
                          <option value="रु १-३ लाख">रु १-३ लाख</option>
                          <option value="रु ३-५ लाख">रु ३-५ लाख</option>
                          <option value="रु ५-८ लाख">रु ५-८ लाख</option>
                          <option value="रु ८ लाख भन्दा बढी">रु ८ लाख भन्दा बढी</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">मुख्य पेशा</label>
                        <input
                          type="text"
                          value={occupation}
                          onChange={(e) => setOccupation(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <label className="flex items-center gap-2 bg-slate-900 p-2.5 rounded-lg border border-slate-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={hasBank}
                          onChange={(e) => setHasBank(e.target.checked)}
                          className="rounded text-emerald-500"
                        />
                        <span className="text-xs">बैंक खाता</span>
                      </label>
                      <label className="flex items-center gap-2 bg-slate-900 p-2.5 rounded-lg border border-slate-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={hasInsurance}
                          onChange={(e) => setHasInsurance(e.target.checked)}
                          className="rounded text-emerald-500"
                        />
                        <span className="text-xs">स्वास्थ्य बिमा</span>
                      </label>
                      <label className="flex items-center gap-2 bg-slate-900 p-2.5 rounded-lg border border-slate-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={hasInternet}
                          onChange={(e) => setHasInternet(e.target.checked)}
                          className="rounded text-emerald-500"
                        />
                        <span className="text-xs">इन्टरनेट पहुँच</span>
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">
                          गरिबी/असुरक्षा सूचकांक (Vulnerability Score: {vulnerabilityScore})
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={vulnerabilityScore}
                          onChange={(e) => setVulnerabilityScore(Number(e.target.value))}
                          className="w-full accent-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">विपद् जोखिम वर्ग</label>
                        <select
                          value={disasterRisk}
                          onChange={(e) => setDisasterRisk(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                        >
                          <option value="Low">न्यून जोखिम (Low)</option>
                          <option value="Medium">मध्यम जोखिम (Medium)</option>
                          <option value="High">उच्च जोखिम (High)</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        onClick={() => updateMutation.mutate()}
                        disabled={updateMutation.isPending}
                        className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-md transition"
                      >
                        <Save className="w-3.5 h-3.5" />
                        {updateMutation.isPending ? 'सुरक्षित गर्दै...' : 'सुरक्षित गर्नुहोस्'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 block">वार्षिक आय:</span>
                      <strong className="text-white">{detail?.socioEconomic?.annual_income_bracket || 'रु ३-५ लाख'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">मुख्य पेशा:</span>
                      <span className="text-amber-400 font-medium">{detail?.socioEconomic?.primary_occupation || 'किबी तथा स्याउ खेती'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">जग्गा स्वामित्व:</span>
                      <span className="text-slate-200">{detail?.socioEconomic?.land_ownership_area_sqm || 2400} वर्ग मिटर</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">विपद् जोखिम:</span>
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold border ${
                          detail?.socioEconomic?.disaster_risk_category === 'High'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            : detail?.socioEconomic?.disaster_risk_category === 'Medium'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}
                      >
                        {detail?.socioEconomic?.disaster_risk_category || 'Low'}
                      </span>
                    </div>

                    {/* Badges row */}
                    <div className="col-span-2 sm:col-span-4 flex items-center gap-3 pt-2">
                      <span
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${
                          detail?.socioEconomic?.has_bank_account
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        {detail?.socioEconomic?.has_bank_account ? 'बैंक खाता उपलब्ध' : 'बैंक खाता छैन'}
                      </span>
                      <span
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${
                          detail?.socioEconomic?.has_health_insurance
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        <HeartPulse className="w-3.5 h-3.5" />
                        {detail?.socioEconomic?.has_health_insurance ? 'स्वास्थ्य बिमा आबद्ध' : 'स्वास्थ्य बिमा छैन'}
                      </span>
                      <span
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${
                          detail?.socioEconomic?.has_internet_access
                            ? 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        <Wifi className="w-3.5 h-3.5" />
                        {detail?.socioEconomic?.has_internet_access ? 'इन्टरनेट जडित' : 'इन्टरनेट छैन'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
