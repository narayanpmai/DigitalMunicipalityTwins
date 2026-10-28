import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sectoralApi } from '../../api/sectoral';
import { api } from '../../api/client';
import { useTenant } from '../../context/TenantContext';
import type { LibraryBook, BorrowRecord } from '../../types/library';
import { NepaliDatePicker } from '../../components/common/NepaliDatePicker';
import { adToBs } from '../../utils/nepaliCalendar';
import {
  BookOpen,
  Headphones,
  Video,
  FileText,
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Layers,
  MapPin,
  UploadCloud,
  Loader2,
  Play,
  X,
  Calendar,
  Sparkles,
  RotateCcw,
  ExternalLink,
  BookMarked,
  Info,
  Archive,
  Download,
  FileSpreadsheet,
} from 'lucide-react';
import { exportLibraryBooksData } from '../../utils/exportUtils';
import './LibraryPage.css';

const CATEGORY_OPTIONS = [
  'साहित्य',
  'इतिहास तथा संस्कृति',
  'पाठ्यपुस्तक तथा शिक्षा',
  'बालबालिका',
  'कृषि, प्रविधि तथा सीप',
  'धार्मिक तथा आध्यात्मिक',
  'कानुन तथा स्थानीय शासन',
  'विज्ञान तथा वातावरण',
  'स्वास्थ्य तथा चिकित्सा',
  'विविध',
];

const LANGUAGE_OPTIONS = [
  { value: 'नेपाली', label: 'नेपाली' },
  { value: 'ह्योल्मो', label: 'ह्योल्मो / तामाङ' },
  { value: 'नेवारी', label: 'नेवारी / नेपालभाषा' },
  { value: 'अंग्रेजी', label: 'English' },
  { value: 'अन्य', label: 'अन्य' },
];

