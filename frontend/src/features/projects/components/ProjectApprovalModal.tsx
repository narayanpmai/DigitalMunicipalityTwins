import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  RotateCcw,
  Clock,
  AlertCircle,
  ArrowRight,
  UserCheck,
} from 'lucide-react';
import type { Project, ApprovalHistoryEntry } from '../../../types/sectoral';
import { useAuth } from '../../../context/AuthContext';

export interface ProjectApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  onSubmitApproval: (payload: {
    decision: 'approve' | 'return';
    targetStage?: string;
    remarks?: string;
  }) => Promise<void>;
}

export const APPROVAL_PIPELINE_STAGES: Array<{
  key: string;
  labelNp: string;
  roleLabel: string;
  allowedRoles: string[];
}> = [
  {
    key: 'draft',
    labelNp: '१. योजना दर्ता (Draft)',
    roleLabel: 'योजना शाखा / वडा',
    allowedRoles: ['super_admin', 'admin', 'cao', 'it_admin', 'planning_officer', 'engineer', 'accountant', 'ward_user', 'data_entry'],
  },
  {
    key: 'technical_verified',
    labelNp: '२. प्राविधिक प्रमाणिकरण',
    roleLabel: 'इन्जिनियर / प्राविधिक शाखा',
    allowedRoles: ['super_admin', 'admin', 'cao', 'engineer', 'planning_officer'],
  },
  {
    key: 'monitoring_recommended',
    labelNp: '३. अनुगमन समिति सिफारिस',
    roleLabel: 'अनुगमन / योजना शाखा',
    allowedRoles: ['super_admin', 'admin', 'cao', 'planning_officer'],
  },
  {
    key: 'accounts_verified',
    labelNp: '४. आर्थिक प्रशासन (लेखा) जाँच',
    roleLabel: 'लेखा अधिकृत / लेखा शाखा',
    allowedRoles: ['super_admin', 'admin', 'cao', 'accountant'],
  },
  {
    key: 'cao_approved',
    labelNp: '५. प्र.प्र.अ. अन्तिम स्वीकृति',
    roleLabel: 'प्रमुख प्रशासकीय अधिकृत (CAO)',
    allowedRoles: ['super_admin', 'admin', 'cao'],
  },
  {
    key: 'completed',
    labelNp: '६. योजना सम्पन्न तथा फरफारक',
    roleLabel: 'प्र.प्र.अ. / योजना शाखा',
    allowedRoles: ['super_admin', 'admin', 'cao', 'planning_officer'],
  },
];

const STAGE_LABEL_MAP: Record<string, string> = APPROVAL_PIPELINE_STAGES.reduce(
  (acc, s) => ({ ...acc, [s.key]: s.labelNp }),
  {} as Record<string, string>,
);

const RETURN_ROLES = ['super_admin', 'admin', 'cao', 'planning_officer', 'accountant', 'engineer'];

