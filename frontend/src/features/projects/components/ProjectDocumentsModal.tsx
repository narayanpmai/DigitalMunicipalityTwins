import React, { useState, useRef } from 'react';
import {
  X,
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  Trash2,
  ExternalLink,
  Loader2,
  FolderOpen,
} from 'lucide-react';
import type { Project, ProjectDocument } from '../../../types/sectoral';
import { adToBs, toNepaliDigits } from '../../../utils/nepaliCalendar';

interface ProjectDocumentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  onUploadFile: (file: File) => Promise<{ url: string; filename: string }>;
  onAddDocument: (doc: Partial<ProjectDocument>) => Promise<void>;
  onDeleteDocument: (docId: string) => Promise<void>;
}

export const MANDATORY_DOC_CATEGORIES: Array<{
  type: ProjectDocument['docType'];
  label: string;
  desc: string;
}> = [
  {
    type: 'assembly_minute',
    label: '१. आमभेला तथा उपभोक्ता समिति गठन माइन्युट',
    desc: 'वडा वा टोल भेलाको उपस्थिति र समिति गठन निर्णय',
  },
  {
    type: 'citizenship',
    label: '२. पदाधिकारीहरूको नागरिकता प्रमाणपत्र',
    desc: 'अध्यक्ष, सचिव र कोषाध्यक्षको नागरिकता प्रतिलिपि',
  },
  {
    type: 'estimate',
    label: '३. स्वीकृत प्राविधिक लगत इस्टिमेट (BOQ/नक्सा)',
    desc: 'इन्जिनियरबाट तयार तथा स्वीकृत लागत अनुमान',
  },
  {
    type: 'agreement_order',
    label: '४. बैंक खाता, सम्झौता र कार्यादेश पत्र',
    desc: 'हस्ताक्षरित सम्झौता, कार्यादेश तथा बैंक खाता प्रमाण',
  },
  {
    type: 'bill_voucher',
    label: '५. सामग्री बिल, डोरहाजिरी तथा खर्च भौचर',
    desc: 'खरिद बिल भर्पाई, कामदार हाजिरी र VAT/PAN रसिद',
  },
  {
    type: 'social_audit_minute',
    label: '६. सार्वजनिक परीक्षण माइन्युट र सूचना पाटी फोटो',
    desc: 'उपभोक्ता समक्ष आय-व्यय सार्वजनिक गरिएको माइन्युट',
  },
  {
    type: 'handover',
    label: '७. कार्यसम्पन्न तथा फरफारक सिफारिस कागजात',
    desc: 'वडा अनुगमन सिफारिस र अन्तिम हस्तान्तरण पत्र',
  },
];

