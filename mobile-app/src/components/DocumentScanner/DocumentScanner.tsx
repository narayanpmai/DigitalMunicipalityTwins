import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Camera,
  Upload,
  Search,
  FileText,
  Sparkles,
  Download,
  Share2,
  Folder,
  Layers,
  CheckCircle,
  Plus,
  ShieldCheck,
  Filter,
  Eye,
  Sliders,
  AlertCircle,
  Tag,
  Clock,
  ChevronRight,
} from 'lucide-react';
import {
  DocumentCategory,
  DocumentFilterType,
  ScannedDocument,
  ScannedPage,
  OcrResult,
} from '../../types';
import { INITIAL_MOCK_DOCUMENTS } from '../../data/mockScannerData';
import { CameraCaptureModal } from './CameraCaptureModal';
import { CropFilterModal } from './CropFilterModal';
import { DocDetailModal } from './DocDetailModal';
import { OcrResultModal } from './OcrResultModal';
import { performOcrOnImage } from '../../utils/ocrService';
import { generateMultiPagePdf } from '../../utils/scannerUtils';

interface DocumentScannerProps {
  onSelectForSifarish?: (doc: ScannedDocument) => void;
}

const STORAGE_KEY = 'palika_scanned_documents_v1';

export const DocumentScanner: React.FC<DocumentScannerProps> = ({ onSelectForSifarish }) => {
  // Saved Documents
  const [documents, setDocuments] = useState<ScannedDocument[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to parse saved documents from localStorage', e);
    }
    return INITIAL_MOCK_DOCUMENTS;
  });

  // Filter & Search
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Active Modals & Flow States
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [rawCapturedImage, setRawCapturedImage] = useState<string | null>(null);
  const [isCropFilterOpen, setIsCropFilterOpen] = useState(false);

  // In-progress multi-page document creation
  const [inProgressPages, setInProgressPages] = useState<ScannedPage[]>([]);
  const [targetDocIdForAddingPage, setTargetDocIdForAddingPage] = useState<string | null>(null);

  // Document metadata input modal (Title, Category, Notes)
  const [isMetaModalOpen, setIsMetaModalOpen] = useState(false);
  const [newDocMeta, setNewDocMeta] = useState<{
    title: string;
    category: DocumentCategory;
    categoryLabel: string;
    notes: string;
    tags: string;
  }>({
    title: '',
    category: 'citizenship',
    categoryLabel: 'नागरिकता तथा परिचयपत्र',
    notes: '',
    tags: 'नागरिकता, सिफारिस',
  });

  // Document Viewer & OCR Modal states
  const [viewingDoc, setViewingDoc] = useState<ScannedDocument | null>(null);
  const [ocrDoc, setOcrDoc] = useState<ScannedDocument | null>(null);
  const [ocrLoadingStatus, setOcrLoadingStatus] = useState<string | null>(null);
  const [ocrResultData, setOcrResultData] = useState<{
    text: string;
    entities?: OcrResult['entities'];
    confidence: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
    } catch (e) {
      console.warn('Failed to save documents to localStorage', e);
    }
  }, [documents]);

  // Categories config
  const categoriesList: { id: DocumentCategory; label: string; icon: string; count: number }[] = [
    { id: 'all', label: 'सबै कागजात', icon: '📁', count: documents.length },
    {
      id: 'citizenship',
      label: 'नागरिकता तथा परिचयपत्र',
      icon: '🪪',
      count: documents.filter((d) => d.category === 'citizenship').length,
    },
    {
      id: 'lalpurja',
      label: 'जग्गाधनी पुर्जा (लालपुर्जा)',
      icon: '📜',
      count: documents.filter((d) => d.category === 'lalpurja').length,
    },
    {
      id: 'sifarish',
      label: 'सिफारिस तथा नाता प्रमाणित',
      icon: '📝',
      count: documents.filter((d) => d.category === 'sifarish').length,
    },
    {
      id: 'tax_receipt',
      label: 'कर तथा मालपोत रसिद',
      icon: '💰',
      count: documents.filter((d) => d.category === 'tax_receipt').length,
    },
    {
      id: 'darta_chalani',
      label: 'दर्ता, चलानी र पत्र',
      icon: '📑',
      count: documents.filter((d) => d.category === 'darta_chalani').length,
    },
    {
      id: 'building_permit',
      label: 'नक्सा तथा भवन इजाजत',
      icon: '⚖️',
      count: documents.filter((d) => d.category === 'building_permit').length,
    },
  ];

  // Filtered documents
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchCat = selectedCategory === 'all' || doc.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchQ =
        !q ||
        doc.title.toLowerCase().includes(q) ||
        doc.categoryLabel.toLowerCase().includes(q) ||
        (doc.notes && doc.notes.toLowerCase().includes(q)) ||
        doc.tags.some((t) => t.toLowerCase().includes(q)) ||
        (doc.ocrExtractedText && doc.ocrExtractedText.toLowerCase().includes(q));

      return matchCat && matchQ;
    });
  }, [documents, selectedCategory, searchQuery]);

  // Capture Handlers
  const handleCapturePhoto = (imageDataUrl: string) => {
    setRawCapturedImage(imageDataUrl);
    setIsCameraOpen(false);
    setIsCropFilterOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        handleCapturePhoto(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Save Page from Crop & Filter Modal
  const handleSavePage = (
    processedImage: string,
    filter: DocumentFilterType,
    brightness: number,
    contrast: number,
    rotation: number,
    addAnother: boolean
  ) => {
    const newPage: ScannedPage = {
      id: `p-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      pageNumber: inProgressPages.length + 1,
      originalImageUrl: rawCapturedImage || processedImage,
      processedImageUrl: processedImage,
      rotation,
      filter,
      brightness,
      contrast,
    };

    setIsCropFilterOpen(false);
    setRawCapturedImage(null);

    // If adding to an existing document
    if (targetDocIdForAddingPage) {
      const updated = documents.map((doc) => {
        if (doc.id === targetDocIdForAddingPage) {
          const newPages = [...doc.pages, { ...newPage, pageNumber: doc.pages.length + 1 }];
          return {
            ...doc,
            pages: newPages,
            updatedAt: new Date().toLocaleDateString('ne-NP'),
          };
        }
        return doc;
      });
      setDocuments(updated);
      setTargetDocIdForAddingPage(null);
      if (viewingDoc && viewingDoc.id === targetDocIdForAddingPage) {
        setViewingDoc(updated.find((d) => d.id === viewingDoc.id) || null);
      }
      return;
    }

    const updatedPages = [...inProgressPages, newPage];
    setInProgressPages(updatedPages);

    if (addAnother) {
      // Open camera again for next page
      setIsCameraOpen(true);
    } else {
      // Done with all pages, open metadata naming modal
      setNewDocMeta({
        title: `स्क्यान कागजात - ${new Date().toLocaleDateString('ne-NP')}`,
        category: 'citizenship',
        categoryLabel: 'नागरिकता तथा परिचयपत्र',
        notes: '',
        tags: 'कागजात, स्क्यान',
      });
      setIsMetaModalOpen(true);
    }
  };

  // Complete Document Creation
  const handleSaveFinalDocument = () => {
    if (inProgressPages.length === 0) return;

    const newDoc: ScannedDocument = {
      id: `doc-${Date.now()}`,
      title: newDocMeta.title || `नयाँ स्क्यान कागजात (${inProgressPages.length} पृष्ठ)`,
      category: newDocMeta.category,
      categoryLabel: newDocMeta.categoryLabel,
      pages: inProgressPages,
      createdAt: '२०८१/०६/१५',
      updatedAt: '२०८१/०६/१५',
      tags: newDocMeta.tags.split(',').map((t) => t.trim()).filter(Boolean),
      notes: newDocMeta.notes,
      fileSizeKb: inProgressPages.length * 280,
    };

    setDocuments([newDoc, ...documents]);
    setInProgressPages([]);
    setIsMetaModalOpen(false);
    setViewingDoc(newDoc);
  };

  // Trigger OCR
  const handleTriggerOcr = async (doc: ScannedDocument) => {
    setOcrDoc(doc);
    setOcrLoadingStatus('OCR विश्लेषण सुरु गर्दै...');
    try {
      const firstPage = doc.pages[0];
      const imgUrl = firstPage?.processedImageUrl || firstPage?.originalImageUrl;
      if (!imgUrl) return;

      const result = await performOcrOnImage(imgUrl, 'nep+eng', (prog, status) => {
        setOcrLoadingStatus(`${status} (${prog}%)`);
      });

      setOcrResultData({
        text: doc.ocrExtractedText || result.rawText,
        entities: result.entities,
        confidence: result.confidence,
      });
    } catch (err) {
      console.error('OCR trigger error:', err);
    } finally {
      setOcrLoadingStatus(null);
    }
  };

  // Save OCR corrections
  const handleSaveOcrText = (updatedText: string) => {
    if (!ocrDoc) return;
    const updated = documents.map((d) => {
      if (d.id === ocrDoc.id) {
        return { ...d, ocrExtractedText: updatedText };
      }
      return d;
    });
    setDocuments(updated);
    if (viewingDoc?.id === ocrDoc.id) {
      setViewingDoc({ ...viewingDoc, ocrExtractedText: updatedText });
    }
  };

  // Delete Document
  const handleDeleteDocument = (docId: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
    if (viewingDoc?.id === docId) setViewingDoc(null);
  };

  return (
    <div style={{ paddingBottom: '5.5rem' }}>
      {/* ─── BANNER / HEADER ─── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0369a1 0%, #0284c7 50%, #0ea5e9 100%)',
          color: '#ffffff',
          padding: '1.25rem 1rem 1rem 1rem',
          borderRadius: '0 0 20px 20px',
          boxShadow: '0 10px 25px -5px rgba(2, 132, 199, 0.4)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
              <span
                style={{
                  fontSize: '0.68rem',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(4px)',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Sparkles size={11} />
                <span>AI-Powered DocuScan</span>
              </span>
            </div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 900, margin: 0 }}>स्मार्ट कागजात स्क्यानर</h1>
            <p style={{ fontSize: '0.72rem', opacity: 0.9, marginTop: '2px' }}>
              नागरिक कागजात, लालपुर्जा, सिफारिस र कर रसिद सुरक्षित डिजिटलाइजेसन
            </p>
          </div>

          <div
            style={{
              backgroundColor: 'rgba(255,255,255,0.18)',
              borderRadius: '10px',
              padding: '6px 10px',
              textAlign: 'center',
            }}
          >
            <ShieldCheck size={18} style={{ margin: '0 auto', display: 'block' }} />
            <div style={{ fontSize: '0.62rem', fontWeight: 800, marginTop: '2px' }}>१००% स्थानीय</div>
            <div style={{ fontSize: '0.55rem', opacity: 0.85 }}>अफलाइन सुरक्षित</div>
          </div>
        </div>

        {/* Quick Action Big Scanning Bar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.4fr 1fr',
            gap: '0.6rem',
            marginTop: '1rem',
          }}
        >
          {/* Main Camera Scan Button */}
          <button
            type="button"
            onClick={() => {
              setTargetDocIdForAddingPage(null);
              setInProgressPages([]);
              setIsCameraOpen(true);
            }}
            style={{
              backgroundColor: '#ffffff',
              color: '#0369a1',
              border: 'none',
              padding: '10px 12px',
              borderRadius: '12px',
              fontWeight: 900,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
              cursor: 'pointer',
            }}
          >
            <Camera size={20} color="#0284c7" />
            <span>कागजात स्क्यान</span>
          </button>

          {/* Import / Gallery Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: '#ffffff',
              border: '1px solid rgba(255,255,255,0.4)',
              backdropFilter: 'blur(4px)',
              padding: '10px 12px',
              borderRadius: '12px',
              fontWeight: 800,
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer',
            }}
          >
            <Upload size={16} />
            <span>फोटो / फाइल</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
        </div>
      </div>

      {/* ─── SEARCH & FILTER SECTION ─── */}
      <div style={{ padding: '0.85rem 1rem 0 1rem' }}>
        {/* Search Bar */}
        <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
          <Search
            size={16}
            style={{ position: 'absolute', left: '12px', top: '11px', color: '#94a3b8' }}
          />
          <input
            type="text"
            placeholder="कागजात शीर्षक, कित्ता नं, नागरिकता वा अक्षर खोज्नुहोस्..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              height: '38px',
              paddingLeft: '36px',
              paddingRight: '12px',
              borderRadius: '10px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              fontSize: '0.8rem',
              outline: 'none',
              boxShadow: '0 2px 5px rgba(0,0,0,0.03)',
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '10px',
                top: '9px',
                background: '#e2e8f0',
                border: 'none',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                fontSize: '0.65rem',
                cursor: 'pointer',
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Folders Horizontal Reel */}
        <div
          style={{
            display: 'flex',
            gap: '0.45rem',
            overflowX: 'auto',
            paddingBottom: '4px',
            scrollbarWidth: 'none',
          }}
        >
          {categoriesList.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  backgroundColor: isSelected ? '#0284c7' : '#ffffff',
                  color: isSelected ? '#ffffff' : '#334155',
                  border: isSelected ? '1px solid #0284c7' : '1px solid #e2e8f0',
                  borderRadius: '20px',
                  padding: '5px 12px',
                  fontSize: '0.72rem',
                  fontWeight: isSelected ? 800 : 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  boxShadow: isSelected ? '0 3px 8px rgba(2, 132, 199, 0.3)' : 'none',
                  flexShrink: 0,
                }}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
                <span
                  style={{
                    fontSize: '0.62rem',
                    backgroundColor: isSelected ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
                    padding: '1px 5px',
                    borderRadius: '10px',
                    marginLeft: '2px',
                  }}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── SIFARISH ATTACHMENT NOTICE IF ATTACHING ─── */}
      {onSelectForSifarish && (
        <div
          style={{
            margin: '0.75rem 1rem 0 1rem',
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            padding: '8px 12px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: '#1e40af', fontWeight: 700 }}>
            📌 ई-सिफारिसका लागि कागजात छान्नुहोस्
          </div>
          <span style={{ fontSize: '0.68rem', color: '#3b82f6' }}>ट्याप गरी संलग्न गर्नुहोस्</span>
        </div>
      )}

      {/* ─── DOCUMENTS LIST / GRID ─── */}
      <div style={{ padding: '0.75rem 1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#334155' }}>
            कागजातहरू ({filteredDocuments.length})
          </div>
          <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
            Auto-Crop • PDF Merge • Nepali OCR
          </div>
        </div>

        {filteredDocuments.length === 0 ? (
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px dashed #cbd5e1',
              padding: '2.5rem 1rem',
              textAlign: 'center',
              color: '#64748b',
            }}
          >
            <Folder size={38} color="#94a3b8" style={{ margin: '0 auto 8px auto' }} />
            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#334155' }}>
              कुनै कागजात फेला परेन
            </div>
            <div style={{ fontSize: '0.72rem', marginTop: '4px' }}>
              नयाँ कागजात स्क्यान गर्न माथिको "कागजात स्क्यान" बटन थिच्नुहोस्।
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filteredDocuments.map((doc) => {
              const coverPage = doc.pages[0];
              const coverImg = coverPage?.processedImageUrl || coverPage?.originalImageUrl;

              return (
                <div
                  key={doc.id}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '14px',
                    border: '1px solid #e2e8f0',
                    overflow: 'hidden',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.15s ease',
                  }}
                >
                  {/* Card Content Row */}
                  <div
                    style={{
                      display: 'flex',
                      padding: '0.75rem',
                      gap: '0.75rem',
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      if (onSelectForSifarish) {
                        onSelectForSifarish(doc);
                      } else {
                        setViewingDoc(doc);
                      }
                    }}
                  >
                    {/* Thumbnail with Page count badge */}
                    <div
                      style={{
                        position: 'relative',
                        width: '74px',
                        height: '98px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        backgroundColor: '#f1f5f9',
                        flexShrink: 0,
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <img
                        src={coverImg}
                        alt={doc.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          backgroundColor: 'rgba(15, 23, 42, 0.85)',
                          color: '#ffffff',
                          fontSize: '0.62rem',
                          fontWeight: 700,
                          textAlign: 'center',
                          padding: '2px 0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '2px',
                        }}
                      >
                        <Layers size={10} />
                        <span>{doc.pages.length} पृष्ठ</span>
                      </div>
                    </div>

                    {/* Metadata details */}
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                          <span
                            style={{
                              fontSize: '0.65rem',
                              backgroundColor: '#e0f2fe',
                              color: '#0284c7',
                              fontWeight: 700,
                              padding: '1px 6px',
                              borderRadius: '4px',
                            }}
                          >
                            {doc.categoryLabel}
                          </span>
                        </div>

                        <h3
                          style={{
                            fontSize: '0.85rem',
                            fontWeight: 800,
                            color: '#0f172a',
                            margin: '0 0 4px 0',
                            lineHeight: 1.3,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {doc.title}
                        </h3>

                        {doc.notes && (
                          <p
                            style={{
                              fontSize: '0.7rem',
                              color: '#64748b',
                              margin: 0,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {doc.notes}
                          </p>
                        )}
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: '0.68rem',
                          color: '#94a3b8',
                          marginTop: '4px',
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Clock size={11} />
                          {doc.createdAt}
                        </span>
                        <span>{doc.fileSizeKb ? `${doc.fileSizeKb} KB` : 'PDF Ready'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action strip */}
                  <div
                    style={{
                      borderTop: '1px solid #f1f5f9',
                      backgroundColor: '#f8fafc',
                      padding: '6px 10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewingDoc(doc);
                        }}
                        style={{
                          backgroundColor: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          padding: '4px 8px',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          color: '#334155',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                          cursor: 'pointer',
                        }}
                      >
                        <Eye size={12} />
                        <span>हेर्नुहोस्</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTriggerOcr(doc);
                        }}
                        style={{
                          backgroundColor: '#e0f2fe',
                          border: '1px solid #bae6fd',
                          borderRadius: '6px',
                          padding: '4px 8px',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          color: '#0284c7',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                          cursor: 'pointer',
                        }}
                      >
                        <Sparkles size={12} />
                        <span>OCR टेक्स्ट</span>
                      </button>
                    </div>

                    {onSelectForSifarish ? (
                      <button
                        type="button"
                        onClick={() => onSelectForSifarish(doc)}
                        style={{
                          backgroundColor: '#16a34a',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '4px 10px',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                        }}
                      >
                        सिफारिसमा संलग्न
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={async (e) => {
                          e.stopPropagation();
                          const pdf = await generateMultiPagePdf(doc.pages, doc.title, 'medium');
                          pdf.save(`${doc.title}.pdf`);
                        }}
                        style={{
                          backgroundColor: '#0284c7',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '4px 10px',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                          cursor: 'pointer',
                        }}
                      >
                        <Download size={12} />
                        <span>PDF डाउनलोड</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── MODAL 1: CAMERA SCANNER ─── */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCapturePhoto}
      />

      {/* ─── MODAL 2: CROP, PERSPECTIVE & FILTER ─── */}
      {rawCapturedImage && (
        <CropFilterModal
          isOpen={isCropFilterOpen}
          rawImage={rawCapturedImage}
          onClose={() => {
            setIsCropFilterOpen(false);
            setRawCapturedImage(null);
          }}
          onSavePage={handleSavePage}
        />
      )}

      {/* ─── MODAL 3: DOCUMENT METADATA NAMING (AFTER SCANNING) ─── */}
      {isMetaModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(4px)',
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
              maxWidth: '440px',
              width: '100%',
              padding: '1.25rem',
              boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
            }}
          >
            <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f172a', margin: '0 0 4px 0' }}>
              कागजात सुरक्षित गर्नुहोस्
            </h3>
            <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '1rem' }}>
              जम्मा <strong>{inProgressPages.length} पृष्ठ</strong> सफलतापूर्वक स्क्यान भयो।
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveFinalDocument();
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
            >
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 800 }}>कागजातको नाम / शीर्षक:</label>
                <input
                  type="text"
                  required
                  placeholder="उदा. नागरिकता प्रमाणपत्र, कित्ता ४५२ लालपुर्जा..."
                  value={newDocMeta.title}
                  onChange={(e) => setNewDocMeta({ ...newDocMeta, title: e.target.value })}
                  style={{ width: '100%', height: '38px', padding: '0 8px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 800 }}>कागजातको प्रकार (वर्ग):</label>
                <select
                  value={newDocMeta.category}
                  onChange={(e) => {
                    const selected = categoriesList.find((c) => c.id === e.target.value);
                    setNewDocMeta({
                      ...newDocMeta,
                      category: e.target.value as DocumentCategory,
                      categoryLabel: selected?.label || 'कागजात',
                    });
                  }}
                  style={{ width: '100%', height: '38px', padding: '0 8px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#fff' }}
                >
                  <option value="citizenship">🪪 नागरिकता तथा परिचयपत्र</option>
                  <option value="lalpurja">📜 जग्गाधनी प्रमाणपुर्जा (लालपुर्जा)</option>
                  <option value="sifarish">📝 सिफारिस तथा नाता प्रमाणित</option>
                  <option value="tax_receipt">💰 कर तथा मालपोत रसिद</option>
                  <option value="darta_chalani">📑 दर्ता, चलानी र पत्र</option>
                  <option value="building_permit">⚖️ नक्सा तथा भवन इजाजत</option>
                  <option value="other">📁 अन्य विविध कागजात</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 800 }}>टिप्पणी / कैफियत (वैकल्पिक):</label>
                <input
                  type="text"
                  placeholder="उदा. वडा नं ३ मा पेश गर्न बाँकी..."
                  value={newDocMeta.notes}
                  onChange={(e) => setNewDocMeta({ ...newDocMeta, notes: e.target.value })}
                  style={{ width: '100%', height: '38px', padding: '0 8px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsMetaModalOpen(false)}
                  style={{
                    flex: 1,
                    backgroundColor: '#e2e8f0',
                    color: '#334155',
                    border: 'none',
                    height: '40px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  रद्द
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1.5,
                    backgroundColor: '#0284c7',
                    color: '#ffffff',
                    border: 'none',
                    height: '40px',
                    borderRadius: '8px',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  सुरक्षित गर्नुहोस्
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL 4: DOCUMENT DETAIL & VIEWER ─── */}
      <DocDetailModal
        isOpen={Boolean(viewingDoc)}
        document={viewingDoc}
        onClose={() => setViewingDoc(null)}
        onOpenOcr={(doc) => handleTriggerOcr(doc)}
        onAddPageToDoc={(docId) => {
          setTargetDocIdForAddingPage(docId);
          setIsCameraOpen(true);
        }}
        onUpdateDoc={(updatedDoc) => {
          setDocuments((prev) => prev.map((d) => (d.id === updatedDoc.id ? updatedDoc : d)));
          setViewingDoc(updatedDoc);
        }}
        onDeleteDoc={handleDeleteDocument}
      />

      {/* ─── MODAL 5: OCR RESULTS & EXPORT ─── */}
      {ocrResultData && ocrDoc && (
        <OcrResultModal
          isOpen={Boolean(ocrResultData)}
          docTitle={ocrDoc.title}
          initialText={ocrResultData.text}
          entities={ocrResultData.entities}
          confidence={ocrResultData.confidence}
          onClose={() => {
            setOcrResultData(null);
            setOcrDoc(null);
          }}
          onSaveEditedText={handleSaveOcrText}
        />
      )}

      {/* ─── OCR LOADING INDICATOR POPUP ─── */}
      {ocrLoadingStatus && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            zIndex: 2500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: '16px',
              padding: '1.5rem',
              textAlign: 'center',
              maxWidth: '320px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: '#e0f2fe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px auto',
              }}
            >
              <Sparkles size={24} color="#0284c7" />
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>
              AI OCR विश्लेषण हुँदैछ
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '6px' }}>
              {ocrLoadingStatus}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