export const LibraryPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { tenantId, settings } = useTenant();

  // Navigation & Filtering
  const [activeTab, setActiveTab] = useState<'catalog' | 'circulation' | 'tracking'>('catalog');
  const [trackingCitizenId, setTrackingCitizenId] = useState<string>('');
  const [mediaFilter, setMediaFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [showBookModal, setShowBookModal] = useState(false);
  const [isEditingBook, setIsEditingBook] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [selectedBookForIssue, setSelectedBookForIssue] = useState<LibraryBook | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewBook, setPreviewBook] = useState<LibraryBook | null>(null);

  // Upload State
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Form State for Book Entry
  const initialBookFormData = {
    id: '',
    bookId: '',
    title: '',
    author: '',
    publisher: '',
    publicationYear: '२०८१',
    edition: '१',
    isbn: '',
    language: 'नेपाली',
    category: 'साहित्य',
    subject: '',
    mediaType: 'physical',
    totalCopies: 5,
    availableCopies: 5,
    rackNo: 'R-01',
    shelfNo: 'S-1',
    pages: 150,
    coverUrl: '',
    digitalFileUrl: '',
    audioUrl: '',
    audioDuration: '',
    videoUrl: '',
    videoDuration: '',
    copyrightStatus: 'Municipality Owned',
    summary: '',
    keywords: '',
    verificationStatus: 'Published',
  };

  const [bookFormData, setBookFormData] = useState(initialBookFormData);

  // Form State for Issue / Borrow
  const initialIssueData = {
    bookId: '',
    borrowerName: '',
    borrowerCitizenId: '',
    borrowerType: 'citizen',
    borrowerContact: '',
    borrowerCardNo: '',
    borrowDate: adToBs(new Date().toISOString().split('T')[0]),
    dueDate: adToBs(new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0]),
    remarks: '',
  };
  const [issueFormData, setIssueFormData] = useState(initialIssueData);

  // Queries
  const { data: rawBooks = [], isLoading: isLoadingBooks } = useQuery({
    queryKey: ['library-books', tenantId],
    queryFn: () => sectoralApi.getLibraryBooks(),
  });

  const { data: stats } = useQuery({
    queryKey: ['library-stats', tenantId],
    queryFn: () => sectoralApi.getLibraryStats(),
  });

  const { data: rawBorrows = [], isLoading: isLoadingBorrows } = useQuery({
    queryKey: ['library-borrows', tenantId],
    queryFn: () => sectoralApi.getLibraryBorrows(),
  });

  const { data: rawCitizens = [], isLoading: isLoadingCitizens } = useQuery({
    queryKey: ['library-citizens', tenantId],
    queryFn: async () => {
      try {
        const res = await api.get('/citizens?status=VERIFIED');
        return res; // api.get already unwraps res.data
      } catch (err) {
        console.error('Error fetching citizens', err);
        return [];
      }
    },
  });

  const libraryMembers = useMemo(() => {
    if (!Array.isArray(rawCitizens)) return [];
    return rawCitizens.filter((c: any) => c.servicePurpose && c.servicePurpose.includes('पुस्तकालय'));
  }, [rawCitizens]);

  // Normalization
  const safeBooks: LibraryBook[] = useMemo(() => {
    if (!Array.isArray(rawBooks)) return [];
    return rawBooks.map((b: any, idx: number) => ({
      id: b.id || `bk-${idx}`,
      bookId: b.bookId || `LIB-${String(idx + 1).padStart(4, '0')}`,
      title: b.title || b.titleNepali || 'शीर्षक विहीन पुस्तक',
      titleNepali: b.titleNepali || b.title,
      author: b.author || 'अज्ञात लेखक',
      publisher: b.publisher || 'पालिका पुस्तकालय',
      publicationYear: b.publicationYear || b.publishedYear || '२०८०',
      edition: b.edition || '१',
      isbn: b.isbn || '',
      language: b.language || 'नेपाली',
      category: b.category || 'साहित्य',
      subject: b.subject || '',
      mediaType: b.mediaType || 'physical',
      totalCopies: Number(b.totalCopies) || 1,
      availableCopies: Number(b.availableCopies !== undefined ? b.availableCopies : b.totalCopies) || 1,
      rackNo: b.rackNo || 'R-01',
      shelfNo: b.shelfNo || 'S-1',
      pages: Number(b.pages) || undefined,
      coverUrl: b.coverUrl || b.coverImageUrl || '',
      digitalFileUrl: b.digitalFileUrl || b.pdfUrl || '',
      audioUrl: b.audioUrl || b.mediaUrl || '',
      audioDuration: b.audioDuration || (b.durationMinutes ? `${b.durationMinutes} मिनेट` : ''),
      videoUrl: b.videoUrl || '',
      videoDuration: b.videoDuration || '',
      copyrightStatus: b.copyrightStatus || 'Municipality Owned',
      summary: b.summary || b.description || '',
      keywords: b.keywords || '',
      verificationStatus: b.verificationStatus || 'Published',
      createdAt: b.createdAt,
    }));
  }, [rawBooks]);

  const safeBorrows: BorrowRecord[] = useMemo(() => {
    if (!Array.isArray(rawBorrows)) return [];
    return rawBorrows.map((r: any) => ({
      id: r.id,
      bookId: r.bookId,
      borrowerName: r.borrowerName,
      borrowerContact: r.borrowerContact || '',
      borrowerCardNo: r.borrowerCardNo || '',
      borrowDate: r.borrowDate || '',
      dueDate: r.dueDate || '',
      returnDate: r.returnDate || '',
      status: r.status || 'issued',
      fineAmount: r.fineAmount || 0,
      remarks: r.remarks || '',
      createdAt: r.createdAt,
      book: r.book || safeBooks.find((b) => b.id === r.bookId),
    }));
  }, [rawBorrows, safeBooks]);

  // Mutations
  const createBookMutation = useMutation({
    mutationFn: (data: Partial<LibraryBook>) => sectoralApi.createLibraryBook({ ...data, tenant_id: tenantId } as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-books', tenantId] });
      queryClient.invalidateQueries({ queryKey: ['library-stats', tenantId] });
      setShowBookModal(false);
      setBookFormData(initialBookFormData);
    },
    onError: (err: any) => {
      alert(`त्रुटि: ${err?.message || 'पुस्तक दर्ता गर्न सकिएन'}`);
    },
  });

  const updateBookMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<LibraryBook> }) =>
      sectoralApi.updateLibraryBook(id, { ...data, tenant_id: tenantId } as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-books', tenantId] });
      queryClient.invalidateQueries({ queryKey: ['library-stats', tenantId] });
      setShowBookModal(false);
      setBookFormData(initialBookFormData);
    },
    onError: (err: any) => {
      alert(`त्रुटि: ${err?.message || 'पुस्तक सम्पादन गर्न सकिएन'}`);
    },
  });

  const deleteBookMutation = useMutation({
    mutationFn: (id: string) => sectoralApi.deleteLibraryBook(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-books', tenantId] });
      queryClient.invalidateQueries({ queryKey: ['library-stats', tenantId] });
    },
    onError: (err: any) => {
      alert(`त्रुटि: ${err?.message || 'पुस्तक मेटाउन सकिएन'}`);
    },
  });

  const issueBorrowMutation = useMutation({
    mutationFn: (data: any) => sectoralApi.issueBookBorrow({ ...data, tenant_id: tenantId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-borrows', tenantId] });
      queryClient.invalidateQueries({ queryKey: ['library-books', tenantId] });
      queryClient.invalidateQueries({ queryKey: ['library-stats', tenantId] });
      setShowIssueModal(false);
      setSelectedBookForIssue(null);
      setIssueFormData(initialIssueData);
    },
    onError: (err: any) => {
      alert(`त्रुटि: ${err?.message || 'पुस्तक वितरण रेकर्ड गर्न सकिएन'}`);
    },
  });

  const returnBorrowMutation = useMutation({
    mutationFn: (borrowId: string) => sectoralApi.returnBookBorrow(borrowId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-borrows', tenantId] });
      queryClient.invalidateQueries({ queryKey: ['library-books', tenantId] });
      queryClient.invalidateQueries({ queryKey: ['library-stats', tenantId] });
    },
    onError: (err: any) => {
      alert(`त्रुटि: ${err?.message || 'पुस्तक फिर्ता रेकर्ड गर्न सकिएन'}`);
    },
  });

  // File Upload Handler (Native Drag/Browse to backend)
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldKey: 'coverUrl' | 'digitalFileUrl' | 'audioUrl' | 'videoUrl'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    e.target.value = '';
    setUploadingField(fieldKey);
    setUploadError(null);

    const uploadFormData = new FormData();
    uploadFormData.append('file', file);

    try {
      const res = await api.post<{ url: string; filename: string }>('/media/upload', uploadFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res && res.url) {
        setBookFormData((prev) => ({ ...prev, [fieldKey]: res.url }));
      }
    } catch (err: any) {
      console.error('File upload error:', err);
      const msg = err?.response?.data?.message || err?.message || 'फाइल अपलोड गर्दा समस्या आयो';
      setUploadError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setUploadingField(null);
    }
  };

  // Open Book Modal (Add / Edit)
  const handleOpenAddBook = () => {
    setIsEditingBook(false);
    setBookFormData(initialBookFormData);
    setShowBookModal(true);
  };

  const handleOpenEditBook = (book: LibraryBook) => {
    setIsEditingBook(true);
    setBookFormData({
      id: book.id,
      bookId: book.bookId,
      title: book.title,
      author: book.author,
      publisher: book.publisher || '',
      publicationYear: book.publicationYear || '२०८०',
      edition: book.edition || '१',
      isbn: book.isbn || '',
      language: book.language || 'नेपाली',
      category: book.category || 'साहित्य',
      subject: book.subject || '',
      mediaType: book.mediaType || 'physical',
      totalCopies: book.totalCopies || 1,
      availableCopies: book.availableCopies || 1,
      rackNo: book.rackNo || 'R-01',
      shelfNo: book.shelfNo || 'S-1',
      pages: book.pages || 100,
      coverUrl: book.coverUrl || '',
      digitalFileUrl: book.digitalFileUrl || '',
      audioUrl: book.audioUrl || '',
      audioDuration: book.audioDuration || '',
      videoUrl: book.videoUrl || '',
      videoDuration: book.videoDuration || '',
      copyrightStatus: book.copyrightStatus || 'Municipality Owned',
      summary: book.summary || '',
      keywords: book.keywords || '',
      verificationStatus: book.verificationStatus || 'Published',
    });
    setShowBookModal(true);
  };

  // Open Issue Modal
  const handleOpenIssueModal = (book?: LibraryBook) => {
    if (book) {
      setSelectedBookForIssue(book);
      setIssueFormData((prev) => ({ ...prev, bookId: book.id }));
    } else if (safeBooks.length > 0) {
      const firstAvail = safeBooks.find((b) => b.availableCopies > 0) || safeBooks[0];
      setSelectedBookForIssue(firstAvail);
      setIssueFormData((prev) => ({ ...prev, bookId: firstAvail.id }));
    }
    setShowIssueModal(true);
  };

  // Save Book Handler
  const handleSaveBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookFormData.title.trim() || !bookFormData.author.trim()) {
      alert('कृपया पुस्तकको नाम र लेखकको नाम अनिवार्य भर्नुहोस्।');
      return;
    }

    if (isEditingBook && bookFormData.id) {
      updateBookMutation.mutate({ id: bookFormData.id, data: bookFormData });
    } else {
      createBookMutation.mutate(bookFormData);
    }
  };

  // Save Borrow Handler
  const handleSaveBorrow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueFormData.bookId || !issueFormData.borrowerName.trim()) {
      alert('कृपया पुस्तक र पाठकको नाम अनिवार्य भर्नुहोस्।');
      return;
    }
    issueBorrowMutation.mutate(issueFormData);
  };

  // Filtered Books
  const filteredBooks = useMemo(() => {
    return safeBooks.filter((b) => {
      const term = (searchTerm || '').toLowerCase();
      const titleText = (b.title || '').toLowerCase();
      const authText = (b.author || '').toLowerCase();
      const isbnText = (b.isbn || '').toLowerCase();
      const codeText = (b.bookId || '').toLowerCase();

      const matchesSearch =
        !term ||
        titleText.includes(term) ||
        authText.includes(term) ||
        isbnText.includes(term) ||
        codeText.includes(term);

      const matchesMedia =
        mediaFilter === 'all' ||
        (mediaFilter === 'physical' && b.mediaType === 'physical') ||
        (mediaFilter === 'ebook' && b.mediaType === 'ebook') ||
        (mediaFilter === 'audiobook' && b.mediaType === 'audiobook') ||
        (mediaFilter === 'videobook' && b.mediaType === 'videobook');

      const matchesCategory = categoryFilter === 'all' || b.category === categoryFilter;

      return matchesSearch && matchesMedia && matchesCategory;
    });
  }, [safeBooks, searchTerm, mediaFilter, categoryFilter]);

  // Statistics calculation
  const totalBooksCount = safeBooks.length;
  const physicalBooksCount = safeBooks.filter((b) => b.mediaType === 'physical').length;
  const ebooksCount = safeBooks.filter((b) => b.mediaType === 'ebook').length;
  const audioBooksCount = safeBooks.filter((b) => b.mediaType === 'audiobook').length;
  const activeBorrowsCount = safeBorrows.filter((r) => r.status === 'issued' || r.status === 'borrowed').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '3rem' }}>
      {/* ── HEADER & PRIMARY ACTIONS ── */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          backgroundColor: '#ffffff',
          padding: '1.25rem 1.5rem',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: '#eff6ff',
              color: '#1d4ed8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <BookOpen size={28} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              सार्वजनिक डिजिटल तथा खुला पुस्तकालय
            </h1>
            <p style={{ fontSize: '0.84rem', color: '#64748b', margin: '3px 0 0 0' }}>
              {settings?.palika_name || (tenantId === 'khadadevi' ? 'खाँडादेवी गाउँपालिका' : 'पाँचपोखरी थाङपाल गाउँपालिका')}: पुस्तक सूचीकरण, र्याक व्यवस्थापन, ई-कक्षा तथा सापटी वितरण
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => exportLibraryBooksData(filteredBooks, 'xlsx')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#10b981',
              color: '#ffffff',
              padding: '9px 16px',
              borderRadius: '8px',
              border: '1px solid #059669',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(16, 185, 129, 0.25)',
            }}
            title="वर्तमान खोज तथा विधा अनुसार पुस्तक क्याटलग एक्सेल (.xlsx) मा डाउनलोड गर्नुहोस्"
          >
            <FileSpreadsheet size={16} />
            <span>एक्सेल (.xlsx) निर्यात</span>
          </button>

          <button
            type="button"
            onClick={() => exportLibraryBooksData(filteredBooks, 'csv')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              backgroundColor: '#ffffff',
              color: '#334155',
              padding: '9px 14px',
              borderRadius: '8px',
              border: '1.5px solid #cbd5e1',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
            title="CSV ढाँचामा डाउनलोड गर्नुहोस्"
          >
            <Download size={15} />
            <span>CSV</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenIssueModal()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#059669',
              color: '#ffffff',
              padding: '9px 16px',
              borderRadius: '8px',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(5, 150, 105, 0.2)',
            }}
          >
            <BookMarked size={17} />
            <span>पुस्तक वितरण / सापटी दिनुहोस्</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAddBook}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#1e40af',
              color: '#ffffff',
              padding: '9px 18px',
              borderRadius: '8px',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(30, 64, 175, 0.2)',
            }}
          >
            <Plus size={18} />
            <span>नयाँ पुस्तक दर्ता गर्नुहोस्</span>
          </button>

          <a
            href="/library"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#eff6ff',
              color: '#1d4ed8',
              padding: '9px 16px',
              borderRadius: '8px',
              border: '1px solid #bfdbfe',
              fontWeight: 700,
              fontSize: '0.85rem',
              textDecoration: 'none',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            }}
            title="सार्वजनिक खुला पठन क्याटलग नयाँ ट्याबमा खोल्नुहोस्"
          >
            <ExternalLink size={16} />
            <span>सार्वजनिक पोर्टल</span>
          </a>
        </div>
      </div>

      {/* ── KPI METRICS CARDS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem' }}>
        <div
          className="dt-card"
          style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem' }}
        >
          <div style={{ padding: '0.75rem', borderRadius: '10px', backgroundColor: '#eff6ff', color: '#1d4ed8' }}>
            <BookOpen size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>कुल पुस्तक शीर्षकहरू</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>{totalBooksCount} प्रति</div>
          </div>
        </div>

        <div
          className="dt-card"
          style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem' }}
        >
          <div style={{ padding: '0.75rem', borderRadius: '10px', backgroundColor: '#f0fdf4', color: '#15803d' }}>
            <Archive size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>भौतिक पुस्तक (Physical)</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>{physicalBooksCount} वटा</div>
          </div>
        </div>

        <div
          className="dt-card"
          style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem' }}
        >
          <div style={{ padding: '0.75rem', borderRadius: '10px', backgroundColor: '#f5f3ff', color: '#7c3aed' }}>
            <Headphones size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>अडियोबुकहरू (Audiobooks)</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>{audioBooksCount} वटा</div>
          </div>
        </div>

        <div
          className="dt-card"
          style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem' }}
        >
          <div style={{ padding: '0.75rem', borderRadius: '10px', backgroundColor: '#fffbeb', color: '#b45309' }}>
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>हाल वितरित (Active Borrows)</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#b45309' }}>{activeBorrowsCount} जना</div>
          </div>
        </div>
      </div>

      {/* ── 3-COLUMN MODERN BALANCED TAB NAVIGATION ── */}
      <div className="lib-tabs-container">
        <div className="lib-tabs-grid">
          {/* Tab 1: Catalog */}
          <button
            type="button"
            className={`lib-tab-card ${activeTab === 'catalog' ? 'active active-catalog' : ''}`}
            onClick={() => setActiveTab('catalog')}
          >
            <div className="lib-tab-icon-box">
              <BookOpen size={24} />
            </div>
            <div className="lib-tab-content">
              <div className="lib-tab-header-row">
                <span className="lib-tab-title">ई-पुस्तकालय क्याटलग</span>
                <span className="lib-tab-badge">{safeBooks.length} प्रति</span>
              </div>
              <p className="lib-tab-sub">डिजिटल पुस्तक, अडियो तथा शोधग्रन्थ सङ्ग्रह</p>
            </div>
            <div className="lib-tab-indicator" />
          </button>

          {/* Tab 2: Circulation */}
          <button
            type="button"
            className={`lib-tab-card ${activeTab === 'circulation' ? 'active active-circulation' : ''}`}
            onClick={() => setActiveTab('circulation')}
          >
            <div className="lib-tab-icon-box">
              <Users size={24} />
            </div>
            <div className="lib-tab-content">
              <div className="lib-tab-header-row">
                <span className="lib-tab-title">किताब वितरण तथा फिर्ता</span>
                <span className="lib-tab-badge">{safeBorrows.length} अभिलेख</span>
              </div>
              <p className="lib-tab-sub">पुस्तक जारी, नवीकरण, फिर्ता तथा जरिवाना</p>
            </div>
            <div className="lib-tab-indicator" />
          </button>

          {/* Tab 3: Tracking */}
          <button
            type="button"
            className={`lib-tab-card ${activeTab === 'tracking' ? 'active active-tracking' : ''}`}
            onClick={() => setActiveTab('tracking')}
          >
            <div className="lib-tab-icon-box">
              <Search size={24} />
            </div>
            <div className="lib-tab-content">
              <div className="lib-tab-header-row">
                <span className="lib-tab-title">पाठक ट्र्याकिङ</span>
                <span className="lib-tab-badge">लाइभ खोज</span>
              </div>
              <p className="lib-tab-sub">कार्ड नं., नाम वा फोनबाट सदस्यता खोजी</p>
            </div>
            <div className="lib-tab-indicator" />
          </button>
        </div>

        {/* ── CONTEXTUAL ACTIVE TOOLBAR (BELOW TABS) ── */}
        <div className="lib-toolbar-card">
          <div className="lib-toolbar-top-row">
            {/* Format Filter (Catalog Only) */}
            {activeTab === 'catalog' && (
              <select
                className="lib-format-select"
                value={mediaFilter}
                onChange={(e) => setMediaFilter(e.target.value)}
              >
                <option value="all">सबै ढाँचा (All Formats)</option>
                <option value="physical">📚 भौतिक पुस्तक</option>
                <option value="ebook">📄 ई-पुस्तक (PDF)</option>
                <option value="audiobook">🎧 अडियोबुक (Audio)</option>
                <option value="videobook">🎬 भिडियो ई-कक्षा</option>
              </select>
            )}

            {/* Search Box */}
            <div className="lib-search-box">
              <Search size={17} className="lib-search-icon" />
              <input
                type="text"
                className="lib-search-input"
                placeholder={
                  activeTab === 'catalog'
                    ? 'पुस्तकको नाम, लेखक, ISBN वा कोड खोज्नुहोस्...'
                    : activeTab === 'circulation'
                    ? 'पाठकको नाम, सम्पर्क, कार्ड नं वा पुस्तक खोज्नुहोस्...'
                    : 'पाठकको कार्ड नम्बर वा फोनबाट विवरण खोज्नुहोस्...'
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  type="button"
                  className="lib-search-clear"
                  onClick={() => setSearchTerm('')}
                  title="खोज खाली गर्नुहोस्"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Right side actions / summary */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {activeTab === 'catalog' && (
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                  प्रदर्शित: <strong style={{ color: '#0f172a' }}>{filteredBooks.length}</strong> प्रति
                </span>
              )}
              {activeTab === 'circulation' && (
                <button
                  type="button"
                  onClick={() => handleOpenIssueModal()}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: '#059669',
                    color: '#ffffff',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                  }}
                >
                  <Plus size={16} />
                  <span>सापटी जारी</span>
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Pills (Catalog Tab Only) */}
          {activeTab === 'catalog' && (
            <div className="lib-categories-bar">
              <span className="lib-category-label">विधा:</span>
              <button
                type="button"
                className={`lib-cat-pill ${categoryFilter === 'all' ? 'active' : ''}`}
                onClick={() => setCategoryFilter('all')}
              >
                सबै ({safeBooks.length})
              </button>
              {CATEGORY_OPTIONS.map((cat) => {
                const count = safeBooks.filter((x) => x.category === cat).length;
                return (
                  <button
                    key={cat}
                    type="button"
                    className={`lib-cat-pill ${categoryFilter === cat ? 'active' : ''}`}
                    onClick={() => setCategoryFilter(cat)}
                  >
                    <span>{cat}</span>
                    {count > 0 && <span style={{ opacity: 0.85, fontSize: '0.7rem' }}>({count})</span>}
                  </button>
                );
              })}

              {(searchTerm || mediaFilter !== 'all' || categoryFilter !== 'all') && (
                <button
                  type="button"
                  className="lib-btn-reset-filters"
                  onClick={() => {
                    setSearchTerm('');
                    setMediaFilter('all');
                    setCategoryFilter('all');
                  }}
                  title="सबै फिल्टरहरू रिसेट गर्नुहोस्"
                >
                  <X size={13} />
                  <span>फिल्टर रिसेट</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── TAB 1: CATALOG GRID VIEW ── */}
      {activeTab === 'catalog' && (
        <>
          {filteredBooks.length === 0 ? (
            <div
              className="dt-card"
              style={{ padding: '3rem 1rem', textAlign: 'center', color: '#64748b' }}
            >
              <BookOpen size={42} style={{ margin: '0 auto 10px auto', opacity: 0.4 }} />
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#334155' }}>कुनै पुस्तक फेला परेन</div>
              <p style={{ fontSize: '0.85rem' }}>खोज शब्द वा विधा फिल्टर परिवर्तन गर्नुहोस् वा नयाँ पुस्तक दर्ता गर्नुहोस्।</p>
              <button
                type="button"
                onClick={handleOpenAddBook}
                style={{
                  marginTop: '12px',
                  padding: '7px 16px',
                  borderRadius: '6px',
                  backgroundColor: '#1e40af',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                }}
              >
                + नयाँ पुस्तक दर्ता गर्नुहोस्
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
              {filteredBooks.map((b) => {
                const isPhysical = b.mediaType === 'physical';
                const isAudio = b.mediaType === 'audiobook';
                const isVideo = b.mediaType === 'videobook';
                const isEbook = b.mediaType === 'ebook';

                const badgeColor = isAudio
                  ? { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0', icon: <Headphones size={13} />, label: 'श्रव्य-पुस्तक' }
                  : isVideo
                  ? { bg: '#f3e8ff', text: '#7e22ce', border: '#e9d5ff', icon: <Video size={13} />, label: 'भिडियो ई-कक्षा' }
                  : isEbook
                  ? { bg: '#e0f2fe', text: '#0369a1', border: '#bae6fd', icon: <FileText size={13} />, label: 'ई-पुस्तक (PDF)' }
                  : { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe', icon: <BookOpen size={13} />, label: 'भौतिक पुस्तक' };

                return (
                  <div
                    key={b.id}
                    className="dt-card"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '0.85rem',
                      padding: '1.15rem',
                      borderTop: `4px solid ${
                        isAudio ? '#10b981' : isVideo ? '#8b5cf6' : isEbook ? '#0284c7' : '#2563eb'
                      }`,
                    }}
                  >
                    <div>
                      {/* Top Code & Format Badge */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            backgroundColor: badgeColor.bg,
                            color: badgeColor.text,
                            border: `1px solid ${badgeColor.border}`,
                          }}
                        >
                          {badgeColor.icon}
                          <span>{badgeColor.label}</span>
                        </span>

                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '4px' }}>
                          {b.bookId}
                        </span>
                      </div>

                      {/* Cover & Details Layout */}
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        {b.coverUrl ? (
                          <img
                            src={b.coverUrl}
                            alt={b.title}
                            style={{
                              width: '70px',
                              height: '95px',
                              objectFit: 'cover',
                              borderRadius: '6px',
                              border: '1px solid #e2e8f0',
                              flexShrink: 0,
                            }}
                            onError={(e) => {
                              (e.target as any).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: '70px',
                              height: '95px',
                              borderRadius: '6px',
                              backgroundColor: '#f8fafc',
                              border: '1px dashed #cbd5e1',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#94a3b8',
                              flexShrink: 0,
                            }}
                          >
                            <BookOpen size={24} />
                          </div>
                        )}

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h3
                            style={{
                              fontSize: '0.98rem',
                              fontWeight: 700,
                              color: '#0f172a',
                              marginBottom: '0.25rem',
                              lineHeight: 1.35,
                            }}
                          >
                            {b.title}
                          </h3>
                          <div style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '4px' }}>
                            लेखक: <strong style={{ color: '#1e293b' }}>{b.author}</strong>
                          </div>
                          <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                            विधा: <strong>{b.category}</strong>
                          </div>
                          {b.rackNo && (
                            <div style={{ fontSize: '0.72rem', color: '#0369a1', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <MapPin size={11} />
                              <span>र्याक: {b.rackNo} / दराज: {b.shelfNo || '-'}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Summary or description */}
                      {b.summary && (
                        <p
                          style={{
                            fontSize: '0.78rem',
                            color: '#64748b',
                            marginTop: '8px',
                            lineHeight: 1.4,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {b.summary}
                        </p>
                      )}
                    </div>

                    {/* Footer Actions & Availability */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingTop: '0.75rem',
                        borderTop: '1px solid #f1f5f9',
                        flexWrap: 'wrap',
                        gap: '6px',
                      }}
                    >
                      <div style={{ fontSize: '0.78rem', color: '#475569' }}>
                        उपलब्ध: <strong style={{ color: b.availableCopies > 0 ? '#166534' : '#b91c1c' }}>{b.availableCopies}</strong> / {b.totalCopies} प्रति
                      </div>

                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        {/* Media preview button */}
                        {(b.digitalFileUrl || b.audioUrl || b.videoUrl) && (
                          <button
                            type="button"
                            onClick={() => {
                              setPreviewBook(b);
                              setShowPreviewModal(true);
                            }}
                            title="अध्ययन / सुन्नुहोस्"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '5px 10px',
                              borderRadius: '6px',
                              backgroundColor: isAudio ? '#10b981' : isVideo ? '#8b5cf6' : '#0284c7',
                              color: '#ffffff',
                              border: 'none',
                              fontSize: '0.76rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            <Play size={12} />
                            <span>{isAudio ? 'सुन्नुहोस्' : isVideo ? 'हेर्नुहोस्' : 'पढ्नुहोस्'}</span>
                          </button>
                        )}

                        {/* Issue Book button */}
                        {b.availableCopies > 0 && (
                          <button
                            type="button"
                            onClick={() => handleOpenIssueModal(b)}
                            title="पाठकलाई वितरण"
                            style={{
                              padding: '5px 9px',
                              borderRadius: '6px',
                              backgroundColor: '#ecfdf5',
                              color: '#059669',
                              border: '1px solid #a7f3d0',
                              fontSize: '0.76rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            सापटी दिनुहोस्
                          </button>
                        )}

                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenEditBook(b)}
                          title="सम्पादन"
                          style={{
                            padding: '5px 8px',
                            borderRadius: '6px',
                            backgroundColor: '#f8fafc',
                            color: '#475569',
                            border: '1px solid #cbd5e1',
                            cursor: 'pointer',
                          }}
                        >
                          <Edit2 size={13} />
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`के तपाईं "${b.title}" पुस्तक मेटाउन निश्चित हुनुहुन्छ?`)) {
                              deleteBookMutation.mutate(b.id);
                            }
                          }}
                          title="हटाउनुहोस्"
                          style={{
                            padding: '5px 8px',
                            borderRadius: '6px',
                            backgroundColor: '#fef2f2',
                            color: '#dc2626',
                            border: '1px solid #fecaca',
                            cursor: 'pointer',
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ── TAB 2: CIRCULATION & BORROW MANAGEMENT ── */}
      {activeTab === 'circulation' && (
        <div className="dt-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                किताब वितरण तथा पाठक सापटी अभिलेख (Circulation Desk)
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '3px 0 0 0' }}>
                हाल पाठकहरूले अध्ययनका लागि लगेका पुस्तकहरूको स्थिति र फिर्ता दर्ता
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleOpenIssueModal()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#059669',
                color: '#ffffff',
                padding: '8px 14px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
              }}
            >
              <Plus size={16} />
              <span>नयाँ सापटी जारी गर्नुहोस्</span>
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <div className="dt-responsive-table-wrapper">
<table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                  <th style={{ padding: '10px 12px', fontWeight: 700 }}>पुस्तकको नाम / कोड</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700 }}>पाठकको नाम</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700 }}>सम्पर्क / कार्ड नं</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700 }}>जारी मिति</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700 }}>फिर्ता गर्नुपर्ने मिति</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700 }}>स्थिति</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700, textAlign: 'center' }}>कार्य</th>
                </tr>
              </thead>
              <tbody>
                {safeBorrows.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                      कुनै वितरण रेकर्ड फेला परेन।
                    </td>
                  </tr>
                ) : (
                  safeBorrows.map((r) => {
                    const isReturned = r.status === 'returned';
                    const isOverdue = r.status === 'overdue';

                    return (
                      <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '10px 12px' }}>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>
                            {r.book?.title || 'पुस्तक कोड: ' + (r.bookId || '-')}
                          </div>
                          <small style={{ color: '#64748b' }}>{r.book?.bookId}</small>
                        </td>
                        <td style={{ padding: '10px 12px', fontWeight: 600, color: '#1e293b' }}>
                          {r.borrowerName}
                        </td>
                        <td style={{ padding: '10px 12px', color: '#475569' }}>
                          <div>{r.borrowerContact || '-'}</div>
                          {r.borrowerCardNo && (
                            <small style={{ color: '#0284c7' }}>कार्ड: {r.borrowerCardNo}</small>
                          )}
                        </td>
                        <td style={{ padding: '10px 12px', color: '#475569' }}>{r.borrowDate || '-'}</td>
                        <td style={{ padding: '10px 12px', fontWeight: 600, color: isOverdue ? '#b91c1c' : '#334155' }}>
                          {r.dueDate || '-'}
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <span
                            style={{
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              backgroundColor: isReturned ? '#dcfce7' : isOverdue ? '#fee2e2' : '#eff6ff',
                              color: isReturned ? '#166534' : isOverdue ? '#991b1b' : '#1d4ed8',
                              border: `1px solid ${
                                isReturned ? '#bbf7d0' : isOverdue ? '#fecaca' : '#bfdbfe'
                              }`,
                            }}
                          >
                            {isReturned ? '✓ फिर्ता भएको' : isOverdue ? '⚠️ म्याद नाघेको' : '📖 अध्ययनरत'}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                          {!isReturned && (
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`के पाठक "${r.borrowerName}" ले पुस्तक फिर्ता गर्नुभयो?`)) {
                                  returnBorrowMutation.mutate(r.id);
                                }
                              }}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '5px 10px',
                                borderRadius: '6px',
                                backgroundColor: '#10b981',
                                color: '#ffffff',
                                border: 'none',
                                fontWeight: 600,
                                fontSize: '0.75rem',
                                cursor: 'pointer',
                              }}
                            >
                              <RotateCcw size={13} />
                              <span>फिर्ता दर्ता</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