export const ProjectDocumentsModal: React.FC<ProjectDocumentsModalProps> = ({
  isOpen,
  onClose,
  project,
  onUploadFile,
  onAddDocument,
  onDeleteDocument,
}) => {
  const todayBs = adToBs(new Date().toISOString().split('T')[0]) || '२०८१-०४-०१';
  const [selectedDocType, setSelectedDocType] = useState<string>('assembly_minute');
  const [docTitle, setDocTitle] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !project) return null;

  const docs: ProjectDocument[] = Array.isArray(project.documents)
    ? project.documents.map((d: any, idx: number) =>
        typeof d === 'string'
          ? { id: `str-${idx}`, docType: 'other', title: d, fileUrl: d }
          : d,
      )
    : [];

  const uploadedTypes = new Set(docs.map((d) => d.docType));
  const mandatoryUploadedCount = MANDATORY_DOC_CATEGORIES.filter((c) => uploadedTypes.has(c.type)).length;

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      setUploadError('फाइल आकार १५ MB भन्दा बढी हुन सक्दैन।');
      return;
    }

    setUploadError(null);
    setIsUploading(true);
    try {
      const uploaded = await onUploadFile(file);
      const cat = MANDATORY_DOC_CATEGORIES.find((c) => c.type === selectedDocType);
      await onAddDocument({
        docType: selectedDocType,
        title: docTitle.trim() || cat?.label || file.name,
        fileUrl: uploaded.url,
        fileName: file.name,
        uploadedDateBs: todayBs,
      });
      setDocTitle('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      setUploadError(err?.response?.data?.detail || err?.message || 'कागजात अपलोड गर्न सकिएन।');
    } finally {
      setIsUploading(false);
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
          className="bg-gradient-to-r from-sky-800 to-blue-950 text-white px-6 py-4 flex items-center justify-between border-b border-sky-700"
          style={{
            background: 'linear-gradient(135deg, #075985 0%, #172554 100%)',
            color: '#ffffff',
            padding: '1.2rem 1.5rem',
            borderBottom: '1px solid #0369a1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-sky-600/50 flex items-center justify-center border border-sky-400/30">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                योजना कागजात अभिलेख (Mandatory Documents Vault)
              </h2>
              <p className="text-xs text-sky-200">
                {project.name} | अनिवार्य कागजात पूरा: {toNepaliDigits(mandatoryUploadedCount)}/{toNepaliDigits(MANDATORY_DOC_CATEGORIES.length)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-sky-200 hover:text-white rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs bg-slate-50">
          {/* Mandatory Checklist Status Chips */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="font-bold text-slate-800 text-sm">
              पालिका योजना फाइल अनिवार्य कागजात चेकलिस्ट:
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {MANDATORY_DOC_CATEGORIES.map((cat) => {
                const isUploaded = uploadedTypes.has(cat.type);
                return (
                  <button
                    key={cat.type}
                    type="button"
                    onClick={() => setSelectedDocType(cat.type)}
                    className={`p-2.5 rounded-lg border text-left flex items-start gap-2 transition ${
                      selectedDocType === cat.type
                        ? 'border-sky-500 bg-sky-50 ring-1 ring-sky-400'
                        : isUploaded
                        ? 'border-emerald-200 bg-emerald-50/50'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    {isUploaded ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="font-bold text-slate-800">{cat.label}</div>
                      <div className="text-[11px] text-slate-500">{cat.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Upload Form */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-bold text-sky-900 text-sm border-b pb-2 flex items-center gap-2">
              <Upload className="w-4 h-4 text-sky-600" />
              नयाँ कागजात / स्क्यान फाइल अपलोड (PDF, JPG, PNG, Excel, Word — अधिकतम १५ MB)
            </h3>

            {uploadError && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">कागजातको प्रकार</label>
                <select
                  value={selectedDocType}
                  onChange={(e) => setSelectedDocType(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                >
                  {MANDATORY_DOC_CATEGORIES.map((c) => (
                    <option key={c.type} value={c.type}>{c.label}</option>
                  ))}
                  <option value="other">अन्य कागजात</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">कागजातको शीर्षक (ऐच्छिक)</label>
                <input
                  type="text"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="उदा: आमभेला निर्णय माइन्युट पेज १-३"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp,.xlsx,.xls,.csv,.doc,.docx"
                  onChange={handleFileSelected}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full px-4 py-2 bg-sky-700 hover:bg-sky-800 text-white rounded-lg font-semibold flex items-center justify-center gap-2 shadow disabled:opacity-60"
                >
                  {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {isUploading ? 'अपलोड हुँदैछ...' : 'फाइल छानी अपलोड गर्नुहोस्'}
                </button>
              </div>
            </div>
          </div>

          {/* Uploaded Documents Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-slate-100 border-b border-slate-200 font-bold text-slate-800 flex justify-between">
              <span>अपलोड भएका कागजातहरू ({toNepaliDigits(docs.length)})</span>
            </div>
            {docs.length === 0 ? (
              <div className="p-6 text-center text-slate-500">
                अहिलेसम्म कुनै कागजात अपलोड गरिएको छैन।
              </div>
            ) : (
              <div className="dt-responsive-table-wrapper">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b text-slate-600 font-bold">
                    <tr>
                      <th className="p-2.5 border-r">क्र.स.</th>
                      <th className="p-2.5 border-r">शीर्षक तथा प्रकार</th>
                      <th className="p-2.5 border-r">फाइल नाम</th>
                      <th className="p-2.5 border-r">मिति</th>
                      <th className="p-2.5 text-center">कार्य</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {docs.map((d, idx) => (
                      <tr key={d.id || idx} className="hover:bg-slate-50">
                        <td className="p-2.5 border-r">{toNepaliDigits(idx + 1)}</td>
                        <td className="p-2.5 border-r font-semibold text-slate-800">
                          <div>{d.title}</div>
                          <span className="text-[10px] text-sky-700">
                            {MANDATORY_DOC_CATEGORIES.find((c) => c.type === d.docType)?.label || 'अन्य'}
                          </span>
                        </td>
                        <td className="p-2.5 border-r font-mono text-slate-600">{d.fileName || d.fileUrl}</td>
                        <td className="p-2.5 border-r">{toNepaliDigits(d.uploadedDateBs || '-')}</td>
                        <td className="p-2.5 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <a
                              href={d.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2 py-1 bg-sky-50 text-sky-700 border border-sky-200 rounded hover:bg-sky-100 inline-flex items-center gap-1 font-semibold"
                            >
                              <ExternalLink className="w-3 h-3" /> हेर्नुहोस्
                            </a>
                            <button
                              type="button"
                              onClick={() => d.id && onDeleteDocument(d.id)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded border border-red-200"
                              title="हटाउनुहोस्"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-6 py-3 flex justify-end border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-semibold"
          >
            बन्द गर्नुहोस्
          </button>
        </div>
      </div>
    </div>
  );
};
