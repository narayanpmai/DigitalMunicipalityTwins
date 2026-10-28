import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  BookOpen,
  Book,
  FileText,
  Headphones,
  Video,
  Search,
  X,
  QrCode,
  Eye,
  Printer,
  Download,
  Copy,
  Check,
  ExternalLink,
  Share2,
  RotateCcw,
  Sparkles,
  Layers,
  MapPin,
  Clock,
  Building,
  User,
  Bookmark,
  ShieldCheck,
  CheckCircle2,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Send,
  MessageSquarePlus,
  Play,
  ArrowUpDown,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import QRCode from 'qrcode';
import { sectoralApi } from '../../api/sectoral';
import { useTenant } from '../../context/TenantContext';
import type { LibraryBook } from '../../types/library';
import './Library.css';

const MEDIA_FILTERS = [
  { id: 'all', label: 'सबै ढाँचा', icon: Layers },
  { id: 'ebook', label: 'ई-पुस्तक (PDF)', icon: FileText },
  { id: 'physical', label: 'भौतिक पुस्तक', icon: Book },
  { id: 'audiobook', label: 'अडियोबुक', icon: Headphones },
  { id: 'videobook', label: 'भिडियो ई-कक्षा', icon: Video },
];

const PALIKA_BRANCHES: Record<string, Array<{ name: string; ward: string; time: string; phone: string }>> = {
  khadadevi: [
    { name: 'खाँडादेवी केन्द्रीय सार्वजनिक पुस्तकालय तथा सूचना केन्द्र', ward: 'वडा नं. ३', time: 'आइतबार - शुक्रबार: बिहान ९:०० - बेलुका ४:००', phone: '०४८-५४०००१' },
    { name: 'गाल्पा ज्ञान विकास तथा सामुदायिक सिकाई केन्द्र', ward: 'वडा नं. ४', time: 'आइतबार - शुक्रबार: बिहान १०:०० - बेलुका ५:००', phone: '०४८-५४०००२' },
    { name: 'माकादुम डिजिटल पठन तथा स्रोत केन्द्र', ward: 'वडा नं. ६', time: 'आइतबार - शुक्रबार: बिहान ९:०० - दिउँसो ३:००', phone: '०४८-५४०००३' },
    { name: 'पिङ्खुरी जनचेतना पुस्तकालय', ward: 'वडा नं. २', time: 'आइतबार - शुक्रबार: बिहान ९:०० - दिउँसो ३:००', phone: '०४८-५४०००४' },
  ],
  gaushala: [
    { name: 'गौशाला नगर पुस्तकालय तथा वाचनालय', ward: 'वडा नं. ५', time: 'आइतबार - शुक्रबार: बिहान ९:०० - बेलुका ५:००', phone: '०४४-५५०००१' },
    { name: 'निगम सूचना तथा ज्ञान केन्द्र', ward: 'वडा नं. ३', time: 'आइतबार - शुक्रबार: बिहान १०:०० - बेलुका ५:००', phone: '०४४-५५०००२' },
    { name: 'रामविहारी सामुदायिक अध्ययन केन्द्र', ward: 'वडा नं. १', time: 'आइतबार - शुक्रबार: बिहान ९:०० - दिउँसो ३:००', phone: '०४४-५५०००३' },
  ],
  default: [
    { name: 'थाङपालधाप सामुदायिक पुस्तकालय तथा सूचना केन्द्र', ward: 'वडा नं. ६', time: 'आइतबार - शुक्रबार: बिहान ९:०० - बेलुका ४:००', phone: '०११-५९०००१' },
    { name: 'भोताङ खुला ज्ञान तथा पठन केन्द्र', ward: 'वडा नं. ३', time: 'आइतबार - शुक्रबार: बिहान १०:०० - बेलुका ५:००', phone: '०११-५९०००२' },
    { name: 'बरुवा डिजिटल सिकाई तथा सामुदायिक पुस्तकालय', ward: 'वडा नं. २', time: 'आइतबार - शुक्रबार: बिहान ९:०० - दिउँसो ३:००', phone: '०११-५९०००३' },
    { name: 'गुन्सा हिमाली अध्ययन तथा अनुसन्धान केन्द्र', ward: 'वडा नं. ५', time: 'आइतबार - शुक्रबार: बिहान ९:०० - दिउँसो ३:००', phone: '०११-५९०००४' },
  ],
};

const getYouTubeEmbedUrl = (url?: string): string | null => {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match && match[1] ? `https://www.youtube.com/embed/${match[1]}` : null;
};

const getCoverTheme = (book: LibraryBook): string => {
  const cat = (book.category || '').toLowerCase();
  const media = (book.mediaType || '').toLowerCase();

  if (media === 'audiobook' || cat.includes('संस्कृति') || cat.includes('इतिहास')) return 'theme-culture';
  if (cat.includes('भूगोल') || cat.includes('पर्यटन') || cat.includes('स्थानीय')) return 'theme-geo';
  if (cat.includes('शिक्षा') || cat.includes('बालबालिका') || media === 'videobook') return 'theme-edu';
  if (cat.includes('भाषा') || cat.includes('शब्दकोश')) return 'theme-lang';
  if (cat.includes('कानून') || cat.includes('सुशासन') || cat.includes('ऐन')) return 'theme-law';
  if (cat.includes('विज्ञान') || cat.includes('पर्यावरण') || cat.includes('जडीबुटी')) return 'theme-science';
  return 'theme-default';
};

