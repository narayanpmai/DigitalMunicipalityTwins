import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  X,
  Clock,
  Printer,
  Calendar,
  Save,
  CheckCircle,
  AlertCircle,
  FileText,
  Building,
  User,
  Plus,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Hash,
} from 'lucide-react';
import type { Project, TimeExtensionRecord } from '../../../types/sectoral';
import { NepaliDatePicker } from '../../../components/common/NepaliDatePicker';
import { adToBs } from '../../../utils/nepaliCalendar';
import { useTenant } from '../../../context/TenantContext';
import { municipalityApi } from '../../../api/municipality';
import { representativesApi } from '../../../api/representatives';

export interface ProjectTimeExtensionModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  onSaveTimeExtension: (record: Partial<TimeExtensionRecord>) => Promise<void>;
}

const toNepaliNum = (num: number | string): string => {
  const nepaliDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  return String(num).replace(/\d/g, (d) => nepaliDigits[parseInt(d, 10)]);
};

const EXTENSION_REASONS = [
  'अविरल वर्षा, बाढी तथा पहिरोका कारण निर्माण अवरुद्ध भएकोले',
  'उच्च हिमाली भेगमा अत्यधिक हिमपात तथा चिसोका कारण काम हुन नसकेकोले',
  'सडक अवरोध भई निर्माण सामग्री (सिमेन्ट/छड/ग्याबियन) ढुवानीमा समस्या भएकोले',
  'प्राविधिक डिजाइन तथा नापी किताब पुनरावलोकन/संशोधन गर्नुपरेकोले',
  'स्थानीय विवाद निरुपण तथा जग्गा सहमति जुटाउन समय लागेकोले',
  'चाडपर्व तथा स्थानीय स्तरमा दक्ष जनशक्ति (डकर्मी/सिकर्मी) अभाव भएकोले',
  'विपद् तथा अन्य विशेष काबु बाहिरको परिस्थिति सिर्जना भएकोले',
];

