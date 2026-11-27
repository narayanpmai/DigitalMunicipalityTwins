import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
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
  Award,
  Hash,
} from 'lucide-react';
import { useTenant } from '../../../context/TenantContext';
import { municipalityApi } from '../../../api/municipality';
import { representativesApi } from '../../../api/representatives';
import { branchesApi } from '../../../api/branches';
import { dartaChalaniApi } from '../../../api/darta-chalani';
import { NepaliDatePicker } from '../../../components/common/NepaliDatePicker';
import { adToBs } from '../../../utils/nepaliCalendar';
import { CentralDocumentSheet } from '../../../components/common/CentralLetterhead';

type LetterType =
  | 'committee_reg'
  | 'bank_rec'
  | 'agreement_deed'
  | 'work_order'
  | 'time_extension'
  | 'completion_farfarak';

interface OfficialLettersGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  initialLetter?: LetterType;
}

const LETTER_SUBJECTS: Record<LetterType, string> = {
  work_order: 'योजना कार्यादेश (Work Order) सम्बन्धमा',
  bank_rec: 'उपभोक्ता समितिको बैंक खाता सञ्चालन सिफारिस सम्बन्धमा',
  committee_reg: 'उपभोक्ता समिति गठन तथा दर्ता प्रमाणपत्र',
  agreement_deed: 'योजना सम्झौता पत्र (Formal Agreement Deed)',
  time_extension: 'योजना कार्य सम्पन्न गर्ने म्याद थप सम्बन्धमा',
  completion_farfarak: 'निर्माण सम्पन्न तथा योजना फरफारक सिफारिस सम्बन्धमा',
};

const toNepaliNum = (num: number | string): string => {
  const nepaliDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  return String(num).replace(/\d/g, (d) => nepaliDigits[parseInt(d, 10)]);
};

