import React, { useState, useMemo } from 'react';
import {
  Landmark,
  Search,
  Sparkles,
  MapPin,
  Calendar,
  Layers,
  Eye,
  X,
  Clock,
  ShieldCheck,
  Compass,
  Plus,
  Edit2,
  Trash2,
  Printer,
  QrCode,
  Headphones,
  Video,
  FileText,
  LayoutGrid,
  List,
  CheckCircle2,
  AlertTriangle,
  Archive,
  ExternalLink,
  ChevronRight,
  Info,
  Upload,
  UploadCloud,
  Loader2,
  Music,
  Film,
  Box,
  Download,
  FileSpreadsheet,
} from 'lucide-react';
import { exportMuseumAssetsData } from '../../utils/exportUtils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sectoralApi } from '../../api/sectoral';
import { api } from '../../api/client';

export interface MuseumAsset {
  id: string;
  assetId: string;
  nameNp: string;
  nameEn?: string;
  name?: string;
  category: string;
  subCategory?: string;
  history?: string;
  usage?: string;
  origin?: string;
  estimatedPeriod?: string;
  era?: string;
  material?: string;
  condition?: string;
  museumLocation?: string;
  latitude?: number;
  longitude?: number;
  photoUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
  model3dUrl?: string;
  qrCodeUrl?: string;
  verificationStatus: 'Draft' | 'Verified' | 'Published' | string;
  createdAt?: string;
  updatedAt?: string;
}

const CATEGORY_OPTIONS = [
  'ऐतिहासिक कलाकृति',
  'पुरातत्व र मूर्ति',
  'परम्परागत पोशाक तथा गरगहना',
  'दस्तावेज, पाण्डुलिपि र अभिलेख',
  'धार्मिक तथा पूजा सामग्री',
  'हस्तकला र काष्ठकला',
  'कृषि तथा घरायसी प्राचीन औजार',
  'हातहतियार र सुरक्षा उपकरण',
  'सिक्का तथा मुद्रा',
  'अन्य',
];

const CONDITION_OPTIONS = [
  'उत्कृष्ट',
  'सामान्य राम्रो',
  'मर्मत/संरक्षण आवश्यक',
  'अति संवेदनशील / जीर्ण',
];

const STATUS_OPTIONS = [
  { value: 'Published', label: 'सार्वजनिक प्रदर्शनमा (Published)', color: '#15803d', bg: '#dcfce7' },
  { value: 'Verified', label: 'सङ्ग्रह कक्षमा (Verified / Vault)', color: '#1d4ed8', bg: '#dbeafe' },
  { value: 'Draft', label: 'मस्यौदा (Draft)', color: '#b45309', bg: '#fef3c7' },
];