export const ProjectTimeExtensionModal: React.FC<ProjectTimeExtensionModalProps> = ({
  isOpen,
  onClose,
  project,
  onSaveTimeExtension,
}) => {
  let tenantSettings: any = null;
  try {
    const tenantCtx = useTenant();
    tenantSettings = tenantCtx?.settings;
  } catch {}

  const todayBs = adToBs(new Date().toISOString().split('T')[0]) || '२०८१-०४-०१';
  const [activeTab, setActiveTab] = useState<'history' | 'new_entry' | 'order_letter'>('history');

  // Form State
  const [applicationDateBs, setApplicationDateBs] = useState<string>(todayBs);
  const [applicantName, setApplicantName] = useState<string>('');
  const [reason, setReason] = useState<string>(EXTENSION_REASONS[0]);
  const [customReason, setCustomReason] = useState<string>('');
  const [extendedCompletionDateBs, setExtendedCompletionDateBs] = useState<string>('');
  const [extendedDays, setExtendedDays] = useState<number>(30);
  const [decisionLevel, setDecisionLevel] = useState<string>('palika_executive');
  const [decisionDateBs, setDecisionDateBs] = useState<string>(todayBs);
  const [decisionNumber, setDecisionNumber] = useState<string>('');
  const [chalaniNo, setChalaniNo] = useState<string>('');
  const [physicalProgress, setPhysicalProgress] = useState<number>(0);
  const [financialProgress, setFinancialProgress] = useState<number>(0);
  const [technicalRecommendation, setTechnicalRecommendation] = useState<string>(
    'स्थलगत प्राविधिक निरीक्षण अनुसार काम सन्तोषजनक रूपमा भइरहेको तर काबु बाहिरको परिस्थितिले समयमै नसकिएकोले म्याद थप उपयुक्त देखिएको सिफारिस गरिन्छ।',
  );
  const [engineerName, setEngineerName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRecordForPrint, setSelectedRecordForPrint] = useState<TimeExtensionRecord | null>(null);

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

  useEffect(() => {
    if (!isOpen || !project) return;
    const pastExtensions: TimeExtensionRecord[] = Array.isArray(project.timeExtensions)
      ? project.timeExtensions
      : [];

    if (pastExtensions.length > 0) {
      setActiveTab('history');
      setSelectedRecordForPrint(pastExtensions[pastExtensions.length - 1]);
    } else {
      setActiveTab('new_entry');
      setSelectedRecordForPrint(null);
    }

    setApplicantName(project.committeeChair ? `${project.committeeChair} (अध्यक्ष, ${project.committeeName || project.name})` : project.committeeName || project.name);
    setApplicationDateBs(todayBs);
    setDecisionDateBs(todayBs);
    setPhysicalProgress(Number(project.progressPercentage || project.physicalProgressPercent || 0));
    setFinancialProgress(Number(project.paidAmount || 0));
    setEngineerName(project.responsibleEngineer || 'प्राविधिक शाखा');
    setDecisionNumber(`बैठक नं. ${toNepaliNum(12)}, निर्णय नं. ${toNepaliNum(3)}`);
    setChalaniNo(`२०८१/८२-${toNepaliNum(Math.floor(Math.random() * 800 + 100))}`);
    setExtendedCompletionDateBs(project.completionDateBs || todayBs);
    setExtendedDays(45);
  }, [isOpen, project, todayBs]);

  if (!isOpen || !project) return null;

  const pastExtensions: TimeExtensionRecord[] = Array.isArray(project.timeExtensions)
    ? project.timeExtensions
    : [];

  const wardChair = representatives.find(
    (r) => Number(r.wardNo) === Number(project.wardNumber) && String(r.designation || '').includes('अध्यक्ष'),
  );

  const chiefOfficerName = palikaProfile?.leadership?.chiefOfficer?.name || 'प्रमुख प्रशासकीय अधिकृत';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!extendedCompletionDateBs) {
      alert('कृपया थप गरिएको नयाँ म्याद मिति छान्नुहोस्।');
      return;
    }

    setIsSubmitting(true);
    try {
      const effectiveReason = reason === '__custom__' ? customReason : reason;
      const newRecord: Partial<TimeExtensionRecord> = {
        extensionNo: pastExtensions.length + 1,
        applicationDateBs,
        applicantName,
        reason: effectiveReason,
        decisionLevel,
        decisionDateBs,
        decisionNumber,
        chalaniNo,
        previousCompletionDateBs: project.completionDateBs || todayBs,
        extendedCompletionDateBs,
        extendedDays: Number(extendedDays),
        physicalProgressAtRequest: Number(physicalProgress),
        financialProgressAtRequest: Number(financialProgress),
        technicalRecommendation,
        engineerName,
        status: 'approved',
        approvedBy: chiefOfficerName,
      };

      await onSaveTimeExtension(newRecord);
      setSelectedRecordForPrint(newRecord as TimeExtensionRecord);
      setActiveTab('order_letter');
    } catch (err: any) {
      alert(err?.message || 'म्याद थप सुरक्षित गर्न सकिएन।');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const activeExt = selectedRecordForPrint || (pastExtensions.length > 0 ? pastExtensions[pastExtensions.length - 1] : null);

  const pCost = Number(project.officeCost || project.budget || 0);
  const cCost = Number(project.committeeCost || 0);
  const totalCost = pCost + cCost;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(5px)',
        WebkitBackdropFilter: 'blur(5px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '1000px',
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
          overflow: 'hidden',
          border: '1px solid #cbd5e1',
          margin: 'auto',
        }}
      >
        {/* Header (Screen only) */}
        <div
          className="print:hidden"
          style={{
            background: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)',
            color: '#ffffff',
            padding: '1.1rem 1.5rem',
            borderBottom: '1px solid #1e40af',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: '#d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              }}
            >
              <Clock size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#fef08a' }}>
                योजना म्याद थप (Time Extension) व्यवस्थापन मोड्युल
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#bfdbfe', margin: '2px 0 0 0' }}>
                {project.name} | कोड: {project.projectCode} | साविक म्याद: {project.completionDateBs ? `वि.सं. ${toNepaliNum(project.completionDateBs)}` : 'उपलब्ध छैन'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: '8px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation (Screen only) */}
        <div
          className="print:hidden"
          style={{
            backgroundColor: '#f8fafc',
            padding: '0.65rem 1.5rem',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem',
          }}
        >
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setActiveTab('history')}
              style={{
                padding: '0.45rem 0.9rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                backgroundColor: activeTab === 'history' ? '#0f4c81' : '#ffffff',
                color: activeTab === 'history' ? '#ffffff' : '#334155',
                border: activeTab === 'history' ? '1px solid #0f4c81' : '1px solid #cbd5e1',
              }}
            >
              <Clock size={15} />
              १. विगतका म्याद थप विवरण ({toNepaliNum(pastExtensions.length)})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('new_entry')}
              style={{
                padding: '0.45rem 0.9rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                backgroundColor: activeTab === 'new_entry' ? '#0f4c81' : '#ffffff',
                color: activeTab === 'new_entry' ? '#ffffff' : '#334155',
                border: activeTab === 'new_entry' ? '1px solid #0f4c81' : '1px solid #cbd5e1',
              }}
            >
              <Plus size={15} />
              २. नयाँ म्याद थप दर्ता तथा अनुमोदन
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('order_letter')}
              style={{
                padding: '0.45rem 0.9rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                backgroundColor: activeTab === 'order_letter' ? '#0f4c81' : '#ffffff',
                color: activeTab === 'order_letter' ? '#ffffff' : '#334155',
                border: activeTab === 'order_letter' ? '1px solid #0f4c81' : '1px solid #cbd5e1',
              }}
            >
              <FileText size={15} />
              ३. म्याद थप आदेश पत्र प्रिन्ट
            </button>
          </div>

          {activeTab === 'order_letter' && (
            <button
              type="button"
              onClick={handlePrint}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: '8px',
                backgroundColor: '#0284c7',
                color: '#ffffff',
                border: 'none',
                fontSize: '0.8rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
              }}
            >
              <Printer size={16} />
              आदेश पत्र प्रिन्ट / PDF
            </button>
          )}
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', backgroundColor: '#f1f5f9' }}>
          {/* TAB 1: HISTORY */}
          {activeTab === 'history' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div
                style={{
                  backgroundColor: '#ffffff',
                  padding: '1.25rem',
                  borderRadius: '12px',
                  border: '1px solid #cbd5e1',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                    यस आयोजनाको म्याद थप अभिलेख (History)
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('new_entry')}
                    style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: '6px',
                      backgroundColor: '#0284c7',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                    }}
                  >
                    <Plus size={14} />
                    नयाँ म्याद थप गर्नुहोस्
                  </button>
                </div>

                {pastExtensions.length === 0 ? (
                  <div style={{ padding: '2.5rem', textAlign: 'center', color: '#64748b', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                    <Clock size={36} style={{ margin: '0 auto 0.5rem auto', opacity: 0.4 }} />
                    <p style={{ margin: 0, fontWeight: 600 }}>हालसम्म यस आयोजनाको म्याद थप गरिएको छैन।</p>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem' }}>साविक सम्पन्न मिति: <strong>वि.सं. {toNepaliNum(project.completionDateBs || 'तोकिएको छैन')}</strong></p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {pastExtensions.map((ext, idx) => (
                      <div
                        key={ext.id || idx}
                        style={{
                          border: '1px solid #cbd5e1',
                          borderRadius: '8px',
                          padding: '1rem',
                          backgroundColor: '#f8fafc',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.5rem',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ backgroundColor: '#fef3c7', color: '#92400e', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>
                              {toNepaliNum(ext.extensionNo || idx + 1)} औँ पटक म्याद थप
                            </span>
                            <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>
                              निर्णय मिति: वि.सं. {toNepaliNum(ext.decisionDateBs || '-')}
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ backgroundColor: '#dcfce7', color: '#166534', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem' }}>
                              अनुमोदित (Approved)
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedRecordForPrint(ext);
                                setActiveTab('order_letter');
                              }}
                              style={{
                                padding: '3px 8px',
                                borderRadius: '4px',
                                border: '1px solid #0284c7',
                                backgroundColor: '#e0f2fe',
                                color: '#0369a1',
                                fontSize: '0.72rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                              }}
                            >
                              <Printer size={12} />
                              आदेश पत्र
                            </button>
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem', fontSize: '0.8rem' }}>
                          <div>
                            <span style={{ color: '#64748b' }}>साविक सम्पन्न मिति:</span>
                            <div style={{ fontWeight: 600 }}>वि.सं. {toNepaliNum(ext.previousCompletionDateBs || '-')}</div>
                          </div>
                          <div>
                            <span style={{ color: '#64748b' }}>थप गरिएको नयाँ म्याद:</span>
                            <div style={{ fontWeight: 800, color: '#b91c1c' }}>
                              वि.सं. {toNepaliNum(ext.extendedCompletionDateBs || '-')} ({toNepaliNum(ext.extendedDays || 0)} दिन थप)
                            </div>
                          </div>
                          <div>
                            <span style={{ color: '#64748b' }}>निर्णय तह / निर्णय नं.:</span>
                            <div style={{ fontWeight: 600 }}>
                              {ext.decisionLevel === 'palika_executive' ? 'गाउँ कार्यपालिका' : ext.decisionLevel === 'ward' ? 'वडा समिति' : 'प्रमुख प्रशासकीय अधिकृत'} ({ext.decisionNumber || '-'})
                            </div>
                          </div>
                          <div>
                            <span style={{ color: '#64748b' }}>चलानी नं.:</span>
                            <div style={{ fontWeight: 600 }}>{toNepaliNum(ext.chalaniNo || '-')}</div>
                          </div>
                        </div>

                        <div style={{ fontSize: '0.78rem', color: '#334155', backgroundColor: '#ffffff', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                          <strong>म्याद थपको कारण:</strong> {ext.reason || 'कारण खुलाइएको छैन'}
                        </div>

                        {ext.technicalRecommendation && (
                          <div style={{ fontSize: '0.75rem', color: '#475569', fontStyle: 'italic' }}>
                            प्राविधिक राय: "{ext.technicalRecommendation}" ({ext.engineerName || 'प्राविधिक शाखा'})
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: NEW ENTRY FORM */}
          {activeTab === 'new_entry' && (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div
                style={{
                  backgroundColor: '#ffffff',
                  padding: '1.5rem',
                  borderRadius: '12px',
                  border: '1px solid #cbd5e1',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.25rem',
                }}
              >
                <div style={{ borderBottom: '1px solid #e2e8f0', pb: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                      नयाँ म्याद थप दर्ता तथा कार्यपालिका अनुमोदन फारम
                    </h3>
                    <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '2px 0 0 0' }}>
                      स्थानीय तह योजना तथा उपभोक्ता समिति कार्यविधि बमोजिम म्याद थपको औपचारिक प्रक्रिया
                    </p>
                  </div>
                  <span style={{ backgroundColor: '#fef3c7', color: '#92400e', fontWeight: 800, padding: '3px 10px', borderRadius: '6px', fontSize: '0.8rem' }}>
                    {toNepaliNum(pastExtensions.length + 1)} औँ पटक म्याद थप
                  </span>
                </div>

                {/* Grid Inputs */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                  {/* Previous Date */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.25rem' }}>
                      साविक सम्पन्न मिति (Current Deadline)
                    </label>
                    <input
                      type="text"
                      disabled
                      value={project.completionDateBs || 'तोकिएको छैन'}
                      style={{
                        width: '100%',
                        padding: '0.45rem 0.65rem',
                        backgroundColor: '#f1f5f9',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        color: '#64748b',
                      }}
                    />
                  </div>

                  {/* New Extended Date */}
                  <div>
                    <NepaliDatePicker
                      label="थप गरिएको नयाँ म्याद मिति (वि.सं.) *"
                      value={extendedCompletionDateBs}
                      onChange={(bs) => setExtendedCompletionDateBs(bs)}
                      required
                      placeholder="नयाँ म्याद मिति"
                      inputStyle={{ padding: '0.45rem 0.65rem', fontSize: '0.8rem', borderColor: '#0284c7', fontWeight: 700 }}
                    />
                  </div>

                  {/* Extended Days */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.25rem' }}>
                      थप भएको दिन संख्या (Days)
                    </label>
                    <input
                      type="number"
                      value={extendedDays}
                      onChange={(e) => setExtendedDays(Number(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '0.45rem 0.65rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                      }}
                    />
                  </div>

                  {/* Application Date */}
                  <div>
                    <NepaliDatePicker
                      label="समितिले निवेदन दिएको मिति (वि.सं.) *"
                      value={applicationDateBs}
                      onChange={(bs) => setApplicationDateBs(bs)}
                      required
                      inputStyle={{ padding: '0.45rem 0.65rem', fontSize: '0.8rem' }}
                    />
                  </div>

                  {/* Decision Date */}
                  <div>
                    <NepaliDatePicker
                      label="कार्यपालिका / वडा निर्णय मिति (वि.सं.) *"
                      value={decisionDateBs}
                      onChange={(bs) => setDecisionDateBs(bs)}
                      required
                      inputStyle={{ padding: '0.45rem 0.65rem', fontSize: '0.8rem' }}
                    />
                  </div>

                  {/* Decision Level */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.25rem' }}>
                      निर्णय गर्ने तह (Decision Authority)
                    </label>
                    <select
                      value={decisionLevel}
                      onChange={(e) => setDecisionLevel(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.45rem 0.65rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        backgroundColor: '#ffffff',
                      }}
                    >
                      <option value="palika_executive">गाउँ कार्यपालिका बैठक निर्णय</option>
                      <option value="ward">वडा समिति निर्णय</option>
                      <option value="cao">प्रमुख प्रशासकीय अधिकृतस्तर निर्णय</option>
                    </select>
                  </div>

                  {/* Decision Number */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.25rem' }}>
                      निर्णय नं. / बैठक नं.
                    </label>
                    <input
                      type="text"
                      value={decisionNumber}
                      onChange={(e) => setDecisionNumber(e.target.value)}
                      placeholder="उदा: बैठक नं. १४, निर्णय नं. २"
                      style={{
                        width: '100%',
                        padding: '0.45rem 0.65rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                      }}
                    />
                  </div>

                  {/* Chalani No */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.25rem' }}>
                      आदेश पत्र चलानी नं.
                    </label>
                    <input
                      type="text"
                      value={chalaniNo}
                      onChange={(e) => setChalaniNo(e.target.value)}
                      placeholder="उदा: २०८१/८२-१२४५"
                      style={{
                        width: '100%',
                        padding: '0.45rem 0.65rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontFamily: 'monospace',
                      }}
                    />
                  </div>

                  {/* Physical Progress */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.25rem' }}>
                      निवेदन दिँदाको भौतिक प्रगति (%)
                    </label>
                    <input
                      type="number"
                      value={physicalProgress}
                      onChange={(e) => setPhysicalProgress(Number(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '0.45rem 0.65rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        color: '#0369a1',
                      }}
                    />
                  </div>
                </div>

                {/* Reason Dropdown */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.25rem' }}>
                    म्याद थप गर्नुपर्नाको मुख्य कारण (Reason for Extension) *
                  </label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      backgroundColor: '#ffffff',
                      marginBottom: reason === '__custom__' ? '0.5rem' : '0',
                    }}
                  >
                    {EXTENSION_REASONS.map((r, i) => (
                      <option key={i} value={r}>
                        {r}
                      </option>
                    ))}
                    <option value="__custom__">अन्य कारण (तल खुलाउनुहोस्)</option>
                  </select>
                  {reason === '__custom__' && (
                    <input
                      type="text"
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                      placeholder="म्याद थपको वास्तविक कारण यहाँ लेख्नुहोस्..."
                      required
                      style={{
                        width: '100%',
                        padding: '0.45rem 0.65rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                      }}
                    />
                  )}
                </div>

                {/* Technical Recommendation */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.25rem' }}>
                    प्राविधिक शाखा / सब-इन्जिनियरको स्थलगत राय तथा सिफारिस
                  </label>
                  <textarea
                    rows={2}
                    value={technicalRecommendation}
                    onChange={(e) => setTechnicalRecommendation(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.45rem 0.65rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                    }}
                  />
                </div>

                {/* Buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => setActiveTab('history')}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#ffffff',
                      color: '#475569',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                    }}
                  >
                    रद्द गर्नुहोस्
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      padding: '0.5rem 1.25rem',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: '#0284c7',
                      color: '#ffffff',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                    }}
                  >
                    <Save size={16} />
                    {isSubmitting ? 'सुरक्षित गर्दै...' : 'म्याद थप अनुमोदन गरी सुरक्षित गर्नुहोस्'}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 3: PRINTABLE OFFICIAL TIME EXTENSION ORDER LETTER */}
          {activeTab === 'order_letter' && (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div
                style={{
                  backgroundColor: '#ffffff',
                  padding: '2.5rem',
                  maxWidth: '850px',
                  width: '100%',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  fontFamily: '"Mukta", "Kalimati", serif',
                  fontSize: '0.9rem',
                  lineHeight: 1.6,
                  color: '#0f172a',
                }}
              >
                {/* Official Letterhead */}
                <div style={{ textAlign: 'center', borderBottom: '2px solid #b91c1c', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ width: '65px' }}>
                      <img
                        src={tenantSettings?.emblem_url || "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Emblem_of_Nepal.svg/240px-Emblem_of_Nepal.svg.png"}
                        alt="नेपाल सरकार"
                        style={{ width: '60px', height: '60px', objectFit: 'contain' }}
                      />
                    </div>
                    <div style={{ flex: 1, padding: '0 0.5rem' }}>
                      <p style={{ color: '#b91c1c', fontWeight: 700, fontSize: '0.8rem', margin: 0 }}>
                        स्थानीय सरकार सञ्चालन ऐन, २०७४ बमोजिम
                      </p>
                      <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#991b1b', margin: '2px 0' }}>
                        {tenantSettings?.palika_name || 'पाँचपोखरी थाङपाल गाउँपालिका'}
                      </h1>
                      <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#334155', margin: 0 }}>
                        {tenantSettings?.office_title || 'गाउँ कार्यपालिकाको कार्यालय'}
                      </h2>
                      <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '2px 0 0 0' }}>
                        {tenantSettings?.headquarters || 'थाङपालधाप, सिन्धुपाल्चोक'}, {tenantSettings?.province || 'बागमती प्रदेश'}, नेपाल
                      </p>
                      <p style={{ fontSize: '0.78rem', color: '#0f766e', fontWeight: 700, margin: '2px 0 0 0' }}>
                        योजना, पूर्वाधार विकास तथा अनुगमन शाखा
                      </p>
                    </div>
                    <div style={{ width: '65px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <img
                        src={tenantSettings?.logo_url || '/panchpokhari-logo.png'}
                        alt="Palika Logo"
                        style={{ width: '60px', height: '60px', objectFit: 'contain', borderRadius: '50%' }}
                        onError={(e: any) => {
                          e.target.src = '/panchpokhari-logo.png';
                        }}
                      />
                    </div>
                  </div>

                  {/* Ref & Date Line */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginTop: '0.75rem', paddingTop: '0.4rem', borderTop: '1px solid #e2e8f0' }}>
                    <div>
                      <span>पत्र संख्या: {toNepaliNum(project.fiscalYear || '२०८१/०८२')}</span>
                      <span style={{ marginLeft: '1.5rem' }}>चलानी नं.: {toNepaliNum(activeExt?.chalaniNo || chalaniNo || '-')}</span>
                    </div>
                    <div>
                      <span>मिति: वि.सं. {toNepaliNum(activeExt?.decisionDateBs || decisionDateBs || todayBs)}</span>
                    </div>
                  </div>
                </div>

                {/* Recipient */}
                <div style={{ marginBottom: '1rem' }}>
                  <p style={{ fontWeight: 700, margin: 0 }}>श्री अध्यक्षज्यू,</p>
                  <p style={{ fontWeight: 800, color: '#0f766e', margin: 0 }}>
                    {project.committeeName || `${project.name} उपभोक्ता समिति`}
                  </p>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                    पाँचपोखरी थाङपाल गाउँपालिका, वडा नं. {toNepaliNum(project.wardNumber)}
                  </p>
                </div>

                {/* Subject */}
                <div style={{ textAlign: 'center', fontWeight: 800, fontSize: '1rem', textDecoration: 'underline', marginBottom: '1rem' }}>
                  विषय: योजना कार्य सम्पन्न गर्ने म्याद थप सम्बन्धमा।
                </div>

                {/* Letter Body */}
                <div style={{ textAlign: 'justify', textIndent: '2rem', marginBottom: '1rem' }}>
                  प्रस्तुत विषयमा यस पाँचपोखरी थाङपाल गाउँपालिकाको आर्थिक वर्ष <strong>{toNepaliNum(project.fiscalYear || '')}</strong> को स्वीकृत वार्षिक नीति तथा कार्यक्रम अनुसार वडा नं. <strong>{toNepaliNum(project.wardNumber)}</strong> अन्तर्गत सञ्चालन हुने <strong>“{project.name}”</strong> (आयोजना कोड: <strong>{project.projectCode}</strong>{project.budgetSubHead ? `, बजेट उप-शीर्षक नं.: ${toNepaliNum(project.budgetSubHead)}` : ''}) को मिति <strong>{toNepaliNum(activeExt?.previousCompletionDateBs || project.completionDateBs || '-')}</strong> सम्म सम्पूर्ण निर्माण कार्य सम्पन्न गर्ने गरी त्यस समितिसँग योजना सम्झौता भएकोमा, समितिबाट मिति <strong>{toNepaliNum(activeExt?.applicationDateBs || applicationDateBs)}</strong> मा <em>"{activeExt?.reason || reason}"</em> कारणवश समयमै कार्य सम्पन्न गर्न नसकिएकोले म्याद थपका लागि पेश भएको निवेदन तथा प्राविधिक शाखाको स्थलगत राय बमोजिम;
                </div>

                <div style={{ textAlign: 'justify', textIndent: '2rem', marginBottom: '1rem' }}>
                  गाउँ कार्यपालिकाको मिति <strong>{toNepaliNum(activeExt?.decisionDateBs || decisionDateBs)}</strong> को निर्णयानुसार (<strong>{activeExt?.decisionNumber || decisionNumber || 'निर्णयानुसार'}</strong>) साविक सम्झौताका सम्पूर्ण सर्तहरू यथावत रहने गरी मिति <strong>{toNepaliNum(activeExt?.extendedCompletionDateBs || extendedCompletionDateBs)}</strong> सम्मका लागि <strong>{toNepaliNum(activeExt?.extendedDays || extendedDays)} दिन</strong> म्याद थप गरी यो <strong>म्याद थप आदेश पत्र</strong> प्रदान गरिएको छ।
                </div>

                {/* Summary Box */}
                <div
                  style={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    padding: '0.75rem 1rem',
                    fontSize: '0.82rem',
                    marginBottom: '1rem',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.5rem',
                  }}
                >
                  <div><strong>आयोजनाको नाम:</strong> {project.name}</div>
                  <div><strong>कुल सम्झौता लागत:</strong> रु. {toNepaliNum(totalCost.toLocaleString('en-IN', { minimumFractionDigits: 2 }))}</div>
                  <div><strong>साविक सम्पन्न म्याद:</strong> वि.सं. {toNepaliNum(activeExt?.previousCompletionDateBs || project.completionDateBs || '-')}</div>
                  <div><strong>थप गरिएको नयाँ म्याद:</strong> <span style={{ color: '#b91c1c', fontWeight: 800 }}>वि.सं. {toNepaliNum(activeExt?.extendedCompletionDateBs || extendedCompletionDateBs)}</span></div>
                  <div><strong>म्याद थप पटक:</strong> {toNepaliNum(activeExt?.extensionNo || pastExtensions.length || 1)} औँ पटक</div>
                  <div><strong>हालको भौतिक प्रगति:</strong> {toNepaliNum(activeExt?.physicalProgressAtRequest || physicalProgress)}%</div>
                </div>

                {/* Mandatory Instructions */}
                <div style={{ marginBottom: '1.5rem', fontSize: '0.82rem' }}>
                  <div style={{ fontWeight: 800, marginBottom: '0.3rem' }}>पालना गर्नुपर्ने प्रमुख सर्त तथा निर्देशनहरू:</div>
                  <ol style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: 1.5 }}>
                    <li>थप गरिएको म्यादभित्र स्वीकृत लागत अनुमान, नक्सा र प्राविधिक स्पेसिफिकेसन अनुसार नै सम्पूर्ण कार्य १००% सम्पन्न गर्नुपर्नेछ।</li>
                    <li>तोकिएको म्याद मिति <strong>वि.सं. {toNepaliNum(activeExt?.extendedCompletionDateBs || extendedCompletionDateBs)}</strong> भित्र प्राविधिक शाखाबाट नापी किताब (MB) अनिवार्य प्रमाणित गराउनुपर्नेछ।</li>
                    <li>कार्य सम्पन्न भएपछि स्थानीय उपभोक्ताहरूको उपस्थितिमा <strong>सार्वजनिक परीक्षण (Social Audit)</strong> सम्पन्न गरी सोको माइन्युट र फरफारक सिफारिस पेश गर्नुपर्नेछ।</li>
                    <li>उक्त अवधिभित्र कार्य सम्पन्न नगरेमा नियमानुसार धरौटी जफत तथा कानुनी कारबाही अगाडि बढाइनेछ।</li>
                  </ol>
                </div>

                {/* Signatures */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', textAlign: 'center', marginTop: '3.5rem', paddingTop: '1rem', borderTop: '1px solid #cbd5e1', fontSize: '0.8rem' }}>
                  <div>
                    <div style={{ borderTop: '1px dashed #64748b', paddingTop: '0.35rem', fontWeight: 700 }}>
                      योजना / प्राविधिक शाखा
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      {activeExt?.engineerName || engineerName || 'सब-इन्जिनियर / इन्जिनियर'}
                    </div>
                  </div>

                  <div>
                    <div style={{ borderTop: '1px dashed #64748b', paddingTop: '0.35rem', fontWeight: 700 }}>
                      वडा अध्यक्ष / संयोजक
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      {wardChair?.name ? `${wardChair.name} — ` : ''}वडा नं. {toNepaliNum(project.wardNumber)} कार्यालय
                    </div>
                  </div>

                  <div>
                    <div style={{ borderTop: '1px dashed #64748b', paddingTop: '0.35rem', fontWeight: 700 }}>
                      प्रमुख प्रशासकीय अधिकृत
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      {chiefOfficerName}
                    </div>
                  </div>
                </div>

                {/* Footer Stamp */}
                <div style={{ marginTop: '2rem', paddingTop: '0.5rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#94a3b8' }}>
                  <span>पाँचपोखरी थाङपाल गाउँपालिका - डिजिटल ट्विन योजना व्यवस्थापन प्रणाली</span>
                  <span>प्रमाणीकरण कोड: {project.projectCode} | आधिकारिक कम्प्युटर सिर्जित पत्र</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
