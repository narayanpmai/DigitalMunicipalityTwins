import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Search,
  Download,
  Volume2,
  Bookmark,
  Share2,
  FileText,
  ExternalLink,
  X,
  Check,
  Sparkles,
  Layers,
  Calendar,
  Building,
  HardDrive,
} from 'lucide-react';
import { LibraryCategory, LibraryItem } from '../../types';
import { INITIAL_MOCK_LIBRARY_ITEMS } from '../../data/mockLibraryData';

export const ELibrary: React.FC = () => {
  const [items, setItems] = useState<LibraryItem[]>(INITIAL_MOCK_LIBRARY_ITEMS);
  const [selectedCategory, setSelectedCategory] = useState<LibraryCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeBook, setActiveBook] = useState<LibraryItem | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [downloadSuccessId, setDownloadSuccessId] = useState<string | null>(null);

  // Category definitions
  const categories: { id: LibraryCategory; label: string; icon: string }[] = [
    { id: 'all', label: 'सबै सामग्री', icon: '📁' },
    { id: 'acts_gazette', label: 'ऐन तथा राजपत्र', icon: '⚖️' },
    { id: 'budget_plans', label: 'बजेट तथा योजना', icon: '📊' },
    { id: 'curriculum_books', label: 'स्थानीय पाठ्यक्रम', icon: '📚' },
    { id: 'agri_health_manuals', label: 'कृषि तथा स्वास्थ्य', icon: '🌱' },
    { id: 'bulletins_reports', label: 'बुलेटिन तथा प्रतिवेदन', icon: '📰' },
  ];

  // Filtered Items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchQ =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.department.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        item.publishedYear.includes(q);

      return matchCat && matchQ;
    });
  }, [items, selectedCategory, searchQuery]);

  // Toggle Bookmark
  const toggleBookmark = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isBookmarked: !item.isBookmarked } : item))
    );
  };

  // Mock Offline Download
  const handleOfflineSave = (item: LibraryItem) => {
    setItems((prev) =>
      prev.map((it) => (it.id === item.id ? { ...it, isCachedOffline: true } : it))
    );
    setDownloadSuccessId(item.id);
    setTimeout(() => setDownloadSuccessId(null), 2500);
  };

  // Speech synthesis TTS
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text.slice(0, 350));
      utterance.lang = 'ne-NP';
      utterance.rate = 0.9;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div style={{ paddingBottom: '5.5rem' }}>
      {/* ─── HERO HEADER ─── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%)',
          color: '#ffffff',
          padding: '1.25rem 1rem 1rem 1rem',
          borderRadius: '0 0 20px 20px',
          boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.4)',
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
                <BookOpen size={11} />
                <span>डिजिटल ज्ञान केन्द्र</span>
              </span>
            </div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 900, margin: 0 }}>पालिका ई-लाइब्रेरी</h1>
            <p style={{ fontSize: '0.72rem', opacity: 0.9, marginTop: '2px' }}>
              ऐन, राजपत्र, बजेट, स्थानीय पाठ्यक्रम तथा किसान हातेपुस्तिका
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
            <div style={{ fontSize: '1.1rem', fontWeight: 900 }}>{items.length}</div>
            <div style={{ fontSize: '0.62rem', opacity: 0.9 }}>दस्तावेज</div>
          </div>
        </div>

        {/* Quick Search Bar */}
        <div style={{ position: 'relative', marginTop: '0.85rem' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '11px', color: '#64748b' }} />
          <input
            type="text"
            placeholder="ऐन, बजेट, पाठ्यक्रम वा पुस्तक खोज्नुहोस्..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              height: '38px',
              paddingLeft: '36px',
              paddingRight: '12px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: '#ffffff',
              fontSize: '0.82rem',
              color: '#0f172a',
              outline: 'none',
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
            }}
          />
        </div>
      </div>

      {/* ─── CATEGORY HORIZONTAL REEL ─── */}
      <div style={{ padding: '0.75rem 1rem 0 1rem' }}>
        <div style={{ display: 'flex', gap: '0.45rem', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  backgroundColor: isSelected ? '#2563eb' : '#ffffff',
                  color: isSelected ? '#ffffff' : '#334155',
                  border: isSelected ? '1px solid #2563eb' : '1px solid #e2e8f0',
                  borderRadius: '20px',
                  padding: '5px 12px',
                  fontSize: '0.72rem',
                  fontWeight: isSelected ? 800 : 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  flexShrink: 0,
                  boxShadow: isSelected ? '0 3px 8px rgba(37, 99, 235, 0.3)' : 'none',
                }}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── ITEMS LIST ─── */}
      <div style={{ padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {filteredItems.map((item) => (
          <div
            key={item.id}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Top Info Bar */}
            <div style={{ padding: '0.85rem', display: 'flex', gap: '0.75rem', cursor: 'pointer' }} onClick={() => setActiveBook(item)}>
              {/* Book Spine Icon Badge */}
              <div
                style={{
                  width: '54px',
                  height: '74px',
                  borderRadius: '6px',
                  backgroundColor: item.coverColor,
                  color: '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                }}
              >
                <div style={{ fontSize: '1.4rem' }}>{item.icon}</div>
                <div style={{ fontSize: '0.55rem', fontWeight: 800, marginTop: '2px', opacity: 0.9 }}>
                  {item.pagesCount} पृ.
                </div>
              </div>

              {/* Title & Metadata */}
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                    <span
                      style={{
                        fontSize: '0.62rem',
                        fontWeight: 800,
                        backgroundColor: '#dbeafe',
                        color: '#1d4ed8',
                        padding: '1px 6px',
                        borderRadius: '4px',
                      }}
                    >
                      {item.categoryLabel}
                    </span>
                    <span style={{ fontSize: '0.65rem', color: '#64748b' }}>वर्ष {item.publishedYear}</span>
                  </div>

                  <h3
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      color: '#0f172a',
                      margin: '0 0 3px 0',
                      lineHeight: 1.3,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {item.title}
                  </h3>

                  <p
                    style={{
                      fontSize: '0.7rem',
                      color: '#64748b',
                      margin: 0,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {item.summary}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.66rem', color: '#94a3b8', marginTop: '4px' }}>
                  <span>{item.department}</span>
                  <span>{item.fileSizeMb} MB</span>
                </div>
              </div>
            </div>

            {/* Action Buttons Strip */}
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
                  onClick={() => setActiveBook(item)}
                  style={{
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '4px 10px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer',
                  }}
                >
                  <BookOpen size={12} />
                  <span>पढ्नुहोस्</span>
                </button>

                <button
                  type="button"
                  onClick={() => speakText(`${item.title}। प्रकाशित वर्ष ${item.publishedYear}। ${item.summary}`)}
                  style={{
                    backgroundColor: '#ffffff',
                    color: '#334155',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    padding: '4px 8px',
                    fontSize: '0.7rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px',
                    cursor: 'pointer',
                  }}
                >
                  <Volume2 size={12} />
                  <span>सुन्नुहोस्</span>
                </button>
              </div>

              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => handleOfflineSave(item)}
                  style={{
                    backgroundColor: item.isCachedOffline ? '#f0fdf4' : '#ffffff',
                    color: item.isCachedOffline ? '#16a34a' : '#475569',
                    border: `1px solid ${item.isCachedOffline ? '#86efac' : '#cbd5e1'}`,
                    borderRadius: '6px',
                    padding: '4px 8px',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px',
                    cursor: 'pointer',
                  }}
                >
                  {item.isCachedOffline ? <Check size={12} /> : <Download size={12} />}
                  <span>{item.isCachedOffline ? 'अफलाइन सुरक्षित' : 'डाउनलोड'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleBookmark(item.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: item.isBookmarked ? '#f59e0b' : '#94a3b8',
                    cursor: 'pointer',
                    padding: '2px',
                  }}
                >
                  <Bookmark size={16} fill={item.isBookmarked ? '#f59e0b' : 'none'} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ─── IN-APP BOOK / ACT READER MODAL ─── */}
      {activeBook && (
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
              boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
            }}
          >
            {/* Reader Header */}
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
              <div style={{ overflow: 'hidden' }}>
                <span style={{ fontSize: '0.68rem', backgroundColor: '#dbeafe', color: '#1d4ed8', padding: '2px 8px', borderRadius: '4px', fontWeight: 800 }}>
                  {activeBook.categoryLabel}
                </span>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 900, color: '#0f172a', margin: '4px 0 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {activeBook.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => {
                  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                  setIsSpeaking(false);
                  setActiveBook(null);
                }}
                style={{ background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Document Content View */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '1.25rem',
                backgroundColor: '#fcfbf7',
                fontFamily: `'Noto Sans Devanagari', sans-serif`,
                fontSize: '0.88rem',
                lineHeight: 1.7,
                color: '#1e293b',
              }}
            >
              <div
                style={{
                  backgroundColor: '#ffffff',
                  padding: '1.25rem',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {activeBook.fullContentSnippet || activeBook.summary}
              </div>
            </div>

            {/* Reader Footer Controls */}
            <div
              style={{
                padding: '0.75rem 1.25rem',
                backgroundColor: '#ffffff',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <button
                type="button"
                onClick={() => speakText(activeBook.fullContentSnippet || activeBook.summary)}
                style={{
                  backgroundColor: isSpeaking ? '#fee2e2' : '#f1f5f9',
                  color: isSpeaking ? '#dc2626' : '#2563eb',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                }}
              >
                <Volume2 size={14} />
                <span>{isSpeaking ? 'सुन्न बन्द' : 'आवाजमा सुन्नुहोस्'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  alert(`"${activeBook.title}.pdf" फाइल डाउनलोड भयो!`);
                }}
                style={{
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                }}
              >
                <Download size={14} />
                <span>PDF डाउनलोड ({activeBook.fileSizeMb} MB)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