export const MuseumPage: React.FC = () => {
  const queryClient = useQueryClient();

  // Filters & Views
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCondition, setSelectedCondition] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'all' | 'published' | 'vault' | 'restoration' | 'media'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals
  const [selectedItem, setSelectedItem] = useState<MuseumAsset | null>(null);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printItem, setPrintItem] = useState<MuseumAsset | null>(null);

  // Form State
  const initialFormData = {
    id: '',
    assetId: '',
    nameNp: '',
    nameEn: '',
    category: 'ऐतिहासिक कलाकृति',
    subCategory: '',
    estimatedPeriod: '',
    material: '',
    origin: '',
    museumLocation: 'ग्यालरी १ - शोकेस A-1',
    condition: 'सामान्य राम्रो',
    verificationStatus: 'Published',
    history: '',
    usage: '',
    photoUrl: '',
    audioUrl: '',
    videoUrl: '',
    model3dUrl: '',
    latitude: 27.93,
    longitude: 85.6,
  };

  const [formData, setFormData] = useState(initialFormData);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldKey: 'photoUrl' | 'audioUrl' | 'videoUrl' | 'model3dUrl'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input value so re-uploading the same file still triggers onChange
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
        setFormData((prev) => ({ ...prev, [fieldKey]: res.url }));
      }
    } catch (err: any) {
      console.error('File upload error:', err);
      const msg = err?.response?.data?.message || err?.message || 'फाइल अपलोड गर्दा समस्या आयो';
      setUploadError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setUploadingField(null);
    }
  };

  // Fetch Assets
  const { data: rawAssets = [], isLoading } = useQuery({
    queryKey: ['museumAssets'],
    queryFn: () => sectoralApi.getMuseumAssets(),
  });

  // Normalize data
  const museumCatalog: MuseumAsset[] = useMemo(() => {
    if (!Array.isArray(rawAssets)) return [];
    return rawAssets.map((item: any, idx: number) => ({
      id: item.id || `mus-${idx}`,
      assetId: item.assetId || item.code || `MUS-${String(idx + 1).padStart(4, '0')}`,
      nameNp: item.nameNp || item.titleNepali || item.name || 'सामग्री',
      nameEn: item.nameEn || item.titleEnglish || '',
      category: item.category || 'ऐतिहासिक कलाकृति',
      subCategory: item.subCategory || '',
      history: item.history || item.description || '',
      usage: item.usage || item.historicalSignificance || '',
      origin: item.origin || 'पाँचपोखरी थाङपाल',
      estimatedPeriod: item.estimatedPeriod || item.era || 'प्राचीन काल',
      material: item.material || 'परम्परागत',
      condition: item.condition || 'सामान्य राम्रो',
      museumLocation: item.museumLocation || item.location || 'मुख्य सङ्ग्रह कक्ष',
      latitude: item.latitude || 27.93,
      longitude: item.longitude || 85.6,
      photoUrl: item.photoUrl || item.imageUrl || '',
      audioUrl: item.audioUrl || '',
      videoUrl: item.videoUrl || '',
      model3dUrl: item.model3dUrl || '',
      verificationStatus: item.verificationStatus || 'Published',
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));
  }, [rawAssets]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: any) => sectoralApi.createMuseumAsset(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['museumAssets'] });
      setShowEntryModal(false);
      alert('नयाँ सङ्ग्रहालय सामग्री सफलतापूर्वक दर्ता भयो!');
    },
    onError: (err: any) => {
      alert('दर्ता त्रुटि: ' + (err?.message || 'सुरक्षित गर्न सकिएन'));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => sectoralApi.updateMuseumAsset(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['museumAssets'] });
      setShowEntryModal(false);
      alert('सङ्ग्रहालय सामग्री सफलतापूर्वक अद्यावधिक गरियो!');
    },
    onError: (err: any) => {
      alert('अद्यावधिक त्रुटि: ' + (err?.message || 'अद्यावधिक गर्न सकिएन'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => sectoralApi.deleteMuseumAsset(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['museumAssets'] });
      if (selectedItem) setSelectedItem(null);
      alert('सामग्री सफलतापूर्वक हटाइयो!');
    },
    onError: (err: any) => {
      alert('डिलिट त्रुटि: ' + (err?.message || 'हटाउन सकिएन'));
    },
  });

  // Handlers
  const handleOpenNewModal = () => {
    setIsEditing(false);
    setFormData(initialFormData);
    setShowEntryModal(true);
  };

  const handleOpenEditModal = (item: MuseumAsset) => {
    setIsEditing(true);
    setFormData({
      id: item.id,
      assetId: item.assetId,
      nameNp: item.nameNp,
      nameEn: item.nameEn || '',
      category: item.category,
      subCategory: item.subCategory || '',
      estimatedPeriod: item.estimatedPeriod || '',
      material: item.material || '',
      origin: item.origin || '',
      museumLocation: item.museumLocation || '',
      condition: item.condition || 'सामान्य राम्रो',
      verificationStatus: item.verificationStatus,
      history: item.history || '',
      usage: item.usage || '',
      photoUrl: item.photoUrl || '',
      audioUrl: item.audioUrl || '',
      videoUrl: item.videoUrl || '',
      model3dUrl: item.model3dUrl || '',
      latitude: item.latitude || 27.93,
      longitude: item.longitude || 85.6,
    });
    setShowEntryModal(true);
  };

  const handleDeleteItem = (item: MuseumAsset) => {
    if (window.confirm(`के तपाईं "${item.nameNp}" (${item.assetId}) लाई संग्रहालय अभिलेखबाट हटाउन निश्चित हुनुहुन्छ?`)) {
      deleteMutation.mutate(item.id);
    }
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nameNp.trim()) {
      alert('कृपया सामग्रीको नाम (नेपाली) अनिवार्य उल्लेख गर्नुहोस्!');
      return;
    }

    const payload: any = {
      ...formData,
    };
    if (!payload.id) {
      delete payload.id;
    }

    if (isEditing && formData.id) {
      updateMutation.mutate({ id: formData.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleOpenPrintModal = (item: MuseumAsset) => {
    setPrintItem(item);
    setShowPrintModal(true);
  };

  // KPI Calculations
  const stats = useMemo(() => {
    const total = museumCatalog.length;
    const published = museumCatalog.filter((x) => x.verificationStatus === 'Published').length;
    const vault = museumCatalog.filter((x) => x.verificationStatus === 'Verified' || x.verificationStatus === 'Draft').length;
    const restoration = museumCatalog.filter(
      (x) =>
        (x.condition || '').includes('मर्मत') ||
        (x.condition || '').includes('जीर्ण') ||
        (x.condition || '').toLowerCase().includes('restoration')
    ).length;
    const media = museumCatalog.filter((x) => x.audioUrl || x.videoUrl || x.model3dUrl).length;

    return { total, published, vault, restoration, media };
  }, [museumCatalog]);

  // Filtered Items
  const filteredItems = useMemo(() => {
    return museumCatalog.filter((item) => {
      // Search
      const q = searchTerm.toLowerCase().trim();
      if (q) {
        const matchesSearch =
          item.nameNp.toLowerCase().includes(q) ||
          (item.nameEn && item.nameEn.toLowerCase().includes(q)) ||
          item.assetId.toLowerCase().includes(q) ||
          (item.material && item.material.toLowerCase().includes(q)) ||
          (item.origin && item.origin.toLowerCase().includes(q)) ||
          (item.estimatedPeriod && item.estimatedPeriod.toLowerCase().includes(q)) ||
          (item.museumLocation && item.museumLocation.toLowerCase().includes(q));

        if (!matchesSearch) return false;
      }

      // Category
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }

      // Condition
      if (selectedCondition !== 'all') {
        const cond = item.condition || '';
        if (selectedCondition === 'उत्कृष्ट' && !cond.includes('उत्कृष्ट')) return false;
        if (selectedCondition === 'सामान्य राम्रो' && !cond.includes('राम्रो')) return false;
        if (selectedCondition === 'मर्मत' && !cond.includes('मर्मत') && !cond.toLowerCase().includes('restoration')) return false;
      }

      // Tab
      if (activeTab === 'published' && item.verificationStatus !== 'Published') return false;
      if (activeTab === 'vault' && item.verificationStatus === 'Published') return false;
      if (activeTab === 'restoration') {
        const c = item.condition || '';
        if (!c.includes('मर्मत') && !c.includes('जीर्ण') && !c.toLowerCase().includes('restoration')) return false;
      }
      if (activeTab === 'media' && !(item.audioUrl || item.videoUrl || item.model3dUrl)) return false;

      return true;
    });
  }, [museumCatalog, searchTerm, selectedCategory, selectedCondition, activeTab]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '2.5rem' }}>
      {/* ═════════ TOP BANNER & ACTION BAR ═════════ */}
      <div
        style={{
          background: 'linear-gradient(135deg, #78350f 0%, #92400e 40%, #451a03 100%)',
          color: '#ffffff',
          borderRadius: '18px',
          padding: '1.75rem 2rem',
          boxShadow: '0 10px 25px -5px rgba(120, 53, 15, 0.35)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}
      >
        <div style={{ maxWidth: '720px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(255,255,255,0.15)',
              padding: '4px 12px',
              borderRadius: '9999px',
              fontSize: '0.78rem',
              fontWeight: 700,
              marginBottom: '0.65rem',
            }}
          >
            <Landmark size={15} color="#fde68a" />
            <span>पाँचपोखरी थाङपाल • ऐतिहासिक, पुरातात्विक तथा सांस्कृतिक सङ्ग्रहालय</span>
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, margin: '0 0 0.5rem', color: '#ffffff' }}>
            सङ्ग्रहालय व्यवस्थापन तथा डिजिटल क्याटलग
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#fef3c7', margin: 0, lineHeight: 1.5 }}>
            स्थानीय ऐतिहासिक कलाकृति, लिच्छवि-मल्लकालीन पुरातात्विक सम्पदा, ह्योल्मो भेषभूषा, धातु/काष्ठकला तथा प्राचीन पाण्डुलिपिहरूको आधिकारिक डिजिटल अभिलेख
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => exportMuseumAssetsData(filteredItems, 'xlsx')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 16px',
              borderRadius: '12px',
              border: '1px solid #16a34a',
              backgroundColor: '#10b981',
              color: '#ffffff',
              fontSize: '0.88rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
              transition: 'all 0.15s ease',
            }}
            title="हालको क्याटलगलाई एक्सेल (.xlsx) मा डाउनलोड गर्नुहोस्"
          >
            <FileSpreadsheet size={16} />
            <span>एक्सेल (.xlsx) निर्यात</span>
          </button>

          <button
            type="button"
            onClick={() => exportMuseumAssetsData(filteredItems, 'csv')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '10px 14px',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.25)',
              backgroundColor: 'rgba(255,255,255,0.12)',
              color: '#ffffff',
              fontSize: '0.86rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            title="CSV ढाँचामा डाउनलोड गर्नुहोस्"
          >
            <Download size={15} />
            <span>CSV</span>
          </button>

          <button
            type="button"
            onClick={handleOpenNewModal}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: '#f59e0b',
              color: '#451a03',
              fontSize: '0.92rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(245, 158, 11, 0.4)',
              transition: 'all 0.15s ease',
            }}
          >
            <Plus size={18} strokeWidth={2.5} />
            <span>नयाँ सामग्री दर्ता गर्नुहोस्</span>
          </button>

          <button
            type="button"
            onClick={() => window.open('/museum', '_blank')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 16px',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.25)',
              backgroundColor: 'rgba(255,255,255,0.1)',
              color: '#ffffff',
              fontSize: '0.86rem',
              fontWeight: 700,
              cursor: 'pointer',
              backdropFilter: 'blur(6px)',
            }}
            title="सार्वजनिक डिजिटल सङ्ग्रहालय क्याटलग छुट्टै ट्याबमा खोल्नुहोस्"
          >
            <ExternalLink size={16} />
            <span>सार्वजनिक क्याटलग</span>
          </button>
        </div>
      </div>

      {/* ═════════ 5 KPI STAT CARDS ═════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
        <div
          onClick={() => setActiveTab('all')}
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            padding: '1rem 1.25rem',
            borderTop: '4px solid #3b82f6',
            boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
            cursor: 'pointer',
            transition: 'transform 0.15s ease',
            border: activeTab === 'all' ? '2px solid #3b82f6' : '1px solid #e2e8f0',
          }}
        >
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b' }}>कुल सामग्री (Total)</div>
          <div style={{ fontSize: '1.65rem', fontWeight: 900, color: '#1e40af', margin: '2px 0' }}>{stats.total}</div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>सम्पूर्ण दर्ता अभिलेख</div>
        </div>

        <div
          onClick={() => setActiveTab('published')}
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            padding: '1rem 1.25rem',
            borderTop: '4px solid #10b981',
            boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
            cursor: 'pointer',
            transition: 'transform 0.15s ease',
            border: activeTab === 'published' ? '2px solid #10b981' : '1px solid #e2e8f0',
          }}
        >
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b' }}>सार्वजनिक प्रदर्शन</div>
          <div style={{ fontSize: '1.65rem', fontWeight: 900, color: '#047857', margin: '2px 0' }}>{stats.published}</div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Active Display</div>
        </div>

        <div
          onClick={() => setActiveTab('vault')}
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            padding: '1rem 1.25rem',
            borderTop: '4px solid #6366f1',
            boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
            cursor: 'pointer',
            transition: 'transform 0.15s ease',
            border: activeTab === 'vault' ? '2px solid #6366f1' : '1px solid #e2e8f0',
          }}
        >
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b' }}>सङ्ग्रह कक्ष (Vault)</div>
          <div style={{ fontSize: '1.65rem', fontWeight: 900, color: '#4338ca', margin: '2px 0' }}>{stats.vault}</div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>सुरक्षित भण्डार / मस्यौदा</div>
        </div>

        <div
          onClick={() => setActiveTab('restoration')}
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            padding: '1rem 1.25rem',
            borderTop: '4px solid #ef4444',
            boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
            cursor: 'pointer',
            transition: 'transform 0.15s ease',
            border: activeTab === 'restoration' ? '2px solid #ef4444' : '1px solid #e2e8f0',
          }}
        >
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b' }}>मर्मत / संरक्षण आवश्यक</div>
          <div style={{ fontSize: '1.65rem', fontWeight: 900, color: '#b91c1c', margin: '2px 0' }}>{stats.restoration}</div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Needs Restoration</div>
        </div>

        <div
          onClick={() => setActiveTab('media')}
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            padding: '1rem 1.25rem',
            borderTop: '4px solid #06b6d4',
            boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
            cursor: 'pointer',
            transition: 'transform 0.15s ease',
            border: activeTab === 'media' ? '2px solid #06b6d4' : '1px solid #e2e8f0',
          }}
        >
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b' }}>डिजिटल मिडिया सम्पदा</div>
          <div style={{ fontSize: '1.65rem', fontWeight: 900, color: '#0e7490', margin: '2px 0' }}>{stats.media}</div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>अडियो / भिडियो गाइड</div>
        </div>
      </div>

      {/* ═════════ FILTER, SEARCH & VIEW SWITCHER ═════════ */}
      <div
        className="dt-card"
        style={{
          padding: '1.1rem 1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
        }}
      >
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          {/* Search Input */}
          <div style={{ flex: '1 1 320px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              className="dt-input"
              style={{ paddingLeft: '38px', height: '42px', fontSize: '0.9rem' }}
              placeholder="सामग्रीको नाम, Asset ID, कालखण्ड, निर्माण सामग्री वा शोकेस खोज्नुहोस्..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Condition Filter */}
          <div style={{ minWidth: '170px' }}>
            <select
              className="dt-select"
              style={{ height: '42px', fontSize: '0.85rem' }}
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
            >
              <option value="all">सबै संरक्षण अवस्था</option>
              <option value="उत्कृष्ट">उत्कृष्ट (Excellent)</option>
              <option value="सामान्य राम्रो">सामान्य राम्रो (Good)</option>
              <option value="मर्मत">मर्मत आवश्यक (Restoration)</option>
            </select>
          </div>

          {/* Grid vs Table View Mode */}
          <div style={{ display: 'flex', backgroundColor: '#f1f5f9', padding: '3px', borderRadius: '10px', gap: '2px' }}>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '7px 12px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: viewMode === 'grid' ? '#ffffff' : 'transparent',
                color: viewMode === 'grid' ? '#0f172a' : '#64748b',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                boxShadow: viewMode === 'grid' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              <LayoutGrid size={16} />
              <span>कार्ड दृश्य</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '7px 12px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: viewMode === 'table' ? '#ffffff' : 'transparent',
                color: viewMode === 'table' ? '#0f172a' : '#64748b',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                boxShadow: viewMode === 'table' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              <List size={16} />
              <span>तालिका दृश्य</span>
            </button>
          </div>
        </div>

        {/* Category Pill Filters */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', marginRight: '4px' }}>विधा:</span>
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            style={{
              padding: '5px 12px',
              borderRadius: '9999px',
              border: selectedCategory === 'all' ? 'none' : '1px solid #cbd5e1',
              backgroundColor: selectedCategory === 'all' ? '#92400e' : '#ffffff',
              color: selectedCategory === 'all' ? '#ffffff' : '#475569',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            सबै ({museumCatalog.length})
          </button>
          {CATEGORY_OPTIONS.map((cat) => {
            const count = museumCatalog.filter((x) => x.category === cat).length;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '9999px',
                  border: selectedCategory === cat ? 'none' : '1px solid #cbd5e1',
                  backgroundColor: selectedCategory === cat ? '#92400e' : '#ffffff',
                  color: selectedCategory === cat ? '#ffffff' : '#475569',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {cat} {count > 0 && `(${count})`}
              </button>
            );
          })}
        </div>
      </div>

      {/* ═════════ LISTING CONTENT: GRID OR TABLE ═════════ */}
      {isLoading ? (
        <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: '#ffffff', borderRadius: '16px' }}>
          <div className="spinner-border text-warning" role="status"></div>
          <p style={{ marginTop: '0.75rem', color: '#64748b', fontSize: '0.9rem' }}>संग्रहालय अभिलेख लोड हुँदैछ...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div
          style={{
            padding: '3rem',
            textAlign: 'center',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px dashed #cbd5e1',
          }}
        >
          <Landmark size={48} color="#94a3b8" style={{ marginBottom: '0.75rem' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#334155' }}>कुनै सामग्री फेला परेन</h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem' }}>
            खोजिएको शब्द वा विधासँग मेल खाने सामग्री सङ्ग्रहमा भेटिएन।
          </p>
          <button
            type="button"
            onClick={handleOpenNewModal}
            className="dt-btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={16} />
            <span>नयाँ सामग्री प्रविष्टि गर्नुहोस्</span>
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* ── GRID CARD VIEW ── */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.35rem' }}>
          {filteredItems.map((item) => {
            const statusObj = STATUS_OPTIONS.find((s) => s.value === item.verificationStatus) || STATUS_OPTIONS[0];

            return (
              <div
                key={item.id}
                className="dt-card"
                style={{
                  padding: '0',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                  transition: 'all 0.2s ease',
                  border: '1px solid #e2e8f0',
                }}
              >
                {/* Photo & Top Badges */}
                <div style={{ position: 'relative', height: '200px', backgroundColor: '#0f172a' }}>
                  {item.photoUrl ? (
                    <img
                      src={item.photoUrl}
                      alt={item.nameNp}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#94a3b8',
                        background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                      }}
                    >
                      <Landmark size={44} />
                      <span style={{ fontSize: '0.75rem', marginTop: '4px' }}>तस्बिर उपलब्ध छैन</span>
                    </div>
                  )}

                  {/* Asset ID Badge */}
                  <span
                    style={{
                      position: 'absolute',
                      top: '10px',
                      left: '10px',
                      backgroundColor: 'rgba(15, 23, 42, 0.85)',
                      color: '#fbbf24',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      fontFamily: 'monospace',
                      border: '1px solid rgba(251, 191, 36, 0.4)',
                    }}
                  >
                    {item.assetId}
                  </span>

                  {/* Status Badge */}
                  <span
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      backgroundColor: statusObj.bg,
                      color: statusObj.color,
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                    }}
                  >
                    {item.verificationStatus}
                  </span>

                  {/* Era Badge */}
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '10px',
                      right: '10px',
                      backgroundColor: '#92400e',
                      color: '#ffffff',
                      padding: '3px 10px',
                      borderRadius: '9999px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                    }}
                  >
                    {item.estimatedPeriod}
                  </span>

                  {/* Media icons */}
                  <div style={{ position: 'absolute', bottom: '10px', left: '10px', display: 'flex', gap: '4px' }}>
                    {item.audioUrl && (
                      <span style={{ padding: '3px 6px', borderRadius: '4px', backgroundColor: '#0284c7', color: '#ffffff', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '2px' }} title="अडियो गाइड उपलब्ध">
                        <Headphones size={12} />
                      </span>
                    )}
                    {item.videoUrl && (
                      <span style={{ padding: '3px 6px', borderRadius: '4px', backgroundColor: '#dc2626', color: '#ffffff', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '2px' }} title="भिडियो उपलब्ध">
                        <Video size={12} />
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#b45309' }}>
                        {item.category}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
                        ● {item.condition}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '2px 0 4px', lineHeight: 1.35 }}>
                      {item.nameNp}
                    </h3>
                    {item.nameEn && (
                      <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '8px', fontStyle: 'italic' }}>
                        {item.nameEn}
                      </div>
                    )}

                    <p style={{ fontSize: '0.82rem', color: '#475569', margin: '0 0 1rem', lineHeight: 1.45, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {item.history || 'यस सामग्रीको ऐतिहासिक पृष्ठभूमि तथा पुरातात्विक विवरण सङ्ग्रहालय अभिलेखमा सुरक्षित छ।'}
                    </p>
                  </div>

                  {/* Card Bottom Meta & Actions */}
                  <div>
                    <div style={{ fontSize: '0.76rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '0.85rem' }}>
                      <MapPin size={13} color="#2563eb" />
                      <span>{item.museumLocation} ({item.origin})</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedItem(item)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '8px',
                          border: 'none',
                          backgroundColor: '#eff6ff',
                          color: '#1d4ed8',
                          fontWeight: 700,
                          fontSize: '0.78rem',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Eye size={14} />
                        <span>विवरण</span>
                      </button>

                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          type="button"
                          onClick={() => handleOpenPrintModal(item)}
                          title="शोकेस लेबल तथा QR प्रिन्ट"
                          style={{
                            padding: '6px',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            backgroundColor: '#ffffff',
                            color: '#475569',
                            cursor: 'pointer',
                          }}
                        >
                          <QrCode size={15} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(item)}
                          title="सम्पादन गर्नुहोस्"
                          style={{
                            padding: '6px',
                            borderRadius: '8px',
                            border: '1px solid #bfdbfe',
                            backgroundColor: '#eff6ff',
                            color: '#2563eb',
                            cursor: 'pointer',
                          }}
                        >
                          <Edit2 size={15} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteItem(item)}
                          title="हटाउनुहोस्"
                          style={{
                            padding: '6px',
                            borderRadius: '8px',
                            border: '1px solid #fecaca',
                            backgroundColor: '#fef2f2',
                            color: '#dc2626',
                            cursor: 'pointer',
                          }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── OFFICIAL REGISTRY TABLE VIEW ── */
        <div className="dt-card" style={{ padding: '0', overflowX: 'auto', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
          <div className="dt-responsive-table-wrapper">
<table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                <th style={{ padding: '12px 14px', width: '70px' }}>तस्बिर</th>
                <th style={{ padding: '12px 14px' }}>सामग्री विवरण (Asset Info)</th>
                <th style={{ padding: '12px 14px' }}>विधा (Category)</th>
                <th style={{ padding: '12px 14px' }}>कालखण्ड (Era)</th>
                <th style={{ padding: '12px 14px' }}>निर्माण सामग्री</th>
                <th style={{ padding: '12px 14px' }}>सङ्ग्रह स्थान</th>
                <th style={{ padding: '12px 14px' }}>संरक्षण अवस्था</th>
                <th style={{ padding: '12px 14px' }}>स्थिति</th>
                <th style={{ padding: '12px 14px', textAlign: 'center' }}>कार्यहरू</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((m) => {
                const statusObj = STATUS_OPTIONS.find((s) => s.value === m.verificationStatus) || STATUS_OPTIONS[0];

                return (
                  <tr key={m.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 14px' }}>
                      {m.photoUrl ? (
                        <img
                          src={m.photoUrl}
                          alt={m.nameNp}
                          style={{ width: '52px', height: '52px', objectFit: 'cover', borderRadius: '8px' }}
                        />
                      ) : (
                        <div style={{ width: '52px', height: '52px', borderRadius: '8px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                          <Landmark size={24} />
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ fontWeight: 800, color: '#0f172a' }}>{m.nameNp}</div>
                      {m.nameEn && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{m.nameEn}</div>}
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '1px 6px', borderRadius: '4px', fontFamily: 'monospace' }}>
                        {m.assetId}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#92400e' }}>{m.category}</span>
                    </td>
                    <td style={{ padding: '10px 14px', fontWeight: 600 }}>{m.estimatedPeriod}</td>
                    <td style={{ padding: '10px 14px', color: '#475569' }}>{m.material}</td>
                    <td style={{ padding: '10px 14px', fontSize: '0.8rem', color: '#64748b' }}>{m.museumLocation}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: m.condition?.includes('मर्मत') ? '#dc2626' : '#059669' }}>
                        ● {m.condition}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', backgroundColor: statusObj.bg, color: statusObj.color }}>
                        {m.verificationStatus}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                        <button
                          type="button"
                          onClick={() => setSelectedItem(m)}
                          title="विस्तृत हेर्नुहोस्"
                          style={{ padding: '5px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', cursor: 'pointer' }}
                        >
                          <Eye size={14} color="#2563eb" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenPrintModal(m)}
                          title="QR शोकेस ट्याग"
                          style={{ padding: '5px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', cursor: 'pointer' }}
                        >
                          <QrCode size={14} color="#475569" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(m)}
                          title="सम्पादन"
                          style={{ padding: '5px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', cursor: 'pointer' }}
                        >
                          <Edit2 size={14} color="#d97706" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteItem(m)}
                          title="डिलिट"
                          style={{ padding: '5px', borderRadius: '6px', border: '1px solid #fecaca', background: '#fef2f2', cursor: 'pointer' }}
                        >
                          <Trash2 size={14} color="#dc2626" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
</div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════
          MUSEUM DATA ENTRY & EDIT MODAL (सङ्ग्रहालय सामग्री प्रविष्टि फाराम)
          ═════════════════════════════════════════════════════════════════ */}
      {showEntryModal && (
        <div
          className="modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowEntryModal(false);
          }}
        >
          <div className="modal-panel" style={{ maxWidth: '840px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
            {/* Modal Header */}
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#fef3c7',
              }}
            >
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#92400e', textTransform: 'uppercase' }}>
                  सङ्ग्रहालय व्यवस्थापन प्रणाली (Museum Asset Registry)
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#78350f', margin: '2px 0 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Landmark size={20} color="#b45309" />
                  <span>{isEditing ? `सामग्री सम्पादन (${formData.assetId || formData.nameNp})` : 'नयाँ सङ्ग्रहालय सामग्री दर्ता फाराम'}</span>
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowEntryModal(false)}
                style={{ background: 'none', border: 'none', color: '#78350f', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmitForm} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* ── SECTION 1: BASIC IDENTIFICATION ── */}
              <div style={{ padding: '1.1rem 1.25rem', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#92400e', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Info size={17} />
                  <span>खण्ड १: आधारभूत विवरण तथा पहिचान</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '0.85rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                      सामग्रीको नाम (नेपाली) *
                    </label>
                    <input
                      className="dt-input"
                      style={{ height: '42px', fontSize: '0.92rem' }}
                      placeholder="उदा. ऐतिहासिक थाङका / प्राचीन अष्टधातु बुद्ध मूर्ति"
                      value={formData.nameNp}
                      onChange={(e) => setFormData({ ...formData, nameNp: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                      नाम (English)
                    </label>
                    <input
                      className="dt-input"
                      style={{ height: '42px', fontSize: '0.92rem' }}
                      placeholder="e.g. Historical Thangka / Ancient Buddha Statue"
                      value={formData.nameEn}
                      onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                      विधा / वर्गीकरण (Category) *
                    </label>
                    <select
                      className="dt-select"
                      style={{ width: '100%', height: '42px', fontSize: '0.92rem' }}
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      required
                    >
                      {CATEGORY_OPTIONS.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                      उप-विधा (Sub-category)
                    </label>
                    <input
                      className="dt-input"
                      style={{ height: '42px', fontSize: '0.92rem' }}
                      placeholder="उदा. धातु मूर्ति, भोजपत्र ग्रन्थ, काष्ठकला, गरगहना..."
                      value={formData.subCategory}
                      onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* ── SECTION 2: HISTORICAL & PHYSICAL DETAILS ── */}
              <div style={{ padding: '1.1rem 1.25rem', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#92400e', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={17} />
                  <span>खण्ड २: ऐतिहासिक तथा पुरातात्विक विवरण</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '0.85rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                      ऐतिहासिक कालखण्ड (Estimated Period / Era)
                    </label>
                    <input
                      className="dt-input"
                      style={{ height: '42px', fontSize: '0.92rem' }}
                      placeholder="उदा. १७ औं शताब्दी, मल्लकाल, लिच्छविकाल..."
                      value={formData.estimatedPeriod}
                      onChange={(e) => setFormData({ ...formData, estimatedPeriod: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                      निर्माण सामग्री (Material)
                    </label>
                    <input
                      className="dt-input"
                      style={{ height: '42px', fontSize: '0.92rem' }}
                      placeholder="उदा. अष्टधातु, सालको काठ, सुती कपडा, काँस, भोजपत्र..."
                      value={formData.material}
                      onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                      उत्पत्ति स्थल / वडा (Origin / Ward)
                    </label>
                    <input
                      className="dt-input"
                      style={{ height: '42px', fontSize: '0.92rem' }}
                      placeholder="उदा. वडा नं. ३, भोताङ गुम्बा / आमा याङ्ग्री"
                      value={formData.origin}
                      onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                      सङ्ग्रहालय स्थान (Showcase / Room)
                    </label>
                    <input
                      className="dt-input"
                      style={{ height: '42px', fontSize: '0.92rem' }}
                      placeholder="उदा. ग्यालरी १ - शोकेस A-1"
                      value={formData.museumLocation}
                      onChange={(e) => setFormData({ ...formData, museumLocation: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* ── SECTION 3: CONDITION & VERIFICATION STATUS ── */}
              <div style={{ padding: '1.1rem 1.25rem', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#92400e', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={17} />
                  <span>खण्ड ३: संरक्षण अवस्था तथा प्रदर्शन स्थिति</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                      संरक्षण अवस्था (Condition) *
                    </label>
                    <select
                      className="dt-select"
                      style={{ width: '100%', height: '42px', fontSize: '0.92rem' }}
                      value={formData.condition}
                      onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                    >
                      {CONDITION_OPTIONS.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                      प्रदर्शन स्थिति (Verification Status) *
                    </label>
                    <select
                      className="dt-select"
                      style={{ width: '100%', height: '42px', fontSize: '0.92rem' }}
                      value={formData.verificationStatus}
                      onChange={(e) => setFormData({ ...formData, verificationStatus: e.target.value })}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* ── SECTION 4: HISTORY & CULTURAL USAGE ── */}
              <div style={{ padding: '1.1rem 1.25rem', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#92400e', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={17} />
                  <span>खण्ड ४: ऐतिहासिक पृष्ठभूमि तथा सांस्कृतिक प्रयोग</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                      ऐतिहासिक पृष्ठभूमि तथा विवरण (Historical Background)
                    </label>
                    <textarea
                      className="dt-input"
                      style={{ fontSize: '0.92rem', padding: '0.6rem 0.75rem' }}
                      rows={3}
                      placeholder="यस सामग्रीको ऐतिहासिक उत्पत्ति, निर्माण सन्दर्भ, र सम्बन्धित ऐतिहासिक घटनाहरू..."
                      value={formData.history}
                      onChange={(e) => setFormData({ ...formData, history: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                      सांस्कृतिक महत्त्व तथा प्रयोग (Cultural Significance & Usage)
                    </label>
                    <textarea
                      className="dt-input"
                      style={{ fontSize: '0.92rem', padding: '0.6rem 0.75rem' }}
                      rows={2}
                      placeholder="यसको परम्परागत वा धार्मिक प्रयोग, चाडपर्वमा भूमिका वा महत्व..."
                      value={formData.usage}
                      onChange={(e) => setFormData({ ...formData, usage: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* ── SECTION 5: MULTIMEDIA & DIGITAL TWIN FILES / UPLOAD ── */}
              <div style={{ padding: '1.25rem', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#92400e', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={18} />
                    <span>खण्ड ५: मल्टिमिडिया तथा डिजिटल ट्वीन (फाइल अपलोड वा लिङ्क)</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
                    📁 कम्प्युटर वा मोबाइलबाट सिधै फाइल छान्नुहोस्
                  </span>
                </div>

                {uploadError && (
                  <div style={{ marginBottom: '1rem', padding: '0.65rem 0.85rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#b91c1c', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertTriangle size={16} />
                    <span>{uploadError}</span>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                  {/* 1. PHOTO UPLOAD */}
                  <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <label style={{ fontSize: '0.84rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>🖼️ तस्बिर (Photo / Image)</span>
                      </label>
                      {formData.photoUrl && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, photoUrl: '' })}
                          style={{ border: 'none', background: 'none', color: '#ef4444', fontSize: '0.72rem', cursor: 'pointer', fontWeight: 600 }}
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
                        padding: '14px 10px',
                        border: '2px dashed #cbd5e1',
                        borderRadius: '8px',
                        backgroundColor: uploadingField === 'photoUrl' ? '#fef3c7' : '#f8fafc',
                        cursor: uploadingField === 'photoUrl' ? 'wait' : 'pointer',
                        transition: 'all 0.2s',
                        textAlign: 'center',
                      }}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingField === 'photoUrl'}
                        style={{ display: 'none' }}
                        onChange={(e) => handleFileUpload(e, 'photoUrl')}
                      />
                      {uploadingField === 'photoUrl' ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#92400e', fontSize: '0.82rem', fontWeight: 600 }}>
                          <Loader2 size={18} className="dt-spin" />
                          <span>अपलोड हुँदैछ...</span>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                          <UploadCloud size={22} color="#0284c7" />
                          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0369a1' }}>
                            तस्बिर फाइल छान्नुहोस् (Upload Image)
                          </span>
                          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>JPG, PNG, WEBP (अधिकतम 50MB)</span>
                        </div>
                      )}
                    </label>

                    {formData.photoUrl ? (
                      <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#f0fdf4', padding: '6px 10px', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
                        <img
                          src={formData.photoUrl}
                          alt="Uploaded"
                          style={{ width: '46px', height: '46px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                        />
                        <div style={{ overflow: 'hidden', flex: 1 }}>
                          <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#166534', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle2 size={13} /> तस्बिर अपलोड भयो
                          </div>
                          <div style={{ fontSize: '0.68rem', color: '#4b5563', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {formData.photoUrl}
                          </div>
                        </div>
                      </div>
                    ) : null}

                    <div style={{ marginTop: '6px' }}>
                      <input
                        className="dt-input"
                        style={{ height: '32px', fontSize: '0.78rem', backgroundColor: '#ffffff' }}
                        placeholder="वा बाह्य तस्बिर URL लिङ्क राख्नुहोस्..."
                        value={formData.photoUrl}
                        onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* 2. AUDIO UPLOAD */}
                  <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <label style={{ fontSize: '0.84rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>🎧 अडियो गाइड (Audio Guide Tour)</span>
                      </label>
                      {formData.audioUrl && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, audioUrl: '' })}
                          style={{ border: 'none', background: 'none', color: '#ef4444', fontSize: '0.72rem', cursor: 'pointer', fontWeight: 600 }}
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
                        padding: '14px 10px',
                        border: '2px dashed #cbd5e1',
                        borderRadius: '8px',
                        backgroundColor: uploadingField === 'audioUrl' ? '#fef3c7' : '#f8fafc',
                        cursor: uploadingField === 'audioUrl' ? 'wait' : 'pointer',
                        transition: 'all 0.2s',
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#92400e', fontSize: '0.82rem', fontWeight: 600 }}>
                          <Loader2 size={18} className="dt-spin" />
                          <span>अडियो अपलोड हुँदैछ...</span>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                          <Headphones size={22} color="#7c3aed" />
                          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#6d28d9' }}>
                            अडियो फाइल छान्नुहोस् (Upload Audio)
                          </span>
                          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>MP3, WAV, M4A, OGG (अधिकतम 50MB)</span>
                        </div>
                      )}
                    </label>

                    {formData.audioUrl ? (
                      <div style={{ marginTop: '8px', backgroundColor: '#f5f3ff', padding: '6px 8px', borderRadius: '6px', border: '1px solid #ddd6fe' }}>
                        <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#5b21b6', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                          <CheckCircle2 size={13} /> अडियो फाइल तयार छ
                        </div>
                        <audio controls style={{ width: '100%', height: '30px' }} src={formData.audioUrl}>
                          तपाईँको ब्राउजरले अडियो सपोर्ट गर्दैन।
                        </audio>
                      </div>
                    ) : null}

                    <div style={{ marginTop: '6px' }}>
                      <input
                        className="dt-input"
                        style={{ height: '32px', fontSize: '0.78rem', backgroundColor: '#ffffff' }}
                        placeholder="वा बाह्य अडियो URL लिङ्क राख्नुहोस्..."
                        value={formData.audioUrl}
                        onChange={(e) => setFormData({ ...formData, audioUrl: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* 3. VIDEO UPLOAD */}
                  <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <label style={{ fontSize: '0.84rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>🎬 भिडियो डकुमेन्ट्री (Video / Clip)</span>
                      </label>
                      {formData.videoUrl && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, videoUrl: '' })}
                          style={{ border: 'none', background: 'none', color: '#ef4444', fontSize: '0.72rem', cursor: 'pointer', fontWeight: 600 }}
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
                        padding: '14px 10px',
                        border: '2px dashed #cbd5e1',
                        borderRadius: '8px',
                        backgroundColor: uploadingField === 'videoUrl' ? '#fef3c7' : '#f8fafc',
                        cursor: uploadingField === 'videoUrl' ? 'wait' : 'pointer',
                        transition: 'all 0.2s',
                        textAlign: 'center',
                      }}
                    >
                      <input
                        type="file"
                        accept="video/*"
                        disabled={uploadingField === 'videoUrl'}
                        style={{ display: 'none' }}
                        onChange={(e) => handleFileUpload(e, 'videoUrl')}
                      />
                      {uploadingField === 'videoUrl' ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#92400e', fontSize: '0.82rem', fontWeight: 600 }}>
                          <Loader2 size={18} className="dt-spin" />
                          <span>भिडियो अपलोड हुँदैछ...</span>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                          <Video size={22} color="#dc2626" />
                          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#b91c1c' }}>
                            भिडियो फाइल छान्नुहोस् (Upload Video)
                          </span>
                          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>MP4, WEBM (अधिकतम 50MB)</span>
                        </div>
                      )}
                    </label>

                    {formData.videoUrl ? (
                      <div style={{ marginTop: '8px', backgroundColor: '#fef2f2', padding: '6px 8px', borderRadius: '6px', border: '1px solid #fecaca' }}>
                        <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#991b1b', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                          <CheckCircle2 size={13} /> भिडियो जोडिएको छ
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#4b5563', wordBreak: 'break-all' }}>
                          {formData.videoUrl}
                        </div>
                      </div>
                    ) : null}

                    <div style={{ marginTop: '6px' }}>
                      <input
                        className="dt-input"
                        style={{ height: '32px', fontSize: '0.78rem', backgroundColor: '#ffffff' }}
                        placeholder="वा YouTube वा MP4 लिङ्क राख्नुहोस्..."
                        value={formData.videoUrl}
                        onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* 4. 3D MODEL DIGITAL TWIN UPLOAD */}
                  <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <label style={{ fontSize: '0.84rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>🧊 ३डी डिजिटल ट्वीन (GLTF / 3D Model)</span>
                      </label>
                      {formData.model3dUrl && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, model3dUrl: '' })}
                          style={{ border: 'none', background: 'none', color: '#ef4444', fontSize: '0.72rem', cursor: 'pointer', fontWeight: 600 }}
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
                        padding: '14px 10px',
                        border: '2px dashed #cbd5e1',
                        borderRadius: '8px',
                        backgroundColor: uploadingField === 'model3dUrl' ? '#fef3c7' : '#f8fafc',
                        cursor: uploadingField === 'model3dUrl' ? 'wait' : 'pointer',
                        transition: 'all 0.2s',
                        textAlign: 'center',
                      }}
                    >
                      <input
                        type="file"
                        accept=".glb,.gltf,.obj,.fbx"
                        disabled={uploadingField === 'model3dUrl'}
                        style={{ display: 'none' }}
                        onChange={(e) => handleFileUpload(e, 'model3dUrl')}
                      />
                      {uploadingField === 'model3dUrl' ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#92400e', fontSize: '0.82rem', fontWeight: 600 }}>
                          <Loader2 size={18} className="dt-spin" />
                          <span>३डी मोडल अपलोड हुँदैछ...</span>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                          <Box size={22} color="#059669" />
                          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#047857' }}>
                            ३डी फाइल छान्नुहोस् (Upload 3D Model)
                          </span>
                          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>GLB, GLTF, OBJ (अधिकतम 50MB)</span>
                        </div>
                      )}
                    </label>

                    {formData.model3dUrl ? (
                      <div style={{ marginTop: '8px', backgroundColor: '#ecfdf5', padding: '6px 8px', borderRadius: '6px', border: '1px solid #a7f3d0' }}>
                        <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#065f46', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                          <CheckCircle2 size={13} /> ३डी मोडल फाइल लोड भयो
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#4b5563', wordBreak: 'break-all' }}>
                          {formData.model3dUrl}
                        </div>
                      </div>
                    ) : null}

                    <div style={{ marginTop: '6px' }}>
                      <input
                        className="dt-input"
                        style={{ height: '32px', fontSize: '0.78rem', backgroundColor: '#ffffff' }}
                        placeholder="वा GLTF / GLB ३डी वेब लिङ्क..."
                        value={formData.model3dUrl}
                        onChange={(e) => setFormData({ ...formData, model3dUrl: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '0.5rem', borderTop: '1px solid #e2e8f0' }}>
                <button
                  type="button"
                  onClick={() => setShowEntryModal(false)}
                  style={{
                    padding: '9px 18px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#f8fafc',
                    color: '#475569',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  रद्द गर्नुहोस्
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  style={{
                    padding: '9px 24px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#92400e',
                    color: '#ffffff',
                    fontSize: '0.88rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 10px rgba(146, 64, 14, 0.3)',
                  }}
                >
                  <CheckCircle2 size={16} />
                  <span>
                    {createMutation.isPending || updateMutation.isPending
                      ? 'सुरक्षित हुँदैछ...'
                      : isEditing
                      ? 'अद्यावधिक सुरक्षित गर्नुहोस्'
                      : 'सामग्री दर्ता गर्नुहोस्'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════
          DETAIL MODAL (विस्तृत सामग्री अवलोकन)
          ═════════════════════════════════════════════════════════════════ */}
      {selectedItem && (
        <div
          className="modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedItem(null);
          }}
        >
          <div
            className="modal-panel"
            style={{
              maxWidth: '720px',
              width: '95%',
              maxHeight: '92vh',
              overflowY: 'auto',
              padding: 0,
              borderRadius: '20px',
            }}
          >
            {/* Header Photo */}
            <div style={{ position: 'relative', height: '260px', backgroundColor: '#0f172a' }}>
              {selectedItem.photoUrl ? (
                <img
                  src={selectedItem.photoUrl}
                  alt={selectedItem.nameNp}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                  <Landmark size={64} />
                </div>
              )}
              <button
                onClick={() => setSelectedItem(null)}
                style={{
                  position: 'absolute',
                  top: '14px',
                  right: '14px',
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  border: 'none',
                  color: '#ffffff',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X size={18} />
              </button>
              <div style={{ position: 'absolute', bottom: '14px', left: '16px' }}>
                <span style={{ backgroundColor: '#f59e0b', color: '#451a03', padding: '4px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 800, fontFamily: 'monospace' }}>
                  {selectedItem.assetId}
                </span>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#b45309' }}>{selectedItem.category}</span>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0f172a', margin: '2px 0 4px' }}>
                  {selectedItem.nameNp}
                </h3>
                {selectedItem.nameEn && <small style={{ color: '#64748b', fontSize: '0.85rem' }}>{selectedItem.nameEn}</small>}
              </div>

              {/* Audio Tour Player */}
              {selectedItem.audioUrl && (
                <div style={{ backgroundColor: '#eff6ff', padding: '12px 16px', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1d4ed8', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <Headphones size={16} />
                    <span>अडियो गाइड सुन्नुहोस् (Audio Tour Guide):</span>
                  </div>
                  <audio controls style={{ width: '100%', height: '36px' }} src={selectedItem.audioUrl} />
                </div>
              )}

              {/* Metadata Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.84rem' }}>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.74rem' }}>ऐतिहासिक कालखण्ड</span>
                  <strong style={{ color: '#0f172a' }}>{selectedItem.estimatedPeriod}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.74rem' }}>निर्माण सामग्री</span>
                  <strong style={{ color: '#0f172a' }}>{selectedItem.material}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.74rem' }}>उत्पत्ति स्थल</span>
                  <strong style={{ color: '#0f172a' }}>{selectedItem.origin}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.74rem' }}>सङ्ग्रह स्थान</span>
                  <strong style={{ color: '#0f172a' }}>{selectedItem.museumLocation}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.74rem' }}>संरक्षण अवस्था</span>
                  <span style={{ color: '#059669', fontWeight: 700 }}>● {selectedItem.condition}</span>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.74rem' }}>स्थिति</span>
                  <span style={{ color: '#2563eb', fontWeight: 700 }}>● {selectedItem.verificationStatus}</span>
                </div>
              </div>

              {/* Historical Background */}
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>ऐतिहासिक पृष्ठभूमि तथा विवरण</h4>
                <p style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.5, margin: 0 }}>
                  {selectedItem.history || 'यस ऐतिहासिक सामग्रीको पृष्ठभूमि अभिलेखीकरणको प्रक्रियामा छ।'}
                </p>
              </div>

              {/* Cultural Significance */}
              {selectedItem.usage && (
                <div style={{ backgroundColor: '#fffbeb', padding: '12px 16px', borderRadius: '10px', border: '1px solid #fde68a' }}>
                  <h5 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#92400e', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sparkles size={15} color="#b45309" />
                    <span>सांस्कृतिक महत्त्व तथा प्रयोग:</span>
                  </h5>
                  <p style={{ fontSize: '0.82rem', color: '#78350f', margin: 0, lineHeight: 1.45 }}>
                    {selectedItem.usage}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => {
                    const item = selectedItem;
                    setSelectedItem(null);
                    handleOpenEditModal(item);
                  }}
                  style={{
                    padding: '7px 14px',
                    borderRadius: '8px',
                    border: '1px solid #bfdbfe',
                    backgroundColor: '#eff6ff',
                    color: '#1d4ed8',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Edit2 size={14} />
                  <span>सम्पादन</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const item = selectedItem;
                    handleOpenPrintModal(item);
                  }}
                  style={{
                    padding: '7px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#475569',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Printer size={14} />
                  <span>शोकेस ट्याग प्रिन्ट</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                style={{
                  padding: '8px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                बन्द गर्नुहोस्
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════
          SHOWCASE EXHIBIT TAG PRINT MODAL (आधिकारिक शोकेस ट्याग / QR)
          ═════════════════════════════════════════════════════════════════ */}
      {showPrintModal && printItem && (
        <div
          className="modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowPrintModal(false);
          }}
        >
          <div className="modal-panel" style={{ maxWidth: '520px', width: '95%', padding: '1.5rem', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <QrCode size={18} color="#92400e" />
                <span>सङ्ग्रहालय शोकेस ट्याग (Exhibit Label)</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Printable Exhibit Card */}
            <div
              id="museumPrintTagArea"
              style={{
                border: '2px solid #78350f',
                borderRadius: '12px',
                padding: '1.25rem',
                backgroundColor: '#ffffff',
                color: '#0f172a',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              }}
            >
              <div style={{ textAlign: 'center', borderBottom: '1px dashed #cbd5e1', paddingBottom: '0.75rem', marginBottom: '0.85rem' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#78350f', textTransform: 'uppercase' }}>
                  पाँचपोखरी थाङपाल गाउँपालिका
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: 900, color: '#92400e' }}>
                  सांस्कृतिक तथा ऐतिहासिक सङ्ग्रहालय
                </div>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Panchpokhari Thangpal Heritage Museum</div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#1d4ed8', fontFamily: 'monospace' }}>
                    {printItem.assetId}
                  </div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f172a', margin: '2px 0' }}>
                    {printItem.nameNp}
                  </div>
                  {printItem.nameEn && (
                    <div style={{ fontSize: '0.76rem', color: '#64748b', fontStyle: 'italic', marginBottom: '6px' }}>
                      {printItem.nameEn}
                    </div>
                  )}

                  <div style={{ fontSize: '0.75rem', color: '#334155', lineHeight: 1.4 }}>
                    <div><strong>कालखण्ड:</strong> {printItem.estimatedPeriod}</div>
                    <div><strong>निर्माण सामग्री:</strong> {printItem.material}</div>
                    <div><strong>उत्पत्ति:</strong> {printItem.origin}</div>
                    <div><strong>स्थान:</strong> {printItem.museumLocation}</div>
                  </div>
                </div>

                {/* Simulated QR Code */}
                <div style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      width: '90px',
                      height: '90px',
                      backgroundColor: '#f8fafc',
                      border: '2px solid #0f172a',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '4px',
                    }}
                  >
                    <QrCode size={78} color="#0f172a" />
                  </div>
                  <small style={{ fontSize: '0.62rem', color: '#64748b', display: 'block', marginTop: '4px' }}>
                    स्क्यान गरी सुन्नुहोस्
                  </small>
                </div>
              </div>

              <div style={{ borderTop: '1px dashed #cbd5e1', marginTop: '0.85rem', paddingTop: '0.5rem', textAlign: 'center', fontSize: '0.68rem', color: '#94a3b8' }}>
                Municipal Digital Twin Platform • संवत् २०८१
              </div>
            </div>

            {/* Print Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '1.25rem' }}>
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                style={{
                  padding: '7px 16px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#475569',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                }}
              >
                बन्द
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                style={{
                  padding: '7px 18px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#92400e',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Printer size={15} />
                <span>ट्याग प्रिन्ट गर्नुहोस्</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MuseumPage;
