import React, { useState } from 'react';
import { Project } from '../../../types/sectoral';
import {
  X,
  Printer,
  FileText,
  Building,
  CheckCircle,
  Clock,
  ShieldCheck,
  Send,
  Calendar,
  Award,
} from 'lucide-react';
import { useTenant } from '../../../context/TenantContext';

interface OfficialLettersGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
}

type LetterType =
  | 'committee_reg'
  | 'bank_rec'
  | 'agreement_deed'
  | 'work_order'
  | 'time_extension'
  | 'completion_farfarak';

const toNepaliNum = (num: number | string): string => {
  const nepaliDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  return String(num).replace(/\d/g, (d) => nepaliDigits[parseInt(d, 10)]);
};

export const OfficialLettersGeneratorModal: React.FC<OfficialLettersGeneratorModalProps> = ({
  isOpen,
  onClose,
  project,
}) => {
  let tenantSettings: any = null;
  try {
    const tenantCtx = useTenant();
    tenantSettings = tenantCtx?.settings;
  } catch {}

  const [selectedLetter, setSelectedLetter] = useState<LetterType>('work_order');
  const [chalaniNo, setChalaniNo] = useState<string>('PPK-यो.शा.-१४२/०८२-८३');
  const [patraSankhya, setPatraSankhya] = useState<string>('२०८२/०८३');
  const [issueDateBs, setIssueDateBs] = useState<string>('२०८३-०२-२६');

  if (!isOpen || !project) return null;

  const handlePrint = () => {
    window.print();
  };

  const pCost = Number(project.officeCost || project.budget || 0);
  const cCost = Number(project.committeeCost || 0);
  const totalCost = pCost + cCost;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl my-6 flex flex-col max-h-[92vh] overflow-hidden border border-slate-200">
        {/* Top Control Bar (Screen only) */}
        <div className="print:hidden bg-slate-900 text-white px-6 py-4 flex flex-wrap items-center justify-between border-b border-slate-800 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-600 flex items-center justify-center text-white shadow-inner">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-teal-300">
                आधिकारिक स्थानीय तह पत्र तथा प्रमाणपत्र जेनेरेटर
              </h2>
              <p className="text-xs text-slate-300">
                {project.name} | कोड: {project.projectCode}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg flex items-center gap-2 font-medium text-sm transition shadow-md"
            >
              <Printer className="w-4 h-4" />
              आधिकारिक पत्र प्रिन्ट / PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Letter Selector Tabs (Screen only) */}
        <div className="print:hidden bg-slate-100 px-6 py-2.5 border-b border-slate-200 flex flex-wrap gap-2 text-xs font-semibold text-slate-700">
          <button
            onClick={() => setSelectedLetter('work_order')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
              selectedLetter === 'work_order'
                ? 'bg-teal-700 text-white shadow-sm'
                : 'bg-white hover:bg-slate-200 border border-slate-300'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            १. योजना कार्यादेश पत्र (Work Order)
          </button>
          <button
            onClick={() => setSelectedLetter('bank_rec')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
              selectedLetter === 'bank_rec'
                ? 'bg-teal-700 text-white shadow-sm'
                : 'bg-white hover:bg-slate-200 border border-slate-300'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            २. बैंक खाता सिफारिस पत्र
          </button>
          <button
            onClick={() => setSelectedLetter('committee_reg')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
              selectedLetter === 'committee_reg'
                ? 'bg-teal-700 text-white shadow-sm'
                : 'bg-white hover:bg-slate-200 border border-slate-300'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            ३. समिति गठन प्रमाणपत्र
          </button>
          <button
            onClick={() => setSelectedLetter('agreement_deed')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
              selectedLetter === 'agreement_deed'
                ? 'bg-teal-700 text-white shadow-sm'
                : 'bg-white hover:bg-slate-200 border border-slate-300'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            ४. योजना सम्झौता पत्र
          </button>
          <button
            onClick={() => setSelectedLetter('time_extension')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
              selectedLetter === 'time_extension'
                ? 'bg-teal-700 text-white shadow-sm'
                : 'bg-white hover:bg-slate-200 border border-slate-300'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            ५. म्याद थप आदेश पत्र
          </button>
          <button
            onClick={() => setSelectedLetter('completion_farfarak')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
              selectedLetter === 'completion_farfarak'
                ? 'bg-teal-700 text-white shadow-sm'
                : 'bg-white hover:bg-slate-200 border border-slate-300'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            ६. निर्माण सम्पन्न तथा फरफारक सिफारिस
          </button>
        </div>

        {/* Printable Document Sheet */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50 flex justify-center">
          <div className="bg-white p-10 max-w-4xl w-full border border-slate-300 rounded shadow-sm text-slate-800 font-serif leading-relaxed text-sm print:border-none print:shadow-none print:p-4">
            {/* Nepal Emblem & Official Municipality Letterhead */}
            <div className="text-center border-b-2 border-red-700 pb-4 mb-6">
              <div className="flex justify-between items-start">
                <div className="w-16 h-16 flex items-center justify-center">
                  <img
                    src={tenantSettings?.emblem_url || "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Emblem_of_Nepal.svg/240px-Emblem_of_Nepal.svg.png"}
                    alt="नेपाल सरकार"
                    className="w-14 h-14 object-contain"
                  />
                </div>
                <div className="flex-1 px-4">
                  <p className="text-red-700 font-bold text-sm">अनुसूची तथा स्थानीय सरकार सञ्चालन ऐन, २०७४</p>
                  <h1 className="text-2xl font-black text-red-800 tracking-wide mt-1">
                    {tenantSettings?.palika_name || 'पाँचपोखरी थाङपाल गाउँपालिका'}
                  </h1>
                  <h2 className="text-base font-bold text-slate-700 mt-0.5">
                    {tenantSettings?.office_title || 'गाउँ कार्यपालिकाको कार्यालय'}
                  </h2>
                  <p className="text-xs text-slate-600 font-sans mt-0.5">
                    {tenantSettings?.headquarters || tenantSettings?.address || 'थाङपालधाप, सिन्धुपाल्चोक'}, {tenantSettings?.province || 'बागमती प्रदेश'}, नेपाल
                  </p>
                  <p className="text-xs text-teal-800 font-sans font-semibold mt-1">
                    योजना, पूर्वाधार विकास तथा अनुगमन शाखा
                  </p>
                </div>
                <div className="w-16 flex flex-col items-center justify-center text-right">
                  <img
                    src={tenantSettings?.logo_url || '/panchpokhari-logo.png'}
                    alt="Palika Logo"
                    className="w-14 h-14 object-contain rounded-full border border-slate-200"
                    onError={(e: any) => {
                      e.target.src = '/panchpokhari-logo.png';
                    }}
                  />
                  <div className="text-[10px] font-sans text-slate-500 mt-1">
                    आ.व. {toNepaliNum(project.fiscalYear || '')}
                  </div>
                </div>
              </div>

              {/* Reference Number & Date Line */}
              <div className="flex justify-between text-xs text-slate-700 font-sans font-semibold mt-4 pt-2 border-t border-slate-200">
                <div className="flex items-center gap-4">
                  <span>पत्र संख्या: {toNepaliNum(patraSankhya)}</span>
                  <span>चलानी नं.: {chalaniNo}</span>
                </div>
                <div>
                  <span>मिति: वि.सं. {toNepaliNum(issueDateBs)}</span>
                </div>
              </div>
            </div>

            {/* Letter Body based on selected letter */}
            {selectedLetter === 'work_order' && (
              <div className="space-y-4">
                <div className="text-left font-sans">
                  <p className="font-bold">श्री अध्यक्षज्यू,</p>
                  <p className="font-semibold text-teal-900">{project.committeeName || `${project.name} उपभोक्ता समिति`}</p>
                  <p className="text-xs text-slate-600">पाँचपोखरी थाङपाल गाउँपालिका, वडा नं. {toNepaliNum(project.wardNumber)}</p>
                </div>

                <div className="text-center my-4 font-bold text-base underline underline-offset-4">
                  विषय: योजना कार्यादेश (Work Order) सम्बन्धमा।
                </div>

                <p className="text-justify indent-8">
                  प्रस्तुत विषयमा यस पाँचपोखरी थाङपाल गाउँपालिकाको आर्थिक वर्ष <strong>{toNepaliNum(project.fiscalYear || '')}</strong> को स्वीकृत वार्षिक कार्यक्रम अनुसार वडा नं. <strong>{toNepaliNum(project.wardNumber)}</strong> अन्तर्गत सञ्चालन हुने <strong>“{project.name}”</strong> आयोजनाको उपभोक्ता समितिसँग मिति <strong>{toNepaliNum(project.agreementDateBs || 'मिति उपलब्ध छैन')}</strong> गते योजना सम्झौता सम्पन्न भइसकेकोले तपसिलका सर्तहरूको अधीनमा रही योजना कार्यान्वयनको यो <strong>कार्यादेश (Work Order)</strong> प्रदान गरिएको छ।
                </p>

                <div className="bg-slate-50 p-4 border border-slate-300 rounded font-sans text-xs space-y-2">
                  <div className="font-bold text-slate-800 border-b pb-1 text-sm text-teal-900">
                    योजना तथा सम्झौताको संक्षिप्त विवरण:
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <p><strong>आयोजनाको नाम:</strong> {project.name}</p>
                    <p><strong>आयोजना कोड:</strong> {project.projectCode}</p>
                    <p><strong>बजेट स्रोत:</strong> {project.budgetSource || 'संघीय समानीकरण'}</p>
                    <p><strong>गाउँपालिका कार्यालय लागत:</strong> रु. {toNepaliNum(pCost.toLocaleString('en-IN', { minimumFractionDigits: 2 }))}</p>
                    <p><strong>उपभोक्ता समिति लागत (जनसहभागिता):</strong> रु. {toNepaliNum(cCost.toLocaleString('en-IN', { minimumFractionDigits: 2 }))}</p>
                    <p><strong>कुल सम्झौता लागत:</strong> रु. {toNepaliNum(totalCost.toLocaleString('en-IN', { minimumFractionDigits: 2 }))}</p>
                    <p><strong>काम सुरु हुने मिति:</strong> वि.सं. {toNepaliNum(project.startDateBs || 'मिति उपलब्ध छैन')}</p>
                    <p><strong>काम सम्पन्न हुने मिति:</strong> वि.सं. {toNepaliNum(project.completionDateBs || 'मिति उपलब्ध छैन')}</p>
                  </div>
                </div>

                <div className="font-bold text-slate-900 mt-3 text-xs">पालना गर्नुपर्ने प्रमुख निर्देशनहरू:</div>
                <ol className="list-decimal list-inside space-y-1 text-xs text-justify">
                  <li>स्वीकृत लागत अनुमान, नक्सा, डिजाइन र प्राविधिक स्पेसिफिकेसन अनुसार नै कार्य सम्पन्न गर्नुपर्नेछ।</li>
                  <li>काम सुरु गर्नु अघि, काम हुँदै गर्दा र कार्य सम्पन्न भएपछिको स्पष्ट फोटो सुरक्षित राख्नुपर्नेछ।</li>
                  <li>कार्यस्थलमा योजनाको लागत, उपभोक्ता समिति र अवधिसहितको <strong>नागरिक सूचना पाटी (Signboard)</strong> अनिवार्य राख्नुपर्नेछ।</li>
                  <li>दोस्रो तथा अन्तिम किस्ता निकासा अघि अनिवार्य रूपमा <strong>सार्वजनिक परीक्षण (Public Audit)</strong> सम्पन्न गरी सोको माइन्युट पेश गर्नुपर्नेछ।</li>
                  <li>तोकिएको म्याद मिति <strong>{toNepaliNum(project.completionDateBs || 'मिति उपलब्ध छैन')}</strong> भित्र सम्पूर्ण काम सम्पन्न गरी प्राविधिक शाखाबाट नापी किताब प्रमाणित गराउनुपर्नेछ।</li>
                </ol>
              </div>
            )}

            {selectedLetter === 'bank_rec' && (
              <div className="space-y-4">
                <div className="text-left font-sans">
                  <p className="font-bold">श्री शाखा प्रबन्धकज्यू,</p>
                  <p className="font-semibold text-teal-900">
                    {project.committeeBankDetails?.bankName || 'राष्ट्रिय वाणिज्य बैंक लिमिटेड / नेपाल बैंक लिमिटेड'}
                  </p>
                  <p className="text-xs text-slate-600">मेलम्ची / थाङपाल शाखा, सिन्धुपाल्चोक।</p>
                </div>

                <div className="text-center my-4 font-bold text-base underline underline-offset-4">
                  विषय: उपभोक्ता समितिको बैंक खाता सञ्चालन सिफारिस सम्बन्धमा।
                </div>

                <p className="text-justify indent-8">
                  प्रस्तुत विषयमा यस पाँचपोखरी थाङपाल गाउँपालिकाको स्वीकृत वार्षिक नीति तथा कार्यक्रम अनुसार वडा नं. <strong>{toNepaliNum(project.wardNumber)}</strong> मा सञ्चालन हुने <strong>“{project.name}”</strong> आयोजना कार्यान्वयनका लागि गठन भएको <strong>{project.committeeName || `${project.name} उपभोक्ता समिति`}</strong> का तपसिलमा उल्लेखित पदाधिकारीहरूको संयुक्त दस्तखतबाट सञ्चालन हुने गरी उक्त बैंकमा <strong>उपभोक्ता समिति चल्ती खाता (Current Account)</strong> खोलिदिनुहुन सिफारिस साथ अनुरोध गरिन्छ।
                </p>

                <div className="bg-slate-50 p-4 border border-slate-300 rounded font-sans text-xs space-y-3">
                  <div className="font-bold text-slate-800 border-b pb-1 text-teal-900">
                    खाता सञ्चालक पदाधिकारीहरूको विवरण:
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-2 border border-slate-200 bg-white rounded">
                      <p className="font-bold text-slate-900">अध्यक्ष:</p>
                      <p>{project.committeeChair || 'दावा दोर्जे तामाङ'}</p>
                      <p className="text-slate-500 text-[11px]">दस्तखत: ........................</p>
                    </div>
                    <div className="p-2 border border-slate-200 bg-white rounded">
                      <p className="font-bold text-slate-900">सचिव:</p>
                      <p>{project.committeeSecretary || 'निमा लामा'}</p>
                      <p className="text-slate-500 text-[11px]">दस्तखत: ........................</p>
                    </div>
                    <div className="p-2 border border-slate-200 bg-white rounded">
                      <p className="font-bold text-slate-900">कोषाध्यक्ष:</p>
                      <p>{project.committeeTreasurer || 'पासाङ ल्हामु शेर्पा'}</p>
                      <p className="text-slate-500 text-[11px]">दस्तखत: ........................</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-600 italic">
                    * खाता सञ्चालन नियम: अध्यक्ष र कोषाध्यक्षको संयुक्त दस्तखत वा निर्णय बमोजिम दुई जनाको दस्तखतबाट खाता सञ्चालन हुनेछ।
                  </p>
                </div>
              </div>
            )}

            {selectedLetter === 'committee_reg' && (
              <div className="space-y-4">
                <div className="text-center my-3 font-bold text-lg text-teal-950 underline underline-offset-8">
                  उपभोक्ता समिति गठन तथा दर्ता प्रमाणपत्र
                </div>
                <div className="text-center text-xs text-slate-600 font-sans -mt-2">
                  (स्थानीय तह उपभोक्ता समिति गठन, परिचालन तथा व्यवस्थापन कार्यविधि, २०७४ बमोजिम)
                </div>

                <p className="text-justify indent-8 mt-4">
                  पाँचपोखरी थाङपाल गाउँपालिका वडा नं. <strong>{toNepaliNum(project.wardNumber)}</strong> स्थित भेलाबाट स्थानीय उपभोक्ताहरूको उपस्थितिमा मिति <strong>{toNepaliNum(project.agreementDateBs || 'मिति उपलब्ध छैन')}</strong> गते सर्वसम्मत रूपमा गठन भएको तपसिल बमोजिमको उपभोक्ता समितिलाई <strong>“{project.name}”</strong> आयोजना कार्यान्वयन प्रयोजनार्थ यो <strong>गठन तथा दर्ता प्रमाणपत्र</strong> प्रदान गरिएको छ।
                </p>

                <div className="border border-slate-300 rounded overflow-hidden font-sans text-xs mt-3">
                  <div className="dt-responsive-table-wrapper">
<table className="w-full text-left">
                    <thead className="bg-slate-100 border-b border-slate-300 font-bold">
                      <tr>
                        <th className="p-2 border-r">क्र.स.</th>
                        <th className="p-2 border-r">पद</th>
                        <th className="p-2 border-r">नाम, थर</th>
                        <th className="p-2 border-r">लिङ्ग / समावेशी समूह</th>
                        <th className="p-2">सम्पर्क नं.</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="p-2 border-r text-center">१</td>
                        <td className="p-2 border-r font-bold">अध्यक्ष</td>
                        <td className="p-2 border-r">{project.committeeChair || 'दावा दोर्जे तामाङ'}</td>
                        <td className="p-2 border-r">पुरुष (जनजाति)</td>
                        <td className="p-2">{toNepaliNum(project.committeePhone || '९८४१५२६३७१')}</td>
                      </tr>
                      <tr>
                        <td className="p-2 border-r text-center">२</td>
                        <td className="p-2 border-r font-bold">सचिव</td>
                        <td className="p-2 border-r">{project.committeeSecretary || 'निमा लामा'}</td>
                        <td className="p-2 border-r">पुरुष</td>
                        <td className="p-2">{toNepaliNum('९८५१०००००१')}</td>
                      </tr>
                      <tr>
                        <td className="p-2 border-r text-center">३</td>
                        <td className="p-2 border-r font-bold">कोषाध्यक्ष</td>
                        <td className="p-2 border-r">{project.committeeTreasurer || 'पासाङ ल्हामु शेर्पा'}</td>
                        <td className="p-2 border-r text-teal-800 font-semibold">महिला</td>
                        <td className="p-2">{toNepaliNum('९८४१०००००२')}</td>
                      </tr>
                      <tr>
                        <td className="p-2 border-r text-center">४</td>
                        <td className="p-2 border-r">सदस्य</td>
                        <td className="p-2 border-r">डोल्मा शेर्पा</td>
                        <td className="p-2 border-r text-teal-800 font-semibold">महिला (समावेशी)</td>
                        <td className="p-2">{toNepaliNum('९८६१०००००३')}</td>
                      </tr>
                      <tr>
                        <td className="p-2 border-r text-center">५</td>
                        <td className="p-2 border-r">सदस्य</td>
                        <td className="p-2 border-r">सुब्बा बिक</td>
                        <td className="p-2 border-r text-indigo-800 font-semibold">दलित प्रतिनिधि</td>
                        <td className="p-2">{toNepaliNum('९८४२०००००४')}</td>
                      </tr>
                    </tbody>
                  </table>
</div>
                </div>
              </div>
            )}

            {selectedLetter === 'agreement_deed' && (
              <div className="space-y-4">
                <div className="text-center my-3 font-bold text-base underline underline-offset-4">
                  विषय: योजना सम्झौता पत्र (Formal Agreement Deed)
                </div>

                <p className="text-justify indent-8">
                  पाँचपोखरी थाङपाल गाउँ कार्यपालिकाको कार्यालय (प्रथम पक्ष) र <strong>{project.committeeName || `${project.name} उपभोक्ता समिति`}</strong> (दोस्रो पक्ष) बीच आर्थिक वर्ष <strong>{toNepaliNum(project.fiscalYear || '')}</strong> को स्वीकृत बजेट शीर्षक अन्तर्गत <strong>“{project.name}”</strong> आयोजना कार्यान्वयन गर्न तपसिलका सर्तहरूमा आपसी सहमति जनाई यो सम्झौता पत्रमा हस्ताक्षर गरिएको छ।
                </p>

                <div className="bg-slate-50 p-3 border border-slate-300 rounded font-sans text-xs space-y-1">
                  <p><strong>१. स्वीकृत कार्यालय लागत:</strong> रु. {toNepaliNum(pCost.toLocaleString('en-IN', { minimumFractionDigits: 2 }))}</p>
                  <p><strong>२. उपभोक्ता समिति लागत (लागत साझेदारी):</strong> रु. {toNepaliNum(cCost.toLocaleString('en-IN', { minimumFractionDigits: 2 }))}</p>
                  <p><strong>३. कुल सम्झौता रकम:</strong> रु. {toNepaliNum(totalCost.toLocaleString('en-IN', { minimumFractionDigits: 2 }))}</p>
                  <p><strong>४. कार्य सम्पन्न म्याद:</strong> वि.सं. {toNepaliNum(project.completionDateBs || 'मिति उपलब्ध छैन')}</p>
                </div>

                <div className="text-xs space-y-1 text-justify">
                  <p><strong>मुख्य सर्तहरू:</strong></p>
                  <p>१. समितिले कुनै पनि ठेकेदार वा बिचौलियालाई काम सुम्पन पाउने छैन।</p>
                  <p>२. निर्माण सामग्री गुणस्तरीय हुनुपर्नेछ र इन्जिनियरको सिफारिसमा मात्र भुक्तानी निकासा हुनेछ।</p>
                  <p>३. मर्मत सम्भार कोष बापत ३% र कन्टिन्जेन्सी ३% नियमानुसार कट्टी गरिनेछ।</p>
                </div>
              </div>
            )}

            {selectedLetter === 'time_extension' && (
              <div className="space-y-4">
                <div className="text-left font-sans">
                  <p className="font-bold">श्री अध्यक्षज्यू,</p>
                  <p className="font-semibold text-teal-900">{project.committeeName}</p>
                  <p className="text-xs text-slate-600">वडा नं. {toNepaliNum(project.wardNumber)}</p>
                </div>

                <div className="text-center my-4 font-bold text-base underline underline-offset-4">
                  विषय: योजना कार्य सम्पन्न गर्ने म्याद थप सम्बन्धमा।
                </div>

                <p className="text-justify indent-8">
                  प्रस्तुत विषयमा त्यस समितिबाट मिति <strong>{toNepaliNum(project.completionDateBs || 'मिति उपलब्ध छैन')}</strong> सम्म सम्पन्न गर्ने गरी सम्झौता भएको <strong>“{project.name}”</strong> आयोजना प्रतिकूल मौसम / प्राविधिक कारणवश समयमै सम्पन्न हुन नसकी म्याद थपको लागि परेको निवेदन उपर गाउँ कार्यपालिकाको निर्णयानुसार मिति <strong>२०८३-०३-३०</strong> गते सम्मका लागि म्याद थप गरी अनुमोदन गरिएको व्यहोरा जानकारी गराइन्छ।
                </p>
              </div>
            )}

            {selectedLetter === 'completion_farfarak' && (
              <div className="space-y-4">
                <div className="text-center my-3 font-bold text-base text-red-900 underline underline-offset-4">
                  विषय: निर्माण सम्पन्न तथा योजना फरफारक सिफारिस पत्र
                </div>

                <p className="text-justify indent-8">
                  पाँचपोखरी थाङपाल गाउँपालिका अन्तर्गत सञ्चालित <strong>“{project.name}”</strong> आयोजनाको सम्झौता अनुसारको सम्पूर्ण कार्य प्राविधिक स्पेसिफिकेसन अनुसार १००% सम्पन्न भई, नापी किताब (MB) प्रमाणित भएको, सार्वजनिक परीक्षण सम्पन्न भएको र आवश्यक बिल भर्पाई अडिट ट्रेल परीक्षण भएकोले अन्तिम किस्ता भुक्तानी तथा <strong>योजना फरफारक (Clearance)</strong> का लागि यो सिफारिस पेश गरिएको छ।
                </p>

                <div className="bg-emerald-50 p-4 border border-emerald-300 rounded font-sans text-xs space-y-1 text-emerald-950">
                  <p><strong>अन्तिम लेखापरीक्षण लागत:</strong> रु. {toNepaliNum(totalCost.toLocaleString('en-IN', { minimumFractionDigits: 2 }))}</p>
                  <p><strong>मर्मत सम्भार कोष (३%) दाखिला:</strong> रु. {toNepaliNum(Math.round(totalCost * 0.03).toLocaleString('en-IN'))}</p>
                  <p><strong>कन्टिन्जेन्सी कट्टी (३%):</strong> रु. {toNepaliNum(Math.round(totalCost * 0.03).toLocaleString('en-IN'))}</p>
                  <p><strong>फरफारक स्थिति:</strong> पूर्ण रूपमा सम्पन्न तथा समुदायलाई हस्तान्तरण</p>
                </div>
              </div>
            )}

            {/* Official Signatures Block */}
            <div className="grid grid-cols-3 gap-6 pt-16 mt-8 border-t border-slate-300 text-center text-xs font-sans">
              <div>
                <p className="border-t border-slate-400 pt-1 font-bold text-slate-800">
                  {selectedLetter === 'committee_reg' || selectedLetter === 'agreement_deed'
                    ? 'उपभोक्ता समिति अध्यक्ष'
                    : 'योजना / प्राविधिक शाखा'}
                </p>
                <p className="text-slate-500 text-[11px]">
                  {selectedLetter === 'committee_reg' || selectedLetter === 'agreement_deed'
                    ? project.committeeChair || 'अध्यक्ष'
                    : 'सब-इन्जिनियर / इन्जिनियर'}
                </p>
              </div>

              <div>
                <p className="border-t border-slate-400 pt-1 font-bold text-slate-800">
                  वडा अध्यक्ष / अनुगमन संयोजक
                </p>
                <p className="text-slate-500 text-[11px]">
                  वडा नं. {toNepaliNum(project.wardNumber)} कार्यालय
                </p>
              </div>

              <div>
                <p className="border-t border-slate-400 pt-1 font-bold text-slate-800">
                  प्रमुख प्रशासकीय अधिकृत
                </p>
                <p className="text-slate-500 text-[11px]">
                  पाँचपोखरी थाङपाल गाउँपालिका
                </p>
              </div>
            </div>

            {/* Footer stamp & seal */}
            <div className="mt-8 text-center text-[10px] text-slate-400 font-sans border-t pt-2 flex justify-between">
              <span>पाँचपोखरी थाङपाल गाउँपालिका - डिजिटल ट्विन योजना व्यवस्थापन प्रणाली</span>
              <span>कम्प्युटर सिर्जित आधिकारिक पत्र | प्रमाणीकरण कोड: {project.projectCode}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