export const ProjectApprovalModal: React.FC<ProjectApprovalModalProps> = ({
  isOpen,
  onClose,
  project,
  onSubmitApproval,
}) => {
  const { user, hasRole } = useAuth();
  const [remarks, setRemarks] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setRemarks('');
      setErrorMsg(null);
    }
  }, [isOpen, project?.id]);

  if (!isOpen || !project) return null;

  const currentStage = project.approvalStage || 'draft';
  const currentIdx = Math.max(
    0,
    APPROVAL_PIPELINE_STAGES.findIndex((s) => s.key === currentStage),
  );
  const nextStageObj =
    currentIdx < APPROVAL_PIPELINE_STAGES.length - 1
      ? APPROVAL_PIPELINE_STAGES[currentIdx + 1]
      : null;

  const canAdvanceNext = nextStageObj ? hasRole(nextStageObj.allowedRoles) : false;
  const canReturn = currentIdx > 0 && hasRole(RETURN_ROLES);
  const historyList: ApprovalHistoryEntry[] = Array.isArray(project.approvalHistory)
    ? project.approvalHistory
    : [];

  const handleAction = async (decision: 'approve' | 'return') => {
    if (decision === 'return' && !remarks.trim()) {
      setErrorMsg('फिर्ता पठाउँदा कारण (कैफियत) लेख्न अनिवार्य छ।');
      return;
    }
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      await onSubmitApproval({
        decision,
        targetStage: decision === 'approve' ? nextStageObj?.key : 'draft',
        remarks: remarks.trim() || undefined,
      });
      setRemarks('');
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.detail || err?.message || 'स्वीकृति प्रक्रिया अद्यावधिक गर्न सकिएन।');
    } finally {
      setIsSubmitting(false);
    }
  };

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
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl my-6 flex flex-col max-h-[92vh] overflow-hidden border border-slate-200"
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '860px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          border: '1px solid #cbd5e1',
          margin: 'auto',
        }}
      >
        {/* Header */}
        <div
          className="bg-gradient-to-r from-indigo-900 to-blue-800 text-white px-6 py-4 flex items-center justify-between"
          style={{
            background: 'linear-gradient(135deg, #312e81 0%, #1e40af 100%)',
            color: '#ffffff',
            padding: '1.2rem 1.5rem',
            borderBottom: '1px solid #1e40af',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center border border-white/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                तहगत योजना स्वीकृति तथा अधिकार प्रणाली (Multi-Stage Approval & RBAC)
              </h2>
              <p className="text-xs text-indigo-100">
                {project.name} • कोड: {project.projectCode}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-indigo-200 hover:text-white rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* Active User Role Info */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5">
            <div className="flex items-center gap-2 text-xs text-slate-700">
              <UserCheck className="w-4 h-4 text-indigo-600" />
              <span>लग-इन प्रयोगकर्ता:</span>
              <strong className="text-slate-900">{user?.fullName || user?.email || 'अज्ञात'}</strong>
              <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-bold uppercase text-[11px]">
                Role: {user?.role || 'guest'}
              </span>
            </div>
            <div className="text-xs font-semibold text-slate-600">
              हालको चरण:{' '}
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold">
                {STAGE_LABEL_MAP[currentStage] || currentStage}
              </span>
            </div>
          </div>

          {/* Visual 6-Stage Stepper */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {APPROVAL_PIPELINE_STAGES.map((st, idx) => {
              const isDone = idx < currentIdx || (idx === APPROVAL_PIPELINE_STAGES.length - 1 && currentStage === 'completed');
              const isCurrent = idx === currentIdx && currentStage !== 'completed';
              return (
                <div
                  key={st.key}
                  className={`p-3 rounded-lg border transition ${
                    isDone
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      : isCurrent
                      ? 'bg-blue-50 border-blue-400 text-blue-950 ring-2 ring-blue-200'
                      : 'bg-slate-50 border-slate-200 text-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs">{st.labelNp}</span>
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : isCurrent ? (
                      <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                    ) : null}
                  </div>
                  <div className="text-[11px] opacity-80">जिम्मेवार: {st.roleLabel}</div>
                </div>
              );
            })}
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-center gap-2 font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action Panel */}
          {currentStage !== 'completed' ? (
            <div className="border border-indigo-200 bg-indigo-50/40 rounded-lg p-4 space-y-3">
              <div className="font-bold text-indigo-950 text-xs flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-indigo-600" />
                <span>अर्को चरण सिफारिस / स्वीकृति: {nextStageObj?.labelNp}</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  निर्णय कैफियत / टिप्पणी (Approve गर्दा ऐच्छिक, Return गर्दा अनिवार्य)
                </label>
                <textarea
                  rows={2}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="प्राविधिक जाँच, अनुगमन सुझाव वा लेखा परीक्षण सम्बन्धी कैफियत लेख्नुहोस्..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>

              {nextStageObj && !canAdvanceNext && (
                <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 font-medium">
                  अर्को चरण ({nextStageObj.labelNp}) स्वीकृत गर्न <strong>{nextStageObj.roleLabel}</strong> ({nextStageObj.allowedRoles.join(', ')}) अधिकार आवश्यक पर्दछ।
                </div>
              )}

              <div className="flex flex-wrap justify-between items-center gap-3 pt-1">
                {canReturn ? (
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleAction('return')}
                    className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-lg text-xs font-bold flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    मस्यौदा चरणमा फिर्ता पठाउनुहोस् (Return)
                  </button>
                ) : (
                  <span />
                )}

                {nextStageObj && (
                  <button
                    type="button"
                    disabled={isSubmitting || !canAdvanceNext}
                    onClick={() => handleAction('approve')}
                    className="px-5 py-2 bg-indigo-700 hover:bg-indigo-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {isSubmitting ? 'प्रक्रिया हुँदैछ...' : `स्वीकृत गरी "${nextStageObj.labelNp}" मा पठाउनुहोस्`}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 font-semibold text-xs flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>यो आयोजना सबै तहगत स्वीकृति पार गरी अन्तिम सम्पन्न चरणमा पुगिसकेको छ।</span>
            </div>
          )}

          {/* Chronological Approval History */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-800 text-xs">
              स्वीकृति तथा निर्णय इतिहास (Approval Audit Trail — {historyList.length})
            </h4>
            {historyList.length === 0 ? (
              <div className="p-4 text-center text-slate-400 border border-dashed rounded-lg text-xs">
                हालसम्म कुनै तहगत स्वीकृति इतिहास दर्ता भएको छैन।
              </div>
            ) : (
              <div className="border rounded-lg divide-y divide-slate-200 overflow-hidden">
                {historyList.map((h) => (
                  <div key={h.id} className="p-3 bg-white flex flex-wrap justify-between items-start gap-2 text-xs">
                    <div>
                      <div className="flex items-center gap-2 font-bold text-slate-800">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            h.decision === 'return'
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {h.decision === 'return' ? 'फिर्ता (Return)' : 'स्वीकृत (Approved)'}
                        </span>
                        <span>
                          {STAGE_LABEL_MAP[h.fromStage] || h.fromStage} → {STAGE_LABEL_MAP[h.toStage] || h.toStage}
                        </span>
                      </div>
                      {h.remarks && <p className="text-slate-600 mt-1">{h.remarks}</p>}
                    </div>
                    <div className="text-right text-[11px] text-slate-500">
                      <div className="font-semibold text-slate-700">
                        {h.actorName || h.actorEmail} ({h.actorRole})
                      </div>
                      <div>{h.createdAt ? new Date(h.createdAt).toLocaleString() : ''}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