export const OfficialLettersGeneratorModal: React.FC<OfficialLettersGeneratorModalProps> = ({
  isOpen,
  onClose,
  project,
  initialLetter = 'work_order',
}) => {
  let tenantSettings: any = null;
  try {
    const tenantCtx = useTenant();
    tenantSettings = tenantCtx?.settings;
  } catch {}

  const todayBs = adToBs(new Date().toISOString().split('T')[0]) || '२०८१-०४-०१';
  const [selectedLetter, setSelectedLetter] = useState<LetterType>('work_order');
  const [chalaniNo, setChalaniNo] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [patraSankhya, setPatraSankhya] = useState<string>('२०८१/०८२');
  const [issueDateBs, setIssueDateBs] = useState<string>(todayBs);
  const [extendedDateBs, setExtendedDateBs] = useState<string>('');
  const [isRegisteringChalani, setIsRegisteringChalani] = useState(false);
  const [chalaniNotice, setChalaniNotice] = useState<string | null>(null);

  // Bank selection for bank recommendation letter
  const [selectedBank, setSelectedBank] = useState<string>('राष्ट्रिय वाणिज्य बैंक लिमिटेड (थाङपालधाप शाखा)');
  const [bankBranchAddress, setBankBranchAddress] = useState<string>('थाङपालधाप, सिन्धुपाल्चोक');
  const [customBankName, setCustomBankName] = useState<string>('');

  const { data: palikaProfile } = useQuery({
    queryKey: ['municipality-profile'],
    queryFn: () => municipalityApi.getProfile(),
    staleTime: 60000,
    enabled: isOpen,
  });

  const { data: representatives = [] } = useQuery<any[]>({
    queryKey: ['representatives-roster'],
    queryFn: () => representativesApi.getAll({ isCurrent: true }),
    staleTime: 60000,
    enabled: isOpen,
  });

  const { data: branches = [] } = useQuery<any[]>({
    queryKey: ['branches-list'],
    queryFn: () => branchesApi.getAll('palika'),
    staleTime: 60000,
    enabled: isOpen,
  });

  const handleAutoDispatch = async (letterType: LetterType, force = false) => {
    if (!project?.id) return;
    setIsRegisteringChalani(true);
    setChalaniNotice(null);
    try {
      const res: any = await dartaChalaniApi.autoDispatchChalani({
        sourceModule: 'yojana_planning',
        sourceRecordId: String(project.id),
        sourceTitle: project.name,
        letterType: letterType,
        fiscalYear: project.fiscalYear || patraSankhya,
        dispatchDate: issueDateBs,
        subject: `${project.name} — ${LETTER_SUBJECTS[letterType]}`,
        receiverName: project.committeeName || `${project.name} उपभोक्ता समिति`,
        receiverAddress: `वडा नं. ${project.wardNumber}, ${palikaProfile?.name || 'पाँचपोखरी थाङपाल गाउँपालिका'}`,
        department: 'योजना तथा पूर्वाधार विकास शाखा',
        signedBy: chiefOfficerName,
        forceNew: force,
      });

      if (res?.dispatchNo) {
        setChalaniNo(res.dispatchNo);
        setVerificationCode(res.verificationCode || `PKP-C-${project.fiscalYear || '2081'}-${res.dispatchNo}`);
        setChalaniNotice(
          res.isExisting
            ? `यस पत्रको आधिकारिक चलानी नं. ${toNepaliNum(res.dispatchNo)} पहिल्यै दर्ता-चलानी प्रणालीमा कायम छ (प्रमाणीकरण कोड: ${res.verificationCode || '-'})`
            : `नयाँ चलानी नं. ${toNepaliNum(res.dispatchNo)} डिजिटल दर्ता-चलानी प्रणालीमा स्वतः सुरक्षित गरियो (कोड: ${res.verificationCode || '-'})!`
        );
      }
    } catch {
      setChalaniNotice('दर्ता-चलानीमा जडान गर्न सकिएन। कृपया म्यानुअल चलानी नं. राख्नुहोस्।');
    } finally {
      setIsRegisteringChalani(false);
    }
  };

  useEffect(() => {
    if (!isOpen || !project) return;
    const targetLetter = initialLetter || 'work_order';
    setSelectedLetter(targetLetter);
    setPatraSankhya(project.fiscalYear || '२०८१/०८२');
    setIssueDateBs(todayBs);
    setExtendedDateBs(project.completionDateBs || todayBs);
    setChalaniNotice(null);

    if (project.committeeBankDetails?.bankName) {
      setSelectedBank(project.committeeBankDetails.bankName);
      setBankBranchAddress(project.committeeBankDetails.branchName || 'थाङपालधाप, सिन्धुपाल्चोक');
    } else {
      setSelectedBank('राष्ट्रिय वाणिज्य बैंक लिमिटेड (थाङपालधाप शाखा)');
      setBankBranchAddress('थाङपालधाप, सिन्धुपाल्चोक');
    }

    // Auto-fetch or reserve central Chalani number for this letter
    handleAutoDispatch(targetLetter, false);
  }, [isOpen, project, initialLetter, todayBs]);

  if (!isOpen || !project) return null;

  const chiefOfficerName = palikaProfile?.leadership?.chiefOfficer?.name || 'प्रमुख प्रशासकीय अधिकृत';
  const wardChair = representatives.find(
    (r) => Number(r.wardNo) === Number(project.wardNumber) && String(r.designation || '').includes('अध्यक्ष'),
  );
  const infraBranch = branches.find((b) => b.code === 'INF' || String(b.name || '').includes('पूर्वाधार'));
  const engineerDisplay = project.responsibleEngineer || infraBranch?.headEmployeeName || 'सब-इन्जिनियर / इन्जिनियर';

  const handleRegisterChalani = () => {
    handleAutoDispatch(selectedLetter, true);
  };

  const handleSwitchLetter = (letter: LetterType) => {
    setSelectedLetter(letter);
    handleAutoDispatch(letter, false);
  };

  const handlePrint = () => {
    window.print();
  };

  const pCost = Number(project.officeCost || project.budget || 0);
  const cCost = Number(project.committeeCost || 0);
  const totalCost = pCost + cCost;
  const maintRate = Number(project.maintenanceFundPercent ?? 3);
  const contRate = Number(project.contingencyRatePercent ?? 3);

  const committeeMembersList =
    Array.isArray(project.committeeMembers) && project.committeeMembers.length > 0
      ? project.committeeMembers
      : [
          project.committeeChair && { role: 'अध्यक्ष', name: project.committeeChair, gender: '-', category: '-', phone: project.committeePhone || '-' },
          project.committeeSecretary && { role: 'सचिव', name: project.committeeSecretary, gender: '-', category: '-', phone: '-' },
          project.committeeTreasurer && { role: 'कोषाध्यक्ष', name: project.committeeTreasurer, gender: 'महिला', category: '-', phone: '-' },
        ].filter(Boolean);

  const chairSignatory = project.signatories?.chairperson || {
    name: project.committeeChair || 'अध्यक्ष',
    citizenshipNo: '-',
    phone: project.committeePhone || '-',
  };
  const secSignatory = project.signatories?.secretary || {
    name: project.committeeSecretary || 'सचिव',
    citizenshipNo: '-',
    phone: '-',
  };
  const treasSignatory = project.signatories?.treasurer || {
    name: project.committeeTreasurer || 'कोषाध्यक्ष',
    citizenshipNo: '-',
    phone: '-',
  };
  const effectiveBankName = selectedBank === 'अन्य' ? (customBankName || 'बैंक तथा वित्तीय संस्था') : selectedBank;

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
        className="bg-white rounded-xl shadow-2xl w-full max-w-5xl my-6 flex flex-col max-h-[92vh] overflow-hidden border border-slate-200"
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '1000px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          border: '1px solid #cbd5e1',
          margin: 'auto',
        }}
      >
        {/* Top Control Bar (Screen only) */}
        <div
          className="print:hidden bg-slate-900 text-white px-6 py-4 flex flex-wrap items-center justify-between border-b border-slate-800 gap-4"
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            color: '#ffffff',
            padding: '1.2rem 1.5rem',
            borderBottom: '1px solid #1e293b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
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
            onClick={() => handleSwitchLetter('work_order')}
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
            onClick={() => handleSwitchLetter('bank_rec')}
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
            onClick={() => handleSwitchLetter('committee_reg')}
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
            onClick={() => handleSwitchLetter('agreement_deed')}
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
            onClick={() => handleSwitchLetter('time_extension')}
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
            onClick={() => handleSwitchLetter('completion_farfarak')}
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

        {/* Letter Metadata & Darta-Chalani Control Bar (Screen only) */}
        <div className="print:hidden bg-white px-6 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-600">पत्र संख्या:</span>
              <input
                type="text"
                value={patraSankhya}
                onChange={(e) => setPatraSankhya(e.target.value)}
                className="w-24 px-2 py-1 border rounded text-xs"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-600">चलानी नं.:</span>
              <input
                type="text"
                value={chalaniNo}
                onChange={(e) => setChalaniNo(e.target.value)}
                className="w-32 px-2 py-1 border rounded text-xs font-mono"
              />
            </div>
            <div className="w-44">
              <NepaliDatePicker
                value={issueDateBs}
                onChange={(bs) => setIssueDateBs(bs)}
                placeholder="जारी मिति"
                inputStyle={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
              />
            </div>
            {selectedLetter === 'time_extension' && (
              <div className="w-44">
                <NepaliDatePicker
                  value={extendedDateBs}
                  onChange={(bs) => setExtendedDateBs(bs)}
                  placeholder="थप गरिएको म्याद"
                  inputStyle={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', borderColor: '#f59e0b' }}
                />
              </div>
            )}
            {selectedLetter === 'bank_rec' && (
              <div className="flex items-center gap-1.5 bg-teal-50 px-2 py-1 rounded border border-teal-200">
                <span className="font-semibold text-teal-800">बैंक / शाखा:</span>
                <select
                  value={selectedBank}
                  onChange={(e) => {
                    const b = e.target.value;
                    setSelectedBank(b);
                    if (b.includes('थाङपालधाप')) {
                      setBankBranchAddress('थाङपालधाप शाखा, सिन्धुपाल्चोक');
                    } else if (b.includes('मेलम्ची')) {
                      setBankBranchAddress('मेलम्ची शाखा, सिन्धुपाल्चोक');
                    }
                  }}
                  className="px-2 py-0.5 border rounded text-xs bg-white font-medium text-slate-800"
                >
                  <option value="राष्ट्रिय वाणिज्य बैंक लिमिटेड (थाङपालधाप शाखा)">राष्ट्रिय वाणिज्य बैंक लि. (थाङपालधाप)</option>
                  <option value="नेपाल बैंक लिमिटेड (मेलम्ची शाखा)">नेपाल बैंक लि. (मेलम्ची)</option>
                  <option value="कृषि विकास बैंक लिमिटेड (मेलम्ची शाखा)">कृषि विकास बैंक लि. (मेलम्ची)</option>
                  <option value="अन्य">अन्य बैंक...</option>
                </select>
                {selectedBank === 'अन्य' && (
                  <input
                    type="text"
                    value={customBankName}
                    onChange={(e) => setCustomBankName(e.target.value)}
                    placeholder="बैंक तथा शाखाको नाम"
                    className="px-2 py-0.5 border rounded text-xs w-40"
                  />
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRegisterChalani}
              disabled={isRegisteringChalani}
              className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <Hash className="w-3.5 h-3.5" />
              {isRegisteringChalani ? 'दर्ता हुँदैछ...' : 'दर्ता-चलानीबाट चलानी नं. लिनुहोस्'}
            </button>
          </div>
          {chalaniNotice && (
            <div className="w-full text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded">
              {chalaniNotice}
            </div>
          )}
        </div>

        {/* Printable Document Sheet */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50 flex justify-center">
          <CentralDocumentSheet
            id="printable-project-official-letter"
            activeFiscalYear={toNepaliNum(project.fiscalYear || '२०८१/०८२')}
            patraSankhya={toNepaliNum(patraSankhya)}
            chalaniNo={chalaniNo ? toNepaliNum(chalaniNo) : 'दर्ता बाँकी'}
            branchTitle="योजना, पूर्वाधार विकास तथा अनुगमन शाखा"
            branchPlacement="left"
            documentTitle={LETTER_SUBJECTS[selectedLetter]}
            dateLabel="चलानी मिति"
            dateBs={toNepaliNum(issueDateBs)}
            showWatermark={true}
            showFooter={true}
            showNepalSambat={true}
            style={{ maxWidth: '850px', width: '100%' }}
          >

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
                  प्रस्तुत विषयमा यस पाँचपोखरी थाङपाल गाउँपालिकाको आर्थिक वर्ष <strong>{toNepaliNum(project.fiscalYear || '')}</strong> को स्वीकृत वार्षिक बजेट तथा नीति कार्यक्रम अनुसार वडा नं. <strong>{toNepaliNum(project.wardNumber)}</strong> अन्तर्गत सञ्चालन हुने <strong>“{project.name}”</strong> आयोजनाको उपभोक्ता समितिसँग मिति <strong>{toNepaliNum(project.agreementDateBs || 'मिति उपलब्ध छैन')}</strong> गते योजना सम्झौता सम्पन्न भइसकेकोले तपसिलका सर्तहरूको अधीनमा रही निर्धारित समयसीमाभित्र गुणस्तरीय रूपमा योजना कार्यान्वयन गर्न यो <strong>कार्यादेश (Work Order)</strong> प्रदान गरिएको छ।
                </p>

                <div className="bg-slate-50 p-4 border border-slate-300 rounded font-sans text-xs space-y-2">
                  <div className="font-bold text-slate-800 border-b pb-1 text-sm text-teal-900">
                    योजना तथा सम्झौताको संक्षिप्त विवरण:
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <p><strong>आयोजनाको नाम:</strong> {project.name}</p>
                    <p><strong>आयोजना कोड:</strong> {project.projectCode}</p>
                    <p><strong>बजेट उप-शीर्षक नं.:</strong> {toNepaliNum(project.budgetSubHead || '८०३२७५०५३०१')}</p>
                    <p><strong>बजेट स्रोत:</strong> {project.budgetSource || 'संघीय समानीकरण / आन्तरिक स्रोत'}</p>
                    <p><strong>गाउँपालिका कार्यालय लागत:</strong> रु. {toNepaliNum(pCost.toLocaleString('en-IN', { minimumFractionDigits: 2 }))}</p>
                    <p><strong>उपभोक्ता समिति लागत (जनसहभागिता):</strong> रु. {toNepaliNum(cCost.toLocaleString('en-IN', { minimumFractionDigits: 2 }))}</p>
                    {project.laborContribution && (
                      <p><strong>श्रमदान / जनसहभागिता:</strong> {project.laborContribution}</p>
                    )}
                    <p><strong>कुल सम्झौता लागत:</strong> रु. {toNepaliNum(totalCost.toLocaleString('en-IN', { minimumFractionDigits: 2 }))}</p>
                    <p><strong>काम सुरु हुने मिति:</strong> वि.सं. {toNepaliNum(project.startDateBs || 'मिति उपलब्ध छैन')}</p>
                    <p><strong>काम सम्पन्न हुने मिति:</strong> वि.सं. {toNepaliNum(project.completionDateBs || 'मिति उपलब्ध छैन')}</p>
                  </div>
                </div>

                <div className="bg-blue-50 p-3 border border-blue-200 rounded font-sans text-xs space-y-1 text-blue-950">
                  <div className="font-bold text-blue-900">किस्ता निकासा सम्बन्धी तालिका:</div>
                  <p>• <strong>प्रथम किस्ता (पेश्की):</strong> सम्झौता सम्पन्न भएपछि पेश्की सिफारिस र आवश्यक कागजातका आधारमा रु. {toNepaliNum(Math.round(pCost * 0.3).toLocaleString('en-IN'))} (३०%) सम्म निकासा हुनेछ।</p>
                  <p>• <strong>दोस्रो किस्ता (रनिङ बिल):</strong> कम्तिमा ६०% भौतिक प्रगति भई प्राविधिक नापी किताब (MB) प्रमाणित भएपछि रु. {toNepaliNum(Math.round(pCost * 0.5).toLocaleString('en-IN'))} (५०%) निकासा हुनेछ।</p>
                  <p>• <strong>अन्तिम किस्ता:</strong> १००% निर्माण कार्य सम्पन्न भई सार्वजनिक परीक्षण (Social Audit) तथा फरफारक अनुमोदन भएपछि बाँकी २०% रकम भुक्तानी हुनेछ।</p>
                </div>

                <div className="font-bold text-slate-900 mt-3 text-xs">पालना गर्नुपर्ने प्रमुख निर्देशनहरू:</div>
                <ol className="list-decimal list-inside space-y-1 text-xs text-justify">
                  <li>स्वीकृत लागत अनुमान, नक्सा, डिजाइन र प्राविधिक स्पेसिफिकेसन अनुसार नै कार्य सम्पन्न गर्नुपर्नेछ। कुनै फेरबदल गर्नुपरेमा प्राविधिक शाखाको पूर्व स्वीकृति अनिवार्य हुनेछ।</li>
                  <li>काम सुरु गर्नु अघि, काम हुँदै गर्दा र कार्य सम्पन्न भएपछिको स्पष्ट फोटो (Geotagged) सुरक्षित राख्नुपर्नेछ।</li>
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
                  <p className="font-bold text-teal-900 text-sm">
                    {effectiveBankName}
                  </p>
                  <p className="text-xs text-slate-600">{bankBranchAddress}।</p>
                </div>

                <div className="text-center my-4 font-bold text-base underline underline-offset-4">
                  विषय: उपभोक्ता समितिको बैंक खाता सञ्चालन सिफारिस सम्बन्धमा।
                </div>

                <p className="text-justify indent-8">
                  प्रस्तुत विषयमा यस पाँचपोखरी थाङपाल गाउँपालिकाको आर्थिक वर्ष <strong>{toNepaliNum(project.fiscalYear || '')}</strong> को स्वीकृत वार्षिक नीति तथा कार्यक्रम अनुसार वडा नं. <strong>{toNepaliNum(project.wardNumber)}</strong> मा सञ्चालन हुने <strong>“{project.name}”</strong> (आयोजना कोड: <strong>{project.projectCode}</strong>{project.budgetSubHead ? `, बजेट उप-शीर्षक नं.: ${toNepaliNum(project.budgetSubHead)}` : ''}{project.budgetSource ? `, बजेट स्रोत: ${project.budgetSource}` : ''}) कार्यान्वयनका लागि गठन भएको <strong>{project.committeeName || `${project.name} उपभोक्ता समिति`}</strong> का तपसिलमा उल्लेखित पदाधिकारीहरूको संयुक्त दस्तखतबाट सञ्चालन हुने गरी उक्त बैंकमा <strong>उपभोक्ता समिति चल्ती खाता (Current Account)</strong> खोलिदिनुहुन सिफारिस साथ अनुरोध गरिन्छ।
                </p>

                <div className="bg-slate-50 p-4 border border-slate-300 rounded font-sans text-xs space-y-3">
                  <div className="font-bold text-slate-800 border-b pb-1 text-teal-900 text-sm">
                    १. खाता सञ्चालक पदाधिकारीहरूको विवरण तथा दस्तखत नमुना:
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 border border-slate-200 bg-white rounded shadow-xs space-y-1">
                      <div className="font-bold text-slate-900 text-sm border-b pb-1 text-teal-900">अध्यक्ष:</div>
                      <p className="font-semibold text-slate-800">{chairSignatory.name || '.........................'}</p>
                      <p className="text-slate-600">ना.प्र.नं.: {toNepaliNum(chairSignatory.citizenshipNo || '-')}</p>
                      <p className="text-slate-600">सम्पर्क नं.: {toNepaliNum(chairSignatory.phone || project.committeePhone || '-')}</p>
                      <div className="pt-6 border-b border-dashed border-slate-400"></div>
                      <p className="text-slate-500 text-[10px] text-center">दस्तखत / नमुना हस्ताक्षर</p>
                    </div>

                    <div className="p-3 border border-slate-200 bg-white rounded shadow-xs space-y-1">
                      <div className="font-bold text-slate-900 text-sm border-b pb-1 text-teal-900">सचिव:</div>
                      <p className="font-semibold text-slate-800">{secSignatory.name || '.........................'}</p>
                      <p className="text-slate-600">ना.प्र.नं.: {toNepaliNum(secSignatory.citizenshipNo || '-')}</p>
                      <p className="text-slate-600">सम्पर्क नं.: {toNepaliNum(secSignatory.phone || '-')}</p>
                      <div className="pt-6 border-b border-dashed border-slate-400"></div>
                      <p className="text-slate-500 text-[10px] text-center">दस्तखत / नमुना हस्ताक्षर</p>
                    </div>

                    <div className="p-3 border border-slate-200 bg-white rounded shadow-xs space-y-1">
                      <div className="font-bold text-slate-900 text-sm border-b pb-1 text-teal-900">कोषाध्यक्ष:</div>
                      <p className="font-semibold text-slate-800">{treasSignatory.name || '.........................'}</p>
                      <p className="text-slate-600">ना.प्र.नं.: {toNepaliNum(treasSignatory.citizenshipNo || '-')}</p>
                      <p className="text-slate-600">सम्पर्क नं.: {toNepaliNum(treasSignatory.phone || '-')}</p>
                      <div className="pt-6 border-b border-dashed border-slate-400"></div>
                      <p className="text-slate-500 text-[10px] text-center">दस्तखत / नमुना हस्ताक्षर</p>
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 p-2.5 rounded text-[11px] text-amber-900 leading-relaxed font-sans">
                    <strong>खाता सञ्चालन सम्बन्धी विशेष निर्देशन तथा नियम:</strong><br />
                    १. खाताको नाम <strong>"{project.committeeName || `${project.name} उपभोक्ता समिति`}"</strong> रहनेछ।<br />
                    २. उपभोक्ता समिति सञ्चालन कार्यविधि बमोजिम <strong>अध्यक्ष र कोषाध्यक्षको संयुक्त दस्तखतबाट</strong> खाता सञ्चालन हुनेछ। विशेष परिस्थितिमा कार्यसमितिको सर्वसम्मत निर्णय बमोजिम तोकिएका दुई पदाधिकारीको संयुक्त दस्तखतबाट मात्र चेक जारी हुनेछ।<br />
                    ३. यस खातामा गाउँ कार्यपालिकाबाट निकासा हुने रकम बाहेक अन्य व्यक्तिगत रकम जम्मा गर्न र व्यक्तिगत प्रयोजनमा प्रयोग गर्न पूर्ण निषेध गरिएको छ।
                  </div>
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
                      {committeeMembersList.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-4 text-center text-slate-500">
                            उपभोक्ता समितिका पदाधिकारी/सदस्य विवरण "३. उपभोक्ता समिति" ट्याबबाट प्रविष्ट गर्नुहोस्।
                          </td>
                        </tr>
                      ) : (
                        committeeMembersList.map((m: any, idx: number) => (
                          <tr key={idx}>
                            <td className="p-2 border-r text-center">{toNepaliNum(idx + 1)}</td>
                            <td className="p-2 border-r font-bold">{m.role || 'सदस्य'}</td>
                            <td className="p-2 border-r">{m.name || '-'}</td>
                            <td className="p-2 border-r">
                              {m.gender || '-'} {m.category ? `(${m.category})` : ''}
                            </td>
                            <td className="p-2">{toNepaliNum(m.phone || '-')}</td>
                          </tr>
                        ))
                      )}
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
                  प्रस्तुत विषयमा त्यस समितिबाट मिति <strong>{toNepaliNum(project.completionDateBs || 'मिति उपलब्ध छैन')}</strong> सम्म सम्पन्न गर्ने गरी सम्झौता भएको <strong>“{project.name}”</strong> आयोजना प्रतिकूल मौसम / प्राविधिक कारणवश समयमै सम्पन्न हुन नसकी म्याद थपको लागि परेको निवेदन उपर गाउँ कार्यपालिकाको निर्णयानुसार मिति <strong>{toNepaliNum(extendedDateBs || '..........')}</strong> गते सम्मका लागि म्याद थप गरी अनुमोदन गरिएको व्यहोरा जानकारी गराइन्छ।
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
                  <p><strong>अन्तिम लेखापरीक्षण लागत:</strong> रु. {toNepaliNum(Number(project.farfarakDetails?.finalAuditedCost ?? totalCost).toLocaleString('en-IN', { minimumFractionDigits: 2 }))}</p>
                  <p><strong>मर्मत सम्भार कोष ({toNepaliNum(maintRate)}%) दाखिला:</strong> रु. {toNepaliNum(Number(project.farfarakDetails?.maintenanceFundRetained ?? Math.round(totalCost * maintRate / 100)).toLocaleString('en-IN'))}</p>
                  <p><strong>कन्टिन्जेन्सी कट्टी ({toNepaliNum(contRate)}%):</strong> रु. {toNepaliNum(Math.round(totalCost * contRate / 100).toLocaleString('en-IN'))}</p>
                  <p><strong>फरफारक स्थिति:</strong> {project.farfarakDetails?.isFarfarakDone ? 'पूर्ण रूपमा सम्पन्न तथा समुदायलाई हस्तान्तरण' : 'फरफारक प्रक्रियामा'}</p>
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
                    : engineerDisplay}
                </p>
              </div>

              <div>
                <p className="border-t border-slate-400 pt-1 font-bold text-slate-800">
                  वडा अध्यक्ष / अनुगमन संयोजक
                </p>
                <p className="text-slate-500 text-[11px]">
                  {wardChair?.name ? `${wardChair.name} — ` : ''}वडा नं. {toNepaliNum(project.wardNumber)} कार्यालय
                </p>
              </div>

              <div>
                <p className="border-t border-slate-400 pt-1 font-bold text-slate-800">
                  प्रमुख प्रशासकीय अधिकृत
                </p>
                <p className="text-slate-500 text-[11px]">
                  {chiefOfficerName}
                </p>
              </div>
            </div>

            {/* Verification QR Code & Digital Integrity Seal */}
            <div className="mt-6 pt-4 border-t-2 border-dashed border-slate-300 flex items-center justify-between text-xs font-sans bg-slate-50/80 p-3 rounded-lg print:border-slate-400">
              <div className="flex items-center gap-3">
                <div className="bg-white p-1 rounded border border-slate-300 shadow-sm">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=64x64&data=${encodeURIComponent(
                      `https://panchpokharimun.gov.np/verify?code=${verificationCode || project.projectCode}&type=chalani&fy=${project.fiscalYear || '2081/082'}&no=${chalaniNo || ''}`
                    )}`}
                    alt="Digital Verification QR"
                    className="w-14 h-14"
                  />
                </div>
                <div>
                  <div className="font-bold text-slate-800 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 inline" />
                    <span>डिजिटल प्रमाणीकरण तथा आधिकारिक ट्रेल (Digital Verification & Trail)</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    चलानी नं.: <strong>{chalaniNo ? toNepaliNum(chalaniNo) : '-'}</strong> | प्रमाणीकरण कोड: <code className="bg-slate-200 px-1 py-0.5 rounded text-[10px] font-mono">{verificationCode || `${project.projectCode}-${chalaniNo || '०'}`}</code>
                  </p>
                  <p className="text-[10px] text-slate-500">
                    गाउँपालिकाको केन्द्रीय डिजिटल दर्ता-चलानी प्रणालीबाट स्वतः प्रमाणीकृत। QR स्क्यान गरी आधिकारिकता जाँच्न सकिनेछ।
                  </p>
                </div>
              </div>
              <div className="text-right text-[10px] text-slate-400 font-medium">
                <p>पाँचपोखरी थाङपाल गाउँपालिका</p>
                <p>योजना तथा पूर्वाधार विकास शाखा</p>
              </div>
            </div>

            {/* Footer stamp & seal */}
            <div className="mt-3 text-center text-[10px] text-slate-400 font-sans border-t pt-2 flex justify-between">
              <span>पाँचपोखरी थाङपाल गाउँपालिका - डिजिटल ट्विन योजना व्यवस्थापन प्रणाली</span>
              <span>कम्प्युटर सिर्जित आधिकारिक पत्र</span>
            </div>
          </CentralDocumentSheet>
        </div>
      </div>
    </div>
  );
};
