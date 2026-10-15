import React, { useState } from 'react';
import {
  FileText,
  Copy,
  Download,
  Volume2,
  Check,
  X,
  Search,
  Sparkles,
  FileDown,
  Layers,
  ExternalLink,
} from 'lucide-react';
import { OcrResult } from '../../types';
import { exportTextAsDocument } from '../../utils/scannerUtils';

interface OcrResultModalProps {
  isOpen: boolean;
  docTitle: string;
  initialText: string;
  entities?: OcrResult['entities'];
  confidence?: number;
  onClose: () => void;
  onSaveEditedText: (updatedText: string) => void;
}

export const OcrResultModal: React.FC<OcrResultModalProps> = ({
  isOpen,
  docTitle,
  initialText,
  entities,
  confidence = 90,
  onClose,
  onSaveEditedText,
}) => {
  const [text, setText] = useState<string>(initialText);
  const [copied, setCopied] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text.slice(0, 400));
      utterance.lang = 'ne-NP';
      utterance.rate = 0.9;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSave = () => {
    onSaveEditedText(text);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(5px)',
        zIndex: 2200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          maxWidth: '520px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1rem 1.25rem',
            backgroundColor: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                backgroundColor: '#e0f2fe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={18} color="#0284c7" />
            </div>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#0f172a' }}>
                AI नेपाली तथा अंग्रेजी OCR
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                परिशुद्धता दर: <strong>{confidence}%</strong> • सम्पादन तथा कपी गर्न मिल्ने
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: '#f1f5f9',
              border: 'none',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#475569',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1rem 1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
          }}
        >
          {/* Detected Municipal Entities Pills */}
          {entities && Object.keys(entities).length > 0 && (
            <div
              style={{
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '10px',
                padding: '0.75rem',
              }}
            >
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#166534', marginBottom: '6px' }}>
                ✨ पहिचान गरिएका सरकारी विवरण (Auto-Extracted Entities):
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {entities.citizenshipNo && (
                  <span
                    style={{
                      fontSize: '0.72rem',
                      backgroundColor: '#ffffff',
                      border: '1px solid #86efac',
                      borderRadius: '6px',
                      padding: '3px 8px',
                      color: '#15803d',
                      fontWeight: 700,
                    }}
                  >
                    🪪 नागरिकता: {entities.citizenshipNo}
                  </span>
                )}
                {entities.kittaNo && (
                  <span
                    style={{
                      fontSize: '0.72rem',
                      backgroundColor: '#ffffff',
                      border: '1px solid #86efac',
                      borderRadius: '6px',
                      padding: '3px 8px',
                      color: '#15803d',
                      fontWeight: 700,
                    }}
                  >
                    📜 कित्ता नं: {entities.kittaNo}
                  </span>
                )}
                {entities.wardNo && (
                  <span
                    style={{
                      fontSize: '0.72rem',
                      backgroundColor: '#ffffff',
                      border: '1px solid #86efac',
                      borderRadius: '6px',
                      padding: '3px 8px',
                      color: '#15803d',
                      fontWeight: 700,
                    }}
                  >
                    🏛️ वडा नं: {entities.wardNo}
                  </span>
                )}
                {entities.dartaNo && (
                  <span
                    style={{
                      fontSize: '0.72rem',
                      backgroundColor: '#ffffff',
                      border: '1px solid #86efac',
                      borderRadius: '6px',
                      padding: '3px 8px',
                      color: '#15803d',
                      fontWeight: 700,
                    }}
                  >
                    📑 दर्ता नं: {entities.dartaNo}
                  </span>
                )}
                {entities.chalaniNo && (
                  <span
                    style={{
                      fontSize: '0.72rem',
                      backgroundColor: '#ffffff',
                      border: '1px solid #86efac',
                      borderRadius: '6px',
                      padding: '3px 8px',
                      color: '#15803d',
                      fontWeight: 700,
                    }}
                  >
                    📤 चलानी नं: {entities.chalaniNo}
                  </span>
                )}
                {entities.amount && (
                  <span
                    style={{
                      fontSize: '0.72rem',
                      backgroundColor: '#ffffff',
                      border: '1px solid #86efac',
                      borderRadius: '6px',
                      padding: '3px 8px',
                      color: '#15803d',
                      fontWeight: 700,
                    }}
                  >
                    💰 {entities.amount}
                  </span>
                )}
                {entities.date && (
                  <span
                    style={{
                      fontSize: '0.72rem',
                      backgroundColor: '#ffffff',
                      border: '1px solid #86efac',
                      borderRadius: '6px',
                      padding: '3px 8px',
                      color: '#15803d',
                      fontWeight: 700,
                    }}
                  >
                    📅 मिति: {entities.date}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Quick In-text Search Bar */}
          <div style={{ position: 'relative' }}>
            <Search
              size={15}
              style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }}
            />
            <input
              type="text"
              placeholder="निकालेको अक्षरभित्र शब्द खोज्नुहोस्..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                height: '36px',
                paddingLeft: '32px',
                paddingRight: '10px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.78rem',
              }}
            />
          </div>

          {/* Extracted Text Editor */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#334155' }}>
                पहिचान भएको पाठ (आवश्यकता अनुसार सम्पादन गर्न सक्नुहुन्छ):
              </label>
              <button
                type="button"
                onClick={handleSpeak}
                style={{
                  background: 'none',
                  border: 'none',
                  color: isSpeaking ? '#dc2626' : '#0284c7',
                  fontSize: '0.72rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                  fontWeight: 700,
                }}
              >
                <Volume2 size={14} />
                <span>{isSpeaking ? 'सुन्न बन्द गर्नुहोस्' : 'आवाजमा सुन्नुहोस्'}</span>
              </button>
            </div>

            <textarea
              rows={9}
              value={text}
              onChange={(e) => setText(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.85rem',
                fontFamily: `'Noto Sans Devanagari', monospace`,
                lineHeight: 1.5,
                color: '#0f172a',
                resize: 'vertical',
                backgroundColor: '#fafafa',
              }}
            />
          </div>

          {/* Export & Download Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={handleCopy}
              style={{
                backgroundColor: copied ? '#16a34a' : '#f1f5f9',
                color: copied ? '#ffffff' : '#334155',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '8px 4px',
                fontSize: '0.75rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? 'कपी भयो!' : 'टेक्स्ट कपी'}</span>
            </button>

            <button
              type="button"
              onClick={() => exportTextAsDocument(text, `${docTitle}_OCR`, 'doc')}
              style={{
                backgroundColor: '#f1f5f9',
                color: '#0369a1',
                border: '1px solid #bae6fd',
                borderRadius: '8px',
                padding: '8px 4px',
                fontSize: '0.75rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                cursor: 'pointer',
              }}
            >
              <FileDown size={14} />
              <span>Word (.doc)</span>
            </button>

            <button
              type="button"
              onClick={() => exportTextAsDocument(text, `${docTitle}_OCR`, 'txt')}
              style={{
                backgroundColor: '#f1f5f9',
                color: '#475569',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '8px 4px',
                fontSize: '0.75rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                cursor: 'pointer',
              }}
            >
              <Download size={14} />
              <span>Text (.txt)</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '0.85rem 1.25rem',
            backgroundColor: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.5rem',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 14px',
              backgroundColor: '#e2e8f0',
              color: '#334155',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            बन्द गर्नुहोस्
          </button>
          <button
            type="button"
            onClick={handleSave}
            style={{
              padding: '8px 18px',
              backgroundColor: '#0284c7',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            कागजातमा सुरक्षित गर्नुहोस्
          </button>
        </div>
      </div>
    </div>
  );
};