export const Library: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const directBookId = searchParams.get('bookId');
  const directReadId = searchParams.get('read');

  // Search, Filter & Sort State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMediaType, setSelectedMediaType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('सबै श्रेणी');
  const [sortBy, setSortBy] = useState<'newest' | 'title' | 'year' | 'pages'>('newest');

  // Modals
  const [detailBook, setDetailBook] = useState<LibraryBook | null>(null);
  const [qrModalBook, setQrModalBook] = useState<LibraryBook | null>(null);
  const [readingBook, setReadingBook] = useState<LibraryBook | null>(null);
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  // QR & Share State
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Suggestion Form State
  const [suggestForm, setSuggestForm] = useState({
    name: '',
    contact: '',
    ward: '६',
    title: '',
    author: '',
    category: 'शिक्षा तथा पाठ्यपुस्तक',
    reason: '',
  });
  const [suggestSubmitted, setSuggestSubmitted] = useState(false);

  const { tenantId, settings } = useTenant();

  // Community Branches for active palika
  const communityBranches = useMemo(() => {
    return PALIKA_BRANCHES[tenantId] || PALIKA_BRANCHES.default;
  }, [tenantId]);

  // Fetch Library Books & Stats
  const { data: rawBooks = [], isLoading: isLoadingBooks } = useQuery({
    queryKey: ['publicLibraryBooks', tenantId],
    queryFn: () => sectoralApi.getLibraryBooks(),
  });

  const { data: rawStats } = useQuery({
    queryKey: ['publicLibraryStats', tenantId],
    queryFn: () => sectoralApi.getLibraryStats(),
  });

  // Normalize Books
  const books: LibraryBook[] = useMemo(() => {
    if (!Array.isArray(rawBooks)) return [];
    return rawBooks;
  }, [rawBooks]);

  // Dynamic Categories list
  const categoryOptions = useMemo(() => {
    const cats = new Set<string>();
    books.forEach(b => {
      if (b.category && b.category.trim()) cats.add(b.category.trim());
    });
    return ['सबै श्रेणी', ...Array.from(cats)];
  }, [books]);

  // Deep-link effect (?bookId=LIB-XXXX or ?read=LIB-XXXX)
  useEffect(() => {
    if (books.length > 0) {
      if (directBookId) {
        const found = books.find(b => b.bookId === directBookId || b.id === directBookId);
        if (found) setDetailBook(found);
      } else if (directReadId) {
        const found = books.find(b => b.bookId === directReadId || b.id === directReadId);
        if (found) setReadingBook(found);
      }
    }
  }, [directBookId, directReadId, books]);

  // Generate QR Code when QR modal opens
  useEffect(() => {
    if (qrModalBook) {
      const publicUrl = `${window.location.origin}/library?bookId=${qrModalBook.bookId}`;
      QRCode.toDataURL(publicUrl, {
        width: 320,
        margin: 2,
        color: { dark: '#0f172a', light: '#ffffff' },
      })
        .then(url => setQrDataUrl(url))
        .catch(err => console.error('QR code generation failed:', err));
    } else {
      setQrDataUrl('');
      setCopiedLink(false);
    }
  }, [qrModalBook]);

  // Filtered and Sorted Books
  const processedBooks = useMemo(() => {
    const list = books.filter(book => {
      // Format match
      if (selectedMediaType !== 'all') {
        const m = (book.mediaType || '').toLowerCase();
        if (selectedMediaType === 'ebook' && m !== 'ebook' && m !== 'pdf') return false;
        if (selectedMediaType === 'physical' && m !== 'physical') return false;
        if (selectedMediaType === 'audiobook' && m !== 'audiobook' && m !== 'audio') return false;
        if (selectedMediaType === 'videobook' && m !== 'videobook' && m !== 'video') return false;
      }

      // Category match
      if (selectedCategory !== 'सबै श्रेणी') {
        if (book.category !== selectedCategory) return false;
      }

      // Search match
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const title = (book.title || '').toLowerCase();
        const author = (book.author || '').toLowerCase();
        const publisher = (book.publisher || '').toLowerCase();
        const bookId = (book.bookId || '').toLowerCase();
        const summary = (book.summary || '').toLowerCase();
        const cat = (book.category || '').toLowerCase();
        const isbn = (book.isbn || '').toLowerCase();

        return (
          title.includes(q) ||
          author.includes(q) ||
          publisher.includes(q) ||
          bookId.includes(q) ||
          summary.includes(q) ||
          cat.includes(q) ||
          isbn.includes(q)
        );
      }

      return true;
    });

    // Sorting
    return list.sort((a, b) => {
      if (sortBy === 'title') {
        return (a.title || '').localeCompare(b.title || '', 'ne');
      }
      if (sortBy === 'year') {
        return (b.publicationYear || '').localeCompare(a.publicationYear || '', 'ne');
      }
      if (sortBy === 'pages') {
        return (Number(b.pages) || 0) - (Number(a.pages) || 0);
      }
      // 'newest' default
      return (b.bookId || '').localeCompare(a.bookId || '');
    });
  }, [books, selectedMediaType, selectedCategory, searchTerm, sortBy]);

  // Smart Share with Native Web Share API + Clipboard Fallback
  const handleShareBook = async (book: LibraryBook) => {
    const url = `${window.location.origin}/library?bookId=${book.bookId}`;
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: book.title,
          text: `${book.title} - ${settings?.palika_name || (tenantId === 'khadadevi' ? 'खाँडादेवी गाउँपालिका' : 'पाँचपोखरी थाङपाल गाउँपालिका')} डिजिटल पुस्तकालय`,
          url,
        });
        return;
      } catch {
        // User cancelled or failed -> fallback to clipboard
      }
    }

    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2200);
  };

  // Close modals & update URL param
  const handleCloseDetail = () => {
    setDetailBook(null);
    if (directBookId) {
      searchParams.delete('bookId');
      setSearchParams(searchParams);
    }
  };

  const handleCloseReader = () => {
    setReadingBook(null);
    setZoomLevel(100);
    if (directReadId) {
      searchParams.delete('read');
      setSearchParams(searchParams);
    }
  };

  const handleCloseQrModal = () => {
    setQrModalBook(null);
  };

  const handlePrintTag = () => {
    window.print();
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl || !qrModalBook) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `QR_${qrModalBook.bookId}_${qrModalBook.title.slice(0, 15)}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenReader = (book: LibraryBook) => {
    setReadingBook(book);
    setZoomLevel(100);
  };

  const handleSuggestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestForm.title.trim()) {
      alert('कृपया पुस्तकको नाम वा विषय अनिवार्य खुलाउनुहोस्।');
      return;
    }

    try {
      const existing = JSON.parse(localStorage.getItem('p5_library_suggestions') || '[]');
      existing.push({
        ...suggestForm,
        submittedAt: new Date().toISOString(),
      });
      localStorage.setItem('p5_library_suggestions', JSON.stringify(existing));
    } catch {}

    setSuggestSubmitted(true);
    setTimeout(() => {
      setSuggestSubmitted(false);
      setShowSuggestModal(false);
      setSuggestForm({
        name: '',
        contact: '',
        ward: '६',
        title: '',
        author: '',
        category: 'शिक्षा तथा पाठ्यपुस्तक',
        reason: '',
      });
    }, 2000);
  };

  const getFormatBadge = (mediaType?: string) => {
    const m = (mediaType || '').toLowerCase();
    switch (m) {
      case 'ebook':
      case 'pdf':
        return <span className="pub-library-badge-format ebook"><FileText size={13} /> ई-पुस्तक (PDF)</span>;
      case 'physical':
        return <span className="pub-library-badge-format physical"><Book size={13} /> भौतिक पुस्तक</span>;
      case 'audiobook':
      case 'audio':
        return <span className="pub-library-badge-format audiobook"><Headphones size={13} /> अडियोबुक</span>;
      case 'videobook':
      case 'video':
        return <span className="pub-library-badge-format videobook"><Video size={13} /> भिडियो ई-कक्षा</span>;
      default:
        return <span className="pub-library-badge-format ebook"><FileText size={13} /> {mediaType || 'डिजिटल संकलन'}</span>;
    }
  };

  const activeFilterCount = (selectedMediaType !== 'all' ? 1 : 0) + (selectedCategory !== 'सबै श्रेणी' ? 1 : 0) + (searchTerm.trim() ? 1 : 0);

  return (
    <div className="pub-library-container">
      {/* ── Hero Banner ── */}
      <section className="pub-library-hero">
        <div className="pub-library-hero-content">
          <div className="pub-library-hero-top-row">
            <div className="pub-library-badge-top">
              <Sparkles size={14} /> पाँचपोखरी थाङपाल गाउँपालिका • खुला ज्ञान तथा डिजिटल सूचना केन्द्र
              <span className="pub-library-readonly-pill"><CheckCircle2 size={12} /> खुला पहुँच (Read-Only)</span>
            </div>

            <button
              className="pub-library-request-btn"
              onClick={() => setShowSuggestModal(true)}
              title="पालिका पुस्तकालयमा नयाँ पुस्तक माग वा अध्ययन सुझाव पठाउनुहोस्"
            >
              <MessageSquarePlus size={15} /> पुस्तक माग / सुझाव फारम
            </button>
          </div>

          <h1 className="pub-library-hero-title">
            <BookOpen size={36} color="#38bdf8" /> सार्वजनिक डिजिटल तथा खुला पुस्तकालय
          </h1>
          <p className="pub-library-hero-sub">
            पालिकाका बालबालिका, युवा, विद्यार्थी, अनुसन्धानकर्ता तथा आम नागरिकहरूका लागि स्थानीय पाठ्यक्रम,
            ऐतिहासिक दस्तावेज, गाउँपालिका प्रोफाइल, कानून, भाषा-शब्दावली, अडियोबुक तथा खुला ई-पुस्तकहरूको डिजिटल रिपोजिटरी।
          </p>

          {/* KPI Stats Strip */}
          <div className="pub-library-kpi-grid">
            <div className="pub-library-kpi-card">
              <div className="pub-library-kpi-icon" style={{ background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8' }}>
                <BookOpen size={24} />
              </div>
              <div>
                <div className="pub-library-kpi-val">{rawStats?.total ?? books.length ?? 0}</div>
                <div className="pub-library-kpi-lbl">कुल दर्ता पुस्तक तथा संकलन</div>
              </div>
            </div>

            <div className="pub-library-kpi-card">
              <div className="pub-library-kpi-icon" style={{ background: 'rgba(14, 165, 233, 0.2)', color: '#bae6fd' }}>
                <FileText size={24} />
              </div>
              <div>
                <div className="pub-library-kpi-val">{rawStats?.ebook ?? books.filter(b => b.mediaType === 'ebook').length}</div>
                <div className="pub-library-kpi-lbl">ई-पुस्तक तथा डिजिटल PDF</div>
              </div>
            </div>

            <div className="pub-library-kpi-card">
              <div className="pub-library-kpi-icon" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fde68a' }}>
                <Book size={24} />
              </div>
              <div>
                <div className="pub-library-kpi-val">{rawStats?.physical ?? books.filter(b => b.mediaType === 'physical').length}</div>
                <div className="pub-library-kpi-lbl">भौतिक र्याक संग्रह (कपी)</div>
              </div>
            </div>

            <div className="pub-library-kpi-card">
              <div className="pub-library-kpi-icon" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#6ee7b7' }}>
                <ShieldCheck size={24} />
              </div>
              <div>
                <div className="pub-library-kpi-val">१००%</div>
                <div className="pub-library-kpi-lbl">निःशुल्क नागरिक पठन पहुँच</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Search, Sort & Filter Toolbar ── */}
      <div className="pub-library-toolbar">
        {/* Search row, sorting, and media format tabs */}
        <div className="pub-library-search-row">
          <div className="pub-library-search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="पुस्तकको नाम, लेखक, प्रकाशक, विषय वा पुस्तक कोड खोज्नुहोस्..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="pub-library-search-clear" onClick={() => setSearchTerm('')} title="खाली गर्नुहोस्">
                <X size={16} />
              </button>
            )}
          </div>

          <select
            className="pub-library-sort-select"
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            title="क्रमबद्ध गर्नुहोस्"
          >
            <option value="newest">नवीनतम दर्ता (Newest)</option>
            <option value="title">पुस्तक शीर्षक (क-ह)</option>
            <option value="year">प्रकाशन वर्ष (नयाँ-पुरानो)</option>
            <option value="pages">धेरै पृष्ठ संख्या</option>
          </select>

          <div className="pub-library-media-tabs">
            {MEDIA_FILTERS.map(tab => {
              const TabIcon = tab.icon;
              const isActive = selectedMediaType === tab.id;
              return (
                <button
                  key={tab.id}
                  className={`pub-library-media-btn ${isActive ? 'active' : ''}`}
                  onClick={() => setSelectedMediaType(tab.id)}
                >
                  <TabIcon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Category Pills Row */}
        <div className="pub-library-cat-row">
          {categoryOptions.map(cat => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                className={`pub-library-cat-pill ${isActive ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                <Bookmark size={12} />
                <span>{cat}</span>
              </button>
            );
          })}

          {activeFilterCount > 0 && (
            <button
              className="pub-library-reset-btn"
              onClick={() => {
                setSearchTerm('');
                setSelectedMediaType('all');
                setSelectedCategory('सबै श्रेणी');
                setSortBy('newest');
              }}
              title="सबै फिल्टर रिसेट गर्नुहोस्"
            >
              <RotateCcw size={12} /> रिसेट
            </button>
          )}
        </div>
      </div>

      {/* ── Results Info Bar ── */}
      <div className="pub-library-results-meta">
        <div>
          कुल <strong>{processedBooks.length}</strong> वटा पुस्तक तथा डिजिटल सामग्रीहरू प्रदर्शनमा
        </div>
        <div>
          {activeFilterCount > 0 && <span style={{ color: '#0284c7', fontWeight: 600 }}>• फिल्टर सक्रिय</span>}
        </div>
      </div>

      {/* ── Catalog Grid ── */}
      {isLoadingBooks ? (
        <div className="pub-library-empty">
          <div className="pub-library-empty-icon">
            <BookOpen size={32} />
          </div>
          <h3>पुस्तकालय क्याटलग लोड हुँदैछ...</h3>
          <p>कृपया केही क्षण प्रतीक्षा गर्नुहोस्।</p>
        </div>
      ) : processedBooks.length === 0 ? (
        <div className="pub-library-empty">
          <div className="pub-library-empty-icon">
            <Search size={32} />
          </div>
          <h3>कुनै पुस्तक फेला परेन</h3>
          <p>तपाईंको खोजी अनुसार कुनै पुस्तक उपलब्ध भएन। कृपया फरक शब्द वा फिल्टर प्रयोग गर्नुहोस्।</p>
          <button
            className="pub-library-btn-primary"
            onClick={() => {
              setSearchTerm('');
              setSelectedMediaType('all');
              setSelectedCategory('सबै श्रेणी');
              setSortBy('newest');
            }}
          >
            <RotateCcw size={15} /> सबै पुस्तकहरू हेर्नुहोस्
          </button>
        </div>
      ) : (
        <div className="pub-library-grid">
          {processedBooks.map(book => {
            const coverThemeClass = getCoverTheme(book);
            return (
              <div key={book.id || book.bookId} className="pub-library-card">
                {/* Cover / Placeholder */}
                <div className={`pub-library-card-cover-wrapper ${coverThemeClass}`}>
                  {getFormatBadge(book.mediaType)}
                  <span className="pub-library-badge-id">{book.bookId}</span>

                  {book.coverUrl ? (
                    <img 
                      src={book.coverUrl} 
                      alt={book.title} 
                      className="pub-library-card-cover-img"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  ) : (
                    <div className="pub-library-cover-placeholder">
                      <div className="pub-library-placeholder-icon">
                        {book.mediaType === 'audiobook' ? (
                          <Headphones size={28} color="#ffffff" />
                        ) : book.mediaType === 'videobook' ? (
                          <Video size={28} color="#ffffff" />
                        ) : (
                          <BookOpen size={28} color="#ffffff" />
                        )}
                      </div>
                      <div className="pub-library-placeholder-title">{book.title}</div>
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="pub-library-card-body">
                  <div className="pub-library-card-cat-strip">
                    <span className="pub-library-cat-badge">{book.category || 'सामान्य'}</span>
                    <span className="pub-library-card-lang">{book.language || 'नेपाली'}</span>
                  </div>

                  <h3 className="pub-library-card-title" title={book.title}>
                    {book.title}
                  </h3>

                  <div className="pub-library-card-author">
                    <User size={13} /> {book.author || 'अज्ञात लेखक'}
                  </div>

                  <div className="pub-library-card-pub">
                    <Building size={13} /> {book.publisher || 'स्थानीय प्रकाशन'} • {book.publicationYear || '२०८१'}
                  </div>

                  <div className="pub-library-card-summary">
                    {book.summary || 'पाँचपोखरी थाङपाल गाउँपालिकाको सार्वजनिक खुला पुस्तकालय संकलन।'}
                  </div>

                  {/* Inline quick preview button for Audio / Video */}
                  {book.mediaType === 'audiobook' && (
                    <button
                      className="pub-library-btn-card-preview"
                      onClick={() => setDetailBook(book)}
                    >
                      <Headphones size={14} /> अडियो सुन्नुहोस् ({book.audioDuration || 'अडियो संकलन'})
                    </button>
                  )}

                  {book.mediaType === 'videobook' && (
                    <button
                      className="pub-library-btn-card-preview"
                      style={{ background: '#f5f3ff', color: '#7c3aed', borderColor: '#ddd6fe' }}
                      onClick={() => setDetailBook(book)}
                    >
                      <Play size={14} /> भिडियो ई-कक्षा हेर्नुहोस् ({book.videoDuration || 'भिडियो'})
                    </button>
                  )}

                  {/* Ebook inline read trigger if file is present */}
                  {(book.mediaType === 'ebook' || book.mediaType === 'pdf') && (
                    <button
                      className="pub-library-btn-card-preview"
                      style={{ background: '#f0f9ff', color: '#0284c7', borderColor: '#bae6fd' }}
                      onClick={() => handleOpenReader(book)}
                    >
                      <FileText size={14} /> ई-पुस्तक अनलाइन पढ्नुहोस् {book.pages ? `(${book.pages} पृष्ठ)` : ''}
                    </button>
                  )}

                  <div className="pub-library-card-meta-row">
                    <div className="pub-library-card-location">
                      <MapPin size={13} />
                      {book.rackNo ? `र्याक: ${book.rackNo}, तख्ता: ${book.shelfNo || '-'}` : 'डिजिटल ई-रिपोजिटरी'}
                    </div>
                    <div>
                      {book.mediaType === 'physical'
                        ? `उपलब्ध: ${book.availableCopies ?? 1} प्रति`
                        : 'खुला अनलाइन पहुँच'}
                    </div>
                  </div>

                  {/* Card Action Buttons (Read-Only!) */}
                  <div className="pub-library-card-actions">
                    <button
                      className="pub-library-btn-primary"
                      onClick={() => setDetailBook(book)}
                      title="विस्तृत विवरण हेर्नुहोस्"
                    >
                      <Eye size={15} /> विस्तृत विवरण
                    </button>

                    <button
                      className="pub-library-btn-secondary"
                      onClick={() => setQrModalBook(book)}
                      title="पुस्तकालय प्रदर्शनी QR ट्याग"
                    >
                      <QrCode size={15} /> QR
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Community Branches Section ── */}
      <section style={{ backgroundColor: '#ffffff', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.03)', marginTop: '2rem' }}>
        <h3 style={{ color: '#0f172a', fontWeight: 800, fontSize: '1.25rem', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Building size={22} color="#0284c7" /> {settings?.palika_name || (tenantId === 'khadadevi' ? 'खाँडादेवी गाउँपालिका' : 'पाँचपोखरी थाङपाल गाउँपालिका')}का सामुदायिक पुस्तकालय तथा पठन शाखाहरू
        </h3>
        <p style={{ color: '#64748b', fontSize: '0.88rem', margin: '0 0 1.5rem 0' }}>
          भौतिक पुस्तक अध्ययन तथा पठन कक्षका लागि आफ्ना नजिकका वडास्तरीय पुस्तकालय केन्द्रहरूमा सम्पर्क गर्न सक्नुहुन्छ:
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {communityBranches.map(b => (
            <div key={b.name} style={{ padding: '1.25rem', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <h5 style={{ fontWeight: 700, margin: '0 0 0.5rem 0', color: '#0f172a', fontSize: '0.95rem' }}>{b.name}</h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', color: '#64748b', fontSize: '0.82rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#0284c7', fontWeight: 600 }}><MapPin size={14} /> {b.ward}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Clock size={14} /> {b.time}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>📞 {b.phone}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL 1: BOOK DETAILS MODAL (READ ONLY)
          ══════════════════════════════════════════════════════════════════════ */}
      {detailBook && (
        <div className="pub-library-modal-backdrop" onClick={handleCloseDetail}>
          <div className="pub-library-modal-card" onClick={e => e.stopPropagation()}>
            <div className="pub-library-modal-header">
              <div className="pub-library-modal-header-title">
                <BookOpen size={22} color="#0284c7" />
                <h3>पुस्तकको विस्तृत विवरण</h3>
                <span className="pub-library-badge-id" style={{ position: 'static' }}>
                  {detailBook.bookId}
                </span>
              </div>
              <button className="pub-library-modal-close" onClick={handleCloseDetail} title="बन्द गर्नुहोस्">
                <X size={18} />
              </button>
            </div>

            <div className="pub-library-modal-body">
              <div className="pub-library-detail-grid">
                {/* Left Column: Cover & Quick Actions */}
                <div className="pub-library-detail-cover-col">
                  <div className={`pub-library-detail-cover-box ${getCoverTheme(detailBook)}`}>
                    {detailBook.coverUrl ? (
                      <img 
                        src={detailBook.coverUrl} 
                        alt={detailBook.title} 
                        className="pub-library-detail-cover-img" 
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="pub-library-cover-placeholder">
                        {detailBook.mediaType === 'audiobook' ? (
                          <Headphones size={48} color="#ffffff" />
                        ) : detailBook.mediaType === 'videobook' ? (
                          <Video size={48} color="#ffffff" />
                        ) : (
                          <BookOpen size={48} color="#ffffff" />
                        )}
                        <div style={{ marginTop: '0.75rem', fontWeight: 700, fontSize: '0.85rem' }}>{detailBook.title}</div>
                      </div>
                    )}
                  </div>

                  {/* QR Box in Details */}
                  <div className="pub-library-detail-qr-box">
                    <button
                      className="pub-library-btn-secondary"
                      style={{ width: '100%', marginBottom: '0.5rem' }}
                      onClick={() => setQrModalBook(detailBook)}
                    >
                      <QrCode size={15} /> प्रदर्शनी QR ट्याग
                    </button>
                    <button
                      className="pub-library-btn-secondary"
                      style={{ width: '100%' }}
                      onClick={() => handleShareBook(detailBook)}
                    >
                      {copiedLink ? <Check size={15} color="#16a34a" /> : <Share2 size={15} />}
                      {copiedLink ? 'लिंक प्रतिलिपि भयो!' : 'पुस्तक सेयर / लिंक'}
                    </button>
                  </div>
                </div>

                {/* Right Column: Full Details */}
                <div className="pub-library-detail-info-col">
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      {getFormatBadge(detailBook.mediaType)}
                      <span className="pub-library-cat-badge">{detailBook.category || 'सामान्य'}</span>
                    </div>
                    <h2 className="pub-library-detail-title">{detailBook.title}</h2>
                    {detailBook.titleEnglish && (
                      <div style={{ fontSize: '0.9rem', color: '#64748b', fontStyle: 'italic', marginTop: '0.2rem' }}>
                        {detailBook.titleEnglish}
                      </div>
                    )}
                  </div>

                  {/* Synopsis */}
                  <div className="pub-library-detail-summary">
                    <strong>पुस्तक सारांश तथा विषय परिचय:</strong>
                    <p style={{ margin: '0.4rem 0 0 0' }}>
                      {detailBook.summary || 'यस पुस्तकको विस्तृत विवरण गाउँपालिकाको खुला पठन अभिलेखमा संकलित छ।'}
                    </p>
                  </div>

                  {/* Digital Document Reader Button if PDF or Digital URL */}
                  {(detailBook.digitalFileUrl || detailBook.mediaType === 'ebook') && (
                    <div className="pub-library-reader-box">
                      <div className="pub-library-reader-info">
                        <h4>📖 खुला ई-पुस्तक (डिजिटल दस्तावेज)</h4>
                        <p>यो पुस्तक डिजिटल प्रतिलिपिका रूपमा निःशुल्क अनलाइन अध्ययनका लागि खुला गरिएको छ।</p>
                      </div>
                      <button
                        type="button"
                        className="pub-library-reader-btn"
                        onClick={() => handleOpenReader(detailBook)}
                      >
                        <FileText size={16} /> अनलाइन पढ्नुहोस्
                      </button>
                    </div>
                  )}

                  {/* Audiobook Player if audioUrl */}
                  {detailBook.audioUrl && (
                    <div className="pub-library-audio-section">
                      <h4><Headphones size={18} /> अडियो संकलन (अडियोबुक सुन्नुहोस्)</h4>
                      <audio controls src={detailBook.audioUrl} preload="metadata">
                        Your browser does not support the audio element.
                      </audio>
                      {detailBook.narrator && (
                        <div style={{ fontSize: '0.8rem', color: '#0369a1', marginTop: '0.45rem', fontWeight: 600 }}>
                          🎙️ वाचक: {detailBook.narrator} | ⏱️ अवधि: {detailBook.audioDuration || '-'}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Video Player if videoUrl */}
                  {detailBook.videoUrl && (
                    <div className="pub-library-video-section">
                      {getYouTubeEmbedUrl(detailBook.videoUrl) ? (
                        <div className="pub-library-video-aspect">
                          <iframe
                            src={getYouTubeEmbedUrl(detailBook.videoUrl)!}
                            title={detailBook.title}
                            allowFullScreen
                          />
                        </div>
                      ) : (
                        <video controls style={{ width: '100%' }} src={detailBook.videoUrl}>
                          Your browser does not support video.
                        </video>
                      )}
                    </div>
                  )}

                  {/* Metadata Table */}
                  <div className="pub-library-meta-table">
                    <div className="pub-library-meta-item">
                      <span className="pub-library-meta-key">लेखक / सम्पादक</span>
                      <span className="pub-library-meta-val">{detailBook.author || '-'}</span>
                    </div>

                    <div className="pub-library-meta-item">
                      <span className="pub-library-meta-key">प्रकाशक</span>
                      <span className="pub-library-meta-val">{detailBook.publisher || '-'}</span>
                    </div>

                    <div className="pub-library-meta-item">
                      <span className="pub-library-meta-key">प्रकाशन वर्ष</span>
                      <span className="pub-library-meta-val">{detailBook.publicationYear || '२०८१'}</span>
                    </div>

                    <div className="pub-library-meta-item">
                      <span className="pub-library-meta-key">भाषा</span>
                      <span className="pub-library-meta-val">{detailBook.language || 'नेपाली'}</span>
                    </div>

                    <div className="pub-library-meta-item">
                      <span className="pub-library-meta-key">विधा / श्रेणी</span>
                      <span className="pub-library-meta-val">{detailBook.category || '-'}</span>
                    </div>

                    <div className="pub-library-meta-item">
                      <span className="pub-library-meta-key">संस्करण (Edition)</span>
                      <span className="pub-library-meta-val">{detailBook.edition || 'प्रथम'}</span>
                    </div>

                    <div className="pub-library-meta-item">
                      <span className="pub-library-meta-key">भौतिक स्थान / र्याक</span>
                      <span className="pub-library-meta-val">
                        {detailBook.rackNo ? `र्याक: ${detailBook.rackNo}, तख्ता: ${detailBook.shelfNo || '-'}` : 'डिजिटल खुला संग्रह'}
                      </span>
                    </div>

                    <div className="pub-library-meta-item">
                      <span className="pub-library-meta-key">प्रति संख्या</span>
                      <span className="pub-library-meta-val">
                        {detailBook.mediaType === 'physical'
                          ? `उपलब्ध: ${detailBook.availableCopies ?? 1} / कुल: ${detailBook.totalCopies ?? 1}`
                          : 'असीमित डिजिटल पहुँच'}
                      </span>
                    </div>

                    {detailBook.isbn && (
                      <div className="pub-library-meta-item">
                        <span className="pub-library-meta-key">ISBN नम्बर</span>
                        <span className="pub-library-meta-val">{detailBook.isbn}</span>
                      </div>
                    )}

                    <div className="pub-library-meta-item">
                      <span className="pub-library-meta-key">अधिकार / इजाजतपत्र</span>
                      <span className="pub-library-meta-val">{detailBook.copyrightStatus || 'सार्वजनिक खुला उपयोग'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL 2: INTEGRATED DIGITAL DOCUMENT READER MODAL
          ══════════════════════════════════════════════════════════════════════ */}
      {readingBook && (
        <div className="pub-library-modal-backdrop" onClick={handleCloseReader}>
          <div className="pub-library-doc-reader-card" onClick={e => e.stopPropagation()}>
            <div className="pub-library-doc-reader-toolbar">
              <div className="pub-library-doc-reader-title-area">
                <FileText size={20} color="#38bdf8" />
                <div>
                  <h4>{readingBook.title}</h4>
                  <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                    लेखक: {readingBook.author} | {readingBook.pages ? `${readingBook.pages} पृष्ठ` : 'डिजिटल दस्तावेज'}
                  </span>
                </div>
              </div>

              <div className="pub-library-doc-reader-controls">
                <button
                  className="pub-library-doc-btn"
                  onClick={() => setZoomLevel(prev => Math.max(70, prev - 15))}
                  title="सानो बनाउनुहोस्"
                >
                  <ZoomOut size={15} />
                </button>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, padding: '0 4px', color: '#e2e8f0' }}>
                  {zoomLevel}%
                </span>
                <button
                  className="pub-library-doc-btn"
                  onClick={() => setZoomLevel(prev => Math.min(160, prev + 15))}
                  title="ठूलो बनाउनुहोस्"
                >
                  <ZoomIn size={15} />
                </button>

                {readingBook.digitalFileUrl && (
                  <a
                    href={readingBook.digitalFileUrl}
                    download
                    target="_blank"
                    rel="noreferrer"
                    className="pub-library-doc-btn"
                    title="PDF डाउनलोड गर्नुहोस्"
                  >
                    <Download size={15} /> डाउनलोड
                  </a>
                )}

                <button
                  className="pub-library-doc-btn"
                  onClick={() => window.print()}
                  title="दस्तावेज प्रिन्ट गर्नुहोस्"
                >
                  <Printer size={15} /> प्रिन्ट
                </button>

                <button
                  className="pub-library-modal-close"
                  style={{ background: 'rgba(255,255,255,0.15)', color: '#ffffff' }}
                  onClick={handleCloseReader}
                  title="बन्द गर्नुहोस्"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Viewer or Fallback */}
            {readingBook.digitalFileUrl ? (
              <iframe
                src={readingBook.digitalFileUrl}
                title={readingBook.title}
                className="pub-library-doc-viewer-frame"
                style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
              />
            ) : (
              <div className="pub-library-doc-fallback-view">
                <BookOpen size={56} color="#0284c7" style={{ marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '1.25rem', color: '#0f172a', margin: '0 0 0.5rem 0' }}>
                  डिजिटल प्रतिलिपि अभिलेखीकरण हुँदैछ
                </h3>
                <p style={{ maxWidth: '520px', color: '#64748b', lineHeight: 1.6, margin: '0 auto 1.5rem auto' }}>
                  यस पुस्तक (<strong>{readingBook.title}</strong>) को पूर्ण डिजिटल फाइल हाल पालिकाको पठन सङ्ग्रहमा डिजिटाइजेसन प्रक्रियामा छ।
                  तत्काल अध्ययनका लागि नजिकको वडा सामुदायिक पुस्तकालयमा भौतिक प्रतिलिपि उपलब्ध छ।
                </p>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    className="pub-library-btn-primary"
                    onClick={() => {
                      handleCloseReader();
                      setDetailBook(readingBook);
                    }}
                  >
                    <Eye size={15} /> पुस्तक विवरण हेर्नुहोस्
                  </button>
                  <button
                    className="pub-library-btn-secondary"
                    onClick={() => {
                      handleCloseReader();
                      setShowSuggestModal(true);
                    }}
                  >
                    <MessageSquarePlus size={15} /> प्रतिलिपि अनुरोध गर्नुहोस्
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL 3: CITIZEN BOOK REQUEST / SUGGESTION MODAL
          ══════════════════════════════════════════════════════════════════════ */}
      {showSuggestModal && (
        <div className="pub-library-modal-backdrop" onClick={() => setShowSuggestModal(false)}>
          <div className="pub-library-modal-card" style={{ maxWidth: '560px' }} onClick={e => e.stopPropagation()}>
            <div className="pub-library-modal-header">
              <div className="pub-library-modal-header-title">
                <MessageSquarePlus size={22} color="#0284c7" />
                <h3>नयाँ पुस्तक माग तथा पठन सुझाव</h3>
              </div>
              <button className="pub-library-modal-close" onClick={() => setShowSuggestModal(false)} title="बन्द गर्नुहोस्">
                <X size={18} />
              </button>
            </div>

            <div className="pub-library-modal-body">
              {suggestSubmitted ? (
                <div className="pub-library-suggest-success">
                  <CheckCircle2 size={48} color="#16a34a" style={{ margin: '0 auto 0.75rem auto' }} />
                  <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '1.15rem' }}>सुझाव सफलतापूर्वक प्राप्त भयो!</h4>
                  <p style={{ margin: 0, fontSize: '0.88rem' }}>
                    तपाईंको पुस्तक माग पालिका पुस्तकालय व्यवस्थापन तथा शिक्षा शाखामा पठाइएको छ। धन्यवाद!
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSuggestSubmit} className="pub-library-suggest-form">
                  <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 0.5rem 0' }}>
                    पालिकाका पुस्तकालयहरूमा थप गर्नुपर्ने कुनै पुस्तक, शोधग्रन्थ वा अध्ययन सामग्री भए विवरण टिपाउनुहोस्:
                  </p>

                  <div className="pub-library-form-group">
                    <label>माग गरिएको पुस्तक वा सामग्रीको नाम *</label>
                    <input
                      type="text"
                      required
                      placeholder="उदा: कक्षा १२ अर्थशास्त्र गाइड, ह्योल्मो लोक इतिहास..."
                      value={suggestForm.title}
                      onChange={e => setSuggestForm({ ...suggestForm, title: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                    <div className="pub-library-form-group">
                      <label>लेखक / सम्पादक (थाहा भएमा)</label>
                      <input
                        type="text"
                        placeholder="लेखकको नाम..."
                        value={suggestForm.author}
                        onChange={e => setSuggestForm({ ...suggestForm, author: e.target.value })}
                      />
                    </div>

                    <div className="pub-library-form-group">
                      <label>विषय / विधा</label>
                      <select
                        value={suggestForm.category}
                        onChange={e => setSuggestForm({ ...suggestForm, category: e.target.value })}
                      >
                        <option value="शिक्षा तथा पाठ्यपुस्तक">शिक्षा तथा पाठ्यपुस्तक</option>
                        <option value="स्थानीय इतिहास तथा संस्कृति">स्थानीय इतिहास तथा संस्कृति</option>
                        <option value="साहित्य तथा कविता">साहित्य तथा कविता</option>
                        <option value="कृषि तथा प्रविधि">कृषि तथा प्रविधि</option>
                        <option value="कानून तथा सुशासन">कानून तथा सुशासन</option>
                        <option value="अन्य">अन्य</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                    <div className="pub-library-form-group">
                      <label>तपाईंको नाम</label>
                      <input
                        type="text"
                        placeholder="नाम..."
                        value={suggestForm.name}
                        onChange={e => setSuggestForm({ ...suggestForm, name: e.target.value })}
                      />
                    </div>

                    <div className="pub-library-form-group">
                      <label>सम्पर्क नम्बर / इमेल</label>
                      <input
                        type="text"
                        placeholder="फोन नं. वा इमेल..."
                        value={suggestForm.contact}
                        onChange={e => setSuggestForm({ ...suggestForm, contact: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="pub-library-form-group">
                    <label>मागको आवश्यकता / कारण</label>
                    <textarea
                      rows={3}
                      placeholder="यो पुस्तक विद्यार्थी सिकाई, अनुसन्धान वा जनचेतनाका लागि किन आवश्यक छ खुलाउनुहोस्..."
                      value={suggestForm.reason}
                      onChange={e => setSuggestForm({ ...suggestForm, reason: e.target.value })}
                    />
                  </div>

                  <button
                    type="submit"
                    className="pub-library-btn-primary"
                    style={{ padding: '0.85rem', width: '100%', marginTop: '0.5rem' }}
                  >
                    <Send size={16} /> माग तथा सुझाव पेश गर्नुहोस्
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL 4: PRINTABLE SCANNABLE QR EXHIBIT TAG MODAL
          ══════════════════════════════════════════════════════════════════════ */}
      {qrModalBook && (
        <div className="pub-library-modal-backdrop" onClick={handleCloseQrModal}>
          <div className="pub-library-modal-card" style={{ maxWidth: '520px' }} onClick={e => e.stopPropagation()}>
            <div className="pub-library-modal-header">
              <div className="pub-library-modal-header-title">
                <QrCode size={22} color="#0284c7" />
                <h3>पुस्तकालय क्याटलग QR कोड</h3>
              </div>
              <button className="pub-library-modal-close" onClick={handleCloseQrModal} title="बन्द गर्नुहोस्">
                <X size={18} />
              </button>
            </div>

            <div className="pub-library-qr-modal-body">
              {/* The printable exhibit tag container */}
              <div id="pubLibraryExhibitTag" className="pub-library-exhibit-tag-card">
                <div className="pub-library-tag-palika-header">
                  <h5>पाँचपोखरी थाङपाल गाउँपालिका</h5>
                  <h4>सार्वजनिक डिजिटल तथा खुला पुस्तकालय</h4>
                  <p>गाउँकार्यपालिकाको कार्यालय, सिन्धुपाल्चोक</p>
                </div>

                <div className="pub-library-tag-qr-frame">
                  {qrDataUrl ? (
                    <img src={qrDataUrl} alt={`QR Code for ${qrModalBook.title}`} />
                  ) : (
                    <div style={{ padding: '2rem', color: '#64748b' }}>QR कोड बनाउँदै...</div>
                  )}
                </div>

                <div className="pub-library-tag-book-title">{qrModalBook.title}</div>

                <div className="pub-library-tag-meta-list">
                  <div><strong>पुस्तक कोड:</strong> {qrModalBook.bookId}</div>
                  <div><strong>लेखक:</strong> {qrModalBook.author || 'अज्ञात'}</div>
                  <div><strong>श्रेणी:</strong> {qrModalBook.category || '-'}</div>
                  <div>
                    <strong>स्थान / र्याक:</strong>{' '}
                    {qrModalBook.rackNo ? `र्याक नं. ${qrModalBook.rackNo}, तख्ता: ${qrModalBook.shelfNo || '-'}` : 'डिजिटल ई-रिपोजिटरी'}
                  </div>
                  <div><strong>ढाँचा:</strong> {qrModalBook.mediaType === 'ebook' ? 'ई-पुस्तक (PDF)' : qrModalBook.mediaType === 'physical' ? 'भौतिक पुस्तक' : qrModalBook.mediaType}</div>
                </div>

                <div className="pub-library-tag-scan-note">
                  📱 क्यामेरा वा QR स्क्यानरबाट स्क्यान गरी पुस्तकको विस्तृत विवरण र डिजिटल प्रतिलिपि अध्ययन गर्नुहोस्।
                </div>
              </div>

              {/* Action buttons */}
              <div className="pub-library-qr-actions-row">
                <button className="pub-library-btn-primary" onClick={handlePrintTag}>
                  <Printer size={16} /> ट्याग प्रिन्ट गर्नुहोस्
                </button>
                <button className="pub-library-btn-secondary" onClick={handleDownloadQr}>
                  <Download size={16} /> QR डाउनलोड
                </button>
                <button className="pub-library-btn-secondary" onClick={() => handleShareBook(qrModalBook)}>
                  {copiedLink ? <Check size={16} color="#16a34a" /> : <Copy size={16} />}
                  {copiedLink ? 'प्रतिलिपि भयो' : 'लिंक कपी'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Library;