</div>
          </div>
        </div>
      )}

      {/* ── TAB 3: MEMBER TRACKING ── */}
      {activeTab === 'tracking' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#1e293b' }}>पाठक खोज तथा ट्र्याकिङ</h3>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#334155' }}>पाठक (नागरिक) छान्नुहोस् *</label>
            <select
              className="dt-input"
              style={{ width: '100%', maxWidth: '400px', height: '40px' }}
              value={trackingCitizenId}
              onChange={(e) => setTrackingCitizenId(e.target.value)}
            >
              <option value="">-- नागरिक / पाठक छान्नुहोस् --</option>
              {libraryMembers.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.fullName} {c.phone ? `- ${c.phone}` : ''}
                </option>
              ))}
            </select>
          </div>

          {trackingCitizenId && (() => {
            const citizen = libraryMembers.find((c: any) => c.id === trackingCitizenId);
            const userBorrows = safeBorrows.filter((b) => b.borrowerCitizenId === trackingCitizenId);
            const activeBorrows = userBorrows.filter((b) => b.status === 'issued' || b.status === 'borrowed' || b.status === 'overdue');
            const pastBorrows = userBorrows.filter((b) => b.status === 'returned');

            return (
              <div>
                <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: '#0f172a' }}>{citizen?.fullName}</h4>
                  <div style={{ color: '#475569', fontSize: '0.9rem', display: 'flex', gap: '1.5rem' }}>
                    <span><strong>सम्पर्क:</strong> {citizen?.phone || '-'}</span>
                    <span><strong>ठेगाना:</strong> वडा नं {citizen?.wardNumber || '-'}</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gap: '1.5rem' }}>
                  {/* Active Borrows */}
                  <div>
                    <h4 style={{ margin: '0 0 0.75rem 0', color: '#0284c7', borderBottom: '2px solid #e0f2fe', paddingBottom: '0.5rem' }}>
                      हाल लगिएका पुस्तकहरू ({activeBorrows.length})
                    </h4>
                    {activeBorrows.length > 0 ? (
                      <div className="dt-responsive-table-wrapper">
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead style={{ backgroundColor: '#f1f5f9' }}>
                            <tr>
                              <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #cbd5e1', fontSize: '0.85rem' }}>पुस्तक</th>
                              <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #cbd5e1', fontSize: '0.85rem' }}>लगिएको मिति</th>
                              <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #cbd5e1', fontSize: '0.85rem' }}>फिर्ता गर्नुपर्ने मिति</th>
                              <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #cbd5e1', fontSize: '0.85rem' }}>अवस्था</th>
                            </tr>
                          </thead>
                          <tbody>
                            {activeBorrows.map(b => {
                              const isOverdue = b.dueDate && new Date(b.dueDate) < new Date();
                              return (
                                <tr key={b.id}>
                                  <td style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0', fontSize: '0.9rem', fontWeight: 500 }}>
                                    {b.bookTitle || (b.book && b.book.title)}
                                  </td>
                                  <td style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0', fontSize: '0.9rem' }}>{b.borrowDate}</td>
                                  <td style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0', fontSize: '0.9rem', color: isOverdue ? '#dc2626' : 'inherit', fontWeight: isOverdue ? 600 : 400 }}>
                                    {b.dueDate}
                                  </td>
                                  <td style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>
                                    <span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: isOverdue || b.status === 'overdue' ? '#fee2e2' : '#fef9c3', color: isOverdue || b.status === 'overdue' ? '#991b1b' : '#854d0e' }}>
                                      {isOverdue || b.status === 'overdue' ? 'म्याद नाघेको' : 'सक्रिय'}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>हाल कुनै पुस्तक लगेको रेकर्ड छैन।</p>
                    )}
                  </div>

                  {/* Past Borrows */}
                  <div>
                    <h4 style={{ margin: '0 0 0.75rem 0', color: '#16a34a', borderBottom: '2px solid #dcfce3', paddingBottom: '0.5rem' }}>
                      फिर्ता गरिएका पुस्तकहरू (History) ({pastBorrows.length})
                    </h4>
                    {pastBorrows.length > 0 ? (
                      <div className="dt-responsive-table-wrapper">
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead style={{ backgroundColor: '#f1f5f9' }}>
                            <tr>
                              <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #cbd5e1', fontSize: '0.85rem' }}>पुस्तक</th>
                              <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #cbd5e1', fontSize: '0.85rem' }}>लगिएको मिति</th>
                              <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #cbd5e1', fontSize: '0.85rem' }}>फिर्ता गरेको मिति</th>
                            </tr>
                          </thead>
                          <tbody>
                            {pastBorrows.map(b => (
                              <tr key={b.id}>
                                <td style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0', fontSize: '0.9rem' }}>{b.bookTitle || (b.book && b.book.title)}</td>
                                <td style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0', fontSize: '0.9rem' }}>{b.borrowDate}</td>
                                <td style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0', fontSize: '0.9rem', color: '#16a34a' }}>{b.returnDate || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>पुराना रेकर्डहरू छैनन्।</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ── MODAL 1: BOOK ENTRY / EDIT (5 SECTIONS) ── */}
      {showBookModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '850px',
              width: '100%',
              maxHeight: '92vh',
              overflowY: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1.2rem 1.5rem',
                borderBottom: '1px solid #e2e8f0',
                backgroundColor: '#f8fafc',
                borderTopLeftRadius: '16px',
                borderTopRightRadius: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '8px', borderRadius: '8px' }}>
                  <BookOpen size={20} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    {isEditingBook ? 'पुस्तक विवरण सम्पादन' : 'नयाँ पुस्तक तथा शैक्षिक सामग्री दर्ता फारम'}
                  </h2>
                  <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '2px 0 0 0' }}>
                    पुस्तकालय क्याटलग, र्याक व्यवस्थापन र डिजिटल फाइल अपलोड
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBookModal(false)}
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveBook} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* SECTION 1: BASIC INFORMATION */}
              <div style={{ padding: '1.1rem', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#1e40af', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileText size={16} />
                  <span>खण्ड १: पुस्तकको आधारभूत विवरण</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.85rem', marginBottom: '0.85rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                      पुस्तकको नाम (Book Title) *
                    </label>
                    <input
                      type="text"
                      required
                      className="dt-input"
                      style={{ height: '40px' }}
                      placeholder="उदा: सिन्धुपाल्चोक लोककथा तथा जनजीवन"
                      value={bookFormData.title}
                      onChange={(e) => setBookFormData({ ...bookFormData, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                      लेखक / सम्पादक (Author) *
                    </label>
                    <input
                      type="text"
                      required
                      className="dt-input"
                      style={{ height: '40px' }}
                      placeholder="उदा: डा. जगदीशचन्द्र रेग्मी"
                      value={bookFormData.author}
                      onChange={(e) => setBookFormData({ ...bookFormData, author: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.85rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                      विधा (Category)
                    </label>
                    <select
                      className="dt-input"
                      style={{ height: '40px' }}
                      value={bookFormData.category}
                      onChange={(e) => setBookFormData({ ...bookFormData, category: e.target.value })}
                    >
                      {CATEGORY_OPTIONS.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                      भाषा (Language)
                    </label>
                    <select
                      className="dt-input"
                      style={{ height: '40px' }}
                      value={bookFormData.language}
                      onChange={(e) => setBookFormData({ ...bookFormData, language: e.target.value })}
                    >
                      {LANGUAGE_OPTIONS.map((l) => (
                        <option key={l.value} value={l.value}>
                          {l.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                      प्रकाशन वर्ष (Year)
                    </label>
                    <input
                      type="text"
                      className="dt-input"
                      style={{ height: '40px' }}
                      placeholder="२०८०"
                      value={bookFormData.publicationYear}
                      onChange={(e) => setBookFormData({ ...bookFormData, publicationYear: e.target.value })}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                      ISBN / दर्ता नं
                    </label>
                    <input
                      type="text"
                      className="dt-input"
                      style={{ height: '40px' }}
                      placeholder="978-9937-..."
                      value={bookFormData.isbn}
                      onChange={(e) => setBookFormData({ ...bookFormData, isbn: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: FORMAT & PHYSICAL STORAGE (RACK & SHELF) */}
              <div style={{ padding: '1.1rem', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0369a1', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={16} />
                  <span>खण्ड २: ढाँचा, प्रति संख्या तथा र्याक/दराज स्थान</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.85rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                      ढाँचा (Media Type)
                    </label>
                    <select
                      className="dt-input"
                      style={{ height: '40px' }}
                      value={bookFormData.mediaType}
                      onChange={(e) => setBookFormData({ ...bookFormData, mediaType: e.target.value })}
                    >
                      <option value="physical">📚 भौतिक पुस्तक (Physical Book)</option>
                      <option value="ebook">📄 ई-पुस्तक (Digital PDF)</option>
                      <option value="audiobook">🎧 अडियोबुक (Audiobook)</option>
                      <option value="videobook">🎬 भिडियोबुक (Videobook)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                      कुल प्रति (Total Copies)
                    </label>
                    <input
                      type="number"
                      min={1}
                      className="dt-input"
                      style={{ height: '40px' }}
                      value={bookFormData.totalCopies}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1;
                        setBookFormData({
                          ...bookFormData,
                          totalCopies: val,
                          availableCopies: isEditingBook ? bookFormData.availableCopies : val,
                        });
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                      उपलब्ध प्रति (Available)
                    </label>
                    <input
                      type="number"
                      min={0}
                      className="dt-input"
                      style={{ height: '40px' }}
                      value={bookFormData.availableCopies}
                      onChange={(e) => setBookFormData({ ...bookFormData, availableCopies: parseInt(e.target.value) || 0 })}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                      र्याक नं (Rack No)
                    </label>
                    <input
                      type="text"
                      className="dt-input"
                      style={{ height: '40px' }}
                      placeholder="उदा: R-01"
                      value={bookFormData.rackNo}
                      onChange={(e) => setBookFormData({ ...bookFormData, rackNo: e.target.value })}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                      दराज नं (Shelf No)
                    </label>
                    <input
                      type="text"
                      className="dt-input"
                      style={{ height: '40px' }}
                      placeholder="उदा: S-2"
                      value={bookFormData.shelfNo}
                      onChange={(e) => setBookFormData({ ...bookFormData, shelfNo: e.target.value })}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                      कुल पृष्ठ संख्या (Pages)
                    </label>
                    <input
                      type="number"
                      className="dt-input"
                      style={{ height: '40px' }}
                      placeholder="१५०"
                      value={bookFormData.pages || ''}
                      onChange={(e) => setBookFormData({ ...bookFormData, pages: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: FILE UPLOADS (COVER, PDF, AUDIO, VIDEO) */}
              <div style={{ padding: '1.1rem', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#15803d', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <UploadCloud size={16} />
                    <span>खण्ड ३: कभर तस्बिर तथा ई-बुक / अडियो फाइल अपलोड</span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>📂 कम्प्युटरबाट सिधै फाइल छान्नुहोस्</span>
                </div>

                {uploadError && (
                  <div style={{ marginBottom: '10px', padding: '6px 10px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', color: '#b91c1c', fontSize: '0.8rem' }}>
                    {uploadError}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                  {/* 1. COVER PHOTO UPLOAD */}
                  <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e293b' }}>🖼️ कभर तस्बिर (Cover Image)</span>
                      {bookFormData.coverUrl && (
                        <button
                          type="button"
                          onClick={() => setBookFormData({ ...bookFormData, coverUrl: '' })}
                          style={{ border: 'none', background: 'none', color: '#ef4444', fontSize: '0.7rem', cursor: 'pointer' }}
                        >
                          हटाउनुहोस् ✕
                        </button>
                      )}
                    </div>

                    <label
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '12px',
                        border: '2px dashed #cbd5e1',
                        borderRadius: '6px',
                        backgroundColor: uploadingField === 'coverUrl' ? '#fef3c7' : '#f8fafc',
                        cursor: uploadingField === 'coverUrl' ? 'wait' : 'pointer',
                        textAlign: 'center',
                      }}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingField === 'coverUrl'}
                        style={{ display: 'none' }}
                        onChange={(e) => handleFileUpload(e, 'coverUrl')}
                      />
                      {uploadingField === 'coverUrl' ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#92400e', fontSize: '0.78rem' }}>
                          <Loader2 size={16} className="dt-spin" /> अपलोड हुँदैछ...
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                          <UploadCloud size={20} color="#0284c7" />
                          <span style={{ fontSize: '0.76rem', fontWeight: 600, color: '#0369a1' }}>कभर फोटो छान्नुहोस्</span>
                          <span style={{ fontSize: '0.68rem', color: '#64748b' }}>JPG, PNG (अधिकतम 50MB)</span>
                        </div>
                      )}
                    </label>

                    {bookFormData.coverUrl && (
                      <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f0fdf4', padding: '4px 8px', borderRadius: '6px' }}>
                        <img src={bookFormData.coverUrl} alt="Cover" style={{ width: '32px', height: '42px', objectFit: 'cover', borderRadius: '4px' }} />
                        <small style={{ color: '#166534', fontSize: '0.7rem' }}>✓ कभर फोटो तयार छ</small>
                      </div>
                    )}
                  </div>

                  {/* 2. E-BOOK PDF UPLOAD */}
                  <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e293b' }}>📄 ई-पुस्तक फाइल (Digital PDF)</span>
                      {bookFormData.digitalFileUrl && (
                        <button
                          type="button"
                          onClick={() => setBookFormData({ ...bookFormData, digitalFileUrl: '' })}
                          style={{ border: 'none', background: 'none', color: '#ef4444', fontSize: '0.7rem', cursor: 'pointer' }}
                        >
                          हटाउनुहोस् ✕
                        </button>
                      )}
                    </div>

                    <label
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '12px',
                        border: '2px dashed #cbd5e1',
                        borderRadius: '6px',
                        backgroundColor: uploadingField === 'digitalFileUrl' ? '#fef3c7' : '#f8fafc',
                        cursor: uploadingField === 'digitalFileUrl' ? 'wait' : 'pointer',
                        textAlign: 'center',
                      }}
                    >
                      <input
                        type="file"
                        accept=".pdf"
                        disabled={uploadingField === 'digitalFileUrl'}
                        style={{ display: 'none' }}
                        onChange={(e) => handleFileUpload(e, 'digitalFileUrl')}
                      />
                      {uploadingField === 'digitalFileUrl' ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#92400e', fontSize: '0.78rem' }}>
                          <Loader2 size={16} className="dt-spin" /> PDF अपलोड हुँदैछ...
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                          <FileText size={20} color="#1d4ed8" />
                          <span style={{ fontSize: '0.76rem', fontWeight: 600, color: '#1e40af' }}>PDF फाइल छान्नुहोस्</span>
                          <span style={{ fontSize: '0.68rem', color: '#64748b' }}>PDF ई-बुक (अधिकतम 50MB)</span>
                        </div>
                      )}
                    </label>

                    {bookFormData.digitalFileUrl && (
                      <div style={{ marginTop: '6px', backgroundColor: '#eff6ff', padding: '4px 8px', borderRadius: '6px', fontSize: '0.7rem', color: '#1e40af' }}>
                        ✓ PDF फाइल जोडिएको छ: <span style={{ wordBreak: 'break-all' }}>{bookFormData.digitalFileUrl}</span>
                      </div>
                    )}
                  </div>

                  {/* 3. AUDIOBOOK MP3 UPLOAD */}
                  <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e293b' }}>🎧 अडियोबुक (Audio MP3)</span>
                      {bookFormData.audioUrl && (
                        <button
                          type="button"
                          onClick={() => setBookFormData({ ...bookFormData, audioUrl: '' })}
                          style={{ border: 'none', background: 'none', color: '#ef4444', fontSize: '0.7rem', cursor: 'pointer' }}
                        >
                          हटाउनुहोस् ✕
                        </button>
                      )}
                    </div>

                    <label
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '12px',
                        border: '2px dashed #cbd5e1',
                        borderRadius: '6px',
                        backgroundColor: uploadingField === 'audioUrl' ? '#fef3c7' : '#f8fafc',
                        cursor: uploadingField === 'audioUrl' ? 'wait' : 'pointer',
                        textAlign: 'center',
                      }}
                    >
                      <input
                        type="file"
                        accept="audio/*"
                        disabled={uploadingField === 'audioUrl'}
                        style={{ display: 'none' }}
                        onChange={(e) => handleFileUpload(e, 'audioUrl')}
                      />
                      {uploadingField === 'audioUrl' ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#92400e', fontSize: '0.78rem' }}>
                          <Loader2 size={16} className="dt-spin" /> अडियो अपलोड हुँदैछ...
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                          <Headphones size={20} color="#7c3aed" />
                          <span style={{ fontSize: '0.76rem', fontWeight: 600, color: '#6d28d9' }}>MP3 अडियो छान्नुहोस्</span>
                          <span style={{ fontSize: '0.68rem', color: '#64748b' }}>MP3, M4A, WAV (अधिकतम 50MB)</span>
                        </div>
                      )}
                    </label>

                    {bookFormData.audioUrl && (
                      <div style={{ marginTop: '6px', backgroundColor: '#f5f3ff', padding: '4px 8px', borderRadius: '6px' }}>
                        <audio controls style={{ width: '100%', height: '26px' }} src={bookFormData.audioUrl} />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION 4: SUMMARY & KEYWORDS */}
              <div style={{ padding: '1.1rem', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#475569', marginBottom: '0.85rem' }}>
                  खण्ड ४: पुस्तकको सारंश तथा विवरण (Summary)
                </div>
                <textarea
                  className="dt-input"
                  rows={2}
                  placeholder="यस पुस्तकको संक्षिप्त विषयवस्तु, उपयोगीता वा सारंश..."
                  value={bookFormData.summary}
                  onChange={(e) => setBookFormData({ ...bookFormData, summary: e.target.value })}
                />
              </div>

              {/* Modal Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '0.5rem', borderTop: '1px solid #e2e8f0' }}>
                <button
                  type="button"
                  onClick={() => setShowBookModal(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#475569',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  रद्द गर्नुहोस्
                </button>
                <button
                  type="submit"
                  disabled={createBookMutation.isPending || updateBookMutation.isPending}
                  style={{
                    padding: '8px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#1e40af',
                    color: '#ffffff',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {createBookMutation.isPending || updateBookMutation.isPending ? 'बचत हुँदैछ...' : '✓ पुस्तक बचत गर्नुहोस्'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 2: ISSUE BOOK (BORROW CIRCULATION) ── */}
      {showIssueModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '560px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1.2rem 1.5rem',
                borderBottom: '1px solid #e2e8f0',
                backgroundColor: '#f0fdf4',
                borderTopLeftRadius: '16px',
                borderTopRightRadius: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ backgroundColor: '#dcfce7', color: '#15803d', padding: '8px', borderRadius: '8px' }}>
                  <BookMarked size={20} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    पुस्तक वितरण / सापटी जारी फारम
                  </h2>
                  <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '2px 0 0 0' }}>
                    पाठकलाई पुस्तक अध्ययनका लागि जारी गर्ने आधिकारिक अभिलेख
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowIssueModal(false)}
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveBorrow} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                  जारी गर्ने पुस्तक छान्नुहोस् *
                </label>
                <select
                  required
                  className="dt-input"
                  style={{ height: '40px' }}
                  value={issueFormData.bookId}
                  onChange={(e) => setIssueFormData({ ...issueFormData, bookId: e.target.value })}
                >
                  <option value="">-- पुस्तक छान्नुहोस् --</option>
                  {safeBooks.map((b) => (
                    <option key={b.id} value={b.id} disabled={b.availableCopies <= 0}>
                      {b.title} ({b.bookId}) - उपलब्ध: {b.availableCopies} प्रति
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    पाठक छान्नुहोस् (Select Citizen/Member) *
                  </label>
                  <select
                    required
                    className="dt-input"
                    style={{ height: '40px' }}
                    value={issueFormData.borrowerCitizenId || ''}
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      if (!selectedId) {
                        setIssueFormData({ ...issueFormData, borrowerCitizenId: '', borrowerName: '', borrowerContact: '' });
                        return;
                      }
                      const c = libraryMembers.find((citizen: any) => citizen.id === selectedId);
                      setIssueFormData({
                        ...issueFormData,
                        borrowerCitizenId: selectedId,
                        borrowerName: c ? (c.fullName || '').trim() : '',
                        borrowerContact: c ? (c.phone || '') : '',
                      });
                    }}
                  >
                    <option value="">-- नागरिक / पाठक छान्नुहोस् --</option>
                    {isLoadingCitizens ? (
                      <option value="" disabled>लोड हुँदैछ...</option>
                    ) : (
                      libraryMembers.map((c: any) => (
                        <option key={c.id} value={c.id}>
                          {c.fullName} {c.phone ? `- ${c.phone}` : ''}
                        </option>
                      ))
                    )}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    सम्पर्क फोन नं
                  </label>
                  <input
                    type="text"
                    className="dt-input"
                    style={{ height: '40px' }}
                    placeholder="९८xxxxxxxx"
                    value={issueFormData.borrowerContact}
                    onChange={(e) => setIssueFormData({ ...issueFormData, borrowerContact: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <NepaliDatePicker
                    label="जारी मिति (Borrow Date)"
                    value={issueFormData.borrowDate}
                    onChange={(bsDate) => setIssueFormData({ ...issueFormData, borrowDate: bsDate })}
                    inputStyle={{ height: '40px', borderColor: '#e2e8f0', width: '100%' }}
                  />
                </div>
                <div>
                  <NepaliDatePicker
                    label="फिर्ता मिति (Due Date)"
                    value={issueFormData.dueDate}
                    onChange={(bsDate) => setIssueFormData({ ...issueFormData, dueDate: bsDate })}
                    inputStyle={{ height: '40px', borderColor: '#e2e8f0', width: '100%' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                  कैफियत (Remarks)
                </label>
                <input
                  type="text"
                  className="dt-input"
                  style={{ height: '40px' }}
                  placeholder="विद्यार्थी वा कर्मचारी प्रयोजन..."
                  value={issueFormData.remarks}
                  onChange={(e) => setIssueFormData({ ...issueFormData, remarks: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '0.5rem', borderTop: '1px solid #e2e8f0' }}>
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#475569',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  रद्द गर्नुहोस्
                </button>
                <button
                  type="submit"
                  disabled={issueBorrowMutation.isPending}
                  style={{
                    padding: '8px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#059669',
                    color: '#ffffff',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {issueBorrowMutation.isPending ? 'दर्ता हुँदैछ...' : '✓ सापटी जारी गर्नुहोस्'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 3: DIGITAL PREVIEW / AUDIO / PDF PLAYER ── */}
      {showPreviewModal && previewBook && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1.5rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '800px',
              width: '100%',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem 1.25rem',
                borderBottom: '1px solid #e2e8f0',
                backgroundColor: '#f8fafc',
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                  {previewBook.title}
                </h3>
                <small style={{ color: '#64748b' }}>लेखक: {previewBook.author}</small>
              </div>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Audio player if audio exists */}
              {previewBook.audioUrl && (
                <div style={{ backgroundColor: '#f5f3ff', padding: '1rem', borderRadius: '10px', border: '1px solid #ddd6fe' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#5b21b6', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Headphones size={16} />
                    <span>श्रव्य-पुस्तक प्लेयर (Audiobook Player)</span>
                  </div>
                  <audio controls style={{ width: '100%' }} src={previewBook.audioUrl}>
                    अडियो प्लेयर सपोर्ट गर्दैन।
                  </audio>
                </div>
              )}

              {/* Video if video exists */}
              {previewBook.videoUrl && (
                <div style={{ backgroundColor: '#fdf2f8', padding: '1rem', borderRadius: '10px', border: '1px solid #fbcfe8' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#9d174d', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Video size={16} />
                    <span>भिडियो ई-कक्षा (Video Reader)</span>
                  </div>
                  <video controls style={{ width: '100%', maxHeight: '350px', borderRadius: '8px', backgroundColor: '#000000' }} src={previewBook.videoUrl} />
                </div>
              )}

              {/* PDF Viewer / Link if digital file exists */}
              {previewBook.digitalFileUrl && (
                <div style={{ backgroundColor: '#eff6ff', padding: '1rem', borderRadius: '10px', border: '1px solid #bfdbfe' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e40af', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FileText size={16} />
                      <span>ई-पुस्तक (Digital PDF)</span>
                    </span>
                    <a
                      href={previewBook.digitalFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        color: '#1d4ed8',
                        textDecoration: 'none',
                      }}
                    >
                      नयाँ ट्याबमा खोल्नुहोस् <ExternalLink size={13} />
                    </a>
                  </div>
                  <iframe
                    src={previewBook.digitalFileUrl}
                    style={{ width: '100%', height: '400px', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                    title={previewBook.title}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LibraryPage;
