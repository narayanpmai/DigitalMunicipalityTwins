import React, { useState } from 'react';
import {
  FileText,
  Download,
  Share2,
  Printer,
  Sparkles,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Plus,
  Lock,
  Tag,
  Calendar,
  Layers,
  FileCheck,
  Eye,
} from 'lucide-react';
import { ScannedDocument, ScannedPage } from '../../types';
import { generateMultiPagePdf, downloadBlob } from '../../utils/scannerUtils';

interface DocDetailModalProps {
  isOpen: boolean;
  document: ScannedDocument | null;
  onClose: () => void;
  onOpenOcr: (doc: ScannedDocument) => void;
  onAddPageToDoc: (docId: string) => void;
  onUpdateDoc: (updatedDoc: ScannedDocument) => void;
  onDeleteDoc: (docId: string) => void;
}

export const DocDetailModal: React.FC<DocDetailModalProps> = ({
  isOpen,
  document: doc,
  onClose,
  onOpenOcr,
  onAddPageToDoc,
  onUpdateDoc,
  onDeleteDoc,
}) => {
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [pdfCompression, setPdfCompression] = useState<'high' | 'medium' | 'low'>('medium');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [showShareNotice, setShowShareNotice] = useState<string | null>(null);

  if (!isOpen || !doc) return null;

  const currentPage = doc.pages[currentPageIndex] || doc.pages[0];

  // PDF Export
  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      const pdf = await generateMultiPagePdf(doc.pages, doc.title, pdfCompression);
      pdf.save(`${doc.title.replace(/[\/\s:]+/g, '_')}.pdf`);
    } catch (err) {
      console.error('PDF generation error:', err);
      alert('PDF तयार गर्दा त्रुटि भयो।');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Download Current Page Image
  const handleDownloadCurrentPageImage = () => {
    const a = document.createElement('a');
    a.href = currentPage.processedImageUrl || currentPage.originalImageUrl;
    a.download = `${doc.title}_Page_${currentPageIndex + 1}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Reorder Pages
  const movePage = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= doc.pages.length) return;

    const newPages = [...doc.pages];
    const [moved] = newPages.splice(index, 1);
    newPages.splice(targetIndex, 0, moved);

    // update page numbers
    newPages.forEach((p, idx) => (p.pageNumber = idx + 1));
    onUpdateDoc({ ...doc, pages: newPages });
    setCurrentPageIndex(targetIndex);
  };

  // Delete Current Page
  const handleDeletePage = (index: number) => {
    if (doc.pages.length <= 1) {
      if (confirm('यो कागजातको एक मात्र पृष्ठ हो। यसलाई मेटाउँदा पूरा कागजात मेटिनेछ। अघि बढ्ने?')) {
        onDeleteDoc(doc.id);
        onClose();
      }
      return;
    }

    if (confirm(`के तपाईं पृष्ठ ${index + 1} मेटाउन निश्चित हुनुहुन्छ?`)) {
      const newPages = doc.pages.filter((_, i) => i !== index);
      newPages.forEach((p, idx) => (p.pageNumber = idx + 1));
      onUpdateDoc({ ...doc, pages: newPages });
      setCurrentPageIndex(Math.max(0, index - 1));
    }
  };

  // Share
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: doc.title,
          text: `${doc.title} - पाँचपोखरी थाङपाल डिजिटल पालिका कागजात स्क्यानरबाट।`,
        });
      } catch (err) {
        console.log('Share canceled or unsupported', err);
      }
    } else {
      setShowShareNotice('लिङ्क तथा कागजात विवरण कपी भयो!');
      setTimeout(() => setShowShareNotice(null), 2500);
    }
  };

  // Print
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const pagesHtml = doc.pages
      .map(
        (p, i) => `
        <div style="page-break-after: always; text-align: center; margin-bottom: 20px;">
          <img src="${p.processedImageUrl || p.originalImageUrl}" style="max-width: 95%; max-height: 90vh;" />
          <div style="font-size: 11px; color: #64748b; margin-top: 8px;">
            ${doc.title} | पृष्ठ ${i + 1}/${doc.pages.length}
          </div>
        </div>
      `
      )
      .join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>${doc.title}</title>
          <style>@page { size: A4; margin: 10mm; }</style>
        </head>
        <body onload="window.print(); window.close();">
          ${pagesHtml}
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(5px)',
        zIndex: 2150,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0.75rem',
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          maxWidth: '560px',
          width: '100%',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '0.85rem 1.25rem',
            backgroundColor: '#0f172a',
            color: '#fff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {doc.title}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>{doc.categoryLabel}</span>
              <span>•</span>
              <span>{doc.createdAt}</span>
              <span>•</span>
              <span>जम्मा {doc.pages.length} पृष्ठ</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#fff',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Action Toolbar */}
        <div
          style={{
            padding: '0.6rem 1rem',
            backgroundColor: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              onClick={() => onOpenOcr(doc)}
              style={{
                backgroundColor: '#e0f2fe',
                color: '#0284c7',
                border: '1px solid #bae6fd',
                borderRadius: '8px',
                padding: '6px 10px',
                fontSize: '0.75rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
              }}
            >
              <Sparkles size={14} />
              <span>OCR अक्षर निकाल्नुहोस्</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              style={{
                backgroundColor: '#ffffff',
                color: '#334155',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '6px 10px',
                fontSize: '0.75rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
              }}
            >
              <Share2 size={14} />
              <span>सेयर</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              style={{
                backgroundColor: '#ffffff',
                color: '#334155',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '6px 10px',
                fontSize: '0.75rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
              }}
            >
              <Printer size={14} />
              <span>प्रिन्ट</span>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              type="button"
              onClick={() => {
                if (confirm('के तपाईं यो कागजात मेटाउन निश्चित हुनुहुन्छ?')) {
                  onDeleteDoc(doc.id);
                  onClose();
                }
              }}
              style={{
                backgroundColor: '#fff1f2',
                color: '#e11d48',
                border: '1px solid #fecdd3',
                borderRadius: '8px',
                padding: '6px 8px',
                fontSize: '0.72rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
              }}
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {showShareNotice && (
          <div style={{ backgroundColor: '#f0fdf4', color: '#166534', padding: '6px 12px', fontSize: '0.75rem', textAlign: 'center' }}>
            {showShareNotice}
          </div>
        )}

        {/* Content Body: Large Current Page Preview */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '0.75rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            backgroundColor: '#0f172a',
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {currentPage && (
              <img
                src={currentPage.processedImageUrl || currentPage.originalImageUrl}
                alt={`Page ${currentPageIndex + 1}`}
                style={{
                  maxHeight: '44vh',
                  maxWidth: '90%',
                  borderRadius: '8px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                  objectFit: 'contain',
                }}
              />
            )}

            {/* Page Navigation Arrows */}
            {doc.pages.length > 1 && (
              <>
                <button
                  type="button"
                  disabled={currentPageIndex === 0}
                  onClick={() => setCurrentPageIndex((prev) => Math.max(0, prev - 1))}
                  style={{
                    position: 'absolute',
                    left: '4px',
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: currentPageIndex === 0 ? 'not-allowed' : 'pointer',
                    opacity: currentPageIndex === 0 ? 0.3 : 1,
                  }}
                >
                  <ChevronLeft size={18} />
                </button>

                <button
                  type="button"
                  disabled={currentPageIndex === doc.pages.length - 1}
                  onClick={() => setCurrentPageIndex((prev) => Math.min(doc.pages.length - 1, prev + 1))}
                  style={{
                    position: 'absolute',
                    right: '4px',
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: currentPageIndex === doc.pages.length - 1 ? 'not-allowed' : 'pointer',
                    opacity: currentPageIndex === doc.pages.length - 1 ? 0.3 : 1,
                  }}
                >
                  <ChevronRight size={18} />
                </button>
              </>
            )}
          </div>

          {/* Current Page Controls (Reorder / Delete Page) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              maxWidth: '380px',
              marginTop: '8px',
              padding: '4px 10px',
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: '#cbd5e1',
              fontSize: '0.75rem',
            }}
          >
            <span>
              पृष्ठ <strong>{currentPageIndex + 1}</strong> / {doc.pages.length}
            </span>

            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                type="button"
                title="यो पृष्ठ अघि सार्नुहोस्"
                disabled={currentPageIndex === 0}
                onClick={() => movePage(currentPageIndex, 'up')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: currentPageIndex === 0 ? '#64748b' : '#38bdf8',
                  cursor: currentPageIndex === 0 ? 'not-allowed' : 'pointer',
                  padding: '2px',
                }}
              >
                <ArrowUp size={16} />
              </button>

              <button
                type="button"
                title="यो पृष्ठ पछि सार्नुहोस्"
                disabled={currentPageIndex === doc.pages.length - 1}
                onClick={() => movePage(currentPageIndex, 'down')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: currentPageIndex === doc.pages.length - 1 ? '#64748b' : '#38bdf8',
                  cursor: currentPageIndex === doc.pages.length - 1 ? 'not-allowed' : 'pointer',
                  padding: '2px',
                }}
              >
                <ArrowDown size={16} />
              </button>

              <button
                type="button"
                title="यो पृष्ठ मेटाउनुहोस्"
                onClick={() => handleDeletePage(currentPageIndex)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#f87171',
                  cursor: 'pointer',
                  padding: '2px 0 2px 6px',
                }}
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>

          {/* Thumbnail Carousel Reel */}
          <div
            style={{
              display: 'flex',
              gap: '8px',
              overflowX: 'auto',
              width: '100%',
              padding: '10px 4px 4px 4px',
            }}
          >
            {doc.pages.map((p, idx) => (
              <div
                key={p.id}
                onClick={() => setCurrentPageIndex(idx)}
                style={{
                  position: 'relative',
                  cursor: 'pointer',
                  border: currentPageIndex === idx ? '2px solid #38bdf8' : '1px solid #334155',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  flexShrink: 0,
                  width: '54px',
                  height: '74px',
                }}
              >
                <img
                  src={p.processedImageUrl || p.originalImageUrl}
                  alt={`Thumbnail ${idx + 1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    color: '#fff',
                    fontSize: '0.62rem',
                    textAlign: 'center',
                    padding: '1px 0',
                  }}
                >
                  P.{idx + 1}
                </div>
              </div>
            ))}

            {/* Add Page Button */}
            <div
              onClick={() => onAddPageToDoc(doc.id)}
              style={{
                width: '54px',
                height: '74px',
                borderRadius: '6px',
                border: '2px dashed #475569',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#94a3b8',
                cursor: 'pointer',
                flexShrink: 0,
              }}
              title="नयाँ पृष्ठ थप्नुहोस्"
            >
              <Plus size={18} color="#38bdf8" />
              <span style={{ fontSize: '0.58rem', marginTop: '2px' }}>थप्नुहोस्</span>
            </div>
          </div>
        </div>

        {/* Metadata & PDF Download Section */}
        <div
          style={{
            padding: '0.85rem 1.25rem',
            backgroundColor: '#ffffff',
            borderTop: '1px solid #e2e8f0',
          }}
        >
          {/* Notes and tags if available */}
          {doc.notes && (
            <div style={{ fontSize: '0.72rem', color: '#475569', marginBottom: '8px', backgroundColor: '#f8fafc', padding: '6px 10px', borderRadius: '6px' }}>
              📝 <strong>टिप्पणी:</strong> {doc.notes}
            </div>
          )}

          {/* Compression & PDF Export Button */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>PDF गुणस्तर:</span>
              <select
                value={pdfCompression}
                onChange={(e) => setPdfCompression(e.target.value as any)}
                style={{
                  height: '36px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.75rem',
                  padding: '0 6px',
                  backgroundColor: '#f8fafc',
                }}
              >
                <option value="high">उच्च (High Quality)</option>
                <option value="medium">मानक (Standard - सरकारी पोर्टल)</option>
                <option value="low">हल्का (Small Size - &lt;५०० KB)</option>
              </select>
            </div>

          <div style={{ display: 'flex', gap: '8px', flex: 1 }}>
            <button
              type="button"
              onClick={handleDownloadCurrentPageImage}
              style={{
                flex: 1,
                backgroundColor: '#f1f5f9',
                color: '#0f172a',
                border: '1px solid #cbd5e1',
                height: '38px',
                borderRadius: '8px',
                fontWeight: 800,
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                cursor: 'pointer',
              }}
            >
              <Download size={16} />
              <span>JPG डाउनलोड</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              style={{
                flex: 1,
                backgroundColor: '#0284c7',
                color: '#ffffff',
                border: 'none',
                height: '38px',
                borderRadius: '8px',
                fontWeight: 800,
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                cursor: isGeneratingPdf ? 'wait' : 'pointer',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)',
              }}
            >
              <Download size={16} />
              <span>{isGeneratingPdf ? 'PDF तयार...' : 'PDF डाउनलोड'}</span>
            </button>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};
