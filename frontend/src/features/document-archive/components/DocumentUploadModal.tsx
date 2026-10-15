import React, { useState } from 'react';
import { X, UploadCloud, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { documentsApi } from '../../../api/documents';

interface DocumentUploadModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({ onClose, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [fiscalYear, setFiscalYear] = useState('२०८१/०८२');
  const [category, setCategory] = useState('Gazette');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('कृपया दस्ताबेजको शीर्षक प्रविष्ट गर्नुहोस्।');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('fiscalYear', fiscalYear);
      formData.append('category', category);
      if (file) {
        formData.append('file', file);
      }

      await documentsApi.uploadDocument(formData);
      onSuccess();
    } catch (err: any) {
      console.error(err);
      setErrorMsg('दस्ताबेज अपलोड गर्न वा OCR निष्कर्षण गर्न समस्या भयो।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#1e293b',
          color: '#f8fafc',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '560px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid rgba(148, 163, 184, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.9))',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'rgba(56, 189, 248, 0.15)',
                color: '#38bdf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <UploadCloud size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#ffffff' }}>
                नयाँ डिजिटल दस्ताबेज अभिलेख तथा OCR
              </h3>
              <p style={{ margin: '0.15rem 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
                PDF स्क्यान फाइल अपलोड गरी नेपाली भाषामा स्वचालित डेटा निष्कर्षण गर्नुहोस्
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.3rem' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {errorMsg && (
            <div
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                color: '#fca5a5',
                padding: '0.75rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                border: '1px solid rgba(239, 68, 68, 0.3)',
              }}
            >
              <AlertCircle size={16} />
              {errorMsg}
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
              दस्ताबेज वा ऐनको शीर्षक (Document Title) *
            </label>
            <input
              type="text"
              required
              placeholder="उदा. पाँचपोखरी थाङपाल स्थानीय आर्थिक ऐन, २०८१"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem 0.85rem',
                borderRadius: '8px',
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(148, 163, 184, 0.25)',
                color: '#f8fafc',
                fontSize: '0.85rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                आर्थिक वर्ष (Fiscal Year)
              </label>
              <select
                value={fiscalYear}
                onChange={(e) => setFiscalYear(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.85rem',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(148, 163, 184, 0.25)',
                  color: '#f8fafc',
                  fontSize: '0.85rem',
                  outline: 'none',
                }}
              >
                <option value="२०८१/०८२">२०८१/०८२</option>
                <option value="२०८०/०८१">२०८०/०८१</option>
                <option value="२०७९/०८०">२०७९/०८०</option>
                <option value="२०७८/०७९">२०७८/०७९</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                विधा / वर्ग (Category)
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.85rem',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(148, 163, 184, 0.25)',
                  color: '#f8fafc',
                  fontSize: '0.85rem',
                  outline: 'none',
                }}
              >
                <option value="Gazette">राजपत्र (Gazette)</option>
                <option value="Act">स्थानीय ऐन (Act)</option>
                <option value="BudgetBook">बजेट तथा नीति पुस्तिका (BudgetBook)</option>
                <option value="CitizenCharter">नागरिक बडापत्र (CitizenCharter)</option>
                <option value="DRRM">विपद् प्रतिकार्य (DRRM)</option>
                <option value="Guideline">दिग्दर्शन तथा निर्देशिका (Guideline)</option>
                <option value="MeetingDecision">कार्यपालिका निर्णय (MeetingDecision)</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
              PDF स्क्यान फाइल छान्नुहोस् (Choose PDF File)
            </label>
            <div
              style={{
                border: '2px dashed rgba(148, 163, 184, 0.3)',
                borderRadius: '8px',
                padding: '1.25rem',
                textAlign: 'center',
                backgroundColor: 'rgba(15, 23, 42, 0.4)',
                cursor: 'pointer',
              }}
              onClick={() => document.getElementById('hiddenDocFileInput')?.click()}
            >
              <FileText size={28} style={{ color: '#38bdf8', margin: '0 auto 0.5rem' }} />
              <div style={{ fontSize: '0.85rem', color: '#f1f5f9' }}>
                {file ? file.name : 'क्लिक गरी PDF कागजात छान्नुहोस् वा तानेर छोड्नुहोस्'}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
                समर्थित ढाँचा: PDF, TIFF, PNG (अधिकतम २५ MB)
              </div>
              <input
                id="hiddenDocFileInput"
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                style={{ display: 'none' }}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setFile(e.target.files[0]);
                  }
                }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                backgroundColor: 'rgba(148, 163, 184, 0.15)',
                border: '1px solid rgba(148, 163, 184, 0.25)',
                color: '#cbd5e1',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.85rem',
              }}
            >
              रद्द गर्नुहोस्
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                backgroundColor: '#3b82f6',
                border: 'none',
                color: '#ffffff',
                padding: '0.5rem 1.25rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
              }}
            >
              {isSubmitting ? 'अपलोड तथा OCR हुँदैछ...' : 'अपलोड तथा OCR सुरु गर्नुहोस्'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
