import React, { useState } from 'react';
import { Project, CommitteeMember, CommitteeBankDetails } from '../../../types/sectoral';
import {
  X,
  Users,
  Building,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Printer,
  Phone,
  ShieldCheck,
} from 'lucide-react';

interface ConsumerCommitteeModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  onSave: (data: Partial<Project>) => Promise<void>;
  onOpenLetter: (letterType: 'bank_rec' | 'committee_reg') => void;
}

const toNepaliNum = (num: number | string): string => {
  const nepaliDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  return String(num).replace(/\d/g, (d) => nepaliDigits[parseInt(d, 10)]);
};

export const ConsumerCommitteeModal: React.FC<ConsumerCommitteeModalProps> = ({
  isOpen,
  onClose,
  project,
  onSave,
  onOpenLetter,
}) => {
  if (!isOpen || !project) return null;

  const [committeeName, setCommitteeName] = useState(
    project.committeeName || `${project.name} उपभोक्ता समिति`,
  );
  const [committeeChair, setCommitteeChair] = useState(project.committeeChair || '');
  const [committeeSecretary, setCommitteeSecretary] = useState(project.committeeSecretary || '');
  const [committeeTreasurer, setCommitteeTreasurer] = useState(project.committeeTreasurer || '');
  const [committeePhone, setCommitteePhone] = useState(project.committeePhone || '');

  // Members
  const [members, setMembers] = useState<CommitteeMember[]>(
    project.committeeMembers && project.committeeMembers.length > 0
      ? (project.committeeMembers as CommitteeMember[])
      : [
          {
            name: project.committeeChair || 'दावा दोर्जे तामाङ',
            role: 'अध्यक्ष',
            gender: 'पुरुष',
            wardNumber: project.wardNumber,
            phone: project.committeePhone || '९८४१५२६३७१',
            category: 'आदिवासी/जनजाति',
          },
          {
            name: project.committeeSecretary || 'निमा लामा',
            role: 'सचिव',
            gender: 'पुरुष',
            wardNumber: project.wardNumber,
            phone: '९८५१०००००१',
            category: 'खुला',
          },
          {
            name: project.committeeTreasurer || 'पासाङ ल्हामु शेर्पा',
            role: 'कोषाध्यक्ष',
            gender: 'महिला',
            wardNumber: project.wardNumber,
            phone: '९८४१०००००२',
            category: 'महिला',
          },
          {
            name: 'डोल्मा शेर्पा',
            role: 'सदस्य',
            gender: 'महिला',
            wardNumber: project.wardNumber,
            phone: '९८६१०००००३',
            category: 'महिला',
          },
          {
            name: 'सुब्बा बिक',
            role: 'सदस्य',
            gender: 'पुरुष',
            wardNumber: project.wardNumber,
            phone: '९८४२०००००४',
            category: 'दलित',
          },
        ],
  );

  // Bank details
  const [bankName, setBankName] = useState(
    project.committeeBankDetails?.bankName || 'राष्ट्रिय वाणिज्य बैंक लिमिटेड',
  );
  const [bankBranch, setBankBranch] = useState(
    project.committeeBankDetails?.branch || 'मेलम्ची / थाङपाल शाखा',
  );
  const [accountNumber, setAccountNumber] = useState(
    project.committeeBankDetails?.accountNumber || '११६००२३४५६७८९',
  );
  const [accountType, setAccountType] = useState(
    project.committeeBankDetails?.accountType || 'चल्ती खाता (Current Account)',
  );
  const [isSaving, setIsSaving] = useState(false);

  // Calculate inclusion stats
  const totalCount = members.length;
  const femaleCount = members.filter((m) => m.gender === 'महिला').length;
  const femalePercentage = totalCount > 0 ? Math.round((femaleCount / totalCount) * 100) : 0;
  const hasDalit = members.some((m) => m.category === 'दलित');
  const meetsFemaleQuota = femalePercentage >= 33;

  const handleAddMember = () => {
    setMembers([
      ...members,
      {
        name: '',
        role: 'सदस्य',
        gender: 'महिला',
        wardNumber: project.wardNumber,
        phone: '',
        category: 'महिला',
      },
    ]);
  };

  const handleRemoveMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const handleMemberChange = (index: number, field: keyof CommitteeMember, value: any) => {
    const updated = [...members];
    updated[index] = { ...updated[index], [field]: value };
    setMembers(updated);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave({
        committeeName,
        committeeChair,
        committeeSecretary,
        committeeTreasurer,
        committeePhone,
        committeeMembers: members,
        committeeBankDetails: {
          bankName,
          branch: bankBranch,
          accountNumber,
          accountType,
          signatories: `${committeeChair}, ${committeeTreasurer}`,
        },
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl my-6 flex flex-col max-h-[92vh] overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-800 to-teal-950 text-white px-6 py-4 flex items-center justify-between border-b border-teal-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-600/50 flex items-center justify-center text-white border border-teal-400/30">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">उपभोक्ता समिति तथा सरोकारवाला व्यवस्थापन</h2>
              <p className="text-xs text-teal-200">
                {project.name} | वडा नं. {toNepaliNum(project.wardNumber)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-teal-200 hover:text-white rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm bg-slate-50">
          {/* Top Statutory Inclusion Status Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">महिला सहभागिता:</span>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                    meetsFemaleQuota
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}
                >
                  {meetsFemaleQuota ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                  {toNepaliNum(femalePercentage)}% ({toNepaliNum(femaleCount)}/{toNepaliNum(totalCount)} जना)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">दलित / सीमान्तकृत प्रतिनिधित्व:</span>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                    hasDalit
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-slate-100 text-slate-700 border border-slate-300'
                  }`}
                >
                  {hasDalit ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                  {hasDalit ? 'समावेश' : 'प्रतिनिधित्व न्यून'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenLetter('bank_rec');
                }}
                className="px-3 py-1.5 bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-300 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
              >
                <Building className="w-3.5 h-3.5" />
                बैंक खाता सिफारिस पत्र
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenLetter('committee_reg');
                }}
                className="px-3 py-1.5 bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-300 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
              >
                <FileText className="w-3.5 h-3.5" />
                गठन प्रमाणपत्र प्रिन्ट
              </button>
            </div>
          </div>

          {/* Section 1: Executive Office Bearers */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-teal-900 flex items-center gap-2 border-b pb-2">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              १. उपभोक्ता समिति तथा मुख्य पदाधिकारी विवरण
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  उपभोक्ता समितिको नाम <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={committeeName}
                  onChange={(e) => setCommitteeName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  placeholder="उदा: थाङपालकोट स्वास्थ्य चौकी मर्मत उपभोक्ता समिति"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  अध्यक्षको नाम <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={committeeChair}
                  onChange={(e) => setCommitteeChair(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  placeholder="अध्यक्षको पूरा नाम"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  सचिवको नाम
                </label>
                <input
                  type="text"
                  value={committeeSecretary}
                  onChange={(e) => setCommitteeSecretary(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  placeholder="सचिवको नाम"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  कोषाध्यक्षको नाम (अनिवार्य महिला/समावेशी)
                </label>
                <input
                  type="text"
                  value={committeeTreasurer}
                  onChange={(e) => setCommitteeTreasurer(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  placeholder="कोषाध्यक्षको नाम"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  सम्पर्क फोन नम्बर
                </label>
                <input
                  type="text"
                  value={committeePhone}
                  onChange={(e) => setCommitteePhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  placeholder="९८xxxxxxxx"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Full Committee Members Roster */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-bold text-teal-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-teal-600" />
                २. उपभोक्ता समितिका सम्पूर्ण पदाधिकारी तथा सदस्यहरूको नामावली (न्यूनतम ७-११ जना)
              </h3>
              <button
                type="button"
                onClick={handleAddMember}
                className="px-2.5 py-1 bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                सदस्य थप्नुहोस्
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <div className="dt-responsive-table-wrapper">
<table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2 border-r">क्र.स.</th>
                    <th className="p-2 border-r min-w-[140px]">नाम, थर</th>
                    <th className="p-2 border-r min-w-[100px]">पद</th>
                    <th className="p-2 border-r min-w-[90px]">लिङ्ग</th>
                    <th className="p-2 border-r min-w-[120px]">समावेशी कोटा</th>
                    <th className="p-2 border-r min-w-[110px]">फोन नं.</th>
                    <th className="p-2 text-center">हटाउने</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {members.map((m, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-2 border-r text-center font-semibold text-slate-500">
                        {toNepaliNum(idx + 1)}
                      </td>
                      <td className="p-2 border-r">
                        <input
                          type="text"
                          value={m.name}
                          onChange={(e) => handleMemberChange(idx, 'name', e.target.value)}
                          className="w-full px-2 py-1 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-teal-500"
                          placeholder="नाम, थर"
                        />
                      </td>
                      <td className="p-2 border-r">
                        <select
                          value={m.role}
                          onChange={(e) => handleMemberChange(idx, 'role', e.target.value)}
                          className="w-full px-2 py-1 border border-slate-200 rounded text-xs bg-white"
                        >
                          <option value="अध्यक्ष">अध्यक्ष</option>
                          <option value="उपाध्यक्ष">उपाध्यक्ष</option>
                          <option value="सचिव">सचिव</option>
                          <option value="कोषाध्यक्ष">कोषाध्यक्ष</option>
                          <option value="सदस्य">सदस्य</option>
                        </select>
                      </td>
                      <td className="p-2 border-r">
                        <select
                          value={m.gender}
                          onChange={(e) => handleMemberChange(idx, 'gender', e.target.value)}
                          className="w-full px-2 py-1 border border-slate-200 rounded text-xs bg-white"
                        >
                          <option value="महिला">महिला</option>
                          <option value="पुरुष">पुरुष</option>
                          <option value="अन्य">अन्य</option>
                        </select>
                      </td>
                      <td className="p-2 border-r">
                        <select
                          value={m.category || 'खुला'}
                          onChange={(e) => handleMemberChange(idx, 'category', e.target.value)}
                          className="w-full px-2 py-1 border border-slate-200 rounded text-xs bg-white"
                        >
                          <option value="महिला">महिला</option>
                          <option value="दलित">दलित</option>
                          <option value="आदिवासी/जनजाति">आदिवासी/जनजाति</option>
                          <option value="अपाङ्गता">अपाङ्गता</option>
                          <option value="खुला">खुला</option>
                        </select>
                      </td>
                      <td className="p-2 border-r">
                        <input
                          type="text"
                          value={m.phone || ''}
                          onChange={(e) => handleMemberChange(idx, 'phone', e.target.value)}
                          className="w-full px-2 py-1 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-teal-500"
                          placeholder="९८xxxxxxxx"
                        />
                      </td>
                      <td className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(idx)}
                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition"
                          title="हटाउनुहोस्"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
</div>
            </div>
          </div>

          {/* Section 3: Bank Account Information */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-teal-900 flex items-center gap-2 border-b pb-2">
              <Building className="w-4 h-4 text-teal-600" />
              ३. उपभोक्ता समितिको बैंक खाता विवरण (किस्ता भुक्तानीका लागि)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">बैंकको नाम</label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  <option value="राष्ट्रिय वाणिज्य बैंक लिमिटेड">राष्ट्रिय वाणिज्य बैंक लिमिटेड</option>
                  <option value="नेपाल बैंक लिमिटेड">नेपाल बैंक लिमिटेड</option>
                  <option value="कृषि विकास बैंक लिमिटेड">कृषि विकास बैंक लिमिटेड</option>
                  <option value="सिन्धु विकास बैंक लिमिटेड">सिन्धु विकास बैंक लिमिटेड</option>
                  <option value="ग्लोबल आइएमई बैंक लिमिटेड">ग्लोबल आइएमई बैंक लिमिटेड</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">शाखा</label>
                <input
                  type="text"
                  value={bankBranch}
                  onChange={(e) => setBankBranch(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  placeholder="उदा: मेलम्ची / थाङपाल शाखा"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  उपभोक्ता समिति चल्ती खाता नम्बर
                </label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  placeholder="उदा: ११६००२३४५६७८९"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">खाताको प्रकार</label>
                <input
                  type="text"
                  value={accountType}
                  onChange={(e) => setAccountType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-6 py-4 flex items-center justify-between border-t border-slate-200">
          <p className="text-xs text-slate-500">
            * विवरण सुरक्षित गरेपछि बैंक सिफारिस र गठन प्रमाणपत्रमा स्वतः अद्यावधिक हुनेछ।
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg text-xs font-medium transition"
            >
              रद्द गर्नुहोस्
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSave}
              className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition shadow-md disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'सुरक्षित गर्दै...' : 'समिति विवरण सुरक्षित गर्नुहोस्'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
